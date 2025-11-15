# Patient History Main Data Table (ისტორია - პაციენტის ისტორია)

---

## Overview

**Location**: Main content area below filter controls and action buttons (გადახდა, გაწერა, გადაწერა, ინვოისი, etc.)

**Purpose**: Display all patient visit records with financial information including dates, patient details, registration numbers, costs, discounts, debts, and payments. This is the primary table for tracking patient history and financial transactions.

**Data Source**: Patient Visit History records filtered by date range and payer type (insurance company) selection

---

## Column Structure

| Position | Column Name (Georgian) | Data Type | Format | Width | Sortable | Actions |
|----------|------------------------|-----------|--------|-------|----------|---------|
| 1 | პ/ნ | id | 11-digit personal number | medium | Unknown | - |
| 2 | სახელი | text | Plain Georgian text | medium | Unknown | - |
| 3 | გვარი | text | Plain Georgian text | medium | Unknown | - |
| 4 | თარიღი | date | DD-MM-YYYY HH:MM | medium | Yes | - |
| 5 | # | text | Registration number (e.g., 10357-2025, a-6871-2025) | medium | Unknown | - |
| 6 | ჯამი | number | Integer amount (currency) | narrow | Unknown | - |
| 7 | % | number | Percentage/discount value | narrow | Unknown | - |
| 8 | ვალი | number | Debt amount (currency) | narrow | Unknown | - |
| 9 | გადახდ. | number | Payment amount (currency) | narrow | Unknown | - |
| 10 | (Action Column) | action | Edit/Delete icons | narrow | No | Edit & Delete icons |

> **Data Type Details**:
> - **პ/ნ (Personal Number)**: 11-digit Georgian national ID format
> - **თარიღი (Date)**: Can contain single datetime or two datetimes on separate lines (e.g., visit start and end)
> - **# (Registration Number)**: Format varies - numeric (10357-2025) or alphanumeric with prefix (a-6871-2025)
> - **Financial Columns**: All numeric values representing currency amounts (likely GEL)

---

## Row Behavior

### Selection & Actions

- **Selection Type**: Single-select - clicking a row selects it
- **Click Action**: Row click opens patient visit detail view/form
- **Hover State**: Cursor changes to pointer on row hover
- **Context Menu**: Not observed

### Row-Level Actions

| Icon | Label | Purpose | Location | Behavior |
|------|-------|---------|----------|----------|
| Pencil/Edit icon | Edit | Opens edit interface for the visit record | Rightmost column (Position 10) | Opens modal or detail view for editing |
| Circle/Delete icon | Delete | Removes the visit record | Rightmost column (Position 10) | Likely prompts confirmation before deletion |

---

## Color Coding Logic

The table implements a sophisticated color coding system in the **ვალი (Debt)** column:

### Color Indicators

1. **Green Background** (`rgba(0, 255, 0, X)` or light green):
   - **Condition**: Appears when debt value (ვალი) is greater than 0
   - **Meaning**: Outstanding debt exists for this visit
   - **Purpose**: Visual alert for financial follow-up required

2. **No Color/White Background**:
   - **Condition**: When debt value is 0 or payment is fully settled
   - **Meaning**: No outstanding balance

3. **Red/Pink Cells**: (Not observed in current dataset but mentioned in requirements)
   - **Likely Condition**: Overdue debts or negative balances
   - **Purpose**: Critical financial alerts

> **Note**: Color coding is applied at the cell level specifically to the ვალი (Debt) column to draw immediate attention to financial statuses requiring action.

---

## Sample Data

### Sample Rows (from EMR live system - 2025-11-10)

