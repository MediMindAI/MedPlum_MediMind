# Services Nomenclature Modal - Complete Field Mapping

**Generated**: 2025-11-18
**Source**: http://178.134.21.82:8008/clinic.php
**Modal Type**: Medical Services (Consultations, Operations, Lab Studies)

## Overview

The services modal contains **4 tabs** with **all content loaded simultaneously** (no tab switching required for extraction). The modal displays detailed information about medical services including pricing, personnel, medical components, and metadata.

## Modal Structure

```
კარდიოქირურგიის კონსულტაციია
├── ფინანსური (Financial Tab)
├── სახელფასო (Salary Tab)
├── სამედიცინო (Medical Tab)
└── ატრიბუტები (Attributes Tab)
```

---

## Tab 1: ფინანსური (Financial)

### Primary Tables

#### Insurance Pricing Table
**Identification**: 40-60 rows, 4 columns
**Location**: Usually Table 5 in modal
**Structure**:
```
Column 0: Company Name (დასახელება)
Column 1: Date (თარიღი)
Column 2: Price (ფასი)
Column 3: Currency (ვალუტა)
```

**Extraction Pattern**:
```javascript
if (rowCount >= 40 && rowCount <= 60 && columnCount >= 4) {
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    data.financial.insurance_companies.push({
      company_name: cells[0]?.textContent.trim(),
      date: cells[1]?.textContent.trim(),
      price: cells[2]?.textContent.trim(),
      currency: cells[3]?.textContent.trim()
    });
  });
}
```

**Sample Data**:
- შიდა სიდანდიარი | 01-01-2023 | 100 | ლარი
- სისიპ ჯანმრთელობის ეროვნული სააგენტო | 01-01-2023 | 100 | ლარი
- თერადპელი | 01-01-2023 | 100 | ლარი

### Text Input Fields

#### GIS Code
**Type**: Text input
**Identification**: Long UUID-like string (>30 chars with dashes)
**Extraction**:
```javascript
const allInputs = modal.querySelectorAll('input[type="text"]');
allInputs.forEach(input => {
  const value = input.value?.trim();
  if (value && value.length > 30 && value.includes('-')) {
    data.financial.gis_code = value;
  }
});
```

**Sample**: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

### Dropdown Fields

**Total**: ~14 configuration dropdowns

#### Key Dropdowns to Extract:

1. **Calculation Theme** (კალკულაციის თემა)
   - Values: "მორჩილად", "არაპირდაპირი", etc.

2. **Calculation Counting** (კალკულაციის დათვლა)
   - Values: "დათვლად", etc.

3. **Calculation Display** (კალკულაციის ჩვენება)

4. **Department Assignment** (განყოფილებაში)
   - Values: "არის განყოფილებაში", "არ არის განყოფილებაში"

5. **Payment Calculation** (გადახდის კალკულაცია)
   - Values: "გადახდასდელი", "ჩანს", etc.

6. **Payment Type** (გადახდის ტიპი)
   - Values: "ფაქტიური", "ტარიფის", etc.

7. **Lab Analysis** (ლაბორატორია)

8. **Wait Result** (შედეგის მოლოდინი)
   - Values: "კი", "არა"

9. **Patient History Match** (პაციენტის ისტორიის შესატყვისობა)
   - Values: "აქტიური", etc.

10. **Consilium Theme** (კონსილიუმის თემა)

**Extraction Pattern**:
```javascript
const allSelects = modal.querySelectorAll('select');
allSelects.forEach(select => {
  const selectedOption = select.options[select.selectedIndex];
  const value = selectedOption?.text?.trim();

  if (!value || value.length === 0 || value === '0') return;

  // Map by Georgian text patterns
  if (value.includes('მორჩილად') || value.includes('არაპირდაპირი')) {
    data.financial.calculation_theme = value;
  } else if (value.includes('დათვლად')) {
    data.financial.calculation_counting = value;
  }
  // ... more mappings
});
```

### Other Tables

#### Repeat Services Table
**Usually empty, variable rows**

#### Insurance Percentages Table
**Usually empty, variable rows**

#### Studies Table
**Usually empty, variable rows**

#### Consumables Table
**Usually empty, variable rows**

---

## Tab 2: სახელფასო (Salary)

### Configuration Dropdowns

#### Salary Type
**Values**: "ქვეკით", "ზევით", etc.

#### Insurance Type
**Values**: "დაზღვეული", etc.

### Performer Tables

