import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { apiRequest } from '@/lib/queryClient';

// Demo session status interface
interface DemoSession {
  isActive: boolean;
  sessionId: string | null;
  expiresAt: string | null;
  timeRemaining: number; // in seconds
  warningShown: boolean;
}

// Demo context interface
interface DemoContextType {
  isDemoMode: boolean;
  isLoading: boolean;
  demoSession: DemoSession | null;
  timeRemaining: number;
  timeRemainingFormatted: string;
  isExpiringSoon: boolean;
  createDemoSession: () => Promise<void>;
  endDemoSession: () => Promise<void>;
  refreshSessionStatus: () => void;
  dismissWarning: () => void;
}

// Create demo context
const DemoContext = createContext<DemoContextType | undefined>(undefined);

// Demo session API endpoints
const DEMO_ENDPOINTS = {
  CREATE_SESSION: '/api/demo/create-session',
  SESSION_STATUS: '/api/demo/session-status',
  END_SESSION: '/api/demo/end-session',
} as const;

// Time formatting utility
function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Demo mode provider component
export function DemoModeProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [warningDismissed, setWarningDismissed] = useState(false);
  
  // Check if user is in demo mode
  const isDemoMode = isAuthenticated && !!user?.isDemo;
  
  // Query demo session status
  const { data: demoSession, isLoading, refetch } = useQuery({
    queryKey: ['demo-session-status'],
    queryFn: async () => {
      if (!isDemoMode) return null;
      
      const response = await fetch(DEMO_ENDPOINTS.SESSION_STATUS, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch demo session status');
      }
      
      return response.json();
    },
    enabled: isDemoMode,
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: false,
  });

  // Create demo session mutation
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', DEMO_ENDPOINTS.CREATE_SESSION);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demo-session-status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setWarningDismissed(false);
    },
  });

  // End demo session mutation
  const endSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', DEMO_ENDPOINTS.END_SESSION);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demo-session-status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setTimeRemaining(0);
      setWarningDismissed(false);
    },
  });

  // Calculate time remaining from session expiration
  useEffect(() => {
    if (!isDemoMode || !demoSession?.isActive || !demoSession?.expiresAt) {
      setTimeRemaining(0);
      return;
    }

    const updateTimer = () => {
      const expirationTime = new Date(demoSession.expiresAt!).getTime();
      const currentTime = new Date().getTime();
      const remaining = Math.max(0, Math.floor((expirationTime - currentTime) / 1000));
      
      setTimeRemaining(remaining);
      
      // Auto-refresh status when session expires
      if (remaining === 0) {
        refetch();
      }
    };

    // Update immediately
    updateTimer();
    
    // Update every second
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [isDemoMode, demoSession?.isActive, demoSession?.expiresAt, refetch]);

  // Check if session is expiring soon (less than 10 minutes)
  const isExpiringSoon = timeRemaining > 0 && timeRemaining <= 600 && !warningDismissed;

  const contextValue: DemoContextType = {
    isDemoMode,
    isLoading,
    demoSession,
    timeRemaining,
    timeRemainingFormatted: formatTimeRemaining(timeRemaining),
    isExpiringSoon,
    createDemoSession: async () => {
      await createSessionMutation.mutateAsync();
    },
    endDemoSession: async () => {
      await endSessionMutation.mutateAsync();
    },
    refreshSessionStatus: () => {
      refetch();
    },
    dismissWarning: () => {
      setWarningDismissed(true);
    },
  };

  return (
    <DemoContext.Provider value={contextValue}>
      {children}
    </DemoContext.Provider>
  );
}

// Hook to use demo mode context
export function useDemoMode() {
  const context = useContext(DemoContext);
  
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  
  return context;
}

// Utility hook for demo-related API calls
export function useDemoApi() {
  const queryClient = useQueryClient();
  
  const createDemoSession = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', DEMO_ENDPOINTS.CREATE_SESSION);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demo-session-status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
  });

  const endDemoSession = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', DEMO_ENDPOINTS.END_SESSION);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demo-session-status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
  });

  return {
    createDemoSession,
    endDemoSession,
  };
}

// Utility function to check if user is in demo mode (for non-hook usage)
export function isDemoUser(user?: any): boolean {
  return !!user?.isDemo;
}

// Demo mode status checker hook
export function useDemoStatus() {
  const { user } = useAuth();
  const isDemoMode = isDemoUser(user);
  
  return {
    isDemoMode,
    user,
  };
}