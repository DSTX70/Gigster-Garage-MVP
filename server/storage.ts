import { eq, and, or, desc, gte, lte, isNull, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users, tasks, projects, taskDependencies, templates, proposals, clients, clientDocuments, invoices, payments, contracts, timeLogs, messages, customFieldDefinitions, customFieldValues, workflowRules, workflowExecutions, comments, activities, apiKeys, apiUsage, fileAttachments, documentVersions } from "@shared/schema";
import type { User, UpsertUser, Task, InsertTask, Project, InsertProject, TaskDependency, InsertTaskDependency, Template, InsertTemplate, Proposal, InsertProposal, Client, InsertClient, ClientDocument, InsertClientDocument, Invoice, InsertInvoice, Payment, InsertPayment, Contract, InsertContract, TimeLog, InsertTimeLog, UpdateTask, UpdateTemplate, UpdateProposal, UpdateTimeLog, TaskWithRelations, TemplateWithRelations, ProposalWithRelations, TimeLogWithRelations, Message, InsertMessage, MessageWithRelations, CustomFieldDefinition, InsertCustomFieldDefinition, CustomFieldValue, InsertCustomFieldValue, WorkflowRule, InsertWorkflowRule, WorkflowExecution, InsertWorkflowExecution, Comment, InsertComment, Activity, InsertActivity, ApiKey, InsertApiKey, ApiUsage, InsertApiUsage, FileAttachment, InsertFileAttachment, DocumentVersion, InsertDocumentVersion } from "@shared/schema";

