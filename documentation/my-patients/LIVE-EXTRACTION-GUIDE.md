# My Patients Page - Live System Extraction Guide

## Overview

This guide provides step-by-step instructions for extracting complete data from the live EMR system to achieve 100% documentation completion.

**Target Page**: http://178.134.21.82:8008/index.php
**Navigation**: პაციენტის ისტორია >> ჩემი პაციენტები
**Current Completion**: 82%
**Target Completion**: 100%

---

## Prerequisites

1. **Access Credentials**:
   - Username: `Tako`
   - Password: `FNDD1Act33`

2. **Browser**: Chrome or Firefox (with DevTools)

3. **Tools Needed**:
   - Browser DevTools (F12)
   - Text editor for saving JSON output

---

## Step-by-Step Extraction Process

### Phase 1: Initial Setup (5 minutes)

#### 1.1 Navigate to the Page

1. Open browser and go to: http://178.134.21.82:8008/index.php
2. Log in with credentials (Tako / FNDD1Act33)
3. Wait for dashboard to load
4. Click on **პაციენტის ისტორია** (Patient History) in main menu
5. Click on **ჩემი პაციენტები** (My Patients) in sub-menu
6. Wait for page to fully load (all filters, table, etc.)

#### 1.2 Open DevTools

1. Press **F12** or **Ctrl+Shift+I** (Windows) / **Cmd+Option+I** (Mac)
2. Go to **Console** tab
3. Clear console (click 🚫 icon or Ctrl+L)
4. Keep DevTools open for all following steps

---

### Phase 2: Critical Verification - Column 2 Mystery 🔴

**PRIORITY: This is the #1 blocker**

#### 2.1 Inspect Table HTML

1. In DevTools, go to **Elements** tab (or **Inspector** in Firefox)
2. Click the **Select Element** tool (arrow icon top-left)
3. Hover over the **"საწოლი"** column header
4. Note the exact HTML element (likely `<th>`)
5. Look for:
   - `data-column` attribute
   - `data-field` attribute
   - Any `id` or `class` that hints at field name

#### 2.2 Inspect First Data Cell in Column 2

1. Using the element picker, click on the first data cell under "საწოლი"
2. This cell shows "ზაქარია" in the screenshot
3. In DevTools Elements panel, examine the HTML:
   - What is the `<td>` content?
   - Is there a `data-field` or `data-column` attribute?
   - Is the text "ზაქარია" directly in the cell or in a nested element?

#### 2.3 Run JavaScript to Extract Column 2 Data

Copy and paste this into the **Console** tab:

```javascript
// Extract all Column 2 data from the table
const extractColumn2Data = () => {
  // Find the table (adjust selector if needed)
  const table = document.querySelector('table');
  if (!table) {
    console.error('Table not found');
    return;
  }

  // Get header cells
  const headers = Array.from(table.querySelectorAll('thead th, thead td'));
  console.log('Headers found:', headers.length);

  // Get column 2 header (index 1, since 0-based)
  const col2Header = headers[1];
  console.log('Column 2 Header HTML:', col2Header.outerHTML);
  console.log('Column 2 Header Text:', col2Header.textContent.trim());
  console.log('Column 2 Header Attributes:', {
    id: col2Header.id,
    className: col2Header.className,
    dataField: col2Header.getAttribute('data-field'),
    dataColumn: col2Header.getAttribute('data-column'),
  });

  // Get all data rows
  const rows = Array.from(table.querySelectorAll('tbody tr'));
  console.log('Data rows found:', rows.length);

  // Extract Column 2 data from each row
  const col2Data = rows.map((row, idx) => {
    const cells = Array.from(row.querySelectorAll('td'));
    const col2Cell = cells[1]; // Column 2 (0-based index)

    if (!col2Cell) return null;

    return {
      rowIndex: idx,
      cellHTML: col2Cell.outerHTML,
      cellText: col2Cell.textContent.trim(),
      cellAttributes: {
        id: col2Cell.id,
        className: col2Cell.className,
        dataField: col2Cell.getAttribute('data-field'),
        dataColumn: col2Cell.getAttribute('data-column'),
      }
    };
  }).filter(Boolean);

  console.log('Column 2 Data (first 5 rows):', col2Data.slice(0, 5));

  return {
    header: {
      text: col2Header.textContent.trim(),
      html: col2Header.outerHTML,
      attributes: {
        id: col2Header.id,
        className: col2Header.className,
        dataField: col2Header.getAttribute('data-field'),
      }
    },
    data: col2Data
  };
};

// Run extraction
const col2Info = extractColumn2Data();

// Copy to clipboard (you can paste into a text file)
copy(JSON.stringify(col2Info, null, 2));

console.log('✅ Column 2 data copied to clipboard! Paste into a text file.');
```

