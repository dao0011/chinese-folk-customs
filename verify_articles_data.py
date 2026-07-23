#!/usr/bin/env python3
"""Verify the article HTML files against the shared client-side article index.

The checks are intentionally count-free: adding an article should only require
adding its HTML, image, and matching entry in ``js/articles-data.js``.
"""

from __future__ import annotations

import ast
import html as html_lib
import re
import sys
from pathlib import Path
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parent
DATA_FILE = ROOT / "js" / "articles-data.js"
ARTICLE_FIELDS = ("url", "title", "desc", "img", "date", "keywords")
JS_VALUE = r"(?:'(?:\\.|[^'\\])*'|\"(?:\\.|[^\"\\])*\")"
JS_FIELD_RE = re.compile(rf"\b(?P<name>[A-Za-z][A-Za-z0-9]*)\s*:\s*(?P<value>{JS_VALUE})")
OBJECT_RE = re.compile(r"\{[^{}]*\}", re.DOTALL)
META_TAG_RE = re.compile(r"<meta\b[^>]*>", re.IGNORECASE)
LINK_TAG_RE = re.compile(r"<link\b[^>]*>", re.IGNORECASE)
ATTR_RE = re.compile(r"([:\w-]+)\s*=\s*([\"'])(.*?)\2", re.DOTALL)
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="strict")


def decode_js_literal(value: str) -> str:
    decoded = ast.literal_eval(value)
    if not isinstance(decoded, str):
        raise ValueError(f"Expected a JavaScript string, got {value!r}")
    return decoded


def array_body(source: str, name: str, following: str | None = None) -> str:
    if following:
        pattern = rf"\b{re.escape(name)}\s*:\s*\[(.*?)\]\s*,\s*\b{re.escape(following)}\s*:"
    else:
        pattern = rf"\b{re.escape(name)}\s*:\s*\[(.*?)\]\s*\n?\s*\}}"
    match = re.search(pattern, source, re.DOTALL)
    if not match:
        raise ValueError(f"Could not parse {name} array in {DATA_FILE.relative_to(ROOT)}")
    return match.group(1)


def parse_objects(body: str) -> list[dict[str, str]]:
    records: list[dict[str, str]] = []
    for object_match in OBJECT_RE.finditer(body):
        fields: dict[str, str] = {}
        for field_match in JS_FIELD_RE.finditer(object_match.group(0)):
            fields[field_match.group("name")] = decode_js_literal(field_match.group("value"))
        if fields:
            records.append(fields)
    return records


def tag_attributes(tag: str) -> dict[str, str]:
    return {
        match.group(1).lower(): html_lib.unescape(match.group(3))
        for match in ATTR_RE.finditer(tag)
    }


def local_asset_path(value: str) -> str:
    path = urlsplit(value).path if "://" in value else value.split("?", 1)[0].split("#", 1)[0]
    return path.lstrip("/").replace("\\", "/")


def article_dates(source: str) -> tuple[str | None, str | None]:
    published_time = None
    for tag in META_TAG_RE.findall(source):
        attrs = tag_attributes(tag)
        if attrs.get("property", "").lower() == "article:published_time":
            published_time = attrs.get("content")
            break
    json_match = re.search(r'"datePublished"\s*:\s*"([^\"]+)"', source)
    return published_time, json_match.group(1) if json_match else None


def link_relations(source: str) -> set[tuple[str, str]]:
    relations: set[tuple[str, str]] = set()
    for tag in LINK_TAG_RE.findall(source):
        attrs = tag_attributes(tag)
        rel = attrs.get("rel", "").lower()
        href = attrs.get("href", "")
        if rel and href:
            relations.add((rel, href))
    return relations


