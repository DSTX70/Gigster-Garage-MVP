import { execSync } from "node:child_process";

function out(cmd: string, cwd?: string): string {
  return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"], cwd }).toString("utf8").trim();
}
function run(cmd: string, cwd?: string) {
  execSync(cmd, { stdio: "inherit", cwd });
}
function isoStampUTC(): string {
  const iso = new Date().toISOString();
  const y = iso.slice(0, 4), m = iso.slice(5, 7), d = iso.slice(8, 10);
  const hh = iso.slice(11, 13), mm = iso.slice(14, 16), ss = iso.slice(17, 19);
  return `${y}${m}${d}_${hh}${mm}${ss}Z`;
}

async function main() {
  const projectKey = (process.env.PROJECT_KEY || "GigsterGarage").trim();
  const remote = process.env.REMOTE || "origin";
  const push = process.env.PUSH_TAG === "1";
  const dryRun = process.env.DRY_RUN === "1";

  const top = out("git rev-parse --show-toplevel");
  const headShort = out("git rev-parse --short HEAD", top);

  const stamp = isoStampUTC();
  const tag = `i3/${projectKey}/r${stamp}`;
  const msg = `i3 release ${projectKey} ${stamp} (${headShort})`;

  console.log(`TAG: ${tag}`);
  console.log(`HEAD: ${headShort}`);
  console.log(`MODE: ${dryRun ? "DRY_RUN" : "LIVE"}`);
  console.log(`PUSH: ${push ? `yes (${remote})` : "no"}`);

  if (dryRun) return;

  run(`git tag -a "${tag}" -m "${msg}"`, top);
  if (push) run(`git push ${remote} "${tag}"`, top);

  console.log(`✅ Created${push ? " + pushed" : ""} tag: ${tag}`);
}

main().catch((e: any) => {
  console.error("FAIL ❌", e?.message || e);
  process.exit(1);
});
