"""Land records router."""
from fastapi import APIRouter
from app.deps import CurrentUser
router = APIRouter()

@router.get("")
async def list_records(user: CurrentUser, q: str = None, page: int = 1, size: int = 20):
    return {"items": [], "total": 0, "note": "M7+ implementation pending"}

@router.get("/search")
async def search_records(q: str, user: CurrentUser):
    return {"items": [], "note": "Fuzzy search M7+"}

@router.get("/{record_id}")
async def get_record(record_id: str, user: CurrentUser):
    return {"id": record_id, "note": "M7+"}
