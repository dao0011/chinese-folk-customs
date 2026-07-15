#!/usr/bin/env python3
"""Build subscriber Guide No. 6: The Household Clock - Ten Quiet Hours of the Chinese Day.

Uses PyMuPDF (fitz) because reportlab is not installed in the runtime environment.
"""
from __future__ import annotations
from pathlib import Path
import fitz  # PyMuPDF
from PIL import Image as PILImage

ROOT = Path(__file__).resolve().parents[1]
IMG_DIR = ROOT / "images" / "pdf_gen"
OUT_DIR = ROOT / "pdfs"
COVER_IMAGE = IMG_DIR / "guide6_01_first_kettle.jpg"
OUT_PDF = OUT_DIR / "The-Household-Clock-Ten-Quiet-Hours-Guide.pdf"

PAGE_W, PAGE_H = 595, 842  # A4 in points
MARGIN_L = 54
MARGIN_R = 54

# Colors (0-1 floats for fitz)
BROWN = (0.310, 0.184, 0.106)
TAN = (0.627, 0.322, 0.176)
GREY = (0.384, 0.333, 0.275)
LIGHT_GREY = (0.533, 0.502, 0.471)
CREAM = (1.0, 0.973, 0.925)
LINE_C = (0.886, 0.820, 0.737)

F_BODY = "helv"
F_BOLD = "hebo"
F_ITAL = "heit"


ITEMS = [
    {
        "num": "01",
        "title": "Before Dawn - The First Kettle",
        "subtitle": "A cold stove becomes a working house",
        "image": "guide6_01_first_kettle.jpg",
        "body": (
            "The first person up in a Chinese household often did not speak. They went to the kitchen, struck a match, "
            "and set a kettle on the cold stove. The sound of water beginning to warm was the house waking up. No one "
            "needed to be told. When the kettle sang, others knew the day had opened, and the first cup of warm water "
            "could be poured."
        ),
        "note": (
            "The kettle's first boil was the household's first clock. It decided when the family could drink, eat, "
            "and leave the door."
        ),
    },
    {
        "num": "02",
        "title": "First Light - The Wash Basin",
        "subtitle": "One basin, one towel, the day's first order",
        "image": "guide6_02_wash_basin.jpg",
        "body": (
            "Morning washing happened at the kitchen or the courtyard, not at a private sink. A basin of hot water, a "
            "towel draped over a chair back, and family members took turns in order. The same water might serve more "
            "than one person before being poured onto the ground. The action was ordinary, but its order was not."
        ),
        "note": (
            "Who washed first, who poured the water - these unwritten rules taught family position before any word "
            "was spoken."
        ),
    },
    {
        "num": "03",
        "title": "The Morning Bowl",
        "subtitle": "Congee, pickles, and the quiet first meal",
        "image": "guide6_03_morning_bowl.jpg",
        "body": (
            "Breakfast was usually congee with pickles. Rice had been soaked the night before; the pot simmered slowly "
            "after the kettle boiled. The family sat together, ate quickly, and spoke little. The meal's meaning was "
            "not in what was eaten but in starting the day at the same table."
        ),
        "note": (
            "The thickness of the morning congee was a quiet record of a household's budget and taste."
        ),
    },
    {
        "num": "04",
        "title": "The Market Return",
        "subtitle": "The basket that organized the afternoon",
        "image": "guide6_04_market_return.jpg",
        "body": (
            "The one who returned from the morning market carried a bamboo basket of greens, tofu, spring onions, and "
            "ginger. The basket was set down at the kitchen door, emptied, sorted, and washed. This single action set "
            "the kitchen's rhythm for the rest of the day."
        ),
        "note": (
            "The shape and weight of a bamboo basket remembered what a family ate that week."
        ),
    },
    {
        "num": "05",
        "title": "The Noon Shade",
        "subtitle": "A bamboo blind, a low stool, a short rest",
        "image": "guide6_05_noon_shade.jpg",
        "body": (
            "After lunch, the bamboo blind was lowered halfway, and someone lay down on a long bench or low stool for "
            "a short rest. No one undressed; no one covered up. Children were told to be quiet. It was the only pause "
            "the household treated as legitimate."
        ),
        "note": (
            "The noon rest was not laziness. It was an old respect for the hour when work should pause."
        ),
    },
    {
        "num": "06",
        "title": "The Afternoon Needle",
        "subtitle": "Mending before the evening lamp",
        "image": "guide6_06_afternoon_needle.jpg",
        "body": (
            "Afternoon light was good for mending. A hole in a sock, a loose hem, a button about to fall - these were "
            "not saved for the weekend. The sewing basket stayed open because it was always in use. To mend today was "
            "to wear it whole tomorrow."
        ),
        "note": (
            "'Mend it when it breaks' was not a slogan of thrift. It was a daily rhythm."
        ),
    },
    {
        "num": "07",
        "title": "The Doorway Hour",
        "subtitle": "When the house opens to the lane",
        "image": "guide6_07_doorway_hour.jpg",
        "body": (
            "On summer evenings, the front door was opened and a low stool was carried to the threshold. An elder fanned "
            "slowly; children chased each other; neighbors paused to talk. The doorway was the house meeting the lane - "
            "informal, social, and never quite inside or outside."
        ),
        "note": (
            "The doorway hour taught children that a home has edges, but that edges can be opened."
        ),
    },
    {
        "num": "08",
        "title": "The Lamp-Lit Table",
        "subtitle": "The second meal, the shared dish",
        "image": "guide6_08_lamp_table.jpg",
        "body": (
            "Dinner was the most complete meal. The lamp was lit, dishes were set out, and the family sat down together. "
            "There were hot dishes, a soup, and loose talk. This was not the speed of breakfast. It was the small "
            "ceremony of being together at the end of work."
        ),
        "note": (
            "The dinner table was where a household settled its day - lightly, between bites."
        ),
    },
    {
        "num": "09",
        "title": "The Foot Basin Before Bed",
        "subtitle": "The action that closed the household day",
        "image": "guide6_09_foot_basin.jpg",
        "body": (
            "Before sleep, hot water was poured into a wooden basin, and family members took turns in order, each "
            "soaking for ten minutes or so. The basin was emptied, feet were dried, and the basin was turned upside "
            "down against the wall. Once that sequence was done, the day's outside was finally turned over."
        ),
        "note": (
            "The moment the basin came out, the whole house knew night had arrived. In a home without clocks, it was "
            "the surest sign that it was time to sleep."
        ),
    },
    {
        "num": "10",
        "title": "The Last Lamp",
        "subtitle": "Checking doors, covering quilts",
        "image": "guide6_10_last_lamp.jpg",
        "body": (
            "After everyone had slept, one person kept the last lamp lit. Before blowing it out, they walked the house: "
            "the door bolt, the stove, the window latches, the quilt on the smallest child. This was not anxiety. It "
            "was the household's final act of respect toward the night."
        ),
        "note": (
            "The last lamp going dark was the household's last responsibility of the day."
        ),
    },
]


