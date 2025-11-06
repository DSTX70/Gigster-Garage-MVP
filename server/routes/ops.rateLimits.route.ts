import { Router, Request, Response } from "express";
import { listRateLimits, upsertRateLimit, resetWindow } from "../lib/rateLimits.service.js";
import { audit } from "../lib/audit.js";
import { pool } from "../db.js";

const router = Router();

router.get("/rate-limits", async (_req: Request, res: Response) => {
  const items = await listRateLimits();
  res.json({ items });
});

router.post("/rate-limits", async (req: Request, res: Response) => {
  const { platform, window_seconds, max_actions } = req.body || {};
  
  if (!platform || !window_seconds || !max_actions) {
    return res.status(400).json({ error: "missing_fields" });
  }
  
  await upsertRateLimit(String(platform), Number(window_seconds), Number(max_actions));
  await audit.emit("social.rl.updated", { 
    platform, 
    window_seconds, 
    max_actions, 
    actorId: (req as any).user?.id 
  });
  
  res.json({ ok: true });
});

router.post("/rate-limits/:platform/reset", async (req: Request, res: Response) => {
  const platform = req.params.platform;
  await resetWindow(platform);
  await audit.emit("social.rl.reset", { platform, actorId: (req as any).user?.id });
  res.json({ ok: true });
});

// Usage series with windowed aggregation (6h / 24h / 7d)
router.get("/rate-limits/:platform/usage", async (req: Request, res: Response) => {
  const platform = req.params.platform;
  const window = String(req.query.window || "24h");
  
  const conf = window === "7d"
    ? { interval: "7 days", bucket: "day", points: 7, stepMs: 24 * 3600 * 1000 }
    : window === "6h"
      ? { interval: "6 hours", bucket: "hour", points: 6, stepMs: 3600 * 1000 }
      : { interval: "24 hours", bucket: "hour", points: 24, stepMs: 3600 * 1000 };

  const { rows } = await pool.query(
    `SELECT date_trunc($2, used_at) as bucket, sum(amount)::int as total
     FROM social_rl_usage
     WHERE platform = $1 AND used_at >= NOW() - ($3)::interval
     GROUP BY 1
     ORDER BY 1 ASC`,
    [platform, conf.bucket, conf.interval]
  );

  // Fill missing buckets with zeros
  const filled: { bucket: string; total: number }[] = [];
  const start = new Date(Date.now() - conf.points * conf.stepMs);
  
  for (let i = 0; i <= conf.points; i++) {
    const b = new Date(start.getTime() + i * conf.stepMs);
    const key = conf.bucket === "hour"
      ? new Date(b.getFullYear(), b.getMonth(), b.getDate(), b.getHours()).toISOString()
      : new Date(b.getFullYear(), b.getMonth(), b.getDate()).toISOString();
    const found = rows.find(r => new Date(r.bucket).toISOString() === key);
    filled.push({ bucket: key, total: found ? Number(found.total) : 0 });
  }
  
  res.json({ items: filled, window });
});

// CSV export with windowing support
router.get("/rate-limits/:platform/usage.csv", async (req: Request, res: Response) => {
  const platform = req.params.platform;
  const window = String(req.query.window || "24h");
  
  const conf = window === "7d"
    ? { interval: "7 days", bucket: "day", points: 7, stepMs: 24 * 3600 * 1000 }
    : window === "6h"
      ? { interval: "6 hours", bucket: "hour", points: 6, stepMs: 3600 * 1000 }
      : { interval: "24 hours", bucket: "hour", points: 24, stepMs: 3600 * 1000 };

  const { rows } = await pool.query(
    `SELECT date_trunc($2, used_at) as bucket, sum(amount)::int as total
     FROM social_rl_usage
     WHERE platform = $1 AND used_at >= NOW() - ($3)::interval
     GROUP BY 1
     ORDER BY 1 ASC`,
    [platform, conf.bucket, conf.interval]
  );

  const filled: { bucket: string; total: number }[] = [];
  const start = new Date(Date.now() - conf.points * conf.stepMs);
  
  for (let i = 0; i <= conf.points; i++) {
    const b = new Date(start.getTime() + i * conf.stepMs);
    const key = conf.bucket === "hour"
      ? new Date(b.getFullYear(), b.getMonth(), b.getDate(), b.getHours()).toISOString()
      : new Date(b.getFullYear(), b.getMonth(), b.getDate()).toISOString();
    const found = rows.find(r => new Date(r.bucket).toISOString() === key);
    filled.push({ bucket: key, total: found ? Number(found.total) : 0 });
  }

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${platform}_usage_${window}.csv"`);
  res.write("bucket,total\n");
  for (const p of filled) {
    res.write(`${p.bucket},${p.total}\n`);
  }
  res.end();
});

// Create/replace burst override with tapering
router.post("/rate-limits/:platform/override", async (req: Request, res: Response) => {
  const platform = req.params.platform;
  const { factor, minutes } = req.body || {};
  const f = Math.max(1, Number(factor || 1.5)); // default 1.5x
  const mins = Math.max(1, Math.min(240, Number(minutes || 30))); // 1..240 min
  
  await pool.query(
    `INSERT INTO social_rl_overrides (platform, factor, started_at, expires_at)
     VALUES ($1, $2, NOW(), NOW() + ($3 || ' minutes')::interval)
     ON CONFLICT (platform) DO UPDATE 
     SET factor = $2, started_at = NOW(), expires_at = NOW() + ($3 || ' minutes')::interval`,
    [platform, f, mins]
  );
  
  await audit.emit("social.rl.override_set", { 
    platform, 
    factor: f, 
    minutes: mins, 
    actorId: (req as any).user?.id 
  });
  
  res.json({ ok: true, platform, factor: f, minutes: mins });
});

// Cancel override
router.delete("/rate-limits/:platform/override", async (req: Request, res: Response) => {
  const platform = req.params.platform;
  await pool.query(`DELETE FROM social_rl_overrides WHERE platform = $1`, [platform]);
  await audit.emit("social.rl.override_cleared", { platform, actorId: (req as any).user?.id });
  res.json({ ok: true });
});

export default router;
