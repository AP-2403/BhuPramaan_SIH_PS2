"""Audit log router."""
from fastapi import APIRouter
from app.deps import CurrentUser
router = APIRouter()

@router.get("")
async def list_audit(user: CurrentUser, page: int = 1, size: int = 50):
    return {"items": [], "total": 0, "note": "M11+ implementation pending"}

@router.get("/verify")
async def verify_chain(user: CurrentUser):
    return {"chain_intact": True, "entries_checked": 0, "note": "M11+ hash chain verification pending"}
