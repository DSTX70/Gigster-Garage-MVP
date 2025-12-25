import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Clock, BellOff, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";

interface ProductivityStats {
  totalHours: number;
  averageDailyHours: number;
  streakDays: number;
  utilizationPercent: number;
}

export function DailyReminder() {
  const { t, language } = useTranslation();
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [hasLoggedToday, setHasLoggedToday] = useState(false);
  const { toast } = useToast();

  // Format time based on current language/locale
  const formatTime = (hour: number) => {
    const localeMap: Record<string, string> = {
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      'pt-BR': 'pt-BR',
      ja: 'ja-JP'
    };
    const locale = localeMap[language] || 'en-US';
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    return new Intl.DateTimeFormat(locale, { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: locale === 'en-US' || locale === 'es-ES'
    }).format(date);
  };

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
        // Request notification permission if not granted (check if Notification API is available)
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification(`Gigster Garage - ${t('timeToWork')} 🔥`, {
            body: t('dontBreakStreak'),
            icon: "/favicon.ico",
            tag: "daily-reminder",
          });
        } else if (typeof Notification !== "undefined" && Notification.permission !== "denied") {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              new Notification(`Gigster Garage - ${t('timeToWork')} 🔥`, {
                body: t('dontBreakStreak'),
                icon: "/favicon.ico",
                tag: "daily-reminder",
              });
            }
          });
        }

        // Show toast notification as backup
        toast({
          title: `🔥 ${t('timeToWork')}`,
          description: t('dontBreakStreak'),
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
      // Request notification permission (check if Notification API is available)
      if (typeof Notification !== "undefined" && Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            toast({
              title: t('remindersEnabled'),
              description: t('remindersEnabledDesc'),
            });
          } else {
            toast({
              title: t('notificationsBlocked'),
              description: t('notificationsBlockedDesc'),
              variant: "destructive",
            });
          }
        });
      } else if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        toast({
          title: t('remindersEnabled'),
          description: t('remindersEnabledDesc'),
        });
      } else if (typeof Notification === "undefined") {
        toast({
          title: t('remindersEnabled'),
          description: t('browserNoNotifications'),
        });
      }
    } else {
      toast({
        title: t('remindersDisabled'),
        description: t('remindersDisabledDesc'),
      });
    }
  };

  const handleTimeChange = (time: string) => {
    setReminderTime(time);
    localStorage.setItem("dailyReminderTime", time);
  };

  const sendTestNotification = () => {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification(`Gigster Garage - ${t('testNotificationSent')}`, {
        body: t('testReminderBody'),
        icon: "/favicon.ico",
        tag: "test-reminder",
      });
      toast({
        title: t('testNotificationSent'),
        description: t('checkNotificationReceived'),
      });
    } else if (typeof Notification === "undefined") {
      toast({
        title: t('notificationsNotSupported'),
        description: t('browserNoNotifications'),
        variant: "destructive",
      });
    } else {
      toast({
        title: t('notificationsNotEnabled'),
        description: t('enableNotificationsForReminders'),
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
            <span>{t('dailyReminders')}</span>
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
            {t('enableDailyReminders')}
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
                {t('reminderTime')}
              </Label>
              <Select value={reminderTime} onValueChange={handleTimeChange}>
                <SelectTrigger data-testid="select-reminder-time">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="08:00">{formatTime(8)}</SelectItem>
                  <SelectItem value="09:00">{formatTime(9)}</SelectItem>
                  <SelectItem value="10:00">{formatTime(10)}</SelectItem>
                  <SelectItem value="11:00">{formatTime(11)}</SelectItem>
                  <SelectItem value="12:00">{formatTime(12)}</SelectItem>
                  <SelectItem value="13:00">{formatTime(13)}</SelectItem>
                  <SelectItem value="14:00">{formatTime(14)}</SelectItem>
                  <SelectItem value="15:00">{formatTime(15)}</SelectItem>
                  <SelectItem value="16:00">{formatTime(16)}</SelectItem>
                  <SelectItem value="17:00">{formatTime(17)}</SelectItem>
                  <SelectItem value="18:00">{formatTime(18)}</SelectItem>
                  <SelectItem value="19:00">{formatTime(19)}</SelectItem>
                  <SelectItem value="20:00">{formatTime(20)}</SelectItem>
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
              {t('sendTestNotification')}
            </Button>
          </>
        )}

        {/* Today's Status */}
        <div className="p-3 bg-purple-100 rounded-md border border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">{t('todaysProgress')}</span>
            </div>
            <div className="text-sm font-semibold text-purple-800" data-testid="today-progress">
              {stats ? `${stats.totalHours}h` : t('noTimeLogged')}
            </div>
          </div>
          
          {hasLoggedToday ? (
            <div className="mt-2 text-xs text-green-700 flex items-center space-x-1" data-testid="status-logged">
              <CheckCircle className="h-3 w-3" />
              <span>{t('success')}</span>
            </div>
          ) : (
            <div className="mt-2 text-xs text-purple-700" data-testid="status-not-logged">
              💡 {t('startTimerToTrack')}
            </div>
          )}
        </div>

        {/* Notification Permission Status */}
        <div className="text-xs text-purple-600 text-center" data-testid="notification-status">
          {typeof Notification === "undefined" ? (
            `📱 ${t('notificationsNotAvailable')}`
          ) : Notification.permission === "granted" ? (
            `✅ ${t('notificationsGranted')}`
          ) : Notification.permission === "denied" ? (
            `❌ ${t('notificationsDenied')}`
          ) : (
            `⚠️ ${t('notificationsDefault')}`
          )}
        </div>
      </CardContent>
    </Card>
  );
}