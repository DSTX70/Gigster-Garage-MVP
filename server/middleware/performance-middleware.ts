import { Request, Response, NextFunction } from 'express';
import { performanceMonitor } from '../performance-monitor';

export interface PerformanceRequest extends Request {
  startTime?: number;
}

/**
 * Performance monitoring middleware
 */
export function performanceMiddleware() {
  return (req: PerformanceRequest, res: Response, next: NextFunction) => {
    req.startTime = Date.now();

    // Track request completion
    res.on('finish', () => {
      if (req.startTime) {
        const duration = Date.now() - req.startTime;
        const endpoint = `${req.method} ${req.route?.path || req.path}`;
        
        performanceMonitor.recordRequest(duration, res.statusCode, endpoint);
      }
    });

    next();
  };
}

/**
 * Cache middleware for API responses
 */
export function cacheMiddleware(ttl: number = 300) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching for authenticated requests that might be user-specific
    const skipCache = req.path.includes('/user') || 
                     req.path.includes('/auth') ||
                     req.path.includes('/admin');
    
    if (skipCache) {
      return next();
    }

    try {
      // Cache operations temporarily disabled to prevent data corruption
      // TODO: Redesign cache implementation for complex data structures

      // Response caching temporarily disabled

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
}

/**
 * Request optimization middleware
 */
export function optimizationMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Enable compression
    res.set('Content-Encoding', 'gzip');
    
    // Set cache headers for static assets
    if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
      res.set('Cache-Control', 'public, max-age=31536000'); // 1 year
    }
    
    // Security headers
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
    res.set('X-XSS-Protection', '1; mode=block');
    
    next();
  };
}