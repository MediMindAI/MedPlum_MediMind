# My Patients Page - Structure Documentation

## Overview
**Page Name**: ჩემი პაციენტები (My Patients)
**Module**: პაციენტის ისტორია (Patient History)
**Purpose**: Display and manage a list of patients assigned to the current healthcare provider
**Extraction Date**: 2025-11-14
**Source**: http://178.134.21.82:8008/index.php

## Navigation Path

```
Main Menu: პაციენტის ისტორია (Patient History)
  └── Sub-menu: ჩემი პაციენტები (My Patients)
```

## Page Layout

The page follows a 4-section vertical layout:

```
┌─────────────────────────────────────────────────────────┐
│ Section 1: Top Navigation Bar                          │
│ (Gray background, ~40px height)                        │
├─────────────────────────────────────────────────────────┤
│ Section 2: Sub-Menu Tabs                               │
│ (Turquoise/teal background, ~45px height)              │
│ - ისტორია (History)                                     │
│ - ჩემი პაციენტები (My Patients) ← ACTIVE              │
│ - სუროგაცია (Surrogacy)                                │
│ - ... (other menu items)                               │
├─────────────────────────────────────────────────────────┤
│ Section 3: Search/Filter Controls                      │
│ (White background, ~80px height)                       │
│ - Left side: Dropdowns and filters                     │
│ - Right side: Search button                            │
├─────────────────────────────────────────────────────────┤
│ Section 4: Data Table                                  │
│ (Fills remaining vertical space)                       │
│ - Turquoise table header                               │
│ - White alternating rows                               │
│ - Scrollable content area                              │
└─────────────────────────────────────────────────────────┘
```

## Section Details

### Section 1: Top Navigation Bar
- **Height**: ~40px
- **Background**: Light gray (#e9ecef or similar)
- **Contains**: 6 main menu items
  1. რეგისტრაცია (Registration)
  2. პაციენტის ისტორია (Patient History) ← ACTIVE
  3. ნომენკლატურა (Nomenclature)
  4. ადმინისტრირება (Administration)
  5. ფორმები (Forms)
  6. ანგარიშები (Reports)

### Section 2: Sub-Menu Navigation
- **Height**: ~45px
- **Background**: Turquoise gradient
- **Active State**: White bottom border (3px)
- **Menu Items** (left to right):
  1. ისტორია (History)
  2. **ჩემი პაციენტები (My Patients)** ← ACTIVE
  3. სუროგაცია (Surrogacy)
  4. ინვოისები (Invoices)
  5. 100 რეკორდი (100 Records)
  6. განრიგი (Schedule)
  7. მესანჯერი (Messenger)
  8. ლაბორატორია (Laboratory)
  9. მორიგეობა (Duty/On-call)
  10. დანიშნულება (Appointments)
  11. სტაციონარი (Stationary/Inpatient)
  12. კვება (Nutrition)
  13. MOH (Ministry of Health)

### Section 3: Search/Filter Controls
**Layout**: Horizontal flex layout with labels and inputs

**Left Side Controls** (3 columns):

1. **მკურნალი ექიმი** (Treating Doctor)
   - Type: Dropdown select
   - Default: "-" (placeholder)
   - Width: ~200px

2. **განყოფილება** (Department)
   - Type: Dropdown select
   - Default: "-" (placeholder)
   - Width: ~200px

3. **გადწერილება** (Transferred)
   - Type: Checkbox
   - Label position: Above checkbox
   - Default: Unchecked

**Right Side Controls**:

4. **ისხ #** (Registration Number)
   - Type: Text input
   - Width: ~150px
   - Placeholder: Empty
   - Label position: Above input

5. **Search Button**
   - Type: Button with icon
   - Icon: Magnifying glass (🔍)
   - Background: Blue gradient
   - Position: Aligned with inputs

### Section 4: Data Table
- **Header Background**: Turquoise gradient
- **Header Text Color**: White
- **Row Background**: Alternating white/light gray
- **Border**: 1px solid light gray between cells
- **Scrollable**: Vertical scrolling enabled
- **Row Count**: Displays multiple patient records

## Visual Characteristics

### Color Scheme
- **Primary Background**: White (#ffffff)
- **Header Background**: Turquoise/teal (#17a2b8 or similar)
- **Hover State**: Light blue overlay
- **Active Tab**: White bottom border
- **Text Color**: Dark gray/black (#333 or similar)

### Typography
- **Font Family**: Georgian-compatible sans-serif (likely "BPG Arial", "Sylfaen", or system Georgian font)
- **Header Font Size**: ~14px, bold
- **Body Font Size**: ~12-13px, regular
- **Label Font Size**: ~11-12px

### Spacing
- **Section Padding**: 10-15px horizontal, 8-10px vertical
- **Table Cell Padding**: 8-10px
- **Input Spacing**: 10px gap between filter controls

## Responsive Behavior
- **Minimum Width**: ~1200px (appears to be fixed-width design)
- **Table Scrolling**: Horizontal scroll if content exceeds viewport
- **Filter Layout**: Remains horizontal (no wrapping observed)

## Accessibility Features
- Labels positioned above form controls
- Clear visual hierarchy with section separation
- High contrast text on backgrounds
- Clickable row areas in table

## Integration Points

### Links to Other Modules
- **From Patient History Menu**: Main menu "პაციენტის ისტორია" links to this module
- **To Patient Detail**: Clicking table rows likely navigates to individual patient view
- **To Registration**: Link from top menu "რეგისტრაცია"

### Data Dependencies
- **User Context**: Page shows "my patients" - requires logged-in doctor/provider ID
- **Department Data**: Filter requires list of departments
- **Doctor List**: Filter requires list of doctors (for filtering if admin)
- **Patient Data**: Table populated from patient database with filters applied

## Notes
- Page designed for desktop use (fixed-width layout)
- Georgian language primary (no language switcher visible on this page)
- Search/filter operates on server-side (likely refreshes table on submit)
- Table does not appear to have inline editing (view-only display)
- No pagination controls visible in screenshot (may be below table or using infinite scroll)