**Expected Output**: JSON object with header info and cell data

**Action**: Save the JSON output to a file named `column2-extraction.json`

#### 2.4 Determine Column 2 Meaning

Based on the extracted data, answer:

- **Q1**: Does the header say "საწოლი" (Bed)?
- **Q2**: Does the data contain bed numbers (like "301", "A-12") OR first names (like "ზაქარია", "ალფერ")?
- **Q3**: Is there a mismatch between header and data?

**Decision Tree**:
- If header="საწოლი" AND data=bed numbers → Column is **Bed Number**
- If header="საწოლი" AND data=first names → Header is WRONG, column is **First Name**
- If header="სახელი" AND data=first names → Column is **First Name**

---

### Phase 3: Extract Dropdown Options 🟡

#### 3.1 Extract Doctor Dropdown

Copy and paste this into Console:

```javascript
// Extract all doctor options
const extractDoctorDropdown = () => {
  // Find the doctor dropdown (adjust selector based on inspection)
  const doctorSelect = document.querySelector('select[name*="doctor"], select[name*="ექიმი"], #doctor-select');

  if (!doctorSelect) {
    console.error('Doctor dropdown not found. Trying alternative selectors...');
    // Try to find ANY select element near the label
    const allSelects = document.querySelectorAll('select');
    console.log('All select elements found:', allSelects.length);
    allSelects.forEach((sel, idx) => {
      console.log(`Select ${idx}:`, {
        name: sel.name,
        id: sel.id,
        optionsCount: sel.options.length,
        firstOptionText: sel.options[0]?.text
      });
    });
    return null;
  }

  const options = Array.from(doctorSelect.options).map(opt => ({
    value: opt.value,
    text: opt.text.trim(),
    selected: opt.selected,
    disabled: opt.disabled
  }));

  const result = {
    elementInfo: {
      id: doctorSelect.id,
      name: doctorSelect.name,
      className: doctorSelect.className,
      totalOptions: options.length
    },
    options: options
  };

  console.log('Doctor dropdown options:', result);
  copy(JSON.stringify(result, null, 2));
  console.log('✅ Doctor dropdown data copied to clipboard!');

  return result;
};

extractDoctorDropdown();
```

**Action**: Save output to `doctor-dropdown-options.json`

#### 3.2 Extract Department Dropdown

```javascript
// Extract all department options
const extractDepartmentDropdown = () => {
  // Find the department dropdown
  const deptSelect = document.querySelector('select[name*="department"], select[name*="განყოფილება"], #department-select');

  if (!deptSelect) {
    console.error('Department dropdown not found. Trying alternative selectors...');
    const allSelects = document.querySelectorAll('select');
    console.log('All select elements found:', allSelects.length);
    allSelects.forEach((sel, idx) => {
      console.log(`Select ${idx}:`, {
        name: sel.name,
        id: sel.id,
        optionsCount: sel.options.length,
        firstOptionText: sel.options[0]?.text
      });
    });
    return null;
  }

  const options = Array.from(deptSelect.options).map(opt => ({
    value: opt.value,
    text: opt.text.trim(),
    selected: opt.selected,
    disabled: opt.disabled
  }));

  const result = {
    elementInfo: {
      id: deptSelect.id,
      name: deptSelect.name,
      className: deptSelect.className,
      totalOptions: options.length
    },
    options: options
  };

  console.log('Department dropdown options:', result);
  copy(JSON.stringify(result, null, 2));
  console.log('✅ Department dropdown data copied to clipboard!');

  return result;
};

extractDepartmentDropdown();
```

