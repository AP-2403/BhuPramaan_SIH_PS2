# BhuPramaan — Complete Hackathon Demo Video Script & Storyboard
**Problem Statement:** Intelligent Land Record Digitization and Validation System  
**Target Duration:** 5:00 – 6:00 Minutes  
**Target Audience:** Smart India Hackathon (SIH) Evaluators, Ministry of Rural Development, Department of Land Resources (DILRMP)

---

## 🎬 Pre-Recording Checklist
Before starting your screen recording (via OBS Studio, Loom, or Windows Game Bar `Win + G`):
1. **Servers Running:**
   - Backend API: `http://127.0.0.1:8000` (FastAPI)
   - Frontend Portal: `http://127.0.0.1:5173` (Vite + React)
2. **Demo Files Ready:**
   - `data/demo/1_khatauni_degraded_sample.png` (Skewed, aged Khatauni scan)
   - `data/demo/3_mutation_degraded_sample.png` (Mutation register with stamp/signatures)
   - `data/demo/4_cadastral_map_sample.png` (Cadastral parcel map)
3. **Browser Setup:**
   - Chrome / Edge in Fullscreen (`F11`) at 1920×1080 resolution.
   - Start recording on the Sign-In page: `http://127.0.0.1:5173/login`.

---

## ⏱️ Scene-by-Scene Timeline & Narration

### Scene 1: Introduction & The Core Problem (0:00 – 0:35)
* **Visual on Screen:**
  - Start on `http://127.0.0.1:5173/login` showing the clean Government of Uttar Pradesh / DILRMP portal banner.
  - Briefly flash the 4 sample scans in `data/demo/` (or display a split slide of aged, folded, skewed Hindi land records).
* **Voiceover / Narration:**
  > *"Across India, millions of historical land records—including Khatauni, Mutation registers, and Cadastral maps—remain locked in paper vaults. Decades of aging, faded ink, multiple regional scripts, and complex tabular structures make manual data entry error-prone, creating disputes and stalling the Digital India Land Records Modernization Programme (DILRMP).*  
  > *Welcome to **BhuPramaan**: an end-to-end, AI-powered Intelligent Land Record Digitization and Validation System engineered to automate restoration, layout detection, multi-engine OCR voting, business rule validation, and GIS parcel linkage."*

---

### Scene 2: Role-Based Access & Document Ingestion (0:35 – 1:25)
* **Action on Screen:**
  1. On the login page, point out the **RBAC Profiles** (Tehsil Operator, Revenue Verifier, District Officer, Auditor, Citizen).
  2. Click **Tehsil Operator (`tehsil_operator`)** &rarr; Immediately lands on the **Upload Workspace (`/upload`)**.
  3. Drag and drop **`1_khatauni_degraded_sample.png`** into the upload zone.
  4. Select Jurisdiction: State `09 (UP)`, District `0901 (Lucknow)`, Tehsil `090101 (Sadar)`, Expected Type: `Khatauni`.
  5. Click **"Upload & Process"**.
  6. Show the real-time stage timeline: Ingest &rarr; Quality Assessment &rarr; Restoration &rarr; Layout &rarr; Routing.
* **Voiceover / Narration:**
  > *"We begin by authenticating as a **Tehsil Operator**. Notice that BhuPramaan enforces strict Role-Based Access Control: the operator is scoped strictly to Lucknow Sadar and sees only document ingestion tools.*  
  > *We upload an aged, severely degraded Khatauni scan. In real time, the pipeline computes cryptographic SHA-256 hashes, checks for exact duplicate submissions, and runs automated quality assessment: computing blur variance, RMS contrast, and skew angle."*

---

### Scene 3: 6-Stage Computer Vision Restoration (1:25 – 2:10)
* **Action on Screen:**
  1. Click **"Inspect & Compare"** to open Document Detail.
  2. On the **Restoration Comparison** tab, drag the split Before/After slider back and forth:
     - Show **Original (Before)** on the left (tilted, dark background, low contrast).
     - Show **Restored (After)** on the right (deskewed, illumination-corrected, crisp text).
  3. Toggle to **Sauvola Binary (OCR)** variant and **No Stamp** variant.
  4. Click the **Quality Metrics** tab: highlight the Laplacian blur variance, RMS contrast, and estimated skew angle (-1.38°).
