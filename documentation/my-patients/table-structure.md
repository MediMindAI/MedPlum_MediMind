# My Patients - Table Structure Documentation

## Overview
The My Patients table displays a list of patients assigned to the current healthcare provider with key demographic and contact information.

**Extraction Date**: 2025-11-14
**Page URL**: http://178.134.21.82:8008/index.php (პაციენტის ისტორია >> ჩემი პაციენტები)

## Table Visual Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Table Header (Turquoise Gradient Background, White Text)                   │
├────────────┬─────────┬─────────┬─────────┬──────────────┬─────────────┬─────┤
│ პორად #    │ საწოლი  │ გვარი   │ სქესი   │ დაბ. თარიღი  │ ტელეფონი   │ რეგ.#│
├────────────┼─────────┼─────────┼─────────┼──────────────┼─────────────┼─────┤
│ 31001036644│ ზაქარია │ ბექაურია│ მამრობითი│ 17-10-1958  │ 593131300;  │     │
├────────────┼─────────┼─────────┼─────────┼──────────────┼─────────────┼─────┤
│ 19001002289│ ალფერ   │ ინძირია │ მამრობითი│ 20-08-1944  │ 555258730;  │     │
├────────────┼─────────┼─────────┼─────────┼──────────────┼─────────────┼─────┤
│ ...        │ ...     │ ...     │ ...     │ ...          │ ...         │ ... │
└────────────┴─────────┴─────────┴─────────┴──────────────┴─────────────┴─────┘
```

## Column Specifications

### Visible Columns (Left to Right)

| # | Column Header (Georgian) | Column Header (English) | Data Type | Width | Alignment | Sortable | Notes |
|---|------------------------|----------------------|-----------|-------|-----------|----------|-------|
| 1 | პორად # | Registration/Portal Number | String (11-digit) | ~120px | Left | Yes | Patient's unique registration identifier |
| 2 | საწოლი | First Name | String | ~100px | Left | Yes | Patient's first name (VERIFIED: column shows first names, not bed numbers) |
| 3 | გვარი | Last Name | String | ~120px | Left | Yes | Patient's last name/surname |
| 4 | სქესი | Gender | String | ~100px | Left | Yes | Patient's gender (მამრობითი=Male, მდედრობითი=Female) |
| 5 | დაბ. თარიღი | Date of Birth | Date (DD-MM-YYYY) | ~110px | Left | Yes | Patient's birthdate |
| 6 | ტელეფონი | Phone | String | ~120px | Left | No | Patient's phone number(s) |
| 7 | რეგ.# | Reg Number | String/Empty | ~80px | Left | No | Additional registration number (appears empty in screenshot) |

**Note**: Column 2 header says "საწოლი" (Bed) but the column actually displays patient first names. This is a UI labeling inconsistency in the original EMR system - VERIFIED by user.

### Additional Columns (Potentially off-screen)
Based on common EMR patient list patterns, there may be additional columns to the right:
- Insurance/Payer
- Admission Date
- Department
- Room Number
- Attending Doctor
- Status
- Actions (Edit/View buttons)

**Requires**: DOM extraction to confirm all columns

---

## Detailed Column Descriptions

### Column 1: პორად # (Registration/Portal Number)

**Georgian**: პორად #
**English**: Portal Number / Registration Number
**Field Name** (Expected): `registration_number` or `portal_number`

**Data Type**: String (numeric)
**Format**: 11-digit number (no separators)
**Example Values**:
- `31001036644`
- `19001002289`
- `01030003727`
- `33001065203`
- `37001005208`
- `01025009500`
- `01011065958`
- `62001037193`
- `05001001228`
- `02001003698`
- `01027046036`
- `59002004829`
- `59001023766`
- `20001031556`

**Pattern Analysis**:
- All values are exactly 11 digits
- Appears to be Georgian Personal ID format
- First 2 digits may represent birth year or region
- Last digit may be checksum (Luhn algorithm)

**Validation Rules**:
- Length: Exactly 11 characters
- Type: Numeric only
- Unique: Each patient has unique number
- Format: May follow Georgian Personal ID Luhn checksum

**FHIR Mapping**:
- Resource: `Patient.identifier`
- System: `http://medimind.ge/identifiers/personal-id`
- Use: `official`

**Sorting**: Numeric ascending/descending

**Clickable**: Likely yes - clicking may navigate to patient detail page

---

### Column 2: საწოლი (First Name)

