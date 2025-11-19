# Financial Tab (ფინანსური) - Registered Services Modal

## Overview
This modal opens when clicking a service row in the Nomenclature Medical 1 page. It contains 4 tabs for managing different aspects of the registered service.

## Modal Structure

### Modal Header
- **Title Format**: `{Service Code} {Service Name}`
- **Example**: "I20-125 /FNSC, FNSA არტერ-კორონარული მენტირება"
- **Close Button**: X icon in top-right corner

### Tab Navigation (4 Tabs)
1. **ფინანსური** (Financial) - ACTIVE TAB
2. **სახელფასო** (Salary/Payroll)
3. **სამედიცინო** (Medical)
4. **აქრიმებები** (Accruals)

---

## Financial Tab (ფინანსური) Details

### Top Form Section

#### Field 1: ფასის ტიპი (Price Type) - Dropdown
- **Type**: Select dropdown
- **Label**: "ფასის ტიპი" (Price Type)
- **Required**: Yes
- **Options**:
  - "მიღება სტანდარტი" (Standard reception)
  - "სისხლი განვითრებითი ერვდნული სააგენტო" (Blood development agent)
  - "არის განვითრებითი" (Has development)
  - Other options visible in table rows below

#### Field 2: ვალუტა (Currency) - Dropdown
- **Type**: Select dropdown
- **Label**: "ვალუტა" (Currency)
- **Required**: Yes
- **Options**:
  - "GEL" (Georgian Lari) - Default
  - Other currency options

#### Field 3: თარიღი (Date) - Date Input
- **Type**: Date picker
- **Label**: "თარიღი" (Date)
- **Required**: Yes
- **Format**: DD-MM-YYYY (e.g., "01-01-2016")

#### Field 4: ფასი (Price) - Number Input
- **Type**: Number input
- **Label**: "ფასი" (Price)
- **Required**: Yes
- **Format**: Integer (e.g., 12300)

#### Add Button
- **Type**: Action button
- **Icon**: Plus (+) symbol
- **Action**: Add new price entry to table below
- **Position**: Right side of form fields

---

### Data Table

#### Table Columns (4 columns)
| Column # | Header (Georgian) | Header (English) | Type | Width |
|----------|-------------------|------------------|------|-------|
| 1 | ფასის ტიპი | Price Type | Text | ~40% |
| 2 | თარიღი | Date | Date | ~20% |
| 3 | ფასი | Price | Number | ~20% |
| 4 | ვალუტა | Currency | Text | ~20% |

#### Table Header Styling
- **Background**: Turquoise gradient (matching EMR theme)
- **Text Color**: White
- **Font Weight**: Bold

#### Sample Table Rows (from screenshot)

**Row 1:**
- Price Type: "შიდა სტანდარტი" (Internal standard)
- Date: "01-01-2016"
- Price: "12300"
- Currency: "ლარი" (Lari/GEL)

**Row 2:**
- Price Type: "სისხლ განვითრებითის ერვდნული სააგენტო" (Blood development national agency)
- Date: "01-01-2016"
- Price: "12300"
- Currency: "ლარი"

**Row 3:**
- Price Type: "თერაპშელი" (Therapeutic)
- Date: "01-01-2016"
- Price: "12300"
- Currency: "ლარი"

**Row 4:**
- Price Type: "ჰემა" (Hema)
- Date: "01-01-2016"
- Price: "12300"
- Currency: "ლარი"

**Row 5:**
- Price Type: "ს.ს. საღამოძვრებო კომპანია "ვიპიათ პოლიდენტი"" (S.S. Insurance company "Vipi Polident")
- Date: "01-01-2016"
- Price: "12300"
- Currency: "ლარი"

**Row 6:**
- Price Type: "ალდაგი" (Aldagi)
- Date: "01-01-2016"
- Price: "12300"
- Currency: "ლარი"

