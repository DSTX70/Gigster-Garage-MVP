#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Please export DATABASE_URL before running."
  exit 1
fi

echo "Applying schema + seed…"
psql "$DATABASE_URL" -f dth_seed_vNext_2025Q4.sql

echo "Reminder: Add routes"
echo "  App:   GET /intake/new-pod  → serve i3_NewPod_IntakeForm_vNext_2025Q4.html"
echo "         POST /api/intake/pod → validate & forward to Engine /v1/pods"
echo "  Engine: POST /v1/pods, /v1/agents, /v1/import/new-pods"

echo "Try import via manifest:"
echo "curl -X POST $ENGINE_BASE/v1/import/new-pods -H 'Content-Type: application/json' --data-binary @handoff_manifest.json"

echo "Done."
