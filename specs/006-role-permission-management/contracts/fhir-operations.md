# FHIR API Contracts: Role and Permission Management

**Date**: 2025-11-20
**Feature**: Role and Permission Management
**Base URL**: `https://{medplum-server}/fhir/R4`

## Overview

All role and permission operations use standard FHIR REST API operations on AccessPolicy, PractitionerRole, and AuditEvent resources. No custom endpoints required.

---

## 1. Role Management Operations

### 1.1 Create Role

**Operation**: `POST /AccessPolicy`

**Request Headers**:
```http
POST /fhir/R4/AccessPolicy HTTP/1.1
Host: {medplum-server}
Authorization: Bearer {access-token}
Content-Type: application/fhir+json
```

**Request Body**:
```json
{
  "resourceType": "AccessPolicy",
  "meta": {
    "tag": [
      {
        "system": "http://medimind.ge/role-identifier",
        "code": "physician",
        "display": "Physician"
      },
      {
        "system": "http://medimind.ge/role-status",
        "code": "active",
        "display": "Active"
      }
    ]
  },
  "description": "Medical doctor with full patient access",
  "resource": [
    {
      "resourceType": "Patient",
      "readonly": false
    },
    {
      "resourceType": "Encounter",
      "readonly": false
    }
  ]
}
```

**Response** (201 Created):
```json
{
  "resourceType": "AccessPolicy",
  "id": "role-physician-12345",
  "meta": {
    "versionId": "1",
    "lastUpdated": "2025-11-20T10:30:00Z",
    "tag": [
      {
        "system": "http://medimind.ge/role-identifier",
        "code": "physician",
        "display": "Physician"
      },
      {
        "system": "http://medimind.ge/role-status",
        "code": "active",
        "display": "Active"
      }
    ]
  },
  "description": "Medical doctor with full patient access",
  "resource": [
    {
      "resourceType": "Patient",
      "readonly": false
    },
    {
      "resourceType": "Encounter",
      "readonly": false
    }
  ]
}
```

**Error** (400 Bad Request - Duplicate):
```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "duplicate",
      "diagnostics": "A role with code 'physician' already exists"
    }
  ]
}
```

---

### 1.2 Search Roles

**Operation**: `GET /AccessPolicy?_tag=http://medimind.ge/role-identifier|{code}`

**Search All Roles**:
```http
GET /fhir/R4/AccessPolicy?_tag=http://medimind.ge/role-identifier&_count=20&_sort=-_lastUpdated HTTP/1.1
Host: {medplum-server}
Authorization: Bearer {access-token}
```

**Search Active Roles Only**:
```http
GET /fhir/R4/AccessPolicy?_tag=http://medimind.ge/role-identifier&_tag=http://medimind.ge/role-status|active HTTP/1.1
```

**Search by Role Code**:
```http
GET /fhir/R4/AccessPolicy?_tag=http://medimind.ge/role-identifier|physician HTTP/1.1
```

**Search by Name (contains)**:
```http
GET /fhir/R4/AccessPolicy?_tag=http://medimind.ge/role-identifier&_text=physician HTTP/1.1
```

**Response** (200 OK):
```json
{
  "resourceType": "Bundle",
  "type": "searchset",
  "total": 1,
  "entry": [
    {
      "resource": {
        "resourceType": "AccessPolicy",
        "id": "role-physician-12345",
        "meta": {
          "versionId": "1",
          "lastUpdated": "2025-11-20T10:30:00Z",
          "tag": [
            {
              "system": "http://medimind.ge/role-identifier",
              "code": "physician",
              "display": "Physician"
            },
            {
              "system": "http://medimind.ge/role-status",
              "code": "active",
              "display": "Active"
            }
          ]
        },
        "description": "Medical doctor with full patient access",
        "resource": [
          {
            "resourceType": "Patient",
            "readonly": false
          }
        ]
      }
    }
  ]
}
```

---

### 1.3 Get Role by ID

**Operation**: `GET /AccessPolicy/{id}`

