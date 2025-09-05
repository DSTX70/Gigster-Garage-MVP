import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Shield, 
  Plus, 
  Users, 
  Key, 
  Edit, 
  Trash2, 
  Copy, 
  Crown,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Clock,
  Settings,
  Filter,
  Search,
  Download,
  Upload,
  BarChart3,
  Globe,
  Building,
  UserCheck,
  UserX,
  Calendar,
  MapPin
} from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  resource: string;
  action: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  inheritsFrom?: string[];
  isSystem: boolean;
  priority: number;
  restrictions?: any[];
  createdAt: string;
  updatedAt: string;
}

interface UserPermission {
  userId: string;
  permissionId: string;
  roleId?: string;
  granted: boolean;
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
}

interface PermissionAuditLog {
  id: string;
  action: string;
  userId?: string;
  targetUserId?: string;
  permissionId?: string;
  roleId?: string;
  result?: boolean;
  reason?: string;
  details: any;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

interface PermissionStatistics {
  totalPermissions: number;
  systemPermissions: number;
  customPermissions: number;
  totalRoles: number;
  systemRoles: number;
  customRoles: number;
  statistics24h: {
    permissionChecks: number;
    permissionsGranted: number;
    permissionsRevoked: number;
    rolesCreated: number;
    permissionsCreated: number;
  };
  statistics7d: {
    permissionChecks: number;
    permissionsGranted: number;
    permissionsRevoked: number;
    rolesCreated: number;
    permissionsCreated: number;
  };
  categoryStats: { category: string; permissionCount: number }[];
  roleUsage: { id: string; name: string; permissionCount: number; isSystem: boolean }[];
}

export default function PermissionsManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('permissions');
  const [showCreatePermissionDialog, setShowCreatePermissionDialog] = useState(false);
  const [showCreateRoleDialog, setShowCreateRoleDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Form states
  const [newPermission, setNewPermission] = useState({
    name: '',
    description: '',
    category: '',
    resource: '',
    action: ''
  });

  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    priority: 500,
    restrictions: []
  });

  const { data: permissions = [] } = useQuery<Permission[]>({
    queryKey: ['/api/permissions']
  });

  const { data: permissionsByCategory = {} } = useQuery<Record<string, Permission[]>>({
    queryKey: ['/api/permissions/by-category']
  });

  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ['/api/roles']
  });

  const { data: statistics } = useQuery<PermissionStatistics>({
    queryKey: ['/api/permissions/statistics']
  });

  const { data: auditLogs = [] } = useQuery<PermissionAuditLog[]>({
    queryKey: ['/api/permissions/audit-logs']
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/users']
  });

  const createPermissionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/permissions', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/permissions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/permissions/by-category'] });
      queryClient.invalidateQueries({ queryKey: ['/api/permissions/statistics'] });
      setShowCreatePermissionDialog(false);
      resetPermissionForm();
      toast({
        title: "Permission Created",
        description: "Custom permission has been created successfully",
      });
    }
  });

  const createRoleMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/roles', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/permissions/statistics'] });
      setShowCreateRoleDialog(false);
      resetRoleForm();
      toast({
        title: "Role Created",
        description: "Custom role has been created successfully",
      });
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest('PATCH', `/api/roles/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
    }
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      const response = await apiRequest('POST', `/api/users/${userId}/roles/${roleId}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Role Assigned",
        description: "Role has been assigned to user successfully",
      });
    }
  });

  const handleCreatePermission = () => {
    if (!newPermission.name || !newPermission.category || !newPermission.resource || !newPermission.action) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createPermissionMutation.mutate(newPermission);
  };

  const handleCreateRole = () => {
    if (!newRole.name || newRole.permissions.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please provide role name and select at least one permission",
        variant: "destructive",
      });
      return;
    }

    createRoleMutation.mutate(newRole);
  };

  const toggleRolePermission = (permissionId: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const resetPermissionForm = () => {
    setNewPermission({
      name: '',
      description: '',
      category: '',
      resource: '',
      action: ''
    });
  };

  const resetRoleForm = () => {
    setNewRole({
      name: '',
      description: '',
      permissions: [],
      priority: 500,
      restrictions: []
    });
  };

  const categories = Array.from(new Set(permissions.map(p => p.category)));
  
  const filteredPermissions = permissions.filter(perm => {
    const matchesSearch = perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         perm.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || perm.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return Plus;
      case 'read': return Eye;
      case 'update': return Edit;
      case 'delete': return Trash2;
      case 'manage': return Settings;
      case 'export': return Download;
      case 'import': return Upload;
      default: return Key;
    }
  };

  const getEventIcon = (action: string) => {
    switch (action) {
      case 'grant': return CheckCircle;
      case 'revoke': return UserX;
      case 'check': return Eye;
      case 'create': return Plus;
      case 'update': return Edit;
      default: return Shield;
    }
  };

  const getEventColor = (action: string) => {
    switch (action) {
      case 'grant': return 'text-green-600';
      case 'revoke': return 'text-red-600';
      case 'check': return 'text-blue-600';
      case 'create': return 'text-purple-600';
      case 'update': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-amber-50">
      <AppHeader />
      
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Advanced Permissions</h1>
            <p className="text-gray-600">Role-based access control and permission management</p>
          </div>
          <div className="flex items-center space-x-3">
            {statistics && (
              <>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {statistics.totalRoles} roles
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {statistics.totalPermissions} permissions
                </Badge>
              </>
            )}
            <Button 
              onClick={() => setShowCreateRoleDialog(true)}
              variant="outline"
            >
              <Users className="h-4 w-4 mr-2" />
              New Role
            </Button>
            <Button 
              onClick={() => setShowCreatePermissionDialog(true)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Permission
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="users">User Access</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search permissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Permissions by Category */}
            <div className="space-y-6">
              {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => {
                const visiblePermissions = categoryPermissions.filter(perm => 
                  filteredPermissions.includes(perm)
                );
                
                if (visiblePermissions.length === 0) return null;

                return (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{category}</span>
                        <Badge variant="outline">
                          {visiblePermissions.length} permissions
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {visiblePermissions.map((permission) => {
                          const ActionIcon = getActionIcon(permission.action);
                          return (
                            <div key={permission.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <ActionIcon className="h-4 w-4 text-teal-600" />
                                  <span className="font-medium text-sm">{permission.name}</span>
                                </div>
                                {permission.isSystem && (
                                  <Badge variant="secondary" className="text-xs">System</Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mb-2">{permission.description}</p>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">{permission.resource}.{permission.action}</span>
                                <Button variant="ghost" size="sm" className="h-6 px-2">
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-6">
            <div className="grid gap-6">
              {roles.map((role) => (
                <Card key={role.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg ${role.isSystem ? 'bg-blue-100' : 'bg-purple-100'} flex items-center justify-center`}>
                          {role.isSystem ? (
                            <Shield className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Crown className="h-5 w-5 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{role.name}</CardTitle>
                          <CardDescription>{role.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {role.permissions.length} permissions
                        </Badge>
                        <Badge variant="secondary" className={role.isSystem ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                          {role.isSystem ? 'System' : 'Custom'}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!role.isSystem && (
                          <>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div>
                          <Label className="text-sm text-gray-600">Priority</Label>
                          <div className="text-sm font-medium">{role.priority}</div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Created</Label>
                          <div className="text-sm font-medium">
                            {new Date(role.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {role.restrictions && role.restrictions.length > 0 && (
                          <div>
                            <Label className="text-sm text-gray-600">Restrictions</Label>
                            <div className="text-sm font-medium text-orange-600">
                              {role.restrictions.length} active
                            </div>
                          </div>
                        )}
                      </div>
                      <Button 
                        onClick={() => {
                          setSelectedRole(role);
                          setShowAssignDialog(true);
                        }}
                        size="sm"
                        className="bg-teal-600 hover:bg-teal-700"
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Assign
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* User Access Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Access Management</CardTitle>
                <CardDescription>Manage user roles and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-teal-600" />
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="capitalize">
                          {user.role}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Permission Audit Logs</CardTitle>
                <CardDescription>Complete activity tracking for compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditLogs.slice(0, 50).map((log) => {
                    const EventIcon = getEventIcon(log.action);
                    const eventColor = getEventColor(log.action);
                    
                    return (
                      <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <EventIcon className={`h-5 w-5 ${eventColor}`} />
                          <div>
                            <div className="font-medium capitalize">{log.action.replace('_', ' ')}</div>
                            <div className="text-sm text-gray-500">
                              {log.reason && `${log.reason} • `}
                              {log.result !== undefined && (
                                <span className={log.result ? 'text-green-600' : 'text-red-600'}>
                                  {log.result ? 'Success' : 'Failed'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {log.ipAddress}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-6">
            {statistics && (
              <>
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-teal-600 mb-2">{statistics.totalPermissions}</div>
                      <div className="text-sm text-gray-600">Total Permissions</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {statistics.systemPermissions} system + {statistics.customPermissions} custom
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">{statistics.totalRoles}</div>
                      <div className="text-sm text-gray-600">Total Roles</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {statistics.systemRoles} system + {statistics.customRoles} custom
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">{statistics.statistics24h.permissionChecks}</div>
                      <div className="text-sm text-gray-600">Permission Checks (24h)</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">{statistics.statistics24h.permissionsGranted}</div>
                      <div className="text-sm text-gray-600">Permissions Granted (24h)</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Category Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Permission Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {statistics.categoryStats.map((category) => (
                        <div key={category.category} className="p-4 border rounded-lg">
                          <div className="font-medium">{category.category}</div>
                          <div className="text-2xl font-bold text-teal-600">{category.permissionCount}</div>
                          <div className="text-sm text-gray-500">permissions</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Role Usage */}
                <Card>
                  <CardHeader>
                    <CardTitle>Role Usage Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {statistics.roleUsage.map((role) => (
                        <div key={role.id} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center space-x-3">
                            {role.isSystem ? (
                              <Shield className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Crown className="h-5 w-5 text-purple-600" />
                            )}
                            <div>
                              <div className="font-medium">{role.name}</div>
                              <div className="text-sm text-gray-500">
                                {role.isSystem ? 'System Role' : 'Custom Role'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{role.permissionCount}</div>
                            <div className="text-sm text-gray-500">permissions</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Create Permission Dialog */}
        <Dialog open={showCreatePermissionDialog} onOpenChange={setShowCreatePermissionDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Custom Permission</DialogTitle>
              <DialogDescription>
                Define a new permission for granular access control
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="perm-name">Permission Name</Label>
                  <Input
                    id="perm-name"
                    value={newPermission.name}
                    onChange={(e) => setNewPermission(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="tasks.approve"
                    data-testid="input-permission-name"
                  />
                </div>
                <div>
                  <Label htmlFor="perm-category">Category</Label>
                  <Input
                    id="perm-category"
                    value={newPermission.category}
                    onChange={(e) => setNewPermission(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Task Management"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="perm-description">Description</Label>
                <Textarea
                  id="perm-description"
                  value={newPermission.description}
                  onChange={(e) => setNewPermission(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Approve or reject task submissions"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="perm-resource">Resource</Label>
                  <Input
                    id="perm-resource"
                    value={newPermission.resource}
                    onChange={(e) => setNewPermission(prev => ({ ...prev, resource: e.target.value }))}
                    placeholder="task"
                  />
                </div>
                <div>
                  <Label htmlFor="perm-action">Action</Label>
                  <Select value={newPermission.action} onValueChange={(value) => setNewPermission(prev => ({ ...prev, action: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="create">Create</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="delete">Delete</SelectItem>
                      <SelectItem value="approve">Approve</SelectItem>
                      <SelectItem value="manage">Manage</SelectItem>
                      <SelectItem value="export">Export</SelectItem>
                      <SelectItem value="import">Import</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setShowCreatePermissionDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreatePermission}
                  disabled={createPermissionMutation.isPending}
                  className="bg-teal-600 hover:bg-teal-700"
                  data-testid="button-create-permission"
                >
                  Create Permission
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Role Dialog */}
        <Dialog open={showCreateRoleDialog} onOpenChange={setShowCreateRoleDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Custom Role</DialogTitle>
              <DialogDescription>
                Define a new role with specific permissions
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role-name">Role Name</Label>
                  <Input
                    id="role-name"
                    value={newRole.name}
                    onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Project Coordinator"
                    data-testid="input-role-name"
                  />
                </div>
                <div>
                  <Label htmlFor="role-priority">Priority</Label>
                  <Input
                    id="role-priority"
                    type="number"
                    value={newRole.priority}
                    onChange={(e) => setNewRole(prev => ({ ...prev, priority: parseInt(e.target.value) || 500 }))}
                    placeholder="500"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="role-description">Description</Label>
                <Textarea
                  id="role-description"
                  value={newRole.description}
                  onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Coordinates project activities and manages team resources"
                  rows={2}
                />
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">Permissions</Label>
                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                  {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                    <div key={category} className="mb-6">
                      <h4 className="font-medium text-sm text-gray-700 mb-3">{category}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {categoryPermissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`perm-${permission.id}`}
                              checked={newRole.permissions.includes(permission.id)}
                              onCheckedChange={() => toggleRolePermission(permission.id)}
                            />
                            <Label htmlFor={`perm-${permission.id}`} className="text-sm">
                              {permission.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Selected: {newRole.permissions.length} permissions
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setShowCreateRoleDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateRole}
                  disabled={createRoleMutation.isPending}
                  className="bg-teal-600 hover:bg-teal-700"
                  data-testid="button-create-role"
                >
                  Create Role
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Assign Role Dialog */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Role: {selectedRole?.name}</DialogTitle>
              <DialogDescription>
                Select users to assign this role to
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {users.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-teal-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (selectedRole) {
                        assignRoleMutation.mutate({ userId: user.id, roleId: selectedRole.id });
                      }
                    }}
                    disabled={assignRoleMutation.isPending}
                  >
                    Assign
                  </Button>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}