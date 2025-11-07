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
