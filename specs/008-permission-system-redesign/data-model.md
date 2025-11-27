# Data Model: Permission System Redesign

**Feature**: 008-permission-system-redesign
**Date**: 2025-11-27
**Status**: Draft

---

## Entity Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Practitioner   │────▶│ PractitionerRole│────▶│  AccessPolicy   │
│   (User)        │  1:N│   (Assignment)  │  N:1│    (Role)       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │                        │
                              │                        │
                              ▼                        ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │  Organization   │     │ Permission      │
                        │  (Department)   │     │ (App Concept)   │
                        └─────────────────┘     └─────────────────┘
                                                       │
                                                       ▼
                                                ┌─────────────────┐
                                                │PermissionCategory│
                                                │ (App Concept)   │
                                                └─────────────────┘
```

---

## 1. AccessPolicy (FHIR Resource)

Stores role definitions with their permission rules.

### Schema

```typescript
interface AccessPolicy {
  resourceType: 'AccessPolicy';
  id: string;
  meta: {
    versionId: string;
    lastUpdated: string;
    tag: [
      {
        system: 'http://medimind.ge/role-identifier';
        code: string;  // Role code, e.g., "physician"
        display: string;  // Role name, e.g., "Physician"
      },
      {
        system: 'http://medimind.ge/role-status';
        code: 'active' | 'inactive';
      }
    ];
  };
  name: string;
  description?: string;

  // Permission rules
  resource: AccessPolicyResource[];
}

interface AccessPolicyResource {
  resourceType: string;  // FHIR resource type or '*'

  // Interaction control (preferred over readonly)
  interaction?: ('create' | 'read' | 'update' | 'delete' | 'search' | 'history')[];

  // Legacy binary flag (deprecated)
  readonly?: boolean;

  // Scoping
  criteria?: string;  // FHIR search expression with %parameters

  // Field restrictions
  hiddenFields?: string[];
  readonlyFields?: string[];
}
```

### Indexes

- `meta.tag.code` (role code lookup)
- `meta.tag.system` (role identifier system)
- `name` (text search)

### Validation Rules

- `meta.tag` MUST include at least one role-identifier tag
- `resource[].resourceType` MUST be valid FHIR resource type or '*'
- `name` is REQUIRED and UNIQUE

### State Transitions

```
draft → active → inactive → deleted (soft)
         ↑          │
         └──────────┘ (reactivate)
```

---

## 2. PractitionerRole (FHIR Resource)

Links practitioners (users) to roles and departments.

### Schema

```typescript
interface PractitionerRole {
  resourceType: 'PractitionerRole';
  id: string;
  meta: {
    tag?: [
      {
        system: 'http://medimind.ge/role-assignment';
        code: string;  // Assigned role code
      }
    ];
  };

  // Status
  active: boolean;

  // Period of validity
  period?: {
    start?: string;  // ISO date
    end?: string;    // ISO date
  };

  // Linked entities
  practitioner: Reference<Practitioner>;
  organization?: Reference<Organization>;  // Department
  code?: CodeableConcept[];  // Role codes
  specialty?: CodeableConcept[];  // Medical specialties

  // Extension for AccessPolicy reference
  extension?: [
    {
      url: 'http://medimind.ge/extensions/access-policy';
      valueReference: Reference<AccessPolicy>;
    }
  ];
}
```

### Indexes

- `practitioner` (user lookup)
- `organization` (department lookup)
- `active` (status filter)
- `period.start`, `period.end` (validity filter)

### Validation Rules

- `practitioner` is REQUIRED
- `period.start` <= `period.end` if both specified
- Cannot have duplicate active roles for same practitioner + organization

### State Transitions

```
pending (period.start in future)
    │
    ▼
active (current date in period)
    │
    ▼
expired (period.end passed) OR inactive (active=false)
```

---

## 3. Permission (Application Concept)

Application-level permission definition (not stored in FHIR).

### Schema

```typescript
interface Permission {
  // Identification
  code: string;           // Unique identifier, e.g., "view-patient-list"
  name: string;           // Display name (translated)
  description: string;    // Detailed description (translated)

  // Categorization
  category: string;       // Category code
  displayOrder: number;   // Sort order within category

  // FHIR Mapping
  resourceType?: string;  // Target FHIR resource
  accessLevel: 'read' | 'write' | 'delete' | 'admin';

  // Dependencies
  dependencies?: string[];  // Permission codes that must also be enabled

