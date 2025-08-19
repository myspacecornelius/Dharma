
import uuid
from sqlalchemy import Column, String, Enum, ForeignKey, DateTime, Float
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func
from .user import Base

class Post(Base):
    __tablename__ = "posts"

    post_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    content_type = Column(Enum('text', 'image', 'video', name='content_type_enum'), nullable=False)
    content_text = Column(String, nullable=True)
    media_url = Column(String, nullable=True)
    tags = Column(ARRAY(String), nullable=True)
    geo_tag_lat = Column(Float, nullable=True)
    geo_tag_long = Column(Float, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    visibility = Column(Enum('public', 'local', 'friends', name='visibility_enum'), nullable=False, default='public')
    deleted_at = Column(DateTime(timezone=True), nullable=True)

