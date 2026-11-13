#!/usr/bin/env python3
"""Generate PWA icons (PNGs), manifests, and service workers for the root site and all sub-apps."""

from __future__ import annotations

import json
import os
import tempfile
from pathlib import Path

import gi

gi.require_version("GdkPixbuf", "2.0")
from gi.repository import GdkPixbuf  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent

APPS = [
    {
        "dir": "SportTimer",
        "name": "Timer & Tracker",
        "short_name": "SportTimer",
        "description": "Interval timer, workout programs, and activity tracker.",
        "svg": "SportTimer/public/stopwatch.svg",
        "svg_href": "./stopwatch.svg",
        "bg": "#0f0f0f",
        "theme": "#0f0f0f",
        "padding": 0.18,
    },
    {
        "dir": "FarnsworthCWTrainer",
        "name": "Farnsworth CW Trainer",
        "short_name": "CW Trainer",
        "description": "Morse code practice with Farnsworth timing.",
        "svg": "FarnsworthCWTrainer/public/key.svg",
        "svg_href": "./key.svg",
        "bg": "#242424",
        "theme": "#242424",
        "padding": 0.08,
    },
    {
        "dir": "Life",
        "name": "Life in Weeks",
        "short_name": "Life Weeks",
        "description": "Visualize your life in weeks and experiences.",
        "svg": "Life/public/calendar.svg",
        "svg_href": "./calendar.svg",
        "bg": "#0f172a",
        "theme": "#0f172a",
        "padding": 0.16,
    },
    {
        "dir": "LearnForeignLanguage",
        "name": "Learn Foreign Language",
        "short_name": "Language",
        "description": "Interactive foreign language practice workspace.",
        "svg": "LearnForeignLanguage/public/language.svg",
        "svg_href": "./language.svg",
        "bg": "#0f172a",
        "theme": "#0f172a",
        "padding": 0.18,
    },
    {
        "dir": "LuckyNumberLookup",
        "name": "Lucky Number Lookup",
        "short_name": "Lucky Number",
        "description": "Modulo-81 fortune lookup for any number.",
        "svg": "LuckyNumberLookup/public/number.svg",
        "svg_href": "./number.svg",
        "bg": "#242424",
        "theme": "#242424",
        "padding": 0.08,
    },
    {
        "dir": "RRSPCalculator",
        "name": "RRSP vs Personal Calculator",
        "short_name": "RRSP Calc",
        "description": "Compare RRSP, Taxable Personal Accounts, and TFSA.",
        "svg": "RRSPCalculator/public/calculator.svg",
        "svg_href": "./calculator.svg",
        "bg": "#0f172a",
        "theme": "#0f172a",
        "padding": 0.08,
    },
    {
        "dir": "Guitar",
        "name": "Guitar Fretboard Lookup",
        "short_name": "Guitar",
        "description": "Interactive guitar fretboard, chords, and pentatonic scales.",
        "svg": "Guitar/public/guitar.svg",
        "svg_href": "./guitar.svg",
        "bg": "#0f172a",
        "theme": "#0f172a",
        "padding": 0.16,
    },
]

SW_TEMPLATE = """const CACHE_NAME = '{cache_name}';
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
];

self.addEventListener('install', (event) => {{
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => undefined)
  );
  self.skipWaiting();
}});

self.addEventListener('activate', (event) => {{
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
}});

self.addEventListener('fetch', (event) => {{
  const {{ request }} = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {{
        if (response && response.ok && response.type === 'basic') {{
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => undefined);
        }}
        return response;
      }})
      .catch(async () => {{
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') {{
          return caches.match('./index.html');
        }}
        return Response.error();
      }})
  );
}});
"""


def hex_to_rgba_int(hex_color: str) -> int:
    c = hex_color.lstrip("#")
    r, g, b = int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16)
    return (r << 24) | (g << 16) | (b << 8) | 0xFF


def render_svg_to_png(svg_path: Path, out_path: Path, size: int, bg_hex: str, padding_ratio: float) -> None:
    """Render an SVG centered on a solid background PNG at the requested square size."""
    canvas = GdkPixbuf.Pixbuf.new(GdkPixbuf.Colorspace.RGB, True, 8, size, size)
    canvas.fill(hex_to_rgba_int(bg_hex))

    inner = max(1, int(round(size * (1.0 - 2.0 * padding_ratio))))
    fg = GdkPixbuf.Pixbuf.new_from_file_at_scale(str(svg_path), inner, inner, True)

    offset_x = (size - fg.get_width()) // 2
    offset_y = (size - fg.get_height()) // 2
    fg.composite(
        canvas,
        offset_x,
        offset_y,
        fg.get_width(),
        fg.get_height(),
        offset_x,
        offset_y,
        1.0,
        1.0,
        GdkPixbuf.InterpType.BILINEAR,
        255,
    )
    out_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.savev(str(out_path), "png", [], [])


def ensure_language_svg() -> None:
    src = ROOT / "packages/shared/assets/icons/language.svg"
    dst = ROOT / "LearnForeignLanguage/public/language.svg"
    content = src.read_text(encoding="utf-8").replace("currentColor", "#38bdf8")
    dst.write_text(content, encoding="utf-8")


def write_icons(svg_path: Path, out_dir: Path, bg_hex: str, padding: float) -> None:
    for filename, size in [("icon-192.png", 192), ("icon-512.png", 512), ("apple-touch-icon.png", 180)]:
        render_svg_to_png(svg_path, out_dir / filename, size, bg_hex, padding)


def main() -> None:
    ensure_language_svg()

    # Root Master App icons
    write_icons(ROOT / "icon.svg", ROOT, "#0f172a", 0.04)

    # Sub-app icons, manifests, and service workers
    for app in APPS:
        pub_dir = ROOT / app["dir"] / "public"
        svg_path = ROOT / app["svg"]
        write_icons(svg_path, pub_dir, app["bg"], app["padding"])

        manifest = {
            "name": app["name"],
            "short_name": app["short_name"],
            "description": app["description"],
            "start_url": "./",
            "scope": "./",
            "display": "standalone",
            "background_color": app["bg"],
            "theme_color": app["theme"],
            "icons": [
                {"src": "./icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
                {"src": "./icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"},
                {"src": app["svg_href"], "sizes": "any", "type": "image/svg+xml"},
            ],
        }
        (pub_dir / "manifest.webmanifest").write_text(
            json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
        )

        cache_name = f"pwa-{app['dir'].lower()}-v1"
        (pub_dir / "sw.js").write_text(
            SW_TEMPLATE.format(cache_name=cache_name), encoding="utf-8"
        )

    print("Generated PWA icons, manifests, and service workers for root + 7 apps.")


if __name__ == "__main__":
    main()
