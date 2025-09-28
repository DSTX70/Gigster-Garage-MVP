import { storage } from './storage';
import type { Task, Project, User, TimeLog, Invoice, Proposal } from '@shared/schema';

export interface ReportConfig {
  id: string;
  name: string;
  description?: string;
  type: 'productivity' | 'financial' | 'project' | 'team' | 'time' | 'custom';
  timeRange: {
    start: Date;
    end: Date;
    preset?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  };
  filters: {
    projectIds?: string[];
    userIds?: string[];
    taskStatuses?: string[];
    priorities?: string[];
    tags?: string[];
  };
  metrics: ReportMetric[];
  visualizations: ReportVisualization[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportMetric {
  id: string;
  name: string;
  type: 'count' | 'sum' | 'average' | 'percentage' | 'ratio';
  field: string;
  aggregation?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  target?: number;
  unit?: string;
}

export interface ReportVisualization {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'table' | 'kpi';
  title: string;
  metricIds: string[];
  config: {
    xAxis?: string;
    yAxis?: string;
    groupBy?: string;
    colors?: string[];
    showLegend?: boolean;
    showGrid?: boolean;
  };
}

export interface ReportData {
  config: ReportConfig;
  data: {
    metrics: Record<string, any>;
    timeSeries: Record<string, any[]>;
    aggregated: Record<string, any>;
    rawData: Record<string, any[]>;
  };
  generatedAt: Date;
  executionTime: number;
}

export class AdvancedReportingService {
  private reports: Map<string, ReportConfig> = new Map();

  /**
   * Create a new custom report configuration
   */
  async createReport(config: Omit<ReportConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReportConfig> {
    const report: ReportConfig = {
      ...config,
      id: this.generateReportId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.reports.set(report.id, report);
    console.log(`📊 Created new report: ${report.name}`);
    return report;
  }

  /**
   * Update an existing report configuration
   */
  async updateReport(id: string, updates: Partial<ReportConfig>): Promise<ReportConfig> {
    const existing = this.reports.get(id);
    if (!existing) {
      throw new Error(`Report not found: ${id}`);
    }

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };

    this.reports.set(id, updated);
    console.log(`📊 Updated report: ${updated.name}`);
    return updated;
  }

  /**
   * Delete a report configuration
   */
  async deleteReport(id: string): Promise<void> {
    if (!this.reports.has(id)) {
      throw new Error(`Report not found: ${id}`);
    }

    this.reports.delete(id);
    console.log(`📊 Deleted report: ${id}`);
  }

  /**
   * Get all report configurations
   */
  async getReports(userId?: string): Promise<ReportConfig[]> {
    const allReports = Array.from(this.reports.values());
    
    if (userId) {
      return allReports.filter(report => report.createdBy === userId);
    }
    
    return allReports;
  }

  /**
   * Get a specific report configuration
   */
  async getReport(id: string): Promise<ReportConfig | null> {
    return this.reports.get(id) || null;
  }

  /**
   * Generate report data based on configuration
   */
  async generateReport(reportId: string): Promise<ReportData> {
    const startTime = Date.now();
    const config = this.reports.get(reportId);
    
    if (!config) {
      throw new Error(`Report not found: ${reportId}`);
    }

    console.log(`📊 Generating report: ${config.name}`);

    // Fetch all necessary data
    const [tasks, projects, users, timeLogs, invoices, proposals] = await Promise.all([
      storage.getTasks(),
      storage.getProjects(),
      storage.getUsers(),
      storage.getTimeLogs(),
      storage.getInvoices(),
      storage.getProposals()
    ]);

    // Apply filters
    const filteredData = this.applyFilters({
      tasks, projects, users, timeLogs, invoices, proposals
    }, config.filters, config.timeRange);

    // Calculate metrics
    const metrics = await this.calculateMetrics(filteredData, config.metrics);
    const timeSeries = await this.generateTimeSeries(filteredData, config.metrics, config.timeRange);
    const aggregated = await this.generateAggregatedData(filteredData, config.metrics);

    const executionTime = Date.now() - startTime;

    const reportData: ReportData = {
      config,
      data: {
        metrics,
        timeSeries,
        aggregated,
        rawData: filteredData
      },
      generatedAt: new Date(),
      executionTime
    };

    console.log(`✅ Report generated in ${executionTime}ms`);
    return reportData;
  }

  /**
   * Generate productivity report
   */
  async generateProductivityReport(timeRange: { start: Date; end: Date }, userIds?: string[]): Promise<ReportData> {
    const config: ReportConfig = {
      id: 'productivity_report',
      name: 'Productivity Report',
      description: 'Team productivity and task completion analysis',
      type: 'productivity',
      timeRange,
      filters: { userIds },
      metrics: [
        {
          id: 'tasks_completed',
          name: 'Tasks Completed',
          type: 'count',
          field: 'status',
          aggregation: 'daily'
        },
        {
          id: 'avg_completion_time',
          name: 'Average Completion Time',
          type: 'average',
          field: 'completionTime',
          unit: 'hours'
        },
        {
          id: 'productivity_score',
          name: 'Productivity Score',
          type: 'percentage',
          field: 'completed_vs_assigned'
        }
      ],
      visualizations: [
        {
          id: 'completion_trend',
          type: 'line',
          title: 'Task Completion Trend',
          metricIds: ['tasks_completed'],
          config: { xAxis: 'date', yAxis: 'count', showGrid: true }
        },
        {
          id: 'team_performance',
          type: 'bar',
          title: 'Team Performance',
          metricIds: ['productivity_score'],
          config: { xAxis: 'user', yAxis: 'percentage' }
        }
      ],
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return this.generateReportFromConfig(config);
  }

  /**
   * Generate financial report
   */
  async generateFinancialReport(timeRange: { start: Date; end: Date }): Promise<ReportData> {
    const config: ReportConfig = {
      id: 'financial_report',
      name: 'Financial Report',
      description: 'Revenue, invoicing, and financial performance analysis',
      type: 'financial',
      timeRange,
      filters: {},
      metrics: [
        {
          id: 'total_revenue',
          name: 'Total Revenue',
          type: 'sum',
          field: 'amount',
          unit: 'USD'
        },
        {
          id: 'outstanding_invoices',
          name: 'Outstanding Invoices',
          type: 'count',
          field: 'status'
        },
        {
          id: 'payment_rate',
          name: 'Payment Rate',
          type: 'percentage',
          field: 'paid_vs_sent'
        }
      ],
      visualizations: [
        {
          id: 'revenue_trend',
          type: 'area',
          title: 'Revenue Trend',
          metricIds: ['total_revenue'],
          config: { xAxis: 'month', yAxis: 'amount' }
        },
        {
          id: 'invoice_status',
          type: 'pie',
          title: 'Invoice Status Distribution',
          metricIds: ['outstanding_invoices'],
          config: { groupBy: 'status' }
        }
      ],
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return this.generateReportFromConfig(config);
  }

  /**
   * Generate project performance report
   */
  async generateProjectReport(projectId: string, timeRange: { start: Date; end: Date }): Promise<ReportData> {
    const config: ReportConfig = {
      id: `project_report_${projectId}`,
      name: 'Project Performance Report',
      description: 'Detailed project progress and team performance analysis',
      type: 'project',
      timeRange,
      filters: { projectIds: [projectId] },
      metrics: [
        {
          id: 'project_completion',
          name: 'Project Completion',
          type: 'percentage',
          field: 'completion_rate'
        },
        {
          id: 'time_spent',
          name: 'Time Spent',
          type: 'sum',
          field: 'duration',
          unit: 'hours'
        },
        {
          id: 'team_velocity',
          name: 'Team Velocity',
          type: 'average',
          field: 'tasks_per_week',
          aggregation: 'weekly'
        }
      ],
      visualizations: [
        {
          id: 'progress_timeline',
          type: 'line',
          title: 'Project Progress Timeline',
          metricIds: ['project_completion'],
          config: { xAxis: 'week', yAxis: 'percentage' }
        },
        {
          id: 'team_contribution',
          type: 'bar',
          title: 'Team Contribution',
          metricIds: ['time_spent'],
          config: { xAxis: 'user', yAxis: 'hours' }
        }
      ],
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return this.generateReportFromConfig(config);
  }

  /**
   * Generate time tracking report
   */
  async generateTimeTrackingReport(timeRange: { start: Date; end: Date }, userIds?: string[]): Promise<ReportData> {
    const config: ReportConfig = {
      id: 'time_tracking_report',
      name: 'Time Tracking Report',
      description: 'Detailed time allocation and productivity analysis',
      type: 'time',
      timeRange,
      filters: { userIds },
      metrics: [
        {
          id: 'total_hours',
          name: 'Total Hours',
          type: 'sum',
          field: 'duration',
          unit: 'hours'
        },
        {
          id: 'billable_hours',
          name: 'Billable Hours',
          type: 'sum',
          field: 'billable_duration',
          unit: 'hours'
        },
        {
          id: 'utilization_rate',
          name: 'Utilization Rate',
          type: 'percentage',
          field: 'billable_vs_total'
        }
      ],
      visualizations: [
        {
          id: 'daily_hours',
          type: 'bar',
          title: 'Daily Time Allocation',
          metricIds: ['total_hours'],
          config: { xAxis: 'date', yAxis: 'hours' }
        },
        {
          id: 'project_distribution',
          type: 'pie',
          title: 'Time by Project',
          metricIds: ['total_hours'],
          config: { groupBy: 'project' }
        }
      ],
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return this.generateReportFromConfig(config);
  }

  // Private helper methods

  private async generateReportFromConfig(config: ReportConfig): Promise<ReportData> {
    this.reports.set(config.id, config);
    return this.generateReport(config.id);
  }

  private applyFilters(data: any, filters: ReportConfig['filters'], timeRange: ReportConfig['timeRange']) {
    let { tasks, projects, users, timeLogs, invoices, proposals } = data;

    // Apply time range filter
    const start = timeRange.start;
    const end = timeRange.end;

    tasks = tasks.filter((task: Task) => {
      const createdAt = new Date(task.createdAt);
      return createdAt >= start && createdAt <= end;
    });

    timeLogs = timeLogs.filter((log: TimeLog) => {
      const date = new Date(log.date);
      return date >= start && date <= end;
    });

    // Apply other filters
    if (filters.projectIds?.length) {
      tasks = tasks.filter((task: Task) => 
        filters.projectIds!.includes(task.projectId || '')
      );
      projects = projects.filter((project: Project) => 
        filters.projectIds!.includes(project.id)
      );
    }

    if (filters.userIds?.length) {
      tasks = tasks.filter((task: Task) => 
        filters.userIds!.includes(task.assignedToId || '') ||
        filters.userIds!.includes(task.createdById || '')
      );
      timeLogs = timeLogs.filter((log: TimeLog) => 
        filters.userIds!.includes(log.userId)
      );
    }

    if (filters.taskStatuses?.length) {
      tasks = tasks.filter((task: Task) => 
        filters.taskStatuses!.includes(task.status)
      );
    }

    if (filters.priorities?.length) {
      tasks = tasks.filter((task: Task) => 
        filters.priorities!.includes(task.priority)
      );
    }

    return { tasks, projects, users, timeLogs, invoices, proposals };
  }

  private async calculateMetrics(data: any, metrics: ReportMetric[]): Promise<Record<string, any>> {
    const results: Record<string, any> = {};

    for (const metric of metrics) {
      const value = await this.calculateMetricValue(data, metric);
      results[metric.id] = {
        name: metric.name,
        value,
        unit: metric.unit,
        type: metric.type
      };
    }

    return results;
  }

  private async calculateMetricValue(data: any, metric: ReportMetric): Promise<number> {
    const { tasks, timeLogs, invoices } = data;

    switch (metric.id) {
      case 'tasks_completed':
        return tasks.filter((t: Task) => t.status === 'completed').length;
      
      case 'total_hours':
        return timeLogs.reduce((sum: number, log: TimeLog) => sum + (log.duration || 0), 0) / 60; // Convert to hours
      
      case 'total_revenue':
        return invoices
          .filter((inv: Invoice) => inv.status === 'paid')
          .reduce((sum: number, inv: Invoice) => sum + (inv.totalAmount || 0), 0);
      
      case 'productivity_score':
        const completed = tasks.filter((t: Task) => t.status === 'completed').length;
        const total = tasks.length;
        return total > 0 ? (completed / total) * 100 : 0;
      
      case 'payment_rate':
        const paidInvoices = invoices.filter((inv: Invoice) => inv.status === 'paid').length;
        const totalInvoices = invoices.length;
        return totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;
      
      default:
        return 0;
    }
  }

  private async generateTimeSeries(data: any, metrics: ReportMetric[], timeRange: ReportConfig['timeRange']): Promise<Record<string, any[]>> {
    const series: Record<string, any[]> = {};

    // Generate daily data points for the time range
    const start = new Date(timeRange.start);
    const end = new Date(timeRange.end);
    const dates: Date[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }

    for (const metric of metrics) {
      if (metric.aggregation) {
        series[metric.id] = dates.map(date => ({
          date: date.toISOString().split('T')[0],
          value: this.getMetricValueForDate(data, metric, date)
        }));
      }
    }

    return series;
  }

  private getMetricValueForDate(data: any, metric: ReportMetric, date: Date): number {
    const { tasks, timeLogs } = data;
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    switch (metric.id) {
      case 'tasks_completed':
        return tasks.filter((t: Task) => {
          const completedAt = t.completedAt ? new Date(t.completedAt) : null;
          return completedAt && completedAt >= dayStart && completedAt <= dayEnd;
        }).length;
      
      case 'total_hours':
        return timeLogs
          .filter((log: TimeLog) => {
            const logDate = new Date(log.date);
            return logDate >= dayStart && logDate <= dayEnd;
          })
          .reduce((sum: number, log: TimeLog) => sum + (log.duration || 0), 0) / 60;
      
      default:
        return 0;
    }
  }

  private async generateAggregatedData(data: any, metrics: ReportMetric[]): Promise<Record<string, any>> {
    const { tasks, projects, users, timeLogs } = data;
    
    return {
      tasksByStatus: this.groupBy(tasks, 'status'),
      tasksByPriority: this.groupBy(tasks, 'priority'),
      tasksByProject: this.groupBy(tasks, 'projectId'),
      tasksByUser: this.groupBy(tasks, 'assignedToId'),
      timeByProject: this.aggregateTimeByProject(timeLogs, projects),
      timeByUser: this.aggregateTimeByUser(timeLogs, users)
    };
  }

  private groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((groups, item) => {
      const value = item[key] || 'unassigned';
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {});
  }

  private aggregateTimeByProject(timeLogs: TimeLog[], projects: Project[]): Record<string, number> {
    const projectTime: Record<string, number> = {};
    
    projects.forEach(project => {
      const projectLogs = timeLogs.filter(log => log.projectId === project.id);
      const totalMinutes = projectLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
      projectTime[project.name] = totalMinutes / 60; // Convert to hours
    });

    return projectTime;
  }

  private aggregateTimeByUser(timeLogs: TimeLog[], users: User[]): Record<string, number> {
    const userTime: Record<string, number> = {};
    
    users.forEach(user => {
      const userLogs = timeLogs.filter(log => log.userId === user.id);
      const totalMinutes = userLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
      userTime[user.name] = totalMinutes / 60; // Convert to hours
    });

    return userTime;
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get available report templates
   */
  getReportTemplates(): Partial<ReportConfig>[] {
    return [
      {
        name: 'Team Productivity Dashboard',
        description: 'Overview of team productivity and task completion rates',
        type: 'productivity',
        metrics: [
          { id: 'tasks_completed', name: 'Tasks Completed', type: 'count', field: 'status' },
          { id: 'productivity_score', name: 'Productivity Score', type: 'percentage', field: 'completion_rate' }
        ]
      },
      {
        name: 'Financial Performance Report',
        description: 'Revenue tracking and financial metrics',
        type: 'financial',
        metrics: [
          { id: 'total_revenue', name: 'Total Revenue', type: 'sum', field: 'amount', unit: 'USD' },
          { id: 'payment_rate', name: 'Payment Rate', type: 'percentage', field: 'paid_rate' }
        ]
      },
      {
        name: 'Project Status Report',
        description: 'Project progress and timeline analysis',
        type: 'project',
        metrics: [
          { id: 'project_completion', name: 'Completion Rate', type: 'percentage', field: 'completion' },
          { id: 'time_spent', name: 'Time Invested', type: 'sum', field: 'duration', unit: 'hours' }
        ]
      },
      {
        name: 'Time Tracking Summary',
        description: 'Detailed time allocation and utilization report',
        type: 'time',
        metrics: [
          { id: 'total_hours', name: 'Total Hours', type: 'sum', field: 'duration', unit: 'hours' },
          { id: 'billable_hours', name: 'Billable Hours', type: 'sum', field: 'billable_duration', unit: 'hours' }
        ]
      }
    ];
  }
}

export const advancedReportingService = new AdvancedReportingService();