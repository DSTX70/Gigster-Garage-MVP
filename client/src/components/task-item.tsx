import { useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Calendar, Clock, MoreVertical, AlertTriangle, CheckCircle } from "lucide-react";
import type { Task } from "@shared/schema";
import { formatDistanceToNow, isAfter, isBefore, startOfDay } from "date-fns";

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { toast } = useToast();

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const response = await apiRequest("PATCH", `/api/tasks/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: task.completed ? "Task marked as incomplete" : "Task completed!",
        description: task.completed ? "Task is now active" : "Great job staying productive.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task deleted",
        description: "Task has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  const handleToggleComplete = () => {
    updateTaskMutation.mutate({
      id: task.id,
      updates: { completed: !task.completed }
    });
  };

  const handleDelete = () => {
    deleteTaskMutation.mutate(task.id);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-blue-100 text-blue-700';
      case 'low': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
      default: return priority;
    }
  };

  const getStatusInfo = () => {
    if (task.completed) {
      return {
        label: 'Completed',
        color: 'bg-green-100 text-green-700',
        icon: <CheckCircle className="text-secondary" size={16} />
      };
    }

    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const today = startOfDay(new Date());
      const isOverdue = isBefore(dueDate, today);

      if (isOverdue) {
        return {
          label: 'Overdue',
          color: 'bg-red-100 text-red-700',
          icon: <AlertTriangle className="text-red-500" size={16} />
        };
      }
    }

    return null;
  };

  const getDueDateText = () => {
    if (!task.dueDate) return null;

    const dueDate = new Date(task.dueDate);
    const today = startOfDay(new Date());
    const isOverdue = isBefore(dueDate, today);
    const isToday = dueDate.getTime() === today.getTime();
    const isTomorrow = dueDate.getTime() === today.getTime() + 24 * 60 * 60 * 1000;

    if (task.completed) {
      return `Completed ${formatDistanceToNow(task.createdAt, { addSuffix: true })}`;
    }

    if (isOverdue) {
      return `Was due ${formatDistanceToNow(dueDate, { addSuffix: true })}`;
    }

    if (isToday) {
      return 'Due today';
    }

    if (isTomorrow) {
      return 'Due tomorrow';
    }

    return `Due ${formatDistanceToNow(dueDate, { addSuffix: true })}`;
  };

  const statusInfo = getStatusInfo();
  const isOverdue = task.dueDate && !task.completed && isBefore(new Date(task.dueDate), startOfDay(new Date()));

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow duration-200 ${
      task.completed ? 'opacity-75' : ''
    } ${isOverdue ? 'border-red-200' : 'border-neutral-200'}`}>
      <div className="flex items-start space-x-4">
        <button
          onClick={handleToggleComplete}
          disabled={updateTaskMutation.isPending}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200 ${
            task.completed
              ? 'border-secondary bg-secondary text-white'
              : isOverdue
              ? 'border-red-300 hover:border-red-500'
              : 'border-neutral-300 hover:border-primary'
          }`}
        >
          {task.completed && <span className="text-xs">✓</span>}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-base font-medium ${
              task.completed ? 'text-neutral-500 line-through' : 'text-neutral-800'
            }`}>
              {task.description}
            </h3>
            <div className="flex items-center space-x-2">
              {statusInfo ? (
                <Badge className={`px-2 py-1 text-xs font-medium rounded ${statusInfo.color}`}>
                  {statusInfo.label}
                </Badge>
              ) : (
                <Badge className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(task.priority)}`}>
                  {getPriorityLabel(task.priority)}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleteTaskMutation.isPending}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <MoreVertical size={16} />
              </Button>
            </div>
          </div>
          
          <div className={`flex items-center space-x-4 text-sm ${
            isOverdue && !task.completed ? 'text-red-600' : task.completed ? 'text-neutral-500' : 'text-neutral-600'
          }`}>
            {task.dueDate && (
              <div className="flex items-center space-x-1">
                {statusInfo?.icon || (isOverdue ? <AlertTriangle size={16} /> : <Calendar className="text-accent" size={16} />)}
                <span>{getDueDateText()}</span>
              </div>
            )}
            <div className="flex items-center space-x-1 text-neutral-600">
              <Clock className="text-neutral-400" size={16} />
              <span>Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
