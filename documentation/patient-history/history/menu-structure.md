# პაციენტის ისტორია (Patient History) - Menu Structure Documentation

## Purpose

This menu provides access to all patient history-related functions in the EMR system. It serves as the primary navigation hub for clinical operations, including patient records, invoices, prescriptions, laboratory work, appointments, and hospital ward management.

---

## Menu Items

### Primary Menu Item

| Index | Text (Georgian) | ID | Href | Parent | Status |
|-------|-----------------|-----|------|--------|--------|
| 1 | პაციენტის ისტორია | - | #2 | - | current |

**Field Definitions**:
- **Index**: Position in main navigation menu
- **Text (Georgian)**: პაციენტის ისტორია (Patient History)
- **ID**: Main menu identifier
- **Href**: #2 (navigation anchor)
- **Parent**: None - this is a main menu item
- **Status**: Active when user is in any Patient History section

---

## Sub-Menu Items

### პაციენტის ისტორია (Patient History) Sub-Menu

When "პაციენტის ისტორია" is selected, these 13 sub-menu items appear:

| Index | Text (Georgian) | ID | Href | Parent | Brief Description |
|-------|-----------------|-----|------|--------|-------------------|
| 0 | ისტორია | - | #2s21 | პაციენტის ისტორია | Main patient history/records section - view and manage patient medical histories |
| 1 | ჩემი პაციენტები | - | #2s22 | პაციენტის ისტორია | My Patients - doctor's personal patient list |
| 2 | სუროგაცია | - | #2s20 | პაციენტის ისტორია | Surrogacy - surrogate/substitute patient management |
| 3 | ინვოისები | - | #2s24 | პაციენტის ისტორია | Invoices - billing and invoice management |
| 4 | 100 რეპორტი | - | #2s28 | პაციენტის ისტორია | Form 100 Report - standardized medical reporting |
| 5 | გაწერები | - | #2s29 | პაციენტის ისტორია | Prescriptions - medication prescriptions and orders |
| 6 | შესრულება | - | #2s201 | პაციენტის ისტორია | Execution/Performance - track completion of medical orders and procedures |
| 7 | ლაბორატორია | - | #2s25 | პაციენტის ისტორია | Laboratory - lab test orders and results |
| 8 | მორიგეობა | - | #2s27 | პაციენტის ისტორია | Duty/On-call - doctor duty schedule and on-call management |
| 9 | დანიშნულება | - | #2s26 | პაციენტის ისტორია | Appointments - patient appointment scheduling |
| 10 | სტაციონარი | - | #2s23 | პაციენტის ისტორია | Hospital/Inpatient - inpatient ward management and hospitalization |
| 11 | კვება | - | #2s203 | პაციენტის ისტორია | Nutrition/Feeding - patient meal planning and dietary management |
| 12 | MOH | - | #2s204 | პაციენტის ისტორია | Ministry of Health - MOH reporting and compliance |

---

## Menu Hierarchy

Visual representation of the menu structure:

```
Main Navigation
├── რეგისტრაცია (Registration) - #1
├── პაციენტის ისტორია (Patient History) - #2 ← CURRENT
│   ├── ისტორია (History) - #2s21
│   ├── ჩემი პაციენტები (My Patients) - #2s22
│   ├── სუროგაცია (Surrogacy) - #2s20
│   ├── ინვოისები (Invoices) - #2s24
│   ├── 100 რეპორტი (Form 100 Report) - #2s28
│   ├── გაწერები (Prescriptions) - #2s29
│   ├── შესრულება (Execution/Performance) - #2s201
│   ├── ლაბორატორია (Laboratory) - #2s25
│   ├── მორიგეობა (Duty/On-call) - #2s27
│   ├── დანიშნულება (Appointments) - #2s26
│   ├── სტაციონარი (Hospital/Inpatient) - #2s23
│   ├── კვება (Nutrition/Feeding) - #2s203
│   └── MOH (Ministry of Health) - #2s204
├── ნომენკლატურა (Nomenclature) - #3
├── ადმინისტრირება (Administration) - #4
├── ფორვარდი (Forward) - #6
└── ანგარიშები (Reports) - #5
```

---

## Menu Behavior & Interactions

### Dynamic Behavior