**Georgian**: საწოლი
**English**: First Name (Note: header incorrectly says "Bed")
**Field Name** (Expected): `first_name`

**Data Type**: String
**Format**: Georgian text
**Example Values**:
- ზაქარია (Zakaria)
- ალფერ (Alfer)
- კუმბენ რ (Kumben R)
- მიტა (Mita)
- გივი (Givi)
- ბეჟან (Bezhan)
- გიორგი (Giorgi)
- გიორგი (Giorgi)
- გიორგი (Giorgi)
- გრიგოლ (Grigol)
- ვასილი (Vasili)
- სიმონ (Simon)
- დიმიტრი (Dimitri)
- გოგა (Goga)

**Validation Rules**:
- Length: 1-50 characters (typical)
- Type: Unicode text (Georgian characters)
- Required: Yes (all patients must have first name)

**FHIR Mapping**:
- Resource: `Patient.name[0].given[0]`
- Use: `official`

**Notes**:
- **VERIFIED**: Column header says "საწოლი" (Bed) but this is a UI labeling error in the original EMR
- The column actually displays patient **first names** (given names)
- This is a known inconsistency in the legacy system that should be corrected in the new Medplum implementation
- Recommended fix: Change column header to "სახელი" (First Name) in new system

**Sorting**: Alphabetical (Georgian collation)

---

### Column 3: გვარი (Last Name)

**Georgian**: გვარი
**English**: Last Name / Surname
**Field Name** (Expected): `last_name` or `surname`

**Data Type**: String
**Format**: Georgian text
**Example Values**:
- ბექაურია (Bekauria)
- ინძირია (Indzhiria)
- შებითიძე (Shebitidze)
- მიმინოშვილი (Miminoshvili)
- დალანდება (Dalandeba)
- ჩაჩანიძე (Chachanidze)
- ქიაურელი (Kiaureli)
- დანელია (Danelia)
- გიორგაძე (Giorgadze)
- ჩირია (Chiria)
- ფარცხალაძეშვილი (Partskhaladze-shvili)
- დურმილაშვილი (Durmilashvili)
- თუღუაშვილი (Tughuashvili)
- ქირქველაშვილი (Kirkvelashvili)

**Validation Rules**:
- Length: 1-100 characters (typical)
- Type: Unicode text (Georgian characters)
- Required: Yes (all patients must have last name)
- Pattern: May contain Georgian letters, spaces, hyphens

**FHIR Mapping**:
- Resource: `Patient.name[0].family`
- Use: `official`

**Sorting**: Alphabetical (Georgian collation)

**Clickable**: Potentially yes (along with entire row)

---

### Column 4: სქესი (Gender)

**Georgian**: სქესი
**English**: Gender / Sex
**Field Name** (Expected): `gender`

**Data Type**: Enum/String
**Format**: Georgian text (full word)
**Allowed Values**:
- `მამრობითი` (Mamrobiti) = Male
- `მდედრობითი` (Mdedrobiti) = Female

**Example Values from Table**:
- მამრობითი (Male) - appears in all visible rows

**Validation Rules**:
- Type: Enum (2 values)
- Required: Yes
- Values: მამრობითი | მდედრობითი

**FHIR Mapping**:
- Resource: `Patient.gender`
- Value Mapping:
  - `მამრობითი` → `male`
  - `მდედრობითი` → `female`

**Sorting**: Alphabetical or by enum order

**Display**:
- Shows full Georgian word (not abbreviated)
- Text color: Standard black/dark gray

---

### Column 5: დაბ. თარიღი (Date of Birth)

**Georgian**: დაბ. თარიღი (abbreviated from დაბადების თარიღი)
**English**: Date of Birth / DOB
**Field Name** (Expected): `birth_date` or `date_of_birth`

**Data Type**: Date
**Format**: `DD-MM-YYYY`
**Example Values**:
- `17-10-1958`
- `20-08-1944`
- `15-03-1957`
- `04-10-1990`
- `18-03-1955`
- `04-05-1954`
- `09-08-1989`
- `29-10-1986`
- `06-05-1981`
- `21-12-1973`
- `06-05-1961`
- `01-01-1962`
- `10-01-1955`
- `05-06-1945`

**Validation Rules**:
- Format: DD-MM-YYYY (2-digit day, 2-digit month, 4-digit year)
- Separator: Hyphen (-)
- Range: Not in future, not more than 120 years ago
- Required: Typically yes (may be unknown for some patients)

