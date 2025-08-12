# TaskFlow Application

## Overview

TaskFlow is a comprehensive task management application built with a full-stack TypeScript architecture. The application provides a clean, intuitive interface for creating, managing, and tracking tasks with advanced features including priority levels, due dates, task assignments, notes, file attachments, URL links, and intelligent reminder notifications. It follows a monorepo structure with a React frontend, Express.js backend, and in-memory storage using a clean storage abstraction pattern.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **Task Assignment System** (Added): Tasks can now be assigned to specific people with "Assign To" field
- **Enhanced Task Details**: Added support for notes, file attachments, and URL links
- **Advanced Filtering**: Added assignment-based filtering alongside status filtering
- **Expandable Task Cards**: Tasks with additional content show expand/collapse functionality
- **Real-time Reminders**: Browser notifications and visual alerts for due and overdue tasks
- **Rich Task Display**: Visual indicators for assignments, notes, attachments, and links

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

- **Schema**: Single `tasks` table with fields for description, completion status, due date, priority, and timestamps
- **Type Safety**: Drizzle generates TypeScript types from schema definitions
- **Migrations**: Database schema changes managed through Drizzle migrations
- **Validation**: Shared Zod schemas ensure consistent validation between frontend and backend

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