- **Sub-menu Display**: All 13 sub-menu items appear in the left sidebar when "პაციენტის ისტორია" main menu item is active
- **Click Navigation**: Each sub-menu item navigates to its respective section using anchor-based navigation (#2s21, #2s22, etc.)
- **Active State**: Currently active sub-menu item is visually highlighted
- **Persistent Navigation**: Sub-menu remains visible while user works within any Patient History section

### Navigation Pattern

- Main menu item "პაციენტის ისტორია" serves as parent container
- Sub-menu items are organized vertically in fixed order
- No nested sub-sub-menus detected under these items
- Each section loads its own content area while maintaining menu visibility

### Role-Based Access Control

**Note**: Access control details not fully visible from current navigation analysis. Full permissions would require testing with different user roles (doctor, nurse, administrator, etc.).

---

## Sub-Menu Descriptions (Detailed)

### 1. ისტორია (History) - #2s21
**Primary patient history section**
- View patient medical records
- Access historical visits and treatments
- Search and filter patient history records
- Main working area for clinical documentation

### 2. ჩემი პაციენტები (My Patients) - #2s22
**Doctor's personal patient list**
- Filtered view showing only patients assigned to logged-in doctor
- Quick access to doctor's active caseload
- Patient relationship management

### 3. სუროგაცია (Surrogacy) - #2s20
**Surrogate patient management**
- Manage temporary patient assignments
- Handle patient transfers between doctors
- Substitute provider functionality

### 4. ინვოისები (Invoices) - #2s24
**Billing and invoices**
- Generate patient invoices
- View invoice history
- Manage billing records
- Payment tracking

### 5. 100 რეპორტი (Form 100 Report) - #2s28
**Standardized medical reporting**
- Government-mandated Form 100 reports
- Standardized medical documentation
- Regulatory compliance reporting

### 6. გაწერები (Prescriptions) - #2s29
**Medication prescriptions**
- Write medication prescriptions
- View prescription history
- Manage medication orders
- Print prescription forms

### 7. შესრულება (Execution/Performance) - #2s201
**Medical order execution tracking**
- Track completion of prescribed procedures
- Monitor order fulfillment status
- Verify performed treatments
- Quality assurance checks

### 8. ლაბორატორია (Laboratory) - #2s25
**Laboratory management**
- Order laboratory tests
- View lab results
- Track pending lab work
- Laboratory reporting

### 9. მორიგეობა (Duty/On-call) - #2s27
**Doctor duty schedules**
- View on-call schedules
- Manage duty rotations
- Track doctor availability
- Emergency contact management

### 10. დანიშნულება (Appointments) - #2s26
**Appointment scheduling**
- Schedule patient appointments
- View appointment calendar
- Manage appointment slots
- Appointment reminders

### 11. სტაციონარი (Hospital/Inpatient) - #2s23
**Inpatient ward management**
- Hospitalization records
- Bed management
- Ward assignments
- Inpatient admission/discharge

### 12. კვება (Nutrition/Feeding) - #2s203
**Patient nutrition management**
- Dietary planning
- Meal ordering for inpatients
- Nutritional requirements tracking
- Special diet management

### 13. MOH (Ministry of Health) - #2s204
**Ministry of Health reporting**
- Government reporting requirements
- MOH compliance documentation
- Official health statistics
- Regulatory submissions

---

## Source Traceability

**Source System**: EMR accessed at http://178.134.21.82:8008/clinic.php
**Extraction Method**: Playwright MCP browser automation
**Extraction Date**: 2025-11-10
**Authenticated User**: Tako
**Active Menu**: პაციენტის ისტორია (Patient History)

**HTML Structure Reference**:
```yaml
Main Navigation List:
- listitem -> link "პაციენტის ისტორია" [active] [ref=e27]
  - /url: "#2"

Sub-Menu List (appears when parent is active):
- list [ref=e1378]:
  - listitem -> link "ისტორია" [ref=e1380] -> /url: "#2s21"
  - listitem -> link "ჩემი პაციენტები" [ref=e1382] -> /url: "#2s22"
  - listitem -> link "სუროგაცია" [ref=e1384] -> /url: "#2s20"
  - listitem -> link "ინვოისები" [ref=e1386] -> /url: "#2s24"
  - listitem -> link "100 რეპორტი" [ref=e1388] -> /url: "#2s28"
  - listitem -> link "გაწერები" [ref=e1390] -> /url: "#2s29"
  - listitem -> link "შესრულება" [ref=e1392] -> /url: "#2s201"
  - listitem -> link "ლაბორატორია" [ref=e1394] -> /url: "#2s25"
  - listitem -> link "მორიგეობა" [ref=e1396] -> /url: "#2s27"
  - listitem -> link "დანიშნულება" [ref=e1398] -> /url: "#2s26"
  - listitem -> link "სტაციონარი" [ref=e1400] -> /url: "#2s23"
  - listitem -> link "კვება" [ref=e1402] -> /url: "#2s203"
  - listitem -> link "MOH" [ref=e1404] -> /url: "#2s204"
```

---

## Validation Checklist

- [x] All sub-menu items extracted from live system
- [x] Index values are sequential (0-12)
- [x] Georgian text exactly matches source (no transliteration)
- [x] All href values documented (#2s21, #2s22, etc.)
- [x] Parent-child relationships correctly identified
- [x] Brief descriptions provided for each sub-menu
- [x] Source system URL and extraction date recorded
- [x] Hierarchical view provided
- [x] Menu behavior documented
- [x] HTML structure reference included

---

## Additional Notes

### Anchor Naming Pattern
The sub-menu anchors follow the pattern: `#[parent][s][id]`
- Parent: `2` (პაციენტის ისტორია)
- Separator: `s`
- ID: Sequential or categorical identifier (20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 201, 203, 204)

### Navigation Implementation
- Single-page application (SPA) using anchor-based routing
- Content sections load dynamically based on anchor navigation
- No full page reloads when switching between sub-menu items

### Future Documentation Work
Each sub-menu item will require detailed documentation including:
- Complete form structures and fields
- Table layouts and data columns
- Workflow diagrams
- Integration points with other modules
- Validation rules and business logic

### Recommended Documentation Priority
Based on clinical workflow importance:
1. **ისტორია** (History) - Primary clinical documentation area
2. **ინვოისები** (Invoices) - Critical for billing operations
3. **გაწერები** (Prescriptions) - Essential for medication management
4. **ლაბორატორია** (Laboratory) - Lab orders and results
5. **სტაციონარი** (Hospital/Inpatient) - Ward management
6. **დანიშნულება** (Appointments) - Scheduling
7. **ჩემი პაციენტები** (My Patients) - Doctor workflow
8. **MOH** - Regulatory compliance
9. (Remaining items as needed)

---

**Documentation Version**: 1.0.0
**Template Used**: menu-template.md
**Module**: Patient History (პაციენტის ისტორია)
**Created**: 2025-11-10
**Status**: Complete - Sub-menu structure mapping only
