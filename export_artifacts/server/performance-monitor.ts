import { logAuditEvent } from './audit-service';
import { cacheService } from './cache-service';

export interface PerformanceMetrics {
  timestamp: number;
  
  // Response time metrics
  responseTime: {
    average: number;
    p50: number;
    p95: number;
    p99: number;
    min: number;
    max: number;
  };
  
  // Throughput metrics
  throughput: {
    requestsPerSecond: number;
    requestsPerMinute: number;
    totalRequests: number;
    errorRate: number;
  };
  
  // Resource utilization
  resources: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkIO: number;
  };
  
  // Database performance
  database: {
    queryTime: number;
    connectionPool: number;
    activeQueries: number;
    slowQueries: number;
  };
  
  // Cache performance
  cache: {
    hitRate: number;
    missRate: number;
    evictionRate: number;
    memoryUsage: number;
  };
  
  // Error tracking
  errors: {
    total: number;
    rate: number;
    byStatusCode: Record<string, number>;
    byEndpoint: Record<string, number>;
  };
}

export interface Alert {
  id: string;
  type: 'performance' | 'error' | 'resource' | 'availability';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  metric: string;
  threshold: number;
  currentValue: number;
  timestamp: number;
  resolved: boolean;
  resolvedAt?: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private alerts: Map<string, Alert> = new Map();
  private requestTimes: number[] = [];
  private requestCounts = { total: 0, errors: 0 };
  private errorsByCode: Record<string, number> = {};
  private errorsByEndpoint: Record<string, number> = {};
  private monitoringInterval: NodeJS.Timeout | null = null;
  private startTime = Date.now();

  // Alert thresholds
  private thresholds = {
    responseTimeP95: 2000, // 2 seconds
    errorRate: 5, // 5%
    cpuUsage: 80, // 80%
    memoryUsage: 85, // 85%
    diskUsage: 90, // 90%
    cacheHitRate: 70, // 70%
    dbQueryTime: 1000 // 1 second
  };

  constructor() {
    console.log('📊 Performance monitor initialized');
    this.startMonitoring();
  }

  /**
   * Record request metrics
   */
  recordRequest(duration: number, statusCode: number, endpoint: string): void {
    this.requestTimes.push(duration);
    this.requestCounts.total++;

    // Track errors
    if (statusCode >= 400) {
      this.requestCounts.errors++;
      this.errorsByCode[statusCode] = (this.errorsByCode[statusCode] || 0) + 1;
      this.errorsByEndpoint[endpoint] = (this.errorsByEndpoint[endpoint] || 0) + 1;
    }

    // Keep only last 1000 request times for performance
    if (this.requestTimes.length > 1000) {
      this.requestTimes = this.requestTimes.slice(-1000);
    }
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): PerformanceMetrics {
    const now = Date.now();
    const sortedTimes = [...this.requestTimes].sort((a, b) => a - b);
    const uptime = (now - this.startTime) / 1000; // seconds

    return {
      timestamp: now,
      responseTime: this.calculateResponseTimeMetrics(sortedTimes),
      throughput: this.calculateThroughputMetrics(uptime),
      resources: this.getResourceMetrics(),
      database: this.getDatabaseMetrics(),
      cache: this.getCacheMetrics(),
      errors: this.getErrorMetrics()
    };
  }

