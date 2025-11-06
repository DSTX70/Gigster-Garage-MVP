-- Media HEAD cache to avoid repeated HEAD requests
CREATE TABLE IF NOT EXISTS media_head_cache (
  url TEXT PRIMARY KEY,
  content_length BIGINT,
  content_type TEXT,
  ok BOOLEAN NOT NULL DEFAULT TRUE,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_head_cache_checked 
  ON media_head_cache(checked_at DESC);
