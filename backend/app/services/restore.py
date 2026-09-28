"""Image restoration pipeline: deskew, illumination correction, denoise, CLAHE, Sauvola binarization, stamp suppression."""
from __future__ import annotations

from typing import Dict, Optional, Tuple, TypedDict
import cv2
import numpy as np

from app.services.quality import estimate_skew_angle


class RestorationResult(TypedDict):
    restored: np.ndarray        # Color/gray enhanced image for display
    binary: np.ndarray          # 1-bit crisp binary image for OCR
    no_stamp: np.ndarray        # Stamp-suppressed image
    rotation_deg: float         # Applied rotation angle
    steps_applied: list[str]    # List of steps run


def deskew_image(image: np.ndarray, angle: Optional[float] = None) -> Tuple[np.ndarray, float]:
    """Rotate image by negative skew angle with high-quality cubic interpolation and white background padding."""
    if angle is None:
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        angle = estimate_skew_angle(gray)

    if abs(angle) < 0.2:
        return image, 0.0

    h, w = image.shape[:2]
    center = (w / 2.0, h / 2.0)
    rot_mat = cv2.getRotationMatrix2D(center, angle, 1.0)

    # Compute new bounding dimensions so corners aren't clipped
    cos = np.abs(rot_mat[0, 0])
    sin = np.abs(rot_mat[0, 1])
    new_w = int((h * sin) + (w * cos))
    new_h = int((h * cos) + (w * sin))

    rot_mat[0, 2] += (new_w / 2.0) - center[0]
    rot_mat[1, 2] += (new_h / 2.0) - center[1]

    # White border value
    border_val = (255, 255, 255) if len(image.shape) == 3 else 255
    rotated = cv2.warpAffine(
        image,
        rot_mat,
        (new_w, new_h),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=border_val,
    )
    return rotated, angle


def normalize_illumination(image: np.ndarray, kernel_size: int = 51) -> np.ndarray:
    """Remove shadows and uneven gradient illumination using morphological background division."""
    is_color = len(image.shape) == 3
    if is_color:
        # Process in LAB color space (luminance channel only)
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l_channel, a_channel, b_channel = cv2.split(lab)
        target = l_channel
    else:
        target = image

    # Morphological closing to estimate smooth background illumination
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel_size, kernel_size))
    background = cv2.morphologyEx(target, cv2.MORPH_CLOSE, kernel)

    # Avoid division by zero
    background = np.maximum(background, 1)

    # Division normalization: (target / background) * 255
    normalized = np.clip((target.astype(np.float32) / background.astype(np.float32)) * 255.0, 0, 255).astype(np.uint8)

    if is_color:
        merged = cv2.merge([normalized, a_channel, b_channel])
        return cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)
    return normalized


def denoise_image(image: np.ndarray) -> np.ndarray:
    """Edge-preserving bilateral or median filter to remove sensor noise and paper specks."""
    if len(image.shape) == 3:
        return cv2.bilateralFilter(image, d=7, sigmaColor=50, sigmaSpace=50)
    return cv2.bilateralFilter(image, d=7, sigmaColor=50, sigmaSpace=50)


def enhance_contrast_clahe(image: np.ndarray, clip_limit: float = 2.0, tile_grid_size: Tuple[int, int] = (8, 8)) -> np.ndarray:
    """Enhance contrast with CLAHE for faded ink without blowing out highlights."""
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)
    if len(image.shape) == 3:
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        l_enhanced = clahe.apply(l)
        enhanced_lab = cv2.merge([l_enhanced, a, b])
        return cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)
    return clahe.apply(image)


def binarize_sauvola(gray_image: np.ndarray, window_size: int = 31, k: float = 0.2) -> np.ndarray:
    """Sauvola adaptive binarization, the gold standard for degraded historical and land records."""
    if len(gray_image.shape) == 3:
        gray = cv2.cvtColor(gray_image, cv2.COLOR_BGR2GRAY)
    else:
        gray = gray_image.copy()

    try:
        from skimage.filters import threshold_sauvola
        # Ensure window size is odd
        if window_size % 2 == 0:
            window_size += 1
        thresh = threshold_sauvola(gray, window_size=window_size, k=k)
        binary = (gray > thresh).astype(np.uint8) * 255
        return binary
    except Exception:
        # Robust fallback: adaptive Gaussian threshold
        return cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 10
        )


