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
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-900 text-white hover:bg-blue-800 border-blue-900'
            }`}
            data-testid="filter-all-tasks"
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
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-900 text-white hover:bg-blue-800 border-blue-900'
            }`}
            data-testid="filter-active"
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
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-900 text-white hover:bg-blue-800 border-blue-900'
            }`}
            data-testid="filter-completed"
          >
            Completed
            <span className="bg-white/20 text-current px-2 py-1 rounded-full text-xs">
              {completedCount}
            </span>
          </Button>
        </div>
        <div className="flex items-center space-x-3 text-sm" style={{ color: 'var(--steel-gray)' }}>
          <span className="font-medium">{activeCount} active</span>
          <span style={{ color: 'var(--garage-navy)' }}>•</span>
          <span className="font-medium">{completedCount} completed</span>
        </div>
      </div>
    </section>
  );
}
