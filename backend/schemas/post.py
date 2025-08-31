
from datetime import datetime
from enum import Enum

from pydantic import UUID4, BaseModel


class ContentType(str, Enum):
    text = "text"
    image = "image"
    video = "video"

class Visibility(str, Enum):
    public = "public"
    local = "local"
    friends = "friends"

class PostBase(BaseModel):
    content_type: ContentType
    content_text: str | None = None
    media_url: str | None = None
    tags: list[str] | None = None
    geo_tag_lat: float | None = None
    geo_tag_long: float | None = None
    visibility: Visibility = Visibility.public

class PostCreate(PostBase):
    user_id: UUID4

class Post(PostBase):
    post_id: UUID4
    user_id: UUID4
    timestamp: datetime

    class Config:
        orm_mode = True

