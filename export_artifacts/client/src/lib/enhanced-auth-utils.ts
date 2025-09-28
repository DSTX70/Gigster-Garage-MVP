import React from 'react';
import { queryClient, apiRequest } from "@/lib/queryClient";

// Enhanced authentication error types
export interface AuthError {
  message: string;
  code: string;
  statusCode: number;
  details?: any;
  requiredPermission?: string;
  retryAfter?: number;
}

// Authentication error codes
export const AUTH_ERROR_CODES = {
  NO_SESSION: 'NO_SESSION',
  INVALID_SESSION: 'INVALID_SESSION',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  ONBOARDING_REQUIRED: 'ONBOARDING_REQUIRED',
  NO_AUTH: 'NO_AUTH',
  ADMIN_REQUIRED: 'ADMIN_REQUIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  RATE_LIMITED: 'RATE_LIMITED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  INTERNAL_AUTH_ERROR: 'INTERNAL_AUTH_ERROR'
} as const;

// Enhanced error handling for authentication
export function handleAuthenticationError(error: any): {
  message: string;
  shouldRedirectToLogin: boolean;
  shouldShowToast: boolean;
  toastVariant: 'default' | 'destructive';
  retryAfter?: number;
} {
  // Parse API error
  let authError: AuthError;
  
  if (error.message && error.message.includes(':')) {
    const [statusCode, errorBody] = error.message.split(': ', 2);
    try {
      const parsedError = JSON.parse(errorBody);
      authError = {
        statusCode: parseInt(statusCode),
        message: parsedError.message || 'Authentication error',
        code: parsedError.code || 'UNKNOWN_AUTH_ERROR',
        details: parsedError.details,
        requiredPermission: parsedError.requiredPermission,
        retryAfter: parsedError.retryAfter
      };
    } catch {
      authError = {
        statusCode: parseInt(statusCode) || 401,
        message: errorBody || 'Authentication error',
        code: 'PARSE_ERROR'
      };
    }
  } else {
    authError = {
      statusCode: 401,
      message: error.message || 'Authentication error',
      code: 'UNKNOWN_AUTH_ERROR'
    };
  }

  switch (authError.code) {
    case AUTH_ERROR_CODES.NO_SESSION:
    case AUTH_ERROR_CODES.INVALID_SESSION:
    case AUTH_ERROR_CODES.SESSION_EXPIRED:
      return {
        message: getAuthErrorMessage(authError.code),
        shouldRedirectToLogin: true,
        shouldShowToast: true,
        toastVariant: 'default'
      };

    case AUTH_ERROR_CODES.ONBOARDING_REQUIRED:
      return {
        message: 'Please complete your account setup to continue.',
        shouldRedirectToLogin: false,
        shouldShowToast: true,
        toastVariant: 'default'
      };

    case AUTH_ERROR_CODES.ADMIN_REQUIRED:
      return {
        message: 'Administrator privileges required for this action.',
        shouldRedirectToLogin: false,
        shouldShowToast: true,
        toastVariant: 'destructive'
      };

    case AUTH_ERROR_CODES.INSUFFICIENT_PERMISSIONS:
      return {
        message: authError.requiredPermission 
          ? `Missing permission: ${authError.requiredPermission}` 
          : 'You don\'t have permission to perform this action.',
        shouldRedirectToLogin: false,
        shouldShowToast: true,
        toastVariant: 'destructive'
      };

    case AUTH_ERROR_CODES.RATE_LIMITED:
      return {
        message: authError.message,
        shouldRedirectToLogin: false,
        shouldShowToast: true,
        toastVariant: 'destructive',
        retryAfter: authError.retryAfter
      };

    case AUTH_ERROR_CODES.INVALID_CREDENTIALS:
      return {
        message: 'Invalid username or password. Please try again.',
        shouldRedirectToLogin: false,
        shouldShowToast: true,
        toastVariant: 'destructive'
      };

    case AUTH_ERROR_CODES.ACCOUNT_LOCKED:
      return {
        message: 'Account temporarily locked due to too many failed attempts.',
        shouldRedirectToLogin: false,
        shouldShowToast: true,
        toastVariant: 'destructive'
      };

    default:
      return {
        message: authError.message || 'Authentication error occurred.',
        shouldRedirectToLogin: authError.statusCode === 401,
        shouldShowToast: true,
        toastVariant: 'destructive'
      };
  }
}

