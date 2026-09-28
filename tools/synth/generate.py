#!/usr/bin/env python3
import sys, io
if sys.stdout.encoding and sys.stdout.encoding.lower() not in ('utf-8', 'utf8'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
"""BhuLekh-AI Synthetic Document Generator.

Generates synthetic land-record images (Types A, B, C) with ground truth JSON.
All documents are purely synthetic — no real personal data.

Usage:
    python tools/synth/generate.py --n 300 --seed 42 [--out data/synthetic]

Output:
    data/synthetic/<doc_id>_clean.png
    data/synthetic/<doc_id>_degraded.png
    data/ground_truth/<doc_id>.json
    data/synthetic/splits.json
    docs/samples.png   (visual grid for spot-check)
"""
from __future__ import annotations

import argparse
import csv
import json
import math
import os
import random
import sys
import uuid
from datetime import date, timedelta
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

# ── Paths ──────────────────────────────────────────────────────────────────────
ROOT = Path(__file__).parent.parent.parent
SYNTH_DIR = ROOT / "data" / "synthetic"
GT_DIR = ROOT / "data" / "ground_truth"
FONTS_DIR = ROOT / "data" / "fonts"
DOCS_DIR = ROOT / "docs"
MASTER_DIR = ROOT / "data" / "master"

# Add tools/ to path so we can import names
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "tools"))
from synth.names import (  # noqa: E402
    FIRST_NAMES_HI, FIRST_NAMES_EN, SURNAMES_HI, SURNAMES_EN,
    VILLAGE_NAMES_HI, VILLAGE_NAMES_EN, LAND_CLASSES, MUTATION_REASONS_HI,
    MUTATION_REASONS_EN,
)

# ── Constants ──────────────────────────────────────────────────────────────────
PAGE_W, PAGE_H = 1240, 1754   # A4 at 150 DPI (lighter for laptop CPU)
QUALITY_DIST = {"clean": 0.25, "mild": 0.30, "moderate": 0.30, "severe": 0.15}
ERROR_RATE = 0.15             # 15% of docs get injected errors

# Devanagari digits
DEVA_DIGITS = "०१२३४५६७८९"

# ── Font loading ───────────────────────────────────────────────────────────────
def _load_font(name_hints: list[str], size: int) -> ImageFont.FreeTypeFont:
    """Try to load one of several font hints; fall back to default."""
    search_paths = list(FONTS_DIR.glob("*.ttf")) + list(FONTS_DIR.glob("*.otf"))
    # Also check common system paths
    system_paths = [
        Path("/usr/share/fonts/truetype/noto"),
        Path("/usr/share/fonts"),
        Path("C:/Windows/Fonts"),
    ]
    for sp in system_paths:
        if sp.exists():
            search_paths += list(sp.glob("**/*.ttf"))

    for hint in name_hints:
        hint_lower = hint.lower()
        for fp in search_paths:
            if hint_lower in fp.name.lower():
                try:
                    return ImageFont.truetype(str(fp), size)
                except Exception:
                    pass
    # Absolute fallback
    try:
        return ImageFont.truetype(str(search_paths[0]), size) if search_paths else ImageFont.load_default()
    except Exception:
        return ImageFont.load_default()


class FontSet:
    def __init__(self):
        self.header = _load_font(["NotoSansDevanagari", "NotoSans", "Lohit"], 28)
        self.body = _load_font(["NotoSansDevanagari", "NotoSans", "Lohit"], 22)
        self.small = _load_font(["NotoSansDevanagari", "NotoSans", "Lohit"], 18)
        self.handwriting = _load_font(["Kalam", "Tillana", "Sahitya", "NotoSansDevanagari"], 22)
        self.title = _load_font(["NotoSansDevanagari", "NotoSans", "Lohit"], 32)
        self.digits = _load_font(["NotoSansDevanagari", "NotoSans"], 20)


