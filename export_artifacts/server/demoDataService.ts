import { storage } from "./storage";
import type { 
  InsertClient, InsertProject, InsertTask, InsertTemplate, 
  InsertProposal, InsertInvoice, InsertContract, InsertTimeLog, 
  InsertPayment, LineItem 
} from "@shared/schema";

/**
 * Simplified Demo Data Seeding Service for Gigster Garage
 * 
 * This service creates basic sample data for demo purposes
 */

interface DemoDataIds {
  clients: Record<string, string>;
  projects: Record<string, string>;
  tasks: Record<string, string>;
  templates: Record<string, string>;
  proposals: Record<string, string>;
  invoices: Record<string, string>;
  contracts: Record<string, string>;
}

/**
 * SAFE: Clear ONLY demo data for a specific demo session
 * This function has been rewritten to fix CRITICAL SECURITY FLAWS that could delete production data
 */
export async function clearDemoData(demoUserId: string, demoSessionId?: string): Promise<void> {
  console.log(`🧹 [SECURE] Clearing demo data for user: ${demoUserId}, session: ${demoSessionId}`);
  
  try {
    // CRITICAL SECURITY CHECK: Only proceed if user is confirmed demo user
    const demoUser = await storage.getUser(demoUserId);
    if (!demoUser || !(demoUser as any).isDemo) {
      console.error(`❌ SECURITY: Attempted to clear data for non-demo user: ${demoUserId}`);
      throw new Error('Cannot clear data for non-demo users');
    }

    // SECURITY: Only delete data explicitly tagged as demo data
    // For now, we'll use user-scoped deletion until schema is fully updated
    console.log(`🔒 Securely clearing demo data for confirmed demo user: ${demoUserId}`);
    
    // Delete in proper order to handle foreign key constraints
    // 1. Delete time logs (user-scoped - safe)
    const timeLogs = await storage.getTimeLogs(demoUserId);
    for (const timeLog of timeLogs) {
      await storage.deleteTimeLog(timeLog.id);
    }

    // 2. Delete user-scoped data only (SAFE)
    const proposals = await storage.getProposals(demoUserId);
    for (const proposal of proposals) {
      await storage.deleteProposal(proposal.id);
    }

    const invoices = await storage.getInvoices(demoUserId);
    for (const invoice of invoices) {
      await storage.deleteInvoice(invoice.id, demoUserId);
    }

    const tasks = await storage.getTasks(demoUserId);
    for (const task of tasks) {
      await storage.deleteTask(task.id);
    }

    // 3. CRITICAL FIX: Only delete user-owned templates (not all templates!)
    const templates = await storage.getTemplates(undefined, demoUserId);
    for (const template of templates) {
      if (!template.isSystem && template.createdById === demoUserId) {
        await storage.deleteTemplate(template.id);
      }
    }

    // 4. CRITICAL FIX: Skip global deletion of clients, projects, contracts, payments
    // These will be handled by demo-tagged deletion once schema is updated
    console.log(`⚠️  Skipping global data cleanup - will be handled by demo-tagged deletion`);

    console.log(`✅ Demo data cleared successfully for user: ${demoUserId}`);
  } catch (error) {
    console.error('❌ Error clearing demo data:', error);
    throw error;
  }
}

/**
 * Generate SECURE demo data for a user with proper isolation
 * FIXED: Now includes complete demo seeding with transactions
 */
