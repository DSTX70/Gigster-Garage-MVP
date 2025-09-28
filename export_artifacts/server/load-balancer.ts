import { logAuditEvent } from './audit-service';

export interface ServerInstance {
  id: string;
  host: string;
  port: number;
  status: 'healthy' | 'unhealthy' | 'maintenance';
  weight: number;
  currentConnections: number;
  maxConnections: number;
  lastHealthCheck: number;
  responseTime: number;
  cpuUsage: number;
  memoryUsage: number;
  region: string;
  version: string;
}

export interface LoadBalancerConfig {
  algorithm: 'round-robin' | 'weighted-round-robin' | 'least-connections' | 'ip-hash' | 'least-response-time';
  healthCheckInterval: number; // milliseconds
  healthCheckTimeout: number; // milliseconds
  healthCheckPath: string;
  maxRetries: number;
  retryTimeout: number;
  stickySession: boolean;
  sessionTimeout: number;
  autoScale: {
    enabled: boolean;
    minInstances: number;
    maxInstances: number;
    scaleUpThreshold: number; // CPU/Memory percentage
    scaleDownThreshold: number;
    scaleUpCooldown: number; // seconds
    scaleDownCooldown: number;
  };
}

export interface LoadBalancerMetrics {
  totalRequests: number;
  activeConnections: number;
  totalServers: number;
  healthyServers: number;
  averageResponseTime: number;
  requestsPerSecond: number;
  bytesTransferred: number;
  errorRate: number;
  serverMetrics: Array<{
    serverId: string;
    requests: number;
    connections: number;
    responseTime: number;
    status: string;
  }>;
}

export interface RoutingDecision {
  serverId: string;
  serverHost: string;
  serverPort: number;
  algorithm: string;
  reason: string;
  timestamp: number;
}

export class LoadBalancer {
  private servers: Map<string, ServerInstance> = new Map();
  private config: LoadBalancerConfig;
  private roundRobinIndex = 0;
  private sessionMap = new Map<string, string>(); // sessionId -> serverId
  private metrics: LoadBalancerMetrics;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private autoScaleInterval: NodeJS.Timeout | null = null;

  constructor(config?: Partial<LoadBalancerConfig>) {
    this.config = {
      algorithm: 'round-robin',
      healthCheckInterval: 30000, // 30 seconds
      healthCheckTimeout: 5000, // 5 seconds
      healthCheckPath: '/health',
      maxRetries: 3,
      retryTimeout: 1000,
      stickySession: false,
      sessionTimeout: 1800000, // 30 minutes
      autoScale: {
        enabled: false,
        minInstances: 2,
        maxInstances: 10,
        scaleUpThreshold: 75,
        scaleDownThreshold: 30,
        scaleUpCooldown: 300, // 5 minutes
        scaleDownCooldown: 600 // 10 minutes
      },
      ...config
    };

    this.metrics = {
      totalRequests: 0,
      activeConnections: 0,
      totalServers: 0,
      healthyServers: 0,
      averageResponseTime: 0,
      requestsPerSecond: 0,
      bytesTransferred: 0,
      errorRate: 0,
      serverMetrics: []
    };

    console.log('⚖️ Load balancer initialized');
    this.initializeDefaultServers();
    this.startHealthChecks();
    this.startAutoScaling();
  }

