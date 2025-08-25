import { eq, and, or, desc, gte, lte, isNull } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users, tasks, projects, taskDependencies, templates, proposals, clients, invoices, payments, timeLogs } from "@shared/schema";
import type { User, InsertUser, Task, InsertTask, Project, InsertProject, TaskDependency, InsertTaskDependency, Template, InsertTemplate, Proposal, InsertProposal, Client, InsertClient, Invoice, InsertInvoice, Payment, InsertPayment, TimeLog, InsertTimeLog, UpdateTask, UpdateTemplate, UpdateProposal, UpdateTimeLog, TaskWithRelations, TemplateWithRelations, ProposalWithRelations, TimeLogWithRelations } from "@shared/schema";

export interface IStorage {
  // User management
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUserOnboarding(userId: string, onboardingData: {
    notificationEmail?: string;
    phone?: string;
    emailOptIn: boolean;
    smsOptIn: boolean;
  }): Promise<User>;
  deleteUser(id: string): Promise<boolean>;
  verifyPassword(user: User, password: string): Promise<boolean>;

  // Project management
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(insertProject: InsertProject): Promise<Project>;
  getOrCreateProject(name: string): Promise<Project>;
  updateProject(id: string, updateData: Partial<InsertProject>): Promise<Project | undefined>;

  // Task management
  getTasks(userId?: string): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  getTasksByProject(projectId: string, userId?: string | null): Promise<Task[]>;
  getSubtasks(parentTaskId: string): Promise<Task[]>;
  createTask(insertTask: InsertTask, createdById: string): Promise<Task>;
  updateTask(id: string, updateTask: UpdateTask): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
  getTasksWithSubtasks(userId?: string): Promise<Task[]>;

  // Task dependency management
  createTaskDependency(dependency: InsertTaskDependency): Promise<TaskDependency>;
  deleteTaskDependency(id: string): Promise<boolean>;
  wouldCreateCircularDependency(taskId: string, dependsOnTaskId: string): Promise<boolean>;

  // Time log management
  getTimeLogs(userId?: string, projectId?: string): Promise<TimeLog[]>;
  getTimeLog(id: string): Promise<TimeLog | undefined>;
  getActiveTimeLog(userId: string): Promise<TimeLog | undefined>;
  createTimeLog(insertTimeLog: InsertTimeLog): Promise<TimeLog>;
  updateTimeLog(id: string, updateTimeLog: UpdateTimeLog): Promise<TimeLog | undefined>;
  deleteTimeLog(id: string): Promise<boolean>;
  stopActiveTimer(userId: string): Promise<TimeLog | undefined>;
  getUserProductivityStats(userId: string, days: number): Promise<{
    totalHours: number;
    averageDailyHours: number;
    streakDays: number;
    utilizationPercent: number;
  }>;
  getDailyTimeLogs(userId: string, date: Date): Promise<TimeLog[]>;

  // Template management
  getTemplates(type?: string, userId?: string): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  createTemplate(insertTemplate: InsertTemplate): Promise<Template>;
  updateTemplate(id: string, updateTemplate: UpdateTemplate): Promise<Template | undefined>;
  deleteTemplate(id: string): Promise<boolean>;

  // Proposal management
  getProposals(userId?: string): Promise<Proposal[]>;
  getProposal(id: string): Promise<Proposal | undefined>;
  getProposalByShareableLink(shareableLink: string): Promise<Proposal | undefined>;
  createProposal(insertProposal: InsertProposal): Promise<Proposal>;
  updateProposal(id: string, updateProposal: UpdateProposal): Promise<Proposal | undefined>;
  deleteProposal(id: string): Promise<boolean>;
  generateShareableLink(proposalId: string): Promise<string>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async updateUserOnboarding(userId: string, onboardingData: {
    notificationEmail: string;
    phone?: string;
    emailOptIn: boolean;
    smsOptIn: boolean;
  }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        notificationEmail: onboardingData.notificationEmail,
        phone: onboardingData.phone || null,
        emailOptIn: onboardingData.emailOptIn,
        smsOptIn: onboardingData.smsOptIn,
        hasCompletedOnboarding: true,
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password);
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(projects.name);
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async getOrCreateProject(name: string): Promise<Project> {
    // First try to find existing project
    const [existing] = await db.select().from(projects).where(eq(projects.name, name));
    if (existing) {
      return existing;
    }

    // Create new project if not found
    return await this.createProject({ name });
  }

