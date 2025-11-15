# My Patients Page - Complete Documentation

## Overview

This folder contains comprehensive documentation for the **"ჩემი პაციენტები" (My Patients)** page from the original EMR system at http://178.134.21.82:8008/index.php.

**Purpose**: The My Patients page displays a filtered list of patients assigned to the currently logged-in healthcare provider, with search and filtering capabilities.

**Documentation Date**: 2025-11-14
**Extraction Method**: Screenshot analysis (live DOM extraction pending)
**Module**: პაციენტის ისტორია (Patient History)
**Current Completion**: 82% (awaiting live extraction for 100%)

---

## Quick Start - Complete the Extraction

To take this documentation from 82% → 100%, follow these guides:

### For Quick Extraction (30-45 minutes)
**Start here**: [QUICK-EXTRACTION-REFERENCE.md](./QUICK-EXTRACTION-REFERENCE.md)
- Copy-paste JavaScript commands
- Extract critical data (Column 2, dropdowns, API endpoints)
- Save to `extraction-data/` folder

### For Detailed Step-by-Step
**Read this**: [LIVE-EXTRACTION-GUIDE.md](./LIVE-EXTRACTION-GUIDE.md)
- Complete extraction instructions (8 phases)
- Troubleshooting guide
- Expected outputs and formats

### For Physical Tracking
**Print this**: [EXTRACTION-CHECKLIST.md](./EXTRACTION-CHECKLIST.md)
- Printable checklist with checkboxes
- Space to write answers
- Sign-off section

### For Tool Overview
**Overview**: [README-EXTRACTION-TOOLS.md](./README-EXTRACTION-TOOLS.md)
- Explanation of all extraction tools
- Workflow and dependencies
- Success criteria

---

## Documentation Files

### 1. [page-structure.md](./page-structure.md)
**Purpose**: Overall page layout and visual hierarchy

**Contents**:
- Navigation path to reach the page
- 4-section layout breakdown (top nav, sub-menu, filters, table)
- Visual characteristics (colors, spacing, typography)
- Section-by-section specifications
- Responsive behavior
- Integration points with other modules

**Use Case**: Understanding the page architecture for UI/UX replication

---

### 2. [search-filters.md](./search-filters.md)
**Purpose**: Detailed specification of all search and filter controls

**Contents**:
- Filter controls layout (4 filters)
- Individual field specifications:
  - მკურნალი ექიმი (Treating Doctor) - Dropdown
  - განყოფილება (Department) - Dropdown
  - გადწერილება (Transferred) - Checkbox
  - ისხ # (Registration Number) - Text input
- Search button functionality
- Filter logic (AND combination)
- Form submission behavior
- Validation rules
- Data sources for dropdowns

**Use Case**: Implementing search and filter functionality

---

### 3. [table-structure.md](./table-structure.md)
**Purpose**: Complete table specifications and data display

**Contents**:
- Table visual structure
- 7 column specifications:
  1. პორად # (Portal/Registration Number)
  2. საწოლი (Bed/First Name) - **Needs verification**
  3. გვარი (Last Name)
  4. სქესი (Gender)
  5. დაბ. თარიღი (Date of Birth)
  6. ტელეფონი (Phone)
  7. რეგ.# (Registration Number)
- Data types and formats
- Sorting behavior
- Row interaction (clickable rows)
- Empty state handling
- Styling specifications
- Performance considerations

**Use Case**: Building the patient list table component

---

### 4. [ui-elements.md](./ui-elements.md)
**Purpose**: Catalog of all interactive UI components

**Contents**:
- Main menu items (6 items)
- Sub-menu navigation (13 items)
- Filter form elements with HTML examples
- Search button specifications
- Table interaction elements
- Action buttons (if present)
- Loading states
- Empty state messages
- Tooltips and help text
- Keyboard shortcuts
- Accessibility features
- Animation and transitions

**Use Case**: Implementing all UI components and interactions

