export type TierFeature = { 
  key: string; 
  name: string; 
  notes?: string; 
  source?: string 
};

export type ExpansionPack = { 
  slug: string; 
  label: string; 
  features: TierFeature[]; 
  pricing_hint?: string 
};

export type FeatureTiers = { 
  version: string; 
  updated: string; 
  tiers: { 
    core: {
      label: string;
      features: TierFeature[]
    }, 
    expansion_packs: ExpansionPack[], 
    partner_delegated: { 
      label: string; 
      integrations: Array<{
        category: string;
        partners: string[];
        events: string[]
      }> 
    } 
  } 
};
