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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Folder, BarChart3, Calendar, Users, Plus, AlertTriangle, Clock, CheckCircle2, ChevronDown, FileText, Mail, FolderOpen, Zap, BookOpen } from "lucide-react";
import { format } from "date-fns";
import type { Project, Task } from "@shared/schema";
import { StatusBadge } from "@/components/status/StatusBadge";

export default function Home() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Calculate urgent and overview stats
  const now = new Date();
  const urgentTasks = tasks.filter(task => {
    if (task.completed) return false;
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const timeDiff = dueDate.getTime() - now.getTime();
    return timeDiff <= 24 * 60 * 60 * 1000; // Due within 24 hours
  });

  const overdueTasks = tasks.filter(task => {
    if (task.completed) return false;
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < now;
  });

  const criticalTasks = tasks.filter(task => !task.completed && task.status === 'critical');
  const highStatusTasks = tasks.filter(task => !task.completed && task.status === 'high');
  const highPriorityTasks = tasks.filter(task => !task.completed && task.priority === 'high');
  
  const completedToday = tasks.filter(task => {
    if (!task.completed || !task.createdAt) return false;
    const taskDate = new Date(task.createdAt);
    const today = new Date();
    return taskDate.toDateString() === today.toDateString();
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <ReminderSystem />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Dashboard Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Dashboard</h1>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
              <Link href="/user-manual">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full sm:w-auto bg-green-600 text-white border-green-600 hover:bg-green-700 hover:border-green-700"
                  data-testid="button-user-manual"
                >
                  <BookOpen className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">User Manual</span>
                  <span className="sm:hidden">Manual</span>
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full sm:w-auto bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700"
                onClick={() => setIsNewTaskOpen(true)}
                data-testid="button-new-task-header"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Task
              </Button>
            </div>
          </div>
          <p className="text-sm sm:text-base text-gray-600">Welcome back! Here's what's happening with your tasks and projects.</p>
        </div>

        {/* Urgent & Overview Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* Overdue Tasks */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/tasks?filter=overdue">
                <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-red-600">Overdue</p>
                        <p className="text-2xl font-bold text-red-700">{overdueTasks.length}</p>
                      </div>
                      <AlertTriangle className="h-6 w-6 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tasks that are past their due date. Click to view and prioritize overdue tasks.</p>
            </TooltipContent>
          </Tooltip>

          {/* Due Soon */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/tasks?filter=due-soon">
                <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-yellow-600">Due Soon</p>
                        <p className="text-2xl font-bold text-yellow-700">{urgentTasks.length}</p>
                      </div>
                      <Clock className="h-6 w-6 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tasks due within the next 24 hours. Click to review upcoming deadlines.</p>
            </TooltipContent>
          </Tooltip>

          {/* High Priority */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/tasks?filter=high-priority">
                <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-orange-600">High Priority</p>
                        <p className="text-2xl font-bold text-orange-700">{highPriorityTasks.length}</p>
                      </div>
                      <AlertTriangle className="h-6 w-6 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tasks marked as high priority that need immediate attention. Click to view all high priority items.</p>
            </TooltipContent>
          </Tooltip>

          {/* Completed Today */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/tasks?filter=completed-today">
                <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-green-600">Completed Today</p>
                        <p className="text-2xl font-bold text-green-700">{completedToday.length}</p>
                      </div>
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tasks you've completed today. Great job! Click to review your daily accomplishments.</p>
            </TooltipContent>
          </Tooltip>

          {/* Productivity Tools */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/productivity">
                <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-all duration-200 cursor-pointer bg-gradient-to-br from-amber-50 to-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-amber-600">Time Tracking</p>
                        <p className="text-lg font-bold text-amber-800">Tools</p>
                      </div>
                      <BarChart3 className="h-6 w-6 text-amber-500" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Access time tracking tools and productivity insights to monitor your work patterns and efficiency.</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Client Management Section */}
        <div className="mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/clients">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="bg-purple-100 p-2 sm:p-3 rounded-lg">
                          <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900">Client Management</h3>
                          <p className="text-xs sm:text-sm text-gray-600">Manage client relationships & history</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Manage client profiles, contact information, and relationship history for better client service.</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/messages">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                          <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900">Messages</h3>
                          <p className="text-xs sm:text-sm text-gray-600">Client communication</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Send and receive professional emails with clients. Integrated communication system for streamlined correspondence.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Quick Actions - Document Creation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/create-proposal">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                        <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900">Create Proposal</h3>
                        <p className="text-xs sm:text-sm text-gray-600">Professional project proposals</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create professional project proposals with detailed scope, timeline, and pricing information for clients.</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/create-invoice">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
                        <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900">Create Invoice</h3>
                        <p className="text-xs sm:text-sm text-gray-600">Professional billing & invoices</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Generate professional invoices with itemized services, rates, and payment terms. Includes draft system for approval workflows.</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/create-contract">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="bg-purple-100 p-2 sm:p-3 rounded-lg">
                        <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900">Create Contract</h3>
                        <p className="text-xs sm:text-sm text-gray-600">Legal agreements & terms</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Draft legal agreements and contracts with clear terms, conditions, and project specifications.</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/create-presentation">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="bg-orange-100 p-2 sm:p-3 rounded-lg">
                        <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900">Create Presentation</h3>
                        <p className="text-xs sm:text-sm text-gray-600">Slide decks & presentations</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Build professional slide decks and presentations for client meetings, project pitches, and business proposals.</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/productivity">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="bg-amber-100 p-2 sm:p-3 rounded-lg">
                        <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900">Productivity Tools</h3>
                        <p className="text-xs sm:text-sm text-gray-600">Time tracking & insights</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Track time spent on tasks and projects. Monitor productivity patterns and generate insightful reports for better time management.</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/agency-hub">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-purple-500">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="bg-purple-100 p-2 sm:p-3 rounded-lg">
                        <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900">Agency Hub</h3>
                        <p className="text-xs sm:text-sm text-gray-600">AI-powered marketing tools</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Access AI-powered marketing tools including content creation, image generation, copywriting, and campaign strategy development.</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/filing-cabinet">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="bg-gray-100 p-2 sm:p-3 rounded-lg">
                        <FolderOpen className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900">Filing Cabinet</h3>
                        <p className="text-xs sm:text-sm text-gray-600">Organize all files & documents</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Centralized document management system for organizing files, contracts, proposals, and business documents with search capabilities.</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Project Folders Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Projects</h2>
            <Badge variant="secondary" className="text-xs sm:text-sm">{projects.length} active</Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {projects.map((project) => {
              const projectTasks = tasks.filter(task => task.projectId === project.id);
              const outstandingTasks = projectTasks.filter(task => !task.completed);
              const criticalTasks = outstandingTasks.filter(task => task.priority === 'high');
              const projectOverdue = outstandingTasks.filter(task => {
                if (!task.dueDate) return false;
                return new Date(task.dueDate) < now;
              });
              
              const completionPercentage = projectTasks.length > 0 
                ? Math.round(((projectTasks.length - outstandingTasks.length) / projectTasks.length) * 100)
                : 0;
                
              return (
                <Tooltip key={project.id}>
                  <TooltipTrigger asChild>
                    <Link href={`/project/${project.id}`}>
                      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500 group">
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center">
                              <Folder className="h-6 w-6 mr-3 text-blue-600 group-hover:text-blue-700" />
                              <div>
                                <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-700">
                                  {project.name}
                                </CardTitle>
                                {project.description && (
                                  <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                                )}
                              </div>
                            </div>
                            <Badge className={
                              project.status === "active" ? "bg-green-100 text-green-800" :
                              project.status === "completed" ? "bg-blue-100 text-blue-800" :
                              project.status === "on-hold" ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            }>
                              {project.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            {/* Outstanding Tasks */}
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600">Outstanding Tasks</span>
                              <Badge variant="secondary">{outstandingTasks.length}</Badge>
                            </div>
                            
                            {/* Critical Tasks */}
                            {criticalTasks.length > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-orange-600">Critical Priority</span>
                                <Badge className="bg-orange-100 text-orange-800">{criticalTasks.length}</Badge>
                              </div>
                            )}
                            
                            {/* Overdue Tasks */}
                            {projectOverdue.length > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-red-600">Overdue</span>
                                <Badge className="bg-red-100 text-red-800">{projectOverdue.length}</Badge>
                              </div>
                            )}
                            
                            {/* Progress Bar */}
                            <div className="pt-2">
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-medium">
                                  {completionPercentage}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${completionPercentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-medium">{project.name} - {completionPercentage}% Complete</p>
                      <p>Status: {project.status} • {outstandingTasks.length} tasks remaining</p>
                      {projectOverdue.length > 0 && (
                        <p className="text-red-600">⚠️ {projectOverdue.length} overdue tasks</p>
                      )}
                      {criticalTasks.length > 0 && (
                        <p className="text-orange-600">🔥 {criticalTasks.length} high priority tasks</p>
                      )}
                      <p className="text-xs opacity-75">Click to view project dashboard</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Collapsible New Task Section */}
        <div className="mb-6 sm:mb-8">
          <Collapsible open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                size="lg"
                className="w-full justify-between py-4 sm:py-6 text-left hover:bg-blue-50 border-2 border-dashed border-gray-300 hover:border-blue-300"
                data-testid="button-new-task-collapsible"
              >
                <div className="flex items-center">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-3 text-blue-600" />
                  <span className="text-base sm:text-lg font-medium">New Task</span>
                </div>
                <ChevronDown className={`h-4 w-4 sm:h-5 sm:w-5 text-gray-400 transition-transform ${isNewTaskOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <Card className="border-2 border-blue-200">
                <CardContent className="p-4 sm:p-6">
                  <TaskForm onSuccess={() => setIsNewTaskOpen(false)} />
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Tasks Overview - Desktop optimized views */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Tasks Overview</h2>
            <div className="flex items-center space-x-4">
              <TaskFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
              <AssignmentFilter selectedAssignee={selectedAssignee} onAssigneeChange={setSelectedAssignee} />
            </div>
          </div>
          
          <DesktopTaskViews 
            tasks={tasks.filter(task => {
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
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Tasks</h2>
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4">
              <TaskFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
              <AssignmentFilter selectedAssignee={selectedAssignee} onAssigneeChange={setSelectedAssignee} />
            </div>
          </div>
          <TaskList filter={activeFilter} assigneeFilter={selectedAssignee} />
        </div>
      </main>
    </div>
  );
}
