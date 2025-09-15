import { storage } from "./storage";
import type { 
  InsertClient, InsertProject, InsertTask, InsertTemplate, 
  InsertProposal, InsertInvoice, InsertContract, InsertTimeLog, 
  InsertPayment, LineItem 
} from "@shared/schema";

/**
 * Comprehensive Demo Data Seeding Service for Gigster Garage
 * 
 * This service creates realistic sample data that showcases all platform capabilities:
 * - Multiple client types (tech startup, consulting firm, small business, creative agency)
 * - Various project types with different statuses and complexities
 * - Comprehensive task management with subtasks, dependencies, and realistic workflows
 * - Professional business documents (proposals, invoices, contracts)
 * - Time tracking data with realistic work patterns
 * - Pre-built templates for common business scenarios
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
 * Clear all demo data for a specific user
 */
export async function clearDemoData(demoUserId: string): Promise<void> {
  console.log(`🧹 Clearing demo data for user: ${demoUserId}`);
  
  try {
    // Delete in proper order to handle foreign key constraints
    // 1. Delete time logs first
    const timeLogs = await storage.getTimeLogs(demoUserId);
    for (const timeLog of timeLogs) {
      await storage.deleteTimeLog(timeLog.id);
    }

    // 2. Delete payments
    const payments = await storage.getPayments();
    for (const payment of payments) {
      await storage.deletePayment(payment.id);
    }

    // 3. Delete proposals, invoices, contracts
    const proposals = await storage.getProposals(demoUserId);
    for (const proposal of proposals) {
      await storage.deleteProposal(proposal.id);
    }

    const invoices = await storage.getInvoices(demoUserId);
    for (const invoice of invoices) {
      await storage.deleteInvoice(invoice.id, demoUserId);
    }

    const contracts = await storage.getContracts();
    for (const contract of contracts) {
      await storage.deleteContract(contract.id);
    }

    // 4. Delete tasks (including subtasks and dependencies)
    const tasks = await storage.getTasks(demoUserId);
    for (const task of tasks) {
      await storage.deleteTask(task.id);
    }

    // 5. Delete projects
    const projects = await storage.getProjects();
    for (const project of projects) {
      const projectTasks = await storage.getTasksByProject(project.id);
      if (projectTasks.length === 0) {
        // Only delete if no remaining tasks
        await storage.updateProject(project.id, { status: "cancelled" });
      }
    }

    // 6. Delete clients and templates
    const clients = await storage.getClients();
    for (const client of clients) {
      await storage.deleteClient(client.id);
    }

    const templates = await storage.getTemplates(undefined, demoUserId);
    for (const template of templates) {
      if (!template.isSystem) {
        await storage.deleteTemplate(template.id);
      }
    }

    console.log(`✅ Demo data cleared successfully for user: ${demoUserId}`);
  } catch (error) {
    console.error('❌ Error clearing demo data:', error);
    throw error;
  }
}

/**
 * Generate comprehensive demo data for a user
 */
export async function seedDemoData(demoUserId: string): Promise<DemoDataIds> {
  console.log(`🌱 Seeding demo data for user: ${demoUserId}`);
  
  try {
    // Clear any existing demo data first
    await clearDemoData(demoUserId);

    const demoIds: DemoDataIds = {
      clients: {},
      projects: {},
      tasks: {},
      templates: {},
      proposals: {},
      invoices: {},
      contracts: {}
    };

    // 1. Create demo templates first (needed for proposals/documents)
    await createDemoTemplates(demoUserId, demoIds);

    // 2. Create demo clients
    await createDemoClients(demoIds);

    // 3. Create demo projects
    await createDemoProjects(demoIds);

    // 4. Create demo tasks with relationships
    await createDemoTasks(demoUserId, demoIds);

    // 5. Create demo business documents
    await createDemoProposals(demoUserId, demoIds);
    await createDemoInvoices(demoUserId, demoIds);
    await createDemoContracts(demoUserId, demoIds);

    // 6. Create demo time tracking data
    await createDemoTimeLogs(demoUserId, demoIds);

    // 7. Create demo payments
    await createDemoPayments(demoIds);

    console.log(`✅ Demo data seeded successfully for user: ${demoUserId}`);
    console.log(`📊 Created: ${Object.keys(demoIds.clients).length} clients, ${Object.keys(demoIds.projects).length} projects, ${Object.keys(demoIds.tasks).length} tasks`);
    
    return demoIds;
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  }
}

/**
 * Create demo templates for various document types
 */
