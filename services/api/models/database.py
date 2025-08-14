"""
Database models for the hyperlocal sneaker intelligence platform.
Includes HeatMap, LACES, trades, and social features.
"""

from sqlalchemy import Column, String, Integer, DateTime, Boolean, Float, JSON, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import uuid
import enum

Base = declarative_base()

class VerificationLevel(enum.Enum):
    EMAIL = 0
    PHONE = 1
    ID_VERIFIED = 2
    PREMIUM = 3

class EventType(enum.Enum):
    DROP = "DROP"
    RESTOCK = "RESTOCK"
    FIND = "FIND"
    MEETUP = "MEETUP"

class StoreType(enum.Enum):
    RETAIL = "retail"
    THRIFT = "thrift"
    OUTLET = "outlet"
    SAFEZONE = "safezone"

class LacesReason(enum.Enum):
    SPOT = "SPOT"
    VERIFY = "VERIFY"
    KNOWLEDGE = "KNOWLEDGE"
    TRADE = "TRADE"
    GOOD_VIBES = "GOOD_VIBES"
    DROPZONE = "DROPZONE"

class InventoryStatus(enum.Enum):
    AVAILABLE = "AVAILABLE"
    SOLD = "SOLD"
    HIDDEN = "HIDDEN"

class Condition(enum.Enum):
    DS = "DS"
    VNDS = "VNDS"
    USED = "USED"

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    handle = Column(String(50), unique=True, nullable=False)
    email = Column(String(255), unique=True)
    phone = Column(String(20))
    verification_level = Column(Enum(VerificationLevel), default=VerificationLevel.EMAIL)
    legit_score = Column(Integer, default=0)
    photo_url = Column(Text)
    notif_radius_km = Column(Integer, default=5)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Store(Base):
    __tablename__ = "stores"
    
    id = Column(String(50), primary_key=True)
    name = Column(String(255), nullable=False)
    type = Column(Enum(StoreType), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    address = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Event(Base):
    __tablename__ = "events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(Enum(EventType), nullable=False)
    title = Column(String(255), nullable=False)
    store_id = Column(String(50), ForeignKey("stores.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    payload = Column(JSON)
    verified_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class LacesLedger(Base):
    __tablename__ = "laces_ledger"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    delta = Column(Integer, nullable=False)
    reason = Column(Enum(LacesReason), nullable=False)
    ref_type = Column(String(50))
    ref_id = Column(UUID(as_uuid=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Checkin(Base):
    __tablename__ = "checkins"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    store_id = Column(String(50), ForeignKey("stores.id"), nullable=False)
    method = Column(String(20), default="auto")
    lat = Column(Float)
    lng = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Inventory(Base):
    __tablename__ = "inventory"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    brand = Column(String(100))
    model = Column(String(255))
    size = Column(String(10))
    condition = Column(Enum(Condition), default=Condition.DS)
    photos = Column(JSON)
    ask_price = Column(Integer)
    status = Column(Enum(InventoryStatus), default=InventoryStatus.AVAILABLE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Meetup(Base):
    __tablename__ = "meetups"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    host_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    store_id = Column(String(50), ForeignKey("stores.id"))
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    start_at = Column(DateTime(timezone=True), nullable=False)
    end_at = Column(DateTime(timezone=True), nullable=False)
    qr_code = Column(String(255))
    auth_station = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Trade(Base):
    __tablename__ = "trades"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    meetup_id = Column(UUID(as_uuid=True), ForeignKey("meetups.id"))
    escrow = Column(Boolean, default=False)
    status = Column(String(50), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Verification(Base):
    __tablename__ = "verifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id"), nullable=False)
    verifier_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(String(20), nullable=False)  # confirm/deny
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AchievementProgress(Base):
    __tablename__ = "achievements_progress"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    key = Column(String(100), primary_key=True)
    count = Column(Integer, default=0)
    last_event_at = Column(DateTime(timezone=True))
