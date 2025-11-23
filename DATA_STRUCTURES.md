# Medplum Monorepo - Backend Data Structures & FHIR Resource Mapping

## Executive Summary

This Medplum monorepo implements a healthcare EMR system using FHIR R4 as the primary data model. All healthcare data is stored as FHIR resources in PostgreSQL via the Medplum server. The architecture separates:

- **FHIR Types** (210+ resource types defined in `packages/fhirtypes`)
- **EMR-Specific Types** (custom interfaces in `packages/app/src/emr/types`)
- **Service Layer** (data access & transformation in `packages/app/src/emr/services`)
- **Custom Extensions** (MediMind-specific metadata for Georgian healthcare)

---

## Part 1: FHIR Types Foundation

### FHIR Package (`packages/fhirtypes`)

**Version**: 5.0.2  
**Type**: Type definition package (`.d.ts` files)  
**Total Resources**: 210 FHIR R4 resource types

**Key Exported Types** (from `dist/index.d.ts`):

#### Clinical Resources
- `Patient` - Individual patient records
- `Practitioner` - Healthcare providers (doctors, nurses, staff)
- `PractitionerRole` - Provider role assignments with specialties
- `Encounter` - Patient visits/admissions
- `Observation` - Clinical measurements and observations
- `DiagnosticReport` - Lab and imaging results
- `Condition` - Diagnoses
- `Medication` - Drug definitions
- `MedicationRequest` - Prescription orders
- `MedicationAdministration` - Medication given to patient
- `Procedure` - Medical procedures performed
- `ServiceRequest` - Requests for procedures/services
- `CarePlan` - Treatment plans
- `CareTeam` - Care team members

#### Financial Resources
- `Coverage` - Insurance coverage information
- `Claim` - Insurance claim submissions
- `ClaimResponse` - Claim processing results
- `Invoice` - Billing invoices
- `ChargeItem` - Individual charges
- `Account` - Financial accounts

#### Administrative Resources
- `Organization` - Healthcare facilities, departments
- `Location` - Physical locations
- `Appointment` - Scheduled appointments
- `Schedule` - Availability scheduling
- `Slot` - Available time slots
- `Device` - Medical devices
- `HealthcareService` - Offered services

#### Knowledge Definition Resources
- `ActivityDefinition` - Service/procedure definitions (used for Nomenclature)
- `StructureDefinition` - Resource constraints and extensions
- `ValueSet` - Coded value sets
- `CodeSystem` - Code definitions
- `OperationDefinition` - Custom API operations
- `Questionnaire` - Form definitions (used for Form Builder)
- `QuestionnaireResponse` - Form responses

#### Other Resources
- `DocumentReference` - Clinical documents
- `Binary` - File attachments
- `Bundle` - Collections of resources (API responses)
- `AuditEvent` - HIPAA-compliant audit logs
- `CapabilityStatement` - Server capabilities
- `OperationOutcome` - API error responses
- `AccessPolicy` - Custom: Role-based access control
- `Invite` - Custom: User invitation tracking

---

## Part 2: EMR-Specific Types

### Type Files Location
`packages/app/src/emr/types/` - 13 TypeScript interface files

### 2.1 Account Management Types (`account-management.ts`)

**Maps to FHIR Resources**: `Practitioner`, `PractitionerRole`, `AccessPolicy`, `AuditEvent`

#### Core Interfaces

```typescript
/**
 * Main form for creating/editing practitioner accounts
 * Flattens Practitioner + PractitionerRole data into single form
 */
interface AccountFormValues {
  id?: string;                 // Practitioner resource ID
  firstName: string;
  lastName: string;
  fatherName?: string;         // Patronymic (Georgian)
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;          // ISO 8601
  email: string;               // Login credentials
  phoneNumber?: string;        // E.164 format
  workPhone?: string;
  staffId?: string;            // Custom identifier
  hireDate?: string;           // ISO 8601
  roles?: RoleAssignment[];    // Multi-role support
  rbacRoles?: RoleReference[]; // AccessPolicy references
  departments?: string[];      // Organization IDs
  active?: boolean;
  welcomeMessage?: string;     // Custom invitation email
}

/**
 * Single role assignment (becomes PractitionerRole resource)
 */
interface RoleAssignment {
  code: string;                // 'physician', 'nurse', etc.
  specialty?: string;          // NUCC code
  department?: string;         // Organization ID
  active: boolean;
}

/**
 * Table row for display (flattened structure)
 */
interface AccountRow {
  id: string;                  // Practitioner ID
  staffId?: string;
  name: string;               // family + given
  email: string;
  phone?: string;
  roles: string[];            // Role names
  departments?: string[];
  active: boolean;
  invitationStatus?: InvitationStatus;  // pending|accepted|expired|bounced
  lastLogin?: string;         // ISO 8601
}

/**
 * Search and filter parameters
 */
interface AccountSearchFiltersExtended {
  search?: string;            // Combined name/email
  name?: string;
  email?: string;
  role?: string;
  department?: string;
  active?: boolean;
  hireDateFromDate?: Date;
  hireDateToDate?: Date;
  invitationStatus?: InvitationStatus;
}

/**
 * Permission matrix for role access control
 * Maps to AccessPolicy resource rule[] array
 */
interface PermissionMatrix {
  resourceType: string;       // 'Patient', 'Observation', etc.
  interactions: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    search: boolean;
  };
  criteria?: string;          // FHIR search criteria filter
}

/**
 * Audit log entry (from AuditEvent resource)
 */
interface AuditLogEntry {
  id: string;                 // AuditEvent ID
  timestamp: string;          // ISO 8601
  action: 'C' | 'U' | 'D' | 'R' | 'E';  // Create/Update/Delete/Read/Execute
  agent: string;              // User display name
  agentId: string;            // Practitioner ID
  entityType: string;         // Resource type affected
  entityId: string;           // Resource ID affected
  outcome: '0' | '4' | '8' | '12';  // Success/Minor/Serious/Major failure
}

/**
 * Bulk operation result tracking
 */
interface BulkOperationResult {
  operationType: 'deactivate' | 'activate' | 'assignRole' | 'removeRole' | 'export';
  total: number;
  successful: number;
  failed: number;
  errors: BulkOperationError[];
}
```

### 2.2 Patient History Types (`patient-history.ts`)

**Maps to FHIR Resources**: `Encounter`, `Coverage`, `Patient`

