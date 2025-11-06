#!/usr/bin/env bash
set -euo pipefail

# CONFIG — set these:
ORG="your-org"                 # e.g., i3-collective
PROJECT_NUMBER=1               # your Project (v2) number
DEFAULT_STATUS="Todo"          # lane to set on new issues
ESTIMATE_FIELD="Estimate"      # number field in your project
OWNER_FIELD="Owner"            # text field (or change to 'Assignee' if select/user type)

# Requires: gh (>=2.32), jq
check_deps(){ which gh >/dev/null && which jq >/dev/null || { echo "Install gh & jq"; exit 1; } }
check_deps

# Cache project + fields metadata
PROJECT_ID=$(gh api graphql -f query='
  query($org:String!,$number:Int!){
    organization(login:$org){
      projectV2(number:$number){ id title fields(first:50){ nodes{ id name dataType } } }
    }
  }' -F org=$ORG -F number=$PROJECT_NUMBER --jq '.data.organization.projectV2.id')

FIELDS_JSON=$(gh api graphql -f query='
  query($org:String!,$number:Int!){
    organization(login:$org){
      projectV2(number:$number){
        fields(first:50){ nodes{ id name dataType } }
      }
    }
  }' -F org=$ORG -F number=$PROJECT_NUMBER --jq '.data.organization.projectV2.fields.nodes')

get_field_id(){ echo "$FIELDS_JSON" | jq -r ".[] | select(.name==\"$1\") | .id"; }

STATUS_FIELD_ID=$(get_field_id "Status")
ESTIMATE_FIELD_ID=$(get_field_id "$ESTIMATE_FIELD")
OWNER_FIELD_ID=$(get_field_id "$OWNER_FIELD")

# Map a status option name → option ID
get_status_option_id(){
  gh api graphql -f query='
    query($org:String!,$number:Int!){
      organization(login:$org){
        projectV2(number:$number){
          field(name:"Status"){ ... on ProjectV2SingleSelectField { options { id name } } }
        }
      }
    }' -F org=$ORG -F number=$PROJECT_NUMBER --jq ".data.organization.projectV2.field.options[] | select(.name==\"$1\") | .id"
}

STATUS_OPTION_ID=$(get_status_option_id "$DEFAULT_STATUS")

[ -n "$STATUS_FIELD_ID" ] || { echo "Status field not found"; exit 1; }
[ -n "$ESTIMATE_FIELD_ID" ] || { echo "Estimate field not found"; exit 1; }
[ -n "$OWNER_FIELD_ID" ] || { echo "Owner field not found"; exit 1; }
[ -n "$STATUS_OPTION_ID" ] || { echo "Status option '$DEFAULT_STATUS' not found"; exit 1; }

# INPUT: issues.csv from above (Title, Body, Labels, Assignees, Estimate, Branch)
ISSUE_CSV="${1:-ops/github/issues.csv}"

# Create issues, add to project, set fields
# NOTE: repo detection uses current repo (remote.origin.url)
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)

tail -n +2 "$ISSUE_CSV" | while IFS=',' read -r TITLE BODY LABELS ASSIGNEES ESTIMATE BRANCH; do
  # Create issue
  ISSUE_URL=$(gh issue create --repo "$REPO" --title "$TITLE" --body "$BODY" \
    ${LABELS:+--label "$LABELS"} ${ASSIGNEES:+--assignee "$ASSIGNEES"} --json url --jq .url)

  # Add to project
  ITEM_ID=$(gh project item-add --owner "$ORG" --project-number "$PROJECT_NUMBER" --url "$ISSUE_URL" --format json --jq .id)

  # Set Status
  gh project item-edit --id "$ITEM_ID" --field-id "$STATUS_FIELD_ID" --single-select-option-id "$STATUS_OPTION_ID" >/dev/null

  # Set Estimate (number)
  if [ -n "$ESTIMATE" ]; then
    gh project item-edit --id "$ITEM_ID" --field-id "$ESTIMATE_FIELD_ID" --value "$ESTIMATE" >/dev/null
  fi

  # Set Owner (text) — use first assignee if present
  OWNER_VAL=$(echo "$ASSIGNEES" | cut -d',' -f1)
  if [ -n "$OWNER_VAL" ]; then
    gh project item-edit --id "$ITEM_ID" --field-id "$OWNER_FIELD_ID" --value "$OWNER_VAL" >/dev/null
  fi

  echo "Created & mapped: $ISSUE_URL"
done