  // UI Metadata
  icon?: string;
  dangerous?: boolean;     // Show warning on enable
}
```

### Permission Codes (80-120 total)

#### Patient Management (15 permissions)

| Code | Access Level | FHIR Resource | Dependencies |
|------|--------------|---------------|--------------|
| view-patient-list | read | Patient | - |
| view-patient-demographics | read | Patient | view-patient-list |
| edit-patient-demographics | write | Patient | view-patient-demographics |
| create-patient | write | Patient | view-patient-list |
| delete-patient | delete | Patient | view-patient-demographics |
| view-patient-history | read | Encounter | view-patient-list |
| merge-patients | admin | Patient | edit-patient-demographics |
| export-patient-data | read | Patient | view-patient-demographics |
| view-patient-documents | read | DocumentReference | view-patient-demographics |
| upload-patient-documents | write | DocumentReference | view-patient-documents |
| view-patient-photo | read | Patient | view-patient-demographics |
| upload-patient-photo | write | Patient | view-patient-photo |
| view-patient-contacts | read | RelatedPerson | view-patient-demographics |
| edit-patient-contacts | write | RelatedPerson | view-patient-contacts |
| view-patient-insurance | read | Coverage | view-patient-demographics |

#### Clinical Documentation (18 permissions)

| Code | Access Level | FHIR Resource | Dependencies |
|------|--------------|---------------|--------------|
| view-encounters | read | Encounter | view-patient-history |
| create-encounter | write | Encounter | view-encounters |
| edit-encounter | write | Encounter | view-encounters |
| delete-encounter | delete | Encounter | edit-encounter |
| view-clinical-notes | read | DocumentReference | view-encounters |
| create-clinical-notes | write | DocumentReference | view-clinical-notes |
| edit-clinical-notes | write | DocumentReference | create-clinical-notes |
| sign-clinical-notes | admin | DocumentReference | edit-clinical-notes |
| view-diagnoses | read | Condition | view-encounters |
| create-diagnosis | write | Condition | view-diagnoses |
| edit-diagnosis | write | Condition | create-diagnosis |
| view-procedures | read | Procedure | view-encounters |
| create-procedure | write | Procedure | view-procedures |
| view-medications | read | MedicationRequest | view-encounters |
| prescribe-medication | write | MedicationRequest | view-medications |
| view-allergies | read | AllergyIntolerance | view-patient-demographics |
| edit-allergies | write | AllergyIntolerance | view-allergies |
| edit-locked-records | admin | Encounter | edit-encounter |

#### Laboratory (12 permissions)

| Code | Access Level | FHIR Resource | Dependencies |
|------|--------------|---------------|--------------|
| view-lab-orders | read | ServiceRequest | view-encounters |
| create-lab-order | write | ServiceRequest | view-lab-orders |
| edit-lab-order | write | ServiceRequest | create-lab-order |
| cancel-lab-order | write | ServiceRequest | edit-lab-order |
| view-lab-results | read | Observation | view-lab-orders |
| enter-lab-results | write | Observation | view-lab-results |
| edit-lab-results | write | Observation | enter-lab-results |
| approve-lab-results | admin | Observation | edit-lab-results |
| view-specimens | read | Specimen | view-lab-orders |
| manage-specimens | write | Specimen | view-specimens |
| view-lab-equipment | read | Device | view-lab-results |
| manage-lab-equipment | write | Device | view-lab-equipment |

#### Billing & Financial (15 permissions)

| Code | Access Level | FHIR Resource | Dependencies |
|------|--------------|---------------|--------------|
| view-invoices | read | Invoice | view-encounters |
| create-invoice | write | Invoice | view-invoices |
| edit-invoice | write | Invoice | create-invoice |
| void-invoice | delete | Invoice | edit-invoice |
| view-payments | read | PaymentReconciliation | view-invoices |
| process-payment | write | PaymentReconciliation | view-payments |
| refund-payment | write | PaymentReconciliation | process-payment |
| view-claims | read | Claim | view-invoices |
| submit-claim | write | Claim | view-claims |
| view-insurance-auth | read | CoverageEligibilityResponse | view-invoices |
| request-insurance-auth | write | CoverageEligibilityRequest | view-insurance-auth |
| view-financial-reports | read | MeasureReport | view-invoices |
| export-financial-data | read | Invoice | view-financial-reports |
| view-debt-management | read | Invoice | view-invoices |
| manage-debt | write | Invoice | view-debt-management |

#### Administration (18 permissions)

| Code | Access Level | FHIR Resource | Dependencies |
|------|--------------|---------------|--------------|
| view-users | read | Practitioner | - |
| create-user | write | Practitioner | view-users |
| edit-user | write | Practitioner | view-users |
| deactivate-user | write | Practitioner | edit-user |
| delete-user | delete | Practitioner | deactivate-user |
| view-roles | read | AccessPolicy | - |
| create-role | write | AccessPolicy | view-roles |
| edit-role | write | AccessPolicy | view-roles |
| delete-role | delete | AccessPolicy | edit-role |
| assign-roles | write | PractitionerRole | view-users, view-roles |
| view-departments | read | Organization | - |
| manage-departments | write | Organization | view-departments |
| view-audit-logs | read | AuditEvent | - |
| export-audit-logs | read | AuditEvent | view-audit-logs |
| view-system-settings | read | Parameters | - |
| edit-system-settings | admin | Parameters | view-system-settings |
| view-access-logs | read | AuditEvent | - |
| emergency-access | admin | * | - |

#### Reports (10 permissions)

| Code | Access Level | FHIR Resource | Dependencies |
|------|--------------|---------------|--------------|
| view-clinical-reports | read | MeasureReport | view-encounters |
| view-operational-reports | read | MeasureReport | - |
| view-financial-summary | read | MeasureReport | view-invoices |
| generate-report | write | MeasureReport | view-clinical-reports |
| export-reports | read | MeasureReport | view-clinical-reports |
| schedule-reports | write | Task | generate-report |
| view-analytics-dashboard | read | MeasureReport | - |
| view-quality-metrics | read | MeasureReport | view-clinical-reports |
| view-utilization-reports | read | MeasureReport | view-operational-reports |
| view-compliance-reports | read | MeasureReport | view-audit-logs |

#### Nomenclature (8 permissions)

| Code | Access Level | FHIR Resource | Dependencies |
|------|--------------|---------------|--------------|
| view-services | read | ActivityDefinition | - |
| edit-services | write | ActivityDefinition | view-services |
| view-diagnoses-catalog | read | ValueSet | - |
| edit-diagnoses-catalog | write | ValueSet | view-diagnoses-catalog |
| view-medications-catalog | read | Medication | - |
| edit-medications-catalog | write | Medication | view-medications-catalog |
| view-lab-catalog | read | ObservationDefinition | - |
| edit-lab-catalog | write | ObservationDefinition | view-lab-catalog |

#### Scheduling (8 permissions)

| Code | Access Level | FHIR Resource | Dependencies |
|------|--------------|---------------|--------------|
| view-appointments | read | Appointment | view-patient-list |
| create-appointment | write | Appointment | view-appointments |
| edit-appointment | write | Appointment | create-appointment |
| cancel-appointment | write | Appointment | edit-appointment |
| view-schedules | read | Schedule | - |
| manage-schedules | write | Schedule | view-schedules |
| view-availability | read | Slot | view-schedules |
| manage-availability | write | Slot | view-availability |

---

## 4. PermissionCategory (Application Concept)

Logical grouping of permissions.

### Schema

```typescript
interface PermissionCategory {
  code: string;
  name: string;           // Translated
  description: string;    // Translated
  displayOrder: number;
  icon?: string;
  permissions: Permission[];
}
```

### Categories

| Code | Display Order | Icon |
|------|---------------|------|
| patient-management | 1 | IconUsers |
| clinical-documentation | 2 | IconClipboard |
| laboratory | 3 | IconMicroscope |
| billing-financial | 4 | IconCoin |
| administration | 5 | IconSettings |
| reports | 6 | IconChartBar |
| nomenclature | 7 | IconList |
| scheduling | 8 | IconCalendar |

---

## 5. RoleTemplate (Application Concept)

Predefined role configurations.

### Schema

```typescript
interface RoleTemplate {
  code: string;              // e.g., "physician"
  name: string;              // Translated
  description: string;       // Translated
  defaultPermissions: string[];  // Permission codes
  departmentScoped: boolean;
  defaultPage?: string;      // Landing page route
}
```

### Templates

| Code | Permissions Count | Dept Scoped | Default Page |
|------|-------------------|-------------|--------------|
| owner | ~100 (all) | No | /emr/administration |
| admin | ~90 | No | /emr/administration |
| physician | ~60 | Yes | /emr/patient-history |
| nurse | ~45 | Yes | /emr/patient-history |
| registrar | ~25 | No | /emr/registration |
| laboratory | ~30 | Yes | /emr/laboratory |
| cashier | ~20 | No | /emr/billing |
| hrManager | ~15 | No | /emr/account-management |
| seniorNurse | ~55 | Yes | /emr/patient-history |
| pharmacyManager | ~25 | No | /emr/pharmacy |
| viewAdmin | ~40 (read-only) | No | /emr/reports |
| accounting | ~15 | No | /emr/billing |
| manager | ~50 | Yes | /emr/reports |
| operator | ~30 | Yes | /emr/registration |
| externalOrg | ~15 | Yes | /emr/patient-history |
| technician | ~25 | Yes | /emr/laboratory |

---

## 6. AuditEvent (FHIR Resource)

Security audit trail for permission-related events.

### Schema

```typescript
interface AuditEvent {
  resourceType: 'AuditEvent';
  id: string;
  meta: {
    lastUpdated: string;
  };

