# My Patients - UI Elements Documentation

## Overview
This document catalogs all user interface elements on the My Patients page including buttons, dropdowns, inputs, and interactive components.

**Extraction Date**: 2025-11-14
**Page URL**: http://178.134.21.82:8008/index.php (პაციენტის ისტორია >> ჩემი პაციენტები)

---

## Top Navigation Bar (Row 1)

### Main Menu Items

Located at the top of the page in a horizontal gray bar (~40px height).

| # | Menu Item (Georgian) | Menu Item (English) | Type | State | Action | Notes |
|---|---------------------|-------------------|------|-------|--------|-------|
| 1 | რეგისტრაცია | Registration | Link/Button | Inactive | Navigate to /registration | Patient registration module |
| 2 | პაციენტის ისტორია | Patient History | Link/Button | **ACTIVE** | Navigate to /patient-history | Currently active menu item |
| 3 | ნომენკლატურა | Nomenclature | Link/Button | Inactive | Navigate to /nomenclature | Medical coding/terminology |
| 4 | ადმინისტრირება | Administration | Link/Button | Inactive | Navigate to /administration | System administration |
| 5 | ფორმები | Forms | Link/Button | Inactive | Navigate to /forms | Medical forms management |
| 6 | ანგარიშები | Reports | Link/Button | Inactive | Navigate to /reports | Reporting module |

