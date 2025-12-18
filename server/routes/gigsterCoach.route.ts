// FILE: server/routes/gigsterCoach.route.ts
import type { Express } from "express";
import { GigsterCoachService } from "../services/gigsterCoach.service.js";
import { CoachRequest } from "../../shared/contracts/gigsterCoach.js";
import { db } from "../db.js";
import { gigsterCoachInteractions } from "../../shared/schema.js";
import { desc, eq } from "drizzle-orm";

async function auditEmit(event: string, payload: any) {
  try {
    const { audit } = await import("../lib/audit.js");
    await audit.emit(event, payload);
  } catch {
    // best-effort
  }
}

export function mountGigsterCoachRoutes(app: Express, deps: {
  requireAuth: any;
  requirePlan: (minPlan: "free" | "pro" | "enterprise") => any;
}) {
  const coach = new GigsterCoachService();

  app.post("/api/gigster-coach/ask", deps.requireAuth, async (req, res) => {
    try {
      const body = CoachRequest.parse({ ...req.body, intent: "ask" });
      const user = req.session.user!;
      const resp = await coach.run(user, body);

      const [row] = await db.insert(gigsterCoachInteractions).values({
        userId: user.id,
        intent: "ask",
        question: body.question,
        answer: resp.answer,
        contextRef: body.contextRef ?? null,
        model: resp.model ?? null,
        tokensUsed: resp.tokensUsed ?? null,
      }).returning();

      await auditEmit("gigsterCoach.ask", { userId: user.id, interactionId: row?.id });

      res.json({ ...resp, interactionId: row?.id });
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message ?? "GigsterCoach ask failed" });
    }
  });

  app.post("/api/gigster-coach/draft", deps.requireAuth, async (req, res) => {
    try {
      const body = CoachRequest.parse({ ...req.body, intent: "draft" });
      const user = req.session.user!;
      const resp = await coach.run(user, body);

      const [row] = await db.insert(gigsterCoachInteractions).values({
        userId: user.id,
        intent: "draft",
        question: body.question,
        answer: resp.answer,
        contextRef: body.contextRef ?? null,
        model: resp.model ?? null,
        tokensUsed: resp.tokensUsed ?? null,
      }).returning();

      await auditEmit("gigsterCoach.draft", { userId: user.id, interactionId: row?.id });

      res.json({ ...resp, interactionId: row?.id });
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message ?? "GigsterCoach draft failed" });
    }
  });

  app.post("/api/gigster-coach/review", deps.requireAuth, async (req, res) => {
    try {
      const body = CoachRequest.parse({ ...req.body, intent: "review" });
      const user = req.session.user!;
      const resp = await coach.run(user, body);

      const [row] = await db.insert(gigsterCoachInteractions).values({
        userId: user.id,
        intent: "review",
        question: body.question,
        answer: resp.answer,
        contextRef: body.contextRef ?? null,
        model: resp.model ?? null,
        tokensUsed: resp.tokensUsed ?? null,
      }).returning();

      await auditEmit("gigsterCoach.review", { userId: user.id, interactionId: row?.id });

      res.json({ ...resp, interactionId: row?.id });
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message ?? "GigsterCoach review failed" });
    }
  });

  app.post("/api/gigster-coach/suggest", deps.requireAuth, deps.requirePlan("pro"), async (req, res) => {
    try {
      const body = CoachRequest.parse({ ...req.body, intent: "suggest" });
      const user = req.session.user!;
      const resp = await coach.run(user, body);

      const [row] = await db.insert(gigsterCoachInteractions).values({
        userId: user.id,
        intent: "suggest",
        question: body.question,
        answer: resp.answer,
        contextRef: body.contextRef ?? null,
        model: resp.model ?? null,
        tokensUsed: resp.tokensUsed ?? null,
      }).returning();

      await auditEmit("gigsterCoach.suggest", { userId: user.id, interactionId: row?.id });

      res.json({ ...resp, interactionId: row?.id });
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message ?? "GigsterCoach suggest failed" });
    }
  });

  app.get("/api/gigster-coach/history", deps.requireAuth, async (req, res) => {
    try {
      const user = req.session.user!;
      const limit = Math.min(Number(req.query.limit ?? 50), 200);

      const rows = await db.select().from(gigsterCoachInteractions)
        .where(eq(gigsterCoachInteractions.userId, user.id))
        .orderBy(desc(gigsterCoachInteractions.createdAt))
        .limit(limit);

      res.json(rows);
    } catch (e: any) {
      res.status(500).json({ message: "Failed to load coach history" });
    }
  });
}
