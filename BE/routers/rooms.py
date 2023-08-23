import asyncio
import json
from fastapi import APIRouter, HTTPException, Header, Request
from fastapi.responses import JSONResponse
from typing import Dict
import uuid
from routers.data_manager import save_data_in_db, update_data_in_db
from routers.websocket_manager import room_websockets
from tinydb import TinyDB, Query, where
from routers.models import User, User_data, User_action
from fastapi.encoders import jsonable_encoder

db = TinyDB('rooms_data_db.json')
router = APIRouter()

admin_user_id: str = ""
selected_storypoint: list = []

@router.post("/create_room", response_model=Dict[str, str])
async def create_room(request: Request):
    room_id = str(uuid.uuid4())
    room_data = {"roomId": room_id, "users": []}
    global admin_user_id
    admin_user_id = request.headers.get('SP-U')
    save_data_in_db(room_data)
    return {"room_id": room_id}


@router.post("/room/{room_id}/join")
async def join_room(room_id: str, user_details: User):
    rooms = db.table('rooms')
    Room = Query()
    Users = Query()
    if rooms.contains(Room.roomId == room_id):
        # ulaa = rooms.contains((Room.users.any(Users.userId == user_details.userId) ))
        if not rooms.contains((Room.users.any(Users.userId == user_details.userId)) & (Room.roomId == room_id)):
            global admin_user_id
            user_to_be_stored = {
                "userId": user_details.userId,
                "displayName": user_details.displayName,
                "isAdmin": True if (user_details.userId == admin_user_id) else False,
                "isActive": True
            }
            update_data_in_db(user_to_be_stored, room_id)
            return user_to_be_stored
        else:
            return JSONResponse(status_code=403, content={"error": "User is already in the room"})
    else:
        return JSONResponse(status_code=404, content={"error": "Room not found"})






@router.put("/room/{room_id}/update")
async def update_room_data(room_id: str, user_action: User_action):
    rooms =db.table('rooms')
    selected_storypoint.append(user_action.userData)
  
    
    if rooms.contains(where('roomId')==room_id) and room_id in room_websockets:
        for websocket in room_websockets[room_id]:
            if user_action.userData.userId != websocket['user_id']:
                await websocket['websocket'].send_text(json.dumps(jsonable_encoder(user_action)))
        return JSONResponse(content=jsonable_encoder(selected_storypoint))

    else:
        raise HTTPException(status_code=404, detail="Room not found")