async function createDemoTemplates(demoUserId: string, demoIds: DemoDataIds): Promise<void> {
  const templates: InsertTemplate[] = [
    // Proposal Templates
    {
      name: "Web Development Proposal",
      description: "Professional proposal template for web development projects",
      type: "proposal",
      content: `# Web Development Proposal

Dear {{clientName}},

Thank you for considering Gigster Garage for your web development project. We're excited to help bring your vision to life.

## Project Overview
{{projectDescription}}

## Scope of Work
- Custom website design and development
- Responsive mobile-friendly layout
- Content management system integration
- SEO optimization
- Performance optimization
- Testing and quality assurance

## Timeline
Project Duration: {{timeline}}

## Investment
Total Project Cost: ${{totalBudget}}

## Next Steps
Upon approval, we'll begin work immediately and keep you updated throughout the development process.

We look forward to working with you!

Best regards,
The Gigster Garage Team`,
      variables: [
        { name: "clientName", label: "Client Name", type: "text", required: true },
        { name: "projectDescription", label: "Project Description", type: "textarea", required: true },
        { name: "totalBudget", label: "Total Budget", type: "number", required: true },
        { name: "timeline", label: "Project Timeline", type: "text", required: true }
      ],
      isSystem: false,
      isPublic: true,
      tags: ["web development", "proposal", "professional"],
      createdById: demoUserId
    },
    {
      name: "Consulting Services Proposal",
      description: "Template for consulting and advisory services",
      type: "proposal",
      content: `# Business Consulting Proposal

Dear {{clientName}},

We appreciate the opportunity to present our consulting services for {{projectDescription}}.

## Our Approach
- Initial assessment and analysis
- Strategic planning and recommendations
- Implementation support
- Ongoing monitoring and optimization

## Deliverables
{{deliverables}}

## Investment
{{totalBudget}} over {{timeline}}

## Why Choose Us
- 10+ years of industry experience
- Proven track record of success
- Customized solutions for your business

Looking forward to partnering with you.

Best regards,
Consulting Team`,
      variables: [
        { name: "clientName", label: "Client Name", type: "text", required: true },
        { name: "projectDescription", label: "Project Description", type: "textarea", required: true },
        { name: "deliverables", label: "Deliverables", type: "textarea", required: true },
        { name: "totalBudget", label: "Total Budget", type: "text", required: true },
        { name: "timeline", label: "Timeline", type: "text", required: true }
      ],
      isSystem: false,
      isPublic: true,
      tags: ["consulting", "proposal", "business"],
      createdById: demoUserId
    },

    // Invoice Templates
    {
      name: "Professional Service Invoice",
      description: "Standard invoice template for professional services",
      type: "invoice",
      content: `# Invoice #{{invoiceNumber}}

**Bill To:**
{{clientName}}
{{clientAddress}}

**Invoice Date:** {{invoiceDate}}
**Due Date:** {{dueDate}}

## Services Provided
{{lineItems}}

**Subtotal:** ${{subtotal}}
**Tax ({{taxRate}}%):** ${{taxAmount}}
**Total Amount:** ${{totalAmount}}

Thank you for your business!`,
      variables: [
        { name: "invoiceNumber", label: "Invoice Number", type: "text", required: true },
        { name: "clientName", label: "Client Name", type: "text", required: true },
        { name: "clientAddress", label: "Client Address", type: "textarea", required: false },
        { name: "invoiceDate", label: "Invoice Date", type: "date", required: true },
        { name: "dueDate", label: "Due Date", type: "date", required: true },
        { name: "lineItems", label: "Line Items", type: "line_items", required: true },
        { name: "subtotal", label: "Subtotal", type: "number", required: true },
        { name: "taxRate", label: "Tax Rate", type: "number", required: false },
        { name: "taxAmount", label: "Tax Amount", type: "number", required: false },
        { name: "totalAmount", label: "Total Amount", type: "number", required: true }
      ],
      isSystem: false,
      isPublic: true,
      tags: ["invoice", "billing", "professional"],
      createdById: demoUserId
    },

    // Contract Templates
    {
      name: "Service Agreement Contract",
      description: "Standard service agreement for client projects",
      type: "contract",
      content: `# Service Agreement

This Service Agreement ("Agreement") is entered into on {{effectiveDate}} between Gigster Garage and {{clientName}}.

## Scope of Services
{{serviceDescription}}

## Payment Terms
{{paymentTerms}}

## Contract Duration
This agreement is effective from {{effectiveDate}} to {{expirationDate}}.

## Terms and Conditions
1. Both parties agree to maintain confidentiality
2. Work will be performed professionally and on time
3. Payment terms as outlined above must be adhered to
4. Either party may terminate with 30 days written notice

By signing below, both parties agree to the terms of this contract.`,
      variables: [
        { name: "clientName", label: "Client Name", type: "text", required: true },
        { name: "serviceDescription", label: "Service Description", type: "textarea", required: true },
        { name: "paymentTerms", label: "Payment Terms", type: "textarea", required: true },
        { name: "effectiveDate", label: "Effective Date", type: "date", required: true },
        { name: "expirationDate", label: "Expiration Date", type: "date", required: true }
      ],
      isSystem: false,
      isPublic: true,
      tags: ["contract", "service agreement", "legal"],
      createdById: demoUserId
    },

    // Email Templates
    {
      name: "Project Kickoff Email",
      description: "Email template for starting new projects",
      type: "email",
      content: `Subject: Welcome to Your Project - Let's Get Started!

Hi {{clientName}},

Welcome to Gigster Garage! We're thrilled to start working on {{projectName}} with you.

## What's Next:
1. Project kickoff meeting scheduled for {{kickoffDate}}
2. We'll send you regular updates every {{updateFrequency}}
3. Your dedicated project manager is {{projectManager}}

## How to Reach Us:
- Email: support@gigstergarage.com
- Phone: (555) 123-4567
- Project Portal: [Your Dashboard Link]

We're excited to bring your vision to life!

Best regards,
The Gigster Garage Team`,
      variables: [
        { name: "clientName", label: "Client Name", type: "text", required: true },
        { name: "projectName", label: "Project Name", type: "text", required: true },
        { name: "kickoffDate", label: "Kickoff Date", type: "date", required: true },
        { name: "updateFrequency", label: "Update Frequency", type: "text", required: true },
        { name: "projectManager", label: "Project Manager", type: "text", required: true }
      ],
      isSystem: false,
      isPublic: true,
      tags: ["email", "kickoff", "welcome"],
      createdById: demoUserId
    }
  ];

  for (const template of templates) {
    const created = await storage.createTemplate(template);
    demoIds.templates[template.name] = created.id;
  }
}

/**
 * Create demo clients representing different business types
 */
