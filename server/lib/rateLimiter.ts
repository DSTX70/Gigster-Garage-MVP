import { pool } from "../db.js";

/**
 * Calculate effective max actions considering burst override with linear tapering.
 * Tapering: factor decays linearly from override.factor → 1.0 over the override window.
 */
async function getEffectiveMax(platform: string, baseMax: number): Promise<number> {
  const { rows } = await pool.query(
    `SELECT factor, started_at, expires_at 
     FROM social_rl_overrides 
     WHERE platform = $1`,
    [platform]
  );
  
  if (rows.length === 0) return baseMax;

  const { factor, started_at, expires_at } = rows[0];
  const now = Date.now();
  const start = new Date(started_at).getTime();
  const end = new Date(expires_at).getTime();
  
  if (now >= end || factor <= 1) {
    // Cleanup expired or inert overrides
    await pool.query(
      `DELETE FROM social_rl_overrides 
       WHERE platform = $1 AND expires_at <= NOW()`,
      [platform]
    );
    return baseMax;
  }
  
  const total = Math.max(1, end - start);
  const remaining = Math.max(0, end - now);
  const ratio = remaining / total; // 1.0 → 0.0 over window
  const effectiveFactor = 1 + (Number(factor) - 1) * ratio;
  
  return Math.floor(baseMax * effectiveFactor);
}

export async function tryConsume(platform: string): Promise<{ allowed: boolean; retryAfterMs?: number }> {
  // FOR UPDATE to serialize updates per platform row
  let rlRows = (await pool.query(
    `SELECT platform, window_seconds, max_actions, used_actions, window_started_at
     FROM social_rate_limits
     WHERE platform = $1
     FOR UPDATE`,
    [platform]
  )).rows;

  if (rlRows.length === 0) {
    // Sensible default seed
    await pool.query(
      `INSERT INTO social_rate_limits (platform, window_seconds, max_actions, used_actions, window_started_at)
       VALUES ($1, 60, 60, 0, NOW())
       ON CONFLICT (platform) DO NOTHING`,
      [platform]
    );
    rlRows = (await pool.query(
      `SELECT platform, window_seconds, max_actions, used_actions, window_started_at
       FROM social_rate_limits
       WHERE platform = $1
       FOR UPDATE`,
      [platform]
    )).rows;
  }

  const rl = rlRows[0];
  const now = new Date();
  const start = new Date(rl.window_started_at);
  const windowMs = rl.window_seconds * 1000;

  // Reset window if elapsed
  if (now.getTime() - start.getTime() >= windowMs) {
    await pool.query(
      `UPDATE social_rate_limits
       SET used_actions = 1, window_started_at = NOW()
       WHERE platform = $1`,
      [platform]
    );
    // Log usage for charts
    await pool.query(
      `INSERT INTO social_rl_usage (platform, used_at, amount) 
       VALUES ($1, NOW(), 1)`,
      [platform]
    );
    return { allowed: true };
  }

  // Apply tapering override to compute effective cap
  const effectiveMax = await getEffectiveMax(platform, rl.max_actions);

  if (rl.used_actions < effectiveMax) {
    await pool.query(
      `UPDATE social_rate_limits
       SET used_actions = used_actions + 1
       WHERE platform = $1`,
      [platform]
    );
    await pool.query(
      `INSERT INTO social_rl_usage (platform, used_at, amount) 
       VALUES ($1, NOW(), 1)`,
      [platform]
    );
    return { allowed: true };
  }

  const resetAt = new Date(start.getTime() + windowMs);
  return {
    allowed: false,
    retryAfterMs: Math.max(0, resetAt.getTime() - now.getTime())
  };
}