**Styling**:
- **Background**: Light gray (#e9ecef)
- **Active State**: Different background or underline
- **Text Color**: Dark gray/black (#333)
- **Hover State**: Darker background or underline
- **Font**: Georgian-compatible sans-serif, ~13-14px

**Behavior**:
- Click to navigate to respective module
- Active item indicates current location
- Likely persists across all pages

---

## Sub-Menu Navigation (Row 2)

### Patient History Sub-Menu Items

Located below main menu in a horizontal turquoise bar (~45px height).

| # | Sub-Menu Item (Georgian) | Sub-Menu Item (English) | Type | State | Route | Notes |
|---|------------------------|----------------------|------|-------|-------|-------|
| 1 | ისტორია | History | Link/Button | Inactive | /patient-history/history | Main patient visit history |
| 2 | **ჩემი პაციენტები** | **My Patients** | Link/Button | **ACTIVE** | /patient-history/my-patients | Currently active page |
| 3 | სუროგაცია | Surrogacy | Link/Button | Inactive | /patient-history/surrogacy | Surrogacy management |
| 4 | ინვოისები | Invoices | Link/Button | Inactive | /patient-history/invoices | Billing/invoices |
| 5 | 100 რეკორდი | 100 Records | Link/Button | Inactive | /patient-history/100-records | Special records view |
| 6 | განრიგი | Schedule | Link/Button | Inactive | /patient-history/schedule | Scheduling |
| 7 | მესანჯერი | Messenger | Link/Button | Inactive | /patient-history/messenger | Internal messaging |
| 8 | ლაბორატორია | Laboratory | Link/Button | Inactive | /patient-history/laboratory | Lab results |
| 9 | მორიგეობა | Duty/On-call | Link/Button | Inactive | /patient-history/duty | Duty schedule |
| 10 | დანიშნულება | Appointments | Link/Button | Inactive | /patient-history/appointments | Appointment management |
| 11 | სტაციონარი | Stationary/Inpatient | Link/Button | Inactive | /patient-history/inpatient | Inpatient management |
| 12 | კვება | Nutrition | Link/Button | Inactive | /patient-history/nutrition | Nutrition/diet plans |
| 13 | MOH | MOH | Link/Button | Inactive | /patient-history/moh | Ministry of Health reporting |

**Styling**:
- **Background**: Turquoise gradient (`linear-gradient(90deg, #138496 → #17a2b8 → #20c4dd)`)
- **Text Color**: White (#ffffff)
- **Active State**: White bottom border (3px solid)
- **Hover State**: Lighter turquoise or opacity change
- **Font**: Georgian-compatible sans-serif, ~13px, medium weight

**Behavior**:
- Click to navigate to respective sub-page
- Active item shows white bottom border indicator
- All items remain in Patient History module context

---

## Filter Controls Section (Row 3)

### Filter Form Elements

Located between sub-menu and table (~80px height, white background).

#### Element 1: Treating Doctor Dropdown

**Label**: მკურნალი ექიმი
**Label (English)**: Treating Doctor

**Element Specifications**:
- **Type**: `<select>` dropdown
- **ID**: (TBD - needs DOM extraction)
- **Name**: `treating_doctor` (expected)
- **Default Value**: "-"
- **Width**: ~200px
- **Required**: No

**HTML Structure** (Expected):
```html
<div class="filter-group">
  <label for="treating-doctor">მკურნალი ექიმი</label>
  <select id="treating-doctor" name="treating_doctor" class="form-control">
    <option value="">-</option>
    <option value="1">დოქტორი ა</option>
    <option value="2">დოქტორი ბ</option>
    <!-- More doctor options -->
  </select>
</div>
```

**Styling**:
- **Border**: 1px solid #ced4da
- **Border Radius**: 4px
- **Background**: White (#ffffff)
- **Arrow Icon**: Dropdown chevron (▼) on right
- **Padding**: 8-10px
- **Font Size**: ~13px

**Options**:
- Default: "-" (all doctors)
- Populated from doctors/practitioners database
- Format: Doctor name (Last Name, First Name or Full Name)

**Behavior**:
- Click to open dropdown
- Select doctor to filter patients
- Value persists after search
- Resets to "-" when cleared

---

#### Element 2: Department Dropdown

**Label**: განყოფილება
**Label (English)**: Department

**Element Specifications**:
- **Type**: `<select>` dropdown
- **ID**: (TBD - needs DOM extraction)
- **Name**: `department` (expected)
- **Default Value**: "-"
- **Width**: ~200px
- **Required**: No

**HTML Structure** (Expected):
```html
<div class="filter-group">
  <label for="department">განყოფილება</label>
  <select id="department" name="department" class="form-control">
    <option value="">-</option>
    <option value="1">კარდიოლოგია</option>
    <option value="2">ქირურგია</option>
    <!-- More department options -->
  </select>
</div>
```

**Styling**:
- **Border**: 1px solid #ced4da
- **Border Radius**: 4px
- **Background**: White (#ffffff)
- **Arrow Icon**: Dropdown chevron (▼) on right
- **Padding**: 8-10px
- **Font Size**: ~13px

**Options**:
- Default: "-" (all departments)
- Common departments:
  - კარდიოლოგია (Cardiology)
  - ქირურგია (Surgery)
  - თერაპია (Internal Medicine)
  - პედიატრია (Pediatrics)
  - გინეკოლოგია (Gynecology)
  - etc.

**Behavior**:
- Click to open dropdown
- Select department to filter patients
- Value persists after search

---

#### Element 3: Transferred Checkbox

**Label**: გადწერილება
**Label (English)**: Transferred

**Element Specifications**:
- **Type**: `<input type="checkbox">`
- **ID**: (TBD - needs DOM extraction)
- **Name**: `transferred` (expected)
- **Default Value**: Unchecked (false)
- **Width**: ~40px (checkbox + label)
- **Required**: No

**HTML Structure** (Expected):
```html
<div class="filter-group">
  <label for="transferred">გადწერილება</label>
  <input type="checkbox" id="transferred" name="transferred" value="1" />
</div>
```

**Styling**:
- **Size**: ~18px x 18px checkbox
- **Border**: 1px solid #ced4da
- **Background**: White when unchecked, blue when checked
- **Checkmark**: White checkmark on blue background when checked
- **Label Position**: Above checkbox

**Behavior**:
- Click to toggle checked state
- Checked: Filter to show only transferred patients
- Unchecked: Show all patients
- Value persists after search

---

#### Element 4: Registration Number Text Input

**Label**: ისხ #
**Label (English)**: Registration Number

**Element Specifications**:
- **Type**: `<input type="text">`
- **ID**: (TBD - needs DOM extraction)
- **Name**: `registration_number` (expected)
- **Default Value**: Empty
- **Placeholder**: (None visible)
- **Width**: ~150px
- **Required**: No
- **MaxLength**: 15 (expected)

**HTML Structure** (Expected):
```html
<div class="filter-group">
  <label for="registration-number">ისხ #</label>
  <input
    type="text"
    id="registration-number"
    name="registration_number"
    class="form-control"
    placeholder=""
    maxlength="15"
  />
</div>
```

**Styling**:
- **Border**: 1px solid #ced4da
- **Border Radius**: 4px
- **Background**: White (#ffffff)
- **Padding**: 8-10px
- **Font Size**: ~13px
- **Text Color**: #333

**Validation**:
- Type: Alphanumeric
- Pattern: May accept 11-digit format or hyphenated format
- No real-time validation visible

**Behavior**:
- Type to enter registration number
- Search on button click (not real-time)
- Supports partial matching (likely)
- Value persists after search
- Clear to remove filter

---

#### Element 5: Search Button

**Label**: None (icon-only button)
**Icon**: 🔍 Magnifying glass

**Element Specifications**:
- **Type**: `<button type="submit">` or `<button type="button">`
- **ID**: (TBD - needs DOM extraction)
- **Name**: `search_btn` (expected)
- **Width**: ~50px
- **Height**: ~40px

**HTML Structure** (Expected):
```html
<button type="submit" id="search-btn" class="btn btn-primary btn-search">
  <i class="fa fa-search"></i>
</button>
```

**Styling**:
- **Background**: Blue gradient (`linear-gradient(135deg, #1a365d → #2b6cb0 → #3182ce)`)
- **Border**: None or 1px solid darker blue
- **Border Radius**: 4px
- **Color**: White (#ffffff)
- **Icon Size**: ~16-18px
- **Hover State**: Darker blue background
- **Active State**: Even darker blue, slight scale down
- **Cursor**: Pointer

**Behavior**:
- Click to submit filter form
- Triggers search with all active filters
- May show loading spinner during search
- Re-enables after results loaded

**Accessibility**:
- `aria-label="ძებნა"` (Search)
- `title="ძებნა"` for tooltip
- Keyboard: Tab to focus, Enter/Space to click

---

## Right-Side UI Elements

### Additional Buttons (Top-Right Corner)

Visible in screenshot top-right area:

| Button Text | Icon | Purpose | Type | Notes |
|------------|------|---------|------|-------|
| (Not clearly visible) | User icon | User menu dropdown | Dropdown button | Shows logged-in user info |
| (Not clearly visible) | Settings icon | Settings/preferences | Link/button | May open settings panel |
| (Not clearly visible) | Help icon | Help/documentation | Link/button | Opens help documentation |
| (Not clearly visible) | Logout icon | Logout | Button | Logs out current user |

**Note**: Top-right buttons not fully visible in screenshot - requires DOM extraction to confirm

---

## Table Interaction Elements

### Table Header (Column Headers)

Each column header is an interactive element for sorting.

**Element Type**: `<th>` with click handler
**Behavior**: Click to sort, toggle ascending/descending

**Visible Column Headers**:
1. **პორად #** - Sortable (Registration Number)
2. **საწოლი** - Sortable (Bed/First Name)
3. **გვარი** - Sortable (Last Name)
4. **სქესი** - Sortable (Gender)
5. **დაბ. თარიღი** - Sortable (Date of Birth)
6. **ტელეფონი** - Not sortable (Phone)
7. **რეგ.#** - May be sortable (Reg Number)

**Styling**:
- **Background**: Turquoise gradient
- **Text Color**: White (#ffffff), bold
- **Cursor**: Pointer (for sortable columns)
- **Hover State**: Slightly lighter background
- **Sort Indicator**: Arrow icon (▲/▼) appears next to header text

**HTML Structure** (Expected):
```html
<th class="sortable" data-sort-key="lastName" onclick="sortTable('lastName')">
  გვარი <i class="sort-icon fa fa-sort"></i>
</th>
```

---

### Table Rows

Each row is clickable and navigates to patient detail page.

**Element Type**: `<tr>` with click handler
**Behavior**: Click anywhere on row to open patient detail

**Styling**:
- **Default Background**: White (even rows) or light gray #f8f9fa (odd rows)
- **Hover Background**: Light blue (#e3f2fd or similar)
- **Cursor**: Pointer
- **Transition**: 0.2s smooth background transition
- **Active State**: Slightly darker blue on click

**HTML Structure** (Expected):
```html
<tr class="patient-row" data-patient-id="123" onclick="openPatient(123)">
  <td>31001036644</td>
  <td>ზაქარია</td>
  <td>ბექაურია</td>
  <!-- More cells -->
</tr>
```

**Accessibility**:
- `tabindex="0"` for keyboard navigation
- `role="button"` to indicate clickable
- `aria-label="პაციენტის ჩანაწერი: ზაქარია ბექაურია"` (Patient record: Zakaria Bekauria)

---

### Action Buttons (If Present)

**Note**: Not visible in screenshot - may be in additional columns off-screen

**Expected Action Buttons** (based on common EMR patterns):

#### Edit Button
- **Icon**: ✏️ Pencil
- **Action**: Edit patient information
- **Type**: Icon button
- **Styling**: Blue or gray icon, hover shows tooltip
- **Location**: Last column (not visible in screenshot)

#### Delete Button
- **Icon**: 🗑️ Trash can
- **Action**: Delete patient record (admin only)
- **Type**: Icon button
- **Styling**: Red icon, hover shows tooltip
- **Location**: Last column (not visible in screenshot)

#### View Button
- **Icon**: 👁️ Eye or ℹ️ Info
- **Action**: View patient detail (same as row click)
- **Type**: Icon button
- **Styling**: Blue or gray icon
- **Location**: Last column (not visible in screenshot)

**Requires**: DOM extraction to confirm presence and functionality

---

## Form Container

### Overall Form Structure

The filter controls are likely wrapped in a `<form>` element.

**HTML Structure** (Expected):
```html
<form id="patient-filter-form" method="GET" action="/index.php">
  <input type="hidden" name="page" value="my-patients" />

  <div class="filter-container">
    <div class="filter-group">
      <!-- Treating Doctor Dropdown -->
    </div>
    <div class="filter-group">
      <!-- Department Dropdown -->
    </div>
    <div class="filter-group">
      <!-- Transferred Checkbox -->
    </div>
    <div class="filter-group">
      <!-- Registration Number Input -->
    </div>
    <div class="filter-group">
      <!-- Search Button -->
    </div>
  </div>
</form>
```

**Form Behavior**:
- **Method**: GET or POST (likely GET for filters)
- **Action**: Same page URL with query parameters
- **Submission**: Button click or Enter key in text input
- **Reset**: May have hidden reset button or clear functionality

---

## Loading States

### Loading Spinner (Expected)

When search is in progress:

**Element Type**: Spinner or loading indicator
**Location**: Overlay on table or near search button
**Styling**: Blue circular spinner, semi-transparent backdrop

**HTML Structure** (Expected):
```html
<div class="loading-overlay" style="display: none;">
  <div class="spinner"></div>
  <p>იტვირთება...</p> <!-- Loading... -->
</div>
```

**Behavior**:
- Shows when search button clicked
- Hides when results loaded
- Prevents multiple simultaneous searches

---

## Empty State (No Results)

### Empty Table Message

When no patients match filters:

**Element Type**: Empty state message in table body
**Text**: "მონაცემები არ მოიძებნა" (No data found)

**HTML Structure** (Expected):
```html
<tbody>
  <tr class="empty-state">
    <td colspan="7" class="text-center">
      <div class="empty-message">
        <i class="fa fa-inbox fa-3x"></i>
        <p>მონაცემები არ მოიძებნა</p>
        <p class="text-muted">შეცვალეთ ფილტრები და სცადეთ ხელახლა</p>
      </div>
    </td>
  </tr>
</tbody>
```

**Styling**:
- **Text Alignment**: Center
- **Icon**: Large inbox or search icon
- **Text Color**: Gray (#6c757d)
- **Padding**: 40-60px vertical

---

## Tooltips and Help Text

### Field Tooltips (Expected)

Hover tooltips on labels or info icons:

**Examples**:
- **Treating Doctor**: "აირჩიეთ მკურნალი ექიმი პაციენტების ფილტრაციისთვის"
  (Select treating doctor to filter patients)
- **Department**: "აირჩიეთ განყოფილება პაციენტების ფილტრაციისთვის"
  (Select department to filter patients)
- **Transferred**: "მონიშნეთ გადაწერილი პაციენტების სანახავად"
  (Check to view transferred patients)
- **Registration Number**: "შეიყვანეთ რეგისტრაციის ნომერი"
  (Enter registration number)

**Styling**:
- **Background**: Dark gray/black (#333)
- **Text Color**: White
- **Border Radius**: 4px
- **Arrow**: Points to element
- **Animation**: Fade in 0.2s

---

## Keyboard Shortcuts (Expected)

Common keyboard shortcuts for efficiency:

| Shortcut | Action | Notes |
|----------|--------|-------|
| Tab | Navigate between filter controls | Standard tab order |
| Shift+Tab | Navigate backward | Reverse tab order |
| Enter | Submit search (when in text input) | Triggers search |
| Escape | Clear filters or close modals | Reset functionality |
| Arrow Up/Down | Navigate table rows (optional) | Advanced feature |
| Space | Toggle checkbox | Standard checkbox behavior |

---

## Responsive Breakpoints (Expected)

### Desktop (>1200px)
- All filters in single horizontal row
- Table shows all columns
- Full-width layout

### Tablet (768px - 1200px)
- Filters may wrap to 2 rows
- Table may hide less important columns
- Horizontal scrolling on table

### Mobile (<768px)
- Filters stack vertically
- Table switches to card view
- Search button full-width

**Note**: Responsive behavior needs verification with live testing

---

## Browser Compatibility

### Expected Support
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Opera**: 76+

### Known Issues
- Georgian font rendering may vary across browsers
- Ensure UTF-8 encoding for Georgian characters
- Test dropdown rendering on all browsers

---

## Accessibility Features

### ARIA Landmarks
```html
<nav aria-label="პირველადი ნავიგაცია"><!-- Main menu --></nav>
<nav aria-label="პაციენტის ისტორიის ნავიგაცია"><!-- Sub-menu --></nav>
<form role="search" aria-label="პაციენტების ძებნა"><!-- Filter form --></form>
<table role="table" aria-label="ჩემი პაციენტები"><!-- Patient table --></table>
```

### Screen Reader Support
- All form labels properly associated with inputs
- Table headers have `scope` attributes
- Column headers announced before cell content
- Sort state announced on column click

### Keyboard Accessibility
- All interactive elements keyboard accessible
- Logical tab order
- Visible focus indicators
- Skip links (optional)

### Color Contrast
- All text meets WCAG AA standards (4.5:1 contrast ratio)
- Icons have text alternatives
- Link color distinguishable from text

---

## Animation and Transitions

### Hover Transitions
```css
.patient-row {
  transition: background-color 0.2s ease;
}

.patient-row:hover {
  background-color: #e3f2fd;
}
```

### Button Animations
```css
.btn-search {
  transition: all 0.3s ease;
}

.btn-search:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.btn-search:active {
  transform: translateY(0);
}
```

### Loading Spinner
```css
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

---

## Print Stylesheet (Expected)

For printing patient list:

```css
@media print {
  /* Hide navigation and filters */
  nav, .filter-container, .btn-search { display: none; }

  /* Optimize table for print */
  table { width: 100%; font-size: 10pt; }

  /* Remove interactive styles */
  tr:hover { background-color: white !important; }

  /* Add page breaks */
  tr { page-break-inside: avoid; }
}
```

---

## Future Enhancement Suggestions

### UI Improvements
1. **Clear Filters Button**: One-click reset all filters
2. **Recent Searches**: Dropdown showing recent filter combinations
3. **Save Search**: Save common filter presets
4. **Column Visibility Toggle**: Show/hide columns
5. **Density Toggle**: Compact/comfortable/spacious row heights
6. **Quick Filters**: Clickable badges for common filters (e.g., "Transferred", "ICU", etc.)

### Advanced Features
1. **Bulk Actions**: Select multiple patients for group operations
2. **Export Options**: Excel, PDF, CSV export
3. **Print View**: Optimized print layout
4. **Advanced Search**: Modal with more filter options
5. **Search History**: View and reuse past searches
6. **Notifications**: Real-time updates when new patients added

### Accessibility Enhancements
1. **High Contrast Mode**: Toggle for better visibility
2. **Font Size Control**: User-adjustable text size
3. **Voice Commands**: Voice-activated search (advanced)
4. **Screen Reader Optimization**: Enhanced ARIA labels

---

## Implementation Checklist

### Essential Elements
- [ ] Main navigation menu (6 items)
- [ ] Sub-menu navigation (13 items)
- [ ] Treating doctor dropdown with data
- [ ] Department dropdown with data
- [ ] Transferred checkbox
- [ ] Registration number text input
- [ ] Search button with icon
- [ ] Patient table with 7 columns
- [ ] Sortable column headers
- [ ] Clickable table rows
- [ ] Empty state message
- [ ] Loading spinner

### Nice-to-Have Elements
- [ ] Clear filters button
- [ ] Action buttons (edit/delete) in table
- [ ] Pagination controls
- [ ] Export button
- [ ] Print button
- [ ] Help tooltips
- [ ] Keyboard shortcuts
- [ ] Responsive design
- [ ] Print stylesheet
