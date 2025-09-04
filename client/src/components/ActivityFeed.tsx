import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow, startOfDay, endOfDay, subDays, subWeeks, subMonths } from "date-fns";
import { copy } from "@/lib/copy";
import {
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Users,
  FolderOpen,
  MessageSquare,
  Edit,
  Trash,
  Plus,
  Settings,
  Mail,
  Bell,
  Filter,
  Calendar,
  Eye,
  EyeOff,
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: string;
  entityType: "task" | "project" | "client" | "user";
  entityId: string;
  actorId: string;
  actor?: {
    id: string;
    name: string;
    email: string;
    profileImageUrl?: string;
  };
  data: Record<string, any>;
  description: string;
  isPrivate: boolean;
  createdAt: string;
}

interface ActivityFeedProps {
  entityType?: "task" | "project" | "client" | "user";
  entityId?: string;
  limit?: number;
  showFilters?: boolean;
  className?: string;
}

const activityTypeIcons: Record<string, React.ReactNode> = {
  // Task activities
  task_created: <Plus className="w-4 h-4 text-green-600" />,
  task_updated: <Edit className="w-4 h-4 text-blue-600" />,
  task_completed: <CheckCircle className="w-4 h-4 text-green-600" />,
  task_assigned: <User className="w-4 h-4 text-purple-600" />,
  task_status_changed: <Settings className="w-4 h-4 text-orange-600" />,
  task_deleted: <Trash className="w-4 h-4 text-red-600" />,

  // Project activities
  project_created: <FolderOpen className="w-4 h-4 text-green-600" />,
  project_updated: <Edit className="w-4 h-4 text-blue-600" />,
  project_status_changed: <Settings className="w-4 h-4 text-orange-600" />,
  project_milestone_reached: <CheckCircle className="w-4 h-4 text-green-600" />,
  project_deleted: <Trash className="w-4 h-4 text-red-600" />,

  // Client activities
  client_created: <Users className="w-4 h-4 text-green-600" />,
  client_updated: <Edit className="w-4 h-4 text-blue-600" />,
  client_status_changed: <Settings className="w-4 h-4 text-orange-600" />,
  client_deleted: <Trash className="w-4 h-4 text-red-600" />,

  // Comment activities
  comment_added: <MessageSquare className="w-4 h-4 text-blue-600" />,
  comment_updated: <Edit className="w-4 h-4 text-orange-600" />,
  comment_deleted: <Trash className="w-4 h-4 text-red-600" />,

  // User activities
  user_created: <User className="w-4 h-4 text-green-600" />,
  user_updated: <Edit className="w-4 h-4 text-blue-600" />,
  user_login: <User className="w-4 h-4 text-blue-600" />,
  user_logout: <User className="w-4 h-4 text-gray-600" />,

  // System activities
  workflow_executed: <Settings className="w-4 h-4 text-purple-600" />,
  email_sent: <Mail className="w-4 h-4 text-blue-600" />,
  notification_sent: <Bell className="w-4 h-4 text-yellow-600" />,

  // Default
  default: <Activity className="w-4 h-4 text-gray-600" />,
};

const activityTypeColors: Record<string, string> = {
  task_created: "border-l-green-500",
  task_updated: "border-l-blue-500",
  task_completed: "border-l-green-500",
  task_assigned: "border-l-purple-500",
  task_status_changed: "border-l-orange-500",
  task_deleted: "border-l-red-500",
  
  project_created: "border-l-green-500",
  project_updated: "border-l-blue-500",
  project_status_changed: "border-l-orange-500",
  project_milestone_reached: "border-l-green-500",
  project_deleted: "border-l-red-500",
  
  client_created: "border-l-green-500",
  client_updated: "border-l-blue-500",
  client_status_changed: "border-l-orange-500",
  client_deleted: "border-l-red-500",
  
  comment_added: "border-l-blue-500",
  comment_updated: "border-l-orange-500",
  comment_deleted: "border-l-red-500",
  
  user_created: "border-l-green-500",
  user_updated: "border-l-blue-500",
  user_login: "border-l-blue-500",
  user_logout: "border-l-gray-500",
  
  workflow_executed: "border-l-purple-500",
  email_sent: "border-l-blue-500",
  notification_sent: "border-l-yellow-500",
  
  default: "border-l-gray-500",
};

