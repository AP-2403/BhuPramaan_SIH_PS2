"""
Generate authentic, high-resolution Land Record Demo PDFs for BhuPramaan.
Generates:
1. 01_Khatauni_RoR_Format_CH41.pdf - Record of Rights with full 13-column tabular layout
2. 02_Registered_Sale_Deed_Bahi1.pdf - Registered Conveyance Deed with e-Stamp & Boundaries
3. 03_Dakhil_Kharij_Mutation_Order.pdf - Tehsildar Court Order with legal text and seal
4. 04_Cadastral_Bhu_Naksha_Plot_Parcha.pdf - Cadastral Plot Survey Map with parcel vectors
5. 05_Section_80_Non_Agricultural_Sanction.pdf - Non-Agricultural conversion sanction order
"""
import os
import math
from PIL import Image, ImageDraw, ImageFont

def get_font(size: int, bold: bool = False):
    font_path = "C:/Windows/Fonts/Nirmala.ttc"
    if os.path.exists(font_path):
        return ImageFont.truetype(font_path, size=size)
    arial_path = "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"
    if os.path.exists(arial_path):
        return ImageFont.truetype(arial_path, size=size)
    return ImageFont.load_default()

def draw_official_seal(draw: ImageDraw.ImageDraw, cx: int, cy: int, radius: int = 65, text: str = "राजस्व परिषद उत्तर प्रदेश"):
    """Draw an authentic circular government revenue seal."""
    # Outer circle
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], outline=(150, 40, 30), width=3)
    # Inner circle
    draw.ellipse([cx - radius + 8, cy - radius + 8, cx + radius - 8, cy + radius - 8], outline=(150, 40, 30), width=1)
    
    font_small = get_font(12, bold=True)
    # Star emblems
    draw.text((cx - radius + 15, cy - 6), "★", fill=(150, 40, 30), font=font_small)
    draw.text((cx + radius - 25, cy - 6), "★", fill=(150, 40, 30), font=font_small)
    
    # Center text
    font_center = get_font(14, bold=True)
    draw.text((cx - 38, cy - 20), "सत्यमेव", fill=(150, 40, 30), font=font_center)
    draw.text((cx - 30, cy + 2), "जयते", fill=(150, 40, 30), font=font_center)
    
    # Bottom arc text
    font_sub = get_font(10)
    draw.text((cx - 42, cy + 30), "सील तहसीलदार", fill=(150, 40, 30), font=font_sub)

def draw_qr_code_box(draw: ImageDraw.ImageDraw, x: int, y: int, size: int = 90, label: str = "डिजिटल सत्यापन"):
    """Draw a mock digital QR code box with verification metadata."""
    draw.rectangle([x, y, x + size, y + size], outline=(40, 50, 70), fill=(255, 255, 255), width=2)
    # Mock QR pattern blocks
    blk = size // 6
    draw.rectangle([x + 6, y + 6, x + 6 + blk * 2, y + 6 + blk * 2], fill=(20, 30, 50))
    draw.rectangle([x + 10, y + 10, x + 2 + blk * 2, y + 2 + blk * 2], fill=(255, 255, 255))
    draw.rectangle([x + 14, y + 14, x - 2 + blk * 2, y - 2 + blk * 2], fill=(20, 30, 50))
    
    draw.rectangle([x + size - 6 - blk * 2, y + 6, x + size - 6, y + 6 + blk * 2], fill=(20, 30, 50))
    draw.rectangle([x + size - 2 - blk * 2, y + 10, x + size - 10, y + 2 + blk * 2], fill=(255, 255, 255))
    
    draw.rectangle([x + 6, y + size - 6 - blk * 2, x + 6 + blk * 2, y + size - 6], fill=(20, 30, 50))
    draw.rectangle([x + 10, y + size - 2 - blk * 2, x + 2 + blk * 2, y + size - 10], fill=(255, 255, 255))
    
    # Internal random data dots
    for r in range(2, 5):
        for c in range(2, 5):
            if (r + c) % 2 == 0:
                draw.rectangle([x + c * blk, y + r * blk, x + c * blk + blk - 2, y + r * blk + blk - 2], fill=(20, 30, 50))
                
    font_lbl = get_font(10)
    draw.text((x + 2, y + size + 4), label, fill=(80, 90, 110), font=font_lbl)


