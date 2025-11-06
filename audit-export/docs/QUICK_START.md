# Gigster Garage - Quick Start Guide

Welcome to Gigster Garage! This guide will help you get up and running in minutes.

## Table of Contents
- [First Login](#first-login)
- [Dashboard Overview](#dashboard-overview)
- [Creating Your First Task](#creating-your-first-task)
- [Starting a Timer](#starting-a-timer)
- [Creating an Invoice](#creating-an-invoice)
- [Quick Actions](#quick-actions)
- [Next Steps](#next-steps)

---

## First Login

### Default Credentials
- **Admin Account**: `admin@gigster.com` / Password: `admin123`
- **Demo Account**: `demo@gigster.com` / Password: `demo123`

### Initial Setup
1. Navigate to your Gigster Garage instance
2. Log in with your credentials
3. You'll be directed to the main dashboard

**Security Note**: Change your password immediately after first login via Settings → Account.

---

## Dashboard Overview

The dashboard is your command center with quick access to:

### Key Metrics
- **Active Tasks**: Tasks currently in progress
- **Projects**: Total projects you're managing
- **Time Tracked**: Hours logged this period
- **Revenue**: Financial overview from invoices

### Navigation
- **Sidebar**: Access all major features (Tasks, Projects, Invoices, etc.)
- **Command Palette**: Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux) for instant search
- **Quick Action Button**: Click the floating button in bottom-right corner for common actions

---

## Creating Your First Task

### Method 1: Quick Action Button
1. Click the **floating action button** (bottom-right corner)
2. Select **"New Task"**
3. Fill in the details:
   - **Title**: Brief description of the task
   - **Project**: Select or create a project
   - **Priority**: Low, Medium, or High
   - **Due Date**: When the task should be completed
   - **Assigned To**: Select team member (optional)
4. Click **"Create Task"**

### Method 2: Command Palette
1. Press `Cmd+K` or `Ctrl+K`
2. Type "new task"
3. Press Enter and fill in the form

### Method 3: Tasks Page
1. Navigate to **Tasks** in the sidebar
2. Click **"+ New Task"** button
3. Fill in the task details
4. Click **"Create Task"**

---

## Starting a Timer

Track your time as you work:

### Start Tracking
1. Navigate to **Tasks** page
2. Find your task
3. Click the **"Start Timer"** button (▶️ icon)
4. Timer begins tracking automatically

### Stop Tracking
1. Click the **"Stop Timer"** button (⏹️ icon)
2. Time is automatically logged to the task
3. View time entries in the task details

### Quick Timer (Any Page)
1. Click the **Quick Action Button**
2. Select **"Start Timer"**
3. Choose the task from the dropdown
4. Timer starts immediately

---

## Creating an Invoice

Generate professional invoices in minutes:

### Step-by-Step
1. Navigate to **Invoices** in the sidebar
2. Click **"+ Create Invoice"** button
3. Fill in the invoice details:
   - **Client**: Select from dropdown or create new
   - **Invoice Number**: Auto-generated (editable)
   - **Issue Date**: Defaults to today
   - **Due Date**: Payment deadline
   - **Line Items**: Add services/products
     - Description
     - Quantity
     - Rate (price per unit)
     - Amount auto-calculates
   - **Tax Rate**: Percentage (optional)
   - **Discount**: Amount to subtract (optional)
4. Click **"Create Invoice"**

### Auto-Fill Features
- Client information populates automatically
- Company details pre-filled from settings
- Line items can be saved as templates

### Invoice Actions
- **Preview**: See how it looks before sending
- **Download PDF**: Export for offline use
- **Send**: Email directly to client
- **Record Payment**: Mark as paid when received

---

## Quick Actions

### Keyboard Shortcuts
Press `?` to see all shortcuts. Common ones:

- `Cmd/Ctrl + K`: Open command palette
- `Cmd/Ctrl + N`: New task
- `Cmd/Ctrl + /`: Focus search
- `Esc`: Close dialogs

### Command Palette Features
Access anything quickly:
- Search tasks, projects, clients, invoices
- Execute actions (create, edit, delete)
- Navigate between pages
- Recent pages history

### Floating Action Button
Always accessible from bottom-right:
- New Task
- Start Timer
- Create Invoice
- Quick Project
- Add Client

---

## Next Steps

### Essential Setup
1. **Add Your Team**: Settings → User Management
2. **Create Projects**: Projects → New Project
3. **Add Clients**: Clients → New Client
4. **Configure Notifications**: Settings → Notifications
5. **Set Up Integrations**: Settings → Integrations

### Explore Advanced Features
- **Workflow Automation**: Automate repetitive tasks (Pro/Enterprise)
- **Custom Fields**: Add fields specific to your workflow
- **AI Content Generation**: Let AI draft proposals (Pro/Enterprise)
- **Advanced Reporting**: Insights into productivity and revenue (Pro/Enterprise)
- **Team Collaboration**: Real-time collaboration features
- **Agent Management**: View 17 AI agents and their automation tasks (Admin)
- **API Integration**: Use the TypeScript client for custom integrations

### Get Help
- **User Manual**: See `USER_MANUAL.md` for comprehensive documentation
- **Keyboard Shortcuts**: Press `?` anywhere in the app
- **Settings**: Configure preferences and integrations
- **Agent Management**: View system agents and policies (Admin only)

---

## Common Questions

### How do I change my password?
Settings → Account → Change Password

### How do I add team members?
Settings → User Management → Add User (Admin only)

### Can I customize the dashboard?
Yes! Click the "Customize" button on the dashboard to add/remove widgets.

### How do I export data?
Settings → Data → Export Data (choose CSV or JSON format)

### What's my plan tier?
Check Settings → Account to see your current plan (Free/Pro/Enterprise)

### How do I enable AI features?
AI features require a Pro or Enterprise plan. Upgrade in Settings → Billing.

### What are agents?
Agents are 17 specialized AI systems that automate workflows. Admins can view them in Agent Management.

### How do I use the API?
Install the TypeScript client: `npm install @gigster-garage/api-client`. See User Manual → API Documentation for details.

---

## Tips for Success

1. **Use Projects**: Organize tasks by project for better tracking
2. **Set Priorities**: Mark urgent tasks as High priority
3. **Track Time Regularly**: Start timers when you begin work
4. **Review Weekly**: Check the Analytics page for insights
5. **Automate Workflows**: Set up rules to save time on repetitive tasks
6. **Use Templates**: Create invoice templates for recurring clients
7. **Enable Notifications**: Stay on top of deadlines and updates
8. **Leverage Agents**: Let the 17 AI agents automate routine operations (Admin)
9. **Command Palette**: Master `Cmd+K` for blazing-fast navigation

---

## For Developers

### API Integration

Gigster Garage provides a professional TypeScript client for API integration:

```bash
npm install @gigster-garage/api-client
```

**Quick Example:**
```typescript
import { createClient } from '@gigster-garage/api-client';

const client = createClient({
  baseUrl: 'https://your-instance.com'
});

// Create a task
const task = await client.postApiTasks({
  body: {
    title: 'API Integration',
    priority: 'high'
  }
});

// Generate blueprint (Packsmith)
const blueprint = await client.postApiPacksByPackIdBlueprint({
  params: { packId: 'pack_123' },
  body: { includeDoD: true, includeKPIs: true }
});
```

### Repository Seed

Download the **governed edition** package seed for a complete setup:
- 30 files with TypeScript client
- 6 GitHub workflows (CI/CD, CodeQL, release automation)
- CODEOWNERS, auto-assign, stale management
- Issue/PR templates, security policy
- Auto-merge Release PRs after CI passes

See **User Manual → API Documentation** for complete details.

### API Endpoints

**Packsmith API** (8 endpoints):
- Create/manage service packs
- Generate blueprints (L1 draft)
- Seed tasks from blueprints

**Importer API** (8 endpoints):
- CSV/XLSX import workflow
- Column mapping & validation
- Staged import with approval

**iCadence API** (6 endpoints):
- Marketing channel wizard
- UTM preset management
- Spend log ingestion

---

## Plan Tiers

Gigster Garage offers three plans with different feature access:

### Free Plan
- ✅ Unlimited tasks and projects
- ✅ Basic time tracking
- ✅ Invoice generation
- ✅ 2 team members
- ❌ No workflow automation
- ❌ No AI features
- ❌ Basic reporting

### Pro Plan ($20/month)
- ✅ Everything in Free
- ✅ **Workflow Automation** with custom rules
- ✅ **AI Content Generation** (GPT-4o)
- ✅ Advanced reporting & analytics
- ✅ Unlimited team members
- ✅ Priority support
- ✅ API access (1000 req/hour)

### Enterprise Plan ($99/month)
- ✅ Everything in Pro
- ✅ **Agent Management** (17 AI agents)
- ✅ Advanced agent automation
- ✅ Custom integrations
- ✅ Dedicated support
- ✅ SLA guarantees
- ✅ API access (10000 req/hour)
- ✅ On-premise deployment option

**Upgrade:** Settings → Billing → Change Plan

---

**You're all set!** Start creating tasks, tracking time, and managing your workflow. For detailed feature documentation, see the [User Manual](USER_MANUAL.md).

**Need help?** Press `?` anywhere in the app or check the User Manual for comprehensive guides.

**Developers:** See User Manual → API Documentation for complete API reference and TypeScript client setup.
