import { storage } from './storage';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  resource: string;
  action: string;
  conditions?: PermissionCondition[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: any;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  inheritsFrom?: string[];
  isSystem: boolean;
  priority: number;
  restrictions?: RoleRestriction[];
  createdAt: string;
  updatedAt: string;
}

export interface RoleRestriction {
  type: 'time_based' | 'ip_based' | 'location_based' | 'resource_quota';
  configuration: {
    allowedHours?: string[];
    allowedIPs?: string[];
    allowedCountries?: string[];
    maxResources?: number;
    quotaPeriod?: 'daily' | 'weekly' | 'monthly';
  };
}

export interface UserPermission {
  userId: string;
  permissionId: string;
  roleId?: string;
  granted: boolean;
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  conditions?: any;
}

export interface PermissionCheck {
  userId: string;
  permission: string;
  resource?: any;
  context?: any;
}

export interface PermissionAuditLog {
  id: string;
  action: 'grant' | 'revoke' | 'check' | 'create' | 'update' | 'delete';
  userId?: string;
  targetUserId?: string;
  permissionId?: string;
  roleId?: string;
  resource?: string;
  result?: boolean;
  reason?: string;
  details: any;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

export class PermissionsService {
  private permissions: Map<string, Permission> = new Map();
  private roles: Map<string, Role> = new Map();
  private userPermissions: Map<string, UserPermission[]> = new Map();
  private auditLogs: PermissionAuditLog[] = [];

  constructor() {
    console.log('🔐 Permissions service initialized');
    this.initializeSystemPermissions();
    this.initializeSystemRoles();
  }

