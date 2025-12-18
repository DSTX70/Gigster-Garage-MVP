// FILE: server/routes/gigsterCoach.route.ts
import type { Express } from "express";
import { GigsterCoachService } from "../services/gigsterCoach.service.js";
import { CoachRequest, GetSuggestionsQuery } from "../../shared/contracts/gigsterCoach.js";
import { ApplySuggestionExecuteRequest } from "../../shared/contracts/applyEngine.js";
import { db } from "../db.js";
import { gigsterCoachInteractions, gigsterCoachSuggestions } from "../../shared/schema.js";
import { and, desc, eq } from "drizzle-orm";

async function auditEmit(event: string, payload: any) {
  try {
    const { audit } = await import("../lib/audit.js");
    await audit.emit(event, payload);
  } catch {
    // best-effort
  }
}

async function saveSuggestions(
  userId: string,
  sourceIntent: "ask" | "draft" | "review" | "suggest",
  suggestions: any[],
  contextRef: any
) {
  if (!Array.isArray(suggestions) || suggestions.length === 0) return;
  const rows = suggestions.map((s: any) => ({
    userId,
    status: "open" as const,
    sourceIntent,
    title: String(s.title ?? "Suggestion"),
    reason: s.reason ? String(s.reason) : null,
    severity: (s.severity ?? "info") as "info" | "warn" | "critical",
    actionType: (s.actionType ?? "none") as "insert_text" | "add_checklist_item" | "open_next_step" | "none",
    payload: s.payload ?? null,
    contextRef: contextRef ?? null,
  }));
  try {
    await db.insert(gigsterCoachSuggestions).values(rows);
  } catch (e) {
    console.error("Failed to save suggestions:", e);
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
      await saveSuggestions(user.id, "ask", resp.suggestions ?? [], body.contextRef);

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
      await saveSuggestions(user.id, "draft", resp.suggestions ?? [], body.contextRef);

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
      await saveSuggestions(user.id, "review", resp.suggestions ?? [], body.contextRef);

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
      await saveSuggestions(user.id, "suggest", resp.suggestions ?? [], body.contextRef);

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

  // v1.1: Suggestions list
  app.get("/api/gigster-coach/suggestions", deps.requireAuth, async (req, res) => {
    try {
      const user = req.session.user!;
      const q = GetSuggestionsQuery.parse({ status: req.query.status, limit: req.query.limit });
      const status = q.status ?? "open";
      const limit = q.limit ?? 100;

      const rows = await db.select().from(gigsterCoachSuggestions)
        .where(and(eq(gigsterCoachSuggestions.userId, user.id), eq(gigsterCoachSuggestions.status, status)))
        .orderBy(desc(gigsterCoachSuggestions.createdAt))
        .limit(limit);

      res.json(rows);
    } catch (e: any) {
      res.status(400).json({ message: e.message ?? "Bad request" });
    }
  });

  // v1.2: Apply suggestion with typed payload validation
  app.post("/api/gigster-coach/suggestions/:id/apply", deps.requireAuth, async (req, res) => {
    try {
      const user = req.session.user!;
      const id = req.params.id;

      // Validate ownership
      const [row] = await db.select().from(gigsterCoachSuggestions)
        .where(and(eq(gigsterCoachSuggestions.id, id), eq(gigsterCoachSuggestions.userId, user.id)))
        .limit(1);

      if (!row) return res.status(404).json({ message: "Suggestion not found" });

      const stored = row.payload;
      if (stored && req.body?.apply) {
        try {
          const execReq = ApplySuggestionExecuteRequest.parse(req.body);
          const storedParsed = ApplySuggestionExecuteRequest.parse({ apply: stored }).apply;
          const attempted = execReq.apply;
          const same = JSON.stringify(storedParsed) === JSON.stringify(attempted);
          if (!same) {
            return res.status(400).json({ message: "Apply payload mismatch (blocked)" });
          }
        } catch {
          // If payload validation fails, allow simple "mark applied" flow
        }
      }

      await db.update(gigsterCoachSuggestions).set({
        status: "applied",
        appliedAt: new Date(),
      }).where(eq(gigsterCoachSuggestions.id, id));

      await auditEmit("gigsterCoach.suggestion.applied", {
        userId: user.id,
        suggestionId: id,
      });

      res.json({ ok: true, suggestionId: id, status: "applied" });
    } catch (e: any) {
      res.status(400).json({ message: e.message ?? "Apply failed" });
    }
  });

  // v1.1: Dismiss suggestion
  app.post("/api/gigster-coach/suggestions/:id/dismiss", deps.requireAuth, async (req, res) => {
    try {
      const user = req.session.user!;
      const id = req.params.id;

      const [row] = await db.select().from(gigsterCoachSuggestions)
        .where(and(eq(gigsterCoachSuggestions.id, id), eq(gigsterCoachSuggestions.userId, user.id)))
        .limit(1);

      if (!row) return res.status(404).json({ message: "Suggestion not found" });

      await db.update(gigsterCoachSuggestions).set({
        status: "dismissed",
        dismissedAt: new Date(),
      }).where(eq(gigsterCoachSuggestions.id, id));

      await auditEmit("gigsterCoach.suggestion.dismissed", {
        userId: user.id,
        suggestionId: id,
      });

      res.json({ ok: true, id, status: "dismissed" });
    } catch (e: any) {
      res.status(400).json({ message: e.message ?? "Dismiss failed" });
    }
  });
}
