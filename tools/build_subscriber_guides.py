#!/usr/bin/env python3
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
PDF_DIR = ROOT / "pdfs"

PAGE_W, PAGE_H = A4
MARGIN = 0.72 * inch
BRAND = colors.HexColor("#5C3317")
ACCENT = colors.HexColor("#A0522D")
INK = colors.HexColor("#2E2A24")
MUTED = colors.HexColor("#6B7280")
LIGHT = colors.HexColor("#EFE7DD")
PAPER = colors.HexColor("#FBF7F1")
SOFT_BLUE = colors.HexColor("#6E819B")


STYLE_TITLE = ParagraphStyle(
    "Title",
    fontName="Times-Bold",
    fontSize=30,
    leading=34,
    textColor=BRAND,
    alignment=TA_CENTER,
    spaceAfter=18,
)
STYLE_SUBTITLE = ParagraphStyle(
    "Subtitle",
    fontName="Helvetica",
    fontSize=12,
    leading=17,
    textColor=SOFT_BLUE,
    alignment=TA_CENTER,
)
STYLE_H1 = ParagraphStyle(
    "H1",
    fontName="Times-Bold",
    fontSize=23,
    leading=28,
    textColor=BRAND,
    alignment=TA_LEFT,
)
STYLE_H2 = ParagraphStyle(
    "H2",
    fontName="Helvetica-Bold",
    fontSize=9.5,
    leading=12,
    textColor=ACCENT,
    uppercase=True,
)
STYLE_BODY = ParagraphStyle(
    "Body",
    fontName="Times-Roman",
    fontSize=11.2,
    leading=17,
    textColor=INK,
)
STYLE_BODY_LARGE = ParagraphStyle(
    "BodyLarge",
    fontName="Times-Roman",
    fontSize=12,
    leading=18.5,
    textColor=INK,
)
STYLE_NOTE = ParagraphStyle(
    "Note",
    fontName="Times-Italic",
    fontSize=10.3,
    leading=15.5,
    textColor=colors.HexColor("#51483E"),
)
STYLE_SMALL = ParagraphStyle(
    "Small",
    fontName="Helvetica",
    fontSize=8.2,
    leading=12,
    textColor=MUTED,
)
STYLE_TOC = ParagraphStyle(
    "TOC",
    fontName="Times-Roman",
    fontSize=12.5,
    leading=22,
    textColor=INK,
)
STYLE_NUM = ParagraphStyle(
    "Num",
    fontName="Helvetica-Bold",
    fontSize=8,
    leading=10,
    textColor=colors.white,
    alignment=TA_CENTER,
)


