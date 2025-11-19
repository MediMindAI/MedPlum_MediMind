# Tasks: Hospital Account Management Dashboard

**Input**: Design documents from `/specs/005-account-management/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅

**Tests**: REQUIRED per constitution (III. Test-First Development). All components and services must have colocated tests. Target: >80% code coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3...)
- Include exact file paths in descriptions

## Path Conventions

All paths relative to repository root: `/Users/toko/Desktop/medplum_medimind/`

**Structure**: Monorepo - feature implemented in `packages/app/src/emr/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for account management feature

- [ ] T001 Create directory structure for account management in packages/app/src/emr/views/account-management/
- [ ] T002 Create directory structure for components in packages/app/src/emr/components/account-management/
- [ ] T003 [P] Create directory structure for services in packages/app/src/emr/services/ (account-related)
- [ ] T004 [P] Create directory structure for hooks in packages/app/src/emr/hooks/ (account-related)
- [ ] T005 [P] Create directory structure for types in packages/app/src/emr/types/account-management.ts
- [ ] T006 [P] Create directory structure for translations in packages/app/src/emr/translations/ (account-roles.json, medical-specialties.json)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Define TypeScript interfaces in packages/app/src/emr/types/account-management.ts (AccountFormValues, PractitionerFormData, RoleAssignment, etc.)
- [ ] T008 [P] Create base translation files: packages/app/src/emr/translations/account-roles.json (Physician, Nurse, Technician, Administrator, etc. in ka/en/ru)
- [ ] T009 [P] Create medical specialties translation file: packages/app/src/emr/translations/medical-specialties.json (Cardiologist, Orthopedic Surgeon, etc. in ka/en/ru)
- [ ] T010 [P] Add account management translation keys to packages/app/src/emr/translations/ka.json (menu, forms, errors)
- [ ] T011 [P] Add account management translation keys to packages/app/src/emr/translations/en.json
- [ ] T012 [P] Add account management translation keys to packages/app/src/emr/translations/ru.json
- [ ] T013 Implement accountHelpers.ts in packages/app/src/emr/services/accountHelpers.ts (FHIR data extraction utilities: getPractitionerName, getTelecomValue, etc.)
- [ ] T014 Write tests for accountHelpers.ts in packages/app/src/emr/services/accountHelpers.test.ts
- [ ] T015 Implement accountValidators.ts in packages/app/src/emr/services/accountValidators.ts (email validation RFC 5322, phone validation E.164)
- [ ] T016 Write tests for accountValidators.ts in packages/app/src/emr/services/accountValidators.test.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Admin Creates Healthcare Provider Account (Priority: P1) 🎯 MVP

**Goal**: Enable hospital administrators to create basic practitioner accounts with single role assignment via right-side menu access

**Independent Test**: Create a practitioner account with name, email, and role. Verify account appears in system and can log in with appropriate permissions. Test menu access from TopNavBar.

### Tests for User Story 1 (TDD - Write First, Ensure Fail)

- [X] T017 [P] [US1] Write test for accountService.createPractitioner in packages/app/src/emr/services/accountService.test.ts
- [X] T018 [P] [US1] Write test for accountService.searchPractitioners in packages/app/src/emr/services/accountService.test.ts
- [X] T019 [P] [US1] Write test for accountService.updatePractitioner in packages/app/src/emr/services/accountService.test.ts
- [X] T020 [P] [US1] Write test for AccountForm component in packages/app/src/emr/components/account-management/AccountForm.test.tsx
- [X] T021 [P] [US1] Write test for AccountTable component in packages/app/src/emr/components/account-management/AccountTable.test.tsx
- [X] T022 [P] [US1] Write test for AccountStatusBadge component in packages/app/src/emr/components/account-management/AccountStatusBadge.test.tsx
- [X] T023 [P] [US1] Write test for useAccountForm hook in packages/app/src/emr/hooks/useAccountForm.test.tsx
- [X] T024 [P] [US1] Write test for useAccountList hook in packages/app/src/emr/hooks/useAccountList.test.tsx
- [X] T025 [P] [US1] Write test for AccountManagementView in packages/app/src/emr/views/account-management/AccountManagementView.test.tsx

