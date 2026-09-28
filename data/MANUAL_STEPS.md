# Manual Steps Required

Items the agent could not automate (blocked domain, captcha, gated access).
Perform these steps manually before running the pipeline.

---

## STEP 1: Download organizer's sample scans (D1 — REQUIRED for real demo)

The problem statement links a Google Drive folder "Additional Information regarding PS".

1. Open the organizer's Drive link in your browser.
2. Download all files.
3. Place them in `data/raw/`. Do NOT commit them to any public repo.
4. Run: `python tools/inspect_raw.py` to see file types, page counts, and quality scores.

> **Privacy:** If files contain real owner names, mask them in any published screenshots or slides.

---

## STEP 2: Download Devanagari handwriting-style fonts (D13 — REQUIRED for best synthetic output)

The Docker image installs Noto Sans Devanagari via apt, which is sufficient for printed-style docs.
For handwriting-style docs, download these Google Fonts (OFL licence):

```
# Option A: Download manually from Google Fonts website
# https://fonts.google.com/specimen/Kalam  → data/fonts/Kalam-Regular.ttf
# https://fonts.google.com/specimen/Tillana → data/fonts/Tillana-Regular.ttf
# https://fonts.google.com/specimen/Sahitya → data/fonts/Sahitya-Regular.ttf
# https://fonts.google.com/noto/specimen/Noto+Sans+Devanagari → data/fonts/NotoSansDevanagari-Regular.ttf

# Option B: Clone Google Fonts repo (large, ~3 GB — use sparse checkout)
# git clone --filter=blob:none --sparse https://github.com/google/fonts.git google_fonts_tmp
# cd google_fonts_tmp
# git sparse-checkout add ofl/kalam ofl/tillana ofl/sahitya ofl/notosansdevanagari
# cp ofl/kalam/*.ttf ../../data/fonts/
# cp ofl/tillana/*.ttf ../../data/fonts/
# cp ofl/sahitya/*.ttf ../../data/fonts/
# cp ofl/notosansdevanagari/*.ttf ../../data/fonts/
# cd .. && rm -rf google_fonts_tmp
```

Fallback: The generator will use any installed Noto/Devanagari font if these are missing.
Log in ACQUISITION_LOG.md after downloading.

---

## STEP 3: Verify LGD codes for master data (D2 — REQUIRED before real production use)

The master data CSVs use PLACEHOLDER LGD codes. Verify against the real LGD:

1. Open https://lgdirectory.gov.in
2. Navigate to "Download Directory" → State → Uttar Pradesh
3. Download the district, sub-district, and village lists (Excel/CSV)
4. Replace the placeholder values in:
   - `data/master/districts.csv`
   - `data/master/tehsils.csv`
   - `data/master/villages.csv`
5. Update `data/ACQUISITION_LOG.md` with source URL, date, and SHA-256.

**For the hackathon demo:** placeholder codes are sufficient. Do NOT use placeholder codes in production.

---

## STEP 4: Verify bigha/biswa unit conversions (D11 — REQUIRED before real production use)

The unit values in `data/master/units.yaml` are marked `verified: false`.

For **Uttar Pradesh**:
- Reference: UP Zamindari Abolition and Land Reforms Act 1950, or UP Revenue Board office
- Verify: 1 bigha = ? sq meters (standard UP bigha is ~2529 sq m, but may vary by region)
- Source URL: https://upbhulekh.gov.in or UP Revenue Code publications

After verification:
1. Update `data/master/units.yaml` — change `verified: false` → `verified: true` and add `source_url`
2. Update `data/ACQUISITION_LOG.md`
3. Run unit round-trip tests: `python -m pytest backend/app/tests/test_normalize.py -k unit`

---

## STEP 5: Download PaddleOCR models (D12 — auto in Docker, manual if blocked)

If the Docker build fails to download PaddleOCR models (network timeout):

```powershell
# Inside the running backend container:
docker compose exec backend python -c "from paddleocr import PaddleOCR; PaddleOCR(lang='hi')"
```

If the model download fails, the system falls back to Tesseract-only mode (set in config).
Log in docs/models.md after verifying.

---

## STEP 6: Census 2011 / LGD boundary data for choropleth (D3 — optional)

For the district choropleth map on the dashboard:

1. Open https://github.com/datameet/maps
2. Download `Districts/` folder as ZIP
3. Extract the GeoJSON for Uttar Pradesh into `data/master/boundaries/up_districts.geojson`
4. Verify licence (check repo README — community-maintained, verify terms)
5. Add disclaimer "boundaries for demonstration; not official" in the UI

Fallback (used by default): bar/heat tiles instead of choropleth.

---

*Last updated: 2026-09-28*
