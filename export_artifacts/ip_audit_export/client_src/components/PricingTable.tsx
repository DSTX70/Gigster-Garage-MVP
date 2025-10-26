import { useState, useEffect } from "react";
import { loadFeatureTiers, resolvePlanFeatures } from "@/lib/featureTiers";
import { loadFeatureFlags, isEnabled } from "@/lib/featureFlags";
import type { TierFeature, FeatureTiers } from "@/lib/types";

function Check() { 
  return <span className="inline-block w-4 h-4 rounded-full bg-green-500" aria-hidden />; 
}

type PlanKey = "core" | "plus" | "pro";

export default function PricingTable() {
  const [tiers, setTiers] = useState<FeatureTiers | null>(null);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [env, setEnv] = useState<string>("...");

  useEffect(() => {
    (async () => {
      const [t, f] = await Promise.all([
        loadFeatureTiers("/feature_tiers_v1.json"), 
        loadFeatureFlags()
      ]);
      setTiers(t); 
      setFlags(f);
      setEnv(import.meta.env.MODE || "production");
    })();
  }, []);

  if (!tiers) return <div className="p-8">Loading pricing…</div>;

  const plans = [
    { key: "core" as PlanKey, title: "Core", price: "$0–$9", blurb: "Essentials for solos & starters" },
    { key: "plus" as PlanKey, title: "Plus", price: "$19", blurb: "Grow with clients & portal" },
    { key: "pro" as PlanKey, title: "Pro", price: "$39", blurb: "Automation & insights for scale" }
  ];

  const byPlan = Object.fromEntries(
    plans.map(p => [p.key, resolvePlanFeatures(tiers, p.key, flags)])
  ) as Record<PlanKey, { core: TierFeature[]; packs: TierFeature[] }>;

  const all = [
    ...tiers.tiers.core.features,
    ...tiers.tiers.expansion_packs.flatMap(p => p.features)
  ].filter(f => isEnabled(flags, `feature.${f.key}`));

  const includes = (f: TierFeature, plan: PlanKey) => {
    const set = new Set([...byPlan[plan].core, ...byPlan[plan].packs].map(x => x.key));
    return set.has(f.key);
  };

  return (
    <section className="w-full max-w-6xl mx-auto p-6">
      <header className="mb-6">
        <h2 className="text-2xl font-bold">Plans & Features</h2>
        <p className="text-sm text-gray-600">
          Environment: <span className="font-mono">{env}</span>
        </p>
      </header>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {plans.map(p => (
          <div key={p.key} className="rounded-2xl border p-4">
            <h3 className="text-xl font-semibold">{p.title}</h3>
            <div className="text-2xl mt-1">{p.price}</div>
            <p className="text-sm text-gray-600 mt-1">{p.blurb}</p>
          </div>
        ))}
      </div>

      <table className="w-full text-left border-t">
        <thead>
          <tr>
            <th className="py-2 pr-4">Feature</th>
            {plans.map(p => (
              <th key={p.key} className="py-2 text-center">{p.title}</th>
            ))}
            <th className="py-2">Notes</th>
          </tr>
        </thead>
        <tbody>
          {all.map(f => (
            <tr key={f.key} className="border-b last:border-b-0">
              <td className="py-2 pr-4 text-sm font-medium">{f.name}</td>
              {plans.map(p => (
                <td key={p.key} className="py-2 text-center">
                  {includes(f, p.key) ? <Check /> : <span className="text-gray-400">—</span>}
                </td>
              ))}
              <td className="py-2 text-xs text-gray-500">{f.notes || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer className="mt-6 text-xs text-gray-500">
        <p>
          Partner-delegated categories (API): {tiers.tiers.partner_delegated.integrations.map(i => i.category).join(", ")}
        </p>
      </footer>
    </section>
  );
}
