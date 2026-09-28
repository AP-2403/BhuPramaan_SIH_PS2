"""Mock LRMS / DILRMP integration router.
This is a simulated government system for demo purposes only.
Real integration would require state-specific adapters and credentials.
"""
from fastapi import APIRouter
from app.deps import CurrentUser
router = APIRouter()

@router.get("/records")
async def lrms_get_records(village: str = None, khasra: str = None):
    return {"records": [], "note": "MOCK LRMS — simulated government system. M8+"}

@router.post("/records")
async def lrms_push_record():
    return {"ref_id": "MOCK-LRMS-001", "note": "MOCK LRMS push accepted"}

@router.get("/master/{level}")
async def lrms_master(level: str):
    return {"level": level, "data": [], "note": "MOCK LRMS master data"}
