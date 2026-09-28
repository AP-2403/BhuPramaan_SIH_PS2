"""Notifications outbox router (mock)."""
from fastapi import APIRouter
from app.deps import CurrentUser
router = APIRouter()

@router.get("")
async def list_notifications(user: CurrentUser, page: int = 1, size: int = 20):
    return {"items": [], "total": 0, "note": "Mock — no real SMS/email sent. M11+"}
