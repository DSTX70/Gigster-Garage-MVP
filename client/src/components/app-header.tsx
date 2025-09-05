import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CheckCheck, LogOut, Settings, User, Users, Plus, Mail, Shield, Home, Database, Zap, Bot, Clock, Brain, BarChart3, Webhook } from "lucide-react";
import { Link } from "wouter";
import { GigsterLogo } from "./vsuite-logo";
import { ReminderModal } from "@/components/reminder-modal";
import { GlobalSearch } from "@/components/global-search";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { Task, TimeLog } from "@shared/schema";
import { startOfDay, addDays } from "date-fns";
import { useState, useEffect } from "react";

export function AppHeader() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [currentTime, setCurrentTime] = useState(0);

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Fetch active timer
  const { data: activeTimer } = useQuery<TimeLog | null>({
    queryKey: ["/api/timelogs/active"],
    refetchInterval: 5000, // Update every 5 seconds
    staleTime: 1000 * 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Update current time for active timer
  useEffect(() => {
    if (activeTimer && activeTimer.isActive) {
      const interval = setInterval(() => {
        const now = Date.now();
        const startTime = new Date(activeTimer.startTime).getTime();
        setCurrentTime(Math.floor((now - startTime) / 1000));
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setCurrentTime(0);
    }
  }, [activeTimer]);

  // Format duration for display
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

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

  const stopTimerMutation = useMutation({
    mutationFn: async (timeLogId: string) => {
      return apiRequest("POST", "/api/timelogs/stop", { timeLogId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timelogs/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timelogs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/productivity/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/streaks"] });
      setCurrentTime(0);
      toast({
        title: "Timer stopped",
        description: "Your work session has been saved",
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

  const handleStopTimer = () => {
    if (activeTimer) {
      stopTimerMutation.mutate(activeTimer.id);
    }
  };

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
    <header className="gg-header border-b sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2 sm:py-3">
        <div className="flex flex-col space-y-2 sm:space-y-3">
          {/* Top line: Shield + Logo + Tagline + Timer */}
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <GigsterLogo size="small" showText={false} />
              <h1 className="text-lg sm:text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Gigster Garage
              </h1>
              
              {/* Active Timer Display */}
              {activeTimer && activeTimer.isActive && (
                <>
                  <span style={{ color: 'var(--brand-amber-tint)' }} className="font-medium">|</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleStopTimer}
                    disabled={stopTimerMutation.isPending}
                    className="flex items-center space-x-1 sm:space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 hover:bg-white/30 transition-colors"
                    title="Click to stop timer"
                  >
                    <Clock size={14} className="text-white animate-pulse" />
                    <span className="text-sm sm:text-base font-bold text-white" style={{ fontFamily: 'monospace' }}>
                      {formatDuration(currentTime)}
                    </span>
                    <span className="text-xs text-white/80 hidden sm:inline">
                      {activeTimer.description || "Working"}
                    </span>
                  </Button>
                </>
              )}
              
              <span style={{ color: 'var(--brand-amber-tint)' }} className="font-medium hidden sm:inline">|</span>
              <p className="text-xs sm:text-sm font-medium hidden sm:block" style={{ color: 'var(--brand-amber-tint)' }}>Smarter tools for bolder dreams</p>
            </div>
          </div>

          {/* Middle line: Search */}
          <div className="flex justify-center px-2">
            <div className="w-full max-w-md">
              <GlobalSearch className="w-full" />
            </div>
          </div>
          
          {/* Bottom line: User + Messages */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-white/80">
              <User size={14} className="sm:w-4 sm:h-4 text-white" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="text-white hover:bg-white/10 font-medium p-1 h-auto text-xs sm:text-sm"
              >
                {user?.name}
              </Button>
              {user?.role === 'admin' && (
                <span className="bg-white/20 text-white px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium border border-white/30">
                  Admin
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Home Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-white hover:bg-white/10 relative p-1.5 sm:p-2"
                data-testid="button-home"
              >
                <Home size={16} className="sm:w-[18px] sm:h-[18px] text-white" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/bulk-operations")}
                className="text-white hover:bg-white/10 relative p-1.5 sm:p-2"
                data-testid="button-bulk-operations"
                title="Bulk Operations"
              >
                <Database size={16} className="sm:w-[18px] sm:h-[18px] text-white" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/custom-fields")}
                className="text-white hover:bg-white/10 relative p-1.5 sm:p-2"
                data-testid="button-custom-fields"
                title="Custom Fields"
              >
                <Settings size={16} className="sm:w-[18px] sm:h-[18px] text-white" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/workflow-automation")}
                className="text-white hover:bg-white/10 relative p-1.5 sm:p-2"
                data-testid="button-workflow-automation"
                title="Workflow Automation"
              >
                <Zap size={16} className="sm:w-[18px] sm:h-[18px] text-white" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/garage-assistant")}
                className="text-white hover:bg-white/10 relative p-1.5 sm:p-2"
                data-testid="button-garage-assistant"
                title="AI Assistant"
              >
                <Bot size={16} className="sm:w-[18px] sm:h-[18px] text-white" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/ai-insights")}
                className="text-white hover:bg-white/10 relative p-1.5 sm:p-2"
                data-testid="button-ai-insights"
                title="AI Insights"
              >
                <Brain size={16} className="sm:w-[18px] sm:h-[18px] text-white" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/team-collaboration")}
                className="text-white hover:bg-white/10 relative p-1.5 sm:p-2"
                data-testid="button-team-collaboration"
                title="Team Collaboration"
              >
                <Users size={16} className="sm:w-[18px] sm:h-[18px] text-white" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/advanced-reporting")}
                className="text-white hover:bg-white/10 relative p-1.5 sm:p-2"
                data-testid="button-advanced-reporting"
                title="Advanced Reporting"
              >
                <BarChart3 size={16} className="sm:w-[18px] sm:h-[18px] text-white" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/api-webhooks")}
                className="text-white hover:bg-white/10 relative p-1.5 sm:p-2"
                data-testid="button-api-webhooks"
                title="API Webhooks"
              >
                <Webhook size={16} className="sm:w-[18px] sm:h-[18px] text-white" />
              </Button>
              
              {/* Message System */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/messages")}
                className="text-white hover:bg-white/10 relative p-1.5 sm:p-2"
              >
                <Mail size={16} className="sm:w-[18px] sm:h-[18px] text-white" />
                {/* Show badge if there are unread messages */}
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold">
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