### Implementation for User Story 1

#### Services Layer
- [X] T026 [P] [US1] Implement accountService.createPractitioner in packages/app/src/emr/services/accountService.ts (uses Medplum Invite API, creates User + Practitioner + ProjectMembership)
- [X] T027 [P] [US1] Implement accountService.searchPractitioners in packages/app/src/emr/services/accountService.ts (cursor-based pagination, 50/page, name/email search)
- [X] T028 [P] [US1] Implement accountService.updatePractitioner in packages/app/src/emr/services/accountService.ts (updates Practitioner resource)
- [X] T029 [P] [US1] Implement accountService.getPractitionerById in packages/app/src/emr/services/accountService.ts

#### Hooks Layer
- [X] T030 [US1] Implement useAccountForm hook in packages/app/src/emr/hooks/useAccountForm.ts (Mantine form with validation, handles create/update)
- [X] T031 [US1] Implement useAccountList hook in packages/app/src/emr/hooks/useAccountList.ts (fetches accounts, pagination, search filters, auto-refresh)

#### Components Layer
- [X] T032 [P] [US1] Implement AccountStatusBadge component in packages/app/src/emr/components/account-management/AccountStatusBadge.tsx (shows active/inactive with color coding)
- [X] T033 [US1] Implement AccountForm component in packages/app/src/emr/components/account-management/AccountForm.tsx (Mantine Grid, responsive spans, single-role selector, email/phone validation, size="md" inputs)
- [X] T034 [US1] Implement AccountTable component in packages/app/src/emr/components/account-management/AccountTable.tsx (horizontal scroll, turquoise gradient header, clickable rows, edit/delete icons, React.memo optimization)
- [X] T035 [US1] Implement AccountEditModal component in packages/app/src/emr/components/account-management/AccountEditModal.tsx (modal with AccountForm, auto-refresh on save)

#### Views Layer
- [X] T036 [US1] Implement AccountManagementView in packages/app/src/emr/views/account-management/AccountManagementView.tsx (main dashboard, AccountTable + AccountForm, creates new accounts)
- [X] T037 [US1] Implement AccountEditView in packages/app/src/emr/views/account-management/AccountEditView.tsx (full-page edit for route-based access)

#### Routing & Menu Integration
- [X] T038 [US1] Add account management menu item to packages/app/src/emr/components/TopNavBar/TopNavBar.tsx (admin-only conditional, navigate to /emr/account-management)
- [X] T039 [US1] Add account management routes to packages/app/src/AppRoutes.tsx (/emr/account-management, /emr/account-management/edit/:id with ProtectedRoute requireAdmin=true)
- [X] T040 [US1] Create AccountManagementSection wrapper in packages/app/src/emr/sections/AccountManagementSection.tsx (route organization)

#### Storybook Stories (Constitution Requirement)
- [ ] T041 [P] [US1] Create Storybook story for AccountForm in packages/app/src/emr/components/account-management/AccountForm.stories.tsx
- [ ] T042 [P] [US1] Create Storybook story for AccountTable in packages/app/src/emr/components/account-management/AccountTable.stories.tsx
- [ ] T043 [P] [US1] Create Storybook story for AccountManagementView in packages/app/src/emr/views/account-management/AccountManagementView.stories.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional. Administrators can access account management from menu, create accounts with single role, view account list, and edit accounts. Run all tests (T017-T025) - all should pass.

---

## Phase 4: User Story 2 - Admin Assigns Multiple Roles and Specialties (Priority: P2)

**Goal**: Enable administrators to assign multiple concurrent roles and medical specialties to staff members with complex responsibilities

**Independent Test**: Assign multiple roles (e.g., "Physician" + "Department Head") to a user. Verify user has combined permissions from all roles. Test specialty selection with searchable dropdown.

### Tests for User Story 2 (TDD - Write First)

