import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Clock, BellOff, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductivityStats {
  totalHours: number;
  averageDailyHours: number;
  streakDays: number;
  utilizationPercent: number;
}

export function DailyReminder() {
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [hasLoggedToday, setHasLoggedToday] = useState(false);
  const { toast } = useToast();

  // Check productivity stats for today
  const { data: stats } = useQuery<ProductivityStats>({
    queryKey: ["/api/productivity/stats", { days: 1 }],
    refetchInterval: 300000, // Check every 5 minutes
  });

  // Check if user has any time logged today
  useEffect(() => {
    if (stats && stats.totalHours > 0) {
      setHasLoggedToday(true);
    }
  }, [stats]);

  // Load settings from localStorage
  useEffect(() => {
    const enabled = localStorage.getItem("dailyRemindersEnabled");
    const time = localStorage.getItem("dailyReminderTime");
    
    if (enabled !== null) {
      setRemindersEnabled(JSON.parse(enabled));
    }
    if (time) {
      setReminderTime(time);
    }
  }, []);

  // Set up daily reminders
  useEffect(() => {
    if (!remindersEnabled) return;

    const checkAndNotify = () => {
      const now = new Date();
      const [hours, minutes] = reminderTime.split(':').map(Number);
      const reminderDateTime = new Date();
      reminderDateTime.setHours(hours, minutes, 0, 0);

      // Check if it's reminder time and user hasn't logged time today
      if (
        now.getHours() === hours &&
        now.getMinutes() === minutes &&
        !hasLoggedToday
      ) {
        // Request notification permission if not granted
        if (Notification.permission === "granted") {
          new Notification("Gigster Garage - Time to Work! 🔥", {
            body: "Don't break your productivity streak! Start your timer and get to work.",
            icon: "/favicon.ico",
            tag: "daily-reminder",
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              new Notification("Gigster Garage - Time to Work! 🔥", {
                body: "Don't break your productivity streak! Start your timer and get to work.",
                icon: "/favicon.ico",
                tag: "daily-reminder",
              });
            }
          });
        }

        // Show toast notification as backup
        toast({
          title: "🔥 Time to Work!",
          description: "Don't break your productivity streak! Start your timer and get to work.",
          duration: 10000,
        });
      }
    };

    // Check every minute
    const interval = setInterval(checkAndNotify, 60000);
    return () => clearInterval(interval);
  }, [remindersEnabled, reminderTime, hasLoggedToday, toast]);

  const handleEnableReminders = (enabled: boolean) => {
    setRemindersEnabled(enabled);
    localStorage.setItem("dailyRemindersEnabled", JSON.stringify(enabled));
    
    if (enabled) {
      // Request notification permission
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            toast({
              title: "Reminders Enabled",
              description: "You'll receive daily productivity reminders at the scheduled time.",
            });
          } else {
            toast({
              title: "Notifications Blocked",
              description: "Please enable notifications in your browser settings for reminders to work.",
              variant: "destructive",
            });
          }
        });
      } else if (Notification.permission === "granted") {
        toast({
          title: "Reminders Enabled",
          description: "You'll receive daily productivity reminders at the scheduled time.",
        });
      }
    } else {
      toast({
        title: "Reminders Disabled",
        description: "Daily productivity reminders have been turned off.",
      });
    }
  };

  const handleTimeChange = (time: string) => {
    setReminderTime(time);
    localStorage.setItem("dailyReminderTime", time);
  };

  const sendTestNotification = () => {
    if (Notification.permission === "granted") {
      new Notification("Gigster Garage - Test Reminder", {
        body: "This is a test of your daily productivity reminder!",
        icon: "/favicon.ico",
        tag: "test-reminder",
      });
      toast({
        title: "Test Notification Sent",
        description: "Check if you received the browser notification.",
      });
    } else {
      toast({
        title: "Notifications Not Enabled",
        description: "Please enable notifications to receive reminders.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200" data-testid="daily-reminder-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-purple-900 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Daily Reminders</span>
          </div>
          {hasLoggedToday && (
            <CheckCircle className="h-5 w-5 text-green-600" data-testid="icon-logged-today" />
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Enable/Disable Switch */}
        <div className="flex items-center justify-between">
          <Label htmlFor="enable-reminders" className="text-sm font-medium text-purple-900">
            Enable Daily Reminders
          </Label>
          <Switch
            id="enable-reminders"
            checked={remindersEnabled}
            onCheckedChange={handleEnableReminders}
            data-testid="switch-enable-reminders"
          />
        </div>

        {remindersEnabled && (
          <>
            {/* Reminder Time Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-purple-900">
                Reminder Time
              </Label>
              <Select value={reminderTime} onValueChange={handleTimeChange}>
                <SelectTrigger data-testid="select-reminder-time">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="08:00">8:00 AM</SelectItem>
                  <SelectItem value="09:00">9:00 AM</SelectItem>
                  <SelectItem value="10:00">10:00 AM</SelectItem>
                  <SelectItem value="11:00">11:00 AM</SelectItem>
                  <SelectItem value="12:00">12:00 PM</SelectItem>
                  <SelectItem value="13:00">1:00 PM</SelectItem>
                  <SelectItem value="14:00">2:00 PM</SelectItem>
                  <SelectItem value="15:00">3:00 PM</SelectItem>
                  <SelectItem value="16:00">4:00 PM</SelectItem>
                  <SelectItem value="17:00">5:00 PM</SelectItem>
                  <SelectItem value="18:00">6:00 PM</SelectItem>
                  <SelectItem value="19:00">7:00 PM</SelectItem>
                  <SelectItem value="20:00">8:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Test Notification Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={sendTestNotification}
              className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
              data-testid="button-test-notification"
            >
              <BellOff className="h-4 w-4 mr-2" />
              Send Test Notification
            </Button>
          </>
        )}

        {/* Today's Status */}
        <div className="p-3 bg-purple-100 rounded-md border border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Today's Progress</span>
            </div>
            <div className="text-sm font-semibold text-purple-800" data-testid="today-progress">
              {stats ? `${stats.totalHours}h logged` : "No time logged"}
            </div>
          </div>
          
          {hasLoggedToday ? (
            <div className="mt-2 text-xs text-green-700 flex items-center space-x-1" data-testid="status-logged">
              <CheckCircle className="h-3 w-3" />
              <span>Great job! You've logged time today.</span>
            </div>
          ) : (
            <div className="mt-2 text-xs text-purple-700" data-testid="status-not-logged">
              💡 Start your timer to begin tracking your productivity!
            </div>
          )}
        </div>

        {/* Notification Permission Status */}
        <div className="text-xs text-purple-600 text-center" data-testid="notification-status">
          {Notification.permission === "granted" ? (
            "✅ Browser notifications enabled"
          ) : Notification.permission === "denied" ? (
            "❌ Browser notifications blocked"
          ) : (
            "⚠️ Browser notifications not configured"
          )}
        </div>
      </CardContent>
    </Card>
  );
}