  /**
   * Get historical metrics
   */
  getHistoricalMetrics(minutes: number = 60): PerformanceMetrics[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.metrics.filter(m => m.timestamp > cutoff);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolved);
  }

  /**
   * Get all alerts (including resolved)
   */
  getAllAlerts(): Alert[] {
    return Array.from(this.alerts.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = Date.now();
      console.log(`📊 Alert resolved: ${alert.title}`);
      return true;
    }
    return false;
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): any {
    const currentMetrics = this.getCurrentMetrics();
    const historicalMetrics = this.getHistoricalMetrics(60);
    const activeAlerts = this.getActiveAlerts();

    return {
      current: {
        responseTime: `${currentMetrics.responseTime.average.toFixed(0)}ms`,
        throughput: `${currentMetrics.throughput.requestsPerSecond.toFixed(1)} req/s`,
        errorRate: `${currentMetrics.errors.rate.toFixed(2)}%`,
        cacheHitRate: `${currentMetrics.cache.hitRate.toFixed(1)}%`
      },
      health: {
        status: this.getOverallHealthStatus(currentMetrics, activeAlerts),
        score: this.calculateHealthScore(currentMetrics),
        issues: activeAlerts.length
      },
      trends: {
        responseTimeTrend: this.calculateTrend(historicalMetrics, 'responseTime.average'),
        throughputTrend: this.calculateTrend(historicalMetrics, 'throughput.requestsPerSecond'),
        errorRateTrend: this.calculateTrend(historicalMetrics, 'errors.rate')
      },
      alerts: {
        critical: activeAlerts.filter(a => a.severity === 'critical').length,
        high: activeAlerts.filter(a => a.severity === 'high').length,
        medium: activeAlerts.filter(a => a.severity === 'medium').length,
        low: activeAlerts.filter(a => a.severity === 'low').length
      }
    };
  }

  /**
   * Export metrics for external monitoring systems
   */
  exportMetrics(format: 'json' | 'prometheus' = 'json'): string {
    const metrics = this.getCurrentMetrics();
    
    if (format === 'prometheus') {
      return this.formatPrometheusMetrics(metrics);
    }
    
    return JSON.stringify(metrics, null, 2);
  }

  // Private methods
  private startMonitoring(): void {
    // Collect metrics every 30 seconds
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, 30 * 1000);

    console.log('📊 Performance monitoring started');
  }

  private stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('📊 Performance monitoring stopped');
  }

  private collectMetrics(): void {
    const metrics = this.getCurrentMetrics();
    
    // Store metrics
    this.metrics.push(metrics);
    
    // Keep only last 24 hours of metrics
    const cutoff = Date.now() - (24 * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
    
    // Check for alerts
    this.checkAlerts(metrics);
    
    console.log(`📊 Metrics collected - Avg RT: ${metrics.responseTime.average.toFixed(0)}ms, RPS: ${metrics.throughput.requestsPerSecond.toFixed(1)}, Errors: ${metrics.errors.rate.toFixed(2)}%`);
  }

  private calculateResponseTimeMetrics(sortedTimes: number[]): PerformanceMetrics['responseTime'] {
    if (sortedTimes.length === 0) {
      return { average: 0, p50: 0, p95: 0, p99: 0, min: 0, max: 0 };
    }

    const sum = sortedTimes.reduce((a, b) => a + b, 0);
    const average = sum / sortedTimes.length;
    
    return {
      average: Number(average.toFixed(2)),
      p50: this.getPercentile(sortedTimes, 0.5),
      p95: this.getPercentile(sortedTimes, 0.95),
      p99: this.getPercentile(sortedTimes, 0.99),
      min: sortedTimes[0],
      max: sortedTimes[sortedTimes.length - 1]
    };
  }

  private calculateThroughputMetrics(uptimeSeconds: number): PerformanceMetrics['throughput'] {
    const requestsPerSecond = this.requestCounts.total / Math.max(uptimeSeconds, 1);
    const errorRate = this.requestCounts.total > 0 ? 
      (this.requestCounts.errors / this.requestCounts.total) * 100 : 0;

    return {
      requestsPerSecond: Number(requestsPerSecond.toFixed(2)),
      requestsPerMinute: Number((requestsPerSecond * 60).toFixed(0)),
      totalRequests: this.requestCounts.total,
      errorRate: Number(errorRate.toFixed(2))
    };
  }

  private getResourceMetrics(): PerformanceMetrics['resources'] {
    // In a real implementation, these would come from system monitoring
    return {
      cpuUsage: Math.random() * 30 + 20, // 20-50%
      memoryUsage: Math.random() * 20 + 40, // 40-60%
      diskUsage: Math.random() * 10 + 30, // 30-40%
      networkIO: Math.random() * 100 + 50 // 50-150 MB/s
    };
  }

  private getDatabaseMetrics(): PerformanceMetrics['database'] {
    // These would come from database monitoring in production
    return {
      queryTime: Math.random() * 200 + 50, // 50-250ms
      connectionPool: Math.floor(Math.random() * 20 + 5), // 5-25 connections
      activeQueries: Math.floor(Math.random() * 10 + 1), // 1-11 queries
      slowQueries: Math.floor(Math.random() * 3) // 0-2 slow queries
    };
  }

  private getCacheMetrics(): PerformanceMetrics['cache'] {
    const cacheStats = cacheService.getStats();
    return {
      hitRate: cacheStats.hitRate,
      missRate: cacheStats.missRate,
      evictionRate: cacheStats.evictionCount,
      memoryUsage: cacheStats.usedMemory
    };
  }

  private getErrorMetrics(): PerformanceMetrics['errors'] {
    const uptime = (Date.now() - this.startTime) / 1000;
    const errorRate = this.requestCounts.total > 0 ? 
      (this.requestCounts.errors / this.requestCounts.total) * 100 : 0;

    return {
      total: this.requestCounts.errors,
      rate: Number(errorRate.toFixed(2)),
      byStatusCode: { ...this.errorsByCode },
      byEndpoint: { ...this.errorsByEndpoint }
    };
  }

  private getPercentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0;
    
    const index = Math.ceil(sortedArray.length * percentile) - 1;
    return sortedArray[Math.max(0, Math.min(index, sortedArray.length - 1))];
  }

  private checkAlerts(metrics: PerformanceMetrics): void {
    const checks = [
      {
        id: 'high_response_time',
        condition: metrics.responseTime.p95 > this.thresholds.responseTimeP95,
        type: 'performance' as const,
        severity: 'high' as const,
        title: 'High Response Time',
        description: '95th percentile response time exceeds threshold',
        metric: 'responseTime.p95',
        threshold: this.thresholds.responseTimeP95,
        currentValue: metrics.responseTime.p95
      },
      {
        id: 'high_error_rate',
        condition: metrics.errors.rate > this.thresholds.errorRate,
        type: 'error' as const,
        severity: 'critical' as const,
        title: 'High Error Rate',
        description: 'Error rate exceeds acceptable threshold',
        metric: 'errors.rate',
        threshold: this.thresholds.errorRate,
        currentValue: metrics.errors.rate
      },
      {
        id: 'high_cpu_usage',
        condition: metrics.resources.cpuUsage > this.thresholds.cpuUsage,
        type: 'resource' as const,
        severity: 'medium' as const,
        title: 'High CPU Usage',
        description: 'CPU usage exceeds threshold',
        metric: 'resources.cpuUsage',
        threshold: this.thresholds.cpuUsage,
        currentValue: metrics.resources.cpuUsage
      },
      {
        id: 'high_memory_usage',
        condition: metrics.resources.memoryUsage > this.thresholds.memoryUsage,
        type: 'resource' as const,
        severity: 'medium' as const,
        title: 'High Memory Usage',
        description: 'Memory usage exceeds threshold',
        metric: 'resources.memoryUsage',
        threshold: this.thresholds.memoryUsage,
        currentValue: metrics.resources.memoryUsage
      },
      {
        id: 'low_cache_hit_rate',
        condition: metrics.cache.hitRate < this.thresholds.cacheHitRate,
        type: 'performance' as const,
        severity: 'medium' as const,
        title: 'Low Cache Hit Rate',
        description: 'Cache hit rate below optimal threshold',
        metric: 'cache.hitRate',
        threshold: this.thresholds.cacheHitRate,
        currentValue: metrics.cache.hitRate
      }
    ];

    for (const check of checks) {
      if (check.condition) {
        this.triggerAlert(check);
      } else {
        this.resolveAlert(check.id);
      }
    }
  }

  private triggerAlert(alertConfig: any): void {
    const existingAlert = this.alerts.get(alertConfig.id);
    
    if (existingAlert && !existingAlert.resolved) {
      // Update existing alert
      existingAlert.currentValue = alertConfig.currentValue;
      existingAlert.timestamp = Date.now();
      return;
    }

    const alert: Alert = {
      id: alertConfig.id,
      type: alertConfig.type,
      severity: alertConfig.severity,
      title: alertConfig.title,
      description: alertConfig.description,
      metric: alertConfig.metric,
      threshold: alertConfig.threshold,
      currentValue: alertConfig.currentValue,
      timestamp: Date.now(),
      resolved: false
    };

    this.alerts.set(alert.id, alert);
    console.log(`📊 Alert triggered: ${alert.title} (${alert.currentValue} > ${alert.threshold})`);

    // Log to audit system
    logAuditEvent(
      'system',
      'system_config',
      'performance_alert_triggered',
      {
        id: 'system',
        type: 'system',
        name: 'PerformanceMonitor',
        ipAddress: '127.0.0.1'
      },
      {
        type: 'alert',
        id: alert.id,
        name: alert.title
      },
      'failure',
      {
        description: `Performance alert: ${alert.title}`,
        metadata: {
          severity: alert.severity,
          metric: alert.metric,
          threshold: alert.threshold,
          currentValue: alert.currentValue
        }
      },
      {
        severity: 'high',
        dataClassification: 'internal'
      }
    );
  }

  private getOverallHealthStatus(metrics: PerformanceMetrics, activeAlerts: Alert[]): string {
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical').length;
    const highAlerts = activeAlerts.filter(a => a.severity === 'high').length;

    if (criticalAlerts > 0) return 'critical';
    if (highAlerts > 0) return 'warning';
    if (activeAlerts.length > 0) return 'degraded';
    return 'healthy';
  }

  private calculateHealthScore(metrics: PerformanceMetrics): number {
    let score = 100;

    // Response time impact
    if (metrics.responseTime.p95 > this.thresholds.responseTimeP95) {
      score -= 20;
    }

    // Error rate impact
    if (metrics.errors.rate > this.thresholds.errorRate) {
      score -= 25;
    }

    // Resource usage impact
    if (metrics.resources.cpuUsage > this.thresholds.cpuUsage) {
      score -= 15;
    }
    if (metrics.resources.memoryUsage > this.thresholds.memoryUsage) {
      score -= 15;
    }

    // Cache performance impact
    if (metrics.cache.hitRate < this.thresholds.cacheHitRate) {
      score -= 10;
    }

    return Math.max(0, score);
  }

  private calculateTrend(historicalMetrics: PerformanceMetrics[], metricPath: string): 'improving' | 'stable' | 'degrading' {
    if (historicalMetrics.length < 2) return 'stable';

    const getValue = (obj: any, path: string): number => {
      return path.split('.').reduce((o, p) => o && o[p], obj) || 0;
    };

    const recent = historicalMetrics.slice(-10);
    const older = historicalMetrics.slice(-20, -10);

    const recentAvg = recent.reduce((sum, m) => sum + getValue(m, metricPath), 0) / recent.length;
    const olderAvg = older.length > 0 ? 
      older.reduce((sum, m) => sum + getValue(m, metricPath), 0) / older.length : 
      recentAvg;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (Math.abs(change) < 5) return 'stable';
    
    // For response time and error rate, lower is better
    if (metricPath.includes('responseTime') || metricPath.includes('errorRate')) {
      return change < 0 ? 'improving' : 'degrading';
    }
    
    // For throughput and cache hit rate, higher is better
    return change > 0 ? 'improving' : 'degrading';
  }

  private formatPrometheusMetrics(metrics: PerformanceMetrics): string {
    const timestamp = Date.now();
    return `
# HELP response_time_average Average response time in milliseconds
# TYPE response_time_average gauge
response_time_average ${metrics.responseTime.average} ${timestamp}

# HELP response_time_p95 95th percentile response time in milliseconds
# TYPE response_time_p95 gauge
response_time_p95 ${metrics.responseTime.p95} ${timestamp}

# HELP requests_per_second Current requests per second
# TYPE requests_per_second gauge
requests_per_second ${metrics.throughput.requestsPerSecond} ${timestamp}

# HELP error_rate Current error rate as percentage
# TYPE error_rate gauge
error_rate ${metrics.errors.rate} ${timestamp}

# HELP cache_hit_rate Cache hit rate as percentage
# TYPE cache_hit_rate gauge
cache_hit_rate ${metrics.cache.hitRate} ${timestamp}

# HELP cpu_usage CPU usage as percentage
# TYPE cpu_usage gauge
cpu_usage ${metrics.resources.cpuUsage} ${timestamp}

# HELP memory_usage Memory usage as percentage
# TYPE memory_usage gauge
memory_usage ${metrics.resources.memoryUsage} ${timestamp}
`.trim();
  }
}

export const performanceMonitor = new PerformanceMonitor();