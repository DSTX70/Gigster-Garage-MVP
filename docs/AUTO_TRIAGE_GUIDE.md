# Auto-Triage Guide for GitHub Project v2

This guide explains the automatic issue triage system that routes issues to your Project v2 board with smart defaults.

## 🎯 What Gets Auto-Triaged

The `.github/workflows/auto-project-add.yml` workflow automatically:

1. **Adds every new issue** to your Project v2 board
2. **Sets default fields** (Status, Owner, Estimate)
3. **Auto-assigns Priority** based on title or labels
4. **Routes to Sprint** based on issue number pattern

---

## 🔧 Auto-Triage Rules

### Rule 1: Default Fields

**Every issue gets**:
- **Status**: "Todo" (default status from template)
- **Owner**: First assignee (if any)
- **Estimate**: Parsed from labels like `pts:5` or `estimate:8`

### Rule 2: Priority Assignment

**Priority = P1** is automatically set if:
- Title contains "P1:" (e.g., "P1: Fix critical bug")
- OR issue has label `priority:P1`

**Example**:
```
Title: "GG-101 P1: Platform SDKs → Live Posting"
Label: priority:P1
Result: Priority field set to "P1"
```

### Rule 3: Sprint Routing

**Sprint = CURRENT** is automatically set if:
- Title starts with "GG-10" (e.g., GG-101, GG-102, GG-109)

**Example**:
```
Title: "GG-101 — Platform SDKs → Live Posting"
Result: Assigned to current Sprint iteration
```

---

## 📋 Label Conventions

### Estimate Labels
Use these label formats to auto-populate the Estimate field:
- `pts:3` → Estimate = 3
- `pts:5` → Estimate = 5
- `pts:8` → Estimate = 8
- `estimate:13` → Estimate = 13

**Regex**: `^(pts|estimate):[0-9]+$` (case-insensitive)

### Priority Labels
- `priority:P0` → Priority = P0 (requires code change to auto-set)
- `priority:P1` → Priority = P1 (auto-set by workflow)
- `priority:P2` → Priority = P2 (requires code change to auto-set)
- `priority:P3` → Priority = P3 (requires code change to auto-set)

**Current Implementation**: Only P1 is auto-detected

---

## 🧪 Self-Test Mode

The workflow includes a built-in testing feature:

### How to Run Self-Test

1. Go to **Actions** → **Auto Project Add + Triage** → **Run workflow**
2. Fill in the form:
   - **Test Title**: `GG-101 P1: synthetic test`
   - **Test Body**: `Synthetic issue for testing`
   - **Test Labels**: `priority:P1,pts:5`
   - **Test Assignees**: `your-username` (optional)
3. Click **Run workflow**

### What Happens

1. ✅ Creates a synthetic issue with your specified details
2. ✅ Adds it to the Project v2 board
3. ✅ Sets Status=Todo, Owner, Estimate=5
4. ✅ Auto-triages: Priority=P1, Sprint=CURRENT
5. ✅ **Auto-closes the synthetic issue** (cleanup)

**Result**: You can verify the workflow works without cluttering your backlog!

---

## 🔍 Verification Checklist

After enabling auto-triage, verify it works:

### Test Case 1: Basic Issue
```bash
gh issue create --title "Test basic issue" --body "Testing default fields"
```
**Expected**:
- ✅ Added to project
- ✅ Status = Todo

### Test Case 2: Issue with Estimate
```bash
gh issue create --title "Test estimate" --body "Testing estimate parsing" --label "pts:5"
```
**Expected**:
- ✅ Added to project
- ✅ Status = Todo
- ✅ Estimate = 5

### Test Case 3: P1 Priority
```bash
gh issue create --title "P1: Critical bug fix" --body "Testing priority" --label "priority:P1"
```
**Expected**:
- ✅ Added to project
- ✅ Status = Todo
- ✅ Priority = P1

### Test Case 4: Sprint Routing
```bash
gh issue create --title "GG-101 — Platform SDKs" --body "Testing sprint routing" --label "pts:8"
```
**Expected**:
- ✅ Added to project
- ✅ Status = Todo
- ✅ Estimate = 8
- ✅ Sprint = CURRENT

### Test Case 5: Full Auto-Triage
```bash
gh issue create --title "GG-102 P1: Worker Autoscale" --body "Full triage test" --label "priority:P1,pts:5" --assignee "your-username"
```
**Expected**:
- ✅ Added to project
- ✅ Status = Todo
- ✅ Owner = your-username
- ✅ Estimate = 5
- ✅ Priority = P1
- ✅ Sprint = CURRENT

---

## ⚙️ Configuration

### Workflow Variables

Edit `.github/workflows/auto-project-add.yml`:

