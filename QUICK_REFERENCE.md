# Medplum Data Structures - Quick Reference Guide

## Type File Quick Lookup

| Type File | Purpose | Main Interfaces | FHIR Resources |
|-----------|---------|-----------------|-----------------|
| `account-management.ts` | User accounts & roles | AccountFormValues, RoleAssignment, PermissionMatrix | Practitioner, PractitionerRole, AccessPolicy, AuditEvent |
| `patient-history.ts` | Visit records & billing | VisitTableRow, VisitFormValues (134 fields), FinancialSummary | Encounter, Coverage, Patient |
| `nomenclature.ts` | Medical services catalog | ServiceFormValues, ServiceTableRow, ServiceSearchParams | ActivityDefinition |
| `laboratory.ts` | Lab definitions | ResearchComponentFormValues, SampleFormValues, SyringeFormValues | ObservationDefinition, SpecimenDefinition, DeviceDefinition |
| `form-builder.ts` | Form templates & fields | FormTemplate, FieldConfig, PatientBinding, BindingKey | Questionnaire, QuestionnaireResponse |
| `patient-binding.ts` | Patient data extraction | FHIRPathEvaluationResult, PatientDataSource | Patient, Encounter, RelatedPerson |
| `role-management.ts` | Role definitions | RoleOption, SpecialtyOption | AccessPolicy |

---

## Service File Quick Lookup

### Core Helpers
| Service | Purpose | Key Functions |
|---------|---------|---------------|
| `fhirHelpers.ts` | FHIR data extraction | getIdentifierValue(), getNameParts(), getTelecomValue(), getExtensionValue(), mapEncounterToTableRow() |
| `accountHelpers.ts` | Practitioner extraction | getPractitionerName(), getPractitionerEmail(), getPractitionerPhone(), formValuesToPractitioner() |
| `nomenclatureHelpers.ts` | Service extraction | getExtensionString(), getExtensionObject(), getExtensionBoolean(), mapServiceToTableRow() |

### CRUD Services
| Service | Resource Type | Key Functions |
|---------|---------------|---------------|
| `accountService.ts` | Practitioner | createPractitioner(), searchPractitioners(), updatePractitioner(), deactivatePractitioner(), bulkDeactivate(), bulkAssignRole() |
| `patientHistoryService.ts` | Encounter | searchEncounters(), getEncounterById(), updateEncounter(), deleteEncounter(), hardDeleteEncounter() |
| `auditService.ts` | AuditEvent | createAuditEvent(), searchAuditEvents(), getAccountAuditHistory() |
| `roleService.ts` | AccessPolicy | searchRoles(), createRole(), updateRole(), assignRoleToUser(), deactivateRole(), hardDeleteRole(), getRoleUserCount() |
| `nomenclatureService.ts` | ActivityDefinition | searchServices(), createService(), updateService(), deleteService(), hardDeleteService() |
| `permissionService.ts` | AccessPolicy | getPermissionMatrix(), updatePermissionMatrix(), detectRoleConflicts(), resolvePermissionDependencies() |
| `invitationService.ts` | Invite | getInvitationStatus(), findInviteForPractitioner(), resendInvitation(), generateActivationLink() |

### Lab Services
| Service | Resource Type |
|---------|---------------|
| `sampleService.ts` | SpecimenDefinition |
| `manipulationService.ts` | ActivityDefinition |
| `syringeService.ts` | DeviceDefinition |
| `researchComponentService.ts` | ObservationDefinition |

### Export & Validation
| Service | Purpose | Key Functions |
|---------|---------|---------------|
| `exportService.ts` | Data export | exportToExcel(), exportToCSV(), exportAuditLogs() |
| `accountValidators.ts` | Input validation | validateEmail(), validatePhoneNumber(), validateHireDate(), validateStaffId() |
| `formValidationService.ts` | Form validation | validateQuestionnaireResponse(), getFieldValidationConfig() |

---

## Extension URLs Quick Reference

### All Extension URLs (http://medimind.ge/...)

