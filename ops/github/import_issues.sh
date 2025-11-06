#!/usr/bin/env bash
set -euo pipefail
FILE="${1:-ops/github/issues.json}"

which gh >/dev/null || { echo "Please install GitHub CLI: https://cli.github.com/"; exit 1; }

jq -c '.[]' "$FILE" | while read -r issue; do
  TITLE=$(echo "$issue" | jq -r '.title')
  BODY=$(echo "$issue"  | jq -r '.body')
  LABELS=$(echo "$issue"| jq -r '.labels | join(",")')
  ASSIGNEES=$(echo "$issue" | jq -r '.assignees | join(",")')
  gh issue create --title "$TITLE" --body "$BODY" \
    ${LABELS:+--label "$LABELS"} \
    ${ASSIGNEES:+--assignee "$ASSIGNEES"}
done
