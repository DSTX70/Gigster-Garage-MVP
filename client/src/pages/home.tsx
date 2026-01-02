import { AppHeader } from "@/components/app-header";
import { copy } from "@/lib/copy";
import { useTranslation } from "@/lib/i18n";
import { TaskForm } from "@/components/task-form";
import { TaskFilters } from "@/components/task-filters";
import { TaskList } from "@/components/task-list";
import { DesktopTaskViews } from "@/components/desktop-task-views";
import { ReminderSystem } from "@/components/reminder-system";
import { AssignmentFilter } from "@/components/assignment-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Folder, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import type { Project, Task } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { DemoUpgradePrompt } from "@/components/DemoUpgradePrompt";
import { NewMenuButton } from "@/components/dashboard/NewMenuButton";
import { DashboardActionGrid } from "@/components/dashboard/DashboardActionGrid";

export default function Home() {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
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
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <AppHeader />
      <ReminderSystem />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8 lg:py-12">
        {/* Dashboard Header */}
        <div className="mb-8 lg:mb-12">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="gg-h1 text-2xl sm:text-3xl font-bold" style={{ color: "var(--text)" }}>
                {t("myDashboard")}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-2">{t("welcomeMessage")}</p>
            </div>

            <div className="flex items-center gap-2">
              <NewMenuButton onNewTask={() => setIsNewTaskOpen(true)} />
            </div>
          </div>
        </div>

        {/* Demo Mode Upgrade Prompt */}
        <div className="mb-6 sm:mb-8">
          <DemoUpgradePrompt context="general" compact={true} />
        </div>

        {/* Urgent & Overview Section - 4 KPIs only */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12">
          {/* Overdue Tasks - thick red border (urgent) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/tasks?filter=overdue">
                <Card className="border-l-4 border-l-red-500 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" data-testid="kpi-overdue">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-red-600">{t('overdue')}</p>
                        <p className="text-2xl font-bold text-red-700">{overdueTasks.length}</p>
                      </div>
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('overdueTooltip')}</p>
            </TooltipContent>
          </Tooltip>

          {/* Due Soon - amber icon tint only (highlight) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/tasks?filter=due-soon">
                <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" data-testid="kpi-due-soon">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-amber-600">{t('dueSoon')}</p>
                        <p className="text-2xl font-bold text-gray-900">{urgentTasks.length}</p>
                      </div>
                      <Clock className="h-5 w-5 text-amber-500" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('dueSoonTooltip')}</p>
            </TooltipContent>
          </Tooltip>

          {/* High Priority - subtle neutral card */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/tasks?filter=high-priority">
                <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" data-testid="kpi-high-priority">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-600">{t('highPriority')}</p>
                        <p className="text-2xl font-bold text-gray-900">{highPriorityTasks.length}</p>
                      </div>
                      <AlertTriangle className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('highPriorityTooltip')}</p>
            </TooltipContent>
          </Tooltip>

          {/* Completed Today - navy selected state */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/tasks?filter=completed-today">
                <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" data-testid="kpi-completed-today">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-600">{t('completedToday')}</p>
                        <p className="text-2xl font-bold text-[#0B1D3A]">{completedToday.length}</p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-[#2EC5C2]" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('completedTodayTooltip')}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Quick Actions (clean grouped grid) */}
        <div className="mb-8 lg:mb-12">
          <DashboardActionGrid />
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
                      <Card className={`hover:shadow-md transition-all duration-200 cursor-pointer border group ${
                        projectOverdue.length > 0 ? "border-l-4 border-l-red-500 border-gray-200" : "border-gray-200"
                      }`}>
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center">
                              <Folder className="h-5 w-5 mr-3 text-gray-500 group-hover:text-[#0B1D3A]" />
                              <div>
                                <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-[#0B1D3A]">
                                  {project.name}
                                </CardTitle>
                                {project.description && (
                                  <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                                )}
                              </div>
                            </div>
                            <Badge className={
                              project.status === "active" ? "bg-[#0B1D3A] text-white" :
                              project.status === "completed" ? "bg-gray-100 text-gray-700 border border-gray-200" :
                              project.status === "on-hold" ? "bg-gray-100 text-gray-600 border border-gray-200" :
                              "bg-red-50 text-red-700 border border-red-200"
                            }>
                              {project.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            {/* Outstanding Tasks */}
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Outstanding</span>
                              <span className="text-sm font-medium text-gray-900">{outstandingTasks.length}</span>
                            </div>
                            
                            {/* Critical Tasks */}
                            {criticalTasks.length > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">High Priority</span>
                                <span className="text-sm font-medium text-gray-900">{criticalTasks.length}</span>
                              </div>
                            )}
                            
                            {/* Overdue Tasks */}
                            {projectOverdue.length > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-red-600">Overdue</span>
                                <span className="text-sm font-medium text-red-700">{projectOverdue.length}</span>
                              </div>
                            )}
                            
                            {/* Progress Bar */}
                            <div className="pt-2">
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-medium text-gray-900">
                                  {completionPercentage}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-[#2EC5C2] h-2 rounded-full transition-all duration-300"
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
                        <p className="text-red-600">{projectOverdue.length} overdue tasks</p>
                      )}
                      {criticalTasks.length > 0 && (
                        <p className="text-gray-600">{criticalTasks.length} high priority tasks</p>
                      )}
                      <p className="text-xs opacity-75">Click to view project dashboard</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* New Task Modal (triggered from + New menu) */}
        <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {copy.tasks.createButton}
              </DialogTitle>
            </DialogHeader>
            <TaskForm onSuccess={() => setIsNewTaskOpen(false)} />
          </DialogContent>
        </Dialog>

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
