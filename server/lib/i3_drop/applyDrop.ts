import fs from "node:fs";
import path from "node:path";
import type { DropFile } from "./parseDrop";

export type ApplyMode = "additive" | "overwrite";

function isSafeRelativePath(p: string): boolean {
  if (!p) return false;
  if (p.includes("\u0000")) return false;
  if (path.isAbsolute(p)) return false;
  const norm = path.posix.normalize(p.replace(/\\/g, "/"));
  if (norm.startsWith("../") || norm.includes("/../") || norm === "..") return false;
  return true;
}

function isAllowed(p: string, allowedPrefixes: string[]): boolean {
  const norm = p.replace(/\\/g, "/");
  return allowedPrefixes.some(prefix => norm === prefix || norm.startsWith(prefix));
}

function getAllowedPrefixes(): string[] {
  const raw = process.env.I3_DROP_ALLOWED_PREFIXES_JSON;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every(x => typeof x === "string")) return parsed;
    } catch {}
  }
  return [
    "tools/",
    "server/",
    "client/",
    "MANIFEST.template.json",
    "RELEASE_NOTES.template.md",
    "MISSION.template.md",
  ];
}

export function applyDropFiles(files: DropFile[], opts: { repoRoot: string; mode: ApplyMode; dryRun: boolean }) {
  const allowedPrefixes = getAllowedPrefixes();
  const results: Array<{ path: string; status: string; message?: string }> = [];

  for (const f of files) {
    const rel = f.path.trim();

    if (!isSafeRelativePath(rel)) {
      results.push({ path: rel, status: "rejected_path", message: "Unsafe path." });
      continue;
    }
    if (!isAllowed(rel, allowedPrefixes)) {
      results.push({ path: rel, status: "rejected_path", message: "Not in allowlist." });
      continue;
    }

    const abs = path.resolve(opts.repoRoot, rel);
    const dir = path.dirname(abs);
    const exists = fs.existsSync(abs);

    if (exists && opts.mode === "additive") {
      results.push({ path: rel, status: "skipped_exists", message: "Additive mode." });
      continue;
    }

    if (!opts.dryRun) {
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(abs, f.content, "utf8");
    }

    results.push({ path: rel, status: exists ? "overwritten" : "created", message: opts.dryRun ? "dryRun" : undefined });
  }

  const bad = results.some(r => r.status === "rejected_path");
  return { ok: !bad, results, allowedPrefixes };
}
