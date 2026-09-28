"""Validation rules router."""
from fastapi import APIRouter
from app.deps import CurrentUser
router = APIRouter()

@router.get("")
async def list_rules(user: CurrentUser):
    return {"rules": [], "note": "M6+ implementation — rules seeded in DB"}

@router.patch("/{rule_id}")
async def update_rule(rule_id: str, user: CurrentUser):
    return {"note": "M6+"}
