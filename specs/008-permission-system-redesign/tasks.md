# Tasks: Production-Ready Permission System Redesign

**Input**: Design documents from `/specs/008-permission-system-redesign/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED per constitution (III. Test-First Development) - >80% coverage for new code.

**Organization**: Tasks are grouped by user story (7 stories: US1-US7) to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

All paths relative to `packages/app/src/emr/`:
- **Services**: `services/`
- **Hooks**: `hooks/`
- **Types**: `types/`
- **Components**: `components/`
- **Views**: `views/`
- **Translations**: `translations/`
- **Tests**: Colocated as `*.test.ts` or `*.test.tsx`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend existing structure with new files for permission system

- [X] T001 Create permission cache types in `types/permission-cache.ts`
- [X] T002 [P] Add new permission codes to `translations/permissions.json` (80-120 permissions across 8 categories)
- [X] T003 [P] Add permission category translations to `translations/permission-categories.json` (8 categories)
- [X] T004 [P] Create role template translations in `translations/role-templates.json` (16 templates)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Extend Permission interface in `types/role-management.ts` with accessLevel, resourceType, dependencies fields
- [X] T006 [P] Extend PermissionCategory interface in `types/role-management.ts` with 8 categories
- [X] T007 [P] Create PermissionCacheEntry and PermissionCache interfaces in `types/permission-cache.ts`
- [X] T008 Add 80-120 permission definitions to `services/permissionService.ts` organized by 8 categories
- [X] T009 Add permission dependency tree to `services/permissionService.ts` (resolvePermissionDependencies function)
- [X] T010 [P] Create permissionCacheService.ts with TTL cache (10s), fail-closed behavior in `services/permissionCacheService.ts`
- [X] T011 Write tests for permissionCacheService in `services/permissionCacheService.test.ts`
- [X] T012 [P] Extend permissionsToAccessPolicy function in `services/permissionService.ts` to use interaction[] instead of readonly
- [X] T013 Write tests for extended permission mapping in `services/permissionService.test.ts`

**Checkpoint**: Foundation ready - 80-120 permissions defined, cache service operational, user story implementation can begin

---

## Phase 3: User Story 1 - Role-Based Page Access (Priority: P1) MVP

**Goal**: Users with assigned roles can only access pages appropriate to their job function

**Independent Test**: Create user with "Nurse" role, verify they cannot access "Financial Reports" page

### Tests for User Story 1

- [X] T014 [P] [US1] Write test for PermissionGate component in `components/access-control/PermissionGate.test.tsx`
- [X] T015 [P] [US1] Write test for RequirePermission component in `components/access-control/RequirePermission.test.tsx`
- [X] T016 [P] [US1] Write test for usePermissionCheck hook in `hooks/usePermissionCheck.test.tsx`

### Implementation for User Story 1

- [X] T017 [P] [US1] Create PermissionGate component for conditional rendering in `components/access-control/PermissionGate.tsx`
- [X] T018 [P] [US1] Create RequirePermission component for route protection in `components/access-control/RequirePermission.tsx`
- [X] T019 [US1] Extend usePermissionCheck hook to use cache, fail-closed behavior in `hooks/usePermissionCheck.ts`
- [X] T020 [US1] Create PermissionContext provider with cache management in `contexts/PermissionContext.tsx`
- [X] T021 [US1] Add PermissionContext provider to EMRPage layout in `EMRPage.tsx`
- [X] T022 [US1] Add RequirePermission wrappers to main EMR routes in `AppRoutes.tsx` or section components
- [X] T023 [US1] Add "Access Denied" view component in `views/AccessDeniedView.tsx`

**Checkpoint**: US1 complete - role-based page access enforced, users see only permitted pages

---

## Phase 4: User Story 2 - Fine-Grained Action Permissions (Priority: P1)

**Goal**: Control which actions (view, create, edit, delete) each role can perform

**Independent Test**: User with "view-encounters" but not "edit-encounter" permission sees disabled Edit button

### Tests for User Story 2

- [X] T024 [P] [US2] Write test for useActionPermission hook in `hooks/useActionPermission.test.tsx`
- [X] T025 [P] [US2] Write test for PermissionButton component in `components/access-control/PermissionButton.test.tsx`

### Implementation for User Story 2

- [X] T026 [P] [US2] Create useActionPermission hook for checking action permissions in `hooks/useActionPermission.ts`
- [X] T027 [P] [US2] Create PermissionButton component (disabled/hidden based on permission) in `components/access-control/PermissionButton.tsx`
- [X] T028 [US2] Add permission checks to PatientTable edit/delete actions in `components/registration/PatientTable.tsx`
- [X] T029 [US2] Add permission checks to PatientHistoryTable edit/delete actions in `components/patient-history/PatientHistoryTable.tsx`
- [X] T030 [US2] Add permission checks to EncounterForm submit actions in relevant encounter components
- [X] T031 [US2] Extend auditService to log permission-checked actions in `services/auditService.ts`
- [X] T032 [US2] Write tests for audit logging of permission-checked actions in `services/auditService.test.ts`

**Checkpoint**: US2 complete - buttons disabled/hidden based on permissions, actions logged

---

## Phase 5: User Story 3 - Permission Matrix Configuration (Priority: P2)

**Goal**: Visual permission matrix UI for administrators to configure role permissions

**Independent Test**: Toggle permission in matrix, save, verify change persists after refresh

### Tests for User Story 3

- [X] T033 [P] [US3] Write test for enhanced PermissionMatrix component in `components/role-management/PermissionMatrix.test.tsx`
- [X] T034 [P] [US3] Write test for CategoryPermissionGroup component in `components/role-management/CategoryPermissionGroup.test.tsx`

### Implementation for User Story 3

- [X] T035 [P] [US3] Create CategoryPermissionGroup component for 8-category display in `components/role-management/CategoryPermissionGroup.tsx`
- [X] T036 [US3] Extend PermissionMatrix to display 8 categories with collapsible groups in `components/role-management/PermissionMatrix.tsx`
- [X] T037 [US3] Add permission dependency visualization (auto-enable indicator) to PermissionMatrix in `components/role-management/PermissionMatrix.tsx`
- [X] T038 [US3] Add audit event creation on permission save in `services/roleService.ts`
- [X] T039 [US3] Update RoleEditModal to use enhanced PermissionMatrix in `components/role-management/RoleEditModal.tsx`
- [X] T040 [US3] Update RoleCreateModal to use enhanced PermissionMatrix in `components/role-management/RoleCreateModal.tsx`

**Checkpoint**: US3 complete - admins can configure 80-120 permissions via visual matrix

---

## Phase 6: User Story 4 - Department-Scoped Access (Priority: P2)

**Goal**: Staff can only see patients/records from their assigned department

**Independent Test**: User in "Cardiology" department cannot see patients from "Orthopedics"

### Tests for User Story 4

- [X] T041 [P] [US4] Write test for department-scoped permission logic in `services/permissionService.test.ts`
- [X] T042 [P] [US4] Write test for DepartmentSelector component in `components/account-management/DepartmentSelector.test.tsx`

### Implementation for User Story 4

- [X] T043 [P] [US4] Create DepartmentSelector component for role assignment in `components/account-management/DepartmentSelector.tsx`
- [X] T044 [US4] Extend roleService to add department scoping via criteria parameter in `services/roleService.ts`
- [X] T045 [US4] Add department parameter to createDepartmentScopedRole function in `services/roleService.ts`
- [X] T046 [US4] Extend accountService to support department-specific role assignment in `services/accountService.ts`
- [X] T047 [US4] Update AccountForm to include department selection for role assignment in `components/account-management/AccountForm.tsx`
- [X] T048 [US4] Add useDepartmentContext hook for current user's department in `hooks/useDepartmentContext.ts`
- [X] T049 [US4] Modify patient search to filter by department in `services/patientService.ts`

**Checkpoint**: US4 complete - department-scoped access enforced

---

## Phase 7: User Story 5 - Time-Restricted Edits (Priority: P2)

**Goal**: Prevent editing records older than configurable time period

**Independent Test**: Record dated 48 hours ago (24-hour window) shows disabled Edit button

### Tests for User Story 5

- [X] T050 [P] [US5] Write test for useEditWindow hook in `hooks/useEditWindow.test.tsx`
- [X] T051 [P] [US5] Write test for RecordLockBanner component in `components/access-control/RecordLockBanner.test.tsx`

### Implementation for User Story 5

- [X] T052 [P] [US5] Create EditWindowConfig type in `types/permission-cache.ts`
- [X] T053 [US5] Create useEditWindow hook to check record lock status in `hooks/useEditWindow.ts`
- [X] T054 [US5] Create RecordLockBanner component showing lock status in `components/access-control/RecordLockBanner.tsx`
- [X] T055 [US5] Add edit-locked-records permission check for admin override in `services/permissionService.ts`
- [X] T056 [US5] Integrate RecordLockBanner into patient encounter views in `views/patient-history/` components
- [X] T057 [US5] Add audit logging for locked record override attempts in `services/auditService.ts`

**Checkpoint**: US5 complete - records auto-lock after configured time, admin override logged

---

## Phase 8: User Story 6 - Sensitive Data Access Control (Priority: P3)

**Goal**: Restrict access to sensitive data categories (mental health, HIV status, etc.)

**Independent Test**: Patient with mental health records shows "Restricted" to general physician

### Tests for User Story 6

- [X] T058 [P] [US6] Write test for useSensitiveDataAccess hook in `hooks/useSensitiveDataAccess.test.tsx`
- [X] T059 [P] [US6] Write test for SensitiveDataGate component in `components/access-control/SensitiveDataGate.test.tsx`

### Implementation for User Story 6

- [X] T060 [P] [US6] Create SensitiveCategory and SensitiveDataAccess types in `types/permission-cache.ts`
- [X] T061 [US6] Create useSensitiveDataAccess hook for checking sensitive data permissions in `hooks/useSensitiveDataAccess.ts`
- [X] T062 [US6] Create SensitiveDataGate component to show "Restricted" message in `components/access-control/SensitiveDataGate.tsx`
- [X] T063 [US6] Add sensitive data permissions (view-sensitive-mental-health, etc.) in `services/permissionService.ts`
- [X] T064 [US6] Integrate SensitiveDataGate into clinical notes display in relevant patient history components
- [X] T065 [US6] Add audit logging for sensitive data access attempts in `services/auditService.ts`

**Checkpoint**: US6 complete - sensitive data categories protected, access logged

---

## Phase 9: User Story 7 - Emergency Access (Break Glass) (Priority: P3)

**Goal**: Emergency access workflow for restricted patient data with audit logging

**Independent Test**: Non-authorized user clicks "Emergency Access", provides reason, access granted and logged

### Tests for User Story 7

- [X] T066 [P] [US7] Write test for useEmergencyAccess hook in `hooks/useEmergencyAccess.test.tsx`
- [X] T067 [P] [US7] Write test for EmergencyAccessModal component in `components/access-control/EmergencyAccessModal.test.tsx`
- [X] T068 [P] [US7] Write test for EmergencyAccessBanner component in `components/access-control/EmergencyAccessBanner.test.tsx`

### Implementation for User Story 7

- [X] T069 [P] [US7] Create EmergencyAccessRequest and EmergencyAccessResult types in `types/permission-cache.ts`
- [X] T070 [US7] Create useEmergencyAccess hook for break-glass workflow in `hooks/useEmergencyAccess.ts`
- [X] T071 [US7] Create EmergencyAccessModal component with mandatory reason entry in `components/access-control/EmergencyAccessModal.tsx`
- [X] T072 [US7] Create EmergencyAccessBanner component showing "Emergency access - all actions logged" in `components/access-control/EmergencyAccessBanner.tsx`
- [X] T073 [US7] Add emergency-access permission to admin permissions in `services/permissionService.ts`
- [X] T074 [US7] Create emergency access audit logging with DICOM code DCM 110113 in `services/auditService.ts`
- [X] T075 [US7] Add emergency access notification to privacy officer in `services/notificationService.ts` or similar
- [X] T076 [US7] Integrate EmergencyAccessModal trigger into restricted data views

**Checkpoint**: US7 complete - emergency access workflow with audit trail

---

## Phase 10: Role Templates (Cross-Cutting)

**Purpose**: Create 16 predefined role templates matching legacy personnel types

- [X] T077 [P] Create RoleTemplate interface in `types/role-management.ts`
- [X] T078 [P] Add role template definitions (owner, admin, physician, nurse, registrar, laboratory, cashier, hrManager, seniorNurse, pharmacyManager, viewAdmin, accounting, manager, operator, externalOrg, technician) in `services/roleTemplateService.ts`
- [X] T079 Write tests for role template service in `services/roleTemplateService.test.ts`
- [X] T080 Create RoleTemplateSelector component for role creation in `components/role-management/RoleTemplateSelector.tsx`
- [X] T081 Write test for RoleTemplateSelector in `components/role-management/RoleTemplateSelector.test.tsx`
- [X] T082 Integrate RoleTemplateSelector into RoleCreateModal in `components/role-management/RoleCreateModal.tsx`

**Checkpoint**: 16 role templates available for quick role setup

---

## Phase 11: Observability & Monitoring (Cross-Cutting)

**Purpose**: Add metrics tracking per FR-035 to FR-038

- [X] T083 [P] Create PermissionMetrics interface in `types/permission-cache.ts`
- [X] T084 Add denial rate tracking to permissionCacheService in `services/permissionCacheService.ts`
- [X] T085 Add latency tracking to permission check functions in `services/permissionService.ts`
- [X] T086 Add cache hit rate tracking to permissionCacheService in `services/permissionCacheService.ts`
- [X] T087 Create usePermissionMetrics hook for dashboard display in `hooks/usePermissionMetrics.ts`
- [X] T088 Write tests for metrics tracking in `services/permissionCacheService.test.ts`

**Checkpoint**: Permission system metrics available for monitoring

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements across all user stories

- [X] T089 [P] Add translations for all new UI strings (error messages, labels) in `translations/ka.json`, `en.json`, `ru.json`
- [X] T090 [P] Update CLAUDE.md with permission system documentation
- [X] T091 Code cleanup and remove any deprecated permission code
- [X] T092 Run all permission-related tests, ensure >80% coverage
- [X] T093 Performance testing: verify <50ms permission check latency (6/6 tests)
- [X] T094 Security review: verify fail-closed behavior in all error paths (13/13 tests)
- [X] T095 Run quickstart.md validation scenarios (23/23 tests)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Phase 2 completion
  - US1 & US2 (P1) should be done first (MVP)
  - US3, US4, US5 (P2) can follow in any order
  - US6 & US7 (P3) can follow after P2 stories
- **Phase 10-11 (Cross-Cutting)**: Can run in parallel with US3-US7
- **Phase 12 (Polish)**: Depends on all user stories being complete

### User Story Dependencies

| Story | Dependencies | Notes |
|-------|--------------|-------|
| US1 | Phase 2 only | MVP - core page access control |
| US2 | Phase 2 only | MVP - action-level permissions |
| US3 | Phase 2 only | Admin UI for permission matrix |
| US4 | Phase 2 only | Department scoping |
| US5 | Phase 2 only | Time-based edit restrictions |
| US6 | Phase 2 only | Sensitive data categories |
| US7 | US6 (needs sensitive data foundation) | Emergency access for restricted data |

### Parallel Opportunities

Within each phase, tasks marked [P] can run in parallel:

- **Phase 1**: T002, T003, T004 (translations)
- **Phase 2**: T006, T007, T010, T012 (types and services in different files)
- **US1**: T014, T015, T016 (tests), T017, T018 (components)
- **US2**: T024, T025 (tests), T026, T027 (components)
- **US3**: T033, T034 (tests), T035 (component)
- **US4**: T041, T042 (tests), T043 (component)
- **US5**: T050, T051 (tests), T052 (types)
- **US6**: T058, T059 (tests), T060 (types)
- **US7**: T066, T067, T068 (tests), T069 (types)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for US1 together:
Task: "T014 [P] [US1] Write test for PermissionGate component"
Task: "T015 [P] [US1] Write test for RequirePermission component"
Task: "T016 [P] [US1] Write test for usePermissionCheck hook"

# Launch parallel components:
Task: "T017 [P] [US1] Create PermissionGate component"
Task: "T018 [P] [US1] Create RequirePermission component"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Setup (translations, types)
2. Complete Phase 2: Foundational (80-120 permissions, cache service)
3. Complete Phase 3: US1 - Role-Based Page Access
4. Complete Phase 4: US2 - Fine-Grained Action Permissions
5. **STOP and VALIDATE**: Test US1 + US2 independently
6. Deploy/demo MVP

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Test → Deploy (page access control)
3. Add US2 → Test → Deploy (action permissions)
4. Add US3 → Test → Deploy (permission matrix UI)
5. Add US4 → Test → Deploy (department scoping)
6. Add US5 → Test → Deploy (time restrictions)
7. Add US6 → Test → Deploy (sensitive data)
8. Add US7 → Test → Deploy (emergency access)

### Task Count Summary

| Phase | Tasks | Parallel |
|-------|-------|----------|
| Phase 1: Setup | 4 | 3 |
| Phase 2: Foundational | 9 | 4 |
| Phase 3: US1 | 10 | 5 |
| Phase 4: US2 | 9 | 4 |
| Phase 5: US3 | 8 | 3 |
| Phase 6: US4 | 9 | 3 |
| Phase 7: US5 | 8 | 3 |
| Phase 8: US6 | 8 | 3 |
| Phase 9: US7 | 11 | 4 |
| Phase 10: Templates | 6 | 2 |
| Phase 11: Observability | 6 | 1 |
| Phase 12: Polish | 7 | 2 |
| **Total** | **95** | **37** |

---

## Notes

- [P] tasks = different files, no dependencies on same file
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Tests written FIRST, must FAIL before implementation
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All paths relative to `packages/app/src/emr/`
