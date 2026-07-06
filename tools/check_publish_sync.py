#!/usr/bin/env python3
"""Block public article indexes from pointing at unpublished drafts."""

from __future__ import annotations

import argparse
import datetime as dt
import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SYNC_FILES = (
    Path("categories.html"),
    Path("sitemap.xml"),
    Path("js/components.js"),
    Path("js/main.js"),
)

ARTICLE_RE = re.compile(r"article-[a-z0-9-]+\.html")
DATE_RE = re.compile(
    r"<meta\s+property=[\"']article:published_time[\"']\s+content=[\"'](\d{4}-\d{2}-\d{2})[\"']",
    re.IGNORECASE,
)
IMAGE_RE = re.compile(
    r"(?:https://www\.folkcalm\.com/)?(images/[A-Za-z0-9._/-]+\.(?:webp|jpg|jpeg|png))",
    re.IGNORECASE,
)


def repo_path(path: str | Path) -> str:
    raw = Path(path)
    if raw.is_absolute():
        try:
            raw = raw.relative_to(ROOT)
        except ValueError:
            return raw.as_posix()
    return raw.as_posix()


def read_text(path: Path) -> str:
    return (ROOT / path).read_text(encoding="utf-8", errors="replace")


def git_known_paths() -> set[str]:
    result = subprocess.run(
        ["git", "ls-files", "--cached"],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=True,
    )
    return {line.strip().replace("\\", "/") for line in result.stdout.splitlines() if line.strip()}


def article_date(article: Path) -> dt.date | None:
    match = DATE_RE.search(read_text(article))
    if not match:
        return None
    return dt.date.fromisoformat(match.group(1))


def public_article_refs() -> dict[str, set[str]]:
    refs: dict[str, set[str]] = {}
    for sync_file in SYNC_FILES:
        text = read_text(sync_file)
        for article in ARTICLE_RE.findall(text):
            refs.setdefault(article, set()).add(sync_file.as_posix())
    return refs


def public_image_refs(article_refs: set[str]) -> dict[str, set[str]]:
    refs: dict[str, set[str]] = {}
    files_to_scan = list(SYNC_FILES) + [Path(article) for article in sorted(article_refs)]
    for file_path in files_to_scan:
        if not (ROOT / file_path).exists():
            continue
        for image in IMAGE_RE.findall(read_text(file_path)):
            refs.setdefault(image, set()).add(file_path.as_posix())
    return refs


def ensure_known_public_path(
    path: str,
    locations: set[str],
    known_paths: set[str],
    errors: list[str],
) -> None:
    full_path = ROOT / path
    where = ", ".join(sorted(locations))
    if not full_path.exists():
        errors.append(f"{path} is referenced from {where}, but the file does not exist.")
        return
    if path not in known_paths:
        errors.append(
            f"{path} is referenced from {where}, but it is not tracked or listed as a release file."
        )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Verify that public article indexes only reference article and image files "
            "that are ready for the current publish date."
        )
    )
    parser.add_argument(
        "--today",
        default=dt.date.today().isoformat(),
        help="Publish date to check against, in YYYY-MM-DD form. Defaults to local today.",
    )
    parser.add_argument(
        "--release-file",
        action="append",
        default=[],
        help=(
            "A new file planned for this release before git add runs. Repeat for each "
            "new article, image, or pin image."
        ),
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    today = dt.date.fromisoformat(args.today)
    known_paths = git_known_paths() | {repo_path(path) for path in args.release_file}
    errors: list[str] = []

    for path in args.release_file:
        normalized = repo_path(path)
        if not (ROOT / normalized).exists():
            errors.append(f"{normalized} was listed as a release file, but it does not exist.")

    article_refs = public_article_refs()
    for article, locations in sorted(article_refs.items()):
        ensure_known_public_path(article, locations, known_paths, errors)
        if not (ROOT / article).exists():
            continue

        published = article_date(Path(article))
        if not published:
            errors.append(f"{article} is public, but has no article:published_time meta tag.")
            continue
        if published > today:
            where = ", ".join(sorted(locations))
            errors.append(
                f"{article} is dated {published.isoformat()} but is referenced from {where} before {today.isoformat()}."
            )

    image_refs = public_image_refs(set(article_refs))
    for image, locations in sorted(image_refs.items()):
        ensure_known_public_path(image, locations, known_paths, errors)

    if errors:
        print("Publish sync guard failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print(
        "Publish sync guard passed for "
        f"{today.isoformat()}: {len(article_refs)} public article refs and {len(image_refs)} public image refs checked."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
