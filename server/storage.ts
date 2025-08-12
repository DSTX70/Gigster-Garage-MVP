import { eq, and, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users, tasks } from "@shared/schema";
import type { User, InsertUser, Task, InsertTask, UpdateTask } from "@shared/schema";

export interface IStorage {
  // User management
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  deleteUser(id: string): Promise<boolean>;
  verifyPassword(user: User, password: string): Promise<boolean>;

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

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password);
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
        notes: tasks.notes,
        attachments: tasks.attachments,
        links: tasks.links,
        createdAt: tasks.createdAt,
        assignedTo: users,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assignedToId, users.id));

    // If userId is provided, filter tasks to only those assigned to the user
    if (userId) {
      const results = await query.where(eq(tasks.assignedToId, userId));
      return results.map(row => ({
        ...row,
        assignedTo: row.assignedTo || undefined,
      }));
    } else {
      // Admin can see all tasks
      const results = await query;
      return results.map(row => ({
        ...row,
        assignedTo: row.assignedTo || undefined,
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
        notes: tasks.notes,
        attachments: tasks.attachments,
        links: tasks.links,
        createdAt: tasks.createdAt,
        assignedTo: users,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assignedToId, users.id))
      .where(eq(tasks.id, id));

    if (!result) return undefined;

    return {
      ...result,
      assignedTo: result.assignedTo || undefined,
    };
  }

  async createTask(insertTask: InsertTask, createdById: string): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values({
        ...insertTask,
        createdById,
        assignedToId: insertTask.assignedToId || null,
        dueDate: insertTask.dueDate || null,
        notes: insertTask.notes || null,
        attachments: insertTask.attachments || [],
        links: insertTask.links || [],
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
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();