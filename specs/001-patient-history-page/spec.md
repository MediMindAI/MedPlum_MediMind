# Feature Specification: Patient History Page (ისტორია)

**Feature Branch**: `001-patient-history-page`
**Created**: 2025-11-14
**Status**: Draft
**Input**: User description: "Build Patient History (ისტორია) page with FHIR-compliant visit management, filtering, and payment tracking following original EMR design"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Patient Visit History (Priority: P1)

As a hospital receptionist or clinician, I need to view a list of all patient visits with their financial status so I can quickly identify which patients have outstanding debts and access their records.

**Why this priority**: This is the core functionality of the entire page. Without being able to view patient visit history, no other operations can be performed. It represents the foundation for all other workflows.

**Independent Test**: Can be fully tested by navigating to the Patient History page (პაციენტის ისტორია → ისტორია) and verifying that a table displays with patient visits showing personal ID, name, date, registration number, and financial information (total, discount, debt, payment). Delivers immediate value by providing visibility into patient visit history.

**Acceptance Scenarios**:

1. **Given** I am logged into the EMR system, **When** I navigate to პაციენტის ისტორია → ისტორია, **Then** I see a table displaying all patient visits with columns for პ/ნ (Personal ID), სახელი (First Name), გვარი (Last Name), თარიღი (Date), # (Registration Number), ჯამი (Total), % (Discount), ვალი (Debt), and გადახდ. (Payment)

2. **Given** I am viewing the patient history table, **When** a patient has outstanding debt (ვალი > 0), **Then** the debt cell is highlighted in green to draw my attention

3. **Given** I am viewing the patient history table, **When** a visit has multiple timestamps (e.g., admission and discharge), **Then** both timestamps display on separate lines within the თარიღი (Date) cell

4. **Given** the patient history table is displayed, **When** I click on any patient visit row, **Then** I am taken to the detailed view for that visit

5. **Given** the patient history table is displayed, **When** there are no visits matching the current filter criteria, **Then** I see an empty table with column headers but no data rows

---

### User Story 2 - Filter Visit History by Insurance/Payer (Priority: P2)

As a billing administrator, I need to filter patient visits by insurance company or payer organization so I can focus on processing claims for specific insurance providers and track their payment status separately.

**Why this priority**: After being able to view all visits (P1), the ability to filter by payer is the next most critical need. Hospital billing departments typically process claims for different insurance companies on different schedules, making this filter essential for daily operations.

**Independent Test**: Can be tested independently by verifying the insurance/payer dropdown (58 options) works correctly and the table updates to show only visits associated with the selected payer. Delivers value by enabling focused claim processing workflows.

**Acceptance Scenarios**:

1. **Given** I am viewing the patient history table, **When** the page loads, **Then** the insurance/payer filter defaults to "შიდა" (Internal/Private pay)

2. **Given** I am viewing the patient history table, **When** I open the insurance/payer dropdown, **Then** I see 58 options including "სსიპ ჯანმრთელობის ეროვნული სააგენტო" (National Health Agency), various private insurance companies, and government organizations

3. **Given** I have selected an insurance company from the dropdown, **When** I apply the filter, **Then** the table updates to display only patient visits associated with that insurance company

4. **Given** I have filtered by insurance company, **When** I change to a different insurance company, **Then** the table refreshes to show visits for the newly selected company

5. **Given** I have selected "უფასო" (Free) from the payer dropdown, **When** the table refreshes, **Then** I see only visits that are provided free of charge

---

### User Story 3 - Search Visits by Patient Details (Priority: P3)

As a front desk staff member, I need to search for patient visits by personal ID, name, date range, or registration number so I can quickly locate specific patient records when patients call or arrive at the hospital.

**Why this priority**: While viewing and filtering (P1, P2) are essential, search functionality enhances productivity for high-volume operations. Staff frequently need to find specific patient records quickly based on partial information provided by patients.

**Independent Test**: Can be tested by entering search criteria in the filter row fields (personal ID, first name, last name, date range, registration numbers) and verifying the table displays only matching results. Delivers value by reducing time spent locating patient records.

**Acceptance Scenarios**:

1. **Given** I am viewing the patient history table, **When** I enter a personal ID (11-digit) in the პ/ნ search field, **Then** the table filters to show only visits for patients with that personal ID

