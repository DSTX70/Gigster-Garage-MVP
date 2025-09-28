import { useState } from "react";
import { 
  DndContext, 
  DragEndEvent, 
  DragOverEvent, 
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Users, Calendar, AlertCircle } from "lucide-react";
import type { Task } from "@shared/schema";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ProjectBoardProps {
  tasks: Task[];
  projectId: string;
  onTaskClick: (task: Task) => void;
  onCreateTask: (status: string) => void;
}

type TaskStatus = "pending" | "critical" | "high" | "medium" | "low" | "complete" | "overdue";

const STATUS_COLUMNS: Record<TaskStatus, { title: string; color: string; bgColor: string }> = {
  pending: { title: "To Do", color: "text-gray-700", bgColor: "bg-gray-50" },
  critical: { title: "Critical", color: "text-red-700", bgColor: "bg-red-50" },
  high: { title: "High Priority", color: "text-orange-700", bgColor: "bg-orange-50" },
  medium: { title: "In Progress", color: "text-blue-700", bgColor: "bg-blue-50" },
  low: { title: "Low Priority", color: "text-green-700", bgColor: "bg-green-50" },
  complete: { title: "Completed", color: "text-emerald-700", bgColor: "bg-emerald-50" },
  overdue: { title: "Overdue", color: "text-red-700", bgColor: "bg-red-100" },
};

interface SortableTaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

function SortableTaskCard({ task, onClick }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const completedSubtasks = hasSubtasks ? task.subtasks!.filter(st => st.completed).length : 0;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 ${
        task.priority === "high" ? "border-l-red-500" :
        task.priority === "medium" ? "border-l-yellow-500" :
        "border-l-green-500"
      } ${isDragging ? "shadow-lg scale-105" : ""}`}
      onClick={() => onClick(task)}
      data-testid={`task-card-${task.id}`}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm leading-tight line-clamp-2">{task.description}</h4>
            {isOverdue && (
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 ml-2" />
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant="outline" 
              className={`text-xs ${
                task.priority === "high" ? "bg-red-100 text-red-800 border-red-200" :
                task.priority === "medium" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                "bg-green-100 text-green-800 border-green-200"
              }`}
            >
              {task.priority}
            </Badge>
            
            {task.completed && (
              <Badge className="bg-emerald-100 text-emerald-800 text-xs">Completed</Badge>
            )}
          </div>

          {hasSubtasks && (
            <div className="text-xs text-gray-600 bg-gray-100 rounded px-2 py-1">
              Subtasks: {completedSubtasks}/{task.subtasks!.length} completed
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              {task.assignedTo && (
                <span className="flex items-center" title={`Assigned to ${task.assignedTo.name}`}>
                  <Users className="h-3 w-3 mr-1" />
                  <span className="truncate max-w-20">{task.assignedTo.name}</span>
                </span>
              )}
            </div>
            
            {task.dueDate && (
              <span className={`flex items-center ${isOverdue ? "text-red-600 font-medium" : ""}`}>
                <Clock className="h-3 w-3 mr-1" />
                {format(new Date(task.dueDate), "MMM d")}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onCreateTask: (status: string) => void;
}

function KanbanColumn({ status, tasks, onTaskClick, onCreateTask }: KanbanColumnProps) {
  const column = STATUS_COLUMNS[status];
  
  return (
    <div className={`${column.bgColor} rounded-lg p-4 min-h-96 flex flex-col`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className={`font-semibold ${column.color}`}>{column.title}</h3>
          <Badge variant="secondary" className="bg-white/80">
            {tasks.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCreateTask(status)}
          className="h-8 w-8 p-0 hover:bg-white/50"
          data-testid={`add-task-${status}`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 flex-1">
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onClick={onTaskClick}
            />
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-sm">No tasks</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCreateTask(status)}
                className="mt-2 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add task
              </Button>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function ProjectBoard({ tasks, projectId, onTaskClick, onCreateTask }: ProjectBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      return await apiRequest(`/api/tasks/${taskId}`, "PATCH", { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", "project", projectId] });
      toast({
        title: "Task updated",
        description: "Task status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task status.",
        variant: "destructive",
      });
    },
  });

  // Group tasks by status
  const tasksByStatus = Object.keys(STATUS_COLUMNS).reduce((acc, status) => {
    acc[status as TaskStatus] = tasks.filter(task => task.status === status);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const taskId = active.id as string;
    const newStatus = over.id as string;

    // Check if it's dropped on a column (status)
    if (Object.keys(STATUS_COLUMNS).includes(newStatus)) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== newStatus) {
        updateTaskStatus.mutate({ taskId, status: newStatus });
      }
    }

    setActiveId(null);
  };

  const handleCreateTask = (status: string) => {
    onCreateTask(status);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 pb-6">
        {(Object.keys(STATUS_COLUMNS) as TaskStatus[]).map((status) => (
          <SortableContext key={status} items={[status]} strategy={verticalListSortingStrategy}>
            <div data-testid={`column-${status}`}>
              <KanbanColumn
                status={status}
                tasks={tasksByStatus[status]}
                onTaskClick={onTaskClick}
                onCreateTask={handleCreateTask}
              />
            </div>
          </SortableContext>
        ))}
      </div>
    </DndContext>
  );
}