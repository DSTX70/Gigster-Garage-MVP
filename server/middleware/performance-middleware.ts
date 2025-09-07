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
      const { AppCache } = await import('../cache-service');
      const cache = AppCache.getInstance();
      const cacheKey = `api:${req.method}:${req.path}:${JSON.stringify(req.query)}`;

      // Try to get cached response
      const cachedResponse = await cache.get(cacheKey);
      if (cachedResponse) {
        console.log(`🚀 Cache HIT for: ${req.path}`);
        return res.json(cachedResponse);
      }

      // Store the original res.json method
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = function(data: any) {
        // Cache the response data
        cache.set(cacheKey, data, ttl, ['api-response']).catch(err => {
          console.error('Failed to cache response:', err);
        });
        console.log(`🚀 Cache MISS - Stored: ${req.path}`);
        return originalJson(data);
      };

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
    // REMOVED: Content-Encoding: gzip header that was causing iOS Safari -1015 errors
    // This was setting gzip header without actually compressing content
    
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