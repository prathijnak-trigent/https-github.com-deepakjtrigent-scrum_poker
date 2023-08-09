import asyncio
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from typing import Dict, List
import uuid
from pydantic import BaseModel
from routers.data_manager import load_data, save_data
from routers.room_manager import load_active_rooms, save_active_rooms, discard_room_id
router = APIRouter()

rooms_data: Dict[str, Dict[str, List[Dict[str, str]]]] = load_data("rooms_data.json")


active_rooms: List[str] = load_data("active_rooms.json")
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
    if room_id in rooms_data:
        if user_details.user_id in [user["userId"] for user in rooms_data[room_id]["users"]]:
            # User is already in the room, consider this as leaving the room
            rooms_data[room_id]["users"] = [user for user in rooms_data[room_id]["users"] if user["userId"] != user_details.user_id]
            save_data("rooms_data.json", rooms_data)
            
            if not rooms_data[room_id]["users"]:
                # Set a timer to discard the room after 60 seconds if no user joins
                async def discard_room():
                    await asyncio.sleep(60)
                    if not rooms_data.get(room_id, {}).get("users"):
                        discard_room_id(room_id)

                if room_id in room_timers:
                    # Cancel the previous timer if it exists
                    room_timers[room_id].cancel()

                # Start a new timer
                room_timers[room_id] = asyncio.create_task(discard_room())
            
            return JSONResponse(status_code=200, content={"message": f"User {user_details.user_id} left room {room_id}"})
        
        else:
            # User is not in the room, consider this as joining the room
            rooms_data[room_id]["users"].append({"userId": user_details.user_id, "userName": user_details.user_name})
            save_data("rooms_data.json", rooms_data)

            active_rooms = load_active_rooms()

            if room_id not in active_rooms:
                active_rooms.append(room_id)
                save_active_rooms(active_rooms)

            # Set a timer to discard the room after 60 seconds if no user joins
            async def discard_room():
                await asyncio.sleep(60)
                if not rooms_data.get(room_id, {}).get("users"):
                    discard_room_id(room_id)

            if room_id in room_timers:
                # Cancel the previous timer if it exists
                room_timers[room_id].cancel()

            # Start a new timer
            room_timers[room_id] = asyncio.create_task(discard_room())

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

@router.get("/active_rooms", response_model=List[str])
async def get_active_rooms():
    update_active_rooms()
    return load_active_rooms()