---

### 5. [translations.md](./translations.md)
**Purpose**: Multilingual support for Georgian, English, and Russian

**Contents**:
- Navigation translations (main menu + sub-menu)
- Filter control labels and placeholders
- Table column headers
- Gender values
- Action button labels
- Status messages (success, error, info, warning)
- Department names (17 common departments)
- Pagination controls
- Accessibility labels
- JSON translation files (ka.json, en.json, ru.json)

**Use Case**: Implementing i18n/localization

---

### 6. [field-mappings.md](./field-mappings.md)
**Purpose**: FHIR R4 resource mappings for Medplum implementation

**Contents**:
- Data model overview with ERD diagram
- Table column → FHIR field mappings
- Filter → FHIR search parameter mappings
- "My Patients" logic (3 implementation options)
- Complete FHIR query examples
- Performance optimization strategies
- Data integrity and validation rules
- Migration strategy from old EMR
- Testing scenarios

**Use Case**: Implementing FHIR-based backend and search functionality

---

## Quick Reference

### Page Navigation Path
```
Main Menu: პაციენტის ისტორია (Patient History)
  └── Sub-menu: ჩემი პაციენტები (My Patients)
```

### Key Features
1. **Filtered Patient List** - Shows patients assigned to current doctor
2. **4 Filters**:
   - Treating Doctor (dropdown)
   - Department (dropdown)
   - Transferred (checkbox)
   - Registration Number (text input)
3. **7-Column Table**:
   - Personal ID
   - First Name (possibly Bed - needs verification)
   - Last Name
   - Gender
   - Date of Birth
   - Phone
   - Registration Number
4. **Sorting** - Click column headers to sort
5. **Row Click** - Navigate to patient detail page

### Technologies
- **Frontend**: Georgian-compatible UI with Mantine components
- **Backend**: Medplum FHIR R4 server
- **Resources**: Patient, Encounter, Practitioner, Location
- **Languages**: Georgian (ka), English (en), Russian (ru)

---

## Implementation Checklist

### Phase 1: Basic Setup
- [ ] Create MyPatientsView component
- [ ] Set up route `/emr/patient-history/my-patients`
- [ ] Add sub-menu navigation item
- [ ] Create basic page layout (4 sections)

### Phase 2: Filter Controls
- [ ] Implement Treating Doctor dropdown
  - [ ] Fetch Practitioner resources
  - [ ] Populate dropdown options
  - [ ] Handle selection
- [ ] Implement Department dropdown
  - [ ] Fetch Location resources (type=ward)
  - [ ] Populate dropdown options
  - [ ] Handle selection
- [ ] Implement Transferred checkbox
  - [ ] Clarify business logic
  - [ ] Implement toggle behavior
- [ ] Implement Registration Number input
  - [ ] Add text input with validation
  - [ ] Support partial matching
- [ ] Implement Search button
  - [ ] Handle form submission
  - [ ] Trigger FHIR search
  - [ ] Show loading state

### Phase 3: Patient Table
- [ ] Implement table component
  - [ ] 7 column headers (turquoise gradient)
  - [ ] Alternating row colors
  - [ ] Responsive design
- [ ] Fetch patient data via FHIR
  - [ ] Implement "My Patients" query logic
  - [ ] Apply filters (AND logic)
  - [ ] Handle empty results
- [ ] Implement column sorting
  - [ ] Sort by Personal ID
  - [ ] Sort by First Name
  - [ ] Sort by Last Name
  - [ ] Sort by Gender
  - [ ] Sort by Date of Birth
- [ ] Implement row click navigation
  - [ ] Navigate to patient detail page
  - [ ] Pass patient ID in route

### Phase 4: Data Display
- [ ] Format Personal ID (11-digit)
- [ ] Display First Name (or Bed - verify!)
- [ ] Display Last Name
- [ ] Display Gender (Georgian: მამრობითი/მდედრობითი)
- [ ] Format Date of Birth (DD-MM-YYYY)
- [ ] Format Phone (+995 XXX XXX XXX)
- [ ] Display Registration Number (if available)

