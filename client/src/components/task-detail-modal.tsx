import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  User, 
  FileText, 
  Paperclip, 
  ExternalLink, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  MessageSquare
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@shared/schema";

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailModal({ task, isOpen, onOpenChange }: TaskDetailModalProps) {
  const [newProgressDate, setNewProgressDate] = useState(new Date().toISOString().split('T')[0]);
  const [newProgressComment, setNewProgressComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addProgressMutation = useMutation({
    mutationFn: async ({ taskId, date, comment }: { taskId: string; date: string; comment: string }) => {
      return await apiRequest("POST", `/api/tasks/${taskId}/progress`, { date, comment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setNewProgressComment("");
      toast({
        title: "Progress Updated",
        description: "Task progress note has been added successfully.",
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

  const toggleCompleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return await apiRequest("PATCH", `/api/tasks/${taskId}`, { completed: !task?.completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: task?.completed ? "Task Reopened" : "Task Completed",
        description: task?.completed 
          ? "Task has been marked as active." 
          : "Great job! Task has been completed.",
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

  if (!task) return null;

  const handleAddProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgressComment.trim()) return;
    
    addProgressMutation.mutate({
      taskId: task.id,
      date: newProgressDate,
      comment: newProgressComment.trim(),
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusInfo = (task: Task) => {
    if (task.completed) {
      return {
        icon: <CheckCircle className="text-green-600" size={16} />,
        label: "Completed",
        color: "bg-green-100 text-green-800 border-green-200"
      };
    }
    
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      const isOverdue = dueDate < now;
      
      if (isOverdue) {
        return {
          icon: <AlertTriangle className="text-red-600" size={16} />,
          label: "Overdue",
          color: "bg-red-100 text-red-800 border-red-200"
        };
      }
    }
    
    return null;
  };

  const statusInfo = getStatusInfo(task);
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className={task.completed ? 'line-through text-gray-500' : ''}>
              {task.description}
            </span>
            <div className="flex items-center gap-2">
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              {statusInfo && (
                <Badge className={statusInfo.color}>
                  <span className="flex items-center gap-1">
                    {statusInfo.icon}
                    {statusInfo.label}
                  </span>
                </Badge>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>
            Complete task details and progress tracking
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>
                    {task.dueDate 
                      ? `Due: ${format(new Date(task.dueDate), 'PPPP \'at\' h:mm a')}`
                      : 'No due date set'
                    }
                  </span>
                </div>
                
                {task.assignedTo && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <User size={16} />
                    <span>Assigned to: {task.assignedTo.name}</span>
                  </div>
                )}

                {task.project && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <FileText size={16} />
                    <span>Project: {task.project.name}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} />
                  <span>
                    Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => toggleCompleteMutation.mutate(task.id)}
                    disabled={toggleCompleteMutation.isPending}
                    variant={task.completed ? "outline" : "default"}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    {task.completed ? 'Reopen Task' : 'Mark Complete'}
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Notes Section */}
            {task.notes && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <FileText size={20} />
                  Notes
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{task.notes}</p>
                </div>
              </div>
            )}

            {/* Attachments Section */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Paperclip size={20} />
                  Attachments ({task.attachments.length})
                </h3>
                <div className="space-y-2">
                  {task.attachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <FileText size={16} className="text-blue-600" />
                      <span className="text-sm">{file}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Links Section */}
            {task.links && task.links.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <ExternalLink size={20} />
                  Links ({task.links.length})
                </h3>
                <div className="space-y-2">
                  {task.links.map((link, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <ExternalLink size={16} className="text-blue-600" />
                      <a 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline truncate flex-1"
                      >
                        {link}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <MessageSquare size={20} />
                Progress Notes ({Array.isArray(task.progressNotes) ? task.progressNotes.length : 0})
              </h3>

              {/* Existing Progress Notes */}
              {task.progressNotes && Array.isArray(task.progressNotes) && task.progressNotes.length > 0 && (
                <div className="space-y-3">
                  {task.progressNotes
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((note: any) => (
                      <div key={note.id} className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-800">
                            Progress Update
                          </span>
                          <span className="text-xs text-blue-600">
                            {format(new Date(note.date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <p className="text-sm text-blue-800 whitespace-pre-wrap">{note.comment}</p>
                      </div>
                    ))}
                </div>
              )}

              {/* Add New Progress Note */}
              <form onSubmit={handleAddProgress} className="space-y-3 border-t pt-4">
                <h4 className="font-medium text-gray-900">Add Progress Update</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <Label htmlFor="progress-date" className="text-sm font-medium">
                      Date
                    </Label>
                    <Input
                      id="progress-date"
                      type="date"
                      value={newProgressDate}
                      onChange={(e) => setNewProgressDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Label htmlFor="progress-comment" className="text-sm font-medium">
                      Progress Update
                    </Label>
                    <Textarea
                      id="progress-comment"
                      value={newProgressComment}
                      onChange={(e) => setNewProgressComment(e.target.value)}
                      placeholder="Describe what progress was made on this task..."
                      rows={3}
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={addProgressMutation.isPending || !newProgressComment.trim()}
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  {addProgressMutation.isPending ? 'Adding...' : 'Add Progress Update'}
                </Button>
              </form>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}