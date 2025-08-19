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

export default function Tasks() {
  const [location, navigate] = useLocation();
  
  // Extract filter from URL params
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const filter = urlParams.get('filter') || 'all';
  
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
          if (!task.completed || !task.createdAt) return false;
          const completedDate = new Date(task.createdAt);
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
          title: 'Overdue Tasks',
          icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
          description: 'Tasks that have passed their due date',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'due-soon':
        return {
          title: 'Due Soon',
          icon: <Clock className="h-6 w-6 text-yellow-600" />,
          description: 'Tasks due today or tomorrow',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'high-priority':
        return {
          title: 'High Priority Tasks',
          icon: <Target className="h-6 w-6 text-orange-600" />,
          description: 'Tasks marked as high priority',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      case 'completed-today':
        return {
          title: 'Completed Today',
          icon: <CheckCircle2 className="h-6 w-6 text-green-600" />,
          description: 'Tasks completed today',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      default:
        return {
          title: 'All Tasks',
          icon: <Calendar className="h-6 w-6 text-blue-600" />,
          description: 'Complete list of all tasks',
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
            Back to Dashboard
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
                No tasks found
              </h3>
              <p className="text-gray-500 mb-6">
                {filter === 'completed-today' 
                  ? "You haven't completed any tasks today yet."
                  : filter === 'overdue'
                  ? "Great! You don't have any overdue tasks."
                  : filter === 'due-soon'
                  ? "No tasks are due in the near future."
                  : filter === 'high-priority'
                  ? "No high priority tasks at the moment."
                  : "No tasks have been created yet."
                }
              </p>
              <Button onClick={() => navigate("/")}>
                {filter === 'all' ? 'Create your first task' : 'Back to Dashboard'}
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