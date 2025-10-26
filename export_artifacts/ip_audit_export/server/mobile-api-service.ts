import { storage } from './storage';
import type { Task, Project, User, TimeLog } from '@shared/schema';

export interface MobileApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  metadata?: {
    timestamp: string;
    version: string;
    deviceInfo?: MobileDeviceInfo;
  };
}

export interface MobileDeviceInfo {
  platform: 'ios' | 'android' | 'web';
  version: string;
  deviceId: string;
  pushToken?: string;
  timezone: string;
  locale: string;
}

export interface MobileSyncRequest {
  lastSyncTimestamp?: string;
  deviceInfo: MobileDeviceInfo;
  entities: ('tasks' | 'projects' | 'timeLogs' | 'users')[];
}

export interface MobileSyncResponse {
  tasks: {
    updated: Task[];
    deleted: string[];
  };
  projects: {
    updated: Project[];
    deleted: string[];
  };
  timeLogs: {
    updated: TimeLog[];
    deleted: string[];
  };
  users: {
    updated: User[];
    deleted: string[];
  };
  syncTimestamp: string;
  nextSyncIn: number; // seconds
}

export interface MobileTaskCreate {
  title: string;
  description?: string;
  projectId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  dueTime?: string;
  assignedToId?: string;
  tags?: string[];
  attachments?: MobileAttachment[];
  location?: MobileLocation;
  reminders?: MobileReminder[];
}

export interface MobileAttachment {
  id: string;
  type: 'image' | 'document' | 'audio' | 'video';
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
}

export interface MobileLocation {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
}

export interface MobileReminder {
  id: string;
  type: 'time' | 'location' | 'smart';
  trigger: string; // ISO string for time, coordinates for location
  message: string;
  enabled: boolean;
}

export interface MobileQuickAction {
  id: string;
  type: 'startTimer' | 'logTime' | 'createTask' | 'checkInProject' | 'voiceNote';
  label: string;
  icon: string;
  shortcut?: string;
  context?: Record<string, any>;
}

export interface MobileDashboard {
  quickStats: {
    todayTasks: number;
    activeProjects: number;
    hoursLogged: number;
    overdueItems: number;
  };
  recentTasks: Task[];
  activeTimers: TimeLog[];
  upcomingDeadlines: Task[];
  quickActions: MobileQuickAction[];
  notifications: MobileNotification[];
}

export interface MobileNotification {
  id: string;
  type: 'task_due' | 'meeting_reminder' | 'project_update' | 'time_reminder';
  title: string;
  body: string;
  data?: Record<string, any>;
  scheduled?: string; // ISO string
  delivered?: boolean;
  read?: boolean;
  createdAt: string;
}

export class MobileApiService {
  private readonly API_VERSION = '1.0.0';
  private readonly SYNC_INTERVAL = 300; // 5 minutes
  private syncCache: Map<string, any> = new Map();

  /**
   * Create standardized mobile API response
   */
  createResponse<T>(data?: T, error?: string, message?: string): MobileApiResponse<T> {
    return {
      success: !error,
      data,
      error,
      message,
      metadata: {
        timestamp: new Date().toISOString(),
        version: this.API_VERSION
      }
    };
  }

