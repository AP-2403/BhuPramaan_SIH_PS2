/**
 * Concise, professionally paced voiceover narration scripts for BhuPramaan Demo Tour.
 * Formatted for calm, slow, crystal-clear explanation during screen recording.
 */

export interface StepVoiceScript {
  en: string
  hi: string
}

export const TOUR_VOICE_SCRIPTS: Record<number, StepVoiceScript> = {
  1: {
    en: "Step 1: Role-Based Access Control. BhuPramaan enforces strict jurisdictional security. Select a Tehsil Operator, Verifier, or District Officer to begin.",
    hi: "चरण 1: भूमिका आधारित अभिगम नियंत्रण। भू-प्रमाण सख्त सुरक्षा लागू करता है। शुरू करने के लिए तहसील ऑपरेटर या सत्यापनकर्ता चुनें।",
  },
  2: {
    en: "Step 2: Secure Login. Authenticate using encrypted session tokens to access your role-scoped revenue workspace.",
    hi: "चरण 2: सुरक्षित लॉगिन। अपने राजस्व कार्यक्षेत्र में प्रवेश करने के लिए एन्क्रिप्टेड सत्र से लॉगिन करें।",
  },
  3: {
    en: "Step 3: Document Ingestion Dropzone. Upload legacy land records, scans, or cadastral maps with automated format and duplicate detection.",
    hi: "चरण 3: दस्तावेज़ अंतर्ग्रहण। पुराने भू-अभिलेख या कैडेस्ट्रल मानचित्र अपलोड करें। प्रारूप और डुप्लिकेट पहचान स्वतः होती है।",
  },
  4: {
    en: "Step 4: Benchmark Datasets. Click any sample deed to trigger the live automated digitization pipeline.",
    hi: "चरण 4: मानक परीक्षण डेटासेट। लाइव डिजिटलीकरण पाइपलाइन शुरू करने के लिए किसी भी नमूना विलेख पर क्लिक करें।",
  },
  5: {
    en: "Step 5: Preprocessing Engine. Real-time OpenCV restoration enhances faded ink, corrects paper skew, and normalizes illumination.",
    hi: "चरण 5: पूर्व-प्रसंस्करण इंजन। ओपन-सीवी तकनीक से धुंधली स्याही ठीक होती है, झुकाव हटता है और पृष्ठभूमि साफ होती है।",
  },
  6: {
    en: "Step 6: Optical Restoration Comparison. Drag the split slider to inspect the deed before and after neural image enhancement.",
    hi: "चरण 6: छवि बहाली तुलना। स्लाइडर को खिसकाकर एआई द्वारा साफ किए गए देवनागरी पाठ की तुलना करें।",
  },
  7: {
    en: "Step 7: Layout Analysis. Deep learning models segment table grids, data rows, signature blocks, and official revenue stamps.",
    hi: "चरण 7: संरचनात्मक लेआउट विश्लेषण। डीप लर्निंग मॉडल तालिकाओं, हस्ताक्षरों और सरकारी मुहरों को अलग पहचानते हैं।",
  },
  8: {
    en: "Step 8: OCR Ensemble Extraction. Hybrid Tesseract and TrOCR models extract Khasra numbers, landholders, and areas with confidence scores.",
    hi: "चरण 8: ओसीआर निष्कर्षण। टेसेरैक्ट और टीआर-ओसीआर मॉडल खसरा संख्या, खातेदार का नाम और क्षेत्रफल सटीकता से निकालते हैं।",
  },
  9: {
    en: "Step 9: Statutory Validation Rules. Seventeen automated legal rules verify ownership arithmetic, co-shares, and boundary tolerances.",
    hi: "चरण 9: सांविधिक सत्यापन नियम। सत्रह स्वचालित नियम स्वामित्व हिस्सेदारी और सीमा सटीकता की जांच करते हैं।",
  },
  10: {
    en: "Step 10: Human-in-the-Loop Review Queue. Low-confidence fields are routed here for revenue officers to verify with side-by-side document crops.",
    hi: "चरण 10: मानव सत्यापन कतार। संदिग्ध प्रविष्टियों को समीक्षा हेतु राजस्व अधिकारियों के पास भेजा जाता है।",
  },
  11: {
    en: "Step 11: Priority Triage. High-priority title disputes are resolved promptly, with verifier corrections feeding active learning.",
    hi: "चरण 11: प्राथमिकता वर्गीकरण। विवादित नामांतरणों को प्राथमिकता से हल किया जाता है और फीडबैक से मॉडल सीखता है।",
  },
  12: {
    en: "Step 12: Cadastral Vector Map. Textual records are georeferenced and linked directly to PostGIS land parcel polygons.",
    hi: "चरण 12: कैडेस्ट्रल मानचित्र लिंकेज। राजस्व खतौनी को सीधे भू-नक्शा के बहुभुज पार्सल से जोड़ा जाता है।",
  },
  13: {
    en: "Step 13: Geodesic Area Inspector. Rule X002 compares registered deed area with satellite geodesic boundaries to detect encroachments.",
    hi: "चरण 13: जियोडेसिक क्षेत्रफल सत्यापन। नियम X002 उपग्रह क्षेत्रफल और बैनामा क्षेत्रफल का सटीक मिलान करता है।",
  },
  14: {
    en: "Step 14: Executive Leadership Dashboard. Track real-time digitization throughput, auto-accept rates, and dispute reduction statewide.",
    hi: "चरण 14: प्रशासनिक डैशबोर्ड। राज्य और जनपद स्तर पर डिजिटलीकरण प्रगति और विवाद निवारण की निगरानी करें।",
  },
  15: {
    en: "Step 15: Tehsil Breakdown. Monitor processing speed and operational metrics across administrative revenue circles.",
    hi: "चरण 15: तहसील-वार प्रगति। विभिन्न तहसीलों के डिजिटलीकरण प्रदर्शन और गुणवत्ता का विश्लेषण देखें।",
  },
  16: {
    en: "Step 16: Citizen Public Search. Citizens can search digitized land records instantly by Khasra or owner name with complete transparency.",
    hi: "चरण 16: नागरिक सार्वजनिक खोज। नागरिक बिना तहसील जाए सीधे खसरा या नाम से अपने अभिलेख खोज सकते हैं।",
  },
  17: {
    en: "Step 17: Privacy Protection. Public records strictly mask Aadhaar numbers in compliance with Section 7.14 privacy regulations.",
    hi: "चरण 17: आधार गोपनीयता संरक्षण। नागरिक रिकॉर्ड में आधार संख्या को सुरक्षा नियमों के तहत स्वतः छुपाया जाता है।",
  },
  18: {
    en: "Step 18: Active Learning Loop. Human verifier corrections continuously retrain neural models to reduce error rates over time.",
    hi: "चरण 18: सक्रिय शिक्षण चक्र। मानव सुधारों से मॉडल लगातार सीखता है और सटीकता बढ़ती जाती है।",
  },
  19: {
    en: "Step 19: Cryptographic Audit Trail. All administrative actions are permanently sealed in a tamper-evident SHA-256 hash ledger.",
    hi: "चरण 19: क्रिप्टोग्राफिक ऑडिट ट्रेल। प्रत्येक अपलोड और सत्यापन को सुरक्षित SHA-256 ब्लॉकचेन हैश में दर्ज किया जाता है।",
  },
}

export const TOUR_COMPLETION_VOICE: StepVoiceScript = {
  en: "Demo completed successfully! All core digitization, validation, and cadastral mapping modules have been verified. You may now stop your screen recording.",
  hi: "डेमो सफलतापूर्वक पूर्ण हुआ! सभी डिजिटलीकरण, सत्यापन और भू-नक्शा मॉड्यूल प्रमाणित हो चुके हैं। अब आप स्क्रीन रिकॉर्डिंग रोक सकते हैं।",
}
