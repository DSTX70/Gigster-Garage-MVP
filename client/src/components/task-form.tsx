import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Plus, X, FileText, Link, Upload, User } from "lucide-react";
import { insertTaskSchema, type InsertTask } from "@shared/schema";

export function TaskForm() {
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [notes, setNotes] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState("");
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
      setAssignedTo("");
      setNotes("");
      setAttachments([]);
      setLinks([]);
      setNewLink("");
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

  const addLink = () => {
    if (newLink.trim() && !links.includes(newLink.trim())) {
      setLinks([...links, newLink.trim()]);
      setNewLink("");
    }
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileNames = Array.from(files).map(file => file.name);
      setAttachments([...attachments, ...fileNames]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

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
        dueDate: dueDate || null,
        priority,
        assignedTo: assignedTo.trim() || null,
        completed: false,
        notes: notes.trim() || null,
        attachments: attachments,
        links: links,
      });

      createTaskMutation.mutate(taskData);
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Invalid task data",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-800 mb-4">Add New Task</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div>
            <Label htmlFor="notes" className="block text-sm font-medium text-neutral-700 mb-2 flex items-center">
              <FileText size={16} className="mr-2" />
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes or details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-24"
            />
          </div>

          <div>
            <Label htmlFor="assignedTo" className="block text-sm font-medium text-neutral-700 mb-2 flex items-center">
              <User size={16} className="mr-2" />
              Assign To
            </Label>
            <Input
              id="assignedTo"
              type="text"
              placeholder="Enter person's name or email"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="block text-sm font-medium text-neutral-700 mb-2 flex items-center">
                <Upload size={16} className="mr-2" />
                File Attachments
              </Label>
              <Input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="w-full mb-2"
              />
              {attachments.length > 0 && (
                <div className="space-y-1">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-neutral-50 p-2 rounded">
                      <span className="text-sm text-neutral-700 flex items-center">
                        <FileText size={14} className="mr-2" />
                        {file}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="block text-sm font-medium text-neutral-700 mb-2 flex items-center">
                <Link size={16} className="mr-2" />
                Links
              </Label>
              <div className="flex gap-2 mb-2">
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLink())}
                />
                <Button
                  type="button"
                  onClick={addLink}
                  disabled={!newLink.trim()}
                  variant="outline"
                  size="sm"
                >
                  <Plus size={14} />
                </Button>
              </div>
              {links.length > 0 && (
                <div className="space-y-1">
                  {links.map((link, index) => (
                    <div key={index} className="flex items-center justify-between bg-neutral-50 p-2 rounded">
                      <a 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center truncate"
                      >
                        <Link size={14} className="mr-2 flex-shrink-0" />
                        {link}
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLink(index)}
                        className="h-6 w-6 p-0 flex-shrink-0"
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
