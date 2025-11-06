CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfp_id TEXT NOT NULL,
  client TEXT NOT NULL,
  due_date DATE NOT NULL,
  scope TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proposal_attachments (
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  url TEXT NOT NULL
);
