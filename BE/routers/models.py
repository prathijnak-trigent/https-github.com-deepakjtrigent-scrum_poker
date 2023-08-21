from typing import Dict
from pydantic import BaseModel

class User(BaseModel):
    userId: str
    displayName: str

class User_data(BaseModel):
    storyPoints: float    


class User_details (User):
    isAdmin: bool | None
    isActive: bool | None
    data: User_data | None


class User_action(BaseModel):
    actionType: str
    userData : Dict[str, User_details]