* **Voiceover / Narration:**
  > *"Before running OCR on legacy scans, image restoration is paramount. Our 6-stage classical computer vision pipeline applies Hough transform deskewing, morphological background illumination correction to eliminate shadows, CLAHE contrast enhancement for faded ink, and Sauvola adaptive binarization.*  
  > *Using our interactive Before/After comparison canvas, operators can clearly inspect how degraded scans are transformed into high-contrast, OCR-ready images without losing thin Devanagari character strokes."*

---

### Scene 4: Layout Analysis, Table Grid & Script Classification (2:10 – 2:55)
* **Action on Screen:**
  1. Switch to the **Layout & Regions** tab.
  2. The interactive canvas displays color-coded bounding boxes:
     - Header block (Purple)
     - Table grid outline (Blue)
     - Individual table cells (Cyan)
     - Seal/Stamp (Amber)
     - Signature block (Green)
  3. Hover over a table cell to inspect the tooltip coordinates `(x0, y0, x1, y1)`.
  4. Toggle off the "Cells" layer and toggle on "Stamps" to show dynamic layer filtering.
  5. Point out the top classified badges: **Type: KHATAUNI** and **Script: Devanagari**.
* **Voiceover / Narration:**
  > *"Next is structural layout analysis. Standard OCR fails on land records because columns get mixed up. BhuPramaan utilizes morphological line kernels and PP-Structure classical vision to segment headers, signature zones, and extract every individual table cell with exact row-column coordinates.*  
  > *Simultaneously, our Unicode histogram analyzer confirms the Devanagari script, while our trained Random Forest Document Router classifies this as a Khatauni with 100% confidence, routing it to the appropriate land tenure schema."*

---

### Scene 5: Dual OCR Ensemble & Field Normalization (2:55 – 3:40)
* **Action on Screen:**
  1. Highlight the extracted fields:
     - **Owner Name (खातेदार):** रामेश्वर प्रसाद (Rameshwar Prasad)
     - **Parentage:** पुत्र राम लखन
     - **Khata No:** 104
     - **Khasra / Survey No:** 245/1
     - **Area:** Original `0.412 हे.` normalized to `4,120 m²`
  2. Point out the dual-engine voting: PaddleOCR (Hindi Devanagari) + Tesseract 5 combined via spatial IoU alignment and confidence-weighted voting.
  3. Show local unit normalization: Bigha-Biswa converted to standard SI metric units (`sq. meters`).
* **Voiceover / Narration:**
  > *"For text extraction, we never rely on a single OCR engine. We deploy an ensemble of PaddleOCR and Tesseract 5. Each detected table cell is OCR'd independently, avoiding line bleed.*  
  > *Our voting engine aligns candidate outputs by spatial IoU, prefers dictionary-verified terms, and computes character-level agreement. Crucially, our NLP normalizer parses local land units—such as Bigha, Biswa, or Hectares—and standardizes them into square meters based on state-specific revenue rules."*

---

### Scene 6: Validation Engine & Confidence Scoring (3:40 – 4:20)
* **Action on Screen:**
  1. Point out the **Confidence Color System**:
     - Green (`>= 0.90`): Auto-Accept
     - Amber (`0.75 - 0.90`): Moderate Confidence
     - Red (`< 0.75`): Uncertain / Flagged for Review
  2. Show the **17 Automated Business Validation Rules**:
     - Rule R001: Khasra number pattern syntax check.
     - Rule R002: LGD Master data code hierarchy check.
     - Rule A001: Area component arithmetic sum check (Sum of sub-plots ≤ total plot area).
     - Rule G001: Ownership chain continuity check.
  3. Highlight a flagged field (e.g. Area arithmetic warning or low OCR confidence on a faded name).
* **Voiceover / Narration:**
  > *"Extracted data is worthless without validation. BhuPramaan executes 17 automated integrity checks:*  
  > *From survey number regex and Local Government Directory (LGD) place code verification, to co-owner share arithmetic checks where shares must sum exactly to 1. If any critical field falls below 0.92 confidence or fails a mathematical constraint, the system marks it in red and routes it directly to the human review queue."*

---

### Scene 7: Human-in-the-Loop Verifier Workspace & Learning Loop (4:20 – 4:55)
* **Action on Screen:**
  1. Switch role via the top dropdown to **Revenue Verifier (`verifier`)**.
  2. Automatically lands on **`/review`** (Verification Workspace).
  3. Show the prioritized queue: documents ranked by uncertainty score and age.
  4. Click **"Inspect & Verify"**:
     - Split screen: Left side shows high-res scan zoomed onto the flagged cell; Right side shows the editable correction form.
     - Correct the flagged field (e.g. adjust a single character or confirm name).
     - Click **"Submit & Accept"**.
  5. Show the notification toast: *"Correction saved &rarr; Added to Active Learning Lexicon (M8)"*.
