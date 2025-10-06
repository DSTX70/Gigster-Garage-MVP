#!/usr/bin/env bash
set -Eeuo pipefail

# Load env if present
if [[ -f ".env" ]]; then
  # shellcheck disable=SC1091
  source ".env"
fi

# ---- required ----
: "${STAGING_DOMAIN:?STAGING_DOMAIN is required}"
: "${SESSION_COOKIE:?SESSION_COOKIE is required (format: connect.sid=<value>)}"

# ---- optional with defaults ----
BULK_DELETE_ENDPOINT="${BULK_DELETE_ENDPOINT:-/api/client-documents/bulk-delete}"
INVOICE_CREATE_ENDPOINT="${INVOICE_CREATE_ENDPOINT:-/api/invoices}"
HEALTHZ_ENDPOINT="${HEALTHZ_ENDPOINT:-/healthz}"
READYZ_ENDPOINT="${READYZ_ENDPOINT:-/readyz}"

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
    -H "Cookie: $SESSION_COOKIE" \
    -H "Content-Type: application/json" \
    -X POST "https://$STAGING_DOMAIN$BULK_DELETE_ENDPOINT" \
    --data '{"ids":["id1","id2"]}'
done | sort | uniq -c | tee "$EVIDENCE_DIR/02_rate_limit_counts.txt")
log "Rate-limit summary:"
echo "$counts"

# 3) Idempotent Time→Invoice Import
log "3) Running first invoice import (expect 201)"
resp1=$(curl -s -D- -w "\nHTTP:%{http_code}\n" \
  -H "Cookie: $SESSION_COOKIE" \
  -H "Content-Type: application/json" \
  -X POST "https://$STAGING_DOMAIN$INVOICE_CREATE_ENDPOINT" \
  --data '{"clientId":"cid_123","timelogIds":["tl_1","tl_2"],"currency":"USD"}')
echo "$resp1" | save "03_invoice_create_first.txt" >/dev/null

log "3) Running second invoice import (expect fail or no-op)"
resp2=$(curl -s -D- -w "\nHTTP:%{http_code}\n" \
  -H "Cookie: $SESSION_COOKIE" \
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
  log "psql not found; skipping DB check."
fi

# 4) /healthz + /readyz Probes
log "4) Checking probes"
{
  curl -s -o /dev/null -w "healthz:%{http_code}\n" "https://$STAGING_DOMAIN$HEALTHZ_ENDPOINT"
  curl -s -o /dev/null -w "readyz:%{http_code}\n"  "https://$STAGING_DOMAIN$READYZ_ENDPOINT"
} | save "04_probes.txt" >/dev/null

# 5) Bundle evidence
log "5) Bundling evidence"
bundle="/tmp/gg_verify/staging_verification_evidence.tgz"
tar -C "$(dirname "$EVIDENCE_DIR")" -czf "$bundle" "$(basename "$EVIDENCE_DIR")"
log "Evidence bundle at: $bundle"

echo ""
echo "================ DONE ================"
echo " Evidence dir: $EVIDENCE_DIR"
echo " Bundle:      $bundle"
echo "======================================"
