import type { Request } from "express";

export function requireRepoOpsToken(req: Request): { ok: true } | { ok: false; error: string } {
  const expected = process.env.I3_REPO_OPS_TOKEN;
  if (!expected) return { ok: false, error: "Server missing I3_REPO_OPS_TOKEN; drop receiver disabled." };

  const got = req.header("x-ops-token");
  if (!got) return { ok: false, error: "Missing x-ops-token header." };
  if (got !== expected) return { ok: false, error: "Invalid x-ops-token." };

  return { ok: true };
}
