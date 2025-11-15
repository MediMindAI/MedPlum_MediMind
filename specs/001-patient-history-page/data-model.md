# Data Model: Patient History Page (ისტორია)

**Feature**: Patient History Page
**Date**: 2025-11-14
**Phase**: 1 (Data Model Design)

## Overview

This document defines the complete data model for the Patient History page, including FHIR R4 resource mappings, entity relationships, TypeScript interfaces, validation rules, and state transitions. All data structures follow the FHIR-first architecture principle (Constitution Principle I) and integrate with existing Patient resources from the Registration module.

## FHIR Resource Mappings

### 1. Encounter Resource (Patient Visit)

**Purpose**: Represents a single patient visit/interaction with the hospital.

**FHIR R4 Structure**:
```json
{
  "resourceType": "Encounter",
  "id": "enc-123",
  "identifier": [
    {
      "system": "http://medimind.ge/identifiers/visit-registration",
      "value": "10357-2025"
    }
  ],
  "status": "finished",
  "class": {
    "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
    "code": "IMP",
    "display": "inpatient encounter"
  },
  "subject": {
    "reference": "Patient/pat-456",
    "display": "თენგიზი ხოზვრია"
  },
  "participant": [
    {
      "type": [
        {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
              "code": "REF",
              "display": "referrer"
            }
          ]
        }
      ],
      "individual": {
        "reference": "Practitioner/pract-789"
      }
    }
  ],
  "period": {
    "start": "2025-11-10T20:30:00+04:00",
    "end": "2025-11-10T22:30:00+04:00"
  },
  "serviceProvider": {
    "reference": "Organization/org-001",
    "display": "MediMind Hospital"
  },
  "extension": [
    {
      "url": "http://medimind.ge/fhir/StructureDefinition/visit-type",
      "valueCodeableConcept": {
        "coding": [
          {
            "system": "http://medimind.ge/codesystem/visit-type",
            "code": "stationary",
            "display": "სტაციონარი"
          }
        ]
      }
    },
    {
      "url": "http://medimind.ge/fhir/StructureDefinition/coverage-primary",
      "valueReference": {
        "reference": "Coverage/cov-111"
      }
    },
    {
      "url": "http://medimind.ge/fhir/StructureDefinition/sender-organization",
      "valueReference": {
        "reference": "Organization/org-sender-001"
      }
    },
    {
      "url": "http://medimind.ge/fhir/StructureDefinition/sender-datetime",
      "valueDateTime": "2025-11-10T19:00:00+04:00"
    }
  ]
}
```

**Field Mappings**:

| Original EMR Field | FHIR Path | Data Type | Required | Notes |
|-------------------|-----------|-----------|----------|-------|
| სტაც. ნომერი (lak_dipens) | identifier[0].value (system: visit-registration) | string | Yes* | Stationary number format: "10357-2025" |
| ამბუ. ნომერი (lak_dipensNO) | identifier[1].value (system: ambulatory-registration) | string | Yes* | Ambulatory number format: "a-6871-2025" |
| თარიღი (lak_regdate) | period.start | dateTime | Yes | Visit admission datetime |
| გასვლის თარიღი | period.end | dateTime | No | Visit discharge datetime (for multitimestamp display) |
| შემოსვლის ტიპი (lak_regtype) | extension[visit-type].valueCodeableConcept | CodeableConcept | Yes | Registration type |
| ტიპი (mo_stat) | status | code | Yes | Visit status: "planned", "arrived", "in-progress", "finished" |
| სტაციონარის ტიპი (lak_ddyastac) | class.code | Coding | Yes | "IMP" (inpatient), "AMB" (ambulatory), "EMER" (emergency) |
| მომყვანი (mo_selsas) | participant[type=REF].individual | Reference(Practitioner) | No | Referrer |
| გამომგზავნი (ro_patsender) | extension[sender-organization] | Reference(Organization) | No | Sender organization |
| გამომგზავნ დაწესებულებაში მიმართვის თარიღი/დრო | extension[sender-datetime] | dateTime | No | Referral datetime |
| კომენტარი (lak_commt) | note[0].text | string | No | Visit comments |
| შემთხვევის # (casenomber) | extension[case-number] | string | No | Case number |

