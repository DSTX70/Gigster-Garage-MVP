import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
  decimal,
  primaryKey,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  role: varchar("role", { enum: ["admin", "user"] }).default("user"),
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(),
  hasCompletedOnboarding: boolean("has_completed_onboarding").default(false),
  emailNotifications: boolean("email_notifications").default(true),
  smsNotifications: boolean("sms_notifications").default(false),
  phoneNumber: varchar("phone_number"),
  name: varchar("name"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  notificationEmail: varchar("notification_email"),
  phone: varchar("phone"),
  emailOptIn: boolean("email_opt_in").default(true),
  smsOptIn: boolean("sms_opt_in").default(false),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Projects table
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  status: varchar("status", { enum: ["active", "completed", "on-hold", "cancelled"] }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  color: varchar("color"),
  timeline: text("timeline"),
  clientId: varchar("client_id").references(() => clients.id),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// Client Management
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  company: varchar("company"),
  address: text("address"),
  website: varchar("website"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  status: varchar("status", { enum: ["active", "inactive", "prospect"] }).default("prospect"),
  totalProposals: integer("total_proposals").default(0),
  totalInvoices: integer("total_invoices").default(0),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).default("0.00"),
  outstandingBalance: decimal("outstanding_balance", { precision: 10, scale: 2 }).default("0.00"),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// Client Documents
export const clientDocuments = pgTable("client_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").references(() => clients.id).notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  type: varchar("type", { enum: ["proposal", "invoice", "contract", "presentation", "report", "agreement", "other"] }).notNull(),
  fileUrl: varchar("file_url").notNull(),
  fileName: varchar("file_name").notNull(),
  fileSize: integer("file_size"), // in bytes
  mimeType: varchar("mime_type"),
  version: integer("version").default(1),
  status: varchar("status", { enum: ["draft", "active", "archived", "expired"] }).default("active"),
  tags: jsonb("tags").$type<string[]>().default([]),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  uploadedById: varchar("uploaded_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ClientDocument = typeof clientDocuments.$inferSelect;
export type InsertClientDocument = typeof clientDocuments.$inferInsert;

// Enhanced Proposals  
export const proposals: any = pgTable("proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  templateId: varchar("template_id").references(() => templates.id),
  projectId: varchar("project_id").references(() => projects.id),
  clientId: varchar("client_id").references(() => clients.id),
  clientName: varchar("client_name"),
  clientEmail: varchar("client_email"),
  status: varchar("status", { enum: ["draft", "sent", "accepted", "rejected", "expired"] }).default("draft"),
  content: text("content"),
  variables: jsonb("variables").$type<Record<string, any>>().default({}),
  projectDescription: text("project_description"),
  totalBudget: decimal("total_budget", { precision: 10, scale: 2 }).default("0.00"),
  timeline: varchar("timeline"),
  deliverables: text("deliverables"),
  terms: text("terms"),
  lineItems: jsonb("line_items").$type<LineItem[]>().default([]),
  calculatedTotal: decimal("calculated_total", { precision: 10, scale: 2 }).default("0.00"),
  expiresInDays: integer("expires_in_days").default(30),
  expirationDate: date("expiration_date"),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  respondedAt: timestamp("responded_at"),
  expiresAt: timestamp("expires_at"),
  responseMessage: text("response_message"),
  shareableLink: varchar("shareable_link").unique(),
  version: integer("version").default(1),
  parentProposalId: varchar("parent_proposal_id").references((): any => proposals.id),
  createdById: varchar("created_by_id").references(() => users.id),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
});

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = typeof proposals.$inferInsert;

// Enhanced Invoices with payment tracking
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: varchar("invoice_number").notNull().unique(),
  proposalId: varchar("proposal_id").references(() => proposals.id),
  projectId: varchar("project_id").references(() => projects.id),
  clientId: varchar("client_id").references(() => clients.id),
  clientName: varchar("client_name"),
  clientEmail: varchar("client_email"),
  clientAddress: text("client_address"),
  status: varchar("status", { enum: ["draft", "sent", "paid", "overdue", "cancelled"] }).default("draft"),
  invoiceDate: date("invoice_date"),
  dueDate: date("due_date"),
  lineItems: jsonb("line_items").$type<LineItem[]>().default([]),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).default("0.00"),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0.00"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0.00"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0.00"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).default("0.00"),
  depositRequired: decimal("deposit_required", { precision: 10, scale: 2 }).default("0.00"),
  depositPaid: decimal("deposit_paid", { precision: 10, scale: 2 }).default("0.00"),
  amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }).default("0.00"),
  balanceDue: decimal("balance_due", { precision: 10, scale: 2 }).default("0.00"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  sentAt: timestamp("sent_at"),
  paidAt: timestamp("paid_at"),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

// Payment tracking
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").references(() => invoices.id),
  clientId: varchar("client_id").references(() => clients.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: date("payment_date").notNull(),
  paymentMethod: varchar("payment_method", { enum: ["cash", "check", "credit_card", "bank_transfer", "paypal", "stripe", "other"] }),
  reference: varchar("reference"),
  notes: text("notes"),
  isDeposit: boolean("is_deposit").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// Tasks table with enhanced features
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  status: varchar("status", { enum: ["pending", "active", "high", "critical", "completed"] }).default("pending"),
  priority: varchar("priority", { enum: ["low", "medium", "high"] }).default("medium"),
  dueDate: timestamp("due_date"),
  dueTime: varchar("due_time"),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  projectId: varchar("project_id").references(() => projects.id),
  assignedToId: varchar("assigned_to_id").references(() => users.id),
  createdById: varchar("created_by_id").references(() => users.id),
  notes: text("notes"),
  attachments: jsonb("attachments").$type<string[]>().default([]),
  links: jsonb("links").$type<string[]>().default([]),
  parentTaskId: varchar("parent_task_id"),
  progress: jsonb("progress").$type<Array<{ date: string; comment: string; }>>().default([]),
  progressNotes: jsonb("progress_notes").$type<Array<{ id: string; date: string; comment: string; createdAt: string; }>>().default([]),
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours"),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// Templates table
export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  type: varchar("type", { enum: ["proposal", "invoice", "contract", "presentation", "email"] }).notNull(),
  variables: jsonb("variables").$type<TemplateVariable[]>().default([]),
  content: text("content"),
  isSystem: boolean("is_system").default(false),
  isPublic: boolean("is_public").default(false),
  tags: jsonb("tags").$type<string[]>().default([]),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdById: varchar("created_by_id").references(() => users.id),
});

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = typeof templates.$inferInsert;

