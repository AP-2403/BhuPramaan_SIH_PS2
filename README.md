# BhuLekh-AI: Intelligent Land Record Digitization and Validation System (Prototype)

> **Instructions to the coding agent:** Build this entire project from scratch, end to end, so that the demo flow in section 16 runs without manual intervention. Work in the milestone order in section 15. After each milestone, run the listed checks before moving on. Where a model or download is unavailable, use the stated **fallback**. Never leave a screen or endpoint half-built: a working simple version beats a broken advanced one.

---

## 1. Goal

Build a working web application that:

1. Accepts scanned land records (PDF/JPG/PNG/TIFF, single or bulk ZIP).
2. Restores image quality, detects layout, and identifies document type and script.
3. Runs **two OCR engines** and combines them by voting.
4. Extracts and normalizes structured land fields (owner, khata, khasra, area, village, etc.).
5. Assigns a **field-level confidence score** and runs **validation** (rules, arithmetic, master data, duplicates, ownership chain).
6. Routes records to **auto-accept** or a **human review queue** (verifier UI shows the source image with highlighted regions).
7. Stores corrections and uses them for a **learning loop** that measurably improves accuracy.
8. Links records to **map parcels** (PostGIS + Leaflet).
9. Provides **dashboards**, **RBAC**, **hash-chained audit trail**, and **REST APIs** including a mock LRMS/DILRMP endpoint.

It is a hackathon prototype for a demo video. Prioritize the visible end-to-end loop, and be honest in the UI and docs about what is real and what is simulated (section 14).

---

## 2. Technology decisions (fixed, do not re-debate)

| Area | Choice | Notes |
|---|---|---|
| Backend | Python 3.11, FastAPI, Pydantic v2, SQLAlchemy 2 + Alembic | REST, OpenAPI docs at `/docs` |
| Queue | Celery + Redis | RabbitMQ not needed |
| DB | PostgreSQL 16 + PostGIS 3 | Records, geometry, audit, graph tables |
| Object storage | MinIO (S3 API) | Originals, restored images, crops |
| Search | Postgres `pg_trgm` + full-text | Skip Elasticsearch |
| CV | OpenCV, scikit-image, NumPy, Pillow | Restoration, contours, map parsing |
| Layout detection | **Primary:** classical CV + PaddleOCR layout/table (PP-Structure). **Optional:** YOLOv8 fine-tuned on synthetic data | Detectron2 is a roadmap item |
| OCR engine A | PaddleOCR (Hindi/Devanagari + English) | |
| OCR engine B | Tesseract 5 (`hin+eng`, `mar`, `guj`, `ben`, `pan` as available) | |
| Handwriting (optional flag) | TrOCR/CRNN | If weights or GPU are unavailable, run Engine A and B only and mark handwriting as "assisted" |
| NLP | spaCy (blank multilingual pipeline + rules), `rapidfuzz`, `indic-transliteration`, `indic-nlp-library`, `jellyfish` | Optional IndicBERT NER behind `ENABLE_NER=true` |
| VLM fallback (optional) | Small self-hosted VLM via Ollama or `transformers`, JSON-only output | Behind `ENABLE_VLM_FALLBACK=false` by default |
| Graph | Postgres tables + `networkx` | Neo4j is roadmap |
| Frontend | React 18 + Vite + TypeScript, Tailwind, React Router, TanStack Query, Recharts, Leaflet + react-leaflet, Cytoscape.js (graph), react-i18next (English + Hindi UI) | |
| Dashboards | Built into the React app (Recharts) fed by `/api/stats/*`. **Optional:** Superset compose profile pointing at the same DB | |
| GIS server | FastAPI serves GeoJSON directly. **Optional:** GeoServer compose profile | |
| Auth | JWT (access + refresh), roles in claim, bcrypt | Keycloak is roadmap |
| Deployment | Docker Compose (single command), `.env` config | MeghRaj-ready by design |

**Hardware assumption:** a laptop with no GPU must be able to run everything. GPU is optional.

---

## 3. Repository structure

```
bhulekh-ai/
├── README.md
├── docker-compose.yml
├── .env.example
├── Makefile                      # make up | down | seed | synth | test | eval | demo
├── backend/
│   ├── Dockerfile
│   ├── pyproject.toml
│   ├── alembic/
│   └── app/
│       ├── main.py
│       ├── config.py
│       ├── db.py
│       ├── deps.py                   # auth, RBAC dependencies
│       ├── models/                   # SQLAlchemy models
│       ├── schemas/                  # Pydantic models
│       ├── api/                      # routers (section 9)
│       ├── services/
│       │   ├── storage.py            # MinIO wrapper
│       │   ├── ingest.py
│       │   ├── quality.py
│       │   ├── restore.py
│       │   ├── layout.py
│       │   ├── doctype.py
│       │   ├── ocr/
│       │   │   ├── paddle_engine.py
│       │   │   ├── tesseract_engine.py
│       │   │   ├── trocr_engine.py   # optional
│       │   │   └── ensemble.py
│       │   ├── extract/
│       │   │   ├── templates.py      # per doc-type field schemas
│       │   │   ├── table_mapper.py
│       │   │   ├── keyvalue.py
│       │   │   ├── ner.py            # optional
│       │   │   ├── vlm_fallback.py   # optional
│       │   │   └── normalize.py      # digits, units, names, transliteration
│       │   ├── validate/
│       │   │   ├── rules.py
│       │   │   ├── arithmetic.py
│       │   │   ├── masterdata.py
│       │   │   ├── duplicates.py
│       │   │   ├── ownership_graph.py
│       │   │   └── engine.py
│       │   ├── confidence.py
│       │   ├── routing.py
│       │   ├── feedback.py           # corrections, lexicon, calibration, retrain
│       │   ├── mapparse.py           # cadastral map to GeoJSON
│       │   ├── audit.py              # hash chain
│       │   ├── notify.py             # mock SMS/email
│       │   └── stats.py
│       ├── tasks/                    # Celery: pipeline.py, retrain.py
│       └── tests/
├── frontend/                         # React app (section 10)
├── data/
│   ├── raw/                          # organizer dataset (user drops files here)
│   ├── synthetic/                    # generated (section 5)
│   ├── master/                       # masterdata CSVs (section 5.4)
│   ├── fonts/
│   ├── ground_truth/
│   └── seeds/
├── tools/
│   ├── synth/                        # synthetic document generator
│   ├── seed_db.py
│   ├── eval_pipeline.py              # accuracy evaluation vs ground truth
│   └── make_before_after.py          # learning-loop demo numbers
└── docs/
    ├── architecture.md
    ├── api.md
    └── honest_limits.md
```

