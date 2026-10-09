#!/usr/bin/env bash
# Downloads the Higgsfield-generated media that index.html currently hotlinks,
# converts it for the web, and rewrites index.html to use the local copies.
# Run once from the repo root (needs curl, ffmpeg, and cwebp or ImageMagick).
set -euo pipefail
CDN="https://d8j0ntlcm91z4.cloudfront.net/user_3JJYQNJGGyTNO977GOpfU1mt7MM"
mkdir -p assets/media
declare -A FILES=(
  [hero-poster]="hf_20261009_130341_d610dc80-ce16-4bd4-9bf7-d86d70b285e3.png"
  [chain-attention]="hf_20261009_130342_8bd3ef61-7fd9-4027-92ce-e6f6262b652f.png"
  [chain-action]="hf_20261009_130521_4268702c-9819-4569-8314-b0268b6236ee.png"
  [chain-lead]="hf_20261009_130523_f1f5cc6a-8810-44a4-a172-2d48cd06cc46.png"
  [chain-response]="hf_20261009_130342_144d985e-a6b2-486f-95c5-bf532fbe8a4b.png"
  [chain-revenue]="hf_20261009_130341_eeab15fe-c7ea-49e8-b720-b5aca4157c93.png"
)
for name in "${!FILES[@]}"; do
  src="${FILES[$name]}"
  curl -fsSL "$CDN/$src" -o "/tmp/$name.png"
  if command -v cwebp >/dev/null; then cwebp -quiet -q 80 "/tmp/$name.png" -o "assets/media/$name.webp"
  else convert "/tmp/$name.png" -quality 80 "assets/media/$name.webp"; fi
  sed -i.bak "s|$CDN/$src|assets/media/$name.webp|g" index.html
done
curl -fsSL "$CDN/hf_20261009_130541_902f4f48-822b-4bfd-8721-a10de06f9cf8.mp4" -o /tmp/hero.mp4
ffmpeg -y -loglevel error -i /tmp/hero.mp4 -an -vf "scale=1600:-2" -c:v libx264 -crf 26 -preset slow -movflags +faststart assets/media/hero.mp4
sed -i.bak "s|$CDN/hf_20261009_130541_902f4f48-822b-4bfd-8721-a10de06f9cf8.mp4|assets/media/hero.mp4|g" index.html
rm -f index.html.bak
echo "Done. Commit assets/media and index.html."
