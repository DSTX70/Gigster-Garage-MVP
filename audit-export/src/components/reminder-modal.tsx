import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Calendar, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { Task } from '@shared/schema';
import { format, isToday, isTomorrow, startOfDay, addDays } from 'date-fns';

interface ReminderModalProps {
  reminderCount: number;
}

export function ReminderModal({ reminderCount }: ReminderModalProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const response = await apiRequest("PATCH", `/api/tasks/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task completed!",
        description: "Great job staying productive.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const getUpcomingTasks = () => {
    const now = new Date();
    const today = startOfDay(now);
    const tomorrow = addDays(today, 1);
    const nextWeek = addDays(today, 7);
    
    return tasks
      .filter(task => !task.completed && task.dueDate)
      .map(task => {
        const dueDate = new Date(task.dueDate!);
        const dueDateStart = startOfDay(dueDate);
        
        let status: 'overdue' | 'today' | 'tomorrow' | 'upcoming' = 'upcoming';
        let urgency = 0;
        
        if (dueDateStart.getTime() < today.getTime()) {
          status = 'overdue';
          urgency = 4;
        } else if (dueDateStart.getTime() === today.getTime()) {
          status = 'today';
          urgency = 3;
        } else if (dueDateStart.getTime() === tomorrow.getTime()) {
          status = 'tomorrow';
          urgency = 2;
        } else if (dueDateStart.getTime() <= nextWeek.getTime()) {
          status = 'upcoming';
          urgency = 1;
        }
        
        return { ...task, status, urgency, dueDate };
      })
      .filter(task => task.urgency > 0)
      .sort((a, b) => {
        if (a.urgency !== b.urgency) return b.urgency - a.urgency;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  };

  const upcomingTasks = getUpcomingTasks();

  const handleCompleteTask = (task: Task) => {
    updateTaskMutation.mutate({
      id: task.id,
      updates: { completed: true }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'overdue':
        return <Badge variant="destructive" className="text-xs">Overdue</Badge>;
      case 'today':
        return <Badge className="bg-orange-100 text-orange-700 text-xs">Due Today</Badge>;
      case 'tomorrow':
        return <Badge className="bg-blue-100 text-blue-700 text-xs">Due Tomorrow</Badge>;
      case 'upcoming':
        return <Badge variant="secondary" className="text-xs">Upcoming</Badge>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-blue-100 text-blue-700',
      low: 'bg-yellow-100 text-yellow-700'
    };
    return (
      <Badge className={`text-xs ${colors[priority as keyof typeof colors] || 'bg-neutral-100 text-neutral-700'}`}>
        {priority} priority
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="relative p-2 text-neutral-600 hover:text-primary transition-colors duration-200">
          <Bell size={20} />
          {reminderCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {reminderCount}
            </span>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bell size={20} />
            <span>Task Reminders</span>
            {reminderCount > 0 && (
              <Badge variant="secondary">{reminderCount} pending</Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-96">
          {upcomingTasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-secondary" size={32} />
              </div>
              <h3 className="text-lg font-medium text-neutral-800 mb-2">All caught up!</h3>
              <p className="text-neutral-600">No upcoming task reminders at this time.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-800 mb-2">{task.description}</h4>
                      <div className="flex items-center space-x-2 text-sm text-neutral-600">
                        <Calendar size={14} />
                        <span>Due {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {getStatusBadge(task.status)}
                      {getPriorityBadge(task.priority)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-xs text-neutral-500">
                      <Clock size={12} />
                      <span>Created {format(new Date(task.createdAt), 'MMM d')}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleCompleteTask(task)}
                      disabled={updateTaskMutation.isPending}
                      className="bg-secondary hover:bg-secondary/90"
                    >
                      <CheckCircle size={14} className="mr-1" />
                      Complete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}