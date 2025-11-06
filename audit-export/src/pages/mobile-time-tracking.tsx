import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Calendar,
  BarChart3,
  Plus,
  Home,
  Timer
} from "lucide-react";
import { format } from "date-fns";

interface TimeLog {
  id: string;
  taskId?: string;
  projectId?: string;
  description: string;
  duration: number;
  date: string;
  startTime?: string;
  endTime?: string;
}

export default function MobileTimeTracking() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [description, setDescription] = useState("");

  // Update timer every second when tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && startTime) {
      interval = setInterval(() => {
        setCurrentTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, startTime]);

  const { data: timeLogs = [], isLoading } = useQuery<TimeLog[]>({
    queryKey: ["/api/timelogs"],
  });

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleStartTimer = () => {
    setIsTracking(true);
    setStartTime(new Date());
    setCurrentTime(0);
  };

  const handlePauseTimer = () => {
    setIsTracking(false);
  };

  const handleStopTimer = () => {
    setIsTracking(false);
    setStartTime(null);
    setCurrentTime(0);
    setDescription("");
    // Here you would save the time log
  };

  // Calculate today's total time
  const today = new Date().toISOString().split('T')[0];
  const todayLogs = timeLogs.filter(log => log.date === today);
  const todayTotal = todayLogs.reduce((sum, log) => sum + log.duration, 0);

  // Calculate this week's total time
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekLogs = timeLogs.filter(log => new Date(log.date) >= weekStart);
  const weekTotal = weekLogs.reduce((sum, log) => sum + log.duration, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#004C6D] to-[#0B1D3A] flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading Time Tracking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004C6D] to-[#0B1D3A]">
      {/* Header */}
      <div className="bg-[#004C6D] px-4 py-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/mobile">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-2"
                data-testid="button-back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">⏱️ Time Tracking</h1>
              <p className="text-blue-100 text-sm">Track your productivity</p>
            </div>
          </div>
          <Link href="/mobile">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-2"
              data-testid="button-home"
            >
              <Home className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Active Timer */}
        <Card className="bg-white/95 backdrop-blur border-0 shadow-lg" data-testid="card-active-timer">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              {/* Timer Display */}
              <div className="text-4xl font-mono font-bold text-[#004C6D]" data-testid="text-timer-display">
                {formatTime(currentTime)}
              </div>
              
              {isTracking && (
                <div className="flex items-center justify-center text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  Recording time...
                </div>
              )}

              {/* Description Input */}
              <div className="space-y-2">
                <Input
                  placeholder="What are you working on?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-center"
                  data-testid="input-description"
                />
              </div>

              {/* Timer Controls */}
              <div className="flex justify-center space-x-4">
                {!isTracking ? (
                  <Button
                    onClick={handleStartTimer}
                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full"
                    data-testid="button-start-timer"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Start
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handlePauseTimer}
                      variant="outline"
                      className="px-6 py-3 rounded-full"
                      data-testid="button-pause-timer"
                    >
                      <Pause className="h-5 w-5 mr-2" />
                      Pause
                    </Button>
                    <Button
                      onClick={handleStopTimer}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full"
                      data-testid="button-stop-timer"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Summary */}
        <Card className="bg-white/95 backdrop-blur border-0 shadow-lg" data-testid="card-time-summary">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-[#004C6D]">
              <BarChart3 className="h-5 w-5 mr-2" />
              Time Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600" data-testid="text-today-total">
                  {formatDuration(todayTotal)}
                </div>
                <div className="text-xs text-blue-600">Today</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600" data-testid="text-week-total">
                  {formatDuration(weekTotal)}
                </div>
                <div className="text-xs text-green-600">This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Time Logs */}
        <Card className="bg-white/95 backdrop-blur border-0 shadow-lg" data-testid="card-recent-logs">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-[#004C6D]">
              <Clock className="h-5 w-5 mr-2" />
              Recent Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayLogs.slice(0, 5).map((log, index) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-testid={`row-time-log-${index}`}>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {log.description || 'Untitled session'}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(log.date), 'MMM d, yyyy')}
                      {log.startTime && (
                        <span className="ml-2">
                          {format(new Date(log.startTime), 'h:mm a')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-[#004C6D]">
                      {formatDuration(log.duration)}
                    </div>
                  </div>
                </div>
              ))}

              {todayLogs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Timer className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No time logged today</p>
                  <p className="text-xs">Start your first timer above</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Switch to Desktop */}
        <Card className="bg-white/95 backdrop-blur border-0 shadow-lg" data-testid="card-switch-desktop">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                Need the full platform?
              </p>
              <a 
                href="/?desktop=true"
                className="inline-block bg-[#004C6D] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#003A52] transition-colors"
                data-testid="link-desktop-version"
              >
                🖥️ Switch to Desktop Version
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Add bottom padding */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}