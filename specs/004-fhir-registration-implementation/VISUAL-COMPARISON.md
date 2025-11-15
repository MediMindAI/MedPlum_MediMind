# Registration Page - Visual Comparison

**Original EMR vs. Current Implementation**

---

## Layout Comparison

### Original EMR (Single Page)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Top Navigation Bar                          │ ← Gray #e9ecef
├─────────────────────────────────────────────────────────────────────┤
│                        Main Menu (Blue/Turq)                        │
├─────────────────────────────────────────────────────────────────────┤
│  [რეგისტრაციაში] [მიმღები] [კონტრაქტები] ...                       │ ← Turquoise tabs
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────────┬──────────────────────────────────────┐ │
│  │  SEARCH (35%)          │  REGISTER (65%)                      │ │
│  ├────────────────────────┼──────────────────────────────────────┤ │
│  │ პაციენტის მოძებნა      │  პაციენტის დამატება                  │ │ ← Headers
│  ├────────────────────────┼──────────────────────────────────────┤ │
│  │                        │                                      │ │
│  │ სახელი:                │  პირადი ნომერი:       ☐ უცნობი      │ │
│  │ [____________]         │  [___________________]               │ │
│  │                        │                                      │ │
│  │ გვარი:                 │  სახელი:*            მამის სახელი    │ │
│  │ [____________]         │  [_________]         [_________]     │ │
│  │                        │                                      │ │
│  │ პირადი ნომერი:         │  გვარი:*             ტელეფონი        │ │
│  │ [____________]         │  [_________]         [+995][555...]  │ │
│  │                        │                                      │ │
│  │ რეგისტრაცია ნომერი:    │  დაბადების თარიღი    სქესი           │ │
│  │ [____________]         │  [___________]       [dropdown ▼]    │ │
│  │                        │                                      │ │
│  │      [ 🔍 ]            │  იმეილი              მოქალაქეობა     │ │
│  │    (centered)          │  [_________]         [საქართველო▼]  │ │
│  │                        │                                      │ │
│  │                        │  მისამართი                           │ │
│  │                        │  [_________________________________] │ │
│  │                        │                                      │ │
│  │                        │  სამუშაო                             │ │
│  │                        │  [_________]                         │ │
│  │                        │                                      │ │
│  │                        │              [დამატება ▼]            │ │ ← Turquoise
│  └────────────────────────┴──────────────────────────────────────┘ │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ PATIENT TABLE (100% WIDTH)                                  │   │
│  ├──────┬───────────┬────────┬──────────────┬──────────┬──────┤   │
│  │ რეგი#│პირადი ნ.  │ სახელი │    გვარი     │ დაბ.თარ. │ სქესი│   │ ← Turquoise header
│  ├──────┼───────────┼────────┼──────────────┼──────────┼──────┤   │
│  │99091 │01027072038│ ლაშა   │ ამირანაშვილი │23-04-2000│ მამრ.│   │ ← Light green highlight
│  │99090 │62502024035│ გვანცა  │ ჩიჩუა        │19-02-1997│ მამრ.│   │
│  │99080 │62007011312│ ლენა   │ ხვიდელიანი   │30-01-1973│ მამრ.│   │
│  │...   │...        │...     │...           │...       │...   │   │
│  └──────┴───────────┴────────┴──────────────┴──────────┴──────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Key Features**:
- ✅ Single page, no navigation required
- ✅ Search left, register right (side-by-side)
- ✅ Results table visible at all times
- ✅ Turquoise gradient theme
- ✅ Light green search highlighting
- ✅ International phone input (flag + code)
- ✅ Submit dropdown button

---

### Current Implementation (Separate Pages)

#### Page 1: `/emr/registration/patient-list`

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Top Navigation Bar                          │
├─────────────────────────────────────────────────────────────────────┤
│                        Main Menu (Blue)                             │
├─────────────────────────────────────────────────────────────────────┤
│  [რეგისტრაციაში] [მიმღები] [კონტრაქტები] ...                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PATIENT SEARCH                                                     │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Search Form (Full Width)                                    │   │
│  │                                                             │   │
│  │ First Name:         Last Name:          Personal ID:       │   │
│  │ [___________]       [___________]        [___________]      │   │
│  │                                                             │   │
│  │ Birth Date:         Gender:              Phone:            │   │
│  │ [___________]       [dropdown ▼]         [___________]      │   │
│  │                                                             │   │
│  │ [Search Button] [Clear Button] [Export Button]             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ PATIENT TABLE                                               │   │
│  ├──────────┬────────┬────────┬──────────┬────────┬──────────┤   │
│  │Personal ID│ First │ Last   │Birth Date│ Gender │ Actions  │   │ ← Blue header
│  ├──────────┼────────┼────────┼──────────┼────────┼──────────┤   │
│  │01027...  │ Lasha  │ Amir.. │23-04-2000│ Male   │ [✏️][🗑️] │   │ ← White rows
│  │...       │ ...    │ ...    │...       │ ...    │ [✏️][🗑️] │   │
│  └──────────┴────────┴────────┴──────────┴────────┴──────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**User must click "New Patient" button to navigate ↓**