**Action**: Save output to `department-dropdown-options.json`

---

### Phase 4: Extract Form Field Details 🟡

#### 4.1 Extract All Form Elements

```javascript
// Extract complete form structure
const extractFormDetails = () => {
  // Find the filter form (adjust selector if needed)
  const form = document.querySelector('form');

  if (!form) {
    console.error('Form not found on page');
    return null;
  }

  const formData = {
    formAttributes: {
      id: form.id,
      name: form.name,
      action: form.action,
      method: form.method,
      className: form.className
    },
    fields: []
  };

  // Extract all input fields
  const inputs = form.querySelectorAll('input, select, textarea, button');

  inputs.forEach((el, idx) => {
    const fieldInfo = {
      index: idx,
      tagName: el.tagName.toLowerCase(),
      type: el.type,
      id: el.id,
      name: el.name,
      className: el.className,
      value: el.value,
      placeholder: el.placeholder,
      required: el.required,
      disabled: el.disabled,
      checked: el.checked, // for checkboxes
      maxLength: el.maxLength,
      pattern: el.pattern,
      // Get label if exists
      label: el.labels?.[0]?.textContent?.trim() ||
             document.querySelector(`label[for="${el.id}"]`)?.textContent?.trim() ||
             el.getAttribute('aria-label'),
      // Event handlers
      onclick: el.getAttribute('onclick'),
      onchange: el.getAttribute('onchange'),
      onsubmit: el.getAttribute('onsubmit'),
    };

    formData.fields.push(fieldInfo);
  });

  console.log('Form structure:', formData);
  copy(JSON.stringify(formData, null, 2));
  console.log('✅ Form data copied to clipboard!');

  return formData;
};

extractFormDetails();
```

**Action**: Save output to `form-field-details.json`

---

### Phase 5: Clarify "Transferred" Checkbox 🔴

#### 5.1 Inspect Checkbox Element

```javascript
// Find and inspect the "Transferred" checkbox
const inspectTransferredCheckbox = () => {
  // Find checkbox with Georgian label "გადწერილება"
  const checkbox = document.querySelector('input[type="checkbox"][name*="transfer"]') ||
                   document.querySelector('input[type="checkbox"]#transferred') ||
                   Array.from(document.querySelectorAll('input[type="checkbox"]'))
                     .find(cb => {
                       const label = cb.labels?.[0]?.textContent ||
                                    document.querySelector(`label[for="${cb.id}"]`)?.textContent;
                       return label?.includes('გადწერილება');
                     });

  if (!checkbox) {
    console.error('Transferred checkbox not found');
    return null;
  }

  const result = {
    checkboxInfo: {
      id: checkbox.id,
      name: checkbox.name,
      value: checkbox.value,
      checked: checkbox.checked,
      className: checkbox.className,
      dataAttributes: {}
    },
    label: checkbox.labels?.[0]?.textContent?.trim() ||
           document.querySelector(`label[for="${checkbox.id}"]`)?.textContent?.trim(),
    eventHandlers: {
      onclick: checkbox.getAttribute('onclick'),
      onchange: checkbox.getAttribute('onchange')
    }
  };

  // Extract all data-* attributes
  Array.from(checkbox.attributes).forEach(attr => {
    if (attr.name.startsWith('data-')) {
      result.checkboxInfo.dataAttributes[attr.name] = attr.value;
    }
  });

  console.log('Transferred checkbox details:', result);
  copy(JSON.stringify(result, null, 2));
  console.log('✅ Checkbox data copied to clipboard!');

  return result;
};

inspectTransferredCheckbox();
```

