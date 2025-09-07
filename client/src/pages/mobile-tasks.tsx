import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Calendar,
  Filter,
  Home
} from "lucide-react";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate?: string;
  projectName?: string;
  completed: boolean;
}

export default function MobileTasks() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');

  const { data: tasksResponse, isLoading } = useQuery<{ success: boolean; data: Task[]; pagination?: any }>({
    queryKey: ["/api/mobile/tasks"],
  });

  const tasks = tasksResponse?.data || [];

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'completed') return matchesSearch && task.completed;
    if (filterStatus === 'pending') return matchesSearch && !task.completed;
    
    return matchesSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string, completed: boolean) => {
    if (completed) return 'text-green-600';
    switch (status) {
      case 'in-progress': return 'text-blue-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#004C6D] to-[#0B1D3A] flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading Tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004C6D] to-[#0B1D3A]">
      {/* Header */}
      <div className="bg-[#004C6D] px-4 py-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Link href="/mobile">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-2"
                data-testid="button-back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">📋 Tasks</h1>
              <p className="text-blue-100 text-sm">{filteredTasks.length} tasks</p>
            </div>
          </div>
          <Link href="/mobile">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-2"
              data-testid="button-home"
            >
              <Home className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/90 border-0"
            data-testid="input-search"
          />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Filters */}
        <div className="flex space-x-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
            className={filterStatus === 'all' ? 'bg-[#004C6D] text-white' : 'text-[#004C6D] border-[#004C6D]/20'}
            data-testid="button-filter-all"
          >
            All
          </Button>
          <Button
            variant={filterStatus === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('pending')}
            className={filterStatus === 'pending' ? 'bg-[#004C6D] text-white' : 'text-[#004C6D] border-[#004C6D]/20'}
            data-testid="button-filter-pending"
          >
            Pending
          </Button>
          <Button
            variant={filterStatus === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('completed')}
            className={filterStatus === 'completed' ? 'bg-[#004C6D] text-white' : 'text-[#004C6D] border-[#004C6D]/20'}
            data-testid="button-filter-completed"
          >
            Completed
          </Button>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.map((task, index) => (
            <Card key={task.id} className="bg-white/95 backdrop-blur border-0 shadow-lg" data-testid={`card-task-${index}`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`w-3 h-3 rounded-full mt-1 ${getPriorityColor(task.priority)}`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          {task.projectName && (
                            <Badge variant="secondary" className="text-xs">
                              {task.projectName}
                            </Badge>
                          )}
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${task.priority === 'urgent' ? 'border-red-500 text-red-700' : 
                                                   task.priority === 'high' ? 'border-orange-500 text-orange-700' :
                                                   task.priority === 'medium' ? 'border-yellow-500 text-yellow-700' :
                                                   'border-green-500 text-green-700'}`}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        {task.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className={`h-5 w-5 ${getStatusColor(task.status, task.completed)}`} />
                        )}
                      </div>
                    </div>
                    
                    {task.dueDate && (
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredTasks.length === 0 && (
            <Card className="bg-white/95 backdrop-blur border-0 shadow-lg">
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Tasks Found</h3>
                <p className="text-gray-600 text-sm">
                  {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first task'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Add bottom padding for floating button */}
        <div className="h-20"></div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full bg-[#004C6D] hover:bg-[#003A52] shadow-lg"
          data-testid="button-add-task"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}