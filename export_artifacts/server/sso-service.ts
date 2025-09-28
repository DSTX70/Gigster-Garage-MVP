import passport from 'passport';
import { Strategy as SamlStrategy } from 'passport-saml';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as AzureADStrategy } from 'passport-azure-ad';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { storage } from './storage';

export interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oauth2' | 'oidc';
  protocol: 'SAML 2.0' | 'OAuth 2.0' | 'OpenID Connect';
  configuration: {
    // SAML Configuration
    entryPoint?: string;
    issuer?: string;
    cert?: string;
    identifierFormat?: string;
    signatureAlgorithm?: string;
    
    // OAuth Configuration
    clientID?: string;
    clientSecret?: string;
    authorizationURL?: string;
    tokenURL?: string;
    userInfoURL?: string;
    scope?: string[];
    
    // Common Configuration
    callbackURL: string;
    attributeMapping: {
      email: string;
      firstName: string;
      lastName: string;
      groups?: string;
      department?: string;
      title?: string;
    };
  };
  domainRestrictions?: string[]; // Allowed email domains
  autoProvision: boolean; // Auto-create users on first login
  defaultRole: 'user' | 'admin' | 'manager';
  groupMapping?: {
    [providerGroup: string]: 'user' | 'admin' | 'manager';
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SSOSession {
  id: string;
  userId: string;
  providerId: string;
  providerUserId: string;
  sessionData: any;
  claims: {
    email: string;
    firstName?: string;
    lastName?: string;
    groups?: string[];
    department?: string;
    title?: string;
    [key: string]: any;
  };
  expiresAt: string;
  createdAt: string;
  lastAccessedAt: string;
}

export interface SSOAuditLog {
  id: string;
  event: 'login_attempt' | 'login_success' | 'login_failure' | 'logout' | 'session_expired' | 'provision_user';
  userId?: string;
  providerId: string;
  ipAddress: string;
  userAgent: string;
  details: {
    reason?: string;
    error?: string;
    claims?: any;
    [key: string]: any;
  };
  timestamp: string;
}

export class SSOService {
  private providers: Map<string, SSOProvider> = new Map();
  private sessions: Map<string, SSOSession> = new Map();
  private auditLogs: SSOAuditLog[] = [];

  constructor() {
    console.log('🔐 SSO service initialized');
    this.initializeDefaultProviders();
    this.startSessionCleanup();
  }

  /**
   * Register a new SSO provider
   */
  async registerProvider(provider: Omit<SSOProvider, 'id' | 'createdAt' | 'updatedAt'>): Promise<SSOProvider> {
    const ssoProvider: SSOProvider = {
      ...provider,
      id: this.generateProviderId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.providers.set(ssoProvider.id, ssoProvider);
    
    // Configure passport strategy
    await this.configurePassportStrategy(ssoProvider);
    
    console.log(`🔐 Registered SSO provider: ${ssoProvider.name} (${ssoProvider.type})`);
    return ssoProvider;
  }

  /**
   * Update SSO provider configuration
   */
  async updateProvider(id: string, updates: Partial<SSOProvider>): Promise<SSOProvider> {
    const existing = this.providers.get(id);
    if (!existing) {
      throw new Error(`SSO provider not found: ${id}`);
    }

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.providers.set(id, updated);
    
    // Reconfigure passport strategy
    await this.configurePassportStrategy(updated);
    
    console.log(`🔐 Updated SSO provider: ${updated.name}`);
    return updated;
  }

  /**
   * Get all SSO providers
   */
  async getProviders(): Promise<SSOProvider[]> {
    return Array.from(this.providers.values()).sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  /**
   * Get active SSO providers
   */
  async getActiveProviders(): Promise<SSOProvider[]> {
    return Array.from(this.providers.values()).filter(p => p.isActive);
  }

  /**
   * Configure passport strategy for provider
   */
  private async configurePassportStrategy(provider: SSOProvider): Promise<void> {
    const strategyName = `sso-${provider.id}`;
    
    switch (provider.type) {
      case 'saml':
        this.configureSAMLStrategy(provider, strategyName);
        break;
      case 'oauth2':
        this.configureOAuth2Strategy(provider, strategyName);
        break;
      case 'oidc':
        this.configureOIDCStrategy(provider, strategyName);
        break;
    }
  }

  /**
   * Configure SAML strategy
   */
  private configureSAMLStrategy(provider: SSOProvider, strategyName: string): void {
    const strategy = new SamlStrategy(
      {
        entryPoint: provider.configuration.entryPoint!,
        issuer: provider.configuration.issuer!,
        callbackUrl: provider.configuration.callbackURL,
        cert: provider.configuration.cert!,
        identifierFormat: provider.configuration.identifierFormat || 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
        signatureAlgorithm: provider.configuration.signatureAlgorithm || 'sha256'
      },
      async (profile: any, done: any) => {
        try {
          const result = await this.handleSSOLogin(provider, profile);
          done(null, result);
        } catch (error) {
          console.error('SAML authentication error:', error);
          await this.logAuditEvent('login_failure', provider.id, {
            error: error.message,
            profile
          });
          done(error, null);
        }
      }
    );

    passport.use(strategyName, strategy);
    console.log(`🔐 Configured SAML strategy: ${strategyName}`);
  }

  /**
   * Configure OAuth2 strategy
   */
  private configureOAuth2Strategy(provider: SSOProvider, strategyName: string): void {
    const strategy = new OAuth2Strategy(
      {
        clientID: provider.configuration.clientID!,
        clientSecret: provider.configuration.clientSecret!,
        authorizationURL: provider.configuration.authorizationURL!,
        tokenURL: provider.configuration.tokenURL!,
        callbackURL: provider.configuration.callbackURL,
        scope: provider.configuration.scope || ['openid', 'profile', 'email']
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          // Fetch user info if userInfoURL is provided
          if (provider.configuration.userInfoURL) {
            const userInfoResponse = await fetch(provider.configuration.userInfoURL, {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            const userInfo = await userInfoResponse.json();
            profile = { ...profile, ...userInfo };
          }

          const result = await this.handleSSOLogin(provider, profile);
          done(null, result);
        } catch (error) {
          console.error('OAuth2 authentication error:', error);
          await this.logAuditEvent('login_failure', provider.id, {
            error: error.message,
            profile
          });
          done(error, null);
        }
      }
    );

    passport.use(strategyName, strategy);
    console.log(`🔐 Configured OAuth2 strategy: ${strategyName}`);
  }

  /**
   * Configure OpenID Connect strategy
   */
  private configureOIDCStrategy(provider: SSOProvider, strategyName: string): void {
    // For Google OAuth as an example of OIDC
    if (provider.name.toLowerCase().includes('google')) {
      const strategy = new GoogleStrategy(
        {
          clientID: provider.configuration.clientID!,
          clientSecret: provider.configuration.clientSecret!,
          callbackURL: provider.configuration.callbackURL
        },
        async (accessToken: string, refreshToken: string, profile: any, done: any) => {
          try {
            const result = await this.handleSSOLogin(provider, profile);
            done(null, result);
          } catch (error) {
            console.error('Google OIDC authentication error:', error);
            await this.logAuditEvent('login_failure', provider.id, {
              error: error.message,
              profile
            });
            done(error, null);
          }
        }
      );

      passport.use(strategyName, strategy);
      console.log(`🔐 Configured Google OIDC strategy: ${strategyName}`);
    }
  }

  /**
   * Handle SSO login process
   */
  private async handleSSOLogin(provider: SSOProvider, profile: any): Promise<any> {
    console.log(`🔐 Processing SSO login for provider: ${provider.name}`);

    // Extract claims based on attribute mapping
    const claims = this.extractClaims(provider, profile);
    
    // Validate domain restrictions
    if (provider.domainRestrictions?.length) {
      const emailDomain = claims.email.split('@')[1];
      if (!provider.domainRestrictions.includes(emailDomain)) {
        throw new Error(`Email domain '${emailDomain}' not allowed for this SSO provider`);
      }
    }

    // Find or create user
    let user = await storage.getUserByEmail(claims.email);
    
    if (!user && provider.autoProvision) {
      // Auto-provision new user
      const role = this.determineUserRole(provider, claims);
      user = await storage.createUser({
        username: claims.email.split('@')[0],
        email: claims.email,
        name: `${claims.firstName || ''} ${claims.lastName || ''}`.trim(),
        password: crypto.randomBytes(32).toString('hex'), // Random password (won't be used)
        role,
        notificationPreferences: {
          email: true,
          sms: false,
          browser: true
        },
        ssoProvider: provider.id
      });

      await this.logAuditEvent('provision_user', provider.id, {
        userId: user.id,
        email: claims.email,
        role
      });

      console.log(`👤 Auto-provisioned user: ${claims.email} with role: ${role}`);
    } else if (!user) {
      throw new Error('User not found and auto-provisioning is disabled');
    }

    // Create SSO session
    const session = await this.createSSOSession(user.id, provider.id, profile.id || profile.nameID, claims);

    await this.logAuditEvent('login_success', provider.id, {
      userId: user.id,
      email: claims.email,
      sessionId: session.id
    });

    return {
      user,
      session,
      claims
    };
  }

  /**
   * Extract claims from provider profile
   */
  private extractClaims(provider: SSOProvider, profile: any): SSOSession['claims'] {
    const mapping = provider.configuration.attributeMapping;
    
    const claims: SSOSession['claims'] = {
      email: this.getAttributeValue(profile, mapping.email),
      firstName: this.getAttributeValue(profile, mapping.firstName),
      lastName: this.getAttributeValue(profile, mapping.lastName)
    };

    // Optional attributes
    if (mapping.groups) {
      claims.groups = this.getAttributeValue(profile, mapping.groups, true);
    }
    
    if (mapping.department) {
      claims.department = this.getAttributeValue(profile, mapping.department);
    }
    
    if (mapping.title) {
      claims.title = this.getAttributeValue(profile, mapping.title);
    }

    return claims;
  }

  /**
   * Get attribute value from profile
   */
  private getAttributeValue(profile: any, attributePath: string, isArray: boolean = false): any {
    const keys = attributePath.split('.');
    let value = profile;
    
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) break;
    }

    if (isArray && value && !Array.isArray(value)) {
      value = [value];
    }

    return value;
  }

  /**
   * Determine user role based on provider configuration and claims
   */
  private determineUserRole(provider: SSOProvider, claims: SSOSession['claims']): 'user' | 'admin' | 'manager' {
    // Check group mapping first
    if (provider.groupMapping && claims.groups) {
      for (const group of claims.groups) {
        if (provider.groupMapping[group]) {
          return provider.groupMapping[group];
        }
      }
    }

    // Fall back to default role
    return provider.defaultRole;
  }

  /**
   * Create SSO session
   */
  private async createSSOSession(
    userId: string, 
    providerId: string, 
    providerUserId: string, 
    claims: SSOSession['claims']
  ): Promise<SSOSession> {
    const session: SSOSession = {
      id: this.generateSessionId(),
      userId,
      providerId,
      providerUserId,
      sessionData: {},
      claims,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
      createdAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString()
    };

    this.sessions.set(session.id, session);
    console.log(`🔐 Created SSO session: ${session.id} for user: ${userId}`);
    return session;
  }

  /**
   * Validate and refresh SSO session
   */
  async validateSession(sessionId: string): Promise<SSOSession | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Check if session is expired
    if (new Date() > new Date(session.expiresAt)) {
      this.sessions.delete(sessionId);
      await this.logAuditEvent('session_expired', session.providerId, {
        sessionId,
        userId: session.userId
      });
      return null;
    }

    // Update last accessed time
    session.lastAccessedAt = new Date().toISOString();
    this.sessions.set(sessionId, session);

    return session;
  }

  /**
   * Logout and cleanup SSO session
   */
  async logout(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.sessions.delete(sessionId);
      await this.logAuditEvent('logout', session.providerId, {
        sessionId,
        userId: session.userId
      });
      console.log(`🔐 Logged out SSO session: ${sessionId}`);
    }
  }

  /**
   * Generate SAML metadata for service provider
   */
  generateSAMLMetadata(baseUrl: string): string {
    const entityId = `${baseUrl}/sso/saml/metadata`;
    const acsUrl = `${baseUrl}/sso/saml/acs`;
    const sloUrl = `${baseUrl}/sso/saml/slo`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="${entityId}">
  <md:SPSSODescriptor AuthnRequestsSigned="false" WantAssertionsSigned="true" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:KeyDescriptor use="signing">
      <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <ds:X509Data>
          <ds:X509Certificate><!-- Certificate will be generated --></ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </md:KeyDescriptor>
    <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat>
    <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="${acsUrl}" index="0"/>
    <md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="${sloUrl}"/>
  </md:SPSSODescriptor>
</md:EntityDescriptor>`;
  }

  /**
   * Log audit event
   */
  private async logAuditEvent(
    event: SSOAuditLog['event'], 
    providerId: string, 
    details: any,
    request?: any
  ): Promise<void> {
    const auditLog: SSOAuditLog = {
      id: this.generateAuditId(),
      event,
      providerId,
      userId: details.userId,
      ipAddress: request?.ip || '127.0.0.1',
      userAgent: request?.get('user-agent') || 'Unknown',
      details,
      timestamp: new Date().toISOString()
    };

    this.auditLogs.push(auditLog);
    console.log(`📋 SSO Audit: ${event} for provider ${providerId}`);

    // Keep only last 10000 logs to prevent memory issues
    if (this.auditLogs.length > 10000) {
      this.auditLogs = this.auditLogs.slice(-10000);
    }
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(filters?: {
    event?: SSOAuditLog['event'];
    providerId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<SSOAuditLog[]> {
    let logs = [...this.auditLogs];

    if (filters) {
      if (filters.event) {
        logs = logs.filter(log => log.event === filters.event);
      }
      if (filters.providerId) {
        logs = logs.filter(log => log.providerId === filters.providerId);
      }
      if (filters.userId) {
        logs = logs.filter(log => log.userId === filters.userId);
      }
      if (filters.startDate) {
        logs = logs.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        logs = logs.filter(log => log.timestamp <= filters.endDate!);
      }
    }

    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get SSO statistics
   */
  async getStatistics(): Promise<any> {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recent24h = this.auditLogs.filter(log => new Date(log.timestamp) >= last24Hours);
    const recent7d = this.auditLogs.filter(log => new Date(log.timestamp) >= last7Days);

    return {
      totalProviders: this.providers.size,
      activeProviders: Array.from(this.providers.values()).filter(p => p.isActive).length,
      activeSessions: this.sessions.size,
      
      statistics24h: {
        loginAttempts: recent24h.filter(log => log.event === 'login_attempt').length,
        loginSuccesses: recent24h.filter(log => log.event === 'login_success').length,
        loginFailures: recent24h.filter(log => log.event === 'login_failure').length,
        logouts: recent24h.filter(log => log.event === 'logout').length,
        provisioned: recent24h.filter(log => log.event === 'provision_user').length
      },
      
      statistics7d: {
        loginAttempts: recent7d.filter(log => log.event === 'login_attempt').length,
        loginSuccesses: recent7d.filter(log => log.event === 'login_success').length,
        loginFailures: recent7d.filter(log => log.event === 'login_failure').length,
        logouts: recent7d.filter(log => log.event === 'logout').length,
        provisioned: recent7d.filter(log => log.event === 'provision_user').length
      },

      providerStats: Array.from(this.providers.values()).map(provider => ({
        id: provider.id,
        name: provider.name,
        type: provider.type,
        loginCount: this.auditLogs.filter(log => 
          log.providerId === provider.id && log.event === 'login_success'
        ).length
      }))
    };
  }

  // Private helper methods
  private initializeDefaultProviders(): void {
    // Initialize with common enterprise providers (disabled by default)
    console.log('🔐 SSO service ready for provider configuration');
  }

  private startSessionCleanup(): void {
    // Clean up expired sessions every hour
    setInterval(() => {
      const now = new Date();
      let cleanedCount = 0;
      
      for (const [sessionId, session] of this.sessions.entries()) {
        if (now > new Date(session.expiresAt)) {
          this.sessions.delete(sessionId);
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        console.log(`🧹 Cleaned up ${cleanedCount} expired SSO sessions`);
      }
    }, 60 * 60 * 1000); // 1 hour
  }

  private generateProviderId(): string {
    return `sso_provider_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `sso_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAuditId(): string {
    return `sso_audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get provider templates for common enterprise systems
   */
  getProviderTemplates(): Partial<SSOProvider>[] {
    return [
      {
        name: 'Microsoft Azure AD',
        type: 'saml',
        protocol: 'SAML 2.0',
        configuration: {
          identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
          signatureAlgorithm: 'sha256',
          attributeMapping: {
            email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
            firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
            lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
            groups: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/groups'
          }
        },
        autoProvision: true,
        defaultRole: 'user'
      },
      {
        name: 'Okta',
        type: 'saml',
        protocol: 'SAML 2.0',
        configuration: {
          identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
          signatureAlgorithm: 'sha256',
          attributeMapping: {
            email: 'email',
            firstName: 'firstName',
            lastName: 'lastName',
            groups: 'groups'
          }
        },
        autoProvision: true,
        defaultRole: 'user'
      },
      {
        name: 'Google Workspace',
        type: 'oidc',
        protocol: 'OpenID Connect',
        configuration: {
          scope: ['openid', 'profile', 'email'],
          attributeMapping: {
            email: 'email',
            firstName: 'given_name',
            lastName: 'family_name'
          }
        },
        autoProvision: true,
        defaultRole: 'user'
      },
      {
        name: 'Auth0',
        type: 'oauth2',
        protocol: 'OAuth 2.0',
        configuration: {
          scope: ['openid', 'profile', 'email'],
          attributeMapping: {
            email: 'email',
            firstName: 'given_name',
            lastName: 'family_name'
          }
        },
        autoProvision: true,
        defaultRole: 'user'
      }
    ];
  }
}

export const ssoService = new SSOService();