2. **Given** I am viewing the patient history table, **When** I enter a patient's first name in the სახელი field, **Then** the table filters to show only visits for patients whose first name matches

3. **Given** I am viewing the patient history table, **When** I enter a date range using the two თარიღი date pickers, **Then** the table filters to show only visits within that date range

4. **Given** I am viewing the patient history table, **When** I enter a registration number (e.g., "10357-2025") in the # search field, **Then** the table filters to show the matching visit record

5. **Given** I am viewing the patient history table, **When** I enter an ambulatory registration number with "a-" prefix (e.g., "a-6871-2025") in the stac. no. search field, **Then** the table filters to show the matching ambulatory visit

6. **Given** I have entered multiple search criteria, **When** the table displays results, **Then** only visits matching ALL criteria are shown (AND logic)

---

### User Story 4 - Sort Visits by Date (Priority: P4)

As a hospital administrator, I need to sort patient visits by date in ascending or descending order so I can review visits chronologically or identify the most recent visits first.

**Why this priority**: Sorting enhances usability but is not essential for core operations. It provides convenience for reviewing visit patterns and trends.

**Independent Test**: Can be tested by clicking the თარიღი (Date) column header and verifying the table re-sorts accordingly. Delivers value by providing flexible data viewing options.

**Acceptance Scenarios**:

1. **Given** I am viewing the patient history table, **When** I click on the თარიღი (Date) column header, **Then** the table sorts visits in descending order (most recent first)

2. **Given** the table is sorted by date in descending order, **When** I click the თარიღი column header again, **Then** the table sorts visits in ascending order (oldest first)

3. **Given** the table is sorted by date, **When** the data refreshes after a filter change, **Then** the sort order is preserved

---

### User Story 5 - Edit Patient Visit Details (Priority: P5)

As a registration clerk, I need to edit patient visit information (visit type, insurance details, demographics) so I can correct errors or update information as patients provide additional documentation.

**Why this priority**: While important for data accuracy, editing capabilities depend on first being able to view visits (P1). This is a secondary operation typically performed less frequently than viewing and searching.

**Independent Test**: Can be tested by clicking the edit icon (pencil) on a visit row, verifying the visit edit modal/form opens with all fields populated, making changes, saving, and confirming the table updates. Delivers value by enabling data correction workflows.

**Acceptance Scenarios**:

1. **Given** I am viewing the patient history table, **When** I click the edit icon (pencil) on a visit row, **Then** a visit edit modal/form opens displaying the complete visit details

2. **Given** the visit edit form is open, **When** I view the form, **Then** I see sections for რეგისტრაცია (Registration), დემოგრაფია (Demographics), and დაზღვევა (Insurance) with all current values populated

3. **Given** I am editing a visit, **When** I change the შემოსვლის ტიპი (Registration Type) from one option to another, **Then** the form validates and allows me to save the change

4. **Given** I am editing a visit, **When** I update insurance information (company, policy number, coverage percentage), **Then** the changes are saved and reflected in the visit record

5. **Given** I am editing a visit with multiple insurance policies (დაზღვევა I, II, III), **When** I activate and fill out the second insurance tab, **Then** the visit record stores multiple insurance policies correctly

6. **Given** I have made changes in the visit edit form, **When** I click save, **Then** the form closes, the table refreshes, and the updated visit appears with the new information

7. **Given** I have made changes in the visit edit form, **When** I click cancel, **Then** the form closes without saving and the visit record remains unchanged

---

### User Story 6 - Delete Patient Visit (Priority: P6)

As an administrator with proper permissions, I need to delete erroneous patient visit records so I can maintain data accuracy and remove duplicate or test entries from the system.

**Why this priority**: Deletion is a low-frequency administrative operation that requires careful permission management. It is essential for data hygiene but not for daily clinical workflows.

**Independent Test**: Can be tested by clicking the delete icon on a visit row, confirming the deletion warning, and verifying the visit is removed from the table. Delivers value by enabling cleanup of erroneous records.

**Acceptance Scenarios**:

1. **Given** I have administrator permissions and am viewing the patient history table, **When** I click the delete icon (circle) on a visit row, **Then** a confirmation dialog appears asking me to confirm deletion

2. **Given** the deletion confirmation dialog is displayed, **When** I click confirm, **Then** the visit is deleted from the database and removed from the table view