**Note**: Either stationary OR ambulatory number required, not both.

**Validation Rules**:
- `identifier[].value` must be unique across all Encounters
- `period.start` cannot be in the future
- `period.end` must be after `period.start` if present
- `status` must be one of: "planned", "arrived", "triaged", "in-progress", "onleave", "finished", "cancelled"
- `class.code` must be one of: "IMP" (inpatient), "AMB" (ambulatory), "EMER" (emergency), "VR" (virtual)

### 2. Coverage Resource (Insurance Policy)

**Purpose**: Represents insurance coverage information for a visit. Up to 3 Coverage resources can be linked to one Encounter.

**FHIR R4 Structure**:
```json
{
  "resourceType": "Coverage",
  "id": "cov-111",
  "identifier": [
    {
      "system": "http://medimind.ge/identifiers/policy-number",
      "value": "POL-2025-12345"
    }
  ],
  "status": "active",
  "type": {
    "coding": [
      {
        "system": "http://medimind.ge/codesystem/insurance-type",
        "code": "private",
        "display": "Private Insurance"
      }
    ]
  },
  "policyHolder": {
    "reference": "Patient/pat-456"
  },
  "subscriber": {
    "reference": "Patient/pat-456"
  },
  "beneficiary": {
    "reference": "Patient/pat-456"
  },
  "period": {
    "start": "2025-01-01",
    "end": "2025-12-31"
  },
  "payor": [
    {
      "reference": "Organization/org-insurance-8175",
      "display": "იმედი L"
    }
  ],
  "class": [
    {
      "type": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/coverage-class",
            "code": "plan"
          }
        ]
      },
      "value": "premium-plan"
    }
  ],
  "order": 1,
  "costToBeneficiary": [
    {
      "type": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/coverage-copay-type",
            "code": "copay"
          }
        ]
      },
      "valueQuantity": {
        "value": 20,
        "unit": "%",
        "system": "http://unitsofmeasure.org",
        "code": "%"
      }
    }
  ],
  "extension": [
    {
      "url": "http://medimind.ge/fhir/StructureDefinition/referral-number",
      "valueString": "REF-2025-001"
    }
  ]
}
```

**Field Mappings**:

| Original EMR Field | FHIR Path | Data Type | Required | Notes |
|-------------------|-----------|-----------|----------|-------|
| კომპანია (lak_comp, lak_comp1, lak_comp2) | payor[0].reference | Reference(Organization) | Yes | Insurance company (58 options) |
| ტიპი (lak_instp, lak_instp1, lak_instp2) | type.coding[0].code | code | Yes | Insurance type (49 options) |
| პოლისის # (lak_polnmb, lak_polnmb1, lak_polnmb2) | identifier[0].value | string | No | Policy number |
| მიმართვის # (lak_vano, lak_vano1, lak_vano2) | extension[referral-number] | string | No | Referral/authorization number |
| გაცემის თარიღი (lak_deldat, lak_deldat1, lak_deldat2) | period.start | date | No | Policy issue date |
| მოქმედების ვადა (lak_valdat, lak_valdat1, lak_valdat2) | period.end | date | No | Policy expiration date |
| თანაგადახდის % (lak_insprsnt, lak_insprsnt1, lak_insprsnt2) | costToBeneficiary[0].valueQuantity.value | decimal | No | Co-payment percentage (0-100) |
| დაზღვევა I/II/III | order | positiveInt | Yes | 1=primary, 2=secondary, 3=tertiary |

**Validation Rules**:
- `period.end` must be after `period.start` if both present
- `costToBeneficiary[].valueQuantity.value` must be between 0 and 100 (percentage)
- `order` must be 1, 2, or 3
- Maximum 3 Coverage resources per Encounter (enforced in Encounter.extension)

### 3. Patient Resource (Referenced)

