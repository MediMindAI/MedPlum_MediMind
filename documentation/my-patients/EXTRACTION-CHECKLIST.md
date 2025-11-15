# My Patients Page - Extraction Checklist

**Print this page and check off items as you complete them**

---

## Pre-Extraction Setup

- [ ] Browser opened (Chrome or Firefox)
- [ ] Navigated to: http://178.134.21.82:8008/index.php
- [ ] Logged in with: Tako / FNDD1Act33
- [ ] Clicked: პაციენტის ისტორია (Patient History)
- [ ] Clicked: ჩემი პაციენტები (My Patients)
- [ ] Page fully loaded (no loading spinners)
- [ ] DevTools opened (F12)
- [ ] Console tab active
- [ ] Network tab open in second DevTools window (optional but helpful)

---

## Phase 1: Critical Verifications 🔴

### Column 2 Mystery Resolution
- [ ] Ran `extractColumn2Data()` script from LIVE-EXTRACTION-GUIDE.md
- [ ] Copied JSON output to clipboard
- [ ] Pasted into `extraction-data/column2-extraction.json`
- [ ] Reviewed data and determined: Column 2 is **[BED / FIRST NAME]** ← Write answer
- [ ] Documented decision with reasoning

**Answer**: Column 2 is __________________ because __________________

---

### Doctor Dropdown Complete List
- [ ] Ran doctor dropdown extraction script
- [ ] Verified script found the dropdown (check console for "Doctor dropdown found")
- [ ] Counted options: _______ doctors found
- [ ] Copied JSON to clipboard
- [ ] Pasted into `extraction-data/doctor-dropdown-options.json`
- [ ] Opened file to verify JSON is valid
- [ ] Spot-checked: At least 5 different doctor names visible

**Total Doctors**: _______

---

### Department Dropdown Complete List
- [ ] Ran department dropdown extraction script
- [ ] Verified script found the dropdown
- [ ] Counted options: _______ departments found
- [ ] Copied JSON to clipboard
- [ ] Pasted into `extraction-data/department-dropdown-options.json`
- [ ] Opened file to verify JSON is valid
- [ ] Spot-checked: Recognized departments like "კარდიოლოგია", "ქირურგია", etc.

**Total Departments**: _______

---

## Phase 2: Important Extractions 🟡

### Transferred Checkbox Logic
- [ ] Inspected checkbox element in Elements tab
- [ ] Found checkbox `name` attribute: __________________
- [ ] Found checkbox `id` attribute: __________________
- [ ] Checked the checkbox manually
- [ ] Clicked search button
- [ ] Opened Network tab
- [ ] Found search request (XHR/Fetch)
- [ ] Clicked on request to see details
- [ ] Looked at "Payload" or "Request" tab
- [ ] Documented parameter sent: __________________ = __________________
- [ ] Observed what changed in results (more/fewer patients?)
- [ ] Unchecked checkbox and searched again to compare
- [ ] Determined business logic: Transferred means __________________
- [ ] Saved findings to `extraction-data/transferred-checkbox-details.json`

**Transferred Filter Meaning**:
_________________________________________________________________________
_________________________________________________________________________

---

### Form Field IDs and Names
- [ ] Ran form field extraction script
- [ ] Verified all 4+ filter fields found
- [ ] Copied JSON to clipboard
- [ ] Pasted into `extraction-data/form-field-details.json`
- [ ] Verified file contains:
  - [ ] Doctor dropdown (`name`, `id`)
  - [ ] Department dropdown (`name`, `id`)
  - [ ] Transferred checkbox (`name`, `id`)
  - [ ] Registration number input (`name`, `id`)
  - [ ] Search button (`name`, `id`, `type`)

**Field Count**: _______ total form elements found

---

## Phase 3: API Documentation 🟢

### Search API Endpoint
- [ ] Cleared Network tab (🚫 icon)
- [ ] Clicked search button with no filters
- [ ] Identified main search request in Network tab
- [ ] Request name/URL: __________________
- [ ] Right-clicked request → Copy → Copy as cURL
- [ ] Pasted into `extraction-data/api-search-request.curl`
- [ ] Right-clicked request → Copy → Copy Response
- [ ] Pasted into `extraction-data/api-search-response.json`
- [ ] Formatted JSON (use online JSON formatter if needed)

**API Endpoint**: __________________
**HTTP Method**: [ ] GET  [ ] POST

---

### API Request Parameters
Document all parameters sent in the search request:

- [ ] Doctor parameter: `__________` = `__________`
- [ ] Department parameter: `__________` = `__________`
- [ ] Transferred parameter: `__________` = `__________`
- [ ] Registration number parameter: `__________` = `__________`
- [ ] Other parameters found:
  - `__________` = `__________`
  - `__________` = `__________`

---

## Phase 4: Supplementary Data 🟢

### Complete Page Structure
- [ ] Ran `extractPageStructure()` script
- [ ] Copied JSON to clipboard
- [ ] Pasted into `extraction-data/complete-page-structure.json`
- [ ] Verified sections captured:
  - [ ] Top navigation
  - [ ] Sub-menu
  - [ ] Filter form
  - [ ] Patient table

---

### Network Requests Log
- [ ] Reviewed all Network requests during page load
- [ ] Documented initial page load request
- [ ] Documented search request (with filters)
- [ ] Documented any AJAX/autocomplete requests
- [ ] Updated `extraction-data/network-requests-log.txt` with findings
- [ ] Noted any interesting patterns or observations

**Total Network Requests During Page Load**: _______

---

## Phase 5: Verification ✅

### Run Verification Script
- [ ] Copied entire `verify-extraction.js` script
- [ ] Pasted into Console
- [ ] Pressed Enter
- [ ] Reviewed verification report
- [ ] Noted readiness score: _______%
- [ ] All critical checks passed: [ ] YES  [ ] NO
- [ ] If NO, documented which checks failed: __________________