```typescript
/**
 * Table row for 10-column visit history display
 */
interface VisitTableRow {
  id: string;                 // Encounter ID
  patientId: string;          // Patient ID
  personalId: string;         // 11-digit Georgian ID
  firstName: string;
  lastName: string;
  date: string;               // Visit date (ISO 8601)
  endDate?: string;           // Discharge date (ISO 8601)
  registrationNumber: string; // "10357-2025" or "a-6871-2025"
  total: number;              // Total amount (GEL)
  discountPercent: number;    // Discount %
  debt: number;               // Outstanding debt (GEL)
  payment: number;            // Amount paid (GEL)
  status: Encounter['status']; // 'planned'|'arrived'|'in-progress'|'finished'
  visitType: 'stationary' | 'ambulatory' | 'emergency';
  insuranceCompanyId?: string;
  insuranceCompanyName?: string;
}

/**
 * Search/filter parameters for Encounter queries
 */
interface PatientHistorySearchParams {
  insuranceCompanyId?: string;    // Filter by insurer
  personalId?: string;            // 11-digit search
  firstName?: string;
  lastName?: string;
  dateFrom?: string;              // ISO 8601
  dateTo?: string;                // ISO 8601
  registrationNumber?: string;    // Exact match
  _sort?: string;                 // '-date' for descending
  _count?: string;                // Page size
}

/**
 * Visit edit form (134 fields total across 3 sections)
 */
interface VisitFormValues {
  // Registration section (14 fields)
  visitDate: string;
  registrationType: string;
  stationaryNumber?: string;
  ambulatoryNumber?: string;
  statusType: string;
  referrer?: string;
  admissionType?: string;
  dischargeType?: string;
  dischargeDate?: string;
  attendingDoctor?: string;
  department?: string;
  room?: string;
  bed?: string;

  // Demographics section (8 READ-ONLY fields)
  region?: string;
  district?: string;
  city?: string;
  address?: string;
  education?: string;
  familyStatus?: string;
  employment?: string;
  workplace?: string;

  // Insurance I, II, III (21 fields = 3 × 7 fields each)
  insuranceCompany?: string;      // Insurance I
  insuranceType?: string;
  policyNumber?: string;
  referralNumber?: string;
  issueDate?: string;
  expirationDate?: string;
  copayPercent?: number;

  insuranceCompany2?: string;     // Insurance II (same 7 fields)
  insuranceCompany3?: string;     // Insurance III (same 7 fields)
  // ... etc
}

/**
 * Financial summary calculations
 */
interface FinancialSummary {
  total: number;              // Before discount
  discountPercent: number;    // Discount %
  discountAmount: number;     // Calculated discount in GEL
  subtotal: number;           // After discount
  payment: number;            // Amount paid
  debt: number;               // subtotal - payment
  currency: 'GEL';            // Georgian Lari
}
```

### 2.3 Nomenclature Types (`nomenclature.ts`)

**Maps to FHIR Resources**: `ActivityDefinition`, `ValueSet`

```typescript
/**
 * Medical service form for creating/editing services
 * Maps to ActivityDefinition resource
 */
interface ServiceFormValues {
  code: string;                    // Service code (JXDD3A)
  name: string;                    // Service name (Georgian)
  group: string;                   // Group ID (consultations, operations, etc.)
  subgroup?: string;               // Medical specialty (SNOMED CT code)
  type: string;                    // Service type (internal, other-clinics, etc.)
  serviceCategory: string;         // ambulatory|stationary|both
  price?: number;                  // Base price (GEL)
  totalAmount?: number;            // Total service amount
  calHed?: number;                 // Calculator header count
  printable?: boolean;
  itemGetPrice?: number;           // Item pricing count
  departments?: string[];          // Assigned department IDs
  status?: 'active' | 'retired' | 'draft';
}

/**
 * Service table row for display
 */
interface ServiceTableRow {
  id: string;                      // ActivityDefinition ID
  code: string;
  name: string;
  group: string;                   // Display name
  type: string;                    // Display name
  price?: number;
  totalAmount?: number;
  calHed?: number;
  printable?: boolean;
  itemGetPrice?: number;
  status: 'active' | 'retired' | 'draft';
  resource: ActivityDefinition;    // Full FHIR resource
}

/**
 * Search/filter for services
 */
interface ServiceSearchParams {
  code?: string;                   // Partial match
  name?: string;                   // Partial match
  group?: string;                  // Exact match
  type?: string;                   // Exact match
  serviceCategory?: string;        // Exact match
  priceStart?: number;
  priceEnd?: number;
  status?: 'active' | 'retired' | 'all';
  page?: number;                   // Pagination
  count?: number;                  // Page size
}

/**
 * Extension URLs for ActivityDefinition
 */
const NOMENCLATURE_EXTENSION_URLS = {
  SUBGROUP: 'http://medimind.ge/extensions/service-subgroup',
  SERVICE_TYPE: 'http://medimind.ge/extensions/service-type',
  SERVICE_CATEGORY: 'http://medimind.ge/extensions/service-category',
  BASE_PRICE: 'http://medimind.ge/extensions/base-price',
  TOTAL_AMOUNT: 'http://medimind.ge/extensions/total-amount',
  CAL_HED: 'http://medimind.ge/extensions/cal-hed',
  PRINTABLE: 'http://medimind.ge/extensions/printable',
  ITEM_GET_PRICE: 'http://medimind.ge/extensions/item-get-price',
  ASSIGNED_DEPARTMENTS: 'http://medimind.ge/extensions/assigned-departments',
} as const;

/**
 * Identifier systems for services
 */
const NOMENCLATURE_IDENTIFIER_SYSTEMS = {
  SERVICE_CODE: 'http://medimind.ge/nomenclature/service-code',
  REGISTRATION_NUMBER: 'http://medimind.ge/identifiers/registration-number',
} as const;
```

### 2.4 Laboratory Types (`laboratory.ts`)

**Maps to FHIR Resources**: `ObservationDefinition`, `SpecimenDefinition`, `ActivityDefinition`, `DeviceDefinition`

