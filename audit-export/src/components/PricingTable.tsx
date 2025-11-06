import { useState, useEffect } from "react";
import { loadFeatureTiers, resolvePlanFeatures } from "@/lib/featureTiers";
import { loadFeatureFlags, isEnabled } from "@/lib/featureFlags";
import type { TierFeature, FeatureTiers } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { GigsterLogo } from "@/components/vsuite-logo";

function Check() { 
  return <span className="inline-block w-4 h-4 rounded-full bg-green-500" aria-hidden />; 
}

type PlanKey = "core" | "plus" | "pro";

export default function PricingTable() {
  const [tiers, setTiers] = useState<FeatureTiers | null>(null);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [env, setEnv] = useState<string>("...");

  useEffect(() => {
    // Save original meta values for restoration
    const originalTitle = document.title;
    const metaDescriptionEl = document.querySelector('meta[name="description"]');
    const hadMetaDescription = !!metaDescriptionEl;
    const originalDescription = metaDescriptionEl?.getAttribute('content') || '';
    
    // Track OG tags: save original content for updates, track created tags for removal
    const createdOGTags: Element[] = [];
    const originalOGContent: Map<string, string> = new Map();
    
    const ogTagsData = [
      { property: 'og:title', content: 'Gigster Garage Pricing & Plans' },
      { property: 'og:description', content: 'Smarter tools for bolder dreams - From free Core plan to Pro automation & insights' },
      { property: 'og:type', content: 'website' }
    ];
    
    // Set SEO meta tags
    document.title = "Pricing & Plans | Gigster Garage";
    
    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Choose the perfect plan for your workflow. From $0 for solos to $39 for teams. Task management, time tracking, invoicing, and more. No credit card required.');
    
    // Add/update Open Graph tags
    ogTagsData.forEach(({ property, content }) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        // Tag doesn't exist - create it
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
        createdOGTags.push(tag);
      } else {
        // Tag exists - save original content
        const originalContent = tag.getAttribute('content') || '';
        originalOGContent.set(property, originalContent);
      }
      tag.setAttribute('content', content);
    });

    // Load feature tiers and flags
    (async () => {
      const [t, f] = await Promise.all([
        loadFeatureTiers("/feature_tiers_v1.json"), 
        loadFeatureFlags()
      ]);
      setTiers(t); 
      setFlags(f);
      setEnv(import.meta.env.MODE || "production");
    })();

    // Cleanup: Reset all SEO tags on unmount
    return () => {
      document.title = originalTitle;
      
      // Restore or remove meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        if (hadMetaDescription) {
          // Restore original content (even if empty)
          metaDesc.setAttribute('content', originalDescription);
        } else {
          // Tag didn't exist originally, remove it
          metaDesc.remove();
        }
      }
      
      // Restore original content of updated OG tags
      originalOGContent.forEach((originalContent, property) => {
        const tag = document.querySelector(`meta[property="${property}"]`);
        if (tag) {
          tag.setAttribute('content', originalContent);
        }
      });
      
      // Remove OG tags that were created by this component
      createdOGTags.forEach(tag => tag.remove());
    };
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
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <header className="w-full py-4 px-6 border-b" style={{ background: 'var(--garage-navy)' }}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <GigsterLogo size="small" showText={false} />
              <div>
                <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  Gigster Garage
                </h1>
                <p className="text-xs" style={{ color: 'rgba(255, 181, 46, 0.9)' }}>
                  Simplified Workflow Hub
                </p>
              </div>
            </div>
          </Link>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10" data-testid="button-login">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-white text-[var(--garage-navy)] hover:bg-gray-100" data-testid="button-signup">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Pricing Content */}
      <section className="w-full max-w-6xl mx-auto p-6">
        <header className="mb-6">
          <h2 className="text-2xl font-bold">Plans & Features</h2>
          {import.meta.env.DEV && (
            <p className="text-xs text-gray-400">
              Environment: <span className="font-mono">{env}</span>
            </p>
          )}
        </header>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {plans.map(p => (
          <div key={p.key} className="rounded-2xl border p-4 flex flex-col">
            <h3 className="text-xl font-semibold">{p.title}</h3>
            <div className="text-2xl mt-1">{p.price}</div>
            <p className="text-sm text-gray-600 mt-1 flex-1">{p.blurb}</p>
            <Link href="/signup">
              <Button className="w-full mt-4" data-testid={`button-signup-${p.key}`}>
                Get Started with {p.title}
              </Button>
            </Link>
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
    </div>
  );
}