- [ ] T044 [P] [US2] Write test for roleService.createPractitionerRole in packages/app/src/emr/services/roleService.test.ts
- [ ] T045 [P] [US2] Write test for roleService.getPractitionerRoles in packages/app/src/emr/services/roleService.test.ts
- [ ] T046 [P] [US2] Write test for roleService.updatePractitionerRole in packages/app/src/emr/services/roleService.test.ts
- [ ] T047 [P] [US2] Write test for roleService.deletePractitionerRole in packages/app/src/emr/services/roleService.test.ts
- [ ] T048 [P] [US2] Write test for RoleSelector component in packages/app/src/emr/components/account-management/RoleSelector.test.tsx
- [ ] T049 [P] [US2] Write test for SpecialtySelect component in packages/app/src/emr/components/account-management/SpecialtySelect.test.tsx
- [ ] T050 [P] [US2] Write test for useRoleManagement hook in packages/app/src/emr/hooks/useRoleManagement.test.tsx

### Implementation for User Story 2

#### Services Layer
- [ ] T051 [P] [US2] Implement roleService.createPractitionerRole in packages/app/src/emr/services/roleService.ts (creates PractitionerRole with specialty, organization ref, code)
- [ ] T052 [P] [US2] Implement roleService.getPractitionerRoles in packages/app/src/emr/services/roleService.ts (fetches all roles for a practitioner)
- [ ] T053 [P] [US2] Implement roleService.updatePractitionerRole in packages/app/src/emr/services/roleService.ts
- [ ] T054 [P] [US2] Implement roleService.deletePractitionerRole in packages/app/src/emr/services/roleService.ts (removes role, updates permissions immediately)

#### Hooks Layer
- [ ] T055 [US2] Implement useRoleManagement hook in packages/app/src/emr/hooks/useRoleManagement.ts (manages multi-role state, add/remove roles, fetch roles for practitioner)

#### Components Layer
- [ ] T056 [P] [US2] Implement RoleSelector component in packages/app/src/emr/components/account-management/RoleSelector.tsx (MultiSelect for roles: Physician, Nurse, Technician, Administrator, etc. from account-roles.json)
- [ ] T057 [P] [US2] Implement SpecialtySelect component in packages/app/src/emr/components/account-management/SpecialtySelect.tsx (searchable Select for medical specialties from medical-specialties.json)

#### Integration with US1
- [ ] T058 [US2] Update AccountForm to support multi-role selection (add RoleSelector and SpecialtySelect components)
- [ ] T059 [US2] Update AccountTable to display multiple roles (comma-separated or badge list)
- [ ] T060 [US2] Update AccountEditModal to support role management

#### Storybook Stories
- [ ] T061 [P] [US2] Create Storybook story for RoleSelector in packages/app/src/emr/components/account-management/RoleSelector.stories.tsx
- [ ] T062 [P] [US2] Create Storybook story for SpecialtySelect in packages/app/src/emr/components/account-management/SpecialtySelect.stories.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Test creating an account with multiple roles, editing to add/remove roles, and verifying permission union works correctly.

---

## Phase 5: User Story 5 - Admin Deactivates and Reactivates Accounts (Priority: P2)

**Goal**: Enable administrators to temporarily or permanently deactivate accounts while preserving audit trails, with reactivation capability

**Independent Test**: Deactivate an account, verify user cannot log in. View audit logs showing deactivation. Reactivate account, verify user can log in again. Test self-deactivation prevention.

### Tests for User Story 5 (TDD - Write First)

- [ ] T063 [P] [US5] Write test for accountService.deactivatePractitioner in packages/app/src/emr/services/accountService.test.ts
- [ ] T064 [P] [US5] Write test for accountService.reactivatePractitioner in packages/app/src/emr/services/accountService.test.ts
- [ ] T065 [P] [US5] Write test for auditService.createAuditEvent in packages/app/src/emr/services/auditService.test.ts
- [ ] T066 [P] [US5] Write test for auditService.getAccountAuditTrail in packages/app/src/emr/services/auditService.test.ts
- [ ] T067 [P] [US5] Write test for AccountDeactivateModal component in packages/app/src/emr/components/account-management/AccountDeactivateModal.test.tsx

### Implementation for User Story 5

