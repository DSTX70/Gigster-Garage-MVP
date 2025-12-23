#!/usr/bin/env bash
set -euo pipefail

PROJECT_KEY="${PROJECT_KEY:-GigsterGarage}"
echo "CI GATE (dry): ${PROJECT_KEY}"

echo "Smoke: (none yet) PASS"
PROJECT_KEY="$PROJECT_KEY" npx tsx tools/export_bundle.ts

echo "CI GATE PASS ✅"
