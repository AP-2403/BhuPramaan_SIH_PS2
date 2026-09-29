"""Extraction pipeline: Dual-engine OCR simulation/runner, field normalization, and structured land record generation."""
from __future__ import annotations

import re
from typing import Any, Dict, List, Optional
import structlog

logger = structlog.get_logger()


def normalize_area(raw_area: str) -> Dict[str, Any]:
    """Convert local units (Hectares, Bigha, Biswa) to square meters."""
    raw_str = raw_area.strip()
    # Check for Hectare (हे. or hectare)
    m = re.search(r"([\d\.]+)\s*(?:हे|hec|hectare)", raw_str, re.IGNORECASE)
    if m:
        val = float(m.group(1))
        sq_m = round(val * 10000.0, 2)
        return {"raw": raw_area, "normalized_sq_m": sq_m, "standard_str": f"{val} हे. ({sq_m:,.1f} m²)", "unit": "hectare"}
    
    # Check for Bigha (बीघा)
    m = re.search(r"([\d\.]+)\s*(?:बीघा|bigha)", raw_str, re.IGNORECASE)
    if m:
        val = float(m.group(1))
        # UP standard Pucca Bigha ~ 2530 sq. meters
        sq_m = round(val * 2529.3, 2)
        return {"raw": raw_area, "normalized_sq_m": sq_m, "standard_str": f"{val} बीघा ({sq_m:,.1f} m²)", "unit": "bigha"}

    # Plain float assumed hectare
    try:
        val = float(raw_str)
        sq_m = round(val * 10000.0, 2)
        return {"raw": raw_area, "normalized_sq_m": sq_m, "standard_str": f"{val} हे. ({sq_m:,.1f} m²)", "unit": "hectare"}
    except ValueError:
        return {"raw": raw_area, "normalized_sq_m": 0.0, "standard_str": raw_area, "unit": "unknown"}


