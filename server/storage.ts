import { eq, and, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users, tasks, projects, taskDependencies } from "@shared/schema";
import type { User, InsertUser, Task, InsertTask, UpdateTask, Project, InsertProject, TaskDependency, InsertTaskDependency } from "@shared/schema";

export interface IStorage {
  // User management
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
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
}

export const storage = new DatabaseStorage();