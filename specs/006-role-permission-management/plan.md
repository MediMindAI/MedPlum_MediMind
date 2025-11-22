# Implementation Plan: Role Creation and Permission Management System

**Branch**: `006-role-permission-management` | **Date**: 2025-11-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-role-permission-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a production-ready role and permission management system enabling EMR administrators to create roles, configure granular permissions organized by functional categories (Patient Management, Clinical Documentation, Laboratory, Billing, Administration, Reports), and assign roles to practitioner accounts. The system enforces RBAC (Role-Based Access Control) with FHIR-compliant AccessPolicy resources, provides multi-role support with additive permissions, prevents privilege escalation, maintains HIPAA-compliant audit trails, and delivers a mobile-responsive multilingual interface.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enabled per constitution)
**Primary Dependencies**:
- `@medplum/core` (FHIR client, resource operations)
- `@medplum/fhirtypes` (FHIR R4 type definitions)
- `@medplum/react-hooks` (useMedplum, useResource hooks)
- `@mantine/core` (UI components)
- `@mantine/hooks` (useMediaQuery, useDebouncedValue)
- `@mantine/notifications` (success/error notifications)
- `@tabler/icons-react` (icons)

**Storage**: PostgreSQL (Medplum server) storing FHIR AccessPolicy resources
**Testing**: Jest with React Testing Library, MockClient from `@medplum/mock`
**Target Platform**: Web browser (desktop + tablet responsive)
**Project Type**: Medplum monorepo - web application (packages/app)
**Performance Goals**:
- Create role with permissions in under 2 minutes (user time)
- Assign role in under 30 seconds
- Permission changes applied within 5 seconds to all users
- Search/filter results in under 1 second for 500 roles

**Constraints**:
- Must use FHIR AccessPolicy resources (no custom permission tables)
- Must support 100+ concurrent roles without degradation
- Must prevent privilege escalation (admins can't grant permissions they don't have)
- Must maintain 100% audit trail accuracy (HIPAA compliance)
- Must work on mobile tablets (responsive design)

**Scale/Scope**:
- Up to 500 roles in system
- Up to 200 distinct permissions organized in 6 functional categories
- Up to 1000 practitioner accounts
- 3 languages (Georgian, English, Russian)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ FHIR-First Architecture (Principle I)
- **Compliance**: All permission management uses FHIR AccessPolicy resources
- **Validation**: AccessPolicy follows FHIR R4 specification with `resource` and `compartment` rules
- **Type Safety**: All resources use `@medplum/fhirtypes` AccessPolicy interface

### ✅ Package-Based Modularity (Principle II)
- **Compliance**: Feature implemented in `packages/app` (existing package)
- **Dependencies**: Uses `@medplum/core`, `@medplum/fhirtypes`, `@medplum/react-hooks`
- **Boundaries**: Role management is isolated in `packages/app/src/emr/components/role-management/`

### ✅ Test-First Development (Principle III - NON-NEGOTIABLE)
- **Compliance**: All components will have colocated tests (`RoleTable.test.tsx` next to `RoleTable.tsx`)
- **Coverage**: Target >80% code coverage for new role management code
- **Mocking**: Use MockClient from `@medplum/mock` for all component tests
- **Integration**: Test role CRUD operations against mock FHIR server

### ✅ Type Safety & Strict Mode (Principle IV)
- **Compliance**: TypeScript strict mode enabled (project-wide)
- **Types**: AccessPolicy, Practitioner, PractitionerRole all from `@medplum/fhirtypes`
- **No `any`**: All interfaces typed (RoleFormValues, PermissionTreeNode, etc.)

### ✅ Security & Compliance by Default (Principle V)
- **Authentication**: Uses existing Medplum OAuth 2.0/OpenID Connect
- **Access Control**: AccessPolicy resources enforce permission checks
- **Audit Trail**: AuditEvent resources log all role/permission changes
- **No Secrets**: All configuration via environment variables

### ✅ Build Order & Dependency Management (Principle VI)
- **Compliance**: No new packages created, uses existing `packages/app`
- **Dependencies**: Follows existing workspace references
- **Build**: No changes to build order required

### ✅ Observability & Debugging (Principle VII)
- **Logging**: All role CRUD operations logged via createAuditEvent service
- **Error Context**: All error messages include actionable context (e.g., "Cannot delete role with 3 assigned users")
- **Debugging**: React DevTools compatible, clear component hierarchy