async function createDemoClients(demoIds: DemoDataIds): Promise<void> {
  const clients: InsertClient[] = [
    {
      name: "TechFlow Solutions",
      email: "contact@techflowsolutions.com",
      phone: "(555) 123-4567",
      company: "TechFlow Solutions Inc.",
      address: "1200 Innovation Drive, Suite 300\nSan Francisco, CA 94107",
      website: "https://techflowsolutions.com",
      notes: "Fast-growing SaaS startup focused on workflow automation. Looking to scale their platform and expand their development team. Great client - pays on time and provides clear requirements.",
      status: "active",
      totalProposals: 3,
      totalInvoices: 5,
      totalRevenue: "45000.00",
      outstandingBalance: "0.00"
    },
    {
      name: "Premier Business Consulting",
      email: "hello@premierbiz.com",
      phone: "(555) 987-6543",
      company: "Premier Business Consulting LLC",
      address: "789 Executive Blvd\nNew York, NY 10001",
      website: "https://premierbiz.com",
      notes: "Established consulting firm helping mid-market companies with digital transformation. They appreciate detailed proposals and comprehensive project planning.",
      status: "active",
      totalProposals: 2,
      totalInvoices: 4,
      totalRevenue: "32000.00",
      outstandingBalance: "5000.00"
    },
    {
      name: "Artisan Coffee Co.",
      email: "info@artisancoffee.co",
      phone: "(555) 456-7890",
      company: "Artisan Coffee Co.",
      address: "45 Main Street\nPortland, OR 97205",
      website: "https://artisancoffee.co",
      notes: "Local coffee shop chain looking to expand online presence. Small budget but great for building portfolio. Very collaborative and responsive to feedback.",
      status: "active",
      totalProposals: 2,
      totalInvoices: 3,
      totalRevenue: "8500.00",
      outstandingBalance: "0.00"
    },
    {
      name: "Creative Minds Agency",
      email: "projects@creativeminds.agency",
      phone: "(555) 321-9876",
      company: "Creative Minds Agency",
      address: "567 Design District\nAustin, TX 78701",
      website: "https://creativeminds.agency",
      notes: "Full-service creative agency specializing in brand development and marketing campaigns. They often need technical implementation support for their creative concepts.",
      status: "prospect",
      totalProposals: 1,
      totalInvoices: 0,
      totalRevenue: "0.00",
      outstandingBalance: "0.00"
    }
  ];

  for (const client of clients) {
    const created = await storage.createClient(client);
    demoIds.clients[client.name] = created.id;
  }
}

/**
 * Create demo projects across different clients
 */
async function createDemoProjects(demoIds: DemoDataIds): Promise<void> {
  const projects: InsertProject[] = [
    {
      name: "TechFlow Platform Redesign",
      description: "Complete UI/UX redesign of the TechFlow workflow automation platform. Modernizing the interface to improve user experience and increase customer engagement.",
      status: "active",
      color: "#3B82F6",
      timeline: "3 months",
      clientId: demoIds.clients["TechFlow Solutions"]
    },
    {
      name: "API Integration & Documentation",
      description: "Develop comprehensive API documentation and create integrations with popular third-party tools for TechFlow's platform.",
      status: "completed",
      color: "#10B981",
      timeline: "6 weeks",
      clientId: demoIds.clients["TechFlow Solutions"]
    },
    {
      name: "Digital Transformation Strategy",
      description: "Comprehensive digital transformation consulting for Premier Business Consulting's internal operations and client delivery processes.",
      status: "active",
      color: "#8B5CF6",
      timeline: "4 months",
      clientId: demoIds.clients["Premier Business Consulting"]
    },
    {
      name: "E-commerce Website Development",
      description: "Build a modern e-commerce platform for Artisan Coffee Co. to sell their premium coffee blends online with subscription management.",
      status: "on-hold",
      color: "#F59E0B",
      timeline: "8 weeks",
      clientId: demoIds.clients["Artisan Coffee Co."]
    },
    {
      name: "Brand Identity & Website",
      description: "Develop complete brand identity and responsive website for Creative Minds Agency's new service offering.",
      status: "active",
      color: "#EF4444",
      timeline: "10 weeks",
      clientId: demoIds.clients["Creative Minds Agency"]
    }
  ];

  for (const project of projects) {
    const created = await storage.createProject(project);
    demoIds.projects[project.name] = created.id;
  }
}

/**
 * Create comprehensive demo tasks with realistic workflows
 */
