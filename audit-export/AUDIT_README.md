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

