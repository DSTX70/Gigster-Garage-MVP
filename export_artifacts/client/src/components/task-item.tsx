import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Calendar, Clock, MoreVertical, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, FileText, Link, Paperclip, User, Eye } from "lucide-react";
import type { Task } from "@shared/schema";
import { StatusBadge } from "@/components/status/StatusBadge";
import { type StatusKey } from "@/components/status/statusMap";
import { formatDistanceToNow, isAfter, isBefore, startOfDay, format } from "date-fns";
import ProgressSection from "./ProgressSection";
import { TaskDetailModal } from "./task-detail-modal";

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
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
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
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
        color: 'status-completed',
        icon: <CheckCircle className="text-green-600" size={16} />
      };
    }

    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const today = startOfDay(new Date());
      const isOverdue = isBefore(dueDate, today);
      const isDueToday = dueDate.getTime() === today.getTime();

      if (isOverdue) {
        return {
          label: 'Overdue',
          color: 'status-overdue',
          icon: <AlertTriangle className="text-red-500" size={16} />
        };
      }

      if (isDueToday) {
        return {
          label: 'Due Today',
          color: 'status-due-today',
          icon: <Clock className="text-orange-500" size={16} />
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
      return `Completed ${formatDistanceToNow(task.createdAt || new Date(), { addSuffix: true })}`;
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

  // Map old priority values and current status to StatusKey
  const mapToStatusKey = (value: string): StatusKey => {
    // If it's already a valid status, use it
    if (['critical', 'high', 'medium', 'low', 'complete', 'pending', 'overdue'].includes(value)) {
      return value as StatusKey;
    }
    // Map old priority values to new status values
    switch (value) {
      case 'high': return 'high';
      case 'medium': return 'medium'; 
      case 'low': return 'low';
      default: return 'pending';
    }
  };

  return (
    <>
    <div className={`gg-task-card fade-in-up group ${
      task.completed ? 'opacity-75' : ''
    } ${isOverdue ? 'border-red-200' : ''}`}>
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
                <StatusBadge status={mapToStatusKey(task.status || task.priority || 'medium')} size={16} />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDetailModalOpen(true)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
                title="View Details"
              >
                <Eye size={16} />
              </Button>
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
            {task.projectId && (
              <div className="flex items-center space-x-1 text-green-600">
                <FileText size={16} />
                <span>Project: {task.projectId}</span>
              </div>
            )}
            {task.assignedToId && (
              <div className="flex items-center space-x-1 text-blue-600">
                <User size={16} />
                <span>Assigned to: {task.assignedToId}</span>
              </div>
            )}
            <div className="flex items-center space-x-1 text-neutral-600">
              <Clock className="text-neutral-400" size={16} />
              <span>Created {formatDistanceToNow(new Date(task.createdAt || new Date()), { addSuffix: true })}</span>
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
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                      <FileText size={14} className="text-white" />
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-2xl rounded-tl-sm p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-gray-900">Notes</span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(task.createdAt || new Date()), 'MMM dd, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{task.notes}</p>
                    </div>
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
                    progressNotes={Array.isArray(task.progressNotes) ? task.progressNotes : []}
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

    <TaskDetailModal
      task={task}
      isOpen={isDetailModalOpen}
      onOpenChange={setIsDetailModalOpen}
    />
    </>
  );
}
