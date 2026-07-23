#!/usr/bin/env python3
"""Validate a pre-deployed article schedule without rejecting future articles.

Future article files are expected to be present in the deployment. Cloudflare
Functions gate direct requests and filter the sitemap at request time; this
guard verifies the metadata that those runtime controls depend on.
"""

from __future__ import annotations

import argparse
import ast
import datetime as dt
import re
import subprocess
import sys
from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[1]
SHANGHAI = dt.timezone(dt.timedelta(hours=8), name="Asia/Shanghai")
ARTICLE_DATA_FILE = Path("js/articles-data.js")
SYNC_FILES = (
    Path("categories.html"),
    Path("sitemap.xml"),
    ARTICLE_DATA_FILE,
    Path("js/components.js"),
    Path("js/main.js"),
)
ARTICLE_RE = re.compile(r"article-[a-z0-9-]+\.html", re.IGNORECASE)
IMAGE_RE = re.compile(
    r"(?:https://www\.folkcalm\.com/)?(images/[A-Za-z0-9._/-]+\.(?:webp|jpg|jpeg|png))",
    re.IGNORECASE,
)
META_TAG_RE = re.compile(r"<meta\b[^>]*>", re.IGNORECASE)
ATTR_RE = re.compile(r"([:\w-]+)\s*=\s*([\"'])(.*?)\2", re.DOTALL)
JS_VALUE = r"(?:'(?:\\.|[^'\\])*'|\"(?:\\.|[^\"\\])*\")"
JS_FIELD_RE = re.compile(rf"\b(?P<name>[A-Za-z][A-Za-z0-9]*)\s*:\s*(?P<value>{JS_VALUE})")
OBJECT_RE = re.compile(r"\{[^{}]*\}", re.DOTALL)


def repo_path(path: str | Path) -> str:
    raw = Path(path)
    if raw.is_absolute():
        try:
            raw = raw.relative_to(ROOT)
        except ValueError:
            return raw.as_posix()
    return raw.as_posix()


def read_text(path: Path) -> str:
    return (ROOT / path).read_text(encoding="utf-8", errors="strict")


def git_known_paths() -> set[str]:
    result = subprocess.run(
        ["git", "ls-files", "--cached"],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=True,
    )
    return {line.strip().replace("\\", "/") for line in result.stdout.splitlines() if line.strip()}


def decode_js_literal(value: str) -> str:
    decoded = ast.literal_eval(value)
    if not isinstance(decoded, str):
        raise ValueError(f"Expected a string value, got {value!r}")
    return decoded


def shared_articles(errors: list[str]) -> dict[str, dict[str, str]]:
    source = read_text(ARTICLE_DATA_FILE)
    array_match = re.search(
        r"\barticles\s*:\s*\[(.*?)\]\s*,\s*\bstaticPages\s*:",
        source,
        re.DOTALL,
    )
    if not array_match:
        errors.append("js/articles-data.js has no parseable articles array.")
        return {}

    records: dict[str, dict[str, str]] = {}
    for position, object_match in enumerate(OBJECT_RE.finditer(array_match.group(1)), start=1):
        try:
            fields = {
                field_match.group("name"): decode_js_literal(field_match.group("value"))
                for field_match in JS_FIELD_RE.finditer(object_match.group(0))
            }
        except (SyntaxError, ValueError) as exc:
            errors.append(f"Article data entry {position} cannot be parsed: {exc}")
            continue

        url = fields.get("url", "")
        if not url:
            errors.append(f"Article data entry {position} has no URL.")
            continue
        if not ARTICLE_RE.fullmatch(url):
            errors.append(f"Shared article URL has an unexpected format: {url}")
            continue
        if url in records:
            errors.append(f"Duplicate shared article URL: {url}")
            continue
        for field in ("date", "img"):
            if not fields.get(field):
                errors.append(f"{url} has no shared {field} value.")
        records[url] = fields

    if not records:
        errors.append("js/articles-data.js contains no article records.")
    return records