// Task Dependencies (junction table)
export const taskDependencies = pgTable("task_dependencies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dependentTaskId: varchar("dependent_task_id").references(() => tasks.id),
  dependsOnTaskId: varchar("depends_on_task_id").references(() => tasks.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export type TaskDependency = typeof taskDependencies.$inferSelect;
export type InsertTaskDependency = typeof taskDependencies.$inferInsert;

// Time logs table for time tracking
export const timeLogs = pgTable("time_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  taskId: varchar("task_id").references(() => tasks.id),
  projectId: varchar("project_id").references(() => projects.id),
  description: text("description").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: varchar("duration"), // Duration in seconds as string
  isActive: boolean("is_active").default(false),
  isManualEntry: boolean("is_manual_entry").default(false),
  editHistory: jsonb("edit_history").$type<Array<{ timestamp: string; changes: Record<string, any>; }>>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type TimeLog = typeof timeLogs.$inferSelect;
export type InsertTimeLog = typeof timeLogs.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdTasks: many(tasks, { relationName: "createdTasks" }),
  assignedTasks: many(tasks, { relationName: "assignedTasks" }),
  templates: many(templates),
}));

export const projectsRelations = relations(projects, ({ many, one }) => ({
  tasks: many(tasks),
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
  proposals: many(proposals),
  invoices: many(invoices),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  projects: many(projects),
  proposals: many(proposals),
  invoices: many(invoices),
  payments: many(payments),
  documents: many(clientDocuments),
}));

