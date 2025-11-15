# FHIR Patient Registration Implementation

**Feature ID**: 004
**Status**: 🟡 In Progress (Mapping Complete, Implementation Pending)
**Last Updated**: 2025-11-13

---

## 📋 Overview

Complete FHIR R4-compliant patient registration system with Georgian healthcare requirements, multilingual support, and exact UI matching of the original EMR system.

### Key Features

- ✅ FHIR R4 Patient & RelatedPerson resources
- ✅ Georgian personal ID validation (11-digit Luhn checksum)
- ✅ 250-country citizenship support (ka/en/ru)
- ✅ Duplicate detection
- ✅ Minor handling (automatic representative form)
- ✅ Unknown patient workflow
- ⏳ Unified search + registration page (in progress)
- ⏳ International phone input (in progress)
- ⏳ Table search highlighting (in progress)

---

## 📁 Documentation Structure

### Planning & Specification
- **`spec.md`** - Original feature specification
- **`data-model.md`** - FHIR resource structure and field mappings
- **`plan.md`** - High-level implementation plan
- **`tasks.md`** - Detailed task breakdown

### Original EMR Analysis (NEW - 2025-11-13)
- **`original-emr-mapping.md`** - 59-page complete UI/UX mapping from screenshot
- **`implementation-gaps.md`** - 45-page gap analysis and 4-week roadmap
- **`MAPPING-SUMMARY.md`** - Executive summary and quick reference

### Developer Resources
- **`quickstart.md`** - Getting started guide
- **`research.md`** - Technical research notes

---

## 🎯 Current Status

### Phase 1: Core Implementation ✅ COMPLETE

**Data Model**
- [x] Patient resource structure
- [x] RelatedPerson resource structure
- [x] FHIR identifiers (personal ID, registration number)
- [x] Custom extensions (citizenship, workplace, unknown-patient)

**Services**
- [x] `patientService.ts` - CRUD operations
- [x] `representativeService.ts` - RelatedPerson CRUD
- [x] `validators.ts` - Georgian ID, email, birthdate
- [x] `fhirHelpers.ts` - Data extraction utilities
- [x] `citizenshipHelper.ts` - 250-country support

**Components**
- [x] `PatientForm.tsx` - Main registration form
- [x] `RepresentativeForm.tsx` - Guardian form
- [x] `PatientTable.tsx` - Patient list table
- [x] `DuplicateWarningModal.tsx` - Duplicate detection UI
- [x] `CitizenshipSelect.tsx` - Country dropdown
- [x] `RelationshipSelect.tsx` - Relationship type dropdown

**Views**
- [x] `PatientListView.tsx` - Search and list patients
- [x] `PatientRegistrationView.tsx` - New patient registration
- [x] `PatientEditView.tsx` - Edit existing patient
- [x] `UnknownPatientView.tsx` - Emergency registration

**Testing**
- [x] All components tested (100+ tests passing)
- [x] All services tested
- [x] All validators tested
- [x] Integration tests

### Phase 2: Original EMR Mapping ✅ COMPLETE

**Analysis** (Completed 2025-11-13)
- [x] Screenshot analysis (every pixel documented)
- [x] Field-by-field inventory (16 fields)
- [x] UI component breakdown
- [x] Interaction pattern mapping
- [x] Visual design specifications
- [x] FHIR resource mapping verification

**Gap Identification**
- [x] 11 gaps identified (3 HIGH, 5 MEDIUM, 3 LOW)
- [x] Priority classification
- [x] Effort estimation
- [x] Risk assessment

**Implementation Planning**
- [x] 4-week roadmap created
- [x] Task breakdown by week
- [x] Testing checklist
- [x] Success criteria defined

### Phase 3: UI Alignment ⏳ IN PROGRESS

**Week 1: Critical Foundation** (Target: 2025-11-20)
- [ ] Create `UnifiedRegistrationView.tsx` (2-column layout)
- [ ] Extract `PatientSearchForm.tsx`
- [ ] Add registration number search field
- [ ] Implement table search highlighting
- [ ] Update routing

**Week 2: Enhanced UX** (Target: 2025-11-27)
- [ ] International phone input component
- [ ] Address field type change (Textarea → TextInput)
- [ ] Submit dropdown button (4 actions)
- [ ] Action logic implementation

**Week 3: Visual Polish** (Target: 2025-12-04)
- [ ] Turquoise theme application
- [ ] Section header styling
- [ ] Typography and spacing refinements

**Week 4: Testing & UAT** (Target: 2025-12-11)
- [ ] Identify H & Q button functionality
- [ ] Comprehensive testing
- [ ] Documentation updates
- [ ] User acceptance testing

---

## 🔍 Key Findings from Original EMR

### Critical Architectural Difference

**Original EMR**: Unified single-page layout
```
┌─────────────────────────────────────┐
│ [Search: 35%] │ [Register: 65%]    │
├─────────────────────────────────────┤
│    [Patient Table: 100%]            │
└─────────────────────────────────────┘
```

