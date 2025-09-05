# SymbiosoAi - Simplified Workflow Hub

## Overview

SymbiosoAi is a comprehensive time tracker and workflow management system built with a full-stack TypeScript architecture. The application has evolved to include Custom Fields, Workflow Automation, Team Collaboration, AI-powered content generation, and integrated Garage Assistant UI. The system follows the Garage Navy branding with primary colors including Garage Navy (#004C6D) and Ignition Teal (#0B1D3A) for consistent professional appearance. The application features an enhanced invoice builder with auto-fill functionality, streamlined workflow automation, and reliable AI content generation. The application provides a clean, intuitive interface for creating, managing, and tracking tasks with advanced features including priority levels, due dates, task assignments, notes, file attachments, URL links, and intelligent reminder notifications. It follows a monorepo structure with a React frontend, Express.js backend, and in-memory storage using a clean storage abstraction pattern.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **Invoice Builder Auto-Fill Enhancement** (Completed September 2025): Implemented comprehensive auto-fill functionality where company name and address entered at the top automatically populate invoice previews, streamlining invoice creation workflow
- **Enhanced Company Information Fields** (Added September 2025): Added dedicated company information section with company name and address fields in invoice builder, organized with blue-styled visual grouping for easy identification
- **AI Content Generation Optimization** (Fixed September 2025): Resolved AI content generation issues by switching from GPT-5 to stable GPT-4o model, eliminating "Generation Failed" errors and ensuring reliable content creation in proposals
- **Workflow Automation Page Redesign** (Completed September 2025): Fixed styling issues by adding proper AppHeader component integration and consistent layout structure matching application design standards
- **Navigation Button Repositioning** (Updated September 2025): Repositioned "Back to Tasks" button to the left of page titles on Workflow Automation page for improved user experience and consistent navigation patterns
- **Garage Assistant UI Integration** (Enhanced September 2025): Successfully integrated Garage Assistant with real data sources and applied consistent Garage Navy branding throughout the interface
- **Branding Consistency Updates** (Applied September 2025): Implemented consistent Garage Navy (#004C6D) and Ignition Teal (#0B1D3A) color scheme across all components and pages for professional brand cohesion
- **Invoice Preview Auto-Population** (Enhanced September 2025): Invoice preview now automatically displays company and client information from top form fields with smart placeholder text for empty fields
- **Task Relationships & Dependencies** (Completed August 2025): Full subtask and parent-child task hierarchy with circular dependency prevention algorithms
- **Enhanced Project Dashboards** (Added August 2025): Rich project views with Kanban boards, progress tracking, timeline planning, and comprehensive project stats
- **Cross-Device Optimization** (Added August 2025): Desktop expanded views with column layout, Kanban board, and Gantt chart timeline views that automatically adapt to screen size
- **Project Cards on Home Page** (Added August 2025): Interactive project cards showing progress indicators, task counts, and direct dashboard access with visual status badges
- **Database Schema Enhancement** (Completed August 2025): Added parentTaskId field to tasks table and taskDependencies relationship table with proper foreign key constraints
- **Consistent Layout Structure** (Updated August 2025): Restructured all page layouts to have SymbiosoAi logo and "Simplified Workflow Hub" tagline isolated in blue header bar across all screens, with functional buttons (+ New Task) positioned below on same line as page titles for professional hierarchy and brand consistency
- **Marketing Landing Page** (Added January 2025): Professional welcome page showcasing SymbiosoAi features, demo access, and clear call-to-action for new visitors
- **Enhanced Due Date Functionality** (Added January 2025): Time input added to task form with 24-hour and 1-hour advance reminder notifications
- **Advanced Reminder System** (Enhanced January 2025): Precise time-based triggers with yellow notifications for 24-hour advance and urgent red notifications for 1-hour advance
- **Improved Navigation** (Added January 2025): "Back to Tasks" buttons on all admin pages and consistent navigation between admin functions and main task management
- **Progress Section** (Added January 2025): Users can add progress notes with autofilled dates and comments for task tracking
- **Email Notifications** (Completed January 2025): High priority tasks trigger email notifications with complete task details and hotlink to app - fully operational with verified SendGrid sender
- **SMS Notifications** (Pending Validation January 2025): Twilio integration implemented with correct Account SID, awaiting phone number validation for trial account activation
- **User Onboarding** (Added January 2025): First-time login flow to collect notification preferences including email and SMS opt-in
- **Signup Functionality** (Added January 2025): New users can create accounts with username, password, name, and email
- **Admin Dashboard** (Added January 2025): Comprehensive admin view showing all users and their assigned tasks with full details
- **Project Organization System** (Added January 2025): Tasks can now be organized by projects with dropdown selection and project creation
- **Multi-User Authentication** (Added): Full user authentication system with login/logout, session management, and role-based access
- **Database Migration** (Completed): Migrated from in-memory storage to PostgreSQL database with proper user and project relationships
- **Admin User Management** (Added): Admin users can create and manage user accounts with role assignments
- **Task Assignment System** (Added): Tasks can now be assigned to specific people with "Assign To" field using database user IDs
- **Enhanced Task Details**: Added support for notes, file attachments, and URL links
- **User-Based Task Filtering**: Users only see tasks assigned to them, admins can see all tasks
- **Real-time Reminders**: Browser notifications and visual alerts for due and overdue tasks
- **Rich Task Display**: Visual indicators for projects, assignments, notes, attachments, and links

## System Architecture

### Frontend Architecture

The client-side is built with React and TypeScript, utilizing modern development patterns:

- **UI Framework**: React with TypeScript for type safety and component-based architecture
- **Styling**: TailwindCSS with shadcn/ui component library for consistent, accessible design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Build Tool**: Vite for fast development and optimized production builds

The frontend follows a component-driven architecture with reusable UI components, custom hooks, and proper separation of concerns between presentation and business logic.

### Backend Architecture

The server-side uses Express.js with TypeScript in an ESM module setup:

- **Framework**: Express.js with TypeScript for robust API development
- **Database Integration**: Drizzle ORM for type-safe database operations
- **Validation**: Zod schemas shared between client and server for consistent data validation
- **Storage Layer**: Abstracted storage interface with in-memory implementation (ready for database integration)
- **API Design**: RESTful endpoints following standard HTTP conventions

The backend implements a clean architecture with separated concerns for routes, storage, and business logic.

### Database Design

The application uses PostgreSQL with Drizzle ORM:

- **Users Table**: Stores user accounts with authentication, roles (admin/user), and profile information
- **Projects Table**: Organizes tasks by project with automatic project creation from dropdown
- **Tasks Table**: Core task data with relationships to users (assignee/creator) and projects
- **Type Safety**: Drizzle generates TypeScript types from schema definitions with proper relations
- **Migrations**: Database schema changes managed through Drizzle migrations
- **Validation**: Shared Zod schemas ensure consistent validation between frontend and backend
- **Authentication**: Session-based authentication with bcrypt password hashing

### Build and Development

The project uses a modern development setup:

- **Package Management**: npm with lockfile for consistent dependencies
- **Development**: Hot module replacement with Vite for fast iteration
- **Production Build**: Optimized builds with tree-shaking and code splitting
- **Type Checking**: TypeScript compiler with strict mode enabled
- **Code Quality**: ESLint and Prettier for consistent code formatting

## External Dependencies

### Core Framework Dependencies

- **@neondatabase/serverless**: PostgreSQL database connection for serverless environments
- **drizzle-orm** and **drizzle-kit**: Type-safe ORM and migration tools
- **express**: Node.js web framework for API development
- **react** and **react-dom**: Core React libraries for UI development
- **@tanstack/react-query**: Server state management and caching

### UI and Styling

- **@radix-ui/***: Comprehensive set of accessible, unstyled UI primitives
- **tailwindcss**: Utility-first CSS framework with custom Garage Navy color variables
- **class-variance-authority**: Utility for creating component variants
- **lucide-react**: Modern icon library
- **Custom Branding**: Garage Navy (#004C6D) and Ignition Teal (#0B1D3A) color scheme applied consistently

### Development Tools

- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **@vitejs/plugin-react**: React support for Vite
- **postcss** and **autoprefixer**: CSS processing tools

### Validation and Forms

- **zod**: Schema validation library
- **react-hook-form**: Performant forms library
- **@hookform/resolvers**: Integration between React Hook Form and validation libraries

### Utilities

- **date-fns**: Date manipulation library
- **clsx** and **tailwind-merge**: Utility functions for conditional classes
- **wouter**: Lightweight routing library

### AI and Automation

- **openai**: OpenAI API integration for content generation (using GPT-4o model)
- **Workflow Automation**: Custom workflow rules and automation engine
- **AI Content Generation**: Reliable proposal and content creation using stable AI models

### Enhanced Features

- **Invoice Builder**: Auto-fill functionality with company and client information population
- **Garage Assistant**: Integrated UI with real data sources and consistent branding
- **Workflow Automation**: Visual rule builder with trigger and action management
- **Time Tracking**: Comprehensive time tracking with project allocation and productivity reporting