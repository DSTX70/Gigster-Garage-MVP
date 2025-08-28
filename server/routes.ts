import express, { type Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { z } from "zod";
import { storage } from "./storage";
import { sendHighPriorityTaskNotification, sendSMSNotification, sendProposalEmail, sendInvoiceEmail, sendMessageAsEmail, parseInboundEmail } from "./emailService";
import { generateInvoicePDF, generateProposalPDF } from "./pdfService";
import { taskSchema, insertTaskSchema, insertProjectSchema, insertTemplateSchema, insertProposalSchema, insertClientSchema, insertClientDocumentSchema, insertInvoiceSchema, insertPaymentSchema, insertUserSchema, onboardingSchema, updateTaskSchema, updateTemplateSchema, updateProposalSchema, updateTimeLogSchema, startTimerSchema, stopTimerSchema, generateProposalSchema, sendProposalSchema, directProposalSchema, insertMessageSchema } from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import type { User } from "@shared/schema";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
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

  app.get("/api/auth/user", (req, res) => {
    if (req.session.user) {
      res.json({ 
        user: { 
          id: req.session.user.id, 
          username: req.session.user.username, 
          name: req.session.user.name, 
          email: req.session.user.email, 
          role: req.session.user.role,
          hasCompletedOnboarding: req.session.user.hasCompletedOnboarding,
          notificationEmail: req.session.user.notificationEmail,
          phone: req.session.user.phone,
          emailOptIn: req.session.user.emailOptIn,
          smsOptIn: req.session.user.smsOptIn
        } 
      });
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
        hasCompletedOnboarding: result.data.hasCompletedOnboarding,
        emailOptIn: result.data.emailOptIn,
        smsOptIn: result.data.smsOptIn,
        notificationEmail: result.data.notificationEmail || '',
        phone: result.data.phone
      };
      const user = await storage.updateUserOnboarding(userId, updateData);
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
      const task = await storage.createTask({
        ...result.data,
        progress: result.data.progress && Array.isArray(result.data.progress) ? result.data.progress : []
      }, user.id);
      
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

      const task = await storage.updateTask(id, {
        ...result.data,
        progress: result.data.progress && Array.isArray(result.data.progress) ? result.data.progress : undefined
      });
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
        progress: result.data.progress && Array.isArray(result.data.progress) ? result.data.progress : []
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
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        previousValues: {
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

      const template = await storage.createTemplate(templateData);
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

          const prompt = `As an expert business template designer, analyze this ${templateType} template request and suggest appropriate form fields.

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
                content: "You are an expert business template designer. Always respond with valid JSON only, no markdown or extra text."
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
          console.log("OpenAI unavailable, using fallback suggestions:", openaiError.message);
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

      const template = await storage.updateTemplate(req.params.id, result.data);
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
        let proposalClientId = proposalData.clientId;
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
          proposalData.clientId = proposalClientId;
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

  // Proposal response endpoint (for clients)
  app.post("/api/shared/proposals/:shareableLink/respond", async (req, res) => {
    try {
      const { response, message } = req.body;
      
      if (!response || !['accepted', 'rejected'].includes(response)) {
        return res.status(400).json({ message: "Valid response (accepted/rejected) is required" });
      }

      const proposal = await storage.getProposalByShareableLink(req.params.shareableLink);
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }

      const updatedProposal = await storage.updateProposal(proposal.id, {
        status: response,
        respondedAt: new Date(),
        responseMessage: message
      });

      res.json({ message: `Proposal ${response} successfully`, proposal: updatedProposal });
    } catch (error) {
      console.error("Error responding to proposal:", error);
      res.status(500).json({ message: "Failed to respond to proposal" });
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

  // Send invoice via email
  app.post("/api/invoices/:id/send", requireAuth, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      // Get client information
      const client = await storage.getClient(invoice.clientId);
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
        createdById: req.user!.id,
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
        const subtotal = updateData.lineItems.reduce((sum, item) => sum + item.amount, 0);
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

  // Message endpoints
  app.post("/api/messages", requireAuth, async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      
      const message = await storage.createMessage({
        ...messageData,
        fromUserId: req.user!.id,
      });

      // Send email if recipient is external (has email but no internal user)
      if (messageData.toEmail && !messageData.toUserId) {
        const fromUser = await storage.getUser(req.user!.id);
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
      const messages = await storage.getMessages(req.user!.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.put("/api/messages/:id/read", requireAuth, async (req, res) => {
    try {
      const messageId = req.params.id;
      const message = await storage.markMessageAsRead(messageId, req.user!.id);
      
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
      const count = await storage.getUnreadMessageCount(req.user!.id);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread message count:", error);
      res.status(500).json({ error: "Failed to fetch unread message count" });
    }
  });

  // Email configuration info endpoint
  app.get("/api/messages/email-config", requireAuth, async (req, res) => {
    const sendGridConfigured = !!(process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY_2);
    const webhookUrl = `${APP_URL}/api/inbound-email`;
    
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

      const response = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
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
      res.json({ content });
    } catch (error) {
      console.error("OpenAI Create API Error:", error);
      res.status(500).json({ error: "Failed to generate creative content" });
    }
  });

  app.post("/api/agency/write", requireAuth, async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
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
      res.json({ content });
    } catch (error) {
      console.error("OpenAI Write API Error:", error);
      res.status(500).json({ error: "Failed to generate written content" });
    }
  });

  app.post("/api/agency/promote", requireAuth, async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
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
      res.json({ content });
    } catch (error) {
      console.error("OpenAI Promote API Error:", error);
      res.status(500).json({ error: "Failed to generate promotion strategy" });
    }
  });

  app.post("/api/agency/track", requireAuth, async (req, res) => {
    try {
      const { data } = req.body;
      if (!data) {
        return res.status(400).json({ error: "Data is required" });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
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
      res.json({ insights });
    } catch (error) {
      console.error("OpenAI Track API Error:", error);
      res.status(500).json({ error: "Failed to analyze marketing data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}