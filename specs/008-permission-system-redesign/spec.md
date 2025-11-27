# Feature Specification: Production-Ready Permission System Redesign

**Feature Branch**: `008-permission-system-redesign`
**Created**: 2025-11-27
**Status**: Draft
**Input**: User description: "Conduct full research on EMR permission system comparison, translate legacy permission logic to modern FHIR-based system with best practices, guidelines for production-ready healthcare application"

---

## Executive Summary

This specification outlines the redesign of MediMind's permission system to align with modern healthcare application standards while preserving the functional requirements discovered from the legacy SoftMedic EMR system. The goal is to create a production-ready, HIPAA-compliant, FHIR-native role-based access control (RBAC) system that balances security with usability.

---

## System Analysis

### Legacy SoftMedic EMR Permission Model

**Source**: Mapped from http://178.134.21.82:8008/ (Settings > Personnel > Permissions)

**Key Characteristics**:
- **534 granular permissions** organized in hierarchical tree structure
- **16 personnel types** (roles) with pre-assigned permission sets
- **4 root permission categories**: Main, HR, Reports, Records
- **UI-centric permissions** tied to specific buttons, tabs, and actions
- **Inheritance model**: Child permissions depend on parent permissions being enabled
- **Medical specialties**: 22 specialty categories for doctor sub-classification

**Legacy Personnel Types Mapped**:

| Code | Georgian | English | Default Page |
|------|----------|---------|--------------|
| owner | მფლობელი | Owner | - |
| externalOrg | გარე ორგანიზაცია | External Organization | - |
| admin | ადმინ | Admin | - |
| doctor | ექიმი | Doctor | Patient History |
| manager | მენეჯერი | Manager | - |
| operator | ოპერატორი | Operator | - |
| registrar | რეგისტრატორი | Registrar | - |
| laboratory | ლაბორატორია/დიაგნოსტიკა | Laboratory/Diagnostics | Laboratory |
| nurse | ექთანი | Nurse | Permissions |
| hrManager | კადრების მენეჯერი HR | HR Manager | - |
| seniorNurse | უფროსი ექთანი | Senior Nurse | - |
| pharmacyManager | აფთიაქსი გამგე | Pharmacy Manager | - |
| cashier | მოლარე | Cashier | - |
| viewAdmin | ადმინი ნახვის უფლებებით | View-Only Admin | - |
| accounting | ბუღალტერია | Accounting | - |

### Current MediMind Permission Model

**Location**: `packages/app/src/emr/services/permissionService.ts`

**Key Characteristics**:
- **~30 permissions** organized into 6 categories
- **FHIR AccessPolicy-based** resource-level permissions (CRUD + search)
- **Permission dependencies** auto-enable required parent permissions
- **Role conflict detection** for separation of duties
- **Combined permissions** from multiple roles using union logic
- **Multilingual support** (Georgian, English, Russian)

**Current Permission Categories**:
1. Patient Management (6 permissions)
2. Clinical Documentation (6 permissions)
3. Laboratory (4 permissions)
4. Billing & Financial (5 permissions)
5. Administration (9 permissions)
6. Reports (placeholder - 0 permissions)

**Current Role Types** (from `account-roles.json`):
- physician, nurse, technician, administrator, department-head
- pharmacist, lab-technician, radiologist, receptionist
- billing-specialist, therapist, anesthesiologist

---

## Gap Analysis: Legacy vs. Current System

### What the Legacy System Does Better

| Feature | Legacy | Current | Gap |
|---------|--------|---------|-----|
| Granularity | 534 permissions | ~30 permissions | Missing fine-grained control |
| UI Control | Button/tab level | Resource level | No UI-specific permissions |
| Personnel Types | 16 types | 12 types | Missing some roles |
| Inheritance | Parent-child hierarchy | Flat categories | No nested dependencies |
| Specialties | 22 medical specialties | Generic specialties | Less categorization |

### What the Current System Does Better

| Feature | Current | Legacy | Advantage |
|---------|---------|--------|-----------|
| FHIR Compliance | Native AccessPolicy | Custom implementation | Interoperability |
| Audit Trail | AuditEvent resources | Unknown | HIPAA compliance |
| Role Conflicts | Separation of duties detection | Manual | Security |
| Multi-role | Union of permissions | Single role | Flexibility |
| Multilingual | Full ka/en/ru | Georgian only | Accessibility |

