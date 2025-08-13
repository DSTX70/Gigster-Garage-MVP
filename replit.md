# VSuite HQ - Simplified Workflow Hub

## Overview

VSuite HQ is a comprehensive task management application built with a full-stack TypeScript architecture. The application follows the VSuite HQ brand guidelines with exact color specifications (Blue #007BFF, Black #000000, White #FFFFFF) and typography using Helvetica Neue Bold/Inter Bold for headings and Helvetica Neue Regular/Inter Regular for body text. The tagline "Simplified Workflow Hub" appears consistently throughout the application. The application provides a clean, intuitive interface for creating, managing, and tracking tasks with advanced features including priority levels, due dates, task assignments, notes, file attachments, URL links, and intelligent reminder notifications. It follows a monorepo structure with a React frontend, Express.js backend, and in-memory storage using a clean storage abstraction pattern.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **Progress Section** (Added January 2025): Users can add progress notes with autofilled dates and comments for task tracking
- **Email Notifications** (Completed January 2025): High priority tasks trigger email notifications with complete task details and hotlink to app - fully operational with verified SendGrid sender
- **SMS Notifications** (Ready January 2025): Twilio integration implemented and ready, requires valid Twilio credentials to activate SMS functionality
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
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for creating component variants
- **lucide-react**: Modern icon library

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