### Phase 5: Translations
- [ ] Add Georgian translations (ka.json)
- [ ] Add English translations (en.json)
- [ ] Add Russian translations (ru.json)
- [ ] Implement language switching
- [ ] Test all 3 languages

### Phase 6: Polish & Optimization
- [ ] Add loading spinner
- [ ] Add empty state message
- [ ] Implement error handling
- [ ] Add success/error notifications
- [ ] Optimize FHIR queries
- [ ] Add caching for doctor/department lists
- [ ] Implement pagination (if needed)
- [ ] Add keyboard shortcuts
- [ ] Ensure accessibility (ARIA labels)
- [ ] Test on all browsers
- [ ] Mobile responsive design

### Phase 7: Testing
- [ ] Unit tests for components
- [ ] Integration tests for FHIR queries
- [ ] E2E tests for user flows
- [ ] Accessibility testing
- [ ] Performance testing
- [ ] Cross-browser testing
- [ ] Mobile testing

---

## Known Issues & Questions

### Issue 1: Column 2 Discrepancy ⚠️
**Problem**: Column header says "საწოლი" (Bed) but data appears to be first names.

**Possible Explanations**:
1. Translation error in UI
2. Wrong column label (should be "სახელი" - First Name)
3. Bed assignment also shows patient name for reference
4. Screenshot from different view

**Resolution Needed**: Extract live DOM to verify actual field mapping.

**Impact**: Critical - affects data model and FHIR mapping.

---

### Issue 2: Empty Registration Number Column ⚠️
**Problem**: რეგ.# column is empty for all visible patients.

**Questions**:
- Is this column needed?
- Should it show encounter registration numbers?
- Is data missing from database?
- Is column only populated for certain patient types?

**Resolution Needed**: Check live system with active patients.

**Impact**: Medium - may be unused or need different data source.

---

### Issue 3: "Transferred" Meaning Unclear ⚠️
**Problem**: Unclear what "გადწერილება" (Transferred) means in business context.

**Possible Meanings**:
1. Transferred from another hospital
2. Transferred from another department
3. Transferred to another provider
4. Transferred to different bed/ward

**Resolution Needed**: Clarify with domain experts or observe live usage.

**Impact**: Medium - affects FHIR resource mapping (Encounter.hospitalization vs Extension).

---

### Issue 4: No Pagination Visible
**Problem**: No pagination controls visible in screenshot.

**Questions**:
- Is pagination below visible area?
- Does page use infinite scroll?
- Is patient count always low enough to show all?

**Resolution Needed**: Scroll to bottom of page on live system.

**Impact**: Low - can implement pagination later if needed.

---

### Issue 5: No Action Buttons Visible
**Problem**: No edit/delete/view buttons visible in table.

**Questions**:
- Are action buttons off-screen (right side)?
- Do actions appear on row hover?
- Are actions only on patient detail page?

**Resolution Needed**: Extract full table HTML from live system.

**Impact**: Low - actions may be on detail page, not list view.

---

## Next Steps

### Immediate (High Priority)
1. **Live DOM Extraction** - Access live EMR system to extract:
   - Complete table HTML with all columns
   - Dropdown options (doctors, departments)
   - Form field IDs and names
   - JavaScript validation logic
   - API endpoints (form submission, data loading)
   - Network requests and responses

2. **Verify Column 2** - Determine if "საწოლი" is:
   - Bed assignment
   - First name (mislabeled)
   - Combined field

3. **Clarify "Transferred" Logic** - Interview users or observe system to understand:
   - What makes a patient "transferred"?
   - Where do they transfer from/to?
   - How is this tracked in database?

