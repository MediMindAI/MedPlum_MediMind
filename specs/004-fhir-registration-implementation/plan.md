# Implementation Plan: FHIR-Based Patient Registration System

**Branch**: `004-fhir-registration-implementation` | **Date**: 2025-11-12 | **Spec**: [spec.md](./spec.md)

---

## Summary

Build a FHIR R4-compliant patient registration system that bridges legacy Georgian hospital EMR data structures to Medplum's healthcare platform. The system provides multilingual patient registration (Georgian/English/Russian) with comprehensive demographics capture, duplicate detection, representative/guardian management, emergency "unknown patient" workflows, and integration with the existing EMR UI layout. All patient data maps to standard FHIR Patient and RelatedPerson resources with Georgian-specific extensions for patronymic, citizenship (250 countries), and workplace information.

**Key Deliverables**:
- Patient search and list view with filtering (firstname, lastname, personal ID, registration number)
- New patient registration form with FHIR Patient resource creation
- Patient update/edit capabilities
- Representative/RelatedPerson management for minors and guardians
- Georgian personal ID validation (11-digit checksum)
- Duplicate patient detection via FHIR search API
- Emergency unknown patient registration workflow
- Citizenship dropdown (250 countries with Georgian translations)
- Integration with EMR UI Layout (Feature 003) at `/emr/registration` route

---

## Technical Context

**Language/Version**: TypeScript 5.3 (strict mode), React 19
**Primary Dependencies**:
- `@medplum/core@^3.0.0` - FHIR client and resource operations
- `@medplum/fhirtypes@^3.0.0` - FHIR R4 TypeScript definitions
- `@medplum/react@^3.0.0` - Medplum React hooks (useMedplum)
- `@mantine/core@^7.0.0` - UI component library (forms, tables, modals)
- `@mantine/form@^7.0.0` - Form state management and validation
- `@mantine/notifications@^7.0.0` - User feedback notifications
- `react-router-dom@^6.20.0` - Routing and navigation

**Storage**: PostgreSQL (via Medplum FHIR server) - All patient data stored as FHIR resources
**Testing**: Jest + React Testing Library (unit, integration), MockClient from `@medplum/mock`
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge) - Desktop-optimized, responsive design not prioritized
**Project Type**: Web application (monorepo package) - Frontend React app within Medplum monorepo
**Performance Goals**:
- Patient search results < 2 seconds for 100k records
- Duplicate detection < 1 second
- Form validation < 100ms response time
- Page load < 3 seconds on 3G connection

**Constraints**:
- Georgian Unicode support required (U+10A0 to U+10FF character range)
- 11-digit personal ID validation with checksum algorithm
- FHIR R4 conformance for all resource operations
- Integration with existing EMR translation system (ka/en/ru)
- Must use Mantine form patterns for consistency with Medplum UI

**Scale/Scope**:
- Expected patient database: 100,000+ records
- Concurrent users: 50-100 registration staff
- 8 registration views (1 implemented this phase, 7 deferred)
- 250 citizenship options, 11 relationship types
- 30+ form fields per patient registration

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ FHIR-First Architecture (Principle I)
**Status**: PASS
- All patient data uses FHIR R4 Patient and RelatedPerson resources
- Resources strongly typed via `@medplum/fhirtypes`
- MedplumClient used for all FHIR operations (search, create, read, update)
- Custom extensions follow FHIR extension guidelines
- No violations

### ✅ Package-Based Modularity (Principle II)
**Status**: PASS
- Implementation contained within `packages/app` (existing package)
- New views/components under `packages/app/src/emr/` namespace
- No new packages created (uses existing app package)
- Dependencies declared in existing `packages/app/package.json`
- No violations

### ✅ Test-First Development (Principle III - NON-NEGOTIABLE)
**Status**: PASS
- All services, validators, and utilities require colocated tests
- Form components require React Testing Library tests
- FHIR operations require integration tests using MockClient
- Target: >80% code coverage for new code
- Test structure: `filename.test.ts` next to `filename.ts`
- No violations

### ✅ Type Safety & Strict Mode (Principle IV)
**Status**: PASS
- TypeScript strict mode enabled (inherited from monorepo)
- All FHIR resources use generated `@medplum/fhirtypes`
- No `any` types without justification
- Form values strongly typed via TypeScript interfaces
- No violations

### ✅ Security & Compliance by Default (Principle V)
**Status**: PASS
- Authentication via existing Medplum OAuth 2.0/SMART-on-FHIR
- Access control enforced through Medplum AccessPolicy resources
- All FHIR API operations use parameterized queries (built into Medplum)
- No secrets in code (Medplum configuration via environment variables)
- PHI (Protected Health Information) encrypted at rest and in transit (Medplum server responsibility)
- No violations

