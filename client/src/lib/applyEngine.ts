export type ApplyPayload =
  | { type: "insert_text"; payload: { target: string; text: string; mode?: "append" | "insert" } }
  | { type: "append_text"; payload: { target: string; text: string } }
  | { type: "replace_text"; payload: { target: string; text: string; requireConfirm?: true } }
  | { type: "add_line_item"; payload: { target: "invoice.lineItems"; item: { description: string; quantity: number; unitPriceCents: number } } };

const ALLOWED_TARGETS = new Set([
  "invoice.terms",
  "invoice.notes",
  "invoice.lineItems",
  "proposal.scope",
  "proposal.terms",
  "proposal.deliverables",
  "proposal.outline",
  "message.subject",
  "message.body",
  "service.description",
]);

export function applyPayloadToDraft<TDraft extends Record<string, any>>(
  draft: TDraft,
  apply: ApplyPayload,
  opts?: { confirmReplace?: boolean }
): TDraft {
  const target = (apply as any).payload?.target;
  if (target && !ALLOWED_TARGETS.has(target)) {
    throw new Error(`Blocked apply target: ${target}`);
  }

  const map: Record<string, (d: Record<string, any>) => { get(): any; set(v: any): void }> = {
    "invoice.terms": (d) => ({ get: () => d.invoice?.terms ?? "", set: (v) => { d.invoice = { ...d.invoice, terms: v }; } }),
    "invoice.notes": (d) => ({ get: () => d.invoice?.notes ?? "", set: (v) => { d.invoice = { ...d.invoice, notes: v }; } }),
    "invoice.lineItems": (d) => ({ get: () => d.invoice?.lineItems ?? [], set: (v) => { d.invoice = { ...d.invoice, lineItems: v }; } }),
    "proposal.scope": (d) => ({ get: () => d.proposal?.scope ?? "", set: (v) => { d.proposal = { ...d.proposal, scope: v }; } }),
    "proposal.terms": (d) => ({ get: () => d.proposal?.terms ?? "", set: (v) => { d.proposal = { ...d.proposal, terms: v }; } }),
    "proposal.deliverables": (d) => ({ get: () => d.proposal?.deliverables ?? "", set: (v) => { d.proposal = { ...d.proposal, deliverables: v }; } }),
    "proposal.outline": (d) => ({ get: () => d.proposal?.outline ?? "", set: (v) => { d.proposal = { ...d.proposal, outline: v }; } }),
    "message.subject": (d) => ({ get: () => d.message?.subject ?? "", set: (v) => { d.message = { ...d.message, subject: v }; } }),
    "message.body": (d) => ({ get: () => d.message?.body ?? "", set: (v) => { d.message = { ...d.message, body: v }; } }),
    "service.description": (d) => ({ get: () => d.service?.description ?? "", set: (v) => { d.service = { ...d.service, description: v }; } }),
  };

  const accessor = map[target];
  if (!accessor) throw new Error(`No draft field mapping for target: ${target}`);

  if (apply.type === "append_text") {
    const cur = String(accessor(draft).get() ?? "");
    const next = cur + String(apply.payload.text ?? "");
    accessor(draft).set(next);
    return draft;
  }

  if (apply.type === "insert_text") {
    const cur = String(accessor(draft).get() ?? "");
    const next = cur + String(apply.payload.text ?? "");
    accessor(draft).set(next);
    return draft;
  }

  if (apply.type === "replace_text") {
    if (!opts?.confirmReplace) {
      throw new Error("Replace requires confirmReplace=true");
    }
    accessor(draft).set(String(apply.payload.text ?? ""));
    return draft;
  }

  if (apply.type === "add_line_item") {
    const cur = accessor(draft).get();
    if (!Array.isArray(cur)) throw new Error("invoice.lineItems draft field is not an array");
    accessor(draft).set([
      ...cur,
      {
        description: apply.payload.item.description,
        quantity: apply.payload.item.quantity,
        unitPriceCents: apply.payload.item.unitPriceCents,
      },
    ]);
    return draft;
  }

  return draft;
}