---

## 4. Environment and Docker Compose

Services: `postgres` (postgis/postgis:16-3.4), `redis`, `minio`, `backend` (uvicorn), `worker` (celery), `frontend` (vite build served by nginx, or `npm run dev` in dev), optional profiles `superset`, `geoserver`.

`.env.example` must contain: `DATABASE_URL`, `REDIS_URL`, `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `JWT_SECRET`, `ENABLE_TROCR`, `ENABLE_NER`, `ENABLE_VLM_FALLBACK`, `AUTO_ACCEPT_THRESHOLD=0.90`, `CRITICAL_FIELD_THRESHOLD=0.92`, `REVIEW_THRESHOLD=0.75`, `DEFAULT_LANG=hi`.

The backend image must install: `tesseract-ocr`, `tesseract-ocr-hin`, `tesseract-ocr-eng`, `tesseract-ocr-mar`, `tesseract-ocr-guj`, `tesseract-ocr-ben`, `tesseract-ocr-pan`, `poppler-utils` (PDF to image), `libgl1`, `fonts-noto` (or copy fonts from `data/fonts`).

`make up` must bring up the whole stack, run migrations, and seed. Health check at `GET /health`.

---

## 5. Data needed (most important section for the demo)

There is limited real data, so the demo relies on **three sources**.

### 5.1 Organizer dataset (real samples)
The problem statement links a Drive folder ("Additional Information regarding PS"). The user will download it into `data/raw/`. The agent should write `tools/inspect_raw.py` that lists file types, page counts, languages guessed by OCR, and image quality scores, so the team knows what real samples exist. Use real samples for the **live demo of robustness** (faded, skewed, mixed-script). Do not assume their layout. Any real sample that fails extraction is shown honestly as a "goes to human review" case, which is a feature.

### 5.2 Synthetic documents (generated by `tools/synth/`, the backbone of the demo)
Generate **at least 300 documents** with ground truth JSON for each. This is required so that extraction accuracy can be measured and the learning loop can be shown.

Document types to generate:

| Type | Script | Description |
|---|---|---|
| **A. Khatauni / Khasra (printed table)** | Hindi Devanagari + English digits or Devanagari digits | Header (state, district, tehsil, village, khata no.), table rows: khasra no., area (hectare or bigha-biswa), land class, owner name, father/husband name, share |
| **B. Mutation register entry (form-like, handwriting-style)** | Hindi | Fields: mutation no., date, old owner, new owner, khasra no., area transferred, reason (sale/inheritance/gift), registration no., remarks |
| **C. Cadastral map** | Numerals | Village map with 15 to 40 parcel polygons and parcel numbers, north arrow, scale bar |
| **D. (Optional) Registration/sale deed first page** | Hindi/English | Registration no., date, seller, buyer, plot, area, consideration |

Generator requirements (`tools/synth/generate.py`, seeded RNG, CLI: `--n 300 --seed 42`):
- Render with Pillow onto paper-like backgrounds (yellowed paper texture, ruled register lines, stamps, signature scribbles, a stamp overlapping text).
- Fonts: Noto Sans Devanagari and Noto Serif Devanagari (printed); handwriting-style Devanagari fonts such as Kalam, Tillana or Sahitya (from Google Fonts, put in `data/fonts/`). If fonts cannot be downloaded, the agent must document the manual step in README and use whatever Devanagari-capable font is installed.
- Data source: `tools/synth/names.py` with 300+ Indian first names, 150+ surnames (Hindi and English transliteration pairs), relation words (पुत्र, पत्नी, पुत्री / S/o, W/o, D/o), and village lists from the master data.
- **Degradation levels** (each doc gets `quality_level` in {clean, mild, moderate, severe}): rotation (±0 to 6°), perspective warp, Gaussian blur, fading (contrast reduction), salt-and-pepper noise, JPEG compression, shadow gradients, stains (blotches), fold lines, and random crop margins. Save both the clean and degraded version. Distribution: 25% clean, 30% mild, 30% moderate, 15% severe.
- Inject **deliberate data errors** into about 15% of documents so that validation has something to catch, and record them in ground truth as `injected_errors`: area components not summing to the total; co-owner shares not summing to 1; a khasra number that appears twice in one khata; a mutation date earlier than the previous mutation; a village code not in master data; a broken ownership chain (seller is not the current owner).
- Ground truth format (`data/ground_truth/<doc_id>.json`):

```json
{
  "doc_id": "khatauni_000123",
  "doc_type": "khatauni",
  "script": "devanagari",
  "quality_level": "moderate",
  "fields": {
    "state": "उत्तर प्रदेश", "district": "...", "tehsil": "...", "village": "...",
    "khata_no": "00123",
    "rows": [
      {"khasra_no": "245", "area_ha": 0.324, "land_class": "सिंचित",
       "owner": "रामलाल", "relation": "पुत्र", "relative_name": "श्यामलाल", "share": 1.0}
    ]
  },
  "boxes": {"khata_no": [x0,y0,x1,y1], "rows[0].owner": [x0,y0,x1,y1]},
  "injected_errors": []
}
```

- Also generate a **linked set**: one synthetic village (`village_id = V001`) with 30 khasra numbers. Type A documents, type B mutation entries, and the type C map must all reference the same khasra numbers and owners, forming valid and (deliberately) invalid ownership chains. This linked set powers the map link and ownership-graph demos.
- Type C map generator: draw 15 to 40 non-overlapping polygons (Voronoi cells clipped to a bounding rectangle work well), print the parcel number at each centroid, and also save the **true GeoJSON** (with real-world coordinates in a chosen village bbox, EPSG:4326) as ground truth for map parsing evaluation. Include 3 to 4 corner control points labelled with coordinates for georeferencing.
- Split: 70% `train_pool` (feeds the learning loop), 15% `val`, 15% `test`. Save the split in `data/synthetic/splits.json`.

### 5.3 Handwriting data (optional, only if TrOCR is enabled)
If fine-tuning TrOCR: use synthetic handwriting-font lines from the generator (line crops plus text labels). Public datasets may be used if the team has time (e.g., IIIT-Indic-HW-Words, Devanagari handwriting datasets), but do not make the prototype depend on them. Fallback: handwriting-style docs go through the two OCR engines and get lower confidence, which routes them to review.

### 5.4 Master data (`data/master/`)
Create CSVs. Use **one state fully (Uttar Pradesh recommended) and two others minimally** so that state-wise dashboards look real.
- `states.csv`: lgd_code, name_en, name_hi
- `districts.csv`: lgd_code, state_code, name_en, name_hi (all districts of the chosen state; a few for the others)
- `tehsils.csv`, `villages.csv`: lgd_code, parent codes, names in en/hi (at least 5 districts × 3 tehsils × 10 villages populated; use Local Government Directory codes where the agent can find them, otherwise clearly labelled placeholder codes)
- `land_classes.csv`: canonical class list with Hindi and English variants (e.g., सिंचित/irrigated, असिंचित/unirrigated, बंजर/barren, आबादी/abadi, कृषि योग्य बंजर, बाग/orchard, etc.)
- `units.yaml`: unit conversion table (below)
- `relations.csv`: relation words and abbreviations in Hindi, English, Marathi, Gujarati, Bengali (S/o, पुत्र, W/o, पत्नी, D/o, पुत्री, etc.)
- `name_lexicon.csv`: initial common names (used for fuzzy correction)

`units.yaml` (all values configurable; **mark bigha as state-specific and flag "verify against state revenue code"** because bigha, biswa, and gaj differ by state):
```yaml
base_unit: sq_m
global:
  hectare: 10000
  acre: 4046.8564224
  sq_ft: 0.09290304
  sq_m: 1
