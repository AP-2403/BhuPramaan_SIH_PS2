"""Public (citizen) status lookup — masked data."""
from fastapi import APIRouter
router = APIRouter()

@router.get("/status/{application_id}")
async def public_status(application_id: str):
    return {
        "application_id": application_id,
        "status": "not_found",
        "note": "Citizen portal — M11+. Personal data is masked.",
    }