**Purpose**: Provides patient demographic data for table display. NOT modified by patient history feature - single source of truth from Registration module.

**FHIR R4 Structure** (abbreviated - full structure in Registration module):
```json
{
  "resourceType": "Patient",
  "id": "pat-456",
  "identifier": [
    {
      "system": "http://medimind.ge/identifiers/personal-id",
      "value": "26001014632"
    }
  ],
  "name": [
    {
      "use": "official",
      "family": "ხოზვრია",
      "given": ["თენგიზი"],
      "extension": [
        {
          "url": "http://hl7.org/fhir/StructureDefinition/humanname-fathers-name",
          "valueString": "გიორგის"
        }
      ]
    }
  ],
  "telecom": [
    {
      "system": "phone",
      "value": "+995500050610"
    }
  ],
  "gender": "male",
  "birthDate": "1986-01-26",
  "address": [
    {
      "use": "home",
      "type": "physical",
      "text": "თბილისი, დიდუბე",
      "city": "თბილისი",
      "district": "დიდუბე",
      "state": "თბილისი",
      "country": "GE"
    }
  ]
}
```

**Query Pattern** (read-only):
```typescript
// Include Patient data in Encounter search
const bundle = await medplum.searchResources('Encounter', {
  _include: 'Encounter:patient',
  _sort: '-period-start',
  _count: 100
});

// Extract Patient from included resources
const patients = bundle.entry
  ?.filter(e => e.resource?.resourceType === 'Patient')
  .map(e => e.resource as Patient);
```

### 4. Organization Resource (Insurance Companies)

**Purpose**: Represents insurance companies/payers (58 options). Read-only reference data.

**FHIR R4 Structure** (example):
```json
{
  "resourceType": "Organization",
  "id": "org-insurance-628",
  "identifier": [
    {
      "system": "http://medimind.ge/identifiers/insurance-company",
      "value": "628"
    }
  ],
  "active": true,
  "type": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/organization-type",
          "code": "ins",
          "display": "Insurance Company"
        }
      ]
    }
  ],
  "name": "სსიპ ჯანმრთელობის ეროვნული სააგენტო",
  "alias": ["National Health Agency", "Национальное агентство здравоохранения"],
  "telecom": [
    {
      "system": "phone",
      "value": "+995322123456"
    }
  ]
}
```

**58 Insurance Organizations** (from spec - abbreviated list):
- 0: შიდა (Internal/Private pay)
- 628: სსიპ ჯანმრთელობის ეროვნული სააგენტო (National Health Agency)
- 6379: ს.ს. სადაზღვევო კომპანია "ჯიპიაი ჰოლდინგი" (GPI Holding)
- 6380: ალდაგი (Aldagi)
- ... (55 more - see spec appendices/insurance-companies.md for complete list)

## TypeScript Interfaces

### Core Entities

