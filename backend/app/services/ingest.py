"""Ingestion service: file validation, SHA-256 deduplication, multi-page PDF/TIFF/ZIP extraction, quality assessment, and restoration storage."""
from __future__ import annotations

import hashlib
import io
import mimetypes
import uuid
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

import cv2
import numpy as np
from PIL import Image
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from app.models import AuditLog, Document, Page
from app.services.doctype import doctype_router
from app.services.layout import layout_analyzer
from app.services.quality import assess_quality
from app.services.restore import restore_document_image
from app.services.script import detect_script
from app.services.storage import storage_service

logger = structlog.get_logger()

ALLOWED_MIME_TYPES = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/tiff": [".tif", ".tiff"],
    "application/pdf": [".pdf"],
    "application/zip": [".zip"],
    "application/x-zip-compressed": [".zip"],
}

MAGIC_BYTES = {
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG\r\n\x1a\n": "image/png",
    b"%PDF": "application/pdf",
    b"II*\x00": "image/tiff",
    b"MM\x00*": "image/tiff",
    b"PK\x03\x04": "application/zip",
}

MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB


def compute_sha256(data: bytes) -> str:
    """Compute SHA-256 hash of bytes."""
    return hashlib.sha256(data).hexdigest()


def detect_mime(data: bytes, filename: str) -> str:
    """Detect MIME type using magic bytes with fallback to filename extension."""
    for magic, mime in MAGIC_BYTES.items():
        if data.startswith(magic):
            return mime
    guess, _ = mimetypes.guess_type(filename)
    if guess:
        return guess
    ext = Path(filename).suffix.lower()
    if ext in (".jpg", ".jpeg"):
        return "image/jpeg"
    if ext == ".png":
        return "image/png"
    if ext in (".tif", ".tiff"):
        return "image/tiff"
    if ext == ".pdf":
        return "application/pdf"
    if ext == ".zip":
        return "application/zip"
    return "application/octet-stream"


def validate_file(data: bytes, filename: str) -> Tuple[bool, str, Optional[str]]:
    """Validate file size, extension, and MIME type."""
    if len(data) == 0:
        return False, "", "File is empty"
    if len(data) > MAX_FILE_SIZE_BYTES:
        return False, "", f"File exceeds maximum allowed size of 50 MB (size: {len(data)/(1024*1024):.1f} MB)"

    mime = detect_mime(data, filename)
    valid_mimes = set(ALLOWED_MIME_TYPES.keys())
    if mime not in valid_mimes:
        # Check by extension as secondary fallback
        ext = Path(filename).suffix.lower()
        if ext not in [".jpg", ".jpeg", ".png", ".tif", ".tiff", ".pdf", ".zip"]:
            return False, mime, f"Unsupported file type: {mime} ({ext}). Allowed: PDF, JPG, PNG, TIFF, ZIP."

    return True, mime, None


