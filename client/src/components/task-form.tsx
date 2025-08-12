import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Plus } from "lucide-react";
import { insertTaskSchema, type InsertTask } from "@shared/schema";

export function TaskForm() {
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const { toast } = useToast();

  const createTaskMutation = useMutation({
    mutationFn: async (task: InsertTask) => {
      const response = await apiRequest("POST", "/api/tasks", task);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setDescription("");
      setDueDate("");
      setPriority("medium");
      toast({
        title: "Task created",
        description: "Your task has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Task description is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const taskData = insertTaskSchema.parse({
        description: description.trim(),
        dueDate: dueDate ? new Date(dueDate) : null,
        priority,
        completed: false,
      });

      createTaskMutation.mutate(taskData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid task data",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-800 mb-4">Add New Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-2">
                Task Description
              </Label>
              <Input
                id="description"
                type="text"
                placeholder="What needs to be done?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="dueDate" className="block text-sm font-medium text-neutral-700 mb-2">
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="priority" className="block text-sm font-medium text-neutral-700 mb-2">
                Priority
              </Label>
              <Select value={priority} onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 flex justify-end items-end">
              <Button
                type="submit"
                disabled={createTaskMutation.isPending}
                className="px-6 py-3 bg-primary hover:bg-blue-600 text-white font-medium"
              >
                <Plus className="mr-2" size={16} />
                {createTaskMutation.isPending ? "Adding..." : "Add Task"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
