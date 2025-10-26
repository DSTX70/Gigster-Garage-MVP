import { AppCache } from './cache-service';
import { storage } from './storage';

/**
 * Cache Warming Service
 * Pre-populates cache with frequently accessed data
 */
export class CacheWarmingService {
  private cache = AppCache.getInstance();
  private isWarming = false;

  constructor() {
    console.log('🚀 Cache warming service initialized');
  }

  /**
   * Start cache warming process
   */
  public async startCacheWarming() {
    if (this.isWarming) {
      console.log('🚀 Cache warming already in progress');
      return;
    }

    this.isWarming = true;
    console.log('🚀 Starting cache warming...');

    try {
      await Promise.all([
        this.warmUserData(),
        this.warmProjectData(),
        this.warmTaskData(),
        this.warmTemplateData(),
        this.warmAnalyticsData()
      ]);

      console.log('✅ Cache warming completed successfully');
    } catch (error) {
      console.error('❌ Cache warming failed:', error);
    } finally {
      this.isWarming = false;
    }
  }

  /**
   * Warm user data cache
   */
  private async warmUserData() {
    try {
      const users = await storage.getUsers();
      await this.cache.set('users:all', users, 1800, ['user-data']); // 30 min
      
      // Cache individual users
      for (const user of users.slice(0, 10)) { // Limit to first 10 users
        await this.cache.set(`user:${user.id}`, user, 1800, ['user-data']);
      }
      
      console.log(`🚀 Warmed user cache: ${users.length} users`);
    } catch (error) {
      console.error('❌ Failed to warm user cache:', error);
    }
  }

  /**
   * Warm project data cache
   */
  private async warmProjectData() {
    try {
      const projects = await storage.getProjects();
      await this.cache.set('projects:all', projects, 3600, ['project-data']); // 1 hour
      
      // Cache individual projects
      for (const project of projects.slice(0, 20)) { // Limit to first 20 projects
        await this.cache.set(`project:${project.id}`, project, 3600, ['project-data']);
      }
      
      console.log(`🚀 Warmed project cache: ${projects.length} projects`);
    } catch (error) {
      console.error('❌ Failed to warm project cache:', error);
    }
  }

  /**
   * Warm task data cache
   */
  private async warmTaskData() {
    try {
      const tasks = await storage.getTasks();
      await this.cache.set('tasks:all', tasks, 900, ['task-data']); // 15 min
      
      // Cache recent tasks (more likely to be accessed)
      const recentTasks = tasks
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 50); // Top 50 recent tasks
      
      for (const task of recentTasks) {
        await this.cache.set(`task:${task.id}`, task, 900, ['task-data']);
      }
      
      // Cache active tasks
      const activeTasks = tasks.filter(t => !t.completed);
      await this.cache.set('tasks:active', activeTasks, 600, ['task-data']); // 10 min
      
      console.log(`🚀 Warmed task cache: ${tasks.length} total, ${recentTasks.length} recent, ${activeTasks.length} active`);
    } catch (error) {
      console.error('❌ Failed to warm task cache:', error);
    }
  }

  /**
   * Warm template data cache
   */
  private async warmTemplateData() {
    try {
      const templates = await storage.getTemplates();
      await this.cache.set('templates:all', templates, 7200, ['template-data']); // 2 hours
      
      // Cache templates by type
      const templatesByType = templates.reduce((acc, template) => {
        if (!acc[template.type]) acc[template.type] = [];
        acc[template.type].push(template);
        return acc;
      }, {} as Record<string, any[]>);
      
      for (const [type, typeTemplates] of Object.entries(templatesByType)) {
        await this.cache.set(`templates:type:${type}`, typeTemplates, 7200, ['template-data']);
      }
      
      console.log(`🚀 Warmed template cache: ${templates.length} templates, ${Object.keys(templatesByType).length} types`);
    } catch (error) {
      console.error('❌ Failed to warm template cache:', error);
    }
  }

  /**
   * Warm analytics data cache
   */
  private async warmAnalyticsData() {
    try {
      // Get productivity stats
      try {
        const timeLogs = await storage.getTimeLogs();
        const productivityStats = this.calculateProductivityStats(timeLogs);
        await this.cache.set('analytics:productivity', productivityStats, 3600, ['analytics']);
        console.log('🚀 Warmed productivity analytics cache');
      } catch (error) {
        console.log('⚠️ Productivity analytics warming skipped (data not available)');
      }

      // Cache dashboard stats
      try {
        const tasks = await storage.getTasks();
        const projects = await storage.getProjects();
        const dashboardStats = {
          totalTasks: tasks.length,
          completedTasks: tasks.filter(t => t.completed).length,
          activeTasks: tasks.filter(t => !t.completed).length,
          totalProjects: projects.length,
          highPriorityTasks: tasks.filter(t => t.priority === 'high').length,
          overdueTasks: tasks.filter(t => {
            if (!t.dueDate || t.completed) return false;
            return new Date(t.dueDate) < new Date();
          }).length
        };
        await this.cache.set('analytics:dashboard', dashboardStats, 1800, ['analytics']);
        console.log('🚀 Warmed dashboard analytics cache');
      } catch (error) {
        console.error('❌ Failed to warm dashboard analytics:', error);
      }

    } catch (error) {
      console.error('❌ Failed to warm analytics cache:', error);
    }
  }

  /**
   * Calculate productivity statistics
   */
  private calculateProductivityStats(timeLogs: any[]) {
    const totalHours = timeLogs.reduce((sum, log) => {
      if (log.endTime) {
        const duration = (new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) / (1000 * 60 * 60);
        return sum + duration;
      }
      return sum;
    }, 0);

    const activeDays = new Set(
      timeLogs
        .filter(log => log.endTime)
        .map(log => new Date(log.startTime).toDateString())
    ).size;

    return {
      totalHours: Math.round(totalHours * 100) / 100,
      averageDailyHours: activeDays > 0 ? Math.round((totalHours / activeDays) * 100) / 100 : 0,
      totalSessions: timeLogs.length,
      activeDays,
      lastUpdated: new Date()
    };
  }

  /**
   * Schedule regular cache warming
   */
  public scheduleCacheWarming() {
    // Warm cache every 30 minutes
    setInterval(() => {
      this.startCacheWarming();
    }, 30 * 60 * 1000);

    console.log('🚀 Scheduled cache warming every 30 minutes');
  }

  /**
   * Invalidate related caches when data changes
   */
  public async invalidateRelatedCaches(dataType: string, entityId?: string) {
    try {
      switch (dataType) {
        case 'user':
          await this.cache.delByTags(['user-data']);
          if (entityId) await this.cache.del(`user:${entityId}`);
          break;
        case 'project':
          await this.cache.delByTags(['project-data']);
          if (entityId) await this.cache.del(`project:${entityId}`);
          break;
        case 'task':
          await this.cache.delByTags(['task-data']);
          if (entityId) await this.cache.del(`task:${entityId}`);
          // Also invalidate dashboard stats when tasks change
          await this.cache.del('analytics:dashboard');
          break;
        case 'template':
          await this.cache.delByTags(['template-data']);
          break;
        case 'analytics':
          await this.cache.delByTags(['analytics']);
          break;
      }
      console.log(`🚀 Invalidated ${dataType} caches`);
    } catch (error) {
      console.error(`❌ Failed to invalidate ${dataType} caches:`, error);
    }
  }
}

// Singleton instance
export const cacheWarmingService = new CacheWarmingService();