**Structure**: 1-5 rows, 6+ columns
**Identification**: Contains text like "შემსრულებელი", "ოპერატორი", "მიქრო", "პრივანა"

**Columns**:
```
Column 0: Performer Type (შემსრულებელი/ოპერატორი/etc.)
Column 1: Micro Type (მიქრო/პრივანა/etc.)
Column 2: Value 1
Column 3: Checkbox (checked/unchecked)
Column 4: Value 2
Column 5: Total (optional)
```

**Extraction Pattern**:
```javascript
if (rowCount >= 1 && rowCount <= 5) {
  const firstRow = rows[0];
  const cells = firstRow?.querySelectorAll('td');
  const cell0 = cells[0]?.textContent.trim() || '';
  const cell1 = cells[1]?.textContent.trim() || '';

  if (cell0.includes('შემსრულებელი') || cell0.includes('ოპერატორი') ||
      cell1.includes('მიქრო') || cell1.includes('პრივანა')) {

    rows.forEach(row => {
      const salaryCells = row.querySelectorAll('td');
      if (salaryCells.length >= 5) {
        data.salary.tables.push({
          performer_type: extractValue(salaryCells[0]),
          micro_type: extractValue(salaryCells[1]),
          value_1: salaryCells[2]?.textContent.trim() || '',
          checked: salaryCells[3]?.querySelector('input[type="checkbox"]')?.checked || false,
          value_2: salaryCells[4]?.textContent.trim() || '',
          total: salaryCells.length >= 6 ? salaryCells[5]?.textContent.trim() || '' : ''
        });
      }
    });
  }
}
```

---

## Tab 3: სამედიცინო (Medical)

### Samples Table (CRITICAL FOR LAB TESTS)

**Identification**: 2-10 rows, contains "K2EDTA", "ESR", "Sod.Cit" or color bars
**Location**: Variable position in modal

**Structure**:
```
Column 0: Color Bar (visual indicator with RGB background)
Column 1: Sample Code (K2EDTA, ESR, Sod.Cit, etc.)
Column 2: Description
Column 3: Biomat Type
```

**Extraction Pattern**:
```javascript
if (rowCount >= 2 && rowCount <= 10) {
  const firstRow = rows[0];
  const cells = firstRow?.querySelectorAll('td');
  const cellText = cells[1]?.textContent.trim() || '';

  if (cellText.includes('K2EDTA') || cellText.includes('ESR') || cellText.includes('Sod.Cit')) {
    rows.forEach(row => {
      const sampleCells = row.querySelectorAll('td');
      if (sampleCells.length >= 3) {
        // Extract color from first cell
        let color = '';
        const colorBar = sampleCells[0]?.querySelector('[style*="background"]');
        if (colorBar) {
          color = window.getComputedStyle(colorBar).backgroundColor;
        }

        // Extract selected values from dropdowns (NOT all options!)
        const sampleCode = extractSelectedValue(sampleCells[1]);
        const description = extractSelectedValue(sampleCells[2]);
        const biomatType = extractSelectedValue(sampleCells[3]);

        data.medical.samples.push({
          sample_code: sampleCode,
          color: color,
          description: description,
          biomat_type: biomatType
        });
      }
    });
  }
}
```

**Color Extraction**:
```javascript
function getRGBColor(element) {
  if (!element) return null;
  return window.getComputedStyle(element).backgroundColor;
}
```

**Sample Data**:
```
rgb(128, 0, 128) | K2EDTA | Purple top tube | Whole blood
rgb(255, 0, 0)   | ESR    | Red top tube    | Serum
```

### Components Table (TEST CODES FOR LAB TESTS)

**Identification**: 5-15 rows, contains test codes like "PT", "INR", "APTT", "TT", "FIBR"
OR contains K2EDTA sample IDs with colored backgrounds

**Structure**:
```
Column 0: Sample ID (may be dropdown, K2EDTA code, or UUID)
Column 1: Test Code (PT, INR, APTT, TT, FIBR, etc.)
Column 2: Test Name (Georgian description)
```