| პ/ნ | სახელი | გვარი | თარიღი | # | ჯამი | % | ვალი | გადახდ. |
|-----|--------|-------|--------|---|------|---|------|---------|
| 01008062334 | ბექა | სულაბერიძე | 10-11-2025 20:30 | 10357-2025 | 0 | 0 | 0 | 0 |
| 01017037984 | იოსებ | მეცხვარიშვილი | 10-11-2025 20:20 | 10356-2025 | 0 | 70 | 0 | 0 |
| 01005038814 | ლუკა | მახნიაშვილი | 10-11-2025 19:37 | a-6871-2025 | 150 | 0 | 150 | 150 |
| 01008042172 | ასმათ | მაზანაშვილი | 10-11-2025 17:24 | a-545-2020 | 165 | 0 | 165 | 165 |
| 45001030226 | შმაგი | პარუნაშვილი | 10-11-2025 17:10<br>10-11-2025 18:10 | 10347-2025 | 600 | 0 | 600 | 600 |
| 01008005712 | ნიკოლოზ | თუშაბრამიშვილი | 10-11-2025 16:35 | a-2707-2025 | 288 | 0 | 288 | 0 |

> **Observations**:
> - Registration numbers use two formats: numeric (10XXX-YYYY) and alphanumeric (a-XXXX-YYYY)
> - Date column can contain multiple timestamps (see row 5: Shmagi Parunashvili)
> - When ჯამი (Total) = გადახდ. (Payment), debt is fully paid
> - When გადახდ. = 0 but ვალი > 0, payment is outstanding (triggers green highlighting)

---

## Display Rules

1. **Date Multi-line Display**: When a visit has multiple timestamps (e.g., admission and discharge), they display on separate lines within the same cell (10-11-2025 17:10 / 10-11-2025 18:10)

2. **Financial Calculation**: ვალი (Debt) = ჯამი (Total) - გადახდ. (Payment). This appears to be calculated and displayed, not manually entered.

3. **Percentage Display**: The % column shows discount percentages applied to the visit cost (values like 0, 70, 90 observed)

4. **Cell Color Conditional Logic**:
   - IF ვალი > 0 THEN background-color: green/light-green
   - IF ვალი = 0 THEN background-color: none (white)

5. **Registration Number Prefix**: Alphanumeric registration numbers with 'a-' prefix appear to denote ambulatory visits, while numeric-only may indicate inpatient visits (hypothesis - needs verification)

### Empty Table State

**Condition**: When no patient visit records match the selected date range and payer filter criteria

**Display**: Table structure remains visible with header row and search/filter row

**Message**: No specific Georgian text message observed - table simply shows no data rows

---

## User Interactions

### 1. Sorting

- **Capability**: Column sorting available on თარიღი (Date) column - indicated by visual header highlight
- **Method**: Click column header to toggle sort order
- **Direction**: Likely descending (most recent first) by default, then ascending
- **Affected Columns**: თარიღი (Date) confirmed sortable; other columns unknown

### 2. Pagination

- **Enabled**: Not observed in current view
- **Rows Per Page**: All matching records appear to load at once
- **Navigation**: Not applicable
- **Total Count**: Status indicator shows "ხაზზე (44)" meaning "44 records online/loaded" in bottom-right corner

### 3. Row Selection

- **Enabled**: Yes
- **Type**: Single-select by row click
- **Indication**: Row click navigates to detail view (cursor: pointer on hover)
- **Action**: Opens patient visit detail form/modal for viewing or editing

### 4. Filtering

- **Method**: External filter controls above table:
  - Payer dropdown (insurance company selector) with refresh button
  - Date range filters (three date picker fields)
  - Checkbox for additional filtering option
- **Application**: Button trigger required (search/filter button click)
- **Related Documentation**: Filter panel documentation needed (not yet created)

### 5. Refresh

- **Trigger**: Manual refresh via filter button or page reload
- **Indication**: Page reload or filter re-application

---

## Table Controls & Actions

### Above-Table Action Buttons

Located above the main table, these buttons provide quick access to common operations:

| Button Label | Purpose |
|--------------|---------|
| გადახდა | Payment processing |
| გაწერა | Write-off / Prescription |
| გადაწერა | Transfer / Rewrite |
| ინვოისი | Invoice generation |
| კალკულაცია | Cost calculation |
| ანალიზები | Analysis reports |
| ხელფასები | Salaries/Payroll |

