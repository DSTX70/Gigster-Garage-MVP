import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Calendar,
  Filter,
  Home,
  Eye,
  Edit,
  Check,
  X
} from "lucide-react";
import { format } from "date-fns";
import type { Task, Project, User } from "@shared/schema";

interface TaskFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: string;
  projectId?: string;
  assignedToId?: string;
}

export default function MobileTasks() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    projectId: '',
    assignedToId: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (task.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'completed') return matchesSearch && (task.completed || false);
    if (filterStatus === 'pending') return matchesSearch && !(task.completed || false);
    
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

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: TaskFormData) => {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskData,
          dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : undefined
        })
      });
      if (!response.ok) throw new Error('Failed to create task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        dueDate: '',
        projectId: '',
        assignedToId: ''
      });
      toast({
        title: "Task Created",
        description: "New task has been created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  });

  // Toggle task completion
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      });
      if (!response.ok) throw new Error('Failed to update task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    }
  });

  const handleCreateTask = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }
    createTaskMutation.mutate(formData);
  };

  const openTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const toggleTaskCompletion = (task: Task) => {
    toggleTaskMutation.mutate({ id: task.id, completed: task.completed || false });
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
            <Card key={task.id} className="bg-white/95 backdrop-blur border-0 shadow-lg cursor-pointer" data-testid={`card-task-${index}`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`w-3 h-3 rounded-full mt-1 ${getPriorityColor(task.priority || 'medium')}`}></div>
                  <div className="flex-1 min-w-0" onClick={() => openTaskDetail(task)}>
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
                          {task.projectId && (
                            <Badge variant="secondary" className="text-xs">
                              Project
                            </Badge>
                          )}
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${task.priority === 'high' ? 'border-red-500 text-red-700' : 
                                                   task.priority === 'medium' ? 'border-orange-500 text-orange-700' :
                                                   task.priority === 'low' ? 'border-yellow-500 text-yellow-700' :
                                                   'border-green-500 text-green-700'}`}
                          >
                            {task.priority || 'medium'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskCompletion(task);
                          }}
                          className="p-1 h-auto"
                          data-testid={`button-toggle-${index}`}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Clock className={`h-5 w-5 ${getStatusColor(task.status || 'pending', task.completed || false)}`} />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openTaskDetail(task);
                          }}
                          className="p-1 h-auto"
                          data-testid={`button-view-${index}`}
                        >
                          <Eye className="h-4 w-4 text-gray-400" />
                        </Button>
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

        {/* Switch to Desktop */}
        <Card className="bg-white/95 backdrop-blur border-0 shadow-lg" data-testid="card-switch-desktop">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                Need the full platform?
              </p>
              <a 
                href="/?desktop=true"
                className="inline-block bg-[#004C6D] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#003A52] transition-colors"
                data-testid="link-desktop-version"
              >
                🖥️ Switch to Desktop Version
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Add bottom padding for floating button */}
        <div className="h-20"></div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full bg-[#004C6D] hover:bg-[#003A52] shadow-lg"
              data-testid="button-add-task"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="text-[#004C6D]">Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter task title"
                  className="mt-1"
                  data-testid="input-task-title"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter task description"
                  className="mt-1 h-20"
                  data-testid="textarea-task-description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => 
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger className="mt-1" data-testid="select-task-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'pending' | 'in-progress' | 'completed') => 
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger className="mt-1" data-testid="select-task-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="mt-1"
                  data-testid="input-task-due-date"
                />
              </div>

              <div>
                <Label htmlFor="project">Project</Label>
                <Select
                  value={formData.projectId}
                  onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                >
                  <SelectTrigger className="mt-1" data-testid="select-task-project">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="assignee">Assign To</Label>
                <Select
                  value={formData.assignedToId}
                  onValueChange={(value) => setFormData({ ...formData, assignedToId: value })}
                >
                  <SelectTrigger className="mt-1" data-testid="select-task-assignee">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1"
                  data-testid="button-cancel-task"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTask}
                  disabled={createTaskMutation.isPending}
                  className="flex-1 bg-[#004C6D] hover:bg-[#003A52]"
                  data-testid="button-create-task"
                >
                  {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Task Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle className="text-[#004C6D] pr-8">{selectedTask.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(selectedTask.priority || 'medium')}`}></div>
                  <Badge variant="outline" className="text-xs">
                    {selectedTask.priority || 'medium'} priority
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {selectedTask.status || 'pending'}
                  </Badge>
                  {selectedTask.completed && (
                    <Badge className="text-xs bg-green-100 text-green-800">
                      Completed
                    </Badge>
                  )}
                </div>

                {selectedTask.description && (
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedTask.description}</p>
                  </div>
                )}

                {selectedTask.projectId && (
                  <div>
                    <Label className="text-sm font-medium">Project</Label>
                    <p className="text-sm text-gray-600 mt-1">Project ID: {selectedTask.projectId}</p>
                  </div>
                )}

                {selectedTask.dueDate && (
                  <div>
                    <Label className="text-sm font-medium">Due Date</Label>
                    <p className="text-sm text-gray-600 mt-1">
                      {format(new Date(selectedTask.dueDate), 'MMMM d, yyyy - h:mm a')}
                    </p>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => toggleTaskCompletion(selectedTask)}
                    className="flex-1"
                    disabled={toggleTaskMutation.isPending}
                    data-testid="button-toggle-completion"
                  >
                    {selectedTask.completed ? (
                      <><X className="h-4 w-4 mr-2" />Mark Incomplete</>
                    ) : (
                      <><Check className="h-4 w-4 mr-2" />Mark Complete</>
                    )}
                  </Button>
                  <Button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="flex-1 bg-[#004C6D] hover:bg-[#003A52]"
                    data-testid="button-close-detail"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}