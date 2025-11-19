# саюдкфасн (Salary) Tab - Registered Services Modal

**Status**:  Complete Mapping
**Date**: 2025-11-19
**Mapped From**: Live EMR System (http://178.134.21.82:8008)
**Service Example**: "мама внзнмдкиас йнмсуктаъиа (албу)"

## Overview

The **Salary Tab** (саюдкфасн) manages salary/compensation distribution for medical services across different personnel categories. It defines which staff members (performers, assistants, support personnel) receive compensation when this service is performed, and what percentage/amount each receives.

### Business Purpose
- Define primary performers (doctors, specialists) and their compensation percentage
- Configure secondary/assistant personnel and their shares
- Track other salary components (anesthesia, nursing, support staff)
- Maintain salary descriptions/notes for accounting
- Enable automated salary distribution when service is billed

---

## Modal Structure

### Tab Location
- **Tab**: Second tab (саюдкфасн) in 4-tab navigation
- **Position**: Between "фимамсури" (Financial) and "салдгиъимн" (Medical)
- **Active State**: Blue underline when selected

---

## Salary Tab Structure

The Salary tab has **4 distinct sections**:

1. **шдлсрукдбкдби** (Performers) - Primary service performers with compensation percentages
2. **сайарайуки одрснмаки** (Secondary Personnel) - Assistant/support staff dropdowns
3. **сюеа юдкфасдби** (Other Salaries) - Additional salary line items
4. **гасаюдкдба** (Description) - Service salary description field

---

## Section 1: шдлсрукдбкдби (Performers)

**Purpose**: Define primary staff who perform the service and their compensation percentages.

### Section Header
- **Title**: "шдлсрукдбкдби" (Performers)
- **Background**: Light purple/blue (#E8E8F5)
- **Text**: Medium bold, dark text

### Form Fields (Above Table)

#### Field 1: Department/Role Dropdown (Left)
- **Type**: Dropdown select
- **Label**: None visible (inferred from table column "саюдки" - Name)
- **Required**: Yes (for adding new performer)
- **Width**: ~30% of section width
- **Position**: First dropdown on left
- **Default**: Empty/placeholder

**Visible Options**: Not shown (dropdown closed)

**Expected Options** (inferred from table data):
- нодратнри (Operator)
- йарби (?) - unclear
- Various department/role types
- Likely pulls from staff/department master list

#### Field 2: Role Type Dropdown (Middle)
- **Type**: Dropdown select
- **Label**: None visible (inferred from table column "тиои" - Type)
- **Required**: Yes
- **Width**: ~20% of section width
- **Position**: Second dropdown
- **Default**: Empty/placeholder

**Visible Options**: Not shown

**Expected Options** (from table):
- лнхрики (Moqrili - uncertain translation)
- йаби (Kabi)
- Other role/position types

#### Field 3: Percentage Input
- **Type**: Number input
- **Label**: None visible (inferred from table column "юдкфаси %" - Salary %)
- **Required**: Yes
- **Width**: ~15% of section width
- **Position**: Third field
- **Format**: Integer percentage (60, 100, etc.)
- **Validation**: 0-100 range expected

#### Field 4: Checkbox
- **Type**: Checkbox
- **Label**: "гахс" (checkbox label, possibly "active" or "default")
- **Required**: No
- **Width**: Small (~5%)
- **Position**: Fourth field after percentage
- **Default**: Unchecked

#### Field 5: Add Button (+)
- **Type**: Button
- **Text**: + (plus symbol)
- **Position**: Far right of form row
- **Width**: ~40px (square button)
- **Color**: White/light background
- **Action**: Adds new performer row to table
- **Enabled**: Only when required fields filled

### Performers Table

#### Table Headers
- **Background**: Light purple/blue (#E8E8F5)
- **Text Color**: Dark blue/purple
- **Font Weight**: Bold

#### Columns

| Column # | Georgian Header | English Translation | Data Type | Width | Notes |
|----------|----------------|---------------------|-----------|-------|-------|
| 1 | саюдки | Name | Text | ~35% | Staff member or department name |
| 2 | тиои | Type | Text | ~25% | Role/position type |
| 3 | юдкфаси % | Salary % | Number | ~15% | Compensation percentage |
| 4 | гахс | Checkbox | Checkbox | ~10% | Active/default flag |
| 5 | Actions | - | Icons | ~15% | Edit () and Delete (=б) icons |

#### Table Data (Visible Rows)

From screenshot, 2 visible rows:

1. **нодратнри** (Operator) - лнхрики - 60% -  (unchecked)
2. **йаби** (Kabi) - йаби - 60% - (no checkbox visible)

**Total Percentage**: 120% (60 + 60) - May indicate percentage split between multiple roles, or overage that needs resolution

#### Row Actions
- **Edit Icon ()**: Pencil icon to edit performer entry
- **Delete Icon (=б)**: Trash icon (circular gray background) to remove performer

---

## Section 2: сайарайуки одрснмаки (Secondary Personnel)

**Purpose**: Configure assistant/support personnel dropdowns for additional staff involved in service delivery.

### Section Header
- **Title**: "сайарайуки одрснмаки" (Secondary Personnel / Auxiliary Staff)
- **Background**: Light purple/blue (#E8E8F5)
- **Text**: Medium bold, dark text

### Structure

This section contains **3 dropdown rows**, each with:
- Dropdown select (left side, ~80% width)
- Add button (+) (right side, ~10% width)

#### Dropdown Row 1
- **Type**: Dropdown select
- **Label**: None visible
- **Width**: Wide (~80% of section)
- **Position**: First row
- **Default**: Empty/placeholder
- **Add Button**: + button on right

**Purpose**: Select first category of secondary personnel

#### Dropdown Row 2
- **Type**: Dropdown select
- **Label**: None visible
- **Width**: Wide (~80% of section)
- **Position**: Second row
- **Default**: Empty/placeholder
- **Add Button**: + button on right

**Purpose**: Select second category of secondary personnel

#### Dropdown Row 3
- **Type**: Dropdown select
- **Label**: None visible
- **Width**: Wide (~80% of section)
- **Position**: Third row
- **Default**: Empty/placeholder
- **Add Button**: + button on right

**Purpose**: Select third category of secondary personnel

### Subsection: одрснмаки (Personnel)

Below the 3 dropdowns, there's a subsection with:
- **Header**: "одрснмаки" (Personnel)
- **Background**: Light purple/blue (#E8E8F5)
- **Content**: Empty table or list area (no data visible in screenshot)

**Purpose**: Likely displays selected personnel from the dropdowns above

---

## Section 3: сюеа юдкфасдби (Other Salaries)

**Purpose**: Add miscellaneous salary line items not covered by performers or secondary personnel.

### Section Header
- **Title**: "сюеа юдкфасдби" (Other Salaries)
- **Background**: Light purple/blue (#E8E8F5)
- **Text**: Medium bold, dark text

### Structure

Single row with:
- **Text Input Field** (left, ~85% width)
- **Add Button (+)** (right, ~10% width)

#### Text Input Field
- **Type**: Text input
- **Label**: None visible
- **Placeholder**: Empty
- **Width**: Wide (~85% of section)
- **Purpose**: Enter description of additional salary component

**Examples** (inferred use cases):
- "амдсзджиа" (Anesthesia)
- "дхзмис гаюлардба" (Nursing assistance)
- "тдхмийури одрснмаки" (Technical staff)
- "ласакдби" (Materials)

#### Add Button (+)
- **Type**: Button
- **Text**: + (plus symbol)
- **Width**: ~40px (square)
- **Position**: Right side
- **Color**: White/light background
- **Action**: Adds new salary line item to list below

### Subsection: гасаюдкдба (Items List)

Below the input field:
- **Header**: "гасаюдкдба" (Description/Name)
- **Background**: Light purple/blue (#E8E8F5)
- **Content**: Empty list area (no data visible in screenshot)

**Purpose**: Displays added "other salary" line items

---

## Section 4: гасаюдкдба (Description)

**Purpose**: Overall service salary description or notes for accounting/reporting.

### Field Details
- **Type**: Text input (single line or textarea)
- **Label**: None visible (section title serves as label)
- **Width**: Full width of tab content area
- **Position**: Bottom of Salary tab
- **Required**: No (optional descriptive field)
- **Purpose**: General notes about salary distribution for this service

**Example Uses**:
- "йаргинхирурвиуки нодраъиис юдкфасдби" (Cardiac surgery salaries)
- "йнмсуктаъиис сафасури вамаьикдба" (Consultation fee distribution)
- Notes for accounting/billing team

---

## Business Logic

### Salary Distribution Algorithm

When service is performed and billed:

1. **Primary Performers** (шдлсрукдбкдби):
   - Each performer gets their defined percentage
   - Total percentage may exceed 100% if multiple roles involved
   - Percentages apply to base service price from Financial tab

2. **Secondary Personnel** (сайарайуки одрснмаки):
   - Predetermined percentage/amount for each personnel category
   - May be fixed amounts rather than percentages
   - Added to performer salaries

3. **Other Salaries** (сюеа юдкфасдби):
   - Additional fixed amounts or percentages
   - Covers ancillary staff and materials
   - Summed with above categories

4. **Total Calculation**:
   ```
   Total Salary = (Base Price з Performer %) + Secondary Personnel + Other Salaries
   ```

### Example Calculation

**Service**: "мама внзнмдкиас йнмсуктаъиа" - Base Price: 80 GEL (from Financial tab)

**Performers**:
- нодратнри (Operator): 60% = 48 GEL
- йаби (Kabi): 60% = 48 GEL
- **Subtotal**: 96 GEL

**Secondary Personnel**: (if configured)
- Assistant: 10 GEL
- Nurse: 5 GEL
- **Subtotal**: 15 GEL

**Other Salaries**: (if configured)
- Materials: 5 GEL
- **Subtotal**: 5 GEL

**Total Salary Distribution**: 96 + 15 + 5 = **116 GEL**

**Note**: Total exceeds base price (80 GEL), which may indicate:
- Percentage overage (120% total) requires reconciliation
- Additional charges beyond base price
- Clinic absorbs difference as cost

---

## Validation Rules

### шдлсрукдбкдби (Performers) Section

#### Name/Department Field
- **Required**: Yes (cannot add performer without name)
- **Rule**: Must select from dropdown
- **Error**: "аирщидз шдлсрукдбдки" (Select performer)

#### Type Field
- **Required**: Yes
- **Rule**: Must select from dropdown
- **Error**: "аирщидз тиои" (Select type)

#### Salary % Field
- **Required**: Yes
- **Rule**: Must be number between 0-100
- **Format**: Integer percentage
- **Error**: "шдичеамдз сьнри орнъдмти (0-100)" (Enter correct percentage 0-100)

#### Checkbox Field
- **Required**: No (optional flag)
- **Default**: Unchecked

### сайарайуки одрснмаки (Secondary Personnel)

#### Each Dropdown
- **Required**: No (optional secondary staff)
- **Rule**: If selected, must be valid personnel category
- **Behavior**: Can leave empty if not needed

### сюеа юдкфасдби (Other Salaries)

#### Text Input
- **Required**: No (optional additional items)
- **Rule**: Free text, max length (e.g., 255 characters)
- **Behavior**: Can leave empty if no other salaries

### гасаюдкдба (Description)

#### Description Field
- **Required**: No (optional general note)
- **Rule**: Free text, max length (e.g., 500 characters)

---

## UI/UX Notes

### Colors & Styling

- **Section Headers**: Light purple/blue background (#E8E8F5)
- **Header Text**: Dark blue/purple, bold
- **Table Headers**: Same light purple/blue as section headers
- **Form Fields**: White background, gray border
- **Add Buttons (+)**: White/light background, gray border, black + symbol
- **Action Icons**: Edit (black pencil), Delete (gray circle with trash)

### Layout

- **4 Sections**: Stacked vertically with consistent spacing
- **Section Padding**: 15-20px internal padding
- **Gap Between Sections**: 10-15px
- **Form Field Alignment**: Horizontal layout within sections
- **Full Width**: All sections span full modal content width

### Responsive Behavior

- **Modal Width**: Fixed large size (~80% viewport)
- **Sections**: Stack vertically (no horizontal columns)
- **Form Fields**: Maintain horizontal layout until very small screens
- **Mobile**: Likely switches to single-column vertical layout

### Typography

- **Section Headers**: 14-16px, bold
- **Table Headers**: 13-14px, bold
- **Form Labels**: 12-14px, regular
- **Table Data**: 13-14px, regular
- **Input Text**: 14px

---

## FHIR Mapping Recommendation

### Storage Strategy

Store salary configuration as **extensions** on the **ActivityDefinition** resource, alongside price extensions from Financial tab.

### Extension Structure

```typescript
{
  resourceType: "ActivityDefinition",
  id: "service-123",
  title: "мама внзнмдкиас йнмсуктаъиа (албу)",
  // ... other fields
  extension: [
    // Financial tab price extensions (from financial-tab.md)
    { url: "http://medimind.ge/fhir/extension/service-price", ... },

    // Salary tab extensions (NEW)
    {
      url: "http://medimind.ge/fhir/extension/service-salary-config",
      extension: [
        {
          url: "performers",
          extension: [
            {
              url: "performer",
              extension: [
                {
                  url: "name",
                  valueString: "нодратнри"
                },
                {
                  url: "type",
                  valueString: "лнхрики"
                },
                {
                  url: "percentage",
                  valueDecimal: 60.0
                },
                {
                  url: "isDefault",
                  valueBoolean: false
                },
                {
                  url: "practitionerRole",
                  valueReference: {
                    reference: "PractitionerRole/123" // Link to actual staff member
                  }
                }
              ]
            }
            // ... more performers
          ]
        },
        {
          url: "secondaryPersonnel",
          extension: [
            {
              url: "personnelCategory1",
              valueString: "Assistant"
            },
            {
              url: "personnelCategory2",
              valueString: "Nurse"
            },
            {
              url: "personnelCategory3",
              valueString: "Technician"
            }
          ]
        },
        {
          url: "otherSalaries",
          extension: [
            {
              url: "item",
              extension: [
                {
                  url: "description",
                  valueString: "амдсзджиа"
                },
                {
                  url: "amount",
                  valueMoney: {
                    value: 50,
                    currency: "GEL"
                  }
                }
              ]
            }
            // ... more other salary items
          ]
        },
        {
          url: "description",
          valueString: "йаргинхирурвиуки нодраъиис юдкфасдби"
        }
      ]
    }
  ]
}
```

### Alternative: Use PractitionerRole References

Instead of storing strings, link to actual **PractitionerRole** resources:

```typescript
{
  url: "performers",
  extension: [
    {
      url: "performer",
      extension: [
        {
          url: "practitionerRole",
          valueReference: {
            reference: "PractitionerRole/operator-1",
            display: "нодратнри"
          }
        },
        {
          url: "percentage",
          valueDecimal: 60.0
        }
      ]
    }
  ]
}
```

---

## Translation Keys

### Georgian (ka.json)
```json
{
  "registeredServices": {
    "salary": {
      "tab": "саюдкфасн",
      "performers": {
        "title": "шдлсрукдбкдби",
        "name": "саюдки",
        "type": "тиои",
        "percentage": "юдкфаси %",
        "checkbox": "гахс",
        "addButton": "+",
        "table": {
          "name": "саюдки",
          "type": "тиои",
          "percentage": "юдкфаси %",
          "checkbox": "гахс",
          "actions": ""
        }
      },
      "secondaryPersonnel": {
        "title": "сайарайуки одрснмаки",
        "dropdown1": "одрснмакис йатдвнриа 1",
        "dropdown2": "одрснмакис йатдвнриа 2",
        "dropdown3": "одрснмакис йатдвнриа 3",
        "addButton": "+",
        "personnelSubtitle": "одрснмаки"
      },
      "otherSalaries": {
        "title": "сюеа юдкфасдби",
        "input": "шдичеамдз гасаюдкдба",
        "addButton": "+",
        "itemsSubtitle": "гасаюдкдба"
      },
      "description": {
        "title": "гасаюдкдба",
        "placeholder": "жнваги ацьдра..."
      },
      "validation": {
        "nameRequired": "аирщидз шдлсрукдбдки",
        "typeRequired": "аирщидз тиои",
        "percentageRequired": "шдичеамдз орнъдмти",
        "percentageRange": "орнъдмти умга ичнс 0-гам 100-лгд",
        "otherSalaryRequired": "шдичеамдз гасаюдкдба"
      },
      "success": {
        "performerAdded": "шдлсрукдбдки гадлата",
        "performerUpdated": "шдлсрукдбдки вамаюкга",
        "performerDeleted": "шдлсрукдбдки ьаишака",
        "secondaryAdded": "одрснмаки гадлата",
        "otherSalaryAdded": "юдкфаси гадлата"
      },
      "error": {
        "addFailed": "галатдба едр лнюдрюга",
        "updateFailed": "вамаюкдба едр лнюдрюга",
        "deleteFailed": "ьашка едр лнюдрюга"
      },
      "confirmDelete": {
        "title": "шдлсрукдбкис ьашка",
        "message": "гарьлумдбуки юарз?",
        "confirm": "ьашка",
        "cancel": "ваухлдба"
      }
    }
  }
}
```

### English (en.json)
```json
{
  "registeredServices": {
    "salary": {
      "tab": "Salary",
      "performers": {
        "title": "Performers",
        "name": "Name",
        "type": "Type",
        "percentage": "Salary %",
        "checkbox": "Default",
        "addButton": "+",
        "table": {
          "name": "Name",
          "type": "Type",
          "percentage": "Salary %",
          "checkbox": "Default",
          "actions": ""
        }
      },
      "secondaryPersonnel": {
        "title": "Secondary Personnel",
        "dropdown1": "Personnel Category 1",
        "dropdown2": "Personnel Category 2",
        "dropdown3": "Personnel Category 3",
        "addButton": "+",
        "personnelSubtitle": "Personnel"
      },
      "otherSalaries": {
        "title": "Other Salaries",
        "input": "Enter description",
        "addButton": "+",
        "itemsSubtitle": "Description"
      },
      "description": {
        "title": "Description",
        "placeholder": "General description..."
      },
      "validation": {
        "nameRequired": "Select performer",
        "typeRequired": "Select type",
        "percentageRequired": "Enter percentage",
        "percentageRange": "Percentage must be 0-100",
        "otherSalaryRequired": "Enter description"
      },
      "success": {
        "performerAdded": "Performer added",
        "performerUpdated": "Performer updated",
        "performerDeleted": "Performer deleted",
        "secondaryAdded": "Personnel added",
        "otherSalaryAdded": "Salary added"
      },
      "error": {
        "addFailed": "Failed to add",
        "updateFailed": "Failed to update",
        "deleteFailed": "Failed to delete"
      },
      "confirmDelete": {
        "title": "Delete Performer",
        "message": "Are you sure?",
        "confirm": "Delete",
        "cancel": "Cancel"
      }
    }
  }
}
```

### Russian (ru.json)
```json
{
  "registeredServices": {
    "salary": {
      "tab": "0@?;0B0",
      "performers": {
        "title": "A?>;=8B5;8",
        "name": "<O",
        "type": ""8?",
        "percentage": "0@?;0B0 %",
        "checkbox": "> C<>;G0=8N",
        "addButton": "+",
        "table": {
          "name": "<O",
          "type": ""8?",
          "percentage": "0@?;0B0 %",
          "checkbox": "> C<>;G0=8N",
          "actions": ""
        }
      },
      "secondaryPersonnel": {
        "title": "A?><>30B5;L=K9 ?5@A>=0;",
        "dropdown1": "0B53>@8O ?5@A>=0;0 1",
        "dropdown2": "0B53>@8O ?5@A>=0;0 2",
        "dropdown3": "0B53>@8O ?5@A>=0;0 3",
        "addButton": "+",
        "personnelSubtitle": "5@A>=0;"
      },
      "otherSalaries": {
        "title": "@>G85 70@?;0BK",
        "input": "2548B5 >?8A0=85",
        "addButton": "+",
        "itemsSubtitle": "?8A0=85"
      },
      "description": {
        "title": "?8A0=85",
        "placeholder": "1I55 >?8A0=85..."
      },
      "validation": {
        "nameRequired": "K15@8B5 8A?>;=8B5;O",
        "typeRequired": "K15@8B5 B8?",
        "percentageRequired": "2548B5 ?@>F5=B",
        "percentageRange": "@>F5=B 4>;65= 1KBL 0-100",
        "otherSalaryRequired": "2548B5 >?8A0=85"
      },
      "success": {
        "performerAdded": "A?>;=8B5;L 4>102;5=",
        "performerUpdated": "A?>;=8B5;L >1=>2;5=",
        "performerDeleted": "A?>;=8B5;L C40;5=",
        "secondaryAdded": "5@A>=0; 4>102;5=",
        "otherSalaryAdded": "0@?;0B0 4>102;5=0"
      },
      "error": {
        "addFailed": "5 C40;>AL 4>1028BL",
        "updateFailed": "5 C40;>AL >1=>28BL",
        "deleteFailed": "5 C40;>AL C40;8BL"
      },
      "confirmDelete": {
        "title": "#40;8BL 8A?>;=8B5;O",
        "message": "K C25@5=K?",
        "confirm": "#40;8BL",
        "cancel": "B<5=0"
      }
    }
  }
}
```

---

## Implementation Components

### Recommended React Component Structure

```
packages/app/src/emr/components/nomenclature/
   RegisteredServicesModal.tsx          # Main modal (already planned)
   tabs/
      FinancialTab.tsx                 # (from financial-tab.md)
      SalaryTab.tsx                    # NEW - Salary tab component
      MedicalTab.tsx                   # Placeholder
      AccountingTab.tsx                # Placeholder
   salary/                              # NEW FOLDER
      PerformersSection.tsx            # Performers form + table
      PerformersTable.tsx              # Performers data table
      SecondaryPersonnelSection.tsx    # 3 dropdowns + personnel list
      OtherSalariesSection.tsx         # Input + list
      SalaryDescriptionSection.tsx     # Description textarea
      PerformerSelect.tsx              # Dropdown for performer/department
```

### Component Props

#### SalaryTab
```typescript
interface SalaryTabProps {
  serviceId: string; // ActivityDefinition ID
}
```

#### PerformersSection
```typescript
interface PerformersSectionProps {
  serviceId: string;
  onPerformerAdded: () => void;
  onPerformerUpdated: () => void;
  onPerformerDeleted: () => void;
}

interface Performer {
  id: string;
  name: string; // Department/staff name
  type: string; // Role type
  percentage: number; // 0-100
  isDefault: boolean; // Checkbox value
}
```

#### SecondaryPersonnelSection
```typescript
interface SecondaryPersonnelSectionProps {
  serviceId: string;
  onPersonnelAdded: (category: number) => void; // category: 1, 2, or 3
}

interface SecondaryPersonnel {
  category: number; // 1, 2, or 3
  personnelId: string;
  personnelName: string;
}
```

#### OtherSalariesSection
```typescript
interface OtherSalariesSectionProps {
  serviceId: string;
  onSalaryAdded: () => void;
}

interface OtherSalary {
  id: string;
  description: string;
  amount?: number; // Optional fixed amount
}
```

---

## Testing Checklist

### Functional Tests
- [ ] Salary tab opens when clicked
- [ ] All 4 sections render correctly
- [ ] Performer name dropdown shows options
- [ ] Performer type dropdown shows options
- [ ] Percentage input accepts numbers 0-100
- [ ] Checkbox toggles on/off
- [ ] Add button adds performer to table
- [ ] Form resets after adding performer
- [ ] Edit icon populates form with performer data
- [ ] Delete icon removes performer from table
- [ ] Secondary personnel dropdowns show options
- [ ] Secondary personnel + buttons work
- [ ] Other salaries input accepts text
- [ ] Other salaries + button adds item
- [ ] Description field accepts long text

### Validation Tests
- [ ] Cannot add performer without name
- [ ] Cannot add performer without type
- [ ] Cannot add performer without percentage
- [ ] Percentage must be 0-100
- [ ] Percentage cannot be negative
- [ ] Percentage cannot exceed 100
- [ ] Other salary description required to add

### Business Logic Tests
- [ ] Multiple performers can exist for same service
- [ ] Total percentage can exceed 100% (warning shown?)
- [ ] Secondary personnel categories independent
- [ ] Other salaries can have multiple items
- [ ] Description saves correctly

### Integration Tests
- [ ] Salary data persists to ActivityDefinition extensions
- [ ] Salary data loads from ActivityDefinition on modal open
- [ ] Changes sync across tab switches
- [ ] Modal close saves all changes

### UI/UX Tests
- [ ] Section headers styled correctly (purple/blue background)
- [ ] Add buttons visible and clickable
- [ ] Table columns aligned properly
- [ ] Action icons (edit/delete) responsive
- [ ] Form fields labeled clearly
- [ ] Multilingual support (ka/en/ru)

---

## Questions for Live System Testing

1. **Performer Dropdowns**:
   - What are ALL options in name/department dropdown?
   - What are ALL options in type dropdown?
   - Are these pulled from staff/department master lists?

2. **Performer Percentage**:
   - Is there a warning if total exceeds 100%?
   - Can percentage be decimal (e.g., 12.5%)?
   - What happens if total is less than 100%?

3. **Checkbox Purpose**:
   - What does the "гахс" checkbox do?
   - Is it "default performer" or "active" flag?
   - Does it affect salary calculations?

4. **Secondary Personnel Dropdowns**:
   - What options appear in each of the 3 dropdowns?
   - Are they different categories or same list?
   - Do they link to actual staff members?

5. **Personnel Subsection**:
   - What displays in the "одрснмаки" subsection?
   - Does it show selected secondary personnel?
   - Can items be edited/deleted?

6. **Other Salaries**:
   - Is amount/percentage also configured?
   - Or just description?
   - What displays in "гасаюдкдба" subsection?

7. **Save Behavior**:
   - Are changes immediate or require "Save All"?
   - Does modal close auto-save?

---

## Next Steps

1.  **Salary Tab Mapped** (This Document)
2. э **Map Medical Tab** - Click and document third tab
3. э **Map Accounting Tab** - Click and document fourth tab
4. э **Test Live System** - Answer clarification questions for all tabs
5. э **Implement Components** - Build React components for all 4 tabs
6. э **Write Tests** - Comprehensive test coverage

---

## File Locations

- **This Doc**: `documentation/registered-services-modal/salary-tab.md`
- **Financial Tab**: `documentation/registered-services-modal/financial-tab.md`
- **Screenshots**:
  - `.playwright-mcp/salary-tab-modal.png`
- **Future Components**: `packages/app/src/emr/components/nomenclature/salary/`
- **Future Translations**: `packages/app/src/emr/translations/*.json`

---

**Document Status**:  Complete - Ready for implementation
**Next**: Map Medical Tab (салдгиъимн)