HOUSEHOLD_SHELF = {
    "filename": "Grandmothers-Household-Shelf-Guide.pdf",
    "metadata_title": "Grandmother's Household Shelf",
    "series": "Subscriber Guide No. 2",
    "title": "Grandmother's Household Shelf",
    "subtitle": "10 Everyday Objects Found in Old Chinese Homes",
    "intro_title": "A guide to the objects that held the room together",
    "intro": [
        "Not every household custom begins as a ritual. Some begin as an object that never leaves the room: a thermos by the doorway, a low stool beside the bed, a tin that has outlived the pastry it once carried.",
        "This guide is not a catalogue of antiques. It is a short cultural record of ordinary things that shaped the pace of Chinese family life. They were useful, yes, but they also taught habits: saving, mending, offering, waiting, and making room for other people.",
        "Several of these objects still appear in homes today. Others have faded into storage rooms and old photographs. Together they tell a quieter story than festivals or medicine cabinets: how a household kept itself steady.",
    ],
    "items": [
        {
            "name": "The Thermos Bottle",
            "tag": "Hot water kept ready",
            "look": "A tall bottle with a narrow neck, a cork or plastic stopper, and a patterned shell. In many homes it stood near the kitchen door or beside a wooden cabinet.",
            "meaning": "The thermos made hospitality immediate. A guest could be handed warm water within seconds, without waiting for a kettle to boil.",
            "note": "Its presence said that the house was prepared for people, not just for tasks.",
        },
        {
            "name": "The Enamel Mug",
            "tag": "One cup, many years",
            "look": "White enamel with a blue rim, sometimes printed with red characters, factory flowers, or a faded work-unit slogan.",
            "meaning": "It was light, hard to break, and personal. People used the same cup for water, tea, medicine, and sometimes as a pencil holder after retirement.",
            "note": "A chipped rim did not end its life. It simply moved the mug to a humbler duty.",
        },
        {
            "name": "The Enamel Washbasin",
            "tag": "A basin for the whole rhythm of the day",
            "look": "Wide, round, and often decorated with peonies or red characters. It sat under beds, on balcony shelves, or beside the washstand.",
            "meaning": "Before bathrooms became private and tiled, the basin carried the morning face wash, the evening foot wash, laundry soaking, and small household cleaning.",
            "note": "Its meaning was not luxury. It was order: one object, many uses, always returned to its place.",
        },
        {
            "name": "The Reused Mooncake Tin",
            "tag": "Storage after the festival",
            "look": "A square or round metal tin, often bright red or gold, originally made for mooncakes and then kept for years.",
            "meaning": "After Mid-Autumn Festival, the tin rarely disappeared. It held sewing needles, buttons, old receipts, ration coupons, photographs, or medicine packets.",
            "note": "In many homes, opening a tin meant opening a small archive.",
        },
        {
            "name": "The Bamboo Hand Fan",
            "tag": "Summer in one hand",
            "look": "A woven fan, a palm-leaf fan, or a folding paper fan kept near a chair, bed, or doorway.",
            "meaning": "It cooled the body, chased away insects, stirred stove smoke, and gave the hand something slow to do during conversation.",
            "note": "Its rhythm belonged to summer afternoons: fan, pause, fan again.",
        },
        {
            "name": "The Small Wooden Stool",
            "tag": "The most flexible seat in the house",
            "look": "Low, square, sturdy, and often polished by decades of use. Children sat on it, elders rested on it, and vegetables were sorted over it.",
            "meaning": "The stool moved wherever life was happening: kitchen doorway, courtyard, alley, bedroom, or market stall.",
            "note": "It made the household less formal. People could gather without arranging a room.",
        },
        {
            "name": "The Sewing Basket",
            "tag": "Repair before replacement",
            "look": "A shallow basket or old tin filled with needles, thread, spare buttons, scraps of cloth, and a small pair of scissors.",
            "meaning": "Mending was not treated as a special project. It was part of the background discipline of the home.",
            "note": "The basket kept a quiet rule alive: useful things deserved one more try.",
        },
        {
            "name": "The Red Paper Wall Calendar",
            "tag": "Dates, seasons, and family memory",
            "look": "A paper calendar with red dates, lunar notes, festival markings, and sometimes advertising from a local shop.",
            "meaning": "It helped a family see both official time and household time: birthdays, market days, school terms, ancestral visits, and festival preparations.",
            "note": "Long before phone reminders, the wall carried the family's shared clock.",
        },
        {
            "name": "The Porcelain Lidded Jar",
            "tag": "A small container for things worth keeping",
            "look": "A white or patterned jar with a fitted lid, placed on shelves or inside cabinets.",
            "meaning": "It held tea leaves, rock sugar, dried fruit, coins, keys, or anything small enough to disappear if left loose.",
            "note": "The jar gave ordinary things a place of respect.",
        },
        {
            "name": "The Cotton Shoe Insole",
            "tag": "Work hidden under the foot",
            "look": "A hand-stitched cloth insole, sometimes plain, sometimes embroidered with flowers or red thread.",
            "meaning": "It was practical, but also intimate. Someone measured, cut, stitched, and pressed comfort into a thing most people would never see.",
            "note": "In old homes, care often arrived quietly and from underneath.",
        },
    ],
    "closing": [
        "These objects were ordinary, but they trained the eye to notice a kind of household intelligence: nothing was wasted quickly, no object had only one life, and usefulness could become memory.",
        "The shelf was never just storage. It was a record of how a family moved through the day.",
    ],
}


