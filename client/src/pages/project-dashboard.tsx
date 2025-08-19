import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Users, CheckCircle, AlertCircle, ArrowLeft, Plus, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Task, Project } from "@shared/schema";
import { format } from "date-fns";

export default function ProjectDashboard() {
  const { projectId } = useParams();
  const { user, isAdmin } = useAuth();
  const [activeView, setActiveView] = useState<"list" | "kanban" | "gantt">("list");

  const { data: project } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks", "project", projectId],
  });

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Project not found</h2>
          <Link href="/">
            <Button className="mt-4">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const completedTasks = tasks.filter(task => task.completed);
  const progressPercentage = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
  const overdueTasks = tasks.filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date() && !task.completed
  );
  const highPriorityTasks = tasks.filter(task => task.priority === "high" && !task.completed);

  const tasksByStatus = {
    todo: tasks.filter(task => !task.completed),
    inProgress: tasks.filter(task => !task.completed && task.progressNotes && Array.isArray(task.progressNotes) && task.progressNotes.length > 0),
    completed: completedTasks,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "on-hold": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const KanbanColumn = ({ title, tasks, className }: { title: string; tasks: Task[]; className?: string }) => (
    <div className={`bg-gray-50 rounded-lg p-4 min-h-96 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <Badge variant="secondary">{tasks.length}</Badge>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <h4 className="font-medium text-sm mb-2">{task.description}</h4>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <Badge className={`text-xs ${
                    task.priority === "high" ? "bg-red-100 text-red-800" :
                    task.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                    "bg-green-100 text-green-800"
                  }`}>
                    {task.priority}
                  </Badge>
                  {task.assignedTo && (
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {task.assignedTo.name}
                    </span>
                  )}
                </div>
                {task.dueDate && (
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {format(new Date(task.dueDate), "MMM d")}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Tasks
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                {project.description && (
                  <p className="text-gray-600 mt-1">{project.description}</p>
                )}
              </div>
            </div>
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Priority</p>
                  <p className="text-2xl font-bold text-red-600">{highPriorityTasks.length}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-orange-600">{overdueTasks.length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Project Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-sm text-gray-600">
                {completedTasks.length} of {tasks.length} tasks completed
              </p>
            </div>
          </CardContent>
        </Card>

        {/* View Tabs */}
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
              <TabsTrigger value="gantt">Timeline</TabsTrigger>
            </TabsList>
            
            <Link href="/">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </Link>
          </div>

          <TabsContent value="list">
            <div className="space-y-4">
              {tasks.map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold">{task.description}</h3>
                          <Badge className={`text-xs ${
                            task.priority === "high" ? "bg-red-100 text-red-800" :
                            task.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                            "bg-green-100 text-green-800"
                          }`}>
                            {task.priority}
                          </Badge>
                          {task.completed && (
                            <Badge className="bg-green-100 text-green-800">Completed</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {task.assignedTo && (
                            <span className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {task.assignedTo.name}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {format(new Date(task.dueDate), "MMM d, yyyy")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="kanban">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <KanbanColumn title="To Do" tasks={tasksByStatus.todo} />
              <KanbanColumn title="In Progress" tasks={tasksByStatus.inProgress} />
              <KanbanColumn title="Completed" tasks={tasksByStatus.completed} />
            </div>
          </TabsContent>

          <TabsContent value="gantt">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Timeline View</h3>
                  <p className="text-gray-600">
                    Advanced timeline view for project planning and tracking dependencies.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Coming soon with task dependencies and Gantt chart visualization.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}