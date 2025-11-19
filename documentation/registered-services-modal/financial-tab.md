# ფინანსური (Financial) Tab - Registered Services Modal

## Overview

The Financial (ფინანსური) tab manages price configurations and financial details for a specific medical service. It appears in the "რეგისტრირებული სერვისები" (Registered Services) modal and allows users to configure multiple price entries with different date ranges and financial codes.

**Purpose**: Configure service pricing with effective dates, financial codes, and multi-currency support.

## Modal Structure

### General Information
- **Modal Title**: Dynamic - shows service code and name (e.g., "120-125 /FNSC, FNSA ართრო-კორონარული შუნტირება")
- **Tabs**: 4 tabs in horizontal layout
  1. **ფინანსური** (Financial) - Active/Selected
  2. **სახელფასო** (Salary)
  3. **სამედიცინო** (Medical)
  4. **აღრიცხვება** (Accounting)
- **Modal Size**: Large modal (approximately 80% viewport width, 70% viewport height)
- **Close Button**: X icon in top-right corner (blue color)
- **Background**: Light overlay with modal centered

### Tab Styling
- **Active Tab**: Purple/blue underline border, bold text
- **Inactive Tabs**: Gray text, no underline
- **Tab Background**: White

## Form Fields (Top Section)

Located above the table, these fields configure new price entries to be added to the table.

### Field 1: ფასის ტიპი (Price Type)
- **Type**: Dropdown select
- **Required**: Yes (inferred from workflow)
- **Default Value**: None selected (shows placeholder)
- **Width**: ~200px
- **Position**: First field in top row, left side
- **Validation**: Must select before adding to table
- **Options**: Not visible in dropdown (closed state in screenshot)
  - Need to click dropdown to see all options
  - Likely includes: შიდა (Internal), შიდა სტაციონარი (Internal Stationary), სხვა (Other), etc.

### Field 2: ვალუტა (Currency)
- **Type**: Dropdown select
- **Required**: Yes
- **Default Value**: "GEL" (Georgian Lari)
- **Width**: ~100px
- **Position**: Second field in top row, next to price type
- **Visible Options in Screenshot**:
  - **GEL** (Georgian Lari) - shown as selected
- **Behavior**: Currency selector for price field
- **Note**: Small checkbox icon visible to the right (may toggle currency)

### Field 3: თარიღი (Date)
- **Type**: Date input (likely date picker)
- **Required**: Yes
- **Default Value**: None/empty
- **Width**: ~150px
- **Position**: Third field in top row
- **Format**: DD-MM-YYYY (based on table data showing "01-01-2016")
- **Validation**: Must be valid date
- **Placeholder**: Not visible (field empty)

### Field 4: ფასი (Price)
- **Type**: Number input
- **Required**: Yes
- **Default Value**: None/empty
- **Width**: ~150px
- **Position**: Fourth field in top row, right side
- **Format**: Integer or decimal number (table shows values like "12300", "14760")
- **Currency**: Linked to ვალუტა field (defaults to GEL)
- **Validation**: Positive number required
- **Placeholder**: Not visible

### Field 5: Add Button (+)
- **Type**: Button
- **Text**: + (plus symbol)
- **Position**: Far right of top row
- **Width**: ~40px (square button)
- **Color**: Turquoise/teal background (matches EMR theme)
- **Action**: Adds new row to table with configured price details
- **Enabled**: Only when all required fields filled

## Table Structure

The table displays all configured price entries for the selected service.

### Table Header
- **Background**: Turquoise gradient (matches EMR theme: `--emr-gradient-submenu`)
- **Text Color**: White
- **Font Weight**: Bold

### Columns

| Column # | Georgian Header | English Translation | Data Type | Width | Notes |
|----------|----------------|---------------------|-----------|-------|-------|
| 1 | ფასის ტიპი | Price Type | Text | ~250px | Price category/type |
| 2 | თარიღი | Date | Date | ~120px | Effective date (DD-MM-YYYY format) |
| 3 | ფასი | Price | Number | ~100px | Price value |
| 4 | ვალუტა | Currency | Text | ~80px | Currency code (e.g., "ლარი" = GEL) |
| 5 | Actions | - | Icons | ~60px | Edit (✏️) and Delete (🗑️) icons |

### Table Data (Visible Rows - Examples)

The screenshot shows 21+ visible price type entries for service "120-125 /FNSC, FNSA":

