from fastapi import Header,APIRouter,HTTPException
from routers.rooms import rooms_data
import time
from routers.websocket_manager import room_websockets
import asyncio

router = APIRouter()

user_last_hit = {}

async def update_timers():
    while True:
        for user_id, last_hit in user_last_hit.items():
            current_time = int(time.time())
            elapsed_time = current_time - last_hit
            if elapsed_time > 60:
                message = ({"actionType": "USER_INACTIVE", "userId": user_id})
                for room_id, websockets in room_websockets.items():
                    for web in websockets:
                        if web['user_id'] != user_id:
                            await web['websocket'].send_json(message)
                user_last_hit[user_id] = current_time
        await asyncio.sleep(1)  # Update timers every 1 second

@router.post("/room/{room_id}/heartbeat")
async def heartbeat(room_id: str, userId: str = Header(...)):
    if room_id in rooms_data and any(user["userId"] == userId for user in rooms_data[room_id]["users"]):
        current_time = int(time.time())
        user_last_hit[userId] = current_time
        return {"message": f"Timer reset successfully for {userId}"}
    else:
        raise HTTPException(status_code=404, detail="Room or user not found")

# Create the background task to update timers
background_task = asyncio.create_task(update_timers())

# Add a shutdown event handler to cancel the background task when the app shuts down
@router.on_event("shutdown")
async def shutdown_background_task():
    background_task.cancel()