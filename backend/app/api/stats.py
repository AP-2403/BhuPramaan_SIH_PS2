"""Statistics router — feeds dashboard KPI cards and charts."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.deps import CurrentUser
from app.models import Document, ProcessingStat

router = APIRouter()


@router.get("/overview")
async def overview(user: CurrentUser, db: AsyncSession = Depends(get_db)):
    """KPI cards: total docs, acceptance rate, pending, avg confidence."""
    result = await db.execute(
        select(
            func.count(Document.id).label("total"),
            func.sum((Document.status == "accepted").cast(type_=__import__("sqlalchemy").Integer)).label("accepted"),
            func.sum((Document.status == "needs_review").cast(type_=__import__("sqlalchemy").Integer)).label("pending"),
        )
    )
    row = result.one()
    total = row.total or 0
    accepted = row.accepted or 0
    pending = row.pending or 0
    return {
        "docs_total": total,
        "docs_accepted": accepted,
        "docs_pending_review": pending,
        "auto_accept_rate": round(accepted / total, 3) if total else 0,
        "is_seed_included": True,
        "seed_note": "Counts include seeded demo data (is_seed=true). See badge in UI.",
    }


@router.get("/timeseries")
async def timeseries(user: CurrentUser, db: AsyncSession = Depends(get_db), days: int = 30):
    """Daily processing stats for time-series chart."""
    result = await db.execute(
        select(ProcessingStat)
        .order_by(ProcessingStat.day.desc())
        .limit(days)
    )
    stats = result.scalars().all()
    return {
        "data": [
            {
                "day": str(s.day),
                "state_code": s.state_code,
                "district_code": s.district_code,
                "docs_processed": s.docs_processed,
                "docs_accepted": s.docs_accepted,
                "docs_review": s.docs_review,
                "field_accuracy": s.field_accuracy,
                "avg_confidence": s.avg_confidence,
                "is_seed": s.is_seed,
            }
            for s in stats
        ],
        "seed_note": "Points marked is_seed=true are demo seed data, not real production results.",
    }


@router.get("/errors")
async def error_stats(user: CurrentUser):
    return {"error_types": [], "note": "M10+ — populated after corrections are made"}


@router.get("/geo")
async def geo_stats(user: CurrentUser, db: AsyncSession = Depends(get_db)):
    """Per-district document counts."""
    result = await db.execute(
        select(
            Document.district_code,
            func.count(Document.id).label("count"),
            func.sum((Document.status == "accepted").cast(type_=__import__("sqlalchemy").Integer)).label("accepted"),
        ).group_by(Document.district_code)
    )
    rows = result.all()
    return {
        "districts": [{"district_code": r.district_code, "count": r.count, "accepted": r.accepted} for r in rows]
    }


@router.get("/accuracy")
async def accuracy_stats(user: CurrentUser):
    return {
        "note": "Accuracy metrics computed by eval_pipeline.py after M1. Measured on synthetic test split.",
        "field_accuracy": None,
        "cer": None,
    }
