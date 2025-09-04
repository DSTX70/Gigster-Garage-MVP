import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Users,
  Filter,
  Search,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight,
} from "lucide-react";
import type { Project, Task } from "@shared/schema";
import { format } from "date-fns";

interface ProjectListProps {
  onCreateProject: () => void;
}

interface ProjectWithStats extends Project {
  taskCount: number;
  completedTasks: number;
  overdueTasks: number;
  highPriorityTasks: number;
  progressPercentage: number;
  tasks: Task[];
}

export function ProjectList({ onCreateProject }: ProjectListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: allTasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const projectsWithStats: ProjectWithStats[] = useMemo(() => {
    return projects.map(project => {
      const projectTasks = allTasks.filter(task => task.projectId === project.id);
      const completedTasks = projectTasks.filter(task => task.completed);
      const overdueTasks = projectTasks.filter(task => 
        task.dueDate && new Date(task.dueDate) < new Date() && !task.completed
      );
      const highPriorityTasks = projectTasks.filter(task => 
        task.priority === "high" && !task.completed
      );
      
      return {
        ...project,
        taskCount: projectTasks.length,
        completedTasks: completedTasks.length,
        overdueTasks: overdueTasks.length,
        highPriorityTasks: highPriorityTasks.length,
        progressPercentage: projectTasks.length > 0 
          ? (completedTasks.length / projectTasks.length) * 100 
          : 0,
        tasks: projectTasks,
      };
    });
  }, [projects, allTasks]);

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projectsWithStats;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "progress":
          return b.progressPercentage - a.progressPercentage;
        case "tasks":
          return b.taskCount - a.taskCount;
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [projectsWithStats, searchQuery, statusFilter, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "on-hold":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-blue-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
        <Button onClick={onCreateProject} data-testid="create-project-button">
          <Plus className="h-4 w-4 mr-2" />
Spark New Project
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="project-search"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" data-testid="status-filter">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40" data-testid="sort-filter">
                <BarChart3 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
                <SelectItem value="tasks">Task Count</SelectItem>
                <SelectItem value="created">Created Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedProjects.map((project) => (
          <Card 
            key={project.id} 
            className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
            data-testid={`project-card-${project.id}`}
          >
            <Link href={`/project/${project.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold group-hover:text-blue-600 transition-colors truncate">
                      {project.name}
                    </CardTitle>
                    {project.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 ml-2" />
                </div>
                
                <div className="flex items-center space-x-2 mt-3">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(project.status)}`}
                  >
                    {project.status}
                  </Badge>
                  
                  {project.startDate && (
                    <span className="text-xs text-gray-500 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(project.startDate), "MMM yyyy")}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Progress</span>
                    <span className="font-bold">{Math.round(project.progressPercentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progressPercentage)}`}
                      style={{ width: `${project.progressPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600">
                    {project.completedTasks} of {project.taskCount} tasks completed
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="flex items-center justify-center mb-1">
                      <BarChart3 className="h-4 w-4 text-blue-500" />
                    </div>
                    <p className="text-sm font-bold text-gray-900">{project.taskCount}</p>
                    <p className="text-xs text-gray-600">Tasks</p>
                  </div>
                  
                  <div className="bg-red-50 rounded-lg p-2">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="h-4 w-4 text-red-500" />
                    </div>
                    <p className="text-sm font-bold text-red-600">{project.overdueTasks}</p>
                    <p className="text-xs text-red-600">Overdue</p>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-lg p-2">
                    <div className="flex items-center justify-center mb-1">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    </div>
                    <p className="text-sm font-bold text-yellow-600">{project.highPriorityTasks}</p>
                    <p className="text-xs text-yellow-600">High Priority</p>
                  </div>
                </div>

                {/* Recent Activity */}
                {project.tasks.length > 0 && (
                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">Recent Tasks</p>
                    <div className="space-y-1">
                      {project.tasks
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 2)
                        .map((task) => (
                          <div key={task.id} className="flex items-center space-x-2 text-xs">
                            {task.completed ? (
                              <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                            ) : (
                              <div className="h-3 w-3 border border-gray-300 rounded-full flex-shrink-0" />
                            )}
                            <span className={`truncate ${task.completed ? "line-through text-gray-500" : "text-gray-700"}`}>
                              {task.description}
                            </span>
                          </div>
                        ))}
                      
                      {project.tasks.length > 2 && (
                        <p className="text-xs text-gray-500 italic">
                          +{project.tasks.length - 2} more tasks
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedProjects.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery || statusFilter !== "all" ? "No projects found" : "No projects yet"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || statusFilter !== "all" 
                ? "Try adjusting your search or filters" 
                : "Get started by creating your first project"
              }
            </p>
            {(!searchQuery && statusFilter === "all") && (
              <Button onClick={onCreateProject}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {filteredAndSortedProjects.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredAndSortedProjects.length}</p>
                </div>
                <BarChart3 className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-green-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredAndSortedProjects.filter(p => p.status === "completed").length}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-yellow-600">Active</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {filteredAndSortedProjects.filter(p => p.status === "active").length}
                  </p>
                </div>
                <div className="w-6 h-6 bg-yellow-500 rounded" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-600">Avg Progress</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(
                      filteredAndSortedProjects.reduce((acc, p) => acc + p.progressPercentage, 0) / 
                      filteredAndSortedProjects.length
                    )}%
                  </p>
                </div>
                <Progress value={
                  filteredAndSortedProjects.reduce((acc, p) => acc + p.progressPercentage, 0) / 
                  filteredAndSortedProjects.length
                } className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}