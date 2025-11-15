# Feature Specification: FHIR-Based Patient Registration System

**Feature Branch**: `004-fhir-registration-implementation`
**Created**: 2025-11-12
**Status**: Draft
**Input**: User description: "Build registration section with FHIR data structure based on mapped hospital EMR documentation"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Patient Search and List View (Priority: P1)

Reception staff need to quickly search for existing patients to avoid duplicate registrations and to access patient records for updates. The system must display a searchable, filterable list of all registered patients with their key identifying information.

**Why this priority**: This is the entry point for all registration workflows. Without the ability to search and view existing patients, staff cannot perform any registration tasks safely or efficiently. Duplicate prevention is critical for data integrity.

**Independent Test**: Can be fully tested by navigating to the registration section, entering search criteria (first name, last name, personal ID, or registration number), and viewing the filtered patient list with correct data display.

**Acceptance Scenarios**:

1. **Given** reception staff is on the registration page, **When** they enter a patient's first name "ნინო" in the search field and click the search button, **Then** the system displays all patients whose first name contains "ნინო" with their personal ID, full name, birth date, gender, phone, and address
2. **Given** multiple patients match search criteria, **When** the patient list displays, **Then** each patient row shows edit and delete action icons, and row numbers are displayed in descending order
3. **Given** a patient list is displayed, **When** staff click on a patient's edit icon, **Then** the system opens that patient's registration form with all existing data pre-populated for editing

---

### User Story 2 - New Patient Registration (Priority: P1)

Reception staff need to register new patients by capturing comprehensive demographic and identification information including personal details, contact information, citizenship, and representative/relative information for minors or patients requiring assistance.

**Why this priority**: This is the core function of the registration module - creating new patient records. Without this capability, no new patients can enter the healthcare system. This is an independently valuable slice that delivers immediate business value.

**Independent Test**: Can be fully tested by clicking "new patient" button, filling in required fields (first name, last name, gender), optional fields (personal ID, birth date, contact information), and successfully saving a new patient record that appears in the patient list.

**Acceptance Scenarios**:

1. **Given** staff clicks "new patient" button, **When** the registration form displays, **Then** all form fields are empty and ready for data entry with required fields clearly marked (first name*, last name*, gender*)
2. **Given** staff enters patient information including personal ID (11 digits), first name, last name, birth date, gender, phone number with country code (+995), legal address, workplace, and email, **When** they submit the form, **Then** the system validates all fields and creates a new patient record with a unique registration number
3. **Given** staff is registering a minor patient (birth date indicates age < 18), **When** they complete the patient's basic information, **Then** the system prompts for representative information including representative's name, personal ID, birth date, gender, phone, address, and relationship to patient
4. **Given** staff enters email address "user@example.com", **When** they move to the next field or submit, **Then** the system validates the email format and shows an error if the format is invalid

---

### User Story 3 - Update Existing Patient Information (Priority: P2)

Staff need to update patient records when information changes (address, phone number, citizenship, etc.) or when additional information becomes available (workplace, email, representative details).

**Why this priority**: While not as critical as initial registration, maintaining accurate patient data is essential for ongoing care. This is an independent feature that can be tested by updating any existing patient record.

**Independent Test**: Can be fully tested by searching for an existing patient, clicking the edit icon, modifying any field (e.g., phone number or address), saving changes, and verifying the updated information appears in the patient list and when reopening the patient record.

**Acceptance Scenarios**:

1. **Given** staff opens an existing patient record for editing, **When** they modify the phone number and legal address, **Then** the system saves the changes and displays the updated information in the patient list
2. **Given** staff is updating a patient record, **When** they change the personal ID number, **Then** the system validates the 11-digit format and checks for duplicates before allowing the save
3. **Given** a patient's citizenship information was not recorded at registration, **When** staff opens the record and selects citizenship from the 250-country dropdown, **Then** the system saves the citizenship information for future reference

---

### User Story 4 - Emergency/Unknown Patient Registration (Priority: P2)

Emergency department staff need to register patients who arrive without identification or who are unconscious/unable to provide information, allowing registration to proceed with minimal required fields.

**Why this priority**: This handles a critical edge case for emergency care, but it's not the primary workflow. It can be independently tested and deployed to support emergency scenarios.

