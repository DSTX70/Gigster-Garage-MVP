import { useQuery } from "@tanstack/react-query";
import { TaskItem } from "./task-item";
import type { Task } from "@shared/schema";
import { ListTodo } from "lucide-react";

interface TaskListProps {
  filter: 'all' | 'active' | 'completed';
}

export function TaskList({ filter }: TaskListProps) {
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  if (isLoading) {
    return (
      <section className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5 animate-pulse">
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
      <section className="text-center py-12">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ListTodo className="text-2xl text-neutral-400" size={32} />
        </div>
        <h3 className="text-lg font-medium text-neutral-800 mb-2">
          {filter === 'all' ? 'No tasks yet' : filter === 'active' ? 'No active tasks' : 'No completed tasks'}
        </h3>
        <p className="text-neutral-600">
          {filter === 'all' ? 'Create your first task to get started with TaskFlow' : 
           filter === 'active' ? 'All tasks are completed!' : 'No tasks have been completed yet'}
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
