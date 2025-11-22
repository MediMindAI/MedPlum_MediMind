# კვლევების სია (Research/Studies List)

## Overview

The "კვლევების სია" (Research/Studies List) section is a dedicated tab within the Patient Card that displays all laboratory studies, diagnostic tests, and consultations associated with a patient's visits. The section is divided into two main parts:

1. **კვლევები და კონსულტაციები მიმდინარე ვიზიტზე** - Studies and Consultations for Current Visit
2. **კვლევები და კონსულტაციები წარსულ ვიზიტებზე** - Studies and Consultations for Past Visits

## Page Information

- **Access Path**: პაციენტის ისტორია → ჩემი პაციენტები → [Select Patient] → [Double-click Visit] → კვლევების სია tab
- **Section Type**: Tab within Patient Card modal
- **Primary Function**: Display and manage laboratory studies and diagnostic tests for patient visits
- **Data Display**: Two separate tables (current visit and past visits)

## Page Structure

### Navigation Path
```
Main Menu > პაციენტის ისტორია (Patient History)
  └─> ჩემი პაციენტები (My Patients)
      └─> Patient List Table
          └─> Double-click on Visit Row
              └─> Patient Card Modal Opens
                  └─> Click "კვლევების სია" Tab
```

### Section Layout

The section contains two distinct areas stacked vertically:

