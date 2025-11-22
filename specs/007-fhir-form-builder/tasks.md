# Tasks: FHIR-Compliant Medical Form Builder System

**Input**: Design documents from `/specs/007-fhir-form-builder/`
**Branch**: `007-fhir-form-builder`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Install form builder dependencies (lhc-forms, dnd-kit, react-hook-form, zod, react-signature-canvas, @react-pdf/renderer, immer, @tanstack/react-virtual)
- [ ] T002 Create base directory structure in packages/app/src/emr/ (components/form-builder, components/form-renderer, components/form-management, services, hooks, types, views)
- [x] T003 [P] Configure Noto Sans Georgian fonts for PDF rendering (add to public/fonts/)
- [x] T004 [P] Set up form routes in packages/app/src/App.tsx (/emr/forms/builder, /emr/forms/fill/:id, /emr/forms/view/:id, /emr/forms/search, /emr/forms)
- [x] T005 [P] Create translation files in packages/app/src/emr/translations/forms/ (field-types.json, patient-bindings.json, validation-messages.json, form-ui.json)
- [x] T006 Create FormsSection.tsx route wrapper in packages/app/src/emr/sections/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create FHIR resource type interfaces in packages/app/src/emr/types/form-builder.ts (FormTemplate, FieldConfig, PatientBinding, ConditionalLogic)
- [x] T008 Create FHIR resource type interfaces in packages/app/src/emr/types/form-renderer.ts (FormResponse, FieldAnswer, SignatureData, DraftData)
- [x] T009 [P] Create patient data binding type interfaces in packages/app/src/emr/types/patient-binding.ts (BindingKey, BindingConfig, CalculatedField)
- [x] T010 [P] Create validation type interfaces in packages/app/src/emr/types/form-validation.ts (ValidationRule, ValidationError, SchemaConfig)
- [x] T011 Implement FHIR Questionnaire helper utilities in packages/app/src/emr/services/fhirHelpers.ts (toQuestionnaire, fromQuestionnaire, extractExtensions)
- [x] T012 Implement Zod schema generator in packages/app/src/emr/services/formValidationService.ts (generateSchema, validateGeorgianPersonalId, validateEmail, validateDateRange)
- [x] T013 [P] Create unit tests for FHIR helpers in packages/app/src/emr/services/fhirHelpers.test.ts (15+ test cases)
- [x] T014 [P] Create unit tests for validation service in packages/app/src/emr/services/formValidationService.test.ts (20+ validator tests)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create Medical Form Template (Priority: P1) 🎯 MVP

**Goal**: Enable healthcare administrators to create structured medical form templates with drag-and-drop interface and patient data bindings

**Independent Test**: Administrator can create a consent form template with 10 fields (text, date, signature), save as FHIR Questionnaire, and verify it appears in form template list

### Implementation for User Story 1

- [x] T015 [P] [US1] Create FormBuilderLayout component in packages/app/src/emr/components/form-builder/FormBuilderLayout.tsx (three-panel layout: Palette | Canvas | Properties) ✅
- [x] T016 [P] [US1] Create FormBuilderLayout tests in packages/app/src/emr/components/form-builder/FormBuilderLayout.test.tsx ✅
- [x] T017 [P] [US1] Create FieldPalette component in packages/app/src/emr/components/form-builder/FieldPalette.tsx (15 draggable field types: text, textarea, date, checkbox, select, signature, etc.) ✅
- [x] T018 [P] [US1] Create FieldPalette tests in packages/app/src/emr/components/form-builder/FieldPalette.test.tsx ✅
- [x] T019 [P] [US1] Create FormCanvas component in packages/app/src/emr/components/form-builder/FormCanvas.tsx (drop zone with dnd-kit) ✅
- [x] T020 [P] [US1] Create FormCanvas tests in packages/app/src/emr/components/form-builder/FormCanvas.test.tsx ✅
- [x] T021 [P] [US1] Create PropertiesPanel component in packages/app/src/emr/components/form-builder/PropertiesPanel.tsx (field configuration panel) ✅
- [x] T022 [P] [US1] Create PropertiesPanel tests in packages/app/src/emr/components/form-builder/PropertiesPanel.test.tsx ✅
- [x] T023 [US1] Create FieldConfigEditor component in packages/app/src/emr/components/form-builder/FieldConfigEditor.tsx (edit label, required, validation, styling)
- [x] T024 [US1] Create FieldConfigEditor tests in packages/app/src/emr/components/form-builder/FieldConfigEditor.test.tsx
- [x] T025 [US1] Create PatientBindingSelector component in packages/app/src/emr/components/form-builder/PatientBindingSelector.tsx (14 binding options dropdown)
- [x] T026 [US1] Create PatientBindingSelector tests in packages/app/src/emr/components/form-builder/PatientBindingSelector.test.tsx
- [x] T027 [US1] Implement formBuilderService in packages/app/src/emr/services/formBuilderService.ts (createQuestionnaire, updateQuestionnaire, getQuestionnaire, listQuestionnaires)
- [x] T028 [US1] Create formBuilderService tests in packages/app/src/emr/services/formBuilderService.test.ts
- [x] T029 [US1] Create useFormBuilder hook in packages/app/src/emr/hooks/useFormBuilder.ts (form state management with Immer, undo/redo)
- [x] T030 [US1] Create useFormBuilder tests in packages/app/src/emr/hooks/useFormBuilder.test.tsx
- [x] T031 [US1] Create FormBuilderView in packages/app/src/emr/views/form-builder/FormBuilderView.tsx (main form builder page at /emr/forms/builder)
- [x] T032 [US1] Create FormBuilderView tests in packages/app/src/emr/views/form-builder/FormBuilderView.test.tsx
- [x] T033 [US1] Add form builder navigation to main EMR menu in packages/app/src/emr/translations/menu-structure.ts

