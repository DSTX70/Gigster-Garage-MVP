import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  BarChart3,
  Activity,
  Zap,
  Brain,
  Eye,
  Calendar,
  Users,
  DollarSign,
  Clock,
  Shield,
  Lightbulb,
  ArrowRight,
  FileText,
  Download,
  RefreshCw,
  Star,
  Gauge,
  AlertCircle,
  Award,
  Flame
} from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';

interface ProjectPrediction {
  projectId: string;
  projectName: string;
  currentStatus: 'on_track' | 'at_risk' | 'delayed' | 'critical';
  completion: {
    predictedDate: string;
    confidenceLevel: number;
    probabilityDistribution: {
      optimistic: string;
      likely: string;
      pessimistic: string;
    };
    daysFromOriginalPlan: number;
  };
  riskFactors: any[];
  health: {
    overallScore: number;
    budgetHealth: number;
    scheduleHealth: number;
    teamHealth: number;
    qualityHealth: number;
  };
  insights: {
    keyFindings: string[];
    recommendations: string[];
    warningSignals: string[];
    opportunities: string[];
  };
  trends: {
    velocityTrend: 'improving' | 'stable' | 'declining';
    burndownTrend: 'ahead' | 'on_track' | 'behind';
    teamProductivity: 'increasing' | 'stable' | 'decreasing';
  };
}

interface RiskFactor {
  id: string;
  type: 'technical' | 'resource' | 'schedule' | 'budget' | 'quality' | 'external';
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  impact: number;
  riskScore: number;
  title: string;
  description: string;
  mitigation: string;
  status: 'identified' | 'mitigating' | 'mitigated' | 'accepted';
}

interface TeamPerformanceMetrics {
  userId: string;
  period: string;
  productivity: {
    tasksCompleted: number;
    averageTaskTime: number;
    velocityPoints: number;
    efficiencyScore: number;
  };
  quality: {
    defectRate: number;
    reworkRate: number;
    customerSatisfaction: number;
    codeQualityScore?: number;
  };
  collaboration: {
    communicationFrequency: number;
    knowledgeSharingScore: number;
    teamSynergyIndex: number;
  };
  predictions: {
    nextPeriodProductivity: number;
    burnoutProbability: number;
    retentionProbability: number;
    skillGrowthTrend: 'rapid' | 'steady' | 'slow' | 'stagnant';
  };
}

