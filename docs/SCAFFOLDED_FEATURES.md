# Scaffolded Features - Implementation Roadmap

This document tracks scaffolded features ready for implementation.

## ✅ Scaffolded (Ready for Development)

### 1. Social Platform Adapters
**Status**: Stub implementations created  
**Files**:
- `server/integrations/platforms/x.adapter.ts`
- `server/integrations/platforms/instagram.adapter.ts`
- `server/integrations/platforms/linkedin.adapter.ts`
- `docs/integrations/social_adapters.md`

**Next Steps**:
1. Replace stub implementations with real SDK calls
2. Add OAuth token management
3. Implement platform-specific media upload
4. Add environment variables: `X_BEARER_TOKEN`, `INSTAGRAM_APP_ID/SECRET`, `LINKEDIN_CLIENT_ID/SECRET`
5. Test with real platform APIs
6. Update `server/integrations/icadence/platforms.ts` to import real adapters

**Priority**: High (completes social queue system)

---

### 2. Worker Scaling & Concurrency
**Status**: Launcher scaffolded  
**Files**:
- `worker/launcher.ts`

**Next Steps**:
1. Add distributed locking for multi-worker coordination (Redis/PostgreSQL)
2. Implement worker health checks
3. Add graceful shutdown handling
4. Configure `CONCURRENCY` environment variable
5. Test with `npm run worker:cluster`
6. Monitor worker memory usage and CPU

**Priority**: Medium (performance optimization)

---

### 3. Social Queue SLO Monitoring
**Status**: Config file created  
**Files**:
- `server/ops/alerts/socialQueueSLO.ts`

**Next Steps**:
1. Implement SLO monitoring service
2. Add Prometheus/Grafana metrics integration
3. Create alert triggers for:
   - Error budget exceeded (>5% per hour)
   - Queue age > 30 minutes
   - Worker downtime
4. Set up PagerDuty/Slack notifications
5. Create `/ops/slo` dashboard page

**Priority**: Medium (operational excellence)

---

### 4. RFP Draft Management
**Status**: Service and page scaffolded  
**Files**:
- `server/integrations/rfp/draft.service.ts`
- `client/src/pages/rfp/ingest.tsx`
- `docs/rfp/` (directory created)

**Next Steps**:
1. Design RFP database schema (rfp_drafts table)
2. Implement draft CRUD operations
3. Add attachment upload/storage
4. Build RFP ingest UI with file dropzone
5. Add email integration for incoming RFPs
6. Create `/rfp` route in App.tsx
7. Add audit events for draft lifecycle
8. Implement RFP → Proposal conversion flow

**Priority**: Low (future feature)

---

### 5. Loyalty Rewards System
**Status**: Route and admin page scaffolded  
**Files**:
- `server/routes/loyalty.route.ts`
- `client/src/pages/loyalty/index.tsx`

**Next Steps**:
1. Design loyalty points schema (user_points, reward_rules, redemptions)
2. Implement points earning rules
3. Create rewards catalog UI
4. Add redemption workflow
5. Wire route in `server/routes.ts`
6. Add `/loyalty` route in App.tsx
7. Integrate with invoice payments (earn points)
8. Build admin dashboard for managing rules

**Priority**: Low (future feature)

---

### 6. Brand Voice & Accessibility Audit
**Status**: Placeholder script created  
**Files**:
- `scripts/brand_token_audit.ts`

**Next Steps**:
1. Implement Tailwind token extraction
2. Add WCAG AA+ contrast checker
3. Scan all components for color usage
4. Generate accessibility report
5. Add to CI/CD pipeline
6. Create remediation guidelines
7. Run: `npm run audit:brand`

**Priority**: Low (quality improvement)

---

### 7. SSO Organization Binding
**Status**: UI page scaffolded  
**Files**:
- `client/src/pages/auth/org-bind.tsx`

**Next Steps**:
1. Add organization schema (orgs, org_users, org_roles)
2. Implement org creation/selection flow
3. Add SSO provider configuration UI
4. Integrate with existing SSO service
5. Add `/auth/org-bind` route in App.tsx
6. Implement org switching UI in navbar
7. Add org-scoped data access layer

**Priority**: Low (enterprise feature)

---

### 8. Pricing Page & Entitlements
**Status**: Page and middleware scaffolded  
**Files**:
- `client/src/pages/pricing.tsx`
- `server/middleware/entitlements.ts`

**Next Steps**:
1. Design pricing tier comparison UI
2. Implement `requirePlan()` middleware logic
3. Add feature gating across endpoints
4. Create upgrade/downgrade flows
5. Add `/pricing` route in App.tsx (already exists)
6. Integrate with Stripe checkout
7. Add plan limits enforcement
8. Build admin override UI

**Priority**: Medium (monetization)

---

### 9. GTM Launch Pack
**Status**: Documentation started  
**Files**:
- `docs/gtm/launch_pack.md`

**Next Steps**:
1. Create competitive matrix (vs Toggl, Harvest, Clockify)
2. Write 10 influencer outreach briefs
3. Design affiliate one-pager
4. Build 30-day content calendar
5. Add social media post templates
6. Create press release draft
7. Design launch email sequence

**Priority**: Low (marketing)

---

### 10. IP Documentation
**Status**: Provisional snapshot outline created  
**Files**:
- `docs/ip/provisional_snapshot.md`

**Next Steps**:
1. Expand claims outline:
   - Agent graduation framework
   - Audit fabric architecture
   - Queue orchestration with tapering
2. Create technical diagrams (Figures 1-10)
3. Document trade secrets:
   - Rate limiting algorithm
   - Burst override logic
   - Media HEAD caching
4. Write provisional patent application draft
5. File with USPTO
6. Establish prior art date

**Priority**: Low (legal protection)

---

## Implementation Priority Matrix

### High Priority (Complete Social Queue)
1. ✅ Social platform adapters (X, Instagram, LinkedIn)

### Medium Priority (Performance & Revenue)
2. Worker scaling & concurrency
3. SLO monitoring
4. Pricing page & entitlements

### Low Priority (Future Features)
5. RFP draft management
6. Loyalty rewards system
7. Brand accessibility audit
8. SSO org binding
9. GTM launch pack
10. IP documentation

---

## Environment Variables Needed

Add to `.env`:
```bash
# Social Platform APIs
X_BEARER_TOKEN=your_x_token
INSTAGRAM_APP_ID=your_ig_app_id
INSTAGRAM_APP_SECRET=your_ig_secret
LINKEDIN_CLIENT_ID=your_li_client_id
LINKEDIN_CLIENT_SECRET=your_li_secret

# Worker Scaling
CONCURRENCY=4

# SLO Monitoring
SLO_ERROR_BUDGET_PCT=5
SLO_MAX_QUEUE_AGE_MIN=30
```

---

## Testing Checklist

For each scaffolded feature:
- [ ] Unit tests written
- [ ] Integration tests passing
- [ ] E2E tests for critical paths
- [ ] Documentation updated
- [ ] Error handling implemented
- [ ] Audit logging added
- [ ] Performance tested
- [ ] Security reviewed
- [ ] Accessibility checked
- [ ] User Manual updated

---

**Last Updated**: November 6, 2025  
**Scaffolded Files**: 13 files across 10 feature areas
