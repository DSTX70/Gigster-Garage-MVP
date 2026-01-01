# Gigster Garage - Deployment & Integration Export

**Export Date:** 2026-01-01  
**Registry Version:** 1.3.0  
**Status:** Production-Ready

---

## 1. Runtime + Deployment Configuration

### .replit Configuration
```toml
modules = ["nodejs-20", "web", "postgresql-16"]
run = "npm run dev"

[nix]
channel = "stable-25_05"
packages = ["glib", "nss", "nspr", "at-spi2-atk", "cups", "gtk3", "pango", "mesa", "alsa-lib", 
            "xorg.libXcomposite", "xorg.libXdamage", "xorg.libXrandr", "xorg.libXScrnSaver", 
            "xorg.libxshmfence", "libxkbcommon", "chromium", "gh"]

[deployment]
deploymentTarget = "autoscale"
build = ["npm", "run", "build"]
run = ["npm", "run", "start"]

[[ports]]
localPort = 5000
externalPort = 80

[env]
PORT = "5000"
```

### Workflow Configuration
| Workflow Name | Command | Port | Output Type |
|---------------|---------|------|-------------|
| Start application | `npm run dev` | 5000 | webview |
| Project (parallel) | runs "Start application" | - | - |

### Installed Integrations
- `javascript_stripe:1.0.0`
- `javascript_database:1.0.0`
- `javascript_websocket:1.0.0`
- `javascript_object_storage:1.0.0`
- `javascript_openai:1.0.0`
- `javascript_log_in_with_replit:1.0.0`
- `javascript_slack:1.0.0`

---

## 2. Environment Variables (Names Only)

### Secrets (Configured)
| Key | Purpose |
|-----|---------|
| `SESSION_SECRET` | Express session encryption |
| `DATABASE_URL` | PostgreSQL connection string |
| `PGDATABASE` | Database name |
| `PGHOST` | Database host |
| `PGPORT` | Database port |
| `PGUSER` | Database user |
| `PGPASSWORD` | Database password |
| `PRIVATE_OBJECT_DIR` | Object storage directory |
| `OPENAI_API_KEY` | OpenAI API access |
| `DRIVE_STEWARD_TOKEN` | Drive steward auth |
| `I3_REPO_OPS_TOKEN` | Repo operations auth |
| `DRIVE_STEWARD_URL` | Drive steward endpoint |
| `PROJECT_KEY` | Project identifier |
| `DTH_READONLY_TOKEN` | DreamTeamHub read access |
| `GIGSTER_GARAGE_READONLY_TOKEN` | GG read access |
| `AUDIT_BASE_URL` | Audit system endpoint |
| `REPLIT_DOMAINS` | Deployed domain list |
| `REPLIT_DEV_DOMAIN` | Development domain |
| `REPL_ID` | Replit project ID |

### Secrets (Not Configured - Optional)
| Key | Purpose |
|-----|---------|
| `INSTAGRAM_ACCESS_TOKEN` | Instagram API |
| `INSTAGRAM_ACCOUNT_ID` | Instagram account |
| `LINKEDIN_ACCESS_TOKEN` | LinkedIn API |
| `X_ACCESS_SECRET` | X/Twitter OAuth |
| `X_ACCESS_TOKEN` | X/Twitter OAuth |
| `X_API_KEY` | X/Twitter API |
| `X_API_SECRET` | X/Twitter API |
| `SENDGRID_API_KEY` | Email service |
| `SENDGRID_API_KEY_2` | Email service (backup) |
| `TWILIO_ACCOUNT_SID` | SMS service |
| `TWILIO_AUTH_TOKEN` | SMS service |
| `STRIPE_SECRET_KEY` | Stripe payments |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhooks |

---

## 3. Database Schema