  /**
   * Initialize system permissions
   */
  private initializeSystemPermissions(): void {
    const systemPermissions: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>[] = [
      // User Management
      { name: 'users.create', description: 'Create new users', category: 'User Management', resource: 'user', action: 'create', isSystem: true },
      { name: 'users.read', description: 'View user information', category: 'User Management', resource: 'user', action: 'read', isSystem: true },
      { name: 'users.update', description: 'Update user information', category: 'User Management', resource: 'user', action: 'update', isSystem: true },
      { name: 'users.delete', description: 'Delete users', category: 'User Management', resource: 'user', action: 'delete', isSystem: true },
      { name: 'users.list', description: 'List all users', category: 'User Management', resource: 'user', action: 'list', isSystem: true },

      // Task Management
      { name: 'tasks.create', description: 'Create new tasks', category: 'Task Management', resource: 'task', action: 'create', isSystem: true },
      { name: 'tasks.read', description: 'View tasks', category: 'Task Management', resource: 'task', action: 'read', isSystem: true },
      { name: 'tasks.update', description: 'Update tasks', category: 'Task Management', resource: 'task', action: 'update', isSystem: true },
      { name: 'tasks.delete', description: 'Delete tasks', category: 'Task Management', resource: 'task', action: 'delete', isSystem: true },
      { name: 'tasks.assign', description: 'Assign tasks to users', category: 'Task Management', resource: 'task', action: 'assign', isSystem: true },

      // Project Management
      { name: 'projects.create', description: 'Create new projects', category: 'Project Management', resource: 'project', action: 'create', isSystem: true },
      { name: 'projects.read', description: 'View projects', category: 'Project Management', resource: 'project', action: 'read', isSystem: true },
      { name: 'projects.update', description: 'Update projects', category: 'Project Management', resource: 'project', action: 'update', isSystem: true },
      { name: 'projects.delete', description: 'Delete projects', category: 'Project Management', resource: 'project', action: 'delete', isSystem: true },
      { name: 'projects.manage', description: 'Full project management', category: 'Project Management', resource: 'project', action: 'manage', isSystem: true },

      // Time Tracking
      { name: 'timelog.create', description: 'Create time entries', category: 'Time Tracking', resource: 'timelog', action: 'create', isSystem: true },
      { name: 'timelog.read', description: 'View time entries', category: 'Time Tracking', resource: 'timelog', action: 'read', isSystem: true },
      { name: 'timelog.update', description: 'Update time entries', category: 'Time Tracking', resource: 'timelog', action: 'update', isSystem: true },
      { name: 'timelog.delete', description: 'Delete time entries', category: 'Time Tracking', resource: 'timelog', action: 'delete', isSystem: true },

      // Reports & Analytics
      { name: 'reports.read', description: 'View reports', category: 'Reports', resource: 'report', action: 'read', isSystem: true },
      { name: 'reports.create', description: 'Create custom reports', category: 'Reports', resource: 'report', action: 'create', isSystem: true },
      { name: 'reports.export', description: 'Export reports', category: 'Reports', resource: 'report', action: 'export', isSystem: true },
      { name: 'analytics.read', description: 'View analytics', category: 'Analytics', resource: 'analytics', action: 'read', isSystem: true },

      // System Administration
      { name: 'admin.settings', description: 'Manage system settings', category: 'Administration', resource: 'system', action: 'settings', isSystem: true },
      { name: 'admin.backup', description: 'Manage backups', category: 'Administration', resource: 'system', action: 'backup', isSystem: true },
      { name: 'admin.audit', description: 'View audit logs', category: 'Administration', resource: 'system', action: 'audit', isSystem: true },
      { name: 'admin.security', description: 'Manage security settings', category: 'Administration', resource: 'system', action: 'security', isSystem: true },

      // Enterprise Features
      { name: 'sso.manage', description: 'Manage SSO providers', category: 'Enterprise', resource: 'sso', action: 'manage', isSystem: true },
      { name: 'permissions.manage', description: 'Manage permissions and roles', category: 'Enterprise', resource: 'permissions', action: 'manage', isSystem: true },
      { name: 'webhooks.manage', description: 'Manage API webhooks', category: 'Enterprise', resource: 'webhooks', action: 'manage', isSystem: true },
      { name: 'whitelabel.manage', description: 'Manage white-label settings', category: 'Enterprise', resource: 'whitelabel', action: 'manage', isSystem: true },

      // Data & Privacy
      { name: 'data.export', description: 'Export user data', category: 'Data Management', resource: 'data', action: 'export', isSystem: true },
      { name: 'data.import', description: 'Import user data', category: 'Data Management', resource: 'data', action: 'import', isSystem: true },
      { name: 'data.delete', description: 'Delete user data', category: 'Data Management', resource: 'data', action: 'delete', isSystem: true },
      { name: 'privacy.manage', description: 'Manage privacy settings', category: 'Data Management', resource: 'privacy', action: 'manage', isSystem: true }
    ];

    systemPermissions.forEach(perm => {
      const permission: Permission = {
        ...perm,
        id: this.generatePermissionId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.permissions.set(permission.id, permission);
    });

    console.log(`🔐 Initialized ${systemPermissions.length} system permissions`);
  }

  /**
   * Initialize system roles
   */
  private initializeSystemRoles(): void {
    const systemRoles: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Super Admin',
        description: 'Full system access with all permissions',
        permissions: Array.from(this.permissions.keys()), // All permissions
        isSystem: true,
        priority: 1000
      },
      {
        name: 'Admin',
        description: 'Administrative access with most permissions',
        permissions: Array.from(this.permissions.values())
          .filter(p => !p.name.includes('admin.') || p.name === 'admin.settings')
          .map(p => p.id),
        isSystem: true,
        priority: 800
      },
      {
        name: 'Manager',
        description: 'Team management and project oversight',
        permissions: Array.from(this.permissions.values())
          .filter(p => 
            p.category === 'Task Management' || 
            p.category === 'Project Management' || 
            p.category === 'Time Tracking' ||
            p.category === 'Reports' ||
            (p.category === 'User Management' && !p.name.includes('delete'))
          )
          .map(p => p.id),
        isSystem: true,
        priority: 600
      },
      {
        name: 'Team Lead',
        description: 'Lead team projects and manage tasks',
        permissions: Array.from(this.permissions.values())
          .filter(p => 
            p.category === 'Task Management' || 
            p.category === 'Project Management' || 
            p.category === 'Time Tracking' ||
            (p.category === 'Reports' && p.action === 'read')
          )
          .map(p => p.id),
        isSystem: true,
        priority: 400
      },
      {
        name: 'User',
        description: 'Standard user with basic access',
        permissions: Array.from(this.permissions.values())
          .filter(p => 
            (p.category === 'Task Management' && !p.name.includes('delete')) ||
            (p.category === 'Time Tracking' && !p.name.includes('delete')) ||
            (p.resource === 'user' && p.action === 'read') ||
            (p.resource === 'project' && p.action === 'read')
          )
          .map(p => p.id),
        isSystem: true,
        priority: 200
      },
      {
        name: 'Guest',
        description: 'Limited read-only access',
        permissions: Array.from(this.permissions.values())
          .filter(p => p.action === 'read' && (p.resource === 'task' || p.resource === 'project'))
          .map(p => p.id),
        isSystem: true,
        priority: 100
      }
    ];

