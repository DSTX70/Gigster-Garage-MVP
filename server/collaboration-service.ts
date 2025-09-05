import WebSocket, { WebSocketServer } from 'ws';
import { storage } from './storage';
import type { Server } from 'http';

export interface ChatMessage {
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

export interface OnlineUser {
  userId: string;
  userName: string;
  socketId: string;
  lastSeen: Date;
  currentProject?: string;
}

export class CollaborationService {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocket> = new Map();
  private onlineUsers: Map<string, OnlineUser> = new Map();
  private channels: Map<string, Set<string>> = new Map(); // channelId -> userIds
  private messageStore: Map<string, ChatMessage[]> = new Map(); // channelId -> messages

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws/collaboration',
      perMessageDeflate: false
    });

    this.setupWebSocketServer();
    console.log('🚀 Collaboration service initialized with WebSocket support');
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws, req) => {
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const userId = url.searchParams.get('userId');
      const userName = url.searchParams.get('userName');

      if (!userId || !userName) {
        ws.close(1008, 'Missing user credentials');
        return;
      }

      const socketId = this.generateSocketId();
      this.clients.set(socketId, ws);

      // Add user to online users
      this.onlineUsers.set(userId, {
        userId,
        userName: decodeURIComponent(userName),
        socketId,
        lastSeen: new Date()
      });

      console.log(`👤 User ${userName} connected to collaboration service`);

      // Send welcome message
      this.sendToSocket(ws, {
        type: 'connection_established',
        data: {
          socketId,
          onlineUsers: Array.from(this.onlineUsers.values())
        }
      });

      // Broadcast user joined
      this.broadcastToAllExcept(socketId, {
        type: 'user_joined',
        data: {
          userId,
          userName: decodeURIComponent(userName)
        }
      });

      // Handle messages
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(socketId, userId, message);
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
          this.sendToSocket(ws, {
            type: 'error',
            data: { message: 'Invalid message format' }
          });
        }
      });

      // Handle disconnect
      ws.on('close', () => {
        this.handleDisconnect(socketId, userId);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.handleDisconnect(socketId, userId);
      });
    });
  }

  private async handleMessage(socketId: string, userId: string, message: any) {
    const user = this.onlineUsers.get(userId);
    if (!user) return;

    switch (message.type) {
      case 'join_channel':
        await this.handleJoinChannel(socketId, userId, message.data.channelId);
        break;

      case 'leave_channel':
        await this.handleLeaveChannel(socketId, userId, message.data.channelId);
        break;

      case 'send_message':
        await this.handleSendMessage(socketId, userId, message.data);
        break;

      case 'task_comment':
        await this.handleTaskComment(socketId, userId, message.data);
        break;

      case 'typing_start':
        await this.handleTypingStart(socketId, userId, message.data);
        break;

      case 'typing_stop':
        await this.handleTypingStop(socketId, userId, message.data);
        break;

      case 'user_status':
        await this.handleUserStatus(socketId, userId, message.data);
        break;

      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private async handleJoinChannel(socketId: string, userId: string, channelId: string) {
    if (!this.channels.has(channelId)) {
      this.channels.set(channelId, new Set());
    }

    this.channels.get(channelId)!.add(userId);

    // Send recent messages to the user
    const recentMessages = this.getRecentMessages(channelId, 50);
    const ws = this.clients.get(socketId);
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      this.sendToSocket(ws, {
        type: 'channel_messages',
        data: {
          channelId,
          messages: recentMessages
        }
      });
    }

    // Notify other users in the channel
    this.broadcastToChannel(channelId, {
      type: 'user_joined_channel',
      data: {
        userId,
        userName: this.onlineUsers.get(userId)?.userName,
        channelId
      }
    }, [userId]);

    console.log(`👤 User ${userId} joined channel ${channelId}`);
  }

  private async handleLeaveChannel(socketId: string, userId: string, channelId: string) {
    const channel = this.channels.get(channelId);
    if (channel) {
      channel.delete(userId);
      
      if (channel.size === 0) {
        this.channels.delete(channelId);
      }
    }

    // Notify other users in the channel
    this.broadcastToChannel(channelId, {
      type: 'user_left_channel',
      data: {
        userId,
        userName: this.onlineUsers.get(userId)?.userName,
        channelId
      }
    }, [userId]);

    console.log(`👤 User ${userId} left channel ${channelId}`);
  }

  private async handleSendMessage(socketId: string, userId: string, data: any) {
    const user = this.onlineUsers.get(userId);
    if (!user) return;

    const message: ChatMessage = {
      id: this.generateMessageId(),
      userId,
      userName: user.userName,
      content: data.content,
      type: data.type || 'text',
      timestamp: new Date(),
      channelId: data.channelId,
      projectId: data.projectId,
      taskId: data.taskId,
      metadata: data.metadata
    };

    // Store message
    this.storeMessage(data.channelId, message);

    // Broadcast message to channel
    this.broadcastToChannel(data.channelId, {
      type: 'new_message',
      data: message
    });

    console.log(`💬 Message sent by ${user.userName} to channel ${data.channelId}`);
  }

  private async handleTaskComment(socketId: string, userId: string, data: any) {
    const user = this.onlineUsers.get(userId);
    if (!user) return;

    const comment: ChatMessage = {
      id: this.generateMessageId(),
      userId,
      userName: user.userName,
      content: data.content,
      type: 'task_comment',
      timestamp: new Date(),
      taskId: data.taskId,
      metadata: data.metadata
    };

    // Store comment
    const channelId = `task_${data.taskId}`;
    this.storeMessage(channelId, comment);

    // Broadcast to task subscribers
    this.broadcastToChannel(channelId, {
      type: 'task_comment',
      data: comment
    });

    // Notify task assignee and creator
    try {
      const task = await storage.getTaskById(data.taskId);
      if (task) {
        const notifyUsers = new Set([task.assignedToId, task.createdById]);
        notifyUsers.delete(userId); // Don't notify the sender

        notifyUsers.forEach(targetUserId => {
          if (targetUserId) {
            this.sendNotificationToUser(targetUserId, {
              type: 'task_comment_notification',
              data: {
                taskId: data.taskId,
                taskTitle: task.title,
                commenterName: user.userName,
                comment: comment
              }
            });
          }
        });
      }
    } catch (error) {
      console.error('Error notifying task users:', error);
    }

    console.log(`💬 Task comment added by ${user.userName} to task ${data.taskId}`);
  }

  private async handleTypingStart(socketId: string, userId: string, data: any) {
    const user = this.onlineUsers.get(userId);
    if (!user) return;

    this.broadcastToChannel(data.channelId, {
      type: 'typing_start',
      data: {
        userId,
        userName: user.userName,
        channelId: data.channelId
      }
    }, [userId]);
  }

  private async handleTypingStop(socketId: string, userId: string, data: any) {
    this.broadcastToChannel(data.channelId, {
      type: 'typing_stop',
      data: {
        userId,
        channelId: data.channelId
      }
    }, [userId]);
  }

  private async handleUserStatus(socketId: string, userId: string, data: any) {
    const user = this.onlineUsers.get(userId);
    if (!user) return;

    // Update user status
    user.lastSeen = new Date();
    user.currentProject = data.currentProject;

    // Broadcast status update
    this.broadcastToAllExcept(socketId, {
      type: 'user_status_update',
      data: {
        userId,
        status: data.status,
        currentProject: data.currentProject
      }
    });
  }

  private handleDisconnect(socketId: string, userId: string) {
    this.clients.delete(socketId);

    const user = this.onlineUsers.get(userId);
    if (user) {
      user.lastSeen = new Date();
      
      // Remove from channels
      this.channels.forEach((users, channelId) => {
        if (users.has(userId)) {
          users.delete(userId);
          
          // Notify channel users
          this.broadcastToChannel(channelId, {
            type: 'user_left_channel',
            data: {
              userId,
              userName: user.userName,
              channelId
            }
          });
        }
      });

      this.onlineUsers.delete(userId);

      // Broadcast user left
      this.broadcastToAll({
        type: 'user_left',
        data: {
          userId,
          userName: user.userName
        }
      });

      console.log(`👤 User ${user.userName} disconnected from collaboration service`);
    }
  }

  // Message and data management
  private storeMessage(channelId: string, message: ChatMessage) {
    if (!this.messageStore.has(channelId)) {
      this.messageStore.set(channelId, []);
    }

    const messages = this.messageStore.get(channelId)!;
    messages.push(message);

    // Keep only last 1000 messages per channel
    if (messages.length > 1000) {
      messages.splice(0, messages.length - 1000);
    }
  }

  private getRecentMessages(channelId: string, limit: number = 50): ChatMessage[] {
    const messages = this.messageStore.get(channelId) || [];
    return messages.slice(-limit);
  }

  // Broadcasting methods
  private broadcastToAll(message: any) {
    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        this.sendToSocket(ws, message);
      }
    });
  }

  private broadcastToAllExcept(excludeSocketId: string, message: any) {
    this.clients.forEach((ws, socketId) => {
      if (socketId !== excludeSocketId && ws.readyState === WebSocket.OPEN) {
        this.sendToSocket(ws, message);
      }
    });
  }

  private broadcastToChannel(channelId: string, message: any, excludeUserIds: string[] = []) {
    const channelUsers = this.channels.get(channelId);
    if (!channelUsers) return;

    channelUsers.forEach(userId => {
      if (!excludeUserIds.includes(userId)) {
        this.sendNotificationToUser(userId, message);
      }
    });
  }

  private sendNotificationToUser(userId: string, message: any) {
    const user = this.onlineUsers.get(userId);
    if (user) {
      const ws = this.clients.get(user.socketId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        this.sendToSocket(ws, message);
      }
    }
  }

  private sendToSocket(ws: WebSocket, message: any) {
    try {
      ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
    }
  }

  // Utility methods
  private generateSocketId(): string {
    return `socket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public API methods
  public getOnlineUsers(): OnlineUser[] {
    return Array.from(this.onlineUsers.values());
  }

  public getChannelUsers(channelId: string): string[] {
    return Array.from(this.channels.get(channelId) || []);
  }

  public getChannelMessages(channelId: string, limit: number = 100): ChatMessage[] {
    return this.getRecentMessages(channelId, limit);
  }

  public getUserConnectionStatus(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  public broadcastSystemMessage(channelId: string, content: string, type: string = 'system') {
    const message: ChatMessage = {
      id: this.generateMessageId(),
      userId: 'system',
      userName: 'System',
      content,
      type: type as any,
      timestamp: new Date(),
      channelId
    };

    this.storeMessage(channelId, message);
    this.broadcastToChannel(channelId, {
      type: 'new_message',
      data: message
    });
  }
}

export let collaborationService: CollaborationService;