  async updateProject(id: string, updateData: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  // Task operations
  async getTasks(userId?: string): Promise<Task[]> {
    const query = db
      .select({
        id: tasks.id,
        description: tasks.description,
        completed: tasks.completed,
        dueDate: tasks.dueDate,
        priority: tasks.priority,
        status: tasks.status,
        assignedToId: tasks.assignedToId,
        createdById: tasks.createdById,
        projectId: tasks.projectId,
        parentTaskId: tasks.parentTaskId,
        notes: tasks.notes,
        attachments: tasks.attachments,
        links: tasks.links,
        progressNotes: tasks.progressNotes,
        createdAt: tasks.createdAt,
        assignedTo: users,
        project: projects,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assignedToId, users.id))
      .leftJoin(projects, eq(tasks.projectId, projects.id));

    // If userId is provided, filter tasks to only those assigned to the user
    if (userId) {
      const results = await query.where(eq(tasks.assignedToId, userId));
      return results.map(row => ({
        ...row,
        assignedTo: row.assignedTo || undefined,
        project: row.project || undefined,
      }));
    } else {
      // Admin can see all tasks
      const results = await query;
      return results.map(row => ({
        ...row,
        assignedTo: row.assignedTo || undefined,
        project: row.project || undefined,
      }));
    }
  }

  async getTask(id: string): Promise<Task | undefined> {
    const [result] = await db
      .select({
        id: tasks.id,
        description: tasks.description,
        completed: tasks.completed,
        dueDate: tasks.dueDate,
        priority: tasks.priority,
        status: tasks.status,
        assignedToId: tasks.assignedToId,
        createdById: tasks.createdById,
        projectId: tasks.projectId,
        parentTaskId: tasks.parentTaskId,
        notes: tasks.notes,
        attachments: tasks.attachments,
        links: tasks.links,
        progressNotes: tasks.progressNotes,
        createdAt: tasks.createdAt,
        assignedTo: users,
        project: projects,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assignedToId, users.id))
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .where(eq(tasks.id, id));

    if (!result) return undefined;

    return {
      ...result,
      assignedTo: result.assignedTo || undefined,
      project: result.project || undefined,
    };
  }

  async createTask(insertTask: InsertTask, createdById: string): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values({
        ...insertTask,
        createdById,
        assignedToId: insertTask.assignedToId || null,
        projectId: insertTask.projectId || null,
        dueDate: insertTask.dueDate || null,
        notes: insertTask.notes || null,
        attachments: insertTask.attachments || [],
        links: insertTask.links || [],
        progressNotes: insertTask.progressNotes || [],
      })
      .returning();

    return await this.getTask(task.id) as Task;
  }

  async updateTask(id: string, updateTask: UpdateTask): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set(updateTask)
      .where(eq(tasks.id, id))
      .returning();

