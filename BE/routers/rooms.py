import asyncio
from fastapi import APIRouter, HTTPException, Header, Request
from fastapi.responses import JSONResponse
from typing import Dict
import uuid
from routers.data_manager import save_or_update_data, load_data
from routers.websocket_manager import room_websockets
import json
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from routers.models import User, User_action, User_details

router = APIRouter()

admin_user_id: str = ""
selected_storypoint:list=[]

@router.post("/create_room", response_model=Dict[str, str])
async def create_room(request: Request):
    room_id = str(uuid.uuid4())
    room_data = {"users": {}}
    global admin_user_id
    admin_user_id = request.headers.get('SP-U')
    save_or_update_data("rooms_data.json", room_data, room_id)
    return {"room_id": room_id}


@router.post("/room/{room_id}/join")
async def join_room(room_id: str, user_details: User):
    rooms_data = load_data("rooms_data.json")
    if room_id in rooms_data:
        if user_details.userId not in rooms_data[room_id]['users']:
            global admin_user_id
            user_to_be_stored = {
                "userId": user_details.userId,
                "displayName": user_details.displayName,
                "isAdmin": True if (user_details.userId == admin_user_id) else False,
                "isActive": True
            }
            save_or_update_data("rooms_data.json", user_to_be_stored, room_id)
            return user_to_be_stored
        else:
            return JSONResponse(status_code=403, content={"error": "User is already in the room"})
    else:
        return JSONResponse(status_code=404, content={"error": "Room not found"})


@router.put("/room/{room_id}/update")
async def update_room_data(room_id: str, data: User_action):
    selected_storypoint.append(data)
    rooms_data = load_data("rooms_data.json")
    print(selected_storypoint)
    if room_id in rooms_data and room_id in room_websockets:
        print("hiii")
        for websocket in room_websockets[room_id]:
            await websocket['websocket'].send_json(jsonable_encoder(data))
        return JSONResponse(content=jsonable_encoder(selected_storypoint))
    
    

    else:
        raise HTTPException(status_code=404, detail="Room not found")
