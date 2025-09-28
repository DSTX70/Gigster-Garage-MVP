import { storage } from "./storage";
import { seedDemoData, clearDemoData } from "./demoDataService";
import type { User, UpsertUser } from "@shared/schema";

/**
 * Demo Session Management Service
 * 
 * Manages temporary demo user accounts with automatic cleanup:
 * - Creates temporary demo users with 45-minute sessions
 * - Isolates demo data per session
 * - Automatic cleanup of expired sessions
 * - Session extension based on activity
 */

export interface DemoSession {
  id: string;
  userId: string;
  user: User;
  createdAt: Date;
  expiresAt: Date;
  lastActivity: Date;
  isExpired: boolean;
  remainingMinutes: number;
}

export interface CreateDemoSessionResult {
  success: boolean;
  session?: DemoSession;
  user?: User;
  error?: string;
}

export interface DemoSessionStatus {
  isDemo: boolean;
  session?: DemoSession;
  error?: string;
}

// In-memory storage for demo sessions (in production, consider using Redis)
const demoSessions = new Map<string, DemoSession>();
const userIdToSessionId = new Map<string, string>();

// Demo session configuration
const DEMO_SESSION_DURATION_MINUTES = 45;
const ACTIVITY_EXTENSION_MINUTES = 5; // Extend session by 5 minutes on activity
const CLEANUP_INTERVAL_MINUTES = 5; // Clean up every 5 minutes

/**
 * Create a new demo session with temporary user
 */
export async function createDemoSession(): Promise<CreateDemoSessionResult> {
  try {
    const sessionId = generateSessionId();
    const demoUsername = `demo_${sessionId}_${Date.now()}`;
    const demoEmail = `demo_${sessionId}@gigster-garage-demo.local`;
    
    // Create temporary demo user
    const demoUserData: UpsertUser = {
      username: demoUsername,
      password: generateRandomPassword(), // Random password - user won't need it
      email: demoEmail,
      name: `Demo User ${sessionId.slice(0, 8)}`,
      role: "user",
      hasCompletedOnboarding: true, // Skip onboarding for demos
      emailNotifications: false,
      smsNotifications: false,
      emailOptIn: false,
      smsOptIn: false,
      // Demo-specific fields will be added to schema
      isDemo: true,
      demoSessionId: sessionId,
      sessionExpiresAt: new Date(Date.now() + DEMO_SESSION_DURATION_MINUTES * 60 * 1000)
    };

    const demoUser = await storage.createUser(demoUserData);
    
    // Create demo session object
    const now = new Date();
    const expiresAt = new Date(now.getTime() + DEMO_SESSION_DURATION_MINUTES * 60 * 1000);
    
    const session: DemoSession = {
      id: sessionId,
      userId: demoUser.id,
      user: demoUser,
      createdAt: now,
      expiresAt: expiresAt,
      lastActivity: now,
      isExpired: false,
      remainingMinutes: DEMO_SESSION_DURATION_MINUTES
    };

    // Store session in memory
    demoSessions.set(sessionId, session);
    userIdToSessionId.set(demoUser.id, sessionId);

    // Seed demo data for this user with secure isolation
    console.log(`🎮 Creating demo session ${sessionId} for user ${demoUser.id}`);
    await seedDemoData(demoUser.id, sessionId);

    console.log(`✅ Demo session created successfully: ${sessionId} (expires in ${DEMO_SESSION_DURATION_MINUTES} minutes)`);

    return {
      success: true,
      session,
      user: demoUser
    };

  } catch (error: any) {
    console.error("❌ Failed to create demo session:", error);
    return {
      success: false,
      error: error.message || "Failed to create demo session"
    };
  }
}

/**
 * Get demo session status for a user
 */
export async function getDemoSessionStatus(userId: string): Promise<DemoSessionStatus> {
  try {
    const sessionId = userIdToSessionId.get(userId);
    if (!sessionId) {
      return { isDemo: false };
    }

    const session = demoSessions.get(sessionId);
    if (!session) {
      return { isDemo: false };
    }

    // Check if session is expired
    const now = new Date();
    const isExpired = now > session.expiresAt;
    
    if (isExpired) {
      // Clean up expired session
      await cleanupDemoSession(sessionId);
      return { 
        isDemo: true, 
        error: "Demo session has expired" 
      };
    }

    // Update remaining time
    const remainingMs = session.expiresAt.getTime() - now.getTime();
    session.remainingMinutes = Math.max(0, Math.ceil(remainingMs / (60 * 1000)));
    session.isExpired = false;

    return {
      isDemo: true,
      session
    };

  } catch (error: any) {
    console.error("❌ Error checking demo session status:", error);
    return {
      isDemo: false,
      error: error.message || "Error checking demo session status"
    };
  }
}

/**
 * Update last activity and extend session if needed
 */