**Checkpoint**: At this point, User Story 1 should be fully functional - administrators can create form templates and save them as FHIR Questionnaire resources

---

## Phase 4: User Story 2 - Visual Form Field Configuration (Priority: P1)

**Goal**: Enable visual configuration of form fields (styling, layout, validation) using drag-and-drop interface

**Independent Test**: Drag 5 different field types into form, configure styling (font size, color, alignment), set validation rules (required, format), verify preview matches configuration

### Implementation for User Story 2

- [ ] T034 [P] [US2] Integrate dnd-kit library in FormCanvas.tsx (DndContext, useDraggable, useDroppable, DragOverlay)
- [ ] T035 [P] [US2] Implement field reordering with drag handles in FormCanvas.tsx
- [ ] T036 [P] [US2] Create FormPreview component in packages/app/src/emr/components/form-builder/FormPreview.tsx (real-time preview with LHC-Forms)
- [ ] T037 [P] [US2] Create FormPreview tests in packages/app/src/emr/components/form-builder/FormPreview.test.tsx
- [ ] T038 [US2] Implement field styling configuration in FieldConfigEditor.tsx (font-size, color, alignment, width, height)
- [ ] T039 [US2] Implement validation rules configuration in FieldConfigEditor.tsx (required, format, range, length, pattern)
- [ ] T040 [US2] Add real-time preview updates in FormBuilderView.tsx (watch form changes → update preview)
- [ ] T041 [US2] Create E2E tests for drag-and-drop in tests/e2e/form-builder/drag-drop.spec.ts (Playwright)
- [ ] T042 [US2] Create E2E tests for field configuration in tests/e2e/form-builder/field-configuration.spec.ts
- [ ] T043 [US2] Add touch support testing for dnd-kit on tablet devices (iPad, Android)

**Checkpoint**: At this point, User Stories 1 AND 2 work together - administrators can create forms with visual configuration and see real-time preview

---

## Phase 5: User Story 3 - Patient Data Auto-Population (Priority: P1)

**Goal**: Forms automatically populate with patient demographics and encounter data when opened for specific patient

**Independent Test**: Open form for patient "თენგიზი ხოზვრია" (DOB: 1986-01-26, Personal ID: 26001014632), verify all bound fields auto-populate within 1 second

### Implementation for User Story 3

