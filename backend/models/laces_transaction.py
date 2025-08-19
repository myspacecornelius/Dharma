import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, DECIMAL
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from .user import Base

class LacesTransaction(Base):
    __tablename__ = "laces_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    transaction_type = Column(String(50), nullable=False)
    amount = Column(DECIMAL(18, 8), nullable=False)
    description = Column(String)
    transaction_metadata = Column(JSONB)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