def check_images() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for item in ITEMS:
        if not (IMG_DIR / item["image"]).exists():
            raise FileNotFoundError(item["image"])
    if not COVER_IMAGE.exists():
        raise FileNotFoundError(COVER_IMAGE)


def fitted_rect(x0, y0, x1, y1, img_path):
    """Rect inside box (x0,y0,x1,y1) preserving aspect ratio, centered."""
    pil = PILImage.open(img_path)
    iw, ih = pil.size
    box_w = x1 - x0
    box_h = y1 - y0
    r = min(box_w / iw, box_h / ih)
    w = iw * r
    h = ih * r
    cx = (x0 + x1) / 2
    cy = (y0 + y1) / 2
    return fitz.Rect(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)


def cover_page(doc):
    page = doc.new_page(width=PAGE_W, height=PAGE_H)
    full = fitz.Rect(0, 0, PAGE_W, PAGE_H)
    page.insert_textbox(fitz.Rect(0, 72, PAGE_W, 92), "Subscriber Archive  \u00b7  Guide No. 6",
                        fontsize=9, fontname=F_BODY, color=LIGHT_GREY, align=fitz.TEXT_ALIGN_CENTER)
    page.insert_textbox(fitz.Rect(0, 118, PAGE_W, 158), "The Household Clock",
                        fontsize=28, fontname=F_BOLD, color=BROWN, align=fitz.TEXT_ALIGN_CENTER)
    page.insert_textbox(fitz.Rect(50, 168, PAGE_W - 50, 196), "Ten Quiet Hours of the Chinese Day",
                        fontsize=13, fontname=F_BODY, color=GREY, align=fitz.TEXT_ALIGN_CENTER)
    page.insert_textbox(fitz.Rect(64, 204, PAGE_W - 64, 248),
                        "A small illustrated guide to the time-marks that shaped Chinese family life, from the first kettle to the last lamp",
                        fontsize=11, fontname=F_BODY, color=GREY, align=fitz.TEXT_ALIGN_CENTER)
    page.insert_image(fitted_rect(80, 268, PAGE_W - 80, 520, COVER_IMAGE), filename=str(COVER_IMAGE))
    page.insert_textbox(fitz.Rect(0, 540, PAGE_W, 560), "Folk Calm  \u00b7  July 16, 2026",
                        fontsize=9, fontname=F_BODY, color=LIGHT_GREY, align=fitz.TEXT_ALIGN_CENTER)
    page.insert_textbox(fitz.Rect(60, 566, PAGE_W - 60, 586),
                        "For cultural documentation and subscriber reading only.",
                        fontsize=8, fontname=F_ITAL, color=LIGHT_GREY, align=fitz.TEXT_ALIGN_CENTER)


