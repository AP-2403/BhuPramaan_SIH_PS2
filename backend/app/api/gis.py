"""GIS / parcels router."""
from fastapi import APIRouter
from app.deps import CurrentUser
router = APIRouter()

@router.get("/parcels")
async def list_parcels(user: CurrentUser, village: str = None, bbox: str = None):
    return {"type": "FeatureCollection", "features": [], "note": "M9+ implementation pending"}

@router.get("/parcels/{parcel_id}")
async def get_parcel(parcel_id: str, user: CurrentUser):
    return {"id": parcel_id, "note": "M9+"}

@router.post("/maps/upload")
async def upload_map(user: CurrentUser):
    return {"note": "M9+ cadastral map parsing pending"}
