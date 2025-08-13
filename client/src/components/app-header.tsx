import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CheckCheck, LogOut, Settings, User, Users } from "lucide-react";
import { ReminderModal } from "@/components/reminder-modal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { Task } from "@shared/schema";
import { startOfDay, addDays } from "date-fns";

export function AppHeader() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
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
              <img 
                src="@assets/IMG_3649_1755004491378.jpeg" 
                alt="VSuite HQ Logo"
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  // Fallback to icon if logo fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <CheckCheck className="text-white hidden" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-black">VSuite HQ</h1>
              <p className="text-xs text-black font-medium">Simplified Workflow Hub</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ReminderModal reminderCount={reminderCount} />
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User size={16} />
              <span>{user?.name}</span>
              {user?.role === 'admin' && (
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                  Admin
                </span>
              )}
            </div>
            
            {isAdmin && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/")}
                >
                  <CheckCheck size={16} className="mr-2" />
                  Tasks
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                >
                  <Users size={16} className="mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/admin")}
                >
                  <Settings size={16} className="mr-2" />
                  Users
                </Button>
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut size={16} className="mr-2" />
              {logoutMutation.isPending ? "..." : "Logout"}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
