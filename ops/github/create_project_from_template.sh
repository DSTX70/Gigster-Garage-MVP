#!/usr/bin/env bash
set -euo pipefail

TEMPLATE_JSON="${1:-ops/github/project_template.json}"

need() { command -v "$1" >/dev/null || { echo "Missing $1"; exit 1; }; }
need gh; need jq

ORG=$(jq -r '.org' "$TEMPLATE_JSON")
NAME=$(jq -r '.project_name' "$TEMPLATE_JSON")
DESC=$(jq -r '.project_description' "$TEMPLATE_JSON")

# 1) Create Project v2 (org-level)
PROJECT_URL=$(gh project create --owner "$ORG" --title "$NAME" --format json --jq .url)
PROJECT_NUMBER=$(echo "$PROJECT_URL" | sed -E 's#.*/projects/([0-9]+)$#\1#')

# 2) Create fields
jq -c '.fields[]' "$TEMPLATE_JSON" | while read -r field; do
  F_NAME=$(echo "$field" | jq -r '.name')
  F_TYPE=$(echo "$field" | jq -r '.type')
  case "$F_TYPE" in
    TEXT|NUMBER)
      gh project field-create --owner "$ORG" --project-number "$PROJECT_NUMBER" --name "$F_NAME" --data-type "$F_TYPE" >/dev/null
      ;;
    SINGLE_SELECT)
      gh project field-create --owner "$ORG" --project-number "$PROJECT_NUMBER" --name "$F_NAME" --data-type SINGLE_SELECT >/dev/null
      # Add options
      jq -r '.options[]' <<<"$field" | while read -r opt; do
        gh project field-update --owner "$ORG" --project-number "$PROJECT_NUMBER" --name "$F_NAME" --add-option "$opt" >/dev/null
      done
      ;;
    ITERATION)
      DURATION=$(echo "$field" | jq -r '.config.duration // 7')
      START_DAY=$(echo "$field" | jq -r '.config.start_day // "monday"')
      gh project field-create --owner "$ORG" --project-number "$PROJECT_NUMBER" \
        --name "$F_NAME" --data-type ITERATION --iteration-duration "$DURATION" --iteration-start-day "$START_DAY" >/dev/null
      ;;
    *)
      echo "Unknown field type: $F_TYPE" ;;
  esac
done

# 3) Create views
jq -c '.views[]' "$TEMPLATE_JSON" | while read -r view; do
  V_NAME=$(echo "$view" | jq -r '.name')
  V_TYPE=$(echo "$view" | jq -r '.type')
  V_FILTER=$(echo "$view" | jq -r '.filter // ""')

  # Create an empty view first
  gh project view-create --owner "$ORG" --project-number "$PROJECT_NUMBER" --title "$V_NAME" --type "$V_TYPE" >/dev/null

  # Apply filter (if supported by current gh version)
  if [ -n "$V_FILTER" ] && [ "$V_FILTER" != "null" ]; then
    gh project view-update --owner "$ORG" --project-number "$PROJECT_NUMBER" --title "$V_NAME" --filter "$V_FILTER" >/dev/null || true
  fi

  # Apply layout (group by Status for Board)
  GROUP_BY=$(echo "$view" | jq -r '.layout.group_by // ""')
  if [ "$V_TYPE" = "BOARD" ] && [ -n "$GROUP_BY" ] && [ "$GROUP_BY" != "null" ]; then
    gh project view-update --owner "$ORG" --project-number "$PROJECT_NUMBER" --title "$V_NAME" --group-by "$GROUP_BY" >/dev/null || true
  fi

  # Sort (optional)
  SORT_FIELD=$(echo "$view" | jq -r '.sort.field // ""')
  SORT_DIR=$(echo "$view"   | jq -r '.sort.direction // "asc"')
  if [ -n "$SORT_FIELD" ] && [ "$SORT_FIELD" != "null" ]; then
    gh project view-update --owner "$ORG" --project-number "$PROJECT_NUMBER" --title "$V_NAME" --sort-by "$SORT_FIELD" --sort-direction "$SORT_DIR" >/dev/null || true
  fi
done

echo "Project created: $PROJECT_URL"
echo "Project number: $PROJECT_NUMBER"