- [ ] T044 [P] [US3] Implement patientDataBindingService in packages/app/src/emr/services/patientDataBindingService.ts (extractPatientData, extractEncounterData, calculateAge, formatFullName)
- [ ] T045 [P] [US3] Create patientDataBindingService tests in packages/app/src/emr/services/patientDataBindingService.test.ts (14 binding tests for each data field)
- [ ] T046 [US3] Implement FHIRPath expression evaluator in patientDataBindingService.ts (support for Patient.name.given, Patient.birthDate, Encounter.period.start)
- [ ] T047 [US3] Add calculated field support in patientDataBindingService.ts (age from DOB, full name with patronymic)
- [ ] T048 [US3] Implement FormRenderer component in packages/app/src/emr/components/form-renderer/FormRenderer.tsx (LHC-Forms wrapper with patient data population)
- [ ] T049 [US3] Create FormRenderer tests in packages/app/src/emr/components/form-renderer/FormRenderer.test.tsx
- [ ] T050 [US3] Implement formRendererService in packages/app/src/emr/services/formRendererService.ts (populateForm, saveResponse, createQuestionnaireResponse)
- [ ] T051 [US3] Create formRendererService tests in packages/app/src/emr/services/formRendererService.test.ts
- [ ] T052 [US3] Create FormFillerView in packages/app/src/emr/views/form-filler/FormFillerView.tsx (main form filling page at /emr/forms/fill/:id)
- [ ] T053 [US3] Create FormFillerView tests in packages/app/src/emr/views/form-filler/FormFillerView.test.tsx
- [ ] T054 [US3] Handle missing patient data gracefully in FormRenderer.tsx (empty fields, no errors)
- [ ] T055 [US3] Create E2E tests for auto-population in tests/e2e/form-renderer/auto-population.spec.ts

**Checkpoint**: All P1 user stories complete - forms can be created, configured, and auto-populate with patient data

---

## Phase 6: User Story 4 - Form Completion and Digital Signature (Priority: P2)

**Goal**: Enable clinical staff to fill out forms and capture digital signatures for consent

**Independent Test**: Fill out consent form with 10 fields, capture digital signature using touch/mouse, verify completed form saves as QuestionnaireResponse with signature attachment

### Implementation for User Story 4

- [ ] T056 [P] [US4] Create FormField component in packages/app/src/emr/components/form-renderer/FormField.tsx (15 field type implementations: text, textarea, date, checkbox, select, signature, etc.)
- [ ] T057 [P] [US4] Create FormField tests in packages/app/src/emr/components/form-renderer/FormField.test.tsx
- [ ] T058 [P] [US4] Integrate react-signature-canvas in SignatureField component at packages/app/src/emr/components/form-renderer/SignatureField.tsx (capture modal with touch/mouse/typed options)
- [ ] T059 [P] [US4] Create SignatureField tests in packages/app/src/emr/components/form-renderer/SignatureField.test.tsx
- [ ] T060 [US4] Implement signatureService in packages/app/src/emr/services/signatureService.ts (captureSignature, saveSignature, hashSignature, verifySignature)
- [ ] T061 [US4] Create signatureService tests in packages/app/src/emr/services/signatureService.test.ts
- [ ] T062 [US4] Implement signature storage as FHIR Binary in signatureService.ts (PNG base64 → Binary resource)
- [ ] T063 [US4] Implement signature audit trail in signatureService.ts (create AuditEvent for capture, view, verify, revoke)
- [ ] T064 [US4] Add signature verification with SHA-256 hashing in signatureService.ts
- [ ] T065 [US4] Integrate React Hook Form with Zod validation in FormRenderer.tsx (useForm with zodResolver, mode: onTouched)
- [ ] T066 [US4] Add form submission handler in FormRenderer.tsx (create QuestionnaireResponse, link to Patient/Encounter, save signature)
- [ ] T067 [US4] Create useSignatureCapture hook in packages/app/src/emr/hooks/useSignatureCapture.ts (signature modal management)
- [ ] T068 [US4] Create useSignatureCapture tests in packages/app/src/emr/hooks/useSignatureCapture.test.tsx
- [ ] T069 [US4] Create E2E tests for signature capture in tests/e2e/form-renderer/signature-capture.spec.ts (desktop + mobile)
- [ ] T070 [US4] Add E-SIGN Act compliance validation in tests/e2e/form-renderer/signature-capture.spec.ts (intent checkbox, timestamp, user auth)

**Checkpoint**: Forms can now be completed with digital signatures and saved as FHIR QuestionnaireResponse resources

---

## Phase 7: User Story 5 - Form Search and Retrieval (Priority: P2)

**Goal**: Enable search for completed forms by patient, date, form type, content

**Independent Test**: Search for all "Consent Forms" completed for patient "თენგიზი ხოზვრია" in November 2025, verify results return within 2 seconds, open form in read-only mode

### Implementation for User Story 5

