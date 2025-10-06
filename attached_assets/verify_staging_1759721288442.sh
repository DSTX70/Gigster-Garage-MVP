#!/usr/bin/env bash
set -Eeuo pipefail

# Load env if present
if [[ -f ".env" ]]; then
  # shellcheck disable=SC1091
  source ".env"
fi

# ---- required ----
: "${STAGING_DOMAIN:?STAGING_DOMAIN is required}"
: "${AUTH_TOKEN:?AUTH_TOKEN is required}"

# ---- optional with defaults ----
BULK_DELETE_ENDPOINT="${BULK_DELETE_ENDPOINT:-/api/client-documents/bulk-delete}"
INVOICE_CREATE_ENDPOINT="${INVOICE_CREATE_ENDPOINT:-/api/invoices}"
HEALTHZ_ENDPOINT="${HEALTHZ_ENDPOINT:-/healthz}"
READYZ_ENDPOINT="${READYZ_ENDPOINT:-/readyz}"

FILE_UPLOAD_ENDPOINT="${FILE_UPLOAD_ENDPOINT:-}"
FILE_LIST_ENDPOINT="${FILE_LIST_ENDPOINT:-}"
FILE_BULK_DELETE_ENDPOINT="${FILE_BULK_DELETE_ENDPOINT:-}"
FILE_RESTORE_ENDPOINT="${FILE_RESTORE_ENDPOINT:-}"
FILE_UPLOAD_JSON="${FILE_UPLOAD_JSON:-}"
FILE_RESTORE_JSON_TEMPLATE="${FILE_RESTORE_JSON_TEMPLATE:-}"

EVIDENCE_DIR="/tmp/gg_verify/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$EVIDENCE_DIR"

log() { echo "[$(date -Iseconds)] $*"; }
save() { local name="$1"; tee "$EVIDENCE_DIR/$name"; }

# 1) Verify Security Headers & TLS
log "1) Fetching response headers for https://$STAGING_DOMAIN/"
{
  echo "=== FULL HEADERS ==="
  curl -sS -D- -o /dev/null "https://$STAGING_DOMAIN/"
  echo ""
  echo "=== FILTERED ==="
  curl -sI "https://$STAGING_DOMAIN/" | egrep -i "strict-transport|content-security|x-content-type|frame|referrer|set-cookie" || true
} | save "01_headers.txt" >/dev/null

log ">> ACTION: Visit https://securityheaders.com/?q=$STAGING_DOMAIN and capture a screenshot grade."
echo "Open https://securityheaders.com/?q=$STAGING_DOMAIN" > "$EVIDENCE_DIR/01_securityheaders_instructions.txt"

# 2) Rate-Limit / Bulk-Ops Smoke Test
log "2) Running rate-limit smoke test against $BULK_DELETE_ENDPOINT"
counts=$(for i in {1..40}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -X POST "https://$STAGING_DOMAIN$BULK_DELETE_ENDPOINT" \
    --data '{"ids":["id1","id2"]}'
done | sort | uniq -c | tee "$EVIDENCE_DIR/02_rate_limit_counts.txt")
log "Rate-limit summary:"
echo "$counts"

# 3) Idempotent Time→Invoice Import
log "3) Running first invoice import (expect 201)"
resp1=$(curl -s -D- -w "\nHTTP:%{http_code}\n" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -X POST "https://$STAGING_DOMAIN$INVOICE_CREATE_ENDPOINT" \
  --data '{"clientId":"cid_123","timelogIds":["tl_1","tl_2"],"currency":"USD"}')
echo "$resp1" | save "03_invoice_create_first.txt" >/dev/null

log "3) Running second invoice import (expect fail or no-op)"
resp2=$(curl -s -D- -w "\nHTTP:%{http_code}\n" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -X POST "https://$STAGING_DOMAIN$INVOICE_CREATE_ENDPOINT" \
  --data '{"clientId":"cid_123","timelogIds":["tl_1","tl_2"],"currency":"USD"}')
echo "$resp2" | save "03_invoice_create_second.txt" >/dev/null

if command -v psql >/dev/null 2>&1; then
  log "3) Running DB idempotency query via psql"
  SQL_FILE="$(dirname "$0")/sql/idempotency_check.sql"
  if [[ -n "${DATABASE_URL:-}" ]]; then
    PSQL_CMD=(psql "$DATABASE_URL" -v "ON_ERROR_STOP=1" -f "$SQL_FILE")
  else
    PSQL_CMD=(psql -v "ON_ERROR_STOP=1" -f "$SQL_FILE")
  fi
  "${PSQL_CMD[@]}" | tee "$EVIDENCE_DIR/03_db_idempotency_check.txt" >/dev/null || true
