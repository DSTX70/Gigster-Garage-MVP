import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  Lightbulb,
  BarChart3,
  Activity,
  Zap,
  Brain,
  Cpu,
  RefreshCw,
  Settings,
  Play,
  User,
  Timer,
  Star,
  ArrowRight,
  Gauge,
  AlertCircle
} from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, parseISO } from 'date-fns';

interface ScheduledTask {
  taskId: string;
  title: string;
  description: string;
  estimatedHours: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dependencies: string[];
  requiredSkills: string[];
  assignedUser?: string;
  scheduledStart: string;
  scheduledEnd: string;
  confidence: number;
  reasoning: string;
  alternativeSlots?: Array<{
    start: string;
    end: string;
    confidence: number;
    reasoning: string;
  }>;
}

interface ResourceAllocation {
  userId: string;
  userName: string;
  availability: {
    totalHours: number;
    allocatedHours: number;
    remainingHours: number;
  };
  skills: string[];
  currentWorkload: number;
  assignments: ScheduledTask[];
}

interface SchedulingRecommendation {
  id: string;
  type: 'schedule_optimization' | 'resource_reallocation' | 'deadline_adjustment' | 'workload_balancing';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: {
    timelineSaving: number;
    costSaving?: number;
    qualityImprovement?: number;
    riskReduction?: number;
  };
  actionRequired: string;
  affectedTasks: string[];
  affectedUsers: string[];
  implementationSteps: string[];
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'implemented';
}

interface WorkloadPrediction {
  userId: string;
  userName: string;
  currentPeriod: {
    utilization: number;
    overallocation: number;
    burnoutRisk: number;
    productivityTrend: 'increasing' | 'stable' | 'decreasing';
  };
  nextWeek: {
    predictedUtilization: number;
    predictedOverallocation: number;
    predictedBurnoutRisk: number;
  };
  nextMonth: {
    predictedUtilization: number;
    predictedOverallocation: number;
    predictedBurnoutRisk: number;
  };
  recommendations: string[];
}

