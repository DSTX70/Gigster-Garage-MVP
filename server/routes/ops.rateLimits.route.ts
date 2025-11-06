import { Router, Request, Response } from "express";
import { listRateLimits, upsertRateLimit, resetWindow } from "../lib/rateLimits.service.js";
import { audit } from "../lib/audit.js";

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

export default router;