**Independent Test**: Can be fully tested by checking the "unknown patient" checkbox, verifying that required fields (first name, last name) become optional, entering minimal information, and successfully creating a patient record with placeholder data.

**Acceptance Scenarios**:

1. **Given** emergency staff checks the "unknown patient" (უცნობი) checkbox, **When** the form updates, **Then** the first name, last name, and personal ID fields become optional allowing registration with partial information
2. **Given** an unknown patient is registered, **When** staff enter placeholder information like "Unknown Patient 001" as name, **Then** the system creates the record with a unique registration number for later identification and data completion
3. **Given** an unknown patient record exists, **When** the patient's identity is later confirmed, **Then** staff can update the record with full identification information including personal ID and complete demographics

---

### User Story 5 - Citizenship and International Patient Management (Priority: P3)

Staff need to register international patients and record their citizenship from a comprehensive list of 250 countries and territories for statistical reporting, insurance processing, and regulatory compliance.

**Why this priority**: This is important for international patients but not critical for basic registration functionality. It's an independent feature that can be added after core registration works.

**Independent Test**: Can be fully tested by registering a patient, selecting citizenship from the dropdown (e.g., "ამერიკის შეერთებული შტატები" for United States), saving the record, and verifying the citizenship is stored and displayed correctly.

**Acceptance Scenarios**:

1. **Given** staff is registering an international patient, **When** they open the citizenship dropdown, **Then** the system displays 250 country options in Georgian language with Georgia (საქართველო) easily accessible
2. **Given** staff selects a citizenship, **When** they save the patient record, **Then** the system stores the citizenship information for insurance and regulatory reporting purposes
3. **Given** citizenship was not recorded at initial registration, **When** staff later edit the patient record and add citizenship, **Then** the system updates the record without affecting other patient data

---

### User Story 6 - Representative/Relative Information Capture (Priority: P3)

Staff need to record information about patient representatives, guardians, or emergency contacts including their personal details and relationship to the patient for legal guardianship, emergency notification, and family medical history purposes.

**Why this priority**: This is important for minors and incapacitated patients but not required for all registrations. It's an independent feature that can be tested separately from basic patient registration.

**Independent Test**: Can be fully tested by registering or editing a patient, filling in the representative section with name, personal ID, birth date, gender, phone, address, and relationship type (e.g., "დედა" for mother), and verifying the representative information is linked to the patient record.

**Acceptance Scenarios**:

1. **Given** staff is registering a minor patient (age < 18 based on birth date), **When** they complete the patient's basic information, **Then** the system requires representative information including first name, last name, personal ID, and relationship type
2. **Given** staff enters representative information, **When** they select relationship type from dropdown (mother, father, spouse, child, grandparent, sibling, general relative, maternal relative, paternal relative), **Then** the system stores the relationship for emergency contact and legal guardian purposes
3. **Given** a patient has multiple representatives (e.g., both parents), **When** staff saves the first representative and adds another, **Then** the system allows multiple representative records to be linked to a single patient
4. **Given** representative's personal ID is entered, **When** the staff moves to the next field, **Then** the system validates the 11-digit Georgian national ID format

---

### Edge Cases

- What happens when staff attempt to register a patient with a personal ID that already exists in the system?
  - System should display a warning message showing the existing patient record and ask staff to confirm if they want to create a duplicate or open the existing record
- How does the system handle patients with no personal ID (e.g., newborns, foreign visitors without Georgian ID)?
  - System allows registration with empty personal ID field; uses hospital-assigned registration number as primary identifier
- What happens when staff enter a birth date that makes the patient over 120 years old or in the future?
  - System displays validation error requesting staff to verify the birth date before allowing save
- How does the system handle partial phone numbers or non-standard formats?
  - System accepts various phone number formats but normalizes to standard format (country code + 9 digits) for storage
- What happens when staff search with empty search criteria?
  - System displays the most recent registrations (default view) or all patients depending on configuration
- How does the system handle Georgian Unicode characters in names and addresses?
  - System must support full Georgian Unicode character set (U+10A0 to U+10FF) for proper display and search