// Get user-friendly error messages
function getAuthErrorMessage(code: string): string {
  switch (code) {
    case AUTH_ERROR_CODES.NO_SESSION:
      return 'Please log in to continue.';
    case AUTH_ERROR_CODES.INVALID_SESSION:
      return 'Your session is invalid. Please log in again.';
    case AUTH_ERROR_CODES.SESSION_EXPIRED:
      return 'Your session has expired. Please log in again.';
    case AUTH_ERROR_CODES.ONBOARDING_REQUIRED:
      return 'Please complete your account setup to continue.';
    case AUTH_ERROR_CODES.NO_AUTH:
      return 'Authentication required to access this resource.';
    case AUTH_ERROR_CODES.ADMIN_REQUIRED:
      return 'Administrator privileges required.';
    case AUTH_ERROR_CODES.INSUFFICIENT_PERMISSIONS:
      return 'You don\'t have permission to perform this action.';
    case AUTH_ERROR_CODES.RATE_LIMITED:
      return 'Too many attempts. Please wait before trying again.';
    case AUTH_ERROR_CODES.INVALID_CREDENTIALS:
      return 'Invalid username or password.';
    case AUTH_ERROR_CODES.ACCOUNT_LOCKED:
      return 'Account temporarily locked due to failed attempts.';
    default:
      return 'Authentication error occurred.';
  }
}

// Enhanced API request wrapper with auth error handling
export async function authenticatedApiRequest(
  method: string,
  url: string,
  data?: unknown,
  options: {
    showToast?: boolean;
    redirectOnAuth?: boolean;
  } = {}
): Promise<Response> {
  try {
    return await apiRequest(method, url, data);
  } catch (error) {
    const authResult = handleAuthenticationError(error);
    
    // Handle redirection
    if (authResult.shouldRedirectToLogin && options.redirectOnAuth) {
      // Clear authentication cache
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Redirect to login
      window.location.href = '/login?error=session_expired';
    }

    throw error;
  }
}

// Session management utilities
export class SessionManager {
  private static readonly SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private static readonly WARNING_THRESHOLD = 10 * 60 * 1000; // 10 minutes before expiry
  
  private static warningShown = false;
  private static checkInterval: NodeJS.Timeout | null = null;

  static startSessionMonitoring() {
    if (this.checkInterval) return;

    this.checkInterval = setInterval(async () => {
      await this.checkSessionStatus();
    }, this.SESSION_CHECK_INTERVAL);
  }

  static stopSessionMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.warningShown = false;
  }

  private static async checkSessionStatus() {
    try {
      const response = await fetch('/api/auth/session-status', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          this.handleSessionExpiry();
        }
        return;
      }

      const data = await response.json();
      
      if (data.expiresIn && data.expiresIn < this.WARNING_THRESHOLD) {
        this.showSessionWarning(data.expiresIn);
      }
    } catch (error) {
      console.warn('Session check failed:', error);
    }
  }

  private static showSessionWarning(expiresIn: number) {
    if (this.warningShown) return;
    
    this.warningShown = true;
    const minutes = Math.ceil(expiresIn / 60000);
    
    console.log(`Session expiring in ${minutes} minutes`);
    // Toast notification would be shown here in a real implementation
  }

  private static handleSessionExpiry() {
    queryClient.setQueryData(["/api/auth/user"], null);
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    
    console.log('Session expired');
    // Toast notification would be shown here

    // Redirect after a brief delay
    setTimeout(() => {
      window.location.href = '/login?error=session_expired';
    }, 2000);
  }

  static async extendSession(): Promise<boolean> {
    try {
      const response = await apiRequest('POST', '/api/auth/extend-session');
      if (response.ok) {
        this.warningShown = false;
        return true;
      }
    } catch (error) {
      console.error('Failed to extend session:', error);
    }
    return false;
  }
}

// Permission checking utilities
export async function checkPermission(permission: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/auth/check-permission?permission=${encodeURIComponent(permission)}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.hasPermission || false;
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
}

// React hook for permission checking
export function usePermission(permission: string) {
  const [hasPermission, setHasPermission] = React.useState<boolean | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    checkPermission(permission).then(result => {
      setHasPermission(result);
      setIsLoading(false);
    });
  }, [permission]);

  return { hasPermission, isLoading };
}

// Auth utilities for components
export function withAuthGuard<T extends Record<string, any>>(
  WrappedComponent: React.ComponentType<T>,
  requiredPermission?: string
) {
  return function AuthGuardedComponent(props: T) {
    const { hasPermission, isLoading } = usePermission(requiredPermission || '');
    
    if (requiredPermission && isLoading) {
      return React.createElement('div', { className: 'flex items-center justify-center p-8' }, 
        React.createElement('div', { className: 'animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600' })
      );
    }

    if (requiredPermission && !hasPermission) {
      return React.createElement('div', { className: 'text-center p-8' },
        React.createElement('div', { className: 'text-gray-500 mb-2' }, 'Access Denied'),
        React.createElement('p', { className: 'text-sm text-gray-400' }, 
          'You don\'t have permission to view this content.'
        )
      );
    }

    return React.createElement(WrappedComponent, props);
  };
}

// Enhanced auth error handling middleware
export function handleAuthError(error: any): string {
  const authResult = handleAuthenticationError(error);
  return authResult.message;
}