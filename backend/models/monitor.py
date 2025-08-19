import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, DECIMAL, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from .user import Base

class Monitor(Base):
    __tablename__ = "monitors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    site_name = Column(String(100), nullable=False)
    product_sku = Column(String(100))
    size_preference = Column(String(20))
    max_price = Column(DECIMAL(10, 2))
    location_filter = Column(JSONB)
    is_active = Column(Boolean, default=True)
    success_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
