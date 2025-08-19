
import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Integer, DECIMAL
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    username = Column(String, unique=True, nullable=False)
    display_name = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_anonymous = Column(Boolean, default=False)
    reputation_score = Column(Integer, default=0)
    laces_balance = Column(DECIMAL(18, 8), default=0.0)
    tier = Column(String(20), default='free')
    last_active_at = Column(DateTime(timezone=True), server_default=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

