#!/usr/bin/env python3
"""用 ReportLab 重新生成两本订阅者指南 PDF，嵌入写实配图"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak, Table, TableStyle, KeepTogether
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image as PILImage
import os, io

IMG_DIR = r"C:\Users\Administrator\Desktop\AI做的网站\chinese-folk-wellness\images\pdf_gen"
OUT_DIR = r"C:\Users\Administrator\Desktop\AI做的网站\chinese-folk-wellness\pdfs"
PAGE_W, PAGE_H = A4

def load_optimized_image(img_file, max_w=500):
    """加载图片，压缩后返回 JPEG 字节流"""
    # 先找 .png，找不到再找 .webp
    img_path_png = os.path.join(IMG_DIR, os.path.splitext(img_file)[0] + '.png')
    img_path_webp = os.path.join(IMG_DIR, img_file)
    if os.path.exists(img_path_png):
        img_path = img_path_png
    elif os.path.exists(img_path_webp):
        img_path = img_path_webp
    else:
        return None

    pil_img = PILImage.open(img_path)
    # 转 RGB（扔掉 alpha 通道，PDF 不需要）
    if pil_img.mode in ('RGBA', 'P'):
        pil_img = pil_img.convert('RGB')
    elif pil_img.mode != 'RGB':
        pil_img = pil_img.convert('RGB')

    # 等比缩放到目标宽度
    w, h = pil_img.size
    if w > max_w:
        ratio = max_w / w
        pil_img = pil_img.resize((max_w, int(h * ratio)), PILImage.LANCZOS)

    # 输出 JPEG 字节流
    buf = io.BytesIO()
    pil_img.save(buf, format='JPEG', quality=78, optimize=True)
    buf.seek(0)
    return buf

# 颜色
BROWN = HexColor("#5C3317")
TAN = HexColor("#A0522D")
WARM_BG = HexColor("#FDF8F0")
GREY = HexColor("#6B5B4A")
LIGHT_GREY = HexColor("#888888")
CREAM = HexColor("#FFF8EC")

def make_styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle('CoverTitle', fontName='Helvetica-Bold', fontSize=22, leading=28, textColor=BROWN, alignment=TA_CENTER, spaceAfter=6*mm))
    styles.add(ParagraphStyle('CoverSub', fontName='Helvetica', fontSize=11, leading=16, textColor=GREY, alignment=TA_CENTER, spaceAfter=2*mm))
    styles.add(ParagraphStyle('CoverMeta', fontName='Helvetica', fontSize=9, leading=13, textColor=LIGHT_GREY, alignment=TA_CENTER))
    styles.add(ParagraphStyle('SectionNum', fontName='Helvetica-Bold', fontSize=36, leading=40, textColor=TAN, alignment=TA_LEFT, spaceAfter=2*mm))
    styles.add(ParagraphStyle('SectionTitle', fontName='Helvetica-Bold', fontSize=16, leading=20, textColor=BROWN, alignment=TA_LEFT, spaceAfter=4*mm))
    styles.add(ParagraphStyle('SectionSubtitle', fontName='Helvetica', fontSize=12, leading=16, textColor=GREY, alignment=TA_LEFT, spaceAfter=2*mm))
    styles.add(ParagraphStyle('BodyText2', fontName='Helvetica', fontSize=10, leading=15, textColor=GREY, alignment=TA_JUSTIFY, spaceAfter=3*mm))
    styles.add(ParagraphStyle('HouseholdNote', fontName='Helvetica-Oblique', fontSize=10, leading=14, textColor=TAN, alignment=TA_LEFT, spaceAfter=3*mm, leftIndent=8*mm))
    styles.add(ParagraphStyle('Disclaimer', fontName='Helvetica', fontSize=7, leading=10, textColor=LIGHT_GREY, alignment=TA_CENTER, spaceAfter=1*mm))
    styles.add(ParagraphStyle('Footer', fontName='Helvetica', fontSize=7, leading=10, textColor=LIGHT_GREY, alignment=TA_CENTER))
    styles.add(ParagraphStyle('TOCItem', fontName='Helvetica', fontSize=10, leading=16, textColor=GREY, alignment=TA_LEFT))
    styles.add(ParagraphStyle('IntroBody', fontName='Helvetica', fontSize=10, leading=16, textColor=GREY, alignment=TA_JUSTIFY, spaceAfter=3*mm))
    styles.add(ParagraphStyle('Editorial', fontName='Helvetica-Oblique', fontSize=9, leading=13, textColor=LIGHT_GREY, alignment=TA_JUSTIFY, spaceAfter=3*mm, leftIndent=6*mm, rightIndent=6*mm))
    return styles

def cover_page(styles, title, subtitle, guide_no):
    """封面页"""
    return [
        Spacer(1, 35*mm),
        Paragraph(f"Subscriber Guide No. {guide_no}", styles['CoverMeta']),
        Spacer(1, 8*mm),
        Paragraph(title, styles['CoverTitle']),
        Spacer(1, 4*mm),
        Paragraph(subtitle, styles['CoverSub']),
        Spacer(1, 4*mm),
        Paragraph("Folk Calm — Cultural Archive", styles['CoverMeta']),
        Spacer(1, 3*mm),
        Paragraph("For cultural documentation and subscriber reading only. Not professional advice.", styles['Disclaimer']),
    ]

def toc_page(styles, items):
    """目录页"""
    toc = [Spacer(1, 25*mm), Paragraph("Contents", styles['CoverTitle']), Spacer(1, 8*mm)]
    for i, (num, title) in enumerate(items):
        toc.append(Paragraph(f"{num} &nbsp;&nbsp; {title}", styles['TOCItem']))
    toc.append(Spacer(1, 10*mm))
    toc.append(Paragraph("Each note is a cultural observation: what the object or rule looked like, why it stayed in "
                         "the home, and what kind of family rhythm it carried.", styles['Editorial']))
    return toc

def item_page(styles, num, title, subtitle, img_file, body_text, household_note):
    """物件/规则页面：左边文字，右边图片"""
    left_width = PAGE_W * 0.52
    img_max_w_draw = PAGE_W * 0.38
    img_max_h_draw = PAGE_H * 0.35

    img_buf = load_optimized_image(img_file, max_w=500)
    if img_buf:
        img = Image(img_buf)
        iw, ih = img.imageWidth, img.imageHeight
        ratio = min(img_max_w_draw/iw, img_max_h_draw/ih, 1.0)
        img.drawWidth = iw * ratio
        img.drawHeight = ih * ratio
    else:
        img = Paragraph(f"<i>[image: {img_file}]</i>", styles['Disclaimer'])

    # 左边
    left_cells = [
        Paragraph(f"<font color='{TAN}' size='36'><b>{num}</b></font>", styles['SectionNum']),
        Spacer(1, 2*mm),
        Paragraph(title, styles['SectionTitle']),
        Spacer(1, 1*mm),
        Paragraph(subtitle, styles['SectionSubtitle']),
        Spacer(1, 6*mm),
        Paragraph(body_text, styles['BodyText2']),
        Spacer(1, 4*mm),
        Paragraph(f"<b>Household note</b> &nbsp; {household_note}", styles['HouseholdNote']),
    ]

    # 两列表格
    t = Table([[left_cells, img]], colWidths=[left_width, img_max_w_draw + 10*mm])
    t.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (0,0), 0),
        ('RIGHTPADDING', (0,0), (0,0), 15*mm),
        ('TOPPADDING', (0,0), (-1,-1), 20*mm),
    ]))
    return [t]

def closing_page(styles, text):
    """结语页"""
    return [
        Spacer(1, 50*mm),
        Paragraph(text, styles['IntroBody']),
        Spacer(1, 20*mm),
        Paragraph("Folk Calm — Chinese household customs, remembered quietly", styles['CoverMeta']),
        Paragraph("You received this guide as part of the Folk Calm subscriber archive. "
                  "You can unsubscribe from future emails at any time.", styles['Disclaimer']),
    ]

def build_pdf1():
    """PDF 1: Grandmother's Household Shelf"""
    styles = make_styles()
    out_path = os.path.join(OUT_DIR, "Grandmothers-Household-Shelf-Guide.pdf")
    doc = SimpleDocTemplate(out_path, pagesize=A4,
                           leftMargin=20*mm, rightMargin=20*mm,
                           topMargin=15*mm, bottomMargin=15*mm)
    story = []

    # 封面
    story.extend(cover_page(styles,
        "Grandmother's Household Shelf",
        "10 Everyday Objects Found in Old Chinese Homes",
        2))
    story.append(PageBreak())

    # 目录
    toc_items = [
        ("01", "The Thermos Bottle"), ("02", "The Enamel Mug"), ("03", "The Enamel Washbasin"),
        ("04", "The Reused Mooncake Tin"), ("05", "The Bamboo Hand Fan"), ("06", "The Small Wooden Stool"),
        ("07", "The Sewing Basket"), ("08", "The Red Paper Wall Calendar"),
        ("09", "The Porcelain Lidded Jar"), ("10", "The Cotton Shoe Insole"),
    ]
    story.extend(toc_page(styles, toc_items))
    story.append(PageBreak())

    # 导言
    story.append(Paragraph("A guide to the objects that held the room together", styles['SectionTitle']))
    story.append(Paragraph(
        "Not every household custom begins as a ritual. Some begin as an object that never leaves the room: "
        "a thermos by the doorway, a low stool beside the bed, a tin that has outlived the pastry it once carried. "
        "This guide is not a catalogue of antiques. It is a short cultural record of ordinary things that shaped the "
        "pace of Chinese family life. They were useful, yes, but they also taught habits: saving, mending, offering, "
        "waiting, and making room for other people. Several of these objects still appear in homes today. Others have "
        "faded into storage rooms and old photographs. Together they tell a quieter story than festivals or medicine "
        "cabinets: how a household kept itself steady.", styles['IntroBody']))
    story.append(Paragraph(
        "Editorial boundary: This guide records household customs and material culture. "
        "It does not recommend remedies, treatments, or personal behavior.", styles['Editorial']))
    story.append(PageBreak())

    items = [
        ("01", "The Thermos Bottle", "Hot water kept ready",
         "A tall bottle with a narrow neck, a cork or plastic stopper, and a patterned shell. In many homes it stood near the kitchen door or beside a wooden cabinet. The thermos made hospitality immediate. A guest could be handed warm water within seconds, without waiting for a kettle to boil.",
         "Its presence said that the house was prepared for people, not just for tasks.",
         "pdf1_01_thermos.webp"),
        ("02", "The Enamel Mug", "One cup, many years",
         "White enamel with a blue rim, sometimes printed with red characters, factory flowers, or a faded work-unit slogan. It was light, hard to break, and personal. People used the same cup for water, tea, medicine, and sometimes as a pencil holder after retirement.",
         "A chipped rim did not end its life. It simply moved the mug to a humbler duty.",
         "pdf1_02_enamel_mug.webp"),
        ("03", "The Enamel Washbasin", "A basin for the whole rhythm of the day",
         "Wide, round, and often decorated with peonies or red characters. It sat under beds, on balcony shelves, or beside the washstand. Before bathrooms became private and tiled, the basin carried the morning face wash, the evening foot wash, laundry soaking, and small household cleaning.",
         "Its meaning was not luxury. It was order: one object, many uses, always returned to its place.",
         "pdf1_03_enamel_basin.webp"),
        ("04", "The Reused Mooncake Tin", "Storage after the festival",
         "A square or round metal tin, often bright red or gold, originally made for mooncakes and then kept for years. After Mid-Autumn Festival, the tin rarely disappeared. It held sewing needles, buttons, old receipts, ration coupons, photographs, or medicine packets.",
         "In many homes, opening a tin meant opening a small archive.",
         "pdf1_04_mooncake_tin.webp"),
        ("05", "The Bamboo Hand Fan", "Summer in one hand",
         "A woven fan, a palm-leaf fan, or a folding paper fan kept near a chair, bed, or doorway. It cooled the body, chased away insects, stirred stove smoke, and gave the hand something slow to do during conversation.",
         "Its rhythm belonged to summer afternoons: fan, pause, fan again.",
         "pdf1_05_bamboo_fan.webp"),
        ("06", "The Small Wooden Stool", "The most flexible seat in the house",
         "Low, square, sturdy, and often polished by decades of use. Children sat on it, elders rested on it, and vegetables were sorted over it. The stool moved wherever life was happening: kitchen doorway, courtyard, alley, bedroom, or market stall.",
         "It made the household less formal. People could gather without arranging a room.",
         "pdf1_06_wooden_stool.webp"),
        ("07", "The Sewing Basket", "Repair before replacement",
         "A shallow basket or old tin filled with needles, thread, spare buttons, scraps of cloth, and a small pair of scissors. Mending was not treated as a special project. It was part of the background discipline of the home.",
         "The basket kept a quiet rule alive: useful things deserved one more try.",
         "pdf1_07_sewing_basket.webp"),
        ("08", "The Red Paper Wall Calendar", "Dates, seasons, and family memory",
         "A paper calendar with red dates, lunar notes, festival markings, and sometimes advertising from a local shop. It helped a family see both official time and household time: birthdays, market days, school terms, ancestral visits, and festival preparations.",
         "Long before phone reminders, the wall carried the family's shared clock.",
         "pdf1_08_wall_calendar.webp"),
        ("09", "The Porcelain Lidded Jar", "A small container for things worth keeping",
         "A white or patterned jar with a fitted lid, placed on shelves or inside cabinets. It held tea leaves, rock sugar, dried fruit, coins, keys, or anything small enough to disappear if left loose.",
         "The jar gave ordinary things a place of respect.",
         "pdf1_09_porcelain_jar.webp"),
        ("10", "The Cotton Shoe Insole", "Work hidden under the foot",
         "A hand-stitched cloth insole, sometimes plain, sometimes embroidered with flowers or red thread. It was practical, but also intimate. Someone measured, cut, stitched, and pressed comfort into a thing most people would never see.",
         "In old homes, care often arrived quietly and from underneath.",
         "pdf1_10_cotton_insole.webp"),
    ]

    for num, title, subtitle, body, note, img_file in items:
        story.extend(item_page(styles, num, title, subtitle, img_file, body, note))
        story.append(Paragraph("<i>Subscriber guide note: variations exist by region, generation, and family. "
                               "This page records a common pattern, not a universal rule.</i>", styles['Disclaimer']))
        story.append(PageBreak())

    story.extend(closing_page(styles,
        "These objects were ordinary, but they trained the eye to notice a kind of household intelligence: "
        "nothing was wasted quickly, no object had only one life, and usefulness could become memory. "
        "The shelf was never just storage. It was a record of how a family moved through the day."))

    doc.build(story)
    print(f"PDF 1 built: {out_path} ({os.path.getsize(out_path)//1024} KB)")


