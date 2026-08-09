#!/usr/bin/env python3
"""Validate Folk Calm article structure and metadata for an editorial batch."""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ARTICLES = (
    "article-porcelain-pillow.html",
    "article-xiangru-summer-drink.html",
    "article-dried-loofah-scrubber.html",
    "article-toasted-rice-water.html",
    "article-cane-chair.html",
)
EXPECTED_COMPARISON_PHRASES = {
    "article-mosquito-net.html": {
        "bedding airing",
        "cassia-seed pillow",
    },
    "article-lotus-leaf-congee.html": {
        "mung-bean soup",
        "lotus-root water",
    },
    "article-green-glass-bottle.html": {
        "rice water between kitchen and washroom",
        "soap pods at the wash basin",
    },
    "article-reed-blind.html": {
        "bamboo wife",
        "mint cloth",
    },
    "article-biting-autumn.html": {
        "sour-plum drink",
        "winter-melon tea",
    },
    "article-porcelain-pillow.html": {
        "cassia-seed pillow",
        "bamboo sleeping mat",
    },
    "article-xiangru-summer-drink.html": {
        "winter-melon tea",
        "barley water",
    },
    "article-dried-loofah-scrubber.html": {
        "soap pods",
        "rice water between kitchen and washroom",
    },
    "article-toasted-rice-water.html": {
        "plain rice congee",
        "barley water",
    },
    "article-cane-chair.html": {
        "post-meal walk",
        "post-lunch pause",
    },
}
BANNED_TERMS = (
    "treatment",
    "cure",
    "remedy",
    "prescribe",
    "therapy",
    "medical advice",
)
BANNED_ENDING_PHRASES = ("symbol", "meaning", "memory taught me")
ALLOWED_HEADING_PROPER_NOUNS = {"Song"}
WORD_RE = re.compile(r"[A-Za-z]+(?:[-'][A-Za-z]+)*")