TABLE_RULES = {
    "filename": "Quiet-Rules-of-the-Chinese-Table-Guide.pdf",
    "metadata_title": "The Quiet Rules of the Chinese Table",
    "series": "Subscriber Guide No. 3",
    "title": "The Quiet Rules of the Chinese Table",
    "subtitle": "10 Table Customs Children Learned Without Being Taught",
    "intro_title": "The customs that lived between bites",
    "intro": [
        "Many Chinese table customs were never announced as rules. Children learned them by watching where chopsticks rested, who lifted a bowl first, how tea was poured, and which piece of food was quietly pushed toward someone else.",
        "This guide records ten small table habits that shaped family meals. They are not universal laws, and every region has its own variations. But each one points to the same larger idea: the table was a place where manners, memory, and family order met.",
        "Read these as cultural notes, not instructions. Their value is in what they reveal about attention, restraint, and the way a meal taught people to notice one another.",
    ],
    "items": [
        {
            "name": "Elders Begin First",
            "tag": "A meal starts with order",
            "look": "Children might sit down early, but the first movement often waited for a grandparent or parent to lift chopsticks.",
            "meaning": "The habit placed age and family hierarchy at the center of the meal without needing a speech.",
            "note": "Waiting was a small form of respect, practiced several times a day.",
        },
        {
            "name": "Chopsticks Do Not Stand Upright in Rice",
            "tag": "A shape with funeral meaning",
            "look": "Chopsticks were laid across a bowl or set on a rest, not planted vertically into rice.",
            "meaning": "The upright shape recalls incense sticks used in memorial offerings, so it felt out of place at an everyday meal.",
            "note": "Children often learned this one quickly, usually from a sharp glance across the table.",
        },
        {
            "name": "The Teapot Spout Avoids Pointing at People",
            "tag": "Direction matters",
            "look": "When a teapot was set down, its spout was turned away from guests and family members.",
            "meaning": "In some households, pointing the spout at someone felt impolite, like directing a finger or sharp object at them.",
            "note": "The rule turned even the resting angle of a pot into a gesture of care.",
        },
        {
            "name": "Two Fingers Tap Thanks for Tea",
            "tag": "A silent thank-you",
            "look": "When someone poured tea, the receiver tapped two fingers lightly on the table instead of interrupting conversation.",
            "meaning": "The gesture is often linked to stories of disguised emperors and bowed thanks, but in family life it simply became efficient politeness.",
            "note": "A tiny knock on the table could carry a full sentence.",
        },
        {
            "name": "The Bowl Comes Close",
            "tag": "Food is not chased across the table",
            "look": "Rice bowls were lifted near the mouth, while dishes stayed shared in the center.",
            "meaning": "The habit kept the meal tidy and made eating from a shared table easier in crowded homes.",
            "note": "It was practical first, graceful second.",
        },
        {
            "name": "Guests Are Offered Food Before Being Asked",
            "tag": "Hospitality moves faster than words",
            "look": "A host might place food near a guest, refill a bowl, or urge them to eat more before the guest requested anything.",
            "meaning": "The host showed attention by anticipating need. A guest showed manners by accepting enough, but not too much.",
            "note": "The meal became a negotiation of generosity and restraint.",
        },
        {
            "name": "Fish Is Not Casually Flipped",
            "tag": "A coastal memory at the table",
            "look": "In some southern and coastal families, a whole fish was eaten carefully without turning it over like a page.",
            "meaning": "The custom is often connected to boatmen, for whom flipping a fish could echo flipping a boat.",
            "note": "Not every family follows it, but the rule shows how work, risk, and food can share one symbol.",
        },
        {
            "name": "The Best Piece Goes Outward",
            "tag": "Affection is pushed across the table",
            "look": "A parent or grandparent might move a good piece of fish, meat, tofu, or vegetable toward someone else.",
            "meaning": "Care was often expressed through selection. The best bite did not stay with the person who found it.",
            "note": "At many tables, love looked like a chopstick crossing the center.",
        },
        {
            "name": "Fruit Appears After the Meal",
            "tag": "A soft ending",
            "look": "Orange wedges, pear slices, grapes, or melon might appear after bowls were cleared.",
            "meaning": "Fruit gave the meal a closing rhythm. It also extended the time people remained together.",
            "note": "The table did not end at the last bowl of rice.",
        },
        {
            "name": "Leftovers Are Covered, Not Wasted",
            "tag": "Tomorrow begins tonight",
            "look": "Bowls were covered with plates, cloth, lids, or plastic wrap before being set aside.",
            "meaning": "The habit reflected thrift, but also planning. A meal continued into breakfast, lunch, or a neighbor's bowl.",
            "note": "Waste was not only economic. It was a failure to respect what had already entered the house.",
        },
    ],
    "closing": [
        "The Chinese table was never only a place to eat. It was a place where children learned timing, silence, hierarchy, generosity, and restraint without being handed a rulebook.",
        "A meal ended, but the manners it taught often remained.",
    ],
}


