import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Mail, MailOpen, Reply, Trash2, ArrowLeft, Paperclip, Send, X, FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  from: string;
  to?: string;
  subject: string;
  content: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  attachments?: Attachment[];
}

interface Attachment {
  id: string;
  filename: string;
  size: number;
  type: string;
  url: string;
}

interface ComposeData {
  to: string;
  subject: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  attachments: Attachment[];
}

export function MessagesPage() {
  const { toast } = useToast();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeData, setComposeData] = useState<ComposeData>({
    to: '',
    subject: '',
    content: '',
    priority: 'medium',
    attachments: []
  });

  // Mock messages for now - this would come from an API
  const mockMessages: Message[] = [
    {
      id: '1',
      from: 'System',
      subject: 'Welcome to Gigster Garage',
      content: 'Welcome to your new task management dashboard! Start by creating your first project and task.',
      timestamp: new Date(),
      read: false,
      priority: 'medium',
      attachments: []
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

  const handleSendMessage = useMutation({
    mutationFn: (data: ComposeData) => apiRequest("POST", "/api/messages", data),
    onSuccess: () => {
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
      setIsComposeOpen(false);
      setComposeData({
        to: '',
        subject: '',
        content: '',
        priority: 'medium',
        attachments: []
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    },
  });

  const handleAttachFile = (file: Attachment) => {
    setComposeData(prev => ({
      ...prev,
      attachments: [...prev.attachments, file]
    }));
  };

  const removeAttachment = (attachmentId: string) => {
    setComposeData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.id !== attachmentId)
    }));
  };

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    // Mark as read
    message.read = true;
  };

  const handleComposeSubmit = () => {
    if (!composeData.to || !composeData.subject || !composeData.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    handleSendMessage.mutate(composeData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" data-testid="button-back-to-home">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600 mt-2">
                {unreadCount > 0 
                  ? `You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`
                  : 'All messages read'
                }
              </p>
            </div>
          </div>
          
          <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2" data-testid="button-compose">
                <Mail size={16} />
                <span>Compose</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Compose Message</DialogTitle>
                <DialogDescription>
                  Send a new message with optional file attachments.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="to">To *</Label>
                  <Input
                    id="to"
                    placeholder="Enter recipient email or name"
                    value={composeData.to}
                    onChange={(e) => setComposeData(prev => ({ ...prev, to: e.target.value }))}
                    data-testid="input-message-to"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="Enter message subject"
                    value={composeData.subject}
                    onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                    data-testid="input-message-subject"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={composeData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setComposeData(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger data-testid="select-message-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Attachments</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        // Mock file attachment - in real app this would open file picker
                        const mockFile: Attachment = {
                          id: Date.now().toString(),
                          filename: 'document.pdf',
                          size: 1024 * 250, // 250KB
                          type: 'application/pdf',
                          url: '#'
                        };
                        handleAttachFile(mockFile);
                      }}
                      data-testid="button-attach-file"
                    >
                      <Paperclip className="h-4 w-4 mr-2" />
                      Attach File
                    </Button>
                  </div>
                </div>
                
                {composeData.attachments.length > 0 && (
                  <div className="space-y-2">
                    <Label>Attachments ({composeData.attachments.length})</Label>
                    <div className="space-y-2">
                      {composeData.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">{attachment.filename}</span>
                            <span className="text-xs text-gray-500">({(attachment.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(attachment.id)}
                            className="text-red-500 hover:text-red-700"
                            data-testid={`button-remove-attachment-${attachment.id}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="content">Message *</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter your message..."
                    rows={6}
                    value={composeData.content}
                    onChange={(e) => setComposeData(prev => ({ ...prev, content: e.target.value }))}
                    data-testid="textarea-message-content"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsComposeOpen(false)} data-testid="button-cancel-compose">
                  Cancel
                </Button>
                <Button onClick={handleComposeSubmit} disabled={handleSendMessage.isPending} data-testid="button-send-message">
                  {handleSendMessage.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send Message
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
              <Card 
                key={message.id} 
                className={`transition-colors hover:bg-gray-50 cursor-pointer ${!message.read ? 'border-blue-200 bg-blue-50/30' : ''}`}
                onClick={() => handleMessageClick(message)}
                data-testid={`card-message-${message.id}`}
              >
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
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center space-x-2 mb-2">
                        <Paperclip className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{message.attachments.length} attachment{message.attachments.length > 1 ? 's' : ''}</span>
                      </div>
                      <div className="space-y-2">
                        {message.attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium">{attachment.filename}</span>
                              <span className="text-xs text-gray-500">({(attachment.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              data-testid={`button-download-${attachment.id}`}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        {/* Message Detail Dialog */}
        {selectedMessage && (
          <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <span>{selectedMessage.subject}</span>
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(selectedMessage.priority)}`} />
                </DialogTitle>
                <DialogDescription>
                  From: {selectedMessage.from} • {format(selectedMessage.timestamp, 'MMM d, yyyy h:mm a')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Separator />
                <div className="max-h-96 overflow-y-auto">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.content}
                  </p>
                </div>
                
                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                  <div className="space-y-2">
                    <Separator />
                    <div className="flex items-center space-x-2">
                      <Paperclip className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">{selectedMessage.attachments.length} attachment{selectedMessage.attachments.length > 1 ? 's' : ''}</span>
                    </div>
                    <div className="space-y-2">
                      {selectedMessage.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium">{attachment.filename}</p>
                              <p className="text-xs text-gray-500">{attachment.type} • {(attachment.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" data-testid={`button-download-detail-${attachment.id}`}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedMessage(null)} data-testid="button-close-message">
                  Close
                </Button>
                <Button variant="outline" data-testid="button-reply-message">
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}