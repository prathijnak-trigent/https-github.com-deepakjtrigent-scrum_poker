import json
import asyncio
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from typing import Dict, List
import uuid
from data_manager import load_data, save_data
from pydantic import BaseModel

app = FastAPI()

# Load data from the file on startup
rooms_data: Dict[str, Dict[str, List[Dict[str, str]]]] = load_data("rooms_data.json")
ACTIVE_ROOMS_FILE = "active_rooms.json"
  
class RoomWebSocketManager:
    pass

class UserWebSocketDetails(BaseModel):
    room_id: str
    user_id: str
    user_name: str


def load_active_rooms():
    try:
        with open(ACTIVE_ROOMS_FILE, "r") as file:
            return json.load(file)
    except FileNotFoundError:
        return []   

def save_active_rooms(active_rooms_list):
    with open(ACTIVE_ROOMS_FILE, "w") as file:
        json.dump(active_rooms_list, file)


@app.post("/create_room/{room_id}", response_model=Dict[str, str])
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

        active_rooms = load_active_rooms()

        if room_id not in active_rooms:
            active_rooms.append(room_id)
            save_active_rooms(active_rooms)
        current_url = str(request.base_url)
        complete_url = f"{current_url}/join_room/{room_id}"
        return {
            "message": f"User {user_details.user_id} joined room {room_id}",
            "complete_url": complete_url
        }
    else:
        return JSONResponse(status_code=404, content={"error": "Room not found"})


def update_active_rooms():
    active_rooms = load_active_rooms()
    active_rooms = [room_id for room_id in active_rooms if rooms_data.get(room_id, {}).get("users")]
    save_active_rooms(active_rooms)

async def remove_inactive_rooms_periodically():
    while True:
        await asyncio.sleep(60)  # Wait for 60 seconds
        update_active_rooms()

asyncio.create_task(remove_inactive_rooms_periodically())
    
    
@app.get("/active_rooms", response_model=List[str])
async def get_active_rooms():
    update_active_rooms()
    return load_active_rooms()



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)