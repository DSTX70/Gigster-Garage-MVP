# Gigster Garage - Complete Platform Export
**For Comprehensive Platform Audit**

## Table of Contents
1. [Platform Overview](#platform-overview)
2. [Updated User Manual](#updated-user-manual)
3. [Complete Source Code](#complete-source-code)
4. [Architecture Documentation](#architecture-documentation)
5. [Database Schema](#database-schema)
6. [API Documentation](#api-documentation)

---

## Platform Overview

Gigster Garage is a comprehensive workflow management platform featuring:
- Task Management & Project Organization
- Client Relationship Management
- Professional Invoicing & Proposal Systems
- AI-Powered Content Generation
- Real-time Collaboration
- Mobile-First Progressive Web App
- Enterprise Security & Performance Features
- Advanced Filing Cabinet & Document Management

**Technology Stack:**
- Frontend: React + TypeScript + TailwindCSS + shadcn/ui
- Backend: Express.js + TypeScript + PostgreSQL + Drizzle ORM
- AI Integration: OpenAI GPT-4o
- Authentication: Session-based with bcrypt
- Real-time: WebSocket integration
- Mobile: Progressive Web App (PWA)

---

## Updated User Manual

# Gigster Garage User Manual
**Smarter tools for bolder dreams**

---

## Table of Contents
1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Core Features](#core-features)
4. [User Interface Guide](#user-interface-guide)
5. [Advanced Features](#advanced-features)
6. [Mobile App & Native Features](#mobile-app--native-features)
7. [Business Automation Systems](#business-automation-systems)
8. [Team Collaboration](#team-collaboration)
9. [Real-time Collaboration & Communication](#real-time-collaboration--communication)
10. [Enterprise Security & Performance](#enterprise-security--performance)
11. [Brand Identity](#brand-identity)
12. [Technical Specifications](#technical-specifications)

---

## Overview

Gigster Garage is a comprehensive time tracker and workflow management system designed for ambitious creators and teams. Built with personality-driven design and engaging copy, Gigster Garage transforms mundane task management into an inspiring productivity experience.

### Key Philosophy
- **"Spark the hustle"** - Everything is designed to motivate and energize
- **Personality-driven copy** - Engaging language throughout ("Lock It In", "Spark New Task")
- **Clean, intuitive interface** - Professional yet approachable
- **Team-ready** - Built for collaboration from day one

---

## Getting Started

### Initial Setup
1. **Landing Page Access** - Visit the Gigster Garage branded landing page
2. **Account Creation** - Quick signup with username, password, name, and email
3. **First Login Flow** - Guided onboarding to set notification preferences
4. **Dashboard Access** - Immediate access to all productivity tools

### First Steps
1. **Spark Your First Task** - Click the prominent "Spark New Task" button
2. **Add Project Organization** - Create projects to organize your work
3. **Set Up Clients** - Add client information for professional management
4. **Configure Notifications** - Enable email/SMS alerts for important deadlines

---

## Core Features

### Task Management
- **Smart Task Creation** - Modal-based form with comprehensive options
- **Priority Levels** - Visual indicators for task importance
- **Due Dates & Times** - Precise scheduling with reminder notifications
- **Task Assignments** - Assign tasks to team members
- **Progress Tracking** - Add progress notes with auto-filled dates
- **File Attachments** - Attach documents and media to tasks
- **URL Links** - Reference external resources
- **Subtasks & Dependencies** - Full parent-child task hierarchy with circular dependency prevention

### Project Organization
- **Project Creation** - Organize tasks by project with dropdown selection
- **Project Dashboards** - Rich views with Kanban boards and progress tracking
- **Timeline Planning** - Gantt chart views for project scheduling
- **Progress Indicators** - Visual status badges and completion metrics
- **Cross-Device Optimization** - Desktop expanded views with column layouts

### Client Management
- **Comprehensive Client Profiles** - Name, company, contact information, and notes
- **Client Status Tracking** - Active, inactive, and prospect classifications
- **Project Association** - Link clients to specific projects and tasks
- **Communication History** - Track all client interactions

### Time Tracking
- **Integrated Time Tracking** - Built-in timer functionality
- **Project Allocation** - Track time spent on specific projects
- **Productivity Reporting** - Analyze time usage patterns
- **Automatic Logging** - Seamless integration with task completion

---

## User Interface Guide

### Navigation Structure
- **Header Bar** - Gigster Garage logo and "Smarter tools for bolder dreams" tagline in signature blue
- **Action Buttons** - "Spark New Task" prominently positioned for quick access
- **Page Titles** - Clear hierarchy with functional buttons on the same line
- **Back Navigation** - Consistent "Back to Tasks" buttons across admin pages

### Color System (Gigster Garage Brand)
- **Garage Navy** (#004C6D) - Primary brand color for headers and core elements
- **Ignition Teal** (#0B1D3A) - Secondary brand color for accents and highlights
- **Professional Blue Tones** - Consistent branding across all components
- **Strategic Color Usage** - Navy and teal create professional visual hierarchy
- **Neutral Grays** - Supporting text and backgrounds

### Interactive Elements
- **Modal Popups** - Task creation and forms appear as centered overlays
- **Hover States** - Responsive feedback on all interactive elements
- **Loading States** - Skeleton screens and progress indicators
- **Visual Feedback** - Success animations and state changes

---

## Advanced Features

### Enterprise Performance & Optimization
- **Performance Monitoring** - Real-time metrics tracking with response time analysis
- **Cache Management** - Intelligent caching system with warming service
- **Database Optimization** - Query optimization and connection pooling
- **Load Balancing** - Enterprise-grade request distribution
- **CDN Integration** - Content delivery network for global performance

### Advanced Analytics & Reporting
- **Custom Dashboards** - Configurable analytics displays
- **Productivity Insights** - AI-powered analysis of work patterns
- **Team Performance Metrics** - Comprehensive team analytics
- **Custom Report Generation** - Automated report creation and scheduling
- **Data Export** - Multiple format support for external analysis

### Workflow Automation
- **Visual Rule Builder** - Drag-and-drop automation creation
- **Trigger Management** - Set up automated responses to events
- **Action Sequences** - Chain multiple actions together
- **Custom Workflows** - Tailor automation to specific business needs

### AI-Powered Content Generation
- **Proposal Generation** - AI-assisted content creation using GPT-4o
- **Content Templates** - Pre-built templates for common documents
- **Smart Suggestions** - AI recommendations for task optimization
- **Reliable Processing** - Stable AI integration with error handling

### Invoice Builder & Automation
- **Auto-Fill Functionality** - Company information automatically populates
- **Professional Templates** - Clean, branded invoice designs
- **Client Integration** - Pull client data directly into invoices
- **Export Options** - PDF generation and email delivery
- **Automated Status Tracking** - Background monitoring of invoice lifecycle
- **Overdue Management** - Automatic detection and notification of past-due invoices
- **Payment Processing Integration** - Ready for Stripe payment processing (when configured)

### Garage Assistant UI
- **Integrated Assistant** - Built-in AI helper with consistent branding
- **Real Data Sources** - Connected to actual project and task data
- **Contextual Help** - Smart assistance based on current user actions
- **Garage Navy Branding** - Consistent visual identity throughout

---

## Complete Source Code

### 1. Database Schema (`shared/schema.ts`)

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
});

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
  paymentLink: varchar("payment_link").unique(),
  paymentLinkExpiresAt: timestamp("payment_link_expires_at"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  createdById: varchar("created_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  sentAt: timestamp("sent_at"),
  paidAt: timestamp("paid_at"),
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
  contractValue: decimal("contract_value", { precision: 10, scale: 2 }).default("0.00"),
  paymentTerms: text("payment_terms"),
  currency: varchar("currency", { enum: ["USD", "EUR", "GBP", "CAD"] }).default("USD"),
  effectiveDate: date("effective_date"),
  expirationDate: date("expiration_date"),
  renewalDate: date("renewal_date"),
  terminationDate: date("termination_date"),
  requiresSignature: boolean("requires_signature").default(true),
  signatureType: varchar("signature_type", { enum: ["digital", "wet", "both"] }).default("digital"),
  businessSignedAt: timestamp("business_signed_at"),
  businessSignedBy: varchar("business_signed_by").references(() => users.id),
  clientSignedAt: timestamp("client_signed_at"),
  clientSignedBy: varchar("client_signed_by"),
  witnessRequired: boolean("witness_required").default(false),
  witnessSignedAt: timestamp("witness_signed_at"),
  witnessSignedBy: varchar("witness_signed_by"),
  shareableLink: varchar("shareable_link").unique(),
  documentPath: varchar("document_path"),
  signedDocumentPath: varchar("signed_document_path"),
  version: integer("version").default(1),
  parentContractId: varchar("parent_contract_id").references((): any => contracts.id),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  lastReminderSent: timestamp("last_reminder_sent"),
  reminderCount: integer("reminder_count").default(0),
  governingLaw: varchar("governing_law").default("United States"),
  jurisdiction: varchar("jurisdiction"),
  confidentialityLevel: varchar("confidentiality_level", { enum: ["public", "internal", "confidential", "highly_confidential"] }).default("confidential"),
  autoRenewal: boolean("auto_renewal").default(false),
  renewalPeriod: integer("renewal_period"),
  noticePeriod: integer("notice_period").default(30),
  tags: jsonb("tags").$type<string[]>().default([]),
  notes: text("notes"),
  internalNotes: text("internal_notes"),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdById: varchar("created_by_id").references(() => users.id),
  lastModifiedById: varchar("last_modified_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// [Additional schema tables continue...]
```

### 2. Package Configuration (`package.json`)

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
    "@neondatabase/serverless": "^0.10.4",
    "@radix-ui/react-accordion": "^1.2.4",
    "@radix-ui/react-alert-dialog": "^1.1.7",
    "@radix-ui/react-aspect-ratio": "^1.1.3",
    "@radix-ui/react-avatar": "^1.1.4",
    "@sendgrid/mail": "^8.1.5",
    "@slack/web-api": "^7.10.0",
    "@stripe/react-stripe-js": "^3.10.0",
    "@stripe/stripe-js": "^7.9.0",
    "@tanstack/react-query": "^5.60.5",
    "bcryptjs": "^3.0.2",
    "drizzle-orm": "^0.39.1",
    "drizzle-zod": "^0.7.0",
    "express": "^4.21.2",
    "express-session": "^1.18.2",
    "lucide-react": "^0.453.0",
    "openai": "^5.19.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.55.0",
    "tailwindcss": "^3.4.17",
    "typescript": "5.6.3",
    "wouter": "^3.3.5",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/express": "4.17.21",
    "@types/node": "20.16.11",
    "@types/react": "^18.3.11",
    "@vitejs/plugin-react": "^4.3.2",
    "drizzle-kit": "^0.30.4",
    "tsx": "^4.19.1",
    "vite": "^5.4.19"
  }
}
```

### 3. Frontend Application Entry (`client/src/App.tsx`)

```typescript
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { MoodPaletteProvider } from "@/hooks/useMoodPalette";
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

// Mobile Pages
import MobileHome from "@/pages/mobile-home";
import MobileDashboard from "@/pages/mobile-dashboard";
import MobileTasks from "@/pages/mobile-tasks";
import MobileProjects from "@/pages/mobile-projects";
import MobileTimeTracking from "@/pages/mobile-time-tracking";
import MobileWorkflows from "@/pages/mobile-workflows";

function Router() {
  const [location, setLocation] = useLocation();
  const isMobileRoute = location.startsWith('/mobile');

  // For mobile routes, show them immediately without authentication checks
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
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={isAdmin ? Admin : NotFound} />
      <Route path="/project/:projectId" component={ProjectDashboard} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/productivity" component={Productivity} />
      <Route path="/create-proposal" component={CreateProposal} />
      <Route path="/create-invoice" component={CreateInvoice} />
      <Route path="/invoices" component={Invoices} />
      <Route path="/invoice/:id" component={InvoiceDetails} />
      <Route path="/edit-invoice/:id" component={EditInvoice} />
      <Route path="/payments" component={Payments} />
      <Route path="/create-contract" component={CreateContract} />
      <Route path="/create-presentation" component={CreatePresentation} />
      <Route path="/clients" component={ClientList} />
      <Route path="/client/:id" component={ClientDetails} />
      <Route path="/messages" component={MessagesPage} />
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
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MoodPaletteProvider>
          <Router />
          <Toaster />
        </MoodPaletteProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
```