### Short-Term (Medium Priority)
4. **Extract Doctor List** - Get complete list of doctors with IDs for dropdown
5. **Extract Department List** - Get complete list of departments for dropdown
6. **Test Search Functionality** - Try different filter combinations on live system
7. **Check for Additional Columns** - Scroll right to see if more columns exist
8. **Verify Registration Number** - Find patients with populated რეგ.# field

### Long-Term (Low Priority)
9. **Performance Testing** - Test with large patient datasets (>1000 patients)
10. **Mobile Optimization** - Design mobile/tablet layouts
11. **Export Functionality** - Add Excel/PDF export if needed
12. **Advanced Features** - Consider bulk actions, saved searches, etc.

---

## Dependencies

### Required for Implementation
1. **Medplum FHIR Server** - FHIR R4 API backend
2. **Patient Resources** - Migrated from old EMR
3. **Practitioner Resources** - All doctors in system
4. **Location Resources** - All departments/wards
5. **Encounter Resources** - Active patient admissions with:
   - Participant (treating doctor)
   - Location (department)
   - Status (in-progress for active patients)

### Optional Enhancements
6. **CarePlan Resources** - For explicit care assignments
7. **Translation Service** - For dynamic i18n
8. **Caching Layer** - Redis for dropdown lists
9. **Analytics** - Track page usage and filter patterns

---

## Related Documentation

### Other EMR Pages
- **Patient History (ისტორია)** - Visit history table
  - Location: `documentation/patient-history/`
  - Already implemented in Medplum system
- **Registration (რეგისტრაცია)** - Patient registration
  - Location: `packages/app/src/emr/views/registration/`
  - Already implemented with FHIR Patient resources

### Medplum Documentation
- Patient History Page: `specs/001-patient-history-page/`
- Registration System: `specs/004-fhir-registration-implementation/`
- EMR UI Layout: `specs/003-emr-ui-layout/`
- Project README: `/README.md`

### FHIR Specifications
- FHIR R4 Patient: https://hl7.org/fhir/R4/patient.html
- FHIR R4 Encounter: https://hl7.org/fhir/R4/encounter.html
- FHIR R4 Practitioner: https://hl7.org/fhir/R4/practitioner.html
- FHIR R4 Location: https://hl7.org/fhir/R4/location.html
- FHIR R4 Search: https://hl7.org/fhir/R4/search.html

---

## Contact & Support

### Documentation Questions
- Review existing documentation files in this folder
- Check FHIR resource specifications for technical details
- Refer to implemented Patient History page for similar patterns

### Implementation Questions
- Consult `CLAUDE.md` in project root for development guidelines
- Review Medplum documentation: https://www.medplum.com/docs
- Check existing EMR components in `packages/app/src/emr/`

### Business Logic Questions
- Consult with Georgian healthcare experts
- Review original EMR system usage
- Interview end users (doctors, nurses, administrators)

---

## Version History

### v1.0 - 2025-11-14
- Initial documentation based on screenshot analysis
- All 6 documentation files created
- Known issues and questions identified
- Implementation checklist provided
- FHIR mappings documented

### Future Versions
- v1.1 - After live DOM extraction (complete field mappings)
- v1.2 - After column 2 verification (correct bed vs first name)
- v1.3 - After transferred logic clarification (FHIR mapping update)
- v2.0 - After implementation complete (add screenshots and examples)

---

## License

This documentation is part of the Medplum EMR implementation project and follows the same license as the main project.

---

## Contributing

When updating this documentation:
1. Maintain the existing structure and format
2. Add new findings to appropriate files
3. Update version history in this README
4. Flag any discrepancies or questions
5. Include source URLs and extraction dates
6. Preserve Georgian text exactly (UTF-8 encoding)
7. Add English translations for new Georgian terms

---

## Acknowledgments

- Screenshot source: Original EMR system at http://178.134.21.82:8008/index.php
- Documentation framework: Based on Patient History page documentation pattern
- FHIR guidance: Medplum documentation and FHIR R4 specification
