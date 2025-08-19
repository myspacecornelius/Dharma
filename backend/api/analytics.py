from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models
from ..core.database import get_db
from ..core.security import get_current_user

router = APIRouter()

@router.get("/analytics/summary")
def get_analytics_summary(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Dummy data for now
    data = [
        { "name": "Nike", "success": 4000, "fail": 2400 },
        { "name": "Adidas", "success": 3000, "fail": 1398 },
        { "name": "Supreme", "success": 2000, "fail": 9800 },
        { "name": "Kith", "success": 2780, "fail": 3908 },
        { "name": "Off-White", "success": 1890, "fail": 4800 },
    ]
    return data
