import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Play, 
  Pause, 
  Settings, 
  Plus, 
  Trash2, 
  Copy,
  Zap,
  Clock,
  Mail,
  Bell,
  Database,
  Workflow,
  GitBranch,
  Filter,
  ArrowRight,
  Save,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'delay';
  position: { x: number; y: number };
  data: {
    label: string;
    config: Record<string, any>;
    description?: string;
  };
  connections: string[];
}

interface AdvancedWorkflowBuilderProps {
  onSave?: (workflow: WorkflowData) => void;
  existingWorkflow?: WorkflowData;
  className?: string;
}

interface WorkflowData {
  id?: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  isActive: boolean;
}

const nodeTypes = {
  trigger: {
    icon: Zap,
    color: 'bg-green-100 border-green-300 text-green-800',
    options: [
      { value: 'task_created', label: 'Task Created' },
      { value: 'task_updated', label: 'Task Updated' },
      { value: 'task_assigned', label: 'Task Assigned' },
      { value: 'project_created', label: 'Project Created' },
      { value: 'schedule', label: 'Schedule' },
      { value: 'webhook', label: 'Webhook' }
    ]
  },
  condition: {
    icon: Filter,
    color: 'bg-blue-100 border-blue-300 text-blue-800',
    options: [
      { value: 'field_equals', label: 'Field Equals' },
      { value: 'field_contains', label: 'Field Contains' },
      { value: 'priority_is', label: 'Priority Is' },
      { value: 'status_is', label: 'Status Is' },
      { value: 'date_before', label: 'Date Before' },
      { value: 'date_after', label: 'Date After' }
    ]
  },
  action: {
    icon: GitBranch,
    color: 'bg-purple-100 border-purple-300 text-purple-800',
    options: [
      { value: 'send_email', label: 'Send Email' },
      { value: 'send_notification', label: 'Send Notification' },
      { value: 'update_status', label: 'Update Status' },
      { value: 'assign_user', label: 'Assign User' },
      { value: 'create_task', label: 'Create Task' },
      { value: 'add_comment', label: 'Add Comment' }
    ]
  },
  delay: {
    icon: Clock,
    color: 'bg-orange-100 border-orange-300 text-orange-800',
    options: [
      { value: 'wait_minutes', label: 'Wait Minutes' },
      { value: 'wait_hours', label: 'Wait Hours' },
      { value: 'wait_days', label: 'Wait Days' },
      { value: 'wait_until_date', label: 'Wait Until Date' }
    ]
  }
};