**FHIR Mapping**:
- Resource: `Patient.birthDate`
- Format: Convert to FHIR format `YYYY-MM-DD`
- Example: `17-10-1958` → `1958-10-17`

**Calculated Fields**:
- Age can be calculated from birthdate: Current Date - Birth Date
- Example: `1958-10-17` → Age 66 (as of 2025-11-14)

**Sorting**: Chronological (oldest to youngest or vice versa)

**Display**:
- Always shows in DD-MM-YYYY format (Georgian/European style)
- Hyphen separator between day, month, year

---

### Column 6: ტელეფონი (Phone)

**Georgian**: ტელეფონი
**English**: Phone / Telephone
**Field Name** (Expected): `phone` or `phone_number`

**Data Type**: String
**Format**: Numeric with optional separators
**Example Values**:
- `593131300;` (with semicolon)
- `555258730;`
- (empty/no data visible for some rows)
- `995568762861`
- `995599558668`
- `995591575544`
- `995577773339`
- `995568902982`
- `995551265551`
- `597890489;`
- `995599714884`
- `995595002395`
- `995597711482`
- `995593333465`

**Pattern Analysis**:
- Short format: 9 digits + semicolon (e.g., `593131300;`)
- Long format: 12 digits starting with `995` (country code for Georgia)
- Some entries end with semicolon (suggesting multiple phone numbers may be separated)
- Mobile numbers in Georgia: 9 digits (5XX XXX XXX format)
- Full international format: +995 5XX XXX XXX (12 digits with country code)

**Validation Rules**:
- Length: 9-15 characters (flexible for different formats)
- Type: Numeric (may include +, spaces, hyphens, parentheses, semicolons)
- Required: No (optional field)
- Format options:
  - Local: `5XXXXXXXX` (9 digits)
  - International: `995 5XXXXXXXX` (12 digits)
  - Formatted: `+995 (5XX) XXX-XXX`
  - Multiple: `555258730; 598765432;` (semicolon-separated)

**FHIR Mapping**:
- Resource: `Patient.telecom`
- System: `phone`
- Use: `mobile` or `home`
- Value: Full number with country code `+995XXXXXXXXX`
- Multiple numbers: Array of telecom objects

**Example FHIR Structure**:
```json
"telecom": [
  {
    "system": "phone",
    "value": "+995593131300",
    "use": "mobile"
  }
]
```

**Sorting**: Not typically sortable (text field)

**Display**:
- May show multiple numbers separated by semicolons
- Format inconsistent (needs standardization in implementation)

---

### Column 7: რეგ.# (Registration Number)

**Georgian**: რეგ.# (abbreviated from რეგისტრაციის ნომერი)
**English**: Reg # / Registration Number
**Field Name** (Expected): `hospital_registration_number` or `visit_registration_number`

**Data Type**: String (alphanumeric)
**Format**: Various formats observed in other pages
**Example Values**:
- (Empty in screenshot - all rows appear blank)

**Expected Formats** (based on other EMR pages):
- Stationary format: `XXXXX-YYYY` (e.g., `10357-2025`)
- Ambulatory format: `a-XXXX-YYYY` (e.g., `a-6871-2025`)
- Numeric: 11-digit number

**Validation Rules**:
- Length: Variable (5-15 characters)
- Type: Alphanumeric (may include hyphen, letter prefix)
- Required: May depend on patient type (inpatient vs outpatient)
- Unique: Each registration should be unique

**FHIR Mapping**:
- Resource: `Encounter.identifier`
- System: `http://medimind.ge/identifiers/registration-number`
- Use: `official`

**Why Empty in Screenshot**:
- Column may be for visit/encounter registration, not patient registration
- "My Patients" page may show patients without active encounters
- Column may be populated only for admitted/active patients
- UI bug or data issue

**Sorting**: Alphanumeric

---

## Table Behavior

### Row Interaction

**Hover State**:
- Background color changes (light blue or gray highlight)
- Cursor changes to pointer (indicates clickable)

**Click Action**:
- **Expected**: Navigate to patient detail page
- **URL Format**: `/index.php?page=patient-detail&id={patient_id}` (or similar)
- **Opens**: Full patient record with tabs for:
  - General Information
  - Visit History
  - Medical Records
  - Documents
  - Billing

**Visual Feedback**:
- Row highlighting on hover
- No checkbox selection visible (not a multi-select table)

### Sorting

**Sortable Columns**:
- პორად # (Registration Number)
- საწოლი (First Name)
- გვარი (Last Name)
- სქესი (Gender)
- დაბ. თარიღი (Date of Birth)

