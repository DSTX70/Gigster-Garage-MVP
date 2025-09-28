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
/**
 * Map API endpoints to entity cache keys
 */
function getEntityCacheKey(path: string, query: any): string | null {
  // Remove trailing slash if present
  const cleanPath = path.replace(/\/$/, '');
  
  // Map common API endpoints to entity cache keys
  if (cleanPath === '/api/users' && Object.keys(query).length === 0) {
    return 'users:all';
  }
  if (cleanPath === '/api/projects' && Object.keys(query).length === 0) {
    return 'projects:all';
  }
  if (cleanPath === '/api/tasks' && Object.keys(query).length === 0) {
    return 'tasks:all';
  }
  
  // Handle filtered tasks (from cache warming)
  if (cleanPath === '/api/tasks' && query.status === 'active') {
    return 'tasks:active';
  }
  
  // Handle individual entity requests
  const userMatch = cleanPath.match(/^\/api\/users\/([^\/]+)$/);
  if (userMatch) {
    return `user:${userMatch[1]}`;
  }
  
  const projectMatch = cleanPath.match(/^\/api\/projects\/([^\/]+)$/);
  if (projectMatch) {
    return `project:${projectMatch[1]}`;
  }
  
  const taskMatch = cleanPath.match(/^\/api\/tasks\/([^\/]+)$/);
  if (taskMatch) {
    return `task:${taskMatch[1]}`;
  }
  
  return null;
}

export function cacheMiddleware(ttl: number = 300) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching for user-specific and admin routes only
    const skipCache = req.path.match(/^\/api\/users\/me$/) ||
                     req.path.includes('/auth') ||
                     req.path.includes('/admin') ||
                     req.path.includes('/login') ||
                     req.path.includes('/logout');
    
    if (skipCache) {
      return next();
    }

    try {
      const { AppCache } = await import('../cache-service');
      const cache = AppCache.getInstance();
      const cacheKey = `api:${req.method}:${req.path}:${JSON.stringify(req.query)}`;

      // Try to get cached response - first check API-specific cache
      let cachedResponse = await cache.get(cacheKey);
      
      // If no API cache hit, try entity-specific cache (from cache warming)
      if (!cachedResponse) {
        const entityKey = getEntityCacheKey(req.path, req.query);
        if (entityKey) {
          cachedResponse = await cache.get(entityKey);
          if (cachedResponse) {
            console.log(`🚀 Cache HIT (entity): ${entityKey} for ${req.path}`);
            return res.json(cachedResponse);
          }
        }
      }
      
      if (cachedResponse) {
        console.log(`🚀 Cache HIT (api): ${req.path}`);
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