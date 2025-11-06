import { z } from "zod";
import { LoyaltyPayload } from "../../../shared/integrations/types.js";

export const LoyaltyEvent = z.object({
  type: z.enum(["loyalty.points.added", "loyalty.points.redeemed", "loyalty.adjustment"]),
  data: LoyaltyPayload
});
export type LoyaltyEvent = z.infer<typeof LoyaltyEvent>;

export async function handleLoyaltyEvent(evt: LoyaltyEvent) {
  return { ok: true, applied: evt.data.deltaPoints };
}
