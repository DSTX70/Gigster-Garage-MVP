import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  Activity, 
  Target, 
  Zap, 
  Clock, 
  Play, 
  Plus, 
  Mic, 
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Timer,
  Home
} from "lucide-react";
import { format } from "date-fns";

interface MobileDashboard {
  quickStats: {
    todayTasks: number;
    activeProjects: number;
    hoursLogged: number;
    overdueItems: number;
  };
  recentTasks: any[];
  activeTimers: any[];
  upcomingDeadlines: any[];
  quickActions: any[];
  notifications: any[];
}

export default function MobileDashboard() {
  const [, navigate] = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second for active timers
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: dashboard, isLoading } = useQuery<{ success: boolean; data: MobileDashboard }>({
    queryKey: ["/api/mobile/dashboard"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#004C6D] to-[#0B1D3A] flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const dashboardData = dashboard?.data;
  
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#004C6D] to-[#0B1D3A] flex items-center justify-center p-4">
        <div className="text-center text-white">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-orange-300" />
          <p className="text-lg font-medium mb-4">Unable to load dashboard</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-white text-[#004C6D] hover:bg-gray-100"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in-progress': return 'text-blue-400';
      case 'pending': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004C6D] to-[#0B1D3A]">
      {/* Header */}
      <div className="bg-[#004C6D] px-4 py-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/mobile')}
              className="text-white hover:bg-white/20 p-2"
              data-testid="button-back-home"
            >
              <Home className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                🚀 Gigster Garage
              </h1>
              <p className="text-blue-100 text-sm">📊 Dashboard</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white text-sm font-medium">
              {format(currentTime, 'h:mm a')}
            </div>
            <div className="text-blue-100 text-xs">
              {format(currentTime, 'MMM d, yyyy')}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Performance Metrics */}
        <Card className="bg-white/95 backdrop-blur border-0 shadow-lg" data-testid="card-performance-metrics">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-[#004C6D]">
              <BarChart3 className="h-5 w-5 mr-2" />
              📊 Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#004C6D]" data-testid="text-hours-logged">
                  {dashboardData.quickStats.hoursLogged}h
                </div>
                <div className="text-sm text-gray-600">Hours Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#004C6D]" data-testid="text-active-projects">
                  {dashboardData.quickStats.activeProjects}
                </div>
                <div className="text-sm text-gray-600">Active Projects</div>
              </div>
            </div>
            
            {dashboardData.activeTimers.length > 0 && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                    <span className="text-sm font-medium text-green-800">
                      Timer Running
                    </span>
                  </div>
                  <Timer className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-xs text-green-600 mt-1">
                  {dashboardData.activeTimers[0].description || 'Active task'}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Overview */}
        <Card className="bg-white/95 backdrop-blur border-0 shadow-lg" data-testid="card-activity-overview">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-[#004C6D]">
              <Activity className="h-5 w-5 mr-2" />
              📊 Activity Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.recentTasks.slice(0, 4).map((task: any, index: number) => (
                <div key={task.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg" data-testid={`row-recent-task-${index}`}>
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {task.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {task.projectName || 'No project'}
                    </div>
                  </div>
                  {task.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className={`h-4 w-4 ${getStatusColor(task.status)}`} />
                  )}
                </div>
              ))}
              
              {dashboardData.recentTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Key Indicators */}
        <Card className="bg-white/95 backdrop-blur border-0 shadow-lg" data-testid="card-key-indicators">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-[#004C6D]">
              <Target className="h-5 w-5 mr-2" />
              🎯 Key Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600" data-testid="text-today-tasks">
                  {dashboardData.quickStats.todayTasks}
                </div>
                <div className="text-xs text-blue-600">Due Today</div>
              </div>
              
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-xl font-bold text-red-600" data-testid="text-overdue-items">
                  {dashboardData.quickStats.overdueItems}
                </div>
                <div className="text-xs text-red-600">Overdue</div>
              </div>
            </div>

            {dashboardData.upcomingDeadlines.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Upcoming Deadlines</div>
                <div className="space-y-2">
                  {dashboardData.upcomingDeadlines.slice(0, 3).map((task: any, index: number) => (
                    <div key={task.id} className="flex items-center justify-between text-xs" data-testid={`row-upcoming-deadline-${index}`}>
                      <span className="text-gray-900 truncate flex-1 mr-2">{task.title}</span>
                      <span className="text-orange-600 font-medium">
                        {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'No date'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dashboardData.notifications.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mr-1" />
                  <span className="text-sm font-medium text-yellow-800">Alerts</span>
                </div>
                {dashboardData.notifications.slice(0, 2).map((notification: any, index: number) => (
                  <div key={notification.id} className="text-xs text-yellow-700" data-testid={`text-notification-${index}`}>
                    {notification.body}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white/95 backdrop-blur border-0 shadow-lg" data-testid="card-quick-actions">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-[#004C6D]">
              <Zap className="h-5 w-5 mr-2" />
              📋 Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {dashboardData.quickActions.map((action: any) => {
                const IconComponent = {
                  'play-circle': Play,
                  'clock': Clock,
                  'plus-circle': Plus,
                  'mic': Mic
                }[action.icon] || Plus;

                return (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="h-20 flex-col space-y-1 text-[#004C6D] border-[#004C6D]/20 hover:bg-[#004C6D]/5"
                    data-testid={`button-quick-action-${action.type}`}
                    onClick={() => {
                      // Handle quick action navigation
                      switch (action.type) {
                        case 'startTimer':
                          navigate('/mobile/time-tracking');
                          break;
                        case 'logTime':
                          navigate('/mobile/time-tracking');
                          break;
                        case 'createTask':
                          navigate('/mobile/tasks');
                          break;
                        case 'voiceNote':
                          // Open voice note interface
                          break;
                        default:
                          break;
                      }
                    }}
                  >
                    <IconComponent className="h-6 w-6" />
                    <span className="text-xs font-medium">{action.label}</span>
                    {action.shortcut && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {action.shortcut}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>

            {/* Additional mobile-specific quick actions */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Link href="/mobile/tasks">
                <Button
                  variant="outline" 
                  className="w-full h-20 flex-col space-y-1 text-[#004C6D] border-[#004C6D]/20 hover:bg-[#004C6D]/5"
                  data-testid="button-view-tasks"
                >
                  <CheckCircle2 className="h-6 w-6" />
                  <span className="text-xs font-medium">View Tasks</span>
                </Button>
              </Link>
              
              <Link href="/mobile/projects">
                <Button
                  variant="outline"
                  className="w-full h-20 flex-col space-y-1 text-[#004C6D] border-[#004C6D]/20 hover:bg-[#004C6D]/5"
                  data-testid="button-view-projects"
                >
                  <TrendingUp className="h-6 w-6" />
                  <span className="text-xs font-medium">Projects</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-200 p-4">
          <div className="flex justify-center">
            <Button 
              onClick={() => navigate('/mobile')}
              className="bg-[#004C6D] hover:bg-[#003A52] text-white px-8 py-3 rounded-full shadow-lg"
              data-testid="button-back-to-home"
            >
              <Home className="h-5 w-5 mr-2" />
              🏠 Back to Home
            </Button>
          </div>
        </div>

        {/* Add bottom padding to avoid footer overlap */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}