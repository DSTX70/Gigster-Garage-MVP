# PR Review Checklists (GG-101 through GG-110)

## GG-104: RFP Responder → Draft Generator (E2E)

**Template:** `switchboard.md` + `codeblock.md`  
**Branch:** `feature/rfp-drafts-e2e`

```markdown
## Review Checklist for GG-104: RFP E2E

### Functional Verification
- [ ] **Webhook ingestion** - RFP webhook POST to `/api/integrations/rfp/webhook` succeeds
- [ ] **Draft generation** - RFP creates proposal draft in database
- [ ] **AI content** - Draft includes AI-generated scope, timeline, pricing sections
- [ ] **Attachment handling** - RFP attachments extracted and stored
- [ ] **Status tracking** - Draft status flows: `pending` → `ai_generated` → `reviewed` → `sent`

### Code Quality
- [ ] **Webhook validation** - RFP signature/auth verified before processing
- [ ] **Async processing** - Heavy AI work happens in background job, not blocking request
- [ ] **Schema types** - RFP data uses types from `@shared/schema.ts`
- [ ] **Error handling** - Failed AI generation logged, draft marked as `failed`

### Testing
- [ ] **E2E test** - Manual curl POST → check `/rfp/ingest` for draft appearance
- [ ] **AI fallback** - If OpenAI fails, draft still created with template content
- [ ] **Duplicate prevention** - Same RFP ID posted twice → only one draft created

### Documentation
- [ ] **RFP webhook format** - Example payload documented in `docs/`
- [ ] **Draft schema** - RFP draft fields documented
```

---

## GG-105: Loyalty Ledger → Points UI + Rules

**Template:** `bridge.md` + `lume.md` + `codeblock.md`  
**Branch:** `feature/loyalty-ui-rules`

```markdown
## Review Checklist for GG-105: Loyalty System

### Functional Verification
- [ ] **Points accrual** - Complete task → points added to ledger
- [ ] **Points display** - User dashboard shows current balance
- [ ] **Redemption** - Redeem points → balance decreases, reward issued
- [ ] **Transaction history** - `/loyalty` page shows all accruals/redemptions with timestamps
- [ ] **CSV export** - `/api/loyalty/export` downloads complete ledger as CSV

### Business Logic
- [ ] **Accrual rules** - Points awarded per action documented (task complete: 10pts, referral: 50pts)
- [ ] **Redemption limits** - Cannot redeem more than balance
- [ ] **Transaction atomicity** - Point changes wrapped in database transaction
- [ ] **Audit trail** - Every point change logged with reason/source

### UI/UX
- [ ] **Balance widget** - Persistent points display in header/sidebar
- [ ] **Redemption flow** - Clear UI for browsing rewards and redeeming
- [ ] **History table** - Sortable/filterable transaction history
- [ ] **Empty state** - New users see "Start earning points" message

### Testing
- [ ] **Accrual test** - Manual task completion → verify points added
- [ ] **Redemption test** - Redeem 100pts → balance decreases correctly
- [ ] **CSV export test** - Download has proper headers and data rows
```

---

## GG-106: Brand & Voice Polish (Top 20 Screens)

**Template:** `nova.md` + `prism.md`  
**Branch:** `chore/brand-voice-pass`

