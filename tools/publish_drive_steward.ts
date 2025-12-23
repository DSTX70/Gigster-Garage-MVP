import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execSync } from "node:child_process";

function reqEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function findNewestTar(exportsDir: string): string {
  const entries = fs.readdirSync(exportsDir)
    .filter((f) => f.endsWith(".tar.gz"))
    .map((f) => ({ f, mtime: fs.statSync(path.join(exportsDir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  if (!entries.length) throw new Error(`No .tar.gz found in ${exportsDir}`);
  return path.join(exportsDir, entries[0].f);
}

function sha256File(fp: string): string {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(fp));
  return hash.digest("hex");
}

function gitShortHead(): string {
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString("utf8").trim();
  } catch {
    return "unknown";
  }
}

async function main() {
  const DRIVE_STEWARD_URL = reqEnv("DRIVE_STEWARD_URL").replace(/\/$/, "");
  const DRIVE_STEWARD_TOKEN = reqEnv("DRIVE_STEWARD_TOKEN");
  const PROJECT_KEY = (process.env.PROJECT_KEY || "GigsterGarage").trim();

  const EXPORTS_DIR = path.resolve(process.cwd(), "exports");
  const tarPath = findNewestTar(EXPORTS_DIR);
  const bundleName = path.basename(tarPath);
  const sha256 = sha256File(tarPath);
  const createdAt = new Date().toISOString();

  const meta = {
    projectKey: PROJECT_KEY,
    bundleName,
    sha256,
    createdAt,
    releaseHeadSha: gitShortHead(),
  };

  const url = `${DRIVE_STEWARD_URL}/api/exports/push`;

  const metaJson = JSON.stringify(meta).replace(/"/g, '\\"');
  const cmd = [
    `curl -sS -w "\\n__HTTP_CODE__:%{http_code}\\n" -X POST "${url}"`,
    `-H "x-i3-token: ${DRIVE_STEWARD_TOKEN}"`,
    `-F "bundle=@${tarPath}"`,
    `-F "meta=${metaJson}"`,
  ].join(" ");

  const out = execSync(cmd, { stdio: ["ignore", "pipe", "pipe"] }).toString("utf8");
  const m = out.match(/__HTTP_CODE__:\\d{3}\\s*$/) || out.match(/__HTTP_CODE__:(\d{3})\s*$/);
  const code = m ? Number(m[1]) : 0;
  const body = out.replace(/__HTTP_CODE__:\d{3}\s*$/, "").trim();

  if (!(code >= 200 && code < 300)) {
    console.error(`FAIL ❌ Publish failed HTTP ${code}`);
    console.error(body);
    process.exit(1);
  }

  if (body.toLowerCase().includes("<html")) {
    console.error("FAIL ❌ Publish returned HTML (not an API response). Check endpoint.");
    process.exit(1);
  }

  console.log(body);
  console.log(`✅ Published ${bundleName} (${sha256}) to Drive Steward via /api/exports/push`);
}

main().catch((e: any) => {
  console.error("FAIL ❌", e?.message || e);
  process.exit(1);
});
