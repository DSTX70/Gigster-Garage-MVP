import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Enhanced request interface with user data
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    name: string;
    email: string;
    role: string;
    hasCompletedOnboarding: boolean;
    lastActivity?: string;
  };
  sessionInfo?: {
    id: string;
    createdAt: string;
    lastAccess: string;
    ipAddress: string;
    userAgent: string;
  };
}

// Authentication error types
export class AuthenticationError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode: number = 401, code: string = 'AUTH_ERROR', details?: any) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class AuthorizationError extends Error {
  public statusCode: number;
  public code: string;
  public requiredPermission?: string;

  constructor(message: string, statusCode: number = 403, code: string = 'AUTH_FORBIDDEN', requiredPermission?: string) {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = statusCode;
    this.code = code;
    this.requiredPermission = requiredPermission;
  }
}

// Session validation schema
const sessionSchema = z.object({
  user: z.object({
    id: z.string(),
    username: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.string(),
    hasCompletedOnboarding: z.boolean(),
  }),
  createdAt: z.string().optional(),
  lastActivity: z.string().optional(),
});

// Extend session interface
declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      username: string;
      name: string;
      email: string;
      role: string;
      hasCompletedOnboarding: boolean;
    };
    createdAt?: string;
    lastActivity?: string;
  }
}

// Enhanced authentication middleware with comprehensive error handling
export function enhancedRequireAuth(options: {
  allowInactive?: boolean;
  requireOnboarding?: boolean;
  sessionTimeout?: number; // in minutes
} = {}) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Check if session exists
      if (!req.session || !req.session.user) {
        throw new AuthenticationError(
          'Authentication required. Please log in to access this resource.',
          401,
          'NO_SESSION'
        );
      }

      // Validate session structure
      const validationResult = sessionSchema.safeParse(req.session);
      if (!validationResult.success) {
        console.error('Invalid session structure:', validationResult.error);
        req.session.destroy(() => {});
        throw new AuthenticationError(
          'Invalid session. Please log in again.',
          401,
          'INVALID_SESSION'
        );
      }

      const { user } = validationResult.data;

      // Check session timeout
      if (options.sessionTimeout) {
        const lastActivity = req.session.lastActivity || req.session.createdAt;
        if (lastActivity) {
          const timeSinceActivity = Date.now() - new Date(lastActivity).getTime();
          const timeoutMs = options.sessionTimeout * 60 * 1000;
          
          if (timeSinceActivity > timeoutMs) {
            req.session.destroy(() => {});
            throw new AuthenticationError(
              'Session expired. Please log in again.',
              401,
              'SESSION_EXPIRED'
            );
          }
        }
      }

      // Check onboarding requirement
      if (options.requireOnboarding && !user.hasCompletedOnboarding) {
        throw new AuthenticationError(
          'Onboarding must be completed to access this resource.',
          403,
          'ONBOARDING_REQUIRED'
        );
      }

      // Attach user to request
      req.user = user;

      // Create session info
      req.sessionInfo = {
        id: req.sessionID,
        createdAt: req.session.createdAt || new Date().toISOString(),
        lastAccess: new Date().toISOString(),
        ipAddress: (req.ip || req.connection.remoteAddress || 'unknown'),
        userAgent: req.get('User-Agent') || 'unknown'
      };

      // Update session activity
      req.session.lastActivity = new Date().toISOString();

      next();
    } catch (error) {
      handleAuthError(error, req, res);
    }
  };
}

// Enhanced admin requirement middleware
export function enhancedRequireAdmin(options: {
  allowSuperAdmin?: boolean;
} = {}) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // First ensure authentication
      if (!req.user) {
        throw new AuthenticationError(
          'Authentication required for admin access.',
          401,
          'NO_AUTH'
        );
      }

      // Check admin role
      const isAdmin = req.user.role === 'admin';
      const isSuperAdmin = options.allowSuperAdmin && req.user.role === 'super_admin';

      if (!isAdmin && !isSuperAdmin) {
        throw new AuthorizationError(
          'Administrator privileges required to access this resource.',
          403,
          'ADMIN_REQUIRED',
          'admin'
        );
      }

      next();
    } catch (error) {
      handleAuthError(error, req, res);
    }
  };
}

// Permission-based authorization middleware
export function requirePermission(permission: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AuthenticationError(
          'Authentication required.',
          401,
          'NO_AUTH'
        );
      }

      // For now, implement basic permission check
      // This would integrate with your PermissionsService
      const hasPermission = await checkUserPermission(req.user.id, permission);
      
      if (!hasPermission) {
        throw new AuthorizationError(
          `Insufficient permissions. Required: ${permission}`,
          403,
          'INSUFFICIENT_PERMISSIONS',
          permission
        );
      }

      next();
    } catch (error) {
      handleAuthError(error, req, res);
    }
  };
}