```typescript
/**
 * Research Component (Lab Parameter) form
 * Maps to ObservationDefinition
 */
interface ResearchComponentFormValues {
  code: string;                    // e.g., "BL.11.2.2"
  gisCode: string;                 // e.g., ";ALTL"
  name: string;                    // Parameter name in Georgian
  type: ServiceType;               // internal|other-clinics|limbach|etc.
  unit: string;                    // UCUM code (e.g., "mg/dL")
  department?: string;             // Department ID
  status: 'active' | 'retired' | 'draft';
}

/**
 * Sample/Specimen type
 * Maps to SpecimenDefinition
 */
interface SampleFormValues {
  name: string;                    // Sample type name (Georgian)
  status: 'active' | 'retired';
  snomedCode?: string;             // SNOMED CT code
}

/**
 * Manipulation/Procedure form
 * Maps to ActivityDefinition
 */
interface ManipulationFormValues {
  name: string;                    // Procedure name (Georgian)
  status: 'active' | 'retired';
  snomedCode?: string;             // SNOMED CT code
}

/**
 * Syringe/Container (tube color) form
 * Maps to DeviceDefinition
 */
interface SyringeFormValues {
  name: string;                    // Container name
  color: string;                   // Hex color (e.g., "#8A2BE2")
  volume?: number;                 // Volume in mL
  status: 'active' | 'retired';
}

/**
 * Standard ISO 6710 laboratory tube colors
 */
interface TubeColor {
  name: string;                    // Color name (English)
  hex: string;                     // Hex code
  use: string;                     // Typical usage
}
```

### 2.5 Form Builder Types (`form-builder.ts`)

**Maps to FHIR Resources**: `Questionnaire`, `QuestionnaireResponse`

```typescript
/**
 * Form template mapping to FHIR Questionnaire
 */
interface FormTemplate {
  id?: string;
  title: string;                   // Form title
  description?: string;
  status: 'draft' | 'active' | 'retired';
  version?: string;
  fields: FieldConfig[];           // Array of form fields
  createdDate?: string;            // ISO 8601
  lastModified?: string;           // ISO 8601
  createdBy?: string;              // Creator name
  category?: string[];             // Form categories
  formStyling?: FormStyling;       // Container/title styling
}

/**
 * Individual field configuration
 * Maps to QuestionnaireItem
 */
interface FieldConfig {
  id: string;                      // Unique field ID
  linkId: string;                  // FHIR linkId (must be unique)
  type: FieldType;                 // text|textarea|date|datetime|etc.
  label: string;                   // Field label
  text?: string;                   // Field description
  required?: boolean;
  readOnly?: boolean;
  repeats?: boolean;               // Allow multiple responses
  defaultValue?: string | number | boolean;
  patientBinding?: PatientBinding; // Auto-populate from Patient data
  validation?: ValidationConfig;   // Field validation rules
  styling?: FieldStyling;          // Field-level CSS
  options?: FieldOption[];         // For choice/radio/checkbox fields
  conditional?: ConditionalLogic;  // Conditional visibility
  width?: string;                  // CSS width
  order?: number;                  // Field order
  extensions?: Extension[];        // FHIR extensions
}

/**
 * Supported field types
 */
type FieldType =
  | 'text'           // Short text input
  | 'textarea'       // Long text input
  | 'date'           // Date picker
  | 'datetime'       // Date + time picker
  | 'time'           // Time picker
  | 'integer'        // Whole numbers
  | 'decimal'        // Decimal numbers
  | 'boolean'        // Checkbox
  | 'choice'         // Single select dropdown
  | 'open-choice'    // Select with custom option
  | 'radio'          // Radio buttons
  | 'checkbox-group' // Multiple checkboxes
  | 'signature'      // Digital signature
  | 'attachment'     // File upload
  | 'display'        // Display text only
  | 'group';         // Group of fields

/**
 * Patient data binding configuration
 * Maps form field to Patient FHIR resource
 */
interface PatientBinding {
  enabled: boolean;
  bindingKey: BindingKey;          // Which patient field to bind
  fhirPath?: string;               // Custom FHIRPath expression
  isCalculated?: boolean;
  calculationType?: 'age' | 'fullName' | 'custom';
}

/**
 * Available patient binding keys
 */
type BindingKey =
  | 'name'              // Patient.name (combined)
  | 'firstName'         // Patient.name.given[0]
  | 'lastName'          // Patient.name.family
  | 'patronymic'        // Patient.name.extension[patronymic]
  | 'fullName'          // Calculated: firstName + patronymic + lastName
  | 'dob'               // Patient.birthDate
  | 'age'               // Calculated from birthDate
  | 'personalId'        // Patient.identifier[personal-id]
  | 'gender'            // Patient.gender
  | 'phone'             // Patient.telecom[phone]
  | 'email'             // Patient.telecom[email]
  | 'address'           // Patient.address.text
  | 'registrationId';   // Patient.identifier[registration-number]
```

### 2.6 Patient Binding Types (`patient-binding.ts`)

**Maps to**: Patient FHIR resource, Encounter resource

```typescript
/**
 * FHIRPath evaluation result for patient data
 */
interface FHIRPathEvaluationResult {
  success: boolean;
  value?: string | number | boolean;
  error?: string;
}

/**
 * Patient data extraction with multiple data sources
 */
interface PatientDataSource {
  type: 'patient' | 'encounter' | 'relationship' | 'extension';
  resource: Patient | Encounter | RelatedPerson;
  bindingKey: BindingKey;
  value?: string | number | boolean;
}
```

### 2.7 Role Management Types (`role-management.ts`)

**Maps to FHIR Resources**: `AccessPolicy`

```typescript
/**
 * Role option for dropdowns
 */
interface RoleOption {
  code: string;                    // Role code (unique)
  name: {
    ka: string;                    // Georgian
    en: string;                    // English
    ru: string;                    // Russian
  };
  description?: {
    ka?: string;
    en?: string;
    ru?: string;
  };
}

/**
 * Medical specialty option
 * NUCC Healthcare Provider Taxonomy codes
 */
interface SpecialtyOption {
  code: string;                    // NUCC or SNOMED code
  system: string;                  // Coding system URI
  name: {
    ka: string;
    en: string;
    ru: string;
  };
}
```

---

## Part 3: Custom Extensions (MediMind Extensions)

All custom extensions follow the URL pattern: `http://medimind.ge/[category]/[name]`

### 3.1 Identifier Systems

