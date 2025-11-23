# Data Model: EMR User Management Improvements

**Feature**: 001-emr-user-management-improvements
**Date**: 2025-11-23
**FHIR Version**: R4

## Overview

This feature uses standard FHIR R4 resources. No custom resources or extensions are required.

---

## FHIR Resources

### 1. Practitioner (Existing - Enhanced)

Staff member account with personal information and active status.

| Field | FHIR Path | Type | Required | Description |
|-------|-----------|------|----------|-------------|
| id | Practitioner.id | string | Yes | Unique identifier |
| active | Practitioner.active | boolean | Yes | Account status |
| firstName | Practitioner.name[0].given[0] | string | Yes | First name |
| lastName | Practitioner.name[0].family | string | Yes | Last name |
| email | Practitioner.telecom[system=email].value | string | Yes | Email address |
| phone | Practitioner.telecom[system=phone].value | string | No | Phone number |
| gender | Practitioner.gender | code | No | male/female/other/unknown |
| photo | Practitioner.photo[0] | Attachment | No | Profile photo |

**State Transitions**:
```
Created → Active → Deactivated → Reactivated (Active)
```

---

### 2. PractitionerRole (Existing - Enhanced)

Role assignment linking a Practitioner to one or more roles.

| Field | FHIR Path | Type | Required | Description |
|-------|-----------|------|----------|-------------|
| id | PractitionerRole.id | string | Yes | Unique identifier |
| practitioner | PractitionerRole.practitioner | Reference | Yes | Link to Practitioner |
| code | PractitionerRole.code[0].coding[0] | Coding | Yes | Role code (physician, nurse, etc.) |
| specialty | PractitionerRole.specialty[0] | CodeableConcept | No | Medical specialty (NUCC) |
| organization | PractitionerRole.organization | Reference | No | Department/organization |
| active | PractitionerRole.active | boolean | Yes | Role assignment active |

**Validation Rules**:
- One Practitioner can have multiple PractitionerRoles
- Each role assignment must have a valid code
- Specialty only applicable for clinical roles

---

### 3. AccessPolicy (Existing - Enhanced)

Permission set defining resource access for a role.

| Field | FHIR Path | Type | Required | Description |
|-------|-----------|------|----------|-------------|
| id | AccessPolicy.id | string | Yes | Unique identifier |
| name | AccessPolicy.name | string | Yes | Human-readable name |
| resource | AccessPolicy.resource[] | array | Yes | Permission rules |
| resource.resourceType | resource[].resourceType | string | Yes | FHIR resource type |
| resource.readonly | resource[].readonly | boolean | No | Read-only flag |
| resource.criteria | resource[].criteria | string | No | FHIR search criteria |
| resource.compartment | resource[].compartment | Reference | No | Compartment filter |

**Permission Matrix Structure**:
```typescript
// Resource types to display in matrix
const MATRIX_RESOURCES = [
  'Patient',
  'Practitioner',
  'Observation',
  'MedicationRequest',
  'DiagnosticReport',
  'Encounter',
  'Claim',
  'Invoice',
];

// Operations per resource
const OPERATIONS = ['create', 'read', 'update', 'delete', 'search'];
```

---

### 4. AuditEvent (Standard FHIR - New Usage)

Immutable log entry for compliance tracking.

| Field | FHIR Path | Type | Required | Description |
|-------|-----------|------|----------|-------------|
| id | AuditEvent.id | string | Yes | Unique identifier |
| type | AuditEvent.type | Coding | Yes | Event type (DICOM code) |
| action | AuditEvent.action | code | Yes | C=Create, R=Read, U=Update, D=Delete, E=Execute |
| recorded | AuditEvent.recorded | instant | Yes | When event occurred |
| outcome | AuditEvent.outcome | code | Yes | 0=Success, 4=Minor, 8=Serious, 12=Major |
| agent | AuditEvent.agent[] | array | Yes | Who performed action |
| agent.who | agent[].who | Reference | Yes | Practitioner reference |
| agent.requestor | agent[].requestor | boolean | Yes | Was this the initiator |
| source | AuditEvent.source | object | Yes | System that detected event |
| entity | AuditEvent.entity[] | array | Yes | What was affected |
| entity.what | entity[].what | Reference | Yes | Resource reference |
| entity.type | entity[].type | Coding | No | Resource type |

**DICOM Audit Event Codes**:
| Code | Display | Usage |
|------|---------|-------|
| 110110 | Patient Record | Account view/read |
| 110112 | Query | Search operations |
| 110114 | User Authentication | Login/logout |
| 110136 | Security Alert | Failed auth, permission denied |
| 110137 | User Security Attribute Changed | Permission/role changes |

---

### 5. Invite (Medplum-Specific)

Pending invitation with token and status tracking.

