
from fastapi import APIRouter

from . import auth, posts, releases, subscriptions, uploads, users

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(users.router, prefix="/users", tags=["users"])
router.include_router(posts.router, prefix="/posts", tags=["posts"])
router.include_router(releases.router, prefix="/releases", tags=["releases"])
router.include_router(subscriptions.router, prefix="/subscriptions", tags=["subscriptions"])
router.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
