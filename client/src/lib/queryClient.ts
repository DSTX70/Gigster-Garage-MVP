import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Simple URL resolution - uses relative paths for same-origin requests
const resolveUrl = (path: string): string => {
  if (!path) throw new Error("apiRequest: empty path");
  // If already absolute URL, use as-is
  if (/^https?:\/\//i.test(path)) return path;
  // Otherwise use relative path (Vite serves backend on same port)
  return path;
};

// Safe JSON stringify (handles BigInt by stringifying it)
const safeStringify = (value: unknown): string => {
  try {
    return JSON.stringify(value, (_, v) => (typeof v === "bigint" ? v.toString() : v));
  } catch (e: any) {
    throw new Error(`apiRequest: JSON serialization failed: ${e?.message || String(e)}`);
  }
};

export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiRequest<T = unknown>(
  method: ApiMethod,
  path: string,
  body?: unknown,
  init?: RequestInit
): Promise<T> {
  const url = resolveUrl(path);
  const hasBody = body !== undefined && method !== "GET";
  const serialized = hasBody ? safeStringify(body) : undefined;

  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers || {})
    },
    body: serialized,
    ...init
  });

  const contentType = res.headers.get("content-type") || "";
  let parsed: any = null;
  try {
    parsed = contentType.includes("application/json") ? await res.json() : await res.text();
  } catch {
    // Ignore parse error; keep parsed=null so we can surface status text
  }

  if (!res.ok) {
    const serverMsg =
      (parsed && typeof parsed === "object" && (parsed.error?.message || parsed.message)) ||
      (typeof parsed === "string" ? parsed : res.statusText);

    throw new Error(`HTTP ${res.status} ${res.statusText}: ${serverMsg || "Request failed"}`);
  }

  return parsed as T;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
