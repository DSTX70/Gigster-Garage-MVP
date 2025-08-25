import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/app-header";
import { TimerWidget } from "@/components/timer-widget";
import { StreakCard } from "@/components/streak-card";
import { DailyReminder } from "@/components/daily-reminder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, Calendar, BarChart3, Edit, Trash2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import type { TimeLog } from "@shared/schema";

interface ProductivityStats {
  totalHours: number;
  averageDailyHours: number;
  streakDays: number;
  utilizationPercent: number;
}

// Helper function to format duration
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export default function ProductivityPage() {
  // Fetch recent time logs
  const { data: timeLogs = [], isLoading: timeLogsLoading } = useQuery<TimeLog[]>({
    queryKey: ["/api/timelogs"],
  });

  // Fetch productivity stats for different periods
  const { data: stats7Days } = useQuery<ProductivityStats>({
    queryKey: ["/api/productivity/stats", { days: 7 }],
  });

  const { data: stats30Days } = useQuery<ProductivityStats>({
    queryKey: ["/api/productivity/stats", { days: 30 }],
  });

  return (
    <div className="min-h-screen" style={{background: 'var(--cream-card)'}} data-testid="productivity-page">
      <AppHeader />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold brand-heading mb-2" data-testid="page-title">
            Time & Productivity Tools
          </h2>
          <p className="text-gray-700">
            Track your time, maintain productivity streaks, and stay focused on your goals.
          </p>
        </div>

        {/* Top Widget Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Timer Widget */}
          <div className="lg:col-span-1">
            <TimerWidget />
          </div>
          
          {/* Streak Card */}
          <div className="lg:col-span-1">
            <StreakCard />
          </div>
          
          {/* Daily Reminder */}
          <div className="lg:col-span-1">
            <DailyReminder />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="gigster-card" data-testid="stat-card-7days">
            <CardHeader className="pb-3">
              <CardTitle className="brand-heading text-sm font-medium flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Last 7 Days</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold brand-heading" data-testid="stat-hours-7days">
                {stats7Days ? `${stats7Days.totalHours}h` : "0h"}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Avg: {stats7Days ? `${stats7Days.averageDailyHours}h/day` : "0h/day"}
              </div>
            </CardContent>
          </Card>

          <Card className="gigster-card" data-testid="stat-card-30days">
            <CardHeader className="pb-3">
              <CardTitle className="brand-heading text-sm font-medium flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Last 30 Days</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold brand-heading" data-testid="stat-hours-30days">
                {stats30Days ? `${stats30Days.totalHours}h` : "0h"}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Utilization: {stats30Days ? `${stats30Days.utilizationPercent}%` : "0%"}
              </div>
            </CardContent>
          </Card>

          <Card className="gigster-card" data-testid="stat-card-streak">
            <CardHeader className="pb-3">
              <CardTitle className="brand-heading text-sm font-medium flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Streak Days</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold brand-heading" data-testid="stat-streak-days">
                {stats7Days ? stats7Days.streakDays : 0}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Current streak
              </div>
            </CardContent>
          </Card>

          <Card className="gigster-card" data-testid="stat-card-total-logs">
            <CardHeader className="pb-3">
              <CardTitle className="brand-heading text-sm font-medium flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Total Sessions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold brand-heading" data-testid="stat-total-sessions">
                {timeLogs.length}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Time entries
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Time Logs */}
        <Card className="gigster-card" data-testid="recent-timelogs-card">
          <CardHeader>
            <CardTitle className="brand-heading flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Time Logs</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timeLogsLoading ? (
              <div className="flex items-center justify-center py-8" data-testid="timelogs-loading">
                <div className="animate-spin w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full" />
              </div>
            ) : timeLogs.length === 0 ? (
              <div className="text-center py-8 text-orange-700" data-testid="no-timelogs">
                <Clock className="h-12 w-12 mx-auto mb-4 text-orange-400" />
                <p className="text-lg font-medium mb-2">No time logs yet</p>
                <p className="text-sm">Start your first timer to begin tracking your productivity!</p>
              </div>
            ) : (
              <div className="space-y-3" data-testid="timelogs-list">
                {timeLogs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100"
                    data-testid={`timelog-${log.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <div className="font-medium brand-heading">
                            {log.description || 
                             log.task?.description || 
                             log.project?.name || 
                             "Untitled session"}
                          </div>
                          <div className="text-sm text-orange-700 mt-1">
                            {format(new Date(log.startTime), "MMM dd, yyyy 'at' h:mm a")}
                            {log.endTime && ` - ${format(new Date(log.endTime), "h:mm a")}`}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {log.project && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                              {log.project.name}
                            </Badge>
                          )}
                          {log.isActive ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Running
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-orange-300 text-orange-700">
                              {log.duration ? formatDuration(parseInt(log.duration)) : "0m"}
                            </Badge>
                          )}
                          {log.isManualEntry && (
                            <Badge variant="outline" className="border-purple-300 text-purple-700">
                              Manual
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-gray-600 hover:bg-orange-100"
                        data-testid={`button-edit-${log.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-100"
                        data-testid={`button-delete-${log.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {timeLogs.length > 10 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                      View All Time Logs ({timeLogs.length})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}