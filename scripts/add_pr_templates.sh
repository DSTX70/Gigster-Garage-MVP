#!/usr/bin/env bash
set -euo pipefail

BASE=".github/PULL_REQUEST_TEMPLATE"
mkdir -p "$BASE"

w() { # w <filename> <<'EOF' ... EOF
  local f="$1"; shift
  mkdir -p "$(dirname "$BASE/$f")"
  cat > "$BASE/$f"
  echo "✓ wrote $BASE/$f"
}

# 1) Forge
w forge.md <<'MD'
# GG-101 — Platform SDKs → Live Posting (Forge)
**Branch**: `feature/social-platform-adapters`

## Summary
- What this PR changes (X/IG/LinkedIn posting) and why

## Scope
- [ ] Implement real posts for **X**, **Instagram Graph**, **LinkedIn UGC/Share**
- [ ] Read creds from `.env`; validate presence on boot
- [ ] Map HTTP **429/5xx → retryable**, others → fatal
- [ ] Emit `social.queue.posted` (remoteId) / `social.queue.failed` (error)

## Files
- [ ] server/integrations/platforms/x.adapter.ts
- [ ] server/integrations/platforms/instagram.adapter.ts
- [ ] server/integrations/platforms/linkedin.adapter.ts
- [ ] server/integrations/platforms/common.ts

## Env
- [ ] X_BEARER_TOKEN · [ ] INSTAGRAM_ACCESS_TOKEN · [ ] LINKEDIN_ACCESS_TOKEN

## Tests / Proof
- [ ] `npx jest server/tests/social.*.spec.ts --runInBand`
- [ ] Enqueue "hello world" → each platform posts; audit lines present
MD

# 2) Bridge
w bridge.md <<'MD'
# GG-101 / GG-105 — Integrations + Loyalty CSV (Bridge)

## Scope
- [ ] Credential loader warnings for missing env
- [ ] Per-platform media handling (IG requires media URL)
- [ ] Loyalty CSV export endpoint + UI link

## Files
- [ ] server/routes/loyalty.route.ts
- [ ] client/src/pages/loyalty/index.tsx

## Tests / Proof
- [ ] `npx jest server/tests/ops.rateLimits.*.spec.ts --runInBand`
- [ ] Download CSV; headers/rows look right
MD

# 3) Pulse
w pulse.md <<'MD'
# GG-102 — Worker Autoscale + Durability (Pulse)

## Scope
- [ ] Add `worker/launcher.ts` (cluster) with `CONCURRENCY`
- [ ] Job claim uses `FOR UPDATE SKIP LOCKED`
- [ ] Graceful shutdown (finish current job)
- [ ] Soak @ `CONCURRENCY=4` → 0 duplicates

## Files
- [ ] worker/launcher.ts
- [ ] worker/socialPoster.ts

## Run
- [ ] `CONCURRENCY=4 npm run worker:social` (attach logs evidence)
MD

# 4) Sentinel
w sentinel.md <<'MD'
# GG-103 — Alerts & SLOs (Sentinel)

## Scope
- [ ] Queries: hourly error-rate, max queue-age, RL saturation
- [ ] Alert transport (email/Slack) + weekly digest job

## Files
- [ ] server/ops/alerts/socialQueue.metrics.ts
- [ ] server/ops/alerts/socialQueue.alerts.ts

## Tests / Proof
- [ ] `npx jest server/tests/ops.rateLimits.window.spec.ts --runInBand`
- [ ] Simulate thresholds → alert visible (paste log excerpt)
MD

# 5) Switchboard
w switchboard.md <<'MD'
# GG-104 — RFP Responder E2E (Switchboard)

## Scope
- [ ] On `rfp.requested` → `createProposalDraft(...)`
- [ ] Persist draft + attachments; emit `rfp.draft.created`
- [ ] `/rfp/ingest` lists inbound drafts

## Files
- [ ] server/integrations/rfp/adapter.ts
- [ ] server/integrations/rfp/draft.service.ts
- [ ] server/db/migrations/2025_11_06_proposals.sql
- [ ] client/src/pages/rfp/ingest.tsx

## Tests / Proof
- [ ] `curl -X POST /api/integrations/rfp/webhook -d '{ "type":"rfp.requested", ... }'`
- [ ] Draft visible on `/rfp/ingest`
MD

# 6) CodeBlock
w codeblock.md <<'MD'
# GG-104 / GG-105 — Storage + CSV (CodeBlock)

