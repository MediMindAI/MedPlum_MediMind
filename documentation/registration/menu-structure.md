# Menu Structure Documentation

This document maps the complete menu hierarchy of the Registration module in the EMR system.

---

## Registration Sub-Menu

When **რეგისტრაცია** (Registration) is selected from the top menu, these 9 sub-tabs appear:

### Sub-Menu Navigation Table

| Index | Text (Georgian) | ID | Href | Parent | Status |
|-------|----------------|-----|------|--------|--------|
| 0 | რეგისტრაცია | tab_1 | #1s11 | რეგისტრაცია | current |
| 1 | მიმღები | tab_2 | #1s16 | რეგისტრაცია | inactive |
| 2 | კონტრაქტები | tab_3 | #1s12 | რეგისტრაცია | inactive |
| 3 | სტაციონარი | tab_4 | #1s15 | რეგისტრაცია | inactive |
| 4 | ვალები | tab_5 | #1s17 | რეგისტრაცია | inactive |
| 5 | ავანსები | tab_6 | #1s19 | რეგისტრაცია | inactive |
| 6 | არქივი | tab_7 | #1s18 | რეგისტრაცია | inactive |
| 7 | მიმართვები | tab_8 | #1s14 | რეგისტრაცია | inactive |
| 8 | ვალუტა | tab_9 | #1s101 | რეგისტრაცია | inactive |

### Sub-Menu Items Description

1. **რეგისტრაცია** (Registration) - Patient registration form and search
2. **მიმღები** (Receiver/Admission) - Patient admission management
3. **კონტრაქტები** (Contracts) - Contract management
4. **სტაციონარი** (Inpatient) - Inpatient/hospital stay management
5. **ვალები** (Debts) - Debt tracking and management
6. **ავანსები** (Advances) - Advance payments tracking
7. **არქივი** (Archive) - Archived records
8. **მიმართვები** (Referrals) - Patient referrals management
9. **ვალუტა** (Currency) - Currency management

### Navigation Behavior

- The first sub-menu item (რეგისტრაცია) is set as "current" by default when the Registration main menu is selected
- All other sub-menu items are initially "inactive"
- Each sub-menu item has a unique href anchor (e.g., #1s11, #1s16, etc.) that corresponds to specific content sections
- The ID follows a sequential pattern: tab_1 through tab_9

---

## Source Traceability

**Source File**: `/Users/toko/Desktop/SoftMedicMap/რეგისტრაცია_რეგისტრაცია.md`
**Source Lines**: 45-104
**Menu Type**: Sub Menu
**Selector**: `#subme`
**Parent Menu**: რეგისტრაცია (Registration)

This documentation was extracted from the JSON structure that defines the Registration module's sub-menu navigation system.

---

## Menu Hierarchy Visualization

### Complete EMR Navigation Tree

```
EMR System - Main Menu
│
├─ რეგისტრაცია (tab_1, #1) ← ACTIVE
│  │
│  └─ Registration Sub-Menu
│     ├─ რეგისტრაცია (tab_1, #1s11) ← CURRENT SECTION
│     ├─ მიმღები (tab_2, #1s16)
│     ├─ კონტრაქტები (tab_3, #1s12)
│     ├─ სტაციონარი (tab_4, #1s15)
│     ├─ ვალები (tab_5, #1s17)
│     ├─ ავანსები (tab_6, #1s19)
│     ├─ არქივი (tab_7, #1s18)
│     ├─ მიმართვები (tab_8, #1s14)
│     └─ ვალუტა (tab_9, #1s101)
│
├─ პაციენტის ისტორია (tab_2, #2)
│  └─ [Sub-menu items not documented]
│
├─ ნომენკლატურა (tab_3, #3)
│  └─ [Sub-menu items not documented]
│
├─ ადმინისტრირება (tab_4, #4)
│  └─ [Sub-menu items not documented]
│
├─ ფორვარდი (tab_5, #6)
│  └─ [Sub-menu items not documented]
│
└─ ანგარიშები (tab_6, #5)
   └─ [Sub-menu items not documented]
```

### Detailed Registration Sub-Menu Tree

```
რეგისტრაცია (Registration Module)
│
├─ 0. რეგისტრაცია (tab_1, #1s11) ← CURRENT
│     Patient registration form and search functionality
│
├─ 1. მიმღები (tab_2, #1s16)
│     Patient admission and intake management
│
├─ 2. კონტრაქტები (tab_3, #1s12)
│     Contract and agreement management
│
├─ 3. სტაციონარი (tab_4, #1s15)
│     Inpatient and hospital stay management
│
├─ 4. ვალები (tab_5, #1s17)
│     Debt tracking and management
│
├─ 5. ავანსები (tab_6, #1s19)
│     Advance payments and prepayments
│
├─ 6. არქივი (tab_7, #1s18)
│     Archived records and historical data
│
├─ 7. მიმართვები (tab_8, #1s14)
│     Patient referrals and redirections
│
└─ 8. ვალუტა (tab_9, #1s101)
      Currency management and exchange rates
```

### Navigation Notes

1. **Main Menu Persistence**: The main menu (6 items) is always visible across all pages and sections of the EMR system

2. **Sub-Menu Context Sensitivity**: Sub-menus appear only when their parent main menu item is selected:
   - When რეგისტრაცია is selected → Registration sub-menu (9 items) appears
   - When other main menu items are selected → Their respective sub-menus appear

3. **Current Active Path**:
   - Main Menu: რეგისტრაცია (Registration)
   - Sub-Menu: რეგისტრაცია (Patient Registration Form)
   - Full Path: `Main Menu > რეგისტრაცია > რეგისტრაცია`

4. **Href Anchor Pattern**:
   - Main menu items use simple anchors: `#1`, `#2`, `#3`, etc.
   - Sub-menu items use compound anchors: `#1s11`, `#1s16`, `#1s12`, etc.
   - Pattern: `#{parent_menu_number}s{section_number}`

5. **Navigation Flow**:
   ```
   User clicks "რეგისტრაცია" (Main Menu)
        ↓
   Sub-menu with 9 items appears
        ↓
   User is on "რეგისტრაცია" sub-item by default
        ↓
   User can navigate to other sub-items or main menu items
   ```