export function AdvancedWorkflowBuilder({ onSave, existingWorkflow, className }: AdvancedWorkflowBuilderProps) {
  const [nodes, setNodes] = useState<WorkflowNode[]>(existingWorkflow?.nodes || []);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState(existingWorkflow?.name || '');
  const [workflowDescription, setWorkflowDescription] = useState(existingWorkflow?.description || '');
  const [isActive, setIsActive] = useState(existingWorkflow?.isActive ?? true);
  const [draggedType, setDraggedType] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const addNode = useCallback((type: keyof typeof nodeTypes, position?: { x: number; y: number }) => {
    const newPosition = position || { 
      x: Math.random() * 400 + 50, 
      y: Math.random() * 300 + 50 
    };
    
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      position: newPosition,
      data: {
        label: `New ${type}`,
        config: {},
        description: `Configure this ${type} node`
      },
      connections: []
    };

    setNodes(prev => [...prev, newNode]);
  }, []);

  const updateNode = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));
  }, []);

  const removeNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    // Remove connections to this node
    setNodes(prev => prev.map(node => ({
      ...node,
      connections: node.connections.filter(id => id !== nodeId)
    })));
  }, []);

  const connectNodes = useCallback((fromId: string, toId: string) => {
    setNodes(prev => prev.map(node => 
      node.id === fromId 
        ? { ...node, connections: [...node.connections.filter(id => id !== toId), toId] }
        : node
    ));
  }, []);

  const handleDragStart = (type: string) => {
    setDraggedType(type);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedType || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    addNode(draggedType as keyof typeof nodeTypes, position);
    setDraggedType(null);
  };

  const handleSave = () => {
    if (!workflowName.trim()) {
      toast({
        title: "Validation Error",
        description: "Workflow name is required",
        variant: "destructive",
      });
      return;
    }

    if (nodes.length === 0) {
      toast({
        title: "Validation Error", 
        description: "At least one node is required",
        variant: "destructive",
      });
      return;
    }

    const hasTriggger = nodes.some(node => node.type === 'trigger');
    if (!hasTriggger) {
      toast({
        title: "Validation Error",
        description: "At least one trigger node is required",
        variant: "destructive",
      });
      return;
    }

    const workflowData: WorkflowData = {
      id: existingWorkflow?.id,
      name: workflowName,
      description: workflowDescription,
      nodes,
      isActive
    };

    onSave?.(workflowData);
    toast({
      title: "Workflow Saved",
      description: "Your workflow has been saved successfully",
    });
  };

  const selectedNodeData = selectedNode ? nodes.find(n => n.id === selectedNode) : null;

  return (
    <div className={cn("flex flex-col h-full bg-gray-50", className)} data-testid="advanced-workflow-builder">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center space-x-4">
          <div className="space-y-1">
            <Input
              placeholder="Workflow Name"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="font-medium"
              data-testid="input-workflow-name"
            />
            <Input
              placeholder="Description"
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              className="text-sm text-gray-600"
              data-testid="input-workflow-description"
            />
          </div>
          
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            data-testid="button-toggle-preview"
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? "Hide" : "Show"} Preview
          </Button>
          <Button
            onClick={() => setIsActive(!isActive)}
            variant={isActive ? "secondary" : "default"}
            data-testid="button-toggle-active"
          >
            {isActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isActive ? "Deactivate" : "Activate"}
          </Button>
          <Button onClick={handleSave} data-testid="button-save-workflow">
            <Save className="h-4 w-4 mr-2" />
            Save Workflow
          </Button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Node Palette */}
        <div className="w-64 bg-white border-r p-4">
          <h3 className="font-medium mb-4">Node Types</h3>
          <div className="space-y-2">
            {Object.entries(nodeTypes).map(([type, config]) => {
              const Icon = config.icon;
              return (
                <Card
                  key={type}
                  className={cn("cursor-grab transition-all hover:shadow-md", config.color)}
                  draggable
                  onDragStart={() => handleDragStart(type)}
                  data-testid={`palette-node-${type}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium capitalize">{type}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => addNode('trigger')}
                data-testid="button-add-trigger"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Trigger
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setNodes([])}
                data-testid="button-clear-canvas"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Canvas
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex">
          <div
            ref={canvasRef}
            className="flex-1 relative overflow-hidden bg-gray-50"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            data-testid="workflow-canvas"
          >
            {/* Grid Background */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: 'radial-gradient(circle, #gray-300 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            />

            {/* Workflow Nodes */}
            {nodes.map((node) => {
              const nodeConfig = nodeTypes[node.type];
              const Icon = nodeConfig.icon;
              const isSelected = selectedNode === node.id;

              return (
                <Card
                  key={node.id}
                  className={cn(
                    "absolute cursor-pointer transition-all select-none",
                    nodeConfig.color,
                    isSelected ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"
                  )}
                  style={{
                    left: node.position.x,
                    top: node.position.y,
                    width: '200px'
                  }}
                  onClick={() => setSelectedNode(node.id)}
                  data-testid={`node-${node.id}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{node.type}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNode(node.id);
                        }}
                        data-testid={`button-remove-node-${node.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs">{node.data.label}</p>
                    {node.connections.length > 0 && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {node.connections.length} connection{node.connections.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {/* Connection Lines */}
            <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
              {nodes.map((node) =>
                node.connections.map((connectionId) => {
                  const targetNode = nodes.find(n => n.id === connectionId);
                  if (!targetNode) return null;

                  return (
                    <line
                      key={`${node.id}-${connectionId}`}
                      x1={node.position.x + 100}
                      y1={node.position.y + 50}
                      x2={targetNode.position.x + 100}
                      y2={targetNode.position.y + 50}
                      stroke="#6366f1"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                  );
                })
              )}
            </svg>

            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Start Building Your Workflow</p>
                  <p className="text-sm">Drag node types from the left panel to get started</p>
                </div>
              </div>
            )}
          </div>

          {/* Node Configuration Panel */}
          {selectedNodeData && (
            <div className="w-80 bg-white border-l p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Configure Node</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedNode(null)}
                  data-testid="button-close-config"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="node-label">Label</Label>
                  <Input
                    id="node-label"
                    value={selectedNodeData.data.label}
                    onChange={(e) => updateNode(selectedNodeData.id, {
                      data: { ...selectedNodeData.data, label: e.target.value }
                    })}
                    data-testid="input-node-label"
                  />
                </div>

                <div>
                  <Label htmlFor="node-description">Description</Label>
                  <Textarea
                    id="node-description"
                    value={selectedNodeData.data.description || ''}
                    onChange={(e) => updateNode(selectedNodeData.id, {
                      data: { ...selectedNodeData.data, description: e.target.value }
                    })}
                    rows={3}
                    data-testid="textarea-node-description"
                  />
                </div>

                <div>
                  <Label htmlFor="node-type-config">Type Configuration</Label>
                  <Select
                    value={selectedNodeData.data.config.type || ''}
                    onValueChange={(value) => updateNode(selectedNodeData.id, {
                      data: { 
                        ...selectedNodeData.data, 
                        config: { ...selectedNodeData.data.config, type: value }
                      }
                    })}
                  >
                    <SelectTrigger data-testid="select-node-config-type">
                      <SelectValue placeholder={`Select ${selectedNodeData.type} type`} />
                    </SelectTrigger>
                    <SelectContent>
                      {nodeTypes[selectedNodeData.type].options.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Node Connections */}
                <div>
                  <Label>Connections</Label>
                  <ScrollArea className="h-20 border rounded p-2">
                    {selectedNodeData.connections.length === 0 ? (
                      <p className="text-xs text-gray-500">No connections</p>
                    ) : (
                      selectedNodeData.connections.map(connectionId => {
                        const connectedNode = nodes.find(n => n.id === connectionId);
                        return (
                          <div key={connectionId} className="flex items-center justify-between text-xs py-1">
                            <span>{connectedNode?.data.label || 'Unknown'}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0"
                              onClick={() => updateNode(selectedNodeData.id, {
                                connections: selectedNodeData.connections.filter(id => id !== connectionId)
                              })}
                            >
                              ×
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </ScrollArea>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Workflow Stats */}
      <div className="flex items-center justify-between p-4 bg-white border-t text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span>Nodes: {nodes.length}</span>
          <span>Triggers: {nodes.filter(n => n.type === 'trigger').length}</span>
          <span>Actions: {nodes.filter(n => n.type === 'action').length}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>Status:</span>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>
    </div>
  );
}