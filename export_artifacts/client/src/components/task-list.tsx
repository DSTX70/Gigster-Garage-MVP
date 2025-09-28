import { useQuery } from "@tanstack/react-query";
import { TaskItem } from "./task-item";
import { copy } from "@/lib/copy";
import type { Task } from "@shared/schema";
import { ListTodo } from "lucide-react";

interface TaskListProps {
  filter: 'all' | 'active' | 'completed';
  assigneeFilter?: string;
}

export function TaskList({ filter, assigneeFilter = 'all' }: TaskListProps) {
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const filteredTasks = tasks.filter(task => {
    // Filter by completion status
    if (filter === 'active' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;
    
    // Filter by assignee
    if (assigneeFilter === 'unassigned' && task.assignedToId) return false;
    if (assigneeFilter !== 'all' && assigneeFilter !== 'unassigned' && task.assignedToId !== assigneeFilter) return false;
    
    return true;
  });

  if (isLoading) {
    return (
      <section className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="gg-task-card animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="w-5 h-5 bg-neutral-200 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </section>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <section className="text-center py-12 fade-in-up">
        <div className="gigster-logo-large mx-auto mb-6">
          <ListTodo size={32} />
        </div>
        <h3 className="text-lg font-medium text-neutral-800 mb-2 brand-heading">
          {filter === 'all' ? 'No tasks yet' : filter === 'active' ? 'No active tasks' : 'No completed tasks'}
        </h3>
        <p className="text-neutral-600">
          {filter === 'all' ? copy.emptyStates.tasks.noTasks : 
           filter === 'active' ? 'All tasks are completed!' : copy.emptyStates.dashboard.completed}
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {filteredTasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </section>
  );
}