**Extraction Pattern**:
```javascript
if (rowCount >= 5 && rowCount <= 15) {
  const firstRow = rows[0];
  const cells = firstRow?.querySelectorAll('td');
  const cell0Text = cells[0]?.textContent.trim() || '';
  const cell1Text = cells[1]?.textContent.trim() || '';

  if (cell1Text === 'PT' || cell1Text === 'INR' || cell1Text === 'APTT' ||
      cell1Text === 'TT' || cell1Text === 'FIBR' ||
      cell0Text.includes('K2EDTA') || cell0Text.includes('630f61fc')) {

    rows.forEach(row => {
      const compCells = row.querySelectorAll('td');
      if (compCells.length >= 3) {
        const sampleId = extractSelectedValue(compCells[0]);
        const testCode = extractSelectedValue(compCells[1]);
        const testName = extractSelectedValue(compCells[2]);

        if (testCode && testCode.length > 0 && testCode !== 'კოდი') {
          data.medical.components.push({
            sample_id: sampleId,
            test_code: testCode,
            test_name: testName
          });
        }
      }
    });
  }
}
```

**Sample Data**:
```
K2EDTA | PT    | პროთრომბინის დრო
K2EDTA | INR   | საერთაშორისო ნორმალიზებული ფარდობა
K2EDTA | APTT  | აქტიური ნაწილობრივი თრომბოპლასტინური დრო
K2EDTA | TT    | თრომბინის დრო
K2EDTA | FIBR  | ფიბრინოგენის კონცენტრაცია
```

### LIS Integration

#### LIS Enabled Checkbox
**Type**: Checkbox
**Label**: Contains "LIS"

**Extraction**:
```javascript
const lisCheckbox = Array.from(modal.querySelectorAll('input[type="checkbox"]')).find(cb => {
  const label = findLabelForCheckbox(cb);
  return label && label.includes('LIS');
});

if (lisCheckbox) {
  data.medical.lis_integration.enabled = lisCheckbox.checked;
}
```

#### LIS Provider Dropdown
**Type**: Select
**Options**: "WebLab", "Limbach", "TerraLab", etc.

**Extraction**:
```javascript
const lisDropdowns = Array.from(modal.querySelectorAll('select')).filter(select => {
  const options = Array.from(select.options).map(o => o.text);
  return options.some(o => o.includes('WebLab') || o.includes('Limbach') || o.includes('TerraLab'));
});

if (lisDropdowns.length > 0) {
  const selectedOption = lisDropdowns[0].options[lisDropdowns[0].selectedIndex];
  data.medical.lis_integration.provider = selectedOption?.text?.trim() || '';
}
```

---

## Tab 4: ატრიბუტები (Attributes)

**NOTE**: This tab is NOT currently extracted by the existing script!

### Color Picker