### Critical Gaps to Address

1. **Missing fine-grained permissions** for specific UI actions (e.g., "delete payment", "edit old records")
2. **No time-based restrictions** (e.g., "edit records within 24 hours only")
3. **No department/location scoping** (e.g., "view only patients in my department")
4. **Missing sensitive data classifications** (e.g., mental health, HIV status)
5. **No emergency access workflow** ("break glass" scenario)

---

## User Scenarios & Testing

### User Story 1 - Role-Based Page Access (Priority: P1)

As a healthcare administrator, I want to assign roles to staff members so that they can only access pages and features appropriate to their job function.

**Why this priority**: Core functionality - without this, the entire permission system is non-functional. This enables basic access control for HIPAA compliance.

**Independent Test**: Can be fully tested by creating a user with the "Nurse" role and verifying they cannot access the "Financial Reports" page.

**Acceptance Scenarios**:

1. **Given** a user with "Physician" role, **When** they log in, **Then** they see Patient History, Clinical Notes, Lab Orders, and their own appointments
2. **Given** a user with "Receptionist" role, **When** they try to access Financial Reports, **Then** they receive an "Access Denied" message
3. **Given** a user with "Administrator" role, **When** they view the navigation menu, **Then** they see all menu items including Settings
4. **Given** a user with no assigned roles, **When** they log in, **Then** they see only their profile page with a message to contact admin

---

### User Story 2 - Fine-Grained Action Permissions (Priority: P1)

As a healthcare administrator, I want to control which actions each role can perform (view, create, edit, delete) so that staff can only modify data they're authorized to change.

**Why this priority**: Essential for data integrity and audit compliance - users should not accidentally or intentionally modify records they shouldn't.

**Independent Test**: Create a user with "view-only" permissions and verify they cannot click Edit or Delete buttons.

**Acceptance Scenarios**:

1. **Given** a user with "view-encounters" but not "edit-encounter" permission, **When** they open a patient encounter, **Then** the Edit button is disabled or hidden
2. **Given** a user with "create-patient" permission, **When** they register a new patient, **Then** the patient is created and logged in audit trail
3. **Given** a user with "delete-patient" permission, **When** they delete a patient, **Then** a confirmation modal appears and the action is logged

---

### User Story 3 - Permission Matrix Configuration (Priority: P2)

As a system administrator, I want a visual permission matrix UI so that I can easily see and modify which roles have which permissions.

**Why this priority**: Enables self-service administration without requiring technical knowledge. Reduces admin workload.

**Independent Test**: Navigate to Role Management, open a role, toggle a permission in the matrix, save, and verify the change persists.

**Acceptance Scenarios**:

1. **Given** an administrator on the Role Management page, **When** they click on a role, **Then** they see a checkbox matrix showing all permissions grouped by category
2. **Given** an administrator editing a role's permissions, **When** they enable "edit-patient-demographics", **Then** "view-patient-demographics" is automatically enabled (dependency resolution)
3. **Given** an administrator saving permission changes, **When** the save completes, **Then** an audit event is created documenting the change

---

### User Story 4 - Department-Scoped Access (Priority: P2)

As a department head, I want my staff to only see patients and records from our department so that we maintain appropriate data boundaries.

**Why this priority**: Multi-department clinics need data segregation. This enables scaling to larger organizations.

**Independent Test**: Create a user assigned to "Cardiology" department and verify they cannot see patients from "Orthopedics".

**Acceptance Scenarios**:

1. **Given** a nurse assigned to Cardiology department, **When** they search for patients, **Then** they only see patients with Cardiology encounters
2. **Given** a physician with cross-department privileges, **When** they search for patients, **Then** they see patients from all departments they have access to
3. **Given** a patient transferred from Cardiology to Orthopedics within the last 30-90 days (configurable), **When** a Cardiology nurse views their history, **Then** they retain read access to Cardiology records for the configured transition period
4. **Given** a patient transferred more than 90 days ago, **When** a staff member from the original department searches, **Then** they no longer see that patient in results

