import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Download, RefreshCw, Calendar, Target, Users, Eye, EyeOff, TrendingUp, CheckCircle, XCircle, AlertCircle, Shield } from "lucide-react";
import type { Agent, AgentVisibilityFlag, AgentGraduationPlan, AgentKpi } from "@shared/schema";
import { useHubFlags, promoteAgentToHub, ADMIN_WRITE } from "@/hooks/use-hub-flags";
import AgentExposureCards from "@/components/agent-exposure/AgentExposureCards";
import agentExposurePolicy from "../../../policy/agent_exposure_policy.json";

interface AgentWithDetails extends Agent {
  visibilityFlag?: AgentVisibilityFlag | null;
  graduationPlan?: AgentGraduationPlan | null;
  kpi?: AgentKpi | null;
}

export default function AgentManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [externalToolIds, setExternalToolIds] = useState<Record<string, string>>({});
  const [promotingAgent, setPromotingAgent] = useState<string | null>(null);

  const { data: agents, isLoading } = useQuery<AgentWithDetails[]>({
    queryKey: ["/api/agents"],
  });

  const { data: kpis } = useQuery<AgentKpi[]>({
    queryKey: ["/api/agents/kpis"],
  });

  const { data: hubFlags, loading: hubLoading, error: hubError, refresh: refreshHub } = useHubFlags(5000);

  const importDataMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/agents/import-data", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Import failed");
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Data imported successfully",
        description: `Imported ${data.agents} agents, ${data.visibilityFlags} visibility flags, and ${data.graduationPlans} graduation plans`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
    },
    onError: () => {
      toast({
        title: "Import failed",
        description: "Failed to import agent data",
        variant: "destructive",
      });
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ agentId, field, value }: { agentId: string; field: string; value: boolean }) => {
      const agent = agents?.find((a) => a.id === agentId);
      if (!agent) return;

      const updateData: any = {
        exposeToUsers: agent.visibilityFlag?.exposeToUsers || false,
        dashboardCard: agent.visibilityFlag?.dashboardCard || false,
      };
      updateData[field] = value;

      const response = await fetch(`/api/agents/${agentId}/visibility`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error("Failed to update visibility");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Visibility updated",
        description: "Agent visibility settings have been updated",
      });
    },
  });

  const handlePromote = async (agentId: string) => {
    setPromotingAgent(agentId);
    const agentName = agents?.find(a => a.id === agentId)?.name || agentId;
    const externalToolId = externalToolIds[agentId]?.trim() || undefined;
    
    try {
      const response = await fetch(`/api/agents/${agentId}/promote`, {
        method: "POST",
        credentials: "include",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      
      if (!response.ok) {
        throw new Error(`Promotion failed: ${response.statusText}`);
      }
      
      if (ADMIN_WRITE && import.meta.env.VITE_HUB_BASE_URL) {
        try {
          await promoteAgentToHub(agentId, externalToolId);
        } catch (hubError: any) {
          console.warn("Hub promotion failed (non-critical):", hubError);
        }
      }
      
      await refreshHub();
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/agents/kpis"] });
      
      toast({
        title: "Agent promoted!",
        description: `Successfully promoted ${agentName}`,
      });
    } catch (error: any) {
      toast({
        title: "Promotion failed",
        description: error.message || "Failed to promote agent",
        variant: "destructive",
      });
    } finally {
      setPromotingAgent(null);
    }
  };

  const getPhaseStatusBadge = (phase?: string) => {
    if (phase?.includes("External GA")) return "default";
    if (phase?.includes("Beta")) return "secondary";
    return "outline";
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPhaseColor = (phase?: string) => {
    if (phase?.includes("GA")) return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100";
    if (phase?.includes("Beta")) return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100";
    if (phase?.includes("Pilot")) return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100";
    return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground dark:text-foreground">Agent Management</h1>
          <p className="text-muted-foreground dark:text-muted-foreground mt-1">
            Manage internal agents, visibility flags, and graduation roadmaps
          </p>
        </div>
        <Button
          onClick={() => importDataMutation.mutate()}
          disabled={importDataMutation.isPending}
          data-testid="button-import-data"
        >
          {importDataMutation.isPending ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Import Data
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card dark:bg-card border-border dark:border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground dark:text-card-foreground">
              Total Agents
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground dark:text-card-foreground">
              {agents?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card dark:bg-card border-border dark:border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground dark:text-card-foreground">
              Exposed to Users
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground dark:text-card-foreground">
              {agents?.filter((a) => a.visibilityFlag?.exposeToUsers).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card dark:bg-card border-border dark:border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground dark:text-card-foreground">
              Graduation Plans
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground dark:text-card-foreground">
              {agents?.filter((a) => a.graduationPlan).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted dark:bg-muted" data-testid="tabs-agent-management">
          <TabsTrigger value="overview" data-testid="tab-trigger-overview">
            Overview
          </TabsTrigger>
          <TabsTrigger value="visibility" data-testid="tab-trigger-visibility">
            Visibility Controls
          </TabsTrigger>
          <TabsTrigger value="graduation" data-testid="tab-trigger-graduation">
            Graduation Roadmap
          </TabsTrigger>
          <TabsTrigger value="kpis" data-testid="tab-trigger-kpis">
            KPIs & Metrics
          </TabsTrigger>
          <TabsTrigger value="exposure-policy" data-testid="tab-trigger-exposure-policy">
            <Shield className="h-4 w-4 mr-2" />
            Exposure Policy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4" data-testid="tab-content-overview">
          <Card className="bg-card dark:bg-card border-border dark:border-border" data-testid="card-agents-overview">
            <CardHeader>
              <CardTitle className="text-card-foreground dark:text-card-foreground">All Agents</CardTitle>
              <CardDescription className="text-muted-foreground dark:text-muted-foreground">
                Complete overview of all internal agents and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border dark:border-border">
                    <TableHead className="text-foreground dark:text-foreground">Agent ID</TableHead>
                    <TableHead className="text-foreground dark:text-foreground">Name</TableHead>
                    <TableHead className="text-foreground dark:text-foreground">Status</TableHead>
                    <TableHead className="text-foreground dark:text-foreground">User Visible</TableHead>
                    <TableHead className="text-foreground dark:text-foreground">Dashboard Card</TableHead>
                    <TableHead className="text-foreground dark:text-foreground">Target Tool</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents?.map((agent) => (
                    <TableRow
                      key={agent.id}
                      data-testid={`row-agent-${agent.id}`}
                      className="border-border dark:border-border"
                    >
                      <TableCell className="font-mono text-sm text-foreground dark:text-foreground">
                        {agent.id}
                      </TableCell>
                      <TableCell className="font-medium text-foreground dark:text-foreground">
                        {agent.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">
                          {agent.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {agent.visibilityFlag?.exposeToUsers ? (
                          <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                        )}
                      </TableCell>
                      <TableCell>
                        {agent.visibilityFlag?.dashboardCard ? (
                          <Badge variant="outline">Enabled</Badge>
                        ) : (
                          <Badge variant="secondary">Disabled</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-foreground dark:text-foreground">
                        {agent.graduationPlan?.targetTool || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visibility" className="space-y-4" data-testid="tab-content-visibility">
          <Card className="bg-card dark:bg-card border-border dark:border-border" data-testid="card-visibility-controls">
            <CardHeader>
              <CardTitle className="text-card-foreground dark:text-card-foreground">
                Visibility Controls
              </CardTitle>
              <CardDescription className="text-muted-foreground dark:text-muted-foreground">
                Toggle agent visibility flags for users and dashboard cards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border dark:border-border">
                    <TableHead className="text-foreground dark:text-foreground">Agent</TableHead>
                    <TableHead className="text-foreground dark:text-foreground">Expose to Users</TableHead>
                    <TableHead className="text-foreground dark:text-foreground">Dashboard Card</TableHead>
                    <TableHead className="text-foreground dark:text-foreground">External Tool</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents?.map((agent) => (
                    <TableRow
                      key={agent.id}
                      data-testid={`visibility-row-${agent.id}`}
                      className="border-border dark:border-border"
                    >
                      <TableCell className="text-foreground dark:text-foreground">
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-sm text-muted-foreground dark:text-muted-foreground font-mono">
                            {agent.id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={agent.visibilityFlag?.exposeToUsers || false}
                          onCheckedChange={(checked) =>
                            toggleVisibilityMutation.mutate({
                              agentId: agent.id,
                              field: "exposeToUsers",
                              value: checked,
                            })
                          }
                          data-testid={`switch-expose-users-${agent.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={agent.visibilityFlag?.dashboardCard || false}
                          onCheckedChange={(checked) =>
                            toggleVisibilityMutation.mutate({
                              agentId: agent.id,
                              field: "dashboardCard",
                              value: checked,
                            })
                          }
                          data-testid={`switch-dashboard-card-${agent.id}`}
                        />
                      </TableCell>
                      <TableCell className="text-foreground dark:text-foreground">
                        {agent.visibilityFlag?.externalToolId || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="graduation" className="space-y-4" data-testid="tab-content-graduation">
          <Card className="bg-card dark:bg-card border-border dark:border-border" data-testid="card-graduation-roadmap">
            <CardHeader>
              <CardTitle className="text-card-foreground dark:text-card-foreground">
                Graduation Roadmap
              </CardTitle>
              <CardDescription className="text-muted-foreground dark:text-muted-foreground">
                Track agent graduation plans to external tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agents
                  ?.filter((a) => a.graduationPlan)
                  .map((agent) => (
                    <Card
                      key={agent.id}
                      className="bg-card dark:bg-card border-border dark:border-border"
                      data-testid={`graduation-card-${agent.id}`}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold text-foreground dark:text-foreground">
                                {agent.name}
                              </h3>
                              <Badge variant={getPhaseStatusBadge(agent.graduationPlan?.phase)}>
                                {agent.graduationPlan?.phase}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground dark:text-muted-foreground font-mono">
                              {agent.id}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Target className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                                <span className="text-foreground dark:text-foreground">
                                  {agent.graduationPlan?.targetTool}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                                <span className="text-foreground dark:text-foreground">
                                  {formatDate(agent.graduationPlan?.targetDate)}
                                </span>
                              </div>
                            </div>
                            {agent.graduationPlan?.phase && (
                              <div>
                                <Badge className={getPhaseColor(agent.graduationPlan.phase)}>
                                  {agent.graduationPlan.phase}
                                </Badge>
                              </div>
                            )}
                            {agent.graduationPlan?.graduationCriteria && (
                              <div className="mt-3 p-3 bg-muted dark:bg-muted rounded-md">
                                <p className="text-sm font-medium text-foreground dark:text-foreground mb-1">
                                  Graduation Criteria:
                                </p>
                                <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                                  {agent.graduationPlan.graduationCriteria}
                                </p>
                              </div>
                            )}
                            {agent.graduationPlan?.owner && (
                              <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                                Owner: <span className="font-medium">{agent.graduationPlan.owner}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-4" data-testid="tab-content-kpis">
          <Card className="bg-card dark:bg-card border-border dark:border-border" data-testid="card-kpis">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-card-foreground dark:text-card-foreground">
                    Agent Performance Metrics
                  </CardTitle>
                  <CardDescription className="text-muted-foreground dark:text-muted-foreground">
                    Real-time KPI tracking and promotion management
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {hubLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
                  {hubError ? (
                    <span className="text-amber-600">Hub: offline (using local data)</span>
                  ) : hubFlags ? (
                    <span className="text-green-600">Hub: live</span>
                  ) : (
                    <span>Hub: connecting...</span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border dark:border-border">
                    <TableHead className="text-foreground dark:text-foreground">Agent</TableHead>
                    <TableHead className="text-foreground dark:text-foreground">On-Time Rate</TableHead>
                    <TableHead className="text-foreground dark:text-foreground">Gate Escape</TableHead>
                    <TableHead className="text-foreground dark:text-foreground">Incidents</TableHead>
                    <TableHead className="text-foreground dark:text-foreground">Status</TableHead>
                    <TableHead className="text-foreground dark:text-foreground">External Tool</TableHead>
                    <TableHead className="text-foreground dark:text-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents?.map((agent) => {
                    const kpi = kpis?.find(k => k.agentId === agent.id);
                    const hubFlag = hubFlags?.agents[agent.id];
                    const hasGreenStatus = kpi?.status === "green" || hubFlag?.status === "green";
                    const isAlreadyPromoted = agent.visibilityFlag?.exposeToUsers || hubFlag?.expose_to_users;
                    const currentExternalTool = agent.visibilityFlag?.externalToolId || hubFlag?.external_tool_id;
                    
                    return (
                      <TableRow
                        key={agent.id}
                        data-testid={`row-kpi-${agent.id}`}
                        className="border-border dark:border-border"
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground dark:text-foreground">{agent.name}</span>
                            <span className="text-xs text-muted-foreground dark:text-muted-foreground font-mono">
                              {agent.id}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground dark:text-foreground">
                          {kpi && kpi.onTimeMilestoneRate ? (
                            <span className="font-medium text-sm">
                              {(parseFloat(kpi.onTimeMilestoneRate) * 100).toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground dark:text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-foreground dark:text-foreground">
                          {kpi && kpi.gateEscapeRate ? (
                            <span className="font-medium text-sm">
                              {(parseFloat(kpi.gateEscapeRate) * 100).toFixed(2)}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground dark:text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-foreground dark:text-foreground">
                          {kpi ? (
                            <span className="font-medium text-sm">{kpi.incidentCount30d}</span>
                          ) : (
                            <span className="text-muted-foreground dark:text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {(kpi || hubFlag) ? (
                            <Badge
                              variant={(kpi?.status || hubFlag?.status) === "green" ? "default" : (kpi?.status || hubFlag?.status) === "amber" ? "secondary" : "destructive"}
                              className="flex items-center gap-1 w-fit"
                              data-testid={`badge-status-${agent.id}`}
                            >
                              {(kpi?.status || hubFlag?.status) === "green" && <CheckCircle className="h-3 w-3" />}
                              {(kpi?.status || hubFlag?.status) === "amber" && <AlertCircle className="h-3 w-3" />}
                              {(kpi?.status || hubFlag?.status) === "red" && <XCircle className="h-3 w-3" />}
                              {(kpi?.status || hubFlag?.status || "").toUpperCase()}
                            </Badge>
                          ) : (
                            <Badge variant="outline" data-testid={`badge-status-${agent.id}`}>
                              NO DATA
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {currentExternalTool ? (
                            <span className="text-sm font-medium text-foreground dark:text-foreground">
                              {currentExternalTool}
                            </span>
                          ) : !isAlreadyPromoted && ADMIN_WRITE ? (
                            <Input
                              className="max-w-[160px] h-8 text-xs"
                              placeholder="e.g. ShipBot"
                              value={externalToolIds[agent.id] || ""}
                              onChange={(e) =>
                                setExternalToolIds((m) => ({ ...m, [agent.id]: e.target.value }))
                              }
                              data-testid={`input-external-tool-${agent.id}`}
                            />
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isAlreadyPromoted ? (
                            <Badge variant="default" className="bg-green-600 dark:bg-green-700">
                              <Eye className="h-3 w-3 mr-1" />
                              Promoted
                            </Badge>
                          ) : hasGreenStatus ? (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handlePromote(agent.id)}
                              disabled={promotingAgent === agent.id}
                              data-testid={`button-promote-${agent.id}`}
                              className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                            >
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {promotingAgent === agent.id ? "Promoting..." : "Promote"}
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground dark:text-muted-foreground">
                              Criteria not met
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              <div className="mt-6 p-4 bg-muted dark:bg-muted rounded-md">
                <h4 className="text-sm font-semibold text-foreground dark:text-foreground mb-2">
                  Graduation Criteria
                </h4>
                <ul className="text-sm text-muted-foreground dark:text-muted-foreground space-y-1">
                  <li>• On-Time Milestone Rate ≥ 95%</li>
                  <li>• Gate Escape Rate ≤ 1%</li>
                  <li>• Zero incidents in last 30 days</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exposure-policy" className="space-y-4" data-testid="tab-content-exposure-policy">
          <Card className="bg-card dark:bg-card border-border dark:border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground dark:text-card-foreground flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Agent Exposure Policy
              </CardTitle>
              <CardDescription className="text-muted-foreground dark:text-muted-foreground">
                Policy-based agent governance with autonomy levels (L0/L1), exposure rules, and promotion criteria.
                Agents require specific policy gates to be implemented before exposure to users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Active Policy Gates
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["plan_enforcement", "privacy_center", "audit_ui", "rate_limits"].map((gate) => (
                    <Badge key={gate} variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-700">
                      {gate}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                  Policy gates marked as active have been implemented in the system. Agents require all their specified gates to be active before promotion.
                </p>
              </div>

              <AgentExposureCards
                policy={agentExposurePolicy}
                flags={hubFlags ? { agents: hubFlags.agents } : undefined}
                activePolicyGates={["plan_enforcement", "privacy_center", "audit_ui", "rate_limits"]}
                onPromote={handlePromote}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