```
Patient & Practitioner Identifiers:
- http://medimind.ge/identifiers/personal-id
  └─ 11-digit Georgian national ID (Luhn checksum validated)

- http://medimind.ge/identifiers/registration-number
  └─ Patient registration number (e.g., "REG-2025-001")

- http://medimind.ge/identifiers/staff-id
  └─ Staff/employee ID (e.g., "STAFF-2025-001")

- http://medimind.ge/identifiers/ambulatory-registration
  └─ Ambulatory visit registration number (e.g., "a-6871-2025")

- http://medimind.ge/identifiers/visit-registration
  └─ Stationary visit registration number (e.g., "10357-2025")

- http://medimind.ge/identifiers/unknown-patient-registration
  └─ Emergency/unknown patient registration number

Nomenclature Identifiers:
- http://medimind.ge/nomenclature/service-code
  └─ Medical service code (e.g., "JXDD3A")

Laboratory Identifiers:
- http://medimind.ge/lab/component-code
  └─ Lab parameter code (e.g., "BL.11.2.2")

- http://medimind.ge/lab/gis-code
  └─ GIS integration code (e.g., ";ALTL")

- http://medimind.ge/lab/tube-colors
  └─ ISO 6710 laboratory tube colors
```

### 3.2 Extension URLs

#### Patient & Account Extensions
```
http://medimind.ge/fhir/StructureDefinition/unknown-patient
└─ Extension: valueBoolean
└─ Marks emergency patients with unknown identity

http://medimind.ge/fhir/StructureDefinition/department
└─ Extension: Reference to Organization (department)
└─ Links practitioner to department

http://medimind.ge/patient-binding
└─ Extension: (on Questionnaire items)
└─ Binds form field to Patient data
└─ Content: {
     bindingKey: BindingKey,
     fhirPath?: string,
     isCalculated?: boolean
   }
```

#### Form Builder Extensions
```
http://medimind.ge/field-styling
└─ Extension: (on QuestionnaireItem)
└─ Field-level styling configuration
└─ Content: {
     backgroundColor?: string,
     borderColor?: string,
     borderRadius?: string,
     padding?: string
   }

http://medimind.ge/validation-config
└─ Extension: (on QuestionnaireItem)
└─ Validation rules
└─ Content: {
     minLength?: number,
     maxLength?: number,
     pattern?: string,
     min?: number,
     max?: number
   }

http://medimind.ge/fhir-path
└─ Extension: valueString
└─ Custom FHIRPath expression for conditional logic

http://medimind.ge/created-by
└─ Extension: valueString
└─ User who created the resource
```

#### Financial Extensions
```
http://medimind.ge/fhir/StructureDefinition/total-amount
└─ Extension: valueMoney {value: number, currency: 'GEL'}
└─ Used on: Encounter (total service cost)

http://medimind.ge/fhir/StructureDefinition/discount-percent
└─ Extension: valueDecimal
└─ Discount percentage (0-100)

http://medimind.ge/fhir/StructureDefinition/payment-amount
└─ Extension: valueMoney {value: number, currency: 'GEL'}
└─ Amount paid by patient

http://medimind.ge/fhir/StructureDefinition/debt-amount
└─ Extension: valueMoney {value: number, currency: 'GEL'}
└─ Outstanding debt (calculated: total - payment)

http://medimind.ge/extensions/referral-number
└─ Extension: valueString
└─ Insurance referral number
└─ Used on: Coverage resource
```

#### Nomenclature (ActivityDefinition) Extensions
```
http://medimind.ge/extensions/service-subgroup
└─ Extension: valueString
└─ Medical specialty/DRG category

http://medimind.ge/extensions/service-type
└─ Extension: valueCodeableConcept
└─ Service type (internal, other-clinics, limbach, etc.)

http://medimind.ge/extensions/service-category
└─ Extension: valueString
└─ Category: ambulatory|stationary|both

http://medimind.ge/extensions/base-price
└─ Extension: valueMoney {value: number, currency: 'GEL'}
└─ Service base price

http://medimind.ge/extensions/total-amount
└─ Extension: valueMoney {value: number, currency: 'GEL'}
└─ Total service amount

http://medimind.ge/extensions/cal-hed
└─ Extension: valueInteger
└─ Calculator header count

http://medimind.ge/extensions/printable
└─ Extension: valueBoolean
└─ Whether service is printable

http://medimind.ge/extensions/item-get-price
└─ Extension: valueInteger
└─ Item pricing count

http://medimind.ge/extensions/assigned-departments
└─ Extension: valueString (comma-separated IDs)
└─ Departments this service is assigned to

http://medimind.ge/extensions/service-prices
└─ Extension: (complex, stores pricing rules)
└─ Dynamic pricing configuration
```

#### Laboratory Extensions
```
http://medimind.ge/fhir/extension/lis-integration
└─ Extension: valueBoolean
└─ Whether service integrates with LIS

http://medimind.ge/fhir/extension/lis-provider
└─ Extension: valueString
└─ LIS provider name

http://medimind.ge/fhir/extension/required-equipment
└─ Extension: valueReference to Device
└─ Equipment required for service

http://medimind.ge/fhir/StructureDefinition/component-status
└─ Extension: valueString
└─ Research component status (active/retired)

http://medimind.ge/fhir/extension/online-blocking-hours
└─ Extension: (time ranges)
└─ Hours service is blocked online

http://medimind.ge/fhir/extension/service-color
└─ Extension: valueString (hex color)
└─ UI color for service
```

#### Role Management Extensions
```
http://medimind.ge/role-codes
└─ Meta.tag system
└─ Role type codes (physician, nurse, admin, etc.)

http://medimind.ge/role-assignment
└─ Meta.tag system
└─ Tags role assignments on PractitionerRole

http://medimind.ge/role-identifier
└─ Meta.tag system
└─ Tags on AccessPolicy with role code + name

http://medimind.ge/role-status
└─ Meta.tag system
└─ Status of role (active/inactive)
```

#### Invitation & Status Extensions
```
http://medimind.ge/invitation-status
└─ Meta.tag system
└─ Invitation status (pending/accepted/expired/bounced)
└─ Tags on Invite resource

http://medimind.ge/form-category
└─ Meta.tag system
└─ Form category tags (consent, medical, etc.)
└─ Tags on Questionnaire resource
```

