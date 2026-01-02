import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  // Get unique assignees from tasks by matching assignedToId with users
  const assigneeIds = new Set(
    tasks
      .filter(task => task.assignedToId)
      .map(task => task.assignedToId!)
  );

  const assignees = (users as any[])
    .filter((user: any) => assigneeIds.has(user.id))
    .sort((a: any, b: any) => a.name.localeCompare(b.name));

  if (assignees.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Icon-only label (cleaner). Text is screen-reader only for accessibility. */}
      <div className="flex items-center text-neutral-700">
        <User size={16} className="opacity-70" aria-hidden="true" />
        <span className="sr-only">Filter by assignee</span>
      </div>

      <Select value={selectedAssignee} onValueChange={onAssigneeChange}>
        <SelectTrigger className="w-48 h-9 text-sm" aria-label="Assignee filter">
          <SelectValue placeholder="All assignees" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All assignees</SelectItem>
          <SelectItem value="unassigned">Unassigned</SelectItem>
          {assignees.map((assignee: any) => (
            <SelectItem key={assignee.id} value={assignee.id}>
              {assignee.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
