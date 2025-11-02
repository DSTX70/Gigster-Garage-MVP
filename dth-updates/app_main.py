from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from pydantic import BaseModel, Field
import httpx, os, json

ENGINE_BASE = os.getenv("ENGINE_BASE", "http://engine:8000")

app = FastAPI(title="Dream Team Hub — App (vNext 2025 Q4)")

# Serve static intake HTML from local file
HTML_PATH = os.getenv("INTAKE_HTML_PATH", "i3_NewPod_IntakeForm_vNext_2025Q4.html")

@app.get("/intake/new-pod", response_class=HTMLResponse)
def intake_form():
    return FileResponse(HTML_PATH)

class IntakePayload(BaseModel):
    # Accept arbitrary shape; pass-through to engine validation
    __root__: dict

@app.post("/api/intake/pod")
async def intake_pod(req: Request):
    payload = await req.json()
    async with httpx.AsyncClient() as client:
        r = await client.post(f"{ENGINE_BASE}/v1/pods", json=payload)
    return JSONResponse(status_code=r.status_code, content=r.json())

@app.get("/healthz")
def healthz():
    return {"ok": True}
