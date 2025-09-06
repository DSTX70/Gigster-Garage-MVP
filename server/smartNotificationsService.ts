import { storage } from "./storage";
import { sendHighPriorityTaskNotification, sendSMSNotification } from "./emailService";
import { format, isAfter, isBefore, addDays, addHours, startOfDay, endOfDay } from "date-fns";
import type { Task, Project, User, TimeLog, Invoice } from "@shared/schema";

/**
 * Smart Notifications Service
 * Provides intelligent, context-aware notifications with customizable triggers
 * and multi-channel delivery (email, SMS, in-app, push)
 */

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  trigger: NotificationTrigger;
  conditions: NotificationCondition[];
  actions: NotificationAction[];
  isActive: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  escalationRules?: EscalationRule[];
  batchingEnabled: boolean;
  batchingWindow: number; // minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationTrigger {
  type: 'time_based' | 'event_based' | 'threshold_based' | 'status_change';
  schedule?: string; // cron-like schedule for time_based
  events?: string[]; // event types for event_based  
  thresholds?: { field: string; operator: string; value: any }[]; // for threshold_based
  statusChanges?: { from: string; to: string }[]; // for status_change
}

export interface NotificationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
  value: any;
  entityType: 'task' | 'project' | 'invoice' | 'user' | 'time_log';
}

export interface NotificationAction {
  type: 'email' | 'sms' | 'in_app' | 'push' | 'webhook';
  recipients: NotificationRecipient[];
  template: string;
  customMessage?: string;
  attachments?: string[];
  urgent: boolean;
}

export interface NotificationRecipient {
  type: 'user' | 'role' | 'email' | 'phone';
  identifier: string; // user ID, role name, email, or phone
}

export interface EscalationRule {
  delayMinutes: number;
  escalateTo: NotificationRecipient[];
  condition?: string; // condition to check before escalating
}

export interface NotificationEvent {
  id: string;
  ruleId: string;
  entityType: string;
  entityId: string;
  message: string;
  priority: string;
  channels: string[];
  status: 'pending' | 'sent' | 'failed' | 'escalated';
  scheduledAt: Date;
  sentAt?: Date;
  failureReason?: string;
  createdAt: Date;
}

export interface BatchedNotification {
  id: string;
  userId: string;
  notifications: NotificationEvent[];
  batchedAt: Date;
  sentAt?: Date;
  status: 'pending' | 'sent' | 'failed';
}

