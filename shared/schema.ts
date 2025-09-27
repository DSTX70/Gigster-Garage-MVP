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
  // Demo session fields
  isDemo: boolean("is_demo").default(false),
  demoSessionId: varchar("demo_session_id"),
  sessionExpiresAt: timestamp("session_expires_at"),
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
  // Demo session fields for data isolation
  isDemo: boolean("is_demo").default(false),
  demoSessionId: varchar("demo_session_id"),
  demoUserId: varchar("demo_user_id"),
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
  // Demo session fields for data isolation
  isDemo: boolean("is_demo").default(false),
  demoSessionId: varchar("demo_session_id"),
  demoUserId: varchar("demo_user_id"),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// Client Documents
export const clientDocuments = pgTable("client_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").references(() => clients.id),
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
  // Demo session fields for data isolation
  isDemo: boolean("is_demo").default(false),
  demoSessionId: varchar("demo_session_id"),
  demoUserId: varchar("demo_user_id"),
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
  status: varchar("status", { enum: ["draft", "sent", "viewed", "accepted", "rejected", "revision_requested", "expired"] }).default("draft"),
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
  // Demo session fields for data isolation
  isDemo: boolean("is_demo").default(false),
  demoSessionId: varchar("demo_session_id"),
  demoUserId: varchar("demo_user_id"),
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
  // Payment link fields
  paymentLink: varchar("payment_link").unique(),
  paymentLinkExpiresAt: timestamp("payment_link_expires_at"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  createdById: varchar("created_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  sentAt: timestamp("sent_at"),
  paidAt: timestamp("paid_at"),
  // Demo session fields for data isolation
  isDemo: boolean("is_demo").default(false),
  demoSessionId: varchar("demo_session_id"),
  demoUserId: varchar("demo_user_id"),
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
  // Demo session fields for data isolation
  isDemo: boolean("is_demo").default(false),
  demoSessionId: varchar("demo_session_id"),
  demoUserId: varchar("demo_user_id"),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

export const insertPaymentSchema = createInsertSchema(payments, {
  paymentDate: z.union([
    z.string().transform((val) => new Date(val)),
    z.date(),
  ]),
  amount: z.union([
    z.string().transform((val) => val),
    z.number().transform((val) => val.toString()),
  ]),
});

// Enhanced Contracts with comprehensive legal document management
export const contracts = pgTable("contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractNumber: varchar("contract_number").notNull().unique(),
  title: varchar("title").notNull(),
  templateId: varchar("template_id").references(() => templates.id),
  proposalId: varchar("proposal_id").references(() => proposals.id),
  projectId: varchar("project_id").references(() => projects.id),
  clientId: varchar("client_id").references(() => clients.id),
  clientName: varchar("client_name"),
  clientEmail: varchar("client_email"),
  status: varchar("status", { 
    enum: ["draft", "sent", "viewed", "pending_signature", "partially_signed", "fully_signed", "executed", "expired", "terminated", "amended"] 
  }).default("draft"),
  contractType: varchar("contract_type", { 
    enum: ["service_agreement", "nda", "employment", "vendor", "licensing", "consulting", "maintenance", "custom"] 
  }).notNull(),
  content: text("content"),
  variables: jsonb("variables").$type<Record<string, any>>().default({}),
  
  // Financial terms
  contractValue: decimal("contract_value", { precision: 10, scale: 2 }).default("0.00"),
  paymentTerms: text("payment_terms"),
  currency: varchar("currency", { enum: ["USD", "EUR", "GBP", "CAD"] }).default("USD"),
  
  // Contract lifecycle dates
  effectiveDate: date("effective_date"),
  expirationDate: date("expiration_date"),
  renewalDate: date("renewal_date"),
  terminationDate: date("termination_date"),
  
  // Signature tracking
  requiresSignature: boolean("requires_signature").default(true),
  signatureType: varchar("signature_type", { enum: ["digital", "wet", "both"] }).default("digital"),
  businessSignedAt: timestamp("business_signed_at"),
  businessSignedBy: varchar("business_signed_by").references(() => users.id),
  clientSignedAt: timestamp("client_signed_at"),
  clientSignedBy: varchar("client_signed_by"), // External client signer
  witnessRequired: boolean("witness_required").default(false),
  witnessSignedAt: timestamp("witness_signed_at"),
  witnessSignedBy: varchar("witness_signed_by"),
  
  // Document management
  shareableLink: varchar("shareable_link").unique(),
  documentPath: varchar("document_path"), // Object storage path
  signedDocumentPath: varchar("signed_document_path"), // Final signed version
  version: integer("version").default(1),
  parentContractId: varchar("parent_contract_id").references((): any => contracts.id),
  
  // Workflow tracking
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  lastReminderSent: timestamp("last_reminder_sent"),
  reminderCount: integer("reminder_count").default(0),
  
  // Legal and compliance
  governingLaw: varchar("governing_law").default("United States"),
  jurisdiction: varchar("jurisdiction"),
  confidentialityLevel: varchar("confidentiality_level", { enum: ["public", "internal", "confidential", "highly_confidential"] }).default("confidential"),
  
  // Business logic fields
  autoRenewal: boolean("auto_renewal").default(false),
  renewalPeriod: integer("renewal_period"), // in days
  noticePeriod: integer("notice_period").default(30), // days before expiration to send notice
  tags: jsonb("tags").$type<string[]>().default([]),
  notes: text("notes"),
  internalNotes: text("internal_notes"), // Private notes not visible to client
  
  // Metadata and audit
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdById: varchar("created_by_id").references(() => users.id),
  lastModifiedById: varchar("last_modified_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Demo session fields for data isolation
  isDemo: boolean("is_demo").default(false),
  demoSessionId: varchar("demo_session_id"),
  demoUserId: varchar("demo_user_id"),
});

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = typeof contracts.$inferInsert;

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
  // Demo session fields for data isolation
  isDemo: boolean("is_demo").default(false),
  demoSessionId: varchar("demo_session_id"),
  demoUserId: varchar("demo_user_id"),
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
  // Demo session fields for data isolation
  isDemo: boolean("is_demo").default(false),
  demoSessionId: varchar("demo_session_id"),
  demoUserId: varchar("demo_user_id"),
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
  approvalStatus: varchar("approval_status", { enum: ["pending", "approved", "rejected"] }).default("pending"),
  isSelectedForInvoice: boolean("is_selected_for_invoice").default(false),
  invoiceId: varchar("invoice_id").references(() => invoices.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Demo session fields for data isolation
  isDemo: boolean("is_demo").default(false),
  demoSessionId: varchar("demo_session_id"),
  demoUserId: varchar("demo_user_id"),
});

export type TimeLog = typeof timeLogs.$inferSelect;
export type InsertTimeLog = typeof timeLogs.$inferInsert;

// File Attachments table for tasks and projects
export const fileAttachments = pgTable("file_attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fileName: varchar("file_name").notNull(),
  originalName: varchar("original_name").notNull(),
  filePath: varchar("file_path").notNull(), // Object storage path
  fileSize: integer("file_size"), // in bytes
  mimeType: varchar("mime_type"),
  entityType: varchar("entity_type", { enum: ["task", "project", "client"] }).notNull(),
  entityId: varchar("entity_id").notNull(),
  uploadedById: varchar("uploaded_by_id").references(() => users.id).notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false),
  version: integer("version").default(1),
  parentFileId: varchar("parent_file_id"), // For version control
  tags: jsonb("tags").$type<string[]>().default([]),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Demo session fields for data isolation
  isDemo: boolean("is_demo").default(false),
  demoSessionId: varchar("demo_session_id"),
  demoUserId: varchar("demo_user_id"),
});

