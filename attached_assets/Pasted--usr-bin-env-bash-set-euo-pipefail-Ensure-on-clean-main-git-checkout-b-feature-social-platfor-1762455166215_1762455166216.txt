#!/usr/bin/env bash
set -euo pipefail

# Ensure on clean main
git checkout -b feature/social-platform-adapters
mkdir -p server/integrations/platforms docs/integrations
cat > server/integrations/platforms/x.adapter.ts <<'TS'
export async function postToX({ profileId, text, mediaUrls = [] }: { profileId: string; text: string; mediaUrls?: string[] }) {
  // TODO: replace with real X API call (use env X_BEARER_TOKEN)
  return { ok: true, remoteId: `x_${Date.now()}` };
}
TS
cat > server/integrations/platforms/instagram.adapter.ts <<'TS'
export async function postToInstagram({ profileId, text, mediaUrls = [] }: { profileId: string; text: string; mediaUrls?: string[] }) {
  // TODO: real IG Graph API call
  return { ok: true, remoteId: `ig_${Date.now()}` };
}
TS
cat > server/integrations/platforms/linkedin.adapter.ts <<'TS'
export async function postToLinkedIn({ profileId, text, mediaUrls = [] }: { profileId: string; text: string; mediaUrls?: string[] }) {
  // TODO: real LinkedIn API call
  return { ok: true, remoteId: `li_${Date.now()}` };
}
TS
cat > docs/integrations/social_adapters.md <<'MD'
# Social Platform Adapters
- Env: X_BEARER_TOKEN, INSTAGRAM_APP_ID/SECRET, LINKEDIN_CLIENT_ID/SECRET
- Retries: exponential backoff (worker)
- Audit: social.queue.posted / failed
MD
git add .
git commit -m "scaffold: platform adapters (X/IG/LinkedIn) stubs and docs"
git checkout -b feat/social-worker-scale
mkdir -p worker
cat > worker/launcher.ts <<'TS'
import cluster from "cluster";
import os from "os";
const W = Number(process.env.CONCURRENCY || os.cpus().length);
if (cluster.isPrimary) {
  for (let i=0;i<W;i++) cluster.fork();
  cluster.on("exit", ()=> cluster.fork());
} else {
  require("./socialPoster"); // existing worker
}
TS
git add worker/launcher.ts
git commit -m "scaffold: worker launcher with CONCURRENCY support"

git checkout -b ops/alerts-social-queue
mkdir -p server/ops/alerts
cat > server/ops/alerts/socialQueueSLO.ts <<'TS'
export const SLO = {
  errorBudgetPctPerHour: 5,
  maxQueueAgeMinutes: 30,
};
TS
git add server/ops/alerts/socialQueueSLO.ts
git commit -m "scaffold: social queue SLO config"

git checkout -b feature/rfp-drafts-e2e
mkdir -p server/integrations/rfp client/src/pages/rfp docs/rfp
cat > server/integrations/rfp/draft.service.ts <<'TS'
export async function createProposalDraft(input:{ rfpId:string; client:string; dueDate:string; scope:string; attachments?:string[] }) {
  // TODO: persist draft & link attachments; emit audit
  return { ok: true, proposalId: `prop_${Date.now()}` };
}
TS
cat > client/src/pages/rfp/ingest.tsx <<'TSX'
export default function RfpIngest() {
  return <div className="p-6"><h1 className="text-2xl font-semibold">RFP Ingest</h1><p>Incoming RFPs appear here.</p></div>;
}
TSX
git add .
git commit -m "scaffold: RFP draft service and ingest page"

git checkout -b feature/loyalty-ui-rules
mkdir -p server/routes client/src/pages/loyalty
cat > server/routes/loyalty.route.ts <<'TS'
import { Router } from "express";
const r = Router();
r.get("/", async (_req,res)=> res.json({ items: [] })); // TODO: history
export default r;
TS
cat > client/src/pages/loyalty/index.tsx <<'TSX'
export default function LoyaltyAdmin(){ return <div className="p-6"><h1 className="text-2xl font-semibold">Loyalty</h1></div> }
TSX
git add .
git commit -m "scaffold: loyalty admin route & page"

git checkout -b chore/brand-voice-pass
mkdir -p scripts
cat > scripts/brand_token_audit.ts <<'TS'
// TODO: read Tailwind tokens and check contrast AA+
console.log("brand token audit placeholder");
TS
git add scripts/brand_token_audit.ts
git commit -m "scaffold: brand token audit placeholder"

git checkout -b feat/sso-org-binding
mkdir -p client/src/pages/auth server/routes
cat > client/src/pages/auth/org-bind.tsx <<'TSX'
export default function OrgBind(){ return <div className="p-6"><h1 className="text-2xl font-semibold">Select or Create an Organization</h1></div> }
TSX
git add client/src/pages/auth/org-bind.tsx
git commit -m "scaffold: org-binding page"

git checkout -b feature/pricing-and-fences
mkdir -p client/src/pages server/middleware
cat > client/src/pages/pricing.tsx <<'TSX'
export default function Pricing(){ return <div className="p-6"><h1 className="text-2xl font-semibold">Pricing</h1></div> }
TSX
cat > server/middleware/entitlements.ts <<'TS'
export function requirePlan(plan:"free"|"pro"|"studio"){ return (req:any,res:any,next:any)=>{ next(); } }
TS
git add .
git commit -m "scaffold: pricing page + entitlements middleware placeholder"

git checkout -b gtm/launch-pack
mkdir -p docs/gtm
cat > docs/gtm/launch_pack.md <<'MD'
# GTM Starter Pack
- Competitive matrix
- 10 influencer briefs
- Affiliate one-pager
- 30-day content plan
MD
git add docs/gtm/launch_pack.md
git commit -m "scaffold: GTM launch pack doc"

git checkout -b ip/provisional-snapshot
mkdir -p docs/ip
cat > docs/ip/provisional_snapshot.md <<'MD'
# IP Snapshot (Provisional + TS)
- Claims outline (agent graduation, audit fabric, queue orchestration)
- Figure list
- Trade secret register entries
- Filing order memo
MD
git add docs/ip/provisional_snapshot.md
git commit -m "scaffold: IP snapshot doc"
