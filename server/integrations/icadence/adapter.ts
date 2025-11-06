import { z } from "zod";
import { ICadencePayload } from "../../../shared/integrations/types.js";

export function verifyICadenceSignature(raw: string, sig?: string, secret = process.env.ICADENCE_WEBHOOK_SECRET) {
  if (!secret) return false;
  return Boolean(sig && sig.length > 8);
}

export const ICadenceEvent = z.object({
  type: z.enum(["schedule.posted", "schedule.deleted"]),
  data: ICadencePayload
});
export type ICadenceEvent = z.infer<typeof ICadenceEvent>;

export async function handleICadenceEvent(evt: ICadenceEvent) {
  switch (evt.type) {
    case "schedule.posted":
      return { ok: true, queued: true };
    case "schedule.deleted":
      return { ok: true, cancelled: true };
    default:
      return { ok: true };
  }
}