- [ ] T071 [P] [US5] Create FormSearchView in packages/app/src/emr/views/form-management/FormSearchView.tsx (main search page at /emr/forms/search)
- [ ] T072 [P] [US5] Create FormSearchView tests in packages/app/src/emr/views/form-management/FormSearchView.test.tsx
- [ ] T073 [P] [US5] Create FormSearchFilters component in packages/app/src/emr/components/form-search/FormSearchFilters.tsx (patient, date range, form type, status filters)
- [ ] T074 [P] [US5] Create FormSearchFilters tests in packages/app/src/emr/components/form-search/FormSearchFilters.test.tsx
- [ ] T075 [P] [US5] Create FormResultsTable component in packages/app/src/emr/components/form-search/FormResultsTable.tsx (paginated results, 1000 max)
- [ ] T076 [P] [US5] Create FormResultsTable tests in packages/app/src/emr/components/form-search/FormResultsTable.test.tsx
- [ ] T077 [US5] Implement FHIR search queries in formRendererService.ts (searchQuestionnaireResponses with filters)
- [ ] T078 [US5] Add full-text search for form content in formRendererService.ts (PostgreSQL tsvector)
- [ ] T079 [US5] Create FormViewerView in packages/app/src/emr/views/form-filler/FormViewerView.tsx (read-only mode at /emr/forms/view/:id)
- [ ] T080 [US5] Create FormViewerView tests in packages/app/src/emr/views/form-filler/FormViewerView.test.tsx
- [ ] T081 [US5] Add pagination support in FormResultsTable.tsx (100 results per page)
- [ ] T082 [US5] Create performance tests for search in tests/e2e/form-management/search-forms.spec.ts (10,000+ forms)

**Checkpoint**: Forms can be searched, retrieved, and viewed in read-only mode

---

## Phase 8: User Story 6 - Form Template Management (Priority: P2)

**Goal**: Manage form templates (edit, version, archive, clone)

**Independent Test**: Clone existing form template, edit 5 fields, save as version 2, verify both versions exist independently without affecting completed forms using version 1

### Implementation for User Story 6

- [ ] T083 [P] [US6] Create FormManagementView in packages/app/src/emr/views/form-management/FormManagementView.tsx (template list at /emr/forms)
- [ ] T084 [P] [US6] Create FormManagementView tests in packages/app/src/emr/views/form-management/FormManagementView.test.tsx
- [ ] T085 [P] [US6] Create FormTemplateList component in packages/app/src/emr/components/form-management/FormTemplateList.tsx (searchable, sortable table)
- [ ] T086 [P] [US6] Create FormTemplateList tests in packages/app/src/emr/components/form-management/FormTemplateList.test.tsx
- [ ] T087 [P] [US6] Create FormTemplateCard component in packages/app/src/emr/components/form-management/FormTemplateCard.tsx (template preview card)
- [ ] T088 [P] [US6] Create FormTemplateCard tests in packages/app/src/emr/components/form-management/FormTemplateCard.test.tsx
- [ ] T089 [US6] Implement form versioning in formBuilderService.ts (incrementVersionId on edit, preserve original)
- [ ] T090 [US6] Implement form cloning in formBuilderService.ts (cloneQuestionnaire, add "-Copy" suffix)
- [ ] T091 [US6] Implement form archiving in formBuilderService.ts (archive/restore, hide from active lists)
- [ ] T092 [US6] Create FormVersionHistory component in packages/app/src/emr/components/form-management/FormVersionHistory.tsx (version comparison view)
- [ ] T093 [US6] Create FormVersionHistory tests in packages/app/src/emr/components/form-management/FormVersionHistory.test.tsx
- [ ] T094 [US6] Create FormCloneModal component in packages/app/src/emr/components/form-management/FormCloneModal.tsx (clone workflow)
- [ ] T095 [US6] Create FormCloneModal tests in packages/app/src/emr/components/form-management/FormCloneModal.test.tsx
- [ ] T096 [US6] Create FormEditView in packages/app/src/emr/views/form-builder/FormEditView.tsx (edit existing template at /emr/forms/edit/:id)
- [ ] T097 [US6] Create FormEditView tests in packages/app/src/emr/views/form-builder/FormEditView.test.tsx
- [ ] T098 [US6] Create E2E tests for versioning in tests/e2e/form-management/version-history.spec.ts
- [ ] T099 [US6] Create E2E tests for cloning in tests/e2e/form-management/clone-form.spec.ts

**Checkpoint**: Form templates can be edited (versioned), cloned, and archived

---

## Phase 9: User Story 7 - Form PDF Export and Printing (Priority: P3)

**Goal**: Export completed forms as PDF documents

**Independent Test**: Open completed consent form, click "Export PDF", verify PDF downloads within 5 seconds with all data and signatures rendered correctly, Georgian text renders properly

