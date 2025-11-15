# My Patients Page - Extraction Tools Documentation

## Overview

This directory contains comprehensive tools and guides to complete the extraction of the "ჩემი პაციენტები" (My Patients) page from the live EMR system, taking it from **82% → 100% completion**.

**Current Status**: Documentation 82% complete (based on screenshot analysis)
**Target**: 100% complete (with live DOM extraction and API verification)

---

## What Has Been Prepared

### 1. Comprehensive Extraction Guide
**File**: `LIVE-EXTRACTION-GUIDE.md`
**Size**: ~15,000 words
**Purpose**: Step-by-step instructions for extracting all data from the live system

**Contains**:
- 8 phases of extraction (Critical → Important → Supplementary)
- Ready-to-use JavaScript code snippets for browser console
- Network monitoring instructions
- API endpoint documentation steps
- Troubleshooting guide for common issues
- Expected file outputs and formats

**Use When**: Starting the extraction process - follow this guide sequentially

---

### 2. Quick Reference Card
**File**: `QUICK-EXTRACTION-REFERENCE.md`
**Size**: ~3,000 words
**Purpose**: Condensed version with just the essential commands

**Contains**:
- Critical 3 extractions (must complete)
- Important 2 extractions (high priority)
- Copy-paste JavaScript snippets
- 45-minute time breakdown
- Success criteria checklist

**Use When**: Need quick access to extraction commands without reading full guide

---

### 3. Printable Checklist
**File**: `EXTRACTION-CHECKLIST.md`
**Size**: ~4,000 words
**Purpose**: Physical checklist to track progress during extraction

**Contains**:
- Pre-extraction setup checklist
- Phase-by-phase checkboxes
- Space to write answers (Column 2 determination, etc.)
- File verification checklist
- Sign-off section

**Use When**: Want to print and physically check off items as you complete them

---

### 4. Verification Script
**File**: `extraction-data/verify-extraction.js`
**Size**: ~500 lines
**Purpose**: Automated script to verify page elements before extraction

**Contains**:
- 10 automated checks (table presence, column count, form elements, etc.)
- Readiness score calculation
- Detailed error and warning reporting
- Georgian text encoding verification

**Use When**: Before starting extraction (to verify page is correct) and after (to verify completeness)

---

### 5. Extraction Data Directory
**Directory**: `extraction-data/`
**Purpose**: Store all extracted raw data from live system

**Expected Files** (9 files total):
1. `column2-extraction.json` - Column 2 header/data analysis
2. `doctor-dropdown-options.json` - Complete doctor list
3. `department-dropdown-options.json` - Complete department list
4. `transferred-checkbox-details.json` - Checkbox logic and behavior
5. `form-field-details.json` - All form field IDs and names
6. `api-search-request.curl` - Search API cURL command
7. `api-search-response.json` - Example API response
8. `complete-page-structure.json` - Full page DOM structure
9. `network-requests-log.txt` - Notes about API calls

**Current Status**: Directory created, template files ready, 0/9 files extracted

---

### 6. Network Requests Log Template
**File**: `extraction-data/network-requests-log.txt`
**Purpose**: Template for documenting API endpoints and network activity

**Use When**: Monitoring Network tab in DevTools and documenting API calls

---

## The 3 Critical Questions to Answer

### 🔴 Question 1: What is Column 2?

**Current Issue**:
- Header says "საწოლი" (Bed)
- Data looks like first names (ზაქარია, ალფერ, etc.)

**To Resolve**:
1. Extract Column 2 HTML using provided script
2. Examine both header and data cells
3. Determine if:
   - A) Header is wrong (should be "სახელი" - First Name)
   - B) Data is wrong (should show bed numbers like "301", "A-12")
   - C) Column serves dual purpose

**Impact**: Affects FHIR Patient.name vs Encounter.location mapping

**Priority**: HIGHEST - blocks table implementation

---

### 🔴 Question 2: What are ALL the dropdown options?

**Current Issue**:
- Doctor dropdown: Only 3-5 example doctors documented from screenshot
- Department dropdown: 17 common departments documented, may be incomplete

**To Resolve**:
1. Run JavaScript extraction script for each dropdown
2. Get complete lists with IDs and names
3. Verify counts (expect 20-50 doctors, 15-25 departments)

**Impact**: Affects filter functionality and Practitioner/Location references

**Priority**: HIGH - needed for filter implementation

---

### 🔴 Question 3: What does "Transferred" mean?

**Current Issue**:
- Checkbox labeled "გადწერილება" (Transferred)
- Business logic unclear: transferred FROM where? TO where?

**To Resolve**:
1. Inspect checkbox element
2. Toggle checkbox and monitor network request
3. Observe what changes in results
4. Interview users if needed to clarify meaning

