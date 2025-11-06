# Gigster Garage - Simplified Workflow Hub

## Overview

Gigster Garage is a comprehensive time tracker and workflow management system built with a full-stack TypeScript architecture. Its purpose is to provide a clean, intuitive interface for creating, managing, and tracking tasks with advanced features. Key capabilities include Custom Fields, Workflow Automation, Team Collaboration, AI-powered content generation, and an integrated Garage Assistant UI. The application features an enhanced invoice builder with auto-fill functionality and streamlined workflow automation. It follows a monorepo structure with a React frontend, Express.js backend, and PostgreSQL database integration. The system adheres to a consistent Garage Navy branding with primary colors #004C6D and #0B1D3A.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The client-side is built with React and TypeScript, utilizing:
- **UI Framework**: React with TypeScript.
- **Styling**: TailwindCSS with shadcn/ui.
- **State Management**: TanStack Query (React Query).
- **Routing**: Wouter.
- **Form Handling**: React Hook Form with Zod validation.
- **Build Tool**: Vite.
It follows a component-driven architecture with reusable UI components and separation of concerns.

### Backend Architecture

The server-side uses Express.js with TypeScript in an ESM module setup:
- **Framework**: Express.js with TypeScript.
- **Database Integration**: Drizzle ORM.
- **Validation**: Zod schemas shared between client and server.
- **API Design**: RESTful endpoints.
The backend implements a clean architecture with separated concerns for routes, storage, and business logic.

### Security & Permission Model

The application implements a two-tier resource permission model:

**OWNED Resources** (with `createdById` field):
- **Invoices**: Users can only access/modify invoices they created. Enforced via storage layer filtering `getInvoice(id, userId)`.
- **Tasks**: Users can access tasks they created (`createdById`) OR are assigned to (`assignedToId`). Enforced via `checkTaskOwnership()` helper.
- **Proposals**: Similar ownership model (if implemented).

**SHARED Resources** (no ownership field):
- **Projects**: Organization-wide access. All authenticated users can view/edit any project.
- **Clients**: Organization-wide access. All authenticated users can view/edit any client.

**Admin Override**: Admin role (`role === 'admin'`) bypasses all ownership checks and can access all resources.

**Invoice Financial Calculations**: All invoice totals are recalculated server-side using `server/utils/invoice-calculations.ts` to prevent client-side tampering. Client-side calculations are display-only.

**Plan Enforcement**: The application implements a three-tier pricing model (Free, Pro, Enterprise) with feature gating:
- **Plan Tiers**: Defined in `shared/plans.ts` with specific feature entitlements and limits.
- **Middleware**: `requirePlan(tier)` middleware enforces plan requirements on expensive endpoints.
- **Protected Features**: AI content generation, workflow automation, advanced reporting require Pro+ plans.
- **Database Fields**: Users table includes `plan`, `planExpiresAt`, and `featuresOverride` for custom entitlements.
- **Admin Override**: Admins bypass all plan restrictions.
- **Note**: Database migration pending - run `npm run db:push --force` to apply schema changes.

### Database Design

The application uses PostgreSQL with Drizzle ORM, featuring:
- **Tables**: Users, Projects, Tasks, Presentations, and Agent KPIs.
- **Type Safety**: Drizzle generates TypeScript types from schema definitions with proper relations.
- **Migrations**: Database schema changes managed through Drizzle migrations.
- **Authentication**: Session-based authentication with bcrypt password hashing.

### Build and Development

The project uses:
- **Package Management**: npm.
- **Development**: Hot module replacement with Vite.
- **Production Build**: Optimized builds.
- **Type Checking**: TypeScript compiler with strict mode.
- **Code Quality**: ESLint and Prettier.

### UI/UX Decisions

The application incorporates the Garage Navy branding with #004C6D and #0B1D3A as primary colors, applied consistently across components and pages. It features an enhanced invoice builder with auto-fill, a redesigned Workflow Automation page, and integrated Garage Assistant UI. Project dashboards include Kanban boards and Gantt chart timeline views, adapting to screen sizes.

