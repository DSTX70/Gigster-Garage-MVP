import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Calendar, Flame, Clock, TrendingUp, Target } from "lucide-react";

interface StreakData {
  last14Days: {
    streakDays: number;
    totalHours: number;
    averageDailyHours: number;
    utilizationPercent: number;
  };
  last30Days: {
    streakDays: number;
    totalHours: number;
    averageDailyHours: number;
    utilizationPercent: number;
  };
}

export function StreakCard() {
  const { data: streakData, isLoading } = useQuery<StreakData>({
    queryKey: ["/api/streaks"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card className="w-full max-w-md bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200" data-testid="streak-card-loading">
        <CardHeader className="pb-3">
          <CardTitle className="text-amber-900 flex items-center space-x-2">
            <Flame className="h-5 w-5" />
            <span>Productivity Streaks</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!streakData) {
    return (
      <Card className="w-full max-w-md bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200" data-testid="streak-card-error">
        <CardHeader className="pb-3">
          <CardTitle className="text-amber-900 flex items-center space-x-2">
            <Flame className="h-5 w-5" />
            <span>Productivity Streaks</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-amber-700">
            No streak data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200" data-testid="streak-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-amber-900 flex items-center space-x-2">
          <Flame className="h-5 w-5" />
          <span>Productivity Streaks</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="14days" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-amber-100">
            <TabsTrigger value="14days" className="text-amber-800 data-[state=active]:bg-amber-200" data-testid="tab-14days">
              14 Days
            </TabsTrigger>
            <TabsTrigger value="30days" className="text-amber-800 data-[state=active]:bg-amber-200" data-testid="tab-30days">
              30 Days
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="14days" className="mt-4 space-y-4" data-testid="tab-content-14days">
            <div className="space-y-3">
              {/* Streak Days */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Flame className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-amber-900">Current Streak</span>
                </div>
                <Badge 
                  variant="secondary" 
                  className="bg-orange-100 text-orange-800 border-orange-200"
                  data-testid="streak-days-14"
                >
                  {streakData.last14Days.streakDays} days
                </Badge>
              </div>
              
              {/* Total Hours */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-900">Total Hours</span>
                </div>
                <span className="text-sm font-semibold text-amber-800" data-testid="total-hours-14">
                  {streakData.last14Days.totalHours}h
                </span>
              </div>
              
              {/* Daily Average */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-900">Daily Average</span>
                </div>
                <span className="text-sm font-semibold text-amber-800" data-testid="daily-average-14">
                  {streakData.last14Days.averageDailyHours}h
                </span>
              </div>
              
              {/* Utilization */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-900">Utilization</span>
                  </div>
                  <span className="text-sm font-semibold text-amber-800" data-testid="utilization-percent-14">
                    {streakData.last14Days.utilizationPercent}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(streakData.last14Days.utilizationPercent, 100)} 
                  className="h-2 bg-amber-200"
                  data-testid="utilization-progress-14"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="30days" className="mt-4 space-y-4" data-testid="tab-content-30days">
            <div className="space-y-3">
              {/* Streak Days */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Flame className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-amber-900">Current Streak</span>
                </div>
                <Badge 
                  variant="secondary" 
                  className="bg-orange-100 text-orange-800 border-orange-200"
                  data-testid="streak-days-30"
                >
                  {streakData.last30Days.streakDays} days
                </Badge>
              </div>
              
              {/* Total Hours */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-900">Total Hours</span>
                </div>
                <span className="text-sm font-semibold text-amber-800" data-testid="total-hours-30">
                  {streakData.last30Days.totalHours}h
                </span>
              </div>
              
              {/* Daily Average */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-900">Daily Average</span>
                </div>
                <span className="text-sm font-semibold text-amber-800" data-testid="daily-average-30">
                  {streakData.last30Days.averageDailyHours}h
                </span>
              </div>
              
              {/* Utilization */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-900">Utilization</span>
                  </div>
                  <span className="text-sm font-semibold text-amber-800" data-testid="utilization-percent-30">
                    {streakData.last30Days.utilizationPercent}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(streakData.last30Days.utilizationPercent, 100)} 
                  className="h-2 bg-amber-200"
                  data-testid="utilization-progress-30"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Motivational Message */}
        <div className="mt-4 p-3 bg-amber-100 rounded-md border border-amber-200">
          <div className="text-xs text-amber-800 text-center" data-testid="motivational-message">
            {streakData.last14Days.streakDays > 0 
              ? `🔥 Amazing! You're on a ${streakData.last14Days.streakDays}-day streak!`
              : "💪 Start your productivity streak today!"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}