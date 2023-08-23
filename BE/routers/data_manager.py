# import json


# def load_data(filename):
#     try:
#         with open(filename, 'r') as file:
#             data = file.read()
#             if data.strip():
#                 return json.loads(data)
#             else:
#                 return {}
#     except FileNotFoundError:
#         return {}
#     except json.JSONDecodeError:
#         return {}


# def save_data(filename, data, room_id):
#     with open(filename, 'w') as file:
#         data = {room_id: data}
#         json.dump(data, file, indent=4)
#         file.write("\n")


# def save_or_update_data(filename, data, room_id):
#     loaded_data = load_data(filename)
#     if loaded_data != {}:
#         with open(filename, 'w') as file:
#             if room_id in loaded_data:
#                 loaded_data[room_id]['users'][data['userId']] = data
#             else:
#                 loaded_data[room_id] = data
#             json.dump(loaded_data, file, indent=4)
#     else:
#         save_data(filename, data, room_id)


# def delete_data(filename, room_id, user_id):
#     rooms_data = load_data(filename)
#     with open(filename, "w") as file:
#         # rooms_data = json.loads(file.read())
#         if room_id in rooms_data and user_id in rooms_data[room_id]['users']:
#             del rooms_data[room_id]['users'][user_id]
#             if len(rooms_data[room_id]['users']) == 0:
#                 del rooms_data[room_id]
#             json.dump(rooms_data, file, indent=4)


# # def discard_room_id(room_id):
# #     global room_timers, rooms_data

# #     if room_id in room_timers:
# #         room_timers[room_id].cancel()
# #         del room_timers[room_id]

# #     if room_id in rooms_data:
# #         del rooms_data[room_id]
# #         save_data("rooms_data.json", rooms_data)


from tinydb import TinyDB, Query, where


db = TinyDB('rooms_data_db.json')


def save_data_in_db(data_to_be_stored):
    rooms = db.table('rooms')
    rooms.insert(data_to_be_stored)


def update_data_in_db(data_to_be_stored, room_id: str):
    rooms = db.table('rooms')
    Room = Query()
    room_list = rooms.search(Room.roomId == room_id)
    room_list[0]['users'].append(data_to_be_stored)
    rooms.upsert(room_list[0],  Room.roomId == room_id)


def delete_data(room_id: str, user_id: str):
    rooms = db.table('rooms')
    Room = Query()
    room_list = rooms.search(Room.roomId == room_id)
    if len(room_list[0]['users']) == 1:
        rooms.remove(where('roomId') == room_id)
    else:
        user_index = next((index for (index, user) in enumerate(
            room_list[0]['users']) if user['userId'] == user_id), None)
        del room_list[0]['users'][user_index]
        rooms.upsert(room_list[0], Room.roomId == room_id)
