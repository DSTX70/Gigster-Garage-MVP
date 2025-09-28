import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  Users,
  FileText,
  Link2,
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { insertTaskSchema, taskSchema } from "@shared/schema";
import type { Task, User, Project } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface TaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  projectId?: string;
  initialStatus?: string;
  onTaskUpdated?: () => void;
}

const taskFormSchema = taskSchema.extend({
  dueDate: z.string().optional(),
  dueDatetime: z.string().optional(),
});

export function TaskDrawer({ isOpen, onClose, task, projectId, initialStatus, onTaskUpdated }: TaskDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: subtasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks", task?.id, "subtasks"],
    enabled: !!task?.id,
  });

  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      description: "",
      priority: "medium",
      status: (initialStatus as any) || "pending",
      assignedToId: "",
      projectId: projectId || "",
      notes: "",
      dueDate: "",
      dueDatetime: "",
    },
  });

  const subtaskForm = useForm<z.infer<typeof insertTaskSchema>>({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      description: "",
      priority: "medium",
      status: "pending",
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        description: task.description,
        priority: task.priority,
        status: task.status,
        assignedToId: task.assignedToId || "",
        projectId: task.projectId || projectId || "",
        notes: task.notes || "",
        dueDate: task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : "",
        dueDatetime: task.dueDate ? format(new Date(task.dueDate), "HH:mm") : "",
      });
      setIsEditing(false);
    } else if (isOpen) {
      form.reset({
        description: "",
        priority: "medium",
        status: initialStatus || "pending",
        assignedToId: "",
        projectId: projectId || "",
        notes: "",
        dueDate: "",
        dueDatetime: "",
      });
      setIsEditing(true);
    }
  }, [task, isOpen, initialStatus, projectId, form]);

  const createTaskMutation = useMutation({
    mutationFn: async (data: z.infer<typeof taskFormSchema>) => {
      const dueDate = data.dueDate && data.dueDatetime 
        ? new Date(`${data.dueDate}T${data.dueDatetime}`)
        : data.dueDate 
        ? new Date(data.dueDate)
        : null;

      return await apiRequest("/api/tasks", "POST", {
        ...data,
        dueDate,
        assignedToId: data.assignedToId || null,
        projectId: data.projectId || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["/api/tasks", "project", projectId] });
      }
      toast({
        title: "Task created",
        description: "Task has been created successfully.",
      });
      onTaskUpdated?.();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create task.",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: z.infer<typeof taskFormSchema>) => {
      if (!task?.id) throw new Error("No task ID");
      
      const dueDate = data.dueDate && data.dueDatetime 
        ? new Date(`${data.dueDate}T${data.dueDatetime}`)
        : data.dueDate 
        ? new Date(data.dueDate)
        : null;

      return await apiRequest(`/api/tasks/${task.id}`, "PATCH", {
        ...data,
        dueDate,
        assignedToId: data.assignedToId || null,
        projectId: data.projectId || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      if (task?.id) {
        queryClient.invalidateQueries({ queryKey: ["/api/tasks", task.id] });
      }
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["/api/tasks", "project", projectId] });
      }
      toast({
        title: "Task updated",
        description: "Task has been updated successfully.",
      });
      setIsEditing(false);
      onTaskUpdated?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task.",
        variant: "destructive",
      });
    },
  });

  const createSubtaskMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertTaskSchema>) => {
      if (!task?.id) throw new Error("No parent task ID");
      
      return await apiRequest(`/api/tasks/${task.id}/subtasks`, "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", task?.id, "subtasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["/api/tasks", "project", projectId] });
      }
      subtaskForm.reset();
      setShowSubtaskForm(false);
      toast({
        title: "Subtask created",
        description: "Subtask has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create subtask.",
        variant: "destructive",
      });
    },
  });

  const toggleSubtaskCompletion = useMutation({
    mutationFn: async ({ subtaskId, completed }: { subtaskId: string; completed: boolean }) => {
      return await apiRequest(`/api/tasks/${subtaskId}`, "PATCH", { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", task?.id, "subtasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["/api/tasks", "project", projectId] });
      }
    },
  });

  const onSubmit = (data: z.infer<typeof taskFormSchema>) => {
    if (task) {
      updateTaskMutation.mutate(data);
    } else {
      createTaskMutation.mutate(data);
    }
  };

  const onSubtaskSubmit = (data: z.infer<typeof insertTaskSchema>) => {
    createSubtaskMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    subtaskForm.reset();
    setIsEditing(false);
    setShowSubtaskForm(false);
    onClose();
  };

  const completedSubtasks = subtasks.filter(st => st.completed).length;
  const completionPercentage = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;
  const isOverdue = task?.dueDate && new Date(task.dueDate) < new Date() && !task?.completed;

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-[800px] max-w-[90vw] overflow-y-auto" data-testid="task-drawer">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle>
              {task ? (isEditing ? "Edit Task" : "Task Details") : "Create New Task"}
            </SheetTitle>
            {task && !isEditing && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                data-testid="edit-task-button"
              >
                Edit
              </Button>
            )}
          </div>
          
          {task && (
            <div className="flex flex-wrap gap-2">
              <Badge className={`${
                task.priority === "high" ? "bg-red-100 text-red-800" :
                task.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                "bg-green-100 text-green-800"
              }`}>
                {task.priority} priority
              </Badge>
              
              <Badge className={`${
                task.status === "complete" ? "bg-emerald-100 text-emerald-800" :
                task.status === "pending" ? "bg-gray-100 text-gray-800" :
                "bg-blue-100 text-blue-800"
              }`}>
                {task.status}
              </Badge>
              
              {task.completed && (
                <Badge className="bg-green-100 text-green-800">Completed</Badge>
              )}
              
              {isOverdue && (
                <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Overdue
                </Badge>
              )}
            </div>
          )}
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe the task..."
                        disabled={task && !isEditing}
                        rows={3}
                        data-testid="task-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={task && !isEditing}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="task-priority">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={task && !isEditing}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="task-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="complete">Complete</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="assignedToId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned To</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={task && !isEditing}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="task-assignee">
                            <SelectValue placeholder="Select assignee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {users.map((user) => (
                            <SelectItem key={`task-drawer-assignee-${user.id}`} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={task && !isEditing}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="task-project">
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="no-project">No Project</SelectItem>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          disabled={task && !isEditing}
                          data-testid="task-due-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDatetime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Time</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="time"
                          disabled={task && !isEditing}
                          data-testid="task-due-time"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Additional notes..."
                        disabled={task && !isEditing}
                        rows={3}
                        data-testid="task-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(isEditing || !task) && (
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
                    data-testid="save-task-button"
                  >
                    {createTaskMutation.isPending || updateTaskMutation.isPending 
                      ? "Saving..." 
                      : task ? "Update Task" : "Create Task"
                    }
                  </Button>
                  {task && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              )}
            </form>
          </Form>

          {task && (
            <>
              <Separator />
              
              {/* Subtasks Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Subtasks
                    {subtasks.length > 0 && (
                      <Badge variant="secondary">{completedSubtasks}/{subtasks.length}</Badge>
                    )}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSubtaskForm(!showSubtaskForm)}
                    data-testid="add-subtask-button"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Subtask
                  </Button>
                </div>

                {subtasks.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm font-bold">{Math.round(completionPercentage)}%</span>
                      </div>
                      <Progress value={completionPercentage} className="h-2" />
                    </CardHeader>
                  </Card>
                )}

                {showSubtaskForm && (
                  <Card>
                    <CardContent className="p-4">
                      <Form {...subtaskForm}>
                        <form onSubmit={subtaskForm.handleSubmit(onSubtaskSubmit)} className="space-y-4">
                          <FormField
                            control={subtaskForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Subtask Description</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Enter subtask description..."
                                    data-testid="subtask-description"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex gap-2">
                            <Button 
                              type="submit" 
                              size="sm"
                              disabled={createSubtaskMutation.isPending}
                              data-testid="create-subtask-button"
                            >
                              {createSubtaskMutation.isPending ? "Creating..." : "Create Subtask"}
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => setShowSubtaskForm(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  {subtasks.map((subtask) => (
                    <Card key={subtask.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => 
                              toggleSubtaskCompletion.mutate({
                                subtaskId: subtask.id,
                                completed: !subtask.completed
                              })
                            }
                            data-testid={`toggle-subtask-${subtask.id}`}
                          >
                            {subtask.completed ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Circle className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                          <span className={`flex-1 ${subtask.completed ? "line-through text-gray-500" : ""}`}>
                            {subtask.description}
                          </span>
                          <Badge 
                            variant="outline"
                            className={`text-xs ${
                              subtask.priority === "high" ? "bg-red-100 text-red-800" :
                              subtask.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                              "bg-green-100 text-green-800"
                            }`}
                          >
                            {subtask.priority}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Task Info Section */}
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                {task.assignedTo && (
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Assigned to:</span>
                    <span className="font-medium">{task.assignedTo.name}</span>
                  </div>
                )}
                
                {task.project && (
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Project:</span>
                    <span className="font-medium">{task.project.name}</span>
                  </div>
                )}
                
                {task.dueDate && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Due date:</span>
                    <span className={`font-medium ${isOverdue ? "text-red-600" : ""}`}>
                      {format(new Date(task.dueDate), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{format(new Date(task.createdAt), "MMM d, yyyy")}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}