**Action**: Save output to `transferred-checkbox-details.json`

#### 5.2 Test Transferred Checkbox Behavior

**Manual Test**:
1. Check the "გადწერილება" (Transferred) checkbox
2. Click the search button
3. Go to DevTools **Network** tab
4. Look for the search request (likely a POST or GET to PHP script)
5. Inspect the request payload - what parameter is sent for the checkbox?

**Copy this code to monitor network requests**:

```javascript
// Monitor network requests when checkbox is toggled
console.log('🔍 Network monitoring active. Now toggle the checkbox and click search.');
console.log('Check the Network tab for requests.');

// You can also manually check the request payload in Network tab
// Look for parameters like:
// - transferred=1
// - is_transferred=true
// - patient_status=transferred
```

**Questions to Answer**:
- What parameter name is used? (e.g., `transferred`, `is_transferred`, `patient_transfer_status`)
- What value is sent? (`1`, `true`, `yes`, etc.)
- Does it filter for patients transferred FROM or TO this department?

---

### Phase 6: Capture API Endpoints 🟢

#### 6.1 Monitor Network Activity

1. Open DevTools **Network** tab
2. Click the search button (with no filters)
3. Look for XHR or Fetch requests
4. Identify the endpoint that returns patient data

**What to Document**:
- Request URL (full path)
- HTTP method (GET or POST)
- Request headers (especially Content-Type)
- Request payload (form data or JSON)
- Response format (JSON structure)

#### 6.2 Extract Request Details

**For each API call**:

1. Right-click the request in Network tab
2. Select "Copy" → "Copy as cURL"
3. Paste into a text file
4. Also select "Copy" → "Copy Response" to get the JSON structure

**Save these files**:
- `api-search-request.curl` - cURL command for search
- `api-search-response.json` - Example response
- `api-load-page.curl` - Initial page load request
- `api-load-page-response.json` - Initial data

---

### Phase 7: Extract Complete Page DOM 🟢

```javascript
// Extract complete page structure
const extractPageStructure = () => {
  const result = {
    pageTitle: document.title,
    url: window.location.href,

    // Main sections
    topNav: {
      html: document.querySelector('.top-nav, .navbar-top, [class*="top-nav"]')?.outerHTML?.substring(0, 5000),
      menuItems: Array.from(document.querySelectorAll('.top-nav a, .navbar-top a')).map(a => ({
        text: a.textContent.trim(),
        href: a.href
      }))
    },

    subMenu: {
      html: document.querySelector('.sub-menu, .submenu, [class*="sub-menu"]')?.outerHTML?.substring(0, 5000),
      items: Array.from(document.querySelectorAll('.sub-menu a, .submenu a')).map(a => ({
        text: a.textContent.trim(),
        href: a.href,
        active: a.classList.contains('active') || a.classList.contains('selected')
      }))
    },

    filterSection: {
      html: document.querySelector('form, .filters, [class*="filter"]')?.outerHTML?.substring(0, 10000)
    },

    tableSection: {
      html: document.querySelector('table')?.outerHTML?.substring(0, 20000),
      rowCount: document.querySelectorAll('table tbody tr').length,
      columnCount: document.querySelectorAll('table thead th, table thead td').length
    },

    // Extract all script tags (for validation logic)
    scripts: Array.from(document.querySelectorAll('script:not([src])')).map(s =>
      s.textContent.substring(0, 1000) // First 1000 chars of each inline script
    )
  };

  console.log('Page structure extracted');
  copy(JSON.stringify(result, null, 2));
  console.log('✅ Page structure copied to clipboard!');

  return result;
};

extractPageStructure();
```

**Action**: Save output to `complete-page-structure.json`

---

### Phase 8: Verify Additional Columns/Elements 🟢

#### 8.1 Check for Hidden Columns

