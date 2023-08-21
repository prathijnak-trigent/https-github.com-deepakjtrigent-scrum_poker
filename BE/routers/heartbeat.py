import json
from aiohttp import request
from fastapi import Header,APIRouter,HTTPException,Request,WebSocket
from routers.rooms import User_details, load_data,save_or_update_data
import asyncio
from routers.websocket_manager import room_websockets
from pydantic import BaseModel
from routers.rooms import User
from threading import Timer
import time

router = APIRouter() 

user_last_hit = {}
heartbeats_received = False

class userAction(BaseModel):
    actionType:str
    userData:dict | list
   
 

@router.post("/room/{room_id}/heartbeat")
async def startHeartBeat(room_id: str,userAction:userAction):
     if(userAction.actionType=="SENT_HEARTBEAT"):
          asyncio.sleep(3)
          await heartbeat(room_id,request,userAction.userData["userId"])
          return "Thank you"
     else:
        asyncio.sleep(10)
        await update_timers(userAction,None,room_id)
        userAction.actionType="USER_INACTIVE"
        return userAction

async def heartbeat(room_id: str, request: Request,userId:str):
        rooms_data=load_data('rooms_data.json')
        if room_id in rooms_data:
            if any(user == userId for user in rooms_data[room_id]["users"]):
                current_time = int(time.time())
                user_last_hit[userId] = current_time
            

async def update_timers(userAction:userAction, websocket:None,room_id:str):
     for last_hit in user_last_hit.values():
        current_time = int(time.time())
        elapsed_time = current_time - last_hit
        if elapsed_time > 11:
            message = ({"actionType": "USER_INACTIVE", "userId": userAction.userData["userId"]})
            for web in room_websockets.get(room_id, []):
                    if web["websocket"] != websocket:
                          await web['websocket'].send_text(json.dumps(message))
        return "You are inactive"