#### Services Layer (Audit & Deactivation)
- [ ] T068 [P] [US5] Implement auditService.createAuditEvent in packages/app/src/emr/services/auditService.ts (creates AuditEvent with DICOM Security Alert codes DCM 110113/110137, captures agent, entity, action C/U/D)
- [ ] T069 [P] [US5] Implement auditService.getAccountAuditTrail in packages/app/src/emr/services/auditService.ts (queries AuditEvent by entity=Practitioner, sorts by recorded date)
- [ ] T070 [P] [US5] Implement accountService.deactivatePractitioner in packages/app/src/emr/services/accountService.ts (sets Practitioner.active=false, creates audit event, prevents self-deactivation)
- [ ] T071 [P] [US5] Implement accountService.reactivatePractitioner in packages/app/src/emr/services/accountService.ts (sets Practitioner.active=true, creates audit event)

#### Components Layer
- [ ] T072 [US5] Implement AccountDeactivateModal component in packages/app/src/emr/components/account-management/AccountDeactivateModal.tsx (confirmation dialog, shows practitioner name, deactivate/reactivate actions, loading states)

#### Integration with US1
- [ ] T073 [US5] Add deactivate/reactivate buttons to AccountTable rows (conditional based on Practitioner.active status)
- [ ] T074 [US5] Update AccountManagementView to handle deactivation workflow
- [ ] T075 [US5] Update AccountForm to show warning for inactive accounts

#### Storybook Stories
- [ ] T076 [US5] Create Storybook story for AccountDeactivateModal in packages/app/src/emr/components/account-management/AccountDeactivateModal.stories.tsx

**Checkpoint**: User Stories 1, 2, and 5 should all work independently. Test account lifecycle (create → deactivate → reactivate), verify audit trail creation, and confirm login prevention for inactive accounts.

---

## Phase 6: User Story 6 - Admin Manages User Permissions and Access Policies (Priority: P2)

**Goal**: Provide administrators with granular control over role-specific permissions and access policies for compliance

**Independent Test**: Create custom AccessPolicy template, assign to role, verify permission restrictions are enforced. Test permission preview before saving.

### Tests for User Story 6 (TDD - Write First)

- [ ] T077 [P] [US6] Write test for permissionService.createAccessPolicy in packages/app/src/emr/services/permissionService.test.ts
- [ ] T078 [P] [US6] Write test for permissionService.getAccessPoliciesForRole in packages/app/src/emr/services/permissionService.test.ts
- [ ] T079 [P] [US6] Write test for permissionService.updateAccessPolicy in packages/app/src/emr/services/permissionService.test.ts
- [ ] T080 [P] [US6] Write test for usePermissions hook in packages/app/src/emr/hooks/usePermissions.test.tsx
- [ ] T081 [P] [US6] Write test for PermissionMatrix component in packages/app/src/emr/components/account-management/PermissionMatrix.test.tsx

### Implementation for User Story 6

#### Services Layer (AccessPolicy Management)
- [ ] T082 [P] [US6] Implement permissionService.createAccessPolicy in packages/app/src/emr/services/permissionService.ts (creates AccessPolicy resource with resource array, criteria parameters %department/%profile)
- [ ] T083 [P] [US6] Implement permissionService.getAccessPoliciesForRole in packages/app/src/emr/services/permissionService.ts (fetches policies for role template)
- [ ] T084 [P] [US6] Implement permissionService.updateAccessPolicy in packages/app/src/emr/services/permissionService.ts
- [ ] T085 [P] [US6] Implement permissionService.deleteAccessPolicy in packages/app/src/emr/services/permissionService.ts

#### Hooks Layer
- [ ] T086 [US6] Implement usePermissions hook in packages/app/src/emr/hooks/usePermissions.ts (permission checking utilities, checks if user has specific capability)

#### Components Layer
- [ ] T087 [US6] Implement PermissionMatrix component in packages/app/src/emr/components/account-management/PermissionMatrix.tsx (grid of resources vs interactions, checkboxes for create/read/update/delete/search, criteria input fields)

