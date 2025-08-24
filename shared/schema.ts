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

// Time Logs table - for time tracking
export const timeLogs = pgTable("time_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  taskId: varchar("task_id").references(() => tasks.id),
  projectId: varchar("project_id").references(() => projects.id),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: text("duration"), // In seconds as string for precision
  isActive: boolean("is_active").default(false), // True when timer is running
  isManualEntry: boolean("is_manual_entry").default(false),
  editHistory: jsonb("edit_history").default([]), // Audit trail for manual edits
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Templates table - for reusable document templates
export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: text("type", { enum: ["proposal", "contract", "invoice", "deck"] }).notNull(),
  description: text("description"),
  content: text("content"), // Optional - form builder approach uses fields instead of content
  variables: jsonb("variables").default([]), // Array of variable definitions
  isSystem: boolean("is_system").default(false), // System templates vs user-created
  isPublic: boolean("is_public").default(false), // Can be used by other users
  createdById: varchar("created_by_id").references(() => users.id).notNull(),
  tags: text("tags").array().default([]),
  metadata: jsonb("metadata").default({}), // Additional template metadata
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Proposals table - for generated proposals from templates
export const proposals = pgTable("proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  templateId: varchar("template_id").references(() => templates.id),
  projectId: varchar("project_id").references(() => projects.id),
  clientName: varchar("client_name"),
  clientEmail: varchar("client_email"),
  status: text("status", { enum: ["draft", "sent", "viewed", "accepted", "rejected", "expired"] }).notNull().default("draft"),
  content: text("content").notNull(), // Final content with variables resolved
  variables: jsonb("variables").default({}), // Key-value pairs for template variables
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  respondedAt: timestamp("responded_at"),
  expiresAt: timestamp("expires_at"),
  responseMessage: text("response_message"),
  shareableLink: varchar("shareable_link"),
  version: varchar("version").notNull().default("1.0"),
  parentProposalId: varchar("parent_proposal_id"), // For versioning - self-reference
  createdById: varchar("created_by_id").references(() => users.id).notNull(),
  metadata: jsonb("metadata").default({}), // Tracking data, metrics, etc.
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  assignedTasks: many(tasks, { relationName: "assignedTasks" }),
  createdTasks: many(tasks, { relationName: "createdTasks" }),
  timeLogs: many(timeLogs),
  templates: many(templates),
  proposals: many(proposals),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  tasks: many(tasks),
  timeLogs: many(timeLogs),
  proposals: many(proposals),
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
  timeLogs: many(timeLogs),
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

export const timeLogsRelations = relations(timeLogs, ({ one }) => ({
  user: one(users, {
    fields: [timeLogs.userId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [timeLogs.taskId],
    references: [tasks.id],
  }),
  project: one(projects, {
    fields: [timeLogs.projectId],
    references: [projects.id],
  }),
}));

export const templatesRelations = relations(templates, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [templates.createdById],
    references: [users.id],
  }),
  proposals: many(proposals),
}));

export const proposalsRelations = relations(proposals, ({ one }) => ({
  template: one(templates, {
    fields: [proposals.templateId],
    references: [templates.id],
  }),
  project: one(projects, {
    fields: [proposals.projectId],
    references: [projects.id],
  }),
  createdBy: one(users, {
    fields: [proposals.createdById],
    references: [users.id],
  }),
  parentProposal: one(proposals, {
    fields: [proposals.parentProposalId],
    references: [proposals.id],
    relationName: "proposalVersions",
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

// Time Log schemas
export const insertTimeLogSchema = createInsertSchema(timeLogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  startTime: z.union([z.date(), z.string()]).transform(val => {
    if (typeof val === 'string') return new Date(val);
    return val;
  }),
  endTime: z.union([z.date(), z.string(), z.null()]).optional().nullable().transform(val => {
    if (!val) return null;
    if (typeof val === 'string') return new Date(val);
    return val;
  }),
  editHistory: z.array(z.object({
    id: z.string(),
    timestamp: z.string(),
    previousValues: z.record(z.any()),
    editedBy: z.string(),
    reason: z.string(),
  })).optional().default([]),
});

export const updateTimeLogSchema = insertTimeLogSchema.partial();

export const startTimerSchema = z.object({
  taskId: z.string().optional(),
  projectId: z.string().optional(),
  description: z.string().optional(),
});

export const stopTimerSchema = z.object({
  timeLogId: z.string(),
});

// Template schemas - Form builder approach (content is optional since template is built from form fields)
export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  content: z.string().optional(), // Optional since template is built from form fields
  variables: z.array(z.object({
    name: z.string(),
    label: z.string(),
    type: z.enum(["text", "number", "date", "email", "phone", "textarea"]),
    required: z.boolean().default(false),
    defaultValue: z.string().optional(),
    placeholder: z.string().optional(),
  })).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  metadata: z.record(z.any()).optional().default({}),
});

export const updateTemplateSchema = insertTemplateSchema.partial();

// Proposal schemas  
export const insertProposalSchema = createInsertSchema(proposals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  shareableLink: true,
}).extend({
  variables: z.record(z.any()).optional().default({}),
  metadata: z.record(z.any()).optional().default({}),
  expiresAt: z.union([z.date(), z.string()]).optional().transform(val => {
    if (!val) return undefined;
    if (typeof val === 'string') return new Date(val);
    return val;
  }),
});

export const updateProposalSchema = insertProposalSchema.partial();

export const generateProposalSchema = z.object({
  templateId: z.string(),
  title: z.string(),
  projectId: z.string().optional(),
  clientName: z.string().optional(),
  clientEmail: z.string().email().optional(),
  variables: z.record(z.any()).default({}),
  expiresInDays: z.number().min(1).max(365).default(30),
});

export const sendProposalSchema = z.object({
  proposalId: z.string(),
  recipientEmail: z.string().email().optional(),
  subject: z.string().optional(),
  message: z.string().optional(),
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
  timeLogs?: TimeLog[];
};
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;

export type TimeLog = typeof timeLogs.$inferSelect & {
  user?: User;
  task?: Task;
  project?: Project;
};
export type InsertTimeLog = z.infer<typeof insertTimeLogSchema>;
export type UpdateTimeLog = z.infer<typeof updateTimeLogSchema>;
export type StartTimerRequest = z.infer<typeof startTimerSchema>;
export type StopTimerRequest = z.infer<typeof stopTimerSchema>;

export type Template = typeof templates.$inferSelect & {
  createdBy?: User;
  proposals?: Proposal[];
};
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type UpdateTemplate = z.infer<typeof updateTemplateSchema>;

export type Proposal = typeof proposals.$inferSelect & {
  template?: Template;
  project?: Project;
  createdBy?: User;
  parentProposal?: Proposal;
};
export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type UpdateProposal = z.infer<typeof updateProposalSchema>;
export type GenerateProposalRequest = z.infer<typeof generateProposalSchema>;
export type SendProposalRequest = z.infer<typeof sendProposalSchema>;