**Type**: Text input
**Format**: Hex color (#RRGGBB)
**Example**: #FF5733

**Extraction**:
```javascript
const allInputs = modal.querySelectorAll('input[type="text"]');
allInputs.forEach(input => {
  const value = input.value?.trim();
  if (value && value.startsWith('#') && value.length === 7) {
    data.attributes.color = value;
  }
});
```

### Active Dates

**Type**: 2 date inputs
**Fields**: Start Date, End Date

**Extraction**:
```javascript
const dateInputs = modal.querySelectorAll('input[type="date"], input[placeholder*="თარიღ"]');
if (dateInputs.length >= 2) {
  data.attributes.active_dates.start = dateInputs[0]?.value || '';
  data.attributes.active_dates.end = dateInputs[1]?.value || '';
}
```

### Color Tags (ტევები)

**Type**: Badge/tag elements with remove buttons
**Variable count**: 0-10+ tags

**Extraction**:
```javascript
// Method 1: Look for elements with remove buttons
const tagElements = modal.querySelectorAll('[onclick*="remove"], [title*="წაშლა"], .tag, .badge');
tagElements.forEach(elem => {
  const tagText = elem.textContent?.trim();
  if (tagText && tagText.length > 2 && !tagText.includes('×') && !tagText.includes('X')) {
    if (!data.attributes.color_tags.includes(tagText)) {
      data.attributes.color_tags.push(tagText);
    }
  }
});

// Method 2: Look for section with "ტევები" header
const headers = modal.querySelectorAll('div, span, label');
headers.forEach(header => {
  if (header.textContent?.includes('ტევები') || header.textContent?.includes('ტევი')) {
    const section = header.closest('div[class*="section"], div[class*="group"], fieldset');
    if (section) {
      const tagItems = section.querySelectorAll('div, span');
      tagItems.forEach(item => {
        const text = item.textContent?.trim();
        const hasRemoveButton = item.parentElement?.querySelector('[onclick], button, [class*="remove"]');
        if (hasRemoveButton && text && text.length > 5 && !text.includes('ტევი')) {
          if (!data.attributes.color_tags.includes(text)) {
            data.attributes.color_tags.push(text);
          }
        }
      });
    }
  }
});
```

### Various Codes Table (სხვადასხვა კოდები)

**Identification**: Table with headers "ფილიალი | განყოფილება" (Branch | Department)
**Structure**:
```
Column 0: Branch (ფილიალი)
Column 1: Department (განყოფილება)
Column 2: Additional info (optional)
```

**Extraction**:
```javascript
tables.forEach((table, index) => {
  const rows = table.querySelectorAll('tbody tr');
  const headerRow = table.querySelector('thead tr');

  if (headerRow) {
    const headerText = headerRow.textContent;
    if (headerText.includes('ფილიალი') && headerText.includes('განყოფილება')) {
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
          data.attributes.various_codes.push({
            branch: cells[0]?.textContent.trim() || '',
            department: cells[1]?.textContent.trim() || '',
            additional: cells.length >= 3 ? cells[2]?.textContent.trim() || '' : ''
          });
        }
      });
    }
  }
});
```

---

## Helper Functions

### Extract Selected Value from Dropdown or Text

```javascript
function extractSelectedValue(cell) {
  if (!cell) return '';

  // Check if cell contains a dropdown
  const select = cell.querySelector('select');
  if (select) {
    const selectedOption = select.options[select.selectedIndex];
    return selectedOption?.text?.trim() || '';
  }

  // Otherwise get text content
  return cell.textContent.trim() || '';
}
```

### Find Label for Checkbox

```javascript
function findLabelForCheckbox(checkbox) {
  // Try by ID
  const id = checkbox.id;
  if (id) {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) return label.textContent.trim();
  }

  // Try parent label
  const parentLabel = checkbox.closest('label');
  if (parentLabel) return parentLabel.textContent.trim();

  // Try sibling
  let prev = checkbox.previousElementSibling;
  while (prev) {
    if (prev.tagName === 'LABEL' || prev.tagName === 'SPAN') {
      return prev.textContent.trim();
    }
    prev = prev.previousElementSibling;
  }

  // Try parent's sibling
  const parent = checkbox.parentElement;
  if (parent) {
    let prevParent = parent.previousElementSibling;
    while (prevParent) {
      if (prevParent.tagName === 'LABEL' || prevParent.tagName === 'SPAN') {
        return prevParent.textContent.trim();
      }
      prevParent = prevParent.previousElementSibling;
    }
  }

  return '';
}
```

---

## Extraction Strategy Summary

### Current Script Strengths
✅ Correctly extracts SELECTED values (not all options) from dropdowns
✅ Identifies insurance table (40-60 rows)
✅ Identifies samples table (K2EDTA keywords + 2-10 rows)
✅ Identifies components table (PT/INR keywords + 5-15 rows)
✅ Extracts RGB colors from color bars
✅ Extracts LIS integration fields
✅ Handles dropdown vs text fields properly

### Missing/Incomplete Extractions
❌ Attributes tab entirely missing (color, dates, tags, codes table)
❌ Some Financial tab dropdowns not mapped
⚠️ GIS code extraction relies on length heuristic (could be more robust)
⚠️ No validation of extracted data completeness
⚠️ Limited error handling

### Recommendations for Robust Script

1. **Add Attributes Tab Extraction**
   - Priority: HIGH
   - Impact: Completes data model

2. **Map All Financial Dropdowns**
   - Priority: MEDIUM
   - Impact: Better configuration data

3. **Add Data Validation**
   - Priority: MEDIUM
   - Check field counts per section
   - Warn if critical fields missing

4. **Improve Error Handling**
   - Priority: MEDIUM
   - Try/catch per section
   - Continue on errors, don't fail entire extraction

5. **Add Extraction Statistics**
   - Priority: LOW
   - Log "Extracted X/Y fields from Tab"
   - Help debug incomplete extractions

---

## Table Index Reference

**Based on analysis, typical table positions**:

- Table 0-4: Variable configuration/filter tables
- Table 5: **Insurance Pricing (40-60 rows)** ← CRITICAL
- Table 6-15: Variable salary/performer tables
- Table 16: **Samples Table (2-10 rows with colors)** ← CRITICAL for lab tests
- Table 17: **Components Table (5-15 rows with test codes)** ← CRITICAL for lab tests
- Table 18+: Variable attributes/codes tables

**Note**: Table positions can vary! Always use multi-factor identification (row count + content + structure)