# ── Random helpers ─────────────────────────────────────────────────────────────
def rng_name(rng: random.Random) -> tuple[str, str]:
    """Return (hindi_name, english_name) pair."""
    idx_f = rng.randint(0, min(len(FIRST_NAMES_HI), len(FIRST_NAMES_EN)) - 1)
    idx_s = rng.randint(0, min(len(SURNAMES_HI), len(SURNAMES_EN)) - 1)
    hi = f"{FIRST_NAMES_HI[idx_f]} {SURNAMES_HI[idx_s]}"
    en = f"{FIRST_NAMES_EN[idx_f]} {SURNAMES_EN[idx_s]}"
    return hi, en


def deva_digits(n: int | str) -> str:
    return "".join(DEVA_DIGITS[int(c)] if c.isdigit() else c for c in str(n))


def rng_khasra(rng: random.Random, allow_sub: bool = True) -> str:
    base = rng.randint(1, 999)
    if allow_sub and rng.random() < 0.3:
        sub = rng.randint(1, 4)
        if rng.random() < 0.3:
            letter = rng.choice("कखगघङ")
            return f"{base}/{sub}/{letter}"
        return f"{base}/{sub}"
    return str(base)


def rng_area(rng: random.Random) -> tuple[float, str]:
    """Return (area_ha, display_string)."""
    bigha = rng.uniform(0.5, 8)
    biswa = rng.uniform(0, 19)
    area_ha = (bigha * 2529.29 + biswa * 126.46) / 10000
    biswa_int = int(biswa)
    return round(area_ha, 4), f"{int(bigha)} बीघा {biswa_int} बिस्वा"


def rng_date(rng: random.Random, start: date = date(1990, 1, 1), end: date = date(2024, 12, 31)) -> date:
    delta = (end - start).days
    return start + timedelta(days=rng.randint(0, delta))


def rng_village(rng: random.Random) -> tuple[str, str, str]:
    idx = rng.randint(0, len(VILLAGE_NAMES_HI) - 1)
    code = f"09010{idx+1:03d}"
    return code, VILLAGE_NAMES_HI[idx], VILLAGE_NAMES_EN[idx]


def rng_khata(rng: random.Random) -> str:
    return str(rng.randint(1, 9999)).zfill(4)


# ── Background / paper textures ────────────────────────────────────────────────
def make_paper_bg(rng: random.Random, w: int = PAGE_W, h: int = PAGE_H) -> Image.Image:
    """Yellowed paper background."""
    r = rng.randint(235, 252)
    g = rng.randint(225, 245)
    b = rng.randint(180, 210)
    img = Image.new("RGB", (w, h), (r, g, b))
    # Add noise
    arr = np.array(img, dtype=np.int16)
    noise = rng.randint(-8, 8)
    arr += np.random.default_rng(rng.randint(0, 10000)).integers(-8, 8, arr.shape, dtype=np.int16)
    arr = np.clip(arr, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)


def draw_ruled_lines(draw: ImageDraw.Draw, rng: random.Random, y_start: int, y_end: int,
                     step: int = 32, color: tuple = (180, 170, 140)):
    for y in range(y_start, y_end, step):
        draw.line([(40, y), (PAGE_W - 40, y)], fill=color, width=1)