def suppress_stamps(image: np.ndarray) -> np.ndarray:
    """Suppress circular red/blue/purple ink stamps that overlap Hindi text."""
    if len(image.shape) != 3:
        return image.copy()

    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    # Red stamp masks (two hue ranges in HSV)
    lower_red1 = np.array([0, 50, 50])
    upper_red1 = np.array([10, 255, 255])
    lower_red2 = np.array([160, 50, 50])
    upper_red2 = np.array([180, 255, 255])
    mask_red1 = cv2.inRange(hsv, lower_red1, upper_red1)
    mask_red2 = cv2.inRange(hsv, lower_red2, upper_red2)

    # Blue/purple stamp mask
    lower_blue = np.array([100, 50, 50])
    upper_blue = np.array([140, 255, 255])
    mask_blue = cv2.inRange(hsv, lower_blue, upper_blue)

    stamp_mask = cv2.bitwise_or(cv2.bitwise_or(mask_red1, mask_red2), mask_blue)

    # Only suppress if stamp mask has reasonable coverage
    if np.count_nonzero(stamp_mask) > 100:
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        dilated_mask = cv2.dilate(stamp_mask, kernel, iterations=1)
        # Inpaint or replace with paper background
        cleaned = cv2.inpaint(image, dilated_mask, inpaintRadius=3, flags=cv2.INPAINT_TELEA)
        return cleaned
    return image.copy()


def restore_document_image(
    image: np.ndarray,
    enable_deskew: bool = True,
    enable_illumination: bool = True,
    enable_denoise: bool = True,
    enable_clahe: bool = True,
    enable_sauvola: bool = True,
    enable_stamp_suppress: bool = True,
) -> RestorationResult:
    """Execute complete restoration pipeline and produce multiple output variants.
    
    Args:
        image: Original input image (BGR numpy array).
        
    Returns:
        RestorationResult with:
        - restored: enhanced color image for display and verification UI before/after slider
        - binary: Sauvola 1-bit binary image for printed OCR engine
        - no_stamp: stamp suppressed variant
        - rotation_deg: skew angle corrected
        - steps_applied: list of executed stages
    """
    current = image.copy()
    steps_applied: list[str] = []
    rotation_deg = 0.0

    # 1. Deskew
    if enable_deskew:
        current, rotation_deg = deskew_image(current)
        if abs(rotation_deg) >= 0.2:
            steps_applied.append(f"deskew({rotation_deg}°)")

    # 2. Illumination normalization (shadow removal)
    if enable_illumination:
        current = normalize_illumination(current)
        steps_applied.append("illumination_norm")

    # 3. Denoising
    if enable_denoise:
        current = denoise_image(current)
        steps_applied.append("denoise")

    # 4. CLAHE contrast enhancement
    if enable_clahe:
        current = enhance_contrast_clahe(current)
        steps_applied.append("clahe_enhance")

    restored_display = current.copy()

    # 5. Sauvola binarization for OCR
    if enable_sauvola:
        binary = binarize_sauvola(current)
        steps_applied.append("sauvola_binary")
    else:
        if len(current.shape) == 3:
            gray = cv2.cvtColor(current, cv2.COLOR_BGR2GRAY)
        else:
            gray = current
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # 6. Stamp suppression
    no_stamp = current.copy()
    if enable_stamp_suppress and len(image.shape) == 3:
        no_stamp = suppress_stamps(current)
        steps_applied.append("stamp_suppress")

    return {
        "restored": restored_display,
        "binary": binary,
        "no_stamp": no_stamp,
        "rotation_deg": rotation_deg,
        "steps_applied": steps_applied,
    }
