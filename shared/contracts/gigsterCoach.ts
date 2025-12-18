// FILE: shared/contracts/gigsterCoach.ts
import { z } from "zod";

export const CoachIntent = z.enum(["ask", "draft", "review", "suggest"]);
export type CoachIntent = z.infer<typeof CoachIntent>;

export const CoachContextRef = z.object({
  invoiceId: z.string().uuid().optional(),
  proposalId: z.string().uuid().optional(),
  contractId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  bookingId: z.string().uuid().optional(),
  jobId: z.string().uuid().optional(),
  surface: z.enum(["hub", "invoice", "proposal", "contract", "message", "task", "other"]).default("hub"),
});

export type CoachContextRef = z.infer<typeof CoachContextRef>;

export const CoachDraftTarget = z.enum([
  "invoice_line_items",
  "invoice_terms",
  "proposal_outline",
  "proposal_scope",
  "contract_terms",
  "client_message",
  "service_description",
]);
export type CoachDraftTarget = z.infer<typeof CoachDraftTarget>;

export const CoachSuggestion = z.object({
  id: z.string(),
  title: z.string(),
  reason: z.string().optional(),
  severity: z.enum(["info", "warn", "critical"]).default("info"),
  actionType: z.enum(["insert_text", "add_checklist_item", "open_next_step", "none"]).default("none"),
  payload: z.record(z.any()).optional(),
});

export type CoachSuggestion = z.infer<typeof CoachSuggestion>;

export const CoachChecklistItem = z.object({
  id: z.string(),
  label: z.string(),
  isComplete: z.boolean().default(false),
  helpText: z.string().optional(),
});

export type CoachChecklistItem = z.infer<typeof CoachChecklistItem>;

export const CoachRequest = z.object({
  intent: CoachIntent,
  question: z.string().min(1).max(4000),
  draftTarget: CoachDraftTarget.optional(),
  artifactText: z.string().max(20000).optional(),
  structuredFields: z.record(z.any()).optional(),
  contextRef: CoachContextRef.optional(),
  requestedAutonomy: z.enum(["L0", "L1"]).default("L0"),
});

export type CoachRequest = z.infer<typeof CoachRequest>;

export const CoachResponse = z.object({
  answer: z.string(),
  suggestions: z.array(CoachSuggestion).default([]),
  checklist: z.array(CoachChecklistItem).default([]),
  model: z.string().optional(),
  tokensUsed: z.number().int().nonnegative().optional(),
});

export type CoachResponse = z.infer<typeof CoachResponse>;

export const CoachHistoryItem = z.object({
  id: z.string(),
  createdAt: z.string(),
  intent: CoachIntent,
  question: z.string(),
  answer: z.string(),
  contextRef: CoachContextRef.nullable().optional(),
  model: z.string().nullable().optional(),
  tokensUsed: z.number().int().nullable().optional(),
});

export type CoachHistoryItem = z.infer<typeof CoachHistoryItem>;

// v1.1 - Suggestions Inbox
export const SuggestionStatus = z.enum(["open", "applied", "dismissed"]);
export type SuggestionStatus = z.infer<typeof SuggestionStatus>;

export const CoachSuggestionRecord = z.object({
  id: z.string(),
  userId: z.string(),
  status: SuggestionStatus,
  sourceIntent: CoachIntent,
  title: z.string(),
  reason: z.string().nullable().optional(),
  severity: z.enum(["info", "warn", "critical"]).default("info"),
  actionType: z.enum(["insert_text", "add_checklist_item", "open_next_step", "none"]).default("none"),
  payload: z.record(z.any()).nullable().optional(),
  contextRef: CoachContextRef.nullable().optional(),
  createdAt: z.string(),
  appliedAt: z.string().nullable().optional(),
  dismissedAt: z.string().nullable().optional(),
});
export type CoachSuggestionRecord = z.infer<typeof CoachSuggestionRecord>;

export const GetSuggestionsQuery = z.object({
  status: SuggestionStatus.optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});
export type GetSuggestionsQuery = z.infer<typeof GetSuggestionsQuery>;

export const ApplySuggestionRequest = z.object({
  appliedPayload: z.record(z.any()).optional(),
});
export type ApplySuggestionRequest = z.infer<typeof ApplySuggestionRequest>;

export const ApplySuggestionResponse = z.object({
  ok: z.boolean(),
  id: z.string(),
  status: SuggestionStatus,
});
export type ApplySuggestionResponse = z.infer<typeof ApplySuggestionResponse>;
