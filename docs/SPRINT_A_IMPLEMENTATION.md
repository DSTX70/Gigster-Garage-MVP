# Sprint A Implementation Guide (GG-101 to GG-110)

Complete implementation roadmap for Sprint A features with GitHub automation, CI/CD, and project management.

## 📦 What's Included

### Scaffolded Feature Files (13 files)
All ready-to-implement stub files created in:
- `server/integrations/platforms/` (X, Instagram, LinkedIn adapters)
- `worker/launcher.ts` (multi-process worker)
- `server/ops/alerts/` (SLO config, digest job)
- `server/integrations/rfp/` (draft service)
- `client/src/pages/rfp/`, `client/src/pages/loyalty/`, `client/src/pages/auth/`
- `server/routes/loyalty.route.ts`
- `server/middleware/entitlements.ts`
- `client/src/pages/pricing.tsx`
- `docs/gtm/`, `docs/ip/` (documentation shells)

### GitHub Automation (10 files)
- **Issue Templates**: `ops/github/issues.json` and `issues.csv`
- **Bulk Import Script**: `ops/github/import_issues.sh`
- **Project Template**: `ops/github/project_template.json`
- **Project Creator**: `ops/github/create_project_from_template.sh`
- **Auto-Add Script**: `ops/github/project_auto_add.sh`
- **CI Workflow**: `.github/workflows/ci.yml`
- **Auto-Project Workflow**: `.github/workflows/auto-project-add.yml`
- **Documentation**: `ops/github/README.md`

### Documentation
- `docs/SCAFFOLDED_FEATURES.md` - Feature implementation roadmap
- `docs/worker_scaling_notes.md` - Worker concurrency guide
- `ops/github/README.md` - GitHub automation guide

---

## 🎯 Sprint A Epics

### GG-101: Platform SDKs → Live Posting (8 pts)
**Status**: Scaffolded  
**Files**: `server/integrations/platforms/*.adapter.ts`  
**Branch**: `feature/social-platform-adapters`

**DoD**:
- [ ] Posts succeed on X (Twitter), Instagram, LinkedIn
- [ ] Environment secrets configured (X_BEARER_TOKEN, etc.)
- [ ] Retryable error mapping implemented
- [ ] Audit events emitted on success/failure
- [ ] README updated with OAuth setup instructions

**Implementation Steps**:
1. Install platform SDKs: `@twitter/api`, `instagram-graph-api`, `linkedin-api-client`
2. Replace stub implementations with real SDK calls
3. Add OAuth token management
4. Implement platform-specific media upload
5. Add retry logic for transient errors
6. Test with real accounts

---

### GG-102: Worker Autoscale + Durability (5 pts)
**Status**: Scaffolded  
**Files**: `worker/launcher.ts`, `docs/worker_scaling_notes.md`  
**Branch**: `feat/social-worker-scale`

**DoD**:
- [ ] Stateless worker using `cluster` module
- [ ] CONCURRENCY environment variable support
- [ ] Database queries use `FOR UPDATE SKIP LOCKED`
- [ ] Graceful shutdown (finish current job)
- [ ] Zero duplicates in soak test (4 workers, 1 hour)

**Implementation Steps**:
1. Update worker entry point to use `launcher.ts`
2. Modify queue queries to use `SKIP LOCKED`
3. Add graceful shutdown signal handlers
4. Implement distributed locking (Redis or PostgreSQL advisory locks)
5. Soak test: `CONCURRENCY=4 npm run worker:social` (1 hour)

---

### GG-103: Alerting & SLOs (Social Queue) (3 pts)
**Status**: Scaffolded  
**Files**: `server/ops/alerts/socialQueueSLO.ts`, `server/ops/alerts/digest.job.ts`  
**Branch**: `ops/alerts-social-queue`

**DoD**:
- [ ] Error budget alert (>5%/hour)
- [ ] Queue age alert (>30 minutes)
- [ ] Rate limit saturation warning (>80%)
- [ ] Weekly ops digest email

**Implementation Steps**:
1. Create SLO monitoring queries
2. Integrate with Prometheus/Grafana (optional)
3. Add Slack/email notification transport
4. Schedule weekly digest job
5. Create `/ops/slo` dashboard page

---

### GG-104: RFP Responder → Draft Generator (5 pts)
**Status**: Scaffolded  
**Files**: `server/integrations/rfp/draft.service.ts`, `client/src/pages/rfp/ingest.tsx`  
**Branch**: `feature/rfp-drafts-e2e`

**DoD**:
- [ ] `rfp.requested` event → Proposal draft created
- [ ] Draft includes sections + attachments
- [ ] Assignee notified via email
- [ ] Ingest page shows new drafts

**Implementation Steps**:
1. Design `rfp_drafts` table schema
2. Implement CRUD operations in `draft.service.ts`
3. Add attachment upload/storage
4. Build ingest UI with drag-drop
5. Wire email notification
6. Add `/rfp` route to `App.tsx`

---

### GG-105: Loyalty Ledger → Points UI + Rules (5 pts)
**Status**: Scaffolded  
**Files**: `server/routes/loyalty.route.ts`, `client/src/pages/loyalty/index.tsx`  
**Branch**: `feature/loyalty-ui-rules`

**DoD**:
- [ ] `/loyalty` admin page shows transaction history
- [ ] Payment webhook awards points
- [ ] Adjust/redeem endpoints functional
- [ ] CSV export available

**Implementation Steps**:
1. Design loyalty schema (user_points, reward_rules, transactions)
2. Implement points earning rules
3. Create rewards catalog UI
4. Add redemption workflow
5. Wire route in `server/routes.ts`
6. Integrate with Stripe payment webhook