```
IDENTIFIERS:
  /identifiers/personal-id                 → 11-digit Georgian ID
  /identifiers/registration-number         → Patient reg number
  /identifiers/staff-id                    → Staff employee ID
  /identifiers/ambulatory-registration     → Ambulatory visit ID
  /identifiers/visit-registration          → Stationary visit ID
  /identifiers/unknown-patient-registration → Emergency patient ID
  /nomenclature/service-code               → Medical service code
  /lab/component-code                      → Lab parameter code
  /lab/gis-code                           → GIS integration code

FINANCIAL:
  /fhir/StructureDefinition/total-amount           → Encounter total cost
  /fhir/StructureDefinition/discount-percent       → Discount %
  /fhir/StructureDefinition/payment-amount         → Amount paid
  /fhir/StructureDefinition/debt-amount            → Outstanding debt
  /extensions/referral-number                      → Insurance referral

NOMENCLATURE (ActivityDefinition):
  /extensions/service-type                 → Service type
  /extensions/service-category             → ambulatory|stationary|both
  /extensions/service-subgroup             → Medical specialty
  /extensions/base-price                   → Service price
  /extensions/total-amount                 → Total service amount
  /extensions/cal-hed                      → Calculator count
  /extensions/printable                    → Printable flag
  /extensions/item-get-price               → Item pricing count
  /extensions/assigned-departments         → Dept assignments
  /extensions/service-prices               → Pricing rules

LABORATORY:
  /fhir/extension/lis-integration          → LIS integration flag
  /fhir/extension/lis-provider             → LIS provider name
  /fhir/extension/required-equipment       → Required equipment
  /fhir/StructureDefinition/component-status → Component status
  /fhir/extension/online-blocking-hours    → Blocked online hours
  /fhir/extension/service-color            → UI service color

FORM BUILDER:
  /patient-binding                         → Patient data binding config
  /field-styling                           → Field-level styling
  /validation-config                       → Field validation rules
  /fhir-path                              → Custom FHIRPath expression
  /created-by                             → Creator name

ROLE & STATUS:
  /role-codes                             → Role type codes (meta.tag)
  /role-assignment                        → Role assignment (meta.tag)
  /role-identifier                        → Role ID (meta.tag)
  /role-status                            → Role status (meta.tag)
  /invitation-status                      → Invite status (meta.tag)
  /form-category                          → Form category (meta.tag)

VALUESETS:
  /valueset/service-groups                → Consultation|Operation|Lab Study|etc.
  /valueset/service-types                 → Internal|Other Clinics|Limbach|etc.
  /valueset/service-categories            → Ambulatory|Stationary|Both
  /valueset/service-subgroups             → 50+ medical specialties
```

---

## Common Data Patterns

### Pattern 1: Create Account
```typescript
import { accountService } from '@/emr/services/accountService';
import { AccountFormValues } from '@/emr/types/account-management';

const values: AccountFormValues = {
  firstName: 'თენგიზი',
  lastName: 'ხოზვრია',
  email: 'tengizi@example.ge',
  gender: 'male',
  roles: [{
    code: 'physician',
    specialty: '207RC0000X',
    active: true
  }]
};

const membership = await accountService.createPractitioner(medplum, values);
// → Creates Practitioner + PractitionerRole + User + Sends email
```

### Pattern 2: Search Encounters
```typescript
import { patientHistoryService } from '@/emr/services/patientHistoryService';
import { PatientHistorySearchParams } from '@/emr/types/patient-history';

const params: PatientHistorySearchParams = {
  personalId: '26001014632',
  dateFrom: '2025-11-01',
  dateTo: '2025-11-30',
  _sort: '-date',
  _count: '100'
};

const bundle = await patientHistoryService.searchEncounters(medplum, params);
// → Returns Bundle with Encounter[] + included Patient[]
```

### Pattern 3: Create Medical Service
```typescript
import { nomenclatureService } from '@/emr/services/nomenclatureService';
import { ServiceFormValues } from '@/emr/types/nomenclature';

const values: ServiceFormValues = {
  code: 'JXDD3A',
  name: 'მუცლის ღრუს ექოსკოპია',
  group: 'ინსტრუმენტული კვლევები',
  type: 'შიდა',
  serviceCategory: 'stationary',
  price: 150
};

const service = await nomenclatureService.createService(medplum, values);
// → Creates ActivityDefinition with extensions for all fields
```

### Pattern 4: Bind Form to Patient
```typescript
import { FormTemplate, FieldConfig, PatientBinding } from '@/emr/types/form-builder';

const field: FieldConfig = {
  id: '1',
  linkId: 'name',
  type: 'text',
  label: 'Full Name',
  patientBinding: {
    enabled: true,
    bindingKey: 'fullName'  // Auto-populated from Patient
  }
};

// When user opens form → patientDataBindingService extracts Patient.name
// → Field auto-filled with patient's full name
```

### Pattern 5: Extract FHIR Data
```typescript
import * as fhirHelpers from '@/emr/services/fhirHelpers';
import { Patient, Encounter } from '@medplum/fhirtypes';

const personalId = fhirHelpers.getIdentifierValue(
  patient,
  'http://medimind.ge/identifiers/personal-id'
);

const { firstName, lastName } = fhirHelpers.getNameParts(patient.name);

const registrationNumber = fhirHelpers.getIdentifierValue(
  encounter,
  'http://medimind.ge/identifiers/visit-registration'
);

const totalAmount = fhirHelpers.getExtensionValue(
  encounter,
  'http://medimind.ge/fhir/StructureDefinition/total-amount'
);
```

---

