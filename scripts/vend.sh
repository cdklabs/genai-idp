#!/bin/bash
# Vend capability to GenAI Enterprise Hub catalog: create draft, list, submit for approval.
# Reads config from vending-config.yaml. If missing, prompts interactively to create it.
# Prerequisites: diw CLI configured and logged in as Application Developer.
#
# IMPORTANT: --capability-path must reference from the PARENT directory, not inside the capability folder.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG="$ROOT_DIR/vending-config.yaml"

# Parse a value from simple yaml (key: value)
yaml_get() {
  grep "^$1:" "$CONFIG" | sed "s/^$1: *//"
}

# Create vending-config.yaml interactively
create_config() {
  echo "No vending-config.yaml found. Let's create one."
  echo ""

  # Default capability name from capability.yaml
  DEFAULT_NAME=$(grep "^name:" "$ROOT_DIR/capability.yaml" | head -1 | sed 's/^name: *//' | tr ' ' '-')
  read -rp "Capability catalog name [$DEFAULT_NAME]: " NAME
  NAME="${NAME:-$DEFAULT_NAME}"

  # Default version from capability.yaml
  DEFAULT_VERSION=$(grep "^version:" "$ROOT_DIR/capability.yaml" | head -1 | sed 's/^version: *//')
  read -rp "Version [$DEFAULT_VERSION]: " VERSION
  VERSION="${VERSION:-$DEFAULT_VERSION}"

  # Capability path (from parent dir)
  DIRNAME=$(basename "$ROOT_DIR")
  read -rp "Capability path (from parent dir) [./$DIRNAME]: " CAP_PATH
  CAP_PATH="${CAP_PATH:-./$DIRNAME}"

  cat > "$CONFIG" <<EOF
# DIW vending configuration
# capability-path is relative to the PARENT directory of this project
name: $NAME
version: $VERSION
capability-path: $CAP_PATH
EOF

  echo ""
  echo "Created $CONFIG"
}

# Ensure config exists
if [[ ! -f "$CONFIG" ]]; then
  create_config
fi

NAME=$(yaml_get "name")
VERSION=$(yaml_get "version")
CAP_PATH=$(yaml_get "capability-path")

echo "Vending capability:"
echo "  Name:    $NAME"
echo "  Version: $VERSION"
echo "  Path:    $CAP_PATH"
echo ""

# Ensure logged in as Application Developer
echo "You must be logged in as Application Developer to vend capabilities."
echo "Logging out and re-logging in..."
diw logout 2>/dev/null || true
diw login

# Verify the logged-in user is in the APPLICATION_DEVELOPER group
echo "Verifying user role..."
REGION="${PRIMARY_REGION:-ap-southeast-1}"

python3 << 'PYEOF'
import json, os, base64, subprocess, sys

# Get user pool ID from genaiehConfigInfo secret
region = os.environ.get('PRIMARY_REGION', 'ap-southeast-1')
result = subprocess.run(
    ['aws', 'secretsmanager', 'get-secret-value',
     '--secret-id', 'genaiehConfigInfo', '--region', region,
     '--query', 'SecretString', '--output', 'text'],
    capture_output=True, text=True)
secret = json.loads(result.stdout.strip())
pool_id = secret['userPoolId']

# Get username from DIW credentials
creds = json.load(open(os.path.expanduser('~/.diw/credentials.json')))
token = creds.get('IdToken', '') or creds.get('AccessToken', '')
payload = token.split('.')[1]
payload += '=' * (4 - len(payload) % 4)
data = json.loads(base64.urlsafe_b64decode(payload))
username = data.get('cognito:username', '') or data.get('username', '')

print(f"  User Pool ID: {pool_id}")
print(f"  Username: {username}")

# Check group membership
result = subprocess.run(
    ['aws', 'cognito-idp', 'admin-list-groups-for-user',
     '--user-pool-id', pool_id,
     '--username', username,
     '--region', region],
    capture_output=True, text=True)
groups_data = json.loads(result.stdout)
group_names = [g['GroupName'] for g in groups_data.get('Groups', [])]

print(f"  Groups: {group_names}")

if 'APPLICATION_DEVELOPER' not in group_names:
    print(f"ERROR: User '{username}' is not in the APPLICATION_DEVELOPER group.")
    print("Please login with an Application Developer account.")
    sys.exit(1)

print(f"Verified: {username} is an Application Developer.")
PYEOF

# 1. Create or update draft
echo "=== Creating/updating draft capability ==="
cd "$ROOT_DIR/.."
CREATE_OUTPUT=$(diw start-create-capability --name "$NAME" --capability-path "$CAP_PATH" --version "$VERSION" 2>&1)
if echo "$CREATE_OUTPUT" | grep -q "capability name already exists"; then
  echo "Capability exists, updating instead..."
  CREATE_OUTPUT=$(diw start-update-capability --capability-name "$NAME" --capability-path "$CAP_PATH" --version "$VERSION" 2>&1)
fi
echo "$CREATE_OUTPUT"

# Try to extract capability ID from list
echo ""
echo "=== Your capabilities ==="
LIST_OUTPUT=$(diw list-custom-capabilities --my-capabilities=true 2>&1)
echo "$LIST_OUTPUT"
CAP_ID=$(echo "$LIST_OUTPUT" | python3 -c "import sys,json; name='$NAME'; version='$VERSION'; items=json.load(sys.stdin).get('items',[]); matches=[i for i in items if i.get('name')==name and i.get('version')==version]; print(matches[0]['capabilityId'] if matches else '')" 2>/dev/null || true)

# 3. Submit for approval
if [[ -z "$CAP_ID" ]]; then
  read -rp "Cannot Retrieve the capability ID. Enter capability ID from above to submit: " CAP_ID
fi

echo ""
read -rp "Submit capability $CAP_ID (v$VERSION) for approval? (y/n): " CONFIRM
if [[ "$CONFIRM" != "y" ]]; then
  echo "Draft created but not submitted."
  exit 0
fi

echo ""
echo "=== Submitting for approval ==="
diw submit-capability --capability-id "$CAP_ID" --version "$VERSION"

echo ""
echo "Capability submitted. An Admin must now approve it:"
echo "  diw approve-capability --capability-id $CAP_ID --version $VERSION"