### ✅ HIPAA Compliance Requirements
- **Audit Logs**: All role/permission changes logged to AuditEvent resources
- **PHI Protection**: No PHI exposed in role management UI
- **Encryption**: Handled by Medplum server (PostgreSQL encryption at rest)
- **Data Retention**: Soft delete (deactivation) preserves audit trails

### ✅ FHIR Conformance
- **AccessPolicy Validation**: All AccessPolicy resources validated against FHIR R4 schema
- **Search Parameters**: Use standard FHIR search (_count, _sort, etc.)
- **Extensions**: Use standard FHIR extension pattern if custom fields needed

### ✅ Testing Gates
- **Unit Tests**: >80% coverage for new code
- **Integration Tests**: Role CRUD operations with MockClient
- **E2E Tests**: Complete role creation → assignment → permission enforcement workflow
- **Performance**: Test search/filter with 500 mock roles

**Gate Status**: ✅ **PASSED** - All constitution principles satisfied, no violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/006-role-permission-management/
├── spec.md               # Feature specification (completed)
├── plan.md               # This file (/speckit.plan output)
├── research.md           # Phase 0 output (research findings)
├── data-model.md         # Phase 1 output (FHIR resource models)
├── quickstart.md         # Phase 1 output (dev getting started guide)
├── contracts/            # Phase 1 output (FHIR AccessPolicy schemas)
│   └── access-policy-schema.json
├── checklists/
│   └── requirements.md   # Spec validation checklist (completed)
└── tasks.md              # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
packages/app/src/emr/
├── views/role-management/
│   └── RoleManagementView.tsx          # Main role management page (tab in AccountManagementView)
├── components/role-management/
│   ├── RoleTable.tsx                   # Role list table with search/sort/filter
│   ├── RoleTable.test.tsx              # Unit tests for RoleTable
│   ├── RoleForm.tsx                    # Create/edit role form
│   ├── RoleForm.test.tsx               # Unit tests for RoleForm
│   ├── PermissionTree.tsx              # Hierarchical permission selector
│   ├── PermissionTree.test.tsx         # Unit tests for PermissionTree
│   ├── RoleCreateModal.tsx             # Modal for creating new roles
│   ├── RoleEditModal.tsx               # Modal for editing existing roles
│   ├── RoleDeleteModal.tsx             # Confirmation modal for deletion
│   ├── RoleCloneModal.tsx              # Modal for cloning roles
│   ├── RoleAssignmentPanel.tsx         # Panel in AccountForm for role assignment
│   ├── RoleAssignmentPanel.test.tsx    # Unit tests for RoleAssignmentPanel
│   ├── RoleStatusBadge.tsx             # Active/Inactive status badge
│   └── PermissionCategoryCard.tsx      # Card for permission category with checkboxes
├── services/
│   ├── roleService.ts                  # CRUD operations for AccessPolicy resources
│   ├── roleService.test.ts             # Unit tests for roleService
│   ├── permissionService.ts            # Permission tree utilities, dependency resolution
│   ├── permissionService.test.ts       # Unit tests for permissionService
│   └── roleValidators.ts               # Validation rules (unique names, etc.)
├── hooks/
│   ├── useRoles.ts                     # Fetch all roles with search/filter
│   ├── useRoles.test.tsx               # Unit tests for useRoles
│   ├── useRoleForm.ts                  # Form state management
│   ├── useRoleForm.test.tsx            # Unit tests for useRoleForm
│   ├── usePermissions.ts               # Fetch permission tree
│   └── usePermissionCheck.ts           # Check if current user has permission
├── types/
│   └── role-management.ts              # TypeScript interfaces (RoleFormValues, PermissionNode, etc.)
└── translations/
    ├── permissions.json                # Permission names/descriptions (ka/en/ru)
    ├── permission-categories.json      # Category names (Patient Management, Clinical Documentation, etc.)
    └── ka.json, en.json, ru.json       # Updated with role management translations

packages/app/src/emr/views/account-management/
└── AccountManagementView.tsx           # Updated to add "Roles" tab

tests/ (integration)
└── role-management.test.tsx            # E2E workflow tests
```

**Structure Decision**: Monorepo web application structure using existing `packages/app`. Role management is organized as:
- **Views**: RoleManagementView as new tab in AccountManagementView
- **Components**: Isolated in `components/role-management/` for modularity
- **Services**: FHIR AccessPolicy CRUD operations in `services/roleService.ts`
- **Hooks**: React hooks for data fetching and form state management
- **Types**: Shared TypeScript interfaces
- **Translations**: Multilingual support (Georgian, English, Russian)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations** - All constitution principles satisfied. No complexity tracking required.
