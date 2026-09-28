# data/SOURCES.md: Data Sources and Acquisition Instructions

> **For the coding agent.** This file lists what data the project needs, where to try to get it, and the rules for collecting it. The author wrote it from memory without live web access, so **every URL and dataset name is a lead to verify, not a confirmed fact.** If a source is dead, moved, gated or has an unclear licence, skip it, log it in `data/ACQUISITION_LOG.md`, and use the stated fallback. Never invent data to fill a gap silently.

---

## 0. Ground rules (read first)

1. **No bulk scraping of personal land records.** State Bhulekh / RoR / khatauni / Mahabhulekh / Bhoomi / Meebhoomi portals display real owners' names and plot details. Do **not** write crawlers against them. At most, the *human user* may manually save a handful of records for test use. The agent must not automate that. See section 3.
2. **Only collect data that is openly downloadable** (public download links, GitHub releases, Hugging Face datasets, government open-data downloads) or that the user places in `data/raw/` manually.
3. **Respect `robots.txt`, terms of use, and rate limits.** Max 1 request/second, identify with a plain User-Agent, and stop on 403/429.
4. **Record provenance for every file:** source URL, retrieval date, licence, SHA-256, and a note on what it is used for. Write to `data/ACQUISITION_LOG.md` and `data/MANIFEST.csv` (columns: `path,source_url,retrieved_at,licence,sha256,used_for,notes`).
5. **Keep licences.** Save each dataset's licence/readme next to it. Do not redistribute datasets in the repo unless the licence clearly allows it; instead store only a download script. Add large data dirs to `.gitignore`.
6. **Privacy:** any real record with personal names must be masked (blur names in demo screenshots and slides) and never committed to a public repo.
7. **Network limits:** the agent sandbox may only reach some domains (for example GitHub, PyPI, npm and Hugging Face-like hosts may work; government portals often may not). If a domain is blocked, write the exact manual download step for the user in `data/MANUAL_STEPS.md` and continue with fallbacks.
8. **Do not train on the real test set** (`data/raw/test_real/`). Real samples are for evaluation and demo only.

---

## 1. What data the project needs

| ID | Data | Used by | Priority | Volume | Fallback if unavailable |
|---|---|---|---|---|---|
| D1 | Real land-record scans/PDFs (organizer folder) | Real-world test and demo | Must | 20 to 50 pages | User supplies manually; synthetic only |
| D2 | Master data: states, districts, tehsils/sub-districts, villages with LGD codes | Validation R002, dashboards | Must | Chosen state fully, others partial | Placeholder codes (labelled) |
| D3 | Boundary geometry (district / sub-district) | Map and choropleth dashboard | Nice | Chosen state | Bar/heat tiles instead of choropleth |
| D4 | Devanagari/Indic handwriting samples | Optional TrOCR fine-tuning | Nice | Thousands of word/line crops | Synthetic handwriting-style fonts |
| D5 | Indic scene/printed text recognition data | OCR benchmarking, optional fine-tune | Nice | Any subset | Synthetic printed text |
| D6 | Document layout datasets | Layout model pretraining | Nice | Subset | Classical CV + PP-Structure only |
| D7 | Table structure datasets | Table model pretraining | Nice | Subset | PP-Structure / morphology lines |
| D8 | Historical/damaged-document layout | Robustness testing | Nice | Small | Synthetic degradations |
| D9 | Polygons for cadastral map stand-ins | Map parsing, GIS demo | Nice | One village | Voronoi synthetic parcels |
| D10 | Name lists (Hindi/English) and relation words | Lexicon, synthetic generator | Must (small) | 300+ first names, 150+ surnames | Hand-written list |
| D11 | Land-class vocab and unit conversions per state | Normalization, validation | Must | Chosen state | Placeholder values (labelled, user to verify) |
| D12 | Pretrained model weights (PaddleOCR, Tesseract traineddata, optional TrOCR/IndicBERT/LayoutLM/YOLO) | Pipeline | Must (OCR) | n/a | See section 4 |
| D13 | Devanagari-capable fonts (printed + handwriting-style) | Synthetic generator | Must | 4 to 6 fonts | Any installed Devanagari font |

---

## 2. Sources by data type (leads to verify)

### D1: Real land-record samples
| Lead | Notes |
|---|---|
| **Organizer folder** given in the problem statement (Google Drive, "Additional Information regarding PS") | Best source. The user downloads it manually into `data/raw/`. The agent then runs `tools/inspect_raw.py` (file types, pages, script guess, quality). Do not try to bypass Drive access controls. |
| DILRMP portal (dilrmp.gov.in) | Programme information and progress statistics (aggregate). Useful for the "existing system" slide and dashboard context, **not** record scans. |
| Sample/specimen formats published by state revenue departments (khatauni, jamabandi, 7/12 format guides) | Often PDFs of blank or sample formats. Excellent for building templates and header keywords. Search each state revenue department site. |