def strip_tags(value: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", value))).strip()


def sentence_count(value: str) -> int:
    plain = strip_tags(value)
    return len(re.findall(r"[.!?]+(?=\s|$)", plain))


def extract(pattern: str, source: str, label: str, errors: list[str]) -> str:
    match = re.search(pattern, source, re.DOTALL)
    if not match:
        errors.append(f"missing {label}")
        return ""
    return html.unescape(match.group(1)).strip()


def meta_content(source: str, key: str, *, property_name: bool = False) -> str:
    attribute = "property" if property_name else "name"
    match = re.search(
        rf'<meta\s+{attribute}="{re.escape(key)}"\s+content="([^"]*)"\s*/?>',
        source,
    )
    return html.unescape(match.group(1)).strip() if match else ""


def validate_article(path: Path) -> tuple[list[str], dict[str, object]]:
    errors: list[str] = []
    source = path.read_text(encoding="utf-8")
    relative_name = path.name

    body_match = re.search(
        r"</figure>(.*?)<div id=\"email-signup-cta\">", source, re.DOTALL
    )
    if not body_match:
        return ["cannot locate six-paragraph article body"], {}
    body = body_match.group(1)
    if re.search(r"<a\b", body, re.IGNORECASE):
        errors.append("article body must not contain links")

    h2_html = re.findall(r"<h2>(.*?)</h2>", body, re.DOTALL)
    headings = [strip_tags(value) for value in h2_html]
    if len(headings) != 3:
        errors.append(f"expected 3 H2 headings, found {len(headings)}")
    for heading in headings:
        heading_words = WORD_RE.findall(heading)
        if not 4 <= len(heading_words) <= 6:
            errors.append(f'H2 must contain 4-6 words: "{heading}"')
        if heading and heading[0] != heading[0].upper():
            errors.append(f'H2 must begin with a capital letter: "{heading}"')
        if any(
            word[0].isupper() and word not in ALLOWED_HEADING_PROPER_NOUNS
            for word in heading_words[1:]
        ):
            errors.append(f'H2 must use sentence case: "{heading}"')

    sections = re.split(r"<h2>.*?</h2>", body, flags=re.DOTALL)[1:]
    paragraph_html: list[str] = []
    for index, section in enumerate(sections, start=1):
        paragraphs = re.findall(r"<p>(.*?)</p>", section, re.DOTALL)
        paragraph_html.extend(paragraphs)
        if len(paragraphs) != 2:
            errors.append(f"H2 section {index} must contain 2 paragraphs, found {len(paragraphs)}")

    body_text = " ".join(strip_tags(value) for value in paragraph_html)
    word_count = len(WORD_RE.findall(body_text))
    if not 300 <= word_count <= 400:
        errors.append(f"body must contain 300-400 words, found {word_count}")
    for index, paragraph in enumerate(paragraph_html, start=1):
        count = sentence_count(paragraph)
        if not 2 <= count <= 4:
            errors.append(f"paragraph {index} must contain 2-4 sentences, found {count}")

    if len(sections) >= 2:
        middle_paragraphs = re.findall(r"<p>(.*?)</p>", sections[1], re.DOTALL)
        if len(middle_paragraphs) >= 2:
            comparison_paragraph = middle_paragraphs[1]
            comparison_sentences = sentence_count(comparison_paragraph)
            if not 2 <= comparison_sentences <= 3:
                errors.append(
                    "second H2's second paragraph must contain 2-3 sentences, "
                    f"found {comparison_sentences}"
                )
            comparison_text = strip_tags(comparison_paragraph).lower()
            expected = EXPECTED_COMPARISON_PHRASES.get(relative_name)
            missing = sorted(
                phrase for phrase in (expected or set()) if phrase not in comparison_text
            )
            if missing:
                errors.append(
                    f"comparison paragraph is missing phrases: {missing}"
                )

    for term in BANNED_TERMS:
        if re.search(rf"\b{re.escape(term)}\b", source, re.IGNORECASE):
            errors.append(f'banned term found: "{term}"')
    if paragraph_html:
        ending = strip_tags(paragraph_html[-1]).lower()
        for phrase in BANNED_ENDING_PHRASES:
            if phrase in ending:
                errors.append(f'banned abstract ending phrase found: "{phrase}"')

    page_title = extract(r"<title>(.*?)</title>", source, "page title", errors)
    headline = extract(r'<h1[^>]*>(.*?)</h1>', source, "H1", errors)
    description = meta_content(source, "description")
    lead = extract(
        r'<p class="lead"[^>]*>(.*?)</p>', source, "article lead", errors
    )
    if not 45 <= len(page_title) <= 65:
        errors.append(f"page title must contain 45-65 characters, found {len(page_title)}")
    if not 130 <= len(description) <= 165:
        errors.append(
            f"meta description must contain 130-165 characters, found {len(description)}"
        )
    if page_title != f"{headline} | Folk Calm":
        errors.append("page title must equal H1 plus ' | Folk Calm'")
    if lead != description:
        errors.append("lead must match meta description")

    og_title = meta_content(source, "og:title", property_name=True)
    og_description = meta_content(source, "og:description", property_name=True)
    og_image = meta_content(source, "og:image", property_name=True)
    published = meta_content(source, "article:published_time", property_name=True)
    twitter_title = meta_content(source, "twitter:title")
    twitter_description = meta_content(source, "twitter:description")
    twitter_image = meta_content(source, "twitter:image")
    if og_title != headline or twitter_title != headline:
        errors.append("H1, OG title, and Twitter title must match")
    if og_description != description or twitter_description != description:
        errors.append("meta, OG, and Twitter descriptions must match")
    if not og_image or twitter_image != og_image:
        errors.append("OG and Twitter images must match")

    json_ld_raw = extract(
        r'<script type="application/ld\+json">\s*(.*?)\s*</script>',
        source,
        "JSON-LD",
        errors,
    )
    if json_ld_raw:
        try:
            json_ld = json.loads(json_ld_raw)
        except json.JSONDecodeError as exc:
            errors.append(f"invalid JSON-LD: {exc}")
            json_ld = {}
        expected_json = {
            "headline": headline,
            "description": description,
            "image": og_image,
            "datePublished": published,
        }
        for key, expected_value in expected_json.items():
            if json_ld.get(key) != expected_value:
                errors.append(f"JSON-LD {key} does not match page metadata")

    canonical = extract(
        r'<link rel="canonical" href="([^"]+)">', source, "canonical URL", errors
    )
    if json_ld_raw:
        try:
            main_entity = json.loads(json_ld_raw).get("mainEntityOfPage")
        except json.JSONDecodeError:
            main_entity = None
        if main_entity != canonical:
            errors.append("JSON-LD mainEntityOfPage must match canonical URL")

    related_raw = extract(
        r'<article[^>]*data-related-notes="([^"]+)"',
        source,
        "data-related-notes",
        errors,
    )
    related = [item.strip() for item in related_raw.split(",") if item.strip()]
    if len(related) != 3 or len(set(related)) != 3:
        errors.append("data-related-notes must contain 3 unique article filenames")
    for related_name in related:
        if not (ROOT / related_name).is_file():
            errors.append(f"related article does not exist: {related_name}")

    figure_match = re.search(
        r'<figure class="article-image">.*?<img\s+src="([^"]+)"\s+alt="([^"]+)"[^>]*'
        r'width="(\d+)"\s+height="(\d+)"[^>]*>.*?<figcaption>(.*?)</figcaption>',
        source,
        re.DOTALL,
    )
    if not figure_match:
        errors.append("article figure must include src, alt, width, height, and figcaption")
    else:
        image_src, alt, width, height, caption = figure_match.groups()
        image_path = ROOT / image_src
        if not image_path.is_file():
            errors.append(f"article image does not exist: {image_src}")
        else:
            with Image.open(image_path) as image:
                if image.size != (1448, 1086):
                    errors.append(f"article image must be 1448x1086, found {image.size}")
        if (int(width), int(height)) != (1448, 1086):
            errors.append("image width and height attributes must be 1448x1086")
        if not alt.strip() or not strip_tags(caption):
            errors.append("image alt text and figcaption must both be non-empty")
        if alt.strip() == strip_tags(caption):
            errors.append("image alt text and figcaption must serve different purposes")

    if '<div id="site-disclaimer-banner"></div>' not in source:
        errors.append("missing site disclaimer banner placeholder")
    if '<div id="site-footer"></div>' not in source:
        errors.append("missing site footer placeholder")
    if 'class="disclaimer-box"' in source:
        errors.append("article must not add an independent disclaimer-box")

    stats = {
        "words": word_count,
        "headings": len(headings),
        "paragraphs": len(paragraph_html),
        "description_chars": len(description),
        "title_chars": len(page_title),
    }
    return errors, stats


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "articles",
        nargs="*",
        default=list(DEFAULT_ARTICLES),
        help="Article HTML paths relative to the repository root",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    failed = False
    for article in args.articles:
        path = (ROOT / article).resolve()
        if not path.is_file():
            print(f"FAIL {article}: file not found")
            failed = True
            continue
        errors, stats = validate_article(path)
        if errors:
            failed = True
            print(f"FAIL {article}")
            for error in errors:
                print(f"  - {error}")
        else:
            print(
                f"PASS {article}: {stats['words']} words, "
                f"{stats['headings']} H2, {stats['paragraphs']} paragraphs, "
                f"title {stats['title_chars']} chars, description "
                f"{stats['description_chars']} chars"
            )
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
