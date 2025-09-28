import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure pool with proper limits for Neon serverless
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 3, // Low connection limit for Neon
  idleTimeoutMillis: 15000, // Close idle connections quickly
  connectionTimeoutMillis: 10000, // Timeout connection attempts
});

// Add error handling for pool
pool.on('error', (err) => {
  console.error('💥 Database pool error:', {
    message: err.message,
    code: err.code,
    severity: err.severity,
    where: err.where,
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount
  });
});

// Keepalive to prevent Neon autosuspend during activity
setInterval(async () => {
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    console.error('🔄 Keepalive query failed:', err.message);
  }
}, 55000); // Every 55 seconds

export const db = drizzle({ client: pool, schema });