```typescript
// packages/app/src/emr/types/patient-history.ts

import type { Encounter, Patient, Coverage, Organization } from '@medplum/fhirtypes';

/**
 * Table row data for patient history display
 * Combines data from Encounter, Patient, and financial calculations
 */
export interface VisitTableRow {
  id: string;                          // Encounter.id
  encounterId: string;                 // Encounter.id (duplicate for clarity)
  patientId: string;                   // Patient.id
  personalId: string;                  // Patient.identifier (personal-id)
  firstName: string;                   // Patient.name[0].given[0]
  lastName: string;                    // Patient.name[0].family
  date: string;                        // Encounter.period.start (ISO 8601)
  endDate?: string;                    // Encounter.period.end (optional - for multitimestamp display)
  registrationNumber: string;          // Encounter.identifier (visit-registration or ambulatory-registration)
  total: number;                       // Financial calculation (from ChargeItem - future integration)
  discountPercent: number;             // Discount percentage (0-100)
  debt: number;                        // Calculated: total - payment
  payment: number;                     // Payment amount (from PaymentReconciliation - future integration)
  status: EncounterStatus;             // Encounter.status
  visitType: 'stationary' | 'ambulatory' | 'emergency';  // Encounter.class.code
  insuranceCompanyId?: string;         // Coverage.payor[0].reference
  insuranceCompanyName?: string;       // Organization.name (from payor)
}

/**
 * Search parameters for filtering patient history
 * Maps to FHIR search parameters
 */
export interface PatientHistorySearchParams {
  insuranceCompanyId?: string;         // Coverage.payor reference
  personalId?: string;                 // Patient.identifier
  firstName?: string;                  // Patient.name.given
  lastName?: string;                   // Patient.name.family
  dateFrom?: string;                   // Encounter.period >= dateFrom
  dateTo?: string;                     // Encounter.period <= dateTo
  registrationNumber?: string;         // Encounter.identifier (exact match)
  status?: EncounterStatus;            // Encounter.status
  visitType?: 'stationary' | 'ambulatory' | 'emergency';  // Encounter.class.code
}

/**
 * Form values for editing a visit
 * Maps to Encounter + Coverage resources (134 fields total)
 */
export interface VisitFormValues {
  // Registration section (რეგისტრაცია) - 14 fields
  visitDate: string;                   // lak_regdate → Encounter.period.start
  registrationType: string;            // lak_regtype → Encounter.extension[visit-type]
  stationaryNumber?: string;           // lak_dipens → Encounter.identifier[visit-registration]
  ambulatoryNumber?: string;           // lak_dipensNO → Encounter.identifier[ambulatory-registration]
  otherNumber?: string;                // rgVisitNo → Encounter.extension[other-number]
  statusType: string;                  // mo_stat → Encounter.status
  stationaryType: string;              // lak_ddyastac → Encounter.class.code
  stationaryTypeAll: string;           // lak_ddyastac_all → Encounter.extension[stationary-type-all]
  referralType: string;                // lak_incmtp → Encounter.extension[referral-type]
  referrer?: string;                   // mo_selsas → Encounter.participant[REF]
  sender?: string;                     // ro_patsender → Encounter.extension[sender-organization]
  senderDatetime?: string;             // lak_patsendrdatetime → Encounter.extension[sender-datetime]
  comments?: string;                   // lak_commt → Encounter.note[0].text
  caseNumber?: string;                 // casenomber → Encounter.extension[case-number]

  // Demographics section (დემოგრაფია) - 8 fields
  region?: string;                     // mo_regions → Patient.address[0].state (READ-ONLY from Patient)
  district?: string;                   // mo_raions → Patient.address[0].district (READ-ONLY)
  city?: string;                       // mo_city → Patient.address[0].city (READ-ONLY)
  actualAddress?: string;              // mo_otheraddress → Patient.address[0].text (READ-ONLY)
  education?: string;                  // mo_ganatleba → Patient.extension[education] (READ-ONLY)
  familyStatus?: string;               // no_ojaxi → Patient.extension[family-status] (READ-ONLY)
  employment?: string;                 // no_dasaqmeba → Patient.extension[employment] (READ-ONLY)

  // Primary insurance (დაზღვევა I) - 7 fields
  insuranceEnabled?: boolean;          // lak_sbool → Toggle for insurance section
  insuranceCompany?: string;           // lak_comp → Coverage.payor[0]
  insuranceType?: string;              // lak_instp → Coverage.type
  policyNumber?: string;               // lak_polnmb → Coverage.identifier[0].value
  referralNumber?: string;             // lak_vano → Coverage.extension[referral-number]
  issueDate?: string;                  // lak_deldat → Coverage.period.start
  expirationDate?: string;             // lak_valdat → Coverage.period.end
  copayPercent?: number;               // lak_insprsnt → Coverage.costToBeneficiary[0].valueQuantity

  // Secondary insurance (დაზღვევა II) - 7 fields
  insuranceCompany2?: string;          // lak_comp1 → Coverage.payor[0] (order=2)
  insuranceType2?: string;             // lak_instp1 → Coverage.type
  policyNumber2?: string;              // lak_polnmb1 → Coverage.identifier[0].value
  referralNumber2?: string;            // lak_vano1 → Coverage.extension[referral-number]
  issueDate2?: string;                 // lak_deldat1 → Coverage.period.start
  expirationDate2?: string;            // lak_valdat1 → Coverage.period.end
  copayPercent2?: number;              // lak_insprsnt1 → Coverage.costToBeneficiary[0].valueQuantity

  // Tertiary insurance (დაზღვევა III) - 7 fields
  insuranceCompany3?: string;          // lak_comp2 → Coverage.payor[0] (order=3)
  insuranceType3?: string;             // lak_instp2 → Coverage.type
  policyNumber3?: string;              // lak_polnmb2 → Coverage.identifier[0].value
  referralNumber3?: string;            // lak_vano2 → Coverage.extension[referral-number]
  issueDate3?: string;                 // lak_deldat2 → Coverage.period.start
  expirationDate3?: string;            // lak_valdat2 → Coverage.period.end
  copayPercent3?: number;              // lak_insprsnt2 → Coverage.costToBeneficiary[0].valueQuantity

  // Note: Additional 91+ fields from original form documented but not mapped here
  // See visit-edit-window.md for complete 134-field listing
}

/**
 * Insurance company dropdown option
 * Multilingual support (ka/en/ru)
 */
export interface InsuranceOption {
  id: string;                          // Organization.identifier.value (e.g., "628")
  value: string;                       // Organization.id (e.g., "org-insurance-628")
  label: {
    ka: string;                        // Organization.name (Georgian)
    en: string;                        // Organization.alias[0] (English)
    ru: string;                        // Organization.alias[1] (Russian)
  };
  type: 'government' | 'private' | 'hospital' | 'clinic' | 'other';
}

/**
 * Financial summary for a visit
 * Calculated from ChargeItem and PaymentReconciliation (future integration)
 */
export interface FinancialSummary {
  encounterId: string;                 // Encounter.id
  total: number;                       // Sum of ChargeItem.priceComponent.amount
  discountPercent: number;             // Discount percentage (0-100)
  discountAmount: number;              // Calculated: total * (discountPercent / 100)
  subtotal: number;                    // Calculated: total - discountAmount
  payment: number;                     // Sum of PaymentReconciliation.amount
  debt: number;                        // Calculated: subtotal - payment
  currency: 'GEL';                     // Georgian Lari (ISO 4217)
}

/**
 * Encounter status from FHIR R4
 */
export type EncounterStatus =
  | 'planned'
  | 'arrived'
  | 'triaged'
  | 'in-progress'
  | 'onleave'
  | 'finished'
  | 'cancelled'
  | 'entered-in-error'
  | 'unknown';
```

