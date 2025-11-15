# Print Receipt Window (ბეჭდ ხელბაშრიმე)

## Overview

**Window Title**: ბეჭდ ხელბაშრიმე (Print Receipt/Document)

**Purpose**: This window allows users to configure and print/generate receipts or documents for patient registrations, including registration details, demographics, and payment information.

**Access Method**: Opened by clicking the "pen icon" button next to a patient entry in the Patient History list

**Created By**: თამარ ბედიაშვილი (Tamar Bediashvili)
**Creation Date**: 2025-11-10 20:39:58

**Source**:
- URL: http://178.134.21.82:8008/index.php (Patient History section)
- Screenshot: `.playwright-mcp/patient-history-current-state.png`
- Extraction Date: 2025-11-10

---

## Window Structure

The window is organized into 3 main collapsible sections:

1. **რეგისტრაცია** (Registration) - Section 1
2. **დემოგრაფია** (Demographics) - Section 2
3. **დახდვები** (Payments) - Section 3 (with checkbox toggle)

---

## Section 1: რეგისტრაცია (Registration)

### Fields

| Field ID | Label (Georgian) | Label (English) | Type | Required | Validation | Default Value | Notes |
|----------|------------------|-----------------|------|----------|------------|---------------|-------|
| TBD | თარიღი | Date | datetime-local | Yes (*) | Valid date format | 2025-11-10 20:30 | Registration date and time |
| TBD | მომსხარების ტიპი | Service Type | select | Yes (*) | Must select from list | გადაუდებელი სტაციონარული | Type of medical service |
| TBD | სიკ. ნომერი | Case Number | text | No | Numeric | 10357-2025 | Case/visit identifier |
| TBD | მომსხარების ტიპი | Service Type Status | select | No | Must select from list | თვითოდენება | Service status/category |
| TBD | კომენტარი | Comment | textarea | No | Text | (empty) | Additional notes |
| TBD | ტექი | Tag | select | No | Must select from list | (empty) | Document tag/category |

**Service Type (მომსხარების ტიპი) - Currently Selected**: გადაუდებელი სტაციონარული (Emergency Inpatient)

**Service Status (მომსხარების ტიპი) - Currently Selected**: თვითოდენება (Self-identification)

**Note**: Fields marked with (*) appear to be required based on visual indicators in the UI.

---

## Section 2: დემოგრაფია (Demographics)

### Fields

| Field ID | Label (Georgian) | Label (English) | Type | Required | Validation | Default Value | Notes |
|----------|------------------|-----------------|------|----------|------------|---------------|-------|
| TBD | რეგიონი | Region | select | No | Must select from list | 04 - თბილისი | Patient's region |
| TBD | რაიონი | District | select | No | Must select from list | 0414 - საბურთალო | Patient's district |
| TBD | ქალაქი | City | text | No | Text | (empty) | Patient's city |
| TBD | ფაქტიური მისამართი | Actual Address | text | No | Text | (empty) | Patient's actual address |
| TBD | განათლება | Education | select | No | Must select from list | (empty) | Patient's education level |
| TBD | ოჯახური მდგომარეობა | Marital Status | select | No | Must select from list | (empty) | Patient's marital status |
| TBD | დასაქმება | Employment | select | No | Must select from list | (empty) | Patient's employment status |

**Region (რეგიონი) - Currently Selected**: 04 - თბილისი (Tbilisi)

**District (რაიონი) - Currently Selected**: 0414 - საბურთალო (Saburtalo)

---

## Section 3: დაზღვევა (Insurance)

**Section Toggle**: ☑ Checkbox (Currently CHECKED)

This section contains TWO identical sub-sections for insurance coverage:
1. **პირველი მზღვეველი** (Primary Insurance Provider)
2. **მეორე მზღვეველი** (Secondary Insurance Provider)

### Sub-section: პირველი მზღვეველი (Primary Insurance Provider)

| Field ID | Label (Georgian) | Label (English) | Type | Required | Validation | Default Value | Notes |
|----------|------------------|-----------------|------|----------|------------|---------------|-------|
| TBD | კომპანია | Company | select | No | Must select from list | იმედი L | Insurance company name |
| TBD | ტაში | Policy Type | select | No | Must select from list | (empty) | Type of insurance policy |
| TBD | პოლისის # | Policy Number | text | No | Alphanumeric | (empty) | Insurance policy number |
| TBD | მოწოდების # | Supply/Claim Number | text | No | Alphanumeric | (empty) | Insurance claim reference number |
| TBD | ვადების თარიღი | Validity Date | text | No | Date format | (empty) | Insurance policy expiration date |
| TBD | მოწმობების დამა | Certificate Issuer | text | No | Text | (empty) | Who issued the insurance certificate |
| TBD | თანადაფარვადენის % | Co-payment Percentage | text | No | Numeric, 0-100 | 0 | Patient co-payment percentage |

