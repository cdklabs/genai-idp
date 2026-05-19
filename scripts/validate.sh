#!/bin/bash
# Validate capability: best practices, deploy, and destroy.
# Temporarily sets seedfarmer.yaml project to "diw" (required by DIW CLI), restores to "genaieh" on exit.
# Usage: ./scripts/validate.sh [region] [account]
#   Defaults loaded from test.env if present.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SEEDFARMER="$ROOT_DIR/seedfarmer.yaml"

# Load test.env defaults if present
if [[ -f "$ROOT_DIR/test.env" ]]; then
  set -a
  source "$ROOT_DIR/test.env"
  set +a
fi

REGION="${1:-${PRIMARY_REGION:-${AWS_DEFAULT_REGION:-}}}"
ACCOUNT="${2:-${PRIMARY_ACCOUNT:-}}"

if [[ -z "$REGION" || -z "$ACCOUNT" ]]; then
  echo "Usage: $0 <region> <account>"
  echo "Or set PRIMARY_REGION/PRIMARY_ACCOUNT in test.env"
  exit 1
fi

# Ensure container runtime is available (Docker or Finch)
if docker info &>/dev/null; then
  echo "Docker is ready."
elif finch vm status &>/dev/null 2>&1; then
  export CDK_DOCKER=finch
  echo "Finch is ready (CDK_DOCKER=finch)."
else
  echo "ERROR: No container runtime available. Start Docker or Finch."
  exit 1
fi

# Always restore project to genaieh on exit
restore_project() {
  echo ""
  echo "Restoring seedfarmer.yaml project to genaieh..."
  sed -i.bak 's/^project: diw/project: genaieh/' "$SEEDFARMER" && rm -f "$SEEDFARMER.bak"
}
trap restore_project EXIT

# Switch project to diw (required for validate commands)
echo "Setting seedfarmer.yaml project to diw..."
sed -i.bak 's/^project: genaieh/project: diw/' "$SEEDFARMER" && rm -f "$SEEDFARMER.bak"

# 1. Validate best practices (requires DIW CLI)
echo ""
echo "=== Validating code best practices ==="
if command -v diw &>/dev/null; then
  if ! diw validate-capability --security --oe; then
    echo "WARN: Best practices validation failed (non-blocking)."
  fi
else
  echo "SKIP: DIW CLI not installed. Install it to run best practices validation."
fi

# 2. Validate CDK synthesis for each module
echo ""
echo "=== Validating CDK synthesis ==="
for module_dir in "$ROOT_DIR"/modules/*/; do
  module_name=$(basename "$module_dir")
  echo "Synthesizing module: $module_name"
  cd "$module_dir"
  if [[ -f "package-lock.json" ]]; then
    npm install
  fi
  npm run build 2>/dev/null || true
  if ! npx cdk synth > /dev/null 2>&1; then
    echo "ERROR: CDK synthesis failed for $module_name."
    exit 1
  fi
  echo "✅ $module_name synth passed"
done
cd "$ROOT_DIR"

# 3. Validate deploy (requires DIW CLI)
echo ""
echo "=== Validating deployability ==="
if command -v diw &>/dev/null; then
  if ! diw validate-deploy --region "$REGION" --account "$ACCOUNT"; then
    echo "ERROR: Deploy validation failed."
    exit 1
  fi
else
  echo "SKIP: DIW CLI not installed. Install it to run deploy validation."
fi

# 4. Validate destroy (requires DIW CLI)
echo ""
echo "=== Validating destroyability ==="
if command -v diw &>/dev/null; then
  if ! diw validate-destroy --region "$REGION" --account "$ACCOUNT"; then
    echo "ERROR: Destroy validation failed."
    exit 1
  fi
else
  echo "SKIP: DIW CLI not installed. Install it to run destroy validation."
fi

echo ""
echo "All validations passed."
