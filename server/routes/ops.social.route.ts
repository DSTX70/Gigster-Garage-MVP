import type { Request, Response } from "express";
import { Router } from "express";
import { pool } from "../db.js";
import { audit } from "../lib/audit.js";

const router = Router();

router.get("/social-queue", async (req: Request, res: Response) => {
  const { status, platform, limit = 100 } = req.query as any;
  const clauses = [];
  const args: any[] = [];
  
  if (status) {
    args.push(status);
    clauses.push(`status=$${args.length}`);
  }
  if (platform) {
    args.push(platform);
    clauses.push(`platform=$${args.length}`);
  }
  
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const { rows } = await pool.query(
    `SELECT * FROM social_queue ${where} ORDER BY scheduled_at DESC LIMIT $${args.length + 1}`,
    [...args, Number(limit)]
  );
  
  res.json({ items: rows });
});

router.post("/social-queue/:id/pause", async (req, res) => {
  await pool.query(
    `UPDATE social_queue SET status='paused' WHERE id=$1 AND status IN ('queued', 'failed')`,
    [req.params.id]
  );
  await audit.emit("social.queue.paused", { id: req.params.id, actorId: (req as any).user?.id });
  res.json({ ok: true });
});

router.post("/social-queue/:id/resume", async (req, res) => {
  await pool.query(
    `UPDATE social_queue SET status='queued', next_attempt_at=NULL WHERE id=$1 AND status='paused'`,
    [req.params.id]
  );
  await audit.emit("social.queue.resumed", { id: req.params.id, actorId: (req as any).user?.id });
  res.json({ ok: true });
});

router.post("/social-queue/:id/retry", async (req, res) => {
  await pool.query(
    `UPDATE social_queue SET status='queued', next_attempt_at=now(), attempts=LEAST(attempts, 5) WHERE id=$1`,
    [req.params.id]
  );
  await audit.emit("social.queue.retry", { id: req.params.id, actorId: (req as any).user?.id });
  res.json({ ok: true });
});

router.post("/social-queue/:id/cancel", async (req, res) => {
  await pool.query(
    `UPDATE social_queue SET status='cancelled' WHERE id=$1 AND status IN ('queued', 'failed', 'paused')`,
    [req.params.id]
  );
  await audit.emit("social.queue.cancelled", { id: req.params.id, actorId: (req as any).user?.id });
  res.json({ ok: true });
});

export default router;
