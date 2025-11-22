# Feature Specification: FHIR-Compliant Medical Form Builder System

**Feature Branch**: `007-fhir-form-builder`
**Created**: 2025-11-21
**Status**: Draft
**Input**: User description: "i want to build the form creation system modern production ready, user centric robust and medical grade system in my app. following FHIR standards. system were i will later rebuild my orginal emr templates with ease. for that i want to conduct deep research to identify current best systems, practicies gudilines etc..., and build everything propelry"

## User Scenarios & Testing

### User Story 1 - Create Medical Form Template (Priority: P1)

As a healthcare administrator, I need to create structured medical form templates (consent forms, patient intake forms, clinical assessments) that automatically populate with patient data, so that clinical staff can efficiently document patient care while ensuring regulatory compliance.

**Why this priority**: This is the foundational capability of the system. Without the ability to create form templates, no other functionality is possible. Forms are the core data capture mechanism in healthcare.

**Independent Test**: Can be fully tested by creating a consent form template with 10 fields (patient name, DOB, signature field, etc.) and verifying it saves correctly. Delivers immediate value by allowing administrators to digitize paper forms.

**Acceptance Scenarios**:

1. **Given** I am logged in as an administrator, **When** I navigate to the form builder and create a new form titled "IV-100/ა Health Status Certificate", **Then** the system creates an empty form template ready for field configuration
2. **Given** I have an empty form template, **When** I add 15 fields of various types (text input, date picker, dropdown, checkbox, textarea, signature), **Then** all fields are saved with correct configuration (label, type, validation rules)
3. **Given** I have configured a form with patient data bindings (name, DOB, personal ID), **When** I preview the form with sample patient data, **Then** bound fields auto-populate with patient demographics
4. **Given** I have a completed form template, **When** I save and activate it, **Then** the form appears in the available forms list for clinical staff

---

### User Story 2 - Visual Form Field Configuration (Priority: P1)

As a healthcare administrator, I need to visually configure form fields with styling, layout, and validation rules using a drag-and-drop interface, so that I can create professional medical forms without writing code.

**Why this priority**: Critical for user adoption. Non-technical administrators must be able to build forms independently. This capability determines whether the system is user-centric and accessible.

**Independent Test**: Can be tested by dragging 5 different field types into a form, configuring their styling (font size, color, alignment), setting validation rules (required, format), and verifying the preview matches the configuration.

**Acceptance Scenarios**:

