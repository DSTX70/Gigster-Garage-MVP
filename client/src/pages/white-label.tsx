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
  Palette, 
  Plus, 
  Building, 
  Globe, 
  Edit, 
  Trash2, 
  Copy, 
  Eye,
  Upload,
  Download,
  Code,
  Monitor,
  Mail,
  Settings,
  Crown,
  Brush,
  Image,
  Link,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Zap,
  Users,
  Shield
} from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  settings: {
    branding: {
      primaryColor: string;
      secondaryColor: string;
      logoUrl?: string;
      faviconUrl?: string;
      companyName: string;
      tagline?: string;
      customCSS?: string;
      theme: 'light' | 'dark' | 'auto';
    };
    features: {
      sso: boolean;
      api: boolean;
      advancedReporting: boolean;
      whiteLabel: boolean;
      customDomains: boolean;
      auditLogs: boolean;
      multiUser: boolean;
    };
    limits: {
      users: number;
      projects: number;
      storage: number; // in GB
      apiCalls: number; // per month
    };
    email: {
      fromName: string;
      fromEmail: string;
      replyTo: string;
      customTemplates: boolean;
    };
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BrandingTemplate {
  id: string;
  name: string;
  description: string;
  preview: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string;
    theme: string;
  };
  category: string;
  customCSS: string;
}

interface DomainConfiguration {
  id: string;
  tenantId: string;
  domain: string;
  isVerified: boolean;
  sslEnabled: boolean;
  cname: string;
  verificationMethod: string;
  status: 'pending' | 'verified' | 'failed';
  createdAt: string;
}

