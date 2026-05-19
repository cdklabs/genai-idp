#!/bin/bash
# Destroy deployed applications in DIW
# By default, only destroys FAILED applications
# Use --all to destroy ALL applications
# WARNING: Use with caution.

set -uo pipefail

show_help() {
  cat << EOF
Usage: $0 [OPTIONS]

Destroy deployed applications in DIW.

OPTIONS:
  --all     Destroy ALL applications (default: only FAILED)
  --help    Show this help message

EXAMPLES:
  $0              # Destroy only FAILED applications
  $0 --all        # Destroy ALL applications
EOF
  exit 0
}

if [[ "${1:-}" == "--help" ]]; then
  show_help
fi

DESTROY_ALL=false
if [[ "${1:-}" == "--all" ]]; then
  DESTROY_ALL=true
fi

echo "Fetching all applications..."
APPS=$(diw list-applications --output json)

if [[ "$DESTROY_ALL" == "true" ]]; then
  APP_DATA=$(echo "$APPS" | python3 -c "import sys,json; items=json.load(sys.stdin).get('items',[]); print('\n'.join([f\"{i['applicationId']}|{i.get('name','N/A')}|{i.get('latestDeployment',{}).get('status','UNKNOWN')}\" for i in items]))" 2>/dev/null || true)
  FILTER_MSG="ALL applications"
else
  APP_DATA=$(echo "$APPS" | python3 -c "import sys,json; items=json.load(sys.stdin).get('items',[]); failed=[i for i in items if i.get('latestDeployment',{}).get('status') in ['FAILED','DESTROY_FAILED']]; print('\n'.join([f\"{i['applicationId']}|{i.get('name','N/A')}|{i.get('latestDeployment',{}).get('status','UNKNOWN')}\" for i in failed]))" 2>/dev/null || true)
  FILTER_MSG="FAILED or DESTROY_FAILED applications"
fi

if [[ -z "$APP_DATA" ]]; then
  echo "No $FILTER_MSG found."
  exit 0
fi

echo "Found $FILTER_MSG:"
echo "$APP_DATA" | awk -F'|' '{printf "  %s [%s] - ID: %s\n", $2, $3, $1}'
echo ""

read -rp "⚠️  WARNING: This will destroy the applications listed above. Continue? (y/[N]): " CONFIRM
if [[ "$CONFIRM" != "y" ]]; then
  echo "Aborted."
  exit 0
fi

echo ""
while IFS='|' read -r APP_ID APP_NAME STATUS; do
  echo "Destroying: $APP_NAME [$STATUS] (ID: $APP_ID)"
  diw start-destroy-application --application-id "$APP_ID" || echo "Failed to destroy $APP_ID"
done <<< "$APP_DATA"

echo ""
echo "All destroy commands submitted. Check status with: diw list-applications"