**Request**:
```http
GET /fhir/R4/AccessPolicy/role-physician-12345 HTTP/1.1
Host: {medplum-server}
Authorization: Bearer {access-token}
```

**Response** (200 OK):
```json
{
  "resourceType": "AccessPolicy",
  "id": "role-physician-12345",
  "meta": {
    "versionId": "2",
    "lastUpdated": "2025-11-20T11:00:00Z",
    "tag": [
      {
        "system": "http://medimind.ge/role-identifier",
        "code": "physician",
        "display": "Physician"
      },
      {
        "system": "http://medimind.ge/role-status",
        "code": "active",
        "display": "Active"
      }
    ]
  },
  "description": "Medical doctor with full patient access",
  "resource": [
    {
      "resourceType": "Patient",
      "readonly": false
    },
    {
      "resourceType": "Encounter",
      "readonly": false
    }
  ]
}
```

---

### 1.4 Update Role

**Operation**: `PUT /AccessPolicy/{id}`

**Request**:
```http
PUT /fhir/R4/AccessPolicy/role-physician-12345 HTTP/1.1
Host: {medplum-server}
Authorization: Bearer {access-token}
Content-Type: application/fhir+json
```

**Request Body**:
```json
{
  "resourceType": "AccessPolicy",
  "id": "role-physician-12345",
  "meta": {
    "versionId": "1",
    "tag": [
      {
        "system": "http://medimind.ge/role-identifier",
        "code": "senior-physician",
        "display": "Senior Physician"
      },
      {
        "system": "http://medimind.ge/role-status",
        "code": "active",
        "display": "Active"
      }
    ]
  },
  "description": "Senior medical doctor with extended privileges",
  "resource": [
    {
      "resourceType": "Patient",
      "readonly": false
    },
    {
      "resourceType": "Encounter",
      "readonly": false
    },
    {
      "resourceType": "Observation",
      "readonly": false
    }
  ]
}
```

**Response** (200 OK):
```json
{
  "resourceType": "AccessPolicy",
  "id": "role-physician-12345",
  "meta": {
    "versionId": "2",
    "lastUpdated": "2025-11-20T11:00:00Z",
    "tag": [
      {
        "system": "http://medimind.ge/role-identifier",
        "code": "senior-physician",
        "display": "Senior Physician"
      },
      {
        "system": "http://medimind.ge/role-status",
        "code": "active",
        "display": "Active"
      }
    ]
  },
  "description": "Senior medical doctor with extended privileges",
  "resource": [
    {
      "resourceType": "Patient",
      "readonly": false
    },
    {
      "resourceType": "Encounter",
      "readonly": false
    },
    {
      "resourceType": "Observation",
      "readonly": false
    }
  ]
}
```

---

### 1.5 Deactivate Role (Soft Delete)

**Operation**: `PUT /AccessPolicy/{id}` (add inactive tag)

**Request Body**:
```json
{
  "resourceType": "AccessPolicy",
  "id": "role-physician-12345",
  "meta": {
    "versionId": "2",
    "tag": [
      {
        "system": "http://medimind.ge/role-identifier",
        "code": "physician",
        "display": "Physician"
      },
      {
        "system": "http://medimind.ge/role-status",
        "code": "inactive",
        "display": "Inactive"
      }
    ]
  },
  "description": "Medical doctor with full patient access",
  "resource": [...]
}
```

---

### 1.6 Delete Role (Permanent)

**Operation**: `DELETE /AccessPolicy/{id}`

**Request**:
```http
DELETE /fhir/R4/AccessPolicy/role-physician-12345 HTTP/1.1
Host: {medplum-server}
Authorization: Bearer {access-token}
```

**Response** (204 No Content)

**Error** (400 Bad Request - Has Assigned Users):
```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "business-rule",
      "diagnostics": "Cannot delete role with assigned users. Remove all user assignments first."
    }
  ]
}
```

---

## 2. Role Assignment Operations

### 2.1 Assign Role to User

**Operation**: `POST /PractitionerRole`

