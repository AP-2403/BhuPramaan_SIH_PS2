"""BhuLekh-AI Template Definitions and Keyword Dictionaries.

Defines document schemas, column keywords, and matching rules for:
- Khatauni (Record of Rights / Type A)
- Mutation Register (नामांतरण रजिस्टर / Type B)
- Cadastral Map (भूखण्ड मानचित्र / Type C)
- Sale Deed (बैनामा / विक्रय पत्र)
"""
from __future__ import annotations

from typing import Any, Dict, List

# ── Keywords for Document Type Classification ──────────────────────────────────
DOCTYPE_KEYWORDS: Dict[str, List[str]] = {
    "khatauni": [
        "खतौनी",
        "खसरा",
        "अधिकार अभिलेख",
        "जमाबंदी",
        "खाता संख्या",
        "भूमि वर्ग",
        "क्षेत्रफल",
        "स्वामी",
        "सम्बन्ध",
        "पिता/पति",
        "हिस्सा",
        "खातेदार",
        "काश्तकार",
        "पड़ताल",
        "khatauni",
        "khasra",
        "ror",
        "jamabandi",
    ],
    "mutation": [
        "नामांतरण",
        "म्यूटेशन",
        "दाखिल खारिज",
        "रजिस्टर प्रविष्टि",
        "पुराना स्वामी",
        "नया स्वामी",
        "हस्तांतरित",
        "आदेश प्राधिकारी",
        "पंजीयन संख्या",
        "कारण",
        "उप-जिलाधिकारी",
        "तहसीलदार",
        "नायब तहसीलदार",
        "mutation",
        "dakhil kharij",
    ],
    "cadastral_map": [
        "भूखण्ड",
        "मानचित्र",
        "शजरा",
        "नक्शा",
        "मीटर",
        "पैमाना",
        "control point",
        "scale",
        "cadastral",
        "map",
        "shajra",
    ],
    "sale_deed": [
        "बैनामा",
        "विक्रय पत्र",
        "पंजीयन",
        "क्रेता",
        "विक्रेता",
        "प्रतिफल",
        "गवाह",
        "रजिस्ट्रार",
        "sale deed",
    ],
}

# ── Table Column Mapping for Khatauni ──────────────────────────────────────────
KHATAUNI_COLUMNS: Dict[str, Dict[str, Any]] = {
    "khasra_no": {
        "canonical": "khasra_no",
        "label": "Khasra Number",
        "label_hi": "खसरा सं.",
        "type": "string",
        "keywords": ["खसरा सं.", "खसरा संख्या", "खसरा", "गाटा सं.", "सर्वे सं.", "khasra"],
        "critical": True,
    },
    "area": {
        "canonical": "area",
        "label": "Area",
        "label_hi": "क्षेत्रफल",
        "type": "area",
        "keywords": ["क्षेत्रफल", "क्षेत्रफल (हे.)", "रकबा", "हेक्टेयर", "area"],
        "critical": True,
    },
    "land_class": {
        "canonical": "land_class",
        "label": "Land Classification",
        "label_hi": "भूमि वर्ग",
        "type": "string",
        "keywords": ["भूमि वर्ग", "भूमि श्रेणी", "श्रेणी", "किस्म", "land class"],
        "critical": False,
    },
    "owner": {
        "canonical": "owner",
        "label": "Owner Name",
        "label_hi": "स्वामी का नाम",
        "type": "string",
        "keywords": ["स्वामी का नाम", "काश्तकार", "खातेदार", "नाम खातेदार", "owner"],
        "critical": True,
    },
    "relation": {
        "canonical": "relation",
        "label": "Relation",
        "label_hi": "सम्बन्ध",
        "type": "string",
        "keywords": ["सम्बन्ध", "नाता", "relation"],
        "critical": False,
    },
    "relative_name": {
        "canonical": "relative_name",
        "label": "Father/Spouse Name",
        "label_hi": "पिता/पति का नाम",
        "type": "string",
        "keywords": ["पिता/पति का नाम", "पिता का नाम", "पति का नाम", "संरक्षक", "father", "spouse"],
        "critical": False,
    },
    "share": {
        "canonical": "share",
        "label": "Share",
        "label_hi": "हिस्सा",
        "type": "float",
        "keywords": ["हिस्सा", "अंश", "भाग", "share"],
        "critical": False,
    },
}

# ── Key-Value Header Fields for Khatauni ───────────────────────────────────────
KHATAUNI_HEADER_FIELDS = [
    {"key": "state", "labels": ["राज्य", "प्रदेश"], "default": "उत्तर प्रदेश"},
    {"key": "district", "labels": ["जनपद/ज़िला", "जनपद", "ज़िला", "जिला"]},
    {"key": "tehsil", "labels": ["तहसील"]},
    {"key": "village", "labels": ["ग्राम", "गाँव", "मौजा"]},
    {"key": "khata_no", "labels": ["खाता संख्या", "खाता सं."], "critical": True},
]

# ── Key-Value Fields for Mutation Register ─────────────────────────────────────
MUTATION_FIELDS = [
    {"key": "mutation_no", "labels": ["नामांतरण संख्या", "वाद संख्या", "प्रविष्टि सं."], "critical": True},
    {"key": "date", "labels": ["दिनांक", "तारीख", "आदेश दिनांक"], "critical": True},
    {"key": "village", "labels": ["ग्राम", "गाँव"], "critical": True},
    {"key": "khasra_no", "labels": ["खसरा संख्या", "खसरा सं."], "critical": True},
    {"key": "old_owner", "labels": ["पुराना स्वामी", "पूर्व खातेदार", "विक्रेता"], "critical": True},
    {"key": "new_owner", "labels": ["नया स्वामी", "नवीन खातेदार", "क्रेता"], "critical": True},
    {"key": "area_transferred", "labels": ["हस्तांतरित क्षेत्र", "क्षेत्रफल"], "critical": True},
    {"key": "reason", "labels": ["कारण", "अंतरण का स्वरूप"], "critical": False},
    {"key": "registration_no", "labels": ["पंजीयन संख्या", "बैनामा सं."], "critical": False},
    {"key": "order_authority", "labels": ["आदेश प्राधिकारी", "न्यायालय"], "critical": False},
]