def toc_page(doc):
    page = doc.new_page(width=PAGE_W, height=PAGE_H)
    page.insert_textbox(fitz.Rect(0, 60, PAGE_W, 100), "Contents",
                        fontsize=24, fontname=F_BOLD, color=BROWN, align=fitz.TEXT_ALIGN_CENTER)
    y = 140
    for item in ITEMS:
        page.insert_textbox(fitz.Rect(MARGIN_L, y, PAGE_W - MARGIN_R, y + 22),
                            f"{item['num']}    {item['title']}",
                            fontsize=10.5, fontname=F_BODY, color=GREY, align=fitz.TEXT_ALIGN_LEFT)
        y += 24
    page.insert_textbox(fitz.Rect(MARGIN_L, y + 24, PAGE_W - MARGIN_R, y + 130),
                        "This guide is time-led rather than object-led. It looks at ten moments that marked a Chinese household's "
                        "day: when they happened, what they asked of the family, and how they kept the house in rhythm.",
                        fontsize=10.2, fontname=F_BODY, color=GREY, align=fitz.TEXT_ALIGN_JUSTIFY)


def intro_page(doc):
    page = doc.new_page(width=PAGE_W, height=PAGE_H)
    page.insert_textbox(fitz.Rect(MARGIN_L, 60, PAGE_W - MARGIN_R, 88),
                        "Why a day can be a guide", fontsize=17, fontname=F_BOLD, color=BROWN, align=fitz.TEXT_ALIGN_LEFT)
    paras = [
        "A household can be remembered through food, objects, and stories. It can also be remembered through time. "
        "The hours at which things happened - the first kettle, the noon blind, the last lamp - carried as much "
        "family meaning as the things themselves.",
        "Clocks entered Chinese homes recently. Before that, a day was divided by the kettle's first boil, the "
        "basin's turn, the blind's shadow, the foot basin's appearance, and the lamp's last check. These were not "
        "appointments. They were the marks by which a family moved together through a single day.",
        "This guide records ten such marks, from before dawn to the last lamp. None of them is a task on a list. "
        "Each is a small hinge of domestic time - the kind of hinge that, once removed, lets a day fall flat.",
    ]
    y = 100
    for p in paras:
        page.insert_textbox(fitz.Rect(MARGIN_L, y, PAGE_W - MARGIN_R, y + 110),
                            p, fontsize=10.2, fontname=F_BODY, color=GREY, align=fitz.TEXT_ALIGN_JUSTIFY)
        y += 96
    page.insert_textbox(fitz.Rect(MARGIN_L, y + 16, PAGE_W - MARGIN_R, y + 50),
                        "The text here is newly written for this subscriber guide and does not reproduce the weekly articles.",
                        fontsize=8, fontname=F_ITAL, color=LIGHT_GREY, align=fitz.TEXT_ALIGN_LEFT)


