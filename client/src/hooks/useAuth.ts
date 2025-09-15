import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

interface AuthResponse {
  user: User;
}

export function useAuth() {
  const { data, isLoading, error } = useQuery<AuthResponse>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const user = data?.user;

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isDemoUser: !!user?.isDemo,
    demoSessionId: user?.demoSessionId,
    sessionExpiresAt: user?.sessionExpiresAt,
    error,
  };
}