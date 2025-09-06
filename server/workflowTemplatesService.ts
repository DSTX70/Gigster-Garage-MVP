import { storage } from "./storage";
import { automatedInvoicingService } from "./automatedInvoicingService";
import { smartNotificationsService } from "./smartNotificationsService";
import type { Task, Project, User, Template } from "@shared/schema";

/**
 * Workflow Templates Service
 * Provides pre-built automation templates, template marketplace, and visual workflow builder
 */

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  tags: string[];
  version: string;
  author: string;
  isPublic: boolean;
  isSystemTemplate: boolean;
  popularity: number;
  rating: number;
  usageCount: number;
  workflow: WorkflowDefinition;
  metadata: TemplateMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowDefinition {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  variables: WorkflowVariable[];
  triggers: WorkflowTrigger[];
  settings: WorkflowSettings;
}

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  position: { x: number; y: number };
  data: Record<string, any>;
  inputs: WorkflowPort[];
  outputs: WorkflowPort[];
}

export interface WorkflowConnection {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
  conditions?: WorkflowCondition[];
}

export interface WorkflowPort {
  id: string;
  name: string;
  type: 'data' | 'event' | 'trigger';
  dataType: string;
  required: boolean;
}

export interface WorkflowVariable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  defaultValue: any;
  description: string;
  isSecret: boolean;
}

export interface WorkflowTrigger {
  id: string;
  type: 'manual' | 'scheduled' | 'event' | 'webhook' | 'condition';
  configuration: Record<string, any>;
  isActive: boolean;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'matches';
  value: any;
  logicalOperator?: 'and' | 'or';
}

export interface WorkflowSettings {
  timeout: number;
  retryAttempts: number;
  errorHandling: 'continue' | 'stop' | 'retry';
  logging: boolean;
  notifications: boolean;
}

export interface TemplateMetadata {
  requirements: string[];
  prerequisites: string[];
  estimatedSetupTime: number; // minutes
  complexity: 'beginner' | 'intermediate' | 'advanced';
  industries: string[];
  useCase: string[];
  screenshots: string[];
  documentation: string;
  changelog: TemplateChangelogEntry[];
}

export interface TemplateChangelogEntry {
  version: string;
  date: Date;
  changes: string[];
  author: string;
}

export type WorkflowCategory = 
  | 'project_management'
  | 'client_communication'
  | 'invoicing_billing'
  | 'time_tracking'
  | 'team_collaboration'
  | 'reporting_analytics'
  | 'marketing_sales'
  | 'customer_service'
  | 'integration'
  | 'custom';

export type WorkflowNodeType =
  | 'trigger'
  | 'action'
  | 'condition'
  | 'data_transform'
  | 'notification'
  | 'integration'
  | 'timer'
  | 'approval'
  | 'custom_script';

export interface InstalledWorkflow {
  id: string;
  templateId: string;
  userId: string;
  name: string;
  isActive: boolean;
  customizations: Record<string, any>;
  statistics: WorkflowStatistics;
  installedAt: Date;
  lastRun?: Date;
  nextRun?: Date;
}

export interface WorkflowStatistics {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  averageExecutionTime: number;
  lastExecutionTime: number;
  errorRate: number;
}

export class WorkflowTemplatesService {
  private templates: Map<string, WorkflowTemplate> = new Map();
  private installedWorkflows: Map<string, InstalledWorkflow> = new Map();
  private isInitialized = false;

  constructor() {
    this.initializeSystemTemplates();
  }