```yaml
env:
  ORG: your-org              # Your GitHub organization
  PROJECT_NUMBER: 1          # Your Project v2 number
  DEFAULT_STATUS: "Todo"     # Default status for new issues
  ESTIMATE_FIELD: "Estimate" # Name of estimate field
  OWNER_FIELD: "Owner"       # Name of owner field
```

### Required Project Fields

Your Project v2 must have these fields (created by `project_template.json`):

| Field | Type | Options |
|-------|------|---------|
| Status | Single Select | Todo, In Progress, In Review, Blocked, Done |
| Estimate | Number | - |
| Owner | Text | - |
| Priority | Single Select | P0, P1, P2, P3 |
| Sprint | Iteration | 7-day cycles, starts Monday |

---

## 🐛 Troubleshooting

### Workflow Not Triggering

**Problem**: New issues aren't being added to project

**Solutions**:
1. Check Actions tab for errors
2. Verify `ORG` and `PROJECT_NUMBER` are set correctly
3. Ensure GITHUB_TOKEN has project permissions:
   - Go to repo Settings → Actions → Workflow permissions
   - Enable "Read and write permissions"

### Priority Not Auto-Set

**Problem**: P1 issues aren't getting Priority=P1

**Solutions**:
1. Verify title contains "P1:" (case-insensitive)
2. OR verify issue has label `priority:P1` (exact match)
3. Check that Priority field has option "P1" (from template)
4. Review Actions logs for field resolution errors

### Sprint Not Auto-Set

**Problem**: GG-10x issues aren't routing to current Sprint

**Solutions**:
1. Verify title starts with "GG-10" (e.g., GG-101, GG-102)
2. Ensure Sprint field is configured as Iteration type
3. Check that at least one Sprint iteration is marked "CURRENT"
4. Review Actions logs for iteration resolution

### Estimate Not Parsing

**Problem**: Labels like `pts:5` aren't setting Estimate

**Solutions**:
1. Verify label format: `pts:N` or `estimate:N` where N is a number
2. Check label spelling (case-insensitive)
3. Ensure Estimate field exists and is Number type
4. Review Actions logs for parsing errors

---

## 🎨 Customization Examples

### Add P0 Auto-Triage

Edit the workflow's "Project add + defaults + triage" step:

```bash
# After the P1 auto-triage block, add:
if echo "$TITLE" | grep -qi 'P0:' || echo "$LABELS_CSV" | tr ',' '\n' | grep -qi '^priority:P0$'; then
  PRIORITY_P0_ID=$(jq -r '.data.organization.projectV2.fields.nodes[] | select(.name=="Priority") | .options[]? | select(.name=="P0") | .id' project.json)
  if [ -n "$PRIORITY_FIELD_ID" ] && [ -n "$PRIORITY_P0_ID" ]; then
    gh project item-edit --id "$ITEM_ID" --field-id "$PRIORITY_FIELD_ID" --single-select-option-id "$PRIORITY_P0_ID"
  fi
fi
```

### Route Bugs to Bug Sprint

```bash
# Add after Sprint routing:
if echo "$LABELS_CSV" | tr ',' '\n' | grep -qi '^type:bug$'; then
  BUG_SPRINT_ID=$(jq -r '.data.organization.projectV2.fields.nodes[] | select(.name=="Sprint") | .configuration.iterations[]? | select(.title=="Bug Fixes") | .id' project.json)
  if [ -n "$SPRINT_FIELD_ID" ] && [ -n "$BUG_SPRINT_ID" ]; then
    gh project item-edit --id "$ITEM_ID" --field-id "$SPRINT_FIELD_ID" --iteration-id "$BUG_SPRINT_ID"
  fi
fi
```

---

## 📊 Analytics

### Track Auto-Triage Success Rate

Query your project to see triage effectiveness:

```graphql
query($org: String!, $number: Int!) {
  organization(login: $org) {
    projectV2(number: $number) {
      items(first: 100) {
        nodes {
          content {
            ... on Issue {
              title
              labels(first: 10) {
                nodes { name }
              }
            }
          }
          fieldValues(first: 10) {
            nodes {
              ... on ProjectV2ItemFieldSingleSelectValue {
                field { name }
                name
              }
              ... on ProjectV2ItemFieldNumberValue {
                field { name }
                number
              }
              ... on ProjectV2ItemFieldIterationValue {
                field { name }
                title
              }
            }
          }
        }
      }
    }
  }
}
```

---

## 🎯 Best Practices

1. **Use consistent label formats**: Stick to `pts:N` or `estimate:N` for estimates
2. **Include P1 in titles**: Makes it obvious in issue lists
3. **Test with workflow_dispatch**: Always verify changes with self-test before relying on auto-triage
4. **Monitor Actions logs**: Check for failures after enabling
5. **Keep Sprint iterations current**: Mark one iteration as CURRENT for routing to work

---

**Last Updated**: November 6, 2025  
**Workflow Version**: 2.0 (with auto-triage + self-test)
