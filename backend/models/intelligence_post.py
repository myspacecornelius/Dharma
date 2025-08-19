import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, DECIMAL
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from .user import Base

class IntelligencePost(Base):
    __tablename__ = "intelligence_posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    post_type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(String)
    location_data = Column(JSONB)
    verification_count = Column(Integer, default=0)
    laces_earned = Column(DECIMAL(18, 8), default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
