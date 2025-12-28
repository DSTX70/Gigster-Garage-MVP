import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

interface AuthResponse {
  user: User;
}

export function useAuth() {
  const { data, isLoading, isFetching, error } = useQuery<AuthResponse | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user", { credentials: "include" });

      // Treat 401 as "not authenticated" (not an error)
      if (res.status === 401) return null;

      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`Auth check failed (${res.status}): ${text}`);
      }

      return (await res.json()) as AuthResponse;
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 30_000,
    // Only poll if logged in; prevents repeated 401s when logged out
    refetchInterval: (query) => (query.state.data?.user ? 60_000 : false),
  });

  const user = data?.user;
  const authReady = !isLoading && !isFetching;

  return {
    user,
    authReady,
    isLoading,
    isFetching,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isDemoUser: !!user?.isDemo,
    demoSessionId: user?.demoSessionId,
    sessionExpiresAt: user?.sessionExpiresAt,
    error,
  };
}
