# Implementation Plan: Hospital Account Management Dashboard

**Branch**: `005-account-management` | **Date**: 2025-11-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-account-management/spec.md`

## Summary

Build a comprehensive account management dashboard for hospital administrators to create, manage, and monitor user accounts for all hospital roles (physicians, nurses, technicians, etc.). The system leverages FHIR R4 resources (Practitioner, PractitionerRole, AccessPolicy) and Medplum infrastructure to provide role-based access control, audit logging, and multi-role assignment capabilities. Core MVP functionality includes account creation with role assignment, accessible through the right-side administrative menu in the existing EMR layout.

## Technical Context

**Language/Version**: TypeScript 5.x (existing monorepo standard)
**Primary Dependencies**:
- Frontend: React 19, Mantine UI, @medplum/react, @medplum/react-hooks
- Backend: @medplum/core, @medplum/fhirtypes, Medplum FHIR Server
- Authentication: Medplum OAuth 2.0 / OpenID Connect
**Storage**: PostgreSQL (FHIR resources stored as JSONB) via Medplum Server
**Testing**: Jest (unit/integration), @medplum/mock (MockClient for FHIR testing)
**Target Platform**: Web application (desktop + tablet + mobile responsive)
**Project Type**: Web (frontend React components + FHIR backend integration)
**Performance Goals**:
- Account creation: < 2 seconds end-to-end
- Search response: < 1 second for 10,000 accounts
- Support 500+ concurrent admin users
**Constraints**:
- Must work within existing EMR 4-row layout
- Mobile-first responsive design required
- Multilingual (Georgian/English/Russian) required
- HIPAA compliance for audit logging
- No breaking changes to existing authentication system
**Scale/Scope**:
- Initial deployment: ~200-500 user accounts
- Design for: 10,000+ user accounts
- 7 user stories (P1-P3 prioritization)
- ~15-20 React components
- 8-10 FHIR service functions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. FHIR-First Architecture
**Status**: PASS
- Uses Practitioner resource for user accounts
- Uses PractitionerRole for role assignments and medical specialties
- Uses AccessPolicy for permission management
- Uses Organization for departments and locations
- Uses AuditEvent for audit logging
- All data operations go through Medplum FHIR API

### ✅ II. Package-Based Modularity
**Status**: PASS
- Feature implemented within existing `packages/app` package
- Uses existing packages: `@medplum/core`, `@medplum/fhirtypes`, `@medplum/react`, `@medplum/react-hooks`
- Clear component boundaries: views/, components/, services/, hooks/, types/
- No new packages required

### ✅ III. Test-First Development
**Status**: PASS (enforced in tasks phase)
- All components will have `.test.tsx` colocated tests
- All services will have `.test.ts` colocated tests
- MockClient from `@medplum/mock` used for FHIR testing
- Integration tests for account creation workflow
- Target: >80% code coverage for new code

### ✅ IV. Type Safety & Strict Mode
**Status**: PASS
- TypeScript strict mode already enabled in monorepo
- All FHIR resources use types from `@medplum/fhirtypes`
- Custom types defined in `types/account-management.ts`
- No use of `any` without justification

### ✅ V. Security & Compliance by Default
**Status**: PASS
- Leverages existing Medplum OAuth 2.0 authentication
- AccessPolicy resources control feature access
- All input validation and sanitization required (FR-037)
- Audit logging for all privileged operations (FR-030)
- HIPAA compliance through AuditEvent resources
- No secrets in code (uses Medplum server configuration)

### ✅ VI. Build Order & Dependency Management
**Status**: PASS
- Feature builds as part of `packages/app` (depends on core, fhirtypes, react packages)
- Uses workspace references: `@medplum/core`, `@medplum/fhirtypes`, etc.
- Turborepo handles build orchestration
- No circular dependencies introduced

### ✅ VII. Observability & Debugging
**Status**: PASS
- Server-side operations logged by Medplum server (structured logging)
- AuditEvent resources provide complete audit trail
- Client-side errors caught and logged
- MedplumClient provides request tracing
- Error messages include actionable context for users

### Healthcare & Compliance Standards
**Status**: PASS
- HIPAA: AuditEvent resources for all account operations
- Audit logs retained 7+ years (server configuration)
- RBAC through AccessPolicy resources
- PHI encrypted at rest/transit (Medplum platform)
- MFA supported (Medplum platform)

### Development Workflow Gates
**Status**: PENDING (enforced in tasks phase)
- Jest tests required for all new code
- ESLint + Prettier configured in monorepo
- Storybook stories for reusable components
- Documentation in CLAUDE.md updated
- >80% code coverage target

## Project Structure

### Documentation (this feature)

```text
specs/005-account-management/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (in progress)
├── research.md          # Phase 0 output (to be generated)
├── data-model.md        # Phase 1 output (to be generated)
├── quickstart.md        # Phase 1 output (to be generated)
├── contracts/           # Phase 1 output (to be generated)
│   ├── account-api.yaml         # FHIR resource operations
│   └── permission-model.yaml    # AccessPolicy structure
├── checklists/
│   └── requirements.md  # Quality validation (completed)
└── tasks.md             # Phase 2 output (/speckit.tasks - NOT YET)
```

### Source Code (repository root)

```text
packages/app/src/emr/
├── views/account-management/
│   ├── AccountManagementView.tsx          # Main dashboard (P1)
│   ├── AccountManagementView.test.tsx
│   ├── AccountManagementView.stories.tsx
│   ├── AccountCreateView.tsx              # Account creation page (P1)
│   ├── AccountCreateView.test.tsx
│   ├── AccountEditView.tsx                # Account editing page (P1)
│   └── AccountEditView.test.tsx
│
├── components/account-management/
│   ├── AccountForm.tsx                    # Main account form (P1)
│   ├── AccountForm.test.tsx
│   ├── AccountTable.tsx                   # Account list table (P1)
│   ├── AccountTable.test.tsx
│   ├── AccountSearchFilters.tsx           # Search and filter UI (P3)
│   ├── AccountSearchFilters.test.tsx
│   ├── RoleSelector.tsx                   # Multi-role selection (P2)
│   ├── RoleSelector.test.tsx
│   ├── SpecialtySelect.tsx                # Medical specialty dropdown (P2)
│   ├── SpecialtySelect.test.tsx
│   ├── DepartmentSelect.tsx               # Department multi-select (P3)
│   ├── DepartmentSelect.test.tsx
│   ├── LocationSelect.tsx                 # Location multi-select (P3)
│   ├── LocationSelect.test.tsx
│   ├── AccountStatusBadge.tsx             # Status indicator (P1)
│   ├── AccountStatusBadge.test.tsx
│   ├── AccountEditModal.tsx               # Quick edit modal (P1)
│   ├── AccountEditModal.test.tsx
│   ├── AccountDeactivateModal.tsx         # Deactivation confirmation (P2)
│   ├── AccountDeactivateModal.test.tsx
│   ├── PermissionMatrix.tsx               # Permission configuration UI (P2)
│   ├── PermissionMatrix.test.tsx
│   ├── AuditLogViewer.tsx                 # Audit log display (P3)
│   └── AuditLogViewer.test.tsx
│
├── services/
│   ├── accountService.ts                  # Practitioner CRUD operations (P1)
│   ├── accountService.test.ts
│   ├── roleService.ts                     # PractitionerRole management (P2)
│   ├── roleService.test.ts
│   ├── permissionService.ts               # AccessPolicy management (P2)
│   ├── permissionService.test.ts
│   ├── departmentService.ts               # Organization (department) operations (P3)
│   ├── departmentService.test.ts
│   ├── auditService.ts                    # AuditEvent operations (P3)
│   ├── auditService.test.ts
│   ├── accountValidators.ts               # Validation functions (P1)
│   ├── accountValidators.test.ts
│   └── accountHelpers.ts                  # FHIR data extraction utilities (P1)
│
├── hooks/
│   ├── useAccountForm.ts                  # Form state management (P1)
│   ├── useAccountForm.test.tsx
│   ├── useAccountList.ts                  # Account list with pagination/search (P1)
│   ├── useAccountList.test.tsx
│   ├── useRoleManagement.ts               # Multi-role state management (P2)
│   ├── useRoleManagement.test.tsx
│   └── usePermissions.ts                  # Permission checking utilities (P2)
│
├── types/
│   └── account-management.ts              # TypeScript interfaces
│
├── translations/
│   ├── account-roles.json                 # Role translations (ka/en/ru)
│   ├── medical-specialties.json           # Specialty translations
│   ├── departments.json                   # Department translations
│   └── permissions.json                   # Permission translations
│
└── sections/
    └── AccountManagementSection.tsx       # Section wrapper (routing)

