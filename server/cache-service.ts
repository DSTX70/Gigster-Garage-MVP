import { logAuditEvent } from './audit-service';

// Redis-compatible cache interface for scalable performance
export interface CacheConfig {
  defaultTTL: number; // Default Time To Live in seconds
  maxMemory: string; // Maximum memory usage (e.g., '256mb')
  evictionPolicy: 'allkeys-lru' | 'volatile-lru' | 'allkeys-lfu' | 'volatile-lfu';
  persistenceEnabled: boolean;
  clusterMode: boolean;
}

export interface CacheEntry {
  key: string;
  value: any;
  ttl: number;
  createdAt: number;
  accessedAt: number;
  accessCount: number;
  tags?: string[];
}

export interface CacheStats {
  totalKeys: number;
  usedMemory: number;
  hitRate: number;
  missRate: number;
  evictionCount: number;
  operationsPerSecond: number;
  averageResponseTime: number;
}

export interface CachePattern {
  pattern: string;
  description: string;
  ttl: number;
  autoRefresh: boolean;
  dependentTags: string[];
}

export class CacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private stats = {
    hits: 0,
    misses: 0,
    operations: 0,
    evictions: 0,
    totalResponseTime: 0
  };
  private patterns: Map<string, CachePattern> = new Map();

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      defaultTTL: 3600, // 1 hour
      maxMemory: '256mb',
      evictionPolicy: 'allkeys-lru',
      persistenceEnabled: true,
      clusterMode: false,
      ...config
    };

    console.log('🚀 Cache service initialized');
    this.initializeCachePatterns();
    this.startCacheCleanup();
    this.startPerformanceMonitoring();
  }

  /**
   * Store data in cache with optional TTL and tags
   */
  async set(key: string, value: any, ttl?: number, tags?: string[]): Promise<void> {
    const now = Date.now();
    const timeToLive = ttl || this.config.defaultTTL;

    // Check memory limits and evict if necessary
    await this.enforceMemoryLimits();

    const entry: CacheEntry = {
      key,
      value: this.serialize(value),
      ttl: timeToLive,
      createdAt: now,
      accessedAt: now,
      accessCount: 0,
      tags: tags || []
    };

    this.cache.set(key, entry);
    this.stats.operations++;

    // Auto-tag based on key patterns
    this.applyAutoTags(key, entry);

    console.log(`🚀 Cache SET: ${key} (TTL: ${timeToLive}s, Tags: [${tags?.join(', ') || ''}])`);
  }

  /**
   * Retrieve data from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    const startTime = Date.now();
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.stats.operations++;
      this.recordResponseTime(startTime);
      return null;
    }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.operations++;
      this.recordResponseTime(startTime);
      return null;
    }

    // Update access statistics
    entry.accessedAt = Date.now();
    entry.accessCount++;

    this.stats.hits++;
    this.stats.operations++;
    this.recordResponseTime(startTime);

    console.log(`🚀 Cache HIT: ${key} (Access count: ${entry.accessCount})`);
    return this.deserialize(entry.value);
  }

  /**
   * Delete specific cache entry
   */
  async del(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key);
    this.stats.operations++;
    
    if (deleted) {
      console.log(`🚀 Cache DELETE: ${key}`);
    }

    return deleted;
  }

  /**
   * Delete multiple entries by pattern
   */
  async delPattern(pattern: string): Promise<number> {
    const regex = this.patternToRegex(pattern);
    let deletedCount = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    this.stats.operations++;
    console.log(`🚀 Cache DELETE pattern: ${pattern} (${deletedCount} keys removed)`);
    return deletedCount;
  }

  /**
   * Delete entries by tags
   */
  async delByTags(tags: string[]): Promise<number> {
    let deletedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags && tags.some(tag => entry.tags!.includes(tag))) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    this.stats.operations++;
    console.log(`🚀 Cache DELETE by tags: [${tags.join(', ')}] (${deletedCount} keys removed)`);
    return deletedCount;
  }

  /**
   * Check if key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    return entry !== undefined && !this.isExpired(entry);
  }

  /**
   * Get cache entry with metadata
   */
  async getWithMeta(key: string): Promise<{ value: any; meta: Omit<CacheEntry, 'value'> } | null> {
    const entry = this.cache.get(key);
    
    if (!entry || this.isExpired(entry)) {
      return null;
    }

    return {
      value: this.deserialize(entry.value),
      meta: {
        key: entry.key,
        ttl: entry.ttl,
        createdAt: entry.createdAt,
        accessedAt: entry.accessedAt,
        accessCount: entry.accessCount,
        tags: entry.tags
      }
    };
  }

  /**
   * Multi-get operation for batch retrieval
   */
  async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    const results: (T | null)[] = [];

    for (const key of keys) {
      results.push(await this.get<T>(key));
    }

    return results;
  }

  /**
   * Multi-set operation for batch storage
   */
  async mset(entries: Array<{ key: string; value: any; ttl?: number; tags?: string[] }>): Promise<void> {
    for (const entry of entries) {
      await this.set(entry.key, entry.value, entry.ttl, entry.tags);
    }
  }

  /**
   * Cache-aside pattern: get or set with factory function
   */
  async getOrSet<T = any>(
    key: string, 
    factory: () => Promise<T> | T, 
    ttl?: number, 
    tags?: string[]
  ): Promise<T> {
    const cached = await this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl, tags);
    return value;
  }

  /**
   * Increment numeric value in cache
   */
  async increment(key: string, delta: number = 1): Promise<number> {
    const current = await this.get<number>(key) || 0;
    const newValue = current + delta;
    await this.set(key, newValue);
    return newValue;
  }

  /**
   * Decrement numeric value in cache
   */
  async decrement(key: string, delta: number = 1): Promise<number> {
    return this.increment(key, -delta);
  }

  /**
   * Set expiration time for existing key
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    entry.ttl = ttl;
    entry.createdAt = Date.now(); // Reset creation time for new TTL
    return true;
  }

  /**
   * Get time to live for key
   */
  async ttl(key: string): Promise<number> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return -2; // Key doesn't exist
    }

    const elapsed = (Date.now() - entry.createdAt) / 1000;
    const remaining = entry.ttl - elapsed;

    if (remaining <= 0) {
      this.cache.delete(key);
      return -2;
    }

    return Math.ceil(remaining);
  }

  /**
   * Get all keys matching pattern
   */
  keys(pattern: string = '*'): string[] {
    const regex = this.patternToRegex(pattern);
    return Array.from(this.cache.keys()).filter(key => regex.test(key));
  }

  /**
   * Flush all cache entries
   */
  async flush(): Promise<void> {
    const keyCount = this.cache.size;
    this.cache.clear();
    this.resetStats();
    
    console.log(`🚀 Cache FLUSH: ${keyCount} keys removed`);
    
    await logAuditEvent(
      'system',
      'system_maintenance',
      'cache_flush',
      {
        id: 'system',
        type: 'system',
        name: 'CacheService',
        ipAddress: '127.0.0.1'
      },
      {
        type: 'cache',
        id: 'main',
        name: 'Main Cache'
      },
      'success',
      {
        description: 'Cache flushed completely',
        metadata: { keysRemoved: keyCount }
      },
      {
        severity: 'medium',
        dataClassification: 'internal'
      }
    );
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalOps = this.stats.hits + this.stats.misses;
    const hitRate = totalOps > 0 ? (this.stats.hits / totalOps) * 100 : 0;
    const missRate = 100 - hitRate;
    const avgResponseTime = this.stats.operations > 0 ? 
      this.stats.totalResponseTime / this.stats.operations : 0;

    return {
      totalKeys: this.cache.size,
      usedMemory: this.getMemoryUsage(),
      hitRate: Number(hitRate.toFixed(2)),
      missRate: Number(missRate.toFixed(2)),
      evictionCount: this.stats.evictions,
      operationsPerSecond: this.calculateOpsPerSecond(),
      averageResponseTime: Number(avgResponseTime.toFixed(2))
    };
  }

  /**
   * Warm up cache with predefined data
   */
  async warmup(data: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    console.log(`🚀 Cache warmup started for ${data.length} entries`);
    
    for (const item of data) {
      await this.set(item.key, item.value, item.ttl);
    }
    
    console.log('🚀 Cache warmup completed');
  }

  /**
   * Export cache contents for backup/migration
   */
  async export(): Promise<Array<{ key: string; value: any; meta: any }>> {
    const exports = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isExpired(entry)) {
        exports.push({
          key,
          value: this.deserialize(entry.value),
          meta: {
            ttl: entry.ttl,
            createdAt: entry.createdAt,
            tags: entry.tags
          }
        });
      }
    }
    
    return exports;
  }

  /**
   * Import cache contents from backup
   */
  async import(data: Array<{ key: string; value: any; meta: any }>): Promise<void> {
    console.log(`🚀 Cache import started for ${data.length} entries`);
    
    for (const item of data) {
      await this.set(item.key, item.value, item.meta.ttl, item.meta.tags);
    }
    
    console.log('🚀 Cache import completed');
  }

  // Private helper methods
  private serialize(value: any): string {
    try {
      return JSON.stringify(value);
    } catch (error) {
      console.warn('Cache serialization failed:', error);
      return String(value);
    }
  }

  private deserialize<T = any>(value: string): T {
    try {
      return JSON.parse(value);
    } catch (error) {
      return value as any;
    }
  }

  private isExpired(entry: CacheEntry): boolean {
    const now = Date.now();
    const age = (now - entry.createdAt) / 1000; // age in seconds
    return age > entry.ttl;
  }

  private patternToRegex(pattern: string): RegExp {
    // Convert glob pattern to regex
    const escaped = pattern
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape regex chars
      .replace(/\\\*/g, '.*') // Convert * to .*
      .replace(/\\\?/g, '.'); // Convert ? to .
    
    return new RegExp(`^${escaped}$`);
  }

  private recordResponseTime(startTime: number): void {
    this.stats.totalResponseTime += Date.now() - startTime;
  }

  private calculateOpsPerSecond(): number {
    // Simple calculation - in production would use sliding window
    return Math.round(this.stats.operations / ((Date.now() - this.startTime) / 1000));
  }

  private startTime = Date.now();

  private getMemoryUsage(): number {
    // Estimate memory usage based on cache size
    let totalSize = 0;
    
    for (const entry of this.cache.values()) {
      totalSize += entry.value.length + JSON.stringify(entry).length;
    }
    
    return totalSize;
  }

  private async enforceMemoryLimits(): Promise<void> {
    const maxBytes = this.parseMemoryLimit(this.config.maxMemory);
    const currentUsage = this.getMemoryUsage();
    
    if (currentUsage > maxBytes) {
      await this.evictEntries(currentUsage - maxBytes);
    }
  }

  private parseMemoryLimit(limit: string): number {
    const units = { mb: 1024 * 1024, gb: 1024 * 1024 * 1024, kb: 1024 };
    const match = limit.toLowerCase().match(/^(\d+)(mb|gb|kb)$/);
    
    if (!match) {
      return 256 * 1024 * 1024; // Default 256MB
    }
    
    const [, size, unit] = match;
    return parseInt(size) * (units[unit as keyof typeof units] || 1);
  }

  private async evictEntries(targetBytes: number): Promise<void> {
    let bytesFreed = 0;
    const entries = Array.from(this.cache.entries());
    
    // Sort by LRU (Least Recently Used)
    entries.sort(([, a], [, b]) => a.accessedAt - b.accessedAt);
    
    for (const [key, entry] of entries) {
      if (bytesFreed >= targetBytes) break;
      
      const entrySize = entry.value.length + JSON.stringify(entry).length;
      this.cache.delete(key);
      bytesFreed += entrySize;
      this.stats.evictions++;
    }
    
    console.log(`🚀 Cache eviction: ${bytesFreed} bytes freed, ${this.stats.evictions} entries removed`);
  }

  private initializeCachePatterns(): void {
    // Define common cache patterns for automatic management
    const patterns = [
      {
        pattern: 'user:*',
        description: 'User data cache',
        ttl: 1800, // 30 minutes
        autoRefresh: true,
        dependentTags: ['user-data']
      },
      {
        pattern: 'project:*',
        description: 'Project data cache',
        ttl: 3600, // 1 hour
        autoRefresh: true,
        dependentTags: ['project-data']
      },
      {
        pattern: 'task:*',
        description: 'Task data cache',
        ttl: 900, // 15 minutes
        autoRefresh: true,
        dependentTags: ['task-data']
      },
      {
        pattern: 'api:*',
        description: 'API response cache',
        ttl: 300, // 5 minutes
        autoRefresh: false,
        dependentTags: ['api-response']
      },
      {
        pattern: 'analytics:*',
        description: 'Analytics data cache',
        ttl: 7200, // 2 hours
        autoRefresh: false,
        dependentTags: ['analytics']
      }
    ];

    patterns.forEach(pattern => {
      this.patterns.set(pattern.pattern, pattern);
    });

    console.log(`🚀 Initialized ${patterns.length} cache patterns`);
  }

  private applyAutoTags(key: string, entry: CacheEntry): void {
    for (const [pattern, config] of this.patterns.entries()) {
      const regex = this.patternToRegex(pattern);
      if (regex.test(key)) {
        entry.tags = [...(entry.tags || []), ...config.dependentTags];
        break;
      }
    }
  }

  private startCacheCleanup(): void {
    // Clean expired entries every 5 minutes
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 5 * 60 * 1000);

    console.log('🚀 Cache cleanup scheduler started');
  }

  private startPerformanceMonitoring(): void {
    // Log performance metrics every minute
    setInterval(() => {
      const stats = this.getStats();
      console.log(`🚀 Cache Performance: ${stats.hitRate}% hit rate, ${stats.totalKeys} keys, ${stats.operationsPerSecond} ops/sec`);
    }, 60 * 1000);

    console.log('🚀 Cache performance monitoring started');
  }

  private cleanupExpiredEntries(): void {
    let cleanedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🚀 Cache cleanup: ${cleanedCount} expired entries removed`);
    }
  }

  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      operations: 0,
      evictions: 0,
      totalResponseTime: 0
    };
  }
}

// Application-specific cache utilities
export class AppCache {
  private static instance: CacheService;

  static getInstance(): CacheService {
    if (!AppCache.instance) {
      AppCache.instance = new CacheService({
        defaultTTL: 3600, // 1 hour
        maxMemory: '512mb',
        evictionPolicy: 'allkeys-lru',
        persistenceEnabled: true
      });
    }
    return AppCache.instance;
  }

  // User-related caching
  static async cacheUser(userId: string, userData: any, ttl: number = 1800): Promise<void> {
    await this.getInstance().set(`user:${userId}`, userData, ttl, ['user-data']);
  }

  static async getUser(userId: string): Promise<any | null> {
    return this.getInstance().get(`user:${userId}`);
  }

  static async invalidateUser(userId: string): Promise<void> {
    await this.getInstance().del(`user:${userId}`);
  }

  // Project-related caching
  static async cacheProject(projectId: string, projectData: any, ttl: number = 3600): Promise<void> {
    await this.getInstance().set(`project:${projectId}`, projectData, ttl, ['project-data']);
  }

  static async getProject(projectId: string): Promise<any | null> {
    return this.getInstance().get(`project:${projectId}`);
  }

  static async invalidateProject(projectId: string): Promise<void> {
    await this.getInstance().del(`project:${projectId}`);
  }

  // Task-related caching
  static async cacheTask(taskId: string, taskData: any, ttl: number = 900): Promise<void> {
    await this.getInstance().set(`task:${taskId}`, taskData, ttl, ['task-data']);
  }

  static async getTask(taskId: string): Promise<any | null> {
    return this.getInstance().get(`task:${taskId}`);
  }

  static async invalidateTask(taskId: string): Promise<void> {
    await this.getInstance().del(`task:${taskId}`);
  }

  // API response caching
  static async cacheApiResponse(endpoint: string, params: any, response: any, ttl: number = 300): Promise<void> {
    const key = `api:${endpoint}:${this.hashParams(params)}`;
    await this.getInstance().set(key, response, ttl, ['api-response']);
  }

  static async getApiResponse(endpoint: string, params: any): Promise<any | null> {
    const key = `api:${endpoint}:${this.hashParams(params)}`;
    return this.getInstance().get(key);
  }

  // Analytics caching
  static async cacheAnalytics(type: string, data: any, ttl: number = 7200): Promise<void> {
    await this.getInstance().set(`analytics:${type}`, data, ttl, ['analytics']);
  }

  static async getAnalytics(type: string): Promise<any | null> {
    return this.getInstance().get(`analytics:${type}`);
  }

  // Batch operations
  static async invalidateByTags(tags: string[]): Promise<number> {
    return this.getInstance().delByTags(tags);
  }

  static async invalidatePattern(pattern: string): Promise<number> {
    return this.getInstance().delPattern(pattern);
  }

  // Utility methods
  private static hashParams(params: any): string {
    return btoa(JSON.stringify(params)).replace(/[^a-zA-Z0-9]/g, '');
  }
}

export const cacheService = AppCache.getInstance();