async function createDemoTasks(demoUserId: string, demoIds: DemoDataIds): Promise<void> {
  const tasks: (InsertTask & { projectName: string; parentTaskName?: string })[] = [
    // TechFlow Platform Redesign Tasks
    {
      title: "User Research & Analysis",
      description: "Conduct comprehensive user research including interviews, surveys, and usability testing of the current platform.",
      status: "completed",
      priority: "high",
      dueDate: new Date('2025-08-15'),
      completed: true,
      completedAt: new Date('2025-08-10'),
      assignedToId: demoUserId,
      createdById: demoUserId,
      notes: "Interviewed 25 users, identified key pain points in navigation and workflow efficiency.",
      estimatedHours: 40,
      actualHours: 35,
      projectName: "TechFlow Platform Redesign",
      progress: [
        { date: "2025-08-05", comment: "Started user interviews - 10 completed" },
        { date: "2025-08-08", comment: "Completed all interviews, analyzing feedback" },
        { date: "2025-08-10", comment: "Research analysis complete, ready for design phase" }
      ]
    },
    {
      title: "Wireframe Development",
      description: "Create detailed wireframes for all platform screens based on user research findings.",
      status: "completed",
      priority: "high",
      dueDate: new Date('2025-08-25'),
      completed: true,
      completedAt: new Date('2025-08-22'),
      assignedToId: demoUserId,
      createdById: demoUserId,
      notes: "Wireframes approved by client with minor revisions requested.",
      estimatedHours: 30,
      actualHours: 32,
      projectName: "TechFlow Platform Redesign",
      progress: [
        { date: "2025-08-15", comment: "Started wireframe development for dashboard" },
        { date: "2025-08-20", comment: "Main workflows wireframed, pending client review" },
        { date: "2025-08-22", comment: "All wireframes approved, moving to visual design" }
      ]
    },
    {
      title: "Visual Design System",
      description: "Develop comprehensive design system including colors, typography, components, and UI patterns.",
      status: "active",
      priority: "high",
      dueDate: new Date('2025-09-20'),
      assignedToId: demoUserId,
      createdById: demoUserId,
      notes: "Design system 70% complete. Working on component library documentation.",
      estimatedHours: 45,
      actualHours: 28,
      projectName: "TechFlow Platform Redesign",
      progress: [
        { date: "2025-08-25", comment: "Started with color palette and typography selection" },
        { date: "2025-09-05", comment: "Core components designed, building pattern library" },
        { date: "2025-09-15", comment: "Component library 70% complete, documentation in progress" }
      ]
    },
    {
      title: "Responsive Layout Implementation",
      description: "Implement responsive layouts for mobile and tablet devices.",
      status: "pending",
      priority: "medium",
      dueDate: new Date('2025-10-01'),
      assignedToId: demoUserId,
      createdById: demoUserId,
      notes: "Waiting for design system completion before starting implementation.",
      estimatedHours: 35,
      projectName: "TechFlow Platform Redesign"
    },

    // API Integration & Documentation Tasks (Completed Project)
    {
      title: "API Endpoint Documentation",
      description: "Document all existing API endpoints with examples and response schemas.",
      status: "completed",
      priority: "high",
      dueDate: new Date('2025-07-15'),
      completed: true,
      completedAt: new Date('2025-07-12'),
      assignedToId: demoUserId,
      createdById: demoUserId,
      notes: "Complete API documentation with interactive examples published.",
      estimatedHours: 25,
      actualHours: 28,
      projectName: "API Integration & Documentation"
    },
    {
      title: "Slack Integration Development",
      description: "Build integration with Slack for workflow notifications and team collaboration.",
      status: "completed",
      priority: "medium",
      dueDate: new Date('2025-08-01'),
      completed: true,
      completedAt: new Date('2025-07-28'),
      assignedToId: demoUserId,
      createdById: demoUserId,
      notes: "Slack integration live and being used by 5 client teams.",
      estimatedHours: 20,
      actualHours: 18,
      projectName: "API Integration & Documentation"
    },

    // Digital Transformation Strategy Tasks
    {
      title: "Current State Assessment",
      description: "Analyze existing business processes, technology stack, and operational efficiency.",
      status: "completed",
      priority: "high",
      dueDate: new Date('2025-08-30'),
      completed: true,
      completedAt: new Date('2025-08-25'),
      assignedToId: demoUserId,
      createdById: demoUserId,
      notes: "Identified 12 key areas for improvement and potential cost savings of 25%.",
      estimatedHours: 50,
      actualHours: 48,
      projectName: "Digital Transformation Strategy"
    },
    {
      title: "Technology Roadmap Planning",
      description: "Create detailed technology roadmap with implementation phases and timelines.",
      status: "active",
      priority: "high",
      dueDate: new Date('2025-09-25'),
      assignedToId: demoUserId,
      createdById: demoUserId,
      notes: "Roadmap 60% complete. Finalizing phase 2 and 3 recommendations.",
      estimatedHours: 35,
      actualHours: 22,
      projectName: "Digital Transformation Strategy"
    },
    {
      title: "Staff Training Program Design",
      description: "Design comprehensive training program for new digital tools and processes.",
      status: "pending",
      priority: "medium",
      dueDate: new Date('2025-10-15'),
      assignedToId: demoUserId,
      createdById: demoUserId,
      notes: "Waiting for technology roadmap completion to finalize training requirements.",
      estimatedHours: 30,
      projectName: "Digital Transformation Strategy"
    },

    // E-commerce Website Development Tasks (On Hold)
    {
      title: "Requirements Gathering",
      description: "Define technical requirements for e-commerce platform including payment processing and inventory management.",
      status: "completed",
      priority: "high",
      dueDate: new Date('2025-08-20'),
      completed: true,
      completedAt: new Date('2025-08-18'),
      assignedToId: demoUserId,
      createdById: demoUserId,
      notes: "Requirements documented. Project on hold due to client budget constraints.",
      estimatedHours: 15,
      actualHours: 16,
      projectName: "E-commerce Website Development"
    },
    {
      title: "Platform Architecture Design",
      description: "Design scalable architecture for e-commerce platform with subscription management.",
      status: "active",
      priority: "medium",
      dueDate: new Date('2025-09-30'),
      assignedToId: demoUserId,
      createdById: demoUserId,
      notes: "Architecture 40% complete. Project currently paused pending client approval.",
      estimatedHours: 25,
      actualHours: 10,
      projectName: "E-commerce Website Development"
    },

    // Brand Identity & Website Tasks
    {
      title: "Brand Discovery Workshop",
      description: "Facilitate brand discovery workshop to define brand values, personality, and positioning.",
      status: "completed",
      priority: "high",
      dueDate: new Date('2025-09-05'),
      completed: true,
      completedAt: new Date('2025-09-03'),
      assignedToId: demoUserId,
      createdById: demoUserId,
      notes: "Excellent workshop session. Clear brand direction established.",
      estimatedHours: 8,
      actualHours: 7,
      projectName: "Brand Identity & Website"
    },
    {
      title: "Logo Design & Brand Guidelines",
      description: "Create distinctive logo and comprehensive brand guidelines including color palette and typography.",
      status: "active",
      priority: "high",
      dueDate: new Date('2025-09-25'),
      assignedToId: demoUserId,
      createdById: demoUserId,
      notes: "3 logo concepts presented. Client feedback incorporated, finalizing preferred direction.",
      estimatedHours: 20,
      actualHours: 14,
      projectName: "Brand Identity & Website",
      progress: [
        { date: "2025-09-08", comment: "Initial logo concepts in development" },
        { date: "2025-09-15", comment: "Presented 3 concepts to client, positive feedback" },
        { date: "2025-09-18", comment: "Refining preferred concept based on client input" }
      ]
    },
    {
      title: "Website Content Strategy",
      description: "Develop content strategy and sitemap for new website.",
      status: "pending",
      priority: "medium",
      dueDate: new Date('2025-10-05'),
      assignedToId: demoUserId,
      createdById: demoUserId,
      notes: "Awaiting brand guidelines completion to ensure content aligns with brand voice.",
      estimatedHours: 15,
      projectName: "Brand Identity & Website"
    },

    // Subtask Examples
    {
      title: "Color Palette Selection",
      description: "Research and select primary and secondary color palettes that align with brand personality.",
      status: "completed",
      priority: "medium",
      dueDate: new Date('2025-09-12'),
      completed: true,
      completedAt: new Date('2025-09-10'),
      assignedToId: demoUserId,
      createdById: demoUserId,
      notes: "Selected vibrant, professional palette that reflects innovation and trust.",
      estimatedHours: 6,
      actualHours: 5,
      projectName: "TechFlow Platform Redesign",
      parentTaskName: "Visual Design System"
    },
    {
      title: "Typography System",
      description: "Select and implement typography hierarchy for all interface elements.",
      status: "completed",
      priority: "medium",
      dueDate: new Date('2025-09-14'),
      completed: true,
      completedAt: new Date('2025-09-13'),
      assignedToId: demoUserId,
      createdById: demoUserId,
      notes: "Implemented modern, readable font system with clear hierarchy.",
      estimatedHours: 4,
      actualHours: 4,
      projectName: "TechFlow Platform Redesign",
      parentTaskName: "Visual Design System"
    },
    {
      title: "Component Library",
      description: "Build reusable component library for buttons, forms, cards, and navigation elements.",
      status: "active",
      priority: "high",
      dueDate: new Date('2025-09-20'),
      assignedToId: demoUserId,
      createdById: demoUserId,
      notes: "75% of components completed. Working on advanced form elements.",
      estimatedHours: 25,
      actualHours: 19,
      projectName: "TechFlow Platform Redesign",
      parentTaskName: "Visual Design System"
    }
  ];

  // Create tasks and track parent/child relationships
  const parentTaskIds: Record<string, string> = {};

  for (const task of tasks) {
    const { projectName, parentTaskName, ...taskData } = task;
    taskData.projectId = demoIds.projects[projectName];

    // If this is a subtask, set the parent task ID
    if (parentTaskName && parentTaskIds[parentTaskName]) {
      taskData.parentTaskId = parentTaskIds[parentTaskName];
    }

    const created = await storage.createTask(taskData, demoUserId);
    demoIds.tasks[task.title] = created.id;

    // Store task ID for potential child tasks
    if (!parentTaskName) {
      parentTaskIds[task.title] = created.id;
    }
  }

  // Create task dependencies
  const dependencies = [
    { dependent: "Wireframe Development", dependsOn: "User Research & Analysis" },
    { dependent: "Visual Design System", dependsOn: "Wireframe Development" },
    { dependent: "Responsive Layout Implementation", dependsOn: "Visual Design System" },
    { dependent: "Technology Roadmap Planning", dependsOn: "Current State Assessment" },
    { dependent: "Staff Training Program Design", dependsOn: "Technology Roadmap Planning" },
    { dependent: "Logo Design & Brand Guidelines", dependsOn: "Brand Discovery Workshop" },
    { dependent: "Website Content Strategy", dependsOn: "Logo Design & Brand Guidelines" }
  ];

  for (const dep of dependencies) {
    if (demoIds.tasks[dep.dependent] && demoIds.tasks[dep.dependsOn]) {
      await storage.createTaskDependency({
        dependentTaskId: demoIds.tasks[dep.dependent],
        dependsOnTaskId: demoIds.tasks[dep.dependsOn]
      });
    }
  }
}

