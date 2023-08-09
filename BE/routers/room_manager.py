import json
from routers.data_manager import save_data
#from routers.rooms import ACTIVE_ROOMS_FILE

ACTIVE_ROOMS_FILE = "active_room.json"
def load_active_rooms():
    try:
        with open(ACTIVE_ROOMS_FILE, "r") as file:
            return json.load(file)
    except FileNotFoundError:
        return []   
    
def save_active_rooms(active_rooms_list):
    with open(ACTIVE_ROOMS_FILE, "w") as file:
        json.dump(active_rooms_list, file)

def discard_room_id(room_id):
    global room_timers, rooms_data, active_rooms

    if room_id in room_timers:
        room_timers[room_id].cancel()
        del room_timers[room_id]

    if room_id in rooms_data:
        del rooms_data[room_id]
        save_data("rooms_data.json", rooms_data)
    
    if room_id in active_rooms:
        active_rooms.remove(room_id)
        save_active_rooms(active_rooms)