**Sort Indicators**:
- Arrow icon (▲/▼) on column header
- Toggle between ascending/descending on click
- Default sort: Likely by registration number or last name

**Non-Sortable Columns**:
- ტელეფონი (Phone) - text field, inconsistent format
- რეგ.# (Reg Number) - may be sortable if populated

### Pagination

**Visible in Screenshot**: No pagination controls visible

**Expected Behavior**:
- May use infinite scroll (load more on scroll)
- May use pagination at bottom of table (not visible in screenshot)
- May load all results at once (if count is low)

**Performance Consideration**:
- If patient count > 100: Should implement pagination
- Recommended page size: 20-50 patients per page

### Selection

**Multi-Select**: Not visible in screenshot
**Checkboxes**: Not present
**Bulk Actions**: Not visible

**Note**: This appears to be a view-only table with row click navigation

---

## Empty State

**When No Patients Match Filters**:
- Expected message: "მონაცემები არ მოიძებნა" (No data found)
- Empty table body with centered text
- Suggestion to modify filters

---

## Data Source

### Database Table/FHIR Resource

**Primary Resource**: Patient
**Related Resources**:
- Encounter (for current admission/department)
- Practitioner (for treating doctor relationship)
- Location (for department/bed assignment)

### FHIR Search Query (Expected)

```
GET /fhir/R4/Patient?
  _include=Patient:general-practitioner
  &general-practitioner={current_practitioner_id}
  &active=true
  &_count=50
  &_sort=family
```

**Search Parameters Used**:
- `general-practitioner`: Filter by assigned doctor
- `active`: Only active patients
- `_count`: Limit results
- `_sort`: Sort by last name

**Additional Filters** (from filter form):
- `identifier`: Search by registration number
- Custom search parameters for department, transferred status

---

## Styling

