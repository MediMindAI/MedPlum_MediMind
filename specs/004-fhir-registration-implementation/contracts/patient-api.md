# Patient Registration API Contract

**Version**: 1.0.0
**Base URL**: `{medplum-server}/fhir/R4`
**Authentication**: OAuth 2.0 Bearer Token

---

## Overview

This API contract defines FHIR REST operations for patient registration workflows. All endpoints follow FHIR R4 specification with Georgian-specific extensions.

---

## Patient Operations

### 1. Search Patients

**Endpoint**: `GET /Patient`

**Query Parameters**:
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `identifier` | token | No | Search by identifier (personal ID or registration number) | `http://medimind.ge/identifiers/personal-id\|26001014632` |
| `given` | string | No | Search by first name (partial match) | `თენგიზი` |
| `family` | string | No | Search by last name (partial match) | `ხოზვრია` |
| `birthdate` | date | No | Exact birth date | `1986-01-26` |
| `_sort` | string | No | Sort order | `-_lastUpdated` (newest first) |
| `_count` | number | No | Page size | `20` |
| `_offset` | number | No | Offset for pagination | `0` |

**Response**: `200 OK`
```json
{
  "resourceType": "Bundle",
  "type": "searchset",
  "total": 1,
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "id": "patient-123",
        "identifier": [
          {
            "system": "http://medimind.ge/identifiers/personal-id",
            "value": "26001014632"
          }
        ],
        "name": [
          {
            "family": "ხოზვრია",
            "given": ["თენგიზი"]
          }
        ],
        "gender": "male",
        "birthDate": "1986-01-26"
      }
    }
  ]
}
```

---

### 2. Create Patient

**Endpoint**: `POST /Patient`

**Request Body**:
```json
{
  "resourceType": "Patient",
  "identifier": [
    {
      "system": "http://medimind.ge/identifiers/personal-id",
      "value": "26001014632",
      "use": "official"
    }
  ],
  "name": [
    {
      "use": "official",
      "family": "ხოზვრია",
      "given": ["თენგიზი"],
      "extension": [
        {
          "url": "http://medimind.ge/fhir/StructureDefinition/patronymic",
          "valueString": "გიორგის"
        }
      ]
    }
  ],
  "gender": "male",
  "birthDate": "1986-01-26",
  "telecom": [
    {
      "system": "phone",
      "value": "+995500050610",
      "use": "mobile"
    }
  ],
  "address": [
    {
      "use": "home",
      "text": "საქართველო, თბილისი"
    }
  ],
  "extension": [
    {
      "url": "http://medimind.ge/fhir/StructureDefinition/citizenship",
      "valueCodeableConcept": {
        "coding": [
          {
            "system": "urn:iso:std:iso:3166",
            "code": "GE"
          }
        ]
      }
    }
  ]
}
```

**Response**: `201 Created`
```json
{
  "resourceType": "Patient",
  "id": "patient-456",
  "meta": {
    "versionId": "1",
    "lastUpdated": "2025-11-12T14:30:00Z"
  },
  "identifier": [
    {
      "system": "http://medimind.ge/identifiers/personal-id",
      "value": "26001014632"
    },
    {
      "system": "http://medimind.ge/identifiers/registration-number",
      "value": "98961"
    }
  ]
  // ... rest of resource
}
```

---

### 3. Read Patient

**Endpoint**: `GET /Patient/{id}`

**Response**: `200 OK` - Returns complete Patient resource

---

### 4. Update Patient

**Endpoint**: `PUT /Patient/{id}`

**Request Body**: Complete Patient resource with modifications

**Response**: `200 OK` - Returns updated Patient resource

---

### 5. Delete Patient (Soft)

**Endpoint**: `DELETE /Patient/{id}`

**Response**: `204 No Content`

**Note**: Implementation uses soft delete (archive) to preserve audit trail

---

## RelatedPerson Operations

### 1. Search Representatives

**Endpoint**: `GET /RelatedPerson?patient=Patient/{id}`

**Response**: `200 OK` - Bundle of RelatedPerson resources linked to patient

---

### 2. Create Representative

**Endpoint**: `POST /RelatedPerson`

**Request Body**:
```json
{
  "resourceType": "RelatedPerson",
  "patient": {
    "reference": "Patient/patient-456"
  },
  "relationship": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/v3-RoleCode",
          "code": "MTH",
          "display": "Mother"
        }
      ],
      "text": "დედა"
    }
  ],
  "name": [
    {
      "family": "გელაშვილი",
      "given": ["ნინო"]
    }
  ],
  "identifier": [
    {
      "system": "http://medimind.ge/identifiers/personal-id",
      "value": "12345678901"
    }
  ],
  "telecom": [
    {
      "system": "phone",
      "value": "+995555123456"
    }
  ]
}
```

**Response**: `201 Created` - Returns created RelatedPerson resource

---

## Error Responses

### Validation Error

**Status**: `400 Bad Request`
```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "invalid",
      "diagnostics": "Invalid Georgian personal ID format: must be 11 digits"
    }
  ]
}
```

### Duplicate Personal ID

**Status**: `409 Conflict`
```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "duplicate",
      "diagnostics": "Patient with personal ID 26001014632 already exists",
      "expression": ["Patient.identifier"]
    }
  ]
}
```

---

## Client SDK Usage (TypeScript)

```typescript
import { MedplumClient } from '@medplum/core';
import { Patient, RelatedPerson } from '@medplum/fhirtypes';

const medplum = new MedplumClient({
  baseUrl: 'https://api.medimind.ge',
  // ... auth config
});

// Search patients
const results = await medplum.searchResources('Patient', {
  given: 'თენგიზი',
  family: 'ხოზვრია'
});

// Create patient
const patient = await medplum.createResource<Patient>({
  resourceType: 'Patient',
  // ... patient data
});

// Get representatives
const representatives = await medplum.searchResources('RelatedPerson', {
  patient: `Patient/${patient.id}`
});
```

---

**Contract Version**: 1.0.0
**Last Updated**: 2025-11-12
**FHIR Conformance**: R4 (4.0.1)