```markdown
## Review Checklist for GG-106: Brand & Voice

### Copy Quality
- [ ] **Tone consistency** - All screens use professional, helpful tone (not overly casual or robotic)
- [ ] **Button labels** - Action-oriented ("Create Invoice" not "Submit", "Save Changes" not "OK")
- [ ] **Error messages** - User-friendly, actionable ("Email address is required" not "Invalid input")
- [ ] **Empty states** - Encouraging, with clear next steps ("No tasks yet. Create your first task to get started")
- [ ] **Success messages** - Specific confirmation ("Invoice #1234 created" not "Success!")

### Visual Polish
- [ ] **Garage Navy branding** - Primary colors #004C6D and #0B1D3A used consistently
- [ ] **Spacing** - Consistent padding/margins using Tailwind spacing scale
- [ ] **Typography hierarchy** - Clear heading levels (h1/h2/h3) with proper sizing
- [ ] **Icon consistency** - All icons from `lucide-react`, consistent size/color
- [ ] **Responsive design** - Screens adapt cleanly to mobile/tablet/desktop

### Top 20 Screens Reviewed
- [ ] Dashboard (`/`)
- [ ] Projects list (`/projects`)
- [ ] Project detail (`/projects/:id`)
- [ ] Tasks list (`/tasks`)
- [ ] Task detail (`/tasks/:id`)
- [ ] Time tracker (`/time`)
- [ ] Invoices list (`/invoices`)
- [ ] Invoice builder (`/invoices/new`)
- [ ] Workflows (`/workflows`)
- [ ] Settings (`/settings`)
- [ ] Platform Connections (`/settings/connections`)
- [ ] Monitoring Dashboard (`/monitoring`)
- [ ] Loyalty (`/loyalty`)
- [ ] Login (`/login`)
- [ ] Signup (`/signup`)
- [ ] User Profile (`/profile`)
- [ ] Admin Dashboard (`/admin`)
- [ ] Team Members (`/team`)
- [ ] Reports (`/reports`)
- [ ] Help/Docs (`/help`)

### Testing
- [ ] **Screenshot audit** - Before/after screenshots attached to PR
- [ ] **Dark mode** - All screens tested in both light and dark themes
- [ ] **Mobile audit** - Top 5 screens tested on mobile viewport
```

---

## GG-107: SSO Hardening + Org-Binding UX

**Template:** `verifier.md` + `lume.md`  
**Branch:** `feat/sso-org-binding`

```markdown
## Review Checklist for GG-107: SSO & Org-Binding

### Functional Verification
- [ ] **Google OAuth** - Sign in with Google succeeds, creates/updates user
- [ ] **Azure AD SAML** - Azure AD login succeeds for enterprise users
- [ ] **Org-binding flow** - New SSO user prompted to select/create organization
- [ ] **Admin assignment** - First user in org automatically becomes admin
- [ ] **Session persistence** - SSO sessions last 7 days, refresh token works

### Security
- [ ] **CSRF protection** - OAuth state parameter validates correctly
- [ ] **Token storage** - Refresh tokens encrypted in database
- [ ] **Logout** - Sign out clears session and revokes tokens
- [ ] **Org isolation** - Users only see data from their bound organization
- [ ] **Admin-only actions** - Org settings require `orgAdmin` role

### UI/UX
- [ ] **SSO buttons** - "Sign in with Google" / "Sign in with Microsoft" clearly displayed
- [ ] **Org-binding screen** - Clean UI at `/auth/org-bind` with create/join options
- [ ] **Org switcher** - Users in multiple orgs can switch between them
- [ ] **First-time experience** - New SSO users see helpful onboarding

### Testing
- [ ] **Schema test** - `--only schema` verifies org-binding tables exist
- [ ] **Manual SSO test** - Complete Google OAuth flow → user created with org binding
- [ ] **Multi-org test** - User joins 2 orgs → can switch between them
```

---

## GG-108: Pricing Page + Paywall Fences

**Template:** `ledger.md` + `foundry.md` + `prism.md`  
**Branch:** `feature/pricing-and-fences`

```markdown
## Review Checklist for GG-108: Pricing & Paywalls

### Functional Verification
- [ ] **Pricing page** - `/pricing` displays 3-tier comparison matrix (Free, Pro, Enterprise)
- [ ] **Feature gates** - Free users blocked from Pro features (workflows, custom fields, team collaboration)
- [ ] **Upgrade prompt** - Paywall modal appears with "Upgrade to Pro" CTA
- [ ] **Plan check middleware** - `requirePlan('pro')` middleware blocks unauthorized access
- [ ] **Trial flow** - New Pro signups get 14-day trial, auto-convert to paid

### Pricing Display
- [ ] **Free tier** - $0, 1 user, 3 projects, 50 tasks/month clearly shown
- [ ] **Pro tier** - $20/user/month, unlimited projects/tasks, advanced features listed
- [ ] **Enterprise tier** - Custom pricing, SSO, SLA, dedicated support highlighted
- [ ] **Feature comparison** - Side-by-side matrix shows ✓/✗ for each feature
- [ ] **FAQ section** - Common questions answered below pricing table

### Code Quality
- [ ] **Plan enforcement** - Backend validates plan on every protected route
- [ ] **Feature flags** - Plan limits checked via `user.plan` enum, not hardcoded
- [ ] **Usage tracking** - Task/project counts enforced against plan limits
- [ ] **Graceful degradation** - Exceeding free limits shows upgrade prompt, doesn't break app

### Testing
- [ ] **Free user test** - Try to create 4th project → blocked with upgrade modal
- [ ] **Pro user test** - Unlimited projects/tasks work correctly
- [ ] **Pricing page audit** - All tiers displayed correctly, CTAs functional
```

