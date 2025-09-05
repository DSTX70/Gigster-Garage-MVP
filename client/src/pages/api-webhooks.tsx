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
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Webhook, 
  Plus, 
  Settings, 
  Trash2, 
  Copy, 
  ExternalLink, 
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Globe,
  Code,
  Activity,
  Slack,
  MessageSquare,
  Mic,
  Mail,
  Bell,
  Eye,
  Edit,
  Play,
  Pause,
  BarChart3
} from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  secret?: string;
  events: string[];
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
  createdAt: string;
  updatedAt: string;
}

interface ExternalIntegration {
  id: string;
  type: string;
  name: string;
  config: {
    webhookUrl?: string;
    apiKey?: string;
    channelId?: string;
  };
  eventMappings: {
    event: string;
    template: string;
    enabled: boolean;
  }[];
  active: boolean;
  createdBy: string;
  createdAt: string;
}

interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  status: 'pending' | 'delivered' | 'failed' | 'cancelled';
  attempts: any[];
  createdAt: string;
  deliveredAt?: string;
}

const AVAILABLE_EVENTS = [
  { id: 'task.created', label: 'Task Created', category: 'Tasks' },
  { id: 'task.updated', label: 'Task Updated', category: 'Tasks' },
  { id: 'task.completed', label: 'Task Completed', category: 'Tasks' },
  { id: 'task.deleted', label: 'Task Deleted', category: 'Tasks' },
  { id: 'project.created', label: 'Project Created', category: 'Projects' },
  { id: 'project.updated', label: 'Project Updated', category: 'Projects' },
  { id: 'project.completed', label: 'Project Completed', category: 'Projects' },
  { id: 'invoice.created', label: 'Invoice Created', category: 'Finance' },
  { id: 'invoice.paid', label: 'Invoice Paid', category: 'Finance' },
  { id: 'invoice.overdue', label: 'Invoice Overdue', category: 'Finance' },
  { id: 'proposal.sent', label: 'Proposal Sent', category: 'Business' },
  { id: 'proposal.accepted', label: 'Proposal Accepted', category: 'Business' },
  { id: 'proposal.rejected', label: 'Proposal Rejected', category: 'Business' },
  { id: 'user.invited', label: 'User Invited', category: 'Team' },
  { id: 'user.joined', label: 'User Joined', category: 'Team' },
  { id: 'time.logged', label: 'Time Logged', category: 'Productivity' },
  { id: 'milestone.reached', label: 'Milestone Reached', category: 'Projects' },
  { id: 'deadline.approaching', label: 'Deadline Approaching', category: 'Alerts' },
  { id: 'report.generated', label: 'Report Generated', category: 'Analytics' }
];

const INTEGRATION_TYPES = [
  { 
    id: 'slack', 
    name: 'Slack', 
    icon: Slack, 
    color: 'bg-purple-500',
    description: 'Send notifications to Slack channels'
  },
  { 
    id: 'teams', 
    name: 'Microsoft Teams', 
    icon: MessageSquare, 
    color: 'bg-blue-500',
    description: 'Send notifications to Teams channels'
  },
  { 
    id: 'discord', 
    name: 'Discord', 
    icon: Mic, 
    color: 'bg-indigo-500',
    description: 'Send notifications to Discord channels'
  },
  { 
    id: 'zapier', 
    name: 'Zapier', 
    icon: Zap, 
    color: 'bg-orange-500',
    description: 'Trigger Zapier workflows'
  },
  { 
    id: 'custom', 
    name: 'Custom Webhook', 
    icon: Webhook, 
    color: 'bg-gray-500',
    description: 'Custom HTTP webhook endpoint'
  }
];

