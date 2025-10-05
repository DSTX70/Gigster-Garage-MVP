#!/usr/bin/env bash
set -euo pipefail
STAGING_DOMAIN="${STAGING_DOMAIN:-your-staging.example.com}"
AUTH_TOKEN="${AUTH_TOKEN:-}"
PRICING_ROUTE="${PRICING_ROUTE:-/pricing}"
ZIP_NAME="${ZIP_NAME:-GG_Launch_Onboarding_kit_2025-10-05.zip}"
API_BASE="https://$STAGING_DOMAIN"
EVID_DIR="/tmp/gg_verify"; mkdir -p "$EVID_DIR"
{ git checkout -b staging 2>/dev/null || git checkout staging
  git add docs/ src/components/PricingTable.tsx src/lib/* config/flags/ public/feature_tiers_v1.json || true
  git commit -m "OneDrop: docs + pricing + flags + scripts" || echo "(no changes to commit)"
  git push -u origin staging
  git log -1 --oneline; } | tee "$EVID_DIR/git_push.log"
{ ls -1 docs | head -20
  ls -1 src/components | grep PricingTable.tsx || true
  ls -1 src/lib | egrep "feature(Tiers|Flags|types)\.ts" || true
  ls -1 config/flags | grep feature-flags || true
  [ -f public/feature_tiers_v1.json ] && echo "tiers JSON present ✅" || echo "tiers JSON MISSING ❌"; } | tee "$EVID_DIR/structure_checks.log"
{ curl -I "https://$STAGING_DOMAIN/" ; echo; curl -sI "https://$STAGING_DOMAIN/" | egrep -i "strict-transport|content-security|x-content-type|frame|referrer|set-cookie" || true; } | tee "$EVID_DIR/security_headers.log"
{ curl -s -o /dev/null -w "%{http_code}\n" "https://$STAGING_DOMAIN$PRICING_ROUTE"; } | tee "$EVID_DIR/pricing_status.log"
tar -czf "$EVID_DIR/staging_verification_evidence.tgz" -C "$EVID_DIR" .
echo "Bundle ready: $EVID_DIR/staging_verification_evidence.tgz"
