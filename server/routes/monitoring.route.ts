import { Router } from "express";
import { pool } from "../db";
import { hourlyErrorRate, maxQueueAgeMinutes, rateLimitSaturation } from "../ops/alerts/socialQueue.metrics";

const r = Router();

r.get("/metrics/slo", async (_req, res) => {
  try {
    const [errorRate, queueAge, rateLimits] = await Promise.all([
      hourlyErrorRate(),
      maxQueueAgeMinutes(),
      rateLimitSaturation(),
    ]);

    res.json({
      errorRate,
      queueAge,
      rateLimitSaturation: rateLimits,
    });
  } catch (error) {
    console.error("[monitoring] Failed to fetch SLO metrics:", error);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

r.get("/social-queue/stats", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(COUNT(*) FILTER (WHERE status = 'queued'), 0)::int as queued,
        COALESCE(COUNT(*) FILTER (WHERE status = 'posting'), 0)::int as posting,
        COALESCE(COUNT(*) FILTER (WHERE status = 'posted'), 0)::int as posted,
        COALESCE(COUNT(*) FILTER (WHERE status = 'failed'), 0)::int as failed,
        COALESCE(COUNT(*) FILTER (WHERE status = 'paused'), 0)::int as paused,
        COALESCE(COUNT(*), 0)::int as total
      FROM social_queue
    `);

    res.json(result.rows[0] || { queued: 0, posting: 0, posted: 0, failed: 0, paused: 0, total: 0 });
  } catch (error) {
    console.error("[monitoring] Failed to fetch queue stats:", error);
    res.status(500).json({ error: "Failed to fetch queue stats" });
  }
});

r.get("/health", async (_req, res) => {
  try {
    const startTime = Date.now() - (process.uptime() * 1000);
    const uptime = Math.floor(process.uptime());
    
    const [errorRate, queueAge] = await Promise.all([
      hourlyErrorRate(),
      maxQueueAgeMinutes(),
    ]);

    let status: "healthy" | "degraded" | "critical" = "healthy";
    
    if (errorRate > 5 || queueAge > 30) {
      status = "critical";
    } else if (errorRate > 2 || queueAge > 15) {
      status = "degraded";
    }

    res.json({
      status,
      uptime,
      lastCheck: new Date().toISOString(),
      metrics: {
        errorRate,
        queueAge,
      },
    });
  } catch (error) {
    console.error("[monitoring] Health check failed:", error);
    res.status(503).json({
      status: "critical",
      error: "Health check failed",
    });
  }
});

export default r;
