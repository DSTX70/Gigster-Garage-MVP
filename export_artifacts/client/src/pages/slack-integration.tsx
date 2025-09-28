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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MessageSquare, 
  Plus, 
  Settings, 
  Eye, 
  Trash2, 
  Copy, 
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  ArrowRight,
  Filter,
  Search,
  Download,
  Upload,
  Zap,
  Globe,
  Shield,
  Hash,
  Bell,
  Send,
  RefreshCw,
  ExternalLink,
  FileText,
  AlertTriangle,
  Play,
  Pause,
  Edit
} from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';

interface SlackIntegration {
  id: string;
  name: string;
  workspaceName: string;
  webhookUrl: string;
  channels: {
    id: string;
    name: string;
    description?: string;
    isPrivate: boolean;
  }[];
  defaultChannel: string;
  botToken?: string;
  isActive: boolean;
  eventMappings: {
    event: string;
    channel: string;
    template: string;
    enabled: boolean;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }[];
  statistics: {
    totalSent: number;
    successRate: number;
    lastSent?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface SlackNotification {
  id: string;
  integrationId: string;
  channel: string;
  event: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
  sentAt?: string;
  error?: string;
  metadata: any;
}

interface EventTemplate {
  event: string;
  label: string;
  category: string;
  defaultTemplate: string;
  variables: string[];
}

const AVAILABLE_EVENTS: EventTemplate[] = [
  {
    event: 'task.created',
    label: 'Task Created',
    category: 'Tasks',
    defaultTemplate: '📝 New task created: {{title}} assigned to {{assignee}}',
    variables: ['title', 'assignee', 'priority', 'project']
  },
  {
    event: 'task.completed',
    label: 'Task Completed',
    category: 'Tasks',
    defaultTemplate: '✅ Task completed: {{title}} by {{completedBy}}',
    variables: ['title', 'completedBy', 'duration', 'project']
  },
  {
    event: 'project.created',
    label: 'Project Created',
    category: 'Projects',
    defaultTemplate: '🚀 New project started: {{name}} with {{teamSize}} team members',
    variables: ['name', 'teamSize', 'deadline', 'owner']
  },
  {
    event: 'invoice.paid',
    label: 'Invoice Paid',
    category: 'Finance',
    defaultTemplate: '💰 Invoice paid: {{invoiceNumber}} for ${{amount}}',
    variables: ['invoiceNumber', 'amount', 'client', 'paymentMethod']
  },
  {
    event: 'proposal.accepted',
    label: 'Proposal Accepted',
    category: 'Business',
    defaultTemplate: '🎉 Proposal accepted: {{title}} worth ${{value}}',
    variables: ['title', 'value', 'client', 'acceptedBy']
  },
  {
    event: 'user.joined',
    label: 'User Joined',
    category: 'Team',
    defaultTemplate: '👋 {{name}} joined the team as {{role}}',
    variables: ['name', 'role', 'department', 'startDate']
  },
  {
    event: 'deadline.approaching',
    label: 'Deadline Approaching',
    category: 'Alerts',
    defaultTemplate: '⚠️ Deadline approaching: {{title}} due in {{daysRemaining}} days',
    variables: ['title', 'daysRemaining', 'assignee', 'priority']
  },
  {
    event: 'milestone.reached',
    label: 'Milestone Reached',
    category: 'Projects',
    defaultTemplate: '🏆 Milestone achieved: {{milestone}} for {{project}}',
    variables: ['milestone', 'project', 'progress', 'team']
  }
];

export default function SlackIntegrationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('integrations');
  const [showIntegrationDialog, setShowIntegrationDialog] = useState(false);
  const [showChannelDialog, setShowChannelDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<SlackIntegration | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EventTemplate | null>(null);
  
  const [newIntegration, setNewIntegration] = useState({
    name: '',
    workspaceName: '',
    webhookUrl: '',
    defaultChannel: '#general',
    botToken: ''
  });

  const [newChannel, setNewChannel] = useState({
    name: '',
    description: '',
    isPrivate: false
  });

  const [testNotification, setTestNotification] = useState({
    event: 'task.created',
    channel: '#general',
    template: '📝 Test notification from Gigster Garage',
    data: {
      title: 'Test Task',
      assignee: 'John Doe',
      priority: 'high'
    }
  });

  const { data: integrations = [] } = useQuery<SlackIntegration[]>({
    queryKey: ['/api/slack/integrations']
  });

  const { data: notifications = [] } = useQuery<SlackNotification[]>({
    queryKey: ['/api/slack/notifications'],
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  const { data: statistics } = useQuery({
    queryKey: ['/api/slack/statistics']
  });

  const createIntegrationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/slack/integrations', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/slack/integrations'] });
      setShowIntegrationDialog(false);
      resetIntegrationForm();
      toast({
        title: "Slack Integration Created",
        description: "Integration has been configured successfully",
      });
    }
  });

  const updateIntegrationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest('PATCH', `/api/slack/integrations/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/slack/integrations'] });
    }
  });

  const testIntegrationMutation = useMutation({
    mutationFn: async ({ integrationId, data }: { integrationId: string; data: any }) => {
      const response = await apiRequest('POST', `/api/slack/integrations/${integrationId}/test`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Test Message Sent",
        description: "Test notification has been sent to Slack successfully",
      });
    },
    onError: () => {
      toast({
        title: "Test Failed",
        description: "Failed to send test notification. Check your configuration.",
        variant: "destructive",
      });
    }
  });

  const validateWebhookMutation = useMutation({
    mutationFn: async (webhookUrl: string) => {
      const response = await apiRequest('POST', '/api/slack/validate-webhook', { webhookUrl });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Webhook Validated",
        description: `Connected to workspace: ${data.workspaceName}`,
      });
      setNewIntegration(prev => ({ ...prev, workspaceName: data.workspaceName }));
    },
    onError: () => {
      toast({
        title: "Webhook Validation Failed",
        description: "Invalid webhook URL or connection failed",
        variant: "destructive",
      });
    }
  });

  const handleCreateIntegration = () => {
    if (!newIntegration.name || !newIntegration.webhookUrl) {
      toast({
        title: "Missing Information",
        description: "Please provide integration name and webhook URL",
        variant: "destructive",
      });
      return;
    }

    const integrationData = {
      name: newIntegration.name,
      workspaceName: newIntegration.workspaceName,
      webhookUrl: newIntegration.webhookUrl,
      defaultChannel: newIntegration.defaultChannel,
      botToken: newIntegration.botToken || undefined,
      eventMappings: AVAILABLE_EVENTS.slice(0, 3).map(event => ({
        event: event.event,
        channel: newIntegration.defaultChannel,
        template: event.defaultTemplate,
        enabled: true,
        priority: 'medium' as const
      }))
    };

    createIntegrationMutation.mutate(integrationData);
  };

  const resetIntegrationForm = () => {
    setNewIntegration({
      name: '',
      workspaceName: '',
      webhookUrl: '',
      defaultChannel: '#general',
      botToken: ''
    });
  };

  const updateEventMapping = (integrationId: string, eventType: string, updates: Partial<any>) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    const updatedMappings = integration.eventMappings.map(mapping =>
      mapping.event === eventType ? { ...mapping, ...updates } : mapping
    );

    updateIntegrationMutation.mutate({
      id: integrationId,
      data: { eventMappings: updatedMappings }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <AppHeader />
      
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Slack Integration</h1>
            <p className="text-gray-600">Connect your workspace to receive notifications and updates</p>
          </div>
          <div className="flex items-center space-x-3">
            {statistics && (
              <>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {integrations.length} workspace(s)
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {statistics.totalSent} sent today
                </Badge>
              </>
            )}
            <Button 
              onClick={() => setShowIntegrationDialog(true)}
              className="bg-purple-600 hover:bg-purple-700"
              data-testid="button-add-integration"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Integrations</p>
                    <div className="text-2xl font-bold text-purple-600 mt-1">
                      {integrations.filter(i => i.isActive).length}
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Messages Sent</p>
                    <div className="text-2xl font-bold text-green-600 mt-1">
                      {statistics.totalSent}
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Send className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <div className="text-2xl font-bold text-green-600 mt-1">
                      {Math.round(statistics.successRate)}%
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Failed Today</p>
                    <div className="text-2xl font-bold text-red-600 mt-1">
                      {statistics.failedToday || 0}
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="events">Event Mapping</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="space-y-4">
              {integrations.length === 0 ? (
                <Card className="p-12 text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Slack Integrations</h3>
                  <p className="text-gray-500 mb-6">Connect your Slack workspace to receive notifications</p>
                  <Button onClick={() => setShowIntegrationDialog(true)} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Integration
                  </Button>
                </Card>
              ) : (
                integrations.map((integration) => (
                  <Card key={integration.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <MessageSquare className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-medium text-lg">{integration.name}</div>
                              <div className="text-sm text-gray-600">
                                Workspace: {integration.workspaceName} • Default: {integration.defaultChannel}
                              </div>
                            </div>
                          </div>
                          <div className="ml-13 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <Label className="text-sm text-gray-600">Messages Sent</Label>
                              <div className="text-sm font-medium">
                                {integration.statistics.totalSent}
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-600">Success Rate</Label>
                              <div className="text-sm font-medium">
                                {Math.round(integration.statistics.successRate)}%
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-600">Active Events</Label>
                              <div className="text-sm font-medium">
                                {integration.eventMappings.filter(m => m.enabled).length}
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-600">Last Sent</Label>
                              <div className="text-sm font-medium">
                                {integration.statistics.lastSent ? 
                                  format(parseISO(integration.statistics.lastSent), 'MMM d, h:mm a') : 
                                  'Never'
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedIntegration(integration);
                              testIntegrationMutation.mutate({ 
                                integrationId: integration.id, 
                                data: testNotification 
                              });
                            }}
                            disabled={testIntegrationMutation.isPending}
                          >
                            <Zap className="h-4 w-4" />
                          </Button>
                          <Switch
                            checked={integration.isActive}
                            onCheckedChange={(checked) => {
                              updateIntegrationMutation.mutate({
                                id: integration.id,
                                data: { isActive: checked }
                              });
                            }}
                            data-testid={`switch-integration-${integration.id}`}
                          />
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Event Mapping Tab */}
          <TabsContent value="events" className="space-y-6">
            {integrations.length === 0 ? (
              <Card className="p-12 text-center">
                <Settings className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Integrations Available</h3>
                <p className="text-gray-500 mb-6">Create a Slack integration first to configure event mappings</p>
                <Button onClick={() => setShowIntegrationDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Integration
                </Button>
              </Card>
            ) : (
              <div className="space-y-6">
                {integrations.map((integration) => (
                  <Card key={integration.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <MessageSquare className="h-5 w-5" />
                        <span>{integration.name}</span>
                        <Badge variant={integration.isActive ? "default" : "secondary"}>
                          {integration.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Configure which events trigger Slack notifications for this workspace
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {AVAILABLE_EVENTS.map((event) => {
                          const mapping = integration.eventMappings.find(m => m.event === event.event) || {
                            event: event.event,
                            channel: integration.defaultChannel,
                            template: event.defaultTemplate,
                            enabled: false,
                            priority: 'medium' as const
                          };

                          return (
                            <div key={event.event} className="flex items-center space-x-4 p-4 border rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={mapping.enabled}
                                  onCheckedChange={(checked) => {
                                    updateEventMapping(integration.id, event.event, { enabled: checked });
                                  }}
                                />
                                <div>
                                  <div className="font-medium">{event.label}</div>
                                  <div className="text-sm text-gray-500">{event.category}</div>
                                </div>
                              </div>
                              
                              {mapping.enabled && (
                                <>
                                  <div className="flex-1">
                                    <Select 
                                      value={mapping.channel} 
                                      onValueChange={(value) => {
                                        updateEventMapping(integration.id, event.event, { channel: value });
                                      }}
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select channel" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="#general">#general</SelectItem>
                                        <SelectItem value="#notifications">#notifications</SelectItem>
                                        <SelectItem value="#alerts">#alerts</SelectItem>
                                        <SelectItem value="#team">#team</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <Select 
                                      value={mapping.priority} 
                                      onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => {
                                        updateEventMapping(integration.id, event.event, { priority: value });
                                      }}
                                    >
                                      <SelectTrigger className="w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedTemplate(event);
                                      setShowTemplateDialog(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search notifications..."
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {notifications.length === 0 ? (
                <Card className="p-12 text-center">
                  <Bell className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Notifications</h3>
                  <p className="text-gray-500">Slack notifications will appear here once events are triggered</p>
                </Card>
              ) : (
                notifications.map((notification) => (
                  <Card key={notification.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <Hash className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-medium">{notification.event}</div>
                              <div className="text-sm text-gray-600">
                                Channel: {notification.channel}
                              </div>
                            </div>
                          </div>
                          <div className="ml-11">
                            <p className="text-gray-700 text-sm mb-3">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>
                                {notification.sentAt ? 
                                  format(parseISO(notification.sentAt), 'MMM d, yyyy h:mm a') : 
                                  'Not sent yet'
                                }
                              </span>
                              <span>Attempts: {notification.attempts}</span>
                              {notification.error && (
                                <span className="text-red-600">Error: {notification.error}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(notification.status)}>
                            {notification.status}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card className="p-12 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Message Templates</h3>
              <p className="text-gray-500 mb-6">Customize notification messages for different events</p>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Integration Dialog */}
        <Dialog open={showIntegrationDialog} onOpenChange={setShowIntegrationDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Slack Integration</DialogTitle>
              <DialogDescription>
                Connect your Slack workspace to receive notifications
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div>
                <Label htmlFor="integrationName">Integration Name *</Label>
                <Input
                  id="integrationName"
                  value={newIntegration.name}
                  onChange={(e) => setNewIntegration(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Team Notifications"
                  data-testid="input-integration-name"
                />
              </div>

              <div>
                <Label htmlFor="webhookUrl">Slack Webhook URL *</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="webhookUrl"
                    value={newIntegration.webhookUrl}
                    onChange={(e) => setNewIntegration(prev => ({ ...prev, webhookUrl: e.target.value }))}
                    placeholder="https://hooks.slack.com/services/..."
                    className="font-mono text-sm"
                    data-testid="input-webhook-url"
                  />
                  <Button
                    variant="outline"
                    onClick={() => validateWebhookMutation.mutate(newIntegration.webhookUrl)}
                    disabled={!newIntegration.webhookUrl || validateWebhookMutation.isPending}
                  >
                    {validateWebhookMutation.isPending ? 'Validating...' : 'Validate'}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Create an incoming webhook in your Slack workspace settings
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="workspaceName">Workspace Name</Label>
                  <Input
                    id="workspaceName"
                    value={newIntegration.workspaceName}
                    onChange={(e) => setNewIntegration(prev => ({ ...prev, workspaceName: e.target.value }))}
                    placeholder="My Team"
                  />
                </div>
                <div>
                  <Label htmlFor="defaultChannel">Default Channel</Label>
                  <Input
                    id="defaultChannel"
                    value={newIntegration.defaultChannel}
                    onChange={(e) => setNewIntegration(prev => ({ ...prev, defaultChannel: e.target.value }))}
                    placeholder="#general"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="botToken">Bot Token (Optional)</Label>
                <Input
                  id="botToken"
                  value={newIntegration.botToken}
                  onChange={(e) => setNewIntegration(prev => ({ ...prev, botToken: e.target.value }))}
                  placeholder="xoxb-..."
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  For advanced features like channel listing and user mentions
                </p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Setup Instructions:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                    <li>Go to your Slack workspace settings</li>
                    <li>Navigate to Apps → Incoming Webhooks</li>
                    <li>Create a new webhook for your desired channel</li>
                    <li>Copy the webhook URL and paste it above</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowIntegrationDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateIntegration}
                disabled={createIntegrationMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700"
                data-testid="button-create-integration"
              >
                {createIntegrationMutation.isPending ? 'Creating...' : 'Create Integration'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Template Editor Dialog */}
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Message Template</DialogTitle>
              <DialogDescription>
                Customize the notification message for {selectedTemplate?.label}
              </DialogDescription>
            </DialogHeader>
            {selectedTemplate && (
              <div className="grid gap-6 py-4">
                <div>
                  <Label>Available Variables</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTemplate.variables.map(variable => (
                      <Badge key={variable} variant="outline" className="font-mono text-xs">
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="template">Message Template</Label>
                  <Textarea
                    id="template"
                    defaultValue={selectedTemplate.defaultTemplate}
                    placeholder="Enter your custom template..."
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <Label>Preview</Label>
                  <div className="p-3 border rounded-lg bg-gray-50 font-mono text-sm">
                    {selectedTemplate.defaultTemplate.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
                      const exampleValues: Record<string, string> = {
                        title: 'Fix login bug',
                        assignee: 'John Doe',
                        priority: 'high',
                        project: 'Website Redesign',
                        amount: '2,500',
                        client: 'Acme Corp'
                      };
                      return exampleValues[variable] || match;
                    })}
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                Cancel
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Save Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}