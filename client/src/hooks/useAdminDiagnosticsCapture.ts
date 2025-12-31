import { useEffect, useRef } from "react";
import { apiRequest } from "@/lib/queryClient";

type DiagEvent = {
  ts: string;
  type: string;
  message?: string;
  url?: string;
  method?: string;
  status?: number;
  detail?: any;
};

const FLUSH_INTERVAL_MS = 10_000;
const MAX_BUFFER = 50;

let buffer: DiagEvent[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

function pushEvent(evt: Omit<DiagEvent, "ts">) {
  buffer.push({ ts: new Date().toISOString(), ...evt });
  if (buffer.length > MAX_BUFFER) buffer.shift();
}

async function flushEvents() {
  if (buffer.length === 0) return;
  const toSend = buffer.slice();
  buffer = [];
  try {
    await apiRequest("POST", "/api/admin/diagnostics", { events: toSend });
  } catch {
    buffer = toSend.concat(buffer).slice(-MAX_BUFFER);
  }
}

function startCapture() {
  if (flushTimer) return;

  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const url = typeof args[0] === "string" ? args[0] : (args[0] as Request)?.url || "";
    const method = (args[1]?.method || "GET").toUpperCase();
    try {
      const res = await originalFetch.apply(this, args);
      if (!res.ok && url.startsWith("/api")) {
        pushEvent({ type: "api_error", url, method, status: res.status });
      }
      return res;
    } catch (err: any) {
      pushEvent({ type: "fetch_error", url, method, message: err?.message });
      throw err;
    }
  };

  window.addEventListener("error", (e) => {
    pushEvent({ type: "js_error", message: e.message, url: e.filename, detail: { line: e.lineno, col: e.colno } });
  });

  window.addEventListener("unhandledrejection", (e) => {
    pushEvent({ type: "unhandled_rejection", message: String(e.reason) });
  });

  flushTimer = setInterval(flushEvents, FLUSH_INTERVAL_MS);
}

export function useAdminDiagnosticsCapture() {
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    startCapture();
    return () => {
      flushEvents();
    };
  }, []);
}
