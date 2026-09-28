# Data Acquisition Log

Generated: 2026-09-28

## Summary

| ID | Status | Source used | Licence | Rows/files | Notes |
|---|---|---|---|---|---|
| D1 | MANUAL | User must place organizer files in `data/raw/` | Organizer | — | See MANUAL_STEPS.md |
| D2 | FALLBACK | Hand-curated placeholder master data | public_domain | ~60 villages, 5 districts | PLACEHOLDER LGD codes — verify with lgdirectory.gov.in |
| D3 | SKIPPED | DataMeet/OSM boundaries — not fetched | ODbL | — | Choropleth replaced by bar/heat tiles in UI |
| D4 | FALLBACK | Synthetic handwriting-style fonts via generator | OFL | n/a | Real IIIT-HW datasets not fetched |
| D5 | SKIPPED | Indic OCR benchmark datasets — not fetched | varies | — | Using synthetic data for benchmarking |
| D6 | SKIPPED | DocLayNet — not fetched | CC BY 4.0 | — | Using PP-Structure + OpenCV for layout |
| D7 | SKIPPED | PubTabNet — not fetched | varies | — | Using PP-Structure for tables |
| D8 | SKIPPED | Indiscapes — not fetched | varies | — | Using synthetic degradations |
| D9 | SYNTHETIC | Voronoi parcels from generator | synthetic | 300 docs | Ground truth available |
| D10 | FALLBACK | Hand-curated name list (300+ first names, 150+ surnames) | public_domain | 300+ names | In tools/synth/names.py |
| D11 | FALLBACK | Placeholder unit table (units.yaml) | public_domain | 7 states | MUST be verified per state revenue code |
| D12 | PENDING | PaddleOCR + Tesseract — downloaded at runtime | Apache/Apache | — | See docs/models.md |
| D13 | PENDING | Noto fonts via apt (in Docker), Google Fonts manually | OFL | — | See MANUAL_STEPS.md |

## Fallbacks Used

1. **D2 (Master data):** Real LGD codes require manual download from lgdirectory.gov.in (captcha/form). Used placeholder codes labelled `PLACEHOLDER` in all master CSVs. LGD code format follows the standard (2-digit state, 4-digit district, 6-digit tehsil, 8-digit village) but values are not verified against the real directory.

2. **D10 (Names):** No external name dataset fetched. All names are hand-curated common Indian names in `tools/synth/names.py`. Source: hand-curated. No real person's data.

3. **D11 (Units):** Bigha/biswa values from UP Revenue Code secondary sources. Marked `verified: false`. See MANUAL_STEPS.md for verification steps.

4. **D13 (Fonts):** Noto Sans Devanagari installed via `fonts-noto` apt package in the Docker image. Handwriting fonts (Kalam, Tillana, Sahitya) not yet downloaded — see MANUAL_STEPS.md.
