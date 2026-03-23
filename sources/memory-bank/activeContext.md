# Active Context

## Current Work Focus

### Role-Based Access Control (RBAC) Implementation (March 9, 2026)

**Problem**: The existing system had only 2 roles (Admin, Reviewer) with security enforcement done entirely client-side — all documents were pulled to the browser and filtered in JavaScript, and the Reviewer could call any GraphQL mutation directly.

**Solution implemented (Phase 1 — Security Hardening + New Roles)**:

#### 1. GraphQL Schema Auth Directives (Server-Side)
Added `@aws_auth(cognito_groups: [...])` to ALL mutations and sensitive queries in `schema.graphql`:
- Backend-only (IAM): createDocument, updateDocument, updateDocumentStatus, updateDocumentSection
- Admin-only: deleteConfigVersion, createUser, deleteUser, listUsers
- Admin+Author: deleteDocument, updateConfiguration, uploadDocument, reprocessDocument, test studio, discovery, pricing edits
- Admin+Reviewer: claimReview, releaseReview, completeSectionReview, skipAllSectionsReview, processChanges
- Admin+Author+Viewer: agent chat, code explorer, view configuration/pricing
- All authenticated: listDocuments, getDocument, getFileContents (with resolver-level filtering)

#### 2. Server-Side Document Filtering for Reviewer
Modified `list_documents_gsi_resolver/index.py` to read caller's Cognito groups from `event.identity.claims` and apply DynamoDB `FilterExpression`:
- Reviewer-only users: `HITLTriggered = true AND ((not completed AND (no owner OR owner = me)) OR owner = me)`
- Admin/Author/Viewer: no filter (see all documents)

#### 3. New Cognito Groups
Added `AuthorGroup` (precedence 1) and `ViewerGroup` (precedence 3) to `template.yaml`.

#### 4. User Management Lambda
Updated to support 4 personas (Admin, Author, Reviewer, Viewer). Added `allowedConfigVersions` field to user records for future Phase 2 config-version scoping.

#### 5. UI Updates
- `useUserRole` hook: Added `isAuthor`, `isViewer`, `isReviewerOnly`, `isViewerOnly`, `canWrite`, `canReview`, `canManageUsers`, `canDeleteConfig`
- Navigation: 4 distinct nav configurations (Admin=full, Author=no user mgmt, Viewer=read-only, Reviewer=doc list only)
- DocumentList, DocumentDetails, SectionsPanel, PagesPanel: Use semantic role flags (`canWrite`, `canReview`)
- TopNavigation: Shows role badge (blue=Admin, green=Author, grey=Reviewer/Viewer)

### Key Files Modified (March 9)
- `template.yaml` — New Cognito groups (Author, Viewer) + Lambda env vars
- `nested/appsync/src/api/schema.graphql` — Auth directives on all operations
- `nested/appsync/src/lambda/list_documents_gsi_resolver/index.py` — Server-side reviewer filtering
- `src/lambda/user_management/index.py` — 4-role support + allowedConfigVersions
- `src/ui/src/hooks/use-user-role.ts` — Extended role hook with convenience flags
- `src/ui/src/components/genaiidp-layout/navigation.tsx` — 4 nav configurations
- `src/ui/src/components/document-list/DocumentList.tsx` — canWrite/canReview
- `src/ui/src/components/document-details/DocumentDetails.tsx` — canWrite
- `src/ui/src/components/sections-panel/SectionsPanel.tsx` — canReview
- `src/ui/src/components/pages-panel/PagesPanel.tsx` — isReviewerOnly
- `src/ui/src/components/genai-idp-top-navigation/GenAIIDPTopNavigation.tsx` — 4-role badge
- `docs/rbac.md` — RBAC documentation

### Phase 2 (Future — Config-Version Scoping)
- `allowedConfigVersions` attribute already added to User DDB records and GraphQL schema
- Resolver-level filtering by config-version not yet implemented
- Pipeline auth resolver pattern needed for scope enforcement
- Agent Analytics with config-version scoping deferred to later phase

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
- Server-side document filtering for Reviewer role in listDocuments resolver
- Config-version scoping data model ready (Phase 2)
