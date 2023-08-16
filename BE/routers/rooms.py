import asyncio
from fastapi import APIRouter, HTTPException, Header, Request
from fastapi.responses import JSONResponse
from typing import Annotated, Dict, List
import uuid
from pydantic import BaseModel
from routers.data_manager import load_data, save_data, discard_room_id
from routers.websocket_manager import room_websockets

router = APIRouter()

rooms_data: Dict[str, Dict[str, List[Dict[str, str]]]] = load_data("rooms_data.json")
admin_user_id : str = ""

class User(BaseModel):
    userId: str
    displayName: str

class User_details(BaseModel):
    user: User
    isAdmin: bool
    isActive: bool


@router.post("/create_room", response_model=Dict[str, str])
async def create_room(request : Request):
    room_id = str(uuid.uuid4())
    room_key = room_id
    rooms_data[room_key] = {"users": []}
    global admin_user_id
    admin_user_id = request.headers.get('SP-U')
    save_data("rooms_data.json", rooms_data)
    return {"room_id": room_id}


@router.post("/room/{room_id}/join", response_model=User_details)
async def join_room(room_id: str, user_details : User):
    if room_id in rooms_data:
        global admin_user_id    
        rooms_data[room_id]['users'].append({"user":{"userId": user_details.userId, "displayName": user_details.displayName}, "isAdmin": True if (user_details.userId == admin_user_id ) else False, "isActive" : True })  
        save_data("rooms_data.json", rooms_data)  
        return rooms_data[room_id]['users'][-1]
    else:
            return JSONResponse(status_code=404, content={"error": "Room not found"})


@router.put("/room/{room_id}/update")
async def update_room_data(room_id: str, data: dict):
    if room_id in rooms_data and room_id in room_websockets:
            for websocket in room_websockets[room_id]: 
                await websocket.send_json(data)
            return {"response": data}
    else:
        raise HTTPException(status_code=404, detail="Room not found")
