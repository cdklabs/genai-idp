#!/bin/bash
# Validate repository structure against GenAI Enterprise Hub Configuration Requirements (Section 2)
# Checks for mandatory files and configurations for CDK-based capabilities

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

ERRORS=0
WARNINGS=0

error() {
  echo "❌ ERROR: $1"
  ((ERRORS++))
}

warn() {
  echo "⚠️  WARN: $1"
  ((WARNINGS++))
}

ok() {
  echo "✅ $1"
}

echo "=== Validating Repository Structure ==="
echo ""

# 1. Root-level mandatory files
echo "Checking root-level files..."
[[ -f "$ROOT_DIR/seedfarmer.yaml" ]] && ok "seedfarmer.yaml exists" || error "seedfarmer.yaml missing"
[[ -f "$ROOT_DIR/capability.yaml" ]] && ok "capability.yaml exists" || error "capability.yaml missing"
[[ -f "$ROOT_DIR/deployment.yaml" ]] && ok "deployment.yaml exists" || error "deployment.yaml missing"
[[ -f "$ROOT_DIR/README.md" ]] && ok "README.md exists" || error "README.md missing"

# Check for at least one module group manifest
if ls "$ROOT_DIR"/*-modules.yaml 1> /dev/null 2>&1; then
  ok "Module group manifest(s) found"
else
  error "No *-modules.yaml file found"
fi

echo ""

# 2. Assets directory structure
echo "Checking assets directory..."
[[ -d "$ROOT_DIR/assets" ]] && ok "assets/ directory exists" || error "assets/ directory missing"
[[ -d "$ROOT_DIR/assets/ui" ]] && ok "assets/ui/ directory exists" || warn "assets/ui/ directory missing"
[[ -f "$ROOT_DIR/assets/example-input.yaml" ]] && ok "assets/example-input.yaml exists" || error "assets/example-input.yaml missing"

if [[ -f "$ROOT_DIR/assets/ui/ui-schema.json" ]]; then
  ok "assets/ui/ui-schema.json exists"
else
  warn "assets/ui/ui-schema.json missing (optional but recommended)"
fi

echo ""

# 3. Modules directory structure
echo "Checking modules directory..."
[[ -d "$ROOT_DIR/modules" ]] && ok "modules/ directory exists" || error "modules/ directory missing"

if [[ -d "$ROOT_DIR/modules" ]]; then
  MODULE_COUNT=0
  for MODULE_DIR in "$ROOT_DIR/modules"/*; do
    if [[ -d "$MODULE_DIR" ]]; then
      MODULE_NAME=$(basename "$MODULE_DIR")
      ((MODULE_COUNT++))
      echo ""
      echo "Validating module: $MODULE_NAME"
      
      # CDK-specific files
      [[ -f "$MODULE_DIR/app.ts" ]] && ok "  app.ts exists" || error "  app.ts missing in $MODULE_NAME"
      [[ -d "$MODULE_DIR/lib" ]] && ok "  lib/ directory exists" || error "  lib/ directory missing in $MODULE_NAME"
      [[ -f "$MODULE_DIR/package.json" ]] && ok "  package.json exists" || error "  package.json missing in $MODULE_NAME"
      [[ -f "$MODULE_DIR/tsconfig.json" ]] && ok "  tsconfig.json exists" || error "  tsconfig.json missing in $MODULE_NAME"
      [[ -f "$MODULE_DIR/cdk.json" ]] && ok "  cdk.json exists" || error "  cdk.json missing in $MODULE_NAME"
      [[ -f "$MODULE_DIR/deployspec.yaml" ]] && ok "  deployspec.yaml exists" || error "  deployspec.yaml missing in $MODULE_NAME"
      [[ -f "$MODULE_DIR/README.md" ]] && ok "  README.md exists" || warn "  README.md missing in $MODULE_NAME"
      
      # Validate deployspec.yaml structure
      if [[ -f "$MODULE_DIR/deployspec.yaml" ]]; then
        if grep -q "npm install -g aws-cdk" "$MODULE_DIR/deployspec.yaml" && \
           grep -q "npm run build" "$MODULE_DIR/deployspec.yaml" && \
           grep -q "cdk deploy" "$MODULE_DIR/deployspec.yaml"; then
          ok "  deployspec.yaml has CDK deployment commands"
        else
          warn "  deployspec.yaml may be missing CDK commands (install aws-cdk, npm run build, cdk deploy)"
        fi
      fi
    fi
  done
  
  if [[ $MODULE_COUNT -eq 0 ]]; then
    error "No modules found in modules/ directory"
  else
    echo ""
    ok "Found $MODULE_COUNT module(s)"
  fi
fi

echo ""

# 4. Configuration validations
echo "Checking configuration requirements..."

# seedfarmer.yaml
if [[ -f "$ROOT_DIR/seedfarmer.yaml" ]]; then
  if grep -q "^project:" "$ROOT_DIR/seedfarmer.yaml"; then
    PROJECT=$(grep "^project:" "$ROOT_DIR/seedfarmer.yaml" | sed 's/^project: *//')
    if [[ "$PROJECT" == "genaieh" ]]; then
      ok "seedfarmer.yaml has project: genaieh"
    else
      error "seedfarmer.yaml project should be 'genaieh' (found: $PROJECT)"
    fi
  else
    error "seedfarmer.yaml missing 'project' field"
  fi
  
  if grep -q "seedfarmer_version:" "$ROOT_DIR/seedfarmer.yaml"; then
    ok "seedfarmer.yaml has seedfarmer_version"
  else
    warn "seedfarmer.yaml missing 'seedfarmer_version' field"
  fi
