#!/bin/bash
# Deprecate all custom capabilities in DIW
# WARNING: This will deprecate ALL your custom capabilities. This action cannot be undone.

set -uo pipefail

echo "Fetching all custom capabilities..."
CAPS=$(diw list-custom-capabilities --my-capabilities=true --output json)

CAP_DATA=$(echo "$CAPS" | python3 -c "import sys,json; items=json.load(sys.stdin).get('items',[]); print('\n'.join([f\"{i['capabilityId']}|{i['name']}|{i['version']}\" for i in items]))" 2>/dev/null || true)

if [[ -z "$CAP_DATA" ]]; then
  echo "No custom capabilities found."
  exit 0
fi

echo "Found capabilities:"
echo "$CAP_DATA" | awk -F'|' '{printf "  %s (v%s) - ID: %s\n", $2, $3, $1}'
echo ""

read -rp "⚠️  WARNING: This will DEPRECATE ALL capabilities listed above. This CANNOT be undone. Continue? (yes/no): " CONFIRM
if [[ "$CONFIRM" != "yes" ]]; then
  echo "Aborted."
  exit 0
fi

echo ""
while IFS='|' read -r CAP_ID CAP_NAME VERSION; do
  echo "Deprecating: $CAP_NAME v$VERSION (ID: $CAP_ID)"
  diw deprecate-capability --capability-id "$CAP_ID" --version "$VERSION" || echo "Failed to deprecate $CAP_ID"
done <<< "$CAP_DATA"

echo ""
echo "All deprecate commands submitted. Check status with: diw list-custom-capabilities --my-capabilities=true"
