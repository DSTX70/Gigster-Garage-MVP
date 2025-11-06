# Gigster Garage - Simplified Workflow Hub

## Overview

Gigster Garage is a comprehensive time tracker and workflow management system built with a full-stack TypeScript architecture. Its purpose is to provide a clean, intuitive interface for creating, managing, and tracking tasks with advanced features. Key capabilities include Custom Fields, Workflow Automation, Team Collaboration, AI-powered content generation, and an integrated Garage Assistant UI. The application features an enhanced invoice builder with auto-fill functionality and streamlined workflow automation, adhering to a monorepo structure with a React frontend, Express.js backend, and PostgreSQL database. The system follows a consistent Garage Navy branding. The business vision is to deliver a robust, intuitive, and efficient workflow hub, with market potential in professional services, small to medium-sized businesses, and individual freelancers seeking advanced productivity tools. The project ambitions include becoming a leading platform for integrated workflow management and intelligent task automation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions

The application incorporates the Garage Navy branding with #004C6D and #0B1D3A as primary colors, applied consistently across components and pages. It features an enhanced invoice builder with auto-fill, a redesigned Workflow Automation page, and integrated Garage Assistant UI. Project dashboards include Kanban boards and Gantt chart timeline views, adapting to screen sizes. Recent enhancements include a global Command Palette (Cmd+K/Ctrl+K) for quick search and actions, a centralized Settings/Preferences page, a keyboard shortcuts guide (?), a floating Quick Action Button (FAB), an Offline Mode Indicator, and a reusable Empty States Component.

### Technical Implementations

The project is a full-stack TypeScript monorepo.
The frontend is built with React, using TailwindCSS with shadcn/ui for styling, TanStack Query for state management, Wouter for routing, and React Hook Form with Zod for form handling. Vite is used for building.
The backend uses Express.js with TypeScript in an ESM module setup, employing Drizzle ORM for database integration and Zod for shared validation schemas. It follows a RESTful API design.
Security features include a two-tier resource permission model (OWNED/SHARED), admin override capabilities, server-side recalculation of financial data to prevent tampering, and a three-tier plan enforcement model (Free, Pro, Enterprise) with feature gating via `requirePlan` middleware.

### Feature Specifications

-   **Time Tracking**: Comprehensive time tracking with project allocation and productivity reporting.
-   **Workflow Automation**: Custom rules and automation engine with a visual builder.
-   **AI Content Generation**: Proposal and content creation using stable AI models (GPT-4o).
-   **Invoice Builder**: Auto-fill functionality for company and client information.
-   **Task Management**: Advanced features including priority, due dates, assignments, notes, attachments, intelligent reminders, subtask hierarchies, and circular dependency prevention.
-   **Agent KPI Tracking**: Monitoring system with automated graduation tracking and real-time Hub API integration.
-   **Agent Exposure Policy**: Policy-based agent governance system with autonomy levels (L0/L1), exposure rules, and promotion criteria defined in `policy/agent_exposure_policy.json`.
-   **Pricing & Feature Flags**: Environment-aware feature flags and a three-tier pricing comparison matrix.
-   **Notifications**: Email (SendGrid) and SMS (Twilio) notifications.
-   **User Management**: Multi-user authentication, role-based access, onboarding, and an admin dashboard.
-   **Social Queue System**: End-to-end social media posting pipeline with webhook integration, database-backed queue, rate limiting, media pre-flight validation and caching, audit logging, and admin operations for managing posts and monitoring rate limits.

### System Design Choices

The application uses PostgreSQL with Drizzle ORM for its database, providing type safety and managed migrations. Authentication is session-based with bcrypt password hashing. The project uses npm for package management, Vite for development with hot module replacement, and ESLint/Prettier for code quality. A professional TypeScript client package (`@gigster-garage/api-client`) is available for API integration. Comprehensive demo materials, including an interactive HTML tutorial and an automated video demo, are provided for onboarding and training.

## External Dependencies

-   **@neondatabase/serverless**: PostgreSQL database connection.
-   **drizzle-orm** & **drizzle-kit**: ORM and migration tools.
-   **express**: Node.js web framework.
-   **react** & **react-dom**: Core React libraries.
-   **@tanstack/react-query**: Server state management.
-   **@radix-ui/***: Accessible UI primitives.
-   **tailwindcss**: CSS framework.
-   **lucide-react**: Icon library.
-   **vite**: Build tool.
-   **typescript**: Static type checking.
-   **zod**: Schema validation.
-   **react-hook-form**: Forms library.
-   **date-fns**: Date manipulation library.
-   **wouter**: Routing library.
-   **openai**: OpenAI API integration (using GPT-4o).
-   **SendGrid**: Email notifications.
-   **Twilio**: SMS notifications.