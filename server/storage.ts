import { eq, and, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users, tasks, projects } from "@shared/schema";
import type { User, InsertUser, Task, InsertTask, UpdateTask, Project, InsertProject } from "@shared/schema";

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

  // Task management
  getTasks(userId?: string): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(insertTask: InsertTask, createdById: string): Promise<Task>;
  updateTask(id: string, updateTask: UpdateTask): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
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

  // Task operations
  async getTasks(userId?: string): Promise<Task[]> {
    const query = db
      .select({
        id: tasks.id,
        description: tasks.description,
        completed: tasks.completed,
        dueDate: tasks.dueDate,
        priority: tasks.priority,
        assignedToId: tasks.assignedToId,
        createdById: tasks.createdById,
        projectId: tasks.projectId,
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
        assignedToId: tasks.assignedToId,
        createdById: tasks.createdById,
        projectId: tasks.projectId,
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
}

export const storage = new DatabaseStorage();