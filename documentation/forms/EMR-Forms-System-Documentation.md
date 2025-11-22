# EMR Forms System - Complete Documentation

**System URL**: http://178.134.21.82:8008/index.php
**Section**: ნომენკლატურა (Nomenclature) → ფორმები (Forms)
**Extracted**: 2025-11-21
**Total Forms**: 49 form templates

---

## Table of Contents

1. [Overview](#overview)
2. [Form Management Interface](#form-management-interface)
3. [Form Builder Structure](#form-builder-structure)
4. [Field Types](#field-types)
5. [Field Configuration Options](#field-configuration-options)
6. [Patient Data Bindings](#patient-data-bindings)
7. [Form Template Examples](#form-template-examples)
8. [API Endpoints](#api-endpoints)
9. [Database Structure](#database-structure)
10. [Form Lifecycle](#form-lifecycle)
11. [Implementation Guide for FHIR](#implementation-guide-for-fhir)

---

## Overview

The EMR Forms System is a comprehensive form builder and management system that allows administrators to create, edit, and manage medical consent forms, patient information forms, and other clinical documentation templates.

### Key Features

- **49 Pre-built Form Templates** - Including consent forms (IV-100/ა), patient records, clinical notes
- **Visual Form Builder** - WYSIWYG editor with drag-and-drop field placement
- **15+ Field Types** - Text, input, textarea, select, checkbox, decorative text, tables
- **Patient Data Auto-population** - Forms can auto-fill with patient demographics
- **Form Type Categorization** - Ambulatory, Stationary, Day Stationary, or All
- **Print-ready Output** - Forms render as printable PDF-like documents
- **Version Control** - Multiple versions of forms (e.g., 100/ა, 200-/ა, 200-7/ა)

---

## Form Management Interface

### Access Path

```
Main Menu → ნომენკლატურა (Nomenclature) → ფორმები (Forms)
```

### Main Interface Components

#### 1. Form Type Filter
- **Dropdown**: Select form category
  - ` ` (All/Blank)
  - `ამბულატორიული` (Ambulatory)
  - `სტაციონარული` (Stationary)
  - `სამივე (სტაც+ამბუ+დს)` (All three)
  - `დღის სტაციონარი` (Day Stationary)
  - `ამბულატორიული & დღის სტაციონარი` (Ambulatory & Day Stationary)
  - `სტაციონარი & დღის სტაციონარი` (Stationary & Day Stationary)

#### 2. Form Selection Dropdown
- Shows available form codes: `100/ა`, `200-/ა`, `200-7/ა`, etc.
- Changes the active form being edited

#### 3. Forms Table (`#docFrms`)
- **Total Forms**: 49 templates
- **Columns**:
  - Field Type configurations
  - Patient data bindings
  - Styling options (font, color, size)
  - Layout options (rowspan, colspan)
- **Row Actions**:
  - `.formupdate` - Edit/Update button (save icon)
  - `.formdel` - Delete button (trash icon)
  - `.formadd` - Add field button (plus icon)

#### 4. Action Buttons
- **download SQL** - Export form as SQL
- **Print** - Print form template
- **Add Header Title** - Insert form header
- **Add Field** (`#docfrmins`) - Insert new form field

---

## Form Builder Structure

### Form Header Configuration

Each form has a header section with:

| Property | Georgian | Description |
|----------|----------|-------------|
| Alignment | `გასწორება` | Left, Right, Center Top, Center Bottom |
| Description | `მინიშნებულია` | Field label or content text |
| Class | `კლასი` | CSS class name |
| Height | `სიმაღლე (rowspan)` | Row span for field |
| Width | `სიგანე (colspan)` | Column span for field |
| Font Size | `ფონტის ზომა` | Font size in px |
| Color | `ფერი` | Text color |
| Font | `ფონტი` | Font family (e.g., `mtavruli`) |
| Type | `ტიპი` | Numeric type identifier |

### Example Form Header (IV-100/ა Consent Form)

```
დამტკიცებულია
საქართველოს შრომის, ჯანმრთელობისა და სოციალური დაცვის მინისტრის
2008 წ., 15.10 №230/ბრძანებით

სამედიცინო დოკუმენტაცია ფორმა № IV-100/ა

ცნობა
ჯანმრთელობის მდგომარეობის შესახებ
```

**Configuration**:
- Row 1: Text block, rowspan=0, colspan=0, font-size=10
- Row 2: Text block, rowspan=0, colspan=0, font-size=17
- Row 3: Title text with class `ltsp`, font-size=20, font=`mtavruli`, type=100

---

## Field Types

The system supports **15 field types** (identified via `#df_type` dropdown):

### 1. Text Fields

| Field Type | Georgian | Description |
|------------|----------|-------------|
| **Text** | `ტექსტი` | Static text label |
| **Text End** | `ტექსტი ბოლო` | Text label with line break after |
| **Decorative Text** | `დეკორატიული ტექსტი` | Styled/formatted text |
| **Decorative Text End** | `დეკორატიული ტექსტი ბოლო` | Decorative text + line break |

### 2. Input Fields

| Field Type | Georgian | Description |
|------------|----------|-------------|
| **Input** | `ინფუთი` | Single-line text input |
| **Input End** | `ინფუთი ბოლო` | Input field + line break |
| **Textarea** | `ტექსტური არე` | Multi-line text area |
| **Textarea End** | `ტექსტური არე ბოლო` | Textarea + line break |

### 3. Selection Fields

| Field Type | Georgian | Description |
|------------|----------|-------------|
| **Select** | `არჩევის ველი` | Dropdown select field |
| **Select End** | `არჩევის ველი ბოლო` | Select + line break |
| **Checkbox** | `მოსანიშნი ველი` | Checkbox field |
| **Checkbox End** | `მოსანიშნი ველი ბოლო` | Checkbox + line break |

### 4. Table Elements

| Field Type | Georgian | Description |
|------------|----------|-------------|
| **Table Start** | `ცხრილის დაწყება` | Begin table element |
| **Table Row Start** | `ცხრილის მწკრივის დაწყება` | Begin table row |
| **Table Header Cell** | `ცხრილის ჰედერის უჯრა` | Table header cell |

**Pattern**: "ბოლო" (End) variants add a line break (`<br>`) after the field.

---

## Field Configuration Options

### Alignment (`#gfvbel`)
- ` ` (None/Default)
- `მარცხენა` (Left)
- `მარჯვენა` (Right)
- `ცენტრი ზედა` (Center Top)
- `ცენტრი ქვედა` (Center Bottom)

### Value Type (`#df_valnull`, `#ed_valnull`)
- `ტექსტი` (Text)
- `ინფუთი` (Input)
- `მიბმა` (Binding/Link)

### Font Options
- Font family: Text input (e.g., `mtavruli` for uppercase Georgian)
- Font size: Numeric input (px)
- Font color: Color picker or hex code

### Layout Options
- **Rowspan** (`სიმაღლე`): Number of rows the field spans
- **Colspan** (`სიგანე`): Number of columns the field spans
- **Class**: CSS class name for custom styling

---

## Patient Data Bindings

Forms can auto-populate with patient data using predefined bindings:

### Available Patient Data Fields

| Binding | Georgian | Source Data |
|---------|----------|-------------|
| **Name Surname** | `სახელი გვარი` | Patient.name (given + family) |
| **Address** | `მისამართი` | Patient.address |
| **Date of Birth** | `დაბადების თარიღი` | Patient.birthDate |
| **Gender** | `სქესი` | Patient.gender |
| **Phone** | `ტელეფონი` | Patient.telecom (phone) |
| **Treating Doctor** | `მკურნალი ექიმი` | Encounter.participant (practitioner) |
| **Inpatient Chart Number** | `სტაციონარული ბარათის ნომერი` | Encounter.identifier |
| **Personal ID** | `პირადი ნომერი` | Patient.identifier (personal-id) |
| **Admission Date** | `შემოსვლის თარიღი` | Encounter.period.start |
| **Discharge Date** | `გასვლის თარიღი` | Encounter.period.end |
| **Age** | `ასაკი` | Calculated from birthDate |
| **DOB + Age** | `დაბადების თარიღი და ასაკი` | Combined display |
| **Full Name + Patronymic** | `სახელი გვარი მამის სახელი` | Name + extension (patronymic) |
| **Workplace** | `სამუშაო ადგილი` | Patient extension or Observation |

**Binding Mechanism**: Fields with `მიბმა` (Binding) type automatically populate from patient/encounter resources.

---

## Form Template Examples

### Example 1: Consent Form IV-100/ა

**Form Code**: `100/ა`
**Type**: All (Ambulatory + Stationary + Day Stationary)
**Purpose**: Health Status Certificate

**Structure**:
- Header: Ministry approval text (font-size: 10px)
- Title: "სამედიცინო დოკუმენტაცია ფორმა № IV-100/ა" (font-size: 17px)
- Subtitle: "ცნობა ჯანმრთელობის მდგომარეობის შესახებ" (font-size: 20px, uppercase)
- Content: 22 numbered sections with text fields and input areas
- Footer: Signature area with date

**Field Count**: ~45 fields (text + input + textarea)

### Example 2: Form 200-/ა

**Form Code**: `200-/ა`
**Type**: Stationary
**Purpose**: Inpatient admission form

**Common Pattern**:
1. Patient demographics (auto-populated via bindings)
2. Clinical information (input fields)
3. Doctor notes (textarea)
4. Signature section (text + input)

---

## API Endpoints

### Primary Endpoints

#### 1. Load Forms List
```
POST /sub/3/301/load.php
```
- Returns: List of all form templates
- Response: HTML table with form rows

#### 2. Form Data Reporter
```
POST /sub/3/301/reporter.php
```
- Purpose: Generate form report/preview
- Input: Form ID, patient data
- Output: Rendered form HTML

#### 3. Insert/Update Form Fields
```
POST /sub/3/301/repinserts.php
```
- Purpose: Add or update form field
- Parameters:
  - `df_type`: Field type (1-15)
  - `df_text`: Field label/content
  - `df_class`: CSS class
  - `df_height`: Rowspan
  - `df_width`: Colspan
  - `df_fontsize`: Font size
  - `df_color`: Text color
  - `df_font`: Font family
  - `df_fonttype`: Font style
  - `df_valnull`: Value type (text/input/binding)
  - `df_goodkey`: Patient data binding key

#### 4. Load Nomenclature Module
```
POST /sub/3/load.php
```
- Loads nomenclature section (parent module)

### AJAX Call Pattern

The system uses `glAj()` function for AJAX calls:

```javascript
glAj(
  "insert5v",           // Container ID
  "repinserts",         // PHP file (repinserts.php)
  "",                   // Extra param
  "mnhov",              // Overlay container
  "mainMsg",            // Message container
  "|",                  // Separator
  "|",                  // Separator
  {19: "0"},            // Parameter object
  {"df_type": "9"},     // Field type
  {"df_text": "11"},    // Field text
  {"df_class": "11"},   // CSS class
  // ... more parameters
);
```

---

## Database Structure

### Inferred Database Schema

Based on the form structure and API calls, the database likely has:

#### Table: `forms` (or `medical_forms`)
```sql
CREATE TABLE forms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    form_code VARCHAR(20) NOT NULL,           -- "100/ა", "200-/ა", etc.
    form_name VARCHAR(255),                   -- Form description
    form_type ENUM('ambulatory', 'stationary', 'day_stationary', 'all'),
    created_at DATETIME,
    updated_at DATETIME,
    active BOOLEAN DEFAULT 1
);
```

#### Table: `form_fields`
```sql
CREATE TABLE form_fields (
    id INT PRIMARY KEY AUTO_INCREMENT,
    form_id INT NOT NULL,                     -- FK to forms.id
    field_order INT,                          -- Display order
    field_type ENUM(
        'text', 'text_end',                   -- ტექსტი, ტექსტი ბოლო
        'input', 'input_end',                 -- ინფუთი, ინფუთი ბოლო
        'textarea', 'textarea_end',           -- ტექსტური არე
        'select', 'select_end',               -- არჩევის ველი
        'checkbox', 'checkbox_end',           -- მოსანიშნი ველი
        'decorative_text', 'decorative_text_end',
        'table_start', 'table_row_start', 'table_header_cell'
    ),
    field_label TEXT,                         -- df_text
    field_value_type ENUM('text', 'input', 'binding'), -- df_valnull
    binding_key VARCHAR(100),                 -- df_goodkey (patient data binding)
    css_class VARCHAR(100),                   -- df_class
    rowspan INT DEFAULT 1,                    -- df_height
    colspan INT DEFAULT 1,                    -- df_width
    font_size INT,                            -- df_fontsize
    font_color VARCHAR(20),                   -- df_color
    font_family VARCHAR(50),                  -- df_font
    font_style VARCHAR(50),                   -- df_fonttype
    alignment ENUM('left', 'right', 'center_top', 'center_bottom'), -- gfvbel
    required BOOLEAN DEFAULT 0,
    created_at DATETIME,
    FOREIGN KEY (form_id) REFERENCES forms(id)
);
```

#### Table: `form_instances` (Completed Forms)
```sql
CREATE TABLE form_instances (
    id INT PRIMARY KEY AUTO_INCREMENT,
    form_id INT NOT NULL,                     -- FK to forms.id
    patient_id INT,                           -- FK to patients table
    encounter_id INT,                         -- FK to encounters table
    form_data JSON,                           -- Completed form field values
    completed_by INT,                         -- User ID who filled the form
    completed_at DATETIME,
    pdf_path VARCHAR(500),                    -- Path to generated PDF
    status ENUM('draft', 'completed', 'signed'),
    FOREIGN KEY (form_id) REFERENCES forms(id)
);
```

---

## Form Lifecycle

### 1. Form Template Creation

**Steps**:
1. Administrator navigates to `ნომენკლატურა → ფორმები`
2. Selects form type (Ambulatory/Stationary/etc.)
3. Enters form code (e.g., `100/ა`)
4. Clicks "Add Header Title" to create form header
5. Adds fields one by one:
   - Selects field type from dropdown (`#df_type`)
   - Enters field label/content (`df_text`)
   - Configures styling (font, color, size)
   - Sets layout (rowspan, colspan)
   - Optionally binds to patient data (`df_goodkey`)
   - Clicks "Add Field" button (`#docfrmins`)
6. Saves form template

**API Call**: `POST /sub/3/301/repinserts.php`

---

### 2. Form Assignment to Patient

**Steps** (Inferred):
1. User opens patient record
2. Navigates to Forms/Documents section
3. Selects form template from dropdown (e.g., `100/ა`)
4. System auto-populates patient data fields (bindings)
5. User fills in remaining fields (clinical notes, observations)
6. Saves completed form

**Data Storage**: Form field values stored in `form_instances.form_data` as JSON

---

### 3. Form Rendering

**Steps**:
1. System loads form template from `forms` and `form_fields`
2. For each field:
   - If `binding_key` exists, fetch patient/encounter data
   - Render field based on `field_type`:
     - **Text**: `<span>` or `<p>` with label
     - **Input**: `<input type="text">` with value
     - **Textarea**: `<textarea>` with content
     - **Select**: `<select>` with options
     - **Checkbox**: `<input type="checkbox">`
     - **Table**: `<table>`, `<tr>`, `<th>` elements
3. Apply styling (CSS class, font, color, size)
4. Generate printable HTML

**API Call**: `POST /sub/3/301/reporter.php`

---

### 4. Form Export/Print

**Steps**:
1. User clicks "download SQL" or "Print" button
2. System renders form as HTML
3. Converts to PDF (server-side, likely using TCPDF or mPDF)
4. Returns PDF file for download or print

**Output**: PDF with form header, patient data, and filled fields

---

## Implementation Guide for FHIR

### Mapping to FHIR Resources

#### Form Template → FHIR Questionnaire

```typescript
import { Questionnaire, QuestionnaireItem } from '@medplum/fhirtypes';

const formTemplate: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'form-100-a',
  identifier: [{
    system: 'http://medimind.ge/forms',
    value: '100/ა'
  }],
  title: 'ცნობა ჯანმრთელობის მდგომარეობის შესახებ',
  status: 'active',
  subjectType: ['Patient'],
  item: [
    {
      linkId: '1',
      text: 'ცნობის გამცემი დაწესებულების დასახელება',
      type: 'string',
      required: true,
      extension: [{
        url: 'http://medimind.ge/form-field-type',
        valueString: 'input'
      }, {
        url: 'http://medimind.ge/patient-binding',
        valueString: '' // No binding (manual entry)
      }]
    },
    {
      linkId: '2',
      text: 'პაციენტის სახელი გვარი',
      type: 'string',
      required: true,
      extension: [{
        url: 'http://medimind.ge/form-field-type',
        valueString: 'input'
      }, {
        url: 'http://medimind.ge/patient-binding',
        valueString: 'name' // Auto-populate from Patient.name
      }]
    },
    {
      linkId: '3',
      text: 'პირადი ნომერი',
      type: 'string',
      extension: [{
        url: 'http://medimind.ge/patient-binding',
        valueString: 'personal-id'
      }]
    },
    // ... more fields
  ]
};
```

#### Completed Form → FHIR QuestionnaireResponse

```typescript
import { QuestionnaireResponse } from '@medplum/fhirtypes';

const completedForm: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  questionnaire: 'Questionnaire/form-100-a',
  status: 'completed',
  authored: '2025-11-21T10:30:00Z',
  author: {
    reference: 'Practitioner/dr-tengizi-khozvria'
  },
  source: {
    reference: 'Patient/patient-123'
  },
  encounter: {
    reference: 'Encounter/visit-456'
  },
  item: [
    {
      linkId: '1',
      answer: [{
        valueString: 'MediMind Medical Center'
      }]
    },
    {
      linkId: '2',
      answer: [{
        valueString: 'თენგიზი ხოზვრია' // Auto-filled
      }]
    },
    {
      linkId: '3',
      answer: [{
        valueString: '26001014632' // Auto-filled from Patient.identifier
      }]
    }
    // ... more answers
  ]
};
```

### Field Type Mapping

| Original System | FHIR QuestionnaireItem.type | Extensions |
|-----------------|----------------------------|------------|
| `ტექსტი` (Text) | `display` | `{"field-type": "text"}` |
| `ინფუთი` (Input) | `string` | `{"field-type": "input"}` |
| `ტექსტური არე` (Textarea) | `text` | `{"field-type": "textarea"}` |
| `არჩევის ველი` (Select) | `choice` | `{"field-type": "select"}` + `answerOption` |
| `მოსანიშნი ველი` (Checkbox) | `boolean` | `{"field-type": "checkbox"}` |
| `ცხრილის დაწყება` (Table) | `group` | `{"field-type": "table-start"}` |

### Patient Data Binding Implementation

```typescript
export async function populateFormWithPatientData(
  questionnaire: Questionnaire,
  patient: Patient,
  encounter?: Encounter
): Promise<QuestionnaireResponse> {

  const response: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    questionnaire: `Questionnaire/${questionnaire.id}`,
    status: 'in-progress',
    source: { reference: `Patient/${patient.id}` },
    encounter: encounter ? { reference: `Encounter/${encounter.id}` } : undefined,
    item: []
  };

  // Map each question item
  for (const item of questionnaire.item || []) {
    const bindingKey = item.extension?.find(
      ext => ext.url === 'http://medimind.ge/patient-binding'
    )?.valueString;

    let value: string | undefined;

    // Auto-populate based on binding key
    switch (bindingKey) {
      case 'name':
        value = `${patient.name?.[0]?.given?.[0]} ${patient.name?.[0]?.family}`;
        break;
      case 'personal-id':
        value = patient.identifier?.find(
          id => id.system === 'http://medimind.ge/identifiers/personal-id'
        )?.value;
        break;
      case 'birthdate':
        value = patient.birthDate;
        break;
      case 'gender':
        value = patient.gender === 'male' ? 'მამრობითი' : 'მდედრობითი';
        break;
      case 'phone':
        value = patient.telecom?.find(t => t.system === 'phone')?.value;
        break;
      case 'address':
        const addr = patient.address?.[0];
        value = addr ? `${addr.city} ${addr.line?.join(' ')}` : undefined;
        break;
      case 'admission-date':
        value = encounter?.period?.start;
        break;
      case 'discharge-date':
        value = encounter?.period?.end;
        break;
      case 'age':
        if (patient.birthDate) {
          const age = new Date().getFullYear() - new Date(patient.birthDate).getFullYear();
          value = age.toString();
        }
        break;
      // ... more bindings
    }

    response.item?.push({
      linkId: item.linkId,
      answer: value ? [{ valueString: value }] : []
    });
  }

  return response;
}
```

### Form Rendering Service

```typescript
export async function renderFormAsPDF(
  questionnaire: Questionnaire,
  response: QuestionnaireResponse
): Promise<Buffer> {

  // Generate HTML from questionnaire + response
  const html = generateFormHTML(questionnaire, response);

  // Convert to PDF (using Puppeteer or similar)
  const pdfBuffer = await htmlToPdf(html);

  return pdfBuffer;
}

function generateFormHTML(
  questionnaire: Questionnaire,
  response: QuestionnaireResponse
): string {

  let html = `
    <html>
    <head>
      <style>
        body { font-family: 'Arial', sans-serif; font-size: 12pt; }
        .form-header { text-align: center; font-weight: bold; }
        .field-label { font-weight: bold; margin-top: 10px; }
        .field-value { border-bottom: 1px solid #000; min-height: 20px; }
        table { width: 100%; border-collapse: collapse; }
        td, th { border: 1px solid #000; padding: 5px; }
      </style>
    </head>
    <body>
  `;

  // Add form title
  html += `<div class="form-header"><h2>${questionnaire.title}</h2></div>`;

  // Render each field
  for (const item of questionnaire.item || []) {
    const answer = response.item?.find(i => i.linkId === item.linkId);
    const value = answer?.answer?.[0]?.valueString || '';

    const fieldType = item.extension?.find(
      ext => ext.url === 'http://medimind.ge/form-field-type'
    )?.valueString;

    if (item.type === 'display') {
      // Static text
      html += `<div class="field-label">${item.text}</div>`;
    } else {
      // Input field
      html += `
        <div class="field-label">${item.text}</div>
        <div class="field-value">${value}</div>
      `;
    }
  }

  html += `</body></html>`;
  return html;
}
```

---

## Summary

The original EMR Forms System is a feature-rich form builder with:

1. **49 pre-built medical form templates**
2. **15 field types** (text, input, select, checkbox, table elements)
3. **Patient data auto-population** via bindings
4. **Visual form builder** with WYSIWYG editing
5. **Print/PDF export** functionality
6. **Form versioning** (100/ა, 200-/ა, etc.)

### Key Implementation Requirements for FHIR

- Map forms to **FHIR Questionnaire** resources
- Map completed forms to **FHIR QuestionnaireResponse** resources
- Implement patient data bindings using **FHIR extensions**
- Create PDF rendering service for print output
- Support 15 field types with proper FHIR mapping
- Maintain Georgian language support throughout

### Next Steps

1. Create Questionnaire resources for all 49 forms
2. Build form builder UI component (React)
3. Implement auto-population service
4. Add PDF export functionality
5. Create form assignment workflow (link to Encounter)
6. Test with sample patient data

---

**Documentation Complete**: 2025-11-21
**Author**: Claude Code (Anthropic)
**Source**: http://178.134.21.82:8008 EMR System