def draw_bg(c):
    c.setFillColor(PAPER)
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    c.setStrokeColor(LIGHT)
    c.setLineWidth(0.5)
    for x in (MARGIN * 0.75, PAGE_W - MARGIN * 0.75):
        c.line(x, MARGIN * 0.65, x, PAGE_H - MARGIN * 0.65)


def p(c, text, style, x, y, w, h):
    para = Paragraph(text, style)
    _, used = para.wrap(w, h)
    para.drawOn(c, x, y + h - used)
    return y + h - used


def ptop(c, text, style, x, top_y, w, max_h=5 * inch):
    para = Paragraph(text, style)
    _, used = para.wrap(w, max_h)
    para.drawOn(c, x, top_y - used)
    return top_y - used


def footer(c, title, page_num):
    c.setStrokeColor(LIGHT)
    c.setLineWidth(0.7)
    c.line(MARGIN, 0.68 * inch, PAGE_W - MARGIN, 0.68 * inch)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawString(MARGIN, 0.45 * inch, "Folk Calm - Cultural Archive")
    c.drawCentredString(PAGE_W / 2, 0.45 * inch, title)
    c.drawRightString(PAGE_W - MARGIN, 0.45 * inch, str(page_num))


def draw_badge(c, text, x, y, fill=ACCENT):
    c.setFillColor(fill)
    c.roundRect(x, y, 0.42 * inch, 0.24 * inch, 5, stroke=0, fill=1)
    p(c, text, STYLE_NUM, x, y + 0.03 * inch, 0.42 * inch, 0.18 * inch)


def draw_simple_icon(c, kind, x, y, w, h):
    c.saveState()
    c.translate(x, y)
    c.setStrokeColor(ACCENT)
    c.setFillColor(colors.Color(0.64, 0.32, 0.18, alpha=0.08))
    c.setLineWidth(1.4)
    c.roundRect(0, 0, w, h, 10, stroke=1, fill=1)
    c.setStrokeColor(colors.Color(0.64, 0.32, 0.18, alpha=0.16))
    c.line(0.14 * inch, 0.16 * inch, w - 0.14 * inch, 0.16 * inch)
    c.line(0.16 * inch, h - 0.18 * inch, w - 0.16 * inch, h - 0.18 * inch)
    c.setFillColor(colors.Color(0.64, 0.32, 0.18, alpha=0.12))
    c.setStrokeColor(BRAND)
    c.setLineWidth(1.45)
    cx, cy = w / 2, h / 2
    if kind == "thermos":
        c.roundRect(cx - 18, cy - 42, 36, 84, 8, stroke=1, fill=0)
        c.rect(cx - 12, cy + 42, 24, 8, stroke=1, fill=0)
        c.line(cx - 10, cy - 18, cx + 10, cy - 18)
    elif kind == "mug":
        c.roundRect(cx - 30, cy - 22, 48, 48, 7, stroke=1, fill=0)
        c.circle(cx + 27, cy + 1, 14, stroke=1, fill=0)
        c.line(cx - 24, cy + 18, cx + 12, cy + 18)
    elif kind == "basin":
        c.ellipse(cx - 48, cy - 28, cx + 48, cy + 24, stroke=1, fill=0)
        c.arc(cx - 40, cy - 45, cx + 40, cy + 10, 200, 140)
    elif kind == "tin":
        c.roundRect(cx - 42, cy - 30, 84, 60, 8, stroke=1, fill=0)
        c.line(cx - 35, cy + 10, cx + 35, cy + 10)
        c.circle(cx, cy - 9, 12, stroke=1, fill=0)
    elif kind == "fan":
        for i in range(9):
            x2 = cx - 45 + i * 11
            c.line(cx, cy - 38, x2, cy + 36)
        c.arc(cx - 50, cy - 10, cx + 50, cy + 70, 10, 160)
    elif kind == "stool":
        c.rect(cx - 42, cy + 8, 84, 18, stroke=1, fill=0)
        c.line(cx - 30, cy + 8, cx - 42, cy - 44)
        c.line(cx + 30, cy + 8, cx + 42, cy - 44)
    elif kind == "basket":
        c.arc(cx - 44, cy - 10, cx + 44, cy + 60, 0, 180)
        c.roundRect(cx - 44, cy - 34, 88, 58, 8, stroke=1, fill=0)
        for i in range(5):
            c.line(cx - 38 + i * 19, cy - 30, cx - 20 + i * 19, cy + 18)
    elif kind == "calendar":
        c.rect(cx - 42, cy - 42, 84, 84, stroke=1, fill=0)
        c.line(cx - 42, cy + 20, cx + 42, cy + 20)
        for i in range(3):
            c.line(cx - 20 + i * 20, cy + 8, cx - 20 + i * 20, cy - 30)
    elif kind == "jar":
        c.roundRect(cx - 36, cy - 36, 72, 64, 12, stroke=1, fill=0)
        c.rect(cx - 24, cy + 28, 48, 11, stroke=1, fill=0)
        c.circle(cx, cy + 45, 5, stroke=1, fill=0)
    elif kind == "insole":
        c.bezier(cx - 12, cy - 42, cx + 42, cy - 20, cx + 25, cy + 45, cx - 8, cy + 42)
        c.bezier(cx - 8, cy + 42, cx - 45, cy + 32, cx - 35, cy - 36, cx - 12, cy - 42)
        for i in range(5):
            c.circle(cx - 8 + i * 6, cy - 20 + i * 12, 1.8, stroke=1, fill=0)
    else:
        c.circle(cx, cy, 38, stroke=1, fill=0)
    c.restoreState()


