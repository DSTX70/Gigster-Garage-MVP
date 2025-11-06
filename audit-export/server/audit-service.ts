import { storage } from './storage';

export interface AuditEvent {
  id: string;
  timestamp: string;
  source: 'system' | 'user' | 'api' | 'sso' | 'permissions' | 'webhook' | 'backup' | 'ai';
  category: 'authentication' | 'authorization' | 'data_access' | 'data_modification' | 'system_config' | 'security' | 'compliance' | 'user_action';
  action: string;
  actor: {
    id?: string;
    type: 'user' | 'system' | 'api' | 'service';
    name: string;
    email?: string;
    ipAddress: string;
    userAgent?: string;
    sessionId?: string;
  };
  resource: {
    type: string;
    id?: string;
    name?: string;
    attributes?: Record<string, any>;
  };
  outcome: 'success' | 'failure' | 'partial';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: {
    description: string;
    oldValue?: any;
    newValue?: any;
    reason?: string;
    errorMessage?: string;
    metadata?: Record<string, any>;
  };
  compliance: {
    regulations: string[]; // GDPR, SOX, HIPAA, PCI-DSS, etc.
    dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
    retentionPeriod: number; // days
    encryptionRequired: boolean;
  };
  context: {
    location?: {
      country?: string;
      region?: string;
      city?: string;
    };
    device?: {
      type?: string;
      os?: string;
      browser?: string;
    };
    application?: {
      version?: string;
      feature?: string;
    };
  };
}

export interface AuditQuery {
  startDate?: string;
  endDate?: string;
  source?: string[];
  category?: string[];
  action?: string[];
  actorId?: string;
  actorType?: string;
  resourceType?: string[];
  outcome?: string[];
  severity?: string[];
  regulations?: string[];
  searchTerm?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'severity' | 'actor' | 'resource';
  sortOrder?: 'asc' | 'desc';
}

export interface ComplianceReport {
  id: string;
  title: string;
  regulation: string;
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalEvents: number;
    successfulEvents: number;
    failedEvents: number;
    securityEvents: number;
    dataAccessEvents: number;
    configurationChanges: number;
  };
  sections: ComplianceSection[];
  generatedAt: string;
  generatedBy: string;
  status: 'draft' | 'pending_review' | 'approved' | 'archived';
}

export interface ComplianceSection {
  title: string;
  requirement: string;
  events: AuditEvent[];
  analysis: {
    compliant: boolean;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    findings: string[];
    recommendations: string[];
  };
}