export async function updateDemoSessionActivity(userId: string): Promise<boolean> {
  try {
    const sessionId = userIdToSessionId.get(userId);
    if (!sessionId) return false;

    const session = demoSessions.get(sessionId);
    if (!session) return false;

    const now = new Date();
    
    // Check if session is already expired
    if (now > session.expiresAt) {
      await cleanupDemoSession(sessionId);
      return false;
    }

    // Update last activity
    session.lastActivity = now;

    // Extend session if it's within the last 10 minutes
    const remainingMs = session.expiresAt.getTime() - now.getTime();
    const remainingMinutes = remainingMs / (60 * 1000);
    
    if (remainingMinutes <= 10) {
      // Extend session by ACTIVITY_EXTENSION_MINUTES
      session.expiresAt = new Date(now.getTime() + ACTIVITY_EXTENSION_MINUTES * 60 * 1000);
      console.log(`⏰ Extended demo session ${sessionId} by ${ACTIVITY_EXTENSION_MINUTES} minutes due to activity`);
    }

    return true;

  } catch (error: any) {
    console.error("❌ Error updating demo session activity:", error);
    return false;
  }
}

/**
 * Manually end a demo session
 */
export async function endDemoSession(userId: string): Promise<boolean> {
  try {
    const sessionId = userIdToSessionId.get(userId);
    if (!sessionId) return false;

    await cleanupDemoSession(sessionId);
    console.log(`🛑 Demo session ${sessionId} ended manually by user ${userId}`);
    return true;

  } catch (error: any) {
    console.error("❌ Error ending demo session:", error);
    return false;
  }
}

/**
 * Check if a user is a demo user
 */
export function isDemoUser(user: User | undefined): boolean {
  if (!user) return false;
  
  // Check if user has demo fields
  return (user as any).isDemo === true || user.username?.startsWith('demo_') || false;
}

/**
 * Get demo session by session ID
 */
export function getDemoSession(sessionId: string): DemoSession | undefined {
  return demoSessions.get(sessionId);
}

/**
 * Get all active demo sessions (for monitoring/debugging)
 */
export function getActiveDemoSessions(): DemoSession[] {
  return Array.from(demoSessions.values()).filter(session => !session.isExpired);
}

/**
 * Clean up a specific demo session
 */
async function cleanupDemoSession(sessionId: string): Promise<void> {
  try {
    const session = demoSessions.get(sessionId);
    if (!session) return;

    console.log(`🧹 Cleaning up demo session ${sessionId} for user ${session.userId}`);

    // Clear demo data
    await clearDemoData(session.userId);

    // Delete demo user from database
    await storage.deleteUser(session.userId);

    // Remove from in-memory storage
    demoSessions.delete(sessionId);
    userIdToSessionId.delete(session.userId);

    console.log(`✅ Demo session ${sessionId} cleanup completed`);

  } catch (error: any) {
    console.error(`❌ Error cleaning up demo session ${sessionId}:`, error);
  }
}

/**
 * Clean up all expired demo sessions
 */
export async function cleanupExpiredDemoSessions(): Promise<{
  cleanedSessions: number;
  errors: number;
}> {
  let cleanedSessions = 0;
  let errors = 0;
  const now = new Date();

  console.log(`🧹 Starting cleanup of expired demo sessions...`);

  for (const [sessionId, session] of demoSessions.entries()) {
    try {
      if (now > session.expiresAt) {
        await cleanupDemoSession(sessionId);
        cleanedSessions++;
      }
    } catch (error: any) {
      console.error(`❌ Error cleaning up session ${sessionId}:`, error);
      errors++;
    }
  }

  if (cleanedSessions > 0 || errors > 0) {
    console.log(`✅ Demo session cleanup completed: ${cleanedSessions} cleaned, ${errors} errors`);
  }

  return { cleanedSessions, errors };
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `demo_${timestamp}_${randomPart}`;
}

/**
 * Generate a random password for demo users
 */
function generateRandomPassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Initialize the demo session service
 */
export function initializeDemoSessionService(): void {
  console.log('🎮 Initializing Demo Session Service...');
  
  // Start cleanup service
  setInterval(async () => {
    try {
      await cleanupExpiredDemoSessions();
    } catch (error) {
      console.error('❌ Error in demo session cleanup interval:', error);
    }
  }, CLEANUP_INTERVAL_MINUTES * 60 * 1000);

  console.log(`✅ Demo Session Service initialized with ${DEMO_SESSION_DURATION_MINUTES}min sessions, ${CLEANUP_INTERVAL_MINUTES}min cleanup interval`);
}

/**
 * Validate demo session middleware
 */
export function validateDemoSession() {
  return async (req: any, res: any, next: any) => {
    try {
      // Only validate if user is authenticated and is a demo user
      if (req.user && isDemoUser(req.user)) {
        const status = await getDemoSessionStatus(req.user.id);
        
        if (!status.isDemo || status.error) {
          // Demo session expired or invalid
          req.session.destroy(() => {});
          return res.status(401).json({
            message: "Demo session has expired",
            code: "DEMO_SESSION_EXPIRED",
            error: status.error
          });
        }

        // Update activity for valid demo sessions
        await updateDemoSessionActivity(req.user.id);
      }

      next();
    } catch (error: any) {
      console.error('❌ Demo session validation error:', error);
      next(error);
    }
  };
}

// Export service instance
export const demoSessionService = {
  createDemoSession,
  getDemoSessionStatus,
  updateDemoSessionActivity,
  endDemoSession,
  isDemoUser,
  getDemoSession,
  getActiveDemoSessions,
  cleanupExpiredDemoSessions,
  initializeDemoSessionService,
  validateDemoSession
};