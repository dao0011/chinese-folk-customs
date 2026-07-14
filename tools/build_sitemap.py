#!/usr/bin/env python3
"""从 git log 读取 lastmod 自动生成 sitemap.xml"""

import subprocess, sys, os
from datetime import datetime, timezone

PAGES = [
    ("https://www.folkcalm.com/", "index.html", "weekly", "1.0"),
    ("https://www.folkcalm.com/categories.html", "categories.html", "weekly", "0.8"),
    # Articles
    ("https://www.folkcalm.com/article-mugwort-foot-soak.html", "article-mugwort-foot-soak.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-ginger-tea.html", "article-ginger-tea.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-rice-congee.html", "article-rice-congee.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-salt-warm-pack.html", "article-salt-warm-pack.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-yam-millet-porridge.html", "article-yam-millet-porridge.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-sichuan-peppercorn-foot-soak.html", "article-sichuan-peppercorn-foot-soak.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-sour-jujube-seed-tea.html", "article-sour-jujube-seed-tea.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-post-meal-walk.html", "article-post-meal-walk.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-goji-berry-tea.html", "article-goji-berry-tea.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-scallion-white-root.html", "article-scallion-white-root.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-moxibustion-home.html", "article-moxibustion-home.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-ginger-foot-soak.html", "article-ginger-foot-soak.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-winter-melon-tea.html", "article-winter-melon-tea.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-morning-warm-water.html", "article-morning-warm-water.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-rice-water-rinse.html", "article-rice-water-rinse.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-bedding-airing.html", "article-bedding-airing.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-post-lunch-pause.html", "article-post-lunch-pause.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-soap-pods.html", "article-soap-pods.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-mung-bean-soup.html", "article-mung-bean-soup.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-chrysanthemum-tea.html", "article-chrysanthemum-tea.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-warm-towel-compress.html", "article-warm-towel-compress.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-pear-water-night-cough.html", "article-pear-water-night-cough.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-tremella-soup.html", "article-tremella-soup.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-sour-plum-drink.html", "article-sour-plum-drink.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-salt-water-gargle.html", "article-salt-water-gargle.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-longan-red-date-tea.html", "article-longan-red-date-tea.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-ginger-scalp-rub.html", "article-ginger-scalp-rub.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-bamboo-wife.html", "article-bamboo-wife.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-lotus-root-water.html", "article-lotus-root-water.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-mint-cool-cloth.html", "article-mint-cool-cloth.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-black-sesame-walnut-paste.html", "article-black-sesame-walnut-paste.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-cassia-seed-pillow.html", "article-cassia-seed-pillow.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-water-chestnut-sugarcane-water.html", "article-water-chestnut-sugarcane-water.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-corn-silk-water.html", "article-corn-silk-water.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-ginger-on-the-belly.html", "article-ginger-on-the-belly.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-honey-white-radish-water.html", "article-honey-white-radish-water.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-potato-slices-forehead.html", "article-potato-slices-forehead.html", "monthly", "0.8"),
    ("https://www.folkcalm.com/article-hawthorn-water.html", "article-hawthorn-water.html", "monthly", "0.8"),
    # Static pages
    ("https://www.folkcalm.com/disclaimer.html", "disclaimer.html", "yearly", "0.4"),
    ("https://www.folkcalm.com/about.html", "about.html", "monthly", "0.6"),
    ("https://www.folkcalm.com/privacy-policy.html", "privacy-policy.html", "yearly", "0.3"),
    ("https://www.folkcalm.com/affiliate-disclosure.html", "affiliate-disclosure.html", "yearly", "0.3"),
    ("https://www.folkcalm.com/terms-of-use.html", "terms-of-use.html", "yearly", "0.3"),
]

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

    for url, filename, changefreq, priority in PAGES:
        lastmod = get_lastmod(filename)
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
    print(f"sitemap.xml written ({len(PAGES)} URLs)")