def extract_pages_from_bytes(data: bytes, mime: str, filename: str) -> List[Tuple[np.ndarray, Optional[str]]]:
    """Extract page images (BGR numpy) and optional embedded text from file bytes."""
    results: List[Tuple[np.ndarray, Optional[str]]] = []

    # 1. PDF
    if mime == "application/pdf" or filename.lower().endswith(".pdf"):
        # Try PyMuPDF (fitz)
        try:
            import fitz
            pdf_doc = fitz.open(stream=data, filetype="pdf")
            for page in pdf_doc:
                text_layer = page.get_text()
                pix = page.get_pixmap(dpi=300)
                img = np.frombuffer(pix.samples, dtype=np.uint8).reshape((pix.h, pix.w, pix.n))
                if pix.n == 4:
                    img_bgr = cv2.cvtColor(img, cv2.COLOR_RGBA2BGR)
                elif pix.n == 3:
                    img_bgr = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
                else:
                    img_bgr = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
                results.append((img_bgr, text_layer.strip() if text_layer else None))
            if results:
                return results
        except Exception as e:
            logger.warning("PyMuPDF extraction failed, trying pdf2image", error=str(e))

        # Fallback to pdf2image if installed
        try:
            from pdf2image import convert_from_bytes
            pil_pages = convert_from_bytes(data, dpi=300)
            for page in pil_pages:
                open_cv_image = cv2.cvtColor(np.array(page), cv2.COLOR_RGB2BGR)
                results.append((open_cv_image, None))
            if results:
                return results
        except Exception as e:
            logger.warning("pdf2image extraction failed", error=str(e))

    # 2. Multi-page TIFF
    if mime == "image/tiff" or filename.lower() in (".tif", ".tiff"):
        try:
            pil_img = Image.open(io.BytesIO(data))
            for i in range(100):  # Cap at 100 pages
                try:
                    pil_img.seek(i)
                    frame = pil_img.copy()
                    if frame.mode != "RGB":
                        frame = frame.convert("RGB")
                    open_cv_image = cv2.cvtColor(np.array(frame), cv2.COLOR_RGB2BGR)
                    results.append((open_cv_image, None))
                except EOFError:
                    break
            if results:
                return results
        except Exception as e:
            logger.warning("TIFF multi-page extraction failed, fallback to single image", error=str(e))

    # 3. Standard single image (JPG, PNG, TIFF)
    np_arr = np.frombuffer(data, np.uint8)
    image_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if image_bgr is not None:
        results.append((image_bgr, None))
        return results

    # Pillow fallback
    try:
        pil_img = Image.open(io.BytesIO(data)).convert("RGB")
        image_bgr = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
        results.append((image_bgr, None))
        return results
    except Exception as e:
        raise ValueError(f"Could not decode image data from {filename}: {e}")


