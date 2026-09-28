"""Quality assessment service: computes blur, contrast, brightness, skew, noise, and flags."""
from __future__ import annotations

from typing import Dict, List, Optional, Tuple, TypedDict
import cv2
import numpy as np


class QualityMetrics(TypedDict):
    blur: float
    contrast: float
    brightness: float
    skew_angle: float
    noise: float
    width: int
    height: int
    text_density: float


class QualityAssessmentResult(TypedDict):
    quality_score: float
    flags: List[str]
    metrics: QualityMetrics
    is_acceptable: bool


def estimate_skew_angle(gray: np.ndarray) -> float:
    """Estimate skew angle of text lines in degrees using contour bounding rects and Hough lines."""
    try:
        # Downsample if image is too large for speed
        h, w = gray.shape[:2]
        scale = 1.0
        if max(h, w) > 1500:
            scale = 1500.0 / max(h, w)
            small = cv2.resize(gray, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
        else:
            small = gray.copy()

        # Invert and threshold text
        _, thresh = cv2.threshold(small, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

        # Detect lines using morphological horizontal kernel
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (25, 3))
        dilated = cv2.dilate(thresh, kernel, iterations=1)

        # Method 1: Minimum area bounding box of largest text contours
        contours, _ = cv2.findContours(dilated, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
        angles = []
        for c in contours:
            if cv2.contourArea(c) > 500:
                rect = cv2.minAreaRect(c)
                angle = rect[-1]
                # OpenCV minAreaRect returns angle in [-90, 0)
                if angle < -45:
                    angle = -(90 + angle)
                else:
                    angle = -angle
                if abs(angle) < 20:  # Ignore extreme outliers
                    angles.append(angle)

        if angles:
            median_angle = float(np.median(angles))
            return round(median_angle, 2)

        # Method 2: Hough line transform fallback
        edges = cv2.Canny(small, 50, 150, apertureSize=3)
        lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=100, minLineLength=100, maxLineGap=10)
        if lines is not None and len(lines) > 0:
            hough_angles = []
            for line in lines:
                x1, y1, x2, y2 = line[0]
                if x2 != x1:
                    deg = np.degrees(np.arctan2(y2 - y1, x2 - x1))
                    if abs(deg) < 20:
                        hough_angles.append(deg)
            if hough_angles:
                return round(float(np.median(hough_angles)), 2)

        return 0.0
    except Exception:
        return 0.0


def assess_quality(image: np.ndarray) -> QualityAssessmentResult:
    """Analyze image quality and produce score + flags.
    
    Args:
        image: BGR or Grayscale image numpy array.
        
    Returns:
        QualityAssessmentResult containing quality_score (0.0 to 1.0), flags, and detailed metrics.
    """
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image.copy()

    h, w = gray.shape[:2]

    # 1. Blur via variance of Laplacian
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())

    # 2. RMS Contrast
    contrast = float(gray.std())

    # 3. Brightness
    brightness = float(gray.mean())

    # 4. Skew angle
    skew_angle = estimate_skew_angle(gray)

    # 5. Noise estimation via high-frequency residual
    median_filtered = cv2.medianBlur(gray, 3)
    noise_residual = cv2.absdiff(gray, median_filtered)
    noise_estimate = float(noise_residual.std())

    # 6. Text density
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    text_density = float(np.count_nonzero(binary)) / float(h * w)

    # Determine degradation flags
    flags: List[str] = []
    
    # Blurry flag
    if laplacian_var < 80.0:
        flags.append("blurry")
    elif laplacian_var < 150.0:
        flags.append("mild_blur")

    # Faded / low contrast
    if contrast < 35.0:
        flags.append("faded")
    elif contrast < 45.0:
        flags.append("low_contrast")

    # Illumination flags
    if brightness < 65.0:
        flags.append("dark")
    elif brightness > 220.0:
        flags.append("washed_out")

    # Skewed flag
    if abs(skew_angle) >= 1.5:
        flags.append("skewed")

    # Low resolution
    if max(h, w) < 1200 or min(h, w) < 800:
        flags.append("low_res")

    # Noise flag
    if noise_estimate > 14.0:
        flags.append("noisy")

    # Composite continuous quality score (0.0 to 1.0)
    # Normalize components
    # Blur: 0 (var <= 30) to 1 (var >= 300)
    blur_score = float(np.clip((laplacian_var - 30.0) / 270.0, 0.0, 1.0))
    # Contrast: 0 (std <= 20) to 1 (std >= 65)
    contrast_score = float(np.clip((contrast - 20.0) / 45.0, 0.0, 1.0))
    # Brightness penalty: ideal range [120, 200]
    if brightness < 120:
        bright_score = float(np.clip(brightness / 120.0, 0.0, 1.0))
    elif brightness > 215:
        bright_score = float(np.clip((255.0 - brightness) / 40.0, 0.0, 1.0))
    else:
        bright_score = 1.0
    # Skew penalty: 0 to 5 deg
    skew_score = float(np.clip(1.0 - (abs(skew_angle) / 5.0), 0.0, 1.0))
    # Resolution score: ideal >= 1800 px on longest edge
    res_score = float(np.clip(max(h, w) / 2000.0, 0.3, 1.0))

    # Weighted combination
    raw_score = (
        0.30 * blur_score +
        0.25 * contrast_score +
        0.15 * bright_score +
        0.15 * skew_score +
        0.15 * res_score
    )

    # Penalize based on severe flags
    penalty = 0.0
    if "blurry" in flags:
        penalty += 0.20
    if "faded" in flags:
        penalty += 0.15
    if "dark" in flags or "washed_out" in flags:
        penalty += 0.15
    if "skewed" in flags:
        penalty += 0.10
    if "low_res" in flags:
        penalty += 0.15

    final_score = float(np.clip(raw_score - penalty, 0.05, 0.99))

    metrics: QualityMetrics = {
        "blur": round(laplacian_var, 1),
        "contrast": round(contrast, 1),
        "brightness": round(brightness, 1),
        "skew_angle": skew_angle,
        "noise": round(noise_estimate, 1),
        "width": w,
        "height": h,
        "text_density": round(text_density, 3),
    }

    return {
        "quality_score": round(final_score, 3),
        "flags": flags,
        "metrics": metrics,
        "is_acceptable": final_score >= 0.40,
    }
