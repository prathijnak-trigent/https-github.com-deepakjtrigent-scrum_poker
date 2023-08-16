from fastapi import APIRouter, WebSocket
from typing import Dict, List
import json

from routers.data_manager import load_data

router = APIRouter()

rooms_data = load_data("rooms_data.json")

room_websockets = {}


@router.websocket("/room/{room_id}")
async def websocket_endpoint(room_id: str, websocket: WebSocket):
    await websocket.accept()
    room_data = rooms_data[room_id]['users']
    if room_id not in room_websockets:
        room_websockets[room_id] = []
    room_websockets[room_id].append({"websocket": websocket, "user_id": room_data[-1]['user']['userId']})
    print(room_data[-1]['user']['userId'])
    try:
        while True:
            await websocket.receive_text()
            for web in room_websockets.get(room_id, []):
                if web["websocket"] == websocket:
                    await web['websocket'].send_text(json.dumps(room_data))
                else:
                    await web['websocket'].send_text(json.dumps(room_data[-1]['user']))
    except Exception as e:
        return e
