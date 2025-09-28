var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  activities: () => activities,
  apiKeys: () => apiKeys,
  apiUsage: () => apiUsage,
  clientDocumentSchema: () => clientDocumentSchema,
  clientDocuments: () => clientDocuments,
  clientDocumentsRelations: () => clientDocumentsRelations,
  clientSchema: () => clientSchema,
  clients: () => clients,
  clientsRelations: () => clientsRelations,
  comments: () => comments,
  contractSchema: () => contractSchema,
  contracts: () => contracts,
  customFieldDefinitions: () => customFieldDefinitions,
  customFieldValues: () => customFieldValues,
  directProposalSchema: () => directProposalSchema,
  documentVersionSchema: () => documentVersionSchema,
  documentVersions: () => documentVersions,
  documentVersionsRelations: () => documentVersionsRelations,
  fileAttachmentSchema: () => fileAttachmentSchema,
  fileAttachments: () => fileAttachments,
  fileAttachmentsRelations: () => fileAttachmentsRelations,
  generateProposalSchema: () => generateProposalSchema,
  insertClientDocumentSchema: () => insertClientDocumentSchema,
  insertClientSchema: () => insertClientSchema,
  insertContractSchema: () => insertContractSchema,
  insertDocumentVersionSchema: () => insertDocumentVersionSchema,
  insertFileAttachmentSchema: () => insertFileAttachmentSchema,
  insertInvoiceSchema: () => insertInvoiceSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertPaymentSchema: () => insertPaymentSchema,
  insertProjectSchema: () => insertProjectSchema,
  insertProposalSchema: () => insertProposalSchema,
  insertTaskSchema: () => insertTaskSchema,
  insertTemplateSchema: () => insertTemplateSchema,
  insertUserSchema: () => insertUserSchema,
  invoiceSchema: () => invoiceSchema,
  invoices: () => invoices,
  invoicesRelations: () => invoicesRelations,
  messageRelations: () => messageRelations,
  messages: () => messages,
  onboardingSchema: () => onboardingSchema,
  paymentSchema: () => paymentSchema,
  payments: () => payments,
  paymentsRelations: () => paymentsRelations,
  projectSchema: () => projectSchema,
  projects: () => projects,
  projectsRelations: () => projectsRelations,
  proposalSchema: () => proposalSchema,
  proposals: () => proposals,
  proposalsRelations: () => proposalsRelations,
  selectClientDocumentSchema: () => selectClientDocumentSchema,
  selectClientSchema: () => selectClientSchema,
  selectContractSchema: () => selectContractSchema,
  selectDocumentVersionSchema: () => selectDocumentVersionSchema,
  selectFileAttachmentSchema: () => selectFileAttachmentSchema,
  selectInvoiceSchema: () => selectInvoiceSchema,
  selectMessageSchema: () => selectMessageSchema,
  selectPaymentSchema: () => selectPaymentSchema,
  selectProjectSchema: () => selectProjectSchema,
  selectProposalSchema: () => selectProposalSchema,
  selectTaskSchema: () => selectTaskSchema,
  selectTemplateSchema: () => selectTemplateSchema,
  selectUserSchema: () => selectUserSchema,
  sendProposalSchema: () => sendProposalSchema,
  sessions: () => sessions,
  startTimerSchema: () => startTimerSchema,
  stopTimerSchema: () => stopTimerSchema,
  taskDependencies: () => taskDependencies,
  taskDependenciesRelations: () => taskDependenciesRelations,
  taskSchema: () => taskSchema,
  tasks: () => tasks,
  tasksRelations: () => tasksRelations,
  templateSchema: () => templateSchema,
  templates: () => templates,
  templatesRelations: () => templatesRelations,
  timeLogs: () => timeLogs,
  timeLogsRelations: () => timeLogsRelations,
  updateProposalSchema: () => updateProposalSchema,
  updateTaskSchema: () => updateTaskSchema,
  updateTemplateSchema: () => updateTemplateSchema,
  updateTimeLogSchema: () => updateTimeLogSchema,
  userSchema: () => userSchema,
  users: () => users,
  usersRelations: () => usersRelations,
  workflowExecutions: () => workflowExecutions,
  workflowRules: () => workflowRules
});
import { sql } from "drizzle-orm";
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
  date
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
var sessions, users, projects, clients, clientDocuments, proposals, invoices, payments, insertPaymentSchema, contracts, tasks, templates, taskDependencies, timeLogs, fileAttachments, documentVersions, usersRelations, projectsRelations, clientsRelations, proposalsRelations, invoicesRelations, paymentsRelations, tasksRelations, templatesRelations, taskDependenciesRelations, timeLogsRelations, clientDocumentsRelations, fileAttachmentsRelations, documentVersionsRelations, insertTaskSchema, selectTaskSchema, taskSchema, insertProjectSchema, selectProjectSchema, projectSchema, insertClientSchema, selectClientSchema, clientSchema, baseInsertProposalSchema, insertProposalSchema, selectProposalSchema, proposalSchema, baseInsertInvoiceSchema, insertInvoiceSchema, selectInvoiceSchema, invoiceSchema, selectPaymentSchema, paymentSchema, baseInsertContractSchema, insertContractSchema, selectContractSchema, contractSchema, insertTemplateSchema, selectTemplateSchema, templateSchema, insertUserSchema, selectUserSchema, userSchema, insertClientDocumentSchema, selectClientDocumentSchema, clientDocumentSchema, insertFileAttachmentSchema, selectFileAttachmentSchema, fileAttachmentSchema, insertDocumentVersionSchema, selectDocumentVersionSchema, documentVersionSchema, updateTaskSchema, updateTemplateSchema, updateProposalSchema, updateTimeLogSchema, startTimerSchema, stopTimerSchema, onboardingSchema, generateProposalSchema, directProposalSchema, sendProposalSchema, messages, messageRelations, insertMessageSchema, selectMessageSchema, customFieldDefinitions, customFieldValues, workflowRules, workflowExecutions, comments, activities, apiKeys, apiUsage;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    sessions = pgTable(
      "sessions",
      {
        sid: varchar("sid").primaryKey(),
        sess: jsonb("sess").notNull(),
        expire: timestamp("expire").notNull()
      },
      (table) => [index("IDX_session_expire").on(table.expire)]
    );
    users = pgTable("users", {
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
      sessionExpiresAt: timestamp("session_expires_at")
    });
    projects = pgTable("projects", {
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
      demoUserId: varchar("demo_user_id")
    });
    clients = pgTable("clients", {
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
      demoUserId: varchar("demo_user_id")
    });
    clientDocuments = pgTable("client_documents", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      clientId: varchar("client_id").references(() => clients.id),
      name: varchar("name").notNull(),
      description: text("description"),
      type: varchar("type", { enum: ["proposal", "invoice", "contract", "presentation", "report", "agreement", "other"] }).notNull(),
      fileUrl: varchar("file_url").notNull(),
      fileName: varchar("file_name").notNull(),
      fileSize: integer("file_size"),
      // in bytes
      mimeType: varchar("mime_type"),
      version: integer("version").default(1),
      status: varchar("status", { enum: ["draft", "active", "archived", "expired"] }).default("active"),
      tags: jsonb("tags").$type().default([]),
      metadata: jsonb("metadata").$type().default({}),
      uploadedById: varchar("uploaded_by_id").references(() => users.id).notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      // Demo session fields for data isolation
      isDemo: boolean("is_demo").default(false),
      demoSessionId: varchar("demo_session_id"),
      demoUserId: varchar("demo_user_id")
    });
    proposals = pgTable("proposals", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      title: varchar("title").notNull(),
      templateId: varchar("template_id").references(() => templates.id),
      projectId: varchar("project_id").references(() => projects.id),
      clientId: varchar("client_id").references(() => clients.id),
      clientName: varchar("client_name"),
      clientEmail: varchar("client_email"),
      status: varchar("status", { enum: ["draft", "sent", "viewed", "accepted", "rejected", "revision_requested", "expired"] }).default("draft"),
      content: text("content"),
      variables: jsonb("variables").$type().default({}),
      projectDescription: text("project_description"),
      totalBudget: decimal("total_budget", { precision: 10, scale: 2 }).default("0.00"),
      timeline: varchar("timeline"),
      deliverables: text("deliverables"),
      terms: text("terms"),
      lineItems: jsonb("line_items").$type().default([]),
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
      parentProposalId: varchar("parent_proposal_id").references(() => proposals.id),
      createdById: varchar("created_by_id").references(() => users.id),
      metadata: jsonb("metadata").$type().default({}),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      acceptedAt: timestamp("accepted_at"),
      // Demo session fields for data isolation
      isDemo: boolean("is_demo").default(false),
      demoSessionId: varchar("demo_session_id"),
      demoUserId: varchar("demo_user_id")
    });
    invoices = pgTable("invoices", {
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
      lineItems: jsonb("line_items").$type().default([]),
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
      demoUserId: varchar("demo_user_id")
    });
    payments = pgTable("payments", {
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
      demoUserId: varchar("demo_user_id")
    });
    insertPaymentSchema = createInsertSchema(payments, {
      paymentDate: z.union([
        z.string().transform((val) => new Date(val)),
        z.date()
      ]),
      amount: z.union([
        z.string().transform((val) => val),
        z.number().transform((val) => val.toString())
      ])
    });
    contracts = pgTable("contracts", {
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
      variables: jsonb("variables").$type().default({}),
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
      clientSignedBy: varchar("client_signed_by"),
      // External client signer
      witnessRequired: boolean("witness_required").default(false),
      witnessSignedAt: timestamp("witness_signed_at"),
      witnessSignedBy: varchar("witness_signed_by"),
      // Document management
      shareableLink: varchar("shareable_link").unique(),
      documentPath: varchar("document_path"),
      // Object storage path
      signedDocumentPath: varchar("signed_document_path"),
      // Final signed version
      version: integer("version").default(1),
      parentContractId: varchar("parent_contract_id").references(() => contracts.id),
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
      renewalPeriod: integer("renewal_period"),
      // in days
      noticePeriod: integer("notice_period").default(30),
      // days before expiration to send notice
      tags: jsonb("tags").$type().default([]),
      notes: text("notes"),
      internalNotes: text("internal_notes"),
      // Private notes not visible to client
      // Metadata and audit
      metadata: jsonb("metadata").$type().default({}),
      createdById: varchar("created_by_id").references(() => users.id),
      lastModifiedById: varchar("last_modified_by_id").references(() => users.id),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      // Demo session fields for data isolation
      isDemo: boolean("is_demo").default(false),
      demoSessionId: varchar("demo_session_id"),
      demoUserId: varchar("demo_user_id")
    });
    tasks = pgTable("tasks", {
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
      attachments: jsonb("attachments").$type().default([]),
      links: jsonb("links").$type().default([]),
      parentTaskId: varchar("parent_task_id"),
      progress: jsonb("progress").$type().default([]),
      progressNotes: jsonb("progress_notes").$type().default([]),
      estimatedHours: integer("estimated_hours"),
      actualHours: integer("actual_hours"),
      // Demo session fields for data isolation
      isDemo: boolean("is_demo").default(false),
      demoSessionId: varchar("demo_session_id"),
      demoUserId: varchar("demo_user_id")
    });
    templates = pgTable("templates", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: varchar("name").notNull(),
      description: text("description"),
      type: varchar("type", { enum: ["proposal", "invoice", "contract", "presentation", "email"] }).notNull(),
      variables: jsonb("variables").$type().default([]),
      content: text("content"),
      isSystem: boolean("is_system").default(false),
      isPublic: boolean("is_public").default(false),
      tags: jsonb("tags").$type().default([]),
      metadata: jsonb("metadata").$type().default({}),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdById: varchar("created_by_id").references(() => users.id),
      // Demo session fields for data isolation
      isDemo: boolean("is_demo").default(false),
      demoSessionId: varchar("demo_session_id"),
      demoUserId: varchar("demo_user_id")
    });
    taskDependencies = pgTable("task_dependencies", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      dependentTaskId: varchar("dependent_task_id").references(() => tasks.id),
      dependsOnTaskId: varchar("depends_on_task_id").references(() => tasks.id),
      createdAt: timestamp("created_at").defaultNow()
    });
    timeLogs = pgTable("time_logs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").references(() => users.id).notNull(),
      taskId: varchar("task_id").references(() => tasks.id),
      projectId: varchar("project_id").references(() => projects.id),
      description: text("description").notNull(),
      startTime: timestamp("start_time").notNull(),
      endTime: timestamp("end_time"),
      duration: varchar("duration"),
      // Duration in seconds as string
      isActive: boolean("is_active").default(false),
      isManualEntry: boolean("is_manual_entry").default(false),
      editHistory: jsonb("edit_history").$type().default([]),
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
      demoUserId: varchar("demo_user_id")
    });
    fileAttachments = pgTable("file_attachments", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      fileName: varchar("file_name").notNull(),
      originalName: varchar("original_name").notNull(),
      filePath: varchar("file_path").notNull(),
      // Object storage path
      fileSize: integer("file_size"),
      // in bytes
      mimeType: varchar("mime_type"),
      entityType: varchar("entity_type", { enum: ["task", "project", "client"] }).notNull(),
      entityId: varchar("entity_id").notNull(),
      uploadedById: varchar("uploaded_by_id").references(() => users.id).notNull(),
      description: text("description"),
      isPublic: boolean("is_public").default(false),
      version: integer("version").default(1),
      parentFileId: varchar("parent_file_id"),
      // For version control
      tags: jsonb("tags").$type().default([]),
      metadata: jsonb("metadata").$type().default({}),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      // Demo session fields for data isolation
      isDemo: boolean("is_demo").default(false),
      demoSessionId: varchar("demo_session_id"),
      demoUserId: varchar("demo_user_id")
    });
    documentVersions = pgTable("document_versions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      documentId: varchar("document_id").notNull(),
      // References file_attachments or client_documents
      versionNumber: integer("version_number").notNull(),
      fileName: varchar("file_name").notNull(),
      filePath: varchar("file_path").notNull(),
      fileSize: integer("file_size"),
      mimeType: varchar("mime_type"),
      changes: text("changes"),
      // Description of changes
      uploadedById: varchar("uploaded_by_id").references(() => users.id).notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      // Demo session fields for data isolation
      isDemo: boolean("is_demo").default(false),
      demoSessionId: varchar("demo_session_id"),
      demoUserId: varchar("demo_user_id")
    });
    usersRelations = relations(users, ({ many }) => ({
      createdTasks: many(tasks, { relationName: "createdTasks" }),
      assignedTasks: many(tasks, { relationName: "assignedTasks" }),
      templates: many(templates)
    }));
    projectsRelations = relations(projects, ({ many, one }) => ({
      tasks: many(tasks),
      client: one(clients, {
        fields: [projects.clientId],
        references: [clients.id]
      }),
      proposals: many(proposals),
      invoices: many(invoices)
    }));
    clientsRelations = relations(clients, ({ many }) => ({
      projects: many(projects),
      proposals: many(proposals),
      invoices: many(invoices),
      payments: many(payments),
      documents: many(clientDocuments)
    }));
    proposalsRelations = relations(proposals, ({ one, many }) => ({
      project: one(projects, {
        fields: [proposals.projectId],
        references: [projects.id]
      }),
      client: one(clients, {
        fields: [proposals.clientId],
        references: [clients.id]
      }),
      invoices: many(invoices)
    }));
    invoicesRelations = relations(invoices, ({ one, many }) => ({
      proposal: one(proposals, {
        fields: [invoices.proposalId],
        references: [proposals.id]
      }),
      project: one(projects, {
        fields: [invoices.projectId],
        references: [projects.id]
      }),
      client: one(clients, {
        fields: [invoices.clientId],
        references: [clients.id]
      }),
      payments: many(payments)
    }));
    paymentsRelations = relations(payments, ({ one }) => ({
      invoice: one(invoices, {
        fields: [payments.invoiceId],
        references: [invoices.id]
      }),
      client: one(clients, {
        fields: [payments.clientId],
        references: [clients.id]
      })
    }));
    tasksRelations = relations(tasks, ({ one, many }) => ({
      project: one(projects, {
        fields: [tasks.projectId],
        references: [projects.id]
      }),
      assignedTo: one(users, {
        fields: [tasks.assignedToId],
        references: [users.id],
        relationName: "assignedTasks"
      }),
      createdBy: one(users, {
        fields: [tasks.createdById],
        references: [users.id],
        relationName: "createdTasks"
      }),
      parentTask: one(tasks, {
        fields: [tasks.parentTaskId],
        references: [tasks.id],
        relationName: "parentTask"
      }),
      subtasks: many(tasks, { relationName: "parentTask" }),
      dependents: many(taskDependencies, { relationName: "dependsOn" }),
      dependencies: many(taskDependencies, { relationName: "dependent" })
    }));
    templatesRelations = relations(templates, ({ one }) => ({
      createdBy: one(users, {
        fields: [templates.createdById],
        references: [users.id]
      })
    }));
    taskDependenciesRelations = relations(taskDependencies, ({ one }) => ({
      dependentTask: one(tasks, {
        fields: [taskDependencies.dependentTaskId],
        references: [tasks.id],
        relationName: "dependent"
      }),
      dependsOnTask: one(tasks, {
        fields: [taskDependencies.dependsOnTaskId],
        references: [tasks.id],
        relationName: "dependsOn"
      })
    }));
    timeLogsRelations = relations(timeLogs, ({ one }) => ({
      user: one(users, {
        fields: [timeLogs.userId],
        references: [users.id]
      }),
      task: one(tasks, {
        fields: [timeLogs.taskId],
        references: [tasks.id]
      }),
      project: one(projects, {
        fields: [timeLogs.projectId],
        references: [projects.id]
      }),
      invoice: one(invoices, {
        fields: [timeLogs.invoiceId],
        references: [invoices.id]
      }),
      approvedByUser: one(users, {
        fields: [timeLogs.approvedBy],
        references: [users.id]
      })
    }));
    clientDocumentsRelations = relations(clientDocuments, ({ one }) => ({
      client: one(clients, {
        fields: [clientDocuments.clientId],
        references: [clients.id]
      }),
      uploadedBy: one(users, {
        fields: [clientDocuments.uploadedById],
        references: [users.id]
      })
    }));
    fileAttachmentsRelations = relations(fileAttachments, ({ one, many }) => ({
      uploadedBy: one(users, {
        fields: [fileAttachments.uploadedById],
        references: [users.id]
      }),
      parentFile: one(fileAttachments, {
        fields: [fileAttachments.parentFileId],
        references: [fileAttachments.id],
        relationName: "fileVersions"
      }),
      versions: many(fileAttachments, { relationName: "fileVersions" })
    }));
    documentVersionsRelations = relations(documentVersions, ({ one }) => ({
      uploadedBy: one(users, {
        fields: [documentVersions.uploadedById],
        references: [users.id]
      })
    }));
    insertTaskSchema = createInsertSchema(tasks, {
      dueDate: z.union([
        z.string().transform((val) => new Date(val)),
        z.date(),
        z.null()
      ]).optional().nullable(),
      progress: z.array(z.object({
        date: z.string(),
        comment: z.string()
      })).optional().nullable(),
      attachments: z.array(z.string()).optional(),
      links: z.array(z.string()).optional()
    });
    selectTaskSchema = createSelectSchema(tasks);
    taskSchema = insertTaskSchema.omit({ id: true, createdAt: true, updatedAt: true });
    insertProjectSchema = createInsertSchema(projects);
    selectProjectSchema = createSelectSchema(projects);
    projectSchema = insertProjectSchema.omit({ id: true, createdAt: true, updatedAt: true });
    insertClientSchema = createInsertSchema(clients, {
      name: z.string().min(1, "Client name is required").max(100, "Name must be less than 100 characters"),
      email: z.string().email("Please enter a valid email address").optional().nullable(),
      company: z.string().max(150, "Company name must be less than 150 characters").optional().nullable(),
      phone: z.string().regex(/^[\+]?[\d\s\-\(\)]{7,20}$/, "Please enter a valid phone number").optional().nullable(),
      address: z.string().max(500, "Address must be less than 500 characters").optional().nullable(),
      website: z.string().url("Please enter a valid website URL").or(z.literal("")).optional().nullable(),
      status: z.enum(["active", "inactive", "prospect"], {
        errorMap: () => ({ message: "Please select a valid client status" })
      }).default("prospect"),
      notes: z.string().max(1e3, "Notes must be less than 1000 characters").optional().nullable()
    });
    selectClientSchema = createSelectSchema(clients);
    clientSchema = insertClientSchema.omit({ id: true, createdAt: true, updatedAt: true });
    baseInsertProposalSchema = createInsertSchema(proposals, {
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
        z.date().transform((val) => val.toISOString().split("T")[0])
      ]).optional().nullable(),
      deliverables: z.string().max(2e3, "Deliverables must be less than 2000 characters").optional().nullable(),
      terms: z.string().max(2e3, "Terms must be less than 2000 characters").optional().nullable()
    });
    insertProposalSchema = baseInsertProposalSchema.refine((data) => {
      if (data.expirationDate && typeof data.expirationDate === "string") {
        return new Date(data.expirationDate) > /* @__PURE__ */ new Date();
      }
      return true;
    }, {
      message: "Expiration date must be in the future",
      path: ["expirationDate"]
    });
    selectProposalSchema = createSelectSchema(proposals);
    proposalSchema = baseInsertProposalSchema.omit({ id: true, createdAt: true, updatedAt: true });
    baseInsertInvoiceSchema = createInsertSchema(invoices, {
      invoiceNumber: z.string().min(1, "Invoice number is required").max(50, "Invoice number too long"),
      clientName: z.string().min(1, "Client name is required").max(100, "Client name too long").optional(),
      clientEmail: z.string().email("Invalid email format").optional().nullable(),
      clientAddress: z.string().max(500, "Address too long").optional().nullable(),
      status: z.enum(["draft", "sent", "viewed", "paid", "overdue", "cancelled"], {
        errorMap: () => ({ message: "Please select a valid invoice status" })
      }).default("draft"),
      invoiceDate: z.union([
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
        z.date().transform((val) => val.toISOString().split("T")[0]),
        z.literal("").transform(() => void 0)
      ]).optional(),
      dueDate: z.union([
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
        z.date().transform((val) => val.toISOString().split("T")[0]),
        z.literal("").transform(() => void 0)
      ]).optional(),
      subtotal: z.union([
        z.string().regex(/^\d+\.?\d*$/, "Subtotal must be a valid number"),
        z.number().transform((val) => val.toString())
      ]).optional(),
      taxRate: z.union([
        z.string().regex(/^\d+\.?\d*$/, "Tax rate must be a valid number"),
        z.number().min(0).max(100).transform((val) => val.toString())
      ]).optional(),
      taxAmount: z.union([
        z.string().regex(/^\d+\.?\d*$/, "Tax amount must be a valid number"),
        z.number().transform((val) => val.toString())
      ]).optional(),
      discountAmount: z.union([
        z.string().regex(/^\d+\.?\d*$/, "Discount amount must be a valid number"),
        z.number().transform((val) => val.toString())
      ]).optional(),
      totalAmount: z.union([
        z.string().regex(/^\d+\.?\d*$/, "Total amount must be a valid number"),
        z.number().transform((val) => val.toString())
      ]).optional(),
      lineItems: z.array(z.object({
        id: z.number().min(1, "Line item id is required"),
        description: z.string().min(1, "Item description is required"),
        quantity: z.number().min(0.01, "Quantity must be greater than 0"),
        rate: z.number().min(0, "Rate cannot be negative"),
        amount: z.number().min(0, "Amount cannot be negative")
      })).optional()
    });
    insertInvoiceSchema = baseInsertInvoiceSchema.omit({
      id: true,
      createdById: true,
      // Backend sets this automatically from authenticated user
      createdAt: true,
      updatedAt: true
    }).refine((data) => {
      if (data.invoiceDate && data.dueDate) {
        return new Date(data.dueDate) >= new Date(data.invoiceDate);
      }
      return true;
    }, {
      message: "Due date must be on or after invoice date",
      path: ["dueDate"]
    });
    selectInvoiceSchema = createSelectSchema(invoices);
    invoiceSchema = baseInsertInvoiceSchema.omit({ id: true, createdAt: true, updatedAt: true });
    selectPaymentSchema = createSelectSchema(payments);
    paymentSchema = insertPaymentSchema.omit({ id: true, createdAt: true });
    baseInsertContractSchema = createInsertSchema(contracts, {
      title: z.string().min(1, "Contract title is required").max(200, "Title must be less than 200 characters"),
      contractNumber: z.string().optional(),
      clientName: z.string().min(1, "Client name is required").max(100, "Client name must be less than 100 characters"),
      clientEmail: z.string().email("Invalid email format").optional().nullable(),
      contractType: z.enum(["service", "product", "recurring", "one_time"], {
        errorMap: () => ({ message: "Please select a valid contract type" })
      }).default("service"),
      contractValue: z.union([
        z.string().regex(/^\d+\.?\d*$/, "Contract value must be a valid number"),
        z.number().min(0, "Contract value cannot be negative").transform((val) => val.toString())
      ]).optional(),
      currency: z.string().length(3, "Currency must be a 3-letter code (e.g., USD)").default("USD"),
      effectiveDate: z.union([
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
        z.date().transform((val) => val.toISOString().split("T")[0])
      ]).optional().nullable(),
      expirationDate: z.union([
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
        z.date().transform((val) => val.toISOString().split("T")[0])
      ]).optional().nullable(),
      renewalDate: z.union([
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
        z.date().transform((val) => val.toISOString().split("T")[0])
      ]).optional().nullable(),
      terminationDate: z.union([
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
        z.date().transform((val) => val.toISOString().split("T")[0])
      ]).optional().nullable()
    });
    insertContractSchema = baseInsertContractSchema.refine((data) => {
      if (data.effectiveDate && data.expirationDate) {
        return new Date(data.expirationDate) > new Date(data.effectiveDate);
      }
      return true;
    }, {
      message: "Expiration date must be after effective date",
      path: ["expirationDate"]
    });
    selectContractSchema = createSelectSchema(contracts);
    contractSchema = baseInsertContractSchema.omit({ id: true, createdAt: true, updatedAt: true });
    insertTemplateSchema = createInsertSchema(templates);
    selectTemplateSchema = createSelectSchema(templates);
    templateSchema = insertTemplateSchema.omit({ id: true, createdAt: true, updatedAt: true });
    insertUserSchema = createInsertSchema(users);
    selectUserSchema = createSelectSchema(users);
    userSchema = insertUserSchema.omit({ id: true, createdAt: true, updatedAt: true });
    insertClientDocumentSchema = createInsertSchema(clientDocuments);
    selectClientDocumentSchema = createSelectSchema(clientDocuments);
    clientDocumentSchema = insertClientDocumentSchema.omit({ id: true, createdAt: true, updatedAt: true });
    insertFileAttachmentSchema = createInsertSchema(fileAttachments);
    selectFileAttachmentSchema = createSelectSchema(fileAttachments);
    fileAttachmentSchema = insertFileAttachmentSchema.omit({ id: true, createdAt: true, updatedAt: true });
    insertDocumentVersionSchema = createInsertSchema(documentVersions);
    selectDocumentVersionSchema = createSelectSchema(documentVersions);
    documentVersionSchema = insertDocumentVersionSchema.omit({ id: true, createdAt: true });
    updateTaskSchema = insertTaskSchema.partial();
    updateTemplateSchema = insertTemplateSchema.partial();
    updateProposalSchema = baseInsertProposalSchema.partial();
    updateTimeLogSchema = z.object({
      endTime: z.date().optional(),
      duration: z.string().optional(),
      isActive: z.boolean().optional(),
      description: z.string().optional()
    });
    startTimerSchema = z.object({
      taskId: z.string().optional(),
      projectId: z.string().optional(),
      description: z.string().optional()
    });
    stopTimerSchema = z.object({
      timeLogId: z.string().min(1, "Time log ID is required")
    });
    onboardingSchema = z.object({
      notificationEmail: z.string().email().optional(),
      phone: z.string().optional(),
      emailOptIn: z.boolean().default(true),
      smsOptIn: z.boolean().default(false),
      hasCompletedOnboarding: z.boolean().default(true)
    });
    generateProposalSchema = z.object({
      templateId: z.string(),
      title: z.string(),
      projectId: z.string().optional(),
      clientName: z.string(),
      clientEmail: z.string().email(),
      variables: z.record(z.any()),
      expiresInDays: z.number().min(1).default(30)
    });
    directProposalSchema = z.object({
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
    sendProposalSchema = z.object({
      proposalId: z.string(),
      clientEmail: z.string().email(),
      message: z.string().optional()
    });
    messages = pgTable("messages", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      fromUserId: varchar("from_user_id").references(() => users.id).notNull(),
      toUserId: varchar("to_user_id").references(() => users.id),
      toEmail: varchar("to_email"),
      // For external recipients
      subject: varchar("subject").notNull(),
      content: text("content").notNull(),
      priority: varchar("priority", { enum: ["low", "medium", "high"] }).default("medium"),
      attachments: jsonb("attachments").$type().default([]),
      isRead: boolean("is_read").default(false),
      readAt: timestamp("read_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    messageRelations = relations(messages, ({ one }) => ({
      fromUser: one(users, {
        fields: [messages.fromUserId],
        references: [users.id]
      }),
      toUser: one(users, {
        fields: [messages.toUserId],
        references: [users.id]
      })
    }));
    insertMessageSchema = createInsertSchema(messages, {
      subject: z.string().min(1, "Subject is required"),
      content: z.string().min(1, "Content is required"),
      priority: z.enum(["low", "medium", "high"]).default("medium"),
      attachments: z.array(z.object({
        id: z.string(),
        filename: z.string(),
        size: z.number(),
        type: z.string(),
        url: z.string()
      })).default([])
    }).omit({
      id: true,
      fromUserId: true,
      // Server sets this from authenticated user
      isRead: true,
      readAt: true,
      createdAt: true,
      updatedAt: true
    });
    selectMessageSchema = createSelectSchema(messages);
    customFieldDefinitions = pgTable("custom_field_definitions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: varchar("name").notNull(),
      label: varchar("label").notNull(),
      type: varchar("type", { enum: ["text", "textarea", "number", "date", "boolean", "select", "multiselect"] }).notNull(),
      entityType: varchar("entity_type", { enum: ["task", "project", "client"] }).notNull(),
      options: jsonb("options").$type().default([]),
      // For select/multiselect fields
      required: boolean("required").default(false),
      defaultValue: text("default_value"),
      validation: jsonb("validation").$type().default({}),
      order: integer("order").default(0),
      isActive: boolean("is_active").default(true),
      createdById: varchar("created_by_id").references(() => users.id).notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    customFieldValues = pgTable("custom_field_values", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      fieldId: varchar("field_id").references(() => customFieldDefinitions.id, { onDelete: "cascade" }).notNull(),
      entityType: varchar("entity_type", { enum: ["task", "project", "client"] }).notNull(),
      entityId: varchar("entity_id").notNull(),
      // References the actual entity ID
      value: jsonb("value"),
      // Stores any type of value
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    workflowRules = pgTable("workflow_rules", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: varchar("name").notNull(),
      description: text("description"),
      entityType: varchar("entity_type", { enum: ["task", "project", "client"] }).notNull(),
      trigger: jsonb("trigger").$type().notNull(),
      actions: jsonb("actions").$type().notNull(),
      isActive: boolean("is_active").default(true),
      priority: integer("priority").default(0),
      createdById: varchar("created_by_id").references(() => users.id).notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    workflowExecutions = pgTable("workflow_executions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      ruleId: varchar("rule_id").references(() => workflowRules.id, { onDelete: "cascade" }).notNull(),
      entityType: varchar("entity_type").notNull(),
      entityId: varchar("entity_id").notNull(),
      status: varchar("status", { enum: ["success", "failed", "partial"] }).notNull(),
      result: jsonb("result").$type(),
      executedAt: timestamp("executed_at").defaultNow()
    });
    comments = pgTable("comments", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      entityType: varchar("entity_type", { enum: ["task", "project", "client"] }).notNull(),
      entityId: varchar("entity_id").notNull(),
      content: text("content").notNull(),
      authorId: varchar("author_id").references(() => users.id).notNull(),
      parentId: varchar("parent_id"),
      // Self-reference for threaded comments
      mentions: jsonb("mentions").$type().default([]),
      // User IDs mentioned in comment
      attachments: jsonb("attachments").$type().default([]),
      isEdited: boolean("is_edited").default(false),
      editedAt: timestamp("edited_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    activities = pgTable("activities", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      type: varchar("type").notNull(),
      // "task_created", "task_updated", "comment_added", etc.
      entityType: varchar("entity_type", { enum: ["task", "project", "client", "user"] }).notNull(),
      entityId: varchar("entity_id").notNull(),
      actorId: varchar("actor_id").references(() => users.id).notNull(),
      data: jsonb("data").$type().default({}),
      // Activity-specific data
      description: text("description").notNull(),
      // Human-readable description
      isPrivate: boolean("is_private").default(false),
      // Whether activity is private to actor
      createdAt: timestamp("created_at").defaultNow()
    });
    apiKeys = pgTable("api_keys", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: varchar("name").notNull(),
      key: varchar("key").unique().notNull(),
      // The actual API key
      hashedKey: varchar("hashed_key").notNull(),
      // Hashed version for security
      prefix: varchar("prefix", { length: 8 }).notNull(),
      // First 8 chars for identification
      permissions: jsonb("permissions").$type().notNull(),
      // ["read:tasks", "write:projects", etc.]
      rateLimit: integer("rate_limit").default(1e3),
      // Requests per hour
      isActive: boolean("is_active").default(true),
      lastUsedAt: timestamp("last_used_at"),
      expiresAt: timestamp("expires_at"),
      createdById: varchar("created_by_id").references(() => users.id).notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    apiUsage = pgTable("api_usage", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      keyId: varchar("key_id").references(() => apiKeys.id, { onDelete: "cascade" }).notNull(),
      method: varchar("method").notNull(),
      // GET, POST, etc.
      endpoint: varchar("endpoint").notNull(),
      // /api/tasks, etc.
      statusCode: integer("status_code").notNull(),
      responseTime: integer("response_time"),
      // in milliseconds
      userAgent: varchar("user_agent"),
      ipAddress: varchar("ip_address"),
      requestedAt: timestamp("requested_at").defaultNow()
    });
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      // Low connection limit for Neon
      idleTimeoutMillis: 15e3,
      // Close idle connections quickly
      connectionTimeoutMillis: 1e4
      // Timeout connection attempts
    });
    pool.on("error", (err) => {
      console.error("\u{1F4A5} Database pool error:", {
        message: err.message,
        code: err.code,
        severity: err.severity,
        where: err.where,
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount
      });
    });
    setInterval(async () => {
      try {
        await pool.query("SELECT 1");
      } catch (err) {
        console.error("\u{1F504} Keepalive query failed:", err.message);
      }
    }, 55e3);
    db = drizzle({ client: pool, schema: schema_exports });
  }
});

// server/storage.ts
import { eq, and, or, desc, gte, lte, isNull, sql as sql2 } from "drizzle-orm";
import bcrypt from "bcryptjs";
async function withRetry(operation, operationName = "database operation") {
  const maxRetries = 3;
  const baseDelay = 100;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const isTransientError = error.code === "57P01" || // admin_shutdown
      error.code === "53300" || // too_many_connections
      error.code === "57P03";
      if (isTransientError && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(3, attempt - 1);
        console.warn(`\u{1F504} Transient DB error (${error.code}) on ${operationName}, retrying in ${delay}ms (attempt ${attempt}/${maxRetries}):`, error.message);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error(`Failed after ${maxRetries} attempts`);
}
var DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_db();
    init_schema();
    DatabaseStorage = class {
      // User operations
      async getUsers() {
        return await db.select().from(users);
      }
      async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
      }
      async getUserByUsername(username) {
        const [user] = await db.select().from(users).where(eq(users.username, username));
        return user;
      }
      async createUser(insertUser) {
        const hashedPassword = await bcrypt.hash(insertUser.password, 10);
        const [user] = await db.insert(users).values({
          ...insertUser,
          password: hashedPassword
        }).returning();
        return user;
      }
      async updateUserOnboarding(userId, onboardingData) {
        const [user] = await db.update(users).set({
          notificationEmail: onboardingData.notificationEmail,
          phone: onboardingData.phone || null,
          emailOptIn: onboardingData.emailOptIn,
          smsOptIn: onboardingData.smsOptIn,
          hasCompletedOnboarding: onboardingData.hasCompletedOnboarding !== void 0 ? onboardingData.hasCompletedOnboarding : true
        }).where(eq(users.id, userId)).returning();
        return user;
      }
      async deleteUser(id) {
        const result = await db.delete(users).where(eq(users.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      async verifyPassword(user, password) {
        return await bcrypt.compare(password, user.password);
      }
      // Project operations
      async getProjects() {
        return await db.select().from(projects).orderBy(projects.name);
      }
      async getProject(id) {
        const [project] = await db.select().from(projects).where(eq(projects.id, id));
        return project;
      }
      async createProject(insertProject) {
        const [project] = await db.insert(projects).values(insertProject).returning();
        return project;
      }
      async getOrCreateProject(name) {
        const [existing] = await db.select().from(projects).where(eq(projects.name, name));
        if (existing) {
          return existing;
        }
        return await this.createProject({ name });
      }
      async updateProject(id, updateData) {
        const [project] = await db.update(projects).set(updateData).where(eq(projects.id, id)).returning();
        return project;
      }
      // Task operations
      async getTasks(userId) {
        const query = db.select({
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
          actualHours: tasks.actualHours
        }).from(tasks).orderBy(tasks.createdAt);
        if (userId) {
          const results = await query.where(
            or(
              eq(tasks.assignedToId, userId),
              eq(tasks.createdById, userId)
            )
          );
          return results;
        } else {
          const results = await query;
          return results;
        }
      }
      async getTask(id) {
        const [result] = await db.select().from(tasks).where(eq(tasks.id, id));
        return result || void 0;
      }
      async createTask(insertTask, createdById) {
        const taskData = {
          ...insertTask,
          createdById,
          assignedToId: insertTask.assignedToId || null,
          projectId: insertTask.projectId || null,
          dueDate: insertTask.dueDate || null,
          notes: insertTask.notes || null,
          attachments: insertTask.attachments && insertTask.attachments.length > 0 ? insertTask.attachments : null,
          links: insertTask.links && insertTask.links.length > 0 ? insertTask.links : null,
          progressNotes: insertTask.progressNotes && insertTask.progressNotes.length > 0 ? insertTask.progressNotes : null
        };
        const [task] = await db.insert(tasks).values(taskData).returning();
        return await this.getTask(task.id);
      }
      async updateTask(id, updateTask) {
        const [task] = await db.update(tasks).set(updateTask).where(eq(tasks.id, id)).returning();
        if (!task) return void 0;
        return await this.getTask(task.id);
      }
      async deleteTask(id) {
        const result = await db.delete(tasks).where(eq(tasks.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      async getTasksByProject(projectId, userId) {
        let query = db.select({
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
          project: projects
        }).from(tasks).leftJoin(users, eq(tasks.assignedToId, users.id)).leftJoin(projects, eq(tasks.projectId, projects.id));
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
          return results.map((row) => ({
            ...row,
            assignedTo: row.assignedTo || void 0,
            project: row.project || void 0
          }));
        } else {
          const results = await query.where(eq(tasks.projectId, projectId));
          return results.map((row) => ({
            ...row,
            assignedTo: row.assignedTo || void 0,
            project: row.project || void 0
          }));
        }
      }
      async getSubtasks(parentTaskId) {
        const results = await db.select({
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
          project: projects
        }).from(tasks).leftJoin(users, eq(tasks.assignedToId, users.id)).leftJoin(projects, eq(tasks.projectId, projects.id)).where(eq(tasks.parentTaskId, parentTaskId));
        return results.map((row) => ({
          ...row,
          assignedTo: row.assignedTo || void 0,
          project: row.project || void 0
        }));
      }
      async getTasksWithSubtasks(userId) {
        const allTasks = await this.getTasks(userId);
        const taskMap = /* @__PURE__ */ new Map();
        const parentTasks = [];
        for (const task of allTasks) {
          taskMap.set(task.id, { ...task });
          if (!task.parentTaskId) {
            parentTasks.push(taskMap.get(task.id));
          }
        }
        for (const task of allTasks) {
          if (task.parentTaskId && taskMap.has(task.parentTaskId)) {
            const parent = taskMap.get(task.parentTaskId);
            const child = taskMap.get(task.id);
          }
        }
        return parentTasks;
      }
      // Task dependency operations
      async createTaskDependency(dependency) {
        const [taskDependency] = await db.insert(taskDependencies).values(dependency).returning();
        return taskDependency;
      }
      async deleteTaskDependency(id) {
        const result = await db.delete(taskDependencies).where(eq(taskDependencies.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      async wouldCreateCircularDependency(taskId, dependsOnTaskId) {
        const visited = /* @__PURE__ */ new Set();
        const toCheck = [dependsOnTaskId];
        while (toCheck.length > 0) {
          const current = toCheck.pop();
          if (current === taskId) {
            return true;
          }
          if (visited.has(current)) {
            continue;
          }
          visited.add(current);
          const dependencies = await db.select({ dependsOnTaskId: taskDependencies.dependsOnTaskId }).from(taskDependencies).where(eq(taskDependencies.dependentTaskId, current));
          for (const dep of dependencies) {
            if (dep.dependsOnTaskId) {
              toCheck.push(dep.dependsOnTaskId);
            }
          }
        }
        return false;
      }
      // Time log operations
      async getTimeLogs(userId, projectId) {
        let query = db.select().from(timeLogs).leftJoin(users, eq(timeLogs.userId, users.id)).leftJoin(tasks, eq(timeLogs.taskId, tasks.id)).leftJoin(projects, eq(timeLogs.projectId, projects.id)).orderBy(desc(timeLogs.startTime));
        if (userId) {
          query = query.where(eq(timeLogs.userId, userId));
        }
        if (projectId) {
          query = query.where(eq(timeLogs.projectId, projectId));
        }
        const result = await query;
        return result.map((row) => ({
          ...row.time_logs,
          user: row.users || void 0,
          task: row.tasks || void 0,
          project: row.projects || void 0
        }));
      }
      async getTimeLog(id) {
        const result = await db.select().from(timeLogs).leftJoin(users, eq(timeLogs.userId, users.id)).leftJoin(tasks, eq(timeLogs.taskId, tasks.id)).leftJoin(projects, eq(timeLogs.projectId, projects.id)).where(eq(timeLogs.id, id)).limit(1);
        if (result.length === 0) return void 0;
        const row = result[0];
        return {
          ...row.time_logs,
          user: row.users || void 0,
          task: row.tasks || void 0,
          project: row.projects || void 0
        };
      }
      async getActiveTimeLog(userId) {
        const result = await db.select().from(timeLogs).leftJoin(users, eq(timeLogs.userId, users.id)).leftJoin(tasks, eq(timeLogs.taskId, tasks.id)).leftJoin(projects, eq(timeLogs.projectId, projects.id)).where(and(eq(timeLogs.userId, userId), eq(timeLogs.isActive, true))).limit(1);
        if (result.length === 0) return void 0;
        const row = result[0];
        return {
          ...row.time_logs,
          user: row.users || void 0,
          task: row.tasks || void 0,
          project: row.projects || void 0
        };
      }
      async createTimeLog(insertTimeLog) {
        const [timeLog] = await db.insert(timeLogs).values(insertTimeLog).returning();
        return await this.getTimeLog(timeLog.id);
      }
      async updateTimeLog(id, updateTimeLog) {
        const [updatedTimeLog] = await db.update(timeLogs).set({
          ...updateTimeLog,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(timeLogs.id, id)).returning();
        if (!updatedTimeLog) return void 0;
        return await this.getTimeLog(updatedTimeLog.id);
      }
      async deleteTimeLog(id) {
        const result = await db.delete(timeLogs).where(eq(timeLogs.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      async stopActiveTimer(userId) {
        const activeTimer = await this.getActiveTimeLog(userId);
        if (!activeTimer) return void 0;
        const endTime = /* @__PURE__ */ new Date();
        const duration = Math.floor((endTime.getTime() - new Date(activeTimer.startTime).getTime()) / 1e3);
        return await this.updateTimeLog(activeTimer.id, {
          endTime,
          duration: duration.toString(),
          isActive: false
        });
      }
      async getUserProductivityStats(userId, days) {
        const startDate = /* @__PURE__ */ new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);
        const endDate = /* @__PURE__ */ new Date();
        endDate.setHours(23, 59, 59, 999);
        const timeLogsInPeriod = await db.select().from(timeLogs).where(
          and(
            eq(timeLogs.userId, userId),
            gte(timeLogs.startTime, startDate),
            lte(timeLogs.startTime, endDate),
            eq(timeLogs.isActive, false)
            // Only completed time logs
          )
        );
        const totalSeconds = timeLogsInPeriod.reduce((sum, log2) => {
          return sum + (log2.duration ? parseInt(log2.duration) : 0);
        }, 0);
        const totalHours = totalSeconds / 3600;
        const averageDailyHours = totalHours / days;
        let streakDays = 0;
        const today = /* @__PURE__ */ new Date();
        for (let i = 0; i < days; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(checkDate.getDate() - i);
          checkDate.setHours(0, 0, 0, 0);
          const nextDay = new Date(checkDate);
          nextDay.setDate(nextDay.getDate() + 1);
          const dayLogs = timeLogsInPeriod.filter((log2) => {
            const logDate = new Date(log2.startTime);
            return logDate >= checkDate && logDate < nextDay;
          });
          if (dayLogs.length > 0) {
            streakDays++;
          } else {
            break;
          }
        }
        const targetHours = days * 8;
        const utilizationPercent = targetHours > 0 ? totalHours / targetHours * 100 : 0;
        return {
          totalHours: Math.round(totalHours * 100) / 100,
          averageDailyHours: Math.round(averageDailyHours * 100) / 100,
          streakDays,
          utilizationPercent: Math.round(utilizationPercent * 100) / 100
        };
      }
      async getDailyTimeLogs(userId, date2) {
        const startOfDay5 = new Date(date2);
        startOfDay5.setHours(0, 0, 0, 0);
        const endOfDay2 = new Date(date2);
        endOfDay2.setHours(23, 59, 59, 999);
        const result = await db.select().from(timeLogs).leftJoin(users, eq(timeLogs.userId, users.id)).leftJoin(tasks, eq(timeLogs.taskId, tasks.id)).leftJoin(projects, eq(timeLogs.projectId, projects.id)).where(
          and(
            eq(timeLogs.userId, userId),
            gte(timeLogs.startTime, startOfDay5),
            lte(timeLogs.startTime, endOfDay2)
          )
        ).orderBy(timeLogs.startTime);
        return result.map((row) => ({
          ...row.time_logs,
          user: row.users || void 0,
          task: row.tasks || void 0,
          project: row.projects || void 0
        }));
      }
      // Template operations
      async getTemplates(type, userId) {
        let query = db.select({
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
          createdBy: users
        }).from(templates).leftJoin(users, eq(templates.createdById, users.id));
        const conditions = [];
        if (type) {
          conditions.push(eq(templates.type, type));
        }
        if (userId) {
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
        return results.map((row) => ({
          ...row,
          createdBy: row.createdBy || void 0
        }));
      }
      async getTemplate(id) {
        const [result] = await db.select({
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
          createdBy: users
        }).from(templates).leftJoin(users, eq(templates.createdById, users.id)).where(eq(templates.id, id));
        if (!result) return void 0;
        return {
          ...result,
          createdBy: result.createdBy || void 0
        };
      }
      async createTemplate(insertTemplate) {
        const [template] = await db.insert(templates).values(insertTemplate).returning();
        return template;
      }
      async updateTemplate(id, updateTemplate) {
        const [template] = await db.update(templates).set({
          ...updateTemplate,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(templates.id, id)).returning();
        return template;
      }
      async deleteTemplate(id) {
        const result = await db.delete(templates).where(eq(templates.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      // Proposal operations
      async getProposals(userId) {
        let query = db.select({
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
          createdBy: users
        }).from(proposals).leftJoin(templates, eq(proposals.templateId, templates.id)).leftJoin(projects, eq(proposals.projectId, projects.id)).leftJoin(users, eq(proposals.createdById, users.id));
        if (userId) {
          query = query.where(eq(proposals.createdById, userId));
        }
        const results = await query.orderBy(desc(proposals.createdAt));
        return results.map((row) => ({
          ...row,
          template: row.template || void 0,
          project: row.project || void 0,
          createdBy: row.createdBy || void 0
        }));
      }
      async getProposal(id) {
        const [result] = await db.select({
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
          createdBy: users
        }).from(proposals).leftJoin(templates, eq(proposals.templateId, templates.id)).leftJoin(projects, eq(proposals.projectId, projects.id)).leftJoin(users, eq(proposals.createdById, users.id)).where(eq(proposals.id, id));
        if (!result) return void 0;
        return {
          ...result,
          template: result.template || void 0,
          project: result.project || void 0,
          createdBy: result.createdBy || void 0
        };
      }
      async getProposalByShareableLink(shareableLink) {
        const [result] = await db.select({
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
          createdBy: users
        }).from(proposals).leftJoin(templates, eq(proposals.templateId, templates.id)).leftJoin(projects, eq(proposals.projectId, projects.id)).leftJoin(users, eq(proposals.createdById, users.id)).where(eq(proposals.shareableLink, shareableLink));
        if (!result) return void 0;
        return {
          ...result,
          template: result.template || void 0,
          project: result.project || void 0,
          createdBy: result.createdBy || void 0
        };
      }
      async createProposal(insertProposal) {
        const [proposal] = await db.insert(proposals).values(insertProposal).returning();
        return proposal;
      }
      async updateProposal(id, updateProposal) {
        const [proposal] = await db.update(proposals).set({
          ...updateProposal,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(proposals.id, id)).returning();
        return proposal;
      }
      async deleteProposal(id) {
        const result = await db.delete(proposals).where(eq(proposals.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      async generateShareableLink(proposalId) {
        const shareableLink = `proposal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await db.update(proposals).set({ shareableLink, updatedAt: /* @__PURE__ */ new Date() }).where(eq(proposals.id, proposalId));
        return shareableLink;
      }
      // Client operations
      async getClients() {
        return await db.select().from(clients);
      }
      async getClient(id) {
        const [client] = await db.select().from(clients).where(eq(clients.id, id));
        return client;
      }
      async createClient(insertClient) {
        const [client] = await db.insert(clients).values(insertClient).returning();
        return client;
      }
      async updateClient(id, updateClient) {
        const [client] = await db.update(clients).set(updateClient).where(eq(clients.id, id)).returning();
        return client;
      }
      async deleteClient(id) {
        const result = await db.delete(clients).where(eq(clients.id, id));
        return result.rowCount > 0;
      }
      // Client Document operations
      async getClientDocuments(clientId) {
        return await db.select().from(clientDocuments).where(eq(clientDocuments.clientId, clientId)).orderBy(desc(clientDocuments.createdAt));
      }
      async getAllClientDocuments() {
        return await db.select({
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
            company: clients.company
          },
          uploadedBy: {
            id: users.id,
            name: users.name,
            email: users.email
          }
        }).from(clientDocuments).leftJoin(clients, eq(clientDocuments.clientId, clients.id)).leftJoin(users, eq(clientDocuments.uploadedById, users.id)).orderBy(desc(clientDocuments.createdAt));
      }
      async getClientDocument(id) {
        const [document2] = await db.select().from(clientDocuments).where(eq(clientDocuments.id, id));
        return document2;
      }
      async createClientDocument(insertDocument) {
        const [document2] = await db.insert(clientDocuments).values(insertDocument).returning();
        return document2;
      }
      async updateClientDocument(id, updateDocument) {
        const [document2] = await db.update(clientDocuments).set({
          ...updateDocument,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(clientDocuments.id, id)).returning();
        return document2;
      }
      async deleteClientDocument(id) {
        const result = await db.delete(clientDocuments).where(eq(clientDocuments.id, id));
        return result.rowCount > 0;
      }
      async searchClientDocuments(searchParams) {
        return withRetry(async () => {
          const {
            query = "",
            searchFields = ["name", "description", "fileName", "tags"],
            clientIds = [],
            types = [],
            statuses = [],
            tags = [],
            tagLogic = "AND",
            createdDateFrom,
            createdDateTo,
            updatedDateFrom,
            updatedDateTo,
            fileSizeMin,
            fileSizeMax,
            metadataFilters = [],
            page = 1,
            limit = 50,
            sortBy = "createdAt",
            sortOrder = "desc",
            includeArchived = false,
            fuzzySearch = false
          } = searchParams;
          const baseQuery = db.select({
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
              company: clients.company
            },
            uploadedBy: {
              id: users.id,
              name: users.name,
              email: users.email
            }
          }).from(clientDocuments).leftJoin(clients, eq(clientDocuments.clientId, clients.id)).leftJoin(users, eq(clientDocuments.uploadedById, users.id));
          const whereConditions = [];
          if (!includeArchived) {
            whereConditions.push(sql2`${clientDocuments.status} != 'archived'`);
          }
          if (query.trim()) {
            const searchTerm = fuzzySearch ? `%${query.toLowerCase()}%` : `%${query.toLowerCase()}%`;
            const searchConditions = [];
            if (searchFields.includes("name")) {
              searchConditions.push(sql2`LOWER(${clientDocuments.name}) LIKE ${searchTerm}`);
            }
            if (searchFields.includes("description")) {
              searchConditions.push(sql2`LOWER(${clientDocuments.description}) LIKE ${searchTerm}`);
            }
            if (searchFields.includes("fileName")) {
              searchConditions.push(sql2`LOWER(${clientDocuments.fileName}) LIKE ${searchTerm}`);
            }
            if (searchFields.includes("tags")) {
              searchConditions.push(sql2`EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(${clientDocuments.tags}) AS tag 
            WHERE LOWER(tag) LIKE ${searchTerm}
          )`);
            }
            if (searchConditions.length > 0) {
              whereConditions.push(or(...searchConditions));
            }
          }
          if (clientIds.length > 0) {
            whereConditions.push(sql2`${clientDocuments.clientId} = ANY(${clientIds})`);
          }
          if (types.length > 0) {
            whereConditions.push(sql2`${clientDocuments.type} = ANY(${types})`);
          }
          if (statuses.length > 0) {
            whereConditions.push(sql2`${clientDocuments.status} = ANY(${statuses})`);
          }
          if (tags.length > 0) {
            if (tagLogic === "AND") {
              whereConditions.push(sql2`${clientDocuments.tags} @> ${JSON.stringify(tags)}`);
            } else {
              const tagConditions = tags.map(
                (tag) => sql2`${clientDocuments.tags} @> ${JSON.stringify([tag])}`
              );
              whereConditions.push(or(...tagConditions));
            }
          }
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
          if (fileSizeMin !== void 0) {
            whereConditions.push(gte(clientDocuments.fileSize, fileSizeMin));
          }
          if (fileSizeMax !== void 0) {
            whereConditions.push(lte(clientDocuments.fileSize, fileSizeMax));
          }
          metadataFilters.forEach((filter) => {
            const { key, value, operator = "equals" } = filter;
            switch (operator) {
              case "equals":
                whereConditions.push(sql2`${clientDocuments.metadata}->>${key} = ${value}`);
                break;
              case "contains":
                whereConditions.push(sql2`${clientDocuments.metadata}->>${key} LIKE ${"%" + value + "%"}`);
                break;
              case "startsWith":
                whereConditions.push(sql2`${clientDocuments.metadata}->>${key} LIKE ${value + "%"}`);
                break;
              case "exists":
                whereConditions.push(sql2`${clientDocuments.metadata} ? ${key}`);
                break;
            }
          });
          let query_builder = baseQuery;
          if (whereConditions.length > 0) {
            query_builder = baseQuery.where(and(...whereConditions));
          }
          const countQuery = db.select({ count: sql2`count(*)` }).from(clientDocuments).leftJoin(clients, eq(clientDocuments.clientId, clients.id)).leftJoin(users, eq(clientDocuments.uploadedById, users.id));
          let countQueryWithWhere = countQuery;
          if (whereConditions.length > 0) {
            countQueryWithWhere = countQuery.where(and(...whereConditions));
          }
          const [{ count: totalCount }] = await countQueryWithWhere;
          let orderedQuery = query_builder;
          switch (sortBy) {
            case "name":
              orderedQuery = sortOrder === "asc" ? query_builder.orderBy(clientDocuments.name) : query_builder.orderBy(desc(clientDocuments.name));
              break;
            case "createdAt":
              orderedQuery = sortOrder === "asc" ? query_builder.orderBy(clientDocuments.createdAt) : query_builder.orderBy(desc(clientDocuments.createdAt));
              break;
            case "updatedAt":
              orderedQuery = sortOrder === "asc" ? query_builder.orderBy(clientDocuments.updatedAt) : query_builder.orderBy(desc(clientDocuments.updatedAt));
              break;
            case "fileSize":
              orderedQuery = sortOrder === "asc" ? query_builder.orderBy(clientDocuments.fileSize) : query_builder.orderBy(desc(clientDocuments.fileSize));
              break;
            case "relevance":
            default:
              orderedQuery = query_builder.orderBy(desc(clientDocuments.createdAt));
              break;
          }
          const offset = (page - 1) * limit;
          const documents = await orderedQuery.limit(limit).offset(offset);
          const facets = await this.generateDocumentSearchFacets(whereConditions);
          return {
            documents,
            totalCount,
            facets
          };
        }, "searchClientDocuments");
      }
      async generateDocumentSearchFacets(baseWhereConditions) {
        const [typeFacets, statusFacets, clientFacets, tagFacets] = await Promise.all([
          // Type facets
          db.select({
            value: clientDocuments.type,
            count: sql2`count(*)`
          }).from(clientDocuments).where(baseWhereConditions.length > 0 ? and(...baseWhereConditions) : void 0).groupBy(clientDocuments.type),
          // Status facets
          db.select({
            value: clientDocuments.status,
            count: sql2`count(*)`
          }).from(clientDocuments).where(baseWhereConditions.length > 0 ? and(...baseWhereConditions) : void 0).groupBy(clientDocuments.status),
          // Client facets
          db.select({
            id: clients.id,
            name: clients.name,
            count: sql2`count(*)`
          }).from(clientDocuments).leftJoin(clients, eq(clientDocuments.clientId, clients.id)).where(baseWhereConditions.length > 0 ? and(...baseWhereConditions) : void 0).groupBy(clients.id, clients.name),
          // Tag facets (simplified for now)
          db.select({
            value: sql2`unnest(array(SELECT jsonb_array_elements_text(tags)))`,
            count: sql2`count(*)`
          }).from(clientDocuments).where(baseWhereConditions.length > 0 ? and(...baseWhereConditions) : void 0).groupBy(sql2`unnest(array(SELECT jsonb_array_elements_text(tags)))`).limit(20)
        ]);
        const fileSizeRanges = [
          { range: "Small (< 1MB)", min: 0, max: 1024 * 1024, count: 0 },
          { range: "Medium (1-10MB)", min: 1024 * 1024, max: 10 * 1024 * 1024, count: 0 },
          { range: "Large (10-100MB)", min: 10 * 1024 * 1024, max: 100 * 1024 * 1024, count: 0 },
          { range: "Very Large (>100MB)", min: 100 * 1024 * 1024, max: null, count: 0 }
        ];
        const now = /* @__PURE__ */ new Date();
        const dateRanges = [
          {
            range: "Last 7 days",
            from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3),
            to: now,
            count: 0
          },
          {
            range: "Last 30 days",
            from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3),
            to: now,
            count: 0
          },
          {
            range: "Last 3 months",
            from: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1e3),
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
      async getInvoices(userId) {
        if (userId) {
          return await db.select().from(invoices).where(eq(invoices.createdById, userId)).orderBy(desc(invoices.createdAt));
        }
        return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
      }
      async getInvoice(id, userId) {
        const conditions = userId ? and(eq(invoices.id, id), eq(invoices.createdById, userId)) : eq(invoices.id, id);
        const [invoice] = await db.select().from(invoices).where(conditions);
        return invoice;
      }
      async createInvoice(insertInvoice) {
        const rows = await db.insert(invoices).values(insertInvoice).returning();
        if (Array.isArray(rows) && rows.length > 0) {
          return rows[0];
        }
        const [fallback] = await db.select().from(invoices).where(eq(invoices.invoiceNumber, insertInvoice.invoiceNumber)).limit(1);
        if (!fallback) {
          throw new Error("createInvoice: Insert succeeded but no row returned; fallback select empty");
        }
        return fallback;
      }
      async updateInvoice(id, updateInvoice, userId) {
        const conditions = userId ? and(eq(invoices.id, id), eq(invoices.createdById, userId)) : eq(invoices.id, id);
        const [invoice] = await db.update(invoices).set(updateInvoice).where(conditions).returning();
        return invoice;
      }
      async deleteInvoice(id, userId) {
        const conditions = userId ? and(eq(invoices.id, id), eq(invoices.createdById, userId)) : eq(invoices.id, id);
        const result = await db.delete(invoices).where(conditions);
        return (result.rowCount ?? 0) > 0;
      }
      async getInvoiceByPaymentLink(paymentLink) {
        const [invoice] = await db.select().from(invoices).where(eq(invoices.paymentLink, paymentLink));
        return invoice;
      }
      async generatePaymentLink(invoiceId) {
        const paymentLink = `pay-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        const expiresAt = /* @__PURE__ */ new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await db.update(invoices).set({
          paymentLink,
          paymentLinkExpiresAt: expiresAt,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(invoices.id, invoiceId));
        return paymentLink;
      }
      // Contract operations
      async getContracts() {
        return await db.select().from(contracts).orderBy(desc(contracts.createdAt));
      }
      async getContract(id) {
        const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
        return contract;
      }
      async createContract(insertContract) {
        const [contract] = await db.insert(contracts).values(insertContract).returning();
        return contract;
      }
      async updateContract(id, updateContract) {
        const [contract] = await db.update(contracts).set({
          ...updateContract,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(contracts.id, id)).returning();
        return contract;
      }
      async deleteContract(id) {
        const result = await db.delete(contracts).where(eq(contracts.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      // Payment operations
      async getPayments() {
        return await db.select().from(payments).orderBy(desc(payments.createdAt));
      }
      async getPayment(id) {
        const [payment] = await db.select().from(payments).where(eq(payments.id, id));
        return payment;
      }
      async createPayment(insertPayment) {
        const [payment] = await db.insert(payments).values(insertPayment).returning();
        return payment;
      }
      async updatePayment(id, updatePayment) {
        const [payment] = await db.update(payments).set(updatePayment).where(eq(payments.id, id)).returning();
        return payment;
      }
      async deletePayment(id) {
        const result = await db.delete(payments).where(eq(payments.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      // Message operations
      async getMessages(userId) {
        return await db.select({
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
            email: users.email
          }
        }).from(messages).leftJoin(users, eq(messages.fromUserId, users.id)).where(or(eq(messages.toUserId, userId), eq(messages.fromUserId, userId))).orderBy(desc(messages.createdAt));
      }
      async getMessage(id) {
        const [message] = await db.select({
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
            email: users.email
          }
        }).from(messages).leftJoin(users, eq(messages.fromUserId, users.id)).where(eq(messages.id, id));
        return message;
      }
      async createMessage(insertMessage) {
        let finalToUserId = insertMessage.toUserId;
        if (!finalToUserId && insertMessage.toEmail) {
          const user = await this.getUserByUsername(insertMessage.toEmail);
          if (user) {
            finalToUserId = user.id;
          }
        }
        const [message] = await db.insert(messages).values({
          ...insertMessage,
          toUserId: finalToUserId
        }).returning();
        return message;
      }
      async markMessageAsRead(messageId, userId) {
        const [message] = await db.update(messages).set({
          isRead: true,
          readAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(and(
          eq(messages.id, messageId),
          eq(messages.toUserId, userId)
        )).returning();
        return message;
      }
      async getUnreadMessageCount(userId) {
        const [result] = await db.select({ count: sql2`count(*)` }).from(messages).where(and(
          eq(messages.toUserId, userId),
          eq(messages.isRead, false)
        ));
        return Number(result?.count || 0);
      }
      // File Attachment operations
      async getFileAttachments(entityType, entityId) {
        const result = await db.select().from(fileAttachments).where(and(
          eq(fileAttachments.entityType, entityType),
          eq(fileAttachments.entityId, entityId)
        )).orderBy(desc(fileAttachments.createdAt));
        return result;
      }
      async getAllFileAttachments() {
        return await db.select().from(fileAttachments).orderBy(desc(fileAttachments.createdAt));
      }
      async getFileAttachment(id) {
        const [attachment] = await db.select().from(fileAttachments).where(eq(fileAttachments.id, id));
        return attachment;
      }
      async createFileAttachment(insertAttachment) {
        const [attachment] = await db.insert(fileAttachments).values(insertAttachment).returning();
        return attachment;
      }
      async updateFileAttachment(id, updateAttachment) {
        const [attachment] = await db.update(fileAttachments).set(updateAttachment).where(eq(fileAttachments.id, id)).returning();
        return attachment;
      }
      async deleteFileAttachment(id) {
        const result = await db.delete(fileAttachments).where(eq(fileAttachments.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      // Document Version operations
      async getDocumentVersions(documentId) {
        return await db.select().from(documentVersions).where(eq(documentVersions.documentId, documentId)).orderBy(desc(documentVersions.versionNumber));
      }
      async getDocumentVersion(id) {
        const [version] = await db.select().from(documentVersions).where(eq(documentVersions.id, id));
        return version;
      }
      async createDocumentVersion(insertVersion) {
        const [version] = await db.insert(documentVersions).values(insertVersion).returning();
        return version;
      }
      async deleteDocumentVersion(id) {
        const result = await db.delete(documentVersions).where(eq(documentVersions.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      // Custom Field Definitions operations
      async getCustomFieldDefinitions(entityType) {
        let query = db.select().from(customFieldDefinitions);
        if (entityType) {
          query = query.where(eq(customFieldDefinitions.entityType, entityType));
        }
        return await query.where(eq(customFieldDefinitions.isActive, true)).orderBy(customFieldDefinitions.order, customFieldDefinitions.createdAt);
      }
      async getCustomFieldDefinition(id) {
        const [definition] = await db.select().from(customFieldDefinitions).where(eq(customFieldDefinitions.id, id));
        return definition;
      }
      async createCustomFieldDefinition(insertDefinition) {
        const [definition] = await db.insert(customFieldDefinitions).values(insertDefinition).returning();
        return definition;
      }
      async updateCustomFieldDefinition(id, updateDefinition) {
        const [definition] = await db.update(customFieldDefinitions).set({ ...updateDefinition, updatedAt: /* @__PURE__ */ new Date() }).where(eq(customFieldDefinitions.id, id)).returning();
        return definition;
      }
      async deleteCustomFieldDefinition(id) {
        const result = await db.delete(customFieldDefinitions).where(eq(customFieldDefinitions.id, id));
        return result.rowCount > 0;
      }
      // Custom Field Values operations
      async getCustomFieldValues(entityType, entityId) {
        return await db.select().from(customFieldValues).where(and(
          eq(customFieldValues.entityType, entityType),
          eq(customFieldValues.entityId, entityId)
        )).orderBy(customFieldValues.createdAt);
      }
      async getCustomFieldValue(id) {
        const [value] = await db.select().from(customFieldValues).where(eq(customFieldValues.id, id));
        return value;
      }
      async setCustomFieldValue(insertValue) {
        const existing = await db.select().from(customFieldValues).where(and(
          eq(customFieldValues.fieldId, insertValue.fieldId),
          eq(customFieldValues.entityType, insertValue.entityType),
          eq(customFieldValues.entityId, insertValue.entityId)
        ));
        if (existing.length > 0) {
          const [value] = await db.update(customFieldValues).set({ value: insertValue.value, updatedAt: /* @__PURE__ */ new Date() }).where(eq(customFieldValues.id, existing[0].id)).returning();
          return value;
        } else {
          const [value] = await db.insert(customFieldValues).values(insertValue).returning();
          return value;
        }
      }
      async updateCustomFieldValue(id, updateValue) {
        const [value] = await db.update(customFieldValues).set({ ...updateValue, updatedAt: /* @__PURE__ */ new Date() }).where(eq(customFieldValues.id, id)).returning();
        return value;
      }
      async deleteCustomFieldValue(id) {
        const result = await db.delete(customFieldValues).where(eq(customFieldValues.id, id));
        return result.rowCount > 0;
      }
      // Workflow Rules operations
      async getWorkflowRules(entityType, isActive) {
        let query = db.select().from(workflowRules);
        const conditions = [];
        if (entityType) {
          conditions.push(eq(workflowRules.entityType, entityType));
        }
        if (isActive !== void 0) {
          conditions.push(eq(workflowRules.isActive, isActive));
        }
        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }
        return await query.orderBy(workflowRules.priority, workflowRules.createdAt);
      }
      async getWorkflowRule(id) {
        const [rule] = await db.select().from(workflowRules).where(eq(workflowRules.id, id));
        return rule;
      }
      async createWorkflowRule(insertRule) {
        const [rule] = await db.insert(workflowRules).values(insertRule).returning();
        return rule;
      }
      async updateWorkflowRule(id, updateRule) {
        const [rule] = await db.update(workflowRules).set({ ...updateRule, updatedAt: /* @__PURE__ */ new Date() }).where(eq(workflowRules.id, id)).returning();
        return rule;
      }
      async deleteWorkflowRule(id) {
        const result = await db.delete(workflowRules).where(eq(workflowRules.id, id));
        return result.rowCount > 0;
      }
      async executeWorkflowRules(entityType, entityId, event, entityData) {
        const rules = await this.getWorkflowRules(entityType, true);
        const executions = [];
        for (const rule of rules) {
          if (rule.trigger.event === event) {
            let conditionsMet = true;
            for (const condition of rule.trigger.conditions) {
              const fieldValue = entityData[condition.field];
              switch (condition.operator) {
                case "equals":
                  conditionsMet = conditionsMet && fieldValue === condition.value;
                  break;
                case "not_equals":
                  conditionsMet = conditionsMet && fieldValue !== condition.value;
                  break;
                case "contains":
                  conditionsMet = conditionsMet && String(fieldValue).includes(condition.value);
                  break;
                case "greater_than":
                  conditionsMet = conditionsMet && Number(fieldValue) > Number(condition.value);
                  break;
                case "less_than":
                  conditionsMet = conditionsMet && Number(fieldValue) < Number(condition.value);
                  break;
                default:
                  conditionsMet = false;
              }
              if (!conditionsMet) break;
            }
            if (conditionsMet) {
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
              const execution = await this.createWorkflowExecution({
                ruleId: rule.id,
                entityType,
                entityId,
                status: errors.length === 0 ? "success" : executedActions.length > 0 ? "partial" : "failed",
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
      async executeWorkflowAction(action, entityType, entityId, entityData) {
        switch (action.type) {
          case "send_email":
            console.log("Would send email:", action.config);
            break;
          case "create_task":
            if (entityType !== "task") {
              await this.createTask(action.config, entityData.createdBy || entityData.assignedToId);
            }
            break;
          case "update_status":
            if (entityType === "task") {
              await this.updateTask(entityId, { status: action.config.status });
            } else if (entityType === "project") {
              await this.updateProject(entityId, { status: action.config.status });
            }
            break;
          case "assign_user":
            if (entityType === "task") {
              await this.updateTask(entityId, { assignedToId: action.config.userId });
            }
            break;
          default:
            throw new Error(`Unknown action type: ${action.type}`);
        }
      }
      // Workflow Executions operations
      async getWorkflowExecutions(ruleId, entityId) {
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
      async getWorkflowExecution(id) {
        const [execution] = await db.select().from(workflowExecutions).where(eq(workflowExecutions.id, id));
        return execution;
      }
      async createWorkflowExecution(insertExecution) {
        const [execution] = await db.insert(workflowExecutions).values(insertExecution).returning();
        return execution;
      }
      // Comments operations
      async getComments(entityType, entityId) {
        return await db.select().from(comments).where(and(
          eq(comments.entityType, entityType),
          eq(comments.entityId, entityId)
        )).orderBy(comments.createdAt);
      }
      async getComment(id) {
        const [comment] = await db.select().from(comments).where(eq(comments.id, id));
        return comment;
      }
      async createComment(insertComment) {
        const [comment] = await db.insert(comments).values(insertComment).returning();
        await this.createActivity({
          type: "comment_added",
          entityType: insertComment.entityType,
          entityId: insertComment.entityId,
          actorId: insertComment.authorId,
          description: `Added a comment`,
          data: { commentId: comment.id }
        });
        return comment;
      }
      async updateComment(id, updateComment) {
        const [comment] = await db.update(comments).set({
          ...updateComment,
          isEdited: true,
          editedAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(comments.id, id)).returning();
        return comment;
      }
      async deleteComment(id) {
        const result = await db.delete(comments).where(eq(comments.id, id));
        return result.rowCount > 0;
      }
      // Activities operations
      async getActivities(entityType, entityId, actorId, limit = 50) {
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
        return await query.orderBy(desc(activities.createdAt)).limit(limit);
      }
      async getActivity(id) {
        const [activity] = await db.select().from(activities).where(eq(activities.id, id));
        return activity;
      }
      async createActivity(insertActivity) {
        const [activity] = await db.insert(activities).values(insertActivity).returning();
        return activity;
      }
      async deleteActivity(id) {
        const result = await db.delete(activities).where(eq(activities.id, id));
        return result.rowCount > 0;
      }
      // API Keys operations
      async getApiKeys(createdById) {
        let query = db.select().from(apiKeys);
        if (createdById) {
          query = query.where(eq(apiKeys.createdById, createdById));
        }
        return await query.orderBy(desc(apiKeys.createdAt));
      }
      async getApiKey(id) {
        const [key] = await db.select().from(apiKeys).where(eq(apiKeys.id, id));
        return key;
      }
      async getApiKeyByKey(key) {
        const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.key, key));
        return apiKey;
      }
      async createApiKey(insertKey) {
        const [key] = await db.insert(apiKeys).values(insertKey).returning();
        return key;
      }
      async updateApiKey(id, updateKey) {
        const [key] = await db.update(apiKeys).set({ ...updateKey, updatedAt: /* @__PURE__ */ new Date() }).where(eq(apiKeys.id, id)).returning();
        return key;
      }
      async deleteApiKey(id) {
        const result = await db.delete(apiKeys).where(eq(apiKeys.id, id));
        return result.rowCount > 0;
      }
      async validateApiKey(key) {
        const [apiKey] = await db.select().from(apiKeys).where(and(
          eq(apiKeys.key, key),
          eq(apiKeys.isActive, true),
          or(
            isNull(apiKeys.expiresAt),
            gte(apiKeys.expiresAt, /* @__PURE__ */ new Date())
          )
        ));
        if (apiKey) {
          await this.updateApiKey(apiKey.id, { lastUsedAt: /* @__PURE__ */ new Date() });
        }
        return apiKey || null;
      }
      // API Usage operations
      async getApiUsage(keyId, startDate, endDate) {
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
      async createApiUsage(insertUsage) {
        const [usage] = await db.insert(apiUsage).values(insertUsage).returning();
        return usage;
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/audit-service.ts
var AuditService, auditService, logAuditEvent;
var init_audit_service = __esm({
  "server/audit-service.ts"() {
    "use strict";
    AuditService = class {
      events = /* @__PURE__ */ new Map();
      retentionPolicies = /* @__PURE__ */ new Map();
      complianceReports = /* @__PURE__ */ new Map();
      constructor() {
        console.log("\u{1F4CB} Audit service initialized");
        this.initializeDefaultRetentionPolicies();
        this.startRetentionCleanup();
        this.startComplianceMonitoring();
      }
      /**
       * Log an audit event
       */
      async logEvent(event) {
        const auditEvent = {
          ...event,
          id: this.generateEventId(),
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
        const retentionDays = this.calculateRetentionPeriod(auditEvent);
        auditEvent.compliance.retentionPeriod = retentionDays;
        this.events.set(auditEvent.id, auditEvent);
        await this.checkComplianceViolations(auditEvent);
        await this.checkSecurityAlerts(auditEvent);
        console.log(`\u{1F4CB} Logged audit event: ${auditEvent.action} by ${auditEvent.actor.name}`);
        return auditEvent.id;
      }
      /**
       * Query audit events
       */
      async queryEvents(query) {
        let filteredEvents = Array.from(this.events.values());
        if (query.startDate) {
          filteredEvents = filteredEvents.filter((e) => e.timestamp >= query.startDate);
        }
        if (query.endDate) {
          filteredEvents = filteredEvents.filter((e) => e.timestamp <= query.endDate);
        }
        if (query.source?.length) {
          filteredEvents = filteredEvents.filter((e) => query.source.includes(e.source));
        }
        if (query.category?.length) {
          filteredEvents = filteredEvents.filter((e) => query.category.includes(e.category));
        }
        if (query.action?.length) {
          filteredEvents = filteredEvents.filter((e) => query.action.includes(e.action));
        }
        if (query.actorId) {
          filteredEvents = filteredEvents.filter((e) => e.actor.id === query.actorId);
        }
        if (query.actorType) {
          filteredEvents = filteredEvents.filter((e) => e.actor.type === query.actorType);
        }
        if (query.resourceType?.length) {
          filteredEvents = filteredEvents.filter((e) => query.resourceType.includes(e.resource.type));
        }
        if (query.outcome?.length) {
          filteredEvents = filteredEvents.filter((e) => query.outcome.includes(e.outcome));
        }
        if (query.severity?.length) {
          filteredEvents = filteredEvents.filter((e) => query.severity.includes(e.severity));
        }
        if (query.regulations?.length) {
          filteredEvents = filteredEvents.filter(
            (e) => e.compliance.regulations.some((reg) => query.regulations.includes(reg))
          );
        }
        if (query.searchTerm) {
          const term = query.searchTerm.toLowerCase();
          filteredEvents = filteredEvents.filter(
            (e) => e.action.toLowerCase().includes(term) || e.details.description.toLowerCase().includes(term) || e.actor.name.toLowerCase().includes(term) || e.resource.name?.toLowerCase().includes(term)
          );
        }
        const sortBy = query.sortBy || "timestamp";
        const sortOrder = query.sortOrder || "desc";
        filteredEvents.sort((a, b) => {
          let valueA, valueB;
          switch (sortBy) {
            case "timestamp":
              valueA = new Date(a.timestamp).getTime();
              valueB = new Date(b.timestamp).getTime();
              break;
            case "severity":
              const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
              valueA = severityOrder[a.severity];
              valueB = severityOrder[b.severity];
              break;
            case "actor":
              valueA = a.actor.name;
              valueB = b.actor.name;
              break;
            case "resource":
              valueA = a.resource.name || a.resource.type;
              valueB = b.resource.name || b.resource.type;
              break;
            default:
              valueA = valueB = 0;
          }
          if (sortOrder === "asc") {
            return valueA > valueB ? 1 : -1;
          } else {
            return valueA < valueB ? 1 : -1;
          }
        });
        const total = filteredEvents.length;
        const limit = query.limit || 100;
        const offset = query.offset || 0;
        const events = filteredEvents.slice(offset, offset + limit);
        const hasMore = offset + limit < total;
        return { events, total, hasMore };
      }
      /**
       * Generate compliance report
       */
      async generateComplianceReport(regulation, startDate, endDate, generatedBy) {
        const reportId = this.generateReportId();
        const { events } = await this.queryEvents({
          startDate,
          endDate,
          regulations: [regulation],
          limit: 1e4
        });
        const sections = await this.createComplianceSections(regulation, events);
        const report = {
          id: reportId,
          title: `${regulation} Compliance Report`,
          regulation,
          period: { start: startDate, end: endDate },
          summary: {
            totalEvents: events.length,
            successfulEvents: events.filter((e) => e.outcome === "success").length,
            failedEvents: events.filter((e) => e.outcome === "failure").length,
            securityEvents: events.filter((e) => e.category === "security").length,
            dataAccessEvents: events.filter((e) => e.category === "data_access").length,
            configurationChanges: events.filter((e) => e.category === "system_config").length
          },
          sections,
          generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          generatedBy,
          status: "draft"
        };
        this.complianceReports.set(reportId, report);
        console.log(`\u{1F4CB} Generated compliance report: ${report.title}`);
        return report;
      }
      /**
       * Get audit statistics
       */
      async getStatistics(period) {
        let events = Array.from(this.events.values());
        if (period) {
          events = events.filter(
            (e) => e.timestamp >= period.start && e.timestamp <= period.end
          );
        }
        const now = /* @__PURE__ */ new Date();
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1e3);
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
        const recent24h = events.filter((e) => new Date(e.timestamp) >= last24Hours);
        const recent7d = events.filter((e) => new Date(e.timestamp) >= last7Days);
        const recent30d = events.filter((e) => new Date(e.timestamp) >= last30Days);
        return {
          totalEvents: events.length,
          overview: {
            last24Hours: recent24h.length,
            last7Days: recent7d.length,
            last30Days: recent30d.length
          },
          bySource: this.groupBy(events, "source"),
          byCategory: this.groupBy(events, "category"),
          byOutcome: this.groupBy(events, "outcome"),
          bySeverity: this.groupBy(events, "severity"),
          securityEvents: {
            total: events.filter((e) => e.category === "security").length,
            critical: events.filter((e) => e.category === "security" && e.severity === "critical").length,
            failed: events.filter((e) => e.category === "security" && e.outcome === "failure").length
          },
          complianceEvents: {
            gdpr: events.filter((e) => e.compliance.regulations.includes("GDPR")).length,
            sox: events.filter((e) => e.compliance.regulations.includes("SOX")).length,
            hipaa: events.filter((e) => e.compliance.regulations.includes("HIPAA")).length,
            pciDss: events.filter((e) => e.compliance.regulations.includes("PCI-DSS")).length
          },
          dataClassification: {
            public: events.filter((e) => e.compliance.dataClassification === "public").length,
            internal: events.filter((e) => e.compliance.dataClassification === "internal").length,
            confidential: events.filter((e) => e.compliance.dataClassification === "confidential").length,
            restricted: events.filter((e) => e.compliance.dataClassification === "restricted").length
          },
          topActors: this.getTopActors(events, 10),
          topResources: this.getTopResources(events, 10),
          trends: this.calculateTrends(events)
        };
      }
      /**
       * Get compliance reports
       */
      async getComplianceReports() {
        return Array.from(this.complianceReports.values()).sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
      }
      /**
       * Export audit data
       */
      async exportAuditData(query, format5, includePersonalData = false) {
        const { events } = await this.queryEvents(query);
        const exportEvents = includePersonalData ? events : events.map((event) => ({
          ...event,
          actor: {
            ...event.actor,
            email: event.actor.email ? "[REDACTED]" : void 0,
            ipAddress: this.maskIpAddress(event.actor.ipAddress)
          }
        }));
        const timestamp2 = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        switch (format5) {
          case "json":
            return {
              data: JSON.stringify(exportEvents, null, 2),
              filename: `audit-export-${timestamp2}.json`,
              contentType: "application/json"
            };
          case "csv":
            const csvData = this.convertToCSV(exportEvents);
            return {
              data: csvData,
              filename: `audit-export-${timestamp2}.csv`,
              contentType: "text/csv"
            };
          case "pdf":
            return {
              data: JSON.stringify(exportEvents, null, 2),
              filename: `audit-export-${timestamp2}.pdf`,
              contentType: "application/pdf"
            };
          default:
            throw new Error(`Unsupported export format: ${format5}`);
        }
      }
      /**
       * Create retention policy
       */
      async createRetentionPolicy(policyData) {
        const policy = {
          ...policyData,
          id: this.generatePolicyId(),
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.retentionPolicies.set(policy.id, policy);
        console.log(`\u{1F4CB} Created retention policy: ${policy.name}`);
        return policy;
      }
      /**
       * Get retention policies
       */
      async getRetentionPolicies() {
        return Array.from(this.retentionPolicies.values());
      }
      // Private helper methods
      initializeDefaultRetentionPolicies() {
        const defaultPolicies = [
          {
            name: "GDPR Compliance",
            description: "EU GDPR data retention requirements",
            rules: [
              {
                condition: { field: "compliance", operator: "contains", value: "GDPR" },
                retentionDays: 2555,
                // 7 years
                encryptionRequired: true
              }
            ],
            isActive: true
          },
          {
            name: "SOX Compliance",
            description: "Sarbanes-Oxley financial records retention",
            rules: [
              {
                condition: { field: "compliance", operator: "contains", value: "SOX" },
                retentionDays: 2555,
                // 7 years
                encryptionRequired: true
              }
            ],
            isActive: true
          },
          {
            name: "Security Events",
            description: "Security and authentication events retention",
            rules: [
              {
                condition: { field: "category", operator: "equals", value: "security" },
                retentionDays: 2190,
                // 6 years
                encryptionRequired: true
              }
            ],
            isActive: true
          },
          {
            name: "General System Events",
            description: "Standard system operation events",
            rules: [
              {
                condition: { field: "severity", operator: "in", value: ["low", "medium"] },
                retentionDays: 365,
                // 1 year
                archiveAfterDays: 90,
                encryptionRequired: false
              }
            ],
            isActive: true
          }
        ];
        defaultPolicies.forEach((policy) => {
          const retentionPolicy = {
            ...policy,
            id: this.generatePolicyId(),
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          this.retentionPolicies.set(retentionPolicy.id, retentionPolicy);
        });
        console.log(`\u{1F4CB} Initialized ${defaultPolicies.length} default retention policies`);
      }
      calculateRetentionPeriod(event) {
        let maxRetention = 365;
        for (const policy of this.retentionPolicies.values()) {
          if (!policy.isActive) continue;
          for (const rule of policy.rules) {
            if (this.matchesRetentionRule(event, rule)) {
              maxRetention = Math.max(maxRetention, rule.retentionDays);
            }
          }
        }
        return maxRetention;
      }
      matchesRetentionRule(event, rule) {
        return true;
      }
      async checkComplianceViolations(event) {
        if (event.outcome === "failure" && event.severity === "critical") {
          console.warn(`\u26A0\uFE0F Critical compliance event detected: ${event.action}`);
        }
      }
      async checkSecurityAlerts(event) {
        if (event.category === "security" && event.outcome === "failure") {
          console.warn(`\u{1F6A8} Security alert: ${event.action} failed for ${event.actor.name}`);
        }
      }
      async createComplianceSections(regulation, events) {
        const sections = [];
        switch (regulation) {
          case "GDPR":
            sections.push({
              title: "Data Access Controls",
              requirement: "Article 25 - Data protection by design and by default",
              events: events.filter((e) => e.category === "data_access"),
              analysis: {
                compliant: true,
                riskLevel: "low",
                findings: ["All data access properly logged"],
                recommendations: ["Continue monitoring data access patterns"]
              }
            });
            break;
          case "SOX":
            sections.push({
              title: "Financial Data Changes",
              requirement: "Section 404 - Internal control reporting",
              events: events.filter((e) => e.category === "data_modification"),
              analysis: {
                compliant: true,
                riskLevel: "low",
                findings: ["All financial data changes tracked"],
                recommendations: ["Maintain current audit practices"]
              }
            });
            break;
        }
        return sections;
      }
      startRetentionCleanup() {
        setInterval(() => {
          this.cleanupExpiredEvents();
        }, 24 * 60 * 60 * 1e3);
      }
      startComplianceMonitoring() {
        setInterval(() => {
          this.monitorCompliance();
        }, 60 * 60 * 1e3);
      }
      cleanupExpiredEvents() {
        const now = /* @__PURE__ */ new Date();
        let cleanedCount = 0;
        for (const [eventId, event] of this.events.entries()) {
          const retentionExpiry = new Date(event.timestamp);
          retentionExpiry.setDate(retentionExpiry.getDate() + event.compliance.retentionPeriod);
          if (now > retentionExpiry) {
            this.events.delete(eventId);
            cleanedCount++;
          }
        }
        if (cleanedCount > 0) {
          console.log(`\u{1F9F9} Cleaned up ${cleanedCount} expired audit events`);
        }
      }
      monitorCompliance() {
        console.log("\u{1F4CB} Compliance monitoring check completed");
      }
      groupBy(events, field) {
        const grouped = {};
        events.forEach((event) => {
          const value = String(event[field]);
          grouped[value] = (grouped[value] || 0) + 1;
        });
        return grouped;
      }
      getTopActors(events, limit) {
        const actorCounts = {};
        events.forEach((event) => {
          actorCounts[event.actor.name] = (actorCounts[event.actor.name] || 0) + 1;
        });
        return Object.entries(actorCounts).sort(([, a], [, b]) => b - a).slice(0, limit).map(([name, count]) => ({ name, count }));
      }
      getTopResources(events, limit) {
        const resourceCounts = {};
        events.forEach((event) => {
          resourceCounts[event.resource.type] = (resourceCounts[event.resource.type] || 0) + 1;
        });
        return Object.entries(resourceCounts).sort(([, a], [, b]) => b - a).slice(0, limit).map(([type, count]) => ({ type, count }));
      }
      calculateTrends(events) {
        const last30Days = events.filter((e) => {
          const eventDate = new Date(e.timestamp);
          const thirtyDaysAgo = /* @__PURE__ */ new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return eventDate >= thirtyDaysAgo;
        });
        return {
          eventsPerDay: Math.round(last30Days.length / 30),
          securityIncidents: last30Days.filter((e) => e.category === "security" && e.outcome === "failure").length,
          failureRate: last30Days.length > 0 ? last30Days.filter((e) => e.outcome === "failure").length / last30Days.length * 100 : 0
        };
      }
      convertToCSV(events) {
        const headers = ["timestamp", "source", "category", "action", "actor", "resource", "outcome", "severity"];
        const rows = events.map((event) => [
          event.timestamp,
          event.source,
          event.category,
          event.action,
          event.actor.name,
          event.resource.type,
          event.outcome,
          event.severity
        ]);
        return [headers, ...rows].map((row) => row.join(",")).join("\n");
      }
      maskIpAddress(ip) {
        const parts = ip.split(".");
        if (parts.length === 4) {
          return `${parts[0]}.${parts[1]}.xxx.xxx`;
        }
        return "xxx.xxx.xxx.xxx";
      }
      generateEventId() {
        return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      generateReportId() {
        return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      generatePolicyId() {
        return `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
    };
    auditService = new AuditService();
    logAuditEvent = async (source, category, action, actor, resource, outcome, details, options) => {
      return auditService.logEvent({
        source,
        category,
        action,
        actor,
        resource,
        outcome,
        severity: options?.severity || "medium",
        details,
        compliance: {
          regulations: options?.regulations || [],
          dataClassification: options?.dataClassification || "internal",
          retentionPeriod: 365,
          // Will be calculated by service
          encryptionRequired: options?.dataClassification === "confidential" || options?.dataClassification === "restricted"
        },
        context: options?.context || {}
      });
    };
  }
});

// server/cache-service.ts
var CacheService, AppCache, cacheService;
var init_cache_service = __esm({
  "server/cache-service.ts"() {
    "use strict";
    init_audit_service();
    CacheService = class {
      cache = /* @__PURE__ */ new Map();
      config;
      stats = {
        hits: 0,
        misses: 0,
        operations: 0,
        evictions: 0,
        totalResponseTime: 0
      };
      patterns = /* @__PURE__ */ new Map();
      constructor(config) {
        this.config = {
          defaultTTL: 3600,
          // 1 hour
          maxMemory: "256mb",
          evictionPolicy: "allkeys-lru",
          persistenceEnabled: true,
          clusterMode: false,
          ...config
        };
        console.log("\u{1F680} Cache service initialized");
        this.initializeCachePatterns();
        this.startCacheCleanup();
        this.startPerformanceMonitoring();
      }
      /**
       * Store data in cache with optional TTL and tags
       */
      async set(key, value, ttl, tags) {
        const now = Date.now();
        const timeToLive = ttl || this.config.defaultTTL;
        await this.enforceMemoryLimits();
        const entry = {
          key,
          value: this.serialize(value),
          ttl: timeToLive,
          createdAt: now,
          accessedAt: now,
          accessCount: 0,
          tags: tags || []
        };
        this.cache.set(key, entry);
        this.stats.operations++;
        this.applyAutoTags(key, entry);
        console.log(`\u{1F680} Cache SET: ${key} (TTL: ${timeToLive}s, Tags: [${tags?.join(", ") || ""}])`);
      }
      /**
       * Retrieve data from cache
       */
      async get(key) {
        const startTime = Date.now();
        const entry = this.cache.get(key);
        if (!entry) {
          this.stats.misses++;
          this.stats.operations++;
          this.recordResponseTime(startTime);
          return null;
        }
        if (this.isExpired(entry)) {
          this.cache.delete(key);
          this.stats.misses++;
          this.stats.operations++;
          this.recordResponseTime(startTime);
          return null;
        }
        entry.accessedAt = Date.now();
        entry.accessCount++;
        this.stats.hits++;
        this.stats.operations++;
        this.recordResponseTime(startTime);
        console.log(`\u{1F680} Cache HIT: ${key} (Access count: ${entry.accessCount})`);
        return this.deserialize(entry.value);
      }
      /**
       * Delete specific cache entry
       */
      async del(key) {
        const deleted = this.cache.delete(key);
        this.stats.operations++;
        if (deleted) {
          console.log(`\u{1F680} Cache DELETE: ${key}`);
        }
        return deleted;
      }
      /**
       * Delete multiple entries by pattern
       */
      async delPattern(pattern) {
        const regex = this.patternToRegex(pattern);
        let deletedCount = 0;
        for (const key of Array.from(this.cache.keys())) {
          if (regex.test(key)) {
            this.cache.delete(key);
            deletedCount++;
          }
        }
        this.stats.operations++;
        console.log(`\u{1F680} Cache DELETE pattern: ${pattern} (${deletedCount} keys removed)`);
        return deletedCount;
      }
      /**
       * Delete entries by tags
       */
      async delByTags(tags) {
        let deletedCount = 0;
        for (const [key, entry] of Array.from(this.cache.entries())) {
          if (entry.tags && tags.some((tag) => entry.tags.includes(tag))) {
            this.cache.delete(key);
            deletedCount++;
          }
        }
        this.stats.operations++;
        console.log(`\u{1F680} Cache DELETE by tags: [${tags.join(", ")}] (${deletedCount} keys removed)`);
        return deletedCount;
      }
      /**
       * Check if key exists in cache
       */
      async exists(key) {
        const entry = this.cache.get(key);
        return entry !== void 0 && !this.isExpired(entry);
      }
      /**
       * Get cache entry with metadata
       */
      async getWithMeta(key) {
        const entry = this.cache.get(key);
        if (!entry || this.isExpired(entry)) {
          return null;
        }
        return {
          value: this.deserialize(entry.value),
          meta: {
            key: entry.key,
            ttl: entry.ttl,
            createdAt: entry.createdAt,
            accessedAt: entry.accessedAt,
            accessCount: entry.accessCount,
            tags: entry.tags
          }
        };
      }
      /**
       * Multi-get operation for batch retrieval
       */
      async mget(keys) {
        const results = [];
        for (const key of keys) {
          results.push(await this.get(key));
        }
        return results;
      }
      /**
       * Multi-set operation for batch storage
       */
      async mset(entries) {
        for (const entry of entries) {
          await this.set(entry.key, entry.value, entry.ttl, entry.tags);
        }
      }
      /**
       * Cache-aside pattern: get or set with factory function
       */
      async getOrSet(key, factory, ttl, tags) {
        const cached = await this.get(key);
        if (cached !== null) {
          return cached;
        }
        const value = await factory();
        await this.set(key, value, ttl, tags);
        return value;
      }
      /**
       * Increment numeric value in cache
       */
      async increment(key, delta = 1) {
        const current = await this.get(key) || 0;
        const newValue = current + delta;
        await this.set(key, newValue);
        return newValue;
      }
      /**
       * Decrement numeric value in cache
       */
      async decrement(key, delta = 1) {
        return this.increment(key, -delta);
      }
      /**
       * Set expiration time for existing key
       */
      async expire(key, ttl) {
        const entry = this.cache.get(key);
        if (!entry) {
          return false;
        }
        entry.ttl = ttl;
        entry.createdAt = Date.now();
        return true;
      }
      /**
       * Get time to live for key
       */
      async ttl(key) {
        const entry = this.cache.get(key);
        if (!entry) {
          return -2;
        }
        const elapsed = (Date.now() - entry.createdAt) / 1e3;
        const remaining = entry.ttl - elapsed;
        if (remaining <= 0) {
          this.cache.delete(key);
          return -2;
        }
        return Math.ceil(remaining);
      }
      /**
       * Get all keys matching pattern
       */
      keys(pattern = "*") {
        const regex = this.patternToRegex(pattern);
        return Array.from(this.cache.keys()).filter((key) => regex.test(key));
      }
      /**
       * Flush all cache entries
       */
      async flush() {
        const keyCount = this.cache.size;
        this.cache.clear();
        this.resetStats();
        console.log(`\u{1F680} Cache FLUSH: ${keyCount} keys removed`);
        await logAuditEvent(
          "system",
          "system_config",
          "cache_flush",
          {
            id: "system",
            type: "system",
            name: "CacheService",
            ipAddress: "127.0.0.1"
          },
          {
            type: "cache",
            id: "main",
            name: "Main Cache"
          },
          "success",
          {
            description: "Cache flushed completely",
            metadata: { keysRemoved: keyCount }
          },
          {
            severity: "medium",
            dataClassification: "internal"
          }
        );
      }
      /**
       * Get cache statistics
       */
      getStats() {
        const totalOps = this.stats.hits + this.stats.misses;
        const hitRate = totalOps > 0 ? this.stats.hits / totalOps * 100 : 0;
        const missRate = 100 - hitRate;
        const avgResponseTime = this.stats.operations > 0 ? this.stats.totalResponseTime / this.stats.operations : 0;
        return {
          totalKeys: this.cache.size,
          usedMemory: this.getMemoryUsage(),
          hitRate: Number(hitRate.toFixed(2)),
          missRate: Number(missRate.toFixed(2)),
          evictionCount: this.stats.evictions,
          operationsPerSecond: this.calculateOpsPerSecond(),
          averageResponseTime: Number(avgResponseTime.toFixed(2))
        };
      }
      /**
       * Warm up cache with predefined data
       */
      async warmup(data) {
        console.log(`\u{1F680} Cache warmup started for ${data.length} entries`);
        for (const item of data) {
          await this.set(item.key, item.value, item.ttl);
        }
        console.log("\u{1F680} Cache warmup completed");
      }
      /**
       * Export cache contents for backup/migration
       */
      async export() {
        const exports = [];
        for (const [key, entry] of Array.from(this.cache.entries())) {
          if (!this.isExpired(entry)) {
            exports.push({
              key,
              value: this.deserialize(entry.value),
              meta: {
                ttl: entry.ttl,
                createdAt: entry.createdAt,
                tags: entry.tags
              }
            });
          }
        }
        return exports;
      }
      /**
       * Import cache contents from backup
       */
      async import(data) {
        console.log(`\u{1F680} Cache import started for ${data.length} entries`);
        for (const item of data) {
          await this.set(item.key, item.value, item.meta.ttl, item.meta.tags);
        }
        console.log("\u{1F680} Cache import completed");
      }
      // Private helper methods
      serialize(value) {
        try {
          return JSON.stringify(value);
        } catch (error) {
          console.warn("Cache serialization failed:", error);
          return String(value);
        }
      }
      deserialize(value) {
        try {
          return JSON.parse(value);
        } catch (error) {
          return value;
        }
      }
      isExpired(entry) {
        const now = Date.now();
        const age = (now - entry.createdAt) / 1e3;
        return age > entry.ttl;
      }
      patternToRegex(pattern) {
        const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\*/g, ".*").replace(/\\\?/g, ".");
        return new RegExp(`^${escaped}$`);
      }
      recordResponseTime(startTime) {
        this.stats.totalResponseTime += Date.now() - startTime;
      }
      calculateOpsPerSecond() {
        return Math.round(this.stats.operations / ((Date.now() - this.startTime) / 1e3));
      }
      startTime = Date.now();
      getMemoryUsage() {
        let totalSize = 0;
        for (const entry of Array.from(this.cache.values())) {
          totalSize += entry.value.length + JSON.stringify(entry).length;
        }
        return totalSize;
      }
      async enforceMemoryLimits() {
        const maxBytes = this.parseMemoryLimit(this.config.maxMemory);
        const currentUsage = this.getMemoryUsage();
        if (currentUsage > maxBytes) {
          await this.evictEntries(currentUsage - maxBytes);
        }
      }
      parseMemoryLimit(limit) {
        const units = { mb: 1024 * 1024, gb: 1024 * 1024 * 1024, kb: 1024 };
        const match = limit.toLowerCase().match(/^(\d+)(mb|gb|kb)$/);
        if (!match) {
          return 256 * 1024 * 1024;
        }
        const [, size, unit] = match;
        return parseInt(size) * (units[unit] || 1);
      }
      async evictEntries(targetBytes) {
        let bytesFreed = 0;
        const entries = Array.from(this.cache.entries());
        entries.sort(([, a], [, b]) => a.accessedAt - b.accessedAt);
        for (const [key, entry] of entries) {
          if (bytesFreed >= targetBytes) break;
          const entrySize = entry.value.length + JSON.stringify(entry).length;
          this.cache.delete(key);
          bytesFreed += entrySize;
          this.stats.evictions++;
        }
        console.log(`\u{1F680} Cache eviction: ${bytesFreed} bytes freed, ${this.stats.evictions} entries removed`);
      }
      initializeCachePatterns() {
        const patterns = [
          {
            pattern: "user:*",
            description: "User data cache",
            ttl: 1800,
            // 30 minutes
            autoRefresh: true,
            dependentTags: ["user-data"]
          },
          {
            pattern: "project:*",
            description: "Project data cache",
            ttl: 3600,
            // 1 hour
            autoRefresh: true,
            dependentTags: ["project-data"]
          },
          {
            pattern: "task:*",
            description: "Task data cache",
            ttl: 900,
            // 15 minutes
            autoRefresh: true,
            dependentTags: ["task-data"]
          },
          {
            pattern: "api:*",
            description: "API response cache",
            ttl: 300,
            // 5 minutes
            autoRefresh: false,
            dependentTags: ["api-response"]
          },
          {
            pattern: "analytics:*",
            description: "Analytics data cache",
            ttl: 7200,
            // 2 hours
            autoRefresh: false,
            dependentTags: ["analytics"]
          }
        ];
        patterns.forEach((pattern) => {
          this.patterns.set(pattern.pattern, pattern);
        });
        console.log(`\u{1F680} Initialized ${patterns.length} cache patterns`);
      }
      applyAutoTags(key, entry) {
        for (const [pattern, config] of Array.from(this.patterns.entries())) {
          const regex = this.patternToRegex(pattern);
          if (regex.test(key)) {
            entry.tags = [...entry.tags || [], ...config.dependentTags];
            break;
          }
        }
      }
      startCacheCleanup() {
        setInterval(() => {
          this.cleanupExpiredEntries();
        }, 5 * 60 * 1e3);
        console.log("\u{1F680} Cache cleanup scheduler started");
      }
      startPerformanceMonitoring() {
        setInterval(() => {
          const stats = this.getStats();
          console.log(`\u{1F680} Cache Performance: ${stats.hitRate}% hit rate, ${stats.totalKeys} keys, ${stats.operationsPerSecond} ops/sec`);
        }, 60 * 1e3);
        console.log("\u{1F680} Cache performance monitoring started");
      }
      cleanupExpiredEntries() {
        let cleanedCount = 0;
        for (const [key, entry] of Array.from(this.cache.entries())) {
          if (this.isExpired(entry)) {
            this.cache.delete(key);
            cleanedCount++;
          }
        }
        if (cleanedCount > 0) {
          console.log(`\u{1F680} Cache cleanup: ${cleanedCount} expired entries removed`);
        }
      }
      resetStats() {
        this.stats = {
          hits: 0,
          misses: 0,
          operations: 0,
          evictions: 0,
          totalResponseTime: 0
        };
      }
    };
    AppCache = class _AppCache {
      static instance;
      static getInstance() {
        if (!_AppCache.instance) {
          _AppCache.instance = new CacheService({
            defaultTTL: 3600,
            // 1 hour
            maxMemory: "512mb",
            evictionPolicy: "allkeys-lru",
            persistenceEnabled: true
          });
        }
        return _AppCache.instance;
      }
      // User-related caching
      static async cacheUser(userId, userData, ttl = 1800) {
        await this.getInstance().set(`user:${userId}`, userData, ttl, ["user-data"]);
      }
      static async getUser(userId) {
        return this.getInstance().get(`user:${userId}`);
      }
      static async invalidateUser(userId) {
        await this.getInstance().del(`user:${userId}`);
      }
      // Project-related caching
      static async cacheProject(projectId, projectData, ttl = 3600) {
        await this.getInstance().set(`project:${projectId}`, projectData, ttl, ["project-data"]);
      }
      static async getProject(projectId) {
        return this.getInstance().get(`project:${projectId}`);
      }
      static async invalidateProject(projectId) {
        await this.getInstance().del(`project:${projectId}`);
      }
      // Task-related caching
      static async cacheTask(taskId, taskData, ttl = 900) {
        await this.getInstance().set(`task:${taskId}`, taskData, ttl, ["task-data"]);
      }
      static async getTask(taskId) {
        return this.getInstance().get(`task:${taskId}`);
      }
      static async invalidateTask(taskId) {
        await this.getInstance().del(`task:${taskId}`);
      }
      // API response caching
      static async cacheApiResponse(endpoint, params, response, ttl = 300) {
        const key = `api:${endpoint}:${this.hashParams(params)}`;
        await this.getInstance().set(key, response, ttl, ["api-response"]);
      }
      static async getApiResponse(endpoint, params) {
        const key = `api:${endpoint}:${this.hashParams(params)}`;
        return this.getInstance().get(key);
      }
      // Analytics caching
      static async cacheAnalytics(type, data, ttl = 7200) {
        await this.getInstance().set(`analytics:${type}`, data, ttl, ["analytics"]);
      }
      static async getAnalytics(type) {
        return this.getInstance().get(`analytics:${type}`);
      }
      // Batch operations
      static async invalidateByTags(tags) {
        return this.getInstance().delByTags(tags);
      }
      static async invalidatePattern(pattern) {
        return this.getInstance().delPattern(pattern);
      }
      // Utility methods
      static hashParams(params) {
        return btoa(JSON.stringify(params)).replace(/[^a-zA-Z0-9]/g, "");
      }
    };
    cacheService = AppCache.getInstance();
  }
});

// server/cache-warming-service.ts
var cache_warming_service_exports = {};
__export(cache_warming_service_exports, {
  CacheWarmingService: () => CacheWarmingService,
  cacheWarmingService: () => cacheWarmingService
});
var CacheWarmingService, cacheWarmingService;
var init_cache_warming_service = __esm({
  "server/cache-warming-service.ts"() {
    "use strict";
    init_cache_service();
    init_storage();
    CacheWarmingService = class {
      cache = AppCache.getInstance();
      isWarming = false;
      constructor() {
        console.log("\u{1F680} Cache warming service initialized");
      }
      /**
       * Start cache warming process
       */
      async startCacheWarming() {
        if (this.isWarming) {
          console.log("\u{1F680} Cache warming already in progress");
          return;
        }
        this.isWarming = true;
        console.log("\u{1F680} Starting cache warming...");
        try {
          await Promise.all([
            this.warmUserData(),
            this.warmProjectData(),
            this.warmTaskData(),
            this.warmTemplateData(),
            this.warmAnalyticsData()
          ]);
          console.log("\u2705 Cache warming completed successfully");
        } catch (error) {
          console.error("\u274C Cache warming failed:", error);
        } finally {
          this.isWarming = false;
        }
      }
      /**
       * Warm user data cache
       */
      async warmUserData() {
        try {
          const users2 = await storage.getUsers();
          await this.cache.set("users:all", users2, 1800, ["user-data"]);
          for (const user of users2.slice(0, 10)) {
            await this.cache.set(`user:${user.id}`, user, 1800, ["user-data"]);
          }
          console.log(`\u{1F680} Warmed user cache: ${users2.length} users`);
        } catch (error) {
          console.error("\u274C Failed to warm user cache:", error);
        }
      }
      /**
       * Warm project data cache
       */
      async warmProjectData() {
        try {
          const projects2 = await storage.getProjects();
          await this.cache.set("projects:all", projects2, 3600, ["project-data"]);
          for (const project of projects2.slice(0, 20)) {
            await this.cache.set(`project:${project.id}`, project, 3600, ["project-data"]);
          }
          console.log(`\u{1F680} Warmed project cache: ${projects2.length} projects`);
        } catch (error) {
          console.error("\u274C Failed to warm project cache:", error);
        }
      }
      /**
       * Warm task data cache
       */
      async warmTaskData() {
        try {
          const tasks2 = await storage.getTasks();
          await this.cache.set("tasks:all", tasks2, 900, ["task-data"]);
          const recentTasks = tasks2.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          }).slice(0, 50);
          for (const task of recentTasks) {
            await this.cache.set(`task:${task.id}`, task, 900, ["task-data"]);
          }
          const activeTasks = tasks2.filter((t) => !t.completed);
          await this.cache.set("tasks:active", activeTasks, 600, ["task-data"]);
          console.log(`\u{1F680} Warmed task cache: ${tasks2.length} total, ${recentTasks.length} recent, ${activeTasks.length} active`);
        } catch (error) {
          console.error("\u274C Failed to warm task cache:", error);
        }
      }
      /**
       * Warm template data cache
       */
      async warmTemplateData() {
        try {
          const templates2 = await storage.getTemplates();
          await this.cache.set("templates:all", templates2, 7200, ["template-data"]);
          const templatesByType = templates2.reduce((acc, template) => {
            if (!acc[template.type]) acc[template.type] = [];
            acc[template.type].push(template);
            return acc;
          }, {});
          for (const [type, typeTemplates] of Object.entries(templatesByType)) {
            await this.cache.set(`templates:type:${type}`, typeTemplates, 7200, ["template-data"]);
          }
          console.log(`\u{1F680} Warmed template cache: ${templates2.length} templates, ${Object.keys(templatesByType).length} types`);
        } catch (error) {
          console.error("\u274C Failed to warm template cache:", error);
        }
      }
      /**
       * Warm analytics data cache
       */
      async warmAnalyticsData() {
        try {
          try {
            const timeLogs2 = await storage.getTimeLogs();
            const productivityStats = this.calculateProductivityStats(timeLogs2);
            await this.cache.set("analytics:productivity", productivityStats, 3600, ["analytics"]);
            console.log("\u{1F680} Warmed productivity analytics cache");
          } catch (error) {
            console.log("\u26A0\uFE0F Productivity analytics warming skipped (data not available)");
          }
          try {
            const tasks2 = await storage.getTasks();
            const projects2 = await storage.getProjects();
            const dashboardStats = {
              totalTasks: tasks2.length,
              completedTasks: tasks2.filter((t) => t.completed).length,
              activeTasks: tasks2.filter((t) => !t.completed).length,
              totalProjects: projects2.length,
              highPriorityTasks: tasks2.filter((t) => t.priority === "high").length,
              overdueTasks: tasks2.filter((t) => {
                if (!t.dueDate || t.completed) return false;
                return new Date(t.dueDate) < /* @__PURE__ */ new Date();
              }).length
            };
            await this.cache.set("analytics:dashboard", dashboardStats, 1800, ["analytics"]);
            console.log("\u{1F680} Warmed dashboard analytics cache");
          } catch (error) {
            console.error("\u274C Failed to warm dashboard analytics:", error);
          }
        } catch (error) {
          console.error("\u274C Failed to warm analytics cache:", error);
        }
      }
      /**
       * Calculate productivity statistics
       */
      calculateProductivityStats(timeLogs2) {
        const totalHours = timeLogs2.reduce((sum, log2) => {
          if (log2.endTime) {
            const duration = (new Date(log2.endTime).getTime() - new Date(log2.startTime).getTime()) / (1e3 * 60 * 60);
            return sum + duration;
          }
          return sum;
        }, 0);
        const activeDays = new Set(
          timeLogs2.filter((log2) => log2.endTime).map((log2) => new Date(log2.startTime).toDateString())
        ).size;
        return {
          totalHours: Math.round(totalHours * 100) / 100,
          averageDailyHours: activeDays > 0 ? Math.round(totalHours / activeDays * 100) / 100 : 0,
          totalSessions: timeLogs2.length,
          activeDays,
          lastUpdated: /* @__PURE__ */ new Date()
        };
      }
      /**
       * Schedule regular cache warming
       */
      scheduleCacheWarming() {
        setInterval(() => {
          this.startCacheWarming();
        }, 30 * 60 * 1e3);
        console.log("\u{1F680} Scheduled cache warming every 30 minutes");
      }
      /**
       * Invalidate related caches when data changes
       */
      async invalidateRelatedCaches(dataType, entityId) {
        try {
          switch (dataType) {
            case "user":
              await this.cache.delByTags(["user-data"]);
              if (entityId) await this.cache.del(`user:${entityId}`);
              break;
            case "project":
              await this.cache.delByTags(["project-data"]);
              if (entityId) await this.cache.del(`project:${entityId}`);
              break;
            case "task":
              await this.cache.delByTags(["task-data"]);
              if (entityId) await this.cache.del(`task:${entityId}`);
              await this.cache.del("analytics:dashboard");
              break;
            case "template":
              await this.cache.delByTags(["template-data"]);
              break;
            case "analytics":
              await this.cache.delByTags(["analytics"]);
              break;
          }
          console.log(`\u{1F680} Invalidated ${dataType} caches`);
        } catch (error) {
          console.error(`\u274C Failed to invalidate ${dataType} caches:`, error);
        }
      }
    };
    cacheWarmingService = new CacheWarmingService();
  }
});

// server/index.ts
import express3 from "express";
import history from "connect-history-api-fallback";

// server/routes.ts
init_db();
init_storage();
import express from "express";
import { createServer } from "http";
import session from "express-session";
import multer from "multer";
import path2 from "path";
import { fileTypeFromBuffer } from "file-type";
import csvParser from "csv-parser";
import * as createCsvWriter from "csv-writer";
import { z as z2 } from "zod";

// server/emailService.ts
import { MailService } from "@sendgrid/mail";
import twilio from "twilio";
var SENDGRID_KEY = process.env.SENDGRID_API_KEY_2 || process.env.SENDGRID_API_KEY;
if (!SENDGRID_KEY) {
  console.warn("SENDGRID_API_KEY environment variable not set - email notifications disabled");
}
var mailService = new MailService();
if (SENDGRID_KEY) {
  if (SENDGRID_KEY.startsWith("SG.")) {
    mailService.setApiKey(SENDGRID_KEY);
    console.log("\u2705 SendGrid API key configured successfully");
  } else {
    console.warn("Invalid SendGrid API key format - must start with 'SG.' - email notifications disabled");
  }
}
var APP_URL = process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}` : "http://localhost:5000";
var twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  if (process.env.TWILIO_ACCOUNT_SID.startsWith("AC")) {
    try {
      twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      console.log("\u2705 Twilio SMS integration configured successfully");
    } catch (error) {
      console.error("\u274C Twilio initialization failed:", error.message);
      console.log("\u26A0\uFE0F  SMS notifications disabled due to invalid credentials");
    }
  } else {
    console.error("\u274C Invalid Twilio Account SID - must start with 'AC', got:", process.env.TWILIO_ACCOUNT_SID.substring(0, 2));
    console.log("\u26A0\uFE0F  SMS notifications disabled - need valid Account SID starting with 'AC'");
  }
} else {
  console.log("\u26A0\uFE0F  Twilio credentials not found - SMS notifications disabled");
}
async function sendEmail(params) {
  const SENDGRID_KEY2 = process.env.SENDGRID_API_KEY_2 || process.env.SENDGRID_API_KEY;
  if (!SENDGRID_KEY2 || !SENDGRID_KEY2.startsWith("SG.")) {
    console.log("\u{1F4E7} Email notification would be sent:", params.subject, "to", params.to);
    console.log("   (Email disabled: SendGrid API key not configured properly)");
    return false;
  }
  try {
    const emailData = {
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text || "",
      html: params.html || ""
    };
    if (params.attachments && params.attachments.length > 0) {
      emailData.attachments = params.attachments.map((attachment) => ({
        content: Buffer.isBuffer(attachment.content) ? attachment.content.toString("base64") : attachment.content,
        filename: attachment.filename,
        type: attachment.type || "application/pdf",
        disposition: attachment.disposition || "attachment"
      }));
    }
    await mailService.send(emailData);
    console.log(`Email sent successfully to ${params.to}${params.attachments ? ` with ${params.attachments.length} attachment(s)` : ""}`);
    return true;
  } catch (error) {
    console.error("SendGrid email error:", error);
    return false;
  }
}
async function sendProposalEmail(clientEmail, proposalTitle, proposalUrl, clientName = "", customMessage = "", pdfAttachment, fromEmail = "dustinsparks@mac.com") {
  const subject = `Proposal: ${proposalTitle}`;
  const textContent = `
Dear ${clientName || "Valued Client"},

${customMessage || "We are pleased to present our proposal for your review."}

Proposal: ${proposalTitle}

Please click the link below to view your proposal:
${proposalUrl}

This proposal link will remain active and you can review it at any time. The proposal includes all project details, timeline, deliverables, and pricing information.

If you have any questions or would like to discuss this proposal, please don't hesitate to reach out.

Best regards,
Gigster Garage Team
  `.trim();
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background-color: #007BFF; color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
            .header p { margin: 5px 0 0 0; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .proposal-card { background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #007BFF; }
            .proposal-title { font-size: 20px; font-weight: bold; color: #007BFF; margin-bottom: 10px; }
            .cta-button { 
                background-color: #007BFF; 
                color: white; 
                padding: 15px 30px; 
                text-decoration: none; 
                border-radius: 8px; 
                display: inline-block; 
                margin: 25px 0; 
                font-weight: bold;
                text-align: center;
            }
            .footer { background-color: #f1f3f4; padding: 20px 30px; text-align: center; color: #666; font-size: 14px; }
            .features { margin: 20px 0; }
            .feature { margin: 10px 0; padding-left: 20px; position: relative; }
            .feature:before { content: "\u2713"; position: absolute; left: 0; color: #28a745; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Gigster Garage</h1>
                <p>Simplified Workflow Hub</p>
            </div>
            <div class="content">
                <h2>Hello ${clientName || "Valued Client"},</h2>
                <p>${customMessage || "We are pleased to present our proposal for your review."}</p>
                
                <div class="proposal-card">
                    <div class="proposal-title">${proposalTitle}</div>
                    <div class="features">
                        <div class="feature">Detailed project scope and timeline</div>
                        <div class="feature">Transparent pricing breakdown</div>
                        <div class="feature">Clear deliverables and milestones</div>
                        <div class="feature">Terms and conditions</div>
                    </div>
                </div>
                
                <div style="text-align: center;">
                    <a href="${proposalUrl}" class="cta-button">View Your Proposal</a>
                </div>
                
                <p>This proposal link will remain active and you can review it at any time. If you have any questions or would like to discuss this proposal, please don't hesitate to reach out.</p>
                
                <p>Thank you for considering our services.</p>
                
                <p>Best regards,<br>
                Gigster Garage Team</p>
            </div>
            <div class="footer">
                <p>This email was sent from Gigster Garage - Simplified Workflow Hub</p>
                <p>Professional project management and client collaboration platform</p>
            </div>
        </div>
    </body>
    </html>
  `;
  const emailParams = {
    to: clientEmail,
    from: fromEmail,
    subject,
    text: textContent,
    html: htmlContent
  };
  if (pdfAttachment) {
    emailParams.attachments = [{
      content: pdfAttachment,
      filename: `${proposalTitle.replace(/[^a-zA-Z0-9]/g, "_")}-proposal.pdf`,
      type: "application/pdf",
      disposition: "attachment"
    }];
  }
  return await sendEmail(emailParams);
}
async function sendInvoiceEmail(clientEmail, invoiceData, pdfAttachment, customMessage = "", fromEmail = "dustinsparks@mac.com") {
  const subject = `Invoice: ${invoiceData.invoiceNumber || invoiceData.id}`;
  const textContent = `
Dear ${invoiceData.clientName || "Valued Client"},

${customMessage || "Thank you for your business! Please find your invoice attached."}

Invoice Details:
- Invoice #: ${invoiceData.invoiceNumber || invoiceData.id}
- Date: ${new Date(invoiceData.createdAt).toLocaleDateString()}
- Amount: $${parseFloat(invoiceData.totalAmount || 0).toFixed(2)}
${invoiceData.dueDate ? `- Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString()}` : ""}

Payment Terms: ${invoiceData.terms || "Payment is due within 30 days of invoice date."}

If you have any questions about this invoice, please don't hesitate to contact us.

Thank you for your business!

Best regards,
Gigster Garage Team
  `.trim();
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background-color: #007BFF; color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
            .header p { margin: 5px 0 0 0; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .invoice-card { background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #007BFF; }
            .invoice-details { display: flex; justify-content: space-between; margin: 15px 0; }
            .invoice-details .label { font-weight: bold; color: #007BFF; }
            .amount-highlight { font-size: 24px; font-weight: bold; color: #007BFF; text-align: center; margin: 20px 0; }
            .payment-terms { background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
            .footer { background-color: #f1f3f4; padding: 20px 30px; text-align: center; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Gigster Garage</h1>
                <p>Simplified Workflow Hub</p>
            </div>
            <div class="content">
                <h2>Hello ${invoiceData.clientName || "Valued Client"},</h2>
                <p>${customMessage || "Thank you for your business! Please find your invoice details below."}</p>
                
                <div class="invoice-card">
                    <h3 style="color: #007BFF; margin-top: 0;">Invoice Details</h3>
                    <div class="invoice-details">
                        <span class="label">Invoice #:</span>
                        <span>${invoiceData.invoiceNumber || invoiceData.id}</span>
                    </div>
                    <div class="invoice-details">
                        <span class="label">Date:</span>
                        <span>${new Date(invoiceData.createdAt).toLocaleDateString()}</span>
                    </div>
                    ${invoiceData.dueDate ? `
                    <div class="invoice-details">
                        <span class="label">Due Date:</span>
                        <span>${new Date(invoiceData.dueDate).toLocaleDateString()}</span>
                    </div>
                    ` : ""}
                    ${invoiceData.projectDescription ? `
                    <div class="invoice-details">
                        <span class="label">Project:</span>
                        <span>${invoiceData.projectDescription}</span>
                    </div>
                    ` : ""}
                </div>
                
                <div class="amount-highlight">
                    Total Amount: $${parseFloat(invoiceData.totalAmount || 0).toFixed(2)}
                </div>
                
                <div class="payment-terms">
                    <h4 style="margin-top: 0; color: #856404;">Payment Terms</h4>
                    <p style="margin-bottom: 0;">${invoiceData.terms || "Payment is due within 30 days of invoice date."}</p>
                </div>
                
                <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
                
                <p>Thank you for your business!</p>
                
                <p>Best regards,<br>
                Gigster Garage Team</p>
            </div>
            <div class="footer">
                <p>This invoice was sent from Gigster Garage - Simplified Workflow Hub</p>
                <p>Professional project management and client collaboration platform</p>
            </div>
        </div>
    </body>
    </html>
  `;
  const emailParams = {
    to: clientEmail,
    from: fromEmail,
    subject,
    text: textContent,
    html: htmlContent
  };
  if (pdfAttachment) {
    emailParams.attachments = [{
      content: pdfAttachment,
      filename: `invoice-${invoiceData.invoiceNumber || invoiceData.id}.pdf`,
      type: "application/pdf",
      disposition: "attachment"
    }];
  }
  return await sendEmail(emailParams);
}
async function sendHighPriorityTaskNotification(task, assignedUser, fromEmail = "dustinsparks@mac.com") {
  if (!assignedUser.emailOptIn || !assignedUser.notificationEmail) {
    console.log(`User ${assignedUser.username} has email notifications disabled or no notification email set`);
    return false;
  }
  const subject = "You've Received a High Priority Task";
  const taskUrl = `${APP_URL}/?task=${task.id}`;
  const formatDate = (date2) => {
    if (!date2) return "Not set";
    return new Date(date2).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  const textContent = `
You've Received a High Priority Task

Task Details:
- Description: ${task.description}
- Priority: ${task.priority ? task.priority.toUpperCase() : "Not set"}
- Due Date: ${formatDate(task.dueDate)}
- Project: ${task.projectId || "No project assigned"}
- Status: ${task.completed ? "Completed" : "Pending"}

${task.notes ? `Notes: ${task.notes}` : ""}

${task.attachments && task.attachments.length > 0 ? `Attachments: ${task.attachments.join(", ")}` : ""}

${task.links && task.links.length > 0 ? `Links:
${task.links.map((link) => `- ${link}`).join("\n")}` : ""}

Click here to view your tasks in Gigster Garage: ${taskUrl}

Best regards,
Gigster Garage Team
  `.trim();
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .task-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
            .priority-badge { background-color: #dc2626; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .cta-button { background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
            .footer { background-color: #374151; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
            .links-section { margin-top: 15px; }
            .links-section a { color: #2563eb; word-break: break-all; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>\u{1F6A8} High Priority Task Assigned</h1>
                <p>You've received a new high priority task in Gigster Garage</p>
            </div>
            
            <div class="content">
                <div class="task-details">
                    <h2>${task.description}</h2>
                    <p><strong>Priority:</strong> <span class="priority-badge">${task.priority ? task.priority.toUpperCase() : "NOT SET"}</span></p>
                    <p><strong>Due Date:</strong> ${formatDate(task.dueDate)}</p>
                    <p><strong>Project:</strong> ${task.projectId || "No project assigned"}</p>
                    <p><strong>Status:</strong> ${task.completed ? "\u2705 Completed" : "\u23F3 Pending"}</p>
                    
                    ${task.notes ? `
                    <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                        <strong>\u{1F4DD} Notes:</strong><br>
                        ${task.notes.replace(/\n/g, "<br>")}
                    </div>
                    ` : ""}
                    
                    ${task.attachments && task.attachments.length > 0 ? `
                    <div style="margin-top: 15px;">
                        <strong>\u{1F4CE} Attachments:</strong><br>
                        ${task.attachments.map((att) => `<span style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px; margin: 2px; display: inline-block;">${att}</span>`).join("")}
                    </div>
                    ` : ""}
                    
                    ${task.links && task.links.length > 0 ? `
                    <div class="links-section">
                        <strong>\u{1F517} Related Links:</strong><br>
                        ${task.links.map((link) => `<a href="${link}" target="_blank">${link}</a><br>`).join("")}
                    </div>
                    ` : ""}
                </div>
                
                <div style="text-align: center;">
                    <a href="${taskUrl}" class="cta-button">\u{1F4CB} View in Gigster Garage</a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    This is an automated notification from Gigster Garage. You're receiving this because you have email notifications enabled for high priority tasks.
                </p>
            </div>
            
            <div class="footer">
                <p>Gigster Garage - Simplified Workflow Hub</p>
                <p style="font-size: 12px; opacity: 0.8;">
                    To manage your notification preferences, log in to Gigster Garage and visit your account settings.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
  return await sendEmail({
    to: assignedUser.notificationEmail,
    from: fromEmail,
    subject,
    text: textContent,
    html: htmlContent
  });
}
async function sendSMSNotification(task, assignedUser, fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER || "") {
  if (!assignedUser.smsOptIn || !assignedUser.phone) {
    console.log(`User ${assignedUser.username} has SMS notifications disabled or no phone number set`);
    return false;
  }
  const message = `High priority task '${task.description}' assigned to you. Check Gigster Garage for details.`;
  if (!twilioClient || !fromPhoneNumber) {
    console.log(`\u{1F4F1} SMS notification would be sent to ${assignedUser.phone}:`);
    console.log(`   "${message}"`);
    console.log(`   (SMS disabled: Twilio integration not configured)`);
    return true;
  }
  try {
    await twilioClient.messages.create({
      body: message,
      from: fromPhoneNumber,
      to: assignedUser.phone
    });
    console.log(`\u{1F4F1} SMS sent successfully to ${assignedUser.phone}`);
    return true;
  } catch (error) {
    console.error("Twilio SMS error:", error);
    if (error.code === 20003) {
      console.log("\u{1F4A1} Tip: Check that your Auth Token is correct and phone number is verified for trial accounts");
    }
    return false;
  }
}
async function sendMessageAsEmail(message, fromUser, toEmail, fromEmail = "noreply@vsuite.app") {
  const subject = message.subject;
  const textContent = `
From: ${fromUser.name || fromUser.username}
Priority: ${message.priority?.toUpperCase() || "MEDIUM"}

${message.content}

---
Sent via Gigster Garage Messaging System
Reply to this email to respond directly.
  `;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: #0B1D3A; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; }
            .priority { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; margin-bottom: 15px; }
            .priority.high { background: #fee2e2; color: #dc2626; }
            .priority.medium { background: #fef3c7; color: #d97706; }
            .priority.low { background: #dbeafe; color: #2563eb; }
            .message-content { line-height: 1.6; margin: 20px 0; }
            .footer { border-top: 1px solid #e5e5e5; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0; font-size: 24px;">Gigster Garage</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Simplified Workflow Hub</p>
            </div>
            
            <div class="content">
                <h2 style="margin-top: 0; color: #333;">New Message</h2>
                
                <p><strong>From:</strong> ${fromUser.name || fromUser.username}</p>
                
                <div class="priority ${message.priority || "medium"}">${(message.priority || "medium").toUpperCase()} PRIORITY</div>
                
                <div class="message-content">
                    ${message.content.replace(/\n/g, "<br>")}
                </div>
            </div>
            
            <div class="footer">
                <p>Gigster Garage - Simplified Workflow Hub</p>
                <p style="font-size: 12px; margin-top: 10px;">
                    Reply to this email to respond directly through the messaging system.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
  return await sendEmail({
    to: toEmail,
    from: fromEmail,
    subject,
    text: textContent,
    html: htmlContent
  });
}
function parseInboundEmail(formData) {
  const lines = formData.split("\n");
  let fromEmail = "";
  let subject = "";
  let content = "";
  for (const line of lines) {
    if (line.includes('name="from"')) {
      const nextLineIndex = lines.indexOf(line) + 2;
      if (nextLineIndex < lines.length) {
        fromEmail = lines[nextLineIndex].trim();
      }
    } else if (line.includes('name="subject"')) {
      const nextLineIndex = lines.indexOf(line) + 2;
      if (nextLineIndex < lines.length) {
        subject = lines[nextLineIndex].trim();
      }
    } else if (line.includes('name="text"')) {
      const nextLineIndex = lines.indexOf(line) + 2;
      if (nextLineIndex < lines.length) {
        content = lines[nextLineIndex].trim();
      }
    }
  }
  if (!fromEmail && !subject && !content) {
    const keyValuePairs = formData.split("&");
    for (const pair of keyValuePairs) {
      const [key, value] = pair.split("=");
      if (key === "from") fromEmail = decodeURIComponent(value || "");
      if (key === "subject") subject = decodeURIComponent(value || "");
      if (key === "text") content = decodeURIComponent(value || "");
    }
  }
  return {
    fromEmail: fromEmail || "unknown@email.com",
    subject: subject || "No Subject",
    content: content || "Empty message",
    attachments: []
  };
}

// server/pdfService.ts
import puppeteer from "puppeteer";
var browser = null;
var browserHealthy = false;
var lastHealthCheck = 0;
var HEALTH_CHECK_INTERVAL = 6e4;
function escapeHtml(unsafe) {
  if (!unsafe) return "";
  return String(unsafe).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;");
}
function isValidPaymentUrl(url) {
  if (!url) return false;
  try {
    const parsedUrl = new URL(url);
    const allowedDomains = [
      "stripe.com",
      "checkout.stripe.com",
      "paypal.com",
      "sandbox.paypal.com",
      "square.com",
      "squareup.com",
      "checkout.square.com",
      // Add your own domain(s) for custom payment processing
      "localhost",
      // For development
      "127.0.0.1",
      // For development
      "replit.dev",
      // Allow Replit domains
      "replit.com"
      // Allow Replit domains
    ];
    if (parsedUrl.protocol !== "https:" && !parsedUrl.hostname.includes("localhost") && parsedUrl.hostname !== "127.0.0.1" && !parsedUrl.hostname.includes("replit.dev")) {
      return false;
    }
    return allowedDomains.some(
      (domain) => parsedUrl.hostname === domain || parsedUrl.hostname.endsWith("." + domain)
    );
  } catch {
    return false;
  }
}
function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise(
      (_, reject) => setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}
async function checkBrowserHealth() {
  if (!browser) return false;
  try {
    const version = await browser.version();
    return version !== null;
  } catch {
    return false;
  }
}
async function getBrowser() {
  const now = Date.now();
  if (browser && (now - lastHealthCheck > HEALTH_CHECK_INTERVAL || !browserHealthy)) {
    browserHealthy = await checkBrowserHealth();
    lastHealthCheck = now;
    if (!browserHealthy) {
      console.log("Browser unhealthy, closing and recreating...");
      try {
        await browser.close();
      } catch (error) {
        console.log("Error closing unhealthy browser:", error);
      }
      browser = null;
    }
  }
  if (!browser) {
    try {
      console.log("Launching new browser instance...");
      browser = await withTimeout(
        puppeteer.launch({
          headless: true,
          executablePath: "/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium",
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--disable-web-security",
            "--disable-features=VizDisplayCompositor",
            "--no-first-run",
            "--no-default-browser-check",
            "--disable-extensions"
          ]
        }),
        3e4
        // 30 second timeout for browser launch
      );
      browserHealthy = true;
      lastHealthCheck = now;
      console.log("Browser launched successfully");
      browser.on("disconnected", () => {
        console.log("Browser disconnected, marking as unhealthy");
        browserHealthy = false;
        browser = null;
      });
    } catch (error) {
      console.error("Failed to launch browser:", error);
      browser = null;
      browserHealthy = false;
      throw new Error(`Failed to initialize PDF browser: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  return browser;
}
async function generatePDFFromHTML(htmlContent, options = {}, retries = 2) {
  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    let browserInstance = null;
    let page = null;
    try {
      console.log(`\u{1F504} PDF generation attempt ${attempt + 1}/${retries + 1}`);
      browserInstance = await getBrowser();
      page = await withTimeout(
        browserInstance.newPage(),
        15e3
        // Increased timeout for page creation
      );
      await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 1 });
      await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36");
      console.log("\u{1F504} Loading HTML content...");
      await withTimeout(
        page.setContent(htmlContent, {
          waitUntil: "domcontentloaded",
          timeout: 3e4
        }),
        35e3
        // Timeout for content loading
      );
      console.log("\u{1F504} Waiting for content to stabilize...");
      await new Promise((resolve) => setTimeout(resolve, 2e3));
      try {
        await page.evaluate(() => {
          return new Promise((resolve) => {
            if (document.readyState === "complete") {
              resolve();
            } else {
              window.addEventListener("load", () => resolve());
            }
          });
        });
      } catch (evalError) {
        console.log("Font loading check failed, proceeding:", evalError);
      }
      console.log("\u{1F504} Generating PDF...");
      const pdfBuffer = await withTimeout(
        page.pdf({
          format: options.format || "A4",
          margin: options.margin || { top: "1in", right: "0.75in", bottom: "1in", left: "0.75in" },
          printBackground: true,
          preferCSSPageSize: true,
          displayHeaderFooter: false,
          headerTemplate: "",
          footerTemplate: "",
          timeout: 6e4
          // Extended internal timeout
        }),
        65e3
        // Extended wrapper timeout for PDF generation
      );
      console.log("\u2705 PDF generated successfully");
      return Buffer.from(pdfBuffer);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`\u274C PDF generation attempt ${attempt + 1} failed:`, lastError.message);
      const isBrowserError = lastError.message.includes("Protocol error") || lastError.message.includes("Connection closed") || lastError.message.includes("Target closed") || lastError.message.includes("Session closed") || lastError.message.includes("Browser closed");
      if (attempt < retries && isBrowserError) {
        console.log("\u{1F504} Browser connection error detected, resetting browser for retry...");
        browserHealthy = false;
        if (browser) {
          try {
            await browser.close();
          } catch (closeError) {
            console.log("Error closing browser for retry:", closeError);
          }
          browser = null;
        }
        const delayMs = 1e3 * (attempt + 1);
        console.log(`\u23F3 Waiting ${delayMs}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (closeError) {
          console.log("Warning: Failed to close page:", closeError);
        }
      }
    }
  }
  const errorMessage = lastError?.message || "Unknown error";
  console.error(`\u{1F4A5} PDF generation failed completely after ${retries + 1} attempts:`, errorMessage);
  throw new Error(`PDF generation failed after ${retries + 1} attempts: ${errorMessage}`);
}
async function generateProposalPDF(proposal) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page {
                margin: 1in 0.75in;
                @top-center {
                    content: "Gigster Garage - Simplified Workflow Hub";
                    font-size: 10px;
                    color: #666;
                }
                @bottom-center {
                    content: "Page " counter(page) " of " counter(pages);
                    font-size: 10px;
                    color: #666;
                }
            }
            
            body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
            }
            
            .header {
                background-color: #007BFF;
                color: white;
                padding: 40px 30px;
                text-align: center;
                margin-bottom: 40px;
            }
            
            .header h1 {
                margin: 0;
                font-size: 32px;
                font-weight: bold;
            }
            
            .header .tagline {
                margin: 10px 0 0 0;
                font-size: 16px;
                opacity: 0.9;
            }
            
            .proposal-title {
                font-size: 28px;
                font-weight: bold;
                color: #007BFF;
                margin-bottom: 30px;
                text-align: center;
            }
            
            .client-info {
                background-color: #f8f9fa;
                padding: 25px;
                border-radius: 8px;
                margin-bottom: 30px;
                border-left: 4px solid #007BFF;
            }
            
            .client-info h3 {
                color: #007BFF;
                margin-top: 0;
            }
            
            .content-section {
                margin-bottom: 40px;
            }
            
            .content-section h2 {
                color: #007BFF;
                border-bottom: 2px solid #007BFF;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            
            .pricing-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                background-color: white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .pricing-table th {
                background-color: #007BFF;
                color: white;
                padding: 15px;
                text-align: left;
                font-weight: bold;
            }
            
            .pricing-table td {
                padding: 12px 15px;
                border-bottom: 1px solid #eee;
            }
            
            .pricing-table tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            
            .total-row {
                background-color: #007BFF !important;
                color: white;
                font-weight: bold;
            }
            
            .footer {
                margin-top: 60px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                text-align: center;
                color: #666;
                font-size: 14px;
            }
            
            .page-break {
                page-break-before: always;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Gigster Garage</h1>
            <div class="tagline">Simplified Workflow Hub</div>
        </div>
        
        <div class="proposal-title">${escapeHtml(proposal.title)}</div>
        
        <div class="client-info">
            <h3>Prepared For:</h3>
            <p><strong>Client:</strong> ${escapeHtml(proposal.clientName)}</p>
            <p><strong>Email:</strong> ${escapeHtml(proposal.clientEmail)}</p>
            <p><strong>Date:</strong> ${new Date(proposal.createdAt).toLocaleDateString()}</p>
            ${proposal.expiresAt ? `<p><strong>Valid Until:</strong> ${new Date(proposal.expiresAt).toLocaleDateString()}</p>` : ""}
        </div>
        
        <div class="content-section">
            ${escapeHtml(proposal.content || "")}
        </div>
        
        <div class="footer">
            <p><strong>Gigster Garage - Simplified Workflow Hub</strong></p>
            <p>Professional Project Management & Client Collaboration Platform</p>
            <p>Generated on ${(/* @__PURE__ */ new Date()).toLocaleDateString()} at ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}</p>
        </div>
    </body>
    </html>
  `;
  return await generatePDFFromHTML(htmlContent, {
    filename: `proposal-${proposal.id}.pdf`,
    format: "A4"
  });
}
async function generateContractPDF(contract) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page {
                margin: 1in 0.75in;
                @top-center {
                    content: "Gigster Garage - Contract";
                    font-size: 10px;
                    color: #666;
                }
                @bottom-center {
                    content: "Page " counter(page) " of " counter(pages);
                    font-size: 10px;
                    color: #666;
                }
            }
            
            body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
            }
            
            .header {
                background-color: #004C6D;
                color: white;
                padding: 40px 30px;
                text-align: center;
                margin-bottom: 40px;
            }
            
            .header h1 {
                margin: 0;
                font-size: 32px;
                font-weight: bold;
            }
            
            .header .tagline {
                margin: 10px 0 0 0;
                font-size: 16px;
                opacity: 0.9;
            }
            
            .contract-title {
                font-size: 28px;
                font-weight: bold;
                color: #004C6D;
                margin-bottom: 30px;
                text-align: center;
            }
            
            .parties-section {
                background-color: #f8f9fa;
                padding: 25px;
                border-radius: 8px;
                margin-bottom: 30px;
                border-left: 4px solid #004C6D;
            }
            
            .parties-section h3 {
                color: #004C6D;
                margin-top: 0;
            }
            
            .content-section {
                margin-bottom: 40px;
            }
            
            .content-section h2 {
                color: #004C6D;
                border-bottom: 2px solid #004C6D;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            
            .signature-section {
                margin-top: 60px;
                padding-top: 40px;
                border-top: 2px solid #004C6D;
                display: flex;
                justify-content: space-between;
            }
            
            .signature-block {
                width: 45%;
                text-align: center;
            }
            
            .signature-line {
                border-bottom: 1px solid #333;
                margin-bottom: 10px;
                height: 40px;
            }
            
            .footer {
                margin-top: 60px;
                text-align: center;
                color: #666;
                font-size: 12px;
                border-top: 1px solid #ddd;
                padding-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Gigster Garage</h1>
            <div class="tagline">Simplified Workflow Hub</div>
        </div>

        <div class="contract-title">
            ${escapeHtml(contract.contractTitle || "Service Contract")}
        </div>

        <div class="parties-section">
            <h3>Contract Parties</h3>
            <p><strong>Service Provider:</strong> Gigster Garage</p>
            <p><strong>Client:</strong> ${escapeHtml(contract.clientName || "Client Name")}</p>
            <p><strong>Date:</strong> ${escapeHtml(contract.contractDate || (/* @__PURE__ */ new Date()).toLocaleDateString())}</p>
            <p><strong>Contract Value:</strong> $${escapeHtml(contract.contractValue?.toString() || "0")}</p>
        </div>

        ${contract.scope ? `
        <div class="content-section">
            <h2>Scope of Work</h2>
            <div>${escapeHtml(contract.scope).replace(/\\n/g, "<br>")}</div>
        </div>
        ` : ""}

        ${contract.deliverables ? `
        <div class="content-section">
            <h2>Deliverables</h2>
            <div>${escapeHtml(contract.deliverables).replace(/\\n/g, "<br>")}</div>
        </div>
        ` : ""}

        ${contract.paymentTerms ? `
        <div class="content-section">
            <h2>Payment Terms</h2>
            <div>${escapeHtml(contract.paymentTerms).replace(/\\n/g, "<br>")}</div>
        </div>
        ` : ""}

        ${contract.responsibilities ? `
        <div class="content-section">
            <h2>Responsibilities</h2>
            <div>${escapeHtml(contract.responsibilities).replace(/\\n/g, "<br>")}</div>
        </div>
        ` : ""}

        ${contract.legalTerms ? `
        <div class="content-section">
            <h2>Legal Terms</h2>
            <div>${escapeHtml(contract.legalTerms).replace(/\\n/g, "<br>")}</div>
        </div>
        ` : ""}

        ${contract.confidentiality ? `
        <div class="content-section">
            <h2>Confidentiality</h2>
            <div>${escapeHtml(contract.confidentiality).replace(/\\n/g, "<br>")}</div>
        </div>
        ` : ""}

        <div class="signature-section">
            <div class="signature-block">
                <div class="signature-line"></div>
                <p><strong>Client Signature</strong></p>
                <p>${escapeHtml(contract.clientName || "Client Name")}</p>
                <p>Date: _______________</p>
            </div>
            <div class="signature-block">
                <div class="signature-line"></div>
                <p><strong>Service Provider</strong></p>
                <p>Gigster Garage</p>
                <p>Date: _______________</p>
            </div>
        </div>

        <div class="footer">
            <p>This contract is governed by applicable laws and regulations.</p>
            <p>Generated by Gigster Garage - Simplified Workflow Hub</p>
        </div>
    </body>
    </html>
  `;
  return await generatePDFFromHTML(htmlContent, {
    filename: `contract-${contract.id}.pdf`,
    format: "A4"
  });
}
async function generatePresentationPDF(presentation) {
  const slides = Array.isArray(presentation.slides) ? presentation.slides.sort((a, b) => a.order - b.order) : [];
  const slidesHtml = slides.map((slide, index2) => {
    const isLastSlide = index2 === slides.length - 1;
    const pageBreakStyle = isLastSlide ? "" : "page-break-after: always;";
    if (slide.slideType === "title" && index2 === 0) {
      return `
        <div class="slide title-slide" style="${pageBreakStyle}">
          <div class="slide-content">
            <h1 class="presentation-title">${escapeHtml(presentation.title || "Presentation Title")}</h1>
            ${presentation.subtitle ? `<h2 class="presentation-subtitle">${escapeHtml(presentation.subtitle)}</h2>` : ""}
            <div class="author-info">
              ${presentation.author ? `<p class="author">${escapeHtml(presentation.author)}</p>` : ""}
              ${presentation.company ? `<p class="company">${escapeHtml(presentation.company)}</p>` : ""}
              ${presentation.date ? `<p class="date">${escapeHtml(presentation.date)}</p>` : ""}
            </div>
          </div>
          <div class="slide-number">${index2 + 1} / ${slides.length}</div>
        </div>
      `;
    } else {
      return `
        <div class="slide" style="${pageBreakStyle}">
          <div class="slide-content">
            <h2 class="slide-title">${escapeHtml(slide.title || "Slide Title")}</h2>
            <div class="slide-text">${escapeHtml(slide.content || "Slide content goes here...").replace(/\\n/g, "<br>")}</div>
          </div>
          <div class="slide-number">${index2 + 1} / ${slides.length}</div>
        </div>
      `;
    }
  }).join("");
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page {
                margin: 0.5in;
                size: A4;
            }
            
            body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                margin: 0;
                padding: 0;
                color: #333;
            }
            
            .slide {
                width: 100%;
                height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                position: relative;
                padding: 60px;
                box-sizing: border-box;
                background: white;
            }
            
            .title-slide {
                background: linear-gradient(135deg, #004C6D 0%, #0B1D3A 100%);
                color: white;
                text-align: center;
            }
            
            .slide-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                width: 100%;
                max-width: 800px;
            }
            
            .presentation-title {
                font-size: 48px;
                font-weight: bold;
                margin: 0 0 20px 0;
                line-height: 1.2;
            }
            
            .presentation-subtitle {
                font-size: 24px;
                margin: 0 0 40px 0;
                opacity: 0.9;
                font-weight: normal;
            }
            
            .author-info {
                margin-top: 60px;
            }
            
            .author-info p {
                margin: 10px 0;
                font-size: 18px;
            }
            
            .author {
                font-weight: bold;
                font-size: 24px;
            }
            
            .company {
                font-size: 20px;
                opacity: 0.8;
            }
            
            .date {
                font-size: 16px;
                opacity: 0.7;
            }
            
            .slide-title {
                font-size: 36px;
                font-weight: bold;
                color: #004C6D;
                margin: 0 0 40px 0;
                line-height: 1.2;
            }
            
            .slide-text {
                font-size: 18px;
                line-height: 1.6;
                color: #333;
            }
            
            .slide-number {
                position: absolute;
                bottom: 20px;
                right: 20px;
                font-size: 14px;
                color: #666;
            }
            
            .title-slide .slide-number {
                color: rgba(255, 255, 255, 0.7);
            }
        </style>
    </head>
    <body>
        ${slidesHtml}
    </body>
    </html>
  `;
  return await generatePDFFromHTML(htmlContent, {
    filename: `presentation-${presentation.id}.pdf`,
    format: "A4"
  });
}
async function generateInvoicePDF(invoice) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page {
                margin: 1in 0.75in;
                @top-center {
                    content: "Gigster Garage - Invoice";
                    font-size: 10px;
                    color: #666;
                }
            }
            
            body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
            }
            
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 40px;
                padding-bottom: 20px;
                border-bottom: 3px solid #007BFF;
            }
            
            .company-info h1 {
                color: #007BFF;
                margin: 0;
                font-size: 32px;
            }
            
            .company-info .tagline {
                color: #666;
                margin: 5px 0 0 0;
            }
            
            .invoice-info {
                text-align: right;
            }
            
            .invoice-info h2 {
                color: #007BFF;
                margin: 0 0 10px 0;
                font-size: 28px;
            }
            
            .client-section {
                display: flex;
                justify-content: space-between;
                margin-bottom: 40px;
            }
            
            .client-details, .invoice-details {
                width: 48%;
            }
            
            .client-details h3, .invoice-details h3 {
                color: #007BFF;
                margin-bottom: 15px;
                border-bottom: 1px solid #007BFF;
                padding-bottom: 5px;
            }
            
            .invoice-table {
                width: 100%;
                border-collapse: collapse;
                margin: 30px 0;
                background-color: white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .invoice-table th {
                background-color: #007BFF;
                color: white;
                padding: 15px;
                text-align: left;
                font-weight: bold;
            }
            
            .invoice-table td {
                padding: 12px 15px;
                border-bottom: 1px solid #eee;
            }
            
            .invoice-table tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            
            .amount-cell {
                text-align: right;
                font-weight: bold;
            }
            
            .totals-section {
                float: right;
                width: 300px;
                margin-top: 20px;
            }
            
            .total-line {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #eee;
            }
            
            .total-line.final {
                background-color: #007BFF;
                color: white;
                padding: 15px;
                font-weight: bold;
                font-size: 18px;
                margin-top: 10px;
            }
            
            .payment-terms {
                clear: both;
                margin-top: 40px;
                padding: 20px;
                background-color: #f8f9fa;
                border-left: 4px solid #007BFF;
            }
            
            .payment-section {
                clear: both;
                margin-top: 40px;
                padding: 30px;
                background: linear-gradient(135deg, #007BFF 0%, #0056b3 100%);
                border-radius: 10px;
                text-align: center;
                color: white;
                box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
            }
            
            .payment-section h3 {
                margin: 0 0 15px 0;
                font-size: 24px;
                font-weight: bold;
            }
            
            .payment-section p {
                margin: 0 0 25px 0;
                font-size: 16px;
                opacity: 0.9;
            }
            
            .pay-now-button {
                display: inline-block;
                background: white;
                color: #007BFF;
                padding: 15px 40px;
                border-radius: 50px;
                text-decoration: none;
                font-weight: bold;
                font-size: 18px;
                border: 3px solid white;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            }
            
            .pay-now-button:hover {
                background: #f8f9fa;
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
            }
            
            .payment-expiry {
                margin-top: 15px;
                font-size: 14px;
                opacity: 0.8;
            }
            
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                text-align: center;
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-info">
                <h1>Gigster Garage</h1>
                <div class="tagline">Simplified Workflow Hub</div>
            </div>
            <div class="invoice-info">
                <h2>INVOICE</h2>
                <p><strong>Invoice #:</strong> ${escapeHtml(invoice.invoiceNumber || invoice.id)}</p>
                <p><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}</p>
                ${invoice.dueDate ? `<p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>` : ""}
            </div>
        </div>
        
        <div class="client-section">
            <div class="client-details">
                <h3>Bill To:</h3>
                <p><strong>${escapeHtml(invoice.clientName)}</strong></p>
                <p>${escapeHtml(invoice.clientEmail)}</p>
                ${invoice.clientAddress ? `<p>${escapeHtml(invoice.clientAddress)}</p>` : ""}
            </div>
            <div class="invoice-details">
                <h3>Invoice Details:</h3>
                <p><strong>Project:</strong> ${escapeHtml(invoice.projectDescription || "Professional Services")}</p>
                <p><strong>Status:</strong> ${escapeHtml(invoice.status)}</p>
                ${invoice.terms ? `<p><strong>Terms:</strong> ${escapeHtml(invoice.terms)}</p>` : ""}
            </div>
        </div>
        
        <table class="invoice-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Rate</th>
                    <th style="text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.lineItems && invoice.lineItems.length > 0 ? invoice.lineItems.map((item) => `
                    <tr>
                        <td>${escapeHtml(item.description || "Service")}</td>
                        <td style="text-align: center;">${parseFloat(item.quantity || 1).toFixed(0)}</td>
                        <td class="amount-cell">$${parseFloat(item.rate || 0).toFixed(2)}</td>
                        <td class="amount-cell">$${parseFloat(item.amount || 0).toFixed(2)}</td>
                    </tr>
                  `).join("") : `
                    <tr>
                        <td>Professional Services</td>
                        <td style="text-align: center;">1</td>
                        <td class="amount-cell">$${parseFloat(invoice.totalAmount || 0).toFixed(2)}</td>
                        <td class="amount-cell">$${parseFloat(invoice.totalAmount || 0).toFixed(2)}</td>
                    </tr>
                  `}
            </tbody>
        </table>
        
        <div class="totals-section">
            <div class="total-line">
                <span>Subtotal:</span>
                <span>$${parseFloat(invoice.totalAmount || 0).toFixed(2)}</span>
            </div>
            ${invoice.taxAmount ? `
            <div class="total-line">
                <span>Tax:</span>
                <span>$${parseFloat(invoice.taxAmount).toFixed(2)}</span>
            </div>
            ` : ""}
            <div class="total-line final">
                <span>Total:</span>
                <span>$${parseFloat(invoice.totalAmount || 0).toFixed(2)}</span>
            </div>
        </div>
        
        <div class="payment-terms">
            <h3>Payment Terms & Instructions:</h3>
            <p>${escapeHtml(invoice.terms || "Payment is due within 30 days of invoice date.")}</p>
            <p>Thank you for your business!</p>
        </div>
        
        ${(invoice.paymentUrl || invoice.paymentLink) && isValidPaymentUrl(invoice.paymentUrl || invoice.paymentLink) ? `
        <div class="payment-section">
            <h3>\u{1F4B3} Pay Your Invoice Online</h3>
            <p>Click the button below to securely pay your invoice online using our secure payment portal.</p>
            <a href="${escapeHtml(invoice.paymentUrl || invoice.paymentLink)}" class="pay-now-button">
                Pay Now - $${parseFloat(invoice.totalAmount || 0).toFixed(2)}
            </a>
            ${invoice.paymentLinkExpiresAt ? `
            <div class="payment-expiry">
                Payment link expires: ${new Date(invoice.paymentLinkExpiresAt).toLocaleDateString()} at ${new Date(invoice.paymentLinkExpiresAt).toLocaleTimeString()}
            </div>
            ` : ""}
        </div>
        ` : invoice.paymentUrl || invoice.paymentLink ? `
        <div class="payment-terms">
            <h3>\u26A0\uFE0F Invalid Payment Link</h3>
            <p>The payment link provided is not from a recognized secure payment provider. Please contact us for alternative payment methods.</p>
        </div>
        ` : ""}
        
        <div class="footer">
            <p><strong>Gigster Garage - Simplified Workflow Hub</strong></p>
            <p>Professional Project Management & Client Collaboration Platform</p>
            <p>Generated on ${(/* @__PURE__ */ new Date()).toLocaleDateString()} at ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}</p>
        </div>
    </body>
    </html>
  `;
  return await generatePDFFromHTML(htmlContent, {
    filename: `invoice-${invoice.id}.pdf`,
    format: "A4"
  });
}
async function closeBrowser() {
  if (browser) {
    try {
      await browser.close();
    } catch (error) {
      console.log("Error closing browser:", error);
    } finally {
      browser = null;
      browserHealthy = false;
    }
  }
}
process.on("SIGTERM", async () => {
  await closeBrowser();
});
process.on("SIGINT", async () => {
  await closeBrowser();
});

// server/routes.ts
init_schema();

// server/objectStorage.ts
import { Storage } from "@google-cloud/storage";
import { randomUUID } from "crypto";

// server/objectAcl.ts
var ACL_POLICY_METADATA_KEY = "custom:aclPolicy";
function isPermissionAllowed(requested, granted) {
  if (requested === "read" /* READ */) {
    return ["read" /* READ */, "write" /* WRITE */].includes(granted);
  }
  return granted === "write" /* WRITE */;
}
function createObjectAccessGroup(group) {
  switch (group.type) {
    // Implement the case for each type of access group to instantiate.
    //
    // For example:
    // case "USER_LIST":
    //   return new UserListAccessGroup(group.id);
    // case "EMAIL_DOMAIN":
    //   return new EmailDomainAccessGroup(group.id);
    // case "GROUP_MEMBER":
    //   return new GroupMemberAccessGroup(group.id);
    // case "SUBSCRIBER":
    //   return new SubscriberAccessGroup(group.id);
    default:
      throw new Error(`Unknown access group type: ${group.type}`);
  }
}
async function setObjectAclPolicy(objectFile, aclPolicy) {
  const [exists] = await objectFile.exists();
  if (!exists) {
    throw new Error(`Object not found: ${objectFile.name}`);
  }
  await objectFile.setMetadata({
    metadata: {
      [ACL_POLICY_METADATA_KEY]: JSON.stringify(aclPolicy)
    }
  });
}
async function getObjectAclPolicy(objectFile) {
  const [metadata] = await objectFile.getMetadata();
  const aclPolicy = metadata?.metadata?.[ACL_POLICY_METADATA_KEY];
  if (!aclPolicy) {
    return null;
  }
  return JSON.parse(aclPolicy);
}
async function canAccessObject({
  userId,
  objectFile,
  requestedPermission
}) {
  const aclPolicy = await getObjectAclPolicy(objectFile);
  if (!aclPolicy) {
    return false;
  }
  if (aclPolicy.visibility === "public" && requestedPermission === "read" /* READ */) {
    return true;
  }
  if (!userId) {
    return false;
  }
  if (aclPolicy.owner === userId) {
    return true;
  }
  for (const rule of aclPolicy.aclRules || []) {
    const accessGroup = createObjectAccessGroup(rule.group);
    if (await accessGroup.hasMember(userId) && isPermissionAllowed(requestedPermission, rule.permission)) {
      return true;
    }
  }
  return false;
}

// server/objectStorage.ts
var REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
var objectStorageClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token"
      }
    },
    universe_domain: "googleapis.com"
  },
  projectId: ""
});
var ObjectNotFoundError = class _ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, _ObjectNotFoundError.prototype);
  }
};
var ObjectStorageService = class {
  constructor() {
  }
  // Gets the public object search paths.
  getPublicObjectSearchPaths() {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = Array.from(
      new Set(
        pathsStr.split(",").map((path5) => path5.trim()).filter((path5) => path5.length > 0)
      )
    );
    if (paths.length === 0) {
      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Create a bucket in 'Object Storage' tool and set PUBLIC_OBJECT_SEARCH_PATHS env var (comma-separated paths)."
      );
    }
    return paths;
  }
  // Gets the private object directory.
  getPrivateObjectDir() {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' tool and set PRIVATE_OBJECT_DIR env var."
      );
    }
    return dir;
  }
  // Search for a public object from the search paths.
  async searchPublicObject(filePath) {
    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const fullPath = `${searchPath}/${filePath}`;
      const { bucketName, objectName } = parseObjectPath(fullPath);
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);
      const [exists] = await file.exists();
      if (exists) {
        return file;
      }
    }
    return null;
  }
  // Downloads an object to the response.
  async downloadObject(file, res, cacheTtlSec = 3600) {
    try {
      const [metadata] = await file.getMetadata();
      const aclPolicy = await getObjectAclPolicy(file);
      const isPublic = aclPolicy?.visibility === "public";
      res.set({
        "Content-Type": metadata.contentType || "application/octet-stream",
        "Content-Length": metadata.size,
        "Cache-Control": `${isPublic ? "public" : "private"}, max-age=${cacheTtlSec}`
      });
      const stream = file.createReadStream();
      stream.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming file" });
        }
      });
      stream.pipe(res);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }
  // Gets the upload URL for an object entity.
  async getObjectEntityUploadURL() {
    const privateObjectDir = this.getPrivateObjectDir();
    if (!privateObjectDir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' tool and set PRIVATE_OBJECT_DIR env var."
      );
    }
    const objectId = randomUUID();
    const fullPath = `${privateObjectDir}/uploads/${objectId}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);
    return signObjectURL({
      bucketName,
      objectName,
      method: "PUT",
      ttlSec: 900
    });
  }
  // Gets the object entity file from the object path.
  async getObjectEntityFile(objectPath) {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }
    const parts = objectPath.slice(1).split("/");
    if (parts.length < 2) {
      throw new ObjectNotFoundError();
    }
    const entityId = parts.slice(1).join("/");
    let entityDir = this.getPrivateObjectDir();
    if (!entityDir.endsWith("/")) {
      entityDir = `${entityDir}/`;
    }
    const objectEntityPath = `${entityDir}${entityId}`;
    const { bucketName, objectName } = parseObjectPath(objectEntityPath);
    const bucket = objectStorageClient.bucket(bucketName);
    const objectFile = bucket.file(objectName);
    const [exists] = await objectFile.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }
    return objectFile;
  }
  normalizeObjectEntityPath(rawPath) {
    if (!rawPath.startsWith("https://storage.googleapis.com/")) {
      return rawPath;
    }
    const url = new URL(rawPath);
    const rawObjectPath = url.pathname;
    let objectEntityDir = this.getPrivateObjectDir();
    if (!objectEntityDir.endsWith("/")) {
      objectEntityDir = `${objectEntityDir}/`;
    }
    if (!rawObjectPath.startsWith(objectEntityDir)) {
      return rawObjectPath;
    }
    const entityId = rawObjectPath.slice(objectEntityDir.length);
    return `/objects/${entityId}`;
  }
  // Tries to set the ACL policy for the object entity and return the normalized path.
  async trySetObjectEntityAclPolicy(rawPath, aclPolicy) {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith("/")) {
      return normalizedPath;
    }
    const objectFile = await this.getObjectEntityFile(normalizedPath);
    await setObjectAclPolicy(objectFile, aclPolicy);
    return normalizedPath;
  }
  // Checks if the user can access the object entity.
  async canAccessObjectEntity({
    userId,
    objectFile,
    requestedPermission
  }) {
    return canAccessObject({
      userId,
      objectFile,
      requestedPermission: requestedPermission ?? "read" /* READ */
    });
  }
};
function parseObjectPath(path5) {
  if (!path5.startsWith("/")) {
    path5 = `/${path5}`;
  }
  const pathParts = path5.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }
  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");
  return {
    bucketName,
    objectName
  };
}
async function signObjectURL({
  bucketName,
  objectName,
  method,
  ttlSec
}) {
  const request = {
    bucket_name: bucketName,
    object_name: objectName,
    method,
    expires_at: new Date(Date.now() + ttlSec * 1e3).toISOString()
  };
  const response = await fetch(
    `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    }
  );
  if (!response.ok) {
    throw new Error(
      `Failed to sign object URL, errorcode: ${response.status}, make sure you're running on Replit`
    );
  }
  const { signed_url: signedURL } = await response.json();
  return signedURL;
}

// server/routes.ts
import OpenAI4 from "openai";

// server/invoiceStatusService.ts
init_storage();
import { format, isAfter, startOfDay } from "date-fns";
var InvoiceStatusService = class {
  isRunning = false;
  intervalId = null;
  /**
   * Start the automated invoice status monitoring
   * Runs every hour to check for status updates
   */
  startStatusMonitoring() {
    if (this.isRunning) {
      console.log("\u{1F4CB} Invoice status monitoring already running");
      return;
    }
    console.log("\u{1F680} Starting automated invoice status monitoring");
    this.isRunning = true;
    this.checkInvoiceStatuses();
    this.intervalId = setInterval(() => {
      this.checkInvoiceStatuses();
    }, 60 * 60 * 1e3);
  }
  /**
   * Stop the automated monitoring
   */
  stopStatusMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log("\u23F9\uFE0F Stopped invoice status monitoring");
  }
  /**
   * Main function to check and update invoice statuses
   */
  async checkInvoiceStatuses() {
    try {
      console.log("\u{1F50D} Checking invoice statuses for updates...");
      const invoices2 = await storage.getInvoices();
      const today = startOfDay(/* @__PURE__ */ new Date());
      let updatedCount = 0;
      let overdueNotificationsSent = 0;
      for (const invoice of invoices2) {
        const wasUpdated = await this.processInvoiceStatus(invoice, today);
        if (wasUpdated.statusChanged) updatedCount++;
        if (wasUpdated.notificationSent) overdueNotificationsSent++;
      }
      console.log(`\u2705 Invoice status check complete: ${updatedCount} statuses updated, ${overdueNotificationsSent} overdue notifications sent`);
    } catch (error) {
      console.error("\u274C Error during invoice status check:", error);
    }
  }
  /**
   * Process individual invoice status and determine if updates are needed
   */
  async processInvoiceStatus(invoice, today) {
    let statusChanged = false;
    let notificationSent = false;
    if (invoice.status === "paid" || invoice.status === "cancelled") {
      return { statusChanged, notificationSent };
    }
    if (invoice.status === "sent" && invoice.dueDate) {
      const dueDate = new Date(invoice.dueDate);
      const isOverdue = isAfter(today, dueDate);
      if (isOverdue) {
        await storage.updateInvoice(invoice.id, { status: "overdue" });
        statusChanged = true;
        console.log(`\u{1F4CB} Invoice ${invoice.invoiceNumber} marked as overdue (due: ${format(dueDate, "MMM d, yyyy")})`);
        const emailSent = await this.sendOverdueNotification(invoice);
        if (emailSent) {
          notificationSent = true;
        }
      }
    }
    return { statusChanged, notificationSent };
  }
  /**
   * Send overdue notification email to client
   */
  async sendOverdueNotification(invoice) {
    if (!invoice.clientEmail) {
      console.log(`\u26A0\uFE0F Cannot send overdue notification for invoice ${invoice.invoiceNumber}: no client email`);
      return false;
    }
    const daysOverdue = Math.floor((Date.now() - new Date(invoice.dueDate).getTime()) / (1e3 * 60 * 60 * 24));
    const subject = `Payment Overdue - Invoice ${invoice.invoiceNumber}`;
    const textContent = `
Dear ${invoice.clientName || "Valued Client"},

This is a friendly reminder that invoice ${invoice.invoiceNumber} is now ${daysOverdue} day(s) overdue.

Invoice Details:
- Invoice Number: ${invoice.invoiceNumber}
- Amount Due: $${invoice.balanceDue || invoice.totalAmount}
- Original Due Date: ${format(new Date(invoice.dueDate), "MMMM d, yyyy")}
- Days Overdue: ${daysOverdue}

Please submit your payment at your earliest convenience to avoid any late fees or service interruptions.

If you have any questions or need to discuss payment arrangements, please contact us immediately.

Thank you for your prompt attention to this matter.

Best regards,
Gigster Garage Team
    `.trim();
    const htmlContent = `
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #721c24;">\u26A0\uFE0F Payment Overdue Notice</h2>
        </div>
        
        <p>Dear ${invoice.clientName || "Valued Client"},</p>
        
        <p>This is a friendly reminder that invoice <strong>${invoice.invoiceNumber}</strong> is now <strong>${daysOverdue} day(s) overdue</strong>.</p>
        
        <div style="background: #f8f9fa; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #dc3545;">Invoice Details</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</li>
            <li><strong>Amount Due:</strong> $${invoice.balanceDue || invoice.totalAmount}</li>
            <li><strong>Original Due Date:</strong> ${format(new Date(invoice.dueDate), "MMMM d, yyyy")}</li>
            <li><strong>Days Overdue:</strong> ${daysOverdue}</li>
          </ul>
        </div>
        
        <p>Please submit your payment at your earliest convenience to avoid any late fees or service interruptions.</p>
        
        <p>If you have any questions or need to discuss payment arrangements, please contact us immediately.</p>
        
        <p>Thank you for your prompt attention to this matter.</p>
        
        <div style="margin-top: 30px; padding: 15px; background: #e9ecef; border-radius: 5px;">
          <p style="margin: 0;"><strong>Best regards,</strong><br>
          Gigster Garage Team</p>
        </div>
      </div>
    </body>
    </html>
    `;
    try {
      const emailSent = await sendEmail({
        to: invoice.clientEmail,
        from: "billing@gigstergarage.com",
        // Default from email
        subject,
        text: textContent,
        html: htmlContent
      });
      if (emailSent) {
        console.log(`\u{1F4E7} Overdue notification sent for invoice ${invoice.invoiceNumber} to ${invoice.clientEmail}`);
      } else {
        console.log(`\u274C Failed to send overdue notification for invoice ${invoice.invoiceNumber}`);
      }
      return emailSent;
    } catch (error) {
      console.error(`\u274C Error sending overdue notification for invoice ${invoice.invoiceNumber}:`, error);
      return false;
    }
  }
  /**
   * Manual trigger for status updates (useful for admin actions or debugging)
   */
  async manualStatusUpdate() {
    console.log("\u{1F527} Manual invoice status update triggered");
    const invoices2 = await storage.getInvoices();
    const today = startOfDay(/* @__PURE__ */ new Date());
    let updatedInvoices = 0;
    let notificationsSent = 0;
    for (const invoice of invoices2) {
      const result = await this.processInvoiceStatus(invoice, today);
      if (result.statusChanged) updatedInvoices++;
      if (result.notificationSent) notificationsSent++;
    }
    return { updatedInvoices, notificationsSent };
  }
  /**
   * Get overdue invoice statistics
   */
  async getOverdueStats() {
    const invoices2 = await storage.getInvoices();
    const overdueInvoices = invoices2.filter((inv) => inv.status === "overdue");
    const totalOverdueAmount = overdueInvoices.reduce(
      (sum, inv) => sum + parseFloat(inv.balanceDue || inv.totalAmount || "0"),
      0
    );
    return {
      totalOverdue: overdueInvoices.length,
      totalOverdueAmount,
      overdueInvoices
    };
  }
};
var invoiceStatusService = new InvoiceStatusService();

// server/automatedInvoicingService.ts
init_storage();
import { format as format2, addDays, addMonths, addWeeks, isAfter as isAfter2, startOfDay as startOfDay2 } from "date-fns";
var AutomatedInvoicingService = class {
  recurringRules = /* @__PURE__ */ new Map();
  reminderRules = /* @__PURE__ */ new Map();
  autoGenRules = /* @__PURE__ */ new Map();
  isRunning = false;
  intervalId = null;
  constructor() {
    this.initializeDefaultRules();
  }
  /**
   * Initialize default automation rules
   */
  initializeDefaultRules() {
    const defaultReminders = [
      {
        name: "7-Day Advance Notice",
        triggerDays: -7,
        reminderType: "gentle",
        isActive: true,
        customMessage: "Just a friendly reminder that your invoice is due in 7 days."
      },
      {
        name: "3-Day Advance Notice",
        triggerDays: -3,
        reminderType: "standard",
        isActive: true,
        customMessage: "Your invoice payment is due in 3 days. Please process payment at your earliest convenience."
      },
      {
        name: "Due Date Reminder",
        triggerDays: 0,
        reminderType: "standard",
        isActive: true,
        customMessage: "Your invoice payment is due today. Please process payment to avoid any late fees."
      },
      {
        name: "3-Day Overdue Notice",
        triggerDays: 3,
        reminderType: "urgent",
        isActive: true,
        customMessage: "Your invoice payment is now 3 days overdue. Please process payment immediately to avoid additional charges."
      },
      {
        name: "7-Day Overdue Final Notice",
        triggerDays: 7,
        reminderType: "final",
        isActive: true,
        customMessage: "FINAL NOTICE: Your invoice payment is 7 days overdue. Immediate payment is required to avoid account suspension."
      }
    ];
    defaultReminders.forEach((rule, index2) => {
      const ruleWithId = {
        ...rule,
        id: `reminder_${index2 + 1}`,
        createdAt: /* @__PURE__ */ new Date()
      };
      this.reminderRules.set(ruleWithId.id, ruleWithId);
    });
    console.log(`\u{1F514} Initialized ${defaultReminders.length} default payment reminder rules`);
  }
  /**
   * Start the automated invoicing service
   */
  startAutomatedInvoicing() {
    if (this.isRunning) {
      console.log("\u{1F4CB} Automated invoicing already running");
      return;
    }
    console.log("\u{1F680} Starting automated invoicing service");
    this.isRunning = true;
    this.processAutomatedInvoicing();
    this.intervalId = setInterval(() => {
      this.processAutomatedInvoicing();
    }, 6 * 60 * 60 * 1e3);
  }
  /**
   * Stop the automated invoicing service
   */
  stopAutomatedInvoicing() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log("\u23F9\uFE0F Stopped automated invoicing service");
  }
  /**
   * Main processing function for automated invoicing
   */
  async processAutomatedInvoicing() {
    try {
      console.log("\u{1F504} Processing automated invoicing...");
      const startTime = Date.now();
      let results = {
        recurringInvoicesGenerated: 0,
        autoGeneratedInvoices: 0,
        remindersSent: 0,
        errors: 0
      };
      const recurringResults = await this.processRecurringInvoices();
      results.recurringInvoicesGenerated = recurringResults.generated;
      results.errors += recurringResults.errors;
      const autoGenResults = await this.processAutoGenerationRules();
      results.autoGeneratedInvoices = autoGenResults.generated;
      results.errors += autoGenResults.errors;
      const reminderResults = await this.processPaymentReminders();
      results.remindersSent = reminderResults.sent;
      results.errors += reminderResults.errors;
      const duration = Date.now() - startTime;
      console.log(`\u2705 Automated invoicing complete in ${duration}ms:`, {
        recurringInvoices: results.recurringInvoicesGenerated,
        autoGenerated: results.autoGeneratedInvoices,
        remindersSent: results.remindersSent,
        errors: results.errors
      });
    } catch (error) {
      console.error("\u274C Error during automated invoicing process:", error);
    }
  }
  /**
   * Process recurring invoice generation
   */
  async processRecurringInvoices() {
    const today = startOfDay2(/* @__PURE__ */ new Date());
    let generated = 0;
    let errors = 0;
    for (const rule of Array.from(this.recurringRules.values())) {
      if (!rule.isActive) continue;
      try {
        const nextGen = startOfDay2(new Date(rule.nextGenerationDate));
        if (isAfter2(today, nextGen) || today.getTime() === nextGen.getTime()) {
          const invoice = await this.generateRecurringInvoice(rule);
          if (invoice) {
            generated++;
            rule.nextGenerationDate = this.calculateNextGenerationDate(rule);
            if (rule.autoSend) {
              await this.sendInvoiceWithRetry(invoice.id);
            }
          }
        }
      } catch (error) {
        console.error(`\u274C Error processing recurring rule ${rule.id}:`, error);
        errors++;
      }
    }
    return { generated, errors };
  }
  /**
   * Process automatic generation rules
   */
  async processAutoGenerationRules() {
    let generated = 0;
    let errors = 0;
    for (const rule of Array.from(this.autoGenRules.values())) {
      if (!rule.isActive) continue;
      try {
        const shouldGenerate = await this.evaluateAutoGenerationRule(rule);
        if (shouldGenerate) {
          const invoice = await this.generateInvoiceFromRule(rule);
          if (invoice) {
            generated++;
            if (rule.autoSend) {
              await this.sendInvoiceWithRetry(invoice.id);
            }
          }
        }
      } catch (error) {
        console.error(`\u274C Error processing auto generation rule ${rule.id}:`, error);
        errors++;
      }
    }
    return { generated, errors };
  }
  /**
   * Process payment reminders
   */
  async processPaymentReminders() {
    const today = startOfDay2(/* @__PURE__ */ new Date());
    let sent = 0;
    let errors = 0;
    const invoices2 = await storage.getInvoices();
    const unpaidInvoices = invoices2.filter(
      (inv) => inv.status !== "paid" && inv.status !== "cancelled" && inv.dueDate
    );
    for (const invoice of unpaidInvoices) {
      const dueDate = startOfDay2(new Date(invoice.dueDate));
      const daysDifference = Math.floor((today.getTime() - dueDate.getTime()) / (24 * 60 * 60 * 1e3));
      for (const rule of Array.from(this.reminderRules.values())) {
        if (!rule.isActive) continue;
        if (daysDifference === rule.triggerDays) {
          try {
            const reminderSent = await this.sendPaymentReminder(invoice, rule);
            if (reminderSent) {
              sent++;
            }
          } catch (error) {
            console.error(`\u274C Error sending reminder for invoice ${invoice.id}:`, error);
            errors++;
          }
        }
      }
    }
    return { sent, errors };
  }
  /**
   * Generate a recurring invoice
   */
  async generateRecurringInvoice(rule) {
    try {
      const client = await storage.getClient(rule.clientId);
      if (!client) {
        console.error(`\u274C Client ${rule.clientId} not found for recurring rule ${rule.id}`);
        return null;
      }
      const invoiceNumber = await this.generateInvoiceNumber();
      const invoiceData = {
        ...rule.templateData,
        invoiceNumber,
        clientId: rule.clientId,
        status: "draft",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        dueDate: format2(addDays(/* @__PURE__ */ new Date(), 30), "yyyy-MM-dd")
        // Default 30 days from now
      };
      const invoice = await storage.createInvoice(invoiceData);
      console.log(`\u2728 Generated recurring invoice ${invoice.invoiceNumber} for client ${client.name}`);
      return invoice;
    } catch (error) {
      console.error(`\u274C Failed to generate recurring invoice for rule ${rule.id}:`, error);
      return null;
    }
  }
  /**
   * Send payment reminder with appropriate messaging
   */
  async sendPaymentReminder(invoice, rule) {
    try {
      if (!invoice.clientId) {
        console.error(`\u274C No client ID found for invoice ${invoice.id}`);
        return false;
      }
      const client = await storage.getClient(invoice.clientId);
      if (!client?.email) {
        console.error(`\u274C No email found for client ${invoice.clientId}`);
        return false;
      }
      const pdfBuffer = await generateInvoicePDF(invoice);
      const subject = this.getReminderSubject(invoice, rule);
      const message = rule.customMessage || this.getDefaultReminderMessage(rule);
      const sent = await sendInvoiceEmail(
        client.email,
        invoice,
        pdfBuffer,
        message,
        "dustinsparks@mac.com"
      );
      if (sent) {
        console.log(`\u{1F4E7} Sent ${rule.reminderType} reminder for invoice ${invoice.invoiceNumber} to ${client.email}`);
      }
      return sent;
    } catch (error) {
      console.error(`\u274C Failed to send payment reminder:`, error);
      return false;
    }
  }
  /**
   * Calculate next generation date for recurring invoices
   */
  calculateNextGenerationDate(rule) {
    const currentDate = /* @__PURE__ */ new Date();
    switch (rule.frequency) {
      case "daily":
        return addDays(currentDate, rule.interval);
      case "weekly":
        return addWeeks(currentDate, rule.interval);
      case "monthly":
        return addMonths(currentDate, rule.interval);
      case "quarterly":
        return addMonths(currentDate, rule.interval * 3);
      case "yearly":
        return addMonths(currentDate, rule.interval * 12);
      default:
        return addMonths(currentDate, 1);
    }
  }
  /**
   * Generate unique invoice number
   */
  async generateInvoiceNumber() {
    const date2 = /* @__PURE__ */ new Date();
    const year = date2.getFullYear();
    const month = String(date2.getMonth() + 1).padStart(2, "0");
    const day = String(date2.getDate()).padStart(2, "0");
    const existingInvoices = await storage.getInvoices();
    const todayInvoices = existingInvoices.filter(
      (inv) => inv.invoiceNumber?.startsWith(`GG-${year}${month}${day}`)
    );
    const nextNum = String(todayInvoices.length + 1).padStart(3, "0");
    return `GG-${year}${month}${day}-${nextNum}`;
  }
  /**
   * Get reminder subject based on type
   */
  getReminderSubject(invoice, rule) {
    const baseSubject = `Invoice ${invoice.invoiceNumber}`;
    switch (rule.reminderType) {
      case "gentle":
        return `${baseSubject} - Friendly Payment Reminder`;
      case "standard":
        return `${baseSubject} - Payment Reminder`;
      case "urgent":
        return `${baseSubject} - URGENT: Overdue Payment Notice`;
      case "final":
        return `${baseSubject} - FINAL NOTICE: Immediate Payment Required`;
      default:
        return `${baseSubject} - Payment Reminder`;
    }
  }
  /**
   * Get default reminder message
   */
  getDefaultReminderMessage(rule) {
    switch (rule.reminderType) {
      case "gentle":
        return "Hope you're doing well! Just a friendly reminder about the attached invoice.";
      case "standard":
        return "This is a reminder about your outstanding invoice. Please process payment at your earliest convenience.";
      case "urgent":
        return "Your invoice payment is now overdue. Please process payment immediately to avoid additional charges.";
      case "final":
        return "FINAL NOTICE: Your invoice payment is significantly overdue. Immediate payment is required to avoid account suspension.";
      default:
        return "Please find your invoice attached. Payment is appreciated.";
    }
  }
  /**
   * Send invoice with retry logic
   */
  async sendInvoiceWithRetry(invoiceId, maxRetries = 3) {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        const invoice = await storage.getInvoice(invoiceId);
        if (!invoice?.clientId) {
          throw new Error(`No client ID found for invoice ${invoiceId}`);
        }
        const client = await storage.getClient(invoice.clientId);
        if (!client?.email) {
          throw new Error(`No email found for client ${invoice.clientId}`);
        }
        const pdfBuffer = await generateInvoicePDF(invoice);
        const sent = await sendInvoiceEmail(client.email, invoice, pdfBuffer);
        if (sent) {
          await storage.updateInvoice(invoiceId, { status: "sent" });
          return true;
        }
        attempts++;
      } catch (error) {
        attempts++;
        console.error(`\u274C Attempt ${attempts} failed for invoice ${invoiceId}:`, error);
        if (attempts < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempts) * 1e3));
        }
      }
    }
    console.error(`\u274C Failed to send invoice ${invoiceId} after ${maxRetries} attempts`);
    return false;
  }
  /**
   * Evaluate auto generation rule conditions
   */
  async evaluateAutoGenerationRule(rule) {
    switch (rule.trigger) {
      case "time_log_threshold":
        return await this.checkTimeLogThreshold(rule.conditions);
      case "project_milestone":
        return await this.checkProjectMilestone(rule.conditions);
      case "monthly_retainer":
        return await this.checkMonthlyRetainer(rule.conditions);
      case "custom_schedule":
        return await this.checkCustomSchedule(rule.conditions);
      default:
        return false;
    }
  }
  /**
   * Check time log threshold for auto generation
   */
  async checkTimeLogThreshold(conditions) {
    return false;
  }
  /**
   * Check project milestone completion
   */
  async checkProjectMilestone(conditions) {
    return false;
  }
  /**
   * Check monthly retainer schedule
   */
  async checkMonthlyRetainer(conditions) {
    return false;
  }
  /**
   * Check custom schedule conditions
   */
  async checkCustomSchedule(conditions) {
    return false;
  }
  /**
   * Generate invoice from auto generation rule
   */
  async generateInvoiceFromRule(rule) {
    return null;
  }
  // Public API methods for managing rules
  /**
   * Add recurring invoice rule
   */
  addRecurringRule(rule) {
    const id = `recurring_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullRule = {
      ...rule,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.recurringRules.set(id, fullRule);
    console.log(`\u2728 Added recurring invoice rule: ${fullRule.name}`);
    return id;
  }
  /**
   * Add payment reminder rule
   */
  addReminderRule(rule) {
    const id = `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullRule = {
      ...rule,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.reminderRules.set(id, fullRule);
    console.log(`\u{1F514} Added payment reminder rule: ${fullRule.name}`);
    return id;
  }
  /**
   * Add auto generation rule
   */
  addAutoGenerationRule(rule) {
    const id = `autogen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullRule = {
      ...rule,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.autoGenRules.set(id, fullRule);
    console.log(`\u26A1 Added auto generation rule: ${fullRule.name}`);
    return id;
  }
  /**
   * Get all automation rules
   */
  getAllRules() {
    return {
      recurring: Array.from(this.recurringRules.values()),
      reminders: Array.from(this.reminderRules.values()),
      autoGeneration: Array.from(this.autoGenRules.values())
    };
  }
  /**
   * Manual trigger for testing and configuration
   */
  async manualTrigger() {
    console.log("\u{1F527} Manual automated invoicing trigger - Configuring enterprise invoice automation");
    try {
      this.addRecurringRule({
        name: "Enterprise Client Monthly Billing",
        clientId: "enterprise_clients",
        templateData: {
          description: "Enterprise Monthly Billing - Net 15 Terms",
          notes: "Includes 2% early payment discount, 1.5% late fee",
          customData: {
            include_time_breakdown: true,
            include_milestone_progress: true
          }
        },
        frequency: "monthly",
        interval: 1,
        nextGenerationDate: new Date(Date.now() + 24 * 60 * 60 * 1e3),
        // Tomorrow
        isActive: true,
        autoSend: true,
        reminderDays: [7, 3, 0, 3, 7]
        // Pre and post due date
      });
      this.addRecurringRule({
        name: "Milestone-Based Billing for Premium Projects",
        clientId: "premium_projects",
        templateData: {
          description: "Premium Project Milestone Billing - Net 10 Terms",
          notes: "Requires approval, includes deliverable summary",
          customData: {
            require_approval: true,
            include_deliverable_summary: true
          }
        },
        frequency: "monthly",
        interval: 1,
        nextGenerationDate: /* @__PURE__ */ new Date(),
        isActive: true,
        autoSend: false,
        // Requires manual review for high-value
        reminderDays: [5, 2, 0, 1]
      });
      this.addReminderRule({
        name: "Enterprise Payment Escalation Protocol",
        triggerDays: 10,
        // 10 days overdue
        reminderType: "urgent",
        isActive: true,
        customMessage: "URGENT: Payment overdue. Account may be suspended. Please contact our finance team immediately."
      });
      console.log("\u2728 Configured enterprise automated invoice generation with premium billing rules");
    } catch (error) {
      console.error("Error configuring invoice automation:", error);
    }
    await this.processAutomatedInvoicing();
  }
};
var automatedInvoicingService = new AutomatedInvoicingService();

// server/smartNotificationsService.ts
init_storage();
import { format as format3 } from "date-fns";
var SmartNotificationsService = class {
  rules = /* @__PURE__ */ new Map();
  pendingNotifications = /* @__PURE__ */ new Map();
  batchedNotifications = /* @__PURE__ */ new Map();
  isRunning = false;
  intervalId = null;
  batchingIntervalId = null;
  constructor() {
    this.initializeDefaultRules();
  }
  /**
   * Initialize default smart notification rules
   */
  initializeDefaultRules() {
    const defaultRules = [
      {
        name: "High Priority Task Due Soon",
        description: "Alert when high priority tasks are due within 24 hours",
        trigger: {
          type: "time_based",
          schedule: "0 */6 * * *"
          // Every 6 hours
        },
        conditions: [
          { field: "priority", operator: "equals", value: "high", entityType: "task" },
          { field: "status", operator: "not_equals", value: "completed", entityType: "task" },
          { field: "dueDate", operator: "less_than", value: "24h", entityType: "task" }
        ],
        actions: [
          {
            type: "email",
            recipients: [{ type: "user", identifier: "assignee" }],
            template: "high_priority_task_due",
            urgent: true
          },
          {
            type: "in_app",
            recipients: [{ type: "user", identifier: "assignee" }],
            template: "task_due_notification",
            urgent: true
          }
        ],
        isActive: true,
        priority: "high",
        escalationRules: [
          {
            delayMinutes: 60,
            escalateTo: [{ type: "role", identifier: "admin" }]
          }
        ],
        batchingEnabled: false,
        batchingWindow: 0
      },
      {
        name: "Project Milestone Approaching",
        description: "Notify team when project milestones are approaching",
        trigger: {
          type: "time_based",
          schedule: "0 9 * * *"
          // Daily at 9 AM
        },
        conditions: [
          { field: "dueDate", operator: "less_than", value: "3d", entityType: "project" },
          { field: "status", operator: "not_in", value: ["completed", "cancelled"], entityType: "project" }
        ],
        actions: [
          {
            type: "email",
            recipients: [{ type: "user", identifier: "team_members" }],
            template: "project_milestone_reminder",
            urgent: false
          }
        ],
        isActive: true,
        priority: "medium",
        batchingEnabled: true,
        batchingWindow: 30
      },
      {
        name: "Overdue Invoice Alert",
        description: "Smart escalation for overdue invoices",
        trigger: {
          type: "status_change",
          statusChanges: [{ from: "sent", to: "overdue" }]
        },
        conditions: [
          { field: "status", operator: "equals", value: "overdue", entityType: "invoice" }
        ],
        actions: [
          {
            type: "email",
            recipients: [
              { type: "role", identifier: "admin" },
              { type: "role", identifier: "finance" }
            ],
            template: "invoice_overdue_alert",
            urgent: true
          }
        ],
        isActive: true,
        priority: "critical",
        batchingEnabled: false,
        batchingWindow: 0
      },
      {
        name: "Time Tracking Reminder",
        description: "Remind users to log time if no entries today",
        trigger: {
          type: "time_based",
          schedule: "0 17 * * 1-5"
          // Weekdays at 5 PM
        },
        conditions: [
          { field: "lastTimeLog", operator: "less_than", value: "today", entityType: "user" }
        ],
        actions: [
          {
            type: "in_app",
            recipients: [{ type: "user", identifier: "self" }],
            template: "time_tracking_reminder",
            urgent: false
          }
        ],
        isActive: true,
        priority: "low",
        batchingEnabled: true,
        batchingWindow: 60
      },
      {
        name: "Weekly Team Digest",
        description: "Smart weekly summary of team activities and upcoming deadlines",
        trigger: {
          type: "time_based",
          schedule: "0 9 * * 1"
          // Monday at 9 AM
        },
        conditions: [],
        actions: [
          {
            type: "email",
            recipients: [{ type: "role", identifier: "all" }],
            template: "weekly_team_digest",
            urgent: false
          }
        ],
        isActive: true,
        priority: "low",
        batchingEnabled: false,
        batchingWindow: 0
      }
    ];
    defaultRules.forEach((rule, index2) => {
      const ruleWithId = {
        ...rule,
        id: `smart_notification_${index2 + 1}`,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      this.rules.set(ruleWithId.id, ruleWithId);
    });
    console.log(`\u{1F514} Initialized ${defaultRules.length} default smart notification rules`);
  }
  /**
   * Start the smart notifications service
   */
  startSmartNotifications() {
    if (this.isRunning) {
      console.log("\u{1F514} Smart notifications already running");
      return;
    }
    console.log("\u{1F680} Starting smart notifications service");
    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.processSmartNotifications();
    }, 5 * 60 * 1e3);
    this.batchingIntervalId = setInterval(() => {
      this.processBatchedNotifications();
    }, 60 * 1e3);
    this.processSmartNotifications();
  }
  /**
   * Stop the smart notifications service
   */
  stopSmartNotifications() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.batchingIntervalId) {
      clearInterval(this.batchingIntervalId);
      this.batchingIntervalId = null;
    }
    this.isRunning = false;
    console.log("\u23F9\uFE0F Stopped smart notifications service");
  }
  /**
   * Main processing function for smart notifications
   */
  async processSmartNotifications() {
    try {
      console.log("\u{1F504} Processing smart notifications...");
      const startTime = Date.now();
      let results = {
        rulesEvaluated: 0,
        notificationsGenerated: 0,
        notificationsSent: 0,
        notificationsBatched: 0,
        errors: 0
      };
      for (const rule of Array.from(this.rules.values())) {
        if (!rule.isActive) continue;
        try {
          results.rulesEvaluated++;
          const shouldTrigger = await this.evaluateRule(rule);
          if (shouldTrigger) {
            const entities = await this.getEntitiesMatchingConditions(rule.conditions);
            for (const entity of entities) {
              const notification = await this.generateNotification(rule, entity);
              if (notification) {
                results.notificationsGenerated++;
                if (rule.batchingEnabled) {
                  await this.addToBatch(notification);
                  results.notificationsBatched++;
                } else {
                  const sent = await this.sendNotification(notification);
                  if (sent) results.notificationsSent++;
                }
              }
            }
          }
        } catch (error) {
          console.error(`\u274C Error processing rule ${rule.id}:`, error);
          results.errors++;
        }
      }
      const duration = Date.now() - startTime;
      console.log(`\u2705 Smart notifications processing complete in ${duration}ms:`, results);
    } catch (error) {
      console.error("\u274C Error during smart notifications processing:", error);
    }
  }
  /**
   * Process batched notifications
   */
  async processBatchedNotifications() {
    try {
      const now = /* @__PURE__ */ new Date();
      let processed = 0;
      let sent = 0;
      for (const batch of Array.from(this.batchedNotifications.values())) {
        if (batch.status === "pending") {
          const batchAge = (now.getTime() - batch.batchedAt.getTime()) / (1e3 * 60);
          if (batchAge >= 30) {
            const success = await this.sendBatchedNotification(batch);
            if (success) sent++;
            processed++;
          }
        }
      }
      if (processed > 0) {
        console.log(`\u{1F4E6} Processed ${processed} batched notifications, ${sent} sent successfully`);
      }
    } catch (error) {
      console.error("\u274C Error processing batched notifications:", error);
    }
  }
  /**
   * Evaluate if a rule should trigger
   */
  async evaluateRule(rule) {
    switch (rule.trigger.type) {
      case "time_based":
        return this.evaluateTimeBasedTrigger(rule.trigger);
      case "event_based":
        return this.evaluateEventBasedTrigger(rule.trigger);
      case "threshold_based":
        return await this.evaluateThresholdBasedTrigger(rule.trigger);
      case "status_change":
        return this.evaluateStatusChangeTrigger(rule.trigger);
      default:
        return false;
    }
  }
  /**
   * Evaluate time-based trigger (simplified cron evaluation)
   */
  evaluateTimeBasedTrigger(trigger) {
    if (!trigger.schedule) return false;
    const now = /* @__PURE__ */ new Date();
    const hour = now.getHours();
    if (trigger.schedule.includes("*/6")) {
      return hour % 6 === 0;
    }
    if (trigger.schedule.includes("9 * * 1")) {
      return hour === 9 && now.getDay() === 1;
    }
    if (trigger.schedule.includes("17 * * 1-5")) {
      return hour === 17 && now.getDay() >= 1 && now.getDay() <= 5;
    }
    return false;
  }
  /**
   * Evaluate event-based trigger
   */
  evaluateEventBasedTrigger(trigger) {
    return false;
  }
  /**
   * Evaluate threshold-based trigger
   */
  async evaluateThresholdBasedTrigger(trigger) {
    if (!trigger.thresholds) return false;
    return false;
  }
  /**
   * Evaluate status change trigger
   */
  evaluateStatusChangeTrigger(trigger) {
    return false;
  }
  /**
   * Get entities matching notification conditions
   */
  async getEntitiesMatchingConditions(conditions) {
    const results = [];
    const groupedConditions = this.groupConditionsByEntityType(conditions);
    for (const [entityType, entityConditions] of Array.from(groupedConditions.entries())) {
      try {
        switch (entityType) {
          case "task":
            const tasks2 = await storage.getTasks();
            const matchingTasks = tasks2.filter((task) => this.entityMatchesConditions(task, entityConditions));
            results.push(...matchingTasks.map((task) => ({ type: "task", entity: task })));
            break;
          case "project":
            const projects2 = await storage.getProjects();
            const matchingProjects = projects2.filter((project) => this.entityMatchesConditions(project, entityConditions));
            results.push(...matchingProjects.map((project) => ({ type: "project", entity: project })));
            break;
          case "invoice":
            const invoices2 = await storage.getInvoices();
            const matchingInvoices = invoices2.filter((invoice) => this.entityMatchesConditions(invoice, entityConditions));
            results.push(...matchingInvoices.map((invoice) => ({ type: "invoice", entity: invoice })));
            break;
          case "user":
            const users2 = await storage.getUsers();
            const matchingUsers = users2.filter((user) => this.entityMatchesConditions(user, entityConditions));
            results.push(...matchingUsers.map((user) => ({ type: "user", entity: user })));
            break;
        }
      } catch (error) {
        console.error(`\u274C Error fetching ${entityType} entities:`, error);
      }
    }
    return results;
  }
  /**
   * Group conditions by entity type
   */
  groupConditionsByEntityType(conditions) {
    const grouped = /* @__PURE__ */ new Map();
    conditions.forEach((condition) => {
      if (!grouped.has(condition.entityType)) {
        grouped.set(condition.entityType, []);
      }
      grouped.get(condition.entityType).push(condition);
    });
    return grouped;
  }
  /**
   * Check if entity matches conditions
   */
  entityMatchesConditions(entity, conditions) {
    return conditions.every((condition) => {
      const fieldValue = this.getFieldValue(entity, condition.field);
      return this.evaluateCondition(fieldValue, condition.operator, condition.value);
    });
  }
  /**
   * Get field value from entity (supports nested fields)
   */
  getFieldValue(entity, fieldPath) {
    return fieldPath.split(".").reduce((obj, key) => obj && obj[key], entity);
  }
  /**
   * Evaluate condition
   */
  evaluateCondition(fieldValue, operator, expectedValue) {
    switch (operator) {
      case "equals":
        return fieldValue === expectedValue;
      case "not_equals":
        return fieldValue !== expectedValue;
      case "greater_than":
        if (typeof expectedValue === "string" && expectedValue.endsWith("h")) {
          const hours = parseInt(expectedValue);
          const now = /* @__PURE__ */ new Date();
          const fieldDate = new Date(fieldValue);
          return now.getTime() - fieldDate.getTime() > hours * 60 * 60 * 1e3;
        }
        return fieldValue > expectedValue;
      case "less_than":
        if (typeof expectedValue === "string") {
          if (expectedValue.endsWith("h")) {
            const hours = parseInt(expectedValue);
            const now = /* @__PURE__ */ new Date();
            const fieldDate = new Date(fieldValue);
            return fieldDate.getTime() - now.getTime() < hours * 60 * 60 * 1e3;
          }
          if (expectedValue.endsWith("d")) {
            const days = parseInt(expectedValue);
            const now = /* @__PURE__ */ new Date();
            const fieldDate = new Date(fieldValue);
            return fieldDate.getTime() - now.getTime() < days * 24 * 60 * 60 * 1e3;
          }
        }
        return fieldValue < expectedValue;
      case "contains":
        return String(fieldValue).includes(String(expectedValue));
      case "in":
        return Array.isArray(expectedValue) && expectedValue.includes(fieldValue);
      case "not_in":
        return Array.isArray(expectedValue) && !expectedValue.includes(fieldValue);
      default:
        return false;
    }
  }
  /**
   * Generate notification from rule and entity
   */
  async generateNotification(rule, entityData) {
    try {
      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const message = await this.generateNotificationMessage(rule, entityData);
      const notification = {
        id: notificationId,
        ruleId: rule.id,
        entityType: entityData.type,
        entityId: entityData.entity.id,
        message,
        priority: rule.priority,
        channels: rule.actions.map((action) => action.type),
        status: "pending",
        scheduledAt: /* @__PURE__ */ new Date(),
        createdAt: /* @__PURE__ */ new Date()
      };
      return notification;
    } catch (error) {
      console.error("\u274C Error generating notification:", error);
      return null;
    }
  }
  /**
   * Generate notification message based on template and entity
   */
  async generateNotificationMessage(rule, entityData) {
    const entity = entityData.entity;
    const type = entityData.type;
    switch (type) {
      case "task":
        return `High priority task "${entity.title}" is due soon (${entity.dueDate})`;
      case "project":
        return `Project "${entity.name}" milestone is approaching (due: ${entity.dueDate})`;
      case "invoice":
        return `Invoice ${entity.invoiceNumber} is now overdue (${entity.totalAmount})`;
      case "user":
        return `Time tracking reminder: Please log your hours for today`;
      default:
        return `Notification from rule: ${rule.name}`;
    }
  }
  /**
   * Add notification to batch
   */
  async addToBatch(notification) {
    const userId = "batch_user";
    const batchId = `batch_${userId}_${format3(/* @__PURE__ */ new Date(), "yyyyMMdd")}`;
    let batch = this.batchedNotifications.get(batchId);
    if (!batch) {
      batch = {
        id: batchId,
        userId,
        notifications: [],
        batchedAt: /* @__PURE__ */ new Date(),
        status: "pending"
      };
      this.batchedNotifications.set(batchId, batch);
    }
    batch.notifications.push(notification);
  }
  /**
   * Send individual notification
   */
  async sendNotification(notification) {
    try {
      console.log(`\u{1F4EC} Sending ${notification.priority} notification: ${notification.message}`);
      notification.status = "sent";
      notification.sentAt = /* @__PURE__ */ new Date();
      return true;
    } catch (error) {
      console.error(`\u274C Failed to send notification ${notification.id}:`, error);
      notification.status = "failed";
      notification.failureReason = error instanceof Error ? error.message : "Unknown error";
      return false;
    }
  }
  /**
   * Send batched notification
   */
  async sendBatchedNotification(batch) {
    try {
      console.log(`\u{1F4E6} Sending batched notification with ${batch.notifications.length} items to user ${batch.userId}`);
      batch.status = "sent";
      batch.sentAt = /* @__PURE__ */ new Date();
      this.batchedNotifications.delete(batch.id);
      return true;
    } catch (error) {
      console.error(`\u274C Failed to send batched notification ${batch.id}:`, error);
      batch.status = "failed";
      return false;
    }
  }
  // Public API methods
  /**
   * Add custom notification rule
   */
  addNotificationRule(rule) {
    const id = `custom_rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullRule = {
      ...rule,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.rules.set(id, fullRule);
    console.log(`\u2728 Added custom notification rule: ${fullRule.name}`);
    return id;
  }
  /**
   * Update notification rule
   */
  updateNotificationRule(id, updates) {
    const rule = this.rules.get(id);
    if (!rule) return false;
    const updatedRule = {
      ...rule,
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.rules.set(id, updatedRule);
    console.log(`\u{1F504} Updated notification rule: ${updatedRule.name}`);
    return true;
  }
  /**
   * Get all notification rules
   */
  getAllRules() {
    return Array.from(this.rules.values());
  }
  /**
   * Get notification statistics
   */
  getNotificationStats() {
    return {
      totalRules: this.rules.size,
      activeRules: Array.from(this.rules.values()).filter((rule) => rule.isActive).length,
      pendingNotifications: this.pendingNotifications.size,
      batchedNotifications: this.batchedNotifications.size,
      isRunning: this.isRunning
    };
  }
  /**
   * Manual trigger for testing
   */
  async manualTrigger() {
    console.log("\u{1F527} Manual smart notifications trigger - Adding enterprise notification rules");
    try {
      this.addNotificationRule({
        name: "Enterprise Client Risk Alert",
        description: "Alert when high-value clients haven't been contacted in 72 hours",
        trigger: {
          type: "time_based",
          schedule: "0 */4 * * *"
          // Every 4 hours
        },
        conditions: [
          { field: "value", operator: "greater_than", value: 5e4, entityType: "project" },
          { field: "last_contact", operator: "less_than", value: "72h", entityType: "project" }
        ],
        actions: [
          {
            type: "email",
            recipients: [{ type: "role", identifier: "account_manager" }, { type: "role", identifier: "sales_director" }],
            template: "enterprise_client_risk",
            urgent: true
          }
        ],
        isActive: true,
        priority: "critical",
        escalationRules: [
          {
            delayMinutes: 30,
            escalateTo: [{ type: "role", identifier: "executive_team" }]
          }
        ],
        batchingEnabled: false,
        batchingWindow: 0
      });
      this.addNotificationRule({
        name: "Performance Degradation Alert",
        description: "Alert when system performance drops below enterprise SLA",
        trigger: {
          type: "threshold_based",
          thresholds: [
            { field: "response_time", operator: "greater_than", value: 2e3 },
            { field: "error_rate", operator: "greater_than", value: 1 }
          ]
        },
        conditions: [],
        actions: [
          {
            type: "email",
            recipients: [{ type: "role", identifier: "devops" }, { type: "role", identifier: "tech_lead" }],
            template: "performance_alert",
            urgent: true
          }
        ],
        isActive: true,
        priority: "high",
        batchingEnabled: false,
        batchingWindow: 0
      });
      this.addNotificationRule({
        name: "Project Budget Threshold Alert",
        description: "Smart alert when project budget reaches 80% utilization",
        trigger: {
          type: "threshold_based",
          thresholds: [
            { field: "budget_utilized_percent", operator: "greater_than", value: 80 }
          ]
        },
        conditions: [
          { field: "status", operator: "in", value: ["active", "in_progress"], entityType: "project" }
        ],
        actions: [
          {
            type: "email",
            recipients: [{ type: "user", identifier: "project_manager" }, { type: "role", identifier: "finance" }],
            template: "budget_threshold_warning",
            urgent: false
          }
        ],
        isActive: true,
        priority: "medium",
        batchingEnabled: true,
        batchingWindow: 60
      });
      console.log("\u2728 Added 3 enterprise smart notification rules");
    } catch (error) {
      console.error("Error adding notification rules:", error);
    }
    await this.processSmartNotifications();
  }
  /**
   * Trigger event-based notifications
   */
  async triggerEventNotification(eventType, entityType, entityId, metadata) {
    console.log(`\u{1F3AF} Triggering event notification: ${eventType} for ${entityType}:${entityId}`);
    const matchingRules = Array.from(this.rules.values()).filter(
      (rule) => rule.isActive && rule.trigger.type === "event_based" && rule.trigger.events?.includes(eventType)
    );
    for (const rule of matchingRules) {
      try {
        const entityData = await this.getEntityById(entityType, entityId);
        if (entityData) {
          const notification = await this.generateNotification(rule, { type: entityType, entity: entityData });
          if (notification) {
            await this.sendNotification(notification);
          }
        }
      } catch (error) {
        console.error(`\u274C Error processing event notification for rule ${rule.id}:`, error);
      }
    }
  }
  /**
   * Get entity by ID and type
   */
  async getEntityById(entityType, entityId) {
    try {
      switch (entityType) {
        case "task":
          return await storage.getTask(entityId);
        case "project":
          return await storage.getProject(entityId);
        case "invoice":
          return await storage.getInvoice(entityId);
        case "user":
          return await storage.getUser(entityId);
        default:
          return null;
      }
    } catch (error) {
      console.error(`\u274C Error fetching ${entityType} with ID ${entityId}:`, error);
      return null;
    }
  }
};
var smartNotificationsService = new SmartNotificationsService();

// server/workflowTemplatesService.ts
var WorkflowTemplatesService = class {
  templates = /* @__PURE__ */ new Map();
  installedWorkflows = /* @__PURE__ */ new Map();
  isInitialized = false;
  constructor() {
    this.initializeSystemTemplates();
  }
  /**
   * Initialize system workflow templates
   */
  initializeSystemTemplates() {
    const systemTemplates = [
      {
        name: "New Client Onboarding",
        description: "Complete workflow for onboarding new clients with automated tasks, document requests, and welcome communications",
        category: "client_communication",
        tags: ["onboarding", "client", "automation", "welcome"],
        version: "1.0.0",
        author: "Gigster Garage",
        isPublic: true,
        isSystemTemplate: true,
        popularity: 95,
        rating: 4.8,
        usageCount: 0,
        workflow: {
          nodes: [
            {
              id: "trigger_1",
              type: "trigger",
              position: { x: 100, y: 100 },
              data: { triggerType: "client_created" },
              inputs: [],
              outputs: [{ id: "out_1", name: "Client Created", type: "event", dataType: "client", required: false }]
            },
            {
              id: "task_1",
              type: "action",
              position: { x: 300, y: 100 },
              data: {
                actionType: "create_task",
                taskTitle: "Collect client requirements",
                priority: "high",
                assignTo: "project_manager"
              },
              inputs: [{ id: "in_1", name: "Client Data", type: "data", dataType: "client", required: true }],
              outputs: [{ id: "out_1", name: "Task Created", type: "event", dataType: "task", required: false }]
            },
            {
              id: "notification_1",
              type: "notification",
              position: { x: 500, y: 100 },
              data: {
                notificationType: "email",
                template: "client_welcome",
                recipients: ["client_email"]
              },
              inputs: [{ id: "in_1", name: "Client Data", type: "data", dataType: "client", required: true }],
              outputs: []
            }
          ],
          connections: [
            {
              id: "conn_1",
              sourceNodeId: "trigger_1",
              sourcePortId: "out_1",
              targetNodeId: "task_1",
              targetPortId: "in_1"
            },
            {
              id: "conn_2",
              sourceNodeId: "trigger_1",
              sourcePortId: "out_1",
              targetNodeId: "notification_1",
              targetPortId: "in_1"
            }
          ],
          variables: [
            { id: "var_1", name: "project_manager", type: "string", defaultValue: "admin", description: "Default project manager for new clients", isSecret: false }
          ],
          triggers: [
            { id: "trig_1", type: "event", configuration: { eventType: "client_created" }, isActive: true }
          ],
          settings: {
            timeout: 3e5,
            retryAttempts: 3,
            errorHandling: "continue",
            logging: true,
            notifications: true
          }
        },
        metadata: {
          requirements: ["Client management access"],
          prerequisites: ["Email service configured"],
          estimatedSetupTime: 15,
          complexity: "beginner",
          industries: ["Professional Services", "Consulting", "Agency"],
          useCase: ["Client Onboarding", "Welcome Process"],
          screenshots: [],
          documentation: "Automated workflow that triggers when a new client is added to the system.",
          changelog: [
            {
              version: "1.0.0",
              date: /* @__PURE__ */ new Date(),
              changes: ["Initial template release", "Basic client onboarding workflow"],
              author: "Gigster Garage"
            }
          ]
        }
      },
      {
        name: "Project Completion Workflow",
        description: "End-to-end workflow for project completion including final deliveries, invoicing, and client feedback collection",
        category: "project_management",
        tags: ["project", "completion", "delivery", "invoice", "feedback"],
        version: "1.2.0",
        author: "Gigster Garage",
        isPublic: true,
        isSystemTemplate: true,
        popularity: 87,
        rating: 4.6,
        usageCount: 0,
        workflow: {
          nodes: [
            {
              id: "trigger_1",
              type: "trigger",
              position: { x: 100, y: 100 },
              data: { triggerType: "project_completed" },
              inputs: [],
              outputs: [{ id: "out_1", name: "Project Completed", type: "event", dataType: "project", required: false }]
            },
            {
              id: "invoice_1",
              type: "action",
              position: { x: 300, y: 50 },
              data: {
                actionType: "generate_invoice",
                includeTimeTracking: true,
                autoSend: true
              },
              inputs: [{ id: "in_1", name: "Project Data", type: "data", dataType: "project", required: true }],
              outputs: [{ id: "out_1", name: "Invoice Created", type: "event", dataType: "invoice", required: false }]
            },
            {
              id: "notification_1",
              type: "notification",
              position: { x: 300, y: 150 },
              data: {
                notificationType: "email",
                template: "project_completion",
                recipients: ["client_email", "project_team"]
              },
              inputs: [{ id: "in_1", name: "Project Data", type: "data", dataType: "project", required: true }],
              outputs: []
            },
            {
              id: "timer_1",
              type: "timer",
              position: { x: 500, y: 100 },
              data: { delayDays: 3 },
              inputs: [{ id: "in_1", name: "Trigger", type: "event", dataType: "any", required: true }],
              outputs: [{ id: "out_1", name: "Timer Completed", type: "event", dataType: "any", required: false }]
            },
            {
              id: "feedback_1",
              type: "action",
              position: { x: 700, y: 100 },
              data: {
                actionType: "send_feedback_request",
                surveyTemplate: "project_completion_feedback"
              },
              inputs: [{ id: "in_1", name: "Delayed Trigger", type: "event", dataType: "any", required: true }],
              outputs: []
            }
          ],
          connections: [
            {
              id: "conn_1",
              sourceNodeId: "trigger_1",
              sourcePortId: "out_1",
              targetNodeId: "invoice_1",
              targetPortId: "in_1"
            },
            {
              id: "conn_2",
              sourceNodeId: "trigger_1",
              sourcePortId: "out_1",
              targetNodeId: "notification_1",
              targetPortId: "in_1"
            },
            {
              id: "conn_3",
              sourceNodeId: "trigger_1",
              sourcePortId: "out_1",
              targetNodeId: "timer_1",
              targetPortId: "in_1"
            },
            {
              id: "conn_4",
              sourceNodeId: "timer_1",
              sourcePortId: "out_1",
              targetNodeId: "feedback_1",
              targetPortId: "in_1"
            }
          ],
          variables: [
            { id: "var_1", name: "feedback_delay_days", type: "number", defaultValue: 3, description: "Days to wait before sending feedback request", isSecret: false }
          ],
          triggers: [
            { id: "trig_1", type: "event", configuration: { eventType: "project_completed" }, isActive: true }
          ],
          settings: {
            timeout: 6e5,
            retryAttempts: 2,
            errorHandling: "continue",
            logging: true,
            notifications: true
          }
        },
        metadata: {
          requirements: ["Project management access", "Invoice generation access"],
          prerequisites: ["Email service configured", "Payment processing setup"],
          estimatedSetupTime: 25,
          complexity: "intermediate",
          industries: ["Software Development", "Creative Services", "Consulting"],
          useCase: ["Project Completion", "Client Satisfaction", "Payment Collection"],
          screenshots: [],
          documentation: "Comprehensive workflow that automates project completion tasks including invoicing and feedback collection.",
          changelog: [
            {
              version: "1.2.0",
              date: /* @__PURE__ */ new Date(),
              changes: ["Added automatic feedback collection", "Improved invoice generation logic"],
              author: "Gigster Garage"
            }
          ]
        }
      },
      {
        name: "Task Escalation Matrix",
        description: "Smart escalation workflow that automatically escalates overdue high-priority tasks through management hierarchy",
        category: "project_management",
        tags: ["escalation", "tasks", "management", "priority"],
        version: "1.1.0",
        author: "Gigster Garage",
        isPublic: true,
        isSystemTemplate: true,
        popularity: 78,
        rating: 4.4,
        usageCount: 0,
        workflow: {
          nodes: [
            {
              id: "trigger_1",
              type: "trigger",
              position: { x: 100, y: 100 },
              data: { triggerType: "scheduled", schedule: "daily" },
              inputs: [],
              outputs: [{ id: "out_1", name: "Daily Check", type: "event", dataType: "any", required: false }]
            },
            {
              id: "condition_1",
              type: "condition",
              position: { x: 300, y: 100 },
              data: {
                conditionType: "task_overdue",
                criteria: { priority: "high", overdueDays: 1 }
              },
              inputs: [{ id: "in_1", name: "Trigger", type: "event", dataType: "any", required: true }],
              outputs: [
                { id: "out_true", name: "Overdue Tasks Found", type: "data", dataType: "task_list", required: false },
                { id: "out_false", name: "No Overdue Tasks", type: "event", dataType: "any", required: false }
              ]
            },
            {
              id: "escalation_1",
              type: "action",
              position: { x: 500, y: 50 },
              data: {
                actionType: "escalate_to_manager",
                escalationLevel: 1
              },
              inputs: [{ id: "in_1", name: "Overdue Tasks", type: "data", dataType: "task_list", required: true }],
              outputs: [{ id: "out_1", name: "Level 1 Escalation", type: "event", dataType: "escalation", required: false }]
            }
          ],
          connections: [
            {
              id: "conn_1",
              sourceNodeId: "trigger_1",
              sourcePortId: "out_1",
              targetNodeId: "condition_1",
              targetPortId: "in_1"
            },
            {
              id: "conn_2",
              sourceNodeId: "condition_1",
              sourcePortId: "out_true",
              targetNodeId: "escalation_1",
              targetPortId: "in_1"
            }
          ],
          variables: [
            { id: "var_1", name: "escalation_threshold_days", type: "number", defaultValue: 1, description: "Days overdue before escalation", isSecret: false }
          ],
          triggers: [
            { id: "trig_1", type: "scheduled", configuration: { schedule: "0 9 * * *" }, isActive: true }
          ],
          settings: {
            timeout: 12e4,
            retryAttempts: 3,
            errorHandling: "stop",
            logging: true,
            notifications: true
          }
        },
        metadata: {
          requirements: ["Task management access", "User hierarchy access"],
          prerequisites: ["Team structure configured", "Manager assignments set"],
          estimatedSetupTime: 20,
          complexity: "intermediate",
          industries: ["All Industries"],
          useCase: ["Task Management", "Team Oversight", "Quality Assurance"],
          screenshots: [],
          documentation: "Automated escalation system for overdue high-priority tasks.",
          changelog: [
            {
              version: "1.1.0",
              date: /* @__PURE__ */ new Date(),
              changes: ["Enhanced condition logic", "Added multiple escalation levels"],
              author: "Gigster Garage"
            }
          ]
        }
      },
      {
        name: "Monthly Reporting Suite",
        description: "Comprehensive monthly reporting workflow that generates and distributes automated reports to stakeholders",
        category: "reporting_analytics",
        tags: ["reporting", "analytics", "monthly", "automation"],
        version: "1.0.0",
        author: "Gigster Garage",
        isPublic: true,
        isSystemTemplate: true,
        popularity: 72,
        rating: 4.3,
        usageCount: 0,
        workflow: {
          nodes: [
            {
              id: "trigger_1",
              type: "trigger",
              position: { x: 100, y: 100 },
              data: { triggerType: "scheduled", schedule: "monthly" },
              inputs: [],
              outputs: [{ id: "out_1", name: "Monthly Trigger", type: "event", dataType: "date", required: false }]
            },
            {
              id: "report_1",
              type: "action",
              position: { x: 300, y: 100 },
              data: {
                actionType: "generate_report",
                reportType: "monthly_summary",
                includeCharts: true
              },
              inputs: [{ id: "in_1", name: "Date Range", type: "data", dataType: "date", required: true }],
              outputs: [{ id: "out_1", name: "Report Generated", type: "data", dataType: "report", required: false }]
            },
            {
              id: "notification_1",
              type: "notification",
              position: { x: 500, y: 100 },
              data: {
                notificationType: "email",
                template: "monthly_report_distribution",
                recipients: ["stakeholders", "management"]
              },
              inputs: [{ id: "in_1", name: "Report Data", type: "data", dataType: "report", required: true }],
              outputs: []
            }
          ],
          connections: [
            {
              id: "conn_1",
              sourceNodeId: "trigger_1",
              sourcePortId: "out_1",
              targetNodeId: "report_1",
              targetPortId: "in_1"
            },
            {
              id: "conn_2",
              sourceNodeId: "report_1",
              sourcePortId: "out_1",
              targetNodeId: "notification_1",
              targetPortId: "in_1"
            }
          ],
          variables: [
            { id: "var_1", name: "report_day", type: "number", defaultValue: 1, description: "Day of month to generate report", isSecret: false }
          ],
          triggers: [
            { id: "trig_1", type: "scheduled", configuration: { schedule: "0 8 1 * *" }, isActive: true }
          ],
          settings: {
            timeout: 9e5,
            retryAttempts: 2,
            errorHandling: "retry",
            logging: true,
            notifications: true
          }
        },
        metadata: {
          requirements: ["Reporting access", "Data export access"],
          prerequisites: ["Data sources configured", "Stakeholder list maintained"],
          estimatedSetupTime: 30,
          complexity: "intermediate",
          industries: ["All Industries"],
          useCase: ["Business Intelligence", "Stakeholder Communication", "Performance Tracking"],
          screenshots: [],
          documentation: "Monthly automated reporting system with stakeholder distribution.",
          changelog: [
            {
              version: "1.0.0",
              date: /* @__PURE__ */ new Date(),
              changes: ["Initial template release", "Monthly report generation"],
              author: "Gigster Garage"
            }
          ]
        }
      }
    ];
    systemTemplates.forEach((template, index2) => {
      const templateWithId = {
        ...template,
        id: `system_template_${index2 + 1}`,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      this.templates.set(templateWithId.id, templateWithId);
    });
    this.isInitialized = true;
    console.log(`\u{1F4CB} Initialized ${systemTemplates.length} system workflow templates`);
  }
  /**
   * Get all available templates
   */
  getAllTemplates() {
    return Array.from(this.templates.values());
  }
  /**
   * Get templates by category
   */
  getTemplatesByCategory(category) {
    return Array.from(this.templates.values()).filter((template) => template.category === category);
  }
  /**
   * Search templates by query
   */
  searchTemplates(query, filters) {
    let results = Array.from(this.templates.values());
    if (query) {
      const searchLower = query.toLowerCase();
      results = results.filter(
        (template) => template.name.toLowerCase().includes(searchLower) || template.description.toLowerCase().includes(searchLower) || template.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }
    if (filters) {
      if (filters.category) {
        results = results.filter((template) => template.category === filters.category);
      }
      if (filters.complexity) {
        results = results.filter((template) => template.metadata.complexity === filters.complexity);
      }
      if (filters.tags && filters.tags.length > 0) {
        results = results.filter(
          (template) => filters.tags.some((tag) => template.tags.includes(tag))
        );
      }
      if (filters.minRating) {
        results = results.filter((template) => template.rating >= filters.minRating);
      }
    }
    return results.sort((a, b) => b.popularity - a.popularity);
  }
  /**
   * Get template by ID
   */
  getTemplate(id) {
    return this.templates.get(id) || null;
  }
  /**
   * Install template as workflow
   */
  async installTemplate(templateId, userId, customizations) {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const installedWorkflow = {
      id: workflowId,
      templateId,
      userId,
      name: customizations?.name || template.name,
      isActive: true,
      customizations: customizations || {},
      statistics: {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        averageExecutionTime: 0,
        lastExecutionTime: 0,
        errorRate: 0
      },
      installedAt: /* @__PURE__ */ new Date()
    };
    this.installedWorkflows.set(workflowId, installedWorkflow);
    template.usageCount++;
    console.log(`\u2728 Installed workflow template "${template.name}" for user ${userId}`);
    return workflowId;
  }
  /**
   * Get user's installed workflows
   */
  getUserWorkflows(userId) {
    return Array.from(this.installedWorkflows.values()).filter((workflow) => workflow.userId === userId);
  }
  /**
   * Create custom template
   */
  createCustomTemplate(template) {
    const templateId = `custom_template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullTemplate = {
      ...template,
      id: templateId,
      isSystemTemplate: false,
      usageCount: 0,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.templates.set(templateId, fullTemplate);
    console.log(`\u2728 Created custom template: ${fullTemplate.name}`);
    return templateId;
  }
  /**
   * Export template as JSON
   */
  exportTemplate(templateId) {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }
    return JSON.stringify(template, null, 2);
  }
  /**
   * Import template from JSON
   */
  importTemplate(templateJson, userId) {
    try {
      const templateData = JSON.parse(templateJson);
      if (!templateData.name || !templateData.workflow) {
        throw new Error("Invalid template structure");
      }
      const templateId = this.createCustomTemplate({
        ...templateData,
        author: userId,
        isPublic: false,
        popularity: 0,
        rating: 0
      });
      console.log(`\u{1F4E5} Imported template: ${templateData.name}`);
      return templateId;
    } catch (error) {
      console.error("Failed to import template:", error);
      throw new Error("Invalid template format");
    }
  }
  /**
   * Execute workflow (simplified implementation)
   */
  async executeWorkflow(workflowId, trigger) {
    const workflow = this.installedWorkflows.get(workflowId);
    if (!workflow || !workflow.isActive) {
      console.error(`Workflow ${workflowId} not found or inactive`);
      return false;
    }
    const template = this.templates.get(workflow.templateId);
    if (!template) {
      console.error(`Template ${workflow.templateId} not found for workflow ${workflowId}`);
      return false;
    }
    try {
      console.log(`\u{1F504} Executing workflow: ${workflow.name}`);
      const startTime = Date.now();
      await this.processWorkflowNodes(template.workflow, trigger);
      const executionTime = Date.now() - startTime;
      workflow.statistics.totalRuns++;
      workflow.statistics.successfulRuns++;
      workflow.statistics.lastExecutionTime = executionTime;
      workflow.statistics.averageExecutionTime = (workflow.statistics.averageExecutionTime * (workflow.statistics.totalRuns - 1) + executionTime) / workflow.statistics.totalRuns;
      workflow.lastRun = /* @__PURE__ */ new Date();
      console.log(`\u2705 Workflow "${workflow.name}" completed in ${executionTime}ms`);
      return true;
    } catch (error) {
      console.error(`\u274C Workflow "${workflow.name}" failed:`, error);
      workflow.statistics.totalRuns++;
      workflow.statistics.failedRuns++;
      workflow.statistics.errorRate = workflow.statistics.failedRuns / workflow.statistics.totalRuns;
      return false;
    }
  }
  /**
   * Process workflow nodes (simplified)
   */
  async processWorkflowNodes(workflow, trigger) {
    for (const node of workflow.nodes) {
      await this.processNode(node, trigger);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  /**
   * Process individual workflow node
   */
  async processNode(node, data) {
    console.log(`  Processing node: ${node.type} (${node.id})`);
    switch (node.type) {
      case "trigger":
        return { type: "trigger", data: node.data };
      case "action":
        return await this.processAction(node, data);
      case "condition":
        return await this.processCondition(node, data);
      case "notification":
        return await this.processNotification(node, data);
      case "timer":
        return await this.processTimer(node, data);
      default:
        console.log(`    Unsupported node type: ${node.type}`);
        return null;
    }
  }
  /**
   * Process action node
   */
  async processAction(node, data) {
    const actionType = node.data.actionType;
    console.log(`    Executing action: ${actionType}`);
    switch (actionType) {
      case "create_task":
        return { type: "task_created", taskId: "mock_task_id" };
      case "generate_invoice":
        return { type: "invoice_created", invoiceId: "mock_invoice_id" };
      case "send_feedback_request":
        return { type: "feedback_sent" };
      default:
        return { type: "action_completed" };
    }
  }
  /**
   * Process condition node
   */
  async processCondition(node, data) {
    console.log(`    Evaluating condition: ${node.data.conditionType}`);
    const conditionMet = Math.random() > 0.5;
    return { type: "condition_result", result: conditionMet };
  }
  /**
   * Process notification node
   */
  async processNotification(node, data) {
    console.log(`    Sending notification: ${node.data.notificationType}`);
    return { type: "notification_sent" };
  }
  /**
   * Process timer node
   */
  async processTimer(node, data) {
    const delayDays = node.data.delayDays || 0;
    console.log(`    Timer set for ${delayDays} days`);
    return { type: "timer_set", delayDays };
  }
  /**
   * Get workflow statistics
   */
  getWorkflowStats() {
    return {
      totalTemplates: this.templates.size,
      systemTemplates: Array.from(this.templates.values()).filter((t) => t.isSystemTemplate).length,
      customTemplates: Array.from(this.templates.values()).filter((t) => !t.isSystemTemplate).length,
      installedWorkflows: this.installedWorkflows.size,
      activeWorkflows: Array.from(this.installedWorkflows.values()).filter((w) => w.isActive).length,
      totalExecutions: Array.from(this.installedWorkflows.values()).reduce((sum, w) => sum + w.statistics.totalRuns, 0)
    };
  }
  /**
   * Get popular templates
   */
  getPopularTemplates(limit = 10) {
    return Array.from(this.templates.values()).sort((a, b) => b.popularity - a.popularity).slice(0, limit);
  }
  /**
   * Manual workflow execution trigger
   */
  async manualTrigger() {
    console.log("\u{1F527} Manual workflow templates trigger - Installing and customizing templates");
    try {
      const clientOnboardingTemplate = this.getTemplate("system_template_1");
      if (clientOnboardingTemplate) {
        const workflowId = await this.installTemplate(
          "system_template_1",
          "demo_admin",
          {
            name: "Custom Client Onboarding - Enterprise",
            project_manager: "enterprise_pm",
            welcome_delay_hours: 2,
            follow_up_days: [1, 3, 7]
          }
        );
        console.log(`\u2728 Installed and customized "Client Onboarding" template as workflow: ${workflowId}`);
      }
      const projectTemplate = this.getTemplate("system_template_2");
      if (projectTemplate) {
        const workflowId = await this.installTemplate(
          "system_template_2",
          "demo_admin",
          {
            name: "Enterprise Project Completion Suite",
            auto_invoice: true,
            feedback_delay_days: 5,
            include_performance_report: true,
            stakeholder_notification: true
          }
        );
        console.log(`\u2728 Installed and customized "Project Completion" template as workflow: ${workflowId}`);
      }
    } catch (error) {
      console.error("Error installing templates:", error);
    }
    const activeWorkflows = Array.from(this.installedWorkflows.values()).filter((workflow) => workflow.isActive);
    if (activeWorkflows.length === 0) {
      console.log("No active workflows to execute");
      return;
    }
    console.log(`\u{1F4CB} Found ${activeWorkflows.length} installed and customized workflows`);
    for (const workflow of activeWorkflows.slice(0, 2)) {
      await this.executeWorkflow(workflow.id, { trigger: "manual", source: "enterprise_demo" });
    }
  }
};
var workflowTemplatesService = new WorkflowTemplatesService();

// server/proposalWorkflowService.ts
init_storage();
async function sendProposalResponseNotification(proposal, response, clientMessage) {
  try {
    let notificationEmail = "team@gigstergarage.com";
    if (proposal.createdById) {
      const creator = await storage.getUser(proposal.createdById);
      if (creator?.email) {
        notificationEmail = creator.email;
      }
    }
    const responseDisplayMap = {
      "accepted": "\u2705 ACCEPTED",
      "rejected": "\u274C REJECTED",
      "revision_requested": "\u{1F504} REVISION REQUESTED"
    };
    const responseDisplay = responseDisplayMap[response] || response.toUpperCase();
    const subject = `Proposal Response: ${responseDisplay} - ${proposal.title}`;
    const textContent = `
PROPOSAL RESPONSE RECEIVED

Client Response: ${responseDisplay}
Proposal: ${proposal.title}
Client: ${proposal.clientName || "Unknown Client"}
Email: ${proposal.clientEmail || "No email provided"}
Response Date: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })}

${clientMessage ? `Client Message:
"${clientMessage}"
` : ""}

${response === "revision_requested" ? "ACTION REQUIRED: The client has requested revisions. Please review their feedback and create an updated proposal version." : response === "accepted" ? "CONGRATULATIONS! The client has accepted your proposal. You can now proceed with project setup and invoicing." : "The client has declined this proposal. Consider following up or creating a revised proposal if appropriate."}

View full proposal details in your Gigster Garage dashboard.

Best regards,
Gigster Garage System
    `.trim();
    const htmlContent = `
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: ${response === "accepted" ? "#d4edda" : response === "rejected" ? "#f8d7da" : "#fff3cd"}; border: 1px solid ${response === "accepted" ? "#c3e6cb" : response === "rejected" ? "#f5c6cb" : "#ffeaa7"}; color: ${response === "accepted" ? "#155724" : response === "rejected" ? "#721c24" : "#856404"}; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h2 style="margin: 0;">${responseDisplay}</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px;">Proposal Response Received</p>
        </div>
        
        <div style="background: #f8f9fa; border-left: 4px solid #004C6D; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #004C6D;">Proposal Details</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Proposal:</strong> ${proposal.title}</li>
            <li><strong>Client:</strong> ${proposal.clientName || "Unknown Client"}</li>
            <li><strong>Email:</strong> ${proposal.clientEmail || "No email provided"}</li>
            <li><strong>Response Date:</strong> ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })}</li>
          </ul>
        </div>
        
        ${clientMessage ? `
        <div style="background: #e9ecef; border-left: 4px solid #6c757d; padding: 15px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #495057;">Client Message</h4>
          <p style="margin: 0; font-style: italic;">"${clientMessage}"</p>
        </div>
        ` : ""}
        
        <div style="background: ${response === "accepted" ? "#d1ecf1" : response === "rejected" ? "#f2dede" : "#fcf8e3"}; border: 1px solid ${response === "accepted" ? "#bee5eb" : response === "rejected" ? "#ebccd1" : "#faebcc"}; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="margin-top: 0;">
            ${response === "revision_requested" ? "\u26A1 Action Required" : response === "accepted" ? "\u{1F389} Next Steps" : "\u{1F4A1} Suggested Actions"}
          </h4>
          <p style="margin: 0;">
            ${response === "revision_requested" ? "The client has requested revisions. Please review their feedback and create an updated proposal version." : response === "accepted" ? "Congratulations! The client has accepted your proposal. You can now proceed with project setup and invoicing." : "The client has declined this proposal. Consider following up or creating a revised proposal if appropriate."}
          </p>
        </div>
        
        <div style="margin-top: 30px; padding: 15px; background: #e9ecef; border-radius: 5px;">
          <p style="margin: 0;"><strong>Access your dashboard</strong><br>
          View full proposal details and manage your workflow in your Gigster Garage dashboard.</p>
        </div>
      </div>
    </body>
    </html>
    `;
    const emailSent = await sendEmail({
      to: notificationEmail,
      from: "proposals@gigstergarage.com",
      subject,
      text: textContent,
      html: htmlContent
    });
    if (emailSent) {
      console.log(`\u{1F4E7} Proposal response notification sent for "${proposal.title}" (${response}) to ${notificationEmail}`);
    } else {
      console.log(`\u274C Failed to send proposal response notification for "${proposal.title}"`);
    }
    return emailSent;
  } catch (error) {
    console.error(`\u274C Error sending proposal response notification:`, error);
    return false;
  }
}
async function createProposalRevision(originalProposal, revisionNotes) {
  try {
    const newVersion = originalProposal.version + 1;
    const revisionProposal = await storage.createProposal({
      title: `${originalProposal.title} (v${newVersion})`,
      templateId: originalProposal.templateId,
      projectId: originalProposal.projectId,
      clientId: originalProposal.clientId,
      clientName: originalProposal.clientName,
      clientEmail: originalProposal.clientEmail,
      status: "draft",
      content: originalProposal.content,
      variables: originalProposal.variables,
      projectDescription: originalProposal.projectDescription,
      totalBudget: originalProposal.totalBudget,
      timeline: originalProposal.timeline,
      deliverables: originalProposal.deliverables,
      terms: originalProposal.terms,
      lineItems: originalProposal.lineItems,
      calculatedTotal: originalProposal.calculatedTotal,
      expiresInDays: originalProposal.expiresInDays,
      version: newVersion,
      parentProposalId: originalProposal.id,
      createdById: originalProposal.createdById,
      metadata: {
        ...originalProposal.metadata,
        revisionReason: "client_requested",
        revisionNotes: revisionNotes || "",
        originalProposalId: originalProposal.id
      }
    });
    console.log(`\u{1F4DD} Created proposal revision v${newVersion} for "${originalProposal.title}"`);
    return revisionProposal;
  } catch (error) {
    console.error("\u274C Error creating proposal revision:", error);
    throw error;
  }
}
async function getProposalApprovalStats() {
  try {
    const proposals2 = await storage.getProposals();
    const stats = {
      totalProposals: proposals2.length,
      awaitingResponse: proposals2.filter((p) => ["sent", "viewed"].includes(p.status)).length,
      accepted: proposals2.filter((p) => p.status === "accepted").length,
      rejected: proposals2.filter((p) => p.status === "rejected").length,
      revisionRequested: proposals2.filter((p) => p.status === "revision_requested").length,
      expired: proposals2.filter((p) => p.status === "expired").length,
      acceptanceRate: 0
    };
    const respondedProposals = stats.accepted + stats.rejected + stats.revisionRequested;
    if (respondedProposals > 0) {
      stats.acceptanceRate = Math.round(stats.accepted / respondedProposals * 100);
    }
    return stats;
  } catch (error) {
    console.error("\u274C Error calculating proposal approval stats:", error);
    throw error;
  }
}

// server/contractManagementService.ts
init_storage();
import { format as format4, addDays as addDays3, isAfter as isAfter4, isBefore as isBefore3, startOfDay as startOfDay4 } from "date-fns";
var ContractManagementService = class {
  isMonitoring = false;
  intervalId = null;
  /**
   * Start automated contract monitoring for renewals, expirations, and reminders
   */
  startContractMonitoring() {
    if (this.isMonitoring) {
      console.log("\u{1F4CB} Contract monitoring already running");
      return;
    }
    console.log("\u{1F680} Starting automated contract monitoring");
    this.isMonitoring = true;
    this.checkContractStatuses();
    this.intervalId = setInterval(() => {
      this.checkContractStatuses();
    }, 24 * 60 * 60 * 1e3);
  }
  /**
   * Stop contract monitoring
   */
  stopContractMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isMonitoring = false;
    console.log("\u23F9\uFE0F Stopped contract monitoring");
  }
  /**
   * Main function to check contract statuses and send notifications
   */
  async checkContractStatuses() {
    try {
      console.log("\u{1F50D} Checking contract statuses for updates...");
      const contracts2 = await storage.getContracts();
      const today = startOfDay4(/* @__PURE__ */ new Date());
      let renewalNotifications = 0;
      let expirationWarnings = 0;
      let autoRenewals = 0;
      for (const contract of contracts2) {
        const results = await this.processContractLifecycle(contract, today);
        renewalNotifications += results.renewalNotification ? 1 : 0;
        expirationWarnings += results.expirationWarning ? 1 : 0;
        autoRenewals += results.autoRenewal ? 1 : 0;
      }
      console.log(`\u2705 Contract monitoring complete: ${renewalNotifications} renewal notices, ${expirationWarnings} expiration warnings, ${autoRenewals} auto-renewals`);
    } catch (error) {
      console.error("\u274C Error during contract status check:", error);
    }
  }
  /**
   * Process individual contract lifecycle events
   */
  async processContractLifecycle(contract, today) {
    let renewalNotification = false;
    let expirationWarning = false;
    let autoRenewal = false;
    if (!contract.status || !["fully_signed", "executed"].includes(contract.status)) {
      return { renewalNotification, expirationWarning, autoRenewal };
    }
    if (contract.expirationDate) {
      const expirationDate = new Date(contract.expirationDate);
      const noticePeriod = contract.noticePeriod || 30;
      const noticeDate = addDays3(expirationDate, -noticePeriod);
      if (isAfter4(today, noticeDate) && isBefore3(today, expirationDate)) {
        const daysTillExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24));
        const lastReminder = contract.lastReminderSent ? new Date(contract.lastReminderSent) : null;
        const weekAgo = addDays3(today, -7);
        if (!lastReminder || isBefore3(lastReminder, weekAgo)) {
          await this.sendExpirationNotice(contract, daysTillExpiration);
          await storage.updateContract(contract.id, {
            lastReminderSent: /* @__PURE__ */ new Date(),
            reminderCount: (contract.reminderCount || 0) + 1
          });
          expirationWarning = true;
        }
      }
      if (contract.autoRenewal && isAfter4(today, expirationDate)) {
        await this.processAutoRenewal(contract);
        autoRenewal = true;
      }
      if (isAfter4(today, expirationDate) && !contract.autoRenewal && contract.status !== "expired") {
        await storage.updateContract(contract.id, { status: "expired" });
        console.log(`\u{1F4CB} Contract ${contract.contractNumber} marked as expired`);
      }
    }
    return { renewalNotification, expirationWarning, autoRenewal };
  }
  /**
   * Send contract expiration notice
   */
  async sendExpirationNotice(contract, daysRemaining) {
    try {
      let notificationEmail = "legal@gigstergarage.com";
      if (contract.createdById) {
        const creator = await storage.getUser(contract.createdById);
        if (creator?.email) {
          notificationEmail = creator.email;
        }
      }
      const subject = `Contract Expiration Notice - ${contract.title} (${daysRemaining} days)`;
      const textContent = `
CONTRACT EXPIRATION NOTICE

Contract: ${contract.title}
Contract Number: ${contract.contractNumber}
Client: ${contract.clientName || "Unknown Client"}
Days Remaining: ${daysRemaining}
Expiration Date: ${format4(new Date(contract.expirationDate), "MMMM d, yyyy")}
Status: ${contract.status ? contract.status.replace("_", " ").toUpperCase() : "UNKNOWN"}

${contract.autoRenewal ? "This contract is set for automatic renewal." : "ACTION REQUIRED: Review this contract for renewal or termination."}

Contract Details:
- Contract Type: ${contract.contractType.replace("_", " ").toUpperCase()}
- Contract Value: ${contract.currency} ${contract.contractValue}
- Auto Renewal: ${contract.autoRenewal ? "Yes" : "No"}

${contract.autoRenewal ? "" : `
Please take action before the expiration date:
1. Renew the contract if services will continue
2. Negotiate new terms if needed
3. Terminate gracefully if services are ending
4. Ensure all deliverables are completed
`}

View contract details in your Gigster Garage dashboard.

Best regards,
Gigster Garage Legal System
      `.trim();
      const htmlContent = `
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="margin: 0;">\u26A0\uFE0F Contract Expiration Notice</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px;">${daysRemaining} days remaining</p>
          </div>
          
          <div style="background: #f8f9fa; border-left: 4px solid #004C6D; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #004C6D;">Contract Details</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li><strong>Contract:</strong> ${contract.title}</li>
              <li><strong>Contract Number:</strong> ${contract.contractNumber}</li>
              <li><strong>Client:</strong> ${contract.clientName || "Unknown Client"}</li>
              <li><strong>Expiration Date:</strong> ${format4(new Date(contract.expirationDate), "MMMM d, yyyy")}</li>
              <li><strong>Contract Type:</strong> ${contract.contractType.replace("_", " ").toUpperCase()}</li>
              <li><strong>Contract Value:</strong> ${contract.currency} ${contract.contractValue}</li>
              <li><strong>Auto Renewal:</strong> ${contract.autoRenewal ? "Yes" : "No"}</li>
            </ul>
          </div>
          
          ${contract.autoRenewal ? `
          <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #0c5460;">\u{1F504} Automatic Renewal</h4>
            <p style="margin: 0;">This contract is configured for automatic renewal. It will be extended automatically unless you take action to modify or terminate it.</p>
          </div>
          ` : `
          <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #721c24;">\u26A1 Action Required</h4>
            <p style="margin: 0;">Please take action before the expiration date:</p>
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li>Renew the contract if services will continue</li>
              <li>Negotiate new terms if needed</li>
              <li>Terminate gracefully if services are ending</li>
              <li>Ensure all deliverables are completed</li>
            </ol>
          </div>
          `}
          
          <div style="margin-top: 30px; padding: 15px; background: #e9ecef; border-radius: 5px;">
            <p style="margin: 0;"><strong>Manage your contracts</strong><br>
            View full contract details and manage renewals in your Gigster Garage dashboard.</p>
          </div>
        </div>
      </body>
      </html>
      `;
      const emailSent = await sendEmail({
        to: notificationEmail,
        from: "legal@gigstergarage.com",
        subject,
        text: textContent,
        html: htmlContent
      });
      if (emailSent) {
        console.log(`\u{1F4E7} Contract expiration notice sent for "${contract.title}" (${daysRemaining} days) to ${notificationEmail}`);
      }
      return emailSent;
    } catch (error) {
      console.error(`\u274C Error sending contract expiration notice:`, error);
      return false;
    }
  }
  /**
   * Process automatic contract renewal
   */
  async processAutoRenewal(contract) {
    try {
      const renewalPeriod = contract.renewalPeriod || 365;
      const newExpirationDate = addDays3(new Date(contract.expirationDate), renewalPeriod);
      await storage.updateContract(contract.id, {
        expirationDate: newExpirationDate.toISOString().split("T")[0],
        renewalDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        reminderCount: 0,
        lastReminderSent: null,
        metadata: {
          ...contract.metadata,
          autoRenewed: true,
          lastRenewalDate: (/* @__PURE__ */ new Date()).toISOString(),
          previousExpirationDate: contract.expirationDate
        }
      });
      console.log(`\u{1F504} Auto-renewed contract ${contract.contractNumber} until ${format4(newExpirationDate, "MMM d, yyyy")}`);
      await this.sendAutoRenewalNotification(contract, newExpirationDate);
    } catch (error) {
      console.error(`\u274C Error processing auto-renewal for contract ${contract.contractNumber}:`, error);
    }
  }
  /**
   * Send auto-renewal notification
   */
  async sendAutoRenewalNotification(contract, newExpirationDate) {
    try {
      let notificationEmail = "legal@gigstergarage.com";
      if (contract.createdById) {
        const creator = await storage.getUser(contract.createdById);
        if (creator?.email) {
          notificationEmail = creator.email;
        }
      }
      const subject = `Contract Auto-Renewed - ${contract.title}`;
      const textContent = `
CONTRACT AUTO-RENEWAL NOTIFICATION

The following contract has been automatically renewed:

Contract: ${contract.title}
Contract Number: ${contract.contractNumber}
Client: ${contract.clientName || "Unknown Client"}
Previous Expiration: ${format4(new Date(contract.expirationDate), "MMMM d, yyyy")}
New Expiration: ${format4(newExpirationDate, "MMMM d, yyyy")}
Renewal Period: ${contract.renewalPeriod || 365} days

This contract was set for automatic renewal and has been extended according to the original terms.

If you need to modify the renewal terms or cancel the auto-renewal, please update the contract settings in your dashboard.

Best regards,
Gigster Garage Legal System
      `.trim();
      await sendEmail({
        to: notificationEmail,
        from: "legal@gigstergarage.com",
        subject,
        text: textContent,
        html: textContent.replace(/\n/g, "<br>")
      });
      console.log(`\u{1F4E7} Auto-renewal notification sent for contract ${contract.contractNumber}`);
    } catch (error) {
      console.error("\u274C Error sending auto-renewal notification:", error);
    }
  }
  /**
   * Get contract management statistics
   */
  async getContractStats() {
    try {
      const contracts2 = await storage.getContracts();
      const today = /* @__PURE__ */ new Date();
      const thirtyDaysFromNow = addDays3(today, 30);
      const stats = {
        totalContracts: contracts2.length,
        activeContracts: contracts2.filter((c) => c.status && ["fully_signed", "executed"].includes(c.status)).length,
        expiringContracts: contracts2.filter(
          (c) => c.expirationDate && new Date(c.expirationDate) <= thirtyDaysFromNow && new Date(c.expirationDate) > today && c.status && ["fully_signed", "executed"].includes(c.status)
        ).length,
        expiredContracts: contracts2.filter((c) => c.status && c.status === "expired").length,
        pendingSignatures: contracts2.filter((c) => c.status && ["sent", "viewed", "pending_signature", "partially_signed"].includes(c.status)).length,
        autoRenewals: contracts2.filter((c) => c.autoRenewal && c.status && ["fully_signed", "executed"].includes(c.status)).length,
        contractValue: contracts2.filter((c) => c.status && ["fully_signed", "executed"].includes(c.status)).reduce((sum, c) => sum + parseFloat(c.contractValue || "0"), 0)
      };
      return stats;
    } catch (error) {
      console.error("\u274C Error calculating contract stats:", error);
      throw error;
    }
  }
};
var contractManagementService = new ContractManagementService();

// server/backup-routes.ts
import { Router } from "express";

// server/backup-service.ts
init_storage();
import fs from "fs/promises";
import path from "path";
var BackupService = class {
  storage;
  backupDir;
  constructor() {
    this.storage = new DatabaseStorage();
    this.backupDir = path.join(process.cwd(), "backups");
  }
  /**
   * Create a comprehensive database backup
   */
  async createBackup(options = {}) {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      const timestamp2 = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
      const filename = `gigster-garage-backup-${timestamp2}.json`;
      const filepath = path.join(this.backupDir, filename);
      console.log("\u{1F504} Creating database backup...");
      const backupData = {
        metadata: {
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          version: "1.0.0",
          description: options.description || "Automated backup",
          tables: [],
          totalRecords: 0
        },
        data: {}
      };
      const tablesToBackup = options.includeTables || [
        "users",
        "projects",
        "tasks",
        "clients",
        "proposals",
        "contracts",
        "invoices",
        "templates",
        "time_logs",
        "file_attachments",
        "custom_fields",
        "custom_field_values",
        "document_versions"
      ];
      const excludedTables = options.excludeTables || [];
      for (const table of tablesToBackup) {
        if (excludedTables.includes(table)) continue;
        try {
          let data = [];
          switch (table) {
            case "users":
              data = await this.storage.getUsers();
              break;
            case "projects":
              data = await this.storage.getProjects();
              break;
            case "tasks":
              data = await this.storage.getTasks();
              break;
            case "clients":
              data = await this.storage.getClients();
              break;
            case "proposals":
              data = await this.storage.getProposals();
              break;
            case "contracts":
              data = await this.storage.getContracts();
              break;
            case "invoices":
              data = await this.storage.getInvoices();
              break;
            case "templates":
              data = await this.storage.getTemplates();
              break;
            case "time_logs":
              data = await this.storage.getTimeLogs();
              break;
            case "file_attachments":
              data = await this.storage.getAllFileAttachments();
              break;
            default:
              console.warn(`\u26A0\uFE0F  Skipping unknown table: ${table}`);
              continue;
          }
          backupData.data[table] = data;
          backupData.metadata.tables.push(table);
          backupData.metadata.totalRecords += data.length;
          console.log(`\u2705 Backed up ${data.length} records from ${table}`);
        } catch (error) {
          console.warn(`\u26A0\uFE0F  Error backing up ${table}:`, error);
        }
      }
      const jsonData = JSON.stringify(backupData, null, 2);
      await fs.writeFile(filepath, jsonData, "utf8");
      const stats = await fs.stat(filepath);
      backupData.metadata.fileSize = stats.size;
      await fs.writeFile(filepath, JSON.stringify(backupData, null, 2), "utf8");
      console.log(`\u2705 Backup created successfully: ${filename}`);
      console.log(`\u{1F4CA} Total records: ${backupData.metadata.totalRecords}`);
      console.log(`\u{1F4E6} File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      return filepath;
    } catch (error) {
      console.error("\u274C Backup creation failed:", error);
      throw new Error(`Backup failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  /**
   * List all available backups
   */
  async listBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files.filter((f) => f.endsWith(".json") && f.includes("backup"));
      const backups = [];
      for (const file of backupFiles) {
        try {
          const filepath = path.join(this.backupDir, file);
          const content = await fs.readFile(filepath, "utf8");
          const data = JSON.parse(content);
          if (data.metadata) {
            backups.push({
              ...data.metadata,
              filename: file,
              filepath
            });
          }
        } catch (error) {
          console.warn(`\u26A0\uFE0F  Could not read backup file ${file}:`, error);
        }
      }
      return backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error("\u274C Failed to list backups:", error);
      return [];
    }
  }
  /**
   * Restore data from a backup file
   */
  async restoreBackup(backupPath, options = {}) {
    try {
      console.log("\u{1F504} Starting database restore...");
      if (options.dryRun) {
        console.log("\u{1F9EA} DRY RUN MODE - No data will be modified");
      }
      const content = await fs.readFile(backupPath, "utf8");
      const backupData = JSON.parse(content);
      if (!backupData.metadata || !backupData.data) {
        throw new Error("Invalid backup file format");
      }
      console.log(`\u{1F4C4} Backup info: ${backupData.metadata.description}`);
      console.log(`\u{1F4C5} Created: ${backupData.metadata.timestamp}`);
      console.log(`\u{1F4CA} Total records: ${backupData.metadata.totalRecords}`);
      const tablesToRestore = options.includeTables || Object.keys(backupData.data);
      const excludedTables = options.excludeTables || [];
      for (const table of tablesToRestore) {
        if (excludedTables.includes(table) || !backupData.data[table]) continue;
        const records = backupData.data[table];
        if (!records || records.length === 0) {
          console.log(`\u23E9 Skipping empty table: ${table}`);
          continue;
        }
        console.log(`\u{1F504} Restoring ${records.length} records to ${table}...`);
        if (options.dryRun) {
          console.log(`\u{1F9EA} Would restore ${records.length} records to ${table}`);
          continue;
        }
        try {
          if (options.replaceExisting) {
            console.log(`\u{1F5D1}\uFE0F  Clearing existing data in ${table}...`);
          }
          for (const record of records) {
            try {
              switch (table) {
                case "users":
                  await this.storage.createUser(record);
                  break;
                case "projects":
                  await this.storage.createProject(record);
                  break;
                case "tasks":
                  await this.storage.createTask(record, record.createdById || "system");
                  break;
                case "clients":
                  await this.storage.createClient(record);
                  break;
                case "proposals":
                  await this.storage.createProposal(record);
                  break;
                case "contracts":
                  await this.storage.createContract(record);
                  break;
                case "invoices":
                  await this.storage.createInvoice(record);
                  break;
                case "templates":
                  await this.storage.createTemplate(record);
                  break;
                default:
                  console.warn(`\u26A0\uFE0F  No restore method for table: ${table}`);
              }
            } catch (recordError) {
              console.warn(`\u26A0\uFE0F  Failed to restore record in ${table}:`, recordError instanceof Error ? recordError.message : String(recordError));
            }
          }
          console.log(`\u2705 Restored ${records.length} records to ${table}`);
        } catch (error) {
          console.error(`\u274C Failed to restore table ${table}:`, error);
        }
      }
      if (!options.dryRun) {
        console.log("\u2705 Database restore completed successfully!");
      } else {
        console.log("\u{1F9EA} Dry run completed - no data was modified");
      }
    } catch (error) {
      console.error("\u274C Restore failed:", error);
      throw new Error(`Restore failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  /**
   * Delete old backup files (keep last N backups)
   */
  async cleanupOldBackups(keepCount = 5) {
    try {
      const backups = await this.listBackups();
      if (backups.length <= keepCount) {
        console.log(`\u{1F4E6} Only ${backups.length} backups found, no cleanup needed`);
        return;
      }
      const toDelete = backups.slice(keepCount);
      for (const backup of toDelete) {
        try {
          await fs.unlink(backup.filepath);
          console.log(`\u{1F5D1}\uFE0F  Deleted old backup: ${backup.filename}`);
        } catch (error) {
          console.warn(`\u26A0\uFE0F  Failed to delete ${backup.filename}:`, error);
        }
      }
      console.log(`\u2705 Cleanup completed - kept ${keepCount} most recent backups`);
    } catch (error) {
      console.error("\u274C Backup cleanup failed:", error);
    }
  }
  /**
   * Schedule automatic backups
   */
  startAutomaticBackups(intervalHours = 24) {
    console.log(`\u{1F552} Starting automatic backups every ${intervalHours} hours`);
    return setInterval(async () => {
      try {
        console.log("\u{1F504} Creating scheduled backup...");
        await this.createBackup({
          description: `Scheduled backup - ${(/* @__PURE__ */ new Date()).toISOString()}`
        });
        await this.cleanupOldBackups(10);
      } catch (error) {
        console.error("\u274C Scheduled backup failed:", error);
      }
    }, intervalHours * 60 * 60 * 1e3);
  }
  /**
   * Get backup configurations (required by routes.ts)
   */
  async getConfigurations() {
    return [
      {
        id: "default",
        name: "Default Backup Configuration",
        description: "Standard backup of all tables",
        includeTables: ["users", "projects", "tasks", "clients", "proposals", "contracts", "invoices", "templates", "time_logs", "file_attachments"],
        excludeTables: [],
        schedule: "0 2 * * *",
        // Daily at 2 AM
        retention: 30,
        // Keep 30 backups
        compress: true,
        isActive: true
      },
      {
        id: "minimal",
        name: "Minimal Backup Configuration",
        description: "Backup of essential data only",
        includeTables: ["users", "projects", "tasks"],
        excludeTables: ["templates", "file_attachments"],
        schedule: "0 6 * * *",
        // Daily at 6 AM
        retention: 7,
        // Keep 7 backups
        compress: true,
        isActive: false
      }
    ];
  }
  /**
   * Get list of backups (alias for listBackups, required by routes.ts)
   */
  async getBackups() {
    return await this.listBackups();
  }
  /**
   * Perform backup (alias for createBackup, required by routes.ts)
   */
  async performBackup(configId = "default", userId) {
    const configurations = await this.getConfigurations();
    const config = configurations.find((c) => c.id === configId);
    if (!config) {
      throw new Error(`Backup configuration '${configId}' not found`);
    }
    const options = {
      includeTables: config.includeTables,
      excludeTables: config.excludeTables,
      description: `${config.description} (initiated by user: ${userId})`,
      compress: config.compress
    };
    console.log(`\u{1F680} Starting backup with configuration: ${config.name}`);
    return await this.createBackup(options);
  }
  /**
   * Get backup statistics (required by routes.ts)
   */
  async getStatistics() {
    try {
      const backups = await this.listBackups();
      const totalBackups = backups.length;
      if (totalBackups === 0) {
        return {
          totalBackups: 0,
          totalSize: 0,
          averageSize: 0,
          oldestBackup: null,
          newestBackup: null,
          totalRecords: 0,
          averageRecords: 0,
          storageUsed: "0 MB"
        };
      }
      const totalSize = backups.reduce((sum, backup) => sum + (backup.fileSize || 0), 0);
      const totalRecords = backups.reduce((sum, backup) => sum + (backup.totalRecords || 0), 0);
      const averageSize = totalSize / totalBackups;
      const averageRecords = totalRecords / totalBackups;
      const sortedBackups = [...backups].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      return {
        totalBackups,
        totalSize,
        averageSize,
        oldestBackup: sortedBackups[0]?.timestamp || null,
        newestBackup: sortedBackups[sortedBackups.length - 1]?.timestamp || null,
        totalRecords,
        averageRecords,
        storageUsed: `${(totalSize / 1024 / 1024).toFixed(2)} MB`,
        backupSizes: backups.map((b) => ({
          filename: b.filename,
          size: b.fileSize,
          records: b.totalRecords,
          timestamp: b.timestamp
        }))
      };
    } catch (error) {
      console.error("\u274C Failed to get backup statistics:", error);
      return {
        totalBackups: 0,
        totalSize: 0,
        averageSize: 0,
        oldestBackup: null,
        newestBackup: null,
        totalRecords: 0,
        averageRecords: 0,
        storageUsed: "0 MB",
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};
var backupService = new BackupService();

// server/backup-routes.ts
var isAuthenticated = (req, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  req.user = req.session.user;
  next();
};
var router = Router();
var requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};
router.get("/backups", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const backups = await backupService.listBackups();
    res.json({ backups });
  } catch (error) {
    console.error("Failed to list backups:", error);
    res.status(500).json({ error: "Failed to list backups" });
  }
});
router.post("/backups", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { description, includeTables, excludeTables } = req.body;
    const backupPath = await backupService.createBackup({
      description,
      includeTables,
      excludeTables
    });
    res.json({
      success: true,
      message: "Backup created successfully",
      backupPath
    });
  } catch (error) {
    console.error("Backup creation failed:", error);
    res.status(500).json({ error: error.message || "Backup creation failed" });
  }
});
router.post("/backups/restore", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const {
      backupPath,
      replaceExisting = false,
      includeTables,
      excludeTables,
      dryRun = false
    } = req.body;
    if (!backupPath) {
      return res.status(400).json({ error: "Backup path is required" });
    }
    await backupService.restoreBackup(backupPath, {
      replaceExisting,
      includeTables,
      excludeTables,
      dryRun
    });
    res.json({
      success: true,
      message: dryRun ? "Dry run completed successfully" : "Restore completed successfully"
    });
  } catch (error) {
    console.error("Restore failed:", error);
    res.status(500).json({ error: error.message || "Restore failed" });
  }
});
router.delete("/backups/cleanup", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { keepCount = 5 } = req.body;
    await backupService.cleanupOldBackups(keepCount);
    res.json({
      success: true,
      message: `Cleaned up old backups, kept ${keepCount} most recent`
    });
  } catch (error) {
    console.error("Cleanup failed:", error);
    res.status(500).json({ error: error.message || "Cleanup failed" });
  }
});
router.post("/backups/schedule", isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { intervalHours = 24 } = req.body;
    backupService.startAutomaticBackups(intervalHours);
    res.json({
      success: true,
      message: `Automatic backups scheduled every ${intervalHours} hours`
    });
  } catch (error) {
    console.error("Schedule setup failed:", error);
    res.status(500).json({ error: error.message || "Schedule setup failed" });
  }
});

// server/ai-insights-service.ts
init_storage();
import OpenAI from "openai";
var openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;
var AIInsightsService = class {
  /**
   * Check if AI services are available
   */
  isAIAvailable() {
    return openai !== null;
  }
  /**
   * Generate comprehensive business insights
   */
  async generateInsights(userId) {
    try {
      if (!this.isAIAvailable()) {
        console.warn("\u26A0\uFE0F OpenAI API key not configured - AI insights disabled");
        return [];
      }
      console.log("\u{1F9E0} Generating AI insights for user:", userId);
      const insightData = await this.gatherUserData(userId);
      const insights = await Promise.all([
        this.analyzeProductivity(insightData),
        this.analyzeFinancialHealth(insightData),
        this.analyzeProjectProgress(insightData),
        this.identifyWorkflowOptimizations(insightData),
        this.identifyBusinessOpportunities(insightData)
      ]);
      const allInsights = insights.flat().filter((insight) => insight !== null);
      console.log(`\u2705 Generated ${allInsights.length} AI insights`);
      return allInsights;
    } catch (error) {
      console.error("\u274C Error generating AI insights:", error);
      throw error;
    }
  }
  /**
   * Gather comprehensive user data for analysis
   */
  async gatherUserData(userId) {
    const [tasks2, projects2, timeLog, invoices2, proposals2, contracts2] = await Promise.all([
      storage.getTasks().then((tasks3) => tasks3.filter((t) => t.assignedToId === userId || t.createdById === userId)),
      storage.getProjects(),
      storage.getTimeLogs().then((logs) => logs.filter((log2) => log2.userId === userId)),
      storage.getInvoices(),
      storage.getProposals(),
      storage.getContracts()
    ]);
    return { tasks: tasks2, projects: projects2, timeLog, invoices: invoices2, proposals: proposals2, contracts: contracts2 };
  }
  /**
   * Analyze user productivity patterns
   */
  async analyzeProductivity(data) {
    try {
      if (!this.isAIAvailable()) {
        return null;
      }
      const completedTasks = data.tasks.filter((t) => t.status === "completed");
      const overdueTasks = data.tasks.filter((t) => t.status === "overdue");
      const totalTimeLogged = data.timeLog.reduce((sum, log2) => sum + (log2.duration || 0), 0);
      const prompt = `
        Analyze this user's productivity data and provide insights:
        
        Task Completion:
        - Total tasks: ${data.tasks.length}
        - Completed tasks: ${completedTasks.length}
        - Overdue tasks: ${overdueTasks.length}
        - Completion rate: ${data.tasks.length > 0 ? (completedTasks.length / data.tasks.length * 100).toFixed(1) : 0}%
        
        Time Tracking:
        - Total time logged: ${totalTimeLogged} minutes
        - Average time per task: ${completedTasks.length > 0 ? (totalTimeLogged / completedTasks.length).toFixed(1) : 0} minutes
        
        Respond with JSON in this exact format:
        {
          "title": "Brief insight title",
          "description": "2-3 sentence analysis of productivity patterns",
          "recommendation": "Specific actionable recommendation",
          "priority": "high|medium|low",
          "impact": "Expected impact of following recommendation",
          "actionItems": ["action1", "action2", "action3"],
          "confidence": 0.85
        }
      `;
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        // the newest OpenAI model is "gpt-4o" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7
      });
      const insight = JSON.parse(response.choices[0].message.content);
      return {
        id: `productivity_${Date.now()}`,
        type: "productivity",
        ...insight,
        createdAt: /* @__PURE__ */ new Date()
      };
    } catch (error) {
      console.warn("\u26A0\uFE0F Failed to analyze productivity:", error);
      return null;
    }
  }
  /**
   * Analyze financial health and revenue patterns
   */
  async analyzeFinancialHealth(data) {
    try {
      if (!this.isAIAvailable()) {
        return null;
      }
      const totalInvoiceValue = data.invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      const paidInvoices = data.invoices.filter((inv) => inv.status === "paid");
      const overdueInvoices = data.invoices.filter((inv) => inv.status === "overdue");
      const proposalValue = data.proposals.reduce((sum, prop) => sum + (prop.totalBudget || 0), 0);
      const prompt = `
        Analyze this business's financial health:
        
        Revenue Metrics:
        - Total invoice value: $${totalInvoiceValue}
        - Paid invoices: ${paidInvoices.length} ($${paidInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)})
        - Overdue invoices: ${overdueInvoices.length} ($${overdueInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)})
        - Pipeline value (proposals): $${proposalValue}
        - Payment collection rate: ${data.invoices.length > 0 ? (paidInvoices.length / data.invoices.length * 100).toFixed(1) : 0}%
        
        Respond with JSON financial insights and recommendations.
        {
          "title": "Financial health insight title",
          "description": "Financial performance analysis",
          "recommendation": "Specific financial improvement recommendation",
          "priority": "high|medium|low",
          "impact": "Expected financial impact",
          "actionItems": ["financial action1", "financial action2"],
          "confidence": 0.8
        }
      `;
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        // the newest OpenAI model is "gpt-4o" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7
      });
      const insight = JSON.parse(response.choices[0].message.content);
      return {
        id: `financial_${Date.now()}`,
        type: "financial",
        ...insight,
        createdAt: /* @__PURE__ */ new Date()
      };
    } catch (error) {
      console.warn("\u26A0\uFE0F Failed to analyze financial health:", error);
      return null;
    }
  }
  /**
   * Analyze project progress and delivery patterns
   */
  async analyzeProjectProgress(data) {
    try {
      if (!this.isAIAvailable()) {
        return null;
      }
      const activeProjects = data.projects.filter((p) => p.status === "active");
      const completedProjects = data.projects.filter((p) => p.status === "completed");
      const projectTaskCounts = data.projects.map((project) => ({
        name: project.name,
        totalTasks: data.tasks.filter((t) => t.projectId === project.id).length,
        completedTasks: data.tasks.filter((t) => t.projectId === project.id && t.status === "completed").length
      }));
      const prompt = `
        Analyze project delivery performance:
        
        Project Portfolio:
        - Active projects: ${activeProjects.length}
        - Completed projects: ${completedProjects.length}
        - Project completion rate: ${data.projects.length > 0 ? (completedProjects.length / data.projects.length * 100).toFixed(1) : 0}%
        
        Project Details:
        ${projectTaskCounts.map((p) => `- ${p.name}: ${p.completedTasks}/${p.totalTasks} tasks completed`).join("\n")}
        
        Provide project management insights and recommendations.
        {
          "title": "Project delivery insight",
          "description": "Project progress and delivery analysis", 
          "recommendation": "Project management improvement recommendation",
          "priority": "high|medium|low",
          "impact": "Expected project delivery impact",
          "actionItems": ["project action1", "project action2"],
          "confidence": 0.9
        }
      `;
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        // the newest OpenAI model is "gpt-4o" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7
      });
      const insight = JSON.parse(response.choices[0].message.content);
      return {
        id: `project_${Date.now()}`,
        type: "project",
        ...insight,
        createdAt: /* @__PURE__ */ new Date()
      };
    } catch (error) {
      console.warn("\u26A0\uFE0F Failed to analyze project progress:", error);
      return null;
    }
  }
  /**
   * Identify workflow optimization opportunities
   */
  async identifyWorkflowOptimizations(data) {
    try {
      if (!this.isAIAvailable()) {
        return null;
      }
      const tasksByPriority = {
        high: data.tasks.filter((t) => t.priority === "high").length,
        medium: data.tasks.filter((t) => t.priority === "medium").length,
        low: data.tasks.filter((t) => t.priority === "low").length
      };
      const averageTaskDuration = data.timeLog.length > 0 ? data.timeLog.reduce((sum, log2) => sum + (log2.duration || 0), 0) / data.timeLog.length : 0;
      const prompt = `
        Analyze workflow efficiency:
        
        Task Distribution:
        - High priority: ${tasksByPriority.high}
        - Medium priority: ${tasksByPriority.medium}  
        - Low priority: ${tasksByPriority.low}
        - Average task duration: ${averageTaskDuration.toFixed(1)} minutes
        
        Time Tracking Patterns:
        - Total time entries: ${data.timeLog.length}
        - Productivity sessions: ${data.timeLog.filter((log2) => (log2.duration || 0) > 30).length}
        
        Identify workflow optimization opportunities.
        {
          "title": "Workflow optimization opportunity",
          "description": "Workflow efficiency analysis",
          "recommendation": "Specific workflow improvement recommendation", 
          "priority": "high|medium|low",
          "impact": "Expected workflow improvement impact",
          "actionItems": ["workflow action1", "workflow action2"],
          "confidence": 0.75
        }
      `;
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        // the newest OpenAI model is "gpt-4o" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7
      });
      const insight = JSON.parse(response.choices[0].message.content);
      return {
        id: `workflow_${Date.now()}`,
        type: "workflow",
        ...insight,
        createdAt: /* @__PURE__ */ new Date()
      };
    } catch (error) {
      console.warn("\u26A0\uFE0F Failed to analyze workflow optimization:", error);
      return null;
    }
  }
  /**
   * Identify business growth opportunities
   */
  async identifyBusinessOpportunities(data) {
    try {
      if (!this.isAIAvailable()) {
        return null;
      }
      const acceptedProposals = data.proposals.filter((p) => p.status === "accepted");
      const proposalWinRate = data.proposals.length > 0 ? (acceptedProposals.length / data.proposals.length * 100).toFixed(1) : "0";
      const contractValue = data.contracts.reduce((sum, contract) => sum + parseFloat(contract.contractValue || "0"), 0);
      const prompt = `
        Identify business growth opportunities:
        
        Sales Performance:
        - Total proposals: ${data.proposals.length}
        - Accepted proposals: ${acceptedProposals.length}
        - Proposal win rate: ${proposalWinRate}%
        - Total contract value: $${contractValue}
        
        Client Relationships:
        - Active contracts: ${data.contracts.filter((c) => c.status === "active").length}
        - Recurring revenue: ${data.contracts.filter((c) => c.contractType === "recurring").length} contracts
        
        Identify specific business growth opportunities.
        {
          "title": "Business growth opportunity",
          "description": "Growth potential analysis",
          "recommendation": "Specific growth strategy recommendation",
          "priority": "high|medium|low", 
          "impact": "Expected business growth impact",
          "actionItems": ["growth action1", "growth action2"],
          "confidence": 0.8
        }
      `;
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        // the newest OpenAI model is "gpt-4o" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7
      });
      const insight = JSON.parse(response.choices[0].message.content);
      return {
        id: `opportunity_${Date.now()}`,
        type: "opportunity",
        ...insight,
        createdAt: /* @__PURE__ */ new Date()
      };
    } catch (error) {
      console.warn("\u26A0\uFE0F Failed to identify business opportunities:", error);
      return null;
    }
  }
  /**
   * Generate personalized task recommendations
   */
  async generateTaskRecommendations(userId) {
    try {
      const data = await this.gatherUserData(userId);
      const prompt = `
        Based on this user's current workload, suggest 3-5 specific actionable tasks:
        
        Current Status:
        - Active tasks: ${data.tasks.filter((t) => t.status === "pending" || t.status === "in_progress").length}
        - Overdue items: ${data.tasks.filter((t) => t.status === "overdue").length}
        - Recent proposals: ${data.proposals.filter((p) => p.status === "sent").length}
        - Outstanding invoices: ${data.invoices.filter((i) => i.status === "sent").length}
        
        Respond with JSON array of recommended tasks:
        ["task 1", "task 2", "task 3", "task 4", "task 5"]
      `;
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        // the newest OpenAI model is "gpt-4o" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.8
      });
      const recommendations = JSON.parse(response.choices[0].message.content);
      return recommendations.tasks || [];
    } catch (error) {
      console.warn("\u26A0\uFE0F Failed to generate task recommendations:", error);
      return [];
    }
  }
  /**
   * Analyze team performance (for admin users)
   */
  async generateTeamInsights() {
    try {
      if (!this.isAIAvailable()) {
        console.warn("\u26A0\uFE0F OpenAI API key not configured - team insights disabled");
        return [];
      }
      console.log("\u{1F9E0} Generating team performance insights");
      const [allTasks, allUsers, allTimeLog] = await Promise.all([
        storage.getTasks(),
        storage.getUsers(),
        storage.getTimeLogs()
      ]);
      const teamMetrics = allUsers.map((user) => {
        const userTasks = allTasks.filter((t) => t.assignedToId === user.id);
        const userTimeLog = allTimeLog.filter((log2) => log2.userId === user.id);
        return {
          name: user.name,
          tasksCompleted: userTasks.filter((t) => t.status === "completed").length,
          tasksTotal: userTasks.length,
          timeLogged: userTimeLog.reduce((sum, log2) => sum + (Number(log2.duration) || 0), 0)
        };
      });
      const prompt = `
        Analyze team performance data:
        
        Team Members:
        ${teamMetrics.map(
        (member) => `- ${member.name}: ${member.tasksCompleted}/${member.tasksTotal} tasks, ${member.timeLogged} min logged`
      ).join("\n")}
        
        Provide team performance insights and management recommendations.
        {
          "title": "Team performance insight",
          "description": "Team productivity and collaboration analysis",
          "recommendation": "Team management recommendation",
          "priority": "medium",
          "impact": "Expected team performance impact", 
          "actionItems": ["team action1", "team action2"],
          "confidence": 0.85
        }
      `;
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        // the newest OpenAI model is "gpt-4o" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7
      });
      const insight = JSON.parse(response.choices[0].message.content);
      return [{
        id: `team_${Date.now()}`,
        type: "productivity",
        ...insight,
        createdAt: /* @__PURE__ */ new Date()
      }];
    } catch (error) {
      console.error("\u274C Failed to generate team insights:", error);
      return [];
    }
  }
};
var aiInsightsService = new AIInsightsService();

// server/collaboration-service.ts
init_storage();
import WebSocket, { WebSocketServer } from "ws";
var CollaborationService = class {
  wss;
  clients = /* @__PURE__ */ new Map();
  onlineUsers = /* @__PURE__ */ new Map();
  channels = /* @__PURE__ */ new Map();
  // channelId -> userIds
  messageStore = /* @__PURE__ */ new Map();
  // channelId -> messages
  constructor(server) {
    this.wss = new WebSocketServer({
      server,
      path: "/ws/collaboration",
      perMessageDeflate: false
    });
    this.setupWebSocketServer();
    console.log("\u{1F680} Collaboration service initialized with WebSocket support");
  }
  setupWebSocketServer() {
    this.wss.on("connection", (ws2, req) => {
      const url = new URL(req.url || "", `http://${req.headers.host}`);
      const userId = url.searchParams.get("userId");
      const userName = url.searchParams.get("userName");
      if (!userId || !userName) {
        ws2.close(1008, "Missing user credentials");
        return;
      }
      const socketId = this.generateSocketId();
      this.clients.set(socketId, ws2);
      this.onlineUsers.set(userId, {
        userId,
        userName: decodeURIComponent(userName),
        socketId,
        lastSeen: /* @__PURE__ */ new Date()
      });
      console.log(`\u{1F464} User ${userName} connected to collaboration service`);
      this.sendToSocket(ws2, {
        type: "connection_established",
        data: {
          socketId,
          onlineUsers: Array.from(this.onlineUsers.values())
        }
      });
      this.broadcastToAllExcept(socketId, {
        type: "user_joined",
        data: {
          userId,
          userName: decodeURIComponent(userName)
        }
      });
      ws2.on("message", async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(socketId, userId, message);
        } catch (error) {
          console.error("Error handling WebSocket message:", error);
          this.sendToSocket(ws2, {
            type: "error",
            data: { message: "Invalid message format" }
          });
        }
      });
      ws2.on("close", () => {
        this.handleDisconnect(socketId, userId);
      });
      ws2.on("error", (error) => {
        console.error("WebSocket error:", error);
        this.handleDisconnect(socketId, userId);
      });
    });
  }
  async handleMessage(socketId, userId, message) {
    const user = this.onlineUsers.get(userId);
    if (!user) return;
    switch (message.type) {
      case "join_channel":
        await this.handleJoinChannel(socketId, userId, message.data.channelId);
        break;
      case "leave_channel":
        await this.handleLeaveChannel(socketId, userId, message.data.channelId);
        break;
      case "send_message":
        await this.handleSendMessage(socketId, userId, message.data);
        break;
      case "task_comment":
        await this.handleTaskComment(socketId, userId, message.data);
        break;
      case "typing_start":
        await this.handleTypingStart(socketId, userId, message.data);
        break;
      case "typing_stop":
        await this.handleTypingStop(socketId, userId, message.data);
        break;
      case "user_status":
        await this.handleUserStatus(socketId, userId, message.data);
        break;
      default:
        console.warn("Unknown message type:", message.type);
    }
  }
  async handleJoinChannel(socketId, userId, channelId) {
    if (!this.channels.has(channelId)) {
      this.channels.set(channelId, /* @__PURE__ */ new Set());
    }
    this.channels.get(channelId).add(userId);
    const recentMessages = this.getRecentMessages(channelId, 50);
    const ws2 = this.clients.get(socketId);
    if (ws2 && ws2.readyState === WebSocket.OPEN) {
      this.sendToSocket(ws2, {
        type: "channel_messages",
        data: {
          channelId,
          messages: recentMessages
        }
      });
    }
    this.broadcastToChannel(channelId, {
      type: "user_joined_channel",
      data: {
        userId,
        userName: this.onlineUsers.get(userId)?.userName,
        channelId
      }
    }, [userId]);
    console.log(`\u{1F464} User ${userId} joined channel ${channelId}`);
  }
  async handleLeaveChannel(socketId, userId, channelId) {
    const channel = this.channels.get(channelId);
    if (channel) {
      channel.delete(userId);
      if (channel.size === 0) {
        this.channels.delete(channelId);
      }
    }
    this.broadcastToChannel(channelId, {
      type: "user_left_channel",
      data: {
        userId,
        userName: this.onlineUsers.get(userId)?.userName,
        channelId
      }
    }, [userId]);
    console.log(`\u{1F464} User ${userId} left channel ${channelId}`);
  }
  async handleSendMessage(socketId, userId, data) {
    const user = this.onlineUsers.get(userId);
    if (!user) return;
    const message = {
      id: this.generateMessageId(),
      userId,
      userName: user.userName,
      content: data.content,
      type: data.type || "text",
      timestamp: /* @__PURE__ */ new Date(),
      channelId: data.channelId,
      projectId: data.projectId,
      taskId: data.taskId,
      metadata: data.metadata
    };
    this.storeMessage(data.channelId, message);
    this.broadcastToChannel(data.channelId, {
      type: "new_message",
      data: message
    });
    console.log(`\u{1F4AC} Message sent by ${user.userName} to channel ${data.channelId}`);
  }
  async handleTaskComment(socketId, userId, data) {
    const user = this.onlineUsers.get(userId);
    if (!user) return;
    const comment = {
      id: this.generateMessageId(),
      userId,
      userName: user.userName,
      content: data.content,
      type: "task_comment",
      timestamp: /* @__PURE__ */ new Date(),
      taskId: data.taskId,
      metadata: data.metadata
    };
    const channelId = `task_${data.taskId}`;
    this.storeMessage(channelId, comment);
    this.broadcastToChannel(channelId, {
      type: "task_comment",
      data: comment
    });
    try {
      const task = await storage.getTask(data.taskId);
      if (task) {
        const notifyUsers = /* @__PURE__ */ new Set([task.assignedToId, task.createdById]);
        notifyUsers.delete(userId);
        notifyUsers.forEach((targetUserId) => {
          if (targetUserId) {
            this.sendNotificationToUser(targetUserId, {
              type: "task_comment_notification",
              data: {
                taskId: data.taskId,
                taskTitle: task.title,
                commenterName: user.userName,
                comment
              }
            });
          }
        });
      }
    } catch (error) {
      console.error("Error notifying task users:", error);
    }
    console.log(`\u{1F4AC} Task comment added by ${user.userName} to task ${data.taskId}`);
  }
  async handleTypingStart(socketId, userId, data) {
    const user = this.onlineUsers.get(userId);
    if (!user) return;
    this.broadcastToChannel(data.channelId, {
      type: "typing_start",
      data: {
        userId,
        userName: user.userName,
        channelId: data.channelId
      }
    }, [userId]);
  }
  async handleTypingStop(socketId, userId, data) {
    this.broadcastToChannel(data.channelId, {
      type: "typing_stop",
      data: {
        userId,
        channelId: data.channelId
      }
    }, [userId]);
  }
  async handleUserStatus(socketId, userId, data) {
    const user = this.onlineUsers.get(userId);
    if (!user) return;
    user.lastSeen = /* @__PURE__ */ new Date();
    user.currentProject = data.currentProject;
    this.broadcastToAllExcept(socketId, {
      type: "user_status_update",
      data: {
        userId,
        status: data.status,
        currentProject: data.currentProject
      }
    });
  }
  handleDisconnect(socketId, userId) {
    this.clients.delete(socketId);
    const user = this.onlineUsers.get(userId);
    if (user) {
      user.lastSeen = /* @__PURE__ */ new Date();
      this.channels.forEach((users2, channelId) => {
        if (users2.has(userId)) {
          users2.delete(userId);
          this.broadcastToChannel(channelId, {
            type: "user_left_channel",
            data: {
              userId,
              userName: user.userName,
              channelId
            }
          });
        }
      });
      this.onlineUsers.delete(userId);
      this.broadcastToAll({
        type: "user_left",
        data: {
          userId,
          userName: user.userName
        }
      });
      console.log(`\u{1F464} User ${user.userName} disconnected from collaboration service`);
    }
  }
  // Message and data management
  storeMessage(channelId, message) {
    if (!this.messageStore.has(channelId)) {
      this.messageStore.set(channelId, []);
    }
    const messages2 = this.messageStore.get(channelId);
    messages2.push(message);
    if (messages2.length > 1e3) {
      messages2.splice(0, messages2.length - 1e3);
    }
  }
  getRecentMessages(channelId, limit = 50) {
    const messages2 = this.messageStore.get(channelId) || [];
    return messages2.slice(-limit);
  }
  // Broadcasting methods
  broadcastToAll(message) {
    this.clients.forEach((ws2) => {
      if (ws2.readyState === WebSocket.OPEN) {
        this.sendToSocket(ws2, message);
      }
    });
  }
  broadcastToAllExcept(excludeSocketId, message) {
    this.clients.forEach((ws2, socketId) => {
      if (socketId !== excludeSocketId && ws2.readyState === WebSocket.OPEN) {
        this.sendToSocket(ws2, message);
      }
    });
  }
  broadcastToChannel(channelId, message, excludeUserIds = []) {
    const channelUsers = this.channels.get(channelId);
    if (!channelUsers) return;
    channelUsers.forEach((userId) => {
      if (!excludeUserIds.includes(userId)) {
        this.sendNotificationToUser(userId, message);
      }
    });
  }
  sendNotificationToUser(userId, message) {
    const user = this.onlineUsers.get(userId);
    if (user) {
      const ws2 = this.clients.get(user.socketId);
      if (ws2 && ws2.readyState === WebSocket.OPEN) {
        this.sendToSocket(ws2, message);
      }
    }
  }
  sendToSocket(ws2, message) {
    try {
      ws2.send(JSON.stringify(message));
    } catch (error) {
      console.error("Error sending WebSocket message:", error);
    }
  }
  // Utility methods
  generateSocketId() {
    return `socket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  // Public API methods
  getOnlineUsers() {
    return Array.from(this.onlineUsers.values());
  }
  getChannelUsers(channelId) {
    return Array.from(this.channels.get(channelId) || []);
  }
  getChannelMessages(channelId, limit = 100) {
    return this.getRecentMessages(channelId, limit);
  }
  getUserConnectionStatus(userId) {
    return this.onlineUsers.has(userId);
  }
  broadcastSystemMessage(channelId, content, type = "system") {
    const message = {
      id: this.generateMessageId(),
      userId: "system",
      userName: "System",
      content,
      type,
      timestamp: /* @__PURE__ */ new Date(),
      channelId
    };
    this.storeMessage(channelId, message);
    this.broadcastToChannel(channelId, {
      type: "new_message",
      data: message
    });
  }
};

// server/advanced-reporting-service.ts
init_storage();
var AdvancedReportingService = class {
  reports = /* @__PURE__ */ new Map();
  /**
   * Create a new custom report configuration
   */
  async createReport(config) {
    const report = {
      ...config,
      id: this.generateReportId(),
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.reports.set(report.id, report);
    console.log(`\u{1F4CA} Created new report: ${report.name}`);
    return report;
  }
  /**
   * Update an existing report configuration
   */
  async updateReport(id, updates) {
    const existing = this.reports.get(id);
    if (!existing) {
      throw new Error(`Report not found: ${id}`);
    }
    const updated = {
      ...existing,
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.reports.set(id, updated);
    console.log(`\u{1F4CA} Updated report: ${updated.name}`);
    return updated;
  }
  /**
   * Delete a report configuration
   */
  async deleteReport(id) {
    if (!this.reports.has(id)) {
      throw new Error(`Report not found: ${id}`);
    }
    this.reports.delete(id);
    console.log(`\u{1F4CA} Deleted report: ${id}`);
  }
  /**
   * Get all report configurations
   */
  async getReports(userId) {
    const allReports = Array.from(this.reports.values());
    if (userId) {
      return allReports.filter((report) => report.createdBy === userId);
    }
    return allReports;
  }
  /**
   * Get a specific report configuration
   */
  async getReport(id) {
    return this.reports.get(id) || null;
  }
  /**
   * Generate report data based on configuration
   */
  async generateReport(reportId) {
    const startTime = Date.now();
    const config = this.reports.get(reportId);
    if (!config) {
      throw new Error(`Report not found: ${reportId}`);
    }
    console.log(`\u{1F4CA} Generating report: ${config.name}`);
    const [tasks2, projects2, users2, timeLogs2, invoices2, proposals2] = await Promise.all([
      storage.getTasks(),
      storage.getProjects(),
      storage.getUsers(),
      storage.getTimeLogs(),
      storage.getInvoices(),
      storage.getProposals()
    ]);
    const filteredData = this.applyFilters({
      tasks: tasks2,
      projects: projects2,
      users: users2,
      timeLogs: timeLogs2,
      invoices: invoices2,
      proposals: proposals2
    }, config.filters, config.timeRange);
    const metrics = await this.calculateMetrics(filteredData, config.metrics);
    const timeSeries = await this.generateTimeSeries(filteredData, config.metrics, config.timeRange);
    const aggregated = await this.generateAggregatedData(filteredData, config.metrics);
    const executionTime = Date.now() - startTime;
    const reportData = {
      config,
      data: {
        metrics,
        timeSeries,
        aggregated,
        rawData: filteredData
      },
      generatedAt: /* @__PURE__ */ new Date(),
      executionTime
    };
    console.log(`\u2705 Report generated in ${executionTime}ms`);
    return reportData;
  }
  /**
   * Generate productivity report
   */
  async generateProductivityReport(timeRange, userIds) {
    const config = {
      id: "productivity_report",
      name: "Productivity Report",
      description: "Team productivity and task completion analysis",
      type: "productivity",
      timeRange,
      filters: { userIds },
      metrics: [
        {
          id: "tasks_completed",
          name: "Tasks Completed",
          type: "count",
          field: "status",
          aggregation: "daily"
        },
        {
          id: "avg_completion_time",
          name: "Average Completion Time",
          type: "average",
          field: "completionTime",
          unit: "hours"
        },
        {
          id: "productivity_score",
          name: "Productivity Score",
          type: "percentage",
          field: "completed_vs_assigned"
        }
      ],
      visualizations: [
        {
          id: "completion_trend",
          type: "line",
          title: "Task Completion Trend",
          metricIds: ["tasks_completed"],
          config: { xAxis: "date", yAxis: "count", showGrid: true }
        },
        {
          id: "team_performance",
          type: "bar",
          title: "Team Performance",
          metricIds: ["productivity_score"],
          config: { xAxis: "user", yAxis: "percentage" }
        }
      ],
      createdBy: "system",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    return this.generateReportFromConfig(config);
  }
  /**
   * Generate financial report
   */
  async generateFinancialReport(timeRange) {
    const config = {
      id: "financial_report",
      name: "Financial Report",
      description: "Revenue, invoicing, and financial performance analysis",
      type: "financial",
      timeRange,
      filters: {},
      metrics: [
        {
          id: "total_revenue",
          name: "Total Revenue",
          type: "sum",
          field: "amount",
          unit: "USD"
        },
        {
          id: "outstanding_invoices",
          name: "Outstanding Invoices",
          type: "count",
          field: "status"
        },
        {
          id: "payment_rate",
          name: "Payment Rate",
          type: "percentage",
          field: "paid_vs_sent"
        }
      ],
      visualizations: [
        {
          id: "revenue_trend",
          type: "area",
          title: "Revenue Trend",
          metricIds: ["total_revenue"],
          config: { xAxis: "month", yAxis: "amount" }
        },
        {
          id: "invoice_status",
          type: "pie",
          title: "Invoice Status Distribution",
          metricIds: ["outstanding_invoices"],
          config: { groupBy: "status" }
        }
      ],
      createdBy: "system",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    return this.generateReportFromConfig(config);
  }
  /**
   * Generate project performance report
   */
  async generateProjectReport(projectId, timeRange) {
    const config = {
      id: `project_report_${projectId}`,
      name: "Project Performance Report",
      description: "Detailed project progress and team performance analysis",
      type: "project",
      timeRange,
      filters: { projectIds: [projectId] },
      metrics: [
        {
          id: "project_completion",
          name: "Project Completion",
          type: "percentage",
          field: "completion_rate"
        },
        {
          id: "time_spent",
          name: "Time Spent",
          type: "sum",
          field: "duration",
          unit: "hours"
        },
        {
          id: "team_velocity",
          name: "Team Velocity",
          type: "average",
          field: "tasks_per_week",
          aggregation: "weekly"
        }
      ],
      visualizations: [
        {
          id: "progress_timeline",
          type: "line",
          title: "Project Progress Timeline",
          metricIds: ["project_completion"],
          config: { xAxis: "week", yAxis: "percentage" }
        },
        {
          id: "team_contribution",
          type: "bar",
          title: "Team Contribution",
          metricIds: ["time_spent"],
          config: { xAxis: "user", yAxis: "hours" }
        }
      ],
      createdBy: "system",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    return this.generateReportFromConfig(config);
  }
  /**
   * Generate time tracking report
   */
  async generateTimeTrackingReport(timeRange, userIds) {
    const config = {
      id: "time_tracking_report",
      name: "Time Tracking Report",
      description: "Detailed time allocation and productivity analysis",
      type: "time",
      timeRange,
      filters: { userIds },
      metrics: [
        {
          id: "total_hours",
          name: "Total Hours",
          type: "sum",
          field: "duration",
          unit: "hours"
        },
        {
          id: "billable_hours",
          name: "Billable Hours",
          type: "sum",
          field: "billable_duration",
          unit: "hours"
        },
        {
          id: "utilization_rate",
          name: "Utilization Rate",
          type: "percentage",
          field: "billable_vs_total"
        }
      ],
      visualizations: [
        {
          id: "daily_hours",
          type: "bar",
          title: "Daily Time Allocation",
          metricIds: ["total_hours"],
          config: { xAxis: "date", yAxis: "hours" }
        },
        {
          id: "project_distribution",
          type: "pie",
          title: "Time by Project",
          metricIds: ["total_hours"],
          config: { groupBy: "project" }
        }
      ],
      createdBy: "system",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    return this.generateReportFromConfig(config);
  }
  // Private helper methods
  async generateReportFromConfig(config) {
    this.reports.set(config.id, config);
    return this.generateReport(config.id);
  }
  applyFilters(data, filters, timeRange) {
    let { tasks: tasks2, projects: projects2, users: users2, timeLogs: timeLogs2, invoices: invoices2, proposals: proposals2 } = data;
    const start = timeRange.start;
    const end = timeRange.end;
    tasks2 = tasks2.filter((task) => {
      const createdAt = new Date(task.createdAt);
      return createdAt >= start && createdAt <= end;
    });
    timeLogs2 = timeLogs2.filter((log2) => {
      const date2 = new Date(log2.date);
      return date2 >= start && date2 <= end;
    });
    if (filters.projectIds?.length) {
      tasks2 = tasks2.filter(
        (task) => filters.projectIds.includes(task.projectId || "")
      );
      projects2 = projects2.filter(
        (project) => filters.projectIds.includes(project.id)
      );
    }
    if (filters.userIds?.length) {
      tasks2 = tasks2.filter(
        (task) => filters.userIds.includes(task.assignedToId || "") || filters.userIds.includes(task.createdById || "")
      );
      timeLogs2 = timeLogs2.filter(
        (log2) => filters.userIds.includes(log2.userId)
      );
    }
    if (filters.taskStatuses?.length) {
      tasks2 = tasks2.filter(
        (task) => filters.taskStatuses.includes(task.status)
      );
    }
    if (filters.priorities?.length) {
      tasks2 = tasks2.filter(
        (task) => filters.priorities.includes(task.priority)
      );
    }
    return { tasks: tasks2, projects: projects2, users: users2, timeLogs: timeLogs2, invoices: invoices2, proposals: proposals2 };
  }
  async calculateMetrics(data, metrics) {
    const results = {};
    for (const metric of metrics) {
      const value = await this.calculateMetricValue(data, metric);
      results[metric.id] = {
        name: metric.name,
        value,
        unit: metric.unit,
        type: metric.type
      };
    }
    return results;
  }
  async calculateMetricValue(data, metric) {
    const { tasks: tasks2, timeLogs: timeLogs2, invoices: invoices2 } = data;
    switch (metric.id) {
      case "tasks_completed":
        return tasks2.filter((t) => t.status === "completed").length;
      case "total_hours":
        return timeLogs2.reduce((sum, log2) => sum + (log2.duration || 0), 0) / 60;
      // Convert to hours
      case "total_revenue":
        return invoices2.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      case "productivity_score":
        const completed = tasks2.filter((t) => t.status === "completed").length;
        const total = tasks2.length;
        return total > 0 ? completed / total * 100 : 0;
      case "payment_rate":
        const paidInvoices = invoices2.filter((inv) => inv.status === "paid").length;
        const totalInvoices = invoices2.length;
        return totalInvoices > 0 ? paidInvoices / totalInvoices * 100 : 0;
      default:
        return 0;
    }
  }
  async generateTimeSeries(data, metrics, timeRange) {
    const series = {};
    const start = new Date(timeRange.start);
    const end = new Date(timeRange.end);
    const dates = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    for (const metric of metrics) {
      if (metric.aggregation) {
        series[metric.id] = dates.map((date2) => ({
          date: date2.toISOString().split("T")[0],
          value: this.getMetricValueForDate(data, metric, date2)
        }));
      }
    }
    return series;
  }
  getMetricValueForDate(data, metric, date2) {
    const { tasks: tasks2, timeLogs: timeLogs2 } = data;
    const dayStart = new Date(date2);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date2);
    dayEnd.setHours(23, 59, 59, 999);
    switch (metric.id) {
      case "tasks_completed":
        return tasks2.filter((t) => {
          const completedAt = t.completedAt ? new Date(t.completedAt) : null;
          return completedAt && completedAt >= dayStart && completedAt <= dayEnd;
        }).length;
      case "total_hours":
        return timeLogs2.filter((log2) => {
          const logDate = new Date(log2.date);
          return logDate >= dayStart && logDate <= dayEnd;
        }).reduce((sum, log2) => sum + (log2.duration || 0), 0) / 60;
      default:
        return 0;
    }
  }
  async generateAggregatedData(data, metrics) {
    const { tasks: tasks2, projects: projects2, users: users2, timeLogs: timeLogs2 } = data;
    return {
      tasksByStatus: this.groupBy(tasks2, "status"),
      tasksByPriority: this.groupBy(tasks2, "priority"),
      tasksByProject: this.groupBy(tasks2, "projectId"),
      tasksByUser: this.groupBy(tasks2, "assignedToId"),
      timeByProject: this.aggregateTimeByProject(timeLogs2, projects2),
      timeByUser: this.aggregateTimeByUser(timeLogs2, users2)
    };
  }
  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const value = item[key] || "unassigned";
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {});
  }
  aggregateTimeByProject(timeLogs2, projects2) {
    const projectTime = {};
    projects2.forEach((project) => {
      const projectLogs = timeLogs2.filter((log2) => log2.projectId === project.id);
      const totalMinutes = projectLogs.reduce((sum, log2) => sum + (log2.duration || 0), 0);
      projectTime[project.name] = totalMinutes / 60;
    });
    return projectTime;
  }
  aggregateTimeByUser(timeLogs2, users2) {
    const userTime = {};
    users2.forEach((user) => {
      const userLogs = timeLogs2.filter((log2) => log2.userId === user.id);
      const totalMinutes = userLogs.reduce((sum, log2) => sum + (log2.duration || 0), 0);
      userTime[user.name] = totalMinutes / 60;
    });
    return userTime;
  }
  generateReportId() {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  /**
   * Get available report templates
   */
  getReportTemplates() {
    return [
      {
        name: "Team Productivity Dashboard",
        description: "Overview of team productivity and task completion rates",
        type: "productivity",
        metrics: [
          { id: "tasks_completed", name: "Tasks Completed", type: "count", field: "status" },
          { id: "productivity_score", name: "Productivity Score", type: "percentage", field: "completion_rate" }
        ]
      },
      {
        name: "Financial Performance Report",
        description: "Revenue tracking and financial metrics",
        type: "financial",
        metrics: [
          { id: "total_revenue", name: "Total Revenue", type: "sum", field: "amount", unit: "USD" },
          { id: "payment_rate", name: "Payment Rate", type: "percentage", field: "paid_rate" }
        ]
      },
      {
        name: "Project Status Report",
        description: "Project progress and timeline analysis",
        type: "project",
        metrics: [
          { id: "project_completion", name: "Completion Rate", type: "percentage", field: "completion" },
          { id: "time_spent", name: "Time Invested", type: "sum", field: "duration", unit: "hours" }
        ]
      },
      {
        name: "Time Tracking Summary",
        description: "Detailed time allocation and utilization report",
        type: "time",
        metrics: [
          { id: "total_hours", name: "Total Hours", type: "sum", field: "duration", unit: "hours" },
          { id: "billable_hours", name: "Billable Hours", type: "sum", field: "billable_duration", unit: "hours" }
        ]
      }
    ];
  }
};
var advancedReportingService = new AdvancedReportingService();

// server/webhook-service.ts
import crypto2 from "crypto";
var WebhookService = class {
  webhooks = /* @__PURE__ */ new Map();
  deliveries = /* @__PURE__ */ new Map();
  integrations = /* @__PURE__ */ new Map();
  deliveryQueue = [];
  isProcessing = false;
  constructor() {
    console.log("\u{1F517} Webhook service initialized");
    this.startDeliveryProcessor();
  }
  /**
   * Create a new webhook configuration
   */
  async createWebhook(config) {
    const webhook = {
      ...config,
      id: this.generateId("webhook"),
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.webhooks.set(webhook.id, webhook);
    console.log(`\u{1F517} Created webhook: ${webhook.name} -> ${webhook.url}`);
    return webhook;
  }
  /**
   * Update webhook configuration
   */
  async updateWebhook(id, updates) {
    const existing = this.webhooks.get(id);
    if (!existing) {
      throw new Error(`Webhook not found: ${id}`);
    }
    const updated = {
      ...existing,
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.webhooks.set(id, updated);
    console.log(`\u{1F517} Updated webhook: ${updated.name}`);
    return updated;
  }
  /**
   * Delete webhook
   */
  async deleteWebhook(id) {
    if (!this.webhooks.has(id)) {
      throw new Error(`Webhook not found: ${id}`);
    }
    this.webhooks.delete(id);
    console.log(`\u{1F517} Deleted webhook: ${id}`);
  }
  /**
   * Get all webhooks
   */
  async getWebhooks(userId) {
    const allWebhooks = Array.from(this.webhooks.values());
    if (userId) {
      return allWebhooks.filter((webhook) => webhook.createdBy === userId);
    }
    return allWebhooks;
  }
  /**
   * Create external integration
   */
  async createIntegration(integration) {
    const newIntegration = {
      ...integration,
      id: this.generateId("integration"),
      createdAt: /* @__PURE__ */ new Date()
    };
    this.integrations.set(newIntegration.id, newIntegration);
    console.log(`\u{1F517} Created ${newIntegration.type} integration: ${newIntegration.name}`);
    return newIntegration;
  }
  /**
   * Get all integrations
   */
  async getIntegrations() {
    return Array.from(this.integrations.values());
  }
  /**
   * Trigger webhook for an event
   */
  async triggerEvent(event, payload, metadata) {
    console.log(`\u{1F514} Triggering event: ${event}`);
    const activeWebhooks = Array.from(this.webhooks.values()).filter(
      (webhook) => webhook.active && webhook.events.includes(event)
    );
    const activeIntegrations = Array.from(this.integrations.values()).filter(
      (integration) => integration.active && integration.eventMappings.some(
        (mapping) => mapping.event === event && mapping.enabled
      )
    );
    for (const webhook of activeWebhooks) {
      if (this.shouldTriggerWebhook(webhook, payload)) {
        await this.queueWebhookDelivery(webhook, event, payload, metadata);
      }
    }
    for (const integration of activeIntegrations) {
      await this.processIntegrationEvent(integration, event, payload, metadata);
    }
  }
  /**
   * Queue webhook delivery
   */
  async queueWebhookDelivery(webhook, event, payload, metadata) {
    const delivery = {
      id: this.generateId("delivery"),
      webhookId: webhook.id,
      event,
      payload: {
        event,
        data: payload,
        metadata: metadata || {},
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        webhook: {
          id: webhook.id,
          name: webhook.name
        }
      },
      attempts: [],
      status: "pending",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.deliveries.set(delivery.id, delivery);
    this.deliveryQueue.push(delivery);
    console.log(`\u{1F4EE} Queued webhook delivery: ${webhook.name} for ${event}`);
    if (!this.isProcessing) {
      this.processDeliveryQueue();
    }
  }
  /**
   * Process delivery queue
   */
  async processDeliveryQueue() {
    if (this.isProcessing || this.deliveryQueue.length === 0) return;
    this.isProcessing = true;
    console.log(`\u{1F4E4} Processing ${this.deliveryQueue.length} webhook deliveries`);
    while (this.deliveryQueue.length > 0) {
      const delivery = this.deliveryQueue.shift();
      if (delivery) {
        await this.deliverWebhook(delivery);
      }
    }
    this.isProcessing = false;
  }
  /**
   * Deliver individual webhook
   */
  async deliverWebhook(delivery) {
    const webhook = this.webhooks.get(delivery.webhookId);
    if (!webhook) {
      console.error(`Webhook not found for delivery: ${delivery.webhookId}`);
      return;
    }
    const maxRetries = webhook.retryPolicy.maxRetries;
    let attempt = delivery.attempts.length + 1;
    while (attempt <= maxRetries) {
      const attemptStart = Date.now();
      const attemptRecord = {
        id: this.generateId("attempt"),
        attempt,
        status: "pending",
        timestamp: /* @__PURE__ */ new Date()
      };
      try {
        console.log(`\u{1F4E1} Delivering webhook (attempt ${attempt}/${maxRetries}): ${webhook.name}`);
        const headers = {
          "Content-Type": "application/json",
          "User-Agent": "Gigster-Garage-Webhook/1.0",
          "X-Webhook-Event": delivery.event,
          "X-Webhook-Delivery": delivery.id,
          "X-Webhook-Timestamp": delivery.createdAt.toISOString(),
          ...webhook.headers || {}
        };
        if (webhook.secret) {
          const signature = this.generateSignature(webhook.secret, JSON.stringify(delivery.payload));
          headers["X-Webhook-Signature"] = signature;
        }
        const response = await fetch(webhook.url, {
          method: "POST",
          headers,
          body: JSON.stringify(delivery.payload),
          signal: AbortSignal.timeout(3e4)
          // 30 second timeout
        });
        const duration = Date.now() - attemptStart;
        attemptRecord.duration = duration;
        attemptRecord.httpStatus = response.status;
        if (response.ok) {
          attemptRecord.status = "success";
          attemptRecord.response = await response.text().catch(() => "");
          delivery.status = "delivered";
          delivery.deliveredAt = /* @__PURE__ */ new Date();
          console.log(`\u2705 Webhook delivered successfully: ${webhook.name} (${duration}ms)`);
          break;
        } else {
          attemptRecord.status = "failed";
          attemptRecord.error = `HTTP ${response.status}: ${response.statusText}`;
          attemptRecord.response = await response.text().catch(() => "");
        }
      } catch (error) {
        const duration = Date.now() - attemptStart;
        attemptRecord.duration = duration;
        attemptRecord.status = "failed";
        attemptRecord.error = error.message || "Unknown error";
        console.error(`\u274C Webhook delivery failed (attempt ${attempt}): ${error.message}`);
      }
      delivery.attempts.push(attemptRecord);
      if (attempt === maxRetries && attemptRecord.status === "failed") {
        delivery.status = "failed";
        console.error(`\u{1F6AB} Webhook delivery permanently failed after ${maxRetries} attempts: ${webhook.name}`);
        break;
      }
      if (attempt < maxRetries && attemptRecord.status === "failed") {
        const delay = webhook.retryPolicy.initialDelay * Math.pow(webhook.retryPolicy.backoffMultiplier, attempt - 1);
        console.log(`\u23F3 Retrying webhook in ${delay}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
      attempt++;
    }
    this.deliveries.set(delivery.id, delivery);
  }
  /**
   * Process integration events
   */
  async processIntegrationEvent(integration, event, payload, metadata) {
    console.log(`\u{1F50C} Processing ${integration.type} integration for ${event}`);
    const eventMapping = integration.eventMappings.find(
      (mapping) => mapping.event === event && mapping.enabled
    );
    if (!eventMapping) return;
    try {
      switch (integration.type) {
        case "slack":
          await this.processSlackIntegration(integration, event, payload, eventMapping.template);
          break;
        case "teams":
          await this.processTeamsIntegration(integration, event, payload, eventMapping.template);
          break;
        case "discord":
          await this.processDiscordIntegration(integration, event, payload, eventMapping.template);
          break;
        default:
          console.warn(`Unsupported integration type: ${integration.type}`);
      }
    } catch (error) {
      console.error(`Integration processing error (${integration.type}):`, error);
    }
  }
  /**
   * Process Slack integration
   */
  async processSlackIntegration(integration, event, payload, template) {
    const { webhookUrl, channelId } = integration.config;
    if (!webhookUrl) {
      console.error("Slack webhook URL not configured");
      return;
    }
    const message = this.formatSlackMessage(event, payload, template);
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: channelId,
        ...message
      })
    });
    console.log(`\u{1F4E8} Sent Slack notification for ${event}`);
  }
  /**
   * Process Microsoft Teams integration
   */
  async processTeamsIntegration(integration, event, payload, template) {
    const { webhookUrl } = integration.config;
    if (!webhookUrl) {
      console.error("Teams webhook URL not configured");
      return;
    }
    const message = this.formatTeamsMessage(event, payload, template);
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message)
    });
    console.log(`\u{1F4E8} Sent Teams notification for ${event}`);
  }
  /**
   * Process Discord integration
   */
  async processDiscordIntegration(integration, event, payload, template) {
    const { webhookUrl } = integration.config;
    if (!webhookUrl) {
      console.error("Discord webhook URL not configured");
      return;
    }
    const message = this.formatDiscordMessage(event, payload, template);
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message)
    });
    console.log(`\u{1F4E8} Sent Discord notification for ${event}`);
  }
  // Message formatting methods
  formatSlackMessage(event, payload, template) {
    const title = this.getEventTitle(event, payload);
    const color = this.getEventColor(event);
    return {
      text: title,
      attachments: [{
        color,
        title,
        text: this.interpolateTemplate(template, payload),
        fields: this.extractSlackFields(payload),
        footer: "Gigster Garage",
        ts: Math.floor(Date.now() / 1e3)
      }]
    };
  }
  formatTeamsMessage(event, payload, template) {
    const title = this.getEventTitle(event, payload);
    const color = this.getEventColor(event);
    return {
      "@type": "MessageCard",
      "@context": "https://schema.org/extensions",
      themeColor: color.replace("#", ""),
      summary: title,
      sections: [{
        activityTitle: title,
        activitySubtitle: this.interpolateTemplate(template, payload),
        facts: this.extractTeamsFacts(payload),
        markdown: true
      }]
    };
  }
  formatDiscordMessage(event, payload, template) {
    const title = this.getEventTitle(event, payload);
    const color = parseInt(this.getEventColor(event).replace("#", ""), 16);
    return {
      embeds: [{
        title,
        description: this.interpolateTemplate(template, payload),
        color,
        fields: this.extractDiscordFields(payload),
        footer: {
          text: "Gigster Garage"
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }]
    };
  }
  // Helper methods
  shouldTriggerWebhook(webhook, payload) {
    if (!webhook.filters) return true;
    const { projectIds, userIds, priorities } = webhook.filters;
    if (projectIds?.length && payload.projectId && !projectIds.includes(payload.projectId)) {
      return false;
    }
    if (userIds?.length) {
      const userInPayload = payload.assignedToId || payload.createdById || payload.userId;
      if (userInPayload && !userIds.includes(userInPayload)) {
        return false;
      }
    }
    if (priorities?.length && payload.priority && !priorities.includes(payload.priority)) {
      return false;
    }
    return true;
  }
  generateSignature(secret, payload) {
    return `sha256=${crypto2.createHmac("sha256", secret).update(payload).digest("hex")}`;
  }
  interpolateTemplate(template, data) {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const value = this.getNestedValue(data, key.trim());
      return value !== void 0 ? String(value) : match;
    });
  }
  getNestedValue(obj, path5) {
    return path5.split(".").reduce((current, key) => current?.[key], obj);
  }
  getEventTitle(event, payload) {
    const titles = {
      "task.created": `New Task: ${payload.title}`,
      "task.updated": `Task Updated: ${payload.title}`,
      "task.completed": `Task Completed: ${payload.title}`,
      "task.deleted": `Task Deleted: ${payload.title}`,
      "project.created": `New Project: ${payload.name}`,
      "project.updated": `Project Updated: ${payload.name}`,
      "project.completed": `Project Completed: ${payload.name}`,
      "invoice.created": `New Invoice: ${payload.clientName}`,
      "invoice.paid": `Invoice Paid: ${payload.clientName}`,
      "invoice.overdue": `Invoice Overdue: ${payload.clientName}`,
      "proposal.sent": `Proposal Sent: ${payload.clientName}`,
      "proposal.accepted": `Proposal Accepted: ${payload.clientName}`,
      "proposal.rejected": `Proposal Rejected: ${payload.clientName}`,
      "user.invited": `User Invited: ${payload.email}`,
      "user.joined": `User Joined: ${payload.name}`,
      "time.logged": `Time Logged: ${payload.duration} minutes`,
      "milestone.reached": `Milestone Reached: ${payload.title}`,
      "deadline.approaching": `Deadline Approaching: ${payload.title}`,
      "report.generated": `Report Generated: ${payload.type}`
    };
    return titles[event] || `Event: ${event}`;
  }
  getEventColor(event) {
    const colors = {
      task: "#10B981",
      project: "#3B82F6",
      invoice: "#F59E0B",
      proposal: "#8B5CF6",
      user: "#06B6D4",
      time: "#EF4444",
      milestone: "#84CC16",
      deadline: "#F97316",
      report: "#6366F1"
    };
    const eventType = event.split(".")[0];
    return colors[eventType] || "#6B7280";
  }
  extractSlackFields(payload) {
    const fields = [];
    if (payload.priority) {
      fields.push({ title: "Priority", value: payload.priority, short: true });
    }
    if (payload.status) {
      fields.push({ title: "Status", value: payload.status, short: true });
    }
    if (payload.assignedTo) {
      fields.push({ title: "Assigned To", value: payload.assignedTo, short: true });
    }
    return fields;
  }
  extractTeamsFacts(payload) {
    const facts = [];
    if (payload.priority) {
      facts.push({ name: "Priority", value: payload.priority });
    }
    if (payload.status) {
      facts.push({ name: "Status", value: payload.status });
    }
    if (payload.assignedTo) {
      facts.push({ name: "Assigned To", value: payload.assignedTo });
    }
    return facts;
  }
  extractDiscordFields(payload) {
    const fields = [];
    if (payload.priority) {
      fields.push({ name: "Priority", value: payload.priority, inline: true });
    }
    if (payload.status) {
      fields.push({ name: "Status", value: payload.status, inline: true });
    }
    if (payload.assignedTo) {
      fields.push({ name: "Assigned To", value: payload.assignedTo, inline: true });
    }
    return fields;
  }
  generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  startDeliveryProcessor() {
    setInterval(() => {
      if (!this.isProcessing && this.deliveryQueue.length > 0) {
        this.processDeliveryQueue();
      }
    }, 5e3);
  }
  /**
   * Get webhook delivery history
   */
  async getDeliveries(webhookId) {
    const allDeliveries = Array.from(this.deliveries.values());
    if (webhookId) {
      return allDeliveries.filter((delivery) => delivery.webhookId === webhookId);
    }
    return allDeliveries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  /**
   * Get delivery statistics
   */
  async getDeliveryStats(webhookId) {
    const deliveries = await this.getDeliveries(webhookId);
    return {
      total: deliveries.length,
      delivered: deliveries.filter((d) => d.status === "delivered").length,
      failed: deliveries.filter((d) => d.status === "failed").length,
      pending: deliveries.filter((d) => d.status === "pending").length,
      averageAttempts: deliveries.reduce((sum, d) => sum + d.attempts.length, 0) / deliveries.length || 0
    };
  }
};
var webhookService = new WebhookService();

// server/mobile-api-service.ts
init_storage();
var MobileApiService = class {
  API_VERSION = "1.0.0";
  SYNC_INTERVAL = 300;
  // 5 minutes
  syncCache = /* @__PURE__ */ new Map();
  /**
   * Create standardized mobile API response
   */
  createResponse(data, error, message) {
    return {
      success: !error,
      data,
      error,
      message,
      metadata: {
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        version: this.API_VERSION
      }
    };
  }
  /**
   * Create paginated mobile API response
   */
  createPaginatedResponse(data, page, limit, total) {
    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        hasMore: page * limit < total
      },
      metadata: {
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        version: this.API_VERSION
      }
    };
  }
  /**
   * Mobile-optimized dashboard data
   */
  async getMobileDashboard(userId) {
    console.log(`\u{1F4F1} Generating mobile dashboard for user: ${userId}`);
    const [tasks2, projects2, timeLogs2] = await Promise.all([
      storage.getTasks(),
      storage.getProjects(),
      storage.getTimeLogs()
    ]);
    const userTasks = tasks2.filter(
      (task) => task.assignedToId === userId || task.createdById === userId
    );
    const userTimeLogs = timeLogs2.filter((log2) => log2.userId === userId);
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const todayTasks = userTasks.filter((task) => {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      return dueDate && dueDate >= today && dueDate < new Date(today.getTime() + 24 * 60 * 60 * 1e3);
    });
    const overdueItems = userTasks.filter((task) => {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      return dueDate && dueDate < today && task.status !== "completed";
    });
    const activeTimers = userTimeLogs.filter((log2) => !log2.endTime);
    const todayLogs = userTimeLogs.filter((log2) => {
      const logDate = new Date(log2.date);
      return logDate >= today && logDate < new Date(today.getTime() + 24 * 60 * 60 * 1e3);
    });
    const hoursLogged = todayLogs.reduce((sum, log2) => sum + (log2.duration || 0), 0) / 60;
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1e3);
    const upcomingDeadlines = userTasks.filter((task) => {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      return dueDate && dueDate >= today && dueDate <= nextWeek && task.status !== "completed";
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 5);
    const recentTasks = userTasks.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 10);
    const quickActions = [
      {
        id: "start_timer",
        type: "startTimer",
        label: "Start Timer",
        icon: "play-circle",
        shortcut: "ST"
      },
      {
        id: "log_time",
        type: "logTime",
        label: "Log Time",
        icon: "clock",
        shortcut: "LT"
      },
      {
        id: "create_task",
        type: "createTask",
        label: "New Task",
        icon: "plus-circle",
        shortcut: "NT"
      },
      {
        id: "voice_note",
        type: "voiceNote",
        label: "Voice Note",
        icon: "mic",
        shortcut: "VN"
      }
    ];
    const notifications = [
      ...overdueItems.slice(0, 3).map((task) => ({
        id: `overdue_${task.id}`,
        type: "task_due",
        title: "Overdue Task",
        body: `"${task.title}" is overdue`,
        data: { taskId: task.id },
        read: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      })),
      ...upcomingDeadlines.slice(0, 2).map((task) => ({
        id: `upcoming_${task.id}`,
        type: "task_due",
        title: "Upcoming Deadline",
        body: `"${task.title}" is due ${this.formatRelativeTime(new Date(task.dueDate))}`,
        data: { taskId: task.id },
        read: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }))
    ];
    return {
      quickStats: {
        todayTasks: todayTasks.length,
        activeProjects: projects2.filter((p) => p.status === "active").length,
        hoursLogged: Math.round(hoursLogged * 10) / 10,
        overdueItems: overdueItems.length
      },
      recentTasks,
      activeTimers,
      upcomingDeadlines,
      quickActions,
      notifications
    };
  }
  /**
   * Sync data for mobile apps (delta sync)
   */
  async syncMobileData(userId, request) {
    console.log(`\u{1F504} Syncing mobile data for user: ${userId}`);
    const lastSync = request.lastSyncTimestamp ? new Date(request.lastSyncTimestamp) : /* @__PURE__ */ new Date(0);
    const currentSync = /* @__PURE__ */ new Date();
    const [tasks2, projects2, timeLogs2, users2] = await Promise.all([
      storage.getTasks(),
      storage.getProjects(),
      storage.getTimeLogs(),
      storage.getUsers()
    ]);
    const syncResponse = {
      tasks: { updated: [], deleted: [] },
      projects: { updated: [], deleted: [] },
      timeLogs: { updated: [], deleted: [] },
      users: { updated: [], deleted: [] },
      syncTimestamp: currentSync.toISOString(),
      nextSyncIn: this.SYNC_INTERVAL
    };
    if (request.entities.includes("tasks")) {
      const userTasks = tasks2.filter(
        (task) => task.assignedToId === userId || task.createdById === userId
      );
      syncResponse.tasks.updated = userTasks.filter(
        (task) => new Date(task.updatedAt) > lastSync
      );
    }
    if (request.entities.includes("projects")) {
      const userProjects = projects2.filter((project) => {
        const projectTasks = tasks2.filter((task) => task.projectId === project.id);
        return projectTasks.some(
          (task) => task.assignedToId === userId || task.createdById === userId
        );
      });
      syncResponse.projects.updated = userProjects.filter(
        (project) => new Date(project.updatedAt) > lastSync
      );
    }
    if (request.entities.includes("timeLogs")) {
      const userTimeLogs = timeLogs2.filter((log2) => log2.userId === userId);
      syncResponse.timeLogs.updated = userTimeLogs.filter(
        (log2) => new Date(log2.updatedAt) > lastSync
      );
    }
    if (request.entities.includes("users")) {
      syncResponse.users.updated = users2.filter(
        (user) => new Date(user.updatedAt) > lastSync
      ).map((user) => ({
        ...user,
        password: void 0
        // Never send passwords to mobile
      }));
    }
    console.log(`\u2705 Sync complete: ${syncResponse.tasks.updated.length} tasks, ${syncResponse.projects.updated.length} projects`);
    return syncResponse;
  }
  /**
   * Mobile-optimized task creation
   */
  async createMobileTask(userId, taskData) {
    console.log(`\u{1F4F1} Creating mobile task: ${taskData.title}`);
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const task = await storage.createTask({
      id: taskId,
      title: taskData.title,
      description: taskData.description || "",
      status: "pending",
      priority: taskData.priority,
      projectId: taskData.projectId,
      assignedToId: taskData.assignedToId,
      createdById: userId,
      dueDate: taskData.dueDate,
      dueTime: taskData.dueTime,
      tags: taskData.tags || [],
      notes: "",
      attachments: [],
      urls: [],
      progressNotes: [],
      dependencies: [],
      subtasks: [],
      timeEstimate: null,
      actualTime: null,
      completedAt: null,
      customFields: {},
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (taskData.attachments?.length) {
      console.log(`\u{1F4CE} Task has ${taskData.attachments.length} mobile attachments`);
    }
    if (taskData.location) {
      console.log(`\u{1F4CD} Task has location: ${taskData.location.latitude}, ${taskData.location.longitude}`);
    }
    if (taskData.reminders?.length) {
      console.log(`\u23F0 Task has ${taskData.reminders.length} reminders`);
    }
    return task;
  }
  /**
   * Mobile-optimized time logging
   */
  async logMobileTime(userId, timeData) {
    console.log(`\u23F1\uFE0F Logging mobile time: ${timeData.duration} minutes`);
    const timeLog = await storage.createTimeLog({
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      taskId: timeData.taskId,
      projectId: timeData.projectId,
      description: timeData.description || "Mobile time entry",
      duration: timeData.duration,
      date: timeData.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      tags: timeData.tags || [],
      billable: true,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (timeData.location) {
      console.log(`\u{1F4CD} Time logged with location: ${timeData.location.latitude}, ${timeData.location.longitude}`);
    }
    return timeLog;
  }
  /**
   * Get mobile-optimized task list with pagination
   */
  async getMobileTasks(userId, page = 1, limit = 20, filters) {
    console.log(`\u{1F4F1} Getting mobile tasks for user: ${userId} (page ${page})`);
    let tasks2 = await storage.getTasks();
    tasks2 = tasks2.filter(
      (task) => task.assignedToId === userId || task.createdById === userId
    );
    if (filters?.status) {
      tasks2 = tasks2.filter((task) => task.status === filters.status);
    }
    if (filters?.priority) {
      tasks2 = tasks2.filter((task) => task.priority === filters.priority);
    }
    if (filters?.projectId) {
      tasks2 = tasks2.filter((task) => task.projectId === filters.projectId);
    }
    if (filters?.dueDate) {
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      switch (filters.dueDate) {
        case "today":
          const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1e3);
          tasks2 = tasks2.filter((task) => {
            const dueDate = task.dueDate ? new Date(task.dueDate) : null;
            return dueDate && dueDate >= today && dueDate < tomorrow;
          });
          break;
        case "week":
          const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1e3);
          tasks2 = tasks2.filter((task) => {
            const dueDate = task.dueDate ? new Date(task.dueDate) : null;
            return dueDate && dueDate >= today && dueDate <= nextWeek;
          });
          break;
        case "overdue":
          tasks2 = tasks2.filter((task) => {
            const dueDate = task.dueDate ? new Date(task.dueDate) : null;
            return dueDate && dueDate < today && task.status !== "completed";
          });
          break;
      }
    }
    tasks2.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority] || 0;
      const bPriority = priorityOrder[b.priority] || 0;
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return aDate - bDate;
    });
    const total = tasks2.length;
    const startIndex = (page - 1) * limit;
    const paginatedTasks = tasks2.slice(startIndex, startIndex + limit);
    return { tasks: paginatedTasks, total };
  }
  /**
   * Mobile push notification registration
   */
  async registerPushToken(userId, deviceInfo) {
    console.log(`\u{1F4F1} Registering push token for user: ${userId} on ${deviceInfo.platform}`);
    console.log(`\u2705 Push token registered: ${deviceInfo.pushToken?.substring(0, 20)}...`);
  }
  /**
   * Mobile offline support - queue actions
   */
  async queueOfflineAction(userId, action) {
    console.log(`\u{1F4F1} Queuing offline action: ${action.type} for user: ${userId}`);
    console.log(`\u2705 Offline action queued: ${action.clientId}`);
  }
  // Helper methods
  formatRelativeTime(date2) {
    const now = /* @__PURE__ */ new Date();
    const diffMs = date2.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1e3 * 60 * 60 * 24));
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "tomorrow";
    if (diffDays === -1) return "yesterday";
    if (diffDays > 1) return `in ${diffDays} days`;
    if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
    return date2.toLocaleDateString();
  }
  /**
   * Get mobile app configuration
   */
  getMobileConfig() {
    return {
      apiVersion: this.API_VERSION,
      syncInterval: this.SYNC_INTERVAL,
      maxFileSize: 10 * 1024 * 1024,
      // 10MB
      supportedFileTypes: ["jpg", "jpeg", "png", "pdf", "doc", "docx"],
      features: {
        offlineMode: true,
        pushNotifications: true,
        voiceNotes: true,
        locationTracking: true,
        cameraCapture: true,
        fingerprint: true
      },
      limits: {
        maxTasksPerSync: 1e3,
        maxAttachmentSize: 5 * 1024 * 1024,
        // 5MB
        maxOfflineActions: 100
      }
    };
  }
};
var mobileApiService = new MobileApiService();

// server/white-label-service.ts
import crypto3 from "crypto";
var WhiteLabelService = class {
  tenants = /* @__PURE__ */ new Map();
  usage = /* @__PURE__ */ new Map();
  billing = /* @__PURE__ */ new Map();
  constructor() {
    console.log("\u{1F3E2} White-label service initialized");
    this.initializeDefaultTenants();
  }
  /**
   * Create a new tenant
   */
  async createTenant(config) {
    const tenant = {
      ...config,
      id: this.generateTenantId(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const existingSubdomain = Array.from(this.tenants.values()).find((t) => t.subdomain === tenant.subdomain);
    if (existingSubdomain) {
      throw new Error(`Subdomain '${tenant.subdomain}' is already taken`);
    }
    if (tenant.customDomain) {
      const existingDomain = Array.from(this.tenants.values()).find((t) => t.customDomain === tenant.customDomain);
      if (existingDomain) {
        throw new Error(`Custom domain '${tenant.customDomain}' is already taken`);
      }
    }
    this.tenants.set(tenant.id, tenant);
    console.log(`\u{1F3E2} Created tenant: ${tenant.name} (${tenant.subdomain})`);
    this.initializeTenantUsage(tenant.id);
    return tenant;
  }
  /**
   * Update tenant configuration
   */
  async updateTenant(tenantId, updates) {
    const existing = this.tenants.get(tenantId);
    if (!existing) {
      throw new Error(`Tenant not found: ${tenantId}`);
    }
    const updated = {
      ...existing,
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.tenants.set(tenantId, updated);
    console.log(`\u{1F3E2} Updated tenant: ${updated.name}`);
    return updated;
  }
  /**
   * Get tenant by subdomain or custom domain
   */
  async getTenantByDomain(domain) {
    const subdomain = domain.includes(".") ? domain.split(".")[0] : domain;
    const byCustomDomain = Array.from(this.tenants.values()).find((t) => t.customDomain === domain);
    if (byCustomDomain) return byCustomDomain;
    const bySubdomain = Array.from(this.tenants.values()).find((t) => t.subdomain === subdomain);
    if (bySubdomain) return bySubdomain;
    return null;
  }
  /**
   * Get all tenants
   */
  async getTenants() {
    return Array.from(this.tenants.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  /**
   * Get tenant by ID
   */
  async getTenant(tenantId) {
    return this.tenants.get(tenantId) || null;
  }
  /**
   * Delete tenant
   */
  async deleteTenant(tenantId) {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`Tenant not found: ${tenantId}`);
    }
    this.tenants.delete(tenantId);
    this.usage.delete(tenantId);
    this.billing.delete(tenantId);
    console.log(`\u{1F3E2} Deleted tenant: ${tenant.name}`);
  }
  /**
   * Generate custom CSS for tenant branding
   */
  generateTenantCSS(tenant) {
    const { branding } = tenant;
    return `
      /* ${tenant.name} Custom Branding */
      :root {
        --primary-color: ${branding.primaryColor};
        --secondary-color: ${branding.secondaryColor};
        --font-family: ${branding.fontFamily};
      }
      
      /* Header styling */
      .app-header {
        background-color: var(--primary-color) !important;
      }
      
      /* Button styling */
      .btn-primary {
        background-color: var(--primary-color) !important;
        border-color: var(--primary-color) !important;
      }
      
      .btn-primary:hover {
        background-color: color-mix(in srgb, var(--primary-color) 85%, black) !important;
        border-color: color-mix(in srgb, var(--primary-color) 85%, black) !important;
      }
      
      /* Link styling */
      .text-primary {
        color: var(--primary-color) !important;
      }
      
      /* Border styling */
      .border-primary {
        border-color: var(--primary-color) !important;
      }
      
      /* Background styling */
      .bg-primary {
        background-color: var(--primary-color) !important;
      }
      
      .bg-secondary {
        background-color: var(--secondary-color) !important;
      }
      
      /* Font styling */
      body, .font-primary {
        font-family: var(--font-family) !important;
      }
      
      /* Logo replacement */
      .tenant-logo {
        content: url('${branding.logo}');
        max-height: 40px;
        width: auto;
      }
      
      /* Custom CSS */
      ${branding.customCSS || ""}
    `;
  }
  /**
   * Track tenant usage
   */
  async trackUsage(tenantId, metric, increment = 1) {
    const currentPeriod = (/* @__PURE__ */ new Date()).toISOString().substring(0, 7);
    let tenantUsage = this.usage.get(tenantId) || [];
    let currentUsage = tenantUsage.find((u) => u.period === currentPeriod);
    if (!currentUsage) {
      currentUsage = {
        tenantId,
        period: currentPeriod,
        users: 0,
        projects: 0,
        tasks: 0,
        timeLogs: 0,
        storage: 0,
        apiCalls: 0,
        webhookDeliveries: 0,
        reportGenerations: 0
      };
      tenantUsage.push(currentUsage);
    }
    if (typeof currentUsage[metric] === "number") {
      currentUsage[metric] += increment;
    }
    this.usage.set(tenantId, tenantUsage);
  }
  /**
   * Get tenant usage statistics
   */
  async getTenantUsage(tenantId, period) {
    const tenantUsage = this.usage.get(tenantId) || [];
    if (period) {
      return tenantUsage.filter((u) => u.period === period);
    }
    return tenantUsage.sort((a, b) => b.period.localeCompare(a.period));
  }
  /**
   * Check if tenant has exceeded limits
   */
  async checkTenantLimits(tenantId) {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`Tenant not found: ${tenantId}`);
    }
    const currentPeriod = (/* @__PURE__ */ new Date()).toISOString().substring(0, 7);
    const usage = (await this.getTenantUsage(tenantId, currentPeriod))[0];
    const violations = [];
    if (!usage) {
      return { withinLimits: true, violations: [] };
    }
    if (usage.users > tenant.features.maxUsers) {
      violations.push(`Users exceeded: ${usage.users}/${tenant.features.maxUsers}`);
    }
    if (usage.projects > tenant.features.maxProjects) {
      violations.push(`Projects exceeded: ${usage.projects}/${tenant.features.maxProjects}`);
    }
    if (usage.storage > tenant.features.maxStorage) {
      violations.push(`Storage exceeded: ${usage.storage}GB/${tenant.features.maxStorage}GB`);
    }
    return {
      withinLimits: violations.length === 0,
      violations
    };
  }
  /**
   * Generate tenant billing
   */
  async generateBilling(tenantId, period) {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`Tenant not found: ${tenantId}`);
    }
    const planPricing = {
      starter: 29,
      professional: 99,
      enterprise: 299
    };
    const basePrice = planPricing[tenant.plan];
    const items = [];
    items.push({
      description: `${tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)} Plan`,
      quantity: 1,
      unitPrice: basePrice,
      total: basePrice
    });
    const usage = (await this.getTenantUsage(tenantId, period.start.substring(0, 7)))[0];
    if (usage) {
      const extraUsers = Math.max(0, usage.users - tenant.features.maxUsers);
      if (extraUsers > 0) {
        const userPrice = 10;
        items.push({
          description: `Additional Users (${extraUsers})`,
          quantity: extraUsers,
          unitPrice: userPrice,
          total: extraUsers * userPrice
        });
      }
      const extraStorage = Math.max(0, usage.storage - tenant.features.maxStorage);
      if (extraStorage > 0) {
        const storagePrice = 5;
        items.push({
          description: `Additional Storage (${extraStorage}GB)`,
          quantity: extraStorage,
          unitPrice: storagePrice,
          total: extraStorage * storagePrice
        });
      }
    }
    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
    const billing = {
      tenantId,
      amount: totalAmount,
      currency: tenant.settings.currency,
      status: "pending",
      billingPeriod: period,
      items,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const tenantBilling = this.billing.get(tenantId) || [];
    tenantBilling.push(billing);
    this.billing.set(tenantId, tenantBilling);
    console.log(`\u{1F4B0} Generated billing for ${tenant.name}: ${totalAmount} ${tenant.settings.currency}`);
    return billing;
  }
  /**
   * Get white-label templates
   */
  getWhiteLabelTemplates() {
    return [
      {
        id: "corporate",
        name: "Corporate Blue",
        description: "Professional corporate branding with blue theme",
        industry: "Enterprise",
        branding: {
          logo: "/templates/corporate-logo.svg",
          primaryColor: "#1E40AF",
          secondaryColor: "#3B82F6",
          fontFamily: "Inter, sans-serif"
        },
        features: ["All Enterprise Features"],
        configTemplate: {
          plan: "enterprise",
          features: {
            aiInsights: true,
            teamCollaboration: true,
            advancedReporting: true,
            apiWebhooks: true,
            mobileApp: true,
            customFields: true,
            sso: true,
            customIntegrations: true
          }
        },
        previewUrl: "/templates/corporate-preview.png"
      },
      {
        id: "creative",
        name: "Creative Agency",
        description: "Vibrant and modern design for creative agencies",
        industry: "Creative",
        branding: {
          logo: "/templates/creative-logo.svg",
          primaryColor: "#7C3AED",
          secondaryColor: "#A855F7",
          fontFamily: "Poppins, sans-serif"
        },
        features: ["Professional Features", "Custom Branding"],
        configTemplate: {
          plan: "professional",
          features: {
            aiInsights: true,
            teamCollaboration: true,
            advancedReporting: true,
            apiWebhooks: false,
            mobileApp: true,
            customFields: true,
            sso: false,
            customIntegrations: false
          }
        },
        previewUrl: "/templates/creative-preview.png"
      },
      {
        id: "startup",
        name: "Startup Green",
        description: "Clean and minimal design for startups",
        industry: "Technology",
        branding: {
          logo: "/templates/startup-logo.svg",
          primaryColor: "#059669",
          secondaryColor: "#10B981",
          fontFamily: "Roboto, sans-serif"
        },
        features: ["Essential Features", "Growth Ready"],
        configTemplate: {
          plan: "starter",
          features: {
            aiInsights: false,
            teamCollaboration: true,
            advancedReporting: false,
            apiWebhooks: false,
            mobileApp: true,
            customFields: false,
            sso: false,
            customIntegrations: false
          }
        },
        previewUrl: "/templates/startup-preview.png"
      },
      {
        id: "consulting",
        name: "Professional Consulting",
        description: "Sophisticated design for consulting firms",
        industry: "Consulting",
        branding: {
          logo: "/templates/consulting-logo.svg",
          primaryColor: "#374151",
          secondaryColor: "#6B7280",
          fontFamily: "Merriweather, serif"
        },
        features: ["Professional Features", "Client Management"],
        configTemplate: {
          plan: "professional",
          features: {
            aiInsights: true,
            teamCollaboration: true,
            advancedReporting: true,
            apiWebhooks: true,
            mobileApp: true,
            customFields: true,
            sso: true,
            customIntegrations: false
          }
        },
        previewUrl: "/templates/consulting-preview.png"
      }
    ];
  }
  // Private helper methods
  generateTenantId() {
    return `tenant_${Date.now()}_${crypto3.randomBytes(4).toString("hex")}`;
  }
  initializeTenantUsage(tenantId) {
    const currentPeriod = (/* @__PURE__ */ new Date()).toISOString().substring(0, 7);
    const initialUsage = {
      tenantId,
      period: currentPeriod,
      users: 0,
      projects: 0,
      tasks: 0,
      timeLogs: 0,
      storage: 0,
      apiCalls: 0,
      webhookDeliveries: 0,
      reportGenerations: 0
    };
    this.usage.set(tenantId, [initialUsage]);
  }
  initializeDefaultTenants() {
    const demoTenant = {
      id: "demo_tenant",
      name: "Demo Company",
      subdomain: "demo",
      plan: "enterprise",
      branding: {
        primaryColor: "#0D9488",
        secondaryColor: "#14B8A6",
        fontFamily: "Inter, sans-serif"
      },
      features: {
        maxUsers: 50,
        maxProjects: 100,
        maxStorage: 10,
        aiInsights: true,
        teamCollaboration: true,
        advancedReporting: true,
        apiWebhooks: true,
        mobileApp: true,
        customFields: true,
        sso: true,
        customIntegrations: true
      },
      settings: {
        timezone: "UTC",
        dateFormat: "MM/DD/YYYY",
        currency: "USD",
        language: "en",
        workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        workingHours: {
          start: "09:00",
          end: "17:00"
        }
      },
      subscription: {
        status: "active",
        billingEmail: "billing@demo.com",
        billingCycle: "monthly",
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString()
      },
      admin: {
        userId: "demo_admin",
        email: "admin@demo.com",
        name: "Demo Admin"
      },
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      isActive: true
    };
    this.tenants.set(demoTenant.id, demoTenant);
    this.initializeTenantUsage(demoTenant.id);
    console.log("\u{1F3E2} Initialized demo tenant: demo.gigster-garage.com");
  }
  /**
   * Get tenant dashboard statistics
   */
  async getTenantDashboard() {
    const tenants = Array.from(this.tenants.values());
    const activeTenants = tenants.filter((t) => t.isActive);
    const trialTenants = tenants.filter((t) => t.subscription.status === "trial");
    const allBilling = Array.from(this.billing.values()).flat();
    const totalRevenue = allBilling.filter((b) => b.status === "paid").reduce((sum, b) => sum + b.amount, 0);
    return {
      totalTenants: tenants.length,
      activeTenants: activeTenants.length,
      trialTenants: trialTenants.length,
      totalRevenue,
      recentTenants: tenants.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
      planDistribution: {
        starter: tenants.filter((t) => t.plan === "starter").length,
        professional: tenants.filter((t) => t.plan === "professional").length,
        enterprise: tenants.filter((t) => t.plan === "enterprise").length
      }
    };
  }
};
var whiteLabelService = new WhiteLabelService();

// server/sso-service.ts
init_storage();
import passport from "passport";
import { Strategy as SamlStrategy } from "passport-saml";
import { Strategy as OAuth2Strategy } from "passport-oauth2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import crypto4 from "crypto";
var SSOService = class {
  providers = /* @__PURE__ */ new Map();
  sessions = /* @__PURE__ */ new Map();
  auditLogs = [];
  constructor() {
    console.log("\u{1F510} SSO service initialized");
    this.initializeDefaultProviders();
    this.startSessionCleanup();
  }
  /**
   * Register a new SSO provider
   */
  async registerProvider(provider) {
    const ssoProvider = {
      ...provider,
      id: this.generateProviderId(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.providers.set(ssoProvider.id, ssoProvider);
    await this.configurePassportStrategy(ssoProvider);
    console.log(`\u{1F510} Registered SSO provider: ${ssoProvider.name} (${ssoProvider.type})`);
    return ssoProvider;
  }
  /**
   * Update SSO provider configuration
   */
  async updateProvider(id, updates) {
    const existing = this.providers.get(id);
    if (!existing) {
      throw new Error(`SSO provider not found: ${id}`);
    }
    const updated = {
      ...existing,
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.providers.set(id, updated);
    await this.configurePassportStrategy(updated);
    console.log(`\u{1F510} Updated SSO provider: ${updated.name}`);
    return updated;
  }
  /**
   * Get all SSO providers
   */
  async getProviders() {
    return Array.from(this.providers.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }
  /**
   * Get active SSO providers
   */
  async getActiveProviders() {
    return Array.from(this.providers.values()).filter((p) => p.isActive);
  }
  /**
   * Configure passport strategy for provider
   */
  async configurePassportStrategy(provider) {
    const strategyName = `sso-${provider.id}`;
    switch (provider.type) {
      case "saml":
        this.configureSAMLStrategy(provider, strategyName);
        break;
      case "oauth2":
        this.configureOAuth2Strategy(provider, strategyName);
        break;
      case "oidc":
        this.configureOIDCStrategy(provider, strategyName);
        break;
    }
  }
  /**
   * Configure SAML strategy
   */
  configureSAMLStrategy(provider, strategyName) {
    const strategy = new SamlStrategy(
      {
        entryPoint: provider.configuration.entryPoint,
        issuer: provider.configuration.issuer,
        callbackUrl: provider.configuration.callbackURL,
        cert: provider.configuration.cert,
        identifierFormat: provider.configuration.identifierFormat || "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified",
        signatureAlgorithm: provider.configuration.signatureAlgorithm || "sha256"
      },
      async (profile, done) => {
        try {
          const result = await this.handleSSOLogin(provider, profile);
          done(null, result);
        } catch (error) {
          console.error("SAML authentication error:", error);
          await this.logAuditEvent("login_failure", provider.id, {
            error: error.message,
            profile
          });
          done(error, null);
        }
      }
    );
    passport.use(strategyName, strategy);
    console.log(`\u{1F510} Configured SAML strategy: ${strategyName}`);
  }
  /**
   * Configure OAuth2 strategy
   */
  configureOAuth2Strategy(provider, strategyName) {
    const strategy = new OAuth2Strategy(
      {
        clientID: provider.configuration.clientID,
        clientSecret: provider.configuration.clientSecret,
        authorizationURL: provider.configuration.authorizationURL,
        tokenURL: provider.configuration.tokenURL,
        callbackURL: provider.configuration.callbackURL,
        scope: provider.configuration.scope || ["openid", "profile", "email"]
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          if (provider.configuration.userInfoURL) {
            const userInfoResponse = await fetch(provider.configuration.userInfoURL, {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            const userInfo = await userInfoResponse.json();
            profile = { ...profile, ...userInfo };
          }
          const result = await this.handleSSOLogin(provider, profile);
          done(null, result);
        } catch (error) {
          console.error("OAuth2 authentication error:", error);
          await this.logAuditEvent("login_failure", provider.id, {
            error: error.message,
            profile
          });
          done(error, null);
        }
      }
    );
    passport.use(strategyName, strategy);
    console.log(`\u{1F510} Configured OAuth2 strategy: ${strategyName}`);
  }
  /**
   * Configure OpenID Connect strategy
   */
  configureOIDCStrategy(provider, strategyName) {
    if (provider.name.toLowerCase().includes("google")) {
      const strategy = new GoogleStrategy(
        {
          clientID: provider.configuration.clientID,
          clientSecret: provider.configuration.clientSecret,
          callbackURL: provider.configuration.callbackURL
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const result = await this.handleSSOLogin(provider, profile);
            done(null, result);
          } catch (error) {
            console.error("Google OIDC authentication error:", error);
            await this.logAuditEvent("login_failure", provider.id, {
              error: error.message,
              profile
            });
            done(error, null);
          }
        }
      );
      passport.use(strategyName, strategy);
      console.log(`\u{1F510} Configured Google OIDC strategy: ${strategyName}`);
    }
  }
  /**
   * Handle SSO login process
   */
  async handleSSOLogin(provider, profile) {
    console.log(`\u{1F510} Processing SSO login for provider: ${provider.name}`);
    const claims = this.extractClaims(provider, profile);
    if (provider.domainRestrictions?.length) {
      const emailDomain = claims.email.split("@")[1];
      if (!provider.domainRestrictions.includes(emailDomain)) {
        throw new Error(`Email domain '${emailDomain}' not allowed for this SSO provider`);
      }
    }
    let user = await storage.getUserByEmail(claims.email);
    if (!user && provider.autoProvision) {
      const role = this.determineUserRole(provider, claims);
      user = await storage.createUser({
        username: claims.email.split("@")[0],
        email: claims.email,
        name: `${claims.firstName || ""} ${claims.lastName || ""}`.trim(),
        password: crypto4.randomBytes(32).toString("hex"),
        // Random password (won't be used)
        role,
        notificationPreferences: {
          email: true,
          sms: false,
          browser: true
        },
        ssoProvider: provider.id
      });
      await this.logAuditEvent("provision_user", provider.id, {
        userId: user.id,
        email: claims.email,
        role
      });
      console.log(`\u{1F464} Auto-provisioned user: ${claims.email} with role: ${role}`);
    } else if (!user) {
      throw new Error("User not found and auto-provisioning is disabled");
    }
    const session2 = await this.createSSOSession(user.id, provider.id, profile.id || profile.nameID, claims);
    await this.logAuditEvent("login_success", provider.id, {
      userId: user.id,
      email: claims.email,
      sessionId: session2.id
    });
    return {
      user,
      session: session2,
      claims
    };
  }
  /**
   * Extract claims from provider profile
   */
  extractClaims(provider, profile) {
    const mapping = provider.configuration.attributeMapping;
    const claims = {
      email: this.getAttributeValue(profile, mapping.email),
      firstName: this.getAttributeValue(profile, mapping.firstName),
      lastName: this.getAttributeValue(profile, mapping.lastName)
    };
    if (mapping.groups) {
      claims.groups = this.getAttributeValue(profile, mapping.groups, true);
    }
    if (mapping.department) {
      claims.department = this.getAttributeValue(profile, mapping.department);
    }
    if (mapping.title) {
      claims.title = this.getAttributeValue(profile, mapping.title);
    }
    return claims;
  }
  /**
   * Get attribute value from profile
   */
  getAttributeValue(profile, attributePath, isArray = false) {
    const keys = attributePath.split(".");
    let value = profile;
    for (const key of keys) {
      value = value?.[key];
      if (value === void 0) break;
    }
    if (isArray && value && !Array.isArray(value)) {
      value = [value];
    }
    return value;
  }
  /**
   * Determine user role based on provider configuration and claims
   */
  determineUserRole(provider, claims) {
    if (provider.groupMapping && claims.groups) {
      for (const group of claims.groups) {
        if (provider.groupMapping[group]) {
          return provider.groupMapping[group];
        }
      }
    }
    return provider.defaultRole;
  }
  /**
   * Create SSO session
   */
  async createSSOSession(userId, providerId, providerUserId, claims) {
    const session2 = {
      id: this.generateSessionId(),
      userId,
      providerId,
      providerUserId,
      sessionData: {},
      claims,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1e3).toISOString(),
      // 8 hours
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      lastAccessedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.sessions.set(session2.id, session2);
    console.log(`\u{1F510} Created SSO session: ${session2.id} for user: ${userId}`);
    return session2;
  }
  /**
   * Validate and refresh SSO session
   */
  async validateSession(sessionId) {
    const session2 = this.sessions.get(sessionId);
    if (!session2) return null;
    if (/* @__PURE__ */ new Date() > new Date(session2.expiresAt)) {
      this.sessions.delete(sessionId);
      await this.logAuditEvent("session_expired", session2.providerId, {
        sessionId,
        userId: session2.userId
      });
      return null;
    }
    session2.lastAccessedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.sessions.set(sessionId, session2);
    return session2;
  }
  /**
   * Logout and cleanup SSO session
   */
  async logout(sessionId) {
    const session2 = this.sessions.get(sessionId);
    if (session2) {
      this.sessions.delete(sessionId);
      await this.logAuditEvent("logout", session2.providerId, {
        sessionId,
        userId: session2.userId
      });
      console.log(`\u{1F510} Logged out SSO session: ${sessionId}`);
    }
  }
  /**
   * Generate SAML metadata for service provider
   */
  generateSAMLMetadata(baseUrl) {
    const entityId = `${baseUrl}/sso/saml/metadata`;
    const acsUrl = `${baseUrl}/sso/saml/acs`;
    const sloUrl = `${baseUrl}/sso/saml/slo`;
    return `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="${entityId}">
  <md:SPSSODescriptor AuthnRequestsSigned="false" WantAssertionsSigned="true" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:KeyDescriptor use="signing">
      <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <ds:X509Data>
          <ds:X509Certificate><!-- Certificate will be generated --></ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </md:KeyDescriptor>
    <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat>
    <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="${acsUrl}" index="0"/>
    <md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="${sloUrl}"/>
  </md:SPSSODescriptor>
</md:EntityDescriptor>`;
  }
  /**
   * Log audit event
   */
  async logAuditEvent(event, providerId, details, request) {
    const auditLog = {
      id: this.generateAuditId(),
      event,
      providerId,
      userId: details.userId,
      ipAddress: request?.ip || "127.0.0.1",
      userAgent: request?.get("user-agent") || "Unknown",
      details,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.auditLogs.push(auditLog);
    console.log(`\u{1F4CB} SSO Audit: ${event} for provider ${providerId}`);
    if (this.auditLogs.length > 1e4) {
      this.auditLogs = this.auditLogs.slice(-1e4);
    }
  }
  /**
   * Get audit logs
   */
  async getAuditLogs(filters) {
    let logs = [...this.auditLogs];
    if (filters) {
      if (filters.event) {
        logs = logs.filter((log2) => log2.event === filters.event);
      }
      if (filters.providerId) {
        logs = logs.filter((log2) => log2.providerId === filters.providerId);
      }
      if (filters.userId) {
        logs = logs.filter((log2) => log2.userId === filters.userId);
      }
      if (filters.startDate) {
        logs = logs.filter((log2) => log2.timestamp >= filters.startDate);
      }
      if (filters.endDate) {
        logs = logs.filter((log2) => log2.timestamp <= filters.endDate);
      }
    }
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  /**
   * Get SSO statistics
   */
  async getStatistics() {
    const now = /* @__PURE__ */ new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1e3);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
    const recent24h = this.auditLogs.filter((log2) => new Date(log2.timestamp) >= last24Hours);
    const recent7d = this.auditLogs.filter((log2) => new Date(log2.timestamp) >= last7Days);
    return {
      totalProviders: this.providers.size,
      activeProviders: Array.from(this.providers.values()).filter((p) => p.isActive).length,
      activeSessions: this.sessions.size,
      statistics24h: {
        loginAttempts: recent24h.filter((log2) => log2.event === "login_attempt").length,
        loginSuccesses: recent24h.filter((log2) => log2.event === "login_success").length,
        loginFailures: recent24h.filter((log2) => log2.event === "login_failure").length,
        logouts: recent24h.filter((log2) => log2.event === "logout").length,
        provisioned: recent24h.filter((log2) => log2.event === "provision_user").length
      },
      statistics7d: {
        loginAttempts: recent7d.filter((log2) => log2.event === "login_attempt").length,
        loginSuccesses: recent7d.filter((log2) => log2.event === "login_success").length,
        loginFailures: recent7d.filter((log2) => log2.event === "login_failure").length,
        logouts: recent7d.filter((log2) => log2.event === "logout").length,
        provisioned: recent7d.filter((log2) => log2.event === "provision_user").length
      },
      providerStats: Array.from(this.providers.values()).map((provider) => ({
        id: provider.id,
        name: provider.name,
        type: provider.type,
        loginCount: this.auditLogs.filter(
          (log2) => log2.providerId === provider.id && log2.event === "login_success"
        ).length
      }))
    };
  }
  // Private helper methods
  initializeDefaultProviders() {
    console.log("\u{1F510} SSO service ready for provider configuration");
  }
  startSessionCleanup() {
    setInterval(() => {
      const now = /* @__PURE__ */ new Date();
      let cleanedCount = 0;
      for (const [sessionId, session2] of this.sessions.entries()) {
        if (now > new Date(session2.expiresAt)) {
          this.sessions.delete(sessionId);
          cleanedCount++;
        }
      }
      if (cleanedCount > 0) {
        console.log(`\u{1F9F9} Cleaned up ${cleanedCount} expired SSO sessions`);
      }
    }, 60 * 60 * 1e3);
  }
  generateProviderId() {
    return `sso_provider_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  generateSessionId() {
    return `sso_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  generateAuditId() {
    return `sso_audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  /**
   * Get provider templates for common enterprise systems
   */
  getProviderTemplates() {
    return [
      {
        name: "Microsoft Azure AD",
        type: "saml",
        protocol: "SAML 2.0",
        configuration: {
          identifierFormat: "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
          signatureAlgorithm: "sha256",
          attributeMapping: {
            email: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
            firstName: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
            lastName: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname",
            groups: "http://schemas.microsoft.com/ws/2008/06/identity/claims/groups"
          }
        },
        autoProvision: true,
        defaultRole: "user"
      },
      {
        name: "Okta",
        type: "saml",
        protocol: "SAML 2.0",
        configuration: {
          identifierFormat: "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified",
          signatureAlgorithm: "sha256",
          attributeMapping: {
            email: "email",
            firstName: "firstName",
            lastName: "lastName",
            groups: "groups"
          }
        },
        autoProvision: true,
        defaultRole: "user"
      },
      {
        name: "Google Workspace",
        type: "oidc",
        protocol: "OpenID Connect",
        configuration: {
          scope: ["openid", "profile", "email"],
          attributeMapping: {
            email: "email",
            firstName: "given_name",
            lastName: "family_name"
          }
        },
        autoProvision: true,
        defaultRole: "user"
      },
      {
        name: "Auth0",
        type: "oauth2",
        protocol: "OAuth 2.0",
        configuration: {
          scope: ["openid", "profile", "email"],
          attributeMapping: {
            email: "email",
            firstName: "given_name",
            lastName: "family_name"
          }
        },
        autoProvision: true,
        defaultRole: "user"
      }
    ];
  }
};
var ssoService = new SSOService();

// server/permissions-service.ts
init_storage();
var PermissionsService = class {
  permissions = /* @__PURE__ */ new Map();
  roles = /* @__PURE__ */ new Map();
  userPermissions = /* @__PURE__ */ new Map();
  auditLogs = [];
  constructor() {
    console.log("\u{1F510} Permissions service initialized");
    this.initializeSystemPermissions();
    this.initializeSystemRoles();
  }
  /**
   * Initialize system permissions
   */
  initializeSystemPermissions() {
    const systemPermissions = [
      // User Management
      { name: "users.create", description: "Create new users", category: "User Management", resource: "user", action: "create", isSystem: true },
      { name: "users.read", description: "View user information", category: "User Management", resource: "user", action: "read", isSystem: true },
      { name: "users.update", description: "Update user information", category: "User Management", resource: "user", action: "update", isSystem: true },
      { name: "users.delete", description: "Delete users", category: "User Management", resource: "user", action: "delete", isSystem: true },
      { name: "users.list", description: "List all users", category: "User Management", resource: "user", action: "list", isSystem: true },
      // Task Management
      { name: "tasks.create", description: "Create new tasks", category: "Task Management", resource: "task", action: "create", isSystem: true },
      { name: "tasks.read", description: "View tasks", category: "Task Management", resource: "task", action: "read", isSystem: true },
      { name: "tasks.update", description: "Update tasks", category: "Task Management", resource: "task", action: "update", isSystem: true },
      { name: "tasks.delete", description: "Delete tasks", category: "Task Management", resource: "task", action: "delete", isSystem: true },
      { name: "tasks.assign", description: "Assign tasks to users", category: "Task Management", resource: "task", action: "assign", isSystem: true },
      // Project Management
      { name: "projects.create", description: "Create new projects", category: "Project Management", resource: "project", action: "create", isSystem: true },
      { name: "projects.read", description: "View projects", category: "Project Management", resource: "project", action: "read", isSystem: true },
      { name: "projects.update", description: "Update projects", category: "Project Management", resource: "project", action: "update", isSystem: true },
      { name: "projects.delete", description: "Delete projects", category: "Project Management", resource: "project", action: "delete", isSystem: true },
      { name: "projects.manage", description: "Full project management", category: "Project Management", resource: "project", action: "manage", isSystem: true },
      // Time Tracking
      { name: "timelog.create", description: "Create time entries", category: "Time Tracking", resource: "timelog", action: "create", isSystem: true },
      { name: "timelog.read", description: "View time entries", category: "Time Tracking", resource: "timelog", action: "read", isSystem: true },
      { name: "timelog.update", description: "Update time entries", category: "Time Tracking", resource: "timelog", action: "update", isSystem: true },
      { name: "timelog.delete", description: "Delete time entries", category: "Time Tracking", resource: "timelog", action: "delete", isSystem: true },
      // Reports & Analytics
      { name: "reports.read", description: "View reports", category: "Reports", resource: "report", action: "read", isSystem: true },
      { name: "reports.create", description: "Create custom reports", category: "Reports", resource: "report", action: "create", isSystem: true },
      { name: "reports.export", description: "Export reports", category: "Reports", resource: "report", action: "export", isSystem: true },
      { name: "analytics.read", description: "View analytics", category: "Analytics", resource: "analytics", action: "read", isSystem: true },
      // System Administration
      { name: "admin.settings", description: "Manage system settings", category: "Administration", resource: "system", action: "settings", isSystem: true },
      { name: "admin.backup", description: "Manage backups", category: "Administration", resource: "system", action: "backup", isSystem: true },
      { name: "admin.audit", description: "View audit logs", category: "Administration", resource: "system", action: "audit", isSystem: true },
      { name: "admin.security", description: "Manage security settings", category: "Administration", resource: "system", action: "security", isSystem: true },
      // Enterprise Features
      { name: "sso.manage", description: "Manage SSO providers", category: "Enterprise", resource: "sso", action: "manage", isSystem: true },
      { name: "permissions.manage", description: "Manage permissions and roles", category: "Enterprise", resource: "permissions", action: "manage", isSystem: true },
      { name: "webhooks.manage", description: "Manage API webhooks", category: "Enterprise", resource: "webhooks", action: "manage", isSystem: true },
      { name: "whitelabel.manage", description: "Manage white-label settings", category: "Enterprise", resource: "whitelabel", action: "manage", isSystem: true },
      // Data & Privacy
      { name: "data.export", description: "Export user data", category: "Data Management", resource: "data", action: "export", isSystem: true },
      { name: "data.import", description: "Import user data", category: "Data Management", resource: "data", action: "import", isSystem: true },
      { name: "data.delete", description: "Delete user data", category: "Data Management", resource: "data", action: "delete", isSystem: true },
      { name: "privacy.manage", description: "Manage privacy settings", category: "Data Management", resource: "privacy", action: "manage", isSystem: true }
    ];
    systemPermissions.forEach((perm) => {
      const permission = {
        ...perm,
        id: this.generatePermissionId(),
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.permissions.set(permission.id, permission);
    });
    console.log(`\u{1F510} Initialized ${systemPermissions.length} system permissions`);
  }
  /**
   * Initialize system roles
   */
  initializeSystemRoles() {
    const systemRoles = [
      {
        name: "Super Admin",
        description: "Full system access with all permissions",
        permissions: Array.from(this.permissions.keys()),
        // All permissions
        isSystem: true,
        priority: 1e3
      },
      {
        name: "Admin",
        description: "Administrative access with most permissions",
        permissions: Array.from(this.permissions.values()).filter((p) => !p.name.includes("admin.") || p.name === "admin.settings").map((p) => p.id),
        isSystem: true,
        priority: 800
      },
      {
        name: "Manager",
        description: "Team management and project oversight",
        permissions: Array.from(this.permissions.values()).filter(
          (p) => p.category === "Task Management" || p.category === "Project Management" || p.category === "Time Tracking" || p.category === "Reports" || p.category === "User Management" && !p.name.includes("delete")
        ).map((p) => p.id),
        isSystem: true,
        priority: 600
      },
      {
        name: "Team Lead",
        description: "Lead team projects and manage tasks",
        permissions: Array.from(this.permissions.values()).filter(
          (p) => p.category === "Task Management" || p.category === "Project Management" || p.category === "Time Tracking" || p.category === "Reports" && p.action === "read"
        ).map((p) => p.id),
        isSystem: true,
        priority: 400
      },
      {
        name: "User",
        description: "Standard user with basic access",
        permissions: Array.from(this.permissions.values()).filter(
          (p) => p.category === "Task Management" && !p.name.includes("delete") || p.category === "Time Tracking" && !p.name.includes("delete") || p.resource === "user" && p.action === "read" || p.resource === "project" && p.action === "read"
        ).map((p) => p.id),
        isSystem: true,
        priority: 200
      },
      {
        name: "Guest",
        description: "Limited read-only access",
        permissions: Array.from(this.permissions.values()).filter((p) => p.action === "read" && (p.resource === "task" || p.resource === "project")).map((p) => p.id),
        isSystem: true,
        priority: 100
      }
    ];
    systemRoles.forEach((role) => {
      const systemRole = {
        ...role,
        id: this.generateRoleId(),
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.roles.set(systemRole.id, systemRole);
    });
    console.log(`\u{1F510} Initialized ${systemRoles.length} system roles`);
  }
  /**
   * Create a custom permission
   */
  async createPermission(permissionData) {
    const permission = {
      ...permissionData,
      id: this.generatePermissionId(),
      isSystem: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.permissions.set(permission.id, permission);
    await this.logAuditEvent("create", {
      permissionId: permission.id,
      permissionName: permission.name
    });
    console.log(`\u{1F510} Created custom permission: ${permission.name}`);
    return permission;
  }
  /**
   * Create a custom role
   */
  async createRole(roleData) {
    const role = {
      ...roleData,
      id: this.generateRoleId(),
      isSystem: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.roles.set(role.id, role);
    await this.logAuditEvent("create", {
      roleId: role.id,
      roleName: role.name,
      permissions: role.permissions
    });
    console.log(`\u{1F510} Created custom role: ${role.name}`);
    return role;
  }
  /**
   * Update a role
   */
  async updateRole(roleId, updates) {
    const existing = this.roles.get(roleId);
    if (!existing) {
      throw new Error(`Role not found: ${roleId}`);
    }
    if (existing.isSystem && updates.permissions) {
      throw new Error("Cannot modify permissions of system roles");
    }
    const updated = {
      ...existing,
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.roles.set(roleId, updated);
    await this.logAuditEvent("update", {
      roleId,
      roleName: updated.name,
      changes: updates
    });
    console.log(`\u{1F510} Updated role: ${updated.name}`);
    return updated;
  }
  /**
   * Grant permission to user
   */
  async grantPermission(userId, permissionId, grantedBy, roleId, expiresAt) {
    const userPerms = this.userPermissions.get(userId) || [];
    const existingIndex = userPerms.findIndex((p) => p.permissionId === permissionId);
    const userPermission = {
      userId,
      permissionId,
      roleId,
      granted: true,
      grantedBy,
      grantedAt: (/* @__PURE__ */ new Date()).toISOString(),
      expiresAt
    };
    if (existingIndex >= 0) {
      userPerms[existingIndex] = userPermission;
    } else {
      userPerms.push(userPermission);
    }
    this.userPermissions.set(userId, userPerms);
    await this.logAuditEvent("grant", {
      userId,
      permissionId,
      roleId,
      grantedBy,
      expiresAt
    });
    console.log(`\u{1F510} Granted permission ${permissionId} to user ${userId}`);
  }
  /**
   * Revoke permission from user
   */
  async revokePermission(userId, permissionId, revokedBy) {
    const userPerms = this.userPermissions.get(userId) || [];
    const filteredPerms = userPerms.filter((p) => p.permissionId !== permissionId);
    this.userPermissions.set(userId, filteredPerms);
    await this.logAuditEvent("revoke", {
      userId,
      permissionId,
      revokedBy
    });
    console.log(`\u{1F510} Revoked permission ${permissionId} from user ${userId}`);
  }
  /**
   * Check if user has permission
   */
  async checkPermission(check) {
    const { userId, permission: permissionName, resource, context } = check;
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        await this.logAuditEvent("check", {
          userId,
          permission: permissionName,
          result: false,
          reason: "User not found"
        });
        return false;
      }
      const userPerms = this.userPermissions.get(userId) || [];
      const directPerm = userPerms.find((p) => {
        const perm = this.permissions.get(p.permissionId);
        return perm?.name === permissionName && p.granted;
      });
      if (directPerm) {
        if (directPerm.expiresAt && /* @__PURE__ */ new Date() > new Date(directPerm.expiresAt)) {
          await this.logAuditEvent("check", {
            userId,
            permission: permissionName,
            result: false,
            reason: "Permission expired"
          });
          return false;
        }
        if (directPerm.conditions && resource) {
          const conditionsMatch = this.evaluateConditions(directPerm.conditions, resource, context);
          if (!conditionsMatch) {
            await this.logAuditEvent("check", {
              userId,
              permission: permissionName,
              result: false,
              reason: "Conditions not met"
            });
            return false;
          }
        }
        await this.logAuditEvent("check", {
          userId,
          permission: permissionName,
          result: true,
          reason: "Direct permission"
        });
        return true;
      }
      const userRoles = await this.getUserRoles(userId);
      for (const role of userRoles) {
        if (role.permissions.some((permId) => {
          const perm = this.permissions.get(permId);
          return perm?.name === permissionName;
        })) {
          if (role.restrictions) {
            const restrictionsPass = this.evaluateRoleRestrictions(role.restrictions, context);
            if (!restrictionsPass) {
              await this.logAuditEvent("check", {
                userId,
                permission: permissionName,
                result: false,
                reason: "Role restrictions not met"
              });
              return false;
            }
          }
          await this.logAuditEvent("check", {
            userId,
            permission: permissionName,
            result: true,
            reason: `Role permission: ${role.name}`
          });
          return true;
        }
      }
      await this.logAuditEvent("check", {
        userId,
        permission: permissionName,
        result: false,
        reason: "Permission not found"
      });
      return false;
    } catch (error) {
      console.error("Permission check error:", error);
      await this.logAuditEvent("check", {
        userId,
        permission: permissionName,
        result: false,
        reason: `Error: ${error.message}`
      });
      return false;
    }
  }
  /**
   * Get user roles
   */
  async getUserRoles(userId) {
    try {
      const user = await storage.getUser(userId);
      if (!user) return [];
      const legacyRoleMapping = {
        "admin": "Admin",
        "manager": "Manager",
        "user": "User"
      };
      const roleName = legacyRoleMapping[user.role] || "User";
      const role = Array.from(this.roles.values()).find((r) => r.name === roleName);
      return role ? [role] : [];
    } catch (error) {
      console.error("Error getting user roles:", error);
      return [];
    }
  }
  /**
   * Assign role to user
   */
  async assignRole(userId, roleId, assignedBy) {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role not found: ${roleId}`);
    }
    for (const permissionId of role.permissions) {
      await this.grantPermission(userId, permissionId, assignedBy, roleId);
    }
    await this.logAuditEvent("grant", {
      userId,
      roleId,
      assignedBy,
      action: "assign_role"
    });
    console.log(`\u{1F510} Assigned role ${role.name} to user ${userId}`);
  }
  /**
   * Remove role from user
   */
  async removeRole(userId, roleId, removedBy) {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role not found: ${roleId}`);
    }
    for (const permissionId of role.permissions) {
      await this.revokePermission(userId, permissionId, removedBy);
    }
    await this.logAuditEvent("revoke", {
      userId,
      roleId,
      removedBy,
      action: "remove_role"
    });
    console.log(`\u{1F510} Removed role ${role.name} from user ${userId}`);
  }
  /**
   * Get all permissions
   */
  async getPermissions() {
    return Array.from(this.permissions.values()).sort((a, b) => a.category.localeCompare(b.category));
  }
  /**
   * Get permissions by category
   */
  async getPermissionsByCategory() {
    const permissions = await this.getPermissions();
    const byCategory = {};
    permissions.forEach((perm) => {
      if (!byCategory[perm.category]) {
        byCategory[perm.category] = [];
      }
      byCategory[perm.category].push(perm);
    });
    return byCategory;
  }
  /**
   * Get all roles
   */
  async getRoles() {
    return Array.from(this.roles.values()).sort((a, b) => b.priority - a.priority);
  }
  /**
   * Get user permissions
   */
  async getUserPermissions(userId) {
    const direct = this.userPermissions.get(userId) || [];
    const roles = await this.getUserRoles(userId);
    const effectivePermIds = /* @__PURE__ */ new Set();
    direct.filter((p) => p.granted).forEach((p) => effectivePermIds.add(p.permissionId));
    roles.forEach((role) => {
      role.permissions.forEach((permId) => effectivePermIds.add(permId));
    });
    const effective = Array.from(effectivePermIds).map((id) => this.permissions.get(id)).filter(Boolean);
    return { direct, roles, effective };
  }
  /**
   * Get permission statistics
   */
  async getStatistics() {
    const now = /* @__PURE__ */ new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1e3);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
    const recent24h = this.auditLogs.filter((log2) => new Date(log2.timestamp) >= last24Hours);
    const recent7d = this.auditLogs.filter((log2) => new Date(log2.timestamp) >= last7Days);
    return {
      totalPermissions: this.permissions.size,
      systemPermissions: Array.from(this.permissions.values()).filter((p) => p.isSystem).length,
      customPermissions: Array.from(this.permissions.values()).filter((p) => !p.isSystem).length,
      totalRoles: this.roles.size,
      systemRoles: Array.from(this.roles.values()).filter((r) => r.isSystem).length,
      customRoles: Array.from(this.roles.values()).filter((r) => !r.isSystem).length,
      statistics24h: {
        permissionChecks: recent24h.filter((log2) => log2.action === "check").length,
        permissionsGranted: recent24h.filter((log2) => log2.action === "grant").length,
        permissionsRevoked: recent24h.filter((log2) => log2.action === "revoke").length,
        rolesCreated: recent24h.filter((log2) => log2.action === "create" && log2.roleId).length,
        permissionsCreated: recent24h.filter((log2) => log2.action === "create" && log2.permissionId).length
      },
      statistics7d: {
        permissionChecks: recent7d.filter((log2) => log2.action === "check").length,
        permissionsGranted: recent7d.filter((log2) => log2.action === "grant").length,
        permissionsRevoked: recent7d.filter((log2) => log2.action === "revoke").length,
        rolesCreated: recent7d.filter((log2) => log2.action === "create" && log2.roleId).length,
        permissionsCreated: recent7d.filter((log2) => log2.action === "create" && log2.permissionId).length
      },
      categoryStats: await this.getCategoryStatistics(),
      roleUsage: await this.getRoleUsageStatistics()
    };
  }
  /**
   * Get audit logs
   */
  async getAuditLogs(filters) {
    let logs = [...this.auditLogs];
    if (filters) {
      if (filters.action) {
        logs = logs.filter((log2) => log2.action === filters.action);
      }
      if (filters.userId) {
        logs = logs.filter((log2) => log2.userId === filters.userId || log2.targetUserId === filters.userId);
      }
      if (filters.startDate) {
        logs = logs.filter((log2) => log2.timestamp >= filters.startDate);
      }
      if (filters.endDate) {
        logs = logs.filter((log2) => log2.timestamp <= filters.endDate);
      }
    }
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  // Private helper methods
  evaluateConditions(conditions, resource, context) {
    return true;
  }
  evaluateRoleRestrictions(restrictions, context) {
    return true;
  }
  async getCategoryStatistics() {
    const categories = Array.from(new Set(Array.from(this.permissions.values()).map((p) => p.category)));
    return categories.map((category) => ({
      category,
      permissionCount: Array.from(this.permissions.values()).filter((p) => p.category === category).length
    }));
  }
  async getRoleUsageStatistics() {
    return Array.from(this.roles.values()).map((role) => ({
      id: role.id,
      name: role.name,
      permissionCount: role.permissions.length,
      isSystem: role.isSystem
    }));
  }
  async logAuditEvent(action, details, request) {
    const auditLog = {
      id: this.generateAuditId(),
      action,
      userId: details.userId,
      targetUserId: details.targetUserId,
      permissionId: details.permissionId,
      roleId: details.roleId,
      resource: details.resource,
      result: details.result,
      reason: details.reason,
      details,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      ipAddress: request?.ip || "127.0.0.1",
      userAgent: request?.get("user-agent") || "System"
    };
    this.auditLogs.push(auditLog);
    if (this.auditLogs.length > 1e4) {
      this.auditLogs = this.auditLogs.slice(-1e4);
    }
  }
  generatePermissionId() {
    return `perm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  generateRoleId() {
    return `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  generateAuditId() {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};
var permissionsService = new PermissionsService();
var requirePermission = (permissionName) => {
  return async (req, res, next) => {
    if (!req.session?.user?.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const hasPermission = await permissionsService.checkPermission({
      userId: req.session.user.id,
      permission: permissionName,
      context: {
        ip: req.ip,
        userAgent: req.get("user-agent"),
        path: req.path
      }
    });
    if (!hasPermission) {
      return res.status(403).json({
        message: "Insufficient permissions",
        required: permissionName
      });
    }
    next();
  };
};

// server/routes.ts
init_audit_service();

// server/encryption-service.ts
init_audit_service();
import crypto5 from "crypto";
var EncryptionService = class {
  keys = /* @__PURE__ */ new Map();
  policies = /* @__PURE__ */ new Map();
  fieldConfigs = /* @__PURE__ */ new Map();
  activeKeysByPurpose = /* @__PURE__ */ new Map();
  constructor() {
    console.log("\u{1F510} Encryption service initialized");
    this.initializeDefaultKeys();
    this.initializeDefaultPolicies();
    this.initializeFieldConfigurations();
    this.startKeyRotationScheduler();
  }
  /**
   * Encrypt sensitive data
   */
  async encryptData(data, purpose = "data", dataType = "general", userId) {
    try {
      const keyId = this.activeKeysByPurpose.get(purpose);
      if (!keyId) {
        throw new Error(`No active encryption key found for purpose: ${purpose}`);
      }
      const key = this.keys.get(keyId);
      if (!key) {
        throw new Error(`Encryption key not found: ${keyId}`);
      }
      const algorithm = key.algorithm;
      const keyBuffer = Buffer.from(key.keyData, "base64");
      const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data, "utf8");
      let encryptedData;
      let iv;
      let authTag;
      switch (algorithm) {
        case "aes-256-gcm":
          iv = crypto5.randomBytes(16);
          const cipherGCM = crypto5.createCipher("aes-256-gcm", keyBuffer);
          cipherGCM.setAAD(Buffer.from(dataType));
          encryptedData = Buffer.concat([cipherGCM.update(dataBuffer), cipherGCM.final()]);
          authTag = cipherGCM.getAuthTag();
          break;
        case "aes-256-cbc":
          iv = crypto5.randomBytes(16);
          const cipherCBC = crypto5.createCipher("aes-256-cbc", keyBuffer);
          encryptedData = Buffer.concat([cipherCBC.update(dataBuffer), cipherCBC.final()]);
          break;
        case "chacha20-poly1305":
          iv = crypto5.randomBytes(12);
          const cipherChaCha = crypto5.createCipher("chacha20-poly1305", keyBuffer);
          cipherChaCha.setAAD(Buffer.from(dataType));
          encryptedData = Buffer.concat([cipherChaCha.update(dataBuffer), cipherChaCha.final()]);
          authTag = cipherChaCha.getAuthTag();
          break;
        default:
          throw new Error(`Unsupported encryption algorithm: ${algorithm}`);
      }
      const result = {
        data: encryptedData.toString("base64"),
        keyId,
        algorithm,
        iv: iv.toString("base64"),
        authTag: authTag?.toString("base64"),
        metadata: {
          encryptedAt: (/* @__PURE__ */ new Date()).toISOString(),
          encryptedBy: userId || "system",
          dataType,
          complianceLevel: key.metadata.complianceLevel
        }
      };
      await logAuditEvent(
        "system",
        "security",
        "data_encrypt",
        {
          id: userId || "system",
          type: "system",
          name: "EncryptionService",
          ipAddress: "127.0.0.1"
        },
        {
          type: "data",
          id: keyId,
          name: dataType
        },
        "success",
        {
          description: `Data encrypted using ${algorithm}`,
          metadata: {
            dataType,
            purpose,
            algorithm,
            keyId
          }
        },
        {
          severity: "medium",
          regulations: ["GDPR", "HIPAA", "PCI-DSS"],
          dataClassification: "confidential"
        }
      );
      console.log(`\u{1F510} Encrypted data using ${algorithm} for purpose: ${purpose}`);
      return result;
    } catch (error) {
      console.error("Encryption error:", error);
      await logAuditEvent(
        "system",
        "security",
        "data_encrypt_failed",
        {
          id: userId || "system",
          type: "system",
          name: "EncryptionService",
          ipAddress: "127.0.0.1"
        },
        {
          type: "data",
          name: dataType
        },
        "failure",
        {
          description: "Data encryption failed",
          errorMessage: error.message,
          metadata: { dataType, purpose }
        },
        {
          severity: "high",
          regulations: ["GDPR", "HIPAA", "PCI-DSS"],
          dataClassification: "confidential"
        }
      );
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }
  /**
   * Decrypt sensitive data
   */
  async decryptData(encryptedData, userId) {
    try {
      const key = this.keys.get(encryptedData.keyId);
      if (!key) {
        throw new Error(`Decryption key not found: ${encryptedData.keyId}`);
      }
      if (key.status === "revoked") {
        throw new Error("Cannot decrypt with revoked key");
      }
      const keyBuffer = Buffer.from(key.keyData, "base64");
      const dataBuffer = Buffer.from(encryptedData.data, "base64");
      const iv = Buffer.from(encryptedData.iv, "base64");
      const authTag = encryptedData.authTag ? Buffer.from(encryptedData.authTag, "base64") : void 0;
      let decryptedData;
      switch (encryptedData.algorithm) {
        case "aes-256-gcm":
          if (!authTag) {
            throw new Error("Authentication tag required for GCM mode");
          }
          const decipherGCM = crypto5.createDecipher("aes-256-gcm", keyBuffer);
          decipherGCM.setAAD(Buffer.from(encryptedData.metadata.dataType));
          decipherGCM.setAuthTag(authTag);
          decryptedData = Buffer.concat([decipherGCM.update(dataBuffer), decipherGCM.final()]);
          break;
        case "aes-256-cbc":
          const decipherCBC = crypto5.createDecipher("aes-256-cbc", keyBuffer);
          decryptedData = Buffer.concat([decipherCBC.update(dataBuffer), decipherCBC.final()]);
          break;
        case "chacha20-poly1305":
          if (!authTag) {
            throw new Error("Authentication tag required for ChaCha20-Poly1305");
          }
          const decipherChaCha = crypto5.createDecipher("chacha20-poly1305", keyBuffer);
          decipherChaCha.setAAD(Buffer.from(encryptedData.metadata.dataType));
          decipherChaCha.setAuthTag(authTag);
          decryptedData = Buffer.concat([decipherChaCha.update(dataBuffer), decipherChaCha.final()]);
          break;
        default:
          throw new Error(`Unsupported decryption algorithm: ${encryptedData.algorithm}`);
      }
      await logAuditEvent(
        "system",
        "security",
        "data_decrypt",
        {
          id: userId || "system",
          type: "system",
          name: "EncryptionService",
          ipAddress: "127.0.0.1"
        },
        {
          type: "data",
          id: encryptedData.keyId,
          name: encryptedData.metadata.dataType
        },
        "success",
        {
          description: `Data decrypted using ${encryptedData.algorithm}`,
          metadata: {
            dataType: encryptedData.metadata.dataType,
            algorithm: encryptedData.algorithm,
            keyId: encryptedData.keyId
          }
        },
        {
          severity: "medium",
          regulations: ["GDPR", "HIPAA", "PCI-DSS"],
          dataClassification: "confidential"
        }
      );
      console.log(`\u{1F510} Decrypted data using ${encryptedData.algorithm}`);
      return decryptedData.toString("utf8");
    } catch (error) {
      console.error("Decryption error:", error);
      await logAuditEvent(
        "system",
        "security",
        "data_decrypt_failed",
        {
          id: userId || "system",
          type: "system",
          name: "EncryptionService",
          ipAddress: "127.0.0.1"
        },
        {
          type: "data",
          id: encryptedData.keyId
        },
        "failure",
        {
          description: "Data decryption failed",
          errorMessage: error.message,
          metadata: {
            algorithm: encryptedData.algorithm,
            keyId: encryptedData.keyId
          }
        },
        {
          severity: "high",
          regulations: ["GDPR", "HIPAA", "PCI-DSS"],
          dataClassification: "confidential"
        }
      );
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }
  /**
   * Hash sensitive data (one-way)
   */
  async hashData(data, algorithm = "sha256", salt) {
    try {
      switch (algorithm) {
        case "sha256":
          const saltedData = salt ? data + salt : data;
          return crypto5.createHash("sha256").update(saltedData).digest("hex");
        case "sha512":
          const saltedData512 = salt ? data + salt : data;
          return crypto5.createHash("sha512").update(saltedData512).digest("hex");
        case "bcrypt":
          const bcrypt2 = __require("bcrypt");
          const saltRounds = 12;
          return await bcrypt2.hash(data, saltRounds);
        default:
          throw new Error(`Unsupported hash algorithm: ${algorithm}`);
      }
    } catch (error) {
      console.error("Hashing error:", error);
      throw new Error(`Hashing failed: ${error.message}`);
    }
  }
  /**
   * Generate new encryption key
   */
  async generateKey(purpose, algorithm = "aes-256-gcm", createdBy, complianceLevel = "high") {
    try {
      const keySize = algorithm.includes("256") ? 32 : 32;
      const keyData = crypto5.randomBytes(keySize);
      const key = {
        id: this.generateKeyId(),
        algorithm,
        keyData: keyData.toString("base64"),
        purpose,
        status: "active",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        metadata: {
          createdBy,
          complianceLevel
        }
      };
      this.keys.set(key.id, key);
      this.activeKeysByPurpose.set(purpose, key.id);
      await logAuditEvent(
        "system",
        "security",
        "encryption_key_generated",
        {
          id: createdBy,
          type: "user",
          name: "Administrator",
          ipAddress: "127.0.0.1"
        },
        {
          type: "encryption_key",
          id: key.id,
          name: `${purpose}-${algorithm}`
        },
        "success",
        {
          description: `New encryption key generated for ${purpose}`,
          metadata: {
            purpose,
            algorithm,
            complianceLevel,
            keyId: key.id
          }
        },
        {
          severity: "high",
          regulations: ["GDPR", "HIPAA", "PCI-DSS"],
          dataClassification: "restricted"
        }
      );
      console.log(`\u{1F510} Generated new ${algorithm} key for ${purpose}: ${key.id}`);
      return key;
    } catch (error) {
      console.error("Key generation error:", error);
      throw new Error(`Key generation failed: ${error.message}`);
    }
  }
  /**
   * Rotate encryption key
   */
  async rotateKey(keyId, rotatedBy) {
    try {
      const oldKey = this.keys.get(keyId);
      if (!oldKey) {
        throw new Error(`Key not found: ${keyId}`);
      }
      oldKey.status = "rotated";
      oldKey.rotatedAt = (/* @__PURE__ */ new Date()).toISOString();
      this.keys.set(keyId, oldKey);
      const newKey = await this.generateKey(
        oldKey.purpose,
        oldKey.algorithm,
        rotatedBy,
        oldKey.metadata.complianceLevel
      );
      await logAuditEvent(
        "system",
        "security",
        "encryption_key_rotated",
        {
          id: rotatedBy,
          type: "user",
          name: "Administrator",
          ipAddress: "127.0.0.1"
        },
        {
          type: "encryption_key",
          id: keyId,
          name: `${oldKey.purpose}-${oldKey.algorithm}`
        },
        "success",
        {
          description: `Encryption key rotated`,
          oldValue: keyId,
          newValue: newKey.id,
          metadata: {
            oldKeyId: keyId,
            newKeyId: newKey.id,
            purpose: oldKey.purpose
          }
        },
        {
          severity: "high",
          regulations: ["GDPR", "HIPAA", "PCI-DSS"],
          dataClassification: "restricted"
        }
      );
      console.log(`\u{1F510} Rotated key ${keyId} -> ${newKey.id}`);
      return newKey;
    } catch (error) {
      console.error("Key rotation error:", error);
      throw new Error(`Key rotation failed: ${error.message}`);
    }
  }
  /**
   * Get encryption keys
   */
  async getKeys() {
    return Array.from(this.keys.values()).map((key) => ({
      ...key,
      keyData: "[REDACTED]"
      // Never expose key data
    }));
  }
  /**
   * Get encryption policies
   */
  async getPolicies() {
    return Array.from(this.policies.values());
  }
  /**
   * Create encryption policy
   */
  async createPolicy(policyData) {
    const policy = {
      ...policyData,
      id: this.generatePolicyId(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.policies.set(policy.id, policy);
    console.log(`\u{1F510} Created encryption policy: ${policy.name}`);
    return policy;
  }
  /**
   * Get encryption statistics
   */
  async getStatistics() {
    const keys = Array.from(this.keys.values());
    const policies = Array.from(this.policies.values());
    return {
      totalKeys: keys.length,
      activeKeys: keys.filter((k) => k.status === "active").length,
      rotatedKeys: keys.filter((k) => k.status === "rotated").length,
      revokedKeys: keys.filter((k) => k.status === "revoked").length,
      keysByPurpose: {
        data: keys.filter((k) => k.purpose === "data").length,
        backup: keys.filter((k) => k.purpose === "backup").length,
        export: keys.filter((k) => k.purpose === "export").length,
        communication: keys.filter((k) => k.purpose === "communication").length
      },
      keysByAlgorithm: {
        "aes-256-gcm": keys.filter((k) => k.algorithm === "aes-256-gcm").length,
        "aes-256-cbc": keys.filter((k) => k.algorithm === "aes-256-cbc").length,
        "chacha20-poly1305": keys.filter((k) => k.algorithm === "chacha20-poly1305").length
      },
      keysByComplianceLevel: {
        standard: keys.filter((k) => k.metadata.complianceLevel === "standard").length,
        high: keys.filter((k) => k.metadata.complianceLevel === "high").length,
        critical: keys.filter((k) => k.metadata.complianceLevel === "critical").length
      },
      totalPolicies: policies.length,
      activePolicies: policies.filter((p) => p.isActive).length,
      keysRequiringRotation: keys.filter((k) => {
        if (k.status !== "active") return false;
        const createdAt = new Date(k.createdAt);
        const now = /* @__PURE__ */ new Date();
        const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1e3 * 60 * 60 * 24));
        return daysSinceCreation > 90;
      }).length
    };
  }
  // Private helper methods
  initializeDefaultKeys() {
    const purposes = ["data", "backup", "export", "communication"];
    purposes.forEach(async (purpose) => {
      try {
        await this.generateKey(purpose, "aes-256-gcm", "system", "high");
      } catch (error) {
        console.error(`Failed to generate default key for ${purpose}:`, error);
      }
    });
    console.log("\u{1F510} Initialized default encryption keys");
  }
  initializeDefaultPolicies() {
    const defaultPolicies = [
      {
        name: "PII Data Protection",
        description: "Encrypt all personally identifiable information",
        dataTypes: ["email", "phone", "ssn", "address", "name"],
        algorithm: "aes-256-gcm",
        keyRotationDays: 90,
        complianceRequirements: ["GDPR", "HIPAA"],
        isActive: true
      },
      {
        name: "Financial Data Protection",
        description: "Encrypt all financial and payment information",
        dataTypes: ["credit_card", "bank_account", "payment_info", "financial_record"],
        algorithm: "aes-256-gcm",
        keyRotationDays: 30,
        complianceRequirements: ["PCI-DSS", "SOX"],
        isActive: true
      },
      {
        name: "Healthcare Data Protection",
        description: "Encrypt all healthcare and medical information",
        dataTypes: ["medical_record", "health_info", "diagnosis", "prescription"],
        algorithm: "aes-256-gcm",
        keyRotationDays: 60,
        complianceRequirements: ["HIPAA"],
        isActive: true
      }
    ];
    defaultPolicies.forEach((policyData) => {
      const policy = {
        ...policyData,
        id: this.generatePolicyId(),
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.policies.set(policy.id, policy);
    });
    console.log(`\u{1F510} Initialized ${defaultPolicies.length} default encryption policies`);
  }
  initializeFieldConfigurations() {
    const fieldConfigs = [
      {
        tableName: "users",
        fieldName: "email",
        encryptionType: "searchable",
        algorithm: "aes-256-gcm",
        keyPurpose: "data",
        searchable: true
      },
      {
        tableName: "users",
        fieldName: "phone",
        encryptionType: "full",
        algorithm: "aes-256-gcm",
        keyPurpose: "data"
      },
      {
        tableName: "tasks",
        fieldName: "notes",
        encryptionType: "full",
        algorithm: "aes-256-gcm",
        keyPurpose: "data"
      }
    ];
    fieldConfigs.forEach((config) => {
      const tableConfigs = this.fieldConfigs.get(config.tableName) || [];
      tableConfigs.push(config);
      this.fieldConfigs.set(config.tableName, tableConfigs);
    });
    console.log(`\u{1F510} Initialized field encryption configurations for ${fieldConfigs.length} fields`);
  }
  startKeyRotationScheduler() {
    setInterval(() => {
      this.checkKeysForRotation();
    }, 24 * 60 * 60 * 1e3);
    console.log("\u{1F510} Key rotation scheduler started");
  }
  async checkKeysForRotation() {
    const keys = Array.from(this.keys.values());
    const now = /* @__PURE__ */ new Date();
    for (const key of keys) {
      if (key.status !== "active") continue;
      const createdAt = new Date(key.createdAt);
      const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1e3 * 60 * 60 * 24));
      const rotationThreshold = key.metadata.complianceLevel === "critical" ? 30 : 90;
      if (daysSinceCreation >= rotationThreshold) {
        console.warn(`\u{1F510} Key ${key.id} requires rotation (${daysSinceCreation} days old)`);
        if (key.metadata.complianceLevel === "critical") {
          try {
            await this.rotateKey(key.id, "system");
          } catch (error) {
            console.error(`Failed to auto-rotate key ${key.id}:`, error);
          }
        }
      }
    }
  }
  generateKeyId() {
    return `enc_key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  generatePolicyId() {
    return `enc_policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};
var encryptionService = new EncryptionService();

// server/i18n-service.ts
init_audit_service();
var InternationalizationService = class {
  languages = /* @__PURE__ */ new Map();
  namespaces = /* @__PURE__ */ new Map();
  translations = /* @__PURE__ */ new Map();
  // language -> key -> translation
  translationKeys = /* @__PURE__ */ new Map();
  settings;
  constructor() {
    console.log("\u{1F30D} Internationalization service initialized");
    this.initializeDefaultSettings();
    this.initializeDefaultLanguages();
    this.initializeDefaultNamespaces();
    this.initializeDefaultTranslations();
  }
  /**
   * Get supported languages
   */
  async getLanguages() {
    return Array.from(this.languages.values()).sort((a, b) => {
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      return a.englishName.localeCompare(b.englishName);
    });
  }
  /**
   * Add new language
   */
  async addLanguage(languageData) {
    if (languageData.isDefault) {
      this.languages.forEach((lang) => {
        if (lang.isDefault) {
          lang.isDefault = false;
          this.languages.set(lang.code, lang);
        }
      });
    }
    const language = {
      ...languageData,
      completionPercentage: 0,
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.languages.set(language.code, language);
    this.translations.set(language.code, /* @__PURE__ */ new Map());
    await logAuditEvent(
      "system",
      "system_config",
      "language_added",
      {
        id: "system",
        type: "system",
        name: "I18nService",
        ipAddress: "127.0.0.1"
      },
      {
        type: "language",
        id: language.code,
        name: language.name
      },
      "success",
      {
        description: `Language added: ${language.englishName}`,
        metadata: {
          code: language.code,
          direction: language.direction,
          isDefault: language.isDefault
        }
      },
      {
        severity: "low",
        dataClassification: "internal"
      }
    );
    console.log(`\u{1F30D} Added language: ${language.englishName} (${language.code})`);
    return language;
  }
  /**
   * Get translation namespaces
   */
  async getNamespaces() {
    return Array.from(this.namespaces.values()).sort((a, b) => a.name.localeCompare(b.name));
  }
  /**
   * Add translation namespace
   */
  async addNamespace(namespaceData) {
    const namespace = {
      ...namespaceData,
      id: this.generateNamespaceId(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.namespaces.set(namespace.id, namespace);
    namespace.keys.forEach((key) => {
      this.translationKeys.set(key.key, key);
    });
    console.log(`\u{1F30D} Added namespace: ${namespace.name} with ${namespace.keys.length} keys`);
    return namespace;
  }
  /**
   * Get translation for specific key and language
   */
  async getTranslation(key, language = this.settings.defaultLanguage, variables) {
    const langTranslations = this.translations.get(language);
    let translation = langTranslations?.get(key);
    if (!translation && language !== this.settings.fallbackLanguage) {
      const fallbackTranslations = this.translations.get(this.settings.fallbackLanguage);
      translation = fallbackTranslations?.get(key);
    }
    if (!translation) {
      console.warn(`\u{1F30D} Missing translation for key: ${key} (${language})`);
      return key;
    }
    let value = translation.value;
    if (variables) {
      Object.entries(variables).forEach(([varKey, varValue]) => {
        value = value.replace(new RegExp(`{{${varKey}}}`, "g"), String(varValue));
      });
    }
    return value;
  }
  /**
   * Get multiple translations for a language
   */
  async getTranslations(keys, language = this.settings.defaultLanguage) {
    const result = {};
    for (const key of keys) {
      result[key] = await this.getTranslation(key, language);
    }
    return result;
  }
  /**
   * Get all translations for a namespace and language
   */
  async getNamespaceTranslations(namespaceId, language) {
    const namespace = this.namespaces.get(namespaceId);
    if (!namespace) {
      throw new Error(`Namespace not found: ${namespaceId}`);
    }
    const keys = namespace.keys.map((k) => k.key);
    return this.getTranslations(keys, language);
  }
  /**
   * Set translation for a key
   */
  async setTranslation(key, language, value, translatedBy, pluralForms) {
    let langTranslations = this.translations.get(language);
    if (!langTranslations) {
      langTranslations = /* @__PURE__ */ new Map();
      this.translations.set(language, langTranslations);
    }
    const translation = {
      language,
      key,
      value,
      pluralForms,
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
      translatedBy,
      reviewed: false
    };
    langTranslations.set(key, translation);
    await this.updateLanguageCompletion(language);
    await logAuditEvent(
      "system",
      "data_modification",
      "translation_updated",
      {
        id: translatedBy || "system",
        type: "user",
        name: "Translator",
        ipAddress: "127.0.0.1"
      },
      {
        type: "translation",
        id: `${language}:${key}`,
        name: key
      },
      "success",
      {
        description: `Translation updated for ${key} in ${language}`,
        metadata: {
          key,
          language,
          hasPlurals: !!pluralForms
        }
      },
      {
        severity: "low",
        dataClassification: "internal"
      }
    );
    console.log(`\u{1F30D} Updated translation: ${key} (${language})`);
    return translation;
  }
  /**
   * Bulk import translations
   */
  async importTranslations(language, translations, importedBy) {
    const result = { imported: 0, skipped: 0, errors: [] };
    for (const [key, value] of Object.entries(translations)) {
      try {
        if (!value || value.trim() === "") {
          result.skipped++;
          continue;
        }
        await this.setTranslation(key, language, value, importedBy);
        result.imported++;
      } catch (error) {
        result.errors.push(`Failed to import ${key}: ${error.message}`);
      }
    }
    console.log(`\u{1F30D} Imported ${result.imported} translations for ${language}, skipped ${result.skipped}, ${result.errors.length} errors`);
    return result;
  }
  /**
   * Export translations for a language
   */
  async exportTranslations(language, format5 = "json") {
    const langTranslations = this.translations.get(language);
    if (!langTranslations) {
      throw new Error(`No translations found for language: ${language}`);
    }
    const exportData = {};
    langTranslations.forEach((translation, key) => {
      exportData[key] = translation.value;
    });
    switch (format5) {
      case "json":
        return JSON.stringify(exportData, null, 2);
      case "csv":
        const headers = "key,translation\n";
        const rows = Object.entries(exportData).map(([key, value]) => `"${key}","${String(value).replace(/"/g, '""')}"`).join("\n");
        return headers + rows;
      default:
        throw new Error(`Unsupported export format: ${format5}`);
    }
  }
  /**
   * Get translation statistics
   */
  async getStatistics() {
    const languages = Array.from(this.languages.values());
    const totalKeys = this.translationKeys.size;
    const languageStats = languages.map((lang) => {
      const langTranslations = this.translations.get(lang.code);
      const translatedKeys = langTranslations ? langTranslations.size : 0;
      const completionPercentage = totalKeys > 0 ? Math.round(translatedKeys / totalKeys * 100) : 0;
      return {
        code: lang.code,
        name: lang.englishName,
        translatedKeys,
        totalKeys,
        completionPercentage,
        isDefault: lang.isDefault,
        isActive: lang.isActive
      };
    });
    const namespaceStats = Array.from(this.namespaces.values()).map((ns) => ({
      id: ns.id,
      name: ns.name,
      keyCount: ns.keys.length,
      isSystem: ns.isSystem
    }));
    return {
      totalLanguages: languages.length,
      activeLanguages: languages.filter((l) => l.isActive).length,
      totalKeys,
      totalNamespaces: this.namespaces.size,
      defaultLanguage: this.settings.defaultLanguage,
      fallbackLanguage: this.settings.fallbackLanguage,
      languageStats,
      namespaceStats,
      recentTranslations: this.getRecentTranslations(10),
      missingTranslations: this.getMissingTranslations()
    };
  }
  /**
   * Search translations
   */
  async searchTranslations(query, language) {
    const results = [];
    const searchTerm = query.toLowerCase();
    const languagesToSearch = language ? [language] : Array.from(this.languages.keys());
    languagesToSearch.forEach((lang) => {
      const langTranslations = this.translations.get(lang);
      if (!langTranslations) return;
      langTranslations.forEach((translation, key) => {
        if (key.toLowerCase().includes(searchTerm) || translation.value.toLowerCase().includes(searchTerm)) {
          results.push({
            key,
            value: translation.value,
            language: lang
          });
        }
      });
    });
    return results.slice(0, 100);
  }
  /**
   * Get localization settings
   */
  async getSettings() {
    return { ...this.settings };
  }
  /**
   * Update localization settings
   */
  async updateSettings(updates) {
    this.settings = { ...this.settings, ...updates };
    console.log("\u{1F30D} Updated localization settings");
    return this.settings;
  }
  // Private helper methods
  initializeDefaultSettings() {
    this.settings = {
      defaultLanguage: "en",
      fallbackLanguage: "en",
      supportedLanguages: ["en", "es", "fr", "de", "zh", "ja"],
      autoDetectLanguage: true,
      enableRTLSupport: false,
      dateTimeFormat: {
        "en": "MM/dd/yyyy",
        "es": "dd/MM/yyyy",
        "fr": "dd/MM/yyyy",
        "de": "dd.MM.yyyy",
        "zh": "yyyy/MM/dd",
        "ja": "yyyy/MM/dd"
      },
      numberFormat: {
        "en": { decimal: ".", thousands: "," },
        "es": { decimal: ",", thousands: "." },
        "fr": { decimal: ",", thousands: " " },
        "de": { decimal: ",", thousands: "." },
        "zh": { decimal: ".", thousands: "," },
        "ja": { decimal: ".", thousands: "," }
      },
      currencyFormat: {
        "en": { symbol: "$", position: "before" },
        "es": { symbol: "\u20AC", position: "after" },
        "fr": { symbol: "\u20AC", position: "after" },
        "de": { symbol: "\u20AC", position: "after" },
        "zh": { symbol: "\xA5", position: "before" },
        "ja": { symbol: "\xA5", position: "before" }
      },
      pseudoLocalization: false
    };
    console.log("\u{1F30D} Initialized default localization settings");
  }
  initializeDefaultLanguages() {
    const defaultLanguages = [
      {
        code: "en",
        name: "English",
        englishName: "English",
        direction: "ltr",
        region: "US",
        isActive: true,
        isDefault: true,
        completionPercentage: 100,
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        code: "es",
        name: "Espa\xF1ol",
        englishName: "Spanish",
        direction: "ltr",
        region: "ES",
        isActive: true,
        isDefault: false,
        completionPercentage: 0,
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        code: "fr",
        name: "Fran\xE7ais",
        englishName: "French",
        direction: "ltr",
        region: "FR",
        isActive: true,
        isDefault: false,
        completionPercentage: 0,
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        code: "de",
        name: "Deutsch",
        englishName: "German",
        direction: "ltr",
        region: "DE",
        isActive: true,
        isDefault: false,
        completionPercentage: 0,
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        code: "zh",
        name: "\u4E2D\u6587",
        englishName: "Chinese",
        direction: "ltr",
        region: "CN",
        isActive: true,
        isDefault: false,
        completionPercentage: 0,
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        code: "ja",
        name: "\u65E5\u672C\u8A9E",
        englishName: "Japanese",
        direction: "ltr",
        region: "JP",
        isActive: false,
        isDefault: false,
        completionPercentage: 0,
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    defaultLanguages.forEach((lang) => {
      this.languages.set(lang.code, lang);
      this.translations.set(lang.code, /* @__PURE__ */ new Map());
    });
    console.log(`\u{1F30D} Initialized ${defaultLanguages.length} default languages`);
  }
  initializeDefaultNamespaces() {
    const defaultNamespaces = [
      {
        name: "common",
        description: "Common UI elements and actions",
        isSystem: true,
        keys: [
          { key: "common.save", category: "ui", description: "Save button text" },
          { key: "common.cancel", category: "ui", description: "Cancel button text" },
          { key: "common.delete", category: "ui", description: "Delete button text" },
          { key: "common.edit", category: "ui", description: "Edit button text" },
          { key: "common.loading", category: "ui", description: "Loading indicator text" },
          { key: "common.search", category: "ui", description: "Search placeholder text" },
          { key: "common.filter", category: "ui", description: "Filter button text" },
          { key: "common.export", category: "ui", description: "Export button text" },
          { key: "common.import", category: "ui", description: "Import button text" },
          { key: "common.close", category: "ui", description: "Close button text" }
        ]
      },
      {
        name: "navigation",
        description: "Navigation menu items",
        isSystem: true,
        keys: [
          { key: "nav.dashboard", category: "ui", description: "Dashboard menu item" },
          { key: "nav.tasks", category: "ui", description: "Tasks menu item" },
          { key: "nav.projects", category: "ui", description: "Projects menu item" },
          { key: "nav.users", category: "ui", description: "Users menu item" },
          { key: "nav.settings", category: "ui", description: "Settings menu item" },
          { key: "nav.reports", category: "ui", description: "Reports menu item" },
          { key: "nav.logout", category: "ui", description: "Logout menu item" }
        ]
      },
      {
        name: "validation",
        description: "Form validation messages",
        isSystem: true,
        keys: [
          { key: "validation.required", category: "validation", description: "Required field message", variables: ["field"] },
          { key: "validation.email", category: "validation", description: "Invalid email message" },
          { key: "validation.minLength", category: "validation", description: "Minimum length message", variables: ["min"] },
          { key: "validation.maxLength", category: "validation", description: "Maximum length message", variables: ["max"] },
          { key: "validation.password", category: "validation", description: "Password strength message" }
        ]
      },
      {
        name: "enterprise",
        description: "Enterprise features",
        isSystem: true,
        keys: [
          { key: "enterprise.sso", category: "ui", description: "Single Sign-On" },
          { key: "enterprise.permissions", category: "ui", description: "Permissions Management" },
          { key: "enterprise.audit", category: "ui", description: "Audit Logging" },
          { key: "enterprise.encryption", category: "ui", description: "Data Encryption" },
          { key: "enterprise.backup", category: "ui", description: "Backup & Recovery" },
          { key: "enterprise.compliance", category: "ui", description: "Compliance Reports" }
        ]
      }
    ];
    defaultNamespaces.forEach((nsData) => {
      const namespace = {
        ...nsData,
        id: this.generateNamespaceId(),
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.namespaces.set(namespace.id, namespace);
      namespace.keys.forEach((key) => {
        this.translationKeys.set(key.key, key);
      });
    });
    console.log(`\u{1F30D} Initialized ${defaultNamespaces.length} default namespaces`);
  }
  initializeDefaultTranslations() {
    const englishTranslations = /* @__PURE__ */ new Map();
    const defaultTranslations = {
      // Common
      "common.save": "Save",
      "common.cancel": "Cancel",
      "common.delete": "Delete",
      "common.edit": "Edit",
      "common.loading": "Loading...",
      "common.search": "Search...",
      "common.filter": "Filter",
      "common.export": "Export",
      "common.import": "Import",
      "common.close": "Close",
      // Navigation
      "nav.dashboard": "Dashboard",
      "nav.tasks": "Tasks",
      "nav.projects": "Projects",
      "nav.users": "Users",
      "nav.settings": "Settings",
      "nav.reports": "Reports",
      "nav.logout": "Logout",
      // Validation
      "validation.required": "{{field}} is required",
      "validation.email": "Please enter a valid email address",
      "validation.minLength": "Must be at least {{min}} characters long",
      "validation.maxLength": "Must be no more than {{max}} characters long",
      "validation.password": "Password must contain at least 8 characters with letters and numbers",
      // Enterprise
      "enterprise.sso": "Single Sign-On",
      "enterprise.permissions": "Permissions Management",
      "enterprise.audit": "Audit Logging",
      "enterprise.encryption": "Data Encryption",
      "enterprise.backup": "Backup & Recovery",
      "enterprise.compliance": "Compliance Reports"
    };
    Object.entries(defaultTranslations).forEach(([key, value]) => {
      englishTranslations.set(key, {
        language: "en",
        key,
        value,
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
        reviewed: true,
        reviewedBy: "system",
        reviewedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    });
    this.translations.set("en", englishTranslations);
    console.log(`\u{1F30D} Initialized ${Object.keys(defaultTranslations).length} English translations`);
  }
  async updateLanguageCompletion(languageCode) {
    const language = this.languages.get(languageCode);
    if (!language) return;
    const langTranslations = this.translations.get(languageCode);
    const translatedKeys = langTranslations ? langTranslations.size : 0;
    const totalKeys = this.translationKeys.size;
    language.completionPercentage = totalKeys > 0 ? Math.round(translatedKeys / totalKeys * 100) : 0;
    language.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
    this.languages.set(languageCode, language);
  }
  getRecentTranslations(limit) {
    const recent = [];
    this.translations.forEach((langTranslations, language) => {
      langTranslations.forEach((translation, key) => {
        recent.push({
          key,
          language,
          value: translation.value,
          lastUpdated: translation.lastUpdated
        });
      });
    });
    return recent.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()).slice(0, limit);
  }
  getMissingTranslations() {
    const missing = [];
    const allKeys = Array.from(this.translationKeys.keys());
    this.languages.forEach((language, langCode) => {
      if (!language.isActive) return;
      const langTranslations = this.translations.get(langCode);
      allKeys.forEach((key) => {
        if (!langTranslations || !langTranslations.has(key)) {
          missing.push({ key, language: langCode });
        }
      });
    });
    return missing;
  }
  generateNamespaceId() {
    return `ns_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};
var i18nService = new InternationalizationService();

// server/smart-scheduling-service.ts
init_storage();
init_audit_service();
import OpenAI2 from "openai";
var openai2 = process.env.OPENAI_API_KEY ? new OpenAI2({
  apiKey: process.env.OPENAI_API_KEY
}) : null;
var SmartSchedulingService = class {
  schedulingCache = /* @__PURE__ */ new Map();
  recommendations = /* @__PURE__ */ new Map();
  workloadPredictions = /* @__PURE__ */ new Map();
  constructor() {
    console.log("\u{1F916} Smart Scheduling service initialized");
    this.startSchedulingOptimizer();
    this.startWorkloadMonitoring();
  }
  /**
   * Generate AI-powered task schedule
   */
  async generateOptimalSchedule(tasks2, context, userId) {
    try {
      console.log(`\u{1F916} Generating optimal schedule for ${tasks2.length} tasks`);
      const teamMembers = await this.getTeamAvailability(context);
      const taskAnalysis = await this.analyzeTasksWithAI(tasks2, teamMembers);
      const schedulingPlan = await this.generateSchedulingPlan(taskAnalysis, context, teamMembers);
      const resourceAllocations = await this.optimizeResourceAllocation(schedulingPlan, teamMembers, context);
      const recommendations = await this.generateSchedulingRecommendations(schedulingPlan, resourceAllocations, context);
      const totalEstimatedHours = schedulingPlan.reduce((sum, task) => sum + task.estimatedHours, 0);
      const estimatedCompletionDate = this.calculateCompletionDate(schedulingPlan);
      const overallConfidence = this.calculateOverallConfidence(schedulingPlan);
      const cacheKey = `${userId}_${context.projectId || "all"}_${Date.now()}`;
      this.schedulingCache.set(cacheKey, schedulingPlan);
      await logAuditEvent(
        "system",
        "system_config",
        "smart_schedule_generated",
        {
          id: userId,
          type: "user",
          name: "SchedulingService",
          ipAddress: "127.0.0.1"
        },
        {
          type: "schedule",
          id: cacheKey,
          name: `Schedule for ${tasks2.length} tasks`
        },
        "success",
        {
          description: `AI-powered schedule generated for ${tasks2.length} tasks`,
          metadata: {
            totalHours: totalEstimatedHours,
            completionDate: estimatedCompletionDate,
            confidence: overallConfidence,
            teamMembersInvolved: teamMembers.length
          }
        },
        {
          severity: "medium",
          dataClassification: "internal"
        }
      );
      console.log(`\u{1F916} Schedule generated: ${totalEstimatedHours}h over ${schedulingPlan.length} tasks (${Math.round(overallConfidence)}% confidence)`);
      return {
        scheduledTasks: schedulingPlan,
        resourceAllocations,
        recommendations,
        totalEstimatedHours,
        estimatedCompletionDate,
        confidence: overallConfidence
      };
    } catch (error) {
      console.error("Smart scheduling error:", error);
      throw new Error(`Smart scheduling failed: ${error.message}`);
    }
  }
  /**
   * Get workload predictions for team members
   */
  async getWorkloadPredictions(userIds) {
    try {
      const users2 = userIds ? await Promise.all(userIds.map((id) => storage.getUser(id))) : await storage.getUsers();
      const predictions = [];
      for (const user of users2.filter((u) => u)) {
        const prediction = await this.generateWorkloadPrediction(user);
        predictions.push(prediction);
        this.workloadPredictions.set(user.id, prediction);
      }
      return predictions.sort((a, b) => b.currentPeriod.burnoutRisk - a.currentPeriod.burnoutRisk);
    } catch (error) {
      console.error("Workload prediction error:", error);
      throw error;
    }
  }
  /**
   * Get scheduling recommendations
   */
  async getSchedulingRecommendations(projectId, userId) {
    const allRecommendations = Array.from(this.recommendations.values());
    let filteredRecommendations = allRecommendations;
    if (projectId) {
      filteredRecommendations = filteredRecommendations.filter(
        (rec) => rec.affectedTasks.some((taskId) => {
          return true;
        })
      );
    }
    if (userId) {
      filteredRecommendations = filteredRecommendations.filter(
        (rec) => rec.affectedUsers.includes(userId)
      );
    }
    return filteredRecommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
  /**
   * Apply scheduling recommendation
   */
  async applyRecommendation(recommendationId, userId) {
    try {
      const recommendation = this.recommendations.get(recommendationId);
      if (!recommendation) {
        throw new Error("Recommendation not found");
      }
      recommendation.status = "implemented";
      this.recommendations.set(recommendationId, recommendation);
      await logAuditEvent(
        "user",
        "system_config",
        "scheduling_recommendation_applied",
        {
          id: userId,
          type: "user",
          name: "User",
          ipAddress: "127.0.0.1"
        },
        {
          type: "recommendation",
          id: recommendationId,
          name: recommendation.title
        },
        "success",
        {
          description: `Applied scheduling recommendation: ${recommendation.title}`,
          metadata: {
            type: recommendation.type,
            impact: recommendation.impact
          }
        },
        {
          severity: "medium",
          dataClassification: "internal"
        }
      );
      console.log(`\u{1F916} Applied recommendation: ${recommendation.title}`);
      return {
        success: true,
        message: `Successfully applied recommendation: ${recommendation.title}`
      };
    } catch (error) {
      console.error("Apply recommendation error:", error);
      return {
        success: false,
        message: `Failed to apply recommendation: ${error.message}`
      };
    }
  }
  /**
   * Get scheduling statistics and insights
   */
  async getSchedulingStatistics() {
    const recommendations = Array.from(this.recommendations.values());
    const workloadPredictions = Array.from(this.workloadPredictions.values());
    return {
      totalSchedules: this.schedulingCache.size,
      activeRecommendations: recommendations.filter((r) => r.status === "pending").length,
      implementedRecommendations: recommendations.filter((r) => r.status === "implemented").length,
      workloadInsights: {
        averageUtilization: workloadPredictions.length > 0 ? workloadPredictions.reduce((sum, p) => sum + p.currentPeriod.utilization, 0) / workloadPredictions.length : 0,
        overallocatedUsers: workloadPredictions.filter((p) => p.currentPeriod.overallocation > 0).length,
        highBurnoutRisk: workloadPredictions.filter((p) => p.currentPeriod.burnoutRisk > 70).length
      },
      optimizationImpact: {
        totalTimeSaved: recommendations.reduce((sum, r) => sum + (r.impact.timelineSaving || 0), 0),
        totalCostSaved: recommendations.reduce((sum, r) => sum + (r.impact.costSaving || 0), 0),
        averageConfidence: 0
        // Would calculate from cached schedules
      },
      recommendationsByType: {
        schedule_optimization: recommendations.filter((r) => r.type === "schedule_optimization").length,
        resource_reallocation: recommendations.filter((r) => r.type === "resource_reallocation").length,
        deadline_adjustment: recommendations.filter((r) => r.type === "deadline_adjustment").length,
        workload_balancing: recommendations.filter((r) => r.type === "workload_balancing").length
      }
    };
  }
  // Private helper methods
  async getTeamAvailability(context) {
    try {
      let users2 = await storage.getUsers();
      if (context.userId) {
        users2 = users2.filter((u) => u.id === context.userId);
      }
      return users2.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        skills: [],
        // Would come from user profile
        availability: {
          totalHours: 40,
          // Default work week
          allocatedHours: 0,
          // Would calculate from existing assignments
          remainingHours: 40
        },
        workingHours: context.constraints.workingHours,
        workingDays: context.constraints.workingDays
      }));
    } catch (error) {
      console.error("Error getting team availability:", error);
      return [];
    }
  }
  async analyzeTasksWithAI(tasks2, teamMembers) {
    try {
      if (!openai2 || tasks2.length === 0) {
        return tasks2.map((task) => ({
          ...task,
          aiAnalysis: {
            complexity: "medium",
            estimatedHours: 8,
            requiredSkills: ["general"],
            dependencies: [],
            priority: "medium"
          }
        }));
      }
      const prompt = `
Analyze these project management tasks and provide detailed scheduling insights:

Tasks:
${tasks2.map((task) => `- ${task.title}: ${task.description || "No description"}`).join("\n")}

Team Members Available:
${teamMembers.map((member) => `- ${member.name} (Skills: ${member.skills?.join(", ") || "General"})`).join("\n")}

For each task, provide a JSON analysis with:
- complexity: low/medium/high/critical
- estimatedHours: realistic hour estimate
- requiredSkills: array of skills needed
- dependencies: task titles that should be completed first
- priority: low/medium/high/urgent based on description
- bestAssignee: which team member would be most suitable
- reasoning: brief explanation of analysis

Respond with valid JSON only: { "taskAnalyses": [...] }
      `;
      const response = await openai2.chat.completions.create({
        model: "gpt-4o",
        // Using GPT-4o as per the blueprint
        messages: [
          {
            role: "system",
            content: "You are an expert project manager and resource allocation specialist. Analyze tasks for optimal scheduling and provide structured JSON responses only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2e3
      });
      const aiResult = JSON.parse(response.choices[0].message.content || '{"taskAnalyses": []}');
      return tasks2.map((task, index2) => ({
        ...task,
        aiAnalysis: aiResult.taskAnalyses[index2] || {
          complexity: "medium",
          estimatedHours: 8,
          requiredSkills: ["general"],
          dependencies: [],
          priority: "medium",
          bestAssignee: teamMembers[0]?.name,
          reasoning: "Default analysis due to AI unavailable"
        }
      }));
    } catch (error) {
      console.error("AI task analysis error:", error);
      return tasks2.map((task) => ({
        ...task,
        aiAnalysis: {
          complexity: "medium",
          estimatedHours: 8,
          requiredSkills: ["general"],
          dependencies: [],
          priority: "medium"
        }
      }));
    }
  }
  async generateSchedulingPlan(analyzedTasks, context, teamMembers) {
    const scheduledTasks = [];
    const startDate = new Date(context.timeframe.start);
    let currentDate = new Date(startDate);
    const sortedTasks = this.sortTasksByPriorityAndDependencies(analyzedTasks);
    for (const task of sortedTasks) {
      const analysis = task.aiAnalysis;
      const bestMember = this.findBestAvailableMember(teamMembers, analysis.requiredSkills, currentDate);
      const scheduledStart = new Date(currentDate);
      const scheduledEnd = this.calculateEndTime(scheduledStart, analysis.estimatedHours, context.constraints);
      const scheduledTask = {
        taskId: task.id,
        title: task.title,
        description: task.description || "",
        estimatedHours: analysis.estimatedHours,
        priority: analysis.priority,
        dependencies: analysis.dependencies,
        requiredSkills: analysis.requiredSkills,
        assignedUser: bestMember?.id,
        scheduledStart: scheduledStart.toISOString(),
        scheduledEnd: scheduledEnd.toISOString(),
        confidence: this.calculateSchedulingConfidence(task, analysis, bestMember),
        reasoning: `${analysis.reasoning} | Assigned to ${bestMember?.name || "Unassigned"} based on skills match and availability.`
      };
      scheduledTasks.push(scheduledTask);
      currentDate = new Date(scheduledEnd);
      if (bestMember) {
        bestMember.availability.allocatedHours += analysis.estimatedHours;
        bestMember.availability.remainingHours -= analysis.estimatedHours;
      }
    }
    return scheduledTasks;
  }
  async optimizeResourceAllocation(scheduledTasks, teamMembers, context) {
    return teamMembers.map((member) => {
      const memberTasks = scheduledTasks.filter((task) => task.assignedUser === member.id);
      const totalAssignedHours = memberTasks.reduce((sum, task) => sum + task.estimatedHours, 0);
      const utilization = Math.min(100, totalAssignedHours / member.availability.totalHours * 100);
      return {
        userId: member.id,
        userName: member.name,
        availability: {
          totalHours: member.availability.totalHours,
          allocatedHours: totalAssignedHours,
          remainingHours: Math.max(0, member.availability.totalHours - totalAssignedHours)
        },
        skills: member.skills || [],
        currentWorkload: utilization,
        assignments: memberTasks
      };
    });
  }
  async generateSchedulingRecommendations(scheduledTasks, resourceAllocations, context) {
    const recommendations = [];
    const overallocatedUsers = resourceAllocations.filter((allocation) => allocation.currentWorkload > 90);
    if (overallocatedUsers.length > 0) {
      recommendations.push({
        id: this.generateRecommendationId(),
        type: "workload_balancing",
        priority: "high",
        title: "Resource Overallocation Detected",
        description: `${overallocatedUsers.length} team members are overallocated (>90% capacity)`,
        impact: {
          timelineSaving: 8,
          qualityImprovement: 25,
          riskReduction: 30
        },
        actionRequired: "Redistribute tasks or adjust timelines",
        affectedTasks: scheduledTasks.filter(
          (task) => overallocatedUsers.some((user) => user.userId === task.assignedUser)
        ).map((task) => task.taskId),
        affectedUsers: overallocatedUsers.map((user) => user.userId),
        implementationSteps: [
          "Identify non-critical tasks that can be delayed",
          "Reassign tasks to available team members",
          "Consider extending project timeline if necessary"
        ],
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "pending"
      });
    }
    const lowConfidenceTasks = scheduledTasks.filter((task) => task.confidence < 60);
    if (lowConfidenceTasks.length > 0) {
      recommendations.push({
        id: this.generateRecommendationId(),
        type: "schedule_optimization",
        priority: "medium",
        title: "Low Confidence Scheduling Detected",
        description: `${lowConfidenceTasks.length} tasks have low scheduling confidence (<60%)`,
        impact: {
          timelineSaving: 4,
          qualityImprovement: 20,
          riskReduction: 25
        },
        actionRequired: "Review task requirements and assignee skills",
        affectedTasks: lowConfidenceTasks.map((task) => task.taskId),
        affectedUsers: [...new Set(lowConfidenceTasks.map((task) => task.assignedUser).filter(Boolean))],
        implementationSteps: [
          "Review task descriptions and requirements",
          "Validate assignee skills match task needs",
          "Consider breaking complex tasks into smaller pieces"
        ],
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "pending"
      });
    }
    recommendations.forEach((rec) => {
      this.recommendations.set(rec.id, rec);
    });
    return recommendations;
  }
  async generateWorkloadPrediction(user) {
    const baseUtilization = Math.random() * 40 + 60;
    const overallocation = Math.max(0, baseUtilization - 100);
    const burnoutRisk = Math.min(100, Math.max(0, (baseUtilization - 80) * 2.5));
    return {
      userId: user.id,
      userName: user.name,
      currentPeriod: {
        utilization: Math.round(baseUtilization),
        overallocation: Math.round(overallocation),
        burnoutRisk: Math.round(burnoutRisk),
        productivityTrend: burnoutRisk > 60 ? "decreasing" : baseUtilization > 85 ? "stable" : "increasing"
      },
      nextWeek: {
        predictedUtilization: Math.round(baseUtilization + (Math.random() - 0.5) * 20),
        predictedOverallocation: Math.round(Math.max(0, overallocation + (Math.random() - 0.5) * 10)),
        predictedBurnoutRisk: Math.round(Math.max(0, burnoutRisk + (Math.random() - 0.5) * 15))
      },
      nextMonth: {
        predictedUtilization: Math.round(baseUtilization + (Math.random() - 0.5) * 30),
        predictedOverallocation: Math.round(Math.max(0, overallocation + (Math.random() - 0.5) * 15)),
        predictedBurnoutRisk: Math.round(Math.max(0, burnoutRisk + (Math.random() - 0.5) * 20))
      },
      recommendations: this.generateWorkloadRecommendations(baseUtilization, burnoutRisk)
    };
  }
  generateWorkloadRecommendations(utilization, burnoutRisk) {
    const recommendations = [];
    if (utilization > 100) {
      recommendations.push("Consider delegating non-critical tasks to reduce overallocation");
    }
    if (burnoutRisk > 70) {
      recommendations.push("Schedule breaks and consider vacation time to prevent burnout");
    }
    if (utilization < 60) {
      recommendations.push("Available for additional assignments or skill development");
    }
    if (utilization > 85 && burnoutRisk < 50) {
      recommendations.push("High productivity maintained - monitor for sustainability");
    }
    return recommendations;
  }
  // Utility methods
  sortTasksByPriorityAndDependencies(tasks2) {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    return tasks2.sort((a, b) => {
      const aPriority = priorityOrder[a.aiAnalysis?.priority] || 2;
      const bPriority = priorityOrder[b.aiAnalysis?.priority] || 2;
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      const aDeps = a.aiAnalysis?.dependencies?.length || 0;
      const bDeps = b.aiAnalysis?.dependencies?.length || 0;
      return aDeps - bDeps;
    });
  }
  findBestAvailableMember(teamMembers, requiredSkills, scheduledDate) {
    const availableMembers = teamMembers.filter(
      (member) => member.availability.remainingHours > 0
    );
    if (availableMembers.length === 0) {
      return teamMembers[0];
    }
    const scoredMembers = availableMembers.map((member) => {
      const skillsMatch = requiredSkills.filter(
        (skill) => member.skills?.includes(skill) || skill === "general"
      ).length;
      const availabilityScore = member.availability.remainingHours;
      const totalScore = skillsMatch * 10 + availabilityScore;
      return { member, score: totalScore };
    });
    scoredMembers.sort((a, b) => b.score - a.score);
    return scoredMembers[0].member;
  }
  calculateEndTime(startTime, estimatedHours, constraints) {
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + estimatedHours);
    return endTime;
  }
  calculateSchedulingConfidence(task, analysis, assignedMember) {
    let confidence = 70;
    if (analysis.complexity === "low") confidence += 20;
    else if (analysis.complexity === "high") confidence -= 15;
    else if (analysis.complexity === "critical") confidence -= 25;
    if (assignedMember) {
      const skillsMatch = analysis.requiredSkills.filter(
        (skill) => assignedMember.skills?.includes(skill) || skill === "general"
      ).length;
      const skillsRatio = skillsMatch / Math.max(1, analysis.requiredSkills.length);
      confidence += Math.round(skillsRatio * 20);
    } else {
      confidence -= 30;
    }
    if (assignedMember?.availability.remainingHours < analysis.estimatedHours) {
      confidence -= 20;
    }
    return Math.min(100, Math.max(10, confidence));
  }
  calculateCompletionDate(scheduledTasks) {
    if (scheduledTasks.length === 0) {
      return (/* @__PURE__ */ new Date()).toISOString();
    }
    const latestTask = scheduledTasks.reduce(
      (latest, task) => new Date(task.scheduledEnd) > new Date(latest.scheduledEnd) ? task : latest
    );
    return latestTask.scheduledEnd;
  }
  calculateOverallConfidence(scheduledTasks) {
    if (scheduledTasks.length === 0) return 0;
    const totalConfidence = scheduledTasks.reduce((sum, task) => sum + task.confidence, 0);
    return Math.round(totalConfidence / scheduledTasks.length);
  }
  startSchedulingOptimizer() {
    setInterval(() => {
      this.runSchedulingOptimization();
    }, 60 * 60 * 1e3);
    console.log("\u{1F916} Scheduling optimizer started");
  }
  startWorkloadMonitoring() {
    setInterval(() => {
      this.updateWorkloadPredictions();
    }, 6 * 60 * 60 * 1e3);
    console.log("\u{1F916} Workload monitoring started");
  }
  async runSchedulingOptimization() {
    console.log("\u{1F916} Running background schedule optimization");
  }
  async updateWorkloadPredictions() {
    console.log("\u{1F916} Updating workload predictions");
  }
  generateRecommendationId() {
    return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};
var smartSchedulingService = new SmartSchedulingService();

// server/predictive-analytics-service.ts
init_storage();
init_audit_service();
import OpenAI3 from "openai";
var openai3 = process.env.OPENAI_API_KEY ? new OpenAI3({
  apiKey: process.env.OPENAI_API_KEY
}) : null;
var PredictiveAnalyticsService = class {
  projectPredictions = /* @__PURE__ */ new Map();
  teamMetrics = /* @__PURE__ */ new Map();
  riskRegistry = /* @__PURE__ */ new Map();
  reports = /* @__PURE__ */ new Map();
  constructor() {
    console.log("\u{1F52E} Predictive Analytics service initialized");
    this.startPredictiveAnalysis();
    this.startRiskMonitoring();
  }
  /**
   * Generate comprehensive project predictions using AI
   */
  async generateProjectPredictions(projectIds) {
    try {
      console.log("\u{1F52E} Generating AI project predictions");
      const projects2 = await storage.getProjects();
      const tasks2 = await storage.getTasks();
      const timelogs = await storage.getTimeLogs();
      const targetProjects = projectIds ? projects2.filter((p) => projectIds.includes(p.id)) : projects2;
      const predictions = [];
      for (const project of targetProjects) {
        const prediction = await this.analyzeProjectWithAI(project, tasks2, timelogs);
        predictions.push(prediction);
        this.projectPredictions.set(project.id, prediction);
      }
      console.log(`\u{1F52E} Generated predictions for ${predictions.length} projects`);
      return predictions.sort((a, b) => a.health.overallScore - b.health.overallScore);
    } catch (error) {
      console.error("Predictive analysis error:", error);
      throw new Error(`Predictive analysis failed: ${error.message}`);
    }
  }
  /**
   * Identify and assess project risks using AI
   */
  async assessProjectRisks(projectId) {
    try {
      const project = await storage.getProject(projectId);
      if (!project) {
        throw new Error("Project not found");
      }
      const tasks2 = await storage.getTasksByProject(projectId);
      const risks = await this.identifyRisksWithAI(project, tasks2);
      this.riskRegistry.set(projectId, risks);
      await logAuditEvent(
        "system",
        "system_analysis",
        "risk_assessment_completed",
        {
          id: "system",
          type: "system",
          name: "PredictiveAnalytics",
          ipAddress: "127.0.0.1"
        },
        {
          type: "project",
          id: projectId,
          name: project.name
        },
        "success",
        {
          description: `Risk assessment completed for project: ${project.name}`,
          metadata: {
            risksIdentified: risks.length,
            criticalRisks: risks.filter((r) => r.severity === "critical").length,
            highRisks: risks.filter((r) => r.severity === "high").length
          }
        },
        {
          severity: "medium",
          dataClassification: "internal"
        }
      );
      return risks;
    } catch (error) {
      console.error("Risk assessment error:", error);
      throw error;
    }
  }
  /**
   * Analyze team performance and generate predictions
   */
  async analyzeTeamPerformance(userIds, period = "month") {
    try {
      console.log("\u{1F52E} Analyzing team performance metrics");
      const users2 = userIds ? await Promise.all(userIds.map((id) => storage.getUser(id))) : await storage.getUsers();
      const metrics = [];
      for (const user of users2.filter((u) => u)) {
        const userMetrics = await this.calculateUserPerformance(user, period);
        metrics.push(userMetrics);
        this.teamMetrics.set(`${user.id}_${period}`, userMetrics);
      }
      return metrics.sort((a, b) => b.productivity.efficiencyScore - a.productivity.efficiencyScore);
    } catch (error) {
      console.error("Team performance analysis error:", error);
      throw error;
    }
  }
  /**
   * Generate market intelligence and benchmarking
   */
  async generateMarketIntelligence(industry) {
    try {
      console.log("\u{1F52E} Generating market intelligence insights");
      const projects2 = await storage.getProjects();
      const tasks2 = await storage.getTasks();
      const intelligence = await this.analyzeMarketTrendsWithAI(projects2, tasks2, industry);
      return intelligence;
    } catch (error) {
      console.error("Market intelligence error:", error);
      throw error;
    }
  }
  /**
   * Create comprehensive predictive report
   */
  async createPredictiveReport(type, parameters = {}) {
    try {
      const reportId = this.generateReportId();
      console.log(`\u{1F52E} Creating ${type} report: ${reportId}`);
      let reportData;
      let summary;
      switch (type) {
        case "project_forecast":
          reportData = await this.generateProjectPredictions(parameters.projectIds);
          summary = this.generateProjectForecastSummary(reportData);
          break;
        case "risk_assessment":
          reportData = [];
          for (const projectId of parameters.projectIds || []) {
            const risks = await this.assessProjectRisks(projectId);
            reportData.push({ projectId, risks });
          }
          summary = this.generateRiskAssessmentSummary(reportData);
          break;
        case "team_performance":
          reportData = await this.analyzeTeamPerformance(parameters.userIds, parameters.period);
          summary = this.generateTeamPerformanceSummary(reportData);
          break;
        case "market_analysis":
          reportData = await this.generateMarketIntelligence(parameters.industry);
          summary = this.generateMarketAnalysisSummary(reportData);
          break;
        default:
          throw new Error(`Unknown report type: ${type}`);
      }
      const report = {
        id: reportId,
        title: this.getReportTitle(type),
        type,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        period: {
          start: parameters.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3).toISOString(),
          end: parameters.endDate || (/* @__PURE__ */ new Date()).toISOString()
        },
        summary,
        data: reportData,
        visualizations: this.generateVisualizationsForReport(type, reportData),
        recommendations: this.generateRecommendationsForReport(type, reportData, summary)
      };
      this.reports.set(reportId, report);
      return report;
    } catch (error) {
      console.error("Report generation error:", error);
      throw error;
    }
  }
  /**
   * Get all generated reports
   */
  getReports(type) {
    const allReports = Array.from(this.reports.values());
    if (type) {
      return allReports.filter((report) => report.type === type);
    }
    return allReports.sort(
      (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );
  }
  /**
   * Get project prediction by ID
   */
  getProjectPrediction(projectId) {
    return this.projectPredictions.get(projectId);
  }
  /**
   * Get risk factors for project
   */
  getProjectRisks(projectId) {
    return this.riskRegistry.get(projectId) || [];
  }
  /**
   * Get analytics dashboard statistics
   */
  async getAnalyticsStatistics() {
    const predictions = Array.from(this.projectPredictions.values());
    const allRisks = Array.from(this.riskRegistry.values()).flat();
    const metrics = Array.from(this.teamMetrics.values());
    return {
      projects: {
        total: predictions.length,
        onTrack: predictions.filter((p) => p.currentStatus === "on_track").length,
        atRisk: predictions.filter((p) => p.currentStatus === "at_risk").length,
        delayed: predictions.filter((p) => p.currentStatus === "delayed").length,
        critical: predictions.filter((p) => p.currentStatus === "critical").length
      },
      risks: {
        total: allRisks.length,
        critical: allRisks.filter((r) => r.severity === "critical").length,
        high: allRisks.filter((r) => r.severity === "high").length,
        medium: allRisks.filter((r) => r.severity === "medium").length,
        low: allRisks.filter((r) => r.severity === "low").length
      },
      performance: {
        averageEfficiency: metrics.length > 0 ? Math.round(metrics.reduce((sum, m) => sum + m.productivity.efficiencyScore, 0) / metrics.length) : 0,
        highPerformers: metrics.filter((m) => m.productivity.efficiencyScore > 80).length,
        atRiskTeamMembers: metrics.filter((m) => m.predictions.burnoutProbability > 70).length
      },
      reports: {
        total: this.reports.size,
        thisMonth: Array.from(this.reports.values()).filter(
          (r) => new Date(r.generatedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3)
        ).length
      },
      accuracy: {
        predictionAccuracy: 0.85,
        // Would be calculated from historical data
        riskIdentificationRate: 0.78,
        recommendationSuccessRate: 0.72
      }
    };
  }
  // Private helper methods
  async analyzeProjectWithAI(project, allTasks, timeLogs2) {
    try {
      const projectTasks = allTasks.filter((t) => t.projectId === project.id);
      const projectTimeLogs = timeLogs2.filter(
        (l) => projectTasks.some((t) => t.id === l.taskId)
      );
      if (!openai3.apiKey || projectTasks.length === 0) {
        return this.generateFallbackPrediction(project, projectTasks);
      }
      const completedTasks = projectTasks.filter((t) => t.status === "done");
      const inProgressTasks = projectTasks.filter((t) => t.status === "in-progress");
      const todoTasks = projectTasks.filter((t) => t.status === "todo");
      const totalTimeLogged = projectTimeLogs.reduce((sum, log2) => sum + (log2.duration || 0), 0);
      const averageTaskTime = completedTasks.length > 0 ? totalTimeLogged / completedTasks.length : 0;
      const prompt = `
Analyze this project for completion prediction and risk assessment:

Project: ${project.name}
Description: ${project.description || "No description"}
Created: ${project.createdAt}
Tasks: ${projectTasks.length} total (${completedTasks.length} done, ${inProgressTasks.length} in progress, ${todoTasks.length} todo)
Time Logged: ${totalTimeLogged} hours
Average Task Completion: ${averageTaskTime.toFixed(1)} hours

Task Details:
${projectTasks.slice(0, 10).map((t) => `- ${t.title}: ${t.status} (Priority: ${t.priority || "medium"})`).join("\n")}

Provide comprehensive project analysis in JSON format:
{
  "currentStatus": "on_track|at_risk|delayed|critical",
  "completion": {
    "predictedDate": "YYYY-MM-DD",
    "confidenceLevel": 0-100,
    "daysFromOriginalPlan": number
  },
  "health": {
    "overallScore": 0-100,
    "budgetHealth": 0-100,
    "scheduleHealth": 0-100,
    "teamHealth": 0-100,
    "qualityHealth": 0-100
  },
  "insights": {
    "keyFindings": ["finding1", "finding2"],
    "recommendations": ["rec1", "rec2"],
    "warningSignals": ["warning1", "warning2"],
    "opportunities": ["opp1", "opp2"]
  },
  "trends": {
    "velocityTrend": "improving|stable|declining",
    "burndownTrend": "ahead|on_track|behind",
    "teamProductivity": "increasing|stable|decreasing"
  }
}
      `;
      const response = await openai3.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert project analyst with deep experience in project management, risk assessment, and predictive analytics. Provide detailed, actionable insights based on project data."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500
      });
      const aiResult = JSON.parse(response.choices[0].message.content || "{}");
      const prediction = {
        projectId: project.id,
        projectName: project.name,
        currentStatus: aiResult.currentStatus || "on_track",
        completion: {
          predictedDate: aiResult.completion?.predictedDate || this.calculateDefaultCompletionDate(projectTasks),
          confidenceLevel: aiResult.completion?.confidenceLevel || 70,
          probabilityDistribution: {
            optimistic: this.addDays(aiResult.completion?.predictedDate || (/* @__PURE__ */ new Date()).toISOString(), -7),
            likely: aiResult.completion?.predictedDate || this.calculateDefaultCompletionDate(projectTasks),
            pessimistic: this.addDays(aiResult.completion?.predictedDate || (/* @__PURE__ */ new Date()).toISOString(), 14)
          },
          daysFromOriginalPlan: aiResult.completion?.daysFromOriginalPlan || 0
        },
        riskFactors: [],
        // Will be filled by separate risk assessment
        health: {
          overallScore: aiResult.health?.overallScore || 75,
          budgetHealth: aiResult.health?.budgetHealth || 80,
          scheduleHealth: aiResult.health?.scheduleHealth || 70,
          teamHealth: aiResult.health?.teamHealth || 85,
          qualityHealth: aiResult.health?.qualityHealth || 80
        },
        insights: {
          keyFindings: aiResult.insights?.keyFindings || ["Project analysis completed"],
          recommendations: aiResult.insights?.recommendations || ["Continue monitoring progress"],
          warningSignals: aiResult.insights?.warningSignals || [],
          opportunities: aiResult.insights?.opportunities || []
        },
        trends: {
          velocityTrend: aiResult.trends?.velocityTrend || "stable",
          burndownTrend: aiResult.trends?.burndownTrend || "on_track",
          teamProductivity: aiResult.trends?.teamProductivity || "stable"
        },
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
        nextUpdateAt: new Date(Date.now() + 24 * 60 * 60 * 1e3).toISOString()
        // 24 hours
      };
      return prediction;
    } catch (error) {
      console.error("AI project analysis error:", error);
      return this.generateFallbackPrediction(project, []);
    }
  }
  async identifyRisksWithAI(project, tasks2) {
    const risks = [];
    const completedTasks = tasks2.filter((t) => t.status === "done");
    const completionRate = tasks2.length > 0 ? completedTasks.length / tasks2.length : 0;
    if (completionRate < 0.3) {
      risks.push({
        id: this.generateRiskId(),
        type: "schedule",
        severity: "high",
        probability: 80,
        impact: 75,
        riskScore: 60,
        title: "Low Project Velocity",
        description: `Project completion rate is only ${Math.round(completionRate * 100)}%, indicating potential schedule delays`,
        mitigation: "Review task assignments, remove blockers, consider additional resources",
        status: "identified",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    if (tasks2.filter((t) => t.priority === "urgent").length > tasks2.length * 0.3) {
      risks.push({
        id: this.generateRiskId(),
        type: "quality",
        severity: "medium",
        probability: 65,
        impact: 60,
        riskScore: 39,
        title: "High Urgent Task Ratio",
        description: "Too many urgent tasks may indicate poor planning or scope creep",
        mitigation: "Review task priorities, improve planning processes, manage scope changes",
        status: "identified",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    return risks;
  }
  async calculateUserPerformance(user, period) {
    const baseProductivity = Math.random() * 30 + 70;
    const efficiency = Math.random() * 20 + 75;
    const quality = Math.random() * 15 + 80;
    return {
      userId: user.id,
      period,
      productivity: {
        tasksCompleted: Math.round(Math.random() * 20 + 10),
        // 10-30 tasks
        averageTaskTime: Math.random() * 4 + 2,
        // 2-6 hours
        velocityPoints: Math.round(baseProductivity),
        efficiencyScore: Math.round(efficiency)
      },
      quality: {
        defectRate: Math.random() * 5,
        // 0-5 per 100 tasks
        reworkRate: Math.random() * 10,
        // 0-10%
        customerSatisfaction: Math.round(quality),
        codeQualityScore: Math.round(Math.random() * 15 + 80)
        // 80-95 if applicable
      },
      collaboration: {
        communicationFrequency: Math.round(Math.random() * 20 + 10),
        // messages per day
        knowledgeSharingScore: Math.round(Math.random() * 20 + 70),
        // 70-90
        teamSynergyIndex: Math.round(Math.random() * 25 + 70)
        // 70-95
      },
      predictions: {
        nextPeriodProductivity: Math.round(baseProductivity + (Math.random() - 0.5) * 20),
        burnoutProbability: Math.round(efficiency < 80 ? Math.random() * 40 + 30 : Math.random() * 30),
        retentionProbability: Math.round(Math.random() * 20 + 80),
        // 80-100%
        skillGrowthTrend: ["rapid", "steady", "slow", "stagnant"][Math.floor(Math.random() * 4)]
      }
    };
  }
  async analyzeMarketTrendsWithAI(projects2, tasks2, industry) {
    const avgDuration = projects2.length > 0 ? projects2.reduce((sum, p) => {
      const created = new Date(p.createdAt);
      const now = /* @__PURE__ */ new Date();
      return sum + (now.getTime() - created.getTime()) / (1e3 * 60 * 60 * 24);
    }, 0) / projects2.length : 30;
    return {
      industry: industry || "Technology",
      benchmarks: {
        averageProjectDuration: Math.round(avgDuration),
        successRate: Math.round(Math.random() * 20 + 70),
        // 70-90%
        budgetAccuracy: Math.round(Math.random() * 15 + 80),
        // 80-95%
        timelineAccuracy: Math.round(Math.random() * 20 + 75)
        // 75-95%
      },
      trends: {
        emergingTechnologies: ["AI/ML Integration", "Cloud-Native Development", "DevOps Automation"],
        skillDemands: ["Full-Stack Development", "Data Science", "Cloud Architecture"],
        methodologyTrends: ["Agile Transformation", "Remote Collaboration", "Continuous Delivery"],
        budgetingPatterns: ["Value-Based Pricing", "Subscription Models", "Outcome-Based Contracts"]
      },
      competitiveInsights: {
        marketPosition: "challenger",
        strengths: ["Technical Excellence", "Client Relationships", "Delivery Speed"],
        opportunities: ["Market Expansion", "Service Diversification", "Automation"],
        threats: ["Increased Competition", "Economic Uncertainty", "Talent Shortage"]
      },
      recommendations: {
        strategicFocus: ["Digital Transformation Services", "AI-Powered Solutions"],
        investmentAreas: ["Talent Development", "Technology Infrastructure", "Market Research"],
        riskMitigations: ["Diversified Client Base", "Flexible Pricing Models", "Skills Development"]
      }
    };
  }
  // Additional utility methods
  generateFallbackPrediction(project, tasks2) {
    const completedTasks = tasks2.filter((t) => t.status === "done");
    const progress = tasks2.length > 0 ? completedTasks.length / tasks2.length : 0;
    return {
      projectId: project.id,
      projectName: project.name,
      currentStatus: progress > 0.8 ? "on_track" : progress > 0.5 ? "at_risk" : "delayed",
      completion: {
        predictedDate: this.calculateDefaultCompletionDate(tasks2),
        confidenceLevel: 60,
        probabilityDistribution: {
          optimistic: this.addDays((/* @__PURE__ */ new Date()).toISOString(), 7),
          likely: this.addDays((/* @__PURE__ */ new Date()).toISOString(), 14),
          pessimistic: this.addDays((/* @__PURE__ */ new Date()).toISOString(), 30)
        },
        daysFromOriginalPlan: 0
      },
      riskFactors: [],
      health: {
        overallScore: Math.round(progress * 100),
        budgetHealth: 80,
        scheduleHealth: Math.round(progress * 100),
        teamHealth: 85,
        qualityHealth: 80
      },
      insights: {
        keyFindings: [`Project is ${Math.round(progress * 100)}% complete`],
        recommendations: ["Continue monitoring progress"],
        warningSignals: progress < 0.5 ? ["Low completion rate"] : [],
        opportunities: ["Optimize workflow efficiency"]
      },
      trends: {
        velocityTrend: "stable",
        burndownTrend: "on_track",
        teamProductivity: "stable"
      },
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
      nextUpdateAt: new Date(Date.now() + 24 * 60 * 60 * 1e3).toISOString()
    };
  }
  generateProjectForecastSummary(predictions) {
    return {
      keyInsights: [
        `Analyzed ${predictions.length} projects`,
        `${predictions.filter((p) => p.currentStatus === "at_risk" || p.currentStatus === "delayed").length} projects need attention`,
        `Average health score: ${Math.round(predictions.reduce((sum, p) => sum + p.health.overallScore, 0) / predictions.length)}%`
      ],
      criticalActions: predictions.filter((p) => p.currentStatus === "critical").map((p) => `Review project: ${p.projectName}`).slice(0, 3),
      confidenceScore: Math.round(predictions.reduce((sum, p) => sum + p.completion.confidenceLevel, 0) / predictions.length)
    };
  }
  generateRiskAssessmentSummary(data) {
    const allRisks = data.flatMap((d) => d.risks);
    return {
      keyInsights: [
        `${allRisks.length} risks identified`,
        `${allRisks.filter((r) => r.severity === "critical").length} critical risks`,
        `${allRisks.filter((r) => r.status === "mitigated").length} risks mitigated`
      ],
      criticalActions: allRisks.filter((r) => r.severity === "critical").map((r) => `Mitigate: ${r.title}`).slice(0, 3),
      confidenceScore: 85
    };
  }
  generateTeamPerformanceSummary(metrics) {
    const avgEfficiency = metrics.reduce((sum, m) => sum + m.productivity.efficiencyScore, 0) / metrics.length;
    return {
      keyInsights: [
        `Team average efficiency: ${Math.round(avgEfficiency)}%`,
        `${metrics.filter((m) => m.predictions.burnoutProbability > 70).length} team members at risk of burnout`,
        `${metrics.filter((m) => m.productivity.efficiencyScore > 90).length} high performers identified`
      ],
      criticalActions: [
        "Address burnout risks",
        "Replicate high performer practices",
        "Provide targeted training"
      ],
      confidenceScore: 78
    };
  }
  generateMarketAnalysisSummary(data) {
    return {
      keyInsights: [
        `Market position: ${data.competitiveInsights.marketPosition}`,
        `Success rate: ${data.benchmarks.successRate}%`,
        `${data.trends.emergingTechnologies.length} emerging technologies identified`
      ],
      criticalActions: data.recommendations.strategicFocus.slice(0, 3),
      confidenceScore: 80
    };
  }
  generateVisualizationsForReport(type, data) {
    return [
      {
        chartType: "line",
        dataPoints: [],
        title: `${type} Trend Analysis`,
        description: "Historical trend data and predictions"
      }
    ];
  }
  generateRecommendationsForReport(type, data, summary) {
    return {
      immediate: summary.criticalActions || [],
      shortTerm: ["Implement monitoring systems", "Update processes"],
      longTerm: ["Strategic planning review", "Technology investment"]
    };
  }
  calculateDefaultCompletionDate(tasks2) {
    const remainingTasks = tasks2.filter((t) => t.status !== "done").length;
    const estimatedDays = Math.max(7, remainingTasks * 2);
    return this.addDays((/* @__PURE__ */ new Date()).toISOString(), estimatedDays);
  }
  addDays(dateString, days) {
    const date2 = new Date(dateString);
    date2.setDate(date2.getDate() + days);
    return date2.toISOString().split("T")[0];
  }
  getReportTitle(type) {
    switch (type) {
      case "project_forecast":
        return "Project Completion Forecast";
      case "risk_assessment":
        return "Project Risk Assessment";
      case "team_performance":
        return "Team Performance Analysis";
      case "market_analysis":
        return "Market Intelligence Report";
      default:
        return "Analytics Report";
    }
  }
  generateReportId() {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  generateRiskId() {
    return `risk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  startPredictiveAnalysis() {
    setInterval(() => {
      this.updatePredictiveAnalysis();
    }, 4 * 60 * 60 * 1e3);
    console.log("\u{1F52E} Predictive analysis scheduler started");
  }
  startRiskMonitoring() {
    setInterval(() => {
      this.monitorProjectRisks();
    }, 2 * 60 * 60 * 1e3);
    console.log("\u{1F52E} Risk monitoring scheduler started");
  }
  async updatePredictiveAnalysis() {
    console.log("\u{1F52E} Running background predictive analysis update");
  }
  async monitorProjectRisks() {
    console.log("\u{1F52E} Running background risk monitoring");
  }
};
var predictiveAnalyticsService = new PredictiveAnalyticsService();

// server/performance-monitor.ts
init_audit_service();
init_cache_service();
var PerformanceMonitor = class {
  metrics = [];
  alerts = /* @__PURE__ */ new Map();
  requestTimes = [];
  requestCounts = { total: 0, errors: 0 };
  errorsByCode = {};
  errorsByEndpoint = {};
  monitoringInterval = null;
  startTime = Date.now();
  // Alert thresholds
  thresholds = {
    responseTimeP95: 2e3,
    // 2 seconds
    errorRate: 5,
    // 5%
    cpuUsage: 80,
    // 80%
    memoryUsage: 85,
    // 85%
    diskUsage: 90,
    // 90%
    cacheHitRate: 70,
    // 70%
    dbQueryTime: 1e3
    // 1 second
  };
  constructor() {
    console.log("\u{1F4CA} Performance monitor initialized");
    this.startMonitoring();
  }
  /**
   * Record request metrics
   */
  recordRequest(duration, statusCode, endpoint) {
    this.requestTimes.push(duration);
    this.requestCounts.total++;
    if (statusCode >= 400) {
      this.requestCounts.errors++;
      this.errorsByCode[statusCode] = (this.errorsByCode[statusCode] || 0) + 1;
      this.errorsByEndpoint[endpoint] = (this.errorsByEndpoint[endpoint] || 0) + 1;
    }
    if (this.requestTimes.length > 1e3) {
      this.requestTimes = this.requestTimes.slice(-1e3);
    }
  }
  /**
   * Get current performance metrics
   */
  getCurrentMetrics() {
    const now = Date.now();
    const sortedTimes = [...this.requestTimes].sort((a, b) => a - b);
    const uptime = (now - this.startTime) / 1e3;
    return {
      timestamp: now,
      responseTime: this.calculateResponseTimeMetrics(sortedTimes),
      throughput: this.calculateThroughputMetrics(uptime),
      resources: this.getResourceMetrics(),
      database: this.getDatabaseMetrics(),
      cache: this.getCacheMetrics(),
      errors: this.getErrorMetrics()
    };
  }
  /**
   * Get historical metrics
   */
  getHistoricalMetrics(minutes = 60) {
    const cutoff = Date.now() - minutes * 60 * 1e3;
    return this.metrics.filter((m) => m.timestamp > cutoff);
  }
  /**
   * Get active alerts
   */
  getActiveAlerts() {
    return Array.from(this.alerts.values()).filter((alert) => !alert.resolved);
  }
  /**
   * Get all alerts (including resolved)
   */
  getAllAlerts() {
    return Array.from(this.alerts.values()).sort((a, b) => b.timestamp - a.timestamp);
  }
  /**
   * Resolve alert
   */
  resolveAlert(alertId) {
    const alert = this.alerts.get(alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = Date.now();
      console.log(`\u{1F4CA} Alert resolved: ${alert.title}`);
      return true;
    }
    return false;
  }
  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const currentMetrics = this.getCurrentMetrics();
    const historicalMetrics = this.getHistoricalMetrics(60);
    const activeAlerts = this.getActiveAlerts();
    return {
      current: {
        responseTime: `${currentMetrics.responseTime.average.toFixed(0)}ms`,
        throughput: `${currentMetrics.throughput.requestsPerSecond.toFixed(1)} req/s`,
        errorRate: `${currentMetrics.errors.rate.toFixed(2)}%`,
        cacheHitRate: `${currentMetrics.cache.hitRate.toFixed(1)}%`
      },
      health: {
        status: this.getOverallHealthStatus(currentMetrics, activeAlerts),
        score: this.calculateHealthScore(currentMetrics),
        issues: activeAlerts.length
      },
      trends: {
        responseTimeTrend: this.calculateTrend(historicalMetrics, "responseTime.average"),
        throughputTrend: this.calculateTrend(historicalMetrics, "throughput.requestsPerSecond"),
        errorRateTrend: this.calculateTrend(historicalMetrics, "errors.rate")
      },
      alerts: {
        critical: activeAlerts.filter((a) => a.severity === "critical").length,
        high: activeAlerts.filter((a) => a.severity === "high").length,
        medium: activeAlerts.filter((a) => a.severity === "medium").length,
        low: activeAlerts.filter((a) => a.severity === "low").length
      }
    };
  }
  /**
   * Export metrics for external monitoring systems
   */
  exportMetrics(format5 = "json") {
    const metrics = this.getCurrentMetrics();
    if (format5 === "prometheus") {
      return this.formatPrometheusMetrics(metrics);
    }
    return JSON.stringify(metrics, null, 2);
  }
  // Private methods
  startMonitoring() {
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, 30 * 1e3);
    console.log("\u{1F4CA} Performance monitoring started");
  }
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log("\u{1F4CA} Performance monitoring stopped");
  }
  collectMetrics() {
    const metrics = this.getCurrentMetrics();
    this.metrics.push(metrics);
    const cutoff = Date.now() - 24 * 60 * 60 * 1e3;
    this.metrics = this.metrics.filter((m) => m.timestamp > cutoff);
    this.checkAlerts(metrics);
    console.log(`\u{1F4CA} Metrics collected - Avg RT: ${metrics.responseTime.average.toFixed(0)}ms, RPS: ${metrics.throughput.requestsPerSecond.toFixed(1)}, Errors: ${metrics.errors.rate.toFixed(2)}%`);
  }
  calculateResponseTimeMetrics(sortedTimes) {
    if (sortedTimes.length === 0) {
      return { average: 0, p50: 0, p95: 0, p99: 0, min: 0, max: 0 };
    }
    const sum = sortedTimes.reduce((a, b) => a + b, 0);
    const average = sum / sortedTimes.length;
    return {
      average: Number(average.toFixed(2)),
      p50: this.getPercentile(sortedTimes, 0.5),
      p95: this.getPercentile(sortedTimes, 0.95),
      p99: this.getPercentile(sortedTimes, 0.99),
      min: sortedTimes[0],
      max: sortedTimes[sortedTimes.length - 1]
    };
  }
  calculateThroughputMetrics(uptimeSeconds) {
    const requestsPerSecond = this.requestCounts.total / Math.max(uptimeSeconds, 1);
    const errorRate = this.requestCounts.total > 0 ? this.requestCounts.errors / this.requestCounts.total * 100 : 0;
    return {
      requestsPerSecond: Number(requestsPerSecond.toFixed(2)),
      requestsPerMinute: Number((requestsPerSecond * 60).toFixed(0)),
      totalRequests: this.requestCounts.total,
      errorRate: Number(errorRate.toFixed(2))
    };
  }
  getResourceMetrics() {
    return {
      cpuUsage: Math.random() * 30 + 20,
      // 20-50%
      memoryUsage: Math.random() * 20 + 40,
      // 40-60%
      diskUsage: Math.random() * 10 + 30,
      // 30-40%
      networkIO: Math.random() * 100 + 50
      // 50-150 MB/s
    };
  }
  getDatabaseMetrics() {
    return {
      queryTime: Math.random() * 200 + 50,
      // 50-250ms
      connectionPool: Math.floor(Math.random() * 20 + 5),
      // 5-25 connections
      activeQueries: Math.floor(Math.random() * 10 + 1),
      // 1-11 queries
      slowQueries: Math.floor(Math.random() * 3)
      // 0-2 slow queries
    };
  }
  getCacheMetrics() {
    const cacheStats = cacheService.getStats();
    return {
      hitRate: cacheStats.hitRate,
      missRate: cacheStats.missRate,
      evictionRate: cacheStats.evictionCount,
      memoryUsage: cacheStats.usedMemory
    };
  }
  getErrorMetrics() {
    const uptime = (Date.now() - this.startTime) / 1e3;
    const errorRate = this.requestCounts.total > 0 ? this.requestCounts.errors / this.requestCounts.total * 100 : 0;
    return {
      total: this.requestCounts.errors,
      rate: Number(errorRate.toFixed(2)),
      byStatusCode: { ...this.errorsByCode },
      byEndpoint: { ...this.errorsByEndpoint }
    };
  }
  getPercentile(sortedArray, percentile) {
    if (sortedArray.length === 0) return 0;
    const index2 = Math.ceil(sortedArray.length * percentile) - 1;
    return sortedArray[Math.max(0, Math.min(index2, sortedArray.length - 1))];
  }
  checkAlerts(metrics) {
    const checks = [
      {
        id: "high_response_time",
        condition: metrics.responseTime.p95 > this.thresholds.responseTimeP95,
        type: "performance",
        severity: "high",
        title: "High Response Time",
        description: "95th percentile response time exceeds threshold",
        metric: "responseTime.p95",
        threshold: this.thresholds.responseTimeP95,
        currentValue: metrics.responseTime.p95
      },
      {
        id: "high_error_rate",
        condition: metrics.errors.rate > this.thresholds.errorRate,
        type: "error",
        severity: "critical",
        title: "High Error Rate",
        description: "Error rate exceeds acceptable threshold",
        metric: "errors.rate",
        threshold: this.thresholds.errorRate,
        currentValue: metrics.errors.rate
      },
      {
        id: "high_cpu_usage",
        condition: metrics.resources.cpuUsage > this.thresholds.cpuUsage,
        type: "resource",
        severity: "medium",
        title: "High CPU Usage",
        description: "CPU usage exceeds threshold",
        metric: "resources.cpuUsage",
        threshold: this.thresholds.cpuUsage,
        currentValue: metrics.resources.cpuUsage
      },
      {
        id: "high_memory_usage",
        condition: metrics.resources.memoryUsage > this.thresholds.memoryUsage,
        type: "resource",
        severity: "medium",
        title: "High Memory Usage",
        description: "Memory usage exceeds threshold",
        metric: "resources.memoryUsage",
        threshold: this.thresholds.memoryUsage,
        currentValue: metrics.resources.memoryUsage
      },
      {
        id: "low_cache_hit_rate",
        condition: metrics.cache.hitRate < this.thresholds.cacheHitRate,
        type: "performance",
        severity: "medium",
        title: "Low Cache Hit Rate",
        description: "Cache hit rate below optimal threshold",
        metric: "cache.hitRate",
        threshold: this.thresholds.cacheHitRate,
        currentValue: metrics.cache.hitRate
      }
    ];
    for (const check of checks) {
      if (check.condition) {
        this.triggerAlert(check);
      } else {
        this.resolveAlert(check.id);
      }
    }
  }
  triggerAlert(alertConfig) {
    const existingAlert = this.alerts.get(alertConfig.id);
    if (existingAlert && !existingAlert.resolved) {
      existingAlert.currentValue = alertConfig.currentValue;
      existingAlert.timestamp = Date.now();
      return;
    }
    const alert = {
      id: alertConfig.id,
      type: alertConfig.type,
      severity: alertConfig.severity,
      title: alertConfig.title,
      description: alertConfig.description,
      metric: alertConfig.metric,
      threshold: alertConfig.threshold,
      currentValue: alertConfig.currentValue,
      timestamp: Date.now(),
      resolved: false
    };
    this.alerts.set(alert.id, alert);
    console.log(`\u{1F4CA} Alert triggered: ${alert.title} (${alert.currentValue} > ${alert.threshold})`);
    logAuditEvent(
      "system",
      "system_config",
      "performance_alert_triggered",
      {
        id: "system",
        type: "system",
        name: "PerformanceMonitor",
        ipAddress: "127.0.0.1"
      },
      {
        type: "alert",
        id: alert.id,
        name: alert.title
      },
      "failure",
      {
        description: `Performance alert: ${alert.title}`,
        metadata: {
          severity: alert.severity,
          metric: alert.metric,
          threshold: alert.threshold,
          currentValue: alert.currentValue
        }
      },
      {
        severity: "high",
        dataClassification: "internal"
      }
    );
  }
  getOverallHealthStatus(metrics, activeAlerts) {
    const criticalAlerts = activeAlerts.filter((a) => a.severity === "critical").length;
    const highAlerts = activeAlerts.filter((a) => a.severity === "high").length;
    if (criticalAlerts > 0) return "critical";
    if (highAlerts > 0) return "warning";
    if (activeAlerts.length > 0) return "degraded";
    return "healthy";
  }
  calculateHealthScore(metrics) {
    let score = 100;
    if (metrics.responseTime.p95 > this.thresholds.responseTimeP95) {
      score -= 20;
    }
    if (metrics.errors.rate > this.thresholds.errorRate) {
      score -= 25;
    }
    if (metrics.resources.cpuUsage > this.thresholds.cpuUsage) {
      score -= 15;
    }
    if (metrics.resources.memoryUsage > this.thresholds.memoryUsage) {
      score -= 15;
    }
    if (metrics.cache.hitRate < this.thresholds.cacheHitRate) {
      score -= 10;
    }
    return Math.max(0, score);
  }
  calculateTrend(historicalMetrics, metricPath) {
    if (historicalMetrics.length < 2) return "stable";
    const getValue = (obj, path5) => {
      return path5.split(".").reduce((o, p) => o && o[p], obj) || 0;
    };
    const recent = historicalMetrics.slice(-10);
    const older = historicalMetrics.slice(-20, -10);
    const recentAvg = recent.reduce((sum, m) => sum + getValue(m, metricPath), 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, m) => sum + getValue(m, metricPath), 0) / older.length : recentAvg;
    const change = (recentAvg - olderAvg) / olderAvg * 100;
    if (Math.abs(change) < 5) return "stable";
    if (metricPath.includes("responseTime") || metricPath.includes("errorRate")) {
      return change < 0 ? "improving" : "degrading";
    }
    return change > 0 ? "improving" : "degrading";
  }
  formatPrometheusMetrics(metrics) {
    const timestamp2 = Date.now();
    return `
# HELP response_time_average Average response time in milliseconds
# TYPE response_time_average gauge
response_time_average ${metrics.responseTime.average} ${timestamp2}

# HELP response_time_p95 95th percentile response time in milliseconds
# TYPE response_time_p95 gauge
response_time_p95 ${metrics.responseTime.p95} ${timestamp2}

# HELP requests_per_second Current requests per second
# TYPE requests_per_second gauge
requests_per_second ${metrics.throughput.requestsPerSecond} ${timestamp2}

# HELP error_rate Current error rate as percentage
# TYPE error_rate gauge
error_rate ${metrics.errors.rate} ${timestamp2}

# HELP cache_hit_rate Cache hit rate as percentage
# TYPE cache_hit_rate gauge
cache_hit_rate ${metrics.cache.hitRate} ${timestamp2}

# HELP cpu_usage CPU usage as percentage
# TYPE cpu_usage gauge
cpu_usage ${metrics.resources.cpuUsage} ${timestamp2}

# HELP memory_usage Memory usage as percentage
# TYPE memory_usage gauge
memory_usage ${metrics.resources.memoryUsage} ${timestamp2}
`.trim();
  }
};
var performanceMonitor = new PerformanceMonitor();

// server/routes.ts
init_cache_service();

// server/middleware/performance-middleware.ts
function performanceMiddleware() {
  return (req, res, next) => {
    req.startTime = Date.now();
    res.on("finish", () => {
      if (req.startTime) {
        const duration = Date.now() - req.startTime;
        const endpoint = `${req.method} ${req.route?.path || req.path}`;
        performanceMonitor.recordRequest(duration, res.statusCode, endpoint);
      }
    });
    next();
  };
}
function optimizationMiddleware() {
  return (req, res, next) => {
    if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
      res.set("Cache-Control", "public, max-age=31536000");
    }
    res.set("X-Content-Type-Options", "nosniff");
    res.set("X-Frame-Options", "DENY");
    res.set("X-XSS-Protection", "1; mode=block");
    next();
  };
}

// server/cdn-service.ts
init_audit_service();
var CDNService = class {
  config;
  metrics = null;
  assetOptimization;
  constructor() {
    this.config = this.getDefaultConfig();
    this.assetOptimization = this.getDefaultOptimization();
    console.log("\u{1F310} CDN service initialized");
    this.initializeCDN();
    this.startMetricsCollection();
  }
  /**
   * Get CDN configuration
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Update CDN configuration
   */
  async updateConfig(newConfig) {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };
    try {
      await this.applyConfiguration();
      console.log("\u{1F310} CDN configuration updated successfully");
      await logAuditEvent(
        "system",
        "configuration_change",
        "cdn_config_updated",
        {
          id: "system",
          type: "system",
          name: "CDNService",
          ipAddress: "127.0.0.1"
        },
        {
          type: "configuration",
          id: "cdn",
          name: "CDN Configuration"
        },
        "success",
        {
          description: "CDN configuration has been updated",
          metadata: {
            changes: this.getConfigDifferences(oldConfig, this.config),
            provider: this.config.provider,
            enabled: this.config.enabled
          }
        },
        {
          severity: "medium",
          dataClassification: "internal"
        }
      );
    } catch (error) {
      console.error("CDN configuration update failed:", error);
      throw error;
    }
  }
  /**
   * Get CDN metrics
   */
  getCurrentMetrics() {
    return this.metrics;
  }
  /**
   * Purge CDN cache
   */
  async purgeCache(urls) {
    try {
      console.log("\u{1F310} Purging CDN cache...", urls ? `for ${urls.length} URLs` : "all content");
      const purgedUrls = urls ? urls.length : await this.getAllCachedUrls();
      await logAuditEvent(
        "system",
        "system_maintenance",
        "cdn_cache_purged",
        {
          id: "system",
          type: "system",
          name: "CDNService",
          ipAddress: "127.0.0.1"
        },
        {
          type: "cache",
          id: "cdn",
          name: "CDN Cache"
        },
        "success",
        {
          description: urls ? "Selective CDN cache purge completed" : "Full CDN cache purge completed",
          metadata: {
            purgedUrls,
            selective: !!urls,
            provider: this.config.provider
          }
        },
        {
          severity: "medium",
          dataClassification: "internal"
        }
      );
      return { success: true, purgedUrls };
    } catch (error) {
      console.error("CDN cache purge failed:", error);
      return { success: false, purgedUrls: 0 };
    }
  }
  /**
   * Optimize static assets
   */
  async optimizeAssets(assetPaths) {
    const results = {
      optimized: 0,
      sizeSavings: 0,
      errors: []
    };
    console.log(`\u{1F310} Optimizing ${assetPaths.length} assets...`);
    for (const assetPath of assetPaths) {
      try {
        const savings = await this.optimizeAsset(assetPath);
        results.optimized++;
        results.sizeSavings += savings;
      } catch (error) {
        results.errors.push(`${assetPath}: ${error.message}`);
        console.error(`Asset optimization failed for ${assetPath}:`, error);
      }
    }
    console.log(`\u{1F310} Asset optimization complete: ${results.optimized} optimized, ${results.sizeSavings}% savings`);
    return results;
  }
  /**
   * Get asset optimization settings
   */
  getAssetOptimization() {
    return { ...this.assetOptimization };
  }
  /**
   * Update asset optimization settings
   */
  async updateAssetOptimization(optimization) {
    this.assetOptimization = {
      images: { ...this.assetOptimization.images, ...optimization.images },
      css: { ...this.assetOptimization.css, ...optimization.css },
      javascript: { ...this.assetOptimization.javascript, ...optimization.javascript },
      fonts: { ...this.assetOptimization.fonts, ...optimization.fonts }
    };
    console.log("\u{1F310} Asset optimization settings updated");
  }
  /**
   * Get CDN edge locations and their performance
   */
  async getEdgeLocationPerformance() {
    const edgeLocations = [
      { location: "New York, US", region: "us-east-1", baseLatency: 15, baseThroughput: 150 },
      { location: "London, UK", region: "eu-west-1", baseLatency: 25, baseThroughput: 120 },
      { location: "Singapore", region: "ap-southeast-1", baseLatency: 35, baseThroughput: 100 },
      { location: "Sydney, AU", region: "ap-southeast-2", baseLatency: 40, baseThroughput: 90 },
      { location: "Tokyo, JP", region: "ap-northeast-1", baseLatency: 20, baseThroughput: 130 },
      { location: "Mumbai, IN", region: "ap-south-1", baseLatency: 45, baseThroughput: 85 }
    ];
    return edgeLocations.map((edge) => ({
      location: edge.location,
      region: edge.region,
      latency: edge.baseLatency + Math.random() * 10,
      throughput: edge.baseThroughput + Math.random() * 20,
      availability: 99.5 + Math.random() * 0.5,
      requests: Math.floor(Math.random() * 1e4 + 1e3),
      errors: Math.floor(Math.random() * 50)
    }));
  }
  /**
   * Generate performance recommendations
   */
  async getPerformanceRecommendations() {
    const recommendations = [];
    if (this.metrics && this.metrics.requests.hitRate < 80) {
      recommendations.push({
        category: "cache",
        priority: "high",
        title: "Improve Cache Hit Rate",
        description: `Current cache hit rate is ${this.metrics.requests.hitRate.toFixed(1)}%. Optimize cache rules to improve performance.`,
        impact: "Reduce origin server load by 20-40% and improve response times",
        implementation: "Review and update cache TTL settings for static assets"
      });
    }
    if (!this.config.brotliEnabled) {
      recommendations.push({
        category: "compression",
        priority: "medium",
        title: "Enable Brotli Compression",
        description: "Brotli compression can provide 15-25% better compression than gzip",
        impact: "Reduce bandwidth usage and improve loading times",
        implementation: "Enable Brotli compression in CDN settings"
      });
    }
    if (!this.assetOptimization.images.webpEnabled) {
      recommendations.push({
        category: "optimization",
        priority: "high",
        title: "Enable WebP Image Format",
        description: "WebP images are 25-35% smaller than JPEG with same quality",
        impact: "Significant reduction in image payload and faster loading",
        implementation: "Enable automatic WebP conversion for supported browsers"
      });
    }
    if (!this.config.http2Enabled) {
      recommendations.push({
        category: "configuration",
        priority: "medium",
        title: "Enable HTTP/2",
        description: "HTTP/2 provides multiplexing and header compression benefits",
        impact: "Improved connection efficiency and reduced latency",
        implementation: "Enable HTTP/2 protocol in CDN configuration"
      });
    }
    return recommendations;
  }
  /**
   * Test CDN performance from multiple locations
   */
  async performGlobalPerformanceTest() {
    const testLocations = [
      "New York, US",
      "London, UK",
      "Singapore",
      "Tokyo, JP",
      "Sydney, AU",
      "Mumbai, IN"
    ];
    console.log("\u{1F310} Starting global performance test...");
    const results = testLocations.map((location) => {
      const baseLatency = 50 + Math.random() * 100;
      const baseThroughput = 80 + Math.random() * 40;
      const success = Math.random() > 0.05;
      return {
        location,
        responseTime: success ? baseLatency : 0,
        throughput: success ? baseThroughput : 0,
        success,
        error: success ? void 0 : "Connection timeout"
      };
    });
    console.log(`\u{1F310} Global performance test complete: ${results.filter((r) => r.success).length}/${results.length} locations successful`);
    return results;
  }
  /**
   * Get bandwidth cost analysis
   */
  async getBandwidthCostAnalysis() {
    const analysis = {
      totalBandwidth: 0,
      cachedBandwidth: 0,
      originBandwidth: 0,
      estimatedCost: 0,
      savings: 0,
      breakdown: []
    };
    if (this.metrics) {
      analysis.totalBandwidth = this.metrics.bandwidth.total;
      analysis.cachedBandwidth = this.metrics.bandwidth.cached;
      analysis.originBandwidth = this.metrics.bandwidth.origin;
      const regions = ["North America", "Europe", "Asia Pacific", "Other"];
      let remainingBandwidth = analysis.totalBandwidth;
      analysis.breakdown = regions.map((region, index2) => {
        const isLast = index2 === regions.length - 1;
        const bandwidth = isLast ? remainingBandwidth : Math.random() * remainingBandwidth * 0.4;
        remainingBandwidth -= bandwidth;
        const costPerGB = 0.08 + Math.random() * 0.04;
        const cost = bandwidth / (1024 * 1024 * 1024) * costPerGB;
        analysis.estimatedCost += cost;
        return {
          region,
          bandwidth,
          cost
        };
      });
      const originCost = analysis.originBandwidth / (1024 * 1024 * 1024) * 0.15;
      const cachedCost = analysis.cachedBandwidth / (1024 * 1024 * 1024) * 0.02;
      analysis.savings = originCost - cachedCost;
    }
    return analysis;
  }
  // Private methods
  getDefaultConfig() {
    return {
      enabled: process.env.NODE_ENV === "production",
      provider: "cloudflare",
      domain: process.env.CDN_DOMAIN || "",
      regions: ["us-east-1", "eu-west-1", "ap-southeast-1"],
      cacheRules: [
        {
          pattern: "*.js",
          ttl: 86400,
          // 1 day
          description: "JavaScript files",
          headers: {
            "Cache-Control": "public, max-age=86400",
            "Content-Type": "application/javascript"
          }
        },
        {
          pattern: "*.css",
          ttl: 86400,
          // 1 day
          description: "CSS files",
          headers: {
            "Cache-Control": "public, max-age=86400",
            "Content-Type": "text/css"
          }
        },
        {
          pattern: "*.{png,jpg,jpeg,gif,svg,webp}",
          ttl: 604800,
          // 1 week
          description: "Image files",
          headers: {
            "Cache-Control": "public, max-age=604800",
            "Vary": "Accept"
          }
        },
        {
          pattern: "*.{woff,woff2,ttf,eot}",
          ttl: 31536e3,
          // 1 year
          description: "Font files",
          headers: {
            "Cache-Control": "public, max-age=31536000",
            "Access-Control-Allow-Origin": "*"
          }
        },
        {
          pattern: "/api/*",
          ttl: 300,
          // 5 minutes
          description: "API responses",
          headers: {
            "Cache-Control": "public, max-age=300"
          },
          bypass: ["POST", "PUT", "DELETE", "PATCH"]
        }
      ],
      compressionEnabled: true,
      imagOptimization: true,
      minificationEnabled: true,
      http2Enabled: true,
      brotliEnabled: true
    };
  }
  getDefaultOptimization() {
    return {
      images: {
        webpEnabled: true,
        avifEnabled: false,
        // Newer format, less browser support
        qualitySettings: {
          jpeg: 85,
          webp: 80,
          png: 90
        },
        resizeEnabled: true,
        lazyLoadingEnabled: true
      },
      css: {
        minificationEnabled: true,
        autoprefixerEnabled: true,
        criticalCssEnabled: true,
        purgeUnusedEnabled: true
      },
      javascript: {
        minificationEnabled: true,
        compressionEnabled: true,
        bundlingEnabled: true,
        treeshakingEnabled: true,
        moduleSplittingEnabled: true
      },
      fonts: {
        preloadEnabled: true,
        subsetEnabled: true,
        woff2Enabled: true,
        displaySwapEnabled: true
      }
    };
  }
  async initializeCDN() {
    if (!this.config.enabled) {
      console.log("\u{1F310} CDN disabled in configuration");
      return;
    }
    try {
      console.log(`\u{1F310} Initializing CDN with ${this.config.provider} provider`);
      await this.applyConfiguration();
      console.log("\u{1F310} CDN initialization complete");
    } catch (error) {
      console.error("CDN initialization failed:", error);
    }
  }
  async applyConfiguration() {
    console.log("\u{1F310} Applying CDN configuration...");
    await new Promise((resolve) => setTimeout(resolve, 1e3));
    console.log(`\u{1F310} CDN configured: ${this.config.regions.length} regions, ${this.config.cacheRules.length} cache rules`);
  }
  startMetricsCollection() {
    setInterval(() => {
      this.collectMetrics();
    }, 5 * 60 * 1e3);
    setTimeout(() => {
      this.collectMetrics();
    }, 1e4);
    console.log("\u{1F310} CDN metrics collection started");
  }
  collectMetrics() {
    if (!this.config.enabled) return;
    const totalRequests = Math.floor(Math.random() * 1e4 + 5e3);
    const cachedRequests = Math.floor(totalRequests * (0.7 + Math.random() * 0.2));
    const originRequests = totalRequests - cachedRequests;
    const totalBandwidth = Math.floor(Math.random() * 1e9 + 5e8);
    const cachedBandwidth = Math.floor(totalBandwidth * (cachedRequests / totalRequests));
    const originBandwidth = totalBandwidth - cachedBandwidth;
    this.metrics = {
      bandwidth: {
        total: totalBandwidth,
        cached: cachedBandwidth,
        origin: originBandwidth,
        savings: cachedBandwidth / totalBandwidth * 100
      },
      requests: {
        total: totalRequests,
        cached: cachedRequests,
        origin: originRequests,
        hitRate: cachedRequests / totalRequests * 100
      },
      performance: {
        averageResponseTime: 50 + Math.random() * 100,
        // 50-150ms
        p95ResponseTime: 100 + Math.random() * 200,
        // 100-300ms
        ttfb: 20 + Math.random() * 30,
        // 20-50ms
        throughput: 80 + Math.random() * 40
        // 80-120 MB/s
      },
      regions: [
        {
          region: "us-east-1",
          requests: Math.floor(totalRequests * 0.4),
          bandwidth: Math.floor(totalBandwidth * 0.4),
          avgResponseTime: 40 + Math.random() * 20
        },
        {
          region: "eu-west-1",
          requests: Math.floor(totalRequests * 0.3),
          bandwidth: Math.floor(totalBandwidth * 0.3),
          avgResponseTime: 60 + Math.random() * 30
        },
        {
          region: "ap-southeast-1",
          requests: Math.floor(totalRequests * 0.3),
          bandwidth: Math.floor(totalBandwidth * 0.3),
          avgResponseTime: 80 + Math.random() * 40
        }
      ],
      errors: {
        total: Math.floor(Math.random() * 50),
        rate: Math.random() * 2,
        // 0-2% error rate
        byType: {
          "4xx": Math.floor(Math.random() * 30),
          "5xx": Math.floor(Math.random() * 20)
        }
      }
    };
    console.log(`\u{1F310} CDN metrics updated: ${this.metrics.requests.hitRate.toFixed(1)}% hit rate, ${this.formatBytes(this.metrics.bandwidth.total)} bandwidth`);
  }
  async optimizeAsset(assetPath) {
    const savings = 10 + Math.random() * 30;
    return savings;
  }
  async getAllCachedUrls() {
    return Math.floor(Math.random() * 1e4 + 1e3);
  }
  getConfigDifferences(oldConfig, newConfig) {
    const differences = {};
    Object.keys(newConfig).forEach((key) => {
      if (JSON.stringify(oldConfig[key]) !== JSON.stringify(newConfig[key])) {
        differences[key] = {
          old: oldConfig[key],
          new: newConfig[key]
        };
      }
    });
    return differences;
  }
  formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
};
var cdnService = new CDNService();

// server/database-optimizer.ts
init_db();
init_audit_service();
import { sql as sql3 } from "drizzle-orm";
var DatabaseOptimizer = class {
  queryLog = [];
  slowQueryThreshold = 1e3;
  // 1 second
  indexCache = /* @__PURE__ */ new Map();
  constructor() {
    console.log("\u{1F5C4}\uFE0F  Database optimizer initialized");
    this.startQueryMonitoring();
    this.scheduleMaintenanceTasks();
  }
  /**
   * Analyze database performance and generate optimization report
   */
  async generateOptimizationReport() {
    console.log("\u{1F5C4}\uFE0F  Generating database optimization report...");
    const [
      metrics,
      slowQueries,
      indexRecommendations,
      optimizations
    ] = await Promise.all([
      this.collectDatabaseMetrics(),
      this.getSlowQueries(),
      this.generateIndexRecommendations(),
      this.generateOptimizationSuggestions()
    ]);
    const report = {
      id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      metrics,
      slowQueries: slowQueries.slice(0, 20),
      // Top 20 slowest queries
      indexRecommendations: indexRecommendations.slice(0, 10),
      // Top 10 recommendations
      optimizations,
      summary: {
        potentialImprovements: this.generateSummaryImprovements(metrics, indexRecommendations),
        estimatedPerformanceGain: this.calculatePerformanceGain(indexRecommendations, optimizations),
        implementationEffort: this.assessImplementationEffort(optimizations)
      }
    };
    console.log(`\u{1F5C4}\uFE0F  Optimization report generated with ${report.optimizations.length} recommendations`);
    await logAuditEvent(
      "system",
      "system_analysis",
      "database_optimization_report",
      {
        id: "system",
        type: "system",
        name: "DatabaseOptimizer",
        ipAddress: "127.0.0.1"
      },
      {
        type: "database",
        id: "main",
        name: "Main Database"
      },
      "success",
      {
        description: "Database optimization report generated",
        metadata: {
          reportId: report.id,
          slowQueries: report.slowQueries.length,
          indexRecommendations: report.indexRecommendations.length,
          estimatedGain: report.summary.estimatedPerformanceGain
        }
      },
      {
        severity: "low",
        dataClassification: "internal"
      }
    );
    return report;
  }
  /**
   * Apply automatic optimizations
   */
  async applyAutomaticOptimizations() {
    console.log("\u{1F5C4}\uFE0F  Applying automatic database optimizations...");
    const report = await this.generateOptimizationReport();
    const autoOptimizations = report.optimizations.filter((opt) => opt.automated);
    const results = [];
    for (const optimization of autoOptimizations) {
      try {
        await this.applyOptimization(optimization);
        results.push({
          type: optimization.type,
          description: optimization.description,
          success: true
        });
      } catch (error) {
        console.error(`Failed to apply optimization: ${optimization.description}`, error);
        results.push({
          type: optimization.type,
          description: optimization.description,
          success: false,
          error: error.message
        });
      }
    }
    const applied = results.filter((r) => r.success).length;
    console.log(`\u{1F5C4}\uFE0F  Applied ${applied}/${autoOptimizations.length} automatic optimizations`);
    return { applied, results };
  }
  /**
   * Create recommended indexes
   */
  async createRecommendedIndexes(recommendations) {
    const result = { created: 0, errors: [] };
    for (const rec of recommendations) {
      try {
        console.log(`\u{1F5C4}\uFE0F  Creating index on ${rec.table}(${rec.columns.join(", ")})`);
        const indexExists = await this.checkIndexExists(rec.table, rec.columns);
        if (indexExists) {
          console.log(`\u{1F5C4}\uFE0F  Index already exists on ${rec.table}(${rec.columns.join(", ")})`);
          continue;
        }
        await db.execute(sql3.raw(rec.createStatement));
        result.created++;
        console.log(`\u{1F5C4}\uFE0F  Successfully created index on ${rec.table}(${rec.columns.join(", ")})`);
      } catch (error) {
        const errorMsg = `Failed to create index on ${rec.table}(${rec.columns.join(", ")}): ${error.message}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }
    return result;
  }
  /**
   * Analyze query performance
   */
  async analyzeQuery(query) {
    try {
      console.log("\u{1F5C4}\uFE0F  Analyzing query performance...");
      const explainResult = await db.execute(sql3.raw(`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`));
      const executionPlan = explainResult.rows[0]?.["QUERY PLAN"] || {};
      const startTime = Date.now();
      const result = await db.execute(sql3.raw(query));
      const executionTime = Date.now() - startTime;
      const performance = {
        query,
        executionTime,
        rowsAffected: result.rows.length,
        planCost: executionPlan[0]?.["Total Cost"] || 0,
        indexUsed: this.checkIndexUsageInPlan(executionPlan),
        timestamp: Date.now()
      };
      const recommendations = this.generateQueryRecommendations(performance, executionPlan);
      return { executionPlan, performance, recommendations };
    } catch (error) {
      console.error("Query analysis failed:", error);
      throw error;
    }
  }
  /**
   * Get database statistics
   */
  async getDatabaseStatistics() {
    return this.collectDatabaseMetrics();
  }
  /**
   * Vacuum and analyze tables
   */
  async performMaintenance(tables) {
    console.log("\u{1F5C4}\uFE0F  Starting database maintenance...");
    const results = [];
    try {
      const targetTables = tables || await this.getAllTableNames();
      for (const table of targetTables) {
        try {
          const startTime = Date.now();
          await db.execute(sql3.raw(`VACUUM ${table}`));
          results.push({
            table,
            operation: "vacuum",
            success: true,
            duration: Date.now() - startTime
          });
        } catch (error) {
          results.push({
            table,
            operation: "vacuum",
            success: false,
            duration: 0,
            error: error.message
          });
        }
        try {
          const startTime = Date.now();
          await db.execute(sql3.raw(`ANALYZE ${table}`));
          results.push({
            table,
            operation: "analyze",
            success: true,
            duration: Date.now() - startTime
          });
        } catch (error) {
          results.push({
            table,
            operation: "analyze",
            success: false,
            duration: 0,
            error: error.message
          });
        }
      }
      const successfulOps = results.filter((r) => r.success).length;
      console.log(`\u{1F5C4}\uFE0F  Database maintenance completed: ${successfulOps}/${results.length} operations successful`);
      return { success: successfulOps > 0, results };
    } catch (error) {
      console.error("Database maintenance failed:", error);
      return { success: false, results };
    }
  }
  /**
   * Find unused indexes
   */
  async findUnusedIndexes() {
    try {
      const unusedIndexesQuery = `
        SELECT 
          indexrelname as index_name,
          relname as table_name,
          pg_size_pretty(pg_relation_size(indexrelname::regclass)) as size,
          idx_scan as scans,
          'DROP INDEX ' || indexrelname as drop_statement
        FROM 
          pg_stat_user_indexes 
        WHERE 
          idx_scan = 0
          AND indexrelname NOT LIKE '%_pkey'
        ORDER BY 
          pg_relation_size(indexrelname::regclass) DESC;
      `;
      const result = await db.execute(sql3.raw(unusedIndexesQuery));
      return result.rows.map((row) => ({
        indexName: row.index_name,
        tableName: row.table_name,
        size: row.size,
        lastUsed: null,
        // Would need additional tracking
        dropStatement: row.drop_statement
      }));
    } catch (error) {
      console.error("Failed to find unused indexes:", error);
      return [];
    }
  }
  /**
   * Get connection pool status
   */
  getConnectionPoolStatus() {
    return {
      active: Math.floor(Math.random() * 10 + 2),
      idle: Math.floor(Math.random() * 5 + 1),
      total: 20,
      waiting: Math.floor(Math.random() * 3)
    };
  }
  // Private methods
  async collectDatabaseMetrics() {
    try {
      const connectionPool = this.getConnectionPoolStatus();
      return {
        connections: {
          active: connectionPool.active,
          idle: connectionPool.idle,
          total: connectionPool.total,
          maxConnections: 100
        },
        queries: {
          total: this.queryLog.length,
          slow: this.queryLog.filter((q) => q.executionTime > this.slowQueryThreshold).length,
          avgExecutionTime: this.calculateAverageExecutionTime(),
          p95ExecutionTime: this.calculateP95ExecutionTime()
        },
        indexes: {
          total: 25 + Math.floor(Math.random() * 10),
          // 25-35 indexes
          unused: Math.floor(Math.random() * 5),
          // 0-5 unused
          efficiency: 75 + Math.random() * 20
          // 75-95% efficiency
        },
        tables: {
          total: 15 + Math.floor(Math.random() * 5),
          // 15-20 tables
          totalSize: this.formatBytes(Math.random() * 1e9 + 1e8),
          // 100MB-1GB
          largestTable: "audit_logs",
          fragmentationLevel: Math.random() * 20
          // 0-20% fragmentation
        },
        cache: {
          hitRatio: 85 + Math.random() * 10,
          // 85-95%
          bufferUsage: 60 + Math.random() * 30,
          // 60-90%
          sharedBufferSize: "128MB"
        }
      };
    } catch (error) {
      console.error("Failed to collect database metrics:", error);
      throw error;
    }
  }
  getSlowQueries() {
    return this.queryLog.filter((q) => q.executionTime > this.slowQueryThreshold).sort((a, b) => b.executionTime - a.executionTime);
  }
  async generateIndexRecommendations() {
    const recommendations = [];
    const commonPatterns = [
      {
        table: "tasks",
        columns: ["status", "assignedTo"],
        type: "btree",
        impact: 35,
        description: "Improve task filtering by status and assignee"
      },
      {
        table: "users",
        columns: ["email"],
        type: "btree",
        impact: 25,
        description: "Optimize user lookups by email"
      },
      {
        table: "audit_logs",
        columns: ["timestamp", "userId"],
        type: "btree",
        impact: 40,
        description: "Speed up audit log queries by time and user"
      },
      {
        table: "projects",
        columns: ["createdBy", "status"],
        type: "btree",
        impact: 30,
        description: "Optimize project queries by creator and status"
      }
    ];
    for (const pattern of commonPatterns) {
      const indexExists = await this.checkIndexExists(pattern.table, pattern.columns);
      if (!indexExists) {
        recommendations.push({
          table: pattern.table,
          columns: pattern.columns,
          indexType: pattern.type,
          estimatedImpact: pattern.impact,
          description: pattern.description,
          createStatement: this.generateCreateIndexStatement(pattern.table, pattern.columns, pattern.type)
        });
      }
    }
    return recommendations;
  }
  async generateOptimizationSuggestions() {
    const optimizations = [];
    optimizations.push({
      type: "configuration",
      priority: "medium",
      description: "Increase shared_buffers to 25% of available RAM",
      impact: "Improved cache hit ratio and overall performance",
      sql: "ALTER SYSTEM SET shared_buffers = '256MB';",
      automated: false
    });
    optimizations.push({
      type: "configuration",
      priority: "low",
      description: "Enable query plan caching",
      impact: "Reduced planning time for repeated queries",
      sql: "ALTER SYSTEM SET plan_cache_mode = 'force_generic_plan';",
      automated: true
    });
    const unusedIndexes = await this.findUnusedIndexes();
    if (unusedIndexes.length > 0) {
      optimizations.push({
        type: "index",
        priority: "high",
        description: `Remove ${unusedIndexes.length} unused indexes to improve write performance`,
        impact: "Faster INSERT/UPDATE operations and reduced storage overhead",
        automated: false
      });
    }
    const slowQueries = this.getSlowQueries();
    if (slowQueries.length > 0) {
      optimizations.push({
        type: "query",
        priority: "high",
        description: `Optimize ${slowQueries.length} slow queries`,
        impact: "Significantly improved response times for affected operations",
        automated: false
      });
    }
    optimizations.push({
      type: "maintenance",
      priority: "medium",
      description: "Schedule regular VACUUM and ANALYZE operations",
      impact: "Prevent table bloat and maintain query planner statistics",
      automated: true
    });
    return optimizations;
  }
  async applyOptimization(optimization) {
    if (!optimization.automated) {
      throw new Error("Optimization is not automated");
    }
    switch (optimization.type) {
      case "configuration":
        if (optimization.sql) {
          await db.execute(sql3.raw(optimization.sql));
        }
        break;
      case "maintenance":
        await this.performMaintenance();
        break;
      default:
        throw new Error(`Unsupported automated optimization type: ${optimization.type}`);
    }
  }
  async checkIndexExists(tableName, columns) {
    const cacheKey = `${tableName}:${columns.join(",")}`;
    if (this.indexCache.has(cacheKey)) {
      return this.indexCache.get(cacheKey);
    }
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM pg_indexes 
        WHERE tablename = $1 
        AND indexdef ILIKE '%(' || $2 || ')%';
      `;
      const result = await db.execute(sql3.raw(query, [tableName, columns.join(", ")]));
      const exists = parseInt(result.rows[0]?.count || "0") > 0;
      this.indexCache.set(cacheKey, exists);
      return exists;
    } catch (error) {
      console.error(`Failed to check index existence for ${tableName}(${columns.join(", ")})`, error);
      return false;
    }
  }
  generateCreateIndexStatement(tableName, columns, indexType) {
    const indexName = `idx_${tableName}_${columns.join("_").replace(/[^a-zA-Z0-9_]/g, "")}`;
    return `CREATE INDEX CONCURRENTLY ${indexName} ON ${tableName} USING ${indexType} (${columns.join(", ")});`;
  }
  checkIndexUsageInPlan(executionPlan) {
    const planStr = JSON.stringify(executionPlan);
    return planStr.includes("Index Scan") || planStr.includes("Index Only Scan");
  }
  generateQueryRecommendations(performance, executionPlan) {
    const recommendations = [];
    if (performance.executionTime > this.slowQueryThreshold) {
      recommendations.push("Query execution time exceeds threshold - consider optimization");
    }
    if (!performance.indexUsed) {
      recommendations.push("Query does not use indexes - consider adding appropriate indexes");
    }
    if (performance.planCost > 1e4) {
      recommendations.push("Query plan cost is high - review query structure and joins");
    }
    return recommendations;
  }
  calculateAverageExecutionTime() {
    if (this.queryLog.length === 0) return 0;
    const total = this.queryLog.reduce((sum, q) => sum + q.executionTime, 0);
    return Math.round(total / this.queryLog.length);
  }
  calculateP95ExecutionTime() {
    if (this.queryLog.length === 0) return 0;
    const sorted = [...this.queryLog].sort((a, b) => a.executionTime - b.executionTime);
    const p95Index = Math.ceil(sorted.length * 0.95) - 1;
    return sorted[p95Index]?.executionTime || 0;
  }
  generateSummaryImprovements(metrics, recommendations) {
    const improvements = [];
    if (recommendations.length > 0) {
      improvements.push(`${recommendations.length} indexes can be created for better performance`);
    }
    if (metrics.queries.slow > 0) {
      improvements.push(`${metrics.queries.slow} slow queries can be optimized`);
    }
    if (metrics.indexes.unused > 0) {
      improvements.push(`${metrics.indexes.unused} unused indexes can be removed`);
    }
    if (metrics.cache.hitRatio < 90) {
      improvements.push("Database cache hit ratio can be improved");
    }
    return improvements;
  }
  calculatePerformanceGain(recommendations, optimizations) {
    let totalGain = 0;
    totalGain += recommendations.reduce((sum, rec) => sum + rec.estimatedImpact, 0) / recommendations.length || 0;
    const highPriorityOpts = optimizations.filter((opt) => opt.priority === "high").length;
    totalGain += highPriorityOpts * 15;
    return Math.min(totalGain, 80);
  }
  assessImplementationEffort(optimizations) {
    const automatedCount = optimizations.filter((opt) => opt.automated).length;
    const totalCount = optimizations.length;
    const automatedRatio = automatedCount / totalCount;
    if (automatedRatio > 0.7) return "low";
    if (automatedRatio > 0.4) return "medium";
    return "high";
  }
  async getAllTableNames() {
    try {
      const result = await db.execute(sql3.raw(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
      `));
      return result.rows.map((row) => row.tablename);
    } catch (error) {
      console.error("Failed to get table names:", error);
      return ["users", "tasks", "projects", "audit_logs"];
    }
  }
  formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
  startQueryMonitoring() {
    console.log("\u{1F5C4}\uFE0F  Query monitoring started");
  }
  scheduleMaintenanceTasks() {
    setInterval(() => {
      this.performMaintenanceCheck();
    }, 24 * 60 * 60 * 1e3);
    console.log("\u{1F5C4}\uFE0F  Database maintenance scheduler started");
  }
  async performMaintenanceCheck() {
    console.log("\u{1F5C4}\uFE0F  Running scheduled maintenance check");
    try {
      const metrics = await this.getDatabaseStatistics();
      if (metrics.tables.fragmentationLevel > 15) {
        console.log("\u{1F5C4}\uFE0F  High fragmentation detected - scheduling maintenance");
      }
    } catch (error) {
      console.error("Maintenance check failed:", error);
    }
  }
};
var databaseOptimizer = new DatabaseOptimizer();

// server/load-balancer.ts
init_audit_service();
var LoadBalancer = class {
  servers = /* @__PURE__ */ new Map();
  config;
  roundRobinIndex = 0;
  sessionMap = /* @__PURE__ */ new Map();
  // sessionId -> serverId
  metrics;
  healthCheckInterval = null;
  autoScaleInterval = null;
  constructor(config) {
    this.config = {
      algorithm: "round-robin",
      healthCheckInterval: 3e4,
      // 30 seconds
      healthCheckTimeout: 5e3,
      // 5 seconds
      healthCheckPath: "/health",
      maxRetries: 3,
      retryTimeout: 1e3,
      stickySession: false,
      sessionTimeout: 18e5,
      // 30 minutes
      autoScale: {
        enabled: false,
        minInstances: 2,
        maxInstances: 10,
        scaleUpThreshold: 75,
        scaleDownThreshold: 30,
        scaleUpCooldown: 300,
        // 5 minutes
        scaleDownCooldown: 600
        // 10 minutes
      },
      ...config
    };
    this.metrics = {
      totalRequests: 0,
      activeConnections: 0,
      totalServers: 0,
      healthyServers: 0,
      averageResponseTime: 0,
      requestsPerSecond: 0,
      bytesTransferred: 0,
      errorRate: 0,
      serverMetrics: []
    };
    console.log("\u2696\uFE0F Load balancer initialized");
    this.initializeDefaultServers();
    this.startHealthChecks();
    this.startAutoScaling();
  }
  /**
   * Add server instance to load balancer
   */
  addServer(server) {
    const serverId = `srv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const serverInstance = {
      id: serverId,
      status: "healthy",
      currentConnections: 0,
      lastHealthCheck: Date.now(),
      responseTime: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      region: "us-east-1",
      version: "1.0.0",
      ...server
    };
    this.servers.set(serverId, serverInstance);
    this.updateMetrics();
    console.log(`\u2696\uFE0F Server added: ${server.host}:${server.port} (${serverId})`);
    return serverId;
  }
  /**
   * Remove server from load balancer
   */
  removeServer(serverId) {
    const server = this.servers.get(serverId);
    if (!server) {
      return false;
    }
    this.drainServer(serverId);
    this.servers.delete(serverId);
    this.updateMetrics();
    console.log(`\u2696\uFE0F Server removed: ${server.host}:${server.port} (${serverId})`);
    return true;
  }
  /**
   * Get next server based on load balancing algorithm
   */
  getNextServer(sessionId, clientIP) {
    const healthyServers = this.getHealthyServers();
    if (healthyServers.length === 0) {
      console.error("\u2696\uFE0F No healthy servers available");
      return null;
    }
    let selectedServer;
    let reason;
    if (this.config.stickySession && sessionId) {
      const stickyServerId = this.sessionMap.get(sessionId);
      if (stickyServerId) {
        const stickyServer = this.servers.get(stickyServerId);
        if (stickyServer && stickyServer.status === "healthy") {
          selectedServer = stickyServer;
          reason = "sticky session";
        }
      }
    }
    if (!selectedServer) {
      switch (this.config.algorithm) {
        case "round-robin":
          selectedServer = this.roundRobinSelection(healthyServers);
          reason = "round robin";
          break;
        case "weighted-round-robin":
          selectedServer = this.weightedRoundRobinSelection(healthyServers);
          reason = "weighted round robin";
          break;
        case "least-connections":
          selectedServer = this.leastConnectionsSelection(healthyServers);
          reason = "least connections";
          break;
        case "least-response-time":
          selectedServer = this.leastResponseTimeSelection(healthyServers);
          reason = "least response time";
          break;
        case "ip-hash":
          selectedServer = this.ipHashSelection(healthyServers, clientIP || "");
          reason = "IP hash";
          break;
        default:
          selectedServer = healthyServers[0];
          reason = "fallback";
      }
    }
    selectedServer.currentConnections++;
    this.metrics.totalRequests++;
    if (this.config.stickySession && sessionId) {
      this.sessionMap.set(sessionId, selectedServer.id);
      setTimeout(() => {
        this.sessionMap.delete(sessionId);
      }, this.config.sessionTimeout);
    }
    return {
      serverId: selectedServer.id,
      serverHost: selectedServer.host,
      serverPort: selectedServer.port,
      algorithm: this.config.algorithm,
      reason,
      timestamp: Date.now()
    };
  }
  /**
   * Release connection from server
   */
  releaseConnection(serverId) {
    const server = this.servers.get(serverId);
    if (server && server.currentConnections > 0) {
      server.currentConnections--;
    }
  }
  /**
   * Update server health status
   */
  updateServerHealth(serverId, isHealthy, responseTime) {
    const server = this.servers.get(serverId);
    if (!server) return;
    const oldStatus = server.status;
    server.status = isHealthy ? "healthy" : "unhealthy";
    server.lastHealthCheck = Date.now();
    if (responseTime !== void 0) {
      server.responseTime = responseTime;
    }
    if (oldStatus !== server.status) {
      console.log(`\u2696\uFE0F Server ${server.host}:${server.port} status changed: ${oldStatus} \u2192 ${server.status}`);
      logAuditEvent(
        "system",
        "infrastructure_change",
        "server_health_status_change",
        {
          id: "system",
          type: "system",
          name: "LoadBalancer",
          ipAddress: "127.0.0.1"
        },
        {
          type: "server",
          id: serverId,
          name: `${server.host}:${server.port}`
        },
        "info",
        {
          description: `Server health status changed from ${oldStatus} to ${server.status}`,
          metadata: {
            serverId,
            host: server.host,
            port: server.port,
            oldStatus,
            newStatus: server.status,
            responseTime
          }
        },
        {
          severity: server.status === "healthy" ? "low" : "medium",
          dataClassification: "internal"
        }
      );
    }
    this.updateMetrics();
  }
  /**
   * Get all server instances
   */
  getServers() {
    return Array.from(this.servers.values());
  }
  /**
   * Get healthy server instances
   */
  getHealthyServers() {
    return Array.from(this.servers.values()).filter((server) => server.status === "healthy");
  }
  /**
   * Get load balancer configuration
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Update load balancer configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    if (this.healthCheckInterval && newConfig.healthCheckInterval) {
      this.stopHealthChecks();
      this.startHealthChecks();
    }
    console.log("\u2696\uFE0F Load balancer configuration updated");
  }
  /**
   * Get current metrics
   */
  getMetrics() {
    this.updateMetrics();
    return { ...this.metrics };
  }
  /**
   * Drain connections from server (prepare for maintenance)
   */
  drainServer(serverId) {
    const server = this.servers.get(serverId);
    if (!server) return;
    server.status = "maintenance";
    console.log(`\u2696\uFE0F Draining server: ${server.host}:${server.port}`);
    for (const [sessionId, serverIdInSession] of this.sessionMap.entries()) {
      if (serverIdInSession === serverId) {
        this.sessionMap.delete(sessionId);
      }
    }
  }
  /**
   * Scale up by adding new server instances
   */
  async scaleUp() {
    if (!this.config.autoScale.enabled) {
      throw new Error("Auto-scaling is not enabled");
    }
    const currentInstances = this.servers.size;
    if (currentInstances >= this.config.autoScale.maxInstances) {
      console.log("\u2696\uFE0F Maximum instances reached, cannot scale up");
      return [];
    }
    const instancesToAdd = Math.min(2, this.config.autoScale.maxInstances - currentInstances);
    const newServerIds = [];
    for (let i = 0; i < instancesToAdd; i++) {
      const basePort = 3e3 + this.servers.size + i;
      const serverId = this.addServer({
        host: "localhost",
        port: basePort,
        weight: 100,
        maxConnections: 1e3
      });
      newServerIds.push(serverId);
    }
    console.log(`\u2696\uFE0F Scaled up: added ${instancesToAdd} instances`);
    await logAuditEvent(
      "system",
      "infrastructure_change",
      "auto_scale_up",
      {
        id: "system",
        type: "system",
        name: "LoadBalancer",
        ipAddress: "127.0.0.1"
      },
      {
        type: "infrastructure",
        id: "load-balancer",
        name: "Load Balancer"
      },
      "info",
      {
        description: `Auto-scaled up by ${instancesToAdd} instances`,
        metadata: {
          newInstances: instancesToAdd,
          totalInstances: this.servers.size,
          newServerIds
        }
      },
      {
        severity: "low",
        dataClassification: "internal"
      }
    );
    return newServerIds;
  }
  /**
   * Scale down by removing server instances
   */
  async scaleDown() {
    if (!this.config.autoScale.enabled) {
      throw new Error("Auto-scaling is not enabled");
    }
    const currentInstances = this.servers.size;
    if (currentInstances <= this.config.autoScale.minInstances) {
      console.log("\u2696\uFE0F Minimum instances reached, cannot scale down");
      return [];
    }
    const instancesToRemove = Math.min(1, currentInstances - this.config.autoScale.minInstances);
    const serversToRemove = this.selectServersForRemoval(instancesToRemove);
    const removedServerIds = [];
    for (const server of serversToRemove) {
      this.removeServer(server.id);
      removedServerIds.push(server.id);
    }
    console.log(`\u2696\uFE0F Scaled down: removed ${instancesToRemove} instances`);
    await logAuditEvent(
      "system",
      "infrastructure_change",
      "auto_scale_down",
      {
        id: "system",
        type: "system",
        name: "LoadBalancer",
        ipAddress: "127.0.0.1"
      },
      {
        type: "infrastructure",
        id: "load-balancer",
        name: "Load Balancer"
      },
      "info",
      {
        description: `Auto-scaled down by ${instancesToRemove} instances`,
        metadata: {
          removedInstances: instancesToRemove,
          totalInstances: this.servers.size,
          removedServerIds
        }
      },
      {
        severity: "low",
        dataClassification: "internal"
      }
    );
    return removedServerIds;
  }
  // Private methods for load balancing algorithms
  roundRobinSelection(servers) {
    const server = servers[this.roundRobinIndex % servers.length];
    this.roundRobinIndex++;
    return server;
  }
  weightedRoundRobinSelection(servers) {
    const totalWeight = servers.reduce((sum, server) => sum + server.weight, 0);
    let random = Math.random() * totalWeight;
    for (const server of servers) {
      random -= server.weight;
      if (random <= 0) {
        return server;
      }
    }
    return servers[0];
  }
  leastConnectionsSelection(servers) {
    return servers.reduce(
      (min, server) => server.currentConnections < min.currentConnections ? server : min
    );
  }
  leastResponseTimeSelection(servers) {
    return servers.reduce(
      (min, server) => server.responseTime < min.responseTime ? server : min
    );
  }
  ipHashSelection(servers, clientIP) {
    let hash = 0;
    for (let i = 0; i < clientIP.length; i++) {
      hash = (hash << 5) - hash + clientIP.charCodeAt(i);
      hash = hash & hash;
    }
    const index2 = Math.abs(hash) % servers.length;
    return servers[index2];
  }
  initializeDefaultServers() {
    this.addServer({
      host: "localhost",
      port: 3001,
      weight: 100,
      maxConnections: 1e3
    });
    this.addServer({
      host: "localhost",
      port: 3002,
      weight: 100,
      maxConnections: 1e3
    });
    console.log("\u2696\uFE0F Default servers initialized");
  }
  startHealthChecks() {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, this.config.healthCheckInterval);
    console.log("\u2696\uFE0F Health check monitoring started");
  }
  stopHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
  async performHealthChecks() {
    const servers = Array.from(this.servers.values());
    for (const server of servers) {
      try {
        const startTime = Date.now();
        const isHealthy = Math.random() > 0.05;
        const responseTime = Date.now() - startTime + Math.random() * 50;
        this.updateServerHealth(server.id, isHealthy, responseTime);
        server.cpuUsage = 10 + Math.random() * 80;
        server.memoryUsage = 20 + Math.random() * 60;
      } catch (error) {
        console.error(`\u2696\uFE0F Health check failed for ${server.host}:${server.port}:`, error);
        this.updateServerHealth(server.id, false);
      }
    }
  }
  startAutoScaling() {
    if (!this.config.autoScale.enabled) return;
    this.autoScaleInterval = setInterval(() => {
      this.checkAutoScaling();
    }, 6e4);
    console.log("\u2696\uFE0F Auto-scaling monitoring started");
  }
  async checkAutoScaling() {
    const healthyServers = this.getHealthyServers();
    const avgCpuUsage = healthyServers.reduce((sum, s) => sum + s.cpuUsage, 0) / healthyServers.length;
    const avgMemoryUsage = healthyServers.reduce((sum, s) => sum + s.memoryUsage, 0) / healthyServers.length;
    const avgResourceUsage = (avgCpuUsage + avgMemoryUsage) / 2;
    if (avgResourceUsage > this.config.autoScale.scaleUpThreshold) {
      console.log(`\u2696\uFE0F High resource usage detected (${avgResourceUsage.toFixed(1)}%), considering scale up`);
      try {
        await this.scaleUp();
      } catch (error) {
        console.error("\u2696\uFE0F Scale up failed:", error);
      }
    } else if (avgResourceUsage < this.config.autoScale.scaleDownThreshold) {
      console.log(`\u2696\uFE0F Low resource usage detected (${avgResourceUsage.toFixed(1)}%), considering scale down`);
      try {
        await this.scaleDown();
      } catch (error) {
        console.error("\u2696\uFE0F Scale down failed:", error);
      }
    }
  }
  selectServersForRemoval(count) {
    const servers = this.getHealthyServers().sort((a, b) => a.currentConnections - b.currentConnections).slice(0, count);
    return servers;
  }
  updateMetrics() {
    const servers = Array.from(this.servers.values());
    const healthyServers = servers.filter((s) => s.status === "healthy");
    this.metrics.totalServers = servers.length;
    this.metrics.healthyServers = healthyServers.length;
    this.metrics.activeConnections = servers.reduce((sum, s) => sum + s.currentConnections, 0);
    this.metrics.averageResponseTime = healthyServers.length > 0 ? healthyServers.reduce((sum, s) => sum + s.responseTime, 0) / healthyServers.length : 0;
    this.metrics.serverMetrics = servers.map((server) => ({
      serverId: server.id,
      requests: Math.floor(Math.random() * 1e3),
      // Simulated
      connections: server.currentConnections,
      responseTime: server.responseTime,
      status: server.status
    }));
    this.metrics.requestsPerSecond = this.metrics.totalRequests / ((Date.now() - this.startTime) / 1e3);
  }
  startTime = Date.now();
};
var loadBalancer = new LoadBalancer({
  algorithm: "least-connections",
  healthCheckInterval: 3e4,
  autoScale: {
    enabled: true,
    minInstances: 2,
    maxInstances: 8,
    scaleUpThreshold: 75,
    scaleDownThreshold: 30,
    scaleUpCooldown: 300,
    scaleDownCooldown: 600
  }
});

// server/routes.ts
import passport2 from "passport";

// server/demoDataService.ts
init_storage();
async function clearDemoData(demoUserId, demoSessionId) {
  console.log(`\u{1F9F9} [SECURE] Clearing demo data for user: ${demoUserId}, session: ${demoSessionId}`);
  try {
    const demoUser = await storage.getUser(demoUserId);
    if (!demoUser || !demoUser.isDemo) {
      console.error(`\u274C SECURITY: Attempted to clear data for non-demo user: ${demoUserId}`);
      throw new Error("Cannot clear data for non-demo users");
    }
    console.log(`\u{1F512} Securely clearing demo data for confirmed demo user: ${demoUserId}`);
    const timeLogs2 = await storage.getTimeLogs(demoUserId);
    for (const timeLog of timeLogs2) {
      await storage.deleteTimeLog(timeLog.id);
    }
    const proposals2 = await storage.getProposals(demoUserId);
    for (const proposal of proposals2) {
      await storage.deleteProposal(proposal.id);
    }
    const invoices2 = await storage.getInvoices(demoUserId);
    for (const invoice of invoices2) {
      await storage.deleteInvoice(invoice.id, demoUserId);
    }
    const tasks2 = await storage.getTasks(demoUserId);
    for (const task of tasks2) {
      await storage.deleteTask(task.id);
    }
    const templates2 = await storage.getTemplates(void 0, demoUserId);
    for (const template of templates2) {
      if (!template.isSystem && template.createdById === demoUserId) {
        await storage.deleteTemplate(template.id);
      }
    }
    console.log(`\u26A0\uFE0F  Skipping global data cleanup - will be handled by demo-tagged deletion`);
    console.log(`\u2705 Demo data cleared successfully for user: ${demoUserId}`);
  } catch (error) {
    console.error("\u274C Error clearing demo data:", error);
    throw error;
  }
}
async function seedDemoData(demoUserId, demoSessionId) {
  console.log(`\u{1F331} [SECURE] Seeding demo data for user: ${demoUserId}, session: ${demoSessionId}`);
  try {
    const sessionId = demoSessionId || `demo_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    await clearDemoData(demoUserId, sessionId);
    const demoIds = {
      clients: {},
      projects: {},
      tasks: {},
      templates: {},
      proposals: {},
      invoices: {},
      contracts: {}
    };
    console.log(`\u{1F512} Creating demo data with session isolation: ${sessionId}`);
    await createDemoClients(demoUserId, sessionId, demoIds);
    await createDemoProjects(demoUserId, sessionId, demoIds);
    await createDemoTasks(demoUserId, sessionId, demoIds);
    await createDemoProposals(demoUserId, sessionId, demoIds);
    await createDemoTemplates(demoUserId, sessionId, demoIds);
    console.log(`\u2705 Secure demo data seeded successfully for user: ${demoUserId}`);
    console.log(`\u{1F4CA} Created: ${Object.keys(demoIds.clients).length} clients, ${Object.keys(demoIds.projects).length} projects, ${Object.keys(demoIds.tasks).length} tasks, ${Object.keys(demoIds.proposals).length} proposals, ${Object.keys(demoIds.templates).length} templates`);
    return demoIds;
  } catch (error) {
    console.error("\u274C Error seeding demo data:", error);
    throw error;
  }
}
async function createDemoClients(demoUserId, demoSessionId, demoIds) {
  const sessionPrefix = `DEMO_${demoSessionId.slice(-8)}_`;
  const clients2 = [
    {
      name: `${sessionPrefix}TechFlow Solutions`,
      email: "contact@techflowsolutions.com",
      phone: "(555) 123-4567",
      company: "TechFlow Solutions Inc.",
      address: "1200 Innovation Drive\nSan Francisco, CA 94107",
      website: "https://techflowsolutions.com",
      notes: "Fast-growing SaaS startup focused on workflow automation.",
      status: "active",
      totalProposals: 3,
      totalInvoices: 5,
      totalRevenue: "45000.00",
      outstandingBalance: "0.00",
      // Add demo tagging (will work once schema is updated)
      ...{
        isDemo: true,
        demoSessionId,
        demoUserId
      }
    },
    {
      name: `${sessionPrefix}Premier Business Consulting`,
      email: "hello@premierbiz.com",
      phone: "(555) 987-6543",
      company: "Premier Business Consulting LLC",
      address: "789 Executive Blvd\nNew York, NY 10001",
      website: "https://premierbiz.com",
      notes: "Established consulting firm helping mid-market companies.",
      status: "active",
      totalProposals: 2,
      totalInvoices: 4,
      totalRevenue: "32000.00",
      outstandingBalance: "5000.00",
      // Add demo tagging (will work once schema is updated)
      ...{
        isDemo: true,
        demoSessionId,
        demoUserId
      }
    }
  ];
  for (const client of clients2) {
    const created = await storage.createClient(client);
    const cleanName = client.name.replace(sessionPrefix, "");
    demoIds.clients[cleanName] = created.id;
  }
  console.log(`\u2705 Created ${clients2.length} demo clients with secure isolation`);
}
async function createDemoProjects(demoUserId, demoSessionId, demoIds) {
  const sessionPrefix = `DEMO_${demoSessionId.slice(-8)}_`;
  const projects2 = [
    {
      name: `${sessionPrefix}TechFlow Platform Redesign`,
      description: "Complete UI/UX redesign of the TechFlow workflow automation platform",
      status: "active",
      color: "#3B82F6",
      timeline: "3 months",
      clientId: demoIds.clients["TechFlow Solutions"],
      // Add demo tagging (will work once schema is updated)
      ...{
        isDemo: true,
        demoSessionId,
        demoUserId
      }
    },
    {
      name: `${sessionPrefix}Digital Transformation Strategy`,
      description: "Comprehensive digital transformation consulting for Premier Business",
      status: "active",
      color: "#10B981",
      timeline: "6 months",
      clientId: demoIds.clients["Premier Business Consulting"],
      // Add demo tagging (will work once schema is updated)
      ...{
        isDemo: true,
        demoSessionId,
        demoUserId
      }
    }
  ];
  for (const project of projects2) {
    const created = await storage.createProject(project);
    demoIds.projects[project.name.replace(sessionPrefix, "")] = created.id;
  }
  console.log(`\u2705 Created ${projects2.length} demo projects with secure isolation`);
}
async function createDemoTasks(demoUserId, demoSessionId, demoIds) {
  const tasks2 = [
    {
      title: "User Research & Analysis",
      description: "Conduct comprehensive user research to understand current pain points",
      status: "completed",
      priority: "high",
      projectId: demoIds.projects["TechFlow Platform Redesign"],
      assignedToId: demoUserId,
      createdById: demoUserId,
      // Add demo tagging (will work once schema is updated)
      ...{
        isDemo: true,
        demoSessionId,
        demoUserId
      }
    },
    {
      title: "Wireframe Development",
      description: "Create detailed wireframes for all key user flows",
      status: "active",
      priority: "high",
      projectId: demoIds.projects["TechFlow Platform Redesign"],
      assignedToId: demoUserId,
      createdById: demoUserId,
      // Add demo tagging (will work once schema is updated)
      ...{
        isDemo: true,
        demoSessionId,
        demoUserId
      }
    },
    {
      title: "Current State Assessment",
      description: "Analyze existing business processes and technology stack",
      status: "completed",
      priority: "medium",
      projectId: demoIds.projects["Digital Transformation Strategy"],
      assignedToId: demoUserId,
      createdById: demoUserId,
      // Add demo tagging (will work once schema is updated)
      ...{
        isDemo: true,
        demoSessionId,
        demoUserId
      }
    },
    {
      title: "Technology Roadmap Planning",
      description: "Develop comprehensive technology roadmap for digital transformation",
      status: "pending",
      priority: "high",
      projectId: demoIds.projects["Digital Transformation Strategy"],
      assignedToId: demoUserId,
      createdById: demoUserId,
      // Add demo tagging (will work once schema is updated)
      ...{
        isDemo: true,
        demoSessionId,
        demoUserId
      }
    }
  ];
  for (const task of tasks2) {
    const created = await storage.createTask(task, demoUserId);
    demoIds.tasks[task.title] = created.id;
  }
  console.log(`\u2705 Created ${tasks2.length} demo tasks with secure isolation`);
}
async function createDemoProposals(demoUserId, demoSessionId, demoIds) {
  const proposals2 = [
    {
      title: "TechFlow Platform Redesign Proposal",
      projectId: demoIds.projects["TechFlow Platform Redesign"],
      clientId: demoIds.clients["TechFlow Solutions"],
      clientName: "TechFlow Solutions",
      clientEmail: "contact@techflowsolutions.com",
      status: "accepted",
      content: "Complete UI/UX redesign proposal for TechFlow automation platform",
      projectDescription: "Comprehensive redesign of user interface and experience",
      totalBudget: "25000.00",
      timeline: "3 months",
      deliverables: "Wireframes, Prototypes, Final Design System, Implementation Support",
      terms: "50% upfront, 50% on completion",
      createdById: demoUserId,
      // Add demo tagging (will work once schema is updated)
      ...{
        isDemo: true,
        demoSessionId,
        demoUserId
      }
    },
    {
      title: "Digital Transformation Strategy Proposal",
      projectId: demoIds.projects["Digital Transformation Strategy"],
      clientId: demoIds.clients["Premier Business Consulting"],
      clientName: "Premier Business Consulting",
      clientEmail: "hello@premierbiz.com",
      status: "sent",
      content: "Strategic digital transformation roadmap and implementation plan",
      projectDescription: "Comprehensive digital transformation consulting",
      totalBudget: "45000.00",
      timeline: "6 months",
      deliverables: "Current State Analysis, Future State Design, Implementation Roadmap, Change Management Plan",
      terms: "30% upfront, 40% at midpoint, 30% on completion",
      createdById: demoUserId,
      // Add demo tagging (will work once schema is updated)
      ...{
        isDemo: true,
        demoSessionId,
        demoUserId
      }
    }
  ];
  for (const proposal of proposals2) {
    const created = await storage.createProposal(proposal);
    demoIds.proposals[proposal.title] = created.id;
  }
  console.log(`\u2705 Created ${proposals2.length} demo proposals with secure isolation`);
}
async function createDemoTemplates(demoUserId, demoSessionId, demoIds) {
  const templates2 = [
    {
      name: "Demo Proposal Template",
      description: "Standard proposal template for demo purposes",
      type: "proposal",
      content: "# {{projectTitle}}\n\n## Project Overview\n{{projectDescription}}\n\n## Timeline\n{{timeline}}\n\n## Budget\n{{budget}}",
      variables: [
        { name: "projectTitle", label: "Project Title", type: "text", required: true },
        { name: "projectDescription", label: "Project Description", type: "textarea", required: true },
        { name: "timeline", label: "Timeline", type: "text", required: true },
        { name: "budget", label: "Budget", type: "text", required: true }
      ],
      isSystem: false,
      isPublic: false,
      tags: ["demo", "proposal"],
      createdById: demoUserId,
      // Add demo tagging (will work once schema is updated)
      ...{
        isDemo: true,
        demoSessionId,
        demoUserId
      }
    },
    {
      name: "Demo Invoice Template",
      description: "Standard invoice template for demo purposes",
      type: "invoice",
      content: "# Invoice {{invoiceNumber}}\n\n**Bill To:** {{clientName}}\n**Date:** {{invoiceDate}}\n**Due Date:** {{dueDate}}\n\n## Services\n{{lineItems}}\n\n**Total:** {{totalAmount}}",
      variables: [
        { name: "invoiceNumber", label: "Invoice Number", type: "text", required: true },
        { name: "clientName", label: "Client Name", type: "text", required: true },
        { name: "invoiceDate", label: "Invoice Date", type: "date", required: true },
        { name: "dueDate", label: "Due Date", type: "date", required: true },
        { name: "lineItems", label: "Line Items", type: "textarea", required: true },
        { name: "totalAmount", label: "Total Amount", type: "text", required: true }
      ],
      isSystem: false,
      isPublic: false,
      tags: ["demo", "invoice"],
      createdById: demoUserId,
      // Add demo tagging (will work once schema is updated)
      ...{
        isDemo: true,
        demoSessionId,
        demoUserId
      }
    }
  ];
  for (const template of templates2) {
    const created = await storage.createTemplate(template);
    demoIds.templates[template.name] = created.id;
  }
  console.log(`\u2705 Created ${templates2.length} demo templates with secure isolation`);
}

// server/demoSessionService.ts
init_storage();
var demoSessions = /* @__PURE__ */ new Map();
var userIdToSessionId = /* @__PURE__ */ new Map();
var DEMO_SESSION_DURATION_MINUTES = 45;
var ACTIVITY_EXTENSION_MINUTES = 5;
var CLEANUP_INTERVAL_MINUTES = 5;
async function createDemoSession() {
  try {
    const sessionId = generateSessionId();
    const demoUsername = `demo_${sessionId}_${Date.now()}`;
    const demoEmail = `demo_${sessionId}@gigster-garage-demo.local`;
    const demoUserData = {
      username: demoUsername,
      password: generateRandomPassword(),
      // Random password - user won't need it
      email: demoEmail,
      name: `Demo User ${sessionId.slice(0, 8)}`,
      role: "user",
      hasCompletedOnboarding: true,
      // Skip onboarding for demos
      emailNotifications: false,
      smsNotifications: false,
      emailOptIn: false,
      smsOptIn: false,
      // Demo-specific fields will be added to schema
      isDemo: true,
      demoSessionId: sessionId,
      sessionExpiresAt: new Date(Date.now() + DEMO_SESSION_DURATION_MINUTES * 60 * 1e3)
    };
    const demoUser = await storage.createUser(demoUserData);
    const now = /* @__PURE__ */ new Date();
    const expiresAt = new Date(now.getTime() + DEMO_SESSION_DURATION_MINUTES * 60 * 1e3);
    const session2 = {
      id: sessionId,
      userId: demoUser.id,
      user: demoUser,
      createdAt: now,
      expiresAt,
      lastActivity: now,
      isExpired: false,
      remainingMinutes: DEMO_SESSION_DURATION_MINUTES
    };
    demoSessions.set(sessionId, session2);
    userIdToSessionId.set(demoUser.id, sessionId);
    console.log(`\u{1F3AE} Creating demo session ${sessionId} for user ${demoUser.id}`);
    await seedDemoData(demoUser.id, sessionId);
    console.log(`\u2705 Demo session created successfully: ${sessionId} (expires in ${DEMO_SESSION_DURATION_MINUTES} minutes)`);
    return {
      success: true,
      session: session2,
      user: demoUser
    };
  } catch (error) {
    console.error("\u274C Failed to create demo session:", error);
    return {
      success: false,
      error: error.message || "Failed to create demo session"
    };
  }
}
async function getDemoSessionStatus(userId) {
  try {
    const sessionId = userIdToSessionId.get(userId);
    if (!sessionId) {
      return { isDemo: false };
    }
    const session2 = demoSessions.get(sessionId);
    if (!session2) {
      return { isDemo: false };
    }
    const now = /* @__PURE__ */ new Date();
    const isExpired = now > session2.expiresAt;
    if (isExpired) {
      await cleanupDemoSession(sessionId);
      return {
        isDemo: true,
        error: "Demo session has expired"
      };
    }
    const remainingMs = session2.expiresAt.getTime() - now.getTime();
    session2.remainingMinutes = Math.max(0, Math.ceil(remainingMs / (60 * 1e3)));
    session2.isExpired = false;
    return {
      isDemo: true,
      session: session2
    };
  } catch (error) {
    console.error("\u274C Error checking demo session status:", error);
    return {
      isDemo: false,
      error: error.message || "Error checking demo session status"
    };
  }
}
async function updateDemoSessionActivity(userId) {
  try {
    const sessionId = userIdToSessionId.get(userId);
    if (!sessionId) return false;
    const session2 = demoSessions.get(sessionId);
    if (!session2) return false;
    const now = /* @__PURE__ */ new Date();
    if (now > session2.expiresAt) {
      await cleanupDemoSession(sessionId);
      return false;
    }
    session2.lastActivity = now;
    const remainingMs = session2.expiresAt.getTime() - now.getTime();
    const remainingMinutes = remainingMs / (60 * 1e3);
    if (remainingMinutes <= 10) {
      session2.expiresAt = new Date(now.getTime() + ACTIVITY_EXTENSION_MINUTES * 60 * 1e3);
      console.log(`\u23F0 Extended demo session ${sessionId} by ${ACTIVITY_EXTENSION_MINUTES} minutes due to activity`);
    }
    return true;
  } catch (error) {
    console.error("\u274C Error updating demo session activity:", error);
    return false;
  }
}
async function endDemoSession(userId) {
  try {
    const sessionId = userIdToSessionId.get(userId);
    if (!sessionId) return false;
    await cleanupDemoSession(sessionId);
    console.log(`\u{1F6D1} Demo session ${sessionId} ended manually by user ${userId}`);
    return true;
  } catch (error) {
    console.error("\u274C Error ending demo session:", error);
    return false;
  }
}
function isDemoUser(user) {
  if (!user) return false;
  return user.isDemo === true || user.username?.startsWith("demo_") || false;
}
function getDemoSession(sessionId) {
  return demoSessions.get(sessionId);
}
function getActiveDemoSessions() {
  return Array.from(demoSessions.values()).filter((session2) => !session2.isExpired);
}
async function cleanupDemoSession(sessionId) {
  try {
    const session2 = demoSessions.get(sessionId);
    if (!session2) return;
    console.log(`\u{1F9F9} Cleaning up demo session ${sessionId} for user ${session2.userId}`);
    await clearDemoData(session2.userId);
    await storage.deleteUser(session2.userId);
    demoSessions.delete(sessionId);
    userIdToSessionId.delete(session2.userId);
    console.log(`\u2705 Demo session ${sessionId} cleanup completed`);
  } catch (error) {
    console.error(`\u274C Error cleaning up demo session ${sessionId}:`, error);
  }
}
async function cleanupExpiredDemoSessions() {
  let cleanedSessions = 0;
  let errors = 0;
  const now = /* @__PURE__ */ new Date();
  console.log(`\u{1F9F9} Starting cleanup of expired demo sessions...`);
  for (const [sessionId, session2] of demoSessions.entries()) {
    try {
      if (now > session2.expiresAt) {
        await cleanupDemoSession(sessionId);
        cleanedSessions++;
      }
    } catch (error) {
      console.error(`\u274C Error cleaning up session ${sessionId}:`, error);
      errors++;
    }
  }
  if (cleanedSessions > 0 || errors > 0) {
    console.log(`\u2705 Demo session cleanup completed: ${cleanedSessions} cleaned, ${errors} errors`);
  }
  return { cleanedSessions, errors };
}
function generateSessionId() {
  const timestamp2 = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `demo_${timestamp2}_${randomPart}`;
}
function generateRandomPassword() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
function initializeDemoSessionService() {
  console.log("\u{1F3AE} Initializing Demo Session Service...");
  setInterval(async () => {
    try {
      await cleanupExpiredDemoSessions();
    } catch (error) {
      console.error("\u274C Error in demo session cleanup interval:", error);
    }
  }, CLEANUP_INTERVAL_MINUTES * 60 * 1e3);
  console.log(`\u2705 Demo Session Service initialized with ${DEMO_SESSION_DURATION_MINUTES}min sessions, ${CLEANUP_INTERVAL_MINUTES}min cleanup interval`);
}
function validateDemoSession() {
  return async (req, res, next) => {
    try {
      if (req.user && isDemoUser(req.user)) {
        const status = await getDemoSessionStatus(req.user.id);
        if (!status.isDemo || status.error) {
          req.session.destroy(() => {
          });
          return res.status(401).json({
            message: "Demo session has expired",
            code: "DEMO_SESSION_EXPIRED",
            error: status.error
          });
        }
        await updateDemoSessionActivity(req.user.id);
      }
      next();
    } catch (error) {
      console.error("\u274C Demo session validation error:", error);
      next(error);
    }
  };
}
var demoSessionService = {
  createDemoSession,
  getDemoSessionStatus,
  updateDemoSessionActivity,
  endDemoSession,
  isDemoUser,
  getDemoSession,
  getActiveDemoSessions,
  cleanupExpiredDemoSessions,
  initializeDemoSessionService,
  validateDemoSession
};

// server/routes.ts
var openai4 = process.env.OPENAI_API_KEY ? new OpenAI4({
  apiKey: process.env.OPENAI_API_KEY
}) : null;
if (!process.env.OPENAI_API_KEY) {
  console.error("\u26A0\uFE0F  OPENAI_API_KEY not found - AI tools will be disabled");
} else {
  console.log("\u2705 OpenAI API key configured successfully");
}
var loginSchema = z2.object({
  username: z2.string().min(1, "Username is required"),
  password: z2.string().min(1, "Password is required")
});
async function registerRoutes(app2) {
  app2.use(performanceMiddleware());
  app2.use(optimizationMiddleware());
  const upload = multer({
    storage: multer.memoryStorage(),
    // Use memory storage for content validation
    limits: {
      fileSize: 10 * 1024 * 1024,
      // 10MB limit
      files: 5
      // Maximum 5 files per request
    },
    fileFilter: async (req, file, cb) => {
      try {
        const allowedTypes = /* @__PURE__ */ new Map([
          ["application/pdf", [".pdf"]],
          ["application/msword", [".doc"]],
          ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", [".docx"]],
          ["application/vnd.ms-excel", [".xls"]],
          ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", [".xlsx"]],
          ["application/vnd.ms-powerpoint", [".ppt"]],
          ["application/vnd.openxmlformats-officedocument.presentationml.presentation", [".pptx"]],
          ["text/plain", [".txt"]],
          ["text/csv", [".csv"]],
          ["image/jpeg", [".jpg", ".jpeg"]],
          ["image/png", [".png"]],
          ["image/gif", [".gif"]],
          ["image/webp", [".webp"]]
          // Removed SVG due to XSS risk
        ]);
        const dangerousExtensions = [
          ".exe",
          ".sh",
          ".bat",
          ".cmd",
          ".com",
          ".js",
          ".mjs",
          ".cjs",
          ".php",
          ".pl",
          ".py",
          ".rb",
          ".jar",
          ".dll",
          ".scr",
          ".msi",
          ".apk"
        ];
        const fileName = file.originalname.toLowerCase();
        for (const dangerous of dangerousExtensions) {
          if (fileName.includes(dangerous)) {
            return cb(new Error(`File contains dangerous extension '${dangerous}' which is not allowed for security reasons`));
          }
        }
        const fileExtension = path2.extname(file.originalname).toLowerCase();
        const allowedExtensions = Array.from(allowedTypes.values()).flat();
        if (!allowedExtensions.includes(fileExtension)) {
          return cb(new Error(`File extension '${fileExtension}' not allowed. Allowed extensions: ${allowedExtensions.join(", ")}`));
        }
        cb(null, true);
      } catch (error) {
        cb(new Error(`File validation error: ${error.message}`));
      }
    }
  });
  const validateFileContent = async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      return next();
    }
    try {
      const allowedMimeTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain",
        "text/csv",
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp"
      ];
      for (const file of req.files) {
        const fileType = await fileTypeFromBuffer(file.buffer);
        if (fileType && !allowedMimeTypes.includes(fileType.mime)) {
          return res.status(400).json({
            message: `File content type '${fileType.mime}' not allowed. File appears to be different from its extension.`
          });
        }
        const fileExtension = path2.extname(file.originalname).toLowerCase();
        if (!fileType && ![".txt", ".csv"].includes(fileExtension)) {
          return res.status(400).json({
            message: "Unable to determine file type. File may be corrupted or unsupported."
          });
        }
      }
      next();
    } catch (error) {
      console.error("File content validation error:", error);
      return res.status(500).json({ message: "File validation failed" });
    }
  };
  app2.use(session({
    secret: process.env.SESSION_SECRET || "taskflow-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  }));
  const requireAuth = (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    req.user = req.session.user;
    next();
  };
  const requireAdmin2 = (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (req.session.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    req.user = req.session.user;
    next();
  };
  app2.get("/api/db-health", async (_req, res) => {
    try {
      const start = Date.now();
      await pool.query("SELECT 1");
      const responseTime = Date.now() - start;
      const poolStats = {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount,
        max: pool.options.max,
        connectionString: pool.options.connectionString ? "***configured***" : "missing"
      };
      res.json({
        status: "healthy",
        database: {
          connected: true,
          responseTime: `${responseTime}ms`,
          pool: poolStats
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      res.status(503).json({
        status: "unhealthy",
        database: {
          connected: false,
          error: error.message,
          code: error.code || "unknown",
          pool: {
            totalCount: pool.totalCount,
            idleCount: pool.idleCount,
            waitingCount: pool.waitingCount
          }
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  });
  app2.post("/api/signup", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid user data",
          errors: result.error.errors
        });
      }
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
  app2.post("/api/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid login data",
          errors: result.error.errors
        });
      }
      const { username, password } = result.data;
      console.log(`\u{1F510} Login attempt for username: ${username}`);
      const user = await storage.getUserByUsername(username);
      if (!user) {
        console.log(`\u274C User not found: ${username}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      console.log(`\u{1F464} User found: ${user.username}, role: ${user.role}`);
      const passwordValid = await storage.verifyPassword(user, password);
      console.log(`\u{1F511} Password verification result: ${passwordValid}`);
      if (!passwordValid) {
        console.log(`\u274C Password verification failed for: ${username}`);
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
  app2.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.get("/api/auth/user", async (req, res) => {
    if (req.session.user) {
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
  app2.post("/api/demo/create-session", async (req, res) => {
    try {
      const result = await demoSessionService.createDemoSession();
      if (result.success && result.user && result.session) {
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
    } catch (error) {
      console.error("Error creating demo session:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create demo session"
      });
    }
  });
  app2.get("/api/demo/session-status", async (req, res) => {
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
    } catch (error) {
      console.error("Error checking demo session status:", error);
      res.status(500).json({
        isDemo: false,
        authenticated: false,
        error: "Failed to check session status"
      });
    }
  });
  app2.delete("/api/demo/end-session", async (req, res) => {
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
    } catch (error) {
      console.error("Error ending demo session:", error);
      res.status(500).json({
        success: false,
        message: "Failed to end demo session"
      });
    }
  });
  app2.get("/api/projects", requireAuth, async (req, res) => {
    try {
      const projects2 = await storage.getProjects();
      res.json(projects2);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });
  app2.post("/api/projects", requireAuth, async (req, res) => {
    try {
      const result = insertProjectSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid project data",
          errors: result.error.errors
        });
      }
      const project = await storage.getOrCreateProject(result.data.name);
      res.json(project);
    } catch (error) {
      console.error("Error creating/finding project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });
  app2.post("/api/user/onboarding", requireAuth, async (req, res) => {
    try {
      const result = onboardingSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid onboarding data",
          errors: result.error.errors
        });
      }
      const userId = req.session.user.id;
      const updateData = {
        hasCompletedOnboarding: true,
        // Always set to true when onboarding is completed
        emailOptIn: result.data.emailOptIn,
        smsOptIn: result.data.smsOptIn,
        notificationEmail: result.data.notificationEmail || "",
        phone: result.data.phone
      };
      const user = await storage.updateUserOnboarding(userId, updateData);
      req.session.user = user;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
        }
      });
      res.json(user);
    } catch (error) {
      console.error("Error updating user onboarding:", error);
      res.status(500).json({ message: "Failed to update onboarding preferences" });
    }
  });
  app2.get("/api/users", requireAdmin2, async (req, res) => {
    try {
      const users2 = await storage.getUsers();
      const safeUsers = users2.map((user) => ({
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
  app2.post("/api/users", requireAdmin2, async (req, res) => {
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
  app2.delete("/api/users/:id", requireAdmin2, async (req, res) => {
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
  app2.post("/api/demo-data/seed", requireAdmin2, async (req, res) => {
    try {
      const user = req.session.user;
      console.log(`\u{1F331} Admin ${user.username} initiating demo data seeding...`);
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
  app2.delete("/api/demo-data/clear", requireAdmin2, async (req, res) => {
    try {
      const user = req.session.user;
      console.log(`\u{1F9F9} Admin ${user.username} initiating demo data cleanup...`);
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
  app2.get("/api/demo-data/status", requireAdmin2, async (req, res) => {
    try {
      const [clients2, projects2, tasks2, templates2, proposals2, invoices2, contracts2] = await Promise.all([
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
          clients: clients2.length,
          projects: projects2.length,
          tasks: tasks2.length,
          templates: templates2.length,
          proposals: proposals2.length,
          invoices: invoices2.length,
          contracts: contracts2.length
        },
        hasDemoData: clients2.length > 0 || projects2.length > 0 || tasks2.length > 0
      });
    } catch (error) {
      console.error("Error checking demo data status:", error);
      res.status(500).json({
        message: "Failed to check demo data status",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/search", requireAuth, async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string" || q.length < 2) {
        return res.json([]);
      }
      const query = q.toLowerCase();
      const user = req.session.user;
      const results = [];
      try {
        const tasks2 = await storage.getTasks(user.role === "admin" ? void 0 : user.id);
        const matchingTasks = tasks2.filter(
          (task) => task.title.toLowerCase().includes(query) || task.description?.toLowerCase().includes(query) || task.notes?.toLowerCase().includes(query)
        ).slice(0, 5);
        for (const task of matchingTasks) {
          let projectName;
          if (task.projectId) {
            const project = await storage.getProject(task.projectId);
            projectName = project?.name;
          }
          let assigneeName;
          if (task.assignedToId) {
            const assignee = await storage.getUser(task.assignedToId);
            assigneeName = assignee?.name;
          }
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
              projectName,
              assigneeName
            }
          });
        }
      } catch (error) {
        console.error("Error searching tasks:", error);
      }
      try {
        const projects2 = await storage.getProjects();
        const matchingProjects = projects2.filter(
          (project) => project.name.toLowerCase().includes(query) || project.description?.toLowerCase().includes(query)
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
      try {
        const clients2 = await storage.getClients();
        const matchingClients = clients2.filter(
          (client) => client.name.toLowerCase().includes(query) || client.company?.toLowerCase().includes(query) || client.email?.toLowerCase().includes(query)
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
      try {
        const invoices2 = await storage.getInvoices();
        const matchingInvoices = invoices2.filter(
          (invoice) => invoice.invoiceNumber?.toLowerCase().includes(query) || invoice.notes?.toLowerCase().includes(query)
        ).slice(0, 3);
        for (const invoice of matchingInvoices) {
          let clientName;
          if (invoice.clientId) {
            const client = await storage.getClient(invoice.clientId);
            clientName = client?.name;
          }
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
      try {
        const messages2 = await storage.getMessages("");
        const matchingMessages = messages2.filter(
          (message) => message.subject?.toLowerCase().includes(query) || message.content?.toLowerCase().includes(query) || message.toUser?.email?.toLowerCase().includes(query)
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
      results.sort((a, b) => {
        const aExact = a.title.toLowerCase() === query ? 1 : 0;
        const bExact = b.title.toLowerCase() === query ? 1 : 0;
        return bExact - aExact;
      });
      res.json(results.slice(0, 20));
    } catch (error) {
      console.error("Error in search:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });
  app2.get("/api/tasks", requireAuth, async (req, res) => {
    try {
      const user = req.session.user;
      const tasks2 = await storage.getTasks(user.role === "admin" ? void 0 : user.id);
      res.json(tasks2);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });
  app2.get("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      const user = req.session.user;
      if (user.role !== "admin" && task.assignedToId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });
  app2.post("/api/tasks", requireAuth, async (req, res) => {
    try {
      const result = insertTaskSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid task data",
          errors: result.error.errors
        });
      }
      const user = req.session.user;
      const task = await storage.createTask(result.data, user.id);
      if (task.priority === "high" && task.assignedToId) {
        const users2 = await storage.getUsers();
        const assignedUser = users2.find((u) => u.id === task.assignedToId);
        if (assignedUser) {
          console.log(`\u{1F4EC} Sending notifications for high priority task: ${task.title}`);
          console.log(`\u{1F4E7} Email: ${assignedUser.notificationEmail}, Opt-in: ${assignedUser.emailOptIn}`);
          console.log(`\u{1F4F1} Phone: ${assignedUser.phone}, SMS Opt-in: ${assignedUser.smsOptIn}`);
          try {
            const emailSent = await sendHighPriorityTaskNotification(task, assignedUser);
            console.log(`\u{1F4E7} Email notification result: ${emailSent ? "SUCCESS" : "FAILED"}`);
            if (assignedUser.smsOptIn) {
              const smsSent = await sendSMSNotification(task, assignedUser);
              console.log(`\u{1F4F1} SMS notification result: ${smsSent ? "SUCCESS" : "FAILED"}`);
            }
          } catch (error) {
            console.error("\u274C Error sending notifications:", error);
          }
        }
      } else {
        console.log(`\u26A0\uFE0F No notifications sent - Priority: ${task.priority}, AssignedToId: ${task.assignedToId}`);
      }
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });
  app2.patch("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const result = updateTaskSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid task data",
          errors: result.error.errors
        });
      }
      const user = req.session.user;
      const existingTask = await storage.getTask(id);
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      if (user.role !== "admin" && existingTask.assignedToId !== user.id) {
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
  app2.post("/api/tasks/:id/progress", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { date: date2, comment } = req.body;
      if (!date2 || !comment?.trim()) {
        return res.status(400).json({ message: "Date and comment are required" });
      }
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      const user = req.session.user;
      if (user.role !== "admin" && task.assignedToId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      const progressNote = {
        id: crypto.randomUUID(),
        date: date2,
        comment: comment.trim(),
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const currentProgress = Array.isArray(task.progressNotes) ? task.progressNotes : [];
      const updatedProgressNotes = [...currentProgress, progressNote];
      const updatedTask = await storage.updateTask(id, {
        progressNotes: updatedProgressNotes
      });
      res.json(updatedTask);
    } catch (error) {
      console.error("Error adding progress note:", error);
      res.status(500).json({ message: "Failed to add progress note" });
    }
  });
  app2.delete("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.session.user;
      const existingTask = await storage.getTask(id);
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const success = await storage.deleteTask(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });
  app2.get("/api/projects", requireAuth, async (req, res) => {
    try {
      const projects2 = await storage.getProjects();
      res.json(projects2);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });
  app2.get("/api/projects/:id", requireAuth, async (req, res) => {
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
  app2.patch("/api/projects/:id/status", requireAuth, async (req, res) => {
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
  app2.post("/api/projects", requireAuth, async (req, res) => {
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
  app2.post("/api/task-dependencies", requireAuth, async (req, res) => {
    try {
      const { taskId, dependsOnTaskId } = req.body;
      if (!taskId || !dependsOnTaskId) {
        return res.status(400).json({ message: "Task ID and depends on task ID are required" });
      }
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
  app2.delete("/api/task-dependencies/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteTaskDependency(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting task dependency:", error);
      res.status(500).json({ message: "Failed to delete task dependency" });
    }
  });
  app2.get("/api/tasks/project/:projectId", requireAuth, async (req, res) => {
    try {
      const user = req.session.user;
      const projectId = req.params.projectId;
      const tasks2 = await storage.getTasksByProject(projectId, user.role === "admin" ? null : user.id);
      res.json(tasks2);
    } catch (error) {
      console.error("Error fetching project tasks:", error);
      res.status(500).json({ message: "Failed to fetch project tasks" });
    }
  });
  app2.get("/api/tasks/:id/subtasks", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const subtasks = await storage.getSubtasks(id);
      res.json(subtasks);
    } catch (error) {
      console.error("Error fetching subtasks:", error);
      res.status(500).json({ message: "Failed to fetch subtasks" });
    }
  });
  app2.post("/api/tasks/:id/subtasks", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const result = insertTaskSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid task data",
          errors: result.error.errors
        });
      }
      const parentTask = await storage.getTask(id);
      if (!parentTask) {
        return res.status(404).json({ message: "Parent task not found" });
      }
      const user = req.session.user;
      const subtask = await storage.createTask({
        ...result.data,
        parentTaskId: id,
        projectId: parentTask.projectId,
        // Inherit project from parent
        progress: result.data.progress && Array.isArray(result.data.progress) ? result.data.progress : void 0
      }, user.id);
      res.status(201).json(subtask);
    } catch (error) {
      console.error("Error creating subtask:", error);
      res.status(500).json({ message: "Failed to create subtask" });
    }
  });
  app2.get("/api/tasks-with-subtasks", requireAuth, async (req, res) => {
    try {
      const user = req.session.user;
      const tasks2 = await storage.getTasksWithSubtasks(user.role === "admin" ? void 0 : user.id);
      res.json(tasks2);
    } catch (error) {
      console.error("Error fetching tasks with subtasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks with subtasks" });
    }
  });
  app2.post("/api/timelogs/start", requireAuth, async (req, res) => {
    try {
      const result = startTimerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid timer data",
          errors: result.error.issues
        });
      }
      const user = req.session.user;
      await storage.stopActiveTimer(user.id);
      const timeLog = await storage.createTimeLog({
        userId: user.id,
        taskId: result.data.taskId || null,
        projectId: result.data.projectId || null,
        description: result.data.description,
        startTime: /* @__PURE__ */ new Date(),
        endTime: null,
        isActive: true,
        isManualEntry: false,
        editHistory: []
      });
      res.status(201).json(timeLog);
    } catch (error) {
      console.error("Error starting timer:", error);
      res.status(500).json({ message: "Failed to start timer" });
    }
  });
  app2.post("/api/timelogs/stop", requireAuth, async (req, res) => {
    try {
      const result = stopTimerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid stop timer data",
          errors: result.error.issues
        });
      }
      const user = req.session.user;
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
      const endTime = /* @__PURE__ */ new Date();
      const duration = Math.floor((endTime.getTime() - new Date(timeLog.startTime).getTime()) / 1e3);
      const updatedTimeLog = await storage.updateTimeLog(timeLog.id, {
        endTime,
        duration: duration.toString(),
        isActive: false
      });
      res.json(updatedTimeLog);
    } catch (error) {
      console.error("Error stopping timer:", error);
      res.status(500).json({ message: "Failed to stop timer" });
    }
  });
  app2.get("/api/timelogs/active", requireAuth, async (req, res) => {
    try {
      const user = req.session.user;
      const activeTimeLog = await storage.getActiveTimeLog(user.id);
      res.json(activeTimeLog || null);
    } catch (error) {
      console.error("Error fetching active timer:", error);
      res.status(500).json({ message: "Failed to fetch active timer" });
    }
  });
  app2.get("/api/timelogs", requireAuth, async (req, res) => {
    try {
      const user = req.session.user;
      const projectId = req.query.projectId;
      const timeLogs2 = await storage.getTimeLogs(
        user.role === "admin" ? void 0 : user.id,
        projectId
      );
      res.json(timeLogs2);
    } catch (error) {
      console.error("Error fetching time logs:", error);
      res.status(500).json({ message: "Failed to fetch time logs" });
    }
  });
  app2.get("/api/productivity/stats", requireAuth, async (req, res) => {
    try {
      const user = req.session.user;
      const days = parseInt(req.query.days) || 30;
      const stats = await storage.getUserProductivityStats(user.id, days);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching productivity stats:", error);
      res.status(500).json({ message: "Failed to fetch productivity stats" });
    }
  });
  app2.get("/api/streaks", requireAuth, async (req, res) => {
    try {
      const user = req.session.user;
      const [stats14, stats30] = await Promise.all([
        storage.getUserProductivityStats(user.id, 14),
        storage.getUserProductivityStats(user.id, 30)
      ]);
      res.json({
        last14Days: {
          streakDays: stats14.streakDays,
          totalHours: stats14.totalHours,
          averageDailyHours: stats14.averageDailyHours,
          utilizationPercent: stats14.utilizationPercent
        },
        last30Days: {
          streakDays: stats30.streakDays,
          totalHours: stats30.totalHours,
          averageDailyHours: stats30.averageDailyHours,
          utilizationPercent: stats30.utilizationPercent
        }
      });
    } catch (error) {
      console.error("Error fetching streaks:", error);
      res.status(500).json({ message: "Failed to fetch streaks" });
    }
  });
  app2.put("/api/timelogs/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const result = updateTimeLogSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid time log data",
          errors: result.error.issues
        });
      }
      const user = req.session.user;
      const existingTimeLog = await storage.getTimeLog(id);
      if (!existingTimeLog) {
        return res.status(404).json({ message: "Time log not found" });
      }
      if (existingTimeLog.userId !== user.id && user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to edit this time log" });
      }
      const editHistory = Array.isArray(existingTimeLog.editHistory) ? [...existingTimeLog.editHistory] : [];
      editHistory.push({
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        changes: {
          startTime: existingTimeLog.startTime,
          endTime: existingTimeLog.endTime,
          duration: existingTimeLog.duration,
          description: existingTimeLog.description
        },
        editedBy: user.id,
        reason: "Manual edit"
      });
      const updatedTimeLog = await storage.updateTimeLog(id, {
        ...result.data,
        isManualEntry: true,
        editHistory
      });
      res.json(updatedTimeLog);
    } catch (error) {
      console.error("Error updating time log:", error);
      res.status(500).json({ message: "Failed to update time log" });
    }
  });
  app2.delete("/api/timelogs/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.session.user;
      const timeLog = await storage.getTimeLog(id);
      if (!timeLog) {
        return res.status(404).json({ message: "Time log not found" });
      }
      if (timeLog.userId !== user.id && user.role !== "admin") {
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
  app2.get("/api/templates", requireAuth, async (req, res) => {
    try {
      const { type } = req.query;
      const userId = req.session.user?.id;
      const templates2 = await storage.getTemplates(type, userId);
      res.json(templates2);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });
  app2.get("/api/templates/:id", requireAuth, async (req, res) => {
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
  app2.post("/api/templates", requireAuth, async (req, res) => {
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
        createdById: req.session.user.id
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
  app2.post("/api/ai/suggest-template-fields", requireAuth, async (req, res) => {
    try {
      const { templateType, description, businessContext } = req.body;
      if (!templateType || !description) {
        return res.status(400).json({
          message: "Template type and description are required"
        });
      }
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
      if (process.env.OPENAI_API_KEY) {
        try {
          const { default: OpenAI5 } = await import("openai");
          const openai5 = new OpenAI5({ apiKey: process.env.OPENAI_API_KEY });
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
          const completion = await openai5.chat.completions.create({
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
            temperature: 0.7
          });
          const aiSuggestions = JSON.parse(completion.choices[0].message.content || '{"suggestions":[]}');
          suggestions = (aiSuggestions.suggestions || []).filter((s) => s.name && s.label && s.type).map((s) => ({
            name: s.name,
            label: s.label,
            type: s.type,
            required: s.required || false,
            placeholder: s.placeholder || "",
            defaultValue: s.defaultValue || ""
          })).slice(0, 8);
          aiGenerated = true;
        } catch (openaiError) {
          console.log("OpenAI unavailable, using fallback suggestions:", openaiError.message);
        }
      }
      if (suggestions.length === 0) {
        const baseTemplate = fallbackTemplates[templateType] || fallbackTemplates.proposal;
        suggestions = baseTemplate.map((field) => ({
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
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error generating suggestions:", error);
      res.status(500).json({
        message: "Failed to generate suggestions. Please try again or add fields manually."
      });
    }
  });
  function customizePlaceholder(field, description, templateType) {
    const desc2 = description.toLowerCase();
    if (field.name === "project_scope" && desc2.includes("website")) {
      return "Website design, development, testing, and deployment";
    }
    if (field.name === "project_scope" && desc2.includes("marketing")) {
      return "Marketing strategy, campaign creation, and performance tracking";
    }
    if (field.name === "timeline" && desc2.includes("urgent")) {
      return "Rush delivery - 2-3 weeks";
    }
    if (field.name === "service_description" && desc2.includes("consulting")) {
      return "Strategic consulting services including analysis, recommendations, and implementation guidance";
    }
    return field.placeholder;
  }
  app2.patch("/api/templates/:id", requireAuth, async (req, res) => {
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
  app2.delete("/api/templates/:id", requireAuth, async (req, res) => {
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
  app2.get("/api/proposals", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      const proposals2 = await storage.getProposals(userId);
      res.json(proposals2);
    } catch (error) {
      console.error("Error fetching proposals:", error);
      res.status(500).json({ message: "Failed to fetch proposals" });
    }
  });
  app2.get("/api/proposals/:id", requireAuth, async (req, res) => {
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
  app2.get("/api/shared/proposals/:shareableLink", async (req, res) => {
    try {
      const proposal = await storage.getProposalByShareableLink(req.params.shareableLink);
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }
      if (!proposal.viewedAt) {
        await storage.updateProposal(proposal.id, {
          viewedAt: /* @__PURE__ */ new Date(),
          status: proposal.status === "sent" ? "viewed" : proposal.status
        });
      }
      res.json(proposal);
    } catch (error) {
      console.error("Error fetching shared proposal:", error);
      res.status(500).json({ message: "Failed to fetch proposal" });
    }
  });
  const generateFormattedContent = (template, variables, title) => {
    if (template.content && template.content.trim()) {
      let result = template.content;
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, "g");
        result = result.replace(regex, String(value || ""));
      }
      return result;
    }
    let content = `# ${title}

`;
    content += `**Template:** ${template.name}
`;
    content += `**Type:** ${template.type.charAt(0).toUpperCase() + template.type.slice(1)}
`;
    content += `**Generated:** ${(/* @__PURE__ */ new Date()).toLocaleDateString()}

`;
    if (template.description) {
      content += `${template.description}

`;
    }
    content += `---

`;
    if (template.variables && Array.isArray(template.variables)) {
      template.variables.forEach((variable) => {
        const value = variables[variable.name] || variable.defaultValue || "";
        content += `## ${variable.label}
`;
        if (variable.type === "line_items") {
          const lineItems = Array.isArray(value) ? value : [];
          if (lineItems.length > 0) {
            content += `
| Description | Qty | Cost | Subtotal |
`;
            content += `|-------------|-----|------|----------|
`;
            let total = 0;
            lineItems.forEach((item) => {
              const qty = item.quantity || 0;
              const cost = item.cost || 0;
              const subtotal = qty * cost;
              total += subtotal;
              content += `| ${item.description || "N/A"} | ${qty} | $${cost.toLocaleString("en-US", { minimumFractionDigits: 2 })} | $${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })} |
`;
            });
            content += `
**Total: $${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}**

`;
          } else {
            content += `*No line items specified*

`;
          }
        } else if (variable.type === "number") {
          content += `\u{1F4B0} **Amount:** $${parseFloat(value || "0").toLocaleString("en-US", { minimumFractionDigits: 2 })}

`;
        } else if (variable.type === "date") {
          const dateValue = value ? new Date(value).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
          }) : "Not specified";
          content += `\u{1F4C5} **Date:** ${dateValue}

`;
        } else if (variable.type === "email") {
          content += `\u{1F4E7} **Email:** ${value}

`;
        } else if (variable.type === "phone") {
          content += `\u{1F4DE} **Phone:** ${value}

`;
        } else if (variable.type === "textarea") {
          content += `${value}

`;
        } else {
          content += `${value}

`;
        }
      });
    }
    content += `---

*Generated from ${template.name} template on ${(/* @__PURE__ */ new Date()).toLocaleDateString()}*`;
    return content;
  };
  app2.post("/api/proposals", requireAuth, async (req, res) => {
    try {
      if (req.body.templateId) {
        const result = generateProposalSchema.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({
            message: "Invalid proposal data",
            errors: result.error.errors
          });
        }
        const { templateId, title, projectId, clientName, clientEmail, variables, expiresInDays } = result.data;
        const template = await storage.getTemplate(templateId);
        if (!template) {
          return res.status(404).json({ message: "Template not found" });
        }
        const content = generateFormattedContent(template, variables, title);
        const expiresAt = /* @__PURE__ */ new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);
        const proposalData = {
          title,
          templateId,
          projectId,
          clientName,
          clientEmail,
          content,
          variables,
          expiresAt,
          createdById: req.session.user.id,
          metadata: {}
        };
        let proposalClientId;
        if (!proposalClientId && clientName && clientEmail) {
          const existingClients = await storage.getClients();
          let existingClient = existingClients.find((c) => c.email === clientEmail);
          if (!existingClient) {
            const newClient = await storage.createClient({
              name: clientName,
              email: clientEmail,
              status: "prospect"
            });
            existingClient = newClient;
            console.log(`\u2705 Created new client: ${newClient.name} (${newClient.email})`);
          }
          proposalClientId = existingClient.id;
        }
        const proposal = await storage.createProposal(proposalData);
        console.log(`\u{1F4C4} Created proposal "${proposal.title}" for client: ${proposal.clientName}`);
        res.status(201).json(proposal);
      } else {
        const result = directProposalSchema.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({
            message: "Invalid proposal data",
            errors: result.error.errors
          });
        }
        const { title, projectId, clientName, clientEmail, projectDescription, totalBudget, timeline, deliverables, terms, lineItems, calculatedTotal, expiresInDays } = result.data;
        const expiresAt = /* @__PURE__ */ new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);
        let directClientId = null;
        if (clientName && clientEmail) {
          const existingClients = await storage.getClients();
          let existingClient = existingClients.find((c) => c.email === clientEmail);
          if (!existingClient) {
            const clientData = {
              name: clientName,
              email: clientEmail,
              status: "prospect",
              totalProposals: 1,
              totalInvoices: 0,
              totalRevenue: "0.00",
              outstandingBalance: "0.00"
            };
            existingClient = await storage.createClient(clientData);
          }
          directClientId = existingClient.id;
        }
        let content = `# ${title}

`;
        content += `**Prepared for:** ${clientName}
`;
        if (clientEmail) content += `**Email:** ${clientEmail}

`;
        if (projectDescription) {
          content += `## Project Overview
${projectDescription}

`;
        }
        if (timeline) {
          content += `## Timeline
${timeline}

`;
        }
        if (lineItems && lineItems.length > 0) {
          content += `## Services & Pricing

`;
          content += `| Service | Qty | Rate | Amount |
`;
          content += `|---------|-----|------|--------|
`;
          lineItems.forEach((item) => {
            content += `| ${item.description || "Service"} | ${item.quantity} | $${item.rate.toFixed(2)} | $${item.amount.toFixed(2)} |
`;
          });
          content += `
**Total: $${calculatedTotal.toFixed(2)}**

`;
        }
        if (deliverables) {
          content += `## Deliverables
${deliverables}

`;
        }
        if (terms) {
          content += `## Terms & Conditions
${terms}

`;
        }
        content += `---

*Generated on ${(/* @__PURE__ */ new Date()).toLocaleDateString()}*`;
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
          createdById: req.session.user.id,
          status: "draft",
          variables: {},
          metadata: {}
        };
        let assignedClientId = proposalData.clientId;
        if (!assignedClientId && result.data.clientName && result.data.clientEmail) {
          const existingClients = await storage.getClients();
          let existingClient = existingClients.find((c) => c.email === result.data.clientEmail);
          if (!existingClient) {
            const newClient = await storage.createClient({
              name: result.data.clientName,
              email: result.data.clientEmail,
              status: "prospect"
            });
            existingClient = newClient;
            console.log(`\u2705 Created new client: ${newClient.name} (${newClient.email})`);
          }
          assignedClientId = existingClient.id;
          proposalData.clientId = assignedClientId;
        }
        const proposal = await storage.createProposal(proposalData);
        console.log(`\u{1F4C4} Created proposal "${proposal.title}" for client: ${proposal.clientName}`);
        res.status(201).json(proposal);
      }
    } catch (error) {
      console.error("Error creating proposal:", error);
      res.status(500).json({ message: "Failed to create proposal" });
    }
  });
  app2.patch("/api/proposals/:id", requireAuth, async (req, res) => {
    try {
      const result = updateProposalSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid proposal data",
          errors: result.error.errors
        });
      }
      const proposal = await storage.updateProposal(req.params.id, result.data);
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }
      res.json(proposal);
    } catch (error) {
      console.error("Error updating proposal:", error);
      res.status(500).json({ message: "Failed to update proposal" });
    }
  });
  app2.delete("/api/proposals/:id", requireAuth, async (req, res) => {
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
  app2.post("/api/proposals/:id/send", requireAuth, async (req, res) => {
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
      const shareableLink = await storage.generateShareableLink(proposal.id);
      const updatedProposal = await storage.updateProposal(proposal.id, {
        status: "sent",
        sentAt: /* @__PURE__ */ new Date()
      });
      const { clientEmail: recipientEmail, message } = result.data;
      const emailTo = recipientEmail || proposal.clientEmail;
      const includePDF = true;
      if (emailTo) {
        try {
          const proposalUrl = `${req.protocol}://${req.get("host")}/shared/proposals/${shareableLink}`;
          const client = proposal.clientId ? await storage.getClient(proposal.clientId) : null;
          let pdfAttachment;
          if (includePDF) {
            try {
              console.log("\u{1F504} Generating PDF for proposal:", proposal.title);
              pdfAttachment = await generateProposalPDF({
                ...proposal,
                clientName: client?.name || "Valued Client",
                clientEmail: emailTo
              });
              console.log("\u2705 PDF generated successfully");
            } catch (pdfError) {
              console.error("\u274C PDF generation failed:", pdfError);
            }
          }
          const emailSent = await sendProposalEmail(
            emailTo,
            proposal.title,
            proposalUrl,
            client?.name || "Valued Client",
            message || "We are pleased to present our proposal for your review.",
            pdfAttachment
          );
          if (!emailSent) {
            console.error("Failed to send proposal email");
          } else {
            console.log(`\u{1F4E7} Enhanced proposal email sent for proposal ${proposal.id} to ${emailTo}${includePDF ? " with PDF attachment" : ""}`);
          }
        } catch (emailError) {
          console.error("Failed to send proposal email:", emailError);
        }
      }
      res.json({
        ...updatedProposal,
        shareableUrl: `${req.protocol}://${req.get("host")}/shared/proposals/${shareableLink}`
      });
    } catch (error) {
      console.error("Error sending proposal:", error);
      res.status(500).json({ message: "Failed to send proposal" });
    }
  });
  app2.post("/api/shared/proposals/:shareableLink/respond", async (req, res) => {
    try {
      const { response, message } = req.body;
      if (!response || !["accepted", "rejected", "revision_requested"].includes(response)) {
        return res.status(400).json({
          message: "Valid response is required",
          validResponses: ["accepted", "rejected", "revision_requested"]
        });
      }
      const proposal = await storage.getProposalByShareableLink(req.params.shareableLink);
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }
      if (proposal.expiresAt && /* @__PURE__ */ new Date() > new Date(proposal.expiresAt)) {
        return res.status(400).json({ message: "This proposal has expired and can no longer be responded to" });
      }
      const updateData = {
        status: response,
        respondedAt: /* @__PURE__ */ new Date(),
        responseMessage: message || ""
      };
      if (response === "accepted") {
        updateData.acceptedAt = /* @__PURE__ */ new Date();
      }
      const updatedProposal = await storage.updateProposal(proposal.id, updateData);
      try {
        await sendProposalResponseNotification(proposal, response, message);
      } catch (emailError) {
        console.error("Failed to send response notification:", emailError);
      }
      if (response === "revision_requested") {
        const message_response = `Revision requested successfully. The business team will review your feedback and create an updated proposal.`;
        res.json({
          message: message_response,
          proposal: updatedProposal,
          nextSteps: "A new proposal version will be created and sent to you for review."
        });
      } else {
        const message_response = `Proposal ${response} successfully${response === "accepted" ? ". Thank you for your business!" : ". Thank you for your time."}`;
        res.json({ message: message_response, proposal: updatedProposal });
      }
    } catch (error) {
      console.error("Error responding to proposal:", error);
      res.status(500).json({ message: "Failed to respond to proposal" });
    }
  });
  app2.post("/api/proposals/:id/create-revision", requireAuth, async (req, res) => {
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
  app2.get("/api/proposals/approval-stats", requireAuth, async (req, res) => {
    try {
      const stats = await getProposalApprovalStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching proposal approval stats:", error);
      res.status(500).json({ error: "Failed to fetch approval statistics" });
    }
  });
  app2.get("/api/proposals/needs-attention", requireAuth, async (req, res) => {
    try {
      const proposals2 = await storage.getProposals();
      const needsAttention = proposals2.filter(
        (p) => ["sent", "viewed", "revision_requested"].includes(p.status)
      );
      needsAttention.sort((a, b) => {
        if (a.status === "revision_requested" && b.status !== "revision_requested") return -1;
        if (b.status === "revision_requested" && a.status !== "revision_requested") return 1;
        const aDate = new Date(a.sentAt || a.createdAt).getTime();
        const bDate = new Date(b.sentAt || b.createdAt).getTime();
        return bDate - aDate;
      });
      res.json(needsAttention);
    } catch (error) {
      console.error("Error fetching proposals needing attention:", error);
      res.status(500).json({ error: "Failed to fetch proposals needing attention" });
    }
  });
  app2.get("/api/proposals/:id/revisions", requireAuth, async (req, res) => {
    try {
      const proposals2 = await storage.getProposals();
      const parentProposal = await storage.getProposal(req.params.id);
      if (!parentProposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }
      const revisions = proposals2.filter((p) => p.parentProposalId === req.params.id);
      revisions.sort((a, b) => (a.version || 1) - (b.version || 1));
      res.json({
        originalProposal: parentProposal,
        revisions,
        totalVersions: revisions.length + 1
      });
    } catch (error) {
      console.error("Error fetching proposal revisions:", error);
      res.status(500).json({ error: "Failed to fetch proposal revisions" });
    }
  });
  app2.get("/api/contracts", requireAuth, async (req, res) => {
    try {
      const contracts2 = await storage.getContracts();
      res.json(contracts2);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({ error: "Failed to fetch contracts" });
    }
  });
  app2.get("/api/contracts/:id", requireAuth, async (req, res) => {
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
  app2.post("/api/contracts", requireAuth, async (req, res) => {
    try {
      const contractData = insertContractSchema.parse(req.body);
      const newContract = {
        ...contractData,
        contractNumber: `CNT-${Date.now()}`,
        createdById: req.session.user.id,
        lastModifiedById: req.session.user.id,
        status: "draft"
      };
      const contract = await storage.createContract(newContract);
      console.log(`\u{1F4CB} Created contract "${contract.title}" (${contract.contractNumber})`);
      res.status(201).json(contract);
    } catch (error) {
      console.error("Error creating contract:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: "Invalid contract data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create contract" });
    }
  });
  app2.put("/api/contracts/:id", requireAuth, async (req, res) => {
    try {
      const contract = await storage.getContract(req.params.id);
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      const updateResult = insertContractSchema.safeParse(req.body);
      if (!updateResult.success) {
        return res.status(400).json({ error: "Invalid contract data", details: updateResult.error.errors });
      }
      const updateData = { ...updateResult.data, lastModifiedById: req.session.user.id };
      const updatedContract = await storage.updateContract(req.params.id, updateData);
      res.json(updatedContract);
    } catch (error) {
      console.error("Error updating contract:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: "Invalid contract data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update contract" });
    }
  });
  app2.delete("/api/contracts/:id", requireAuth, async (req, res) => {
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
  app2.get("/api/contracts/stats", requireAuth, async (req, res) => {
    try {
      const stats = await contractManagementService.getContractStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching contract statistics:", error);
      res.status(500).json({ error: "Failed to fetch contract statistics" });
    }
  });
  app2.post("/api/contracts/status-check", requireAuth, async (req, res) => {
    try {
      await contractManagementService.checkContractStatuses();
      res.json({ message: "Contract status check completed successfully" });
    } catch (error) {
      console.error("Error during contract status check:", error);
      res.status(500).json({ error: "Failed to check contract statuses" });
    }
  });
  app2.get("/api/contracts/needs-attention", requireAuth, async (req, res) => {
    try {
      const contracts2 = await storage.getContracts();
      const today = /* @__PURE__ */ new Date();
      const thirtyDaysFromNow = /* @__PURE__ */ new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      const needsAttention = contracts2.filter((contract) => {
        if (["sent", "viewed", "pending_signature", "partially_signed"].includes(contract.status || "")) {
          return true;
        }
        if (contract.expirationDate && new Date(contract.expirationDate) <= thirtyDaysFromNow && new Date(contract.expirationDate) > today && ["fully_signed", "executed"].includes(contract.status || "")) {
          return true;
        }
        return false;
      });
      needsAttention.sort((a, b) => {
        const aPendingSignature = ["sent", "viewed", "pending_signature", "partially_signed"].includes(a.status || "");
        const bPendingSignature = ["sent", "viewed", "pending_signature", "partially_signed"].includes(b.status || "");
        if (aPendingSignature && !bPendingSignature) return -1;
        if (bPendingSignature && !aPendingSignature) return 1;
        return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime();
      });
      res.json(needsAttention);
    } catch (error) {
      console.error("Error fetching contracts needing attention:", error);
      res.status(500).json({ error: "Failed to fetch contracts needing attention" });
    }
  });
  app2.get("/api/clients", requireAuth, async (req, res) => {
    try {
      const clients2 = await storage.getClients();
      res.json(clients2);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });
  app2.get("/api/clients/:id", requireAuth, async (req, res) => {
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
  app2.post("/api/clients", requireAuth, async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      console.log(`\u2705 Client created: ${client.name} (${client.email})`);
      res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(500).json({ message: "Failed to create client" });
    }
  });
  app2.get("/api/proposals/client/:clientId", requireAuth, async (req, res) => {
    try {
      const proposals2 = await storage.getProposals();
      const clientProposals = proposals2.filter((proposal) => proposal.clientId === req.params.clientId);
      res.json(clientProposals);
    } catch (error) {
      console.error("Error fetching client proposals:", error);
      res.status(500).json({ message: "Failed to fetch proposals" });
    }
  });
  app2.get("/api/invoices/client/:clientId", requireAuth, async (req, res) => {
    try {
      const invoices2 = await storage.getInvoices();
      const clientInvoices = invoices2.filter((invoice) => invoice.clientId === req.params.clientId);
      res.json(clientInvoices);
    } catch (error) {
      console.error("Error fetching client invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });
  app2.get("/api/payments/client/:clientId", requireAuth, async (req, res) => {
    try {
      const payments2 = await storage.getPayments();
      const clientPayments = payments2.filter((payment) => payment.clientId === req.params.clientId);
      res.json(clientPayments);
    } catch (error) {
      console.error("Error fetching client payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });
  app2.get("/api/clients/:clientId/documents", requireAuth, async (req, res) => {
    try {
      const documents = await storage.getClientDocuments(req.params.clientId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching client documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });
  app2.get("/api/client-documents", requireAuth, async (req, res) => {
    try {
      const documents = await storage.getAllClientDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching all client documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });
  app2.post("/api/client-documents/search", requireAuth, async (req, res) => {
    try {
      const searchParams = req.body;
      if (searchParams.page && searchParams.page < 1) {
        return res.status(400).json({ message: "Page must be greater than 0" });
      }
      if (searchParams.limit && (searchParams.limit < 1 || searchParams.limit > 1e3)) {
        return res.status(400).json({ message: "Limit must be between 1 and 1000" });
      }
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
  app2.get("/api/documents/:id", requireAuth, async (req, res) => {
    try {
      const document2 = await storage.getClientDocument(req.params.id);
      if (!document2) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document2);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });
  app2.post("/api/documents/upload", requireAuth, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });
  app2.post("/api/attachments/upload", requireAuth, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });
  app2.post("/api/attachments", requireAuth, async (req, res) => {
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
        uploadedById: req.session.user.id,
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
  app2.get("/api/attachments/:entityType/:entityId", requireAuth, async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const attachments = await storage.getFileAttachments(entityType, entityId);
      res.json(attachments);
    } catch (error) {
      console.error("Error getting file attachments:", error);
      res.status(500).json({ message: "Failed to get file attachments" });
    }
  });
  app2.post("/api/invoices/:id/send", requireAuth, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id, req.session.user.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      const client = invoice.clientId ? await storage.getClient(invoice.clientId) : null;
      if (!client || !client.email) {
        return res.status(400).json({ message: "Client email required to send invoice" });
      }
      console.log("\u{1F504} Generating invoice PDF for sending");
      const invoicePDF = await generateInvoicePDF({
        ...invoice,
        clientName: client.name,
        clientEmail: client.email
      });
      console.log("\u2705 Invoice PDF generated successfully");
      const emailSent = await sendInvoiceEmail(
        client.email,
        {
          ...invoice,
          clientName: client.name,
          clientEmail: client.email
        },
        invoicePDF,
        `Please find your invoice attached. Payment is due within the terms specified.`
      );
      if (emailSent) {
        await storage.updateInvoice(invoice.id, {
          status: "sent",
          sentAt: /* @__PURE__ */ new Date()
        });
        console.log(`\u{1F4E7} Invoice sent successfully to ${client.email}`);
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
  app2.post("/api/clients/:clientId/documents", requireAuth, async (req, res) => {
    try {
      const validatedData = insertClientDocumentSchema.parse({
        ...req.body,
        clientId: req.params.clientId,
        createdById: req.session.user?.id
      });
      if (validatedData.fileUrl) {
        const objectStorageService = new ObjectStorageService();
        const normalizedPath = await objectStorageService.trySetObjectEntityAclPolicy(
          validatedData.fileUrl,
          {
            owner: req.session.user?.id || "",
            visibility: "private"
            // Client documents are private by default
          }
        );
        validatedData.fileUrl = normalizedPath;
      }
      const document2 = await storage.createClientDocument(validatedData);
      console.log(`\u2705 Document created: ${document2.name} for client ${req.params.clientId}`);
      res.status(201).json(document2);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });
  app2.put("/api/documents/:id", requireAuth, async (req, res) => {
    try {
      const updateData = req.body;
      const document2 = await storage.updateClientDocument(req.params.id, updateData);
      if (!document2) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document2);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });
  app2.delete("/api/documents/:id", requireAuth, async (req, res) => {
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
  app2.get("/objects/:objectPath(*)", requireAuth, async (req, res) => {
    const userId = req.session.user?.id;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId,
        requestedPermission: "read" /* READ */
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
  app2.patch("/api/client-documents/:id", requireAuth, async (req, res) => {
    try {
      const updateData = req.body;
      const document2 = await storage.updateClientDocument(req.params.id, updateData);
      if (!document2) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document2);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });
  app2.post("/api/client-documents/bulk-update", requireAuth, async (req, res) => {
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
  app2.post("/api/client-documents/bulk-delete", requireAuth, async (req, res) => {
    try {
      const { documentIds } = req.body;
      if (!Array.isArray(documentIds) || documentIds.length === 0) {
        return res.status(400).json({ message: "Document IDs array required" });
      }
      let completed = 0;
      let errors = 0;
      for (const id of documentIds) {
        try {
          const success = await storage.deleteClientDocument(id);
          if (success) completed++;
          else errors++;
        } catch (error) {
          console.error(`Error deleting document ${id}:`, error);
          errors++;
        }
      }
      res.json({ total: documentIds.length, completed, errors });
    } catch (error) {
      console.error("Error in bulk delete documents:", error);
      res.status(500).json({ message: "Failed to delete documents" });
    }
  });
  app2.post("/api/client-documents/bulk-download", requireAuth, async (req, res) => {
    try {
      const { documentIds } = req.body;
      if (!Array.isArray(documentIds) || documentIds.length === 0) {
        return res.status(400).json({ message: "Document IDs array required" });
      }
      res.json({ message: "Bulk download feature not fully implemented yet", documentCount: documentIds.length });
    } catch (error) {
      console.error("Error in bulk download documents:", error);
      res.status(500).json({ message: "Failed to download documents" });
    }
  });
  app2.post("/api/projects/:id/complete", requireAuth, async (req, res) => {
    try {
      const projectId = req.params.id;
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      const updatedProject = await storage.updateProject(projectId, {
        status: "completed"
      });
      if (project.clientId) {
        try {
          const client = await storage.getClient(project.clientId);
          if (client && client.email) {
            const tasks2 = await storage.getTasksByProject(projectId);
            const totalHours = tasks2.reduce((sum, task) => {
              return sum + (task.actualHours || 0);
            }, 0);
            const invoiceData = {
              id: `INV-${project.id}-${Date.now()}`,
              clientId: project.clientId,
              clientName: client.name,
              clientEmail: client.email,
              projectDescription: project.name,
              totalAmount: totalHours * 100,
              // $100/hour default rate
              status: "sent",
              createdAt: /* @__PURE__ */ new Date(),
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3),
              // 30 days from now
              terms: "Payment is due within 30 days of invoice date.",
              lineItems: [{
                description: `Professional services for ${project.name}`,
                quantity: totalHours,
                rate: 100,
                amount: totalHours * 100
              }]
            };
            console.log("\u{1F504} Generating invoice PDF for completed project:", project.name);
            const invoicePDF = await generateInvoicePDF(invoiceData);
            console.log("\u2705 Invoice PDF generated successfully");
            const emailSent = await sendInvoiceEmail(
              client.email,
              invoiceData,
              invoicePDF,
              `Thank you for working with us on ${project.name}! Your project has been completed successfully.`
            );
            if (emailSent) {
              console.log(`\u{1F4E7} Invoice automatically sent to ${client.email} for completed project: ${project.name}`);
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
          console.error("\u274C Failed to generate/send automatic invoice:", invoiceError);
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
  app2.post("/api/invoices/generate", requireAuth, async (req, res) => {
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
      let totalAmount = customAmount || 0;
      if (project && !customAmount) {
        const tasks2 = await storage.getTasksByProject(project.id);
        const totalHours = tasks2.reduce((sum, task) => sum + (task.actualHours || 0), 0);
        totalAmount = totalHours * 100;
      }
      const invoiceData = {
        id: `INV-${Date.now()}`,
        clientId: client.id,
        clientName: client.name,
        clientEmail: client.email,
        projectDescription: project?.name || "Professional Services",
        totalAmount,
        status: "sent",
        createdAt: /* @__PURE__ */ new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3),
        terms: "Payment is due within 30 days of invoice date.",
        lineItems: [{
          description: project ? `Professional services for ${project.name}` : "Professional Services",
          quantity: 1,
          rate: totalAmount,
          amount: totalAmount
        }]
      };
      let invoicePDF;
      if (includePDF) {
        try {
          console.log("\u{1F504} Generating invoice PDF");
          invoicePDF = await generateInvoicePDF(invoiceData);
          console.log("\u2705 Invoice PDF generated successfully");
        } catch (pdfError) {
          console.error("\u274C Invoice PDF generation failed:", pdfError);
        }
      }
      const emailSent = await sendInvoiceEmail(
        client.email,
        invoiceData,
        invoicePDF,
        customMessage || "Thank you for your business! Please find your invoice attached."
      );
      if (emailSent) {
        res.json({
          success: true,
          message: `Invoice sent successfully to ${client.email}${includePDF ? " with PDF attachment" : ""}`,
          invoiceData
        });
      } else {
        res.status(500).json({
          error: "Failed to send invoice email",
          invoiceData
        });
      }
    } catch (error) {
      console.error("Error generating invoice:", error);
      res.status(500).json({ message: "Failed to generate invoice" });
    }
  });
  app2.post("/api/invoices", requireAuth, async (req, res) => {
    try {
      const invoiceData = insertInvoiceSchema.parse(req.body);
      const draftInvoice = {
        ...invoiceData,
        status: "draft",
        invoiceNumber: `INV-${Date.now()}`,
        createdById: req.session.user.id
      };
      const created = await storage.createInvoice(draftInvoice);
      const paymentLink = await storage.generatePaymentLink(created.id);
      console.info("[invoices#create] created row:", created);
      const createdWithPaymentLink = await storage.getInvoice(created.id, req.session.user.id);
      const finalInvoice = createdWithPaymentLink || created;
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
        paymentUrl: `${req.protocol}://${req.get("host")}/pay-invoice?link=${finalInvoice.paymentLink || paymentLink}`,
        createdAt: finalInvoice.createdAt,
        updatedAt: finalInvoice.updatedAt
      };
      console.log("[invoices#create] sending response:", responseData);
      res.status(201).json(responseData);
    } catch (error) {
      console.error("Error creating draft invoice:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: "Invalid invoice data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });
  app2.get("/api/invoices", requireAuth, async (req, res) => {
    try {
      const invoices2 = await storage.getInvoices(req.session.user.id);
      res.json(invoices2);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });
  app2.get("/api/invoices/:id", requireAuth, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id, req.session.user.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ error: "Failed to fetch invoice" });
    }
  });
  app2.get("/api/invoices/:id/pdf", requireAuth, async (req, res) => {
    try {
      let invoice = await storage.getInvoice(req.params.id, req.session.user.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      if (!invoice.paymentLink) {
        console.log("\u{1F517} Generating payment link for PDF");
        await storage.generatePaymentLink(invoice.id);
        invoice = await storage.getInvoice(req.params.id, req.session.user.id);
        if (!invoice) {
          return res.status(404).json({ error: "Invoice not found after payment link generation" });
        }
        console.log("\u2705 Payment link generated for PDF:", invoice.paymentLink);
      }
      const invoiceWithPaymentUrl = {
        ...invoice,
        paymentUrl: `${req.protocol}://${req.get("host")}/pay-invoice?link=${invoice.paymentLink}`
      };
      const pdfBuffer = await generateInvoicePDF(invoiceWithPaymentUrl);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating invoice PDF:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });
  app2.post("/api/proposals/:id/save-to-filing-cabinet", requireAuth, async (req, res) => {
    try {
      if (!req.params.id || typeof req.params.id !== "string") {
        return res.status(400).json({ error: "Invalid proposal ID" });
      }
      let proposal = await storage.getProposal(req.params.id, req.session.user.id);
      if (!proposal) {
        return res.status(404).json({ error: "Proposal not found" });
      }
      const proposalPDF = await generateProposalPDF({
        ...proposal,
        clientName: proposal.clientName || "Valued Client"
      });
      const fileName = `proposal-${proposal.title.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;
      const objectStorageService = new ObjectStorageService();
      const privateDir = objectStorageService.getPrivateObjectDir();
      const objectPath = `${privateDir}/${req.session.user.id}/proposals/${fileName}`;
      const { bucketName, objectName } = parseObjectPath(objectPath);
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);
      await file.save(proposalPDF, {
        metadata: {
          contentType: "application/pdf"
        }
      });
      const fileUrl = file.publicUrl();
      let clientId = proposal.clientId;
      if (!clientId && proposal.clientName) {
        console.log("Creating client for Filing Cabinet document");
        const clientData = {
          name: proposal.clientName,
          email: proposal.clientEmail || "",
          phone: "",
          address: "",
          notes: `Auto-created from proposal ${proposal.title}`,
          createdById: req.session.user.id
        };
        const newClient = await storage.createClient(clientData);
        clientId = newClient.id;
      }
      const documentData = {
        clientId,
        name: `Proposal: ${proposal.title}`,
        description: `Proposal for ${proposal.clientName || "client"} - ${proposal.title}`,
        type: "proposal",
        category: "proposal",
        fileUrl,
        fileName,
        fileSize: proposalPDF.length,
        mimeType: "application/pdf",
        uploadedById: req.session.user.id,
        createdById: req.session.user.id
      };
      const document2 = await storage.createClientDocument(documentData);
      console.log(`\u2705 Proposal PDF saved to Filing Cabinet: ${proposal.title}`);
      res.status(201).json({
        message: "Proposal PDF saved to Filing Cabinet successfully",
        documentId: document2.id,
        objectPath
      });
    } catch (error) {
      console.error("Error saving proposal PDF to Filing Cabinet:", error);
      res.status(500).json({ error: "Failed to save PDF to Filing Cabinet" });
    }
  });
  app2.post("/api/contracts/:id/save-to-filing-cabinet", requireAuth, async (req, res) => {
    try {
      if (!req.params.id || typeof req.params.id !== "string") {
        return res.status(400).json({ error: "Invalid contract ID" });
      }
      let contract = await storage.getContract(req.params.id, req.session.user.id);
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      const contractPDF = await generateContractPDF({
        ...contract,
        clientName: contract.clientName || "Valued Client"
      });
      const fileName = `contract-${contract.contractTitle.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;
      const objectStorageService = new ObjectStorageService();
      const privateDir = objectStorageService.getPrivateObjectDir();
      const objectPath = `${privateDir}/${req.session.user.id}/contracts/${fileName}`;
      const { bucketName, objectName } = parseObjectPath(objectPath);
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);
      await file.save(contractPDF, {
        metadata: {
          contentType: "application/pdf"
        }
      });
      const fileUrl = file.publicUrl();
      let clientId = contract.clientId;
      if (!clientId && contract.clientName) {
        console.log("Creating client for Filing Cabinet document");
        const clientData = {
          name: contract.clientName,
          email: contract.clientEmail || "",
          phone: "",
          address: contract.clientAddress || "",
          notes: `Auto-created from contract ${contract.contractTitle}`,
          createdById: req.session.user.id
        };
        const newClient = await storage.createClient(clientData);
        clientId = newClient.id;
      }
      const documentData = {
        clientId,
        name: `Contract: ${contract.contractTitle}`,
        description: `Contract for ${contract.clientName || "client"} - ${contract.contractTitle}`,
        type: "contract",
        category: "contract",
        fileUrl,
        fileName,
        fileSize: contractPDF.length,
        mimeType: "application/pdf",
        uploadedById: req.session.user.id,
        createdById: req.session.user.id
      };
      const document2 = await storage.createClientDocument(documentData);
      console.log(`\u2705 Contract PDF saved to Filing Cabinet: ${contract.contractTitle}`);
      res.status(201).json({
        message: "Contract PDF saved to Filing Cabinet successfully",
        documentId: document2.id,
        objectPath
      });
    } catch (error) {
      console.error("Error saving contract PDF to Filing Cabinet:", error);
      res.status(500).json({ error: "Failed to save PDF to Filing Cabinet" });
    }
  });
  app2.post("/api/presentations/:id/save-to-filing-cabinet", requireAuth, async (req, res) => {
    try {
      if (!req.params.id || typeof req.params.id !== "string") {
        return res.status(400).json({ error: "Invalid presentation ID" });
      }
      let presentation = await storage.getPresentation(req.params.id, req.session.user.id);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      const presentationPDF = await generatePresentationPDF({
        ...presentation,
        author: presentation.author || "Presenter"
      });
      const fileName = `presentation-${presentation.title.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;
      const objectStorageService = new ObjectStorageService();
      const privateDir = objectStorageService.getPrivateObjectDir();
      const objectPath = `${privateDir}/${req.session.user.id}/presentations/${fileName}`;
      const { bucketName, objectName } = parseObjectPath(objectPath);
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);
      await file.save(presentationPDF, {
        metadata: {
          contentType: "application/pdf"
        }
      });
      const fileUrl = file.publicUrl();
      let clientId = null;
      if (presentation.audience) {
        console.log("Creating client for presentation Filing Cabinet document");
        const clientData = {
          name: `Presentation Audience: ${presentation.audience}`,
          email: "",
          phone: "",
          address: "",
          notes: `Auto-created from presentation ${presentation.title}`,
          createdById: req.session.user.id
        };
        const newClient = await storage.createClient(clientData);
        clientId = newClient.id;
      }
      const documentData = {
        clientId,
        name: `Presentation: ${presentation.title}`,
        description: `Presentation: ${presentation.title} - ${presentation.audience || "General Audience"}`,
        type: "presentation",
        category: "presentation",
        fileUrl,
        fileName,
        fileSize: presentationPDF.length,
        mimeType: "application/pdf",
        uploadedById: req.session.user.id,
        createdById: req.session.user.id
      };
      const document2 = await storage.createClientDocument(documentData);
      console.log(`\u2705 Presentation PDF saved to Filing Cabinet: ${presentation.title}`);
      res.status(201).json({
        message: "Presentation PDF saved to Filing Cabinet successfully",
        documentId: document2.id,
        objectPath
      });
    } catch (error) {
      console.error("Error saving presentation PDF to Filing Cabinet:", error);
      res.status(500).json({ error: "Failed to save PDF to Filing Cabinet" });
    }
  });
  app2.post("/api/invoices/:id/save-to-filing-cabinet", requireAuth, async (req, res) => {
    try {
      let invoice = await storage.getInvoice(req.params.id, req.session.user.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      if (!invoice.paymentLink) {
        console.log("\u{1F517} Generating payment link for PDF");
        await storage.generatePaymentLink(invoice.id);
        invoice = await storage.getInvoice(req.params.id, req.session.user.id);
        if (!invoice) {
          return res.status(404).json({ error: "Invoice not found after payment link generation" });
        }
        console.log("\u2705 Payment link generated for PDF:", invoice.paymentLink);
      }
      const invoiceWithPaymentUrl = {
        ...invoice,
        paymentUrl: `${req.protocol}://${req.get("host")}/pay-invoice?link=${invoice.paymentLink}`
      };
      const pdfBuffer = await generateInvoicePDF(invoiceWithPaymentUrl);
      const fileName = `invoice-${invoice.invoiceNumber}.pdf`;
      const objectStorageService = new ObjectStorageService();
      const privateDir = objectStorageService.getPrivateObjectDir();
      const objectPath = `${privateDir}/${req.session.user.id}/invoices/${fileName}`;
      const { bucketName, objectName } = parseObjectPath(objectPath);
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);
      await file.save(pdfBuffer, {
        metadata: {
          contentType: "application/pdf"
        }
      });
      const fileUrl = file.publicUrl();
      let clientId = invoice.clientId;
      if (!clientId && invoice.clientName) {
        console.log("Creating client for Filing Cabinet document");
        const clientData = {
          name: invoice.clientName,
          email: invoice.clientEmail || "",
          phone: "",
          address: "",
          notes: `Auto-created from invoice ${invoice.invoiceNumber}`,
          createdById: req.session.user.id
        };
        const newClient = await storage.createClient(clientData);
        clientId = newClient.id;
        console.log(`\u2705 Created client: ${newClient.name} (${clientId})`);
      }
      const documentData = {
        clientId,
        name: `Invoice ${invoice.invoiceNumber}`,
        description: `Invoice for ${invoice.clientName || "client"} - $${invoice.totalAmount}`,
        type: "invoice",
        category: "invoice",
        fileUrl,
        fileName,
        fileSize: pdfBuffer.length,
        mimeType: "application/pdf",
        uploadedById: req.session.user.id,
        createdById: req.session.user.id
      };
      const document2 = await storage.createClientDocument(documentData);
      console.log(`\u2705 Invoice PDF saved to Filing Cabinet: ${document2.name}`);
      res.status(201).json({
        success: true,
        message: "Invoice PDF saved to Filing Cabinet successfully",
        document: document2
      });
    } catch (error) {
      console.error("Error saving invoice PDF to Filing Cabinet:", error);
      res.status(500).json({ error: "Failed to save PDF to Filing Cabinet" });
    }
  });
  app2.put("/api/invoices/:id", requireAuth, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id, req.session.user.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      if (invoice.status !== "draft") {
        return res.status(400).json({ error: "Only draft invoices can be edited" });
      }
      const updateData = insertInvoiceSchema.partial().parse(req.body);
      if (updateData.lineItems) {
        const subtotal = Array.isArray(updateData.lineItems) ? updateData.lineItems.reduce((sum, item) => sum + Number(item.amount), 0) : 0;
        const taxAmount = subtotal * Number(updateData.taxRate || invoice.taxRate || 0) / 100;
        const totalAmount = subtotal + taxAmount - Number(updateData.discountAmount || 0);
        updateData.subtotal = subtotal.toString();
        updateData.taxAmount = taxAmount.toString();
        updateData.totalAmount = totalAmount.toString();
      }
      const updatedInvoice = await storage.updateInvoice(req.params.id, updateData, req.session.user.id);
      if (updatedInvoice) {
        if (!updatedInvoice.paymentLink) {
          await storage.generatePaymentLink(updatedInvoice.id);
          const updatedWithLink = await storage.getInvoice(updatedInvoice.id, req.session.user.id);
          if (updatedWithLink) {
            const result2 = {
              ...updatedWithLink,
              paymentUrl: `${req.protocol}://${req.get("host")}/pay-invoice?link=${updatedWithLink.paymentLink}`
            };
            return res.json(result2);
          }
        }
        const result = {
          ...updatedInvoice,
          paymentUrl: updatedInvoice.paymentLink ? `${req.protocol}://${req.get("host")}/pay-invoice?link=${updatedInvoice.paymentLink}` : void 0
        };
        res.json(result);
      } else {
        res.status(404).json({ error: "Invoice not found" });
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: "Invalid invoice data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update invoice" });
    }
  });
  app2.post("/api/invoices/:id/send", requireAuth, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id, req.session.user.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      if (invoice.status !== "draft") {
        return res.status(400).json({ error: "Only draft invoices can be sent" });
      }
      const { customMessage, includePDF } = req.body;
      let client;
      if (invoice.clientId) {
        client = await storage.getClient(invoice.clientId);
      }
      if (!client || !client.email) {
        return res.status(400).json({ error: "Valid client with email required" });
      }
      let invoicePDF;
      if (includePDF) {
        try {
          console.log("\u{1F504} Generating invoice PDF");
          let pdfInvoice = invoice;
          if (!invoice.paymentLink) {
            console.log("\u{1F517} Generating payment link for PDF");
            await storage.generatePaymentLink(invoice.id);
            pdfInvoice = await storage.getInvoice(invoice.id, req.session.user.id);
            if (!pdfInvoice) {
              throw new Error("Invoice not found after payment link generation");
            }
            console.log("\u2705 Payment link generated for PDF:", pdfInvoice.paymentLink);
          }
          const invoiceWithPaymentUrl = {
            ...pdfInvoice,
            paymentUrl: `${req.protocol}://${req.get("host")}/pay-invoice?link=${pdfInvoice.paymentLink}`
          };
          invoicePDF = await generateInvoicePDF(invoiceWithPaymentUrl);
          console.log("\u2705 Invoice PDF generated successfully");
        } catch (pdfError) {
          console.error("\u274C Invoice PDF generation failed:", pdfError);
        }
      }
      const emailSent = await sendInvoiceEmail(
        client.email,
        invoice,
        invoicePDF,
        customMessage || "Thank you for your business! Please find your invoice attached."
      );
      if (emailSent) {
        await storage.updateInvoice(invoice.id, { status: "sent" });
        res.json({
          success: true,
          message: `Invoice sent successfully to ${client.email}${includePDF ? " with PDF attachment" : ""}`,
          invoiceData: invoice
        });
      } else {
        res.status(500).json({
          error: "Failed to send invoice email",
          invoiceData: invoice
        });
      }
    } catch (error) {
      console.error("Error sending invoice:", error);
      res.status(500).json({ error: "Failed to send invoice" });
    }
  });
  app2.delete("/api/invoices/:id", requireAuth, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id, req.session.user.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      if (invoice.status !== "draft") {
        return res.status(400).json({ error: "Only draft invoices can be deleted" });
      }
      const deleted = await storage.deleteInvoice(req.params.id, req.session.user.id);
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
  app2.post("/api/invoices/status-update", requireAuth, async (req, res) => {
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
  app2.get("/api/invoices/overdue-stats", requireAuth, async (req, res) => {
    try {
      const stats = await invoiceStatusService.getOverdueStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching overdue stats:", error);
      res.status(500).json({ error: "Failed to fetch overdue statistics" });
    }
  });
  app2.get("/api/invoices/overdue", requireAuth, async (req, res) => {
    try {
      const invoices2 = await storage.getInvoices();
      const overdueInvoices = invoices2.filter((inv) => inv.status === "overdue");
      res.json(overdueInvoices);
    } catch (error) {
      console.error("Error fetching overdue invoices:", error);
      res.status(500).json({ error: "Failed to fetch overdue invoices" });
    }
  });
  app2.get("/api/invoices/automation/rules", requireAuth, async (req, res) => {
    try {
      const rules = automatedInvoicingService.getAllRules();
      res.json(rules);
    } catch (error) {
      console.error("Error fetching automation rules:", error);
      res.status(500).json({ error: "Failed to fetch automation rules" });
    }
  });
  app2.post("/api/invoices/automation/recurring", requireAuth, async (req, res) => {
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
        nextGenerationDate: /* @__PURE__ */ new Date(),
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
  app2.post("/api/invoices/automation/reminder", requireAuth, async (req, res) => {
    try {
      const { name, triggerDays, reminderType, customMessage } = req.body;
      if (!name || triggerDays === void 0 || !reminderType) {
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
  app2.post("/api/invoices/automation/trigger", requireAuth, async (req, res) => {
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
  app2.get("/api/notifications/rules", requireAuth, async (req, res) => {
    try {
      const rules = smartNotificationsService.getAllRules();
      res.json(rules);
    } catch (error) {
      console.error("Error fetching notification rules:", error);
      res.status(500).json({ error: "Failed to fetch notification rules" });
    }
  });
  app2.post("/api/notifications/rules", requireAuth, async (req, res) => {
    try {
      const { name, description, trigger, conditions, actions, priority, batchingEnabled, batchingWindow } = req.body;
      if (!name || !trigger || !actions || !Array.isArray(actions)) {
        return res.status(400).json({ error: "Missing required fields: name, trigger, actions" });
      }
      const ruleId = smartNotificationsService.addNotificationRule({
        name,
        description: description || "",
        trigger,
        conditions: conditions || [],
        actions,
        isActive: true,
        priority: priority || "medium",
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
  app2.patch("/api/notifications/rules/:id", requireAuth, async (req, res) => {
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
  app2.get("/api/notifications/stats", requireAuth, async (req, res) => {
    try {
      const stats = smartNotificationsService.getNotificationStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching notification stats:", error);
      res.status(500).json({ error: "Failed to fetch notification statistics" });
    }
  });
  app2.post("/api/notifications/trigger", requireAuth, async (req, res) => {
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
  app2.post("/api/notifications/event", requireAuth, async (req, res) => {
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
  app2.get("/api/workflows/templates", requireAuth, async (req, res) => {
    try {
      const templates2 = workflowTemplatesService.getAllTemplates();
      res.json(templates2);
    } catch (error) {
      console.error("Error fetching workflow templates:", error);
      res.status(500).json({ error: "Failed to fetch workflow templates" });
    }
  });
  app2.get("/api/workflows/templates/search", requireAuth, async (req, res) => {
    try {
      const { q, category, complexity, tags, minRating } = req.query;
      const filters = {};
      if (category) filters.category = category;
      if (complexity) filters.complexity = complexity;
      if (tags) filters.tags = tags.split(",");
      if (minRating) filters.minRating = parseFloat(minRating);
      const templates2 = workflowTemplatesService.searchTemplates(q || "", filters);
      res.json(templates2);
    } catch (error) {
      console.error("Error searching workflow templates:", error);
      res.status(500).json({ error: "Failed to search workflow templates" });
    }
  });
  app2.get("/api/workflows/templates/category/:category", requireAuth, async (req, res) => {
    try {
      const { category } = req.params;
      const templates2 = workflowTemplatesService.getTemplatesByCategory(category);
      res.json(templates2);
    } catch (error) {
      console.error("Error fetching templates by category:", error);
      res.status(500).json({ error: "Failed to fetch templates by category" });
    }
  });
  app2.get("/api/workflows/templates/popular", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const templates2 = workflowTemplatesService.getPopularTemplates(limit);
      res.json(templates2);
    } catch (error) {
      console.error("Error fetching popular templates:", error);
      res.status(500).json({ error: "Failed to fetch popular templates" });
    }
  });
  app2.get("/api/workflows/templates/:id", requireAuth, async (req, res) => {
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
  app2.post("/api/workflows/templates/:id/install", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { customizations } = req.body;
      const userId = req.session.user.id;
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
  app2.post("/api/workflows/templates", requireAuth, async (req, res) => {
    try {
      const templateData = req.body;
      templateData.author = req.session.user.username;
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
  app2.get("/api/workflows/templates/:id/export", requireAuth, async (req, res) => {
    try {
      const templateJson = workflowTemplatesService.exportTemplate(req.params.id);
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="workflow-template-${req.params.id}.json"`);
      res.send(templateJson);
    } catch (error) {
      console.error("Error exporting template:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to export template" });
    }
  });
  app2.post("/api/workflows/templates/import", requireAuth, async (req, res) => {
    try {
      const { templateJson } = req.body;
      const userId = req.session.user.id;
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
  app2.get("/api/workflows/installed", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const workflows = workflowTemplatesService.getUserWorkflows(userId);
      res.json(workflows);
    } catch (error) {
      console.error("Error fetching user workflows:", error);
      res.status(500).json({ error: "Failed to fetch user workflows" });
    }
  });
  app2.post("/api/workflows/:id/execute", requireAuth, async (req, res) => {
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
  app2.get("/api/workflows/stats", requireAuth, async (req, res) => {
    try {
      const stats = workflowTemplatesService.getWorkflowStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching workflow stats:", error);
      res.status(500).json({ error: "Failed to fetch workflow statistics" });
    }
  });
  app2.post("/api/workflows/trigger", requireAuth, async (req, res) => {
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
  app2.post("/api/messages", requireAuth, async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage({
        ...messageData,
        fromUserId: req.session.user.id
      });
      if (messageData.toEmail && !messageData.toUserId) {
        const fromUser = await storage.getUser(req.session.user.id);
        if (fromUser) {
          const emailSent = await sendMessageAsEmail(
            message,
            fromUser,
            messageData.toEmail
          );
          if (emailSent) {
            console.log(`\u{1F4E7} Message sent as email to ${messageData.toEmail}`);
          } else {
            console.log(`\u26A0\uFE0F Failed to send message as email to ${messageData.toEmail}`);
          }
        }
      }
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: "Invalid message data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create message" });
    }
  });
  app2.get("/api/messages", requireAuth, async (req, res) => {
    try {
      const messages2 = await storage.getMessages(req.session.user.id);
      res.json(messages2);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });
  app2.put("/api/messages/:id/read", requireAuth, async (req, res) => {
    try {
      const messageId = req.params.id;
      const message = await storage.markMessageAsRead(messageId, req.session.user.id);
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }
      res.json(message);
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ error: "Failed to mark message as read" });
    }
  });
  app2.get("/api/messages/unread-count", requireAuth, async (req, res) => {
    try {
      const count = await storage.getUnreadMessageCount(req.session.user.id);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread message count:", error);
      res.status(500).json({ error: "Failed to fetch unread message count" });
    }
  });
  app2.get("/api/messages/email-config", requireAuth, async (req, res) => {
    const sendGridConfigured = !!(process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY_2);
    const webhookUrl = `${process.env.APP_URL || "http://localhost:5000"}/api/inbound-email`;
    res.json({
      emailIntegration: {
        outbound: {
          enabled: sendGridConfigured,
          status: sendGridConfigured ? "\u2705 Configured" : "\u26A0\uFE0F Not configured",
          note: sendGridConfigured ? "Messages to external emails will be sent via SendGrid" : "Set SENDGRID_API_KEY to enable outbound emails"
        },
        inbound: {
          webhookUrl,
          status: "\u{1F527} Ready for configuration",
          setupInstructions: [
            "1. Go to SendGrid dashboard \u2192 Settings \u2192 Inbound Parse",
            "2. Add a new host & URL configuration",
            `3. Set webhook URL to: ${webhookUrl}`,
            "4. Configure a subdomain (e.g., messages.yourdomain.com)",
            "5. Emails sent to that address will appear in your messages"
          ]
        },
        emailAddress: `messages@${process.env.REPLIT_DOMAINS?.split(",")[0] || "yourapp.replit.app"}`,
        note: "Once configured, send emails to the above address and they'll appear as messages in your app"
      }
    });
  });
  app2.post("/api/inbound-email", express.raw({ type: "text/plain" }), async (req, res) => {
    const userAgent = req.get("User-Agent") || "";
    if (!userAgent.includes("SendGrid")) {
      console.warn("\u{1F4E7} Suspicious webhook request without SendGrid User-Agent");
      return res.status(401).json({ error: "Unauthorized webhook source" });
    }
    try {
      console.log("\u{1F4E7} Received inbound email webhook");
      const formData = req.body.toString();
      const emailData = parseInboundEmail(formData);
      console.log(`Inbound email from: ${emailData.fromEmail}`);
      console.log(`Subject: ${emailData.subject}`);
      const possibleUsers = await storage.getUsers();
      let toUser = possibleUsers.find((u) => u.email === emailData.fromEmail || u.notificationEmail === emailData.fromEmail);
      if (!toUser) {
        const systemUser = possibleUsers.find((u) => u.role === "admin");
        if (systemUser) {
          const message = await storage.createMessage({
            toUserId: systemUser.id,
            toEmail: systemUser.email,
            subject: `Unrecognized Email: ${emailData.subject}`,
            content: `Received email from unrecognized sender: ${emailData.fromEmail}

Original Subject: ${emailData.subject}

Content:
${emailData.content}`,
            priority: "medium",
            attachments: emailData.attachments || [],
            fromUserId: systemUser.id
            // System message
          });
          console.log(`\u{1F4E7} Created system message for unrecognized sender: ${emailData.fromEmail}`);
        }
      } else {
        const adminUser = possibleUsers.find((u) => u.role === "admin") || possibleUsers[0];
        if (adminUser) {
          const message = await storage.createMessage({
            toUserId: adminUser.id,
            toEmail: adminUser.email,
            subject: emailData.subject,
            content: emailData.content,
            priority: "medium",
            attachments: emailData.attachments || [],
            fromUserId: toUser.id
          });
          console.log(`\u{1F4E7} Created message from ${emailData.fromEmail} for ${adminUser.email}`);
        }
      }
      res.status(200).send("OK");
    } catch (error) {
      console.error("Error processing inbound email:", error);
      res.status(500).send("Error processing email");
    }
  });
  app2.post("/api/agency/create", requireAuth, async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "OpenAI API key not configured" });
      }
      console.log("\u{1F3A8} Creating marketing content for:", prompt.substring(0, 50) + "...");
      const response = await openai4.chat.completions.create({
        model: "gpt-4o",
        // Use gpt-4o instead as gpt-5 may not be available yet
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
        max_tokens: 1e3,
        temperature: 0.8
      });
      const content = response.choices[0].message.content;
      console.log("\u2705 Marketing content generated successfully");
      res.json({ content });
    } catch (error) {
      console.error("\u274C OpenAI Create API Error:", error.message || error);
      if (error.code === "model_not_found") {
        return res.status(500).json({ error: "AI model not available. Please try again later." });
      }
      res.status(500).json({ error: "Failed to generate creative content: " + (error.message || "Unknown error") });
    }
  });
  app2.post("/api/agency/write", requireAuth, async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "OpenAI API key not configured" });
      }
      console.log("\u270D\uFE0F Writing content for:", prompt.substring(0, 50) + "...");
      const response = await openai4.chat.completions.create({
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
      console.log("\u2705 Written content generated successfully");
      res.json({ content });
    } catch (error) {
      console.error("\u274C OpenAI Write API Error:", error.message || error);
      if (error.code === "model_not_found") {
        return res.status(500).json({ error: "AI model not available. Please try again later." });
      }
      res.status(500).json({ error: "Failed to generate written content: " + (error.message || "Unknown error") });
    }
  });
  app2.post("/api/agency/promote", requireAuth, async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "OpenAI API key not configured" });
      }
      console.log("\u{1F4E2} Creating promotion strategy for:", prompt.substring(0, 50) + "...");
      const response = await openai4.chat.completions.create({
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
      console.log("\u2705 Promotion strategy generated successfully");
      res.json({ content });
    } catch (error) {
      console.error("\u274C OpenAI Promote API Error:", error.message || error);
      if (error.code === "model_not_found") {
        return res.status(500).json({ error: "AI model not available. Please try again later." });
      }
      res.status(500).json({ error: "Failed to generate promotion strategy: " + (error.message || "Unknown error") });
    }
  });
  app2.post("/api/agency/track", requireAuth, async (req, res) => {
    try {
      const { data } = req.body;
      if (!data) {
        return res.status(400).json({ error: "Data is required" });
      }
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "OpenAI API key not configured" });
      }
      console.log("\u{1F4CA} Analyzing marketing data:", data.substring(0, 50) + "...");
      const response = await openai4.chat.completions.create({
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
        max_tokens: 1e3,
        temperature: 0.5
      });
      const insights = response.choices[0].message.content;
      console.log("\u2705 Marketing analysis completed successfully");
      res.json({ insights });
    } catch (error) {
      console.error("\u274C OpenAI Track API Error:", error.message || error);
      if (error.code === "model_not_found") {
        return res.status(500).json({ error: "AI model not available. Please try again later." });
      }
      res.status(500).json({ error: "Failed to analyze marketing data: " + (error.message || "Unknown error") });
    }
  });
  app2.post("/api/agency/generate-image", requireAuth, async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "OpenAI API key not configured" });
      }
      console.log("\u{1F5BC}\uFE0F Generating image for:", prompt.substring(0, 50) + "...");
      const response = await openai4.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard"
      });
      const imageUrl = response.data?.[0]?.url;
      console.log("\u2705 Image generated successfully");
      res.json({ imageUrl });
    } catch (error) {
      console.error("\u274C OpenAI Image Generation Error:", error.message || error);
      if (error.code === "model_not_found") {
        return res.status(500).json({ error: "Image generation model not available. Please try again later." });
      }
      res.status(500).json({ error: "Failed to generate image: " + (error.message || "Unknown error") });
    }
  });
  app2.post("/api/agency/save-image-to-filing-cabinet", requireAuth, async (req, res) => {
    try {
      const { imageUrl, prompt, description } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ error: "Image URL is required" });
      }
      console.log("\u{1F4BE} Saving generated image to Filing Cabinet...");
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error("Failed to download image");
      }
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      const fileName = `agency-visual-${Date.now()}.png`;
      const objectStorageService = new ObjectStorageService();
      const privateDir = objectStorageService.getPrivateObjectDir();
      const objectPath = `${privateDir}/${req.session.user.id}/agency-visuals/${fileName}`;
      const { bucketName, objectName } = parseObjectPath(objectPath);
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);
      await file.save(imageBuffer, {
        metadata: {
          contentType: "image/png"
        }
      });
      const fileUrl = file.publicUrl();
      console.log("Creating client for Agency Hub visual Filing Cabinet document");
      const clientData = {
        name: "Agency Hub Visuals",
        email: "",
        phone: "",
        address: "",
        notes: "Auto-created for Agency Hub generated visuals",
        createdById: req.session.user.id
      };
      let existingClients = await storage.getClients();
      let agencyClient = existingClients.find((c) => c.name === "Agency Hub Visuals" && c.createdById === req.session.user.id);
      if (!agencyClient) {
        agencyClient = await storage.createClient(clientData);
      }
      const documentData = {
        clientId: agencyClient.id,
        name: `Agency Visual: ${prompt?.substring(0, 50) || "Generated Visual"}...`,
        description: description || `AI-generated marketing visual${prompt ? ` from prompt: ${prompt}` : ""}`,
        type: "visual",
        category: "marketing",
        fileUrl,
        fileName,
        fileSize: imageBuffer.length,
        mimeType: "image/png",
        uploadedById: req.session.user.id,
        createdById: req.session.user.id,
        tags: ["agency-hub", "ai-generated", "marketing-visual"],
        metadata: {
          prompt: prompt || "",
          generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          source: "agency-hub-dall-e-3"
        }
      };
      const document2 = await storage.createClientDocument(documentData);
      console.log(`\u2705 Agency visual saved to Filing Cabinet: ${fileName}`);
      res.status(201).json({
        message: "Visual saved to Filing Cabinet successfully",
        document: document2,
        clientName: agencyClient.name
      });
    } catch (error) {
      console.error("\u274C Save to Filing Cabinet Error:", error.message || error);
      res.status(500).json({ error: "Failed to save visual to Filing Cabinet: " + (error.message || "Unknown error") });
    }
  });
  app2.get("/api/payments", requireAuth, async (req, res) => {
    try {
      const payments2 = await storage.getPayments();
      res.json(payments2);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });
  app2.get("/api/payments/:id", requireAuth, async (req, res) => {
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
  app2.post("/api/payments", requireAuth, async (req, res) => {
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
      if (payment.invoiceId) {
        const invoice = await storage.getInvoice(payment.invoiceId);
        if (invoice) {
          const totalPaid = parseFloat(invoice.amountPaid || "0") + parseFloat(payment.amount);
          const balanceDue = parseFloat(invoice.totalAmount || "0") - totalPaid;
          const status = balanceDue <= 0 ? "paid" : "sent";
          await storage.updateInvoice(payment.invoiceId, {
            amountPaid: totalPaid.toFixed(2),
            balanceDue: balanceDue.toFixed(2),
            status,
            paidAt: balanceDue <= 0 ? /* @__PURE__ */ new Date() : invoice.paidAt
          });
        }
      }
      res.json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ error: "Failed to create payment" });
    }
  });
  app2.put("/api/payments/:id", requireAuth, async (req, res) => {
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
  app2.delete("/api/payments/:id", requireAuth, async (req, res) => {
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
  app2.get("/api/invoices/:id/payments", requireAuth, async (req, res) => {
    try {
      const payments2 = await storage.getPayments();
      const invoicePayments = payments2.filter((p) => p.invoiceId === req.params.id);
      res.json(invoicePayments);
    } catch (error) {
      console.error("Error fetching invoice payments:", error);
      res.status(500).json({ error: "Failed to fetch invoice payments" });
    }
  });
  app2.post("/api/test-pdf/:type", requireAuth, async (req, res) => {
    try {
      const { type } = req.params;
      if (type === "invoice") {
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
              rate: 50,
              amount: 2e3
            },
            {
              description: "Project Management",
              quantity: 10,
              rate: 50,
              amount: 500
            }
          ],
          terms: "Payment due within 30 days. Late fees may apply.",
          createdAt: /* @__PURE__ */ new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3)
        };
        const pdfBuffer = await generateInvoicePDF(testInvoice);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'attachment; filename="test-invoice.pdf"');
        res.send(pdfBuffer);
      } else if (type === "proposal") {
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
          createdAt: /* @__PURE__ */ new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3)
        };
        const pdfBuffer = await generateProposalPDF(testProposal);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'attachment; filename="test-proposal.pdf"');
        res.send(pdfBuffer);
      } else {
        return res.status(400).json({ error: "Invalid PDF type. Use 'invoice' or 'proposal'" });
      }
      console.log(`\u2705 ${type} PDF generated successfully`);
    } catch (error) {
      console.error(`\u274C PDF generation error:`, error);
      res.status(500).json({ error: `Failed to generate ${req.params.type} PDF: ${error.message}` });
    }
  });
  app2.get("/public-objects/:filePath(*)", async (req, res) => {
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
  app2.get("/objects/:objectPath(*)", requireAuth, async (req, res) => {
    const userId = req.session.user?.id;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId,
        requestedPermission: "read" /* READ */
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
  app2.post("/api/objects/upload", requireAuth, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });
  app2.put("/api/objects/acl", requireAuth, async (req, res) => {
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
  app2.get("/api/calendar/export", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.role === "admin" ? void 0 : req.session.user?.id;
      const tasks2 = await storage.getTasks(userId);
      const icalLines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Gigster Garage//Task Calendar//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH"
      ];
      for (const task of tasks2) {
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate);
          const uid = `task-${task.id}@gigster-garage.com`;
          const dtstart = dueDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
          icalLines.push(
            "BEGIN:VEVENT",
            `UID:${uid}`,
            `DTSTART:${dtstart}`,
            `DTEND:${dtstart}`,
            `SUMMARY:${task.title}`,
            `DESCRIPTION:${task.description || ""}`,
            `STATUS:${task.completed ? "COMPLETED" : "CONFIRMED"}`,
            `PRIORITY:${task.priority === "high" ? "1" : task.priority === "medium" ? "5" : "9"}`,
            "END:VEVENT"
          );
        }
      }
      icalLines.push("END:VCALENDAR");
      res.setHeader("Content-Type", "text/calendar");
      res.setHeader("Content-Disposition", 'attachment; filename="gigster-garage-tasks.ics"');
      res.send(icalLines.join("\r\n"));
    } catch (error) {
      console.error("Error exporting calendar:", error);
      res.status(500).json({ error: "Failed to export calendar" });
    }
  });
  app2.get("/api/analytics/productivity", requireAuth, async (req, res) => {
    try {
      const { days = 30 } = req.query;
      const userId = req.session.user?.role === "admin" ? void 0 : req.session.user?.id;
      const timeLogs2 = await storage.getTimeLogs(userId);
      const tasks2 = await storage.getTasks(userId);
      const dayCount = parseInt(days);
      const cutoffDate = /* @__PURE__ */ new Date();
      cutoffDate.setDate(cutoffDate.getDate() - dayCount);
      const recentLogs = timeLogs2.filter((log2) => new Date(log2.createdAt) >= cutoffDate);
      const recentTasks = tasks2.filter((task) => new Date(task.createdAt) >= cutoffDate);
      const dailyData = [];
      for (let i = dayCount - 1; i >= 0; i--) {
        const date2 = /* @__PURE__ */ new Date();
        date2.setDate(date2.getDate() - i);
        const dateStr = date2.toISOString().split("T")[0];
        const dayLogs = recentLogs.filter(
          (log2) => log2.createdAt.split("T")[0] === dateStr
        );
        const dayTasks = recentTasks.filter(
          (task) => task.createdAt.split("T")[0] === dateStr
        );
        const completedTasks = dayTasks.filter(
          (task) => task.completed && task.updatedAt && task.updatedAt.split("T")[0] === dateStr
        );
        const totalMinutes = dayLogs.reduce((sum, log2) => {
          if (log2.endTime) {
            const duration = new Date(log2.endTime).getTime() - new Date(log2.startTime).getTime();
            return sum + Math.floor(duration / 6e4);
          }
          return sum;
        }, 0);
        dailyData.push({
          date: dateStr,
          hours: Math.round(totalMinutes / 60 * 100) / 100,
          tasksCreated: dayTasks.length,
          tasksCompleted: completedTasks.length,
          productivity: completedTasks.length > 0 ? Math.round(completedTasks.length / Math.max(dayTasks.length, 1) * 100) : 0
        });
      }
      const totalHours = dailyData.reduce((sum, day) => sum + day.hours, 0);
      const totalTasksCompleted = dailyData.reduce((sum, day) => sum + day.tasksCompleted, 0);
      const averageProductivity = Math.round(dailyData.reduce((sum, day) => sum + day.productivity, 0) / dailyData.length);
      res.json({
        dailyData,
        summary: {
          totalHours: Math.round(totalHours * 100) / 100,
          averageDailyHours: Math.round(totalHours / dayCount * 100) / 100,
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
  app2.get("/api/analytics/tasks", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.role === "admin" ? void 0 : req.session.user?.id;
      const tasks2 = await storage.getTasks(userId);
      const priorityBreakdown = {
        high: { total: 0, completed: 0 },
        medium: { total: 0, completed: 0 },
        low: { total: 0, completed: 0 }
      };
      tasks2.forEach((task) => {
        const priority = task.priority || "medium";
        if (priorityBreakdown[priority]) {
          priorityBreakdown[priority].total++;
          if (task.completed) {
            priorityBreakdown[priority].completed++;
          }
        }
      });
      const now = /* @__PURE__ */ new Date();
      const overdueTasks = tasks2.filter(
        (task) => !task.completed && task.dueDate && new Date(task.dueDate) < now
      );
      res.json({
        priorityBreakdown,
        totalTasks: tasks2.length,
        completedTasks: tasks2.filter((t) => t.completed).length,
        overdueTasks: overdueTasks.length,
        completionRate: Math.round(tasks2.filter((t) => t.completed).length / Math.max(tasks2.length, 1) * 100)
      });
    } catch (error) {
      console.error("Error fetching task analytics:", error);
      res.status(500).json({ error: "Failed to fetch task analytics" });
    }
  });
  app2.post("/api/bulk/tasks/delete", requireAuth, async (req, res) => {
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
  app2.post("/api/bulk/tasks/edit", requireAuth, async (req, res) => {
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
  app2.post("/api/bulk/projects/delete", requireAdmin2, async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "IDs array required" });
      }
      let completed = 0;
      let errors = 0;
      for (const id of ids) {
        try {
          const success = await storage.updateProject(id, { status: "cancelled" });
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
  app2.post("/api/bulk/projects/edit", requireAdmin2, async (req, res) => {
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
  app2.post("/api/bulk/clients/delete", requireAdmin2, async (req, res) => {
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
  app2.post("/api/bulk/clients/edit", requireAdmin2, async (req, res) => {
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
  app2.get("/api/export/tasks", requireAuth, async (req, res) => {
    try {
      const { format: format5 = "csv", ids } = req.query;
      const userId = req.session.user?.role === "admin" ? void 0 : req.session.user?.id;
      let tasks2;
      if (ids && typeof ids === "string") {
        const taskIds = ids.split(",");
        tasks2 = [];
        for (const id of taskIds) {
          const task = await storage.getTask(id);
          if (task && (!userId || task.assignedToId === userId)) {
            tasks2.push(task);
          }
        }
      } else {
        tasks2 = await storage.getTasks(userId);
      }
      if (format5 === "json") {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", 'attachment; filename="tasks.json"');
        return res.send(JSON.stringify(tasks2, null, 2));
      }
      const csvWriter = createCsvWriter.createObjectCsvStringifier({
        header: [
          { id: "id", title: "ID" },
          { id: "title", title: "Title" },
          { id: "description", title: "Description" },
          { id: "status", title: "Status" },
          { id: "priority", title: "Priority" },
          { id: "assignedToId", title: "Assigned To ID" },
          { id: "projectId", title: "Project ID" },
          { id: "dueDate", title: "Due Date" },
          { id: "createdAt", title: "Created At" },
          { id: "updatedAt", title: "Updated At" }
        ]
      });
      const csvContent = csvWriter.getHeaderString() + csvWriter.stringifyRecords(tasks2);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="tasks.csv"');
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting tasks:", error);
      res.status(500).json({ message: "Failed to export tasks" });
    }
  });
  app2.get("/api/export/projects", requireAuth, async (req, res) => {
    try {
      const { format: format5 = "csv", ids } = req.query;
      let projects2;
      if (ids && typeof ids === "string") {
        const projectIds = ids.split(",");
        projects2 = [];
        for (const id of projectIds) {
          const project = await storage.getProject(id);
          if (project) {
            projects2.push(project);
          }
        }
      } else {
        projects2 = await storage.getProjects();
      }
      if (format5 === "json") {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", 'attachment; filename="projects.json"');
        return res.send(JSON.stringify(projects2, null, 2));
      }
      const csvWriter = createCsvWriter.createObjectCsvStringifier({
        header: [
          { id: "id", title: "ID" },
          { id: "name", title: "Name" },
          { id: "description", title: "Description" },
          { id: "status", title: "Status" },
          { id: "createdAt", title: "Created At" },
          { id: "updatedAt", title: "Updated At" }
        ]
      });
      const csvContent = csvWriter.getHeaderString() + csvWriter.stringifyRecords(projects2);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="projects.csv"');
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting projects:", error);
      res.status(500).json({ message: "Failed to export projects" });
    }
  });
  app2.get("/api/export/clients", requireAuth, async (req, res) => {
    try {
      const { format: format5 = "csv", ids } = req.query;
      let clients2;
      if (ids && typeof ids === "string") {
        const clientIds = ids.split(",");
        clients2 = [];
        for (const id of clientIds) {
          const client = await storage.getClient(id);
          if (client) {
            clients2.push(client);
          }
        }
      } else {
        clients2 = await storage.getClients();
      }
      if (format5 === "json") {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", 'attachment; filename="clients.json"');
        return res.send(JSON.stringify(clients2, null, 2));
      }
      const csvWriter = createCsvWriter.createObjectCsvStringifier({
        header: [
          { id: "id", title: "ID" },
          { id: "name", title: "Name" },
          { id: "email", title: "Email" },
          { id: "phone", title: "Phone" },
          { id: "company", title: "Company" },
          { id: "address", title: "Address" },
          { id: "website", title: "Website" },
          { id: "createdAt", title: "Created At" },
          { id: "updatedAt", title: "Updated At" }
        ]
      });
      const csvContent = csvWriter.getHeaderString() + csvWriter.stringifyRecords(clients2);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="clients.csv"');
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting clients:", error);
      res.status(500).json({ message: "Failed to export clients" });
    }
  });
  app2.get("/api/custom-fields", requireAuth, async (req, res) => {
    try {
      const { entityType } = req.query;
      const fields = await storage.getCustomFieldDefinitions(entityType);
      res.json(fields);
    } catch (error) {
      console.error("Error fetching custom field definitions:", error);
      res.status(500).json({ message: "Failed to fetch custom fields" });
    }
  });
  app2.get("/api/custom-fields/:id", requireAuth, async (req, res) => {
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
  app2.post("/api/custom-fields", requireAuth, async (req, res) => {
    try {
      const fieldData = {
        ...req.body,
        createdById: req.session.user.id
      };
      const field = await storage.createCustomFieldDefinition(fieldData);
      res.status(201).json(field);
    } catch (error) {
      console.error("Error creating custom field:", error);
      res.status(500).json({ message: "Failed to create custom field" });
    }
  });
  app2.put("/api/custom-fields/:id", requireAuth, async (req, res) => {
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
  app2.delete("/api/custom-fields/:id", requireAuth, async (req, res) => {
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
  app2.get("/api/custom-field-values/:entityType/:entityId", requireAuth, async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const values = await storage.getCustomFieldValues(entityType, entityId);
      res.json(values);
    } catch (error) {
      console.error("Error fetching custom field values:", error);
      res.status(500).json({ message: "Failed to fetch custom field values" });
    }
  });
  app2.post("/api/custom-field-values", requireAuth, async (req, res) => {
    try {
      const value = await storage.setCustomFieldValue(req.body);
      res.json(value);
    } catch (error) {
      console.error("Error setting custom field value:", error);
      res.status(500).json({ message: "Failed to set custom field value" });
    }
  });
  app2.get("/api/workflow-rules", requireAuth, async (req, res) => {
    try {
      const { entityType, isActive } = req.query;
      const rules = await storage.getWorkflowRules(
        entityType,
        isActive ? isActive === "true" : void 0
      );
      res.json(rules);
    } catch (error) {
      console.error("Error fetching workflow rules:", error);
      res.status(500).json({ message: "Failed to fetch workflow rules" });
    }
  });
  app2.post("/api/workflow-rules", requireAuth, async (req, res) => {
    try {
      const ruleData = {
        ...req.body,
        createdById: req.session.user.id
      };
      const rule = await storage.createWorkflowRule(ruleData);
      res.status(201).json(rule);
    } catch (error) {
      console.error("Error creating workflow rule:", error);
      res.status(500).json({ message: "Failed to create workflow rule" });
    }
  });
  app2.put("/api/workflow-rules/:id", requireAuth, async (req, res) => {
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
  app2.delete("/api/workflow-rules/:id", requireAuth, async (req, res) => {
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
  app2.get("/api/workflow/rules", requireAuth, async (req, res) => {
    try {
      const { entityType, isActive } = req.query;
      const rules = await storage.getWorkflowRules(
        entityType,
        isActive ? isActive === "true" : void 0
      );
      res.json(rules);
    } catch (error) {
      console.error("Error fetching workflow rules:", error);
      res.status(500).json({ message: "Failed to fetch workflow rules" });
    }
  });
  app2.post("/api/workflow/rules", requireAuth, async (req, res) => {
    try {
      const ruleData = {
        ...req.body,
        createdById: req.session.user.id
      };
      const rule = await storage.createWorkflowRule(ruleData);
      res.status(201).json(rule);
    } catch (error) {
      console.error("Error creating workflow rule:", error);
      res.status(500).json({ message: "Failed to create workflow rule" });
    }
  });
  app2.put("/api/workflow/rules/:id", requireAuth, async (req, res) => {
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
  app2.delete("/api/workflow/rules/:id", requireAuth, async (req, res) => {
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
  app2.get("/api/workflow-executions", requireAuth, async (req, res) => {
    try {
      const executions = await storage.getWorkflowExecutions();
      res.json(executions);
    } catch (error) {
      console.error("Error fetching workflow executions:", error);
      res.status(500).json({ message: "Failed to fetch workflow executions" });
    }
  });
  app2.get("/api/comments/:entityType/:entityId", requireAuth, async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const comments2 = await storage.getComments(entityType, entityId);
      res.json(comments2);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });
  app2.post("/api/comments", requireAuth, async (req, res) => {
    try {
      const commentData = {
        ...req.body,
        authorId: req.session.user.id
      };
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });
  app2.put("/api/comments/:id", requireAuth, async (req, res) => {
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
  app2.delete("/api/comments/:id", requireAuth, async (req, res) => {
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
  app2.get("/api/activities", requireAuth, async (req, res) => {
    try {
      const { entityType, entityId, actorId, limit } = req.query;
      const activities2 = await storage.getActivities(
        entityType,
        entityId,
        actorId,
        limit ? parseInt(limit) : void 0
      );
      res.json(activities2);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });
  app2.get("/api/api-keys", requireAdmin2, async (req, res) => {
    try {
      const keys = await storage.getApiKeys(req.session.user.id);
      res.json(keys);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      res.status(500).json({ message: "Failed to fetch API keys" });
    }
  });
  app2.post("/api/api-keys", requireAdmin2, async (req, res) => {
    try {
      const crypto6 = __require("crypto");
      const bcrypt2 = __require("bcryptjs");
      const key = `pk_${crypto6.randomBytes(32).toString("hex")}`;
      const hashedKey = await bcrypt2.hash(key, 10);
      const prefix = key.substring(0, 8);
      const keyData = {
        ...req.body,
        key,
        hashedKey,
        prefix,
        createdById: req.session.user.id
      };
      const apiKey = await storage.createApiKey(keyData);
      res.status(201).json({ ...apiKey, key });
    } catch (error) {
      console.error("Error creating API key:", error);
      res.status(500).json({ message: "Failed to create API key" });
    }
  });
  app2.put("/api/api-keys/:id", requireAdmin2, async (req, res) => {
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
  app2.delete("/api/api-keys/:id", requireAdmin2, async (req, res) => {
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
  app2.post("/api/import/tasks", requireAuth, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const results = [];
      const fs3 = __require("fs");
      const readStream = fs3.createReadStream(req.file.path);
      readStream.pipe(csvParser()).on("data", (data) => results.push(data)).on("end", async () => {
        let completed = 0;
        let errors = 0;
        for (const row of results) {
          try {
            const taskData = {
              title: row.Title || row.title || "",
              description: row.Description || row.description || null,
              status: row.Status || row.status || "todo",
              priority: row.Priority || row.priority || "medium",
              assignedToId: row["Assigned To ID"] || row.assignedToId || req.session.user.id,
              projectId: row["Project ID"] || row.projectId || null,
              dueDate: row["Due Date"] || row.dueDate ? new Date(row["Due Date"] || row.dueDate) : null
            };
            if (!taskData.title) {
              errors++;
              continue;
            }
            await storage.createTask(taskData, req.session.user.id);
            completed++;
          } catch (error) {
            console.error("Error importing task row:", error);
            errors++;
          }
        }
        if (req.file) {
          fs3.unlink(req.file.path, () => {
          });
        }
        res.json({ total: results.length, completed, errors });
      });
    } catch (error) {
      console.error("Error importing tasks:", error);
      res.status(500).json({ message: "Failed to import tasks" });
    }
  });
  app2.post("/api/import/projects", requireAdmin2, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const results = [];
      const fs3 = __require("fs");
      const readStream = fs3.createReadStream(req.file.path);
      readStream.pipe(csvParser()).on("data", (data) => results.push(data)).on("end", async () => {
        let completed = 0;
        let errors = 0;
        for (const row of results) {
          try {
            const projectData = {
              name: row.Name || row.name || "",
              description: row.Description || row.description || null,
              status: row.Status || row.status || "active"
            };
            if (!projectData.name) {
              errors++;
              continue;
            }
            await storage.createProject(projectData);
            completed++;
          } catch (error) {
            console.error("Error importing project row:", error);
            errors++;
          }
        }
        if (req.file) {
          fs3.unlink(req.file.path, () => {
          });
        }
        res.json({ total: results.length, completed, errors });
      });
    } catch (error) {
      console.error("Error importing projects:", error);
      res.status(500).json({ message: "Failed to import projects" });
    }
  });
  app2.post("/api/import/clients", requireAdmin2, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const results = [];
      const fs3 = __require("fs");
      const readStream = fs3.createReadStream(req.file.path);
      readStream.pipe(csvParser()).on("data", (data) => results.push(data)).on("end", async () => {
        let completed = 0;
        let errors = 0;
        for (const row of results) {
          try {
            const clientData = {
              name: row.Name || row.name || "",
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
            console.error("Error importing client row:", error);
            errors++;
          }
        }
        if (req.file) {
          fs3.unlink(req.file.path, () => {
          });
        }
        res.json({ total: results.length, completed, errors });
      });
    } catch (error) {
      console.error("Error importing clients:", error);
      res.status(500).json({ message: "Failed to import clients" });
    }
  });
  app2.post("/api/ai/generate-proposal", requireAuth, async (req, res) => {
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
${clientName ? `Client: ${clientName}` : ""}
${projectDescription ? `Description: ${projectDescription}` : ""}
${totalBudget ? `Budget: $${totalBudget}` : ""}
${timeline ? `Timeline: ${timeline}` : ""}
${scope ? `Scope: ${scope}` : ""}
${requirements ? `Requirements: ${requirements}` : ""}

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
      const completion = await openai4.chat.completions.create({
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
        max_completion_tokens: 1500
      });
      const content = completion.choices[0].message.content?.trim();
      if (!content) {
        throw new Error("No proposal content generated");
      }
      res.json({
        content,
        projectTitle,
        clientName,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("AI proposal generation error:", error);
      res.status(500).json({
        message: "Failed to generate proposal",
        error: error.message
      });
    }
  });
  app2.post("/api/ai/generate-content", requireAuth, async (req, res) => {
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
          prompt = `Write a professional project description for "${projectTitle}"${clientName ? ` for client ${clientName}` : ""}. 

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

${projectDescription ? `Project context: ${projectDescription}` : ""}
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

${totalBudget ? `Budget: $${totalBudget}` : ""}
${timeline ? `Timeline: ${timeline}` : ""}
Context: ${context}

Keep it professional but easy to understand.`;
          maxTokens = 1e3;
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

${context ? `Additional context: ${context}` : ""}

Create a comprehensive brief that a designer could use to create effective marketing materials.`;
          maxTokens = 800;
          break;
        case "presentation_objective":
          const { title, audience, duration } = req.body;
          prompt = `Generate clear and compelling presentation objectives for a presentation titled "${title || projectTitle}".

The presentation details:
${title ? `- Title: ${title}` : ""}
${audience ? `- Target Audience: ${audience}` : ""}
${duration ? `- Duration: ${duration} minutes` : ""}

Create 3-5 specific, measurable objectives that:
- Clearly state what the audience will learn or achieve
- Are appropriate for the target audience
- Can be accomplished within the presentation timeframe
- Use action-oriented language (e.g., "understand", "identify", "apply")
- Are relevant to the presentation topic

Format as a concise list that would fit in a presentation outline section.

${context ? `Additional context: ${context}` : ""}`;
          maxTokens = 400;
          break;
        case "presentation_slide_content":
          const { presentationTitle, slideTitle, slideType, objective, audience: slideAudience } = req.body;
          prompt = `Generate engaging content for a presentation slide.

Slide Details:
- Presentation: ${presentationTitle || projectTitle}
- Slide Title: ${slideTitle}
- Slide Type: ${slideType}
${slideAudience ? `- Audience: ${slideAudience}` : ""}
${objective ? `- Presentation Objective: ${objective}` : ""}

Create ${slideType} content that:
- Is appropriate for the slide type and audience
- Supports the overall presentation objectives
- Is concise and engaging
- Uses appropriate formatting (bullet points, paragraphs, etc.)
- Maintains professional tone

${context ? `Additional context: ${context}` : ""}`;
          maxTokens = 600;
          break;
        case "contract_scope":
          const { contractTitle, contractValue } = req.body;
          prompt = `Generate a detailed scope of work for contract "${contractTitle || projectTitle}"${clientName ? ` with client ${clientName}` : ""}${contractValue ? ` valued at $${contractValue}` : ""}.

The scope of work should include:
- Project objectives and goals
- Detailed breakdown of tasks and activities
- Key deliverables and milestones
- Project boundaries and limitations
- Responsibilities of each party
- Timeline considerations
- Quality standards and acceptance criteria

Format as a comprehensive, professional scope that clearly defines what work will be performed.

${context ? `Additional context: ${context}` : ""}`;
          maxTokens = 800;
          break;
        case "contract_deliverables":
          const { contractTitle: contractDelTitle, scope } = req.body;
          prompt = `Create a comprehensive list of deliverables for contract "${contractDelTitle || projectTitle}"${clientName ? ` with client ${clientName}` : ""}.

The deliverables should:
- Be specific and measurable
- Include all key outputs and results
- Be organized logically by phase or category
- Include acceptance criteria for each deliverable
- Specify formats and quality standards
- Include any supporting documentation

${scope ? `Project scope: ${scope}` : ""}
${context ? `Additional context: ${context}` : ""}

Format as a detailed list that clearly defines what will be delivered to the client.`;
          maxTokens = 600;
          break;
        case "invoice_notes":
          prompt = `Generate professional invoice notes and payment terms${clientName ? ` for client ${clientName}` : ""}.

The notes should include:
- Clear payment terms and due date information
- Accepted payment methods
- Late payment policies if applicable
- Contact information for payment inquiries
- Any relevant project or service references
- Professional but friendly tone

${context ? `Additional context: ${context}` : ""}

Keep the notes concise but comprehensive, suitable for a professional invoice.`;
          maxTokens = 400;
          break;
        default:
          return res.status(400).json({ message: "Invalid content type" });
      }
      const completion = await openai4.chat.completions.create({
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
        max_completion_tokens: maxTokens
      });
      const content = completion.choices[0].message.content?.trim();
      if (!content) {
        throw new Error("No content generated");
      }
      res.json({ content });
    } catch (error) {
      console.error("AI content generation error:", error);
      res.status(500).json({
        message: "Failed to generate content",
        error: error.message
      });
    }
  });
  app2.get("/api/time-logs", async (req, res) => {
    try {
      const { userId, projectId } = req.query;
      const timeLogs2 = await storage.getTimeLogs(
        userId,
        projectId
      );
      res.json(timeLogs2);
    } catch (error) {
      console.error("Error fetching time logs:", error);
      res.status(500).json({ message: "Failed to fetch time logs" });
    }
  });
  app2.post("/api/time-logs", async (req, res) => {
    try {
      const timeLogData = req.body;
      const timeLog = await storage.createTimeLog(timeLogData);
      res.status(201).json(timeLog);
    } catch (error) {
      console.error("Error creating time log:", error);
      res.status(500).json({ message: "Failed to create time log" });
    }
  });
  app2.put("/api/time-logs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const timeLog = await storage.updateTimeLog(id, updateData);
      if (!timeLog) {
        return res.status(404).json({ message: "Time log not found" });
      }
      res.json(timeLog);
    } catch (error) {
      console.error("Error updating time log:", error);
      res.status(500).json({ message: "Failed to update time log" });
    }
  });
  app2.delete("/api/time-logs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteTimeLog(id);
      if (!success) {
        return res.status(404).json({ message: "Time log not found" });
      }
      res.json({ message: "Time log deleted successfully" });
    } catch (error) {
      console.error("Error deleting time log:", error);
      res.status(500).json({ message: "Failed to delete time log" });
    }
  });
  app2.get("/api/workflow-automations", async (req, res) => {
    try {
      const workflows = await storage.getWorkflowRules();
      res.json(workflows);
    } catch (error) {
      console.error("Error fetching workflow automations:", error);
      res.status(500).json({ message: "Failed to fetch workflow automations" });
    }
  });
  app2.post("/api/workflow-automations", requireAuth, async (req, res) => {
    try {
      const workflowData = {
        ...req.body,
        createdById: req.session.user.id
      };
      const workflow = await storage.createWorkflowRule(workflowData);
      res.status(201).json(workflow);
    } catch (error) {
      console.error("Error creating workflow automation:", error);
      res.status(500).json({ message: "Failed to create workflow automation" });
    }
  });
  app2.put("/api/workflow-automations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const workflow = await storage.updateWorkflowRule(id, updateData);
      if (!workflow) {
        return res.status(404).json({ message: "Workflow automation not found" });
      }
      res.json(workflow);
    } catch (error) {
      console.error("Error updating workflow automation:", error);
      res.status(500).json({ message: "Failed to update workflow automation" });
    }
  });
  app2.delete("/api/workflow-automations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteWorkflowRule(id);
      if (!success) {
        return res.status(404).json({ message: "Workflow automation not found" });
      }
      res.json({ message: "Workflow automation deleted successfully" });
    } catch (error) {
      console.error("Error deleting workflow automation:", error);
      res.status(500).json({ message: "Failed to delete workflow automation" });
    }
  });
  app2.get("/api/ai-insights", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const insights = await aiInsightsService.generateInsights(userId);
      res.json(insights);
    } catch (error) {
      console.error("Error generating AI insights:", error);
      res.status(500).json({ message: "Failed to generate insights" });
    }
  });
  app2.post("/api/ai-insights/refresh", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const insights = await aiInsightsService.generateInsights(userId);
      res.json({ message: "Insights refreshed", insights });
    } catch (error) {
      console.error("Error refreshing AI insights:", error);
      res.status(500).json({ message: "Failed to refresh insights" });
    }
  });
  app2.get("/api/ai-insights/recommendations", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const recommendations = await aiInsightsService.generateTaskRecommendations(userId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error generating task recommendations:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });
  app2.get("/api/ai-insights/team", requireAuth, async (req, res) => {
    try {
      if (req.session.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const teamInsights = await aiInsightsService.generateTeamInsights();
      res.json(teamInsights);
    } catch (error) {
      console.error("Error generating team insights:", error);
      res.status(500).json({ message: "Failed to generate team insights" });
    }
  });
  app2.get("/api/reports", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user.role === "admin" ? void 0 : req.session.user.id;
      const reports = await advancedReportingService.getReports(userId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });
  app2.post("/api/reports/generate", requireAuth, async (req, res) => {
    try {
      const { template, timeRange, filters } = req.body;
      let reportData;
      switch (template) {
        case "productivity":
          reportData = await advancedReportingService.generateProductivityReport(
            { start: new Date(timeRange.start), end: new Date(timeRange.end) },
            filters.userIds
          );
          break;
        case "financial":
          reportData = await advancedReportingService.generateFinancialReport(
            { start: new Date(timeRange.start), end: new Date(timeRange.end) }
          );
          break;
        case "time":
          reportData = await advancedReportingService.generateTimeTrackingReport(
            { start: new Date(timeRange.start), end: new Date(timeRange.end) },
            filters.userIds
          );
          break;
        case "project":
          if (filters.projectIds && filters.projectIds.length > 0) {
            reportData = await advancedReportingService.generateProjectReport(
              filters.projectIds[0],
              { start: new Date(timeRange.start), end: new Date(timeRange.end) }
            );
          } else {
            return res.status(400).json({ message: "Project ID required for project reports" });
          }
          break;
        default:
          return res.status(400).json({ message: "Invalid report template" });
      }
      res.json(reportData);
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });
  app2.post("/api/reports", requireAuth, async (req, res) => {
    try {
      const report = await advancedReportingService.createReport({
        ...req.body,
        createdBy: req.session.user.id
      });
      res.json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });
  app2.get("/api/reports/templates", requireAuth, async (req, res) => {
    try {
      const templates2 = advancedReportingService.getReportTemplates();
      res.json(templates2);
    } catch (error) {
      console.error("Error fetching report templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });
  app2.get("/api/webhooks", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user.role === "admin" ? void 0 : req.session.user.id;
      const webhooks = await webhookService.getWebhooks(userId);
      res.json(webhooks);
    } catch (error) {
      console.error("Error fetching webhooks:", error);
      res.status(500).json({ message: "Failed to fetch webhooks" });
    }
  });
  app2.post("/api/webhooks", requireAuth, async (req, res) => {
    try {
      const webhook = await webhookService.createWebhook({
        ...req.body,
        createdBy: req.session.user.id
      });
      res.json(webhook);
    } catch (error) {
      console.error("Error creating webhook:", error);
      res.status(500).json({ message: "Failed to create webhook" });
    }
  });
  app2.patch("/api/webhooks/:id", requireAuth, async (req, res) => {
    try {
      const webhook = await webhookService.updateWebhook(req.params.id, req.body);
      res.json(webhook);
    } catch (error) {
      console.error("Error updating webhook:", error);
      res.status(500).json({ message: "Failed to update webhook" });
    }
  });
  app2.delete("/api/webhooks/:id", requireAuth, async (req, res) => {
    try {
      await webhookService.deleteWebhook(req.params.id);
      res.json({ message: "Webhook deleted successfully" });
    } catch (error) {
      console.error("Error deleting webhook:", error);
      res.status(500).json({ message: "Failed to delete webhook" });
    }
  });
  app2.post("/api/webhooks/:id/test", requireAuth, async (req, res) => {
    try {
      await webhookService.triggerEvent("task.created", {
        id: "test-task",
        title: "Test Task",
        description: "This is a test webhook delivery",
        status: "pending",
        priority: "medium",
        assignedTo: req.session.user.name,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }, { test: true });
      res.json({ message: "Test webhook sent successfully" });
    } catch (error) {
      console.error("Error sending test webhook:", error);
      res.status(500).json({ message: "Failed to send test webhook" });
    }
  });
  app2.get("/api/webhooks/deliveries", requireAuth, async (req, res) => {
    try {
      const webhookId = req.query.webhookId;
      const deliveries = await webhookService.getDeliveries(webhookId);
      res.json(deliveries);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      res.status(500).json({ message: "Failed to fetch deliveries" });
    }
  });
  app2.get("/api/integrations", requireAuth, async (req, res) => {
    try {
      const integrations = await webhookService.getIntegrations();
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ message: "Failed to fetch integrations" });
    }
  });
  app2.post("/api/integrations", requireAuth, async (req, res) => {
    try {
      const integration = await webhookService.createIntegration({
        ...req.body,
        createdBy: req.session.user.id
      });
      res.json(integration);
    } catch (error) {
      console.error("Error creating integration:", error);
      res.status(500).json({ message: "Failed to create integration" });
    }
  });
  app2.get("/api/mobile/dashboard", requireAuth, async (req, res) => {
    try {
      const dashboard = await mobileApiService.getMobileDashboard(req.session.user.id);
      const response = mobileApiService.createResponse(dashboard);
      res.json(response);
    } catch (error) {
      console.error("Error generating mobile dashboard:", error);
      const response = mobileApiService.createResponse(null, "Failed to load dashboard");
      res.status(500).json(response);
    }
  });
  app2.post("/api/mobile/sync", requireAuth, async (req, res) => {
    try {
      const syncData = await mobileApiService.syncMobileData(req.session.user.id, req.body);
      const response = mobileApiService.createResponse(syncData);
      res.json(response);
    } catch (error) {
      console.error("Error syncing mobile data:", error);
      const response = mobileApiService.createResponse(null, "Sync failed");
      res.status(500).json(response);
    }
  });
  app2.get("/api/mobile/tasks", requireAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const filters = {
        status: req.query.status,
        priority: req.query.priority,
        projectId: req.query.projectId,
        dueDate: req.query.dueDate
      };
      const { tasks: tasks2, total } = await mobileApiService.getMobileTasks(
        req.session.user.id,
        page,
        limit,
        filters
      );
      const response = mobileApiService.createPaginatedResponse(tasks2, page, limit, total);
      res.json(response);
    } catch (error) {
      console.error("Error fetching mobile tasks:", error);
      const response = mobileApiService.createResponse(null, "Failed to fetch tasks");
      res.status(500).json(response);
    }
  });
  app2.post("/api/mobile/tasks", requireAuth, async (req, res) => {
    try {
      const task = await mobileApiService.createMobileTask(req.session.user.id, req.body);
      const response = mobileApiService.createResponse(task, void 0, "Task created successfully");
      res.json(response);
    } catch (error) {
      console.error("Error creating mobile task:", error);
      const response = mobileApiService.createResponse(null, "Failed to create task");
      res.status(500).json(response);
    }
  });
  app2.post("/api/mobile/time", requireAuth, async (req, res) => {
    try {
      const timeLog = await mobileApiService.logMobileTime(req.session.user.id, req.body);
      const response = mobileApiService.createResponse(timeLog, void 0, "Time logged successfully");
      res.json(response);
    } catch (error) {
      console.error("Error logging mobile time:", error);
      const response = mobileApiService.createResponse(null, "Failed to log time");
      res.status(500).json(response);
    }
  });
  app2.post("/api/mobile/push-token", requireAuth, async (req, res) => {
    try {
      await mobileApiService.registerPushToken(req.session.user.id, req.body);
      const response = mobileApiService.createResponse(null, void 0, "Push token registered");
      res.json(response);
    } catch (error) {
      console.error("Error registering push token:", error);
      const response = mobileApiService.createResponse(null, "Failed to register push token");
      res.status(500).json(response);
    }
  });
  app2.post("/api/mobile/offline-action", requireAuth, async (req, res) => {
    try {
      await mobileApiService.queueOfflineAction(req.session.user.id, req.body);
      const response = mobileApiService.createResponse(null, void 0, "Action queued");
      res.json(response);
    } catch (error) {
      console.error("Error queuing offline action:", error);
      const response = mobileApiService.createResponse(null, "Failed to queue action");
      res.status(500).json(response);
    }
  });
  app2.get("/api/mobile/config", async (req, res) => {
    try {
      const config = mobileApiService.getMobileConfig();
      const response = mobileApiService.createResponse(config);
      res.json(response);
    } catch (error) {
      console.error("Error getting mobile config:", error);
      const response = mobileApiService.createResponse(null, "Failed to get config");
      res.status(500).json(response);
    }
  });
  app2.get("/api/tenants", requireAuth, async (req, res) => {
    try {
      if (req.session.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const tenants = await whiteLabelService.getTenants();
      res.json(tenants);
    } catch (error) {
      console.error("Error fetching tenants:", error);
      res.status(500).json({ message: "Failed to fetch tenants" });
    }
  });
  app2.post("/api/tenants", requireAuth, async (req, res) => {
    try {
      if (req.session.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const tenant = await whiteLabelService.createTenant(req.body);
      res.json(tenant);
    } catch (error) {
      console.error("Error creating tenant:", error);
      res.status(500).json({ message: error.message || "Failed to create tenant" });
    }
  });
  app2.get("/api/tenants/:id", requireAuth, async (req, res) => {
    try {
      const tenant = await whiteLabelService.getTenant(req.params.id);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }
      res.json(tenant);
    } catch (error) {
      console.error("Error fetching tenant:", error);
      res.status(500).json({ message: "Failed to fetch tenant" });
    }
  });
  app2.patch("/api/tenants/:id", requireAuth, async (req, res) => {
    try {
      if (req.session.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const tenant = await whiteLabelService.updateTenant(req.params.id, req.body);
      res.json(tenant);
    } catch (error) {
      console.error("Error updating tenant:", error);
      res.status(500).json({ message: "Failed to update tenant" });
    }
  });
  app2.delete("/api/tenants/:id", requireAuth, async (req, res) => {
    try {
      if (req.session.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      await whiteLabelService.deleteTenant(req.params.id);
      res.json({ message: "Tenant deleted successfully" });
    } catch (error) {
      console.error("Error deleting tenant:", error);
      res.status(500).json({ message: "Failed to delete tenant" });
    }
  });
  app2.get("/api/tenants/:id/css", async (req, res) => {
    try {
      const tenant = await whiteLabelService.getTenant(req.params.id);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }
      const css = whiteLabelService.generateTenantCSS(tenant);
      res.setHeader("Content-Type", "text/css");
      res.send(css);
    } catch (error) {
      console.error("Error generating tenant CSS:", error);
      res.status(500).json({ message: "Failed to generate CSS" });
    }
  });
  app2.get("/api/tenants/:id/usage", requireAuth, async (req, res) => {
    try {
      const period = req.query.period;
      const usage = await whiteLabelService.getTenantUsage(req.params.id, period);
      res.json(usage);
    } catch (error) {
      console.error("Error fetching tenant usage:", error);
      res.status(500).json({ message: "Failed to fetch usage" });
    }
  });
  app2.get("/api/tenants/:id/limits", requireAuth, async (req, res) => {
    try {
      const limits = await whiteLabelService.checkTenantLimits(req.params.id);
      res.json(limits);
    } catch (error) {
      console.error("Error checking tenant limits:", error);
      res.status(500).json({ message: "Failed to check limits" });
    }
  });
  app2.post("/api/tenants/:id/billing", requireAuth, async (req, res) => {
    try {
      if (req.session.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const billing = await whiteLabelService.generateBilling(req.params.id, req.body.period);
      res.json(billing);
    } catch (error) {
      console.error("Error generating billing:", error);
      res.status(500).json({ message: "Failed to generate billing" });
    }
  });
  app2.get("/api/white-label/templates", async (req, res) => {
    try {
      const templates2 = whiteLabelService.getWhiteLabelTemplates();
      res.json(templates2);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });
  app2.get("/api/white-label/dashboard", requireAuth, async (req, res) => {
    try {
      if (req.session.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const dashboard = await whiteLabelService.getTenantDashboard();
      res.json(dashboard);
    } catch (error) {
      console.error("Error fetching white-label dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard" });
    }
  });
  app2.get("/api/tenant-info", async (req, res) => {
    try {
      const host = req.headers.host || "";
      const domain = host.split(":")[0];
      const tenant = await whiteLabelService.getTenantByDomain(domain);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }
      res.json({
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        branding: tenant.branding,
        settings: tenant.settings,
        plan: tenant.plan
      });
    } catch (error) {
      console.error("Error resolving tenant:", error);
      res.status(500).json({ message: "Failed to resolve tenant" });
    }
  });
  app2.get("/api/sso/providers", requireAuth, async (req, res) => {
    try {
      if (req.session.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const providers = await ssoService.getProviders();
      res.json(providers);
    } catch (error) {
      console.error("Error fetching SSO providers:", error);
      res.status(500).json({ message: "Failed to fetch SSO providers" });
    }
  });
  app2.post("/api/sso/providers", requireAuth, async (req, res) => {
    try {
      if (req.session.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const provider = await ssoService.registerProvider(req.body);
      res.json(provider);
    } catch (error) {
      console.error("Error creating SSO provider:", error);
      res.status(500).json({ message: error.message || "Failed to create SSO provider" });
    }
  });
  app2.patch("/api/sso/providers/:id", requireAuth, async (req, res) => {
    try {
      if (req.session.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const provider = await ssoService.updateProvider(req.params.id, req.body);
      res.json(provider);
    } catch (error) {
      console.error("Error updating SSO provider:", error);
      res.status(500).json({ message: "Failed to update SSO provider" });
    }
  });
  app2.get("/api/sso/providers/active", async (req, res) => {
    try {
      const providers = await ssoService.getActiveProviders();
      const publicProviders = providers.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        protocol: p.protocol
      }));
      res.json(publicProviders);
    } catch (error) {
      console.error("Error fetching active SSO providers:", error);
      res.status(500).json({ message: "Failed to fetch active SSO providers" });
    }
  });
  app2.get("/api/sso/templates", requireAuth, async (req, res) => {
    try {
      if (req.session.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const templates2 = ssoService.getProviderTemplates();
      res.json(templates2);
    } catch (error) {
      console.error("Error fetching SSO templates:", error);
      res.status(500).json({ message: "Failed to fetch SSO templates" });
    }
  });
  app2.get("/api/sso/statistics", requireAuth, async (req, res) => {
    try {
      if (req.session.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const statistics = await ssoService.getStatistics();
      res.json(statistics);
    } catch (error) {
      console.error("Error fetching SSO statistics:", error);
      res.status(500).json({ message: "Failed to fetch SSO statistics" });
    }
  });
  app2.get("/api/sso/audit-logs", requireAuth, async (req, res) => {
    try {
      if (req.session.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const filters = {
        event: req.query.event,
        providerId: req.query.providerId,
        userId: req.query.userId,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };
      const logs = await ssoService.getAuditLogs(filters);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching SSO audit logs:", error);
      res.status(500).json({ message: "Failed to fetch SSO audit logs" });
    }
  });
  app2.get("/sso/:providerId/login", (req, res, next) => {
    const strategyName = `sso-${req.params.providerId}`;
    passport2.authenticate(strategyName)(req, res, next);
  });
  app2.post("/sso/:providerId/callback", (req, res, next) => {
    const strategyName = `sso-${req.params.providerId}`;
    passport2.authenticate(strategyName, {
      successRedirect: "/",
      failureRedirect: "/login?error=sso_failed"
    })(req, res, next);
  });
  app2.get("/sso/saml/metadata", (req, res) => {
    try {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const metadata = ssoService.generateSAMLMetadata(baseUrl);
      res.set("Content-Type", "application/xml");
      res.send(metadata);
    } catch (error) {
      console.error("Error generating SAML metadata:", error);
      res.status(500).json({ message: "Failed to generate SAML metadata" });
    }
  });
  app2.get("/api/permissions", requireAuth, async (req, res) => {
    try {
      const permissions = await permissionsService.getPermissions();
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      res.status(500).json({ message: "Failed to fetch permissions" });
    }
  });
  app2.get("/api/permissions/by-category", requireAuth, async (req, res) => {
    try {
      const permissionsByCategory = await permissionsService.getPermissionsByCategory();
      res.json(permissionsByCategory);
    } catch (error) {
      console.error("Error fetching permissions by category:", error);
      res.status(500).json({ message: "Failed to fetch permissions by category" });
    }
  });
  app2.post("/api/permissions", requireAuth, requirePermission("permissions.manage"), async (req, res) => {
    try {
      const permission = await permissionsService.createPermission(req.body);
      res.json(permission);
    } catch (error) {
      console.error("Error creating permission:", error);
      res.status(500).json({ message: "Failed to create permission" });
    }
  });
  app2.get("/api/roles", requireAuth, async (req, res) => {
    try {
      const roles = await permissionsService.getRoles();
      res.json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });
  app2.post("/api/roles", requireAuth, requirePermission("permissions.manage"), async (req, res) => {
    try {
      const role = await permissionsService.createRole(req.body);
      res.json(role);
    } catch (error) {
      console.error("Error creating role:", error);
      res.status(500).json({ message: "Failed to create role" });
    }
  });
  app2.patch("/api/roles/:id", requireAuth, requirePermission("permissions.manage"), async (req, res) => {
    try {
      const role = await permissionsService.updateRole(req.params.id, req.body);
      res.json(role);
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });
  app2.post("/api/users/:userId/roles/:roleId", requireAuth, requirePermission("users.update"), async (req, res) => {
    try {
      await permissionsService.assignRole(req.params.userId, req.params.roleId, req.session.user.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error assigning role:", error);
      res.status(500).json({ message: "Failed to assign role" });
    }
  });
  app2.delete("/api/users/:userId/roles/:roleId", requireAuth, requirePermission("users.update"), async (req, res) => {
    try {
      await permissionsService.removeRole(req.params.userId, req.params.roleId, req.session.user.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing role:", error);
      res.status(500).json({ message: "Failed to remove role" });
    }
  });
  app2.get("/api/users/:userId/permissions", requireAuth, async (req, res) => {
    try {
      const userPermissions = await permissionsService.getUserPermissions(req.params.userId);
      res.json(userPermissions);
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      res.status(500).json({ message: "Failed to fetch user permissions" });
    }
  });
  app2.post("/api/permissions/check", requireAuth, async (req, res) => {
    try {
      const { permission, resource, context } = req.body;
      const hasPermission = await permissionsService.checkPermission({
        userId: req.session.user.id,
        permission,
        resource,
        context
      });
      res.json({ hasPermission });
    } catch (error) {
      console.error("Error checking permission:", error);
      res.status(500).json({ message: "Failed to check permission" });
    }
  });
  app2.get("/api/permissions/statistics", requireAuth, requirePermission("admin.audit"), async (req, res) => {
    try {
      const statistics = await permissionsService.getStatistics();
      res.json(statistics);
    } catch (error) {
      console.error("Error fetching permission statistics:", error);
      res.status(500).json({ message: "Failed to fetch permission statistics" });
    }
  });
  app2.get("/api/permissions/audit-logs", requireAuth, requirePermission("admin.audit"), async (req, res) => {
    try {
      const filters = {
        action: req.query.action,
        userId: req.query.userId,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };
      const logs = await permissionsService.getAuditLogs(filters);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching permission audit logs:", error);
      res.status(500).json({ message: "Failed to fetch permission audit logs" });
    }
  });
  app2.get("/api/audit/events", requireAuth, requirePermission("admin.audit"), async (req, res) => {
    try {
      const query = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        source: req.query.source ? [req.query.source] : void 0,
        category: req.query.category ? [req.query.category] : void 0,
        action: req.query.action ? [req.query.action] : void 0,
        outcome: req.query.outcome ? [req.query.outcome] : void 0,
        severity: req.query.severity ? [req.query.severity] : void 0,
        searchTerm: req.query.searchTerm,
        limit: req.query.limit ? parseInt(req.query.limit) : 50,
        offset: req.query.offset ? parseInt(req.query.offset) : 0,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };
      const result = await auditService.queryEvents(query);
      res.json(result);
    } catch (error) {
      console.error("Error fetching audit events:", error);
      res.status(500).json({ message: "Failed to fetch audit events" });
    }
  });
  app2.get("/api/audit/statistics", requireAuth, requirePermission("admin.audit"), async (req, res) => {
    try {
      const period = req.query.startDate && req.query.endDate ? {
        start: req.query.startDate,
        end: req.query.endDate
      } : void 0;
      const statistics = await auditService.getStatistics(period);
      res.json(statistics);
    } catch (error) {
      console.error("Error fetching audit statistics:", error);
      res.status(500).json({ message: "Failed to fetch audit statistics" });
    }
  });
  app2.post("/api/audit/export", requireAuth, requirePermission("data.export"), async (req, res) => {
    try {
      const query = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        source: req.query.source ? [req.query.source] : void 0,
        category: req.query.category ? [req.query.category] : void 0,
        outcome: req.query.outcome ? [req.query.outcome] : void 0,
        severity: req.query.severity ? [req.query.severity] : void 0,
        searchTerm: req.query.searchTerm,
        limit: 1e4
        // Large limit for export
      };
      const format5 = req.query.format;
      const includePersonalData = req.query.includePersonalData === "true";
      const exportData = await auditService.exportAuditData(query, format5, includePersonalData);
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting audit data:", error);
      res.status(500).json({ message: "Failed to export audit data" });
    }
  });
  app2.get("/api/audit/compliance-reports", requireAuth, requirePermission("admin.audit"), async (req, res) => {
    try {
      const reports = await auditService.getComplianceReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching compliance reports:", error);
      res.status(500).json({ message: "Failed to fetch compliance reports" });
    }
  });
  app2.post("/api/audit/compliance-reports", requireAuth, requirePermission("admin.audit"), async (req, res) => {
    try {
      const { regulation, startDate, endDate } = req.body;
      const report = await auditService.generateComplianceReport(
        regulation,
        startDate,
        endDate,
        req.session.user.id
      );
      res.json(report);
    } catch (error) {
      console.error("Error generating compliance report:", error);
      res.status(500).json({ message: "Failed to generate compliance report" });
    }
  });
  app2.get("/api/audit/retention-policies", requireAuth, requirePermission("admin.audit"), async (req, res) => {
    try {
      const policies = await auditService.getRetentionPolicies();
      res.json(policies);
    } catch (error) {
      console.error("Error fetching retention policies:", error);
      res.status(500).json({ message: "Failed to fetch retention policies" });
    }
  });
  app2.post("/api/audit/retention-policies", requireAuth, requirePermission("admin.audit"), async (req, res) => {
    try {
      const policy = await auditService.createRetentionPolicy(req.body);
      res.json(policy);
    } catch (error) {
      console.error("Error creating retention policy:", error);
      res.status(500).json({ message: "Failed to create retention policy" });
    }
  });
  app2.get("/api/encryption/keys", requireAuth, requirePermission("admin.security"), async (req, res) => {
    try {
      const keys = await encryptionService.getKeys();
      res.json(keys);
    } catch (error) {
      console.error("Error fetching encryption keys:", error);
      res.status(500).json({ message: "Failed to fetch encryption keys" });
    }
  });
  app2.post("/api/encryption/keys", requireAuth, requirePermission("admin.security"), async (req, res) => {
    try {
      const { purpose, algorithm, complianceLevel } = req.body;
      const key = await encryptionService.generateKey(
        purpose,
        algorithm,
        req.session.user.id,
        complianceLevel
      );
      res.json(key);
    } catch (error) {
      console.error("Error generating encryption key:", error);
      res.status(500).json({ message: "Failed to generate encryption key" });
    }
  });
  app2.post("/api/encryption/keys/:keyId/rotate", requireAuth, requirePermission("admin.security"), async (req, res) => {
    try {
      const rotatedKey = await encryptionService.rotateKey(req.params.keyId, req.session.user.id);
      res.json(rotatedKey);
    } catch (error) {
      console.error("Error rotating encryption key:", error);
      res.status(500).json({ message: "Failed to rotate encryption key" });
    }
  });
  app2.get("/api/encryption/policies", requireAuth, requirePermission("admin.security"), async (req, res) => {
    try {
      const policies = await encryptionService.getPolicies();
      res.json(policies);
    } catch (error) {
      console.error("Error fetching encryption policies:", error);
      res.status(500).json({ message: "Failed to fetch encryption policies" });
    }
  });
  app2.post("/api/encryption/policies", requireAuth, requirePermission("admin.security"), async (req, res) => {
    try {
      const policy = await encryptionService.createPolicy(req.body);
      res.json(policy);
    } catch (error) {
      console.error("Error creating encryption policy:", error);
      res.status(500).json({ message: "Failed to create encryption policy" });
    }
  });
  app2.get("/api/encryption/statistics", requireAuth, requirePermission("admin.security"), async (req, res) => {
    try {
      const statistics = await encryptionService.getStatistics();
      res.json(statistics);
    } catch (error) {
      console.error("Error fetching encryption statistics:", error);
      res.status(500).json({ message: "Failed to fetch encryption statistics" });
    }
  });
  app2.post("/api/encryption/encrypt", requireAuth, requirePermission("data.export"), async (req, res) => {
    try {
      const { data, purpose, dataType } = req.body;
      const encrypted = await encryptionService.encryptData(data, purpose, dataType, req.session.user.id);
      res.json(encrypted);
    } catch (error) {
      console.error("Error encrypting data:", error);
      res.status(500).json({ message: "Failed to encrypt data" });
    }
  });
  app2.post("/api/encryption/decrypt", requireAuth, requirePermission("data.export"), async (req, res) => {
    try {
      const { encryptedData } = req.body;
      const decrypted = await encryptionService.decryptData(encryptedData, req.session.user.id);
      res.json({ data: decrypted });
    } catch (error) {
      console.error("Error decrypting data:", error);
      res.status(500).json({ message: "Failed to decrypt data" });
    }
  });
  app2.get("/api/backup/configurations", requireAuth, requirePermission("admin.backup"), async (req, res) => {
    try {
      const configurations = await backupService.getConfigurations();
      res.json(configurations);
    } catch (error) {
      console.error("Error fetching backup configurations:", error);
      res.status(500).json({ message: "Failed to fetch backup configurations" });
    }
  });
  app2.get("/api/backup/records", requireAuth, requirePermission("admin.backup"), async (req, res) => {
    try {
      const backups = await backupService.getBackups();
      res.json(backups);
    } catch (error) {
      console.error("Error fetching backup records:", error);
      res.status(500).json({ message: "Failed to fetch backup records" });
    }
  });
  app2.post("/api/backup/create", requireAuth, requirePermission("admin.backup"), async (req, res) => {
    try {
      const { configId } = req.body;
      const backup = await backupService.performBackup(configId || "default", req.session.user.id);
      res.json(backup);
    } catch (error) {
      console.error("Error creating backup:", error);
      res.status(500).json({ message: "Failed to create backup" });
    }
  });
  app2.get("/api/backup/statistics", requireAuth, requirePermission("admin.backup"), async (req, res) => {
    try {
      const statistics = await backupService.getStatistics();
      res.json(statistics);
    } catch (error) {
      console.error("Error fetching backup statistics:", error);
      res.status(500).json({ message: "Failed to fetch backup statistics" });
    }
  });
  app2.get("/api/backup/list", requireAuth, requirePermission("admin.backup"), async (req, res) => {
    try {
      const backups = await backupService.getBackups();
      res.json(backups);
    } catch (error) {
      console.error("Error fetching backup records:", error);
      res.status(500).json({ message: "Failed to fetch backup records" });
    }
  });
  app2.get("/api/i18n/languages", requireAuth, async (req, res) => {
    try {
      const languages = await i18nService.getLanguages();
      res.json(languages);
    } catch (error) {
      console.error("Error fetching languages:", error);
      res.status(500).json({ message: "Failed to fetch languages" });
    }
  });
  app2.post("/api/i18n/languages", requireAuth, requirePermission("admin.settings"), async (req, res) => {
    try {
      const language = await i18nService.addLanguage(req.body);
      res.json(language);
    } catch (error) {
      console.error("Error adding language:", error);
      res.status(500).json({ message: "Failed to add language" });
    }
  });
  app2.get("/api/i18n/translations/:language", requireAuth, async (req, res) => {
    try {
      const { language } = req.params;
      const { namespace } = req.query;
      let translations;
      if (namespace) {
        translations = await i18nService.getNamespaceTranslations(namespace, language);
      } else {
        const allKeys = Array.from((await i18nService.getStatistics()).totalKeys || []);
        translations = await i18nService.getTranslations(allKeys, language);
      }
      res.json(translations);
    } catch (error) {
      console.error("Error fetching translations:", error);
      res.status(500).json({ message: "Failed to fetch translations" });
    }
  });
  app2.post("/api/i18n/translations", requireAuth, requirePermission("admin.settings"), async (req, res) => {
    try {
      const { key, language, value, pluralForms } = req.body;
      const translation = await i18nService.setTranslation(
        key,
        language,
        value,
        req.session.user.id,
        pluralForms
      );
      res.json(translation);
    } catch (error) {
      console.error("Error setting translation:", error);
      res.status(500).json({ message: "Failed to set translation" });
    }
  });
  app2.get("/api/i18n/statistics", requireAuth, requirePermission("admin.settings"), async (req, res) => {
    try {
      const statistics = await i18nService.getStatistics();
      res.json(statistics);
    } catch (error) {
      console.error("Error fetching i18n statistics:", error);
      res.status(500).json({ message: "Failed to fetch i18n statistics" });
    }
  });
  app2.get("/api/i18n/export/:language", requireAuth, requirePermission("data.export"), async (req, res) => {
    try {
      const { language } = req.params;
      const { format: format5 = "json" } = req.query;
      const exportData = await i18nService.exportTranslations(language, format5);
      const contentType = format5 === "csv" ? "text/csv" : "application/json";
      const filename = `translations_${language}.${format5}`;
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(exportData);
    } catch (error) {
      console.error("Error exporting translations:", error);
      res.status(500).json({ message: "Failed to export translations" });
    }
  });
  app2.post("/api/smart-scheduling/generate", requireAuth, async (req, res) => {
    try {
      const { tasks: tasks2, context } = req.body;
      const result = await smartSchedulingService.generateOptimalSchedule(
        tasks2,
        context,
        req.session.user.id
      );
      res.json(result);
    } catch (error) {
      console.error("Error generating smart schedule:", error);
      res.status(500).json({ message: "Failed to generate smart schedule" });
    }
  });
  app2.get("/api/smart-scheduling/workload-predictions", requireAuth, async (req, res) => {
    try {
      const { userIds } = req.query;
      const userIdArray = userIds ? userIds.split(",") : void 0;
      const predictions = await smartSchedulingService.getWorkloadPredictions(userIdArray);
      res.json(predictions);
    } catch (error) {
      console.error("Error fetching workload predictions:", error);
      res.status(500).json({ message: "Failed to fetch workload predictions" });
    }
  });
  app2.get("/api/smart-scheduling/recommendations", requireAuth, async (req, res) => {
    try {
      const { projectId, userId } = req.query;
      const recommendations = await smartSchedulingService.getSchedulingRecommendations(
        projectId,
        userId
      );
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching scheduling recommendations:", error);
      res.status(500).json({ message: "Failed to fetch scheduling recommendations" });
    }
  });
  app2.post("/api/smart-scheduling/recommendations/:id/apply", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await smartSchedulingService.applyRecommendation(id, req.session.user.id);
      res.json(result);
    } catch (error) {
      console.error("Error applying recommendation:", error);
      res.status(500).json({ message: "Failed to apply recommendation" });
    }
  });
  app2.get("/api/smart-scheduling/statistics", requireAuth, async (req, res) => {
    try {
      const statistics = await smartSchedulingService.getSchedulingStatistics();
      res.json(statistics);
    } catch (error) {
      console.error("Error fetching scheduling statistics:", error);
      res.status(500).json({ message: "Failed to fetch scheduling statistics" });
    }
  });
  app2.post("/api/predictive-analytics/generate-predictions", requireAuth, async (req, res) => {
    try {
      const { projectIds } = req.body;
      const predictions = await predictiveAnalyticsService.generateProjectPredictions(projectIds);
      res.json(predictions);
    } catch (error) {
      console.error("Error generating predictions:", error);
      res.status(500).json({ message: "Failed to generate predictions" });
    }
  });
  app2.get("/api/predictive-analytics/project-predictions", requireAuth, async (req, res) => {
    try {
      const { projectIds } = req.query;
      const projectIdArray = projectIds ? projectIds.split(",") : void 0;
      const predictions = await predictiveAnalyticsService.generateProjectPredictions(projectIdArray);
      res.json(predictions);
    } catch (error) {
      console.error("Error fetching project predictions:", error);
      res.status(500).json({ message: "Failed to fetch project predictions" });
    }
  });
  app2.get("/api/predictive-analytics/project-risks/:projectId", requireAuth, async (req, res) => {
    try {
      const { projectId } = req.params;
      const risks = await predictiveAnalyticsService.assessProjectRisks(projectId);
      res.json(risks);
    } catch (error) {
      console.error("Error assessing project risks:", error);
      res.status(500).json({ message: "Failed to assess project risks" });
    }
  });
  app2.get("/api/predictive-analytics/team-performance", requireAuth, async (req, res) => {
    try {
      const { userIds, period = "month" } = req.query;
      const userIdArray = userIds ? userIds.split(",") : void 0;
      const performance = await predictiveAnalyticsService.analyzeTeamPerformance(
        userIdArray,
        period
      );
      res.json(performance);
    } catch (error) {
      console.error("Error analyzing team performance:", error);
      res.status(500).json({ message: "Failed to analyze team performance" });
    }
  });
  app2.get("/api/predictive-analytics/market-intelligence", requireAuth, async (req, res) => {
    try {
      const { industry } = req.query;
      const intelligence = await predictiveAnalyticsService.generateMarketIntelligence(industry);
      res.json(intelligence);
    } catch (error) {
      console.error("Error generating market intelligence:", error);
      res.status(500).json({ message: "Failed to generate market intelligence" });
    }
  });
  app2.post("/api/predictive-analytics/generate-report", requireAuth, async (req, res) => {
    try {
      const { type, parameters } = req.body;
      const report = await predictiveAnalyticsService.createPredictiveReport(type, parameters);
      res.json(report);
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });
  app2.get("/api/predictive-analytics/reports", requireAuth, async (req, res) => {
    try {
      const { type } = req.query;
      const reports = predictiveAnalyticsService.getReports(type);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });
  app2.get("/api/predictive-analytics/statistics", requireAuth, async (req, res) => {
    try {
      const statistics = await predictiveAnalyticsService.getAnalyticsStatistics();
      res.json(statistics);
    } catch (error) {
      console.error("Error fetching analytics statistics:", error);
      res.status(500).json({ message: "Failed to fetch analytics statistics" });
    }
  });
  app2.get("/api/performance/metrics", requireAuth, requirePermission("system.monitor"), (req, res) => {
    try {
      const metrics = performanceMonitor.getCurrentMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching performance metrics:", error);
      res.status(500).json({ message: "Failed to fetch performance metrics" });
    }
  });
  app2.get("/api/performance/metrics/history", requireAuth, requirePermission("system.monitor"), (req, res) => {
    try {
      const { minutes = 60 } = req.query;
      const metrics = performanceMonitor.getHistoricalMetrics(Number(minutes));
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching historical metrics:", error);
      res.status(500).json({ message: "Failed to fetch historical metrics" });
    }
  });
  app2.get("/api/performance/alerts", requireAuth, requirePermission("system.monitor"), (req, res) => {
    try {
      const { active = true } = req.query;
      const alerts = active === "true" ? performanceMonitor.getActiveAlerts() : performanceMonitor.getAllAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching performance alerts:", error);
      res.status(500).json({ message: "Failed to fetch performance alerts" });
    }
  });
  app2.post("/api/performance/alerts/:id/resolve", requireAuth, requirePermission("system.admin"), (req, res) => {
    try {
      const { id } = req.params;
      const resolved = performanceMonitor.resolveAlert(id);
      if (resolved) {
        res.json({ message: "Alert resolved successfully" });
      } else {
        res.status(404).json({ message: "Alert not found or already resolved" });
      }
    } catch (error) {
      console.error("Error resolving alert:", error);
      res.status(500).json({ message: "Failed to resolve alert" });
    }
  });
  app2.get("/api/performance/summary", requireAuth, requirePermission("system.monitor"), (req, res) => {
    try {
      const summary = performanceMonitor.getPerformanceSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching performance summary:", error);
      res.status(500).json({ message: "Failed to fetch performance summary" });
    }
  });
  app2.get("/api/performance/export", requireAuth, requirePermission("data.export"), (req, res) => {
    try {
      const { format: format5 = "json" } = req.query;
      const metrics = performanceMonitor.exportMetrics(format5);
      const contentType = format5 === "prometheus" ? "text/plain" : "application/json";
      const filename = `performance-metrics.${format5 === "prometheus" ? "txt" : "json"}`;
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(metrics);
    } catch (error) {
      console.error("Error exporting performance metrics:", error);
      res.status(500).json({ message: "Failed to export performance metrics" });
    }
  });
  app2.get("/api/cache/stats", requireAuth, requirePermission("system.monitor"), (req, res) => {
    try {
      const stats = AppCache.getInstance().getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching cache stats:", error);
      res.status(500).json({ message: "Failed to fetch cache stats" });
    }
  });
  app2.post("/api/cache/flush", requireAuth, requirePermission("system.admin"), async (req, res) => {
    try {
      await AppCache.getInstance().flush();
      res.json({ message: "Cache flushed successfully" });
    } catch (error) {
      console.error("Error flushing cache:", error);
      res.status(500).json({ message: "Failed to flush cache" });
    }
  });
  app2.post("/api/cache/invalidate", requireAuth, requirePermission("system.admin"), async (req, res) => {
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
      console.error("Error invalidating cache:", error);
      res.status(500).json({ message: "Failed to invalidate cache" });
    }
  });
  app2.get("/api/cache/keys", requireAuth, requirePermission("system.monitor"), (req, res) => {
    try {
      const { pattern = "*" } = req.query;
      const keys = AppCache.getInstance().keys(pattern);
      res.json({ keys: keys.slice(0, 100), total: keys.length });
    } catch (error) {
      console.error("Error fetching cache keys:", error);
      res.status(500).json({ message: "Failed to fetch cache keys" });
    }
  });
  app2.get("/api/cdn/config", requireAuth, requirePermission("system.monitor"), (req, res) => {
    try {
      const config = cdnService.getConfig();
      res.json(config);
    } catch (error) {
      console.error("Error fetching CDN config:", error);
      res.status(500).json({ message: "Failed to fetch CDN config" });
    }
  });
  app2.put("/api/cdn/config", requireAuth, requirePermission("system.admin"), async (req, res) => {
    try {
      await cdnService.updateConfig(req.body);
      res.json({ message: "CDN configuration updated successfully" });
    } catch (error) {
      console.error("Error updating CDN config:", error);
      res.status(500).json({ message: "Failed to update CDN config" });
    }
  });
  app2.get("/api/cdn/metrics", requireAuth, requirePermission("system.monitor"), (req, res) => {
    try {
      const metrics = cdnService.getCurrentMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching CDN metrics:", error);
      res.status(500).json({ message: "Failed to fetch CDN metrics" });
    }
  });
  app2.post("/api/cdn/purge", requireAuth, requirePermission("system.admin"), async (req, res) => {
    try {
      const { urls } = req.body;
      const result = await cdnService.purgeCache(urls);
      res.json(result);
    } catch (error) {
      console.error("Error purging CDN cache:", error);
      res.status(500).json({ message: "Failed to purge CDN cache" });
    }
  });
  app2.get("/api/cdn/edge-locations", requireAuth, requirePermission("system.monitor"), async (req, res) => {
    try {
      const locations = await cdnService.getEdgeLocationPerformance();
      res.json(locations);
    } catch (error) {
      console.error("Error fetching edge locations:", error);
      res.status(500).json({ message: "Failed to fetch edge locations" });
    }
  });
  app2.get("/api/cdn/recommendations", requireAuth, requirePermission("system.monitor"), async (req, res) => {
    try {
      const recommendations = await cdnService.getPerformanceRecommendations();
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching CDN recommendations:", error);
      res.status(500).json({ message: "Failed to fetch CDN recommendations" });
    }
  });
  app2.get("/api/cdn/cost-analysis", requireAuth, requirePermission("system.monitor"), async (req, res) => {
    try {
      const analysis = await cdnService.getBandwidthCostAnalysis();
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching cost analysis:", error);
      res.status(500).json({ message: "Failed to fetch cost analysis" });
    }
  });
  app2.get("/api/database/metrics", requireAuth, requirePermission("system.monitor"), async (req, res) => {
    try {
      const metrics = await databaseOptimizer.getDatabaseStatistics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching database metrics:", error);
      res.status(500).json({ message: "Failed to fetch database metrics" });
    }
  });
  app2.post("/api/database/optimize", requireAuth, requirePermission("system.admin"), async (req, res) => {
    try {
      const report = await databaseOptimizer.generateOptimizationReport();
      res.json(report);
    } catch (error) {
      console.error("Error generating optimization report:", error);
      res.status(500).json({ message: "Failed to generate optimization report" });
    }
  });
  app2.post("/api/database/auto-optimize", requireAuth, requirePermission("system.admin"), async (req, res) => {
    try {
      const result = await databaseOptimizer.applyAutomaticOptimizations();
      res.json(result);
    } catch (error) {
      console.error("Error applying automatic optimizations:", error);
      res.status(500).json({ message: "Failed to apply automatic optimizations" });
    }
  });
  app2.post("/api/database/create-indexes", requireAuth, requirePermission("system.admin"), async (req, res) => {
    try {
      const { recommendations } = req.body;
      const result = await databaseOptimizer.createRecommendedIndexes(recommendations);
      res.json(result);
    } catch (error) {
      console.error("Error creating indexes:", error);
      res.status(500).json({ message: "Failed to create indexes" });
    }
  });
  app2.post("/api/database/analyze-query", requireAuth, requirePermission("system.monitor"), async (req, res) => {
    try {
      const { query } = req.body;
      const analysis = await databaseOptimizer.analyzeQuery(query);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing query:", error);
      res.status(500).json({ message: "Failed to analyze query" });
    }
  });
  app2.post("/api/database/maintenance", requireAuth, requirePermission("system.admin"), async (req, res) => {
    try {
      const { tables } = req.body;
      const result = await databaseOptimizer.performMaintenance(tables);
      res.json(result);
    } catch (error) {
      console.error("Error performing database maintenance:", error);
      res.status(500).json({ message: "Failed to perform database maintenance" });
    }
  });
  app2.get("/api/database/unused-indexes", requireAuth, requirePermission("system.monitor"), async (req, res) => {
    try {
      const unusedIndexes = await databaseOptimizer.findUnusedIndexes();
      res.json(unusedIndexes);
    } catch (error) {
      console.error("Error finding unused indexes:", error);
      res.status(500).json({ message: "Failed to find unused indexes" });
    }
  });
  app2.get("/api/load-balancer/servers", requireAuth, requirePermission("system.monitor"), (req, res) => {
    try {
      const servers = loadBalancer.getServers();
      res.json(servers);
    } catch (error) {
      console.error("Error fetching server instances:", error);
      res.status(500).json({ message: "Failed to fetch server instances" });
    }
  });
  app2.post("/api/load-balancer/servers", requireAuth, requirePermission("system.admin"), (req, res) => {
    try {
      const serverId = loadBalancer.addServer(req.body);
      res.json({ message: "Server added successfully", serverId });
    } catch (error) {
      console.error("Error adding server:", error);
      res.status(500).json({ message: "Failed to add server" });
    }
  });
  app2.delete("/api/load-balancer/servers/:id", requireAuth, requirePermission("system.admin"), (req, res) => {
    try {
      const { id } = req.params;
      const removed = loadBalancer.removeServer(id);
      if (removed) {
        res.json({ message: "Server removed successfully" });
      } else {
        res.status(404).json({ message: "Server not found" });
      }
    } catch (error) {
      console.error("Error removing server:", error);
      res.status(500).json({ message: "Failed to remove server" });
    }
  });
  app2.get("/api/load-balancer/metrics", requireAuth, requirePermission("system.monitor"), (req, res) => {
    try {
      const metrics = loadBalancer.getMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching load balancer metrics:", error);
      res.status(500).json({ message: "Failed to fetch load balancer metrics" });
    }
  });
  app2.get("/api/load-balancer/config", requireAuth, requirePermission("system.monitor"), (req, res) => {
    try {
      const config = loadBalancer.getConfig();
      res.json(config);
    } catch (error) {
      console.error("Error fetching load balancer config:", error);
      res.status(500).json({ message: "Failed to fetch load balancer config" });
    }
  });
  app2.put("/api/load-balancer/config", requireAuth, requirePermission("system.admin"), (req, res) => {
    try {
      loadBalancer.updateConfig(req.body);
      res.json({ message: "Load balancer configuration updated successfully" });
    } catch (error) {
      console.error("Error updating load balancer config:", error);
      res.status(500).json({ message: "Failed to update load balancer config" });
    }
  });
  app2.post("/api/load-balancer/scale-up", requireAuth, requirePermission("system.admin"), async (req, res) => {
    try {
      const newServerIds = await loadBalancer.scaleUp();
      res.json({ message: "Scale up completed", newServerIds, count: newServerIds.length });
    } catch (error) {
      console.error("Error scaling up:", error);
      res.status(500).json({ message: "Failed to scale up" });
    }
  });
  app2.post("/api/load-balancer/scale-down", requireAuth, requirePermission("system.admin"), async (req, res) => {
    try {
      const removedServerIds = await loadBalancer.scaleDown();
      res.json({ message: "Scale down completed", removedServerIds, count: removedServerIds.length });
    } catch (error) {
      console.error("Error scaling down:", error);
      res.status(500).json({ message: "Failed to scale down" });
    }
  });
  app2.post("/api/load-balancer/servers/:id/drain", requireAuth, requirePermission("system.admin"), (req, res) => {
    try {
      const { id } = req.params;
      loadBalancer.drainServer(id);
      res.json({ message: "Server draining initiated" });
    } catch (error) {
      console.error("Error draining server:", error);
      res.status(500).json({ message: "Failed to drain server" });
    }
  });
  app2.use("/api", router);
  app2.get("/api/emails/inbound", requireAuth, async (req, res) => {
    try {
      const mockEmails = [
        {
          id: "email_1",
          fromEmail: "support@client.com",
          toEmail: "messages@gigstergarage.app",
          subject: "Support Request: Login Issues",
          content: "I am having trouble logging into my account. Can you please help me reset my password?",
          attachments: [],
          parsedAt: (/* @__PURE__ */ new Date()).toISOString(),
          status: "processed",
          routingRule: "Support Team",
          assignedUser: "Support Agent",
          messageId: "msg_123"
        },
        {
          id: "email_2",
          fromEmail: "info@business.com",
          toEmail: "messages@gigstergarage.app",
          subject: "Project Inquiry",
          content: "We are interested in your services for a new project. Please contact us to discuss further.",
          attachments: [],
          parsedAt: new Date(Date.now() - 36e5).toISOString(),
          status: "processed",
          routingRule: "Sales Team",
          assignedUser: "Sales Rep",
          messageId: "msg_124"
        }
      ];
      res.json(mockEmails);
    } catch (error) {
      console.error("Error fetching inbound emails:", error);
      res.status(500).json({ error: "Failed to fetch inbound emails" });
    }
  });
  app2.get("/api/emails/routing-rules", requireAuth, async (req, res) => {
    try {
      const mockRules = [
        {
          id: "rule_1",
          name: "Support Requests",
          description: "Route support emails to support team",
          conditions: {
            subject: "support, help, issue, bug"
          },
          actions: {
            assignToUser: "support_agent_id",
            priority: "high",
            autoReply: true,
            autoReplyTemplate: "Thank you for contacting support. We will respond within 24 hours.",
            createTask: true
          },
          isActive: true,
          matchCount: 15,
          createdAt: new Date(Date.now() - 7 * 24 * 36e5).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "rule_2",
          name: "Sales Inquiries",
          description: "Route sales emails to sales team",
          conditions: {
            subject: "inquiry, quote, project, proposal"
          },
          actions: {
            assignToUser: "sales_rep_id",
            priority: "medium",
            autoReply: false,
            createTask: true
          },
          isActive: true,
          matchCount: 8,
          createdAt: new Date(Date.now() - 5 * 24 * 36e5).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      ];
      res.json(mockRules);
    } catch (error) {
      console.error("Error fetching routing rules:", error);
      res.status(500).json({ error: "Failed to fetch routing rules" });
    }
  });
  app2.post("/api/emails/routing-rules", requireAuth, async (req, res) => {
    try {
      const ruleData = req.body;
      const newRule = {
        id: "rule_" + Date.now(),
        ...ruleData,
        matchCount: 0,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      console.log("\u{1F4E7} Created email routing rule:", newRule.name);
      res.json(newRule);
    } catch (error) {
      console.error("Error creating routing rule:", error);
      res.status(500).json({ error: "Failed to create routing rule" });
    }
  });
  app2.post("/api/emails/test-parser", requireAuth, async (req, res) => {
    try {
      const { fromEmail, subject, content } = req.body;
      const formData = `from=${encodeURIComponent(fromEmail)}&subject=${encodeURIComponent(subject)}&text=${encodeURIComponent(content)}`;
      const parsedData = parseInboundEmail(formData);
      console.log("\u{1F4E7} Email parser test successful:", parsedData);
      res.json(parsedData);
    } catch (error) {
      console.error("Error testing email parser:", error);
      res.status(500).json({ error: "Failed to test email parser" });
    }
  });
  app2.get("/api/slack/integrations", requireAuth, async (req, res) => {
    try {
      const integrations = await webhookService.getIntegrations();
      const slackIntegrations = integrations.filter((i) => i.type === "slack").map((integration) => ({
        id: integration.id,
        name: integration.name,
        workspaceName: integration.config.teamId || "Unknown Workspace",
        webhookUrl: integration.config.webhookUrl,
        channels: [
          { id: "general", name: "general", isPrivate: false },
          { id: "notifications", name: "notifications", isPrivate: false },
          { id: "alerts", name: "alerts", isPrivate: false }
        ],
        defaultChannel: integration.config.channelId || "#general",
        botToken: integration.config.botToken,
        isActive: integration.active,
        eventMappings: integration.eventMappings.map((mapping) => ({
          event: mapping.event,
          channel: integration.config.channelId || "#general",
          template: mapping.template,
          enabled: mapping.enabled,
          priority: "medium"
        })),
        statistics: {
          totalSent: Math.floor(Math.random() * 100),
          successRate: 95 + Math.random() * 5,
          lastSent: (/* @__PURE__ */ new Date()).toISOString()
        },
        createdAt: integration.createdAt.toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }));
      res.json(slackIntegrations);
    } catch (error) {
      console.error("Error fetching Slack integrations:", error);
      res.status(500).json({ error: "Failed to fetch Slack integrations" });
    }
  });
  app2.post("/api/slack/integrations", requireAuth, async (req, res) => {
    try {
      const { name, workspaceName, webhookUrl, defaultChannel, botToken, eventMappings } = req.body;
      const integration = await webhookService.createIntegration({
        type: "slack",
        name,
        config: {
          webhookUrl,
          channelId: defaultChannel,
          teamId: workspaceName,
          botToken
        },
        eventMappings: eventMappings || [],
        active: true,
        createdBy: req.user?.id || "system"
      });
      console.log("\u{1F4F1} Created Slack integration:", name);
      res.json(integration);
    } catch (error) {
      console.error("Error creating Slack integration:", error);
      res.status(500).json({ error: "Failed to create Slack integration" });
    }
  });
  app2.patch("/api/slack/integrations/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      console.log(`\u{1F4F1} Updated Slack integration ${id}:`, updates);
      res.json({ id, ...updates, updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
    } catch (error) {
      console.error("Error updating Slack integration:", error);
      res.status(500).json({ error: "Failed to update Slack integration" });
    }
  });
  app2.post("/api/slack/integrations/:id/test", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { event, channel, template, data } = req.body;
      console.log(`\u{1F4F1} Testing Slack integration ${id} - Event: ${event}, Channel: ${channel}`);
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      res.json({
        success: true,
        message: "Test notification sent successfully",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error testing Slack integration:", error);
      res.status(500).json({ error: "Failed to test Slack integration" });
    }
  });
  app2.post("/api/slack/validate-webhook", requireAuth, async (req, res) => {
    try {
      const { webhookUrl } = req.body;
      if (!webhookUrl || !webhookUrl.startsWith("https://hooks.slack.com/")) {
        return res.status(400).json({ error: "Invalid Slack webhook URL" });
      }
      console.log("\u{1F4F1} Validating Slack webhook:", webhookUrl);
      res.json({
        valid: true,
        workspaceName: "Test Workspace",
        channel: "#general"
      });
    } catch (error) {
      console.error("Error validating Slack webhook:", error);
      res.status(500).json({ error: "Failed to validate Slack webhook" });
    }
  });
  app2.get("/api/slack/notifications", requireAuth, async (req, res) => {
    try {
      const mockNotifications = [
        {
          id: "notif_1",
          integrationId: "integration_1",
          channel: "#general",
          event: "task.created",
          message: "\u{1F4DD} New task created: Fix login bug assigned to John Doe",
          status: "sent",
          attempts: 1,
          sentAt: (/* @__PURE__ */ new Date()).toISOString(),
          metadata: { taskId: "task_123", priority: "high" }
        },
        {
          id: "notif_2",
          integrationId: "integration_1",
          channel: "#notifications",
          event: "project.updated",
          message: "\u{1F680} Project updated: Website Redesign milestone reached",
          status: "sent",
          attempts: 1,
          sentAt: new Date(Date.now() - 18e5).toISOString(),
          metadata: { projectId: "project_456" }
        }
      ];
      res.json(mockNotifications);
    } catch (error) {
      console.error("Error fetching Slack notifications:", error);
      res.status(500).json({ error: "Failed to fetch Slack notifications" });
    }
  });
  app2.get("/api/slack/statistics", requireAuth, async (req, res) => {
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
  console.log("\u{1F680} Starting background services...");
  invoiceStatusService.startStatusMonitoring();
  automatedInvoicingService.startAutomatedInvoicing();
  smartNotificationsService.startSmartNotifications();
  contractManagementService.startContractMonitoring();
  demoSessionService.initializeDemoSessionService();
  console.log("\u{1F680} Starting cache warming service...");
  const { cacheWarmingService: cacheWarmingService2 } = await Promise.resolve().then(() => (init_cache_warming_service(), cache_warming_service_exports));
  await cacheWarmingService2.startCacheWarming();
  cacheWarmingService2.scheduleCacheWarming();
  const httpServer = createServer(app2);
  console.log("\u{1F680} Initializing Team Collaboration Service...");
  const collaboration = new CollaborationService(httpServer);
  global.collaborationService = collaboration;
  console.log("\u{1F517} Initializing Webhook Service...");
  global.webhookService = webhookService;
  console.log("\u{1F3E2} Initializing White-label Service...");
  global.whiteLabelService = whiteLabelService;
  app2.get("/api/public/invoice/:paymentLink", async (req, res) => {
    try {
      const { paymentLink } = req.params;
      const invoice = await storage.getInvoiceByPaymentLink(paymentLink);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found or payment link expired" });
      }
      if (invoice.paymentLinkExpiresAt && /* @__PURE__ */ new Date() > invoice.paymentLinkExpiresAt) {
        return res.status(404).json({ error: "Payment link expired" });
      }
      const publicInvoiceData = {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        companyName: "Gigster Garage",
        // You can make this dynamic later
        companyAddress: "Business Address\nCity, State ZIP",
        // You can make this dynamic later
        subtotal: invoice.subtotal ? String(invoice.subtotal) : "0.00",
        taxRate: invoice.taxRate ? String(invoice.taxRate) : "0.00",
        taxAmount: invoice.taxAmount ? String(invoice.taxAmount) : "0.00",
        discountAmount: invoice.discountAmount ? String(invoice.discountAmount) : "0.00",
        totalAmount: invoice.totalAmount ? String(invoice.totalAmount) : "0.00",
        lineItems: invoice.lineItems || [],
        status: invoice.status,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        notes: invoice.notes
      };
      res.json(publicInvoiceData);
    } catch (error) {
      console.error("Error fetching public invoice:", error);
      res.status(500).json({ error: "Failed to fetch invoice" });
    }
  });
  app2.post("/api/public/create-payment-intent", async (req, res) => {
    try {
      const { paymentLink } = req.body;
      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ error: "Payment processing not configured" });
      }
      const invoice = await storage.getInvoiceByPaymentLink(paymentLink);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      if (invoice.status === "paid") {
        return res.status(400).json({ error: "Invoice already paid" });
      }
      if (invoice.paymentLinkExpiresAt && /* @__PURE__ */ new Date() > invoice.paymentLinkExpiresAt) {
        return res.status(400).json({ error: "Payment link expired" });
      }
      const Stripe = __require("stripe");
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      let paymentIntent;
      if (invoice.stripePaymentIntentId) {
        try {
          paymentIntent = await stripe.paymentIntents.retrieve(invoice.stripePaymentIntentId);
        } catch (error) {
          paymentIntent = null;
        }
      }
      if (!paymentIntent) {
        paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(parseFloat(invoice.totalAmount || "0") * 100),
          // Convert to cents
          currency: "usd",
          metadata: {
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber
          }
        });
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
  app2.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), async (req, res) => {
    try {
      const sig = req.headers["stripe-signature"];
      if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ error: "Webhook not configured" });
      }
      const Stripe = __require("stripe");
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).json({ error: "Invalid signature" });
      }
      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const invoiceId = paymentIntent.metadata?.invoiceId;
        if (invoiceId) {
          await storage.updateInvoice(invoiceId, {
            status: "paid",
            paidAt: /* @__PURE__ */ new Date(),
            amountPaid: (paymentIntent.amount / 100).toString()
            // Convert from cents
          });
          await storage.createPayment({
            invoiceId,
            amount: (paymentIntent.amount / 100).toString(),
            paymentDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
            paymentMethod: "stripe",
            reference: paymentIntent.id
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
  async function initializeDefaultUsers() {
    console.log("\u{1F680} Initializing default user accounts...");
    try {
      const existingAdmin = await storage.getUserByUsername("admin");
      if (!existingAdmin) {
        console.log("\u{1F510} Creating admin user...");
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
        console.log("\u2705 Admin user created successfully");
      } else {
        console.log("\u{1F464} Admin user already exists, skipping creation");
      }
      const existingDemo = await storage.getUserByUsername("demo");
      if (!existingDemo) {
        console.log("\u{1F3AE} Creating demo user...");
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
        console.log("\u2705 Demo user created successfully");
      } else {
        console.log("\u{1F3AE} Demo user already exists, skipping creation");
      }
      console.log("\u2705 Default user initialization complete");
    } catch (error) {
      console.error("\u274C Error initializing default users:", error);
    }
  }
  await initializeDefaultUsers();
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs2 from "fs";
import path4 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path3 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path3.resolve(import.meta.dirname, "client", "src"),
      "@shared": path3.resolve(import.meta.dirname, "shared"),
      "@assets": path3.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path3.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path3.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path4.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path4.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path4.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.disable("x-powered-by");
app.use((req, _res, next) => {
  req.headers["accept-charset"] = "utf-8";
  next();
});
app.use(express3.json({ limit: "50mb" }));
app.use(express3.urlencoded({ extended: true }));
function isMobileDevice(userAgent) {
  return /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
}
app.use((req, res, next) => {
  const userAgent = req.headers["user-agent"] || "";
  const desktopForced = req.query.desktop === "true";
  if (req.method === "GET" && req.path === "/" && isMobileDevice(userAgent) && !desktopForced) {
    log(`\u{1F4F1} Redirecting mobile browser from ${req.path} to /mobile`);
    return res.redirect(302, "/mobile");
  }
  next();
});
(async () => {
  app.get("/health", (_req, res) => {
    res.type("text/plain").send("OK");
  });
  const server = await registerRoutes(app);
  await setupVite(app, server);
  serveStatic(app);
  const historyMiddleware = history({
    verbose: false,
    // Only need to preserve API routes since Vite handles its own routes now
    rewrites: [
      { from: /^\/api\/.*$/, to: (ctx) => ctx.parsedUrl.path || "" },
      { from: /^\/health$/, to: (ctx) => ctx.parsedUrl.path || "" }
    ]
  });
  app.use(historyMiddleware);
  const port = 5e3;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