3. **Given** the deletion confirmation dialog is displayed, **When** I click cancel, **Then** the dialog closes and the visit remains in the table unchanged

4. **Given** I do not have deletion permissions, **When** I view the patient history table, **Then** the delete icons are either hidden or disabled

---

### User Story 7 - View Financial Summary Status (Priority: P7)

As a financial coordinator, I need to quickly identify the financial status of visits (fully paid, partially paid, unpaid) through visual indicators so I can prioritize follow-up for collections.

**Why this priority**: This enhances the core viewing functionality (P1) with visual cues but is not a standalone feature. It depends on the table being displayed and provides incremental value.

**Independent Test**: Can be tested by verifying green highlighting appears on debt cells when ვალი > 0 and that financial calculations (debt = total - payment) are accurate. Delivers value through immediate visual identification of outstanding debts.

**Acceptance Scenarios**:

1. **Given** I am viewing the patient history table, **When** a visit has debt greater than zero (ვალი > 0), **Then** the ვალი cell is highlighted in green

2. **Given** I am viewing the patient history table, **When** a visit is fully paid (ვალი = 0), **Then** the ვალი cell has no background color (white/default)

3. **Given** I am viewing a visit in the table, **When** I look at the financial columns, **Then** I can verify that ვალი (Debt) = ჯამი (Total) - გადახდ. (Payment)

4. **Given** I am viewing the patient history table, **When** a visit has a discount percentage (% column > 0), **Then** the discount is displayed correctly and factored into the financial calculations

---

### Edge Cases

- What happens when a patient has an 11-digit personal ID that fails the Luhn checksum validation during editing?
- How does the system handle visits with multiple timestamps (admission and discharge) versus single-timestamp visits in date sorting?
- What happens when a user tries to delete a visit that has associated payment records or invoices?
- How does the system display visits when the registration number has an unusual format (neither numeric "10357-2025" nor "a-" prefixed "a-6871-2025")?
- What happens when the insurance/payer dropdown is set to an insurance company that has no associated visits in the database?
- How does the system handle extremely long patient names that might overflow table cell boundaries?
- What happens when a user applies multiple conflicting filters (e.g., date range with no results but insurance company with results)?
- How does the system handle visits created by users who are no longer in the system when displaying the მომყვანი (Referrer) field?
- What happens when a visit has three active insurance policies and all three tabs are filled with data?
- How does the system display negative debt values (overpayments) in the ვალი column?
- What happens when sorting by date and two visits have identical timestamps?
- How does the system handle very old visit records (e.g., from 10+ years ago) in date filtering and display?

## Requirements *(mandatory)*

### Functional Requirements

#### View & Display Requirements

- **FR-001**: System MUST display a patient visit history table with 10 columns: პ/ნ (Personal ID), სახელი (First Name), გვარი (Last Name), თარიღი (Date), # (Registration Number), ჯამი (Total), % (Discount), ვალი (Debt), გადახდ. (Payment), and Actions (Edit/Delete icons)

- **FR-002**: System MUST highlight the ვალი (Debt) cell in green when the debt value is greater than zero

- **FR-003**: System MUST display multiple timestamps (e.g., admission and discharge times) on separate lines within the same თარიღი (Date) cell when applicable

- **FR-004**: System MUST display personal ID (პ/ნ) as an 11-digit Georgian national ID format

- **FR-005**: System MUST display registration numbers in two formats: numeric (e.g., "10357-2025") for stationary visits and alphanumeric with "a-" prefix (e.g., "a-6871-2025") for ambulatory visits

- **FR-006**: System MUST calculate and display debt as: ვალი (Debt) = ჯამი (Total) - გადახდ. (Payment)

- **FR-007**: System MUST display a status indicator showing the count of loaded records (e.g., "ხაზზე (44)" meaning "44 records online")

- **FR-008**: System MUST make table rows clickable with cursor pointer on hover, navigating to visit detail view when clicked

#### Filter & Search Requirements

- **FR-009**: System MUST provide an insurance/payer dropdown filter with 58 options including insurance companies, government agencies, hospitals, and payment statuses

- **FR-010**: System MUST default the insurance/payer filter to "0 - შიდა" (Internal/Private pay) when the page loads

- **FR-011**: System MUST update the patient visit table to display only visits associated with the selected insurance/payer when the filter is changed

