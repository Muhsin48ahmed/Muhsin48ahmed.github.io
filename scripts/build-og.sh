#!/usr/bin/env bash
# Rasterises scripts/og-card.svg into public/og.jpg (1200×630).
# Quick Look pads SVG thumbnails to a square, so render at 2× and crop to the card's aspect ratio.
set -euo pipefail
cd "$(dirname "$0")/.."
tmp="$(mktemp -d)"
qlmanage -t -s 2400 -o "$tmp" scripts/og-card.svg >/dev/null 2>&1
# The card sits centred in a 2400×2400 square: crop to 2400×1260 then downscale.
sips -c 1260 2400 "$tmp/og-card.svg.png" --out "$tmp/cropped.png" >/dev/null
sips -z 630 1200 -s format jpeg -s formatOptions 82 "$tmp/cropped.png" --out public/og.jpg >/dev/null
rm -rf "$tmp"
sips -g pixelWidth -g pixelHeight public/og.jpg | tail -2