/**
 * Create demo proposals showcasing different statuses and use cases
 */
async function createDemoProposals(demoUserId: string, demoIds: DemoDataIds): Promise<void> {
  const proposals: InsertProposal[] = [
    {
      title: "TechFlow Platform Redesign Proposal",
      templateId: demoIds.templates["Web Development Proposal"],
      projectId: demoIds.projects["TechFlow Platform Redesign"],
      clientId: demoIds.clients["TechFlow Solutions"],
      clientName: "TechFlow Solutions",
      clientEmail: "contact@techflowsolutions.com",
      status: "accepted",
      content: `# TechFlow Platform Redesign Proposal

Dear TechFlow Solutions Team,

Thank you for considering Gigster Garage for your platform redesign project. We're excited to help modernize your workflow automation platform.

## Project Overview
Complete UI/UX redesign of the TechFlow workflow automation platform to improve user experience and increase customer engagement.

## Scope of Work
- Comprehensive user research and analysis
- Modern wireframe development
- Visual design system creation
- Responsive layout implementation
- Usability testing and optimization

## Timeline
Project Duration: 3 months

## Investment
Total Project Cost: $35,000

## Next Steps
Upon approval, we'll begin with user research and maintain weekly progress updates.

We look forward to working with you!

Best regards,
The Gigster Garage Team`,
      variables: {
        clientName: "TechFlow Solutions",
        projectDescription: "Complete UI/UX redesign of the TechFlow workflow automation platform",
        totalBudget: 35000,
        timeline: "3 months"
      },
      projectDescription: "Complete UI/UX redesign of the TechFlow workflow automation platform to improve user experience and increase customer engagement.",
      totalBudget: "35000.00",
      timeline: "3 months",
      deliverables: "User research report, wireframes, design system, responsive layouts, usability testing results",
      terms: "Payment in 3 installments: 40% upfront, 40% at midpoint, 20% on completion",
      lineItems: [
        { id: 1, description: "User Research & Analysis", quantity: 1, rate: 8000, amount: 8000 },
        { id: 2, description: "Wireframe Development", quantity: 1, rate: 7000, amount: 7000 },
        { id: 3, description: "Visual Design System", quantity: 1, rate: 12000, amount: 12000 },
        { id: 4, description: "Responsive Implementation", quantity: 1, rate: 8000, amount: 8000 }
      ],
      calculatedTotal: "35000.00",
      expiresInDays: 30,
      expirationDate: "2025-10-15",
      sentAt: new Date('2025-07-15'),
      viewedAt: new Date('2025-07-16'),
      respondedAt: new Date('2025-07-20'),
      acceptedAt: new Date('2025-07-20'),
      responseMessage: "Proposal looks great! Let's move forward with the project.",
      shareableLink: `proposal-techflow-${Date.now()}`,
      version: 1,
      createdById: demoUserId,
      metadata: { clientType: "tech_startup", projectSize: "large" }
    },
    {
      title: "Digital Transformation Consulting Proposal",
      templateId: demoIds.templates["Consulting Services Proposal"],
      projectId: demoIds.projects["Digital Transformation Strategy"],
      clientId: demoIds.clients["Premier Business Consulting"],
      clientName: "Premier Business Consulting",
      clientEmail: "hello@premierbiz.com",
      status: "sent",
      content: `# Digital Transformation Consulting Proposal

Dear Premier Business Consulting Team,

We appreciate the opportunity to present our consulting services for your digital transformation initiative.

## Our Approach
- Comprehensive current state assessment
- Strategic technology roadmap development
- Implementation planning and support
- Staff training program design
- Ongoing optimization and monitoring

## Deliverables
- Current state analysis report
- Technology roadmap with implementation phases
- Training program curriculum
- Change management strategy
- 6-month implementation support

## Investment
$28,000 over 4 months

## Why Choose Us
- 10+ years of digital transformation experience
- Proven track record with consulting firms
- Customized solutions for your business model

Looking forward to partnering with you.

Best regards,
Gigster Garage Consulting Team`,
      variables: {
        clientName: "Premier Business Consulting",
        projectDescription: "Digital transformation consulting for internal operations and client delivery processes",
        deliverables: "Current state analysis, technology roadmap, training programs, implementation support",
        totalBudget: "$28,000",
        timeline: "4 months"
      },
      projectDescription: "Comprehensive digital transformation consulting for Premier Business Consulting's internal operations and client delivery processes.",
      totalBudget: "28000.00",
      timeline: "4 months",
      deliverables: "Current state analysis report, technology roadmap, training program curriculum, change management strategy",
      terms: "Payment in 4 monthly installments of $7,000",
      lineItems: [
        { id: 1, description: "Current State Assessment", quantity: 1, rate: 10000, amount: 10000 },
        { id: 2, description: "Technology Roadmap Development", quantity: 1, rate: 8000, amount: 8000 },
        { id: 3, description: "Training Program Design", quantity: 1, rate: 6000, amount: 6000 },
        { id: 4, description: "Implementation Support", quantity: 1, rate: 4000, amount: 4000 }
      ],
      calculatedTotal: "28000.00",
      expiresInDays: 30,
      expirationDate: "2025-10-20",
      sentAt: new Date('2025-08-20'),
      viewedAt: new Date('2025-08-22'),
      responseMessage: null,
      shareableLink: `proposal-premier-${Date.now()}`,
      version: 1,
      createdById: demoUserId,
      metadata: { clientType: "consulting_firm", projectSize: "medium" }
    },
    {
      title: "Creative Agency Brand Development",
      templateId: demoIds.templates["Web Development Proposal"],
      projectId: demoIds.projects["Brand Identity & Website"],
      clientId: demoIds.clients["Creative Minds Agency"],
      clientName: "Creative Minds Agency",
      clientEmail: "projects@creativeminds.agency",
      status: "draft",
      content: `# Brand Development & Website Proposal

Dear Creative Minds Agency,

We're excited to help develop your new brand identity and website.

## Project Overview
Complete brand development including logo design, brand guidelines, and responsive website.

## Scope of Work
- Brand discovery workshop
- Logo design and brand guidelines
- Website content strategy
- Responsive website development
- Brand asset creation

## Timeline
Project Duration: 10 weeks

## Investment
Total Project Cost: $18,500

## Next Steps
Let's schedule a discovery call to discuss your vision and requirements.

Best regards,
The Gigster Garage Team`,
      variables: {
        clientName: "Creative Minds Agency",
        projectDescription: "Complete brand development including logo design, brand guidelines, and responsive website",
        totalBudget: 18500,
        timeline: "10 weeks"
      },
      projectDescription: "Develop complete brand identity and responsive website for Creative Minds Agency's new service offering.",
      totalBudget: "18500.00",
      timeline: "10 weeks",
      deliverables: "Brand discovery report, logo designs, brand guidelines, website strategy, responsive website",
      terms: "50% upfront, 50% on completion",
      lineItems: [
        { id: 1, description: "Brand Discovery Workshop", quantity: 1, rate: 2500, amount: 2500 },
        { id: 2, description: "Logo Design & Guidelines", quantity: 1, rate: 6000, amount: 6000 },
        { id: 3, description: "Website Development", quantity: 1, rate: 10000, amount: 10000 }
      ],
      calculatedTotal: "18500.00",
      expiresInDays: 30,
      expirationDate: new Date('2025-10-25'),
      shareableLink: `proposal-creative-${Date.now()}`,
      version: 1,
      createdById: demoUserId,
      metadata: { clientType: "creative_agency", projectSize: "small" }
    }
  ];

  for (const proposal of proposals) {
    const created = await storage.createProposal(proposal);
    demoIds.proposals[proposal.title] = created.id;
  }
}