1. **შიდა სტაციონარი** (Internal Stationary) - 01-01-2016 - 12300 - ლარი
2. **სსიპ ჯანმრთელობის ეროვნული სააგენტო** (National Health Agency) - 01-01-2016 - 12300 - ლარი
3. **ოპრამედია** (Opramed) - 01-01-2016 - 12300 - ლარი
4. **ჰიმა** (Hima) - 01-01-2016 - 12300 - ლარი
5. **ს.ს. საღაზავევი კომპანია "ვიპიათ პოლითევნი"** - 01-01-2016 - 12300 - ლარი
6. **ალდაგი** (Aldagi) - 01-01-2016 - 12300 - ლარი
7. **ქართუ დაზღვევა** (Qartu Insurance) - 01-01-2016 - 12300 - ლარი
8. **სტანდარტი დაზღვევა** (Standard Insurance) - 01-01-2016 - 12300 - ლარი
9. **სს "პსა დაზღვევა"** (PSA Insurance) - 01-01-2016 - 12300 - ლარი
10. **სს ,საღაზღვევი კომპანია ივროპის ჯორნალე"** - 01-01-2016 - 12300 - ლარი
11. **შავს სავაზღვევი კომპანია "არისი ვაკუმი"** - 01-01-2016 - 12300 - ლარი
12. **აქარიე დაღვაბეზდები და სანავთობ განწინობის და სიგალვური დადველის** - 01-01-2016 - 12300 - ლარი
13. **იშუთე L** (Imedi L) - 01-01-2016 - 12300 - ლარი
14. **არარშოფილნე** (Araphioni) - 01-02-2017 - 14760 - ლარი
15. **ჯ. თბილისის შურნალ სისტემატური მუნი** - 01-01-2016 - 12300 - ლარი
16. **სამხრე თსკეთის აღბშინსერწყალა** - 01-01-2016 - 12300 - ლარი
17. **ირაო** (Irao) - 01-01-2016 - 12300 - ლარი
18. **ვია-ვიტა** (Via-Vita) - 01-01-2016 - 12300 - ლარი
19. **რეფელალური დამხმაროფის სვერნე** - 01-01-2016 - 12300 - ლარი
20. **"კახეთი-იორი"** (Kakheti-Iori) - 01-01-2001 - 12300 - ლარი
21. **საქართველოს სახელმწიფო მელებისა და პროტაციონის სამი** - 01-01-2001 - 12300 - ლარი

**Note**: The table appears to be scrollable, suggesting there may be more entries below.

### Table Row Actions

Each row has two action icons in the rightmost column:

1. **Edit Icon (✏️)**:
   - **Appearance**: Pencil/pen icon
   - **Color**: Dark gray/black
   - **Action**: Opens inline edit mode or updates form fields above
   - **Hover**: Likely shows pointer cursor

2. **Delete Icon (🗑️)**:
   - **Appearance**: Trash bin icon (circular with gray background)
   - **Color**: Light gray background
   - **Action**: Removes the price entry row
   - **Behavior**: Likely shows confirmation modal before deletion

### Table Behavior

- **Scrolling**: Vertical scrollbar visible (21+ rows shown, more may exist)
- **Sorting**: Not visible in screenshot (may not be enabled)
- **Row Hover**: Likely light gray background on hover
- **Empty State**: Not shown (table has data)
- **Add Row**: Via "+" button in form section above table

## Price Type Options (ფასის ტიპი)

Based on visible table rows, the dropdown includes at least these options:

### Insurance Companies / Payers:
1. **შიდა სტაციონარი** (Internal Stationary)
2. **სსიპ ჯანმრთელობის ეროვნული სააგენტო** (SSIP National Health Agency)
3. **ოპრამედია** (Opramed)
4. **ჰიმა** (Hima)
5. **ს.ს. საღაზავევი კომპანია "ვიპიათ პოლითევნი"** (Insurance company with specific name)
6. **ალდაგი** (Aldagi Insurance)
7. **ქართუ დაზღვევა** (Qartu Insurance)
8. **სტანდარტი დაზღვევა** (Standard Insurance)
9. **სს "პსა დაზღვევა"** (PSA Insurance)
10. **იმედი L** (Imedi L)
11. **არარშოფილნე** (Araphioni)
12. **ირაო** (Irao)
13. **ვია-ვიტა** (Via-Vita)
14. **კახეთი-იორი** (Kakheti-Iori)