---

### User Story 5 - Time-Restricted Edits (Priority: P2)

As a compliance officer, I want to prevent editing of records older than a configurable time period so that we maintain audit integrity.

**Why this priority**: Regulatory requirement - medical records should be locked after a certain period to prevent retroactive changes.

**Independent Test**: Create a record dated 48 hours ago (with 24-hour edit window configured) and verify Edit button is disabled.

**Acceptance Scenarios**:

1. **Given** a record created within the edit window (e.g., 24 hours), **When** a user with edit permission views it, **Then** they can modify the record
2. **Given** a record older than the edit window, **When** a user tries to edit it, **Then** they see "Record locked - contact administrator for amendments"
3. **Given** an administrator with "edit-locked-records" permission, **When** they edit an old record, **Then** a special audit entry is created noting the override

---

### User Story 6 - Sensitive Data Access Control (Priority: P3)

As a privacy officer, I want to restrict access to sensitive data categories (mental health, reproductive health, HIV status) so that only authorized staff can view them.

**Why this priority**: HIPAA special categories require additional protection. Important for legal compliance.

**Independent Test**: Create a patient with mental health diagnosis and verify general staff cannot see it.

**Acceptance Scenarios**:

1. **Given** a patient with mental health records flagged as sensitive, **When** a general physician views their chart, **Then** mental health section shows "Restricted - contact mental health team"
2. **Given** a psychiatrist with "view-sensitive-mental-health" permission, **When** they view the same patient, **Then** they see full mental health records
3. **Given** any user attempting to access restricted data, **When** access is denied or granted, **Then** an audit event is logged

---

### User Story 7 - Emergency Access (Break Glass) (Priority: P3)

As an emergency department physician, I want to access restricted patient data in emergencies so that I can provide life-saving care.

**Why this priority**: Clinical necessity - patient safety must override privacy in emergencies. Required by healthcare regulations.

**Independent Test**: As a non-authorized user, click "Emergency Access" on a restricted record and verify access is granted with audit logging.

**Acceptance Scenarios**:

1. **Given** a physician without access to a patient's restricted records, **When** they click "Emergency Access", **Then** they must provide a reason and the access is logged
2. **Given** an emergency access request is submitted, **When** it completes, **Then** the privacy officer receives a notification for review
3. **Given** emergency access is granted, **When** the physician views the record, **Then** a banner displays "Emergency access - all actions logged"

---

### Edge Cases

- What happens when a user has conflicting permissions from multiple roles? (Answer: Union logic - most permissive wins)
- How does system handle permission changes while user is logged in? (Answer: Changes apply on next page load)
- What if a department is deleted while users are still assigned? (Answer: Users retain access until reassigned)
- How are permissions enforced for API access vs. UI access? (Answer: Same AccessPolicy rules apply to both)

---

## Requirements

### Functional Requirements

#### Core Permission Model

- **FR-001**: System MUST use Medplum AccessPolicy resources as the source of truth for all permissions
- **FR-002**: System MUST support role-based access control (RBAC) with multiple roles per user
- **FR-003**: System MUST enforce permissions at both UI level (hiding/disabling elements) and API level (rejecting requests)
- **FR-004**: System MUST support permission inheritance where child permissions require parent permissions
- **FR-005**: System MUST log all permission-related changes in AuditEvent resources

#### Permission Categories

- **FR-006**: System MUST organize permissions into logical categories: Patient Management, Clinical Documentation, Laboratory, Billing/Financial, Administration, Reports
- **FR-007**: System MUST support the following permission levels for each resource type: create, read, update, delete, search
- **FR-008**: System MUST support action-specific permissions beyond CRUD (e.g., "sign-document", "approve-lab-result", "process-payment")

#### Role Management

- **FR-009**: System MUST allow administrators to create, edit, clone, deactivate, and delete roles
- **FR-010**: System MUST prevent deletion of roles that have users assigned
- **FR-011**: System MUST provide predefined role templates matching legacy personnel types
- **FR-012**: System MUST detect and warn about role conflicts (separation of duties violations)

#### User-Role Assignment

- **FR-013**: System MUST allow assigning multiple roles to a single user
- **FR-014**: System MUST combine permissions from all assigned roles using union logic
- **FR-015**: System MUST support role assignment with effective dates (start/end)