---

#### Page 2: `/emr/registration/new-patient`

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Top Navigation Bar                          │
├─────────────────────────────────────────────────────────────────────┤
│                        Main Menu (Blue)                             │
├─────────────────────────────────────────────────────────────────────┤
│  [რეგისტრაციაში] [მიმღები] [კონტრაქტები] ...                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PATIENT REGISTRATION                                               │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Registration Form (Centered, Single Column)                 │   │
│  │                                                             │   │
│  │ ☐ Unknown Patient                                           │   │
│  │                                                             │   │
│  │ Personal ID:*                    First Name:*               │   │
│  │ [___________________]            [___________]              │   │
│  │                                                             │   │
│  │ Last Name:*                      Father's Name:             │   │
│  │ [___________]                    [___________]              │   │
│  │                                                             │   │
│  │ Birth Date:                      Gender:*                   │   │
│  │ [___________]                    [dropdown ▼]               │   │
│  │                                                             │   │
│  │ Phone:                           Email:                     │   │
│  │ [+995555123456]                  [___________]              │   │ ← Simple input
│  │                                                             │   │
│  │ Address:                                                    │   │
│  │ [___________________________________________________]       │   │ ← Textarea
│  │ [___________________________________________________]       │   │
│  │                                                             │   │
│  │ Citizenship:                     Workplace:                 │   │
│  │ [საქართველო ▼]                  [___________]              │   │
│  │                                                             │   │
│  │                         [Cancel] [Register]                 │   │ ← Blue button
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**User must click "Back" or navigate to see table again ↑**

---

## Side-by-Side Feature Comparison