### Implementation for User Story 7

- [ ] T100 [P] [US7] Create PDFGenerator component in packages/app/src/emr/components/form-pdf/PDFGenerator.tsx (@react-pdf/renderer wrapper)
- [ ] T101 [P] [US7] Create PDFGenerator tests in packages/app/src/emr/components/form-pdf/PDFGenerator.test.tsx
- [ ] T102 [P] [US7] Create FormPDFDocument component in packages/app/src/emr/components/form-pdf/FormPDFDocument.tsx (PDF layout with Georgian font)
- [ ] T103 [P] [US7] Create FormPDFDocument tests in packages/app/src/emr/components/form-pdf/FormPDFDocument.test.tsx
- [ ] T104 [US7] Register Noto Sans Georgian fonts in FormPDFDocument.tsx (Font.register for @react-pdf/renderer)
- [ ] T105 [US7] Implement pdfGenerationService in packages/app/src/emr/services/pdfGenerationService.ts (generateSimplePDF with @react-pdf/renderer)
- [ ] T106 [US7] Create pdfGenerationService tests in packages/app/src/emr/services/pdfGenerationService.test.ts
- [ ] T107 [US7] Create Medplum Bot for complex PDF generation in packages/server/src/bots/form-pdf-generator/index.ts (Puppeteer for charts/tables)
- [ ] T108 [US7] Create Bot tests in packages/server/src/bots/form-pdf-generator/index.test.ts
- [ ] T109 [US7] Configure Puppeteer Docker image with Georgian fonts (Dockerfile for Noto Sans Georgian)
- [ ] T110 [US7] Add PDF export button to FormViewerView.tsx
- [ ] T111 [US7] Implement browser print dialog in FormViewerView.tsx (window.print with A4/Letter format)
- [ ] T112 [US7] Create visual regression tests for PDF rendering in tests/e2e/accessibility/pdf-export-a11y.spec.ts
- [ ] T113 [US7] Test Georgian text rendering in PDFs with actual Georgian consent form

**Checkpoint**: Forms can be exported as PDFs with proper Georgian font rendering

---

## Phase 10: User Story 8 - Form Field Conditional Logic (Priority: P3)

**Goal**: Configure conditional field visibility (show/hide based on other field values)

**Independent Test**: Create form with checkbox "Patient is a minor" that shows/hides "Legal Guardian" section, fill form with checkbox selected, verify guardian fields appear and are required

### Implementation for User Story 8

- [ ] T114 [P] [US8] Implement enableWhen extension support in formBuilderService.ts (FHIR enableWhen structure)
- [ ] T115 [P] [US8] Create ConditionalLogic component in packages/app/src/emr/components/form-renderer/ConditionalLogic.tsx (show/hide based on field values)
- [ ] T116 [P] [US8] Create ConditionalLogic tests in packages/app/src/emr/components/form-renderer/ConditionalLogic.test.tsx
- [ ] T117 [US8] Implement FHIRPath expression evaluator for conditions in ConditionalLogic.tsx (support for AND, OR, NOT operators)
- [ ] T118 [US8] Add visual rule builder UI in FieldConfigEditor.tsx (configure enableWhen conditions)
- [ ] T119 [US8] Handle nested conditions (3 levels max) in ConditionalLogic.tsx
- [ ] T120 [US8] Clear hidden field values in FormRenderer.tsx (when field is hidden, clear its value)
- [ ] T121 [US8] Optimize re-rendering with React.memo and useMemo in ConditionalLogic.tsx
- [ ] T122 [US8] Create unit tests for condition evaluator in packages/app/src/emr/services/formValidationService.test.ts (20+ condition scenarios)
- [ ] T123 [US8] Create E2E tests for conditional logic in tests/e2e/form-renderer/validation.spec.ts

**Checkpoint**: Forms support conditional field visibility with up to 3 levels of nesting

---

## Phase 11: User Story 9 - Form Analytics and Reporting (Priority: P3)

**Goal**: View analytics on form usage (completion rates, average time, incomplete forms)

**Independent Test**: View dashboard showing "Consent Forms: 150 completed, 12 incomplete, avg time 4.2 minutes, 94% completion rate", verify data matches actual form submission records

### Implementation for User Story 9