## Entity Relationships

```
┌─────────────┐
│   Patient   │ (from Registration module)
│             │
│ - personalId│───────┐
│ - name      │       │
│ - birthDate │       │ 1:N
└─────────────┘       │
                      │
                      ▼
             ┌─────────────────┐
             │    Encounter    │ (Patient Visit)
             │                 │
             │ - identifier    │ (registration number: unique)
             │ - period        │ (start/end datetime)
             │ - status        │ (finished, in-progress, etc.)
             │ - class         │ (stationary, ambulatory, emergency)
             │ - participant   │──────► Practitioner (referrer)
             │ - serviceProvider│──────► Organization (hospital)
             └────┬────────────┘
                  │
                  │ 1:3 (max 3 insurance policies)
                  │
                  ▼
          ┌──────────────┐
          │   Coverage   │ (Insurance Policy)
          │              │
          │ - order      │ (1=primary, 2=secondary, 3=tertiary)
          │ - payor      │──────► Organization (insurance company)
          │ - period     │ (policy validity)
          │ - costTo...  │ (co-payment percentage)
          └──────────────┘
                  │
                  │ N:1
                  │
                  ▼
        ┌──────────────────┐
        │  Organization    │ (Insurance Company)
        │                  │
        │ - name (ka)      │ (58 options)
        │ - alias (en, ru) │
        │ - type           │ (government, private, hospital)
        └──────────────────┘

Financial Data (future integration):
┌─────────────────┐
│   ChargeItem    │ (Services/Procedures)
│                 │
│ - subject       │──────► Encounter
│ - code          │ (service/procedure code)
│ - priceComponent│ (amount)
└─────────────────┘

┌──────────────────────┐
│ PaymentReconciliation│ (Payments)
│                      │
│ - request           │──────► Encounter
│ - amount            │ (payment amount)
│ - paymentDate       │
└──────────────────────┘
```

