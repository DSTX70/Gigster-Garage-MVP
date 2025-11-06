import { z } from "zod";
import { ICadencePayload } from "../../../shared/integrations/types.js";
import { pool } from "../../db.js";
import { validateMediaUrls } from "./validateMedia.js";
import { audit } from "../../lib/audit.js";

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
    case "schedule.posted": {
      const { profileId, platform, scheduledAt, content } = evt.data;
      
      // Validate media URLs before queuing
      await validateMediaUrls(content?.mediaUrls || []);
      
      await pool.query(
        `INSERT INTO social_queue (profile_id, platform, content, scheduled_at, status)
         VALUES ($1, $2, $3, $4, 'queued')`,
        [profileId, platform, JSON.stringify(content), scheduledAt]
      );
      
      await audit.emit("social.queue.enqueued", { platform, profileId, scheduledAt });
      
      return { ok: true, queued: true };
    }
    case "schedule.deleted": {
      const { profileId, scheduledAt } = evt.data;
      await pool.query(
        `UPDATE social_queue SET status = 'cancelled'
         WHERE profile_id = $1 AND scheduled_at = $2 AND status IN ('queued', 'failed', 'paused')`,
        [profileId, scheduledAt]
      );
      
      await audit.emit("social.queue.deleted", { profileId, scheduledAt });
      
      return { ok: true, cancelled: true };
    }
    default:
      return { ok: true };
  }
}