#### Department/Location Scoping

- **FR-016**: System MUST support restricting access by department/organization
- **FR-017**: System MUST support restricting access by physical location
- **FR-018**: System MUST allow users to have different permissions in different departments
- **FR-019**: System MUST support time-limited access (configurable 30-90 days) to historical records after patient department transfers

#### Time-Based Controls

- **FR-020**: System MUST support configurable edit windows for records
- **FR-021**: System MUST allow administrators to override time restrictions with audit logging

#### Sensitive Data

- **FR-022**: System MUST support data classification labels (normal, sensitive, restricted)
- **FR-023**: System MUST allow separate permissions for sensitive data categories

#### Emergency Access

- **FR-024**: System MUST provide emergency access workflow with mandatory reason entry
- **FR-025**: System MUST send notifications for emergency access events
- **FR-026**: System MUST create detailed audit records for all emergency access

#### Audit & Compliance

- **FR-027**: System MUST log all access attempts (granted and denied) to AuditEvent resources
- **FR-028**: System MUST support audit log filtering by date, user, action, resource, and outcome
- **FR-029**: System MUST retain audit logs for configurable period (minimum 6 years for HIPAA)

#### Performance & Caching

- **FR-030**: System MUST cache permission data with short TTL (5-10 seconds) to balance performance with rapid change propagation
- **FR-031**: System MUST invalidate permission cache when role or user-role assignments are modified

#### Error Handling & Fail-Safe

- **FR-032**: System MUST fail closed (deny access) when permission validation fails or service is unreachable
- **FR-033**: System MUST display clear error message to user when access is denied due to system failure
- **FR-034**: System MUST log all permission validation failures for troubleshooting

#### Observability & Monitoring

- **FR-035**: System MUST track permission denial rate (denied requests / total requests)
- **FR-036**: System MUST track average permission check latency
- **FR-037**: System MUST track permission cache hit rate
- **FR-038**: System MUST track permission validation error rate

### Key Entities

- **AccessPolicy**: FHIR resource defining permission rules for resources and interactions
- **PractitionerRole**: FHIR resource linking Practitioner to roles and departments
- **AuditEvent**: FHIR resource recording all security-relevant events
- **Permission**: Application concept representing a single grantable capability
- **Role**: Collection of permissions that can be assigned to users
- **PermissionCategory**: Logical grouping of related permissions

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Administrators can configure role permissions in under 5 minutes using the visual matrix
- **SC-002**: System enforces 100% of permissions at both UI and API levels (no bypass possible)
- **SC-003**: Permission changes propagate to all user sessions within 60 seconds
- **SC-004**: Audit logs capture 100% of access events with complete context
- **SC-005**: Emergency access workflow completes in under 30 seconds
- **SC-006**: System supports at least 16 predefined role templates matching legacy requirements
- **SC-007**: Zero HIPAA violations attributable to permission system failures
- **SC-008**: 95% of administrators rate permission configuration as "easy" or "very easy"
- **SC-009**: System handles 1000+ concurrent users with consistent permission enforcement
- **SC-010**: Permission lookup adds less than 50ms latency to API requests

---

## Implementation Guidelines

### Recommended Architecture

Based on research from SMART on FHIR Best Practices, Medplum AccessPolicy Documentation, and Healthcare RBAC Research:

#### 1. Use FHIR AccessPolicy as Foundation

Medplum's AccessPolicy resource should be the single source of truth:

```
AccessPolicy
- meta.tag[role-identifier] -> Role code and name
- meta.tag[role-status] -> active/inactive
- resource[] -> Array of resource permissions
  - resourceType -> "Patient", "Encounter", etc.
  - readonly -> true/false
  - criteria -> FHIR search expression for scoping
  - readonlyFields -> Fields that cannot be modified
- compartment[] -> For department/patient scoping
```

#### 2. Extend Permission Categories

Map legacy 534 permissions to modern FHIR-resource-based model:

