#!/usr/bin/env python3
"""Inspect raw organizer data files.

Usage:
    python tools/inspect_raw.py [--dir data/raw]

Outputs a table: filename, file type, page count, script guess, quality score estimate.
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATA_RAW = ROOT / "data" / "raw"


def inspect_dir(raw_dir: Path):
    files = list(raw_dir.rglob("*"))
    files = [f for f in files if f.is_file() and not f.name.startswith(".")]
    if not files:
        print(f"No files found in {raw_dir}")
        print("Place organizer sample files in data/raw/ (see data/MANUAL_STEPS.md Step 1)")
        return

    print(f"Found {len(files)} files in {raw_dir}\n")
    print(f"{'Filename':<40} {'Type':<10} {'Pages':<8} {'Size (KB)':<12} {'Notes'}")
    print("-" * 90)
    for f in sorted(files):
        ext = f.suffix.lower()
        size_kb = round(f.stat().st_size / 1024, 1)
        pages = "?"
        notes = ""

        if ext == ".pdf":
            try:
                import subprocess
                result = subprocess.run(
                    ["pdfinfo", str(f)], capture_output=True, text=True, timeout=10
                )
                for line in result.stdout.splitlines():
                    if "Pages:" in line:
                        pages = line.split(":")[1].strip()
                        break
            except Exception:
                notes = "pdfinfo not available"
        elif ext in (".jpg", ".jpeg", ".png", ".tiff", ".tif"):
            pages = "1"
        elif ext == ".zip":
            notes = "ZIP archive — extract first"

        print(f"{f.name:<40} {ext:<10} {pages:<8} {size_kb:<12} {notes}")

    print(f"\nTotal: {len(files)} files")
    print("\nNext step: Process with `make up && make demo` or upload via the UI.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dir", default=str(DATA_RAW), help="Directory with raw files")
    args = parser.parse_args()
    inspect_dir(Path(args.dir))