    if (!task) return undefined;
    return await this.getTask(task.id);
  }

  async deleteTask(id: string): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getTasksByProject(projectId: string, userId?: string | null): Promise<Task[]> {
    let query = db
      .select({
        id: tasks.id,
        description: tasks.description,
        completed: tasks.completed,
        dueDate: tasks.dueDate,
        priority: tasks.priority,
        status: tasks.status,
        assignedToId: tasks.assignedToId,
        createdById: tasks.createdById,
        projectId: tasks.projectId,
        parentTaskId: tasks.parentTaskId,
        notes: tasks.notes,
        attachments: tasks.attachments,
        links: tasks.links,
        progressNotes: tasks.progressNotes,
        createdAt: tasks.createdAt,
        assignedTo: users,
        project: projects,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assignedToId, users.id))
      .leftJoin(projects, eq(tasks.projectId, projects.id));

    if (userId) {
      const results = await query.where(and(eq(tasks.projectId, projectId), eq(tasks.assignedToId, userId)));
      return results.map((row: any) => ({
        ...row,
        assignedTo: row.assignedTo || undefined,
        project: row.project || undefined,
      }));
    } else {
      const results = await query.where(eq(tasks.projectId, projectId));
      return results.map((row: any) => ({
        ...row,
        assignedTo: row.assignedTo || undefined,
        project: row.project || undefined,
      }));
    }
  }

  async getSubtasks(parentTaskId: string): Promise<Task[]> {
    const results = await db
      .select({
        id: tasks.id,
        description: tasks.description,
        completed: tasks.completed,
        dueDate: tasks.dueDate,
        priority: tasks.priority,
        status: tasks.status,
        assignedToId: tasks.assignedToId,
        createdById: tasks.createdById,
        projectId: tasks.projectId,
        parentTaskId: tasks.parentTaskId,
        notes: tasks.notes,
        attachments: tasks.attachments,
        links: tasks.links,
        progressNotes: tasks.progressNotes,
        createdAt: tasks.createdAt,
        assignedTo: users,
        project: projects,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assignedToId, users.id))
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .where(eq(tasks.parentTaskId, parentTaskId));

    return results.map((row: any) => ({
      ...row,
      assignedTo: row.assignedTo || undefined,
      project: row.project || undefined,
    }));
  }

  async getTasksWithSubtasks(userId?: string): Promise<Task[]> {
    // Get all tasks for the user
    const allTasks = await this.getTasks(userId);
    
    // Group tasks by parent-child relationships
    const taskMap = new Map<string, Task>();
    const parentTasks: Task[] = [];
    
    // First pass: create task map and identify parent tasks
    for (const task of allTasks) {
      taskMap.set(task.id, { ...task, subtasks: [] });
      if (!task.parentTaskId) {
        parentTasks.push(taskMap.get(task.id)!);
      }
    }
    
    // Second pass: attach subtasks to their parents
    for (const task of allTasks) {
      if (task.parentTaskId && taskMap.has(task.parentTaskId)) {
        const parent = taskMap.get(task.parentTaskId)!;
        const child = taskMap.get(task.id)!;
        parent.subtasks = parent.subtasks || [];
        parent.subtasks.push(child);
      }
    }
    
    return parentTasks;
  }

  // Task dependency operations
  async createTaskDependency(dependency: InsertTaskDependency): Promise<TaskDependency> {
    const [taskDependency] = await db
      .insert(taskDependencies)
      .values(dependency)
      .returning();
    return taskDependency;
  }

  async deleteTaskDependency(id: string): Promise<boolean> {
    const result = await db.delete(taskDependencies).where(eq(taskDependencies.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async wouldCreateCircularDependency(taskId: string, dependsOnTaskId: string): Promise<boolean> {
    // Simple check: if dependsOnTaskId already depends on taskId (directly or indirectly)
    const visited = new Set<string>();
    const toCheck = [dependsOnTaskId];

    while (toCheck.length > 0) {
      const current = toCheck.pop()!;
      if (current === taskId) {
        return true; // Found circular dependency
      }
      
      if (visited.has(current)) {
        continue;
      }
      visited.add(current);

      // Get all tasks that this task depends on
      const dependencies = await db
        .select({ dependsOnTaskId: taskDependencies.dependsOnTaskId })
        .from(taskDependencies)
        .where(eq(taskDependencies.taskId, current));

      for (const dep of dependencies) {
        toCheck.push(dep.dependsOnTaskId);
      }
    }

    return false;
  }

  // Time log operations
  async getTimeLogs(userId?: string, projectId?: string): Promise<TimeLog[]> {
    let query = db
      .select()
      .from(timeLogs)
      .leftJoin(users, eq(timeLogs.userId, users.id))
      .leftJoin(tasks, eq(timeLogs.taskId, tasks.id))
      .leftJoin(projects, eq(timeLogs.projectId, projects.id))
      .orderBy(desc(timeLogs.startTime));

    if (userId) {
      query = query.where(eq(timeLogs.userId, userId));
    }

    if (projectId) {
      query = query.where(eq(timeLogs.projectId, projectId));
    }

    const result = await query;
    
    return result.map(row => ({
      ...row.time_logs,
      user: row.users || undefined,
      task: row.tasks || undefined,
      project: row.projects || undefined,
    }));
  }

  async getTimeLog(id: string): Promise<TimeLog | undefined> {
    const result = await db
      .select()
      .from(timeLogs)
      .leftJoin(users, eq(timeLogs.userId, users.id))
      .leftJoin(tasks, eq(timeLogs.taskId, tasks.id))
      .leftJoin(projects, eq(timeLogs.projectId, projects.id))
      .where(eq(timeLogs.id, id))
      .limit(1);

    if (result.length === 0) return undefined;

    const row = result[0];
    return {
      ...row.time_logs,
      user: row.users || undefined,
      task: row.tasks || undefined,
      project: row.projects || undefined,
    };
  }

  async getActiveTimeLog(userId: string): Promise<TimeLog | undefined> {
    const result = await db
      .select()
      .from(timeLogs)
      .leftJoin(users, eq(timeLogs.userId, users.id))
      .leftJoin(tasks, eq(timeLogs.taskId, tasks.id))
      .leftJoin(projects, eq(timeLogs.projectId, projects.id))
      .where(and(eq(timeLogs.userId, userId), eq(timeLogs.isActive, true)))
      .limit(1);

    if (result.length === 0) return undefined;

    const row = result[0];
    return {
      ...row.time_logs,
      user: row.users || undefined,
      task: row.tasks || undefined,
      project: row.projects || undefined,
    };
  }

  async createTimeLog(insertTimeLog: InsertTimeLog): Promise<TimeLog> {
    const [timeLog] = await db
      .insert(timeLogs)
      .values(insertTimeLog)
      .returning();
    
    return await this.getTimeLog(timeLog.id) as TimeLog;
  }

  async updateTimeLog(id: string, updateTimeLog: UpdateTimeLog): Promise<TimeLog | undefined> {
    const [updatedTimeLog] = await db
      .update(timeLogs)
      .set({
        ...updateTimeLog,
        updatedAt: new Date(),
      })
      .where(eq(timeLogs.id, id))
      .returning();

    if (!updatedTimeLog) return undefined;
    
    return await this.getTimeLog(updatedTimeLog.id);
  }

  async deleteTimeLog(id: string): Promise<boolean> {
    const result = await db
      .delete(timeLogs)
      .where(eq(timeLogs.id, id));
    
    return result.rowCount > 0;
  }

  async stopActiveTimer(userId: string): Promise<TimeLog | undefined> {
    const activeTimer = await this.getActiveTimeLog(userId);
    if (!activeTimer) return undefined;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - new Date(activeTimer.startTime).getTime()) / 1000);

    return await this.updateTimeLog(activeTimer.id, {
      endTime,
      duration: duration.toString(),
      isActive: false,
    });
  }

  async getUserProductivityStats(userId: string, days: number): Promise<{
    totalHours: number;
    averageDailyHours: number;
    streakDays: number;
    utilizationPercent: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const timeLogsInPeriod = await db
      .select()
      .from(timeLogs)
      .where(
        and(
          eq(timeLogs.userId, userId),
          gte(timeLogs.startTime, startDate),
          lte(timeLogs.startTime, endDate),
          eq(timeLogs.isActive, false) // Only completed time logs
        )
      );

    const totalSeconds = timeLogsInPeriod.reduce((sum, log) => {
      return sum + (log.duration ? parseInt(log.duration) : 0);
    }, 0);

    const totalHours = totalSeconds / 3600;
    const averageDailyHours = totalHours / days;

    // Calculate streak days (consecutive days with time logged)
    let streakDays = 0;
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(checkDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayLogs = timeLogsInPeriod.filter(log => {
        const logDate = new Date(log.startTime);
        return logDate >= checkDate && logDate < nextDay;
      });

      if (dayLogs.length > 0) {
        streakDays++;
      } else {
        break;
      }
    }

    // Calculate utilization percentage (assuming 8 hours per day as target)
    const targetHours = days * 8;
    const utilizationPercent = targetHours > 0 ? (totalHours / targetHours) * 100 : 0;

    return {
      totalHours: Math.round(totalHours * 100) / 100,
      averageDailyHours: Math.round(averageDailyHours * 100) / 100,
      streakDays,
      utilizationPercent: Math.round(utilizationPercent * 100) / 100,
    };
  }

  async getDailyTimeLogs(userId: string, date: Date): Promise<TimeLog[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await db
      .select()
      .from(timeLogs)
      .leftJoin(users, eq(timeLogs.userId, users.id))
      .leftJoin(tasks, eq(timeLogs.taskId, tasks.id))
      .leftJoin(projects, eq(timeLogs.projectId, projects.id))
      .where(
        and(
          eq(timeLogs.userId, userId),
          gte(timeLogs.startTime, startOfDay),
          lte(timeLogs.startTime, endOfDay)
        )
      )
      .orderBy(timeLogs.startTime);

    return result.map(row => ({
      ...row.time_logs,
      user: row.users || undefined,
      task: row.tasks || undefined,
      project: row.projects || undefined,
    }));
  }

  // Template operations
  async getTemplates(type?: string, userId?: string): Promise<Template[]> {
    let query = db
      .select({
        id: templates.id,
        name: templates.name,
        type: templates.type,
        description: templates.description,
        content: templates.content,
        variables: templates.variables,
        isSystem: templates.isSystem,
        isPublic: templates.isPublic,
        createdById: templates.createdById,
        tags: templates.tags,
        metadata: templates.metadata,
        createdAt: templates.createdAt,
        updatedAt: templates.updatedAt,
        createdBy: users,
      })
      .from(templates)
      .leftJoin(users, eq(templates.createdById, users.id));

    const conditions = [];
    
    if (type) {
      conditions.push(eq(templates.type, type));
    }
    
    if (userId) {
      // Show user's own templates + public templates + system templates
      conditions.push(or(
        eq(templates.createdById, userId),
        eq(templates.isPublic, true),
        eq(templates.isSystem, true)
      ));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.orderBy(desc(templates.createdAt));
    return results.map(row => ({
      ...row,
      createdBy: row.createdBy || undefined,
    }));
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    const [result] = await db
      .select({
        id: templates.id,
        name: templates.name,
        type: templates.type,
        description: templates.description,
        content: templates.content,
        variables: templates.variables,
        isSystem: templates.isSystem,
        isPublic: templates.isPublic,
        createdById: templates.createdById,
        tags: templates.tags,
        metadata: templates.metadata,
        createdAt: templates.createdAt,
        updatedAt: templates.updatedAt,
        createdBy: users,
      })
      .from(templates)
      .leftJoin(users, eq(templates.createdById, users.id))
      .where(eq(templates.id, id));

    if (!result) return undefined;

    return {
      ...result,
      createdBy: result.createdBy || undefined,
    };
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const [template] = await db
      .insert(templates)
      .values(insertTemplate)
      .returning();
    return template;
  }

  async updateTemplate(id: string, updateTemplate: UpdateTemplate): Promise<Template | undefined> {
    const [template] = await db
      .update(templates)
      .set({
        ...updateTemplate,
        updatedAt: new Date(),
      })
      .where(eq(templates.id, id))
      .returning();
    return template;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const result = await db.delete(templates).where(eq(templates.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Proposal operations
  async getProposals(userId?: string): Promise<Proposal[]> {
    let query = db
      .select({
        id: proposals.id,
        title: proposals.title,
        templateId: proposals.templateId,
        projectId: proposals.projectId,
        clientName: proposals.clientName,
        clientEmail: proposals.clientEmail,
        status: proposals.status,
        content: proposals.content,
        variables: proposals.variables,
        sentAt: proposals.sentAt,
        viewedAt: proposals.viewedAt,
        respondedAt: proposals.respondedAt,
        expiresAt: proposals.expiresAt,
        responseMessage: proposals.responseMessage,
        shareableLink: proposals.shareableLink,
        version: proposals.version,
        parentProposalId: proposals.parentProposalId,
        createdById: proposals.createdById,
        metadata: proposals.metadata,
        createdAt: proposals.createdAt,
        updatedAt: proposals.updatedAt,
        template: templates,
        project: projects,
        createdBy: users,
      })
      .from(proposals)
      .leftJoin(templates, eq(proposals.templateId, templates.id))
      .leftJoin(projects, eq(proposals.projectId, projects.id))
      .leftJoin(users, eq(proposals.createdById, users.id));

    if (userId) {
      query = query.where(eq(proposals.createdById, userId));
    }

    const results = await query.orderBy(desc(proposals.createdAt));
    return results.map(row => ({
      ...row,
      template: row.template || undefined,
      project: row.project || undefined,
      createdBy: row.createdBy || undefined,
    }));
  }

  async getProposal(id: string): Promise<Proposal | undefined> {
    const [result] = await db
      .select({
        id: proposals.id,
        title: proposals.title,
        templateId: proposals.templateId,
        projectId: proposals.projectId,
        clientName: proposals.clientName,
        clientEmail: proposals.clientEmail,
        status: proposals.status,
        content: proposals.content,
        variables: proposals.variables,
        sentAt: proposals.sentAt,
        viewedAt: proposals.viewedAt,
        respondedAt: proposals.respondedAt,
        expiresAt: proposals.expiresAt,
        responseMessage: proposals.responseMessage,
        shareableLink: proposals.shareableLink,
        version: proposals.version,
        parentProposalId: proposals.parentProposalId,
        createdById: proposals.createdById,
        metadata: proposals.metadata,
        createdAt: proposals.createdAt,
        updatedAt: proposals.updatedAt,
        template: templates,
        project: projects,
        createdBy: users,
      })
      .from(proposals)
      .leftJoin(templates, eq(proposals.templateId, templates.id))
      .leftJoin(projects, eq(proposals.projectId, projects.id))
      .leftJoin(users, eq(proposals.createdById, users.id))
      .where(eq(proposals.id, id));

    if (!result) return undefined;

    return {
      ...result,
      template: result.template || undefined,
      project: result.project || undefined,
      createdBy: result.createdBy || undefined,
    };
  }

  async getProposalByShareableLink(shareableLink: string): Promise<Proposal | undefined> {
    const [result] = await db
      .select({
        id: proposals.id,
        title: proposals.title,
        templateId: proposals.templateId,
        projectId: proposals.projectId,
        clientName: proposals.clientName,
        clientEmail: proposals.clientEmail,
        status: proposals.status,
        content: proposals.content,
        variables: proposals.variables,
        sentAt: proposals.sentAt,
        viewedAt: proposals.viewedAt,
        respondedAt: proposals.respondedAt,
        expiresAt: proposals.expiresAt,
        responseMessage: proposals.responseMessage,
        shareableLink: proposals.shareableLink,
        version: proposals.version,
        parentProposalId: proposals.parentProposalId,
        createdById: proposals.createdById,
        metadata: proposals.metadata,
        createdAt: proposals.createdAt,
        updatedAt: proposals.updatedAt,
        template: templates,
        project: projects,
        createdBy: users,
      })
      .from(proposals)
      .leftJoin(templates, eq(proposals.templateId, templates.id))
      .leftJoin(projects, eq(proposals.projectId, projects.id))
      .leftJoin(users, eq(proposals.createdById, users.id))
      .where(eq(proposals.shareableLink, shareableLink));

    if (!result) return undefined;

    return {
      ...result,
      template: result.template || undefined,
      project: result.project || undefined,
      createdBy: result.createdBy || undefined,
    };
  }

  async createProposal(insertProposal: InsertProposal): Promise<Proposal> {
    const [proposal] = await db
      .insert(proposals)
      .values(insertProposal)
      .returning();
    return proposal;
  }

  async updateProposal(id: string, updateProposal: UpdateProposal): Promise<Proposal | undefined> {
    const [proposal] = await db
      .update(proposals)
      .set({
        ...updateProposal,
        updatedAt: new Date(),
      })
      .where(eq(proposals.id, id))
      .returning();
    return proposal;
  }

  async deleteProposal(id: string): Promise<boolean> {
    const result = await db.delete(proposals).where(eq(proposals.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async generateShareableLink(proposalId: string): Promise<string> {
    const shareableLink = `proposal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await db
      .update(proposals)
      .set({ shareableLink, updatedAt: new Date() })
      .where(eq(proposals.id, proposalId));
    return shareableLink;
  }
}

export const storage = new DatabaseStorage();