| Legacy Category | FHIR Resource | Recommended Permissions |
|-----------------|---------------|------------------------|
| Patient History Tab | Encounter, DocumentReference | view-encounter, edit-encounter, delete-encounter |
| Registration | Patient | view-patient, create-patient, edit-patient, delete-patient |
| Laboratory | Observation, DiagnosticReport, ServiceRequest | view-lab, order-lab, edit-lab-result, approve-lab |
| Billing | Invoice, Claim, PaymentReconciliation | view-invoice, create-invoice, process-payment |
| Nomenclature | ActivityDefinition | view-nomenclature, edit-nomenclature |
| Administration | Practitioner, AccessPolicy, AuditEvent | manage-users, manage-roles, view-audit |

#### 3. Implement Permission Layers

```
Layer 1: Resource Type (Patient, Encounter, etc.)
    Layer 2: Operation (create, read, update, delete, search)
        Layer 3: Action (sign, approve, print, export)
            Layer 4: Scope (department, location, time)
```

#### 4. Role Templates Mapping

Create predefined AccessPolicy templates for each legacy personnel type:

| Legacy Role | FHIR Role Template | Key Permissions |
|-------------|-------------------|-----------------|
| Doctor | physician-template | Full clinical access, limited admin |
| Nurse | nurse-template | Clinical view/edit, no delete |
| Registrar | receptionist-template | Registration, scheduling |
| Cashier | cashier-template | Billing, payments |
| Lab Tech | lab-technician-template | Lab orders, results |

#### 5. Compliance Considerations

Per HIPAA Security Rule:

- Implement automatic session timeout
- Log all access to PHI in AuditEvent
- Enforce unique user identification
- Support encryption for data at rest and in transit
- Implement emergency access procedures

---

## Clarifications

### Session 2025-11-27

- Q: What level of permission granularity should the redesigned system support? → A: Moderate granularity (~80-120 permissions) - Balance between control and usability
- Q: How should permission data be cached and invalidated? → A: Short cache (5-10 sec) - balance between performance and quick propagation
- Q: When a patient transfers between departments, should staff in the original department retain access to historical records? → A: Time-limited - retain access for configurable period (30-90 days) after transfer
- Q: What should happen if permission validation fails or the permission service is unreachable? → A: Fail closed - deny access with clear error message (secure default)
- Q: What key metrics should be tracked for permission system monitoring? → A: Standard - denial rate, average latency, cache hit rate, error rate

## Assumptions

1. All users authenticate through Medplum's built-in authentication system
2. The system operates in a single Medplum Project (multi-tenant via departments, not separate projects)
3. Department-based scoping uses Organization resources with parent-child hierarchy
4. Permission changes do not require user re-login (checked on each request)
5. The legacy 534 permissions can be mapped to ~80-120 modern permissions with moderate granularity balancing control and usability
6. Emergency access is rare (< 0.1% of access events) and acceptable to have a modal workflow

---

## Out of Scope

1. Patient-facing access control (patient portal permissions)
2. External system integration permissions (OAuth scopes for third-party apps)
3. Data export permissions (bulk FHIR export)
4. Consent management (FHIR Consent resource)
5. Cross-organization data sharing

---

## References

### Research Sources

- Health Information System Role-Based Access Control - PMC: https://pmc.ncbi.nlm.nih.gov/articles/PMC5836325/
- SMART on FHIR Authorization Best Practices: https://docs.smarthealthit.org/authorization/best-practices/
- FHIR Security Module: https://hl7.org/fhir/security.html
- Medplum AccessPolicy Documentation: https://www.medplum.com/docs/access/access-policies
- HIPAA Security Rule: https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html
- Healthcare RBAC for SaaS Applications: https://www.cabotsolutions.com/blog/role-based-access-control-rbac-for-secure-healthcare-saas-applications
- Hybrid RBAC + ABAC for Healthcare: https://www.mdpi.com/1999-5903/17/6/262

### Internal Documentation

- Legacy EMR Mapping: `documentation/emr-mapping/personnel-permissions-mapping.md`
- Permission Tree JSON: `documentation/emr-mapping/permissions-tree.json`
- Personnel Types JSON: `documentation/emr-mapping/personnel-types.json`
- Current Permission Service: `packages/app/src/emr/services/permissionService.ts`
- Current Role Service: `packages/app/src/emr/services/roleService.ts`
