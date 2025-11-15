# My Patients - Search and Filter Controls

## Overview
The My Patients page provides 4 filter controls to narrow down the patient list displayed in the table. All filters work together with AND logic.

**Extraction Date**: 2025-11-14
**Page URL**: http://178.134.21.82:8008/index.php (პაციენტის ისტორია >> ჩემი პაციენტები)

## Filter Controls Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  მკურნალი ექიმი    განყოფილება        გაუწერელი        ისხ #        │
│  ┌──────────┐      ┌──────────┐       ┌──┐            ┌─────────┐   │
│  │    -     ▼│      │    -     ▼│       │  │            │         │ 🔍│
│  └──────────┘      └──────────┘       └──┘            └─────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

## Filter Fields Table

| Field Label (Georgian) | Field Label (English) | Field ID/Name | Type | Required | Default Value | Width | Notes |
|----------------------|---------------------|--------------|------|----------|---------------|-------|-------|
| მკურნალი ექიმი | Treating Doctor | (TBD - need DOM extraction) | Select/Dropdown | No | "-" (All doctors) | ~200px | Filters patients by assigned doctor |
| განყოფილება | Department | (TBD - need DOM extraction) | Select/Dropdown | No | "-" (All departments) | ~200px | Filters patients by hospital department |
| გაუწერელი | Not Discharged | (TBD - need DOM extraction) | Checkbox | No | Unchecked | ~40px | Shows only patients still admitted (not yet discharged) when checked |
| ისხ # | Registration Number | (TBD - need DOM extraction) | Text Input | No | Empty | ~150px | Search by patient registration number |

## Detailed Field Specifications

### 1. მკურნალი ექიმი (Treating Doctor)

**Field Type**: Dropdown Select

**Purpose**: Filter patients by their assigned treating doctor

**HTML Attributes** (Expected):
```html
<select id="treating-doctor" name="treating_doctor">
  <option value="">-</option>
  <option value="1">დოქტორი ა</option>
  <option value="2">დოქტორი ბ</option>
  <!-- Additional doctor options -->
</select>
```

**Dropdown Options**:
- **Default**: "-" (Show all patients regardless of doctor)
- **Options**: List of all doctors in the system
- **Format**: Doctor name (likely: Last Name, First Name or Full Name)
- **Value**: Doctor ID (numeric)

**Business Logic**:
- If current user is a doctor (not admin): May default to current user's ID
- If current user is admin: Shows all doctors in dropdown
- Empty selection ("-") shows patients from all doctors

**Validation**: None (optional field)

**Dependencies**: Populated from Doctors/Practitioners database table

---

### 2. განყოფილება (Department)

**Field Type**: Dropdown Select

**Purpose**: Filter patients by the hospital department they are admitted to

**HTML Attributes** (Expected):
```html
<select id="department" name="department">
  <option value="">-</option>
  <option value="1">კარდიოლოგია</option>
  <option value="2">ქირურგია</option>
  <!-- Additional department options -->
</select>
```

**Dropdown Options**:
- **Default**: "-" (Show patients from all departments)
- **Options**: List of hospital departments/wards
- **Possible Values** (common Georgian hospital departments):
  - კარდიოლოგია (Cardiology)
  - ქირურგია (Surgery)
  - თერაპია (Therapy/Internal Medicine)
  - პედიატრია (Pediatrics)
  - გინეკოლოგია (Gynecology)
  - ნევროლოგია (Neurology)
  - ორთოპედია (Orthopedics)
  - რეანიმაცია (ICU/Resuscitation)
  - მშობიარობა (Maternity)

**Business Logic**:
- Shows only active departments
- Empty selection ("-") shows patients from all departments

**Validation**: None (optional field)

**Dependencies**: Populated from Departments/Organizational Units database table

---

### 3. გაუწერელი (Not Discharged)

**Field Type**: Checkbox

**Purpose**: Filter to show only patients who are still admitted to the hospital (not yet discharged)

**HTML Attributes** (Expected):
```html
<input type="checkbox" id="not-discharged" name="not_discharged" value="1" />
<label for="not-discharged">გაუწერელი</label>
```