export default function WhiteLabelPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('tenants');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const [newTenant, setNewTenant] = useState({
    name: '',
    subdomain: '',
    customDomain: '',
    primaryColor: '#004C6D',
    secondaryColor: '#0B1D3A',
    companyName: '',
    tagline: '',
    theme: 'light' as 'light' | 'dark' | 'auto'
  });

  const [cssEditor, setCSSEditor] = useState('');

  const { data: tenants = [] } = useQuery<Tenant[]>({
    queryKey: ['/api/white-label/tenants']
  });

  const { data: templates = [] } = useQuery<BrandingTemplate[]>({
    queryKey: ['/api/white-label/templates']
  });

  const { data: domains = [] } = useQuery<DomainConfiguration[]>({
    queryKey: ['/api/white-label/domains']
  });

  const createTenantMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/white-label/tenants', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/white-label/tenants'] });
      setShowCreateDialog(false);
      resetForm();
      toast({
        title: "Tenant Created",
        description: "White-label tenant has been created successfully",
      });
    }
  });

  const updateTenantMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest('PATCH', `/api/white-label/tenants/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/white-label/tenants'] });
      toast({
        title: "Tenant Updated",
        description: "Tenant configuration has been updated successfully",
      });
    }
  });

  const generateCSSMutation = useMutation({
    mutationFn: async (tenantId: string) => {
      const response = await apiRequest('POST', `/api/white-label/tenants/${tenantId}/generate-css`);
      return response.json();
    },
    onSuccess: (data) => {
      setCSSEditor(data.css);
      toast({
        title: "CSS Generated",
        description: "Custom CSS has been generated from branding settings",
      });
    }
  });

  const previewTenantMutation = useMutation({
    mutationFn: async (tenantId: string) => {
      const response = await apiRequest('POST', `/api/white-label/tenants/${tenantId}/preview`);
      return response.json();
    },
    onSuccess: (data) => {
      // Open preview in new tab
      window.open(data.previewUrl, '_blank');
    }
  });

  const handleCreateTenant = () => {
    if (!newTenant.name || !newTenant.subdomain || !newTenant.companyName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const tenantData = {
      name: newTenant.name,
      subdomain: newTenant.subdomain,
      customDomain: newTenant.customDomain || undefined,
      settings: {
        branding: {
          primaryColor: newTenant.primaryColor,
          secondaryColor: newTenant.secondaryColor,
          companyName: newTenant.companyName,
          tagline: newTenant.tagline || undefined,
          theme: newTenant.theme
        },
        features: {
          sso: true,
          api: true,
          advancedReporting: true,
          whiteLabel: true,
          customDomains: !!newTenant.customDomain,
          auditLogs: true,
          multiUser: true
        },
        limits: {
          users: 50,
          projects: 100,
          storage: 10,
          apiCalls: 10000
        },
        email: {
          fromName: newTenant.companyName,
          fromEmail: `noreply@${newTenant.subdomain}.gigstergarage.com`,
          replyTo: `support@${newTenant.subdomain}.gigstergarage.com`,
          customTemplates: true
        }
      }
    };

    createTenantMutation.mutate(tenantData);
  };

  const handleApplyTemplate = (template: BrandingTemplate) => {
    if (selectedTenant) {
      const updatedSettings = {
        ...selectedTenant.settings,
        branding: {
          ...selectedTenant.settings.branding,
          primaryColor: template.preview.primaryColor,
          secondaryColor: template.preview.secondaryColor,
          customCSS: template.customCSS,
          theme: template.preview.theme as 'light' | 'dark' | 'auto'
        }
      };

      updateTenantMutation.mutate({
        id: selectedTenant.id,
        data: { settings: updatedSettings }
      });
    }
    setShowTemplateDialog(false);
  };

  const resetForm = () => {
    setNewTenant({
      name: '',
      subdomain: '',
      customDomain: '',
      primaryColor: '#004C6D',
      secondaryColor: '#0B1D3A',
      companyName: '',
      tagline: '',
      theme: 'light'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-amber-50">
      <AppHeader />
      
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">White-label Management</h1>
            <p className="text-gray-600">Multi-tenant branding and customization platform</p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              {tenants.length} tenants
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {domains.filter(d => d.isVerified).length} domains
            </Badge>
            <Button 
              onClick={() => setShowTemplateDialog(true)}
              variant="outline"
            >
              <Brush className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Tenant
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="domains">Domains</TabsTrigger>
            <TabsTrigger value="css-editor">CSS Editor</TabsTrigger>
          </TabsList>

          {/* Tenants Tab */}
          <TabsContent value="tenants" className="space-y-6">
            <div className="grid gap-6">
              {tenants.length === 0 ? (
                <Card className="p-12 text-center">
                  <Building className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Tenants</h3>
                  <p className="text-gray-500 mb-6">Create your first white-label tenant to get started</p>
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Tenant
                  </Button>
                </Card>
              ) : (
                tenants.map((tenant) => (
                  <Card key={tenant.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: tenant.settings.branding.primaryColor }}
                          >
                            <Building className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{tenant.settings.branding.companyName}</CardTitle>
                            <CardDescription>
                              {tenant.subdomain}.gigstergarage.com
                              {tenant.customDomain && <span> • {tenant.customDomain}</span>}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => previewTenantMutation.mutate(tenant.id)}
                            data-testid={`button-preview-${tenant.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTenant(tenant)}
                            data-testid={`button-edit-${tenant.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Switch
                            checked={tenant.isActive}
                            onCheckedChange={(checked) => {
                              updateTenantMutation.mutate({
                                id: tenant.id,
                                data: { isActive: checked }
                              });
                            }}
                            data-testid={`switch-active-${tenant.id}`}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-sm text-gray-600">Theme</Label>
                          <div className="text-sm font-medium capitalize">
                            {tenant.settings.branding.theme}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Users Limit</Label>
                          <div className="text-sm font-medium">
                            {tenant.settings.limits.users}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Features</Label>
                          <div className="text-sm font-medium">
                            {Object.values(tenant.settings.features).filter(Boolean).length} enabled
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Status</Label>
                          <Badge variant={tenant.isActive ? "default" : "secondary"}>
                            {tenant.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Color Palette Preview */}
                      <div className="mt-4">
                        <Label className="text-sm text-gray-600 mb-2 block">Brand Colors</Label>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-8 h-8 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: tenant.settings.branding.primaryColor }}
                            title="Primary Color"
                          />
                          <div 
                            className="w-8 h-8 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: tenant.settings.branding.secondaryColor }}
                            title="Secondary Color"
                          />
                          <span className="text-sm text-gray-500 ml-2">
                            {tenant.settings.branding.primaryColor} • {tenant.settings.branding.secondaryColor}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-6">
            {selectedTenant ? (
              <Card>
                <CardHeader>
                  <CardTitle>Branding Configuration</CardTitle>
                  <CardDescription>
                    Customize the look and feel for {selectedTenant.settings.branding.companyName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Color Configuration */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={selectedTenant.settings.branding.primaryColor}
                          onChange={(e) => {
                            const updatedSettings = {
                              ...selectedTenant.settings,
                              branding: {
                                ...selectedTenant.settings.branding,
                                primaryColor: e.target.value
                              }
                            };
                            setSelectedTenant(prev => prev ? { ...prev, settings: updatedSettings } : null);
                          }}
                          className="w-16 h-10 rounded border"
                        />
                        <Input
                          value={selectedTenant.settings.branding.primaryColor}
                          onChange={(e) => {
                            const updatedSettings = {
                              ...selectedTenant.settings,
                              branding: {
                                ...selectedTenant.settings.branding,
                                primaryColor: e.target.value
                              }
                            };
                            setSelectedTenant(prev => prev ? { ...prev, settings: updatedSettings } : null);
                          }}
                          className="flex-1 font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={selectedTenant.settings.branding.secondaryColor}
                          onChange={(e) => {
                            const updatedSettings = {
                              ...selectedTenant.settings,
                              branding: {
                                ...selectedTenant.settings.branding,
                                secondaryColor: e.target.value
                              }
                            };
                            setSelectedTenant(prev => prev ? { ...prev, settings: updatedSettings } : null);
                          }}
                          className="w-16 h-10 rounded border"
                        />
                        <Input
                          value={selectedTenant.settings.branding.secondaryColor}
                          onChange={(e) => {
                            const updatedSettings = {
                              ...selectedTenant.settings,
                              branding: {
                                ...selectedTenant.settings.branding,
                                secondaryColor: e.target.value
                              }
                            };
                            setSelectedTenant(prev => prev ? { ...prev, settings: updatedSettings } : null);
                          }}
                          className="flex-1 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Theme Selection */}
                  <div>
                    <Label>Theme</Label>
                    <Select 
                      value={selectedTenant.settings.branding.theme} 
                      onValueChange={(value) => {
                        const updatedSettings = {
                          ...selectedTenant.settings,
                          branding: {
                            ...selectedTenant.settings.branding,
                            theme: value as 'light' | 'dark' | 'auto'
                          }
                        };
                        setSelectedTenant(prev => prev ? { ...prev, settings: updatedSettings } : null);
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Company Information */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={selectedTenant.settings.branding.companyName}
                        onChange={(e) => {
                          const updatedSettings = {
                            ...selectedTenant.settings,
                            branding: {
                              ...selectedTenant.settings.branding,
                              companyName: e.target.value
                            }
                          };
                          setSelectedTenant(prev => prev ? { ...prev, settings: updatedSettings } : null);
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tagline">Tagline</Label>
                      <Input
                        id="tagline"
                        value={selectedTenant.settings.branding.tagline || ''}
                        onChange={(e) => {
                          const updatedSettings = {
                            ...selectedTenant.settings,
                            branding: {
                              ...selectedTenant.settings.branding,
                              tagline: e.target.value
                            }
                          };
                          setSelectedTenant(prev => prev ? { ...prev, settings: updatedSettings } : null);
                        }}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3 pt-4">
                    <Button
                      onClick={() => {
                        updateTenantMutation.mutate({
                          id: selectedTenant.id,
                          data: { settings: selectedTenant.settings }
                        });
                      }}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => generateCSSMutation.mutate(selectedTenant.id)}
                    >
                      <Code className="h-4 w-4 mr-2" />
                      Generate CSS
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => previewTenantMutation.mutate(selectedTenant.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <Brush className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Tenant</h3>
                <p className="text-gray-500">Choose a tenant from the list to customize branding</p>
              </Card>
            )}
          </TabsContent>

          {/* Domains Tab */}
          <TabsContent value="domains" className="space-y-6">
            <div className="grid gap-4">
              {domains.map((domain) => (
                <Card key={domain.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Globe className="h-8 w-8 text-teal-600" />
                        <div>
                          <div className="font-medium text-lg">{domain.domain}</div>
                          <div className="text-sm text-gray-500">
                            CNAME: {domain.cname}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(domain.status)}
                        <Badge variant={domain.sslEnabled ? "default" : "secondary"}>
                          {domain.sslEnabled ? "SSL Enabled" : "SSL Disabled"}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* CSS Editor Tab */}
          <TabsContent value="css-editor" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced CSS Customization</CardTitle>
                <CardDescription>
                  Write custom CSS to fully control the appearance of your tenant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    value={cssEditor}
                    onChange={(e) => setCSSEditor(e.target.value)}
                    placeholder="/* Write your custom CSS here */\n.custom-header {\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n}\n\n.custom-button {\n  border-radius: 8px;\n  transition: all 0.3s ease;\n}"
                    className="font-mono text-sm min-h-[400px]"
                  />
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={() => {
                        if (selectedTenant) {
                          const updatedSettings = {
                            ...selectedTenant.settings,
                            branding: {
                              ...selectedTenant.settings.branding,
                              customCSS: cssEditor
                            }
                          };
                          updateTenantMutation.mutate({
                            id: selectedTenant.id,
                            data: { settings: updatedSettings }
                          });
                        }
                      }}
                      disabled={!selectedTenant}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Apply CSS
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (selectedTenant) {
                          generateCSSMutation.mutate(selectedTenant.id);
                        }
                      }}
                      disabled={!selectedTenant}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Auto Generate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Tenant Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Tenant</DialogTitle>
              <DialogDescription>
                Set up a new white-label tenant with custom branding
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Tenant Name *</Label>
                  <Input
                    id="name"
                    value={newTenant.name}
                    onChange={(e) => setNewTenant(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Acme Corp"
                    data-testid="input-tenant-name"
                  />
                </div>
                <div>
                  <Label htmlFor="subdomain">Subdomain *</Label>
                  <Input
                    id="subdomain"
                    value={newTenant.subdomain}
                    onChange={(e) => setNewTenant(prev => ({ ...prev, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                    placeholder="acme"
                    data-testid="input-subdomain"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Will create: {newTenant.subdomain || 'subdomain'}.gigstergarage.com
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
                <Input
                  id="customDomain"
                  value={newTenant.customDomain}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, customDomain: e.target.value }))}
                  placeholder="app.acmecorp.com"
                  data-testid="input-custom-domain"
                />
              </div>

              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={newTenant.companyName}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Acme Corporation"
                  data-testid="input-company-name"
                />
              </div>

              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={newTenant.tagline}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, tagline: e.target.value }))}
                  placeholder="Simplified Workflow Solutions"
                  data-testid="input-tagline"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      type="color"
                      value={newTenant.primaryColor}
                      onChange={(e) => setNewTenant(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-16 h-10 rounded border"
                    />
                    <Input
                      value={newTenant.primaryColor}
                      onChange={(e) => setNewTenant(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="flex-1 font-mono"
                      data-testid="input-primary-color"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      type="color"
                      value={newTenant.secondaryColor}
                      onChange={(e) => setNewTenant(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="w-16 h-10 rounded border"
                    />
                    <Input
                      value={newTenant.secondaryColor}
                      onChange={(e) => setNewTenant(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="flex-1 font-mono"
                      data-testid="input-secondary-color"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Theme</Label>
                <Select value={newTenant.theme} onValueChange={(value: 'light' | 'dark' | 'auto') => setNewTenant(prev => ({ ...prev, theme: value }))}>
                  <SelectTrigger className="mt-1" data-testid="select-theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTenant}
                disabled={createTenantMutation.isPending}
                className="bg-teal-600 hover:bg-teal-700"
                data-testid="button-create-tenant"
              >
                {createTenantMutation.isPending ? 'Creating...' : 'Create Tenant'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Branding Templates Dialog */}
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Branding Templates</DialogTitle>
              <DialogDescription>
                Choose from pre-designed templates to quickly set up your tenant branding
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6 py-4">
              {templates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">{template.name}</h3>
                      <Badge variant="secondary">{template.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                    
                    {/* Template Preview */}
                    <div className="mb-4 p-4 border rounded-lg" 
                         style={{ 
                           background: `linear-gradient(135deg, ${template.preview.primaryColor}20 0%, ${template.preview.secondaryColor}20 100%)` 
                         }}>
                      <div className="flex items-center space-x-2 mb-2">
                        <div 
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: template.preview.primaryColor }}
                        />
                        <div 
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: template.preview.secondaryColor }}
                        />
                        <span className="text-sm capitalize">{template.preview.theme}</span>
                      </div>
                      <div className="text-xs font-mono text-gray-600">
                        Primary: {template.preview.primaryColor}<br />
                        Secondary: {template.preview.secondaryColor}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleApplyTemplate(template)}
                      disabled={!selectedTenant}
                      className="w-full"
                      size="sm"
                    >
                      Apply Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}