# ─────────────────────────────────────────────────────────────────────────────
# Document 1: Khatauni (RoR) - 13 Column Layout CH-41/45
# ─────────────────────────────────────────────────────────────────────────────
def generate_khatauni_pdf(output_path: str):
    W, H = 2480, 3508  # A4 at 300 DPI
    img = Image.new("RGB", (W, H), color=(253, 251, 245))  # Authentic slight cream tint
    draw = ImageDraw.Draw(img)
    
    # Double Border
    draw.rectangle([50, 50, W - 50, H - 50], outline=(30, 40, 60), width=4)
    draw.rectangle([60, 60, W - 60, H - 60], outline=(70, 80, 100), width=2)
    
    # Watermark background
    font_wm = get_font(140, bold=True)
    draw.text((W // 2 - 450, H // 2 - 80), "भू-प्रमाण नमूना", fill=(240, 235, 225), font=font_wm)
    draw.text((W // 2 - 420, H // 2 + 100), "BHUPRAMAAN", fill=(240, 235, 225), font=font_wm)
    
    # Header
    font_h1 = get_font(44, bold=True)
    font_h2 = get_font(32, bold=True)
    font_body = get_font(24)
    font_bold = get_font(24, bold=True)
    font_small = get_font(20)
    
    draw.text((W // 2 - 320, 100), "राजस्व परिषद उत्तर प्रदेश", fill=(10, 25, 45), font=font_h1)
    draw.text((W // 2 - 420, 160), "खतौनी (अधिकार अभिलेख) - उद्धरण प्रारूप खतौनी (CH-41)", fill=(130, 30, 20), font=font_h2)
    draw.text((W // 2 - 280, 215), "उत्तर प्रदेश राजस्व संहिता, 2006 की धारा 31(2)", fill=(60, 70, 90), font=font_small)
    
    draw.line([(80, 260), (W - 80, 260)], fill=(30, 40, 60), width=3)
    
    # Metadata Row 1
    y_meta = 280
    draw.text((90, y_meta), "ग्राम का नाम: ", fill=(20, 30, 50), font=font_bold)
    draw.text((230, y_meta), "अलीगंज (कोड: 09010101)", fill=(0, 0, 0), font=font_body)
    
    draw.text((700, y_meta), "परगना: ", fill=(20, 30, 50), font=font_bold)
    draw.text((790, y_meta), "लखनऊ", fill=(0, 0, 0), font=font_body)
    
    draw.text((1150, y_meta), "तहसील: ", fill=(20, 30, 50), font=font_bold)
    draw.text((1240, y_meta), "सदर (कोड: 090101)", fill=(0, 0, 0), font=font_body)
    
    draw.text((1700, y_meta), "जनपद: ", fill=(20, 30, 50), font=font_bold)
    draw.text((1780, y_meta), "लखनऊ (कोड: 0901)", fill=(0, 0, 0), font=font_body)
    
    # Metadata Row 2
    y_meta2 = 330
    draw.text((90, y_meta2), "फसली वर्ष: ", fill=(20, 30, 50), font=font_bold)
    draw.text((220, y_meta2), "1428 - 1433", fill=(0, 0, 0), font=font_body)
    
    draw.text((700, y_meta2), "भाग सं.: ", fill=(20, 30, 50), font=font_bold)
    draw.text((790, y_meta2), "1 (एक)", fill=(0, 0, 0), font=font_body)
    
    draw.text((1150, y_meta2), "खाता सं.: ", fill=(20, 30, 50), font=font_bold)
    draw.text((1260, y_meta2), "00142", fill=(130, 30, 20), font=get_font(26, bold=True))
    
    draw.text((1700, y_meta2), "प्रमाणन दिनांक: ", fill=(20, 30, 50), font=font_bold)
    draw.text((1870, y_meta2), "28-09-2026", fill=(0, 0, 0), font=font_body)
    
    draw.line([(80, 385), (W - 80, 385)], fill=(30, 40, 60), width=2)
    
    # 13-Column Table
    # Columns definition: (col_title_hi, col_no, width)
    cols = [
        ("खाता सं.", "1", 160),
        ("खातेदार का नाम, पिता/पति का नाम\nव निवास स्थान", "2", 480),
        ("भौमिक अधि.\nप्रारम्भ वर्ष", "3", 160),
        ("खसरा / गाटा\nसंख्या", "4", 220),
        ("क्षेत्रफल\n(हेक्टेयर)", "5", 220),
        ("देय मालगुजारी\n/ लगान (रु.)", "6", 180),
        ("परिवर्तन संबंधी आदेश एवं\nन्यायालय का विवरण", "7-12", 640),
        ("विशेष विवरण / बंधक", "13", 260)
    ]
    
    y_table = 410
    h_header = 140
    
    # Draw table header background
    draw.rectangle([80, y_table, W - 80, y_table + h_header], fill=(238, 242, 248), outline=(30, 40, 60), width=2)
    
    cur_x = 80
    font_th = get_font(18, bold=True)
    for title, cnum, width in cols:
        draw.line([(cur_x, y_table), (cur_x, y_table + h_header)], fill=(30, 40, 60), width=2)
        lines = title.split("\n")
        y_text = y_table + 15
        for line in lines:
            draw.text((cur_x + 10, y_text), line, fill=(15, 25, 45), font=font_th)
            y_text += 26
        draw.text((cur_x + width // 2 - 10, y_table + h_header - 30), f"({cnum})", fill=(100, 110, 130), font=get_font(16))
        cur_x += width
    draw.line([(cur_x, y_table), (cur_x, y_table + h_header)], fill=(30, 40, 60), width=2)
    
    # Row Data
    rows = [
        {
            "khata": "00142",
            "owners": "1. रामेश कुमार पुत्र दीनानाथ\n   निवासी ग्राम अलीगंज (हिस्सा: 1/2)\n2. सुरेश कुमार पुत्र दीनानाथ\n   निवासी ग्राम अलीगंज (हिस्सा: 1/2)",
            "year": "1412 फसली",
            "khasras": "412/1\n412/2\n415",
            "areas": "0.8520\n0.4210\n1.1200\nकुल: 2.3930 हे.",
            "rent": "₹48.50\n(वार्षिक)",
            "orders": "न्यायालय तहसीलदार सदर, वाद सं. 142/2018\nआदेश दिनांक 14-04-2018 धारा 34 के तहत:\n'मृतक दीनानाथ के स्थान पर वारिसान रामेश कुमार\nव सुरेश कुमार का नाम व हिस्सा 1/2-1/2 दर्ज हो।'\nह० तहसीलदार सदर, लखनऊ।",
            "remarks": "बंधक: भारतीय स्टेट बैंक\nकृषि विकास शाखा लखनऊ\nऋण राशि: ₹2,50,000/-\nदिनांक: 10-06-2021"
        }
    ]
    
    y_row = y_table + h_header
    h_row = 560
    
    draw.rectangle([80, y_row, W - 80, y_row + h_row], fill=(255, 255, 255), outline=(30, 40, 60), width=2)
    cur_x = 80
    font_cell = get_font(21)
    font_cell_bold = get_font(21, bold=True)
    
    for r in rows:
        cx = 80
        # Col 1
        draw.text((cx + 30, y_row + 30), r["khata"], fill=(0, 0, 0), font=font_cell_bold)
        draw.line([(cx + cols[0][2], y_row), (cx + cols[0][2], y_row + h_row)], fill=(30, 40, 60), width=2)
        cx += cols[0][2]
        
        # Col 2 Owners
        draw.text((cx + 15, y_row + 30), r["owners"], fill=(10, 20, 40), font=font_cell)
        draw.line([(cx + cols[1][2], y_row), (cx + cols[1][2], y_row + h_row)], fill=(30, 40, 60), width=2)
        cx += cols[1][2]
        
        # Col 3 Year
        draw.text((cx + 15, y_row + 30), r["year"], fill=(0, 0, 0), font=font_cell)
        draw.line([(cx + cols[2][2], y_row), (cx + cols[2][2], y_row + h_row)], fill=(30, 40, 60), width=2)
        cx += cols[2][2]
        
        # Col 4 Khasra
        draw.text((cx + 25, y_row + 30), r["khasras"], fill=(130, 30, 20), font=font_cell_bold)
        draw.line([(cx + cols[3][2], y_row), (cx + cols[3][2], y_row + h_row)], fill=(30, 40, 60), width=2)
        cx += cols[3][2]
        
        # Col 5 Areas
        draw.text((cx + 20, y_row + 30), r["areas"], fill=(0, 100, 40), font=font_cell_bold)
        draw.line([(cx + cols[4][2], y_row), (cx + cols[4][2], y_row + h_row)], fill=(30, 40, 60), width=2)
        cx += cols[4][2]
        
        # Col 6 Rent
        draw.text((cx + 25, y_row + 30), r["rent"], fill=(0, 0, 0), font=font_cell)
        draw.line([(cx + cols[5][2], y_row), (cx + cols[5][2], y_row + h_row)], fill=(30, 40, 60), width=2)
        cx += cols[5][2]
        
        # Col 7-12 Orders
        draw.text((cx + 15, y_row + 25), r["orders"], fill=(20, 30, 60), font=font_cell)
        draw.line([(cx + cols[6][2], y_row), (cx + cols[6][2], y_row + h_row)], fill=(30, 40, 60), width=2)
        cx += cols[6][2]
        
        # Col 13 Remarks
        draw.text((cx + 15, y_row + 25), r["remarks"], fill=(150, 40, 30), font=font_cell)
        draw.line([(cx + cols[7][2], y_row), (cx + cols[7][2], y_row + h_row)], fill=(30, 40, 60), width=2)
    
    # Second Row: Empty / Divider
    y_row2 = y_row + h_row
    h_row2 = 120
    draw.rectangle([80, y_row2, W - 80, y_row2 + h_row2], fill=(248, 250, 252), outline=(30, 40, 60), width=2)
    draw.text((90, y_row2 + 35), "कुल गाटा संख्या: 3    |    कुल क्षेत्रफल: 2.3930 हेक्टेयर    |    कुल लगान: ₹48.50 वार्षिक", fill=(0, 30, 80), font=get_font(26, bold=True))
    
    # Official Verification Footer
    y_foot = y_row2 + h_row2 + 80
    draw_official_seal(draw, 350, y_foot + 100, radius=90)
    draw_qr_code_box(draw, 100, y_foot + 40, size=130, label="भूलेख डिजिटल सत्यापन")
    
    draw.text((650, y_foot + 30), "यह अभिलेख भूलेख कम्प्यूटरीकृत प्रणाली द्वारा निर्गत आधिकारिक प्रतिलिपि है।", fill=(20, 30, 50), font=font_bold)
    draw.text((650, y_foot + 75), "डिजिटल हस्ताक्षर: तहसीलदार, तहसील सदर, जनपद लखनऊ (उत्तर प्रदेश)", fill=(60, 70, 90), font=font_body)
    draw.text((650, y_foot + 115), "डिजिटल टोकन आईडी: BPLK-UP-LKO-2026-CH41-001429817", fill=(100, 110, 130), font=get_font(18))
    draw.text((650, y_foot + 155), "सत्यापन लिंक: https://upbhulekh.gov.in/verify/001429817", fill=(0, 102, 204), font=get_font(18))
    
    # Signature Box on right
    draw.rectangle([W - 550, y_foot + 20, W - 100, y_foot + 200], outline=(100, 120, 150), fill=(255, 255, 255), width=2)
    draw.text((W - 510, y_foot + 40), "Digitally Signed by:", fill=(80, 90, 110), font=get_font(16))
    draw.text((W - 510, y_foot + 70), "TEHSILDAR SADAR", fill=(10, 30, 60), font=get_font(20, bold=True))
    draw.text((W - 510, y_foot + 105), "Date: 2026.09.28 11:42:15 IST", fill=(60, 70, 90), font=get_font(16))
    draw.text((W - 510, y_foot + 140), "Reason: Land Record Certification", fill=(80, 90, 110), font=get_font(16))
    
    img.save(output_path, "PDF", resolution=300.0)
    print(f"Generated Khatauni PDF: {output_path}")


# ─────────────────────────────────────────────────────────────────────────────
# Document 2: Registered Sale Deed (बही सं. 1 / विक्रय विलेख)
# ─────────────────────────────────────────────────────────────────────────────
def generate_sale_deed_pdf(output_path: str):
    W, H = 2480, 3508
    img = Image.new("RGB", (W, H), color=(255, 254, 250))
    draw = ImageDraw.Draw(img)
    
    # Border
    draw.rectangle([50, 50, W - 50, H - 50], outline=(40, 50, 70), width=4)
    
    # e-Stamp Certificate Header Banner
    draw.rectangle([80, 80, W - 80, 420], outline=(150, 110, 30), fill=(253, 248, 235), width=3)
    draw.rectangle([90, 90, W - 90, 410], outline=(180, 140, 50), width=1)
    
    font_h1 = get_font(36, bold=True)
    font_h2 = get_font(28, bold=True)
    font_body = get_font(22)
    font_bold = get_font(22, bold=True)
    
    draw.text((W // 2 - 380, 105), "इ-स्टाम्प प्रमाणपत्र / e-STAMP CERTIFICATE", fill=(120, 40, 20), font=font_h1)
    draw.text((W // 2 - 250, 155), "GOVERNMENT OF UTTAR PRADESH", fill=(30, 40, 60), font=get_font(22, bold=True))
    draw.text((W // 2 - 180, 185), "पंजीयन विभाग (Registration Department)", fill=(80, 90, 110), font=get_font(18))
    
    draw.line([(100, 220), (W - 100, 220)], fill=(180, 140, 50), width=2)
    
    # e-Stamp details
    draw.text((120, 235), "प्रमाणपत्र सं. (Cert No.): ", fill=(30, 40, 60), font=font_bold)
    draw.text((380, 235), "IN-UP98234710928374W", fill=(130, 20, 20), font=font_bold)
    
    draw.text((1300, 235), "स्टाम्प शुल्क (Duty Amount): ", fill=(30, 40, 60), font=font_bold)
    draw.text((1650, 235), "₹1,45,000/- (एक लाख पैंतालीस हजार रुपये)", fill=(0, 100, 40), font=font_bold)
    
    draw.text((120, 280), "प्रथम पक्ष (First Party): ", fill=(30, 40, 60), font=font_bold)
    draw.text((380, 280), "श्री हरिश्चंद्र पुत्र स्व. बाबूराम", fill=(0, 0, 0), font=font_body)
    
    draw.text((1300, 280), "द्वितीय पक्ष (Second Party): ", fill=(30, 40, 60), font=font_bold)
    draw.text((1620, 280), "श्रीमती सुनीता देवी पत्नी राजेश सिंह", fill=(0, 0, 0), font=font_body)
    
    draw.text((120, 325), "विवरण (Description): ", fill=(30, 40, 60), font=font_bold)
    draw.text((380, 325), "विक्रय विलेख (Sale Deed) - अचल संपत्ति", fill=(0, 0, 0), font=font_body)
    
    draw.text((1300, 325), "प्रतिफल मूल्य (Consideration): ", fill=(30, 40, 60), font=font_bold)
    draw.text((1650, 325), "₹28,50,000/- (अठ्ठाईस लाख पचास हजार)", fill=(130, 20, 20), font=font_bold)
    
    draw.text((120, 370), "निबंधन कार्यालय: उप-निबंधक (द्वितीय) सदर, लखनऊ", fill=(80, 90, 110), font=get_font(18))
    draw.text((1300, 370), "पंजीकरण दिनांक: 14-दिसंबर-2023", fill=(80, 90, 110), font=get_font(18))
    
    # Deed Title
    draw.text((W // 2 - 280, 470), "पंजीकृत विक्रय विलेख (बैनामा)", fill=(10, 25, 45), font=get_font(40, bold=True))
    draw.text((W // 2 - 160, 525), "बही सं. 1, जिल्द सं. 1402, पृष्ठ 85-112", fill=(100, 110, 130), font=get_font(20))
    
    # Main Body Text
    y_txt = 590
    paragraphs = [
        "जो कि विक्रेता श्री हरिश्चंद्र पुत्र स्व. बाबूराम, निवासी ग्राम कसमंडी कलां, परगना व तहसील सदर, जनपद लखनऊ का पूर्ण स्वामित्व एवं आधिपत्य निम्नलिखित अचल संपत्ति पर बतौर भूमिधर अधिकार दर्ज कागजात है।",
        "यह कि विक्रेता को अपनी पारिवारिक आवश्यकताओं एवं व्यवसाय विस्तार हेतु तत्काल धनराशि की आवश्यकता होने के कारण उसने अपनी उपरोक्त संपत्ति का एक भाग विक्रय करने का प्रस्ताव द्वितीय पक्ष (क्रेता) के समक्ष रखा।",
        "यह कि क्रेता श्रीमती सुनीता देवी पत्नी श्री राजेश सिंह, निवासी दीनदयाल नगर, लखनऊ ने कुल प्रतिफल राशि ₹28,50,000/- (अठ्ठाईस लाख पचास हजार रुपये मात्र) में क्रय करना स्वीकार किया।",
        "यह कि संपूर्ण प्रतिफल राशि विक्रेता ने बैंक ड्राफ्ट सं. 481920 (एसबीआई लखनऊ) के माध्यम से प्राप्त कर ली है और अब कोई धनराशि विक्रेता की क्रेता पर शेष नहीं है। अतः विक्रेता ने संपत्ति का वास्तविक, भौतिक एवं निष्कंटक कब्जा क्रेता को सौंप दिया है।"
    ]
    
    for p in paragraphs:
        draw.text((100, y_txt), p, fill=(20, 30, 50), font=font_body)
        y_txt += 85
        
    # Property Specification Box
    draw.rectangle([100, y_txt + 20, W - 100, y_txt + 380], fill=(245, 248, 252), outline=(30, 60, 100), width=2)
    draw.text((120, y_txt + 40), "विक्रीत संपत्ति का विशिष्ट विवरण (Property Description):", fill=(10, 30, 70), font=get_font(24, bold=True))
    
    draw.text((140, y_txt + 90), "• खसरा / गाटा संख्या: 348/2 (भाग)", fill=(0, 0, 0), font=font_bold)
    draw.text((700, y_txt + 90), "• कुल विक्रीत क्षेत्रफल: 2500 वर्ग फीट (232.25 वर्ग मीटर)", fill=(0, 0, 0), font=font_bold)
    draw.text((1600, y_txt + 90), "• भूमि श्रेणी: अकृषिक / आवासीय", fill=(0, 0, 0), font=font_bold)
    
    draw.text((140, y_txt + 140), "• ग्राम: कसमंडी कलां", fill=(0, 0, 0), font=font_body)
    draw.text((700, y_txt + 140), "• परगना व तहसील: सदर", fill=(0, 0, 0), font=font_body)
    draw.text((1600, y_txt + 140), "• जनपद: लखनऊ (उ०प्र०)", fill=(0, 0, 0), font=font_body)
    
    # Boundaries (चौहद्दी) Table
    draw.text((140, y_txt + 200), "संपत्ति की चौहद्दी (Boundaries):", fill=(130, 30, 20), font=get_font(22, bold=True))
    draw.text((160, y_txt + 245), "पूर्व (East): 30 फीट चौड़ा संपर्क मार्ग", fill=(20, 30, 50), font=font_body)
    draw.text((1000, y_txt + 245), "पश्चिम (West): विक्रेता की शेष भूमि (गाटा 348/1)", fill=(20, 30, 50), font=font_body)
    draw.text((160, y_txt + 295), "उत्तर (North): भूखंड संख्या 15 (श्री श्यामलाल का मकान)", fill=(20, 30, 50), font=font_body)
    draw.text((1000, y_txt + 295), "दक्षिण (South): भूखंड संख्या 13 (श्री महेंद्र सिंह की भूमि)", fill=(20, 30, 50), font=font_body)
    
    y_sig = y_txt + 450
    # Signatures & Fingerprint Boxes
    # Box 1: Seller
    draw.rectangle([100, y_sig, 550, y_sig + 260], outline=(70, 80, 100), fill=(255, 255, 255), width=2)
    draw.text((120, y_sig + 15), "हस्ताक्षर / निशानी अंगूठा विक्रेता:", fill=(50, 60, 80), font=get_font(18, bold=True))
    draw.text((150, y_sig + 100), "हरिश्चंद्र", fill=(0, 0, 120), font=get_font(32, bold=True))
    draw.text((120, y_sig + 220), "श्री हरिश्चंद्र (Seller)", fill=(80, 90, 110), font=get_font(18))
    
    # Box 2: Buyer
    draw.rectangle([650, y_sig, 1100, y_sig + 260], outline=(70, 80, 100), fill=(255, 255, 255), width=2)
    draw.text((670, y_sig + 15), "हस्ताक्षर / निशानी अंगूठा क्रेता:", fill=(50, 60, 80), font=get_font(18, bold=True))
    draw.text((700, y_sig + 100), "सुनीता देवी", fill=(0, 0, 120), font=get_font(32, bold=True))
    draw.text((670, y_sig + 220), "श्रीमती सुनीता देवी (Buyer)", fill=(80, 90, 110), font=get_font(18))
    
    # Box 3: Sub-Registrar Official Endorsement Stamp
    draw.rectangle([1200, y_sig - 20, W - 100, y_sig + 280], outline=(150, 30, 20), fill=(254, 249, 248), width=3)
    draw_official_seal(draw, W - 300, y_sig + 130, radius=80)
    draw.text((1230, y_sig + 10), "कार्यालय उप-निबंधक सदर, लखनऊ", fill=(120, 20, 20), font=get_font(22, bold=True))
    draw.text((1230, y_sig + 50), "दस्तावेज संख्या: 4821 / वर्ष 2023", fill=(0, 0, 0), font=font_bold)
    draw.text((1230, y_sig + 90), "पंजीकरण शुल्क: ₹28,500/-", fill=(0, 0, 0), font=font_body)
    draw.text((1230, y_sig + 130), "नकल फीस: ₹500/-", fill=(0, 0, 0), font=font_body)
    draw.text((1230, y_sig + 170), "हस्ताक्षर उप-निबंधक (द्वितीय)", fill=(10, 30, 80), font=get_font(20, bold=True))
    draw.text((1230, y_sig + 215), "दिनांक: 14/12/2023", fill=(60, 70, 90), font=font_body)
    
    img.save(output_path, "PDF", resolution=300.0)
    print(f"Generated Sale Deed PDF: {output_path}")


# ─────────────────────────────────────────────────────────────────────────────
# Document 3: Dakhil Kharij (Mutation Order)
# ─────────────────────────────────────────────────────────────────────────────
def generate_mutation_order_pdf(output_path: str):
    W, H = 2480, 3508
    img = Image.new("RGB", (W, H), color=(253, 252, 248))
    draw = ImageDraw.Draw(img)
    
    draw.rectangle([50, 50, W - 50, H - 50], outline=(30, 40, 60), width=4)
    
    font_h1 = get_font(38, bold=True)
    font_h2 = get_font(28, bold=True)
    font_body = get_font(24)
    font_bold = get_font(24, bold=True)
    
    # Top Court Emblem & Title
    draw.text((W // 2 - 440, 110), "न्यायालय तहसीलदार (न्यायिक), तहसील सदर, लखनऊ", fill=(10, 25, 50), font=font_h1)
    draw.text((W // 2 - 250, 175), "नामांतरण आदेश (दाखिल-खारिज)", fill=(140, 30, 20), font=font_h2)
    draw.text((W // 2 - 340, 225), "उत्तर प्रदेश राजस्व संहिता, 2006 की धारा 34 / 35 के अंतर्गत", fill=(80, 90, 110), font=get_font(20))
    
    draw.line([(80, 275), (W - 80, 275)], fill=(30, 40, 60), width=3)
    
    # Case Details Box
    draw.rectangle([90, 305, W - 90, 520], fill=(245, 248, 252), outline=(100, 120, 150), width=2)
    draw.text((120, 330), "वाद संख्या: 202409010101429", fill=(130, 20, 20), font=get_font(26, bold=True))
    draw.text((1200, 330), "कंप्यूटरीकृत वाद संख्या: T202409010101429", fill=(50, 60, 80), font=font_bold)
    
    draw.text((120, 385), "वादीगण: रामेश कुमार व सुरेश कुमार पुत्रगण स्व. दीनानाथ", fill=(0, 0, 0), font=font_bold)
    draw.text((120, 430), "बनाम: राज्य / आम जनता (वारिसान वाद)", fill=(0, 0, 0), font=font_bold)
    
    draw.text((120, 475), "ग्राम: अलीगंज    |    परगना व तहसील: सदर    |    जनपद: लखनऊ    |    गाटा सं.: 412/1 (0.8520 हे.)", fill=(20, 30, 70), font=font_bold)
    
    # Legal Order Text
    y_txt = 570
    order_paras = [
        "आदेश",
        "आज यह पत्रावली प्रस्तुत हुई। पुकार कराई गई। वादीगण के विद्वान अधिवक्ता उपस्थित हुए। राज्य की ओर से नामिका अधिवक्ता उपस्थित रहे।",
        "पत्रावली का सम्यक परिशीलन किया गया। वाद की संक्षिप्त पृष्ठभूमि इस प्रकार है कि वादीगण द्वारा ग्राम अलीगंज के खाता संख्या 00142 स्थित गाटा संख्या 412/1 रकबा 0.8520 हेक्टेयर के मूल खातेदार दीनानाथ की मृत्यु उपरांत वारिसान दर्ज करने हेतु प्रार्थना पत्र प्रस्तुत किया गया।",
        "नियमानुसार इश्तेहार आम निर्गत किया गया जो बाद तामीला संलग्न पत्रावली है। नियत अवधि के भीतर कोई आपत्ति प्राप्त नहीं हुई।",
        "क्षेत्रीय लेखपाल व राजस्व निरीक्षक की आख्या दिनांक 04-03-2024 प्राप्त हुई। आख्यानुसार मूल खातेदार दीनानाथ की मृत्यु दिनांक 12-01-2024 को हो चुकी है तथा उनके विधिक उत्तराधिकारी उनके दो पुत्र रामेश कुमार व सुरेश कुमार हैं। मृतक के कोई अन्य विधिक वारिस शेष नहीं हैं।",
        "अतः न्यायहित में पत्रावली पर उपलब्ध साक्ष्यों व राजस्व निरीक्षक की आख्या के आधार पर मृतक खातेदार का नाम खारिज कर उनके विधिक वारिसान का नाम अंकित किया जाना विधि सम्मत प्रतीत होता है।"
    ]
    
    for i, p in enumerate(order_paras):
        if i == 0:
            draw.text((W // 2 - 50, y_txt), p, fill=(130, 20, 20), font=get_font(32, bold=True))
            y_txt += 60
        else:
            draw.text((100, y_txt), p, fill=(15, 25, 45), font=font_body)
            y_txt += 75
            
    # Operative Portion / अंतिम आदेश
    draw.rectangle([90, y_txt + 30, W - 90, y_txt + 320], fill=(255, 250, 240), outline=(150, 40, 20), width=3)
    draw.text((120, y_txt + 55), "अंतिम आदेश (FINAL OPERATIVE ORDER):", fill=(140, 20, 20), font=get_font(26, bold=True))
    
    op_text = (
        "ग्राम अलीगंज, परगना व तहसील सदर, जनपद लखनऊ के खाता संख्या 00142 स्थित गाटा संख्या 412/1\n"
        "रकबा 0.8520 हेक्टेयर, लगान ₹18.50 वार्षिक से मृतक खातेदार दीनानाथ पुत्र शिवराम का नाम खारिज होकर\n"
        "उनके विधिक पुत्रगण रामेश कुमार व सुरेश कुमार पुत्रगण स्व. दीनानाथ, निवासी ग्राम अलीगंज का नाम बतौर वारिस\n"
        "समान अंश (1/2 - 1/2) दर्ज कागजात हो। तदनुसार खतौनी में अमलदरामद किया जाए। पत्रावली दाखिल दफ्तर हो।"
    )
    draw.text((130, y_txt + 115), op_text, fill=(0, 20, 60), font=font_bold)
    
    # Judicial Seal & Signature
    y_jud = y_txt + 400
    draw_official_seal(draw, 350, y_jud + 120, radius=90)
    
    draw.text((W - 700, y_jud + 50), "दिनांक: 18-मार्च-2024", fill=(0, 0, 0), font=font_bold)
    draw.text((W - 700, y_jud + 110), "(तहसीलदार न्यायिक)", fill=(10, 30, 70), font=get_font(28, bold=True))
    draw.text((W - 700, y_jud + 155), "तहसील सदर, जनपद लखनऊ", fill=(60, 70, 90), font=font_body)
    draw.text((W - 700, y_jud + 195), "न्यायालय मुहर सहित", fill=(100, 110, 130), font=get_font(18))
    
    img.save(output_path, "PDF", resolution=300.0)
    print(f"Generated Mutation Order PDF: {output_path}")


# ─────────────────────────────────────────────────────────────────────────────
# Document 4: Cadastral Bhu-Naksha Plot Map & Survey Parcha
# ─────────────────────────────────────────────────────────────────────────────
def generate_cadastral_map_pdf(output_path: str):
    W, H = 2480, 3508
    img = Image.new("RGB", (W, H), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    draw.rectangle([50, 50, W - 50, H - 50], outline=(30, 40, 60), width=4)
    
    font_h1 = get_font(38, bold=True)
    font_h2 = get_font(26, bold=True)
    font_bold = get_font(22, bold=True)
    font_body = get_font(20)
    
    draw.text((W // 2 - 380, 100), "राजस्व परिषद उत्तर प्रदेश - डिजिटल भू-नक्शा", fill=(10, 25, 45), font=font_h1)
    draw.text((W // 2 - 280, 160), "कैडेस्ट्रल सर्वे शीट एवं खसरा नक्शा पर्ची", fill=(130, 30, 20), font=font_h2)
    draw.text((100, 220), "ग्राम: अलीगंज (09010101)  |  तहसील: सदर  |  जनपद: लखनऊ  |  पैमाना 1:4000  |  शीट संख्या: 04", fill=(50, 60, 80), font=font_bold)
    
    draw.line([(80, 260), (W - 80, 260)], fill=(30, 40, 60), width=3)
    
    # Map Canvas Box
    map_x, map_y = 100, 300
    map_w, map_h = W - 200, 1800
    draw.rectangle([map_x, map_y, map_x + map_w, map_y + map_h], fill=(249, 251, 248), outline=(40, 50, 70), width=3)
    
    # Background Grid lines
    for gx in range(map_x + 100, map_x + map_w, 200):
        draw.line([(gx, map_y), (gx, map_y + map_h)], fill=(230, 235, 230), width=1)
    for gy in range(map_y + 100, map_y + map_h, 200):
        draw.line([(map_x, gy), (map_x + map_w, gy)], fill=(230, 235, 230), width=1)
        
    # Compass Rose / North Arrow
    nx, ny = map_x + map_w - 180, map_y + 180
    draw.line([(nx, ny + 70), (nx, ny - 70)], fill=(180, 30, 20), width=4)
    draw.polygon([(nx, ny - 90), (nx - 18, ny - 60), (nx + 18, ny - 60)], fill=(180, 30, 20))
    draw.text((nx - 10, ny - 130), "N", fill=(180, 30, 20), font=get_font(28, bold=True))
    draw.text((nx - 25, ny + 85), "उत्तर", fill=(180, 30, 20), font=get_font(18, bold=True))
    
    # Road (मार्ग)
    road_pts = [(map_x + 150, map_y + 350), (map_x + 500, map_y + 600), (map_x + 1100, map_y + 900), (map_x + map_w - 100, map_y + 1100)]
    draw.line(road_pts, fill=(140, 110, 60), width=24)
    draw.text((map_x + 300, map_y + 440), "═══ 30 फीट पक्का डामर संपर्क मार्ग ═══", fill=(100, 70, 30), font=get_font(20, bold=True))
    
    # Canal / Nala
    canal_pts = [(map_x + 50, map_y + 1500), (map_x + 600, map_y + 1400), (map_x + 1300, map_y + 1600), (map_x + map_w - 50, map_y + 1550)]
    draw.line(canal_pts, fill=(50, 130, 190), width=16)
    draw.text((map_x + 700, map_y + 1500), "~ ~ ~ सरकारी माइनर / नहर ~ ~ ~", fill=(20, 90, 150), font=get_font(20, bold=True))
    
    # Cadastral Parcels / Polygons
    parcels = [
        {"poly": [(400, 650), (950, 680), (900, 1150), (350, 1100)], "khasra": "412/1", "area": "0.8520 Ha", "owner": "रामेश व सुरेश", "color": (255, 235, 205)},
        {"poly": [(950, 680), (1450, 720), (1400, 1200), (900, 1150)], "khasra": "412/2", "area": "0.4210 Ha", "owner": "रामेश व सुरेश", "color": (230, 245, 225)},
        {"poly": [(1450, 720), (2000, 760), (1950, 1250), (1400, 1200)], "khasra": "415", "area": "1.1200 Ha", "owner": "कृषि भूमि", "color": (235, 240, 255)},
        {"poly": [(350, 1100), (900, 1150), (850, 1400), (300, 1380)], "khasra": "411", "area": "0.5200 Ha", "owner": "महेंद्र सिंह", "color": (250, 250, 240)},
        {"poly": [(900, 1150), (1400, 1200), (1350, 1450), (850, 1400)], "khasra": "413", "area": "0.3800 Ha", "owner": "राजेंद्र प्रसाद", "color": (245, 245, 250)},
    ]
    
    for p in parcels:
        pts = p["poly"]
        draw.polygon(pts, fill=p["color"], outline=(20, 30, 50), width=3)
        # Calculate centroid
        cx = sum(pt[0] for pt in pts) // len(pts)
        cy = sum(pt[1] for pt in pts) // len(pts)
        
        draw.text((cx - 45, cy - 35), f"गाटा: {p['khasra']}", fill=(130, 20, 20), font=get_font(24, bold=True))
        draw.text((cx - 55, cy + 5), p["area"], fill=(0, 80, 30), font=get_font(20, bold=True))
        draw.text((cx - 65, cy + 40), p["owner"], fill=(50, 60, 80), font=get_font(18))
        
    # Boundary lengths on parcel 412/1
    draw.text((640, 645), "182.5 m", fill=(100, 20, 20), font=get_font(16))
    draw.text((935, 900), "114.2 m", fill=(100, 20, 20), font=get_font(16))
    draw.text((580, 1135), "186.0 m", fill=(100, 20, 20), font=get_font(16))
    draw.text((320, 860), "112.8 m", fill=(100, 20, 20), font=get_font(16))
    
    # Parcel Analysis Table below Map
    y_tbl = map_y + map_h + 50
    draw.text((100, y_tbl), "गाटावार सर्वेक्षण विवरण (Parcel Cadastral Specifications):", fill=(10, 30, 60), font=get_font(24, bold=True))
    
    headers = ["गाटा सं.", "क्षेत्रफल (हे.)", "परिमाप (मीटर)", "भू-उपयोग", "सिंचाई स्रोत", "सॉइल ग्रेड", "स्वामित्व स्थिति"]
    widths = [200, 260, 260, 300, 300, 260, W - 200 - 1580]
    
    y_th = y_tbl + 45
    draw.rectangle([100, y_th, W - 100, y_th + 65], fill=(235, 240, 248), outline=(30, 40, 60), width=2)
    cur_x = 100
    for h_txt, w in zip(headers, widths):
        draw.text((cur_x + 15, y_th + 18), h_txt, fill=(10, 20, 40), font=get_font(19, bold=True))
        cur_x += w
        draw.line([(cur_x, y_th), (cur_x, y_th + 65)], fill=(30, 40, 60), width=2)
        
    p_rows = [
        ["412/1", "0.8520 हे.", "595.5 m", "कृषि (दो-फसली)", "सरकारी नलकूप", "दोमट (Grade A)", "खातेदार भूमिधर (रामेश व सुरेश)"],
        ["412/2", "0.4210 हे.", "382.4 m", "कृषि (एक-फसली)", "निजी बोरिंग", "बलुई दोमट", "खातेदार भूमिधर (रामेश व सुरेश)"],
        ["415", "1.1200 हे.", "780.0 m", "कृषि (बागवानी)", "नहर सिंचित", "कछार दोमट", "कृषि खातेदार"]
    ]
    
    y_tr = y_th + 65
    for r in p_rows:
        draw.rectangle([100, y_tr, W - 100, y_tr + 60], fill=(255, 255, 255), outline=(30, 40, 60), width=2)
        cur_x = 100
        for val, w in zip(r, widths):
            draw.text((cur_x + 15, y_tr + 18), val, fill=(20, 30, 50), font=get_font(18))
            cur_x += w
            draw.line([(cur_x, y_tr), (cur_x, y_tr + 60)], fill=(30, 40, 60), width=2)
        y_tr += 60
        
    # Surveyor Verification Block
    y_foot = y_tr + 50
    draw_official_seal(draw, 350, y_foot + 90, radius=80)
    draw_qr_code_box(draw, 100, y_foot + 30, size=120, label="GIS GeoJSON")
    
    draw.text((600, y_foot + 40), "प्रमाणित किया जाता है कि उपरोक्त नक्शा डिजिटल जीआईएस सर्वेक्षण 2024 के अनुसार सत्य है।", fill=(20, 30, 50), font=font_bold)
    draw.text((600, y_foot + 80), "भू-स्थानिक संदर्भ (CRS): EPSG:4326 (WGS 84)    |    प्रक्षेपण: UTM Zone 44N", fill=(60, 70, 90), font=font_body)
    draw.text((600, y_foot + 120), "डिजिटल हस्ताक्षर: सहायक भू-अभिलेख अधिकारी (A.S.O.), राजस्व परिषद, लखनऊ", fill=(10, 30, 70), font=font_bold)
    
    img.save(output_path, "PDF", resolution=300.0)
    print(f"Generated Cadastral Map PDF: {output_path}")


# ─────────────────────────────────────────────────────────────────────────────
# Document 5: Section 80 Non-Agricultural Declaration Sanction Order
# ─────────────────────────────────────────────────────────────────────────────
def generate_section80_pdf(output_path: str):
    W, H = 2480, 3508
    img = Image.new("RGB", (W, H), color=(254, 253, 250))
    draw = ImageDraw.Draw(img)
    
    draw.rectangle([50, 50, W - 50, H - 50], outline=(30, 40, 60), width=4)
    
    font_h1 = get_font(38, bold=True)
    font_h2 = get_font(28, bold=True)
    font_body = get_font(24)
    font_bold = get_font(24, bold=True)
    
    draw.text((W // 2 - 420, 110), "कार्यालय उप-जिलाधिकारी (एस.डी.एम.), सदर, लखनऊ", fill=(10, 25, 50), font=font_h1)
    draw.text((W // 2 - 400, 175), "गैर-कृषि भूमि उपयोग घोषणा प्रमाण पत्र (धारा 80)", fill=(140, 30, 20), font=font_h2)
    draw.text((W // 2 - 370, 225), "उत्तर प्रदेश राजस्व संहिता, 2006 की धारा 80(1) के अंतर्गत प्रदत्त", fill=(80, 90, 110), font=get_font(20))
    
    draw.line([(80, 275), (W - 80, 275)], fill=(30, 40, 60), width=3)
    
    # Metadata
    draw.rectangle([90, 305, W - 90, 500], fill=(245, 248, 252), outline=(100, 120, 150), width=2)
    draw.text((120, 330), "आदेश संख्या: SDM/SDR/SEC80/2024/089", fill=(130, 20, 20), font=get_font(26, bold=True))
    draw.text((1300, 330), "दिनांक: 15-मई-2024", fill=(0, 0, 0), font=font_bold)
    
    draw.text((120, 385), "आवेदक का नाम: श्री रामेश कुमार पुत्र स्व. दीनानाथ", fill=(0, 0, 0), font=font_bold)
    draw.text((1300, 385), "निवास: ग्राम अलीगंज, तहसील सदर, लखनऊ", fill=(0, 0, 0), font=font_body)
    
    draw.text((120, 440), "संबंधित भूमि: ग्राम अलीगंज, खाता सं. 00142, गाटा सं. 412/1 रकबा 0.2000 हे. (अंश भाग)", fill=(20, 30, 70), font=font_bold)
    
    y_txt = 550
    paras = [
        "आदेश",
        "आवेदक श्री रामेश कुमार पुत्र स्व. दीनानाथ द्वारा उत्तर प्रदेश राजस्व संहिता, 2006 की धारा 80(1) के अंतर्गत ग्राम अलीगंज स्थित गाटा संख्या 412/1 रकबा 0.8520 हेक्टेयर में से 0.2000 हेक्टेयर (दो हजार वर्ग मीटर) कृषि भूमि को गैर-कृषि प्रयोजन (आवासीय / सूक्ष्म वाणिज्यिक) घोषित किए जाने हेतु आवेदन पत्र प्रस्तुत किया गया।",
        "तहसीलदार सदर एवं अधिशासी अभियंता (पीडब्ल्यूडी) से जांच आख्या प्राप्त की गई। आख्यानुसार उक्त भूमि किसी सार्वजनिक प्रयोजन, ग्राम समाज, चकमार्ग अथवा जलमग्न भूमि की श्रेणी में नहीं आती है। मास्टर प्लान 2031 के अनुसार उक्त क्षेत्र आवासीय अनुज्ञेय क्षेत्र में स्थित है।",
        "आवेदक द्वारा निर्धारित प्रशमन शुल्क (Compounding / Conversion Fee) की धनराशि ₹1,20,000/- (एक लाख बीस हजार रुपये मात्र) सरकारी कोष (ट्रेजरी चालान सं. TR-902341) में जमा करा दी गई है।"
    ]
    for i, p in enumerate(paras):
        if i == 0:
            draw.text((W // 2 - 50, y_txt), p, fill=(130, 20, 20), font=get_font(32, bold=True))
            y_txt += 60
        else:
            draw.text((100, y_txt), p, fill=(15, 25, 45), font=font_body)
            y_txt += 85
            
    # Sanction order box
    draw.rectangle([90, y_txt + 30, W - 90, y_txt + 300], fill=(255, 250, 240), outline=(150, 40, 20), width=3)
    draw.text((120, y_txt + 55), "आदेश की मुख्य घोषणा (SANCTION DECLARATION):", fill=(140, 20, 20), font=get_font(26, bold=True))
    
    sanct_text = (
        "अतः उत्तर प्रदेश राजस्व संहिता, 2006 की धारा 80(1) के अंतर्गत प्रदत्त शक्तियों का प्रयोग करते हुए\n"
        "ग्राम अलीगंज के गाटा संख्या 412/1 स्थित 0.2000 हेक्टेयर भूमि को कृषि उपयोग से विमुक्त कर\n"
        "गैर-कृषि (आवासीय / वाणिज्यिक) उपयोग हेतु अधिकृत घोषित किया जाता है।\n"
        "तदनुसार राजस्व अभिलेखों (खतौनी) में प्रविष्टि संशोधित की जाए।"
    )
    draw.text((130, y_txt + 115), sanct_text, fill=(0, 20, 60), font=font_bold)
    
    y_jud = y_txt + 380
    draw_official_seal(draw, 350, y_jud + 110, radius=90)
    draw_qr_code_box(draw, 100, y_jud + 40, size=130, label="SDM पोर्टल सत्यापन")
    
    draw.text((W - 750, y_jud + 50), "(हस्ताक्षर उप-जिलाधिकारी)", fill=(10, 30, 70), font=get_font(28, bold=True))
    draw.text((W - 750, y_jud + 95), "उप-जिलाधिकारी (एस.डी.एम.) सदर", fill=(50, 60, 80), font=font_bold)
    draw.text((W - 750, y_jud + 135), "जनपद लखनऊ (उत्तर प्रदेश)", fill=(60, 70, 90), font=font_body)
    draw.text((W - 750, y_jud + 175), "डिजिटल सील एवं टोकन प्रमाणित", fill=(100, 110, 130), font=get_font(18))
    
    img.save(output_path, "PDF", resolution=300.0)
    print(f"Generated Section 80 PDF: {output_path}")


def main():
    # Target directories
    dirs = [
        "c:/Users/paras/SIH_ps2/data/demo",
        "c:/Users/paras/SIH_ps2/frontend/public/demo_pdfs"
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)
        
    for d in dirs:
        generate_khatauni_pdf(os.path.join(d, "01_Khatauni_RoR_Format_CH41.pdf"))
        generate_sale_deed_pdf(os.path.join(d, "02_Registered_Sale_Deed_Bahi1.pdf"))
        generate_mutation_order_pdf(os.path.join(d, "03_Dakhil_Kharij_Mutation_Order.pdf"))
        generate_cadastral_map_pdf(os.path.join(d, "04_Cadastral_Bhu_Naksha_Plot_Parcha.pdf"))
        generate_section80_pdf(os.path.join(d, "05_Section_80_Non_Agricultural_Sanction.pdf"))
        
    print("\nAll 5 realistic demo PDFs successfully generated in both data/demo and frontend/public/demo_pdfs!")

if __name__ == "__main__":
    main()