def item_page(doc, item):
    page = doc.new_page(width=PAGE_W, height=PAGE_H)
    left_x0 = MARGIN_L
    left_x1 = 294
    right_x0 = 314
    right_x1 = PAGE_W - MARGIN_R
    # Number
    page.insert_textbox(fitz.Rect(left_x0, 60, left_x1, 104), item["num"],
                        fontsize=32, fontname=F_BOLD, color=TAN, align=fitz.TEXT_ALIGN_LEFT)
    # Title
    page.insert_textbox(fitz.Rect(left_x0, 108, left_x1, 152), item["title"],
                        fontsize=14, fontname=F_BOLD, color=BROWN, align=fitz.TEXT_ALIGN_LEFT)
    # Subtitle
    page.insert_textbox(fitz.Rect(left_x0, 154, left_x1, 176), item["subtitle"],
                        fontsize=11, fontname=F_BODY, color=TAN, align=fitz.TEXT_ALIGN_LEFT)
    # Body
    page.insert_textbox(fitz.Rect(left_x0, 186, left_x1, 392), item["body"],
                        fontsize=9.8, fontname=F_BODY, color=GREY, align=fitz.TEXT_ALIGN_JUSTIFY)
    # Note
    page.draw_line(fitz.Point(left_x0, 404), fitz.Point(left_x0 + 30, 404), color=LINE_C, width=1)
    page.insert_textbox(fitz.Rect(left_x0, 410, left_x1, 430),
                        "Household note", fontsize=9.2, fontname=F_BOLD, color=TAN, align=fitz.TEXT_ALIGN_LEFT)
    page.insert_textbox(fitz.Rect(left_x0, 432, left_x1, 510),
                        item["note"], fontsize=9.2, fontname=F_ITAL, color=TAN, align=fitz.TEXT_ALIGN_LEFT)
    # Image box (right)
    box = fitz.Rect(right_x0, 70, right_x1, 250)
    page.draw_rect(box, color=LINE_C, fill=CREAM, width=0.5)
    page.insert_image(fitted_rect(right_x0 + 8, 78, right_x1 - 8, 242, IMG_DIR / item["image"]), filename=str(IMG_DIR / item["image"]))


def closing_page(doc):
    page = doc.new_page(width=PAGE_W, height=PAGE_H)
    page.insert_textbox(fitz.Rect(MARGIN_L, 180, PAGE_W - MARGIN_R, 210),
                        "A closing note", fontsize=17, fontname=F_BOLD, color=BROWN, align=fitz.TEXT_ALIGN_LEFT)
    paras = [
        "These hours were not tasks. They were rhythm.",
        "A home without clocks kept time by kettle, bowl, foot basin, and lamp.",
        "These hours changed form but did not disappear - the electric kettle replaced the stove, but the first hot "
        "cup of the morning is still there. They still remember how a household moved through a single day, together.",
    ]
    y = 230
    for p in paras:
        page.insert_textbox(fitz.Rect(MARGIN_L, y, PAGE_W - MARGIN_R, y + 110),
                            p, fontsize=10.2, fontname=F_BODY, color=GREY, align=fitz.TEXT_ALIGN_JUSTIFY)
        y += 80
    page.insert_textbox(fitz.Rect(0, 560, PAGE_W, 580),
                        "Folk Calm - Chinese household customs, remembered quietly",
                        fontsize=9, fontname=F_BODY, color=LIGHT_GREY, align=fitz.TEXT_ALIGN_CENTER)
    page.insert_textbox(fitz.Rect(0, 582, PAGE_W, 602),
                        "You received this guide as part of the Folk Calm subscriber archive.",
                        fontsize=7.5, fontname=F_BODY, color=LIGHT_GREY, align=fitz.TEXT_ALIGN_CENTER)


def build_pdf() -> None:
    check_images()
    doc = fitz.open()
    cover_page(doc)
    toc_page(doc)
    intro_page(doc)
    for item in ITEMS:
        item_page(doc, item)
    closing_page(doc)
    doc.set_metadata({
        "title": "The Household Clock - Ten Quiet Hours of the Chinese Day",
        "author": "Folk Calm",
        "subject": "Subscriber Archive Guide No. 6",
    })
    doc.save(str(OUT_PDF), deflate=True, garbage=4)
    doc.close()
    print(f"PDF written: {OUT_PDF}")


if __name__ == "__main__":
    build_pdf()
