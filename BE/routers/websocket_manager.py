from fastapi import APIRouter, WebSocket

router = APIRouter()
room_websockets = {}

@router.websocket("/room/{room_id}")
async def websocket_endpoint(room_id: str, websocket: WebSocket):
    await websocket.accept()
    if room_id not in room_websockets:
        room_websockets[room_id] = []
    room_websockets[room_id].append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            for web in room_websockets[room_id]:
                if web != websocket:
                    await web.send_text(f"{data}")
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        room_websockets[room_id].remove(websocket)