else
  log "psql not found; skipping DB check. Save DB output manually to $EVIDENCE_DIR/03_db_idempotency_check.txt"
fi

# 4) Filing Cabinet Soft-Delete + Restore (optional if endpoints provided)
if [[ -n "$FILE_UPLOAD_ENDPOINT" && -n "$FILE_LIST_ENDPOINT" && -n "$FILE_BULK_DELETE_ENDPOINT" && -n "$FILE_RESTORE_ENDPOINT" && -n "$FILE_UPLOAD_JSON" ]]; then
  log "4) Testing Filing Cabinet soft-delete + restore flow"

  # Create a temp file payload
  tmpfile="$(mktemp /tmp/gg_phase1_upload.XXXXXX.txt)"
  echo "Gigster Garage Hardening Test $(date -Iseconds)" > "$tmpfile"

  log "4.1) Uploading file"
  upload_resp=$(curl -s -D- -w "\nHTTP:%{http_code}\n" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -F "file=@${tmpfile}" \
    -F "meta=${FILE_UPLOAD_JSON}" \
    "https://$STAGING_DOMAIN$FILE_UPLOAD_ENDPOINT")
  echo "$upload_resp" | save "04_file_upload.txt" >/dev/null

  # Try to extract an ID (assumes JSON id field)
  file_id=$(echo "$upload_resp" | sed -n 's/.*"id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1 || true)
  if [[ -z "$file_id" ]]; then
    log "Could not extract file id from upload response; please adjust parsing."
  else
    log "Captured file id: $file_id"

    log "4.2) Bulk-soft-delete the file"
    del_payload=$(printf '{"ids":["%s"]}' "$file_id")
    curl -s -D- -w "\nHTTP:%{http_code}\n" \
      -H "Authorization: Bearer $AUTH_TOKEN" \
      -H "Content-Type: application/json" \
      -X POST "https://$STAGING_DOMAIN$FILE_BULK_DELETE_ENDPOINT" \
      --data "$del_payload" | save "04_file_bulk_delete.txt" >/dev/null

    log "4.3) Confirm it disappears from default list"
    curl -s -D- "https://$STAGING_DOMAIN$FILE_LIST_ENDPOINT" \
      -H "Authorization: Bearer $AUTH_TOKEN" \
      | save "04_file_list_after_delete.txt" >/dev/null

    log "4.4) Restore within 7 days"
    if [[ -n "$FILE_RESTORE_JSON_TEMPLATE" ]]; then
      restore_payload="${FILE_RESTORE_JSON_TEMPLATE/__ID__/$file_id}"
    else
      restore_payload="$del_payload"
    fi
    curl -s -D- -w "\nHTTP:%{http_code}\n" \
      -H "Authorization: Bearer $AUTH_TOKEN" \
      -H "Content-Type: application/json" \
      -X POST "https://$STAGING_DOMAIN$FILE_RESTORE_ENDPOINT" \
      --data "$restore_payload" | save "04_file_restore.txt" >/dev/null

    log "4.5) Verify it reappears"
    curl -s -D- "https://$STAGING_DOMAIN$FILE_LIST_ENDPOINT" \
      -H "Authorization: Bearer $AUTH_TOKEN" \
      | save "04_file_list_after_restore.txt" >/dev/null
  fi

  log ">> ACTION: Capture a short GIF or screenshots of the list/restore UI states. Save them into $EVIDENCE_DIR"
else
  log "Skipping #4 (Filing Cabinet) — endpoints or FILE_UPLOAD_JSON not configured."
fi

# 5) /healthz + /readyz Probes
log "5) Checking probes"
{
  curl -s -o /dev/null -w "healthz:%{http_code}\n" "https://$STAGING_DOMAIN$HEALTHZ_ENDPOINT"
  curl -s -o /dev/null -w "readyz:%{http_code}\n"  "https://$STAGING_DOMAIN$READYZ_ENDPOINT"
} | save "05_probes.txt" >/dev/null

# 6) Bundle evidence
log "6) Bundling evidence"
bundle="/tmp/gg_verify/staging_verification_evidence.tgz"
tar -C "$(dirname "$EVIDENCE_DIR")" -czf "$bundle" "$(basename "$EVIDENCE_DIR")"
log "Evidence bundle at: $bundle"

echo ""
echo "================ DONE ================"
echo " Evidence dir: $EVIDENCE_DIR"
echo " Bundle:      $bundle"
echo "======================================"
