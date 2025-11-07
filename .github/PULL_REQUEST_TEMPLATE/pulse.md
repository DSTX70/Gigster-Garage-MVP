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
