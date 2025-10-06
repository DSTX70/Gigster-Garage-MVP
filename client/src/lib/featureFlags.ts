export type FeatureFlags = Record<string, boolean>;

export function inferEnv(): "staging" | "prod" { 
  const val = (typeof window !== "undefined" 
    ? import.meta.env.VITE_APP_ENV 
    : process.env.NODE_ENV) || "prod"; 
  return String(val).toLowerCase().includes("stag") ? "staging" : "prod"; 
}

export async function loadFeatureFlags(env: "staging" | "prod" = inferEnv()): Promise<FeatureFlags> {
  // Runtime override for testing
  const rt = typeof window !== "undefined" 
    ? (window as any).__GG_FLAGS as FeatureFlags | undefined 
    : undefined;
  if (rt) return rt;
  
  const path = env === "staging" 
    ? "/config/flags/feature-flags.staging.json" 
    : "/config/flags/feature-flags.prod.json";
  
  try { 
    const res = await fetch(path, { cache: "no-store" }); 
    if (!res.ok) throw new Error(`Flags not found at ${path}`); 
    return await res.json() as FeatureFlags; 
  } catch { 
    return {}; 
  }
}

export const isEnabled = (flags: FeatureFlags, key: string) => flags[key] !== false;