**Request Body**:
```json
{
  "resourceType": "PractitionerRole",
  "active": true,
  "practitioner": {
    "reference": "Practitioner/practitioner-456",
    "display": "Dr. Tengizi Khosvria"
  },
  "meta": {
    "tag": [
      {
        "system": "http://medimind.ge/role-assignment",
        "code": "physician",
        "display": "Physician"
      }
    ]
  }
}
```

**Response** (201 Created):
```json
{
  "resourceType": "PractitionerRole",
  "id": "role-assignment-789",
  "meta": {
    "versionId": "1",
    "lastUpdated": "2025-11-20T10:45:00Z",
    "tag": [
      {
        "system": "http://medimind.ge/role-assignment",
        "code": "physician",
        "display": "Physician"
      }
    ]
  },
  "active": true,
  "practitioner": {
    "reference": "Practitioner/practitioner-456",
    "display": "Dr. Tengizi Khosvria"
  }
}
```

---

### 2.2 Get User's Assigned Roles

**Operation**: `GET /PractitionerRole?practitioner=Practitioner/{id}`

**Request**:
```http
GET /fhir/R4/PractitionerRole?practitioner=Practitioner/practitioner-456&_tag=http://medimind.ge/role-assignment HTTP/1.1
```

**Response** (200 OK):
```json
{
  "resourceType": "Bundle",
  "type": "searchset",
  "total": 2,
  "entry": [
    {
      "resource": {
        "resourceType": "PractitionerRole",
        "id": "role-assignment-789",
        "meta": {
          "tag": [
            {
              "system": "http://medimind.ge/role-assignment",
              "code": "physician",
              "display": "Physician"
            }
          ]
        },
        "active": true,
        "practitioner": {
          "reference": "Practitioner/practitioner-456"
        }
      }
    },
    {
      "resource": {
        "resourceType": "PractitionerRole",
        "id": "role-assignment-790",
        "meta": {
          "tag": [
            {
              "system": "http://medimind.ge/role-assignment",
              "code": "department-head",
              "display": "Department Head"
            }
          ]
        },
        "active": true,
        "practitioner": {
          "reference": "Practitioner/practitioner-456"
        }
      }
    }
  ]
}
```

---

### 2.3 Remove Role from User

**Operation**: `DELETE /PractitionerRole/{id}`

**Request**:
```http
DELETE /fhir/R4/PractitionerRole/role-assignment-789 HTTP/1.1
Host: {medplum-server}
Authorization: Bearer {access-token}
```

**Response** (204 No Content)

---

## 3. Audit Trail Operations

### 3.1 Log Role Change

**Operation**: `POST /AuditEvent`

**Request Body** (Role Created):
```json
{
  "resourceType": "AuditEvent",
  "type": {
    "system": "http://dicom.nema.org/resources/ontology/DCM",
    "code": "110113",
    "display": "Security Alert"
  },
  "subtype": [{
    "system": "http://dicom.nema.org/resources/ontology/DCM",
    "code": "110137",
    "display": "User Security Attributes Changed"
  }],
  "action": "C",
  "recorded": "2025-11-20T10:30:00Z",
  "outcome": "0",
  "outcomeDesc": "Role 'Physician' created successfully",
  "agent": [{
    "who": {
      "reference": "Practitioner/admin-789",
      "display": "Admin User"
    },
    "requestor": true
  }],
  "entity": [{
    "what": {
      "reference": "AccessPolicy/role-physician-12345",
      "display": "Physician"
    },
    "type": {
      "system": "http://terminology.hl7.org/CodeSystem/audit-entity-type",
      "code": "2",
      "display": "System Object"
    },
    "detail": [
      {
        "type": "action",
        "valueString": "create"
      },
      {
        "type": "permissions",
        "valueString": "view-patient-demographics, edit-patient-demographics"
      }
    ]
  }]
}
```

---

## 4. Permission Check Operations

### 4.1 Get User's Effective Permissions

**Operation**: Custom query combining AccessPolicy + PractitionerRole

