import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  Download,
  Flame,
  Gauge,
  HardDrive,
  MemoryStick,
  RefreshCw,
  Server,
  Shield,
  TrendingUp,
  TrendingDown,
  Zap,
  BarChart3,
  Eye,
  Settings,
  Trash2,
  Key,
  Search,
  Timer
} from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';

interface PerformanceMetrics {
  timestamp: number;
  responseTime: {
    average: number;
    p50: number;
    p95: number;
    p99: number;
    min: number;
    max: number;
  };
  throughput: {
    requestsPerSecond: number;
    requestsPerMinute: number;
    totalRequests: number;
    errorRate: number;
  };
  resources: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkIO: number;
  };
  database: {
    queryTime: number;
    connectionPool: number;
    activeQueries: number;
    slowQueries: number;
  };
  cache: {
    hitRate: number;
    missRate: number;
    evictionRate: number;
    memoryUsage: number;
  };
  errors: {
    total: number;
    rate: number;
    byStatusCode: Record<string, number>;
    byEndpoint: Record<string, number>;
  };
}

interface Alert {
  id: string;
  type: 'performance' | 'error' | 'resource' | 'availability';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  metric: string;
  threshold: number;
  currentValue: number;
  timestamp: number;
  resolved: boolean;
  resolvedAt?: number;
}

interface CacheStats {
  totalKeys: number;
  usedMemory: number;
  hitRate: number;
  missRate: number;
  evictionCount: number;
  operationsPerSecond: number;
  averageResponseTime: number;
}