**Company (კომპანია) - Currently Selected**: იმედი L (Imedi L)

**Note**: Field labels differ from previous extraction - correct labels based on 2025-11-10 screenshot:
- "ტაში" (Policy Type) not "ტიპი"
- "მოწოდების #" (Supply/Claim Number) not "მიმართვის #"
- "ვადების თარიღი" (Validity Date) not "გადევნის თარიღი"
- "მოწმობების დამა" (Certificate Issuer) - new field identified
- "თანადაფარვადენის %" (Co-payment Percentage) not "თანაგადახდის %"

### Sub-section: მეორე მზღვეველი (Secondary Insurance Provider)

Identical field structure to Primary Insurance Provider section.

| Field ID | Label (Georgian) | Label (English) | Type | Required | Validation | Default Value | Notes |
|----------|------------------|-----------------|------|----------|------------|---------------|-------|
| TBD | კომპანია | Company | select | No | Must select from list | (empty) | Insurance company name |
| TBD | ტაში | Policy Type | select | No | Must select from list | (empty) | Type of insurance policy |
| TBD | პოლისის # | Policy Number | text | No | Alphanumeric | (empty) | Insurance policy number |
| TBD | მოწოდების # | Supply/Claim Number | text | No | Alphanumeric | (empty) | Insurance claim reference number |
| TBD | ვადების თარიღი | Validity Date | text | No | Date format | (empty) | Insurance policy expiration date |
| TBD | მოწმობების დამა | Certificate Issuer | text | No | Text | (empty) | Who issued the insurance certificate |
| TBD | თანადაფარვადენის % | Co-payment Percentage | text | No | Numeric, 0-100 | 0 | Patient co-payment percentage |

---

## Buttons and Actions

| Button Text | Location | Action | Notes |
|-------------|----------|--------|-------|
| X | Top-right corner | Close window | Closes the window without saving |
| საბ (48) / საბ (51) | Bottom-right corner | Unknown action | Number in parentheses changes (48→51 observed), suggesting dynamic counting or status |

**Note**: The "საბ" button's number appears to be dynamic and changes based on some criteria (possibly counting selected items, fields, or records).

---

## Dropdown Options

### Service Type Dropdown (მომსხარების ტიპი)

**Note**: This dropdown contains a very large number of options (causes browser evaluation to exceed token limits). Options include various service types such as:

- გადაუდებელი სტაციონარული (Emergency Inpatient) - Currently selected
- [Additional options to be extracted - see appendix]

**Action Required**: Create separate appendix file for complete service type list.

### Service Status Dropdown (მომსხარების ტიპი - Second dropdown)

**Currently Selected**: თვითოდენება (Self-identification)

Options include:
- თვითოდენება (Self-identification)
- [Additional options to be extracted]

### Region Dropdown (რეგიონი)

**Currently Selected**: 04 - თბილისი

Options include numbered regions with format: `[code] - [name]`
- 04 - თბილისი (Tbilisi)
- [Additional options to be extracted]

### District Dropdown (რაიონი)

**Currently Selected**: 0414 - საბურთალო

Options include numbered districts with format: `[code] - [name]`
- 0414 - საბურთალო (Saburtalo)
- [Additional options to be extracted - likely depends on selected region]

### Education Dropdown (განათლება)

Options to be extracted.

### Marital Status Dropdown (ოჯახური მდგომარეობა)

Options to be extracted.

### Employment Status Dropdown (დასაქმება)

Options to be extracted.

### Company Dropdown (კომპანია) - First Payment Method

**Currently Selected**: იმედი L (Imedi L)

Options include insurance companies and payment providers:
- იმედი L (Imedi L)
- [Additional options to be extracted]

### Company Dropdown (კომპანია) - Second Payment Method

Same options as first payment method dropdown.

### Payment Type Dropdown (ტიპი)

Options to be extracted - likely includes payment method types.

### Tag Dropdown (ტექი)

Options to be extracted - likely includes document categorization tags.

---

## Validation Rules

### Required Fields
- **თარიღი** (Date): Must be provided
- **მომსხარების ტიპი** (Service Type): Must be selected from dropdown

### Date Fields
- **თარიღი** (Date): Must be valid datetime format
- **გადევნის თარიღი** (Payment Date): Must be valid date format
- **მოქმედების ვადა** (Validity Period): Must be valid date format

### Numeric Fields
- **თანაგადახდის %** (Co-payment %): Must be numeric, range 0-100

### Text Fields
- **კომენტარი** (Comment): Free text, no specific validation visible
- **პოლისის #** (Policy #): Alphanumeric
- **მიმართვის #** (Reference #): Alphanumeric

---

## Conditional Logic