    systemRoles.forEach(role => {
      const systemRole: Role = {
        ...role,
        id: this.generateRoleId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.roles.set(systemRole.id, systemRole);
    });

    console.log(`🔐 Initialized ${systemRoles.length} system roles`);
  }

  /**
   * Create a custom permission
   */
  async createPermission(permissionData: Omit<Permission, 'id' | 'isSystem' | 'createdAt' | 'updatedAt'>): Promise<Permission> {
    const permission: Permission = {
      ...permissionData,
      id: this.generatePermissionId(),
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.permissions.set(permission.id, permission);
    
    await this.logAuditEvent('create', {
      permissionId: permission.id,
      permissionName: permission.name
    });

    console.log(`🔐 Created custom permission: ${permission.name}`);
    return permission;
  }

  /**
   * Create a custom role
   */
  async createRole(roleData: Omit<Role, 'id' | 'isSystem' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    const role: Role = {
      ...roleData,
      id: this.generateRoleId(),
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.roles.set(role.id, role);
    
    await this.logAuditEvent('create', {
      roleId: role.id,
      roleName: role.name,
      permissions: role.permissions
    });

    console.log(`🔐 Created custom role: ${role.name}`);
    return role;
  }

  /**
   * Update a role
   */
  async updateRole(roleId: string, updates: Partial<Role>): Promise<Role> {
    const existing = this.roles.get(roleId);
    if (!existing) {
      throw new Error(`Role not found: ${roleId}`);
    }

    if (existing.isSystem && updates.permissions) {
      throw new Error('Cannot modify permissions of system roles');
    }

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.roles.set(roleId, updated);
    
    await this.logAuditEvent('update', {
      roleId,
      roleName: updated.name,
      changes: updates
    });

    console.log(`🔐 Updated role: ${updated.name}`);
    return updated;
  }

  /**
   * Grant permission to user
   */
  async grantPermission(
    userId: string, 
    permissionId: string, 
    grantedBy: string,
    roleId?: string,
    expiresAt?: string
  ): Promise<void> {
    const userPerms = this.userPermissions.get(userId) || [];
    
    // Check if permission already exists
    const existingIndex = userPerms.findIndex(p => p.permissionId === permissionId);
    
    const userPermission: UserPermission = {
      userId,
      permissionId,
      roleId,
      granted: true,
      grantedBy,
      grantedAt: new Date().toISOString(),
      expiresAt
    };

    if (existingIndex >= 0) {
      userPerms[existingIndex] = userPermission;
    } else {
      userPerms.push(userPermission);
    }

    this.userPermissions.set(userId, userPerms);

    await this.logAuditEvent('grant', {
      userId,
      permissionId,
      roleId,
      grantedBy,
      expiresAt
    });

    console.log(`🔐 Granted permission ${permissionId} to user ${userId}`);
  }

  /**
   * Revoke permission from user
   */
  async revokePermission(userId: string, permissionId: string, revokedBy: string): Promise<void> {
    const userPerms = this.userPermissions.get(userId) || [];
    const filteredPerms = userPerms.filter(p => p.permissionId !== permissionId);
    
    this.userPermissions.set(userId, filteredPerms);

    await this.logAuditEvent('revoke', {
      userId,
      permissionId,
      revokedBy
    });

    console.log(`🔐 Revoked permission ${permissionId} from user ${userId}`);
  }

  /**
   * Check if user has permission
   */
  async checkPermission(check: PermissionCheck): Promise<boolean> {
    const { userId, permission: permissionName, resource, context } = check;

    try {
      // Get user from storage
      const user = await storage.getUser(userId);
      if (!user) {
        await this.logAuditEvent('check', {
          userId,
          permission: permissionName,
          result: false,
          reason: 'User not found'
        });
        return false;
      }

      // Check direct user permissions
      const userPerms = this.userPermissions.get(userId) || [];
      const directPerm = userPerms.find(p => {
        const perm = this.permissions.get(p.permissionId);
        return perm?.name === permissionName && p.granted;
      });

      if (directPerm) {
        // Check expiration
        if (directPerm.expiresAt && new Date() > new Date(directPerm.expiresAt)) {
          await this.logAuditEvent('check', {
            userId,
            permission: permissionName,
            result: false,
            reason: 'Permission expired'
          });
          return false;
        }

        // Check conditions if any
        if (directPerm.conditions && resource) {
          const conditionsMatch = this.evaluateConditions(directPerm.conditions, resource, context);
          if (!conditionsMatch) {
            await this.logAuditEvent('check', {
              userId,
              permission: permissionName,
              result: false,
              reason: 'Conditions not met'
            });
            return false;
          }
        }

        await this.logAuditEvent('check', {
          userId,
          permission: permissionName,
          result: true,
          reason: 'Direct permission'
        });
        return true;
      }

      // Check role-based permissions
      const userRoles = await this.getUserRoles(userId);
      for (const role of userRoles) {
        if (role.permissions.some(permId => {
          const perm = this.permissions.get(permId);
          return perm?.name === permissionName;
        })) {
          // Check role restrictions
          if (role.restrictions) {
            const restrictionsPass = this.evaluateRoleRestrictions(role.restrictions, context);
            if (!restrictionsPass) {
              await this.logAuditEvent('check', {
                userId,
                permission: permissionName,
                result: false,
                reason: 'Role restrictions not met'
              });
              return false;
            }
          }

          await this.logAuditEvent('check', {
            userId,
            permission: permissionName,
            result: true,
            reason: `Role permission: ${role.name}`
          });
          return true;
        }
      }

      await this.logAuditEvent('check', {
        userId,
        permission: permissionName,
        result: false,
        reason: 'Permission not found'
      });
      return false;

    } catch (error) {
      console.error('Permission check error:', error);
      await this.logAuditEvent('check', {
        userId,
        permission: permissionName,
        result: false,
        reason: `Error: ${error.message}`
      });
      return false;
    }
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId: string): Promise<Role[]> {
    try {
      const user = await storage.getUser(userId);
      if (!user) return [];

      // Map legacy role to new role system
      const legacyRoleMapping: Record<string, string> = {
        'admin': 'Admin',
        'manager': 'Manager',
        'user': 'User'
      };

      const roleName = legacyRoleMapping[user.role] || 'User';
      const role = Array.from(this.roles.values()).find(r => r.name === roleName);
      
      return role ? [role] : [];
    } catch (error) {
      console.error('Error getting user roles:', error);
      return [];
    }
  }

  /**
   * Assign role to user
   */
  async assignRole(userId: string, roleId: string, assignedBy: string): Promise<void> {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role not found: ${roleId}`);
    }

    // Grant all role permissions to user
    for (const permissionId of role.permissions) {
      await this.grantPermission(userId, permissionId, assignedBy, roleId);
    }

    await this.logAuditEvent('grant', {
      userId,
      roleId,
      assignedBy,
      action: 'assign_role'
    });

    console.log(`🔐 Assigned role ${role.name} to user ${userId}`);
  }

  /**
   * Remove role from user
   */
  async removeRole(userId: string, roleId: string, removedBy: string): Promise<void> {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role not found: ${roleId}`);
    }

    // Revoke all role permissions from user
    for (const permissionId of role.permissions) {
      await this.revokePermission(userId, permissionId, removedBy);
    }

    await this.logAuditEvent('revoke', {
      userId,
      roleId,
      removedBy,
      action: 'remove_role'
    });

    console.log(`🔐 Removed role ${role.name} from user ${userId}`);
  }

