"""Pipeline Celery tasks — stub for M0/M1; full implementation in M2+."""
from __future__ import annotations

import structlog
from app.tasks.celery_app import celery_app

log = structlog.get_logger()


@celery_app.task(bind=True, name="app.tasks.pipeline.process_document", max_retries=3)
def process_document(self, document_id: str):
    """Main pipeline task. Full implementation in M2+.
    
    Stages:
    1. Quality assessment (M2)
    2. Restoration (M2)
    3. Layout detection (M3)
    4. OCR ensemble (M4)
    5. Field extraction (M5)
    6. Validation (M6)
    7. Routing (M7)
    """
    log.info("pipeline.stub", document_id=document_id, status="M2+ implementation pending")
    return {"document_id": document_id, "status": "stub", "note": "Full pipeline in M2+"}