packages/app/src/emr/
├── EMRPage.tsx                            # Add "Account Management" to TopNavBar menu
└── translations/
    ├── ka.json                            # Add account management keys
    ├── en.json                            # Add account management keys
    └── ru.json                            # Add account management keys
```

**Structure Decision**: Web application structure within existing `packages/app/src/emr/` monorepo package. Follows established EMR patterns:
- Views for page-level components (routing targets)
- Components for reusable UI elements
- Services for FHIR API interactions
- Hooks for state management and data fetching
- Types for TypeScript interfaces
- Translations for multilingual support
- Sections for route organization

Aligns with existing features: Registration, Patient History, Nomenclature

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: No violations. All constitution principles satisfied by design.

## Phase 0: Research & Technical Discovery

### Research Tasks

The following technical decisions require research to determine best implementation approach:

#### R1: Medplum AccessPolicy Structure for Hospital RBAC
**Question**: How should we structure AccessPolicy resources to support:
- Multiple roles per user (union of permissions)
- Department-based data access restrictions
- Location-based access control
- Custom role creation with permission inheritance

**Research Goals**:
- Review Medplum AccessPolicy documentation and examples
- Determine if AccessPolicy should be per-user, per-role, or hybrid
- Understand permission evaluation order and conflict resolution
- Identify best practices for complex permission scenarios (multi-role users)

**Deliverable**: AccessPolicy data model and permission evaluation strategy

#### R2: FHIR Resource Mapping for User Accounts
**Question**: What is the optimal FHIR resource structure for:
- User account (Practitioner vs Person vs User?)
- Role assignments (PractitionerRole with multiple instances?)
- Medical specialties (PractitionerRole.specialty vs extension?)
- Department membership (PractitionerRole.organization?)
- Account status (Practitioner.active vs custom extension?)

**Research Goals**:
- Review FHIR R4 Practitioner and PractitionerRole resource definitions
- Examine existing Medplum examples and patterns
- Understand relationship between Practitioner, PractitionerRole, Organization
- Determine how to represent inactive/deactivated accounts

**Deliverable**: Complete FHIR resource mapping for all entities (data-model.md)

#### R3: Medplum Authentication Integration
**Question**: How do we integrate with Medplum's authentication system for:
- Creating login credentials for new accounts
- Setting initial passwords and password policies
- Sending welcome emails with activation links
- Handling email verification workflow
- Managing account activation status

**Research Goals**:
- Review Medplum authentication API endpoints
- Understand User vs Practitioner relationship
- Determine if we create User resource or use Medplum API
- Identify email notification mechanisms (ProjectMembership?)

**Deliverable**: Authentication integration approach and API usage patterns

#### R4: Audit Logging with FHIR AuditEvent
**Question**: How to implement comprehensive audit logging using AuditEvent resource:
- What AuditEvent.type and AuditEvent.subtype codes to use?
- How to structure AuditEvent.entity for account operations?
- How to query audit logs efficiently (search parameters)?
- How to ensure immutability and 7-year retention?

**Research Goals**:
- Review FHIR AuditEvent resource structure
- Examine Medplum audit logging capabilities
- Determine event codes for account operations (create, update, deactivate, etc.)
- Understand AuditEvent search and filtering capabilities

**Deliverable**: Audit logging implementation pattern with example AuditEvent structures

#### R5: Performance Optimization for Large Account Lists
**Question**: How to achieve <1 second search response for 10,000+ accounts:
- Pagination strategy with FHIR search
- Search parameter optimization (name, email, role filtering)
- Caching strategy for role/department lookups
- Database indexing recommendations (if applicable)

**Research Goals**:
- Review Medplum search performance best practices
- Understand FHIR search parameter chaining
- Identify pagination approach (_count, _offset vs cursor-based)
- Determine if client-side caching is needed for reference data

**Deliverable**: Performance optimization strategy with concrete implementation guidance

#### R6: Right-Side Menu Integration
**Question**: How to add "Account Management" to the existing EMR right-side TopNavBar menu:
- Where is TopNavBar menu structure defined?
- How to conditionally show menu item (admin-only)?
- How to integrate with routing and permission checking?
- Do translations already exist or need to be added?

**Research Goals**:
- Examine existing TopNavBar component implementation
- Understand menu item data structure and permission model
- Review similar admin-only menu items (if any exist)
- Identify translation key locations

**Deliverable**: Menu integration implementation steps and code references

#### R7: Mobile-Responsive Form Design Patterns
**Question**: What are best practices for mobile-responsive account management forms:
- Form layout strategies (single column on mobile, multi-column on desktop)
- Multi-select components for roles, departments, locations
- Table design for mobile (horizontal scroll vs card view)
- Touch-friendly interaction patterns

**Research Goals**:
- Review existing EMR forms for responsive patterns (Registration, Patient History)
- Examine Mantine responsive utilities and breakpoints
- Understand EMR mobile-first design principles
- Identify reusable responsive components

**Deliverable**: Responsive design guidelines with code examples from existing features

#### R8: Email Service Integration for Account Notifications
**Question**: How does Medplum handle email notifications:
- Is there a built-in email service?
- How to configure SMTP or email API?
- Are there email templates for account activation?
- What happens if email service is unavailable?

**Research Goals**:
- Review Medplum email configuration and capabilities
- Understand Bot framework for email workflows (if applicable)
- Identify error handling patterns for email failures
- Determine if we need custom email templates

**Deliverable**: Email notification implementation approach with fallback strategies

### Research Output Location

All research findings will be consolidated in: `specs/005-account-management/research.md`

## Phase 1: Data Model & API Contracts

### Prerequisites
- `research.md` complete with all R1-R8 questions answered

### Data Model (data-model.md)

Will include detailed entity definitions with FHIR resource mappings:

1. **User Account** → Practitioner resource
   - Fields: name, email, phone, status, identifiers
   - Relationships: PractitionerRole (1-to-many), Organization (through PractitionerRole)
   - Validation: email format, phone format, required fields

2. **Role Assignment** → PractitionerRole resource
   - Fields: role code, specialty, active period, organization reference
   - Relationships: Practitioner (many-to-one), Organization (many-to-one)
   - Validation: valid role codes, specialty codes

3. **Permission Policy** → AccessPolicy resource
   - Fields: resource type, compartment, access rules
   - Relationships: Practitioner or PractitionerRole
   - Validation: policy syntax, resource references

4. **Department** → Organization resource (type = dept)
   - Fields: name, identifier, type, active status
   - Relationships: PractitionerRole (1-to-many)

5. **Location** → Organization resource (type = location) or Location resource
   - Fields: name, address, identifier, type
   - Relationships: PractitionerRole

6. **Audit Log Entry** → AuditEvent resource
   - Fields: action, agent, entity, outcome, timestamp
   - Relationships: Practitioner (agent), Practitioner (entity for account operations)

7. **Medical Specialty** → CodeableConcept (PractitionerRole.specialty)
   - ValueSet: SNOMED CT or custom hospital specialties

### API Contracts (contracts/)

Will generate OpenAPI specifications for:

1. **Account Operations API** (`contracts/account-api.yaml`)
   - POST /Practitioner - Create account
   - GET /Practitioner?_id={id} - Read account
   - PUT /Practitioner/{id} - Update account
   - PATCH /Practitioner/{id} - Deactivate account (set active=false)
   - DELETE /Practitioner/{id} - Hard delete account
   - GET /Practitioner?name={name}&active=true - Search accounts

2. **Role Management API** (`contracts/role-api.yaml`)
   - POST /PractitionerRole - Assign role
   - GET /PractitionerRole?practitioner={id} - Get user roles
   - DELETE /PractitionerRole/{id} - Remove role
   - PUT /PractitionerRole/{id} - Update role (specialty, organization)

3. **Permission Policy API** (`contracts/permission-api.yaml`)
   - POST /AccessPolicy - Create policy
   - GET /AccessPolicy?resource={Practitioner id} - Get user policies
   - PUT /AccessPolicy/{id} - Update policy
   - DELETE /AccessPolicy/{id} - Remove policy

4. **Audit Log API** (`contracts/audit-api.yaml`)
   - POST /AuditEvent - Create audit log (automatic)
   - GET /AuditEvent?entity={Practitioner id} - Get account audit history
   - GET /AuditEvent?agent={Practitioner id} - Get admin activity

### Quickstart Guide (quickstart.md)

Will provide developer onboarding with:

1. **Setup Instructions**
   - Install dependencies (already in monorepo)
   - Run development server
   - Access account management dashboard

2. **Key Workflows**
   - Create a test admin account
   - Navigate to Account Management
   - Create a practitioner account with role
   - Test permission enforcement

3. **Testing Commands**
   - Run account management tests: `npm test -- account-management`
   - Run specific test: `npm test -- AccountForm.test.tsx`
   - Generate coverage report

4. **Common Patterns**
   - Using MedplumClient to create Practitioner
   - Extracting data from FHIR resources
   - Using useAccountForm hook
   - Testing with MockClient

5. **Troubleshooting**
   - Common errors and solutions
   - Debugging permission issues
   - Email notification problems

### Agent Context Update

After Phase 1 completion, run:
```bash
.specify/scripts/bash/update-agent-context.sh claude
```

This will:
- Update `.claude/CLAUDE.md` with new section for Account Management Dashboard
- Add FHIR resource mappings (Practitioner, PractitionerRole, AccessPolicy)
- Document new file locations and testing patterns
- Preserve existing manual content

## Phase 2: Task Generation

**Status**: NOT STARTED (requires `/speckit.tasks` command)

The `/speckit.tasks` command will generate `tasks.md` with:
- Dependency-ordered implementation tasks
- Test-first tasks for each component
- Integration tasks for menu and routing
- Documentation tasks for CLAUDE.md updates

## Next Steps

1. ✅ **Phase 0**: Generate `research.md` by researching R1-R8 questions
2. ⏳ **Phase 1**: Generate `data-model.md`, `contracts/`, `quickstart.md`
3. ⏳ **Phase 1**: Update agent context with new technical information
4. ⏳ **Re-validate**: Constitution check post-design
5. ⏳ **Phase 2**: User runs `/speckit.tasks` to generate implementation tasks

## Risk Tracking

### Implementation Risks

**Risk 1: Permission Model Complexity**
- **Concern**: Multi-role permission union may create unexpected access patterns
- **Mitigation**: Research AccessPolicy evaluation in R1, implement permission preview tool
- **Status**: PENDING (Phase 0 research)

**Risk 2: Performance at Scale**
- **Concern**: Search may be slow with 10,000+ accounts
- **Mitigation**: Research pagination and caching in R5, implement incremental improvements
- **Status**: PENDING (Phase 0 research)

**Risk 3: Authentication Integration**
- **Concern**: Unclear how to create login credentials via Medplum API
- **Mitigation**: Research authentication workflow in R3, document workarounds if needed
- **Status**: PENDING (Phase 0 research)

**Risk 4: Email Delivery Reliability**
- **Concern**: Email failures may block account activation
- **Mitigation**: Research email service in R8, implement fallback (show activation link in UI)
- **Status**: PENDING (Phase 0 research)

## Dependencies Validation

### External Dependencies (from spec)
✅ Medplum Authentication System - Available (OAuth 2.0 / OpenID Connect)
✅ FHIR API - Available (Medplum server endpoints)
⏳ Email Service - Research required (R8)
✅ EMR Layout System - Available (TopNavBar integration needed)
⏳ Role Configuration - Will be defined in data model
✅ Translation System - Available (useTranslation hook exists)

### Internal Dependencies
✅ @medplum/core - Available in monorepo
✅ @medplum/fhirtypes - Available in monorepo
✅ @medplum/react - Available in monorepo
✅ @medplum/react-hooks - Available in monorepo
✅ @medplum/mock - Available for testing
✅ Mantine UI - Available in app package
✅ React 19 - Available in app package

## Success Criteria Validation

From spec.md, verifying all success criteria are achievable:

- **SC-001**: <2 min account creation → Form validation + FHIR create operation ✅
- **SC-002**: 500+ concurrent admins → Medplum server scalability (external) ✅
- **SC-003**: 95% first-try success → Form validation and error handling ✅
- **SC-004**: <1 sec search for 10k accounts → Pagination + indexing (R5 research) ⏳
- **SC-005**: Zero unauthorized access → AccessPolicy enforcement (R1 research) ⏳
- **SC-006**: 100% audit capture → AuditEvent for all operations (R4) ⏳
- **SC-007**: 60% time reduction → UI efficiency and automation ✅
- **SC-008**: <5 min login after creation → Authentication workflow (R3) ⏳
- **SC-009**: 90% easy-to-use rating → Mantine UI + responsive design ✅
- **SC-010**: 99.9% uptime → Medplum server SLA (external) ✅

**Verdict**: 6/10 immediately achievable, 4/10 require research validation in Phase 0

## Deliverables Checklist

### Phase 0 Deliverables
- [ ] research.md (R1-R8 answered with concrete technical decisions)

### Phase 1 Deliverables
- [ ] data-model.md (8 entities with FHIR mappings)
- [ ] contracts/account-api.yaml (Practitioner operations)
- [ ] contracts/role-api.yaml (PractitionerRole operations)
- [ ] contracts/permission-api.yaml (AccessPolicy operations)
- [ ] contracts/audit-api.yaml (AuditEvent operations)
- [ ] quickstart.md (developer onboarding guide)
- [ ] Updated .claude/CLAUDE.md (Account Management section)

### Phase 2 Deliverables (separate command)
- [ ] tasks.md (generated by `/speckit.tasks`)

## Planning Complete

This implementation plan provides:
- ✅ Complete technical context
- ✅ Constitution compliance validation
- ✅ Detailed project structure with file paths
- ✅ 8 research tasks to resolve technical unknowns
- ✅ Data model and API contract outlines
- ✅ Risk tracking and mitigation strategies
- ✅ Success criteria validation
- ✅ Clear next steps for Phase 0 and Phase 1

**Status**: Ready for Phase 0 research execution
**Next Command**: Continue with Phase 0 research task generation
