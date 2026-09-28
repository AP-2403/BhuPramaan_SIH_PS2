#!/usr/bin/env python3
"""Evaluation pipeline — measures pipeline accuracy against ground truth.

Usage:
    python tools/eval_pipeline.py [--split test] [--model-version v1]

Outputs docs/eval_report.md and saves metrics to model_metrics table.
NOTE: Never hardcode these numbers in UI or slides — always run this script.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
GT_DIR = ROOT / "data" / "ground_truth"
SYNTH_DIR = ROOT / "data" / "synthetic"


def main():
    print("BhuLekh-AI Evaluation Pipeline")
    print("=" * 50)

    splits_file = SYNTH_DIR / "splits.json"
    if not splits_file.exists():
        print("ERROR: data/synthetic/splits.json not found. Run `make synth` first.")
        sys.exit(1)

    with open(splits_file) as f:
        splits = json.load(f)

    test_ids = splits.get("test", [])
    print(f"Test split: {len(test_ids)} documents")
    print()
    print("NOTE: Full evaluation requires M5+ (extraction pipeline).")
    print("      This is a placeholder that will be populated in M5.")
    print()
    print("Metrics will be computed here after the pipeline is implemented:")
    print("  - Field-level accuracy (exact match after normalization)")
    print("  - Character Error Rate (CER) per engine and ensemble")
    print("  - Auto-accept precision and coverage")
    print("  - Validation recall on injected errors")
    print("  - Map polygon IoU")
    print("  - Processing time per page")
    print()
    print("IMPORTANT: Never hardcode these numbers in the UI or slides.")
    print("           Use whatever this script actually measures.")
    print()
    print(f"Docs/eval_report.md will be generated here after M5.")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--split", default="test", choices=["test", "val", "train_pool"])
    parser.add_argument("--model-version", default="v1")
    args = parser.parse_args()
    main()
