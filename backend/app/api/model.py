"""Model / learning loop router."""
from fastapi import APIRouter
from app.deps import CurrentUser
router = APIRouter()

@router.post("/retrain")
async def retrain(user: CurrentUser):
    return {"note": "M8+ retrain implementation pending"}

@router.get("/metrics")
async def get_metrics(user: CurrentUser):
    return {"versions": [], "note": "M8+"}

@router.get("/calibration")
async def get_calibration(user: CurrentUser):
    return {"note": "M8+ calibration diagram data"}

@router.get("/lexicon")
async def get_lexicon(user: CurrentUser):
    return {"entries": [], "note": "M8+"}
