export type FeatureFlags = Record<string, boolean>;

export function inferEnv(): "staging" | "prod" { 
  // Check for explicit staging flag first, then fallback to NODE_ENV
  const val = (typeof window !== "undefined" 
    ? import.meta.env.MODE 
    : process.env.NODE_ENV) || "production";
  const envStr = String(val).toLowerCase();
  // Treat dev, development, staging, and preview as staging
  return (envStr.includes("dev") || envStr.includes("stag") || envStr.includes("preview")) 
    ? "staging" 
    : "prod"; 
}

export async function loadFeatureFlags(env: "staging" | "prod" = inferEnv()): Promise<FeatureFlags> {
  // Runtime override for testing
  const rt = typeof window !== "undefined" 
    ? (window as any).__GG_FLAGS as FeatureFlags | undefined 
    : undefined;
  if (rt) return rt;
  
  const path = env === "staging" 
    ? "/feature-flags.staging.json" 
    : "/feature-flags.prod.json";
  
  try { 
    const res = await fetch(path, { cache: "no-store" }); 
    if (!res.ok) throw new Error(`Flags not found at ${path}`); 
    return await res.json() as FeatureFlags; 
  } catch { 
    return {}; 
  }
}

export const isEnabled = (flags: FeatureFlags, key: string) => flags[key] !== false;