| Feature | Original EMR | Current | Gap |
|---------|--------------|---------|-----|
| **Layout** | Single page, 2-column | 2 separate pages | 🔴 HIGH |
| **Search Form Location** | Left side (35%) | Full page | 🔴 HIGH |
| **Registration Form Location** | Right side (65%) | Separate page | 🔴 HIGH |
| **Table Visibility** | Always visible | Only on search page | 🔴 HIGH |
| **Navigation Required** | None (all on one page) | 2-3 clicks | 🔴 HIGH |
| **Search Fields** | 4 (name, lastname, ID, reg#) | 6 (more than original) | 🟡 MEDIUM |
| **Registration Number Search** | ✅ Yes | ❌ No | 🔴 HIGH |
| **Table Search Highlighting** | ✅ Light green (#c6efce) | ❌ None | 🔴 HIGH |
| **Phone Input** | ✅ Flag + code dropdown | ❌ Simple text | 🟡 MEDIUM |
| **Submit Button** | ✅ Dropdown (4 options) | ❌ Simple button | 🟡 MEDIUM |
| **Address Field** | ✅ Single-line input | ❌ Multi-line textarea | 🟢 LOW |
| **Primary Color** | ✅ Turquoise (#17a2b8) | ❌ Blue (#228be6) | 🟢 LOW |
| **Table Header** | ✅ Turquoise gradient | ❌ Blue solid | 🟢 LOW |
| **Section Headers** | ✅ Light gray background | ❌ Plain text | 🟢 LOW |
| **Search Button** | ✅ Icon only (🔍) | ❌ Button with text | 🟢 LOW |

---

## User Flow Comparison

### Original EMR User Flow (Optimal)

```
1. Click "რეგისტრაციაში" tab
   ↓
2. See entire page with:
   - Search form (left)
   - Registration form (right)
   - Patient table (bottom)
   ↓
3a. Search for patient:
    - Enter search criteria
    - Click 🔍 icon
    - Results highlighted in table below
    - Click edit icon
    ↓
3b. Register new patient:
    - Fill form on right
    - Click "დამატება"
    - Patient appears in table immediately
    - Form stays visible for next registration

Total clicks: 2 (navigate + action)
Total pages: 1
Context switches: 0
```

---

### Current Implementation User Flow (Suboptimal)

```
1. Click "რეგისტრაციაში" tab
   ↓
2. Lands on PatientListView (/patient-list)
   - See search form
   - See patient table
   - NO registration form visible
   ↓
3a. Search for patient:
    - Enter search criteria
    - Click "Search" button
    - Results appear in table (NO highlighting)
    - Click edit icon
    ↓
3b. Register new patient:
    - Click "New Patient" button in top menu
    - Navigate to /new-patient (NEW PAGE)
    - See registration form only
    - NO table visible
    - NO search visible
    - Fill form
    - Click "Register"
    - Navigate to patient detail (NEW PAGE)
    OR
    - Navigate back to /patient-list (NEW PAGE)

Total clicks: 4-5 (navigate + new patient + action + back)
Total pages: 3 (list, form, detail/list)
Context switches: 2-3
```

**Result**: 2-3x more clicks, 3x more pages, lost context

---

## Visual Design Comparison

### Color Palette

| Element | Original EMR | Current | Match? |
|---------|--------------|---------|--------|
| Primary brand color | Turquoise #17a2b8 | Blue #228be6 | ❌ |
| Table header background | Turquoise gradient | Blue solid | ❌ |
| Table header text | White | White | ✅ |
| Search highlight (row) | Light green #c6efce | None | ❌ |
| Search highlight (cell) | Light green #c6efce | None | ❌ |
| Submit button | Turquoise gradient | Blue gradient | ❌ |
| Section headers | Light gray #f8f9fa | Plain | ❌ |
| Form borders | Light gray #ced4da | Light gray | ✅ |
| Text color | Dark #212529 | Dark | ✅ |

**Color match score**: 40% (4/10)

---

### Typography

| Element | Original EMR | Current | Match? |
|---------|--------------|---------|--------|
| Section headers | 16px bold | 20px bold | 🟡 Close |
| Form labels | 14px medium | 14px medium | ✅ |
| Input text | 14px regular | 14px regular | ✅ |
| Table headers | 14px bold white | 14px bold white | ✅ |
| Table data | 13px regular | 13px regular | ✅ |
| Button text | 14px medium white | 14px medium white | ✅ |

**Typography match score**: 83% (5/6)

---

### Spacing & Layout

| Element | Original EMR | Current | Match? |
|---------|--------------|---------|--------|
| Left column width | 35% | N/A (no columns) | ❌ |
| Right column width | 65% | N/A (no columns) | ❌ |
| Field vertical spacing | 12px | 16px | 🟡 Close |
| Container padding | 16px | 16px | ✅ |
| Input height | 36px | 36px | ✅ |
| Button height | 40px | 36px | 🟡 Close |
| Border radius | 4px | 4px | ✅ |

**Layout match score**: 43% (3/7)

---

## Component Comparison

### Phone Input Component

**Original EMR**:
```
┌─────────────────────────────────┐
│ [🇬🇪 +995 ▼] [555 12 34 56]    │
│  Flag Code    Formatted Number  │
└─────────────────────────────────┘

Features:
- Country flag icon
- Searchable country dropdown
- Auto-updated country code (+995, +1, etc.)
- Auto-formatted phone (spaces between groups)
- Validates per country format
```

**Current Implementation**:
```
┌─────────────────────────────────┐
│ [+995555123456]                 │
│  Simple Text Input              │
└─────────────────────────────────┘

Features:
- Plain text input
- No country selection
- No auto-formatting
- Generic validation
```

**Gap**: Missing international phone component

---

### Submit Button

**Original EMR**:
```
┌──────────────────┐
│ დამატება      ▼ │  ← Turquoise gradient, dropdown arrow
└──────────────────┘

Clicking arrow opens menu:
├─ შენახვა (Save)
├─ შენახვა და გაგრძელება (Save and Continue)
├─ შენახვა და ახალი (Save and New)
└─ შენახვა და ნახვა (Save and View)

Features:
- Primary action: Save (click button)
- Dropdown: Additional actions (click arrow)
- Turquoise gradient background
- White text
```

**Current Implementation**:
```
┌──────────────────┐
│ Register         │  ← Blue solid, no dropdown
└──────────────────┘

Features:
- Single action only
- Blue Mantine theme
- White text
```

**Gap**: Missing multi-action dropdown

---

### Table Search Highlighting

**Original EMR**:
```
Table with search for "01027072038":

┌──────┬─────────────┬────────┬──────────────┐
│ რეგი#│  პირადი ნ.  │ სახელი │    გვარი     │
├──────┼─────────────┼────────┼──────────────┤
│99091 │ 01027072038 │ ლაშა   │ ამირანაშვილი │  ← Light green row (#c6efce)
│      │ ^^^GREEN^^^ │        │              │  ← Personal ID cell also green
├──────┼─────────────┼────────┼──────────────┤
│99090 │ 62502024035 │ გვანცა  │ ჩიჩუა        │  ← White (no match)
└──────┴─────────────┴────────┴──────────────┘

Features:
- Matching rows: light green background
- Matching cells: light green background + bold
- Non-matching: white background
- Clear visual feedback
```

**Current Implementation**:
```
Table with search for "01027072038":

┌──────────┬────────┬────────┬──────────┐
│Personal ID│ First │ Last   │Birth Date│
├──────────┼────────┼────────┼──────────┤
│01027...  │ Lasha  │ Amir.. │23-04-2000│  ← White (should be green)
├──────────┼────────┼────────┼──────────┤
│62502...  │ Gvantsa│ Chichua│19-02-1997│  ← White (correct)
└──────────┴────────┴────────┴──────────┘

Features:
- All rows same color
- No highlighting
- No bold text on matches
- No visual feedback
```

**Gap**: Missing search result highlighting

---

## Interaction Comparison

### Search Flow

**Original EMR**:
1. User enters search term (e.g., personal ID)
2. User clicks 🔍 icon
3. Table updates immediately below
4. Matching rows highlighted light green
5. Matching cells (personal ID) also green
6. User can immediately edit from table
7. Search form stays visible
8. Registration form stays visible

**Current Implementation**:
1. User enters search term
2. User clicks "Search" button
3. Table updates below
4. No highlighting
5. User can edit from table
6. Search form stays visible
7. Registration form NOT visible (different page)

---

### Registration Flow

**Original EMR**:
1. User fills form on right side
2. User clicks "დამატება"
3. Patient appears in table below immediately
4. Form stays visible for next patient
5. Optional: Click dropdown for "Save and New" to clear form
6. User can search while form visible

**Current Implementation**:
1. User clicks "New Patient" button (navigation)
2. New page loads with form
3. User fills form
4. User clicks "Register"
5. Navigate to patient detail page OR back to list
6. Table NOT visible during registration
7. Search NOT visible during registration

---

## Quantitative Comparison

### User Efficiency Metrics

| Metric | Original EMR | Current | Difference |
|--------|--------------|---------|------------|
| **Clicks to search** | 2 (enter + 🔍) | 2 (enter + Search) | Same |
| **Clicks to register** | 1 (დამატება) | 3 (New Patient + fill + Register) | +200% |
| **Clicks to search then register** | 3 (search + 🔍 + fill + დამატება) | 5 (search + Search + New Patient + fill + Register) | +67% |
| **Pages viewed for registration** | 1 | 2-3 | +200% |
| **Context switches** | 0 | 2-3 | N/A |
| **Fields visible at once** | 18 (4 search + 12 form + table) | 6-12 (search OR form, not both) | -50% |
| **Time to register (estimated)** | 30 seconds | 45-60 seconds | +50-100% |

---

## Recommendation Summary

### Must Fix (HIGH Priority)

1. **🔴 Unified Layout** - Combine search and registration on one page
   - **Impact**: Reduces clicks by 67%, eliminates context switching
   - **Effort**: 5 days
   - **ROI**: Very High

2. **🔴 Registration Number Search** - Add missing field
   - **Impact**: Enables common use case
   - **Effort**: 4 hours
   - **ROI**: High

3. **🔴 Table Search Highlighting** - Light green backgrounds
   - **Impact**: Clear visual feedback
   - **Effort**: 2 days
   - **ROI**: High

### Should Fix (MEDIUM Priority)

4. **🟡 International Phone Input** - Country dropdown component
5. **🟡 Submit Dropdown** - Multi-action button
6. **🟡 Address Field** - Single-line vs. textarea

### Nice to Have (LOW Priority)

7. **🟢 Turquoise Theme** - Brand color consistency
8. **🟢 Section Headers** - Light gray backgrounds
9. **🟢 Search Button** - Icon instead of text

---

## Conclusion

The current implementation has **solid technical foundation** (FHIR, validation, data model) but **significant UX gaps** compared to the original EMR. The primary issue is **architectural**: separate pages break the unified workflow that users expect.

**Recommended Approach**: Focus on Week 1 tasks (unified layout, registration number search, table highlighting) to achieve 80% visual and functional parity with original EMR.

---

**Document Version**: 1.0
**Created**: 2025-11-13
**For**: Implementation team reference
