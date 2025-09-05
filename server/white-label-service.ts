import crypto from 'crypto';
import { storage } from './storage';

export interface TenantConfig {
  id: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  plan: 'starter' | 'professional' | 'enterprise';
  branding: {
    logo?: string;
    favicon?: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    customCSS?: string;
  };
  features: {
    maxUsers: number;
    maxProjects: number;
    maxStorage: number; // GB
    aiInsights: boolean;
    teamCollaboration: boolean;
    advancedReporting: boolean;
    apiWebhooks: boolean;
    mobileApp: boolean;
    customFields: boolean;
    sso: boolean;
    customIntegrations: boolean;
  };
  settings: {
    timezone: string;
    dateFormat: string;
    currency: string;
    language: string;
    workingDays: string[];
    workingHours: {
      start: string;
      end: string;
    };
  };
  subscription: {
    status: 'trial' | 'active' | 'suspended' | 'cancelled';
    billingEmail: string;
    billingCycle: 'monthly' | 'yearly';
    nextBillingDate: string;
    trialEndsAt?: string;
  };
  admin: {
    userId: string;
    email: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface WhiteLabelTemplate {
  id: string;
  name: string;
  description: string;
  industry: string;
  branding: {
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  features: string[];
  configTemplate: any;
  previewUrl: string;
}

export interface TenantUsage {
  tenantId: string;
  period: string; // YYYY-MM
  users: number;
  projects: number;
  tasks: number;
  timeLogs: number;
  storage: number; // GB
  apiCalls: number;
  webhookDeliveries: number;
  reportGenerations: number;
}

export interface TenantBilling {
  tenantId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  billingPeriod: {
    start: string;
    end: string;
  };
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  createdAt: string;
  paidAt?: string;
}

export class WhiteLabelService {
  private tenants: Map<string, TenantConfig> = new Map();
  private usage: Map<string, TenantUsage[]> = new Map();
  private billing: Map<string, TenantBilling[]> = new Map();

  constructor() {
    console.log('🏢 White-label service initialized');
    this.initializeDefaultTenants();
  }

  /**
   * Create a new tenant
   */
  async createTenant(config: Omit<TenantConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<TenantConfig> {
    const tenant: TenantConfig = {
      ...config,
      id: this.generateTenantId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Validate subdomain uniqueness
    const existingSubdomain = Array.from(this.tenants.values()).find(t => t.subdomain === tenant.subdomain);
    if (existingSubdomain) {
      throw new Error(`Subdomain '${tenant.subdomain}' is already taken`);
    }

    // Validate custom domain uniqueness if provided
    if (tenant.customDomain) {
      const existingDomain = Array.from(this.tenants.values()).find(t => t.customDomain === tenant.customDomain);
      if (existingDomain) {
        throw new Error(`Custom domain '${tenant.customDomain}' is already taken`);
      }
    }

    this.tenants.set(tenant.id, tenant);
    console.log(`🏢 Created tenant: ${tenant.name} (${tenant.subdomain})`);
    
    // Initialize usage tracking
    this.initializeTenantUsage(tenant.id);
    
    return tenant;
  }

  /**
   * Update tenant configuration
   */
  async updateTenant(tenantId: string, updates: Partial<TenantConfig>): Promise<TenantConfig> {
    const existing = this.tenants.get(tenantId);
    if (!existing) {
      throw new Error(`Tenant not found: ${tenantId}`);
    }

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.tenants.set(tenantId, updated);
    console.log(`🏢 Updated tenant: ${updated.name}`);
    return updated;
  }

  /**
   * Get tenant by subdomain or custom domain
   */
  async getTenantByDomain(domain: string): Promise<TenantConfig | null> {
    // Extract subdomain from full domain
    const subdomain = domain.includes('.') ? domain.split('.')[0] : domain;
    
    // Look for exact match first (custom domain)
    const byCustomDomain = Array.from(this.tenants.values()).find(t => t.customDomain === domain);
    if (byCustomDomain) return byCustomDomain;
    
    // Look for subdomain match
    const bySubdomain = Array.from(this.tenants.values()).find(t => t.subdomain === subdomain);
    if (bySubdomain) return bySubdomain;
    
    return null;
  }

  /**
   * Get all tenants
   */
  async getTenants(): Promise<TenantConfig[]> {
    return Array.from(this.tenants.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Get tenant by ID
   */
  async getTenant(tenantId: string): Promise<TenantConfig | null> {
    return this.tenants.get(tenantId) || null;
  }

  /**
   * Delete tenant
   */
  async deleteTenant(tenantId: string): Promise<void> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`Tenant not found: ${tenantId}`);
    }

    this.tenants.delete(tenantId);
    this.usage.delete(tenantId);
    this.billing.delete(tenantId);
    
    console.log(`🏢 Deleted tenant: ${tenant.name}`);
  }

  /**
   * Generate custom CSS for tenant branding
   */
  generateTenantCSS(tenant: TenantConfig): string {
    const { branding } = tenant;
    
    return `
      /* ${tenant.name} Custom Branding */
      :root {
        --primary-color: ${branding.primaryColor};
        --secondary-color: ${branding.secondaryColor};
        --font-family: ${branding.fontFamily};
      }
      
      /* Header styling */
      .app-header {
        background-color: var(--primary-color) !important;
      }
      
      /* Button styling */
      .btn-primary {
        background-color: var(--primary-color) !important;
        border-color: var(--primary-color) !important;
      }
      
      .btn-primary:hover {
        background-color: color-mix(in srgb, var(--primary-color) 85%, black) !important;
        border-color: color-mix(in srgb, var(--primary-color) 85%, black) !important;
      }
      
      /* Link styling */
      .text-primary {
        color: var(--primary-color) !important;
      }
      
      /* Border styling */
      .border-primary {
        border-color: var(--primary-color) !important;
      }
      
      /* Background styling */
      .bg-primary {
        background-color: var(--primary-color) !important;
      }
      
      .bg-secondary {
        background-color: var(--secondary-color) !important;
      }
      
      /* Font styling */
      body, .font-primary {
        font-family: var(--font-family) !important;
      }
      
      /* Logo replacement */
      .tenant-logo {
        content: url('${branding.logo}');
        max-height: 40px;
        width: auto;
      }
      
      /* Custom CSS */
      ${branding.customCSS || ''}
    `;
  }

  /**
   * Track tenant usage
   */
  async trackUsage(tenantId: string, metric: keyof TenantUsage, increment: number = 1): Promise<void> {
    const currentPeriod = new Date().toISOString().substring(0, 7); // YYYY-MM
    
    let tenantUsage = this.usage.get(tenantId) || [];
    let currentUsage = tenantUsage.find(u => u.period === currentPeriod);
    
    if (!currentUsage) {
      currentUsage = {
        tenantId,
        period: currentPeriod,
        users: 0,
        projects: 0,
        tasks: 0,
        timeLogs: 0,
        storage: 0,
        apiCalls: 0,
        webhookDeliveries: 0,
        reportGenerations: 0
      };
      tenantUsage.push(currentUsage);
    }
    
    if (typeof currentUsage[metric] === 'number') {
      (currentUsage[metric] as number) += increment;
    }
    
    this.usage.set(tenantId, tenantUsage);
  }

  /**
   * Get tenant usage statistics
   */
  async getTenantUsage(tenantId: string, period?: string): Promise<TenantUsage[]> {
    const tenantUsage = this.usage.get(tenantId) || [];
    
    if (period) {
      return tenantUsage.filter(u => u.period === period);
    }
    
    return tenantUsage.sort((a, b) => b.period.localeCompare(a.period));
  }

  /**
   * Check if tenant has exceeded limits
   */
  async checkTenantLimits(tenantId: string): Promise<{
    withinLimits: boolean;
    violations: string[];
  }> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`Tenant not found: ${tenantId}`);
    }

    const currentPeriod = new Date().toISOString().substring(0, 7);
    const usage = (await this.getTenantUsage(tenantId, currentPeriod))[0];
    const violations: string[] = [];

    if (!usage) {
      return { withinLimits: true, violations: [] };
    }

    // Check user limit
    if (usage.users > tenant.features.maxUsers) {
      violations.push(`Users exceeded: ${usage.users}/${tenant.features.maxUsers}`);
    }

    // Check project limit
    if (usage.projects > tenant.features.maxProjects) {
      violations.push(`Projects exceeded: ${usage.projects}/${tenant.features.maxProjects}`);
    }

    // Check storage limit
    if (usage.storage > tenant.features.maxStorage) {
      violations.push(`Storage exceeded: ${usage.storage}GB/${tenant.features.maxStorage}GB`);
    }

    return {
      withinLimits: violations.length === 0,
      violations
    };
  }

  /**
   * Generate tenant billing
   */
  async generateBilling(tenantId: string, period: { start: string; end: string }): Promise<TenantBilling> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`Tenant not found: ${tenantId}`);
    }

    // Calculate base subscription cost
    const planPricing = {
      starter: 29,
      professional: 99,
      enterprise: 299
    };

    const basePrice = planPricing[tenant.plan];
    const items: TenantBilling['items'] = [];

    // Base subscription
    items.push({
      description: `${tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)} Plan`,
      quantity: 1,
      unitPrice: basePrice,
      total: basePrice
    });

    // Usage-based billing
    const usage = (await this.getTenantUsage(tenantId, period.start.substring(0, 7)))[0];
    if (usage) {
      // Extra users
      const extraUsers = Math.max(0, usage.users - tenant.features.maxUsers);
      if (extraUsers > 0) {
        const userPrice = 10;
        items.push({
          description: `Additional Users (${extraUsers})`,
          quantity: extraUsers,
          unitPrice: userPrice,
          total: extraUsers * userPrice
        });
      }

      // Extra storage
      const extraStorage = Math.max(0, usage.storage - tenant.features.maxStorage);
      if (extraStorage > 0) {
        const storagePrice = 5; // per GB
        items.push({
          description: `Additional Storage (${extraStorage}GB)`,
          quantity: extraStorage,
          unitPrice: storagePrice,
          total: extraStorage * storagePrice
        });
      }
    }

    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

    const billing: TenantBilling = {
      tenantId,
      amount: totalAmount,
      currency: tenant.settings.currency,
      status: 'pending',
      billingPeriod: period,
      items,
      createdAt: new Date().toISOString()
    };

    // Store billing record
    const tenantBilling = this.billing.get(tenantId) || [];
    tenantBilling.push(billing);
    this.billing.set(tenantId, tenantBilling);

    console.log(`💰 Generated billing for ${tenant.name}: ${totalAmount} ${tenant.settings.currency}`);
    return billing;
  }

  /**
   * Get white-label templates
   */
  getWhiteLabelTemplates(): WhiteLabelTemplate[] {
    return [
      {
        id: 'corporate',
        name: 'Corporate Blue',
        description: 'Professional corporate branding with blue theme',
        industry: 'Enterprise',
        branding: {
          logo: '/templates/corporate-logo.svg',
          primaryColor: '#1E40AF',
          secondaryColor: '#3B82F6',
          fontFamily: 'Inter, sans-serif'
        },
        features: ['All Enterprise Features'],
        configTemplate: {
          plan: 'enterprise',
          features: {
            aiInsights: true,
            teamCollaboration: true,
            advancedReporting: true,
            apiWebhooks: true,
            mobileApp: true,
            customFields: true,
            sso: true,
            customIntegrations: true
          }
        },
        previewUrl: '/templates/corporate-preview.png'
      },
      {
        id: 'creative',
        name: 'Creative Agency',
        description: 'Vibrant and modern design for creative agencies',
        industry: 'Creative',
        branding: {
          logo: '/templates/creative-logo.svg',
          primaryColor: '#7C3AED',
          secondaryColor: '#A855F7',
          fontFamily: 'Poppins, sans-serif'
        },
        features: ['Professional Features', 'Custom Branding'],
        configTemplate: {
          plan: 'professional',
          features: {
            aiInsights: true,
            teamCollaboration: true,
            advancedReporting: true,
            apiWebhooks: false,
            mobileApp: true,
            customFields: true,
            sso: false,
            customIntegrations: false
          }
        },
        previewUrl: '/templates/creative-preview.png'
      },
      {
        id: 'startup',
        name: 'Startup Green',
        description: 'Clean and minimal design for startups',
        industry: 'Technology',
        branding: {
          logo: '/templates/startup-logo.svg',
          primaryColor: '#059669',
          secondaryColor: '#10B981',
          fontFamily: 'Roboto, sans-serif'
        },
        features: ['Essential Features', 'Growth Ready'],
        configTemplate: {
          plan: 'starter',
          features: {
            aiInsights: false,
            teamCollaboration: true,
            advancedReporting: false,
            apiWebhooks: false,
            mobileApp: true,
            customFields: false,
            sso: false,
            customIntegrations: false
          }
        },
        previewUrl: '/templates/startup-preview.png'
      },
      {
        id: 'consulting',
        name: 'Professional Consulting',
        description: 'Sophisticated design for consulting firms',
        industry: 'Consulting',
        branding: {
          logo: '/templates/consulting-logo.svg',
          primaryColor: '#374151',
          secondaryColor: '#6B7280',
          fontFamily: 'Merriweather, serif'
        },
        features: ['Professional Features', 'Client Management'],
        configTemplate: {
          plan: 'professional',
          features: {
            aiInsights: true,
            teamCollaboration: true,
            advancedReporting: true,
            apiWebhooks: true,
            mobileApp: true,
            customFields: true,
            sso: true,
            customIntegrations: false
          }
        },
        previewUrl: '/templates/consulting-preview.png'
      }
    ];
  }

  // Private helper methods
  private generateTenantId(): string {
    return `tenant_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  private initializeTenantUsage(tenantId: string): void {
    const currentPeriod = new Date().toISOString().substring(0, 7);
    const initialUsage: TenantUsage = {
      tenantId,
      period: currentPeriod,
      users: 0,
      projects: 0,
      tasks: 0,
      timeLogs: 0,
      storage: 0,
      apiCalls: 0,
      webhookDeliveries: 0,
      reportGenerations: 0
    };
    
    this.usage.set(tenantId, [initialUsage]);
  }

  private initializeDefaultTenants(): void {
    // Create a demo tenant for showcase
    const demoTenant: TenantConfig = {
      id: 'demo_tenant',
      name: 'Demo Company',
      subdomain: 'demo',
      plan: 'enterprise',
      branding: {
        primaryColor: '#0D9488',
        secondaryColor: '#14B8A6',
        fontFamily: 'Inter, sans-serif'
      },
      features: {
        maxUsers: 50,
        maxProjects: 100,
        maxStorage: 10,
        aiInsights: true,
        teamCollaboration: true,
        advancedReporting: true,
        apiWebhooks: true,
        mobileApp: true,
        customFields: true,
        sso: true,
        customIntegrations: true
      },
      settings: {
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD',
        language: 'en',
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        workingHours: {
          start: '09:00',
          end: '17:00'
        }
      },
      subscription: {
        status: 'active',
        billingEmail: 'billing@demo.com',
        billingCycle: 'monthly',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      admin: {
        userId: 'demo_admin',
        email: 'admin@demo.com',
        name: 'Demo Admin'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    this.tenants.set(demoTenant.id, demoTenant);
    this.initializeTenantUsage(demoTenant.id);
    
    console.log('🏢 Initialized demo tenant: demo.gigster-garage.com');
  }

  /**
   * Get tenant dashboard statistics
   */
  async getTenantDashboard(): Promise<any> {
    const tenants = Array.from(this.tenants.values());
    const activeTenants = tenants.filter(t => t.isActive);
    const trialTenants = tenants.filter(t => t.subscription.status === 'trial');
    
    // Calculate total revenue
    const allBilling = Array.from(this.billing.values()).flat();
    const totalRevenue = allBilling
      .filter(b => b.status === 'paid')
      .reduce((sum, b) => sum + b.amount, 0);

    return {
      totalTenants: tenants.length,
      activeTenants: activeTenants.length,
      trialTenants: trialTenants.length,
      totalRevenue,
      recentTenants: tenants
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
      planDistribution: {
        starter: tenants.filter(t => t.plan === 'starter').length,
        professional: tenants.filter(t => t.plan === 'professional').length,
        enterprise: tenants.filter(t => t.plan === 'enterprise').length
      }
    };
  }
}

export const whiteLabelService = new WhiteLabelService();