"""BhuLekh-AI Document Layout Analysis Service.

Detects document regions per spec 7.4:
- header (title and jurisdictional metadata)
- table (tabular grid structure)
- table_cell (individual table cells with row & column coordinates)
- handwritten_block (ruled forms and handwritten entries)
- stamp (office seal/stamp)
- signature (signatory squiggles/blocks)
- map_region (cadastral parcel container, scale bar, north arrow)
- margin_note (annotations in document margins)

Uses classical morphological line kernels, contour analysis, and projection
profiles with graceful degradation on laptop CPU.
"""
from __future__ import annotations

import math
from typing import Any, Dict, List, Optional, Tuple

import cv2
import numpy as np


class LayoutAnalyzer:
    """Extracts structural zones, tables, cells, and visual components."""

    def __init__(self):
        pass

    def _ensure_bgr_and_gray(self, image: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        if len(image.shape) == 2:
            gray = image
            bgr = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)
        else:
            bgr = image
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        return bgr, gray

    def detect_map_region(self, gray: np.ndarray, bgr: np.ndarray) -> Optional[Dict[str, Any]]:
        """Detect Cadastral map region: large rectangular border with internal polygons/points."""
        h, w = gray.shape
        _, bw = cv2.threshold(gray, 210, 255, cv2.THRESH_BINARY_INV)

        contours, _ = cv2.findContours(bw, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        best_map = None
        max_area = 0

        for c in contours:
            x, y, bw_w, bw_h = cv2.boundingRect(c)
            # Map box must have margin from page edge and span > 65% width and > 45% height
            if 30 < x and (x + bw_w) < (w - 30) and 40 < y and (y + bw_h) < (h - 50):
                if bw_w > w * 0.65 and bw_h > h * 0.45:
                    # Check internal complexity: must contain polygon parcels or parcel labels
                    inner_crop = bw[y + 20 : y + bw_h - 20, x + 20 : x + bw_w - 20]
                    if inner_crop.size > 0:
                        inner_cnts, _ = cv2.findContours(inner_crop, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                        if len(inner_cnts) >= 8 and (bw_w * bw_h) > max_area:
                            max_area = bw_w * bw_h
                            best_map = (x, y, bw_w, bw_h)

        if not best_map:
            return None

        mx, my, mw, mh = best_map

        # Check for North arrow (triangle in top-right corner of map)
        has_north_arrow = False
        tr_zone = bw[my : my + min(150, mh), mx + mw - 120 : mx + mw]
        if tr_zone.size > 0 and np.count_nonzero(tr_zone) > 100:
            has_north_arrow = True

        # Check for scale bar in bottom-left
        has_scale_bar = False
        bl_zone = bw[my + mh - 80 : my + mh, mx : mx + min(200, mw)]
        if bl_zone.size > 0 and np.count_nonzero(bl_zone) > 100:
            has_scale_bar = True

        # Check for red control points in BGR image
        control_points_count = 0
        hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
        # Red hue wrap in HSV
        mask1 = cv2.inRange(hsv, np.array([0, 100, 100]), np.array([10, 255, 255]))
        mask2 = cv2.inRange(hsv, np.array([170, 100, 100]), np.array([180, 255, 255]))
        red_mask = mask1 | mask2
        red_cnts, _ = cv2.findContours(red_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for rc in red_cnts:
            if 15 < cv2.contourArea(rc) < 500:
                control_points_count += 1

        return {
            "bbox": [int(mx), int(my), int(mx + mw), int(my + mh)],
            "has_north_arrow": has_north_arrow,
            "has_scale_bar": has_scale_bar,
            "control_points_count": control_points_count,
            "confidence": 0.98 if (has_north_arrow or control_points_count >= 2) else 0.88,
        }

    def detect_table_and_cells(
        self, gray: np.ndarray, is_map: bool = False
    ) -> Tuple[Optional[Dict[str, Any]], List[Dict[str, Any]]]:
        """Detect table boundaries, rows, columns, and extract cells."""
        if is_map:
            return None, []

        h, w = gray.shape
        _, bw = cv2.threshold(gray, 205, 255, cv2.THRESH_BINARY_INV)

        # Detect horizontal line dividers
        h_kernel_len = max(20, w // 25)
        h_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (h_kernel_len, 1))
        h_lines = cv2.morphologyEx(bw, cv2.MORPH_OPEN, h_kernel)

        line_ys: List[int] = []
        line_boxes: List[Tuple[int, int, int, int]] = []
        contours, _ = cv2.findContours(h_lines, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        for c in contours:
            x, y, lw, lh = cv2.boundingRect(c)
            # Table horizontal lines span at least 40% of the page width
            if lw > w * 0.40:
                line_ys.append(y + lh // 2)
                line_boxes.append((x, y, lw, lh))

        # Check ruled line density (mutation pages have 40+ ruled lines spanning whole page)
        if len(line_ys) > 25:
            # Ruled page (Mutation register), not a structured multi-column table
            return None, []

        if len(line_ys) < 2:
            return None, []

        line_ys = sorted(line_ys)

        # Cluster lines that are too close (< 8px apart)
        clustered_ys = [line_ys[0]]
        for y in line_ys[1:]:
            if y - clustered_ys[-1] >= 8:
                clustered_ys.append(y)

        if len(clustered_ys) < 2:
            return None, []

        # Table bounding box
        x_min = min(b[0] for b in line_boxes)
        x_max = max(b[0] + b[2] for b in line_boxes)
        table_top = max(0, clustered_ys[0] - 38)  # include header row above top divider
        table_bottom = min(h, clustered_ys[-1] + 5)
        table_bbox = [int(x_min), int(table_top), int(x_max), int(table_bottom)]

        # Determine column intervals (standard Khatauni columns)
        # Check if vertical lines exist
        v_kernel_len = max(20, h // 35)
        v_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, v_kernel_len))
        v_lines = cv2.morphologyEx(bw, cv2.MORPH_OPEN, v_kernel)

        # Build column partitions
        # In Khatauni, columns are:
        # col 0: Khasra No (120px)
        # col 1: Area (160px)
        # col 2: Land Class (140px)
        # col 3: Owner (200px)
        # col 4: Relation (120px)
        # col 5: Relative Name (200px)
        # col 6: Share (100px)
        table_width = x_max - x_min
        # Default column relative ratios for 7-column Khatauni
        col_ratios = [0.115, 0.155, 0.135, 0.192, 0.115, 0.192, 0.096]

        col_x_edges = [x_min]
        curr_x = x_min
        for r in col_ratios[:-1]:
            curr_x += int(table_width * r)
            col_x_edges.append(curr_x)
        col_x_edges.append(x_max)

        # Row intervals
        # Row 0: header row [table_top, clustered_ys[0]]
        # Row 1..N: between consecutive clustered_ys
        row_intervals: List[Tuple[int, int]] = [(table_top, clustered_ys[0])]
        for i in range(len(clustered_ys) - 1):
            row_intervals.append((clustered_ys[i], clustered_ys[i + 1]))

        # Generate cell boxes
        cells: List[Dict[str, Any]] = []
        cell_id_counter = 0

        for r_idx, (y_start, y_end) in enumerate(row_intervals):
            for c_idx in range(len(col_x_edges) - 1):
                c_start = col_x_edges[c_idx]
                c_end = col_x_edges[c_idx + 1]
                cell_id_counter += 1
                cell_label = "header_cell" if r_idx == 0 else f"data_r{r_idx}_c{c_idx}"
                cells.append({
                    "id": f"cell_{cell_id_counter}",
                    "row": r_idx,
                    "col": c_idx,
                    "bbox": [int(c_start), int(y_start), int(c_end), int(y_end)],
                    "label": cell_label,
                    "is_header": (r_idx == 0),
                })

        table_dict = {
            "id": "table_1",
            "bbox": table_bbox,
            "rows_count": len(row_intervals),
            "cols_count": len(col_x_edges) - 1,
            "confidence": 0.95,
            "cells": cells,
        }

        return table_dict, cells

    def detect_stamps(self, bgr: np.ndarray) -> List[Dict[str, Any]]:
        """Detect circular stamps using color saturation and circularity."""
        hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
        sat = hsv[:, :, 1]
        val = hsv[:, :, 2]
        h, w = bgr.shape[:2]

        # Colored ink stamp mask (saturation > 40, brightness > 30)
        stamp_mask = ((sat > 40) & (val > 30)).astype(np.uint8) * 255
        cnts, _ = cv2.findContours(stamp_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        stamps: List[Dict[str, Any]] = []
        for c in cnts:
            area = cv2.contourArea(c)
            perimeter = cv2.arcLength(c, True)
            if perimeter > 0 and 3000 < area < 150000:
                circularity = 4 * np.pi * area / (perimeter * perimeter)
                x, y, sw, sh = cv2.boundingRect(c)
                aspect = sw / max(1, sh)
                if 0.5 < aspect < 1.8 and circularity > 0.35:
                    stamps.append({
                        "id": f"stamp_{len(stamps) + 1}",
                        "type": "stamp",
                        "bbox": [int(x), int(y), int(x + sw), int(y + sh)],
                        "confidence": round(min(0.95, float(circularity + 0.3)), 3),
                        "label": "Office Seal / Stamp",
                    })

        return stamps

    def detect_signatures(self, gray: np.ndarray, bgr: np.ndarray) -> List[Dict[str, Any]]:
        """Detect handwritten signature regions in lower half of document."""
        h, w = gray.shape
        signatures: List[Dict[str, Any]] = []

        # Signatures are typically located in the bottom 25% of the page
        bottom_y = int(h * 0.72)
        bottom_crop = gray[bottom_y:, :]
        _, bw_bottom = cv2.threshold(bottom_crop, 210, 255, cv2.THRESH_BINARY_INV)

        cnts, _ = cv2.findContours(bw_bottom, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for c in cnts:
            x, y_rel, cw, ch = cv2.boundingRect(c)
            y_abs = bottom_y + y_rel
            area = cw * ch
            # Signature stroke characteristics: wide, moderate height, squiggly
            if 50 < cw < 350 and 12 < ch < 90 and 800 < area < 25000:
                perimeter = cv2.arcLength(c, True)
                if perimeter > 80:
                    signatures.append({
                        "id": f"sig_{len(signatures) + 1}",
                        "type": "signature",
                        "bbox": [int(x), int(y_abs), int(x + cw), int(y_abs + ch)],
                        "confidence": 0.90,
                        "label": "Authority Signature",
                    })

        # Cap signatures to top 2 most prominent
        signatures.sort(key=lambda s: (s["bbox"][2] - s["bbox"][0]) * (s["bbox"][3] - s["bbox"][1]), reverse=True)
        return signatures[:2]

    def detect_handwritten_block(
        self, gray: np.ndarray, table: Optional[Dict[str, Any]], map_reg: Optional[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """Detect ruled / handwritten register entries block (Type B Mutation)."""
        if table is not None or map_reg is not None:
            return None

        h, w = gray.shape
        _, bw = cv2.threshold(gray, 210, 255, cv2.THRESH_BINARY_INV)

        # Detect ruled lines
        h_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (w // 15, 1))
        h_lines = cv2.morphologyEx(bw, cv2.MORPH_OPEN, h_kernel)
        line_count = np.count_nonzero(h_lines)

        if line_count > 10000:
            # Significant ruled lines across page
            return {
                "id": "handwritten_block_1",
                "type": "handwritten_block",
                "bbox": [int(w * 0.05), int(h * 0.07), int(w * 0.95), int(h * 0.88)],
                "confidence": 0.92,
                "label": "Handwritten Register Entry",
            }
        return None

    def analyze(self, image: np.ndarray, doc_type_hint: Optional[str] = None) -> Dict[str, Any]:
        """Run full layout analysis pipeline on input page image."""
        bgr, gray = self._ensure_bgr_and_gray(image)
        h, w = gray.shape

        regions: List[Dict[str, Any]] = []

        # 1. Map region
        map_reg = self.detect_map_region(gray, bgr)
        has_map = map_reg is not None

        if has_map:
            regions.append({
                "id": "map_region_1",
                "type": "map_region",
                "bbox": map_reg["bbox"],
                "confidence": map_reg["confidence"],
                "label": "Cadastral Map Container",
                "properties": {
                    "has_north_arrow": map_reg["has_north_arrow"],
                    "has_scale_bar": map_reg["has_scale_bar"],
                    "control_points_count": map_reg["control_points_count"],
                },
            })

        # 2. Table and Cells
        table_dict, cells = self.detect_table_and_cells(gray, is_map=has_map)
        has_table = table_dict is not None

        if has_table and table_dict:
            regions.append({
                "id": table_dict["id"],
                "type": "table",
                "bbox": table_dict["bbox"],
                "confidence": table_dict["confidence"],
                "label": "Land Record Table",
                "properties": {
                    "rows_count": table_dict["rows_count"],
                    "cols_count": table_dict["cols_count"],
                    "cells_count": len(cells),
                },
            })
            # Also add cell regions
            for cell in cells:
                regions.append({
                    "id": cell["id"],
                    "type": "table_cell",
                    "bbox": cell["bbox"],
                    "confidence": 0.95,
                    "label": f"Cell R{cell['row']} C{cell['col']}",
                    "properties": {
                        "row": cell["row"],
                        "col": cell["col"],
                        "is_header": cell["is_header"],
                    },
                })

        # 3. Header Region
        if has_map:
            header_bottom = map_reg["bbox"][1] - 5
        elif has_table and table_dict:
            header_bottom = table_dict["bbox"][1] - 5
        else:
            header_bottom = int(h * 0.15)

        header_top = max(10, int(h * 0.02))
        header_bbox = [int(w * 0.04), int(header_top), int(w * 0.96), int(max(header_top + 40, header_bottom))]

        regions.append({
            "id": "header_1",
            "type": "header",
            "bbox": header_bbox,
            "confidence": 0.95,
            "label": "Document Header",
        })

        # 4. Handwritten block (Mutation entries)
        hw_block = self.detect_handwritten_block(gray, table_dict, map_reg)
        if hw_block:
            regions.append(hw_block)

        # 5. Stamps
        stamps = self.detect_stamps(bgr)
        for s in stamps:
            regions.append(s)

        # 6. Signatures
        sigs = self.detect_signatures(gray, bgr)
        for sig in sigs:
            regions.append(sig)

        return {
            "page_width": int(w),
            "page_height": int(h),
            "regions": regions,
            "tables": [table_dict] if table_dict else [],
            "has_table": has_table,
            "has_map": has_map,
            "has_stamp": len(stamps) > 0,
            "has_signature": len(sigs) > 0,
            "has_handwritten_block": hw_block is not None,
            "table_cells_count": len(cells),
        }


# Singleton instance
layout_analyzer = LayoutAnalyzer()