**Row 7:**
- Price Type: "ქართუ დაზღვევა" (Qartu Insurance)
- Date: "01-01-2016"
- Price: "12300"
- Currency: "ლარი"

**Row 8:**
- Price Type: "სტუდენტი დაზღვევა" (Student Insurance)
- Date: "01-01-2016"
- Price: "12300"
- Currency: "ლარი"

**Row 9:**
- Price Type: "სს "პაშ დაზღვევა"" (SS "Pash Insurance")
- Date: "01-01-2016"
- Price: "12300"
- Currency: "ლარი"

**Row 10:**
- Price Type: "სს ,საღამოძვრებო კომპანია ევროპის ვორავი"" (SS Insurance company Europe's...)
- Date: "01-01-2016"
- Price: "12300"
- Currency: "ლარი"

**Row 11:**
- Price Type: "მშვს სავადმზღცო კომპანია "არის ავუსო"" (MSHV Insurance company "Aris Avuso")
- Date: "01-01-2016"
- Price: "12300"
- Currency: "ლარი"

**Row 12:**
- Price Type: "ი მუდტი დაზედებითი კომპანია განამითრებითის და პროდაუნის სამ სოცილოზი დავების" (Insurance company development and product social...)
- Date: "01-01-2016"
- Price: "12300"
- Currency: "ლარი"

**Row 13:**
- Price Type: "იმუთი L" (Imuti L)
- Date: "01-01-2016"
- Price: "12300"
- Currency: "ლარი"

**Row 14:**
- Price Type: "არარობლდენი" (Non-visible)
- Date: "01-02-2017"
- Price: "14760"
- Currency: "ლარი"

**Row 15:**
- Price Type: "ქ. თბილისის მუნიციპალიტეტის მერია" (Tbilisi Municipality City Hall)
- Date: "01-01-2016"
- Price: "12300"
- Currency: "ლარი"

**Row 16:**
- Price Type: "სამხრეთ ოსეთის აღმოხცენის სამართა" (South Ossetia restoration administration)
- Date: "01-01-2016"
- Price: "12300"
- Currency: "ლარი"

**Row 17:**
- Price Type: "იოა" (IOA)
- Date: "01-01-2016"
- Price: "12300"
- Currency: "ლარი"

**Row 18:**
- Price Type: "ვია-ვიგა" (Via-Viga)
- Date: "01-01-2016"
- Price: "12300"
- Currency: "ლარი"

**Row 19:**
- Price Type: "რევალტალერ დამადურის სერნი" (Revalutionary insurance service)
- Date: "01-01-2016"
- Price: "12300"
- Currency: "ლარი"

**Row 20:**
- Price Type: ""კახეთი-იორი"" (Kakheti-Iori)
- Date: "01-01-2001"
- Price: "12300"
- Currency: "ლარი"