- [ ] T124 [P] [US9] Create FormAnalyticsDashboard component in packages/app/src/emr/components/form-analytics/FormAnalyticsDashboard.tsx
- [ ] T125 [P] [US9] Create FormAnalyticsDashboard tests in packages/app/src/emr/components/form-analytics/FormAnalyticsDashboard.test.tsx
- [ ] T126 [P] [US9] Create FormCompletionChart component in packages/app/src/emr/components/form-analytics/FormCompletionChart.tsx (completion rate chart)
- [ ] T127 [P] [US9] Create FormCompletionChart tests in packages/app/src/emr/components/form-analytics/FormCompletionChart.test.tsx
- [ ] T128 [US9] Implement formAnalyticsService in packages/app/src/emr/services/formAnalyticsService.ts (aggregateMetrics, calculateCompletionRate, getAverageTime)
- [ ] T129 [US9] Create formAnalyticsService tests in packages/app/src/emr/services/formAnalyticsService.test.ts
- [ ] T130 [US9] Track completion time in FormRenderer.tsx (record start time, calculate duration on submit)
- [ ] T131 [US9] Identify frequently skipped fields in formAnalyticsService.ts
- [ ] T132 [US9] Generate usage reports (daily/weekly/monthly) in formAnalyticsService.ts
- [ ] T133 [US9] Add CSV export functionality in FormAnalyticsDashboard.tsx
- [ ] T134 [US9] Create useFormAnalytics hook in packages/app/src/emr/hooks/useFormAnalytics.ts
- [ ] T135 [US9] Create useFormAnalytics tests in packages/app/src/emr/hooks/useFormAnalytics.test.tsx
- [ ] T136 [US9] Create performance tests for analytics in tests/e2e/form-management/search-forms.spec.ts (aggregate 100,000+ responses)

**Checkpoint**: All user stories complete - full form builder system operational

---

## Phase 12: Auto-Save & Draft Recovery (Cross-Cutting Enhancement)

**Purpose**: Prevent data loss with automatic draft saving (enhances US4)

- [ ] T137 [P] Implement 5-second throttled auto-save in packages/app/src/emr/hooks/useAutoSave.ts (useThrottle hook)
- [ ] T138 [P] Create useAutoSave tests in packages/app/src/emr/hooks/useAutoSave.test.tsx
- [ ] T139 [P] Implement IndexedDB draft storage in packages/app/src/emr/services/draftService.ts (saveDraft, getDraft, deleteDraft)
- [ ] T140 [P] Create draftService tests in packages/app/src/emr/services/draftService.test.ts
- [ ] T141 Integrate useAutoSave hook in FormRenderer.tsx (watch form data → throttle → save to IndexedDB)
- [ ] T142 Add background sync to FHIR server in draftService.ts (every 30 seconds, status: in-progress)
- [ ] T143 Implement draft expiration (30-day TTL) in draftService.ts
- [ ] T144 Create useDraftRecovery hook in packages/app/src/emr/hooks/useDraftRecovery.ts (check for draft on mount, show recovery modal)
- [ ] T145 Create useDraftRecovery tests in packages/app/src/emr/hooks/useDraftRecovery.test.tsx
- [ ] T146 Add browser close warning in FormRenderer.tsx (useEffect with beforeunload event, useBlocker for React Router)
- [ ] T147 Create E2E tests for auto-save in tests/e2e/form-renderer/auto-save.spec.ts (navigate away, return, verify draft recovery)

---

