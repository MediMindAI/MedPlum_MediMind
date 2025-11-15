# Implementation Plan: Patient History Page (ისტორია)

**Branch**: `001-patient-history-page` | **Date**: 2025-11-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-patient-history-page/spec.md`

## Summary

Build a FHIR-compliant patient visit history management page (ისტორია) within the MediMind EMR system. The page will display patient visits in a 10-column table with filtering by insurance/payer (58 options), text search by patient details, date range filtering, and inline editing capabilities. The implementation will follow the existing EMR UI Layout (4-row horizontal navigation) and integrate with FHIR R4 Encounter, Patient, and Coverage resources. Key features include green highlighting for outstanding debts, support for multiple insurance policies per visit, Georgian ID validation using Luhn checksum, and multilingual support (Georgian/English/Russian).

## Technical Context

**Language/Version**: TypeScript 5.x (ESM modules, strict mode enabled)
**Primary Dependencies**:
- `@medplum/core` - FHIR client operations and data types
- `@medplum/react-hooks` - useMedplum hook for authenticated API access
- `@medplum/fhirtypes` - TypeScript definitions for FHIR R4 resources
- `@mantine/core` ^7.x - UI components (Table, Select, TextInput, DatePicker, Modal, Button)
- `@mantine/hooks` - useForm hook for form state management
- `react` ^19 - Component framework
- `react-router-dom` ^6.x - Client-side routing

**Storage**:
- PostgreSQL (via Medplum server) - stores FHIR resources as JSONB with indexes on identifier fields
- Redis (via Medplum server) - caching for insurance dropdown options and session data
- localStorage - language preference storage (key: "emrLanguage")

**Testing**:
- Jest - unit and integration testing framework
- `@testing-library/react` - React component testing
- `@medplum/mock` (MockClient) - FHIR API mocking for tests
- MemoryRouter - route testing without browser

**Target Platform**:
- Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Desktop-only in initial phase (responsive mobile design is future scope)
- Requires ES2020 support (built with Vite)

**Project Type**: Web application (Medplum monorepo - packages/app)

**Performance Goals**:
- Page load < 3 seconds for up to 100 visits
- Filter response < 1 second for any of 58 insurance options
- Table refresh < 1 second after edit operations
- Support 100 concurrent users without degradation

**Constraints**:
- Must display up to 100 visits without pagination (pagination only if performance degrades)
- Georgian personal ID (11-digit) must validate using Luhn checksum before saving
- Debt calculation (debt = total - payment) must be accurate to nearest GEL currency unit
- Green highlighting must be client-side CSS for performance (no separate API calls)
- Edit form with 134 elements must load within 2 seconds

**Scale/Scope**:
- 1 main view (PatientHistoryView) with integrated table + filters
- 1 edit modal (VisitEditModal) with 134 form elements
- 10 table columns with conditional formatting
- 58 insurance/payer dropdown options (multilingual)
- Support for 3 insurance policies per visit
- 7 user stories (P1-P7 prioritized for incremental development)
- 44 functional requirements organized into 8 categories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: FHIR-First Architecture ✅ PASS

**Compliance**:
- ✅ All visit data stored as FHIR R4 Encounter resources (FR-035)
- ✅ Patient demographics retrieved from FHIR Patient resources (FR-034)
- ✅ Insurance information stored as FHIR Coverage resources (FR-036, FR-038)
- ✅ Resource references used for linking (FR-037): Encounter → Patient, Encounter → Coverage
- ✅ Types from `@medplum/fhirtypes` for all FHIR resources (dependency listed)
- ✅ FHIR search parameters for filtering and querying

**Evidence**: Functional requirements FR-034 through FR-038 explicitly require FHIR R4 resource usage. Spec references FHIR R4 Encounter, Patient, Coverage documentation in References section.

### Principle II: Package-Based Modularity ✅ PASS

**Compliance**:
- ✅ Feature implemented in `packages/app` (existing EMR package)
- ✅ Dependencies explicitly declared: @medplum/core, @medplum/react-hooks, @medplum/fhirtypes, @mantine/core, @mantine/hooks
- ✅ Clear boundaries with Registration module (004-fhir-registration-implementation) via FHIR Patient resource queries
- ✅ Integration with EMR UI Layout module (003-emr-ui-layout) via shared navigation components
- ✅ No direct dependencies on other EMR sections (lab, prescriptions, discharge) - all out of scope

**Evidence**: Dependencies section lists 5 internal dependencies and 8 external dependencies with clear integration points.

### Principle III: Test-First Development (NON-NEGOTIABLE) ✅ PASS

**Compliance**:
- ✅ Test coverage required per Constitution: >80% for new code
- ✅ Colocated test files: PatientHistoryView.test.tsx, VisitEditModal.test.tsx, patientHistoryService.test.ts
- ✅ MockClient from @medplum/mock for FHIR API testing without server
- ✅ MemoryRouter for route testing
- ✅ 34 acceptance scenarios defined in spec (7 user stories × 3-7 scenarios each)

**Test Strategy**:
- Unit tests: Form validation (Luhn checksum, date range, required fields)
- Integration tests: FHIR resource queries, filter application, table sorting
- Component tests: Table rendering, modal interaction, language switching
- End-to-end tests: Complete visit search → edit → save workflow

**Evidence**: Spec includes 34 acceptance scenarios. CLAUDE.md documents testing patterns with MockClient and MemoryRouter. Registration module provides reference implementation with 9/9 tests passing.

### Principle IV: Type Safety & Strict Mode ✅ PASS

**Compliance**:
- ✅ TypeScript strict mode enabled project-wide
- ✅ `@medplum/fhirtypes` for Patient, Encounter, Coverage resource types
- ✅ Custom types defined in `packages/app/src/emr/types/patient-history.ts`:
  - `VisitFormValues` (134-field form interface)
  - `PatientHistorySearchParams` (filter criteria interface)
  - `InsuranceOption` (58-option dropdown interface)
- ✅ No `any` types without justification (except legacy code integration points)

**Evidence**: Technical context specifies TypeScript 5.x with strict mode. Spec references existing types pattern from Registration module (PatientFormValues interface).

### Principle V: Security & Compliance by Default ✅ PASS

**Compliance**:
- ✅ OAuth 2.0/OpenID Connect authentication via Medplum (inherited from platform)
- ✅ AccessPolicy-based access control: delete restricted to administrator role (FR-033)
- ✅ All FHIR queries use parameterized search (MedplumClient.searchResources)
- ✅ No secrets in code - insurance company list stored in database/configuration
- ✅ HIPAA compliance: PHI (personal ID, names) encrypted at rest/transit by Medplum platform

**Security Features**:
- Role-based permissions for edit/delete operations
- Luhn checksum validation prevents invalid personal IDs (FR-026)
- Server-side validation for all data operations (client-side for UX only)

**Evidence**: FR-033 requires admin-only deletion. Assumptions section confirms permission management configured. Medplum platform provides HIPAA-compliant infrastructure.

### Principle VI: Build Order & Dependency Management ✅ PASS

**Compliance**:
- ✅ Dependency hierarchy respected: @medplum/core → @medplum/fhirtypes → packages/app
- ✅ Turborepo handles build orchestration (inherited from monorepo)
- ✅ Workspace references used: `"@medplum/core": "workspace:*"` in package.json
- ✅ No circular dependencies introduced (patient history depends on registration, not vice versa)

**Evidence**: Technical context lists dependencies in correct order. CLAUDE.md documents monorepo structure with build commands (npm run build, npm run build:fast).

### Principle VII: Observability & Debugging ✅ PASS

**Compliance**:
- ✅ Structured logging via Medplum server (inherited)
- ✅ Error messages include context: "Personal ID validation failed for ID: [value]" (edge case handling)
- ✅ Database query tracing via Medplum's query logging (inherited)
- ✅ Status indicator displays record count: "ხაზზე (44)" = "44 records loaded" (FR-007)

**Debugging Features**:
- React DevTools support for component inspection
- Network tab visibility for FHIR API calls
- Console error logging for validation failures
- Green highlighting for visual debugging of debt calculation (FR-002)

**Evidence**: FR-007 requires status indicator. Spec defines 12 edge cases with specific error handling scenarios.

### Healthcare & Compliance Standards ✅ PASS

**HIPAA Compliance**:
- ✅ PHI encrypted at rest/transit (Medplum platform)
- ✅ Audit logs for data access (Medplum platform - Principle VII)
- ✅ MFA support (Medplum authentication)
- ✅ Data retention configurable (Medplum project settings)

**FHIR Conformance**:
- ✅ Validation against FHIR R4 schema (MedplumClient)
- ✅ Search parameters per FHIR specification (FR-009 through FR-015)
- ✅ Extensions follow FHIR guidelines (Georgian personal ID as identifier with system URI)

**Evidence**: Assumptions section confirms Medplum provides FHIR R4 compliant resources. References section links to FHIR R4 Encounter, Patient, Coverage specs.

### Testing Gates ✅ PASS

**Coverage Requirements**:
- ✅ Unit tests >80% for new service code (patientHistoryService.ts, validators.ts)
- ✅ Integration tests for FHIR endpoint changes (search, filter, edit, delete)
- ✅ End-to-end tests for user-facing workflows (7 user stories = 7 E2E test suites)

**Test Plan**:
- 34 acceptance scenarios → 34 test cases minimum
- Edge cases (12 defined) → 12 additional test cases
- Visual regression tests for green highlighting (debt > 0)
- Performance tests for 100-visit table load (<3 seconds)

### Documentation Requirements ✅ PASS

**Documentation Deliverables**:
- ✅ FHIR resource usage examples in research.md (Phase 0)
- ✅ React component stories (PatientHistoryView.stories.tsx, VisitEditModal.stories.tsx)
- ✅ API changes documented in data-model.md and contracts/ (Phase 1)
- ✅ Comprehensive spec.md with references to 11 original EMR documentation files

**Evidence**: Spec includes extensive References section with 11 documentation files, FHIR specs, technical references, and business context.

### Constitution Compliance Summary

**Status**: ✅ **ALL GATES PASSED** - No violations. Ready for Phase 0 research.

**No Complexity Tracking Violations**: All 7 core principles and 4 standards categories complied with. No justifications needed in Complexity Tracking section.

**Re-evaluation Required**: After Phase 1 design (data-model.md and contracts/) to confirm implementation design maintains compliance.

## Project Structure

### Documentation (this feature)

```text
specs/001-patient-history-page/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 output (technology choices, patterns, decisions)
├── data-model.md        # Phase 1 output (FHIR resource mappings, entities)
├── quickstart.md        # Phase 1 output (setup, development, testing guide)
├── contracts/           # Phase 1 output (TypeScript interfaces, FHIR search params)
│   ├── visit-search.contract.ts
│   ├── visit-edit.contract.ts
│   └── insurance-options.contract.ts
├── checklists/          # Validation checklists
│   └── requirements.md  # Specification quality checklist (complete - 16/16 passed)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

