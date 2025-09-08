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
import { 
  Mail, 
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
  MessageSquare,
  Inbox,
  Send,
  RefreshCw,
  ExternalLink,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';

interface InboundEmail {
  id: string;
  fromEmail: string;
  toEmail: string;
  subject: string;
  content: string;
  attachments: any[];
  parsedAt: string;
  status: 'processed' | 'failed' | 'pending';
  routingRule?: string;
  assignedUser?: string;
  messageId?: string;
}

interface EmailRoutingRule {
  id: string;
  name: string;
  description: string;
  conditions: {
    fromEmail?: string;
    subject?: string;
    content?: string;
    domain?: string;
  };
  actions: {
    assignToUser?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    autoReply?: boolean;
    autoReplyTemplate?: string;
    forwarding?: string[];
    createTask?: boolean;
    tags?: string[];
  };
  isActive: boolean;
  matchCount: number;
  createdAt: string;
  updatedAt: string;
}

interface EmailConfiguration {
  outbound: {
    enabled: boolean;
    status: string;
    provider: string;
  };
  inbound: {
    webhookUrl: string;
    status: string;
    setupInstructions: string[];
    emailAddress: string;
  };
  parsing: {
    enabled: boolean;
    autoRouting: boolean;
    spamFiltering: boolean;
    attachmentHandling: boolean;
  };
  statistics: {
    totalProcessed: number;
    todayProcessed: number;
    failureRate: number;
    averageProcessingTime: number;
  };
}

export default function EmailManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [selectedRule, setSelectedRule] = useState<EmailRoutingRule | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    fromEmail: '',
    subject: '',
    assignToUser: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    autoReply: false,
    autoReplyTemplate: '',
    createTask: false
  });

  const [testEmail, setTestEmail] = useState({
    fromEmail: 'test@example.com',
    subject: 'Test Email Subject',
    content: 'This is a test email content for parser validation.'
  });

  const { data: emailConfig } = useQuery<EmailConfiguration>({
    queryKey: ['/api/messages/email-config']
  });

  const { data: inboundEmails = [] } = useQuery<InboundEmail[]>({
    queryKey: ['/api/emails/inbound'],
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  const { data: routingRules = [] } = useQuery<EmailRoutingRule[]>({
    queryKey: ['/api/emails/routing-rules']
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/users']
  });

  const createRuleMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/emails/routing-rules', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emails/routing-rules'] });
      setShowRuleDialog(false);
      resetRuleForm();
      toast({
        title: "Routing Rule Created",
        description: "Email routing rule has been created successfully",
      });
    }
  });

  const updateRuleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest('PATCH', `/api/emails/routing-rules/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emails/routing-rules'] });
    }
  });

  const testParserMutation = useMutation({
    mutationFn: async (emailData: any) => {
      const response = await apiRequest('POST', '/api/emails/test-parser', emailData);
      return response.json();
    },
    onSuccess: (data) => {
      setShowTestDialog(false);
      toast({
        title: "Parser Test Successful",
        description: `Email parsed successfully: ${data.subject} from ${data.fromEmail}`,
      });
    },
    onError: () => {
      toast({
        title: "Parser Test Failed",
        description: "Failed to parse test email data",
        variant: "destructive",
      });
    }
  });

  const reprocessEmailMutation = useMutation({
    mutationFn: async (emailId: string) => {
      const response = await apiRequest('POST', `/api/emails/inbound/${emailId}/reprocess`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emails/inbound'] });
      toast({
        title: "Email Reprocessed",
        description: "Email has been reprocessed successfully",
      });
    }
  });

  const handleCreateRule = () => {
    if (!newRule.name || !newRule.assignToUser) {
      toast({
        title: "Missing Information",
        description: "Please provide rule name and assign to user",
        variant: "destructive",
      });
      return;
    }

    const ruleData = {
      name: newRule.name,
      description: newRule.description,
      conditions: {
        fromEmail: newRule.fromEmail || undefined,
        subject: newRule.subject || undefined
      },
      actions: {
        assignToUser: newRule.assignToUser,
        priority: newRule.priority,
        autoReply: newRule.autoReply,
        autoReplyTemplate: newRule.autoReplyTemplate || undefined,
        createTask: newRule.createTask
      },
      isActive: true
    };

    createRuleMutation.mutate(ruleData);
  };

  const resetRuleForm = () => {
    setNewRule({
      name: '',
      description: '',
      fromEmail: '',
      subject: '',
      assignToUser: '',
      priority: 'medium',
      autoReply: false,
      autoReplyTemplate: '',
      createTask: false
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'bg-green-100 text-green-800 border-green-200';
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

  const filteredEmails = inboundEmails.filter(email =>
    email.fromEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <AppHeader />
      
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Email Management</h1>
            <p className="text-gray-600">Inbound email processing and routing configuration</p>
          </div>
          <div className="flex items-center space-x-3">
            {emailConfig && (
              <>
                <Badge variant={emailConfig.outbound.enabled ? "default" : "secondary"}>
                  <Send className="h-3 w-3 mr-1" />
                  {emailConfig.outbound.enabled ? "Outbound Active" : "Outbound Disabled"}
                </Badge>
                <Badge variant={emailConfig.inbound.status.includes('Ready') ? "default" : "secondary"}>
                  <Inbox className="h-3 w-3 mr-1" />
                  {emailConfig.inbound.status.includes('Ready') ? "Webhook Ready" : "Webhook Pending"}
                </Badge>
              </>
            )}
            <Button 
              onClick={() => setShowTestDialog(true)}
              variant="outline"
              data-testid="button-test-parser"
            >
              <Zap className="h-4 w-4 mr-2" />
              Test Parser
            </Button>
            <Button 
              onClick={() => setShowRuleDialog(true)}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="button-create-rule"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Rule
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {emailConfig && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Processed</p>
                    <div className="text-2xl font-bold text-blue-600 mt-1">
                      {emailConfig.statistics.totalProcessed}
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Emails</p>
                    <div className="text-2xl font-bold text-green-600 mt-1">
                      {emailConfig.statistics.todayProcessed}
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Inbox className="h-6 w-6 text-green-600" />
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
                      {Math.round((1 - emailConfig.statistics.failureRate) * 100)}%
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
                    <p className="text-sm font-medium text-gray-600">Avg Processing</p>
                    <div className="text-2xl font-bold text-purple-600 mt-1">
                      {emailConfig.statistics.averageProcessingTime}ms
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Configuration</TabsTrigger>
            <TabsTrigger value="emails">Inbound Emails</TabsTrigger>
            <TabsTrigger value="rules">Routing Rules</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          {/* Configuration Tab */}
          <TabsContent value="overview" className="space-y-6">
            {emailConfig && (
              <>
                {/* Setup Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Email Integration Status</CardTitle>
                    <CardDescription>
                      Current configuration and setup status for email processing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Outbound Configuration */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          emailConfig.outbound.enabled ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <Send className={`h-5 w-5 ${
                            emailConfig.outbound.enabled ? 'text-green-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <div className="font-medium">Outbound Email</div>
                          <div className="text-sm text-gray-600">{emailConfig.outbound.status}</div>
                        </div>
                      </div>
                      <Badge variant={emailConfig.outbound.enabled ? "default" : "secondary"}>
                        {emailConfig.outbound.enabled ? "Active" : "Disabled"}
                      </Badge>
                    </div>

                    {/* Inbound Configuration */}
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Inbox className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">Inbound Email Processing</div>
                            <div className="text-sm text-gray-600">{emailConfig.inbound.status}</div>
                          </div>
                        </div>
                        <Badge variant="outline">Webhook Ready</Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm text-gray-600">Email Address</Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Input 
                              value={emailConfig.inbound.emailAddress} 
                              readOnly 
                              className="font-mono text-sm"
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(emailConfig.inbound.emailAddress);
                                toast({ title: "Copied!", description: "Email address copied to clipboard" });
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm text-gray-600">Webhook URL</Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Input 
                              value={emailConfig.inbound.webhookUrl} 
                              readOnly 
                              className="font-mono text-sm"
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(emailConfig.inbound.webhookUrl);
                                toast({ title: "Copied!", description: "Webhook URL copied to clipboard" });
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Setup Instructions:</strong>
                            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                              {emailConfig.inbound.setupInstructions.map((instruction, index) => (
                                <li key={index}>{instruction}</li>
                              ))}
                            </ol>
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Processing Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Processing Settings</CardTitle>
                    <CardDescription>
                      Configure how inbound emails are processed and handled
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Auto Routing</Label>
                          <p className="text-sm text-gray-600">Automatically route emails based on rules</p>
                        </div>
                        <Switch 
                          checked={emailConfig.parsing.autoRouting} 
                          onCheckedChange={(checked) => {
                            // Update configuration
                          }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Spam Filtering</Label>
                          <p className="text-sm text-gray-600">Filter out potential spam emails</p>
                        </div>
                        <Switch 
                          checked={emailConfig.parsing.spamFiltering} 
                          onCheckedChange={(checked) => {
                            // Update configuration
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Attachment Handling</Label>
                          <p className="text-sm text-gray-600">Process and store email attachments</p>
                        </div>
                        <Switch 
                          checked={emailConfig.parsing.attachmentHandling} 
                          onCheckedChange={(checked) => {
                            // Update configuration
                          }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Email Parsing</Label>
                          <p className="text-sm text-gray-600">Parse email content and metadata</p>
                        </div>
                        <Switch 
                          checked={emailConfig.parsing.enabled} 
                          onCheckedChange={(checked) => {
                            // Update configuration
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Inbound Emails Tab */}
          <TabsContent value="emails" className="space-y-6">
            {/* Search Bar */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search emails by sender, subject, or content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-emails"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/emails/inbound'] })}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Email List */}
            <div className="space-y-4">
              {filteredEmails.length === 0 ? (
                <Card className="p-12 text-center">
                  <Mail className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Emails Found</h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm ? "No emails match your search criteria" : "No inbound emails have been processed yet"}
                  </p>
                  {!searchTerm && (
                    <Button variant="outline" onClick={() => setShowTestDialog(true)}>
                      <Zap className="h-4 w-4 mr-2" />
                      Test Email Parser
                    </Button>
                  )}
                </Card>
              ) : (
                filteredEmails.map((email) => (
                  <Card key={email.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Mail className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">{email.subject}</div>
                              <div className="text-sm text-gray-600">
                                From: {email.fromEmail} • To: {email.toEmail}
                              </div>
                            </div>
                          </div>
                          <div className="ml-11">
                            <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                              {email.content}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Parsed: {format(parseISO(email.parsedAt), 'MMM d, yyyy h:mm a')}</span>
                              {email.attachments.length > 0 && (
                                <span>{email.attachments.length} attachment(s)</span>
                              )}
                              {email.assignedUser && (
                                <span>Assigned to: {email.assignedUser}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(email.status)}>
                            {email.status}
                          </Badge>
                          {email.status === 'failed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => reprocessEmailMutation.mutate(email.id)}
                              disabled={reprocessEmailMutation.isPending}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
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

          {/* Routing Rules Tab */}
          <TabsContent value="rules" className="space-y-6">
            <div className="space-y-4">
              {routingRules.length === 0 ? (
                <Card className="p-12 text-center">
                  <Settings className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Routing Rules</h3>
                  <p className="text-gray-500 mb-6">Create rules to automatically route incoming emails</p>
                  <Button onClick={() => setShowRuleDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Rule
                  </Button>
                </Card>
              ) : (
                routingRules.map((rule) => (
                  <Card key={rule.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <ArrowRight className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-medium">{rule.name}</div>
                              <div className="text-sm text-gray-600">{rule.description}</div>
                            </div>
                          </div>
                          <div className="ml-11">
                            <div className="text-sm space-y-1">
                              {rule.conditions.fromEmail && (
                                <div>From: <span className="font-mono">{rule.conditions.fromEmail}</span></div>
                              )}
                              {rule.conditions.subject && (
                                <div>Subject contains: <span className="font-mono">{rule.conditions.subject}</span></div>
                              )}
                              <div className="text-gray-500 mt-2">
                                Matched {rule.matchCount} emails • Created {format(parseISO(rule.createdAt), 'MMM d, yyyy')}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={getPriorityColor(rule.actions.priority)}>
                            {rule.actions.priority}
                          </Badge>
                          <Switch
                            checked={rule.isActive}
                            onCheckedChange={(checked) => {
                              updateRuleMutation.mutate({
                                id: rule.id,
                                data: { isActive: checked }
                              });
                            }}
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

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card className="p-12 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Email Templates</h3>
              <p className="text-gray-500 mb-6">Manage auto-reply templates and email signatures</p>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Routing Rule Dialog */}
        <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Routing Rule</DialogTitle>
              <DialogDescription>
                Set up automatic email routing based on sender, subject, or content patterns
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ruleName">Rule Name *</Label>
                  <Input
                    id="ruleName"
                    value={newRule.name}
                    onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Support Emails"
                    data-testid="input-rule-name"
                  />
                </div>
                <div>
                  <Label htmlFor="assignToUser">Assign To *</Label>
                  <Select value={newRule.assignToUser} onValueChange={(value) => setNewRule(prev => ({ ...prev, assignToUser: value }))}>
                    <SelectTrigger data-testid="select-assign-user">
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRule.description}
                  onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Route support emails to support team"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromEmail">From Email (Optional)</Label>
                  <Input
                    id="fromEmail"
                    value={newRule.fromEmail}
                    onChange={(e) => setNewRule(prev => ({ ...prev, fromEmail: e.target.value }))}
                    placeholder="support@company.com or *@company.com"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject Contains (Optional)</Label>
                  <Input
                    id="subject"
                    value={newRule.subject}
                    onChange={(e) => setNewRule(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="support, help, bug"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Priority</Label>
                  <Select value={newRule.priority} onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setNewRule(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
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
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="autoReply"
                      checked={newRule.autoReply}
                      onCheckedChange={(checked) => setNewRule(prev => ({ ...prev, autoReply: checked }))}
                    />
                    <Label htmlFor="autoReply">Send Auto-Reply</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="createTask"
                      checked={newRule.createTask}
                      onCheckedChange={(checked) => setNewRule(prev => ({ ...prev, createTask: checked }))}
                    />
                    <Label htmlFor="createTask">Create Task</Label>
                  </div>
                </div>
              </div>

              {newRule.autoReply && (
                <div>
                  <Label htmlFor="autoReplyTemplate">Auto-Reply Template</Label>
                  <Textarea
                    id="autoReplyTemplate"
                    value={newRule.autoReplyTemplate}
                    onChange={(e) => setNewRule(prev => ({ ...prev, autoReplyTemplate: e.target.value }))}
                    placeholder="Thank you for contacting us. We'll respond within 24 hours."
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowRuleDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateRule}
                disabled={createRuleMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-save-rule"
              >
                {createRuleMutation.isPending ? 'Creating...' : 'Create Rule'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Test Parser Dialog */}
        <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Test Email Parser</DialogTitle>
              <DialogDescription>
                Test the email parser with sample email data to verify parsing functionality
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div>
                <Label htmlFor="testFromEmail">From Email</Label>
                <Input
                  id="testFromEmail"
                  value={testEmail.fromEmail}
                  onChange={(e) => setTestEmail(prev => ({ ...prev, fromEmail: e.target.value }))}
                  placeholder="sender@example.com"
                />
              </div>

              <div>
                <Label htmlFor="testSubject">Subject</Label>
                <Input
                  id="testSubject"
                  value={testEmail.subject}
                  onChange={(e) => setTestEmail(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Test email subject"
                />
              </div>

              <div>
                <Label htmlFor="testContent">Email Content</Label>
                <Textarea
                  id="testContent"
                  value={testEmail.content}
                  onChange={(e) => setTestEmail(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Test email content goes here..."
                  rows={4}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowTestDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => testParserMutation.mutate(testEmail)}
                disabled={testParserMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {testParserMutation.isPending ? 'Testing...' : 'Test Parser'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}