/**
 * Create demo invoices with various statuses
 */
async function createDemoInvoices(demoUserId: string, demoIds: DemoDataIds): Promise<void> {
  const invoices: InsertInvoice[] = [
    {
      invoiceNumber: "INV-2025-001",
      proposalId: demoIds.proposals["TechFlow Platform Redesign Proposal"],
      projectId: demoIds.projects["TechFlow Platform Redesign"],
      clientId: demoIds.clients["TechFlow Solutions"],
      clientName: "TechFlow Solutions Inc.",
      clientEmail: "billing@techflowsolutions.com",
      clientAddress: "1200 Innovation Drive, Suite 300\nSan Francisco, CA 94107",
      status: "paid",
      invoiceDate: "2025-08-01",
      dueDate: "2025-08-31",
      lineItems: [
        { id: 1, description: "User Research & Analysis", quantity: 1, rate: 8000, amount: 8000 },
        { id: 2, description: "Wireframe Development", quantity: 1, rate: 7000, amount: 7000 }
      ],
      subtotal: "15000.00",
      taxRate: "8.75",
      taxAmount: "1312.50",
      discountAmount: "0.00",
      totalAmount: "16312.50",
      depositRequired: "0.00",
      depositPaid: "0.00",
      amountPaid: "16312.50",
      balanceDue: "0.00",
      notes: "Thank you for your prompt payment!",
      createdById: demoUserId,
      sentAt: new Date('2025-08-01'),
      paidAt: new Date('2025-08-15')
    },
    {
      invoiceNumber: "INV-2025-002",
      projectId: demoIds.projects["Digital Transformation Strategy"],
      clientId: demoIds.clients["Premier Business Consulting"],
      clientName: "Premier Business Consulting LLC",
      clientEmail: "billing@premierbiz.com",
      clientAddress: "789 Executive Blvd\nNew York, NY 10001",
      status: "sent",
      invoiceDate: "2025-09-01",
      dueDate: "2025-09-30",
      lineItems: [
        { id: 1, description: "Current State Assessment", quantity: 1, rate: 10000, amount: 10000 }
      ],
      subtotal: "10000.00",
      taxRate: "8.25",
      taxAmount: "825.00",
      discountAmount: "500.00",
      totalAmount: "10325.00",
      depositRequired: "0.00",
      depositPaid: "0.00",
      amountPaid: "0.00",
      balanceDue: "10325.00",
      notes: "Early payment discount of $500 applied.",
      createdById: demoUserId,
      sentAt: new Date('2025-09-01')
    },
    {
      invoiceNumber: "INV-2025-003",
      projectId: demoIds.projects["E-commerce Website Development"],
      clientId: demoIds.clients["Artisan Coffee Co."],
      clientName: "Artisan Coffee Co.",
      clientEmail: "accounting@artisancoffee.co",
      clientAddress: "45 Main Street\nPortland, OR 97205",
      status: "overdue",
      invoiceDate: "2025-08-15",
      dueDate: "2025-09-14",
      lineItems: [
        { id: 1, description: "Requirements Gathering", quantity: 1, rate: 2500, amount: 2500 },
        { id: 2, description: "Platform Architecture Design", quantity: 0.4, rate: 5000, amount: 2000 }
      ],
      subtotal: "4500.00",
      taxRate: "0.00",
      taxAmount: "0.00",
      discountAmount: "0.00",
      totalAmount: "4500.00",
      depositRequired: "0.00",
      depositPaid: "0.00",
      amountPaid: "0.00",
      balanceDue: "4500.00",
      notes: "Payment overdue. Please contact us to discuss payment arrangements.",
      createdById: demoUserId,
      sentAt: new Date('2025-08-15')
    },
    {
      invoiceNumber: "INV-2025-004",
      projectId: demoIds.projects["TechFlow Platform Redesign"],
      clientId: demoIds.clients["TechFlow Solutions"],
      clientName: "TechFlow Solutions Inc.",
      clientEmail: "billing@techflowsolutions.com",
      clientAddress: "1200 Innovation Drive, Suite 300\nSan Francisco, CA 94107",
      status: "draft",
      invoiceDate: "2025-09-15",
      dueDate: "2025-10-15",
      lineItems: [
        { id: 1, description: "Visual Design System - In Progress", quantity: 0.7, rate: 12000, amount: 8400 }
      ],
      subtotal: "8400.00",
      taxRate: "8.75",
      taxAmount: "735.00",
      discountAmount: "0.00",
      totalAmount: "9135.00",
      depositRequired: "0.00",
      depositPaid: "0.00",
      amountPaid: "0.00",
      balanceDue: "9135.00",
      notes: "Draft invoice for progress payment on design system development.",
      createdById: demoUserId
    }
  ];

  for (const invoice of invoices) {
    const created = await storage.createInvoice(invoice);
    demoIds.invoices[invoice.invoiceNumber] = created.id;
  }
}