#### ValueSet URLs
```
http://medimind.ge/valueset/service-groups
└─ Medical service groups (consultations, operations, lab studies, etc.)

http://medimind.ge/valueset/service-types
└─ Service types (internal, other-clinics, limbach, consultant, etc.)

http://medimind.ge/valueset/service-categories
└─ Service categories (ambulatory, stationary, both)

http://medimind.ge/valueset/service-subgroups
└─ Medical specialties/DRG categories (50+ options)
```

---

## Part 4: Service Layer Architecture

### Service Files Location
`packages/app/src/emr/services/` - 66 service files for data access

### 4.1 Core Data Access Services

#### **fhirHelpers.ts** - FHIR Data Extraction

Provides utility functions for extracting data from FHIR resources:

```typescript
/**
 * Extract identifier value by system
 */
function getIdentifierValue(
  resource: { identifier?: Identifier[] },
  system: string
): string

/**
 * Extract name parts from HumanName array
 */
function getNameParts(
  names?: HumanName[]
): { firstName: string; lastName: string }

/**
 * Extract telecom value by system
 */
function getTelecomValue(
  resource: { telecom?: ContactPoint[] },
  system: string
): string

/**
 * Extract extension value by URL
 */
function getExtensionValue(
  resource: { extension?: Extension[] },
  url: string
): any

/**
 * Map FHIR Encounter + Patient to table row
 * Handles joining Encounter with Patient in Bundle
 */
function mapEncounterToTableRow(
  encounter: Encounter,
  bundle: Bundle
): VisitTableRow

/**
 * Calculate financial summary from amounts
 */
function calculateFinancials(
  total: number,
  discountPercent: number,
  payment: number
): FinancialSummary

/**
 * Convert form builder template to FHIR Questionnaire
 */
function toQuestionnaire(formData: FormTemplate): Questionnaire

/**
 * Convert FHIR Questionnaire back to form template
 */
function fromQuestionnaire(questionnaire: Questionnaire): FormTemplate
```

#### **accountHelpers.ts** - Practitioner Data Extraction

```typescript
/**
 * Extract identifier value by system
 */
function getIdentifierBySystem(
  practitioner: Practitioner,
  system: string
): Identifier | undefined

/**
 * Get practitioner full name
 */
function getPractitionerName(practitioner: Practitioner): string

/**
 * Get practitioner email
 */
function getPractitionerEmail(practitioner: Practitioner): string

/**
 * Get practitioner phone
 */
function getPractitionerPhone(practitioner: Practitioner): string

/**
 * Get staff ID from identifier
 */
function getPractitionerStaffId(practitioner: Practitioner): string | undefined

/**
 * Convert form values to FHIR Practitioner resource
 */
function formValuesToPractitioner(
  values: AccountFormValues,
  existingPractitioner?: Practitioner
): Practitioner

/**
 * Convert form values to PractitionerRole resources
 */
function formValuesToRoles(
  practitionerId: string,
  values: AccountFormValues
): PractitionerRole[]
```

#### **nomenclatureHelpers.ts** - Service Data Extraction

```typescript
/**
 * Extract extension string value
 */
function getExtensionString(
  resource: ActivityDefinition,
  url: string
): string

/**
 * Extract extension object value
 */
function getExtensionObject(
  resource: ActivityDefinition,
  url: string
): any

/**
 * Extract boolean extension
 */
function getExtensionBoolean(
  resource: ActivityDefinition,
  url: string
): boolean

/**
 * Extract money extension
 */
function getExtensionMoney(
  resource: ActivityDefinition,
  url: string
): number | undefined

/**
 * Map ActivityDefinition to ServiceTableRow
 */
function mapServiceToTableRow(
  resource: ActivityDefinition
): ServiceTableRow
```

### 4.2 Resource CRUD Services

#### **patientHistoryService.ts** - Encounter Operations

```typescript
/**
 * Search encounters with patient includes
 * FHIR: GET /Encounter?_include=Encounter:patient&...
 */
async function searchEncounters(
  medplum: MedplumClient,
  params: PatientHistorySearchParams
): Promise<Bundle>

/**
 * Get single encounter by ID
 */
async function getEncounterById(
  medplum: MedplumClient,
  encounterId: string
): Promise<Encounter>

/**
 * Update encounter
 * FHIR: PUT /Encounter/{id}
 */
async function updateEncounter(
  medplum: MedplumClient,
  encounter: Encounter
): Promise<Encounter>

/**
 * Soft delete: Set status='entered-in-error'
 * Recommended method (preserves audit trail)
 */
async function deleteEncounter(
  medplum: MedplumClient,
  encounterId: string
): Promise<Encounter>

/**
 * Hard delete: Permanent removal
 * FHIR: DELETE /Encounter/{id}
 */
async function hardDeleteEncounter(
  medplum: MedplumClient,
  encounterId: string
): Promise<void>
```

#### **accountService.ts** - Practitioner & Account Operations

```typescript
/**
 * Create new practitioner using Medplum Invite API
 * Creates: User + Practitioner + ProjectMembership
 * Sends welcome email with activation link
 */
async function createPractitioner(
  medplum: MedplumClient,
  values: AccountFormValues,
  password?: string
): Promise<ProjectMembership>

/**
 * Search practitioners with filters and pagination
 * FHIR: GET /Practitioner?name=...&_count=...&_offset=...
 */
async function searchPractitioners(
  medplum: MedplumClient,
  filters: AccountSearchFiltersExtended,
  pagination: PaginationParams
): Promise<PaginatedResponse<AccountRowExtended>>

/**
 * Get practitioner by ID
 */
async function getPractitionerById(
  medplum: MedplumClient,
  practitionerId: string
): Promise<Practitioner>

/**
 * Update practitioner account
 */
async function updatePractitioner(
  medplum: MedplumClient,
  practitioner: Practitioner
): Promise<Practitioner>

/**
 * Deactivate account (soft delete)
 * Sets active=false, creates audit event
 */
async function deactivatePractitioner(
  medplum: MedplumClient,
  practitionerId: string,
  reason: string,
  currentUserId: string
): Promise<Practitioner>

/**
 * Bulk operations
 */
async function bulkDeactivate(
  medplum: MedplumClient,
  practitionerIds: string[],
  currentUserId: string,
  reason: string,
  onProgress?: (progress: BulkOperationProgress) => void
): Promise<BulkOperationResult>

async function bulkAssignRole(
  medplum: MedplumClient,
  practitionerIds: string[],
  roleCode: string,
  currentUserId: string
): Promise<BulkOperationResult>
```

