# Implementation Plan: Production-Ready Permission System Redesign

**Branch**: `008-permission-system-redesign` | **Date**: 2025-11-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-permission-system-redesign/spec.md`

## Summary

Redesign MediMind's permission system to achieve production-ready, HIPAA-compliant RBAC with ~80-120 permissions organized in hierarchical categories. The system extends the current FHIR AccessPolicy foundation with department scoping, time-based controls, sensitive data classification, emergency access workflows, and comprehensive audit logging. This bridges the gap between the legacy 534-permission SoftMedic EMR and modern healthcare security standards.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enabled)
**Primary Dependencies**: @medplum/core, @medplum/fhirtypes, @medplum/react-hooks, React 19, Mantine UI
**Storage**: PostgreSQL via Medplum FHIR Server (AccessPolicy, PractitionerRole, AuditEvent resources)
**Testing**: Jest with @medplum/mock for FHIR client mocking, React Testing Library
**Target Platform**: Web (Vite + React), Medplum Server API
**Project Type**: Web application (monorepo: packages/app for frontend, Medplum server for API)
**Performance Goals**: <50ms permission check latency, 1000+ concurrent users, 5-10 second cache TTL
**Constraints**: HIPAA compliance, fail-closed on errors, 6+ year audit log retention
**Scale/Scope**: 80-120 permissions, 16 role templates, ~50 UI components affected

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. FHIR-First Architecture | ✅ PASS | Uses FHIR AccessPolicy, PractitionerRole, AuditEvent resources; strong typing via @medplum/fhirtypes |
| II. Package-Based Modularity | ✅ PASS | All code in packages/app/src/emr; existing services (permissionService.ts, roleService.ts) follow package structure |
| III. Test-First Development | ✅ PASS | Jest tests required; @medplum/mock for client mocking; colocated test files |
| IV. Type Safety & Strict Mode | ✅ PASS | TypeScript strict mode; Permission, Role, AccessPolicy types explicitly defined |
| V. Security & Compliance | ✅ PASS | OAuth 2.0/SMART-on-FHIR auth; AccessPolicy-based enforcement; AuditEvent logging; fail-closed on errors |
| VI. Build Order & Dependencies | ✅ PASS | Uses existing @medplum/core, @medplum/fhirtypes dependencies; Turborepo orchestration |
| VII. Observability & Debugging | ✅ PASS | FR-035-038 require metrics tracking; all access logged to AuditEvent |

### Healthcare & Compliance Gates

| Requirement | Status | Evidence |
|-------------|--------|----------|
| HIPAA PHI Encryption | ✅ PASS | Medplum server handles encryption at rest/transit |
| Audit Logs | ✅ PASS | FR-027-029: All access attempts logged, 6+ year retention |
| MFA Support | N/A | Out of scope - handled by Medplum authentication |
| Data Retention | ✅ PASS | Configurable audit log retention (FR-029) |

### Testing Gates

| Requirement | Status | Plan |
|-------------|--------|------|
| >80% coverage for new code | 🔶 REQUIRED | All new services/hooks/components must have tests |
| Integration tests for FHIR endpoints | 🔶 REQUIRED | Permission enforcement API tests |
| E2E tests for user-facing workflows | 🔶 REQUIRED | Role assignment, permission matrix UI tests |

**GATE RESULT**: ✅ PASS - No violations. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/008-permission-system-redesign/
├── plan.md              # This file (implementation plan)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (research findings)
├── data-model.md        # Phase 1 output (entity definitions)
├── quickstart.md        # Phase 1 output (implementation guide)
├── contracts/           # Phase 1 output (API specs)
│   ├── permission-api.yaml    # OpenAPI 3.0 specification
│   └── permission-types.ts    # TypeScript type contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks - NOT created yet)
```

### Source Code (Medplum Monorepo)

```text
packages/app/src/emr/
├── services/
│   ├── permissionService.ts         # EXTEND: Add 80-120 permissions, interaction[] support
│   ├── permissionCacheService.ts    # NEW: TTL cache with fail-closed behavior
│   ├── roleService.ts               # EXTEND: Add department scoping
│   ├── auditService.ts              # EXTEND: Add DICOM permission audit codes
│   └── accountService.ts            # EXTEND: Department role assignment
├── hooks/
│   ├── usePermissionCheck.ts        # EXTEND: Use cache, fail-closed
│   ├── usePermissions.ts            # EXTEND: 8 categories, matrix view
│   ├── usePermissionCache.ts        # NEW: Cache management hook
│   └── useEmergencyAccess.ts        # NEW: Break-glass workflow
├── contexts/
│   └── PermissionContext.tsx        # NEW: Permission provider with cache
├── types/
│   ├── role-management.ts           # EXTEND: Permission types
│   ├── account-management.ts        # EXTEND: Assignment types
│   └── permission-cache.ts          # NEW: Cache types
├── components/
│   ├── role-management/             # EXTEND: Enhanced permission matrix
│   └── access-control/              # NEW: Permission gate components
│       ├── PermissionGate.tsx       # Conditional rendering
│       └── RequirePermission.tsx    # Route protection
├── views/
│   ├── role-management/             # EXTEND: 8-category matrix view
│   └── account-management/          # EXTEND: Department assignment UI
└── translations/
    ├── permissions.json             # EXTEND: 80-120 permission translations
    └── permission-categories.json   # EXTEND: 8 category translations
```

**Structure Decision**: Using existing Medplum monorepo structure under `packages/app/src/emr/`. All permission system code lives in the EMR module, extending existing services and adding new components for caching and access control.

## Complexity Tracking

> No constitution violations detected. All gates passed.

---

## Phase 0 Outputs

- **research.md**: Completed - AccessPolicy patterns, caching strategies, RBAC best practices
- All NEEDS CLARIFICATION items resolved via `/speckit.clarify`

## Phase 1 Outputs

- **data-model.md**: Completed - 6 entities (AccessPolicy, PractitionerRole, Permission, PermissionCategory, RoleTemplate, AuditEvent), 104 permissions across 8 categories
- **contracts/permission-api.yaml**: Completed - OpenAPI 3.0 spec with 15 endpoints
- **contracts/permission-types.ts**: Completed - TypeScript interfaces for all permission types
- **quickstart.md**: Completed - Implementation guide with code examples

## Next Steps

Run `/speckit.tasks` to generate implementation tasks based on this plan.
