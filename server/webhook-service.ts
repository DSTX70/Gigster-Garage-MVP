import crypto from 'crypto';
import { storage } from './storage';

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  secret?: string;
  events: WebhookEvent[];
  active: boolean;
  headers?: Record<string, string>;
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelay: number;
  };
  filters?: {
    projectIds?: string[];
    userIds?: string[];
    priorities?: string[];
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type WebhookEvent = 
  | 'task.created'
  | 'task.updated'
  | 'task.completed'
  | 'task.deleted'
  | 'project.created'
  | 'project.updated'
  | 'project.completed'
  | 'invoice.created'
  | 'invoice.paid'
  | 'invoice.overdue'
  | 'proposal.sent'
  | 'proposal.accepted'
  | 'proposal.rejected'
  | 'user.invited'
  | 'user.joined'
  | 'time.logged'
  | 'milestone.reached'
  | 'deadline.approaching'
  | 'report.generated';

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: any;
  attempts: WebhookAttempt[];
  status: 'pending' | 'delivered' | 'failed' | 'cancelled';
  createdAt: Date;
  deliveredAt?: Date;
}

export interface WebhookAttempt {
  id: string;
  attempt: number;
  status: 'pending' | 'success' | 'failed';
  httpStatus?: number;
  response?: string;
  error?: string;
  timestamp: Date;
  duration?: number;
}

export interface ExternalIntegration {
  id: string;
  type: 'slack' | 'teams' | 'discord' | 'zapier' | 'custom';
  name: string;
  config: {
    webhookUrl?: string;
    apiKey?: string;
    channelId?: string;
    teamId?: string;
    botToken?: string;
    customSettings?: Record<string, any>;
  };
  eventMappings: {
    event: WebhookEvent;
    template: string;
    enabled: boolean;
  }[];
  active: boolean;
  createdBy: string;
  createdAt: Date;
}

export class WebhookService {
  private webhooks: Map<string, WebhookConfig> = new Map();
  private deliveries: Map<string, WebhookDelivery> = new Map();
  private integrations: Map<string, ExternalIntegration> = new Map();
  private deliveryQueue: WebhookDelivery[] = [];
  private isProcessing = false;

  constructor() {
    console.log('🔗 Webhook service initialized');
    this.startDeliveryProcessor();
  }

