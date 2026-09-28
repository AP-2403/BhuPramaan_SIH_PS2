"""Export and LRMS sync router."""
from fastapi import APIRouter
from app.deps import CurrentUser
router = APIRouter()

@router.post("/lrms")
async def export_to_lrms(user: CurrentUser):
    return {"note": "M11+ mock LRMS push"}

@router.get("/csv")
async def export_csv(user: CurrentUser):
    return {"note": "M11+ CSV export"}

@router.get("/json")
async def export_json(user: CurrentUser):
    return {"note": "M11+ JSON export"}

@router.get("/geojson")
async def export_geojson(user: CurrentUser):
    return {"type": "FeatureCollection", "features": [], "note": "M11+"}
