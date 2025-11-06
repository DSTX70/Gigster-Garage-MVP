export const featureFlags = {
  integrations: {
    icadence: process.env.FEATURE_ICADENCE === "true",
    rfpResponder: process.env.FEATURE_RFP_RESPONDER === "true",
    loyaltyRewards: process.env.FEATURE_LOYALTY_REWARDS === "true",
  },
} as const;