export default function PerformanceDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('60'); // minutes
  const [showCacheDialog, setShowCacheDialog] = useState(false);
  const [cachePattern, setCachePattern] = useState('*');
  const [cacheTags, setCacheTags] = useState('');

  const { data: currentMetrics } = useQuery<PerformanceMetrics>({
    queryKey: ['/api/performance/metrics'],
    refetchInterval: 5000 // Update every 5 seconds
  });

  const { data: historicalMetrics = [] } = useQuery<PerformanceMetrics[]>({
    queryKey: ['/api/performance/metrics/history', timeRange],
    refetchInterval: 30000 // Update every 30 seconds
  });

  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ['/api/performance/alerts'],
    refetchInterval: 10000 // Update every 10 seconds
  });

  const { data: performanceSummary } = useQuery({
    queryKey: ['/api/performance/summary'],
    refetchInterval: 30000
  });

  const { data: cacheStats } = useQuery<CacheStats>({
    queryKey: ['/api/cache/stats'],
    refetchInterval: 10000
  });

  const { data: cacheKeys } = useQuery({
    queryKey: ['/api/cache/keys', cachePattern],
    enabled: showCacheDialog
  });

  const resolveAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await apiRequest('POST', `/api/performance/alerts/${alertId}/resolve`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/performance/alerts'] });
      toast({
        title: "Alert Resolved",
        description: "Performance alert has been resolved",
      });
    }
  });

  const flushCacheMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/cache/flush', {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cache'] });
      toast({
        title: "Cache Flushed",
        description: "All cache entries have been cleared",
      });
    }
  });

  const invalidateCacheMutation = useMutation({
    mutationFn: async () => {
      const body: any = {};
      if (cachePattern && cachePattern !== '*') {
        body.pattern = cachePattern;
      }
      if (cacheTags.trim()) {
        body.tags = cacheTags.split(',').map(t => t.trim());
      }
      
      const response = await apiRequest('POST', '/api/cache/invalidate', body);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/cache'] });
      setShowCacheDialog(false);
      toast({
        title: "Cache Invalidated",
        description: data.message,
      });
    }
  });

  const exportMetricsMutation = useMutation({
    mutationFn: async (format: 'json' | 'prometheus') => {
      const response = await fetch(`/api/performance/export?format=${format}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-metrics.${format === 'prometheus' ? 'txt' : 'json'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast({
        title: "Export Complete",
        description: "Performance metrics have been exported",
      });
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-green-500';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Prepare chart data
  const responseTimeChartData = historicalMetrics.map(m => ({
    time: format(new Date(m.timestamp), 'HH:mm'),
    average: m.responseTime.average,
    p95: m.responseTime.p95,
    p99: m.responseTime.p99
  }));

  const throughputChartData = historicalMetrics.map(m => ({
    time: format(new Date(m.timestamp), 'HH:mm'),
    rps: m.throughput.requestsPerSecond,
    errorRate: m.errors.rate
  }));

  const resourceChartData = historicalMetrics.map(m => ({
    time: format(new Date(m.timestamp), 'HH:mm'),
    cpu: m.resources.cpuUsage,
    memory: m.resources.memoryUsage,
    disk: m.resources.diskUsage
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <AppHeader />
      
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Performance Dashboard</h1>
            <p className="text-gray-600">Real-time system performance monitoring and optimization</p>
          </div>
          <div className="flex items-center space-x-3">
            {performanceSummary && (
              <>
                <Badge variant="secondary" className={`${
                  performanceSummary.health.status === 'healthy' ? 'bg-green-100 text-green-800' :
                  performanceSummary.health.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  <Activity className="h-3 w-3 mr-1" />
                  {performanceSummary.health.status}
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Gauge className="h-3 w-3 mr-1" />
                  Health: {performanceSummary.health.score}%
                </Badge>
              </>
            )}
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30m</SelectItem>
                <SelectItem value="60">1h</SelectItem>
                <SelectItem value="180">3h</SelectItem>
                <SelectItem value="360">6h</SelectItem>
                <SelectItem value="720">12h</SelectItem>
                <SelectItem value="1440">24h</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => exportMetricsMutation.mutate('json')}
              variant="outline"
              size="sm"
              data-testid="button-export-metrics"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics Overview */}
        {currentMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Response Time</p>
                    <div className="text-2xl font-bold text-blue-600">{Math.round(currentMetrics.responseTime.average)}ms</div>
                    <p className="text-xs text-gray-500">P95: {Math.round(currentMetrics.responseTime.p95)}ms</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Throughput</p>
                    <div className="text-2xl font-bold text-green-600">{currentMetrics.throughput.requestsPerSecond.toFixed(1)}</div>
                    <p className="text-xs text-gray-500">req/sec</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Zap className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Error Rate</p>
                    <div className={`text-2xl font-bold ${currentMetrics.errors.rate > 5 ? 'text-red-600' : 'text-green-600'}`}>
                      {currentMetrics.errors.rate.toFixed(2)}%
                    </div>
                    <p className="text-xs text-gray-500">{currentMetrics.errors.total} errors</p>
                  </div>
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                    currentMetrics.errors.rate > 5 ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    <AlertTriangle className={`h-6 w-6 ${currentMetrics.errors.rate > 5 ? 'text-red-600' : 'text-green-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cache Hit Rate</p>
                    <div className={`text-2xl font-bold ${getHealthColor(currentMetrics.cache.hitRate)}`}>
                      {currentMetrics.cache.hitRate.toFixed(1)}%
                    </div>
                    <p className="text-xs text-gray-500">cache performance</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Database className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                Active Alerts ({alerts.filter(a => !a.resolved).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.filter(a => !a.resolved).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <h4 className="font-semibold">{alert.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                      <div className="text-xs text-gray-500">
                        Current: {alert.currentValue.toFixed(2)} | Threshold: {alert.threshold} | 
                        Triggered: {format(new Date(alert.timestamp), 'MMM d, HH:mm')}
                      </div>
                    </div>
                    <Button
                      onClick={() => resolveAlertMutation.mutate(alert.id)}
                      disabled={resolveAlertMutation.isPending}
                      size="sm"
                      variant="outline"
                      data-testid={`button-resolve-alert-${alert.id}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Resolve
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">System Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
            <TabsTrigger value="cache">Cache Management</TabsTrigger>
            <TabsTrigger value="alerts">Alert History</TabsTrigger>
          </TabsList>

          {/* System Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {currentMetrics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Resource Utilization */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Server className="h-5 w-5 mr-2" />
                      Resource Utilization
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium flex items-center">
                            <Cpu className="h-4 w-4 mr-2" />
                            CPU Usage
                          </span>
                          <span className={`font-medium ${getHealthColor(100 - currentMetrics.resources.cpuUsage)}`}>
                            {currentMetrics.resources.cpuUsage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={currentMetrics.resources.cpuUsage} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium flex items-center">
                            <MemoryStick className="h-4 w-4 mr-2" />
                            Memory Usage
                          </span>
                          <span className={`font-medium ${getHealthColor(100 - currentMetrics.resources.memoryUsage)}`}>
                            {currentMetrics.resources.memoryUsage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={currentMetrics.resources.memoryUsage} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium flex items-center">
                            <HardDrive className="h-4 w-4 mr-2" />
                            Disk Usage
                          </span>
                          <span className={`font-medium ${getHealthColor(100 - currentMetrics.resources.diskUsage)}`}>
                            {currentMetrics.resources.diskUsage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={currentMetrics.resources.diskUsage} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Database Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Database className="h-5 w-5 mr-2" />
                      Database Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{Math.round(currentMetrics.database.queryTime)}ms</div>
                        <div className="text-sm text-gray-600">Avg Query Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{currentMetrics.database.connectionPool}</div>
                        <div className="text-sm text-gray-600">Connections</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{currentMetrics.database.activeQueries}</div>
                        <div className="text-sm text-gray-600">Active Queries</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${currentMetrics.database.slowQueries > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {currentMetrics.database.slowQueries}
                        </div>
                        <div className="text-sm text-gray-600">Slow Queries</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Resource Usage Chart */}
            {resourceChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Resource Usage Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={resourceChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="cpu" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="memory" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="disk" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Performance Metrics Tab */}
          <TabsContent value="performance" className="space-y-6">
            {/* Response Time Chart */}
            {responseTimeChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Response Time Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={responseTimeChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="average" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="p95" stroke="#f59e0b" strokeWidth={2} />
                      <Line type="monotone" dataKey="p99" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Throughput & Error Rate Chart */}
            {throughputChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Throughput & Error Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={throughputChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="rps" stroke="#10b981" strokeWidth={2} />
                      <Line yAxisId="right" type="monotone" dataKey="errorRate" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Cache Management Tab */}
          <TabsContent value="cache" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Cache Management</h3>
                <p className="text-sm text-gray-600 mt-1">Monitor and manage application cache performance</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setShowCacheDialog(true)}
                  variant="outline"
                  data-testid="button-invalidate-cache"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Invalidate
                </Button>
                <Button
                  onClick={() => flushCacheMutation.mutate()}
                  disabled={flushCacheMutation.isPending}
                  variant="destructive"
                  data-testid="button-flush-cache"
                >
                  <Flame className="h-4 w-4 mr-2" />
                  Flush All
                </Button>
              </div>
            </div>

            {/* Cache Statistics */}
            {cacheStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Key className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                    <div className="text-2xl font-bold text-blue-600">{cacheStats.totalKeys.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Keys</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <MemoryStick className="h-8 w-8 mx-auto mb-3 text-green-600" />
                    <div className="text-2xl font-bold text-green-600">{formatBytes(cacheStats.usedMemory)}</div>
                    <div className="text-sm text-gray-600">Memory Used</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <Eye className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                    <div className={`text-2xl font-bold ${getHealthColor(cacheStats.hitRate)}`}>
                      {cacheStats.hitRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Hit Rate</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <Timer className="h-8 w-8 mx-auto mb-3 text-orange-600" />
                    <div className="text-2xl font-bold text-orange-600">{cacheStats.operationsPerSecond.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Ops/Sec</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Cache Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Cache Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-2">Hit vs Miss Rate</div>
                    {cacheStats && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Hits</span>
                          <span className="text-green-600 font-medium">{cacheStats.hitRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={cacheStats.hitRate} className="h-3" />
                        <div className="flex justify-between">
                          <span>Misses</span>
                          <span className="text-red-600 font-medium">{cacheStats.missRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={cacheStats.missRate} className="h-3" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-2">Performance Metrics</div>
                    {cacheStats && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Avg Response Time</span>
                          <span className="font-medium">{cacheStats.averageResponseTime.toFixed(2)}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Evictions</span>
                          <span className="font-medium">{cacheStats.evictionCount}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alert History Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alert History</CardTitle>
                <CardDescription>
                  All performance alerts including resolved ones
                </CardDescription>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Alerts</h3>
                    <p className="text-gray-500">System is performing well with no alerts triggered</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <div key={alert.id} className={`p-4 border rounded-lg ${
                        alert.resolved ? 'bg-gray-50' : 'bg-white'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <h4 className={`font-semibold ${alert.resolved ? 'text-gray-600' : 'text-gray-900'}`}>
                                {alert.title}
                              </h4>
                              {alert.resolved && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  Resolved
                                </Badge>
                              )}
                            </div>
                            <p className={`text-sm mb-2 ${alert.resolved ? 'text-gray-500' : 'text-gray-600'}`}>
                              {alert.description}
                            </p>
                            <div className="text-xs text-gray-400">
                              Triggered: {format(new Date(alert.timestamp), 'MMM d, yyyy HH:mm')} |
                              Current: {alert.currentValue.toFixed(2)} | Threshold: {alert.threshold}
                              {alert.resolvedAt && (
                                <> | Resolved: {format(new Date(alert.resolvedAt), 'MMM d, yyyy HH:mm')}</>
                              )}
                            </div>
                          </div>
                          {!alert.resolved && (
                            <Button
                              onClick={() => resolveAlertMutation.mutate(alert.id)}
                              disabled={resolveAlertMutation.isPending}
                              size="sm"
                              variant="outline"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Cache Invalidation Dialog */}
        <Dialog open={showCacheDialog} onOpenChange={setShowCacheDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Trash2 className="h-5 w-5 mr-2 text-red-600" />
                Invalidate Cache
              </DialogTitle>
              <DialogDescription>
                Remove specific cache entries by pattern or tags
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Pattern (optional)</Label>
                <Input
                  value={cachePattern}
                  onChange={(e) => setCachePattern(e.target.value)}
                  placeholder="user:* or task:123 or leave * for all"
                />
                <p className="text-xs text-gray-500 mt-1">Use * for wildcards</p>
              </div>

              <div>
                <Label>Tags (optional)</Label>
                <Input
                  value={cacheTags}
                  onChange={(e) => setCacheTags(e.target.value)}
                  placeholder="user-data,project-data"
                />
                <p className="text-xs text-gray-500 mt-1">Comma-separated tag list</p>
              </div>

              {cacheKeys && (
                <div>
                  <Label>Matching Keys ({cacheKeys.total})</Label>
                  <div className="max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
                    {cacheKeys.keys.slice(0, 20).map((key: string) => (
                      <div key={key} className="text-xs text-gray-600 font-mono">{key}</div>
                    ))}
                    {cacheKeys.total > 20 && (
                      <div className="text-xs text-gray-500 mt-1">...and {cacheKeys.total - 20} more</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowCacheDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => invalidateCacheMutation.mutate()}
                disabled={invalidateCacheMutation.isPending || (!cachePattern && !cacheTags.trim())}
                variant="destructive"
                data-testid="button-confirm-invalidate"
              >
                {invalidateCacheMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Invalidating...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Invalidate
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}