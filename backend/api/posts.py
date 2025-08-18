from backend.core.s3 import create_presigned_url

@router.post("/upload-url/", response_model=dict)
def get_upload_url(file_name: str):
    url = create_presigned_url(f"uploads/{file_name}")
    if not url:
        raise HTTPException(status_code=500, detail="Could not generate upload URL")
    return {"upload_url": url}


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.core.database import get_db
from backend.models.post import Post
from backend.schemas.post import PostCreate, Post as PostSchema
import uuid

router = APIRouter()

@router.post("/", response_model=PostSchema)
def create_post(post: PostCreate, db: Session = Depends(get_db)):
    db_post = Post(**post.dict())
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

from backend.core.redis_client import r
import json

@router.get("/global", response_model=List[PostSchema])
def get_global_feed(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    cached_posts = r.get("global_feed")
    if cached_posts:
        return json.loads(cached_posts)

    posts = db.query(Post).order_by(Post.timestamp.desc()).offset(skip).limit(limit).all()
    r.set("global_feed", json.dumps([post.dict() for post in posts]), ex=60) # Cache for 60 seconds
    return posts

@router.get("/local", response_model=List[PostSchema])
def get_local_feed(lat: float, long: float, radius: float, db: Session = Depends(get_db)):
    # This is a simplified implementation. A real-world application would use a more efficient geospatial query.
    posts = db.query(Post).filter(
        Post.geo_tag_lat.between(lat - radius, lat + radius),
        Post.geo_tag_long.between(long - radius, long + radius)
    ).order_by(Post.timestamp.desc()).all()
    return posts

@router.get("/user/{user_id}", response_model=List[PostSchema])
def get_posts_by_user(user_id: uuid.UUID, db: Session = Depends(get_db)):
    posts = db.query(Post).filter(Post.user_id == user_id).order_by(Post.timestamp.desc()).all()
    return posts

@router.delete("/{post_id}", status_code=204)
def delete_post(post_id: uuid.UUID, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.post_id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()
    return