  // Event categorization
  type: {
    system: 'http://dicom.nema.org/resources/ontology/DCM';
    code: string;  // DICOM code
    display: string;
  };

  // When
  recorded: string;  // ISO timestamp

  // Outcome
  outcome: '0' | '4' | '8' | '12';  // success, minor failure, serious failure, major failure
  outcomeDesc?: string;

  // Who performed action
  agent: [{
    who: Reference<Practitioner>;
    requestor: boolean;
    network?: {
      address: string;
      type: '1' | '2';  // machine name, IP address
    };
  }];

  // What was affected
  entity?: [{
    what: Reference;
    type?: {
      system: string;
      code: string;
    };
    role?: {
      system: string;
      code: string;
    };
    detail?: [{
      type: string;
      valueString?: string;
    }];
  }];

  // Source
  source: {
    observer: Reference<Device>;
    type?: [{
      system: string;
      code: string;
    }];
  };
}
```

### Event Types

| DICOM Code | Event | Description |
|------------|-------|-------------|
| DCM 110110 | Patient Record | Access to patient data |
| DCM 110111 | Restricted Access | Denied access attempt |
| DCM 110112 | Authentication | Login/logout events |
| DCM 110113 | Emergency Access | Break-glass scenario |
| DCM 110114 | Policy Change | AccessPolicy modification |
| DCM 110136 | Permission Grant | Role assignment |
| DCM 110137 | Permission Revoke | Role removal |

---

## 7. PermissionCache (Application Concept)

Runtime permission cache structure.

### Schema

```typescript
interface PermissionCacheEntry {
  permissionCode: string;
  hasPermission: boolean;
  expiresAt: number;      // Unix timestamp
  fetchedAt: number;      // Unix timestamp
}