def draw_rule_icon(c, idx, x, y, w, h):
    kinds = ["elders", "chopsticks", "spout", "tap", "bowl", "guest", "fish", "best", "fruit", "leftover"]
    draw_simple_icon(c, kinds[min(idx, len(kinds) - 1)], x, y, w, h)
    c.saveState()
    c.setStrokeColor(BRAND)
    c.setLineWidth(1.2)
    cx, cy = x + w / 2, y + h / 2
    kind = kinds[idx]
    if kind == "elders":
        c.circle(cx - 18, cy + 16, 14, stroke=1, fill=0)
        c.circle(cx + 20, cy + 4, 11, stroke=1, fill=0)
        c.line(cx - 35, cy - 20, cx + 36, cy - 20)
    elif kind == "chopsticks":
        c.ellipse(cx - 34, cy - 28, cx + 34, cy + 24, stroke=1, fill=0)
        c.line(cx - 18, cy + 36, cx - 4, cy - 22)
        c.line(cx + 4, cy + 36, cx + 18, cy - 22)
    elif kind == "spout":
        c.circle(cx - 12, cy, 26, stroke=1, fill=0)
        c.line(cx + 12, cy + 5, cx + 48, cy + 18)
        c.circle(cx - 12, cy + 29, 5, stroke=1, fill=0)
    elif kind == "tap":
        c.line(cx - 44, cy - 20, cx + 44, cy - 20)
        c.line(cx - 10, cy + 35, cx - 18, cy - 8)
        c.line(cx + 10, cy + 35, cx + 2, cy - 8)
    elif kind == "bowl":
        c.ellipse(cx - 42, cy - 24, cx + 42, cy + 20, stroke=1, fill=0)
        c.arc(cx - 36, cy - 44, cx + 36, cy + 6, 200, 140)
    elif kind == "guest":
        c.rect(cx - 44, cy - 24, 88, 14, stroke=1, fill=0)
        c.circle(cx - 18, cy + 16, 10, stroke=1, fill=0)
        c.circle(cx + 20, cy + 16, 10, stroke=1, fill=0)
    elif kind == "fish":
        c.ellipse(cx - 44, cy - 20, cx + 28, cy + 20, stroke=1, fill=0)
        c.line(cx + 28, cy, cx + 48, cy + 20)
        c.line(cx + 28, cy, cx + 48, cy - 20)
    elif kind == "best":
        c.circle(cx - 16, cy, 22, stroke=1, fill=0)
        c.line(cx + 5, cy, cx + 45, cy)
        c.line(cx + 35, cy + 8, cx + 45, cy)
        c.line(cx + 35, cy - 8, cx + 45, cy)
    elif kind == "fruit":
        c.circle(cx - 18, cy, 17, stroke=1, fill=0)
        c.circle(cx + 12, cy + 6, 19, stroke=1, fill=0)
        c.line(cx + 12, cy + 25, cx + 20, cy + 38)
    elif kind == "leftover":
        c.roundRect(cx - 38, cy - 26, 76, 52, 8, stroke=1, fill=0)
        c.line(cx - 36, cy + 12, cx + 36, cy + 12)
        c.arc(cx - 22, cy + 18, cx + 22, cy + 48, 0, 180)
    c.restoreState()