  /**
   * Create a new webhook configuration
   */
  async createWebhook(config: Omit<WebhookConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<WebhookConfig> {
    const webhook: WebhookConfig = {
      ...config,
      id: this.generateId('webhook'),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.webhooks.set(webhook.id, webhook);
    console.log(`🔗 Created webhook: ${webhook.name} -> ${webhook.url}`);
    return webhook;
  }

  /**
   * Update webhook configuration
   */
  async updateWebhook(id: string, updates: Partial<WebhookConfig>): Promise<WebhookConfig> {
    const existing = this.webhooks.get(id);
    if (!existing) {
      throw new Error(`Webhook not found: ${id}`);
    }

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };

    this.webhooks.set(id, updated);
    console.log(`🔗 Updated webhook: ${updated.name}`);
    return updated;
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(id: string): Promise<void> {
    if (!this.webhooks.has(id)) {
      throw new Error(`Webhook not found: ${id}`);
    }

    this.webhooks.delete(id);
    console.log(`🔗 Deleted webhook: ${id}`);
  }

  /**
   * Get all webhooks
   */
  async getWebhooks(userId?: string): Promise<WebhookConfig[]> {
    const allWebhooks = Array.from(this.webhooks.values());
    
    if (userId) {
      return allWebhooks.filter(webhook => webhook.createdBy === userId);
    }
    
    return allWebhooks;
  }

  /**
   * Create external integration
   */
  async createIntegration(integration: Omit<ExternalIntegration, 'id' | 'createdAt'>): Promise<ExternalIntegration> {
    const newIntegration: ExternalIntegration = {
      ...integration,
      id: this.generateId('integration'),
      createdAt: new Date()
    };

    this.integrations.set(newIntegration.id, newIntegration);
    console.log(`🔗 Created ${newIntegration.type} integration: ${newIntegration.name}`);
    return newIntegration;
  }

  /**
   * Get all integrations
   */
  async getIntegrations(): Promise<ExternalIntegration[]> {
    return Array.from(this.integrations.values());
  }

  /**
   * Trigger webhook for an event
   */
  async triggerEvent(event: WebhookEvent, payload: any, metadata?: Record<string, any>): Promise<void> {
    console.log(`🔔 Triggering event: ${event}`);

    // Get all active webhooks that listen to this event
    const activeWebhooks = Array.from(this.webhooks.values()).filter(webhook => 
      webhook.active && webhook.events.includes(event)
    );

    // Get all active integrations that handle this event
    const activeIntegrations = Array.from(this.integrations.values()).filter(integration =>
      integration.active && integration.eventMappings.some(mapping => 
        mapping.event === event && mapping.enabled
      )
    );

    // Process webhooks
    for (const webhook of activeWebhooks) {
      if (this.shouldTriggerWebhook(webhook, payload)) {
        await this.queueWebhookDelivery(webhook, event, payload, metadata);
      }
    }

    // Process integrations
    for (const integration of activeIntegrations) {
      await this.processIntegrationEvent(integration, event, payload, metadata);
    }
  }

  /**
   * Queue webhook delivery
   */
  private async queueWebhookDelivery(
    webhook: WebhookConfig, 
    event: WebhookEvent, 
    payload: any,
    metadata?: Record<string, any>
  ): Promise<void> {
    const delivery: WebhookDelivery = {
      id: this.generateId('delivery'),
      webhookId: webhook.id,
      event,
      payload: {
        event,
        data: payload,
        metadata: metadata || {},
        timestamp: new Date().toISOString(),
        webhook: {
          id: webhook.id,
          name: webhook.name
        }
      },
      attempts: [],
      status: 'pending',
      createdAt: new Date()
    };

    this.deliveries.set(delivery.id, delivery);
    this.deliveryQueue.push(delivery);
    
    console.log(`📮 Queued webhook delivery: ${webhook.name} for ${event}`);
    
    // Start processing if not already running
    if (!this.isProcessing) {
      this.processDeliveryQueue();
    }
  }

  /**
   * Process delivery queue
   */
  private async processDeliveryQueue(): Promise<void> {
    if (this.isProcessing || this.deliveryQueue.length === 0) return;

    this.isProcessing = true;
    console.log(`📤 Processing ${this.deliveryQueue.length} webhook deliveries`);

    while (this.deliveryQueue.length > 0) {
      const delivery = this.deliveryQueue.shift();
      if (delivery) {
        await this.deliverWebhook(delivery);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Deliver individual webhook
   */
  private async deliverWebhook(delivery: WebhookDelivery): Promise<void> {
    const webhook = this.webhooks.get(delivery.webhookId);
    if (!webhook) {
      console.error(`Webhook not found for delivery: ${delivery.webhookId}`);
      return;
    }

    const maxRetries = webhook.retryPolicy.maxRetries;
    let attempt = delivery.attempts.length + 1;

    while (attempt <= maxRetries) {
      const attemptStart = Date.now();
      const attemptRecord: WebhookAttempt = {
        id: this.generateId('attempt'),
        attempt,
        status: 'pending',
        timestamp: new Date()
      };

      try {
        console.log(`📡 Delivering webhook (attempt ${attempt}/${maxRetries}): ${webhook.name}`);

        // Prepare headers
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'Gigster-Garage-Webhook/1.0',
          'X-Webhook-Event': delivery.event,
          'X-Webhook-Delivery': delivery.id,
          'X-Webhook-Timestamp': delivery.createdAt.toISOString(),
          ...webhook.headers || {}
        };

        // Add signature if secret is provided
        if (webhook.secret) {
          const signature = this.generateSignature(webhook.secret, JSON.stringify(delivery.payload));
          headers['X-Webhook-Signature'] = signature;
        }

        // Make the HTTP request
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers,
          body: JSON.stringify(delivery.payload),
          signal: AbortSignal.timeout(30000) // 30 second timeout
        });

        const duration = Date.now() - attemptStart;
        attemptRecord.duration = duration;
        attemptRecord.httpStatus = response.status;

        if (response.ok) {
          attemptRecord.status = 'success';
          attemptRecord.response = await response.text().catch(() => '');
          
          delivery.status = 'delivered';
          delivery.deliveredAt = new Date();
          
          console.log(`✅ Webhook delivered successfully: ${webhook.name} (${duration}ms)`);
          break;
        } else {
          attemptRecord.status = 'failed';
          attemptRecord.error = `HTTP ${response.status}: ${response.statusText}`;
          attemptRecord.response = await response.text().catch(() => '');
        }

      } catch (error: any) {
        const duration = Date.now() - attemptStart;
        attemptRecord.duration = duration;
        attemptRecord.status = 'failed';
        attemptRecord.error = error.message || 'Unknown error';
        
        console.error(`❌ Webhook delivery failed (attempt ${attempt}): ${error.message}`);
      }

      delivery.attempts.push(attemptRecord);

      // If this was the last attempt and it failed
      if (attempt === maxRetries && attemptRecord.status === 'failed') {
        delivery.status = 'failed';
        console.error(`🚫 Webhook delivery permanently failed after ${maxRetries} attempts: ${webhook.name}`);
        break;
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries && attemptRecord.status === 'failed') {
        const delay = webhook.retryPolicy.initialDelay * 
          Math.pow(webhook.retryPolicy.backoffMultiplier, attempt - 1);
        console.log(`⏳ Retrying webhook in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      attempt++;
    }

    // Update delivery record
    this.deliveries.set(delivery.id, delivery);
  }

  /**
   * Process integration events
   */
  private async processIntegrationEvent(
    integration: ExternalIntegration,
    event: WebhookEvent,
    payload: any,
    metadata?: Record<string, any>
  ): Promise<void> {
    console.log(`🔌 Processing ${integration.type} integration for ${event}`);

    const eventMapping = integration.eventMappings.find(mapping => 
      mapping.event === event && mapping.enabled
    );

    if (!eventMapping) return;

    try {
      switch (integration.type) {
        case 'slack':
          await this.processSlackIntegration(integration, event, payload, eventMapping.template);
          break;
        case 'teams':
          await this.processTeamsIntegration(integration, event, payload, eventMapping.template);
          break;
        case 'discord':
          await this.processDiscordIntegration(integration, event, payload, eventMapping.template);
          break;
        default:
          console.warn(`Unsupported integration type: ${integration.type}`);
      }
    } catch (error) {
      console.error(`Integration processing error (${integration.type}):`, error);
    }
  }

  /**
   * Process Slack integration
   */
  private async processSlackIntegration(
    integration: ExternalIntegration,
    event: WebhookEvent,
    payload: any,
    template: string
  ): Promise<void> {
    const { webhookUrl, channelId } = integration.config;
    
    if (!webhookUrl) {
      console.error('Slack webhook URL not configured');
      return;
    }

    const message = this.formatSlackMessage(event, payload, template);
    
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: channelId,
        ...message
      })
    });

    console.log(`📨 Sent Slack notification for ${event}`);
  }

  /**
   * Process Microsoft Teams integration
   */
  private async processTeamsIntegration(
    integration: ExternalIntegration,
    event: WebhookEvent,
    payload: any,
    template: string
  ): Promise<void> {
    const { webhookUrl } = integration.config;
    
    if (!webhookUrl) {
      console.error('Teams webhook URL not configured');
      return;
    }

    const message = this.formatTeamsMessage(event, payload, template);
    
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

    console.log(`📨 Sent Teams notification for ${event}`);
  }

  /**
   * Process Discord integration
   */
  private async processDiscordIntegration(
    integration: ExternalIntegration,
    event: WebhookEvent,
    payload: any,
    template: string
  ): Promise<void> {
    const { webhookUrl } = integration.config;
    
    if (!webhookUrl) {
      console.error('Discord webhook URL not configured');
      return;
    }

    const message = this.formatDiscordMessage(event, payload, template);
    
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

    console.log(`📨 Sent Discord notification for ${event}`);
  }

  // Message formatting methods
  private formatSlackMessage(event: WebhookEvent, payload: any, template: string): any {
    const title = this.getEventTitle(event, payload);
    const color = this.getEventColor(event);

    return {
      text: title,
      attachments: [{
        color,
        title,
        text: this.interpolateTemplate(template, payload),
        fields: this.extractSlackFields(payload),
        footer: 'Gigster Garage',
        ts: Math.floor(Date.now() / 1000)
      }]
    };
  }

  private formatTeamsMessage(event: WebhookEvent, payload: any, template: string): any {
    const title = this.getEventTitle(event, payload);
    const color = this.getEventColor(event);

    return {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      themeColor: color.replace('#', ''),
      summary: title,
      sections: [{
        activityTitle: title,
        activitySubtitle: this.interpolateTemplate(template, payload),
        facts: this.extractTeamsFacts(payload),
        markdown: true
      }]
    };
  }

  private formatDiscordMessage(event: WebhookEvent, payload: any, template: string): any {
    const title = this.getEventTitle(event, payload);
    const color = parseInt(this.getEventColor(event).replace('#', ''), 16);

    return {
      embeds: [{
        title,
        description: this.interpolateTemplate(template, payload),
        color,
        fields: this.extractDiscordFields(payload),
        footer: {
          text: 'Gigster Garage'
        },
        timestamp: new Date().toISOString()
      }]
    };
  }

  // Helper methods
  private shouldTriggerWebhook(webhook: WebhookConfig, payload: any): boolean {
    if (!webhook.filters) return true;

    const { projectIds, userIds, priorities } = webhook.filters;

    if (projectIds?.length && payload.projectId && !projectIds.includes(payload.projectId)) {
      return false;
    }

    if (userIds?.length) {
      const userInPayload = payload.assignedToId || payload.createdById || payload.userId;
      if (userInPayload && !userIds.includes(userInPayload)) {
        return false;
      }
    }

    if (priorities?.length && payload.priority && !priorities.includes(payload.priority)) {
      return false;
    }

    return true;
  }

  private generateSignature(secret: string, payload: string): string {
    return `sha256=${crypto.createHmac('sha256', secret).update(payload).digest('hex')}`;
  }

  private interpolateTemplate(template: string, data: any): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const value = this.getNestedValue(data, key.trim());
      return value !== undefined ? String(value) : match;
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private getEventTitle(event: WebhookEvent, payload: any): string {
    const titles: Record<WebhookEvent, string> = {
      'task.created': `New Task: ${payload.title}`,
      'task.updated': `Task Updated: ${payload.title}`,
      'task.completed': `Task Completed: ${payload.title}`,
      'task.deleted': `Task Deleted: ${payload.title}`,
      'project.created': `New Project: ${payload.name}`,
      'project.updated': `Project Updated: ${payload.name}`,
      'project.completed': `Project Completed: ${payload.name}`,
      'invoice.created': `New Invoice: ${payload.clientName}`,
      'invoice.paid': `Invoice Paid: ${payload.clientName}`,
      'invoice.overdue': `Invoice Overdue: ${payload.clientName}`,
      'proposal.sent': `Proposal Sent: ${payload.clientName}`,
      'proposal.accepted': `Proposal Accepted: ${payload.clientName}`,
      'proposal.rejected': `Proposal Rejected: ${payload.clientName}`,
      'user.invited': `User Invited: ${payload.email}`,
      'user.joined': `User Joined: ${payload.name}`,
      'time.logged': `Time Logged: ${payload.duration} minutes`,
      'milestone.reached': `Milestone Reached: ${payload.title}`,
      'deadline.approaching': `Deadline Approaching: ${payload.title}`,
      'report.generated': `Report Generated: ${payload.type}`
    };

    return titles[event] || `Event: ${event}`;
  }

  private getEventColor(event: WebhookEvent): string {
    const colors: Record<string, string> = {
      task: '#10B981',
      project: '#3B82F6',
      invoice: '#F59E0B',
      proposal: '#8B5CF6',
      user: '#06B6D4',
      time: '#EF4444',
      milestone: '#84CC16',
      deadline: '#F97316',
      report: '#6366F1'
    };

    const eventType = event.split('.')[0];
    return colors[eventType] || '#6B7280';
  }

  private extractSlackFields(payload: any): any[] {
    const fields = [];
    
    if (payload.priority) {
      fields.push({ title: 'Priority', value: payload.priority, short: true });
    }
    
    if (payload.status) {
      fields.push({ title: 'Status', value: payload.status, short: true });
    }
    
    if (payload.assignedTo) {
      fields.push({ title: 'Assigned To', value: payload.assignedTo, short: true });
    }

    return fields;
  }

  private extractTeamsFacts(payload: any): any[] {
    const facts = [];
    
    if (payload.priority) {
      facts.push({ name: 'Priority', value: payload.priority });
    }
    
    if (payload.status) {
      facts.push({ name: 'Status', value: payload.status });
    }
    
    if (payload.assignedTo) {
      facts.push({ name: 'Assigned To', value: payload.assignedTo });
    }

    return facts;
  }

  private extractDiscordFields(payload: any): any[] {
    const fields = [];
    
    if (payload.priority) {
      fields.push({ name: 'Priority', value: payload.priority, inline: true });
    }
    
    if (payload.status) {
      fields.push({ name: 'Status', value: payload.status, inline: true });
    }
    
    if (payload.assignedTo) {
      fields.push({ name: 'Assigned To', value: payload.assignedTo, inline: true });
    }

    return fields;
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startDeliveryProcessor(): void {
    // Process delivery queue every 5 seconds
    setInterval(() => {
      if (!this.isProcessing && this.deliveryQueue.length > 0) {
        this.processDeliveryQueue();
      }
    }, 5000);
  }

  /**
   * Get webhook delivery history
   */
  async getDeliveries(webhookId?: string): Promise<WebhookDelivery[]> {
    const allDeliveries = Array.from(this.deliveries.values());
    
    if (webhookId) {
      return allDeliveries.filter(delivery => delivery.webhookId === webhookId);
    }
    
    return allDeliveries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get delivery statistics
   */
  async getDeliveryStats(webhookId?: string): Promise<any> {
    const deliveries = await this.getDeliveries(webhookId);
    
    return {
      total: deliveries.length,
      delivered: deliveries.filter(d => d.status === 'delivered').length,
      failed: deliveries.filter(d => d.status === 'failed').length,
      pending: deliveries.filter(d => d.status === 'pending').length,
      averageAttempts: deliveries.reduce((sum, d) => sum + d.attempts.length, 0) / deliveries.length || 0
    };
  }
}

export const webhookService = new WebhookService();