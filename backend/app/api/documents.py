"""Documents router."""
from fastapi import APIRouter, Depends
from app.deps import CurrentUser
router = APIRouter()

@router.get("")
async def list_documents(user: CurrentUser, status: str = None, page: int = 1, size: int = 20):
    return {"items": [], "total": 0, "page": page, "size": size, "note": "M2+ implementation pending"}

@router.get("/{doc_id}")
async def get_document(doc_id: str, user: CurrentUser):
    return {"id": doc_id, "status": "not_found", "note": "M2+ implementation pending"}

@router.post("/upload")
async def upload_document(user: CurrentUser):
    return {"note": "M2 implementation pending — upload endpoint stub"}

@router.get("/{doc_id}/events")
async def document_events(doc_id: str, user: CurrentUser):
    return {"note": "SSE events — M2+ implementation pending"}

@router.get("/{doc_id}/extraction")
async def get_extraction(doc_id: str, user: CurrentUser):
    return {"note": "M5+ implementation pending"}

@router.post("/{doc_id}/reprocess")
async def reprocess(doc_id: str, user: CurrentUser):
    return {"note": "M2+ implementation pending"}
