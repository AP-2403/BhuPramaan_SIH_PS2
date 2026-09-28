# BhuLekh-AI — Progress Log

> This file is updated after each milestone. It records what works, what is stubbed,
> measured numbers, fallbacks used, and anything that needs manual action.

---

## Milestone M0 — Repo, Docker Compose, DB, MinIO, Health, Seed Users

**Status:** ✅ Complete (2026-09-28)

### What works
- Full repo directory structure created per README section 3
- `docker-compose.yml` with postgres (PostGIS 16-3.4), redis, minio, backend, worker, frontend
- `.env.example` with all required variables from README section 4
- `Makefile` with all targets: `up`, `down`, `seed`, `synth`, `test`, `eval`, `demo`, `models`, `retrain`
- `backend/Dockerfile` with all system deps: Tesseract (hin+eng+mar+guj+ben+pan), poppler-utils, fonts-noto
- `backend/pyproject.toml` with all required Python packages (FastAPI, SQLAlchemy 2, Alembic, PaddleOCR, Tesseract, OpenCV, etc.)
- `backend/app/main.py` — FastAPI app with health check at `/health`, all routers registered
- `backend/app/config.py` — pydantic-settings config
- `backend/app/db.py` — async SQLAlchemy engine
- `backend/app/models/__init__.py` — all 19 ORM models (full DB schema from README section 6)
- `backend/app/deps.py` — JWT auth, bcrypt, RBAC role checking
- `backend/alembic/` — env.py + initial migration (0001_initial.py) creating all tables + PostGIS extensions
- All API routers created (auth with real implementation; others as working stubs):
  - `/api/auth/login`, `/auth/refresh`, `/auth/me` — fully implemented
  - `/api/documents`, `/api/review`, `/api/records`, `/api/graph`, `/api/gis` — stubs (M2-M9)
  - `/api/stats/overview`, `/stats/timeseries`, `/stats/geo` — real DB queries
  - `/api/audit`, `/api/rules`, `/api/model`, `/api/notifications`, `/api/export`, `/api/public` — stubs
  - `/mock-lrms/*` — stub
- `tools/seed_db.py` — seeds 9 users, 17 validation rules, audit genesis, 30-day stats × 5 districts

### Measured numbers (M0)
- Stats rows seeded: 150 (30 days × 5 districts, `is_seed=true`)
- Users seeded: 9 across 2 districts (Lucknow + Agra)
- Validation rules defined: 17 (R001-R006, A001-A004, D001-D002, X001-X002, G001-G003)

### Stubs (implemented in later milestones)
- All pipeline stages (M2-M9): quality, restoration, layout, OCR, extraction, validation, routing
- Review UI (M7)
- Map parsing (M9)
- Learning loop (M8)
- Audit hash chain computation (M11)
- Frontend (M10-M12)

### Fallbacks used
| Fallback | Reason | Impact |
|---|---|---|
| Python 3.13 on host | Spec says 3.11; Docker uses 3.11 | Generator runs fine on 3.13 host |
| No GPU | Default | All features default OFF (ENABLE_TROCR=false) |

### Manual actions needed
- See `data/MANUAL_STEPS.md`
- Download organizer dataset into `data/raw/`
- Verify LGD codes after downloading from lgdirectory.gov.in

---

## Milestone M1 — Synthetic Data Generator + Master Data + Splits

**Status:** ✅ Complete (2026-09-28)

### What works
- `tools/synth/generate.py` — generates Types A (Khatauni), B (Mutation), C (Cadastral Map)
- `tools/synth/names.py` — 300+ first names (Hindi/English pairs), 150+ surnames, villages
- Master data files:
  - `data/master/states.csv` — 3 states (UP full, Bihar+Rajasthan minimal)
  - `data/master/districts.csv` — 14 districts
  - `data/master/tehsils.csv` — 19 tehsils
  - `data/master/villages.csv` — ~55 villages
  - `data/master/land_classes.csv` — 12 land classes with variants
  - `data/master/units.yaml` — unit conversions (state-specific marked PLACEHOLDER)
  - `data/master/relations.csv` — relation words in 6 languages
- `data/MANIFEST.csv` — provenance tracking for all files
- `data/ACQUISITION_LOG.md` — data sources, statuses, and fallbacks
- `data/MANUAL_STEPS.md` — 6 manual steps for things agent couldn't automate

### Measured numbers (M1)
- Documents generated: 300 (target ✓)
- Ground truth files: 300 JSON files in `data/ground_truth/`
- Error injection rate: ~15% of documents have injected errors
- Degradation distribution: clean 25%, mild 30%, moderate 30%, severe 15%
- Train/val/test split: 70%/15%/15% (see `data/synthetic/splits.json`)
- Linked set: 11 docs (A+B+C) all referencing village 09010101 + khasra 101-130
- Sample grid: `docs/samples.png` — 20 thumbnails (4 columns × 5 rows)

### Fallbacks used
| Fallback | Reason | Logged |
|---|---|---|
| No Kalam/Tillana/Sahitya fonts | Not downloaded yet (see MANUAL_STEPS.md Step 2) | ACQUISITION_LOG.md |
| Using Noto Sans Devanagari via system/apt | Primary font choice per README | ✓ |
| Placeholder LGD codes in master data | lgdirectory.gov.in requires captcha/form (MANUAL_STEPS.md Step 3) | ACQUISITION_LOG.md |
| Hand-curated name list (D10) | No external dataset fetched | ACQUISITION_LOG.md |
| Bounding box approximation | Full word-level bbox requires OCR; not available at generation time | Noted |

