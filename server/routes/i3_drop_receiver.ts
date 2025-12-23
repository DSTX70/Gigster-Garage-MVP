import type { Express, Request, Response } from "express";
import path from "node:path";
import { spawn } from "node:child_process";
import { requireRepoOpsToken } from "../lib/i3_drop/auth";
import { parseDropText } from "../lib/i3_drop/parseDrop";
import { applyDropFiles, ApplyMode } from "../lib/i3_drop/applyDrop";

export function registerI3DropReceiver(app: Express) {
  app.post("/api/i3/drop/validate", (req: Request, res: Response) => {
    const auth = requireRepoOpsToken(req);
    if (!auth.ok) return res.status(403).json(auth);

    const dropText = String(req.body?.dropText || "");
    const parsed = parseDropText(dropText);
    if (!parsed.ok) return res.status(400).json(parsed);

    return res.json({
      ok: true,
      files: parsed.files.map(f => ({ path: f.path, bytes: Buffer.byteLength(f.content, "utf8") })),
      warnings: parsed.warnings,
    });
  });

  app.post("/api/i3/drop/apply", (req: Request, res: Response) => {
    const auth = requireRepoOpsToken(req);
    if (!auth.ok) return res.status(403).json(auth);

    const dropText = String(req.body?.dropText || "");
    const mode: ApplyMode = req.body?.mode === "overwrite" ? "overwrite" : "additive";
    const dryRun = Boolean(req.body?.dryRun);

    const parsed = parseDropText(dropText);
    if (!parsed.ok) return res.status(400).json(parsed);

    const repoRoot = path.resolve(process.cwd());
    const out = applyDropFiles(parsed.files, { repoRoot, mode, dryRun });
    return res.json(out);
  });

  app.post("/api/i3/drop/ship", (req: Request, res: Response) => {
    const auth = requireRepoOpsToken(req);
    if (!auth.ok) return res.status(403).send(auth.error);

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    const child = spawn("bash", ["tools/ship_publish.sh"], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    res.write(`SHIP: start\nCMD: bash tools/ship_publish.sh\n\n`);
    child.stdout.on("data", (d) => res.write(d));
    child.stderr.on("data", (d) => res.write(d));

    child.on("close", (code) => {
      res.write(`\n\nSHIP: done (exit=${code})\n`);
      res.end();
    });

    child.on("error", (err) => {
      res.write(`\nSHIP: error ${String(err)}\n`);
      res.end();
    });
  });
}
