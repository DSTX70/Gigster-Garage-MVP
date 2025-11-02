# Dream Team Hub — New Pods & Intake Handoff (vNext · 2025 Q4)

This package contains everything Replit needs to wire the **New Pods + Agents** into the Dream Team Hub (DTH) and publish the **New Pod Intake** flow.

---

## 📦 Contents

- **Pillar Maps:** 3 PDFs + editable PPTX
- **Org Matrix:** 2-page PDF + Excel
- **New Pods Overview:** PDF + Excel tracker
- **Intake Forms:** PDF, Excel, **HTML Intake (Replit-ready)**
- **Seed SQL:** `dth_seed_vNext_2025Q4.sql` (schema + seed)
- **API Collection:** `DTH_NewPods_API.postman_collection.json` (Postman)
- **Handoff Manifest:** `handoff_manifest.json` (pods + autonomy + starter roles)
- **Original Handoff:** `DTH_NewPods_Handoff_vNext_2025Q4.zip`

---

## 🔧 Prerequisites

- Postgres 13+
- Python 3.10+ (FastAPI or Flask optional)
- Node or Python web server for App layer (@ :5000)
- Engine/API service (@ :8000)
- `psql` CLI and `pip`/`venv` (recommended)

---

## 🚀 Quick Start (5–10 min)

### 1) Database — create schema & seed
```bash
psql "$DATABASE_URL" -f dth_seed_vNext_2025Q4.sql
```

This creates:
- Lookups (pillars, BUs, shared services, autonomy)
- Core tables (pods, agents, M2M links)
- Seed **pods + starter agents**

### 2) App routes (@ :5000)

Add these endpoints:
- `GET /intake/new-pod` → serve `i3_NewPod_IntakeForm_vNext_2025Q4.html`
- `POST /api/intake/pod` → validate → forward to Engine `/v1/pods`

Static serve example (Flask):
```python
@app.get("/intake/new-pod")
def new_pod_form():
    return send_file("i3_NewPod_IntakeForm_vNext_2025Q4.html")
```

### 3) Engine routes (@ :8000)

Implement:
- `POST /v1/pods` → create pod + links (BUs, services)
- `POST /v1/agents` → create agents
- `POST /v1/import/new-pods` → bulk import (`handoff_manifest.json` / `.xlsx`)

**Pydantic model:** see `Give me instructions…` message or Postman collection.

### 4) Import options

**Option A — Manifest JSON**
```bash
curl -X POST http://localhost:8000/v1/import/new-pods   -H 'Content-Type: application/json'   --data-binary @handoff_manifest.json
```

**Option B — Excel Tracker**
- Parse `i3_NewPods_Tracker_vNext_2025Q4.xlsx` (sheet: *New Pods Tracker*)
- Map columns: `Pod | Pillar | Purpose | Starter Roles | DoD | KPIs | Autonomy (L0–L3) | First Month Milestones`
- Split **Starter Roles** by comma/semicolon/newline → create agents

### 5) Pillar Map & Lists

- `GET /v1/pillars/:pillar/pods` → power the Pillar view in DTH
- `GET /pods` (App) → admin grid (filters: pillar, status)
- `GET /agents` (App) → roster grid (filters: autonomy, pod)

### 6) Security & Governance

- Auth required for POST routes
- App forwards to Engine; **App never writes DB directly**
- Log **Mirror-Back** entries for create/update with payload hash
- Track autonomy changes (who/when), and enforce L0–L3 policy caps

---

## 🧪 Test Checklist

- `POST /api/intake/pod` with sample ⇒ 201 + DB rows present
- Import `handoff_manifest.json` ⇒ pods + agents appear
- Import Excel ⇒ same result as JSON
- Change agent autonomy L1→L2 ⇒ audit line present
- Filter Pillar=Impact ⇒ IPO, Education & Cohorts, Accessibility & Captioning, GlobalCollabs Partnerships visible
- HTML intake exports **JSON/CSV** that re-import cleanly

---

## 📝 Notes

- Gradient: **Ember → Indigo** (brand standard). White‑label versions are included for partner decks.
- Impact label applies **only** to programs directly benefiting society/culture with measurement.
- All file names suffixed with `vNext_2025Q4` for traceability.