export type FileAttachment = typeof fileAttachments.$inferSelect;
export type InsertFileAttachment = typeof fileAttachments.$inferInsert;

// Document Versions table for enhanced version control
export const documentVersions = pgTable("document_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull(), // References file_attachments or client_documents
  versionNumber: integer("version_number").notNull(),
  fileName: varchar("file_name").notNull(),
  filePath: varchar("file_path").notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type"),
  changes: text("changes"), // Description of changes
  uploadedById: varchar("uploaded_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  // Demo session fields for data isolation
  isDemo: boolean("is_demo").default(false),
  demoSessionId: varchar("demo_session_id"),
  demoUserId: varchar("demo_user_id"),
});

export type DocumentVersion = typeof documentVersions.$inferSelect;
export type InsertDocumentVersion = typeof documentVersions.$inferInsert;

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
  invoice: one(invoices, {
    fields: [timeLogs.invoiceId],
    references: [invoices.id],
  }),
  approvedByUser: one(users, {
    fields: [timeLogs.approvedBy],
    references: [users.id],
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

export const fileAttachmentsRelations = relations(fileAttachments, ({ one, many }) => ({
  uploadedBy: one(users, {
    fields: [fileAttachments.uploadedById],
    references: [users.id],
  }),
  parentFile: one(fileAttachments, {
    fields: [fileAttachments.parentFileId],
    references: [fileAttachments.id],
    relationName: "fileVersions",
  }),
  versions: many(fileAttachments, { relationName: "fileVersions" }),
}));

export const documentVersionsRelations = relations(documentVersions, ({ one }) => ({
  uploadedBy: one(users, {
    fields: [documentVersions.uploadedById],
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

export const insertClientSchema = createInsertSchema(clients, {
  name: z.string().min(1, "Client name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address").optional().nullable(),
  company: z.string().max(150, "Company name must be less than 150 characters").optional().nullable(),
  phone: z.string().regex(/^[\+]?[\d\s\-\(\)]{7,20}$/, "Please enter a valid phone number").optional().nullable(),
  address: z.string().max(500, "Address must be less than 500 characters").optional().nullable(),
  website: z.string().url("Please enter a valid website URL").or(z.literal("")).optional().nullable(),
  status: z.enum(["active", "inactive", "prospect"], {
    errorMap: () => ({ message: "Please select a valid client status" })
  }).default("prospect"),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional().nullable(),
});
export const selectClientSchema = createSelectSchema(clients);
export const clientSchema = insertClientSchema.omit({ id: true, createdAt: true, updatedAt: true });

const baseInsertProposalSchema = createInsertSchema(proposals, {
  title: z.string().min(1, "Proposal title is required").max(200, "Title must be less than 200 characters"),
  clientName: z.string().min(1, "Client name is required").max(100, "Client name must be less than 100 characters"),
  clientEmail: z.string().email("Please enter a valid email address"),
  content: z.string().min(10, "Proposal content must be at least 10 characters"),
  status: z.enum(["draft", "sent", "viewed", "accepted", "rejected", "expired"], {
    errorMap: () => ({ message: "Please select a valid proposal status" })
  }).default("draft"),
  totalBudget: z.number().min(0, "Budget cannot be negative").optional().nullable(),
  timeline: z.string().max(100, "Timeline must be less than 100 characters").optional().nullable(),
  expirationDate: z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    z.date().transform((val) => val.toISOString().split('T')[0]),
  ]).optional().nullable(),
  deliverables: z.string().max(2000, "Deliverables must be less than 2000 characters").optional().nullable(),
  terms: z.string().max(2000, "Terms must be less than 2000 characters").optional().nullable(),
});

export const insertProposalSchema = baseInsertProposalSchema.refine((data) => {
  // Custom validation: expiration date must be in the future
  if (data.expirationDate && typeof data.expirationDate === 'string') {
    return new Date(data.expirationDate) > new Date();
  }
  return true;
}, {
  message: "Expiration date must be in the future",
  path: ["expirationDate"]
});

export const selectProposalSchema = createSelectSchema(proposals);
export const proposalSchema = baseInsertProposalSchema.omit({ id: true, createdAt: true, updatedAt: true });

const baseInsertInvoiceSchema = createInsertSchema(invoices, {
  invoiceNumber: z.string().min(1, "Invoice number is required").max(50, "Invoice number too long"),
  clientName: z.string().min(1, "Client name is required").max(100, "Client name too long").optional(),
  clientEmail: z.string().email("Invalid email format").optional().nullable(),
  clientAddress: z.string().max(500, "Address too long").optional().nullable(),
  status: z.enum(["draft", "sent", "viewed", "paid", "overdue", "cancelled"], {
    errorMap: () => ({ message: "Please select a valid invoice status" })
  }).default("draft"),
  invoiceDate: z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    z.date().transform((val) => val.toISOString().split('T')[0]),
    z.literal("").transform(() => undefined),
  ]).optional(),
  dueDate: z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    z.date().transform((val) => val.toISOString().split('T')[0]),
    z.literal("").transform(() => undefined),
  ]).optional(),
  subtotal: z.union([
    z.string().regex(/^\d+\.?\d*$/, "Subtotal must be a valid number"),
    z.number().transform((val) => val.toString()),
  ]).optional(),
  taxRate: z.union([
    z.string().regex(/^\d+\.?\d*$/, "Tax rate must be a valid number"),
    z.number().min(0).max(100).transform((val) => val.toString()),
  ]).optional(),
  taxAmount: z.union([
    z.string().regex(/^\d+\.?\d*$/, "Tax amount must be a valid number"),
    z.number().transform((val) => val.toString()),
  ]).optional(),
  discountAmount: z.union([
    z.string().regex(/^\d+\.?\d*$/, "Discount amount must be a valid number"),
    z.number().transform((val) => val.toString()),
  ]).optional(),
  totalAmount: z.union([
    z.string().regex(/^\d+\.?\d*$/, "Total amount must be a valid number"),
    z.number().transform((val) => val.toString()),
  ]).optional(),
  lineItems: z.array(z.object({
    id: z.number().min(1, "Line item id is required"),
    description: z.string().min(1, "Item description is required"),
    quantity: z.number().min(0.01, "Quantity must be greater than 0"),
    rate: z.number().min(0, "Rate cannot be negative"),
    amount: z.number().min(0, "Amount cannot be negative")
  })).optional(),
});

export const insertInvoiceSchema = baseInsertInvoiceSchema.omit({
  id: true,
  createdById: true, // Backend sets this automatically from authenticated user
  createdAt: true,
  updatedAt: true
}).refine((data) => {
  // Custom validation: due date must be after invoice date
  if (data.invoiceDate && data.dueDate) {
    return new Date(data.dueDate) >= new Date(data.invoiceDate);
  }
  return true;
}, {
  message: "Due date must be on or after invoice date",
  path: ["dueDate"]
});

export const selectInvoiceSchema = createSelectSchema(invoices);
export const invoiceSchema = baseInsertInvoiceSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const selectPaymentSchema = createSelectSchema(payments);
export const paymentSchema = insertPaymentSchema.omit({ id: true, createdAt: true });

const baseInsertContractSchema = createInsertSchema(contracts, {
  title: z.string().min(1, "Contract title is required").max(200, "Title must be less than 200 characters"),
  contractNumber: z.string().optional(),
  clientName: z.string().min(1, "Client name is required").max(100, "Client name must be less than 100 characters"),
  clientEmail: z.string().email("Invalid email format").optional().nullable(),
  contractType: z.enum(["service", "product", "recurring", "one_time"], {
    errorMap: () => ({ message: "Please select a valid contract type" })
  }).default("service"),
  contractValue: z.union([
    z.string().regex(/^\d+\.?\d*$/, "Contract value must be a valid number"),
    z.number().min(0, "Contract value cannot be negative").transform((val) => val.toString()),
  ]).optional(),
  currency: z.string().length(3, "Currency must be a 3-letter code (e.g., USD)").default("USD"),
  effectiveDate: z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    z.date().transform((val) => val.toISOString().split('T')[0]),
  ]).optional().nullable(),
  expirationDate: z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    z.date().transform((val) => val.toISOString().split('T')[0]),
  ]).optional().nullable(),
  renewalDate: z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    z.date().transform((val) => val.toISOString().split('T')[0]),
  ]).optional().nullable(),
  terminationDate: z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    z.date().transform((val) => val.toISOString().split('T')[0]),
  ]).optional().nullable(),
});

