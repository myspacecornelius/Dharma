

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.core import feed, laces, locations, security
from backend.core.database import get_db
from backend.models import user as user_models
from backend.schemas import post as post_schemas
from backend.schemas import user as user_schemas

router = APIRouter()

@router.post("/signals", response_model=post_schemas.PostCreateResponse)
def create_signal(
    signal: post_schemas.PostCreate,
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(security.get_current_active_user),
):
    """
    Create a new hyperlocal signal (post).
    """
    db_post = locations.create_location_and_post(db=db, post_create=signal, user_id=current_user.id)
    return db_post

@router.get("/feed/scan", response_model=list[post_schemas.PostResponse])
def get_local_feed(
    latitude: float,
    longitude: float,
    radius: float = 1.0, # in kilometers
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(security.get_current_active_user),
):
    """
    Fetch hyperlocal feed based on user's location.
    """
    posts = feed.get_hyperlocal_feed(db=db, latitude=latitude, longitude=longitude, radius=radius)
    return posts

@router.post("/signals/{post_id}/boost", response_model=user_schemas.UserResponse)
def boost_signal(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(security.get_current_active_user),
):
    """
    Boost a signal using Laces.
    """
    try:
        updated_user = laces.boost_post(db=db, post_id=post_id, user_id=current_user.id)
        return updated_user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