fi

# capability.yaml
if [[ -f "$ROOT_DIR/capability.yaml" ]]; then
  if grep -q "^path:" "$ROOT_DIR/capability.yaml"; then
    ok "capability.yaml has 'path' field"
  else
    error "capability.yaml missing 'path' field"
  fi
  
  if grep -q "^name:" "$ROOT_DIR/capability.yaml"; then
    ok "capability.yaml has 'name' field"
  else
    error "capability.yaml missing 'name' field"
  fi
  
  if grep -q "^version:" "$ROOT_DIR/capability.yaml"; then
    ok "capability.yaml has 'version' field"
  else
    error "capability.yaml missing 'version' field"
  fi
fi

# Validate capability.yaml inputs match example-input.yaml
if [[ -f "$ROOT_DIR/capability.yaml" ]] && [[ -f "$ROOT_DIR/assets/example-input.yaml" ]]; then
  echo ""
  echo "Checking capability.yaml ↔ example-input.yaml correspondence..."
  
  # Extract input names from capability.yaml
  CAP_INPUTS=$(grep -A 1000 "^input:" "$ROOT_DIR/capability.yaml" | grep "^  - name:" | sed 's/^  - name: *//' || true)
  
  # Extract keys from example-input.yaml
  EXAMPLE_INPUTS=$(grep "^[A-Z_]*:" "$ROOT_DIR/assets/example-input.yaml" | sed 's/:.*$//' || true)
  
  if [[ -z "$CAP_INPUTS" ]]; then
    warn "No inputs defined in capability.yaml"
  elif [[ -z "$EXAMPLE_INPUTS" ]]; then
    warn "No inputs defined in example-input.yaml"
  else
    # Check if all capability inputs exist in example-input (excluding PRIMARY)
    MISSING_IN_EXAMPLE=""
    while IFS= read -r INPUT; do
      # Skip PRIMARY - it's auto-provided by deployment environment
      if [[ "$INPUT" == "PRIMARY" ]]; then
        continue
      fi
      if ! echo "$EXAMPLE_INPUTS" | grep -q "^${INPUT}$"; then
        MISSING_IN_EXAMPLE="${MISSING_IN_EXAMPLE}${INPUT} "
      fi
    done <<< "$CAP_INPUTS"
    
    # Check if all example inputs exist in capability
    MISSING_IN_CAPABILITY=""
    while IFS= read -r INPUT; do
      if ! echo "$CAP_INPUTS" | grep -q "^${INPUT}$"; then
        MISSING_IN_CAPABILITY="${MISSING_IN_CAPABILITY}${INPUT} "
      fi
    done <<< "$EXAMPLE_INPUTS"
    
    if [[ -n "$MISSING_IN_EXAMPLE" ]]; then
      error "capability.yaml inputs missing in example-input.yaml: $MISSING_IN_EXAMPLE"
    fi
    
    if [[ -n "$MISSING_IN_CAPABILITY" ]]; then
      error "example-input.yaml inputs missing in capability.yaml: $MISSING_IN_CAPABILITY"
    fi
    
    if [[ -z "$MISSING_IN_EXAMPLE" ]] && [[ -z "$MISSING_IN_CAPABILITY" ]]; then
      ok "capability.yaml and example-input.yaml inputs match"
    fi
  fi
fi

# Validate all *-modules.yaml are referenced in deployment.yaml
if [[ -f "$ROOT_DIR/deployment.yaml" ]]; then
  echo ""
  echo "Checking *-modules.yaml references in deployment.yaml..."
  
  MISSING_REFS=""
  for MODULE_YAML in "$ROOT_DIR"/*-modules.yaml; do
    if [[ -f "$MODULE_YAML" ]]; then
      MODULE_FILE=$(basename "$MODULE_YAML")
      if grep -q "$MODULE_FILE" "$ROOT_DIR/deployment.yaml"; then
        ok "$MODULE_FILE referenced in deployment.yaml"
      else
        error "$MODULE_FILE NOT referenced in deployment.yaml"
        MISSING_REFS="${MISSING_REFS}${MODULE_FILE} "
      fi
    fi
  done
fi

echo ""
echo "=== Validation Summary ==="
echo "Errors: $ERRORS"
echo "Warnings: $WARNINGS"

if [[ $ERRORS -gt 0 ]]; then
  echo ""
  echo "❌ Repository structure validation FAILED"
  exit 1
else
  echo ""
  echo "✅ Repository structure validation PASSED"
  if [[ $WARNINGS -gt 0 ]]; then
    echo "⚠️  There are $WARNINGS warning(s) to review"
  fi
  exit 0
fi