### Table Header
- **Background**: Turquoise gradient (`linear-gradient(90deg, #138496 → #17a2b8 → #20c4dd)`)
- **Text Color**: White (#ffffff)
- **Font Weight**: Bold
- **Font Size**: ~13-14px
- **Padding**: 10-12px
- **Border**: None on header

### Table Body
- **Row Background**:
  - Even rows: White (#ffffff)
  - Odd rows: Light gray (#f8f9fa) - alternating striped pattern
- **Row Height**: ~40-45px
- **Text Color**: Dark gray/black (#333)
- **Font Size**: ~12-13px
- **Cell Padding**: 8-10px horizontal, 10-12px vertical
- **Border**: 1px solid #dee2e6 (light gray between rows)

### Hover State
- **Background**: Light blue (#e3f2fd or similar)
- **Cursor**: Pointer
- **Transition**: Smooth 0.2s background transition

### Scrolling
- **Vertical Scroll**: Enabled when rows exceed viewport
- **Horizontal Scroll**: Enabled when columns exceed viewport width
- **Sticky Header**: May be sticky (stays visible on scroll) - needs verification

---

## Responsive Design

### Desktop (>1200px)
- All columns visible
- No horizontal scrolling (if total width < 1200px)
- Table expands to fill available width

### Tablet (768px - 1200px)
- May hide less important columns (phone, reg #)
- Horizontal scrolling enabled
- Touch-friendly row height increases

### Mobile (<768px)
- Likely switches to card view (not table)
- Shows key fields only (name, ID, date of birth)
- Touch-optimized interaction

**Note**: Responsive behavior needs verification with live testing

---

## Accessibility

### Semantic HTML
- Proper `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` structure
- Column headers use `<th>` with `scope="col"`
- Row headers (if any) use `<th>` with `scope="row"`

### ARIA Attributes
- `role="table"` on table element
- `aria-label="ჩემი პაციენტები ცხრილი"` (My Patients Table)
- `aria-sort` on sortable column headers
- `tabindex="0"` on clickable rows for keyboard navigation

### Keyboard Navigation
- Tab through rows
- Enter/Space to open patient detail
- Arrow keys to navigate cells (optional)
- Escape to deselect (if applicable)

---

## Performance Considerations

### Data Loading
- **Initial Load**: Fetch first page (20-50 patients)
- **Lazy Loading**: Load additional pages on scroll
- **Caching**: Cache patient list in browser for 5-10 minutes
- **Debouncing**: Debounce filter inputs to reduce API calls

### Rendering Optimization
- **Virtual Scrolling**: Render only visible rows (if list is very long)
- **React.memo()**: Memoize row components to prevent unnecessary re-renders
- **Pagination**: Limit to 50 patients per page for performance

### Network Optimization
- **FHIR _elements**: Fetch only required fields (not full Patient resources)
- **FHIR _summary**: Use summary representation
- **Compression**: Enable gzip/brotli compression
- **Batch Requests**: Combine multiple searches into single request

---

## Testing Scenarios

### Test Case 1: Display Patients
1. Navigate to "ჩემი პაციენტები" page
2. **Expected**: Table displays with patient data
3. **Verify**: All columns show correct data types

### Test Case 2: Sort by Last Name
1. Click "გვარი" (Last Name) column header
2. **Expected**: Table sorts alphabetically (A-Z in Georgian)
3. Click again
4. **Expected**: Table sorts reverse alphabetically (Z-A)

### Test Case 3: Sort by Date of Birth
1. Click "დაბ. თარიღი" column header
2. **Expected**: Table sorts by oldest to youngest
3. Click again
4. **Expected**: Table sorts youngest to oldest

### Test Case 4: Click Patient Row
1. Click any row in table
2. **Expected**: Navigate to patient detail page
3. **Verify**: Correct patient ID in URL
4. **Verify**: Patient detail page shows correct patient

### Test Case 5: Empty State
1. Apply filters that match no patients
2. **Expected**: Table shows empty state message
3. **Verify**: Message is "მონაცემები არ მოიძებნა" or similar

### Test Case 6: Large Dataset
1. If doctor has >100 patients
2. **Expected**: Pagination or infinite scroll implemented
3. **Verify**: Performance remains acceptable (<2s load time)

### Test Case 7: Phone Number Display
1. Check patients with multiple phone numbers
2. **Expected**: All numbers displayed, separated by semicolons
3. **Verify**: Numbers are readable and formatted consistently

### Test Case 8: Gender Display
1. Check both male and female patients
2. **Expected**: "მამრობითი" for males, "მდედრობითი" for females
3. **Verify**: No abbreviated or English values

---

## Known Issues / Questions

### Issue 1: Column Header Mismatch ✅ RESOLVED
- **Problem**: Column 2 header says "საწოლი" (Bed) but data shows first names
- **Impact**: Confusing for users
- **Root Cause**: UI labeling error in legacy EMR system
- **Resolution**: VERIFIED - Column displays first names. Will be fixed in Medplum implementation by changing header to "სახელი" (First Name)

### Issue 2: Empty Registration Number Column
- **Problem**: რეგ.# column is empty for all visible patients
- **Impact**: Wasted screen space if always empty
- **Questions**:
  - Is this column needed?
  - Should it show visit registration numbers instead?
  - Is data missing from database?
- **Resolution**: Verify purpose and populate or remove column

### Issue 3: Phone Number Format Inconsistency
- **Problem**: Mix of 9-digit and 12-digit formats, semicolons inconsistent
- **Impact**: Hard to read, search, or validate
- **Resolution**: Standardize to international format (+995 XXX XXX XXX) in implementation

### Issue 4: No Action Buttons Visible
- **Problem**: No edit/delete/view buttons visible in table
- **Impact**: Users can only click row to view patient
- **Questions**:
  - Are action buttons hidden off-screen (right side)?
  - Do actions appear on hover?
  - Are actions only available on patient detail page?
- **Resolution**: Check with live DOM extraction for additional columns

### Issue 5: Pagination Not Visible
- **Problem**: No pagination controls visible
- **Questions**:
  - Is pagination below visible area?
  - Does page use infinite scroll?
  - Is patient count low enough to show all at once?
- **Resolution**: Scroll to bottom of page to check for pagination controls

---

## Future Enhancements

### Column Customization
- Allow users to show/hide columns
- Drag-and-drop column reordering
- Save column preferences per user

### Advanced Sorting
- Multi-column sorting (sort by last name, then first name)
- Custom sort orders

### Quick Actions
- Inline edit buttons (pencil icon)
- Quick view popup on hover
- Bulk selection for group actions

### Export Features
- Export to Excel
- Export to PDF
- Print patient list

### Additional Columns
- Age (calculated from birth date)
- Last Visit Date
- Upcoming Appointments
- Patient Status (active, inactive, deceased)
- Insurance Information

### Visual Enhancements
- Patient photo thumbnail
- Status indicator icons (alerts, flags)
- Color-coding by priority or status
- Conditional formatting (highlight overdue patients)
