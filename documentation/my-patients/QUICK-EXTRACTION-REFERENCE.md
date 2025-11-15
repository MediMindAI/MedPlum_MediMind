# My Patients Page - Quick Extraction Reference

**⏱️ Time Required**: 30-45 minutes
**📍 Page**: http://178.134.21.82:8008/index.php → პაციენტის ისტორია >> ჩემი პაციენტები
**🎯 Goal**: Achieve 100% documentation completion

---

## Prerequisites Checklist

- [ ] Browser open (Chrome/Firefox recommended)
- [ ] Logged into EMR (Tako / FNDD1Act33)
- [ ] On "ჩემი პაციენტები" page
- [ ] DevTools open (F12)
- [ ] Console tab active

---

## Critical 3 Extractions (Must Complete) 🔴

### 1. Column 2 Mystery - 5 minutes

**Goal**: Determine if column 2 is "Bed" or "First Name"

```javascript
// Paste this into Console:
const col2 = document.querySelectorAll('table thead th')[1];
const col2Data = document.querySelector('table tbody tr td:nth-child(2)');
console.log('Header:', col2.textContent);
console.log('Data:', col2Data.textContent);
console.log('Answer: Is this a bed number or a first name?');
```

**Action**: Document answer in `extraction-data/column2-extraction.json`

---

### 2. Doctor Dropdown - 5 minutes

**Goal**: Get complete list of doctors

```javascript
// Find all select elements first:
document.querySelectorAll('select').forEach((sel, i) => {
  console.log(`Select ${i}:`, sel.name, sel.id, `(${sel.options.length} options)`);
});

// Then extract the doctor dropdown (adjust index if needed):
const doctors = Array.from(document.querySelectorAll('select')[0].options).map(opt => ({
  value: opt.value,
  text: opt.text
}));
copy(JSON.stringify(doctors, null, 2));
console.log('✅ Doctors copied to clipboard!');
```

**Action**: Paste into `extraction-data/doctor-dropdown-options.json`

---

### 3. Department Dropdown - 5 minutes

**Goal**: Get complete list of departments

```javascript
// Extract department dropdown (adjust index if needed):
const departments = Array.from(document.querySelectorAll('select')[1].options).map(opt => ({
  value: opt.value,
  text: opt.text
}));
copy(JSON.stringify(departments, null, 2));
console.log('✅ Departments copied to clipboard!');
```

**Action**: Paste into `extraction-data/department-dropdown-options.json`

---

## Important 2 Extractions (High Priority) 🟡

### 4. Transferred Checkbox - 10 minutes

**Goal**: Understand what "გადწერილება" means

**Manual Test**:
1. Check the checkbox
2. Click search button
3. Go to **Network** tab in DevTools
4. Find the search request
5. Look at the request payload - what parameter is sent?

**Document**:
- Parameter name: `_____________`
- Parameter value when checked: `_____________`
- What it filters for: `_____________`

**Action**: Save findings to `extraction-data/transferred-checkbox-details.json`

---

### 5. Form Field IDs - 10 minutes

**Goal**: Get all form field names and IDs

```javascript
const formFields = Array.from(document.querySelectorAll('form input, form select, form button')).map(el => ({
  tag: el.tagName,
  type: el.type,
  id: el.id,
  name: el.name,
  label: el.labels?.[0]?.textContent?.trim()
}));
copy(JSON.stringify(formFields, null, 2));
console.log('✅ Form fields copied!');
```

**Action**: Paste into `extraction-data/form-field-details.json`

---

## Network Monitoring (API Endpoints) 🟢

### 6. Capture API Calls - 5-10 minutes

**Steps**:
1. Open DevTools → **Network** tab
2. Click **Clear** (🚫 icon)
3. Click the search button (with no filters)
4. Look for XHR/Fetch requests
5. Right-click the main request → Copy → Copy as cURL
6. Also right-click → Copy Response

**Action**: Save to `extraction-data/api-search-request.curl` and `api-search-response.json`

---

## Verification (Final Check)

### 7. Run Verification Script - 2 minutes

```javascript
// Copy the entire verify-extraction.js file and paste into Console
// Or load it from the file
```

**Expected Output**: Report showing what was found/missing

---

## File Output Summary

After extraction, you should have these 6+ files:

1. ✅ `column2-extraction.json` - Column 2 verified
2. ✅ `doctor-dropdown-options.json` - Complete doctor list
3. ✅ `department-dropdown-options.json` - Complete department list
4. ✅ `transferred-checkbox-details.json` - Checkbox business logic
5. ✅ `form-field-details.json` - All form fields
6. ✅ `api-search-request.curl` - Search API endpoint
7. ✅ `api-search-response.json` - Example response
8. ✅ `network-requests-log.txt` - Notes about API calls

**Save all files to**: `documentation/my-patients/extraction-data/`

---

## Common Issues & Quick Fixes

### Issue: "Cannot read property of null"
**Fix**: Element not found. Inspect the page manually and adjust the selector.

### Issue: "copy() is not defined"
**Fix**: Use Chrome browser, or manually copy from console.log() output.

### Issue: Georgian characters show as "???"
**Fix**: This is just console display. When you paste into a file, they'll appear correctly.

### Issue: "No table found"
**Fix**: Verify you're on the correct page (ჩემი პაციენტები).

---

## After Extraction - Update Documentation

Once you have all the data files:

1. **Update table-structure.md**
   - Fix Column 2 mapping (Bed vs First Name)
   - Add any new columns discovered

2. **Update search-filters.md**
   - Add complete doctor dropdown options
   - Add complete department dropdown options
   - Clarify "Transferred" filter logic

3. **Update field-mappings.md**
   - Update FHIR mappings based on verified field names
   - Add API endpoint documentation

4. **Update EXTRACTION-SUMMARY.md**
   - Change completion from 82% → 100%
   - Mark all critical items as resolved
   - Update statistics with actual counts

---

## Success Criteria

Mark extraction as **100% complete** when:

- ✅ Column 2 mystery resolved (know the field meaning)
- ✅ Doctor dropdown has >5 options documented
- ✅ Department dropdown has >10 options documented
- ✅ Transferred checkbox logic understood
- ✅ At least 1 API endpoint documented
- ✅ All form field names/IDs captured

---

## Time Breakdown

| Task | Time | Priority |
|------|------|----------|
| Column 2 verification | 5 min | 🔴 Critical |
| Doctor dropdown | 5 min | 🔴 Critical |
| Department dropdown | 5 min | 🔴 Critical |
| Transferred checkbox | 10 min | 🟡 Important |
| Form field IDs | 10 min | 🟡 Important |
| API endpoints | 10 min | 🟢 Nice-to-have |
| Verification | 2 min | 🟢 Nice-to-have |
| **Total** | **~45 min** | |

---

## Next Steps After 100% Completion

1. ✅ Review extracted data for accuracy
2. ✅ Update all 8 documentation markdown files
3. ✅ Commit extraction data to git
4. ✅ Begin Medplum implementation using the specs
5. ✅ Create MyPatientsView component
6. ✅ Implement FHIR search with filters

---

**Need Help?**
- See detailed guide: `LIVE-EXTRACTION-GUIDE.md`
- See verification script: `extraction-data/verify-extraction.js`
- See task list: Claude's todo list (11 tasks)

**Good luck!** 🚀
