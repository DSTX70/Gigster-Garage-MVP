# Dream Team Hub (DTH) Governance

This folder contains governance artifacts for the Dream Team Pods workflow.

## What are Pods?

Pods are specialized AI agents that audit, propose, and verify changes to the Gigster Garage codebase:

| Pod | Specialty |
|-----|-----------|
| **Lume** | UX/nav discoverability, accessibility, user flows |
| **Forge** | Backend wiring, API correctness, integrations |
| **LexiCode** | Route/data schema alignment, type safety |
| **Sentinel** | Security, admin gating, authorization boundaries |
| **Nova** | UI consistency, component cleanup, branding |
| **Prism** | Copy/voice, marketing, competitive positioning |

## How to Request Work

1. **Create an Audit Request**: Use the GitHub Issue template `[AUDIT] <Area>`
2. **Specify the Pod**: Tag the relevant Pod specialty in the issue
3. **Define Acceptance**: Be clear about what "done" looks like

## Workflow

```
1. Repo Intake    → Pods scan codebase, build map
2. Multi-lane Audit → Each Pod audits their specialty
3. Output         → Ranked findings + paste-ready patches
4. Apply via Replit → Paste changes, run tests, PR
5. Verify Pass    → Pods re-check and confirm
```

## Folder Structure

```
/dth/
  README.md          # This file
  decisions.md       # Decision log with rationale
  audit_runs/        # Timestamped audit outputs
```

## Activation

To activate Pods in ChatGPT:

1. Connect ChatGPT to this GitHub repo via Settings → Connected apps
2. Paste the activation message in your chat thread
3. Pods will run Repo Intake and generate initial findings