- What happens when deleting a patient record that has associated medical history, appointments, or billing records?
  - System should prevent permanent deletion if associated records exist; offer archive/soft delete option instead

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a searchable patient list showing registration number, personal ID, first name, last name, birth date, gender, phone number, and address
- **FR-002**: System MUST provide search filters for first name, last name, personal ID (11-digit Georgian national ID), and registration number with partial matching capability
- **FR-003**: System MUST validate personal ID as exactly 11 numeric digits when provided
- **FR-004**: System MUST mark first name, last name, and gender as required fields for standard patient registration
- **FR-005**: System MUST allow phone numbers with country code selection defaulting to Georgia (+995)
- **FR-006**: System MUST validate email addresses for proper format (RFC 5322 compliance) when provided
- **FR-007**: System MUST provide a citizenship dropdown with 250 countries and territories in Georgian language
- **FR-008**: System MUST display Georgian text labels for all form fields and UI elements
- **FR-009**: System MUST allow registering "unknown" patients in emergency scenarios by making identification fields optional when "unknown patient" checkbox is activated
- **FR-010**: System MUST capture representative/relative information including first name, last name, personal ID, birth date, gender, phone, address, and relationship type
- **FR-011**: System MUST provide relationship type dropdown with 11 options: mother, father, sister, brother, grandmother, grandfather, child, spouse, relative (general), maternal relative, paternal relative
- **FR-012**: System MUST allow multiple representatives to be associated with a single patient record
- **FR-013**: System MUST validate date fields to prevent future dates and dates older than 120 years from current date
- **FR-014**: System MUST display edit and delete action icons for each patient in the patient list
- **FR-015**: System MUST warn users before deleting patient records and require confirmation
- **FR-016**: System MUST check for duplicate personal IDs during patient registration and alert staff if match found
- **FR-017**: System MUST generate unique registration numbers for all patients automatically
- **FR-018**: System MUST persist all patient data including demographics, contact information, citizenship, and representative relationships
- **FR-019**: System MUST display patient list with rows in descending order by registration number (newest first)
- **FR-020**: System MUST support editing existing patient records with all fields pre-populated with current values
- **FR-021**: System MUST map patient data to FHIR Patient resource structure for interoperability
- **FR-022**: System MUST map representative/relative data to FHIR RelatedPerson resource structure
- **FR-023**: System MUST store phone numbers in FHIR ContactPoint format with system and use attributes
- **FR-024**: System MUST store addresses in FHIR Address format with appropriate use and type values
- **FR-025**: System MUST store citizenship as FHIR Patient.extension using appropriate coding system
- **FR-026**: System MUST handle unknown patients by creating FHIR Patient resources with minimal required elements
- **FR-027**: System MUST support searching FHIR Patient resources by name, identifier, and birthdate
- **FR-028**: System MUST link RelatedPerson resources to Patient resources using patient reference
- **FR-029**: System MUST store relationship types using FHIR relationship code values from appropriate value sets
- **FR-030**: System MUST preserve data integrity when transitioning from legacy EMR data structure to FHIR format

### Key Entities

- **Patient**: Represents an individual receiving healthcare services. Core attributes include unique registration number, personal ID (Georgian national ID), first name, last name, father's name (patronymic), birth date, gender (male/female), phone number with country code, legal address, workplace, email, and citizenship. The patient serves as the central entity connecting to all other healthcare data including medical history, appointments, billing, and representative relationships.

- **Representative/RelatedPerson**: Represents a person related to the patient such as guardian, family member, or emergency contact. Attributes include first name, last name, personal ID, birth date, gender, phone number, address, and relationship type to patient (mother, father, spouse, child, sibling, grandparent, or other relative). Multiple representatives can be associated with a single patient. This entity is critical for minors, incapacitated patients, and emergency contact purposes.

- **Citizenship**: Represents a patient's country of citizenship from 250 available countries and territories. Used for statistical reporting, insurance processing, and regulatory compliance. Stored as reference to country code list with Georgian language display names.

- **Search Filter**: Represents search criteria for locating patients in the system. Supports filtering by first name, last name, personal ID, and registration number with partial matching. Multiple filters can be combined with AND logic.