def tag_attributes(tag: str) -> dict[str, str]:
    return {match.group(1).lower(): match.group(3) for match in ATTR_RE.finditer(tag)}


def article_metadata_dates(article: Path) -> tuple[str | None, str | None]:
    source = read_text(article)
    published_time = None
    for tag in META_TAG_RE.findall(source):
        attrs = tag_attributes(tag)
        if attrs.get("property", "").lower() == "article:published_time":
            published_time = attrs.get("content")
            break
    json_match = re.search(r'"datePublished"\s*:\s*"([^\"]+)"', source)
    return published_time, json_match.group(1) if json_match else None


def parse_iso_date(value: str, label: str, errors: list[str]) -> dt.date | None:
    try:
        parsed = dt.date.fromisoformat(value)
    except (TypeError, ValueError):
        errors.append(f"{label} must be a real date in YYYY-MM-DD form; got {value!r}.")
        return None
    if parsed.isoformat() != value:
        errors.append(f"{label} must use canonical YYYY-MM-DD form; got {value!r}.")
        return None
    return parsed


def article_name_from_href(href: str) -> str | None:
    path = urlsplit(href).path
    name = Path(path).name
    return name if ARTICLE_RE.fullmatch(name) else None


class CategoryArticleParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.li_dates: list[str | None] = []
        self.placements: dict[str, list[str | None]] = defaultdict(list)

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {name.lower(): value for name, value in attrs}
        if tag.lower() == "li":
            self.li_dates.append(values.get("data-publish-date"))
            return
        if tag.lower() != "a":
            return
        href = values.get("href") or ""
        article = article_name_from_href(href)
        # Only list entries participate in scheduled hiding. Category hero
        # images can link to an already-published representative article.
        if article and self.li_dates:
            self.placements[article].append(self.li_dates[-1])

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "li" and self.li_dates:
            self.li_dates.pop()


def category_article_dates() -> dict[str, list[str | None]]:
    parser = CategoryArticleParser()
    parser.feed(read_text(Path("categories.html")))
    parser.close()
    return dict(parser.placements)


def article_refs_in(path: Path) -> set[str]:
    return {match.lower() for match in ARTICLE_RE.findall(read_text(path))}


def public_article_refs() -> dict[str, set[str]]:
    refs: dict[str, set[str]] = {}
    for sync_file in SYNC_FILES:
        for article in article_refs_in(sync_file):
            refs.setdefault(article, set()).add(sync_file.as_posix())
    return refs


def public_image_refs(article_refs: set[str]) -> dict[str, set[str]]:
    refs: dict[str, set[str]] = {}
    files_to_scan = list(SYNC_FILES) + [Path(article) for article in sorted(article_refs)]
    for file_path in files_to_scan:
        if not (ROOT / file_path).exists():
            continue
        for image in IMAGE_RE.findall(read_text(file_path)):
            normalized = image.replace("\\", "/")
            refs.setdefault(normalized, set()).add(file_path.as_posix())
    return refs


def ensure_known_public_path(
    path: str,
    locations: set[str],
    known_paths: set[str],
    errors: list[str],
) -> None:
    full_path = ROOT / path
    where = ", ".join(sorted(locations))
    if not full_path.is_file():
        errors.append(f"{path} is referenced from {where}, but the file does not exist.")
        return
    if path not in known_paths:
        errors.append(
            f"{path} is referenced from {where}, but it is neither tracked nor listed with --release-file."
        )


def compare_index_set(
    label: str,
    actual: set[str],
    expected: set[str],
    errors: list[str],
) -> None:
    for article in sorted(expected - actual):
        errors.append(f"{label} is missing shared article {article}.")
    for article in sorted(actual - expected):
        errors.append(f"{label} references {article}, which is absent from js/articles-data.js.")