---

## GG-109: Competitive Matrix + GTM Starter Pack

**Template:** `prism.md` + `storybloom.md` + `amani.md` + `foundry.md`  
**Branch:** `gtm/launch-pack`

```markdown
## Review Checklist for GG-109: GTM Pack

### Deliverables
- [ ] **Competitive matrix** - Gigster Garage vs 5 competitors (Asana, Monday, ClickUp, Notion, Airtable)
- [ ] **Feature comparison** - 15+ key features compared across products
- [ ] **Positioning statement** - Clear value prop: "Intelligent workflow hub for professional services"
- [ ] **Target personas** - 3 personas documented: Freelancers, Agencies, SaaS Teams
- [ ] **Pricing comparison** - Cost analysis vs competitors at different user counts

### Marketing Copy
- [ ] **Headline** - Compelling hero headline for homepage
- [ ] **Subheadline** - Clear value statement in 1-2 sentences
- [ ] **Feature bullets** - 5-7 key benefits for landing page
- [ ] **CTA copy** - Strong calls-to-action ("Start Free Trial", "Book Demo")
- [ ] **Social proof** - Placeholder testimonials/customer logos

### Sales Enablement
- [ ] **One-pager** - PDF sales sheet with key features/pricing
- [ ] **Demo script** - Step-by-step demo flow (10min walkthrough)
- [ ] **Objection handling** - Responses to 5 common objections
- [ ] **ROI calculator** - Simple spreadsheet showing time/cost savings

### Documentation
- [ ] **Launch checklist** - Pre-launch tasks documented
- [ ] **Analytics setup** - GA4/Mixpanel event tracking plan defined
- [ ] **Distribution plan** - Initial channels identified (Product Hunt, HN, LinkedIn)
```

---

## GG-110: IP Snapshot (Provisional + Trade Secrets)

**Template:** `ip_aegis_atlas_archivist_coda.md`  
**Branch:** `ip/provisional-snapshot`

```markdown
## Review Checklist for GG-110: IP Protection

### Provisional Patent Prep
- [ ] **Invention disclosure** - 5-page document describing novel features
- [ ] **Claims draft** - 3-5 independent claims for core innovations
- [ ] **Drawings** - System architecture diagrams, UI screenshots, flowcharts
- [ ] **Prior art search** - Existing patents/products documented
- [ ] **Filing timeline** - Provisional deadline calculated (12 months from public disclosure)

### Trade Secret Identification
- [ ] **Confidential info audit** - List of trade secrets documented
- [ ] **Access controls** - Who has access to each secret category
- [ ] **Employee agreements** - Template NDA/IP assignment agreement
- [ ] **Data classification** - Public/Internal/Confidential/Restricted labels defined

### Documentation
- [ ] **Technical specification** - Detailed system documentation for patent attorney
- [ ] **Code annotations** - Comments highlighting novel algorithms/approaches
- [ ] **Innovation log** - Timeline of major feature developments
- [ ] **Competitor analysis** - What makes Gigster Garage unique vs prior art

### Legal Prep
- [ ] **Attorney briefing doc** - Package ready for patent counsel review
- [ ] **Budget estimate** - Provisional filing cost estimated (~$5k-15k)
- [ ] **Timeline** - Milestones from provisional → full utility patent
```

---

## Manual Branch Creation (If Scripts Fail)

Since Replit has git restrictions, create branches via **GitHub.com UI**:

1. Go to your repo → Click branch dropdown
2. Type new branch name → "Create branch from main"
3. Repeat for each:

**GG-101–103:**
- `feature/social-platform-adapters`
- `feat/social-worker-scale`
- `ops/alerts-social-queue`

**GG-104–110:**
- `feature/rfp-drafts-e2e`
- `feature/loyalty-ui-rules`
- `chore/brand-voice-pass`
- `feat/sso-org-binding`
- `feature/pricing-and-fences`
- `gtm/launch-pack`
- `ip/provisional-snapshot`

Then create PRs and select matching templates from `.github/PULL_REQUEST_TEMPLATE/` dropdown!
