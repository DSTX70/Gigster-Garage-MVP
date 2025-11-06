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
import { 
  Shield, 
  Plus, 
  Settings, 
  Trash2, 
  Copy, 
  ExternalLink, 
  AlertCircle,
  CheckCircle,
  Clock,
  Key,
  Users,
  Activity,
  Eye,
  Edit,
  Download,
  Upload,
  FileText,
  BarChart3,
  Lock,
  Unlock,
  Globe
} from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oauth2' | 'oidc';
  protocol: string;
  configuration: {
    entryPoint?: string;
    issuer?: string;
    cert?: string;
    clientID?: string;
    clientSecret?: string;
    authorizationURL?: string;
    tokenURL?: string;
    callbackURL: string;
    attributeMapping: {
      email: string;
      firstName: string;
      lastName: string;
      groups?: string;
    };
  };
  domainRestrictions?: string[];
  autoProvision: boolean;
  defaultRole: string;
  groupMapping?: Record<string, string>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SSOTemplate {
  name: string;
  type: string;
  protocol: string;
  configuration: any;
  autoProvision: boolean;
  defaultRole: string;
}

interface SSOStatistics {
  totalProviders: number;
  activeProviders: number;
  activeSessions: number;
  statistics24h: {
    loginAttempts: number;
    loginSuccesses: number;
    loginFailures: number;
    logouts: number;
    provisioned: number;
  };
  statistics7d: {
    loginAttempts: number;
    loginSuccesses: number;
    loginFailures: number;
    logouts: number;
    provisioned: number;
  };
  providerStats: {
    id: string;
    name: string;
    type: string;
    loginCount: number;
  }[];
}

interface SSOAuditLog {
  id: string;
  event: string;
  userId?: string;
  providerId: string;
  ipAddress: string;
  userAgent: string;
  details: any;
  timestamp: string;
}