**Pattern**: Dropdown likely populated from same insurance companies list used in Patient History (58 companies from `insurance-companies.json`)

## Business Logic

### Workflow

1. **User selects "რეგისტრირებული სერვისები" button** on main nomenclature page
2. **Modal opens** showing the service code and name in title
3. **Financial tab active by default** (or user clicks Financial tab)
4. **User fills form fields**:
   - Select price type (ფასის ტიპი) - insurance company or payment category
   - Select currency (ვალუტა) - defaults to GEL
   - Enter effective date (თარიღი) - when this price becomes valid
   - Enter price amount (ფასი) - numeric value
5. **User clicks "+" button**:
   - New row added to table
   - Form fields reset/clear
   - Table scrolls to show new entry
6. **User can edit existing entries**:
   - Click ✏️ icon → populates form fields OR opens inline edit
   - Modify values
   - Save changes
7. **User can delete entries**:
   - Click 🗑️ icon → confirmation dialog
   - Confirm deletion → row removed from table

### Validation Rules

#### ფასის ტიპი (Price Type)
- **Required**: Yes
- **Rule**: Must select from dropdown
- **Error**: Cannot add row with empty price type

#### ვალუტა (Currency)
- **Required**: Yes
- **Default**: GEL (pre-selected)
- **Rule**: Must be valid currency code
- **Options**: At minimum GEL (Georgian Lari), possibly USD, EUR

#### თარიღი (Date)
- **Required**: Yes
- **Format**: DD-MM-YYYY (01-01-2016)
- **Rule**: Must be valid date
- **Business Rule**: Later dates likely override earlier ones for same price type
- **Error**: Invalid date format or future date restriction (to be confirmed)

#### ფასი (Price)
- **Required**: Yes
- **Rule**: Positive number (integer or decimal)
- **Min Value**: > 0 (cannot be negative or zero)
- **Format**: Displayed without decimal if whole number (12300), with decimals if needed
- **Error**: "Price must be a positive number"

### Conditional Logic

1. **Add Button State**:
   - **Disabled**: If any required field is empty
   - **Enabled**: When all fields (price type, currency, date, price) are filled

2. **Currency Behavior**:
   - Checkbox next to currency field may toggle between currencies
   - Default currency (GEL) pre-selected on form load

3. **Price Type Uniqueness** (inferred):
   - Multiple entries for same price type allowed (different dates)
   - Date determines which price applies at given time

4. **Edit vs Add**:
   - Form doubles as add/edit interface
   - Clicking edit icon may populate form fields
   - Save button may appear when editing existing row

### Price Effective Date Logic (Inferred)

Based on table data showing multiple dates:
- **Oldest date**: 01-01-2001
- **Common date**: 01-01-2016 (most entries)
- **Updated date**: 01-02-2017 (one entry for არარშოფილნე)

**Inference**: System tracks price history by date. When retrieving price for a service, the system selects the entry with the most recent date before/on the service date.

## UI/UX Notes

### Colors & Styling

- **Table Header**: Turquoise gradient (`linear-gradient(90deg, #138496 → #17a2b8 → #20c4dd)`)
- **Table Header Text**: White, bold
- **Modal Background**: White
- **Form Section Background**: White (same as modal)
- **Action Button (+)**: Turquoise (`#17a2b8`)
- **Close Button (X)**: Blue accent (`#3182ce`)
- **Edit Icon**: Dark gray/black
- **Delete Icon**: Light gray circular background

### Responsive Behavior

- **Modal Width**: Fixed large size (not responsive in this view)
- **Table**: Horizontal scrollbar if content exceeds width
- **Form Fields**: Horizontal layout with fixed widths
- **Mobile**: Not optimized (modal likely full-screen on mobile)

### Typography

- **Modal Title**: Large, bold (18-20px)
- **Tab Labels**: Medium (14-16px), bold when active
- **Form Labels**: Small (12-14px), regular weight
- **Table Headers**: Medium (14px), bold, uppercase-like
- **Table Data**: Medium (14px), regular weight

### Spacing

- **Modal Padding**: 20-30px
- **Form Fields Gap**: 10-15px between fields
- **Table Row Height**: 40-45px
- **Tab Spacing**: 15-20px between tabs

### Validation Feedback