def default_today() -> str:
    return dt.datetime.now(SHANGHAI).date().isoformat()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Validate the shared publication schedule used by the category filter, "
            "server-side article gate, and dynamic sitemap. Future articles are allowed."
        )
    )
    parser.add_argument(
        "--today",
        default=default_today(),
        help="Reference date in YYYY-MM-DD form. Defaults to today's Asia/Shanghai date.",
    )
    parser.add_argument(
        "--release-file",
        action="append",
        default=[],
        help=(
            "A new article or image included in the pending deployment before git add. "
            "Repeat this option for every new file."
        ),
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    errors: list[str] = []
    today = parse_iso_date(args.today, "--today", errors)
    if today is None:
        print("Publish sync guard failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    try:
        known_paths = git_known_paths() | {repo_path(path) for path in args.release_file}
    except (OSError, subprocess.CalledProcessError) as exc:
        print(f"Publish sync guard failed:\n- Unable to read tracked files from git: {exc}")
        return 1

    for path in args.release_file:
        normalized = repo_path(path)
        if not (ROOT / normalized).is_file():
            errors.append(f"{normalized} was listed with --release-file, but it does not exist.")

    try:
        records = shared_articles(errors)
        article_refs = public_article_refs()
        category_dates = category_article_dates()
        sitemap_articles = article_refs_in(Path("sitemap.xml"))
        html_articles = {path.name for path in ROOT.glob("article-*.html") if path.is_file()}
    except (OSError, UnicodeError) as exc:
        print(f"Publish sync guard failed:\n- Unable to read publication files: {exc}")
        return 1

    shared_urls = set(records)
    compare_index_set("article HTML files", html_articles, shared_urls, errors)
    compare_index_set("categories.html", set(category_dates), shared_urls, errors)
    compare_index_set("sitemap.xml", sitemap_articles, shared_urls, errors)

    parsed_dates: dict[str, dt.date] = {}
    for article, record in sorted(records.items()):
        shared_date_text = record.get("date", "")
        shared_date = parse_iso_date(shared_date_text, f"{article} shared date", errors)
        if shared_date:
            parsed_dates[article] = shared_date

        article_path = Path(article)
        if not (ROOT / article_path).is_file():
            continue
        published_time, json_date = article_metadata_dates(article_path)
        if not published_time:
            errors.append(f"{article} has no article:published_time meta tag.")
        elif published_time != shared_date_text:
            errors.append(
                f"{article} article:published_time is {published_time}, but shared data uses {shared_date_text}."
            )
        if not json_date:
            errors.append(f"{article} has no JSON-LD datePublished value.")
        elif json_date != shared_date_text:
            errors.append(
                f"{article} JSON-LD datePublished is {json_date}, but shared data uses {shared_date_text}."
            )

    for article, placements in sorted(category_dates.items()):
        if len(placements) != 1:
            errors.append(f"categories.html links {article} {len(placements)} times; expected exactly once.")
        shared_date_text = records.get(article, {}).get("date", "")
        shared_date = parsed_dates.get(article)
        for category_date in placements:
            if category_date:
                parse_iso_date(category_date, f"{article} data-publish-date", errors)
                if shared_date_text and category_date != shared_date_text:
                    errors.append(
                        f"{article} data-publish-date is {category_date}, but shared data uses {shared_date_text}."
                    )
            elif shared_date and shared_date > today:
                errors.append(
                    f"Future article {article} needs data-publish-date={shared_date_text!r} on its category <li>."
                )

    for article, locations in sorted(article_refs.items()):
        ensure_known_public_path(article, locations, known_paths, errors)

    image_refs = public_image_refs(set(article_refs))
    for image, locations in sorted(image_refs.items()):
        ensure_known_public_path(image, locations, known_paths, errors)

    if errors:
        print("Publish sync guard failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    future_count = sum(1 for value in parsed_dates.values() if value > today)
    print(
        "Publish sync guard passed for "
        f"{today.isoformat()} (Asia/Shanghai): {len(records)} scheduled articles, "
        f"{future_count} future article(s), and {len(image_refs)} referenced images checked."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
