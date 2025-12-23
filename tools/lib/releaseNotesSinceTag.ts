import { execSync } from "node:child_process";

function sh(cmd: string, cwd?: string): string {
  return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"], cwd }).toString("utf8").trim();
}
function safeSh(cmd: string, cwd?: string): string {
  try { return sh(cmd, cwd); } catch { return ""; }
}
export function getGitTopLevel(): string {
  return sh("git rev-parse --show-toplevel");
}
export function getLatestI3Tag(projectKey: string, cwd?: string): string | null {
  const refPrefix = `refs/tags/i3/${projectKey}`;
  const out =
    safeSh(`git for-each-ref --sort=-creatordate --format="%(refname:short)" ${refPrefix}`, cwd) ||
    safeSh(`git for-each-ref --sort=-creatordate --format="%(refname:short)" ${refPrefix}/`, cwd);

  const tags = out.split("\n").map(s => s.trim()).filter(Boolean);
  if (tags.length) return tags[0];

  const out2 =
    safeSh(`git for-each-ref --sort=-version:refname --format="%(refname:short)" ${refPrefix}`, cwd) ||
    safeSh(`git for-each-ref --sort=-version:refname --format="%(refname:short)" ${refPrefix}/`, cwd);

  const tags2 = out2.split("\n").map(s => s.trim()).filter(Boolean);
  return tags2.length ? tags2[tags2.length - 1] : null;
}

export function buildReleaseNotesSinceTag(opts: {
  projectKey: string;
  maxCommits: number;
  title?: string;
}): { markdown: string; releaseTag: string | null; releaseRange: string; releaseHeadSha: string } {
  const top = getGitTopLevel();
  const headShort = safeSh("git rev-parse --short HEAD", top) || "unknown";
  const maxCommits = Math.min(Math.max(opts.maxCommits || 10, 5), 500);
  const title = opts.title ?? "# Release Notes";

  const latestTag = getLatestI3Tag(opts.projectKey, top);
  const range = latestTag ? `${latestTag}..HEAD` : `HEAD~${maxCommits}..HEAD`;

  const log = safeSh(
    `git log ${range} --no-merges --date=short --pretty=format:"- %ad %h %s" -n ${maxCommits}`,
    top
  );

  const lines = log ? log.split("\n").filter(Boolean) : [];
  const header = [
    title,
    "",
    `**Project:** ${opts.projectKey}`,
    `**Head:** ${headShort}`,
    latestTag ? `**Tag:** ${latestTag}` : `**Tag:** (none found, using last ${maxCommits} commits)`,
    `**Range:** ${range}`,
    "",
  ].join("\n");

  const body = lines.length ? lines.join("\n") : "- (No commits found in range.)";
  return { markdown: `${header}${body}\n`, releaseTag: latestTag, releaseRange: range, releaseHeadSha: headShort };
}