#### Integration with US2
- [ ] T088 [US6] Update RoleSelector to show assigned AccessPolicy for each role
- [ ] T089 [US6] Add "Configure Permissions" button to AccountForm that opens PermissionMatrix modal

#### Storybook Stories
- [ ] T090 [US6] Create Storybook story for PermissionMatrix in packages/app/src/emr/components/account-management/PermissionMatrix.stories.tsx

**Checkpoint**: User Stories 1, 2, 5, and 6 should all work independently. Test creating custom AccessPolicy, assigning to role, and verifying permission enforcement in Medplum.

---

## Phase 7: User Story 3 - Admin Manages Department and Location Assignments (Priority: P3)

**Goal**: Enable administrators to assign staff to specific departments and locations for data access control

**Independent Test**: Assign user to "Cardiology Department", verify they only see patients from that department. Test multi-location assignment.

### Tests for User Story 3 (TDD - Write First)

- [ ] T091 [P] [US3] Write test for departmentService.searchOrganizations in packages/app/src/emr/services/departmentService.test.ts
- [ ] T092 [P] [US3] Write test for departmentService.getOrganizationById in packages/app/src/emr/services/departmentService.test.ts
- [ ] T093 [P] [US3] Write test for DepartmentSelect component in packages/app/src/emr/components/account-management/DepartmentSelect.test.tsx
- [ ] T094 [P] [US3] Write test for LocationSelect component in packages/app/src/emr/components/account-management/LocationSelect.test.tsx

### Implementation for User Story 3

#### Services Layer (Department/Organization Management)
- [ ] T095 [P] [US3] Implement departmentService.searchOrganizations in packages/app/src/emr/services/departmentService.ts (searches Organization resources, filters by type=dept or type=location)
- [ ] T096 [P] [US3] Implement departmentService.getOrganizationById in packages/app/src/emr/services/departmentService.ts

#### Components Layer
- [ ] T097 [P] [US3] Implement DepartmentSelect component in packages/app/src/emr/components/account-management/DepartmentSelect.tsx (MultiSelect for departments, loads from Organization resources with type=dept)
- [ ] T098 [P] [US3] Implement LocationSelect component in packages/app/src/emr/components/account-management/LocationSelect.tsx (MultiSelect for locations, loads from Organization/Location resources)

#### Integration with US1/US2
- [ ] T099 [US3] Update PractitionerRole creation in roleService to include organization reference (department assignment)
- [ ] T100 [US3] Update AccountForm to include DepartmentSelect and LocationSelect components
- [ ] T101 [US3] Update AccountTable to display department assignments
- [ ] T102 [US3] Update PermissionMatrix to show department-based criteria parameters

#### Storybook Stories
- [ ] T103 [P] [US3] Create Storybook story for DepartmentSelect in packages/app/src/emr/components/account-management/DepartmentSelect.stories.tsx
- [ ] T104 [P] [US3] Create Storybook story for LocationSelect in packages/app/src/emr/components/account-management/LocationSelect.stories.tsx

**Checkpoint**: User Stories 1, 2, 3, 5, and 6 should all work independently. Test department assignment, verify data access restrictions work correctly via AccessPolicy criteria.

---

## Phase 8: User Story 4 - Admin Searches and Filters Existing Accounts (Priority: P3)

**Goal**: Provide efficient search and filter capabilities for managing large staff populations

**Independent Test**: Create 20+ accounts. Search by name (partial match), filter by role, filter by department. Test combined filters (AND logic). Verify <1 second response time.

### Tests for User Story 4 (TDD - Write First)

- [ ] T105 [P] [US4] Write test for AccountSearchFilters component in packages/app/src/emr/components/account-management/AccountSearchFilters.test.tsx
- [ ] T106 [P] [US4] Write test for advanced search in useAccountList hook (already in T024, extend for filters)

### Implementation for User Story 4

#### Components Layer (Search & Filter UI)
- [ ] T107 [US4] Implement AccountSearchFilters component in packages/app/src/emr/components/account-management/AccountSearchFilters.tsx (TextInput for name search with debounce 500ms, RoleSelector for role filter, DepartmentSelect for department filter, status filter dropdown, clear filters button)