  /**
   * Add server instance to load balancer
   */
  addServer(server: Omit<ServerInstance, 'id'>): string {
    const serverId = `srv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const serverInstance: ServerInstance = {
      id: serverId,
      status: 'healthy',
      currentConnections: 0,
      lastHealthCheck: Date.now(),
      responseTime: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      region: 'us-east-1',
      version: '1.0.0',
      ...server
    };

    this.servers.set(serverId, serverInstance);
    this.updateMetrics();

    console.log(`⚖️ Server added: ${server.host}:${server.port} (${serverId})`);
    return serverId;
  }

  /**
   * Remove server from load balancer
   */
  removeServer(serverId: string): boolean {
    const server = this.servers.get(serverId);
    if (!server) {
      return false;
    }

    // Drain existing connections first
    this.drainServer(serverId);
    
    this.servers.delete(serverId);
    this.updateMetrics();

    console.log(`⚖️ Server removed: ${server.host}:${server.port} (${serverId})`);
    return true;
  }

  /**
   * Get next server based on load balancing algorithm
   */
  getNextServer(sessionId?: string, clientIP?: string): RoutingDecision | null {
    const healthyServers = this.getHealthyServers();
    
    if (healthyServers.length === 0) {
      console.error('⚖️ No healthy servers available');
      return null;
    }

    let selectedServer: ServerInstance;
    let reason: string;

    // Handle sticky sessions
    if (this.config.stickySession && sessionId) {
      const stickyServerId = this.sessionMap.get(sessionId);
      if (stickyServerId) {
        const stickyServer = this.servers.get(stickyServerId);
        if (stickyServer && stickyServer.status === 'healthy') {
          selectedServer = stickyServer;
          reason = 'sticky session';
        }
      }
    }

    // Apply load balancing algorithm if no sticky session
    if (!selectedServer) {
      switch (this.config.algorithm) {
        case 'round-robin':
          selectedServer = this.roundRobinSelection(healthyServers);
          reason = 'round robin';
          break;
        
        case 'weighted-round-robin':
          selectedServer = this.weightedRoundRobinSelection(healthyServers);
          reason = 'weighted round robin';
          break;
        
        case 'least-connections':
          selectedServer = this.leastConnectionsSelection(healthyServers);
          reason = 'least connections';
          break;
        
        case 'least-response-time':
          selectedServer = this.leastResponseTimeSelection(healthyServers);
          reason = 'least response time';
          break;
        
        case 'ip-hash':
          selectedServer = this.ipHashSelection(healthyServers, clientIP || '');
          reason = 'IP hash';
          break;
        
        default:
          selectedServer = healthyServers[0];
          reason = 'fallback';
      }
    }

    // Update connection count
    selectedServer.currentConnections++;
    this.metrics.totalRequests++;

    // Store session mapping for sticky sessions
    if (this.config.stickySession && sessionId) {
      this.sessionMap.set(sessionId, selectedServer.id);
      
      // Clean up expired sessions
      setTimeout(() => {
        this.sessionMap.delete(sessionId);
      }, this.config.sessionTimeout);
    }

    return {
      serverId: selectedServer.id,
      serverHost: selectedServer.host,
      serverPort: selectedServer.port,
      algorithm: this.config.algorithm,
      reason,
      timestamp: Date.now()
    };
  }

  /**
   * Release connection from server
   */
  releaseConnection(serverId: string): void {
    const server = this.servers.get(serverId);
    if (server && server.currentConnections > 0) {
      server.currentConnections--;
    }
  }

  /**
   * Update server health status
   */
  updateServerHealth(serverId: string, isHealthy: boolean, responseTime?: number): void {
    const server = this.servers.get(serverId);
    if (!server) return;

    const oldStatus = server.status;
    server.status = isHealthy ? 'healthy' : 'unhealthy';
    server.lastHealthCheck = Date.now();
    
    if (responseTime !== undefined) {
      server.responseTime = responseTime;
    }

    if (oldStatus !== server.status) {
      console.log(`⚖️ Server ${server.host}:${server.port} status changed: ${oldStatus} → ${server.status}`);
      
      logAuditEvent(
        'system',
        'infrastructure_change',
        'server_health_status_change',
        {
          id: 'system',
          type: 'system',
          name: 'LoadBalancer',
          ipAddress: '127.0.0.1'
        },
        {
          type: 'server',
          id: serverId,
          name: `${server.host}:${server.port}`
        },
        'info',
        {
          description: `Server health status changed from ${oldStatus} to ${server.status}`,
          metadata: {
            serverId,
            host: server.host,
            port: server.port,
            oldStatus,
            newStatus: server.status,
            responseTime
          }
        },
        {
          severity: server.status === 'healthy' ? 'low' : 'medium',
          dataClassification: 'internal'
        }
      );
    }

    this.updateMetrics();
  }

  /**
   * Get all server instances
   */
  getServers(): ServerInstance[] {
    return Array.from(this.servers.values());
  }

  /**
   * Get healthy server instances
   */
  getHealthyServers(): ServerInstance[] {
    return Array.from(this.servers.values()).filter(server => server.status === 'healthy');
  }

  /**
   * Get load balancer configuration
   */
  getConfig(): LoadBalancerConfig {
    return { ...this.config };
  }

  /**
   * Update load balancer configuration
   */
  updateConfig(newConfig: Partial<LoadBalancerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart health checks if interval changed
    if (this.healthCheckInterval && newConfig.healthCheckInterval) {
      this.stopHealthChecks();
      this.startHealthChecks();
    }

    console.log('⚖️ Load balancer configuration updated');
  }

  /**
   * Get current metrics
   */
  getMetrics(): LoadBalancerMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * Drain connections from server (prepare for maintenance)
   */
  drainServer(serverId: string): void {
    const server = this.servers.get(serverId);
    if (!server) return;

    server.status = 'maintenance';
    console.log(`⚖️ Draining server: ${server.host}:${server.port}`);

    // Remove from session mappings
    for (const [sessionId, serverIdInSession] of this.sessionMap.entries()) {
      if (serverIdInSession === serverId) {
        this.sessionMap.delete(sessionId);
      }
    }
  }

  /**
   * Scale up by adding new server instances
   */
  async scaleUp(): Promise<string[]> {
    if (!this.config.autoScale.enabled) {
      throw new Error('Auto-scaling is not enabled');
    }

    const currentInstances = this.servers.size;
    if (currentInstances >= this.config.autoScale.maxInstances) {
      console.log('⚖️ Maximum instances reached, cannot scale up');
      return [];
    }

    const instancesToAdd = Math.min(2, this.config.autoScale.maxInstances - currentInstances);
    const newServerIds: string[] = [];

    for (let i = 0; i < instancesToAdd; i++) {
      const basePort = 3000 + this.servers.size + i;
      const serverId = this.addServer({
        host: 'localhost',
        port: basePort,
        weight: 100,
        maxConnections: 1000
      });
      newServerIds.push(serverId);
    }

    console.log(`⚖️ Scaled up: added ${instancesToAdd} instances`);

    await logAuditEvent(
      'system',
      'infrastructure_change',
      'auto_scale_up',
      {
        id: 'system',
        type: 'system',
        name: 'LoadBalancer',
        ipAddress: '127.0.0.1'
      },
      {
        type: 'infrastructure',
        id: 'load-balancer',
        name: 'Load Balancer'
      },
      'info',
      {
        description: `Auto-scaled up by ${instancesToAdd} instances`,
        metadata: {
          newInstances: instancesToAdd,
          totalInstances: this.servers.size,
          newServerIds
        }
      },
      {
        severity: 'low',
        dataClassification: 'internal'
      }
    );

    return newServerIds;
  }

  /**
   * Scale down by removing server instances
   */
  async scaleDown(): Promise<string[]> {
    if (!this.config.autoScale.enabled) {
      throw new Error('Auto-scaling is not enabled');
    }

    const currentInstances = this.servers.size;
    if (currentInstances <= this.config.autoScale.minInstances) {
      console.log('⚖️ Minimum instances reached, cannot scale down');
      return [];
    }

    const instancesToRemove = Math.min(1, currentInstances - this.config.autoScale.minInstances);
    const serversToRemove = this.selectServersForRemoval(instancesToRemove);
    const removedServerIds: string[] = [];

    for (const server of serversToRemove) {
      this.removeServer(server.id);
      removedServerIds.push(server.id);
    }

    console.log(`⚖️ Scaled down: removed ${instancesToRemove} instances`);

    await logAuditEvent(
      'system',
      'infrastructure_change',
      'auto_scale_down',
      {
        id: 'system',
        type: 'system',
        name: 'LoadBalancer',
        ipAddress: '127.0.0.1'
      },
      {
        type: 'infrastructure',
        id: 'load-balancer',
        name: 'Load Balancer'
      },
      'info',
      {
        description: `Auto-scaled down by ${instancesToRemove} instances`,
        metadata: {
          removedInstances: instancesToRemove,
          totalInstances: this.servers.size,
          removedServerIds
        }
      },
      {
        severity: 'low',
        dataClassification: 'internal'
      }
    );

    return removedServerIds;
  }

  // Private methods for load balancing algorithms
  private roundRobinSelection(servers: ServerInstance[]): ServerInstance {
    const server = servers[this.roundRobinIndex % servers.length];
    this.roundRobinIndex++;
    return server;
  }

  private weightedRoundRobinSelection(servers: ServerInstance[]): ServerInstance {
    const totalWeight = servers.reduce((sum, server) => sum + server.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const server of servers) {
      random -= server.weight;
      if (random <= 0) {
        return server;
      }
    }
    
    return servers[0]; // Fallback
  }

  private leastConnectionsSelection(servers: ServerInstance[]): ServerInstance {
    return servers.reduce((min, server) => 
      server.currentConnections < min.currentConnections ? server : min
    );
  }

  private leastResponseTimeSelection(servers: ServerInstance[]): ServerInstance {
    return servers.reduce((min, server) => 
      server.responseTime < min.responseTime ? server : min
    );
  }

  private ipHashSelection(servers: ServerInstance[], clientIP: string): ServerInstance {
    // Simple hash function for IP-based routing
    let hash = 0;
    for (let i = 0; i < clientIP.length; i++) {
      hash = ((hash << 5) - hash) + clientIP.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    const index = Math.abs(hash) % servers.length;
    return servers[index];
  }

  private initializeDefaultServers(): void {
    // Add some default server instances
    this.addServer({
      host: 'localhost',
      port: 3001,
      weight: 100,
      maxConnections: 1000
    });

    this.addServer({
      host: 'localhost',
      port: 3002,
      weight: 100,
      maxConnections: 1000
    });

    console.log('⚖️ Default servers initialized');
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, this.config.healthCheckInterval);

    console.log('⚖️ Health check monitoring started');
  }

  private stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  private async performHealthChecks(): Promise<void> {
    const servers = Array.from(this.servers.values());
    
    for (const server of servers) {
      try {
        const startTime = Date.now();
        
        // Simulate health check (in real implementation, would make HTTP request)
        const isHealthy = Math.random() > 0.05; // 95% success rate
        const responseTime = Date.now() - startTime + Math.random() * 50; // Simulate latency
        
        this.updateServerHealth(server.id, isHealthy, responseTime);
        
        // Update server resource usage (simulation)
        server.cpuUsage = 10 + Math.random() * 80; // 10-90% CPU
        server.memoryUsage = 20 + Math.random() * 60; // 20-80% Memory
        
      } catch (error) {
        console.error(`⚖️ Health check failed for ${server.host}:${server.port}:`, error);
        this.updateServerHealth(server.id, false);
      }
    }
  }

  private startAutoScaling(): void {
    if (!this.config.autoScale.enabled) return;

    this.autoScaleInterval = setInterval(() => {
      this.checkAutoScaling();
    }, 60000); // Check every minute

    console.log('⚖️ Auto-scaling monitoring started');
  }

  private async checkAutoScaling(): Promise<void> {
    const healthyServers = this.getHealthyServers();
    const avgCpuUsage = healthyServers.reduce((sum, s) => sum + s.cpuUsage, 0) / healthyServers.length;
    const avgMemoryUsage = healthyServers.reduce((sum, s) => sum + s.memoryUsage, 0) / healthyServers.length;
    const avgResourceUsage = (avgCpuUsage + avgMemoryUsage) / 2;

    // Scale up if resource usage is high
    if (avgResourceUsage > this.config.autoScale.scaleUpThreshold) {
      console.log(`⚖️ High resource usage detected (${avgResourceUsage.toFixed(1)}%), considering scale up`);
      try {
        await this.scaleUp();
      } catch (error) {
        console.error('⚖️ Scale up failed:', error);
      }
    }
    
    // Scale down if resource usage is low
    else if (avgResourceUsage < this.config.autoScale.scaleDownThreshold) {
      console.log(`⚖️ Low resource usage detected (${avgResourceUsage.toFixed(1)}%), considering scale down`);
      try {
        await this.scaleDown();
      } catch (error) {
        console.error('⚖️ Scale down failed:', error);
      }
    }
  }

  private selectServersForRemoval(count: number): ServerInstance[] {
    // Select servers with lowest current connections for removal
    const servers = this.getHealthyServers()
      .sort((a, b) => a.currentConnections - b.currentConnections)
      .slice(0, count);
    
    return servers;
  }

  private updateMetrics(): void {
    const servers = Array.from(this.servers.values());
    const healthyServers = servers.filter(s => s.status === 'healthy');
    
    this.metrics.totalServers = servers.length;
    this.metrics.healthyServers = healthyServers.length;
    this.metrics.activeConnections = servers.reduce((sum, s) => sum + s.currentConnections, 0);
    this.metrics.averageResponseTime = healthyServers.length > 0 ?
      healthyServers.reduce((sum, s) => sum + s.responseTime, 0) / healthyServers.length : 0;

    this.metrics.serverMetrics = servers.map(server => ({
      serverId: server.id,
      requests: Math.floor(Math.random() * 1000), // Simulated
      connections: server.currentConnections,
      responseTime: server.responseTime,
      status: server.status
    }));

    // Calculate requests per second (simplified)
    this.metrics.requestsPerSecond = this.metrics.totalRequests / ((Date.now() - this.startTime) / 1000);
  }

  private startTime = Date.now();
}

export const loadBalancer = new LoadBalancer({
  algorithm: 'least-connections',
  healthCheckInterval: 30000,
  autoScale: {
    enabled: true,
    minInstances: 2,
    maxInstances: 8,
    scaleUpThreshold: 75,
    scaleDownThreshold: 30,
    scaleUpCooldown: 300,
    scaleDownCooldown: 600
  }
});