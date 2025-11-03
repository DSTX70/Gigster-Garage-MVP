# GIGSTER GARAGE - COMPLETE BUILD AUDIT EXPORT
**Export Date:** November 3, 2025  
**Purpose:** Comprehensive audit to determine what's implemented, working, broken, or missing  
**Total Lines of Code:** ~51,526 lines

---

## 1. PROJECT REQUIREMENTS (from replit.md)

### Core Features Specified:
1. **Time Tracking** - Comprehensive time tracking with project allocation and productivity reporting
2. **Workflow Automation** - Custom workflow rules and automation engine with visual rule builder
3. **AI Content Generation** - Reliable proposal and content creation using stable AI models (GPT-4o)
4. **Invoice Builder** - Auto-fill functionality for company and client information
5. **Task Management** - Advanced task features including:
   - Priority levels, due dates, task assignments
   - Notes, file attachments, URL links
   - Intelligent reminder notifications
   - Subtask hierarchies and circular dependency prevention
6. **Agent KPI Tracking** - Monitoring system with automated graduation tracking and real-time Hub API integration
7. **Pricing & Feature Flags** - Environment-aware feature flags and three-tier pricing comparison matrix
8. **Notifications** - Email notifications (SendGrid) for high-priority tasks and SMS notifications (Twilio)
9. **User Management** - Multi-user authentication, role-based access, user onboarding, admin dashboard

### Recent UI/UX Features (November 2025):
10. **Command Palette (Cmd+K)** - Global search and quick actions
11. **Settings/Preferences Page** - Account, Notifications, Appearance, Integrations, Data sections
12. **Keyboard Shortcuts Guide (?)** - Comprehensive shortcuts overlay
13. **Quick Action Button (FAB)** - Floating action button for common actions
14. **Offline Mode Indicator** - Network status notifications
15. **Empty States Component** - Reusable empty state with CTAs

### Architecture Stack:
- **Frontend:** React + TypeScript, TailwindCSS, shadcn/ui, Wouter routing, TanStack Query
- **Backend:** Express.js + TypeScript, Drizzle ORM
- **Database:** PostgreSQL (Neon)
- **Build:** Vite
- **Auth:** Session-based with bcrypt
- **Styling:** Garage Navy branding (#004C6D, #0B1D3A)

---

## 2. DATABASE SCHEMA (shared/schema.ts)

### Tables Defined:
- sessions
- users
- projects
- clients
- clientDocuments
- proposals: any
- invoices
- payments
- contracts
- presentations
- tasks
- templates
- taskDependencies
- timeLogs
- fileAttachments
- documentVersions
- messages
- customFieldDefinitions
- customFieldValues
- workflowRules
- workflowExecutions
- comments
- activities
- apiKeys
- apiUsage
- aiQuestionTemplates
- aiUserResponses
- aiConversations
- agents
- agentVisibilityFlags
- agentGraduationPlans
- agentKpis

### Full Database Schema Export:
```typescript
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
  // Business context fields for AI personalization
  city: varchar("city"),
  state: varchar("state"),
  businessType: varchar("business_type"),
  entityType: varchar("entity_type"),
  industry: varchar("industry"),
  targetMarket: text("target_market"),
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

// Presentations table
export const presentations = pgTable("presentations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  subtitle: varchar("subtitle"),
  author: varchar("author"),
  company: varchar("company"),
  date: varchar("date"),
  projectId: varchar("project_id").references(() => projects.id),
  theme: varchar("theme").default("modern"),
  audience: text("audience"),
  objective: text("objective"),
  duration: integer("duration").default(30),
  slides: jsonb("slides").$type<Array<{
    id: number;
    title: string;
    content: string;
    slideType: string;
    order: number;
  }>>().default([]),
  status: varchar("status", { enum: ["draft", "sent", "viewed", "accepted", "rejected"] }).default("draft"),
  shareableLink: varchar("shareable_link").unique(),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdById: varchar("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Demo session fields for data isolation
  isDemo: boolean("is_demo").default(false),
  demoSessionId: varchar("demo_session_id"),
  demoUserId: varchar("demo_user_id"),
});

export type Presentation = typeof presentations.$inferSelect;
export type InsertPresentation = typeof presentations.$inferInsert;

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
    description: z.string().transform(val => val?.trim() || ""),
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
  ]).optional().nullable(),
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

export const insertPresentationSchema = createInsertSchema(presentations, {
  title: z.string().min(1, "Presentation title is required").max(200, "Title must be less than 200 characters"),
  subtitle: z.string().max(300, "Subtitle must be less than 300 characters").optional().nullable(),
  author: z.string().max(100, "Author must be less than 100 characters").optional().nullable(),
  company: z.string().max(100, "Company must be less than 100 characters").optional().nullable(),
  audience: z.string().max(500, "Audience must be less than 500 characters").optional().nullable(),
  objective: z.string().max(1000, "Objective must be less than 1000 characters").optional().nullable(),
  duration: z.number().min(5, "Duration must be at least 5 minutes").max(480, "Duration must be less than 8 hours").optional().nullable(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectPresentationSchema = createSelectSchema(presentations);

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
  projectId: z.string().nullish(),
  clientName: z.string(),
  clientEmail: z.string().email(),
  variables: z.record(z.any()),
  expiresInDays: z.number().min(1).default(30)
});

// Direct proposal creation schema (for form-based proposals)
export const directProposalSchema = z.object({
  title: z.string().transform(val => val?.trim() || "Untitled Proposal"),
  projectId: z.string().nullish(),
  clientName: z.string().nullish(),
  clientEmail: z.string().nullish(),
  projectDescription: z.string().nullish(),
  totalBudget: z.number().min(0).default(0),
  timeline: z.string().nullish(),
  deliverables: z.string().nullish(),
  terms: z.string().nullish(),
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

// AI Question Templates - Pre-seeded questions for different content types
export const aiQuestionTemplates = pgTable("ai_question_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentType: varchar("content_type").notNull(), // "proposal", "contract", "invoice", "presentation", "task", "project"
  questionLevel: varchar("question_level", { enum: ["basic", "advanced"] }).notNull(),
  questionText: text("question_text").notNull(),
  orderIndex: integer("order_index").notNull(), // Question order (1-10)
  projectTypeFilter: jsonb("project_type_filter").$type<string[]>().default([]), // Empty = all types, or specific like ["construction", "marketing"]
  placeholder: varchar("placeholder"), // Example answer
  helpText: text("help_text"), // Additional guidance
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type AiQuestionTemplate = typeof aiQuestionTemplates.$inferSelect;
export type InsertAiQuestionTemplate = typeof aiQuestionTemplates.$inferInsert;

// AI User Responses - Store answers to questions for reuse
export const aiUserResponses = pgTable("ai_user_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  questionTemplateId: varchar("question_template_id").references(() => aiQuestionTemplates.id),
  conversationId: varchar("conversation_id").references(() => aiConversations.id, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(), // Snapshot of question asked
  responseText: text("response_text").notNull(), // User's answer
  context: jsonb("context").$type<{
    contentType?: string;
    entityId?: string; // proposal/contract/project ID
    projectType?: string;
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export type AiUserResponse = typeof aiUserResponses.$inferSelect;
export type InsertAiUserResponse = typeof aiUserResponses.$inferInsert;

// AI Conversations - Full conversation history with AI
export const aiConversations = pgTable("ai_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  contentType: varchar("content_type").notNull(), // "proposal", "contract", etc.
  questionLevel: varchar("question_level", { enum: ["basic", "advanced"] }).notNull(),
  entityId: varchar("entity_id"), // proposal/contract/project ID if linked
  projectType: varchar("project_type"), // "construction", "marketing", "consulting", etc.
  messages: jsonb("messages").$type<Array<{
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: string;
  }>>().default([]),
  generatedContent: text("generated_content"), // Final AI-generated content
  userProfile: jsonb("user_profile").$type<{
    city?: string;
    state?: string;
    businessType?: string;
    entityType?: string;
    industry?: string;
    targetMarket?: string;
  }>(), // Snapshot of user profile at time of conversation
  status: varchar("status", { enum: ["in_progress", "completed", "cancelled"] }).default("in_progress"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type AiConversation = typeof aiConversations.$inferSelect;
export type InsertAiConversation = typeof aiConversations.$inferInsert;

// Zod schemas for AI questionnaire
export const insertAiQuestionTemplateSchema = createInsertSchema(aiQuestionTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiUserResponseSchema = createInsertSchema(aiUserResponses).omit({
  id: true,
  createdAt: true,
});

export const insertAiConversationSchema = createInsertSchema(aiConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

// Agent Management - Internal agents and their visibility/graduation tracking
export const agents = pgTable("agents", {
  id: varchar("id").primaryKey(), // e.g., "agent.itsa", "agent.ssk"
  name: varchar("name").notNull(), // Display name
  description: text("description"),
  category: varchar("category"), // e.g., "scoping", "execution", "governance"
  status: varchar("status", { enum: ["pilot", "internal_beta", "internal_ga", "external_pilot", "external_beta", "external_ga", "deprecated"] }).default("pilot"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

// Agent Visibility Flags - Control what users see
export const agentVisibilityFlags = pgTable("agent_visibility_flags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").references(() => agents.id, { onDelete: "cascade" }).notNull(),
  exposeToUsers: boolean("expose_to_users").default(false),
  dashboardCard: boolean("dashboard_card").default(true),
  externalToolId: varchar("external_tool_id"), // Linked external toolkit name
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type AgentVisibilityFlag = typeof agentVisibilityFlags.$inferSelect;
export type InsertAgentVisibilityFlag = typeof agentVisibilityFlags.$inferInsert;

// Agent Graduation Plans - Track progression from internal to external
export const agentGraduationPlans = pgTable("agent_graduation_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").references(() => agents.id, { onDelete: "cascade" }).notNull(),
  targetTool: varchar("target_tool").notNull(), // e.g., "Smart Scoper", "LaunchPad"
  phase: varchar("phase").notNull(), // e.g., "Pilot→External Beta"
  startDate: date("start_date"),
  targetDate: date("target_date"), // When to flip on
  endDate: date("end_date"),
  owner: varchar("owner"), // Team/person responsible
  graduationCriteria: text("graduation_criteria"), // Success criteria
  currentProgress: jsonb("current_progress").$type<{
    acceptRate?: number;
    reworkRate?: number;
    slaCompliance?: number;
    gateEscapeRate?: number;
    incidentCount?: number;
    [key: string]: any;
  }>().default({}),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type AgentGraduationPlan = typeof agentGraduationPlans.$inferSelect;
export type InsertAgentGraduationPlan = typeof agentGraduationPlans.$inferInsert;

// Zod schemas for agents
export const insertAgentSchema = createInsertSchema(agents).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertAgentVisibilityFlagSchema = createInsertSchema(agentVisibilityFlags).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentGraduationPlanSchema = createInsertSchema(agentGraduationPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

// Agent KPIs - Track performance metrics for graduation decisions
export const agentKpis = pgTable("agent_kpis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").references(() => agents.id, { onDelete: "cascade" }).notNull().unique(),
  onTimeMilestoneRate: decimal("on_time_milestone_rate", { precision: 5, scale: 4 }).default("0"), // 0.0000 to 1.0000
  gateEscapeRate: decimal("gate_escape_rate", { precision: 5, scale: 4 }).default("0"), // 0.0000 to 1.0000
  incidentCount30d: integer("incident_count_30d").default(0),
  status: varchar("status", { enum: ["green", "amber", "red"] }).default("amber"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type AgentKpi = typeof agentKpis.$inferSelect;
export type InsertAgentKpi = typeof agentKpis.$inferInsert;

export const insertAgentKpiSchema = createInsertSchema(agentKpis).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});```

---

## 3. FRONTEND PAGES (client/src/pages/)

### All Pages Implemented:
- admin.tsx
- advanced-reporting.tsx
- agency-hub.tsx
- AgentManagement.tsx
- ai-insights.tsx
- analytics.tsx
- api-webhooks.tsx
- audit-logging.tsx
- bulk-operations.tsx
- client-details.tsx
- client-list.tsx
- create-contract.tsx
- create-invoice.tsx
- create-presentation.tsx
- create-proposal.tsx
- custom-fields.tsx
- dashboard.tsx
- edit-invoice.tsx
- email-management.tsx
- filing-cabinet.tsx
- garage-assistant.tsx
- home.tsx
- instant-proposal.tsx
- invoice-details.tsx
- invoices.tsx
- landing.tsx
- login.tsx
- messages.tsx
- mobile-dashboard.tsx
- mobile-home.tsx
- mobile-projects.tsx
- mobile-tasks.tsx
- mobile-time-tracking.tsx
- mobile-workflows.tsx
- not-found.tsx
- onboarding.tsx
- pay-invoice.tsx
- payments.tsx
- performance-dashboard.tsx
- permissions-management.tsx
- predictive-analytics.tsx
- productivity.tsx
- project-dashboard.tsx
- settings.tsx
- signup.tsx
- slack-integration.tsx
- smart-scheduling.tsx
- sso-management.tsx
- tasks.tsx
- team-collaboration.tsx
- template-editor.tsx
- templates.tsx
- test-404.tsx
- user-manual.tsx
- white-label.tsx
- workflow-automation.tsx

---

## 4. FRONTEND COMPONENTS (client/src/components/)

### All Components:
- ActivityFeed.tsx
- admin-audit-logging.tsx
- admin-permissions-management.tsx
- admin-sso-management.tsx
- advanced-workflow-builder.tsx
- analytics-charts.tsx
- app-header.tsx
- assignment-filter.tsx
- BulkActions.tsx
- BulkOperationsToolbar.tsx
- BulkTable.tsx
- calendar-view.tsx
- ClientDocuments.tsx
- collaboration/chat-widget.tsx
- CommandPalette.tsx
- CommentsSection.tsx
- CustomFieldRenderer.tsx
- daily-reminder.tsx
- DemoModeBanner.tsx
- DemoSessionCreator.tsx
- DemoSessionWarning.tsx
- DemoUpgradePrompt.tsx
- desktop-task-views.tsx
- DragDropFilingCabinet.tsx
- DraggableDocument.tsx
- DroppableZones.tsx
- EmptyState.tsx
- examples/file-upload-example.tsx
- FileAttachments.tsx
- FolderManager.tsx
- global-search.tsx
- KeyboardShortcutsGuide.tsx
- MetadataEditor.tsx
- MoodPaletteSwitcher.tsx
- navigation-menu.tsx
- ObjectUploader.tsx
- OfflineIndicator.tsx
- payment-tracker.tsx
- PricingTable.tsx
- ProgressSection.tsx
- project-board.tsx
- project-list.tsx
- QuickActionButton.tsx
- real-time-notifications.tsx
- reminder-modal.tsx
- reminder-system.tsx
- screenshot-carousel.tsx
- search/AdvancedSearchModal.tsx
- search/FilterChips.tsx
- search/SearchBuilder.tsx
- search/SearchResults.tsx
- status/StatusBadge.tsx
- streak-card.tsx
- TagCloud.tsx
- TagManager.tsx
- task-detail-modal.tsx
- task-drawer.tsx
- task-filters.tsx
- task-form.tsx
- task-item.tsx
- task-list.tsx
- task-relationships.tsx
- time-import-dialog.tsx
- timer-widget.tsx
- ui/accordion.tsx
- ui/alert-dialog.tsx
- ui/alert.tsx
- ui/aspect-ratio.tsx
- ui/avatar.tsx
- ui/badge.tsx
- ui/breadcrumb.tsx
- ui/button.tsx
- ui/calendar.tsx
- ui/card.tsx
- ui/carousel.tsx
- ui/chart.tsx
- ui/checkbox.tsx
- ui/collapsible.tsx
- ui/command.tsx
- ui/context-menu.tsx
- ui/dialog.tsx
- ui/drawer.tsx
- ui/dropdown-menu.tsx
- ui/form.tsx
- ui/gigster-button.tsx
- ui/gigster-card.tsx
- ui/gigster-icon.tsx
- ui/hover-card.tsx
- ui/input-otp.tsx
- ui/input.tsx
- ui/label.tsx
- ui/menubar.tsx
- ui/mobile-file-upload.tsx
- ui/mobile-rich-text-editor.tsx
- ui/navigation-menu.tsx
- ui/pagination.tsx
- ui/popover.tsx
- ui/progress.tsx
- ui/radio-group.tsx
- ui/resizable.tsx
- ui/scroll-area.tsx
- ui/select.tsx
- ui/separator.tsx
- ui/sheet.tsx
- ui/sidebar.tsx
- ui/skeleton.tsx
- ui/slider.tsx
- ui/switch.tsx
- ui/table.tsx
- ui/tabs.tsx
- ui/textarea.tsx
- ui/toaster.tsx
- ui/toast.tsx
- ui/toggle-group.tsx
- ui/toggle.tsx
- ui/tooltip.tsx
- vsuite-logo.tsx

---

## 5. BACKEND SERVICES (server/)

### All Server Files:
- advanced-reporting-service.ts
- ai-assistant-service.ts
- ai-insights-service.ts
- audit-service.ts
- auth-middleware.ts
- automatedInvoicingService.ts
- backup-routes.ts
- backup-service.ts
- cache-service.ts
- cache-warming-service.ts
- cdn-service.ts
- collaboration-service.ts
- contractManagementService.ts
- database-optimizer.ts
- db.ts
- demoDataService.ts
- demoSessionService.ts
- emailService.ts
- encryption-service.ts
- i18n-service.ts
- index.ts
- invoiceStatusService.ts
- load-balancer.ts
- mobile-api-service.ts
- objectAcl.ts
- objectStorage.ts
- pdfService.ts
- performance-monitor.ts
- permissions-service.ts
- predictive-analytics-service.ts
- proposalWorkflowService.ts
- routes.ts
- seedAiQuestions.ts
- smartNotificationsService.ts
- smart-scheduling-service.ts
- sso-service.ts
- storage.ts
- switchboard-service.ts
- vite.ts
- webhook-service.ts
- white-label-service.ts
- workflowTemplatesService.ts

---

## 6. API ROUTES (server/routes.ts)

### Complete Routes File:
```typescript
import express, { type Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import { fileTypeFromBuffer } from "file-type";
import csvParser from "csv-parser";
import * as createCsvWriter from "csv-writer";
import { z } from "zod";
import { storage } from "./storage";
import { sendHighPriorityTaskNotification, sendSMSNotification, sendProposalEmail, sendInvoiceEmail, sendMessageAsEmail, parseInboundEmail } from "./emailService";
import { generateInvoicePDF, generateProposalPDF, generateContractPDF, generatePresentationPDF } from "./pdfService";
import { taskSchema, insertTaskSchema, insertProjectSchema, insertTemplateSchema, insertProposalSchema, insertClientSchema, insertClientDocumentSchema, insertInvoiceSchema, insertPaymentSchema, insertContractSchema, insertPresentationSchema, insertUserSchema, onboardingSchema, updateTaskSchema, updateTemplateSchema, updateProposalSchema, updateTimeLogSchema, startTimerSchema, stopTimerSchema, generateProposalSchema, sendProposalSchema, directProposalSchema, insertMessageSchema, insertAgentSchema, insertAgentVisibilityFlagSchema, insertAgentGraduationPlanSchema } from "@shared/schema";
import { saveToFilingCabinet, fetchFromFilingCabinet } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import type { User } from "@shared/schema";
import OpenAI from "openai";
import { invoiceStatusService } from "./invoiceStatusService";
import { automatedInvoicingService } from "./automatedInvoicingService";
import { smartNotificationsService } from "./smartNotificationsService";
import { workflowTemplatesService } from "./workflowTemplatesService";
import { sendProposalResponseNotification, createProposalRevision, getProposalApprovalStats } from "./proposalWorkflowService";
import { contractManagementService } from "./contractManagementService";
import { backupRoutes } from "./backup-routes";
import { aiInsightsService } from "./ai-insights-service";
import { CollaborationService, collaborationService } from "./collaboration-service";
import { advancedReportingService } from "./advanced-reporting-service";
import { webhookService } from "./webhook-service";
import { mobileApiService } from "./mobile-api-service";
import { whiteLabelService } from "./white-label-service";
import { ssoService } from "./sso-service";
import { permissionsService, requirePermission } from "./permissions-service";
import { auditService, logAuditEvent } from "./audit-service";
import { encryptionService } from "./encryption-service";
import { backupService } from "./backup-service";
import { i18nService } from "./i18n-service";
import { smartSchedulingService } from "./smart-scheduling-service";
import { predictiveAnalyticsService } from "./predictive-analytics-service";
import { performanceMonitor } from "./performance-monitor";
import { AppCache } from "./cache-service";
import { performanceMiddleware, cacheMiddleware, optimizationMiddleware } from './middleware/performance-middleware';
import { cdnService } from './cdn-service';
import { databaseOptimizer } from './database-optimizer';
import { loadBalancer } from './load-balancer';
import passport from 'passport';
import { seedDemoData, clearDemoData } from './demoDataService';
import { demoSessionService } from './demoSessionService';
import { aiAssistantService } from './ai-assistant-service';

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Helper function to sanitize foreign key IDs - converts empty strings to null
function sanitizeId(value: string | null | undefined): string | null {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return null;
  }
  return value.trim();
}

// Helper function to sanitize an object's foreign key fields
function sanitizeForeignKeys(obj: any, fields: string[]): any {
  const sanitized = { ...obj };
  fields.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = sanitizeId(sanitized[field]);
    }
  });
  return sanitized;
}

// Error tracking for audit purposes
const errorTracker = {
  errors: new Map<string, number>(),
  logError(route: string, status: number, error: string) {
    const key = `${status}_${route}_${error.substring(0, 50)}`;
    const count = this.errors.get(key) || 0;
    this.errors.set(key, count + 1);
  },
  getTopErrors(limit = 10) {
    return Array.from(this.errors.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  }
};

// Define error tracker type first
interface ErrorTracker {
  errors: Map<string, number>;
  logError(route: string, status: number, error: string): void;
  getTopErrors(limit?: number): [string, number][];
}

// Make error tracker globally accessible for middleware
declare global {
  var errorTracker: ErrorTracker;
}
global.errorTracker = errorTracker;

// Verify OpenAI configuration on startup
if (!process.env.OPENAI_API_KEY) {
  console.error('⚠️  OPENAI_API_KEY not found - AI tools will be disabled');
} else {
  console.log('✅ OpenAI API key configured successfully');
}

// Define login schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Extend session type
declare module "express-session" {
  interface SessionData {
    user?: User;
  }
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Request counters for dynamic error rate calculation
  let totalRequests = 0;
  let failedRequests = 0;

  // Request counting middleware with proper finish listener and error logging
  app.use((req, res, next) => {
    totalRequests++;
    res.on('finish', () => {
      if (res.statusCode >= 400) {
        failedRequests++;
        
        // Log errors to errorTracker for audit endpoints (covers non-throw paths)
        const route = req.originalUrl || req.path || 'unknown';
        const msg = res.locals.errorMessage || (res.statusCode >= 500 ? 'ServerError' : 'ClientError');
        if (global.errorTracker) {
          global.errorTracker.logError(route, res.statusCode, msg);
        }
      }
    });
    next();
  });

  // Apply performance monitoring to all routes
  app.use(performanceMiddleware());
  app.use(optimizationMiddleware());
  // Configure multer for file uploads with enhanced security validation
  const upload = multer({ 
    storage: multer.memoryStorage(), // Use memory storage for content validation
    limits: { 
      fileSize: 10 * 1024 * 1024, // 10MB limit
      files: 5 // Maximum 5 files per request
    },
    fileFilter: async (req, file, cb) => {
      try {
        // Allowed file types with magic byte signatures
        const allowedTypes = new Map([
          ['application/pdf', ['.pdf']],
          ['application/msword', ['.doc']],
          ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', ['.docx']],
          ['application/vnd.ms-excel', ['.xls']],
          ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ['.xlsx']],
          ['application/vnd.ms-powerpoint', ['.ppt']],
          ['application/vnd.openxmlformats-officedocument.presentationml.presentation', ['.pptx']],
          ['text/plain', ['.txt']],
          ['text/csv', ['.csv']],
          ['image/jpeg', ['.jpg', '.jpeg']],
          ['image/png', ['.png']],
          ['image/gif', ['.gif']],
          ['image/webp', ['.webp']]
          // Removed SVG due to XSS risk
        ]);

        // Dangerous extensions that should never be allowed anywhere in filename
        const dangerousExtensions = [
          '.exe', '.sh', '.bat', '.cmd', '.com', '.js', '.mjs', '.cjs', 
          '.php', '.pl', '.py', '.rb', '.jar', '.dll', '.scr', '.msi', '.apk'
        ];

        // Check for dangerous extensions anywhere in filename
        const fileName = file.originalname.toLowerCase();
        for (const dangerous of dangerousExtensions) {
          if (fileName.includes(dangerous)) {
            return cb(new Error(`File contains dangerous extension '${dangerous}' which is not allowed for security reasons`));
          }
        }

        // Validate last extension
        const fileExtension = path.extname(file.originalname).toLowerCase();
        const allowedExtensions = Array.from(allowedTypes.values()).flat();
        
        if (!allowedExtensions.includes(fileExtension)) {
          return cb(new Error(`File extension '${fileExtension}' not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`));
        }

        // Initial validation passed - content will be validated after upload
        cb(null, true);
        
      } catch (error) {
        cb(new Error(`File validation error: ${error.message}`));
      }
    }
  });

  // Content validation middleware for uploaded files
  const validateFileContent = async (req: any, res: any, next: any) => {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    try {
      // Allowed MIME types based on magic bytes
      const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
        'image/jpeg',
        'image/png', 
        'image/gif',
        'image/webp'
      ];

      for (const file of req.files) {
        // Validate file content using magic bytes
        const fileType = await fileTypeFromBuffer(file.buffer);
        
        if (fileType && !allowedMimeTypes.includes(fileType.mime)) {
          return res.status(400).json({ 
            message: `File content type '${fileType.mime}' not allowed. File appears to be different from its extension.` 
          });
        }

        // For text files, magic byte detection might not work, so we allow them if extension matches
        const fileExtension = path.extname(file.originalname).toLowerCase();
        if (!fileType && !['.txt', '.csv'].includes(fileExtension)) {
          return res.status(400).json({ 
            message: 'Unable to determine file type. File may be corrupted or unsupported.' 
          });
        }
      }

      next();
    } catch (error) {
      console.error('File content validation error:', error);
      return res.status(500).json({ message: 'File validation failed' });
    }
  };

  // Use MemoryStore for development to reduce database connection pressure
  // In production, consider using a separate Pool for session storage
  app.use(session({
    secret: process.env.SESSION_SECRET || 'taskflow-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Secure cache middleware for public endpoints (after session)
  app.use((req, res, next) => {
    // Cache safe, public endpoints even for authenticated users (they're truly public)
    const publicEndpoints = [
      '/api/i18n/languages',     // Language list - always public
    ];
    
    // Pattern for i18n translations: /api/i18n/translations/:lang
    const i18nTranslationMatch = req.path.match(/^\/api\/i18n\/translations\/([a-z]{2})$/);
    
    const isPublicEndpoint = publicEndpoints.includes(req.path);
    const isI18nTranslation = i18nTranslationMatch !== null;
    const isGetRequest = req.method === 'GET';
    
    // Cache public endpoints (safe for all users)
    if (isGetRequest && (isPublicEndpoint || isI18nTranslation)) {
      // Include language in cache key for i18n
      const cacheKey = isI18nTranslation ? `${req.path}_lang_${i18nTranslationMatch[1]}` : req.path;
      return cacheMiddleware(1800)(req, res, next); // 30 min TTL for stable i18n data
    }
    
    next();
  });

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    req.user = req.session.user;
    next();
  };

  // Middleware to check admin role
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (req.session.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    req.user = req.session.user;
    next();
  };

  // Error tracking endpoints for audit purposes (after session middleware)
  app.get('/api/_audit/errors/top', requireAdmin, (req, res) => {
    try {
      const topErrors = global.errorTracker?.getTopErrors(20) || [];
      res.json({
        success: true,
        topErrors: topErrors.map(([key, count]) => ({
          route: key.split('_')[1] || 'unknown',
          status: key.split('_')[0] || 'unknown', 
          count
        }))
      });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to fetch error data' });
    }
  });
  
  app.get('/api/_audit/errors/summary', requireAdmin, (req, res) => {
    try {
      const topErrors = global.errorTracker?.getTopErrors(50) || [];
      const totalErrors = topErrors.reduce((sum, [, count]) => sum + count, 0);
      
      // Dynamic error rate calculation
      const currentErrorRate = totalRequests > 0 
        ? ((failedRequests / totalRequests) * 100).toFixed(2) + '%'
        : '0%';
      
      // Categorize errors
      const errorsByStatus = new Map<string, number>();
      const errorsByRoute = new Map<string, number>();
      
      topErrors.forEach(([key, count]) => {
        const status = key.split('_')[0] || 'unknown';
        const route = key.split('_')[1] || 'unknown';
        const statusGroup = status.startsWith('4') ? '4xx' : status.startsWith('5') ? '5xx' : 'other';
        
        errorsByStatus.set(statusGroup, (errorsByStatus.get(statusGroup) || 0) + count);
        errorsByRoute.set(route, (errorsByRoute.get(route) || 0) + count);
      });
      
      res.json({
        success: true,
        currentErrorRate,
        totalRequests,
        failedRequests,
        totalErrors,
        errorsByStatus: Array.from(errorsByStatus.entries()),
        errorsByRoute: Array.from(errorsByRoute.entries()).slice(0, 10),
        topErrors: topErrors.slice(0, 10).map(([key, count]) => ({
          route: key.split('_')[1] || 'unknown',
          status: key.split('_')[0] || 'unknown',
          count,
          percentage: totalErrors > 0 ? ((count / totalErrors) * 100).toFixed(2) : '0'
        }))
      });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to fetch error summary' });
    }
  });

  // Database health endpoint with pool monitoring
  app.get("/api/db-health", async (_req, res) => {
    try {
      const start = Date.now();
      
      // Test database connectivity
      await pool.query('SELECT 1');
      const responseTime = Date.now() - start;
      
      // Get pool statistics
      const poolStats = {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount,
        max: pool.options.max,
        connectionString: pool.options.connectionString ? '***configured***' : 'missing'
      };
      
      res.json({
        status: 'healthy',
        database: {
          connected: true,
          responseTime: `${responseTime}ms`,
          pool: poolStats
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(503).json({
        status: 'unhealthy',
        database: {
          connected: false,
          error: error.message,
          code: error.code || 'unknown',
          pool: {
            totalCount: pool.totalCount,
            idleCount: pool.idleCount,
            waitingCount: pool.waitingCount
          }
        },
        timestamp: new Date().toISOString()
      });
    }
  });

  // Auth routes
  app.post("/api/signup", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid user data", 
          errors: result.error.errors 
        });
      }

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(result.data.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(result.data);
      req.session.user = user;
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating account:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid login data", 
          errors: result.error.errors 
        });
      }

      const { username, password } = result.data;
      console.log(`🔐 Login attempt for username: ${username}`);
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        console.log(`❌ User not found: ${username}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      console.log(`👤 User found: ${user.username}, role: ${user.role}`);
      const passwordValid = await storage.verifyPassword(user, password);
      console.log(`🔑 Password verification result: ${passwordValid}`);
      
      if (!passwordValid) {
        console.log(`❌ Password verification failed for: ${username}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.user = user;
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          hasCompletedOnboarding: user.hasCompletedOnboarding,
          notificationEmail: user.notificationEmail,
          phone: user.phone,
          emailOptIn: user.emailOptIn,
          smsOptIn: user.smsOptIn
        } 
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", async (req, res) => {
    if (req.session.user) {
      // Fetch fresh user data from database to ensure accuracy
      const freshUser = await storage.getUser(req.session.user.id);
      if (freshUser) {
        res.json({ 
          user: { 
            id: freshUser.id, 
            username: freshUser.username, 
            name: freshUser.name, 
            email: freshUser.email, 
            role: freshUser.role,
            hasCompletedOnboarding: freshUser.hasCompletedOnboarding,
            notificationEmail: freshUser.notificationEmail,
            phone: freshUser.phone,
            emailOptIn: freshUser.emailOptIn,
            smsOptIn: freshUser.smsOptIn
          } 
        });
      } else {
        res.status(401).json({ message: "User not found" });
      }
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Demo Session Routes
  app.post("/api/demo/create-session", async (req, res) => {
    try {
      const result = await demoSessionService.createDemoSession();
      
      if (result.success && result.user && result.session) {
        // Set session for demo user
        req.session.user = result.user;
        
        res.status(201).json({
          success: true,
          message: "Demo session created successfully",
          user: {
            id: result.user.id,
            username: result.user.username,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
            hasCompletedOnboarding: result.user.hasCompletedOnboarding,
            isDemo: true
          },
          session: {
            id: result.session.id,
            expiresAt: result.session.expiresAt,
            remainingMinutes: result.session.remainingMinutes
          }
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.error || "Failed to create demo session"
        });
      }
    } catch (error: any) {
      console.error("Error creating demo session:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create demo session"
      });
    }
  });

  app.get("/api/demo/session-status", async (req, res) => {
    try {
      if (!req.session.user) {
        return res.json({
          isDemo: false,
          authenticated: false,
          message: "No active session"
        });
      }

      const status = await demoSessionService.getDemoSessionStatus(req.session.user.id);
      
      if (status.isDemo && status.session) {
        res.json({
          isDemo: true,
          authenticated: true,
          session: {
            id: status.session.id,
            expiresAt: status.session.expiresAt,
            remainingMinutes: status.session.remainingMinutes,
            lastActivity: status.session.lastActivity
          }
        });
      } else if (status.isDemo && status.error) {
        res.json({
          isDemo: true,
          authenticated: false,
          error: status.error
        });
      } else {
        res.json({
          isDemo: false,
          authenticated: true,
          message: "Regular user session"
        });
      }
    } catch (error: any) {
      console.error("Error checking demo session status:", error);
      res.status(500).json({
        isDemo: false,
        authenticated: false,
        error: "Failed to check session status"
      });
    }
  });

  app.delete("/api/demo/end-session", async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({
          success: false,
          message: "No active session to end"
        });
      }

      if (!demoSessionService.isDemoUser(req.session.user)) {
        return res.status(400).json({
          success: false,
          message: "Not a demo session"
        });
      }

      const success = await demoSessionService.endDemoSession(req.session.user.id);
      
      if (success) {
        // Destroy Express session
        req.session.destroy((err) => {
          if (err) {
            console.error("Error destroying session:", err);
          }
        });

        res.json({
          success: true,
          message: "Demo session ended successfully"
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to end demo session"
        });
      }
    } catch (error: any) {
      console.error("Error ending demo session:", error);
      res.status(500).json({
        success: false,
        message: "Failed to end demo session"
      });
    }
  });

  // Project routes
  app.get("/api/projects", requireAuth, cacheMiddleware(600), async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", requireAuth, async (req, res) => {
    try {
      const result = insertProjectSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid project data", 
          errors: result.error.errors 
        });
      }

      const project = await storage.getOrCreateProject(result.data.name);
      
      // Cache invalidation temporarily disabled
      
      res.json(project);
    } catch (error) {
      console.error("Error creating/finding project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // User onboarding route
  app.post("/api/user/onboarding", requireAuth, async (req, res) => {
    try {
      const result = onboardingSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid onboarding data", 
          errors: result.error.errors 
        });
      }

      const userId = req.session.user!.id;
      const updateData = {
        hasCompletedOnboarding: true, // Always set to true when onboarding is completed
        emailOptIn: result.data.emailOptIn,
        smsOptIn: result.data.smsOptIn,
        notificationEmail: result.data.notificationEmail || '',
        phone: result.data.phone
      };
      const user = await storage.updateUserOnboarding(userId, updateData);
      
      // Update session with the latest user data
      req.session.user = user;
      
      // Explicitly save the session
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
        }
      });
      
      res.json(user);
    } catch (error) {
      console.error("Error updating user onboarding:", error);
      res.status(500).json({ message: "Failed to update onboarding preferences" });
    }
  });

  // User management routes (admin only)
  app.get("/api/users", requireAdmin, cacheMiddleware(600), async (req, res) => {
    try {
      const users = await storage.getUsers();
      const safeUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }));
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", requireAdmin, async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid user data", 
          errors: result.error.errors 
        });
      }

      const user = await storage.createUser(result.data);
      res.status(201).json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.delete("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteUser(id);
      
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Demo Data Management Routes (admin only)
  app.post("/api/demo-data/seed", requireAdmin, async (req, res) => {
    try {
      const user = req.session.user!;
      console.log(`🌱 Admin ${user.username} initiating demo data seeding...`);
      
      const demoIds = await seedDemoData(user.id);
      
      res.json({ 
        message: "Demo data seeded successfully",
        summary: {
          clients: Object.keys(demoIds.clients).length,
          projects: Object.keys(demoIds.projects).length,
          tasks: Object.keys(demoIds.tasks).length,
          templates: Object.keys(demoIds.templates).length,
          proposals: Object.keys(demoIds.proposals).length,
          invoices: Object.keys(demoIds.invoices).length,
          contracts: Object.keys(demoIds.contracts).length
        },
        generatedIds: demoIds
      });
    } catch (error) {
      console.error("Error seeding demo data:", error);
      res.status(500).json({ 
        message: "Failed to seed demo data", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.delete("/api/demo-data/clear", requireAdmin, async (req, res) => {
    try {
      const user = req.session.user!;
      console.log(`🧹 Admin ${user.username} initiating demo data cleanup...`);
      
      await clearDemoData(user.id);
      
      res.json({ 
        message: "Demo data cleared successfully"
      });
    } catch (error) {
      console.error("Error clearing demo data:", error);
      res.status(500).json({ 
        message: "Failed to clear demo data", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/demo-data/status", requireAdmin, async (req, res) => {
    try {
      // Get counts of existing data to show current status
      const [clients, projects, tasks, templates, proposals, invoices, contracts] = await Promise.all([
        storage.getClients(),
        storage.getProjects(), 
        storage.getTasks(),
        storage.getTemplates(),
        storage.getProposals(),
        storage.getInvoices(),
        storage.getContracts()
      ]);

      res.json({
        currentData: {
          clients: clients.length,
          projects: projects.length,
          tasks: tasks.length,
          templates: templates.length,
          proposals: proposals.length,
          invoices: invoices.length,
          contracts: contracts.length
        },
        hasDemoData: clients.length > 0 || projects.length > 0 || tasks.length > 0
      });
    } catch (error) {
      console.error("Error checking demo data status:", error);
      res.status(500).json({ 
        message: "Failed to check demo data status", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Search endpoint
  app.get("/api/search", requireAuth, async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string' || q.length < 2) {
        return res.json([]);
      }
      
      const query = q.toLowerCase();
      const user = req.session.user!;
      const results: any[] = [];
      
      // Search tasks
      try {
        const tasks = await storage.getTasks(user.role === 'admin' ? undefined : user.id);
        const matchingTasks = tasks.filter(task => 
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.notes?.toLowerCase().includes(query)
        ).slice(0, 5);
        
        // Optimize: Batch fetch projects and users to eliminate N+1 queries
        const projectIds = [...new Set(matchingTasks.map(t => t.projectId).filter(Boolean))];
        const assigneeIds = [...new Set(matchingTasks.map(t => t.assignedToId).filter(Boolean))];
        
        const [projects, assignees] = await Promise.all([
          projectIds.length > 0 ? storage.getProjects() : Promise.resolve([]),
          assigneeIds.length > 0 ? storage.getUsers() : Promise.resolve([])
        ]);
        
        // Create lookup maps for O(1) access
        const projectMap = new Map(projects.map(p => [p.id, p.name]));
        const assigneeMap = new Map(assignees.map(u => [u.id, u.name]));
        
        for (const task of matchingTasks) {
          results.push({
            id: task.id,
            type: "task",
            title: task.title,
            description: task.description,
            url: `/tasks?id=${task.id}`,
            metadata: {
              status: task.completed ? "completed" : "active",
              priority: task.priority,
              dueDate: task.dueDate,
              projectName: task.projectId ? projectMap.get(task.projectId) : undefined,
              assigneeName: task.assignedToId ? assigneeMap.get(task.assignedToId) : undefined
            }
          });
        }
      } catch (error) {
        console.error("Error searching tasks:", error);
      }
      
      // Search projects
      try {
        const projects = await storage.getProjects();
        const matchingProjects = projects.filter(project => 
          project.name.toLowerCase().includes(query) ||
          project.description?.toLowerCase().includes(query)
        ).slice(0, 5);
        
        for (const project of matchingProjects) {
          results.push({
            id: project.id,
            type: "project",
            title: project.name,
            description: project.description,
            url: `/project/${project.id}`,
            metadata: {
              status: project.status
            }
          });
        }
      } catch (error) {
        console.error("Error searching projects:", error);
      }
      
      // Search clients
      try {
        const clients = await storage.getClients();
        const matchingClients = clients.filter(client => 
          client.name.toLowerCase().includes(query) ||
          client.company?.toLowerCase().includes(query) ||
          client.email?.toLowerCase().includes(query)
        ).slice(0, 3);
        
        for (const client of matchingClients) {
          results.push({
            id: client.id,
            type: "client",
            title: client.name,
            description: client.company ? `${client.company} - ${client.email}` : client.email,
            url: `/client/${client.id}`,
            metadata: {}
          });
        }
      } catch (error) {
        console.error("Error searching clients:", error);
      }
      
      // Search invoices
      try {
        const invoices = await storage.getInvoices();
        const matchingInvoices = invoices.filter(invoice => 
          invoice.invoiceNumber?.toLowerCase().includes(query) ||
          invoice.notes?.toLowerCase().includes(query)
        ).slice(0, 3);
        
        // Optimize: Batch fetch clients to eliminate N+1 queries
        const clientIds = [...new Set(matchingInvoices.map(i => i.clientId).filter(Boolean))];
        const invoiceClients = clientIds.length > 0 ? await storage.getClients() : [];
        const clientMap = new Map(invoiceClients.map(c => [c.id, c.name]));
        
        for (const invoice of matchingInvoices) {
          const clientName = invoice.clientId ? clientMap.get(invoice.clientId) : undefined;
          
          results.push({
            id: invoice.id,
            type: "invoice",
            title: invoice.invoiceNumber || `Invoice ${invoice.id}`,
            description: clientName ? `${clientName} - $${invoice.subtotal || 0}` : `$${invoice.subtotal || 0}`,
            url: `/invoices?id=${invoice.id}`,
            metadata: {
              status: invoice.status
            }
          });
        }
      } catch (error) {
        console.error("Error searching invoices:", error);
      }
      
      // Search messages
      try {
        const messages = await storage.getMessages("");
        const matchingMessages = messages.filter(message => 
          message.subject?.toLowerCase().includes(query) ||
          message.content?.toLowerCase().includes(query) ||
          message.toUser?.email?.toLowerCase().includes(query)
        ).slice(0, 3);
        
        for (const message of matchingMessages) {
          results.push({
            id: message.id,
            type: "message",
            title: message.subject || "No Subject",
            description: message.toUser?.email || "No recipient",
            url: `/messages?id=${message.id}`,
            metadata: {
              read: message.isRead
            }
          });
        }
      } catch (error) {
        console.error("Error searching messages:", error);
      }
      
      // Sort results by relevance (exact matches first)
      results.sort((a, b) => {
        const aExact = a.title.toLowerCase() === query ? 1 : 0;
        const bExact = b.title.toLowerCase() === query ? 1 : 0;
        return bExact - aExact;
      });
      
      res.json(results.slice(0, 20)); // Limit total results
    } catch (error) {
      console.error("Error in search:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Task routes
  app.get("/api/tasks", requireAuth, cacheMiddleware(300), async (req, res) => {
    try {
      const user = req.session.user!;
      const tasks = await storage.getTasks(user.role === 'admin' ? undefined : user.id);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Users can only see tasks assigned to them, admins can see all
      const user = req.session.user!;
      if (user.role !== 'admin' && task.assignedToId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  app.post("/api/tasks", requireAuth, async (req, res) => {
    try {
      const result = insertTaskSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid task data", 
          errors: result.error.errors 
        });
      }

      const user = req.session.user!;
      const task = await storage.createTask(result.data, user.id);
      
      // **SECURITY FIX**: Invalidate cache after task creation to prevent stale data
      try {
        const { AppCache } = await import('./cache-service');
        const cache = AppCache.getInstance();
        
        // Clear user-specific caches
        await cache.delPattern(`api:GET:/api/tasks:*:uid:${user.id}:*`);
        if (user.role === 'admin') {
          await cache.delPattern(`api:GET:/api/tasks:*`);
        }
        
        // Clear entity caches
        await cache.deleteByTags(['task-data']);
      } catch (cacheError) {
        console.warn('Cache invalidation failed:', cacheError);
      }
      
      // Send notifications for high priority tasks
      if (task.priority === 'high' && task.assignedToId) {
        const users = await storage.getUsers();
        const assignedUser = users.find(u => u.id === task.assignedToId);
        if (assignedUser) {
          console.log(`📬 Sending notifications for high priority task: ${task.title}`);
          console.log(`📧 Email: ${assignedUser.notificationEmail}, Opt-in: ${assignedUser.emailOptIn}`);
          console.log(`📱 Phone: ${assignedUser.phone}, SMS Opt-in: ${assignedUser.smsOptIn}`);
          
          try {
            // Send email notification
            const emailSent = await sendHighPriorityTaskNotification(task, assignedUser);
            console.log(`📧 Email notification result: ${emailSent ? 'SUCCESS' : 'FAILED'}`);
            
            // Send SMS notification if enabled
            if (assignedUser.smsOptIn) {
              const smsSent = await sendSMSNotification(task, assignedUser);
              console.log(`📱 SMS notification result: ${smsSent ? 'SUCCESS' : 'FAILED'}`);
            }
          } catch (error) {
            console.error("❌ Error sending notifications:", error);
            // Don't fail the task creation if notifications fail
          }
        }
      } else {
        console.log(`⚠️ No notifications sent - Priority: ${task.priority}, AssignedToId: ${task.assignedToId}`);
      }
      
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const result = updateTaskSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid task data", 
          errors: result.error.errors 
        });
      }

      // Check permissions
      const user = req.session.user!;
      const existingTask = await storage.getTask(id);
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Users can only update tasks assigned to them, admins can update all
      if (user.role !== 'admin' && existingTask.assignedToId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { progress, ...updateData } = result.data;
      const task = await storage.updateTask(id, updateData);
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Add progress note to task
  app.post("/api/tasks/:id/progress", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { date, comment } = req.body;
      
      if (!date || !comment?.trim()) {
        return res.status(400).json({ message: "Date and comment are required" });
      }

      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Check permissions
      const user = req.session.user!;
      if (user.role !== 'admin' && task.assignedToId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Create new progress note
      const progressNote = {
        id: crypto.randomUUID(),
        date,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
      };

      const currentProgress = Array.isArray(task.progressNotes) ? task.progressNotes : [];
      const updatedProgressNotes = [...currentProgress, progressNote];

      const updatedTask = await storage.updateTask(id, {
        progressNotes: updatedProgressNotes,
      });

      res.json(updatedTask);
    } catch (error) {
      console.error("Error adding progress note:", error);
      res.status(500).json({ message: "Failed to add progress note" });
    }
  });

  app.delete("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check permissions
      const user = req.session.user!;
      const existingTask = await storage.getTask(id);
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Only admins can delete tasks
      if (user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const success = await storage.deleteTask(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Project routes
  app.get("/api/projects", requireAuth, cacheMiddleware(600), async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.patch("/api/projects/:id/status", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || !["active", "completed", "on-hold", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Valid status is required" });
      }

      const project = await storage.updateProject(id, { status });
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error updating project status:", error);
      res.status(500).json({ message: "Failed to update project status" });
    }
  });

  app.post("/api/projects", requireAuth, async (req, res) => {
    try {
      const result = insertProjectSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid project data", 
          errors: result.error.errors 
        });
      }

      const project = await storage.createProject(result.data);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // Task dependency routes
  app.post("/api/task-dependencies", requireAuth, async (req, res) => {
    try {
      const { taskId, dependsOnTaskId } = req.body;
      
      if (!taskId || !dependsOnTaskId) {
        return res.status(400).json({ message: "Task ID and depends on task ID are required" });
      }

      // Check for circular dependencies
      const wouldCreateCircle = await storage.wouldCreateCircularDependency(taskId, dependsOnTaskId);
      if (wouldCreateCircle) {
        return res.status(400).json({ message: "Cannot create circular dependency" });
      }

      const dependency = await storage.createTaskDependency({ dependentTaskId: taskId, dependsOnTaskId });
      res.status(201).json(dependency);
    } catch (error) {
      console.error("Error creating task dependency:", error);
      res.status(500).json({ message: "Failed to create task dependency" });
    }
  });

  app.delete("/api/task-dependencies/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteTaskDependency(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting task dependency:", error);
      res.status(500).json({ message: "Failed to delete task dependency" });
    }
  });

  // Special route for project tasks
  app.get("/api/tasks/project/:projectId", requireAuth, async (req, res) => {
    try {
      const user = req.session.user!;
      const projectId = req.params.projectId;
      const tasks = await storage.getTasksByProject(projectId, user.role === 'admin' ? null : user.id);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching project tasks:", error);
      res.status(500).json({ message: "Failed to fetch project tasks" });
    }
  });

  // Subtask routes
  app.get("/api/tasks/:id/subtasks", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const subtasks = await storage.getSubtasks(id);
      res.json(subtasks);
    } catch (error) {
      console.error("Error fetching subtasks:", error);
      res.status(500).json({ message: "Failed to fetch subtasks" });
    }
  });

  app.post("/api/tasks/:id/subtasks", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const result = insertTaskSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid task data", 
          errors: result.error.errors 
        });
      }

      // Verify parent task exists
      const parentTask = await storage.getTask(id);
      if (!parentTask) {
        return res.status(404).json({ message: "Parent task not found" });
      }

      const user = req.session.user!;
      const subtask = await storage.createTask({
        ...result.data,
        parentTaskId: id,
        projectId: parentTask.projectId, // Inherit project from parent
        progress: result.data.progress && Array.isArray(result.data.progress) ? result.data.progress : undefined
      }, user.id);
      
      res.status(201).json(subtask);
    } catch (error) {
      console.error("Error creating subtask:", error);
      res.status(500).json({ message: "Failed to create subtask" });
    }
  });

  // Get tasks with subtasks
  app.get("/api/tasks-with-subtasks", requireAuth, async (req, res) => {
    try {
      const user = req.session.user!;
      const tasks = await storage.getTasksWithSubtasks(user.role === 'admin' ? undefined : user.id);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks with subtasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks with subtasks" });
    }
  });

  // =================== TIME TRACKING ROUTES ===================

  // Start timer
  app.post("/api/timelogs/start", requireAuth, async (req, res) => {
    try {
      const result = startTimerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid timer data", 
          errors: result.error.issues 
        });
      }

      const user = req.session.user!;
      
      // Stop any existing active timer for this user
      await storage.stopActiveTimer(user.id);

      // Create new time log
      const timeLog = await storage.createTimeLog({
        userId: user.id,
        taskId: result.data.taskId || null,
        projectId: result.data.projectId || null,
        description: result.data.description,
        startTime: new Date(),
        endTime: null,
        isActive: true,
        isManualEntry: false,
        editHistory: [],
      });

      res.status(201).json(timeLog);
    } catch (error) {
      console.error("Error starting timer:", error);
      res.status(500).json({ message: "Failed to start timer" });
    }
  });

  // Stop timer
  app.post("/api/timelogs/stop", requireAuth, async (req, res) => {
    try {
      const result = stopTimerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid stop timer data", 
          errors: result.error.issues 
        });
      }

      const user = req.session.user!;
      const timeLog = await storage.getTimeLog(result.data.timeLogId);
      
      if (!timeLog) {
        return res.status(404).json({ message: "Time log not found" });
      }

      if (timeLog.userId !== user.id) {
        return res.status(403).json({ message: "Not authorized to stop this timer" });
      }

      if (!timeLog.isActive) {
        return res.status(400).json({ message: "Timer is not active" });
      }

      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - new Date(timeLog.startTime).getTime()) / 1000);

      const updatedTimeLog = await storage.updateTimeLog(timeLog.id, {
        endTime,
        duration: duration.toString(),
        isActive: false,
      });

      res.json(updatedTimeLog);
    } catch (error) {
      console.error("Error stopping timer:", error);
      res.status(500).json({ message: "Failed to stop timer" });
    }
  });

  // Get current active timer
  app.get("/api/timelogs/active", requireAuth, async (req, res) => {
    try {
      const user = req.session.user!;
      const activeTimeLog = await storage.getActiveTimeLog(user.id);
      res.json(activeTimeLog || null);
    } catch (error) {
      console.error("Error fetching active timer:", error);
      res.status(500).json({ message: "Failed to fetch active timer" });
    }
  });

  // Get time logs
  app.get("/api/timelogs", requireAuth, async (req, res) => {
    try {
      const user = req.session.user!;
      const projectId = req.query.projectId as string | undefined;
      
      const timeLogs = await storage.getTimeLogs(
        user.role === 'admin' ? undefined : user.id,
        projectId
      );
      
      res.json(timeLogs);
    } catch (error) {
      console.error("Error fetching time logs:", error);
      res.status(500).json({ message: "Failed to fetch time logs" });
    }
  });

  // Get uninvoiced approved time logs for invoice import
  app.get("/api/timelogs/uninvoiced", requireAuth, async (req, res) => {
    try {
      const user = req.session.user!;
      const projectId = req.query.projectId as string | undefined;
      const clientId = req.query.clientId as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      
      // Fetch all time logs based on user role
      const allTimeLogs = await storage.getTimeLogs(
        user.role === 'admin' ? undefined : user.id,
        projectId
      );
      
      // Filter for approved time logs that haven't been invoiced
      let uninvoicedLogs = allTimeLogs.filter(log => 
        log.approvalStatus === 'approved' && 
        !log.invoiceId &&
        !log.isSelectedForInvoice
      );
      
      // Apply additional filters if provided
      if (clientId && uninvoicedLogs.length > 0) {
        // Filter by project's clientId
        uninvoicedLogs = uninvoicedLogs.filter(log => 
          log.project?.clientId === clientId
        );
      }
      
      if (startDate) {
        const start = new Date(startDate);
        uninvoicedLogs = uninvoicedLogs.filter(log => 
          new Date(log.startTime) >= start
        );
      }
      
      if (endDate) {
        const end = new Date(endDate);
        uninvoicedLogs = uninvoicedLogs.filter(log => 
          new Date(log.startTime) <= end
        );
      }
      
      res.json(uninvoicedLogs);
    } catch (error) {
      console.error("Error fetching uninvoiced time logs:", error);
      res.status(500).json({ message: "Failed to fetch uninvoiced time logs" });
    }
  });

  // Get productivity stats
  app.get("/api/productivity/stats", requireAuth, async (req, res) => {
    try {
      const user = req.session.user!;
      const days = parseInt(req.query.days as string) || 30;
      
      const stats = await storage.getUserProductivityStats(user.id, days);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching productivity stats:", error);
      res.status(500).json({ message: "Failed to fetch productivity stats" });
    }
  });

  // Get streaks data
  app.get("/api/streaks", requireAuth, async (req, res) => {
    try {
      const user = req.session.user!;
      const [stats14, stats30] = await Promise.all([
        storage.getUserProductivityStats(user.id, 14),
        storage.getUserProductivityStats(user.id, 30)
      ]);
      
      res.json({
        last14Days: {
          streakDays: stats14.streakDays,
          totalHours: stats14.totalHours,
          averageDailyHours: stats14.averageDailyHours,
          utilizationPercent: stats14.utilizationPercent,
        },
        last30Days: {
          streakDays: stats30.streakDays,
          totalHours: stats30.totalHours,
          averageDailyHours: stats30.averageDailyHours,
          utilizationPercent: stats30.utilizationPercent,
        }
      });
    } catch (error) {
      console.error("Error fetching streaks:", error);
      res.status(500).json({ message: "Failed to fetch streaks" });
    }
  });

  // Update time log (manual edit)
  app.put("/api/timelogs/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const result = updateTimeLogSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid time log data", 
          errors: result.error.issues 
        });
      }

      const user = req.session.user!;
      const existingTimeLog = await storage.getTimeLog(id);
      
      if (!existingTimeLog) {
        return res.status(404).json({ message: "Time log not found" });
      }

      if (existingTimeLog.userId !== user.id && user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to edit this time log" });
      }

      // Create audit trail entry
      const editHistory = Array.isArray(existingTimeLog.editHistory) ? [...existingTimeLog.editHistory] : [];
      editHistory.push({
        timestamp: new Date().toISOString(),
        changes: {
          startTime: existingTimeLog.startTime,
          endTime: existingTimeLog.endTime,
          duration: existingTimeLog.duration,
          description: existingTimeLog.description,
        },
        editedBy: user.id,
        reason: "Manual edit",
      });

      const updatedTimeLog = await storage.updateTimeLog(id, {
        ...result.data,
        isManualEntry: true,
        editHistory,
      });

      res.json(updatedTimeLog);
    } catch (error) {
      console.error("Error updating time log:", error);
      res.status(500).json({ message: "Failed to update time log" });
    }
  });

  // Delete time log
  app.delete("/api/timelogs/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.session.user!;
      
      const timeLog = await storage.getTimeLog(id);
      if (!timeLog) {
        return res.status(404).json({ message: "Time log not found" });
      }

      if (timeLog.userId !== user.id && user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to delete this time log" });
      }

      const success = await storage.deleteTimeLog(id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Time log not found" });
      }
    } catch (error) {
      console.error("Error deleting time log:", error);
      res.status(500).json({ message: "Failed to delete time log" });
    }
  });

  // Template routes
  app.get("/api/templates", requireAuth, async (req, res) => {
    try {
      const { type } = req.query;
      const userId = req.session.user?.id;
      const templates = await storage.getTemplates(type as string, userId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/:id", requireAuth, async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  app.post("/api/templates", requireAuth, async (req, res) => {
    try {
      const result = insertTemplateSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid template data",
          errors: result.error.errors
        });
      }

      const templateData = {
        ...result.data,
        createdById: req.session.user!.id
      };

      const template = await storage.createTemplate({
        ...templateData,
        variables: templateData.variables || []
      });
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  // Smart Template Suggestion route with AI and fallback
  app.post("/api/ai/suggest-template-fields", requireAuth, async (req, res) => {
    try {
      const { templateType, description, businessContext } = req.body;
      
      if (!templateType || !description) {
        return res.status(400).json({ 
          message: "Template type and description are required" 
        });
      }

      // Fallback suggestion templates for when OpenAI is unavailable
      const fallbackTemplates = {
        proposal: [
          { name: "client_name", label: "Client Name", type: "text", required: true, placeholder: "Enter client company name", defaultValue: "" },
          { name: "client_email", label: "Client Email", type: "email", required: true, placeholder: "client@company.com", defaultValue: "" },
          { name: "project_title", label: "Project Title", type: "text", required: true, placeholder: "Enter project name", defaultValue: "" },
          { name: "project_scope", label: "Project Scope", type: "textarea", required: true, placeholder: "Describe the project scope and deliverables", defaultValue: "" },
          { name: "timeline", label: "Project Timeline", type: "text", required: true, placeholder: "e.g., 6-8 weeks", defaultValue: "" },
          { name: "budget", label: "Project Budget", type: "number", required: true, placeholder: "Enter proposed budget", defaultValue: "" },
          { name: "line_items", label: "Itemized Services", type: "line_items", required: false, placeholder: "", defaultValue: "" },
          { name: "terms", label: "Terms & Conditions", type: "textarea", required: false, placeholder: "Payment terms, project terms, etc.", defaultValue: "" }
        ],
        contract: [
          { name: "party_one", label: "First Party", type: "text", required: true, placeholder: "Your company name", defaultValue: "" },
          { name: "party_two", label: "Second Party", type: "text", required: true, placeholder: "Client company name", defaultValue: "" },
          { name: "contract_date", label: "Contract Date", type: "date", required: true, placeholder: "", defaultValue: "" },
          { name: "service_description", label: "Service Description", type: "textarea", required: true, placeholder: "Detailed description of services to be provided", defaultValue: "" },
          { name: "contract_value", label: "Contract Value", type: "number", required: true, placeholder: "Total contract amount", defaultValue: "" },
          { name: "payment_terms", label: "Payment Terms", type: "textarea", required: true, placeholder: "Payment schedule and terms", defaultValue: "" },
          { name: "start_date", label: "Start Date", type: "date", required: true, placeholder: "", defaultValue: "" },
          { name: "end_date", label: "End Date", type: "date", required: false, placeholder: "", defaultValue: "" }
        ],
        invoice: [
          { name: "invoice_number", label: "Invoice Number", type: "text", required: true, placeholder: "INV-001", defaultValue: "" },
          { name: "invoice_date", label: "Invoice Date", type: "date", required: true, placeholder: "", defaultValue: "" },
          { name: "due_date", label: "Due Date", type: "date", required: true, placeholder: "", defaultValue: "" },
          { name: "bill_to_name", label: "Bill To", type: "text", required: true, placeholder: "Client name", defaultValue: "" },
          { name: "bill_to_address", label: "Billing Address", type: "textarea", required: true, placeholder: "Client billing address", defaultValue: "" },
          { name: "line_items", label: "Invoice Items", type: "line_items", required: true, placeholder: "", defaultValue: "" },
          { name: "subtotal", label: "Subtotal", type: "number", required: false, placeholder: "Calculated automatically", defaultValue: "" },
          { name: "tax_rate", label: "Tax Rate (%)", type: "number", required: false, placeholder: "e.g., 8.5", defaultValue: "" },
          { name: "total_amount", label: "Total Amount", type: "number", required: true, placeholder: "Final amount due", defaultValue: "" }
        ],
        deck: [
          { name: "presentation_title", label: "Presentation Title", type: "text", required: true, placeholder: "Enter presentation title", defaultValue: "" },
          { name: "presenter_name", label: "Presenter Name", type: "text", required: true, placeholder: "Your name or company", defaultValue: "" },
          { name: "audience", label: "Target Audience", type: "text", required: false, placeholder: "Who is this presentation for?", defaultValue: "" },
          { name: "presentation_date", label: "Presentation Date", type: "date", required: false, placeholder: "", defaultValue: "" },
          { name: "key_message", label: "Key Message", type: "textarea", required: true, placeholder: "Main message or value proposition", defaultValue: "" },
          { name: "call_to_action", label: "Call to Action", type: "text", required: false, placeholder: "What should the audience do next?", defaultValue: "" },
          { name: "contact_info", label: "Contact Information", type: "textarea", required: false, placeholder: "How to reach you", defaultValue: "" }
        ]
      };

      let suggestions = [];
      let aiGenerated = false;

      // Try OpenAI first if available and quota allows
      if (process.env.OPENAI_API_KEY) {
        try {
          const { default: OpenAI } = await import('openai');
          const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

          const prompt = `As an expert business template contractor, analyze this ${templateType} template request and suggest appropriate form fields.

Business Context: ${businessContext}
Template Type: ${templateType}
Description: ${description}

Generate 4-8 intelligent form field suggestions that would be most relevant for this ${templateType}. For each field, provide:
- name: snake_case variable name (no spaces, lowercase)
- label: Human-readable field label
- type: one of [text, textarea, number, date, email, phone, line_items]
- required: boolean (true for essential fields)
- placeholder: helpful placeholder text
- defaultValue: sensible default if applicable

Focus on fields that are:
1. Essential for this type of ${templateType}
2. Commonly needed in business scenarios
3. Professional and practical
4. Specific to the described use case

Return a JSON object with a "suggestions" array containing the field objects.`;

          // Using stable gpt-4o model for reliable content generation
          const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: "You are an expert business template contractor. Always respond with valid JSON only, no markdown or extra text."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            response_format: { type: "json_object" },
            max_tokens: 1500,
            temperature: 0.7,
          });

          const aiSuggestions = JSON.parse(completion.choices[0].message.content || '{"suggestions":[]}');
          
          suggestions = (aiSuggestions.suggestions || [])
            .filter((s: any) => s.name && s.label && s.type)
            .map((s: any) => ({
              name: s.name,
              label: s.label,
              type: s.type,
              required: s.required || false,
              placeholder: s.placeholder || "",
              defaultValue: s.defaultValue || ""
            }))
            .slice(0, 8);

          aiGenerated = true;
        } catch (openaiError) {
          console.log("OpenAI unavailable, using fallback suggestions:", (openaiError as Error).message);
          // Fall through to fallback
        }
      }

      // Use fallback if OpenAI failed or is unavailable
      if (suggestions.length === 0) {
        const baseTemplate = fallbackTemplates[templateType as keyof typeof fallbackTemplates] || fallbackTemplates.proposal;
        
        // Customize based on description keywords
        suggestions = baseTemplate.map(field => ({
          ...field,
          // Add context-aware customizations based on description
          placeholder: customizePlaceholder(field, description, templateType)
        }));
      }

      res.json({ 
        suggestions,
        templateType,
        aiGenerated,
        source: aiGenerated ? "openai" : "smart_fallback",
        generatedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error("Error generating suggestions:", error);
      res.status(500).json({ 
        message: "Failed to generate suggestions. Please try again or add fields manually." 
      });
    }
  });

  // Helper function to customize placeholders based on context
  function customizePlaceholder(field: any, description: string, templateType: string) {
    const desc = description.toLowerCase();
    
    // Context-aware placeholder customization
    if (field.name === "project_scope" && desc.includes("website")) {
      return "Website design, development, testing, and deployment";
    }
    if (field.name === "project_scope" && desc.includes("marketing")) {
      return "Marketing strategy, campaign creation, and performance tracking";
    }
    if (field.name === "timeline" && desc.includes("urgent")) {
      return "Rush delivery - 2-3 weeks";
    }
    if (field.name === "service_description" && desc.includes("consulting")) {
      return "Strategic consulting services including analysis, recommendations, and implementation guidance";
    }
    
    return field.placeholder;
  }

  app.patch("/api/templates/:id", requireAuth, async (req, res) => {
    try {
      const result = updateTemplateSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid template data",
          errors: result.error.errors
        });
      }

      const template = await storage.updateTemplate(req.params.id, {
        ...result.data,
        variables: result.data.variables || []
      });
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error updating template:", error);
      res.status(500).json({ message: "Failed to update template" });
    }
  });

  app.delete("/api/templates/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteTemplate(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  // Proposal routes
  app.get("/api/proposals", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      const proposals = await storage.getProposals(userId);
      res.json(proposals);
    } catch (error) {
      console.error("Error fetching proposals:", error);
      res.status(500).json({ message: "Failed to fetch proposals" });
    }
  });

  app.get("/api/proposals/:id", requireAuth, async (req, res) => {
    try {
      const proposal = await storage.getProposal(req.params.id);
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }
      res.json(proposal);
    } catch (error) {
      console.error("Error fetching proposal:", error);
      res.status(500).json({ message: "Failed to fetch proposal" });
    }
  });

  // Public route for viewing shared proposals
  app.get("/api/shared/proposals/:shareableLink", async (req, res) => {
    try {
      const proposal = await storage.getProposalByShareableLink(req.params.shareableLink);
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }

      // Mark as viewed if not already
      if (!proposal.viewedAt) {
        await storage.updateProposal(proposal.id, {
          viewedAt: new Date(),
          status: proposal.status === 'sent' ? 'viewed' : proposal.status
        });
      }

      res.json(proposal);
    } catch (error) {
      console.error("Error fetching shared proposal:", error);
      res.status(500).json({ message: "Failed to fetch proposal" });
    }
  });

  // Variable substitution helper function - updated for form-builder approach
  const generateFormattedContent = (template: any, variables: Record<string, any>, title: string): string => {
    // If template has content (legacy), use substitution
    if (template.content && template.content.trim()) {
      let result = template.content;
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, String(value || ''));
      }
      return result;
    }
    
    // Otherwise, generate content from form fields (form-builder approach)
    let content = `# ${title}\n\n`;
    content += `**Template:** ${template.name}\n`;
    content += `**Type:** ${template.type.charAt(0).toUpperCase() + template.type.slice(1)}\n`;
    content += `**Generated:** ${new Date().toLocaleDateString()}\n\n`;
    
    if (template.description) {
      content += `${template.description}\n\n`;
    }
    
    content += `---\n\n`;

    // Format each field nicely based on its type
    if (template.variables && Array.isArray(template.variables)) {
      template.variables.forEach((variable: any) => {
        const value = variables[variable.name] || variable.defaultValue || "";
        
        content += `## ${variable.label}\n`;
        
        if (variable.type === 'line_items') {
          const lineItems = Array.isArray(value) ? value : [];
          if (lineItems.length > 0) {
            content += `\n| Description | Qty | Cost | Subtotal |\n`;
            content += `|-------------|-----|------|----------|\n`;
            
            let total = 0;
            lineItems.forEach((item: any) => {
              const qty = item.quantity || 0;
              const cost = item.cost || 0;
              const subtotal = qty * cost;
              total += subtotal;
              
              content += `| ${item.description || 'N/A'} | ${qty} | $${cost.toLocaleString('en-US', { minimumFractionDigits: 2 })} | $${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} |\n`;
            });
            
            content += `\n**Total: $${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}**\n\n`;
          } else {
            content += `*No line items specified*\n\n`;
          }
        } else if (variable.type === 'number') {
          content += `💰 **Amount:** $${parseFloat(value || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}\n\n`;
        } else if (variable.type === 'date') {
          const dateValue = value ? new Date(value).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }) : 'Not specified';
          content += `📅 **Date:** ${dateValue}\n\n`;
        } else if (variable.type === 'email') {
          content += `📧 **Email:** ${value}\n\n`;
        } else if (variable.type === 'phone') {
          content += `📞 **Phone:** ${value}\n\n`;
        } else if (variable.type === 'textarea') {
          content += `${value}\n\n`;
        } else {
          content += `${value}\n\n`;
        }
      });
    }

    content += `---\n\n*Generated from ${template.name} template on ${new Date().toLocaleDateString()}*`;
    return content;
  };

  // Direct proposal creation (form-based)
  app.post("/api/proposals", requireAuth, async (req, res) => {
    try {
      // Check if this is template-based or direct proposal creation
      if (req.body.templateId) {
        // Template-based proposal generation
        const result = generateProposalSchema.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({
            message: "Invalid proposal data",
            errors: result.error.errors
          });
        }

        const { templateId, title, projectId, clientName, clientEmail, variables, expiresInDays } = result.data;

        // Get template
        const template = await storage.getTemplate(templateId);
        if (!template) {
          return res.status(404).json({ message: "Template not found" });
        }

        // Generate formatted content from form fields or substitute variables
        const content = generateFormattedContent(template, variables, title);

        // Calculate expiry date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);

        const proposalData = {
          title,
          templateId: templateId || null,
          projectId: projectId || null,
          clientName,
          clientEmail,
          content,
          variables,
          expiresAt,
          createdById: req.session.user!.id,
          metadata: {}
        };

        // Check if client exists, create if not (template-based)
        let proposalClientId: string | undefined;
        if (!proposalClientId && clientName && clientEmail) {
          // Check if client exists by email
          const existingClients = await storage.getClients();
          let existingClient = existingClients.find(c => c.email === clientEmail);
          
          if (!existingClient) {
            // Create new client automatically
            const newClient = await storage.createClient({
              name: clientName,
              email: clientEmail,
              status: 'prospect'
            });
            existingClient = newClient;
            console.log(`✅ Created new client: ${newClient.name} (${newClient.email})`);
          }
          
          proposalClientId = existingClient.id;
        }

        const proposal = await storage.createProposal(proposalData);
        console.log(`📄 Created proposal "${proposal.title}" for client: ${proposal.clientName}`);
        res.status(201).json(proposal);
      } else {
        // Direct proposal creation
        const result = directProposalSchema.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({
            message: "Invalid proposal data",
            errors: result.error.errors
          });
        }

        const { title, projectId, clientName, clientEmail, projectDescription, totalBudget, timeline, deliverables, terms, lineItems, calculatedTotal, expiresInDays } = result.data;

        // Calculate expiry date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);

        // Create or find existing client
        let directClientId = null;
        if (clientName && clientEmail) {
          // Check if client already exists
          const existingClients = await storage.getClients();
          let existingClient = existingClients.find(c => c.email === clientEmail);
          
          if (!existingClient) {
            // Create new client
            const clientData = {
              name: clientName,
              email: clientEmail,
              status: 'prospect' as const,
              totalProposals: 1,
              totalInvoices: 0,
              totalRevenue: '0.00',
              outstandingBalance: '0.00'
            };
            existingClient = await storage.createClient(clientData);
          }
          directClientId = existingClient.id;
        }

        // Generate content for direct proposals
        let content = `# ${title}\n\n`;
        content += `**Prepared for:** ${clientName}\n`;
        if (clientEmail) content += `**Email:** ${clientEmail}\n\n`;
        
        if (projectDescription) {
          content += `## Project Overview\n${projectDescription}\n\n`;
        }
        
        if (timeline) {
          content += `## Timeline\n${timeline}\n\n`;
        }
        
        if (lineItems && lineItems.length > 0) {
          content += `## Services & Pricing\n\n`;
          content += `| Service | Qty | Rate | Amount |\n`;
          content += `|---------|-----|------|--------|\n`;
          lineItems.forEach((item: any) => {
            content += `| ${item.description || 'Service'} | ${item.quantity} | $${item.rate.toFixed(2)} | $${item.amount.toFixed(2)} |\n`;
          });
          content += `\n**Total: $${calculatedTotal.toFixed(2)}**\n\n`;
        }
        
        if (deliverables) {
          content += `## Deliverables\n${deliverables}\n\n`;
        }
        
        if (terms) {
          content += `## Terms & Conditions\n${terms}\n\n`;
        }
        
        content += `---\n\n*Generated on ${new Date().toLocaleDateString()}*`;

        const proposalData = {
          title,
          projectId: projectId || null,
          clientId: directClientId,
          clientName,
          clientEmail,
          projectDescription,
          totalBudget: totalBudget.toString(),
          timeline,
          deliverables,
          terms,
          lineItems,
          calculatedTotal: calculatedTotal.toString(),
          expiresInDays,
          expiresAt,
          content,
          createdById: req.session.user!.id,
          status: 'draft' as const,
          variables: {},
          metadata: {}
        };

        // Check if client exists, create if not (direct proposal)
        let assignedClientId = proposalData.clientId;
        if (!assignedClientId && result.data.clientName && result.data.clientEmail) {
          // Check if client exists by email
          const existingClients = await storage.getClients();
          let existingClient = existingClients.find(c => c.email === result.data.clientEmail);
          
          if (!existingClient) {
            // Create new client automatically
            const newClient = await storage.createClient({
              name: result.data.clientName,
              email: result.data.clientEmail,
              status: 'prospect'
            });
            existingClient = newClient;
            console.log(`✅ Created new client: ${newClient.name} (${newClient.email})`);
          }
          
          assignedClientId = existingClient.id;
          proposalData.clientId = assignedClientId;
        }

        const proposal = await storage.createProposal(proposalData);
        console.log(`📄 Created proposal "${proposal.title}" for client: ${proposal.clientName}`);
        res.status(201).json(proposal);
      }
    } catch (error) {
      console.error("Error creating proposal:", error);
      res.status(500).json({ message: "Failed to create proposal" });
    }
  });

  app.patch("/api/proposals/:id", requireAuth, async (req, res) => {
    try {
      const result = updateProposalSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid proposal data",
          errors: result.error.errors
        });
      }

      // Sanitize foreign key fields to prevent empty string constraint violations
      const sanitizedData = sanitizeForeignKeys(result.data, ['projectId', 'clientId', 'templateId', 'parentProposalId']);

      const proposal = await storage.updateProposal(req.params.id, sanitizedData);
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }
      res.json(proposal);
    } catch (error) {
      console.error("Error updating proposal:", error);
      res.status(500).json({ message: "Failed to update proposal" });
    }
  });

  app.delete("/api/proposals/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteProposal(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Proposal not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting proposal:", error);
      res.status(500).json({ message: "Failed to delete proposal" });
    }
  });

  app.post("/api/proposals/:id/send", requireAuth, async (req, res) => {
    try {
      const result = sendProposalSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid send data",
          errors: result.error.errors
        });
      }

      const proposal = await storage.getProposal(req.params.id);
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }

      // Generate shareable link
      const shareableLink = await storage.generateShareableLink(proposal.id);

      // Update proposal status and sent timestamp
      const updatedProposal = await storage.updateProposal(proposal.id, {
        status: 'sent',
        sentAt: new Date()
      });

      // Send enhanced email if client email is provided
      const { clientEmail: recipientEmail, message } = result.data;
      const emailTo = recipientEmail || proposal.clientEmail;
      const includePDF = true; // Default to include PDF
      
      if (emailTo) {
        try {
          const proposalUrl = `${req.protocol}://${req.get('host')}/shared/proposals/${shareableLink}`;
          
          // Get client details if available
          const client = proposal.clientId ? await storage.getClient(proposal.clientId) : null;
          
          let pdfAttachment: Buffer | undefined;
          
          // Generate PDF if requested
          if (includePDF) {
            try {
              console.log('🔄 Generating PDF for proposal:', proposal.title);
              pdfAttachment = await generateProposalPDF({
                ...proposal,
                clientName: client?.name || 'Valued Client',
                clientEmail: emailTo,
              });
              console.log('✅ PDF generated successfully');
            } catch (pdfError) {
              console.error('❌ PDF generation failed:', pdfError);
              // Continue without PDF if generation fails
            }
          }

          // Send the email with enhanced template and optional PDF
          const emailSent = await sendProposalEmail(
            emailTo,
            proposal.title,
            proposalUrl,
            client?.name || 'Valued Client',
            message || 'We are pleased to present our proposal for your review.',
            pdfAttachment
          );

          if (!emailSent) {
            console.error("Failed to send proposal email");
          } else {
            console.log(`📧 Enhanced proposal email sent for proposal ${proposal.id} to ${emailTo}${includePDF ? ' with PDF attachment' : ''}`);
          }
        } catch (emailError) {
          console.error("Failed to send proposal email:", emailError);
          // Don't fail the request if email sending fails
        }
      }

      res.json({
        ...updatedProposal,
        shareableUrl: `${req.protocol}://${req.get('host')}/shared/proposals/${shareableLink}`
      });
    } catch (error) {
      console.error("Error sending proposal:", error);
      res.status(500).json({ message: "Failed to send proposal" });
    }
  });

  // Enhanced proposal response endpoint (for clients)
  app.post("/api/shared/proposals/:shareableLink/respond", async (req, res) => {
    try {
      const { response, message } = req.body;
      
      // Enhanced validation for all response types
      if (!response || !['accepted', 'rejected', 'revision_requested'].includes(response)) {
        return res.status(400).json({ 
          message: "Valid response is required", 
          validResponses: ['accepted', 'rejected', 'revision_requested'] 
        });
      }

      const proposal = await storage.getProposalByShareableLink(req.params.shareableLink);
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }

      // Check if proposal is expired
      if (proposal.expiresAt && new Date() > new Date(proposal.expiresAt)) {
        return res.status(400).json({ message: "This proposal has expired and can no longer be responded to" });
      }

      // Update proposal status based on response
      const updateData: any = {
        status: response,
        respondedAt: new Date(),
        responseMessage: message || ""
      };

      // Set acceptedAt timestamp for accepted proposals
      if (response === 'accepted') {
        updateData.acceptedAt = new Date();
      }

      const updatedProposal = await storage.updateProposal(proposal.id, updateData);

      // Send notification email to business owner
      try {
        await sendProposalResponseNotification(proposal, response, message);
      } catch (emailError) {
        console.error("Failed to send response notification:", emailError);
        // Don't fail the request if email fails
      }

      // Handle revision requests - create new proposal version
      if (response === 'revision_requested') {
        const message_response = `Revision requested successfully. The business team will review your feedback and create an updated proposal.`;
        res.json({ 
          message: message_response, 
          proposal: updatedProposal,
          nextSteps: "A new proposal version will be created and sent to you for review."
        });
      } else {
        const message_response = `Proposal ${response} successfully${response === 'accepted' ? '. Thank you for your business!' : '. Thank you for your time.'}`;
        res.json({ message: message_response, proposal: updatedProposal });
      }
    } catch (error) {
      console.error("Error responding to proposal:", error);
      res.status(500).json({ message: "Failed to respond to proposal" });
    }
  });

  // =================== PROPOSAL APPROVAL WORKFLOW MANAGEMENT ===================
  
  // Create revision for proposal (admin)
  app.post("/api/proposals/:id/create-revision", requireAuth, async (req, res) => {
    try {
      const { revisionNotes } = req.body;
      
      const proposal = await storage.getProposal(req.params.id);
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }

      const revisionProposal = await createProposalRevision(proposal, revisionNotes);
      res.status(201).json({
        message: "Proposal revision created successfully",
        revision: revisionProposal,
        originalProposal: proposal
      });
    } catch (error) {
      console.error("Error creating proposal revision:", error);
      res.status(500).json({ error: "Failed to create proposal revision" });
    }
  });

  // Get proposal approval workflow statistics
  app.get("/api/proposals/approval-stats", requireAuth, async (req, res) => {
    try {
      const stats = await getProposalApprovalStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching proposal approval stats:", error);
      res.status(500).json({ error: "Failed to fetch approval statistics" });
    }
  });

  // Get all proposals that need attention (pending responses, revision requests)
  app.get("/api/proposals/needs-attention", requireAuth, async (req, res) => {
    try {
      const proposals = await storage.getProposals();
      const needsAttention = proposals.filter(p => 
        ['sent', 'viewed', 'revision_requested'].includes(p.status)
      );
      
      // Sort by priority: revision_requested first, then by sent date
      needsAttention.sort((a, b) => {
        if (a.status === 'revision_requested' && b.status !== 'revision_requested') return -1;
        if (b.status === 'revision_requested' && a.status !== 'revision_requested') return 1;
        
        const aDate = new Date(a.sentAt || a.createdAt).getTime();
        const bDate = new Date(b.sentAt || b.createdAt).getTime();
        return bDate - aDate; // Most recent first
      });
      
      res.json(needsAttention);
    } catch (error) {
      console.error("Error fetching proposals needing attention:", error);
      res.status(500).json({ error: "Failed to fetch proposals needing attention" });
    }
  });

  // Get proposal revision history
  app.get("/api/proposals/:id/revisions", requireAuth, async (req, res) => {
    try {
      const proposals = await storage.getProposals();
      const parentProposal = await storage.getProposal(req.params.id);
      
      if (!parentProposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }

      // Find all revisions (proposals with this ID as parent)
      const revisions = proposals.filter(p => p.parentProposalId === req.params.id);
      
      // Sort by version number
      revisions.sort((a, b) => (a.version || 1) - (b.version || 1));
      
      res.json({
        originalProposal: parentProposal,
        revisions: revisions,
        totalVersions: revisions.length + 1
      });
    } catch (error) {
      console.error("Error fetching proposal revisions:", error);
      res.status(500).json({ error: "Failed to fetch proposal revisions" });
    }
  });

  // =================== CONTRACT MANAGEMENT SYSTEM ===================
  
  // Get all contracts
  app.get("/api/contracts", requireAuth, async (req, res) => {
    try {
      const contracts = await storage.getContracts();
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({ error: "Failed to fetch contracts" });
    }
  });

  // Get specific contract
  app.get("/api/contracts/:id", requireAuth, async (req, res) => {
    try {
      const contract = await storage.getContract(req.params.id);
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      res.json(contract);
    } catch (error) {
      console.error("Error fetching contract:", error);
      res.status(500).json({ error: "Failed to fetch contract" });
    }
  });

  // Create new contract
  app.post("/api/contracts", requireAuth, async (req, res) => {
    try {
      const contractData = insertContractSchema.parse(req.body);
      
      // Sanitize foreign key fields to prevent empty string constraint violations
      const sanitizedContractData = sanitizeForeignKeys(contractData, ['projectId', 'clientId', 'proposalId']);
      
      const newContract = {
        ...sanitizedContractData,
        contractNumber: `CNT-${Date.now()}`,
        createdById: req.session.user!.id,
        lastModifiedById: req.session.user!.id,
        status: "draft" as const,
      };

      const contract = await storage.createContract(newContract);
      console.log(`📋 Created contract "${contract.title}" (${contract.contractNumber})`);
      res.status(201).json(contract);
    } catch (error) {
      console.error("Error creating contract:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid contract data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create contract" });
    }
  });

  // Update contract
  app.put("/api/contracts/:id", requireAuth, async (req, res) => {
    try {
      const contract = await storage.getContract(req.params.id);
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }

      const updateResult = insertContractSchema.safeParse(req.body);
      if (!updateResult.success) {
        return res.status(400).json({ error: "Invalid contract data", details: updateResult.error.errors });
      }
      // Sanitize foreign key fields to prevent empty string constraint violations
      const sanitizedData = sanitizeForeignKeys(updateResult.data, ['projectId', 'clientId', 'proposalId']);
      
      const updateData = { ...sanitizedData, lastModifiedById: req.session.user!.id };

      const updatedContract = await storage.updateContract(req.params.id, updateData);
      res.json(updatedContract);
    } catch (error) {
      console.error("Error updating contract:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid contract data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update contract" });
    }
  });

  // Delete contract (only drafts)
  app.delete("/api/contracts/:id", requireAuth, async (req, res) => {
    try {
      const contract = await storage.getContract(req.params.id);
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }

      if (contract.status !== "draft") {
        return res.status(400).json({ error: "Only draft contracts can be deleted" });
      }

      const deleted = await storage.deleteContract(req.params.id);
      if (deleted) {
        res.json({ success: true, message: "Contract deleted successfully" });
      } else {
        res.status(500).json({ error: "Failed to delete contract" });
      }
    } catch (error) {
      console.error("Error deleting contract:", error);
      res.status(500).json({ error: "Failed to delete contract" });
    }
  });

  // ===== Presentation Routes =====
  
  // Create new presentation
  app.post("/api/presentations", requireAuth, async (req, res) => {
    try {
      const presentationData = insertPresentationSchema.parse(req.body);
      
      // Sanitize foreign key fields to prevent empty string constraint violations
      const sanitizedData = sanitizeForeignKeys(presentationData, ['projectId']);
      
      const newPresentation = {
        ...sanitizedData,
        createdById: req.session.user!.id,
        status: "draft" as const,
      };

      const presentation = await storage.createPresentation(newPresentation);
      console.log(`📊 Created presentation "${presentation.title}"`);
      res.status(201).json(presentation);
    } catch (error) {
      console.error("Error creating presentation:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid presentation data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create presentation" });
    }
  });

  // Get contract management statistics
  app.get("/api/contracts/stats", requireAuth, async (req, res) => {
    try {
      const stats = await contractManagementService.getContractStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching contract statistics:", error);
      res.status(500).json({ error: "Failed to fetch contract statistics" });
    }
  });

  // Manual contract status check
  app.post("/api/contracts/status-check", requireAuth, async (req, res) => {
    try {
      await contractManagementService.checkContractStatuses();
      res.json({ message: "Contract status check completed successfully" });
    } catch (error) {
      console.error("Error during contract status check:", error);
      res.status(500).json({ error: "Failed to check contract statuses" });
    }
  });

  // Get contracts needing attention (expiring, pending signatures, etc.)
  app.get("/api/contracts/needs-attention", requireAuth, async (req, res) => {
    try {
      const contracts = await storage.getContracts();
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      const needsAttention = contracts.filter(contract => {
        // Pending signatures
        if (['sent', 'viewed', 'pending_signature', 'partially_signed'].includes(contract.status || '')) {
          return true;
        }
        
        // Expiring soon
        if (contract.expirationDate && 
            new Date(contract.expirationDate) <= thirtyDaysFromNow && 
            new Date(contract.expirationDate) > today &&
            ['fully_signed', 'executed'].includes(contract.status || '')) {
          return true;
        }
        
        return false;
      });

      // Sort by priority
      needsAttention.sort((a, b) => {
        // Pending signatures first
        const aPendingSignature = ['sent', 'viewed', 'pending_signature', 'partially_signed'].includes(a.status || '');
        const bPendingSignature = ['sent', 'viewed', 'pending_signature', 'partially_signed'].includes(b.status || '');
        
        if (aPendingSignature && !bPendingSignature) return -1;
        if (bPendingSignature && !aPendingSignature) return 1;
        
        // Then by creation date
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      });

      res.json(needsAttention);
    } catch (error) {
      console.error("Error fetching contracts needing attention:", error);
      res.status(500).json({ error: "Failed to fetch contracts needing attention" });
    }
  });

  // Client Management Routes
  app.get("/api/clients", requireAuth, async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", requireAuth, async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      console.log(`✅ Client created: ${client.name} (${client.email})`);
      res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  // Proposal Routes for Client Workflow
  app.get("/api/proposals/client/:clientId", requireAuth, async (req, res) => {
    try {
      const proposals = await storage.getProposals();
      const clientProposals = proposals.filter(proposal => proposal.clientId === req.params.clientId);
      res.json(clientProposals);
    } catch (error) {
      console.error("Error fetching client proposals:", error);
      res.status(500).json({ message: "Failed to fetch proposals" });
    }
  });

  // Invoice Routes for Client Workflow
  app.get("/api/invoices/client/:clientId", requireAuth, async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      const clientInvoices = invoices.filter(invoice => invoice.clientId === req.params.clientId);
      res.json(clientInvoices);
    } catch (error) {
      console.error("Error fetching client invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Payment Routes for Client Workflow  
  app.get("/api/payments/client/:clientId", requireAuth, async (req, res) => {
    try {
      const payments = await storage.getPayments();
      const clientPayments = payments.filter(payment => payment.clientId === req.params.clientId);
      res.json(clientPayments);
    } catch (error) {
      console.error("Error fetching client payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  // Client Document Management Routes
  
  // Get documents for a client
  app.get("/api/clients/:clientId/documents", requireAuth, async (req, res) => {
    try {
      const documents = await storage.getClientDocuments(req.params.clientId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching client documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Get all client documents for filing cabinet
  app.get("/api/client-documents", requireAuth, async (req, res) => {
    try {
      const documents = await storage.getAllClientDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching all client documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Advanced search for client documents
  app.post("/api/client-documents/search", requireAuth, async (req, res) => {
    try {
      const searchParams = req.body;
      
      // Validate search params
      if (searchParams.page && searchParams.page < 1) {
        return res.status(400).json({ message: "Page must be greater than 0" });
      }
      if (searchParams.limit && (searchParams.limit < 1 || searchParams.limit > 1000)) {
        return res.status(400).json({ message: "Limit must be between 1 and 1000" });
      }

      // Convert date strings to Date objects if provided
      if (searchParams.createdDateFrom) {
        searchParams.createdDateFrom = new Date(searchParams.createdDateFrom);
      }
      if (searchParams.createdDateTo) {
        searchParams.createdDateTo = new Date(searchParams.createdDateTo);
      }
      if (searchParams.updatedDateFrom) {
        searchParams.updatedDateFrom = new Date(searchParams.updatedDateFrom);
      }
      if (searchParams.updatedDateTo) {
        searchParams.updatedDateTo = new Date(searchParams.updatedDateTo);
      }

      const result = await storage.searchClientDocuments(searchParams);
      res.json(result);
    } catch (error) {
      console.error("Error searching client documents:", error);
      res.status(500).json({ message: "Failed to search documents" });
    }
  });

  // Get a specific document
  app.get("/api/documents/:id", requireAuth, async (req, res) => {
    try {
      const document = await storage.getClientDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  // Get upload URL for document
  app.post("/api/documents/upload", requireAuth, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  // File attachment routes for tasks/projects
  
  // Get upload URL for file attachment
  app.post("/api/attachments/upload", requireAuth, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  // Create file attachment record after upload
  app.post("/api/attachments", requireAuth, async (req, res) => {
    try {
      const { fileName, originalName, filePath, fileSize, mimeType, entityType, entityId, description, isPublic, tags } = req.body;
      
      if (!fileName || !filePath || !entityType || !entityId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const attachment = await storage.createFileAttachment({
        fileName,
        originalName: originalName || fileName,
        filePath,
        fileSize: fileSize || null,
        mimeType: mimeType || null,
        entityType,
        entityId,
        uploadedById: req.session.user!.id,
        description: description || null,
        isPublic: isPublic || false,
        tags: tags || [],
        metadata: {},
        version: 1
      });

      res.status(201).json(attachment);
    } catch (error) {
      console.error("Error creating file attachment:", error);
      res.status(500).json({ message: "Failed to create file attachment" });
    }
  });

  // Get file attachments for an entity
  app.get("/api/attachments/:entityType/:entityId", requireAuth, async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const attachments = await storage.getFileAttachments(entityType as 'task' | 'project' | 'client', entityId);
      res.json(attachments);
    } catch (error) {
      console.error("Error getting file attachments:", error);
      res.status(500).json({ message: "Failed to get file attachments" });
    }
  });

  // Send invoice via email
  app.post("/api/invoices/:id/send", requireAuth, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id, req.session.user!.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      // Get client information
      const client = invoice.clientId ? await storage.getClient(invoice.clientId) : null;
      if (!client || !client.email) {
        return res.status(400).json({ message: "Client email required to send invoice" });
      }

      // Generate PDF invoice
      console.log('🔄 Generating invoice PDF for sending');
      const invoicePDF = await generateInvoicePDF({
        ...invoice,
        clientName: client.name,
        clientEmail: client.email,
      });
      console.log('✅ Invoice PDF generated successfully');

      // Send invoice email with PDF attachment
      const emailSent = await sendInvoiceEmail(
        client.email,
        {
          ...invoice,
          clientName: client.name,
          clientEmail: client.email,
        },
        invoicePDF,
        `Please find your invoice attached. Payment is due within the terms specified.`
      );

      if (emailSent) {
        // Update invoice status to sent
        await storage.updateInvoice(invoice.id, { 
          status: 'sent',
          sentAt: new Date()
        });

        console.log(`📧 Invoice sent successfully to ${client.email}`);
        res.json({
          success: true,
          message: `Invoice sent successfully to ${client.email}`,
          sentTo: client.email
        });
      } else {
        res.status(500).json({ 
          message: "Failed to send invoice email",
          error: "Email delivery failed"
        });
      }
    } catch (error) {
      console.error("Error sending invoice:", error);
      res.status(500).json({ message: "Failed to send invoice" });
    }
  });

  // Create document record after upload
  app.post("/api/clients/:clientId/documents", requireAuth, async (req, res) => {
    try {
      const validatedData = insertClientDocumentSchema.parse({
        ...req.body,
        clientId: req.params.clientId,
        createdById: req.session.user?.id
      });

      // Set object ACL policy for the uploaded file
      if (validatedData.fileUrl) {
        const objectStorageService = new ObjectStorageService();
        const normalizedPath = await objectStorageService.trySetObjectEntityAclPolicy(
          validatedData.fileUrl,
          {
            owner: req.session.user?.id || "",
            visibility: "private", // Client documents are private by default
          }
        );
        validatedData.fileUrl = normalizedPath;
      }

      const document = await storage.createClientDocument(validatedData);
      console.log(`✅ Document created: ${document.name} for client ${req.params.clientId}`);
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  // Update document
  app.put("/api/documents/:id", requireAuth, async (req, res) => {
    try {
      const updateData = req.body;
      const document = await storage.updateClientDocument(req.params.id, updateData);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  // Delete document
  app.delete("/api/documents/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteClientDocument(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Serve document files
  app.get("/objects/:objectPath(*)", requireAuth, async (req, res) => {
    const userId = req.session.user?.id;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing document:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // PATCH route for client documents (expected by frontend)
  app.patch("/api/client-documents/:id", requireAuth, async (req, res) => {
    try {
      const updateData = req.body;
      const document = await storage.updateClientDocument(req.params.id, updateData);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  // Bulk operations for client documents
  app.post("/api/client-documents/bulk-update", requireAuth, async (req, res) => {
    try {
      const { documentIds, updates } = req.body;
      if (!Array.isArray(documentIds) || documentIds.length === 0) {
        return res.status(400).json({ message: "Document IDs array required" });
      }

      let completed = 0;
      let errors = 0;

      for (const id of documentIds) {
        try {
          const updated = await storage.updateClientDocument(id, updates);
          if (updated) completed++;
          else errors++;
        } catch (error) {
          console.error(`Error updating document ${id}:`, error);
          errors++;
        }
      }

      res.json({ total: documentIds.length, completed, errors });
    } catch (error) {
      console.error("Error in bulk update documents:", error);
      res.status(500).json({ message: "Failed to update documents" });
    }
  });

  app.post("/api/client-documents/bulk-delete", requireAuth, async (req, res) => {
    try {
      const { documentIds } = req.body;
      if (!Array.isArray(documentIds) || documentIds.length === 0) {
        return res.status(400).json({ message: "Document IDs array required" });
      }

      let completed = 0;
      let errors = 0;
      const failedIds: string[] = [];

      for (const id of documentIds) {
        try {
          const success = await storage.deleteClientDocument(id);
          if (success) {
            completed++;
          } else {
            errors++;
            failedIds.push(id);
            console.error(`Failed to delete document ${id}: Document not found or delete operation failed`);
          }
        } catch (error) {
          console.error(`Error deleting document ${id}:`, error);
          errors++;
          failedIds.push(id);
        }
      }

      // Return error status if any deletions failed
      if (errors > 0) {
        console.error(`Bulk delete completed with ${errors} errors out of ${documentIds.length} documents`);
        console.error(`Failed document IDs: ${failedIds.join(', ')}`);
        return res.status(500).json({ 
          message: `Failed to delete ${errors} of ${documentIds.length} documents`,
          total: documentIds.length, 
          completed, 
          errors,
          failedIds
        });
      }

      res.json({ 
        message: `Successfully deleted ${completed} documents`,
        total: documentIds.length, 
        completed, 
        errors: 0 
      });
    } catch (error) {
      console.error("Error in bulk delete documents:", error);
      res.status(500).json({ message: "Failed to delete documents" });
    }
  });

  app.post("/api/client-documents/bulk-download", requireAuth, async (req, res) => {
    try {
      const { documentIds } = req.body;
      if (!Array.isArray(documentIds) || documentIds.length === 0) {
        return res.status(400).json({ message: "Document IDs array required" });
      }

      // For now, we'll return a simple success response
      // In a real implementation, you would create a zip file with all documents
      res.json({ message: "Bulk download feature not fully implemented yet", documentCount: documentIds.length });
    } catch (error) {
      console.error("Error in bulk download documents:", error);
      res.status(500).json({ message: "Failed to download documents" });
    }
  });

  // Auto-generate and send invoice when project completes
  app.post("/api/projects/:id/complete", requireAuth, async (req, res) => {
    try {
      const projectId = req.params.id;
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Update project status to completed
      const updatedProject = await storage.updateProject(projectId, {
        status: 'completed'
      });

      // Generate automatic invoice if client exists
      if (project.clientId) {
        try {
          const client = await storage.getClient(project.clientId);
          if (client && client.email) {
            // Get all completed tasks for the project to calculate total
            const tasks = await storage.getTasksByProject(projectId);
            const totalHours = tasks.reduce((sum, task) => {
              return sum + (task.actualHours || 0);
            }, 0);

            // Create invoice data
            const invoiceData = {
              id: `INV-${project.id}-${Date.now()}`,
              clientId: project.clientId,
              clientName: client.name,
              clientEmail: client.email,
              projectDescription: project.name,
              totalAmount: totalHours * 100, // $100/hour default rate
              status: 'sent',
              createdAt: new Date(),
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
              terms: 'Payment is due within 30 days of invoice date.',
              lineItems: [{
                description: `Professional services for ${project.name}`,
                quantity: totalHours,
                rate: 100,
                amount: totalHours * 100
              }]
            };

            // Generate PDF invoice
            console.log('🔄 Generating invoice PDF for completed project:', project.name);
            const invoicePDF = await generateInvoicePDF(invoiceData);
            console.log('✅ Invoice PDF generated successfully');

            // Send invoice email with PDF attachment
            const emailSent = await sendInvoiceEmail(
              client.email,
              invoiceData,
              invoicePDF,
              `Thank you for working with us on ${project.name}! Your project has been completed successfully.`
            );

            if (emailSent) {
              console.log(`📧 Invoice automatically sent to ${client.email} for completed project: ${project.name}`);
              
              res.json({
                project: updatedProject,
                invoiceGenerated: true,
                invoiceSent: true,
                message: `Project completed and invoice automatically sent to ${client.email}`
              });
            } else {
              res.json({
                project: updatedProject,
                invoiceGenerated: true,
                invoiceSent: false,
                message: "Project completed and invoice generated, but email sending failed"
              });
            }
          } else {
            res.json({
              project: updatedProject,
              invoiceGenerated: false,
              message: "Project completed but no client email found for automatic invoicing"
            });
          }
        } catch (invoiceError) {
          console.error('❌ Failed to generate/send automatic invoice:', invoiceError);
          res.json({
            project: updatedProject,
            invoiceGenerated: false,
            message: "Project completed but automatic invoice generation failed"
          });
        }
      } else {
        res.json({
          project: updatedProject,
          invoiceGenerated: false,
          message: "Project completed but no client assigned for automatic invoicing"
        });
      }
    } catch (error) {
      console.error("Error completing project:", error);
      res.status(500).json({ message: "Failed to complete project" });
    }
  });

  // Manual invoice generation and sending
  app.post("/api/invoices/generate", requireAuth, async (req, res) => {
    try {
      const { projectId, clientId, customAmount, customMessage, includePDF } = req.body;
      
      let project, client;
      
      if (projectId) {
        project = await storage.getProject(projectId);
        if (!project) {
          return res.status(404).json({ message: "Project not found" });
        }
        if (project.clientId) {
          client = await storage.getClient(project.clientId);
        }
      }
      
      if (clientId) {
        client = await storage.getClient(clientId);
        if (!client) {
          return res.status(404).json({ message: "Client not found" });
        }
      }

      if (!client || !client.email) {
        return res.status(400).json({ message: "Valid client with email required" });
      }

      // Calculate amount from project tasks or use custom amount
      let totalAmount = customAmount || 0;
      if (project && !customAmount) {
        const tasks = await storage.getTasksByProject(project.id);
        const totalHours = tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);
        totalAmount = totalHours * 100; // $100/hour default
      }

      // Create invoice data
      const invoiceData = {
        id: `INV-${Date.now()}`,
        clientId: client.id,
        clientName: client.name,
        clientEmail: client.email,
        projectDescription: project?.name || 'Professional Services',
        totalAmount,
        status: 'sent',
        createdAt: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        terms: 'Payment is due within 30 days of invoice date.',
        lineItems: [{
          description: project ? `Professional services for ${project.name}` : 'Professional Services',
          quantity: 1,
          rate: totalAmount,
          amount: totalAmount
        }]
      };

      let invoicePDF: Buffer | undefined;
      
      // Generate PDF if requested
      if (includePDF) {
        try {
          console.log('🔄 Generating invoice PDF');
          invoicePDF = await generateInvoicePDF(invoiceData);
          console.log('✅ Invoice PDF generated successfully');
        } catch (pdfError) {
          console.error('❌ Invoice PDF generation failed:', pdfError);
        }
      }

      // Send invoice email
      const emailSent = await sendInvoiceEmail(
        client.email,
        invoiceData,
        invoicePDF,
        customMessage || 'Thank you for your business! Please find your invoice attached.'
      );

      if (emailSent) {
        res.json({
          success: true,
          message: `Invoice sent successfully to ${client.email}${includePDF ? ' with PDF attachment' : ''}`,
          invoiceData
        });
      } else {
        res.status(500).json({ 
          error: 'Failed to send invoice email',
          invoiceData 
        });
      }
    } catch (error) {
      console.error("Error generating invoice:", error);
      res.status(500).json({ message: "Failed to generate invoice" });
    }
  });

  // Invoice Management Endpoints
  
  // Create draft invoice
  app.post("/api/invoices", requireAuth, async (req, res) => {
    try {
      const invoiceData = insertInvoiceSchema.parse(req.body);
      
      // Sanitize foreign key fields to prevent empty string constraint violations
      const normalizedInvoiceData = sanitizeForeignKeys(invoiceData, ['projectId', 'clientId', 'proposalId']);

      // Ensure status is draft for new invoices
      const draftInvoice = {
        ...normalizedInvoiceData,
        status: "draft" as const,
        invoiceNumber: `INV-${Date.now()}`,
        createdById: req.session.user!.id,
      };

      const created = await storage.createInvoice(draftInvoice);

      // Generate payment link for the invoice
      const paymentLink = await storage.generatePaymentLink(created.id);

      // Log what we are about to send (server-side)
      console.info("[invoices#create] created row:", created);

      // Re-fetch to get the payment link that was just generated
      const createdWithPaymentLink = await storage.getInvoice(created.id, req.session.user!.id);
      const finalInvoice = createdWithPaymentLink || created;

      // Create the response payload
      const responseData = {
        id: finalInvoice.id,
        invoiceNumber: finalInvoice.invoiceNumber,
        projectId: finalInvoice.projectId,
        clientName: finalInvoice.clientName,
        clientEmail: finalInvoice.clientEmail,
        clientAddress: finalInvoice.clientAddress,
        status: finalInvoice.status,
        invoiceDate: finalInvoice.invoiceDate,
        dueDate: finalInvoice.dueDate,
        subtotal: finalInvoice.subtotal,
        taxRate: finalInvoice.taxRate,
        taxAmount: finalInvoice.taxAmount,
        discountAmount: finalInvoice.discountAmount,
        totalAmount: finalInvoice.totalAmount,
        lineItems: finalInvoice.lineItems || [],
        notes: finalInvoice.notes,
        paymentLink: finalInvoice.paymentLink || paymentLink,
        paymentUrl: `${req.protocol}://${req.get('host')}/pay-invoice?link=${finalInvoice.paymentLink || paymentLink}`,
        createdAt: finalInvoice.createdAt,
        updatedAt: finalInvoice.updatedAt,
      };

      console.log("[invoices#create] sending response:", responseData);
      res.status(201).json(responseData);
    } catch (error) {
      console.error("Error creating draft invoice:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid invoice data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });

  // Link time logs to an invoice
  app.post("/api/invoices/:id/link-timelogs", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate request body
      const linkTimeLogsSchema = z.object({
        timeLogIds: z.array(z.string()).min(1, "At least one time log ID is required")
      });
      
      const { timeLogIds } = linkTimeLogsSchema.parse(req.body);

      // Verify invoice exists and user has access
      const invoice = await storage.getInvoice(id, req.session.user!.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found or access denied" });
      }

      let linkedCount = 0;
      let skippedCount = 0;

      // Update each time log to link it to this invoice
      for (const timeLogId of timeLogIds) {
        const timeLog = await storage.getTimeLog(timeLogId);
        
        // Verify time log exists and belongs to current user or their organization
        if (!timeLog || (timeLog.userId !== req.session.user!.id && req.session.user!.role !== "admin")) {
          skippedCount++;
          continue;
        }

        // Skip if already linked to another invoice
        if (timeLog.invoiceId && timeLog.invoiceId !== id) {
          skippedCount++;
          continue;
        }

        await storage.updateTimeLog(timeLogId, {
          invoiceId: id,
          isSelectedForInvoice: true
        });
        linkedCount++;
      }

      res.json({
        success: true,
        message: `Linked ${linkedCount} time ${linkedCount === 1 ? 'entry' : 'entries'} to invoice${skippedCount > 0 ? ` (${skippedCount} skipped)` : ''}`,
        linkedCount,
        skippedCount
      });
    } catch (error) {
      console.error("Error linking time logs to invoice:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to link time logs" });
    }
  });

  // Get all invoices
  app.get("/api/invoices", requireAuth, async (req, res) => {
    try {
      const invoices = await storage.getInvoices(req.session.user!.id);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  // Get specific invoice
  app.get("/api/invoices/:id", requireAuth, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id, req.session.user!.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ error: "Failed to fetch invoice" });
    }
  });

  // Download invoice PDF
  app.get("/api/invoices/:id/pdf", requireAuth, async (req, res) => {
    try {
      let invoice = await storage.getInvoice(req.params.id, req.session.user!.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      // Ensure payment link exists before generating PDF
      if (!invoice.paymentLink) {
        console.log('🔗 Generating payment link for PDF');
        await storage.generatePaymentLink(invoice.id);
        // Re-fetch invoice with payment link
        invoice = await storage.getInvoice(req.params.id, req.session.user!.id);
        if (!invoice) {
          return res.status(404).json({ error: "Invoice not found after payment link generation" });
        }
        console.log('✅ Payment link generated for PDF:', invoice.paymentLink);
      }

      // Generate PDF with payment link included
      const invoiceWithPaymentUrl = {
        ...invoice,
        paymentUrl: `${req.protocol}://${req.get('host')}/pay-invoice?link=${invoice.paymentLink}`
      };

      const pdfBuffer = await generateInvoicePDF(invoiceWithPaymentUrl);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating invoice PDF:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  // Save proposal to Filing Cabinet
  app.post("/api/proposals/:id/save-to-filing-cabinet", requireAuth, async (req, res) => {
    try {
      // Fetch proposal with ownership check
      let proposal = await storage.getProposal(req.params.id, req.session.user!.id);
      if (!proposal) {
        return res.status(404).json({ error: "Proposal not found" });
      }

      // Generate PDF
      const proposalPDF = await generateProposalPDF({
        ...proposal,
        clientName: proposal.clientName || 'Valued Client',
      });
      
      // Save using new Filing Cabinet system
      const { location } = await saveToFilingCabinet({ 
        kind: "proposal", 
        id: req.params.id, 
        orgId: req.session.user!.id,
        data: proposalPDF 
      });
      
      // Create document record in Filing Cabinet
      const fileName = `proposal-${proposal.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
      const objectKey = location.replace('/home/runner/workspace/gigster-garage-files/private/', '');
      const fileUrl = `/storage/${objectKey}`;
      
      // Ensure we have a client ID - create default client if none exists
      let clientId = proposal.clientId;
      if (!clientId && proposal.clientName) {
        console.log('Creating client for Filing Cabinet document');
        const clientData = {
          name: proposal.clientName,
          email: proposal.clientEmail || '',
          phone: '',
          address: '',
          notes: `Auto-created from proposal ${proposal.title}`,
          createdById: req.session.user!.id
        };
        const newClient = await storage.createClient(clientData);
        clientId = newClient.id;
        console.log(`✅ Created client: ${newClient.name} (${clientId})`);
      }
      
      const documentData = {
        clientId: clientId!,
        name: `Proposal: ${proposal.title}`,
        description: `Proposal for ${proposal.clientName || 'client'} - ${proposal.title}`,
        type: 'proposal' as const,
        category: 'proposal',
        fileUrl: fileUrl,
        fileName: fileName,
        fileSize: proposalPDF.length,
        mimeType: 'application/pdf',
        uploadedById: req.session.user!.id
      };

      const document = await storage.createClientDocument(documentData);
      console.log(`✅ Proposal PDF saved to Filing Cabinet: ${document.name}`);
      
      res.status(201).json({ 
        success: true, 
        message: "Proposal PDF saved to Filing Cabinet successfully",
        document 
      });
    } catch (error) {
      console.error("Error saving proposal PDF to Filing Cabinet:", error);
      res.status(500).json({ error: "Failed to save PDF to Filing Cabinet" });
    }
  });

  // Save contract to Filing Cabinet
  app.post("/api/contracts/:id/save-to-filing-cabinet", requireAuth, async (req, res) => {
    try {
      // Validate ID parameter
      if (!req.params.id || typeof req.params.id !== 'string') {
        return res.status(400).json({ error: "Invalid contract ID" });
      }

      // Fetch contract
      let contract = await storage.getContract(req.params.id);
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }

      // Generate PDF
      const contractPDF = await generateContractPDF({
        ...contract,
        clientName: contract.clientName || 'Valued Client',
      });
      
      console.log('🚀 NEW FILING CABINET CODE: Starting contract PDF save to filesystem');
      
      // Save PDF to filesystem
      const fileName = `contract-${contract.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
      const storageDir = '/home/runner/workspace/gigster-garage-files/private';
      const objectKey = `${req.session.user!.id}/contracts/${fileName}`;
      const fullPath = `${storageDir}/${objectKey}`;
      
      console.log('📂 Filing Cabinet (Contract): Saving to path:', fullPath);
      
      // Ensure directory exists and write PDF
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, contractPDF);
      
      console.log('✅ Filing Cabinet (Contract): PDF saved successfully to filesystem');

      // Create document record in Filing Cabinet 
      const fileUrl = `/storage/${objectKey}`;
      
      // Ensure we have a client ID - create default client if none exists
      let clientId = contract.clientId;
      if (!clientId && contract.clientName) {
        console.log('Creating client for Filing Cabinet document');
        const clientData = {
          name: contract.clientName,
          email: contract.clientEmail || '',
          phone: '',
          address: contract.clientAddress || '',
          notes: `Auto-created from contract ${contract.title}`,
          createdById: req.session.user!.id
        };
        const newClient = await storage.createClient(clientData);
        clientId = newClient.id;
      }

      // Create document in Filing Cabinet using correct schema
      const documentData = {
        clientId: clientId!,
        name: `Contract: ${contract.title}`,
        description: `Contract for ${contract.clientName || 'client'} - ${contract.title}`,
        type: 'contract' as const,
        category: 'contract',
        fileUrl: fileUrl,
        fileName: fileName,
        fileSize: contractPDF.length,
        mimeType: 'application/pdf',
        uploadedById: req.session.user!.id,
        createdById: req.session.user!.id
      };

      const document = await storage.createClientDocument(documentData);
      console.log(`✅ Contract PDF saved to Filing Cabinet: ${contract.title}`);

      res.status(201).json({ 
        success: true,
        message: "Contract PDF saved to Filing Cabinet successfully",
        document
      });
    } catch (error) {
      console.error("Error saving contract PDF to Filing Cabinet:", error);
      res.status(500).json({ error: "Failed to save PDF to Filing Cabinet" });
    }
  });

  // Save presentation to Filing Cabinet
  app.post("/api/presentations/:id/save-to-filing-cabinet", requireAuth, async (req, res) => {
    try {
      // Validate ID parameter
      if (!req.params.id || typeof req.params.id !== 'string') {
        return res.status(400).json({ error: "Invalid presentation ID" });
      }

      // Fetch presentation with ownership check
      let presentation = await storage.getPresentation(req.params.id, req.session.user!.id);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }

      // Generate PDF
      const presentationPDF = await generatePresentationPDF({
        ...presentation,
        author: presentation.author || 'Presenter',
      });
      
      console.log('🚀 NEW FILING CABINET CODE: Starting presentation PDF save to filesystem');
      
      // Save PDF to filesystem
      const fileName = `presentation-${presentation.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
      const storageDir = '/home/runner/workspace/gigster-garage-files/private';
      const objectKey = `${req.session.user!.id}/presentations/${fileName}`;
      const fullPath = `${storageDir}/${objectKey}`;
      
      console.log('📂 Filing Cabinet (Presentation): Saving to path:', fullPath);
      
      // Ensure directory exists and write PDF
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, presentationPDF);
      
      console.log('✅ Filing Cabinet (Presentation): PDF saved successfully to filesystem');

      // Create document record in Filing Cabinet 
      const fileUrl = `/storage/${objectKey}`;
      
      // Create client for Filing Cabinet document (presentations always create a new client entry)
      console.log('Creating client for Filing Cabinet document');
      const clientData = {
        name: presentation.audience || 'General Audience',
        email: '',
        phone: '',
        address: '',
        notes: `Auto-created from presentation ${presentation.title}`,
        createdById: req.session.user!.id
      };
      const newClient = await storage.createClient(clientData);
      const clientId = newClient.id;

      // Create document in Filing Cabinet using correct schema
      const documentData = {
        clientId: clientId,
        name: `Presentation: ${presentation.title}`,
        description: `Presentation: ${presentation.title} - ${presentation.audience || 'General Audience'}`,
        type: 'presentation' as const,
        category: 'presentation',
        fileUrl: fileUrl,
        fileName: fileName,
        fileSize: presentationPDF.length,
        mimeType: 'application/pdf',
        uploadedById: req.session.user!.id,
        createdById: req.session.user!.id
      };

      const document = await storage.createClientDocument(documentData);
      console.log(`✅ Presentation PDF saved to Filing Cabinet: ${presentation.title}`);

      res.status(201).json({ 
        success: true,
        message: "Presentation PDF saved to Filing Cabinet successfully",
        document
      });
    } catch (error) {
      console.error("Error saving presentation PDF to Filing Cabinet:", error);
      res.status(500).json({ error: "Failed to save PDF to Filing Cabinet" });
    }
  });

  app.post("/api/invoices/:id/save-to-filing-cabinet", requireAuth, async (req, res) => {
    try {
      let invoice = await storage.getInvoice(req.params.id, req.session.user!.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      // Ensure payment link exists before generating PDF
      if (!invoice.paymentLink) {
        console.log('🔗 Generating payment link for PDF');
        await storage.generatePaymentLink(invoice.id);
        // Re-fetch invoice with payment link
        invoice = await storage.getInvoice(req.params.id, req.session.user!.id);
        if (!invoice) {
          return res.status(404).json({ error: "Invoice not found after payment link generation" });
        }
        console.log('✅ Payment link generated for PDF:', invoice.paymentLink);
      }

      // Generate PDF with payment link included
      const invoiceWithPaymentUrl = {
        ...invoice,
        paymentUrl: `${req.protocol}://${req.get('host')}/pay-invoice?link=${invoice.paymentLink}`
      };

      const pdfBuffer = await generateInvoicePDF(invoiceWithPaymentUrl);
      
      console.log('🚀 NEW FILING CABINET CODE: Starting PDF save to filesystem');
      
      // Save PDF to Replit App Storage using filesystem
      const fileName = `invoice-${invoice.invoiceNumber}.pdf`;
      
      // Use workspace-based storage directory
      const storageDir = '/home/runner/workspace/gigster-garage-files/private';
      const objectKey = `${req.session.user!.id}/invoices/${fileName}`;
      const fullPath = `${storageDir}/${objectKey}`;
      
      console.log('📂 Filing Cabinet: Saving to path:', fullPath);
      
      // Ensure directory exists and write PDF
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, pdfBuffer);
      
      console.log('✅ Filing Cabinet: PDF saved successfully to filesystem');

      // Create document record in Filing Cabinet 
      const fileUrl = `/storage/${objectKey}`;
      
      // Ensure we have a client ID - create default client if none exists
      let clientId = invoice.clientId;
      if (!clientId && invoice.clientName) {
        console.log('Creating client for Filing Cabinet document');
        const clientData = {
          name: invoice.clientName,
          email: invoice.clientEmail || '',
          phone: '',
          address: '',
          notes: `Auto-created from invoice ${invoice.invoiceNumber}`,
          createdById: req.session.user!.id
        };
        const newClient = await storage.createClient(clientData);
        clientId = newClient.id;
        console.log(`✅ Created client: ${newClient.name} (${clientId})`);
      }
      
      const documentData = {
        clientId: clientId!,
        name: `Invoice ${invoice.invoiceNumber}`,
        description: `Invoice for ${invoice.clientName || 'client'} - $${invoice.totalAmount}`,
        type: 'invoice' as const,
        category: 'invoice',
        fileUrl: fileUrl,
        fileName: fileName,
        fileSize: pdfBuffer.length,
        mimeType: 'application/pdf',
        uploadedById: req.session.user!.id,
        createdById: req.session.user!.id
      };

      const document = await storage.createClientDocument(documentData);
      console.log(`✅ Invoice PDF saved to Filing Cabinet: ${document.name}`);
      
      res.status(201).json({ 
        success: true, 
        message: "Invoice PDF saved to Filing Cabinet successfully",
        document 
      });
    } catch (error) {
      console.error("Error saving invoice PDF to Filing Cabinet:", error);
      res.status(500).json({ error: "Failed to save PDF to Filing Cabinet" });
    }
  });

  // Update invoice (edit line items, amounts, etc.)
  app.put("/api/invoices/:id", requireAuth, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id, req.session.user!.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      // Only allow editing draft invoices
      if (invoice.status !== "draft") {
        return res.status(400).json({ error: "Only draft invoices can be edited" });
      }

      const updateData = insertInvoiceSchema.partial().parse(req.body);
      
      // Sanitize foreign key fields to prevent empty string constraint violations
      const sanitizedUpdateData = sanitizeForeignKeys(updateData, ['projectId', 'clientId', 'proposalId']);
      
      // Calculate totals if line items are updated
      if (sanitizedUpdateData.lineItems) {
        const subtotal = Array.isArray(sanitizedUpdateData.lineItems) ? sanitizedUpdateData.lineItems.reduce((sum: number, item: any) => sum + Number(item.amount), 0) : 0;
        const taxAmount = subtotal * Number(sanitizedUpdateData.taxRate || invoice.taxRate || 0) / 100;
        const totalAmount = subtotal + taxAmount - Number(sanitizedUpdateData.discountAmount || 0);
        
        sanitizedUpdateData.subtotal = subtotal.toString();
        sanitizedUpdateData.taxAmount = taxAmount.toString();
        sanitizedUpdateData.totalAmount = totalAmount.toString();
      }

      const updatedInvoice = await storage.updateInvoice(req.params.id, sanitizedUpdateData, req.session.user!.id);
      
      if (updatedInvoice) {
        // Generate payment link if it doesn't exist
        if (!updatedInvoice.paymentLink) {
          await storage.generatePaymentLink(updatedInvoice.id);
          // Refetch to get the payment link
          const updatedWithLink = await storage.getInvoice(updatedInvoice.id, req.session.user!.id);
          if (updatedWithLink) {
            const result = {
              ...updatedWithLink,
              paymentUrl: `${req.protocol}://${req.get('host')}/pay-invoice?link=${updatedWithLink.paymentLink}`
            };
            return res.json(result);
          }
        }

        const result = {
          ...updatedInvoice,
          paymentUrl: updatedInvoice.paymentLink ? `${req.protocol}://${req.get('host')}/pay-invoice?link=${updatedInvoice.paymentLink}` : undefined
        };
        res.json(result);
      } else {
        res.status(404).json({ error: "Invoice not found" });
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid invoice data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update invoice" });
    }
  });

  // Send existing draft invoice
  app.post("/api/invoices/:id/send", requireAuth, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id, req.session.user!.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      if (invoice.status !== "draft") {
        return res.status(400).json({ error: "Only draft invoices can be sent" });
      }

      const { customMessage, includePDF } = req.body;

      // Get client information
      let client;
      if (invoice.clientId) {
        client = await storage.getClient(invoice.clientId);
      }

      if (!client || !client.email) {
        return res.status(400).json({ error: "Valid client with email required" });
      }

      let invoicePDF: Buffer | undefined;
      
      // Generate PDF if requested
      if (includePDF) {
        try {
          console.log('🔄 Generating invoice PDF');
          
          // Ensure payment link exists before generating PDF
          let pdfInvoice = invoice;
          if (!invoice.paymentLink) {
            console.log('🔗 Generating payment link for PDF');
            await storage.generatePaymentLink(invoice.id);
            // Re-fetch invoice with payment link
            pdfInvoice = await storage.getInvoice(invoice.id, req.session.user!.id);
            if (!pdfInvoice) {
              throw new Error("Invoice not found after payment link generation");
            }
            console.log('✅ Payment link generated for PDF:', pdfInvoice.paymentLink);
          }

          // Generate PDF with payment link included
          const invoiceWithPaymentUrl = {
            ...pdfInvoice,
            paymentUrl: `${req.protocol}://${req.get('host')}/pay-invoice?link=${pdfInvoice.paymentLink}`
          };

          invoicePDF = await generateInvoicePDF(invoiceWithPaymentUrl);
          console.log('✅ Invoice PDF generated successfully');
        } catch (pdfError) {
          console.error('❌ Invoice PDF generation failed:', pdfError);
        }
      }

      // Send invoice email
      const emailSent = await sendInvoiceEmail(
        client.email,
        invoice,
        invoicePDF,
        customMessage || 'Thank you for your business! Please find your invoice attached.'
      );

      if (emailSent) {
        // Update invoice status to sent
        await storage.updateInvoice(invoice.id, { status: "sent" });
        
        res.json({
          success: true,
          message: `Invoice sent successfully to ${client.email}${includePDF ? ' with PDF attachment' : ''}`,
          invoiceData: invoice
        });
      } else {
        res.status(500).json({ 
          error: 'Failed to send invoice email',
          invoiceData: invoice 
        });
      }
    } catch (error) {
      console.error("Error sending invoice:", error);
      res.status(500).json({ error: "Failed to send invoice" });
    }
  });

  // Delete draft invoice
  app.delete("/api/invoices/:id", requireAuth, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id, req.session.user!.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      // Only allow deleting draft invoices
      if (invoice.status !== "draft") {
        return res.status(400).json({ error: "Only draft invoices can be deleted" });
      }

      const deleted = await storage.deleteInvoice(req.params.id, req.session.user!.id);
      if (deleted) {
        res.json({ success: true, message: "Invoice deleted successfully" });
      } else {
        res.status(500).json({ error: "Failed to delete invoice" });
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      res.status(500).json({ error: "Failed to delete invoice" });
    }
  });

  // =================== AUTOMATED INVOICE STATUS TRACKING ===================
  
  // Manual trigger for invoice status updates
  app.post("/api/invoices/status-update", requireAuth, async (req, res) => {
    try {
      const result = await invoiceStatusService.manualStatusUpdate();
      res.json({
        success: true,
        message: `Status update complete: ${result.updatedInvoices} invoices updated, ${result.notificationsSent} notifications sent`,
        ...result
      });
    } catch (error) {
      console.error("Error during manual status update:", error);
      res.status(500).json({ error: "Failed to update invoice statuses" });
    }
  });

  // Get overdue invoice statistics
  app.get("/api/invoices/overdue-stats", requireAuth, async (req, res) => {
    try {
      const stats = await invoiceStatusService.getOverdueStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching overdue stats:", error);
      res.status(500).json({ error: "Failed to fetch overdue statistics" });
    }
  });

  // Get all overdue invoices
  app.get("/api/invoices/overdue", requireAuth, async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      const overdueInvoices = invoices.filter(inv => inv.status === "overdue");
      res.json(overdueInvoices);
    } catch (error) {
      console.error("Error fetching overdue invoices:", error);
      res.status(500).json({ error: "Failed to fetch overdue invoices" });
    }
  });

  // =================== AUTOMATED INVOICING API ===================
  
  // Get all automation rules
  app.get("/api/invoices/automation/rules", requireAuth, async (req, res) => {
    try {
      const rules = automatedInvoicingService.getAllRules();
      res.json(rules);
    } catch (error) {
      console.error("Error fetching automation rules:", error);
      res.status(500).json({ error: "Failed to fetch automation rules" });
    }
  });

  // Create recurring invoice rule
  app.post("/api/invoices/automation/recurring", requireAuth, async (req, res) => {
    try {
      const { name, clientId, templateData, frequency, interval, autoSend, reminderDays } = req.body;
      
      if (!name || !clientId || !frequency || !interval) {
        return res.status(400).json({ error: "Missing required fields: name, clientId, frequency, interval" });
      }

      const ruleId = automatedInvoicingService.addRecurringRule({
        name,
        clientId,
        templateData: templateData || {},
        frequency,
        interval: parseInt(interval),
        nextGenerationDate: new Date(),
        isActive: true,
        autoSend: autoSend || false,
        reminderDays: reminderDays || [7, 3, 0]
      });

      res.json({ 
        success: true, 
        ruleId, 
        message: `Recurring invoice rule "${name}" created successfully` 
      });
    } catch (error) {
      console.error("Error creating recurring rule:", error);
      res.status(500).json({ error: "Failed to create recurring invoice rule" });
    }
  });

  // Create payment reminder rule
  app.post("/api/invoices/automation/reminder", requireAuth, async (req, res) => {
    try {
      const { name, triggerDays, reminderType, customMessage } = req.body;
      
      if (!name || triggerDays === undefined || !reminderType) {
        return res.status(400).json({ error: "Missing required fields: name, triggerDays, reminderType" });
      }

      const ruleId = automatedInvoicingService.addReminderRule({
        name,
        triggerDays: parseInt(triggerDays),
        reminderType,
        isActive: true,
        customMessage
      });

      res.json({ 
        success: true, 
        ruleId, 
        message: `Payment reminder rule "${name}" created successfully` 
      });
    } catch (error) {
      console.error("Error creating reminder rule:", error);
      res.status(500).json({ error: "Failed to create payment reminder rule" });
    }
  });

  // Manual trigger for automation testing
  app.post("/api/invoices/automation/trigger", requireAuth, async (req, res) => {
    try {
      await automatedInvoicingService.manualTrigger();
      res.json({ 
        success: true, 
        message: "Manual automation trigger completed successfully" 
      });
    } catch (error) {
      console.error("Error during manual automation trigger:", error);
      res.status(500).json({ error: "Failed to trigger automation" });
    }
  });

  // =================== SMART NOTIFICATIONS API ===================
  
  // Get all notification rules
  app.get("/api/notifications/rules", requireAuth, async (req, res) => {
    try {
      const rules = smartNotificationsService.getAllRules();
      res.json(rules);
    } catch (error) {
      console.error("Error fetching notification rules:", error);
      res.status(500).json({ error: "Failed to fetch notification rules" });
    }
  });

  // Create custom notification rule
  app.post("/api/notifications/rules", requireAuth, async (req, res) => {
    try {
      const { name, description, trigger, conditions, actions, priority, batchingEnabled, batchingWindow } = req.body;
      
      if (!name || !trigger || !actions || !Array.isArray(actions)) {
        return res.status(400).json({ error: "Missing required fields: name, trigger, actions" });
      }

      const ruleId = smartNotificationsService.addNotificationRule({
        name,
        description: description || '',
        trigger,
        conditions: conditions || [],
        actions,
        isActive: true,
        priority: priority || 'medium',
        batchingEnabled: batchingEnabled || false,
        batchingWindow: batchingWindow || 30
      });

      res.json({ 
        success: true, 
        ruleId, 
        message: `Smart notification rule "${name}" created successfully` 
      });
    } catch (error) {
      console.error("Error creating notification rule:", error);
      res.status(500).json({ error: "Failed to create notification rule" });
    }
  });

  // Update notification rule
  app.patch("/api/notifications/rules/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const success = smartNotificationsService.updateNotificationRule(id, updates);
      
      if (!success) {
        return res.status(404).json({ error: "Notification rule not found" });
      }

      res.json({ 
        success: true, 
        message: "Notification rule updated successfully" 
      });
    } catch (error) {
      console.error("Error updating notification rule:", error);
      res.status(500).json({ error: "Failed to update notification rule" });
    }
  });

  // Get notification statistics
  app.get("/api/notifications/stats", requireAuth, async (req, res) => {
    try {
      const stats = smartNotificationsService.getNotificationStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching notification stats:", error);
      res.status(500).json({ error: "Failed to fetch notification statistics" });
    }
  });

  // Manual trigger for smart notifications
  app.post("/api/notifications/trigger", requireAuth, async (req, res) => {
    try {
      await smartNotificationsService.manualTrigger();
      res.json({ 
        success: true, 
        message: "Manual smart notifications trigger completed successfully" 
      });
    } catch (error) {
      console.error("Error during manual notifications trigger:", error);
      res.status(500).json({ error: "Failed to trigger smart notifications" });
    }
  });

  // Trigger event-based notification
  app.post("/api/notifications/event", requireAuth, async (req, res) => {
    try {
      const { eventType, entityType, entityId, metadata } = req.body;
      
      if (!eventType || !entityType || !entityId) {
        return res.status(400).json({ error: "Missing required fields: eventType, entityType, entityId" });
      }

      await smartNotificationsService.triggerEventNotification(eventType, entityType, entityId, metadata);
      
      res.json({ 
        success: true, 
        message: `Event notification triggered: ${eventType} for ${entityType}:${entityId}` 
      });
    } catch (error) {
      console.error("Error triggering event notification:", error);
      res.status(500).json({ error: "Failed to trigger event notification" });
    }
  });

  // =================== WORKFLOW TEMPLATES API ===================
  
  // Get all workflow templates
  app.get("/api/workflows/templates", requireAuth, async (req, res) => {
    try {
      const templates = workflowTemplatesService.getAllTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching workflow templates:", error);
      res.status(500).json({ error: "Failed to fetch workflow templates" });
    }
  });

  // Search workflow templates
  app.get("/api/workflows/templates/search", requireAuth, async (req, res) => {
    try {
      const { q, category, complexity, tags, minRating } = req.query;
      
      const filters: any = {};
      if (category) filters.category = category as string;
      if (complexity) filters.complexity = complexity as string;
      if (tags) filters.tags = (tags as string).split(',');
      if (minRating) filters.minRating = parseFloat(minRating as string);

      const templates = workflowTemplatesService.searchTemplates(q as string || '', filters);
      res.json(templates);
    } catch (error) {
      console.error("Error searching workflow templates:", error);
      res.status(500).json({ error: "Failed to search workflow templates" });
    }
  });

  // Get templates by category
  app.get("/api/workflows/templates/category/:category", requireAuth, async (req, res) => {
    try {
      const { category } = req.params;
      const templates = workflowTemplatesService.getTemplatesByCategory(category as any);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates by category:", error);
      res.status(500).json({ error: "Failed to fetch templates by category" });
    }
  });

  // Get popular templates
  app.get("/api/workflows/templates/popular", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const templates = workflowTemplatesService.getPopularTemplates(limit);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching popular templates:", error);
      res.status(500).json({ error: "Failed to fetch popular templates" });
    }
  });

  // Get specific template
  app.get("/api/workflows/templates/:id", requireAuth, async (req, res) => {
    try {
      const template = workflowTemplatesService.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ error: "Failed to fetch template" });
    }
  });

  // Install template as workflow
  app.post("/api/workflows/templates/:id/install", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { customizations } = req.body;
      const userId = req.session.user!.id;

      const workflowId = await workflowTemplatesService.installTemplate(id, userId, customizations);
      
      res.json({ 
        success: true, 
        workflowId, 
        message: "Template installed successfully as workflow" 
      });
    } catch (error) {
      console.error("Error installing template:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to install template" });
    }
  });

  // Create custom template
  app.post("/api/workflows/templates", requireAuth, async (req, res) => {
    try {
      const templateData = req.body;
      templateData.author = req.session.user!.username;
      
      const templateId = workflowTemplatesService.createCustomTemplate(templateData);
      
      res.json({ 
        success: true, 
        templateId, 
        message: "Custom template created successfully" 
      });
    } catch (error) {
      console.error("Error creating custom template:", error);
      res.status(500).json({ error: "Failed to create custom template" });
    }
  });

  // Export template
  app.get("/api/workflows/templates/:id/export", requireAuth, async (req, res) => {
    try {
      const templateJson = workflowTemplatesService.exportTemplate(req.params.id);
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="workflow-template-${req.params.id}.json"`);
      res.send(templateJson);
    } catch (error) {
      console.error("Error exporting template:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to export template" });
    }
  });

  // Import template
  app.post("/api/workflows/templates/import", requireAuth, async (req, res) => {
    try {
      const { templateJson } = req.body;
      const userId = req.session.user!.id;
      
      const templateId = workflowTemplatesService.importTemplate(templateJson, userId);
      
      res.json({ 
        success: true, 
        templateId, 
        message: "Template imported successfully" 
      });
    } catch (error) {
      console.error("Error importing template:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to import template" });
    }
  });

  // Get user's installed workflows
  app.get("/api/workflows/installed", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const workflows = workflowTemplatesService.getUserWorkflows(userId);
      res.json(workflows);
    } catch (error) {
      console.error("Error fetching user workflows:", error);
      res.status(500).json({ error: "Failed to fetch user workflows" });
    }
  });

  // Execute workflow
  app.post("/api/workflows/:id/execute", requireAuth, async (req, res) => {
    try {
      const { trigger } = req.body;
      const success = await workflowTemplatesService.executeWorkflow(req.params.id, trigger);
      
      if (success) {
        res.json({ 
          success: true, 
          message: "Workflow executed successfully" 
        });
      } else {
        res.status(500).json({ error: "Workflow execution failed" });
      }
    } catch (error) {
      console.error("Error executing workflow:", error);
      res.status(500).json({ error: "Failed to execute workflow" });
    }
  });

  // Get workflow statistics
  app.get("/api/workflows/stats", requireAuth, async (req, res) => {
    try {
      const stats = workflowTemplatesService.getWorkflowStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching workflow stats:", error);
      res.status(500).json({ error: "Failed to fetch workflow statistics" });
    }
  });

  // Manual trigger for workflow templates
  app.post("/api/workflows/trigger", requireAuth, async (req, res) => {
    try {
      await workflowTemplatesService.manualTrigger();
      res.json({ 
        success: true, 
        message: "Manual workflow templates trigger completed successfully" 
      });
    } catch (error) {
      console.error("Error during manual workflow trigger:", error);
      res.status(500).json({ error: "Failed to trigger workflow templates" });
    }
  });

  // Message endpoints
  app.post("/api/messages", requireAuth, async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      
      const message = await storage.createMessage({
        ...messageData,
        fromUserId: req.session.user!.id,
      });

      // Send email if recipient is external (has email but no internal user)
      if (messageData.toEmail && !messageData.toUserId) {
        const fromUser = await storage.getUser(req.session.user!.id);
        if (fromUser) {
          const emailSent = await sendMessageAsEmail(
            message,
            fromUser,
            messageData.toEmail
          );
          
          if (emailSent) {
            console.log(`📧 Message sent as email to ${messageData.toEmail}`);
          } else {
            console.log(`⚠️ Failed to send message as email to ${messageData.toEmail}`);
          }
        }
      }

      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid message data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  app.get("/api/messages", requireAuth, async (req, res) => {
    try {
      const messages = await storage.getMessages(req.session.user!.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.put("/api/messages/:id/read", requireAuth, async (req, res) => {
    try {
      const messageId = req.params.id;
      const message = await storage.markMessageAsRead(messageId, req.session.user!.id);
      
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      res.json(message);
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ error: "Failed to mark message as read" });
    }
  });

  app.get("/api/messages/unread-count", requireAuth, async (req, res) => {
    try {
      const count = await storage.getUnreadMessageCount(req.session.user!.id);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread message count:", error);
      res.status(500).json({ error: "Failed to fetch unread message count" });
    }
  });

  // Email configuration info endpoint
  app.get("/api/messages/email-config", requireAuth, async (req, res) => {
    const sendGridConfigured = !!(process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY_2);
    const webhookUrl = `${process.env.APP_URL || 'http://localhost:5000'}/api/inbound-email`;
    
    res.json({
      emailIntegration: {
        outbound: {
          enabled: sendGridConfigured,
          status: sendGridConfigured ? "✅ Configured" : "⚠️ Not configured",
          note: sendGridConfigured 
            ? "Messages to external emails will be sent via SendGrid" 
            : "Set SENDGRID_API_KEY to enable outbound emails"
        },
        inbound: {
          webhookUrl,
          status: "🔧 Ready for configuration",
          setupInstructions: [
            "1. Go to SendGrid dashboard → Settings → Inbound Parse",
            "2. Add a new host & URL configuration",
            `3. Set webhook URL to: ${webhookUrl}`,
            "4. Configure a subdomain (e.g., messages.yourdomain.com)",
            "5. Emails sent to that address will appear in your messages"
          ]
        },
        emailAddress: `messages@${process.env.REPLIT_DOMAINS?.split(',')[0] || 'yourapp.replit.app'}`,
        note: "Once configured, send emails to the above address and they'll appear as messages in your app"
      }
    });
  });

  // Inbound email webhook for SendGrid (with basic validation)
  app.post("/api/inbound-email", express.raw({ type: 'text/plain' }), async (req, res) => {
    // Basic webhook validation - check for expected headers
    const userAgent = req.get('User-Agent') || '';
    if (!userAgent.includes('SendGrid')) {
      console.warn('📧 Suspicious webhook request without SendGrid User-Agent');
      return res.status(401).json({ error: "Unauthorized webhook source" });
    }
    try {
      console.log('📧 Received inbound email webhook');
      
      // Parse the multipart form data from SendGrid
      const formData = req.body.toString();
      const emailData = parseInboundEmail(formData);
      
      console.log(`Inbound email from: ${emailData.fromEmail}`);
      console.log(`Subject: ${emailData.subject}`);
      
      // Try to find a user by email to route the message to
      const possibleUsers = await storage.getUsers();
      let toUser = possibleUsers.find(u => u.email === emailData.fromEmail || u.notificationEmail === emailData.fromEmail);
      
      if (!toUser) {
        // Create a system message for unrecognized senders
        const systemUser = possibleUsers.find(u => u.role === 'admin');
        if (systemUser) {
          const message = await storage.createMessage({
            toUserId: systemUser.id,
            toEmail: systemUser.email,
            subject: `Unrecognized Email: ${emailData.subject}`,
            content: `Received email from unrecognized sender: ${emailData.fromEmail}\n\nOriginal Subject: ${emailData.subject}\n\nContent:\n${emailData.content}`,
            priority: 'medium',
            attachments: emailData.attachments || [],
            fromUserId: systemUser.id // System message
          });
          
          console.log(`📧 Created system message for unrecognized sender: ${emailData.fromEmail}`);
        }
      } else {
        // Find admin or first user to receive the message  
        const adminUser = possibleUsers.find(u => u.role === 'admin') || possibleUsers[0];
        
        if (adminUser) {
          const message = await storage.createMessage({
            toUserId: adminUser.id,
            toEmail: adminUser.email,
            subject: emailData.subject,
            content: emailData.content,
            priority: 'medium',
            attachments: emailData.attachments || [],
            fromUserId: toUser.id
          });
          
          console.log(`📧 Created message from ${emailData.fromEmail} for ${adminUser.email}`);
        }
      }

      res.status(200).send('OK');
    } catch (error) {
      console.error("Error processing inbound email:", error);
      res.status(500).send('Error processing email');
    }
  });

  // Agency Hub AI-powered endpoints
  app.post("/api/agency/create", requireAuth, async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "OpenAI API key not configured" });
      }

      console.log("🎨 Creating marketing content for:", prompt.substring(0, 50) + "...");

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Use gpt-4o instead as gpt-5 may not be available yet
        messages: [
          {
            role: "system",
            content: `You are a creative marketing expert specializing in visual content and social media mockups. Create detailed, professional marketing content concepts including visual descriptions, copy suggestions, and design recommendations. Focus on creating actionable, implementable marketing materials.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.8
      });

      const content = response.choices[0].message.content;
      console.log("✅ Marketing content generated successfully");
      res.json({ content });
    } catch (error: any) {
      console.error("❌ OpenAI Create API Error:", error.message || error);
      if (error.code === 'model_not_found') {
        return res.status(500).json({ error: "AI model not available. Please try again later." });
      }
      res.status(500).json({ error: "Failed to generate creative content: " + (error.message || "Unknown error") });
    }
  });

  app.post("/api/agency/write", requireAuth, async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "OpenAI API key not configured" });
      }

      console.log("✍️ Writing content for:", prompt.substring(0, 50) + "...");

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a professional copywriter and content creator with expertise in writing compelling marketing materials, press releases, presentations, and advertising copy. Create engaging, persuasive, and well-structured content that drives action and communicates value effectively.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1200,
        temperature: 0.7
      });

      const content = response.choices[0].message.content;
      console.log("✅ Written content generated successfully");
      res.json({ content });
    } catch (error: any) {
      console.error("❌ OpenAI Write API Error:", error.message || error);
      if (error.code === 'model_not_found') {
        return res.status(500).json({ error: "AI model not available. Please try again later." });
      }
      res.status(500).json({ error: "Failed to generate written content: " + (error.message || "Unknown error") });
    }
  });

  app.post("/api/agency/promote", requireAuth, async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "OpenAI API key not configured" });
      }

      console.log("📢 Creating promotion strategy for:", prompt.substring(0, 50) + "...");

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a digital marketing strategist and advertising expert with deep knowledge of paid advertising platforms, audience targeting, budget optimization, and campaign strategy. Provide detailed, actionable advertising strategies with specific recommendations for platforms, budgets, targeting, and campaign structures.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1200,
        temperature: 0.6
      });

      const content = response.choices[0].message.content;
      console.log("✅ Promotion strategy generated successfully");
      res.json({ content });
    } catch (error: any) {
      console.error("❌ OpenAI Promote API Error:", error.message || error);
      if (error.code === 'model_not_found') {
        return res.status(500).json({ error: "AI model not available. Please try again later." });
      }
      res.status(500).json({ error: "Failed to generate promotion strategy: " + (error.message || "Unknown error") });
    }
  });

  app.post("/api/agency/track", requireAuth, async (req, res) => {
    try {
      const { data } = req.body;
      if (!data) {
        return res.status(400).json({ error: "Data is required" });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "OpenAI API key not configured" });
      }

      console.log("📊 Analyzing marketing data:", data.substring(0, 50) + "...");

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a marketing analytics expert and data analyst specializing in campaign performance, ROI analysis, and marketing metrics interpretation. Analyze marketing data and provide actionable insights, recommendations, and performance assessments. Focus on practical improvements and strategic guidance.`
          },
          {
            role: "user",
            content: `Please analyze this marketing data and provide insights: ${data}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.5
      });

      const insights = response.choices[0].message.content;
      console.log("✅ Marketing analysis completed successfully");
      res.json({ insights });
    } catch (error: any) {
      console.error("❌ OpenAI Track API Error:", error.message || error);
      if (error.code === 'model_not_found') {
        return res.status(500).json({ error: "AI model not available. Please try again later." });
      }
      res.status(500).json({ error: "Failed to analyze marketing data: " + (error.message || "Unknown error") });
    }
  });

  // Image generation endpoint for Agency Hub
  app.post("/api/agency/generate-image", requireAuth, async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "OpenAI API key not configured" });
      }

      console.log("🖼️ Generating image for:", prompt.substring(0, 50) + "...");

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      const imageUrl = response.data?.[0]?.url;
      console.log("✅ Image generated successfully");
      res.json({ imageUrl });
    } catch (error: any) {
      console.error("❌ OpenAI Image Generation Error:", error.message || error);
      if (error.code === 'model_not_found') {
        return res.status(500).json({ error: "Image generation model not available. Please try again later." });
      }
      res.status(500).json({ error: "Failed to generate image: " + (error.message || "Unknown error") });
    }
  });

  // Save generated image to Filing Cabinet
  app.post("/api/agency/save-image-to-filing-cabinet", requireAuth, async (req, res) => {
    try {
      const { imageUrl, prompt, description } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ error: "Image URL is required" });
      }

      console.log("💾 Saving generated image to Filing Cabinet...");

      // Download the image from the URL
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error("Failed to download image");
      }
      
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      const fileName = `agency-visual-${Date.now()}.png`;
      
      // Save image to object storage
      const objectStorageService = new ObjectStorageService();
      const privateDir = objectStorageService.getPrivateObjectDir();
      const objectPath = `${privateDir}/${req.session.user!.id}/agency-visuals/${fileName}`;
      
      // Parse object path for upload
      const { bucketName, objectName } = parseObjectPath(objectPath);
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);
      
      // Upload the image buffer
      await file.save(imageBuffer, {
        metadata: {
          contentType: 'image/png'
        }
      });

      // Create document record in Filing Cabinet 
      const fileUrl = file.publicUrl();
      
      // Create a default client for Agency Hub visuals if needed
      console.log('Creating client for Agency Hub visual Filing Cabinet document');
      const clientData = {
        name: "Agency Hub Visuals",
        email: '',
        phone: '',
        address: '',
        notes: 'Auto-created for Agency Hub generated visuals',
        createdById: req.session.user!.id
      };
      
      // Check if client already exists
      let existingClients = await storage.getClients();
      let agencyClient = existingClients.find(c => c.name === "Agency Hub Visuals" && c.createdById === req.session.user!.id);
      
      if (!agencyClient) {
        agencyClient = await storage.createClient(clientData);
      }

      // Create document in Filing Cabinet
      const documentData = {
        clientId: agencyClient.id,
        name: `Agency Visual: ${prompt?.substring(0, 50) || 'Generated Visual'}...`,
        description: description || `AI-generated marketing visual${prompt ? ` from prompt: ${prompt}` : ''}`,
        type: 'visual' as const,
        category: 'marketing',
        fileUrl: fileUrl,
        fileName: fileName,
        fileSize: imageBuffer.length,
        mimeType: 'image/png',
        uploadedById: req.session.user!.id,
        createdById: req.session.user!.id,
        tags: ['agency-hub', 'ai-generated', 'marketing-visual'],
        metadata: {
          prompt: prompt || '',
          generatedAt: new Date().toISOString(),
          source: 'agency-hub-dall-e-3'
        }
      };

      const document = await storage.createClientDocument(documentData);
      console.log(`✅ Agency visual saved to Filing Cabinet: ${fileName}`);

      res.status(201).json({ 
        message: "Visual saved to Filing Cabinet successfully",
        document,
        clientName: agencyClient.name
      });
    } catch (error: any) {
      console.error("❌ Save to Filing Cabinet Error:", error.message || error);
      res.status(500).json({ error: "Failed to save visual to Filing Cabinet: " + (error.message || "Unknown error") });
    }
  });

  // Payment endpoints
  app.get("/api/payments", requireAuth, async (req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  app.get("/api/payments/:id", requireAuth, async (req, res) => {
    try {
      const payment = await storage.getPayment(req.params.id);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      console.error("Error fetching payment:", error);
      res.status(500).json({ error: "Failed to fetch payment" });
    }
  });

  app.post("/api/payments", requireAuth, async (req, res) => {
    try {
      const result = insertPaymentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: "Invalid payment data", 
          details: result.error.issues 
        });
      }

      const payment = await storage.createPayment({
        ...result.data,
        paymentDate: result.data.paymentDate.toISOString()
      });
      
      // Update invoice paid amounts if payment is linked to an invoice
      if (payment.invoiceId) {
        const invoice = await storage.getInvoice(payment.invoiceId);
        if (invoice) {
          const totalPaid = parseFloat(invoice.amountPaid || "0") + parseFloat(payment.amount);
          const balanceDue = parseFloat(invoice.totalAmount || "0") - totalPaid;
          const status = balanceDue <= 0 ? "paid" : "sent";
          
          await storage.updateInvoice(payment.invoiceId, {
            amountPaid: totalPaid.toFixed(2),
            balanceDue: balanceDue.toFixed(2),
            status: status,
            paidAt: balanceDue <= 0 ? new Date() : invoice.paidAt
          });
        }
      }

      res.json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ error: "Failed to create payment" });
    }
  });

  app.put("/api/payments/:id", requireAuth, async (req, res) => {
    try {
      const updateData = req.body;
      const payment = await storage.updatePayment(req.params.id, updateData);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      console.error("Error updating payment:", error);
      res.status(500).json({ error: "Failed to update payment" });
    }
  });

  app.delete("/api/payments/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deletePayment(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Payment not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting payment:", error);
      res.status(500).json({ error: "Failed to delete payment" });
    }
  });

  app.get("/api/invoices/:id/payments", requireAuth, async (req, res) => {
    try {
      const payments = await storage.getPayments();
      const invoicePayments = payments.filter(p => p.invoiceId === req.params.id);
      res.json(invoicePayments);
    } catch (error) {
      console.error("Error fetching invoice payments:", error);
      res.status(500).json({ error: "Failed to fetch invoice payments" });
    }
  });

  // Test PDF generation endpoint
  app.post("/api/test-pdf/:type", requireAuth, async (req, res) => {
    try {
      const { type } = req.params;
      
      if (type === "invoice") {
        // Test invoice PDF generation
        const testInvoice = {
          id: "test-invoice-001",
          invoiceNumber: "INV-2025-001",
          clientName: "Test Client Corp",
          clientEmail: "test@example.com",
          clientAddress: "123 Test Street\nTest City, TC 12345",
          projectDescription: "Test Project Services",
          status: "draft",
          totalAmount: "2500.00",
          taxAmount: "250.00",
          lineItems: [
            {
              description: "Web Development Services",
              quantity: 40,
              rate: 50.00,
              amount: 2000.00
            },
            {
              description: "Project Management",
              quantity: 10,
              rate: 50.00,
              amount: 500.00
            }
          ],
          terms: "Payment due within 30 days. Late fees may apply.",
          createdAt: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };

        const pdfBuffer = await generateInvoicePDF(testInvoice);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="test-invoice.pdf"');
        res.send(pdfBuffer);
      } else if (type === "proposal") {
        // Test proposal PDF generation
        const testProposal = {
          id: "test-proposal-001",
          title: "Website Redesign Proposal",
          clientName: "Test Client Corp",
          clientEmail: "test@example.com",
          content: `
            <h2>Project Overview</h2>
            <p>We propose to redesign your company website with modern, responsive design and improved user experience.</p>
            
            <h2>Scope of Work</h2>
            <ul>
              <li>Complete website redesign</li>
              <li>Mobile-responsive implementation</li>
              <li>Content management system integration</li>
              <li>SEO optimization</li>
              <li>Performance optimization</li>
            </ul>
            
            <h2>Timeline</h2>
            <p>The project will be completed within 8-10 weeks from project start date.</p>
            
            <h2>Investment</h2>
            <p>Total project investment: <strong>$15,000</strong></p>
          `,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };

        const pdfBuffer = await generateProposalPDF(testProposal);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="test-proposal.pdf"');
        res.send(pdfBuffer);
      } else {
        return res.status(400).json({ error: "Invalid PDF type. Use 'invoice' or 'proposal'" });
      }
      
      console.log(`✅ ${type} PDF generated successfully`);
    } catch (error) {
      console.error(`❌ PDF generation error:`, error);
      res.status(500).json({ error: `Failed to generate ${req.params.type} PDF: ${(error as Error).message}` });
    }
  });

  // Serve public assets from object storage
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      await objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Serve protected objects from object storage with ACL checks
  app.get("/objects/:objectPath(*)", requireAuth, async (req, res) => {
    const userId = req.session.user?.id;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(403);
      }
      await objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing protected object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Get upload URL for file uploads
  app.post("/api/objects/upload", requireAuth, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // Update object ACL policy after upload
  app.put("/api/objects/acl", requireAuth, async (req, res) => {
    try {
      const { objectURL, visibility = "private", aclRules = [] } = req.body;
      if (!objectURL) {
        return res.status(400).json({ error: "objectURL is required" });
      }

      const userId = req.session.user?.id;
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        objectURL,
        {
          owner: userId,
          visibility,
          aclRules
        }
      );

      res.json({ objectPath });
    } catch (error) {
      console.error("Error setting object ACL:", error);
      res.status(500).json({ error: "Failed to set object permissions" });
    }
  });

  // Calendar Integration Routes
  
  // Export tasks as iCal for calendar sync
  app.get("/api/calendar/export", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.role === 'admin' ? undefined : req.session.user?.id;
      const tasks = await storage.getTasks(userId);
      
      // Generate iCal content
      const icalLines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Gigster Garage//Task Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
      ];

      for (const task of tasks) {
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate);
          const uid = `task-${task.id}@gigster-garage.com`;
          const dtstart = dueDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
          
          icalLines.push(
            'BEGIN:VEVENT',
            `UID:${uid}`,
            `DTSTART:${dtstart}`,
            `DTEND:${dtstart}`,
            `SUMMARY:${task.title}`,
            `DESCRIPTION:${task.description || ''}`,
            `STATUS:${task.completed ? 'COMPLETED' : 'CONFIRMED'}`,
            `PRIORITY:${task.priority === 'high' ? '1' : task.priority === 'medium' ? '5' : '9'}`,
            'END:VEVENT'
          );
        }
      }

      icalLines.push('END:VCALENDAR');
      
      res.setHeader('Content-Type', 'text/calendar');
      res.setHeader('Content-Disposition', 'attachment; filename="gigster-garage-tasks.ics"');
      res.send(icalLines.join('\r\n'));
    } catch (error) {
      console.error("Error exporting calendar:", error);
      res.status(500).json({ error: "Failed to export calendar" });
    }
  });

  // Analytics and Reporting Routes
  
  // Get productivity analytics data
  app.get("/api/analytics/productivity", requireAuth, async (req, res) => {
    try {
      const { days = 30 } = req.query;
      const userId = req.session.user?.role === 'admin' ? undefined : req.session.user?.id;
      
      const timeLogs = await storage.getTimeLogs(userId);
      const tasks = await storage.getTasks(userId);
      
      const dayCount = parseInt(days as string);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - dayCount);
      
      const recentLogs = timeLogs.filter(log => new Date(log.createdAt) >= cutoffDate);
      const recentTasks = tasks.filter(task => new Date(task.createdAt) >= cutoffDate);
      
      // Calculate daily productivity data
      const dailyData = [];
      for (let i = dayCount - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayLogs = recentLogs.filter(log => 
          log.createdAt.split('T')[0] === dateStr
        );
        const dayTasks = recentTasks.filter(task => 
          task.createdAt.split('T')[0] === dateStr
        );
        const completedTasks = dayTasks.filter(task => 
          task.completed && task.updatedAt && task.updatedAt.split('T')[0] === dateStr
        );
        
        const totalMinutes = dayLogs.reduce((sum, log) => {
          if (log.endTime) {
            const duration = new Date(log.endTime).getTime() - new Date(log.startTime).getTime();
            return sum + Math.floor(duration / 60000);
          }
          return sum;
        }, 0);
        
        dailyData.push({
          date: dateStr,
          hours: Math.round(totalMinutes / 60 * 100) / 100,
          tasksCreated: dayTasks.length,
          tasksCompleted: completedTasks.length,
          productivity: completedTasks.length > 0 ? Math.round((completedTasks.length / Math.max(dayTasks.length, 1)) * 100) : 0
        });
      }
      
      // Calculate summary statistics
      const totalHours = dailyData.reduce((sum, day) => sum + day.hours, 0);
      const totalTasksCompleted = dailyData.reduce((sum, day) => sum + day.tasksCompleted, 0);
      const averageProductivity = Math.round(dailyData.reduce((sum, day) => sum + day.productivity, 0) / dailyData.length);
      
      res.json({
        dailyData,
        summary: {
          totalHours: Math.round(totalHours * 100) / 100,
          averageDailyHours: Math.round((totalHours / dayCount) * 100) / 100,
          totalTasksCompleted,
          averageProductivity,
          periodDays: dayCount
        }
      });
    } catch (error) {
      console.error("Error fetching productivity analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics data" });
    }
  });

  // Get task completion trends
  app.get("/api/analytics/tasks", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.role === 'admin' ? undefined : req.session.user?.id;
      const tasks = await storage.getTasks(userId);
      
      // Group tasks by priority and status
      const priorityBreakdown = {
        high: { total: 0, completed: 0 },
        medium: { total: 0, completed: 0 },
        low: { total: 0, completed: 0 }
      };
      
      tasks.forEach(task => {
        const priority = task.priority || 'medium';
        if (priorityBreakdown[priority as keyof typeof priorityBreakdown]) {
          priorityBreakdown[priority as keyof typeof priorityBreakdown].total++;
          if (task.completed) {
            priorityBreakdown[priority as keyof typeof priorityBreakdown].completed++;
          }
        }
      });
      
      // Calculate overdue tasks
      const now = new Date();
      const overdueTasks = tasks.filter(task => 
        !task.completed && task.dueDate && new Date(task.dueDate) < now
      );
      
      res.json({
        priorityBreakdown,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.completed).length,
        overdueTasks: overdueTasks.length,
        completionRate: Math.round((tasks.filter(t => t.completed).length / Math.max(tasks.length, 1)) * 100)
      });
    } catch (error) {
      console.error("Error fetching task analytics:", error);
      res.status(500).json({ error: "Failed to fetch task analytics" });
    }
  });

  // Bulk Operations Routes
  
  // Bulk delete tasks
  app.post("/api/bulk/tasks/delete", requireAuth, async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "IDs array required" });
      }

      let completed = 0;
      let errors = 0;

      for (const id of ids) {
        try {
          const success = await storage.deleteTask(id);
          if (success) completed++;
          else errors++;
        } catch (error) {
          console.error(`Error deleting task ${id}:`, error);
          errors++;
        }
      }

      res.json({ total: ids.length, completed, errors });
    } catch (error) {
      console.error("Error in bulk delete tasks:", error);
      res.status(500).json({ message: "Failed to delete tasks" });
    }
  });

  // Bulk edit tasks
  app.post("/api/bulk/tasks/edit", requireAuth, async (req, res) => {
    try {
      const { ids, updates } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "IDs array required" });
      }

      let completed = 0;
      let errors = 0;

      for (const id of ids) {
        try {
          const updated = await storage.updateTask(id, updates);
          if (updated) completed++;
          else errors++;
        } catch (error) {
          console.error(`Error updating task ${id}:`, error);
          errors++;
        }
      }

      res.json({ total: ids.length, completed, errors });
    } catch (error) {
      console.error("Error in bulk edit tasks:", error);
      res.status(500).json({ message: "Failed to update tasks" });
    }
  });

  // Bulk delete projects
  app.post("/api/bulk/projects/delete", requireAdmin, async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "IDs array required" });
      }

      let completed = 0;
      let errors = 0;

      for (const id of ids) {
        try {
          // Archive instead of delete to preserve data integrity
          const success = await storage.updateProject(id, { status: 'cancelled' });
          if (success) completed++;
          else errors++;
        } catch (error) {
          console.error(`Error archiving project ${id}:`, error);
          errors++;
        }
      }

      res.json({ total: ids.length, completed, errors });
    } catch (error) {
      console.error("Error in bulk delete projects:", error);
      res.status(500).json({ message: "Failed to archive projects" });
    }
  });

  // Bulk edit projects
  app.post("/api/bulk/projects/edit", requireAdmin, async (req, res) => {
    try {
      const { ids, updates } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "IDs array required" });
      }

      let completed = 0;
      let errors = 0;

      for (const id of ids) {
        try {
          const updated = await storage.updateProject(id, updates);
          if (updated) completed++;
          else errors++;
        } catch (error) {
          console.error(`Error updating project ${id}:`, error);
          errors++;
        }
      }

      res.json({ total: ids.length, completed, errors });
    } catch (error) {
      console.error("Error in bulk edit projects:", error);
      res.status(500).json({ message: "Failed to update projects" });
    }
  });

  // Bulk delete clients
  app.post("/api/bulk/clients/delete", requireAdmin, async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "IDs array required" });
      }

      let completed = 0;
      let errors = 0;

      for (const id of ids) {
        try {
          const success = await storage.deleteClient(id);
          if (success) completed++;
          else errors++;
        } catch (error) {
          console.error(`Error deleting client ${id}:`, error);
          errors++;
        }
      }

      res.json({ total: ids.length, completed, errors });
    } catch (error) {
      console.error("Error in bulk delete clients:", error);
      res.status(500).json({ message: "Failed to delete clients" });
    }
  });

  // Bulk edit clients
  app.post("/api/bulk/clients/edit", requireAdmin, async (req, res) => {
    try {
      const { ids, updates } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "IDs array required" });
      }

      let completed = 0;
      let errors = 0;

      for (const id of ids) {
        try {
          const updated = await storage.updateClient(id, updates);
          if (updated) completed++;
          else errors++;
        } catch (error) {
          console.error(`Error updating client ${id}:`, error);
          errors++;
        }
      }

      res.json({ total: ids.length, completed, errors });
    } catch (error) {
      console.error("Error in bulk edit clients:", error);
      res.status(500).json({ message: "Failed to update clients" });
    }
  });

  // CSV Export Routes
  
  // Export tasks to CSV
  app.get("/api/export/tasks", requireAuth, async (req, res) => {
    try {
      const { format = 'csv', ids } = req.query;
      const userId = req.session.user?.role === 'admin' ? undefined : req.session.user?.id;
      
      let tasks;
      if (ids && typeof ids === 'string') {
        const taskIds = ids.split(',');
        tasks = [];
        for (const id of taskIds) {
          const task = await storage.getTask(id);
          if (task && (!userId || task.assignedToId === userId)) {
            tasks.push(task);
          }
        }
      } else {
        tasks = await storage.getTasks(userId);
      }

      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="tasks.json"');
        return res.send(JSON.stringify(tasks, null, 2));
      }

      // CSV export
      const csvWriter = createCsvWriter.createObjectCsvStringifier({
        header: [
          { id: 'id', title: 'ID' },
          { id: 'title', title: 'Title' },
          { id: 'description', title: 'Description' },
          { id: 'status', title: 'Status' },
          { id: 'priority', title: 'Priority' },
          { id: 'assignedToId', title: 'Assigned To ID' },
          { id: 'projectId', title: 'Project ID' },
          { id: 'dueDate', title: 'Due Date' },
          { id: 'createdAt', title: 'Created At' },
          { id: 'updatedAt', title: 'Updated At' }
        ]
      });

      const csvContent = csvWriter.getHeaderString() + csvWriter.stringifyRecords(tasks);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="tasks.csv"');
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting tasks:", error);
      res.status(500).json({ message: "Failed to export tasks" });
    }
  });

  // Export projects to CSV
  app.get("/api/export/projects", requireAuth, async (req, res) => {
    try {
      const { format = 'csv', ids } = req.query;
      
      let projects;
      if (ids && typeof ids === 'string') {
        const projectIds = ids.split(',');
        projects = [];
        for (const id of projectIds) {
          const project = await storage.getProject(id);
          if (project) {
            projects.push(project);
          }
        }
      } else {
        projects = await storage.getProjects();
      }

      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="projects.json"');
        return res.send(JSON.stringify(projects, null, 2));
      }

      // CSV export
      const csvWriter = createCsvWriter.createObjectCsvStringifier({
        header: [
          { id: 'id', title: 'ID' },
          { id: 'name', title: 'Name' },
          { id: 'description', title: 'Description' },
          { id: 'status', title: 'Status' },
          { id: 'createdAt', title: 'Created At' },
          { id: 'updatedAt', title: 'Updated At' }
        ]
      });

      const csvContent = csvWriter.getHeaderString() + csvWriter.stringifyRecords(projects);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="projects.csv"');
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting projects:", error);
      res.status(500).json({ message: "Failed to export projects" });
    }
  });

  // Export clients to CSV
  app.get("/api/export/clients", requireAuth, async (req, res) => {
    try {
      const { format = 'csv', ids } = req.query;
      
      let clients;
      if (ids && typeof ids === 'string') {
        const clientIds = ids.split(',');
        clients = [];
        for (const id of clientIds) {
          const client = await storage.getClient(id);
          if (client) {
            clients.push(client);
          }
        }
      } else {
        clients = await storage.getClients();
      }

      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="clients.json"');
        return res.send(JSON.stringify(clients, null, 2));
      }

      // CSV export
      const csvWriter = createCsvWriter.createObjectCsvStringifier({
        header: [
          { id: 'id', title: 'ID' },
          { id: 'name', title: 'Name' },
          { id: 'email', title: 'Email' },
          { id: 'phone', title: 'Phone' },
          { id: 'company', title: 'Company' },
          { id: 'address', title: 'Address' },
          { id: 'website', title: 'Website' },
          { id: 'createdAt', title: 'Created At' },
          { id: 'updatedAt', title: 'Updated At' }
        ]
      });

      const csvContent = csvWriter.getHeaderString() + csvWriter.stringifyRecords(clients);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="clients.csv"');
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting clients:", error);
      res.status(500).json({ message: "Failed to export clients" });
    }
  });

  // Custom Fields API Routes
  
  // Get custom field definitions
  app.get("/api/custom-fields", requireAuth, async (req, res) => {
    try {
      const { entityType } = req.query;
      const fields = await storage.getCustomFieldDefinitions(entityType as string);
      res.json(fields);
    } catch (error) {
      console.error("Error fetching custom field definitions:", error);
      res.status(500).json({ message: "Failed to fetch custom fields" });
    }
  });

  // Get specific custom field definition
  app.get("/api/custom-fields/:id", requireAuth, async (req, res) => {
    try {
      const field = await storage.getCustomFieldDefinition(req.params.id);
      if (!field) {
        return res.status(404).json({ message: "Custom field not found" });
      }
      res.json(field);
    } catch (error) {
      console.error("Error fetching custom field:", error);
      res.status(500).json({ message: "Failed to fetch custom field" });
    }
  });

  // Create custom field definition
  app.post("/api/custom-fields", requireAuth, async (req, res) => {
    try {
      const fieldData = {
        ...req.body,
        createdById: req.session.user!.id,
      };
      const field = await storage.createCustomFieldDefinition(fieldData);
      res.status(201).json(field);
    } catch (error) {
      console.error("Error creating custom field:", error);
      res.status(500).json({ message: "Failed to create custom field" });
    }
  });

  // Update custom field definition
  app.put("/api/custom-fields/:id", requireAuth, async (req, res) => {
    try {
      const field = await storage.updateCustomFieldDefinition(req.params.id, req.body);
      if (!field) {
        return res.status(404).json({ message: "Custom field not found" });
      }
      res.json(field);
    } catch (error) {
      console.error("Error updating custom field:", error);
      res.status(500).json({ message: "Failed to update custom field" });
    }
  });

  // Delete custom field definition
  app.delete("/api/custom-fields/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteCustomFieldDefinition(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Custom field not found" });
      }
      res.json({ message: "Custom field deleted successfully" });
    } catch (error) {
      console.error("Error deleting custom field:", error);
      res.status(500).json({ message: "Failed to delete custom field" });
    }
  });

  // Get custom field values for an entity
  app.get("/api/custom-field-values/:entityType/:entityId", requireAuth, async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const values = await storage.getCustomFieldValues(entityType, entityId);
      res.json(values);
    } catch (error) {
      console.error("Error fetching custom field values:", error);
      res.status(500).json({ message: "Failed to fetch custom field values" });
    }
  });

  // Set custom field value
  app.post("/api/custom-field-values", requireAuth, async (req, res) => {
    try {
      const value = await storage.setCustomFieldValue(req.body);
      res.json(value);
    } catch (error) {
      console.error("Error setting custom field value:", error);
      res.status(500).json({ message: "Failed to set custom field value" });
    }
  });

  // Workflow Rules API Routes

  // Get workflow rules
  app.get("/api/workflow-rules", requireAuth, async (req, res) => {
    try {
      const { entityType, isActive } = req.query;
      const rules = await storage.getWorkflowRules(
        entityType as string,
        isActive ? isActive === 'true' : undefined
      );
      res.json(rules);
    } catch (error) {
      console.error("Error fetching workflow rules:", error);
      res.status(500).json({ message: "Failed to fetch workflow rules" });
    }
  });

  // Create workflow rule
  app.post("/api/workflow-rules", requireAuth, async (req, res) => {
    try {
      const ruleData = {
        ...req.body,
        createdById: req.session.user!.id,
      };
      const rule = await storage.createWorkflowRule(ruleData);
      res.status(201).json(rule);
    } catch (error) {
      console.error("Error creating workflow rule:", error);
      res.status(500).json({ message: "Failed to create workflow rule" });
    }
  });

  // Update workflow rule
  app.put("/api/workflow-rules/:id", requireAuth, async (req, res) => {
    try {
      const rule = await storage.updateWorkflowRule(req.params.id, req.body);
      if (!rule) {
        return res.status(404).json({ message: "Workflow rule not found" });
      }
      res.json(rule);
    } catch (error) {
      console.error("Error updating workflow rule:", error);
      res.status(500).json({ message: "Failed to update workflow rule" });
    }
  });

  // Delete workflow rule
  app.delete("/api/workflow-rules/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteWorkflowRule(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Workflow rule not found" });
      }
      res.json({ message: "Workflow rule deleted successfully" });
    } catch (error) {
      console.error("Error deleting workflow rule:", error);
      res.status(500).json({ message: "Failed to delete workflow rule" });
    }
  });

  // Route aliases for backward compatibility - workflow routes
  app.get("/api/workflow/rules", requireAuth, async (req, res) => {
    try {
      const { entityType, isActive } = req.query;
      const rules = await storage.getWorkflowRules(
        entityType as string,
        isActive ? isActive === 'true' : undefined
      );
      res.json(rules);
    } catch (error) {
      console.error("Error fetching workflow rules:", error);
      res.status(500).json({ message: "Failed to fetch workflow rules" });
    }
  });

  app.post("/api/workflow/rules", requireAuth, async (req, res) => {
    try {
      const ruleData = {
        ...req.body,
        createdById: req.session.user!.id,
      };
      const rule = await storage.createWorkflowRule(ruleData);
      res.status(201).json(rule);
    } catch (error) {
      console.error("Error creating workflow rule:", error);
      res.status(500).json({ message: "Failed to create workflow rule" });
    }
  });

  app.put("/api/workflow/rules/:id", requireAuth, async (req, res) => {
    try {
      const rule = await storage.updateWorkflowRule(req.params.id, req.body);
      if (!rule) {
        return res.status(404).json({ message: "Workflow rule not found" });
      }
      res.json(rule);
    } catch (error) {
      console.error("Error updating workflow rule:", error);
      res.status(500).json({ message: "Failed to update workflow rule" });
    }
  });

  app.delete("/api/workflow/rules/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteWorkflowRule(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Workflow rule not found" });
      }
      res.json({ message: "Workflow rule deleted successfully" });
    } catch (error) {
      console.error("Error deleting workflow rule:", error);
      res.status(500).json({ message: "Failed to delete workflow rule" });
    }
  });

  // Get workflow executions
  app.get("/api/workflow-executions", requireAuth, async (req, res) => {
    try {
      const executions = await storage.getWorkflowExecutions();
      res.json(executions);
    } catch (error) {
      console.error("Error fetching workflow executions:", error);
      res.status(500).json({ message: "Failed to fetch workflow executions" });
    }
  });

  // Comments API Routes

  // Get comments for an entity
  app.get("/api/comments/:entityType/:entityId", requireAuth, async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const comments = await storage.getComments(entityType, entityId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Create comment
  app.post("/api/comments", requireAuth, async (req, res) => {
    try {
      const commentData = {
        ...req.body,
        authorId: req.session.user!.id,
      };
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Update comment
  app.put("/api/comments/:id", requireAuth, async (req, res) => {
    try {
      const comment = await storage.updateComment(req.params.id, req.body);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      res.json(comment);
    } catch (error) {
      console.error("Error updating comment:", error);
      res.status(500).json({ message: "Failed to update comment" });
    }
  });

  // Delete comment
  app.delete("/api/comments/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteComment(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Comment not found" });
      }
      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // Activities API Routes

  // Get activities
  app.get("/api/activities", requireAuth, async (req, res) => {
    try {
      const { entityType, entityId, actorId, limit } = req.query;
      const activities = await storage.getActivities(
        entityType as string,
        entityId as string,
        actorId as string,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // API Keys Management Routes

  // Get API keys
  app.get("/api/api-keys", requireAdmin, async (req, res) => {
    try {
      const keys = await storage.getApiKeys(req.session.user!.id);
      res.json(keys);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      res.status(500).json({ message: "Failed to fetch API keys" });
    }
  });

  // Create API key
  app.post("/api/api-keys", requireAdmin, async (req, res) => {
    try {
      const crypto = require('crypto');
      const bcrypt = require('bcryptjs');
      
      // Generate API key
      const key = `pk_${crypto.randomBytes(32).toString('hex')}`;
      const hashedKey = await bcrypt.hash(key, 10);
      const prefix = key.substring(0, 8);

      const keyData = {
        ...req.body,
        key,
        hashedKey,
        prefix,
        createdById: req.session.user!.id,
      };
      
      const apiKey = await storage.createApiKey(keyData);
      
      // Return the key only once for security
      res.status(201).json({ ...apiKey, key });
    } catch (error) {
      console.error("Error creating API key:", error);
      res.status(500).json({ message: "Failed to create API key" });
    }
  });

  // Update API key
  app.put("/api/api-keys/:id", requireAdmin, async (req, res) => {
    try {
      const key = await storage.updateApiKey(req.params.id, req.body);
      if (!key) {
        return res.status(404).json({ message: "API key not found" });
      }
      res.json(key);
    } catch (error) {
      console.error("Error updating API key:", error);
      res.status(500).json({ message: "Failed to update API key" });
    }
  });

  // Delete API key
  app.delete("/api/api-keys/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteApiKey(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "API key not found" });
      }
      res.json({ message: "API key deleted successfully" });
    } catch (error) {
      console.error("Error deleting API key:", error);
      res.status(500).json({ message: "Failed to delete API key" });
    }
  });

  // CSV Import Routes
  
  // Import tasks from CSV
  app.post("/api/import/tasks", requireAuth, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const results: any[] = [];
      const fs = require('fs');
      
      const readStream = fs.createReadStream(req.file.path);
      
      readStream
        .pipe(csvParser())
        .on('data', (data: any) => results.push(data))
        .on('end', async () => {
          let completed = 0;
          let errors = 0;
          
          for (const row of results) {
            try {
              // Validate and clean the data
              const taskData = {
                title: row.Title || row.title || '',
                description: row.Description || row.description || null,
                status: row.Status || row.status || 'todo',
                priority: row.Priority || row.priority || 'medium',
                assignedToId: row['Assigned To ID'] || row.assignedToId || req.session.user!.id,
                projectId: row['Project ID'] || row.projectId || null,
                dueDate: row['Due Date'] || row.dueDate ? new Date(row['Due Date'] || row.dueDate) : null
              };
              
              if (!taskData.title) {
                errors++;
                continue;
              }

              await storage.createTask(taskData, req.session.user!.id);
              completed++;
            } catch (error) {
              console.error('Error importing task row:', error);
              errors++;
            }
          }

          // Clean up uploaded file
          if (req.file) {
            fs.unlink(req.file.path, () => {});
          }
          
          res.json({ total: results.length, completed, errors });
        });
    } catch (error) {
      console.error("Error importing tasks:", error);
      res.status(500).json({ message: "Failed to import tasks" });
    }
  });

  // Import projects from CSV
  app.post("/api/import/projects", requireAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const results: any[] = [];
      const fs = require('fs');
      
      const readStream = fs.createReadStream(req.file.path);
      
      readStream
        .pipe(csvParser())
        .on('data', (data: any) => results.push(data))
        .on('end', async () => {
          let completed = 0;
          let errors = 0;
          
          for (const row of results) {
            try {
              const projectData = {
                name: row.Name || row.name || '',
                description: row.Description || row.description || null,
                status: row.Status || row.status || 'active'
              };
              
              if (!projectData.name) {
                errors++;
                continue;
              }

              await storage.createProject(projectData);
              completed++;
            } catch (error) {
              console.error('Error importing project row:', error);
              errors++;
            }
          }

          // Clean up uploaded file
          if (req.file) {
            fs.unlink(req.file.path, () => {});
          }
          
          res.json({ total: results.length, completed, errors });
        });
    } catch (error) {
      console.error("Error importing projects:", error);
      res.status(500).json({ message: "Failed to import projects" });
    }
  });

  // Import clients from CSV
  app.post("/api/import/clients", requireAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const results: any[] = [];
      const fs = require('fs');
      
      const readStream = fs.createReadStream(req.file.path);
      
      readStream
        .pipe(csvParser())
        .on('data', (data: any) => results.push(data))
        .on('end', async () => {
          let completed = 0;
          let errors = 0;
          
          for (const row of results) {
            try {
              const clientData = {
                name: row.Name || row.name || '',
                email: row.Email || row.email || null,
                phone: row.Phone || row.phone || null,
                company: row.Company || row.company || null,
                address: row.Address || row.address || null,
                website: row.Website || row.website || null
              };
              
              if (!clientData.name) {
                errors++;
                continue;
              }

              await storage.createClient(clientData);
              completed++;
            } catch (error) {
              console.error('Error importing client row:', error);
              errors++;
            }
          }

          // Clean up uploaded file
          if (req.file) {
            fs.unlink(req.file.path, () => {});
          }
          
          res.json({ total: results.length, completed, errors });
        });
    } catch (error) {
      console.error("Error importing clients:", error);
      res.status(500).json({ message: "Failed to import clients" });
    }
  });

  // AI Proposal Generation Route
  app.post("/api/ai/generate-proposal", requireAuth, async (req, res) => {
    try {
      const { projectTitle, clientName, projectDescription, totalBudget, timeline, scope, requirements } = req.body;

      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ 
          message: "AI proposal generation is not available",
          error: "OpenAI API key not configured" 
        });
      }

      if (!projectTitle) {
        return res.status(400).json({ 
          message: "Project title is required for proposal generation" 
        });
      }

      const prompt = `Generate a professional business proposal for the following project:

Project Title: ${projectTitle}
${clientName ? `Client: ${clientName}` : ''}
${projectDescription ? `Description: ${projectDescription}` : ''}
${totalBudget ? `Budget: $${totalBudget}` : ''}
${timeline ? `Timeline: ${timeline}` : ''}
${scope ? `Scope: ${scope}` : ''}
${requirements ? `Requirements: ${requirements}` : ''}

Create a comprehensive proposal that includes:
1. Executive Summary
2. Project Overview and Objectives  
3. Scope of Work and Deliverables
4. Timeline and Milestones
5. Investment and Payment Terms
6. Our Approach and Methodology
7. Why Choose Us / Value Proposition
8. Next Steps

Make it professional, persuasive, and tailored to the client's needs. Use clear sections and bullet points where appropriate. The tone should be confident but not overly sales-oriented.`;

      // Using gpt-4o as it's reliable and available
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a professional business consultant specializing in creating compelling project proposals. Generate well-structured, professional proposals that clearly communicate value and build client confidence."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_completion_tokens: 1500,
      });

      const content = completion.choices[0].message.content?.trim();

      if (!content) {
        throw new Error("No proposal content generated");
      }

      res.json({ 
        content,
        projectTitle,
        clientName,
        generatedAt: new Date().toISOString()
      });

    } catch (error: any) {
      console.error("AI proposal generation error:", error);
      res.status(500).json({ 
        message: "Failed to generate proposal",
        error: error.message 
      });
    }
  });

  // AI Content Generation Route
  app.post("/api/ai/generate-content", requireAuth, async (req, res) => {
    try {
      const { type, projectTitle, clientName, projectDescription, totalBudget, timeline, context } = req.body;

      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ 
          message: "AI content generation is not available",
          error: "OpenAI API key not configured" 
        });
      }

      let prompt = "";
      let maxTokens = 800;

      switch (type) {
        case "project_description":
          prompt = `Write a professional project description for "${projectTitle}"${clientName ? ` for client ${clientName}` : ''}. 

The description should:
- Be detailed but concise (around 200-400 words)
- Explain the project objectives clearly
- Outline the scope of work
- Use professional business language
- Be engaging and persuasive

Context: ${context}`;
          maxTokens = 600;
          break;

        case "deliverables":
          prompt = `Create a comprehensive list of deliverables for project "${projectTitle}".

The deliverables should:
- Be specific and measurable
- Include key components and features
- Be organized in a logical order
- Use bullet points or numbered list format
- Cover all major aspects of the project

${projectDescription ? `Project context: ${projectDescription}` : ''}
Context: ${context}`;
          maxTokens = 500;
          break;

        case "terms_conditions":
          prompt = `Generate professional terms and conditions for project "${projectTitle}".

Include sections for:
- Payment terms and schedule
- Project timeline and milestones
- Scope of work and responsibilities
- Revision and change request policies
- Intellectual property rights
- Cancellation and refund policies
- Liability and warranty terms

${totalBudget ? `Budget: $${totalBudget}` : ''}
${timeline ? `Timeline: ${timeline}` : ''}
Context: ${context}

Keep it professional but easy to understand.`;
          maxTokens = 1000;
          break;

        case "marketing_concept_prompt":
          prompt = `Generate a detailed marketing concept prompt that includes target audience, brand style, platform specifications, and creative direction. Make it specific and actionable for creating professional marketing mockups.

The prompt should include:
- Target audience demographics and psychographics
- Brand style and visual direction
- Platform specifications (social media, print, digital, etc.)
- Creative direction and messaging approach
- Specific elements to include in the design
- Color palette and typography suggestions
- Call-to-action recommendations

${context ? `Additional context: ${context}` : ''}

Create a comprehensive brief that a designer could use to create effective marketing materials.`;
          maxTokens = 800;
          break;

        case "presentation_objective":
          const { title, audience, duration } = req.body;
          prompt = `Generate clear and compelling presentation objectives for a presentation titled "${title || projectTitle}".

The presentation details:
${title ? `- Title: ${title}` : ''}
${audience ? `- Target Audience: ${audience}` : ''}
${duration ? `- Duration: ${duration} minutes` : ''}

Create 3-5 specific, measurable objectives that:
- Clearly state what the audience will learn or achieve
- Are appropriate for the target audience
- Can be accomplished within the presentation timeframe
- Use action-oriented language (e.g., "understand", "identify", "apply")
- Are relevant to the presentation topic

Format as a concise list that would fit in a presentation outline section.

${context ? `Additional context: ${context}` : ''}`;
          maxTokens = 400;
          break;

        case "presentation_slide_content":
          const { presentationTitle, slideTitle, slideType, objective, audience: slideAudience } = req.body;
          prompt = `Generate engaging content for a presentation slide.

Slide Details:
- Presentation: ${presentationTitle || projectTitle}
- Slide Title: ${slideTitle}
- Slide Type: ${slideType}
${slideAudience ? `- Audience: ${slideAudience}` : ''}
${objective ? `- Presentation Objective: ${objective}` : ''}

Create ${slideType} content that:
- Is appropriate for the slide type and audience
- Supports the overall presentation objectives
- Is concise and engaging
- Uses appropriate formatting (bullet points, paragraphs, etc.)
- Maintains professional tone

${context ? `Additional context: ${context}` : ''}`;
          maxTokens = 600;
          break;

        case "contract_scope":
          const { contractTitle, contractValue } = req.body;
          prompt = `Generate a detailed scope of work for contract "${contractTitle || projectTitle}"${clientName ? ` with client ${clientName}` : ''}${contractValue ? ` valued at $${contractValue}` : ''}.

The scope of work should include:
- Project objectives and goals
- Detailed breakdown of tasks and activities
- Key deliverables and milestones
- Project boundaries and limitations
- Responsibilities of each party
- Timeline considerations
- Quality standards and acceptance criteria

Format as a comprehensive, professional scope that clearly defines what work will be performed.

${context ? `Additional context: ${context}` : ''}`;
          maxTokens = 800;
          break;

        case "contract_deliverables":
          const { contractTitle: contractDelTitle, scope } = req.body;
          prompt = `Create a comprehensive list of deliverables for contract "${contractDelTitle || projectTitle}"${clientName ? ` with client ${clientName}` : ''}.

The deliverables should:
- Be specific and measurable
- Include all key outputs and results
- Be organized logically by phase or category
- Include acceptance criteria for each deliverable
- Specify formats and quality standards
- Include any supporting documentation

${scope ? `Project scope: ${scope}` : ''}
${context ? `Additional context: ${context}` : ''}

Format as a detailed list that clearly defines what will be delivered to the client.`;
          maxTokens = 600;
          break;

        case "invoice_notes":
          prompt = `Generate professional invoice notes and payment terms${clientName ? ` for client ${clientName}` : ''}.

The notes should include:
- Clear payment terms and due date information
- Accepted payment methods
- Late payment policies if applicable
- Contact information for payment inquiries
- Any relevant project or service references
- Professional but friendly tone

${context ? `Additional context: ${context}` : ''}

Keep the notes concise but comprehensive, suitable for a professional invoice.`;
          maxTokens = 400;
          break;

        default:
          return res.status(400).json({ message: "Invalid content type" });
      }

      // Using gpt-4o as it's reliable and available
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a professional business consultant helping to write proposal content. Generate clear, professional, and persuasive content that would be appropriate for client-facing business proposals."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_completion_tokens: maxTokens,
      });

      const content = completion.choices[0].message.content?.trim();

      if (!content) {
        throw new Error("No content generated");
      }

      res.json({ content });

    } catch (error: any) {
      console.error("AI content generation error:", error);
      res.status(500).json({ 
        message: "Failed to generate content",
        error: error.message 
      });
    }
  });

  // Time Logs API endpoints
  app.get('/api/time-logs', async (req, res) => {
    try {
      const { userId, projectId } = req.query;
      const timeLogs = await storage.getTimeLogs(
        userId as string | undefined,
        projectId as string | undefined
      );
      res.json(timeLogs);
    } catch (error) {
      console.error('Error fetching time logs:', error);
      res.status(500).json({ message: 'Failed to fetch time logs' });
    }
  });

  app.post('/api/time-logs', async (req, res) => {
    try {
      const timeLogData = req.body;
      const timeLog = await storage.createTimeLog(timeLogData);
      res.status(201).json(timeLog);
    } catch (error) {
      console.error('Error creating time log:', error);
      res.status(500).json({ message: 'Failed to create time log' });
    }
  });

  app.put('/api/time-logs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const timeLog = await storage.updateTimeLog(id, updateData);
      
      if (!timeLog) {
        return res.status(404).json({ message: 'Time log not found' });
      }
      
      res.json(timeLog);
    } catch (error) {
      console.error('Error updating time log:', error);
      res.status(500).json({ message: 'Failed to update time log' });
    }
  });

  app.delete('/api/time-logs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteTimeLog(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Time log not found' });
      }
      
      res.json({ message: 'Time log deleted successfully' });
    } catch (error) {
      console.error('Error deleting time log:', error);
      res.status(500).json({ message: 'Failed to delete time log' });
    }
  });

  // Workflow Automation API endpoints
  app.get('/api/workflow-automations', async (req, res) => {
    try {
      const workflows = await storage.getWorkflowRules();
      res.json(workflows);
    } catch (error) {
      console.error('Error fetching workflow automations:', error);
      res.status(500).json({ message: 'Failed to fetch workflow automations' });
    }
  });

  app.post('/api/workflow-automations', requireAuth, async (req, res) => {
    try {
      const workflowData = {
        ...req.body,
        createdById: req.session.user!.id,
      };
      const workflow = await storage.createWorkflowRule(workflowData);
      res.status(201).json(workflow);
    } catch (error) {
      console.error('Error creating workflow automation:', error);
      res.status(500).json({ message: 'Failed to create workflow automation' });
    }
  });

  app.put('/api/workflow-automations/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const workflow = await storage.updateWorkflowRule(id, updateData);
      
      if (!workflow) {
        return res.status(404).json({ message: 'Workflow automation not found' });
      }
      
      res.json(workflow);
    } catch (error) {
      console.error('Error updating workflow automation:', error);
      res.status(500).json({ message: 'Failed to update workflow automation' });
    }
  });

  app.delete('/api/workflow-automations/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteWorkflowRule(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Workflow automation not found' });
      }
      
      res.json({ message: 'Workflow automation deleted successfully' });
    } catch (error) {
      console.error('Error deleting workflow automation:', error);
      res.status(500).json({ message: 'Failed to delete workflow automation' });
    }
  });

  // AI-Powered Insights API endpoints
  app.get('/api/ai-insights', requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const insights = await aiInsightsService.generateInsights(userId);
      res.json(insights);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      res.status(500).json({ message: 'Failed to generate insights' });
    }
  });

  app.post('/api/ai-insights/refresh', requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const insights = await aiInsightsService.generateInsights(userId);
      res.json({ message: 'Insights refreshed', insights });
    } catch (error) {
      console.error('Error refreshing AI insights:', error);
      res.status(500).json({ message: 'Failed to refresh insights' });
    }
  });

  app.get('/api/ai-insights/recommendations', requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const recommendations = await aiInsightsService.generateTaskRecommendations(userId);
      res.json(recommendations);
    } catch (error) {
      console.error('Error generating task recommendations:', error);
      res.status(500).json({ message: 'Failed to generate recommendations' });
    }
  });

  app.get('/api/ai-insights/team', requireAuth, async (req, res) => {
    try {
      // Only admins can access team insights
      if (req.session.user!.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const teamInsights = await aiInsightsService.generateTeamInsights();
      res.json(teamInsights);
    } catch (error) {
      console.error('Error generating team insights:', error);
      res.status(500).json({ message: 'Failed to generate team insights' });
    }
  });

  // Advanced Reporting API endpoints
  app.get('/api/reports', requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.role === 'admin' ? undefined : req.session.user!.id;
      const reports = await advancedReportingService.getReports(userId);
      res.json(reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      res.status(500).json({ message: 'Failed to fetch reports' });
    }
  });

  app.post('/api/reports/generate', requireAuth, async (req, res) => {
    try {
      const { template, timeRange, filters } = req.body;
      
      let reportData;
      
      switch (template) {
        case 'productivity':
          reportData = await advancedReportingService.generateProductivityReport(
            { start: new Date(timeRange.start), end: new Date(timeRange.end) },
            filters.userIds
          );
          break;
        case 'financial':
          reportData = await advancedReportingService.generateFinancialReport(
            { start: new Date(timeRange.start), end: new Date(timeRange.end) }
          );
          break;
        case 'time':
          reportData = await advancedReportingService.generateTimeTrackingReport(
            { start: new Date(timeRange.start), end: new Date(timeRange.end) },
            filters.userIds
          );
          break;
        case 'project':
          if (filters.projectIds && filters.projectIds.length > 0) {
            reportData = await advancedReportingService.generateProjectReport(
              filters.projectIds[0],
              { start: new Date(timeRange.start), end: new Date(timeRange.end) }
            );
          } else {
            return res.status(400).json({ message: 'Project ID required for project reports' });
          }
          break;
        default:
          return res.status(400).json({ message: 'Invalid report template' });
      }
      
      res.json(reportData);
    } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).json({ message: 'Failed to generate report' });
    }
  });

  app.post('/api/reports', requireAuth, async (req, res) => {
    try {
      const report = await advancedReportingService.createReport({
        ...req.body,
        createdBy: req.session.user!.id
      });
      res.json(report);
    } catch (error) {
      console.error('Error creating report:', error);
      res.status(500).json({ message: 'Failed to create report' });
    }
  });

  app.get('/api/reports/templates', requireAuth, async (req, res) => {
    try {
      const templates = advancedReportingService.getReportTemplates();
      res.json(templates);
    } catch (error) {
      console.error('Error fetching report templates:', error);
      res.status(500).json({ message: 'Failed to fetch templates' });
    }
  });

  // Webhook & Integration API endpoints
  app.get('/api/webhooks', requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.role === 'admin' ? undefined : req.session.user!.id;
      const webhooks = await webhookService.getWebhooks(userId);
      res.json(webhooks);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      res.status(500).json({ message: 'Failed to fetch webhooks' });
    }
  });

  app.post('/api/webhooks', requireAuth, async (req, res) => {
    try {
      const webhook = await webhookService.createWebhook({
        ...req.body,
        createdBy: req.session.user!.id
      });
      res.json(webhook);
    } catch (error) {
      console.error('Error creating webhook:', error);
      res.status(500).json({ message: 'Failed to create webhook' });
    }
  });

  app.patch('/api/webhooks/:id', requireAuth, async (req, res) => {
    try {
      const webhook = await webhookService.updateWebhook(req.params.id, req.body);
      res.json(webhook);
    } catch (error) {
      console.error('Error updating webhook:', error);
      res.status(500).json({ message: 'Failed to update webhook' });
    }
  });

  app.delete('/api/webhooks/:id', requireAuth, async (req, res) => {
    try {
      await webhookService.deleteWebhook(req.params.id);
      res.json({ message: 'Webhook deleted successfully' });
    } catch (error) {
      console.error('Error deleting webhook:', error);
      res.status(500).json({ message: 'Failed to delete webhook' });
    }
  });

  app.post('/api/webhooks/:id/test', requireAuth, async (req, res) => {
    try {
      await webhookService.triggerEvent('task.created', {
        id: 'test-task',
        title: 'Test Task',
        description: 'This is a test webhook delivery',
        status: 'pending',
        priority: 'medium',
        assignedTo: req.session.user!.name,
        createdAt: new Date().toISOString()
      }, { test: true });
      
      res.json({ message: 'Test webhook sent successfully' });
    } catch (error) {
      console.error('Error sending test webhook:', error);
      res.status(500).json({ message: 'Failed to send test webhook' });
    }
  });

  app.get('/api/webhooks/deliveries', requireAuth, async (req, res) => {
    try {
      const webhookId = req.query.webhookId as string;
      const deliveries = await webhookService.getDeliveries(webhookId);
      res.json(deliveries);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      res.status(500).json({ message: 'Failed to fetch deliveries' });
    }
  });

  app.get('/api/integrations', requireAuth, async (req, res) => {
    try {
      const integrations = await webhookService.getIntegrations();
      res.json(integrations);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      res.status(500).json({ message: 'Failed to fetch integrations' });
    }
  });

  app.post('/api/integrations', requireAuth, async (req, res) => {
    try {
      const integration = await webhookService.createIntegration({
        ...req.body,
        createdBy: req.session.user!.id
      });
      res.json(integration);
    } catch (error) {
      console.error('Error creating integration:', error);
      res.status(500).json({ message: 'Failed to create integration' });
    }
  });

  // Mobile API endpoints (optimized for mobile apps)
  app.get('/api/mobile/dashboard', requireAuth, async (req, res) => {
    try {
      const dashboard = await mobileApiService.getMobileDashboard(req.session.user!.id);
      const response = mobileApiService.createResponse(dashboard);
      res.json(response);
    } catch (error) {
      console.error('Error generating mobile dashboard:', error);
      const response = mobileApiService.createResponse(null, 'Failed to load dashboard');
      res.status(500).json(response);
    }
  });

  app.post('/api/mobile/sync', requireAuth, async (req, res) => {
    try {
      const syncData = await mobileApiService.syncMobileData(req.session.user!.id, req.body);
      const response = mobileApiService.createResponse(syncData);
      res.json(response);
    } catch (error) {
      console.error('Error syncing mobile data:', error);
      const response = mobileApiService.createResponse(null, 'Sync failed');
      res.status(500).json(response);
    }
  });

  app.get('/api/mobile/tasks', requireAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = {
        status: req.query.status as string,
        priority: req.query.priority as string,
        projectId: req.query.projectId as string,
        dueDate: req.query.dueDate as 'today' | 'week' | 'overdue'
      };

      const { tasks, total } = await mobileApiService.getMobileTasks(
        req.session.user!.id, 
        page, 
        limit, 
        filters
      );
      
      const response = mobileApiService.createPaginatedResponse(tasks, page, limit, total);
      res.json(response);
    } catch (error) {
      console.error('Error fetching mobile tasks:', error);
      const response = mobileApiService.createResponse(null, 'Failed to fetch tasks');
      res.status(500).json(response);
    }
  });

  app.post('/api/mobile/tasks', requireAuth, async (req, res) => {
    try {
      const task = await mobileApiService.createMobileTask(req.session.user!.id, req.body);
      const response = mobileApiService.createResponse(task, undefined, 'Task created successfully');
      res.json(response);
    } catch (error) {
      console.error('Error creating mobile task:', error);
      const response = mobileApiService.createResponse(null, 'Failed to create task');
      res.status(500).json(response);
    }
  });

  app.post('/api/mobile/time', requireAuth, async (req, res) => {
    try {
      const timeLog = await mobileApiService.logMobileTime(req.session.user!.id, req.body);
      const response = mobileApiService.createResponse(timeLog, undefined, 'Time logged successfully');
      res.json(response);
    } catch (error) {
      console.error('Error logging mobile time:', error);
      const response = mobileApiService.createResponse(null, 'Failed to log time');
      res.status(500).json(response);
    }
  });

  app.post('/api/mobile/push-token', requireAuth, async (req, res) => {
    try {
      await mobileApiService.registerPushToken(req.session.user!.id, req.body);
      const response = mobileApiService.createResponse(null, undefined, 'Push token registered');
      res.json(response);
    } catch (error) {
      console.error('Error registering push token:', error);
      const response = mobileApiService.createResponse(null, 'Failed to register push token');
      res.status(500).json(response);
    }
  });

  app.post('/api/mobile/offline-action', requireAuth, async (req, res) => {
    try {
      await mobileApiService.queueOfflineAction(req.session.user!.id, req.body);
      const response = mobileApiService.createResponse(null, undefined, 'Action queued');
      res.json(response);
    } catch (error) {
      console.error('Error queuing offline action:', error);
      const response = mobileApiService.createResponse(null, 'Failed to queue action');
      res.status(500).json(response);
    }
  });

  app.get('/api/mobile/config', async (req, res) => {
    try {
      const config = mobileApiService.getMobileConfig();
      const response = mobileApiService.createResponse(config);
      res.json(response);
    } catch (error) {
      console.error('Error getting mobile config:', error);
      const response = mobileApiService.createResponse(null, 'Failed to get config');
      res.status(500).json(response);
    }
  });

  // White-label & Multi-tenant API endpoints
  app.get('/api/tenants', requireAuth, async (req, res) => {
    try {
      // Only allow admins to view all tenants
      if (req.session.user!.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const tenants = await whiteLabelService.getTenants();
      res.json(tenants);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      res.status(500).json({ message: 'Failed to fetch tenants' });
    }
  });

  app.post('/api/tenants', requireAuth, async (req, res) => {
    try {
      if (req.session.user!.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const tenant = await whiteLabelService.createTenant(req.body);
      res.json(tenant);
    } catch (error) {
      console.error('Error creating tenant:', error);
      res.status(500).json({ message: error.message || 'Failed to create tenant' });
    }
  });

  app.get('/api/tenants/:id', requireAuth, async (req, res) => {
    try {
      const tenant = await whiteLabelService.getTenant(req.params.id);
      if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found' });
      }
      res.json(tenant);
    } catch (error) {
      console.error('Error fetching tenant:', error);
      res.status(500).json({ message: 'Failed to fetch tenant' });
    }
  });

  app.patch('/api/tenants/:id', requireAuth, async (req, res) => {
    try {
      if (req.session.user!.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const tenant = await whiteLabelService.updateTenant(req.params.id, req.body);
      res.json(tenant);
    } catch (error) {
      console.error('Error updating tenant:', error);
      res.status(500).json({ message: 'Failed to update tenant' });
    }
  });

  app.delete('/api/tenants/:id', requireAuth, async (req, res) => {
    try {
      if (req.session.user!.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      await whiteLabelService.deleteTenant(req.params.id);
      res.json({ message: 'Tenant deleted successfully' });
    } catch (error) {
      console.error('Error deleting tenant:', error);
      res.status(500).json({ message: 'Failed to delete tenant' });
    }
  });

  app.get('/api/tenants/:id/css', async (req, res) => {
    try {
      const tenant = await whiteLabelService.getTenant(req.params.id);
      if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found' });
      }
      
      const css = whiteLabelService.generateTenantCSS(tenant);
      res.setHeader('Content-Type', 'text/css');
      res.send(css);
    } catch (error) {
      console.error('Error generating tenant CSS:', error);
      res.status(500).json({ message: 'Failed to generate CSS' });
    }
  });

  app.get('/api/tenants/:id/usage', requireAuth, async (req, res) => {
    try {
      const period = req.query.period as string;
      const usage = await whiteLabelService.getTenantUsage(req.params.id, period);
      res.json(usage);
    } catch (error) {
      console.error('Error fetching tenant usage:', error);
      res.status(500).json({ message: 'Failed to fetch usage' });
    }
  });

  app.get('/api/tenants/:id/limits', requireAuth, async (req, res) => {
    try {
      const limits = await whiteLabelService.checkTenantLimits(req.params.id);
      res.json(limits);
    } catch (error) {
      console.error('Error checking tenant limits:', error);
      res.status(500).json({ message: 'Failed to check limits' });
    }
  });

  app.post('/api/tenants/:id/billing', requireAuth, async (req, res) => {
    try {
      if (req.session.user!.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const billing = await whiteLabelService.generateBilling(req.params.id, req.body.period);
      res.json(billing);
    } catch (error) {
      console.error('Error generating billing:', error);
      res.status(500).json({ message: 'Failed to generate billing' });
    }
  });

  app.get('/api/white-label/templates', async (req, res) => {
    try {
      const templates = whiteLabelService.getWhiteLabelTemplates();
      res.json(templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({ message: 'Failed to fetch templates' });
    }
  });

  app.get('/api/white-label/dashboard', requireAuth, async (req, res) => {
    try {
      if (req.session.user!.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const dashboard = await whiteLabelService.getTenantDashboard();
      res.json(dashboard);
    } catch (error) {
      console.error('Error fetching white-label dashboard:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard' });
    }
  });

  // Tenant resolution middleware for multi-tenant requests
  app.get('/api/tenant-info', async (req, res) => {
    try {
      const host = req.headers.host || '';
      const domain = host.split(':')[0]; // Remove port if present
      
      const tenant = await whiteLabelService.getTenantByDomain(domain);
      if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found' });
      }
      
      // Return public tenant info (no sensitive data)
      res.json({
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        branding: tenant.branding,
        settings: tenant.settings,
        plan: tenant.plan
      });
    } catch (error) {
      console.error('Error resolving tenant:', error);
      res.status(500).json({ message: 'Failed to resolve tenant' });
    }
  });

  // SSO & Authentication API endpoints
  app.get('/api/sso/providers', requireAuth, async (req, res) => {
    try {
      if (req.session.user!.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const providers = await ssoService.getProviders();
      res.json(providers);
    } catch (error) {
      console.error('Error fetching SSO providers:', error);
      res.status(500).json({ message: 'Failed to fetch SSO providers' });
    }
  });

  app.post('/api/sso/providers', requireAuth, async (req, res) => {
    try {
      if (req.session.user!.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const provider = await ssoService.registerProvider(req.body);
      res.json(provider);
    } catch (error) {
      console.error('Error creating SSO provider:', error);
      res.status(500).json({ message: error.message || 'Failed to create SSO provider' });
    }
  });

  app.patch('/api/sso/providers/:id', requireAuth, async (req, res) => {
    try {
      if (req.session.user!.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const provider = await ssoService.updateProvider(req.params.id, req.body);
      res.json(provider);
    } catch (error) {
      console.error('Error updating SSO provider:', error);
      res.status(500).json({ message: 'Failed to update SSO provider' });
    }
  });

  app.get('/api/sso/providers/active', async (req, res) => {
    try {
      const providers = await ssoService.getActiveProviders();
      // Return only public information for login page
      const publicProviders = providers.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        protocol: p.protocol
      }));
      res.json(publicProviders);
    } catch (error) {
      console.error('Error fetching active SSO providers:', error);
      res.status(500).json({ message: 'Failed to fetch active SSO providers' });
    }
  });

  app.get('/api/sso/templates', requireAuth, async (req, res) => {
    try {
      if (req.session.user!.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const templates = ssoService.getProviderTemplates();
      res.json(templates);
    } catch (error) {
      console.error('Error fetching SSO templates:', error);
      res.status(500).json({ message: 'Failed to fetch SSO templates' });
    }
  });

  app.get('/api/sso/statistics', requireAuth, async (req, res) => {
    try {
      if (req.session.user!.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const statistics = await ssoService.getStatistics();
      res.json(statistics);
    } catch (error) {
      console.error('Error fetching SSO statistics:', error);
      res.status(500).json({ message: 'Failed to fetch SSO statistics' });
    }
  });

  app.get('/api/sso/audit-logs', requireAuth, async (req, res) => {
    try {
      if (req.session.user!.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const filters = {
        event: req.query.event as any,
        providerId: req.query.providerId as string,
        userId: req.query.userId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string
      };
      
      const logs = await ssoService.getAuditLogs(filters);
      res.json(logs);
    } catch (error) {
      console.error('Error fetching SSO audit logs:', error);
      res.status(500).json({ message: 'Failed to fetch SSO audit logs' });
    }
  });

  // SSO Authentication routes
  app.get('/sso/:providerId/login', (req, res, next) => {
    const strategyName = `sso-${req.params.providerId}`;
    passport.authenticate(strategyName)(req, res, next);
  });

  app.post('/sso/:providerId/callback', (req, res, next) => {
    const strategyName = `sso-${req.params.providerId}`;
    passport.authenticate(strategyName, {
      successRedirect: '/',
      failureRedirect: '/login?error=sso_failed'
    })(req, res, next);
  });

  // SAML metadata endpoint
  app.get('/sso/saml/metadata', (req, res) => {
    try {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const metadata = ssoService.generateSAMLMetadata(baseUrl);
      res.set('Content-Type', 'application/xml');
      res.send(metadata);
    } catch (error) {
      console.error('Error generating SAML metadata:', error);
      res.status(500).json({ message: 'Failed to generate SAML metadata' });
    }
  });

  // Advanced Permissions API endpoints
  app.get('/api/permissions', requireAuth, async (req, res) => {
    try {
      const permissions = await permissionsService.getPermissions();
      res.json(permissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      res.status(500).json({ message: 'Failed to fetch permissions' });
    }
  });

  app.get('/api/permissions/by-category', requireAuth, async (req, res) => {
    try {
      const permissionsByCategory = await permissionsService.getPermissionsByCategory();
      res.json(permissionsByCategory);
    } catch (error) {
      console.error('Error fetching permissions by category:', error);
      res.status(500).json({ message: 'Failed to fetch permissions by category' });
    }
  });

  app.post('/api/permissions', requireAuth, requirePermission('permissions.manage'), async (req, res) => {
    try {
      const permission = await permissionsService.createPermission(req.body);
      res.json(permission);
    } catch (error) {
      console.error('Error creating permission:', error);
      res.status(500).json({ message: 'Failed to create permission' });
    }
  });

  app.get('/api/roles', requireAuth, async (req, res) => {
    try {
      const roles = await permissionsService.getRoles();
      res.json(roles);
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({ message: 'Failed to fetch roles' });
    }
  });

  app.post('/api/roles', requireAuth, requirePermission('permissions.manage'), async (req, res) => {
    try {
      const role = await permissionsService.createRole(req.body);
      res.json(role);
    } catch (error) {
      console.error('Error creating role:', error);
      res.status(500).json({ message: 'Failed to create role' });
    }
  });

  app.patch('/api/roles/:id', requireAuth, requirePermission('permissions.manage'), async (req, res) => {
    try {
      const role = await permissionsService.updateRole(req.params.id, req.body);
      res.json(role);
    } catch (error) {
      console.error('Error updating role:', error);
      res.status(500).json({ message: 'Failed to update role' });
    }
  });

  app.post('/api/users/:userId/roles/:roleId', requireAuth, requirePermission('users.update'), async (req, res) => {
    try {
      await permissionsService.assignRole(req.params.userId, req.params.roleId, req.session.user!.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error assigning role:', error);
      res.status(500).json({ message: 'Failed to assign role' });
    }
  });

  app.delete('/api/users/:userId/roles/:roleId', requireAuth, requirePermission('users.update'), async (req, res) => {
    try {
      await permissionsService.removeRole(req.params.userId, req.params.roleId, req.session.user!.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error removing role:', error);
      res.status(500).json({ message: 'Failed to remove role' });
    }
  });

  app.get('/api/users/:userId/permissions', requireAuth, async (req, res) => {
    try {
      const userPermissions = await permissionsService.getUserPermissions(req.params.userId);
      res.json(userPermissions);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      res.status(500).json({ message: 'Failed to fetch user permissions' });
    }
  });

  app.post('/api/permissions/check', requireAuth, async (req, res) => {
    try {
      const { permission, resource, context } = req.body;
      const hasPermission = await permissionsService.checkPermission({
        userId: req.session.user!.id,
        permission,
        resource,
        context
      });
      res.json({ hasPermission });
    } catch (error) {
      console.error('Error checking permission:', error);
      res.status(500).json({ message: 'Failed to check permission' });
    }
  });

  app.get('/api/permissions/statistics', requireAuth, requirePermission('admin.audit'), async (req, res) => {
    try {
      const statistics = await permissionsService.getStatistics();
      res.json(statistics);
    } catch (error) {
      console.error('Error fetching permission statistics:', error);
      res.status(500).json({ message: 'Failed to fetch permission statistics' });
    }
  });

  app.get('/api/permissions/audit-logs', requireAuth, requirePermission('admin.audit'), async (req, res) => {
    try {
      const filters = {
        action: req.query.action as string,
        userId: req.query.userId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string
      };
      
      const logs = await permissionsService.getAuditLogs(filters);
      res.json(logs);
    } catch (error) {
      console.error('Error fetching permission audit logs:', error);
      res.status(500).json({ message: 'Failed to fetch permission audit logs' });
    }
  });

  // Comprehensive Audit Logging API endpoints
  app.get('/api/audit/events', requireAuth, requirePermission('admin.audit'), async (req, res) => {
    try {
      const query = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        source: req.query.source ? [req.query.source as string] : undefined,
        category: req.query.category ? [req.query.category as string] : undefined,
        action: req.query.action ? [req.query.action as string] : undefined,
        outcome: req.query.outcome ? [req.query.outcome as string] : undefined,
        severity: req.query.severity ? [req.query.severity as string] : undefined,
        searchTerm: req.query.searchTerm as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any
      };
      
      const result = await auditService.queryEvents(query);
      res.json(result);
    } catch (error) {
      console.error('Error fetching audit events:', error);
      res.status(500).json({ message: 'Failed to fetch audit events' });
    }
  });

  app.get('/api/audit/statistics', requireAuth, requirePermission('admin.audit'), async (req, res) => {
    try {
      const period = req.query.startDate && req.query.endDate ? {
        start: req.query.startDate as string,
        end: req.query.endDate as string
      } : undefined;
      
      const statistics = await auditService.getStatistics(period);
      res.json(statistics);
    } catch (error) {
      console.error('Error fetching audit statistics:', error);
      res.status(500).json({ message: 'Failed to fetch audit statistics' });
    }
  });

  app.post('/api/audit/export', requireAuth, requirePermission('data.export'), async (req, res) => {
    try {
      const query = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        source: req.query.source ? [req.query.source as string] : undefined,
        category: req.query.category ? [req.query.category as string] : undefined,
        outcome: req.query.outcome ? [req.query.outcome as string] : undefined,
        severity: req.query.severity ? [req.query.severity as string] : undefined,
        searchTerm: req.query.searchTerm as string,
        limit: 10000 // Large limit for export
      };
      
      const format = req.query.format as 'json' | 'csv' | 'pdf';
      const includePersonalData = req.query.includePersonalData === 'true';
      
      const exportData = await auditService.exportAuditData(query, format, includePersonalData);
      res.json(exportData);
    } catch (error) {
      console.error('Error exporting audit data:', error);
      res.status(500).json({ message: 'Failed to export audit data' });
    }
  });

  app.get('/api/audit/compliance-reports', requireAuth, requirePermission('admin.audit'), async (req, res) => {
    try {
      const reports = await auditService.getComplianceReports();
      res.json(reports);
    } catch (error) {
      console.error('Error fetching compliance reports:', error);
      res.status(500).json({ message: 'Failed to fetch compliance reports' });
    }
  });

  app.post('/api/audit/compliance-reports', requireAuth, requirePermission('admin.audit'), async (req, res) => {
    try {
      const { regulation, startDate, endDate } = req.body;
      const report = await auditService.generateComplianceReport(
        regulation,
        startDate,
        endDate,
        req.session.user!.id
      );
      res.json(report);
    } catch (error) {
      console.error('Error generating compliance report:', error);
      res.status(500).json({ message: 'Failed to generate compliance report' });
    }
  });

  app.get('/api/audit/retention-policies', requireAuth, requirePermission('admin.audit'), async (req, res) => {
    try {
      const policies = await auditService.getRetentionPolicies();
      res.json(policies);
    } catch (error) {
      console.error('Error fetching retention policies:', error);
      res.status(500).json({ message: 'Failed to fetch retention policies' });
    }
  });

  app.post('/api/audit/retention-policies', requireAuth, requirePermission('admin.audit'), async (req, res) => {
    try {
      const policy = await auditService.createRetentionPolicy(req.body);
      res.json(policy);
    } catch (error) {
      console.error('Error creating retention policy:', error);
      res.status(500).json({ message: 'Failed to create retention policy' });
    }
  });

  // Data Encryption API endpoints
  app.get('/api/encryption/keys', requireAuth, requirePermission('admin.security'), async (req, res) => {
    try {
      const keys = await encryptionService.getKeys();
      res.json(keys);
    } catch (error) {
      console.error('Error fetching encryption keys:', error);
      res.status(500).json({ message: 'Failed to fetch encryption keys' });
    }
  });

  app.post('/api/encryption/keys', requireAuth, requirePermission('admin.security'), async (req, res) => {
    try {
      const { purpose, algorithm, complianceLevel } = req.body;
      const key = await encryptionService.generateKey(
        purpose,
        algorithm,
        req.session.user!.id,
        complianceLevel
      );
      res.json(key);
    } catch (error) {
      console.error('Error generating encryption key:', error);
      res.status(500).json({ message: 'Failed to generate encryption key' });
    }
  });

  app.post('/api/encryption/keys/:keyId/rotate', requireAuth, requirePermission('admin.security'), async (req, res) => {
    try {
      const rotatedKey = await encryptionService.rotateKey(req.params.keyId, req.session.user!.id);
      res.json(rotatedKey);
    } catch (error) {
      console.error('Error rotating encryption key:', error);
      res.status(500).json({ message: 'Failed to rotate encryption key' });
    }
  });

  app.get('/api/encryption/policies', requireAuth, requirePermission('admin.security'), async (req, res) => {
    try {
      const policies = await encryptionService.getPolicies();
      res.json(policies);
    } catch (error) {
      console.error('Error fetching encryption policies:', error);
      res.status(500).json({ message: 'Failed to fetch encryption policies' });
    }
  });

  app.post('/api/encryption/policies', requireAuth, requirePermission('admin.security'), async (req, res) => {
    try {
      const policy = await encryptionService.createPolicy(req.body);
      res.json(policy);
    } catch (error) {
      console.error('Error creating encryption policy:', error);
      res.status(500).json({ message: 'Failed to create encryption policy' });
    }
  });

  app.get('/api/encryption/statistics', requireAuth, requirePermission('admin.security'), async (req, res) => {
    try {
      const statistics = await encryptionService.getStatistics();
      res.json(statistics);
    } catch (error) {
      console.error('Error fetching encryption statistics:', error);
      res.status(500).json({ message: 'Failed to fetch encryption statistics' });
    }
  });

  app.post('/api/encryption/encrypt', requireAuth, requirePermission('data.export'), async (req, res) => {
    try {
      const { data, purpose, dataType } = req.body;
      const encrypted = await encryptionService.encryptData(data, purpose, dataType, req.session.user!.id);
      res.json(encrypted);
    } catch (error) {
      console.error('Error encrypting data:', error);
      res.status(500).json({ message: 'Failed to encrypt data' });
    }
  });

  app.post('/api/encryption/decrypt', requireAuth, requirePermission('data.export'), async (req, res) => {
    try {
      const { encryptedData } = req.body;
      const decrypted = await encryptionService.decryptData(encryptedData, req.session.user!.id);
      res.json({ data: decrypted });
    } catch (error) {
      console.error('Error decrypting data:', error);
      res.status(500).json({ message: 'Failed to decrypt data' });
    }
  });

  // Backup & Recovery API endpoints
  app.get('/api/backup/configurations', requireAuth, requirePermission('admin.backup'), async (req, res) => {
    try {
      const configurations = await backupService.getConfigurations();
      res.json(configurations);
    } catch (error) {
      console.error('Error fetching backup configurations:', error);
      res.status(500).json({ message: 'Failed to fetch backup configurations' });
    }
  });

  app.get('/api/backup/records', requireAuth, requirePermission('admin.backup'), async (req, res) => {
    try {
      const backups = await backupService.getBackups();
      res.json(backups);
    } catch (error) {
      console.error('Error fetching backup records:', error);
      res.status(500).json({ message: 'Failed to fetch backup records' });
    }
  });

  app.post('/api/backup/create', requireAuth, requirePermission('admin.backup'), async (req, res) => {
    try {
      const { configId } = req.body;
      const backup = await backupService.performBackup(configId || 'default', req.session.user!.id);
      res.json(backup);
    } catch (error) {
      console.error('Error creating backup:', error);
      res.status(500).json({ message: 'Failed to create backup' });
    }
  });

  app.get('/api/backup/statistics', requireAuth, requirePermission('admin.backup'), async (req, res) => {
    try {
      const statistics = await backupService.getStatistics();
      res.json(statistics);
    } catch (error) {
      console.error('Error fetching backup statistics:', error);
      res.status(500).json({ message: 'Failed to fetch backup statistics' });
    }
  });

  // Route aliases for backward compatibility - backup routes
  app.get('/api/backup/list', requireAuth, requirePermission('admin.backup'), async (req, res) => {
    try {
      const backups = await backupService.getBackups();
      res.json(backups);
    } catch (error) {
      console.error('Error fetching backup records:', error);
      res.status(500).json({ message: 'Failed to fetch backup records' });
    }
  });

  // Multi-language Support API endpoints
  app.get('/api/i18n/languages', requireAuth, async (req, res) => {
    try {
      const languages = await i18nService.getLanguages();
      res.json(languages);
    } catch (error) {
      console.error('Error fetching languages:', error);
      res.status(500).json({ message: 'Failed to fetch languages' });
    }
  });

  app.post('/api/i18n/languages', requireAuth, requirePermission('admin.settings'), async (req, res) => {
    try {
      const language = await i18nService.addLanguage(req.body);
      res.json(language);
    } catch (error) {
      console.error('Error adding language:', error);
      res.status(500).json({ message: 'Failed to add language' });
    }
  });

  app.get('/api/i18n/translations/:language', requireAuth, async (req, res) => {
    try {
      const { language } = req.params;
      const { namespace } = req.query;
      
      let translations;
      if (namespace) {
        translations = await i18nService.getNamespaceTranslations(namespace as string, language);
      } else {
        const allKeys = Array.from((await i18nService.getStatistics()).totalKeys || []);
        translations = await i18nService.getTranslations(allKeys, language);
      }
      
      res.json(translations);
    } catch (error) {
      console.error('Error fetching translations:', error);
      res.status(500).json({ message: 'Failed to fetch translations' });
    }
  });

  app.post('/api/i18n/translations', requireAuth, requirePermission('admin.settings'), async (req, res) => {
    try {
      const { key, language, value, pluralForms } = req.body;
      const translation = await i18nService.setTranslation(
        key,
        language,
        value,
        req.session.user!.id,
        pluralForms
      );
      res.json(translation);
    } catch (error) {
      console.error('Error setting translation:', error);
      res.status(500).json({ message: 'Failed to set translation' });
    }
  });

  app.get('/api/i18n/statistics', requireAuth, requirePermission('admin.settings'), async (req, res) => {
    try {
      const statistics = await i18nService.getStatistics();
      res.json(statistics);
    } catch (error) {
      console.error('Error fetching i18n statistics:', error);
      res.status(500).json({ message: 'Failed to fetch i18n statistics' });
    }
  });

  app.get('/api/i18n/export/:language', requireAuth, requirePermission('data.export'), async (req, res) => {
    try {
      const { language } = req.params;
      const { format = 'json' } = req.query;
      
      const exportData = await i18nService.exportTranslations(language, format as 'json' | 'csv');
      
      const contentType = format === 'csv' ? 'text/csv' : 'application/json';
      const filename = `translations_${language}.${format}`;
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(exportData);
    } catch (error) {
      console.error('Error exporting translations:', error);
      res.status(500).json({ message: 'Failed to export translations' });
    }
  });

  // Smart Scheduling API endpoints
  app.post('/api/smart-scheduling/generate', requireAuth, async (req, res) => {
    try {
      const { tasks, context } = req.body;
      const result = await smartSchedulingService.generateOptimalSchedule(
        tasks,
        context,
        req.session.user!.id
      );
      res.json(result);
    } catch (error) {
      console.error('Error generating smart schedule:', error);
      res.status(500).json({ message: 'Failed to generate smart schedule' });
    }
  });

  app.get('/api/smart-scheduling/workload-predictions', requireAuth, async (req, res) => {
    try {
      const { userIds } = req.query;
      const userIdArray = userIds ? (userIds as string).split(',') : undefined;
      const predictions = await smartSchedulingService.getWorkloadPredictions(userIdArray);
      res.json(predictions);
    } catch (error) {
      console.error('Error fetching workload predictions:', error);
      res.status(500).json({ message: 'Failed to fetch workload predictions' });
    }
  });

  app.get('/api/smart-scheduling/recommendations', requireAuth, async (req, res) => {
    try {
      const { projectId, userId } = req.query;
      const recommendations = await smartSchedulingService.getSchedulingRecommendations(
        projectId as string,
        userId as string
      );
      res.json(recommendations);
    } catch (error) {
      console.error('Error fetching scheduling recommendations:', error);
      res.status(500).json({ message: 'Failed to fetch scheduling recommendations' });
    }
  });

  app.post('/api/smart-scheduling/recommendations/:id/apply', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await smartSchedulingService.applyRecommendation(id, req.session.user!.id);
      res.json(result);
    } catch (error) {
      console.error('Error applying recommendation:', error);
      res.status(500).json({ message: 'Failed to apply recommendation' });
    }
  });

  app.get('/api/smart-scheduling/statistics', requireAuth, async (req, res) => {
    try {
      const statistics = await smartSchedulingService.getSchedulingStatistics();
      res.json(statistics);
    } catch (error) {
      console.error('Error fetching scheduling statistics:', error);
      res.status(500).json({ message: 'Failed to fetch scheduling statistics' });
    }
  });

  // Predictive Analytics API endpoints
  app.post('/api/predictive-analytics/generate-predictions', requireAuth, async (req, res) => {
    try {
      const { projectIds } = req.body;
      const predictions = await predictiveAnalyticsService.generateProjectPredictions(projectIds);
      res.json(predictions);
    } catch (error) {
      console.error('Error generating predictions:', error);
      res.status(500).json({ message: 'Failed to generate predictions' });
    }
  });

  app.get('/api/predictive-analytics/project-predictions', requireAuth, async (req, res) => {
    try {
      const { projectIds } = req.query;
      const projectIdArray = projectIds ? (projectIds as string).split(',') : undefined;
      const predictions = await predictiveAnalyticsService.generateProjectPredictions(projectIdArray);
      res.json(predictions);
    } catch (error) {
      console.error('Error fetching project predictions:', error);
      res.status(500).json({ message: 'Failed to fetch project predictions' });
    }
  });

  app.get('/api/predictive-analytics/project-risks/:projectId', requireAuth, async (req, res) => {
    try {
      const { projectId } = req.params;
      const risks = await predictiveAnalyticsService.assessProjectRisks(projectId);
      res.json(risks);
    } catch (error) {
      console.error('Error assessing project risks:', error);
      res.status(500).json({ message: 'Failed to assess project risks' });
    }
  });

  app.get('/api/predictive-analytics/team-performance', requireAuth, async (req, res) => {
    try {
      const { userIds, period = 'month' } = req.query;
      const userIdArray = userIds ? (userIds as string).split(',') : undefined;
      const performance = await predictiveAnalyticsService.analyzeTeamPerformance(
        userIdArray,
        period as 'week' | 'month' | 'quarter'
      );
      res.json(performance);
    } catch (error) {
      console.error('Error analyzing team performance:', error);
      res.status(500).json({ message: 'Failed to analyze team performance' });
    }
  });

  app.get('/api/predictive-analytics/market-intelligence', requireAuth, async (req, res) => {
    try {
      const { industry } = req.query;
      const intelligence = await predictiveAnalyticsService.generateMarketIntelligence(industry as string);
      res.json(intelligence);
    } catch (error) {
      console.error('Error generating market intelligence:', error);
      res.status(500).json({ message: 'Failed to generate market intelligence' });
    }
  });

  app.post('/api/predictive-analytics/generate-report', requireAuth, async (req, res) => {
    try {
      const { type, parameters } = req.body;
      const report = await predictiveAnalyticsService.createPredictiveReport(type, parameters);
      res.json(report);
    } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).json({ message: 'Failed to generate report' });
    }
  });

  app.get('/api/predictive-analytics/reports', requireAuth, async (req, res) => {
    try {
      const { type } = req.query;
      const reports = predictiveAnalyticsService.getReports(type as string);
      res.json(reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      res.status(500).json({ message: 'Failed to fetch reports' });
    }
  });

  app.get('/api/predictive-analytics/statistics', requireAuth, async (req, res) => {
    try {
      const statistics = await predictiveAnalyticsService.getAnalyticsStatistics();
      res.json(statistics);
    } catch (error) {
      console.error('Error fetching analytics statistics:', error);
      res.status(500).json({ message: 'Failed to fetch analytics statistics' });
    }
  });

  // Performance & Monitoring API endpoints
  app.get('/api/performance/metrics', requireAuth, requirePermission('system.monitor'), (req, res) => {
    try {
      const metrics = performanceMonitor.getCurrentMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      res.status(500).json({ message: 'Failed to fetch performance metrics' });
    }
  });

  app.get('/api/performance/metrics/history', requireAuth, requirePermission('system.monitor'), (req, res) => {
    try {
      const { minutes = 60 } = req.query;
      const metrics = performanceMonitor.getHistoricalMetrics(Number(minutes));
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching historical metrics:', error);
      res.status(500).json({ message: 'Failed to fetch historical metrics' });
    }
  });

  app.get('/api/performance/alerts', requireAuth, requirePermission('system.monitor'), (req, res) => {
    try {
      const { active = true } = req.query;
      const alerts = active === 'true' ? 
        performanceMonitor.getActiveAlerts() : 
        performanceMonitor.getAllAlerts();
      res.json(alerts);
    } catch (error) {
      console.error('Error fetching performance alerts:', error);
      res.status(500).json({ message: 'Failed to fetch performance alerts' });
    }
  });

  app.post('/api/performance/alerts/:id/resolve', requireAuth, requirePermission('system.admin'), (req, res) => {
    try {
      const { id } = req.params;
      const resolved = performanceMonitor.resolveAlert(id);
      
      if (resolved) {
        res.json({ message: 'Alert resolved successfully' });
      } else {
        res.status(404).json({ message: 'Alert not found or already resolved' });
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
      res.status(500).json({ message: 'Failed to resolve alert' });
    }
  });

  app.get('/api/performance/summary', requireAuth, requirePermission('system.monitor'), (req, res) => {
    try {
      const summary = performanceMonitor.getPerformanceSummary();
      res.json(summary);
    } catch (error) {
      console.error('Error fetching performance summary:', error);
      res.status(500).json({ message: 'Failed to fetch performance summary' });
    }
  });

  app.get('/api/performance/export', requireAuth, requirePermission('data.export'), (req, res) => {
    try {
      const { format = 'json' } = req.query;
      const metrics = performanceMonitor.exportMetrics(format as 'json' | 'prometheus');
      
      const contentType = format === 'prometheus' ? 'text/plain' : 'application/json';
      const filename = `performance-metrics.${format === 'prometheus' ? 'txt' : 'json'}`;
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(metrics);
    } catch (error) {
      console.error('Error exporting performance metrics:', error);
      res.status(500).json({ message: 'Failed to export performance metrics' });
    }
  });

  // Cache Management API endpoints
  app.get('/api/cache/stats', requireAuth, requirePermission('system.monitor'), (req, res) => {
    try {
      const stats = AppCache.getInstance().getStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching cache stats:', error);
      res.status(500).json({ message: 'Failed to fetch cache stats' });
    }
  });

  app.post('/api/cache/flush', requireAuth, requirePermission('system.admin'), async (req, res) => {
    try {
      await AppCache.getInstance().flush();
      res.json({ message: 'Cache flushed successfully' });
    } catch (error) {
      console.error('Error flushing cache:', error);
      res.status(500).json({ message: 'Failed to flush cache' });
    }
  });

  app.post('/api/cache/invalidate', requireAuth, requirePermission('system.admin'), async (req, res) => {
    try {
      const { pattern, tags } = req.body;
      
      let invalidated = 0;
      if (pattern) {
        invalidated = await AppCache.getInstance().delPattern(pattern);
      } else if (tags && Array.isArray(tags)) {
        invalidated = await AppCache.getInstance().delByTags(tags);
      }
      
      res.json({ message: `${invalidated} cache entries invalidated` });
    } catch (error) {
      console.error('Error invalidating cache:', error);
      res.status(500).json({ message: 'Failed to invalidate cache' });
    }
  });

  app.get('/api/cache/keys', requireAuth, requirePermission('system.monitor'), (req, res) => {
    try {
      const { pattern = '*' } = req.query;
      const keys = AppCache.getInstance().keys(pattern as string);
      res.json({ keys: keys.slice(0, 100), total: keys.length }); // Limit to 100 for UI
    } catch (error) {
      console.error('Error fetching cache keys:', error);
      res.status(500).json({ message: 'Failed to fetch cache keys' });
    }
  });

  // CDN Management API endpoints
  app.get('/api/cdn/config', requireAuth, requirePermission('system.monitor'), (req, res) => {
    try {
      const config = cdnService.getConfig();
      res.json(config);
    } catch (error) {
      console.error('Error fetching CDN config:', error);
      res.status(500).json({ message: 'Failed to fetch CDN config' });
    }
  });

  app.put('/api/cdn/config', requireAuth, requirePermission('system.admin'), async (req, res) => {
    try {
      await cdnService.updateConfig(req.body);
      res.json({ message: 'CDN configuration updated successfully' });
    } catch (error) {
      console.error('Error updating CDN config:', error);
      res.status(500).json({ message: 'Failed to update CDN config' });
    }
  });

  app.get('/api/cdn/metrics', requireAuth, requirePermission('system.monitor'), (req, res) => {
    try {
      const metrics = cdnService.getCurrentMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching CDN metrics:', error);
      res.status(500).json({ message: 'Failed to fetch CDN metrics' });
    }
  });

  app.post('/api/cdn/purge', requireAuth, requirePermission('system.admin'), async (req, res) => {
    try {
      const { urls } = req.body;
      const result = await cdnService.purgeCache(urls);
      res.json(result);
    } catch (error) {
      console.error('Error purging CDN cache:', error);
      res.status(500).json({ message: 'Failed to purge CDN cache' });
    }
  });

  app.get('/api/cdn/edge-locations', requireAuth, requirePermission('system.monitor'), async (req, res) => {
    try {
      const locations = await cdnService.getEdgeLocationPerformance();
      res.json(locations);
    } catch (error) {
      console.error('Error fetching edge locations:', error);
      res.status(500).json({ message: 'Failed to fetch edge locations' });
    }
  });

  app.get('/api/cdn/recommendations', requireAuth, requirePermission('system.monitor'), async (req, res) => {
    try {
      const recommendations = await cdnService.getPerformanceRecommendations();
      res.json(recommendations);
    } catch (error) {
      console.error('Error fetching CDN recommendations:', error);
      res.status(500).json({ message: 'Failed to fetch CDN recommendations' });
    }
  });

  app.get('/api/cdn/cost-analysis', requireAuth, requirePermission('system.monitor'), async (req, res) => {
    try {
      const analysis = await cdnService.getBandwidthCostAnalysis();
      res.json(analysis);
    } catch (error) {
      console.error('Error fetching cost analysis:', error);
      res.status(500).json({ message: 'Failed to fetch cost analysis' });
    }
  });

  // Database Optimization API endpoints
  app.get('/api/database/metrics', requireAuth, requirePermission('system.monitor'), async (req, res) => {
    try {
      const metrics = await databaseOptimizer.getDatabaseStatistics();
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching database metrics:', error);
      res.status(500).json({ message: 'Failed to fetch database metrics' });
    }
  });

  app.post('/api/database/optimize', requireAuth, requirePermission('system.admin'), async (req, res) => {
    try {
      const report = await databaseOptimizer.generateOptimizationReport();
      res.json(report);
    } catch (error) {
      console.error('Error generating optimization report:', error);
      res.status(500).json({ message: 'Failed to generate optimization report' });
    }
  });

  app.post('/api/database/auto-optimize', requireAuth, requirePermission('system.admin'), async (req, res) => {
    try {
      const result = await databaseOptimizer.applyAutomaticOptimizations();
      res.json(result);
    } catch (error) {
      console.error('Error applying automatic optimizations:', error);
      res.status(500).json({ message: 'Failed to apply automatic optimizations' });
    }
  });

  app.post('/api/database/create-indexes', requireAuth, requirePermission('system.admin'), async (req, res) => {
    try {
      const { recommendations } = req.body;
      const result = await databaseOptimizer.createRecommendedIndexes(recommendations);
      res.json(result);
    } catch (error) {
      console.error('Error creating indexes:', error);
      res.status(500).json({ message: 'Failed to create indexes' });
    }
  });

  app.post('/api/database/analyze-query', requireAuth, requirePermission('system.monitor'), async (req, res) => {
    try {
      const { query } = req.body;
      const analysis = await databaseOptimizer.analyzeQuery(query);
      res.json(analysis);
    } catch (error) {
      console.error('Error analyzing query:', error);
      res.status(500).json({ message: 'Failed to analyze query' });
    }
  });

  app.post('/api/database/maintenance', requireAuth, requirePermission('system.admin'), async (req, res) => {
    try {
      const { tables } = req.body;
      const result = await databaseOptimizer.performMaintenance(tables);
      res.json(result);
    } catch (error) {
      console.error('Error performing database maintenance:', error);
      res.status(500).json({ message: 'Failed to perform database maintenance' });
    }
  });

  app.get('/api/database/unused-indexes', requireAuth, requirePermission('system.monitor'), async (req, res) => {
    try {
      const unusedIndexes = await databaseOptimizer.findUnusedIndexes();
      res.json(unusedIndexes);
    } catch (error) {
      console.error('Error finding unused indexes:', error);
      res.status(500).json({ message: 'Failed to find unused indexes' });
    }
  });

  // Load Balancing API endpoints
  app.get('/api/load-balancer/servers', requireAuth, requirePermission('system.monitor'), (req, res) => {
    try {
      const servers = loadBalancer.getServers();
      res.json(servers);
    } catch (error) {
      console.error('Error fetching server instances:', error);
      res.status(500).json({ message: 'Failed to fetch server instances' });
    }
  });

  app.post('/api/load-balancer/servers', requireAuth, requirePermission('system.admin'), (req, res) => {
    try {
      const serverId = loadBalancer.addServer(req.body);
      res.json({ message: 'Server added successfully', serverId });
    } catch (error) {
      console.error('Error adding server:', error);
      res.status(500).json({ message: 'Failed to add server' });
    }
  });

  app.delete('/api/load-balancer/servers/:id', requireAuth, requirePermission('system.admin'), (req, res) => {
    try {
      const { id } = req.params;
      const removed = loadBalancer.removeServer(id);
      
      if (removed) {
        res.json({ message: 'Server removed successfully' });
      } else {
        res.status(404).json({ message: 'Server not found' });
      }
    } catch (error) {
      console.error('Error removing server:', error);
      res.status(500).json({ message: 'Failed to remove server' });
    }
  });

  app.get('/api/load-balancer/metrics', requireAuth, requirePermission('system.monitor'), (req, res) => {
    try {
      const metrics = loadBalancer.getMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching load balancer metrics:', error);
      res.status(500).json({ message: 'Failed to fetch load balancer metrics' });
    }
  });

  app.get('/api/load-balancer/config', requireAuth, requirePermission('system.monitor'), (req, res) => {
    try {
      const config = loadBalancer.getConfig();
      res.json(config);
    } catch (error) {
      console.error('Error fetching load balancer config:', error);
      res.status(500).json({ message: 'Failed to fetch load balancer config' });
    }
  });

  app.put('/api/load-balancer/config', requireAuth, requirePermission('system.admin'), (req, res) => {
    try {
      loadBalancer.updateConfig(req.body);
      res.json({ message: 'Load balancer configuration updated successfully' });
    } catch (error) {
      console.error('Error updating load balancer config:', error);
      res.status(500).json({ message: 'Failed to update load balancer config' });
    }
  });

  app.post('/api/load-balancer/scale-up', requireAuth, requirePermission('system.admin'), async (req, res) => {
    try {
      const newServerIds = await loadBalancer.scaleUp();
      res.json({ message: 'Scale up completed', newServerIds, count: newServerIds.length });
    } catch (error) {
      console.error('Error scaling up:', error);
      res.status(500).json({ message: 'Failed to scale up' });
    }
  });

  app.post('/api/load-balancer/scale-down', requireAuth, requirePermission('system.admin'), async (req, res) => {
    try {
      const removedServerIds = await loadBalancer.scaleDown();
      res.json({ message: 'Scale down completed', removedServerIds, count: removedServerIds.length });
    } catch (error) {
      console.error('Error scaling down:', error);
      res.status(500).json({ message: 'Failed to scale down' });
    }
  });

  app.post('/api/load-balancer/servers/:id/drain', requireAuth, requirePermission('system.admin'), (req, res) => {
    try {
      const { id } = req.params;
      loadBalancer.drainServer(id);
      res.json({ message: 'Server draining initiated' });
    } catch (error) {
      console.error('Error draining server:', error);
      res.status(500).json({ message: 'Failed to drain server' });
    }
  });

  // Register backup and recovery routes
  app.use('/api', backupRoutes);

  // =================== EMAIL MANAGEMENT ENDPOINTS ===================
  
  app.get("/api/emails/inbound", requireAuth, async (req, res) => {
    try {
      // Mock data for now - in production this would come from database
      const mockEmails = [
        {
          id: 'email_1',
          fromEmail: 'support@client.com',
          toEmail: 'messages@gigstergarage.app',
          subject: 'Support Request: Login Issues',
          content: 'I am having trouble logging into my account. Can you please help me reset my password?',
          attachments: [],
          parsedAt: new Date().toISOString(),
          status: 'processed',
          routingRule: 'Support Team',
          assignedUser: 'Support Agent',
          messageId: 'msg_123'
        },
        {
          id: 'email_2',
          fromEmail: 'info@business.com',
          toEmail: 'messages@gigstergarage.app',
          subject: 'Project Inquiry',
          content: 'We are interested in your services for a new project. Please contact us to discuss further.',
          attachments: [],
          parsedAt: new Date(Date.now() - 3600000).toISOString(),
          status: 'processed',
          routingRule: 'Sales Team',
          assignedUser: 'Sales Rep',
          messageId: 'msg_124'
        }
      ];
      res.json(mockEmails);
    } catch (error) {
      console.error("Error fetching inbound emails:", error);
      res.status(500).json({ error: "Failed to fetch inbound emails" });
    }
  });

  app.get("/api/emails/routing-rules", requireAuth, async (req, res) => {
    try {
      // Mock routing rules data
      const mockRules = [
        {
          id: 'rule_1',
          name: 'Support Requests',
          description: 'Route support emails to support team',
          conditions: {
            subject: 'support, help, issue, bug'
          },
          actions: {
            assignToUser: 'support_agent_id',
            priority: 'high',
            autoReply: true,
            autoReplyTemplate: 'Thank you for contacting support. We will respond within 24 hours.',
            createTask: true
          },
          isActive: true,
          matchCount: 15,
          createdAt: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'rule_2',
          name: 'Sales Inquiries',
          description: 'Route sales emails to sales team',
          conditions: {
            subject: 'inquiry, quote, project, proposal'
          },
          actions: {
            assignToUser: 'sales_rep_id',
            priority: 'medium',
            autoReply: false,
            createTask: true
          },
          isActive: true,
          matchCount: 8,
          createdAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      res.json(mockRules);
    } catch (error) {
      console.error("Error fetching routing rules:", error);
      res.status(500).json({ error: "Failed to fetch routing rules" });
    }
  });

  app.post("/api/emails/routing-rules", requireAuth, async (req, res) => {
    try {
      const ruleData = req.body;
      // Mock creating rule - in production this would save to database
      const newRule = {
        id: 'rule_' + Date.now(),
        ...ruleData,
        matchCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      console.log('📧 Created email routing rule:', newRule.name);
      res.json(newRule);
    } catch (error) {
      console.error("Error creating routing rule:", error);
      res.status(500).json({ error: "Failed to create routing rule" });
    }
  });

  app.post("/api/emails/test-parser", requireAuth, async (req, res) => {
    try {
      const { fromEmail, subject, content } = req.body;
      
      // Use existing parseInboundEmail function for testing
      const formData = `from=${encodeURIComponent(fromEmail)}&subject=${encodeURIComponent(subject)}&text=${encodeURIComponent(content)}`;
      const parsedData = parseInboundEmail(formData);
      
      console.log('📧 Email parser test successful:', parsedData);
      res.json(parsedData);
    } catch (error) {
      console.error("Error testing email parser:", error);
      res.status(500).json({ error: "Failed to test email parser" });
    }
  });

  // =================== SLACK INTEGRATION ENDPOINTS ===================
  
  app.get("/api/slack/integrations", requireAuth, async (req, res) => {
    try {
      // Get integrations from webhook service
      const integrations = await webhookService.getIntegrations();
      const slackIntegrations = integrations.filter(i => i.type === 'slack').map(integration => ({
        id: integration.id,
        name: integration.name,
        workspaceName: integration.config.teamId || 'Unknown Workspace',
        webhookUrl: integration.config.webhookUrl,
        channels: [
          { id: 'general', name: 'general', isPrivate: false },
          { id: 'notifications', name: 'notifications', isPrivate: false },
          { id: 'alerts', name: 'alerts', isPrivate: false }
        ],
        defaultChannel: integration.config.channelId || '#general',
        botToken: integration.config.botToken,
        isActive: integration.active,
        eventMappings: integration.eventMappings.map(mapping => ({
          event: mapping.event,
          channel: integration.config.channelId || '#general',
          template: mapping.template,
          enabled: mapping.enabled,
          priority: 'medium'
        })),
        statistics: {
          totalSent: Math.floor(Math.random() * 100),
          successRate: 95 + Math.random() * 5,
          lastSent: new Date().toISOString()
        },
        createdAt: integration.createdAt.toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      res.json(slackIntegrations);
    } catch (error) {
      console.error("Error fetching Slack integrations:", error);
      res.status(500).json({ error: "Failed to fetch Slack integrations" });
    }
  });

  app.post("/api/slack/integrations", requireAuth, async (req, res) => {
    try {
      const { name, workspaceName, webhookUrl, defaultChannel, botToken, eventMappings } = req.body;
      
      const integration = await webhookService.createIntegration({
        type: 'slack',
        name,
        config: {
          webhookUrl,
          channelId: defaultChannel,
          teamId: workspaceName,
          botToken
        },
        eventMappings: eventMappings || [],
        active: true,
        createdBy: req.user?.id || 'system'
      });

      console.log('📱 Created Slack integration:', name);
      res.json(integration);
    } catch (error) {
      console.error("Error creating Slack integration:", error);
      res.status(500).json({ error: "Failed to create Slack integration" });
    }
  });

  app.patch("/api/slack/integrations/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Mock update - in production this would use webhookService.updateIntegration
      console.log(`📱 Updated Slack integration ${id}:`, updates);
      res.json({ id, ...updates, updatedAt: new Date().toISOString() });
    } catch (error) {
      console.error("Error updating Slack integration:", error);
      res.status(500).json({ error: "Failed to update Slack integration" });
    }
  });

  app.post("/api/slack/integrations/:id/test", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { event, channel, template, data } = req.body;
      
      console.log(`📱 Testing Slack integration ${id} - Event: ${event}, Channel: ${channel}`);
      
      // Mock test notification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      res.json({ 
        success: true, 
        message: 'Test notification sent successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error testing Slack integration:", error);
      res.status(500).json({ error: "Failed to test Slack integration" });
    }
  });

  app.post("/api/slack/validate-webhook", requireAuth, async (req, res) => {
    try {
      const { webhookUrl } = req.body;
      
      if (!webhookUrl || !webhookUrl.startsWith('https://hooks.slack.com/')) {
        return res.status(400).json({ error: "Invalid Slack webhook URL" });
      }

      // Mock validation test
      console.log('📱 Validating Slack webhook:', webhookUrl);
      
      res.json({
        valid: true,
        workspaceName: 'Test Workspace',
        channel: '#general'
      });
    } catch (error) {
      console.error("Error validating Slack webhook:", error);
      res.status(500).json({ error: "Failed to validate Slack webhook" });
    }
  });

  app.get("/api/slack/notifications", requireAuth, async (req, res) => {
    try {
      // Mock notifications data
      const mockNotifications = [
        {
          id: 'notif_1',
          integrationId: 'integration_1',
          channel: '#general',
          event: 'task.created',
          message: '📝 New task created: Fix login bug assigned to John Doe',
          status: 'sent',
          attempts: 1,
          sentAt: new Date().toISOString(),
          metadata: { taskId: 'task_123', priority: 'high' }
        },
        {
          id: 'notif_2',
          integrationId: 'integration_1',
          channel: '#notifications',
          event: 'project.updated',
          message: '🚀 Project updated: Website Redesign milestone reached',
          status: 'sent',
          attempts: 1,
          sentAt: new Date(Date.now() - 1800000).toISOString(),
          metadata: { projectId: 'project_456' }
        }
      ];
      
      res.json(mockNotifications);
    } catch (error) {
      console.error("Error fetching Slack notifications:", error);
      res.status(500).json({ error: "Failed to fetch Slack notifications" });
    }
  });

  app.get("/api/slack/statistics", requireAuth, async (req, res) => {
    try {
      const mockStats = {
        totalSent: 147,
        successRate: 97.3,
        failedToday: 2,
        activeIntegrations: 1
      };
      
      res.json(mockStats);
    } catch (error) {
      console.error("Error fetching Slack statistics:", error);
      res.status(500).json({ error: "Failed to fetch Slack statistics" });
    }
  });

  // =================== START BACKGROUND SERVICES ===================
  
  // Start automated business logic services
  console.log("🚀 Starting background services...");
  invoiceStatusService.startStatusMonitoring();
  automatedInvoicingService.startAutomatedInvoicing();
  smartNotificationsService.startSmartNotifications();
  contractManagementService.startContractMonitoring();
  
  // Initialize demo session service
  demoSessionService.initializeDemoSessionService();
  
  // Start cache warming service
  console.log("🚀 Starting cache warming service...");
  const { cacheWarmingService } = await import("./cache-warming-service");
  await cacheWarmingService.startCacheWarming();
  cacheWarmingService.scheduleCacheWarming();

  // Start switchboard service for agent KPI monitoring and auto-promotion
  console.log("🚀 Starting Switchboard service...");
  const { switchboard } = await import("./switchboard-service");
  switchboard.start();

  const httpServer = createServer(app);

  // **NEW: ROBUST COLLABORATION SERVICE INITIALIZATION**
  console.log('🚀 Initializing Team Collaboration Service...');
  const { initCollaborationService } = await import('./collaboration-service');
  initCollaborationService(httpServer);

  // Initialize webhook service
  console.log('🔗 Initializing Webhook Service...');
  (global as any).webhookService = webhookService;

  // Initialize white-label service
  console.log('🏢 Initializing White-label Service...');
  (global as any).whiteLabelService = whiteLabelService;

  // Public payment endpoints (no authentication required)
  
  // Get invoice by payment link (public)
  app.get("/api/public/invoice/:paymentLink", async (req, res) => {
    try {
      const { paymentLink } = req.params;
      
      const invoice = await storage.getInvoiceByPaymentLink(paymentLink);
      
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found or payment link expired" });
      }

      // Check if payment link is expired
      if (invoice.paymentLinkExpiresAt && new Date() > invoice.paymentLinkExpiresAt) {
        return res.status(404).json({ error: "Payment link expired" });
      }

      // Return normalized invoice data (safe for public)
      const publicInvoiceData = {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        companyName: "Gigster Garage", // You can make this dynamic later
        companyAddress: "Business Address\nCity, State ZIP", // You can make this dynamic later
        subtotal: invoice.subtotal ? String(invoice.subtotal) : "0.00",
        taxRate: invoice.taxRate ? String(invoice.taxRate) : "0.00",
        taxAmount: invoice.taxAmount ? String(invoice.taxAmount) : "0.00",
        discountAmount: invoice.discountAmount ? String(invoice.discountAmount) : "0.00",
        totalAmount: invoice.totalAmount ? String(invoice.totalAmount) : "0.00",
        lineItems: invoice.lineItems || [],
        status: invoice.status,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        notes: invoice.notes,
      };

      res.json(publicInvoiceData);
    } catch (error) {
      console.error("Error fetching public invoice:", error);
      res.status(500).json({ error: "Failed to fetch invoice" });
    }
  });

  // Create payment intent for public invoice payment
  app.post("/api/public/create-payment-intent", async (req, res) => {
    try {
      const { paymentLink } = req.body;
      
      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ error: "Payment processing not configured" });
      }

      const invoice = await storage.getInvoiceByPaymentLink(paymentLink);
      
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      if (invoice.status === 'paid') {
        return res.status(400).json({ error: "Invoice already paid" });
      }

      // Check if payment link is expired
      if (invoice.paymentLinkExpiresAt && new Date() > invoice.paymentLinkExpiresAt) {
        return res.status(400).json({ error: "Payment link expired" });
      }

      const Stripe = require('stripe');
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

      // Create or retrieve existing payment intent
      let paymentIntent;
      if (invoice.stripePaymentIntentId) {
        try {
          paymentIntent = await stripe.paymentIntents.retrieve(invoice.stripePaymentIntentId);
        } catch (error) {
          // If payment intent doesn't exist, create new one
          paymentIntent = null;
        }
      }

      if (!paymentIntent) {
        paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(parseFloat(invoice.totalAmount || "0") * 100), // Convert to cents
          currency: "usd",
          metadata: {
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
          },
        });

        // Update invoice with payment intent ID
        await storage.updateInvoice(invoice.id, {
          stripePaymentIntentId: paymentIntent.id
        });
      }

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });

  // Stripe webhook to handle payment completion
  app.post("/api/webhooks/stripe", express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const sig = req.headers['stripe-signature'];
      
      if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ error: "Webhook not configured" });
      }

      const Stripe = require('stripe');
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      
      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: 'Invalid signature' });
      }

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const invoiceId = paymentIntent.metadata?.invoiceId;
        
        if (invoiceId) {
          // Mark invoice as paid
          await storage.updateInvoice(invoiceId, {
            status: 'paid',
            paidAt: new Date(),
            amountPaid: (paymentIntent.amount / 100).toString(), // Convert from cents
          });

          // Create payment record
          await storage.createPayment({
            invoiceId,
            amount: (paymentIntent.amount / 100).toString(),
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: 'stripe',
            reference: paymentIntent.id,
          });

          console.log(`Invoice ${paymentIntent.metadata.invoiceNumber} marked as paid`);
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ error: "Webhook handler failed" });
    }
  });

  // Initialize default users (admin and demo accounts)
  async function initializeDefaultUsers() {
    console.log("🚀 Initializing default user accounts...");
    try {
      // Check if admin user exists
      const existingAdmin = await storage.getUserByUsername("admin");
      if (!existingAdmin) {
        console.log("🔐 Creating admin user...");
        await storage.createUser({
          username: "admin",
          password: "admin123",
          name: "Administrator",
          email: "admin@gigster-garage.com",
          role: "admin",
          hasCompletedOnboarding: true,
          emailNotifications: true,
          smsNotifications: false,
          emailOptIn: true,
          smsOptIn: false
        });
        console.log("✅ Admin user created successfully");
      } else {
        console.log("👤 Admin user already exists, skipping creation");
      }

      // Check if demo user exists
      const existingDemo = await storage.getUserByUsername("demo");
      if (!existingDemo) {
        console.log("🎮 Creating demo user...");
        await storage.createUser({
          username: "demo",
          password: "demo123",
          name: "Demo User",
          email: "demo@gigster-garage.com",
          role: "user",
          hasCompletedOnboarding: true,
          emailNotifications: false,
          smsNotifications: false,
          emailOptIn: false,
          smsOptIn: false
        });
        console.log("✅ Demo user created successfully");
      } else {
        console.log("🎮 Demo user already exists, skipping creation");
      }
      console.log("✅ Default user initialization complete");
    } catch (error) {
      console.error("❌ Error initializing default users:", error);
    }
  }

  // ==================== AI QUESTIONNAIRE API ROUTES ====================
  
  // Zod schemas for AI questionnaire validation
  const startConversationSchema = z.object({
    contentType: z.string().min(1),
    questionLevel: z.enum(["basic", "advanced"]),
    projectType: z.string().optional(),
    entityId: z.string().optional(),
  });

  const submitAnswerSchema = z.object({
    conversationId: z.string().uuid(),
    answer: z.string().min(1),
    currentQuestionIndex: z.number().int().min(0),
  });

  const generateContentSchema = z.object({
    conversationId: z.string().uuid(),
  });
  
  // Start new AI conversation
  app.post("/api/ai-questionnaire/start", async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Validate request body
      const validated = startConversationSchema.parse(req.body);

      const result = await aiAssistantService.startConversation({
        userId: req.session.user.id,
        contentType: validated.contentType,
        questionLevel: validated.questionLevel,
        projectType: validated.projectType,
        entityId: validated.entityId,
      });

      res.json(result);
    } catch (error: any) {
      console.error("Error starting AI conversation:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: error.message || "Failed to start conversation" });
    }
  });

  // Submit answer and get next question
  app.post("/api/ai-questionnaire/answer", async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Validate request body
      const validated = submitAnswerSchema.parse(req.body);

      const result = await aiAssistantService.submitAnswer(
        validated.conversationId,
        req.session.user.id, // Pass userId for ownership verification
        validated.answer,
        validated.currentQuestionIndex
      );

      res.json(result);
    } catch (error: any) {
      console.error("Error submitting answer:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      if (error.message?.includes("Unauthorized")) {
        return res.status(403).json({ message: error.message });
      }
      res.status(500).json({ message: error.message || "Failed to submit answer" });
    }
  });

  // Generate final content
  app.post("/api/ai-questionnaire/generate", async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Validate request body
      const validated = generateContentSchema.parse(req.body);

      const content = await aiAssistantService.generateContent(
        validated.conversationId,
        req.session.user.id // Pass userId for ownership verification
      );

      res.json({ content });
    } catch (error: any) {
      console.error("Error generating content:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      if (error.message?.includes("Unauthorized")) {
        return res.status(403).json({ message: error.message });
      }
      res.status(500).json({ message: error.message || "Failed to generate content" });
    }
  });

  // Get conversation history
  app.get("/api/ai-questionnaire/history", async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { contentType } = req.query;

      const history = await aiAssistantService.getConversationHistory(
        req.session.user.id,
        contentType as string | undefined
      );

      res.json(history);
    } catch (error: any) {
      console.error("Error fetching conversation history:", error);
      res.status(500).json({ message: error.message || "Failed to fetch history" });
    }
  });

  // Update user business profile
  app.patch("/api/users/profile", async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { city, state, businessType, entityType, industry, targetMarket } = req.body;

      const updatedUser = await storage.updateUser(req.session.user.id, {
        city,
        state,
        businessType,
        entityType,
        industry,
        targetMarket,
      });

      // Update session
      req.session.user = updatedUser;

      res.json(updatedUser);
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: error.message || "Failed to update profile" });
    }
  });

  // Agent Management Routes
  app.get("/api/agents", requireAdmin, async (req, res) => {
    try {
      const agents = await storage.getAgents();
      
      // Fetch visibility flags and graduation plans for each agent
      const agentsWithDetails = await Promise.all(
        agents.map(async (agent) => {
          const visibilityFlag = await storage.getAgentVisibilityFlag(agent.id);
          const graduationPlan = await storage.getAgentGraduationPlan(agent.id);
          return {
            ...agent,
            visibilityFlag,
            graduationPlan,
          };
        })
      );
      
      res.json(agentsWithDetails);
    } catch (error: any) {
      console.error("Error fetching agents:", error);
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });

  app.get("/api/agents/:id", requireAdmin, async (req, res) => {
    try {
      const agent = await storage.getAgent(req.params.id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      const visibilityFlag = await storage.getAgentVisibilityFlag(agent.id);
      const graduationPlan = await storage.getAgentGraduationPlan(agent.id);
      
      res.json({
        ...agent,
        visibilityFlag,
        graduationPlan,
      });
    } catch (error: any) {
      console.error("Error fetching agent:", error);
      res.status(500).json({ message: "Failed to fetch agent" });
    }
  });

  app.post("/api/agents", requireAdmin, async (req, res) => {
    try {
      const agentData = insertAgentSchema.parse(req.body);
      const agent = await storage.createAgent(agentData);
      
      await logAuditEvent(
        req.session.user!.id,
        "agent",
        agent.id,
        "agent_created",
        {
          agentId: agent.id,
          name: agent.name,
        }
      );
      
      res.status(201).json(agent);
    } catch (error: any) {
      console.error("Error creating agent:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create agent" });
    }
  });

  app.patch("/api/agents/:id", requireAdmin, async (req, res) => {
    try {
      const updateData = req.body;
      const agent = await storage.updateAgent(req.params.id, updateData);
      
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      await logAuditEvent(
        req.session.user!.id,
        "agent",
        agent.id,
        "agent_updated",
        {
          agentId: agent.id,
          changes: updateData,
        }
      );
      
      res.json(agent);
    } catch (error: any) {
      console.error("Error updating agent:", error);
      res.status(500).json({ message: "Failed to update agent" });
    }
  });

  app.delete("/api/agents/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteAgent(req.params.id);
      
      if (!success) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      await logAuditEvent(
        req.session.user!.id,
        "agent",
        req.params.id,
        "agent_deleted",
        {
          agentId: req.params.id,
        }
      );
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting agent:", error);
      res.status(500).json({ message: "Failed to delete agent" });
    }
  });

  // Agent Visibility Flag Routes
  app.patch("/api/agents/:id/visibility", requireAdmin, async (req, res) => {
    try {
      const { exposeToUsers, dashboardCard, externalToolId } = req.body;
      
      let visibilityFlag = await storage.getAgentVisibilityFlag(req.params.id);
      
      if (visibilityFlag) {
        visibilityFlag = await storage.updateAgentVisibilityFlag(req.params.id, {
          exposeToUsers,
          dashboardCard,
          externalToolId,
        });
      } else {
        const flagData = insertAgentVisibilityFlagSchema.parse({
          agentId: req.params.id,
          exposeToUsers,
          dashboardCard,
          externalToolId,
        });
        visibilityFlag = await storage.createAgentVisibilityFlag(flagData);
      }
      
      await logAuditEvent(
        req.session.user!.id,
        "agent",
        req.params.id,
        "agent_visibility_updated",
        {
          agentId: req.params.id,
          exposeToUsers,
          dashboardCard,
          externalToolId,
        }
      );
      
      res.json(visibilityFlag);
    } catch (error: any) {
      console.error("Error updating agent visibility:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update visibility" });
    }
  });

  // Agent Data Import Route
  app.post("/api/agents/import-data", requireAdmin, async (req, res) => {
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Read and parse JSON visibility flags
      const jsonPath = path.join(process.cwd(), 'attached_assets', 'gg_visibility_flags_patch_1762134396262.json');
      const csvPath = path.join(process.cwd(), 'attached_assets', 'gg_agent_graduation_roadmap_1762134396262.csv');
      
      const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      
      const results = {
        agents: 0,
        visibilityFlags: 0,
        graduationPlans: 0,
        errors: [] as string[],
      };
      
      // First, create agents based on the JSON data
      for (const patch of jsonData.visibility_patches) {
        try {
          const agentId = patch.id;
          const agentName = agentId.replace('agent.', '').split('_').map((word: string) => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
          
          // Check if agent exists, if not create it
          let agent = await storage.getAgent(agentId);
          if (!agent) {
            agent = await storage.createAgent({
              id: agentId,
              name: agentName,
              description: `${agentName} internal agent`,
              status: 'active',
            });
            results.agents++;
          }
          
          // Create visibility flag
          const visibilityData = {
            agentId: agent.id,
            exposeToUsers: patch.visibility.expose_to_users,
            dashboardCard: patch.visibility.dashboard_card,
            externalToolId: null,
          };
          
          let visibilityFlag = await storage.getAgentVisibilityFlag(agent.id);
          if (!visibilityFlag) {
            await storage.createAgentVisibilityFlag(visibilityData);
            results.visibilityFlags++;
          }
        } catch (error: any) {
          results.errors.push(`Error processing agent ${patch.id}: ${error.message}`);
        }
      }
      
      // Now read CSV for graduation plans
      const csvResults: any[] = [];
      const readStream = fs.createReadStream(csvPath);
      
      readStream
        .pipe(csvParser())
        .on('data', (data: any) => csvResults.push(data))
        .on('end', async () => {
          for (const row of csvResults) {
            try {
              const agentId = row['Internal Agent'];
              const agent = await storage.getAgent(agentId);
              
              if (!agent) {
                results.errors.push(`Agent ${agentId} not found for graduation plan`);
                continue;
              }
              
              // Parse dates
              const startDate = new Date(row['Start']);
              const endDate = new Date(row['End']);
              
              // Check if graduation plan exists
              const existingPlan = await storage.getAgentGraduationPlan(agentId);
              
              if (!existingPlan) {
                await storage.createAgentGraduationPlan({
                  agentId: agent.id,
                  targetTool: row['External Toolkit'],
                  phase: row['Phase'],
                  targetDate: endDate,
                  criteria: row['Graduation Criteria'],
                  owner: row['Owner'],
                  status: 'planning',
                });
                results.graduationPlans++;
              }
            } catch (error: any) {
              results.errors.push(`Error processing graduation plan for ${row['Internal Agent']}: ${error.message}`);
            }
          }
          
          // Initialize sample KPI data for each agent
          const sampleKpis = [
            {
              agentId: 'agent.itsa',
              onTimeMilestoneRate: '0.98',
              gateEscapeRate: '0.005',
              incidentCount30d: 0,
              status: 'green' as const,
            },
            {
              agentId: 'agent.ssk',
              onTimeMilestoneRate: '0.92',
              gateEscapeRate: '0.015',
              incidentCount30d: 1,
              status: 'amber' as const,
            },
            {
              agentId: 'agent.exec_orchestrator',
              onTimeMilestoneRate: '0.96',
              gateEscapeRate: '0.008',
              incidentCount30d: 0,
              status: 'green' as const,
            },
            {
              agentId: 'agent.planner',
              onTimeMilestoneRate: '0.75',
              gateEscapeRate: '0.08',
              incidentCount30d: 3,
              status: 'red' as const,
            },
            {
              agentId: 'agent.ledger',
              onTimeMilestoneRate: '0.88',
              gateEscapeRate: '0.03',
              incidentCount30d: 2,
              status: 'amber' as const,
            },
            {
              agentId: 'agent.sentinel',
              onTimeMilestoneRate: '0.97',
              gateEscapeRate: '0.007',
              incidentCount30d: 0,
              status: 'green' as const,
            },
          ];

          let kpisCreated = 0;
          for (const kpiData of sampleKpis) {
            try {
              const existingKpi = await storage.getAgentKpi(kpiData.agentId);
              if (!existingKpi) {
                await storage.createAgentKpi(kpiData);
                kpisCreated++;
              }
            } catch (error: any) {
              results.errors.push(`Error creating KPI for ${kpiData.agentId}: ${error.message}`);
            }
          }
          
          await logAuditEvent(
            req.session.user!.id,
            "system",
            "agents",
            "data_imported",
            {
              results: { ...results, kpisCreated },
            }
          );
          
          res.json({ ...results, kpisCreated });
        });
    } catch (error: any) {
      console.error("Error importing agent data:", error);
      res.status(500).json({ message: "Failed to import data", error: error.message });
    }
  });

  // Agent Graduation Plan Routes
  app.get("/api/agents/graduation-plans", requireAdmin, async (req, res) => {
    try {
      const plans = await storage.getAgentGraduationPlans();
      res.json(plans);
    } catch (error: any) {
      console.error("Error fetching graduation plans:", error);
      res.status(500).json({ message: "Failed to fetch graduation plans" });
    }
  });

  app.post("/api/agents/:id/graduation-plan", requireAdmin, async (req, res) => {
    try {
      const planData = insertAgentGraduationPlanSchema.parse({
        ...req.body,
        agentId: req.params.id,
      });
      
      const plan = await storage.createAgentGraduationPlan(planData);
      
      await logAuditEvent(
        req.session.user!.id,
        "agent",
        req.params.id,
        "graduation_plan_created",
        {
          agentId: req.params.id,
          targetTool: plan.targetTool,
          targetDate: plan.targetDate,
        }
      );
      
      res.status(201).json(plan);
    } catch (error: any) {
      console.error("Error creating graduation plan:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create graduation plan" });
    }
  });

  app.patch("/api/agents/graduation-plans/:planId", requireAdmin, async (req, res) => {
    try {
      const updateData = req.body;
      const plan = await storage.updateAgentGraduationPlan(req.params.planId, updateData);
      
      if (!plan) {
        return res.status(404).json({ message: "Graduation plan not found" });
      }
      
      await logAuditEvent(
        req.session.user!.id,
        "agent",
        plan.agentId,
        "graduation_plan_updated",
        {
          planId: req.params.planId,
          changes: updateData,
        }
      );
      
      res.json(plan);
    } catch (error: any) {
      console.error("Error updating graduation plan:", error);
      res.status(500).json({ message: "Failed to update graduation plan" });
    }
  });

  // Agent KPI routes
  app.get("/api/agents/kpis", requireAdmin, async (req, res) => {
    try {
      const kpis = await storage.getAgentKpis();
      res.json(kpis);
    } catch (error: any) {
      console.error("Error fetching KPIs:", error);
      res.status(500).json({ message: "Failed to fetch KPIs" });
    }
  });

  app.get("/api/agents/:id/kpi", requireAdmin, async (req, res) => {
    try {
      const kpi = await storage.getAgentKpi(req.params.id);
      if (!kpi) {
        return res.status(404).json({ message: "KPI not found" });
      }
      res.json(kpi);
    } catch (error: any) {
      console.error("Error fetching KPI:", error);
      res.status(500).json({ message: "Failed to fetch KPI" });
    }
  });

  app.post("/api/agents/:id/kpi", requireAdmin, async (req, res) => {
    try {
      const { onTimeMilestoneRate, gateEscapeRate, incidentCount30d } = req.body;
      
      // Calculate status based on thresholds
      let status: "green" | "amber" | "red" = "amber";
      const onTime = parseFloat(onTimeMilestoneRate);
      const gateEscape = parseFloat(gateEscapeRate);
      const incidents = parseInt(incidentCount30d);
      
      // Graduation criteria: on_time >= 0.95 AND gate_escape <= 0.01 AND incidents == 0
      if (onTime >= 0.95 && gateEscape <= 0.01 && incidents === 0) {
        status = "green";
      } else if (onTime < 0.80 || gateEscape > 0.05 || incidents > 2) {
        status = "red";
      }
      
      const existingKpi = await storage.getAgentKpi(req.params.id);
      
      let kpi;
      if (existingKpi) {
        kpi = await storage.updateAgentKpi(req.params.id, {
          agentId: req.params.id,
          onTimeMilestoneRate,
          gateEscapeRate,
          incidentCount30d,
          status,
        });
      } else {
        kpi = await storage.createAgentKpi({
          agentId: req.params.id,
          onTimeMilestoneRate,
          gateEscapeRate,
          incidentCount30d,
          status,
        });
      }
      
      await logAuditEvent(
        req.session.user!.id,
        "agent",
        req.params.id,
        existingKpi ? "kpi_updated" : "kpi_created",
        {
          agentId: req.params.id,
          status,
          onTimeMilestoneRate,
          gateEscapeRate,
          incidentCount30d,
        }
      );
      
      res.status(existingKpi ? 200 : 201).json(kpi);
    } catch (error: any) {
      console.error("Error updating KPI:", error);
      res.status(500).json({ message: "Failed to update KPI" });
    }
  });

  app.post("/api/agents/:id/promote", requireAdmin, async (req, res) => {
    try {
      const agent = await storage.getAgent(req.params.id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      const kpi = await storage.getAgentKpi(req.params.id);
      const graduationPlan = await storage.getAgentGraduationPlan(req.params.id);
      
      // Check graduation criteria
      if (kpi && kpi.status !== "green") {
        return res.status(400).json({
          message: "Agent does not meet graduation criteria (KPI status must be green)",
          kpi,
        });
      }
      
      // Update visibility flags to expose to users
      const visibilityFlag = await storage.getAgentVisibilityFlag(req.params.id);
      if (visibilityFlag) {
        await storage.updateAgentVisibilityFlag(req.params.id, {
          exposeToUsers: true,
          dashboardCard: true,
        });
      } else {
        await storage.createAgentVisibilityFlag({
          agentId: req.params.id,
          exposeToUsers: true,
          dashboardCard: true,
        });
      }
      
      // Mark graduation plan as completed if it exists
      if (graduationPlan) {
        await storage.updateAgentGraduationPlan(graduationPlan.id, {
          completedAt: new Date(),
        });
      }
      
      await logAuditEvent(
        req.session.user!.id,
        "agent",
        req.params.id,
        "agent_promoted",
        {
          agentId: req.params.id,
          targetTool: graduationPlan?.targetTool,
          kpiStatus: kpi?.status,
        }
      );
      
      res.json({
        success: true,
        message: "Agent promoted successfully",
        agent,
      });
    } catch (error: any) {
      console.error("Error promoting agent:", error);
      res.status(500).json({ message: "Failed to promote agent" });
    }
  });

  // Initialize default users on startup
  await initializeDefaultUsers();

  // Global error handler (LAST - after all routes)
  app.use((err: any, req: any, res: any, next: any) => {
    const route = req.route?.path || req.originalUrl || 'unknown';
    const status = err.statusCode || err.status || 500;
    const error = String(err.message || 'error');
    
    // Log to our error tracker for audit purposes
    if (global.errorTracker) {
      global.errorTracker.logError(route, status, error);
    }
    
    console.error(`[ERROR] ${status} ${req.method} ${route}: ${error}`);
    
    // Only send response if headers haven't been sent
    if (!res.headersSent) {
      res.status(status).json({ message: 'Request failed' });
    }
  });

  return httpServer;
}```

---

## 7. STORAGE INTERFACE (server/storage.ts)

### Complete Storage Implementation:
```typescript
import { eq, and, or, desc, gte, lte, isNull, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users, tasks, projects, taskDependencies, templates, proposals, clients, clientDocuments, invoices, payments, contracts, presentations, timeLogs, messages, customFieldDefinitions, customFieldValues, workflowRules, workflowExecutions, comments, activities, apiKeys, apiUsage, fileAttachments, documentVersions, agents, agentVisibilityFlags, agentGraduationPlans, agentKpis } from "@shared/schema";
import type { User, UpsertUser, Task, InsertTask, Project, InsertProject, TaskDependency, InsertTaskDependency, Template, InsertTemplate, Proposal, InsertProposal, Client, InsertClient, ClientDocument, InsertClientDocument, Invoice, InsertInvoice, Payment, InsertPayment, Contract, InsertContract, Presentation, InsertPresentation, TimeLog, InsertTimeLog, UpdateTask, UpdateTemplate, UpdateProposal, UpdateTimeLog, TaskWithRelations, TemplateWithRelations, ProposalWithRelations, TimeLogWithRelations, Message, InsertMessage, MessageWithRelations, CustomFieldDefinition, InsertCustomFieldDefinition, CustomFieldValue, InsertCustomFieldValue, WorkflowRule, InsertWorkflowRule, WorkflowExecution, InsertWorkflowExecution, Comment, InsertComment, Activity, InsertActivity, ApiKey, InsertApiKey, ApiUsage, InsertApiUsage, FileAttachment, InsertFileAttachment, DocumentVersion, InsertDocumentVersion, Agent, InsertAgent, AgentVisibilityFlag, InsertAgentVisibilityFlag, AgentGraduationPlan, InsertAgentGraduationPlan, AgentKpi, InsertAgentKpi } from "@shared/schema";

// Advanced search types for client documents
export interface DocumentSearchParams {
  // Text search
  query?: string;
  searchFields?: ('name' | 'description' | 'fileName' | 'tags')[];
  
  // Filters
  clientIds?: string[];
  types?: string[];
  statuses?: string[];
  tags?: string[];
  tagLogic?: 'AND' | 'OR';
  
  // Date ranges
  createdDateFrom?: Date;
  createdDateTo?: Date;
  updatedDateFrom?: Date;
  updatedDateTo?: Date;
  
  // File size ranges (in bytes)
  fileSizeMin?: number;
  fileSizeMax?: number;
  
  // Metadata filters
  metadataFilters?: Array<{
    key: string;
    value: any;
    operator?: 'equals' | 'contains' | 'startsWith' | 'exists';
  }>;
  
  // Pagination and sorting
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'name' | 'createdAt' | 'updatedAt' | 'fileSize';
  sortOrder?: 'asc' | 'desc';
  
  // Advanced options
  includeArchived?: boolean;
  fuzzySearch?: boolean;
}

export interface DocumentSearchFacets {
  types: Array<{ value: string; count: number }>;
  statuses: Array<{ value: string; count: number }>;
  clients: Array<{ id: string; name: string; count: number }>;
  tags: Array<{ value: string; count: number }>;
  fileSizeRanges: Array<{ 
    range: string; 
    min: number; 
    max: number | null; 
    count: number 
  }>;
  dateRanges: Array<{
    range: string;
    from: Date;
    to: Date;
    count: number;
  }>;
}

// Retry wrapper for transient database errors
async function withRetry<T>(operation: () => Promise<T>, operationName: string = 'database operation'): Promise<T> {
  const maxRetries = 3;
  const baseDelay = 100; // Start with 100ms
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      const isTransientError = error.code === '57P01' || // admin_shutdown
                              error.code === '53300' || // too_many_connections
                              error.code === '57P03';    // cannot_connect_now
      
      if (isTransientError && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(3, attempt - 1); // Exponential backoff: 100ms, 300ms, 900ms
        console.warn(`🔄 Transient DB error (${error.code}) on ${operationName}, retrying in ${delay}ms (attempt ${attempt}/${maxRetries}):`, error.message);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Re-throw if not transient or max retries reached
      throw error;
    }
  }
  
  throw new Error(`Failed after ${maxRetries} attempts`);
}

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

  // **NEW: Optimized filtered query methods for Advanced Reporting**
  getFilteredTasks(filters: {
    projectIds?: string[];
    userIds?: string[];
    statuses?: string[];
    priorities?: string[];
    timeRange?: { start: Date; end: Date };
  }): Promise<Task[]>;
  
  getFilteredTimeLogs(filters: {
    userIds?: string[];
    projectIds?: string[];
    timeRange?: { start: Date; end: Date };
  }): Promise<TimeLog[]>;
  
  getFilteredInvoices(filters: {
    timeRange?: { start: Date; end: Date };
    statuses?: string[];
  }): Promise<Invoice[]>;
  
  getFilteredProposals(filters: {
    timeRange?: { start: Date; end: Date };
    statuses?: string[];
  }): Promise<Proposal[]>;
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
  
  // Advanced document search
  searchClientDocuments(searchParams: DocumentSearchParams): Promise<{
    documents: any[];
    totalCount: number;
    facets: DocumentSearchFacets;
  }>;

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

  // Presentation management
  getPresentations(): Promise<Presentation[]>;
  getPresentation(id: string, userId?: string): Promise<Presentation | undefined>;
  createPresentation(insertPresentation: InsertPresentation): Promise<Presentation>;
  updatePresentation(id: string, updatePresentation: Partial<InsertPresentation>): Promise<Presentation | undefined>;
  deletePresentation(id: string): Promise<boolean>;

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

  // Payment link management
  generatePaymentLink(invoiceId: string): Promise<string>;
  getInvoiceByPaymentLink(paymentLink: string): Promise<Invoice | undefined>;

  // Agent management
  getAgents(): Promise<Agent[]>;
  getAgent(id: string): Promise<Agent | undefined>;
  createAgent(insertAgent: InsertAgent): Promise<Agent>;
  updateAgent(id: string, updateAgent: Partial<InsertAgent>): Promise<Agent | undefined>;
  deleteAgent(id: string): Promise<boolean>;

  // Agent Visibility Flags
  getAgentVisibilityFlag(agentId: string): Promise<AgentVisibilityFlag | undefined>;
  createAgentVisibilityFlag(insertFlag: InsertAgentVisibilityFlag): Promise<AgentVisibilityFlag>;
  updateAgentVisibilityFlag(agentId: string, updateFlag: Partial<InsertAgentVisibilityFlag>): Promise<AgentVisibilityFlag | undefined>;

  // Agent Graduation Plans
  getAgentGraduationPlans(): Promise<AgentGraduationPlan[]>;
  getAgentGraduationPlan(agentId: string): Promise<AgentGraduationPlan | undefined>;
  createAgentGraduationPlan(insertPlan: InsertAgentGraduationPlan): Promise<AgentGraduationPlan>;
  updateAgentGraduationPlan(id: string, updatePlan: Partial<InsertAgentGraduationPlan>): Promise<AgentGraduationPlan | undefined>;
  deleteAgentGraduationPlan(id: string): Promise<boolean>;

  // Agent KPIs
  getAgentKpis(): Promise<AgentKpi[]>;
  getAgentKpi(agentId: string): Promise<AgentKpi | undefined>;
  createAgentKpi(insertKpi: InsertAgentKpi): Promise<AgentKpi>;
  updateAgentKpi(agentId: string, updateKpi: Partial<InsertAgentKpi>): Promise<AgentKpi | undefined>;
  deleteAgentKpi(agentId: string): Promise<boolean>;
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

  async searchClientDocuments(searchParams: DocumentSearchParams): Promise<{
    documents: any[];
    totalCount: number;
    facets: DocumentSearchFacets;
  }> {
    return withRetry(async () => {
      const {
        query = '',
        searchFields = ['name', 'description', 'fileName', 'tags'],
        clientIds = [],
        types = [],
        statuses = [],
        tags = [],
        tagLogic = 'AND',
        createdDateFrom,
        createdDateTo,
        updatedDateFrom,
        updatedDateTo,
        fileSizeMin,
        fileSizeMax,
        metadataFilters = [],
        page = 1,
        limit = 50,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        includeArchived = false,
        fuzzySearch = false
      } = searchParams;

      // Build the base query with joins
      const baseQuery = db
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
        .leftJoin(users, eq(clientDocuments.uploadedById, users.id));

      // Build WHERE conditions
      const whereConditions: any[] = [];

      // Archive filter
      if (!includeArchived) {
        whereConditions.push(sql`${clientDocuments.status} != 'archived'`);
      }

      // Text search across multiple fields
      if (query.trim()) {
        const searchTerm = fuzzySearch ? `%${query.toLowerCase()}%` : `%${query.toLowerCase()}%`;
        const searchConditions: any[] = [];

        if (searchFields.includes('name')) {
          searchConditions.push(sql`LOWER(${clientDocuments.name}) LIKE ${searchTerm}`);
        }
        if (searchFields.includes('description')) {
          searchConditions.push(sql`LOWER(${clientDocuments.description}) LIKE ${searchTerm}`);
        }
        if (searchFields.includes('fileName')) {
          searchConditions.push(sql`LOWER(${clientDocuments.fileName}) LIKE ${searchTerm}`);
        }
        if (searchFields.includes('tags')) {
          // Search in JSON array tags
          searchConditions.push(sql`EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(${clientDocuments.tags}) AS tag 
            WHERE LOWER(tag) LIKE ${searchTerm}
          )`);
        }

        if (searchConditions.length > 0) {
          whereConditions.push(or(...searchConditions));
        }
      }

      // Client filter
      if (clientIds.length > 0) {
        whereConditions.push(sql`${clientDocuments.clientId} = ANY(${clientIds})`);
      }

      // Type filter
      if (types.length > 0) {
        whereConditions.push(sql`${clientDocuments.type} = ANY(${types})`);
      }

      // Status filter
      if (statuses.length > 0) {
        whereConditions.push(sql`${clientDocuments.status} = ANY(${statuses})`);
      }

      // Tag filters
      if (tags.length > 0) {
        if (tagLogic === 'AND') {
          // All tags must be present
          whereConditions.push(sql`${clientDocuments.tags} @> ${JSON.stringify(tags)}`);
        } else {
          // Any tag must be present
          const tagConditions = tags.map(tag => 
            sql`${clientDocuments.tags} @> ${JSON.stringify([tag])}`
          );
          whereConditions.push(or(...tagConditions));
        }
      }

      // Date range filters
      if (createdDateFrom) {
        whereConditions.push(gte(clientDocuments.createdAt, createdDateFrom));
      }
      if (createdDateTo) {
        whereConditions.push(lte(clientDocuments.createdAt, createdDateTo));
      }
      if (updatedDateFrom) {
        whereConditions.push(gte(clientDocuments.updatedAt, updatedDateFrom));
      }
      if (updatedDateTo) {
        whereConditions.push(lte(clientDocuments.updatedAt, updatedDateTo));
      }

      // File size filters
      if (fileSizeMin !== undefined) {
        whereConditions.push(gte(clientDocuments.fileSize, fileSizeMin));
      }
      if (fileSizeMax !== undefined) {
        whereConditions.push(lte(clientDocuments.fileSize, fileSizeMax));
      }

      // Metadata filters
      metadataFilters.forEach(filter => {
        const { key, value, operator = 'equals' } = filter;
        switch (operator) {
          case 'equals':
            whereConditions.push(sql`${clientDocuments.metadata}->>${key} = ${value}`);
            break;
          case 'contains':
            whereConditions.push(sql`${clientDocuments.metadata}->>${key} LIKE ${'%' + value + '%'}`);
            break;
          case 'startsWith':
            whereConditions.push(sql`${clientDocuments.metadata}->>${key} LIKE ${value + '%'}`);
            break;
          case 'exists':
            whereConditions.push(sql`${clientDocuments.metadata} ? ${key}`);
            break;
        }
      });

      // Apply WHERE conditions
      let query_builder = baseQuery;
      if (whereConditions.length > 0) {
        query_builder = baseQuery.where(and(...whereConditions));
      }

      // Get total count for pagination
      const countQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(clientDocuments)
        .leftJoin(clients, eq(clientDocuments.clientId, clients.id))
        .leftJoin(users, eq(clientDocuments.uploadedById, users.id));

      let countQueryWithWhere = countQuery;
      if (whereConditions.length > 0) {
        countQueryWithWhere = countQuery.where(and(...whereConditions));
      }

      const [{ count: totalCount }] = await countQueryWithWhere;

      // Apply sorting
      let orderedQuery = query_builder;
      switch (sortBy) {
        case 'name':
          orderedQuery = sortOrder === 'asc' 
            ? query_builder.orderBy(clientDocuments.name)
            : query_builder.orderBy(desc(clientDocuments.name));
          break;
        case 'createdAt':
          orderedQuery = sortOrder === 'asc'
            ? query_builder.orderBy(clientDocuments.createdAt)
            : query_builder.orderBy(desc(clientDocuments.createdAt));
          break;
        case 'updatedAt':
          orderedQuery = sortOrder === 'asc'
            ? query_builder.orderBy(clientDocuments.updatedAt)
            : query_builder.orderBy(desc(clientDocuments.updatedAt));
          break;
        case 'fileSize':
          orderedQuery = sortOrder === 'asc'
            ? query_builder.orderBy(clientDocuments.fileSize)
            : query_builder.orderBy(desc(clientDocuments.fileSize));
          break;
        case 'relevance':
        default:
          // For relevance, fall back to created date
          orderedQuery = query_builder.orderBy(desc(clientDocuments.createdAt));
          break;
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      const documents = await orderedQuery.limit(limit).offset(offset);

      // Generate facets for UI filtering
      const facets = await this.generateDocumentSearchFacets(whereConditions);

      return {
        documents,
        totalCount,
        facets
      };
    }, 'searchClientDocuments');
  }

  private async generateDocumentSearchFacets(baseWhereConditions: any[]): Promise<DocumentSearchFacets> {
    // Get counts for different facets
    const [typeFacets, statusFacets, clientFacets, tagFacets] = await Promise.all([
      // Type facets
      db
        .select({
          value: clientDocuments.type,
          count: sql<number>`count(*)`
        })
        .from(clientDocuments)
        .where(baseWhereConditions.length > 0 ? and(...baseWhereConditions) : undefined)
        .groupBy(clientDocuments.type),

      // Status facets
      db
        .select({
          value: clientDocuments.status,
          count: sql<number>`count(*)`
        })
        .from(clientDocuments)
        .where(baseWhereConditions.length > 0 ? and(...baseWhereConditions) : undefined)
        .groupBy(clientDocuments.status),

      // Client facets
      db
        .select({
          id: clients.id,
          name: clients.name,
          count: sql<number>`count(*)`
        })
        .from(clientDocuments)
        .leftJoin(clients, eq(clientDocuments.clientId, clients.id))
        .where(baseWhereConditions.length > 0 ? and(...baseWhereConditions) : undefined)
        .groupBy(clients.id, clients.name),

      // Tag facets (simplified for now)
      db
        .select({
          value: sql<string>`unnest(array(SELECT jsonb_array_elements_text(tags)))`,
          count: sql<number>`count(*)`
        })
        .from(clientDocuments)
        .where(baseWhereConditions.length > 0 ? and(...baseWhereConditions) : undefined)
        .groupBy(sql`unnest(array(SELECT jsonb_array_elements_text(tags)))`)
        .limit(20)
    ]);

    // Generate file size ranges
    const fileSizeRanges = [
      { range: "Small (< 1MB)", min: 0, max: 1024 * 1024, count: 0 },
      { range: "Medium (1-10MB)", min: 1024 * 1024, max: 10 * 1024 * 1024, count: 0 },
      { range: "Large (10-100MB)", min: 10 * 1024 * 1024, max: 100 * 1024 * 1024, count: 0 },
      { range: "Very Large (>100MB)", min: 100 * 1024 * 1024, max: null, count: 0 }
    ];

    // Generate date ranges (simplified)
    const now = new Date();
    const dateRanges = [
      { 
        range: "Last 7 days", 
        from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), 
        to: now, 
        count: 0 
      },
      { 
        range: "Last 30 days", 
        from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), 
        to: now, 
        count: 0 
      },
      { 
        range: "Last 3 months", 
        from: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), 
        to: now, 
        count: 0 
      }
    ];

    return {
      types: typeFacets || [],
      statuses: statusFacets || [],
      clients: clientFacets || [],
      tags: tagFacets || [],
      fileSizeRanges,
      dateRanges
    };
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

  // **NEW: OPTIMIZED FILTERED QUERY METHODS FOR ADVANCED REPORTING**
  // These methods implement database-level filtering instead of in-memory filtering
  // for massive performance improvements in the Advanced Reporting Service

  async getFilteredTasks(filters: {
    projectIds?: string[];
    userIds?: string[];
    statuses?: string[];
    priorities?: string[];
    timeRange?: { start: Date; end: Date };
  }): Promise<Task[]> {
    return withRetry(async () => {
      let query = db.select().from(tasks);
      const conditions: any[] = [];

      // Time range filter - use database WHERE instead of memory filtering
      if (filters.timeRange) {
        conditions.push(gte(tasks.createdAt, filters.timeRange.start));
        conditions.push(lte(tasks.createdAt, filters.timeRange.end));
      }

      // Project filter - use database WHERE instead of memory filtering
      if (filters.projectIds?.length) {
        conditions.push(sql`${tasks.projectId} = ANY(${filters.projectIds})`);
      }

      // User filter - use database WHERE instead of memory filtering
      if (filters.userIds?.length) {
        conditions.push(
          or(
            sql`${tasks.assignedToId} = ANY(${filters.userIds})`,
            sql`${tasks.createdById} = ANY(${filters.userIds})`
          )
        );
      }

      // Status filter - use database WHERE instead of memory filtering
      if (filters.statuses?.length) {
        conditions.push(sql`${tasks.status} = ANY(${filters.statuses})`);
      }

      // Priority filter - use database WHERE instead of memory filtering
      if (filters.priorities?.length) {
        conditions.push(sql`${tasks.priority} = ANY(${filters.priorities})`);
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      return await query.orderBy(desc(tasks.createdAt));
    }, 'getFilteredTasks');
  }

  async getFilteredTimeLogs(filters: {
    userIds?: string[];
    projectIds?: string[];
    timeRange?: { start: Date; end: Date };
  }): Promise<TimeLog[]> {
    return withRetry(async () => {
      let query = db.select().from(timeLogs);
      const conditions: any[] = [];

      // Time range filter - use database WHERE instead of memory filtering
      if (filters.timeRange) {
        conditions.push(gte(timeLogs.startTime, filters.timeRange.start));
        conditions.push(lte(timeLogs.startTime, filters.timeRange.end));
      }

      // User filter - use database WHERE instead of memory filtering
      if (filters.userIds?.length) {
        conditions.push(sql`${timeLogs.userId} = ANY(${filters.userIds})`);
      }

      // Project filter - use database WHERE instead of memory filtering
      if (filters.projectIds?.length) {
        conditions.push(sql`${timeLogs.projectId} = ANY(${filters.projectIds})`);
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      return await query.orderBy(desc(timeLogs.startTime));
    }, 'getFilteredTimeLogs');
  }

  async getFilteredInvoices(filters: {
    timeRange?: { start: Date; end: Date };
    statuses?: string[];
  }): Promise<Invoice[]> {
    return withRetry(async () => {
      let query = db.select().from(invoices);
      const conditions: any[] = [];

      // Time range filter - use database WHERE instead of memory filtering
      if (filters.timeRange) {
        conditions.push(gte(invoices.createdAt, filters.timeRange.start));
        conditions.push(lte(invoices.createdAt, filters.timeRange.end));
      }

      // Status filter - use database WHERE instead of memory filtering
      if (filters.statuses?.length) {
        conditions.push(sql`${invoices.status} = ANY(${filters.statuses})`);
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      return await query.orderBy(desc(invoices.createdAt));
    }, 'getFilteredInvoices');
  }

  async getFilteredProposals(filters: {
    timeRange?: { start: Date; end: Date };
    statuses?: string[];
  }): Promise<Proposal[]> {
    return withRetry(async () => {
      let query = db.select().from(proposals);
      const conditions: any[] = [];

      // Time range filter - use database WHERE instead of memory filtering
      if (filters.timeRange) {
        conditions.push(gte(proposals.createdAt, filters.timeRange.start));
        conditions.push(lte(proposals.createdAt, filters.timeRange.end));
      }

      // Status filter - use database WHERE instead of memory filtering
      if (filters.statuses?.length) {
        conditions.push(sql`${proposals.status} = ANY(${filters.statuses})`);
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      return await query.orderBy(desc(proposals.createdAt));
    }, 'getFilteredProposals');
  }

  async getInvoiceByPaymentLink(paymentLink: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.paymentLink, paymentLink));
    return invoice;
  }

  async generatePaymentLink(invoiceId: string): Promise<string> {
    const paymentLink = `pay-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Expire in 30 days

    await db
      .update(invoices)
      .set({
        paymentLink,
        paymentLinkExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoiceId));

    return paymentLink;
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

  // Presentation operations
  async getPresentations(): Promise<Presentation[]> {
    return await db.select().from(presentations).orderBy(desc(presentations.createdAt));
  }

  async getPresentation(id: string, userId?: string): Promise<Presentation | undefined> {
    const [presentation] = await db.select().from(presentations).where(eq(presentations.id, id));
    return presentation;
  }

  async createPresentation(insertPresentation: InsertPresentation): Promise<Presentation> {
    const [presentation] = await db
      .insert(presentations)
      .values(insertPresentation)
      .returning();
    return presentation;
  }

  async updatePresentation(id: string, updatePresentation: Partial<InsertPresentation>): Promise<Presentation | undefined> {
    const [presentation] = await db
      .update(presentations)
      .set({
        ...updatePresentation,
        updatedAt: new Date(),
      })
      .where(eq(presentations.id, id))
      .returning();
    return presentation;
  }

  async deletePresentation(id: string): Promise<boolean> {
    const result = await db.delete(presentations).where(eq(presentations.id, id));
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

  // Agent operations
  async getAgents(): Promise<Agent[]> {
    return await db.select().from(agents).orderBy(agents.id);
  }

  async getAgent(id: string): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent;
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const [agent] = await db
      .insert(agents)
      .values(insertAgent)
      .returning();
    return agent;
  }

  async updateAgent(id: string, updateAgent: Partial<InsertAgent>): Promise<Agent | undefined> {
    const [agent] = await db
      .update(agents)
      .set({ ...updateAgent, updatedAt: new Date() })
      .where(eq(agents.id, id))
      .returning();
    return agent;
  }

  async deleteAgent(id: string): Promise<boolean> {
    const result = await db.delete(agents).where(eq(agents.id, id));
    return result.rowCount > 0;
  }

  // Agent Visibility Flag operations
  async getAgentVisibilityFlag(agentId: string): Promise<AgentVisibilityFlag | undefined> {
    const [flag] = await db
      .select()
      .from(agentVisibilityFlags)
      .where(eq(agentVisibilityFlags.agentId, agentId));
    return flag;
  }

  async createAgentVisibilityFlag(insertFlag: InsertAgentVisibilityFlag): Promise<AgentVisibilityFlag> {
    const [flag] = await db
      .insert(agentVisibilityFlags)
      .values(insertFlag)
      .returning();
    return flag;
  }

  async updateAgentVisibilityFlag(agentId: string, updateFlag: Partial<InsertAgentVisibilityFlag>): Promise<AgentVisibilityFlag | undefined> {
    const [flag] = await db
      .update(agentVisibilityFlags)
      .set({ ...updateFlag, updatedAt: new Date() })
      .where(eq(agentVisibilityFlags.agentId, agentId))
      .returning();
    return flag;
  }

  // Agent Graduation Plan operations
  async getAgentGraduationPlans(): Promise<AgentGraduationPlan[]> {
    return await db
      .select()
      .from(agentGraduationPlans)
      .orderBy(agentGraduationPlans.targetDate);
  }

  async getAgentGraduationPlan(agentId: string): Promise<AgentGraduationPlan | undefined> {
    const [plan] = await db
      .select()
      .from(agentGraduationPlans)
      .where(eq(agentGraduationPlans.agentId, agentId));
    return plan;
  }

  async createAgentGraduationPlan(insertPlan: InsertAgentGraduationPlan): Promise<AgentGraduationPlan> {
    const [plan] = await db
      .insert(agentGraduationPlans)
      .values(insertPlan)
      .returning();
    return plan;
  }

  async updateAgentGraduationPlan(id: string, updatePlan: Partial<InsertAgentGraduationPlan>): Promise<AgentGraduationPlan | undefined> {
    const [plan] = await db
      .update(agentGraduationPlans)
      .set({ ...updatePlan, updatedAt: new Date() })
      .where(eq(agentGraduationPlans.id, id))
      .returning();
    return plan;
  }

  async deleteAgentGraduationPlan(id: string): Promise<boolean> {
    const result = await db
      .delete(agentGraduationPlans)
      .where(eq(agentGraduationPlans.id, id));
    return result.rowCount > 0;
  }

  // Agent KPI operations
  async getAgentKpis(): Promise<AgentKpi[]> {
    return await db
      .select()
      .from(agentKpis)
      .orderBy(agentKpis.agentId);
  }

  async getAgentKpi(agentId: string): Promise<AgentKpi | undefined> {
    const [kpi] = await db
      .select()
      .from(agentKpis)
      .where(eq(agentKpis.agentId, agentId));
    return kpi;
  }

  async createAgentKpi(insertKpi: InsertAgentKpi): Promise<AgentKpi> {
    const [kpi] = await db
      .insert(agentKpis)
      .values({ ...insertKpi, lastUpdated: new Date() })
      .returning();
    return kpi;
  }

  async updateAgentKpi(agentId: string, updateKpi: Partial<InsertAgentKpi>): Promise<AgentKpi | undefined> {
    const [kpi] = await db
      .update(agentKpis)
      .set({ ...updateKpi, lastUpdated: new Date() })
      .where(eq(agentKpis.agentId, agentId))
      .returning();
    return kpi;
  }

  async deleteAgentKpi(agentId: string): Promise<boolean> {
    const result = await db
      .delete(agentKpis)
      .where(eq(agentKpis.agentId, agentId));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();```

---

## 8. MAIN APP ROUTER (client/src/App.tsx)

### Complete App Component with Routes:
```typescript
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { MoodPaletteProvider } from "@/hooks/useMoodPalette";
import { DemoModeProvider } from "@/hooks/useDemoMode";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { DemoSessionWarning } from "@/components/DemoSessionWarning";
import { DemoModeStatusBar } from "@/components/DemoModeBanner";
import { useEffect } from "react";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Admin from "@/pages/admin";
import Dashboard from "@/pages/dashboard";
import ProjectDashboard from "@/pages/project-dashboard";
import Tasks from "@/pages/tasks";
import Productivity from "@/pages/productivity";
import CreateProposal from "@/pages/create-proposal";
import CreateInvoice from "@/pages/create-invoice";
import Invoices from "@/pages/invoices";
import InvoiceDetails from "@/pages/invoice-details";
import EditInvoice from "@/pages/edit-invoice";
import Payments from "@/pages/payments";
import CreateContract from "@/pages/create-contract";
import CreatePresentation from "@/pages/create-presentation";
import ClientList from "@/pages/client-list";
import ClientDetails from "@/pages/client-details";
import { MessagesPage } from "@/pages/messages";
import FilingCabinet from "@/pages/filing-cabinet";
import AgencyHub from "@/pages/agency-hub";
import UserManual from "@/pages/user-manual";
import BulkOperations from "@/pages/bulk-operations";
import CustomFields from "@/pages/custom-fields";
import WorkflowAutomation from "@/pages/workflow-automation";
import Onboarding from "@/pages/onboarding";
import NotFound from "@/pages/not-found";
import Test404 from "@/pages/test-404";
import GarageAssistant from "@/pages/garage-assistant";
import Analytics from "@/pages/analytics";
import AIInsights from "@/pages/ai-insights";
import TeamCollaboration from "@/pages/team-collaboration";
import AdvancedReporting from "@/pages/advanced-reporting";
import APIWebhooks from "@/pages/api-webhooks";
import SSOManagement from "@/pages/sso-management";
import PermissionsManagement from "@/pages/permissions-management";
import AuditLogging from "@/pages/audit-logging";
import WhiteLabel from "@/pages/white-label";
import SmartScheduling from "@/pages/smart-scheduling";
import PredictiveAnalytics from "@/pages/predictive-analytics";
import EmailManagement from "@/pages/email-management";
import SlackIntegration from "@/pages/slack-integration";
import PerformanceDashboard from "@/pages/performance-dashboard";
import PayInvoice from "@/pages/pay-invoice";
import PricingTable from "@/components/PricingTable";
import AgentManagement from "@/pages/AgentManagement";
import Settings from "@/pages/settings";
import { CommandPalette } from "@/components/CommandPalette";
import { KeyboardShortcutsGuide } from "@/components/KeyboardShortcutsGuide";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { QuickActionButton } from "@/components/QuickActionButton";

// Mobile Pages
import MobileHome from "@/pages/mobile-home";
import MobileDashboard from "@/pages/mobile-dashboard";
import MobileTasks from "@/pages/mobile-tasks";
import MobileProjects from "@/pages/mobile-projects";
import MobileTimeTracking from "@/pages/mobile-time-tracking";
import MobileWorkflows from "@/pages/mobile-workflows";

function Router() {
  const [location, setLocation] = useLocation();

  // Check if we're on a mobile route - handle these first without authentication
  const isMobileRoute = location.startsWith('/mobile');

  // For mobile routes, show them immediately without any authentication checks
  if (isMobileRoute) {
    return (
      <Switch>
        <Route path="/mobile" component={MobileHome} />
        <Route path="/mobile/dashboard" component={MobileDashboard} />
        <Route path="/mobile/tasks" component={MobileTasks} />
        <Route path="/mobile/projects" component={MobileProjects} />
        <Route path="/mobile/time-tracking" component={MobileTimeTracking} />
        <Route path="/mobile/workflows" component={MobileWorkflows} />
        <Route component={MobileHome} />
      </Switch>
    );
  }

  // Only call useAuth for non-mobile routes
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth();

  // Redirect authenticated users away from login/signup pages
  useEffect(() => {
    if (isAuthenticated && (location === '/login' || location === '/signup')) {
      setLocation('/');
    }
  }, [isAuthenticated, location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/pricing" component={PricingTable} />
        <Route path="/test-404" component={Test404} />
        <Route path="/pay-invoice" component={PayInvoice} />
        <Route component={Landing} />
      </Switch>
    );
  }

  // Check if user needs to complete onboarding
  if (user && !user.hasCompletedOnboarding) {
    return <Onboarding onComplete={() => window.location.reload()} />;
  }

  return (
    <Switch>      
      {/* Desktop Routes */}
      <Route path="/" component={Home} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/productivity" component={Productivity} />
      <Route path="/project/:projectId" component={ProjectDashboard} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/create-proposal" component={CreateProposal} />
      <Route path="/invoices" component={Invoices} />
      <Route path="/invoices/:id" component={InvoiceDetails} />
      <Route path="/create-invoice" component={CreateInvoice} />
      <Route path="/edit-invoice/:id" component={EditInvoice} />
      <Route path="/payments" component={Payments} />
      <Route path="/create-contract" component={CreateContract} />
      <Route path="/create-presentation" component={CreatePresentation} />
      <Route path="/clients" component={ClientList} />
      <Route path="/client/:clientId" component={ClientDetails} />
      <Route path="/filing-cabinet" component={FilingCabinet} />
      <Route path="/agency-hub" component={AgencyHub} />
      <Route path="/user-manual" component={UserManual} />
      <Route path="/bulk-operations" component={BulkOperations} />
      <Route path="/custom-fields" component={CustomFields} />
      <Route path="/workflow-automation" component={WorkflowAutomation} />
      <Route path="/garage-assistant" component={GarageAssistant} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/ai-insights" component={AIInsights} />
      <Route path="/team-collaboration" component={TeamCollaboration} />
      <Route path="/advanced-reporting" component={AdvancedReporting} />
      <Route path="/api-webhooks" component={APIWebhooks} />
      <Route path="/sso-management" component={SSOManagement} />
      <Route path="/permissions-management" component={PermissionsManagement} />
      <Route path="/audit-logging" component={AuditLogging} />
      <Route path="/white-label" component={WhiteLabel} />
      <Route path="/smart-scheduling" component={SmartScheduling} />
      <Route path="/predictive-analytics" component={PredictiveAnalytics} />
      <Route path="/email-management" component={EmailManagement} />
      <Route path="/slack-integration" component={SlackIntegration} />
      <Route path="/performance-dashboard" component={PerformanceDashboard} />
      <Route path="/pricing" component={PricingTable} />
      <Route path="/settings" component={Settings} />
      {isAdmin && <Route path="/admin" component={Admin} />}
      {isAdmin && <Route path="/agent-management" component={AgentManagement} />}
      {isAdmin && <Route path="/dashboard" component={Dashboard} />}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DemoModeProvider>
        <MoodPaletteProvider>
          <TooltipProvider>
            <DemoModeStatusBar />
            <DemoModeBanner />
            <DemoSessionWarning />
            <CommandPalette />
            <KeyboardShortcutsGuide />
            <OfflineIndicator />
            <QuickActionButton />
            <Toaster />
            <Router />
          </TooltipProvider>
        </MoodPaletteProvider>
      </DemoModeProvider>
    </QueryClientProvider>
  );
}

export default App;
```

---

## 9. SERVER INDEX (server/index.ts) - Services Initialization

### Key Services Started:
```typescript
// File: server/index.ts
// Purpose: Fix iOS Safari -1015 by ensuring correct compression/headers and add SPA history fallback for / and /mobile/*.

import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import path from "node:path";
import history from "connect-history-api-fallback";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// --- Security & base middleware ---
app.disable("x-powered-by");
app.use((req, _res, next) => {  // why: consistent UTF-8; avoid stray encodings
  req.headers["accept-charset"] = "utf-8";
  next();
});

// --- Compression disabled for iOS Safari compatibility ---
// why: iOS Safari -1015 errors are caused by compression issues
// Temporarily disable all compression to fix mobile access
// app.use(compression());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// --- Mobile user agent detection ---
function isMobileDevice(userAgent: string): boolean {
  return /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
}

// --- Redirect mobile root -> /mobile (do NOT touch other paths) ---
app.use((req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.headers["user-agent"] || "";
  const desktopForced = req.query.desktop === "true";
  
  if (req.method === "GET" && req.path === "/" && isMobileDevice(userAgent) && !desktopForced) {
    log(`📱 Redirecting mobile browser from ${req.path} to /mobile`);
    return res.redirect(302, "/mobile");
  }
  next();
});

(async () => {
  // --- Diagnostics (BEFORE other routes) ---
  app.get("/health", (_req, res) => {
    // why: quick manual check; Safari -1015 usually indicates encoding mismatch
    res.type("text/plain").send("OK");
  });


  // --- API routes (mounted BEFORE SPA fallback) ---
  const server = await registerRoutes(app);

  // --- Conditionally use Vite (dev) OR static files (prod) ---
  const isProduction = process.env.NODE_ENV === "production";
  
  if (isProduction) {
    log("🚀 Production mode: serving static files");
    serveStatic(app);
  } else {
    log("🔧 Development mode: using Vite middleware");
    await setupVite(app, server);
  }

  // --- SPA History Fallback for client routes (AFTER Vite) ---
  // why: Ensure /mobile and deep links render index.html, but only if Vite didn't handle it
  const historyMiddleware = history({
    verbose: false,
    // Only need to preserve API routes since Vite handles its own routes now
    rewrites: [
      { from: /^\/api\/.*$/, to: (ctx: any) => ctx.parsedUrl.path || "" },
      { from: /^\/health$/, to: (ctx: any) => ctx.parsedUrl.path || "" },
    ],
  });
  app.use(historyMiddleware);

  // --- Global error tracking middleware (LAST - after all other middleware) ---
  app.use((err: any, req: any, res: any, next: any) => {
    const route = req.route?.path || req.originalUrl || 'unknown';
    const status = err.statusCode || err.status || 500;
    const error = err.message || 'Unknown error';
    
    // Log to our error tracker for audit purposes
    if (global.errorTracker) {
      global.errorTracker.logError(route, status, error);
    }
    
    console.error(`[ERROR] ${status} ${req.method} ${route}: ${error}`);
    
    // Only send response if headers haven't been sent, don't call next() after response
    if (!res.headersSent) {
      res.status(status).json({ error: 'Internal server error' });
    }
    // Don't call next(err) after sending response to avoid double handling
  });

  // start the server
  const port = 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();

// NOTE: Remove any manual setting of 'Content-Encoding' or serving precompressed files
// unless the server sets the matching header automatically.```

---

## 10. INSTALLED PACKAGES (package.json)

### Dependencies:
```json
{
  "name": "rest-express",
  "version": "1.0.0",
  "type": "module",
  "license": "MIT",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@google-cloud/storage": "^7.17.0",
    "@hookform/resolvers": "^3.10.0",
    "@jridgewell/trace-mapping": "^0.3.25",
    "@neondatabase/serverless": "^0.10.4",
    "@radix-ui/react-accordion": "^1.2.4",
    "@radix-ui/react-alert-dialog": "^1.1.7",
    "@radix-ui/react-aspect-ratio": "^1.1.3",
    "@radix-ui/react-avatar": "^1.1.4",
    "@radix-ui/react-checkbox": "^1.1.5",
    "@radix-ui/react-collapsible": "^1.1.4",
    "@radix-ui/react-context-menu": "^2.2.7",
    "@radix-ui/react-dialog": "^1.1.7",
    "@radix-ui/react-dropdown-menu": "^2.1.7",
    "@radix-ui/react-hover-card": "^1.1.7",
    "@radix-ui/react-label": "^2.1.3",
    "@radix-ui/react-menubar": "^1.1.7",
    "@radix-ui/react-navigation-menu": "^1.2.6",
    "@radix-ui/react-popover": "^1.1.7",
    "@radix-ui/react-progress": "^1.1.3",
    "@radix-ui/react-radio-group": "^1.2.4",
    "@radix-ui/react-scroll-area": "^1.2.4",
    "@radix-ui/react-select": "^2.1.7",
    "@radix-ui/react-separator": "^1.1.3",
    "@radix-ui/react-slider": "^1.2.4",
    "@radix-ui/react-slot": "^1.2.0",
    "@radix-ui/react-switch": "^1.1.4",
    "@radix-ui/react-tabs": "^1.1.4",
    "@radix-ui/react-toast": "^1.2.7",
    "@radix-ui/react-toggle": "^1.1.3",
    "@radix-ui/react-toggle-group": "^1.1.3",
    "@radix-ui/react-tooltip": "^1.2.0",
    "@sendgrid/mail": "^8.1.5",
    "@slack/web-api": "^7.10.0",
    "@stripe/react-stripe-js": "^3.10.0",
    "@stripe/stripe-js": "^7.9.0",
    "@tanstack/react-query": "^5.60.5",
    "@tiptap/extension-focus": "^3.4.1",
    "@tiptap/extension-placeholder": "^3.4.1",
    "@tiptap/extension-typography": "^3.4.1",
    "@tiptap/react": "^3.4.1",
    "@tiptap/starter-kit": "^3.4.1",
    "@types/bcryptjs": "^2.4.6",
    "@types/compression": "^1.8.1",
    "@types/connect-history-api-fallback": "^1.5.4",
    "@types/memoizee": "^0.4.12",
    "@types/multer": "^2.0.0",
    "@types/puppeteer": "^5.4.7",
    "@uppy/aws-s3": "^5.0.0",
    "@uppy/core": "^5.0.0",
    "@uppy/dashboard": "^5.0.0",
    "@uppy/react": "^5.0.0",
    "adm-zip": "^0.5.16",
    "bcrypt": "^6.0.0",
    "bcryptjs": "^3.0.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "compression": "^1.8.1",
    "connect-history-api-fallback": "^2.0.0",
    "connect-pg-simple": "^10.0.0",
    "crypto": "^1.0.1",
    "csv-parser": "^3.2.0",
    "csv-writer": "^1.6.0",
    "date-fns": "^3.6.0",
    "drizzle-orm": "^0.39.1",
    "drizzle-zod": "^0.7.0",
    "embla-carousel-react": "^8.6.0",
    "express": "^4.21.2",
    "express-session": "^1.18.2",
    "file-type": "^21.0.0",
    "framer-motion": "^11.13.1",
    "html2canvas": "^1.4.1",
    "input-otp": "^1.4.2",
    "jsonwebtoken": "^9.0.2",
    "jspdf": "^3.0.2",
    "lucide-react": "^0.453.0",
    "memoizee": "^0.4.17",
    "memorystore": "^1.6.7",
    "moment": "^2.30.1",
    "multer": "^2.0.2",
    "next-themes": "^0.4.6",
    "node-forge": "^1.3.1",
    "openai": "^5.19.1",
    "openid-client": "^6.7.1",
    "passport": "^0.7.0",
    "passport-azure-ad": "^4.3.5",
    "passport-google-oauth20": "^2.0.0",
    "passport-local": "^1.0.0",
    "passport-oauth2": "^1.8.0",
    "passport-saml": "^3.2.4",
    "puppeteer": "^24.17.0",
    "react": "^18.3.1",
    "react-big-calendar": "^1.19.4",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.55.0",
    "react-icons": "^5.4.0",
    "react-resizable-panels": "^2.1.7",
    "recharts": "^2.15.4",
    "saml2-js": "^4.0.4",
    "simple-peer": "^9.11.1",
    "socket.io": "^4.8.1",
    "socket.io-client": "^4.8.1",
    "stripe": "^18.5.0",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "tw-animate-css": "^1.2.5",
    "twilio": "^5.8.0",
    "vaul": "^1.1.2",
    "webrtc-adapter": "^9.0.3",
    "wouter": "^3.3.5",
    "ws": "^8.18.3",
    "xml2js": "^0.6.2",
    "y-websocket": "^3.0.0",
    "yjs": "^13.6.27",
    "zod": "^3.24.2",
    "zod-validation-error": "^3.4.0"
  },
  "devDependencies": {
    "@replit/vite-plugin-cartographer": "^0.4.1",
    "@replit/vite-plugin-runtime-error-modal": "^0.0.3",
    "@tailwindcss/typography": "^0.5.15",
    "@tailwindcss/vite": "^4.1.3",
    "@types/connect-pg-simple": "^7.0.3",
    "@types/express": "4.17.21",
    "@types/express-session": "^1.18.2",
    "@types/node": "20.16.11",
    "@types/passport": "^1.0.16",
    "@types/passport-local": "^1.0.38",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "@types/ws": "^8.18.1",
    "@vitejs/plugin-react": "^4.3.2",
    "autoprefixer": "^10.4.20",
    "drizzle-kit": "^0.30.4",
    "esbuild": "^0.25.0",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.17",
    "tsx": "^4.19.1",
    "typescript": "5.6.3",
    "vite": "^5.4.19"
  },
  "optionalDependencies": {
    "bufferutil": "^4.0.8"
  }
}
```

---

## 11. KEY FEATURE IMPLEMENTATIONS

### Command Palette (client/src/components/CommandPalette.tsx):
```typescript
import { useEffect, useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Clock,
  FileText,
  Users,
  Folder,
  Mail,
  Plus,
  Play,
  Pause,
  DollarSign,
  FileSignature,
  Home,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Zap,
  Calendar,
  Archive,
  Bot,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Task, Project, Client, Invoice, TimeLog } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface RecentPage {
  title: string;
  url: string;
  iconName: string; // Store icon identifier instead of React node
  timestamp: number;
}

// Icon mapping for rehydration
const iconMap: Record<string, React.ReactNode> = {
  Clock: <Clock className="h-4 w-4" />,
  FileText: <FileText className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  Folder: <Folder className="h-4 w-4" />,
  Plus: <Plus className="h-4 w-4" />,
  FileSignature: <FileSignature className="h-4 w-4" />,
  Home: <Home className="h-4 w-4" />,
  BarChart3: <BarChart3 className="h-4 w-4" />,
  DollarSign: <DollarSign className="h-4 w-4" />,
  Archive: <Archive className="h-4 w-4" />,
  Zap: <Zap className="h-4 w-4" />,
  Bot: <Bot className="h-4 w-4" />,
  TrendingUp: <TrendingUp className="h-4 w-4" />,
  Settings: <Settings className="h-4 w-4" />,
};

interface SearchResult {
  id: string;
  type: "task" | "project" | "client" | "invoice";
  title: string;
  description?: string;
  url: string;
  metadata?: {
    status?: string;
    priority?: string;
    dueDate?: string;
  };
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const [recentPages, setRecentPages] = useState<RecentPage[]>([]);

  // Fetch all data for search
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    enabled: open,
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: open,
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
... (truncated for brevity - full file exists)
```

### Settings Page (client/src/pages/settings.tsx):
```typescript
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  User,
  Bell,
  Palette,
  Key,
  Download,
  Trash2,
  Mail,
  Smartphone,
  Globe,
  Shield,
  Database,
  Zap,
  Save,
  AlertCircle,
  Check,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");

  // Preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [taskReminders, setTaskReminders] = useState(true);
  const [invoiceAlerts, setInvoiceAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [quietHoursStart, setQuietHoursStart] = useState("22:00");
  const [quietHoursEnd, setQuietHoursEnd] = useState("08:00");
  const [timezone, setTimezone] = useState("America/New_York");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [timeFormat, setTimeFormat] = useState("12h");

  // Account settings
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return apiRequest("POST", "/api/user/update-password", data);
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    },
  });

  // Save preferences mutation
  const savePreferencesMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/user/preferences", data);
    },
    onSuccess: () => {
      toast({
        title: "Preferences saved",
        description: "Your preferences have been updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save preferences",
        variant: "destructive",
      });
    },
  });

  // Export data mutation
... (truncated for brevity - full file exists)
```

### Agent Management (client/src/pages/AgentManagement.tsx):
```typescript
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Download, RefreshCw, Calendar, Target, Users, Eye, EyeOff, TrendingUp, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import type { Agent, AgentVisibilityFlag, AgentGraduationPlan, AgentKpi } from "@shared/schema";
import { useHubFlags, promoteAgentToHub, ADMIN_WRITE } from "@/hooks/use-hub-flags";

interface AgentWithDetails extends Agent {
  visibilityFlag?: AgentVisibilityFlag | null;
  graduationPlan?: AgentGraduationPlan | null;
  kpi?: AgentKpi | null;
}

export default function AgentManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [externalToolIds, setExternalToolIds] = useState<Record<string, string>>({});
  const [promotingAgent, setPromotingAgent] = useState<string | null>(null);

  const { data: agents, isLoading } = useQuery<AgentWithDetails[]>({
    queryKey: ["/api/agents"],
  });

  const { data: kpis } = useQuery<AgentKpi[]>({
    queryKey: ["/api/agents/kpis"],
  });

  const { data: hubFlags, loading: hubLoading, error: hubError, refresh: refreshHub } = useHubFlags(5000);

  const importDataMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/agents/import-data", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Import failed");
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Data imported successfully",
        description: `Imported ${data.agents} agents, ${data.visibilityFlags} visibility flags, and ${data.graduationPlans} graduation plans`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
    },
    onError: () => {
      toast({
        title: "Import failed",
        description: "Failed to import agent data",
        variant: "destructive",
      });
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ agentId, field, value }: { agentId: string; field: string; value: boolean }) => {
      const agent = agents?.find((a) => a.id === agentId);
      if (!agent) return;

      const updateData: any = {
        exposeToUsers: agent.visibilityFlag?.exposeToUsers || false,
        dashboardCard: agent.visibilityFlag?.dashboardCard || false,
      };
      updateData[field] = value;

      const response = await fetch(`/api/agents/${agentId}/visibility`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error("Failed to update visibility");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Visibility updated",
        description: "Agent visibility settings have been updated",
      });
    },
  });

  const handlePromote = async (agentId: string) => {
    setPromotingAgent(agentId);
    const agentName = agents?.find(a => a.id === agentId)?.name || agentId;
    const externalToolId = externalToolIds[agentId]?.trim() || undefined;
    
    try {
      const response = await fetch(`/api/agents/${agentId}/promote`, {
        method: "POST",
        credentials: "include",
... (truncated for brevity - full file exists)
```

### Switchboard Service (server/switchboard-service.ts):
```typescript
import { storage } from "./storage";

export interface SwitchboardConfig {
  // Graduation criteria thresholds
  minOnTimeMilestoneRate: number;
  maxGateEscapeRate: number;
  maxIncidentCount30d: number;
  
  // Auto-promotion settings
  enableAutoPromotion: boolean;
  checkIntervalMinutes: number;
}

const DEFAULT_CONFIG: SwitchboardConfig = {
  minOnTimeMilestoneRate: 0.95,  // 95% on-time delivery
  maxGateEscapeRate: 0.01,       // ≤ 1% gate escapes
  maxIncidentCount30d: 0,        // Zero incidents
  enableAutoPromotion: true,
  checkIntervalMinutes: 60,      // Check every hour
};

export class SwitchboardService {
  private config: SwitchboardConfig;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(config: Partial<SwitchboardConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start the switchboard service
   */
  start(): void {
    if (this.intervalId) {
      console.log("🔄 Switchboard service already running");
      return;
    }

    console.log(`🚀 Starting Switchboard service (check interval: ${this.config.checkIntervalMinutes}min)`);
    
    // Run immediately on start
    this.evaluateAgents();

    // Then run periodically
    this.intervalId = setInterval(
      () => this.evaluateAgents(),
      this.config.checkIntervalMinutes * 60 * 1000
    );

    console.log("✅ Switchboard service started");
  }

  /**
   * Stop the switchboard service
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("⏹️  Switchboard service stopped");
    }
  }

  /**
   * Manually trigger agent evaluation
   */
  async evaluateAgents(): Promise<{
    evaluated: number;
    promoted: number;
    errors: number;
  }> {
    console.log("🔍 Switchboard: Evaluating agents for graduation...");
    
    const stats = {
      evaluated: 0,
      promoted: 0,
      errors: 0,
    };

    try {
      const agents = await storage.getAgents();
      const kpis = await storage.getAgentKpis();
      
      for (const agent of agents) {
        stats.evaluated++;
        
        try {
          // Get KPI for this agent
          const kpi = kpis.find(k => k.agentId === agent.id);
          
          if (!kpi) {
            continue; // No KPI data yet
          }

          // Check if agent meets graduation criteria
          const meetsGraduationCriteria = this.checkGraduationCriteria(kpi);
          
          if (!meetsGraduationCriteria) {
            continue; // Does not meet criteria
          }

          // Check if already exposed to users
          const visibilityFlag = await storage.getAgentVisibilityFlag(agent.id);
          if (visibilityFlag?.exposeToUsers) {
            continue; // Already promoted
          }

          // Auto-promote if enabled
          if (this.config.enableAutoPromotion) {
            await this.promoteAgent(agent.id);
            stats.promoted++;
            console.log(`✅ Switchboard: Auto-promoted ${agent.name} (${agent.id})`);
          } else {
            console.log(`📊 Switchboard: ${agent.name} (${agent.id}) ready for promotion (auto-promotion disabled)`);
          }
        } catch (error) {
          console.error(`❌ Switchboard: Error evaluating agent ${agent.id}:`, error);
          stats.errors++;
        }
      }

      console.log(`✅ Switchboard evaluation complete:`, stats);
      return stats;
    } catch (error: any) {
      // Handle database schema not ready error gracefully
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.log("⏸️  Switchboard: Database tables not yet created. Skipping evaluation until tables are initialized.");
        console.log("💡 Run the agent data import to create required tables.");
      } else {
        console.error("❌ Switchboard: Fatal error during evaluation:", error);
        stats.errors++;
      }
      return stats;
    }
  }

  /**
   * Check if KPI metrics meet graduation criteria
   */
  private checkGraduationCriteria(kpi: any): boolean {
    const onTimeMilestoneRate = parseFloat(kpi.onTimeMilestoneRate);
    const gateEscapeRate = parseFloat(kpi.gateEscapeRate);
    const incidentCount = parseInt(kpi.incidentCount30d);

    return (
      onTimeMilestoneRate >= this.config.minOnTimeMilestoneRate &&
      gateEscapeRate <= this.config.maxGateEscapeRate &&
      incidentCount <= this.config.maxIncidentCount30d
    );
  }

  /**
   * Promote an agent (enable visibility flags and mark graduation complete)
   */
  private async promoteAgent(agentId: string): Promise<void> {
    // Update visibility flags
    const existingFlag = await storage.getAgentVisibilityFlag(agentId);
    
    if (existingFlag) {
      await storage.updateAgentVisibilityFlag(agentId, {
        exposeToUsers: true,
        dashboardCard: true,
      });
    } else {
      await storage.createAgentVisibilityFlag({
        agentId,
        exposeToUsers: true,
        dashboardCard: true,
      });
    }

    // Mark graduation plan as completed
    const graduationPlan = await storage.getAgentGraduationPlan(agentId);
    if (graduationPlan && !graduationPlan.completedAt) {
      await storage.updateAgentGraduationPlan(graduationPlan.id, {
        completedAt: new Date(),
      });
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): SwitchboardConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SwitchboardConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Restart service if interval changed
    if (config.checkIntervalMinutes && this.intervalId) {
      this.stop();
      this.start();
    }
  }
}

// Export singleton instance
export const switchboard = new SwitchboardService();
```

---

## 12. INTEGRATIONS STATUS

### Configured Integrations (from View):
- javascript_stripe==1.0.0 (NEEDS SETUP)
- javascript_database==1.0.0 (NEEDS SETUP)  
- javascript_websocket==1.0.0 (NEEDS SETUP)
- javascript_object_storage==1.0.0 (NEEDS SETUP)
- javascript_openai==1.0.0 (NEEDS SETUP)
- javascript_log_in_with_replit==1.0.0 (NEEDS SETUP)
- javascript_slack==1.0.0 (NEEDS SETUP)

### Environment Variables Required:
- SENDGRID_API_KEY (for email notifications)
- TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER (for SMS)
- OPENAI_API_KEY (for AI content generation)
- STRIPE_SECRET_KEY (for payments)
- DATABASE_URL (PostgreSQL connection)

---

## 13. WORKFLOW STATUS (from latest logs)

### Current Workflow Output:
- Server running on port 5000
- Switchboard service: ✅ Evaluating 6 agents (promoted: 0, errors: 0)
- Cache warming: ✅ Completed successfully
- Smart notifications: ✅ Processing complete (5 rules, 0 notifications)
- Automated invoicing: ✅ Complete (0 recurring, 0 auto-generated)
- Demo session service: ✅ Initialized (45min sessions)
- Team collaboration: ✅ WebSocket support enabled

### Services Initialized:
- /tmp/logs/Start_application_20251103_033035_124.log:🚀 Collaboration service initialized with WebSocket support
- /tmp/logs/Start_application_20251103_033035_124.log:✅ Collaboration service initialized successfully
- /tmp/logs/Start_application_20251103_033559_179.log:🔗 Webhook service initialized
- /tmp/logs/Start_application_20251103_033559_179.log:🏢 White-label service initialized
- /tmp/logs/Start_application_20251103_033559_179.log:🔐 SSO service initialized
- /tmp/logs/Start_application_20251103_033559_179.log:🔐 Permissions service initialized
- /tmp/logs/Start_application_20251103_033559_179.log:📋 Audit service initialized
- /tmp/logs/Start_application_20251103_033559_179.log:🔐 Encryption service initialized
- /tmp/logs/Start_application_20251103_033559_179.log:🌍 Internationalization service initialized
- /tmp/logs/Start_application_20251103_033559_179.log:🤖 Smart Scheduling service initialized
- /tmp/logs/Start_application_20251103_033559_179.log:🔮 Predictive Analytics service initialized
- /tmp/logs/Start_application_20251103_033559_179.log:🚀 Cache service initialized
- /tmp/logs/Start_application_20251103_033559_179.log:📊 Performance monitor initialized for development environment
- /tmp/logs/Start_application_20251103_033559_179.log:🌐 CDN service initialized
- /tmp/logs/Start_application_20251103_033559_179.log:🗄️  Database optimizer initialized
- /tmp/logs/Start_application_20251103_033559_179.log:⚖️ Load balancer initialized
- /tmp/logs/Start_application_20251103_033559_179.log:🚀 Starting background services...
- /tmp/logs/Start_application_20251103_033559_179.log:🚀 Starting automated invoice status monitoring
- /tmp/logs/Start_application_20251103_033559_179.log:🚀 Starting automated invoicing service
- /tmp/logs/Start_application_20251103_033559_179.log:🚀 Starting smart notifications service
- /tmp/logs/Start_application_20251103_033559_179.log:🚀 Starting automated contract monitoring
- /tmp/logs/Start_application_20251103_033559_179.log:✅ Demo Session Service initialized with 45min sessions, 5min cleanup interval
- /tmp/logs/Start_application_20251103_033559_179.log:🚀 Starting cache warming service...
- /tmp/logs/Start_application_20251103_033559_179.log:🚀 Cache warming service initialized
- /tmp/logs/Start_application_20251103_033559_179.log:🚀 Starting cache warming...
- /tmp/logs/Start_application_20251103_033559_179.log:🚀 Starting Switchboard service...
- /tmp/logs/Start_application_20251103_033559_179.log:🚀 Starting Switchboard service (check interval: 60min)
- /tmp/logs/Start_application_20251103_033559_179.log:✅ Switchboard service started
- /tmp/logs/Start_application_20251103_033559_179.log:🚀 Collaboration service initialized with WebSocket support
- /tmp/logs/Start_application_20251103_033559_179.log:✅ Collaboration service initialized successfully

---

## 14. AUDIT INSTRUCTIONS FOR CHATGPT

### Audit Methodology:
Please analyze this codebase export and categorize EVERY feature into these 4 buckets:

**1. ✅ IMPLEMENTED & WORKING CORRECTLY**
- Feature is complete, functional, and meets the design specifications
- Code exists and appears properly integrated
- No obvious bugs or missing critical pieces

**2. ⚠️ IMPLEMENTED BUT NOT AS DESIGNED/EXPECTED**
- Feature exists but has issues, incomplete parts, or doesn't match specifications
- Partially implemented or missing key functionality
- Present but not fully working as intended

**3. ❌ IMPLEMENTED BUT NOT WORKING**
- Code exists but is broken, has critical bugs, or non-functional
- Integration errors or missing dependencies preventing operation

**4. 🚫 NOT IMPLEMENTED**
- Feature mentioned in specifications but no code exists
- Completely missing from codebase

### Features to Audit:

#### Core Features (from Requirements):
1. Time Tracking (comprehensive with project allocation and reporting)
2. Workflow Automation (custom rules with visual builder)
3. AI Content Generation (GPT-4o for proposals/content)
4. Invoice Builder (with auto-fill functionality)
5. Task Management (priority, dates, assignments, notes, attachments, URLs, reminders, subtasks, dependency prevention)
6. Agent KPI Tracking (monitoring with graduation and Hub API sync)
7. Pricing & Feature Flags (environment-aware, three-tier matrix)
8. Email Notifications (SendGrid for high-priority tasks)
9. SMS Notifications (Twilio integration)
10. User Management (multi-user auth, roles, onboarding, admin dashboard)

#### UI/UX Features (Recent):
11. Command Palette (Cmd+K with search and actions)
12. Settings Page (5 sections: Account, Notifications, Appearance, Integrations, Data)
13. Keyboard Shortcuts Guide (? key overlay)
14. Quick Action Button (FAB in bottom-right)
15. Offline Mode Indicator
16. Empty States Component

#### Additional Features (from pages/services):
17. Client Management
18. Project Management  
19. Presentations
20. Contracts
21. Templates
22. Proposals
23. Payments/Stripe Integration
24. Analytics Dashboard
25. Productivity Dashboard
26. Team Collaboration (WebSocket chat)
27. Filing Cabinet (document management)
28. Demo Sessions
29. White Label
30. SSO Management
31. Permissions/Role Management
32. Audit Logging
33. API/Webhooks
34. Advanced Reporting
35. Predictive Analytics
36. Smart Scheduling
37. Email Management
38. Slack Integration
39. Object Storage (file uploads)
40. Mobile Views (dashboard, tasks, time tracking, projects, workflows)

### Output Format:

For each feature, provide:
```
## [Feature Name]
**Status:** [1/2/3/4] [Icon] [Category Name]
**Evidence:** [File paths, code snippets, or observations]
**Explanation:** [Why you categorized it this way]
**Issues (if 2-3):** [What's wrong, missing, or broken]
**Recommendation:** [What needs to be done]
```

### Summary Statistics:
At the end, provide:
- Total features audited: X
- ✅ Working correctly: X (Y%)
- ⚠️ Partial/issues: X (Y%)
- ❌ Broken: X (Y%)  
- 🚫 Missing: X (Y%)

### Critical Assessment:
- Overall build quality (1-10)
- Most concerning gaps
- Top 5 priorities to fix
- Production readiness assessment

---

## 15. FILE SIZE INFORMATION

 14056 total

Total project files:
713

---
END OF EXPORT - Ready for ChatGPT Audit
Generated: Mon Nov  3 03:46:08 AM UTC 2025
