#!/usr/bin/env bash
set -euo pipefail

# Packages the sample-bedrock CDK app as a capability .tgz
#
# Usage: ./package-capability.sh [output-path]
#   output-path: Optional. Defaults to ./genai-idp-bedrock-llm-1.0.0.tgz

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
OUTPUT_PATH="${1:-${SCRIPT_DIR}/genai-idp-bedrock-llm-1.0.0.tgz}"
TEMP_DIR=$(mktemp -d)
CAPABILITY_DIR_NAME="genai-idp-bedrock-llm"

cleanup() {
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

PACKAGE_DIR="${TEMP_DIR}/package/${CAPABILITY_DIR_NAME}"
mkdir -p "$PACKAGE_DIR"

echo "Copying capability metadata files..."
cp -R "$PROJECT_DIR/capability/." "$PACKAGE_DIR/"

echo "Copying CDK app into app/ subdirectory..."
APP_DIR="$PACKAGE_DIR/app"
rsync -a --exclude node_modules --exclude cdk.out --exclude capability --exclude scripts \
      --exclude .projen --exclude .git --exclude coverage --exclude test-reports \
      --exclude dist --exclude '*.tgz' --exclude .DS_Store --exclude README.md \
      "$PROJECT_DIR/" "$APP_DIR/"

echo "Copying deployspec into app/..."
mv "$PACKAGE_DIR/deployspec.yaml" "$APP_DIR/"

echo "Patching dependency versions for public npm..."
sed -i.bak 's/"@cdklabs\/genai-idp": "\^0\.0\.0"/"@cdklabs\/genai-idp": "^0.3.0"/' "$APP_DIR/package.json"
sed -i.bak 's/"@cdklabs\/genai-idp-bedrock-llm-processor": "\^0\.0\.0"/"@cdklabs\/genai-idp-bedrock-llm-processor": "^0.3.0"/' "$APP_DIR/package.json"
rm -f "$APP_DIR/package.json.bak"

echo "Removing projen build hook from cdk.json..."
sed -i.bak '/"build": "npx projen bundle"/d' "$APP_DIR/cdk.json"
rm -f "$APP_DIR/cdk.json.bak"

echo "Creating archive..."
tar -czf "$OUTPUT_PATH" -C "$TEMP_DIR" package

echo "Done. Capability package: $OUTPUT_PATH"
