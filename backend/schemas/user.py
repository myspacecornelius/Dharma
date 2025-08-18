
from pydantic import BaseModel, UUID4
from typing import Optional

class UserBase(BaseModel):
    username: str
    display_name: str
    avatar_url: Optional[str] = None
    is_anonymous: bool = False

class UserCreate(UserBase):
    pass

class User(UserBase):
    user_id: UUID4

    class Config:
        orm_mode = True