## Scope
- [ ] Proposals + attachments tables (migration)
- [ ] Repos/methods wired
- [ ] Loyalty ledger CSV export (server + UI)

## Files
- [ ] server/db/migrations/2025_11_06_proposals.sql
- [ ] server/routes/loyalty.route.ts
- [ ] client/src/pages/loyalty/index.tsx

## Tests / Proof
- [ ] `npx jest server/tests/sprint_A.sanity.spec.ts --runInBand`
- [ ] CSV downloads; draft persists
MD

# 7) Lume
w lume.md <<'MD'
# GG-105 / GG-107 — UX (Lume)

## Scope
- [ ] `/loyalty`: history + CSV button, empty-states, error copy
- [ ] `/auth/org-bind`: org selection flow
- [ ] Copy/contrast aligned to brand

## Files
- [ ] client/src/pages/loyalty/index.tsx
- [ ] client/src/pages/auth/org-bind.tsx

## Proof
- [ ] Visual pass; AA contrast ✅
MD

# 8) Nova
w nova.md <<'MD'
# GG-106 — Brand & Voice Pass (Nova)

## Scope
- [ ] Implement `scripts/brand_token_audit.ts` (report)
- [ ] Fix shared components (buttons/cards/accordions)
- [ ] Tone & voice across top 20 screens

## Artifacts
- [ ] 20 before/after screenshots attached
MD

# 9) Prism
w prism.md <<'MD'
# GG-106 / GG-108 / GG-109 — Copy + Pricing + GTM (Prism)

## Scope
- [ ] Copy pass (top 20 screens)
- [ ] Pricing page copy + upgrade prompts
- [ ] Competitive matrix + 10 briefs + affiliate 1-pager + 30-day plan

## Files
- [ ] client/src/pages/pricing.tsx
- [ ] docs/gtm/launch_pack.md (+ deck link)

## Proof
- [ ] Screenshots + deck link
MD

# 10) Storybloom
w storybloom.md <<'MD'
# GG-109 — Outreach Templates (Storybloom)

## Scope
- [ ] Creator + affiliate outreach templates
- [ ] PR notes for launch milestones

## Files
- [ ] docs/gtm/outreach_templates.md

## Proof
- [ ] Template snippets; tone alignment
MD

# 11) Verifier
w verifier.md <<'MD'
# GG-102 / GG-107 — QA & Spec (Verifier)

## Scope
- [ ] Expand `schema.*` tests (Yellows → Green)
- [ ] SSO ACS validator + org-binding edge tests

## Files
- [ ] server/tests/schema.*.spec.ts

## Run
- [ ] `npx jest "server/tests/schema.*.spec.ts" --runInBand`
MD

# 12) Ledger
w ledger.md <<'MD'
# GG-108 — Pricing & Fences (Ledger)

## Scope
- [ ] Implement `requirePlan()` on premium APIs
- [ ] UI fences/feature flags (Pro/Studio)

## Files
- [ ] server/middleware/entitlements.ts
- [ ] Gated components/pages

## Tests / Proof
- [ ] 200 for entitled; 403 for non-entitled; upgrade prompts visible
MD

# 13) Foundry
w foundry.md <<'MD'
# GG-108 / GG-109 — Strategy (Foundry)

## Scope
- [ ] Pricing fence matrix (value fences, upsells)
- [ ] GTM sign-offs with Amani (channels/affiliates)

## Files
- [ ] docs/pricing_fences.md
- [ ] docs/gtm/launch_pack.md (sign-off notes)
MD

# 14) Amani
w amani.md <<'MD'
# GG-109 — Partnerships (Amani)

## Scope
- [ ] Affiliate program terms + payout logic (draft)
- [ ] Shortlist outreach accounts with Prism

## Files
- [ ] docs/affiliates_program.md
- [ ] docs/gtm/launch_pack.md (shortlist)
MD

# 15) IP — Aegis/Atlas/Archivist/Coda
w ip_aegis_atlas_archivist_coda.md <<'MD'
# GG-110 — IP Snapshot (Aegis/Atlas/Archivist/Coda)

## Scope
- [ ] Claims outline (agent graduation, audit fabric, queue orchestration)
- [ ] Figure list; Trade-Secret register; filing order memo

## Files
- [ ] docs/ip/provisional_snapshot.md

## Proof
- [ ] Outline + file list + TS entries committed
MD

echo "All PR templates created under $BASE"