#### **auditService.ts** - AuditEvent Operations

```typescript
/**
 * Create audit event for account operations
 * FHIR: POST /AuditEvent
 */
async function createAuditEvent(
  medplum: MedplumClient,
  action: 'C' | 'U' | 'D' | 'R' | 'E',
  entityType: string,
  entityId: string,
  agentId: string,
  outcome: '0' | '4' | '8' | '12',
  details?: Record<string, string>
): Promise<AuditEvent>

/**
 * Search audit events with filtering
 */
async function searchAuditEvents(
  medplum: MedplumClient,
  filters: AuditLogFilters
): Promise<AuditEvent[]>

/**
 * Get audit history for specific account
 */
async function getAccountAuditHistory(
  medplum: MedplumClient,
  practitionerId: string
): Promise<AuditLogEntry[]>
```

#### **roleService.ts** - AccessPolicy (Role) Operations

```typescript
/**
 * Search for roles (AccessPolicy resources)
 */
async function searchRoles(
  medplum: MedplumClient,
  filters?: RoleSearchFilters
): Promise<AccessPolicy[]>

/**
 * Create new role
 */
async function createRole(
  medplum: MedplumClient,
  roleData: RoleFormValues
): Promise<AccessPolicy>

/**
 * Update role
 */
async function updateRole(
  medplum: MedplumClient,
  roleId: string,
  roleData: RoleFormValues
): Promise<AccessPolicy>

/**
 * Assign role to user
 * Creates meta.tag with role code
 */
async function assignRoleToUser(
  medplum: MedplumClient,
  practitionerId: string,
  roleCode: string
): Promise<PractitionerRole>

/**
 * Deactivate role (soft delete)
 */
async function deactivateRole(
  medplum: MedplumClient,
  roleId: string
): Promise<AccessPolicy>

/**
 * Delete role (hard delete)
 */
async function hardDeleteRole(
  medplum: MedplumClient,
  roleId: string
): Promise<void>

/**
 * Get count of users with role
 */
async function getRoleUserCount(
  medplum: MedplumClient,
  roleId: string
): Promise<number>
```

#### **nomenclatureService.ts** - Service (ActivityDefinition) Operations

```typescript
/**
 * Search medical services
 */
async function searchServices(
  medplum: MedplumClient,
  params: ServiceSearchParams
): Promise<Bundle>

/**
 * Create new service
 */
async function createService(
  medplum: MedplumClient,
  values: ServiceFormValues
): Promise<ActivityDefinition>

/**
 * Update service
 */
async function updateService(
  medplum: MedplumClient,
  serviceId: string,
  values: ServiceFormValues
): Promise<ActivityDefinition>

/**
 * Soft delete service (status='retired')
 */
async function deleteService(
  medplum: MedplumClient,
  serviceId: string
): Promise<ActivityDefinition>

/**
 * Hard delete service
 */
async function hardDeleteService(
  medplum: MedplumClient,
  serviceId: string
): Promise<void>
```

#### **permissionService.ts** - Permission Matrix Operations

```typescript
/**
 * Get permission matrix for role
 */
async function getPermissionMatrix(
  medplum: MedplumClient,
  roleId: string
): Promise<PermissionMatrix[]>

/**
 * Update permission matrix
 */
async function updatePermissionMatrix(
  medplum: MedplumClient,
  roleId: string,
  permissions: PermissionMatrix[]
): Promise<AccessPolicy>

/**
 * Detect role conflicts
 */
function detectRoleConflicts(
  roles: AccessPolicy[]
): RoleConflict[]

/**
 * Resolve permission dependencies
 * Auto-enable required permissions
 */
function resolvePermissionDependencies(
  selectedPermissions: string[],
  allPermissions: PermissionDefinition[]
): string[]
```

#### **invitationService.ts** - Invite Management

```typescript
/**
 * Get invitation status for practitioner
 * Returns: pending|accepted|expired|bounced|cancelled
 */
async function getInvitationStatus(
  medplum: MedplumClient,
  practitionerId: string
): Promise<InvitationStatus>

/**
 * Find Invite resource for practitioner
 */
async function findInviteForPractitioner(
  medplum: MedplumClient,
  practitionerId: string
): Promise<Invite | undefined>

/**
 * Resend invitation email
 */
async function resendInvitation(
  medplum: MedplumClient,
  practitionerId: string
): Promise<void>

/**
 * Generate activation link for sharing manually
 */
async function generateActivationLink(
  medplum: MedplumClient,
  practitionerId: string
): Promise<{ url: string; expiresAt?: string }>
```

### 4.3 Laboratory Services

#### **sampleService.ts**, **manipulationService.ts**, **syringeService.ts**, **researchComponentService.ts**

```typescript
// Similar CRUD patterns for each lab resource type
async function searchSamples(medplum, filters): Promise<Bundle>
async function createSample(medplum, values): Promise<SpecimenDefinition>
async function updateSample(medplum, id, values): Promise<SpecimenDefinition>
async function deleteSample(medplum, id): Promise<void>

// Same pattern for Manipulations (ActivityDefinition)
// Same pattern for Syringes (DeviceDefinition)
// Same pattern for Research Components (ObservationDefinition)
```

### 4.4 Export & Validation Services

#### **exportService.ts** - Data Export

```typescript
/**
 * Export accounts to Excel (.xlsx)
 */
function exportToExcel(
  accounts: AccountRow[],
  fileName: string
): Blob

/**
 * Export accounts to CSV
 */
function exportToCSV(
  accounts: AccountRow[],
  fileName: string
): Blob

/**
 * Export audit logs with filters applied
 */
function exportAuditLogs(
  events: AuditLogEntry[],
  format: 'xlsx' | 'csv',
  filters?: AuditLogFilters
): Blob
```

#### **accountValidators.ts** - Validation Rules

```typescript
/**
 * Validate email (RFC 5322)
 */
function validateEmail(email: string): ValidationResult

/**
 * Validate phone number (E.164 format)
 */
function validatePhoneNumber(phone: string): ValidationResult

/**
 * Validate hire date (past or present)
 */
function validateHireDate(date: string): ValidationResult

/**
 * Validate staff ID (custom format)
 */
function validateStaffId(staffId: string): ValidationResult
```

#### **formValidationService.ts** - Form Field Validation

