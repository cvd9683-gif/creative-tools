#!/usr/bin/env bash
# Copies the design system into the extension package (Chrome only loads files inside extension/).
# Run from ai-companion/: bash scripts/sync-design.sh
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p extension/shared/fonts
cp design/tokens.css design/components/derby.css extension/shared/
cp design/fonts/*.woff2 extension/shared/fonts/
{ echo "/* Generated from design/components/derby.js by scripts/sync-design.sh. Do not edit here: edit the design file and re-run the script. */"
  cat design/components/derby.js
  printf '\nexport const Derby = window.Derby;\nexport default Derby;\n'; } > extension/shared/derby.mjs
echo "Design synced into extension/shared/"
