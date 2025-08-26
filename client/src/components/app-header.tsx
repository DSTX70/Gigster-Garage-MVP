import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CheckCheck, LogOut, Settings, User, Users, Plus, Mail, Shield, Home } from "lucide-react";
import { Link } from "wouter";
import { GigsterLogo } from "./vsuite-logo";
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
    <header className="gigster-header-gradient border-b sticky top-0 z-50 shadow-lg" style={{ borderColor: 'var(--ignition-teal)' }}>
      <div className="max-w-6xl mx-auto px-6 py-3">
        <div className="flex flex-col space-y-3">
          {/* Top line: Shield + Logo + Tagline */}
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <GigsterLogo size="small" showText={false} />
              </div>
              <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                <span className="text-white">Gigster</span>
                <span style={{ color: 'var(--workshop-amber)' }}> Garage</span>
              </h1>
              <span style={{ color: 'rgba(255, 176, 0, 0.6)' }} className="font-medium">|</span>
              <p className="text-sm font-medium brand-tagline">Smarter tools for bolder dreams</p>
            </div>
          </div>
          
          {/* Bottom line: User + Messages */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-sm text-white/80">
              <User size={16} />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="text-white hover:bg-white/10 font-medium p-1 h-auto"
              >
                {user?.name}
              </Button>
              {user?.role === 'admin' && (
                <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-xs font-medium border border-white/30">
                  Admin
                </span>
              )}

            </div>
            
            <div className="flex items-center space-x-3">
              {/* Home Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-white hover:bg-white/10 relative p-2"
                data-testid="button-home"
              >
                <Home size={18} />
              </Button>
              
              {/* Message System */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/messages")}
                className="text-white hover:bg-white/10 relative p-2"
              >
                <Mail size={18} />
                {/* Show badge if there are unread messages */}
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  0
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