```javascript
// Check if there are more columns off-screen
const checkHiddenColumns = () => {
  const table = document.querySelector('table');
  if (!table) return;

  const headers = Array.from(table.querySelectorAll('thead th, thead td'));
  const firstRowCells = Array.from(table.querySelectorAll('tbody tr:first-child td'));

  console.log('Total header columns:', headers.length);
  console.log('Total data columns:', firstRowCells.length);

  headers.forEach((th, idx) => {
    const rect = th.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0;
    console.log(`Column ${idx + 1}: "${th.textContent.trim()}" - Visible: ${isVisible}`);
  });

  // Check for horizontal scroll
  const tableContainer = table.parentElement;
  const hasHorizontalScroll = tableContainer.scrollWidth > tableContainer.clientWidth;
  console.log('Table has horizontal scroll:', hasHorizontalScroll);

  if (hasHorizontalScroll) {
    console.warn('⚠️ Table is wider than viewport - some columns may be hidden!');
    console.log('Table width:', tableContainer.scrollWidth);
    console.log('Viewport width:', tableContainer.clientWidth);
  }
};

checkHiddenColumns();
```

#### 8.2 Check for Action Buttons

```javascript
// Look for edit/delete/view action buttons
const findActionButtons = () => {
  // Common patterns for action buttons
  const selectors = [
    'a[href*="edit"]',
    'button[class*="edit"]',
    'i[class*="edit"]',
    'a[href*="delete"]',
    'button[class*="delete"]',
    'i[class*="trash"]',
    'td.actions',
    'td:last-child a',
    'td:last-child button'
  ];

  const actions = [];
  selectors.forEach(sel => {
    const elements = document.querySelectorAll(sel);
    if (elements.length > 0) {
      actions.push({
        selector: sel,
        count: elements.length,
        examples: Array.from(elements).slice(0, 3).map(el => ({
          html: el.outerHTML,
          text: el.textContent.trim(),
          href: el.href
        }))
      });
    }
  });

  console.log('Action buttons found:', actions);
  copy(JSON.stringify(actions, null, 2));
  console.log('✅ Action buttons data copied to clipboard!');

  return actions;
};

findActionButtons();
```

---

## Data Collection Checklist

Use this checklist to track your progress:

### Critical Items 🔴

- [ ] **Column 2 Mystery Resolved**
  - [ ] Extracted header HTML
  - [ ] Extracted cell data HTML
  - [ ] Determined if "საწოლი" means Bed or is mislabeled
  - [ ] Updated table-structure.md with verified mapping
  - [ ] Saved `column2-extraction.json`

- [ ] **Transferred Checkbox Clarified**
  - [ ] Extracted checkbox element details
  - [ ] Tested checkbox behavior (toggled and searched)
  - [ ] Captured network request parameters
  - [ ] Determined business logic (what "transferred" means)
  - [ ] Saved `transferred-checkbox-details.json`

- [ ] **Dropdown Options Complete**
  - [ ] Extracted all doctor options (with IDs and names)
  - [ ] Extracted all department options (with IDs and names)
  - [ ] Saved `doctor-dropdown-options.json`
  - [ ] Saved `department-dropdown-options.json`

### Important Items 🟡

- [ ] **Form Field Details**
  - [ ] Extracted all form field IDs and names
  - [ ] Documented field types and validation
  - [ ] Identified required vs optional fields
  - [ ] Saved `form-field-details.json`

- [ ] **API Endpoints**
  - [ ] Captured initial page load request
  - [ ] Captured search/filter request
  - [ ] Documented request/response formats
  - [ ] Saved cURL commands and JSON responses

### Nice-to-Have Items 🟢

- [ ] **Page DOM Structure**
  - [ ] Extracted complete page HTML
  - [ ] Documented section hierarchy
  - [ ] Saved `complete-page-structure.json`