export default function SSOManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('providers');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<SSOProvider | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<SSOTemplate | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

  // Form states
  const [newProvider, setNewProvider] = useState({
    name: '',
    type: 'saml' as 'saml' | 'oauth2' | 'oidc',
    entryPoint: '',
    issuer: '',
    cert: '',
    clientID: '',
    clientSecret: '',
    authorizationURL: '',
    tokenURL: '',
    callbackURL: '',
    emailAttribute: 'email',
    firstNameAttribute: 'firstName',
    lastNameAttribute: 'lastName',
    groupsAttribute: '',
    domainRestrictions: '',
    autoProvision: true,
    defaultRole: 'user' as 'user' | 'admin' | 'manager',
    isActive: true
  });

  const { data: providers = [] } = useQuery<SSOProvider[]>({
    queryKey: ['/api/sso/providers']
  });

  const { data: templates = [] } = useQuery<SSOTemplate[]>({
    queryKey: ['/api/sso/templates']
  });

  const { data: statistics } = useQuery<SSOStatistics>({
    queryKey: ['/api/sso/statistics']
  });

  const { data: auditLogs = [] } = useQuery<SSOAuditLog[]>({
    queryKey: ['/api/sso/audit-logs']
  });

  const createProviderMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/sso/providers', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sso/providers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sso/statistics'] });
      setShowCreateDialog(false);
      resetForm();
      toast({
        title: "SSO Provider Created",
        description: "SSO provider has been created successfully",
      });
    }
  });

  const updateProviderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest('PATCH', `/api/sso/providers/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sso/providers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sso/statistics'] });
    }
  });

  const handleCreateProvider = () => {
    if (!newProvider.name || !newProvider.type) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const providerData = {
      name: newProvider.name,
      type: newProvider.type,
      protocol: newProvider.type === 'saml' ? 'SAML 2.0' : newProvider.type === 'oidc' ? 'OpenID Connect' : 'OAuth 2.0',
      configuration: {
        ...(newProvider.type === 'saml' && {
          entryPoint: newProvider.entryPoint,
          issuer: newProvider.issuer,
          cert: newProvider.cert
        }),
        ...(newProvider.type !== 'saml' && {
          clientID: newProvider.clientID,
          clientSecret: newProvider.clientSecret,
          authorizationURL: newProvider.authorizationURL,
          tokenURL: newProvider.tokenURL
        }),
        callbackURL: newProvider.callbackURL || `${window.location.origin}/sso/${newProvider.name.toLowerCase().replace(/\s+/g, '-')}/callback`,
        attributeMapping: {
          email: newProvider.emailAttribute,
          firstName: newProvider.firstNameAttribute,
          lastName: newProvider.lastNameAttribute,
          ...(newProvider.groupsAttribute && { groups: newProvider.groupsAttribute })
        }
      },
      domainRestrictions: newProvider.domainRestrictions ? newProvider.domainRestrictions.split(',').map(d => d.trim()) : undefined,
      autoProvision: newProvider.autoProvision,
      defaultRole: newProvider.defaultRole,
      isActive: newProvider.isActive
    };

    createProviderMutation.mutate(providerData);
  };

  const handleUseTemplate = (template: SSOTemplate) => {
    setNewProvider({
      ...newProvider,
      name: template.name,
      type: template.type as any,
      emailAttribute: template.configuration.attributeMapping.email,
      firstNameAttribute: template.configuration.attributeMapping.firstName,
      lastNameAttribute: template.configuration.attributeMapping.lastName,
      groupsAttribute: template.configuration.attributeMapping.groups || '',
      autoProvision: template.autoProvision,
      defaultRole: template.defaultRole as any
    });
    setShowTemplateDialog(false);
    setShowCreateDialog(true);
  };

  const toggleProvider = (provider: SSOProvider) => {
    updateProviderMutation.mutate({
      id: provider.id,
      data: { isActive: !provider.isActive }
    });
  };

  const copyCallbackURL = (provider: SSOProvider) => {
    navigator.clipboard.writeText(provider.configuration.callbackURL);
    toast({
      title: "Copied",
      description: "Callback URL copied to clipboard",
    });
  };

  const resetForm = () => {
    setNewProvider({
      name: '',
      type: 'saml',
      entryPoint: '',
      issuer: '',
      cert: '',
      clientID: '',
      clientSecret: '',
      authorizationURL: '',
      tokenURL: '',
      callbackURL: '',
      emailAttribute: 'email',
      firstNameAttribute: 'firstName',
      lastNameAttribute: 'lastName',
      groupsAttribute: '',
      domainRestrictions: '',
      autoProvision: true,
      defaultRole: 'user',
      isActive: true
    });
  };

  const getProtocolIcon = (type: string) => {
    switch (type) {
      case 'saml': return Shield;
      case 'oauth2': return Key;
      case 'oidc': return Globe;
      default: return Lock;
    }
  };

  const getEventIcon = (event: string) => {
    switch (event) {
      case 'login_success': return CheckCircle;
      case 'login_failure': return AlertCircle;
      case 'logout': return Unlock;
      case 'provision_user': return Users;
      default: return Activity;
    }
  };

  const getEventColor = (event: string) => {
    switch (event) {
      case 'login_success': return 'text-green-600';
      case 'login_failure': return 'text-red-600';
      case 'logout': return 'text-blue-600';
      case 'provision_user': return 'text-purple-600';
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Single Sign-On (SSO)</h1>
            <p className="text-gray-600">Enterprise authentication and identity management</p>
          </div>
          <div className="flex items-center space-x-3">
            {statistics && (
              <>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {statistics.activeProviders} active
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {statistics.activeSessions} sessions
                </Badge>
              </>
            )}
            <Button 
              onClick={() => setShowTemplateDialog(true)}
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Provider
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Providers Tab */}
          <TabsContent value="providers" className="space-y-6">
            <div className="grid gap-6">
              {providers.length === 0 ? (
                <Card className="p-12 text-center">
                  <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No SSO Providers</h3>
                  <p className="text-gray-500 mb-6">Configure enterprise SSO providers for seamless authentication</p>
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add SSO Provider
                  </Button>
                </Card>
              ) : (
                providers.map((provider) => {
                  const ProtocolIcon = getProtocolIcon(provider.type);
                  return (
                    <Card key={provider.id} className="overflow-hidden">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center`}>
                              <ProtocolIcon className="h-5 w-5 text-teal-600" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{provider.name}</CardTitle>
                              <CardDescription className="flex items-center space-x-2">
                                <span>{provider.protocol}</span>
                                <Badge variant="outline" className="text-xs">
                                  {provider.type.toUpperCase()}
                                </Badge>
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={provider.isActive}
                              onCheckedChange={() => toggleProvider(provider)}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyCallbackURL(provider)}
                              data-testid={`button-copy-callback-${provider.id}`}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-sm text-gray-600">Auto Provision</Label>
                            <div className="text-sm font-medium">
                              {provider.autoProvision ? 'Enabled' : 'Disabled'}
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm text-gray-600">Default Role</Label>
                            <div className="text-sm font-medium capitalize">{provider.defaultRole}</div>
                          </div>
                          <div>
                            <Label className="text-sm text-gray-600">Domain Restrictions</Label>
                            <div className="text-sm font-medium">
                              {provider.domainRestrictions?.length ? 
                                `${provider.domainRestrictions.length} domains` : 'None'
                              }
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm text-gray-600">Status</Label>
                            <Badge variant={provider.isActive ? "default" : "secondary"}>
                              {provider.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <Label className="text-sm text-gray-600 mb-2 block">Callback URL</Label>
                          <div className="bg-gray-50 p-2 rounded text-sm font-mono text-gray-700">
                            {provider.configuration.callbackURL}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-6">
            {statistics && (
              <>
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-teal-600 mb-2">{statistics.totalProviders}</div>
                      <div className="text-sm text-gray-600">Total Providers</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">{statistics.activeProviders}</div>
                      <div className="text-sm text-gray-600">Active Providers</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">{statistics.activeSessions}</div>
                      <div className="text-sm text-gray-600">Active Sessions</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {Math.round((statistics.statistics24h.loginSuccesses / 
                          Math.max(statistics.statistics24h.loginAttempts, 1)) * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">Success Rate (24h)</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 24 Hour Statistics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Last 24 Hours</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>Login Attempts</span>
                        <span className="font-medium">{statistics.statistics24h.loginAttempts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Successful Logins</span>
                        <span className="font-medium text-green-600">{statistics.statistics24h.loginSuccesses}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Failed Logins</span>
                        <span className="font-medium text-red-600">{statistics.statistics24h.loginFailures}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Logouts</span>
                        <span className="font-medium">{statistics.statistics24h.logouts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Users Provisioned</span>
                        <span className="font-medium text-purple-600">{statistics.statistics24h.provisioned}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 7 Day Statistics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Last 7 Days</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>Login Attempts</span>
                        <span className="font-medium">{statistics.statistics7d.loginAttempts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Successful Logins</span>
                        <span className="font-medium text-green-600">{statistics.statistics7d.loginSuccesses}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Failed Logins</span>
                        <span className="font-medium text-red-600">{statistics.statistics7d.loginFailures}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Logouts</span>
                        <span className="font-medium">{statistics.statistics7d.logouts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Users Provisioned</span>
                        <span className="font-medium text-purple-600">{statistics.statistics7d.provisioned}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Provider Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Provider Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {statistics.providerStats.map((provider) => (
                        <div key={provider.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <div className="font-medium">{provider.name}</div>
                            <div className="text-sm text-gray-500">{provider.type.toUpperCase()}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{provider.loginCount}</div>
                            <div className="text-sm text-gray-500">logins</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Audit Logs</CardTitle>
                <CardDescription>Complete activity tracking for compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditLogs.slice(0, 50).map((log) => {
                    const EventIcon = getEventIcon(log.event);
                    const eventColor = getEventColor(log.event);
                    
                    return (
                      <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <EventIcon className={`h-5 w-5 ${eventColor}`} />
                          <div>
                            <div className="font-medium capitalize">{log.event.replace('_', ' ')}</div>
                            <div className="text-sm text-gray-500">
                              Provider: {providers.find(p => p.id === log.providerId)?.name || 'Unknown'}
                              {log.details.email && ` • ${log.details.email}`}
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

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SSO Configuration</CardTitle>
                <CardDescription>Global SSO settings and security policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-medium mb-3 block">Session Settings</Label>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
                        <Input 
                          id="session-timeout" 
                          type="number" 
                          defaultValue="8" 
                          className="w-20"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="max-sessions">Max Sessions per User</Label>
                        <Input 
                          id="max-sessions" 
                          type="number" 
                          defaultValue="3" 
                          className="w-20"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-base font-medium mb-3 block">Security Settings</Label>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="require-mfa">Require MFA for SSO</Label>
                        <Switch id="require-mfa" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="audit-all">Audit All Events</Label>
                        <Switch id="audit-all" defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium mb-3 block">SAML Service Provider Metadata</Label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Metadata URL</span>
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <div className="text-sm font-mono text-gray-800">
                      {window.location.origin}/sso/saml/metadata
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Provider Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create SSO Provider</DialogTitle>
              <DialogDescription>
                Configure a new SSO provider for enterprise authentication
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="provider-name">Provider Name</Label>
                  <Input
                    id="provider-name"
                    value={newProvider.name}
                    onChange={(e) => setNewProvider(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Company SSO"
                    data-testid="input-provider-name"
                  />
                </div>
                <div>
                  <Label htmlFor="provider-type">Protocol Type</Label>
                  <Select 
                    value={newProvider.type} 
                    onValueChange={(value: any) => setNewProvider(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saml">SAML 2.0</SelectItem>
                      <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                      <SelectItem value="oidc">OpenID Connect</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Protocol-specific configuration */}
              {newProvider.type === 'saml' && (
                <div className="space-y-4">
                  <h4 className="font-medium">SAML Configuration</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="entry-point">Entry Point URL</Label>
                      <Input
                        id="entry-point"
                        value={newProvider.entryPoint}
                        onChange={(e) => setNewProvider(prev => ({ ...prev, entryPoint: e.target.value }))}
                        placeholder="https://idp.company.com/sso"
                      />
                    </div>
                    <div>
                      <Label htmlFor="issuer">Issuer</Label>
                      <Input
                        id="issuer"
                        value={newProvider.issuer}
                        onChange={(e) => setNewProvider(prev => ({ ...prev, issuer: e.target.value }))}
                        placeholder="https://idp.company.com"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="certificate">X.509 Certificate</Label>
                    <Textarea
                      id="certificate"
                      value={newProvider.cert}
                      onChange={(e) => setNewProvider(prev => ({ ...prev, cert: e.target.value }))}
                      placeholder="-----BEGIN CERTIFICATE-----..."
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {(newProvider.type === 'oauth2' || newProvider.type === 'oidc') && (
                <div className="space-y-4">
                  <h4 className="font-medium">OAuth Configuration</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="client-id">Client ID</Label>
                      <Input
                        id="client-id"
                        value={newProvider.clientID}
                        onChange={(e) => setNewProvider(prev => ({ ...prev, clientID: e.target.value }))}
                        placeholder="your-client-id"
                      />
                    </div>
                    <div>
                      <Label htmlFor="client-secret">Client Secret</Label>
                      <Input
                        id="client-secret"
                        type="password"
                        value={newProvider.clientSecret}
                        onChange={(e) => setNewProvider(prev => ({ ...prev, clientSecret: e.target.value }))}
                        placeholder="your-client-secret"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="auth-url">Authorization URL</Label>
                      <Input
                        id="auth-url"
                        value={newProvider.authorizationURL}
                        onChange={(e) => setNewProvider(prev => ({ ...prev, authorizationURL: e.target.value }))}
                        placeholder="https://provider.com/oauth/authorize"
                      />
                    </div>
                    <div>
                      <Label htmlFor="token-url">Token URL</Label>
                      <Input
                        id="token-url"
                        value={newProvider.tokenURL}
                        onChange={(e) => setNewProvider(prev => ({ ...prev, tokenURL: e.target.value }))}
                        placeholder="https://provider.com/oauth/token"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Attribute Mapping */}
              <div className="space-y-4">
                <h4 className="font-medium">Attribute Mapping</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email-attr">Email Attribute</Label>
                    <Input
                      id="email-attr"
                      value={newProvider.emailAttribute}
                      onChange={(e) => setNewProvider(prev => ({ ...prev, emailAttribute: e.target.value }))}
                      placeholder="email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="firstname-attr">First Name Attribute</Label>
                    <Input
                      id="firstname-attr"
                      value={newProvider.firstNameAttribute}
                      onChange={(e) => setNewProvider(prev => ({ ...prev, firstNameAttribute: e.target.value }))}
                      placeholder="firstName"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lastname-attr">Last Name Attribute</Label>
                    <Input
                      id="lastname-attr"
                      value={newProvider.lastNameAttribute}
                      onChange={(e) => setNewProvider(prev => ({ ...prev, lastNameAttribute: e.target.value }))}
                      placeholder="lastName"
                    />
                  </div>
                  <div>
                    <Label htmlFor="groups-attr">Groups Attribute (Optional)</Label>
                    <Input
                      id="groups-attr"
                      value={newProvider.groupsAttribute}
                      onChange={(e) => setNewProvider(prev => ({ ...prev, groupsAttribute: e.target.value }))}
                      placeholder="groups"
                    />
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Provider Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="domain-restrictions">Domain Restrictions (comma-separated)</Label>
                    <Input
                      id="domain-restrictions"
                      value={newProvider.domainRestrictions}
                      onChange={(e) => setNewProvider(prev => ({ ...prev, domainRestrictions: e.target.value }))}
                      placeholder="company.com, subsidiary.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="default-role">Default Role</Label>
                    <Select 
                      value={newProvider.defaultRole} 
                      onValueChange={(value: any) => setNewProvider(prev => ({ ...prev, defaultRole: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newProvider.autoProvision}
                        onCheckedChange={(checked) => setNewProvider(prev => ({ ...prev, autoProvision: checked }))}
                      />
                      <Label>Auto-provision new users</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newProvider.isActive}
                        onCheckedChange={(checked) => setNewProvider(prev => ({ ...prev, isActive: checked }))}
                      />
                      <Label>Active</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateProvider}
                  disabled={createProviderMutation.isPending}
                  className="bg-teal-600 hover:bg-teal-700"
                  data-testid="button-create-provider"
                >
                  Create Provider
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Template Selection Dialog */}
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Choose SSO Template</DialogTitle>
              <DialogDescription>
                Start with a pre-configured template for common enterprise providers
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template, index) => (
                <Card 
                  key={index}
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-gray-200 hover:border-teal-300"
                  onClick={() => handleUseTemplate(template)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-teal-100 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-teal-600" />
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{template.name}</h4>
                    <p className="text-xs text-gray-500 mb-2">{template.protocol}</p>
                    <Badge variant="outline" className="text-xs">
                      {template.type.toUpperCase()}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}