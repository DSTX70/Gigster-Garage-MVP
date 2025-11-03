// Plan tiers and feature entitlements
// This is the single source of truth for what features are available on each plan

export type PlanTier = "free" | "pro" | "enterprise";

export interface PlanFeatures {
  // AI & Automation
  aiMonthlyTokens: number; // Monthly AI request limit
  workflowAutomation: boolean; // Can create workflow automation rules
  aiProposalGeneration: boolean; // Can generate proposals with AI
  
  // Storage & Files
  fileUploadSizeMB: number; // Max file size per upload
  totalStorageGB: number; // Total storage limit
  
  // Team & Collaboration
  maxTeamMembers: number; // Max users in organization
  clientAccess: boolean; // Can share invoices/proposals with clients
  
  // Advanced Features
  advancedReporting: boolean; // Access to advanced reports/exports
  customBranding: boolean; // Custom logos and branding
  prioritySupport: boolean; // Priority customer support
  ssoIntegration: boolean; // SSO/SAML authentication
  
  // Limits
  maxProjectsPerMonth: number; // New projects per month
  maxInvoicesPerMonth: number; // New invoices per month
}

// Feature entitlements by plan tier
export const PLAN_FEATURES: Record<PlanTier, PlanFeatures> = {
  free: {
    aiMonthlyTokens: 10, // 10 AI requests per month
    workflowAutomation: false,
    aiProposalGeneration: false,
    fileUploadSizeMB: 5,
    totalStorageGB: 1,
    maxTeamMembers: 1, // Solo user only
    clientAccess: false,
    advancedReporting: false,
    customBranding: false,
    prioritySupport: false,
    ssoIntegration: false,
    maxProjectsPerMonth: 3,
    maxInvoicesPerMonth: 5,
  },
  pro: {
    aiMonthlyTokens: 100, // 100 AI requests per month
    workflowAutomation: true,
    aiProposalGeneration: true,
    fileUploadSizeMB: 50,
    totalStorageGB: 50,
    maxTeamMembers: 5,
    clientAccess: true,
    advancedReporting: true,
    customBranding: false,
    prioritySupport: false,
    ssoIntegration: false,
    maxProjectsPerMonth: 50,
    maxInvoicesPerMonth: 100,
  },
  enterprise: {
    aiMonthlyTokens: 1000, // 1000 AI requests per month
    workflowAutomation: true,
    aiProposalGeneration: true,
    fileUploadSizeMB: 500,
    totalStorageGB: 500,
    maxTeamMembers: 9999, // Unlimited
    clientAccess: true,
    advancedReporting: true,
    customBranding: true,
    prioritySupport: true,
    ssoIntegration: true,
    maxProjectsPerMonth: 9999, // Unlimited
    maxInvoicesPerMonth: 9999, // Unlimited
  },
};

/**
 * Get feature entitlements for a plan tier
 * Supports feature overrides for custom plans
 */
export function getPlanFeatures(
  plan: PlanTier, 
  overrides?: Record<string, boolean | number>
): PlanFeatures {
  const baseFeatures = PLAN_FEATURES[plan];
  
  if (!overrides) {
    return baseFeatures;
  }
  
  // Merge overrides with base features
  return {
    ...baseFeatures,
    ...overrides,
  } as PlanFeatures;
}

/**
 * Check if a plan has access to a specific feature
 */
export function hasFeatureAccess(
  plan: PlanTier,
  feature: keyof PlanFeatures,
  overrides?: Record<string, boolean | number>
): boolean {
  const features = getPlanFeatures(plan, overrides);
  const value = features[feature];
  
  // For boolean features, return the value directly
  if (typeof value === 'boolean') {
    return value;
  }
  
  // For numeric features, return true if > 0
  return typeof value === 'number' && value > 0;
}

/**
 * Get feature limit for numeric features
 */
export function getFeatureLimit(
  plan: PlanTier,
  feature: keyof PlanFeatures,
  overrides?: Record<string, boolean | number>
): number {
  const features = getPlanFeatures(plan, overrides);
  const value = features[feature];
  
  if (typeof value === 'number') {
    return value;
  }
  
  // For boolean features, return 1 if true, 0 if false
  return value ? 1 : 0;
}

/**
 * Plan display names and descriptions
 */
export const PLAN_METADATA = {
  free: {
    name: "Free",
    description: "Perfect for individuals getting started",
    price: "$0/month",
  },
  pro: {
    name: "Pro",
    description: "For growing teams and businesses",
    price: "$29/month",
  },
  enterprise: {
    name: "Enterprise",
    description: "Advanced features and unlimited usage",
    price: "Custom pricing",
  },
} as const;
