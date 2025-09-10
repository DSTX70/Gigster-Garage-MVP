import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Users, 
  Minimize, 
  Maximize, 
  X,
  Paperclip,
  Smile,
  Hash
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  type: 'text' | 'file' | 'image' | 'task_comment';
  timestamp: Date;
  taskId?: string;
  projectId?: string;
  channelId?: string;
  metadata?: Record<string, any>;
}

interface OnlineUser {
  userId: string;
  userName: string;
  lastSeen: Date;
  currentProject?: string;
}

interface ChatWidgetProps {
  channelId: string;
  channelName: string;
  projectId?: string;
  taskId?: string;
  initialMinimized?: boolean;
  className?: string;
}

export function ChatWidget({
  channelId,
  channelName,
  projectId,
  taskId,
  initialMinimized = false,
  className
}: ChatWidgetProps) {
  const { user } = useAuth();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typing, setTyping] = useState<Set<string>>(new Set());
  const [newMessage, setNewMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(initialMinimized);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSeenRef = useRef<string>('');

  // WebSocket connection
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/collaboration?userId=${user.id}&userName=${encodeURIComponent(user.name || 'Unknown')}`;
    
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('🔗 Connected to collaboration service');
      setConnected(true);
      setWs(websocket);

      // Join the channel
      websocket.send(JSON.stringify({
        type: 'join_channel',
        data: { channelId }
      }));
    };

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleWebSocketMessage(message);
    };

    websocket.onclose = () => {
      console.log('🔌 Disconnected from collaboration service');
      setConnected(false);
      setWs(null);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
          type: 'leave_channel',
          data: { channelId }
        }));
        websocket.close();
      }
    };
  }, [user, channelId]);

  // Handle WebSocket messages
  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'connection_established':
        setOnlineUsers(message.data.onlineUsers);
        break;

      case 'channel_messages':
        if (message.data.channelId === channelId) {
          setMessages(message.data.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
        }
        break;

      case 'new_message':
      case 'task_comment':
        if (message.data.channelId === channelId || message.data.taskId === taskId) {
          const newMsg = {
            ...message.data,
            timestamp: new Date(message.data.timestamp)
          };
          
          setMessages(prev => [...prev, newMsg]);
          
          // Count unread if minimized and not from current user
          if (isMinimized && message.data.userId !== user?.id) {
            setUnreadCount(prev => prev + 1);
          }
        }
        break;

      case 'typing_start':
        if (message.data.channelId === channelId && message.data.userId !== user?.id) {
          setTyping(prev => new Set(Array.from(prev).concat(message.data.userName)));
        }
        break;

      case 'typing_stop':
        if (message.data.channelId === channelId) {
          setTyping(prev => {
            const updated = new Set(prev);
            // Find and remove by userId since we only have userId in stop event
            const userToRemove = onlineUsers.find(u => u.userId === message.data.userId);
            if (userToRemove) {
              updated.delete(userToRemove.userName);
            }
            return updated;
          });
        }
        break;

      case 'user_joined':
      case 'user_left':
      case 'user_status_update':
        // Update online users list
        if (message.type === 'user_joined') {
          setOnlineUsers(prev => [...prev.filter(u => u.userId !== message.data.userId), {
            userId: message.data.userId,
            userName: message.data.userName,
            lastSeen: new Date()
          }]);
        } else if (message.type === 'user_left') {
          setOnlineUsers(prev => prev.filter(u => u.userId !== message.data.userId));
        }
        break;
    }
  };

  // Send message
  const sendMessage = () => {
    if (!ws || !newMessage.trim() || ws.readyState !== WebSocket.OPEN) return;

    const messageData = {
      type: taskId ? 'task_comment' : 'send_message',
      data: {
        content: newMessage.trim(),
        channelId,
        projectId,
        taskId,
        type: 'text'
      }
    };

    ws.send(JSON.stringify(messageData));
    setNewMessage('');
    stopTyping();
  };

  // Typing indicators
  const startTyping = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN || isTyping) return;

    setIsTyping(true);
    ws.send(JSON.stringify({
      type: 'typing_start',
      data: { channelId }
    }));

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  const stopTyping = () => {
    if (!ws || !isTyping) return;

    setIsTyping(false);
    ws.send(JSON.stringify({
      type: 'typing_stop',
      data: { channelId }
    }));

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clear unread when expanded
  useEffect(() => {
    if (!isMinimized) {
      setUnreadCount(0);
    }
  }, [isMinimized]);

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatUserName = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isMinimized) {
    return (
      <Card className={cn("fixed bottom-4 right-4 w-80 z-50 shadow-lg", className)}>
        <CardHeader 
          className="cursor-pointer p-3 bg-teal-600 text-white rounded-t-lg"
          onClick={() => setIsMinimized(false)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span className="font-medium text-sm">{channelName}</span>
              {connected && (
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
                onClick={() => setIsMinimized(false)}
              >
                <Maximize className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={cn("fixed bottom-4 right-4 w-96 h-96 z-50 shadow-lg flex flex-col", className)}>
      {/* Header */}
      <CardHeader className="p-3 bg-teal-600 text-white rounded-t-lg flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Hash className="h-4 w-4" />
            <span className="font-medium text-sm">{channelName}</span>
            {connected ? (
              <div className="w-2 h-2 bg-green-400 rounded-full" title="Connected"></div>
            ) : (
              <div className="w-2 h-2 bg-red-400 rounded-full" title="Disconnected"></div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs bg-white/20 text-white">
              {onlineUsers.length} online
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-white hover:bg-white/20"
              onClick={() => setIsMinimized(true)}
            >
              <Minimize className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-3">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex space-x-2",
                  message.userId === user?.id ? "justify-end" : "justify-start"
                )}
              >
                {message.userId !== user?.id && (
                  <Avatar className="h-6 w-6 mt-1">
                    <AvatarFallback className="text-xs bg-teal-100 text-teal-800">
                      {formatUserName(message.userName)}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={cn(
                  "max-w-[70%] rounded-lg p-2",
                  message.userId === user?.id 
                    ? "bg-teal-600 text-white" 
                    : "bg-gray-100 text-gray-900"
                )}>
                  {message.userId !== user?.id && (
                    <div className="text-xs font-medium mb-1 opacity-75">
                      {message.userName}
                    </div>
                  )}
                  <div className="text-sm">{message.content}</div>
                  <div className={cn(
                    "text-xs mt-1 opacity-75",
                    message.userId === user?.id ? "text-white/75" : "text-gray-500"
                  )}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing indicators */}
            {typing.size > 0 && (
              <div className="flex items-center space-x-2 text-gray-500 text-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span>
                  {Array.from(typing).join(', ')} {typing.size === 1 ? 'is' : 'are'} typing...
                </span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Message Input */}
      <div className="p-3 border-t flex-shrink-0">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              if (e.target.value.trim() && !isTyping) {
                startTyping();
              } else if (!e.target.value.trim() && isTyping) {
                stopTyping();
              }
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={`Message ${channelName}...`}
            className="flex-1 text-sm"
            disabled={!connected}
            data-testid="input-chat-message"
          />
          <Button
            onClick={sendMessage}
            disabled={!connected || !newMessage.trim()}
            size="sm"
            className="bg-teal-600 hover:bg-teal-700"
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}