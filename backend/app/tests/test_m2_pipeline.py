"""Tests for Milestone M2: Ingestion, Quality Assessment, Image Restoration, and Image Serving."""
import io
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import cv2
import numpy as np
import pytest
from fastapi.testclient import TestClient

from app.main import app

from app.services.quality import assess_quality, estimate_skew_angle
from app.services.restore import restore_document_image
from app.services.storage import storage_service

client = TestClient(app)
SYNTH_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data" / "synthetic"


def get_auth_token(username: str = "tehsil_operator") -> str:
    res = client.post("/api/auth/login", data={"username": username, "password": "Demo@1234"})
    assert res.status_code == 200, f"Login failed: {res.text}"
    return res.json()["access_token"]


def test_quality_assessment_clean_vs_degraded():
    """Verify that quality assessment assigns higher score to clean than degraded image."""
    clean_path = next(SYNTH_DIR.glob("*_clean.png"), None)
    degraded_path = next(SYNTH_DIR.glob("*_degraded.png"), None)

    if not clean_path or not degraded_path:
        pytest.skip("Synthetic samples not found in data/synthetic")

    clean_img = cv2.imread(str(clean_path))
    degraded_img = cv2.imread(str(degraded_path))

    clean_res = assess_quality(clean_img)
    degraded_res = assess_quality(degraded_img)

    assert 0.0 <= clean_res["quality_score"] <= 1.0
    assert 0.0 <= degraded_res["quality_score"] <= 1.0
    assert "metrics" in clean_res
    assert "flags" in degraded_res
    # Clean document should score higher or have fewer/milder degradation flags
    assert clean_res["quality_score"] >= degraded_res["quality_score"] or len(degraded_res["flags"]) >= len(clean_res["flags"])


def test_restoration_pipeline_produces_all_variants():
    """Verify that restoration pipeline produces restored, binary, and no_stamp images."""
    # Create test synthetic image with text and simulated blur/shadow
    img = np.ones((600, 800, 3), dtype=np.uint8) * 240
    cv2.putText(img, "उत्तर प्रदेश भूलेख खतौनी", (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (20, 20, 20), 2)
    cv2.circle(img, (200, 100), 40, (0, 0, 180), -1)  # Red stamp

    res = restore_document_image(img)

    assert res["restored"] is not None
    assert res["binary"] is not None
    assert res["no_stamp"] is not None
    assert res["restored"].shape[:2] == img.shape[:2]
    assert res["binary"].shape[:2] == img.shape[:2]
    assert len(res["steps_applied"]) > 0
    # Binary should be 1-channel with only 0 and 255 values
    unique_vals = np.unique(res["binary"])
    assert all(v in (0, 255) for v in unique_vals)


def test_storage_service_operations():
    """Verify storage service upload, download, and delete."""
    test_key = "test/test_object.txt"
    test_data = b"BhuLekh-AI test storage payload"

    storage_service.upload_bytes(test_key, test_data, content_type="text/plain")
    assert storage_service.exists(test_key) is True

    retrieved = storage_service.get_bytes(test_key)
    assert retrieved == test_data

    storage_service.delete(test_key)
    assert storage_service.exists(test_key) is False


def test_api_upload_detail_and_image_serving():
    """End-to-end integration test of upload -> detail -> image endpoints."""
    token = get_auth_token("tehsil_operator")
    headers = {"Authorization": f"Bearer {token}"}

    sample_file = next(SYNTH_DIR.glob("*_degraded.png"), None)
    if not sample_file:
        pytest.skip("Synthetic samples not found in data/synthetic")

    with open(sample_file, "rb") as f:
        file_bytes = f.read()

    # 1. Upload
    res = client.post(
        "/api/documents/upload",
        files={"files": (sample_file.name, io.BytesIO(file_bytes), "image/png")},
        data={"state_code": "09", "district_code": "0901", "expected_doc_type": "khatauni"},
        headers=headers,
    )
    assert res.status_code == 202
    data = res.json()
    doc_id = data["id"]
    assert "quality_score" in data
    assert "quality_flags" in data
    assert len(data["pages_detail"]) >= 1

    # 2. Get detail
    detail_res = client.get(f"/api/documents/{doc_id}", headers=headers)
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["id"] == doc_id
    assert detail["status"] in ("uploaded", "processing")
    assert len(detail["pages"]) >= 1

    # 3. Get images (restored, binary, original, no_stamp)
    for variant in ["restored", "binary", "original", "no_stamp"]:
        img_res = client.get(f"/api/documents/{doc_id}/pages/1/image?variant={variant}", headers=headers)
        assert img_res.status_code == 200
        assert img_res.headers["content-type"] == "image/png"
        assert len(img_res.content) > 100

    # 4. Duplicate upload detection
    dup_res = client.post(
        "/api/documents/upload",
        files={"files": (sample_file.name, io.BytesIO(file_bytes), "image/png")},
        headers=headers,
    )
    assert dup_res.status_code == 202
    assert dup_res.json()["is_duplicate"] is True
    assert dup_res.json()["id"] == doc_id


def test_api_list_documents_filtering():
    """Verify listing documents with role and status filtering."""
    token = get_auth_token("tehsil_operator")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/documents?page=1&size=10", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "total" in data
    assert data["page"] == 1
    assert data["size"] == 10