  /**
   * Get all permissions
   */
  async getPermissions(): Promise<Permission[]> {
    return Array.from(this.permissions.values()).sort((a, b) => a.category.localeCompare(b.category));
  }

  /**
   * Get permissions by category
   */
  async getPermissionsByCategory(): Promise<Record<string, Permission[]>> {
    const permissions = await this.getPermissions();
    const byCategory: Record<string, Permission[]> = {};
    
    permissions.forEach(perm => {
      if (!byCategory[perm.category]) {
        byCategory[perm.category] = [];
      }
      byCategory[perm.category].push(perm);
    });

    return byCategory;
  }

  /**
   * Get all roles
   */
  async getRoles(): Promise<Role[]> {
    return Array.from(this.roles.values()).sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId: string): Promise<{
    direct: UserPermission[];
    roles: Role[];
    effective: Permission[];
  }> {
    const direct = this.userPermissions.get(userId) || [];
    const roles = await this.getUserRoles(userId);
    
    // Get effective permissions (combination of direct + role permissions)
    const effectivePermIds = new Set<string>();
    
    // Add direct permissions
    direct.filter(p => p.granted).forEach(p => effectivePermIds.add(p.permissionId));
    
    // Add role permissions
    roles.forEach(role => {
      role.permissions.forEach(permId => effectivePermIds.add(permId));
    });

    const effective = Array.from(effectivePermIds)
      .map(id => this.permissions.get(id))
      .filter(Boolean) as Permission[];

    return { direct, roles, effective };
  }

