import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Play, Pause, Trash2, Settings, Zap, Clock, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { AppHeader } from "@/components/app-header";

interface WorkflowRule {
  id: string;
  name: string;
  description: string | null;
  entityType: "task" | "project" | "client";
  trigger: {
    event: string;
    conditions: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
  };
  actions: Array<{
    type: string;
    config: Record<string, any>;
  }>;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

interface WorkflowExecution {
  id: string;
  ruleId: string;
  entityType: string;
  entityId: string;
  status: "success" | "failed" | "partial";
  result: {
    executedActions: number;
    failedActions: number;
    errors: string[];
    details: Record<string, any>;
  } | null;
  executedAt: string;
}

const workflowRuleSchema = z.object({
  name: z.string().min(1, "Rule name is required"),
  description: z.string().optional(),
  entityType: z.enum(["task", "project", "client"]),
  trigger: z.object({
    event: z.string().min(1, "Trigger event is required"),
    conditions: z.array(z.object({
      field: z.string(),
      operator: z.string(),
      value: z.any(),
    })),
  }),
  actions: z.array(z.object({
    type: z.string(),
    config: z.record(z.any()),
  })),
  isActive: z.boolean().default(true),
  priority: z.number().default(0),
});

type WorkflowRuleFormData = z.infer<typeof workflowRuleSchema>;

const triggerEvents = {
  task: [
    { value: "created", label: "Task Created" },
    { value: "updated", label: "Task Updated" },
    { value: "status_changed", label: "Status Changed" },
    { value: "assigned", label: "Task Assigned" },
    { value: "due_date_approaching", label: "Due Date Approaching" },
    { value: "overdue", label: "Task Overdue" },
    { value: "completed", label: "Task Completed" },
  ],
  project: [
    { value: "created", label: "Project Created" },
    { value: "updated", label: "Project Updated" },
    { value: "status_changed", label: "Status Changed" },
    { value: "milestone_reached", label: "Milestone Reached" },
    { value: "deadline_approaching", label: "Deadline Approaching" },
  ],
  client: [
    { value: "created", label: "Client Created" },
    { value: "updated", label: "Client Updated" },
    { value: "status_changed", label: "Status Changed" },
    { value: "payment_received", label: "Payment Received" },
    { value: "invoice_overdue", label: "Invoice Overdue" },
  ],
};

const conditionOperators = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not Equals" },
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Does Not Contain" },
  { value: "greater_than", label: "Greater Than" },
  { value: "less_than", label: "Less Than" },
  { value: "is_empty", label: "Is Empty" },
  { value: "is_not_empty", label: "Is Not Empty" },
];

const actionTypes = [
  { value: "send_email", label: "Send Email", icon: "📧" },
  { value: "create_task", label: "Create Task", icon: "✅" },
  { value: "update_status", label: "Update Status", icon: "🔄" },
  { value: "assign_user", label: "Assign User", icon: "👤" },
  { value: "add_comment", label: "Add Comment", icon: "💬" },
  { value: "send_notification", label: "Send Notification", icon: "🔔" },
  { value: "update_priority", label: "Update Priority", icon: "⚡" },
  { value: "set_due_date", label: "Set Due Date", icon: "📅" },
];