def draw_stamp(img: Image.Image, rng: random.Random, fonts: FontSet):
    """Draw a faint circular stamp overlay."""
    draw = ImageDraw.Draw(img)
    cx = rng.randint(PAGE_W // 4, 3 * PAGE_W // 4)
    cy = rng.randint(PAGE_H // 4, 3 * PAGE_H // 4)
    r = rng.randint(60, 120)
    color = (rng.choice([180, 50]), rng.choice([50, 80]), rng.choice([50, 180]), 60)
    # draw as ellipse on a temp RGBA layer
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    ld.ellipse([cx - r, cy - r, cx + r, cy + r], outline=color, width=3)
    ld.text((cx - r + 5, cy - 10), "कार्यालय मुद्रा", font=fonts.small, fill=color)
    img.paste(Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB"))


def draw_signature(draw: ImageDraw.Draw, x: int, y: int, rng: random.Random):
    """Draw a squiggly line signature."""
    pts = [(x + i * 4, y + int(12 * math.sin(i * 0.7 + rng.random()))) for i in range(20)]
    draw.line(pts, fill=(30, 30, 80), width=2)


# ── Degradation ────────────────────────────────────────────────────────────────
def degrade(img: Image.Image, quality_level: str, rng: random.Random) -> Image.Image:
    if quality_level == "clean":
        return img

    arr = np.array(img).astype(np.float32)

    if quality_level in ("mild", "moderate", "severe"):
        # Rotation
        max_deg = {"mild": 2, "moderate": 4, "severe": 6}[quality_level]
        angle = rng.uniform(-max_deg, max_deg)
        img_rot = img.rotate(angle, fillcolor=(240, 235, 200))
        arr = np.array(img_rot).astype(np.float32)

    if quality_level in ("moderate", "severe"):
        # Gaussian blur
        sigma = {"moderate": 1.2, "severe": 2.5}[quality_level]
        img2 = Image.fromarray(arr.astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius=sigma))
        arr = np.array(img2).astype(np.float32)

        # Contrast reduction (fading)
        fade = {"moderate": 0.75, "severe": 0.5}[quality_level]
        arr = arr * fade + 255 * (1 - fade)

    if quality_level == "severe":
        # Salt-and-pepper noise
        mask = np.random.default_rng(rng.randint(0, 10000)).random(arr.shape[:2])
        arr[mask < 0.01] = 255
        arr[mask > 0.99] = 0

        # Shadow gradient
        shadow = np.linspace(0.6, 1.0, arr.shape[1])[np.newaxis, :, np.newaxis]
        if rng.random() < 0.5:
            shadow = shadow[:, ::-1, :]
        arr = arr * shadow

    arr = np.clip(arr, 0, 255).astype(np.uint8)
    result = Image.fromarray(arr)

    if quality_level in ("moderate", "severe"):
        # JPEG compression artifact
        import io
        quality = {"moderate": 55, "severe": 25}[quality_level]
        buf = io.BytesIO()
        result.save(buf, "JPEG", quality=quality)
        buf.seek(0)
        result = Image.open(buf).copy()

    return result


# ── Type A: Khatauni / Khasra ─────────────────────────────────────────────────
def gen_khatauni(rng: random.Random, fonts: FontSet, doc_id: str, inject_error: bool) -> dict:
    img = make_paper_bg(rng)
    draw = ImageDraw.Draw(img)
    boxes = {}

    # Metadata
    village_code, village_hi, village_en = rng_village(rng)
    district_hi = rng.choice(["लखनऊ", "आगरा", "वाराणसी", "कानपुर", "प्रयागराज"])
    tehsil_hi = rng.choice(["सदर", "मोहनलालगंज", "बख्शी का तालाब", "फतेहपुर सीकरी"])
    khata_no = rng_khata(rng)
    state_hi = "उत्तर प्रदेश"

    y = 50
    # Title
    title = "खसरा / खतौनी (अधिकार अभिलेख)"
    draw.text((PAGE_W // 2 - 200, y), title, font=fonts.title, fill=(20, 20, 80))
    y += 50

    # Header fields
    header_data = [
        ("राज्य", state_hi),
        ("जनपद/ज़िला", district_hi),
        ("तहसील", tehsil_hi),
        ("ग्राम", village_hi),
        ("खाता संख्या", deva_digits(khata_no)),
    ]
    for label, value in header_data:
        draw.text((60, y), f"{label} : ", font=fonts.body, fill=(60, 60, 60))
        x0 = 280
        draw.text((x0, y), value, font=fonts.body, fill=(20, 20, 20))
        if label == "खाता संख्या":
            boxes["khata_no"] = [x0, y, x0 + 120, y + 24]
        y += 36

    y += 20
    # Table header
    col_headers = ["खसरा सं.", "क्षेत्रफल (हे.)", "भूमि वर्ग", "स्वामी का नाम", "सम्बन्ध", "पिता/पति का नाम", "हिस्सा"]
    col_x = [60, 200, 380, 530, 740, 870, 1080]
    col_w = [120, 160, 140, 200, 120, 200, 100]

    # Table header row
    draw.rectangle([col_x[0] - 5, y, col_x[-1] + col_w[-1], y + 34], outline=(80, 80, 80), width=1)
    for i, (hdr, cx) in enumerate(zip(col_headers, col_x)):
        draw.text((cx, y + 5), hdr, font=fonts.small, fill=(40, 40, 120))
    y += 38

    # Table rows
    n_rows = rng.randint(2, 6)
    khasra_nos = [rng_khasra(rng) for _ in range(n_rows)]
    rows_gt = []
    total_area = 0
    injected_errors = []

    for i, khasra_no in enumerate(khasra_nos):
        area_ha, area_str = rng_area(rng)
        total_area += area_ha
        land_cls_canon, land_cls_hi = rng.choice(LAND_CLASSES)
        owner_hi, owner_en = rng_name(rng)
        rel_hi = rng.choice(["पुत्र", "पत्नी", "पुत्री"])
        rel_en = {"पुत्र": "S/o", "पत्नी": "W/o", "पुत्री": "D/o"}[rel_hi]
        rel_hi2, rel_en2 = rng_name(rng)
        share = 1.0

        # Injected errors
        if inject_error and i == 0 and rng.random() < 0.5:
            # Area sum error: make area_str not match area_ha
            injected_errors.append({"type": "area_sum_mismatch", "field": f"rows[{i}].area", "expected": area_ha})
            area_str = area_str + " (?)"  # deliberate mismatch marker for validation

        if inject_error and i == 1 and n_rows > 2 and rng.random() < 0.4:
            # Duplicate khasra
            khasra_no = khasra_nos[0]
            injected_errors.append({"type": "duplicate_khasra", "field": f"rows[{i}].khasra_no", "value": khasra_no})

        row_y = y
        cells = [
            deva_digits(khasra_no),
            f"{area_ha:.3f}",
            land_cls_hi,
            owner_hi,
            rel_hi,
            rel_hi2,
            f"{share:.1f}",
        ]
        for j, (cell_text, cx) in enumerate(zip(cells, col_x)):
            draw.text((cx, row_y + 4), cell_text, font=fonts.body, fill=(20, 20, 20))
            if j == 0:
                boxes[f"rows[{i}].khasra_no"] = [cx, row_y, cx + col_w[j], row_y + 28]
            elif j == 3:
                boxes[f"rows[{i}].owner"] = [cx, row_y, cx + col_w[j], row_y + 28]
            elif j == 1:
                boxes[f"rows[{i}].area"] = [cx, row_y, cx + col_w[j], row_y + 28]

        draw.line([(60, row_y + 30), (col_x[-1] + col_w[-1], row_y + 30)], fill=(160, 160, 160), width=1)
        y += 34

        rows_gt.append({
            "khasra_no": khasra_no,
            "area_ha": area_ha,
            "area_display": area_str,
            "land_class": land_cls_canon,
            "owner": owner_hi,
            "owner_en": owner_en,
            "relation": rel_hi,
            "relation_en": rel_en,
            "relative_name": rel_hi2,
            "share": share,
        })

    # Stamps and signatures at bottom
    if rng.random() < 0.6:
        draw.text((60, PAGE_H - 120), "पटवारी हस्ताक्षर :", font=fonts.small, fill=(80, 80, 80))
        draw_signature(draw, 300, PAGE_H - 110, rng)
        draw.text((700, PAGE_H - 120), "तहसीलदार हस्ताक्षर :", font=fonts.small, fill=(80, 80, 80))
        draw_signature(draw, 960, PAGE_H - 110, rng)

    if rng.random() < 0.4:
        draw_stamp(img, rng, fonts)

    gt = {
        "doc_id": doc_id,
        "doc_type": "khatauni",
        "script": "devanagari",
        "fields": {
            "state": state_hi,
            "district": district_hi,
            "tehsil": tehsil_hi,
            "village": village_hi,
            "village_code": village_code,
            "khata_no": khata_no,
            "rows": rows_gt,
        },
        "boxes": boxes,
        "injected_errors": injected_errors,
    }
    return {"image": img, "ground_truth": gt}


# ── Type B: Mutation register ─────────────────────────────────────────────────
def gen_mutation(rng: random.Random, fonts: FontSet, doc_id: str, inject_error: bool) -> dict:
    img = make_paper_bg(rng)
    draw = ImageDraw.Draw(img)
    draw_ruled_lines(draw, rng, 80, PAGE_H - 80)
    boxes = {}

    village_code, village_hi, _ = rng_village(rng)
    mut_no = str(rng.randint(1, 9999)).zfill(4)
    mut_date = rng_date(rng)
    khasra_no = rng_khasra(rng, allow_sub=False)
    old_owner_hi, old_owner_en = rng_name(rng)
    new_owner_hi, new_owner_en = rng_name(rng)
    area_ha, area_str = rng_area(rng)
    reason_hi = rng.choice(MUTATION_REASONS_HI)
    reason_en = MUTATION_REASONS_EN[MUTATION_REASONS_HI.index(reason_hi)]
    reg_no = f"REG/{rng.randint(1000, 9999)}/{mut_date.year}"
    authority = rng.choice(["उप-जिलाधिकारी", "तहसीलदार", "नायब तहसीलदार"])

    injected_errors = []
    if inject_error and rng.random() < 0.6:
        injected_errors.append({
            "type": "ownership_chain_broken",
            "field": "old_owner",
            "note": "old_owner is not the current recorded owner — G001 should fail",
        })

    title = "नामांतरण रजिस्टर प्रविष्टि"
    draw.text((PAGE_W // 2 - 180, 50), title, font=fonts.title, fill=(20, 20, 80))

    y = 120
    fields_display = [
        ("नामांतरण संख्या", deva_digits(mut_no), "mutation_no"),
        ("दिनांक", mut_date.strftime("%d/%m/%Y"), "date"),
        ("ग्राम", village_hi, "village"),
        ("खसरा संख्या", deva_digits(khasra_no), "khasra_no"),
        ("पुराना स्वामी", old_owner_hi, "old_owner"),
        ("नया स्वामी", new_owner_hi, "new_owner"),
        ("हस्तांतरित क्षेत्र", area_str, "area_transferred"),
        ("कारण", reason_hi, "reason"),
        ("पंजीयन संख्या", reg_no, "registration_no"),
        ("आदेश प्राधिकारी", authority, "order_authority"),
    ]
    for label, value, field_key in fields_display:
        draw.text((80, y), f"{label} :", font=fonts.body, fill=(60, 60, 60))
        x0 = 380
        draw.text((x0, y), value, font=fonts.handwriting, fill=(20, 20, 100))
        boxes[field_key] = [x0, y, x0 + 350, y + 26]
        y += 48

    draw.text((80, PAGE_H - 100), "हस्ताक्षर", font=fonts.small, fill=(80, 80, 80))
    draw_signature(draw, 200, PAGE_H - 90, rng)

    gt = {
        "doc_id": doc_id,
        "doc_type": "mutation",
        "script": "devanagari",
        "fields": {
            "mutation_no": mut_no,
            "date": str(mut_date),
            "village": village_hi,
            "village_code": village_code,
            "khasra_no": khasra_no,
            "old_owner": old_owner_hi,
            "old_owner_en": old_owner_en,
            "new_owner": new_owner_hi,
            "new_owner_en": new_owner_en,
            "area_transferred_ha": area_ha,
            "area_transferred_display": area_str,
            "reason": reason_hi,
            "reason_en": reason_en,
            "registration_no": reg_no,
            "order_authority": authority,
        },
        "boxes": boxes,
        "injected_errors": injected_errors,
    }
    return {"image": img, "ground_truth": gt}


# ── Type C: Cadastral map ─────────────────────────────────────────────────────
def gen_cadastral_map(rng: random.Random, fonts: FontSet, doc_id: str,
                       inject_error: bool, linked_khasras: list[str] | None = None) -> dict:
    img = make_paper_bg(rng, PAGE_W, PAGE_H)
    draw = ImageDraw.Draw(img)

    # Map bounding box (pixels)
    mx0, my0, mx1, my1 = 80, 120, PAGE_W - 80, PAGE_H - 200

    # Generate Voronoi-like parcels using random points
    n_parcels = rng.randint(15, 35)
    pts = [(rng.randint(mx0 + 40, mx1 - 40), rng.randint(my0 + 40, my1 - 40)) for _ in range(n_parcels)]

    # Simple Voronoi approximation: for each pixel, assign to nearest point
    # Use bounding-box rectangles for speed (real Voronoi is slow in PIL)
    # Instead: draw random convex polygons
    parcels_px = []  # list of (khasra_no, polygon_px)

    khasra_pool = linked_khasras or [rng_khasra(rng, allow_sub=False) for _ in range(n_parcels)]
    used_khasras = khasra_pool[:n_parcels]

    for i, (cx, cy) in enumerate(pts):
        r = rng.randint(25, 60)
        n_sides = rng.randint(4, 7)
        angles = sorted([rng.uniform(0, 2 * math.pi) for _ in range(n_sides)])
        poly = [
            (int(cx + r * math.cos(a) * rng.uniform(0.6, 1.2)),
             int(cy + r * math.sin(a) * rng.uniform(0.6, 1.2)))
            for a in angles
        ]
        # Clip to map bounds
        poly = [(min(mx1 - 5, max(mx0 + 5, x)), min(my1 - 5, max(my0 + 5, y))) for x, y in poly]
        kn = used_khasras[i] if i < len(used_khasras) else str(rng.randint(100, 999))
        parcels_px.append((kn, poly))
        draw.polygon(poly, outline=(60, 60, 60), fill=(240, 235, 200))
        # Label
        label_x = sum(p[0] for p in poly) // len(poly) - 12
        label_y = sum(p[1] for p in poly) // len(poly) - 10
        draw.text((label_x, label_y), str(kn).split("/")[0], font=fonts.digits, fill=(20, 20, 80))

    # Map border
    draw.rectangle([mx0, my0, mx1, my1], outline=(80, 80, 80), width=2)

    # Title
    draw.text((PAGE_W // 2 - 150, 50), "भूखण्ड मानचित्र (सिंथेटिक)", font=fonts.title, fill=(20, 20, 80))

    # North arrow
    draw.polygon([(mx1 - 30, my0 + 50), (mx1 - 20, my0 + 80), (mx1 - 40, my0 + 80)],
                 fill=(60, 60, 60))
    draw.text((mx1 - 35, my0 + 30), "↑N", font=fonts.small, fill=(20, 20, 20))

    # Scale bar
    draw.line([(mx0 + 10, my1 + 20), (mx0 + 110, my1 + 20)], fill=(60, 60, 60), width=2)
    draw.text((mx0 + 30, my1 + 25), "100 मीटर", font=fonts.small, fill=(40, 40, 40))

    # 4 control points with fake coordinates (for georeferencing demo)
    ctrl_pts = [
        (mx0, my0, 80.950, 26.840),
        (mx1, my0, 80.955, 26.840),
        (mx0, my1, 80.950, 26.836),
        (mx1, my1, 80.955, 26.836),
    ]
    for px, py, lon, lat in ctrl_pts:
        draw.ellipse([px - 4, py - 4, px + 4, py + 4], fill=(200, 0, 0))
        draw.text((px + 6, py - 8), f"({lon:.3f},{lat:.3f})", font=fonts.small, fill=(200, 0, 0))

    # Generate GeoJSON ground truth
    lon0, lat0 = 80.950, 26.836
    lon1, lat1 = 80.955, 26.840
    map_w = mx1 - mx0
    map_h = my1 - my0

    def px_to_lonlat(px, py):
        lon = lon0 + (px - mx0) / map_w * (lon1 - lon0)
        lat = lat0 + (my1 - py) / map_h * (lat1 - lat0)
        return lon, lat

    features = []
    for kn, poly in parcels_px:
        coords = [list(px_to_lonlat(x, y)) for x, y in poly]
        coords.append(coords[0])  # close ring
        features.append({
            "type": "Feature",
            "properties": {"khasra_no": kn},
            "geometry": {"type": "Polygon", "coordinates": [coords]},
        })

    geojson_gt = {"type": "FeatureCollection", "features": features}

    injected_errors = []
    village_code, village_hi, _ = rng_village(rng)

    gt = {
        "doc_id": doc_id,
        "doc_type": "cadastral_map",
        "script": "devanagari",
        "fields": {
            "village": village_hi,
            "village_code": village_code,
            "n_parcels": len(parcels_px),
            "khasra_nos": [kn for kn, _ in parcels_px],
            "control_points": [{"px": px, "py": py, "lon": lon, "lat": lat}
                               for px, py, lon, lat in ctrl_pts],
        },
        "geojson": geojson_gt,
        "boxes": {},
        "injected_errors": injected_errors,
    }
    return {"image": img, "ground_truth": gt}


# ── Quality sampling ───────────────────────────────────────────────────────────
def sample_quality(rng: random.Random) -> str:
    r = rng.random()
    cum = 0
    for level, prob in QUALITY_DIST.items():
        cum += prob
        if r < cum:
            return level
    return "mild"


# ── Main generator ─────────────────────────────────────────────────────────────
def generate_all(n: int = 300, seed: int = 42, out_dir: Path | None = None):
    rng = random.Random(seed)
    np.random.seed(seed)

    out_dir = out_dir or SYNTH_DIR
    out_dir.mkdir(parents=True, exist_ok=True)
    GT_DIR.mkdir(parents=True, exist_ok=True)
    DOCS_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Loading fonts from {FONTS_DIR} ...")
    fonts = FontSet()
    print("Fonts loaded.")

    # ── Linked set (village V001): 30 khasras, used in A, B, and C docs ──────
    linked_village_code = "09010101"
    linked_village_hi = "ऐशबाग"
    linked_khasras = [str(i) for i in range(101, 131)]  # khasra 101..130

    doc_ids = []
    ground_truths = []
    sample_images = []  # for visual grid

    # Type distribution for 300 docs:
    # A: 45%, B: 35%, C: 15%, (linked C: 1 doc, linked A+B: ~15 each)
    # Ensure at least: 5 linked A, 5 linked B, 1 C
    type_schedule = (
        ["A"] * 5 + ["B"] * 5 + ["C"]  # linked set
        + ["A"] * int(n * 0.45) + ["B"] * int(n * 0.35) + ["C"] * int(n * 0.14)
    )
    rng.shuffle(type_schedule)
    type_schedule = type_schedule[:n]

    print(f"\nGenerating {n} synthetic documents (seed={seed})...")
    for idx, doc_type in enumerate(type_schedule):
        is_linked = idx < 11  # first 11 are linked set
        inject_error = rng.random() < ERROR_RATE
        quality_level = sample_quality(rng)
        doc_id = f"{doc_type.lower()}_{idx:06d}"

        try:
            if doc_type == "A":
                result = gen_khatauni(rng, fonts, doc_id, inject_error)
                if is_linked:
                    result["ground_truth"]["fields"]["village_code"] = linked_village_code
                    result["ground_truth"]["fields"]["village"] = linked_village_hi
                    result["ground_truth"]["linked_set"] = True
            elif doc_type == "B":
                result = gen_mutation(rng, fonts, doc_id, inject_error)
                if is_linked:
                    result["ground_truth"]["fields"]["village_code"] = linked_village_code
                    result["ground_truth"]["fields"]["village"] = linked_village_hi
                    # Use linked khasras
                    kn = rng.choice(linked_khasras)
                    result["ground_truth"]["fields"]["khasra_no"] = kn
                    result["ground_truth"]["linked_set"] = True
            else:  # C
                lk = linked_khasras if is_linked else None
                result = gen_cadastral_map(rng, fonts, doc_id, inject_error, linked_khasras=lk)
                if is_linked:
                    result["ground_truth"]["fields"]["village_code"] = linked_village_code
                    result["ground_truth"]["fields"]["village"] = linked_village_hi
                    result["ground_truth"]["linked_set"] = True

            clean_img = result["image"]
            degraded_img = degrade(clean_img.copy(), quality_level, rng)
            gt = result["ground_truth"]
            gt["quality_level"] = quality_level
            gt["has_injected_error"] = bool(gt["injected_errors"])

            # Save images
            clean_path = out_dir / f"{doc_id}_clean.png"
            degraded_path = out_dir / f"{doc_id}_degraded.png"
            clean_img.save(clean_path, "PNG")
            degraded_img.save(degraded_path, "PNG")

            # Save ground truth
            gt_path = GT_DIR / f"{doc_id}.json"
            with open(gt_path, "w", encoding="utf-8") as f:
                json.dump(gt, f, ensure_ascii=False, indent=2)

            doc_ids.append(doc_id)
            ground_truths.append(gt)

            if len(sample_images) < 20:
                thumb = degraded_img.resize((PAGE_W // 5, PAGE_H // 5))
                sample_images.append((thumb, doc_id, quality_level, doc_type))

            if (idx + 1) % 50 == 0:
                print(f"  {idx + 1}/{n} done...")

        except Exception as e:
            print(f"  [WARN] Failed to generate {doc_id}: {e}")
            continue

    # ── Train/val/test split (70/15/15) ────────────────────────────────────────
    rng2 = random.Random(seed + 1)
    rng2.shuffle(doc_ids)
    n_total = len(doc_ids)
    n_train = int(n_total * 0.70)
    n_val = int(n_total * 0.15)

    splits = {
        "train_pool": doc_ids[:n_train],
        "val": doc_ids[n_train:n_train + n_val],
        "test": doc_ids[n_train + n_val:],
        "total": n_total,
        "note": "Do NOT train on the test split. Test split is for final evaluation only.",
    }
    splits_path = out_dir / "splits.json"
    with open(splits_path, "w") as f:
        json.dump(splits, f, indent=2)
    print(f"\nSplits: train={len(splits['train_pool'])}, val={len(splits['val'])}, test={len(splits['test'])}")

    # ── Visual spot-check grid (docs/samples.png) ─────────────────────────────
    _save_sample_grid(sample_images, DOCS_DIR / "samples.png")

    # ── Summary ───────────────────────────────────────────────────────────────
    type_counts = {"A": 0, "B": 0, "C": 0}
    error_count = 0
    for gt in ground_truths:
        dt = gt["doc_type"][0].upper() if gt["doc_type"] != "cadastral_map" else "C"
        dt = {"K": "A", "M": "B", "C": "C"}.get(dt, "A")
        if gt["doc_type"] == "mutation":
            dt = "B"
        elif gt["doc_type"] == "cadastral_map":
            dt = "C"
        else:
            dt = "A"
        type_counts[dt] += 1
        if gt.get("has_injected_error"):
            error_count += 1

    print(f"\n[OK] Generated {n_total} documents")
    print(f"  Types: A(khatauni)={type_counts['A']}, B(mutation)={type_counts['B']}, C(map)={type_counts['C']}")
    print(f"  With injected errors: {error_count} ({100*error_count/max(1,n_total):.1f}%)")
    print(f"  Saved to: {out_dir}")
    print(f"  Ground truth: {GT_DIR}")
    print(f"  Splits: {splits_path}")
    print(f"  Sample grid: {DOCS_DIR / 'samples.png'}")

    return doc_ids, ground_truths, splits


def _save_sample_grid(samples: list, out_path: Path):
    if not samples:
        return
    cols = 4
    rows = math.ceil(len(samples) / cols)
    tw, th = samples[0][0].size
    grid = Image.new("RGB", (cols * tw + (cols - 1) * 4, rows * (th + 30) + 10), (200, 200, 200))
    draw = ImageDraw.Draw(grid)
    for i, (thumb, doc_id, quality, dtype) in enumerate(samples):
        col = i % cols
        row = i // cols
        x = col * (tw + 4)
        y = row * (th + 30)
        grid.paste(thumb, (x, y))
        label = f"{dtype} {quality[:3]}"
        draw.text((x + 2, y + th + 2), label, fill=(40, 40, 40))
    grid.save(out_path, "PNG")
    print(f"  Sample grid saved: {out_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="BhuLekh-AI Synthetic Document Generator")
    parser.add_argument("--n", type=int, default=300, help="Number of documents to generate")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    parser.add_argument("--out", type=str, default=None, help="Output directory")
    args = parser.parse_args()

    out = Path(args.out) if args.out else None
    generate_all(n=args.n, seed=args.seed, out_dir=out)
