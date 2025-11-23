# API Contracts: EMR User Management Improvements

**Feature**: 001-emr-user-management-improvements
**Date**: 2025-11-23

## Overview

This feature uses Medplum's FHIR REST API. All operations use standard FHIR endpoints with search parameters. No custom API endpoints are required.

---

## FHIR Endpoints Used

### 1. Practitioner Operations

#### Search Practitioners (Server-Side Pagination)

```http
GET /fhir/R4/Practitioner?_count=20&_offset=0&_total=accurate&_sort=-_lastUpdated
```

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| _count | integer | Page size (10, 20, 50, 100) |
| _offset | integer | Number of records to skip |
| _total | string | "accurate" to get total count |
| _sort | string | Sort field (prefix with - for descending) |
| name:contains | string | Search by name |
| identifier | string | Search by staff ID |
| email | string | Search by email |
| active | boolean | Filter by status |

**Response**: FHIR Bundle with Practitioner entries and total count

#### Update Practitioner (Deactivate/Reactivate)

```http
PUT /fhir/R4/Practitioner/{id}
Content-Type: application/fhir+json

{
  "resourceType": "Practitioner",
  "id": "{id}",
  "active": false,
  ...existing fields
}
```

#### Bulk Deactivation (Sequential)

```typescript
// Client-side implementation - sequential calls
for (const practitionerId of selectedIds) {
  await medplum.updateResource({
    resourceType: 'Practitioner',
    id: practitionerId,
    active: false,
    ...existingData
  });
}
```

---

### 2. PractitionerRole Operations

#### Get Roles for Practitioner

```http
GET /fhir/R4/PractitionerRole?practitioner=Practitioner/{id}
```

#### Assign Role (Bulk)

```http
POST /fhir/R4/PractitionerRole
Content-Type: application/fhir+json

{
  "resourceType": "PractitionerRole",
  "practitioner": { "reference": "Practitioner/{id}" },
  "code": [{ "coding": [{ "code": "physician" }] }],
  "active": true
}
```

---

### 3. Invite Operations

#### Get Invitation Status

```http
GET /fhir/R4/Invite?project=Project/{projectId}&email={email}
```

#### Resend Invitation

```typescript
// Delete old invite and create new one
await medplum.deleteResource('Invite', oldInviteId);
const newInvite = await medplum.post('/admin/projects/{projectId}/invite', {
  email: email,
  firstName: firstName,
  lastName: lastName,
  membership: { profile: practitionerRef }
});
```

#### Get Activation Link

```typescript
// Construct activation URL from invite token
function getActivationLink(invite: Invite): string {
  const baseUrl = medplum.getBaseUrl();
  return `${baseUrl}/register/${invite.id}`;
}
```

---

### 4. AccessPolicy Operations

#### Get All Access Policies

```http
GET /fhir/R4/AccessPolicy?_count=100
```

#### Get Policy by ID

```http
GET /fhir/R4/AccessPolicy/{id}
```

#### Update Policy (Permission Changes)

```http
PUT /fhir/R4/AccessPolicy/{id}
Content-Type: application/fhir+json

{
  "resourceType": "AccessPolicy",
  "id": "{id}",
  "name": "Physician Role",
  "resource": [
    { "resourceType": "Patient" },
    { "resourceType": "Observation" },
    { "resourceType": "MedicationRequest", "readonly": true }
  ]
}
```

---

### 5. AuditEvent Operations

#### Search Audit Events

```http
GET /fhir/R4/AuditEvent?_count=50&_offset=0&_sort=-recorded
```

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| _count | integer | Page size |
| _offset | integer | Offset for pagination |
| _sort | string | Sort field (-recorded for newest first) |
| date | date | Filter by date (ge/le for range) |
| agent | reference | Filter by actor |
| action | code | Filter by action (C/R/U/D/E) |
| entity-type | token | Filter by resource type |
| outcome | token | Filter by outcome code |
| entity | reference | Filter by affected entity |

**Example: Filter by Date Range and Actor**:
```http
GET /fhir/R4/AuditEvent?date=ge2025-11-01&date=le2025-11-23&agent=Practitioner/123&_sort=-recorded
```

#### Get Audit Events for Specific Account

```http
GET /fhir/R4/AuditEvent?entity=Practitioner/{id}&_sort=-recorded
```

#### Create Audit Event (when needed)

```http
POST /fhir/R4/AuditEvent
Content-Type: application/fhir+json

{
  "resourceType": "AuditEvent",
  "type": {
    "system": "http://dicom.nema.org/resources/ontology/DCM",
    "code": "110137",
    "display": "User Security Attribute Changed"
  },
  "action": "U",
  "recorded": "2025-11-23T10:30:00Z",
  "outcome": "0",
  "agent": [{
    "who": { "reference": "Practitioner/actor-id" },
    "requestor": true
  }],
  "source": {
    "observer": { "display": "EMR Web Application" }
  },
  "entity": [{
    "what": { "reference": "Practitioner/affected-id" },
    "type": { "code": "1", "display": "Person" }
  }]
}
```