function RuleBuilder({ onClose, existingRule }: { onClose: () => void; existingRule?: WorkflowRule }) {
  const { toast } = useToast();
  const [conditions, setConditions] = useState(existingRule?.trigger.conditions || []);
  const [actions, setActions] = useState(existingRule?.actions || []);

  const form = useForm<WorkflowRuleFormData>({
    resolver: zodResolver(workflowRuleSchema),
    defaultValues: existingRule ? {
      name: existingRule.name,
      description: existingRule.description || "",
      entityType: existingRule.entityType,
      trigger: existingRule.trigger,
      actions: existingRule.actions,
      isActive: existingRule.isActive,
      priority: existingRule.priority,
    } : {
      name: "",
      description: "",
      entityType: "task",
      trigger: {
        event: "",
        conditions: [],
      },
      actions: [],
      isActive: true,
      priority: 0,
    },
  });

  const createRuleMutation = useMutation({
    mutationFn: (data: WorkflowRuleFormData) => 
      existingRule 
        ? apiRequest("PUT", `/api/workflow-rules/${existingRule.id}`, data)
        : apiRequest("POST", "/api/workflow-rules", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflow-rules"] });
      toast({
        title: existingRule ? "Rule updated successfully" : "Rule created successfully",
        description: "Your automation rule is now active.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save rule",
        variant: "destructive",
      });
    },
  });

  const addCondition = () => {
    setConditions([...conditions, { field: "", operator: "equals", value: "" }]);
  };

  const addAction = () => {
    setActions([...actions, { type: "", config: {} }]);
  };

  const removeCondition = (index: number) => {
    const newConditions = conditions.filter((_, i) => i !== index);
    setConditions(newConditions);
    form.setValue("trigger.conditions", newConditions);
  };

  const removeAction = (index: number) => {
    const newActions = actions.filter((_, i) => i !== index);
    setActions(newActions);
    form.setValue("actions", newActions);
  };

  const updateCondition = (index: number, field: string, value: any) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setConditions(newConditions);
    form.setValue("trigger.conditions", newConditions);
  };

  const updateAction = (index: number, field: string, value: any) => {
    const newActions = [...actions];
    if (field === 'type') {
      newActions[index] = { type: value, config: {} };
    } else {
      newActions[index] = { ...newActions[index], config: { ...newActions[index].config, [field]: value } };
    }
    setActions(newActions);
    form.setValue("actions", newActions);
  };

  const onSubmit = (data: WorkflowRuleFormData) => {
    data.trigger.conditions = conditions;
    data.actions = actions;
    createRuleMutation.mutate(data);
  };

  const entityType = form.watch("entityType");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rule Name</FormLabel>
                <FormControl>
                  <Input placeholder="My Automation Rule" {...field} data-testid="input-rule-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="entityType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entity Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-entity-type">
                      <SelectValue placeholder="Select entity type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="task">Tasks</SelectItem>
                    <SelectItem value="project">Projects</SelectItem>
                    <SelectItem value="client">Clients</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe what this rule does..." 
                  {...field} 
                  data-testid="textarea-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Trigger</h4>
          </div>
          
          <FormField
            control={form.control}
            name="trigger.event"
            render={({ field }) => (
              <FormItem>
                <FormLabel>When this happens</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-trigger-event">
                      <SelectValue placeholder="Select trigger event" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {triggerEvents[entityType]?.map((event) => (
                      <SelectItem key={event.value} value={event.value}>
                        {event.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <FormLabel>Conditions (Optional)</FormLabel>
              <Button type="button" variant="outline" size="sm" onClick={addCondition} data-testid="button-add-condition">
                <Plus className="w-4 h-4 mr-1" />
                Add Condition
              </Button>
            </div>
            
            {conditions.map((condition, index) => (
              <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                <Input
                  placeholder="Field name"
                  value={condition.field}
                  onChange={(e) => updateCondition(index, "field", e.target.value)}
                  className="flex-1"
                  data-testid={`input-condition-field-${index}`}
                />
                <Select 
                  value={condition.operator}
                  onValueChange={(value) => updateCondition(index, "operator", value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionOperators.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Value"
                  value={condition.value}
                  onChange={(e) => updateCondition(index, "value", e.target.value)}
                  className="flex-1"
                  data-testid={`input-condition-value-${index}`}
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeCondition(index)}
                  data-testid={`button-remove-condition-${index}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Actions</FormLabel>
            <Button type="button" variant="outline" size="sm" onClick={addAction} data-testid="button-add-action">
              <Plus className="w-4 h-4 mr-1" />
              Add Action
            </Button>
          </div>

          {actions.map((action, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Select 
                  value={action.type}
                  onValueChange={(value) => updateAction(index, "type", value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select action type" />
                  </SelectTrigger>
                  <SelectContent>
                    {actionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeAction(index)}
                  data-testid={`button-remove-action-${index}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {action.type === "send_email" && (
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="To email"
                    value={action.config.to || ""}
                    onChange={(e) => updateAction(index, "to", e.target.value)}
                    data-testid={`input-email-to-${index}`}
                  />
                  <Input
                    placeholder="Subject"
                    value={action.config.subject || ""}
                    onChange={(e) => updateAction(index, "subject", e.target.value)}
                    data-testid={`input-email-subject-${index}`}
                  />
                  <Textarea
                    placeholder="Message"
                    value={action.config.message || ""}
                    onChange={(e) => updateAction(index, "message", e.target.value)}
                    className="col-span-2"
                    data-testid={`textarea-email-message-${index}`}
                  />
                </div>
              )}

              {action.type === "create_task" && (
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Task title"
                    value={action.config.title || ""}
                    onChange={(e) => updateAction(index, "title", e.target.value)}
                    data-testid={`input-task-title-${index}`}
                  />
                  <Input
                    placeholder="Priority"
                    value={action.config.priority || ""}
                    onChange={(e) => updateAction(index, "priority", e.target.value)}
                    data-testid={`input-task-priority-${index}`}
                  />
                  <Textarea
                    placeholder="Task description"
                    value={action.config.description || ""}
                    onChange={(e) => updateAction(index, "description", e.target.value)}
                    className="col-span-2"
                    data-testid={`textarea-task-description-${index}`}
                  />
                </div>
              )}

              {action.type === "update_status" && (
                <Input
                  placeholder="New status"
                  value={action.config.status || ""}
                  onChange={(e) => updateAction(index, "status", e.target.value)}
                  data-testid={`input-new-status-${index}`}
                />
              )}

              {action.type === "add_comment" && (
                <Textarea
                  placeholder="Comment text"
                  value={action.config.text || ""}
                  onChange={(e) => updateAction(index, "text", e.target.value)}
                  data-testid={`textarea-comment-${index}`}
                />
              )}
            </div>
          ))}

          {actions.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              No actions configured. Add an action to complete your rule.
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-active"
                    />
                  </FormControl>
                  <FormLabel>Active</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || 0}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      className="w-20"
                      data-testid="input-priority"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createRuleMutation.isPending}
              data-testid="button-save-rule"
            >
              {createRuleMutation.isPending ? "Saving..." : (existingRule ? "Update Rule" : "Create Rule")}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

export default function WorkflowAutomationPage() {
  const { toast } = useToast();
  const [selectedRule, setSelectedRule] = useState<WorkflowRule | null>(null);
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);

  // Fetch workflow rules
  const { data: rules = [], isLoading: rulesLoading } = useQuery<WorkflowRule[]>({
    queryKey: ["/api/workflow-rules"],
  });

  // Fetch workflow executions
  const { data: executions = [], isLoading: executionsLoading } = useQuery<WorkflowExecution[]>({
    queryKey: ["/api/workflow-executions"],
  });

  // Toggle rule status mutation
  const toggleRuleMutation = useMutation({
    mutationFn: ({ ruleId, isActive }: { ruleId: string; isActive: boolean }) =>
      apiRequest("PUT", `/api/workflow-rules/${ruleId}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflow-rules"] });
      toast({
        title: "Rule updated",
        description: "Rule status has been changed.",
      });
    },
  });

  // Delete rule mutation
  const deleteRuleMutation = useMutation({
    mutationFn: (ruleId: string) =>
      apiRequest("DELETE", `/api/workflow-rules/${ruleId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflow-rules"] });
      toast({
        title: "Rule deleted",
        description: "The automation rule has been removed.",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed": return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "partial": return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppHeader />
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline" className="flex items-center" data-testid="button-back-to-dashboard">
                <ArrowLeft size={16} className="mr-2" />
                Back to Tasks
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Zap className="mr-3" size={32} />
                Workflow Automation
              </h1>
              <p className="text-gray-600 mt-1">Automate repetitive tasks with intelligent rules and triggers</p>
            </div>
          </div>
          <Dialog open={showRuleBuilder} onOpenChange={setShowRuleBuilder}>
            <DialogTrigger asChild>
              <Button 
                className="bg-[var(--garage-navy)] text-white hover:bg-[var(--ignition-teal)]"
                data-testid="button-create-rule"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedRule ? "Edit Automation Rule" : "Create Automation Rule"}</DialogTitle>
                <DialogDescription>
                  Define triggers and actions to automate your workflow processes.
                </DialogDescription>
              </DialogHeader>
              <RuleBuilder 
                onClose={() => {
                  setShowRuleBuilder(false);
                  setSelectedRule(null);
                }} 
                existingRule={selectedRule || undefined}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="rules" className="space-y-6">
          <TabsList>
            <TabsTrigger value="rules" data-testid="tab-rules">
              <Zap className="w-4 h-4 mr-2" />
              Automation Rules
            </TabsTrigger>
            <TabsTrigger value="executions" data-testid="tab-executions">
              <Clock className="w-4 h-4 mr-2" />
              Execution History
            </TabsTrigger>
          </TabsList>


        <TabsContent value="rules" className="space-y-4">
          {rulesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : rules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rules.map((rule) => (
                <Card key={rule.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-sm font-medium text-[#0B1D3A]">{rule.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={rule.entityType === "task" ? "default" : rule.entityType === "project" ? "secondary" : "outline"}>
                            {rule.entityType}
                          </Badge>
                          <Badge variant={rule.isActive ? "default" : "secondary"}>
                            {rule.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRule(rule);
                            setShowRuleBuilder(true);
                          }}
                          data-testid={`button-edit-rule-${rule.id}`}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={(checked) => toggleRuleMutation.mutate({ ruleId: rule.id, isActive: checked })}
                          data-testid={`switch-rule-status-${rule.id}`}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs mb-3 line-clamp-2">
                      {rule.description || "No description provided"}
                    </CardDescription>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-medium">Trigger:</span> {rule.trigger.event.replace(/_/g, " ")}
                      </div>
                      <div>
                        <span className="font-medium">Actions:</span> {rule.actions.length} configured
                      </div>
                      <div>
                        <span className="font-medium">Priority:</span> {rule.priority}
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-red-600 hover:text-red-700"
                        onClick={() => deleteRuleMutation.mutate(rule.id)}
                        data-testid={`button-delete-rule-${rule.id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Zap className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No automation rules yet</h3>
                <p className="text-gray-500 mb-4">Create your first automation rule to streamline your workflow.</p>
                <Button onClick={() => setShowRuleBuilder(true)} data-testid="button-create-first-rule">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Rule
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          {executionsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : executions.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Recent Executions</CardTitle>
                <CardDescription>History of automation rule executions</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {executions.map((execution) => {
                      const rule = rules.find(r => r.id === execution.ruleId);
                      return (
                        <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(execution.status)}
                            <div>
                              <div className="font-medium text-sm">
                                {rule?.name || "Unknown Rule"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {execution.entityType} • {new Date(execution.executedAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={execution.status === "success" ? "default" : execution.status === "failed" ? "destructive" : "secondary"}>
                              {execution.status}
                            </Badge>
                            {execution.result && (
                              <div className="text-xs text-gray-500 mt-1">
                                {execution.result.executedActions} actions executed
                                {execution.result.failedActions > 0 && ` • ${execution.result.failedActions} failed`}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No executions yet</h3>
                <p className="text-gray-500">Automation executions will appear here once your rules start running.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}