export interface IStorage {
  // User management
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: UpsertUser): Promise<User>;
  updateUserOnboarding(userId: string, onboardingData: {
    hasCompletedOnboarding?: boolean;
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

  // Client management
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(insertClient: InsertClient): Promise<Client>;
  updateClient(id: string, updateClient: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;

  // Client Document management
  getClientDocuments(clientId: string): Promise<ClientDocument[]>;
  getClientDocument(id: string): Promise<ClientDocument | undefined>;
  createClientDocument(insertDocument: InsertClientDocument): Promise<ClientDocument>;
  updateClientDocument(id: string, updateDocument: Partial<InsertClientDocument>): Promise<ClientDocument | undefined>;
  deleteClientDocument(id: string): Promise<boolean>;

  // Invoice management
  getInvoices(userId?: string): Promise<Invoice[]>;
  getInvoice(id: string, userId?: string): Promise<Invoice | undefined>;
  createInvoice(insertInvoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, updateInvoice: Partial<InsertInvoice>, userId?: string): Promise<Invoice | undefined>;
  deleteInvoice(id: string, userId?: string): Promise<boolean>;

  // Contract management
  getContracts(): Promise<Contract[]>;
  getContract(id: string): Promise<Contract | undefined>;
  createContract(insertContract: InsertContract): Promise<Contract>;
  updateContract(id: string, updateContract: Partial<InsertContract>): Promise<Contract | undefined>;
  deleteContract(id: string): Promise<boolean>;

  // Payment management  
  getPayments(): Promise<Payment[]>;
  getPayment(id: string): Promise<Payment | undefined>;
  createPayment(insertPayment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, updatePayment: Partial<InsertPayment>): Promise<Payment | undefined>;
  deletePayment(id: string): Promise<boolean>;

  // Message management
  getMessages(userId: string): Promise<MessageWithRelations[]>;
  getMessage(id: string): Promise<MessageWithRelations | undefined>;
  createMessage(insertMessage: InsertMessage): Promise<Message>;
  markMessageAsRead(messageId: string, userId: string): Promise<Message | undefined>;
  getUnreadMessageCount(userId: string): Promise<number>;

  // File Attachment management
  getFileAttachments(entityType: 'task' | 'project' | 'client', entityId: string): Promise<FileAttachment[]>;
  getAllFileAttachments(): Promise<FileAttachment[]>;
  getFileAttachment(id: string): Promise<FileAttachment | undefined>;
  createFileAttachment(insertAttachment: InsertFileAttachment): Promise<FileAttachment>;
  updateFileAttachment(id: string, updateAttachment: Partial<InsertFileAttachment>): Promise<FileAttachment | undefined>;
  deleteFileAttachment(id: string): Promise<boolean>;

  // Document Version management
  getDocumentVersions(documentId: string): Promise<DocumentVersion[]>;
  getDocumentVersion(id: string): Promise<DocumentVersion | undefined>;
  createDocumentVersion(insertVersion: InsertDocumentVersion): Promise<DocumentVersion>;
  deleteDocumentVersion(id: string): Promise<boolean>;

  // Custom Field Definitions management
  getCustomFieldDefinitions(entityType?: string): Promise<CustomFieldDefinition[]>;
  getCustomFieldDefinition(id: string): Promise<CustomFieldDefinition | undefined>;
  createCustomFieldDefinition(insertDefinition: InsertCustomFieldDefinition): Promise<CustomFieldDefinition>;
  updateCustomFieldDefinition(id: string, updateDefinition: Partial<InsertCustomFieldDefinition>): Promise<CustomFieldDefinition | undefined>;
  deleteCustomFieldDefinition(id: string): Promise<boolean>;

  // Custom Field Values management
  getCustomFieldValues(entityType: string, entityId: string): Promise<CustomFieldValue[]>;
  getCustomFieldValue(id: string): Promise<CustomFieldValue | undefined>;
  setCustomFieldValue(insertValue: InsertCustomFieldValue): Promise<CustomFieldValue>;
  updateCustomFieldValue(id: string, updateValue: Partial<InsertCustomFieldValue>): Promise<CustomFieldValue | undefined>;
  deleteCustomFieldValue(id: string): Promise<boolean>;

  // Workflow Rules management
  getWorkflowRules(entityType?: string, isActive?: boolean): Promise<WorkflowRule[]>;
  getWorkflowRule(id: string): Promise<WorkflowRule | undefined>;
  createWorkflowRule(insertRule: InsertWorkflowRule): Promise<WorkflowRule>;
  updateWorkflowRule(id: string, updateRule: Partial<InsertWorkflowRule>): Promise<WorkflowRule | undefined>;
  deleteWorkflowRule(id: string): Promise<boolean>;
  executeWorkflowRules(entityType: string, entityId: string, event: string, entityData: any): Promise<WorkflowExecution[]>;

  // Workflow Executions management
  getWorkflowExecutions(ruleId?: string, entityId?: string): Promise<WorkflowExecution[]>;
  getWorkflowExecution(id: string): Promise<WorkflowExecution | undefined>;
  createWorkflowExecution(insertExecution: InsertWorkflowExecution): Promise<WorkflowExecution>;

  // Comments management
  getComments(entityType: string, entityId: string): Promise<Comment[]>;
  getComment(id: string): Promise<Comment | undefined>;
  createComment(insertComment: InsertComment): Promise<Comment>;
  updateComment(id: string, updateComment: Partial<InsertComment>): Promise<Comment | undefined>;
  deleteComment(id: string): Promise<boolean>;

  // Activities management
  getActivities(entityType?: string, entityId?: string, actorId?: string, limit?: number): Promise<Activity[]>;
  getActivity(id: string): Promise<Activity | undefined>;
  createActivity(insertActivity: InsertActivity): Promise<Activity>;
  deleteActivity(id: string): Promise<boolean>;

  // API Keys management
  getApiKeys(createdById?: string): Promise<ApiKey[]>;
  getApiKey(id: string): Promise<ApiKey | undefined>;
  getApiKeyByKey(key: string): Promise<ApiKey | undefined>;
  createApiKey(insertKey: InsertApiKey): Promise<ApiKey>;
  updateApiKey(id: string, updateKey: Partial<InsertApiKey>): Promise<ApiKey | undefined>;
  deleteApiKey(id: string): Promise<boolean>;
  validateApiKey(key: string): Promise<ApiKey | null>;

  // API Usage tracking
  getApiUsage(keyId?: string, startDate?: Date, endDate?: Date): Promise<ApiUsage[]>;
  createApiUsage(insertUsage: InsertApiUsage): Promise<ApiUsage>;
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

  async createUser(insertUser: UpsertUser): Promise<User> {
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
    hasCompletedOnboarding?: boolean;
    notificationEmail?: string;
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
        hasCompletedOnboarding: onboardingData.hasCompletedOnboarding !== undefined ? onboardingData.hasCompletedOnboarding : true,
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
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
        dueTime: tasks.dueTime,
        completed: tasks.completed,
        completedAt: tasks.completedAt,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        projectId: tasks.projectId,
        assignedToId: tasks.assignedToId,
        createdById: tasks.createdById,
        notes: tasks.notes,
        attachments: tasks.attachments,
        links: tasks.links,
        parentTaskId: tasks.parentTaskId,
        progress: tasks.progress,
        progressNotes: tasks.progressNotes,
        estimatedHours: tasks.estimatedHours,
        actualHours: tasks.actualHours,
      })
      .from(tasks)
      .orderBy(tasks.createdAt);

    // If userId is provided, filter tasks to only those assigned to or created by the user
    if (userId) {
      const results = await query.where(
        or(
          eq(tasks.assignedToId, userId),
          eq(tasks.createdById, userId)
        )
      );
      return results;
    } else {
      // Admin can see all tasks
      const results = await query;
      return results;
    }
  }

  async getTask(id: string): Promise<Task | undefined> {
    const [result] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id));

    return result || undefined;
  }

  async createTask(insertTask: InsertTask, createdById: string): Promise<Task> {
    // Handle JSONB arrays properly - use null for empty arrays to avoid PostgreSQL issues
    const taskData = {
      ...insertTask,
      createdById,
      assignedToId: insertTask.assignedToId || null,
      projectId: insertTask.projectId || null,
      dueDate: insertTask.dueDate || null,
      notes: insertTask.notes || null,
      attachments: (insertTask.attachments && insertTask.attachments.length > 0) ? insertTask.attachments : null,
      links: (insertTask.links && insertTask.links.length > 0) ? insertTask.links : null,
      progressNotes: (insertTask.progressNotes && insertTask.progressNotes.length > 0) ? insertTask.progressNotes : null,
    };

    const [task] = await db
      .insert(tasks)
      .values(taskData)
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
      const results = await query.where(
        and(
          eq(tasks.projectId, projectId), 
          or(
            eq(tasks.assignedToId, userId),
            eq(tasks.createdById, userId)
          )
        )
      );
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
      taskMap.set(task.id, { ...task });
      if (!task.parentTaskId) {
        parentTasks.push(taskMap.get(task.id)!);
      }
    }
    
    // Second pass: attach subtasks to their parents
    for (const task of allTasks) {
      if (task.parentTaskId && taskMap.has(task.parentTaskId)) {
        const parent = taskMap.get(task.parentTaskId)!;
        const child = taskMap.get(task.id)!;
        // Note: subtasks relationship handled via parentTaskId
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
        .where(eq(taskDependencies.dependentTaskId, current));

      for (const dep of dependencies) {
        if (dep.dependsOnTaskId) {
          toCheck.push(dep.dependsOnTaskId);
        }
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
    
    return (result.rowCount ?? 0) > 0;
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

  // Client operations
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(insertClient).returning();
    return client;
  }

  async updateClient(id: string, updateClient: Partial<InsertClient>): Promise<Client | undefined> {
    const [client] = await db
      .update(clients)
      .set(updateClient)
      .where(eq(clients.id, id))
      .returning();
    return client;
  }

  async deleteClient(id: string): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id));
    return result.rowCount! > 0;
  }

  // Client Document operations
  async getClientDocuments(clientId: string): Promise<ClientDocument[]> {
    return await db
      .select()
      .from(clientDocuments)
      .where(eq(clientDocuments.clientId, clientId))
      .orderBy(desc(clientDocuments.createdAt));
  }

  async getAllClientDocuments(): Promise<any[]> {
    return await db
      .select({
        id: clientDocuments.id,
        clientId: clientDocuments.clientId,
        name: clientDocuments.name,
        description: clientDocuments.description,
        type: clientDocuments.type,
        fileUrl: clientDocuments.fileUrl,
        fileName: clientDocuments.fileName,
        fileSize: clientDocuments.fileSize,
        mimeType: clientDocuments.mimeType,
        version: clientDocuments.version,
        status: clientDocuments.status,
        tags: clientDocuments.tags,
        metadata: clientDocuments.metadata,
        uploadedById: clientDocuments.uploadedById,
        createdAt: clientDocuments.createdAt,
        updatedAt: clientDocuments.updatedAt,
        client: {
          id: clients.id,
          name: clients.name,
          email: clients.email,
          company: clients.company,
        },
        uploadedBy: {
          id: users.id,
          name: users.name,
          email: users.email,
        }
      })
      .from(clientDocuments)
      .leftJoin(clients, eq(clientDocuments.clientId, clients.id))
      .leftJoin(users, eq(clientDocuments.uploadedById, users.id))
      .orderBy(desc(clientDocuments.createdAt));
  }

  async getClientDocument(id: string): Promise<ClientDocument | undefined> {
    const [document] = await db
      .select()
      .from(clientDocuments)
      .where(eq(clientDocuments.id, id));
    return document;
  }

  async createClientDocument(insertDocument: InsertClientDocument): Promise<ClientDocument> {
    const [document] = await db
      .insert(clientDocuments)
      .values(insertDocument)
      .returning();
    return document;
  }

  async updateClientDocument(id: string, updateDocument: Partial<InsertClientDocument>): Promise<ClientDocument | undefined> {
    const [document] = await db
      .update(clientDocuments)
      .set({
        ...updateDocument,
        updatedAt: new Date(),
      })
      .where(eq(clientDocuments.id, id))
      .returning();
    return document;
  }

  async deleteClientDocument(id: string): Promise<boolean> {
    const result = await db.delete(clientDocuments).where(eq(clientDocuments.id, id));
    return result.rowCount! > 0;
  }

  // Invoice operations
  async getInvoices(userId?: string): Promise<Invoice[]> {
    if (userId) {
      return await db.select().from(invoices)
        .where(eq(invoices.createdById, userId))
        .orderBy(desc(invoices.createdAt));
    }
    return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: string, userId?: string): Promise<Invoice | undefined> {
    const conditions = userId 
      ? and(eq(invoices.id, id), eq(invoices.createdById, userId))
      : eq(invoices.id, id);
    const [invoice] = await db.select().from(invoices).where(conditions);
    return invoice;
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    // Some drivers (e.g., sqlite/libsql in certain versions) may return [] from .returning()
    const rows = await db
      .insert(invoices)
      .values(insertInvoice)
      .returning();
    
    if (Array.isArray(rows) && rows.length > 0) {
      return rows[0] as Invoice;
    }

    // Fallback: re-select by a unique key (invoiceNumber is generated unique per request)
    const [fallback] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.invoiceNumber, insertInvoice.invoiceNumber))
      .limit(1);

    if (!fallback) {
      throw new Error("createInvoice: Insert succeeded but no row returned; fallback select empty");
    }

    return fallback as Invoice;
  }

  async updateInvoice(id: string, updateInvoice: Partial<InsertInvoice>, userId?: string): Promise<Invoice | undefined> {
    const conditions = userId 
      ? and(eq(invoices.id, id), eq(invoices.createdById, userId))
      : eq(invoices.id, id);
    const [invoice] = await db
      .update(invoices)
      .set(updateInvoice)
      .where(conditions)
      .returning();
    return invoice;
  }

  async deleteInvoice(id: string, userId?: string): Promise<boolean> {
    const conditions = userId 
      ? and(eq(invoices.id, id), eq(invoices.createdById, userId))
      : eq(invoices.id, id);
    const result = await db.delete(invoices).where(conditions);
    return (result.rowCount ?? 0) > 0;
  }

  // Contract operations
  async getContracts(): Promise<Contract[]> {
    return await db.select().from(contracts).orderBy(desc(contracts.createdAt));
  }

  async getContract(id: string): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
    return contract;
  }

  async createContract(insertContract: InsertContract): Promise<Contract> {
    const [contract] = await db
      .insert(contracts)
      .values(insertContract)
      .returning();
    return contract;
  }

  async updateContract(id: string, updateContract: Partial<InsertContract>): Promise<Contract | undefined> {
    const [contract] = await db
      .update(contracts)
      .set({
        ...updateContract,
        updatedAt: new Date(),
      })
      .where(eq(contracts.id, id))
      .returning();
    return contract;
  }

  async deleteContract(id: string): Promise<boolean> {
    const result = await db.delete(contracts).where(eq(contracts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Payment operations
  async getPayments(): Promise<Payment[]> {
    return await db.select().from(payments).orderBy(desc(payments.createdAt));
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    return payment;
  }

  async updatePayment(id: string, updatePayment: Partial<InsertPayment>): Promise<Payment | undefined> {
    const [payment] = await db
      .update(payments)
      .set(updatePayment)
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  async deletePayment(id: string): Promise<boolean> {
    const result = await db.delete(payments).where(eq(payments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Message operations
  async getMessages(userId: string): Promise<MessageWithRelations[]> {
    return await db
      .select({
        id: messages.id,
        fromUserId: messages.fromUserId,
        toUserId: messages.toUserId,
        toEmail: messages.toEmail,
        subject: messages.subject,
        content: messages.content,
        priority: messages.priority,
        attachments: messages.attachments,
        isRead: messages.isRead,
        readAt: messages.readAt,
        createdAt: messages.createdAt,
        updatedAt: messages.updatedAt,
        fromUser: {
          id: users.id,
          name: users.name,
          username: users.username,
          email: users.email,
        },
      })
      .from(messages)
      .leftJoin(users, eq(messages.fromUserId, users.id))
      .where(or(eq(messages.toUserId, userId), eq(messages.fromUserId, userId)))
      .orderBy(desc(messages.createdAt));
  }

  async getMessage(id: string): Promise<MessageWithRelations | undefined> {
    const [message] = await db
      .select({
        id: messages.id,
        fromUserId: messages.fromUserId,
        toUserId: messages.toUserId,
        toEmail: messages.toEmail,
        subject: messages.subject,
        content: messages.content,
        priority: messages.priority,
        attachments: messages.attachments,
        isRead: messages.isRead,
        readAt: messages.readAt,
        createdAt: messages.createdAt,
        updatedAt: messages.updatedAt,
        fromUser: {
          id: users.id,
          name: users.name,
          username: users.username,
          email: users.email,
        },
      })
      .from(messages)
      .leftJoin(users, eq(messages.fromUserId, users.id))
      .where(eq(messages.id, id));
    return message;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    // Find user by email if toUserId is not provided
    let finalToUserId = insertMessage.toUserId;
    if (!finalToUserId && insertMessage.toEmail) {
      const user = await this.getUserByUsername(insertMessage.toEmail);
      if (user) {
        finalToUserId = user.id;
      }
    }

    const [message] = await db
      .insert(messages)
      .values({
        ...insertMessage,
        toUserId: finalToUserId,
      })
      .returning();
    return message;
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<Message | undefined> {
    const [message] = await db
      .update(messages)
      .set({ 
        isRead: true, 
        readAt: new Date(),
        updatedAt: new Date() 
      })
      .where(and(
        eq(messages.id, messageId),
        eq(messages.toUserId, userId)
      ))
      .returning();
    return message;
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql`count(*)` })
      .from(messages)
      .where(and(
        eq(messages.toUserId, userId),
        eq(messages.isRead, false)
      ));
    return Number(result?.count || 0);
  }

  // File Attachment operations
  async getFileAttachments(entityType: 'task' | 'project' | 'client', entityId: string): Promise<FileAttachment[]> {
    const result = await db.select().from(fileAttachments)
      .where(and(
        eq(fileAttachments.entityType, entityType),
        eq(fileAttachments.entityId, entityId)
      ))
      .orderBy(desc(fileAttachments.createdAt));
    return result;
  }

  async getAllFileAttachments(): Promise<FileAttachment[]> {
    return await db.select().from(fileAttachments)
      .orderBy(desc(fileAttachments.createdAt));
  }

  async getFileAttachment(id: string): Promise<FileAttachment | undefined> {
    const [attachment] = await db.select().from(fileAttachments)
      .where(eq(fileAttachments.id, id));
    return attachment;
  }

  async createFileAttachment(insertAttachment: InsertFileAttachment): Promise<FileAttachment> {
    const [attachment] = await db
      .insert(fileAttachments)
      .values(insertAttachment)
      .returning();
    return attachment;
  }

  async updateFileAttachment(id: string, updateAttachment: Partial<InsertFileAttachment>): Promise<FileAttachment | undefined> {
    const [attachment] = await db
      .update(fileAttachments)
      .set(updateAttachment)
      .where(eq(fileAttachments.id, id))
      .returning();
    return attachment;
  }

  async deleteFileAttachment(id: string): Promise<boolean> {
    const result = await db
      .delete(fileAttachments)
      .where(eq(fileAttachments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Document Version operations
  async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    return await db.select().from(documentVersions)
      .where(eq(documentVersions.documentId, documentId))
      .orderBy(desc(documentVersions.versionNumber));
  }

  async getDocumentVersion(id: string): Promise<DocumentVersion | undefined> {
    const [version] = await db.select().from(documentVersions)
      .where(eq(documentVersions.id, id));
    return version;
  }

  async createDocumentVersion(insertVersion: InsertDocumentVersion): Promise<DocumentVersion> {
    const [version] = await db
      .insert(documentVersions)
      .values(insertVersion)
      .returning();
    return version;
  }

  async deleteDocumentVersion(id: string): Promise<boolean> {
    const result = await db
      .delete(documentVersions)
      .where(eq(documentVersions.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Custom Field Definitions operations
  async getCustomFieldDefinitions(entityType?: string): Promise<CustomFieldDefinition[]> {
    let query = db.select().from(customFieldDefinitions);
    
    if (entityType) {
      query = query.where(eq(customFieldDefinitions.entityType, entityType));
    }
    
    return await query
      .where(eq(customFieldDefinitions.isActive, true))
      .orderBy(customFieldDefinitions.order, customFieldDefinitions.createdAt);
  }

  async getCustomFieldDefinition(id: string): Promise<CustomFieldDefinition | undefined> {
    const [definition] = await db.select().from(customFieldDefinitions)
      .where(eq(customFieldDefinitions.id, id));
    return definition;
  }

  async createCustomFieldDefinition(insertDefinition: InsertCustomFieldDefinition): Promise<CustomFieldDefinition> {
    const [definition] = await db
      .insert(customFieldDefinitions)
      .values(insertDefinition)
      .returning();
    return definition;
  }

  async updateCustomFieldDefinition(id: string, updateDefinition: Partial<InsertCustomFieldDefinition>): Promise<CustomFieldDefinition | undefined> {
    const [definition] = await db
      .update(customFieldDefinitions)
      .set({ ...updateDefinition, updatedAt: new Date() })
      .where(eq(customFieldDefinitions.id, id))
      .returning();
    return definition;
  }

  async deleteCustomFieldDefinition(id: string): Promise<boolean> {
    const result = await db
      .delete(customFieldDefinitions)
      .where(eq(customFieldDefinitions.id, id));
    return result.rowCount > 0;
  }

  // Custom Field Values operations
  async getCustomFieldValues(entityType: string, entityId: string): Promise<CustomFieldValue[]> {
    return await db.select().from(customFieldValues)
      .where(and(
        eq(customFieldValues.entityType, entityType),
        eq(customFieldValues.entityId, entityId)
      ))
      .orderBy(customFieldValues.createdAt);
  }

  async getCustomFieldValue(id: string): Promise<CustomFieldValue | undefined> {
    const [value] = await db.select().from(customFieldValues)
      .where(eq(customFieldValues.id, id));
    return value;
  }

  async setCustomFieldValue(insertValue: InsertCustomFieldValue): Promise<CustomFieldValue> {
    // Check if value already exists and update or insert
    const existing = await db.select().from(customFieldValues)
      .where(and(
        eq(customFieldValues.fieldId, insertValue.fieldId),
        eq(customFieldValues.entityType, insertValue.entityType),
        eq(customFieldValues.entityId, insertValue.entityId)
      ));

    if (existing.length > 0) {
      const [value] = await db
        .update(customFieldValues)
        .set({ value: insertValue.value, updatedAt: new Date() })
        .where(eq(customFieldValues.id, existing[0].id))
        .returning();
      return value;
    } else {
      const [value] = await db
        .insert(customFieldValues)
        .values(insertValue)
        .returning();
      return value;
    }
  }

  async updateCustomFieldValue(id: string, updateValue: Partial<InsertCustomFieldValue>): Promise<CustomFieldValue | undefined> {
    const [value] = await db
      .update(customFieldValues)
      .set({ ...updateValue, updatedAt: new Date() })
      .where(eq(customFieldValues.id, id))
      .returning();
    return value;
  }

  async deleteCustomFieldValue(id: string): Promise<boolean> {
    const result = await db
      .delete(customFieldValues)
      .where(eq(customFieldValues.id, id));
    return result.rowCount > 0;
  }

  // Workflow Rules operations
  async getWorkflowRules(entityType?: string, isActive?: boolean): Promise<WorkflowRule[]> {
    let query = db.select().from(workflowRules);
    
    const conditions = [];
    if (entityType) {
      conditions.push(eq(workflowRules.entityType, entityType));
    }
    if (isActive !== undefined) {
      conditions.push(eq(workflowRules.isActive, isActive));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(workflowRules.priority, workflowRules.createdAt);
  }

  async getWorkflowRule(id: string): Promise<WorkflowRule | undefined> {
    const [rule] = await db.select().from(workflowRules)
      .where(eq(workflowRules.id, id));
    return rule;
  }

  async createWorkflowRule(insertRule: InsertWorkflowRule): Promise<WorkflowRule> {
    const [rule] = await db
      .insert(workflowRules)
      .values(insertRule)
      .returning();
    return rule;
  }

  async updateWorkflowRule(id: string, updateRule: Partial<InsertWorkflowRule>): Promise<WorkflowRule | undefined> {
    const [rule] = await db
      .update(workflowRules)
      .set({ ...updateRule, updatedAt: new Date() })
      .where(eq(workflowRules.id, id))
      .returning();
    return rule;
  }

  async deleteWorkflowRule(id: string): Promise<boolean> {
    const result = await db
      .delete(workflowRules)
      .where(eq(workflowRules.id, id));
    return result.rowCount > 0;
  }

  async executeWorkflowRules(entityType: string, entityId: string, event: string, entityData: any): Promise<WorkflowExecution[]> {
    // Get active workflow rules for this entity type
    const rules = await this.getWorkflowRules(entityType, true);
    const executions: WorkflowExecution[] = [];

    for (const rule of rules) {
      // Check if the rule's trigger matches the event
      if (rule.trigger.event === event) {
        // Evaluate conditions
        let conditionsMet = true;
        
        for (const condition of rule.trigger.conditions) {
          const fieldValue = entityData[condition.field];
          
          switch (condition.operator) {
            case 'equals':
              conditionsMet = conditionsMet && (fieldValue === condition.value);
              break;
            case 'not_equals':
              conditionsMet = conditionsMet && (fieldValue !== condition.value);
              break;
            case 'contains':
              conditionsMet = conditionsMet && (String(fieldValue).includes(condition.value));
              break;
            case 'greater_than':
              conditionsMet = conditionsMet && (Number(fieldValue) > Number(condition.value));
              break;
            case 'less_than':
              conditionsMet = conditionsMet && (Number(fieldValue) < Number(condition.value));
              break;
            default:
              conditionsMet = false;
          }
          
          if (!conditionsMet) break;
        }

        if (conditionsMet) {
          // Execute actions
          const executedActions = [];
          const failedActions = [];
          const errors = [];

          for (const action of rule.actions) {
            try {
              await this.executeWorkflowAction(action, entityType, entityId, entityData);
              executedActions.push(action);
            } catch (error) {
              failedActions.push(action);
              errors.push(error.message);
            }
          }

          // Log execution
          const execution = await this.createWorkflowExecution({
            ruleId: rule.id,
            entityType,
            entityId,
            status: errors.length === 0 ? 'success' : (executedActions.length > 0 ? 'partial' : 'failed'),
            result: {
              executedActions: executedActions.length,
              failedActions: failedActions.length,
              errors,
              details: { executedActions, failedActions }
            }
          });

          executions.push(execution);
        }
      }
    }

    return executions;
  }

  private async executeWorkflowAction(action: any, entityType: string, entityId: string, entityData: any): Promise<void> {
    switch (action.type) {
      case 'send_email':
        // Email sending logic would go here
        console.log('Would send email:', action.config);
        break;
      case 'create_task':
        if (entityType !== 'task') {
          await this.createTask(action.config, entityData.createdBy || entityData.assignedToId);
        }
        break;
      case 'update_status':
        if (entityType === 'task') {
          await this.updateTask(entityId, { status: action.config.status });
        } else if (entityType === 'project') {
          await this.updateProject(entityId, { status: action.config.status });
        }
        break;
      case 'assign_user':
        if (entityType === 'task') {
          await this.updateTask(entityId, { assignedToId: action.config.userId });
        }
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  // Workflow Executions operations
  async getWorkflowExecutions(ruleId?: string, entityId?: string): Promise<WorkflowExecution[]> {
    let query = db.select().from(workflowExecutions);
    
    const conditions = [];
    if (ruleId) {
      conditions.push(eq(workflowExecutions.ruleId, ruleId));
    }
    if (entityId) {
      conditions.push(eq(workflowExecutions.entityId, entityId));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(workflowExecutions.executedAt));
  }

  async getWorkflowExecution(id: string): Promise<WorkflowExecution | undefined> {
    const [execution] = await db.select().from(workflowExecutions)
      .where(eq(workflowExecutions.id, id));
    return execution;
  }

  async createWorkflowExecution(insertExecution: InsertWorkflowExecution): Promise<WorkflowExecution> {
    const [execution] = await db
      .insert(workflowExecutions)
      .values(insertExecution)
      .returning();
    return execution;
  }

  // Comments operations
  async getComments(entityType: string, entityId: string): Promise<Comment[]> {
    return await db.select().from(comments)
      .where(and(
        eq(comments.entityType, entityType),
        eq(comments.entityId, entityId)
      ))
      .orderBy(comments.createdAt);
  }

  async getComment(id: string): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments)
      .where(eq(comments.id, id));
    return comment;
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(insertComment)
      .returning();
    
    // Create activity for comment
    await this.createActivity({
      type: 'comment_added',
      entityType: insertComment.entityType as any,
      entityId: insertComment.entityId,
      actorId: insertComment.authorId,
      description: `Added a comment`,
      data: { commentId: comment.id }
    });

    return comment;
  }

  async updateComment(id: string, updateComment: Partial<InsertComment>): Promise<Comment | undefined> {
    const [comment] = await db
      .update(comments)
      .set({ 
        ...updateComment, 
        isEdited: true, 
        editedAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(comments.id, id))
      .returning();
    return comment;
  }

  async deleteComment(id: string): Promise<boolean> {
    const result = await db
      .delete(comments)
      .where(eq(comments.id, id));
    return result.rowCount > 0;
  }

  // Activities operations
  async getActivities(entityType?: string, entityId?: string, actorId?: string, limit: number = 50): Promise<Activity[]> {
    let query = db.select().from(activities);
    
    const conditions = [];
    if (entityType) {
      conditions.push(eq(activities.entityType, entityType));
    }
    if (entityId) {
      conditions.push(eq(activities.entityId, entityId));
    }
    if (actorId) {
      conditions.push(eq(activities.actorId, actorId));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async getActivity(id: string): Promise<Activity | undefined> {
    const [activity] = await db.select().from(activities)
      .where(eq(activities.id, id));
    return activity;
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(insertActivity)
      .returning();
    return activity;
  }

  async deleteActivity(id: string): Promise<boolean> {
    const result = await db
      .delete(activities)
      .where(eq(activities.id, id));
    return result.rowCount > 0;
  }

  // API Keys operations
  async getApiKeys(createdById?: string): Promise<ApiKey[]> {
    let query = db.select().from(apiKeys);
    
    if (createdById) {
      query = query.where(eq(apiKeys.createdById, createdById));
    }
    
    return await query
      .orderBy(desc(apiKeys.createdAt));
  }

  async getApiKey(id: string): Promise<ApiKey | undefined> {
    const [key] = await db.select().from(apiKeys)
      .where(eq(apiKeys.id, id));
    return key;
  }

  async getApiKeyByKey(key: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select().from(apiKeys)
      .where(eq(apiKeys.key, key));
    return apiKey;
  }

  async createApiKey(insertKey: InsertApiKey): Promise<ApiKey> {
    const [key] = await db
      .insert(apiKeys)
      .values(insertKey)
      .returning();
    return key;
  }

  async updateApiKey(id: string, updateKey: Partial<InsertApiKey>): Promise<ApiKey | undefined> {
    const [key] = await db
      .update(apiKeys)
      .set({ ...updateKey, updatedAt: new Date() })
      .where(eq(apiKeys.id, id))
      .returning();
    return key;
  }

  async deleteApiKey(id: string): Promise<boolean> {
    const result = await db
      .delete(apiKeys)
      .where(eq(apiKeys.id, id));
    return result.rowCount > 0;
  }

  async validateApiKey(key: string): Promise<ApiKey | null> {
    const [apiKey] = await db.select().from(apiKeys)
      .where(and(
        eq(apiKeys.key, key),
        eq(apiKeys.isActive, true),
        or(
          isNull(apiKeys.expiresAt),
          gte(apiKeys.expiresAt, new Date())
        )
      ));
    
    if (apiKey) {
      // Update last used timestamp
      await this.updateApiKey(apiKey.id, { lastUsedAt: new Date() });
    }
    
    return apiKey || null;
  }

  // API Usage operations
  async getApiUsage(keyId?: string, startDate?: Date, endDate?: Date): Promise<ApiUsage[]> {
    let query = db.select().from(apiUsage);
    
    const conditions = [];
    if (keyId) {
      conditions.push(eq(apiUsage.keyId, keyId));
    }
    if (startDate) {
      conditions.push(gte(apiUsage.requestedAt, startDate));
    }
    if (endDate) {
      conditions.push(lte(apiUsage.requestedAt, endDate));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(apiUsage.requestedAt));
  }

  async createApiUsage(insertUsage: InsertApiUsage): Promise<ApiUsage> {
    const [usage] = await db
      .insert(apiUsage)
      .values(insertUsage)
      .returning();
    return usage;
  }
}

export const storage = new DatabaseStorage();