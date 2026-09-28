#!/usr/bin/env python3
"""Seed the database with users, master data, validation rules, and demo stats.

Usage:
    python tools/seed_db.py          # seed (idempotent)
    python tools/seed_db.py --reset  # wipe processing_stats + documents, then re-seed
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

import uuid
from datetime import date, timedelta
from pathlib import Path


# Add backend to path so we can import app modules
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

import sqlalchemy as sa
from passlib.context import CryptContext
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

from app.config import settings

import bcrypt


def _get_sync_url():
    url = settings.DATABASE_URL_SYNC
    if url.startswith("sqlite"):
        return url
    try:
        from urllib.parse import urlparse
        import socket
        parsed = urlparse(url)
        hostname = parsed.hostname
        if hostname and hostname not in ("localhost", "127.0.0.1"):
            socket.gethostbyname(hostname)
        return url
    except Exception:
        db_path = Path(__file__).resolve().parent.parent / "data" / "bhulekh.db"
        db_path.parent.mkdir(parents=True, exist_ok=True)
        return f"sqlite:///{db_path}"


DB_URL = _get_sync_url()
engine = create_engine(DB_URL, pool_pre_ping=True)
if DB_URL.startswith("sqlite"):
    from app.db import Base
    import app.models  # noqa: F401
    Base.metadata.create_all(engine)

DATA_DIR = Path(__file__).parent.parent / "data"
SEEDS_DIR = DATA_DIR / "seeds"


def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8")[:72], bcrypt.gensalt()).decode("utf-8")




SEED_USERS = [
    {"username": "admin",           "full_name": "Admin User",           "role": "admin",           "state": "09", "district": None,    "tehsil": None},
    {"username": "state_officer",   "full_name": "State Officer UP",     "role": "state_officer",   "state": "09", "district": None,    "tehsil": None},
    {"username": "district_officer","full_name": "District Officer LKO", "role": "district_officer","state": "09", "district": "0901",  "tehsil": None},
    {"username": "tehsil_operator", "full_name": "Tehsil Operator LKO",  "role": "tehsil_operator", "state": "09", "district": "0901",  "tehsil": "090101"},
    {"username": "verifier",        "full_name": "Verifier LKO",         "role": "verifier",        "state": "09", "district": "0901",  "tehsil": None},
    {"username": "auditor",         "full_name": "Auditor",              "role": "auditor",         "state": "09", "district": None,    "tehsil": None},
    {"username": "citizen",         "full_name": "Demo Citizen",         "role": "citizen",         "state": "09", "district": None,    "tehsil": None},
    # Second district (Agra)
    {"username": "do_agra",         "full_name": "District Officer AGR", "role": "district_officer","state": "09", "district": "0902",  "tehsil": None},
    {"username": "op_agra",         "full_name": "Operator AGR",         "role": "tehsil_operator", "state": "09", "district": "0902",  "tehsil": "090201"},
]

VALIDATION_RULES = [
    {"id": "R001", "description": "Khasra/survey number matches allowed pattern (digits, slash, sub-plot letter)", "severity": "error", "category": "range"},
    {"id": "R002", "description": "Village/tehsil/district codes exist in master data and hierarchy is consistent", "severity": "error", "category": "range"},
    {"id": "R003", "description": "Area > 0 and below plausible maximum for a single plot", "severity": "error", "category": "range"},
    {"id": "R004", "description": "Land class in canonical list", "severity": "warning", "category": "range"},
    {"id": "R005", "description": "Required fields present for the document type", "severity": "error", "category": "range"},
    {"id": "R006", "description": "Dates valid, not in the future, in chronological order", "severity": "error", "category": "range"},
    {"id": "A001", "description": "Sum of area components equals total (tolerance 1%)", "severity": "error", "category": "arithmetic"},
    {"id": "A002", "description": "Co-owner shares sum to 1 for each khasra", "severity": "error", "category": "arithmetic"},
    {"id": "A003", "description": "Sum of sub-plots ≤ parent khasra area", "severity": "warning", "category": "arithmetic"},
    {"id": "A004", "description": "Area transferred in mutation ≤ seller current area", "severity": "error", "category": "arithmetic"},
    {"id": "D001", "description": "Duplicate khasra within a khata or same khasra with identical owners in another record", "severity": "error", "category": "duplicate"},
    {"id": "D002", "description": "Near-duplicate document (perceptual hash + field similarity)", "severity": "warning", "category": "duplicate"},
    {"id": "X001", "description": "Cross-database: khasra exists in mock LRMS and owner fuzzy-matches (≥0.8)", "severity": "warning", "category": "cross"},
    {"id": "X002", "description": "Record area vs map polygon area differs ≤ 10%", "severity": "warning", "category": "cross"},
    {"id": "G001", "description": "Ownership chain: mutation old_owner = current owner in graph", "severity": "error", "category": "graph"},
    {"id": "G002", "description": "No plot has two conflicting current owners", "severity": "error", "category": "graph"},
    {"id": "G003", "description": "Chain continuity: no cycles, no orphan transfers", "severity": "warning", "category": "graph"},
]

# Districts for seeded stats
DISTRICTS = [
    ("09", "0901"),  # UP, Lucknow
    ("09", "0902"),  # UP, Agra
    ("09", "0903"),  # UP, Varanasi
    ("09", "0904"),  # UP, Kanpur
    ("09", "0905"),  # UP, Prayagraj
]


def seed_users(session: Session):
    from app.models import User
    print("  → Seeding users...")
    for u in SEED_USERS:
        existing = session.execute(sa.select(User).where(User.username == u["username"])).scalar_one_or_none()
        if existing:
            print(f"    [SKIP] {u['username']} already exists")
            continue
        user = User(
            id=str(uuid.uuid4()),
            username=u["username"],
            password_hash=hash_pw("Demo@1234"),
            full_name=u["full_name"],
            role=u["role"],
            state_code=u["state"],
            district_code=u["district"],
            tehsil_code=u["tehsil"],
            is_active=True,
        )
        session.add(user)
        print(f"    [OK]   {u['username']} ({u['role']})")
    session.commit()
    print(f"  → {len(SEED_USERS)} user records ensured.")


def seed_validation_rules(session: Session):
    from app.models import ValidationRule
    print("  → Seeding validation rules...")
    for r in VALIDATION_RULES:
        existing = session.get(ValidationRule, r["id"])
        if existing:
            continue
        rule = ValidationRule(**r, enabled=True)
        session.add(rule)
    session.commit()
    print(f"  → {len(VALIDATION_RULES)} validation rules ensured.")


def seed_audit_log_genesis(session: Session):
    """Write the genesis entry for the audit hash chain."""
    import hashlib
    import json
    from app.models import AuditLog

    existing = session.execute(sa.select(AuditLog).limit(1)).scalar_one_or_none()
    if existing:
        return
    genesis_payload = {"event": "system_genesis", "note": "BhuLekh-AI audit chain start"}
    genesis_json = json.dumps(genesis_payload, sort_keys=True, ensure_ascii=False)
    hash_val = hashlib.sha256(("" + genesis_json).encode()).hexdigest()
    entry = AuditLog(
        actor=None,
        action="genesis",
        entity_type="system",
        entity_id="0",
        payload=genesis_payload,
        prev_hash="",
        hash=hash_val,
    )
    session.add(entry)
    session.commit()
    print("  → Audit chain genesis written.")


def seed_processing_stats(session: Session, reset: bool = False):
    from app.models import ProcessingStat
    import random
    random.seed(42)

    if reset:
        session.execute(sa.delete(ProcessingStat).where(ProcessingStat.is_seed == True))
        session.commit()
        print("  → Cleared seeded processing stats.")

    print("  → Seeding 30-day processing stats (demo data)...")
    today = date.today()
    inserted = 0
    for day_offset in range(29, -1, -1):
        d = today - timedelta(days=day_offset)
        for state_code, district_code in DISTRICTS:
            existing = session.execute(
                sa.select(ProcessingStat).where(
                    ProcessingStat.day == d,
                    ProcessingStat.state_code == state_code,
                    ProcessingStat.district_code == district_code,
                )
            ).scalar_one_or_none()
            if existing:
                continue
            docs = random.randint(10, 80)
            accepted = random.randint(int(docs * 0.6), int(docs * 0.9))
            review = docs - accepted
            stat = ProcessingStat(
                day=d,
                state_code=state_code,
                district_code=district_code,
                docs_processed=docs,
                docs_accepted=accepted,
                docs_review=review,
                field_accuracy=round(random.uniform(0.78, 0.96), 3),
                avg_confidence=round(random.uniform(0.72, 0.94), 3),
                is_seed=True,
            )
            session.add(stat)
            inserted += 1
    session.commit()
    print(f"  → {inserted} stat rows added (is_seed=True, demo data badge will show in UI).")


def main(reset: bool = False):
    print("=" * 60)
    print("BhuLekh-AI Database Seed Script")
    print("=" * 60)
    print(f"DB: {DB_URL}")

    # Import models to register them
    from app.models import (  # noqa: F401
        User, Document, Page, Extraction, Field, ValidationResult,
        ReviewTask, Correction, Parcel, LandRecord, Person, OwnershipEdge,
        AuditLog, Lexicon, ModelMetric, ProcessingStat, Notification,
        ValidationRule, LrmsRecord,
    )

    with Session(engine) as session:
        seed_users(session)
        seed_validation_rules(session)
        seed_audit_log_genesis(session)
        seed_processing_stats(session, reset=reset)

    print()
    print("✓ Seeding complete.")
    print()
    print("Demo credentials (DEV ONLY — password Demo@1234 for all):")
    for u in SEED_USERS:
        print(f"  {u['username']:20s} → {u['role']}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true", help="Clear seeded demo data before re-seeding")
    args = parser.parse_args()
    main(reset=args.reset)
