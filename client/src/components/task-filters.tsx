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
    <section className="mb-4">
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFilterChange('all')}
          className={`h-9 px-3 text-xs font-medium rounded-lg transition-colors ${
            activeFilter === 'all' 
              ? 'bg-[#0B1D3A] text-white hover:bg-[#0B1D3A]/90' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          data-testid="filter-all-tasks"
        >
          All
          <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
            activeFilter === 'all' ? 'bg-white/20' : 'bg-gray-200'
          }`}>
            {tasks.length}
          </span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFilterChange('active')}
          className={`h-9 px-3 text-xs font-medium rounded-lg transition-colors ${
            activeFilter === 'active' 
              ? 'bg-[#0B1D3A] text-white hover:bg-[#0B1D3A]/90' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          data-testid="filter-active"
        >
          Active
          <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
            activeFilter === 'active' ? 'bg-white/20' : 'bg-gray-200'
          }`}>
            {activeCount}
          </span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFilterChange('completed')}
          className={`h-9 px-3 text-xs font-medium rounded-lg transition-colors ${
            activeFilter === 'completed' 
              ? 'bg-[#0B1D3A] text-white hover:bg-[#0B1D3A]/90' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          data-testid="filter-completed"
        >
          Done
          <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
            activeFilter === 'completed' ? 'bg-white/20' : 'bg-gray-200'
          }`}>
            {completedCount}
          </span>
        </Button>
      </div>
    </section>
  );
}