```
┌──────────────────────────────────────────────────────────┐
│ კვლევები და კონსულტაციები მიმდინარე ვიზიტზე            │
│ (Studies and Consultations for Current Visit)            │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Control Links: ყველას მონიშვნა | ყველას მოხსნა     │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Table: თარიღი | დასახელება | კვლევა | პასუხი        │ │
│ │ [Study rows with checkboxes]                        │ │
│ └─────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│ კვლევები და კონსულტაციები წარსულ ვიზიტებზე             │
│ (Studies and Consultations for Past Visits)              │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Control Links: ყველას მონიშვნა | ყველას მოხსნა     │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Table: თარიღი | დასახელება | კვლევა | პასუხი        │ │
│ │ [Empty or past study rows]                          │ │
│ └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## Section 1: Current Visit Studies

### Header
- **Text**: "კვლევები და კონსულტაციები მიმდინარე ვიზიტზე"
- **Translation**: "Studies and Consultations for Current Visit"
- **Style**: Bold, dark blue background with white text
- **Purpose**: Identifies studies associated with the currently active patient visit

### Control Links

Located above the table, these links provide bulk selection functionality:

| Link Text | Translation | Function | Element Type |
|-----------|-------------|----------|--------------|
| ყველას მონიშვნა | Select All | Checks all checkboxes in both "კვლევა" and "პასუხი" columns | Hyperlink/Button |
| ყველას მოხსნა | Deselect All | Unchecks all checkboxes in both columns | Hyperlink/Button |

**Separator**: ` | ` (pipe character with spaces)

### Table Structure

#### Table Columns

| Column # | Column Name (Georgian) | Translation | Width % | Data Type | Format | Alignment | Notes |
|----------|------------------------|-------------|---------|-----------|--------|-----------|-------|
| 1 | თარიღი | Date | ~15% | DateTime | DD-MM-YYYY HH:MM | Left | Date and time of study order |
| 2 | დასახელება | Description/Name | ~60% | Text | Code + Description | Left | Study code and full name (e.g., "MB.35 - HIV antibody test") |
| 3 | კვლევა | Study | ~12% | Checkbox | Checkbox | Center | Indicates if study was ordered/performed |
| 4 | პასუხი | Answer/Result | ~13% | Checkbox | Checkbox | Center | Indicates if study results are available |

#### Sample Data (Current Patient: რევაზ ძიმისტარაშვილი)

| თარიღი | დასახელება | კვლევა | პასუხი |
|--------|-----------|--------|--------|
| 19-11-2025 02:18 | MB.35 - ანტისხეულები HIV-ის მიმართ | ☑ | ☑ |
| 19-11-2025 02:18 | MB.30 - ანტისხეულები C ჰეპატიტის მიმართ | ☑ | ☑ |
| 19-11-2025 02:24 | BL.6 - სისხლის ზოგადი ანალიზი | ☑ | ☑ |

**Study Code Format**: `[Category Code].[Number] - [Georgian Description]`

**Examples of Study Codes**:
- **MB.** prefix: Microbiology tests (ანტისხეულები - antibodies)
  - MB.35: HIV antibody test
  - MB.30: Hepatitis C antibody test
- **BL.** prefix: Blood tests (სისხლის - blood)
  - BL.6: Complete Blood Count (CBC)

### Table Features

#### Checkboxes
- **Type**: Standard HTML checkboxes
- **Columns**: Two checkbox columns (კვლევა and პასუხი)
- **State**: Can be checked or unchecked
- **Functionality**:
  - **კვლევა (Study)**: Indicates the study was ordered/performed
  - **პასუხი (Answer/Result)**: Indicates study results are available
- **Bulk Control**: Can be controlled via "ყველას მონიშვნა" (Select All) and "ყველას მოხსნა" (Deselect All) links

#### Data Display
- **Date Format**: DD-MM-YYYY HH:MM (24-hour format)
- **Study Name Format**: Code + Hyphen + Space + Georgian Description
- **Row Styling**: Alternating row colors for readability (standard table styling)
- **Empty State**: When no studies exist for current visit, table may show empty message or no rows

### Text Filter

Based on the extracted DOM data, there is a text input field for filtering:

- **Element Type**: Text Input
- **Purpose**: Filter study list by text search
- **Location**: Above the study table
- **Behavior**: Likely filters rows based on study name/description

## Section 2: Past Visits Studies

### Header
- **Text**: "კვლევები და კონსულტაციები წარსულ ვიზიტებზე"
- **Translation**: "Studies and Consultations for Past Visits"
- **Style**: Bold, dark blue background with white text
- **Purpose**: Displays historical studies from previous patient visits

### Table Structure

The past visits table has **identical structure** to the current visit table:

| Column # | Column Name (Georgian) | Translation | Data Type | Format |
|----------|------------------------|-------------|-----------|--------|
| 1 | თარიღი | Date | DateTime | DD-MM-YYYY HH:MM |
| 2 | დასახელება | Description/Name | Text | Code + Description |
| 3 | კვლევა | Study | Checkbox | Checkbox |
| 4 | პასუხი | Answer/Result | Checkbox | Checkbox |

### Control Links

Same functionality as current visit section:
- **ყველას მონიშვნა** (Select All)
- **ყველას მოხსნა** (Deselect All)

### Data Observation

In the current patient example (რევაზ ძიმისტარაშვილი), the past visits section appears **empty**, indicating:
- No previous visits have recorded studies, OR
- This is the patient's first visit, OR
- Past visit data is loaded separately/dynamically

## UI Components and Elements

### Checkboxes

**კვლევა (Study) Column Checkboxes:**
- **Purpose**: Mark whether a study was ordered or performed
- **Default State**: Can be checked or unchecked based on data
- **Interaction**: User can toggle checkbox state (if permissions allow)
- **Visual**: Standard checkbox appearance

**პასუხი (Answer/Result) Column Checkboxes:**
- **Purpose**: Mark whether study results are available
- **Default State**: Can be checked or unchecked based on data
- **Interaction**: User can toggle checkbox state (if permissions allow)
- **Visual**: Standard checkbox appearance

**Technical Notes**:
- Checkboxes likely tied to database fields (boolean or tinyint)
- May be read-only depending on user permissions
- State changes may trigger AJAX save operations

### Links/Buttons

**ყველას მონიშვნა (Select All)**:
- **Element Type**: Hyperlink (`<a>` tag)
- **Text**: "ყველას მონიშვნა"
- **Function**: JavaScript function to check all checkboxes in the section
- **Target**: Both კვლევა and პასუხი columns
- **Behavior**: Likely triggers JavaScript: `checkAll()` or similar function

**ყველას მოხსნა (Deselect All)**:
- **Element Type**: Hyperlink (`<a>` tag)
- **Text**: "ყველას მოხსნა"
- **Function**: JavaScript function to uncheck all checkboxes in the section
- **Target**: Both კვლევა and პასუხი columns
- **Behavior**: Likely triggers JavaScript: `uncheckAll()` or similar function

### Text Filter Input

- **Element Type**: Text Input Field
- **Purpose**: Filter/search study list
- **Location**: Above the study table (exact position TBD based on layout)
- **Behavior**:
  - Likely filters rows as user types (live search)
  - Searches in study description/name field
  - May use JavaScript/AJAX for filtering

## Data Fields and Attributes

### Study Record Fields

Based on the displayed data, each study record contains:

| Field Name (Inferred) | Georgian Label | Data Type | Required | Format/Validation | Example |
|----------------------|----------------|-----------|----------|-------------------|---------|
| study_date | თარიღი | DATETIME | Yes | DD-MM-YYYY HH:MM | 19-11-2025 02:18 |
| study_code | [Part of დასახელება] | VARCHAR | Yes | XX.## format | MB.35, BL.6 |
| study_name | დასახელება | VARCHAR | Yes | Code + Description | MB.35 - ანტისხეულები HIV-ის მიმართ |
| is_ordered | კვლევა | BOOLEAN/TINYINT | No | Checkbox state (0/1) | 1 (checked) |
| has_result | პასუხი | BOOLEAN/TINYINT | No | Checkbox state (0/1) | 1 (checked) |
| visit_id | [Hidden] | INT | Yes | Foreign key to visit | - |
| patient_id | [Hidden] | INT | Yes | Foreign key to patient | - |

### Study Code Categories (Inferred)

Based on observed examples:

| Prefix | Category | Georgian | Examples |
|--------|----------|----------|----------|
| MB. | Microbiology | მიკრობიოლოგია | MB.35 (HIV), MB.30 (Hepatitis C) |
| BL. | Blood Tests | სისხლის ანალიზები | BL.6 (CBC) |
| [More categories likely exist in full system] | | | |

## Workflows and User Interactions

### Viewing Studies Workflow

1. User navigates to "ჩემი პაციენტები" (My Patients)
2. User selects a patient from the patient list
3. User double-clicks on a visit row to open Patient Card
4. User clicks on "კვლევების სია" tab
5. System loads and displays:
   - Current visit studies in first table
   - Past visit studies in second table (if any)
6. User can review study information, dates, and completion status

### Checkbox Interaction Workflow

**Individual Checkbox:**
1. User clicks on a checkbox in კვლევა or პასუხი column
2. Checkbox toggles state (checked ↔ unchecked)
3. System may auto-save state via AJAX request (TBD)
4. Visual feedback: checkbox updates immediately

**Bulk Selection:**
1. User clicks "ყველას მონიშვნა" (Select All) link
2. JavaScript function checks all checkboxes in both კვლევა and პასუხი columns
3. All checkboxes in the section become checked
4. System may auto-save all states (TBD)

**Bulk Deselection:**
1. User clicks "ყველას მოხსნა" (Deselect All) link
2. JavaScript function unchecks all checkboxes in both columns
3. All checkboxes in the section become unchecked
4. System may auto-save all states (TBD)

### Search/Filter Workflow

1. User types text into the filter input field
2. System filters study list based on input text
3. Table updates to show only matching studies
4. Likely searches in study name/description field
5. Filtering happens in real-time or after user stops typing

## Technical Implementation Notes

### DOM Structure

**Section Container:**
- Divided into two main subsections
- Each subsection has:
  - Header/title bar
  - Control links (Select All / Deselect All)
  - Data table with 4 columns
  - Optional text filter input

**Table Structure:**
```html
<table>
  <thead>
    <tr>
      <th>თარიღი</th>
      <th>დასახელება</th>
      <th>კვლევა</th>
      <th>პასუხი</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>[Date]</td>
      <td>[Study Code + Name]</td>
      <td><input type="checkbox" ...></td>
      <td><input type="checkbox" ...></td>
    </tr>
    <!-- More rows -->
  </tbody>
