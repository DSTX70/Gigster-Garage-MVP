import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Play, Square, Clock, Settings } from "lucide-react";
import type { TimeLog, Task, Project } from "@shared/schema";

// Helper function to format duration
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export function TimerWidget() {
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const queryClient = useQueryClient();
  
  // Fetch active timer
  const { data: activeTimer, isLoading: timerLoading } = useQuery<TimeLog | null>({
    queryKey: ["/api/timelogs/active"],
    refetchInterval: (data) => data ? 1000 : 10000, // Update every second if active, otherwise every 10 seconds
  });

  // Fetch projects and tasks for selection
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
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
    }
  }, [activeTimer]);

  // Start timer mutation
  const startTimerMutation = useMutation({
    mutationFn: async (data: { taskId?: string; projectId?: string; description?: string }) => {
      return apiRequest("POST", "/api/timelogs/start", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timelogs/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timelogs"] });
      setIsDialogOpen(false);
      setSelectedTaskId("");
      setSelectedProjectId("");
      setDescription("");
    },
  });

  // Stop timer mutation
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
      // Reset timer display to show "Timer Ready" state
    },
  });

  const handleStartTimer = () => {
    startTimerMutation.mutate({
      taskId: selectedTaskId || undefined,
      projectId: selectedProjectId || undefined,
      description: description || undefined,
    });
  };

  const handleStopTimer = () => {
    if (activeTimer) {
      stopTimerMutation.mutate(activeTimer.id);
    }
  };

  if (timerLoading) {
    return (
      <Card className="w-full max-w-md bg-orange-50 border-orange-200" data-testid="timer-widget-loading">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <span className="text-sm text-orange-700">Loading timer...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-orange-50 border-orange-200" data-testid="timer-widget">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-orange-600" />
            <div>
              {activeTimer && activeTimer.isActive ? (
                <div>
                  <div className="text-2xl font-bold text-orange-900" data-testid="timer-display">
                    {formatDuration(currentTime)}
                  </div>
                  <div className="text-xs text-orange-700" data-testid="timer-description">
                    {activeTimer.description || "Working on task"}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-lg font-semibold text-orange-900">Timer Ready</div>
                  <div className="text-xs text-orange-700">Click start to begin tracking</div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {activeTimer && activeTimer.isActive ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleStopTimer}
                disabled={stopTimerMutation.isPending}
                className="border-red-300 text-red-700 hover:bg-red-50"
                data-testid="button-stop-timer"
              >
                <Square className="h-4 w-4" />
                Stop
              </Button>
            ) : (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    data-testid="button-start-timer"
                  >
                    <Play className="h-4 w-4" />
                    Start
                  </Button>
                </DialogTrigger>
                
                <DialogContent data-testid="dialog-start-timer">
                  <DialogHeader>
                    <DialogTitle className="text-orange-900">Start Timer</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="timer-project" className="text-sm font-medium">
                        Project (Optional)
                      </Label>
                      <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                        <SelectTrigger data-testid="select-timer-project">
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no-project">No project</SelectItem>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="timer-task" className="text-sm font-medium">
                        Task (Optional)
                      </Label>
                      <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                        <SelectTrigger data-testid="select-timer-task">
                          <SelectValue placeholder="Select a task" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no-task">No task</SelectItem>
                          {tasks.map((task) => (
                            <SelectItem key={task.id} value={task.id}>
                              {task.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="timer-description" className="text-sm font-medium">
                        Description (Optional)
                      </Label>
                      <Input
                        id="timer-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What are you working on?"
                        data-testid="input-timer-description"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        data-testid="button-cancel-timer"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleStartTimer}
                        disabled={startTimerMutation.isPending}
                        className="bg-orange-600 hover:bg-orange-700"
                        data-testid="button-confirm-start-timer"
                      >
                        {startTimerMutation.isPending ? "Starting..." : "Start Timer"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              className="text-orange-600 hover:bg-orange-100"
              data-testid="button-timer-settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}