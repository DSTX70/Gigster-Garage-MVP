import type { FeatureTiers, TierFeature, ExpansionPack } from "./types";
export type { FeatureTiers, TierFeature, ExpansionPack };
export async function loadFeatureTiers(path = "/feature_tiers_v1.json"): Promise<FeatureTiers> {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load feature tiers from ${path}`);
  return (await res.json()) as FeatureTiers;
}
export function resolvePlanFeatures(tiers: FeatureTiers, plan: "core"|"plus"|"pro", flags: Record<string, boolean>) {
  const core = tiers.tiers.core.features.map(f => ({ ...f, source: "core" as const }));
  const packs: TierFeature[] = [] as any;
  const add = (slug: string) => { const p = tiers.tiers.expansion_packs.find(x => x.slug === slug); if (p) packs.push(...p.features.map(f => ({ ...f, source: slug as const })) as any); };
  if (plan === "plus") { add("proposals_ai"); add("client_portal"); }
  if (plan === "pro")  { add("proposals_ai"); add("client_portal"); add("analytics_insights"); add("automation_power"); }
  const allowed = (f: TierFeature) => flags[`feature.${f.key}`] !== false;
  return { core: core.filter(allowed), packs: packs.filter(allowed) };
}