export default function PredictiveAnalyticsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('predictions');
  const [selectedProject, setSelectedProject] = useState('all');
  const [reportDialog, setReportDialog] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('project_forecast');

  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects']
  });

  const { data: projectPredictions = [], refetch: refetchPredictions } = useQuery<ProjectPrediction[]>({
    queryKey: ['/api/predictive-analytics/project-predictions', selectedProject]
  });

  const { data: projectRisks = [] } = useQuery<RiskFactor[]>({
    queryKey: ['/api/predictive-analytics/project-risks', selectedProject]
  });

  const { data: teamPerformance = [] } = useQuery<TeamPerformanceMetrics[]>({
    queryKey: ['/api/predictive-analytics/team-performance']
  });

  const { data: marketIntelligence } = useQuery({
    queryKey: ['/api/predictive-analytics/market-intelligence']
  });

  const { data: analyticsStats } = useQuery({
    queryKey: ['/api/predictive-analytics/statistics']
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['/api/predictive-analytics/reports']
  });

  const generatePredictionsMutation = useMutation({
    mutationFn: async () => {
      const projectIds = selectedProject === 'all' ? undefined : [selectedProject];
      const response = await apiRequest('POST', '/api/predictive-analytics/generate-predictions', { projectIds });
      return response.json();
    },
    onSuccess: () => {
      refetchPredictions();
      queryClient.invalidateQueries({ queryKey: ['/api/predictive-analytics'] });
      toast({
        title: "Predictions Generated",
        description: "AI-powered project predictions have been updated",
      });
    }
  });

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/predictive-analytics/generate-report', {
        type: selectedReportType,
        parameters: {
          projectIds: selectedProject === 'all' ? undefined : [selectedProject]
        }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/predictive-analytics/reports'] });
      setReportDialog(false);
      toast({
        title: "Report Generated",
        description: "Predictive analytics report has been created",
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'bg-green-100 text-green-800 border-green-200';
      case 'at_risk': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'delayed': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
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

  const getRiskColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
      case 'increasing':
      case 'ahead':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
      case 'decreasing':
      case 'behind':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <AppHeader />
      
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Predictive Analytics</h1>
            <p className="text-gray-600">AI-powered project predictions and risk assessment</p>
          </div>
          <div className="flex items-center space-x-3">
            {analyticsStats && (
              <>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Eye className="h-3 w-3 mr-1" />
                  {analyticsStats.projects.total} projects analyzed
                </Badge>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {analyticsStats.risks.critical} critical risks
                </Badge>
              </>
            )}
            <Button 
              onClick={() => setReportDialog(true)}
              variant="outline"
              data-testid="button-generate-report"
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button 
              onClick={() => generatePredictionsMutation.mutate()}
              disabled={generatePredictionsMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
              data-testid="button-update-predictions"
            >
              {generatePredictionsMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Update Predictions
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Analytics Overview Cards */}
        {analyticsStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Project Health</p>
                    <div className="flex items-center mt-2">
                      <div className="text-2xl font-bold text-green-600">{analyticsStats.projects.onTrack}</div>
                      <div className="text-sm text-gray-500 ml-2">/ {analyticsStats.projects.total}</div>
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={(analyticsStats.projects.onTrack / analyticsStats.projects.total) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Risk Level</p>
                    <div className="flex items-center mt-2">
                      <div className="text-2xl font-bold text-red-600">{analyticsStats.risks.critical}</div>
                      <div className="text-sm text-gray-500 ml-2">critical</div>
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-xs text-gray-500">
                    {analyticsStats.risks.high} high, {analyticsStats.risks.medium} medium risks
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Team Performance</p>
                    <div className="flex items-center mt-2">
                      <div className="text-2xl font-bold text-blue-600">{analyticsStats.performance.averageEfficiency}%</div>
                      <div className="text-sm text-gray-500 ml-2">avg efficiency</div>
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-xs text-gray-500">
                    {analyticsStats.performance.highPerformers} high performers
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Prediction Accuracy</p>
                    <div className="flex items-center mt-2">
                      <div className="text-2xl font-bold text-purple-600">85%</div>
                      <div className="text-sm text-gray-500 ml-2">accuracy</div>
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Project Filter */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Analysis Scope</h3>
                <p className="text-sm text-gray-600 mt-1">Select project scope for detailed analytics</p>
              </div>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="predictions">Project Predictions</TabsTrigger>
            <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
            <TabsTrigger value="performance">Team Performance</TabsTrigger>
            <TabsTrigger value="reports">Analytics Reports</TabsTrigger>
          </TabsList>

          {/* Project Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            {projectPredictions.length === 0 ? (
              <Card className="p-12 text-center">
                <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Predictions Generated</h3>
                <p className="text-gray-500 mb-6">Generate AI-powered predictions to see project forecasts and insights</p>
                <Button 
                  onClick={() => generatePredictionsMutation.mutate()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Predictions
                </Button>
              </Card>
            ) : (
              <div className="grid gap-6">
                {projectPredictions.map((prediction) => (
                  <Card key={prediction.projectId}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center space-x-3">
                            {prediction.projectName}
                            <Badge variant="outline" className={getStatusColor(prediction.currentStatus)}>
                              {prediction.currentStatus.replace('_', ' ')}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            Predicted completion: {format(parseISO(prediction.completion.predictedDate), 'MMM d, yyyy')}
                            {prediction.completion.daysFromOriginalPlan !== 0 && (
                              <span className={prediction.completion.daysFromOriginalPlan > 0 ? 'text-red-600' : 'text-green-600'}>
                                {' '}({prediction.completion.daysFromOriginalPlan > 0 ? '+' : ''}{prediction.completion.daysFromOriginalPlan} days from plan)
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-600">{prediction.completion.confidenceLevel}%</div>
                          <div className="text-sm text-gray-500">AI Confidence</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Health Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${getHealthColor(prediction.health.overallScore)}`}>
                            {prediction.health.overallScore}%
                          </div>
                          <div className="text-xs text-gray-500">Overall Health</div>
                          <Progress value={prediction.health.overallScore} className="h-2 mt-1" />
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-semibold ${getHealthColor(prediction.health.scheduleHealth)}`}>
                            {prediction.health.scheduleHealth}%
                          </div>
                          <div className="text-xs text-gray-500">Schedule</div>
                          <Progress value={prediction.health.scheduleHealth} className="h-1 mt-1" />
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-semibold ${getHealthColor(prediction.health.budgetHealth)}`}>
                            {prediction.health.budgetHealth}%
                          </div>
                          <div className="text-xs text-gray-500">Budget</div>
                          <Progress value={prediction.health.budgetHealth} className="h-1 mt-1" />
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-semibold ${getHealthColor(prediction.health.teamHealth)}`}>
                            {prediction.health.teamHealth}%
                          </div>
                          <div className="text-xs text-gray-500">Team</div>
                          <Progress value={prediction.health.teamHealth} className="h-1 mt-1" />
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-semibold ${getHealthColor(prediction.health.qualityHealth)}`}>
                            {prediction.health.qualityHealth}%
                          </div>
                          <div className="text-xs text-gray-500">Quality</div>
                          <Progress value={prediction.health.qualityHealth} className="h-1 mt-1" />
                        </div>
                      </div>

                      {/* Trends */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="text-sm font-medium">Velocity Trend</div>
                            <div className="text-xs text-gray-500">{prediction.trends.velocityTrend}</div>
                          </div>
                          {getTrendIcon(prediction.trends.velocityTrend)}
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="text-sm font-medium">Burndown</div>
                            <div className="text-xs text-gray-500">{prediction.trends.burndownTrend}</div>
                          </div>
                          {getTrendIcon(prediction.trends.burndownTrend)}
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="text-sm font-medium">Productivity</div>
                            <div className="text-xs text-gray-500">{prediction.trends.teamProductivity}</div>
                          </div>
                          {getTrendIcon(prediction.trends.teamProductivity)}
                        </div>
                      </div>

                      {/* Insights */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Key Findings */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <Eye className="h-4 w-4 mr-2 text-blue-600" />
                            Key Findings
                          </h4>
                          <div className="space-y-2">
                            {prediction.insights.keyFindings.map((finding, index) => (
                              <div key={index} className="flex items-start p-2 bg-blue-50 rounded">
                                <ArrowRight className="h-3 w-3 text-blue-600 mt-1 mr-2 flex-shrink-0" />
                                <span className="text-sm text-blue-800">{finding}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Recommendations */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <Lightbulb className="h-4 w-4 mr-2 text-green-600" />
                            Recommendations
                          </h4>
                          <div className="space-y-2">
                            {prediction.insights.recommendations.map((rec, index) => (
                              <div key={index} className="flex items-start p-2 bg-green-50 rounded">
                                <ArrowRight className="h-3 w-3 text-green-600 mt-1 mr-2 flex-shrink-0" />
                                <span className="text-sm text-green-800">{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Warning Signals */}
                        {prediction.insights.warningSignals.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                              Warning Signals
                            </h4>
                            <div className="space-y-2">
                              {prediction.insights.warningSignals.map((warning, index) => (
                                <div key={index} className="flex items-start p-2 bg-red-50 rounded">
                                  <ArrowRight className="h-3 w-3 text-red-600 mt-1 mr-2 flex-shrink-0" />
                                  <span className="text-sm text-red-800">{warning}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Opportunities */}
                        {prediction.insights.opportunities.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                              <Star className="h-4 w-4 mr-2 text-purple-600" />
                              Opportunities
                            </h4>
                            <div className="space-y-2">
                              {prediction.insights.opportunities.map((opp, index) => (
                                <div key={index} className="flex items-start p-2 bg-purple-50 rounded">
                                  <ArrowRight className="h-3 w-3 text-purple-600 mt-1 mr-2 flex-shrink-0" />
                                  <span className="text-sm text-purple-800">{opp}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Completion Probability Distribution */}
                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Completion Probability</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-lg font-bold text-green-600">
                              {format(parseISO(prediction.completion.probabilityDistribution.optimistic), 'MMM d')}
                            </div>
                            <div className="text-sm text-green-700">Optimistic (25%)</div>
                          </div>
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-lg font-bold text-blue-600">
                              {format(parseISO(prediction.completion.probabilityDistribution.likely), 'MMM d')}
                            </div>
                            <div className="text-sm text-blue-700">Most Likely (50%)</div>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-lg font-bold text-red-600">
                              {format(parseISO(prediction.completion.probabilityDistribution.pessimistic), 'MMM d')}
                            </div>
                            <div className="text-sm text-red-700">Pessimistic (75%)</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Risk Analysis Tab */}
          <TabsContent value="risks" className="space-y-6">
            {projectRisks.length === 0 ? (
              <Card className="p-12 text-center">
                <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Risks Identified</h3>
                <p className="text-gray-500">Risk assessment will appear here once projects are analyzed</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {projectRisks.map((risk) => (
                  <Card key={risk.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h4 className="font-semibold text-lg">{risk.title}</h4>
                            <Badge variant="outline" className={getRiskColor(risk.severity)}>
                              {risk.severity}
                            </Badge>
                            <Badge variant="secondary">{risk.type}</Badge>
                            <Badge 
                              variant={risk.status === 'mitigated' ? 'default' : 'outline'}
                              className={risk.status === 'mitigated' ? 'bg-green-100 text-green-800' : ''}
                            >
                              {risk.status}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-4">{risk.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-3 bg-orange-50 rounded-lg">
                              <div className="text-2xl font-bold text-orange-600">{risk.probability}%</div>
                              <div className="text-sm text-orange-700">Probability</div>
                            </div>
                            <div className="text-center p-3 bg-red-50 rounded-lg">
                              <div className="text-2xl font-bold text-red-600">{risk.impact}%</div>
                              <div className="text-sm text-red-700">Impact</div>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                              <div className="text-2xl font-bold text-purple-600">{risk.riskScore}</div>
                              <div className="text-sm text-purple-700">Risk Score</div>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <h5 className="font-medium text-blue-900 mb-2">Mitigation Strategy</h5>
                            <p className="text-sm text-blue-800">{risk.mitigation}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Team Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            {teamPerformance.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Performance Data</h3>
                <p className="text-gray-500">Team performance analytics will appear here once data is collected</p>
              </Card>
            ) : (
              <div className="grid gap-6">
                {teamPerformance.map((member) => (
                  <Card key={member.userId}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Team Member {member.userId}</span>
                        <Badge variant="secondary">Period: {member.period}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Productivity */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Productivity</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Tasks Completed</span>
                              <span className="font-medium">{member.productivity.tasksCompleted}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Avg Task Time</span>
                              <span className="font-medium">{member.productivity.averageTaskTime.toFixed(1)}h</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Efficiency Score</span>
                              <span className={`font-medium ${getHealthColor(member.productivity.efficiencyScore)}`}>
                                {member.productivity.efficiencyScore}%
                              </span>
                            </div>
                            <Progress value={member.productivity.efficiencyScore} className="h-2" />
                          </div>
                        </div>

                        {/* Quality */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Quality</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Defect Rate</span>
                              <span className="font-medium">{member.quality.defectRate.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Rework Rate</span>
                              <span className="font-medium">{member.quality.reworkRate.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Customer Satisfaction</span>
                              <span className={`font-medium ${getHealthColor(member.quality.customerSatisfaction)}`}>
                                {member.quality.customerSatisfaction}%
                              </span>
                            </div>
                            <Progress value={member.quality.customerSatisfaction} className="h-2" />
                          </div>
                        </div>

                        {/* Collaboration */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Collaboration</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Communication</span>
                              <span className="font-medium">{member.collaboration.communicationFrequency}/day</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Knowledge Sharing</span>
                              <span className={`font-medium ${getHealthColor(member.collaboration.knowledgeSharingScore)}`}>
                                {member.collaboration.knowledgeSharingScore}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Team Synergy</span>
                              <span className={`font-medium ${getHealthColor(member.collaboration.teamSynergyIndex)}`}>
                                {member.collaboration.teamSynergyIndex}%
                              </span>
                            </div>
                            <Progress value={member.collaboration.teamSynergyIndex} className="h-2" />
                          </div>
                        </div>

                        {/* Predictions */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Predictions</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Next Period Productivity</span>
                              <span className="font-medium">{member.predictions.nextPeriodProductivity}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Burnout Risk</span>
                              <span className={`font-medium ${member.predictions.burnoutProbability > 70 ? 'text-red-600' : 'text-green-600'}`}>
                                {member.predictions.burnoutProbability}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Retention</span>
                              <span className={`font-medium ${getHealthColor(member.predictions.retentionProbability)}`}>
                                {member.predictions.retentionProbability}%
                              </span>
                            </div>
                            
                            {member.predictions.burnoutProbability > 70 && (
                              <div className="p-2 bg-red-50 rounded-lg mt-3">
                                <div className="flex items-center text-red-800">
                                  <Flame className="h-4 w-4 mr-1" />
                                  <span className="text-sm font-medium">High Burnout Risk</span>
                                </div>
                              </div>
                            )}
                            
                            {member.productivity.efficiencyScore > 90 && (
                              <div className="p-2 bg-green-50 rounded-lg mt-3">
                                <div className="flex items-center text-green-800">
                                  <Award className="h-4 w-4 mr-1" />
                                  <span className="text-sm font-medium">Top Performer</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Analytics Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Generated Reports</h3>
                <p className="text-sm text-gray-600 mt-1">Comprehensive analytics reports and insights</p>
              </div>
              <Button onClick={() => setReportDialog(true)} data-testid="button-create-report">
                <FileText className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </div>

            {reports.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Reports Generated</h3>
                <p className="text-gray-500 mb-6">Create comprehensive analytics reports to share insights</p>
                <Button onClick={() => setReportDialog(true)} className="bg-purple-600 hover:bg-purple-700">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate First Report
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {reports.map((report) => (
                  <Card key={report.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-lg">{report.title}</h4>
                            <Badge variant="outline">{report.type.replace('_', ' ')}</Badge>
                            <Badge variant="secondary">
                              <Star className="h-3 w-3 mr-1" />
                              {report.summary.confidenceScore}% confidence
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-4">
                            Generated {format(parseISO(report.generatedAt), 'MMM d, yyyy HH:mm')}
                          </p>
                          
                          <div className="mb-4">
                            <h5 className="font-medium text-gray-900 mb-2">Key Insights</h5>
                            <div className="space-y-1">
                              {report.summary.keyInsights.map((insight, index) => (
                                <div key={index} className="flex items-start">
                                  <ArrowRight className="h-3 w-3 text-blue-600 mt-1 mr-2 flex-shrink-0" />
                                  <span className="text-sm text-gray-700">{insight}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {report.summary.criticalActions.length > 0 && (
                            <div className="mb-4">
                              <h5 className="font-medium text-gray-900 mb-2">Critical Actions</h5>
                              <div className="space-y-1">
                                {report.summary.criticalActions.map((action, index) => (
                                  <div key={index} className="flex items-start">
                                    <AlertTriangle className="h-3 w-3 text-red-600 mt-1 mr-2 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">{action}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4">
                          <Button variant="outline" size="sm" data-testid={`button-download-report-${report.id}`}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Generate Report Dialog */}
        <Dialog open={reportDialog} onValueChange={setReportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-600" />
                Generate Analytics Report
              </DialogTitle>
              <DialogDescription>
                Create a comprehensive analytics report with AI-powered insights
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Report Type</label>
                <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project_forecast">Project Forecast</SelectItem>
                    <SelectItem value="risk_assessment">Risk Assessment</SelectItem>
                    <SelectItem value="team_performance">Team Performance</SelectItem>
                    <SelectItem value="market_analysis">Market Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-gray-600">
                This will generate a comprehensive report with AI-powered insights, predictions, and recommendations.
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setReportDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => generateReportMutation.mutate()}
                disabled={generateReportMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700"
                data-testid="button-create-analytics-report"
              >
                {generateReportMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate Report
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