export const proposalsRelations = relations(proposals, ({ one, many }) => ({
  project: one(projects, {
    fields: [proposals.projectId],
    references: [projects.id],
  }),
  client: one(clients, {
    fields: [proposals.clientId],
    references: [clients.id],
  }),
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  proposal: one(proposals, {
    fields: [invoices.proposalId],
    references: [proposals.id],
  }),
  project: one(projects, {
    fields: [invoices.projectId],
    references: [projects.id],
  }),
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
  client: one(clients, {
    fields: [payments.clientId],
    references: [clients.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
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
  parentTask: one(tasks, {
    fields: [tasks.parentTaskId],
    references: [tasks.id],
    relationName: "parentTask",
  }),
  subtasks: many(tasks, { relationName: "parentTask" }),
  dependents: many(taskDependencies, { relationName: "dependsOn" }),
  dependencies: many(taskDependencies, { relationName: "dependent" }),
}));

export const templatesRelations = relations(templates, ({ one }) => ({
  createdBy: one(users, {
    fields: [templates.createdById],
    references: [users.id],
  }),
}));

export const taskDependenciesRelations = relations(taskDependencies, ({ one }) => ({
  dependentTask: one(tasks, {
    fields: [taskDependencies.dependentTaskId],
    references: [tasks.id],
    relationName: "dependent",
  }),
  dependsOnTask: one(tasks, {
    fields: [taskDependencies.dependsOnTaskId],
    references: [tasks.id],
    relationName: "dependsOn",
  }),
}));

export const clientDocumentsRelations = relations(clientDocuments, ({ one }) => ({
  client: one(clients, {
    fields: [clientDocuments.clientId],
    references: [clients.id],
  }),
  uploadedBy: one(users, {
    fields: [clientDocuments.uploadedById],
    references: [users.id],
  }),
}));

// Type definitions
export interface LineItem {
  id: number;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface TemplateVariable {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'email' | 'phone' | 'line_items';
  required: boolean;
  placeholder?: string;
  defaultValue?: any;
}

export interface GenerateProposalRequest {
  templateId: string;
  title: string;
  projectId?: string;
  clientName: string;
  clientEmail: string;
  variables: Record<string, any>;
  expiresInDays: number;
}

// Create Zod schemas for validation
export const insertTaskSchema = createInsertSchema(tasks, {
  dueDate: z.union([
    z.string().transform((val) => new Date(val)),
    z.date(),
    z.null(),
  ]).optional().nullable(),
  progress: z.array(z.object({
    date: z.string(),
    comment: z.string()
  })).optional().nullable(),
  attachments: z.array(z.string()).optional(),
  links: z.array(z.string()).optional(),
});
export const selectTaskSchema = createSelectSchema(tasks);
export const taskSchema = insertTaskSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const insertProjectSchema = createInsertSchema(projects);
export const selectProjectSchema = createSelectSchema(projects);
export const projectSchema = insertProjectSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const insertClientSchema = createInsertSchema(clients);
export const selectClientSchema = createSelectSchema(clients);
export const clientSchema = insertClientSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const insertProposalSchema = createInsertSchema(proposals);
export const selectProposalSchema = createSelectSchema(proposals);
export const proposalSchema = insertProposalSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const insertInvoiceSchema = createInsertSchema(invoices);
export const selectInvoiceSchema = createSelectSchema(invoices);
export const invoiceSchema = insertInvoiceSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const insertPaymentSchema = createInsertSchema(payments);
export const selectPaymentSchema = createSelectSchema(payments);
export const paymentSchema = insertPaymentSchema.omit({ id: true, createdAt: true });

export const insertTemplateSchema = createInsertSchema(templates);
export const selectTemplateSchema = createSelectSchema(templates);
export const templateSchema = insertTemplateSchema.omit({ id: true, createdAt: true, updatedAt: true });

// User schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const userSchema = insertUserSchema.omit({ id: true, createdAt: true, updatedAt: true });

// Client Document schemas
export const insertClientDocumentSchema = createInsertSchema(clientDocuments);
export const selectClientDocumentSchema = createSelectSchema(clientDocuments);
export const clientDocumentSchema = insertClientDocumentSchema.omit({ id: true, createdAt: true, updatedAt: true });

// Additional schemas needed by routes
export const updateTaskSchema = insertTaskSchema.partial();
export const updateTemplateSchema = insertTemplateSchema.partial();
export const updateProposalSchema = insertProposalSchema.partial();
export const updateTimeLogSchema = z.object({
  endTime: z.date().optional(),
  duration: z.string().optional(),
  isActive: z.boolean().optional(),
  description: z.string().optional()
});

// Timer schemas
export const startTimerSchema = z.object({
  taskId: z.string().optional(),
  projectId: z.string().optional(),
  description: z.string().min(1, "Description is required")
});

export const stopTimerSchema = z.object({
  timeLogId: z.string().min(1, "Time log ID is required")
});

// Onboarding schema
export const onboardingSchema = z.object({
  notificationEmail: z.string().email().optional(),
  phone: z.string().optional(),
  emailOptIn: z.boolean().default(true),
  smsOptIn: z.boolean().default(false),
  hasCompletedOnboarding: z.boolean().default(true)
});

// Proposal generation schema
export const generateProposalSchema = z.object({
  templateId: z.string(),
  title: z.string(),
  projectId: z.string().optional(),
  clientName: z.string(),
  clientEmail: z.string().email(),
  variables: z.record(z.any()),
  expiresInDays: z.number().min(1).default(30)
});

// Direct proposal creation schema (for form-based proposals)
export const directProposalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  projectId: z.string().optional(),
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Valid email is required"),
  projectDescription: z.string().optional(),
  totalBudget: z.number().min(0).default(0),
  timeline: z.string().optional(),
  deliverables: z.string().optional(),
  terms: z.string().optional(),
  lineItems: z.array(z.object({
    id: z.number(),
    description: z.string(),
    quantity: z.number().min(0),
    rate: z.number().min(0),
    amount: z.number().min(0)
  })).default([]),
  calculatedTotal: z.number().min(0).default(0),
  expiresInDays: z.number().min(1).default(30)
});

// Send proposal schema
export const sendProposalSchema = z.object({
  proposalId: z.string(),
  clientEmail: z.string().email(),
  message: z.string().optional()
});

// Update types for storage interface
export type UpdateTask = Partial<InsertTask>;
export type UpdateTemplate = Partial<InsertTemplate>;
export type UpdateProposal = Partial<InsertProposal>;
export type UpdateTimeLog = Partial<InsertTimeLog>;

// Extended types with relations for joined queries
export interface TaskWithRelations extends Task {
  assignedTo?: User;
  project?: Project;
  subtasks?: Task[];
}

export interface TemplateWithRelations extends Template {
  createdBy?: User;
}

export interface ProposalWithRelations extends Proposal {
  template?: Template;
  project?: Project;
  createdBy?: User;
}

export interface TimeLogWithRelations extends TimeLog {
  user?: User;
  task?: Task;
  project?: Project;
}

export type InsertTaskData = z.infer<typeof taskSchema>;
export type InsertProjectData = z.infer<typeof projectSchema>;
export type InsertClientData = z.infer<typeof clientSchema>;
export type InsertProposalData = z.infer<typeof proposalSchema>;
export type InsertInvoiceData = z.infer<typeof invoiceSchema>;
export type InsertPaymentData = z.infer<typeof paymentSchema>;
export type InsertTemplateData = z.infer<typeof templateSchema>;
export type InsertUserData = z.infer<typeof userSchema>;