  /**
   * Initialize system workflow templates
   */
  private initializeSystemTemplates() {
    const systemTemplates: Omit<WorkflowTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: "New Client Onboarding",
        description: "Complete workflow for onboarding new clients with automated tasks, document requests, and welcome communications",
        category: 'client_communication',
        tags: ['onboarding', 'client', 'automation', 'welcome'],
        version: '1.0.0',
        author: 'Gigster Garage',
        isPublic: true,
        isSystemTemplate: true,
        popularity: 95,
        rating: 4.8,
        usageCount: 0,
        workflow: {
          nodes: [
            {
              id: 'trigger_1',
              type: 'trigger',
              position: { x: 100, y: 100 },
              data: { triggerType: 'client_created' },
              inputs: [],
              outputs: [{ id: 'out_1', name: 'Client Created', type: 'event', dataType: 'client', required: false }]
            },
            {
              id: 'task_1',
              type: 'action',
              position: { x: 300, y: 100 },
              data: { 
                actionType: 'create_task',
                taskTitle: 'Collect client requirements',
                priority: 'high',
                assignTo: 'project_manager'
              },
              inputs: [{ id: 'in_1', name: 'Client Data', type: 'data', dataType: 'client', required: true }],
              outputs: [{ id: 'out_1', name: 'Task Created', type: 'event', dataType: 'task', required: false }]
            },
            {
              id: 'notification_1',
              type: 'notification',
              position: { x: 500, y: 100 },
              data: {
                notificationType: 'email',
                template: 'client_welcome',
                recipients: ['client_email']
              },
              inputs: [{ id: 'in_1', name: 'Client Data', type: 'data', dataType: 'client', required: true }],
              outputs: []
            }
          ],
          connections: [
            {
              id: 'conn_1',
              sourceNodeId: 'trigger_1',
              sourcePortId: 'out_1',
              targetNodeId: 'task_1',
              targetPortId: 'in_1'
            },
            {
              id: 'conn_2',
              sourceNodeId: 'trigger_1',
              sourcePortId: 'out_1',
              targetNodeId: 'notification_1',
              targetPortId: 'in_1'
            }
          ],
          variables: [
            { id: 'var_1', name: 'project_manager', type: 'string', defaultValue: 'admin', description: 'Default project manager for new clients', isSecret: false }
          ],
          triggers: [
            { id: 'trig_1', type: 'event', configuration: { eventType: 'client_created' }, isActive: true }
          ],
          settings: {
            timeout: 300000,
            retryAttempts: 3,
            errorHandling: 'continue',
            logging: true,
            notifications: true
          }
        },
        metadata: {
          requirements: ['Client management access'],
          prerequisites: ['Email service configured'],
          estimatedSetupTime: 15,
          complexity: 'beginner',
          industries: ['Professional Services', 'Consulting', 'Agency'],
          useCase: ['Client Onboarding', 'Welcome Process'],
          screenshots: [],
          documentation: 'Automated workflow that triggers when a new client is added to the system.',
          changelog: [
            {
              version: '1.0.0',
              date: new Date(),
              changes: ['Initial template release', 'Basic client onboarding workflow'],
              author: 'Gigster Garage'
            }
          ]
        }
      },
      {
        name: "Project Completion Workflow",
        description: "End-to-end workflow for project completion including final deliveries, invoicing, and client feedback collection",
        category: 'project_management',
        tags: ['project', 'completion', 'delivery', 'invoice', 'feedback'],
        version: '1.2.0',
        author: 'Gigster Garage',
        isPublic: true,
        isSystemTemplate: true,
        popularity: 87,
        rating: 4.6,
        usageCount: 0,
        workflow: {
          nodes: [
            {
              id: 'trigger_1',
              type: 'trigger',
              position: { x: 100, y: 100 },
              data: { triggerType: 'project_completed' },
              inputs: [],
              outputs: [{ id: 'out_1', name: 'Project Completed', type: 'event', dataType: 'project', required: false }]
            },
            {
              id: 'invoice_1',
              type: 'action',
              position: { x: 300, y: 50 },
              data: {
                actionType: 'generate_invoice',
                includeTimeTracking: true,
                autoSend: true
              },
              inputs: [{ id: 'in_1', name: 'Project Data', type: 'data', dataType: 'project', required: true }],
              outputs: [{ id: 'out_1', name: 'Invoice Created', type: 'event', dataType: 'invoice', required: false }]
            },
            {
              id: 'notification_1',
              type: 'notification',
              position: { x: 300, y: 150 },
              data: {
                notificationType: 'email',
                template: 'project_completion',
                recipients: ['client_email', 'project_team']
              },
              inputs: [{ id: 'in_1', name: 'Project Data', type: 'data', dataType: 'project', required: true }],
              outputs: []
            },
            {
              id: 'timer_1',
              type: 'timer',
              position: { x: 500, y: 100 },
              data: { delayDays: 3 },
              inputs: [{ id: 'in_1', name: 'Trigger', type: 'event', dataType: 'any', required: true }],
              outputs: [{ id: 'out_1', name: 'Timer Completed', type: 'event', dataType: 'any', required: false }]
            },
            {
              id: 'feedback_1',
              type: 'action',
              position: { x: 700, y: 100 },
              data: {
                actionType: 'send_feedback_request',
                surveyTemplate: 'project_completion_feedback'
              },
              inputs: [{ id: 'in_1', name: 'Delayed Trigger', type: 'event', dataType: 'any', required: true }],
              outputs: []
            }
          ],
          connections: [
            {
              id: 'conn_1',
              sourceNodeId: 'trigger_1',
              sourcePortId: 'out_1',
              targetNodeId: 'invoice_1',
              targetPortId: 'in_1'
            },
            {
              id: 'conn_2',
              sourceNodeId: 'trigger_1',
              sourcePortId: 'out_1',
              targetNodeId: 'notification_1',
              targetPortId: 'in_1'
            },
            {
              id: 'conn_3',
              sourceNodeId: 'trigger_1',
              sourcePortId: 'out_1',
              targetNodeId: 'timer_1',
              targetPortId: 'in_1'
            },
            {
              id: 'conn_4',
              sourceNodeId: 'timer_1',
              sourcePortId: 'out_1',
              targetNodeId: 'feedback_1',
              targetPortId: 'in_1'
            }
          ],
          variables: [
            { id: 'var_1', name: 'feedback_delay_days', type: 'number', defaultValue: 3, description: 'Days to wait before sending feedback request', isSecret: false }
          ],
          triggers: [
            { id: 'trig_1', type: 'event', configuration: { eventType: 'project_completed' }, isActive: true }
          ],
          settings: {
            timeout: 600000,
            retryAttempts: 2,
            errorHandling: 'continue',
            logging: true,
            notifications: true
          }
        },
        metadata: {
          requirements: ['Project management access', 'Invoice generation access'],
          prerequisites: ['Email service configured', 'Payment processing setup'],
          estimatedSetupTime: 25,
          complexity: 'intermediate',
          industries: ['Software Development', 'Creative Services', 'Consulting'],
          useCase: ['Project Completion', 'Client Satisfaction', 'Payment Collection'],
          screenshots: [],
          documentation: 'Comprehensive workflow that automates project completion tasks including invoicing and feedback collection.',
          changelog: [
            {
              version: '1.2.0',
              date: new Date(),
              changes: ['Added automatic feedback collection', 'Improved invoice generation logic'],
              author: 'Gigster Garage'
            }
          ]
        }
      },
      {
        name: "Task Escalation Matrix",
        description: "Smart escalation workflow that automatically escalates overdue high-priority tasks through management hierarchy",
        category: 'project_management',
        tags: ['escalation', 'tasks', 'management', 'priority'],
        version: '1.1.0',
        author: 'Gigster Garage',
        isPublic: true,
        isSystemTemplate: true,
        popularity: 78,
        rating: 4.4,
        usageCount: 0,
        workflow: {
          nodes: [
            {
              id: 'trigger_1',
              type: 'trigger',
              position: { x: 100, y: 100 },
              data: { triggerType: 'scheduled', schedule: 'daily' },
              inputs: [],
              outputs: [{ id: 'out_1', name: 'Daily Check', type: 'event', dataType: 'any', required: false }]
            },
            {
              id: 'condition_1',
              type: 'condition',
              position: { x: 300, y: 100 },
              data: {
                conditionType: 'task_overdue',
                criteria: { priority: 'high', overdueDays: 1 }
              },
              inputs: [{ id: 'in_1', name: 'Trigger', type: 'event', dataType: 'any', required: true }],
              outputs: [
                { id: 'out_true', name: 'Overdue Tasks Found', type: 'data', dataType: 'task_list', required: false },
                { id: 'out_false', name: 'No Overdue Tasks', type: 'event', dataType: 'any', required: false }
              ]
            },
            {
              id: 'escalation_1',
              type: 'action',
              position: { x: 500, y: 50 },
              data: {
                actionType: 'escalate_to_manager',
                escalationLevel: 1
              },
              inputs: [{ id: 'in_1', name: 'Overdue Tasks', type: 'data', dataType: 'task_list', required: true }],
              outputs: [{ id: 'out_1', name: 'Level 1 Escalation', type: 'event', dataType: 'escalation', required: false }]
            }
          ],
          connections: [
            {
              id: 'conn_1',
              sourceNodeId: 'trigger_1',
              sourcePortId: 'out_1',
              targetNodeId: 'condition_1',
              targetPortId: 'in_1'
            },
            {
              id: 'conn_2',
              sourceNodeId: 'condition_1',
              sourcePortId: 'out_true',
              targetNodeId: 'escalation_1',
              targetPortId: 'in_1'
            }
          ],
          variables: [
            { id: 'var_1', name: 'escalation_threshold_days', type: 'number', defaultValue: 1, description: 'Days overdue before escalation', isSecret: false }
          ],
          triggers: [
            { id: 'trig_1', type: 'scheduled', configuration: { schedule: '0 9 * * *' }, isActive: true }
          ],
          settings: {
            timeout: 120000,
            retryAttempts: 3,
            errorHandling: 'stop',
            logging: true,
            notifications: true
          }
        },
        metadata: {
          requirements: ['Task management access', 'User hierarchy access'],
          prerequisites: ['Team structure configured', 'Manager assignments set'],
          estimatedSetupTime: 20,
          complexity: 'intermediate',
          industries: ['All Industries'],
          useCase: ['Task Management', 'Team Oversight', 'Quality Assurance'],
          screenshots: [],
          documentation: 'Automated escalation system for overdue high-priority tasks.',
          changelog: [
            {
              version: '1.1.0',
              date: new Date(),
              changes: ['Enhanced condition logic', 'Added multiple escalation levels'],
              author: 'Gigster Garage'
            }
          ]
        }
      },
      {
        name: "Monthly Reporting Suite",
        description: "Comprehensive monthly reporting workflow that generates and distributes automated reports to stakeholders",
        category: 'reporting_analytics',
        tags: ['reporting', 'analytics', 'monthly', 'automation'],
        version: '1.0.0',
        author: 'Gigster Garage',
        isPublic: true,
        isSystemTemplate: true,
        popularity: 72,
        rating: 4.3,
        usageCount: 0,
        workflow: {
          nodes: [
            {
              id: 'trigger_1',
              type: 'trigger',
              position: { x: 100, y: 100 },
              data: { triggerType: 'scheduled', schedule: 'monthly' },
              inputs: [],
              outputs: [{ id: 'out_1', name: 'Monthly Trigger', type: 'event', dataType: 'date', required: false }]
            },
            {
              id: 'report_1',
              type: 'action',
              position: { x: 300, y: 100 },
              data: {
                actionType: 'generate_report',
                reportType: 'monthly_summary',
                includeCharts: true
              },
              inputs: [{ id: 'in_1', name: 'Date Range', type: 'data', dataType: 'date', required: true }],
              outputs: [{ id: 'out_1', name: 'Report Generated', type: 'data', dataType: 'report', required: false }]
            },
            {
              id: 'notification_1',
              type: 'notification',
              position: { x: 500, y: 100 },
              data: {
                notificationType: 'email',
                template: 'monthly_report_distribution',
                recipients: ['stakeholders', 'management']
              },
              inputs: [{ id: 'in_1', name: 'Report Data', type: 'data', dataType: 'report', required: true }],
              outputs: []
            }
          ],
          connections: [
            {
              id: 'conn_1',
              sourceNodeId: 'trigger_1',
              sourcePortId: 'out_1',
              targetNodeId: 'report_1',
              targetPortId: 'in_1'
            },
            {
              id: 'conn_2',
              sourceNodeId: 'report_1',
              sourcePortId: 'out_1',
              targetNodeId: 'notification_1',
              targetPortId: 'in_1'
            }
          ],
          variables: [
            { id: 'var_1', name: 'report_day', type: 'number', defaultValue: 1, description: 'Day of month to generate report', isSecret: false }
          ],
          triggers: [
            { id: 'trig_1', type: 'scheduled', configuration: { schedule: '0 8 1 * *' }, isActive: true }
          ],
          settings: {
            timeout: 900000,
            retryAttempts: 2,
            errorHandling: 'retry',
            logging: true,
            notifications: true
          }
        },
        metadata: {
          requirements: ['Reporting access', 'Data export access'],
          prerequisites: ['Data sources configured', 'Stakeholder list maintained'],
          estimatedSetupTime: 30,
          complexity: 'intermediate',
          industries: ['All Industries'],
          useCase: ['Business Intelligence', 'Stakeholder Communication', 'Performance Tracking'],
          screenshots: [],
          documentation: 'Monthly automated reporting system with stakeholder distribution.',
          changelog: [
            {
              version: '1.0.0',
              date: new Date(),
              changes: ['Initial template release', 'Monthly report generation'],
              author: 'Gigster Garage'
            }
          ]
        }
      }
    ];

    systemTemplates.forEach((template, index) => {
      const templateWithId = {
        ...template,
        id: `system_template_${index + 1}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.templates.set(templateWithId.id, templateWithId);
    });

    this.isInitialized = true;
    console.log(`📋 Initialized ${systemTemplates.length} system workflow templates`);
  }

  /**
   * Get all available templates
   */
  public getAllTemplates(): WorkflowTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get templates by category
   */
  public getTemplatesByCategory(category: WorkflowCategory): WorkflowTemplate[] {
    return Array.from(this.templates.values()).filter(template => template.category === category);
  }

  /**
   * Search templates by query
   */
  public searchTemplates(query: string, filters?: {
    category?: WorkflowCategory;
    complexity?: string;
    tags?: string[];
    minRating?: number;
  }): WorkflowTemplate[] {
    let results = Array.from(this.templates.values());

    // Text search
    if (query) {
      const searchLower = query.toLowerCase();
      results = results.filter(template => 
        template.name.toLowerCase().includes(searchLower) ||
        template.description.toLowerCase().includes(searchLower) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply filters
    if (filters) {
      if (filters.category) {
        results = results.filter(template => template.category === filters.category);
      }
      if (filters.complexity) {
        results = results.filter(template => template.metadata.complexity === filters.complexity);
      }
      if (filters.tags && filters.tags.length > 0) {
        results = results.filter(template => 
          filters.tags!.some(tag => template.tags.includes(tag))
        );
      }
      if (filters.minRating) {
        results = results.filter(template => template.rating >= filters.minRating!);
      }
    }

    // Sort by popularity
    return results.sort((a, b) => b.popularity - a.popularity);
  }

  /**
   * Get template by ID
   */
  public getTemplate(id: string): WorkflowTemplate | null {
    return this.templates.get(id) || null;
  }

  /**
   * Install template as workflow
   */
  public async installTemplate(templateId: string, userId: string, customizations?: Record<string, any>): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const installedWorkflow: InstalledWorkflow = {
      id: workflowId,
      templateId,
      userId,
      name: customizations?.name || template.name,
      isActive: true,
      customizations: customizations || {},
      statistics: {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        averageExecutionTime: 0,
        lastExecutionTime: 0,
        errorRate: 0
      },
      installedAt: new Date()
    };

    this.installedWorkflows.set(workflowId, installedWorkflow);

    // Update template usage count
    template.usageCount++;
    
    console.log(`✨ Installed workflow template "${template.name}" for user ${userId}`);
    return workflowId;
  }

  /**
   * Get user's installed workflows
   */
  public getUserWorkflows(userId: string): InstalledWorkflow[] {
    return Array.from(this.installedWorkflows.values())
      .filter(workflow => workflow.userId === userId);
  }

  /**
   * Create custom template
   */
  public createCustomTemplate(
    template: Omit<WorkflowTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isSystemTemplate' | 'usageCount'>
  ): string {
    const templateId = `custom_template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullTemplate: WorkflowTemplate = {
      ...template,
      id: templateId,
      isSystemTemplate: false,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.templates.set(templateId, fullTemplate);
    console.log(`✨ Created custom template: ${fullTemplate.name}`);
    return templateId;
  }

  /**
   * Export template as JSON
   */
  public exportTemplate(templateId: string): string {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    return JSON.stringify(template, null, 2);
  }

  /**
   * Import template from JSON
   */
  public importTemplate(templateJson: string, userId: string): string {
    try {
      const templateData = JSON.parse(templateJson);
      
      // Validate template structure (simplified)
      if (!templateData.name || !templateData.workflow) {
        throw new Error('Invalid template structure');
      }

      // Create new template
      const templateId = this.createCustomTemplate({
        ...templateData,
        author: userId,
        isPublic: false,
        popularity: 0,
        rating: 0
      });

      console.log(`📥 Imported template: ${templateData.name}`);
      return templateId;
    } catch (error) {
      console.error('Failed to import template:', error);
      throw new Error('Invalid template format');
    }
  }

  /**
   * Execute workflow (simplified implementation)
   */
  public async executeWorkflow(workflowId: string, trigger?: any): Promise<boolean> {
    const workflow = this.installedWorkflows.get(workflowId);
    if (!workflow || !workflow.isActive) {
      console.error(`Workflow ${workflowId} not found or inactive`);
      return false;
    }

    const template = this.templates.get(workflow.templateId);
    if (!template) {
      console.error(`Template ${workflow.templateId} not found for workflow ${workflowId}`);
      return false;
    }

    try {
      console.log(`🔄 Executing workflow: ${workflow.name}`);
      const startTime = Date.now();

      // Simplified workflow execution
      // In a real implementation, this would process nodes and connections
      await this.processWorkflowNodes(template.workflow, trigger);

      const executionTime = Date.now() - startTime;
      
      // Update statistics
      workflow.statistics.totalRuns++;
      workflow.statistics.successfulRuns++;
      workflow.statistics.lastExecutionTime = executionTime;
      workflow.statistics.averageExecutionTime = 
        ((workflow.statistics.averageExecutionTime * (workflow.statistics.totalRuns - 1)) + executionTime) / workflow.statistics.totalRuns;
      workflow.lastRun = new Date();

      console.log(`✅ Workflow "${workflow.name}" completed in ${executionTime}ms`);
      return true;
    } catch (error) {
      console.error(`❌ Workflow "${workflow.name}" failed:`, error);
      
      workflow.statistics.totalRuns++;
      workflow.statistics.failedRuns++;
      workflow.statistics.errorRate = workflow.statistics.failedRuns / workflow.statistics.totalRuns;
      
      return false;
    }
  }

  /**
   * Process workflow nodes (simplified)
   */
  private async processWorkflowNodes(workflow: WorkflowDefinition, trigger?: any): Promise<void> {
    // Simplified node processing
    for (const node of workflow.nodes) {
      await this.processNode(node, trigger);
      // Add small delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Process individual workflow node
   */
  private async processNode(node: WorkflowNode, data?: any): Promise<any> {
    console.log(`  Processing node: ${node.type} (${node.id})`);
    
    switch (node.type) {
      case 'trigger':
        return { type: 'trigger', data: node.data };
      
      case 'action':
        return await this.processAction(node, data);
      
      case 'condition':
        return await this.processCondition(node, data);
      
      case 'notification':
        return await this.processNotification(node, data);
      
      case 'timer':
        return await this.processTimer(node, data);
      
      default:
        console.log(`    Unsupported node type: ${node.type}`);
        return null;
    }
  }

  /**
   * Process action node
   */
  private async processAction(node: WorkflowNode, data?: any): Promise<any> {
    const actionType = node.data.actionType;
    console.log(`    Executing action: ${actionType}`);
    
    switch (actionType) {
      case 'create_task':
        // Would integrate with task creation system
        return { type: 'task_created', taskId: 'mock_task_id' };
      
      case 'generate_invoice':
        // Would integrate with invoice generation
        return { type: 'invoice_created', invoiceId: 'mock_invoice_id' };
      
      case 'send_feedback_request':
        // Would integrate with feedback system
        return { type: 'feedback_sent' };
      
      default:
        return { type: 'action_completed' };
    }
  }

  /**
   * Process condition node
   */
  private async processCondition(node: WorkflowNode, data?: any): Promise<any> {
    // Simplified condition evaluation
    console.log(`    Evaluating condition: ${node.data.conditionType}`);
    
    // Mock condition result
    const conditionMet = Math.random() > 0.5;
    return { type: 'condition_result', result: conditionMet };
  }

  /**
   * Process notification node
   */
  private async processNotification(node: WorkflowNode, data?: any): Promise<any> {
    console.log(`    Sending notification: ${node.data.notificationType}`);
    
    // Would integrate with notification services
    return { type: 'notification_sent' };
  }

  /**
   * Process timer node
   */
  private async processTimer(node: WorkflowNode, data?: any): Promise<any> {
    const delayDays = node.data.delayDays || 0;
    console.log(`    Timer set for ${delayDays} days`);
    
    // In practice, this would schedule for later execution
    return { type: 'timer_set', delayDays };
  }

  /**
   * Get workflow statistics
   */
  public getWorkflowStats() {
    return {
      totalTemplates: this.templates.size,
      systemTemplates: Array.from(this.templates.values()).filter(t => t.isSystemTemplate).length,
      customTemplates: Array.from(this.templates.values()).filter(t => !t.isSystemTemplate).length,
      installedWorkflows: this.installedWorkflows.size,
      activeWorkflows: Array.from(this.installedWorkflows.values()).filter(w => w.isActive).length,
      totalExecutions: Array.from(this.installedWorkflows.values()).reduce((sum, w) => sum + w.statistics.totalRuns, 0)
    };
  }

  /**
   * Get popular templates
   */
  public getPopularTemplates(limit: number = 10): WorkflowTemplate[] {
    return Array.from(this.templates.values())
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  }

  /**
   * Manual workflow execution trigger
   */
  public async manualTrigger(): Promise<void> {
    console.log("🔧 Manual workflow templates trigger");
    
    const activeWorkflows = Array.from(this.installedWorkflows.values())
      .filter(workflow => workflow.isActive);
    
    if (activeWorkflows.length === 0) {
      console.log("No active workflows to execute");
      return;
    }

    console.log(`Found ${activeWorkflows.length} active workflows`);
    
    // Execute a few workflows for demonstration
    for (const workflow of activeWorkflows.slice(0, 2)) {
      await this.executeWorkflow(workflow.id, { trigger: 'manual' });
    }
  }
}

// Export singleton instance
export const workflowTemplatesService = new WorkflowTemplatesService();