## FHIR Resource Structure Examples

### Patient
```json
{
  "resourceType": "Patient",
  "id": "pat-123",
  "identifier": [
    {
      "system": "http://medimind.ge/identifiers/personal-id",
      "value": "26001014632"
    },
    {
      "system": "http://medimind.ge/identifiers/registration-number",
      "value": "REG-2025-001"
    }
  ],
  "name": [
    {
      "given": ["თენგიზი"],
      "family": "ხოზვრია",
      "extension": [
        {
          "url": "http://medimind.ge/extensions/patronymic",
          "valueString": "კარლოს"
        }
      ]
    }
  ],
  "gender": "male",
  "birthDate": "1986-01-26",
  "telecom": [
    { "system": "email", "value": "tengizi@example.ge" },
    { "system": "phone", "value": "+995500050610" }
  ],
  "extension": [
    {
      "url": "http://medimind.ge/fhir/StructureDefinition/unknown-patient",
      "valueBoolean": false
    }
  ]
}
```

### Encounter with Financial Data
```json
{
  "resourceType": "Encounter",
  "id": "enc-456",
  "status": "finished",
  "class": { "code": "IMP" },
  "subject": { "reference": "Patient/pat-123" },
  "period": {
    "start": "2025-11-15T08:00:00Z",
    "end": "2025-11-16T18:00:00Z"
  },
  "identifier": [
    {
      "system": "http://medimind.ge/identifiers/visit-registration",
      "value": "10357-2025"
    }
  ],
  "extension": [
    {
      "url": "http://medimind.ge/fhir/StructureDefinition/total-amount",
      "valueMoney": { "value": 500, "currency": "GEL" }
    },
    {
      "url": "http://medimind.ge/fhir/StructureDefinition/discount-percent",
      "valueDecimal": 10
    },
    {
      "url": "http://medimind.ge/fhir/StructureDefinition/payment-amount",
      "valueMoney": { "value": 400, "currency": "GEL" }
    }
  ]
}
```

### Practitioner with Role
```json
{
  "resourceType": "Practitioner",
  "id": "pract-789",
  "identifier": [
    {
      "system": "http://medimind.ge/identifiers/staff-id",
      "value": "STAFF-2025-001"
    }
  ],
  "name": [
    {
      "given": ["თენგიზი"],
      "family": "ხოზვრია"
    }
  ],
  "gender": "male",
  "birthDate": "1986-01-26",
  "telecom": [
    { "system": "email", "value": "tengizi@example.ge" },
    { "system": "phone", "value": "+995500050610" }
  ]
}
```

### PractitionerRole (Linked via Practitioner)
```json
{
  "resourceType": "PractitionerRole",
  "id": "pr-101",
  "practitioner": { "reference": "Practitioner/pract-789" },
  "code": [
    { "coding": [{ "code": "physician", "system": "http://medimind.ge/role-codes" }] }
  ],
  "specialty": [
    { "coding": [{ "code": "207RC0000X" }] }
  ],
  "active": true,
  "meta": {
    "tag": [
      {
        "system": "http://medimind.ge/role-assignment",
        "code": "physician"
      }
    ]
  }
}
```

### ActivityDefinition (Medical Service)
```json
{
  "resourceType": "ActivityDefinition",
  "id": "act-202",
  "status": "active",
  "title": "მუცლის ღრუს ექოსკოპია",
  "identifier": [
    {
      "system": "http://medimind.ge/nomenclature/service-code",
      "value": "JXDD3A"
    }
  ],
  "topic": [
    { "text": "ინსტრუმენტული კვლევები" }
  ],
  "extension": [
    {
      "url": "http://medimind.ge/extensions/service-type",
      "valueCodeableConcept": { "coding": [{ "code": "შიდა" }] }
    },
    {
      "url": "http://medimind.ge/extensions/base-price",
      "valueMoney": { "value": 150, "currency": "GEL" }
    }
  ]
}
```

---

## Key Statistics

- **210 FHIR resource types** defined in `@medplum/fhirtypes`
- **13 EMR type files** in `packages/app/src/emr/types/`
- **66 service files** in `packages/app/src/emr/services/`
- **60+ custom extension URLs** for Georgian healthcare
- **10+ identifier systems** for different ID types
- **4 lab tabs** (samples, manipulations, syringes, research components)
- **16 form field types** (text, date, choice, signature, attachment, etc.)
- **134 patient visit form fields** (registration + demographics + 3x insurance)
- **250+ tests passing** in account management alone

---

## Additional Resources

- Full documentation: `/DATA_STRUCTURES.md` (1862 lines)
- FHIR R4 spec: https://hl7.org/fhir/R4/
- Medplum docs: https://www.medplum.com/docs
- SNOMED CT: https://www.snomed.org/
- NUCC taxonomy: https://taxonomy.nucc.org/

