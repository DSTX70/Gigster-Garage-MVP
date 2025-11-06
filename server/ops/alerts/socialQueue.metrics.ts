import { pool } from "../../db";

export async function hourlyErrorRate(): Promise<number> {
  const result = await pool.query(`
    SELECT COALESCE(
      100.0 * SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0),
      0
    ) as pct
    FROM social_queue 
    WHERE updated_at >= NOW() - INTERVAL '1 hour'
  `);
  return Number(result.rows[0]?.pct || 0);
}

export async function maxQueueAgeMinutes(): Promise<number> {
  const result = await pool.query(`
    SELECT COALESCE(
      EXTRACT(EPOCH FROM (NOW() - MIN(scheduled_at))) / 60.0,
      0
    ) as age
    FROM social_queue 
    WHERE status IN ('queued', 'failed')
  `);
  return Number(result.rows[0]?.age || 0);
}

export async function rateLimitSaturation(): Promise<Array<{ platform: string; pct: number }>> {
  const result = await pool.query(`
    SELECT platform, used_actions, max_actions 
    FROM social_rate_limits
  `);
  
  return result.rows.map((r: any) => ({
    platform: r.platform,
    pct: Math.round(100 * r.used_actions / Math.max(1, r.max_actions))
  }));
}