## Validation Rules

### Encounter Validation

```typescript
export const validateEncounter = (values: VisitFormValues): ValidationResult => {
  const errors: Record<string, string> = {};

  // Required fields
  if (!values.visitDate) {
    errors.visitDate = 'Visit date is required';
  }

  if (!values.registrationType) {
    errors.registrationType = 'Registration type is required';
  }

  // Either stationary OR ambulatory number required
  if (!values.stationaryNumber && !values.ambulatoryNumber) {
    errors.registrationNumber = 'Either stationary or ambulatory registration number is required';
  }

  // Date validation
  if (values.visitDate) {
    const visitDate = new Date(values.visitDate);
    const now = new Date();
    if (visitDate > now) {
      errors.visitDate = 'Visit date cannot be in the future';
    }
  }

  // Registration number format
  if (values.stationaryNumber && !/^\d{5}-\d{4}$/.test(values.stationaryNumber)) {
    errors.stationaryNumber = 'Stationary number must be in format: 10357-2025';
  }

  if (values.ambulatoryNumber && !/^a-\d{4}-\d{4}$/.test(values.ambulatoryNumber)) {
    errors.ambulatoryNumber = 'Ambulatory number must be in format: a-6871-2025';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};
```

### Coverage Validation

```typescript
export const validateCoverage = (values: VisitFormValues, order: 1 | 2 | 3): ValidationResult => {
  const errors: Record<string, string> = {};
  const prefix = order === 1 ? '' : order.toString();

  const companyField = `insuranceCompany${prefix}` as keyof VisitFormValues;
  const issueField = `issueDate${prefix}` as keyof VisitFormValues;
  const expirationField = `expirationDate${prefix}` as keyof VisitFormValues;
  const copayField = `copayPercent${prefix}` as keyof VisitFormValues;

  // If any insurance field filled, company is required
  const anyFieldFilled = values[issueField] || values[expirationField] || values[copayField];
  if (anyFieldFilled && !values[companyField]) {
    errors[companyField] = 'Insurance company is required when other insurance fields are filled';
  }

  // Date validation
  if (values[issueField] && values[expirationField]) {
    const issueDate = new Date(values[issueField] as string);
    const expirationDate = new Date(values[expirationField] as string);
    if (expirationDate <= issueDate) {
      errors[expirationField] = 'Expiration date must be after issue date';
    }
  }

  // Co-payment percentage validation
  if (values[copayField] !== undefined) {
    const copay = values[copayField] as number;
    if (copay < 0 || copay > 100) {
      errors[copayField] = 'Co-payment percentage must be between 0 and 100';
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};
```

### Financial Calculation

```typescript
export const calculateFinancials = (
  total: number,
  discountPercent: number,
  payment: number
): FinancialSummary => {
  const discountAmount = total * (discountPercent / 100);
  const subtotal = total - discountAmount;
  const debt = subtotal - payment;

  return {
    total,
    discountPercent,
    discountAmount,
    subtotal,
    payment,
    debt: Math.max(0, debt), // Debt cannot be negative in this view
    currency: 'GEL',
  };
};
```

## State Transitions

### Encounter Status Workflow