export default function SmartSchedulingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedProject, setSelectedProject] = useState('all');
  const [schedulingContext, setSchedulingContext] = useState({
    timeframe: {
      start: format(new Date(), 'yyyy-MM-dd'),
      end: format(addDays(new Date(), 30), 'yyyy-MM-dd')
    },
    constraints: {
      workingHours: { start: '09:00', end: '17:00' },
      workingDays: [1, 2, 3, 4, 5],
      maxHoursPerDay: 8
    }
  });
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects']
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/tasks']
  });

  const { data: scheduleData, refetch: refetchSchedule } = useQuery({
    queryKey: ['/api/smart-scheduling/schedule', selectedProject],
    enabled: false
  });

  const { data: workloadPredictions = [] } = useQuery<WorkloadPrediction[]>({
    queryKey: ['/api/smart-scheduling/workload-predictions']
  });

  const { data: recommendations = [] } = useQuery<SchedulingRecommendation[]>({
    queryKey: ['/api/smart-scheduling/recommendations']
  });

  const { data: statistics } = useQuery({
    queryKey: ['/api/smart-scheduling/statistics']
  });

  const generateScheduleMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      const filteredTasks = selectedProject === 'all' ? tasks : tasks.filter(t => t.projectId === selectedProject);
      
      const response = await apiRequest('POST', '/api/smart-scheduling/generate', {
        tasks: filteredTasks,
        context: {
          projectId: selectedProject !== 'all' ? selectedProject : undefined,
          timeframe: schedulingContext.timeframe,
          constraints: schedulingContext.constraints,
          priorities: {
            urgentDeadlines: true,
            teamAvailability: true,
            taskDependencies: true,
            resourceOptimization: true,
            workloadBalancing: true
          }
        }
      });
      return response.json();
    },
    onSuccess: (data) => {
      setIsGenerating(false);
      setShowScheduleDialog(false);
      refetchSchedule();
      queryClient.invalidateQueries({ queryKey: ['/api/smart-scheduling'] });
      toast({
        title: "AI Schedule Generated",
        description: `Optimized schedule for ${data.scheduledTasks.length} tasks with ${Math.round(data.confidence)}% confidence`,
      });
    },
    onError: (error) => {
      setIsGenerating(false);
      toast({
        title: "Schedule Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const applyRecommendationMutation = useMutation({
    mutationFn: async (recommendationId: string) => {
      const response = await apiRequest('POST', `/api/smart-scheduling/recommendations/${recommendationId}/apply`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/smart-scheduling'] });
      toast({
        title: "Recommendation Applied",
        description: "Scheduling optimization has been implemented",
      });
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getWorkloadColor = (workload: number) => {
    if (workload > 100) return 'text-red-600';
    if (workload > 90) return 'text-orange-600';
    if (workload > 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'stable': return <Activity className="h-4 w-4 text-blue-600" />;
      case 'decreasing': return <TrendingUp className="h-4 w-4 text-red-600 transform rotate-180" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <AppHeader />
      
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Smart Scheduling</h1>
            <p className="text-gray-600">AI-powered task scheduling and resource optimization</p>
          </div>
          <div className="flex items-center space-x-3">
            {statistics && (
              <>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  <Bot className="h-3 w-3 mr-1" />
                  {statistics.activeRecommendations} active insights
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {statistics.implementedRecommendations} optimizations applied
                </Badge>
              </>
            )}
            <Button 
              onClick={() => setShowScheduleDialog(true)}
              className="bg-purple-600 hover:bg-purple-700"
              data-testid="button-generate-schedule"
            >
              <Brain className="h-4 w-4 mr-2" />
              Generate AI Schedule
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="schedule">AI Schedule</TabsTrigger>
            <TabsTrigger value="workload">Workload Analysis</TabsTrigger>
            <TabsTrigger value="recommendations">AI Insights</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* AI Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            {/* Project Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Project Scope</Label>
                    <p className="text-sm text-gray-600 mt-1">Select project for AI scheduling optimization</p>
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

            {/* Schedule Results */}
            {scheduleData ? (
              <div className="grid gap-6">
                {/* Schedule Overview */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <Cpu className="h-5 w-5 mr-2 text-purple-600" />
                          AI-Generated Schedule
                        </CardTitle>
                        <CardDescription>
                          Completion by {format(parseISO(scheduleData.estimatedCompletionDate), 'MMM d, yyyy')}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{scheduleData.scheduledTasks.length}</div>
                          <div className="text-xs text-gray-500">Tasks Scheduled</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{scheduleData.totalEstimatedHours}h</div>
                          <div className="text-xs text-gray-500">Total Hours</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${getConfidenceColor(scheduleData.confidence)}`}>
                            {Math.round(scheduleData.confidence)}%
                          </div>
                          <div className="text-xs text-gray-500">AI Confidence</div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {scheduleData.scheduledTasks.map((task: ScheduledTask) => (
                        <div key={task.taskId} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-semibold">{task.title}</h4>
                                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                  {task.priority}
                                </Badge>
                                <Badge variant="secondary">
                                  <Timer className="h-3 w-3 mr-1" />
                                  {task.estimatedHours}h
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{task.reasoning}</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <Label className="text-xs text-gray-500">Scheduled Start</Label>
                                  <div className="font-medium">
                                    {format(parseISO(task.scheduledStart), 'MMM d, HH:mm')}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs text-gray-500">Scheduled End</Label>
                                  <div className="font-medium">
                                    {format(parseISO(task.scheduledEnd), 'MMM d, HH:mm')}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs text-gray-500">Assigned To</Label>
                                  <div className="font-medium flex items-center">
                                    <User className="h-3 w-3 mr-1" />
                                    {task.assignedUser || 'Unassigned'}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs text-gray-500">AI Confidence</Label>
                                  <div className={`font-medium ${getConfidenceColor(task.confidence)}`}>
                                    {Math.round(task.confidence)}%
                                  </div>
                                </div>
                              </div>
                              {task.requiredSkills.length > 0 && (
                                <div className="mt-3">
                                  <Label className="text-xs text-gray-500">Required Skills</Label>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {task.requiredSkills.map((skill) => (
                                      <Badge key={skill} variant="outline" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Resource Allocations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-blue-600" />
                      Resource Allocation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {scheduleData.resourceAllocations.map((allocation: ResourceAllocation) => (
                        <div key={allocation.userId} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div>
                                <h4 className="font-semibold">{allocation.userName}</h4>
                                <p className="text-sm text-gray-600">
                                  {allocation.assignments.length} tasks assigned
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-lg font-bold ${getWorkloadColor(allocation.currentWorkload)}`}>
                                {Math.round(allocation.currentWorkload)}%
                              </div>
                              <p className="text-xs text-gray-500">Workload</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Allocated: {allocation.availability.allocatedHours}h</span>
                              <span>Available: {allocation.availability.remainingHours}h</span>
                            </div>
                            <Progress 
                              value={allocation.currentWorkload} 
                              className="h-2"
                            />
                          </div>

                          {allocation.skills.length > 0 && (
                            <div className="mt-3">
                              <Label className="text-xs text-gray-500">Skills</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {allocation.skills.map((skill) => (
                                  <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No AI Schedule Generated</h3>
                <p className="text-gray-500 mb-6">Generate an AI-powered schedule to optimize your team's productivity</p>
                <Button 
                  onClick={() => setShowScheduleDialog(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Smart Schedule
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Workload Analysis Tab */}
          <TabsContent value="workload" className="space-y-6">
            {workloadPredictions.length === 0 ? (
              <Card className="p-12 text-center">
                <Gauge className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Workload Data</h3>
                <p className="text-gray-500">Workload predictions will appear here once team activity is tracked</p>
              </Card>
            ) : (
              <div className="grid gap-6">
                {workloadPredictions.map((prediction) => (
                  <Card key={prediction.userId}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div>
                            <CardTitle className="flex items-center">
                              <User className="h-5 w-5 mr-2" />
                              {prediction.userName}
                            </CardTitle>
                            <CardDescription>Workload Analysis & Predictions</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getTrendIcon(prediction.currentPeriod.productivityTrend)}
                          <span className="text-sm text-gray-600">
                            {prediction.currentPeriod.productivityTrend}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Current Period */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900">Current Period</h4>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-gray-600">Utilization</span>
                                <span className={`font-medium ${getWorkloadColor(prediction.currentPeriod.utilization)}`}>
                                  {prediction.currentPeriod.utilization}%
                                </span>
                              </div>
                              <Progress value={prediction.currentPeriod.utilization} className="h-2" />
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-gray-600">Burnout Risk</span>
                                <span className={`font-medium ${prediction.currentPeriod.burnoutRisk > 70 ? 'text-red-600' : 'text-green-600'}`}>
                                  {prediction.currentPeriod.burnoutRisk}%
                                </span>
                              </div>
                              <Progress 
                                value={prediction.currentPeriod.burnoutRisk} 
                                className="h-2"
                              />
                            </div>

                            {prediction.currentPeriod.overallocation > 0 && (
                              <div className="p-2 bg-red-50 rounded-lg">
                                <div className="flex items-center text-red-800">
                                  <AlertTriangle className="h-4 w-4 mr-1" />
                                  <span className="text-sm font-medium">
                                    Overallocated by {prediction.currentPeriod.overallocation}h
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Next Week */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900">Next Week Prediction</h4>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-gray-600">Predicted Utilization</span>
                                <span className={`font-medium ${getWorkloadColor(prediction.nextWeek.predictedUtilization)}`}>
                                  {prediction.nextWeek.predictedUtilization}%
                                </span>
                              </div>
                              <Progress value={prediction.nextWeek.predictedUtilization} className="h-2" />
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-gray-600">Predicted Burnout Risk</span>
                                <span className={`font-medium ${prediction.nextWeek.predictedBurnoutRisk > 70 ? 'text-red-600' : 'text-green-600'}`}>
                                  {prediction.nextWeek.predictedBurnoutRisk}%
                                </span>
                              </div>
                              <Progress 
                                value={prediction.nextWeek.predictedBurnoutRisk} 
                                className="h-2"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Next Month */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900">Next Month Prediction</h4>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-gray-600">Predicted Utilization</span>
                                <span className={`font-medium ${getWorkloadColor(prediction.nextMonth.predictedUtilization)}`}>
                                  {prediction.nextMonth.predictedUtilization}%
                                </span>
                              </div>
                              <Progress value={prediction.nextMonth.predictedUtilization} className="h-2" />
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-gray-600">Predicted Burnout Risk</span>
                                <span className={`font-medium ${prediction.nextMonth.predictedBurnoutRisk > 70 ? 'text-red-600' : 'text-green-600'}`}>
                                  {prediction.nextMonth.predictedBurnoutRisk}%
                                </span>
                              </div>
                              <Progress 
                                value={prediction.nextMonth.predictedBurnoutRisk} 
                                className="h-2"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recommendations */}
                      {prediction.recommendations.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-semibold text-gray-900 mb-3">AI Recommendations</h4>
                          <div className="space-y-2">
                            {prediction.recommendations.map((rec, index) => (
                              <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                                <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                                <span className="text-sm text-blue-800">{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            {recommendations.length === 0 ? (
              <Card className="p-12 text-center">
                <Lightbulb className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No AI Insights Available</h3>
                <p className="text-gray-500">Generate a schedule to receive AI-powered optimization recommendations</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {recommendations.map((recommendation) => (
                  <Card key={recommendation.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <Badge variant="outline" className={
                              recommendation.priority === 'critical' ? 'bg-red-100 text-red-800 border-red-200' :
                              recommendation.priority === 'high' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                              recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              'bg-green-100 text-green-800 border-green-200'
                            }>
                              {recommendation.priority}
                            </Badge>
                            <Badge variant="secondary">{recommendation.type.replace('_', ' ')}</Badge>
                            <Badge 
                              variant={recommendation.status === 'pending' ? 'default' : 'secondary'}
                              className={
                                recommendation.status === 'implemented' ? 'bg-green-100 text-green-800' : ''
                              }
                            >
                              {recommendation.status}
                            </Badge>
                          </div>
                          
                          <h4 className="text-lg font-semibold mb-2">{recommendation.title}</h4>
                          <p className="text-gray-600 mb-4">{recommendation.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-lg font-bold text-green-600">{recommendation.impact.timelineSaving}h</div>
                              <div className="text-xs text-green-700">Time Saved</div>
                            </div>
                            {recommendation.impact.qualityImprovement && (
                              <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <div className="text-lg font-bold text-blue-600">{recommendation.impact.qualityImprovement}%</div>
                                <div className="text-xs text-blue-700">Quality Boost</div>
                              </div>
                            )}
                            {recommendation.impact.riskReduction && (
                              <div className="text-center p-3 bg-purple-50 rounded-lg">
                                <div className="text-lg font-bold text-purple-600">{recommendation.impact.riskReduction}%</div>
                                <div className="text-xs text-purple-700">Risk Reduction</div>
                              </div>
                            )}
                            {recommendation.impact.costSaving && (
                              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                                <div className="text-lg font-bold text-yellow-600">${recommendation.impact.costSaving}</div>
                                <div className="text-xs text-yellow-700">Cost Saved</div>
                              </div>
                            )}
                          </div>
                          
                          <div className="mb-4">
                            <Label className="text-sm font-medium text-gray-700">Action Required:</Label>
                            <p className="text-sm text-gray-600 mt-1">{recommendation.actionRequired}</p>
                          </div>
                          
                          <div className="mb-4">
                            <Label className="text-sm font-medium text-gray-700">Implementation Steps:</Label>
                            <ul className="text-sm text-gray-600 mt-2 space-y-1">
                              {recommendation.implementationSteps.map((step, index) => (
                                <li key={index} className="flex items-start">
                                  <ArrowRight className="h-3 w-3 mr-2 mt-1 flex-shrink-0" />
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          {recommendation.status === 'pending' && (
                            <Button
                              onClick={() => applyRecommendationMutation.mutate(recommendation.id)}
                              disabled={applyRecommendationMutation.isPending}
                              className="bg-purple-600 hover:bg-purple-700"
                              data-testid={`button-apply-recommendation-${recommendation.id}`}
                            >
                              <Zap className="h-4 w-4 mr-2" />
                              Apply
                            </Button>
                          )}
                          {recommendation.status === 'implemented' && (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              <span className="text-sm font-medium">Applied</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {statistics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Calendar className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                    <div className="text-2xl font-bold text-purple-600">{statistics.totalSchedules}</div>
                    <div className="text-sm text-gray-600">AI Schedules Generated</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <Lightbulb className="h-8 w-8 mx-auto mb-3 text-orange-600" />
                    <div className="text-2xl font-bold text-orange-600">{statistics.activeRecommendations}</div>
                    <div className="text-sm text-gray-600">Active Recommendations</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="h-8 w-8 mx-auto mb-3 text-green-600" />
                    <div className="text-2xl font-bold text-green-600">{statistics.implementedRecommendations}</div>
                    <div className="text-sm text-gray-600">Optimizations Applied</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <Clock className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                    <div className="text-2xl font-bold text-blue-600">{statistics.optimizationImpact.totalTimeSaved}h</div>
                    <div className="text-sm text-gray-600">Total Time Saved</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Workload Overview */}
            {statistics?.workloadInsights && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                    Team Workload Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {Math.round(statistics.workloadInsights.averageUtilization)}%
                      </div>
                      <div className="text-sm text-gray-600">Average Team Utilization</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600 mb-2">
                        {statistics.workloadInsights.overallocatedUsers}
                      </div>
                      <div className="text-sm text-gray-600">Overallocated Members</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600 mb-2">
                        {statistics.workloadInsights.highBurnoutRisk}
                      </div>
                      <div className="text-sm text-gray-600">High Burnout Risk</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Generate Schedule Dialog */}
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-purple-600" />
                Generate AI-Powered Schedule
              </DialogTitle>
              <DialogDescription>
                Configure scheduling parameters for AI optimization
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={schedulingContext.timeframe.start}
                    onChange={(e) => setSchedulingContext(prev => ({
                      ...prev,
                      timeframe: { ...prev.timeframe, start: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={schedulingContext.timeframe.end}
                    onChange={(e) => setSchedulingContext(prev => ({
                      ...prev,
                      timeframe: { ...prev.timeframe, end: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Working Hours Start</Label>
                  <Input
                    type="time"
                    value={schedulingContext.constraints.workingHours.start}
                    onChange={(e) => setSchedulingContext(prev => ({
                      ...prev,
                      constraints: {
                        ...prev.constraints,
                        workingHours: { ...prev.constraints.workingHours, start: e.target.value }
                      }
                    }))}
                  />
                </div>
                <div>
                  <Label>Working Hours End</Label>
                  <Input
                    type="time"
                    value={schedulingContext.constraints.workingHours.end}
                    onChange={(e) => setSchedulingContext(prev => ({
                      ...prev,
                      constraints: {
                        ...prev.constraints,
                        workingHours: { ...prev.constraints.workingHours, end: e.target.value }
                      }
                    }))}
                  />
                </div>
              </div>

              <div>
                <Label>Max Hours Per Day</Label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={schedulingContext.constraints.maxHoursPerDay}
                  onChange={(e) => setSchedulingContext(prev => ({
                    ...prev,
                    constraints: {
                      ...prev.constraints,
                      maxHoursPerDay: parseInt(e.target.value)
                    }
                  }))}
                />
              </div>

              <div className="text-sm text-gray-600">
                The AI will analyze {tasks.length} tasks and optimize scheduling based on priorities, dependencies, and team availability.
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => generateScheduleMutation.mutate()}
                disabled={isGenerating}
                className="bg-purple-600 hover:bg-purple-700"
                data-testid="button-generate-ai-schedule"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate Schedule
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