### ✅ Build Order & Dependency Management (Principle VI)
**Status**: PASS
- Registration views depend on `@medplum/core`, `@medplum/react`, `@medplum/fhirtypes`
- All dependencies are existing packages (no new internal dependencies)
- Turborepo handles build orchestration (no changes needed)
- No circular dependencies introduced
- No violations

### ✅ Observability & Debugging (Principle VII)
**Status**: PASS
- All FHIR operations include error logging to console
- Form validation errors displayed via Mantine notifications
- React DevTools compatible (standard React components)
- Medplum FHIR server provides structured logging and audit trails
- No violations

### Constitution Summary

**Overall Status**: ✅ **ALL GATES PASSED**

No constitution violations detected. The feature implementation follows all core principles:
- Uses FHIR resources exclusively
- No new packages created (uses existing `packages/app`)
- Test-first development enforced
- TypeScript strict mode with FHIR type safety
- Security via Medplum authentication and access control
- No dependency management changes needed
- Observable via standard logging and React DevTools

**Re-check after Phase 1**: ✅ PASSED (no design changes violate constitution)

---

## Complexity Tracking

No complexity violations to justify. All constitution checks passed without needing simpler alternatives.

---

## Project Structure

### Documentation (this feature)

```
specs/004-fhir-registration-implementation/
├── spec.md                  # Feature specification (User stories, requirements, success criteria)
├── plan.md                  # This file (Implementation plan)
├── research.md              # Phase 0 output (Technology choices, FHIR patterns)
├── data-model.md            # Phase 1 output (FHIR resource structures, mappings)
├── quickstart.md            # Phase 1 output (Developer guide)
├── contracts/               # Phase 1 output (API contracts)
│   └── patient-api.md       # FHIR REST API endpoints
├── checklists/              # Specification validation
│   └── requirements.md      # Spec quality checklist
└── tasks.md                 # Phase 2 output (/speckit.tasks command - NOT YET CREATED)
```

### Source Code (Medplum Monorepo)

```
packages/app/
├── src/
│   ├── emr/
│   │   ├── views/
│   │   │   └── registration/
│   │   │       ├── PatientRegistrationView.tsx       # New patient registration form
│   │   │       ├── PatientRegistrationView.test.tsx  # Unit tests
│   │   │       ├── PatientListView.tsx               # Patient search and list
│   │   │       ├── PatientListView.test.tsx
│   │   │       ├── PatientEditView.tsx               # Edit existing patient
│   │   │       ├── PatientEditView.test.tsx
│   │   │       ├── UnknownPatientView.tsx            # Emergency registration
│   │   │       └── UnknownPatientView.test.tsx
│   │   │
│   │   ├── components/
│   │   │   └── registration/
│   │   │       ├── PatientForm.tsx                   # Reusable patient form component
│   │   │       ├── PatientForm.test.tsx
│   │   │       ├── RepresentativeForm.tsx            # Representative/relative form
│   │   │       ├── RepresentativeForm.test.tsx
│   │   │       ├── PatientTable.tsx                  # Patient list table
│   │   │       ├── PatientTable.test.tsx
│   │   │       ├── DuplicateWarningModal.tsx         # Duplicate detection UI
│   │   │       ├── DuplicateWarningModal.test.tsx
│   │   │       ├── CitizenshipSelect.tsx             # Citizenship dropdown
│   │   │       ├── CitizenshipSelect.test.tsx
│   │   │       ├── RelationshipSelect.tsx            # Relationship type dropdown
│   │   │       └── RelationshipSelect.test.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── usePatientForm.ts                     # Patient form state management
│   │   │   ├── usePatientForm.test.ts
│   │   │   ├── usePatientSearch.ts                   # Search and pagination
│   │   │   ├── usePatientSearch.test.ts
│   │   │   ├── useRepresentative.ts                  # Representative management
│   │   │   └── useRepresentative.test.ts
│   │   │
│   │   ├── services/
│   │   │   ├── patientService.ts                     # FHIR Patient operations
│   │   │   ├── patientService.test.ts
│   │   │   ├── representativeService.ts              # FHIR RelatedPerson operations
│   │   │   ├── representativeService.test.ts
│   │   │   ├── validators.ts                         # Georgian ID validation
│   │   │   └── validators.test.ts
│   │   │
│   │   ├── types/
│   │   │   └── registration.ts                       # TypeScript interfaces for forms
│   │   │
│   │   └── translations/
│   │       ├── citizenship.json                      # 250 country codes (ka/en/ru)
│   │       ├── ka.json                               # Georgian translations (extended)
│   │       ├── en.json                               # English translations (extended)
│   │       └── ru.json                               # Russian translations (extended)
│   │
│   └── AppRoutes.tsx                                  # Add /emr/registration routes
│
└── package.json                                       # No new dependencies (all existing)
```

