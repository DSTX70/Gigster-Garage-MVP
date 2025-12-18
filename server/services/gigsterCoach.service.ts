// FILE: server/services/gigsterCoach.service.ts
import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import { CoachRequest, CoachResponse } from "../../shared/contracts/gigsterCoach.js";
import { getPlanFeatures } from "../../shared/plans.js";

type UserSession = {
  id: string;
  role: "admin" | "user" | null;
  plan?: "free" | "pro" | "enterprise" | null;
  featuresOverride?: Record<string, boolean | number> | null;
};

function loadPolicy() {
  try {
    const p = path.join(process.cwd(), "policy", "agent_exposure_policy.json");
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function isAgentExposed(policy: any, agentId: string) {
  if (!policy?.agents) return false;
  const agent = policy.agents.find((a: any) => a.id === agentId);
  return Boolean(agent);
}

function enforceAutonomy(policy: any, requested: "L0" | "L1") {
  if (requested === "L0") return { allowed: true, level: "L0" as const };
  const ok = policy?.autonomy_levels?.includes("L1") ?? false;
  return { allowed: ok, level: ok ? ("L1" as const) : ("L0" as const) };
}

export class GigsterCoachService {
  private openai: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    } else {
      console.warn("⚠️ GigsterCoach: OPENAI_API_KEY not set - coach features disabled");
    }
  }

  async run(user: UserSession, raw: unknown) {
    if (!this.openai) {
      throw Object.assign(new Error("GigsterCoach is not available - AI key not configured"), { status: 503 });
    }

    const req = CoachRequest.parse(raw);

    const plan = (user.plan ?? "free") as "free" | "pro" | "enterprise";
    const features = getPlanFeatures(plan, user.featuresOverride as any);

    if (!features.gigsterCoachBase) {
      throw Object.assign(new Error("GigsterCoach not enabled"), { status: 402, code: "PLAN_REQUIRED" });
    }
    if (req.intent === "ask" && !features.gigsterCoachAskExpert) {
      throw Object.assign(new Error("Ask-an-Expert requires plan upgrade"), { status: 402 });
    }
    if (req.intent === "suggest" && !features.gigsterCoachProactive) {
      throw Object.assign(new Error("Proactive coaching requires Pro"), { status: 402 });
    }

    const policy = loadPolicy();
    const policyAgentOk = isAgentExposed(policy, "agent.planner") || isAgentExposed(policy, "agent.ledger");
    const autonomy = enforceAutonomy(policy, req.requestedAutonomy);
    const effectiveAutonomy = policyAgentOk && autonomy.allowed ? autonomy.level : "L0";

    const system = [
      "You are GigsterCoach — a lightweight business coach for gig workers.",
      "You must obey these rules:",
      "- Never claim you sent messages, invoices, or posts.",
      "- Provide drafts and suggestions only; user must take final action.",
      "- Ask clarifying questions only if strictly necessary; otherwise make reasonable assumptions and label them.",
      "- Return concise, actionable guidance with checklists when appropriate.",
      `- Effective autonomy: ${effectiveAutonomy} (L0 assist-only, L1 still human-in-loop).`,
    ].join("\n");

    const userMsg = [
      `Intent: ${req.intent}`,
      req.draftTarget ? `DraftTarget: ${req.draftTarget}` : "",
      req.contextRef ? `ContextRef: ${JSON.stringify(req.contextRef)}` : "",
      req.structuredFields ? `StructuredFields: ${JSON.stringify(req.structuredFields)}` : "",
      req.artifactText ? `ArtifactText:\n${req.artifactText}` : "",
      `Question:\n${req.question}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    const model = process.env.GIGSTERCOACH_MODEL ?? "gpt-4o-mini";

    const completion = await this.openai.chat.completions.create({
      model,
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMsg },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "No response.";
    const tokensUsed = completion.usage?.total_tokens ?? undefined;

    const suggestions: any[] = [];
    const checklist: any[] = [];

    if (req.intent === "review") {
      checklist.push(
        { id: "scope", label: "Scope is clear (deliverables + exclusions)", isComplete: false },
        { id: "timeline", label: "Timeline/milestones are stated", isComplete: false },
        { id: "payment", label: "Payment terms are explicit (due date/late fees)", isComplete: false },
        { id: "revisions", label: "Revision policy is included", isComplete: false }
      );
    }

    if (req.intent === "draft" && req.draftTarget === "invoice_terms") {
      suggestions.push({
        id: "terms-latefee",
        title: "Add a late fee clause",
        reason: "Reduces overdue risk and sets expectations.",
        severity: "info",
        actionType: "insert_text",
        payload: {
          type: "append_text",
          payload: {
            target: "invoice.terms",
            text: "\nLate fee: Payments past due may incur a late fee of X% per month (or $X) unless prohibited by law.\n",
          },
        },
      });
    }

    // v1.1: Add baseline business coach suggestions for suggest intent
    if (req.intent === "suggest") {
      suggestions.push(
        {
          id: "followup-cadence",
          title: "Create a 2-touch follow-up cadence for overdue invoices",
          reason: "Consistent follow-ups reduce late payments without sounding aggressive.",
          severity: "info",
          actionType: "open_next_step",
          payload: {
            type: "append_text",
            payload: { target: "invoice.notes", text: "\nFollowup sequence initiated." },
          },
        },
        {
          id: "package-offer",
          title: "Turn your most common request into a 3-tier package",
          reason: "Packages improve conversion and reduce custom-scoping time.",
          severity: "info",
          actionType: "open_next_step",
          payload: { next: "service_packaging_wizard" },
        },
        {
          id: "terms-revisions",
          title: "Add a revision limit to your proposal templates",
          reason: "Revision limits prevent scope creep and protect profitability.",
          severity: "warn",
          actionType: "insert_text",
          payload: {
            type: "append_text",
            payload: {
              target: "proposal.terms",
              text: "\nRevisions: Includes up to two revision rounds. Additional revisions billed at $X/hour.\n",
            },
          },
        }
      );
    }

    const resp = CoachResponse.parse({
      answer: content,
      suggestions,
      checklist,
      model,
      tokensUsed,
    });

    return resp;
  }
}
