import { AppHeader } from "@/components/app-header";
import { TaskForm } from "@/components/task-form";
import { TaskFilters } from "@/components/task-filters";
import { TaskList } from "@/components/task-list";
import { ReminderSystem } from "@/components/reminder-system";
import { AssignmentFilter } from "@/components/assignment-filter";
import { useState } from "react";

export default function Home() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');

  return (
    <div className="min-h-screen bg-neutral-50 vsuite-bg-pattern">
      <AppHeader />
      <ReminderSystem />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <TaskForm />
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <TaskFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          <AssignmentFilter selectedAssignee={selectedAssignee} onAssigneeChange={setSelectedAssignee} />
        </div>
        <TaskList filter={activeFilter} assigneeFilter={selectedAssignee} />
      </main>
    </div>
  );
}