  /**
   * Get permission statistics
   */
  async getStatistics(): Promise<any> {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recent24h = this.auditLogs.filter(log => new Date(log.timestamp) >= last24Hours);
    const recent7d = this.auditLogs.filter(log => new Date(log.timestamp) >= last7Days);

    return {
      totalPermissions: this.permissions.size,
      systemPermissions: Array.from(this.permissions.values()).filter(p => p.isSystem).length,
      customPermissions: Array.from(this.permissions.values()).filter(p => !p.isSystem).length,
      totalRoles: this.roles.size,
      systemRoles: Array.from(this.roles.values()).filter(r => r.isSystem).length,
      customRoles: Array.from(this.roles.values()).filter(r => !r.isSystem).length,

      statistics24h: {
        permissionChecks: recent24h.filter(log => log.action === 'check').length,
        permissionsGranted: recent24h.filter(log => log.action === 'grant').length,
        permissionsRevoked: recent24h.filter(log => log.action === 'revoke').length,
        rolesCreated: recent24h.filter(log => log.action === 'create' && log.roleId).length,
        permissionsCreated: recent24h.filter(log => log.action === 'create' && log.permissionId).length
      },

      statistics7d: {
        permissionChecks: recent7d.filter(log => log.action === 'check').length,
        permissionsGranted: recent7d.filter(log => log.action === 'grant').length,
        permissionsRevoked: recent7d.filter(log => log.action === 'revoke').length,
        rolesCreated: recent7d.filter(log => log.action === 'create' && log.roleId).length,
        permissionsCreated: recent7d.filter(log => log.action === 'create' && log.permissionId).length
      },

      categoryStats: await this.getCategoryStatistics(),
      roleUsage: await this.getRoleUsageStatistics()
    };
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(filters?: {
    action?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PermissionAuditLog[]> {
    let logs = [...this.auditLogs];

    if (filters) {
      if (filters.action) {
        logs = logs.filter(log => log.action === filters.action);
      }
      if (filters.userId) {
        logs = logs.filter(log => log.userId === filters.userId || log.targetUserId === filters.userId);
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

  // Private helper methods
  private evaluateConditions(conditions: any, resource: any, context: any): boolean {
    // Implement condition evaluation logic
    return true; // Simplified for now
  }

  private evaluateRoleRestrictions(restrictions: RoleRestriction[], context: any): boolean {
    // Implement role restriction evaluation
    return true; // Simplified for now
  }

  private async getCategoryStatistics(): Promise<any> {
    const categories = Array.from(new Set(Array.from(this.permissions.values()).map(p => p.category)));
    return categories.map(category => ({
      category,
      permissionCount: Array.from(this.permissions.values()).filter(p => p.category === category).length
    }));
  }

  private async getRoleUsageStatistics(): Promise<any> {
    return Array.from(this.roles.values()).map(role => ({
      id: role.id,
      name: role.name,
      permissionCount: role.permissions.length,
      isSystem: role.isSystem
    }));
  }

  private async logAuditEvent(action: PermissionAuditLog['action'], details: any, request?: any): Promise<void> {
    const auditLog: PermissionAuditLog = {
      id: this.generateAuditId(),
      action,
      userId: details.userId,
      targetUserId: details.targetUserId,
      permissionId: details.permissionId,
      roleId: details.roleId,
      resource: details.resource,
      result: details.result,
      reason: details.reason,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: request?.ip || '127.0.0.1',
      userAgent: request?.get('user-agent') || 'System'
    };

    this.auditLogs.push(auditLog);

    // Keep only last 10000 logs
    if (this.auditLogs.length > 10000) {
      this.auditLogs = this.auditLogs.slice(-10000);
    }
  }

  private generatePermissionId(): string {
    return `perm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRoleId(): string {
    return `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const permissionsService = new PermissionsService();

/**
 * Middleware for checking permissions
 */
export const requirePermission = (permissionName: string) => {
  return async (req: any, res: any, next: any) => {
    if (!req.session?.user?.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const hasPermission = await permissionsService.checkPermission({
      userId: req.session.user.id,
      permission: permissionName,
      context: {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        path: req.path
      }
    });

    if (!hasPermission) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        required: permissionName 
      });
    }

    next();
  };
};