```
┌─────────┐
│ planned │ (visit scheduled)
└────┬────┘
     │ patient arrives
     ▼
┌─────────┐
│ arrived │ (patient checked in)
└────┬────┘
     │ triage/assessment
     ▼
┌─────────┐
│ triaged │ (initial assessment done)
└────┬────┘
     │ begin treatment
     ▼
┌─────────────┐
│ in-progress │ (treatment ongoing)
└─────┬───────┘
      │
      ├──► ┌─────────┐
      │    │ onleave │ (temporarily left - e.g., tests)
      │    └────┬────┘
      │         │ return
      │◄────────┘
      │
      │ discharge
      ▼
┌──────────┐
│ finished │ (visit completed)
└──────────┘

Alternative endings:
┌───────────┐
│ cancelled │ (visit cancelled before completion)
└───────────┘

┌──────────────────┐
│ entered-in-error │ (created by mistake - soft delete)
└──────────────────┘
```

**Transition Rules**:
- `planned` → `arrived`: Patient arrives at hospital
- `arrived` → `triaged`: Initial assessment completed
- `triaged` → `in-progress`: Treatment begins
- `in-progress` → `onleave`: Patient temporarily leaves (e.g., for tests)
- `onleave` → `in-progress`: Patient returns
- `in-progress` → `finished`: Visit completed, patient discharged
- Any status → `cancelled`: Visit cancelled
- Any status → `entered-in-error`: Correction needed (administrative)

## Data Access Patterns

### Query 1: List Patient Visits (Table Display)

```typescript
// Fetch visits with patient data and insurance info
const searchParams: PatientHistorySearchParams = {
  insuranceCompanyId: 'Organization/org-insurance-628',
  dateFrom: '2025-01-01',
  dateTo: '2025-12-31',
};

const bundle = await medplum.searchResources('Encounter', {
  _include: 'Encounter:patient',
  _include: 'Encounter:coverage',
  _sort: '-period-start',
  _count: 100,
  'coverage.payor': searchParams.insuranceCompanyId,
  'period': `ge${searchParams.dateFrom}`,
  'period': `le${searchParams.dateTo}`,
});

// Transform to table rows
const visits: VisitTableRow[] = bundle.entry
  ?.filter(e => e.resource?.resourceType === 'Encounter')
  .map(e => mapEncounterToTableRow(e.resource as Encounter, bundle))
  ?? [];
```

### Query 2: Get Single Visit for Editing

```typescript
const encounter = await medplum.readResource('Encounter', encounterId);
const patient = await medplum.readReference(encounter.subject as Reference<Patient>);
const coverages = await fetchCoveragesForEncounter(medplum, encounterId);

const formValues = mapEncounterToFormValues(encounter, patient, coverages);
```

### Mutation 1: Update Visit

```typescript
const updateVisit = async (encounterId: string, values: VisitFormValues) => {
  // 1. Update Encounter
  const encounter = await medplum.readResource('Encounter', encounterId);
  const updatedEncounter = applyFormValuesToEncounter(encounter, values);
  await medplum.updateResource(updatedEncounter);

  // 2. Update or create Coverages (up to 3)
  if (values.insuranceCompany) {
    await upsertCoverage(medplum, encounter, values, 1);
  }
  if (values.insuranceCompany2) {
    await upsertCoverage(medplum, encounter, values, 2);
  }
  if (values.insuranceCompany3) {
    await upsertCoverage(medplum, encounter, values, 3);
  }
};
```

### Mutation 2: Delete Visit

```typescript
const deleteVisit = async (encounterId: string) => {
  // 1. Check permissions
  if (!hasDeletePermission(currentUser)) {
    throw new Error('Insufficient permissions');
  }

  // 2. Soft delete: set status to entered-in-error
  const encounter = await medplum.readResource('Encounter', encounterId);
  encounter.status = 'entered-in-error';
  await medplum.updateResource(encounter);

  // Note: Hard delete via medplum.deleteResource() only for admin with confirmation
};
```

## Summary

This data model provides:
- ✅ Complete FHIR R4 resource mappings (Encounter, Coverage, Patient, Organization)
- ✅ TypeScript interfaces for all entities (VisitTableRow, VisitFormValues, InsuranceOption, FinancialSummary)
- ✅ Validation rules for data integrity
- ✅ State transition diagram for Encounter status workflow
- ✅ Query and mutation patterns for common operations

All structures follow FHIR-first architecture and integrate seamlessly with Medplum SDK and existing Registration module.
