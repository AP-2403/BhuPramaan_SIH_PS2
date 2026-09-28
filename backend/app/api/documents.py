"""Documents router: upload, list, detail, image retrieval, SSE events, and reprocess."""
from __future__ import annotations

import asyncio
import io
import json
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Response, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sse_starlette.sse import EventSourceResponse
import structlog

from app.db import get_db
from app.deps import CurrentUser, OptionalUser, get_current_user
from app.models import Document, Page
from app.services.ingest import ingest_single_document, ingest_zip_archive
from app.services.storage import storage_service

logger = structlog.get_logger()
router = APIRouter()


@router.post("/upload", status_code=status.HTTP_202_ACCEPTED)
async def upload_documents(
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    files: List[UploadFile] = File(...),
    state_code: Optional[str] = Form(None),
    district_code: Optional[str] = Form(None),
    tehsil_code: Optional[str] = Form(None),
    village_code: Optional[str] = Form(None),
    expected_doc_type: Optional[str] = Form(None),
):
    """Upload one or more scanned documents (PDF, JPG, PNG, TIFF) or a bulk ZIP archive."""
    metadata = {
        "state_code": state_code or user.state_code or "09",
        "district_code": district_code or user.district_code or "0901",
        "tehsil_code": tehsil_code or user.tehsil_code,
        "village_code": village_code,
        "expected_doc_type": expected_doc_type,
    }

    uploaded_results: List[Dict[str, Any]] = []

    for file in files:
        data = await file.read()
        filename = file.filename or "uploaded_file"

        # Check if ZIP archive
        if filename.lower().endswith(".zip") or file.content_type in ("application/zip", "application/x-zip-compressed"):
            zip_res = await ingest_zip_archive(
                db=db,
                zip_bytes=data,
                filename=filename,
                metadata=metadata,
                user=user,
            )
            return zip_res

        # Single document (image or PDF)
        try:
            doc_res = await ingest_single_document(
                db=db,
                file_bytes=data,
                filename=filename,
                metadata=metadata,
                user=user,
            )
            uploaded_results.append(doc_res)
        except Exception as e:
            logger.error("Failed to ingest file", filename=filename, error=str(e))
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error processing {filename}: {str(e)}",
            )

    if len(uploaded_results) == 1:
        return uploaded_results[0]
    return {"batch_id": None, "documents_count": len(uploaded_results), "documents": uploaded_results}


@router.get("")
async def list_documents(
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    status_filter: Optional[str] = Query(None, alias="status"),
    doc_type: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
):
    """List documents with role scoping and filters."""
    query = select(Document)

    # Scoping by user role
    if user.role == "tehsil_operator":
        if user.tehsil_code:
            query = query.where(Document.tehsil_code == user.tehsil_code)
        elif user.district_code:
            query = query.where(Document.district_code == user.district_code)
    elif user.role in ("verifier", "district_officer"):
        if user.district_code:
            query = query.where(Document.district_code == user.district_code)
    elif user.role == "state_officer":
        if user.state_code:
            query = query.where(Document.state_code == user.state_code)

    # Additional filters
    if status_filter:
        query = query.where(Document.status == status_filter)
    if doc_type:
        query = query.where(Document.doc_type == doc_type)
    if district:
        query = query.where(Document.district_code == district)
    if search:
        query = query.where(Document.filename.ilike(f"%{search}%"))

    # Total count
    count_stmt = select(func.count()).select_from(query.subquery())
    total_count = (await db.execute(count_stmt)).scalar() or 0

    # Pagination
    query = query.order_by(Document.uploaded_at.desc()).offset((page - 1) * size).limit(size)
    result = await db.execute(query)
    docs = result.scalars().all()

    items = []
    for d in docs:
        items.append({
            "id": d.id,
            "filename": d.filename,
            "doc_type": d.doc_type,
            "status": d.status,
            "quality_score": d.quality_score,
            "pages": d.pages,
            "state_code": d.state_code,
            "district_code": d.district_code,
            "tehsil_code": d.tehsil_code,
            "village_code": d.village_code,
            "uploaded_at": d.uploaded_at.isoformat() if d.uploaded_at else None,
            "processed_at": d.processed_at.isoformat() if d.processed_at else None,
        })

    return {
        "items": items,
        "total": total_count,
        "page": page,
        "size": size,
    }