export const insertContractSchema = baseInsertContractSchema.refine((data) => {
  // Custom validation: expiration date must be after effective date
  if (data.effectiveDate && data.expirationDate) {
    return new Date(data.expirationDate) > new Date(data.effectiveDate);
  }
  return true;
}, {
  message: "Expiration date must be after effective date",
  path: ["expirationDate"]
});

export const selectContractSchema = createSelectSchema(contracts);
export const contractSchema = baseInsertContractSchema.omit({ id: true, createdAt: true, updatedAt: true });

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

// File Attachment schemas
export const insertFileAttachmentSchema = createInsertSchema(fileAttachments);
export const selectFileAttachmentSchema = createSelectSchema(fileAttachments);
export const fileAttachmentSchema = insertFileAttachmentSchema.omit({ id: true, createdAt: true, updatedAt: true });

// Document Version schemas
export const insertDocumentVersionSchema = createInsertSchema(documentVersions);
export const selectDocumentVersionSchema = createSelectSchema(documentVersions);
export const documentVersionSchema = insertDocumentVersionSchema.omit({ id: true, createdAt: true });

// Additional schemas needed by routes
export const updateTaskSchema = insertTaskSchema.partial();
export const updateTemplateSchema = insertTemplateSchema.partial();
export const updateProposalSchema = baseInsertProposalSchema.partial();
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
  description: z.string().optional()
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