- [ ] **Additional Elements**
  - [ ] Checked for hidden columns
  - [ ] Found action buttons (edit/delete/view)
  - [ ] Verified pagination elements
  - [ ] Documented any modals/popups

---

## File Outputs Expected

After completing all steps, you should have these files:

1. ✅ `column2-extraction.json` - Column 2 header and data
2. ✅ `doctor-dropdown-options.json` - Complete doctor list
3. ✅ `department-dropdown-options.json` - Complete department list
4. ✅ `transferred-checkbox-details.json` - Checkbox element and behavior
5. ✅ `form-field-details.json` - All form fields with IDs/names
6. ✅ `api-search-request.curl` - Search API cURL command
7. ✅ `api-search-response.json` - Search API response example
8. ✅ `complete-page-structure.json` - Full page DOM structure
9. ✅ `network-requests-log.txt` - Notes about API endpoints

**Save all files to**: `/Users/toko/Desktop/medplum_medimind/documentation/my-patients/extraction-data/`

---

## Next Steps After Extraction

Once you have all the files above:

1. **Review the data** - Check for any errors or incomplete data
2. **Update documentation** - Use the extracted data to update the 8 documentation files
3. **Resolve discrepancies** - Answer the 3 critical questions (column 2, transferred, dropdowns)
4. **Mark completion** - Update EXTRACTION-SUMMARY.md to 100% complete
5. **Begin implementation** - Start building the MyPatientsView component in Medplum

---

## Troubleshooting

### "Script returns null or undefined"

**Cause**: Selector didn't find the element

**Solution**:
1. Inspect the page manually to find the element
2. Right-click the element → Inspect
3. Note the element's ID, class, or other attributes
4. Adjust the selector in the script

Example:
```javascript
// If this doesn't work:
const select = document.querySelector('select[name="doctor"]');

// Try these alternatives:
const select = document.querySelector('#doctor-select');
const select = document.querySelectorAll('select')[0]; // First select on page
const select = document.querySelector('select.doctor-dropdown');
```

### "copy() is not defined"

**Cause**: `copy()` function only works in Chrome DevTools

**Solution**:
1. Use Chrome browser
2. OR manually copy the output from console.log()
3. OR use this alternative:

```javascript
// Instead of copy(), use this:
const data = extractDoctorDropdown();
console.log(JSON.stringify(data, null, 2));
// Then manually select and copy the output
```

### "Cannot read property of null"

**Cause**: Element not found or page not fully loaded

**Solution**:
1. Wait for page to fully load (check for loading spinners)
2. Scroll down to ensure all elements are in DOM
3. Check if you're on the correct page (ჩემი პაციენტები)

### Georgian characters showing as "??????"

**Cause**: Console encoding issue

**Solution**:
1. This is just a display issue in console
2. When you paste into a text file, characters should appear correctly
3. Ensure your text editor supports UTF-8 encoding

---

## Support

If you encounter issues during extraction:

1. **Check the console for errors** - Red error messages will guide you
2. **Inspect elements manually** - Use DevTools Elements tab to verify selectors
3. **Try alternative selectors** - Each script includes fallback options
4. **Document what you find** - Even partial data is helpful

---

## Completion Criteria

You can mark this extraction as **100% complete** when:

- ✅ All 9 files saved with actual data (not just templates)
- ✅ Column 2 mystery resolved (know if it's Bed or First Name)
- ✅ Transferred checkbox business logic documented
- ✅ Complete dropdown option lists (doctors and departments)
- ✅ Form field IDs and names verified
- ✅ At least 1 API endpoint documented with request/response

**Time Estimate**: 30-45 minutes for thorough extraction

---

## Final Notes

- **Be thorough** - Extract EVERYTHING, even if it seems redundant
- **Document unknowns** - If you can't determine something, note it
- **Save raw data** - Keep the original JSON files for reference
- **Take screenshots** - If something is visually important, screenshot it
- **Ask questions** - If business logic is unclear, note it for user interviews

Good luck! 🚀