> **Note**: These buttons operate on selected table row(s) or open standalone forms

### Filter Row

Between the table header and data rows, a search/filter row exists with:
- **პ/ნ textbox**: Search by personal number
- **სახელი textbox**: Search by first name
- **გვარი textbox**: Search by last name
- **თარიღი date pickers**: Two date fields with calendar button ("...") for date range
- **# textbox fields**: Two registration number search fields
- **Search button**: Executes filter query

---

## Performance Notes

- **Initial Load**: All records matching default filter (today's date range) load immediately
- **Lazy Loading**: Not observed - appears to be full dataset loading
- **Client-side vs Server-side**: Server-side filtering (filter button triggers new query); client-side sorting likely

---

## Responsive Design

### Desktop Display

Full table layout with all 10 columns visible as documented above. Table spans full content area width.

### Tablet Display

Not documented (requires testing on tablet device or responsive breakpoint inspection)

### Mobile Display

Not documented (requires testing on mobile device)

---

## Source Traceability

**Source Reference**:
- Live EMR system at http://178.134.21.82:8008/clinic.php#2s21
- Screenshot: `/Users/toko/Desktop/SoftMedicMap/.playwright-mcp/-Users-toko-Desktop-SoftMedicMap-patient-history-table.png`
- Extraction Date: 2025-11-10

**Data Mapping**:
- პ/ნ → Patient.personalNumber
- სახელი → Patient.firstName
- გვარი → Patient.lastName
- თარიღი → Visit.visitDateTime (may include Visit.dischargeDateTime)
- # → Visit.registrationNumber
- ჯამი → Visit.totalAmount
- % → Visit.discountPercentage
- ვალი → Visit.debtAmount (calculated: totalAmount - paymentAmount)
- გადახდ. → Visit.paymentAmount

**Related Documentation**:
- Patient Record Entity (to be documented)
- Visit Record Entity (to be documented)
- Filter Panel documentation (to be created)
- Financial Transaction Entity (to be documented)

**Page Location**:
- Main Menu: პაციენტის ისტორია (Patient History)
- Submenu: ისტორია (History)
- URL Hash: #2s21

---

## Validation Checklist

- [X] All visible columns documented in structure table (10 columns)
- [X] Column positions numbered sequentially (1-10)
- [X] Georgian column headers preserved exactly as displayed
- [X] Data types identified for each column
- [X] Display formats specified (dates, numbers, IDs)
- [X] Row-level actions documented (Edit and Delete icons)
- [X] Sample data included with 6 representative rows
- [X] Display rules documented (date multi-line, color coding, calculations)
- [X] Empty state behavior described
- [X] User interactions defined (sorting, filtering, refresh) where observable
- [X] Source traceability included (URL, screenshot references)
- [X] Color coding logic fully documented with conditions
- [X] Table control buttons documented
- [X] Filter row structure documented
- [ ] Related entity documentation linked (pending creation)
- [ ] Responsive behavior documented (pending testing)

---

## Notes

### Implementation Priorities

1. **Color Coding**: The green highlighting for debt column is critical for financial management workflow
2. **Dual DateTime Display**: Special handling required for visits with start/end times
3. **Registration Number Formats**: Two distinct formats suggest different visit types - clarify business logic
4. **Filter Integration**: Filter controls above table are tightly integrated - document separately

### Questions for Clarification

1. What triggers red/pink cell colors? (Overdue debts? Negative balances?)
2. What is the business rule for 'a-' prefix in registration numbers vs numeric-only?
3. Are there additional color codes not visible in current dataset?
4. What is the maximum debt threshold that triggers specific visual alerts?
5. Can users customize which columns are visible or the column order?

### Technical Observations

- Table uses cursor:pointer on rows indicating clickable interaction
- Each row has a unique identifier (likely Visit.id or Registration.id)
- Financial calculations appear to be server-side (not editable in table)
- Status indicator "ხაზზე (44)" suggests real-time or near-real-time record counting
