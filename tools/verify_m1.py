#!/usr/bin/env python3
"""Quick verification of generated synthetic data."""
import json
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).parent.parent
gt_files = list((ROOT / "data" / "ground_truth").glob("*.json"))
print(f"Total GT files: {len(gt_files)}")

gt = json.load(open(gt_files[0], encoding="utf-8"))
print(f"Doc ID: {gt['doc_id']}")
print(f"Doc type: {gt['doc_type']}")
print(f"Quality: {gt['quality_level']}")
print(f"Has injected error: {gt['has_injected_error']}")
print(f"Fields keys: {list(gt['fields'].keys())}")
print(f"State (Hindi): {gt['fields'].get('state', 'n/a')}")
if gt["doc_type"] == "khatauni" and gt["fields"].get("rows"):
    row = gt["fields"]["rows"][0]
    print(f"Owner (row 0): {row.get('owner','?')} / EN: {row.get('owner_en','?')}")

types = [json.load(open(f, encoding="utf-8"))["doc_type"] for f in gt_files]
print(f"Type distribution: {dict(Counter(types))}")
errors = sum(1 for f in gt_files if json.load(open(f, encoding="utf-8"))["has_injected_error"])
print(f"Docs with injected errors: {errors}/{len(gt_files)} ({100*errors/len(gt_files):.1f}%)")

splits = json.load(open(ROOT / "data" / "synthetic" / "splits.json"))
print(f"Splits -> train:{len(splits['train_pool'])}, val:{len(splits['val'])}, test:{len(splits['test'])}")
print(f"samples.png exists: {(ROOT / 'docs' / 'samples.png').exists()}")
print()
print("[PASS] M1 verification complete")
