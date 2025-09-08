import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Zap,
  Users,
  MessageCircle,
  Calendar,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface RealTimeNotification {
  id: string;
  type: 'task' | 'project' | 'message' | 'system' | 'collaboration';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
  read: boolean;
  actionable: boolean;
  data?: Record<string, any>;
  userId?: string;
  userName?: string;
}

interface RealtimeService {
  isConnected: boolean;
  notifications: RealTimeNotification[];
  onlineUsers: Array<{
    userId: string;
    userName: string;
    lastSeen: string;
  }>;
  activeChannels: string[];
}

export function useRealtimeService() {
  const [service, setService] = useState<RealtimeService>({
    isConnected: false,
    notifications: [],
    onlineUsers: [],
    activeChannels: []
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  const connect = (userId: string, userName: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = `ws://localhost:5000/ws/collaboration?userId=${encodeURIComponent(userId)}&userName=${encodeURIComponent(userName)}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('🔌 Connected to real-time service');
      setService(prev => ({ ...prev, isConnected: true }));
      toast({
        title: "Connected",
        description: "Real-time updates are now active",
      });
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('🔌 Disconnected from real-time service');
      setService(prev => ({ ...prev, isConnected: false }));
      
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) {
          connect(userId, userName);
        }
      }, 5000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setService(prev => ({ ...prev, isConnected: false }));
    };

    wsRef.current = ws;
  };

  const disconnect = () => {
    wsRef.current?.close();
    wsRef.current = null;
    setService(prev => ({ ...prev, isConnected: false }));
  };

  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'connection_established':
        setService(prev => ({
          ...prev,
          onlineUsers: message.data.onlineUsers || []
        }));
        break;

      case 'user_joined':
        setService(prev => ({
          ...prev,
          onlineUsers: [...prev.onlineUsers, {
            userId: message.data.userId,
            userName: message.data.userName,
            lastSeen: new Date().toISOString()
          }]
        }));
        
        // Show toast notification for new user
        toast({
          title: "User joined",
          description: `${message.data.userName} is now online`,
        });
        break;

      case 'user_left':
        setService(prev => ({
          ...prev,
          onlineUsers: prev.onlineUsers.filter(u => u.userId !== message.data.userId)
        }));
        break;

      case 'task_created':
      case 'task_updated':
      case 'task_assigned':
        const taskNotification: RealTimeNotification = {
          id: `task_${Date.now()}_${Math.random()}`,
          type: 'task',
          title: message.type === 'task_created' ? 'New Task' : 
                 message.type === 'task_updated' ? 'Task Updated' : 'Task Assigned',
          message: `${message.data.title} - ${message.data.description}`,
          priority: message.data.priority || 'medium',
          timestamp: new Date().toISOString(),
          read: false,
          actionable: true,
          data: message.data,
          userId: message.data.userId,
          userName: message.data.userName
        };
        
        setService(prev => ({
          ...prev,
          notifications: [taskNotification, ...prev.notifications].slice(0, 50) // Keep last 50
        }));
        
        // Show toast for high priority tasks
        if (message.data.priority === 'high' || message.data.priority === 'urgent') {
          toast({
            title: taskNotification.title,
            description: taskNotification.message,
            variant: message.data.priority === 'urgent' ? 'destructive' : 'default'
          });
        }
        break;

      case 'project_update':
        const projectNotification: RealTimeNotification = {
          id: `project_${Date.now()}_${Math.random()}`,
          type: 'project',
          title: 'Project Updated',
          message: `${message.data.name} has been updated`,
          priority: 'medium',
          timestamp: new Date().toISOString(),
          read: false,
          actionable: true,
          data: message.data
        };
        
        setService(prev => ({
          ...prev,
          notifications: [projectNotification, ...prev.notifications].slice(0, 50)
        }));
        break;

      case 'chat_message':
        const chatNotification: RealTimeNotification = {
          id: `chat_${Date.now()}_${Math.random()}`,
          type: 'message',
          title: 'New Message',
          message: `${message.data.userName}: ${message.data.content}`,
          priority: 'low',
          timestamp: new Date().toISOString(),
          read: false,
          actionable: true,
          data: message.data,
          userId: message.data.userId,
          userName: message.data.userName
        };
        
        setService(prev => ({
          ...prev,
          notifications: [chatNotification, ...prev.notifications].slice(0, 50)
        }));
        break;

      case 'system_alert':
        const systemNotification: RealTimeNotification = {
          id: `system_${Date.now()}_${Math.random()}`,
          type: 'system',
          title: 'System Alert',
          message: message.data.message,
          priority: message.data.severity || 'medium',
          timestamp: new Date().toISOString(),
          read: false,
          actionable: false,
          data: message.data
        };
        
        setService(prev => ({
          ...prev,
          notifications: [systemNotification, ...prev.notifications].slice(0, 50)
        }));
        
        // Always show system alerts as toasts
        toast({
          title: systemNotification.title,
          description: systemNotification.message,
          variant: message.data.severity === 'high' ? 'destructive' : 'default'
        });
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  };

  const markAsRead = (notificationId: string) => {
    setService(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    }));
  };

  const clearNotification = (notificationId: string) => {
    setService(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== notificationId)
    }));
  };

  const clearAllNotifications = () => {
    setService(prev => ({ ...prev, notifications: [] }));
  };

  const joinChannel = (channelId: string) => {
    sendMessage({
      type: 'join_channel',
      data: { channelId }
    });
    
    setService(prev => ({
      ...prev,
      activeChannels: [...prev.activeChannels, channelId]
    }));
  };

  const leaveChannel = (channelId: string) => {
    sendMessage({
      type: 'leave_channel', 
      data: { channelId }
    });
    
    setService(prev => ({
      ...prev,
      activeChannels: prev.activeChannels.filter(c => c !== channelId)
    }));
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    ...service,
    connect,
    disconnect,
    sendMessage,
    markAsRead,
    clearNotification,
    clearAllNotifications,
    joinChannel,
    leaveChannel
  };
}

interface RealTimeNotificationsProps {
  className?: string;
}

export function RealTimeNotifications({ className }: RealTimeNotificationsProps) {
  const realtime = useRealtimeService();
  const [showPanel, setShowPanel] = useState(false);

  // Auto-connect when component mounts (would use actual user data in practice)
  useEffect(() => {
    // Simulate getting user data from session/context
    const userId = 'current-user-id';
    const userName = 'Current User';
    
    if (!realtime.isConnected) {
      realtime.connect(userId, userName);
    }
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task': return <CheckCircle className="h-4 w-4" />;
      case 'project': return <Calendar className="h-4 w-4" />;
      case 'message': return <MessageCircle className="h-4 w-4" />;
      case 'collaboration': return <Users className="h-4 w-4" />;
      case 'system': return <AlertTriangle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const unreadCount = realtime.notifications.filter(n => !n.read).length;

  return (
    <div className={cn("relative", className)} data-testid="real-time-notifications">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setShowPanel(!showPanel)}
        data-testid="button-notifications-toggle"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 bg-red-500"
            data-testid="notification-badge"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Connection Status Indicator */}
      <div className={cn(
        "absolute top-0 right-0 w-2 h-2 rounded-full",
        realtime.isConnected ? "bg-green-400" : "bg-red-400"
      )} />

      {/* Notifications Panel */}
      {showPanel && (
        <Card className="absolute right-0 top-12 w-96 shadow-lg z-50 max-h-96">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Notifications ({unreadCount} unread)
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={realtime.isConnected ? "default" : "destructive"} className="text-xs">
                  {realtime.isConnected ? "Connected" : "Disconnected"}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPanel(false)}
                  className="h-6 w-6 p-0"
                  data-testid="button-close-notifications"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {realtime.notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              <ScrollArea className="h-80">
                <div className="space-y-1 p-3">
                  {realtime.notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex items-start space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors",
                        !notification.read ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
                      )}
                      onClick={() => realtime.markAsRead(notification.id)}
                      data-testid={`notification-${notification.id}`}
                    >
                      <div className={cn("p-1.5 rounded-full", getPriorityColor(notification.priority))}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <Badge className={cn("text-xs", getPriorityColor(notification.priority))}>
                            {notification.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              realtime.clearNotification(notification.id);
                            }}
                            data-testid={`button-clear-${notification.id}`}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            
            {realtime.notifications.length > 0 && (
              <div className="border-t p-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={realtime.clearAllNotifications}
                  data-testid="button-clear-all"
                >
                  Clear All
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function OnlineUsersIndicator() {
  const realtime = useRealtimeService();
  
  return (
    <div className="flex items-center space-x-2" data-testid="online-users-indicator">
      <div className="flex items-center space-x-1">
        <div className={cn(
          "w-2 h-2 rounded-full",
          realtime.isConnected ? "bg-green-400" : "bg-gray-400"
        )} />
        <Users className="h-4 w-4 text-gray-600" />
        <span className="text-sm text-gray-600">
          {realtime.onlineUsers.length} online
        </span>
      </div>
      
      {realtime.onlineUsers.length > 0 && (
        <div className="flex -space-x-2">
          {realtime.onlineUsers.slice(0, 5).map((user) => (
            <div
              key={user.userId}
              className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs border-2 border-white"
              title={user.userName}
              data-testid={`online-user-${user.userId}`}
            >
              {user.userName.charAt(0).toUpperCase()}
            </div>
          ))}
          {realtime.onlineUsers.length > 5 && (
            <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs border-2 border-white">
              +{realtime.onlineUsers.length - 5}
            </div>
          )}
        </div>
      )}
    </div>
  );
}