**Algorithm**:
```typescript
async function getUserPermissions(
  medplum: MedplumClient,
  practitionerId: string
): Promise<string[]> {
  // 1. Get user's PractitionerRole resources
  const roles = await medplum.searchResources('PractitionerRole', {
    practitioner: `Practitioner/${practitionerId}`,
    _tag: 'http://medimind.ge/role-assignment'
  });

  // 2. Extract role codes from PractitionerRole.meta.tag
  const roleCodes = roles.flatMap(role =>
    role.meta?.tag
      ?.filter(tag => tag.system === 'http://medimind.ge/role-assignment')
      .map(tag => tag.code) || []
  );

  // 3. Fetch AccessPolicy resources for each role
  const policies = await Promise.all(
    roleCodes.map(code =>
      medplum.searchResources('AccessPolicy', {
        _tag: `http://medimind.ge/role-identifier|${code}`
      })
    )
  );

  // 4. Aggregate permissions (union of all roles)
  const allPermissions = new Set<string>();
  policies.flat().forEach(policy => {
    const permissions = extractPermissionsFromPolicy(policy);
    permissions.forEach(p => allPermissions.add(p));
  });

  return Array.from(allPermissions);
}
```

---

## 5. Search Parameters

### AccessPolicy Search Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `_tag` | token | Filter by meta.tag | `_tag=http://medimind.ge/role-identifier\|physician` |
| `_text` | string | Full-text search | `_text=physician` |
| `_count` | number | Results per page | `_count=20` |
| `_sort` | string | Sort order | `_sort=-_lastUpdated` |
| `_lastUpdated` | date | Filter by last modified date | `_lastUpdated=ge2025-11-01` |

### PractitionerRole Search Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `practitioner` | reference | Filter by practitioner | `practitioner=Practitioner/123` |
| `_tag` | token | Filter by role assignment tag | `_tag=http://medimind.ge/role-assignment` |
| `active` | token | Filter by active status | `active=true` |

---

## 6. Real-Time Updates (WebSocket Subscription)

### 6.1 Subscribe to Role Changes

**Operation**: Create FHIR Subscription

**Request**:
```json
{
  "resourceType": "Subscription",
  "status": "active",
  "reason": "Notify admins of role/permission changes",
  "criteria": "AccessPolicy?_tag=http://medimind.ge/role-identifier",
  "channel": {
    "type": "websocket"
  }
}
```

**WebSocket Connection**:
```javascript
const ws = new WebSocket('wss://{medplum-server}/ws/subscriptions/{subscription-id}');

ws.addEventListener('message', (event) => {
  const update = JSON.parse(event.data);
  console.log('Role updated:', update);
  // Refresh roles list
});
```

---

## 7. Error Codes

| HTTP Status | FHIR Issue Code | Description |
|-------------|-----------------|-------------|
| 400 | `duplicate` | Role code or name already exists |
| 400 | `business-rule` | Cannot delete role with assigned users |
| 400 | `required` | Missing required field (code or name) |
| 401 | `security` | Unauthorized - invalid or expired token |
| 403 | `forbidden` | Forbidden - insufficient permissions |
| 404 | `not-found` | Role not found |
| 409 | `conflict` | Version conflict (concurrent update) |
| 422 | `invalid` | Invalid FHIR resource structure |

---

## 8. Rate Limits

- **Search operations**: 100 requests/minute per user
- **Create/Update/Delete**: 50 requests/minute per user
- **WebSocket connections**: 10 concurrent connections per user

---

## 9. Security Requirements

### Authentication
- All requests MUST include valid Bearer token in Authorization header
- Tokens expire after 1 hour (configurable)

### Authorization
- User MUST have `create-role` permission to create roles
- User MUST have `edit-role` permission to update roles
- User MUST have `delete-role` permission to delete roles
- User MUST have `assign-roles` permission to assign/remove role assignments

### Audit
- All role CRUD operations MUST create AuditEvent resources
- AuditEvents MUST include: timestamp, actor, action, target role, outcome
