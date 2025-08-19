import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, X, ArrowRight, GitBranch, Clock } from "lucide-react";
import type { Task } from "@shared/schema";

interface TaskRelationshipsProps {
  task: Task;
  allTasks: Task[];
}

export function TaskRelationships({ task, allTasks }: TaskRelationshipsProps) {
  const [newDependency, setNewDependency] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const { toast } = useToast();

  // Filter out the current task and its existing dependencies/subtasks
  const availableTasksForDependency = allTasks.filter(t => 
    t.id !== task.id && 
    !task.dependencies?.some(dep => dep.dependsOnTask.id === t.id) &&
    !t.dependencies?.some(dep => dep.dependsOnTask.id === task.id) // Prevent circular dependencies
  );

  const availableTasksForSubtask = allTasks.filter(t => 
    t.id !== task.id && 
    !t.parentTaskId &&
    !task.subtasks?.some(sub => sub.id === t.id)
  );

  const addDependencyMutation = useMutation({
    mutationFn: async (dependsOnTaskId: string) => {
      return await apiRequest("POST", "/api/task-dependencies", {
        taskId: task.id,
        dependsOnTaskId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setNewDependency("");
      toast({
        title: "Dependency added",
        description: "Task dependency has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add dependency",
        variant: "destructive",
      });
    },
  });

  const removeDependencyMutation = useMutation({
    mutationFn: async (dependencyId: string) => {
      return await apiRequest("DELETE", `/api/task-dependencies/${dependencyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Dependency removed",
        description: "Task dependency has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove dependency",
        variant: "destructive",
      });
    },
  });

  const addSubtaskMutation = useMutation({
    mutationFn: async (subtaskId: string) => {
      return await apiRequest("PATCH", `/api/tasks/${subtaskId}`, {
        parentTaskId: task.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setNewSubtask("");
      toast({
        title: "Subtask added",
        description: "Task has been converted to a subtask successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add subtask",
        variant: "destructive",
      });
    },
  });

  const removeSubtaskMutation = useMutation({
    mutationFn: async (subtaskId: string) => {
      return await apiRequest("PATCH", `/api/tasks/${subtaskId}`, {
        parentTaskId: null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Subtask removed",
        description: "Task has been converted back to a main task successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove subtask",
        variant: "destructive",
      });
    },
  });

  const canStartTask = !task.dependencies || task.dependencies.every(dep => dep.dependsOnTask.completed);

  return (
    <div className="space-y-6">
      {/* Dependencies Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            Dependencies
          </CardTitle>
          <p className="text-sm text-gray-600">
            Tasks that must be completed before this task can start
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new dependency */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Select value={newDependency} onValueChange={setNewDependency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a task this depends on..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTasksForDependency.map((availableTask) => (
                    <SelectItem key={availableTask.id} value={availableTask.id}>
                      {availableTask.description}
                      {availableTask.completed && " ✓"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => newDependency && addDependencyMutation.mutate(newDependency)}
              disabled={!newDependency || addDependencyMutation.isPending}
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Existing dependencies */}
          {task.dependencies && task.dependencies.length > 0 ? (
            <div className="space-y-2">
              {task.dependencies.map((dependency) => (
                <div
                  key={dependency.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">
                      {dependency.dependsOnTask.description}
                    </span>
                    <Badge
                      className={
                        dependency.dependsOnTask.completed
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {dependency.dependsOnTask.completed ? "Completed" : "Pending"}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDependencyMutation.mutate(dependency.id)}
                    disabled={removeDependencyMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No dependencies</p>
          )}

          {/* Task readiness status */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              {canStartTask ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium text-green-800">
                    Ready to start
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span className="text-sm font-medium text-yellow-800">
                    Waiting for dependencies
                  </span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subtasks Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <GitBranch className="h-5 w-5 mr-2 text-purple-600" />
            Subtasks
          </CardTitle>
          <p className="text-sm text-gray-600">
            Break this task into smaller, manageable pieces
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new subtask */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Select value={newSubtask} onValueChange={setNewSubtask}>
                <SelectTrigger>
                  <SelectValue placeholder="Convert existing task to subtask..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTasksForSubtask.map((availableTask) => (
                    <SelectItem key={availableTask.id} value={availableTask.id}>
                      {availableTask.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => newSubtask && addSubtaskMutation.mutate(newSubtask)}
              disabled={!newSubtask || addSubtaskMutation.isPending}
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Existing subtasks */}
          {task.subtasks && task.subtasks.length > 0 ? (
            <div className="space-y-2">
              {task.subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <GitBranch className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium">
                      {subtask.description}
                    </span>
                    <Badge
                      className={
                        subtask.completed
                          ? "bg-green-100 text-green-800"
                          : subtask.priority === "high"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {subtask.completed ? "Completed" : subtask.priority}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSubtaskMutation.mutate(subtask.id)}
                    disabled={removeSubtaskMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No subtasks</p>
          )}

          {/* Subtask progress */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-purple-800">Subtask Progress</span>
                <span className="text-purple-600">
                  {task.subtasks.filter(s => s.completed).length} / {task.subtasks.length} completed
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}