**Values**:
- **Checked**: `true` or `1` - Show only patients still admitted (not discharged)
- **Unchecked**: `false` or `0` - Show all patients (both active and discharged)

**Business Logic**:
- When checked: Filters table to show only patients with active encounters (no discharge date)
- When unchecked: Shows all patients in the "My Patients" list regardless of discharge status
- Discharge status determined by Encounter.period.end field
  - **Not Discharged**: `Encounter.period.end` is null or empty
  - **Discharged**: `Encounter.period.end` is populated with a date

**Validation**: None (boolean field)

**FHIR Mapping**:
- Resource: `Encounter.period.end`
- Query Parameter: `date=ge{current_date}` or custom parameter for active encounters
- Filter Logic: `Encounter.period.end` IS NULL (for not discharged)

**Dependencies**: Encounter records with accurate admission and discharge dates

---

### 4. ისხ # (Registration Number)

**Field Type**: Text Input

**Purpose**: Search for a specific patient by their hospital registration number

**HTML Attributes** (Expected):
```html
<input type="text" id="registration-number" name="registration_number" placeholder="" />
<label for="registration-number">ისხ #</label>
```

**Input Format**:
- **Expected Format**: Numeric or alphanumeric registration number
- **Examples** (based on table data):
  - `31001036644`
  - `19001002289`
  - `01030003727`
  - Format appears to be 11-digit numeric

**Validation**:
- **Type**: Alphanumeric
- **Min Length**: No minimum (partial search likely supported)
- **Max Length**: ~15 characters (to accommodate various formats)
- **Pattern**: May match both stationary and ambulatory registration formats
  - Stationary: `XXXXX-YYYY` (e.g., "10357-2025")
  - Ambulatory: `a-XXXX-YYYY` (e.g., "a-6871-2025")
  - Or 11-digit format: `XXXXXXXXXXX`

**Search Behavior**:
- **Match Type**: Likely partial match (LIKE '%input%')
- **Case Sensitivity**: Case-insensitive
- **Trigger**: Search button click (not real-time)

**Business Logic**:
- Empty input: No filtering by registration number
- With input: Filters table to exact or partial match

---

## Search Button

**Element Type**: Button with icon

**Label**: None (icon-only)

**Icon**: 🔍 Magnifying glass (search icon)

**HTML Attributes** (Expected):
```html
<button type="submit" id="search-btn" class="btn-search">
  <i class="fa fa-search"></i> <!-- Or similar icon element -->
</button>
```

**Styling**:
- **Background**: Blue gradient
- **Size**: ~40px height, ~50px width
- **Border Radius**: Slightly rounded corners
- **Hover State**: Darker blue or shadow effect

**Behavior**:
- **Action**: Submits filter form
- **Method**: Likely POST or GET request to server
- **Effect**: Refreshes table with filtered results
- **Loading State**: May show loading spinner during fetch

---

## Filter Logic

### Combined Filter Behavior
All filters use **AND logic**:
- If Doctor = "დოქტორი ა" AND Department = "კარდიოლოგია"
  → Shows only patients assigned to Doctor A in Cardiology department

### Filter Priority
No priority - all filters are equal. If multiple filters selected:
1. Filter by Doctor (if selected)
2. AND filter by Department (if selected)
3. AND filter by Transferred status (if checked)
4. AND filter by Registration Number (if provided)

### Empty State
- If no filters applied: Shows all "my patients" (patients assigned to current logged-in doctor)
- If filters applied but no results: Shows empty table with message (likely "მონაცემები არ მოიძებნა" - No data found)

---

## Form Submission

### Expected Flow
1. User selects filter values
2. User clicks search button (🔍)
3. Form submits to server (AJAX or full page reload)
4. Server processes filters and returns matching patients
5. Table updates with filtered results
6. Filter values persist in form (user can modify and re-search)

### HTTP Request (Expected)
```
Method: GET or POST
Endpoint: /index.php?page=my-patients (or similar)
Parameters:
  - treating_doctor: {doctor_id}
  - department: {department_id}
  - transferred: {0|1}
  - registration_number: {reg_num}
```

---

## Accessibility Considerations

### Label Positioning
- All labels positioned **above** their respective inputs
- Clear visual hierarchy
- Adequate spacing between label and input (~5px)

