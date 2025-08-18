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
            className={`flex items-center gap-2 ${
              activeFilter === 'all' 
                ? 'vsuite-button-primary' 
                : 'vsuite-button-secondary'
            }`}
          >
            All Tasks
            <span className="bg-white/20 text-current px-2 py-1 rounded-full text-xs">
              {tasks.length}
            </span>
          </Button>
          <Button
            variant={activeFilter === 'active' ? 'default' : 'outline'}
            onClick={() => onFilterChange('active')}
            className={`flex items-center gap-2 ${
              activeFilter === 'active' 
                ? 'vsuite-button-primary' 
                : 'vsuite-button-secondary'
            }`}
          >
            Active
            <span className="bg-white/20 text-current px-2 py-1 rounded-full text-xs">
              {activeCount}
            </span>
          </Button>
          <Button
            variant={activeFilter === 'completed' ? 'default' : 'outline'}
            onClick={() => onFilterChange('completed')}
            className={`flex items-center gap-2 ${
              activeFilter === 'completed' 
                ? 'vsuite-button-primary' 
                : 'vsuite-button-secondary'
            }`}
          >
            Completed
            <span className="bg-white/20 text-current px-2 py-1 rounded-full text-xs">
              {completedCount}
            </span>
          </Button>
        </div>
        <div className="flex items-center space-x-3 text-sm text-blue-700">
          <span className="font-medium">{activeCount} active</span>
          <span className="text-blue-300">•</span>
          <span className="font-medium">{completedCount} completed</span>
        </div>
      </div>
    </section>
  );
}