This feature is implemented within the **Medplum monorepo** structure (packages/app - EMR module):

```text
packages/app/src/emr/
├── views/
│   └── patient-history/
│       ├── PatientHistoryView.tsx              # Main view (table + filters integrated)
│       ├── PatientHistoryView.test.tsx         # Component tests (7 user stories)
│       └── PatientHistoryView.stories.tsx      # Storybook stories
│
├── components/
│   └── patient-history/
│       ├── PatientHistoryTable.tsx             # 10-column table with sort/click
│       ├── PatientHistoryTable.test.tsx
│       ├── PatientHistoryFilters.tsx           # Insurance dropdown + search fields
│       ├── PatientHistoryFilters.test.tsx
│       ├── VisitEditModal.tsx                  # 134-element edit form
│       ├── VisitEditModal.test.tsx
│       ├── InsuranceSelect.tsx                 # 58-option multilingual dropdown
│       ├── InsuranceSelect.test.tsx
│       ├── VisitStatusBadge.tsx                # Visual debt indicators
│       └── VisitStatusBadge.test.tsx
│
├── services/
│   ├── patientHistoryService.ts                # FHIR Encounter CRUD operations
│   ├── patientHistoryService.test.ts
│   ├── insuranceService.ts                     # Coverage resource management
│   ├── insuranceService.test.ts
│   ├── visitSearchService.ts                   # Search/filter logic
│   ├── visitSearchService.test.ts
│   └── validators.ts                           # Luhn checksum, date validation (reuse from Registration)
│
├── hooks/
│   ├── usePatientHistory.ts                    # Table data, search, pagination state
│   ├── usePatientHistory.test.ts
│   ├── useVisitEdit.ts                         # Edit form state management
│   └── useVisitEdit.test.ts
│
├── types/
│   └── patient-history.ts                      # TypeScript interfaces
│       ├── VisitFormValues
│       ├── PatientHistorySearchParams
│       ├── InsuranceOption
│       ├── VisitTableRow
│       └── FinancialSummary
│
├── translations/
│   ├── ka.json                                 # Georgian translations
│   ├── en.json                                 # English translations
│   └── ru.json                                 # Russian translations
│
└── EMRPage.tsx                                 # Routes updated for patient-history

Shared with existing EMR components:
├── hooks/
│   └── useTranslation.ts                       # Reuse existing multilingual hook
├── styles/
│   └── theme.css                               # Reuse existing EMR theme (turquoise gradients)
└── components/
    ├── TopNavBar/                              # Reuse from 003-emr-ui-layout
    ├── EMRMainMenu/                            # Reuse from 003-emr-ui-layout
    ├── HorizontalSubMenu/                      # Reuse from 003-emr-ui-layout
    └── LanguageSelector/                       # Reuse from 003-emr-ui-layout
```

