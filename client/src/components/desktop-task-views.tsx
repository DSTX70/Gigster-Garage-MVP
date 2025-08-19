import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, Users, AlertCircle, CheckCircle2, MoreHorizontal, GitBranch } from "lucide-react";
import { format } from "date-fns";
import type { Task } from "@shared/schema";

interface DesktopTaskViewsProps {
  tasks: Task[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

export function DesktopTaskViews({ tasks, onTaskUpdate }: DesktopTaskViewsProps) {
  const [activeView, setActiveView] = useState<"columns" | "kanban" | "gantt">("columns");

  const tasksByStatus = {
    todo: tasks.filter(task => !task.completed && (!task.progressNotes || (Array.isArray(task.progressNotes) && task.progressNotes.length === 0))),
    inProgress: tasks.filter(task => !task.completed && task.progressNotes && Array.isArray(task.progressNotes) && task.progressNotes.length > 0),
    completed: tasks.filter(task => task.completed),
  };

  const priorityOrder = { high: 3, medium: 2, low: 1 };
  const sortedTasks = [...tasks].sort((a, b) => {
    // First by completion status
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // Then by priority
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    // Finally by due date
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });

  const TaskCard = ({ task, compact = false }: { task: Task; compact?: boolean }) => {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
    const isDueSoon = task.dueDate && new Date(task.dueDate).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000;

    return (
      <Card className={`hover:shadow-md transition-all ${
        isOverdue ? "border-l-4 border-l-red-500" :
        isDueSoon ? "border-l-4 border-l-yellow-500" :
        task.priority === "high" ? "border-l-4 border-l-red-400" :
        "border-l-4 border-l-blue-500"
      } ${compact ? "p-3" : ""}`}>
        <CardContent className={compact ? "p-3" : "p-4"}>
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={(checked) => 
                    onTaskUpdate?.(task.id, { completed: !!checked })
                  }
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium ${task.completed ? "line-through text-gray-500" : ""} ${
                    compact ? "text-sm" : "text-base"
                  }`}>
                    {task.description}
                  </h4>
                  {task.parentTaskId && (
                    <div className="flex items-center mt-1 text-xs text-purple-600">
                      <GitBranch className="h-3 w-3 mr-1" />
                      Subtask
                    </div>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge className={`${
                task.priority === "high" ? "bg-red-100 text-red-800" :
                task.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                "bg-green-100 text-green-800"
              }`}>
                {task.priority}
              </Badge>
              
              {task.project && (
                <Badge variant="outline" className="text-xs">
                  {task.project.name}
                </Badge>
              )}

              {isOverdue && (
                <Badge className="bg-red-100 text-red-800">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              )}

              {task.completed && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Done
                </Badge>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-3">
                {task.assignedTo && (
                  <span className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {task.assignedTo.name}
                  </span>
                )}
                {task.dueDate && (
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {format(new Date(task.dueDate), "MMM d, h:mm a")}
                  </span>
                )}
              </div>
              {task.subtasks && task.subtasks.length > 0 && (
                <span className="flex items-center">
                  <GitBranch className="h-3 w-3 mr-1" />
                  {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ColumnView = () => (
    <div className="space-y-4">
      {/* Overdue Section */}
      {tasks.some(task => task.dueDate && new Date(task.dueDate) < new Date() && !task.completed) && (
        <div>
          <h3 className="font-semibold text-red-800 mb-3 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Overdue ({tasks.filter(task => task.dueDate && new Date(task.dueDate) < new Date() && !task.completed).length})
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {tasks
              .filter(task => task.dueDate && new Date(task.dueDate) < new Date() && !task.completed)
              .map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        </div>
      )}

      {/* All Tasks */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          All Tasks ({sortedTasks.length})
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedTasks.map(task => <TaskCard key={task.id} task={task} />)}
        </div>
      </div>
    </div>
  );

  const KanbanColumn = ({ title, tasks, className }: { title: string; tasks: Task[]; className?: string }) => (
    <div className={`bg-gray-50 rounded-lg p-4 min-h-96 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <Badge variant="secondary">{tasks.length}</Badge>
      </div>
      <div className="space-y-3">
        {tasks.map(task => <TaskCard key={task.id} task={task} compact />)}
      </div>
    </div>
  );

  const KanbanView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-96">
      <KanbanColumn title="To Do" tasks={tasksByStatus.todo} />
      <KanbanColumn title="In Progress" tasks={tasksByStatus.inProgress} />
      <KanbanColumn title="Completed" tasks={tasksByStatus.completed} />
    </div>
  );

  const GanttView = () => (
    <Card>
      <CardContent className="p-6">
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Timeline View</h3>
          <p className="text-gray-600 mb-4">
            Advanced Gantt chart view for project planning and dependency tracking.
          </p>
          <p className="text-sm text-gray-500">
            Coming soon with enhanced project management features.
          </p>
        </div>
      </CardContent>
    </Card>
  );

  // Only show desktop views on larger screens
  const [isDesktop, setIsDesktop] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
      checkDesktop();
      window.addEventListener('resize', checkDesktop);
      return () => window.removeEventListener('resize', checkDesktop);
    }
  }, []);

  if (!isDesktop) {
    return <div className="space-y-4">{sortedTasks.map(task => <TaskCard key={task.id} task={task} />)}</div>;
  }

  return (
    <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)} className="w-full">
      <div className="flex justify-between items-center mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="columns">Column View</TabsTrigger>
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
          <TabsTrigger value="gantt">Timeline</TabsTrigger>
        </TabsList>
        
        <div className="text-sm text-gray-600">
          {tasks.length} tasks • {tasks.filter(t => t.completed).length} completed
        </div>
      </div>

      <TabsContent value="columns">
        <ColumnView />
      </TabsContent>

      <TabsContent value="kanban">
        <KanbanView />
      </TabsContent>

      <TabsContent value="gantt">
        <GanttView />
      </TabsContent>
    </Tabs>
  );
}