export class SmartNotificationsService {
  private rules: Map<string, NotificationRule> = new Map();
  private pendingNotifications: Map<string, NotificationEvent> = new Map();
  private batchedNotifications: Map<string, BatchedNotification> = new Map();
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private batchingIntervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Initialize default smart notification rules
   */
  private initializeDefaultRules() {
    const defaultRules: Omit<NotificationRule, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: "High Priority Task Due Soon",
        description: "Alert when high priority tasks are due within 24 hours",
        trigger: {
          type: 'time_based',
          schedule: '0 */6 * * *' // Every 6 hours
        },
        conditions: [
          { field: 'priority', operator: 'equals', value: 'high', entityType: 'task' },
          { field: 'status', operator: 'not_equals', value: 'completed', entityType: 'task' },
          { field: 'dueDate', operator: 'less_than', value: '24h', entityType: 'task' }
        ],
        actions: [
          {
            type: 'email',
            recipients: [{ type: 'user', identifier: 'assignee' }],
            template: 'high_priority_task_due',
            urgent: true
          },
          {
            type: 'in_app',
            recipients: [{ type: 'user', identifier: 'assignee' }],
            template: 'task_due_notification',
            urgent: true
          }
        ],
        isActive: true,
        priority: 'high',
        escalationRules: [
          {
            delayMinutes: 60,
            escalateTo: [{ type: 'role', identifier: 'admin' }]
          }
        ],
        batchingEnabled: false,
        batchingWindow: 0
      },
      {
        name: "Project Milestone Approaching",
        description: "Notify team when project milestones are approaching",
        trigger: {
          type: 'time_based',
          schedule: '0 9 * * *' // Daily at 9 AM
        },
        conditions: [
          { field: 'dueDate', operator: 'less_than', value: '3d', entityType: 'project' },
          { field: 'status', operator: 'not_in', value: ['completed', 'cancelled'], entityType: 'project' }
        ],
        actions: [
          {
            type: 'email',
            recipients: [{ type: 'user', identifier: 'team_members' }],
            template: 'project_milestone_reminder',
            urgent: false
          }
        ],
        isActive: true,
        priority: 'medium',
        batchingEnabled: true,
        batchingWindow: 30
      },
      {
        name: "Overdue Invoice Alert",
        description: "Smart escalation for overdue invoices",
        trigger: {
          type: 'status_change',
          statusChanges: [{ from: 'sent', to: 'overdue' }]
        },
        conditions: [
          { field: 'status', operator: 'equals', value: 'overdue', entityType: 'invoice' }
        ],
        actions: [
          {
            type: 'email',
            recipients: [
              { type: 'role', identifier: 'admin' },
              { type: 'role', identifier: 'finance' }
            ],
            template: 'invoice_overdue_alert',
            urgent: true
          }
        ],
        isActive: true,
        priority: 'critical',
        batchingEnabled: false,
        batchingWindow: 0
      },
      {
        name: "Time Tracking Reminder",
        description: "Remind users to log time if no entries today",
        trigger: {
          type: 'time_based',
          schedule: '0 17 * * 1-5' // Weekdays at 5 PM
        },
        conditions: [
          { field: 'lastTimeLog', operator: 'less_than', value: 'today', entityType: 'user' }
        ],
        actions: [
          {
            type: 'in_app',
            recipients: [{ type: 'user', identifier: 'self' }],
            template: 'time_tracking_reminder',
            urgent: false
          }
        ],
        isActive: true,
        priority: 'low',
        batchingEnabled: true,
        batchingWindow: 60
      },
      {
        name: "Weekly Team Digest",
        description: "Smart weekly summary of team activities and upcoming deadlines",
        trigger: {
          type: 'time_based',
          schedule: '0 9 * * 1' // Monday at 9 AM
        },
        conditions: [],
        actions: [
          {
            type: 'email',
            recipients: [{ type: 'role', identifier: 'all' }],
            template: 'weekly_team_digest',
            urgent: false
          }
        ],
        isActive: true,
        priority: 'low',
        batchingEnabled: false,
        batchingWindow: 0
      }
    ];

    defaultRules.forEach((rule, index) => {
      const ruleWithId = {
        ...rule,
        id: `smart_notification_${index + 1}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.rules.set(ruleWithId.id, ruleWithId);
    });

    console.log(`🔔 Initialized ${defaultRules.length} default smart notification rules`);
  }

  /**
   * Start the smart notifications service
   */
  public startSmartNotifications() {
    if (this.isRunning) {
      console.log("🔔 Smart notifications already running");
      return;
    }

    console.log("🚀 Starting smart notifications service");
    this.isRunning = true;

    // Process notifications every 5 minutes
    this.intervalId = setInterval(() => {
      this.processSmartNotifications();
    }, 5 * 60 * 1000);

    // Process batched notifications every minute
    this.batchingIntervalId = setInterval(() => {
      this.processBatchedNotifications();
    }, 60 * 1000);

    // Run initial processing
    this.processSmartNotifications();
  }

  /**
   * Stop the smart notifications service
   */
  public stopSmartNotifications() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.batchingIntervalId) {
      clearInterval(this.batchingIntervalId);
      this.batchingIntervalId = null;
    }
    this.isRunning = false;
    console.log("⏹️ Stopped smart notifications service");
  }

  /**
   * Main processing function for smart notifications
   */
  public async processSmartNotifications() {
    try {
      console.log("🔄 Processing smart notifications...");
      
      const startTime = Date.now();
      let results = {
        rulesEvaluated: 0,
        notificationsGenerated: 0,
        notificationsSent: 0,
        notificationsBatched: 0,
        errors: 0
      };

      // Evaluate all active rules
      for (const rule of Array.from(this.rules.values())) {
        if (!rule.isActive) continue;

        try {
          results.rulesEvaluated++;
          const shouldTrigger = await this.evaluateRule(rule);
          
          if (shouldTrigger) {
            const entities = await this.getEntitiesMatchingConditions(rule.conditions);
            
            for (const entity of entities) {
              const notification = await this.generateNotification(rule, entity);
              if (notification) {
                results.notificationsGenerated++;
                
                if (rule.batchingEnabled) {
                  await this.addToBatch(notification);
                  results.notificationsBatched++;
                } else {
                  const sent = await this.sendNotification(notification);
                  if (sent) results.notificationsSent++;
                }
              }
            }
          }
        } catch (error) {
          console.error(`❌ Error processing rule ${rule.id}:`, error);
          results.errors++;
        }
      }

      const duration = Date.now() - startTime;
      console.log(`✅ Smart notifications processing complete in ${duration}ms:`, results);

    } catch (error) {
      console.error("❌ Error during smart notifications processing:", error);
    }
  }

  /**
   * Process batched notifications
   */
  private async processBatchedNotifications() {
    try {
      const now = new Date();
      let processed = 0;
      let sent = 0;

      for (const batch of Array.from(this.batchedNotifications.values())) {
        if (batch.status === 'pending') {
          // Check if batch window has expired
          const batchAge = (now.getTime() - batch.batchedAt.getTime()) / (1000 * 60); // minutes
          
          if (batchAge >= 30) { // Send batches older than 30 minutes
            const success = await this.sendBatchedNotification(batch);
            if (success) sent++;
            processed++;
          }
        }
      }

      if (processed > 0) {
        console.log(`📦 Processed ${processed} batched notifications, ${sent} sent successfully`);
      }
    } catch (error) {
      console.error("❌ Error processing batched notifications:", error);
    }
  }

  /**
   * Evaluate if a rule should trigger
   */
  private async evaluateRule(rule: NotificationRule): Promise<boolean> {
    switch (rule.trigger.type) {
      case 'time_based':
        return this.evaluateTimeBasedTrigger(rule.trigger);
      case 'event_based':
        return this.evaluateEventBasedTrigger(rule.trigger);
      case 'threshold_based':
        return await this.evaluateThresholdBasedTrigger(rule.trigger);
      case 'status_change':
        return this.evaluateStatusChangeTrigger(rule.trigger);
      default:
        return false;
    }
  }

  /**
   * Evaluate time-based trigger (simplified cron evaluation)
   */
  private evaluateTimeBasedTrigger(trigger: NotificationTrigger): boolean {
    if (!trigger.schedule) return false;
    
    // Simplified: for now, just trigger every evaluation cycle
    // In a full implementation, this would parse cron expressions
    const now = new Date();
    const hour = now.getHours();
    
    // Basic hour-based evaluation (can be expanded)
    if (trigger.schedule.includes('*/6')) {
      return hour % 6 === 0;
    }
    if (trigger.schedule.includes('9 * * 1')) {
      return hour === 9 && now.getDay() === 1; // Monday at 9 AM
    }
    if (trigger.schedule.includes('17 * * 1-5')) {
      return hour === 17 && now.getDay() >= 1 && now.getDay() <= 5; // Weekdays at 5 PM
    }
    
    return false;
  }

  /**
   * Evaluate event-based trigger
   */
  private evaluateEventBasedTrigger(trigger: NotificationTrigger): boolean {
    // Event-based triggers would be called externally when events occur
    return false;
  }

  /**
   * Evaluate threshold-based trigger
   */
  private async evaluateThresholdBasedTrigger(trigger: NotificationTrigger): Promise<boolean> {
    if (!trigger.thresholds) return false;
    
    // Implementation would check current values against thresholds
    // This is a placeholder for complex threshold logic
    return false;
  }

  /**
   * Evaluate status change trigger
   */
  private evaluateStatusChangeTrigger(trigger: NotificationTrigger): boolean {
    // Status change triggers would be called when status changes occur
    return false;
  }

  /**
   * Get entities matching notification conditions
   */
  private async getEntitiesMatchingConditions(conditions: NotificationCondition[]): Promise<any[]> {
    const results: any[] = [];
    const groupedConditions = this.groupConditionsByEntityType(conditions);

    for (const [entityType, entityConditions] of Array.from(groupedConditions.entries())) {
      try {
        switch (entityType) {
          case 'task':
            const tasks = await storage.getTasks();
            const matchingTasks = tasks.filter(task => this.entityMatchesConditions(task, entityConditions));
            results.push(...matchingTasks.map(task => ({ type: 'task', entity: task })));
            break;
            
          case 'project':
            const projects = await storage.getProjects();
            const matchingProjects = projects.filter(project => this.entityMatchesConditions(project, entityConditions));
            results.push(...matchingProjects.map(project => ({ type: 'project', entity: project })));
            break;
            
          case 'invoice':
            const invoices = await storage.getInvoices();
            const matchingInvoices = invoices.filter(invoice => this.entityMatchesConditions(invoice, entityConditions));
            results.push(...matchingInvoices.map(invoice => ({ type: 'invoice', entity: invoice })));
            break;
            
          case 'user':
            const users = await storage.getUsers();
            const matchingUsers = users.filter(user => this.entityMatchesConditions(user, entityConditions));
            results.push(...matchingUsers.map(user => ({ type: 'user', entity: user })));
            break;
        }
      } catch (error) {
        console.error(`❌ Error fetching ${entityType} entities:`, error);
      }
    }

    return results;
  }

  /**
   * Group conditions by entity type
   */
  private groupConditionsByEntityType(conditions: NotificationCondition[]): Map<string, NotificationCondition[]> {
    const grouped = new Map<string, NotificationCondition[]>();
    
    conditions.forEach(condition => {
      if (!grouped.has(condition.entityType)) {
        grouped.set(condition.entityType, []);
      }
      grouped.get(condition.entityType)!.push(condition);
    });
    
    return grouped;
  }

  /**
   * Check if entity matches conditions
   */
  private entityMatchesConditions(entity: any, conditions: NotificationCondition[]): boolean {
    return conditions.every(condition => {
      const fieldValue = this.getFieldValue(entity, condition.field);
      return this.evaluateCondition(fieldValue, condition.operator, condition.value);
    });
  }

  /**
   * Get field value from entity (supports nested fields)
   */
  private getFieldValue(entity: any, fieldPath: string): any {
    return fieldPath.split('.').reduce((obj, key) => obj && obj[key], entity);
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(fieldValue: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case 'equals':
        return fieldValue === expectedValue;
      case 'not_equals':
        return fieldValue !== expectedValue;
      case 'greater_than':
        if (typeof expectedValue === 'string' && expectedValue.endsWith('h')) {
          const hours = parseInt(expectedValue);
          const now = new Date();
          const fieldDate = new Date(fieldValue);
          return (now.getTime() - fieldDate.getTime()) > (hours * 60 * 60 * 1000);
        }
        return fieldValue > expectedValue;
      case 'less_than':
        if (typeof expectedValue === 'string') {
          if (expectedValue.endsWith('h')) {
            const hours = parseInt(expectedValue);
            const now = new Date();
            const fieldDate = new Date(fieldValue);
            return (fieldDate.getTime() - now.getTime()) < (hours * 60 * 60 * 1000);
          }
          if (expectedValue.endsWith('d')) {
            const days = parseInt(expectedValue);
            const now = new Date();
            const fieldDate = new Date(fieldValue);
            return (fieldDate.getTime() - now.getTime()) < (days * 24 * 60 * 60 * 1000);
          }
        }
        return fieldValue < expectedValue;
      case 'contains':
        return String(fieldValue).includes(String(expectedValue));
      case 'in':
        return Array.isArray(expectedValue) && expectedValue.includes(fieldValue);
      case 'not_in':
        return Array.isArray(expectedValue) && !expectedValue.includes(fieldValue);
      default:
        return false;
    }
  }

  /**
   * Generate notification from rule and entity
   */
  private async generateNotification(rule: NotificationRule, entityData: any): Promise<NotificationEvent | null> {
    try {
      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const message = await this.generateNotificationMessage(rule, entityData);

      const notification: NotificationEvent = {
        id: notificationId,
        ruleId: rule.id,
        entityType: entityData.type,
        entityId: entityData.entity.id,
        message,
        priority: rule.priority,
        channels: rule.actions.map(action => action.type),
        status: 'pending',
        scheduledAt: new Date(),
        createdAt: new Date()
      };

      return notification;
    } catch (error) {
      console.error("❌ Error generating notification:", error);
      return null;
    }
  }

  /**
   * Generate notification message based on template and entity
   */
  private async generateNotificationMessage(rule: NotificationRule, entityData: any): Promise<string> {
    const entity = entityData.entity;
    const type = entityData.type;

    // Simple template replacement - in production, this would use a proper template engine
    switch (type) {
      case 'task':
        return `High priority task "${entity.title}" is due soon (${entity.dueDate})`;
      case 'project':
        return `Project "${entity.name}" milestone is approaching (due: ${entity.dueDate})`;
      case 'invoice':
        return `Invoice ${entity.invoiceNumber} is now overdue (${entity.totalAmount})`;
      case 'user':
        return `Time tracking reminder: Please log your hours for today`;
      default:
        return `Notification from rule: ${rule.name}`;
    }
  }

  /**
   * Add notification to batch
   */
  private async addToBatch(notification: NotificationEvent): Promise<void> {
    // Find recipient user ID (simplified)
    const userId = 'batch_user'; // In practice, extract from notification recipients
    const batchId = `batch_${userId}_${format(new Date(), 'yyyyMMdd')}`;

    let batch = this.batchedNotifications.get(batchId);
    if (!batch) {
      batch = {
        id: batchId,
        userId,
        notifications: [],
        batchedAt: new Date(),
        status: 'pending'
      };
      this.batchedNotifications.set(batchId, batch);
    }

    batch.notifications.push(notification);
  }

  /**
   * Send individual notification
   */
  private async sendNotification(notification: NotificationEvent): Promise<boolean> {
    try {
      // Implementation would send via appropriate channels
      console.log(`📬 Sending ${notification.priority} notification: ${notification.message}`);
      
      notification.status = 'sent';
      notification.sentAt = new Date();
      return true;
    } catch (error) {
      console.error(`❌ Failed to send notification ${notification.id}:`, error);
      notification.status = 'failed';
      notification.failureReason = error instanceof Error ? error.message : 'Unknown error';
      return false;
    }
  }

  /**
   * Send batched notification
   */
  private async sendBatchedNotification(batch: BatchedNotification): Promise<boolean> {
    try {
      console.log(`📦 Sending batched notification with ${batch.notifications.length} items to user ${batch.userId}`);
      
      batch.status = 'sent';
      batch.sentAt = new Date();
      
      // Remove from pending batches
      this.batchedNotifications.delete(batch.id);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send batched notification ${batch.id}:`, error);
      batch.status = 'failed';
      return false;
    }
  }

  // Public API methods

  /**
   * Add custom notification rule
   */
  public addNotificationRule(rule: Omit<NotificationRule, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = `custom_rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullRule: NotificationRule = {
      ...rule,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.rules.set(id, fullRule);
    console.log(`✨ Added custom notification rule: ${fullRule.name}`);
    return id;
  }

  /**
   * Update notification rule
   */
  public updateNotificationRule(id: string, updates: Partial<NotificationRule>): boolean {
    const rule = this.rules.get(id);
    if (!rule) return false;

    const updatedRule = {
      ...rule,
      ...updates,
      updatedAt: new Date()
    };

    this.rules.set(id, updatedRule);
    console.log(`🔄 Updated notification rule: ${updatedRule.name}`);
    return true;
  }

  /**
   * Get all notification rules
   */
  public getAllRules(): NotificationRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get notification statistics
   */
  public getNotificationStats() {
    return {
      totalRules: this.rules.size,
      activeRules: Array.from(this.rules.values()).filter(rule => rule.isActive).length,
      pendingNotifications: this.pendingNotifications.size,
      batchedNotifications: this.batchedNotifications.size,
      isRunning: this.isRunning
    };
  }

  /**
   * Manual trigger for testing
   */
  public async manualTrigger(): Promise<void> {
    console.log("🔧 Manual smart notifications trigger - Adding enterprise notification rules");
    
    // Add custom enterprise notification rules
    try {
      // Enterprise client risk alert
      this.addNotificationRule({
        name: "Enterprise Client Risk Alert",
        description: "Alert when high-value clients haven't been contacted in 72 hours",
        trigger: {
          type: 'time_based',
          schedule: '0 */4 * * *' // Every 4 hours
        },
        conditions: [
          { field: 'value', operator: 'greater_than', value: 50000, entityType: 'project' },
          { field: 'last_contact', operator: 'less_than', value: '72h', entityType: 'project' }
        ],
        actions: [
          {
            type: 'email',
            recipients: [{ type: 'role', identifier: 'account_manager' }, { type: 'role', identifier: 'sales_director' }],
            template: 'enterprise_client_risk',
            urgent: true
          }
        ],
        isActive: true,
        priority: 'critical',
        escalationRules: [
          {
            delayMinutes: 30,
            escalateTo: [{ type: 'role', identifier: 'executive_team' }]
          }
        ],
        batchingEnabled: false,
        batchingWindow: 0
      });

      // Performance degradation alert
      this.addNotificationRule({
        name: "Performance Degradation Alert",
        description: "Alert when system performance drops below enterprise SLA",
        trigger: {
          type: 'threshold_based',
          thresholds: [
            { field: 'response_time', operator: 'greater_than', value: 2000 },
            { field: 'error_rate', operator: 'greater_than', value: 1 }
          ]
        },
        conditions: [],
        actions: [
          {
            type: 'email',
            recipients: [{ type: 'role', identifier: 'devops' }, { type: 'role', identifier: 'tech_lead' }],
            template: 'performance_alert',
            urgent: true
          }
        ],
        isActive: true,
        priority: 'high',
        batchingEnabled: false,
        batchingWindow: 0
      });

      // Budget threshold notification
      this.addNotificationRule({
        name: "Project Budget Threshold Alert",
        description: "Smart alert when project budget reaches 80% utilization",
        trigger: {
          type: 'threshold_based',
          thresholds: [
            { field: 'budget_utilized_percent', operator: 'greater_than', value: 80 }
          ]
        },
        conditions: [
          { field: 'status', operator: 'in', value: ['active', 'in_progress'], entityType: 'project' }
        ],
        actions: [
          {
            type: 'email',
            recipients: [{ type: 'user', identifier: 'project_manager' }, { type: 'role', identifier: 'finance' }],
            template: 'budget_threshold_warning',
            urgent: false
          }
        ],
        isActive: true,
        priority: 'medium',
        batchingEnabled: true,
        batchingWindow: 60
      });

      console.log("✨ Added 3 enterprise smart notification rules");
    } catch (error) {
      console.error('Error adding notification rules:', error);
    }
    
    await this.processSmartNotifications();
  }

  /**
   * Trigger event-based notifications
   */
  public async triggerEventNotification(eventType: string, entityType: string, entityId: string, metadata?: any): Promise<void> {
    console.log(`🎯 Triggering event notification: ${eventType} for ${entityType}:${entityId}`);
    
    // Find rules that match this event
    const matchingRules = Array.from(this.rules.values()).filter(rule => 
      rule.isActive && 
      rule.trigger.type === 'event_based' &&
      rule.trigger.events?.includes(eventType)
    );

    for (const rule of matchingRules) {
      try {
        // Generate and send notification immediately for events
        const entityData = await this.getEntityById(entityType, entityId);
        if (entityData) {
          const notification = await this.generateNotification(rule, { type: entityType, entity: entityData });
          if (notification) {
            await this.sendNotification(notification);
          }
        }
      } catch (error) {
        console.error(`❌ Error processing event notification for rule ${rule.id}:`, error);
      }
    }
  }

  /**
   * Get entity by ID and type
   */
  private async getEntityById(entityType: string, entityId: string): Promise<any | null> {
    try {
      switch (entityType) {
        case 'task':
          return await storage.getTask(entityId);
        case 'project':
          return await storage.getProject(entityId);
        case 'invoice':
          return await storage.getInvoice(entityId);
        case 'user':
          return await storage.getUser(entityId);
        default:
          return null;
      }
    } catch (error) {
      console.error(`❌ Error fetching ${entityType} with ID ${entityId}:`, error);
      return null;
    }
  }
}

// Export singleton instance
export const smartNotificationsService = new SmartNotificationsService();