import { useEffect, useRef, useState } from "react";

type AgentStatus = "green" | "amber" | "red";

interface AgentFlags {
  enabled: boolean;
  expose_to_users: boolean;
  external_tool_id: string | null;
  status: AgentStatus;
  updated: string;
}

interface FlagsResponse {
  agents: Record<string, AgentFlags>;
}

const HUB = (import.meta.env.VITE_HUB_BASE_URL?.replace(/\/$/, "") ?? "") as string;
const USE_MOCKS = String(import.meta.env.VITE_USE_MOCKS ?? "false") === "true";
const MOCK_FALLBACK = String(import.meta.env.VITE_MOCK_FALLBACK ?? "true") === "true";
const ADMIN_WRITE = String(import.meta.env.VITE_ADMIN_WRITE ?? "false") === "true";

async function timeoutFetch(url: string, options: RequestInit = {}, ms = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export function useHubFlags(pollMs = 5000) {
  const [data, setData] = useState<FlagsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<number | null>(null);

  const fetchOnce = async () => {
    setLoading(true);
    setError(null);

    if (!USE_MOCKS && HUB) {
      try {
        const res = await timeoutFetch(`${HUB}/flags`, {}, 5000);
        if (res.ok) {
          setData((await res.json()) as FlagsResponse);
          setLoading(false);
          return;
        }
      } catch {
        // fallthrough
      }
    }

    if (MOCK_FALLBACK) {
      try {
        const res2 = await timeoutFetch(`/visibility_flags.json`, {}, 3000);
        if (res2.ok) {
          setData((await res2.json()) as FlagsResponse);
          setLoading(false);
          return;
        }
      } catch {
        // fallthrough
      }
    }

    setError("Hub API unavailable");
    setLoading(false);
  };

  useEffect(() => {
    fetchOnce();
    timerRef.current = window.setInterval(fetchOnce, pollMs);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [pollMs]);

  return { data, loading, error, refresh: fetchOnce };
}

export async function promoteAgentToHub(agentId: string, externalToolId?: string) {
  if (!ADMIN_WRITE) throw new Error("Admin writes disabled (VITE_ADMIN_WRITE not enabled).");
  if (!HUB) throw new Error("Missing VITE_HUB_BASE_URL.");

  const body: Record<string, unknown> = { expose_to_users: true };
  if (externalToolId) body.external_tool_id = externalToolId;

  const res = await fetch(`${HUB}/admin/flags/${encodeURIComponent(agentId)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Promote failed: ${res.status} ${txt}`);
  }
  return (await res.json()) as { ok: boolean };
}

export { ADMIN_WRITE };
export type { AgentFlags, FlagsResponse };