def main() -> int:
    errors: list[str] = []

    def require(condition: bool, message: str) -> None:
        if not condition:
            errors.append(message)

    try:
        data_source = read_text(DATA_FILE)
        article_records = parse_objects(array_body(data_source, "articles", "staticPages"))
        static_records = parse_objects(array_body(data_source, "staticPages"))
    except (OSError, SyntaxError, ValueError) as exc:
        print(f"Article data verification failed:\n- {exc}")
        return 1

    require(
        "window.FOLK_CALM_DATA" in data_source,
        "js/articles-data.js does not define window.FOLK_CALM_DATA",
    )

    records_by_url: dict[str, dict[str, str]] = {}
    for position, record in enumerate(article_records, start=1):
        missing = [field for field in ARTICLE_FIELDS if not record.get(field)]
        require(not missing, f"Article data entry {position} is missing: {', '.join(missing)}")
        url = record.get("url", "")
        if not url:
            continue
        require(
            bool(re.fullmatch(r"article-[a-z0-9-]+\.html", url)),
            f"Shared article URL has an unexpected format: {url}",
        )
        require(url not in records_by_url, f"Duplicate shared article URL: {url}")
        records_by_url[url] = record

    html_files = {path.name: path for path in sorted(ROOT.glob("article-*.html"))}
    shared_urls = set(records_by_url)
    html_urls = set(html_files)
    for url in sorted(shared_urls - html_urls):
        errors.append(f"Shared article entry has no HTML file: {url}")
    for url in sorted(html_urls - shared_urls):
        errors.append(f"Article HTML is missing from js/articles-data.js: {url}")

    for url in sorted(shared_urls & html_urls):
        record = records_by_url[url]
        source = read_text(html_files[url])
        prefix = f"{url}:"

        shared_date = record.get("date", "")
        require(bool(DATE_RE.fullmatch(shared_date)), f"{prefix} invalid shared date {shared_date!r}")
        published_time, json_date = article_dates(source)
        require(
            published_time == shared_date,
            f"{prefix} shared date {shared_date!r} does not match article:published_time {published_time!r}",
        )
        require(
            json_date == shared_date,
            f"{prefix} shared date {shared_date!r} does not match JSON-LD datePublished {json_date!r}",
        )

        shared_image = local_asset_path(record.get("img", ""))
        require(bool(shared_image), f"{prefix} shared image path is empty")
        if shared_image:
            require((ROOT / shared_image).is_file(), f"{prefix} image file does not exist: {shared_image}")

        relations = link_relations(source)
        require(
            ("preconnect", "https://api.resend.com") in relations,
            f"{prefix} missing static Resend preconnect",
        )
        require(
            ("dns-prefetch", "//api.resend.com") in relations,
            f"{prefix} missing static Resend dns-prefetch",
        )

        data_position = source.find("js/articles-data.js")
        components_position = source.find("js/components.js")
        require(data_position >= 0, f"{prefix} does not load js/articles-data.js")
        require(components_position >= 0, f"{prefix} does not load js/components.js")
        require(
            data_position >= 0 and components_position >= 0 and data_position < components_position,
            f"{prefix} must load articles-data.js before components.js",
        )

    static_urls: set[str] = set()
    for position, record in enumerate(static_records, start=1):
        missing = [field for field in ("title", "url", "keywords") if not record.get(field)]
        require(not missing, f"Static page entry {position} is missing: {', '.join(missing)}")
        url = record.get("url", "")
        if not url:
            continue
        require(url not in static_urls, f"Duplicate static page URL: {url}")
        static_urls.add(url)
        require((ROOT / local_asset_path(url)).is_file(), f"Static page entry does not exist: {url}")

    for script_name in ("js/components.js", "js/main.js"):
        script_source = read_text(ROOT / script_name)
        require(
            "window.FOLK_CALM_DATA" in script_source,
            f"{script_name} does not consume window.FOLK_CALM_DATA",
        )

    for html_path in sorted(ROOT.glob("*.html")):
        page_source = read_text(html_path)
        components_position = page_source.find("js/components.js")
        if components_position < 0:
            continue
        data_position = page_source.find("js/articles-data.js")
        require(data_position >= 0, f"{html_path.name} loads components.js without articles-data.js")
        require(
            data_position >= 0 and data_position < components_position,
            f"{html_path.name} must load articles-data.js before components.js",
        )

    index_source = read_text(ROOT / "index.html")
    index_relations = link_relations(index_source)
    require(
        ("preconnect", "https://api.resend.com") in index_relations,
        "index.html is missing the static Resend preconnect",
    )
    require(
        ("dns-prefetch", "//api.resend.com") in index_relations,
        "index.html is missing the static Resend dns-prefetch",
    )

    if errors:
        print("Article data verification failed:")
        for error in errors:
            print(f"- {error}")
        print(f"\nChecked {len(html_files)} article HTML files and {len(static_records)} static search entries.")
        return 1

    print(
        "Article data verification passed: "
        f"{len(html_files)} article HTML files, {len(static_records)} static search entries, "
        "and all preconnect declarations are consistent."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
