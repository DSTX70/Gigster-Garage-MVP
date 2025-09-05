import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  MessageCircle, 
  Users, 
  UserCheck, 
  Clock, 
  Hash,
  Plus,
  Search,
  Settings,
  UserPlus,
  Video,
  Share,
  Bell
} from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { ChatWidget } from '@/components/collaboration/chat-widget';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignedToId?: string;
  projectId?: string;
}

interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  role: string;
}

interface ChatChannel {
  id: string;
  name: string;
  type: 'general' | 'project' | 'task' | 'direct';
  description?: string;
  participants: string[];
  lastActivity?: Date;
  unreadCount?: number;
}

export default function TeamCollaborationPage() {
  const { user, isAdmin } = useAuth();
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(null);
  const [showChatWidget, setShowChatWidget] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('channels');

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects']
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['/api/tasks']
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users']
  });

  // Create default channels
  const channels: ChatChannel[] = [
    {
      id: 'general',
      name: 'General',
      type: 'general',
      description: 'Company-wide discussions',
      participants: users.map(u => u.id),
      unreadCount: 0
    },
    ...projects.map(project => ({
      id: `project_${project.id}`,
      name: `# ${project.name}`,
      type: 'project' as const,
      description: `Project discussions for ${project.name}`,
      participants: users.filter(u => 
        tasks.some(t => t.projectId === project.id && t.assignedToId === u.id)
      ).map(u => u.id),
      unreadCount: 0
    })),
    ...tasks.filter(task => task.assignedToId).map(task => ({
      id: `task_${task.id}`,
      name: `Task: ${task.title}`,
      type: 'task' as const,
      description: `Discussion for ${task.title}`,
      participants: [task.assignedToId!, task.createdById || ''].filter(Boolean),
      unreadCount: 0
    }))
  ];

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    channel.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onlineUsers = users.filter(u => u.id !== user?.id); // Simplified for demo

  const formatUserName = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'general': return Hash;
      case 'project': return Hash;
      case 'task': return MessageCircle;
      case 'direct': return MessageCircle;
      default: return Hash;
    }
  };

  const getChannelColor = (type: string) => {
    switch (type) {
      case 'general': return 'bg-blue-500';
      case 'project': return 'bg-green-500';
      case 'task': return 'bg-amber-500';
      case 'direct': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-amber-50">
      <AppHeader />
      
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Team Collaboration</h1>
            <p className="text-gray-600">Real-time chat, task discussions, and team coordination</p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {users.length} team members
            </Badge>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Team
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Channels & Teams</CardTitle>
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search channels..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm"
                    data-testid="input-search-channels"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 mx-3 mb-3">
                    <TabsTrigger value="channels">Channels</TabsTrigger>
                    <TabsTrigger value="people">People</TabsTrigger>
                  </TabsList>

                  <TabsContent value="channels" className="space-y-1 px-3 pb-3">
                    {filteredChannels.map((channel) => {
                      const Icon = getChannelIcon(channel.type);
                      return (
                        <div
                          key={channel.id}
                          className={cn(
                            "flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors",
                            selectedChannel?.id === channel.id ? "bg-teal-50 border border-teal-200" : ""
                          )}
                          onClick={() => {
                            setSelectedChannel(channel);
                            setShowChatWidget(true);
                          }}
                          data-testid={`channel-${channel.id}`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={cn("w-2 h-2 rounded-full", getChannelColor(channel.type))}></div>
                            <div>
                              <div className="font-medium text-sm">{channel.name}</div>
                              {channel.description && (
                                <div className="text-xs text-gray-500 truncate">{channel.description}</div>
                              )}
                            </div>
                          </div>
                          {channel.unreadCount > 0 && (
                            <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                              {channel.unreadCount}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </TabsContent>

                  <TabsContent value="people" className="space-y-2 px-3 pb-3">
                    {onlineUsers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          const directChannel: ChatChannel = {
                            id: `direct_${member.id}`,
                            name: member.name,
                            type: 'direct',
                            description: `Direct message with ${member.name}`,
                            participants: [user?.id || '', member.id]
                          };
                          setSelectedChannel(directChannel);
                          setShowChatWidget(true);
                        }}
                        data-testid={`user-${member.id}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-teal-100 text-teal-800">
                                {formatUserName(member.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                          </div>
                          <div>
                            <div className="font-medium text-sm">{member.name}</div>
                            <div className="text-xs text-gray-500">@{member.username}</div>
                          </div>
                        </div>
                        {member.role === 'admin' && (
                          <Badge variant="secondary" className="text-xs">Admin</Badge>
                        )}
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {selectedChannel ? (
              <Card className="h-[600px]">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={cn("w-3 h-3 rounded-full", getChannelColor(selectedChannel.type))}></div>
                      <div>
                        <CardTitle className="text-lg">{selectedChannel.name}</CardTitle>
                        {selectedChannel.description && (
                          <CardDescription>{selectedChannel.description}</CardDescription>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {selectedChannel.participants.length} members
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="h-full p-0">
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                      <p className="text-sm">Click the chat button below to open the messaging widget</p>
                      <Button 
                        className="mt-4 bg-teal-600 hover:bg-teal-700"
                        onClick={() => setShowChatWidget(true)}
                        data-testid="button-open-chat"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Open Chat
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-[600px]">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Users className="h-24 w-24 mx-auto mb-6 text-gray-300" />
                    <h3 className="text-2xl font-semibold text-gray-700 mb-3">Welcome to Team Collaboration</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      Select a channel or team member from the sidebar to start collaborating in real-time.
                      Share ideas, discuss projects, and coordinate tasks seamlessly.
                    </p>
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                      <Card className="p-4 border-2 border-dashed border-gray-200 hover:border-teal-300 transition-colors cursor-pointer">
                        <Hash className="h-8 w-8 mx-auto mb-2 text-teal-600" />
                        <h4 className="font-semibold text-sm mb-1">Join Channels</h4>
                        <p className="text-xs text-gray-500">Participate in topic-based discussions</p>
                      </Card>
                      <Card className="p-4 border-2 border-dashed border-gray-200 hover:border-teal-300 transition-colors cursor-pointer">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2 text-teal-600" />
                        <h4 className="font-semibold text-sm mb-1">Direct Messages</h4>
                        <p className="text-xs text-gray-500">Have private conversations</p>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Team Activity Feed */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Recent Team Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { user: 'Sarah Johnson', action: 'commented on', target: 'Website Redesign Project', time: '5 minutes ago', type: 'comment' },
                { user: 'Mike Chen', action: 'completed task', target: 'Database Migration', time: '12 minutes ago', type: 'task' },
                { user: 'Alex Rivera', action: 'joined channel', target: '#marketing', time: '18 minutes ago', type: 'join' },
                { user: 'Lisa Wong', action: 'shared file', target: 'Project Requirements.pdf', time: '25 minutes ago', type: 'file' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-gray-100">
                      {formatUserName(activity.user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>
                      <span className="text-gray-600"> {activity.action} </span>
                      <span className="font-medium text-teal-600">{activity.target}</span>
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <Badge 
                    variant={activity.type === 'comment' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Widget */}
      {showChatWidget && selectedChannel && (
        <ChatWidget
          key={selectedChannel.id}
          channelId={selectedChannel.id}
          channelName={selectedChannel.name}
          projectId={selectedChannel.type === 'project' ? selectedChannel.id.replace('project_', '') : undefined}
          taskId={selectedChannel.type === 'task' ? selectedChannel.id.replace('task_', '') : undefined}
        />
      )}
    </div>
  );
}