### D2: Master data (real and downloadable)
| Lead | Notes |
|---|---|
| **Local Government Directory (LGD)**, lgdirectory.gov.in | Official codes for states, districts, sub-districts, villages. Has downloadable reports (CSV/Excel) via its "Download Directory" section. The site may need manual downloads because of forms/captchas. If so, write steps in `MANUAL_STEPS.md`. Do not defeat captchas. |
| **Census 2011 village/town directories** on data.gov.in | Downloadable tables with codes and names; often English only. Useful to cross-check LGD. |
| data.gov.in (Open Government Data platform) | Search terms: "land records", "DILRMP", "village directory", "land use". Datasets carry licences (often GODL-India). Save the licence. |

Output: `data/master/states.csv`, `districts.csv`, `tehsils.csv`, `villages.csv` in the schema in the main README. Add Hindi names where LGD provides them; if not, transliterate and mark `name_hi_source=auto`.

### D3: Boundaries
| Lead | Notes |
|---|---|
| **DataMeet Maps** (github.com/datameet/maps) | Community-maintained India district / sub-district / state boundaries as GeoJSON/shapefiles. Check the licence in the repo (verify, since they are community-compiled and not official). |
| OpenStreetMap extracts (Geofabrik / Overpass) | Boundaries and land-use. ODbL licence (attribution and share-alike). Use small extracts only. |

Note: state maps shown in this prototype are illustrative, not authoritative. Add the disclaimer "boundaries for demonstration; not official".

### D4: Indic handwriting (optional)
| Lead | Notes |
|---|---|
| IIIT Hyderabad CVIT datasets page (IIIT-INDIC-HW-WORDS, IIIT-HW-Dev) | Word-level handwriting images for Devanagari and other Indic scripts. Usually research/non-commercial licence, sometimes requires a request form. Verify. |
| UCI Machine Learning Repository: Devanagari Handwritten Character Dataset | Isolated characters (not words). Direct download. Good for a quick character classifier, weak for line OCR. |
| CMATERdb (ISI Kolkata / Jadavpur) | Handwritten Devanagari/Bangla character and word sets; access rules vary. |

Fallback: handwriting-style fonts in the generator (Kalam, Tillana, Sahitya, etc. from Google Fonts, OFL licensed).

### D5: Indic text recognition
| Lead | Notes |
|---|---|
| AI4Bharat (huggingface.co/ai4bharat and github.com/AI4Bharat) | Check for scene-text/OCR datasets (for example IndicSTR12) and Indic language resources. Verify names and licences. |
| ICDAR 2019 MLT (multilingual scene text) | Includes Hindi and Bengali scene text; registration may be required. |
| Bhashini (bhashini.gov.in) | Government Indic language platform with OCR/translation services and some datasets. Access may need registration/API keys, so do not automate signup. |

### D6 and D7: Layout and table datasets (generic pretraining)
| Lead | Notes |
|---|---|
| DocLayNet (github.com/DS4SD/DocLayNet) | Layout annotations for varied document types. Large; use a subset or skip. |
| PubLayNet (github.com/ibm-aur-nlp/PubLayNet) | Scientific-paper layouts, large, not very similar to land records. Low priority. |
| PubTabNet (github.com/ibm-aur-nlp/PubTabNet) | Table structure recognition. |
| TableBank (github.com/doc-analysis/TableBank) | Table detection/structure. |

Honest note: these are English-centric and only help pretraining. For the prototype, table handling relies mainly on PP-Structure plus OpenCV line detection, so **skipping D6/D7 is acceptable.**

### D8: Historical/damaged documents
| Lead | Notes |
|---|---|
| Indiscapes (historical Indic manuscript layout dataset, ICDAR 2019 paper; search GitHub/project page) | Palm-leaf manuscripts, not land records, but useful for damage robustness. Small. Verify availability and licence. |
| Internet Archive / national archives scans of revenue records | Only public-domain material. Verify the rights statement for each item. |

### D9: Polygons for map demos
| Lead | Notes |
|---|---|
| Google Open Buildings (sites.research.google/open-buildings) | Building footprints for India, downloadable by tile. Large; use one tile only. Licence CC BY 4.0 / ODbL for parts (verify). |
| OSM landuse polygons for one village | Small extract via Overpass. |
| **Synthetic Voronoi parcels** (from the generator) | Default choice. Real parcels are private/official data, and synthetic ones come with exact ground truth for map-parsing evaluation. |

### D10: Names and vocabulary
| Lead | Notes |
|---|---|
| Public Indian name lists (Kaggle or GitHub datasets; check licence) | Use only lists with permissive licences; deduplicate and store as `name_lexicon.csv`. |
| Hand-curated relation words | Write directly (S/o, पुत्र, W/o, पत्नी, D/o, पुत्री, Marathi/Gujarati/Bengali equivalents). |