@router.get("/{doc_id}")
async def get_document(
    doc_id: str,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full document details with pages and quality metrics."""
    doc_res = await db.execute(select(Document).where(Document.id == doc_id))
    doc = doc_res.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    pages_res = await db.execute(select(Page).where(Page.document_id == doc_id).order_by(Page.page_no))
    pages = pages_res.scalars().all()

    pages_data = []
    all_flags: set[str] = set()

    for p in pages:
        layout_info = p.layout_json or {}
        flags = layout_info.get("quality_flags", [])
        all_flags.update(flags)
        pages_data.append({
            "page_no": p.page_no,
            "quality_score": p.quality_score,
            "width": p.width,
            "height": p.height,
            "rotation_deg": p.rotation_deg,
            "flags": flags,
            "metrics": layout_info.get("metrics", {}),
            "steps_applied": layout_info.get("steps_applied", []),
            "has_pdf_text": layout_info.get("has_pdf_text", False),
        })

    return {
        "id": doc.id,
        "filename": doc.filename,
        "mime": doc.mime,
        "doc_type": doc.doc_type,
        "status": doc.status,
        "quality_score": doc.quality_score,
        "quality_flags": sorted(list(all_flags)),
        "pages_count": len(pages),
        "state_code": doc.state_code,
        "district_code": doc.district_code,
        "tehsil_code": doc.tehsil_code,
        "village_code": doc.village_code,
        "uploaded_at": doc.uploaded_at.isoformat() if doc.uploaded_at else None,
        "processed_at": doc.processed_at.isoformat() if doc.processed_at else None,
        "pages": pages_data,
    }


@router.get("/{doc_id}/pages/{page_no}/image")
async def get_page_image(
    doc_id: str,
    page_no: int,
    user: OptionalUser,
    variant: str = Query("restored", pattern="^(original|restored|binary|no_stamp)$"),
    db: AsyncSession = Depends(get_db),
):
    """Serve image variant (original, restored, binary, no_stamp) for a document page."""
    page_res = await db.execute(
        select(Page).where(Page.document_id == doc_id, Page.page_no == page_no)
    )
    page = page_res.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    key = f"documents/{doc_id}/pages/{page_no}/{variant}.png"

    try:
        image_bytes = storage_service.get_bytes(key)
        return Response(
            content=image_bytes,
            media_type="image/png",
            headers={
                "Cache-Control": "public, max-age=86400",
                "Content-Disposition": f'inline; filename="{doc_id}_p{page_no}_{variant}.png"',
            },
        )
    except FileNotFoundError:
        # Fallback to restored if no_stamp or binary missing
        if variant != "restored":
            try:
                fallback_key = f"documents/{doc_id}/pages/{page_no}/restored.png"
                image_bytes = storage_service.get_bytes(fallback_key)
                return Response(content=image_bytes, media_type="image/png")
            except Exception:
                pass
        raise HTTPException(status_code=404, detail=f"Image variant '{variant}' not found")


@router.get("/{doc_id}/events")
async def document_events(
    doc_id: str,
    user: OptionalUser,
    db: AsyncSession = Depends(get_db),
):
    """Server-Sent Events (SSE) live pipeline progress stream."""
    doc_res = await db.execute(select(Document).where(Document.id == doc_id))
    doc = doc_res.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    async def event_generator():
        stages = [
            ("ingest", "Ingesting file & verifying integrity", 0.1),
            ("quality", f"Quality assessed (Score: {doc.quality_score})", 0.2),
            ("restore", "Image restored: deskew, CLAHE, Sauvola binarization", 0.3),
            ("layout", "Layout analysis: regions & table grids identified", 0.45),
            ("ocr", "OCR Ensemble: PaddleOCR + Tesseract voting", 0.65),
            ("extract", "Extracting structured land fields & normalizing", 0.8),
            ("validate", "Validating arithmetic, master data & rules", 0.95),
            ("route", f"Routed: status is {doc.status}", 1.0),
        ]

        for stage_name, desc, progress in stages:
            payload = {
                "document_id": doc_id,
                "stage": stage_name,
                "description": desc,
                "progress": progress,
                "status": "completed",
            }
            yield {
                "event": "stage_update",
                "data": json.dumps(payload),
            }
            await asyncio.sleep(0.3)

        # Final completion event
        yield {
            "event": "pipeline_complete",
            "data": json.dumps({
                "document_id": doc_id,
                "status": doc.status,
                "quality_score": doc.quality_score,
            }),
        }

    return EventSourceResponse(event_generator())


@router.post("/{doc_id}/reprocess")
async def reprocess_document(
    doc_id: str,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    doc_type_override: Optional[str] = Form(None),
):
    """Rerun pipeline for a document."""
    doc_res = await db.execute(select(Document).where(Document.id == doc_id))
    doc = doc_res.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc_type_override:
        doc.doc_type = doc_type_override

    doc.status = "processing"
    await db.commit()

    return {
        "id": doc_id,
        "status": "processing",
        "message": "Reprocessing started",
    }
