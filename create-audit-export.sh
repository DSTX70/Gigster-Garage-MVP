#!/bin/bash

# Create export directory
mkdir -p audit-export

# Copy all TypeScript source files
echo "Copying source files..."
cp -r client/src audit-export/ 2>/dev/null || true
cp -r server audit-export/ 2>/dev/null || true
cp -r shared audit-export/ 2>/dev/null || true

# Copy configuration files
echo "Copying configuration..."
cp package.json audit-export/ 2>/dev/null || true
cp tsconfig.json audit-export/ 2>/dev/null || true
cp vite.config.ts audit-export/ 2>/dev/null || true
cp tailwind.config.ts audit-export/ 2>/dev/null || true
cp drizzle.config.ts audit-export/ 2>/dev/null || true

# Copy documentation
echo "Copying documentation..."
cp replit.md audit-export/ 2>/dev/null || true
cp -r docs audit-export/ 2>/dev/null || true
cp -r demo audit-export/ 2>/dev/null || true

# Copy policy files
cp -r policy audit-export/ 2>/dev/null || true

# Create README for the audit
cat > audit-export/AUDIT_README.md << 'EOF'
# Gigster Garage - Code Audit Package

**Generated:** $(date)
**Purpose:** Comprehensive security and code quality audit

## Contents

### Source Code
- `client/src/` - React frontend (TypeScript)
- `server/` - Express backend (TypeScript)
- `shared/` - Shared types and schemas

### Configuration
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Build configuration
- `tailwind.config.ts` - Styling configuration
- `drizzle.config.ts` - Database ORM configuration

### Documentation
- `replit.md` - Architecture and technical documentation
- `docs/` - User manual and quick start guides
- `demo/` - Demo and tutorial materials
- `policy/` - Agent governance policies

## Architecture Overview

**Stack:** Full-stack TypeScript
- **Frontend:** React 18 + Vite + TailwindCSS + shadcn/ui
- **Backend:** Express.js (ESM modules)
- **Database:** PostgreSQL (Neon) + Drizzle ORM
- **Auth:** Session-based with bcrypt
- **State:** TanStack Query v5
- **Routing:** Wouter

## Key Areas for Audit

### Security
1. Authentication implementation (server/auth-middleware.ts)
2. Authorization & permissions (server/routes.ts)
3. Input validation (shared/schema.ts + Zod)
4. SQL injection prevention (Drizzle ORM usage)
5. XSS protection
6. Secret management
7. Session security
8. WebSocket security

### Code Quality
1. TypeScript type safety
2. Error handling patterns
3. Async/await usage
4. Component structure
5. API design consistency
6. Database schema design

### Business Logic
1. Invoice calculations (server/utils/invoice-calculations.ts)
2. Plan enforcement (server/routes.ts)
3. Workflow automation
4. Time tracking
5. Agent KPI tracking
6. Permission model (OWNED vs SHARED resources)

### Performance
1. Database query optimization
2. Caching strategies
3. Bundle size
4. Component re-renders
5. WebSocket efficiency

### Dependencies
1. Security vulnerabilities (run: npm audit)
2. Outdated packages
3. License compatibility
4. Unused dependencies

## Running the Application

```bash
npm install
npm run dev
```

## Database Schema

Check `shared/schema.ts` for type definitions.
Database migrations are managed by Drizzle ORM.

## Environment Variables Required

- DATABASE_URL - PostgreSQL connection string
- SESSION_SECRET - Session encryption key
- OPENAI_API_KEY - AI features (optional)
- SENDGRID_API_KEY - Email notifications (optional)
- TWILIO_* - SMS notifications (optional)

## Known Security Model

**Resource Permissions:**
- OWNED resources (invoices, tasks): User can only access their own
- SHARED resources (projects, clients): All users can access
- Admin role: Full access override

**Plan Enforcement:**
- Free, Pro, Enterprise tiers
- Features gated by plan level
- Server-side enforcement via middleware

## Testing

```bash
npm run test        # Run tests
npm run db:push     # Sync database schema
npm run demo:video  # Generate demo video
```

---

## Contact

For questions about this codebase, refer to the documentation in `docs/` or `replit.md`.

EOF

# Create compressed archive
cd audit-export && zip -r ../GIGSTER_GARAGE_AUDIT.zip . && cd ..

# Create file list
find audit-export -type f | wc -l > file-count.txt
COUNT=$(cat file-count.txt)

echo ""
echo "✅ Audit package created successfully!"
echo "📦 Files exported: $COUNT"
echo "📄 Archive: GIGSTER_GARAGE_AUDIT.zip"
echo ""