- **Error States**: Not visible in screenshot (no errors shown)
- **Expected Behavior**:
  - Red border on invalid fields
  - Error message below field
  - Notification toast on successful add/edit/delete

### Loading States

- **Not visible in screenshot**
- **Expected Behavior**:
  - Loading spinner when fetching price data
  - Disabled buttons during save operations
  - Skeleton loader for table rows

## Data Storage (FHIR Mapping)

### Recommended FHIR Approach

Since this financial data is specific to a service (ActivityDefinition), store as **extensions** on the ActivityDefinition resource.

#### Extension Structure

```json
{
  "resourceType": "ActivityDefinition",
  "id": "service-120-125",
  "identifier": [
    {
      "system": "http://medimind.ge/nomenclature/service-code",
      "value": "120-125"
    }
  ],
  "title": "/FNSC, FNSA ართრო-კორონარული შუნტირება",
  "status": "active",
  "extension": [
    {
      "url": "http://medimind.ge/fhir/extension/service-price",
      "extension": [
        {
          "url": "priceType",
          "valueString": "შიდა სტაციონარი"
        },
        {
          "url": "effectiveDate",
          "valueDate": "2016-01-01"
        },
        {
          "url": "amount",
          "valueMoney": {
            "value": 12300,
            "currency": "GEL"
          }
        },
        {
          "url": "insuranceCompanyCode",
          "valueString": "0"
        }
      ]
    },
    {
      "url": "http://medimind.ge/fhir/extension/service-price",
      "extension": [
        {
          "url": "priceType",
          "valueString": "სსიპ ჯანმრთელობის ეროვნული სააგენტო"
        },
        {
          "url": "effectiveDate",
          "valueDate": "2016-01-01"
        },
        {
          "url": "amount",
          "valueMoney": {
            "value": 12300,
            "currency": "GEL"
          }
        },
        {
          "url": "insuranceCompanyCode",
          "valueString": "1"
        }
      ]
    }
    // ... more price entries
  ]
}
```

### Field Mappings

| UI Field | FHIR Path | Data Type | Notes |
|----------|-----------|-----------|-------|
| ფასის ტიპი (Price Type) | extension[service-price].extension[priceType].valueString | string | Insurance company name |
| Insurance Company Code | extension[service-price].extension[insuranceCompanyCode].valueString | string | Numeric code (0, 1, 2, etc.) |
| თარიღი (Date) | extension[service-price].extension[effectiveDate].valueDate | date | ISO format: YYYY-MM-DD |
| ფასი (Price) | extension[service-price].extension[amount].valueMoney.value | decimal | Numeric price |
| ვალუტა (Currency) | extension[service-price].extension[amount].valueMoney.currency | code | Currency code (GEL, USD, EUR) |

## Translation Keys Needed

### Georgian (ka.json)
```json
{
  "registeredServices": {
    "modal": {
      "title": "რეგისტრირებული სერვისები",
      "close": "დახურვა"
    },
    "tabs": {
      "financial": "ფინანსური",
      "salary": "სახელფასო",
      "medical": "სამედიცინო",
      "accounting": "აღრიცხვება"
    },
    "financial": {
      "priceType": "ფასის ტიპი",
      "currency": "ვალუტა",
      "date": "თარიღი",
      "price": "ფასი",
      "addButton": "დამატება",
      "editButton": "რედაქტირება",
      "deleteButton": "წაშლა",
      "saveButton": "შენახვა",
      "cancelButton": "გაუქმება",
      "table": {
        "priceType": "ფასის ტიპი",
        "date": "თარიღი",
        "price": "ფასი",
        "currency": "ვალუტა",
        "actions": "მოქმედებები"
      },
      "validation": {
        "priceTypeRequired": "ფასის ტიპი აუცილებელია",
        "currencyRequired": "ვალუტა აუცილებელია",
        "dateRequired": "თარიღი აუცილებელია",
        "dateInvalid": "თარიღი არასწორია",
        "priceRequired": "ფასი აუცილებელია",
        "pricePositive": "ფასი უნდა იყოს დადებითი რიცხვი"
      },
      "success": {
        "added": "ფასი წარმატებით დაემატა",
        "updated": "ფასი წარმატებით განახლდა",
        "deleted": "ფასი წარმატებით წაიშალა"
      },
      "error": {
        "addFailed": "ფასის დამატება ვერ მოხერხდა",
        "updateFailed": "ფასის განახლება ვერ მოხერხდა",
        "deleteFailed": "ფასის წაშლა ვერ მოხერხდა",
        "fetchFailed": "ფასების ჩატვირთვა ვერ მოხერხდა"
      },
      "confirmDelete": {
        "title": "ფასის წაშლა",
        "message": "დარწმუნებული ხართ, რომ გსურთ ამ ფასის წაშლა?",
        "confirm": "წაშლა",
        "cancel": "გაუქმება"
      }
    }
  }
}
```