**Row 21:**
- Price Type: "საქართველოს სასპუსოდებულებისა და პროდაუნის სამ" (Georgia's representative and product...)
- Date: "01-01-2001"
- Price: "12300"
- Currency: "ლარი"

*(Table continues with more rows...)*

---

## Price Type Dropdown Options

Based on table data, the Price Type dropdown includes:
1. შიდა სტანდარტი (Internal standard)
2. სისხლ განვითრებითის ერვდნული სააგენტო (Blood development national agency)
3. თერაპშელი (Therapeutic)
4. ჰემა (Hema)
5. ს.ს. საღამოძვრებო კომპანია "ვიპიათ პოლიდენტი" (Insurance company "Vipi Polident")
6. ალდაგი (Aldagi)
7. ქართუ დაზღვევა (Qartu Insurance)
8. სტუდენტი დაზღვევა (Student Insurance)
9. სს "პაშ დაზღვევა" (Pash Insurance)
10. სს ,საღამოძვრებო კომპანია ევროპის ვორავი (Insurance company Europe's...)
11. მშვს სავადმზღცო კომპანია "არის ავუსო" (Insurance company "Aris Avuso")
12. ი მუდტი დაზედებითი კომპანია (Insurance company)
13. იმუთი L (Imuti L)
14. არარობლდენი (Non-visible)
15. ქ. თბილისის მუნიციპალიტეტის მერია (Tbilisi Municipality)
16. სამხრეთ ოსეთის აღმოხცენის სამართა (South Ossetia restoration)
17. იოა (IOA)
18. ვია-ვიგა (Via-Viga)
19. რევალტალერ დამადურის სერნი (Revolutionary insurance service)
20. კახეთი-იორი (Kakheti-Iori)
21. საქართველოს სასპუსოდებულებისა და პროდაუნის სამ (Georgia's representative)

*(Note: These likely correspond to insurance companies and payment types)*

---

## Currency Dropdown Options

1. **GEL** (Georgian Lari) - Default
2. **ლარი** (Lari) - Georgian name for GEL

*(Other currencies may be available but not visible in screenshot)*

---

## Validation Rules

### Price Type Field
- **Required**: Yes
- **Type**: Must select from dropdown options
- **Error Message**: (To be determined)

### Currency Field
- **Required**: Yes
- **Type**: Must select from dropdown options
- **Default**: GEL
- **Error Message**: (To be determined)

### Date Field
- **Required**: Yes
- **Format**: DD-MM-YYYY
- **Validation**: Must be valid date
- **Error Message**: (To be determined)

### Price Field
- **Required**: Yes
- **Type**: Number (integer)
- **Minimum**: 0 (assumed)
- **Format**: No decimal places shown in examples
- **Error Message**: (To be determined)

---

## Actions

### Add New Price Entry
- **Trigger**: Click + button
- **Validation**: All 4 fields must be filled
- **Action**: Add new row to table below
- **Behavior**: Form fields should clear after successful addition

### Edit Price Entry
- **Trigger**: Click on table row (assumed)
- **Action**: Populate form fields with row data for editing
- **Behavior**: Update existing row on save

### Delete Price Entry
- **Trigger**: Delete icon/button on row (if exists)
- **Action**: Remove row from table
- **Confirmation**: May require confirmation dialog

---

## UI Styling

### Modal
- **Background**: White
- **Border**: Standard modal border
- **Shadow**: Elevation shadow
- **Width**: ~800-1000px (responsive)
- **Max Height**: Scrollable if content exceeds viewport

### Form Section
- **Background**: Light background (subtle gray)
- **Padding**: Standard padding around fields
- **Field Layout**: Horizontal row with inline fields

### Table
- **Header Background**: Turquoise gradient (`var(--emr-gradient-submenu)`)
- **Header Text**: White, bold
- **Row Background**: Alternating white/light gray (zebra striping)
- **Row Hover**: Light blue/turquoise highlight
- **Border**: Standard table borders

### Buttons
- **Add Button (+)**: Turquoise/blue accent color
- **Close Button (X)**: Standard gray

---

## Implementation Notes

### FHIR Resource Mapping
This financial data likely maps to:
- **ChargeItemDefinition** - For service pricing definitions
- **ChargeItem** - For individual charge instances
- Extensions for:
  - Price type (insurance company or payment category)
  - Currency
  - Effective date
  - Amount

### Related Services
- Price type dropdown should load from insurance companies list
- Currency dropdown should support multiple currencies (GEL, USD, EUR, etc.)
- Date validation should prevent future dates (or allow based on business rules)

### Data Structure
```typescript
interface FinancialPriceEntry {
  priceType: string;        // Insurance company or payment category
  date: string;             // Format: DD-MM-YYYY
  price: number;            // Integer amount
  currency: string;         // Currency code (GEL, USD, etc.)
}
```

---

## Screenshots Reference
- Modal overview: Screenshot 2025-11-19 at 12.57.37.png
- Financial tab detail: Screenshot 2025-11-19 at 12.58.27.png