* **Voiceover / Narration:**
  > *"When human verification is required, our **Revenue Verifier Workspace** minimizes manual effort. Instead of re-typing the entire record, the verifier is presented with a synchronized split-view showing the exact cropped region of the scan alongside the uncertain field.*  
  > *Once verified, corrections don't just update the database—they feed our active learning feedback loop, expanding our regional revenue lexicon and updating OCR error-confusion matrices to continuously improve future accuracy."*

---

### Scene 8: Cadastral GIS Map Parcel Linking (4:55 – 5:25)
* **Action on Screen:**
  1. Navigate to **`/map`** (or switch to District Officer &rarr; Cadastral Map).
  2. Show the **Interactive Cadastral GIS Map (Leaflet)** with village parcel polygons.
  3. Click on Parcel **Khasra 245/1**:
     - A side panel pops up showing the linked Khatauni record, owner name (*रामेश्वर प्रसाद*), verified area (*4,120 m²*), and the scanned document thumbnail.
     - Green badge: **"GIS Parcel Linked & Area Validated (Rule X002 &lt; 2% Delta)"**.
* **Voiceover / Narration:**
  > *"In land administration, textual records must agree with spatial reality. BhuPramaan extracts parcel boundary contours from uploaded village maps (`Naksha`), georeferences them, and binds accepted land records directly to PostGIS spatial polygons.*  
  > *By clicking any parcel on the Leaflet map, officials instantly see the linked owner, tenure status, and automated cross-verification comparing the textual deed area against the polygon's physical geodesic area."*

---

### Scene 9: Executive Dashboard, Audit Trail & Citizen Privacy (5:25 – 5:50)
* **Action on Screen:**
  1. Switch to **District Officer (`district_officer`)** &rarr; Shows **Executive Dashboard (`/dashboard`)**:
     - Throughput cards (1,248 Digitized, 93.8% Auto-Accept Rate).
     - Tehsil drilldown table (Lucknow Sadar, Malihabad, Mohanlalganj).
  2. Switch to **Auditor (`auditor`)** &rarr; Shows **Cryptographic Audit Trail (`/audit`)**:
     - Prominent Green Shield: **"SHA-256 Hash Chain: INTACT (100% Verified)"**.
     - Click **"Verify Chain Integrity"** &rarr; Shows tamper-evident non-repudiation.
  3. Switch to **Citizen (`citizen`)** &rarr; Shows **Public Records Registry (`/records`)**:
     - Search Khasra `245/1`.
     - Point out **Masked PII**: Aadhaar is masked as `XXXX-XXXX-8924` protecting citizen privacy.
* **Voiceover / Narration:**
  > *"For administrative governance, our **District Executive Dashboard** provides real-time oversight of digitization progress across all tehsils.*  
  > *For regulatory compliance, an **Auditor** can independently verify the tamper-evident SHA-256 cryptographic hash-chain, guaranteeing that historical ownership records cannot be secretly altered.*  
  > *Finally, on the **Citizen Portal**, landowners can search their records with full privacy protection, as sensitive personal identifiers are masked in compliance with data privacy mandates."*

---

### Scene 10: Conclusion & National Impact (5:50 – 6:15)
* **Action on Screen:**
  - Return to the main BhuPramaan landing page or show the FastAPI interactive API documentation (`/docs`).
  - Show the concluding slide with team details, architecture highlights (Python FastAPI, PyTorch/OpenCV, React, PostgreSQL/PostGIS, MeghRaj Cloud-ready).
* **Voiceover / Narration:**
  > *"BhuPramaan delivers a complete, production-grade architecture: built on FastAPI, OpenCV, dual-engine OCR, PostGIS, and React, ready for MeghRaj cloud deployment.*  
  > *By transforming fragile paper archives into verified, spatially-linked digital assets, BhuPramaan paves the way for transparent land governance, faster dispute resolution, and citizen empowerment under DILRMP.*  
  > *Thank you!"*

---

## 💡 Top Tips for Recording
1. **Pacing:** Speak at a steady, confident pace. Don't rush; let the visual transitions (sliders, bounding boxes, map clicks) breathe for 2-3 seconds.
2. **Resolution:** Record at 1080p 60fps with clear microphone audio.
3. **Cursor:** Keep cursor movements smooth and purposeful—circle the Before/After slider and hover over table cells to draw the evaluator's attention.
