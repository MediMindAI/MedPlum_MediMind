# Implementation Plan: EMR User Management Improvements

**Branch**: `001-emr-user-management-improvements` | **Date**: 2025-11-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-emr-user-management-improvements/spec.md`

## Summary

Enhance the existing MediMind EMR Account Management system to production-ready status by implementing:
1. **Invitation status tracking** with resend capability and manual link generation
2. **Audit log UI** with filtering, search, and export for HIPAA compliance
3. **Permission matrix** for visual role-based access control management
4. **Server-side pagination/search** for scalability with 1000+ accounts
5. **Bulk operations** (deactivate, assign role) for administrative efficiency
6. **UX enhancements** (skeletons, empty states, keyboard shortcuts)
7. **Export functionality** (Excel/CSV) for reporting

Technical approach: Extend existing React/Mantine components in `packages/app/src/emr/` using FHIR resources (Practitioner, PractitionerRole, AccessPolicy, AuditEvent, Invite) with server-side FHIR search for pagination.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: React 19, Mantine UI, @medplum/core, @medplum/react-hooks, @medplum/fhirtypes
**Storage**: PostgreSQL via Medplum FHIR server (all data as FHIR resources)
**Testing**: Jest with @medplum/mock for FHIR client mocking
**Target Platform**: Web application (React SPA), mobile-responsive
**Project Type**: Monorepo web application (packages/app)
**Performance Goals**: 500ms table load for 1000 accounts, 200ms search response, 5s bulk operation for 50 accounts
**Constraints**: HIPAA audit logging required, <5000 total accounts expected
**Scale/Scope**: ~5000 user accounts max, 8 user stories, 34 functional requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| **I. FHIR-First** | PASS | All entities (Practitioner, PractitionerRole, AccessPolicy, AuditEvent, Invite) are standard FHIR R4 resources |
| **II. Package Modularity** | PASS | All code in `packages/app/src/emr/` within existing package structure |
| **III. Test-First** | PASS | Tests colocated with components (*.test.tsx), MockClient for FHIR mocking |
| **IV. Type Safety** | PASS | All FHIR types from @medplum/fhirtypes, strict mode enabled |
| **V. Security & Compliance** | PASS | AccessPolicy for RBAC, AuditEvent logging for HIPAA, OAuth2 auth |
| **VI. Build Order** | PASS | No new packages, extends existing app package |
| **VII. Observability** | PASS | AuditEvent logging for all account management operations |

**Healthcare & Compliance**:
- HIPAA: AuditEvent resources capture all required fields (timestamp, actor, action, entity, outcome, IP)
- FHIR Conformance: Using standard resource types, no custom extensions required
- Testing Gates: >80% coverage target, integration tests for FHIR endpoints

**Gate Result**: PASS - No violations detected

## Project Structure

### Documentation (this feature)

```text
specs/001-emr-user-management-improvements/
├── plan.md              # This file
├── research.md          # Phase 0 output - technology decisions
├── data-model.md        # Phase 1 output - FHIR resource mappings
├── quickstart.md        # Phase 1 output - development setup
├── contracts/           # Phase 1 output - API contracts
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
packages/app/src/emr/
├── views/
│   └── account-management/
│       ├── AccountManagementView.tsx       # Main view (existing, enhance)
│       └── AuditLogView.tsx                # NEW: Audit log viewer
├── components/
│   └── account-management/
│       ├── AccountTable.tsx                # Existing (add pagination, bulk select)
│       ├── AccountForm.tsx                 # Existing (add welcome message)
│       ├── InvitationStatusBadge.tsx       # NEW: Status badge component
│       ├── ActivationLinkModal.tsx         # NEW: Manual link generation
│       ├── PermissionMatrix.tsx            # NEW: Visual permission editor
│       ├── PermissionPreview.tsx           # NEW: Multi-role preview
│       ├── RoleConflictAlert.tsx           # NEW: Conflict detection
│       ├── AuditLogTable.tsx               # NEW: Audit log table
│       ├── AuditLogFilters.tsx             # NEW: Date/user/action filters
│       ├── AccountAuditTimeline.tsx        # NEW: Per-account history
│       ├── BulkActionBar.tsx               # NEW: Bulk operation toolbar
│       ├── AdvancedFiltersPanel.tsx        # NEW: Filter panel
│       ├── FilterPresetSelect.tsx          # NEW: Saved filters
│       ├── EmptyState.tsx                  # NEW: Illustrated empty states
│       ├── TableSkeleton.tsx               # NEW: Loading skeletons
│       └── KeyboardShortcutsHelp.tsx       # NEW: Shortcut help modal
├── services/
│   └── accountService.ts                   # Existing (add pagination, bulk ops)
│   └── auditService.ts                     # NEW: AuditEvent CRUD
│   └── invitationService.ts                # NEW: Invite status tracking
│   └── permissionService.ts                # NEW: AccessPolicy operations
│   └── exportService.ts                    # NEW: Excel/CSV export
├── hooks/
│   └── useAccountManagement.ts             # Existing (enhance with pagination)
│   └── useAuditLogs.ts                     # NEW: Audit log fetching
│   └── usePermissions.ts                   # NEW: Permission management
│   └── useBulkOperations.ts                # NEW: Bulk action state
│   └── useKeyboardShortcuts.ts             # NEW: Shortcut handlers
└── types/
    └── account-management.ts               # Existing (extend types)
```

**Structure Decision**: Extending existing EMR package structure in `packages/app/src/emr/`. All new components follow established patterns (component + test + service + hook). No new packages required.

## Constitution Re-Check (Post Phase 1 Design)

| Principle | Status | Design Verification |
|-----------|--------|---------------------|
| **I. FHIR-First** | PASS | data-model.md uses only standard FHIR R4 resources (Practitioner, PractitionerRole, AccessPolicy, AuditEvent, Invite). No custom extensions. |
| **II. Package Modularity** | PASS | All new code in `packages/app/src/emr/`. No new packages created. |
| **III. Test-First** | PASS | quickstart.md specifies test patterns with MockClient. All components have corresponding *.test.tsx files. |
| **IV. Type Safety** | PASS | data-model.md defines TypeScript interfaces. All FHIR types from @medplum/fhirtypes. |
| **V. Security & Compliance** | PASS | AuditEvent captures HIPAA-required fields. AccessPolicy for RBAC. |
| **VI. Build Order** | PASS | One new dependency (xlsx) added to packages/app only. No circular dependencies. |
| **VII. Observability** | PASS | AuditEvent logging for all operations. Structured error handling in api-contracts.md. |

**New Dependency Justification**:
- `xlsx` (SheetJS): Required for Excel export functionality (FR-030). MIT licensed, industry standard, ~300KB bundle impact. No alternative meets requirements.

**Post-Design Gate Result**: PASS - Design complies with all constitution principles.

## Complexity Tracking

No constitution violations detected. Complexity is managed through:
- Component composition (small, focused components)
- Service layer abstraction (FHIR operations in services)
- Hook-based state management (reusable logic)
- Existing patterns from patient registration and patient history features
