import json
from aiohttp import request
from fastapi import APIRouter, HTTPException, Request, WebSocket
from routers.rooms import load_data, save_or_update_data
import asyncio
from routers.websocket_manager import room_websockets
from pydantic import BaseModel
import time
from routers.models import User_action

router = APIRouter()

user_last_hit = {}


@router.post("/room/{room_id}/heartbeat")
async def startHeartBeat(room_id: str, userAction: User_action):
    if (userAction.actionType == "SENT_HEARTBEAT"):
       heartbeat_Received=await heartbeat(room_id, userAction)
       return heartbeat_Received
    else:
        not_Receive = await update_timers(userAction, None, room_id)
        return not_Receive


async def heartbeat(room_id: str,userAction:User_action ):
    userId: str=list(userAction.userData.keys())[0]
    rooms_data = load_data('rooms_data.json')
    if room_id in rooms_data:
        if (user == userId for user in rooms_data[room_id]["users"]):
            current_time = int(time.time())
            user_last_hit[userId] = current_time
            userAction.actionType = "RECEIVED_HEARTBEAT"
            return userAction


async def update_timers(userAction: User_action, websocket: None, room_id: str):
    for last_hit in user_last_hit.values():
        current_time = int(time.time())
        elapsed_time = current_time - last_hit
        if elapsed_time > 60:
            message = ({"actionType": "USER_INACTIVE", "userId": list(
                userAction.userData.keys())[0]})
            for web in room_websockets.get(room_id, []):
                if web["websocket"] != websocket:
                    await web['websocket'].send_text(json.dumps(message))
            userAction.actionType = "USER_INACTIVE"
            return userAction
        return userAction