## Phase 13: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T148 [P] Add virtual scrolling for large forms in FormRenderer.tsx (@tanstack/react-virtual for 100+ fields)
- [ ] T149 [P] Optimize form builder re-rendering with React.memo in FieldPalette, FormCanvas, PropertiesPanel
- [ ] T150 [P] Add loading skeletons for form loading states in FormRenderer.tsx and FormBuilderView.tsx
- [ ] T151 [P] Implement error boundaries for form components in packages/app/src/emr/components/common/FormErrorBoundary.tsx
- [ ] T152 [P] Create Storybook stories for all form builder components (FormBuilderLayout, FieldPalette, FormCanvas, PropertiesPanel)
- [ ] T153 [P] Create Storybook stories for all form renderer components (FormRenderer, FormField, SignatureField)
- [ ] T154 [P] Add ARIA live regions for form validation errors in FormRenderer.tsx
- [ ] T155 [P] Add WCAG 2.1 Level AA accessibility tests in tests/e2e/accessibility/form-builder-a11y.spec.ts
- [ ] T156 [P] Add WCAG 2.1 Level AA accessibility tests in tests/e2e/accessibility/form-renderer-a11y.spec.ts
- [ ] T157 [P] Add keyboard navigation support (Tab, Enter, Esc, Arrow keys) in FormCanvas.tsx
- [ ] T158 [P] Test screen reader compatibility (VoiceOver, NVDA, JAWS) for FormRenderer.tsx
- [ ] T159 Add responsive design for mobile (tablet/mobile layouts) in FormBuilderLayout.tsx
- [ ] T160 Add form search indexing for PostgreSQL full-text search (tsvector) in Medplum server
- [ ] T161 Add rate limiting for form API endpoints (100 req/min per user) in Medplum server
- [ ] T162 Create performance benchmarks for form rendering (10, 50, 100, 500 fields) in tests/e2e/
- [ ] T163 Create performance benchmarks for auto-save latency in tests/e2e/
- [ ] T164 Create performance benchmarks for PDF generation in tests/e2e/
- [ ] T165 Add code splitting for form builder routes (lazy load with React.lazy and Suspense)
- [ ] T166 Migrate 49 existing EMR form templates to FHIR Questionnaire format
- [ ] T167 Create migration scripts for existing form data to new system
- [ ] T168 Create user training materials (form builder guide, screenshots)
- [ ] T169 [P] Update documentation in specs/007-fhir-form-builder/quickstart.md
- [ ] T170 [P] Add JSDoc comments to all public APIs in services/

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-11)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Auto-Save (Phase 12)**: Depends on US4 (Form Completion) being complete
- **Polish (Phase 13)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after US1 - Depends on FormBuilderLayout and FormCanvas from US1
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - No dependencies on US1/US2
- **User Story 4 (P2)**: Can start after US3 - Depends on FormRenderer from US3
- **User Story 5 (P2)**: Can start after US4 - Depends on QuestionnaireResponse resources from US4
- **User Story 6 (P2)**: Can start after US1 - Depends on formBuilderService from US1
- **User Story 7 (P3)**: Can start after US4 - Depends on completed QuestionnaireResponse resources
- **User Story 8 (P3)**: Can start after US3 - Depends on FormRenderer from US3
- **User Story 9 (P3)**: Can start after US4 - Depends on QuestionnaireResponse resources with completion time tracking

### Critical Path

```
Phase 1: Setup → Phase 2: Foundational
                       ↓
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
      US1 (P1)       US3 (P1)         ↓
        ↓              ↓              ↓
      US2 (P1)       US4 (P2)         ↓
        ↓              ↓              ↓
      US6 (P2)       US5 (P2)       US8 (P3)
                       ↓
                     US7 (P3)
                       ↓
                     US9 (P3)
```

**Sequential Critical Path**: Setup → Foundational → US1 → US2 → US3 → US4 → US5 → US6 → US7 → US8 → US9 → Auto-Save → Polish

**Parallel Opportunities**: After Foundational completes, US1 and US3 can start in parallel

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models/Types before services
- Services before components
- Components before views
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

**Within Phase 1 (Setup)**:
- T003, T004, T005 can run in parallel

**Within Phase 2 (Foundational)**:
- T009, T010 can run in parallel
- T013, T014 can run in parallel after T011, T012

**Within User Story 1**:
- T015-T016, T017-T018, T019-T020, T021-T022 can run in parallel (different components)

**Within User Story 2**:
- T034, T035, T036-T037 can run in parallel

**Within User Story 3**:
- T044-T045 can run in parallel with T048-T049

**Within User Story 4**:
- T056-T057, T058-T059 can run in parallel

**Within User Story 5**:
- T071-T072, T073-T074, T075-T076 can run in parallel

**Within User Story 6**:
- T083-T084, T085-T086, T087-T088 can run in parallel

**Within User Story 7**:
- T100-T101, T102-T103 can run in parallel

**Within User Story 8**:
- T114, T115-T116 can run in parallel

**Within User Story 9**:
- T124-T125, T126-T127 can run in parallel

**Within Phase 12 (Auto-Save)**:
- T137-T138, T139-T140 can run in parallel

**Within Phase 13 (Polish)**:
- T148-T158 can run in parallel (different files)
- T169, T170 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all test tasks for User Story 1 together:
Task: "Create FormBuilderLayout tests in packages/app/src/emr/components/form-builder/FormBuilderLayout.test.tsx"
Task: "Create FieldPalette tests in packages/app/src/emr/components/form-builder/FieldPalette.test.tsx"
Task: "Create FormCanvas tests in packages/app/src/emr/components/form-builder/FormCanvas.test.tsx"
Task: "Create PropertiesPanel tests in packages/app/src/emr/components/form-builder/PropertiesPanel.test.tsx"