interface PermissionCache {
  userId: string;
  entries: Map<string, PermissionCacheEntry>;
  lastInvalidated: number;
}
```

### Cache Configuration

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| TTL | 10 seconds | Balance freshness and performance |
| Max entries | 200 | Covers all permissions |
| Storage | In-memory + sessionStorage | Fast + persistence |
| Invalidation | On role change | Immediate propagation |

---

## Relationships

```
Practitioner 1 ──────▶ N PractitionerRole
PractitionerRole N ──▶ 1 AccessPolicy
PractitionerRole N ──▶ 1 Organization (optional)
AccessPolicy 1 ──────▶ N AccessPolicyResource
Permission N ────────▶ 1 PermissionCategory
Permission N ────────▶ N Permission (dependencies)
AuditEvent N ────────▶ 1 Practitioner (agent)
AuditEvent N ────────▶ N Resource (entity)
```

---

## Migration Notes

### From Current System

1. Existing ~30 permissions → expanded to 80-120
2. Existing AccessPolicy format compatible (add `interaction` alongside `readonly`)
3. PractitionerRole structure unchanged, add extension for department scoping
4. AuditEvent already in use, extend with permission-specific codes

### New Tables/Collections

- None required (all data in FHIR resources)

### Data Migration

1. Export existing AccessPolicy resources
2. Map old permissions to new permission codes
3. Expand `resource[]` array with new `interaction` fields
4. Import updated AccessPolicy resources
5. Validate all PractitionerRole references remain valid
