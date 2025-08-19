import { AppHeader } from "@/components/app-header";
import { TaskForm } from "@/components/task-form";
import { TaskFilters } from "@/components/task-filters";
import { TaskList } from "@/components/task-list";
import { DesktopTaskViews } from "@/components/desktop-task-views";
import { ReminderSystem } from "@/components/reminder-system";
import { AssignmentFilter } from "@/components/assignment-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Folder, BarChart3, Calendar, Users } from "lucide-react";
import type { Project, Task } from "@shared/schema";

export default function Home() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <AppHeader />
      <ReminderSystem />
      
      {/* Hero Section */}
      <div className="vsuite-hero-section py-8 mb-8">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Task Management Hub</h1>
            <p className="text-blue-100 text-lg">Streamline your workflow with VSuite HQ</p>
          </div>
        </div>
      </div>
      
      <main className="max-w-6xl mx-auto px-6 pb-8">
        <TaskForm />
        
        {/* Projects Section */}
        {projects.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Projects</h3>
              <Badge variant="secondary">{projects.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => {
                const projectTasks = tasks.filter(task => task.projectId === project.id);
                const completedTasks = projectTasks.filter(task => task.completed);
                const progress = projectTasks.length > 0 ? (completedTasks.length / projectTasks.length) * 100 : 0;
                
                return (
                  <Link key={project.id} href={`/project/${project.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center">
                            <Folder className="h-5 w-5 mr-2 text-blue-600" />
                            {project.name}
                          </CardTitle>
                          <Badge className={
                            project.status === "active" ? "bg-green-100 text-green-800" :
                            project.status === "completed" ? "bg-blue-100 text-blue-800" :
                            project.status === "on-hold" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }>
                            {project.status}
                          </Badge>
                        </div>
                        {project.description && (
                          <p className="text-sm text-gray-600 mt-2">{project.description}</p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center text-gray-600">
                              <BarChart3 className="h-4 w-4 mr-1" />
                              Progress
                            </span>
                            <span className="font-medium">{Math.round(progress)}%</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center text-gray-600">
                              <Calendar className="h-4 w-4 mr-1" />
                              Tasks
                            </span>
                            <span>{completedTasks.length} / {projectTasks.length}</span>
                          </div>
                          <Button variant="outline" size="sm" className="w-full">
                            View Dashboard
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Enhanced Filter Section */}
        <div className="vsuite-accent-section mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Filter & Organize Tasks</h3>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <TaskFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
            <AssignmentFilter selectedAssignee={selectedAssignee} onAssigneeChange={setSelectedAssignee} />
          </div>
        </div>
        
        {/* Desktop-optimized task views */}
        <div className="hidden lg:block">
          <DesktopTaskViews 
            tasks={tasks.filter(task => {
              // Apply filters
              const matchesFilter = 
                activeFilter === 'all' || 
                (activeFilter === 'active' && !task.completed) ||
                (activeFilter === 'completed' && task.completed);
              
              const matchesAssignee = 
                selectedAssignee === 'all' || 
                task.assignedToId === selectedAssignee;
                
              return matchesFilter && matchesAssignee;
            })}
          />
        </div>
        
        {/* Mobile task list */}
        <div className="block lg:hidden">
          <TaskList filter={activeFilter} assigneeFilter={selectedAssignee} />
        </div>
      </main>
    </div>
  );
}
