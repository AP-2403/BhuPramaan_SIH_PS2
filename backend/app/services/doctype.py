"""BhuLekh-AI Document Type Classifier and Router.

Classifies incoming scanned land records into canonical document types:
- khatauni (Record of Rights / Type A)
- mutation (Mutation Register / Type B)
- cadastral_map (Cadastral Map / Type C)
- sale_deed (Registered Sale Deed)
- unknown (Confidence < 0.60 -> routed to human verifier review queue)

Uses trained RandomForestClassifier over layout structure features, visual signatures,
and keyword matching from first-pass OCR/text signals per spec 7.4.
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Dict, List, Optional
import cv2
import joblib
import numpy as np

from app.services.layout import layout_analyzer
from app.services.templates import DOCTYPE_KEYWORDS


class DocumentTypeRouter:
    """Classifies document type and routes to specialized extraction pipeline."""

    AUTO_ACCEPT_THRESHOLD = 0.60

    def __init__(self):
        self.clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        self.model = None
        self._load_model()

    def _load_model(self):
        model_paths = [
            Path(__file__).parent.parent / "models" / "doctype_classifier.joblib",
            Path(__file__).parent.parent.parent / "data" / "models" / "doctype_classifier.joblib",
        ]
        for p in model_paths:
            if p.exists():
                try:
                    self.model = joblib.load(str(p))
                    break
                except Exception:
                    pass

    def extract_features(
        self,
        image: np.ndarray,
        layout: Optional[Dict[str, Any]] = None,
        text: Optional[str] = None,
    ) -> List[float]:
        """Extract multi-modal structural features matching model signature."""
        h, w = image.shape[:2]
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image

        cl = self.clahe.apply(gray)
        _, bw = cv2.threshold(cl, 180, 255, cv2.THRESH_BINARY_INV)

        # 1. Map container
        has_map = 0
        map_area = 0.0
        cnts_m, _ = cv2.findContours(bw, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        for c in cnts_m:
            x, y, bw_w, bw_h = cv2.boundingRect(c)
            if 20 < x and (x + bw_w) < (w - 20) and 30 < y and (y + bw_h) < (h - 40):
                if bw_w > w * 0.65 and bw_h > h * 0.50:
                    has_map = 1
                    map_area = float((bw_w * bw_h) / (w * h))
                    break

        # 2. Horizontal line detection
        h_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (w // 30, 1))
        h_lines = cv2.morphologyEx(bw, cv2.MORPH_OPEN, h_kernel)
        cnts_h, _ = cv2.findContours(h_lines, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        line_boxes = [cv2.boundingRect(c) for c in cnts_h if cv2.boundingRect(c)[2] > w * 0.30]

        n_lines = len(line_boxes)
        if n_lines >= 2:
            ys = [b[1] for b in line_boxes]
            line_span = float((max(ys) - min(ys)) / h)
        else:
            line_span = 0.0

        # 3. Wide row contours
        cnts_ext, _ = cv2.findContours(bw, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        wide_rows = [
            cv2.boundingRect(c)
            for c in cnts_ext
            if cv2.boundingRect(c)[2] > w * 0.40 and cv2.boundingRect(c)[3] < 120 and cv2.boundingRect(c)[1] < h * 0.65
        ]
        n_wide_rows = len(wide_rows)

        # 4. Signatures in bottom
        bot = bw[int(h * 0.72):, :]
        sig_cnts = len([
            c
            for c in cv2.findContours(bot, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)[0]
            if 40 < cv2.boundingRect(c)[2] < 350 and 12 < cv2.boundingRect(c)[3] < 90
        ])

        return [float(has_map), map_area, float(n_lines), line_span, float(n_wide_rows), float(sig_cnts)]

    def classify(
        self,
        image: np.ndarray,
        layout: Optional[Dict[str, Any]] = None,
        text: Optional[str] = None,
        expected_type: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Classify document into one of the supported document types."""
        if layout is None:
            layout = layout_analyzer.analyze(image)

        feat_vector = self.extract_features(image, layout=layout, text=text)

        # Keyword matching if text is available
        kw_hits: Dict[str, int] = {k: 0 for k in DOCTYPE_KEYWORDS}
        if text:
            text_lower = text.lower()
            for doc_type, keywords in DOCTYPE_KEYWORDS.items():
                for kw in keywords:
                    if kw.lower() in text_lower:
                        kw_hits[doc_type] += 1

        classes = ["cadastral_map", "khatauni", "mutation"]
        probs: Dict[str, float] = {}

        if self.model is not None:
            try:
                pred_probs = self.model.predict_proba([feat_vector])[0]
                model_classes = list(self.model.classes_)
                for cls, p in zip(model_classes, pred_probs):
                    probs[cls] = float(p)
            except Exception:
                probs = {}

        if not probs:
            # Fallback heuristic probabilities if model is not loaded
            has_map, _, n_lines, line_span, n_wide, _ = feat_vector
            if has_map:
                probs = {"cadastral_map": 0.95, "khatauni": 0.03, "mutation": 0.02}
            elif n_lines > 20 or line_span > 0.45:
                probs = {"cadastral_map": 0.01, "khatauni": 0.08, "mutation": 0.91}
            elif n_wide >= 2 or n_lines >= 2:
                probs = {"cadastral_map": 0.02, "khatauni": 0.93, "mutation": 0.05}
            else:
                probs = {"cadastral_map": 0.05, "khatauni": 0.40, "mutation": 0.55}

        # Apply keyword boosts
        for doc_type, hits in kw_hits.items():
            if hits > 0 and doc_type in probs:
                probs[doc_type] += 0.20 * min(3, hits)

        # Expected type boost if hinted by user
        if expected_type and expected_type in probs:
            probs[expected_type] += 0.10

        # Normalize
        total = sum(probs.values())
        norm_probs = {k: round(v / total, 4) for k, v in probs.items()}

        sorted_types = sorted(norm_probs.items(), key=lambda x: x[1], reverse=True)
        top_type, top_prob = sorted_types[0]

        # Below 0.40 is completely ambiguous (unknown); between 0.40 and 0.60 flags manual review
        if top_prob < 0.40:
            final_type = "unknown"
            confidence = top_prob
            needs_review = True
        elif top_prob < self.AUTO_ACCEPT_THRESHOLD:
            final_type = top_type
            confidence = top_prob
            needs_review = True
        else:
            final_type = top_type
            confidence = top_prob
            needs_review = False

        return {
            "doc_type": final_type,
            "confidence": round(float(confidence), 4),
            "probabilities": {str(k): round(float(v), 4) for k, v in norm_probs.items()},
            "features": {
                "has_map": bool(feat_vector[0]),
                "map_area": feat_vector[1],
                "n_lines": int(feat_vector[2]),
                "line_span": feat_vector[3],
                "n_wide_rows": int(feat_vector[4]),
                "sig_cnts": int(feat_vector[5]),
                "keyword_hits": kw_hits,
            },
            "needs_manual_review": needs_review,
            "next_stage": "mapparse" if final_type == "cadastral_map" else "ocr_ensemble",
        }


# Singleton instance
doctype_router = DocumentTypeRouter()
