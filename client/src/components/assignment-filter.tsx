import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import type { Task } from "@shared/schema";

interface AssignmentFilterProps {
  selectedAssignee: string;
  onAssigneeChange: (assignee: string) => void;
}

export function AssignmentFilter({ selectedAssignee, onAssigneeChange }: AssignmentFilterProps) {
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Get unique assignees from tasks
  const assignees = Array.from(
    new Set(
      tasks
        .filter(task => task.assignedTo)
        .map(task => task.assignedTo!)
    )
  ).sort();

  if (assignees.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <Label className="flex items-center text-sm font-medium text-neutral-700">
        <User size={16} className="mr-1" />
        Filter by:
      </Label>
      <Select value={selectedAssignee} onValueChange={onAssigneeChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All assignees" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All assignees</SelectItem>
          <SelectItem value="unassigned">Unassigned</SelectItem>
          {assignees.map((assignee) => (
            <SelectItem key={assignee} value={assignee}>
              {assignee}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}