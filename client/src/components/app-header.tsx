import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CheckCheck, LogOut, Settings, User, Users, Plus, Mail, Shield, Home, Database, Zap, Bot, Clock, Brain, BarChart3, Webhook, Key, FileText, Globe, HelpCircle, Keyboard, BookOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavigationMenu } from "./navigation-menu";
import { Link } from "wouter";
import { GigsterLogo } from "./vsuite-logo";
import { ReminderModal } from "@/components/reminder-modal";
import { GlobalSearch } from "@/components/global-search";
import { MoodPaletteSwitcher } from "@/components/MoodPaletteSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { DemoModeIndicator } from "@/components/DemoModeBanner";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { Task, TimeLog } from "@shared/schema";
import { startOfDay, addDays } from "date-fns";
import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";

export function AppHeader() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [currentTime, setCurrentTime] = useState(0);

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Fetch active timer
  const { data: activeTimer } = useQuery<TimeLog | null>({
    queryKey: ["/api/timelogs/active"],
    refetchInterval: (data) => (data && (data as any).isActive ? 5000 : 30000),
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex flex-col space-y-3 sm:space-y-4">
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
              <p className="text-xs sm:text-sm font-medium hidden sm:block" style={{ color: 'var(--brand-amber-tint)' }}>{t("tagline")}</p>
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
                  {t("admin")}
                </span>
              )}
            </div>
            
            {/* Demo Mode Indicator */}
            <DemoModeIndicator />
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Home Button - Keep for quick access */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-white hover:bg-white/10 relative p-1.5 sm:p-2"
                data-testid="button-home"
                title={t("dashboard")}
              >
                <Home size={16} className="sm:w-[18px] sm:h-[18px] text-white" />
              </Button>

              {/* Quick Access Tasks Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/tasks")}
                className="text-white hover:bg-white/10 relative p-1.5 sm:p-2"
                data-testid="button-tasks"
                title={t("tasks")}
              >
                <CheckCheck size={16} className="sm:w-[18px] sm:h-[18px] text-white" />
              </Button>

              {/* Organized Navigation Menu - Replaces all the scattered buttons */}
              <NavigationMenu />
              
              {/* Mood Palette Switcher */}
              <MoodPaletteSwitcher size="sm" className="text-white border-white/20 hover:bg-white/10" />
              
              {/* Help Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10 relative p-1.5 sm:p-2"
                    data-testid="button-help"
                    title="Help"
                  >
                    <HelpCircle size={16} className="sm:w-[18px] sm:h-[18px] text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Help & Support</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => navigate("/user-manual")}
                    className="cursor-pointer"
                    data-testid="help-user-manual"
                  >
                    <BookOpen size={16} className="mr-2" />
                    User Manual
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate("/keyboard-shortcuts")}
                    className="cursor-pointer"
                    data-testid="help-keyboard-shortcuts"
                  >
                    <Keyboard size={16} className="mr-2" />
                    Keyboard Shortcuts
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Settings/Language Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/settings")}
                className="text-white hover:bg-white/10 relative p-1.5 sm:p-2"
                data-testid="button-settings"
                title={t("settings")}
              >
                <Globe size={16} className="sm:w-[18px] sm:h-[18px] text-white" />
              </Button>
              
              {/* Keep Message System for notifications */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/messages")}
                className="text-white hover:bg-white/10 relative p-1.5 sm:p-2"
                data-testid="button-messages"
                title={t("messages")}
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
