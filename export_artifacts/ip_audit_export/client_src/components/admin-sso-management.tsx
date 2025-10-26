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
import { 
  Shield, 
  Plus, 
  Settings, 
  Users, 
  Key, 
  Globe, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oidc' | 'oauth2' | 'ldap';
  status: 'active' | 'inactive' | 'pending';
  domains: string[];
  userCount: number;
  lastSync: string;
  config: {
    issuer?: string;
    clientId?: string;
    domain?: string;
    metadataUrl?: string;
    loginUrl?: string;
    logoutUrl?: string;
    certificateFingerprint?: string;
  };
  settings: {
    autoProvisioning: boolean;
    defaultRole: string;
    syncGroups: boolean;
    enforceSSO: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

interface SSOSession {
  id: string;
  userId: string;
  userName: string;
  providerId: string;
  providerName: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
}

export function AdminSSOManagement() {
  const [selectedProvider, setSelectedProvider] = useState<SSOProvider | null>(null);
  const [showProviderDialog, setShowProviderDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState("providers");
  const { toast } = useToast();

  // Query SSO providers
  const { data: providers = [], isLoading: providersLoading } = useQuery<SSOProvider[]>({
    queryKey: ["/api/admin/sso/providers"],
  });

  // Query SSO sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<SSOSession[]>({
    queryKey: ["/api/admin/sso/sessions"],
  });

  // Query SSO audit logs
  const { data: auditLogs = [] } = useQuery({
    queryKey: ["/api/admin/sso/audit"],
  });

  // Create/Update provider mutation
  const updateProviderMutation = useMutation({
    mutationFn: (data: Partial<SSOProvider>) => 
      selectedProvider 
        ? apiRequest("PUT", `/api/admin/sso/providers/${selectedProvider.id}`, data)
        : apiRequest("POST", "/api/admin/sso/providers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sso/providers"] });
      setShowProviderDialog(false);
      setSelectedProvider(null);
      toast({
        title: "Provider saved successfully",
        description: "SSO provider configuration has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save SSO provider",
        variant: "destructive",
      });
    },
  });

  // Test provider connection
  const testProviderMutation = useMutation({
    mutationFn: (providerId: string) => apiRequest("POST", `/api/admin/sso/providers/${providerId}/test`),
    onSuccess: () => {
      toast({
        title: "Connection successful",
        description: "SSO provider connection test passed",
      });
    },
    onError: () => {
      toast({
        title: "Connection failed",
        description: "SSO provider connection test failed",
        variant: "destructive",
      });
    },
  });

  // Revoke session mutation
  const revokeSessionMutation = useMutation({
    mutationFn: (sessionId: string) => apiRequest("DELETE", `/api/admin/sso/sessions/${sessionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sso/sessions"] });
      toast({
        title: "Session revoked",
        description: "SSO session has been revoked successfully",
      });
    },
  });

  const getProviderStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProviderTypeIcon = (type: string) => {
    switch (type) {
      case 'saml': return <Shield className="h-4 w-4" />;
      case 'oidc': return <Key className="h-4 w-4" />;
      case 'oauth2': return <Globe className="h-4 w-4" />;
      case 'ldap': return <Users className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto" data-testid="admin-sso-management">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="mr-3" size={32} />
            SSO Management
          </h1>
          <p className="text-gray-600 mt-1">Manage Single Sign-On providers and sessions</p>
        </div>
        
        <Dialog open={showProviderDialog} onOpenChange={setShowProviderDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-provider">
              <Plus className="h-4 w-4 mr-2" />
              Add Provider
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedProvider ? 'Edit SSO Provider' : 'Add SSO Provider'}
              </DialogTitle>
            </DialogHeader>
            <SSOProviderForm 
              provider={selectedProvider}
              onSave={(data) => updateProviderMutation.mutate(data)}
              isLoading={updateProviderMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="providers" data-testid="tab-providers">Providers</TabsTrigger>
          <TabsTrigger value="sessions" data-testid="tab-sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="audit" data-testid="tab-audit">Audit Log</TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-6">
          {/* Providers Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total Providers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{providers.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Active Providers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {providers.filter(p => p.status === 'active').length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {providers.reduce((sum, p) => sum + p.userCount, 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Providers List */}
          <div className="space-y-4">
            {providersLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : providers.length === 0 ? (
              <Card className="p-8 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No SSO Providers</h3>
                <p className="text-gray-600 mb-4">Get started by adding your first SSO provider</p>
                <Button onClick={() => setShowProviderDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Provider
                </Button>
              </Card>
            ) : (
              providers.map((provider) => (
                <Card key={provider.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getProviderTypeIcon(provider.type)}
                        <div>
                          <h3 className="font-medium">{provider.name}</h3>
                          <p className="text-sm text-gray-600">
                            {provider.type.toUpperCase()} • {provider.domains.join(', ')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={getProviderStatusColor(provider.status)}>
                          {provider.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => testProviderMutation.mutate(provider.id)}
                          data-testid={`button-test-${provider.id}`}
                        >
                          Test Connection
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedProvider(provider);
                            setShowProviderDialog(true);
                          }}
                          data-testid={`button-edit-${provider.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Users:</span>
                        <p className="font-medium">{provider.userCount}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Auto Provisioning:</span>
                        <p className="font-medium">
                          {provider.settings.autoProvisioning ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Default Role:</span>
                        <p className="font-medium">{provider.settings.defaultRole}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Sync:</span>
                        <p className="font-medium">
                          {new Date(provider.lastSync).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Active SSO Sessions ({sessions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessionsLoading ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : sessions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No active SSO sessions</p>
                ) : (
                  sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">{session.userName}</p>
                            <p className="text-sm text-gray-600">{session.providerName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">IP: {session.ipAddress}</p>
                            <p className="text-sm text-gray-500">
                              Last Active: {new Date(session.lastActivity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          Expires: {new Date(session.expiresAt).toLocaleString()}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revokeSessionMutation.mutate(session.id)}
                          data-testid={`button-revoke-${session.id}`}
                        >
                          Revoke
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SSO Audit Log</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {auditLogs.map((log: any) => (
                    <div key={log.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className={`p-1 rounded ${
                        log.outcome === 'success' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {log.outcome === 'success' ? 
                          <CheckCircle className="h-4 w-4 text-green-600" /> : 
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        }
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-gray-600">{log.details.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleString()} • {log.actor.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global SSO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Session Timeout (minutes)</Label>
                  <Input type="number" defaultValue="480" className="mt-1" />
                </div>
                <div>
                  <Label>Max Concurrent Sessions</Label>
                  <Input type="number" defaultValue="5" className="mt-1" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enforce SSO for all users</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Allow local authentication fallback</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Log all SSO events</Label>
                  <Switch defaultChecked />
                </div>
              </div>

              <Button className="w-full" data-testid="button-save-settings">
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SSOProviderForm({ 
  provider, 
  onSave, 
  isLoading 
}: { 
  provider?: SSOProvider | null; 
  onSave: (data: any) => void; 
  isLoading: boolean; 
}) {
  const [formData, setFormData] = useState({
    name: provider?.name || '',
    type: provider?.type || 'saml',
    domains: provider?.domains.join(', ') || '',
    config: {
      issuer: provider?.config.issuer || '',
      clientId: provider?.config.clientId || '',
      metadataUrl: provider?.config.metadataUrl || '',
      ...provider?.config
    },
    settings: {
      autoProvisioning: provider?.settings.autoProvisioning ?? true,
      defaultRole: provider?.settings.defaultRole || 'user',
      syncGroups: provider?.settings.syncGroups ?? false,
      enforceSSO: provider?.settings.enforceSSO ?? false,
      ...provider?.settings
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      domains: formData.domains.split(',').map(d => d.trim()).filter(Boolean)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="sso-provider-form">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Provider Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Company SAML"
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Provider Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="saml">SAML 2.0</SelectItem>
              <SelectItem value="oidc">OpenID Connect</SelectItem>
              <SelectItem value="oauth2">OAuth 2.0</SelectItem>
              <SelectItem value="ldap">LDAP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="domains">Domains (comma-separated)</Label>
        <Input
          id="domains"
          value={formData.domains}
          onChange={(e) => setFormData(prev => ({ ...prev, domains: e.target.value }))}
          placeholder="example.com, company.org"
        />
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Configuration</h4>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="issuer">Issuer / Identity Provider URL</Label>
            <Input
              id="issuer"
              value={formData.config.issuer}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                config: { ...prev.config, issuer: e.target.value }
              }))}
              placeholder="https://identity.provider.com"
            />
          </div>
          <div>
            <Label htmlFor="clientId">Client ID</Label>
            <Input
              id="clientId"
              value={formData.config.clientId}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                config: { ...prev.config, clientId: e.target.value }
              }))}
              placeholder="your-client-id"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Settings</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Auto-provisioning</Label>
            <Switch
              checked={formData.settings.autoProvisioning}
              onCheckedChange={(checked) => setFormData(prev => ({
                ...prev,
                settings: { ...prev.settings, autoProvisioning: checked }
              }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Sync Groups</Label>
            <Switch
              checked={formData.settings.syncGroups}
              onCheckedChange={(checked) => setFormData(prev => ({
                ...prev,
                settings: { ...prev.settings, syncGroups: checked }
              }))}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isLoading} data-testid="button-save-provider">
          {isLoading ? 'Saving...' : 'Save Provider'}
        </Button>
      </div>
    </form>
  );
}