def build_pdf2():
    """PDF 2: The Quiet Rules of the Chinese Table"""
    styles = make_styles()
    out_path = os.path.join(OUT_DIR, "Quiet-Rules-of-the-Chinese-Table-Guide.pdf")
    doc = SimpleDocTemplate(out_path, pagesize=A4,
                           leftMargin=20*mm, rightMargin=20*mm,
                           topMargin=15*mm, bottomMargin=15*mm)
    story = []

    story.extend(cover_page(styles,
        "The Quiet Rules of the Chinese Table",
        "10 Table Customs Children Learned Without Being Taught",
        3))
    story.append(PageBreak())

    toc_items = [
        ("01", "Elders Begin First"), ("02", "Chopsticks Do Not Stand Upright in Rice"),
        ("03", "The Teapot Spout Avoids Pointing at People"), ("04", "Two Fingers Tap Thanks for Tea"),
        ("05", "The Bowl Comes Close"), ("06", "Guests Are Offered Food Before Being Asked"),
        ("07", "Fish Is Not Casually Flipped"), ("08", "The Best Piece Goes Outward"),
        ("09", "Fruit Appears After the Meal"), ("10", "Leftovers Are Covered, Not Wasted"),
    ]
    story.extend(toc_page(styles, toc_items))
    story.append(PageBreak())

    story.append(Paragraph("The customs that lived between bites", styles['SectionTitle']))
    story.append(Paragraph(
        "Many Chinese table customs were never announced as rules. Children learned them by watching where "
        "chopsticks rested, who lifted a bowl first, how tea was poured, and which piece of food was quietly "
        "pushed toward someone else. This guide records ten small table habits that shaped family meals. "
        "They are not universal laws, and every region has its own variations. But each one points to the same "
        "larger idea: the table was a place where manners, memory, and family order met. Read these as cultural "
        "notes, not instructions. Their value is in what they reveal about attention, restraint, and the way "
        "a meal taught people to notice one another.", styles['IntroBody']))
    story.append(Paragraph(
        "Editorial boundary: This guide records household customs and material culture. "
        "It does not recommend remedies, treatments, or personal behavior.", styles['Editorial']))
    story.append(PageBreak())

    items = [
        ("01", "Elders Begin First", "A meal starts with order",
         "Children might sit down early, but the first movement often waited for a grandparent or parent to lift chopsticks. The habit placed age and family hierarchy at the center of the meal without needing a speech.",
         "Waiting was a small form of respect, practiced several times a day.",
         "pdf2_01_elders_first.webp"),
        ("02", "Chopsticks Do Not Stand Upright", "A shape with funeral meaning",
         "Chopsticks were laid across a bowl or set on a rest, not planted vertically into rice. The upright shape recalls incense sticks used in memorial offerings, so it felt out of place at an everyday meal.",
         "Children often learned this one quickly, usually from a sharp glance across the table.",
         "pdf2_02_chopsticks_laid.webp"),
        ("03", "The Teapot Spout Avoids Pointing", "Direction matters",
         "When a teapot was set down, its spout was turned away from guests and family members. In some households, pointing the spout at someone felt impolite, like directing a finger or sharp object at them.",
         "The rule turned even the resting angle of a pot into a gesture of care.",
         "pdf2_03_teapot_spout.webp"),
        ("04", "Two Fingers Tap Thanks for Tea", "A silent thank-you",
         "When someone poured tea, the receiver tapped two fingers lightly on the table instead of interrupting conversation. The gesture is often linked to stories of disguised emperors and bowed thanks, but in family life it simply became efficient politeness.",
         "A tiny knock on the table could carry a full sentence.",
         "pdf2_04_finger_tap.webp"),
        ("05", "The Bowl Comes Close", "Food is not chased across the table",
         "Rice bowls were lifted near the mouth, while dishes stayed shared in the center. The habit kept the meal tidy and made eating from a shared table easier in crowded homes.",
         "It was practical first, graceful second.",
         "pdf2_05_rice_bowl_close.webp"),
        ("06", "Guests Are Offered Food First", "Hospitality moves faster than words",
         "A host might place food near a guest, refill a bowl, or urge them to eat more before the guest requested anything. The host showed attention by anticipating need. A guest showed manners by accepting enough, but not too much.",
         "The meal became a negotiation of generosity and restraint.",
         "pdf2_06_guest_served.webp"),
        ("07", "Fish Is Not Casually Flipped", "A coastal memory at the table",
         "In some southern and coastal families, a whole fish was eaten carefully without turning it over like a page. The custom is often connected to boatmen, for whom flipping a fish could echo flipping a boat.",
         "Not every family follows it, but the rule shows how work, risk, and food can share one symbol.",
         "pdf2_07_whole_fish.webp"),
        ("08", "The Best Piece Goes Outward", "Affection is pushed across the table",
         "A parent or grandparent might move a good piece of fish, meat, tofu, or vegetable toward someone else. Care was often expressed through selection. The best bite did not stay with the person who found it.",
         "At many tables, love looked like a chopstick crossing the center.",
         "pdf2_08_best_piece.webp"),
        ("09", "Fruit Appears After the Meal", "A soft ending",
         "Orange wedges, pear slices, grapes, or melon might appear after bowls were cleared. Fruit gave the meal a closing rhythm. It also extended the time people remained together.",
         "The table did not end at the last bowl of rice.",
         "pdf2_09_fruit_after_meal.webp"),
        ("10", "Leftovers Are Covered, Not Wasted", "Tomorrow begins tonight",
         "Bowls were covered with plates, cloth, lids, or plastic wrap before being set aside. The habit reflected thrift, but also planning. A meal continued into breakfast, lunch, or a neighbor's bowl.",
         "Waste was not only economic. It was a failure to respect what had already entered the house.",
         "pdf2_10_leftovers.webp"),
    ]

    for num, title, subtitle, body, note, img_file in items:
        story.extend(item_page(styles, num, title, subtitle, img_file, body, note))
        story.append(Paragraph("<i>Subscriber guide note: variations exist by region, generation, and family. "
                               "This page records a common pattern, not a universal rule.</i>", styles['Disclaimer']))
        story.append(PageBreak())

    story.extend(closing_page(styles,
        "The Chinese table was never only a place to eat. It was a place where children learned timing, "
        "silence, hierarchy, generosity, and restraint without being handed a rulebook. "
        "A meal ended, but the manners it taught often remained."))

    doc.build(story)
    print(f"PDF 2 built: {out_path} ({os.path.getsize(out_path)//1024} KB)")


if __name__ == "__main__":
    build_pdf1()
    build_pdf2()
    print("Done!")