### English (en.json)
```json
{
  "registeredServices": {
    "modal": {
      "title": "Registered Services",
      "close": "Close"
    },
    "tabs": {
      "financial": "Financial",
      "salary": "Salary",
      "medical": "Medical",
      "accounting": "Accounting"
    },
    "financial": {
      "priceType": "Price Type",
      "currency": "Currency",
      "date": "Date",
      "price": "Price",
      "addButton": "Add",
      "editButton": "Edit",
      "deleteButton": "Delete",
      "saveButton": "Save",
      "cancelButton": "Cancel",
      "table": {
        "priceType": "Price Type",
        "date": "Date",
        "price": "Price",
        "currency": "Currency",
        "actions": "Actions"
      },
      "validation": {
        "priceTypeRequired": "Price type is required",
        "currencyRequired": "Currency is required",
        "dateRequired": "Date is required",
        "dateInvalid": "Date is invalid",
        "priceRequired": "Price is required",
        "pricePositive": "Price must be a positive number"
      },
      "success": {
        "added": "Price added successfully",
        "updated": "Price updated successfully",
        "deleted": "Price deleted successfully"
      },
      "error": {
        "addFailed": "Failed to add price",
        "updateFailed": "Failed to update price",
        "deleteFailed": "Failed to delete price",
        "fetchFailed": "Failed to load prices"
      },
      "confirmDelete": {
        "title": "Delete Price",
        "message": "Are you sure you want to delete this price?",
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
    "modal": {
      "title": "Зарегистрированные услуги",
      "close": "Закрыть"
    },
    "tabs": {
      "financial": "Финансовый",
      "salary": "Зарплата",
      "medical": "Медицинский",
      "accounting": "Учет"
    },
    "financial": {
      "priceType": "Тип цены",
      "currency": "Валюта",
      "date": "Дата",
      "price": "Цена",
      "addButton": "Добавить",
      "editButton": "Редактировать",
      "deleteButton": "Удалить",
      "saveButton": "Сохранить",
      "cancelButton": "Отмена",
      "table": {
        "priceType": "Тип цены",
        "date": "Дата",
        "price": "Цена",
        "currency": "Валюта",
        "actions": "Действия"
      },
      "validation": {
        "priceTypeRequired": "Тип цены обязателен",
        "currencyRequired": "Валюта обязательна",
        "dateRequired": "Дата обязательна",
        "dateInvalid": "Неверная дата",
        "priceRequired": "Цена обязательна",
        "pricePositive": "Цена должна быть положительным числом"
      },
      "success": {
        "added": "Цена успешно добавлена",
        "updated": "Цена успешно обновлена",
        "deleted": "Цена успешно удалена"
      },
      "error": {
        "addFailed": "Не удалось добавить цену",
        "updateFailed": "Не удалось обновить цену",
        "deleteFailed": "Не удалось удалить цену",
        "fetchFailed": "Не удалось загрузить цены"
      },
      "confirmDelete": {
        "title": "Удалить цену",
        "message": "Вы уверены, что хотите удалить эту цену?",
        "confirm": "Удалить",
        "cancel": "Отмена"
      }
    }
  }
}
```

## Implementation Notes

### Component Structure (Recommended)

```typescript
// File: packages/app/src/emr/components/nomenclature/RegisteredServicesModal.tsx
// Main modal component with 4 tabs

// File: packages/app/src/emr/components/nomenclature/FinancialTab.tsx
// Financial tab component with form and table

// File: packages/app/src/emr/components/nomenclature/ServicePriceForm.tsx
// Form component for adding/editing prices

// File: packages/app/src/emr/components/nomenclature/ServicePriceTable.tsx
// Table component displaying price entries

// File: packages/app/src/emr/services/servicePriceService.ts
// CRUD operations for service prices (FHIR extensions)

// File: packages/app/src/emr/hooks/useServicePrices.ts
// Hook for fetching and managing service prices
```

