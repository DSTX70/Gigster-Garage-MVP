import express, { type Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import multer from "multer";
import csvParser from "csv-parser";
import * as createCsvWriter from "csv-writer";
import { z } from "zod";
import { storage } from "./storage";
import { sendHighPriorityTaskNotification, sendSMSNotification, sendProposalEmail, sendInvoiceEmail, sendMessageAsEmail, parseInboundEmail } from "./emailService";
import { generateInvoicePDF, generateProposalPDF } from "./pdfService";
import { taskSchema, insertTaskSchema, insertProjectSchema, insertTemplateSchema, insertProposalSchema, insertClientSchema, insertClientDocumentSchema, insertInvoiceSchema, insertPaymentSchema, insertContractSchema, insertUserSchema, onboardingSchema, updateTaskSchema, updateTemplateSchema, updateProposalSchema, updateTimeLogSchema, startTimerSchema, stopTimerSchema, generateProposalSchema, sendProposalSchema, directProposalSchema, insertMessageSchema } from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import type { User } from "@shared/schema";
import OpenAI from "openai";
import { invoiceStatusService } from "./invoiceStatusService";
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

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
  // Apply performance monitoring to all routes
  app.use(performanceMiddleware());
  app.use(optimizationMiddleware());
  // Configure multer for file uploads
  const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
  });

  // PostgreSQL session store
  const PgSession = ConnectPgSimple(session);
  
  // Session middleware with PostgreSQL store
  app.use(session({
    store: new PgSession({
      pool: pool,
      tableName: 'sessions',
      createTableIfMissing: false // Table already exists in schema
    }),
    secret: process.env.SESSION_SECRET || 'taskflow-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

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
      const user = await storage.getUserByUsername(username);
      
      if (!user || !(await storage.verifyPassword(user, password))) {
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

  // Project routes
  app.get("/api/projects", requireAuth, async (req, res) => {
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
  app.get("/api/users", requireAdmin, async (req, res) => {
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
        
        for (const task of matchingTasks) {
          // Get project name for context
          let projectName;
          if (task.projectId) {
            const project = await storage.getProject(task.projectId);
            projectName = project?.name;
          }
          
          // Get assignee name for context
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
  app.get("/api/tasks", requireAuth, async (req, res) => {
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
      const { progress, ...taskData } = result.data;
      const task = await storage.createTask(taskData, user.id);
      
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
  app.get("/api/projects", requireAuth, async (req, res) => {
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

          // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
          const completion = await openai.chat.completions.create({
            model: "gpt-5",
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
          templateId,
          projectId,
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
      
      const newContract = {
        ...contractData,
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

      const updateData = insertContractSchema.partial().parse(req.body);
      updateData.lastModifiedById = req.session.user!.id;

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
      const invoice = await storage.getInvoice(req.params.id);
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
      if (validatedData.filePath) {
        const objectStorageService = new ObjectStorageService();
        const normalizedPath = await objectStorageService.trySetObjectEntityAclPolicy(
          validatedData.filePath,
          {
            owner: req.session.user?.id || "",
            visibility: "private", // Client documents are private by default
          }
        );
        validatedData.filePath = normalizedPath;
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
      
      // Ensure status is draft for new invoices
      const draftInvoice = {
        ...invoiceData,
        status: "draft" as const,
        invoiceNumber: `INV-${Date.now()}`,
        createdById: req.session.user!.id,
      };

      const invoice = await storage.createInvoice(draftInvoice);
      res.json(invoice);
    } catch (error) {
      console.error("Error creating draft invoice:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid invoice data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });

  // Get all invoices
  app.get("/api/invoices", requireAuth, async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  // Get specific invoice
  app.get("/api/invoices/:id", requireAuth, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ error: "Failed to fetch invoice" });
    }
  });

  // Update invoice (edit line items, amounts, etc.)
  app.put("/api/invoices/:id", requireAuth, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      // Only allow editing draft invoices
      if (invoice.status !== "draft") {
        return res.status(400).json({ error: "Only draft invoices can be edited" });
      }

      const updateData = insertInvoiceSchema.partial().parse(req.body);
      
      // Calculate totals if line items are updated
      if (updateData.lineItems) {
        const subtotal = Array.isArray(updateData.lineItems) ? updateData.lineItems.reduce((sum: number, item: any) => sum + Number(item.amount), 0) : 0;
        const taxAmount = subtotal * Number(updateData.taxRate || invoice.taxRate || 0) / 100;
        const totalAmount = subtotal + taxAmount - Number(updateData.discountAmount || 0);
        
        updateData.subtotal = subtotal.toString();
        updateData.taxAmount = taxAmount.toString();
        updateData.totalAmount = totalAmount.toString();
      }

      const updatedInvoice = await storage.updateInvoice(req.params.id, updateData);
      res.json(updatedInvoice);
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
      const invoice = await storage.getInvoice(req.params.id);
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
          invoicePDF = await generateInvoicePDF(invoice);
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
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      // Only allow deleting draft invoices
      if (invoice.status !== "draft") {
        return res.status(400).json({ error: "Only draft invoices can be deleted" });
      }

      const deleted = await storage.deleteInvoice(req.params.id);
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

  // Inbound email webhook for SendGrid
  app.post("/api/inbound-email", express.raw({ type: 'text/plain' }), async (req, res) => {
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

  // =================== START BACKGROUND SERVICES ===================
  
  // Start automated business logic services
  console.log("🚀 Starting background services...");
  invoiceStatusService.startStatusMonitoring();
  contractManagementService.startContractMonitoring();

  const httpServer = createServer(app);

  // Initialize collaboration service with WebSocket support
  console.log('🚀 Initializing Team Collaboration Service...');
  const collaboration = new CollaborationService(httpServer);
  (global as any).collaborationService = collaboration;

  // Initialize webhook service
  console.log('🔗 Initializing Webhook Service...');
  (global as any).webhookService = webhookService;

  // Initialize white-label service
  console.log('🏢 Initializing White-label Service...');
  (global as any).whiteLabelService = whiteLabelService;

  return httpServer;
}