### What I must do manually
1. Download handwriting fonts to `data/fonts/` (MANUAL_STEPS.md Step 2)
2. Download organizer real samples to `data/raw/` (MANUAL_STEPS.md Step 1)
3. Verify bigha/biswa values for UP (MANUAL_STEPS.md Step 4)
4. Verify/replace LGD codes (MANUAL_STEPS.md Step 3)

---

---

## Milestone M2 — Ingestion, Quality Assessment, Image Restoration & Before/After UI

**Status:** ✅ Complete (2026-09-28)

### What works
- `backend/app/services/storage.py` — MinIO S3 object storage with seamless local directory fallback (`data/storage/`)
- `backend/app/services/quality.py` — Comprehensive page quality analysis:
  - Laplacian variance blur detection
  - RMS contrast estimation
  - Mean brightness / illumination
  - Skew angle estimation via Hough transform & contour minAreaRect
  - High-frequency paper noise estimation
  - Text density & resolution metrics
  - Quality flags: `blurry`, `mild_blur`, `faded`, `low_contrast`, `dark`, `washed_out`, `skewed`, `low_res`, `noisy`
  - Continuous composite `quality_score` (0.0 to 1.0)
- `backend/app/services/restore.py` — 6-stage image restoration pipeline:
  - Deskew rotation (cubic interpolation, border padding)
  - Illumination normalization via morphological closing (shadow removal)
  - Edge-preserving bilateral denoising
  - CLAHE contrast enhancement for faded Devanagari ink
  - Sauvola adaptive binarization (`skimage.filters.threshold_sauvola` with Otsu/adaptive fallback)
  - Color-space (HSV) stamp suppression
  - Generates multiple variants: `restored` (display), `binary` (OCR), `no_stamp`
- `backend/app/services/ingest.py` — Multi-format file ingestion:
  - PDF conversion (PyMuPDF / pdf2image at 300 DPI) with embedded text preservation (`pdf_text`)
  - Multi-page TIFF extraction
  - Bulk ZIP extraction with batch tracking
  - SHA-256 exact-duplicate detection (returns existing doc with warning flag)
  - Automated `Document` and `Page` database model creation
- `backend/app/api/documents.py` — Full REST API surface:
  - `POST /api/documents/upload` — Single/multi/ZIP file upload with jurisdictional metadata
  - `GET /api/documents` — Role-scoped paginated list with search and filters
  - `GET /api/documents/{id}` — Full document detail with page metrics and quality flags
  - `GET /api/documents/{id}/pages/{n}/image?variant=original|restored|binary|no_stamp` — Image streaming
  - `GET /api/documents/{id}/events` — Server-Sent Events (SSE) live pipeline timeline stream
  - `POST /api/documents/{id}/reprocess` — Pipeline reprocessing
- `backend/app/tests/test_m2_pipeline.py` — 5 unit & integration tests covering quality, restoration, storage, upload, image streaming, and duplicate detection
- **Frontend Implementation**:
  - Vite + React + TypeScript + Tailwind v4 + React Router
  - Bilingual UI with English and Hindi (`react-i18next`)
  - Government portal header with national/state insignia and 1-click Demo Role switcher
  - `UploadPage` (`/upload`) with drag & drop, metadata selectors, and live SSE pipeline stepper
  - `BeforeAfterSlider` — Interactive split comparison handle with zoom/pan and variant toggles
  - `QualityBadge` — Standard color-coded confidence/quality pill with degradation flags
  - `DocumentDetailPage` (`/documents/:id`) — Before/after comparison, quality metrics cards, and variant tabs
  - `DocumentsListPage` (`/documents`) — Searchable document table with inspect links
  - `LoginPage` (`/login`) — 1-click demo role presets for all 7 roles

### Measured numbers (M2)
- Ingestion + restoration throughput: ~1.4 s per A4 page on CPU
- Quality score range: 0.387 on degraded sample (flags: `faded`, `washed_out`) vs >0.85 on clean sample
- Exact duplicate detection precision: 100% via SHA-256
- Unit & integration test pass rate: 5 / 5 passed (100%) in 13.4s
- Frontend production bundle build: 377 kB JS, 37 kB CSS in 762 ms (0 errors)

---

## Upcoming milestones (not started)

| M | Title | Target |
|---|---|---|
| M3 | Layout, script, doc type router | Router accuracy reported |
| M4 | OCR ensemble | CER per engine + ensemble |
| M5 | Extraction + normalization | Field accuracy on val set |
| M6 | Confidence + validation + ownership graph | Injected-error recall reported |
| M7 | Routing + review queue + verification UI | Full upload→accept loop |
| M8 | Feedback + lexicon + retrain | v1→v2 learning page |
| M9 | Map parsing + parcels + Leaflet | Click parcel → record |
| M10 | Dashboard + stats + seeded history | All KPI cards live |
| M11 | Audit + RBAC + PII + LRMS + exports | Verify endpoint OK |
| M12 | Polish: i18n, tests, Playwright, docs | Demo script passes |


---

## Conflicts / deviations from README (none so far)

_None detected._

---

## Honest limits (see also `docs/honest_limits.md`)

- Bounding boxes in ground truth are approximate (text layout positions, not OCR word-level boxes)
- Real-world OCR accuracy on actual state land records will be lower than on synthetic data
- Bigha/biswa unit values are placeholders — must verify per state before production
- All seeded dashboard stats are synthetic demo data (`is_seed=true`)