async def ingest_single_document(
    db: AsyncSession,
    file_bytes: bytes,
    filename: str,
    metadata: Optional[Dict[str, Any]] = None,
    user: Optional[Any] = None,
    batch_id: Optional[str] = None,
) -> Dict[str, Any]:
    """Ingest a single document: deduplicate, extract pages, assess quality, restore, and save.
    
    Returns:
        Dict with document details, quality score, flags, and pages info.
    """
    valid, mime, err = validate_file(file_bytes, filename)
    if not valid:
        raise ValueError(err)

    meta = metadata or {}
    sha256 = compute_sha256(file_bytes)

    # Check exact duplicate
    existing_query = select(Document).where(Document.sha256 == sha256)
    existing_res = await db.execute(existing_query)
    existing_doc = existing_res.scalar_one_or_none()

    if existing_doc:
        logger.info("Exact duplicate document detected", doc_id=existing_doc.id, sha256=sha256)
        # Fetch pages for existing document
        pages_query = select(Page).where(Page.document_id == existing_doc.id).order_by(Page.page_no)
        pages_res = await db.execute(pages_query)
        existing_pages = pages_res.scalars().all()
        dup_flags: set[str] = set()
        for p in existing_pages:
            for f in (p.layout_json or {}).get("quality_flags", []):
                dup_flags.add(f)

        return {
            "id": existing_doc.id,
            "filename": existing_doc.filename,
            "doc_type": existing_doc.doc_type,
            "status": existing_doc.status,
            "is_duplicate": True,
            "message": "Exact duplicate document already uploaded",
            "quality_score": existing_doc.quality_score,
            "quality_flags": sorted(list(dup_flags)),
            "pages": len(existing_pages),
            "pages_detail": [
                {
                    "page_no": p.page_no,
                    "quality_score": p.quality_score,
                    "width": p.width,
                    "height": p.height,
                    "rotation_deg": p.rotation_deg,
                    "flags": (p.layout_json or {}).get("quality_flags", []),
                }
                for p in existing_pages
            ],
            "uploaded_at": existing_doc.uploaded_at.isoformat() if existing_doc.uploaded_at else None,
        }

    # Extract pages
    page_data_list = extract_pages_from_bytes(file_bytes, mime, filename)
    if not page_data_list:
        raise ValueError(f"No pages could be extracted from {filename}")

    doc_id = str(uuid.uuid4())
    user_id = getattr(user, "id", None) if user else None

    # Store master original file
    doc_storage_key = f"documents/{doc_id}/original_{filename}"
    storage_service.upload_bytes(doc_storage_key, file_bytes, content_type=mime)

    pages_records: List[Page] = []
    page_summaries: List[Dict[str, Any]] = []
    total_quality_score = 0.0
    all_flags: set[str] = set()

    for idx, (page_bgr, text_layer) in enumerate(page_data_list, start=1):
        h, w = page_bgr.shape[:2]

        # 1. Quality assessment
        quality_res = assess_quality(page_bgr)
        page_quality_score = quality_res["quality_score"]
        flags = quality_res["flags"]
        metrics = quality_res["metrics"]
        total_quality_score += page_quality_score
        all_flags.update(flags)

        # 2. Restoration
        restored_res = restore_document_image(page_bgr)
        restored_bgr = restored_res["restored"]
        binary_img = restored_res["binary"]
        no_stamp_img = restored_res["no_stamp"]
        rotation_deg = restored_res["rotation_deg"]

        # 3. Store images to storage
        _, orig_png = cv2.imencode(".png", page_bgr)
        _, rest_png = cv2.imencode(".png", restored_bgr)
        _, bin_png = cv2.imencode(".png", binary_img)
        _, nostamp_png = cv2.imencode(".png", no_stamp_img)

        orig_key = f"documents/{doc_id}/pages/{idx}/original.png"
        rest_key = f"documents/{doc_id}/pages/{idx}/restored.png"
        bin_key = f"documents/{doc_id}/pages/{idx}/binary.png"
        nostamp_key = f"documents/{doc_id}/pages/{idx}/no_stamp.png"

        storage_service.upload_bytes(orig_key, orig_png.tobytes(), "image/png")
        storage_service.upload_bytes(rest_key, rest_png.tobytes(), "image/png")
        storage_service.upload_bytes(bin_key, bin_png.tobytes(), "image/png")
        storage_service.upload_bytes(nostamp_key, nostamp_png.tobytes(), "image/png")

        # 3. Layout analysis on restored page
        layout_res = layout_analyzer.analyze(restored_bgr)

        # 4. Script detection
        script_res = detect_script(image=restored_bgr, text=text_layer)

        # 5. Document Type Classification
        page_doc_type = doctype_router.classify(
            image=restored_bgr,
            layout=layout_res,
            text=text_layer,
            expected_type=meta.get("expected_doc_type") or meta.get("doc_type"),
        )

        # Layout metadata storing quality flags, metrics, detected regions, tables, and cells
        layout_meta = {
            "quality_flags": flags,
            "metrics": metrics,
            "steps_applied": restored_res["steps_applied"],
            "has_pdf_text": bool(text_layer),
            "pdf_text": text_layer,
            "regions": layout_res["regions"],
            "tables": layout_res["tables"],
            "has_table": layout_res["has_table"],
            "has_map": layout_res["has_map"],
            "has_stamp": layout_res["has_stamp"],
            "has_signature": layout_res["has_signature"],
            "has_handwritten_block": layout_res["has_handwritten_block"],
            "table_cells_count": layout_res["table_cells_count"],
            "script": script_res["primary_script"],
            "script_confidence": script_res["confidence"],
            "script_distribution": script_res["distribution"],
            "doc_type": page_doc_type["doc_type"],
            "doc_type_confidence": page_doc_type["confidence"],
        }

        page_record = Page(
            id=str(uuid.uuid4()),
            document_id=doc_id,
            page_no=idx,
            original_key=orig_key,
            restored_key=rest_key,
            quality_score=page_quality_score,
            width=w,
            height=h,
            rotation_deg=rotation_deg,
            layout_json=layout_meta,
            ocr_json=None,
        )
        pages_records.append(page_record)
        page_summaries.append({
            "page_no": idx,
            "quality_score": page_quality_score,
            "width": w,
            "height": h,
            "rotation_deg": rotation_deg,
            "flags": flags,
            "metrics": metrics,
            "restored_key": rest_key,
            "has_table": layout_res["has_table"],
            "has_map": layout_res["has_map"],
            "table_cells_count": layout_res["table_cells_count"],
            "regions_count": len(layout_res["regions"]),
            "doc_type": page_doc_type["doc_type"],
            "script": script_res["primary_script"],
        })

    avg_quality = round(total_quality_score / len(page_data_list), 3)

    # Document-level classification from first page or voting
    first_page_meta = pages_records[0].layout_json or {}
    classified_doc_type = first_page_meta.get("doc_type", "unknown")
    classified_script = first_page_meta.get("script", "devanagari")

    doc = Document(
        id=doc_id,
        batch_id=batch_id,
        filename=filename,
        mime=mime,
        storage_key=doc_storage_key,
        pages=len(pages_records),
        doc_type=classified_doc_type,
        script=classified_script,
        state_code=meta.get("state_code", "09"),
        district_code=meta.get("district_code", "0901"),
        tehsil_code=meta.get("tehsil_code"),
        village_code=meta.get("village_code"),
        status="uploaded",
        quality_score=avg_quality,
        uploaded_by=user_id,
        is_seed=False,
        sha256=sha256,
    )

    db.add(doc)
    for p in pages_records:
        db.add(p)

    # Audit log
    audit_entry = AuditLog(
        actor=user_id,
        action="document.upload",
        entity_type="document",
        entity_id=doc_id,
        payload={
            "filename": filename,
            "pages": len(pages_records),
            "quality_score": avg_quality,
            "quality_flags": list(all_flags),
            "doc_type": classified_doc_type,
        },
        prev_hash="",
        hash=hashlib.sha256(f"upload:{doc_id}:{sha256}".encode()).hexdigest(),
    )
    db.add(audit_entry)
    await db.commit()

    return {
        "id": doc_id,
        "batch_id": batch_id,
        "filename": filename,
        "pages": len(pages_records),
        "doc_type": classified_doc_type,
        "status": "uploaded",
        "quality_score": avg_quality,
        "quality_flags": sorted(list(all_flags)),
        "is_duplicate": False,
        "pages_detail": page_summaries,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
    }


