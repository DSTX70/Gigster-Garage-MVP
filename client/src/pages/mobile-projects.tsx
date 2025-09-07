import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Folder, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  Home
} from "lucide-react";
import { format } from "date-fns";
import type { Project, Task } from "@shared/schema";

interface ProjectWithMetrics extends Project {
  progress: number;
  taskCount: number;
  completedTasks: number;
}

export default function MobileProjects() {
  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const isLoading = projectsLoading || tasksLoading;

  // Calculate metrics for each project
  const projectsWithMetrics: ProjectWithMetrics[] = projects.map(project => {
    const projectTasks = tasks.filter(task => task.projectId === project.id);
    const completedTasks = projectTasks.filter(task => task.completed).length;
    const taskCount = projectTasks.length;
    const progress = taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0;

    return {
      ...project,
      progress,
      taskCount,
      completedTasks
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 20) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#004C6D] to-[#0B1D3A] flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading Projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004C6D] to-[#0B1D3A]">
      {/* Header */}
      <div className="bg-[#004C6D] px-4 py-6 shadow-lg">
        <div className="flex items-center justify-between">
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
              <h1 className="text-2xl font-bold text-white">📁 Projects</h1>
              <p className="text-blue-100 text-sm">{projectsWithMetrics.length} projects</p>
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
      </div>

      <div className="p-4 space-y-4">
        {/* Project Stats */}
        <Card className="bg-white/95 backdrop-blur border-0 shadow-lg" data-testid="card-project-stats">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-[#004C6D]">
                  {projectsWithMetrics.filter(p => p.status === 'active').length}
                </div>
                <div className="text-xs text-gray-600">Active</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#004C6D]">
                  {projectsWithMetrics.filter(p => p.status === 'completed').length}
                </div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#004C6D]">
                  {Math.round(projectsWithMetrics.reduce((acc, p) => acc + p.progress, 0) / projectsWithMetrics.length) || 0}%
                </div>
                <div className="text-xs text-gray-600">Avg Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects List */}
        <div className="space-y-3">
          {projectsWithMetrics.map((project, index) => (
            <Card key={project.id} className="bg-white/95 backdrop-blur border-0 shadow-lg" data-testid={`card-project-${index}`}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <Badge className={`text-xs ${getStatusColor(project.status)}`}>
                      {project.status}
                    </Badge>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Task Stats */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-gray-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {project.completedTasks}/{project.taskCount} tasks
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-3 w-3 mr-1" />
                        Created {project.createdAt ? format(new Date(project.createdAt), 'MMM d') : 'Recently'}
                      </div>
                    </div>
                    <Link href={`/project/${project.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs text-[#004C6D] border-[#004C6D]/20 hover:bg-[#004C6D]/5"
                        data-testid={`button-view-project-${index}`}
                      >
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {projectsWithMetrics.length === 0 && (
            <Card className="bg-white/95 backdrop-blur border-0 shadow-lg">
              <CardContent className="py-12 text-center">
                <Folder className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Found</h3>
                <p className="text-gray-600 text-sm">
                  Create your first project to get started with organizing your work.
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

        {/* Add bottom padding */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}