### Insurance Section Visibility
- The entire "დაზღვევა" (Insurance) section appears/disappears based on the checkbox state
- When checkbox is CHECKED (☑): Both insurance provider sub-sections are visible
- When checkbox is UNCHECKED (☐): Insurance sections are hidden

### Region-District Dependency
- The District (რაიონი) dropdown options likely depend on the selected Region (რეგიონი)
- Changing region should update available districts

---

## Workflow

```mermaid
flowchart TD
    A[User clicks pen icon on patient entry] --> B[Print Receipt Window Opens]
    B --> C{Review/Edit Registration Data}
    C --> D[Section 1: Registration Details]
    C --> E[Section 2: Demographics]
    C --> F{Include Payments?}
    F -->|Yes| G[Check Payments Checkbox]
    F -->|No| H[Uncheck Payments Checkbox]
    G --> I[Fill Payment Method 1]
    I --> J{Second Payment Method?}
    J -->|Yes| K[Fill Payment Method 2]
    J -->|No| L[Save/Print]
    K --> L
    H --> L
    D --> C
    E --> C
    L --> M[Receipt Generated]
    M --> N[Window Closes]
```

---

## Integration Points

### Input Data Sources
- **Patient Registration Data**: Pre-populated from selected patient's registration record
- **Demographics Data**: Pre-populated from patient's demographic information
- **Payment Data**: Pre-populated from patient's insurance/payment records

### Output/Actions
- **Generate Receipt/Document**: Creates printable receipt with selected information
- **Update Records**: May update patient record with any changes made
- **Print**: Sends document to printer or generates PDF

---

## Data Extraction Status

### ✅ Completed
- Window structure and layout
- Field identification and labels
- Section organization
- Basic validation rules
- Workflow diagram

### ⚠️ Partially Completed
- Dropdown option lists (many dropdowns have large option sets causing extraction issues)
- Field IDs (need to be extracted via browser tools)
- Complete button list (bottom of window not visible)

### ❌ Pending
- Complete dropdown option extraction for all fields
- Exact field IDs and name attributes
- Bottom button actions (Save, Print, Cancel, etc.)
- JavaScript validation logic
- Field dependencies and auto-population logic
- Testing checkbox toggle behavior
- Testing date picker interfaces
- Testing region-district cascading behavior

---

## Next Steps

1. **Scroll down** to see bottom buttons and additional fields
2. **Extract dropdown options** for each select field (create appendix files for large lists)
3. **Click checkbox** to test Payments section visibility toggle
4. **Click date fields** to document date picker interface
5. **Change region** to test district dropdown cascade
6. **Extract field IDs** using targeted browser queries
7. **Test button actions** (if possible without affecting data)
8. **Document any popup/sub-windows** that may appear from buttons

---

## Screenshots

1. **Initial State**: `.playwright-mcp/patient-history-current-state.png`
   - Shows window with all three sections visible
   - Payments checkbox is checked
   - Default values populated in various fields

---

## Technical Notes

### Extraction Challenges

During documentation, the following technical challenges were encountered:

1. **Large Dropdown Lists**: The page contains dropdown menus with extremely large option lists (likely hundreds or thousands of options), causing browser evaluation tools to exceed response size limits (>25000 tokens).

2. **Page Complexity**: The overall page structure returns excessive data when attempting to extract all elements programmatically, suggesting:
   - Multiple large dropdown lists (Service Types, Insurance Companies, etc.)
   - Extensive form fields across multiple sections
   - Possibly embedded data or hidden elements

3. **Dynamic Content**: The "საბ" button counter changes dynamically (48→51), suggesting client-side JavaScript that updates based on form state.

### Recommended Extraction Approaches

For complete dropdown option extraction, the following approaches are recommended:

1. **Individual Dropdown Extraction**: Query each dropdown by specific ID/name attribute separately
2. **Pagination/Chunking**: Extract dropdown options in batches (e.g., 0-50, 51-100, etc.)
3. **Server-Side Data Source**: If possible, extract dropdown data directly from database or API endpoints
4. **Manual Recording**: For critical dropdowns, manually scroll and record all visible options

### Alternative Documentation Strategy

Given the technical constraints, an alternative approach would be:

1. Document dropdown **structure** and **purpose** (completed ✅)
2. Document **currently selected values** (completed ✅)
3. Document **field relationships** and **validation** (completed ✅)
4. Create **appendix files** for large option lists extracted via alternative methods
5. Focus on **workflow logic** and **conditional behaviors** (completed ✅)

---

**Documentation Version**: 1.1 (Partial - with technical constraints documented)
**Last Updated**: 2025-11-10
**Status**: Partial Documentation - Core structure, fields, and logic documented; dropdown option extraction limited by technical constraints
**Completeness**: ~75% (structure and logic complete; dropdown enumeration incomplete)
