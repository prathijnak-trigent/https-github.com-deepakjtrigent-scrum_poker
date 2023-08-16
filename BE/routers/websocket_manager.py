from fastapi import APIRouter, WebSocket

router = APIRouter()

room_websockets = {}


@router.websocket("/room/{room_id}")
async def websocket_endpoint(room_id: str, websocket: WebSocket):
    await websocket.accept()
    if room_id not in room_websockets:
        room_websockets[room_id] = []
    room_websockets[room_id].append({"websocket": websocket, "user_id": None})
    try:
        while True:
            data = await websocket.receive_text()
            for web in room_websockets.get(room_id, []):
                if web["websocket"] != websocket:
                    await web['websocket'].send_text(data)
    except Exception as e:
        return e
