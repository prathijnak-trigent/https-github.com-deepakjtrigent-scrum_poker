from fastapi import APIRouter, WebSocket

router = APIRouter()

websocket_list = []

@router.websocket("/room/{room_Id}")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    if websocket not in websocket_list:
        websocket_list.append(websocket)
    while True:
        data = await websocket.receive_text()
        for web in websocket_list:
            if web != websocket:
                await web.send_text(f"{data}")