state_specific:
  UP:  {bigha: 2529.29, biswa: 126.46, biswansi: 6.32}     # PLACEHOLDER: verify before real use
  HR:  {kanal: 505.857, marla: 25.293}
  PB:  {kanal: 505.857, marla: 25.293}
  MH:  {guntha: 101.17}
  GJ:  {guntha: 101.17, vigha: 1618.7}                     # PLACEHOLDER
```
Show these values with a "configurable per state" note in the UI settings page.

### 5.5 Seed users and reference data
`data/seeds/users.json` with roles: `admin`, `state_officer`, `district_officer`, `tehsil_operator`, `verifier`, `auditor`, `citizen` (all password `Demo@1234` in dev only), across at least 2 districts.
Seed **historical processing stats** for about 30 days across 5 districts (documents processed, accuracy, pending) so the dashboards are populated before the live demo. Mark seeded numbers as "demo seed" in the API (`is_seed=true`) and show a small badge in the dashboard. **Do not present seeded numbers as real production results.**

### 5.6 Models and weights to download (document in `docs/models.md`)
PaddleOCR det/rec models (multilingual + devanagari), Tesseract traineddata (`hin`, `eng`, etc.), optional TrOCR base weights, optional IndicBERT/LayoutLM, optional YOLOv8n. Provide `make models` that downloads what is reachable and logs anything missing with the fallback used.

---

## 6. Database schema (Alembic migration; PostGIS enabled)

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

users(id uuid pk, username unique, password_hash, full_name, role text, state_code, district_code, tehsil_code, is_active bool, created_at)

documents(id uuid pk, batch_id uuid, filename, mime, storage_key, pages int, doc_type text, script text,
          state_code, district_code, tehsil_code, village_code,
          status text,  -- uploaded|processing|extracted|needs_review|in_review|accepted|rejected|failed
          quality_score float, uploaded_by uuid, uploaded_at, processed_at, is_seed bool default false, sha256 text)

pages(id uuid pk, document_id fk, page_no int, original_key, restored_key, quality_score float,
      width int, height int, rotation_deg float, layout_json jsonb, ocr_json jsonb)

extractions(id uuid pk, document_id fk, version int, status text, overall_confidence float, created_at,
            data jsonb)   -- normalized structured record (see 7.7)

fields(id uuid pk, extraction_id fk, path text,   -- e.g. "rows[0].owner"
       raw_value text, value text, normalized jsonb,
       confidence float, page_no int, bbox jsonb,   -- [x0,y0,x1,y1] on the restored image
       engine_votes jsonb,   -- {paddle:"..", tesseract:"..", trocr:".."}
       status text,          -- ok|uncertain|corrected|rejected
       validation jsonb)     -- [{rule, passed, message}]

validation_results(id uuid pk, extraction_id fk, rule_id text, severity text, passed bool, message text, field_paths text[], created_at)

review_tasks(id uuid pk, document_id fk, extraction_id fk, priority float, reason text, assigned_to uuid,
             status text, -- open|in_progress|done
             created_at, completed_at)

corrections(id uuid pk, field_id fk, document_id fk, before_value text, after_value text, error_type text,
            engine_votes jsonb, doc_type text, script text, quality_level text, corrected_by uuid, created_at, used_in_training bool default false)

parcels(id uuid pk, village_code, khasra_no text, geom geometry(MultiPolygon,4326), area_sq_m float, source text, map_document_id uuid)
CREATE INDEX ON parcels USING gist(geom);

land_records(id uuid pk, document_id, extraction_id, state_code, district_code, tehsil_code, village_code,
             khata_no, khasra_no, area_sq_m float, area_original text, land_class text,
             owner_names text[], parcel_id uuid, status text, created_at)
CREATE INDEX ON land_records USING gin(owner_names);

persons(id uuid pk, name_norm text, name_hi text, name_en text, relative_name text, village_code)
ownership_edges(id uuid pk, from_person uuid null, to_person uuid, khasra_no text, village_code,
                area_sq_m float, share float, event_type text, mutation_no text, event_date date, source_document_id uuid)

audit_log(id bigserial pk, ts timestamptz, actor uuid, action text, entity_type text, entity_id text,
          payload jsonb, prev_hash text, hash text)

lexicon(id serial pk, kind text, variant text, canonical text, count int, source text)   -- learned corrections
model_metrics(id serial pk, model_version text, eval_set text, metric text, value float, created_at)
processing_stats(id serial pk, day date, state_code, district_code, docs_processed int, docs_accepted int, docs_review int,
                 field_accuracy float, avg_confidence float, is_seed bool)
notifications(id uuid pk, channel text, to_addr text, template text, payload jsonb, status text, created_at)  -- mock
```

