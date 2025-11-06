# GitHub Automation for Sprint A (GG-101 to GG-110)

This directory contains automation scripts for creating and managing GitHub issues, projects, and CI/CD workflows for the Sprint A implementation pack.

## 📋 Files Overview

### Issue Templates
- **`issues.json`** - JSON format issue templates for GitHub CLI import
- **`issues.csv`** - CSV format issue templates for GitHub web import
- Contains 10 issues (GG-101 through GG-110) with:
  - Title, body, labels, assignees
  - Estimate points (3-8 pts per issue)
  - Branch names for development

### Automation Scripts
- **`import_issues.sh`** - Bulk create issues from JSON using `gh` CLI
- **`project_template.json`** - Project v2 template definition
- **`create_project_from_template.sh`** - Create GitHub Project v2 from template
- **`project_auto_add.sh`** - Auto-add issues to project with field values

### GitHub Actions Workflows
Located in `/.github/workflows/`:
- **`ci.yml`** - Continuous integration with PostgreSQL testing
- **`auto-project-add.yml`** - Auto-add new issues to project board

---

## 🚀 Quick Start

### 1. Create Issues in Bulk

**Option A: Using GitHub CLI + JSON**
```bash
# Requires: gh CLI authenticated, jq installed
chmod +x ops/github/import_issues.sh
./ops/github/import_issues.sh ops/github/issues.json
```

**Option B: Using GitHub Web + CSV**
1. Go to your repo → Issues → Import
2. Upload `ops/github/issues.csv`
3. Map columns (Title, Body, Labels, Assignees)
4. Complete import

### 2. Create GitHub Project v2

```bash
# 1. Edit project_template.json - set your org name
vim ops/github/project_template.json  # Change "your-org"

# 2. Run creator script
chmod +x ops/github/create_project_from_template.sh
./ops/github/create_project_from_template.sh

# Note the Project Number from output (needed for automation)
```

### 3. Configure Auto-Add Workflow

Edit `.github/workflows/auto-project-add.yml`:
```yaml
env:
  ORG: your-org              # Your GitHub org
  PROJECT_NUMBER: 1          # From step 2 output
```

Push to main - new issues will auto-land in project with Status=Todo.

---

## 📊 Sprint A Issues (GG-101 to GG-110)

| Issue | Title | Points | Team | Branch |
|-------|-------|--------|------|--------|
| GG-101 | Platform SDKs → Live Posting | 8 | forge, bridge | `feature/social-platform-adapters` |
| GG-102 | Worker Autoscale + Durability | 5 | pulse, forge | `feat/social-worker-scale` |
| GG-103 | Alerting & SLOs (Social Queue) | 3 | sentinel, pulse | `ops/alerts-social-queue` |
| GG-104 | RFP Responder → Draft Generator | 5 | switchboard, codeblock | `feature/rfp-drafts-e2e` |
| GG-105 | Loyalty Ledger → Points UI | 5 | bridge, lume | `feature/loyalty-ui-rules` |
| GG-106 | Brand & Voice Polish | 3 | nova, prism, storybloom, chiesan | `chore/brand-voice-pass` |
| GG-107 | SSO Hardening + Org-Binding | 3 | verifier, lume | `feat/sso-org-binding` |
| GG-108 | Pricing Page + Paywall Fences | 5 | ledger, foundry, prism | `feature/pricing-and-fences` |
| GG-109 | Competitive Matrix + GTM Pack | 5 | prism, foundry, storybloom, amani | `gtm/launch-pack` |
| GG-110 | IP Snapshot (Provisional + TS) | 5 | aegis, atlas, archivist, coda | `ip/provisional-snapshot` |

**Total**: 47 story points

---

## 🏗️ Project Template Structure

### Fields
- **Status**: Single-select (Todo, In Progress, In Review, Blocked, Done)
- **Estimate**: Number (story points)
- **Owner**: Text (team member name)
- **Priority**: Single-select (P0, P1, P2, P3)
- **Sprint**: Iteration (7-day cycles, starts Monday)

### Views
- **Board**: Kanban grouped by Status, sorted by Priority
- **List**: List view sorted by Priority

---

## 🔧 Manual Project Add Script

If you prefer manual control over issue → project mapping:

