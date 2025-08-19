import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(), // Will be hashed
  role: text("role", { enum: ["admin", "user"] }).notNull().default("user"),
  name: text("name").notNull(),
  email: varchar("email"),
  notificationEmail: varchar("notification_email"),
  phone: varchar("phone"),
  smsOptIn: boolean("sms_opt_in").default(false),
  emailOptIn: boolean("email_opt_in").default(true),
  hasCompletedOnboarding: boolean("has_completed_onboarding").default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Projects table
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  status: text("status", { enum: ["active", "completed", "on-hold", "cancelled"] }).notNull().default("active"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  description: text("description").notNull(),
  completed: boolean("completed").notNull().default(false),
  dueDate: timestamp("due_date"),
  priority: text("priority", { enum: ["low", "medium", "high"] }).notNull().default("medium"),
  status: text("status", { enum: ["critical", "high", "medium", "low", "complete", "pending", "overdue"] }).notNull().default("pending"),
  assignedToId: varchar("assigned_to_id").references(() => users.id),
  createdById: varchar("created_by_id").references(() => users.id).notNull(),
  projectId: varchar("project_id").references(() => projects.id),
  parentTaskId: varchar("parent_task_id"), // For subtasks - will be self-referenced
  notes: text("notes"),
  attachments: text("attachments").array(),
  links: text("links").array(),
  progressNotes: jsonb("progress_notes").default([]),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Task Dependencies table - for task relationships
export const taskDependencies = pgTable("task_dependencies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").notNull(), // The dependent task
  dependsOnTaskId: varchar("depends_on_task_id").notNull(), // The task it depends on
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  assignedTasks: many(tasks, { relationName: "assignedTasks" }),
  createdTasks: many(tasks, { relationName: "createdTasks" }),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  assignedTo: one(users, {
    fields: [tasks.assignedToId],
    references: [users.id],
    relationName: "assignedTasks",
  }),
  createdBy: one(users, {
    fields: [tasks.createdById],
    references: [users.id],
    relationName: "createdTasks",
  }),
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  parentTask: one(tasks, {
    fields: [tasks.parentTaskId],
    references: [tasks.id],
    relationName: "parentTask",
  }),
  subtasks: many(tasks, { relationName: "parentTask" }),
  dependencies: many(taskDependencies, { relationName: "taskDependencies" }),
  dependents: many(taskDependencies, { relationName: "dependentTasks" }),
}));

export const taskDependenciesRelations = relations(taskDependencies, ({ one }) => ({
  task: one(tasks, {
    fields: [taskDependencies.taskId],
    references: [tasks.id],
    relationName: "taskDependencies",
  }),
  dependsOnTask: one(tasks, {
    fields: [taskDependencies.dependsOnTaskId],
    references: [tasks.id],
    relationName: "dependentTasks",
  }),
}));

// User schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const onboardingSchema = z.object({
  notificationEmail: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  emailOptIn: z.boolean().default(true),
  smsOptIn: z.boolean().default(false),
});

// Task schemas
export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  createdById: true,
}).extend({
  dueDate: z.union([z.date(), z.string(), z.null()]).optional().transform(val => {
    if (!val || val === '') return null;
    if (typeof val === 'string') return new Date(val);
    return val;
  }),
  assignedToId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  attachments: z.array(z.string()).optional().default([]),
  links: z.array(z.string()).optional().default([]),
  progressNotes: z.array(z.object({
    id: z.string(),
    date: z.string(),
    comment: z.string(),
    createdAt: z.string(),
  })).optional().default([]),
});

export const updateTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  createdById: true,
}).partial();

// Project schemas
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type OnboardingRequest = z.infer<typeof onboardingSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type TaskDependency = typeof taskDependencies.$inferSelect;
export type InsertTaskDependency = typeof taskDependencies.$inferInsert;

export type Task = typeof tasks.$inferSelect & {
  assignedTo?: User;
  project?: Project;
  parentTask?: Task;
  subtasks?: Task[];
  dependencies?: (TaskDependency & { dependsOnTask: Task })[];
  dependents?: (TaskDependency & { task: Task })[];
};
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
