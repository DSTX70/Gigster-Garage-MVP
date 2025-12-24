#!/usr/bin/env bash
set -euo pipefail

# Post-verify: Confirm SHA256 appears in Drive Steward history
# Required env: DRIVE_STEWARD_URL, PROJECT_KEY, EXPECTED_SHA256

: "${DRIVE_STEWARD_URL:?Missing DRIVE_STEWARD_URL}"
: "${PROJECT_KEY:?Missing PROJECT_KEY}"
: "${EXPECTED_SHA256:?Missing EXPECTED_SHA256}"

BASE="${DRIVE_STEWARD_URL%/}"
POST_VERIFY_LIMIT="${POST_VERIFY_LIMIT:-10}"

HIST_URL="${BASE}/api/exports/history?projectKey=${PROJECT_KEY}&limit=${POST_VERIFY_LIMIT}"

HIST_JSON="$(curl -sS "${HIST_URL}" || true)"

# Basic sanity: must be JSON and must include the sha
if echo "${HIST_JSON}" | grep -qi "<html"; then
  echo "FAIL ❌ History endpoint returned HTML. Check DRIVE_STEWARD_URL."
  exit 1
fi

if ! echo "${HIST_JSON}" | grep -q '"ok"[[:space:]]*:[[:space:]]*true'; then
  echo "FAIL ❌ History endpoint did not return ok:true"
  echo "${HIST_JSON}"
  exit 1
fi

if ! echo "${HIST_JSON}" | grep -q "${EXPECTED_SHA256}"; then
  echo "FAIL ❌ Publish completed but SHA not found in Drive Steward history yet."
  echo "Expected SHA: ${EXPECTED_SHA256}"
  echo "${HIST_JSON}"
  exit 1
fi

echo "Post-verify ✅ SHA found in Drive Steward history."
