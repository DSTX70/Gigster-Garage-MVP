import { AppHeader } from "@/components/app-header";
import { TaskForm } from "@/components/task-form";
import { TaskFilters } from "@/components/task-filters";
import { TaskList } from "@/components/task-list";
import { useState } from "react";

export default function Home() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppHeader />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <TaskForm />
        <TaskFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        <TaskList filter={activeFilter} />
      </main>
    </div>
  );
}
