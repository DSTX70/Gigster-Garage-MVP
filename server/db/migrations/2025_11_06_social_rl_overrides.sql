-- Temporary burst overrides with tapering
CREATE TABLE IF NOT EXISTS social_rl_overrides (
  platform TEXT PRIMARY KEY,
  factor NUMERIC NOT NULL DEFAULT 1.0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_social_rl_overrides_expires 
  ON social_rl_overrides(expires_at);