// Rate limiting middleware for authentication endpoints
const authAttempts = new Map<string, { count: number; lastAttempt: number; blocked: number }>();

export function authRateLimit(options: {
  maxAttempts?: number;
  windowMs?: number;
  blockDurationMs?: number;
} = {}) {
  const maxAttempts = options.maxAttempts || 5;
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
  const blockDurationMs = options.blockDurationMs || 30 * 60 * 1000; // 30 minutes

  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    let attempts = authAttempts.get(identifier);
    
    if (!attempts) {
      attempts = { count: 0, lastAttempt: now, blocked: 0 };
    }

    // Check if currently blocked
    if (attempts.blocked && (now - attempts.blocked) < blockDurationMs) {
      const remainingTime = Math.ceil((blockDurationMs - (now - attempts.blocked)) / 60000);
      return res.status(429).json({
        message: `Too many authentication attempts. Try again in ${remainingTime} minutes.`,
        code: 'RATE_LIMITED',
        retryAfter: remainingTime
      });
    }

    // Reset block if duration expired
    if (attempts.blocked && (now - attempts.blocked) >= blockDurationMs) {
      attempts.blocked = 0;
      attempts.count = 0;
    }

    // Reset count if window expired
    if ((now - attempts.lastAttempt) > windowMs) {
      attempts.count = 0;
    }

    // Check if max attempts exceeded
    if (attempts.count >= maxAttempts) {
      attempts.blocked = now;
      authAttempts.set(identifier, attempts);
      
      console.warn(`🔒 Rate limit exceeded for ${identifier}. Blocked for ${blockDurationMs / 60000} minutes.`);
      
      return res.status(429).json({
        message: `Too many authentication attempts. Try again in ${blockDurationMs / 60000} minutes.`,
        code: 'RATE_LIMITED',
        retryAfter: blockDurationMs / 60000
      });
    }

    authAttempts.set(identifier, attempts);
    next();
  };
}

// Track failed authentication attempts
export function trackAuthFailure(req: Request) {
  const identifier = req.ip || req.connection.remoteAddress || 'unknown';
  const attempts = authAttempts.get(identifier) || { count: 0, lastAttempt: Date.now(), blocked: 0 };
  
  attempts.count += 1;
  attempts.lastAttempt = Date.now();
  authAttempts.set(identifier, attempts);
}

// Enhanced error handler for authentication errors
export function handleAuthError(error: any, req: AuthenticatedRequest, res: Response) {
  // Log security-relevant errors
  if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
    console.warn(`🔒 Auth Error: ${error.message}`, {
      code: error.code,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    // Track failed attempts for authentication errors
    if (error instanceof AuthenticationError) {
      trackAuthFailure(req);
    }

    return res.status(error.statusCode).json({
      message: error.message,
      code: error.code,
      ...((error as AuthenticationError).details && { details: (error as AuthenticationError).details }),
      ...(error instanceof AuthorizationError && error.requiredPermission && { 
        requiredPermission: error.requiredPermission 
      })
    });
  }

  // Handle unexpected errors
  console.error('Unexpected auth middleware error:', error);
  return res.status(500).json({
    message: 'Internal authentication error occurred.',
    code: 'INTERNAL_AUTH_ERROR'
  });
}

// Session validation utility
export async function validateSession(sessionId: string): Promise<boolean> {
  // This would integrate with your session store
  // For now, return true if session exists
  return true;
}

// User permission checking utility (placeholder)
async function checkUserPermission(userId: string, permission: string): Promise<boolean> {
  // This would integrate with your PermissionsService
  // For now, return true for basic permissions
  const basicPermissions = [
    'tasks.read', 'tasks.create', 'tasks.update',
    'projects.read', 'projects.create',
    'templates.read', 'templates.create'
  ];
  
  return basicPermissions.includes(permission);
}

// Cleanup old authentication attempts
setInterval(() => {
  const now = Date.now();
  const fiveMinutesAgo = now - (5 * 60 * 1000);
  
  Array.from(authAttempts.entries()).forEach(([identifier, attempts]) => {
    if (attempts.lastAttempt < fiveMinutesAgo && !attempts.blocked) {
      authAttempts.delete(identifier);
    }
  });
}, 5 * 60 * 1000); // Run every 5 minutes

// Middleware composition helpers
export const requireAuth = enhancedRequireAuth();
export const requireAuthWithOnboarding = enhancedRequireAuth({ requireOnboarding: true });
export const requireAdmin = [requireAuth, enhancedRequireAdmin()];
export const requireSuperAdmin = [requireAuth, enhancedRequireAdmin({ allowSuperAdmin: true })];

// Export default middleware functions for backward compatibility
export const defaultRequireAuth = (req: any, res: any, next: any) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  req.user = req.session.user;
  next();
};

export const defaultRequireAdmin = (req: any, res: any, next: any) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  req.user = req.session.user;
  next();
};