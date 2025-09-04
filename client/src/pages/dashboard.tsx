import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  User,
  StickyNote,
  Paperclip,
  ExternalLink,
  ArrowLeft,
  Plus
} from "lucide-react";
import { format, isAfter, startOfDay } from "date-fns";
import { useState } from "react";
import { useLocation } from "wouter";
import type { User as UserType, Task } from "@shared/schema";

interface UserWithTasks extends UserType {
  tasks: Task[];
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const { data: users = [], isLoading: usersLoading } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
  });

  const { data: allTasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Group tasks by user
  const usersWithTasks: UserWithTasks[] = users.map(user => ({
    ...user,
    tasks: allTasks.filter(task => task.assignedToId === user.id)
  }));

  // Unassigned tasks
  const unassignedTasks = allTasks.filter(task => !task.assignedToId);

  const toggleUserExpansion = (userId: string) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusInfo = (task: Task) => {
    if (task.completed) {
      return { text: 'Completed', color: 'text-green-600', icon: <CheckCircle size={16} /> };
    }
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const today = startOfDay(new Date());
      if (isAfter(today, dueDate)) {
        return { text: 'Overdue', color: 'text-red-600', icon: <AlertTriangle size={16} /> };
      }
      if (today.getTime() === startOfDay(dueDate).getTime()) {
        return { text: 'Due Today', color: 'text-orange-600', icon: <Clock size={16} /> };
      }
    }
    return { text: 'In Progress', color: 'text-blue-600', icon: <Clock size={16} /> };
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const statusInfo = getStatusInfo(task);
    const hasExtras = task.notes || (task.attachments && task.attachments.length > 0) || (task.links && task.links.length > 0);

    return (
      <div className="border rounded-lg p-4 space-y-3 bg-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
              {task.description}
            </h4>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge className={getPriorityColor(task.priority || 'medium')}>
                {task.priority || 'medium'}
              </Badge>
              <div className={`flex items-center space-x-1 ${statusInfo.color}`}>
                {statusInfo.icon}
                <span className="text-sm">{statusInfo.text}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          {task.dueDate && (
            <div className="flex items-center space-x-2">
              <Calendar size={16} />
              <span>Due: {format(new Date(task.dueDate), 'MMM d, yyyy h:mm a')}</span>
            </div>
          )}
          
          {task.projectId && (
            <div className="flex items-center space-x-2 text-green-600">
              <FileText size={16} />
              <span>Project ID: {task.projectId}</span>
            </div>
          )}

          {hasExtras && (
            <div className="flex items-center space-x-4">
              {task.notes && (
                <div className="flex items-center space-x-1 text-purple-600">
                  <StickyNote size={16} />
                  <span>Has notes</span>
                </div>
              )}
              {task.attachments && task.attachments.length > 0 && (
                <div className="flex items-center space-x-1 text-blue-600">
                  <Paperclip size={16} />
                  <span>{task.attachments.length} file(s)</span>
                </div>
              )}
              {task.links && task.links.length > 0 && (
                <div className="flex items-center space-x-1 text-indigo-600">
                  <ExternalLink size={16} />
                  <span>{task.links.length} link(s)</span>
                </div>
              )}
            </div>
          )}

          {task.notes && (
            <div className="bg-purple-50 p-2 rounded text-purple-800">
              <strong>Notes:</strong> {task.notes}
            </div>
          )}

          {task.attachments && task.attachments.length > 0 && (
            <div className="bg-blue-50 p-2 rounded text-blue-800">
              <strong>Attachments:</strong> {task.attachments.join(', ')}
            </div>
          )}

          {task.links && task.links.length > 0 && (
            <div className="bg-indigo-50 p-2 rounded text-indigo-800">
              <strong>Links:</strong>
              <div className="mt-1 space-y-1">
                {task.links.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:underline"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500">
          Created: {task.createdAt ? format(new Date(task.createdAt), 'MMM d, yyyy h:mm a') : 'Unknown'}
        </div>
      </div>
    );
  };

  const UserSection = ({ user }: { user: UserWithTasks }) => {
    const isExpanded = expandedUsers.has(user.id);
    const completedTasks = user.tasks.filter(t => t.completed).length;
    const pendingTasks = user.tasks.filter(t => !t.completed).length;
    const overdueTasks = user.tasks.filter(t => 
      !t.completed && t.dueDate && isAfter(startOfDay(new Date()), new Date(t.dueDate))
    ).length;

    return (
      <Card className="mb-4">
        <Collapsible open={isExpanded} onOpenChange={() => toggleUserExpansion(user.id)}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>{user.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <p className="text-sm text-gray-600">@{user.username} • {user.email}</p>
                  </div>
                  <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                    {user.role}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right text-sm">
                    <div className="text-gray-600">
                      {user.tasks.length} total tasks
                    </div>
                    <div className="flex space-x-2 text-xs">
                      <span className="text-green-600">{completedTasks} done</span>
                      <span className="text-blue-600">{pendingTasks} pending</span>
                      {overdueTasks > 0 && (
                        <span className="text-red-600">{overdueTasks} overdue</span>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </Button>
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              {user.tasks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No tasks assigned to this user</p>
              ) : (
                <div className="space-y-3">
                  {user.tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  if (usersLoading || tasksLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="flex items-center"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Tasks
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="mr-3" size={32} />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Overview of all users and their assigned tasks</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700"
            onClick={() => navigate("/")}
            data-testid="button-new-task-dashboard"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Task
          </Button>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600">
              <div><strong>{users.length}</strong> total users</div>
              <div><strong>{allTasks.length}</strong> total tasks</div>
              <div><strong>{unassignedTasks.length}</strong> unassigned tasks</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {usersWithTasks.map((user) => (
            <UserSection key={`dashboard-user-${user.id}`} user={user} />
          ))}

          {unassignedTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="mr-2" size={20} />
                  Unassigned Tasks ({unassignedTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {unassignedTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}