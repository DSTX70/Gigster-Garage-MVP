// FILE: shared/contracts/applyEngine.ts
import { z } from "zod";

export const ApplyTarget = z.enum([
  "invoice.terms",
  "invoice.notes",
  "invoice.lineItems",
  "proposal.scope",
  "proposal.terms",
  "proposal.outline",
  "message.subject",
  "message.body",
  "service.description",
]);

export type ApplyTarget = z.infer<typeof ApplyTarget>;

export const ApplyActionType = z.enum([
  "insert_text",
  "append_text",
  "replace_text",
  "add_line_item",
]);

export type ApplyActionType = z.infer<typeof ApplyActionType>;

export const InsertTextPayload = z.object({
  target: ApplyTarget,
  text: z.string().min(1).max(10_000),
  mode: z.enum(["append", "insert"]).default("append"),
});

export const AppendTextPayload = z.object({
  target: ApplyTarget,
  text: z.string().min(1).max(10_000),
});

export const ReplaceTextPayload = z.object({
  target: ApplyTarget,
  text: z.string().min(1).max(20_000),
  requireConfirm: z.literal(true).default(true),
});

export const AddLineItemPayload = z.object({
  target: z.literal("invoice.lineItems"),
  item: z.object({
    description: z.string().min(1).max(300),
    quantity: z.number().min(1).max(999).default(1),
    unitPriceCents: z.number().int().min(0).max(100_000_000),
  }),
});

export const ApplyPayload = z.discriminatedUnion("type", [
  z.object({ type: z.literal("insert_text"), payload: InsertTextPayload }),
  z.object({ type: z.literal("append_text"), payload: AppendTextPayload }),
  z.object({ type: z.literal("replace_text"), payload: ReplaceTextPayload }),
  z.object({ type: z.literal("add_line_item"), payload: AddLineItemPayload }),
]);

export type ApplyPayload = z.infer<typeof ApplyPayload>;

export const ApplySuggestionExecuteRequest = z.object({
  apply: ApplyPayload,
  context: z.record(z.any()).optional(),
});

export type ApplySuggestionExecuteRequest = z.infer<typeof ApplySuggestionExecuteRequest>;

export const ApplySuggestionExecuteResponse = z.object({
  ok: z.boolean(),
  suggestionId: z.string(),
  status: z.enum(["applied"]),
});

export type ApplySuggestionExecuteResponse = z.infer<typeof ApplySuggestionExecuteResponse>;
