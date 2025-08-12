import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Calendar, Clock, MoreVertical, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, FileText, Link, Paperclip, User } from "lucide-react";
import type { Task } from "@shared/schema";
import { formatDistanceToNow, isAfter, isBefore, startOfDay } from "date-fns";
import ProgressSection from "./ProgressSection";

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
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

  const addProgressMutation = useMutation({
    mutationFn: async ({ id, progressData }: { id: string; progressData: { date: string; comment: string } }) => {
      const response = await apiRequest("POST", `/api/tasks/${id}/progress`, progressData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Progress Added",
        description: "Your progress note has been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add progress note",
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

  const handleAddProgress = (progressData: { date: string; comment: string }) => {
    addProgressMutation.mutate({
      id: task.id,
      progressData,
    });
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
  
  const hasExtendedContent = task.notes || (task.attachments && task.attachments.length > 0) || (task.links && task.links.length > 0);

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
              {hasExtendedContent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-neutral-400 hover:text-neutral-600 p-1"
                >
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </Button>
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
            {task.project && (
              <div className="flex items-center space-x-1 text-green-600">
                <FileText size={16} />
                <span>Project: {task.project.name}</span>
              </div>
            )}
            {task.assignedTo && (
              <div className="flex items-center space-x-1 text-blue-600">
                <User size={16} />
                <span>Assigned to: {task.assignedTo.name}</span>
              </div>
            )}
            <div className="flex items-center space-x-1 text-neutral-600">
              <Clock className="text-neutral-400" size={16} />
              <span>Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
            </div>
            {hasExtendedContent && (
              <div className="flex items-center space-x-1 text-neutral-500">
                {task.notes && <FileText size={14} />}
                {task.attachments && task.attachments.length > 0 && <Paperclip size={14} />}
                {task.links && task.links.length > 0 && <Link size={14} />}
              </div>
            )}
          </div>

          {hasExtendedContent && (
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleContent className="mt-4 space-y-3">
                {task.notes && (
                  <div className="bg-neutral-50 p-3 rounded-lg">
                    <div className="flex items-center mb-2">
                      <FileText size={16} className="text-neutral-600 mr-2" />
                      <span className="text-sm font-medium text-neutral-700">Notes</span>
                    </div>
                    <p className="text-sm text-neutral-700 whitespace-pre-wrap">{task.notes}</p>
                  </div>
                )}

                {task.attachments && task.attachments.length > 0 && (
                  <div className="bg-neutral-50 p-3 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Paperclip size={16} className="text-neutral-600 mr-2" />
                      <span className="text-sm font-medium text-neutral-700">
                        Attachments ({task.attachments.length})
                      </span>
                    </div>
                    <div className="space-y-1">
                      {task.attachments.map((file, index) => (
                        <div key={index} className="flex items-center text-sm text-neutral-600">
                          <FileText size={14} className="mr-2" />
                          <span>{file}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {task.links && task.links.length > 0 && (
                  <div className="bg-neutral-50 p-3 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Link size={16} className="text-neutral-600 mr-2" />
                      <span className="text-sm font-medium text-neutral-700">
                        Links ({task.links.length})
                      </span>
                    </div>
                    <div className="space-y-1">
                      {task.links.map((link, index) => (
                        <div key={index} className="flex items-center">
                          <Link size={14} className="mr-2 text-blue-600" />
                          <a 
                            href={link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline truncate"
                          >
                            {link}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Progress Section */}
                <div className="mt-4">
                  <ProgressSection 
                    progressNotes={task.progressNotes || []}
                    onAddProgress={handleAddProgress}
                    isLoading={addProgressMutation.isPending}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>
    </div>
  );
}
