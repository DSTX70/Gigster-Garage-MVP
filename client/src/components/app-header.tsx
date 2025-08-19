import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CheckCheck, LogOut, Settings, User, Users, Plus } from "lucide-react";
import { Link } from "wouter";
import { VSuiteLogo } from "./vsuite-logo";
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
    <header className="vsuite-header-gradient border-b border-blue-600 sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 fade-in-up">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <VSuiteLogo size="small" showText={false} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">VSuite HQ</h1>
              <p className="text-xs font-medium text-blue-100">Simplified Workflow Hub</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button 
                variant="outline" 
                size="sm"
                className="text-white border-white/30 hover:bg-white hover:text-blue-600 backdrop-blur-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            </Link>
            <ReminderModal reminderCount={reminderCount} />
            
            <div className="flex items-center space-x-2 text-sm text-blue-100">
              <User size={16} />
              <span className="text-white font-medium">{user?.name}</span>
              {user?.role === 'admin' && (
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium border border-white/30">
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
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white/50"
                >
                  <CheckCheck size={16} className="mr-2" />
                  Tasks
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white/50"
                >
                  <Users size={16} className="mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/admin")}
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white/50"
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
              className="border-white/30 text-white hover:bg-red-500/20 hover:border-red-300"
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