| Field | Path | Type | Required | Description |
|-------|------|------|----------|-------------|
| id | Invite.id | string | Yes | Unique identifier |
| email | Invite.email | string | Yes | Target email |
| project | Invite.project | Reference | Yes | Project reference |
| user | Invite.user | Reference | No | Created user (after accept) |
| membership | Invite.membership | Reference | No | ProjectMembership |
| meta.lastUpdated | Invite.meta.lastUpdated | instant | Yes | For expiry calculation |

**Derived Status Logic**:
```typescript
function deriveInvitationStatus(invite: Invite): InvitationStatus {
  // Check if user activated
  if (invite.user) return 'accepted';

  // Check for bounced tag
  if (invite.meta?.tag?.some(t => t.code === 'email-bounced')) return 'bounced';

  // Check for cancelled tag
  if (invite.meta?.tag?.some(t => t.code === 'cancelled')) return 'cancelled';

  // Check expiry (7 days from creation)
  const createdAt = new Date(invite.meta?.lastUpdated || '');
  const expiryDate = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
  if (new Date() > expiryDate) return 'expired';

  return 'pending';
}
```

---

## TypeScript Interfaces

### Account Management Types

```typescript
// Invitation status
export type InvitationStatus =
  | 'pending'    // Email sent, awaiting activation
  | 'accepted'   // User activated account
  | 'expired'    // 7+ days since invitation
  | 'bounced'    // Email delivery failed
  | 'cancelled'; // Admin cancelled invitation

// Account table row
export interface AccountRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roles: string[];
  status: 'active' | 'inactive';
  invitationStatus?: InvitationStatus;
  lastLogin?: string;
  createdAt: string;
}

// Search filters
export interface AccountSearchFilters {
  search?: string;           // Name or email search
  role?: string;             // Role code filter
  department?: string;       // Department filter
  status?: 'active' | 'inactive' | 'pending';
  hireDateFrom?: Date;
  hireDateTo?: Date;
  lastLoginFrom?: Date;
  lastLoginTo?: Date;
}

// Pagination params
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

// Filter preset
export interface FilterPreset {
  id: string;
  name: string;
  filters: AccountSearchFilters;
  createdAt: string;
}
```

### Permission Types

```typescript
// Permission cell in matrix
export interface PermissionCell {
  resourceType: string;
  operation: 'create' | 'read' | 'update' | 'delete' | 'search';
  allowed: boolean;
  inherited?: boolean;
}

// Permission matrix row
export interface PermissionRow {
  resourceType: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  search: boolean;
}

// Role conflict
export interface RoleConflict {
  type: 'separation_of_duties' | 'redundant_roles' | 'permission_conflict';
  roles: string[];
  message: string;
  severity: 'error' | 'warning';
}
```

### Audit Types

```typescript
// Audit log entry (UI representation)
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: {
    id: string;
    name: string;
  };
  action: 'C' | 'R' | 'U' | 'D' | 'E';
  actionDisplay: string;
  resourceType: string;
  entityId: string;
  entityDisplay: string;
  outcome: 0 | 4 | 8 | 12;
  outcomeDisplay: string;
  ipAddress?: string;
}

// Audit log filters
export interface AuditLogFilters {
  dateFrom?: Date;
  dateTo?: Date;
  actorId?: string;
  action?: string;
  resourceType?: string;
  outcome?: number;
  entityId?: string;
}
```

### Bulk Operation Types

```typescript
// Bulk operation types
export type BulkOperationType =
  | 'deactivate'
  | 'activate'
  | 'assignRole'
  | 'removeRole'
  | 'export';

// Bulk operation result
export interface BulkOperationResult {
  operationType: BulkOperationType;
  total: number;
  successful: number;
  failed: number;
  errors: Array<{
    id: string;
    name: string;
    error: string;
  }>;
}

// Bulk operation progress
export interface BulkOperationProgress {
  current: number;
  total: number;
  percentage: number;
}
```

---

## Entity Relationships

```
┌─────────────────┐
│   Practitioner  │
│   (Account)     │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐      ┌─────────────────┐
│ PractitionerRole│──────│  AccessPolicy   │
│  (Assignment)   │ N:1  │  (Permissions)  │
└────────┬────────┘      └─────────────────┘
         │
         │ 1:1
         ▼
┌─────────────────┐      ┌─────────────────┐
│     Invite      │      │   AuditEvent    │
│  (Invitation)   │      │   (Audit Log)   │
└─────────────────┘      └─────────────────┘
         │                        │
         └────────────────────────┘
              Referenced by
```

---

## Validation Rules Summary

| Entity | Rule | Error Message |
|--------|------|---------------|
| Practitioner | Email required and RFC 5322 compliant | "Invalid email format" |
| Practitioner | Phone E.164 format if provided | "Invalid phone format" |
| PractitionerRole | At least one role required | "At least one role must be assigned" |
| PractitionerRole | No self-deactivation | "Cannot deactivate your own account" |
| AccessPolicy | At least one resource rule | "Policy must have at least one permission" |
| Invite | Email must not already exist | "User with this email already exists" |
| BulkOperation | Current user excluded from deactivation | "Your account was excluded from bulk deactivation" |
