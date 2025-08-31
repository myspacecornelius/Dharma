

from pydantic import UUID4, BaseModel, EmailStr


class UserBase(BaseModel):
    username: str
    email: EmailStr
    display_name: str
    avatar_url: str | None = None
    is_anonymous: bool = False

class UserCreate(UserBase):
    password: str

class User(UserBase):
    user_id: UUID4

    class Config:
        orm_mode = True

