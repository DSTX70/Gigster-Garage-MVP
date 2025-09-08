import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Shield, 
  Plus, 
  Users, 
  Key, 
  Edit, 
  Trash2,
  UserCheck,
  Lock,
  Unlock,
  Settings,
  Search,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

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
  isSystem: boolean;
  permissions: Permission[];
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

interface UserPermission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  roleId?: string;
  roleName?: string;
  permissions: Permission[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function AdminPermissionsManagement() {
  const [selectedTab, setSelectedTab] = useState("roles");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Query permissions
  const { data: permissions = [] } = useQuery<Permission[]>({
    queryKey: ["/api/admin/permissions"],
  });

  // Query roles
  const { data: roles = [], isLoading: rolesLoading } = useQuery<Role[]>({
    queryKey: ["/api/admin/roles"],
  });

  // Query user permissions
  const { data: userPermissions = [], isLoading: userPermissionsLoading } = useQuery<UserPermission[]>({
    queryKey: ["/api/admin/user-permissions"],
  });

  // Create/Update role mutation
  const saveRoleMutation = useMutation({
    mutationFn: (data: Partial<Role>) => 
      selectedRole 
        ? apiRequest("PUT", `/api/admin/roles/${selectedRole.id}`, data)
        : apiRequest("POST", "/api/admin/roles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      setShowRoleDialog(false);
      setSelectedRole(null);
      toast({
        title: "Role saved successfully",
        description: "Permission role has been updated.",
      });
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: (roleId: string) => apiRequest("DELETE", `/api/admin/roles/${roleId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      toast({
        title: "Role deleted",
        description: "Permission role has been deleted successfully.",
      });
    },
  });

  // Update user permissions mutation
  const updateUserPermissionsMutation = useMutation({
    mutationFn: (data: { userId: string; roleId?: string; permissions: string[] }) => 
      apiRequest("PUT", `/api/admin/user-permissions/${data.userId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-permissions"] });
      setShowUserDialog(false);
      toast({
        title: "User permissions updated",
        description: "User permissions have been updated successfully.",
      });
    },
  });

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUserPermissions = userPermissions.filter(up =>
    up.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    up.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (up.roleName && up.roleName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const permissionsByCategory = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="p-6 max-w-7xl mx-auto" data-testid="admin-permissions-management">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="mr-3" size={32} />
            Permissions Management
          </h1>
          <p className="text-gray-600 mt-1">Manage roles, permissions, and user access</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search roles, users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
              data-testid="search-permissions"
            />
          </div>
          
          <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-role">
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedRole ? 'Edit Role' : 'Create New Role'}
                </DialogTitle>
              </DialogHeader>
              <RoleForm 
                role={selectedRole}
                permissions={permissions}
                onSave={(data) => saveRoleMutation.mutate(data)}
                isLoading={saveRoleMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="roles" data-testid="tab-roles">Roles</TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">User Permissions</TabsTrigger>
          <TabsTrigger value="permissions" data-testid="tab-permissions">All Permissions</TabsTrigger>
          <TabsTrigger value="audit" data-testid="tab-audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          {/* Roles Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total Roles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roles.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">System Roles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {roles.filter(r => r.isSystem).length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total Users Assigned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {roles.reduce((sum, r) => sum + r.userCount, 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Roles List */}
          <div className="space-y-4">
            {rolesLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredRoles.length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No roles found</h3>
                <p className="text-gray-600 mb-4">Create your first role to get started</p>
                <Button onClick={() => setShowRoleDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
              </Card>
            ) : (
              filteredRoles.map((role) => (
                <Card key={role.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          {role.isSystem ? <Lock className="h-4 w-4 text-blue-600" /> : <Unlock className="h-4 w-4 text-blue-600" />}
                        </div>
                        <div>
                          <h3 className="font-medium">{role.name}</h3>
                          <p className="text-sm text-gray-600">{role.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant={role.isSystem ? "secondary" : "default"}>
                          {role.isSystem ? "System" : "Custom"}
                        </Badge>
                        <Badge variant="outline">{role.userCount} users</Badge>
                        <Badge variant="outline">{role.permissions.length} permissions</Badge>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRole(role);
                            setShowRoleDialog(true);
                          }}
                          data-testid={`button-edit-role-${role.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        {!role.isSystem && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteRoleMutation.mutate(role.id)}
                            data-testid={`button-delete-role-${role.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Permissions ({role.permissions.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.slice(0, 5).map((permission) => (
                          <Badge key={permission.id} variant="outline" className="text-xs">
                            {permission.name}
                          </Badge>
                        ))}
                        {role.permissions.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{role.permissions.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-2" />
                  User Permissions ({filteredUserPermissions.length})
                </CardTitle>
                
                <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" data-testid="button-assign-permissions">
                      <Plus className="h-4 w-4 mr-2" />
                      Assign Permissions
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Assign User Permissions</DialogTitle>
                    </DialogHeader>
                    <UserPermissionForm 
                      roles={roles}
                      permissions={permissions}
                      onSave={(data) => updateUserPermissionsMutation.mutate(data)}
                      isLoading={updateUserPermissionsMutation.isPending}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {userPermissionsLoading ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredUserPermissions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No user permissions configured</p>
                ) : (
                  filteredUserPermissions.map((userPerm) => (
                    <div key={userPerm.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="font-medium text-blue-600">
                            {userPerm.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{userPerm.userName}</p>
                          <p className="text-sm text-gray-600">{userPerm.userEmail}</p>
                          {userPerm.roleName && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {userPerm.roleName}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {userPerm.permissions.length} permissions
                        </Badge>
                        <Switch 
                          checked={userPerm.isActive}
                          onCheckedChange={(checked) => {
                            updateUserPermissionsMutation.mutate({
                              userId: userPerm.userId,
                              roleId: userPerm.roleId,
                              permissions: userPerm.permissions.map(p => p.id)
                            });
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`button-edit-user-${userPerm.userId}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All System Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-6">
                  {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                    <div key={category}>
                      <h4 className="font-medium mb-3 text-lg">{category}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {categoryPermissions.map((permission) => (
                          <Card key={permission.id} className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{permission.name}</p>
                                <p className="text-xs text-gray-600 mt-1">{permission.description}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {permission.resource}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {permission.action}
                                  </Badge>
                                </div>
                              </div>
                              {permission.isSystem && (
                                <Badge variant="secondary" className="text-xs ml-2">
                                  System
                                </Badge>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Permission Changes Audit Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Audit log integration would be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RoleForm({ 
  role, 
  permissions,
  onSave, 
  isLoading 
}: { 
  role?: Role | null; 
  permissions: Permission[];
  onSave: (data: any) => void; 
  isLoading: boolean; 
}) {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
    permissions: role?.permissions.map(p => p.id) || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const permissionsByCategory = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="role-form">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Role Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Project Manager"
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Role description"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Permissions ({formData.permissions.length} selected)</h4>
        <ScrollArea className="h-64 border rounded p-4">
          <div className="space-y-4">
            {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
              <div key={category}>
                <h5 className="font-medium mb-2">{category}</h5>
                <div className="space-y-2 pl-4">
                  {categoryPermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission.id}
                        checked={formData.permissions.includes(permission.id)}
                        onCheckedChange={() => togglePermission(permission.id)}
                      />
                      <Label htmlFor={permission.id} className="text-sm">
                        {permission.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} data-testid="button-save-role">
          {isLoading ? 'Saving...' : 'Save Role'}
        </Button>
      </div>
    </form>
  );
}

function UserPermissionForm({ 
  roles,
  permissions,
  onSave, 
  isLoading 
}: { 
  roles: Role[];
  permissions: Permission[];
  onSave: (data: any) => void; 
  isLoading: boolean; 
}) {
  const [formData, setFormData] = useState({
    userId: '',
    roleId: '',
    permissions: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="user-permission-form">
      <div>
        <Label htmlFor="userId">User ID</Label>
        <Input
          id="userId"
          value={formData.userId}
          onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
          placeholder="Enter user ID"
          required
        />
      </div>

      <div>
        <Label htmlFor="roleId">Role</Label>
        <Select value={formData.roleId} onValueChange={(value) => setFormData(prev => ({ ...prev, roleId: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} data-testid="button-assign-permissions">
          {isLoading ? 'Assigning...' : 'Assign Permissions'}
        </Button>
      </div>
    </form>
  );
}