---

## 7. Backend pipeline: what to code for each stage

Pipeline orchestrated by Celery task `process_document(document_id)`; each stage writes progress to `documents.status` and emits an SSE/websocket event `/api/documents/{id}/events` so the UI shows live stage progress. Every stage is a pure function over `(input, config) → output` so it can be tested in isolation. Log timing per stage.

### 7.1 Ingestion (`ingest.py`, `api/upload.py`)
- Accept PDF, JPG, PNG, TIFF, multi-page TIFF, ZIP (bulk). Validate MIME and magic bytes, max size 50 MB, virus scan is a stub.
- Compute sha256; **exact-duplicate upload detection** (return existing doc with a warning).
- PDF → page images at 300 DPI (`pdf2image`/poppler). If a PDF has an embedded text layer, keep it as an extra OCR signal `pdf_text`.
- Store originals in MinIO. Create `documents` and `pages` rows. Optional metadata form at upload: state, district, tehsil, village, expected doc type.
- Enqueue the pipeline. Return `202 {document_id}`; bulk returns `batch_id`.

### 7.2 Quality assessment (`quality.py`)
Compute per page: blur (variance of Laplacian), contrast (RMS), brightness, skew angle (Hough or projection profile), noise estimate, resolution, text-density. Combine into `quality_score` 0 to 1 plus flags (`blurry`, `faded`, `skewed`, `dark`, `low_res`). Show flags in the UI. Low quality scales down confidence later (section 7.8).

### 7.3 Restoration (`restore.py`)
Ordered steps, each toggleable, and store intermediate results so the UI can show before/after:
1. Deskew (estimated angle) and perspective correction (largest quadrilateral contour when a page border is visible).
2. Background/illumination normalization (large-kernel morphological closing, divide) to remove shadows.
3. Denoise (`fastNlMeansDenoising` or bilateral).
4. Contrast enhancement (CLAHE) for faded ink.
5. Adaptive binarization (**Sauvola** via `skimage.filters.threshold_sauvola`) producing a `binary` variant for OCR. Keep the gray/colour version for display and for the handwriting engine.
6. Optional super-resolution for low-res crops (OpenCV `dnn_superres` if model available; else Lanczos upscaling ×2).
7. Stamp/mark suppression (colour-space thresholding for red/blue stamps) as an optional variant `no_stamp`.

Generate 2 variants (`gray_enhanced`, `binary`) and feed both to OCR engines. Save to MinIO as `restored_key`.

### 7.4 Layout analysis and document type router (`layout.py`, `doctype.py`)
- **Layout:** detect regions: `header`, `table`, `table_cell`, `handwritten_block`, `stamp`, `signature`, `map_region`, `margin_note`. Use PP-Structure table/layout from PaddleOCR; supplement with OpenCV line detection (morphological horizontal/vertical kernels) to get table grids and cells. If the optional YOLO model exists (trained on the synthetic set with the boxes in ground truth), use it for stamps/signatures/map regions.
- **Script detection:** run Tesseract OSD or a quick character-range histogram on a first OCR pass (Devanagari, Bengali, Gurmukhi, Gujarati, Latin, Arabic/Urdu). Output `script` and per-region `script`.
- **Doc type classifier:** a small classifier over (a) keyword hits in first-pass OCR (खतौनी, खसरा, जमाबंदी, नामांतरण, म्यूटेशन, 7/12, अधिकार अभिलेख, पंजीयन …, from a keyword table in `templates.py`), (b) layout features (number of table columns, presence of map region), trained on the synthetic set (scikit-learn logistic regression / gradient boosting). Return `doc_type` + probability. Below 0.6 → type "unknown" → review, and the user can set the type manually.
- Map documents are sent to `mapparse.py` (7.10) rather than field extraction.

### 7.5 OCR ensemble (`services/ocr/`)
Common interface:
```python
class OCRResult(TypedDict):
    engine: str
    lines: list[dict]  # {text, bbox[x0,y0,x1,y1], conf, words:[{text,bbox,conf}]}
def run(image, lang_hints, regions=None) -> OCRResult
```
- Run each engine on the whole page **and/or region crops** (cells from layout: recommended for tables since per-cell OCR is far more accurate and gives exact field boxes).
- **Alignment and voting (`ensemble.py`):**
  1. Match outputs by spatial IoU of boxes (or by cell id when running on cells).
  2. For each aligned unit: if texts equal after normalization → agreement 1.0. Otherwise compute normalized Levenshtein/character-level similarity; pick the candidate with the highest `engine_weight × engine_conf` (weights configurable and learned from validation, see 7.9), and for numeric fields prefer a candidate that passes the regex/format check.
  3. Character-level voting for 3 engines (when TrOCR enabled): align with `difflib`/edit ops and take the majority per character.
  4. Output `{text, agreement, votes:{engine:text}, conf_by_engine}`.
