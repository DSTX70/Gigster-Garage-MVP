import { pool } from "../db.js";

export async function listRateLimits() {
  const { rows } = await pool.query(
    `SELECT platform, window_seconds, max_actions, used_actions, window_started_at, updated_at
     FROM social_rate_limits 
     ORDER BY platform ASC`
  );
  return rows;
}

export async function upsertRateLimit(platform: string, window_seconds: number, max_actions: number) {
  await pool.query(
    `INSERT INTO social_rate_limits (platform, window_seconds, max_actions, used_actions, window_started_at)
     VALUES ($1, $2, $3, 0, NOW())
     ON CONFLICT (platform) DO UPDATE 
     SET window_seconds = $2, max_actions = $3`,
    [platform, window_seconds, max_actions]
  );
}

export async function resetWindow(platform: string) {
  await pool.query(
    `UPDATE social_rate_limits 
     SET used_actions = 0, window_started_at = NOW() 
     WHERE platform = $1`,
    [platform]
  );
}
