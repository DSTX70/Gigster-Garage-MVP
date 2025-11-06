import { z } from "zod";
import { RfpPayload } from "../../../shared/integrations/types.js";

export const RfpEvent = z.object({
  type: z.enum(["rfp.requested", "rfp.updated"]),
  data: RfpPayload
});
export type RfpEvent = z.infer<typeof RfpEvent>;

export async function handleRfpEvent(evt: RfpEvent) {
  return { ok: true, proposalDraftCreated: evt.type === "rfp.requested" };
}