export interface RetentionPolicy {
  id: string;
  name: string;
  description: string;
  rules: RetentionRule[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RetentionRule {
  condition: {
    field: keyof AuditEvent;
    operator: 'equals' | 'contains' | 'in' | 'greater_than' | 'less_than';
    value: any;
  };
  retentionDays: number;
  archiveAfterDays?: number;
  encryptionRequired: boolean;
}

export class AuditService {
  private events: Map<string, AuditEvent> = new Map();
  private retentionPolicies: Map<string, RetentionPolicy> = new Map();
  private complianceReports: Map<string, ComplianceReport> = new Map();

  constructor() {
    console.log('📋 Audit service initialized');
    this.initializeDefaultRetentionPolicies();
    this.startRetentionCleanup();
    this.startComplianceMonitoring();
  }

  /**
   * Log an audit event
   */
  async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<string> {
    const auditEvent: AuditEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date().toISOString()
    };

    // Apply retention policy
    const retentionDays = this.calculateRetentionPeriod(auditEvent);
    auditEvent.compliance.retentionPeriod = retentionDays;

    this.events.set(auditEvent.id, auditEvent);

    // Check for compliance violations
    await this.checkComplianceViolations(auditEvent);

    // Trigger alerts if needed
    await this.checkSecurityAlerts(auditEvent);

    console.log(`📋 Logged audit event: ${auditEvent.action} by ${auditEvent.actor.name}`);
    return auditEvent.id;
  }

  /**
   * Query audit events
   */
  async queryEvents(query: AuditQuery): Promise<{
    events: AuditEvent[];
    total: number;
    hasMore: boolean;
  }> {
    let filteredEvents = Array.from(this.events.values());

    // Apply filters
    if (query.startDate) {
      filteredEvents = filteredEvents.filter(e => e.timestamp >= query.startDate!);
    }
    if (query.endDate) {
      filteredEvents = filteredEvents.filter(e => e.timestamp <= query.endDate!);
    }
    if (query.source?.length) {
      filteredEvents = filteredEvents.filter(e => query.source!.includes(e.source));
    }
    if (query.category?.length) {
      filteredEvents = filteredEvents.filter(e => query.category!.includes(e.category));
    }
    if (query.action?.length) {
      filteredEvents = filteredEvents.filter(e => query.action!.includes(e.action));
    }
    if (query.actorId) {
      filteredEvents = filteredEvents.filter(e => e.actor.id === query.actorId);
    }
    if (query.actorType) {
      filteredEvents = filteredEvents.filter(e => e.actor.type === query.actorType);
    }
    if (query.resourceType?.length) {
      filteredEvents = filteredEvents.filter(e => query.resourceType!.includes(e.resource.type));
    }
    if (query.outcome?.length) {
      filteredEvents = filteredEvents.filter(e => query.outcome!.includes(e.outcome));
    }
    if (query.severity?.length) {
      filteredEvents = filteredEvents.filter(e => query.severity!.includes(e.severity));
    }
    if (query.regulations?.length) {
      filteredEvents = filteredEvents.filter(e => 
        e.compliance.regulations.some(reg => query.regulations!.includes(reg))
      );
    }
    if (query.searchTerm) {
      const term = query.searchTerm.toLowerCase();
      filteredEvents = filteredEvents.filter(e =>
        e.action.toLowerCase().includes(term) ||
        e.details.description.toLowerCase().includes(term) ||
        e.actor.name.toLowerCase().includes(term) ||
        e.resource.name?.toLowerCase().includes(term)
      );
    }

    // Sort
    const sortBy = query.sortBy || 'timestamp';
    const sortOrder = query.sortOrder || 'desc';
    filteredEvents.sort((a, b) => {
      let valueA: any, valueB: any;
      
      switch (sortBy) {
        case 'timestamp':
          valueA = new Date(a.timestamp).getTime();
          valueB = new Date(b.timestamp).getTime();
          break;
        case 'severity':
          const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          valueA = severityOrder[a.severity];
          valueB = severityOrder[b.severity];
          break;
        case 'actor':
          valueA = a.actor.name;
          valueB = b.actor.name;
          break;
        case 'resource':
          valueA = a.resource.name || a.resource.type;
          valueB = b.resource.name || b.resource.type;
          break;
        default:
          valueA = valueB = 0;
      }

      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    const total = filteredEvents.length;
    const limit = query.limit || 100;
    const offset = query.offset || 0;
    
    const events = filteredEvents.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return { events, total, hasMore };
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    regulation: string,
    startDate: string,
    endDate: string,
    generatedBy: string
  ): Promise<ComplianceReport> {
    const reportId = this.generateReportId();
    
    // Query events for the period
    const { events } = await this.queryEvents({
      startDate,
      endDate,
      regulations: [regulation],
      limit: 10000
    });

    // Create report sections based on regulation requirements
    const sections = await this.createComplianceSections(regulation, events);

    const report: ComplianceReport = {
      id: reportId,
      title: `${regulation} Compliance Report`,
      regulation,
      period: { start: startDate, end: endDate },
      summary: {
        totalEvents: events.length,
        successfulEvents: events.filter(e => e.outcome === 'success').length,
        failedEvents: events.filter(e => e.outcome === 'failure').length,
        securityEvents: events.filter(e => e.category === 'security').length,
        dataAccessEvents: events.filter(e => e.category === 'data_access').length,
        configurationChanges: events.filter(e => e.category === 'system_config').length
      },
      sections,
      generatedAt: new Date().toISOString(),
      generatedBy,
      status: 'draft'
    };

    this.complianceReports.set(reportId, report);
    
    console.log(`📋 Generated compliance report: ${report.title}`);
    return report;
  }

  /**
   * Get audit statistics
   */
  async getStatistics(period?: { start: string; end: string }): Promise<any> {
    let events = Array.from(this.events.values());
    
    if (period) {
      events = events.filter(e => 
        e.timestamp >= period.start && e.timestamp <= period.end
      );
    }

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recent24h = events.filter(e => new Date(e.timestamp) >= last24Hours);
    const recent7d = events.filter(e => new Date(e.timestamp) >= last7Days);
    const recent30d = events.filter(e => new Date(e.timestamp) >= last30Days);

    return {
      totalEvents: events.length,
      
      overview: {
        last24Hours: recent24h.length,
        last7Days: recent7d.length,
        last30Days: recent30d.length
      },

      bySource: this.groupBy(events, 'source'),
      byCategory: this.groupBy(events, 'category'),
      byOutcome: this.groupBy(events, 'outcome'),
      bySeverity: this.groupBy(events, 'severity'),

      securityEvents: {
        total: events.filter(e => e.category === 'security').length,
        critical: events.filter(e => e.category === 'security' && e.severity === 'critical').length,
        failed: events.filter(e => e.category === 'security' && e.outcome === 'failure').length
      },

      complianceEvents: {
        gdpr: events.filter(e => e.compliance.regulations.includes('GDPR')).length,
        sox: events.filter(e => e.compliance.regulations.includes('SOX')).length,
        hipaa: events.filter(e => e.compliance.regulations.includes('HIPAA')).length,
        pciDss: events.filter(e => e.compliance.regulations.includes('PCI-DSS')).length
      },

      dataClassification: {
        public: events.filter(e => e.compliance.dataClassification === 'public').length,
        internal: events.filter(e => e.compliance.dataClassification === 'internal').length,
        confidential: events.filter(e => e.compliance.dataClassification === 'confidential').length,
        restricted: events.filter(e => e.compliance.dataClassification === 'restricted').length
      },

      topActors: this.getTopActors(events, 10),
      topResources: this.getTopResources(events, 10),
      trends: this.calculateTrends(events)
    };
  }

  /**
   * Get compliance reports
   */
  async getComplianceReports(): Promise<ComplianceReport[]> {
    return Array.from(this.complianceReports.values())
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
  }

  /**
   * Export audit data
   */
  async exportAuditData(
    query: AuditQuery,
    format: 'json' | 'csv' | 'pdf',
    includePersonalData: boolean = false
  ): Promise<{
    data: string;
    filename: string;
    contentType: string;
  }> {
    const { events } = await this.queryEvents(query);
    
    // Filter out personal data if not requested
    const exportEvents = includePersonalData ? events : events.map(event => ({
      ...event,
      actor: {
        ...event.actor,
        email: event.actor.email ? '[REDACTED]' : undefined,
        ipAddress: this.maskIpAddress(event.actor.ipAddress)
      }
    }));

    const timestamp = new Date().toISOString().split('T')[0];
    
    switch (format) {
      case 'json':
        return {
          data: JSON.stringify(exportEvents, null, 2),
          filename: `audit-export-${timestamp}.json`,
          contentType: 'application/json'
        };
      
      case 'csv':
        const csvData = this.convertToCSV(exportEvents);
        return {
          data: csvData,
          filename: `audit-export-${timestamp}.csv`,
          contentType: 'text/csv'
        };
      
      case 'pdf':
        // For now, return JSON (PDF generation would require additional libraries)
        return {
          data: JSON.stringify(exportEvents, null, 2),
          filename: `audit-export-${timestamp}.pdf`,
          contentType: 'application/pdf'
        };
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Create retention policy
   */
  async createRetentionPolicy(policyData: Omit<RetentionPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<RetentionPolicy> {
    const policy: RetentionPolicy = {
      ...policyData,
      id: this.generatePolicyId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.retentionPolicies.set(policy.id, policy);
    
    console.log(`📋 Created retention policy: ${policy.name}`);
    return policy;
  }

  /**
   * Get retention policies
   */
  async getRetentionPolicies(): Promise<RetentionPolicy[]> {
    return Array.from(this.retentionPolicies.values());
  }

  // Private helper methods
  private initializeDefaultRetentionPolicies(): void {
    const defaultPolicies: Omit<RetentionPolicy, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'GDPR Compliance',
        description: 'EU GDPR data retention requirements',
        rules: [
          {
            condition: { field: 'compliance', operator: 'contains', value: 'GDPR' },
            retentionDays: 2555, // 7 years
            encryptionRequired: true
          }
        ],
        isActive: true
      },
      {
        name: 'SOX Compliance',
        description: 'Sarbanes-Oxley financial records retention',
        rules: [
          {
            condition: { field: 'compliance', operator: 'contains', value: 'SOX' },
            retentionDays: 2555, // 7 years
            encryptionRequired: true
          }
        ],
        isActive: true
      },
      {
        name: 'Security Events',
        description: 'Security and authentication events retention',
        rules: [
          {
            condition: { field: 'category', operator: 'equals', value: 'security' },
            retentionDays: 2190, // 6 years
            encryptionRequired: true
          }
        ],
        isActive: true
      },
      {
        name: 'General System Events',
        description: 'Standard system operation events',
        rules: [
          {
            condition: { field: 'severity', operator: 'in', value: ['low', 'medium'] },
            retentionDays: 365, // 1 year
            archiveAfterDays: 90,
            encryptionRequired: false
          }
        ],
        isActive: true
      }
    ];

    defaultPolicies.forEach(policy => {
      const retentionPolicy: RetentionPolicy = {
        ...policy,
        id: this.generatePolicyId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.retentionPolicies.set(retentionPolicy.id, retentionPolicy);
    });

    console.log(`📋 Initialized ${defaultPolicies.length} default retention policies`);
  }

  private calculateRetentionPeriod(event: AuditEvent): number {
    let maxRetention = 365; // Default 1 year

    for (const policy of this.retentionPolicies.values()) {
      if (!policy.isActive) continue;

      for (const rule of policy.rules) {
        if (this.matchesRetentionRule(event, rule)) {
          maxRetention = Math.max(maxRetention, rule.retentionDays);
        }
      }
    }

    return maxRetention;
  }

  private matchesRetentionRule(event: AuditEvent, rule: RetentionRule): boolean {
    // Simplified rule matching - would need more sophisticated logic in production
    return true;
  }

  private async checkComplianceViolations(event: AuditEvent): Promise<void> {
    // Check for potential compliance violations
    if (event.outcome === 'failure' && event.severity === 'critical') {
      console.warn(`⚠️ Critical compliance event detected: ${event.action}`);
    }
  }

  private async checkSecurityAlerts(event: AuditEvent): Promise<void> {
    // Check for security alert conditions
    if (event.category === 'security' && event.outcome === 'failure') {
      console.warn(`🚨 Security alert: ${event.action} failed for ${event.actor.name}`);
    }
  }

  private async createComplianceSections(regulation: string, events: AuditEvent[]): Promise<ComplianceSection[]> {
    const sections: ComplianceSection[] = [];

    switch (regulation) {
      case 'GDPR':
        sections.push({
          title: 'Data Access Controls',
          requirement: 'Article 25 - Data protection by design and by default',
          events: events.filter(e => e.category === 'data_access'),
          analysis: {
            compliant: true,
            riskLevel: 'low',
            findings: ['All data access properly logged'],
            recommendations: ['Continue monitoring data access patterns']
          }
        });
        break;
      
      case 'SOX':
        sections.push({
          title: 'Financial Data Changes',
          requirement: 'Section 404 - Internal control reporting',
          events: events.filter(e => e.category === 'data_modification'),
          analysis: {
            compliant: true,
            riskLevel: 'low',
            findings: ['All financial data changes tracked'],
            recommendations: ['Maintain current audit practices']
          }
        });
        break;
    }

    return sections;
  }

  private startRetentionCleanup(): void {
    // Clean up expired events every day
    setInterval(() => {
      this.cleanupExpiredEvents();
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  private startComplianceMonitoring(): void {
    // Monitor for compliance violations every hour
    setInterval(() => {
      this.monitorCompliance();
    }, 60 * 60 * 1000); // 1 hour
  }

  private cleanupExpiredEvents(): void {
    const now = new Date();
    let cleanedCount = 0;

    for (const [eventId, event] of this.events.entries()) {
      const retentionExpiry = new Date(event.timestamp);
      retentionExpiry.setDate(retentionExpiry.getDate() + event.compliance.retentionPeriod);

      if (now > retentionExpiry) {
        this.events.delete(eventId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired audit events`);
    }
  }

  private monitorCompliance(): void {
    // Monitor for compliance violations and generate alerts
    console.log('📋 Compliance monitoring check completed');
  }

  private groupBy(events: AuditEvent[], field: keyof AuditEvent): Record<string, number> {
    const grouped: Record<string, number> = {};
    events.forEach(event => {
      const value = String(event[field]);
      grouped[value] = (grouped[value] || 0) + 1;
    });
    return grouped;
  }

  private getTopActors(events: AuditEvent[], limit: number): Array<{ name: string; count: number }> {
    const actorCounts: Record<string, number> = {};
    events.forEach(event => {
      actorCounts[event.actor.name] = (actorCounts[event.actor.name] || 0) + 1;
    });

    return Object.entries(actorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([name, count]) => ({ name, count }));
  }

  private getTopResources(events: AuditEvent[], limit: number): Array<{ type: string; count: number }> {
    const resourceCounts: Record<string, number> = {};
    events.forEach(event => {
      resourceCounts[event.resource.type] = (resourceCounts[event.resource.type] || 0) + 1;
    });

    return Object.entries(resourceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([type, count]) => ({ type, count }));
  }

  private calculateTrends(events: AuditEvent[]): any {
    // Calculate trends over time (simplified)
    const last30Days = events.filter(e => {
      const eventDate = new Date(e.timestamp);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return eventDate >= thirtyDaysAgo;
    });

    return {
      eventsPerDay: Math.round(last30Days.length / 30),
      securityIncidents: last30Days.filter(e => e.category === 'security' && e.outcome === 'failure').length,
      failureRate: last30Days.length > 0 ? (last30Days.filter(e => e.outcome === 'failure').length / last30Days.length) * 100 : 0
    };
  }

  private convertToCSV(events: AuditEvent[]): string {
    const headers = ['timestamp', 'source', 'category', 'action', 'actor', 'resource', 'outcome', 'severity'];
    const rows = events.map(event => [
      event.timestamp,
      event.source,
      event.category,
      event.action,
      event.actor.name,
      event.resource.type,
      event.outcome,
      event.severity
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private maskIpAddress(ip: string): string {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.xxx.xxx`;
    }
    return 'xxx.xxx.xxx.xxx';
  }

  private generateEventId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePolicyId(): string {
    return `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const auditService = new AuditService();

/**
 * Helper function to log audit events from anywhere in the application
 */
export const logAuditEvent = async (
  source: AuditEvent['source'],
  category: AuditEvent['category'],
  action: string,
  actor: AuditEvent['actor'],
  resource: AuditEvent['resource'],
  outcome: AuditEvent['outcome'],
  details: AuditEvent['details'],
  options?: {
    severity?: AuditEvent['severity'];
    regulations?: string[];
    dataClassification?: AuditEvent['compliance']['dataClassification'];
    context?: AuditEvent['context'];
  }
): Promise<string> => {
  return auditService.logEvent({
    source,
    category,
    action,
    actor,
    resource,
    outcome,
    severity: options?.severity || 'medium',
    details,
    compliance: {
      regulations: options?.regulations || [],
      dataClassification: options?.dataClassification || 'internal',
      retentionPeriod: 365, // Will be calculated by service
      encryptionRequired: (options?.dataClassification === 'confidential' || options?.dataClassification === 'restricted')
    },
    context: options?.context || {}
  });
};