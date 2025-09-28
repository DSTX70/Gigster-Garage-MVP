import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, BarChart3, Calendar, Clock, Target, Activity } from "lucide-react";
import { format, parseISO } from "date-fns";

interface ProductivityData {
  dailyData: Array<{
    date: string;
    hours: number;
    tasksCreated: number;
    tasksCompleted: number;
    productivity: number;
  }>;
  summary: {
    totalHours: number;
    averageDailyHours: number;
    totalTasksCompleted: number;
    averageProductivity: number;
    periodDays: number;
  };
}

interface TaskAnalytics {
  priorityBreakdown: {
    high: { total: number; completed: number };
    medium: { total: number; completed: number };
    low: { total: number; completed: number };
  };
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
}

const chartConfig = {
  hours: {
    label: "Hours",
    color: "#004C6D",
  },
  tasksCompleted: {
    label: "Tasks Completed",
    color: "#0B1D3A",
  },
  productivity: {
    label: "Productivity %",
    color: "#2563eb",
  },
  high: {
    label: "High Priority",
    color: "#ef4444",
  },
  medium: {
    label: "Medium Priority", 
    color: "#f59e0b",
  },
  low: {
    label: "Low Priority",
    color: "#10b981",
  },
};

export function AnalyticsCharts() {
  const { data: productivityData, isLoading: prodLoading } = useQuery<ProductivityData>({
    queryKey: ["/api/analytics/productivity", { days: 30 }],
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: taskData, isLoading: taskLoading } = useQuery<TaskAnalytics>({
    queryKey: ["/api/analytics/tasks"],
    refetchInterval: 60000,
  });

  if (prodLoading || taskLoading) {
    return (
      <div className="grid gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!productivityData || !taskData) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  // Format data for charts
  const formattedDailyData = productivityData.dailyData.map(item => ({
    ...item,
    formattedDate: format(parseISO(item.date), 'MMM dd'),
  }));

  // Priority chart data
  const priorityData = [
    {
      name: "High Priority",
      completed: taskData.priorityBreakdown.high.completed,
      total: taskData.priorityBreakdown.high.total,
      completionRate: Math.round((taskData.priorityBreakdown.high.completed / Math.max(taskData.priorityBreakdown.high.total, 1)) * 100),
      color: "#ef4444"
    },
    {
      name: "Medium Priority", 
      completed: taskData.priorityBreakdown.medium.completed,
      total: taskData.priorityBreakdown.medium.total,
      completionRate: Math.round((taskData.priorityBreakdown.medium.completed / Math.max(taskData.priorityBreakdown.medium.total, 1)) * 100),
      color: "#f59e0b"
    },
    {
      name: "Low Priority",
      completed: taskData.priorityBreakdown.low.completed,
      total: taskData.priorityBreakdown.low.total,
      completionRate: Math.round((taskData.priorityBreakdown.low.completed / Math.max(taskData.priorityBreakdown.low.total, 1)) * 100),
      color: "#10b981"
    }
  ];

  // Overview statistics
  const overviewStats = [
    {
      title: "Total Hours Logged",
      value: productivityData.summary.totalHours.toFixed(1),
      subtitle: `${productivityData.summary.averageDailyHours.toFixed(1)}h daily average`,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Tasks Completed",
      value: taskData.completedTasks.toString(),
      subtitle: `${taskData.completionRate}% completion rate`,
      icon: Target,
      color: "text-green-600", 
      bgColor: "bg-green-50"
    },
    {
      title: "Overdue Tasks",
      value: taskData.overdueTasks.toString(),
      subtitle: `${taskData.totalTasks - taskData.completedTasks} active tasks`,
      icon: Calendar,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Average Productivity",
      value: `${productivityData.summary.averageProductivity}%`,
      subtitle: `Over ${productivityData.summary.periodDays} days`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Productivity Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Daily Productivity Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="hours" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="hours">Hours Logged</TabsTrigger>
                <TabsTrigger value="tasks">Task Completion</TabsTrigger>
              </TabsList>
              
              <TabsContent value="hours" className="mt-4">
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <AreaChart data={formattedDailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="formattedDate" />
                    <YAxis />
                    <ChartTooltip 
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="hours" 
                      stroke="var(--color-hours)" 
                      fill="var(--color-hours)" 
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              </TabsContent>
              
              <TabsContent value="tasks" className="mt-4">
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={formattedDailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="formattedDate" />
                    <YAxis />
                    <ChartTooltip 
                      content={<ChartTooltipContent indicator="dashed" />}
                    />
                    <Bar 
                      dataKey="tasksCompleted" 
                      fill="var(--color-tasksCompleted)" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <span>Task Priority Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {priorityData.map((priority, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: priority.color }}
                      />
                      <span className="text-sm font-medium">{priority.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold">{priority.completed}/{priority.total}</span>
                      <span className="text-xs text-gray-500 ml-2">({priority.completionRate}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        backgroundColor: priority.color,
                        width: `${priority.completionRate}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{taskData.completionRate}%</p>
                <p className="text-sm text-gray-600">Overall Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Productivity Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span>Weekly Productivity Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={formattedDailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formattedDate" />
                <YAxis domain={[0, 100]} />
                <ChartTooltip 
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Line 
                  type="monotone" 
                  dataKey="productivity" 
                  stroke="var(--color-productivity)" 
                  strokeWidth={3}
                  dot={{ fill: "var(--color-productivity)", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "var(--color-productivity)", strokeWidth: 2 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Task Creation vs Completion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <span>Task Flow Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={formattedDailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formattedDate" />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar dataKey="tasksCreated" fill="#94a3b8" name="Created" radius={[2, 2, 0, 0]} />
                <Bar dataKey="tasksCompleted" fill="var(--color-tasksCompleted)" name="Completed" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}