</table>
```

### JavaScript Behaviors (Inferred)

**Expected JavaScript Functions:**

```javascript
// Select all checkboxes
function selectAllStudies() {
  // Find all checkboxes in current section
  // Set checked = true
  // Optional: Save state via AJAX
}

// Deselect all checkboxes
function deselectAllStudies() {
  // Find all checkboxes in current section
  // Set checked = false
  // Optional: Save state via AJAX
}

// Filter studies by text
function filterStudies(searchText) {
  // Loop through table rows
  // Show/hide rows based on search text match
  // Update table display
}

// Handle individual checkbox change
function onCheckboxChange(checkbox) {
  // Get checkbox state
  // Save state to database via AJAX
  // Show success/error feedback
}
```

### Data Persistence

**Likely Database Structure:**

```sql
-- Study orders table (inferred)
CREATE TABLE study_orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  visit_id INT NOT NULL,
  patient_id INT NOT NULL,
  study_code VARCHAR(20) NOT NULL,  -- e.g., 'MB.35'
  study_name VARCHAR(255) NOT NULL,  -- e.g., 'ანტისხეულები HIV-ის მიმართ'
  order_date DATETIME NOT NULL,
  is_ordered TINYINT(1) DEFAULT 0,  -- კვლევა checkbox
  has_result TINYINT(1) DEFAULT 0,  -- პასუხი checkbox
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (visit_id) REFERENCES visits(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Study catalog/reference table (inferred)
CREATE TABLE study_catalog (
  id INT PRIMARY KEY AUTO_INCREMENT,
  study_code VARCHAR(20) UNIQUE NOT NULL,
  study_name_ka VARCHAR(255) NOT NULL,  -- Georgian name
  study_name_en VARCHAR(255),            -- English name
  category VARCHAR(50),                  -- e.g., 'Microbiology', 'Blood Tests'
  is_active TINYINT(1) DEFAULT 1
);
```

### AJAX Requests (Inferred)

**Load Studies:**
```
GET /api/studies/load?visit_id={visit_id}
Response: JSON array of study objects
```

**Update Checkbox State:**
```
POST /api/studies/update
Payload: {
  study_id: 123,
  is_ordered: 1,
  has_result: 1
}
Response: Success/error message
```

## Validation Rules

### Data Validation

1. **Date Field**:
   - Must be valid date/time format (DD-MM-YYYY HH:MM)
   - Cannot be in the future (likely)
   - Required field

2. **Study Code**:
   - Must exist in study catalog
   - Format: Letters + Period + Number (e.g., MB.35)
   - Required field

3. **Study Name**:
   - Must not be empty
   - Should match study code in catalog
   - Required field

4. **Checkboxes**:
   - Boolean values (0 or 1)
   - No validation required (any state valid)
   - Optional fields

### Business Rules

1. **Study Ordering**:
   - Studies must be associated with a valid visit
   - Only authorized users can order studies
   - Study codes must be active in the catalog

2. **Results Entry**:
   - Results (პასუხი checkbox) should only be checked if study was ordered (კვლევა checkbox)
   - Results may require specific permissions to mark complete

3. **Historical Data**:
   - Past visit studies are read-only (likely)
   - Historical records cannot be deleted (likely)
   - Past studies display chronologically

## Integration Points

### Related Sections/Modules

1. **Patient Card (Parent Container)**:
   - კვლევების სია is a tab within the Patient Card modal
   - Shares patient context with other tabs
   - Navigation between tabs preserves patient/visit context

2. **Visit Management**:
   - Studies are associated with specific visits
   - Current visit vs. past visits distinction
   - Visit ID required to load study data

3. **Laboratory Module** (Inferred):
   - Study codes likely defined in laboratory catalog
   - Results may link to detailed laboratory reports
   - Integration with lab information system (LIS)

4. **Billing/Finance** (Inferred):
   - Ordered studies may trigger billing events
   - Study codes may have associated costs
   - Integration with billing module

### Data Relationships

```
Patient
  └── Visit (Current)
        └── Study Orders (Current Visit Table)
              ├── Study Code (from Catalog)
              ├── Study Name (from Catalog)
              ├── Order Date
              ├── Is Ordered (კვლევა)
              └── Has Result (პასუხი)
  └── Visits (Past)
        └── Study Orders (Past Visits Table)
              └── [Same structure as current]
```

## Accessibility and Localization

### Language Support

- **Primary Language**: Georgian (ქართული)
- **Character Encoding**: UTF-8 (ensures proper display of Georgian characters)
- **Text Direction**: Left-to-Right (LTR)

### Georgian Text Elements

All user-facing text is in Georgian:

| Element | Georgian Text | Translation |
|---------|---------------|-------------|
| Tab Title | კვლევების სია | Studies List |
| Current Visit Header | კვლევები და კონსულტაციები მიმდინარე ვიზიტზე | Studies and Consultations for Current Visit |
| Past Visits Header | კვლევები და კონსულტაციები წარსულ ვიზიტებზე | Studies and Consultations for Past Visits |
| Select All Link | ყველას მონიშვნა | Select All |
| Deselect All Link | ყველას მოხსნა | Deselect All |
| Date Column | თარიღი | Date |
| Description Column | დასახელება | Description/Name |
| Study Column | კვლევა | Study |
| Answer/Result Column | პასუხი | Answer/Result |

### Study Names (Georgian)

Sample study names observed:
- **ანტისხეულები HIV-ის მიმართ** - HIV antibodies / Antibodies against HIV
- **ანტისხეულები C ჰეპატიტის მიმართ** - Hepatitis C antibodies / Antibodies against Hepatitis C
- **სისხლის ზოგადი ანალიზი** - Complete Blood Count / General blood analysis

## Security and Permissions

### Access Control (Inferred)

1. **View Permissions**:
   - Users must have access to Patient History module
   - Users must have rights to view patient records
   - Studies may contain sensitive medical information

2. **Edit Permissions**:
   - Checkbox changes may require specific permissions
   - Study ordering may require clinical staff role
   - Results entry may require laboratory staff role

3. **Data Privacy**:
   - Patient studies contain confidential medical information
   - Audit logging likely tracks who views/modifies study data
   - HIPAA/GDPR-like privacy considerations apply

## Notes and Observations

### Current Implementation Notes

1. **Two-Section Layout**: Clear separation between current visit and past visits helps users distinguish active vs. historical data.

2. **Checkbox-Based Interface**: Simple checkbox UI for marking study status (ordered/completed) provides quick visual feedback.

3. **Bulk Operations**: "Select All" and "Deselect All" links enable efficient data entry when multiple studies need same status.

4. **Study Code System**: Standardized coding (e.g., MB.35, BL.6) suggests integration with medical terminology or laboratory catalog.

5. **Date-Time Precision**: Timestamps include hours and minutes, important for tracking exact order times.

6. **Empty Past Visits**: In the observed example, past visits section is empty, which is normal for new patients or first-time visits.

### Potential Enhancement Areas

1. **Study Details**: Clicking on study name could open detailed view with results, interpretations, reference ranges.

2. **Result Status**: Could add status indicator (pending, in-progress, completed) beyond simple checkbox.

3. **Print Functionality**: Add ability to print study list or results for patient records.

4. **Export Options**: Allow exporting study data to PDF or Excel format.

5. **Filtering Options**: Add date range filters, study type filters, status filters.

6. **Sorting**: Enable column sorting (by date, study name, status).

7. **Inline Editing**: Allow editing study details directly in the table.

8. **Visual Indicators**: Color coding for urgent studies, overdue results, abnormal findings.

### Technical Debt and Considerations

1. **AJAX Auto-Save**: Unclear if checkbox changes auto-save or require explicit save action. Auto-save improves UX but requires robust error handling.

2. **Concurrent Edits**: If multiple users edit same patient's studies simultaneously, need conflict resolution mechanism.

3. **Data Refresh**: Need mechanism to refresh table if studies are added/modified in other sessions.

4. **Performance**: For patients with many visits and studies, pagination or lazy loading may be needed.

5. **Mobile Responsiveness**: Table layout may need responsive design for mobile/tablet access.

## Summary

The **კვლევების სია (Studies List)** section provides a comprehensive view of all laboratory studies and diagnostic tests for a patient, organized by current and past visits. The interface uses a straightforward table layout with checkbox controls for marking study order and result completion status. Key features include:

- **Dual-table layout**: Current visit studies vs. past visit studies
- **Four-column structure**: Date, Study Name, Study Ordered checkbox, Result Available checkbox
- **Bulk operations**: Select All / Deselect All functionality
- **Study coding system**: Standardized codes (MB.35, BL.6, etc.)
- **Full Georgian localization**: All UI text in Georgian language
- **Simple interaction model**: Checkbox-based status tracking

This section integrates with the broader Patient History module and likely connects to laboratory information systems for test ordering and result retrieval.