**Recent UI/UX Enhancements (November 2025):**
- **Command Palette (Cmd+K/Ctrl+K)**: Global search and quick actions accessible from anywhere. Search tasks, projects, clients, invoices, and execute common actions without navigating. Features recent pages tracking and keyboard navigation.
- **Settings/Preferences Page**: Centralized account management with 5 sections (Account, Notifications, Appearance, Integrations, Data). Includes password updates, notification preferences, quiet hours, timezone/date format customization, and data export.
- **Keyboard Shortcuts Guide (?)**: Press '?' to view comprehensive keyboard shortcuts overlay with categorized shortcuts (General, Quick Actions, Navigation).
- **Quick Action Button (FAB)**: Floating action button in bottom-right corner for instant access to common actions (New Task, Start Timer, Create Invoice, etc.) from any page.
- **Offline Mode Indicator**: Automatic banner notification when internet connection is lost/restored, with clear messaging about data sync status.
- **Empty States Component**: Reusable empty state component with icons, descriptions, and action buttons to guide users when lists/pages are empty.
- **UX Polish**: Enhanced tooltips, loading states, keyboard accessibility, and improved visual feedback throughout the application.

### Feature Specifications

- **Time Tracking**: Comprehensive time tracking with project allocation and productivity reporting.
- **Workflow Automation**: Custom workflow rules and automation engine with visual rule builder.
- **AI Content Generation**: Reliable proposal and content creation using stable AI models (GPT-4o).
- **Invoice Builder**: Auto-fill functionality for company and client information.
- **Task Management**: Advanced task features including priority levels, due dates, task assignments, notes, file attachments, URL links, intelligent reminder notifications, subtask hierarchies, and circular dependency prevention.
- **Agent KPI Tracking**: Monitoring system with automated graduation tracking and real-time Hub API integration for status synchronization.
- **Agent Exposure Policy**: Policy-based agent governance system with autonomy levels (L0/L1), exposure rules, and promotion criteria. Located at `policy/agent_exposure_policy.json` and displayed in Agent Management → Exposure Policy tab. Includes 7 agents (ITSA, SSK, Planner, Exec Orchestrator, Sentinel, Ledger, Helm) with defined internal actions, external surfaces, approval requirements, and policy gates. Agents can only be promoted when all required policy gates are active (plan_enforcement, privacy_center, audit_ui, rate_limits, rollback_hooks).
- **Pricing & Feature Flags**: Environment-aware feature flags and a three-tier pricing comparison matrix.
- **Notifications**: Email notifications (via SendGrid) for high-priority tasks and integrated SMS notifications (Twilio).
- **User Management**: Multi-user authentication, role-based access, user onboarding, and an admin dashboard for user and task management.

## NPM Client Package

A professional TypeScript client package is available for API integration:
- **Package**: `@gigster-garage/api-client`
- **Repository Seed**: `gigster-garage-api-client_super-seed_governed.zip` (complete with CI/CD)
- **Features**: 30 files including TypeScript client, Vitest tests, 6 GitHub workflows, CODEOWNERS, auto-assign, stale management, auto-merge Release PRs, issue/PR templates, security policy, and contribution guidelines.
- **Endpoints**: 22 API endpoints (Packsmith, Importer, iCadence)
- **Documentation**: See `docs/USER_MANUAL.md` → API Documentation section

## Demo & Tutorial System

Comprehensive demo materials for user onboarding, sales, and training:

**Interactive HTML Tutorial** (Recommended):
- **File**: `demo/interactive-tutorial.html`
- **Features**: 10-chapter guided walkthrough, self-contained, zero dependencies
- **Use Cases**: User onboarding, sales demonstrations, training
- **Access**: Open directly in browser or deploy to static hosting

**Automated Video Demo** (Advanced):
- **Script**: `demo/video-demo.ts` (Puppeteer + ffmpeg)
- **Duration**: ~90 seconds, 9 scenes
- **Output**: MP4 video, narration script, individual screenshots
- **Command**: `npm run demo:video`
- **Note**: Uses deterministic selector-based waits for SPA navigation (data-testid, role attributes, XPath)

**Documentation**:
- `demo/README.md` - Complete setup, deployment, troubleshooting
- `demo/narration-script.md` - Professional voiceover script with production notes
- `demo/index.html` - Demo hub landing page

**Coverage**: Login, dashboard, task creation, time tracking, invoicing, command palette, workflow automation, AI agents, settings

## Social Queue System

Complete end-to-end social media posting pipeline with webhook-based integration:

**Architecture**:
- **Database**: `social_queue` table with status tracking, exponential backoff retry logic, and attempt counters
- **Rate Limiting**: `social_rate_limits` table with per-platform token buckets (configurable window and max actions)
- **Webhook Integration**: iCadence `/api/integrations/icadence/webhook` endpoint for schedule.posted and schedule.deleted events
- **Worker Process**: Background worker (`npm run worker:social`) with exponential backoff (15s base, 30min max, 8 attempts)
- **Platform Adapters**: Modular adapters for X, Instagram, LinkedIn, Facebook, TikTok, YouTube (stub implementations)

