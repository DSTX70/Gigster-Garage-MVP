import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { Task } from "@shared/schema";

interface TaskFiltersProps {
  activeFilter: 'all' | 'active' | 'completed';
  onFilterChange: (filter: 'all' | 'active' | 'completed') => void;
}

export function TaskFilters({ activeFilter, onFilterChange }: TaskFiltersProps) {
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const activeCount = tasks.filter(task => !task.completed).length;
  const completedCount = tasks.filter(task => task.completed).length;

  return (
    <section className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Button
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            onClick={() => onFilterChange('all')}
            className={activeFilter === 'all' ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}
          >
            All Tasks
          </Button>
          <Button
            variant={activeFilter === 'active' ? 'default' : 'outline'}
            onClick={() => onFilterChange('active')}
            className={activeFilter === 'active' ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}
          >
            Active
          </Button>
          <Button
            variant={activeFilter === 'completed' ? 'default' : 'outline'}
            onClick={() => onFilterChange('completed')}
            className={activeFilter === 'completed' ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}
          >
            Completed
          </Button>
        </div>
        <div className="flex items-center space-x-3 text-sm text-neutral-600">
          <span>{activeCount} active</span>
          <span className="text-neutral-300">•</span>
          <span>{completedCount} completed</span>
        </div>
      </div>
    </section>
  );
}
