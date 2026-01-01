import { Request, Response, NextFunction } from "express";
import { randomBytes } from "crypto";

export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  requestId: string;
  method?: string;
  path?: string;
  userId?: string;
  statusCode?: number;
  latencyMs?: number;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface RequestWithId extends Request {
  requestId: string;
  requestStart: number;
}

function generateRequestId(): string {
  return randomBytes(16).toString("hex");
}

export function formatLogEntry(entry: LogEntry): string {
  return JSON.stringify(entry);
}

export function log(
  level: LogEntry["level"],
  message: string,
  requestId?: string,
  metadata?: Record<string, unknown>
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    requestId: requestId || "system",
    message,
    metadata,
  };

  const output = formatLogEntry(entry);

  switch (level) {
    case "error":
      console.error(output);
      break;
    case "warn":
      console.warn(output);
      break;
    case "debug":
      if (process.env.NODE_ENV === "development") {
        console.log(output);
      }
      break;
    default:
      console.log(output);
  }
}

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const reqWithId = req as RequestWithId;
  
  reqWithId.requestId =
    (req.headers["x-request-id"] as string) || generateRequestId();
  reqWithId.requestStart = Date.now();

  res.setHeader("X-Request-Id", reqWithId.requestId);

  next();
}

export function requestLoggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const reqWithId = req as RequestWithId;

  res.on("finish", () => {
    const latencyMs = Date.now() - reqWithId.requestStart;
    const userId = (req as any).user?.id || (req.session as any)?.userId;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: res.statusCode >= 400 ? "error" : "info",
      requestId: reqWithId.requestId,
      method: req.method,
      path: req.path,
      userId,
      statusCode: res.statusCode,
      latencyMs,
      message: `${req.method} ${req.path} ${res.statusCode} ${latencyMs}ms`,
    };

    console.log(formatLogEntry(entry));

    if (res.statusCode >= 400 && !(req as any)._errorTracked) {
      (req as any)._errorTracked = true;
      trackError(
        reqWithId.requestId,
        `${req.method} ${req.path} returned ${res.statusCode}`,
        req.path,
        res.statusCode
      );
    }
  });

  next();
}

export function logIntegrationCall(
  integration: string,
  action: string,
  requestId: string,
  success: boolean,
  metadata?: Record<string, unknown>
): void {
  log(
    success ? "info" : "error",
    `Integration: ${integration} - ${action}`,
    requestId,
    {
      integration,
      action,
      success,
      ...metadata,
    }
  );
}

export function logError(
  error: Error,
  requestId?: string,
  context?: Record<string, unknown>
): void {
  log("error", error.message, requestId, {
    errorName: error.name,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    ...context,
  });
}

const recentErrors: Array<{
  timestamp: string;
  requestId: string;
  message: string;
  path?: string;
  statusCode?: number;
}> = [];

const MAX_RECENT_ERRORS = 100;

export function trackError(
  requestId: string,
  message: string,
  path?: string,
  statusCode?: number
): void {
  recentErrors.unshift({
    timestamp: new Date().toISOString(),
    requestId,
    message,
    path,
    statusCode,
  });

  if (recentErrors.length > MAX_RECENT_ERRORS) {
    recentErrors.pop();
  }
}

export function getRecentErrors(limit = 20): typeof recentErrors {
  return recentErrors.slice(0, limit);
}

export function getErrorStats(): {
  total: number;
  last5Minutes: number;
  last15Minutes: number;
  byPath: Record<string, number>;
} {
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;
  const fifteenMinutesAgo = now - 15 * 60 * 1000;

  const byPath: Record<string, number> = {};
  let last5Minutes = 0;
  let last15Minutes = 0;

  for (const error of recentErrors) {
    const errorTime = new Date(error.timestamp).getTime();
    
    if (errorTime > fiveMinutesAgo) {
      last5Minutes++;
    }
    if (errorTime > fifteenMinutesAgo) {
      last15Minutes++;
    }

    if (error.path) {
      byPath[error.path] = (byPath[error.path] || 0) + 1;
    }
  }

  return {
    total: recentErrors.length,
    last5Minutes,
    last15Minutes,
    byPath,
  };
}

export default {
  log,
  logError,
  logIntegrationCall,
  requestIdMiddleware,
  requestLoggingMiddleware,
  trackError,
  getRecentErrors,
  getErrorStats,
};
