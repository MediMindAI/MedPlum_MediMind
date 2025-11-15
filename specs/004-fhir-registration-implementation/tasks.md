# Tasks: FHIR-Based Patient Registration System

**Input**: Design documents from `/specs/004-fhir-registration-implementation/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/patient-api.md ✅, quickstart.md ✅

**Tests**: Test-first development is REQUIRED per Constitution Principle III (NON-NEGOTIABLE). All tests MUST be written BEFORE implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5, US6)
- Include exact file paths in descriptions

## Path Conventions

All paths are relative to `/Users/toko/Desktop/medplum_medimind/packages/app/src/emr/`:

- Views: `views/registration/`
- Components: `components/registration/`
- Hooks: `hooks/`
- Services: `services/`
- Types: `types/`
- Translations: `translations/`
- Tests: Colocated with source (e.g., `validators.test.ts` next to `validators.ts`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and file structure creation

- [ ] T001 Create registration types file at packages/app/src/emr/types/registration.ts with PatientFormValues, RepresentativeFormValues, and SearchFormValues interfaces
- [ ] T002 [P] Create citizenship data file at packages/app/src/emr/translations/citizenship.json with 250 countries (ISO 3166-1 codes + Georgian/English/Russian translations)
- [ ] T003 [P] Add registration translation keys to packages/app/src/emr/translations/ka.json for Georgian labels (form fields, validation messages, UI text)
- [ ] T004 [P] Add registration translation keys to packages/app/src/emr/translations/en.json for English labels (mirror Georgian keys)
- [ ] T005 [P] Add registration translation keys to packages/app/src/emr/translations/ru.json for Russian labels (mirror Georgian keys)
- [ ] T006 Create registration routes in packages/app/src/AppRoutes.tsx under /emr/registration path (list, create, edit/:id, unknown routes)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Write tests for Georgian personal ID validator in packages/app/src/emr/services/validators.test.ts (valid IDs, invalid formats, wrong checksums, invalid dates)
- [ ] T008 Implement Georgian personal ID validator in packages/app/src/emr/services/validators.ts with 11-digit checksum algorithm (Luhn variant)
- [ ] T009 [P] Write tests for email validator in packages/app/src/emr/services/validators.test.ts (valid emails, invalid formats, edge cases)
- [ ] T010 [P] Implement email validator in packages/app/src/emr/services/validators.ts using RFC 5322 pattern
- [ ] T011 [P] Write tests for date validator in packages/app/src/emr/services/validators.test.ts (future dates, dates > 120 years old, valid dates)
- [ ] T012 [P] Implement date validator in packages/app/src/emr/services/validators.ts (birthdate constraints)
- [ ] T013 Write tests for FHIR Patient service in packages/app/src/emr/services/patientService.test.ts using MockClient (createPatient, checkDuplicatePatient, updatePatient, searchPatients)
- [ ] T014 Implement createPatient function in packages/app/src/emr/services/patientService.ts (form values → FHIR Patient resource mapping)
- [ ] T015 Implement checkDuplicatePatient function in packages/app/src/emr/services/patientService.ts (search by personal ID, firstname, lastname)
- [ ] T016 [P] Implement updatePatient function in packages/app/src/emr/services/patientService.ts (update existing Patient resource)
- [ ] T017 [P] Implement searchPatients function in packages/app/src/emr/services/patientService.ts (paginated search with filters)
- [ ] T018 [P] Implement getPatient function in packages/app/src/emr/services/patientService.ts (fetch single Patient by ID)
- [ ] T019 [P] Implement deletePatient function in packages/app/src/emr/services/patientService.ts (soft delete via archive)
- [ ] T020 [P] Write tests for FHIR RelatedPerson service in packages/app/src/emr/services/representativeService.test.ts using MockClient (createRepresentative, getRepresentatives, updateRepresentative)
- [ ] T021 [P] Implement createRepresentative function in packages/app/src/emr/services/representativeService.ts (form values → FHIR RelatedPerson resource)
- [ ] T022 [P] Implement getRepresentatives function in packages/app/src/emr/services/representativeService.ts (search RelatedPerson by patient reference)
- [ ] T023 [P] Implement updateRepresentative function in packages/app/src/emr/services/representativeService.ts (update existing RelatedPerson resource)
- [ ] T024 Implement FHIR helper utilities in packages/app/src/emr/services/fhirHelpers.ts (getIdentifierValue, getTelecomValue, getExtensionValue, getPatronymicExtension, getCitizenshipExtension, getWorkplaceExtension)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Patient Search and List View (Priority: P1) 🎯 MVP

**Goal**: Enable reception staff to search for existing patients using filters (firstname, lastname, personal ID, registration number) and display paginated patient list with edit/delete actions

**Independent Test**: Navigate to `/emr/registration`, enter search criteria (e.g., first name "ნინო"), click search button, verify patient list displays with correct columns (registration #, personal ID, name, birth date, gender, phone, address) and action icons appear for each row

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T025 [P] [US1] Write integration test for patient search in packages/app/src/emr/views/registration/PatientListView.test.tsx (empty search, search by firstname, search by personal ID, pagination)
- [ ] T026 [P] [US1] Write unit test for usePatientSearch hook in packages/app/src/emr/hooks/usePatientSearch.test.ts (search params, pagination state, loading state)
- [ ] T027 [P] [US1] Write component test for PatientTable in packages/app/src/emr/components/registration/PatientTable.test.tsx (render patient rows, action icons visible, click edit icon navigation)

### Implementation for User Story 1

- [ ] T028 [P] [US1] Create usePatientSearch custom hook in packages/app/src/emr/hooks/usePatientSearch.ts (search state, pagination, search function using patientService.searchPatients)
- [ ] T029 [P] [US1] Create PatientTable component in packages/app/src/emr/components/registration/PatientTable.tsx (display 8 columns: registration #, personal ID, firstname, lastname, birthdate, gender, phone, address with edit/delete icons)
- [ ] T030 [US1] Create PatientListView in packages/app/src/emr/views/registration/PatientListView.tsx (search form with 4 filters + PatientTable + pagination controls)
- [ ] T031 [US1] Add search filter inputs to PatientListView (firstname, lastname, personal ID, registration number TextInput components)
- [ ] T032 [US1] Integrate usePatientSearch hook in PatientListView (handle search button click, update table on results)
- [ ] T033 [US1] Add Mantine Pagination component to PatientListView (handle page changes, show current page / total pages)
- [ ] T034 [US1] Implement edit icon onClick handler in PatientTable (navigate to `/emr/registration/edit/:id`)
- [ ] T035 [US1] Implement delete icon onClick handler in PatientTable (show confirmation modal, call patientService.deletePatient)

**Checkpoint**: At this point, User Story 1 should be fully functional - staff can search patients and see results in table format with navigation to edit page

---

## Phase 4: User Story 2 - New Patient Registration (Priority: P1)

**Goal**: Enable staff to register new patients with comprehensive demographics (personal ID, name, birth date, gender, contact info, citizenship) and automatically capture representative information for minors (age < 18)

**Independent Test**: Click "new patient" button, fill required fields (firstname, lastname, gender), fill optional fields (personal ID, birthdate, phone, email, address, citizenship), submit form, verify patient created with unique registration number and appears in patient list

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T036 [P] [US2] Write integration test for patient registration in packages/app/src/emr/views/registration/PatientRegistrationView.test.tsx (create standard patient, create minor with representative, validation errors)
- [ ] T037 [P] [US2] Write unit test for usePatientForm hook in packages/app/src/emr/hooks/usePatientForm.test.ts (form state management, validation rules, unknown patient toggle, minor detection)
- [ ] T038 [P] [US2] Write component test for PatientForm in packages/app/src/emr/components/registration/PatientForm.test.tsx (render all fields, required field validation, email validation, Georgian ID validation)
- [ ] T039 [P] [US2] Write component test for CitizenshipSelect in packages/app/src/emr/components/registration/CitizenshipSelect.test.tsx (render 250 countries, search functionality, Georgian labels displayed)
- [ ] T040 [P] [US2] Write component test for RepresentativeForm in packages/app/src/emr/components/registration/RepresentativeForm.test.tsx (conditional rendering for minors, relationship dropdown, validation)
- [ ] T041 [P] [US2] Write component test for RelationshipSelect in packages/app/src/emr/components/registration/RelationshipSelect.test.tsx (render 11 relationship options, Georgian labels)
- [ ] T042 [P] [US2] Write test for DuplicateWarningModal in packages/app/src/emr/components/registration/DuplicateWarningModal.test.tsx (show duplicate patients, confirm/cancel actions)

### Implementation for User Story 2

- [ ] T043 [P] [US2] Create usePatientForm custom hook in packages/app/src/emr/hooks/usePatientForm.ts (Mantine useForm with validation rules, unknown patient logic, minor detection logic)
- [ ] T044 [P] [US2] Create CitizenshipSelect component in packages/app/src/emr/components/registration/CitizenshipSelect.tsx (Mantine Select loading citizenship.json, searchable dropdown)
- [ ] T045 [P] [US2] Create RelationshipSelect component in packages/app/src/emr/components/registration/RelationshipSelect.tsx (Mantine Select with 11 relationship options using translated labels)
- [ ] T046 [US2] Create RepresentativeForm component in packages/app/src/emr/components/registration/RepresentativeForm.tsx (representative fields: firstname, lastname, personal ID, birthdate, gender, phone, address, relationship dropdown)
- [ ] T047 [US2] Create PatientForm component in packages/app/src/emr/components/registration/PatientForm.tsx (patient fields: personal ID, firstname, lastname, fatherName, birthdate, gender, phone, email, address, workplace, citizenship, unknown checkbox)
- [ ] T048 [US2] Add RepresentativeForm to PatientForm (conditional rendering based on patient age < 18)
- [ ] T049 [US2] Create DuplicateWarningModal component in packages/app/src/emr/components/registration/DuplicateWarningModal.tsx (display duplicate patient list, show patient details, confirm/cancel buttons)
- [ ] T050 [US2] Create PatientRegistrationView in packages/app/src/emr/views/registration/PatientRegistrationView.tsx (render PatientForm, handle submit, call duplicate check, call createPatient service)
- [ ] T051 [US2] Integrate duplicate detection in PatientRegistrationView (call checkDuplicatePatient before createPatient, show DuplicateWarningModal if matches found)
- [ ] T052 [US2] Add success notification on patient creation in PatientRegistrationView (Mantine notification with registration number)
- [ ] T053 [US2] Add error handling in PatientRegistrationView (catch FHIR errors, display user-friendly error messages)
- [ ] T054 [US2] Implement navigation after successful registration (redirect to patient list or edit page with new patient ID)
- [ ] T055 [US2] Add representative creation logic in PatientRegistrationView (call createRepresentative service if representative form filled)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - staff can search patients and register new patients with full validation and duplicate detection

---

## Phase 5: User Story 3 - Update Existing Patient Information (Priority: P2)

**Goal**: Enable staff to update patient records with modified information (demographics, contact info, citizenship, representatives) with validation and duplicate checking on personal ID changes

**Independent Test**: Search for existing patient, click edit icon, modify fields (phone number, address, citizenship), save changes, verify updated information appears in patient list and when reopening the record

### Tests for User Story 3 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T056 [P] [US3] Write integration test for patient editing in packages/app/src/emr/views/registration/PatientEditView.test.tsx (load existing patient, modify fields, save updates, validation on changes)
- [ ] T057 [P] [US3] Write test for patient update with personal ID change in packages/app/src/emr/views/registration/PatientEditView.test.tsx (duplicate detection when changing personal ID)

### Implementation for User Story 3

- [ ] T058 [P] [US3] Create PatientEditView in packages/app/src/emr/views/registration/PatientEditView.tsx (fetch patient by ID using getPatient service, render PatientForm with initialValues)
- [ ] T059 [US3] Add loading state to PatientEditView (show Mantine Loader while fetching patient)
- [ ] T060 [US3] Implement form submit handler in PatientEditView (call updatePatient service, handle success/error)
- [ ] T061 [US3] Add duplicate check on personal ID change in PatientEditView (compare new vs old personal ID, run checkDuplicatePatient if changed)
- [ ] T062 [US3] Fetch and display existing representatives in PatientEditView (call getRepresentatives service, show existing representatives with edit/delete options)
- [ ] T063 [US3] Add ability to update representatives in PatientEditView (call updateRepresentative service when representative form modified)
- [ ] T064 [US3] Add success notification on patient update (Mantine notification confirming save)

**Checkpoint**: All three priority user stories (US1, US2, US3) should now be independently functional - full CRUD operations on patients available

---

## Phase 6: User Story 4 - Emergency/Unknown Patient Registration (Priority: P2)

**Goal**: Enable emergency staff to register patients without identification by checking "unknown patient" checkbox, making firstname/lastname/personal ID optional, and generating temporary identifiers

**Independent Test**: Check "unknown patient" checkbox, verify required fields become optional, enter minimal info (estimated age, gender, notes), submit form, verify patient created with temporary ID (UNK-timestamp-random format)

### Tests for User Story 4 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T065 [P] [US4] Write integration test for unknown patient registration in packages/app/src/emr/views/registration/UnknownPatientView.test.tsx (create unknown patient, verify temp ID format, verify extension present)
- [ ] T066 [P] [US4] Write test for unknown patient form validation in packages/app/src/emr/components/registration/PatientForm.test.tsx (required fields become optional when unknownPatient checked)

### Implementation for User Story 4

- [ ] T067 [P] [US4] Create UnknownPatientView in packages/app/src/emr/views/registration/UnknownPatientView.tsx (specialized form for emergency registration with unknown patient checkbox pre-checked)
- [ ] T068 [US4] Add createUnknownPatient function to packages/app/src/emr/services/patientService.ts (generate temporary ID, create minimal Patient resource with unknown-patient extension)
- [ ] T069 [US4] Modify PatientForm to support unknown patient mode (conditional validation based on unknownPatient checkbox state)
- [ ] T070 [US4] Add estimated age field to UnknownPatientView (calculate approximate birth year from estimated age)
- [ ] T071 [US4] Add arrival datetime field to UnknownPatientView (auto-populate with current timestamp, store in arrival-datetime extension)
- [ ] T072 [US4] Add notes textarea to UnknownPatientView (store in registration-notes extension for emergency context)
- [ ] T073 [US4] Add identifyUnknownPatient function to packages/app/src/emr/services/patientService.ts (update unknown patient record with full identification info, remove temp identifier, remove unknown-patient extension)
- [ ] T074 [US4] Add alert banner to UnknownPatientView (yellow Mantine Alert warning about emergency registration)

**Checkpoint**: Emergency workflow complete - staff can register unknown patients and later update with full identification

---

## Phase 7: User Story 5 - Citizenship and International Patient Management (Priority: P3)

**Goal**: Enable staff to select citizenship from 250 countries during registration or update, with Georgian/English/Russian translations and searchable dropdown

**Independent Test**: Register or edit patient, open citizenship dropdown, search for "United States", select "ამერიკის შეერთებული შტატები", save record, verify citizenship stored and displayed correctly

### Tests for User Story 5 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T075 [P] [US5] Write test for citizenship dropdown in packages/app/src/emr/components/registration/CitizenshipSelect.test.tsx (load 250 options, search functionality, multi-language labels based on useTranslation hook)

### Implementation for User Story 5

- [ ] T076 [US5] Verify citizenship.json contains all 250 countries with code, displayKa, displayEn, displayRu, numeric fields (manual review)
- [ ] T077 [US5] Add citizenship extension mapping to patientService.createPatient (store ISO 3166-1 code in Patient.extension[citizenship])
- [ ] T078 [US5] Add citizenship extension mapping to patientService.updatePatient (update citizenship extension when changed)
- [ ] T079 [US5] Add citizenship display logic to PatientTable (extract citizenship from extension, display Georgian label in table)
- [ ] T080 [US5] Test citizenship persistence (create patient with citizenship, fetch patient, verify citizenship extension present with correct code)

**Checkpoint**: Citizenship management complete - international patients can be registered with proper country tracking

---

## Phase 8: User Story 6 - Representative/Relative Information Capture (Priority: P3)

**Goal**: Enable staff to record multiple representatives for patients (especially minors) with relationship types, personal details, and enforce representative requirement for patients < 18 years old

**Independent Test**: Register minor patient (birthdate makes age < 18), verify representative form becomes required, fill representative info with relationship type "დედა" (mother), save patient, verify RelatedPerson resource created and linked to patient

### Tests for User Story 6 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T081 [P] [US6] Write integration test for representative management in packages/app/src/emr/components/registration/RepresentativeForm.test.tsx (add representative for minor, multiple representatives, relationship validation)
- [ ] T082 [P] [US6] Write test for representative requirement in packages/app/src/emr/hooks/usePatientForm.test.ts (minor patient triggers representative validation)

### Implementation for User Story 6

- [ ] T083 [P] [US6] Add multiple representatives support to PatientForm (allow adding multiple RepresentativeForm components, store in array state)
- [ ] T084 [US6] Add representative requirement validation to usePatientForm (check patient age < 18, require at least one representative if true)
- [ ] T085 [US6] Add relationship mapping to representativeService.createRepresentative (map legacy values 1-11 to HL7 v3 RoleCode: MTH, FTH, SIS, BRO, GRMTH, GRFTH, CHILD, SPS, FAMMEMB)
- [ ] T086 [US6] Add relationship-side extension for maternal/paternal relatives (add extension to RelatedPerson when relationship value is 10 or 11)
- [ ] T087 [US6] Display existing representatives in PatientEditView (fetch RelatedPerson resources, show list with edit/delete options)
- [ ] T088 [US6] Add ability to remove representatives in PatientEditView (delete RelatedPerson resource, update UI)
- [ ] T089 [US6] Test representative linkage (create patient with representative, verify RelatedPerson.patient reference points to correct Patient ID)

**Checkpoint**: All six user stories should now be independently functional - complete registration system with search, create, update, emergency, citizenship, and representative management

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final integration

- [ ] T090 [P] Add loading skeletons to PatientListView (Mantine Skeleton components while search in progress)
- [ ] T091 [P] Add empty state to PatientListView (show message when no patients found, suggest adjusting search filters)
- [ ] T092 [P] Add form field help text tooltips (Mantine Tooltip on personal ID, citizenship, relationship fields with Georgian explanations)
- [ ] T093 [P] Optimize patient search performance (add debounce to search inputs, reduce API calls)
- [ ] T094 [P] Add patient list export functionality (export current search results to CSV with Georgian column headers)
- [ ] T095 [P] Add keyboard shortcuts to forms (Enter to submit, Esc to cancel, Tab navigation)
- [ ] T096 Test Georgian Unicode rendering in all components (verify U+10A0-U+10FF characters display correctly in all browsers)
- [ ] T097 Test responsive design for tablet users (verify forms and tables work on 1024px width screens)
- [ ] T098 Add confirmation dialog before leaving unsaved forms (Mantine Modal warning about unsaved changes)
- [ ] T099 [P] Code cleanup and refactoring (remove console.logs, add JSDoc comments, organize imports)
- [ ] T100 [P] Update CLAUDE.md with registration section documentation (add troubleshooting tips, common patterns, testing examples)
- [ ] T101 Run quickstart.md validation (follow quickstart guide, verify all code examples work)
- [ ] T102 Performance testing (verify patient search < 2sec for 100k records, form validation < 100ms)
- [ ] T103 Security audit (verify no PHI logged to console, no secrets in code, proper access control integration)
- [ ] T104 Accessibility audit (verify keyboard navigation, screen reader labels on all form fields, proper ARIA attributes)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
  - Creates file structure, translation files, types

- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
  - Implements validators, FHIR services, helper utilities
  - **CRITICAL**: No user story work can begin until this phase is complete

- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - **US1 (P1)**: Patient Search and List - Independent, no dependencies on other stories
  - **US2 (P1)**: New Patient Registration - Independent, integrates with US1 for navigation
  - **US3 (P2)**: Update Patient - Depends on US2 (uses same form components), integrates with US1 (edit button)
  - **US4 (P2)**: Emergency Unknown Patient - Independent (specialized workflow), uses same services as US2
  - **US5 (P3)**: Citizenship Management - Enhances US2 and US3 (citizenship field already in forms)
  - **US6 (P3)**: Representative Management - Enhances US2 and US3 (representative form already in forms)

- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Independence

Each user story is designed to be independently testable:

- **US1**: Fully functional patient search without needing registration capability
- **US2**: Can register patients without needing search (direct URL navigation)
- **US3**: Can update patients if patient ID known (direct URL navigation)
- **US4**: Emergency registration works independently with its own view
- **US5**: Citizenship dropdown works in both registration and update views
- **US6**: Representative forms work in both registration and update views

### Within Each User Story

1. **Tests FIRST** (REQUIRED per Constitution Principle III)
   - Write all tests for the story
   - Verify tests FAIL before implementation

2. **Models/Types** before services

3. **Services** before components

4. **Components** before views

5. **Views** last (integrate all components)

### Parallel Opportunities

**Phase 1 - Setup**: All 6 tasks can run in parallel (different files)

**Phase 2 - Foundational**:
- All validator tests can run in parallel (T007, T009, T011)
- All validator implementations can run in parallel (T008, T010, T012)
- patientService and representativeService can be developed in parallel (T013-T019 and T020-T023)

**Phase 3-8 - User Stories**:
- Once Foundational complete, multiple user stories can be worked on in parallel by different developers
- Within each story, tests marked [P] can run in parallel
- Components marked [P] can be developed in parallel

**Phase 9 - Polish**: Most tasks can run in parallel (different concerns, different files)

---

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together (write tests first):
Task: "Write integration test for patient registration in packages/app/src/emr/views/registration/PatientRegistrationView.test.tsx"
Task: "Write unit test for usePatientForm hook in packages/app/src/emr/hooks/usePatientForm.test.ts"
Task: "Write component test for PatientForm in packages/app/src/emr/components/registration/PatientForm.test.tsx"
Task: "Write component test for CitizenshipSelect in packages/app/src/emr/components/registration/CitizenshipSelect.test.tsx"
Task: "Write component test for RepresentativeForm in packages/app/src/emr/components/registration/RepresentativeForm.test.tsx"
Task: "Write component test for RelationshipSelect in packages/app/src/emr/components/registration/RelationshipSelect.test.tsx"
Task: "Write test for DuplicateWarningModal in packages/app/src/emr/components/registration/DuplicateWarningModal.test.tsx"

# Launch all component development together (after tests written and failing):
Task: "Create usePatientForm custom hook in packages/app/src/emr/hooks/usePatientForm.ts"
Task: "Create CitizenshipSelect component in packages/app/src/emr/components/registration/CitizenshipSelect.tsx"
Task: "Create RelationshipSelect component in packages/app/src/emr/components/registration/RelationshipSelect.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

Minimal Viable Product delivering core value:

1. **Complete Phase 1: Setup** (T001-T006)
   - File structure and translations ready

2. **Complete Phase 2: Foundational** (T007-T024) - CRITICAL
   - All validators and services implemented with tests
   - BLOCKS all user story work

3. **Complete Phase 3: User Story 1** (T025-T035)
   - Patient search and list view functional
   - Staff can find existing patients

4. **Complete Phase 4: User Story 2** (T036-T055)
   - New patient registration functional
   - Staff can register patients with full validation

5. **STOP and VALIDATE**: Test US1 and US2 together
   - Search for newly registered patients
   - Verify end-to-end workflow
   - Deploy/demo if ready

**MVP Delivers**: Core registration capability - search existing patients and register new patients with duplicate detection

### Incremental Delivery

After MVP, add value incrementally:

1. **Foundation** (Setup + Foundational) → Foundation ready ✅

2. **Add User Story 1** → Test independently → Deploy/Demo
   - Value: Staff can search patients

3. **Add User Story 2** → Test independently → Deploy/Demo
   - Value: Staff can register new patients (MVP! 🎯)

4. **Add User Story 3** → Test independently → Deploy/Demo
   - Value: Staff can update patient information

5. **Add User Story 4** → Test independently → Deploy/Demo
   - Value: Emergency department can register unknown patients

6. **Add User Story 5** → Test independently → Deploy/Demo
   - Value: International patient tracking enabled

7. **Add User Story 6** → Test independently → Deploy/Demo
   - Value: Representative management for minors completed

8. **Add Polish** → Final QA → Production Release
   - Value: Performance, UX, accessibility improvements

Each story adds value without breaking previous stories. Can stop at any point with working system.

### Parallel Team Strategy

With multiple developers:

1. **Week 1**: Team completes Setup (Phase 1) + Foundational (Phase 2) together
   - All validators, services, helper functions implemented and tested
   - Foundation ready checkpoint ✅

2. **Week 2-3**: Once Foundational is done, split by user stories:
   - **Developer A**: User Story 1 (Patient Search) - T025-T035
   - **Developer B**: User Story 2 (New Registration) - T036-T055
   - Work in parallel, stories are independent

3. **Week 4**: Continue parallel development:
   - **Developer A**: User Story 3 (Update Patient) - T056-T064
   - **Developer B**: User Story 4 (Emergency/Unknown) - T065-T074

4. **Week 5**: Final features:
   - **Developer A**: User Story 5 (Citizenship) - T075-T080
   - **Developer B**: User Story 6 (Representatives) - T081-T089

5. **Week 6**: Polish together (Phase 9) - T090-T104
   - Performance testing, security audit, accessibility
   - Final QA and production deployment

**Estimated Timeline**: 6 weeks for experienced React/TypeScript developers familiar with Medplum

---

## Notes

- **[P] tasks** = different files, no dependencies on incomplete tasks, can run in parallel
- **[Story] label** maps task to specific user story for traceability (US1-US6)
- Each user story should be independently completable and testable
- **Test-first is REQUIRED** per Constitution Principle III (write tests, verify they fail, then implement)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Constitution compliance**: All tasks follow FHIR-first architecture, use TypeScript strict mode, colocate tests, no new packages created
- **Georgian Unicode**: All form labels, validation messages, and UI text support U+10A0-U+10FF character range
- **FHIR conformance**: All Patient and RelatedPerson resources validated against R4 schema
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Summary

**Total Tasks**: 104 tasks
- **Setup**: 6 tasks
- **Foundational**: 18 tasks (BLOCKS all user stories)
- **User Story 1 (P1)**: 11 tasks
- **User Story 2 (P1)**: 20 tasks
- **User Story 3 (P2)**: 9 tasks
- **User Story 4 (P2)**: 10 tasks
- **User Story 5 (P3)**: 6 tasks
- **User Story 6 (P3)**: 9 tasks
- **Polish**: 15 tasks

**Parallel Opportunities**: 47 tasks marked [P] can run in parallel (45% of all tasks)

**MVP Scope**: Setup (6) + Foundational (18) + US1 (11) + US2 (20) = **55 tasks for MVP**

**Independent Test Criteria**:
- **US1**: Search patients by name/ID, view results in table, click edit icon → success
- **US2**: Register new patient with validation, save successfully, patient appears in list → success
- **US3**: Edit existing patient, modify fields, save updates, changes reflected → success
- **US4**: Check unknown checkbox, register with minimal info, temp ID generated → success
- **US5**: Select citizenship from 250 countries, save patient, citizenship stored → success
- **US6**: Register minor, fill representative info, RelatedPerson created → success

**Format Validation**: ✅ All 104 tasks follow checklist format with checkbox, ID, optional [P] marker, optional [Story] label, and file paths

---

**Tasks Generated**: 2025-11-12
**Ready for**: Implementation (start with Phase 1, then Phase 2, then user stories in priority order)
**Constitution Compliance**: ✅ Test-first development enforced, FHIR-first architecture, TypeScript strict mode
