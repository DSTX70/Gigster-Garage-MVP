import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Zap, 
  Play, 
  Pause, 
  Settings, 
  Plus,
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Home,
  BarChart3
} from "lucide-react";

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  isActive?: boolean;
  popularity: number;
  rating: number;
  author: string;
}

interface WorkflowStats {
  totalTemplates: number;
  activeWorkflows: number;
  totalExecutions: number;
  systemTemplates: number;
}

interface AutomationRule {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  description?: string;
}

export default function MobileWorkflows() {
  const [activeTab, setActiveTab] = useState<'templates' | 'automation' | 'stats'>('templates');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch workflow templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery<WorkflowTemplate[]>({
    queryKey: ["/api/workflows/templates"],
  });

  // Fetch workflow statistics  
  const { data: stats, isLoading: statsLoading } = useQuery<WorkflowStats>({
    queryKey: ["/api/workflows/stats"],
  });

  // Fetch automation rules
  const { data: invoiceRules = [], isLoading: invoiceRulesLoading } = useQuery<AutomationRule[]>({
    queryKey: ["/api/invoices/automation/rules"],
  });

  const { data: notificationRules = [], isLoading: notificationRulesLoading } = useQuery<AutomationRule[]>({
    queryKey: ["/api/notifications/rules"],
  });

  // Execute workflow mutation
  const executeWorkflowMutation = useMutation({
    mutationFn: async (workflowId: string) => {
      const response = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: { source: 'mobile', timestamp: new Date().toISOString() } })
      });
      if (!response.ok) throw new Error('Failed to execute workflow');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Workflow Executed",
        description: "Workflow has been executed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/workflows/stats"] });
    },
    onError: () => {
      toast({
        title: "Execution Failed", 
        description: "Failed to execute workflow",
        variant: "destructive",
      });
    }
  });

  // Manual trigger mutation
  const triggerAutomationMutation = useMutation({
    mutationFn: async (type: 'workflows' | 'invoicing' | 'notifications') => {
      const endpoints = {
        workflows: '/api/workflows/trigger',
        invoicing: '/api/invoices/automation/trigger', 
        notifications: '/api/notifications/trigger'
      };
      
      const response = await fetch(endpoints[type], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`Failed to trigger ${type}`);
      return response.json();
    },
    onSuccess: (_, type) => {
      toast({
        title: "Automation Triggered",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} automation executed successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/workflows/stats"] });
    },
    onError: (_, type) => {
      toast({
        title: "Trigger Failed",
        description: `Failed to trigger ${type} automation`,
        variant: "destructive",
      });
    }
  });

  const isLoading = templatesLoading || statsLoading || invoiceRulesLoading || notificationRulesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#004C6D] to-[#0B1D3A] flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading Workflows...</p>
        </div>
      </div>
    );
  }

  const allRules = [...invoiceRules, ...notificationRules];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004C6D] to-[#0B1D3A]">
      {/* Header */}
      <div className="bg-[#004C6D] px-4 py-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Link href="/mobile">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-2"
                data-testid="button-back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">⚡ Workflows</h1>
              <p className="text-blue-100 text-sm">Automation & Rules</p>
            </div>
          </div>
          <Link href="/mobile">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-2"
              data-testid="button-home"
            >
              <Home className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white/10 rounded-lg p-1">
          <Button
            variant={activeTab === 'templates' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('templates')}
            className={`flex-1 ${activeTab === 'templates' ? 'bg-white text-[#004C6D]' : 'text-white hover:bg-white/20'}`}
            data-testid="tab-templates"
          >
            <Zap className="h-4 w-4 mr-1" />
            Templates
          </Button>
          <Button
            variant={activeTab === 'automation' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('automation')}
            className={`flex-1 ${activeTab === 'automation' ? 'bg-white text-[#004C6D]' : 'text-white hover:bg-white/20'}`}
            data-testid="tab-automation"
          >
            <Settings className="h-4 w-4 mr-1" />
            Rules
          </Button>
          <Button
            variant={activeTab === 'stats' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('stats')}
            className={`flex-1 ${activeTab === 'stats' ? 'bg-white text-[#004C6D]' : 'text-white hover:bg-white/20'}`}
            data-testid="tab-stats"
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Stats
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <>
            {/* Quick Actions */}
            <Card className="bg-white/95 backdrop-blur border-0 shadow-lg" data-testid="card-quick-actions">
              <CardHeader className="pb-3">
                <CardTitle className="text-[#004C6D]">⚡ Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    onClick={() => triggerAutomationMutation.mutate('workflows')}
                    disabled={triggerAutomationMutation.isPending}
                    className="bg-[#004C6D] hover:bg-[#003A52] text-white justify-start"
                    data-testid="button-trigger-workflows"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Trigger All Workflows
                  </Button>
                  <Button
                    onClick={() => triggerAutomationMutation.mutate('invoicing')}
                    disabled={triggerAutomationMutation.isPending}
                    variant="outline"
                    className="text-[#004C6D] border-[#004C6D]/20 justify-start"
                    data-testid="button-trigger-invoicing"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Trigger Invoice Automation
                  </Button>
                  <Button
                    onClick={() => triggerAutomationMutation.mutate('notifications')}
                    disabled={triggerAutomationMutation.isPending}
                    variant="outline"
                    className="text-[#004C6D] border-[#004C6D]/20 justify-start"
                    data-testid="button-trigger-notifications"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Trigger Smart Notifications
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Workflow Templates */}
            <Card className="bg-white/95 backdrop-blur border-0 shadow-lg" data-testid="card-workflow-templates">
              <CardHeader className="pb-3">
                <CardTitle className="text-[#004C6D]">📋 Workflow Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {templates.map((template, index) => (
                    <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-testid={`template-${index}`}>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium text-gray-900">{template.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {template.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>⭐ {template.rating}/5</span>
                          <span>👥 {template.popularity} uses</span>
                          <span>👨‍💻 {template.author}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => executeWorkflowMutation.mutate(template.id)}
                        disabled={executeWorkflowMutation.isPending}
                        className="bg-[#004C6D] hover:bg-[#003A52] text-white ml-3"
                        data-testid={`button-execute-template-${index}`}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {templates.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No workflow templates available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Automation Rules Tab */}
        {activeTab === 'automation' && (
          <Card className="bg-white/95 backdrop-blur border-0 shadow-lg" data-testid="card-automation-rules">
            <CardHeader className="pb-3">
              <CardTitle className="text-[#004C6D]">⚙️ Active Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allRules.map((rule, index) => (
                  <div key={rule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-testid={`rule-${index}`}>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900">{rule.name}</h3>
                        <Badge variant={rule.isActive ? "default" : "secondary"} className="text-xs">
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {rule.description && (
                        <p className="text-xs text-gray-600 mt-1">{rule.description}</p>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        Type: {rule.type || 'Automation Rule'}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={rule.isActive}
                        disabled
                        className="scale-75"
                        data-testid={`switch-rule-${index}`}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[#004C6D] border-[#004C6D]/20"
                        data-testid={`button-edit-rule-${index}`}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {allRules.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No automation rules configured</p>
                    <p className="text-xs">Create rules to automate your workflow</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && stats && (
          <>
            {/* Overview Stats */}
            <Card className="bg-white/95 backdrop-blur border-0 shadow-lg" data-testid="card-workflow-stats">
              <CardHeader className="pb-3">
                <CardTitle className="text-[#004C6D]">📊 Workflow Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600" data-testid="text-total-templates">
                      {stats.totalTemplates}
                    </div>
                    <div className="text-xs text-blue-600">Templates</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600" data-testid="text-active-workflows">
                      {stats.activeWorkflows}
                    </div>
                    <div className="text-xs text-green-600">Active</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600" data-testid="text-total-executions">
                      {stats.totalExecutions}
                    </div>
                    <div className="text-xs text-purple-600">Executions</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600" data-testid="text-system-templates">
                      {stats.systemTemplates}
                    </div>
                    <div className="text-xs text-orange-600">System</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="bg-white/95 backdrop-blur border-0 shadow-lg" data-testid="card-performance">
              <CardHeader className="pb-3">
                <CardTitle className="text-[#004C6D]">📈 Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className="text-sm font-medium text-green-600">95.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Execution Time</span>
                    <span className="text-sm font-medium text-blue-600">1.2s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Today's Runs</span>
                    <span className="text-sm font-medium text-purple-600">47</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Add bottom padding */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}