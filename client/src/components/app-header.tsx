import { CheckCheck, Bell } from "lucide-react";

export function AppHeader() {
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
            <button className="relative p-2 text-neutral-600 hover:text-primary transition-colors duration-200">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">JD</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