**Structure Decision**: Selected **Monorepo Package Extension** pattern.
- Extends existing `packages/app` with new EMR registration views
- Follows established EMR module structure from Feature 003 (EMR UI Layout)
- Reuses translation system, hooks, and theme from `packages/app/src/emr/`
- No new packages required (registration is a feature within EMR app module)
- Colocated tests follow Medplum convention (`filename.test.tsx` next to `filename.tsx`)

**Integration Points**:
- **EMRPage.tsx**: Registration views render within 4-row layout at `/emr/registration` route
- **menu-structure.ts**: Registration sub-menu items (9 items, only "რეგისტრაცია" implemented this phase)
- **AppRoutes.tsx**: Add nested routes under `/emr/registration` for list, create, edit, unknown views
- **useTranslation hook**: Reuse existing translation system for multilingual support
- **theme.css**: Use existing EMR CSS custom properties for consistent styling

---

## Phase 0: Research Artifacts

**Status**: ✅ Complete

All technical decisions documented in [research.md](./research.md):

1. **FHIR Resource Mapping**: Patient and RelatedPerson resources with Georgian extensions
2. **Georgian Personal ID Validation**: 11-digit checksum algorithm (Luhn variant)
3. **Citizenship Data Management**: ISO 3166-1 codes with Georgian translations (250 countries)
4. **Duplicate Detection Strategy**: Search-before-create using FHIR search API
5. **Relationship Type Mapping**: HL7 v3 RoleCode with Georgian terminology
6. **Form State Management**: Mantine form hooks with custom FHIR validators
7. **Patient List Performance**: Server-side pagination with client caching
8. **Emergency Unknown Patient Workflow**: Conditional requirements with temporary identifiers
9. **Testing Strategy**: Three-layer testing (unit, integration, contract)
10. **Multilingual Support**: Integration with existing EMR translation system

---

## Phase 1: Design Artifacts

**Status**: ✅ Complete

### Data Model ([data-model.md](./data-model.md))

Comprehensive FHIR resource structures including:
- **Patient Resource**: Complete structure with identifiers, name, demographics, contact, address, extensions
- **RelatedPerson Resource**: Representative/guardian relationships with HL7 v3 RoleCode mappings
- **ValueSets**: Citizenship codes (250 countries), relationship types (11 relationships), gender codes
- **Extensions**: Patronymic, citizenship, workplace, unknown-patient, arrival-datetime, relationship-side
- **Validation Rules**: Business constraints, referential integrity, cascade behavior
- **Search Parameters**: Optimized queries for patient lists and representative lookups
- **Data Migration**: Legacy EMR to FHIR transformation patterns

### API Contracts ([contracts/patient-api.md](./contracts/patient-api.md))

FHIR REST API operations documented:
- **Patient Operations**: Search, Create, Read, Update, Delete (soft)
- **RelatedPerson Operations**: Search by patient, Create representative
- **Query Parameters**: Pagination, sorting, filtering by identifier/name/birthdate
- **Error Responses**: Validation errors, duplicate conflicts, authorization failures
- **Client SDK Examples**: TypeScript code using `@medplum/core` MedplumClient

### Developer Quickstart ([quickstart.md](./quickstart.md))

Developer guide covering:
- **Setup**: Development environment, file structure
- **Creating Forms**: PatientForm component with validation example
- **FHIR Services**: createPatient, checkDuplicatePatient implementation
- **Testing**: Jest test examples with MockClient
- **Common Patterns**: Loading citizenship data, extracting FHIR values
- **Troubleshooting**: Georgian character encoding, duplicate detection, form validation

---

## Next Steps

1. **Run `/speckit.tasks`** to generate detailed task breakdown in `tasks.md`
2. **Execute tasks** following priority order (P1 → P2 → P3 from spec.md user stories)
3. **Implement MVP**: Focus on User Story 1 (Patient Search/List) and User Story 2 (New Patient Registration) first
4. **Test continuously**: Write tests before implementation per Constitution Principle III
5. **Integrate**: Ensure registration views render correctly within EMR UI Layout (Feature 003)

---

**Plan Completed**: 2025-11-12
**Ready for**: Task generation (`/speckit.tasks`)
**Documentation**: All Phase 0 and Phase 1 artifacts generated
**Constitution Compliance**: ✅ ALL GATES PASSED
