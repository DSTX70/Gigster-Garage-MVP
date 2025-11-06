import { z } from "zod";

export const EventEnvelope = z.object({
  id: z.string(),
  source: z.enum(["icadence", "rfp", "loyalty"]),
  type: z.string(),
  timestamp: z.string(),
  payload: z.unknown(),
  signature: z.string().optional()
});
export type EventEnvelope = z.infer<typeof EventEnvelope>;

export const ICadencePayload = z.object({
  profileId: z.string(),
  platform: z.enum(["x", "instagram", "tiktok", "linkedin", "facebook", "youtube"]),
  scheduledAt: z.string(),
  content: z.object({
    text: z.string().max(2800),
    mediaUrls: z.array(z.string().url()).optional()
  })
});

export const RfpPayload = z.object({
  rfpId: z.string(),
  client: z.string(),
  dueDate: z.string(),
  scope: z.string(),
  budgetRange: z.string().optional(),
  attachments: z.array(z.string().url()).optional()
});

export const LoyaltyPayload = z.object({
  userId: z.string(),
  deltaPoints: z.number(),
  reason: z.enum(["payment", "referral", "milestone", "adjustment"]),
  metadata: z.record(z.any()).optional()
});