### Key Features to Implement

1. **Modal Component**:
   - 4 tabs with router or state-based navigation
   - Close button with confirmation if unsaved changes
   - Modal backdrop click to close (with confirmation)

2. **Financial Tab**:
   - Form with 4 fields + add button
   - Table with edit/delete actions
   - Real-time validation
   - Success/error notifications

3. **Price Type Dropdown**:
   - Reuse insurance companies from Patient History
   - Searchable dropdown (Mantine Select with `searchable` prop)
   - 58+ options

4. **Currency Dropdown**:
   - At minimum: GEL (default)
   - Optional: USD, EUR
   - Consider multi-currency pricing in future

5. **Date Picker**:
   - Mantine DateInput component
   - Format: DD-MM-YYYY display, YYYY-MM-DD storage
   - Validation: no future dates (optional business rule)

6. **Price Table**:
   - Turquoise gradient header
   - Scrollable content
   - Edit icon → populates form OR inline edit
   - Delete icon → confirmation modal

7. **FHIR Integration**:
   - Store prices as extensions on ActivityDefinition
   - Support multiple price entries per service
   - Update extensions array on add/edit/delete

### Testing Checklist

- [ ] Modal opens when clicking "რეგისტრირებული სერვისები" button
- [ ] Financial tab active by default
- [ ] All 4 form fields required validation
- [ ] Add button disabled until all fields filled
- [ ] Clicking "+" adds row to table
- [ ] Form fields clear after successful add
- [ ] Edit icon populates form with row data
- [ ] Delete icon shows confirmation modal
- [ ] Delete confirmation removes row from table
- [ ] Success notifications show on add/edit/delete
- [ ] Error notifications show on failed operations
- [ ] Close button (X) closes modal
- [ ] Modal title shows correct service name
- [ ] Currency defaults to GEL
- [ ] Date picker accepts valid dates
- [ ] Price field only accepts positive numbers
- [ ] Price type dropdown shows all insurance companies
- [ ] Table scrolls vertically with many entries
- [ ] Multilingual support (ka/en/ru)

## Questions for Clarification

To complete the implementation, these details need verification by testing the live system:

1. **Price Type Dropdown Options**:
   - What are ALL available options in the dropdown?
   - Does it match the 58 insurance companies from Patient History?
   - Are there additional price types beyond insurance companies?

2. **Currency Options**:
   - Is GEL the only currency?
   - Are USD, EUR supported?
   - What does the checkbox next to currency do?

3. **Edit Behavior**:
   - Does clicking edit icon populate the form above?
   - Or does it open inline editing in the table row?
   - Is there a separate "Save" button when editing?

4. **Delete Behavior**:
   - Does delete require confirmation?
   - Is it soft delete or hard delete?
   - Are there permission checks for deletion?

5. **Business Rules**:
   - Can multiple prices exist for same price type with different dates?
   - Which price applies if multiple dates exist (most recent before service date)?
   - Can future-dated prices be entered?

6. **Save Behavior**:
   - Is there a "Save All" button to commit all changes?
   - Or does each add/edit/delete save immediately?
   - Are changes saved to FHIR server or local state only?

7. **Other Tabs (Salary, Medical, Accounting)**:
   - Do these tabs have similar structures?
   - What fields do they contain?
   - Should they be documented separately?

## Next Steps

1. **Test Live System**:
   - Log into EMR with credentials (cicig / Tsotne2011)
   - Navigate to Nomenclature Medical 1 page
   - Click "რეგისტრირებული სერვისები" button
   - Click dropdown to see ALL price type options
   - Test add/edit/delete workflows
   - Capture additional screenshots if needed

2. **Document Remaining Tabs**:
   - Salary (სახელფასო) tab
   - Medical (სამედიცინო) tab
   - Accounting (აღრიცხვება) tab

3. **Implement Components**:
   - Create RegisteredServicesModal component
   - Create FinancialTab component
   - Create ServicePriceForm component
   - Create ServicePriceTable component

4. **Create FHIR Service**:
   - Implement servicePriceService.ts
   - CRUD operations for service price extensions
   - Integration with nomenclatureService

5. **Add Translations**:
   - Update ka.json, en.json, ru.json
   - Add all keys from translation section above

6. **Write Tests**:
   - Modal component tests
   - Financial tab tests
   - Form validation tests
   - Table action tests
   - FHIR service tests
