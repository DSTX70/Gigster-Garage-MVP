import { pool } from "../db.js";

export async function tryConsume(platform: string): Promise<{ allowed: boolean; retryAfterMs?: number }> {
  const { rows } = await pool.query(
    `SELECT platform, window_seconds, max_actions, used_actions, window_started_at
     FROM social_rate_limits
     WHERE platform = $1
     FOR UPDATE`,
    [platform]
  );

  if (rows.length === 0) {
    // Sensible default: 60 actions per minute if platform not configured
    await pool.query(
      `INSERT INTO social_rate_limits (platform, window_seconds, max_actions, used_actions)
       VALUES ($1, 60, 60, 0)
       ON CONFLICT (platform) DO NOTHING`,
      [platform]
    );
    return { allowed: true };
  }

  const rl = rows[0];
  const now = new Date();
  const start = new Date(rl.window_started_at);
  const windowMs = rl.window_seconds * 1000;

  // Check if window has expired - reset if so
  if (now.getTime() - start.getTime() >= windowMs) {
    await pool.query(
      `UPDATE social_rate_limits
       SET used_actions = 1, window_started_at = NOW()
       WHERE platform = $1`,
      [platform]
    );
    return { allowed: true };
  }

  // Check if we're within limits
  if (rl.used_actions < rl.max_actions) {
    await pool.query(
      `UPDATE social_rate_limits
       SET used_actions = used_actions + 1
       WHERE platform = $1`,
      [platform]
    );
    return { allowed: true };
  }

  // Rate limit exceeded - calculate retry time
  const resetAt = new Date(start.getTime() + windowMs);
  return {
    allowed: false,
    retryAfterMs: Math.max(0, resetAt.getTime() - now.getTime())
  };
}
