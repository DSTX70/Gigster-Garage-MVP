import type { Express } from "express";
import path from "node:path";
import { promises as fs } from "node:fs";

type FileResult = { path: string; ok: boolean; content?: string; error?: string };

type GGDiagEvent = {
  ts: string;
  type: string;
  message?: string;
  url?: string;
  method?: string;
  status?: number;
  detail?: any;
};

const MAX_DIAG_EVENTS = 80;
const diagBuffer: GGDiagEvent[] = [];

export function pushAdminDiagEvent(evt: GGDiagEvent) {
  diagBuffer.push(evt);
  while (diagBuffer.length > MAX_DIAG_EVENTS) diagBuffer.shift();
}

function snapshotDiag() {
  return diagBuffer.slice(-MAX_DIAG_EVENTS);
}

const MAX_BYTES = 250_000;

const ALLOWED_PREFIXES = ["client/", "server/", "shared/", "docs/"];
const BLOCKED_PREFIXES = [
  ".git",
  "node_modules",
  "dist",
  "build",
  ".env",
  ".replit",
  "replit.nix",
  ".config",
  ".ssh",
];

function isBlocked(p: string): boolean {
  const lower = p.toLowerCase();
  return BLOCKED_PREFIXES.some((b) => lower.startsWith(b) || lower.includes(`/${b}`));
}

function normalizeSafeRelativePath(p: string): string | null {
  if (!p || typeof p !== "string") return null;
  if (p.startsWith("http://") || p.startsWith("https://")) return null;
  if (path.isAbsolute(p)) return null;

  const norm = path.posix.normalize(p.replace(/\\/g, "/"));
  if (norm.startsWith("../") || norm.includes("/../") || norm === "..") return null;
  if (norm.startsWith("./")) return norm.slice(2);

  if (!ALLOWED_PREFIXES.some((pre) => norm.startsWith(pre))) return null;
  if (isBlocked(norm)) return null;

  return norm;
}

function requireToken(req: any, res: any): boolean {
  const expected = process.env.DTH_READONLY_TOKEN;
  if (!expected) {
    res.status(500).json({ ok: false, error: "DTH_READONLY_TOKEN not set on server" });
    return false;
  }
  const got = req.headers["x-dth-token"];
  if (!got || String(got) !== expected) {
    res.status(401).json({ ok: false, error: "Unauthorized" });
    return false;
  }
  return true;
}

async function readOneFile(relPath: string): Promise<FileResult> {
  const safe = normalizeSafeRelativePath(relPath);
  if (!safe) return { path: relPath, ok: false, error: "Path not allowed" };

  const abs = path.join(process.cwd(), safe);
  try {
    const st = await fs.stat(abs);
    if (!st.isFile()) return { path: safe, ok: false, error: "Not a file" };
    if (st.size > MAX_BYTES) return { path: safe, ok: false, error: "File too large" };

    const content = await fs.readFile(abs, "utf-8");
    return { path: safe, ok: true, content };
  } catch (e: any) {
    return { path: safe, ok: false, error: e?.message || "Read failed" };
  }
}

export function registerDthReadonlyRoutes(app: Express) {
  app.post("/api/dth/files", async (req: any, res: any) => {
    if (!requireToken(req, res)) return;

    const paths = Array.isArray(req.body?.paths) ? req.body.paths : [];
    if (!paths.length) return res.status(400).json({ ok: false, error: "paths[] required" });

    const files = await Promise.all(paths.map((p: string) => readOneFile(String(p))));
    res.json({ ok: true, files });
  });

  app.get("/api/dth/diagnostics", (req: any, res: any) => {
    if (!requireToken(req, res)) return;

    res.json({
      ok: true,
      count: diagBuffer.length,
      events: snapshotDiag(),
    });
  });
}