- **Patient List Result**: Represents a set of patients matching search criteria. Each result includes patient identification, demographics, and contact summary. Results are sorted by registration number in descending order with pagination support for large result sets.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Reception staff can search for and locate existing patients in under 10 seconds by entering any combination of first name, last name, or personal ID
- **SC-002**: Staff can complete a new patient registration with full information (name, ID, birth date, gender, contact details) in under 3 minutes
- **SC-003**: Emergency registration for unknown patients can be completed in under 1 minute using minimal required fields
- **SC-004**: System prevents duplicate patient registrations by alerting staff when personal ID matches existing record with 100% accuracy
- **SC-005**: Patient list displays search results within 2 seconds for databases containing up to 100,000 patient records
- **SC-006**: 95% of patient searches return the intended patient in the first 5 results
- **SC-007**: Staff can update patient contact information (phone, address, email) and see changes reflected in patient list immediately without page refresh
- **SC-008**: System maintains data accuracy by validating 100% of Georgian personal ID numbers for correct 11-digit format
- **SC-009**: Email format validation catches invalid email addresses before saving with 100% accuracy
- **SC-010**: Representative information for minors is captured in 100% of minor patient registrations (age < 18)
- **SC-011**: System supports registration workflows in Georgian language with proper Unicode display for 100% of Georgian characters
- **SC-012**: Patient data stored in FHIR format is fully interoperable with external FHIR-compliant systems with 100% data preservation during export/import cycles
- **SC-013**: Staff complete the registration workflow with zero technical training after 15-minute orientation on form fields and business rules
- **SC-014**: System handles concurrent registrations by multiple staff members without data conflicts or lost updates
- **SC-015**: 90% of users report registration interface is intuitive and matches their expected workflow from legacy EMR system

## Assumptions *(optional)*

### Data Migration and Legacy System
- The legacy EMR system data structure has been fully documented in `/documentation/registration/` directory with complete field mappings
- Existing patient data will need to be migrated from legacy format to FHIR Patient resources
- Legacy system's personal ID (პირადი ნომერი) maps directly to FHIR Patient.identifier with Georgian national ID system
- Legacy system's registration number (რიგითი ნომერი) maps to FHIR Patient.identifier with hospital-assigned system

### Technical Environment
- Medplum FHIR server is available and configured for the project
- MedplumClient from @medplum/core package is used for all FHIR resource operations
- React 19 is used for frontend UI components
- Mantine UI component library provides form controls and styling consistent with existing EMR layout
- System has network connectivity for FHIR API operations with appropriate error handling for offline scenarios

### Business Rules
- Georgian national ID format is standardized as 11 numeric digits
- Minors are defined as patients under 18 years of age based on birth date
- Country code +995 (Georgia) is the default for phone number entry
- Date format follows DD-MM-YYYY convention for display (stored as ISO 8601 in FHIR)
- Gender is binary (male/female) per legacy system; no additional gender options required at this time
- Registration numbers are auto-generated and immutable once assigned

### User Roles and Permissions
- All registration staff have permission to create, read, and update patient records
- Delete permission is restricted to supervisory roles and requires confirmation
- Search access is available to all authenticated users in the system
- No patient data is exposed to unauthenticated users

### Internationalization
- Primary system language is Georgian (ქართული)
- English and Russian translations are provided for secondary language support (based on existing EMR UI layout)
- Citizenship country names are maintained in Georgian language only for initial implementation
- All form labels support multi-language switching via existing EMR language selector

### Data Quality and Validation
- Personal ID validation uses checksum algorithm for Georgian national IDs when available
- Phone numbers support international formats but are normalized to E.164 format for storage
- Email validation follows RFC 5322 standard
- Required fields can be relaxed for emergency "unknown patient" registrations

## Dependencies *(optional)*

### Internal Dependencies
- **EMR UI Layout (Feature 003)**: Registration forms must integrate with the existing 4-row horizontal navigation layout at `/emr/registration` route
- **Translation System**: Registration forms must use existing `useTranslation` hook from `packages/app/src/emr/hooks/useTranslation.ts` for multi-language support
- **Menu Structure**: Registration sub-menu items defined in `packages/app/src/emr/translations/menu-structure.ts` must route to registration views
- **Theme System**: Registration forms must use CSS custom properties from `packages/app/src/emr/styles/theme.css` for consistent styling

### External Dependencies
- **@medplum/core**: MedplumClient for FHIR API operations (create, read, update, search Patient and RelatedPerson resources)
- **@medplum/fhirtypes**: TypeScript definitions for Patient, RelatedPerson, ContactPoint, Address, Identifier, and HumanName FHIR resources
- **@medplum/react**: Potential use of ResourceForm, ResourceTable, or SearchControl components for FHIR resource management
- **@mantine/core**: Form controls (TextInput, Select, DateInput, Checkbox, Button), layout components (Box, Grid, Stack), and notifications for user feedback
- **@mantine/form**: Form state management, validation, and error handling
- **react-router-dom**: Routing for navigation between registration sub-views and integration with EMR page routes