def extract_document_fields(
    doc_id: str,
    doc_type: str,
    filename: str,
    metadata: Optional[Dict[str, Any]] = None,
    quality_score: float = 0.85,
) -> Dict[str, Any]:
    """Extract structured fields with confidence scores, dual-engine votes, and bounding boxes."""
    meta = metadata or {}
    state_code = meta.get("state_code") or "09"
    district_code = meta.get("district_code") or "0901"
    tehsil_code = meta.get("tehsil_code") or "090101"
    village_code = meta.get("village_code") or "09010101"

    is_degraded = "degraded" in filename.lower() or quality_score < 0.75

    if doc_type == "cadastral_map" or "map" in filename.lower():
        fields = [
            {
                "id": "map_village",
                "path": "header.village",
                "label": "Village / ग्राम",
                "value": "Hasanpur (09010101)",
                "raw_value": "ग्राम हसनपुर",
                "confidence": 0.96,
                "bbox": [100, 50, 450, 95],
                "engine_votes": {"paddle": "ग्राम हसनपुर", "tesseract": "ग्राम हसनपुर", "agreement": 1.0},
                "status": "ok",
            },
            {
                "id": "map_sheet",
                "path": "header.sheet_no",
                "label": "Cadastral Sheet / चादर संख्या",
                "value": "Sheet 03 (Zone North)",
                "raw_value": "चादर न. ०३",
                "confidence": 0.94,
                "bbox": [550, 50, 800, 95],
                "engine_votes": {"paddle": "चादर न. 03", "tesseract": "चादर न. 03", "agreement": 1.0},
                "status": "ok",
            },
            {
                "id": "map_parcels_count",
                "path": "summary.parcels_count",
                "label": "Identified Parcels / कुल भूखण्ड",
                "value": "4",
                "raw_value": "4",
                "confidence": 0.98,
                "bbox": [100, 110, 300, 150],
                "engine_votes": {"paddle": "4", "tesseract": "4", "agreement": 1.0},
                "status": "ok",
            },
        ]
        rows = [
            {"khasra_no": "245/1", "area_sq_m": 4120.0, "status": "VALIDATED", "owner": "रामेश्वर प्रसाद", "bbox": [120, 80, 320, 220]},
            {"khasra_no": "245/2", "area_sq_m": 2080.0, "status": "VALIDATED", "owner": "सुरेश कुमार", "bbox": [320, 60, 480, 220]},
            {"khasra_no": "246", "area_sq_m": 5100.0, "status": "VALIDATED", "owner": "विजय प्रकाश", "bbox": [480, 50, 680, 230]},
            {"khasra_no": "312", "area_sq_m": 5420.0, "status": "WARNING", "owner": "कमला देवी", "bbox": [110, 230, 460, 390]},
        ]
        return {
            "doc_type": "cadastral_map",
            "header": {
                "state_code": state_code,
                "district_code": district_code,
                "tehsil_code": tehsil_code,
                "village_code": village_code,
                "village_name": "हसनपुर (Hasanpur)",
                "survey_year": "2024",
            },
            "fields": fields,
            "rows": rows,
            "overall_confidence": 0.94,
        }

    if doc_type == "mutation" or "mutation" in filename.lower():
        fields = [
            {
                "id": "mut_case_no",
                "path": "header.case_no",
                "label": "Mutation Case No / वाद संख्या",
                "value": "M-2024/0901/1049",
                "raw_value": "वाद सं. १०४९/२०२४",
                "confidence": 0.95,
                "bbox": [120, 80, 480, 130],
                "engine_votes": {"paddle": "वाद सं. 1049/2024", "tesseract": "वाद सं 1049/2024", "agreement": 0.98},
                "status": "ok",
            },
            {
                "id": "mut_seller",
                "path": "transfer.seller_name",
                "label": "Transferor (Old Owner) / अंतरणकर्ता",
                "value": "रामेश्वर प्रसाद",
                "raw_value": "रामेश्वर प्रसाद सुत राम लखन",
                "confidence": 0.93,
                "bbox": [120, 160, 500, 210],
                "engine_votes": {"paddle": "रामेश्वर प्रसाद", "tesseract": "रामेश्वर प्रसाद", "agreement": 1.0},
                "status": "ok",
            },
            {
                "id": "mut_buyer",
                "path": "transfer.buyer_name",
                "label": "Transferee (New Owner) / क्रेता",
                "value": "अमित सिंह",
                "raw_value": "अमित सिंह सुत महेन्द्र सिंह",
                "confidence": 0.74 if is_degraded else 0.94,
                "bbox": [120, 230, 500, 280],
                "engine_votes": {"paddle": "अमित सिंह", "tesseract": "अमित सिह" if is_degraded else "अमित सिंह", "agreement": 0.88},
                "status": "uncertain" if is_degraded else "ok",
            },
            {
                "id": "mut_khasra",
                "path": "transfer.khasra_no",
                "label": "Khasra / गाटा संख्या",
                "value": "245/1",
                "raw_value": "२४५/१",
                "confidence": 0.96,
                "bbox": [120, 300, 350, 350],
                "engine_votes": {"paddle": "245/1", "tesseract": "245/1", "agreement": 1.0},
                "status": "ok",
            },
            {
                "id": "mut_area",
                "path": "transfer.area",
                "label": "Transferred Area / अंतरित रकबा",
                "value": "0.412 हे. (4,120.0 m²)",
                "raw_value": "०.४१२ हे.",
                "confidence": 0.97,
                "bbox": [370, 300, 600, 350],
                "engine_votes": {"paddle": "0.412 हे.", "tesseract": "0.412 हे.", "agreement": 1.0},
                "status": "ok",
            },
        ]
        return {
            "doc_type": "mutation",
            "header": {
                "state_code": state_code,
                "district_code": district_code,
                "tehsil_code": tehsil_code,
                "village_code": village_code,
                "order_date": "2026-03-15",
            },
            "fields": fields,
            "overall_confidence": 0.91,
        }

    # Default: Khatauni (Record of Rights / RoR)
    owner1_conf = 0.94
    owner2_conf = 0.72 if is_degraded else 0.92

    fields = [
        {
            "id": "f_village",
            "path": "header.village",
            "label": "Village / ग्राम",
            "value": "Hasanpur (09010101)",
            "raw_value": "ग्राम हसनपुर",
            "confidence": 0.98,
            "bbox": [80, 50, 360, 95],
            "engine_votes": {"paddle": "ग्राम हसनपुर", "tesseract": "ग्राम हसनपुर", "agreement": 1.0},
            "status": "ok",
        },
        {
            "id": "f_tehsil",
            "path": "header.tehsil",
            "label": "Tehsil / परगना व तहसील",
            "value": "Lucknow Sadar (090101)",
            "raw_value": "तहसील लखनऊ सदर",
            "confidence": 0.97,
            "bbox": [380, 50, 660, 95],
            "engine_votes": {"paddle": "तहसील लखनऊ सदर", "tesseract": "तहसील लखनऊ सदर", "agreement": 1.0},
            "status": "ok",
        },
        {
            "id": "f_district",
            "path": "header.district",
            "label": "District / जनपद",
            "value": "Lucknow (0901)",
            "raw_value": "जनपद लखनऊ",
            "confidence": 0.99,
            "bbox": [680, 50, 920, 95],
            "engine_votes": {"paddle": "जनपद लखनऊ", "tesseract": "जनपद लखनऊ", "agreement": 1.0},
            "status": "ok",
        },
        {
            "id": "f_khata",
            "path": "header.khata_no",
            "label": "Khata Number / खाता संख्या",
            "value": "104",
            "raw_value": "१०४",
            "confidence": 0.98,
            "bbox": [80, 110, 250, 155],
            "engine_votes": {"paddle": "104", "tesseract": "104", "agreement": 1.0},
            "status": "ok",
        },
        {
            "id": "f_fasli_year",
            "path": "header.fasli_year",
            "label": "Fasli Year / फसली वर्ष",
            "value": "1428 - 1433",
            "raw_value": "१४२८-१४३३",
            "confidence": 0.96,
            "bbox": [280, 110, 550, 155],
            "engine_votes": {"paddle": "1428-1433", "tesseract": "1428-1433", "agreement": 1.0},
            "status": "ok",
        },
        {
            "id": "f_total_area",
            "path": "header.total_area",
            "label": "Total Khata Area / कुल रकबा",
            "value": "0.620 हे. (6,200.0 m²)",
            "raw_value": "०.६२० हे.",
            "confidence": 0.98,
            "bbox": [580, 110, 850, 155],
            "engine_votes": {"paddle": "0.620 हे.", "tesseract": "0.620 हे.", "agreement": 1.0},
            "status": "ok",
        },
    ]

    rows = [
        {
            "row_idx": 0,
            "khasra_no": "245/1",
            "khasra_conf": 0.96,
            "khasra_votes": {"paddle": "245/1", "tesseract": "245/1"},
            "khasra_bbox": [90, 210, 220, 270],
            "owner_name": "रामेश्वर प्रसाद",
            "owner_translit": "Rameshwar Prasad",
            "parentage": "पुत्र राम लखन",
            "owner_conf": owner1_conf,
            "owner_votes": {"paddle": "रामेश्वर प्रसाद", "tesseract": "रामेश्वर प्रसाद"},
            "owner_bbox": [240, 210, 520, 270],
            "share": "1/2 (50%)",
            "area_raw": "0.412 हे.",
            "area_norm": "4,120.0 m²",
            "area_conf": 0.98,
            "land_type": "कृषि (Bhumidhari with transferable rights)",
            "lagaan": "₹ 24.50",
            "status": "ok",
        },
        {
            "row_idx": 1,
            "khasra_no": "245/2",
            "khasra_conf": 0.95,
            "khasra_votes": {"paddle": "245/2", "tesseract": "245/2"},
            "khasra_bbox": [90, 290, 220, 350],
            "owner_name": "सुरेश कुमार",
            "owner_translit": "Suresh Kumar",
            "parentage": "पुत्र राम लखन",
            "owner_conf": owner2_conf,
            "owner_votes": {
                "paddle": "सुरेश कुमार",
                "tesseract": "सुरेश कमार",
                "note": "Tesseract misread vowel matra 'ु' due to paper fold",
            },
            "owner_bbox": [240, 290, 520, 350],
            "share": "1/2 (50%)",
            "area_raw": "0.208 हे.",
            "area_norm": "2,080.0 m²",
            "area_conf": 0.97,
            "land_type": "कृषि (Bhumidhari with transferable rights)",
            "lagaan": "₹ 12.25",
            "status": "uncertain" if owner2_conf < 0.75 else "ok",
        },
    ]

    return {
        "doc_type": "khatauni",
        "header": {
            "state_code": state_code,
            "district_code": district_code,
            "tehsil_code": tehsil_code,
            "village_code": village_code,
            "village_name": "हसनपुर (Hasanpur)",
            "khata_no": "104",
            "fasli_year": "1428-1433",
            "total_area_ha": 0.620,
            "total_area_sq_m": 6200.0,
        },
        "fields": fields,
        "rows": rows,
        "overall_confidence": round((0.98 + 0.97 + 0.99 + 0.98 + owner1_conf + owner2_conf) / 6, 2),
    }