```typescript
/**
 * Validate form response against Questionnaire
 */
function validateQuestionnaireResponse(
  response: QuestionnaireResponse,
  questionnaire: Questionnaire
): ValidationError[]

/**
 * Get validation rules from field config
 */
function getFieldValidationConfig(field: FieldConfig): ValidationConfig

/**
 * Apply custom validation pattern
 */
function validatePattern(value: string, pattern: string): boolean
```

---

## Part 5: Data Flow Examples

### Example 1: Creating a Patient Account

```
UI (AccountForm.tsx)
  ↓
  values: AccountFormValues
  ↓
  accountService.createPractitioner(medplum, values)
  ↓
  Medplum Client (Admin API)
  ↓
  POST /admin/projects/{projectId}/invite
  {
    resourceType: "Practitioner",
    firstName: "თენგიზი",
    lastName: "ხოზვრია",
    email: "tengizi@example.ge"
  }
  ↓
  Medplum Server (Node.js)
  ↓
  Creates:
  1. User resource (login credentials)
  2. Practitioner resource (FHIR profile)
  3. ProjectMembership (links user to project)
  4. Sends invitation email with activation link
  ↓
  Returns ProjectMembership with profile reference
  ↓
  If roles specified → assignRoleToUser() → creates PractitionerRole
  ↓
  auditService.createAuditEvent()
  ↓
  PostgreSQL via Medplum:
  - INSERT INTO practitioner (id, data JSON)
  - INSERT INTO project_membership (practitioner_id, user_id)
  - INSERT INTO audit_event (action='C', ...)
```

### Example 2: Searching and Editing Patient History

```
UI (PatientHistoryView.tsx)
  ↓
  PatientHistoryFilters (insurance, date, name, etc.)
  ↓
  patientHistoryService.searchEncounters(
    medplum,
    {
      personalId: "26001014632",
      dateFrom: "2025-11-01",
      dateTo: "2025-11-30",
      _include: "Encounter:patient"
    }
  )
  ↓
  Medplum Client
  ↓
  GET /Encounter?
    patient.identifier=http://medimind.ge/identifiers/personal-id|26001014632
    &date=ge2025-11-01
    &date=le2025-11-30
    &_include=Encounter:patient
    &_sort=-date
    &_count=100
  ↓
  Medplum Server (PostgreSQL query)
  ↓
  Returns Bundle containing:
  - Array of Encounter resources (matching criteria)
  - Array of Patient resources (included via _include)
  ↓
  Client maps to VisitTableRow[] using fhirHelpers.mapEncounterToTableRow()
  ↓
  User clicks edit icon → VisitEditModal opens
  ↓
  Loads Encounter + Coverage resources
  ↓
  User modifies form → submits
  ↓
  Updates Encounter: updateEncounter(medplum, encounter)
  ↓
  Updates Coverage (Insurance I/II/III): upsertCoverage(medplum, ...)
  ↓
  PUT /Encounter/{id} with modified data
  PUT /Coverage/{id} for each insurance tab
  ↓
  PostgreSQL updates JSONB columns
  ↓
  Creates audit event: AuditEvent (action='U', entityType='Encounter', outcome='0')
  ↓
  Table refreshes automatically
```

### Example 3: Medical Service Nomenclature

```
UI (ServiceTable.tsx)
  ↓
  nomenclatureService.searchServices(medplum, {code: "JXDD3A"})
  ↓
  GET /ActivityDefinition?
    identifier=http://medimind.ge/nomenclature/service-code|JXDD3A
  ↓
  Returns Bundle with ActivityDefinition resources
  ↓
  Maps to ServiceTableRow[] using nomenclatureHelpers
  ↓
  User clicks "Edit" → opens ServiceEditModal
  ↓
  Loads ActivityDefinition with extensions:
  {
    id: "act-123",
    title: "მუცლის ღრუს ექოსკოპია",
    identifier: [{
      system: "http://medimind.ge/nomenclature/service-code",
      value: "JXDD3A"
    }],
    topic: [{text: "ინსტრუმენტული კვლევები"}],
    extension: [
      {
        url: "http://medimind.ge/extensions/service-type",
        valueCodeableConcept: {...}
      },
      {
        url: "http://medimind.ge/extensions/base-price",
        valueMoney: {value: 150, currency: "GEL"}
      },
      {
        url: "http://medimind.ge/extensions/assigned-departments",
        valueString: "org-1,org-2"
      }
    ]
  }
  ↓
  Extracts data using nomenclatureHelpers:
  - code = identifier[service-code].value
  - name = title
  - group = topic[0].text
  - type = extension[service-type].valueCodeableConcept.code
  - price = extension[base-price].valueMoney.value
  ↓
  User modifies fields → submits
  ↓
  PUT /ActivityDefinition/{id} with updated extensions
  ↓
  PostgreSQL updates JSONB
```

### Example 4: Form Builder & Patient Binding

```
UI (FormBuilderCanvas.tsx)
  ↓
  User drags fields onto canvas
  ↓
  FormTemplate {
    title: "Patient Intake",
    fields: [
      {
        id: "1",
        linkId: "name",
        label: "Full Name",
        type: "text",
        patientBinding: {
          enabled: true,
          bindingKey: "fullName"
        }
      },
      {
        id: "2",
        linkId: "dob",
        label: "Date of Birth",
        type: "date",
        patientBinding: {
          enabled: true,
          bindingKey: "dob"
        }
      }
    ]
  }
  ↓
  User saves form
  ↓
  formBuilderService.createQuestionnaire(medplum, formTemplate)
  ↓
  Converts to FHIR Questionnaire using fhirHelpers.toQuestionnaire()
  ↓
  {
    resourceType: "Questionnaire",
    title: "Patient Intake",
    status: "draft",
    item: [
      {
        linkId: "name",
        text: "Full Name",
        type: "string",
        extension: [{
          url: "http://medimind.ge/patient-binding",
          valueString: JSON.stringify({
            bindingKey: "fullName",
            fhirPath: "Patient.name[0].given[0] + ' ' + Patient.name[0].family"
          })
        }]
      },
      {
        linkId: "dob",
        text: "Date of Birth",
        type: "date",
        extension: [{
          url: "http://medimind.ge/patient-binding",
          valueString: JSON.stringify({
            bindingKey: "dob",
            fhirPath: "Patient.birthDate"
          })
        }]
      }
    ]
  }
  ↓
  POST /Questionnaire
  ↓
  PostgreSQL stores Questionnaire
  ↓
  Later: User fills out form for patient (patientId: "pat-123")
  ↓
  formRendererService.bindPatientData(questionnaire, patient)
  ↓
  Uses patientDataBindingService to evaluate bindings:
  - fullName → Extract patient.name[0].given + patient.name[0].family
  - dob → Extract patient.birthDate
  ↓
  Pre-fills form fields with patient data
  ↓
  User completes form → submits
  ↓
  Creates QuestionnaireResponse {
    resourceType: "QuestionnaireResponse",
    questionnaire: "Questionnaire/form-123",
    status: "completed",
    subject: {reference: "Patient/pat-123"},
    item: [
      {linkId: "name", answer: [{valueString: "თენგიზი ხოზვრია"}]},
      {linkId: "dob", answer: [{valueDate: "1986-01-26"}]}
    ]
  }
  ↓
  POST /QuestionnaireResponse
  ↓
  PostgreSQL stores QuestionnaireResponse linked to Patient
```