---

### GG-106: Brand & Voice Polish (3 pts)
**Status**: Scaffolded  
**Files**: `scripts/brand_token_audit.ts`  
**Branch**: `chore/brand-voice-pass`

**DoD**:
- [ ] Zero token/contrast/copy variances
- [ ] Shared components updated
- [ ] Before/after screenshots attached

**Implementation Steps**:
1. Implement Tailwind token extraction in audit script
2. Add WCAG AA+ contrast checker
3. Scan all components for color usage
4. Generate accessibility report
5. Fix top 20 screens
6. Run: `npm run audit:brand`

---

### GG-107: SSO Hardening + Org-Binding UX (3 pts)
**Status**: Scaffolded  
**Files**: `client/src/pages/auth/org-bind.tsx`  
**Branch**: `feat/sso-org-binding`

**DoD**:
- [ ] Stronger ACS validator
- [ ] `requiresOrgBinding` flow implemented
- [ ] Edge-case tests green

**Implementation Steps**:
1. Add organization schema (orgs, org_users, org_roles)
2. Implement org creation/selection flow
3. Harden SAML ACS validation
4. Add `/auth/org-bind` route
5. Implement org switching UI

---

### GG-108: Pricing Page + Paywall Fences (5 pts)
**Status**: Scaffolded  
**Files**: `client/src/pages/pricing.tsx`, `server/middleware/entitlements.ts`  
**Branch**: `feature/pricing-and-fences`

**DoD**:
- [ ] Free/Pro/Studio tiers enforced (server + client)
- [ ] Pricing page live at `/pricing`
- [ ] Upgrade prompts wired

**Implementation Steps**:
1. Design pricing tier comparison UI
2. Implement `requirePlan()` middleware logic
3. Add feature gating across endpoints
4. Create upgrade/downgrade flows
5. Integrate with Stripe checkout

---

### GG-109: Competitive Matrix + GTM Starter Pack (5 pts)
**Status**: Scaffolded  
**Files**: `docs/gtm/launch_pack.md`  
**Branch**: `gtm/launch-pack`

**DoD**:
- [ ] Competitive matrix with sources (vs Toggl, Harvest, Clockify)
- [ ] 10 influencer outreach briefs
- [ ] Affiliate one-pager
- [ ] 30-day content calendar
- [ ] Marketing deck exported

**Implementation Steps**:
1. Research competitors (pricing, features, reviews)
2. Create comparison matrix
3. Write influencer briefs (targeting, talking points)
4. Design affiliate program one-pager
5. Build 30-day content calendar

---

### GG-110: IP Snapshot (Provisional + Trade Secrets) (5 pts)
**Status**: Scaffolded  
**Files**: `docs/ip/provisional_snapshot.md`  
**Branch**: `ip/provisional-snapshot`

**DoD**:
- [ ] Claims outline (agent graduation, audit fabric, queue orchestration)
- [ ] Figure list (10 technical diagrams)
- [ ] Trade secret register populated
- [ ] Filing-order memo drafted

**Implementation Steps**:
1. Expand claims outline with technical details
2. Create technical diagrams (architecture, flows)
3. Document trade secrets (rate limiting, burst override)
4. Write provisional patent application draft
5. File with USPTO (optional)

---

## 🚀 Quick Start

### 1. Create GitHub Issues

```bash
# Using GitHub CLI
chmod +x ops/github/import_issues.sh
./ops/github/import_issues.sh ops/github/issues.json
```

### 2. Create Project Board

```bash
# Edit org name first
vim ops/github/project_template.json

# Create project
chmod +x ops/github/create_project_from_template.sh
./ops/github/create_project_from_template.sh
```

### 3. Enable Auto-Add Workflow

Edit `.github/workflows/auto-project-add.yml`:
- Set `ORG` and `PROJECT_NUMBER`
- Push to main

### 4. Start Implementation

Pick a feature (recommend GG-101 first):
```bash
# Review implementation steps
vim docs/SCAFFOLDED_FEATURES.md

# Start coding
vim server/integrations/platforms/x.adapter.ts

# Run tests
npm test server/tests/sprint_A.sanity.spec.ts
```

---

## 📊 Sprint Metrics

| Metric | Value |
|--------|-------|
| **Total Issues** | 10 |
| **Total Story Points** | 47 |
| **High Priority** | GG-101 (8 pts) |
| **Medium Priority** | GG-102, GG-103, GG-108 (13 pts) |
| **Low Priority** | GG-104 to GG-110 (26 pts) |

**Velocity Target**: 15-20 points per week (2-3 week sprint)

---

## ✅ Testing Strategy

### Unit Tests
- Platform adapters: Mock API responses
- Worker launcher: Cluster spawn/exit
- Loyalty rules: Points calculation
- Entitlements: Plan enforcement

### Integration Tests
- Social queue end-to-end posting
- RFP draft → notification flow
- Payment → loyalty points
- SSO → org binding

### E2E Tests
- User journey: Signup → Create post → View in queue
- Admin journey: View analytics → Export CSV → Apply burst override

---

## 📚 Additional Resources

- **Scaffolded Features**: `docs/SCAFFOLDED_FEATURES.md`
- **GitHub Automation**: `ops/github/README.md`
- **Worker Scaling**: `docs/worker_scaling_notes.md`
- **User Manual**: `docs/USER_MANUAL.md`
- **Features Guide**: `FEATURES_GUIDE.md`

---

**Last Updated**: November 6, 2025  
**Sprint**: A (GG-101 to GG-110)  
**Status**: Ready for implementation 🚀