- **FR-012**: System MUST provide text search fields in the filter row for: პ/ნ (Personal ID), სახელი (First Name), გვარი (Last Name), two # fields (registration numbers)

- **FR-013**: System MUST provide two date picker fields (თარიღი) for specifying a date range filter

- **FR-014**: System MUST apply all active filters using AND logic (visits must match all specified criteria)

- **FR-015**: System MUST display an empty table with headers when no visits match the filter criteria

- **FR-016**: System MUST provide a checkbox filter (krpol) for additional filtering criteria

#### Sort Requirements

- **FR-017**: System MUST allow sorting the patient visit table by clicking the თარიღი (Date) column header

- **FR-018**: System MUST toggle sort order between descending (most recent first) and ascending (oldest first) when the date column header is clicked repeatedly

- **FR-019**: System MUST preserve sort order when the table data refreshes after filter changes

#### Edit Requirements

- **FR-020**: System MUST display an edit icon (pencil) in the action column for each visit row

- **FR-021**: System MUST open a visit edit modal/form when the edit icon is clicked

- **FR-022**: System MUST populate the visit edit form with all current visit data including რეგისტრაცია (Registration), დემოგრაფია (Demographics), and დაზღვევა (Insurance) sections

- **FR-023**: System MUST display 89 input fields, 25 select dropdowns, 3 textareas, and 17 buttons in the visit edit form

- **FR-024**: System MUST provide three insurance tabs (დაზღვევა I, II, III) in the edit form to support multiple insurance policies per visit

- **FR-025**: System MUST validate required fields marked with asterisk (*) including თარიღი (lak_regdate) and შემოსვლის ტიპი (lak_regtype) before allowing form submission

- **FR-026**: System MUST validate Georgian personal ID (11-digit) using Luhn checksum algorithm when entered or edited

- **FR-027**: System MUST refresh the patient visit table after a successful visit edit to display updated information

- **FR-028**: System MUST allow users to cancel editing without saving changes by clicking a cancel button

#### Delete Requirements

- **FR-029**: System MUST display a delete icon (circle) in the action column for each visit row

- **FR-030**: System MUST display a confirmation dialog when the delete icon is clicked, asking the user to confirm deletion

- **FR-031**: System MUST remove the visit from the database and the table view when deletion is confirmed

- **FR-032**: System MUST cancel deletion and keep the visit unchanged when the user clicks cancel in the confirmation dialog

- **FR-033**: System MUST restrict deletion functionality to users with administrator permissions

#### Data Integration Requirements

- **FR-034**: System MUST retrieve patient demographic data (პ/ნ, სახელი, გვარი) from the Patient Registration module

- **FR-035**: System MUST store visit information following FHIR R4 Encounter resource specification

- **FR-036**: System MUST store insurance information following FHIR R4 Coverage resource specification

- **FR-037**: System MUST link visit records to patient records using FHIR resource references

- **FR-038**: System MUST support storage of up to three insurance policies per visit using separate Coverage resources

#### Multilingual Requirements

- **FR-039**: System MUST display all labels, headers, and messages in Georgian (ka), English (en), and Russian (ru) based on user's language preference

- **FR-040**: System MUST persist user's language selection in localStorage as "emrLanguage"

- **FR-041**: System MUST translate all insurance company names based on selected language

#### Performance Requirements

- **FR-042**: System MUST load and display the patient visit table within 3 seconds of navigation to the page

- **FR-043**: System MUST update the table within 1 second when filter criteria are changed

- **FR-044**: System MUST support displaying at least 100 patient visits in the table without pagination

### Key Entities *(mandatory)*

- **Patient Visit (Encounter)**: Represents a single patient interaction with the hospital, including admission date/time, visit type (stationary/ambulatory/emergency), registration number, referrer, sender organization, and associated insurance coverage. Links to Patient resource and Coverage resources. Maps to FHIR R4 Encounter resource.

- **Patient**: Represents a patient with demographic information including 11-digit personal ID, first name (სახელი), last name (გვარი), patronymic, region, district, city, actual address, education level, family status, and employment status. Maps to FHIR R4 Patient resource.

- **Insurance Coverage**: Represents insurance policy information including insurance company, insurance type, policy number, referral number, issue date, expiration date, and co-payment percentage. A visit can have up to three insurance coverages. Maps to FHIR R4 Coverage resource.