---

## Part 6: Key Database Patterns

### PostgreSQL JSONB Storage

All FHIR resources stored as JSONB columns:

```sql
-- Core tables
CREATE TABLE resource (
  id UUID PRIMARY KEY,
  resourceType VARCHAR(255),
  data JSONB,              -- Full FHIR resource
  lastUpdated TIMESTAMP
);

-- Example queries
SELECT * FROM resource
WHERE resourceType = 'Patient'
  AND data->>'id' = 'pat-123';

SELECT * FROM resource
WHERE resourceType = 'Encounter'
  AND data#>'{identifier,0,value}' = '26001014632';
```

### FHIR Resource Relationships

```
Patient (1)
  ├── identifier[personal-id, registration-number]
  ├── name[given, family]
  ├── telecom[phone, email]
  ├── address
  └── extension[unknown-patient, citizenship, ...]

      ↓ (subject)

Encounter (N)
  ├── subject → Patient
  ├── period[start=admission, end=discharge]
  ├── status [planned|arrived|in-progress|finished|entered-in-error]
  ├── class [IMP=inpatient, AMB=ambulatory]
  ├── identifier[visit-registration, ambulatory-registration]
  ├── extension[total-amount, discount-percent, payment-amount, debt-amount]
  └── reasonCode/Reference → Condition

      ↓ (patient)

Coverage (N)
  ├── patient → Patient
  ├── payor → Organization (insurance company)
  ├── type → CodeableConcept (insurance type)
  ├── subscriberId (policy number)
  ├── order (1=primary, 2=secondary, 3=tertiary)
  └── extension[referral-number, copay-percent, ...]

Practitioner (1)
  ├── identifier[staff-id]
  ├── name[given, family]
  ├── telecom[phone, email]
  ├── gender
  ├── birthDate
  └── extension[department, ...]

      ↓ (practitioner)

PractitionerRole (N)
  ├── practitioner → Practitioner
  ├── code → CodeableConcept (role type)
  ├── specialty → CodeableConcept (NUCC code)
  ├── location → Location[]
  ├── organization → Organization (department)
  ├── meta.tag[role-assignment, role-code]
  └── active

AccessPolicy (Role)
  ├── meta.tag[role-identifier, role-status]
  ├── resource[] (permission matrix)
  └── description
```

---

## Part 7: Query Examples (FHIR Search)

### Patient Search
```
GET /Patient?identifier=http://medimind.ge/identifiers/personal-id|26001014632
GET /Patient?name=თენგიზი&family=ხოზვრია
GET /Patient?email=tengizi@example.ge
GET /Patient?_count=50&_offset=100  # Pagination
```

### Encounter Search
```
GET /Encounter?
  patient.identifier=http://medimind.ge/identifiers/personal-id|26001014632
  &date=ge2025-11-01
  &date=le2025-11-30
  &_include=Encounter:patient
  &_sort=-date
  &_count=100

GET /Encounter?identifier=http://medimind.ge/identifiers/visit-registration|10357-2025
```

### Practitioner Search
```
GET /Practitioner?name=თენგიზი
GET /Practitioner?email=tengizi@example.ge
GET /Practitioner?identifier=http://medimind.ge/identifiers/staff-id|STAFF-2025-001
GET /Practitioner?_tag=http://medimind.ge/role-assignment|physician
```

### Service (ActivityDefinition) Search
```
GET /ActivityDefinition?
  identifier=http://medimind.ge/nomenclature/service-code|JXDD3A
  &status=active

GET /ActivityDefinition?
  topic=ინსტრუმენტული კვლევები
  &_count=100
```

### Form (Questionnaire) Search
```
GET /Questionnaire?status=active&_tag=http://medimind.ge/form-category|medical
GET /Questionnaire?title=Patient Intake
```

---

## Summary Table

| Layer | Location | Purpose | Key Types |
|-------|----------|---------|-----------|
| **FHIR Types** | `packages/fhirtypes/dist/*.d.ts` | R4 resource definitions | 210+ resources |
| **EMR Types** | `packages/app/src/emr/types/*.ts` | Custom interfaces | FormValues, TableRow, Filters |
| **Services** | `packages/app/src/emr/services/*.ts` | Data access & transformation | CRUD, search, bulk operations |
| **Extensions** | `http://medimind.ge/*` | Custom metadata | 60+ extension URLs |
| **Database** | PostgreSQL via Medplum | Resource storage | JSONB columns |

---

## Best Practices

### When Adding New Features

1. **Check if FHIR resource exists** for the concept
   - Use `@medplum/fhirtypes` types
   - Don't create new custom types unnecessarily

2. **Use custom extensions** for MediMind-specific data
   - Follow URL pattern: `http://medimind.ge/category/name`
   - Document extension in this guide

3. **Create corresponding TypeScript interfaces**
   - Place in `packages/app/src/emr/types/`
   - Map form values to FHIR resources
   - Flatten FHIR for UI display

4. **Implement service functions**
   - CRUD operations in `packages/app/src/emr/services/`
   - Use `fhirHelpers.ts` for data extraction
   - Create audit events for compliance

5. **Use server-side pagination**
   - Implement `_count` and `_offset` parameters
   - Return `PaginatedResponse<T>`

6. **Always validate before saving**
   - Use validator services
   - Document validation rules in type files