#### Services Layer Enhancement
- [ ] T108 [US4] Enhance accountService.searchPractitioners to support combined filters (name, email, role via PractitionerRole search, department via organization parameter, status via active parameter)

#### Integration with US1
- [ ] T109 [US4] Update AccountManagementView to include AccountSearchFilters above AccountTable
- [ ] T110 [US4] Update useAccountList hook to accept filter parameters and trigger search on filter change

#### Storybook Stories
- [ ] T111 [US4] Create Storybook story for AccountSearchFilters in packages/app/src/emr/components/account-management/AccountSearchFilters.stories.tsx

**Checkpoint**: All user stories should now be independently functional. Test search performance with 100+ accounts, verify filters work correctly alone and combined.

---

## Phase 9: User Story 7 - Admin Views Account Activity and Audit Logs (Priority: P3)

**Goal**: Provide administrators with comprehensive audit log viewing for security audits and compliance reporting

**Independent Test**: Create account, modify it, deactivate it. View complete audit trail showing all changes with timestamps, agents, and outcomes.

### Tests for User Story 7 (TDD - Write First)

- [ ] T112 [P] [US7] Write test for AuditLogViewer component in packages/app/src/emr/components/account-management/AuditLogViewer.test.tsx
- [ ] T113 [P] [US7] Write test for auditService.getFailedAccountOperations (already have getAccountAuditTrail in T066, extend)

### Implementation for User Story 7

#### Services Layer Enhancement
- [ ] T114 [US7] Enhance auditService to add getAuditLogsByDateRange in packages/app/src/emr/services/auditService.ts (filters by date, action type, outcome)
- [ ] T115 [US7] Implement auditService.getFailedAccountOperations in packages/app/src/emr/services/auditService.ts (queries outcome=4,8,12 for failures)

#### Components Layer (Audit Log Display)
- [ ] T116 [US7] Implement AuditLogViewer component in packages/app/src/emr/components/account-management/AuditLogViewer.tsx (Table with columns: timestamp, agent, action, outcome, description. Filters: date range, action type, outcome. Pagination with 50 logs/page)

#### Integration with US1
- [ ] T117 [US7] Add "Audit Log" tab to AccountEditModal showing AuditLogViewer for that practitioner
- [ ] T118 [US7] Add "View Audit Logs" button to AccountTable row actions

#### Storybook Stories
- [ ] T119 [US7] Create Storybook story for AuditLogViewer in packages/app/src/emr/components/account-management/AuditLogViewer.stories.tsx

**Checkpoint**: All 7 user stories should now be independently functional. Test complete audit workflow, verify immutability (cannot edit/delete logs), test compliance reporting.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final production readiness

- [ ] T120 [P] Update packages/app/src/emr/translations/ka.json with all remaining account management keys (if any missing)
- [ ] T121 [P] Update packages/app/src/emr/translations/en.json with all remaining account management keys
- [ ] T122 [P] Update packages/app/src/emr/translations/ru.json with all remaining account management keys
- [ ] T123 [P] Add Account Management Dashboard section to CLAUDE.md documenting: FHIR resource mappings, file locations, testing patterns, common workflows
- [ ] T124 [P] Create departments.json translation file in packages/app/src/emr/translations/departments.json (common hospital departments in ka/en/ru)
- [ ] T125 [P] Create permissions.json translation file in packages/app/src/emr/translations/permissions.json (permission capability names in ka/en/ru)
- [ ] T126 Code cleanup: Remove console.log statements, unused imports, commented code
- [ ] T127 Performance optimization: Verify React.memo() usage in AccountTable, ensure cursor-based pagination working correctly
- [ ] T128 [P] Security hardening: Verify input sanitization in accountValidators, test XSS prevention, verify AccessPolicy enforcement
- [ ] T129 [P] Accessibility audit: Verify 44px touch targets, keyboard navigation, screen reader labels, ARIA attributes
- [ ] T130 Run npm test -- account-management to verify all 80+ tests pass with >80% coverage
- [ ] T131 Run npm run lint to verify ESLint passes with no errors
- [ ] T132 Run npm run build to verify TypeScript compilation succeeds
- [ ] T133 Manual testing checklist: Test on mobile (Chrome DevTools), test in Georgian/English/Russian, test with 100+ accounts, test permission enforcement
- [ ] T134 Create demo data script: Generate 50+ sample practitioner accounts with varied roles/departments for testing

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - User stories CAN proceed in parallel if staffed
  - OR sequentially in priority order: US1 (P1) → US2, US5, US6 (P2) → US3, US4, US7 (P3)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories ✅ MVP
