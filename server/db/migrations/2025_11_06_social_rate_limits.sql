-- Rate limiting table for social platforms
CREATE TABLE IF NOT EXISTS social_rate_limits (
  platform TEXT PRIMARY KEY,
  window_seconds INT NOT NULL,
  max_actions INT NOT NULL,
  used_actions INT NOT NULL DEFAULT 0,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION social_rl_touch() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_social_rl_updated ON social_rate_limits;
CREATE TRIGGER trg_social_rl_updated
  BEFORE UPDATE ON social_rate_limits
  FOR EACH ROW
  EXECUTE PROCEDURE social_rl_touch();

-- Seed default rate limits for common platforms
INSERT INTO social_rate_limits (platform, window_seconds, max_actions)
VALUES
  ('x', 900, 300),           -- 300 posts per 15 minutes
  ('instagram', 3600, 200),   -- 200 posts per hour
  ('linkedin', 3600, 200),    -- 200 posts per hour
  ('facebook', 3600, 200),    -- 200 posts per hour
  ('tiktok', 3600, 150),      -- 150 posts per hour
  ('youtube', 3600, 100)      -- 100 posts per hour
ON CONFLICT (platform) DO NOTHING;
