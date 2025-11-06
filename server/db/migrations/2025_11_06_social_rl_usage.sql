-- Track rate limit consumption events for charting
CREATE TABLE IF NOT EXISTS social_rl_usage (
  id BIGSERIAL PRIMARY KEY,
  platform TEXT NOT NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  amount INT NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_social_rl_usage_platform_time 
  ON social_rl_usage(platform, used_at DESC);
