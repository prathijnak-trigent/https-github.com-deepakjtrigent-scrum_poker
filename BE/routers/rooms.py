from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from typing import Dict, List
import uuid
from pydantic import BaseModel
from routers.data_manager import load_data, save_data

router = APIRouter()

rooms_data: Dict[str, Dict[str, List[Dict[str, str]]]] = load_data("rooms_data.json")

class joinRoomParams(BaseModel):
    user_id: str
    user_name: str

@router.post("/create_room", response_model=Dict[str, str])
async def create_room():
        room_id = str(uuid.uuid4())
        room_key = room_id
        rooms_data[room_key] = {"users": []}
        save_data("rooms_data.json", rooms_data)  # Save the updated data
        return {"room_id": room_id}

@router.post("/join_room/{room_id}", response_model=Dict[str, str])
async def join_room(room_id: str, user_details: joinRoomParams, request: Request):
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