- **Insurance Company/Payer**: Represents organizations that pay for or reimburse medical services, including government agencies (National Health Agency, Ministry of Health), private insurance companies (GPI Holding, Aldagi, Standard Insurance), hospitals, clinics, and payment statuses (Free, Uninsured). Referenced by Coverage resources.

- **Financial Transaction**: Represents payment and billing information associated with a visit including total amount (ჯამი), discount percentage (%), debt amount (ვალი), and payment amount (გადახდ.). Calculates debt as total minus payment. Used for financial tracking and collections.

- **Registration Number**: A unique identifier assigned to each visit, formatted as either numeric (e.g., "10357-2025") for stationary visits or alphanumeric with "a-" prefix (e.g., "a-6871-2025") for ambulatory visits. Used for quick visit lookup and referencing.

- **Visit Type**: Categorizes the nature of the patient encounter including registration type (შემოსვლის ტიპი), status type (mo_stat with 4 options), stationary type (lak_ddyastac), and referral type (lak_incmtp with 4 options). Determines workflow and billing rules.

- **Referrer/Sender**: Represents the person or organization that referred or sent the patient to the hospital, including მომყვანი (Referrer - 30 options) and გამომგზავნი (Sender organization - 3 options) with referral date/time. Used for tracking patient sources and care coordination.

- **Demographics**: Geographic and social information about the patient including რეგიონი (Region - 14 options), რაიონი (District - 94 total options, filtered to 18 based on region), ქალაქი (City), ფაქტიური მისამართი (Actual address), განათლება (Education - 7 levels), ოჯახური მდგომარეობა (Family status - 6 options), and დასაქმება (Employment - 9 options).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Hospital staff can locate any patient visit within 10 seconds using search filters (personal ID, name, or registration number)

- **SC-002**: The patient history table displays within 3 seconds of page navigation for up to 100 concurrent users

- **SC-003**: 95% of visit edits are completed and saved within 2 minutes, reducing data correction time by 40% compared to paper-based workflows

- **SC-004**: Billing staff can identify all patients with outstanding debts (ვალი > 0) instantly through green highlighting without reading individual cell values

- **SC-005**: The system handles filtering by any of the 58 insurance/payer options and returns results within 1 second

- **SC-006**: 100% of Georgian national personal IDs (11-digit) are validated using Luhn checksum algorithm before being saved to prevent data entry errors

- **SC-007**: Users successfully complete 90% of visit searches on their first attempt without needing to modify search criteria

- **SC-008**: The system supports all three languages (Georgian, English, Russian) with 100% of UI text translated and displayed correctly based on user preference

- **SC-009**: Financial calculations (debt = total - payment) are accurate to the nearest currency unit (GEL) for 100% of visit records

- **SC-010**: Users with proper permissions can edit and save visit information with zero data loss across all 89 input fields, 25 dropdowns, and 3 textareas in the edit form

- **SC-011**: The patient history page reduces manual record lookup time by 70% compared to the previous paper-based system

- **SC-012**: Support tickets related to "cannot find patient visit" are reduced by 60% within 3 months of deployment

## Assumptions *(mandatory)*

### Technical Assumptions

- The Medplum platform provides FHIR R4 compliant Patient, Encounter, and Coverage resources
- PostgreSQL database is configured with proper indexes on Patient.identifier and Encounter.identifier for performant searching
- The existing EMR UI Layout (4-row horizontal navigation) is already implemented in the EMR module
- The Registration module has already populated the Patient resource repository with patient demographic data
- Medplum SDK (@medplum/react-hooks) provides useMedplum hook for API access
- Mantine UI library is available for form components, tables, and modals

### Business Assumptions

- Users have already completed Georgian national ID (personal number) registration during patient intake
- Hospital staff are trained on navigating the EMR's 4-row horizontal navigation system
- Insurance company master list (58 options) is already configured in the Medplum system
- Permission/role management is configured to restrict deletion functionality to administrators
- Financial transactions are recorded separately but reference visit records for debt calculation
- The hospital uses both stationary (inpatient) and ambulatory (outpatient) visit workflows

### Data Assumptions

