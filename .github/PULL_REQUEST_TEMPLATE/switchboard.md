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