/**
 * Create demo contracts
 */
async function createDemoContracts(demoUserId: string, demoIds: DemoDataIds): Promise<void> {
  const contracts: InsertContract[] = [
    {
      contractNumber: "CON-2025-001",
      title: "TechFlow Platform Development Agreement",
      templateId: demoIds.templates["Service Agreement Contract"],
      proposalId: demoIds.proposals["TechFlow Platform Redesign Proposal"],
      projectId: demoIds.projects["TechFlow Platform Redesign"],
      clientId: demoIds.clients["TechFlow Solutions"],
      clientName: "TechFlow Solutions Inc.",
      clientEmail: "legal@techflowsolutions.com",
      status: "fully_signed",
      contractType: "service_agreement",
      content: `# Service Agreement

This Service Agreement is entered into on July 25, 2025 between Gigster Garage and TechFlow Solutions Inc.

## Scope of Services
Complete UI/UX redesign of the TechFlow workflow automation platform including user research, wireframes, visual design system, and responsive implementation.

## Payment Terms
Payment in 3 installments: 40% upfront ($14,000), 40% at midpoint ($14,000), 20% on completion ($7,000).

## Contract Duration
This agreement is effective from July 25, 2025 to October 25, 2025.

## Terms and Conditions
1. Both parties agree to maintain confidentiality of proprietary information
2. Work will be performed professionally and according to agreed timeline
3. Payment terms as outlined above must be adhered to
4. Either party may terminate with 30 days written notice

By signing below, both parties agree to the terms of this contract.`,
      variables: {
        clientName: "TechFlow Solutions Inc.",
        serviceDescription: "Complete UI/UX redesign of the TechFlow workflow automation platform",
        paymentTerms: "Payment in 3 installments: 40% upfront, 40% at midpoint, 20% on completion",
        effectiveDate: "2025-07-25",
        expirationDate: "2025-10-25"
      },
      contractValue: "35000.00",
      paymentTerms: "Payment in 3 installments: 40% upfront ($14,000), 40% at midpoint ($14,000), 20% on completion ($7,000)",
      currency: "USD",
      effectiveDate: new Date('2025-07-25'),
      expirationDate: new Date('2025-10-25'),
      requiresSignature: true,
      signatureType: "digital",
      businessSignedAt: new Date('2025-07-25'),
      businessSignedBy: demoUserId,
      clientSignedAt: new Date('2025-07-26'),
      createdById: demoUserId,
      metadata: { projectType: "design", clientType: "tech_startup" }
    },
    {
      contractNumber: "CON-2025-002",
      title: "Digital Transformation Consulting Agreement",
      templateId: demoIds.templates["Service Agreement Contract"],
      projectId: demoIds.projects["Digital Transformation Strategy"],
      clientId: demoIds.clients["Premier Business Consulting"],
      clientName: "Premier Business Consulting LLC",
      clientEmail: "contracts@premierbiz.com",
      status: "pending_signature",
      contractType: "consulting",
      content: `# Consulting Services Agreement

This Consulting Agreement is entered into on August 20, 2025 between Gigster Garage and Premier Business Consulting LLC.

## Scope of Services
Comprehensive digital transformation consulting including current state assessment, technology roadmap development, training program design, and implementation support.

## Payment Terms
Payment in 4 monthly installments of $7,000 each, due on the 1st of each month.

## Contract Duration
This agreement is effective from August 20, 2025 to December 20, 2025.

Awaiting client signature to execute this agreement.`,
      variables: {
        clientName: "Premier Business Consulting LLC",
        serviceDescription: "Digital transformation consulting services",
        paymentTerms: "Payment in 4 monthly installments of $7,000 each",
        effectiveDate: "2025-08-20",
        expirationDate: "2025-12-20"
      },
      contractValue: "28000.00",
      paymentTerms: "Payment in 4 monthly installments of $7,000 each, due on the 1st of each month",
      currency: "USD",
      effectiveDate: new Date('2025-08-20'),
      expirationDate: new Date('2025-12-20'),
      requiresSignature: true,
      signatureType: "digital",
      businessSignedAt: new Date('2025-08-20'),
      businessSignedBy: demoUserId,
      createdById: demoUserId,
      metadata: { projectType: "consulting", clientType: "consulting_firm" }
    }
  ];

  for (const contract of contracts) {
    const created = await storage.createContract(contract);
    demoIds.contracts[contract.contractNumber] = created.id;
  }
}