**Structure Decision**:

This feature follows the **existing Medplum monorepo pattern** established by the Registration module (004-fhir-registration-implementation) and EMR UI Layout (003-emr-ui-layout). The patient history feature is a new **view** within the EMR app (`packages/app/src/emr/views/patient-history/`) with dedicated components, services, and hooks organized by function.

Key structural principles:
1. **Views** contain page-level components (`PatientHistoryView.tsx`)
2. **Components** contain reusable UI pieces specific to this feature (`PatientHistoryTable.tsx`, `VisitEditModal.tsx`)
3. **Services** contain FHIR resource operations and business logic (`patientHistoryService.ts`)
4. **Hooks** contain React state management and side effects (`usePatientHistory.ts`, `useVisitEdit.ts`)
5. **Types** contain TypeScript interfaces shared across the feature
6. **Translations** contain multilingual text for ka/en/ru languages

This structure enables:
- Independent testing at every layer (views, components, services, hooks)
- Clear separation of concerns (UI vs business logic vs data access)
- Reuse of existing EMR infrastructure (navigation, translations, theme)
- Incremental development following P1-P7 user story priorities

## Complexity Tracking

**Status**: No violations. This section intentionally left empty per Constitution Check results.

All 7 core principles complied with. No simpler alternatives rejected.