- **US2 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 but independently testable
- **US5 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 but independently testable
- **US6 (P2)**: Can start after Foundational (Phase 2) - Integrates with US2 for role-based policies
- **US3 (P3)**: Can start after Foundational (Phase 2) - Integrates with US1/US2 for department assignment
- **US4 (P3)**: Can start after Foundational (Phase 2) - Enhances US1 with search, depends on US3 for department filter
- **US7 (P3)**: Can start after Foundational (Phase 2) - Uses audit service from US5

### Within Each User Story

**Test-First Development (Constitution III):**
1. **Tests FIRST** - Write all tests for the story, ensure they FAIL
2. **Services** - Implement service layer, tests should start passing
3. **Hooks** - Implement hooks layer (may depend on services)
4. **Components** - Implement UI components (depend on hooks/services)
5. **Views** - Implement view layer (depend on components)
6. **Integration** - Wire up routing, menu, translations
7. **Storybook** - Document components in Storybook
8. **Verify** - All tests pass, story independently functional

### Parallel Opportunities

**Within Phase 2 (Foundational):**
- T008-T012 (translation files) can run in parallel
- T013-T016 (helpers and validators with tests) can run in parallel after T007

**Within User Story 1:**
- T017-T025 (all tests) can be written in parallel
- T026-T029 (all services) can be implemented in parallel after tests written
- T032 (AccountStatusBadge) can be implemented in parallel with other components
- T041-T043 (Storybook stories) can be created in parallel

**Within User Story 2:**
- T044-T050 (all tests) can be written in parallel
- T051-T054 (role services) can be implemented in parallel
- T056-T057 (role/specialty selectors) can be implemented in parallel
- T061-T062 (Storybook stories) can be created in parallel

**Across User Stories (after Foundational complete):**
- US1, US2, US5, US6 can all start in parallel (different developers)
- US3 can start after US2 completes (needs roleService)
- US4 can start after US3 completes (needs department filter)
- US7 can start after US5 completes (needs audit service)

---

## Parallel Example: User Story 1

