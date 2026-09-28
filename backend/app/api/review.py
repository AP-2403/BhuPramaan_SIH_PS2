"""Review queue router."""
from fastapi import APIRouter
from app.deps import CurrentUser
router = APIRouter()

@router.get("/tasks")
async def list_tasks(user: CurrentUser, page: int = 1, size: int = 20):
    return {"items": [], "total": 0, "note": "M7+ implementation pending"}

@router.get("/tasks/{task_id}")
async def get_task(task_id: str, user: CurrentUser):
    return {"id": task_id, "note": "M7+ implementation pending"}

@router.patch("/tasks/{task_id}/fields/{field_id}")
async def edit_field(task_id: str, field_id: str, user: CurrentUser):
    return {"note": "M7+ implementation pending"}

@router.post("/tasks/{task_id}/submit")
async def submit_task(task_id: str, user: CurrentUser):
    return {"note": "M7+ implementation pending"}

@router.post("/tasks/{task_id}/reject")
async def reject_task(task_id: str, user: CurrentUser):
    return {"note": "M7+ implementation pending"}