async def ingest_zip_archive(
    db: AsyncSession,
    zip_bytes: bytes,
    filename: str,
    metadata: Optional[Dict[str, Any]] = None,
    user: Optional[Any] = None,
) -> Dict[str, Any]:
    """Extract and ingest all supported files from a bulk ZIP archive."""
    batch_id = str(uuid.uuid4())
    processed_docs: List[Dict[str, Any]] = []
    skipped_files: List[Dict[str, str]] = []

    with zipfile.ZipFile(io.BytesIO(zip_bytes), "r") as z:
        for zip_info in z.infolist():
            if zip_info.is_dir() or zip_info.filename.startswith("__MACOSX"):
                continue

            file_name = Path(zip_info.filename).name
            if not file_name or file_name.startswith("."):
                continue

            ext = Path(file_name).suffix.lower()
            if ext not in [".jpg", ".jpeg", ".png", ".tif", ".tiff", ".pdf"]:
                skipped_files.append({"filename": file_name, "reason": "Unsupported extension"})
                continue

            try:
                item_bytes = z.read(zip_info.filename)
                doc_res = await ingest_single_document(
                    db=db,
                    file_bytes=item_bytes,
                    filename=file_name,
                    metadata=metadata,
                    user=user,
                    batch_id=batch_id,
                )
                processed_docs.append(doc_res)
            except Exception as e:
                logger.error("Failed to process item from ZIP", filename=file_name, error=str(e))
                skipped_files.append({"filename": file_name, "reason": str(e)})

    return {
        "batch_id": batch_id,
        "archive_filename": filename,
        "documents_count": len(processed_docs),
        "documents": processed_docs,
        "skipped": skipped_files,
    }
