from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from typing import Dict, List
import uuid
from data_manager import load_data, save_data
from pydantic import BaseModel

app = FastAPI()

# Load data from the file on startup
rooms_data: Dict[str, Dict[str, List[Dict[str, str]]]] = load_data("rooms_data.json")

class RoomWebSocketManager:
    pass

class UserWebSocketDetails(BaseModel):
    room_id: str
    user_id: str
    user_name: str


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