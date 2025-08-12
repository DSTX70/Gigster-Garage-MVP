import { useQuery } from "@tanstack/react-query";
import { CheckCheck } from "lucide-react";
import { ReminderModal } from "@/components/reminder-modal";
import type { Task } from "@shared/schema";
import { startOfDay, addDays } from "date-fns";

export function AppHeader() {
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Calculate reminder count
  const getReminderCount = () => {
    const now = new Date();
    const today = startOfDay(now);
    const tomorrow = addDays(today, 1);
    
    return tasks.filter(task => {
      if (task.completed || !task.dueDate) return false;
      
      const dueDate = startOfDay(new Date(task.dueDate));
      return dueDate.getTime() <= tomorrow.getTime();
    }).length;
  };

  const reminderCount = getReminderCount();

  return (
    <header className="bg-white shadow-sm border-b border-neutral-200">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary w-10 h-10 rounded-lg flex items-center justify-center">
              <CheckCheck className="text-white" size={20} />
            </div>
            <h1 className="text-2xl font-bold text-neutral-800">TaskFlow</h1>
          </div>
          <div className="flex items-center space-x-4">
            <ReminderModal reminderCount={reminderCount} />
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">U</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
