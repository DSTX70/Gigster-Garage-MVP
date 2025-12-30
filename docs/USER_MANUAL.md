# Gigster Garage - User Manual

Complete documentation for all features and functionality.

## Table of Contents

### Getting Started
1. [Introduction](#introduction)
2. [System Requirements](#system-requirements)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Navigation](#navigation)

### Core Features
5. [Dashboard](#dashboard)
6. [Tasks](#tasks)
7. [Projects](#projects)
8. [Time Tracking](#time-tracking)
9. [Invoices](#invoices)
10. [Clients](#clients)

### Advanced Features
11. [Workflow Automation](#workflow-automation)
12. [Custom Fields](#custom-fields)
13. [AI Content Generation](#ai-content-generation)
14. [Advanced Reporting](#advanced-reporting)
15. [Team Collaboration](#team-collaboration)
16. [GigsterCoach - AI Business Coach](#gigstercoach---ai-business-coach)

### Administration
17. [User Management](#user-management)
18. [Agent Management](#agent-management)
19. [Social Media Queue System](#social-media-queue-system)
20. [Platform Connections](#platform-connections)
21. [Production Monitoring](#production-monitoring)
22. [Settings & Preferences](#settings--preferences)
23. [Integrations](#integrations)
24. [Security & Privacy](#security--privacy)

### Reference
22. [Keyboard Shortcuts](#keyboard-shortcuts)
23. [API Documentation](#api-documentation)
24. [Troubleshooting](#troubleshooting)

---

## Introduction

Gigster Garage is a comprehensive time tracking and workflow management system designed to help teams manage tasks, track time, generate invoices, and automate workflows efficiently.

### Key Capabilities
- **Task Management**: Create, assign, and track tasks with priorities and deadlines
- **Time Tracking**: Log time against tasks and projects
- **Invoicing**: Generate professional invoices with auto-calculation
- **Project Management**: Organize work into projects with Kanban boards
- **Workflow Automation**: Automate repetitive tasks with custom rules
- **AI-Powered**: Generate proposals and content using GPT-4o (Pro/Enterprise)
- **Team Collaboration**: Real-time collaboration with WebSocket support
- **Analytics**: Track productivity, revenue, and team performance

---

## System Requirements

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

### Network
- Internet connection required for real-time features
- Offline mode available for basic functionality

### Recommended
- 4GB RAM minimum
- Modern multi-core processor
- 1920x1080 display resolution or higher

---

## User Roles & Permissions

### Admin
- Full system access
- User management
- System configuration
- Agent management
- Bypass all permission checks
- Access to all resources (owned and shared)

### Regular User
- Create and manage own tasks
- Access assigned tasks
- View/edit shared projects
- View/edit shared clients
- Create invoices (own only)
- Track time
- Generate reports (own data)

### Permission Model

**OWNED Resources** (User-specific):
- **Tasks**: Access if created by user OR assigned to user
- **Invoices**: Access only if created by user
- **Proposals**: Access only if created by user

**SHARED Resources** (Organization-wide):
- **Projects**: All authenticated users can view/edit
- **Clients**: All authenticated users can view/edit

---

## Navigation

### Sidebar Menu
Access all major features from the left sidebar:
- **Dashboard**: Overview and metrics
- **Tasks**: Task management
- **Projects**: Project organization
- **Invoices**: Invoice generation and tracking
- **Clients**: Client management
- **Time Tracking**: Time logs and reports
- **Analytics**: Performance insights
- **Settings**: Configuration and preferences

### Command Palette
Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux):
- **Search**: Find tasks, projects, clients, invoices
- **Quick Actions**: Create, edit, delete items
- **Navigation**: Jump to any page
- **Recent Pages**: Access recently viewed pages

### Quick Action Button
Floating button in bottom-right corner:
- **New Task**: Create task instantly
- **Start Timer**: Begin tracking time
- **Create Invoice**: Generate new invoice
- **Quick Project**: Add new project
- **Add Client**: Register new client

### Keyboard Shortcuts
Press `?` to view all available shortcuts.

---

## Dashboard

### Overview Metrics
- **Active Tasks**: Tasks currently in progress
- **Projects**: Total projects count
- **Time This Week**: Hours logged in current week
- **Revenue**: Total from invoices (paid + pending)

### Widgets
Customize your dashboard with widgets:
- **Recent Tasks**: Latest task activity
- **Project Progress**: Visual project status
- **Time Summary**: Weekly time breakdown
- **Revenue Chart**: Financial trends
- **Upcoming Deadlines**: Tasks due soon
- **Team Activity**: Real-time team updates

### Customization
1. Click **"Customize Dashboard"** button
2. Toggle widgets on/off
3. Drag to rearrange
4. Click **"Save Layout"**

---

## Tasks

### Creating Tasks

#### Basic Task Creation
1. Navigate to **Tasks** page
2. Click **"+ New Task"**
3. Fill in required fields:
   - **Title**: Task name (required)
   - **Description**: Detailed information
   - **Project**: Associated project
   - **Priority**: Low, Medium, High
   - **Status**: To Do, In Progress, Done
   - **Due Date**: Deadline
   - **Assigned To**: Team member
4. Click **"Create Task"**

#### Advanced Options
- **Tags**: Categorize tasks
- **Attachments**: Upload files
- **Links**: Add reference URLs
- **Subtasks**: Break down into smaller tasks
- **Custom Fields**: Add project-specific fields
- **Reminders**: Set notification alerts

### Task Management

#### Updating Tasks
1. Click task to open details
2. Edit any field inline
3. Changes save automatically

#### Task Actions
- **Start Timer**: Begin time tracking
- **Mark Complete**: Change status to Done
- **Duplicate**: Create copy of task
- **Delete**: Remove task (requires confirmation)
- **Archive**: Hide from active view

#### Bulk Operations
1. Select multiple tasks (checkboxes)
2. Choose bulk action:
   - Assign to user
   - Change priority
   - Update status
   - Delete multiple
   - Export to CSV

### Subtasks

#### Creating Subtasks
1. Open parent task
2. Click **"Add Subtask"**
3. Enter subtask details
4. Subtask inherits project from parent

#### Subtask Features
- Hierarchical organization
- Circular dependency prevention
- Progress tracking (X of Y complete)
- Individual time tracking
- Independent assignments

### Task Filters

Filter tasks by:
- **Status**: To Do, In Progress, Done
- **Priority**: Low, Medium, High
- **Project**: Specific project
- **Assigned To**: Team member
- **Due Date**: Overdue, Today, This Week, Custom
- **Tags**: Multiple tag selection
- **Custom Fields**: Filter by custom values

### Task Views

#### List View
- Table format with sortable columns
- Quick inline editing
- Bulk selection
- Dense information display

#### Kanban Board
- Drag-and-drop task cards
- Status-based columns
- Visual workflow management
- Card previews

#### Calendar View
- Tasks plotted by due date
- Drag to reschedule
- Monthly/weekly views
- Deadline visibility

---

## Projects

### Creating Projects

1. Navigate to **Projects** page
2. Click **"+ New Project"**
3. Fill in project details:
   - **Name**: Project title (required)
   - **Description**: Project overview
   - **Client**: Associated client
   - **Start Date**: Project kickoff
   - **End Date**: Project deadline
   - **Budget**: Financial limit (optional)
   - **Status**: Active, On Hold, Completed
4. Click **"Create Project"**

### Project Dashboard

Each project has a dedicated dashboard:
- **Task Overview**: Tasks by status
- **Time Summary**: Hours logged
- **Budget Tracking**: Spent vs. allocated
- **Team Members**: Assigned users
- **Recent Activity**: Latest updates
- **Milestones**: Key deliverables

### Project Views

#### Kanban Board
- Tasks organized by status columns
- Drag-and-drop to update status
- Swimlanes by assignee/priority
- WIP limits per column

#### Gantt Chart
- Timeline view of tasks
- Dependencies visualization
- Critical path highlighting
- Milestone markers
- Drag to adjust dates

#### Timeline View
- Chronological task list
- Due date sorting
- Progress indicators
- Color-coded priorities

### Project Settings

Configure project-specific:
- **Custom Fields**: Add project fields
- **Workflow Rules**: Automation for this project
- **Notifications**: Project-specific alerts
- **Access Control**: Team member permissions
- **Integration**: Connect external tools

---

## Time Tracking

### Manual Time Entry

1. Navigate to **Time Tracking** page
2. Click **"+ Add Time Entry"**
3. Fill in details:
   - **Task**: Select task
   - **Date**: When work was done
   - **Duration**: Hours and minutes
   - **Description**: What was accomplished
4. Click **"Save Entry"**

### Timer Tracking

#### Start Timer
1. Find task in list
2. Click **"Start Timer"** (▶️ icon)
3. Timer runs in background
4. Counter visible in navbar

#### Stop Timer
1. Click **"Stop Timer"** (⏹️ icon)
2. Review time entry
3. Edit description if needed
4. Click **"Save"**

### Time Reports

#### Individual Reports
- **Daily**: Time by day
- **Weekly**: Week-over-week comparison
- **Monthly**: Month summary
- **Project-based**: Time per project
- **Task-based**: Time per task

#### Team Reports
- **Team Summary**: All members' time
- **Utilization**: Billable vs. non-billable
- **Productivity**: Tasks completed vs. time
- **Capacity**: Team availability

### Billable vs. Non-Billable

Mark tasks as:
- **Billable**: Client-facing work
- **Non-Billable**: Internal tasks, meetings

Filter time entries:
- View only billable hours
- Calculate invoice amounts
- Track profitability

---

## Invoices

### Creating Invoices

#### Step-by-Step Process
1. Navigate to **Invoices** page
2. Click **"+ Create Invoice"**
3. **Client Information**:
   - Select existing client or create new
   - Auto-fills client details (name, address, email)
4. **Invoice Details**:
   - **Invoice Number**: Auto-generated (customizable)
   - **Issue Date**: Date invoice created
   - **Due Date**: Payment deadline
   - **Payment Terms**: Net 30, Net 60, etc.
5. **Line Items**:
   - Click **"+ Add Line Item"**
   - **Description**: Service/product name
   - **Quantity**: Number of units
   - **Rate**: Price per unit
   - **Amount**: Auto-calculated (Quantity × Rate)
6. **Calculations** (automatic):
   - **Subtotal**: Sum of line items
   - **Tax Rate**: Percentage (optional)
   - **Tax Amount**: Subtotal × Tax Rate
   - **Discount**: Fixed amount (optional)
   - **Total**: Subtotal + Tax - Discount
7. **Notes** (optional):
   - Payment instructions
   - Terms and conditions
   - Thank you message
8. Click **"Create Invoice"**

### Invoice Security

**Server-Side Calculations**:
- All amounts calculated from Quantity × Rate on server
- Client-submitted amounts are ignored
- Prevents tampering and manipulation
- Calculation logic in `server/utils/invoice-calculations.ts`

**Financial Accuracy**:
- Fixed-point arithmetic (2 decimal precision)
- No floating-point errors
- Banker's rounding for fairness
- Validation on every update

### Invoice Actions

#### Preview
- See formatted invoice before sending
- Check for errors or typos
- Review calculations
- Print preview

#### Download PDF
- Generate professional PDF
- Company branding included
- Line-by-line breakdown
- Payment instructions

#### Send to Client
- Email invoice directly
- Includes PDF attachment
- Customizable email template
- Delivery confirmation

#### Record Payment
1. Open invoice
2. Click **"Record Payment"**
3. Enter:
   - **Amount Paid**: Payment received
   - **Payment Date**: When received
   - **Payment Method**: Check, Wire, Card, etc.
   - **Reference**: Check number, transaction ID
4. Click **"Save Payment"**
5. **Balance** auto-updates

#### Mark as Paid
- Quick action to mark fully paid
- Records payment with full amount
- Updates status to "Paid"
- Removes from outstanding invoices

### Invoice Status

- **Draft**: Being created
- **Sent**: Emailed to client
- **Viewed**: Client opened it
- **Partial**: Partially paid
- **Paid**: Fully paid
- **Overdue**: Past due date, unpaid
- **Cancelled**: Voided invoice

### Recurring Invoices

Set up automatic invoicing:
1. Create template invoice
2. Enable **"Recurring"**
3. Configure:
   - **Frequency**: Weekly, Monthly, Quarterly, Yearly
   - **Start Date**: First invoice date
   - **End Date**: When to stop (optional)
   - **Auto-Send**: Email automatically
4. System generates invoices on schedule

### Invoice Templates

Save time with templates:
1. Create invoice with common line items
2. Click **"Save as Template"**
3. Name the template
4. Use template for future invoices
5. Line items pre-populate

### Invoice Reports

- **Revenue Summary**: Total by period
- **Outstanding**: Unpaid invoices
- **Aging Report**: Days overdue
- **Client Summary**: Revenue per client
- **Payment History**: Received payments

---

## Clients

### Client Management

#### Adding Clients
1. Navigate to **Clients** page
2. Click **"+ Add Client"**
3. Fill in details:
   - **Company Name**: Client organization
   - **Contact Person**: Primary contact
   - **Email**: Contact email
   - **Phone**: Contact number
   - **Address**: Full mailing address
   - **Tax ID**: For invoicing (optional)
   - **Payment Terms**: Default NET days
   - **Notes**: Additional information
4. Click **"Save Client"**

#### Client Details Page
- **Overview**: Key information
- **Projects**: Associated projects
- **Invoices**: Financial history
- **Contacts**: Multiple contact persons
- **Notes**: Meeting notes, preferences
- **Files**: Contracts, agreements

### Shared Resource
- All authenticated users can view clients
- Organization-wide access
- No ownership restrictions
- Collaborative client management

---

## Workflow Automation

**Plan Required**: Pro or Enterprise

### Creating Workflow Rules

1. Navigate to **Workflow Automation** page
2. Click **"+ New Rule"**
3. **Rule Builder**:
   - **Trigger**: When does this run?
     - Task created
     - Task updated
     - Status changed
     - Due date approaching
     - Project milestone
   - **Conditions**: Filter when rule applies
     - Priority equals High
     - Project equals X
     - Assigned to specific user
     - Tag contains keyword
   - **Actions**: What happens?
     - Send notification
     - Assign to user
     - Update field
     - Create subtask
     - Send email
     - Webhook call
4. **Test Rule**: Validate logic
5. Click **"Create Rule"**

### Rule Templates

Pre-built automation:
- **High Priority Alert**: Notify manager when high-priority task created
- **Overdue Reminder**: Email assignee when task becomes overdue
- **Auto-Assignment**: Assign tasks based on tags
- **Status Sync**: Update project when all tasks complete
- **Client Notification**: Email client on milestone completion

### Rule Management

- **Enable/Disable**: Toggle rules on/off
- **Edit Rules**: Modify triggers/actions
- **Duplicate**: Copy rule for variations
- **Test**: Dry-run without executing
- **Logs**: View execution history
- **Performance**: Check rule efficiency

---

## Custom Fields

Add project-specific or organization-wide custom fields.

### Creating Custom Fields

1. Navigate to **Custom Fields** page
2. Click **"+ Add Field"**
3. Configure field:
   - **Field Name**: Display label
   - **Field Type**:
     - Text (single line)
     - Textarea (multi-line)
     - Number
     - Date
     - Dropdown (options)
     - Checkbox
     - User (team member picker)
   - **Apply To**: Tasks, Projects, Clients
   - **Required**: Make mandatory
   - **Default Value**: Pre-fill value
4. Click **"Create Field"**

### Using Custom Fields

Fields appear in create/edit forms:
- **Task Forms**: Additional task fields
- **Project Forms**: Project-specific data
- **Client Forms**: Client attributes

### Field Management

- **Reorder**: Drag to arrange fields
- **Edit**: Update field settings
- **Archive**: Hide unused fields
- **Export**: Include in CSV exports

---

## AI Content Generation

**Plan Required**: Pro or Enterprise  
**Model**: GPT-4o

### AI Proposal Generator

Create professional proposals with AI that automatically incorporates your business profile:

1. Navigate to **Proposals** page
2. Click **"Generate with AI"**
3. Provide inputs:
   - **Client Name**: Who is this for?
   - **Project Type**: Web dev, design, consulting, etc.
   - **Scope**: Brief project description
   - **Budget Range**: Approximate cost
   - **Timeline**: Expected duration
4. Click **"Generate Proposal"**
5. AI creates:
   - Executive summary
   - Scope of work
   - Deliverables (6-8 focused items)
   - Timeline
   - Pricing breakdown
   - Terms and conditions
6. **Review and Edit**: Customize AI output
7. **Save as Draft** or **Send to Client**

### Profile-Aware AI Generation

The AI automatically uses your profile information to create personalized, industry-specific content:

**Profile Fields Used**:
- **Industry**: Uses relevant terminology and sector-specific language
- **Business Type**: Tailors content to your business model
- **Target Market**: Incorporates audience-appropriate messaging
- **Services**: Highlights your core offerings and expertise
- **Specialty**: Emphasizes your unique value proposition

**Best Results**: Complete your profile in **Settings → Profile** to ensure AI-generated proposals reflect your expertise and use appropriate industry jargon.

### AI Content Features

- **Instant Proposal**: Full proposal in seconds
- **Professional Tone**: Direct, confident business language
- **Concise Output**: No filler or buzzwords - every word earns its place
- **Industry Context**: Uses your profile to generate relevant terminology
- **Structured Format**: Organized sections with clear deliverables
- **Customizable**: Edit before sending
- **Templates**: Save AI output as templates
- **Cost Control**: Usage limits by plan tier

### Content Quality Standards

AI-generated content follows these principles:
- **Brevity**: Descriptions stay within 150-250 words
- **Specificity**: Deliverables are measurable and concrete (6-8 items max)
- **Professionalism**: Active voice, confident tone, no excessive adjectives
- **Clarity**: Terms and conditions under 400 words, clear language

### AI Usage Limits

**Pro Plan**:
- 50 AI generations per month
- Standard priority processing

**Enterprise Plan**:
- Unlimited AI generations
- Priority processing
- Custom models available

---

## Advanced Reporting

**Plan Required**: Pro or Enterprise

### Report Types

#### Productivity Reports
- **Task Completion**: Tasks completed over time
- **Velocity**: Average tasks per sprint
- **Cycle Time**: Time from start to completion
- **Lead Time**: Time from creation to completion
- **Burndown Charts**: Sprint progress visualization

#### Financial Reports
- **Revenue by Period**: Monthly/quarterly/yearly
- **Revenue by Client**: Top clients ranking
- **Revenue by Project**: Project profitability
- **Outstanding Invoices**: Aging report
- **Payment Trends**: Cash flow analysis

#### Time Reports
- **Time by Project**: Hours per project
- **Time by User**: Individual productivity
- **Billable vs. Non-Billable**: Utilization rate
- **Time Utilization**: Capacity planning
- **Overtime**: Extra hours tracking

#### Team Reports
- **Team Capacity**: Available vs. allocated
- **Workload Balance**: Distribution across team
- **Individual Performance**: User metrics
- **Collaboration**: Cross-team work

### Report Customization

- **Date Range**: Custom periods
- **Filters**: Project, user, client, status
- **Group By**: Various dimensions
- **Sort**: Ascending/descending
- **Charts**: Bar, line, pie, area
- **Export**: PDF, CSV, Excel

### Scheduled Reports

Email reports automatically:
1. Create custom report
2. Click **"Schedule"**
3. Configure:
   - **Frequency**: Daily, Weekly, Monthly
   - **Recipients**: Email addresses
   - **Format**: PDF or CSV
   - **Time**: When to send
4. Reports email on schedule

---

## Team Collaboration

### Real-Time Features

- **WebSocket Connection**: Live updates
- **Presence Indicators**: Who's online
- **Live Cursors**: See others editing
- **Instant Notifications**: In-app alerts
- **Activity Feed**: Recent team actions

### Comments & Mentions

#### Task Comments
1. Open task details
2. Scroll to **Comments** section
3. Type comment
4. **@mention** team members to notify
5. Click **"Post Comment"**

#### Rich Comments
- **Markdown**: Format text
- **Attachments**: Upload files
- **Code Blocks**: Share code snippets
- **Emoji**: Add reactions
- **Edit/Delete**: Manage own comments

### Notifications

#### Notification Types
- **Task Assigned**: You're assigned a task
- **Mention**: Someone @mentioned you
- **Comment**: New comment on your task
- **Due Date**: Task due soon
- **Status Change**: Task status updated
- **Invoice Sent**: Client notified
- **Payment Received**: Invoice paid

#### Notification Channels
- **In-App**: Browser notifications
- **Email**: Digest or instant
- **SMS**: Critical alerts (Twilio)

#### Notification Settings
1. Go to **Settings → Notifications**
2. Configure preferences:
   - **Email Digest**: Daily/weekly summary
   - **Instant Alerts**: Real-time notifications
   - **Quiet Hours**: Silence notifications
   - **Channels**: Choose in-app, email, SMS
   - **Types**: Select which events notify
3. Click **"Save Preferences"**

---

## GigsterCoach - AI Business Coach

**Plan Availability**: Free (base features), Pro+ (proactive suggestions)

GigsterCoach is your AI-powered business assistant that helps you draft content, review documents, and get instant answers to business questions.

### Accessing GigsterCoach

1. Navigate to `/gigster-coach` or click **"GigsterCoach"** in the sidebar
2. Choose your interaction mode:
   - **Ask**: General Q&A about business topics
   - **Draft**: Generate content for invoices, proposals, contracts
   - **Review**: Get completeness checklists for documents

### Ask Mode

Get instant answers to business questions:

1. Select **"Ask"** tab
2. Type your question (e.g., "How should I price a web development project?")
3. Coach responds with expert guidance
4. Conversation history is saved for reference

**Example Questions**:
- "What should I include in a freelance contract?"
- "How do I handle a late-paying client?"
- "What's a fair hourly rate for graphic design?"

### Draft Mode

Generate professional content instantly:

1. Select **"Draft"** tab
2. Choose content type:
   - **Invoice Terms**: Payment terms, late fees, etc.
   - **Proposal Scope**: Project scope and deliverables
   - **Contract Clauses**: Legal language for agreements
   - **Email Messages**: Client communications
3. Provide context (client name, project type, specifics)
4. Click **"Generate"**
5. Review and edit the AI-generated content
6. Apply directly to your document

### Review Mode

Get completeness checklists for documents:

1. Select **"Review"** tab
2. Choose document type (invoice, proposal, contract)
3. Coach analyzes your document
4. Receive a checklist of:
   - Required fields present/missing
   - Suggested improvements
   - Common issues to address
   - Compliance recommendations

### Suggestions Inbox

**Plan Required**: Pro or Enterprise

Proactive suggestions from Coach appear in your inbox:

1. Navigate to `/gigster-coach/suggestions`
2. View pending suggestions
3. For each suggestion:
   - **Apply**: Execute the suggested action
   - **Dismiss**: Remove from inbox
4. Applied suggestions update your documents automatically

### Embedded Coach (Sidebar)

GigsterCoach is embedded in key editors:

**Invoice Builder**:
- Suggest payment terms
- Draft professional notes
- Review invoice completeness

**Proposal Editor**:
- Generate scope sections
- Draft deliverables lists
- Add terms and conditions

**Message Composer**:
- Draft professional responses
- Suggest follow-up language
- Review message tone

### Using the Apply Engine

When Coach makes a suggestion:

1. Review the suggested change
2. Click **"Apply"** button
3. Change is validated against whitelist:
   - `invoice.terms` → Invoice notes field
   - `proposal.scope` → Proposal terms
   - `message.body` → Message content
   - `proposal.deliverables` → Deliverables list
4. Change applied to your document
5. You can undo/edit after applying

### Governance & Safety

GigsterCoach operates under strict governance:

- **L0 Level**: Fully supervised - user must approve all actions
- **L1 Level**: Semi-autonomous - can draft but never send/post
- **Never Autonomous**: Coach never sends emails, posts content, or modifies data without explicit approval
- **Whitelist Validation**: Apply Engine only modifies pre-approved fields

---

## User Management

**Role Required**: Admin

### Adding Users

1. Navigate to **Settings → User Management**
2. Click **"+ Add User"**
3. Fill in details:
   - **Name**: Full name
   - **Email**: Login email
   - **Role**: Admin or User
   - **Password**: Initial password
   - **Plan**: Free, Pro, Enterprise
4. Click **"Create User"**
5. User receives welcome email

### User Permissions

#### Admin Privileges
- Full system access
- User management
- System settings
- Agent management
- Billing and plans
- Access all resources

#### User Privileges
- Create/manage own tasks
- View assigned tasks
- Access shared projects/clients
- Create own invoices
- Track time
- View own reports

### Deactivating Users

1. Find user in list
2. Click **"..."** menu
3. Select **"Deactivate"**
4. User loses access
5. Data remains intact
6. Can reactivate later

### Plan Assignment

Assign different plan tiers:
1. Click user to edit
2. Change **Plan** field
3. Select: Free, Pro, Enterprise
4. Set **Plan Expires At** (optional)
5. Click **"Update"**

Plans control access to:
- AI content generation
- Workflow automation
- Advanced reporting
- Feature limits

---

## Agent Management

**Role Required**: Admin

### Overview

Gigster Garage features 17 specialized AI agents that automate workflows across the development lifecycle. Agents operate at different autonomy levels (L0 supervised, L1 semi-autonomous) and are governed by policy-based exposure rules.

### Agent Tabs

#### 1. Overview
- **All Agents**: Complete list of 17 agents
- **Status**: Operational status (Green/Amber/Red)
- **Visibility**: Exposed to users or internal-only
- **Dashboard Card**: Widget enabled
- **Target Tool**: External integration

#### 2. Visibility Controls
- **Expose to Users**: Make agent user-facing
- **Dashboard Card**: Show on dashboard
- **External Tool**: Integration ID
- Toggle switches for quick changes

#### 3. Graduation Roadmap
- **Phase**: Current development phase
- **Target Tool**: Goal platform (Packsmith, iCadence, etc.)
- **Target Date**: Expected graduation
- **Criteria**: Requirements for promotion
- **Owner**: Responsible team member

#### 4. KPIs & Metrics
- **On-Time Rate**: Milestone completion percentage
- **Gate Escape**: Quality control metrics
- **Incidents**: Error count (30-day rolling)
- **Status**: Green (good), Amber (warning), Red (critical)
- **Promotion**: Ready for advancement indicator

#### 5. Exposure Policy
- **Policy-Based Governance**: L0/L1 autonomy framework
- **Policy Gates**: Required system implementations
  - `plan_enforcement`: ✅ Active
  - `privacy_center`: ✅ Active
  - `audit_ui`: ✅ Active
  - `rate_limits`: ✅ Active
  - `rollback_hooks`: ⏳ Pending

---

### Agent Summary Table

| Agent | Autonomy | Type | Tasks | API | Status |
|-------|----------|------|-------|-----|--------|
| **ITSA** | L0/L1 | Int/Ext | 4 | - | ✅ Ready |
| **SSK** | L1 | Int/Ext | 3 | - | ⏳ CI integration |
| **Planner** | L0/L1 | Int/Ext | 3 | - | ✅ Ready |
| **Exec Orchestrator** | L0/L1 | Int/Ext | 3 | - | ⏳ Rollback hooks |
| **Sentinel** | L0/L1 | Int/Ext | 3 | - | ✅ Ready |
| **Ledger** | L0/L1 | Int/Ext | 3 | - | ✅ Ready |
| **Helm** | L0/L1 | Internal | 2 | - | ✅ Active |
| **Packsmith** | L0/L1 | Internal | 1 | ✅ | ✅ Active |
| **iCadence** | L1 | Int/Ext | 2 | ✅ | ⏳ Sandbox |
| **Customer Success** | L0/L1 | External | 1 | - | ✅ Ready |
| **Experimenter** | L0/L1 | Internal | 1 | - | ✅ Active |
| **Template Lib** | L0/L1 | Internal | 1 | - | ✅ Active |
| **Importer** | L1 | Int/Ext | 2 | ✅ | ⏳ Wizard dev |
| **Accessibility** | L0/L1 | Internal | 1 | - | ✅ Active |
| **Evidence Archive** | L1 | Internal | 1 | - | ✅ Active |
| **Review Miner** | L0/L1 | External | 1 | - | ⏳ Approval flow |
| **SSO/Licensing** | L1 | Internal | 1 | - | ✅ Active |

**Legend:**
- **Autonomy**: L0 = Supervised, L1 = Semi-autonomous
- **Type**: Int = Internal, Ext = External (user-facing), Int/Ext = Both
- **API**: ✅ = Has REST API endpoints
- **Status**: ✅ Ready/Active, ⏳ Pending/Development

### All Agents (17 Total)

#### ITSA (Intake & Triage)
**Autonomy**: L0/L1 | **Type**: Internal & External

**Tasks**:
1. **Segment Auto-Draft + Risk Heatmap** (Internal, L0/L1)
   - Creates JSON summary with red/amber/green risk flags
   - **Metric**: % intakes with all required assets on first pass
   - **DoD**: Risk flags posted

2. **Readiness Score** (Internal, L0/L1)
   - Scores publish path, payments, and first channel (0-100 scale)
   - **Metric**: Average readiness on first submission
   - **DoD**: Score + gaps list

3. **Pack/Pod Recommender** (Internal, L0/L1)
   - Suggests packs with price deltas and DoD
   - **Metric**: Attach rate within 7 days
   - **DoD**: Options table with DoD per option

4. **Client-Facing Intake Summary** (External, L0/L1)
   - Shareable read-only summary page
   - **Metric**: Client completion time to 'all assets present'
   - **Exposure Rule**: When review_SLA_hours ≤ 24

**Status**: ✅ Ready for promotion (all gates active)

---

#### SSK (Starter & Scaffold Kit)
**Autonomy**: L1 | **Type**: Internal & External

**Tasks**:
1. **Inject Brand-Lock Tokens** (Internal, L1)
   - Creates PR with brand tokens + Tailwind config
   - **Metric**: CI 'brandlock' pass-rate
   - **DoD**: PR with tokens applied

2. **Scaffold Sanity Suite** (Internal, L1)
   - Validates routes/env/guards in new scaffolds
   - **Metric**: % scaffolds passing on first run
   - **DoD**: Checklist green for scaffold

3. **Starter Preview Diff** (External, L0/L1)
   - Shows files/README before generation
   - **Metric**: Preview→approve conversion rate
   - **Exposure Rule**: When ci_preflight_pass_rate ≥ 0.95 && sentinel_checks_passed

**Status**: ⏳ Awaiting CI integration

---

#### Planner (Evidence & DoD)
**Autonomy**: L0/L1 | **Type**: Internal & External

**Tasks**:
1. **Evidence Pack Planner** (Internal, L0/L1)
   - Adds evidence checklist to sprints
   - **Metric**: % evidence captured by sprint end
   - **DoD**: Checklist added to sprint

2. **Risk Timers on DoD Items** (Internal, L0/L1)
   - Creates auto-reminders for DoD items
   - **Metric**: On-time DoD close rate
   - **DoD**: Auto-reminders created

3. **Client DoD Acknowledgement** (External, L0/L1)
   - Captures client acknowledgement of deliverables
   - **Metric**: Time from draft→acknowledgement
   - **Exposure Rule**: When DoD_templates_locked

**Status**: ✅ Ready for promotion

---

#### Exec Orchestrator (Runbooks & Releases)
**Autonomy**: L0/L1 | **Type**: Internal & External

**Tasks**:
1. **Pre-Flight Blast Radius Estimator** (Internal, L0/L1)
   - Estimates deployment impact before release
   - **Metric**: % releases with rollback defined
   - **DoD**: Pre-flight report attached

2. **Staged Artifact Verifier** (Internal, L1)
   - Validates artifact hashes and manifests
   - **Metric**: Mismatch rate (~0 target)
   - **DoD**: Manifest + hashes posted

3. **Release Window Request** (External, L0/L1)
   - Client-facing release scheduling (preview/request only)
   - **Metric**: Approval turnaround time
   - **Exposure Rule**: Preview/request only (no auto-deploy)

**Status**: ⏳ Pending (needs rollback_hooks)

---

#### Sentinel (Security & Compliance)
**Autonomy**: L0/L1 | **Type**: Internal & External

**Tasks**:
1. **Rate-Limit Coverage Audit** (Internal, L0/L1)
   - Audits route groups for rate-limit coverage
   - **Metric**: Coverage percentage
   - **DoD**: Table of covered/uncovered routes

2. **PII Finder Dry-Run** (Internal, L0/L1)
   - Scans for PII issues, suggests PR fixes
   - **Metric**: PII issues resolved per sprint
   - **DoD**: Report + PR hints

3. **Security Scorecard** (External, L0/L1)
   - Read-only security scorecard for clients
   - **Metric**: Client acknowledgements
   - **Exposure Rule**: After privacy_center_live

**Status**: ✅ Ready for promotion

---

#### Ledger (Budgets & Invoices)
**Autonomy**: L0/L1 | **Type**: Internal & External

**Tasks**:
1. **Variance Commentator** (Internal, L0)
   - Adds notes on budget vs. actuals variance
   - **Metric**: Time-to-approve invoice
   - **DoD**: Note added to snapshot

2. **Cap-Breach Early Warning** (Internal, L1)
   - Creates alerts when budgets approach limits
   - **Metric**: Avoided cap breaches
   - **DoD**: Alert task created

3. **Draft Invoice Review** (External, L0/L1)
   - Client-facing invoice review with 'needs change' feedback
   - **Metric**: Revisions per invoice
   - **Exposure Rule**: When plan_entitlements_enforced

**Status**: ✅ Ready for promotion

---

#### Helm (Go-Live & Promotion)
**Autonomy**: L0/L1 | **Type**: Internal

**Tasks**:
1. **What's Blocking Go-Live Compiler** (Internal, L0/L1)
   - Compiles blockers list with owners and dates
   - **Metric**: Blockers resolved <48h
   - **DoD**: List with owners/dates

2. **Promotion Readiness Report** (Internal, L0/L1)
   - One-sheet with policy gaps for agent promotion
   - **Metric**: Time from green→exposed
   - **DoD**: One-sheet with policy gaps

**Status**: ✅ Active

---

#### Packsmith (Pack Creation)
**Autonomy**: L0/L1 | **Type**: Internal

**Tasks**:
1. **Create Pack Blueprint + Seed Tasks** (Internal, L0/L1)
   - Generates blueprint.json and seeds initial tasks
   - **Metric**: Time-to-first-value per pack
   - **DoD**: Blueprint + seeded tasks

**API**: `/api/packs/*` (see API Documentation section)

**Status**: ✅ Active

---

#### iCadence Connector (Channel Management)
**Autonomy**: L1 | **Type**: Internal & External

**Tasks**:
1. **Connect Channels + UTM Presets** (Internal, L1)
   - Connects channels, stores UTM presets and spend logs
   - **Metric**: % posts with valid UTM
   - **DoD**: Channel connected, presets stored

2. **Channel Connection Wizard** (External, L0/L1)
   - Client-facing wizard for channel setup
   - **Metric**: Channel connect rate
   - **Exposure Rule**: When rate_limits && audit_ui live (sandbox)

**API**: `/api/icadence/*` (see API Documentation section)

**Status**: ⏳ Sandbox mode

---

#### Customer Success Desk
**Autonomy**: L0/L1 | **Type**: External

**Tasks**:
1. **Status Feed + Gates + Invoice Drafts** (External, L0/L1)
   - Read-only customer portal surface
   - **Metric**: PM time saved, client satisfaction
   - **Exposure Rule**: When plan_enforcement && privacy_center && audit_ui

**Status**: ✅ Ready for promotion

---

#### Experimenter (A/B Testing)
**Autonomy**: L0/L1 | **Type**: Internal

**Tasks**:
1. **1-Page Experiment Plan** (Internal, L0/L1)
   - Creates plan.md + tracking params + tasks
   - **Metric**: Time-to-decision, uplift delta
   - **DoD**: plan.md + tasks created

**Status**: ✅ Active

---

#### Template Librarian
**Autonomy**: L0/L1 | **Type**: Internal

**Tasks**:
1. **Lint, Version, Publish Templates** (Internal, L0/L1)
   - Manages canonical templates
   - **Metric**: Template error rate
   - **DoD**: Templates marked canonical & published

**Status**: ✅ Active

---

#### Importer (Data Import)
**Autonomy**: L1 | **Type**: Internal & External

**Tasks**:
1. **CSV/Sheets Mapping** (Internal, L1)
   - Maps incoming data → staged import
   - **Metric**: Import success rate
   - **DoD**: Validated mapping + staged records

2. **Client Upload Wizard** (External, L0/L1)
   - Upload → mapping preview → pending import
   - **Metric**: Average fix-time for bad rows
   - **Exposure Rule**: When audit_ui && rate_limits

**API**: `/api/import/*` (see API Documentation section)

**Status**: ⏳ Wizard development

---

#### Accessibility Auditor (WCAG)
**Autonomy**: L0/L1 | **Type**: Internal

**Tasks**:
1. **WCAG Lint + PR Hints** (Internal, L0/L1)
   - Scans for accessibility issues
   - **Metric**: Issues fixed per sprint, AA coverage
   - **DoD**: AA report + suggested fixes

**Status**: ✅ Active

---

#### Evidence Archivist
**Autonomy**: L1 | **Type**: Internal

**Tasks**:
1. **Scoop Artifacts + Index** (Internal, L1)
   - Collects artifacts, generates SHA256, creates zip + index
   - **Metric**: Evidence completeness %
   - **DoD**: evidence_{sprint}.zip + index.md

**Status**: ✅ Active

---

#### Review Miner (Customer Feedback)
**Autonomy**: L0/L1 | **Type**: External

**Tasks**:
1. **Post-Purchase Review Outreach** (External, L0/L1)
   - Drafts review request emails
   - **Metric**: Review velocity, response rate
   - **Exposure Rule**: When rate_limits && audit_ui

**Status**: ⏳ Pending approval workflow

---

#### SSO/Licensing Handshake
**Autonomy**: L1 | **Type**: Internal

**Tasks**:
1. **Verify License JWT** (Internal, L1)
   - Verifies license tokens, sets entitlements
   - **Metric**: Entitlement errors/month, handshake latency
   - **DoD**: License verified, entitlements set

**Status**: ✅ Active

---

### Promoting Agents

1. Navigate to **Agent Management → Exposure Policy**
2. Review agent card for:
   - Current autonomy level
   - Required policy gates
   - KPI metrics
   - Exposure rules
3. Check **Policy Badge**:
   - ✅ Green "Policy Check: OK": All required gates active
   - ❌ Red "Policy Check: Missing": Some gates pending
4. If eligible, click **"Request Exposure"**
5. Agent transitions to user-facing status

### Agent Status Summary

**Ready for Promotion (4 policy gates active)**:
- ITSA
- Planner
- Sentinel
- Ledger
- Helm
- Packsmith
- Customer Success Desk
- Experimenter
- Template Librarian
- Accessibility Auditor
- Evidence Archivist
- SSO/Licensing Handshake

**Pending Development**:
- Exec Orchestrator (needs rollback_hooks)
- SSK (awaiting CI integration)
- iCadence Connector (sandbox mode)
- Importer (wizard development)
- Review Miner (approval workflow)

---

## Social Media Queue System

**Role Required**: Admin  
**Plan Required**: Enterprise

### Overview

The Social Media Queue System is an enterprise-grade social media scheduling and posting pipeline with webhook integration, intelligent rate limiting, automatic retry logic, and comprehensive analytics. It supports 6 major platforms: X (Twitter), Instagram, LinkedIn, Facebook, TikTok, and YouTube.

**Key Features**:
- **Webhook Integration**: Receive posts from iCadence scheduler
- **Intelligent Rate Limiting**: Per-platform token bucket algorithm with configurable caps
- **Exponential Backoff**: Automatic retry with smart delays (15s → 30min max, 8 attempts)
- **Media Validation**: Pre-flight URL and size checks with 6-hour caching
- **Burst Override**: Temporary capacity boost with linear tapering
- **Usage Analytics**: Real-time charts with 6h/24h/7d windows
- **Audit Trail**: Complete logging of all queue operations

---

### Architecture

#### Database Tables
The system uses 5 PostgreSQL tables:

1. **social_queue**: Queue items with retry state
   - Stores: platform, content (JSON), scheduled_at, status, attempts, next_attempt_at
   - Status values: pending, posting, posted, failed, paused, cancelled

2. **social_rate_limits**: Per-platform rate limits
   - Stores: window_seconds, max_actions, used_actions, window_started_at
   - Default limits: X (300/15min), Instagram/LinkedIn/Facebook (200/hour), TikTok (150/hour), YouTube (100/hour)

3. **social_rl_usage**: Consumption events for charting
   - Tracks every rate limit consumption with timestamp and amount
   - Used for historical analytics and usage charts

4. **social_rl_overrides**: Burst capacity overrides
   - Temporary capacity multiplier with start/expire timestamps
   - Linear tapering from factor → 1.0 over duration

5. **media_head_cache**: Cached HTTP HEAD responses
   - 6-hour TTL to avoid repeated HEAD requests
   - Stores: content_length, content_type, ok status

#### Worker Process
Background worker (`npm run worker:social`) polls queue every 5 seconds:
- Fetches pending items from database
- Checks rate limits before posting
- Executes platform-specific posting logic
- Handles failures with exponential backoff
- Logs all operations to audit system

---

### Social Queue Dashboard

**Location**: `/ops/social-queue` (Admin only)

#### Features

**Queue Monitoring**:
- Real-time status of all queued posts
- Color-coded status badges (pending, posting, posted, failed)
- Error messages with tooltips for failed items
- Scheduled time and platform display

**Filters**:
- **Status Filter**: All, Pending, Posting, Posted, Failed, Paused, Cancelled
- **Platform Filter**: All, X, Instagram, LinkedIn, Facebook, TikTok, YouTube
- Combined filtering for precise views

**Media Previews**:
- Up to 8 thumbnail images per post
- Lazy-loaded for performance
- Fallback for missing images

**Admin Controls** (per post):
- **Pause**: Temporarily suspend posting
- **Resume**: Reactivate paused post
- **Retry**: Manually trigger retry attempt
- **Cancel**: Remove from queue permanently

#### Usage

**View Queue**:
1. Navigate to `/ops/social-queue`
2. Use filters to find specific posts
3. Click column headers to sort
4. Hover over errors for full message

**Manage Posts**:
1. Find post in table
2. Click appropriate action button
3. Confirmation for destructive actions
4. Page auto-refreshes after operations

**Monitor Status**:
- Green badge: Successfully posted
- Blue badge: Pending in queue
- Yellow badge: Currently posting
- Red badge: Failed (see error column)
- Gray badge: Paused or cancelled

---

### Rate Limit Dashboard

**Location**: `/ops/rate-limits` (Admin only)

#### Features Overview

**Platform Management**:
- View all 6 platforms in single table
- Edit window duration (in seconds)
- Edit max actions per window
- Real-time usage tracking
- Instant window reset capability

**Usage Charts**:
- **Time Windows**: 6h / 24h / 7d aggregation
- **Chart Types**: Line or Bar view toggle
- **Moving Averages**: Auto-calculated overlays
  - 3-point MA for hourly data (6h/24h)
  - 2-point MA for daily data (7d)
- **CSV Export**: Download data for any window

**Burst Override**:
- **Capacity Multiplier**: 1.0x to 5.0x increase
- **Duration**: 1 to 240 minutes
- **Linear Tapering**: Automatic decay to normal over time
- **Example**: 2.0x for 60min = double capacity, gradually reducing to 1.0x

#### Configuration

**Edit Rate Limits**:
1. Navigate to `/ops/rate-limits`
2. Find platform row
3. Edit window_seconds or max_actions fields
4. Click **"Save"** button
5. Changes apply immediately

**Reset Window**:
1. Locate platform row
2. Click **"Reset Window"** button
3. Confirm action
4. Usage counter zeroes, new window starts

**Apply Burst Override**:
1. Enter capacity factor (e.g., 1.5 = +50%)
2. Enter duration in minutes (e.g., 30)
3. Click **"Apply"** button
4. Override activates with linear taper
5. Capacity gradually reduces to normal

**Example Scenario**:
```
Platform: X
Normal Limit: 300 posts / 15 minutes
Burst Override: 2.0x for 60 minutes

Minute 0:  600 posts allowed (2.0x)
Minute 15: 525 posts allowed (1.75x)
Minute 30: 450 posts allowed (1.5x)
Minute 45: 375 posts allowed (1.25x)
Minute 60: 300 posts allowed (1.0x - back to normal)
```

**Clear Override**:
1. Click **"Clear"** button for platform
2. Capacity immediately returns to 1.0x
3. Override record deleted from database

---

### Usage Analytics

#### Chart Features

**Time Window Selector**:
- **6 Hours**: Hourly buckets, recent activity
- **24 Hours**: Hourly buckets, daily patterns
- **7 Days**: Daily buckets, weekly trends

**Chart Types**:
- **Line Chart**: Smooth trend visualization
- **Bar Chart**: Spike identification
- Toggle between views with one click

**Moving Averages**:
- Orange line overlay on all charts
- Smooths noise for clearer trends
- Automatic calculation (3-point or 2-point)

**CSV Export**:
- Downloads complete dataset for selected window
- Format: bucket (ISO timestamp), total (count)
- Filename: `{platform}_usage_{window}.csv`
- Opens in Excel/Sheets for further analysis

#### Interpreting Charts

**Usage Patterns**:
- **Spikes**: Burst activity or override periods
- **Flat Periods**: Consistent posting rate
- **Dips**: Low activity or paused posts
- **MA Line**: Overall trend direction

**Capacity Planning**:
- Review 7d chart for growth trends
- Identify peak usage hours (24h chart)
- Adjust rate limits based on patterns
- Apply burst overrides during known peaks

---

### Webhook Integration

#### iCadence Integration

**Endpoint**: `/api/integrations/icadence/webhook`

**Supported Events**:
- `schedule.posted`: New post scheduled
- `schedule.deleted`: Post cancelled

**Event Payload** (schedule.posted):
```json
{
  "id": "evt_123",
  "source": "icadence",
  "type": "schedule.posted",
  "timestamp": "2025-11-06T18:00:00Z",
  "payload": {
    "profileId": "profile_123",
    "platform": "x",
    "scheduledAt": "2025-11-06T19:00:00Z",
    "content": {
      "text": "Your post content here",
      "mediaUrls": ["https://example.com/image.jpg"]
    }
  },
  "signature": "webhook_signature"
}
```

**Processing Flow**:
1. Webhook received and signature verified
2. Media URLs validated (protocol, size, reachability)
3. Item inserted into `social_queue` table with status=pending
4. Audit event logged: `social.queue.enqueued`
5. Worker picks up item on next poll cycle
6. Rate limit checked before posting
7. Platform adapter executes post
8. Status updated: `posted` or `failed`
9. Audit event logged for final state

---

### Media Validation

#### Pre-flight Checks

**Protocol Filtering**:
- Only `http://` and `https://` allowed
- Blocks: `file://`, `ftp://`, `data:`, etc.
- Throws error for disallowed protocols

**Size Validation**:
- HTTP HEAD request to check content-length
- Default limit: 10MB (configurable via `SOCIAL_MEDIA_MAX_BYTES`)
- Throws error if exceeds limit

**Reachability Check**:
- HEAD request with 5-second timeout
- Verifies URL is accessible
- Throws error if request fails

#### HEAD Caching

**Purpose**: Avoid repeated HEAD requests to same URL

**Cache Behavior**:
- 6-hour TTL (configurable via `MEDIA_HEAD_TTL_MS`)
- Database-backed (`media_head_cache` table)
- Stores: content_length, content_type, ok status
- Auto-refresh on TTL expiry

**Benefits**:
- Reduces external API calls by ~95%
- Faster validation for repeated URLs
- Network-friendly for high-volume scenarios

---

### Retry Logic

#### Exponential Backoff

**Configuration**:
- **Base Delay**: 15 seconds
- **Max Delay**: 30 minutes
- **Max Attempts**: 8 retries
- **Formula**: `min(30min, 15s * 2^attempt)`

**Retry Schedule**:
```
Attempt 1: 15 seconds
Attempt 2: 30 seconds
Attempt 3: 60 seconds (1 min)
Attempt 4: 120 seconds (2 min)
Attempt 5: 240 seconds (4 min)
Attempt 6: 480 seconds (8 min)
Attempt 7: 960 seconds (16 min)
Attempt 8: 1800 seconds (30 min - capped)
```

**Failure Handling**:
- After 8 attempts, status changes to `failed`
- Error message stored in `last_error` column
- Audit event logged: `social.queue.failed`
- Manual retry available via dashboard

**Rate Limit Handling**:
- If rate limited, status remains `pending`
- `next_attempt_at` set to window reset time
- Worker skips item until retry time
- Audit event: `social.queue.rate_limited`

---

### Audit Trail

#### Event Types

All queue operations emit audit events:

**Queue Lifecycle**:
- `social.queue.enqueued`: Item added to queue
- `social.queue.posting`: Started posting attempt
- `social.queue.posted`: Successfully posted
- `social.queue.failed`: Permanent failure after retries
- `social.queue.error`: Unexpected error

**Rate Limiting**:
- `social.queue.rate_limited`: Hit rate limit (with retry delay)
- `social.rl.updated`: Admin changed rate limit
- `social.rl.reset`: Admin reset window
- `social.rl.override_set`: Burst override applied
- `social.rl.override_cleared`: Burst override cancelled

**Admin Actions**:
- `social.queue.paused`: Admin paused post
- `social.queue.resumed`: Admin resumed post
- `social.queue.retry`: Admin triggered manual retry
- `social.queue.cancelled`: Admin cancelled post
- `social.queue.deleted`: Webhook deletion event

#### Audit Log Access

**View Events**:
1. Navigate to Admin → Audit Logs
2. Filter by event type (e.g., `social.queue.*`)
3. Search by platform or profile ID
4. Export for compliance/reporting

**Event Details**:
- Timestamp (UTC)
- Event type
- Actor ID (who performed action)
- Platform and content details
- Retry count and error messages

---

### Platform Adapters

#### Supported Platforms

**Currently Implemented** (stub adapters):
1. **X (Twitter)**: 300 posts / 15 minutes
2. **Instagram**: 200 posts / hour
3. **LinkedIn**: 200 posts / hour
4. **Facebook**: 200 posts / hour
5. **TikTok**: 150 posts / hour
6. **YouTube**: 100 posts / hour

**Adapter Interface**:
```typescript
interface PlatformAdapter {
  post(content: { text: string; mediaUrls?: string[] }): Promise<void>;
}
```

**Production Integration**:
- Replace stub adapters with real SDK calls
- Add OAuth token management
- Implement platform-specific media upload
- Handle platform-specific errors

---

### Configuration

#### Environment Variables

```bash
# Rate Limiting
SOCIAL_WORKER_POLL_MS=5000          # Worker polling interval
SOCIAL_MEDIA_MAX_BYTES=10485760     # 10MB media limit

# Media Validation
MEDIA_HEAD_TTL_MS=21600000          # 6 hour cache TTL

# Webhook Security
ICADENCE_WEBHOOK_SECRET=your_secret # Signature verification
```

#### Worker Management

**Start Worker**:
```bash
npm run worker:social
```

**Stop Worker**:
- Ctrl+C in terminal
- Or kill process by PID

**Worker Logs**:
- Poll frequency: Every 5 seconds
- Rate limit checks logged
- Posting attempts logged
- Errors logged with stack traces

**Monitoring**:
- Check worker terminal for activity
- Review audit logs for events
- Monitor queue dashboard for status

---

### Troubleshooting

#### Common Issues

**Posts Stuck in Pending**:
1. Check if worker is running: `ps aux | grep worker`
2. Verify rate limits not maxed out in dashboard
3. Check audit logs for `rate_limited` events
4. Review worker terminal for errors

**Media Validation Failures**:
1. Verify URL is accessible in browser
2. Check content-length < 10MB
3. Ensure protocol is http/https
4. Review `media_head_cache` table for failed entries

**Rate Limit Exceeded**:
1. Navigate to `/ops/rate-limits`
2. Check current usage vs. max_actions
3. Wait for window to reset, or click "Reset Window"
4. Consider applying burst override for temporary relief

**Worker Not Processing**:
1. Restart worker: `npm run worker:social`
2. Check database connection in worker logs
3. Verify `social_queue` table has pending items
4. Review worker code for platform adapter errors

#### Error Messages

**"Media file too large"**:
- Reduce image/video size before uploading
- Adjust `SOCIAL_MEDIA_MAX_BYTES` if necessary

**"Disallowed protocol"**:
- Use http:// or https:// URLs only
- Convert file:// or data: URLs to hosted links

**"Rate limit exceeded"**:
- Wait for window reset (shown in dashboard)
- Apply burst override if urgent
- Increase max_actions if consistent issue

**"Media HEAD failed or URL not reachable"**:
- Verify URL works in browser
- Check firewall/network settings
- Ensure media server allows HEAD requests

---

### Best Practices

#### Queue Management

**Regular Monitoring**:
- Review queue daily for failed items
- Investigate errors and retry manually
- Clear cancelled items periodically

**Rate Limit Planning**:
- Review 7d usage charts weekly
- Adjust limits based on growth patterns
- Apply burst overrides during launches

**Media Optimization**:
- Compress images before scheduling
- Host media on fast, reliable CDN
- Use formats supported by target platforms

#### Security

**Webhook Signature**:
- Always verify `ICADENCE_WEBHOOK_SECRET` matches
- Rotate secret periodically
- Log verification failures

**Admin Access**:
- Restrict `/ops/*` routes to admin role only
- Audit admin actions regularly
- Use strong admin passwords

#### Performance

**Worker Scaling**:
- Single worker sufficient for <1000 posts/day
- Multiple workers for high volume (with locking)
- Monitor worker memory usage

**Database Maintenance**:
- Vacuum `social_rl_usage` table monthly
- Archive old queue items (>90 days)
- Rebuild indexes if queries slow

**Cache Management**:
- Monitor `media_head_cache` size
- Prune entries older than TTL
- Consider increasing TTL if stable media

---

### Advanced Features

#### Burst Override Strategy

**Planned Events**:
- Apply 2.0x override 15 minutes before event
- Set duration to cover event + buffer (e.g., 60min)
- Monitor queue closely during event
- Clear override after peak if needed

**Emergency Scaling**:
- Apply 3.0x-5.0x for critical situations
- Keep duration short (15-30 min)
- Monitor worker logs for errors
- Taper allows gradual return to normal

#### Custom Platform Adapters

**Adding New Platforms**:
1. Create adapter in `server/integrations/icadence/platforms.ts`
2. Implement `post()` method with platform SDK
3. Add default rate limit to migration
4. Update UI to show new platform
5. Test with webhook payload

**Example Adapter**:
```typescript
export const customPlatform: PlatformAdapter = {
  async post(content) {
    // Initialize SDK
    const client = new CustomPlatformSDK({ apiKey: process.env.CUSTOM_API_KEY });
    
    // Upload media if present
    const mediaIds = [];
    if (content.mediaUrls) {
      for (const url of content.mediaUrls) {
        const id = await client.uploadMedia(url);
        mediaIds.push(id);
      }
    }
    
    // Post content
    await client.createPost({
      text: content.text,
      mediaIds
    });
  }
};
```

---

## Platform Connections

**Path**: `/settings/connections`

Manage your social media platform credentials for the Social Queue System.

### Overview

Platform Connections provides a secure interface for managing API credentials for:
- **X (Twitter)**: Post tweets and threads
- **Instagram**: Share images and stories
- **LinkedIn**: Professional content posting

### Connecting a Platform

#### X (Twitter)

1. Navigate to **Settings → Connections**
2. Find the **X/Twitter** card
3. Enter credentials:
   - **API Key**: From X Developer Portal
   - **API Secret**: From X Developer Portal
   - **Access Token**: Your account access token
   - **Access Secret**: Your account access secret
4. Click **"Save Credentials"**
5. Click **"Test Connection"** to verify

**Getting X API Credentials**:
1. Go to https://developer.twitter.com
2. Create a developer account
3. Create a new App
4. Generate API keys and Access tokens
5. Ensure "Read and Write" permissions

#### Instagram

1. Find the **Instagram** card
2. Enter credentials:
   - **Access Token**: From Meta Developer Portal
   - **Account ID**: Your Instagram Business Account ID
3. Click **"Save Credentials"**
4. Click **"Test Connection"** to verify

**Requirements**:
- Instagram Business or Creator account
- Connected to a Facebook Page
- Meta Developer App with Instagram Graph API enabled

#### LinkedIn

1. Find the **LinkedIn** card
2. Enter credentials:
   - **Access Token**: From LinkedIn Developer Portal
3. Click **"Save Credentials"**
4. Click **"Test Connection"** to verify

**Getting LinkedIn Credentials**:
1. Create app at https://developer.linkedin.com
2. Request "Share on LinkedIn" permission
3. Generate access token via OAuth flow

### Managing Connections

**Test Connection**:
- Verifies credentials are valid
- Shows success/failure status
- Diagnoses common issues

**Delete Credentials**:
- Removes stored credentials
- Requires re-configuration to post
- Does not affect queued posts

### Security

- Credentials stored encrypted in database
- Never displayed after initial entry
- Access restricted to account owner
- Audit logged for compliance

---

## Production Monitoring

**Path**: `/monitoring`  
**Role Required**: Admin

Real-time monitoring dashboard for production operations.

### SLO Metrics

Service Level Objectives displayed in real-time:

**Error Rate**:
- Target: < 1%
- Displays current error percentage
- Color-coded: Green (good) / Red (breach)

**Queue Age**:
- Target: < 5 minutes
- Oldest post waiting in queue
- Alerts when backlog grows

**Rate Limit Saturation**:
- Target: < 80%
- Usage across platforms
- Warns before hitting limits

### Queue Statistics

Visual charts showing queue health:

**Posts by Status**:
- Pending: Awaiting processing
- Processing: Currently posting
- Completed: Successfully posted
- Failed: Encountered errors

**Throughput**:
- Posts per hour
- Platform breakdown
- Historical trends

### System Health

**Worker Status**:
- Active/Idle workers
- Processing queue depth
- Error counts

**Platform Health**:
- X/Twitter: API status
- Instagram: API status
- LinkedIn: API status

### Auto-Refresh

Configure dashboard refresh interval:
- **10 seconds**: Live monitoring
- **30 seconds**: Active monitoring
- **60 seconds**: Background checks

### Alerts

System alerts displayed prominently:
- **Error Rate Breach**: Investigation needed
- **Queue Backup**: Processing delays
- **Rate Limit Warning**: Approaching limits
- **Worker Down**: Service interruption

---

## Settings & Preferences

### Account Settings

1. Navigate to **Settings → Account**
2. Configure:
   - **Name**: Your display name
   - **Email**: Login email
   - **Password**: Click "Change Password"
   - **Avatar**: Upload profile picture
   - **Current Plan**: View plan tier
   - **Plan Expires**: Renewal date
3. Click **"Save Changes"**

### Notification Preferences

1. Go to **Settings → Notifications**
2. Configure channels:
   - **Email**: Instant or digest
   - **In-App**: Browser notifications
   - **SMS**: Critical only
3. Set preferences:
   - **Task Assigned**: Email + In-App
   - **Mention**: Instant email
   - **Due Soon**: Daily digest
   - **Comments**: In-App only
4. **Quiet Hours**: Silence notifications
   - Start time: 10:00 PM
   - End time: 8:00 AM
5. Click **"Save Preferences"**

### Appearance

1. Go to **Settings → Appearance**
2. Customize:
   - **Theme**: Light, Dark, System
   - **Color Scheme**: Garage Navy (default)
   - **Density**: Comfortable, Compact
   - **Font Size**: Small, Medium, Large
   - **Sidebar**: Collapsed or Expanded
3. Changes apply immediately

### Integrations

1. Navigate to **Settings → Integrations**
2. Available integrations:
   - **Stripe**: Payment processing
   - **SendGrid**: Email delivery
   - **Twilio**: SMS notifications
   - **Slack**: Team messaging
   - **OpenAI**: AI features
   - **Google OAuth**: Social login
3. Click **"Connect"** on integration
4. Follow OAuth flow or enter API keys
5. Test connection
6. Click **"Save"**

### Data Management

1. Go to **Settings → Data**
2. Options:
   - **Export Data**: Download all your data
     - Format: JSON or CSV
     - Includes: Tasks, projects, time, invoices
   - **Import Data**: Upload from file
   - **Delete Account**: Permanent deletion (requires confirmation)
3. **Backup**: Download regularly for safety

### Privacy Settings

1. Navigate to **Settings → Privacy**
2. Configure:
   - **Profile Visibility**: Public, Team, Private
   - **Activity Sharing**: Who sees your activity
   - **Email Visibility**: Hide from team
   - **Time Tracking**: Public or private
3. **Data Processing**: View how data is used
4. **GDPR Rights**: Request data export/deletion

---

## Integrations

### Stripe Payment Processing

**Purpose**: Accept online payments for invoices

**Setup**:
1. Go to **Settings → Integrations**
2. Click **Stripe** card
3. Click **"Connect Stripe Account"**
4. Log in to Stripe or create account
5. Authorize Gigster Garage
6. **Test Mode**: Use for testing
7. **Live Mode**: Accept real payments

**Features**:
- Add payment button to invoices
- Client pays online via card
- Payment automatically recorded
- Invoice marked as paid
- Email confirmation sent

### SendGrid Email Delivery

**Purpose**: Send invoice emails and notifications

**Setup**:
1. Create SendGrid account
2. Generate API key
3. Go to **Settings → Integrations → SendGrid**
4. Enter API key
5. Verify sender email
6. Click **"Save & Test"**

**Features**:
- Professional email delivery
- Invoice sending
- Payment reminders
- Notification emails
- Delivery tracking

### Twilio SMS Notifications

**Purpose**: Send SMS alerts for critical events

**Setup**:
1. Create Twilio account
2. Get Account SID and Auth Token
3. Purchase phone number
4. Go to **Settings → Integrations → Twilio**
5. Enter credentials
6. Enter from phone number
7. Click **"Save & Test"**

**Features**:
- High-priority task alerts
- Overdue invoice reminders
- Payment received notifications
- Critical system alerts

### OpenAI Integration

**Purpose**: Enable AI content generation

**Setup**:
1. Get OpenAI API key
2. Go to **Settings → Integrations → OpenAI**
3. Enter API key
4. Select model (GPT-4o recommended)
5. Click **"Save & Test"**

**Features**:
- AI proposal generation
- Content creation
- Smart suggestions
- Auto-complete

---

## Security & Privacy

### Authentication

- **Password Hashing**: bcrypt with salt
- **Session Management**: Secure HTTP-only cookies
- **Session Expiry**: Automatic timeout
- **Two-Factor**: Available (Pro/Enterprise)

### Data Protection

- **Encryption at Rest**: AES-256-GCM
- **Encryption in Transit**: TLS 1.3
- **Key Rotation**: Automated rotation
- **Backup**: Encrypted backups

### Permission Enforcement

**Two-Tier Model**:

1. **OWNED Resources**:
   - Invoices: Only creator access
   - Tasks: Creator OR assignee access
   - Ownership validated on every request

2. **SHARED Resources**:
   - Projects: Organization-wide access
   - Clients: All users can view/edit

**Admin Override**: Admins bypass all checks

### Invoice Security

**Server-Side Calculations**:
- All totals calculated on server
- Client amounts ignored
- Prevents tampering
- Calculation logging
- Audit trail

**Validation**:
- Quantity and rate validation
- Negative value prevention
- Maximum amount limits
- Precision enforcement (2 decimals)

### Audit Logging

Track all actions:
- **User Actions**: Login, logout, changes
- **Data Changes**: Create, update, delete
- **Admin Actions**: Permission changes
- **API Calls**: External integrations
- **Failed Attempts**: Security events

View logs:
1. Navigate to **Admin → Audit Logs**
2. Filter by:
   - User
   - Action type
   - Date range
   - Resource type
3. Export for compliance

### GDPR Compliance

User rights:
- **Right to Access**: Export your data
- **Right to Erasure**: Delete account
- **Right to Portability**: Download data
- **Right to Rectification**: Update data

Exercise rights:
1. Go to **Settings → Privacy**
2. Click **"Data Rights"**
3. Select action
4. Confirm request
5. Data delivered within 30 days

---

## Keyboard Shortcuts

Press `?` anywhere to view this guide.

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open command palette |
| `Cmd/Ctrl + /` | Focus search |
| `?` | Show keyboard shortcuts |
| `Esc` | Close dialog/modal |
| `Cmd/Ctrl + S` | Save current form |

### Navigation

| Shortcut | Action |
|----------|--------|
| `G then D` | Go to Dashboard |
| `G then T` | Go to Tasks |
| `G then P` | Go to Projects |
| `G then I` | Go to Invoices |
| `G then C` | Go to Clients |
| `G then S` | Go to Settings |

### Quick Actions

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + N` | New task |
| `Cmd/Ctrl + Shift + N` | New project |
| `Cmd/Ctrl + E` | Edit selected item |
| `Cmd/Ctrl + D` | Duplicate |
| `Backspace` | Delete (with confirmation) |

### Task Management

| Shortcut | Action |
|----------|--------|
| `Space` | Start/stop timer |
| `M` | Mark complete |
| `1-3` | Set priority (1=High, 2=Medium, 3=Low) |
| `A` | Assign to me |
| `C` | Add comment |

### Lists & Tables

| Shortcut | Action |
|----------|--------|
| `↑/↓` | Navigate items |
| `Enter` | Open selected item |
| `Cmd/Ctrl + A` | Select all |
| `Shift + Click` | Select range |
| `Cmd/Ctrl + Click` | Toggle selection |

---

## API Documentation

### Overview

Gigster Garage provides comprehensive REST APIs for automation and integration. The API includes three specialized agent services plus core functionality.

**Base URL**: `http://localhost:8000/api` (development)  
**Authentication**: Session-based (HTTP-only cookies)  
**Format**: JSON  
**Version**: 0.1.0

### NPM Client Package

**Official TypeScript Client**: `@gigster-garage/api-client`

A type-safe, NPM-ready client library with full TypeScript support (ESM + CJS + type definitions).

#### Installation

```bash
npm install @gigster-garage/api-client
```

#### Quick Start

```typescript
import { createClient } from "@gigster-garage/api-client";

const client = createClient({ 
  baseUrl: "http://localhost:8000" 
});

// Create a pack
await client.postApiPacks({ 
  body: { 
    name: "Local Lift", 
    summary: "Starter pack", 
    price: 499 
  }
});

// Generate blueprint
await client.postApiPacksByPackIdBlueprint({ 
  params: { packId: "abc" }, 
  body: { 
    includeDoD: true, 
    includeKPIs: true 
  }
});
```

#### Features

**Core Client:**
- ✅ **Full TypeScript support** with generated type definitions  
- ✅ **ESM and CJS builds** for maximum compatibility  
- ✅ **22 API endpoints** (Packsmith, Importer, iCadence)  
- ✅ **Unit test scaffolds** included (Vitest with mocked fetch)  
- ✅ **Auto-build** with tsup bundler

**CI/CD Automation:**
- ✅ **CI pipeline** - Lint/test/build on every PR and push to main  
- ✅ **CodeQL security scanning** - Weekly + on every PR  
- ✅ **Dual registry support** - Publish to npm + GitHub Packages  
- ✅ **Auto-versioning** via release-please (conventional commits)  
- ✅ **GitHub Pages docs** - Auto-deployed TypeDoc on release  
- ✅ **NPM provenance** - Supply chain security attestation

**Governance & Workflow:**
- ✅ **CODEOWNERS** - Enforces team code review requirements  
- ✅ **Auto-assign reviewers** - Assigns 2 reviewers to every PR  
- ✅ **Auto-merge Release PRs** - Merges release-please PRs after CI  
- ✅ **Stale issue management** - Auto-closes after 30+7 days  
- ✅ **Issue templates** - Bug reports and feature requests  
- ✅ **PR template** - Standardized checklist  
- ✅ **Security policy** - Responsible disclosure (SECURITY.md)  
- ✅ **Contribution guide** - Onboarding docs (CONTRIBUTING.md)

#### Setup Instructions (Governed Edition)

After unzipping and pushing the governed package, configure these placeholders:

**1. Configure CODEOWNERS** (`.github/CODEOWNERS`):
```bash
# Replace YOUR_ORG with your organization slug (e.g., gigster-garage)
*                @gigster-garage/maintainers
/src/**          @gigster-garage/api @gigster-garage/maintainers
/test/**         @gigster-garage/qa @gigster-garage/maintainers
/.github/**      @gigster-garage/devops @gigster-garage/maintainers
```

**2. Configure Auto-Assign** (`.github/auto_assign.yml`):
```yaml
# Replace YOUR_HANDLE_1/2 with actual GitHub usernames
reviewers:
  - alice-dev
  - bob-reviewer
team_reviewers:
  - gigster-garage/maintainers
numberOfReviewers: 2
```

**3. Repository Settings:**
- **Branch Protection** (Settings → Branches → main):
  - ✅ Require PR before merging
  - ✅ Require status checks: `ci`, `test`, `build`
  - ✅ Require code owner reviews
- **GitHub Pages** (Settings → Pages):
  - Source: **GitHub Actions**
- **Secrets** (Settings → Secrets → Actions):
  - Add `NPM_TOKEN` from npmjs.com (Automation token)

**4. Automated Workflows:**

Once configured, everything runs automatically:

```bash
# Developer creates PR
git checkout -b feat/new-feature
git commit -m "feat: add feature X"
git push

# Automatic actions:
# → Auto-assigns 2 reviewers
# → Runs CI (lint/test/build)
# → Runs CodeQL security scan
# → Requires code owner approval
# → After merge: release-please opens Release PR
# → Auto-merge workflow waits for CI
# → Auto-merges Release PR
# → Creates tag vX.Y.Z
# → Publishes to npm + GitHub Pages
```

**5. Stale Management:**
- Runs Monday-Friday at 3:30 AM
- Marks inactive issues/PRs stale after **30 days**
- Auto-closes after **7 more days**
- Exempts: `security`, `good first issue`, `pinned`

#### Complete Package Structure

The governed edition includes **30 files** organized for enterprise-grade automation:

```
@gigster-garage/api-client/
├── src/index.ts                         # Client (22 endpoints)
├── test/                                # Vitest scaffolds
│   ├── packsmith.spec.ts
│   ├── importer.spec.ts
│   └── icadence.spec.ts
├── .github/
│   ├── workflows/                       # 9 automated workflows
│   │   ├── ci.yml                       # Lint/test/build
│   │   ├── release.yml                  # npm publish
│   │   ├── release-please.yml           # Auto-version
│   │   ├── docs-pages.yml               # GitHub Pages
│   │   ├── codeql.yml                   # Security scan
│   │   ├── release-gh-packages.yml      # GitHub Packages
│   │   ├── auto-assign.yml              # Reviewer assign
│   │   ├── automerge-release-pr.yml     # Release auto-merge
│   │   └── stale.yml                    # Issue cleanup
│   ├── ISSUE_TEMPLATE/                  # Issue templates
│   ├── CODEOWNERS                       # Review requirements
│   ├── PULL_REQUEST_TEMPLATE.md         # PR checklist
│   └── auto_assign.yml                  # Assignment config
├── CONTRIBUTING.md                      # Contributor guide
├── SECURITY.md                          # Security policy
├── PUBLISHING.md                        # Release guide
├── README.md                            # Package readme
└── Configuration files (6)              # npm, TS, TypeDoc, etc.
```

---

### Authentication API

#### Login
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# Response includes session cookie
```

#### Tasks
```bash
# List tasks
GET /api/tasks?project=123&status=in_progress

# Create task
POST /api/tasks
{
  "title": "New task",
  "projectId": "123",
  "priority": "high",
  "dueDate": "2025-12-31"
}

# Update task
PATCH /api/tasks/:id
{
  "status": "done"
}

# Delete task
DELETE /api/tasks/:id
```

#### Projects
```bash
# List projects
GET /api/projects

# Get project
GET /api/projects/:id

# Create project
POST /api/projects
{
  "name": "New Project",
  "clientId": "456"
}
```

#### Invoices
```bash
# List invoices
GET /api/invoices

# Create invoice
POST /api/invoices
{
  "clientId": "456",
  "lineItems": [
    {
      "description": "Web Development",
      "quantity": 40,
      "rate": 100
    }
  ],
  "taxRate": 10,
  "discountAmount": 0
}

# Record payment
POST /api/invoices/:id/payments
{
  "amount": 4400,
  "paymentDate": "2025-11-03",
  "paymentMethod": "check"
}
```

---

### Packsmith API

**Agent**: Packsmith  
**Purpose**: Create and manage service packs with automated blueprint generation

#### List Packs
```bash
GET /api/packs

# Response
{
  "items": [
    {
      "id": "pack_123",
      "name": "Local Lift",
      "summary": "Starter pack",
      "price": 499,
      "status": "active"
    }
  ]
}
```

#### Create Pack (Draft)
```bash
POST /api/packs
{
  "name": "Local Lift",
  "summary": "Website starter pack",
  "price": 499
}

# Response: 201 Created
{
  "id": "pack_123",
  "name": "Local Lift",
  "summary": "Website starter pack",
  "price": 499,
  "status": "draft"
}
```

#### Get Pack
```bash
GET /api/packs/{packId}

# Response
{
  "id": "pack_123",
  "name": "Local Lift",
  "summary": "Website starter pack",
  "price": 499,
  "status": "active"
}
```

#### Update Pack
```bash
PATCH /api/packs/{packId}
{
  "summary": "Updated description",
  "price": 599,
  "status": "active"
}

# Status options: draft, active, archived
```

#### Generate Blueprint (L1 Draft)
```bash
POST /api/packs/{packId}/blueprint
{
  "includeDoD": true,
  "includeKPIs": true
}

# Response
{
  "packId": "pack_123",
  "dod": [
    "Landing page deployed",
    "Contact form working",
    "Analytics installed"
  ],
  "kpis": [
    "Page load time < 2s",
    "Mobile responsive",
    "WCAG AA compliant"
  ],
  "tasks": [
    "Setup hosting",
    "Configure DNS",
    "Install SSL certificate"
  ],
  "updatedAt": "2025-11-03T12:00:00Z"
}
```

#### Get Blueprint
```bash
GET /api/packs/{packId}/blueprint

# Returns latest blueprint
```

#### Seed Tasks from Blueprint
```bash
POST /api/packs/{packId}/seed

# Creates draft tasks in the system
# Response: 201 Created
{
  "createdTasks": 12,
  "checklists": 3
}
```

---

### Importer API

**Agent**: Importer  
**Purpose**: Import data from CSV/Google Sheets with mapping and validation

#### Start Import Session
```bash
POST /api/import/sessions
{
  "entity": "tasks"  # or "contacts", "products"
}

# Response: 201 Created
{
  "id": "session_abc",
  "entity": "tasks",
  "status": "created",
  "createdAt": "2025-11-03T12:00:00Z"
}
```

#### Get Session Status
```bash
GET /api/import/sessions/{sessionId}

# Response
{
  "id": "session_abc",
  "entity": "tasks",
  "status": "mapping",  # created, uploaded, mapping, validated, staged, committed
  "createdAt": "2025-11-03T12:00:00Z"
}
```

#### Upload File
```bash
POST /api/import/sessions/{sessionId}/upload
Content-Type: multipart/form-data

file: [CSV or XLSX file]

# Response
{
  "rowsDetected": 150,
  "columns": [
    "Task Name",
    "Priority",
    "Due Date",
    "Assigned To"
  ]
}
```

#### Map Columns
```bash
POST /api/import/sessions/{sessionId}/map
{
  "mappings": [
    { "from": "Task Name", "to": "title" },
    { "from": "Priority", "to": "priority" },
    { "from": "Due Date", "to": "dueDate" },
    { "from": "Assigned To", "to": "assignedTo" }
  ]
}

# Response
{
  "unmapped": []  # columns not mapped
}
```

#### Validate Import
```bash
POST /api/import/sessions/{sessionId}/validate

# Response
{
  "errors": [
    {
      "row": 5,
      "column": "priority",
      "message": "Invalid priority value"
    }
  ],
  "warnings": [
    {
      "row": 12,
      "column": "dueDate",
      "message": "Date format unusual"
    }
  ],
  "validRows": 145,
  "invalidRows": 5
}
```

#### Stage Import
```bash
POST /api/import/sessions/{sessionId}/stage

# Stages valid rows for approval
# Response: 201 Created
{
  "stagedRows": 145,
  "pendingApproval": true
}
```

#### Commit Import (Requires Approval)
```bash
POST /api/import/sessions/{sessionId}/commit

# Commits staged rows to database
# Response: 202 Accepted
{
  "status": "processing",
  "importedRows": 145
}
```

#### Cancel Session
```bash
DELETE /api/import/sessions/{sessionId}

# Response: 204 No Content
```

---

### iCadence API

**Agent**: iCadence Connector  
**Purpose**: Manage marketing channels with UTM tracking and spend attribution

#### List Channels
```bash
GET /api/icadence/channels

# Response
{
  "items": [
    {
      "id": "channel_123",
      "name": "Facebook Ads",
      "platform": "facebook",
      "status": "connected",
      "utmPresets": {
        "utm_source": "facebook",
        "utm_medium": "paid"
      }
    }
  ]
}
```

#### Start Channel Connection (Wizard)
```bash
POST /api/icadence/channels
{
  "platform": "facebook",  # or "google", "twitter", "linkedin"
  "name": "Facebook Ads Campaign"
}

# Response: 201 Created
{
  "id": "session_xyz",
  "platform": "facebook",
  "status": "pending_auth",
  "authUrl": "https://facebook.com/oauth/authorize?..."
}
```

#### Get Channel Details
```bash
GET /api/icadence/channels/{channelId}

# Response
{
  "id": "channel_123",
  "name": "Facebook Ads",
  "platform": "facebook",
  "status": "connected",
  "connectedAt": "2025-11-03T12:00:00Z",
  "utmPresets": {
    "utm_source": "facebook",
    "utm_medium": "paid",
    "utm_campaign": "fall2025"
  }
}
```

#### Set UTM Presets
```bash
PUT /api/icadence/channels/{channelId}/utms
{
  "utm_source": "facebook",
  "utm_medium": "paid",
  "utm_campaign": "fall2025",
  "utm_term": "software",
  "utm_content": "carousel_ad"
}

# Response
{
  "id": "channel_123",
  "utmPresets": { /* updated presets */ }
}
```

#### Test Post (Sandbox)
```bash
POST /api/icadence/channels/{channelId}/test-post
{
  "message": "Test post content",
  "utmParams": {
    "utm_campaign": "test_campaign"
  }
}

# Response
{
  "status": "posted",
  "postId": "post_456",
  "previewUrl": "https://platform.com/posts/456"
}
```

#### Ingest Spend Logs
```bash
POST /api/icadence/spend
{
  "entries": [
    {
      "channelId": "channel_123",
      "date": "2025-11-03",
      "amount": 150.00,
      "currency": "USD",
      "impressions": 50000,
      "clicks": 1200
    }
  ]
}

# Response: 202 Accepted
```

---

### Rate Limiting

- **Free Plan**: 100 requests/hour
- **Pro Plan**: 1000 requests/hour
- **Enterprise**: 10000 requests/hour

### Webhooks

Configure webhooks to receive real-time events:

1. Go to **Settings → Webhooks**
2. Click **"+ Add Webhook"**
3. Enter endpoint URL
4. Select events:
   - task.created
   - task.updated
   - invoice.paid
   - project.completed
5. Save webhook

**Payload Format**:
```json
{
  "event": "task.created",
  "timestamp": "2025-11-03T12:00:00Z",
  "data": {
    "id": "123",
    "title": "New task",
    "status": "to_do"
  }
}
```

---

## Troubleshooting

### Common Issues

#### Cannot log in
- **Check credentials**: Email and password correct?
- **Caps Lock**: Password is case-sensitive
- **Account active**: Admin may have deactivated
- **Clear cache**: Browser cache corruption
- **Try incognito**: Rule out extensions

#### Tasks not showing
- **Check filters**: Remove active filters
- **Project filter**: Ensure "All Projects" selected
- **Status filter**: Include all statuses
- **Archived**: Check "Show Archived"
- **Permissions**: Ensure you have access

#### Timer not working
- **Already running**: Only one timer at a time
- **Task required**: Must select a task
- **Permissions**: Need access to task
- **Browser**: Check browser permissions
- **Network**: Requires internet connection

#### Invoice calculation wrong
- **Check quantity**: Ensure correct units
- **Check rate**: Verify price per unit
- **Tax rate**: Percentage, not decimal
- **Discount**: Fixed amount, not percentage
- **Server calculates**: Client values ignored

#### Workflow rule not triggering
- **Rule enabled**: Check status toggle
- **Conditions**: Review condition logic
- **Test mode**: Disable for production
- **Logs**: Check execution logs
- **Plan**: Requires Pro/Enterprise

### Performance Issues

#### Slow loading
- **Clear cache**: Browser cache buildup
- **Internet**: Check connection speed
- **Too many tabs**: Close unnecessary tabs
- **Browser**: Update to latest version
- **Extensions**: Disable interfering extensions

#### Database errors
- **Contact admin**: May need maintenance
- **Check logs**: Review error messages
- **Try later**: Temporary outage
- **Report**: Submit bug report

### Getting Help

1. **Check Manual**: Search this document
2. **Keyboard Shortcuts**: Press `?`
3. **Contact Support**: Email support team
4. **Report Bug**: Include error details
5. **Feature Request**: Submit via feedback form

---

## Appendix

### Glossary

- **Agent**: Automated system component
- **KPI**: Key Performance Indicator
- **Billable**: Client-facing work
- **Non-Billable**: Internal work
- **Subtask**: Task within a task
- **Milestone**: Project checkpoint
- **Policy Gate**: Required system feature
- **L0/L1**: Autonomy levels (supervised/semi-autonomous)

### Change Log

**Version 1.2.0** (December 2025)
- GigsterCoach AI Business Coach with Ask/Draft/Review modes
- Suggestions Inbox with Apply/Dismiss actions
- Apply Engine for safe document modifications
- Embedded Coach sidebar in Invoice, Proposal, and Message editors
- Platform Connections management (X, Instagram, LinkedIn)
- Production Monitoring dashboard with SLO metrics
- Real-time queue statistics and system health indicators
- Auto-refresh monitoring with configurable intervals

**Version 1.1.0** (November 2025)
- Social Media Queue System with iCadence integration
- Intelligent rate limiting and burst capacity
- Webhook integrations for post scheduling
- Quick-start onboarding flow
- Brand development wizard

**Version 1.0.0** (November 2025)
- Initial release
- Core task management
- Time tracking
- Invoice generation
- User management
- Agent management
- Exposure policy system

---

**End of User Manual**

For quick start instructions, see [Quick Start Guide](QUICK_START.md).

Need help? Contact support or check the troubleshooting section above.
