from fastapi import APIRouter, WebSocket, Request
import json

from pydantic import BaseModel

from routers.data_manager import load_data, delete_data

router = APIRouter()

room_websockets = {}


async def send_message(room_id: str, websocket, room_data_users, user_id, actionType: str):
    for web in room_websockets.get(room_id, []):
        if actionType == "NEW_USER_JOINED":
            if web["websocket"] == websocket:
                await web['websocket'].send_text(json.dumps({"actionType": "ACTIVE_USERS_LIST", "userData": room_data_users}))
            else:
                await web['websocket'].send_text(json.dumps({"actionType": actionType, "userData": {user_id: room_data_users[user_id]}}))
        elif actionType == "USER_LEFT" and web['websocket'] != websocket:
            await web['websocket'].send_text(json.dumps({"actionType": actionType, "userData": {user_id: room_data_users[user_id]}} ))


def delete_user(websocket, room_id, user_id):
    websocket_key = next((index for (index, websocket_dict) in enumerate(
        room_websockets[room_id]) if websocket_dict['websocket'] == websocket), None)
    del room_websockets[room_id][websocket_key]
    if len(room_websockets[room_id]) == 0:
        del room_websockets[room_id]
    delete_data('rooms_data.json', room_id, user_id)


@router.websocket("/room/{room_id}")
async def websocket_endpoint(room_id: str, websocket: WebSocket):
    rooms_data = load_data("rooms_data.json")
    await websocket.accept()
    if room_id in rooms_data:
        room_data_users = rooms_data[room_id]['users']
        user_id = list(room_data_users.keys())[-1]
    if room_id not in room_websockets:
        room_websockets[room_id] = []
    room_websockets[room_id].append(
        {"websocket": websocket, "user_id": user_id})
    await send_message(room_id, websocket, room_data_users, user_id, "NEW_USER_JOINED")
    try:
        while True:
            await websocket.receive_text()
    except Exception as e:
        await send_message(room_id, websocket, room_data_users, user_id, "USER_LEFT")
        delete_user(websocket, room_id, user_id)
        return e