**Current Implementation**: Separate pages
```
Page 1: /patient-list → Search + Table
Page 2: /new-patient → Register Form
(User navigates between pages)
```

**Impact**: Users must click 2-3 times vs. having everything visible simultaneously.

### Top 3 Priority Gaps

1. **🔴 Unified Layout** - Separate pages vs. side-by-side (5 days effort)
2. **🔴 Registration Number Search** - Missing field (4 hours effort)
3. **🔴 Table Search Highlighting** - Light green backgrounds (2 days effort)

### Visual Identity

- **Primary Color**: Turquoise #17a2b8 (not Mantine blue)
- **Highlight Color**: Light green #c6efce for search matches
- **Table Header**: Turquoise gradient (90deg, #138496 → #17a2b8 → #20c4dd)
- **Typography**: Georgian-friendly, medium weights

---

## 📊 Statistics

### Code Coverage
- **Components**: 12 components (all tested)
- **Services**: 5 services (all tested)
- **Views**: 4 views (all tested)
- **Tests**: 100+ tests passing
- **Coverage**: ~90% (excluding UI integration)

### Field Inventory
- **Search Fields**: 4 (first name, last name, personal ID, registration number*)
- **Registration Fields**: 12 (personal ID, names, birthdate, gender, phone*, email, address, citizenship, workplace, unknown)
- **Representative Fields**: 8 (names, personal ID, birthdate, gender, phone, address, relationship)
- **Total Fields**: 16 main + 8 conditional

*Note: Registration number search and international phone input not yet implemented*

### Translation Coverage
- **Languages**: 3 (Georgian, English, Russian)
- **Keys**: 50+ translation keys
- **Countries**: 250 (citizenship data)
- **Completeness**: 100% for existing components

---

## 🚀 Quick Start

### For Developers Starting Implementation

1. **Read Documentation** (in order):
   ```bash
   # Quick overview
   cat specs/004-fhir-registration-implementation/MAPPING-SUMMARY.md

   # Detailed gaps and roadmap
   cat specs/004-fhir-registration-implementation/implementation-gaps.md

   # Complete original EMR specs (reference as needed)
   cat specs/004-fhir-registration-implementation/original-emr-mapping.md
   ```

2. **Set Up Development Environment**:
   ```bash
   cd packages/app
   npm install
   npm run dev
   ```

3. **Navigate to Registration**:
   - Open browser: `http://localhost:8103`
   - Click "რეგისტრაცია" in main menu
   - Click "რეგისტრაციაში" sub-menu
   - Current: See separate PatientListView page

4. **Start with Week 1 Tasks**:
   ```bash
   # Create unified view component
   touch src/emr/views/registration/UnifiedRegistrationView.tsx
   touch src/emr/views/registration/UnifiedRegistrationView.test.tsx

   # Extract search form
   touch src/emr/components/registration/PatientSearchForm.tsx
   touch src/emr/components/registration/PatientSearchForm.test.tsx
   ```

### For Reviewers/QA

1. **Check Current Implementation**:
   - Go to `/emr/registration/patient-list` - Search works but separate page
   - Go to `/emr/registration/new-patient` - Registration works but separate page
   - Expected: Both should be on same page side-by-side

2. **Compare with Original**:
   - Open screenshot: `Screenshot 2025-11-13 at 00.59.29.png`
   - Compare layout, colors, fields
   - See detailed comparison in `implementation-gaps.md`

3. **Test Core Features**:
   - Georgian ID validation (try `26001014632`)
   - Duplicate detection (register same ID twice)
   - Minor detection (birthdate < 18 years ago)
   - Citizenship dropdown (250 countries)

---

## 📚 Related Documentation

### Medplum Project
- **Main README**: `/Users/toko/Desktop/medplum_medimind/.claude/CLAUDE.md`
- **EMR UI Layout**: Feature 003 (4-row horizontal navigation)
- **Project Constitution**: `specs/constitution.md`

### External Resources
- **FHIR R4 Patient**: https://hl7.org/fhir/R4/patient.html
- **FHIR R4 RelatedPerson**: https://hl7.org/fhir/R4/relatedperson.html
- **Georgian ID Format**: 11-digit with Luhn checksum
- **ISO 3166-1**: Country codes (alpha-2)

---

## 🧪 Testing

### Run All Registration Tests
```bash
cd packages/app

# All registration tests
npm test -- registration

# Specific components
npm test -- PatientForm.test.tsx
npm test -- PatientTable.test.tsx
npm test -- PatientListView.test.tsx

# Services
npm test -- patientService.test.ts
npm test -- validators.test.ts

# Watch mode
npm test -- --watch registration
```

### Manual Testing Checklist

**Basic Registration**:
- [ ] Navigate to registration page
- [ ] Fill required fields (name, gender)
- [ ] Submit form
- [ ] Patient appears in table
- [ ] Success notification shown

**Search**:
- [ ] Enter personal ID
- [ ] Click search
- [ ] Results appear in table
- [ ] Can edit result
- [ ] Can delete result

**Duplicate Detection**:
- [ ] Register patient with personal ID
- [ ] Try to register same personal ID again
- [ ] Duplicate warning modal appears
- [ ] Can choose to continue or cancel

**Minor with Representative**:
- [ ] Enter birthdate (age < 18)
- [ ] Representative form appears
- [ ] Fill representative info
- [ ] Submit
- [ ] Both Patient and RelatedPerson created

**Unknown Patient**:
- [ ] Check "უცნობი" checkbox
- [ ] All fields become optional
- [ ] Can submit with minimal data
- [ ] Patient created with unknown flag

---

## 🐛 Known Issues

### Current Implementation
1. **Separate Pages** - Search and registration on different routes
2. **No Registration Number Search** - Can't search by reg number
3. **No Search Highlighting** - Table doesn't highlight matches
4. **Simple Phone Input** - No country code dropdown
5. **Blue Theme** - Using Mantine blue instead of turquoise

### In Progress (Week 1)
- Unified layout implementation
- Registration number search
- Table highlighting

---

## 📝 Change Log

### 2025-11-13: Original EMR Mapping Complete
- Analyzed original EMR screenshot (comprehensive)
- Documented all 16 fields with exact Georgian labels
- Identified 11 implementation gaps
- Created 4-week implementation roadmap
- Prioritized gaps (3 HIGH, 5 MEDIUM, 3 LOW)
- Defined success criteria and testing checklist

### 2025-11-12: Core Implementation Complete
- Implemented all FHIR resources and services
- Created all registration components
- Wrote 100+ tests (all passing)
- Added 250-country citizenship support
- Implemented Georgian ID validation
- Completed duplicate detection

### 2025-11-10: Project Initialized
- Created feature specification
- Designed data model
- Planned implementation phases

---

## 🤝 Contributing

When working on this feature:

1. **Read the gaps document first** (`implementation-gaps.md`)
2. **Follow the week-by-week roadmap** (don't skip ahead)
3. **Test incrementally** (don't wait until end)
4. **Update documentation** as you go
5. **Ask about H & Q buttons** before implementing

### Code Style
- Follow existing patterns in `packages/app/src/emr/`
- Use Georgian labels from translation files
- Write tests for all new components
- Use FHIR helpers for data extraction
- Keep components simple and focused

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/unified-registration-layout

# Make changes incrementally
git add packages/app/src/emr/views/registration/UnifiedRegistrationView.tsx
git commit -m "feat(registration): create unified registration view component

- Add 2-column layout (35% search, 65% form)
- Integrate PatientSearchForm and PatientForm
- Add patient table below
- Tests included

Refs: #004-gap-1"

# Push and create PR
git push origin feature/unified-registration-layout
```

---

## 📞 Support

### Questions?
- **Technical**: Review `original-emr-mapping.md` (complete specs)
- **Implementation**: Review `implementation-gaps.md` (how-to)
- **Quick Answers**: Review `MAPPING-SUMMARY.md` (executive summary)

### Issues?
- Check "Known Issues" section above
- Review test output for clues
- Check browser console for errors
- Verify Georgian text encoding (UTF-8)

---

## 🎯 Success Criteria

### Functional Requirements
- [x] All FHIR resources implemented correctly
- [x] Georgian ID validation works
- [x] Duplicate detection works
- [x] Minor detection works
- [x] Unknown patient workflow works
- [ ] Unified page layout implemented
- [ ] Registration number search works
- [ ] Table highlighting works
- [ ] International phone input works

### Visual Requirements
- [x] Georgian text renders correctly
- [x] All form fields present
- [ ] 2-column layout matches original
- [ ] Turquoise theme applied
- [ ] Table header gradient matches
- [ ] Search highlighting matches

### Performance Requirements
- [x] Form validation instant
- [x] Duplicate check < 1 second
- [ ] Page load < 2 seconds
- [ ] Search response < 1 second
- [ ] Table renders 100+ patients smoothly

---

## 📅 Timeline

- **Week 1** (2025-11-18 to 2025-11-22): Critical foundation (unified layout, highlighting)
- **Week 2** (2025-11-25 to 2025-11-29): Enhanced UX (phone input, dropdown button)
- **Week 3** (2025-12-02 to 2025-12-06): Visual polish (turquoise theme, typography)
- **Week 4** (2025-12-09 to 2025-12-13): Testing and UAT
- **Production**: 2025-12-16 (estimated)

---

**Next Steps**: Begin Week 1 implementation (Unified Layout)

**Status**: 🟡 Mapping Complete, Implementation Pending
**Last Updated**: 2025-11-13
**Document Version**: 2.0