**Features**:
- **Media Pre-flight Validation**: URL protocol checks (http/https only) and size limits (10MB default via `SOCIAL_MEDIA_MAX_BYTES`)
- **Media HEAD Caching**: Database-backed cache (`media_head_cache` table) to avoid repeated HEAD requests (6 hour TTL)
- **Audit Logging**: All queue operations emit audit events (enqueued, posting, posted, failed, rate_limited, paused, resumed, retry, cancelled)
- **Admin Operations**: `/ops/social-queue` page with filters (status, platform), controls (pause/resume/retry/cancel), and thumbnail previews
- **Rate Limit Dashboard**: `/ops/rate-limits` page with comprehensive controls:
  - **Usage Charts**: Visualize consumption with Line/Bar charts, 3 time windows (6h/24h/7d)
  - **Moving Averages**: Automatic MA overlays (3-point for hourly, 2-point for daily)
  - **Burst Override**: Temporary capacity boost with linear tapering (1.0→factor→1.0)
  - **CSV Export**: Download usage data for any time window
  - **Window Management**: Edit caps, reset windows, real-time usage tracking
- **Thumbnail Previews**: Up to 8 lazy-loaded media thumbnails per post in admin UI

**Configuration**:
- `SOCIAL_MEDIA_MAX_BYTES`: Max media file size in bytes (default: 10485760 = 10MB)
- `SOCIAL_WORKER_POLL_MS`: Worker polling interval (default: 5000ms)
- `MEDIA_HEAD_TTL_MS`: Media HEAD cache TTL in milliseconds (default: 21600000 = 6 hours)
- `ICADENCE_WEBHOOK_SECRET`: Webhook signature verification secret

**Database Tables**:
- `social_queue`: id, profile_id, platform, content (jsonb), scheduled_at, status, attempts, next_attempt_at, last_error
- `social_rate_limits`: platform, window_seconds, max_actions, used_actions, window_started_at
- `social_rl_usage`: id, platform, used_at, amount (for charting)
- `social_rl_overrides`: platform (pk), factor, started_at, expires_at (burst overrides)
- `media_head_cache`: url (pk), content_length, content_type, ok, checked_at

**Rate Limits** (default):
- X: 300 posts per 15 minutes
- Instagram/LinkedIn/Facebook: 200 posts per hour
- TikTok: 150 posts per hour
- YouTube: 100 posts per hour

## Scaffolded Features

The following features have been scaffolded for future implementation (see `docs/SCAFFOLDED_FEATURES.md` for details):

1. **Social Platform Adapters**: Real X, Instagram, LinkedIn API implementations (Priority: High)
2. **Worker Scaling**: Multi-process worker launcher with concurrency support (Priority: Medium)
3. **SLO Monitoring**: Social queue error budget and queue age alerts (Priority: Medium)
4. **RFP Management**: Draft service and ingest page for RFP workflows (Priority: Low)
5. **Loyalty Rewards**: Points system with admin dashboard (Priority: Low)
6. **Brand Audit**: Tailwind token accessibility checker (Priority: Low)
7. **SSO Org Binding**: Multi-organization support with SSO (Priority: Low)
8. **Pricing & Entitlements**: Enhanced pricing page with middleware enforcement (Priority: Medium)
9. **GTM Launch Pack**: Marketing materials and content calendar (Priority: Low)
10. **IP Documentation**: Provisional patent snapshot and trade secret register (Priority: Low)

**Files Created**: 13 scaffolded files ready for development  
**Documentation**: Complete implementation roadmap in `docs/SCAFFOLDED_FEATURES.md`

## External Dependencies

- **@neondatabase/serverless**: PostgreSQL database connection.
- **drizzle-orm** and **drizzle-kit**: ORM and migration tools.
- **express**: Node.js web framework.
- **react** and **react-dom**: Core React libraries.
- **@tanstack/react-query**: Server state management.
- **@radix-ui/***: Accessible UI primitives.
- **tailwindcss**: CSS framework.
- **lucide-react**: Icon library.
- **vite**: Build tool.
- **typescript**: Static type checking.
- **zod**: Schema validation.
- **react-hook-form**: Forms library.
- **date-fns**: Date manipulation library.
- **wouter**: Routing library.
- **openai**: OpenAI API integration (using GPT-4o).
- **SendGrid**: Email notifications.
- **Twilio**: SMS notifications.