```bash
# Step 1: Write all tests in parallel
Task T017: "Write test for accountService.createPractitioner"
Task T018: "Write test for accountService.searchPractitioners"
Task T019: "Write test for accountService.updatePractitioner"
Task T020: "Write test for AccountForm component"
Task T021: "Write test for AccountTable component"
Task T022: "Write test for AccountStatusBadge component"
Task T023: "Write test for useAccountForm hook"
Task T024: "Write test for useAccountList hook"
Task T025: "Write test for AccountManagementView"

# Verify all tests FAIL (expected since no implementation exists)

# Step 2: Implement services in parallel
Task T026: "Implement accountService.createPractitioner"
Task T027: "Implement accountService.searchPractitioners"
Task T028: "Implement accountService.updatePractitioner"
Task T029: "Implement accountService.getPractitionerById"

# Tests T017-T019 should now PASS

# Step 3: Implement hooks (sequential, depend on services)
Task T030: "Implement useAccountForm hook"
Task T031: "Implement useAccountList hook"

# Tests T023-T024 should now PASS

# Step 4: Implement components in parallel
Task T032: "Implement AccountStatusBadge"
Task T033: "Implement AccountForm" (depends on T030)
Task T034: "Implement AccountTable"
Task T035: "Implement AccountEditModal"

# Tests T020-T022 should now PASS

# Step 5: Implement views (sequential, depend on components)
Task T036: "Implement AccountManagementView"
Task T037: "Implement AccountEditView"

# Test T025 should now PASS

# Step 6: Integration
Task T038: "Add menu item to TopNavBar"
Task T039: "Add routes to AppRoutes"
Task T040: "Create AccountManagementSection"

# Step 7: Storybook stories in parallel
Task T041: "Create story for AccountForm"
Task T042: "Create story for AccountTable"
Task T043: "Create story for AccountManagementView"

# All US1 tests pass - story complete and independently functional
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. ✅ Complete Phase 1: Setup (T001-T006)
2. ✅ Complete Phase 2: Foundational (T007-T016) - CRITICAL
3. ✅ Complete Phase 3: User Story 1 (T017-T043)
4. **STOP and VALIDATE**:
   - Run all tests: `npm test -- account-management`
   - Manual test: Log in as admin, navigate to menu, create account, verify login
   - Test on mobile device (Chrome DevTools)
   - Test in all three languages (ka/en/ru)
5. **Deploy/Demo MVP** - Basic account creation working!

**MVP Scope**: ~43 tasks, delivers core value (admin creates accounts)

### Incremental Delivery (Recommended)

1. **Foundation** (Phase 1-2): T001-T016 → Infrastructure ready
2. **MVP** (Phase 3): T017-T043 → User Story 1 → Deploy/Demo ✅
3. **Enhancement 1** (Phase 4-6): T044-T090 → User Stories 2, 5, 6 → Deploy/Demo
4. **Enhancement 2** (Phase 7-9): T091-T119 → User Stories 3, 4, 7 → Deploy/Demo
5. **Polish** (Phase 10): T120-T134 → Production ready → Final Deploy

Each deployment adds value without breaking previous functionality.

### Parallel Team Strategy

With 3 developers after Foundational phase (T016 complete):

1. **Developer A**: User Story 1 (T017-T043) - MVP priority
2. **Developer B**: User Story 2 (T044-T062) - Multi-role support
3. **Developer C**: User Story 5 (T063-T076) - Account lifecycle

All three stories can be developed simultaneously and independently.

---

## Test Verification Checklist

Per Constitution III (Test-First Development):

### Unit Tests (Colocated)
- [ ] All services have `.test.ts` files with >80% coverage
- [ ] All components have `.test.tsx` files with >80% coverage
- [ ] All hooks have `.test.tsx` files with >80% coverage
- [ ] accountHelpers.test.ts tests FHIR data extraction
- [ ] accountValidators.test.ts tests email/phone validation

### Integration Tests
- [ ] Account creation workflow: menu → form → submit → table refresh
- [ ] Permission enforcement: restricted user cannot access admin features
- [ ] Multi-role permissions: user with 2 roles has union of permissions
- [ ] Audit logging: all CRUD operations create AuditEvents
- [ ] Department restriction: user only sees patients from assigned department

### Storybook Stories (Constitution Requirement)
- [ ] All reusable components documented in Storybook
- [ ] Stories show different states (loading, error, empty, populated)
- [ ] Stories demonstrate responsive behavior

### Manual Testing
- [ ] Mobile responsiveness (tested on actual device or DevTools)
- [ ] All three languages (ka/en/ru) display correctly
- [ ] Performance: <1 second search response for 100+ accounts
- [ ] Accessibility: keyboard navigation works, screen reader compatible

---

## Notes

- **[P] tasks**: Different files, no dependencies, can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **Test-First**: Constitution requires tests BEFORE implementation
- **Independent stories**: Each user story should be completable and testable on its own
- **File paths**: All paths are absolute to repository root
- **Commit strategy**: Commit after each task or logical group (e.g., all tests for a story)
- **Checkpoints**: Stop at any checkpoint to validate story independently before proceeding
- **Avoid**: Vague tasks, same file conflicts, cross-story dependencies that break independence

**Total Tasks**: 134 tasks
**MVP Tasks**: 43 tasks (Phase 1-3)
**Estimated Effort**:
- MVP (US1): 2-3 weeks for 1 developer
- Full Feature (US1-US7): 6-8 weeks for 1 developer, or 3-4 weeks for 3 developers in parallel
