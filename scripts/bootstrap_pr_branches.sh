#!/usr/bin/env bash
set -euo pipefail

# Ensure clean working tree
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Please commit or stash your changes before running this."
  exit 1
fi

git fetch origin || true
git checkout main
git pull --ff-only || true

make_branch() {
  local branch="$1" file="$2" title="$3"
  git checkout -b "$branch"
  mkdir -p docs/prs
  echo "# ${title}" > "docs/prs/${file}"
  echo "" >> "docs/prs/${file}"
  echo "- Placeholder note to anchor initial PR for ${title}." >> "docs/prs/${file}"
  git add "docs/prs/${file}"
  git commit -m "${title}: seed PR placeholder"
  git push -u origin "$branch"
  git checkout main
}

make_branch "feature/social-platform-adapters"  "GG-101_forge_todo.md"   "GG-101 — Platform SDKs → Live Posting"
make_branch "feat/social-worker-scale"          "GG-102_pulse_todo.md"   "GG-102 — Worker Autoscale + Durability"
make_branch "ops/alerts-social-queue"           "GG-103_sentinel_todo.md" "GG-103 — Alerts & SLOs (Social Queue)"

echo "Branches created & pushed:"
echo "  - feature/social-platform-adapters"
echo "  - feat/social-worker-scale"
echo "  - ops/alerts-social-queue"
echo ""
echo "Next: open PRs on GitHub.com and pick the matching PR template."
