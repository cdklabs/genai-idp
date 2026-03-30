# Active Context

## Current Work Focus

### Publish/Headless Consolidation (March 22, 2026)

**Problem**: Deployment logic was fragmented across 3 disconnected tools:
- `publish.py` (1500-line standalone script) — build and upload artifacts
- `scripts/generate_govcloud_template.py` (700-line standalone script) — headless template generation
- `idp-cli deploy --from-code` — called publish.py via subprocess with hardcoded bucket/prefix

**Solution**: Consolidated all logic into `idp-cli` and `idp_sdk`:

#### 1. New SDK Modules
- **`idp_sdk._core.publish`** — `IDPPublisher` class (moved from root `publish.py`)
- **`idp_sdk._core.template_transform`** — `HeadlessTemplateTransformer` (extracted from generate_govcloud_template.py)
- **`idp_sdk.operations.publish`** — `PublishOperation` with `build()`, `transform_template_headless()`, `print_deployment_urls()`
- **`idp_sdk.models.publish`** — `PublishResult`, `TemplateTransformResult` Pydantic models
- **`IDPClient.publish`** — 11th operation namespace registered on the client

#### 2. New `idp-cli publish` Command
Full parity with publish.py plus headless:
```
idp-cli publish [--source-dir .] --region us-east-1 \
    [--bucket-basename my-bucket] [--prefix my-prefix] \
    [--headless] [--public] [--max-workers 4] \
    [--clean-build] [--no-validate] [--verbose] [--lint/--no-lint]
```

#### 3. Enhanced `idp-cli deploy`
New options: `--headless`, `--bucket-basename`, `--prefix`, `--public`, `--build-max-workers`, `--clean-build`, `--no-validate-template`
- `--headless` without `--from-code`: downloads pre-built template, transforms to headless, uploads, deploys
- `--headless` with `--from-code`: builds from source + generates headless template + deploys
- Removed `--generate-template-only` (use `idp-cli publish` instead)

#### 4. Backward Compatibility Wrappers
- **`publish.py`** → 50-line wrapper, re-exports `IDPPublisher` from SDK, deprecation notice
- **`scripts/generate_govcloud_template.py`** → Wrapper delegating to SDK, deprecation notice
- Both maintain identical CLI interfaces for existing CI/CD pipelines

### Key Design Decisions
- `deploy` is focused on deploying — template generation belongs in `publish`
- `--bucket` renamed to `--bucket-basename` (SDK appends region automatically)
- `--source-dir` defaults to `.` for convenience
- SDK calls `IDPPublisher.run()` directly (no subprocess) — catches `SystemExit`
- `publish.py` wrapper adds `lib/` paths to sys.path for standalone use

### Follow-up Tasks
- Make `publish.py` work without venv activation (self-contained or `uv run` shim)
- Update docs (headless-deployment.md, idp-cli.md, idp-sdk.md, deployment.md)
- Update CHANGELOG.md

---

## Architecture Summary

### Unified Architecture (Phase 3 Complete — Feb 26, 2026)
- Single template stack: `template.yaml` → `patterns/unified/template.yaml`
- 12 Lambda functions (BDA branch + Pipeline branch + shared tail)
- Routing via `use_bda` flag in configuration
- Full config per version stored in DynamoDB

### RBAC Architecture (March 9, 2026)
- 3-layer enforcement: AppSync auth directives → Lambda resolver filtering → UI adaptation
- 4 Cognito groups: Admin, Author, Reviewer, Viewer
- Server-side document filtering for Reviewer role
- Config-version scoping data model ready (Phase 2)

### SDK Architecture (March 22, 2026)
- 11 operation namespaces: stack, batch, document, config, discovery, manifest, testing, search, evaluation, assessment, **publish**
- `IDPPublisher` class lives in `idp_sdk._core.publish`
- `HeadlessTemplateTransformer` in `idp_sdk._core.template_transform`
- `publish.py` (root) is backward-compat wrapper