1. **Given** I am editing a form template, **When** I drag a "Text Input" field from the field palette onto the canvas, **Then** the field appears in the form with default configuration (label: "Untitled", type: text, required: false)
2. **Given** I have added a field to the form, **When** I configure its styling (font-size: 14px, color: #1a365d, alignment: left, width: 100%), **Then** the preview updates in real-time to match my configuration
3. **Given** I am configuring a field, **When** I set validation rules (required: true, format: email), **Then** the system validates user input against these rules when the form is filled
4. **Given** I have multiple fields in the form, **When** I reorder them using drag-and-drop, **Then** the field order updates and persists when saved

---

### User Story 3 - Patient Data Auto-Population (Priority: P1)

As a clinical staff member, I need forms to automatically populate with patient demographics and encounter data when I open them for a specific patient, so that I can focus on documenting clinical information rather than re-entering known data.

**Why this priority**: Essential for clinical efficiency and data accuracy. Reduces documentation time by 40-60% and eliminates transcription errors for demographic data. Critical for medical-grade systems.

**Independent Test**: Can be tested by opening a form for a patient with complete demographics (name: თენგიზი ხოზვრია, DOB: 1986-01-26, Personal ID: 26001014632) and verifying all bound fields auto-populate correctly within 1 second.

**Acceptance Scenarios**:

1. **Given** I open a consent form for patient თენგიზი ხოზვრია, **When** the form loads, **Then** patient name, DOB, personal ID, phone, address fields auto-populate from patient record
2. **Given** I open a form during an active encounter, **When** the form loads, **Then** encounter data (admission date, treating physician, registration number) auto-populates from encounter resource
3. **Given** a patient's age is calculated field, **When** I open the form, **Then** the system calculates age from birthdate (e.g., 39 years) and displays it in the age field
4. **Given** I open a form for a patient with missing demographics (no address), **When** the form loads, **Then** the address field remains empty and allows manual entry

---

### User Story 4 - Form Completion and Digital Signature (Priority: P2)

As a clinical staff member, I need to fill out medical forms for patients and capture digital signatures for consent forms, so that I can complete legally binding documentation electronically.

**Why this priority**: Secondary to form creation but essential for clinical workflow. Forms without completion capability provide no clinical value. Digital signatures enable paperless consent management.

**Independent Test**: Can be tested by filling out a consent form with 10 fields, capturing a digital signature using touch/mouse, and verifying the completed form saves as a QuestionnaireResponse with signature attachment.

**Acceptance Scenarios**:

1. **Given** I have opened a form for a patient, **When** I fill in all required fields (clinical notes, observations, selections), **Then** the system validates inputs and enables the save button
2. **Given** I am completing a consent form, **When** I click the signature field, **Then** a signature capture modal opens allowing me to draw/type a signature
3. **Given** I have filled all required fields and captured a signature, **When** I click "Save", **Then** the completed form saves as a FHIR QuestionnaireResponse linked to the patient and encounter
4. **Given** I attempt to save a form with missing required fields, **When** I click "Save", **Then** the system highlights incomplete fields and displays validation errors

---

### User Story 5 - Form Search and Retrieval (Priority: P2)

As a clinical staff member, I need to search for and retrieve previously completed forms by patient, date, form type, or content, so that I can review historical documentation and inform current care decisions.

**Why this priority**: Important for continuity of care and clinical decision support. However, creating and completing forms must work first before search becomes valuable.

**Independent Test**: Can be tested by searching for all "Consent Forms" completed for patient "თენგიზი ხოზვრია" in November 2025, verifying results return within 2 seconds, and opening a form to view completed data.

**Acceptance Scenarios**:

1. **Given** I navigate to the form search page, **When** I search by patient name "თენგიზი ხოზვრია", **Then** all completed forms for this patient display in a table (form type, date, completed by, status)
2. **Given** I have search results, **When** I filter by form type "Consent Forms" and date range "Nov 1-30, 2025", **Then** only consent forms from November display
3. **Given** I have located a completed form, **When** I click to open it, **Then** the form opens in read-only mode showing all completed fields and signatures
4. **Given** I need to find a specific clinical note, **When** I search form content for keyword "hypertension", **Then** all forms containing this term display with highlighted matches

---

### User Story 6 - Form Template Management (Priority: P2)

As a healthcare administrator, I need to manage form templates (edit, version, archive, clone), so that I can maintain an up-to-date form library and adapt to changing clinical or regulatory requirements.

**Why this priority**: Essential for long-term system maintainability. Forms evolve with regulatory changes, clinical practice updates, and organizational needs. Version control prevents data loss.

**Independent Test**: Can be tested by cloning an existing form template, editing 5 fields, saving as version 2, and verifying both versions exist independently without affecting completed forms using version 1.

**Acceptance Scenarios**:

1. **Given** I have an existing form template, **When** I click "Edit", **Then** the form opens in the builder with all current fields and configuration intact
2. **Given** I need to update a form, **When** I save changes, **Then** the system creates a new version (e.g., v1 → v2) while preserving the original version
3. **Given** I want to create a similar form, **When** I click "Clone" on an existing template, **Then** the system creates a duplicate with "-Copy" suffix ready for editing
4. **Given** a form is no longer used, **When** I click "Archive", **Then** the form is hidden from active form lists but remains accessible for viewing completed instances

---

### User Story 7 - Form PDF Export and Printing (Priority: P3)

As a clinical staff member, I need to export completed forms as PDF documents, so that I can share them with external providers, provide printed copies to patients, or archive them in paper-based systems.

**Why this priority**: Important for interoperability and patient communication but not critical for core functionality. Forms must be created and completed before PDF export adds value.

**Independent Test**: Can be tested by opening a completed consent form, clicking "Export PDF", and verifying a PDF file downloads within 5 seconds that matches the form layout with all data and signatures rendered correctly.

**Acceptance Scenarios**:

1. **Given** I have a completed form open, **When** I click "Export PDF", **Then** a PDF file downloads with form header, all fields, patient data, and signatures rendered in print-ready format
2. **Given** I need to print a form, **When** I click "Print", **Then** the browser print dialog opens with the form pre-formatted for A4/Letter paper
3. **Given** a form has Georgian text and special characters, **When** I export to PDF, **Then** all Georgian characters render correctly using appropriate fonts
4. **Given** I export a form with a digital signature, **When** I open the PDF, **Then** the signature appears as an image with timestamp and signer name

---

### User Story 8 - Form Field Conditional Logic (Priority: P3)

As a healthcare administrator, I need to configure conditional field visibility (show/hide fields based on other field values), so that forms adapt to different clinical scenarios and reduce cognitive load for staff.

**Why this priority**: Advanced feature that enhances user experience but is not essential for MVP. Forms function without conditional logic, though they may be longer and less intuitive.

**Independent Test**: Can be tested by creating a form with a checkbox "Patient is a minor" that shows/hides a "Legal Guardian" section, filling out the form with the checkbox selected, and verifying the guardian fields appear and are required.

**Acceptance Scenarios**:

1. **Given** I am configuring a field, **When** I set a condition "Show if [Gender] equals [Female]", **Then** the field only displays when the gender field value is female
2. **Given** I have conditional fields configured, **When** I fill out the form and change a controlling field value, **Then** dependent fields show/hide dynamically without page refresh
3. **Given** a conditional field is hidden, **When** I save the form, **Then** the hidden field's value is cleared and not saved to the QuestionnaireResponse
4. **Given** I preview a form with conditions, **When** I test different scenarios, **Then** the form behaves correctly for all condition combinations

---

### User Story 9 - Form Analytics and Reporting (Priority: P3)

As a healthcare administrator, I need to view analytics on form usage (completion rates, average time, incomplete forms), so that I can identify workflow bottlenecks and optimize form design.

**Why this priority**: Valuable for continuous improvement but not required for core functionality. Forms must be used extensively before analytics provide actionable insights.

**Independent Test**: Can be tested by viewing a dashboard showing "Consent Forms: 150 completed, 12 incomplete, avg time 4.2 minutes, 94% completion rate" and verifying data matches actual form submission records.

**Acceptance Scenarios**:

1. **Given** I navigate to the forms analytics page, **When** I select "Last 30 days", **Then** I see aggregate metrics: total forms completed, completion rate, average time per form type
2. **Given** I view form-specific analytics, **When** I select "Consent Form IV-100/ა", **Then** I see detailed metrics: 150 completions, 12 incomplete, 4.2 min average, completion rate by user
3. **Given** I identify a form with low completion rate (60%), **When** I drill down, **Then** I see which fields are most often skipped or have validation errors
4. **Given** I want to export analytics, **When** I click "Export Report", **Then** a CSV file downloads with detailed form usage data for external analysis

---

### Edge Cases

- **What happens when a form template is edited after forms have been completed using it?**
  The system must version form templates. Completed forms remain linked to their original template version, ensuring historical data integrity. New submissions use the latest version.

- **How does the system handle forms opened for a patient with incomplete demographics?**
  The system auto-populates available fields and leaves missing fields empty. Staff can manually complete missing data. The system may display a warning: "Patient demographics incomplete - 3 fields require manual entry."

- **What happens when a form is in progress but the user navigates away?**
  The system auto-saves draft progress every 30 seconds. When the user returns, a prompt asks: "Resume draft saved at [timestamp]?" Users can resume or start fresh.

- **How does the system handle forms with 100+ fields?**
  The system implements virtual scrolling and lazy loading for large forms. Fields render progressively as the user scrolls, maintaining smooth performance.

- **What happens when a patient's demographic data changes after a form is completed?**
  Completed forms are immutable snapshots. Updated demographics only affect new forms. An audit trail tracks when demographic changes occurred relative to form completion.

- **How does the system handle signature capture on devices without touch input?**
  Signature fields offer three capture methods: (1) touch/stylus drawing, (2) mouse drawing, (3) typed signature. The user selects their preferred method.

- **What happens when a form has required fields but the patient refuses to provide information?**
  Staff can mark fields as "Patient declined" using a checkbox. This satisfies the required validation while documenting the refusal for compliance.

- **How does the system handle simultaneous edits to the same form template?**
  The system implements optimistic locking. If two administrators edit simultaneously, the second save attempt triggers a conflict warning: "Template modified by [user] at [time]. Review changes before overwriting."

- **What happens when a digital signature fails to capture or save?**
  The system displays an error: "Signature capture failed. Please try again." If the issue persists, staff can temporarily save the form without signature and add it later. An alert flags forms with missing required signatures.

- **How does the system handle forms in multiple languages (Georgian, English, Russian)?**
  Form templates support multilingual labels. Administrators configure translations for each field. Users select their language preference, and the form renders in that language while maintaining the same structure.

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a visual form builder interface for creating structured medical form templates without writing code
- **FR-002**: System MUST support 15 field types (text, input, textarea, select, checkbox, radio, date picker, time picker, signature, file upload, decorative text, section header, table, divider, spacer)
- **FR-003**: System MUST allow administrators to configure field properties (label, type, required status, validation rules, default values, help text, placeholder)
- **FR-004**: System MUST enable drag-and-drop field reordering within form templates
- **FR-005**: System MUST support field styling configuration (font family, font size, text color, background color, alignment, width, height)
- **FR-006**: System MUST provide patient data binding options for 14 demographic and encounter fields (name, DOB, personal ID, gender, phone, address, age, admission date, discharge date, treating physician, registration number, workplace, patronymic, combined fields)
- **FR-007**: System MUST auto-populate bound fields when a form is opened for a specific patient and encounter
- **FR-008**: System MUST calculate derived fields (age from DOB, full name with patronymic) in real-time
- **FR-009**: System MUST validate form inputs based on field type and configured rules (required, format, range, length)
- **FR-010**: System MUST support digital signature capture using touch, mouse, or typed input
- **FR-011**: System MUST save completed forms as FHIR QuestionnaireResponse resources linked to Patient and Encounter
- **FR-012**: System MUST version form templates, preserving historical versions for completed forms
- **FR-013**: System MUST allow administrators to edit form templates, creating new versions while preserving originals
- **FR-014**: System MUST support form template cloning for creating similar forms efficiently
- **FR-015**: System MUST enable form template archiving without deleting completed form instances
- **FR-016**: System MUST provide form search by patient, date range, form type, completion status, and content keywords
- **FR-017**: System MUST display completed forms in read-only mode preserving all original data and formatting
- **FR-018**: System MUST export completed forms as PDF documents with all fields, signatures, and formatting
- **FR-019**: System MUST render Georgian, English, and Russian text correctly in forms and PDFs
- **FR-020**: System MUST auto-save form drafts every 30 seconds when filling out forms
- **FR-021**: System MUST prompt users to resume incomplete drafts when reopening a form
- **FR-022**: System MUST support conditional field visibility based on other field values (show/hide logic)
- **FR-023**: System MUST track form completion time and provide usage analytics
- **FR-024**: System MUST display form analytics (completion rate, average time, incomplete forms) for administrators
- **FR-025**: System MUST implement FHIR Questionnaire resources for form templates
- **FR-026**: System MUST implement FHIR QuestionnaireResponse resources for completed forms
- **FR-027**: System MUST support form categories (Ambulatory, Stationary, Day Stationary, All)
- **FR-028**: System MUST allow staff to mark required fields as "Patient declined" for compliance
- **FR-029**: System MUST implement optimistic locking to prevent simultaneous template edit conflicts
- **FR-030**: System MUST validate Georgian personal ID format (11 digits with Luhn checksum) in forms

### Key Entities

- **Form Template (FHIR Questionnaire)**: Represents a medical form template configured by administrators. Contains form metadata (code, title, category, status, version), field definitions (linkId, text, type, required, validation), patient data bindings, conditional logic, and styling configuration.

- **Form Field (QuestionnaireItem)**: Individual field within a form template. Properties include field type (string, text, date, choice, boolean, attachment, etc.), label text, required status, validation rules, default value, styling (font, color, alignment), and patient data binding key.

- **Completed Form (FHIR QuestionnaireResponse)**: Instance of a filled form for a specific patient and encounter. Contains reference to template (Questionnaire), patient reference, encounter reference, authored timestamp, completion status, item answers with linkId mapping, and signature attachments.

- **Form Field Answer (QuestionnaireResponse.item)**: Individual answer within a completed form. Contains linkId (matches template field), answer value (string, integer, date, boolean, attachment, etc.), answer timestamp, and answering user reference.

- **Form Version**: Snapshot of a form template at a point in time. Tracks version number, creation date, created by user, changes from previous version, and status (active, draft, retired).

- **Digital Signature (Attachment)**: Captured signature for consent forms. Contains signature image data (base64 encoded), content type (image/png, image/svg+xml), creation timestamp, signer reference (patient or practitioner), and signature method (touch, mouse, typed).

- **Form Draft**: Temporary storage of incomplete form progress. Contains form template reference, patient reference, encounter reference, partial answers, last saved timestamp, and expiration date (auto-delete after 30 days).

- **Form Analytics Record**: Aggregated usage data for form templates. Tracks total completions, completion rate, average completion time, incomplete forms count, most skipped fields, and completion time distribution.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Healthcare administrators can create a 20-field medical form template from scratch in under 15 minutes without technical assistance
- **SC-002**: Forms with patient data bindings auto-populate within 1 second of opening, reducing manual data entry time by 60%
- **SC-003**: Clinical staff complete standard consent forms (10-15 fields) in under 5 minutes, compared to 8-10 minutes with paper forms
- **SC-004**: Form completion rate exceeds 95% (less than 5% of started forms remain incomplete after 24 hours)
- **SC-005**: System successfully renders all 49 existing EMR form templates with 100% visual fidelity to originals
- **SC-006**: PDF exports generate within 5 seconds for forms up to 50 fields with Georgian text rendering correctly
- **SC-007**: Form search returns results within 2 seconds for queries across 10,000+ completed forms
- **SC-008**: System supports 100 concurrent users filling forms simultaneously without performance degradation
- **SC-009**: Digital signature capture success rate exceeds 98% across touch and mouse input methods
- **SC-010**: Form template versioning allows administrators to safely update forms with zero data loss for historical records
- **SC-011**: Conditional field logic reduces average form length by 30% through hiding irrelevant fields
- **SC-012**: Clinical staff report 40% reduction in documentation time compared to paper-based workflow
- **SC-013**: System achieves 99.9% uptime for form creation and completion operations
- **SC-014**: Form data auto-save prevents data loss in 100% of unexpected session terminations
- **SC-015**: System complies with FHIR R4 specification for Questionnaire and QuestionnaireResponse resources, passing HL7 FHIR validation

## Assumptions

- Form templates are created by trained healthcare administrators, not by clinical staff during patient care
- Patient demographics (name, DOB, personal ID) are already stored in the system as FHIR Patient resources before forms are opened
- Active encounters exist in the system before encounter-specific forms (admission forms) are filled
- Network connectivity is available during form completion (for auto-save and real-time validation)
- Users have appropriate permissions (administrators for template creation, clinical staff for form completion)
- Forms follow standard A4/Letter paper layout for PDF export compatibility
- Digital signatures meet organizational legal requirements (implementation does not guarantee compliance with specific regulations)
- Form templates are designed for desktop/tablet use primarily (mobile support is secondary)
- Georgian language support requires system-wide UTF-8 encoding
- Form completion typically occurs within a single session (not paused for days)
- Completed forms are immutable once saved (edits create new versions, not modifications)
- Form analytics aggregate data daily (not real-time updates)
- Maximum form size is 100 fields to maintain performance (larger forms should be split)
- Signature capture uses HTML5 canvas for drawing (requires modern browser)
- PDF export uses server-side rendering (not client-side)

## Dependencies

- **FHIR Server**: Medplum backend must support Questionnaire and QuestionnaireResponse CRUD operations
- **Patient Data**: Patient and Encounter resources must exist before forms can auto-populate
- **Authentication**: User authentication and role-based access control must be implemented (administrators vs. clinical staff)
- **File Storage**: System requires file storage service for PDF exports and signature attachments
- **PDF Rendering Library**: Server-side library (e.g., Puppeteer, wkhtmltopdf) for HTML to PDF conversion
- **Georgian Font Support**: System fonts must include Georgian Unicode range (U+10A0-U+10FF) for proper text rendering
- **React Component Library**: Mantine UI components for form builder interface
- **Form Validation Library**: Client-side validation framework compatible with FHIR data types
- **Digital Signature Library**: Canvas-based signature capture component (e.g., react-signature-canvas)
- **Date/Time Picker**: Accessible date and time input components supporting Georgian locale
- **Drag-and-Drop Library**: React DnD or similar for form builder field arrangement
- **Translation System**: Existing i18n implementation for multilingual form labels (Georgian, English, Russian)
- **Audit Logging**: System-wide audit trail for tracking form template changes and completions
- **Browser Compatibility**: Modern browsers with ES6+ support (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

## Constraints

- Must comply with FHIR R4 specification for Questionnaire and QuestionnaireResponse resources
- Must support Georgian, English, and Russian languages throughout the system
- Must maintain backward compatibility with existing Patient and Encounter data structures
- Must preserve completed form data indefinitely (no automatic deletion)
- Must not allow editing of completed forms (only viewing or creating new versions)
- Form templates cannot exceed 100 fields due to performance limitations
- Digital signatures must be stored as FHIR Attachment resources
- PDF export must render within 10 seconds for forms up to 100 fields
- Auto-save interval is fixed at 30 seconds (not user-configurable)
- Form drafts auto-expire after 30 days to prevent database bloat
- Maximum signature image size is 1MB per signature
- Form search is limited to 1000 results per query (pagination required for more)
- Conditional logic depth is limited to 3 levels (field → condition → dependent field → condition → sub-dependent field)
- Form version history is limited to 50 versions per template
- Analytics data aggregates daily (not real-time)
