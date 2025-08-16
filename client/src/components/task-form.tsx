import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Plus, X, FileText, Link, Upload, User } from "lucide-react";
import { insertTaskSchema, type InsertTask, type User as UserType, type Project } from "@shared/schema";

// User dropdown component
function UserDropdown({ value, onValueChange, placeholder }: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
}) {
  const { user: currentUser, isAdmin } = useAuth();
  const { data: users = [] } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
    enabled: isAdmin, // Only load users if current user is admin
  });

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem key="unassigned" value="unassigned">Unassigned</SelectItem>
        {currentUser && (
          <SelectItem key={`${currentUser.id}-self`} value={currentUser.id}>
            {currentUser.name} ({currentUser.username}) - Me
          </SelectItem>
        )}
        {isAdmin && users
          .filter(user => user.id !== currentUser?.id) // Don't duplicate current user
          .map((user, index) => (
            <SelectItem key={`${user.id}-${index}`} value={user.id}>
              {user.name} ({user.username})
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}

// Project dropdown component
function ProjectDropdown({ value, onValueChange, placeholder }: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
}) {
  const [customProject, setCustomProject] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const createProjectMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", "/api/projects", { name });
      return response.json();
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      onValueChange(project.id);
      setCustomProject("");
      setShowCustomInput(false);
    },
  });

  const handleCreateProject = () => {
    if (customProject.trim()) {
      createProjectMutation.mutate(customProject.trim());
    }
  };

  // Find default "Add a project" entry
  const defaultProject = projects.find(p => p.name === "Add a project");

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {defaultProject && (
            <SelectItem value={defaultProject.id}>
              {defaultProject.name}
            </SelectItem>
          )}
          {projects
            .filter(p => p.name !== "Add a project")
            .map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      
      {showCustomInput ? (
        <div className="flex gap-2">
          <Input
            value={customProject}
            onChange={(e) => setCustomProject(e.target.value)}
            placeholder="Enter project name"
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleCreateProject}
            disabled={!customProject.trim() || createProjectMutation.isPending}
            size="sm"
          >
            {createProjectMutation.isPending ? "..." : "Add"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setShowCustomInput(false);
              setCustomProject("");
            }}
            size="sm"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowCustomInput(true)}
          className="w-full text-sm"
        >
          <Plus size={14} className="mr-1" />
          Create New Project
        </Button>
      )}
    </div>
  );
}

export function TaskForm() {
  const { user: currentUser, isAdmin } = useAuth();
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  // Default to current user for non-admins, unassigned for admins
  const [assignedToId, setAssignedToId] = useState(isAdmin ? "unassigned" : (currentUser?.id || "unassigned"));
  const [projectId, setProjectId] = useState("");
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
      setDueTime("");
      setPriority("medium");
      setAssignedToId(isAdmin ? "unassigned" : (currentUser?.id || "unassigned"));
      setProjectId("");
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
      // Combine date and time into a single datetime
      let combinedDateTime = null;
      if (dueDate) {
        if (dueTime) {
          combinedDateTime = new Date(`${dueDate}T${dueTime}`);
        } else {
          // Default to end of day if no time specified
          combinedDateTime = new Date(`${dueDate}T23:59`);
        }
      }

      const taskData = insertTaskSchema.parse({
        description: description.trim(),
        dueDate: combinedDateTime,
        priority,
        assignedToId: (assignedToId && assignedToId !== "unassigned") ? assignedToId : null,
        projectId: projectId || null,
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
    <section className="mb-8 fade-in-up">
      <div className="vsuite-form-card">
        <h2 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
          <div className="vsuite-logo-mini mr-3">
            <Plus size={14} />
          </div>
          Add New Task
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div>
              <Label htmlFor="dueTime" className="block text-sm font-medium text-neutral-700 mb-2">
                Due Time
              </Label>
              <Input
                id="dueTime"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full"
                placeholder="Optional"
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
            <Label htmlFor="projectId" className="block text-sm font-medium text-neutral-700 mb-2 flex items-center">
              <FileText size={16} className="mr-2" />
              Project
            </Label>
            <ProjectDropdown
              value={projectId}
              onValueChange={setProjectId}
              placeholder="Select or create a project..."
            />
          </div>

          <div>
            <Label htmlFor="assignedToId" className="block text-sm font-medium text-neutral-700 mb-2 flex items-center">
              <User size={16} className="mr-2" />
              Assign To
            </Label>
            <UserDropdown
              value={assignedToId}
              onValueChange={setAssignedToId}
              placeholder="Select a user to assign..."
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
                className="vsuite-button-primary px-6 py-3"
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
