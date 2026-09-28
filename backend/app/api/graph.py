"""Ownership graph router."""
from fastapi import APIRouter
from app.deps import CurrentUser
router = APIRouter()

@router.get("/khasra/{village}/{khasra}")
async def get_khasra_graph(village: str, khasra: str, user: CurrentUser):
    return {"nodes": [], "edges": [], "note": "M6+ implementation pending"}