- Cache OCR results in `pages.ocr_json`.

### 7.6 Field extraction (`services/extract/`)
Three tiers, tried in order:
1. **Template + table mapper (primary):** per doc type, `templates.py` defines the schema, header keywords per column (multiple spellings/scripts), field types, and validators. `table_mapper.py` matches header cells to canonical columns with fuzzy matching (`rapidfuzz`), then reads each data row/cell. Header (village, tehsil, district, khata no.) is extracted with `keyvalue.py`: look for label keywords ("ग्राम", "तहसील", "जनपद/ज़िला", "खाता संख्या") and take the value to the right/below.
2. **Rules/NER:** regex patterns for numbers (survey/khasra formats like `245`, `245/1`, `245/1/क`), dates, registration numbers, areas with units; relation parsing (`<name> पुत्र <name>`, `S/o`, `W/o`); optional IndicBERT NER (`ENABLE_NER`).
3. **VLM fallback (optional flag):** for unknown layouts or when tier 1 leaves required fields empty, send the page image plus the JSON schema to the self-hosted VLM with an instruction to output JSON only. Validate against the schema with Pydantic; discard on parse failure. Mark provenance `source="vlm"`, and cap confidence at 0.7 so it always gets reviewed.

Each extracted field records: `path`, `raw_value`, `page_no`, `bbox`, `engine_votes`, `source` (template/rule/ner/vlm).

Field schemas (minimum):
- **Khatauni:** state, district, tehsil, village, khata_no, rows[{khasra_no, area (value+unit), land_class, owner, relation, relative_name, share, remarks}]
- **Mutation:** mutation_no, date, village, khasra_no, old_owner, new_owner, area_transferred, reason, registration_no, order_authority
- **Sale deed (optional):** registration_no, date, seller, buyer, khasra_no, area, consideration

### 7.7 Normalization (`normalize.py`)
- **Digits:** Devanagari/Bengali/Gurmukhi/Gujarati/Arabic-Indic → ASCII, kept as both `raw` and `normalized`.
- **Units:** parse "0.324 हे.", "2 बीघा 5 बिस्वा", "1-2-15" style (bigha-biswa-biswansi) → `area_sq_m` using `units.yaml` and the record's state. Keep `area_original` verbatim. Always round-trip test: convert to sq m and back within tolerance.
- **Names:** strip honorifics (श्री, श्रीमती, Smt., Shri), normalize whitespace and matras/nukta variants (NFC, remove ZWJ/ZWNJ), transliterate Hindi ↔ English (`indic-transliteration`), phonetic key (a simple Soundex-like for transliterated Latin, plus `jellyfish` metaphone) for fuzzy match, apply the learned `lexicon` corrections.
- **Names of places:** match to master data by fuzzy match (threshold 0.85) → attach `lgd_code`. If ambiguous, flag.
- **Land class:** map variants to the canonical class.
- **Dates:** parse multiple formats, Devanagari digits, Vikram Samvat is out of scope (flag).
- Output `extractions.data` = fully normalized JSON with each leaf `{value, raw, confidence, source, bbox}`.

### 7.8 Confidence scoring (`confidence.py`)
Per field, features: mean OCR conf across engines, engine agreement (0 to 1), format validity (regex/type), master-data match (for place names), lexicon hit, page quality score, field length sanity, and validation outcome (a failed rule caps the confidence). Combine with logistic regression trained on the `val` split against "field correct vs ground truth" so the output is a **calibrated probability**. Fallback before training: weighted average with hand-tuned weights. Save calibration curve data (reliability diagram) in `model_metrics` and show it in the UI (Model page).
Record-level confidence = min over critical fields and the mean over the others (critical: owner, khasra_no, khata_no, area, village).
Field status: `>= AUTO_ACCEPT_THRESHOLD (0.90)` ok, critical fields need `>= 0.92`, `< REVIEW_THRESHOLD (0.75)` uncertain (red), between them amber.

### 7.9 Validation engine (`services/validate/`)
Each rule: `id`, `severity` (error/warning/info), `description`, and function returning `passed`, `message`, `field_paths`. Rules are registered in a list, so new ones can be added without touching the engine. Show all in a **Rules page**.

| ID | Rule |
|---|---|
| R001 | Khasra/survey number matches allowed pattern |
| R002 | Village/tehsil/district codes exist in master data and the hierarchy is consistent |
| R003 | Area > 0 and below a plausible maximum for a single plot |
| R004 | Land class in canonical list |
| R005 | Required fields present for the doc type |
| R006 | Dates valid, not in the future, in chronological order |
| A001 | Sum of area components (irrigated + unirrigated + etc.) equals the total (tolerance 1%) |
| A002 | Co-owner shares sum to 1 for each khasra |
| A003 | Sum of sub-plots (khasra/1, /2, ...) ≤ parent khasra area |
| A004 | Area transferred in a mutation ≤ seller's current area |
| D001 | Duplicate khasra within a khata, or the same khasra with identical owners in another record (same village) |
| D002 | Near-duplicate document (perceptual hash + extracted-field similarity) |
| X001 | Cross-database check: khasra exists in the mock LRMS/parcels table and the owner name fuzzy-matches (score ≥ 0.8) |
| X002 | Record area vs map polygon area differs by ≤ 10% (else warning) |
| G001 | Ownership chain: mutation's old_owner must equal the current owner of that khasra in the graph |
| G002 | No plot has two conflicting current owners |
| G003 | Chain continuity (no cycles, no orphan transfers) |

**Ownership graph (`ownership_graph.py`):** build/update `persons` and `ownership_edges` as records and mutations get accepted (entity resolution across spelling variants using the phonetic key + fuzzy score, with a review flag if uncertain). Use `networkx` to check G001 to G003 and to serve a subgraph for one khasra: `GET /api/graph/khasra/{village}/{khasra}` → Cytoscape-compatible `{nodes, edges}` with broken links marked red.