- Georgian personal IDs are always 11 digits and validated with Luhn checksum algorithm
- Registration numbers follow predictable formats: numeric (XXXXX-YYYY) or alphanumeric (a-XXXX-YYYY)
- Date values are stored in ISO 8601 format (YYYY-MM-DD HH:MM:SS) in the database
- A visit can have 0 to 3 insurance policies (no more than 3)
- All financial amounts are stored and displayed in Georgian Lari (GEL) currency
- Discount percentages range from 0 to 100
- Debt cannot be negative (no overpayment scenarios tracked in this view)

### User Assumptions

- Users are familiar with Georgian healthcare terminology and insurance system
- Users understand the difference between stationary and ambulatory visits
- Users know that green highlighting on debt cells indicates outstanding balance requiring follow-up
- Users have appropriate permissions assigned via role-based access control (RBAC)
- Users' language preference (ka/en/ru) is already set in the system

### Integration Assumptions

- The Registration module exposes patient demographic data via standard FHIR Patient resource queries
- The nomenclature/billing system provides procedure and service pricing data for the payment form (future integration)
- Insurance company data is maintained in a separate master list accessible via dropdown population
- Date filtering uses server-side queries to avoid loading excessive data on the client

## Dependencies *(optional)*

### Internal Dependencies

- **EMR UI Layout Module** (003-emr-ui-layout): The Patient History page must integrate with the existing 4-row horizontal navigation system including TopNavBar, MainMenu, HorizontalSubMenu, and LanguageSelector components

- **Registration Module** (004-fhir-registration-implementation): Patient demographic data (პ/ნ, სახელი, გვარი, birthdate, address, etc.) comes from the Patient resources created by the Registration module

- **Translation System** (emr/hooks/useTranslation): The page must use the existing multilingual translation hook to display all text in Georgian (ka), English (en), and Russian (ru) based on user preference stored in localStorage

- **Theme System** (emr/styles/theme.css): The page must follow the established EMR theme with turquoise gradients for sub-menu tabs, blue gradients for active states, and CSS custom properties for consistent styling

- **Authentication Module**: User permissions and roles must be validated to enable/disable deletion functionality and ensure proper access control for editing sensitive visit data

### External Dependencies

- **Medplum Core (@medplum/core)**: Provides MedplumClient for FHIR resource operations (search, create, update, delete) and FHIR data types

- **Medplum React Hooks (@medplum/react-hooks)**: Provides useMedplum hook for accessing the authenticated MedplumClient instance

- **Medplum FHIR Types (@medplum/fhirtypes)**: Provides TypeScript definitions for Patient, Encounter, Coverage, and related FHIR R4 resources

- **Mantine UI (@mantine/core)**: Provides Table, Select, TextInput, DatePicker, Modal, Button, Checkbox components for building the patient history interface

- **Mantine Hooks (@mantine/hooks)**: Provides useForm hook for managing visit edit form state with validation

- **React Router (react-router-dom)**: Provides routing for navigating between the patient history table view and individual visit detail views

- **PostgreSQL Database**: Stores all FHIR resources with proper indexes on identifier fields for performant searching and filtering

- **Redis**: Optional caching layer for frequently accessed data like insurance company dropdown options

### Data Dependencies

- **Insurance Company Master List**: A pre-populated list of 58 insurance companies/payers must exist in the system with ID, Georgian name, English name, and Russian name for dropdown population and filtering

- **Region and District Data**: Georgian regions (14 options) and districts (94 options with cascading filtering) must be available for the demographics section of the visit edit form

- **Visit Type Reference Data**: Predefined options for registration type (lak_regtype), status type (mo_stat - 4 options), stationary type (lak_ddyastac - 3 options), and referral type (lak_incmtp - 4 options)

- **Referrer Options**: A list of 30 referrer options (მომყვანი - mo_selsas) must be available for the registration section

- **Patient FHIR Resources**: Existing Patient resources with identifiers for personal ID (11-digit Georgian ID) and valid demographic data

### Known Constraints

- **Browser Compatibility**: Must support modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+) as the Medplum app is built with Vite and uses ES2020 features

- **Performance Limits**: Table display is optimized for up to 100 concurrent visits without pagination; larger datasets may require pagination implementation

- **Language Support**: Limited to Georgian (ka), English (en), and Russian (ru) - no support for other languages in this phase

- **Permission Model**: Deletion functionality restricted to administrator role only; no granular permission levels for editing specific fields

- **Financial Calculation**: Debt calculation (ვალი = ჯამი - გადახდ.) is client-side for display purposes; actual financial records must be validated server-side

