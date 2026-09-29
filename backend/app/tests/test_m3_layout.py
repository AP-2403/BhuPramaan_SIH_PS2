"""Unit and integration tests for Milestone M3: Layout analysis, Script detection, and Doc Type Router."""
from __future__ import annotations

import json
from pathlib import Path
import cv2
import pytest
from httpx import ASGITransport, AsyncClient

from app.deps import create_access_token
from app.main import app
from app.services.doctype import doctype_router
from app.services.layout import layout_analyzer
from app.services.script import detect_script, detect_script_from_text

ROOT = Path(__file__).parent.parent.parent.parent
SYNTH_DIR = ROOT / "data" / "synthetic"
GT_DIR = ROOT / "data" / "ground_truth"
SPLITS_PATH = SYNTH_DIR / "splits.json"


@pytest.fixture
def sample_images():
    """Load sample test images for Khatauni, Mutation, and Cadastral Map."""
    khatauni_p = SYNTH_DIR / "a_000000_clean.png"
    mutation_p = SYNTH_DIR / "b_000001_clean.png"
    map_p = SYNTH_DIR / "c_000002_clean.png"
    return {
        "khatauni": cv2.imread(str(khatauni_p)),
        "mutation": cv2.imread(str(mutation_p)),
        "map": cv2.imread(str(map_p)),
    }


def test_table_grid_and_cells_detection(sample_images):
    """Verify table grids, rows, and individual cells are detected accurately."""
    img = sample_images["khatauni"]
    assert img is not None

    res = layout_analyzer.analyze(img)
    assert res["has_table"] is True
    assert res["table_cells_count"] >= 20
    assert len(res["tables"]) >= 1

    table = res["tables"][0]
    assert table["rows_count"] >= 3
    assert table["cols_count"] >= 5
    assert len(table["cells"]) == res["table_cells_count"]

    # Check cell structure
    cell0 = table["cells"][0]
    assert "row" in cell0
    assert "col" in cell0
    assert "bbox" in cell0
    assert len(cell0["bbox"]) == 4
    assert cell0["bbox"][0] < cell0["bbox"][2]
    assert cell0["bbox"][1] < cell0["bbox"][3]


def test_cadastral_map_detection(sample_images):
    """Verify cadastral map container and geographic features are detected."""
    img = sample_images["map"]
    assert img is not None

    res = layout_analyzer.analyze(img)
    assert res["has_map"] is True
    map_regions = [r for r in res["regions"] if r["type"] == "map_region"]
    assert len(map_regions) >= 1
    props = map_regions[0]["properties"]
    assert props["has_north_arrow"] is True or props["has_scale_bar"] is True


def test_script_detection_unicode():
    """Verify Unicode-based script classification across Indic scripts and Latin."""
    hindi_text = "खसरा खतौनी उत्तर प्रदेश अधिकार अभिलेख"
    res_hi = detect_script_from_text(hindi_text)
    assert res_hi["primary_script"] == "devanagari"
    assert res_hi["confidence"] > 0.90

    english_text = "Land Record Digitization and Validation System"
    res_en = detect_script_from_text(english_text)
    assert res_en["primary_script"] == "latin"
    assert res_en["confidence"] > 0.90

    mixed_text = "खाता संख्या 105 Village Aishbagh"
    res_mix = detect_script_from_text(mixed_text)
    assert res_mix["primary_script"] in ("devanagari", "latin")


def test_doctype_router_on_samples(sample_images):
    """Verify router classifies representative document types."""
    res_a = doctype_router.classify(sample_images["khatauni"])
    assert res_a["doc_type"] == "khatauni"
    assert res_a["confidence"] >= 0.70

    res_b = doctype_router.classify(sample_images["mutation"])
    assert res_b["doc_type"] == "mutation"
    assert res_b["confidence"] >= 0.70

    res_c = doctype_router.classify(sample_images["map"])
    assert res_c["doc_type"] == "cadastral_map"
    assert res_c["confidence"] >= 0.70


def test_router_accuracy_on_test_set():
    """Evaluate router accuracy on the official 45-document test split."""
    if not SPLITS_PATH.exists():
        pytest.skip("splits.json not found")

    with open(SPLITS_PATH, "r", encoding="utf-8") as f:
        splits = json.load(f)

    test_ids = splits.get("test", [])
    assert len(test_ids) > 0

    correct = 0
    total = 0

    for doc_id in test_ids:
        gt_path = GT_DIR / f"{doc_id}.json"
        img_path = SYNTH_DIR / f"{doc_id}_degraded.png"

        if not gt_path.exists() or not img_path.exists():
            continue

        with open(gt_path, "r", encoding="utf-8") as f:
            gt = json.load(f)

        img = cv2.imread(str(img_path))
        if img is None:
            continue

        res = doctype_router.classify(img)
        if res["doc_type"] == gt["doc_type"]:
            correct += 1
        total += 1

    accuracy = correct / total
    print(f"\n[EVAL] Router test set accuracy: {accuracy * 100:.2f}% ({correct}/{total})")
    assert accuracy >= 0.85, f"Expected router accuracy >= 85%, got {accuracy * 100:.2f}%"


@pytest.mark.asyncio
async def test_page_layout_api():
    """Verify GET /api/documents/{id}/pages/{n}/layout returns structured layout JSON."""
    from app.db import AsyncSessionLocal
    from app.models import User
    from sqlalchemy import select

    async with AsyncSessionLocal() as session:
        user = (await session.execute(select(User).where(User.role == "admin"))).scalar_one_or_none()
        if not user:
            user = (await session.execute(select(User))).scalars().first()

    assert user is not None
    token = create_access_token(data={"sub": str(user.id), "role": user.role})
    headers = {"Authorization": f"Bearer {token}"}
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # First list documents to get an active document ID
        list_res = await ac.get("/api/documents", headers=headers)
        assert list_res.status_code == 200
        items = list_res.json()["items"]
        if not items:
            pytest.skip("No documents in database to test layout API")

        doc_id = items[0]["id"]
        layout_res = await ac.get(f"/api/documents/{doc_id}/pages/1/layout", headers=headers)
        assert layout_res.status_code == 200
        data = layout_res.json()
        assert "regions" in data
        assert "width" in data
        assert "height" in data
        assert "doc_type" in data
        assert "script" in data
