# Extraction Data Files

This directory contains raw data extracted from the live EMR system for the "ჩემი პაციენტები" (My Patients) page.

## File Descriptions

### Critical Data Files 🔴

1. **column2-extraction.json**
   - Purpose: Resolve the Column 2 mystery (Bed vs First Name)
   - Contains: Header HTML, cell data, attributes
   - Status: ⏳ Pending extraction

2. **transferred-checkbox-details.json**
   - Purpose: Clarify the "გადწერილება" (Transferred) business logic
   - Contains: Checkbox element details, event handlers, data attributes
   - Status: ⏳ Pending extraction

3. **doctor-dropdown-options.json**
   - Purpose: Complete list of all doctors for the filter dropdown
   - Contains: Doctor IDs, names, selection states
   - Status: ⏳ Pending extraction

4. **department-dropdown-options.json**
   - Purpose: Complete list of all departments for the filter dropdown
   - Contains: Department IDs, names, selection states
   - Status: ⏳ Pending extraction

### Important Data Files 🟡

5. **form-field-details.json**
   - Purpose: Complete form structure with field IDs and validation
   - Contains: All input/select/button elements with attributes
   - Status: ⏳ Pending extraction

6. **api-search-request.curl**
   - Purpose: API endpoint for patient search
   - Contains: cURL command with headers and parameters
   - Status: ⏳ Pending extraction

7. **api-search-response.json**
   - Purpose: Example response from search API
   - Contains: JSON structure of patient data
   - Status: ⏳ Pending extraction

### Supplementary Data Files 🟢

8. **complete-page-structure.json**
   - Purpose: Full page DOM for reference
   - Contains: HTML snippets of all major sections
   - Status: ⏳ Pending extraction

9. **network-requests-log.txt**
   - Purpose: Documentation of all API calls
   - Contains: URLs, methods, parameters, observations
   - Status: ⏳ Pending extraction

## Extraction Instructions

Follow the step-by-step guide in:
`/Users/toko/Desktop/medplum_medimind/documentation/my-patients/LIVE-EXTRACTION-GUIDE.md`

## Completion Checklist

- [ ] column2-extraction.json (CRITICAL)
- [ ] transferred-checkbox-details.json (CRITICAL)
- [ ] doctor-dropdown-options.json (CRITICAL)
- [ ] department-dropdown-options.json (CRITICAL)
- [ ] form-field-details.json
- [ ] api-search-request.curl
- [ ] api-search-response.json
- [ ] complete-page-structure.json
- [ ] network-requests-log.txt

**Progress**: 0/9 files extracted

---

## Usage Notes

After extraction is complete:

1. Review all JSON files for completeness
2. Cross-reference data with screenshots
3. Use extracted data to update main documentation files
4. Mark completion in EXTRACTION-SUMMARY.md

## Extraction Date

**Date**: Not yet started
**Extractor**: Tako
**EMR Version**: Live system at http://178.134.21.82:8008