- **Insurance Policy Limit**: Maximum 3 insurance policies per visit (დაზღვევა I, II, III tabs); additional policies not supported

- **Date Format**: System uses DD-MM-YYYY HH:MM format for display but stores ISO 8601 (YYYY-MM-DD HH:MM:SS) in database

## Out of Scope

The following items are explicitly excluded from this feature to maintain clear boundaries:

### Functionality Not Included

- **Payment Processing Form**: The full payment form (გადახდა) with procedures table, invoice generation, and payment history is a separate feature and will be specified independently

- **Invoice Generation**: Creating, printing, or managing invoices and receipts is not part of the Patient History table view

- **Patient Discharge Workflow**: The discharge form (patient-discharge-form.md) with discharge summary, medication lists, and final billing is a separate feature

- **Departmental Transfers**: The "გადაწერა" (Gadatsera) departmental transfer form for moving patients between hospital departments is not included

- **Laboratory Integration**: Ordering laboratory tests, viewing lab results, or tracking lab work completion is handled by the ლაბორატორია (Laboratory) sub-section

- **Prescription Management**: Writing prescriptions, viewing prescription history, or printing prescription forms is handled by the გაწერები (Prescriptions) sub-section

- **Appointment Scheduling**: Creating, editing, or managing patient appointments is handled by the დანიშნულება (Appointments) sub-section

- **Inpatient Ward Management**: Bed assignments, ward transfers, and hospitalization tracking are handled by the სტაციონარი (Hospital/Inpatient) sub-section

- **Form 100 Reporting**: Government-mandated Form 100 reports are handled by the 100 რეპორტი sub-section

### Data Operations Not Included

- **Bulk Visit Operations**: Batch editing, bulk deletion, or mass status updates for multiple visits simultaneously

- **Visit Merging**: Combining duplicate visit records or transferring data between visits

- **Historical Audit Trail**: Viewing complete edit history or rollback to previous versions of visit data (though audit logs may be stored, they are not displayed)

- **Data Export**: Exporting visit data to Excel, PDF, or other formats for external reporting

- **Advanced Analytics**: Statistical analysis, trend visualization, or predictive analytics based on visit data

### Integration Not Included

- **External Insurance API Integration**: Real-time verification of insurance coverage with external insurance company APIs

- **MOH (Ministry of Health) Reporting**: Automated submission of visit data to government health agencies

- **Financial System Integration**: Synchronization with external accounting or ERP systems for financial reconciliation

- **Billing Cycle Automation**: Automated invoicing schedules, payment reminders, or collections workflows

### User Interface Not Included

- **Customizable Table Columns**: Users cannot show/hide columns or reorder columns in the patient history table

- **Saved Filters/Views**: Users cannot save custom filter combinations or create personalized table views

- **Dashboard Widgets**: Summary statistics, charts, or widgets displaying aggregated visit data

- **Mobile-Optimized UI**: Responsive design for mobile devices (the original EMR is desktop-only; mobile support is future scope)

- **Print View**: Special formatting for printing the patient history table

### Performance Features Not Included

- **Pagination**: The table loads all matching visits without pagination (up to 100 records); pagination will be added only if performance degrades

- **Lazy Loading**: All data loads immediately rather than loading additional rows on scroll

- **Client-Side Caching**: Advanced caching strategies beyond standard HTTP caching

### Security Features Not Included

- **Field-Level Permissions**: Granular control over which users can edit specific fields in the visit edit form (current scope: all-or-nothing edit permission)

- **Data Masking**: Automatic masking of sensitive information (personal IDs, names) for users with limited permissions

- **Deletion Recovery**: "Soft delete" functionality to recover accidentally deleted visits (deletion is permanent in this scope)

## References *(optional)*

### Documentation References

- **Patient History Module Documentation**: `/Users/toko/Desktop/medplum_medimind/documentation/patient-history/README.md` - Overview of the entire Patient History module including all 13 sub-sections

- **History Section Documentation**: `/Users/toko/Desktop/medplum_medimind/documentation/patient-history/history/README.md` - Detailed documentation of the ისტორია (History) sub-section with ~75% completion status

- **Patient History Main Table**: `/Users/toko/Desktop/medplum_medimind/documentation/patient-history/history/tables/patient-history-main-table.md` - Complete 10-column table structure with color coding logic and sample data