**Readiness Score**: _______%

**Status**:
- [ ] ✅ Ready for documentation update (≥90%)
- [ ] ⚠️ Needs minor fixes (70-89%)
- [ ] ❌ Needs significant work (<70%)

---

## Phase 6: Additional Checks

### Hidden or Off-Screen Elements
- [ ] Scrolled table horizontally to check for more columns
- [ ] Confirmed total visible columns: _______
- [ ] Checked for action buttons (edit/delete/view):
  - [ ] Found in table rows
  - [ ] Found in separate action panel
  - [ ] Not found
- [ ] Looked for pagination controls:
  - [ ] Found at bottom of table
  - [ ] Uses infinite scroll
  - [ ] Not needed (all patients fit on one page)

---

### Table Data Verification
- [ ] Counted visible patient rows: _______
- [ ] Checked status indicator (e.g., "ხაზზე (44)"): Shows _______ patients
- [ ] Verified Georgian text renders correctly (not boxes or ?????)
- [ ] Checked date formats in table: __________________
- [ ] Checked phone number formats: __________________
- [ ] Verified personal ID format (11 digits): [ ] YES  [ ] NO

---

## Phase 7: Documentation Updates

### Update Existing Files

#### table-structure.md
- [ ] Opened file for editing
- [ ] Updated Column 2 description (Bed vs First Name)
- [ ] Added verified field mappings
- [ ] Added actual column count if different from 7
- [ ] Saved file

#### search-filters.md
- [ ] Opened file for editing
- [ ] Replaced placeholder doctor options with actual list
- [ ] Replaced placeholder department options with actual list
- [ ] Updated Transferred checkbox description with business logic
- [ ] Added verified field IDs and names
- [ ] Saved file

#### field-mappings.md
- [ ] Opened file for editing
- [ ] Updated FHIR mappings based on verified field names
- [ ] Added API endpoint documentation
- [ ] Added request/response examples
- [ ] Saved file

#### EXTRACTION-SUMMARY.md
- [ ] Opened file for editing
- [ ] Changed completion percentage: 82% → 100%
- [ ] Updated statistics with actual counts:
  - Doctor dropdown options: _______
  - Department dropdown options: _______
  - Form fields: _______
  - Table columns: _______
- [ ] Marked all critical items as ✅ RESOLVED:
  - [ ] Column 2 discrepancy
  - [ ] Transferred checkbox logic
  - [ ] Dropdown options
- [ ] Added extraction date and completion timestamp
- [ ] Saved file

---

## Final Verification

### File Checklist
Verify all extraction data files exist and have content:

- [ ] `extraction-data/column2-extraction.json` - File size > 100 bytes
- [ ] `extraction-data/doctor-dropdown-options.json` - File size > 200 bytes
- [ ] `extraction-data/department-dropdown-options.json` - File size > 300 bytes
- [ ] `extraction-data/transferred-checkbox-details.json` - File size > 100 bytes
- [ ] `extraction-data/form-field-details.json` - File size > 300 bytes
- [ ] `extraction-data/api-search-request.curl` - File exists with cURL command
- [ ] `extraction-data/api-search-response.json` - File size > 500 bytes
- [ ] `extraction-data/network-requests-log.txt` - Updated with findings

**Files Created**: _______ / 8 expected

---

### Quality Checks

- [ ] All JSON files are valid (no syntax errors)
- [ ] Georgian characters preserved correctly in all files
- [ ] No placeholder text like "[TO BE EXTRACTED]" remaining
- [ ] All critical questions answered:
  - [ ] What is Column 2? (Bed or First Name)
  - [ ] What does "Transferred" mean?
  - [ ] How many doctors in the dropdown?
  - [ ] How many departments in the dropdown?
  - [ ] What is the search API endpoint?

---

### Documentation Review

- [ ] Read through updated table-structure.md
- [ ] Read through updated search-filters.md
- [ ] Read through updated field-mappings.md
- [ ] Read through updated EXTRACTION-SUMMARY.md
- [ ] All updates make sense and are consistent
- [ ] No contradictions between files
- [ ] Ready for implementation team to use

---

## Completion Sign-Off

**Extraction Completed By**: __________________ (Name)

**Date**: __________________ (YYYY-MM-DD)

**Time Spent**: __________________ (minutes)

**Completion Level**:
- [ ] 100% - All critical and important items extracted
- [ ] 90-99% - All critical items, most important items
- [ ] 80-89% - All critical items, some important items missing
- [ ] <80% - Incomplete, needs more work

**Notes/Observations**:
_________________________________________________________________________
_________________________________________________________________________
_________________________________________________________________________
_________________________________________________________________________

**Ready for Implementation**: [ ] YES  [ ] NO

**If NO, what's blocking**:
_________________________________________________________________________
_________________________________________________________________________

---

## Next Steps

After completing this checklist:

1. [ ] Commit all extraction data files to git:
   ```bash
   git add documentation/my-patients/extraction-data/
   git commit -m "Complete My Patients page extraction - 100%"
   ```

2. [ ] Update project task tracker:
   - [ ] Mark "My Patients extraction" as complete
   - [ ] Create "My Patients implementation" task

3. [ ] Review with team:
   - [ ] Schedule review meeting
   - [ ] Present findings (especially Column 2 and Transferred logic)
   - [ ] Get approval to proceed with implementation

4. [ ] Begin Medplum implementation:
   - [ ] Create `MyPatientsView.tsx` component
   - [ ] Implement FHIR search queries
   - [ ] Build filter components
   - [ ] Create patient table

---

**Great work! The My Patients page is now 100% documented and ready for implementation! 🎉**