def draw_cover(c, guide):
    draw_bg(c)
    c.setFont("Helvetica", 8)
    c.setFillColor(MUTED)
    c.drawCentredString(PAGE_W / 2, PAGE_H - 1.35 * inch, guide["series"])
    p(c, guide["title"], STYLE_TITLE, MARGIN, PAGE_H - 3.18 * inch, PAGE_W - 2 * MARGIN, 1.2 * inch)
    p(c, guide["subtitle"], STYLE_SUBTITLE, MARGIN, PAGE_H - 3.74 * inch, PAGE_W - 2 * MARGIN, 0.45 * inch)
    c.setStrokeColor(ACCENT)
    c.setLineWidth(1.4)
    c.line(1.15 * inch, 3.02 * inch, PAGE_W - 1.15 * inch, 3.02 * inch)
    c.setFillColor(SOFT_BLUE)
    c.setFont("Helvetica", 10)
    c.drawCentredString(PAGE_W / 2, 2.62 * inch, "Folk Calm - Cultural Archive")
    c.setStrokeColor(LIGHT)
    c.setFillColor(colors.white)
    c.roundRect(1.08 * inch, 1.42 * inch, PAGE_W - 2.16 * inch, 0.45 * inch, 2, stroke=1, fill=1)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7.4)
    c.drawString(1.25 * inch, 1.59 * inch, "For cultural documentation and subscriber reading only. Not professional advice.")
    c.showPage()


def draw_toc(c, guide):
    draw_bg(c)
    p(c, "Contents", STYLE_H1, MARGIN, PAGE_H - 1.55 * inch, PAGE_W - 2 * MARGIN, 0.6 * inch)
    y = PAGE_H - 2.24 * inch
    for i, item in enumerate(guide["items"], 1):
        draw_badge(c, f"{i:02d}", MARGIN, y - 0.03 * inch, SOFT_BLUE if i % 2 else ACCENT)
        p(c, item["name"], STYLE_TOC, MARGIN + 0.58 * inch, y - 0.08 * inch, PAGE_W - 2 * MARGIN - 0.65 * inch, 0.33 * inch)
        y -= 0.39 * inch
    c.setStrokeColor(LIGHT)
    c.line(MARGIN, 1.52 * inch, PAGE_W - MARGIN, 1.52 * inch)
    p(
        c,
        "Each note is a cultural observation: what the object or rule looked like, why it stayed in the home, and what kind of family rhythm it carried.",
        STYLE_SMALL,
        MARGIN,
        1.05 * inch,
        PAGE_W - 2 * MARGIN,
        0.38 * inch,
    )
    footer(c, guide["title"], 2)
    c.showPage()


def draw_intro(c, guide):
    draw_bg(c)
    p(c, guide["intro_title"], STYLE_H1, MARGIN, PAGE_H - 1.55 * inch, PAGE_W - 2 * MARGIN, 0.75 * inch)
    y = PAGE_H - 2.1 * inch
    for paragraph in guide["intro"]:
        y = ptop(c, paragraph, STYLE_BODY_LARGE, MARGIN, y, PAGE_W - 2 * MARGIN) - 0.24 * inch
    c.setFillColor(colors.white)
    c.setStrokeColor(LIGHT)
    c.roundRect(MARGIN, 1.28 * inch, PAGE_W - 2 * MARGIN, 1.1 * inch, 8, stroke=1, fill=1)
    p(
        c,
        "<b>Editorial boundary:</b> This guide records household customs and material culture. It does not recommend remedies, treatments, or personal behavior.",
        STYLE_SMALL,
        MARGIN + 0.22 * inch,
        1.54 * inch,
        PAGE_W - 2 * MARGIN - 0.44 * inch,
        0.5 * inch,
    )
    footer(c, guide["title"], 3)
    c.showPage()