---

## Service Function Signatures

### accountService.ts

```typescript
// Search with pagination
export async function searchAccounts(
  medplum: MedplumClient,
  filters: AccountSearchFilters,
  pagination: PaginationParams
): Promise<{ accounts: Practitioner[]; total: number }>;

// Bulk deactivation
export async function bulkDeactivate(
  medplum: MedplumClient,
  practitionerIds: string[],
  currentUserId: string,
  onProgress: (progress: BulkOperationProgress) => void
): Promise<BulkOperationResult>;

// Bulk role assignment
export async function bulkAssignRole(
  medplum: MedplumClient,
  practitionerIds: string[],
  roleCode: string,
  onProgress: (progress: BulkOperationProgress) => void
): Promise<BulkOperationResult>;
```

### invitationService.ts

```typescript
// Get invitation status
export function getInvitationStatus(
  invite: Invite | undefined,
  user: User | undefined
): InvitationStatus;

// Resend invitation
export async function resendInvitation(
  medplum: MedplumClient,
  practitionerId: string,
  email: string
): Promise<Invite>;

// Generate activation link
export function generateActivationLink(
  medplum: MedplumClient,
  invite: Invite
): { url: string; expiresAt: Date };
```

### auditService.ts

```typescript
// Search audit events
export async function searchAuditEvents(
  medplum: MedplumClient,
  filters: AuditLogFilters,
  pagination: PaginationParams
): Promise<{ events: AuditLogEntry[]; total: number }>;

// Get account audit history
export async function getAccountAuditHistory(
  medplum: MedplumClient,
  practitionerId: string
): Promise<AuditLogEntry[]>;

// Create audit event
export async function createAuditEvent(
  medplum: MedplumClient,
  action: 'C' | 'R' | 'U' | 'D' | 'E',
  entity: Reference,
  outcome: 0 | 4 | 8 | 12
): Promise<AuditEvent>;
```

### permissionService.ts

```typescript
// Get permission matrix for role
export async function getPermissionMatrix(
  medplum: MedplumClient,
  policyId: string
): Promise<PermissionRow[]>;

// Update permission matrix
export async function updatePermissionMatrix(
  medplum: MedplumClient,
  policyId: string,
  permissions: PermissionRow[]
): Promise<AccessPolicy>;

// Detect role conflicts
export function detectRoleConflicts(
  roles: string[]
): RoleConflict[];

// Resolve permission dependencies
export function resolvePermissionDependencies(
  resourceType: string,
  operation: string,
  currentPermissions: PermissionRow[]
): PermissionRow[];

// Get combined permissions for multiple roles
export async function getCombinedPermissions(
  medplum: MedplumClient,
  roleIds: string[]
): Promise<PermissionRow[]>;
```

### exportService.ts

```typescript
// Export to Excel
export function exportToExcel(
  data: AccountRow[],
  filename: string,
  metadata: ExportMetadata
): void;

// Export to CSV
export function exportToCSV(
  data: AccountRow[],
  filename: string,
  metadata: ExportMetadata
): void;

// Export audit logs
export function exportAuditLogs(
  data: AuditLogEntry[],
  format: 'xlsx' | 'csv',
  filename: string
): void;
```

---

## Error Handling

### Standard Error Responses

| HTTP Status | FHIR OperationOutcome | UI Message |
|-------------|----------------------|------------|
| 400 | Invalid request | "Invalid request. Please check your input." |
| 401 | Unauthorized | "Session expired. Please log in again." |
| 403 | Forbidden | "You don't have permission to perform this action." |
| 404 | Not found | "Resource not found." |
| 409 | Conflict | "This resource has been modified. Please refresh." |
| 422 | Validation error | Show specific validation message |
| 429 | Rate limited | "Too many requests. Please wait a moment." |
| 500 | Server error | "Something went wrong. Please try again." |

### Bulk Operation Error Handling

```typescript
interface BulkOperationError {
  id: string;
  name: string;
  error: string;
  code?: string;
}

// Continue on individual failures, report at end
async function processBulkOperation(
  items: string[],
  operation: (id: string) => Promise<void>
): Promise<BulkOperationResult> {
  const errors: BulkOperationError[] = [];
  let successful = 0;

  for (const id of items) {
    try {
      await operation(id);
      successful++;
    } catch (error) {
      errors.push({
        id,
        name: await getResourceName(id),
        error: error.message,
        code: error.code,
      });
    }
  }

  return {
    total: items.length,
    successful,
    failed: errors.length,
    errors,
  };
}
```