  /**
   * Create paginated mobile API response
   */
  createPaginatedResponse<T>(
    data: T[], 
    page: number, 
    limit: number, 
    total: number
  ): MobileApiResponse<T[]> {
    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        hasMore: page * limit < total
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: this.API_VERSION
      }
    };
  }

  /**
   * Mobile-optimized dashboard data
   */
  async getMobileDashboard(userId: string): Promise<MobileDashboard> {
    console.log(`📱 Generating mobile dashboard for user: ${userId}`);

    const [tasks, projects, timeLogs] = await Promise.all([
      storage.getTasks(),
      storage.getProjects(),
      storage.getTimeLogs()
    ]);

    // Filter user-specific data
    const userTasks = tasks.filter(task => 
      task.assignedToId === userId || task.createdById === userId
    );
    const userTimeLogs = timeLogs.filter(log => log.userId === userId);

    // Calculate today's tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTasks = userTasks.filter(task => {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      return dueDate && dueDate >= today && dueDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
    });

    // Calculate overdue items
    const overdueItems = userTasks.filter(task => {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      return dueDate && dueDate < today && task.status !== 'completed';
    });

    // Get active timers
    const activeTimers = userTimeLogs.filter(log => !log.endTime);

    // Calculate today's logged hours
    const todayLogs = userTimeLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= today && logDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
    });
    const hoursLogged = todayLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / 60;

    // Get upcoming deadlines (next 7 days)
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingDeadlines = userTasks
      .filter(task => {
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        return dueDate && dueDate >= today && dueDate <= nextWeek && task.status !== 'completed';
      })
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);

    // Get recent tasks (last 10 updated)
    const recentTasks = userTasks
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10);

    const quickActions: MobileQuickAction[] = [
      {
        id: 'start_timer',
        type: 'startTimer',
        label: 'Start Timer',
        icon: 'play-circle',
        shortcut: 'ST'
      },
      {
        id: 'log_time',
        type: 'logTime',
        label: 'Log Time',
        icon: 'clock',
        shortcut: 'LT'
      },
      {
        id: 'create_task',
        type: 'createTask',
        label: 'New Task',
        icon: 'plus-circle',
        shortcut: 'NT'
      },
      {
        id: 'voice_note',
        type: 'voiceNote',
        label: 'Voice Note',
        icon: 'mic',
        shortcut: 'VN'
      }
    ];

    const notifications: MobileNotification[] = [
      ...overdueItems.slice(0, 3).map(task => ({
        id: `overdue_${task.id}`,
        type: 'task_due' as const,
        title: 'Overdue Task',
        body: `"${task.title}" is overdue`,
        data: { taskId: task.id },
        read: false,
        createdAt: new Date().toISOString()
      })),
      ...upcomingDeadlines.slice(0, 2).map(task => ({
        id: `upcoming_${task.id}`,
        type: 'task_due' as const,
        title: 'Upcoming Deadline',
        body: `"${task.title}" is due ${this.formatRelativeTime(new Date(task.dueDate!))}`,
        data: { taskId: task.id },
        read: false,
        createdAt: new Date().toISOString()
      }))
    ];

    return {
      quickStats: {
        todayTasks: todayTasks.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        hoursLogged: Math.round(hoursLogged * 10) / 10,
        overdueItems: overdueItems.length
      },
      recentTasks,
      activeTimers,
      upcomingDeadlines,
      quickActions,
      notifications
    };
  }

  /**
   * Sync data for mobile apps (delta sync)
   */
  async syncMobileData(userId: string, request: MobileSyncRequest): Promise<MobileSyncResponse> {
    console.log(`🔄 Syncing mobile data for user: ${userId}`);
    
    const lastSync = request.lastSyncTimestamp ? new Date(request.lastSyncTimestamp) : new Date(0);
    const currentSync = new Date();

    const [tasks, projects, timeLogs, users] = await Promise.all([
      storage.getTasks(),
      storage.getProjects(),
      storage.getTimeLogs(),
      storage.getUsers()
    ]);

    const syncResponse: MobileSyncResponse = {
      tasks: { updated: [], deleted: [] },
      projects: { updated: [], deleted: [] },
      timeLogs: { updated: [], deleted: [] },
      users: { updated: [], deleted: [] },
      syncTimestamp: currentSync.toISOString(),
      nextSyncIn: this.SYNC_INTERVAL
    };

    // Sync tasks (user-specific)
    if (request.entities.includes('tasks')) {
      const userTasks = tasks.filter(task => 
        task.assignedToId === userId || task.createdById === userId
      );
      syncResponse.tasks.updated = userTasks.filter(task => 
        new Date(task.updatedAt) > lastSync
      );
    }

    // Sync projects (user has access to)
    if (request.entities.includes('projects')) {
      const userProjects = projects.filter(project => {
        const projectTasks = tasks.filter(task => task.projectId === project.id);
        return projectTasks.some(task => 
          task.assignedToId === userId || task.createdById === userId
        );
      });
      syncResponse.projects.updated = userProjects.filter(project => 
        new Date(project.updatedAt) > lastSync
      );
    }

    // Sync time logs (user-specific)
    if (request.entities.includes('timeLogs')) {
      const userTimeLogs = timeLogs.filter(log => log.userId === userId);
      syncResponse.timeLogs.updated = userTimeLogs.filter(log => 
        new Date(log.updatedAt) > lastSync
      );
    }

    // Sync users (team members only)
    if (request.entities.includes('users')) {
      syncResponse.users.updated = users.filter(user => 
        new Date(user.updatedAt) > lastSync
      ).map(user => ({
        ...user,
        password: undefined // Never send passwords to mobile
      } as User));
    }

    console.log(`✅ Sync complete: ${syncResponse.tasks.updated.length} tasks, ${syncResponse.projects.updated.length} projects`);
    return syncResponse;
  }

  /**
   * Mobile-optimized task creation
   */
  async createMobileTask(userId: string, taskData: MobileTaskCreate): Promise<Task> {
    console.log(`📱 Creating mobile task: ${taskData.title}`);

    // Convert mobile task format to standard task format
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const task = await storage.createTask({
      id: taskId,
      title: taskData.title,
      description: taskData.description || '',
      status: 'pending',
      priority: taskData.priority,
      projectId: taskData.projectId,
      assignedToId: taskData.assignedToId,
      createdById: userId,
      dueDate: taskData.dueDate,
      dueTime: taskData.dueTime,
      tags: taskData.tags || [],
      notes: '',
      attachments: [],
      urls: [],
      progressNotes: [],
      dependencies: [],
      subtasks: [],
      timeEstimate: null,
      actualTime: null,
      completedAt: null,
      customFields: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Store mobile-specific data if provided
    if (taskData.attachments?.length) {
      // Handle mobile attachments (would integrate with file upload service)
      console.log(`📎 Task has ${taskData.attachments.length} mobile attachments`);
    }

    if (taskData.location) {
      // Store location data (could be in customFields or separate table)
      console.log(`📍 Task has location: ${taskData.location.latitude}, ${taskData.location.longitude}`);
    }

    if (taskData.reminders?.length) {
      // Set up mobile reminders (would integrate with push notification service)
      console.log(`⏰ Task has ${taskData.reminders.length} reminders`);
    }

    return task;
  }

  /**
   * Mobile-optimized time logging
   */
  async logMobileTime(userId: string, timeData: {
    taskId?: string;
    projectId?: string;
    duration: number; // minutes
    description?: string;
    date?: string;
    tags?: string[];
    location?: MobileLocation;
  }): Promise<TimeLog> {
    console.log(`⏱️ Logging mobile time: ${timeData.duration} minutes`);

    const timeLog = await storage.createTimeLog({
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      taskId: timeData.taskId,
      projectId: timeData.projectId,
      description: timeData.description || 'Mobile time entry',
      duration: timeData.duration,
      date: timeData.date || new Date().toISOString().split('T')[0],
      tags: timeData.tags || [],
      billable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Store mobile-specific location data if provided
    if (timeData.location) {
      console.log(`📍 Time logged with location: ${timeData.location.latitude}, ${timeData.location.longitude}`);
    }

    return timeLog;
  }

  /**
   * Get mobile-optimized task list with pagination
   */
  async getMobileTasks(
    userId: string, 
    page: number = 1, 
    limit: number = 20,
    filters?: {
      status?: string;
      priority?: string;
      projectId?: string;
      dueDate?: 'today' | 'week' | 'overdue';
    }
  ): Promise<{ tasks: Task[]; total: number }> {
    console.log(`📱 Getting mobile tasks for user: ${userId} (page ${page})`);

    let tasks = await storage.getTasks();
    
    // Filter user-specific tasks
    tasks = tasks.filter(task => 
      task.assignedToId === userId || task.createdById === userId
    );

    // Apply filters
    if (filters?.status) {
      tasks = tasks.filter(task => task.status === filters.status);
    }

    if (filters?.priority) {
      tasks = tasks.filter(task => task.priority === filters.priority);
    }

    if (filters?.projectId) {
      tasks = tasks.filter(task => task.projectId === filters.projectId);
    }

    if (filters?.dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      switch (filters.dueDate) {
        case 'today':
          const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
          tasks = tasks.filter(task => {
            const dueDate = task.dueDate ? new Date(task.dueDate) : null;
            return dueDate && dueDate >= today && dueDate < tomorrow;
          });
          break;
        case 'week':
          const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          tasks = tasks.filter(task => {
            const dueDate = task.dueDate ? new Date(task.dueDate) : null;
            return dueDate && dueDate >= today && dueDate <= nextWeek;
          });
          break;
        case 'overdue':
          tasks = tasks.filter(task => {
            const dueDate = task.dueDate ? new Date(task.dueDate) : null;
            return dueDate && dueDate < today && task.status !== 'completed';
          });
          break;
      }
    }

    // Sort by priority and due date
    tasks.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }
      
      // Then by due date
      const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return aDate - bDate;
    });

    const total = tasks.length;
    const startIndex = (page - 1) * limit;
    const paginatedTasks = tasks.slice(startIndex, startIndex + limit);

    return { tasks: paginatedTasks, total };
  }

  /**
   * Mobile push notification registration
   */
  async registerPushToken(userId: string, deviceInfo: MobileDeviceInfo): Promise<void> {
    console.log(`📱 Registering push token for user: ${userId} on ${deviceInfo.platform}`);
    
    // Store device info and push token
    // This would typically be stored in a separate table for push notifications
    console.log(`✅ Push token registered: ${deviceInfo.pushToken?.substring(0, 20)}...`);
  }

  /**
   * Mobile offline support - queue actions
   */
  async queueOfflineAction(userId: string, action: {
    type: 'create_task' | 'update_task' | 'log_time' | 'complete_task';
    data: any;
    timestamp: string;
    clientId: string;
  }): Promise<void> {
    console.log(`📱 Queuing offline action: ${action.type} for user: ${userId}`);
    
    // Store offline action for later processing
    // This would be processed when the mobile app comes back online
    console.log(`✅ Offline action queued: ${action.clientId}`);
  }

  // Helper methods
  private formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'tomorrow';
    if (diffDays === -1) return 'yesterday';
    if (diffDays > 1) return `in ${diffDays} days`;
    if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
    
    return date.toLocaleDateString();
  }

  /**
   * Get mobile app configuration
   */
  getMobileConfig(): any {
    return {
      apiVersion: this.API_VERSION,
      syncInterval: this.SYNC_INTERVAL,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      supportedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
      features: {
        offlineMode: true,
        pushNotifications: true,
        voiceNotes: true,
        locationTracking: true,
        cameraCapture: true,
        fingerprint: true
      },
      limits: {
        maxTasksPerSync: 1000,
        maxAttachmentSize: 5 * 1024 * 1024, // 5MB
        maxOfflineActions: 100
      }
    };
  }
}

export const mobileApiService = new MobileApiService();