- **History Filters Documentation**: `/Users/toko/Desktop/medplum_medimind/documentation/patient-history/history/search/history-filters.md` - Filter controls including 58 insurance/payer options, checkbox filter, and search fields

- **Visit Edit Window Documentation**: `/Users/toko/Desktop/medplum_medimind/documentation/patient-history/history/forms/visit-edit-window.md` - Complete field directory with 134 form elements (89 inputs, 25 selects, 3 textareas, 17 buttons)

- **Payment Form Documentation**: `/Users/toko/Desktop/medplum_medimind/documentation/patient-history/history/forms/payment-form.md` - Payment processing form structure (out of scope for this feature)

- **Menu Structure**: `/Users/toko/Desktop/medplum_medimind/documentation/patient-history/history/menu-structure.md` - Navigation hierarchy showing 13 sub-menu items under პაციენტის ისტორია

- **Insurance Companies List**: `/Users/toko/Desktop/medplum_medimind/documentation/patient-history/history/appendices/insurance-companies.md` - Complete list of 58 insurance/payer options with IDs

- **CLAUDE.md**: `/Users/toko/Desktop/medplum_medimind/CLAUDE.md` - Project overview, architecture patterns, and EMR UI Layout feature documentation

### FHIR Specification References

- **FHIR R4 Encounter Resource**: https://hl7.org/fhir/R4/encounter.html - Standard for representing patient visits and encounters

- **FHIR R4 Patient Resource**: https://hl7.org/fhir/R4/patient.html - Standard for representing patient demographic and administrative information

- **FHIR R4 Coverage Resource**: https://hl7.org/fhir/R4/coverage.html - Standard for representing insurance coverage and payer information

- **FHIR R4 Search**: https://hl7.org/fhir/R4/search.html - Search parameter syntax for filtering and querying FHIR resources

- **FHIR R4 Identifier**: https://hl7.org/fhir/R4/datatypes.html#Identifier - Standard for representing unique identifiers like Georgian personal IDs

### Technical References

- **Medplum Documentation**: https://www.medplum.com/docs - Official Medplum platform documentation

- **Medplum React Components**: https://www.medplum.com/docs/react-components - React component library documentation

- **Mantine UI Components**: https://mantine.dev/ - UI component library used in the project

- **Registration Module Implementation**: `/Users/toko/Desktop/medplum_medimind/packages/app/src/emr/views/registration/UnifiedRegistrationView.tsx` - Reference implementation for patient registration with similar table, search, and form patterns

- **EMR UI Layout Documentation**: `/Users/toko/Desktop/medplum_medimind/specs/003-emr-ui-layout/spec.md` - Specification for the 4-row horizontal navigation system

### Design References

- **Original EMR Screenshot**: `/var/folders/r7/xyk3ct490j5_ywmwl16sknlh0000gn/T/TemporaryItems/NSIRD_screencaptureui_sJcrfE/Screenshot 2025-11-14 at 11.06.32.png` - Screenshot of the Patient History page in the original SoftMedic EMR system

- **EMR Theme System**: `/Users/toko/Desktop/medplum_medimind/packages/app/src/emr/styles/theme.css` - Global EMR theme with turquoise gradients and CSS custom properties

- **Translation Pattern**: `/Users/toko/Desktop/medplum_medimind/packages/app/src/emr/hooks/useTranslation.ts` - Multilingual support hook implementation

### Project Context References

- **Monorepo Structure**: The Medplum monorepo structure with packages/app, packages/core, packages/server as documented in CLAUDE.md

- **Testing Patterns**: Jest testing with MockClient, MemoryRouter patterns as documented in CLAUDE.md and demonstrated in Registration module tests

- **Georgian ID Validation**: Luhn checksum algorithm implementation in `/Users/toko/Desktop/medplum_medimind/packages/app/src/emr/services/validators.ts` (from Registration module)

### Business Context References

- **Georgian Healthcare System**: Understanding of Georgian national ID system (11-digit personal numbers), insurance landscape, and healthcare delivery model

- **Hospital Workflows**: Knowledge of hospital visit types (stationary/ambulatory), departmental transfers, and billing cycles

- **SoftMedic EMR**: Original hospital EMR system at http://178.134.21.82:8008/clinic.php serving as the reference for UI/UX design and workflows
