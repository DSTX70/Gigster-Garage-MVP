import { useMemo } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, AlertCircle, Download, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@shared/schema";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onSlotSelect: (slotInfo: { start: Date; end: Date }) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Task;
  allDay: boolean;
}

export function CalendarView({ tasks, onTaskClick, onSlotSelect }: CalendarViewProps) {
  const { toast } = useToast();

  const events: CalendarEvent[] = useMemo(() => {
    return tasks
      .filter(task => task.dueDate)
      .map(task => {
        const dueDate = new Date(task.dueDate!);
        return {
          id: task.id,
          title: task.description || task.title || 'Untitled Task',
          start: dueDate,
          end: dueDate,
          resource: task,
          allDay: !task.dueDate!.toString().includes('T'), // Check if time is included
        };
      });
  }, [tasks]);

  const handleExportCalendar = async () => {
    try {
      const response = await fetch('/api/calendar/export', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'gigster-garage-tasks.ics';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Calendar Export Successful",
          description: "Your tasks have been exported as a calendar file. Import it into your preferred calendar app.",
        });
      } else {
        throw new Error('Failed to export calendar');
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export calendar. Please try again.",
        variant: "destructive",
      });
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const task = event.resource;
    const isOverdue = new Date(task.dueDate!) < new Date() && !task.completed;
    
    let backgroundColor = '#3174ad';
    let borderColor = '#3174ad';
    
    if (task.completed) {
      backgroundColor = '#10b981';
      borderColor = '#10b981';
    } else if (isOverdue) {
      backgroundColor = '#ef4444';
      borderColor = '#ef4444';
    } else if (task.priority === 'high') {
      backgroundColor = '#f59e0b';
      borderColor = '#f59e0b';
    } else if (task.priority === 'low') {
      backgroundColor = '#6b7280';
      borderColor = '#6b7280';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px',
        padding: '2px 4px',
      }
    };
  };

  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const task = event.resource;
    const isOverdue = new Date(task.dueDate!) < new Date() && !task.completed;
    
    return (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-1 min-w-0 flex-1">
          {isOverdue && <AlertCircle className="h-3 w-3 flex-shrink-0" />}
          <span className="truncate text-xs">{task.description || task.title}</span>
        </div>
        {task.assignedToId && (
          <Users className="h-3 w-3 flex-shrink-0 ml-1" />
        )}
      </div>
    );
  };

  const ToolbarComponent = ({ label, onNavigate, onView, view }: {
    label: string;
    onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
    onView: (view: any) => void;
    view: any;
  }) => {
    return (
      <div className="flex items-center justify-between mb-4 p-4 bg-white rounded-lg border">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onNavigate('PREV')}
            data-testid="calendar-prev"
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onNavigate('TODAY')}
            data-testid="calendar-today"
          >
            Today
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onNavigate('NEXT')}
            data-testid="calendar-next"
          >
            Next
          </Button>
        </div>
        
        <h2 className="text-lg font-semibold text-gray-900">{label}</h2>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportCalendar}
            data-testid="calendar-export"
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button 
            variant={view === Views.MONTH ? "default" : "outline"} 
            size="sm" 
            onClick={() => onView(Views.MONTH)}
            data-testid="calendar-month-view"
          >
            Month
          </Button>
          <Button 
            variant={view === Views.WEEK ? "default" : "outline"} 
            size="sm" 
            onClick={() => onView(Views.WEEK)}
            data-testid="calendar-week-view"
          >
            Week
          </Button>
          <Button 
            variant={view === Views.DAY ? "default" : "outline"} 
            size="sm" 
            onClick={() => onView(Views.DAY)}
            data-testid="calendar-day-view"
          >
            Day
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Calendar Legend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Legend</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Medium Priority</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>High Priority</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded"></div>
              <span>Low Priority</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Overdue</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardContent className="p-0">
          <div className="h-[600px] p-4" data-testid="calendar-container">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              titleAccessor="title"
              onSelectEvent={(event: any) => onTaskClick(event.resource)}
              onSelectSlot={(slotInfo: any) => onSlotSelect({
                start: slotInfo.start as Date,
                end: slotInfo.end as Date,
              })}
              selectable
              popup
              components={{
                event: EventComponent,
                toolbar: ToolbarComponent,
              }}
              eventPropGetter={eventStyleGetter}
              step={60}
              showMultiDayTimes
              views={[Views.MONTH, Views.WEEK, Views.DAY]}
              defaultView={Views.MONTH}
              style={{
                height: '100%',
              }}
              messages={{
                next: "Next",
                previous: "Previous", 
                today: "Today",
                month: "Month",
                week: "Week",
                day: "Day",
                agenda: "Agenda",
                date: "Date",
                time: "Time",
                event: "Event",
                noEventsInRange: "No tasks in this date range.",
                showMore: (total: number) => `+${total} more tasks`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Tasks with Dates</p>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              </div>
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {events.filter(e => e.resource.completed).length}
                </p>
              </div>
              <div className="w-6 h-6 bg-green-500 rounded" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {events.filter(e => 
                    new Date(e.resource.dueDate!) < new Date() && !e.resource.completed
                  ).length}
                </p>
              </div>
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-yellow-600">This Week</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {events.filter(e => {
                    const taskDate = new Date(e.resource.dueDate!);
                    const now = new Date();
                    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                    return taskDate >= now && taskDate <= weekFromNow && !e.resource.completed;
                  }).length}
                </p>
              </div>
              <div className="w-6 h-6 bg-yellow-500 rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}