### Data Dependencies
- **Citizenship Reference Data**: 250 country codes and Georgian translations must be loaded from `packages/app/src/emr/translations/citizenship.json` or similar reference data file
- **Relationship Type Reference Data**: 11 relationship types must be mapped to FHIR relationship value set codes
- **Phone Country Codes**: Country code list for phone number input with Georgia (+995) as default
- **Validation Rules**: Georgian personal ID format rules, email validation regex, date range constraints

### Service Dependencies
- **Medplum FHIR Server**: Running and accessible at configured base URL with proper authentication
- **PostgreSQL Database**: Backend storage for FHIR resources via Medplum server
- **Redis**: Caching layer for improved search performance (via Medplum server)

## Out of Scope *(optional)*

### Features Not Included
- **Medical History Integration**: Patient registration does not include capturing medical history, diagnoses, medications, or clinical notes (handled by Patient History module)
- **Appointment Scheduling**: Registration does not book appointments or allocate time slots (separate scheduling module)
- **Billing and Insurance**: Registration captures demographics but does not process payments, insurance claims, or financial transactions (separate billing module)
- **Photo Capture**: Patient photos are not captured during registration (may be added in future enhancement)
- **Document Scanning**: Registration does not include scanning or uploading identification documents, insurance cards, or referral letters
- **Advanced Duplicate Detection**: System performs basic duplicate check on personal ID only; fuzzy matching, probabilistic linking, or master patient index features are not included
- **Data Migration Tools**: Automated migration from legacy EMR to FHIR format is not included; manual data mapping and transformation required
- **Receptionist Intake (მიმღები)**: Advanced intake form with 32 fields documented in `receptionist-intake-form.md` is deferred to future phase
- **Patient Contacts (კონტაქტები)**: Separate contacts management view is not included in this phase
- **Inpatient Admission (სტაციონარი)**: Hospital admission processing is separate module outside registration scope
- **Patient Debts (ვალები)**: Debt tracking and management is separate financial module
- **Advance Payments (ავანსები)**: Prepayment processing is separate financial module
- **Patient Archive (არქივი)**: Archived records management is deferred to separate archival workflow
- **Patient Referrals (მიმართვები)**: Referral coordination is separate module for inter-facility transfers
- **Currency Management (ვალუტა)**: Currency and exchange rate management is separate financial configuration

### Technical Limitations
- **Offline Support**: System requires network connectivity for all operations; no offline data capture or sync
- **Mobile Optimization**: Registration forms are optimized for desktop use; mobile responsive design is not prioritized
- **Bulk Import/Export**: No batch upload or download functionality for patient records
- **Audit Trail**: Basic FHIR resource versioning is used; comprehensive audit logging with user attribution and timestamp tracking is minimal
- **Advanced Search**: Complex search queries (e.g., "find all patients over 60 with diabetes") are not supported; only basic demographic search
- **Barcode/QR Code**: No barcode scanning for patient ID cards or wristbands
- **Biometric Integration**: No fingerprint, facial recognition, or other biometric identification

### User Experience Enhancements
- **Autocomplete**: Type-ahead suggestions for city names, addresses, or workplace are not implemented
- **Duplicate Warnings During Typing**: Real-time duplicate detection while entering personal ID (only checks on save)
- **Field Pre-fill from Government Database**: No integration with national identity registry to auto-populate fields from personal ID
- **Multi-step Wizard**: Registration is single-page form; no progressive disclosure or wizard interface
- **Contextual Help**: No inline help text, tooltips, or guided tours for new users

### Data Management
- **Merge Duplicate Records**: If duplicates are created, manual merge functionality is not provided (requires administrative intervention)
- **Soft Delete/Restore**: Deleted records are permanently removed; no recycle bin or restore capability
- **Version History View**: While FHIR maintains version history, no UI for viewing past versions of patient records
- **Change Notifications**: No automated alerts when patient records are modified by other users

---

*Next Steps*: After specification approval, proceed to `/speckit.plan` to generate implementation plan with task breakdown, or use `/speckit.clarify` if any requirements need further refinement.