```bash
# Edit script config (ORG, PROJECT_NUMBER)
vim ops/github/project_auto_add.sh

# Run against CSV
chmod +x ops/github/project_auto_add.sh
./ops/github/project_auto_add.sh ops/github/issues.csv
```

Creates issues, adds to project, sets Status/Estimate/Owner automatically.

---

## 🧪 CI/CD Workflows

### CI Workflow (`.github/workflows/ci.yml`)

**Triggers**: Push to any branch, pull requests

**Steps**:
1. Spin up PostgreSQL 16 container
2. Install dependencies (`npm ci`)
3. Run database migrations
4. Lint code
5. Build project
6. Run tests:
   - Schema validation tests
   - Rate limits dashboard tests
   - Social queue tests
   - Sprint A sanity tests

**Environment**:
- `DATABASE_URL`: postgresql://app:secret@localhost:5432/appdb
- `NODE_ENV`: test
- `SOCIAL_WORKER_POLL_MS`: 1000

### Auto Project Add Workflow (`.github/workflows/auto-project-add.yml`)

**Triggers**: Issues opened, edited, labeled, assigned, workflow_dispatch (manual testing)

**Actions**:
1. Authenticate with GitHub API
2. Resolve project and field IDs
3. Add issue to project board
4. Set default Status = "Todo"
5. Set Owner from first assignee
6. Parse Estimate from labels (`pts:5`, `estimate:8`)
7. **Auto-Triage**:
   - Set Priority = P1 if title contains "P1:" OR label `priority:P1`
   - Route GG-10x issues to CURRENT Sprint iteration
8. **Self-Test Mode** (workflow_dispatch):
   - Creates synthetic issue with custom title/labels/assignees
   - Runs full triage workflow
   - Auto-closes synthetic issue after testing

**Permissions Required**:
- Organization Projects: Read & Write (in repo settings → Actions)

**Self-Test Usage**:
1. Go to Actions → Auto Project Add + Triage → Run workflow
2. Customize synthetic issue title/labels/assignees
3. Click "Run workflow"
4. Synthetic issue will be created, triaged, added to project, and auto-closed

---

## 🔑 Prerequisites

### Tools Required
- `gh` CLI (v2.32+): https://cli.github.com/
- `jq` (for JSON parsing): `brew install jq` or `apt install jq`
- `psql` (for CI migrations): Installed in GitHub Actions runner

### GitHub Permissions
- Repo: Issues (write)
- Repo: Pull Requests (read)
- Organization: Projects (read/write)

---

## 📝 Customization

### Add More Issues
1. Edit `issues.json` or `issues.csv`
2. Add new entries following existing format
3. Re-run `import_issues.sh` or upload CSV

### Change Project Fields
1. Edit `project_template.json`
2. Add/modify fields array
3. Re-run `create_project_from_template.sh`

### Modify CI Tests
Edit `.github/workflows/ci.yml`:
- Add test globs to Jest command
- Adjust PostgreSQL version
- Change environment variables

---

## 🐛 Troubleshooting

### Issue Import Fails
```bash
# Verify gh CLI is authenticated
gh auth status

# Verify repo is detected correctly
gh repo view
```

### Project Creation Fails
```bash
# Check org name in template
jq -r '.org' ops/github/project_template.json

# Verify gh can access org
gh api /orgs/your-org
```

### Auto-Add Workflow Not Triggering
1. Check workflow file exists: `.github/workflows/auto-project-add.yml`
2. Verify ORG and PROJECT_NUMBER are set correctly
3. Check Actions tab for error logs
4. Ensure GITHUB_TOKEN has project permissions

### CI Tests Failing
```bash
# Run locally with Docker
docker run -e POSTGRES_DB=appdb -e POSTGRES_USER=app -e POSTGRES_PASSWORD=secret -p 5432:5432 postgres:16

# Set DATABASE_URL and run tests
export DATABASE_URL=postgresql://app:secret@localhost:5432/appdb
npm test
```

---

## 📚 Additional Resources

- [GitHub CLI Manual](https://cli.github.com/manual/)
- [GitHub Projects v2 API](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-api-to-manage-projects)
- [GitHub Actions Workflows](https://docs.github.com/en/actions/using-workflows)
- [Jest Testing](https://jestjs.io/docs/getting-started)

---

**Last Updated**: November 6, 2025  
**Sprint**: A (GG-101 to GG-110)  
**Total Story Points**: 47
