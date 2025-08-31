
import uuid
from datetime import datetime

from pydantic import BaseModel


class SubscriptionBase(BaseModel):
    brand: str | None = None
    release_id: uuid.UUID | None = None

class SubscriptionCreate(SubscriptionBase):
    pass

class Subscription(SubscriptionBase):
    subscription_id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime

    class Config:
        orm_mode = True
