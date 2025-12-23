import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execSync } from "node:child_process";
import { buildReleaseNotesSinceTag, getLatestI3Tag } from "./lib/releaseNotesSinceTag";

function sh(cmd: string, cwd?: string): string {
  return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"], cwd }).toString("utf8").trim();
}
function ensureDir(p: string) { fs.mkdirSync(p, { recursive: true }); }
function writeText(fp: string, content: string) { fs.writeFileSync(fp, content, "utf8"); }
function nowStampUTC(): string { return new Date().toISOString().replace(/[:.]/g, "-"); }
function sha256File(fp: string): string {
  const hash = crypto.createHash("sha256");
  const buf = fs.readFileSync(fp);
  hash.update(buf);
  return hash.digest("hex");
}

type Manifest = Record<string, any>;

async function main() {
  const projectKey = (process.env.PROJECT_KEY || "GigsterGarage").trim();
  const EXPORTS_DIR = path.resolve(process.cwd(), "exports");
  ensureDir(EXPORTS_DIR);

  const stamp = nowStampUTC().slice(0, 19).replace(/T/, "_") + "Z";
  const bundleName = `${projectKey.toLowerCase()}_bundle_${stamp}.tar.gz`;
  const outTar = path.join(EXPORTS_DIR, bundleName);

  const explicitNotes = process.env.RELEASE_NOTES?.trim();
  const maxCommits = Number(process.env.RELEASE_NOTES_MAX_COMMITS || 10);

  let releaseNotesMode: "manual" | "sinceTag" = explicitNotes ? "manual" : "sinceTag";
  const releaseTagPrefix = `i3/${projectKey}/`;
  let releaseTag: string | null = null;
  let releaseRange: string | null = null;
  let releaseHeadSha: string = "unknown";
  let releaseNotesMd = "";

  if (explicitNotes) {
    releaseHeadSha = sh("git rev-parse --short HEAD") || "unknown";
    releaseNotesMd = `# Release Notes\n\n**Project:** ${projectKey}\n**Head:** ${releaseHeadSha}\n\n${explicitNotes}\n`;
    releaseTag = getLatestI3Tag(projectKey) ?? null;
    releaseRange = null;
  } else {
    const gen = buildReleaseNotesSinceTag({ projectKey, maxCommits, title: "# Release Notes" });
    releaseNotesMd = gen.markdown;
    releaseTag = gen.releaseTag;
    releaseRange = gen.releaseRange;
    releaseHeadSha = gen.releaseHeadSha;
  }

  const mission = (process.env.MISSION || "").trim();
  const missionMd = mission ? `# Mission\n\n${mission}\n` : `# Mission\n\n(Define MISSION env var to override.)\n`;

  writeText(path.join(EXPORTS_DIR, "RELEASE_NOTES.md"), releaseNotesMd);
  writeText(path.join(EXPORTS_DIR, "MISSION.md"), missionMd);

  const manifest: Manifest = {
    projectKey,
    timestamp: new Date().toISOString(),
    commands_run: ["export_bundle"],
    notes: "export_bundle created a shareable archive.",
    releaseNotes: { path: "RELEASE_NOTES.md" },
    mission: { path: "MISSION.md" },

    releaseNotesMode,
    releaseTagPrefix,
    releaseTag,
    releaseRange,
    releaseHeadSha,
  };

  const manifestPath = path.join(EXPORTS_DIR, "MANIFEST.json");
  writeText(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

  execSync(`tar -czf "${outTar}" "MANIFEST.json" "RELEASE_NOTES.md" "MISSION.md"`, {
    stdio: "inherit",
    cwd: EXPORTS_DIR,
  });

  const tarSha = sha256File(outTar);
  console.log(JSON.stringify({ ok: true, projectKey, bundleName, tarPath: path.relative(process.cwd(), outTar), sha256: tarSha }, null, 2));
}

main().catch((e: any) => {
  console.error("FAIL ❌", e?.message || e);
  process.exit(1);
});