### Tables (50 total)
```
activities                  media_head_cache
agency_hub_items            messages
agent                       payments
agent_graduation_plans      pillar
agent_kpis                  platform_credentials
agent_visibility_flags      pod
agents                      pod_bu
ai_conversations            pod_service
ai_question_templates       presentations
ai_user_responses           projects
api_keys                    sessions
api_usage                   shared_service
autonomy_level              social_queue
business_unit               social_rate_limits
client_documents            social_rl_overrides
clients                     social_rl_usage
comments                    task_dependencies
contracts                   tasks
custom_field_definitions    templates
custom_field_values         time_logs
document_versions           users
file_attachments            workflow_executions
gigster_coach_interactions  workflow_rules
gigster_coach_suggestions
invoices
loyalty_ledger
```

### Sample Row Counts (Development)
| Table | Count |
|-------|-------|
| users | 3 |
| clients | 11 |
| invoices | 6 |
| agents | 6 |
| gigster_coach_suggestions | 0 |
| social_queue | 0 |

### Key Schema Entities

#### Users Table
```typescript
users: {
  id: varchar (UUID),
  email: varchar (unique),
  username: varchar (unique, required),
  password: varchar (required),
  role: enum ["admin", "user"],
  plan: enum ["free", "pro", "enterprise"],
  // Business context
  companyName, businessAddress, city, state, businessType, industry,
  // Branding
  logoUrl, brandColors (jsonb), brandFonts (jsonb),
  // Demo isolation
  isDemo, demoSessionId, sessionExpiresAt
}
```

#### Invoices Table
```typescript
invoices: {
  id: varchar (UUID),
  invoiceNumber: varchar (unique, required),
  clientId, projectId, proposalId: references,
  status: enum ["draft", "sent", "paid", "overdue", "cancelled"],
  lineItems: jsonb (LineItem[]),
  subtotal, taxRate, taxAmount, discountAmount, totalAmount,
  depositRequired, depositPaid, amountPaid, balanceDue,
  stripePaymentIntentId: varchar,
  paymentLink: varchar (unique)
}
```

#### Social Queue Table
```typescript
social_queue: {
  id: varchar (UUID),
  platform: varchar,
  content: text,
  media_urls: jsonb,
  scheduled_for: timestamp,
  status: enum,
  posted_at: timestamp,
  error_message: text
}
```

### Migration Approach
- Uses Drizzle ORM with `npm run db:push` for schema sync
- No manual migration files (push-based approach)
- Schema defined in `shared/schema.ts` (1631 lines)

---

## 4. Integration Proof

### API Endpoints Structure

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - Session logout
- `GET /api/auth/user` - Current user

#### Core CRUD
- `GET/POST /api/clients` - Client management
- `GET/POST /api/invoices` - Invoice management
- `GET/POST /api/projects` - Project management
- `GET/POST /api/tasks` - Task management
- `GET/POST /api/time-logs` - Time tracking

#### AI/Coach
- `POST /api/ai/generate-proposal` - AI proposal generation
- `POST /api/gigster-coach/ask` - GigsterCoach Q&A
- `POST /api/gigster-coach/draft` - Content drafting
- `POST /api/gigster-coach/review` - Completeness review

#### DTH Integration
- `POST /api/dth/files` - DTH readonly file access (token-protected)
- `GET /api/dth/diagnostics` - Runtime diagnostics (token-protected)
- `POST /api/admin/diagnostics` - Admin diagnostics capture

#### Health/Version
- `GET /api/health` - Service health check
- `GET /api/version` - Build version info

### Stripe Webhook Events Handled
```typescript
// server/routes.ts - Webhook handler
POST /api/webhooks/stripe

Events processed:
- payment_intent.succeeded → Updates invoice status to paid
- checkout.session.completed → Processes subscription updates
```

### Email Provider Wiring (SendGrid)
```typescript
// server/emailService.ts
- Uses @sendgrid/mail package
- API key from SENDGRID_API_KEY or SENDGRID_API_KEY_2
- Key must start with 'SG.' for validation
- Fallback logging when not configured
- APP_URL derived from REPLIT_DOMAINS
```

### SMS Provider Wiring (Twilio)
```typescript
// server/emailService.ts
- Uses twilio package
- TWILIO_ACCOUNT_SID must start with 'AC'
- TWILIO_AUTH_TOKEN for authentication
- Graceful fallback when not configured
```