# Launch all component tasks for User Story 1 together:
Task: "Create FormBuilderLayout component in packages/app/src/emr/components/form-builder/FormBuilderLayout.tsx"
Task: "Create FieldPalette component in packages/app/src/emr/components/form-builder/FieldPalette.tsx"
Task: "Create FormCanvas component in packages/app/src/emr/components/form-builder/FormCanvas.tsx"
Task: "Create PropertiesPanel component in packages/app/src/emr/components/form-builder/PropertiesPanel.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 + 3 Only - Complete P1 Stories)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T014) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T015-T033) - Form template creation
4. Complete Phase 4: User Story 2 (T034-T043) - Visual configuration
5. Complete Phase 5: User Story 3 (T044-T055) - Patient data auto-population
6. **STOP and VALIDATE**: Test all P1 user stories independently
7. Deploy/demo if ready (MVP complete: administrators can create forms, forms auto-populate patient data)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Form creation works!)
3. Add User Story 2 → Test independently → Deploy/Demo (Visual configuration works!)
4. Add User Story 3 → Test independently → Deploy/Demo (MVP ready: patient data auto-populates!)
5. Add User Story 4 → Test independently → Deploy/Demo (Form completion + signatures work!)
6. Add User Story 5 → Test independently → Deploy/Demo (Search works!)
7. Add User Story 6 → Test independently → Deploy/Demo (Template management works!)
8. Add User Story 7 → Test independently → Deploy/Demo (PDF export works!)
9. Add User Story 8 → Test independently → Deploy/Demo (Conditional logic works!)
10. Add User Story 9 → Test independently → Deploy/Demo (Analytics work!)
11. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (critical path)
2. Once Foundational is done:
   - **Developer A**: User Story 1 → User Story 2 (sequential - US2 depends on US1)
   - **Developer B**: User Story 3 → User Story 4 (sequential - US4 depends on US3)
   - **Developer C**: User Story 8 (can start after US3 completes)
3. After US1, US3, US4 complete:
   - **Developer A**: User Story 6 (depends on US1)
   - **Developer B**: User Story 5 (depends on US4)
   - **Developer C**: User Story 7 (depends on US4)
4. Finally:
   - **Developer A**: User Story 9 (depends on US4)
   - **Developer B**: Auto-Save (Phase 12, depends on US4)
   - **Developer C**: Polish (Phase 13)
5. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Critical path: US1 → US2 and US3 → US4 → US5/US7/US9 are sequential
- Parallel opportunities: US1 and US3 can start simultaneously after Foundational phase
- Tests are optional in this feature (not explicitly requested in spec)
- Phase 12 (Auto-Save) enhances US4 but is implemented separately for clarity

---

## Summary

**Total Tasks**: 170
**Tasks per Phase**:
- Phase 1 (Setup): 6 tasks
- Phase 2 (Foundational): 8 tasks
- Phase 3 (US1): 19 tasks
- Phase 4 (US2): 10 tasks
- Phase 5 (US3): 12 tasks
- Phase 6 (US4): 15 tasks
- Phase 7 (US5): 12 tasks
- Phase 8 (US6): 17 tasks
- Phase 9 (US7): 14 tasks
- Phase 10 (US8): 10 tasks
- Phase 11 (US9): 13 tasks
- Phase 12 (Auto-Save): 11 tasks
- Phase 13 (Polish): 23 tasks

**MVP Scope** (Suggested): Phase 1 + Phase 2 + Phase 3 + Phase 4 + Phase 5 (T001-T055, 55 tasks)
- This delivers: Form template creation, visual configuration, patient data auto-population
- Estimated time: 6-8 weeks

**Full Feature** (All User Stories): Phase 1-13 (T001-T170, 170 tasks)
- This delivers: Complete form builder system with all features
- Estimated time: 14 weeks (per implementation plan)

**Parallel Opportunities**: 87 tasks marked [P] can run in parallel
- Within Setup: 3 parallel tasks
- Within Foundational: 4 parallel tasks
- Within User Stories: 60 parallel tasks
- Within Polish: 20 parallel tasks

**Independent Test Criteria**:
- Each user story has clear "Independent Test" criteria
- MVP (P1 stories) can be tested independently before proceeding to P2/P3 stories
- Each checkpoint validates story completion without dependencies on future stories