### D11: Land classes and unit conversions
| Lead | Notes |
|---|---|
| State revenue department websites and revenue code/manual PDFs (for example UP Revenue Code, Haryana/Punjab land revenue acts) | Definitions of land classes and local units (bigha, biswa, kanal, marla, guntha). |
| Existing state land-record portal help pages | Often list conversions. |

**Important:** the agent must not guess bigha/biswa values. Use the placeholder table from the main README, flag it `verified: false`, and list the state and source URL still needed in `MANUAL_STEPS.md`.

### D12: Models and weights
See section 4.

### D13: Fonts
| Lead | Notes |
|---|---|
| Google Fonts: Noto Sans Devanagari, Noto Serif Devanagari, Kalam, Tillana, Sahitya | OFL licences. Download via the Google Fonts GitHub repository (`github.com/google/fonts`) or `fonts.google.com`. Put in `data/fonts/`. |

---

## 3. Guidance on real records from state portals

- The **user**, not the agent, may view a few public records on a state portal and save them (screenshot or PDF print) for testing. Recommended: 5 to 10 records for the chosen state, including the portal's sample/demo records if it offers any.
- Prefer records of **government/public-land entities** or portal-provided sample records so no individual is identified.
- Mask names in any published material, and never upload these to a public repository.
- The agent must not build crawlers, iterate over village/khata/khasra number combinations, or bypass captchas on these portals.
- If the organizers already provide sample scans, use those first and skip this step.

---

## 4. Model and weight acquisition (by script, `make models`)

| Asset | How to get | Fallback |
|---|---|---|
| PaddleOCR detection/recognition (Devanagari + English) | Auto-downloaded by the `paddleocr` package on first run (needs access to the model host), or download the model tarballs listed in the PaddleOCR docs | Tesseract-only mode |
| Tesseract traineddata (`eng, hin, mar, guj, ben, pan`) | `apt install tesseract-ocr-<lang>` or the `tessdata`/`tessdata_best` repository on GitHub | English + Hindi minimum |
| TrOCR base (optional) | Hugging Face hub (`microsoft/trocr-*`); fine-tuning needed for Devanagari, so treat it as optional | Skip; handwriting goes to review |
| IndicBERT / IndicNER (optional) | Hugging Face (`ai4bharat/*`) | Regex/template extraction |
| LayoutLM (optional) | Hugging Face | Template mapper |
| YOLOv8n (optional) | Ultralytics package weights | Classical CV regions |
| spaCy multilingual pipeline | `pip install spacy`; use a blank multilingual pipeline plus rules | n/a |

Each download logs name, version/hash, licence and size to `docs/models.md`.

---

## 5. Acquisition workflow the agent must implement

Create `tools/fetch_public_data.py` with subcommands:

```
python tools/fetch_public_data.py list            # show every source and its status
python tools/fetch_public_data.py fetch D2 D3     # try to fetch open sources by ID
python tools/fetch_public_data.py verify          # re-hash files, check MANIFEST.csv
python tools/fetch_public_data.py manual          # print MANUAL_STEPS.md for things it could not fetch
```

Behavior:
- Each source is a small entry in `tools/sources.yaml` (`id, name, url, kind [http|git|hf|manual], licence, checksum?, target_dir, size_hint, enabled`). Start with `enabled: false` for anything large or licence-unclear.
- HTTP fetches use `requests` with retries, timeouts, a 1 request/second limit, resume support, and a size cap prompt for anything above 500 MB (skip by default).
- After download: unzip, validate (file opens, row counts), write to `MANIFEST.csv`, and print a summary table with OK / SKIPPED / MANUAL for each ID.
- For blocked domains or gated data: do not fail. Add a step to `MANUAL_STEPS.md` ("Download X from URL, save as Y") and use the fallback.
- **Idempotent:** rerunning must not redownload existing verified files.
- Build the master data by running `tools/build_master_data.py` on whatever was fetched (LGD/Census CSVs), and fall back to the small placeholder set if not.

`data/ACQUISITION_LOG.md` must end with a table like:

| ID | Status (fetched / manual / fallback) | Source used | Licence | Rows/files |
|---|---|---|---|---|

---

## 6. Recommended minimum for a working demo

If time is short, only these are truly required:

1. **D1:** the organizer's sample scans (manual placement).
2. **D2:** LGD/Census codes for one state (or the labelled placeholder set).
3. **D13:** Devanagari fonts.
4. **D12:** PaddleOCR + Tesseract (`hin`, `eng`).
5. **Synthetic data:** generated by `tools/synth/` (covers D4 to D10 needs for the demo).
6. **D11:** unit conversions verified for the chosen state (user step).

Everything else improves realism or accuracy but is not needed for the demo video.

---

## 7. What to say on slides about data

- "Trained and evaluated on synthetic land-record documents with exact ground truth, tested on N real sample pages from the organizer dataset."
- Cite each open source used (name, licence).
- State that master data comes from LGD/Census (or placeholder where noted).
- Do not claim real-world accuracy beyond what `docs/eval_report.md` measures on real pages.