---

## 5. Design Source of Truth

### Brand System (index.css)
```css
:root {
  /* Primary Brand */
  --brand: #0B1D3A;     /* Navy */
  --accent: #2EC5C2;    /* Mint */
  --signal: #FFB52E;    /* Amber */
  
  /* Neutrals */
  --bg: #F7F8FA;
  --panel: #FFFFFF;
  --surface: #F3F4F6;
  --text: #1A2433;
  --muted: #6B7280;
  
  /* States */
  --success: #1e845e;
  --warn: #d58b19;
  --danger: #c43b3b;
  --info: #2e7ea8;
  
  /* Legacy Garage Navy */
  --garage-navy: #004C6D;
  --gg-teal: #008272;
  --gg-amber: #FFB200;
  
  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --radius: 14px;
}
```

### Dark Mode
```css
.dark {
  --bg: #151A22;
  --panel: #1B2330;
  --surface: #161C27;
  --text: #ECF2F8;
  --muted: #B4BECA;
}
```

---

## 6. Known Issues / Intended Behaviors

### Stubbed Features (Intentionally Limited)
| Feature | Status | Notes |
|---------|--------|-------|
| Social Media Posting | Stubbed | Requires platform API credentials |
| Platform Credentials Test | Stubbed | Returns mock success without real API call |
| Email Notifications | Graceful fallback | Logs when SendGrid not configured |
| SMS Notifications | Graceful fallback | Logs when Twilio not configured |
| Stripe Payments | Functional | Requires STRIPE_SECRET_KEY |

### Known WebSocket Issues (Pre-existing)
- Vite HMR WebSocket connection errors in browser console
- Does not affect application functionality
- Related to development hot-reload, not production

### Demo Mode Isolation
- Demo users have `isDemo=true` flag
- Data isolated by `demoSessionId`
- Auto-cleanup after session expiration

### Feature Gating
- Three-tier plan: Free / Pro / Enterprise
- `requirePlan` middleware enforces access
- `featuresOverride` jsonb allows per-user exceptions

---

## 7. Object Storage Configuration

```toml
[objectStorage]
defaultBucketID = "replit-objstore-fce7b45a-a5cf-46bf-a6b0-4896a46b6e9a"
```

---

## 8. Seed Scripts

### AI Question Templates
**File:** `server/seedAiQuestions.ts`

Seeds AI-powered question templates for GigsterCoach interactions.

---

## 9. DTH Registry Reference

**File:** `docs/DTH_REGISTRY.yaml`  
**Version:** 1.3.0

### Summary
- 4 Core Pods
- 10 SMEs
- 24 Gigster Garage Add-ons (Waves 0-4)
- 101 Schema/Pack Names

### Add-on Waves
| Wave | Count | Focus |
|------|-------|-------|
| 0 | 2 | Platform Intel + Gig History |
| 1 | 7 | Proof of Work, Offers, Negotiation, Submissions, Scheduling, Expenses, Disputes |
| 2 | 6 | Skills, Client Fit, Portfolio, Retainers, Reviews, Forecasting |
| 3 | 3 | Onboarding, Communication, Multi-Platform |
| 4 | 6 | Goal Planning, Inbox Triage, One-Click Packs, Ship Guard, Playbooks, Pipeline Loop |

---

## 10. Curl Examples

### Health Check
```bash
curl https://YOUR_DOMAIN/api/health
```

### Version Check
```bash
curl https://YOUR_DOMAIN/api/version
```

### DTH File Access (Token Protected)
```bash
curl -X POST https://YOUR_DOMAIN/api/dth/files \
  -H "Authorization: Bearer $DTH_READONLY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paths": ["client/src/App.tsx", "shared/schema.ts"]}'
```

### Admin Diagnostics Submit
```bash
curl -X POST https://YOUR_DOMAIN/api/admin/diagnostics \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION" \
  -d '{"events": [{"type": "console_error", "message": "test", "ts": 1234567890}]}'
```

---

*Export generated for DreamTeamHub integration and deployment documentation.*
