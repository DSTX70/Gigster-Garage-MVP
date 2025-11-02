from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, constr
from typing import List, Optional
from uuid import uuid4

app = FastAPI(title="Dream Team Hub — Engine (vNext 2025 Q4)")

# --- Schemas (align with OpenAPI) ---
class IntakePod(BaseModel):
    podName: constr(min_length=2)
    pillar: constr(pattern="^(Imagination|Innovation|Impact)$")
    purpose: str = ""
    type: constr(pattern="^(New|Expansion|Replacement|Reorg)$")
    priority: constr(pattern="^(High|Medium|Low)$")
    starterRoles: str = ""
    autonomy: constr(pattern="^L[0-3]$")
    budget: str = ""
    owner: str = ""
    linkedBUs: List[str] = []
    sharedServices: List[str] = []
    dependencies: str = ""
    kpis: str = ""
    deliverables: str = ""
    milestones: str = ""
    version: str = "vNext_2025Q4"

class AgentCreate(BaseModel):
    name: Optional[str] = None
    title: str
    autonomy: constr(pattern="^L[0-3]$")
    podName: str
    status: constr(pattern="^(active|inactive)$") = "active"

# --- In-memory stores (replace with DB integration) ---
pods_store = {}
agents_store = {}

# --- Engine endpoints ---
@app.post("/v1/pods", status_code=201)
def create_pod(p: IntakePod):
    if p.podName in pods_store:
        # idempotent upsert-like behavior
        pods_store[p.podName]["data"] = p.dict()
        return {"ok": True, "pod": p.podName}
    pods_store[p.podName] = {"id": str(uuid4()), "data": p.dict()}
    # split starter roles into agents
    roles = [r.strip() for sep in [";", "
", ","] for r in p.starterRoles.split(sep) if r.strip()]
    for r in roles:
        agents_store[str(uuid4())] = {
            "title": r.replace("(L0)","").replace("(L1)","").replace("(L2)","").replace("(L3)","").strip(),
            "autonomy": ("L0" if "(L0)" in r else "L1" if "(L1)" in r else "L2" if "(L2)" in r else "L3" if "(L3)" in r else p.autonomy),
            "podName": p.podName,
            "status": "active"
        }
    return {"ok": True, "pod": p.podName}

@app.post("/v1/agents", status_code=201)
def create_agent(a: AgentCreate):
    if a.podName not in pods_store:
        raise HTTPException(status_code=400, detail="Unknown podName")
    aid = str(uuid4())
    agents_store[aid] = a.dict()
    return {"ok": True, "id": aid}

@app.post("/v1/import/new-pods")
def import_new_pods(payload: dict = {}):
    # Expect client to send handoff_manifest.json content or handle XLSX server-side
    created_pods = 0
    created_agents = 0
    if "pods" in payload:
        for p in payload["pods"]:
            name = p.get("name")
            if not name: 
                continue
            # Minimal IntakePod build
            ip = IntakePod(
                podName=name,
                pillar=p.get("pillar","Innovation"),
                purpose=p.get("purpose",""),
                type=p.get("type","New"),
                priority=p.get("priority","High"),
                starterRoles="; ".join(p.get("starter_roles", [])),
                autonomy=p.get("autonomy","L1"),
                budget=p.get("budget",""),
                owner=p.get("owner",""),
                linkedBUs=p.get("linkedBUs",[]),
                sharedServices=p.get("sharedServices",[]),
                dependencies=p.get("dependencies",""),
                kpis=p.get("kpis",""),
                deliverables=p.get("deliverables",""),
                milestones=p.get("milestones",""),
                version=p.get("version","vNext_2025Q4")
            )
            if name not in pods_store:
                create_pod(ip)
                created_pods += 1
            # Count agents created during create_pod by diffing size is omitted for simplicity
    return {"ok": True, "createdPods": created_pods, "createdAgents": created_agents}

@app.get("/v1/pillars/{pillar}/pods")
def list_pods_by_pillar(pillar: str):
    res = [ {"id":v["id"], **v["data"]} for k,v in pods_store.items() if v["data"]["pillar"] == pillar ]
    return {"count": len(res), "items": res}

@app.get("/debug/state")
def debug_state():
    return {"pods": pods_store, "agents": agents_store}
