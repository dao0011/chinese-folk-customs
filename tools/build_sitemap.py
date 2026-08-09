#!/usr/bin/env python3
"""从 git log 读取 lastmod 自动生成 sitemap.xml"""

import os
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

STATIC_PAGES = [
    ("https://www.folkcalm.com/", "index.html", "weekly", "1.0"),
    ("https://www.folkcalm.com/categories.html", "categories.html", "weekly", "0.8"),
    ("https://www.folkcalm.com/disclaimer.html", "disclaimer.html", "yearly", "0.4"),
    ("https://www.folkcalm.com/about.html", "about.html", "monthly", "0.6"),
    ("https://www.folkcalm.com/privacy-policy.html", "privacy-policy.html", "yearly", "0.3"),
    ("https://www.folkcalm.com/affiliate-disclosure.html", "affiliate-disclosure.html", "yearly", "0.3"),
    ("https://www.folkcalm.com/terms-of-use.html", "terms-of-use.html", "yearly", "0.3"),
    ("https://www.folkcalm.com/remedies-guide.html", "remedies-guide.html", "monthly", "0.7"),
]


def shared_article_pages():
    """Return every shared article and its scheduled publication date."""
    source = (ROOT / "js" / "articles-data.js").read_text(encoding="utf-8")
    pattern = re.compile(
        r"\{\s*url:\s*'(?P<url>article-[^']+\.html)'.*?\bdate:\s*'(?P<date>\d{4}-\d{2}-\d{2})'",
        re.DOTALL,
    )
    pages = []
    for match in pattern.finditer(source):
        filename = match.group("url")
        pages.append(
            (
                f"https://www.folkcalm.com/{filename}",
                filename,
                "monthly",
                "0.8",
                match.group("date"),
            )
        )
    if not pages:
        raise RuntimeError("No shared articles found in js/articles-data.js")
    return pages

def get_lastmod(filename):
    """返回文件在 git 中的最后修改日期（年月日）"""
    try:
        result = subprocess.run(
            ["git", "log", "--follow", "--format=%aI", "-1", "--", filename],
            capture_output=True, text=True, check=True
        )
        iso = result.stdout.strip()
        dt = datetime.fromisoformat(iso)
        return dt.strftime("%Y-%m-%d")
    except Exception:
        # 回退到文件系统时间
        mtime = os.path.getmtime(filename)
        dt = datetime.fromtimestamp(mtime, tz=timezone.utc)
        return dt.strftime("%Y-%m-%d")

def generate():
    lines = [
        '<?xml version="1.0" encoding="utf-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
        ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'
        ' xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9'
        ' http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">',
    ]

    static_before = STATIC_PAGES[:2]
    static_after = STATIC_PAGES[2:]
    pages = [(*page, get_lastmod(page[1])) for page in static_before]
    pages.extend(shared_article_pages())
    pages.extend((*page, get_lastmod(page[1])) for page in static_after)

    for url, filename, changefreq, priority, lastmod in pages:
        lines.append("  <url>")
        lines.append(f"    <loc>{url}</loc>")
        lines.append(f"    <lastmod>{lastmod}T00:00:00+00:00</lastmod>")
        lines.append(f"    <changefreq>{changefreq}</changefreq>")
        lines.append(f"    <priority>{priority}</priority>")
        lines.append("  </url>")

    lines.append("</urlset>")
    return "\n".join(lines) + "\n"

if __name__ == "__main__":
    sitemap = generate()
    output_path = os.path.join(os.path.dirname(__file__), "..", "sitemap.xml")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(sitemap)
    print(f"sitemap.xml written ({sitemap.count('<url>')} URLs)")
