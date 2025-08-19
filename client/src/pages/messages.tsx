import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, MailOpen, Reply, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  from: string;
  subject: string;
  content: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export function MessagesPage() {
  // Mock messages for now - this would come from an API
  const mockMessages: Message[] = [
    {
      id: '1',
      from: 'System',
      subject: 'Welcome to VSuite HQ',
      content: 'Welcome to your new task management dashboard! Start by creating your first project and task.',
      timestamp: new Date(),
      read: false,
      priority: 'medium'
    }
  ];

  const messages = mockMessages;
  const unreadCount = messages.filter(m => !m.read).length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-2">
              {unreadCount > 0 
                ? `You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`
                : 'All messages read'
              }
            </p>
          </div>
          
          <Button variant="outline" className="flex items-center space-x-2">
            <Mail size={16} />
            <span>Compose</span>
          </Button>
        </div>

        <div className="space-y-4">
          {messages.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Mail size={48} className="text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages</h3>
                <p className="text-gray-600 text-center">
                  You don't have any messages yet. Messages from the system and other users will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            messages.map((message) => (
              <Card key={message.id} className={`transition-colors hover:bg-gray-50 ${!message.read ? 'border-blue-200 bg-blue-50/30' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {message.read ? (
                          <MailOpen size={20} className="text-gray-400" />
                        ) : (
                          <Mail size={20} className="text-blue-600" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-base font-medium">
                          {message.subject}
                          {!message.read && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              New
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center space-x-2 mt-1">
                          <span>From: {message.from}</span>
                          <span>•</span>
                          <span>{format(message.timestamp, 'MMM d, yyyy h:mm a')}</span>
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(message.priority)}`} />
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Reply size={16} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {message.content}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}