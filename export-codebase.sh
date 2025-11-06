#!/bin/bash

OUTPUT="GIGSTER_GARAGE_AUDIT_EXPORT.md"

cat > "$OUTPUT" << 'EOF'
# Gigster Garage - Complete Codebase Audit Export

**Generated:** $(date)  
**Purpose:** Comprehensive code review and security audit  
**Architecture:** Full-stack TypeScript (React + Express + PostgreSQL)

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Dependencies](#2-dependencies)
3. [Database Schema](#3-database-schema)
4. [Backend Code](#4-backend-code)
5. [Frontend Code](#5-frontend-code)
6. [Shared Types & Validation](#6-shared-types-validation)
7. [Configuration](#7-configuration)
8. [Documentation](#8-documentation)

---

## 1. Project Overview

### Architecture
- **Frontend:** React 18 + TypeScript + TailwindCSS + shadcn/ui
- **Backend:** Express.js + TypeScript (ESM)
- **Database:** PostgreSQL (Neon) + Drizzle ORM
- **State Management:** TanStack Query v5
- **Routing:** Wouter
- **Build:** Vite
- **Auth:** Session-based (connect-pg-simple) + bcrypt

### Security Model
- Two-tier resource permissions (OWNED vs SHARED)
- Admin override for all resources
- Server-side financial calculations
- Plan-based feature gating (Free/Pro/Enterprise)

### Key Features
- Time tracking & task management with subtasks
- Invoice generation with auto-fill & PDF export
- Workflow automation with visual rule builder
- 17 AI agents (GPT-4o integration)
- Command palette (Cmd+K), quick actions (FAB)
- Real-time notifications (WebSocket)
- Email (SendGrid) & SMS (Twilio) integrations

---

EOF

echo "## 2. Dependencies" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo '### package.json' >> "$OUTPUT"
echo '```json' >> "$OUTPUT"
cat package.json >> "$OUTPUT"
echo '```' >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "## 3. Database Schema" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo '### db/schema.ts' >> "$OUTPUT"
echo '```typescript' >> "$OUTPUT"
cat db/schema.ts >> "$OUTPUT"
echo '```' >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "## 4. Backend Code" >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "### server/index.ts (Main Server)" >> "$OUTPUT"
echo '```typescript' >> "$OUTPUT"
cat server/index.ts >> "$OUTPUT"
echo '```' >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "### server/routes.ts (API Routes)" >> "$OUTPUT"
echo '```typescript' >> "$OUTPUT"
cat server/routes.ts >> "$OUTPUT"
echo '```' >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "### server/storage.ts (Database Layer)" >> "$OUTPUT"
echo '```typescript' >> "$OUTPUT"
cat server/storage.ts >> "$OUTPUT"
echo '```' >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "### server/auth.ts (Authentication)" >> "$OUTPUT"
echo '```typescript' >> "$OUTPUT"
cat server/auth.ts >> "$OUTPUT"
echo '```' >> "$OUTPUT"
echo "" >> "$OUTPUT"

if [ -f "server/utils/invoice-calculations.ts" ]; then
echo "### server/utils/invoice-calculations.ts" >> "$OUTPUT"
echo '```typescript' >> "$OUTPUT"
cat server/utils/invoice-calculations.ts >> "$OUTPUT"
echo '```' >> "$OUTPUT"
echo "" >> "$OUTPUT"
fi

echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "## 5. Frontend Code" >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "### client/src/App.tsx (Main App & Routing)" >> "$OUTPUT"
echo '```typescript' >> "$OUTPUT"
cat client/src/App.tsx >> "$OUTPUT"
echo '```' >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "### client/src/lib/queryClient.ts (API Client)" >> "$OUTPUT"
echo '```typescript' >> "$OUTPUT"
cat client/src/lib/queryClient.ts >> "$OUTPUT"
echo '```' >> "$OUTPUT"
echo "" >> "$OUTPUT"

for page in client/src/pages/*.tsx; do
  if [ -f "$page" ]; then
    basename=$(basename "$page")
    echo "### client/src/pages/$basename" >> "$OUTPUT"
    echo '```typescript' >> "$OUTPUT"
    cat "$page" >> "$OUTPUT"
    echo '```' >> "$OUTPUT"
    echo "" >> "$OUTPUT"
  fi
done

echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "## 6. Shared Types & Validation" >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "### shared/schema.ts (Shared Types)" >> "$OUTPUT"
echo '```typescript' >> "$OUTPUT"
cat shared/schema.ts >> "$OUTPUT"
echo '```' >> "$OUTPUT"
echo "" >> "$OUTPUT"

if [ -f "shared/plans.ts" ]; then
echo "### shared/plans.ts (Plan Definitions)" >> "$OUTPUT"
echo '```typescript' >> "$OUTPUT"
cat shared/plans.ts >> "$OUTPUT"
echo '```' >> "$OUTPUT"
echo "" >> "$OUTPUT"
fi

echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "## 7. Configuration" >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "### tsconfig.json" >> "$OUTPUT"
echo '```json' >> "$OUTPUT"
cat tsconfig.json >> "$OUTPUT"
echo '```' >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "### vite.config.ts" >> "$OUTPUT"
echo '```typescript' >> "$OUTPUT"
cat vite.config.ts >> "$OUTPUT"
echo '```' >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "### tailwind.config.ts" >> "$OUTPUT"
echo '```typescript' >> "$OUTPUT"
cat tailwind.config.ts >> "$OUTPUT"
echo '```' >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "### drizzle.config.ts" >> "$OUTPUT"
echo '```typescript' >> "$OUTPUT"
cat drizzle.config.ts >> "$OUTPUT"
echo '```' >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "## 8. Documentation" >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "### replit.md (Architecture Documentation)" >> "$OUTPUT"
echo '```markdown' >> "$OUTPUT"
cat replit.md >> "$OUTPUT"
echo '```' >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "## Audit Checklist" >> "$OUTPUT"
echo "" >> "$OUTPUT"
cat >> "$OUTPUT" << 'CHECKLIST'
### Security Review
- [ ] Authentication implementation (bcrypt, session management)
- [ ] Authorization & permission model (OWNED vs SHARED resources)
- [ ] SQL injection prevention (Drizzle ORM parameterization)
- [ ] XSS prevention (React auto-escaping, input sanitization)
- [ ] CSRF protection (session configuration)
- [ ] Secret management (environment variables)
- [ ] Password policies & storage
- [ ] API rate limiting
- [ ] Input validation (Zod schemas)
- [ ] File upload security
- [ ] WebSocket security

### Code Quality
- [ ] TypeScript usage & type safety
- [ ] Error handling & logging
- [ ] Code organization & structure
- [ ] Component reusability
- [ ] API design consistency
- [ ] Database schema design
- [ ] Performance optimizations
- [ ] Memory leak prevention
- [ ] Async/await patterns

### Architecture
- [ ] Frontend/backend separation
- [ ] Database transaction handling
- [ ] State management patterns
- [ ] Routing structure
- [ ] API versioning
- [ ] Scalability considerations
- [ ] Caching strategies
- [ ] Real-time features (WebSocket)

### Data Integrity
- [ ] Server-side validation
- [ ] Client-side validation
- [ ] Data consistency checks
- [ ] Foreign key constraints
- [ ] Cascading deletes
- [ ] Audit trails
- [ ] Backup strategies

### Business Logic
- [ ] Invoice calculations (server-side)
- [ ] Plan enforcement
- [ ] Workflow automation engine
- [ ] Time tracking accuracy
- [ ] Agent KPI calculations
- [ ] Notification triggers
- [ ] Permission hierarchies

### Dependencies
- [ ] Outdated packages
- [ ] Security vulnerabilities (npm audit)
- [ ] License compatibility
- [ ] Bundle size
- [ ] Unused dependencies

### Testing Coverage
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Security tests
- [ ] Performance tests

### Deployment
- [ ] Environment configuration
- [ ] Build process
- [ ] Database migrations
- [ ] Rollback procedures
- [ ] Monitoring & logging
- [ ] Error tracking

---

## End of Export
CHECKLIST

echo "✅ Codebase export complete: $OUTPUT"