function ActivityItem({ activity, isLast = false }: { activity: ActivityItem; isLast?: boolean }) {
  const getActorInitials = () => {
    if (activity.actor?.name) {
      return activity.actor.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return 'U';
  };

  const getActivityIcon = () => {
    return activityTypeIcons[activity.type] || activityTypeIcons.default;
  };

  const getActivityColor = () => {
    return activityTypeColors[activity.type] || activityTypeColors.default;
  };

  const formatActivityTime = () => {
    return formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true });
  };

  const getEntityBadgeColor = () => {
    switch (activity.entityType) {
      case 'task': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'project': return 'bg-green-100 text-green-800 border-green-200';
      case 'client': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'user': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="relative">
      <div className={`flex gap-3 pb-4 border-l-4 pl-4 ${getActivityColor()}`}>
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm">
            {getActivityIcon()}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={activity.actor?.profileImageUrl} />
                  <AvatarFallback className="text-xs bg-[#0B1D3A] text-white">
                    {getActorInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm text-[#0B1D3A]">
                  {activity.actor?.name || 'Unknown User'}
                </span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getEntityBadgeColor()}`}
                >
                  {activity.entityType}
                </Badge>
                {activity.isPrivate && (
                  <div title="Private activity">
                    <EyeOff className="w-3 h-3 text-gray-500" />
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                {activity.description}
              </p>

              {/* Activity metadata */}
              {activity.data && Object.keys(activity.data).length > 0 && (
                <div className="text-xs text-gray-500 space-y-1">
                  {activity.data.previousValue && activity.data.newValue && (
                    <div>
                      <span className="line-through text-red-500">{activity.data.previousValue}</span>
                      {' → '}
                      <span className="text-green-600">{activity.data.newValue}</span>
                    </div>
                  )}
                  {activity.data.assignedTo && (
                    <div>Assigned to: {activity.data.assignedTo}</div>
                  )}
                  {activity.data.priority && (
                    <div>Priority: {activity.data.priority}</div>
                  )}
                </div>
              )}
            </div>

            <div className="text-xs text-gray-500 mt-1 flex-shrink-0 ml-2">
              <Clock className="w-3 h-3 inline mr-1" />
              {formatActivityTime()}
            </div>
          </div>
        </div>
      </div>

      {!isLast && <div className="absolute left-[1.875rem] top-12 bottom-0 w-px bg-gray-200" />}
    </div>
  );
}

export function ActivityFeed({ 
  entityType, 
  entityId, 
  limit = 50, 
  showFilters = true, 
  className = "" 
}: ActivityFeedProps) {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (entityType && entityId) {
    queryParams.append('entityType', entityType);
    queryParams.append('entityId', entityId);
  }
  if (limit) {
    queryParams.append('limit', limit.toString());
  }
  if (typeFilter && typeFilter !== 'all') {
    queryParams.append('type', typeFilter);
  }

  // Fetch activities
  const { data: activities = [], isLoading } = useQuery<ActivityItem[]>({
    queryKey: ["/api/activities", queryParams.toString()],
  });

  // Filter activities based on local filters
  const filteredActivities = activities.filter(activity => {
    // Time filter
    if (timeFilter !== 'all') {
      const activityDate = new Date(activity.createdAt);
      const now = new Date();
      
      switch (timeFilter) {
        case 'today':
          if (activityDate < startOfDay(now) || activityDate > endOfDay(now)) return false;
          break;
        case 'week':
          if (activityDate < subWeeks(now, 1)) return false;
          break;
        case 'month':
          if (activityDate < subMonths(now, 1)) return false;
          break;
      }
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!activity.description.toLowerCase().includes(searchLower) &&
          !activity.actor?.name.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    return true;
  });

  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = startOfDay(new Date(activity.createdAt)).toISOString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, ActivityItem[]>);

  const sortedDateGroups = Object.keys(groupedActivities).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="h-6 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#0B1D3A] flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Activity Feed
        </h3>
        {activities.length > 0 && (
          <Badge variant="secondary">
            {filteredActivities.length} activities
          </Badge>
        )}
      </div>

      {showFilters && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="task_">Tasks</SelectItem>
                  <SelectItem value="project_">Projects</SelectItem>
                  <SelectItem value="client_">Clients</SelectItem>
                  <SelectItem value="comment_">Comments</SelectItem>
                  <SelectItem value="user_">Users</SelectItem>
                  <SelectItem value="workflow_">Workflows</SelectItem>
                </SelectContent>
              </Select>

              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48"
                data-testid="input-search-activities"
              />

              {(typeFilter !== 'all' || timeFilter !== 'all' || searchTerm) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTypeFilter('all');
                    setTimeFilter('all');
                    setSearchTerm('');
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <ScrollArea className="h-96 pr-4">
        {sortedDateGroups.length > 0 ? (
          <div className="space-y-6">
            {sortedDateGroups.map((dateKey) => {
              const date = new Date(dateKey);
              const activitiesForDate = groupedActivities[dateKey];

              return (
                <div key={dateKey} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Separator className="flex-1" />
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      {date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Badge>
                    <Separator className="flex-1" />
                  </div>

                  <div className="space-y-1">
                    {activitiesForDate.map((activity, index) => (
                      <ActivityItem
                        key={activity.id}
                        activity={activity}
                        isLast={index === activitiesForDate.length - 1 && dateKey === sortedDateGroups[sortedDateGroups.length - 1]}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activity found</h3>
              <p className="text-gray-500">
                {searchTerm || typeFilter !== 'all' || timeFilter !== 'all'
                  ? copy.emptyStates.search.nothingMatches
                  : entityType && entityId 
                    ? copy.emptyStates.activity.noRecent
                    : copy.emptyStates.activity.noSparks
                }
              </p>
            </CardContent>
          </Card>
        )}
      </ScrollArea>
    </div>
  );
}