// Messages table for internal messaging system
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").references(() => users.id).notNull(),
  toUserId: varchar("to_user_id").references(() => users.id),
  toEmail: varchar("to_email"), // For external recipients
  subject: varchar("subject").notNull(),
  content: text("content").notNull(),
  priority: varchar("priority", { enum: ["low", "medium", "high"] }).default("medium"),
  attachments: jsonb("attachments").$type<{
    id: string;
    filename: string;
    size: number;
    type: string;
    url: string;
  }[]>().default([]),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// Message relations
export const messageRelations = relations(messages, ({ one }) => ({
  fromUser: one(users, {
    fields: [messages.fromUserId],
    references: [users.id],
  }),
  toUser: one(users, {
    fields: [messages.toUserId],
    references: [users.id],
  }),
}));

// Message schemas for validation
export const insertMessageSchema = createInsertSchema(messages, {
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Content is required"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  attachments: z.array(z.object({
    id: z.string(),
    filename: z.string(),
    size: z.number(),
    type: z.string(),
    url: z.string(),
  })).default([]),
}).omit({
  id: true,
  fromUserId: true, // Server sets this from authenticated user
  isRead: true,
  readAt: true,
  createdAt: true,
  updatedAt: true,
});

export const selectMessageSchema = createSelectSchema(messages);

