import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { Task } from '@shared/schema';
import { format, isToday, isTomorrow, isAfter, addDays, startOfDay } from 'date-fns';

interface ReminderNotification {
  id: string;
  task: Task;
  type: 'due_today' | 'due_tomorrow' | 'overdue';
  message: string;
}

export function ReminderSystem() {
  const [notifications, setNotifications] = useState<ReminderNotification[]>([]);
  const [hasPermission, setHasPermission] = useState(false);
  const { toast } = useToast();

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    refetchInterval: 60000, // Check every minute
  });

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setHasPermission(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          setHasPermission(permission === 'granted');
        });
      }
    }
  }, []);

  // Check for reminders
  useEffect(() => {
    if (!tasks.length) return;

    const now = new Date();
    const today = startOfDay(now);
    const tomorrow = addDays(today, 1);
    
    const activeReminders: ReminderNotification[] = [];

    tasks.forEach(task => {
      if (task.completed || !task.dueDate) return;

      const dueDate = new Date(task.dueDate);
      const dueDateStart = startOfDay(dueDate);

      if (dueDateStart.getTime() < today.getTime()) {
        // Overdue
        activeReminders.push({
          id: `overdue-${task.id}`,
          task,
          type: 'overdue',
          message: `"${task.description}" is overdue!`
        });
      } else if (dueDateStart.getTime() === today.getTime()) {
        // Due today
        activeReminders.push({
          id: `today-${task.id}`,
          task,
          type: 'due_today',
          message: `"${task.description}" is due today`
        });
      } else if (dueDateStart.getTime() === tomorrow.getTime()) {
        // Due tomorrow
        activeReminders.push({
          id: `tomorrow-${task.id}`,
          task,
          type: 'due_tomorrow',
          message: `"${task.description}" is due tomorrow`
        });
      }
    });

    // Only update if reminders have actually changed
    const currentIds = notifications.map(n => n.id).sort();
    const newIds = activeReminders.map(r => r.id).sort();
    const hasChanged = JSON.stringify(currentIds) !== JSON.stringify(newIds);

    if (hasChanged) {
      // Check for new notifications to show browser notifications
      activeReminders.forEach(reminder => {
        const existing = notifications.find(n => n.id === reminder.id);
        if (!existing && hasPermission) {
          new Notification('TaskFlow Reminder', {
            body: reminder.message,
            icon: '/favicon.ico',
            tag: reminder.id,
          });

          // Also show toast notification
          toast({
            title: "Task Reminder",
            description: reminder.message,
            variant: reminder.type === 'overdue' ? 'destructive' : 'default',
          });
        }
      });

      setNotifications(activeReminders);
    }
  }, [tasks, hasPermission, toast]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationStyle = (type: ReminderNotification['type']) => {
    switch (type) {
      case 'overdue':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'due_today':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'due_tomorrow':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-neutral-50 border-neutral-200 text-neutral-800';
    }
  };

  const getNotificationIcon = (type: ReminderNotification['type']) => {
    switch (type) {
      case 'overdue':
        return '🚨';
      case 'due_today':
        return '⏰';
      case 'due_tomorrow':
        return '📅';
      default:
        return '🔔';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg border shadow-lg ${getNotificationStyle(notification.type)} animate-in slide-in-from-right-5`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <span className="text-lg">{getNotificationIcon(notification.type)}</span>
              <div>
                <p className="font-medium text-sm">
                  {notification.message}
                </p>
                <p className="text-xs mt-1 opacity-75">
                  Due: {format(new Date(notification.task.dueDate!), 'MMM d, yyyy')}
                </p>
                <Badge 
                  className="mt-2 text-xs"
                  variant={notification.task.priority === 'high' ? 'destructive' : 'secondary'}
                >
                  {notification.task.priority} priority
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissNotification(notification.id)}
              className="h-6 w-6 p-0 hover:bg-white/50"
            >
              <X size={12} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}