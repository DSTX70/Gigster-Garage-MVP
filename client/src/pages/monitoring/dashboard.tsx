import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Zap,
  Loader2,
  XCircle,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface SLOMetrics {
  errorRate: number;
  queueAge: number;
  rateLimitSaturation: Array<{ platform: string; pct: number }>;
}

interface QueueStats {
  total: number;
  queued: number;
  posting: number;
  posted: number;
  failed: number;
  paused: number;
}

interface SystemHealth {
  status: "healthy" | "degraded" | "critical";
  uptime: number;
  lastCheck: string;
}

export default function MonitoringDashboard() {
  const [refreshInterval, setRefreshInterval] = useState(30000);

  const { data: sloMetrics, isLoading: sloLoading } = useQuery<SLOMetrics>({
    queryKey: ["/api/ops/metrics/slo"],
    refetchInterval: refreshInterval,
  });

  const { data: queueStats, isLoading: queueLoading } = useQuery<QueueStats>({
    queryKey: ["/api/ops/social-queue/stats"],
    refetchInterval: refreshInterval,
  });

  const { data: systemHealth } = useQuery<SystemHealth>({
    queryKey: ["/api/ops/health"],
    refetchInterval: refreshInterval,
  });

  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 dark:text-green-500";
      case "degraded":
        return "text-yellow-600 dark:text-yellow-500";
      case "critical":
        return "text-red-600 dark:text-red-500";
      default:
        return "text-gray-600 dark:text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />;
      case "critical":
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600 dark:text-gray-500" />;
    }
  };

  const getSLOStatus = (metric: string, value: number) => {
    if (metric === "errorRate" && value > 5) return "critical";
    if (metric === "queueAge" && value > 30) return "critical";
    if (metric === "errorRate" && value > 2) return "degraded";
    if (metric === "queueAge" && value > 15) return "degraded";
    return "healthy";
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const rateLimitData = (sloMetrics?.rateLimitSaturation || []).map(({ platform, pct }) => ({
    name: platform.toUpperCase(),
    usage: pct || 0,
    available: 100 - (pct || 0),
  }));

  const queueDistribution = [
    { name: "Queued", value: queueStats?.queued || 0, fill: "#3b82f6" },
    { name: "Posting", value: queueStats?.posting || 0, fill: "#f59e0b" },
    { name: "Posted", value: queueStats?.posted || 0, fill: "#10b981" },
    { name: "Failed", value: queueStats?.failed || 0, fill: "#ef4444" },
    { name: "Paused", value: queueStats?.paused || 0, fill: "#6b7280" },
  ];

  if (sloLoading || queueLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!sloMetrics || !queueStats) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Monitoring Dashboard</CardTitle>
            <CardDescription>Unable to load metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 text-muted-foreground">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <p>Metrics are currently unavailable. The system may be starting up or experiencing issues.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">System Monitoring</h1>
          <p className="text-muted-foreground">Real-time metrics and service health</p>
        </div>
        {systemHealth && (
          <div className="flex items-center gap-3">
            {getStatusIcon(systemHealth.status)}
            <div>
              <p className={`font-semibold ${getHealthColor(systemHealth.status)}`}>
                {systemHealth.status.toUpperCase()}
              </p>
              <p className="text-xs text-muted-foreground">
                Uptime: {formatUptime(systemHealth.uptime)}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card data-testid="card-error-rate">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Error Rate (Hourly)
              <Badge variant={getSLOStatus("errorRate", sloMetrics?.errorRate || 0) === "healthy" ? "default" : "destructive"}>
                SLO
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(sloMetrics?.errorRate ?? 0).toFixed(2)}%
            </div>
            <Progress
              value={Math.min((sloMetrics?.errorRate ?? 0) * 20, 100)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Threshold: 5% • Status: {getSLOStatus("errorRate", sloMetrics?.errorRate ?? 0)}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-queue-age">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Max Queue Age
              <Badge variant={getSLOStatus("queueAge", sloMetrics?.queueAge || 0) === "healthy" ? "default" : "destructive"}>
                SLO
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-baseline gap-2">
              {(sloMetrics?.queueAge ?? 0).toFixed(1)}
              <span className="text-lg text-muted-foreground">min</span>
            </div>
            <Progress
              value={Math.min((sloMetrics?.queueAge ?? 0) / 30 * 100, 100)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Threshold: 30 min • Status: {getSLOStatus("queueAge", sloMetrics?.queueAge ?? 0)}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-queue-total">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Queue Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{queueStats?.total || 0}</div>
            <div className="flex gap-3 mt-3 text-xs">
              <span className="text-green-600 dark:text-green-500">✓ {queueStats?.posted || 0}</span>
              <span className="text-blue-600 dark:text-blue-500">⟳ {queueStats?.queued || 0}</span>
              <span className="text-red-600 dark:text-red-500">✗ {queueStats?.failed || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rate-limits" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rate-limits" data-testid="tab-rate-limits">
            <Zap className="h-4 w-4 mr-2" />
            Rate Limits
          </TabsTrigger>
          <TabsTrigger value="queue" data-testid="tab-queue">
            <Clock className="h-4 w-4 mr-2" />
            Queue Status
          </TabsTrigger>
          <TabsTrigger value="trends" data-testid="tab-trends">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rate-limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rate Limit Saturation by Platform</CardTitle>
              <CardDescription>
                Current usage across all platforms (Alert threshold: 90%)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={rateLimitData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="usage" fill="#3b82f6" name="Used %" />
                  <Bar dataKey="available" fill="#e5e7eb" name="Available %" />
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {(sloMetrics?.rateLimitSaturation || []).map(({ platform, pct }) => (
                  <div key={platform} className="p-3 border rounded-lg">
                    <p className="text-sm font-medium mb-1">{platform.toUpperCase()}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">{pct ?? 0}%</span>
                      {pct > 90 && <Badge variant="destructive">High</Badge>}
                      {pct > 70 && pct <= 90 && <Badge variant="secondary">Medium</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Queue Distribution</CardTitle>
              <CardDescription>Breakdown of posts by status</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={queueDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                {queueDistribution.map((item) => (
                  <div key={item.name} className="p-3 border rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">{item.name}</p>
                    <p className="text-2xl font-bold" style={{ color: item.fill }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historical Trends</CardTitle>
              <CardDescription>Coming soon - 24h performance trends</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Historical trend data will be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">Auto-refresh Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[10, 30, 60].map((seconds) => (
              <Badge
                key={seconds}
                variant={refreshInterval === seconds * 1000 ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setRefreshInterval(seconds * 1000)}
                data-testid={`badge-refresh-${seconds}`}
              >
                {seconds}s
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
