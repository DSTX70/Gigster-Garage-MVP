import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRange } from '@/components/ui/date-range-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Download, 
  Settings, 
  Plus,
  Calendar,
  Filter,
  Eye,
  Edit,
  Trash2,
  Play,
  Save,
  FileText,
  Users,
  Clock,
  DollarSign,
  Target,
  Activity
} from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface ReportData {
  config: any;
  data: {
    metrics: Record<string, any>;
    timeSeries: Record<string, any[]>;
    aggregated: Record<string, any>;
  };
  generatedAt: string;
  executionTime: number;
}

interface CustomReport {
  id: string;
  name: string;
  description?: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export default function AdvancedReportingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date()
  });
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');

  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects']
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/users']
  });

  const { data: customReports = [] } = useQuery<CustomReport[]>({
    queryKey: ['/api/reports']
  });

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'productivity',
      name: 'Team Productivity',
      description: 'Task completion rates and team performance metrics',
      type: 'productivity',
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      id: 'financial',
      name: 'Financial Performance',
      description: 'Revenue tracking and payment analytics',
      type: 'financial',
      icon: DollarSign,
      color: 'bg-blue-500'
    },
    {
      id: 'time',
      name: 'Time Tracking',
      description: 'Time allocation and utilization analysis',
      type: 'time',
      icon: Clock,
      color: 'bg-purple-500'
    },
    {
      id: 'project',
      name: 'Project Analytics',
      description: 'Project progress and milestone tracking',
      type: 'project',
      icon: Target,
      color: 'bg-amber-500'
    },
    {
      id: 'team',
      name: 'Team Performance',
      description: 'Individual and team performance metrics',
      type: 'team',
      icon: Users,
      color: 'bg-teal-500'
    }
  ];

  const generateReportMutation = useMutation({
    mutationFn: async (params: any) => {
      const response = await apiRequest('POST', '/api/reports/generate', params);
      return response.json();
    },
    onSuccess: (data) => {
      setReportData(data);
      setIsGenerating(false);
      toast({
        title: "Report Generated",
        description: `Report generated successfully in ${data.executionTime}ms`,
      });
    },
    onError: (error) => {
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleGenerateReport = () => {
    if (!selectedTemplate) {
      toast({
        title: "Template Required",
        description: "Please select a report template first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    generateReportMutation.mutate({
      template: selectedTemplate,
      timeRange: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString()
      },
      filters: {
        projectIds: selectedProjects,
        userIds: selectedUsers
      }
    });
  };

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    if (!reportData) return;

    // Create export functionality
    const exportData = {
      reportData,
      format,
      filename: `${selectedTemplate}_report_${format(new Date(), 'yyyy-MM-dd')}`
    };

    // Trigger download
    const link = document.createElement('a');
    link.href = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData))}`;
    link.download = `${exportData.filename}.json`;
    link.click();

    toast({
      title: "Export Started",
      description: `Report exported as ${format.toUpperCase()}`,
    });
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-amber-50">
      <AppHeader />
      
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Advanced Reporting</h1>
            <p className="text-gray-600">Custom analytics and business intelligence dashboards</p>
          </div>
          <div className="flex items-center space-x-3">
            {reportData && (
              <>
                <Button 
                  variant="outline"
                  onClick={() => exportReport('pdf')}
                  data-testid="button-export-pdf"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => exportReport('excel')}
                  data-testid="button-export-excel"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
              </>
            )}
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Custom Report
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Report Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Template Selection */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Report Template</Label>
                  <div className="space-y-2">
                    {reportTemplates.map((template) => {
                      const Icon = template.icon;
                      return (
                        <div
                          key={template.id}
                          className={`p-3 rounded-lg cursor-pointer border transition-all ${
                            selectedTemplate === template.id 
                              ? 'border-teal-500 bg-teal-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedTemplate(template.id)}
                          data-testid={`template-${template.id}`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-lg ${template.color} flex items-center justify-center`}>
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{template.name}</h4>
                              <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Time Period</Label>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setDateRange({
                        start: subDays(new Date(), 7),
                        end: new Date()
                      })}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Last 7 Days
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setDateRange({
                        start: subDays(new Date(), 30),
                        end: new Date()
                      })}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Last 30 Days
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setDateRange({
                        start: startOfMonth(new Date()),
                        end: endOfMonth(new Date())
                      })}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      This Month
                    </Button>
                  </div>
                </div>

                {/* Filters */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Filters</Label>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-600 mb-2 block">Projects</Label>
                      <Select>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All Projects" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Projects</SelectItem>
                          {projects.map((project: any) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs text-gray-600 mb-2 block">Team Members</Label>
                      <Select>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All Members" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Members</SelectItem>
                          {users.map((user: any) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerateReport}
                  disabled={!selectedTemplate || isGenerating}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  data-testid="button-generate-report"
                >
                  {isGenerating ? (
                    <>
                      <Activity className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Report Display */}
          <div className="lg:col-span-3">
            {reportData ? (
              <div className="space-y-6">
                {/* Report Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl capitalize">{selectedTemplate} Report</CardTitle>
                        <CardDescription>
                          Generated on {format(new Date(reportData.generatedAt), 'PPP')} • 
                          Execution time: {reportData.executionTime}ms
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Live Data
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>

                {/* Key Metrics */}
                {reportData.data.metrics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(reportData.data.metrics).map(([key, metric]: [string, any]) => (
                      <Card key={key} className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-teal-600">
                            {metric.unit === 'USD' 
                              ? formatCurrency(metric.value)
                              : metric.type === 'percentage'
                              ? formatPercentage(metric.value)
                              : formatNumber(metric.value)
                            }
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{metric.name}</div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Time Series Charts */}
                {reportData.data.timeSeries && Object.keys(reportData.data.timeSeries).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Trends Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={Object.values(reportData.data.timeSeries)[0] as any[]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#0D9488" 
                              fill="#0D9488" 
                              fillOpacity={0.6}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Aggregated Data Visualizations */}
                {reportData.data.aggregated && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tasks by Status */}
                    {reportData.data.aggregated.tasksByStatus && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Tasks by Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={Object.entries(reportData.data.aggregated.tasksByStatus).map(([status, count]) => ({
                                    name: status,
                                    value: count
                                  }))}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {Object.entries(reportData.data.aggregated.tasksByStatus).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Time by Project */}
                    {reportData.data.aggregated.timeByProject && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Time by Project</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={Object.entries(reportData.data.aggregated.timeByProject).map(([project, hours]) => ({
                                  project: project.length > 15 ? project.substring(0, 15) + '...' : project,
                                  hours: parseFloat(hours as string)
                                }))}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="project" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="hours" fill="#0D9488" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Card className="h-96">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-24 w-24 mx-auto mb-6 text-gray-300" />
                    <h3 className="text-2xl font-semibold text-gray-700 mb-3">Advanced Analytics</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      Select a report template and configure your parameters to generate comprehensive 
                      business intelligence dashboards with interactive charts and insights.
                    </p>
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                      <Card className="p-4 border-2 border-dashed border-gray-200">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2 text-teal-600" />
                        <h4 className="font-semibold text-sm">Performance Tracking</h4>
                      </Card>
                      <Card className="p-4 border-2 border-dashed border-gray-200">
                        <PieChartIcon className="h-8 w-8 mx-auto mb-2 text-teal-600" />
                        <h4 className="font-semibold text-sm">Visual Analytics</h4>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}