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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <AppHeader />
      <ReminderSystem />
      
      {/* Hero Section */}
      <div className="vsuite-hero-section py-8 mb-8">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Task Management Hub</h1>
            <p className="text-blue-100 text-lg">Streamline your workflow with VSuite HQ</p>
          </div>
        </div>
      </div>
      
      <main className="max-w-6xl mx-auto px-6 pb-8">
        <TaskForm />
        
        {/* Enhanced Filter Section */}
        <div className="vsuite-accent-section mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Filter & Organize Tasks</h3>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <TaskFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
            <AssignmentFilter selectedAssignee={selectedAssignee} onAssigneeChange={setSelectedAssignee} />
          </div>
        </div>
        
        <TaskList filter={activeFilter} assigneeFilter={selectedAssignee} />
      </main>
    </div>
  );
}