**Impact**: Affects FHIR Encounter filtering strategy

**Priority**: HIGH - needed for accurate search behavior

---

## Extraction Workflow

### Step 1: Preparation (5 minutes)
1. Read `QUICK-EXTRACTION-REFERENCE.md` to familiarize yourself
2. Print `EXTRACTION-CHECKLIST.md` (optional)
3. Open browser and navigate to My Patients page
4. Open DevTools (F12)
5. Run `verify-extraction.js` to confirm page is ready

### Step 2: Critical Extractions (15 minutes)
1. Extract Column 2 data → `column2-extraction.json`
2. Extract doctor dropdown → `doctor-dropdown-options.json`
3. Extract department dropdown → `department-dropdown-options.json`

**Deliverable**: Answer to Question 1 and Question 2

### Step 3: Important Extractions (15 minutes)
1. Test and document Transferred checkbox → `transferred-checkbox-details.json`
2. Extract form field details → `form-field-details.json`

**Deliverable**: Answer to Question 3

### Step 4: API Documentation (10 minutes)
1. Monitor Network tab during search
2. Copy search request as cURL → `api-search-request.curl`
3. Copy search response → `api-search-response.json`
4. Document findings in `network-requests-log.txt`

**Deliverable**: API endpoints documented

### Step 5: Verification (5 minutes)
1. Run `verify-extraction.js` again
2. Check readiness score (should be ≥90%)
3. Review all extracted JSON files
4. Verify no placeholder text remains

**Deliverable**: 100% extraction completion confirmed

### Step 6: Documentation Updates (30-60 minutes)
1. Update `table-structure.md` with Column 2 resolution
2. Update `search-filters.md` with complete dropdown lists
3. Update `field-mappings.md` with verified field names and API endpoints
4. Update `EXTRACTION-SUMMARY.md` to 100% completion

**Deliverable**: All 8 documentation files updated and ready for implementation

---

## File Dependencies

```
EXTRACTION FLOW:

1. Read QUICK-EXTRACTION-REFERENCE.md (or LIVE-EXTRACTION-GUIDE.md for details)
   ↓
2. Run verify-extraction.js in browser console
   ↓
3. Execute extraction scripts (from guide) → Save to extraction-data/*.json
   ↓
4. Use extraction-data/*.json to update documentation/*.md
   ↓
5. Update EXTRACTION-SUMMARY.md to 100% complete
   ↓
6. Begin Medplum implementation
```

---

## Tools Usage Summary

| Tool | When to Use | Time Required |
|------|-------------|---------------|
| **verify-extraction.js** | Before starting & after completing | 2 min |
| **QUICK-EXTRACTION-REFERENCE.md** | During extraction (quick commands) | 30-45 min |
| **LIVE-EXTRACTION-GUIDE.md** | Detailed step-by-step guidance | 30-45 min |
| **EXTRACTION-CHECKLIST.md** | Physical tracking (print and check off) | 30-45 min |
| **network-requests-log.txt** | While monitoring Network tab | 10 min |

---

## Expected Outcomes

After completing the extraction using these tools:

### Data Files Created
- ✅ 9 JSON/text files in `extraction-data/` directory
- ✅ All files contain actual data (no placeholders)
- ✅ All JSON files are valid and formatted

### Questions Answered
- ✅ Column 2 is definitively identified (Bed or First Name)
- ✅ Complete doctor dropdown list (20-50 doctors)
- ✅ Complete department dropdown list (15-25 departments)
- ✅ Transferred checkbox business logic documented
- ✅ At least 1 API endpoint fully documented

### Documentation Updated
- ✅ `table-structure.md` - Column 2 corrected
- ✅ `search-filters.md` - Complete dropdown options added
- ✅ `field-mappings.md` - Verified field names and FHIR mappings
- ✅ `EXTRACTION-SUMMARY.md` - 100% completion status

### Ready for Implementation
- ✅ All blocking questions resolved
- ✅ Complete FHIR mapping strategy defined
- ✅ API endpoints documented with examples
- ✅ No unknown fields or ambiguous requirements

---

## Troubleshooting

### Problem: "I don't have access to the live EMR system"
**Solution**: These extraction tools are designed for manual execution. You need:
- Browser with DevTools (Chrome/Firefox)
- Login credentials (Tako / FNDD1Act33)
- Network access to http://178.134.21.82:8008

If you don't have access, request it from the system administrator.

---

### Problem: "JavaScript scripts don't work in the console"
**Solution**:
1. Ensure you're using Chrome or Firefox (not Safari or Edge)
2. Check that the page is fully loaded (no loading spinners)
3. Verify you're on the correct page (ჩემი პაციენტები)
4. Try refreshing the page and running scripts again
5. Check browser console for error messages (red text)