def draw_item(c, guide, item, idx, page_num, icon_kind, rule=False):
    draw_bg(c)
    draw_badge(c, f"{idx:02d}", MARGIN, PAGE_H - 1.25 * inch, ACCENT)
    p(c, item["name"], STYLE_H1, MARGIN + 0.58 * inch, PAGE_H - 1.38 * inch, PAGE_W - 2 * MARGIN - 0.58 * inch, 0.7 * inch)
    c.setFillColor(SOFT_BLUE)
    c.setFont("Helvetica", 9)
    c.drawString(MARGIN + 0.58 * inch, PAGE_H - 1.58 * inch, item["tag"])
    icon_x = MARGIN
    icon_y = PAGE_H - 4.52 * inch
    if rule:
        draw_rule_icon(c, idx - 1, icon_x, icon_y, 2.28 * inch, 2.05 * inch)
    else:
        draw_simple_icon(c, icon_kind, icon_x, icon_y, 2.28 * inch, 2.05 * inch)
    c.setFont("Helvetica", 7.5)
    c.setFillColor(MUTED)
    c.drawCentredString(icon_x + 1.14 * inch, icon_y - 0.22 * inch, "field sketch")
    text_x = MARGIN + 2.72 * inch
    text_w = PAGE_W - text_x - MARGIN
    y = PAGE_H - 2.2 * inch
    y = ptop(c, item["look"], STYLE_BODY_LARGE, text_x, y, text_w) - 0.18 * inch
    y = ptop(c, item["meaning"], STYLE_BODY_LARGE, text_x, y, text_w) - 0.24 * inch
    c.setFillColor(colors.white)
    c.setStrokeColor(LIGHT)
    c.roundRect(text_x, y - 1.02 * inch, text_w, 0.88 * inch, 7, stroke=1, fill=1)
    p(c, "Household note", STYLE_H2, text_x + 0.18 * inch, y - 0.32 * inch, text_w - 0.36 * inch, 0.2 * inch)
    ptop(c, item["note"], STYLE_NOTE, text_x + 0.18 * inch, y - 0.43 * inch, text_w - 0.36 * inch, 0.46 * inch)
    c.setStrokeColor(LIGHT)
    c.line(MARGIN, 1.23 * inch, PAGE_W - MARGIN, 1.23 * inch)
    p(
        c,
        "Subscriber guide note: variations exist by region, generation, and family. This page records a common pattern, not a universal rule.",
        STYLE_SMALL,
        MARGIN,
        0.85 * inch,
        PAGE_W - 2 * MARGIN,
        0.32 * inch,
    )
    footer(c, guide["title"], page_num)
    c.showPage()


def draw_closing(c, guide, page_num):
    draw_bg(c)
    p(c, "Closing Note", STYLE_H1, MARGIN, PAGE_H - 1.55 * inch, PAGE_W - 2 * MARGIN, 0.7 * inch)
    y = PAGE_H - 2.1 * inch
    for paragraph in guide["closing"]:
        y = ptop(c, paragraph, STYLE_BODY_LARGE, MARGIN, y, PAGE_W - 2 * MARGIN) - 0.25 * inch
    c.setStrokeColor(ACCENT)
    c.setLineWidth(1.2)
    c.line(1.15 * inch, 2.95 * inch, PAGE_W - 1.15 * inch, 2.95 * inch)
    c.setFont("Helvetica", 10)
    c.setFillColor(SOFT_BLUE)
    c.drawCentredString(PAGE_W / 2, 2.55 * inch, "Folk Calm - Chinese household customs, remembered quietly")
    p(
        c,
        "You received this guide as part of the Folk Calm subscriber archive. You can unsubscribe from future emails at any time.",
        STYLE_SMALL,
        MARGIN,
        1.45 * inch,
        PAGE_W - 2 * MARGIN,
        0.4 * inch,
    )
    footer(c, guide["title"], page_num)
    c.showPage()


def build_pdf(guide):
    PDF_DIR.mkdir(exist_ok=True)
    output = PDF_DIR / guide["filename"]
    c = canvas.Canvas(str(output), pagesize=A4)
    c.setTitle(guide["metadata_title"])
    c.setAuthor("Folk Calm")
    c.setSubject("Chinese household customs cultural guide")
    draw_cover(c, guide)
    draw_toc(c, guide)
    draw_intro(c, guide)
    icons = ["thermos", "mug", "basin", "tin", "fan", "stool", "basket", "calendar", "jar", "insole"]
    for idx, item in enumerate(guide["items"], 1):
        draw_item(c, guide, item, idx, idx + 3, icons[idx - 1], rule=guide is TABLE_RULES)
    draw_closing(c, guide, 14)
    c.save()
    return output


def main():
    for guide in (HOUSEHOLD_SHELF, TABLE_RULES):
        output = build_pdf(guide)
        print(output.relative_to(ROOT), output.stat().st_size)


if __name__ == "__main__":
    main()