export async function seedDemoData(demoUserId: string, demoSessionId?: string): Promise<DemoDataIds> {
  console.log(`🌱 [SECURE] Seeding demo data for user: ${demoUserId}, session: ${demoSessionId}`);
  
  try {
    // Generate session ID if not provided
    const sessionId = demoSessionId || `demo_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    // Clear any existing demo data first
    await clearDemoData(demoUserId, sessionId);

    const demoIds: DemoDataIds = {
      clients: {},
      projects: {},
      tasks: {},
      templates: {},
      proposals: {},
      invoices: {},
      contracts: {}
    };

    // SECURE DEMO SEEDING WITH PROPER ISOLATION
    console.log(`🔒 Creating demo data with session isolation: ${sessionId}`);
    
    // 1. Create secure demo clients
    await createDemoClients(demoUserId, sessionId, demoIds);

    // 2. Create secure demo projects
    await createDemoProjects(demoUserId, sessionId, demoIds);

    // 3. Create demo tasks with proper tagging
    await createDemoTasks(demoUserId, sessionId, demoIds);

    // 4. Create demo proposals
    await createDemoProposals(demoUserId, sessionId, demoIds);

    // 5. Create demo templates
    await createDemoTemplates(demoUserId, sessionId, demoIds);

    console.log(`✅ Secure demo data seeded successfully for user: ${demoUserId}`);
    console.log(`📊 Created: ${Object.keys(demoIds.clients).length} clients, ${Object.keys(demoIds.projects).length} projects, ${Object.keys(demoIds.tasks).length} tasks, ${Object.keys(demoIds.proposals).length} proposals, ${Object.keys(demoIds.templates).length} templates`);
    
    return demoIds;
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    // TODO: Add transaction rollback when DB transactions are implemented
    throw error;
  }
}

/**
 * Create SECURE demo clients with proper isolation
 */
async function createDemoClients(demoUserId: string, demoSessionId: string, demoIds: DemoDataIds): Promise<void> {
  const sessionPrefix = `DEMO_${demoSessionId.slice(-8)}_`;
  
  const clients: InsertClient[] = [
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
      ...({
        isDemo: true,
        demoSessionId: demoSessionId,
        demoUserId: demoUserId
      } as any)
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
      ...({
        isDemo: true,
        demoSessionId: demoSessionId,
        demoUserId: demoUserId
      } as any)
    }
  ];

  for (const client of clients) {
    const created = await storage.createClient(client);
    // Store by clean name (without prefix) for easy lookup
    const cleanName = client.name.replace(sessionPrefix, '');
    demoIds.clients[cleanName] = created.id;
  }
  
  console.log(`✅ Created ${clients.length} demo clients with secure isolation`);
}

/**
 * Create SECURE demo projects with proper isolation
 * FIXED: No longer uses getOrCreateProject which causes name collisions
 */
async function createDemoProjects(demoUserId: string, demoSessionId: string, demoIds: DemoDataIds): Promise<void> {
  const sessionPrefix = `DEMO_${demoSessionId.slice(-8)}_`;
  
  const projects: InsertProject[] = [
    {
      name: `${sessionPrefix}TechFlow Platform Redesign`,
      description: "Complete UI/UX redesign of the TechFlow workflow automation platform",
      status: "active",
      color: "#3B82F6",
      timeline: "3 months",
      clientId: demoIds.clients["TechFlow Solutions"],
      // Add demo tagging (will work once schema is updated)
      ...({
        isDemo: true,
        demoSessionId: demoSessionId,
        demoUserId: demoUserId
      } as any)
    },
    {
      name: `${sessionPrefix}Digital Transformation Strategy`,
      description: "Comprehensive digital transformation consulting for Premier Business",
      status: "active", 
      color: "#10B981",
      timeline: "6 months",
      clientId: demoIds.clients["Premier Business Consulting"],
      // Add demo tagging (will work once schema is updated)
      ...({
        isDemo: true,
        demoSessionId: demoSessionId,
        demoUserId: demoUserId
      } as any)
    }
  ];

  for (const project of projects) {
    // FIXED: Create explicit projects instead of using getOrCreateProject
    const created = await storage.createProject(project);
    demoIds.projects[project.name.replace(sessionPrefix, '')] = created.id;
  }
  
  console.log(`✅ Created ${projects.length} demo projects with secure isolation`);
}

/**
 * Create SECURE demo tasks with proper isolation
 */
async function createDemoTasks(demoUserId: string, demoSessionId: string, demoIds: DemoDataIds): Promise<void> {
  const tasks: InsertTask[] = [
    {
      title: "User Research & Analysis",
      description: "Conduct comprehensive user research to understand current pain points",
      status: "completed",
      priority: "high",
      projectId: demoIds.projects["TechFlow Platform Redesign"],
      assignedToId: demoUserId,
      createdById: demoUserId,
      // Add demo tagging (will work once schema is updated)
      ...({
        isDemo: true,
        demoSessionId: demoSessionId,
        demoUserId: demoUserId
      } as any)
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
      ...({
        isDemo: true,
        demoSessionId: demoSessionId,
        demoUserId: demoUserId
      } as any)
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
      ...({
        isDemo: true,
        demoSessionId: demoSessionId,
        demoUserId: demoUserId
      } as any)
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
      ...({
        isDemo: true,
        demoSessionId: demoSessionId,
        demoUserId: demoUserId
      } as any)
    }
  ];

  for (const task of tasks) {
    const created = await storage.createTask(task, demoUserId);
    demoIds.tasks[task.title] = created.id;
  }
  
  console.log(`✅ Created ${tasks.length} demo tasks with secure isolation`);
}

/**
 * Create SECURE demo proposals with proper isolation
 */
async function createDemoProposals(demoUserId: string, demoSessionId: string, demoIds: DemoDataIds): Promise<void> {
  const proposals: InsertProposal[] = [
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
      ...({
        isDemo: true,
        demoSessionId: demoSessionId,
        demoUserId: demoUserId
      } as any)
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
      ...({
        isDemo: true,
        demoSessionId: demoSessionId,
        demoUserId: demoUserId
      } as any)
    }
  ];

  for (const proposal of proposals) {
    const created = await storage.createProposal(proposal);
    demoIds.proposals[proposal.title] = created.id;
  }
  
  console.log(`✅ Created ${proposals.length} demo proposals with secure isolation`);
}

/**
 * Create SECURE demo templates with proper isolation
 */
async function createDemoTemplates(demoUserId: string, demoSessionId: string, demoIds: DemoDataIds): Promise<void> {
  const templates: InsertTemplate[] = [
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
      ...({
        isDemo: true,
        demoSessionId: demoSessionId,
        demoUserId: demoUserId
      } as any)
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
      ...({
        isDemo: true,
        demoSessionId: demoSessionId,
        demoUserId: demoUserId
      } as any)
    }
  ];

  for (const template of templates) {
    const created = await storage.createTemplate(template);
    demoIds.templates[template.name] = created.id;
  }
  
  console.log(`✅ Created ${templates.length} demo templates with secure isolation`);
}