// Message with relations type
export interface MessageWithRelations extends Message {
  fromUser?: User;
  toUser?: User;
}

export type InsertMessageData = z.infer<typeof insertMessageSchema>;

// Custom Field Definitions - User-defined fields for entities
export const customFieldDefinitions = pgTable("custom_field_definitions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  label: varchar("label").notNull(),
  type: varchar("type", { enum: ["text", "textarea", "number", "date", "boolean", "select", "multiselect"] }).notNull(),
  entityType: varchar("entity_type", { enum: ["task", "project", "client"] }).notNull(),
  options: jsonb("options").$type<string[]>().default([]), // For select/multiselect fields
  required: boolean("required").default(false),
  defaultValue: text("default_value"),
  validation: jsonb("validation").$type<Record<string, any>>().default({}),
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true),
  createdById: varchar("created_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type CustomFieldDefinition = typeof customFieldDefinitions.$inferSelect;
export type InsertCustomFieldDefinition = typeof customFieldDefinitions.$inferInsert;

// Custom Field Values - Actual values for custom fields
export const customFieldValues = pgTable("custom_field_values", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fieldId: varchar("field_id").references(() => customFieldDefinitions.id, { onDelete: "cascade" }).notNull(),
  entityType: varchar("entity_type", { enum: ["task", "project", "client"] }).notNull(),
  entityId: varchar("entity_id").notNull(), // References the actual entity ID
  value: jsonb("value"), // Stores any type of value
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type CustomFieldValue = typeof customFieldValues.$inferSelect;
export type InsertCustomFieldValue = typeof customFieldValues.$inferInsert;

// Workflow Rules - Rule-based automation
export const workflowRules = pgTable("workflow_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  entityType: varchar("entity_type", { enum: ["task", "project", "client"] }).notNull(),
  trigger: jsonb("trigger").$type<{
    event: string; // "created", "updated", "status_changed", "due_date_approaching", etc.
    conditions: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
  }>().notNull(),
  actions: jsonb("actions").$type<Array<{
    type: string; // "send_email", "create_task", "update_status", "assign_user", etc.
    config: Record<string, any>;
  }>>().notNull(),
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(0),
  createdById: varchar("created_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type WorkflowRule = typeof workflowRules.$inferSelect;
export type InsertWorkflowRule = typeof workflowRules.$inferInsert;

// Workflow Execution Log - Track automation executions
export const workflowExecutions = pgTable("workflow_executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ruleId: varchar("rule_id").references(() => workflowRules.id, { onDelete: "cascade" }).notNull(),
  entityType: varchar("entity_type").notNull(),
  entityId: varchar("entity_id").notNull(),
  status: varchar("status", { enum: ["success", "failed", "partial"] }).notNull(),
  result: jsonb("result").$type<{
    executedActions: number;
    failedActions: number;
    errors: string[];
    details: Record<string, any>;
  }>(),
  executedAt: timestamp("executed_at").defaultNow(),
});

export type WorkflowExecution = typeof workflowExecutions.$inferSelect;
export type InsertWorkflowExecution = typeof workflowExecutions.$inferInsert;

// Comments - Team collaboration on entities  
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: varchar("entity_type", { enum: ["task", "project", "client"] }).notNull(),
  entityId: varchar("entity_id").notNull(),
  content: text("content").notNull(),
  authorId: varchar("author_id").references(() => users.id).notNull(),
  parentId: varchar("parent_id"), // Self-reference for threaded comments
  mentions: jsonb("mentions").$type<string[]>().default([]), // User IDs mentioned in comment
  attachments: jsonb("attachments").$type<Array<{
    id: string;
    filename: string;
    url: string;
    size: number;
    type: string;
  }>>().default([]),
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

// Activity Feed - Track all system activities
export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type").notNull(), // "task_created", "task_updated", "comment_added", etc.
  entityType: varchar("entity_type", { enum: ["task", "project", "client", "user"] }).notNull(),
  entityId: varchar("entity_id").notNull(),
  actorId: varchar("actor_id").references(() => users.id).notNull(),
  data: jsonb("data").$type<Record<string, any>>().default({}), // Activity-specific data
  description: text("description").notNull(), // Human-readable description
  isPrivate: boolean("is_private").default(false), // Whether activity is private to actor
  createdAt: timestamp("created_at").defaultNow(),
});

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

// API Keys - Third-party integrations
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  key: varchar("key").unique().notNull(), // The actual API key
  hashedKey: varchar("hashed_key").notNull(), // Hashed version for security
  prefix: varchar("prefix", { length: 8 }).notNull(), // First 8 chars for identification
  permissions: jsonb("permissions").$type<string[]>().notNull(), // ["read:tasks", "write:projects", etc.]
  rateLimit: integer("rate_limit").default(1000), // Requests per hour
  isActive: boolean("is_active").default(true),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  createdById: varchar("created_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

// API Usage Tracking
export const apiUsage = pgTable("api_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  keyId: varchar("key_id").references(() => apiKeys.id, { onDelete: "cascade" }).notNull(),
  method: varchar("method").notNull(), // GET, POST, etc.
  endpoint: varchar("endpoint").notNull(), // /api/tasks, etc.
  statusCode: integer("status_code").notNull(),
  responseTime: integer("response_time"), // in milliseconds
  userAgent: varchar("user_agent"),
  ipAddress: varchar("ip_address"),
  requestedAt: timestamp("requested_at").defaultNow(),
});

export type ApiUsage = typeof apiUsage.$inferSelect;
export type InsertApiUsage = typeof apiUsage.$inferInsert;