/**
 * Create realistic time tracking data
 */
async function createDemoTimeLogs(demoUserId: string, demoIds: DemoDataIds): Promise<void> {
  const baseDate = new Date('2025-08-01');
  const timeLogs: InsertTimeLog[] = [];

  // Generate time logs for the past 45 days
  for (let day = 0; day < 45; day++) {
    const logDate = new Date(baseDate);
    logDate.setDate(logDate.getDate() + day);
    
    // Skip weekends for most entries
    if (logDate.getDay() === 0 || logDate.getDay() === 6) {
      if (Math.random() > 0.1) continue; // 10% chance of weekend work
    }

    // Create 2-4 time logs per work day
    const logsPerDay = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < logsPerDay; i++) {
      const startHour = 8 + Math.floor(Math.random() * 8); // 8 AM to 4 PM starts
      const duration = (Math.random() * 3 + 0.5) * 3600; // 30 minutes to 3.5 hours
      
      const startTime = new Date(logDate);
      startTime.setHours(startHour, Math.floor(Math.random() * 60), 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setSeconds(endTime.getSeconds() + duration);

      // Select random task for time log
      const taskTitles = Object.keys(demoIds.tasks);
      const randomTask = taskTitles[Math.floor(Math.random() * taskTitles.length)];
      const taskId = demoIds.tasks[randomTask];

      // Get project ID from task (simplified - we'll use the first project)
      const projectIds = Object.values(demoIds.projects);
      const projectId = projectIds[Math.floor(Math.random() * projectIds.length)];

      const descriptions = [
        "Working on user interface components",
        "Client feedback review and implementation",
        "Bug fixes and testing",
        "Documentation and code review",
        "Research and planning",
        "Team collaboration and meetings",
        "Design system development",
        "API integration work",
        "Quality assurance testing",
        "Client communication and updates"
      ];

      timeLogs.push({
        userId: demoUserId,
        taskId: taskId,
        projectId: projectId,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        startTime: startTime,
        endTime: endTime,
        duration: Math.floor(duration).toString(),
        isActive: false,
        isManualEntry: Math.random() > 0.8, // 20% manual entries
        editHistory: [],
        approvalStatus: Math.random() > 0.1 ? "approved" : "pending", // 90% approved
        isSelectedForInvoice: Math.random() > 0.3, // 70% selected for invoicing
        approvedBy: Math.random() > 0.1 ? demoUserId : undefined,
        approvedAt: Math.random() > 0.1 ? new Date(endTime.getTime() + 24 * 60 * 60 * 1000) : undefined
      });
    }
  }

  // Add one active timer for the current session
  const now = new Date();
  const activeStart = new Date(now);
  activeStart.setHours(now.getHours() - 1, now.getMinutes() - Math.floor(Math.random() * 30), 0, 0);

  timeLogs.push({
    userId: demoUserId,
    taskId: demoIds.tasks["Visual Design System"],
    projectId: demoIds.projects["TechFlow Platform Redesign"],
    description: "Working on component library documentation",
    startTime: activeStart,
    endTime: undefined,
    duration: undefined,
    isActive: true,
    isManualEntry: false,
    editHistory: [],
    approvalStatus: "pending",
    isSelectedForInvoice: false
  });

  // Create time logs in batches to avoid overwhelming the database
  const batchSize = 10;
  for (let i = 0; i < timeLogs.length; i += batchSize) {
    const batch = timeLogs.slice(i, i + batchSize);
    await Promise.all(batch.map(timeLog => storage.createTimeLog(timeLog)));
  }

  console.log(`📊 Created ${timeLogs.length} time log entries`);
}

/**
 * Create demo payments for invoices
 */
async function createDemoPayments(demoIds: DemoDataIds): Promise<void> {
  const payments: InsertPayment[] = [
    {
      invoiceId: demoIds.invoices["INV-2025-001"],
      clientId: demoIds.clients["TechFlow Solutions"],
      amount: "16312.50",
      paymentDate: new Date('2025-08-15'),
      paymentMethod: "stripe",
      reference: "ch_1ABC123DEF456789",
      notes: "Payment processed via Stripe - automatic payment",
      isDeposit: false
    },
    {
      invoiceId: undefined, // Deposit payment not tied to specific invoice
      clientId: demoIds.clients["TechFlow Solutions"],
      amount: "14000.00",
      paymentDate: new Date('2025-07-26'),
      paymentMethod: "bank_transfer",
      reference: "TF-DEP-001",
      notes: "Project deposit payment - 40% upfront for platform redesign",
      isDeposit: true
    },
    {
      invoiceId: undefined,
      clientId: demoIds.clients["Premier Business Consulting"],
      amount: "7000.00",
      paymentDate: new Date('2025-08-01'),
      paymentMethod: "check",
      reference: "CHECK-4501",
      notes: "First monthly payment for consulting services",
      isDeposit: false
    }
  ];

  for (const payment of payments) {
    await storage.createPayment(payment);
  }
}