# Gigster Garage Code Audit Instructions

## Overview
This export contains the core codebase of Gigster Garage, a comprehensive business management application built with TypeScript, React, Express.js, and PostgreSQL.

## File Structure

### Project Overview
- **00_PROJECT_OVERVIEW.md** - Complete project documentation, architecture, and recent changes

### Backend (Node.js/Express/TypeScript)
- **1_database_schema.ts** - Complete database schema using Drizzle ORM (users, tasks, projects, invoices, proposals, contracts, presentations, time logs, client documents)
- **2_storage_layer.ts** - Data access layer with all CRUD operations and business logic
- **3_api_routes.ts** - All REST API endpoints (authentication, tasks, documents, invoices, time tracking, etc.)
- **4_server_entry.ts** - Server configuration and startup
- **16_demo_data_service.ts** - Demo data generation and management

### Frontend (React/TypeScript)
- **5_app_routing.tsx** - Main app structure and routing configuration
- **6_tasks_page.tsx** - Task management interface with kanban boards, filters, and progress tracking
- **7_filing_cabinet_page.tsx** - Document management system with advanced search, bulk operations, and folder organization
- **8_invoice_builder_page.tsx** - Invoice creation with auto-fill, timesheet integration, and PDF generation
- **9_proposal_builder_page.tsx** - AI-powered proposal builder with templates and content generation
- **12_workflow_automation_page.tsx** - Visual workflow automation builder with rules and triggers
- **13_garage_assistant_page.tsx** - AI assistant interface with real-time data integration

### Components
- **14_bulk_operations_component.tsx** - Bulk operations toolbar for Filing Cabinet (delete, download, tag management)
- **15_time_import_dialog.tsx** - Time entry import dialog for invoice builder

### Configuration
- **11_dependencies.json** - All npm packages and versions

## Key Areas to Audit

### Security
1. **Authentication & Authorization**
   - Review session management in routes.ts
   - Check password hashing implementation (bcrypt)
   - Verify user role-based access controls
   - Review requireAuth middleware

2. **Data Validation**
   - Check Zod schema validation on all API endpoints
   - Verify input sanitization
   - Review SQL injection prevention (Drizzle ORM usage)

3. **API Security**
   - Review API key handling for external services (OpenAI, Stripe, Twilio, SendGrid)
   - Check environment variable usage
   - Verify no secrets in code

### Code Quality
1. **Error Handling**
   - Review try-catch blocks in routes.ts
   - Check error messages and logging
   - Verify graceful failure handling

2. **Database Operations**
   - Review transaction handling
   - Check for N+1 query issues
   - Verify proper use of indexes
   - Review data relationships and foreign keys

3. **TypeScript Usage**
   - Check type safety
   - Review any 'any' types
   - Verify proper interface definitions

### Architecture & Design
1. **Separation of Concerns**
   - Review storage layer abstraction
   - Check route handler complexity
   - Verify proper component structure

2. **State Management**
   - Review TanStack Query usage
   - Check cache invalidation patterns
   - Verify optimistic updates

3. **Performance**
   - Review database query efficiency
   - Check for unnecessary re-renders
   - Verify pagination implementation

### Business Logic
1. **Filing Cabinet**
   - Bulk delete error handling (recently fixed)
   - Document search and filtering
   - PDF generation and storage

2. **Invoice Builder**
   - Auto-fill functionality
   - Timesheet-to-invoice integration
   - Time entry linking and validation

3. **Time Tracking**
   - Time log approval workflow
   - Invoice integration
   - Cross-invoice relinking prevention

4. **AI Features**
   - OpenAI integration (GPT-4o model)
   - Content generation reliability
   - Error handling for API failures

## Specific Questions to Address

1. Are there any security vulnerabilities in the authentication system?
2. Is the bulk delete implementation robust and properly error-handled?
3. Are database transactions used appropriately?
4. Is the timesheet-to-invoice linking system reliable and prevents data corruption?
5. Are API endpoints properly validated and secured?
6. Is error handling comprehensive throughout the application?
7. Are there any race conditions or concurrency issues?
8. Is the caching strategy effective and properly invalidated?
9. Are there any performance bottlenecks in the database queries?
10. Is the AI content generation properly error-handled?

## Recent Changes to Review

1. **Filing Cabinet Bulk Delete Fix** - Enhanced error handling with HTTP 500 on failures
2. **Timesheet-to-Invoice Integration** - Complete workflow with time entry linking
3. **Invoice Auto-Fill** - Company information auto-population
4. **AI Content Generation** - Switch from GPT-5 to stable GPT-4o model
5. **Admin Demo Removal** - Simplified to single demo account

## Critical Areas
- Session management and authentication
- Database transaction handling
- File upload and storage (using Google Cloud Storage)
- Payment processing (Stripe integration)
- Email/SMS notifications (SendGrid, Twilio)
- AI content generation (OpenAI)

## Recommendations Format
Please provide:
1. Security vulnerabilities (high priority)
2. Code quality issues
3. Performance optimizations
4. Architecture improvements
5. Best practice violations
6. Potential bugs or edge cases
