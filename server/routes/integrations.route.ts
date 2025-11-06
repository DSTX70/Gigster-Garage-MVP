import type { Request, Response, Express } from "express";
import { featureFlags } from "../config/featureFlags.js";
import { EventEnvelope } from "../../shared/integrations/types.js";
import { ICadenceEvent, handleICadenceEvent, verifyICadenceSignature } from "../integrations/icadence/adapter.js";
import { RfpEvent, handleRfpEvent } from "../integrations/rfp/adapter.js";
import { LoyaltyEvent, handleLoyaltyEvent } from "../integrations/loyalty/adapter.js";

export function mountIntegrationRoutes(app: Express) {
  app.post("/api/integrations/:partner/webhook", async (req: Request, res: Response) => {
    const partner = req.params.partner as "icadence" | "rfp" | "loyalty";
    const parse = EventEnvelope.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: "bad_envelope", details: parse.error.flatten() });
    }

    const flagMapping = {
      icadence: featureFlags.integrations.icadence,
      rfp: featureFlags.integrations.rfpResponder,
      loyalty: featureFlags.integrations.loyaltyRewards
    };

    if (!flagMapping[partner]) {
      return res.status(404).json({ error: "integration_disabled" });
    }

    const { type, payload, signature } = {
      type: (parse.data.type || ""),
      payload: parse.data.payload,
      signature: parse.data.signature
    } as any;

    try {
      if (partner === "icadence") {
        if (!verifyICadenceSignature(JSON.stringify(req.body), signature)) {
          return res.status(401).json({ error: "bad_signature" });
        }
        const event = ICadenceEvent.parse({ type, data: payload });
        const result = await handleICadenceEvent(event);
        return res.json(result);
      }
      if (partner === "rfp") {
        const event = RfpEvent.parse({ type, data: payload });
        const result = await handleRfpEvent(event);
        return res.json(result);
      }
      if (partner === "loyalty") {
        const event = LoyaltyEvent.parse({ type, data: payload });
        const result = await handleLoyaltyEvent(event);
        return res.json(result);
      }
      return res.status(404).json({ error: "unknown_partner" });
    } catch (e: any) {
      return res.status(400).json({ error: "bad_payload", message: e.message });
    }
  });

  app.get("/api/integrations/status", (_req: Request, res: Response) => {
    res.json({ integrations: featureFlags.integrations });
  });
}