Results are stored in `validation_results`, and attached to the relevant `fields.validation`.

### 7.10 Map parsing and linking (`mapparse.py`, `api/gis.py`)
1. Detect map region; binarize; find closed regions via contours (`cv2.findContours` with hierarchy, or flood-fill on the inverted line image); filter by area.
2. For each region, OCR the number within (crop the interior bbox, use digits-only OCR config); associate the number with the polygon.
3. Georeference: find the labelled control points (3 or 4 corners with coordinates, OCR'd) or, for the demo, read them from upload metadata; compute an affine transform (`cv2.estimateAffine2D`) from pixel to lon/lat.
4. Simplify polygons, write to `parcels` (MultiPolygon, 4326) with `khasra_no` and `village_code`. Compute geodesic area (transform to a local UTM/EPSG suitable projection in PostGIS via `ST_Transform` and `ST_Area`).
5. **Linking:** when a `land_record` is accepted, join to `parcels` by `(village_code, khasra_no)`; set `parcel_id`; run X002.
6. Evaluate polygon IoU vs the synthetic ground-truth GeoJSON in `eval_pipeline.py`.
Note in `honest_limits.md`: real cadastral maps are much messier (hatching, overlaps, partial legibility); the prototype targets clean and moderately degraded synthetic maps, plus one real sample if the organizer provides it.

### 7.11 Routing and review queue (`routing.py`)
- All critical fields ok and no error-severity validation failures → `accepted` (status auto) and written to `land_records`.
- Otherwise → `needs_review`, create `review_tasks` with priority = weighted sum of (number of uncertain fields, criticality, error-severity failures, document age, plot area/value), reason text listing the specific fields and failed rules.
- Only **uncertain fields** are shown for editing first, but the verifier can edit any field.

### 7.12 Feedback and learning loop (`feedback.py`, `tasks/retrain.py`)
On verifier submit:
1. Save each changed field to `corrections` with `error_type` inferred (`ocr_confusion`, `digit_error`, `name_spelling`, `unit_error`, `wrong_field`, `missing`) using an edit-distance analysis and character confusion pairs.
2. Update `lexicon` (variant → canonical, count++), building a name/place/land-class correction dictionary and a **character confusion matrix** per engine (e.g., Devanagari matra confusions).
3. Write the corrected record and mark the review task done; notify (mock).

`make retrain` / `POST /api/model/retrain` (admin only) runs, in order:
1. **Confusion-aware post-correction:** rebuild the lexicon and apply it to the normalization stage.
2. **Engine weight update** for voting: learn per-engine weights per field type from corrections (which engine's candidate matched the human answer most often).
3. **Confidence recalibration:** refit the logistic calibrator including the new corrections.
4. **Optional fine-tune:** if `ENABLE_TROCR` and GPU are present, fine-tune on the corrected crops (roadmap; guard with a flag).
5. Evaluate the new version on the fixed `test` split, store the metrics in `model_metrics` with a `model_version` tag (`v1`, `v2`, ...), and never train on `test`.

**Demo requirement:** `tools/make_before_after.py` runs the pipeline on the `test` split at v1 (no corrections), simulates verifier corrections on the `train_pool` (uses ground truth as the "verifier" for a batch of documents), retrains → v2, re-evaluates, and writes results to `model_metrics`. The UI **Learning page** shows a line chart of field accuracy, review-rate, and auto-accept precision across versions v1 → v2 → v3. This is real measured output from the actual loop on synthetic data, and the UI labels it "measured on synthetic test split".

### 7.13 Audit trail (`audit.py`)
Every state change (upload, view of sensitive record, extraction, edit, accept, reject, login, role change, export, retrain) writes to `audit_log` with `hash = sha256(prev_hash + canonical_json(entry))`. Provide `GET /api/audit/verify` that recomputes the chain and reports the first broken link; the Auditor screen shows a green "chain intact" banner and lets the auditor click "simulate tampering" (admin-only, on a copy or a flagged demo table, **never the real chain**) to show detection.

### 7.14 Security and RBAC (`deps.py`)
| Role | Permissions |
|---|---|
| tehsil_operator | Upload, view own documents/status |
| verifier | Review queue in own district, edit fields, submit |
| district_officer | All in district: dashboards, approve/reject, export |
| state_officer | State-wide dashboards and read access |
| auditor | Read-only everything + audit log; cannot edit |
| admin | Users, rules config, retrain, settings |
| citizen | Public status lookup by application ID/khasra; sees masked data only |

Apply scope filters by `state_code/district_code/tehsil_code` from the JWT. PII masking: mask Aadhaar-like 12-digit patterns, phone numbers (regex) in stored extractions and UI unless the role has `pii:view` (log every unmasked view in audit). Passwords hashed with bcrypt, JWT expiry 30 min plus refresh, rate limiting on login, CORS restricted, security headers, file-type checks. Encryption at rest: note MinIO SSE and Postgres volume encryption as deployment config (documented, not implemented).

### 7.15 Notifications (mock) (`notify.py`)
On events (submitted for review, verified, mutation accepted, rejected): write a `notifications` row and render the message template (Hindi + English) visible in an "Outbox" page. No real SMS/email is sent; a config stub shows where a gateway would plug in.

### 7.16 Statistics (`stats.py`)
Endpoints computing from live data plus the seeded history: documents processed per day, accepted vs review vs rejected, field-level accuracy (from corrections: fields corrected / fields verified), average confidence, error statistics by rule/error type, pending review count, average time per document, review turnaround, state-wise and district-wise progress (counts joined to master data), and the top-10 most-corrected fields.

---

## 8. Mock LRMS / DILRMP integration (`api/lrms_mock.py`)
Implement a separate router mounted at `/mock-lrms` acting as the "existing government system":
- `GET /mock-lrms/records?village=&khasra=` returns the "official" record (from a seeded table built from the synthetic ground truth with a few deliberate mismatches).
- `POST /mock-lrms/records` receives our pushed validated records; returns a reference ID.
- `GET /mock-lrms/master/{level}` returns master data.
The validation rule X001 calls this. Add an "Export / Sync to LRMS" button that pushes accepted records and logs it in audit. Also implement export endpoints: CSV, JSON, and GeoJSON for parcels. Include a **ULPIN-format** field (14-character alphanumeric placeholder generated by a documented scheme, labelled "illustrative") to show the linkage idea.

---

## 9. API surface (FastAPI, all under `/api`, documented in OpenAPI)

| Method + path | Purpose | Roles |
|---|---|---|
| POST `/auth/login`, `/auth/refresh`, GET `/auth/me` | Auth | all |
| POST `/documents/upload` | Single/multi/ZIP upload | operator+ |
| GET `/documents`, `/documents/{id}` | List (filters: status, type, district, date), detail | scoped |
| GET `/documents/{id}/pages/{n}/image?variant=original|restored|binary` | Images | scoped |
| GET `/documents/{id}/events` | SSE progress | scoped |
| POST `/documents/{id}/reprocess` | Rerun pipeline (optional doc type override) | verifier+ |
| GET `/documents/{id}/extraction` | Fields with bbox, confidence, votes, validation | scoped |
| GET `/review/tasks`, GET `/review/tasks/{id}` | Queue sorted by priority | verifier+ |
| PATCH `/review/tasks/{id}/fields/{field_id}` | Edit one field | verifier |
| POST `/review/tasks/{id}/submit` | Submit corrections and accept | verifier |
| POST `/review/tasks/{id}/reject` | Reject with reason | verifier+ |
| GET `/records`, `/records/{id}`, `/records/search?q=` | Accepted records, fuzzy search (names Hindi/English) | scoped |
| GET `/graph/khasra/{village}/{khasra}` | Ownership graph | scoped |
| GET `/gis/parcels?village=&bbox=` | GeoJSON parcels | scoped |
| GET `/gis/parcels/{id}` | Parcel + linked record | scoped |
| POST `/gis/maps/upload` | Upload a cadastral map and parse | operator+ |
| GET `/stats/overview`, `/stats/timeseries`, `/stats/errors`, `/stats/geo`, `/stats/accuracy` | Dashboards | officer+ |
| GET `/audit`, GET `/audit/verify` | Audit log and chain verification | auditor/admin |
| GET `/rules`, PATCH `/rules/{id}` (enable/severity) | Validation rules | admin |
| POST `/model/retrain`, GET `/model/metrics`, `/model/calibration`, `/model/lexicon` | Learning loop | admin/officer |
| GET `/notifications` | Outbox | officer+ |
| GET `/public/status/{application_id}` | Citizen lookup, masked data | public |
| POST `/export/lrms`, GET `/export/csv|json|geojson` | Integration/export | officer+ |

Errors return RFC 7807 style JSON. Use pagination on all lists. Include an OpenAPI tag description for each group so `/docs` looks clean for the demo.

---

## 10. Frontend (React) pages and behavior

Design: clean government-portal style, English/Hindi toggle (react-i18next; full UI strings in both), responsive, accessible contrast, confidence color system used consistently: **green ≥ 0.90, amber 0.75 to 0.90, red < 0.75**.

1. **Login** with role-based redirect. A "Demo users" helper (dev mode only) to switch roles quickly.
2. **Upload page:** drag-and-drop, bulk/ZIP, optional metadata (state/district/tehsil/village), a progress bar per file, and a **live pipeline timeline** per document (Ingest → Quality → Restore → Layout → OCR → Extract → Validate → Route), updated over SSE. Show quality flags.
3. **Document detail (processing view):** tabs: Original | Restored | Regions (overlaid boxes with type labels) | Extracted fields | Validation report. **Before/after slider** for restoration. Stage timings.
4. **Verification workspace (key demo screen):** split view. **Left:** page image with zoom/pan and box overlays coloured by confidence; clicking a field scrolls and highlights its region. **Right:** editable field form grouped (header fields; table rows), each showing value, confidence badge, engine votes (tooltip: "Paddle: X / Tesseract: Y"), validation messages with links to the offending fields, and a "why flagged" explanation. Keyboard shortcuts (Tab to next uncertain field, Enter accept, Ctrl+Enter submit). "Show only uncertain fields" toggle. A submit button records corrections and shows a toast "Correction saved → added to learning data".
5. **Review queue:** sortable table with priority, doc type, district, number of flagged fields, age; filters.
6. **Records and search:** search by owner name (Hindi or English, fuzzy), khasra, khata, village; record detail with linked parcel mini-map and ownership timeline.
7. **Map view (Leaflet):** base OSM tiles (offline fallback: blank background), village parcels as GeoJSON, colour by validation status (validated / warning / unlinked); click a parcel to open a side panel with record data, source document thumbnail, area comparison (record vs polygon), and a button to open the ownership graph.
8. **Ownership graph view (Cytoscape):** person nodes, plot nodes, mutation edges with dates; broken links highlighted red with an explanation (rule G001/G002).
9. **Dashboard:** KPI cards (documents processed, auto-accept rate, extraction accuracy, pending verification, avg time per doc, errors), time-series, validation status donut, error-type bar chart, top-corrected fields, **state → district drilldown** progress (choropleth if boundaries are available, otherwise bar/heat tiles), and a "demo seed data" badge where applicable.
10. **Learning page:** model versions, before/after accuracy chart, reliability (calibration) diagram, correction counts by error type, lexicon growth, and a **Retrain now** button (admin) that streams progress.
11. **Audit page:** filterable log, chain status banner, verify button.
12. **Rules page:** list of validation rules, toggles, and last-30-day failure counts.
13. **Outbox page:** mock SMS/email notifications.
14. **Settings:** unit conversion table by state, thresholds (sliders for auto-accept/review), language.
15. **Citizen status page** (public, minimal): enter an application ID, see the status and a masked summary.

Loading/empty/error states are required for every page. Use skeletons, not spinners only.

---

## 11. Evaluation (`tools/eval_pipeline.py`)
Run over the `test` split and print/save:
- Field-level accuracy (exact match after normalization) and character error rate, per doc type, script, quality level, and field.
- Auto-accept precision (of the auto-accepted fields, the share that is correct) and coverage (share auto-accepted); target: precision ≥ 0.98 at coverage as high as achievable. Report honestly if the target is not met.
- Validation recall on injected errors (share of injected errors detected) and false-positive rate on clean docs.
- Map parsing: polygon IoU and parcel-number accuracy.
- Time per page.
- Manual-vs-automated benchmark (for the PPT): the team enters a stopwatch time for typing 20 sample pages; the script computes automated time per page and outputs a comparison table. Provide a `data/benchmarks/manual_times.csv` template.
Results go to `docs/eval_report.md` (auto-generated) and to `model_metrics`. **Never hardcode result numbers in the UI or slides.** Use whatever is measured.

---

## 12. Testing
- Unit tests (pytest) for: digit normalization, unit conversion round trip, name normalization/transliteration, each validation rule (pass and fail cases), ownership-graph checks, hash-chain verify/tamper, confidence monotonicity, RBAC scope filters.
- Integration test: upload a synthetic doc → wait for pipeline → assert extracted fields against ground truth above a minimum threshold, and that a doc with an injected area error is flagged.
- Frontend: Playwright smoke test that runs the full demo flow of section 16 headlessly.
- CI-style `make test` that runs everything.

---

## 13. Performance and robustness requirements
- One A4 page at 300 DPI processed in under about 60 s on CPU (report the real number); batch throughput via multiple Celery workers.
- Pipeline is idempotent and retry-safe; failures set `status=failed` with an error message, visible in the UI, and never crash the worker.
- Large images are downscaled for layout detection but the full resolution is kept for OCR crops.
- Timeouts per stage, and structured JSON logs.

---

## 14. Honest limits (write these into `docs/honest_limits.md` and a small "About this prototype" UI modal)
- Trained/evaluated mainly on synthetic data plus a small set of real samples. Real-world accuracy on faded handwritten registers will be lower and must be validated on real state data.
- Handwriting recognition is limited; handwritten fields are expected to go to human review more often.
- Bigha/biswa conversions are state-specific and the shipped values are placeholders that must be verified against each state's revenue code.
- The LRMS/DILRMP integration is a mock API; real integration needs state-specific adapters and credentials.
- Notifications are mocked. Keycloak/SSO, Neo4j, GraphQL, Detectron2 and full model fine-tuning are roadmap items.
- Seeded dashboard history is labelled as demo data.

---

## 15. Build order (milestones with checks)

| # | Milestone | Done when |
|---|---|---|
| M0 | Repo, Docker Compose, DB migrations, MinIO, health check, seed users | `make up` works; login returns JWT |
| M1 | **Synthetic data generator** + master data + splits | 300 docs + ground truth; visual spot-check grid image saved to `docs/samples.png` |
| M2 | Ingestion, quality, restoration + before/after | Upload shows restored image and quality flags |
| M3 | Layout, script and doc type router | Router accuracy on test set reported; table cells detected |
| M4 | OCR engines + ensemble | CER reported per engine and for the ensemble (ensemble should beat or equal the best single engine on the val set; otherwise fix weights) |
| M5 | Extraction + normalization | Field accuracy report on the val set; JSON output correct for a sample |
| M6 | Confidence + validation engine + ownership graph | Injected-error recall reported; validation report visible via API |
| M7 | Routing + review queue + verification UI | Full loop: upload → flagged → correct → accepted |
| M8 | Feedback, lexicon, retrain, before/after metrics | Learning page shows v1 → v2 improvement (or an honest flat result) |
| M9 | Map parsing, parcels, Leaflet view, linking | Click parcel → record shows |
| M10 | Dashboard, stats, seeded history | All KPI cards live |
| M11 | Audit chain, RBAC scope, PII masking, mock LRMS, exports, notifications outbox | Verify endpoint OK; tamper demo detects |
| M12 | Polish: i18n, empty states, Playwright demo test, docs, `make demo` | Demo script passes end to end |

At the end of each milestone, commit with a clear message and update `docs/progress.md` with what works, what is stubbed, and measured numbers.

---

## 16. Demo script the app must support (for the video)

`make demo` resets to a clean seeded state and preloads the exact files used below (`data/demo/`: one moderate-degradation khatauni with an injected area-sum error, one handwritten-style mutation entry, one linked cadastral map, and one real sample from the organizer dataset if usable).

1. **Login** as tehsil operator, upload the khatauni, and show the live pipeline timeline and the before/after restoration slider.
2. Show detected regions and the extracted fields with confidence colours.
3. The validation report flags "area components don't sum to total" (A001) and one uncertain owner name.
4. Log in as verifier: open the review queue, open the task, click the red field to highlight the source region, fix the name, submit. The toast shows the correction saved to learning data.
5. Upload the mutation entry: the ownership chain view shows a **broken link** (seller not the current owner), flagged red.
6. Upload the cadastral map: parcels appear on the map; click a parcel to see the linked record and the area comparison.
7. As district officer: dashboard with processed counts, accuracy, pending cases, error types, and district drilldown.
8. Learning page: before/after accuracy across model versions and the calibration diagram; click **Retrain** to show a new version.
9. As auditor: audit trail, "chain intact", then the tamper simulation detected.
10. Show the API docs (`/docs`) and the mock LRMS push with the audit entry, and finally the citizen status lookup with masked data.

---

## 17. Definition of done
- `make up && make seed && make demo` gives a fully working app with no manual steps beyond the documented font/model downloads.
- Every milestone check in section 15 passes, and `docs/eval_report.md` is generated from real runs.
- The section 16 flow completes without errors in the Playwright test.
- README contains a short "Quick start", "Known limitations", and a table of what is real versus mocked.
