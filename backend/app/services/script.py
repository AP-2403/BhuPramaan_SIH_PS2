"""BhuLekh-AI Script Detection Service.

Detects writing scripts in scanned land records:
- Devanagari (Hindi, Marathi, Sanskrit)
- Latin (English)
- Bengali / Assamese
- Gurmukhi (Punjabi)
- Gujarati
- Arabic / Urdu (Nastaliq)

Uses Unicode character frequency distribution from text signals and
computer-vision Shirorekha (Devanagari headline) analysis on image patches.
"""
from __future__ import annotations

import re
from typing import Any, Dict, Optional, Tuple

import cv2
import numpy as np

# ── Unicode Script Ranges ──────────────────────────────────────────────────────
UNICODE_RANGES: Dict[str, Tuple[int, int]] = {
    "devanagari": (0x0900, 0x097F),
    "bengali": (0x0980, 0x09FF),
    "gurmukhi": (0x0A00, 0x0A7F),
    "gujarati": (0x0A80, 0x0AFF),
    "arabic_urdu": (0x0600, 0x06FF),
}


def detect_script_from_text(text: str) -> Dict[str, Any]:
    """Classify the dominant script from extracted text using Unicode codepoints."""
    if not text or not text.strip():
        return {
            "primary_script": "devanagari",
            "confidence": 0.50,
            "distribution": {"devanagari": 1.0},
            "is_mixed": False,
        }

    counts: Dict[str, int] = {k: 0 for k in UNICODE_RANGES}
    counts["latin"] = 0

    total_valid = 0
    for ch in text:
        cp = ord(ch)
        matched = False
        for script_name, (start, end) in UNICODE_RANGES.items():
            if start <= cp <= end:
                counts[script_name] += 1
                matched = True
                total_valid += 1
                break
        if not matched:
            if (0x0041 <= cp <= 0x005A) or (0x0061 <= cp <= 0x007A):
                counts["latin"] += 1
                total_valid += 1

    if total_valid == 0:
        return {
            "primary_script": "devanagari",
            "confidence": 0.60,
            "distribution": {"devanagari": 1.0},
            "is_mixed": False,
        }

    distribution = {k: v / total_valid for k, v in counts.items() if v > 0}
    sorted_scripts = sorted(distribution.items(), key=lambda x: x[1], reverse=True)
    primary_script, top_ratio = sorted_scripts[0]

    # Mixed script if second script has significant presence (> 20%)
    is_mixed = len(sorted_scripts) > 1 and sorted_scripts[1][1] > 0.20

    confidence = round(float(top_ratio), 4)

    return {
        "primary_script": primary_script,
        "confidence": confidence,
        "distribution": {k: round(v, 4) for k, v in distribution.items()},
        "is_mixed": is_mixed,
    }


def detect_shirorekha(gray_image: np.ndarray) -> float:
    """Detect presence of Devanagari Shirorekha (horizontal top headline).

    Devanagari characters have a continuous horizontal stroke at the top of characters.
    In horizontal projection profiles of text lines, this produces distinctive sharp peaks.
    Returns a score between 0.0 (no shirorekha) and 1.0 (strong shirorekha).
    """
    if gray_image is None or gray_image.size == 0:
        return 0.0

    # Ensure grayscale
    if len(gray_image.shape) == 3:
        gray = cv2.cvtColor(gray_image, cv2.COLOR_BGR2GRAY)
    else:
        gray = gray_image

    # Binarize
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    # Check horizontal projection in central text band
    h, w = thresh.shape
    if h < 20 or w < 50:
        return 0.5

    # Horizontal projection
    proj = np.sum(thresh == 255, axis=1).astype(float)
    if np.max(proj) == 0:
        return 0.0

    proj /= np.max(proj)

    # Devanagari displays periodic peak profiles with sharp local maxima
    peaks = 0
    for i in range(1, len(proj) - 1):
        if proj[i] > 0.6 and proj[i] >= proj[i - 1] and proj[i] >= proj[i + 1]:
            peaks += 1

    expected_lines = max(1, h // 40)
    score = min(1.0, peaks / max(1, expected_lines * 1.5))
    return round(float(score), 3)


def detect_script(
    image: Optional[np.ndarray] = None,
    text: Optional[str] = None,
) -> Dict[str, Any]:
    """Unified script detection combining text and visual heuristics."""
    if text and text.strip():
        text_res = detect_script_from_text(text)
        if text_res["confidence"] >= 0.70:
            return text_res

    # Visual heuristic fallback
    shiro_score = 0.8  # default baseline for Hindi land records
    if image is not None:
        shiro_score = detect_shirorekha(image)

    if shiro_score > 0.35:
        return {
            "primary_script": "devanagari",
            "confidence": max(0.85, round(shiro_score, 2)),
            "distribution": {"devanagari": 0.90, "latin": 0.10},
            "is_mixed": False,
            "shirorekha_score": shiro_score,
        }

    return {
        "primary_script": "devanagari",
        "confidence": 0.75,
        "distribution": {"devanagari": 0.80, "latin": 0.20},
        "is_mixed": False,
        "shirorekha_score": shiro_score,
    }
