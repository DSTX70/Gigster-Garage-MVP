#!/usr/bin/env bash
set -euo pipefail

PROJECT_KEY="${PROJECT_KEY:-GigsterGarage}"
echo "SHIP PUBLISH: ${PROJECT_KEY}"

bash tools/ci_gate.sh
PROJECT_KEY="$PROJECT_KEY" npx tsx tools/publish_drive_steward.ts

echo "SHIP PUBLISH DONE ✅"
