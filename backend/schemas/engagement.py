

from pydantic import UUID4, BaseModel


class LikeBase(BaseModel):
    user_id: UUID4
    post_id: UUID4

class LikeCreate(LikeBase):
    pass

class Like(LikeBase):
    like_id: UUID4

    class Config:
        orm_mode = True

class SaveBase(BaseModel):
    user_id: UUID4
    post_id: UUID4
    board_id: UUID4 | None = None

class SaveCreate(SaveBase):
    pass

class Save(SaveBase):
    save_id: UUID4

    class Config:
        orm_mode = True

class RepostBase(BaseModel):
    user_id: UUID4
    post_id: UUID4

class RepostCreate(RepostBase):
    pass

class Repost(RepostBase):
    repost_id: UUID4

    class Config:
        orm_mode = True