### Keyboard Navigation
- Tab order: Doctor dropdown → Department dropdown → Transferred checkbox → Registration number input → Search button
- Enter key in text input should trigger search

### Screen Reader Support
- Labels should be properly associated with inputs (for/id attributes)
- Search button should have aria-label="ძებნა" (Search)

---

## Responsive Design

### Desktop (>1200px)
- All 4 filters displayed horizontally in single row
- Search button aligned to right

### Tablet/Mobile (Not shown in screenshot)
- Filters may stack vertically or wrap to multiple rows
- Search button remains accessible

---

## Data Sources

### Doctor Dropdown
**Source**: Practitioners table/FHIR Practitioner resources
**Filter**: Active doctors only
**Sort**: Alphabetical by last name

### Department Dropdown
**Source**: Departments table/FHIR Organization resources (type=department)
**Filter**: Active departments only
**Sort**: Alphabetical by name

### Patient Data
**Source**: Patients table/FHIR Patient resources
**Relationship**: Patient → Encounter → Practitioner (treating doctor)
**Relationship**: Patient → Encounter → Location (department)

---

## Localization

### Georgian Labels
All labels are in Georgian (ქართული) by default:
- მკურნალი ექიმი = Treating Doctor
- განყოფილება = Department
- გადწერილება = Transferred
- ისხ # = Registration Number

### Potential English Translations
- Treating Doctor
- Department
- Transferred
- Reg #

### Potential Russian Translations
- Лечащий врач (Treating Doctor)
- Отделение (Department)
- Переведенный (Transferred)
- Рег. № (Registration Number)

---

## Implementation Notes

### FHIR Mapping
For Medplum/FHIR implementation:

**Doctor Filter**:
- Search Parameter: `Encounter.participant:practitioner`
- Resource: Practitioner

**Department Filter**:
- Search Parameter: `Encounter.location`
- Resource: Location (with type=department)

**Transferred Filter**:
- Search Parameter: Custom extension or `Encounter.hospitalization.admitSource`
- May require custom search parameter

**Registration Number**:
- Search Parameter: `Patient.identifier` (system: registration-number)
- Resource: Patient

### Performance Optimization
- Implement debouncing on registration number input (500ms delay)
- Cache doctor and department lists in client
- Use FHIR `_count` parameter to limit initial results
- Implement pagination for large result sets

---

## Testing Scenarios

### Test Case 1: Filter by Doctor Only
1. Select doctor from dropdown
2. Leave other filters empty
3. Click search
4. **Expected**: Table shows only patients assigned to selected doctor

### Test Case 2: Filter by Department Only
1. Select department from dropdown
2. Leave other filters empty
3. Click search
4. **Expected**: Table shows only patients in selected department

### Test Case 3: Transferred Patients Only
1. Check "გადწერილება" checkbox
2. Leave other filters empty
3. Click search
4. **Expected**: Table shows only transferred patients

### Test Case 4: Search by Registration Number
1. Enter registration number "31001036644"
2. Leave other filters empty
3. Click search
4. **Expected**: Table shows patient with matching registration number

### Test Case 5: Combined Filters
1. Select doctor "დოქტორი ა"
2. Select department "კარდიოლოგია"
3. Check "გადწერილება"
4. Click search
5. **Expected**: Table shows only transferred patients in Cardiology assigned to Doctor A

### Test Case 6: No Results
1. Apply filters that match no patients
2. Click search
3. **Expected**: Empty table with "No data found" message

### Test Case 7: Clear Filters
1. Apply some filters
2. Click search
3. Reset all filters to default
4. Click search
5. **Expected**: Table shows all "my patients" again

---

## Future Enhancements

### Potential Additional Filters
- Date range (admission date, discharge date)
- Patient status (active, discharged, deceased)
- Insurance type
- Age range
- Gender

### UX Improvements
- "Clear Filters" button to reset all filters at once
- "Search" on Enter key press in text input
- Real-time search (debounced) instead of button click
- Filter result count indicator ("Showing 15 of 150 patients")
- Save filter presets for quick access

### Advanced Features
- Export filtered results to Excel/PDF
- Bulk actions on filtered patients
- Sorting within filtered results
- Advanced search with multiple registration numbers
