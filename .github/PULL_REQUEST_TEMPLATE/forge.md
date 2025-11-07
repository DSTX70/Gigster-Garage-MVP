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
