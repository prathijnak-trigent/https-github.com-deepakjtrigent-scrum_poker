from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import JSONResponse
from typing import Dict, List
import uuid
from data_manager import load_data, save_data
from pydantic import BaseModel

app = FastAPI()

# Load data from the file on startup
rooms_data: Dict[str, Dict[str, List[Dict[str, str]]]] = load_data("rooms_data.json")

class RoomWebSocketManager:
    def __init__(self):
        self.active_connections = {}

    async def connect(self, websocket: WebSocket, room_id: str, user_id: str, user_name: str):
        await websocket.accept()
        room_key = room_id
        if room_key in rooms_data:
            rooms_data[room_key]["users"].append({"userId": user_id, "userName": user_name})
            self.active_connections[websocket] = {"room_id": room_key, "user_id": user_id}
            save_data("rooms_data.json", rooms_data)  # Save the updated data
        else:
            await websocket.close()

    async def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            room_id = self.active_connections[websocket]["room_id"]
            user_id = self.active_connections[websocket]["user_id"]
            room_users = rooms_data.get(room_id, {}).get("users", [])
            rooms_data[room_id]["users"] = [user for user in room_users if user["userId"] != user_id]
            del self.active_connections[websocket]
            save_data("rooms_data.json", rooms_data)  # Save the updated data

    async def send_message(self, websocket: WebSocket, message: dict):
        await websocket.send_json(message)

websocket_manager = RoomWebSocketManager()

class UserWebSocketDetails(BaseModel):
    room_id: str
    user_id: str
    user_name: str

@app.websocket("/ws/")
async def websocket_endpoint(websocket: WebSocket, user_details: UserWebSocketDetails):
    await websocket_manager.connect(websocket, user_details.room_id, user_details.user_id, user_details.user_name)
    try:
        while True:
            data = await websocket.receive_json()
            room_users = rooms_data.get(user_details.room_id, {}).get("users", [])
            for user in room_users:
                if user["userId"] != user_details.user_id:
                    target_websocket = next((ws for ws, info in websocket_manager.active_connections.items() if info["room_id"] == user_details.room_id and info["user_id"] == user["userId"]), None)
                    if target_websocket:
                        await websocket_manager.send_message(target_websocket, data)
    except WebSocketDisconnect:
        await websocket_manager.disconnect(websocket)

@app.post("/create_room", response_model=Dict[str, str])
async def create_room():
    room_id = str(uuid.uuid4())
    room_key = room_id
    rooms_data[room_key] = {"users": []}
    save_data("rooms_data.json", rooms_data)  # Save the updated data
    return {"room_id": room_id}

@app.post("/join_room/{room_id}", response_model=Dict[str, str])
async def join_room(room_id: str, user_details: UserWebSocketDetails, request: Request):
    if room_id in rooms_data:
        rooms_data[room_id]["users"].append({"userId": user_details.user_id, "userName": user_details.user_name})
        save_data("rooms_data.json", rooms_data)  # Save the updated data
        current_url = str(request.base_url)
        complete_url = f"{current_url}/join_room/{room_id}"
        return {
            "message": f"User {user_details.user_id} joined room {room_id}",
            "complete_url": complete_url
        }
    else:
        return JSONResponse(status_code=404, content={"error": "Room not found"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)