#!/bin/bash
# Configure DIW CLI by extracting Nexus config from the deployed GenAI Enterprise Hub account.
# Prerequisites: AWS credentials exported (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN)

set -euo pipefail

REGION="${1:-ap-southeast-1}"
SECRET_ID="genaiehConfigInfo"

# 1. Check AWS access
echo "Checking AWS credentials..."
if ! aws sts get-caller-identity &>/dev/null; then
  echo "ERROR: No valid AWS credentials found."
  echo "Export AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_SESSION_TOKEN before running this script."
  exit 1
fi

IDENTITY=$(aws sts get-caller-identity --output text --query 'Account')
echo "Authenticated to account: $IDENTITY"

# 2. Confirm the user is pointing at the right account
echo ""
echo "This script will read secret '$SECRET_ID' from region '$REGION'."
echo "Make sure your credentials are for the account/region where GenAI Enterprise Hub is deployed."
read -rp "Proceed? [y/N]: " CONFIRM
if [[ "$CONFIRM" != "y" ]]; then
  echo "Aborted."
  exit 0
fi

# 3. Extract config from Secrets Manager
echo "Fetching $SECRET_ID from $REGION..."
SECRET_JSON=$(aws secretsmanager get-secret-value \
  --secret-id "$SECRET_ID" \
  --region "$REGION" \
  --query 'SecretString' \
  --output text)

API_ENDPOINT=$(echo "$SECRET_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['apiEndpoint'])")
CLIENT_ID=$(echo "$SECRET_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['clientId'])")
ISSUER_URL=$(echo "$SECRET_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['issuerUrl'])")

echo ""
echo "Extracted:"
echo "  API Endpoint: $API_ENDPOINT"
echo "  Client ID:    $CLIENT_ID"
echo "  Issuer URL:   $ISSUER_URL"

# 4. Configure DIW CLI
echo ""
echo "Configuring DIW CLI..."
diw configure \
  --api-endpoint-url="$API_ENDPOINT" \
  --client-id="$CLIENT_ID" \
  --issuer-url="$ISSUER_URL"

echo "DIW CLI configured successfully."
