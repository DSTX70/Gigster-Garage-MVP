import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AppHeader } from "@/components/app-header";
import { TaskItem } from "@/components/task-item";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, AlertTriangle, Clock, CheckCircle2, Target } from "lucide-react";
import { format, isAfter, startOfDay } from "date-fns";
import type { Task } from "@shared/schema";
import { copy } from "@/lib/copy";

export default function Tasks() {
  const [location, navigate] = useLocation();
  
  // Extract filter from URL params - more robust parsing
  const searchParams = new URLSearchParams(window.location.search);
  const filter = searchParams.get('filter') || 'all';
  
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Filter tasks based on the filter parameter
  const getFilteredTasks = () => {
    const now = new Date();
    
    switch (filter) {
      case 'overdue':
        return tasks.filter(task => {
          if (task.completed || !task.dueDate) return false;
          return new Date(task.dueDate) < now;
        });
      
      case 'due-soon':
        return tasks.filter(task => {
          if (task.completed || !task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          const timeDiff = dueDate.getTime() - now.getTime();
          const isToday = startOfDay(dueDate).getTime() === startOfDay(now).getTime();
          const isTomorrow = timeDiff <= 24 * 60 * 60 * 1000 && timeDiff > 0;
          return isToday || isTomorrow;
        });
      
      case 'high-priority':
        return tasks.filter(task => !task.completed && task.priority === 'high');
      
      case 'completed-today':
        return tasks.filter(task => {
          if (!task.completed) return false;
          // Use createdAt since updatedAt may not exist in schema
          const completedDate = task.createdAt ? new Date(task.createdAt) : new Date();
          return startOfDay(completedDate).getTime() === startOfDay(now).getTime();
        });
      
      case 'all':
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();

  const getFilterInfo = () => {
    switch (filter) {
      case 'overdue':
        return {
          title: copy.dashboard.overdue.title,
          icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
          description: copy.dashboard.overdue.sub,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'due-soon':
        return {
          title: copy.dashboard.dueSoon.title,
          icon: <Clock className="h-6 w-6 text-yellow-600" />,
          description: copy.dashboard.dueSoon.sub,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'high-priority':
        return {
          title: copy.dashboard.highPriority.title,
          icon: <Target className="h-6 w-6 text-orange-600" />,
          description: copy.dashboard.highPriority.sub,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      case 'completed-today':
        return {
          title: copy.dashboard.completed.title,
          icon: <CheckCircle2 className="h-6 w-6 text-green-600" />,
          description: copy.dashboard.completed.sub,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      default:
        return {
          title: copy.tasks.title,
          icon: <Calendar className="h-6 w-6 text-blue-600" />,
          description: copy.dashboard.greeting,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
    }
  };

  const filterInfo = getFilterInfo();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with back button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
{copy.tasks.backButton}
          </Button>
          
          <Card className={`${filterInfo.bgColor} ${filterInfo.borderColor} border-2`}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                {filterInfo.icon}
                <div>
                  <CardTitle className={`text-2xl ${filterInfo.color}`}>
                    {filterInfo.title}
                  </CardTitle>
                  <p className="text-gray-600 mt-1">{filterInfo.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
                </Badge>
                {filteredTasks.length > 0 && (
                  <p className="text-sm text-gray-500">
                    Last updated: {format(new Date(), 'MMM d, yyyy h:mm a')}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-400 mb-4">
                {filterInfo.icon}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {copy.tasks.empty.title}
              </h3>
              <p className="text-gray-500 mb-6">
                {filter === 'completed-today' 
                  ? copy.dashboard.completed.sub
                  : filter === 'overdue'
                  ? copy.dashboard.overdue.sub
                  : filter === 'due-soon'
                  ? copy.dashboard.dueSoon.sub
                  : filter === 'high-priority'
                  ? copy.dashboard.highPriority.sub
                  : copy.tasks.empty.sub
                }
              </p>
              <Button onClick={() => navigate("/")}>
                {filter === 'all' ? copy.tasks.empty.cta : copy.tasks.backButton}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}