export default function APIWebhooksPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('webhooks');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showIntegrationDialog, setShowIntegrationDialog] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookConfig | null>(null);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);

  // Form states
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    secret: '',
    events: [] as string[],
    active: true,
    maxRetries: 3,
    initialDelay: 1000,
    backoffMultiplier: 2
  });

  const [newIntegration, setNewIntegration] = useState({
    type: '',
    name: '',
    webhookUrl: '',
    channelId: '',
    events: [] as string[]
  });

  const { data: webhooks = [] } = useQuery<WebhookConfig[]>({
    queryKey: ['/api/webhooks']
  });

  const { data: integrations = [] } = useQuery<ExternalIntegration[]>({
    queryKey: ['/api/integrations']
  });

  const { data: deliveries = [] } = useQuery<WebhookDelivery[]>({
    queryKey: ['/api/webhooks/deliveries']
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects']
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/users']
  });

  const createWebhookMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/webhooks', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks'] });
      setShowCreateDialog(false);
      setNewWebhook({
        name: '',
        url: '',
        secret: '',
        events: [],
        active: true,
        maxRetries: 3,
        initialDelay: 1000,
        backoffMultiplier: 2
      });
      toast({
        title: "Webhook Created",
        description: "Webhook has been created successfully",
      });
    }
  });

  const createIntegrationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/integrations', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      setShowIntegrationDialog(false);
      setNewIntegration({
        type: '',
        name: '',
        webhookUrl: '',
        channelId: '',
        events: []
      });
      toast({
        title: "Integration Created",
        description: "Integration has been created successfully",
      });
    }
  });

  const testWebhookMutation = useMutation({
    mutationFn: async (webhookId: string) => {
      const response = await apiRequest('POST', `/api/webhooks/${webhookId}/test`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Test Sent",
        description: "Test webhook has been sent successfully",
      });
    }
  });

  const toggleWebhookMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const response = await apiRequest('PATCH', `/api/webhooks/${id}`, { active });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks'] });
    }
  });

  const handleCreateWebhook = () => {
    if (!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createWebhookMutation.mutate({
      name: newWebhook.name,
      url: newWebhook.url,
      secret: newWebhook.secret || undefined,
      events: newWebhook.events,
      active: newWebhook.active,
      retryPolicy: {
        maxRetries: newWebhook.maxRetries,
        initialDelay: newWebhook.initialDelay,
        backoffMultiplier: newWebhook.backoffMultiplier
      }
    });
  };

  const handleCreateIntegration = () => {
    if (!newIntegration.type || !newIntegration.name || !newIntegration.webhookUrl) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createIntegrationMutation.mutate({
      type: newIntegration.type,
      name: newIntegration.name,
      config: {
        webhookUrl: newIntegration.webhookUrl,
        channelId: newIntegration.channelId || undefined
      },
      eventMappings: newIntegration.events.map(event => ({
        event,
        template: `{{event}} triggered: {{title || name}}`,
        enabled: true
      })),
      active: true
    });
  };

  const handleTestWebhook = (webhookId: string) => {
    setTestingWebhook(webhookId);
    testWebhookMutation.mutate(webhookId);
    setTimeout(() => setTestingWebhook(null), 2000);
  };

  const copyWebhookUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied",
      description: "Webhook URL copied to clipboard",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return CheckCircle;
      case 'failed': return AlertCircle;
      case 'pending': return Clock;
      default: return Activity;
    }
  };

  const eventsByCategory = AVAILABLE_EVENTS.reduce((acc, event) => {
    if (!acc[event.category]) acc[event.category] = [];
    acc[event.category].push(event);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_EVENTS>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-amber-50">
      <AppHeader />
      
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">API Webhooks & Integrations</h1>
            <p className="text-gray-600">Connect with external services and automate workflows</p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {webhooks.length} webhooks
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {integrations.length} integrations
            </Badge>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="deliveries">Delivery Log</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-6">
            <div className="grid gap-6">
              {webhooks.length === 0 ? (
                <Card className="p-12 text-center">
                  <Webhook className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Webhooks Yet</h3>
                  <p className="text-gray-500 mb-6">Create your first webhook to start receiving event notifications</p>
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Webhook
                  </Button>
                </Card>
              ) : (
                webhooks.map((webhook) => (
                  <Card key={webhook.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${webhook.active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <div>
                            <CardTitle className="text-lg">{webhook.name}</CardTitle>
                            <CardDescription className="flex items-center space-x-2">
                              <span>{webhook.url}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyWebhookUrl(webhook.url)}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={webhook.active}
                            onCheckedChange={(active) => 
                              toggleWebhookMutation.mutate({ id: webhook.id, active })
                            }
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestWebhook(webhook.id)}
                            disabled={testingWebhook === webhook.id}
                            data-testid={`button-test-webhook-${webhook.id}`}
                          >
                            {testingWebhook === webhook.id ? (
                              <Activity className="h-4 w-4 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
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
                          <Label className="text-sm text-gray-600">Events</Label>
                          <div className="text-sm font-medium">{webhook.events.length} subscribed</div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Retry Policy</Label>
                          <div className="text-sm font-medium">{webhook.retryPolicy.maxRetries} retries</div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Created</Label>
                          <div className="text-sm font-medium">
                            {new Date(webhook.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Status</Label>
                          <Badge variant={webhook.active ? "default" : "secondary"}>
                            {webhook.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Label className="text-sm text-gray-600 mb-2 block">Subscribed Events</Label>
                        <div className="flex flex-wrap gap-2">
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="grid gap-6">
              {/* Integration Templates */}
              <Card>
                <CardHeader>
                  <CardTitle>Popular Integrations</CardTitle>
                  <CardDescription>Quick setup for popular services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {INTEGRATION_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <Card 
                          key={type.id} 
                          className="p-4 cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-gray-200 hover:border-teal-300"
                          onClick={() => {
                            setNewIntegration(prev => ({ ...prev, type: type.id, name: type.name }));
                            setShowIntegrationDialog(true);
                          }}
                        >
                          <div className="text-center">
                            <div className={`w-12 h-12 mx-auto mb-3 rounded-lg ${type.color} flex items-center justify-center`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <h4 className="font-semibold text-sm mb-1">{type.name}</h4>
                            <p className="text-xs text-gray-500">{type.description}</p>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Active Integrations */}
              {integrations.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Active Integrations</h3>
                  {integrations.map((integration) => {
                    const integrationType = INTEGRATION_TYPES.find(t => t.id === integration.type);
                    const Icon = integrationType?.icon || Globe;
                    
                    return (
                      <Card key={integration.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-10 h-10 rounded-lg ${integrationType?.color || 'bg-gray-500'} flex items-center justify-center`}>
                                <Icon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{integration.name}</h4>
                                <p className="text-sm text-gray-500 capitalize">{integration.type} Integration</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={integration.active ? "default" : "secondary"}>
                                {integration.active ? "Active" : "Inactive"}
                              </Badge>
                              <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <Label className="text-gray-600">Events</Label>
                              <div className="font-medium">{integration.eventMappings.length} mapped</div>
                            </div>
                            <div>
                              <Label className="text-gray-600">Channel</Label>
                              <div className="font-medium">{integration.config.channelId || 'Default'}</div>
                            </div>
                            <div>
                              <Label className="text-gray-600">Created</Label>
                              <div className="font-medium">
                                {new Date(integration.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Delivery Log Tab */}
          <TabsContent value="deliveries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Deliveries</CardTitle>
                <CardDescription>Webhook delivery attempts and status</CardDescription>
              </CardHeader>
              <CardContent>
                {deliveries.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Deliveries Yet</h3>
                    <p className="text-gray-500">Webhook deliveries will appear here once events are triggered</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {deliveries.slice(0, 20).map((delivery) => {
                      const StatusIcon = getStatusIcon(delivery.status);
                      const webhook = webhooks.find(w => w.id === delivery.webhookId);
                      
                      return (
                        <div key={delivery.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className={`w-8 h-8 rounded-full ${getStatusColor(delivery.status)} flex items-center justify-center`}>
                              <StatusIcon className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium">{webhook?.name || 'Unknown Webhook'}</div>
                              <div className="text-sm text-gray-500">
                                {delivery.event} • {delivery.attempts.length} attempts
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={delivery.status === 'delivered' ? 'default' : 'secondary'}>
                              {delivery.status}
                            </Badge>
                            <div className="text-sm text-gray-500 mt-1">
                              {new Date(delivery.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-teal-600 mb-2">{deliveries.length}</div>
                  <div className="text-sm text-gray-600">Total Deliveries</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {deliveries.filter(d => d.status === 'delivered').length}
                  </div>
                  <div className="text-sm text-gray-600">Successful</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {deliveries.filter(d => d.status === 'failed').length}
                  </div>
                  <div className="text-sm text-gray-600">Failed</div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Delivery Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Detailed analytics coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Webhook Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Webhook</DialogTitle>
              <DialogDescription>
                Configure a webhook to receive event notifications
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="webhook-name">Name</Label>
                  <Input
                    id="webhook-name"
                    value={newWebhook.name}
                    onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Webhook"
                    data-testid="input-webhook-name"
                  />
                </div>
                <div>
                  <Label htmlFor="webhook-url">Endpoint URL</Label>
                  <Input
                    id="webhook-url"
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com/webhook"
                    data-testid="input-webhook-url"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="webhook-secret">Secret (Optional)</Label>
                <Input
                  id="webhook-secret"
                  type="password"
                  value={newWebhook.secret}
                  onChange={(e) => setNewWebhook(prev => ({ ...prev, secret: e.target.value }))}
                  placeholder="Webhook signing secret"
                />
              </div>

              {/* Events Selection */}
              <div>
                <Label className="text-base font-medium mb-3 block">Events to Subscribe</Label>
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {Object.entries(eventsByCategory).map(([category, events]) => (
                    <div key={category}>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">{category}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {events.map((event) => (
                          <div key={event.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={event.id}
                              checked={newWebhook.events.includes(event.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setNewWebhook(prev => ({
                                    ...prev,
                                    events: [...prev.events, event.id]
                                  }));
                                } else {
                                  setNewWebhook(prev => ({
                                    ...prev,
                                    events: prev.events.filter(e => e !== event.id)
                                  }));
                                }
                              }}
                            />
                            <Label htmlFor={event.id} className="text-sm">
                              {event.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Retry Policy */}
              <div>
                <Label className="text-base font-medium mb-3 block">Retry Policy</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="max-retries">Max Retries</Label>
                    <Input
                      id="max-retries"
                      type="number"
                      value={newWebhook.maxRetries}
                      onChange={(e) => setNewWebhook(prev => ({ ...prev, maxRetries: parseInt(e.target.value) }))}
                      min="0"
                      max="10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="initial-delay">Initial Delay (ms)</Label>
                    <Input
                      id="initial-delay"
                      type="number"
                      value={newWebhook.initialDelay}
                      onChange={(e) => setNewWebhook(prev => ({ ...prev, initialDelay: parseInt(e.target.value) }))}
                      min="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="backoff-multiplier">Backoff Multiplier</Label>
                    <Input
                      id="backoff-multiplier"
                      type="number"
                      value={newWebhook.backoffMultiplier}
                      onChange={(e) => setNewWebhook(prev => ({ ...prev, backoffMultiplier: parseFloat(e.target.value) }))}
                      min="1"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newWebhook.active}
                    onCheckedChange={(active) => setNewWebhook(prev => ({ ...prev, active }))}
                  />
                  <Label>Active</Label>
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateWebhook}
                    disabled={createWebhookMutation.isPending}
                    className="bg-teal-600 hover:bg-teal-700"
                    data-testid="button-create-webhook"
                  >
                    Create Webhook
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Integration Dialog */}
        <Dialog open={showIntegrationDialog} onOpenChange={setShowIntegrationDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create {newIntegration.type} Integration</DialogTitle>
              <DialogDescription>
                Connect with {newIntegration.type} to receive notifications
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="integration-name">Integration Name</Label>
                <Input
                  id="integration-name"
                  value={newIntegration.name}
                  onChange={(e) => setNewIntegration(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Integration"
                />
              </div>
              
              <div>
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  value={newIntegration.webhookUrl}
                  onChange={(e) => setNewIntegration(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  placeholder="https://hooks.slack.com/services/..."
                />
              </div>
              
              {newIntegration.type !== 'zapier' && (
                <div>
                  <Label htmlFor="channel-id">Channel ID (Optional)</Label>
                  <Input
                    id="channel-id"
                    value={newIntegration.channelId}
                    onChange={(e) => setNewIntegration(prev => ({ ...prev, channelId: e.target.value }))}
                    placeholder="#general"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setShowIntegrationDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateIntegration}
                  disabled={createIntegrationMutation.isPending}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  Create Integration
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}