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
