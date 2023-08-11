import asyncio
from fastapi import APIRouter, HTTPException, Header, Request
from fastapi.responses import JSONResponse
from typing import Dict, List
import uuid
from pydantic import BaseModel
from routers.data_manager import load_data, save_data, discard_room_id
from routers.websocket_manager import room_websockets

router = APIRouter()

rooms_data: Dict[str, Dict[str, List[Dict[str, str]]]] = load_data("rooms_data.json")
room_timers: Dict[str, asyncio.TimerHandle] = {}

class joinRoomParams(BaseModel):
    user_id: str
    user_name: str

@router.post("/create_room", response_model=Dict[str, str])
async def create_room():
    room_id = str(uuid.uuid4())
    room_key = room_id
    rooms_data[room_key] = {"users": []}
    save_data("rooms_data.json", rooms_data)
    return {"room_id": room_id}

@router.post("/room/{room_id}", response_model=Dict[str, str])
async def room_action(room_id: str, user_details: joinRoomParams, request: Request):
    if room_id not in rooms_data:
        return JSONResponse(status_code=404, content={"error": "Room not found"})
    
    if user_details.user_id in [user["userId"] for user in rooms_data[room_id]["users"]]:
        rooms_data[room_id]["users"] = [user for user in rooms_data[room_id]["users"] if user["userId"] != user_details.user_id]
    else:
        rooms_data[room_id]["users"].append({"userId": user_details.user_id, "userName": user_details.user_name})
        
    save_data("rooms_data.json", rooms_data)
 
    if not rooms_data[room_id]["users"]:
        async def discard_room():
            await asyncio.sleep(60)
            if not rooms_data.get(room_id, {}).get("users"):
                discard_room_id(room_id)
        
        if room_id in room_timers:
            room_timers[room_id].cancel()
        
        room_timers[room_id] = asyncio.create_task(discard_room())
        return JSONResponse(status_code=200, content={"message": f"User {user_details.user_id} left room {room_id}"})
    
    current_url = str(request.base_url)
    complete_url = f"{current_url}/join_room/{room_id}"
    
    return {
        "message": f"User {user_details.user_id} joined room {room_id}",
        "complete_url": complete_url
    }

async def remove_inactive_rooms_periodically():
    while True:
        await asyncio.sleep(60)  # Wait for 60 seconds

        # Iterate through rooms_data and remove inactive rooms
        rooms_to_remove = []
        for room_id, room_data in rooms_data.items():
            if not room_data.get("users"):
                rooms_to_remove.append(room_id)

        for room_id in rooms_to_remove:
            discard_room_id(room_id)

        # Save updated rooms_data
        save_data("rooms_data.json", rooms_data)

# Start the background task
asyncio.create_task(remove_inactive_rooms_periodically())

@router.get("/active_rooms", response_model=List[str])
async def get_active_rooms():
    active_rooms = [room_id for room_id in rooms_data if rooms_data[room_id]["users"]]
    return active_rooms

@router.put("/room/{room_id}/update")
async def update_room_data(room_id: str, data: dict):
    if room_id in rooms_data and room_id in room_websockets:
            for websocket in room_websockets[room_id]: 
                await websocket.send_json(data)
            return {"response": data}
    else:
        raise HTTPException(status_code=404, detail="Room not found")