---

### Problem: "I extracted data but it looks incomplete"
**Solution**:
1. Run `verify-extraction.js` to get a completeness score
2. Check the verification report for missing elements
3. Re-run specific extraction scripts for missing data
4. Ensure dropdowns are not empty (have >1 option)
5. Cross-reference with screenshots to verify data accuracy

---

### Problem: "Georgian characters show as boxes or question marks"
**Solution**:
- This is usually just a console display issue
- When you paste into a text file, characters should render correctly
- Ensure your text editor is set to UTF-8 encoding
- Use VS Code, Sublime Text, or Atom (not Notepad)

---

### Problem: "I'm not sure how to update the documentation files"
**Solution**:
1. Open each `.md` file in the `documentation/my-patients/` directory
2. Search for placeholder text like "[TO BE EXTRACTED]" or "⏳ Pending"
3. Replace with actual data from your extraction
4. Look for "⚠️" warnings indicating sections needing updates
5. Cross-reference with `field-mappings.md` for FHIR resource mappings
6. Save files and verify no syntax errors in markdown

---

## Support Resources

### For Extraction Process Questions
- Read: `LIVE-EXTRACTION-GUIDE.md` - Comprehensive troubleshooting section
- Run: `verify-extraction.js` - Automated diagnostics
- Check: `QUICK-EXTRACTION-REFERENCE.md` - Common issues & fixes

### For Documentation Update Questions
- Reference: Existing completed sections in documentation files
- Compare: With `patient-history` documentation (similar structure)
- Follow: Templates in each file (look for patterns)

### For FHIR Mapping Questions
- Read: `field-mappings.md` - Current FHIR strategy
- Reference: `packages/app/src/emr/services/patientHistoryService.ts` - Working example
- Check: FHIR R4 spec at https://hl7.org/fhir/R4/

---

## Success Metrics

Mark extraction as successful when:

1. **Completeness**: All 9 extraction data files exist with real data
2. **Accuracy**: Column 2 definitively identified, dropdown counts match live system
3. **Clarity**: All 3 critical questions answered with confidence
4. **Documentation**: All 8 .md files updated with verified information
5. **Verification**: `verify-extraction.js` shows ≥90% readiness score
6. **Readiness**: Development team can start implementation without further questions

**Target**: 100% completion, ready for Medplum implementation

---

## Timeline

**Estimated Total Time**: 1.5 - 2.5 hours

| Phase | Time | Cumulative |
|-------|------|------------|
| Setup & verification | 5 min | 5 min |
| Critical extractions | 15 min | 20 min |
| Important extractions | 15 min | 35 min |
| API documentation | 10 min | 45 min |
| Verification | 5 min | 50 min |
| Documentation updates | 30-60 min | 80-110 min |
| Review & quality check | 10-20 min | 90-130 min |

**Recommendation**: Block out 2 hours of focused time for best results

---

## Next Steps After Extraction

1. **Commit to Git**:
   ```bash
   git add documentation/my-patients/
   git commit -m "Complete My Patients page extraction - 100%"
   git push
   ```

2. **Update Project Tracking**:
   - Mark "My Patients extraction" task as complete
   - Create "My Patients implementation" task
   - Update project timeline

3. **Review with Team**:
   - Present findings (especially Column 2 resolution and Transferred logic)
   - Get approval on FHIR mapping strategy
   - Discuss any unexpected discoveries

4. **Begin Implementation**:
   - Create `MyPatientsView.tsx` component
   - Implement FHIR search queries based on verified mappings
   - Build filter components using actual dropdown data
   - Create patient table with correct columns

---

## File Inventory

**Extraction Tools & Guides** (4 files):
- `LIVE-EXTRACTION-GUIDE.md` - Comprehensive guide
- `QUICK-EXTRACTION-REFERENCE.md` - Quick reference
- `EXTRACTION-CHECKLIST.md` - Printable checklist
- `README-EXTRACTION-TOOLS.md` - This file

**Extraction Data** (10 files expected):
- `extraction-data/README.md` - Directory documentation
- `extraction-data/verify-extraction.js` - Verification script
- `extraction-data/network-requests-log.txt` - Template (to be filled)
- `extraction-data/*.json` - 7 JSON files (to be created during extraction)

**Total New Files**: 14 files created to support 100% extraction completion

---

**You now have everything needed to complete the My Patients page extraction to 100%!**

**Start with**: `QUICK-EXTRACTION-REFERENCE.md` or `LIVE-EXTRACTION-GUIDE.md`

**Good luck!** 🚀
