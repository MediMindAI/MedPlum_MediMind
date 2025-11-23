# Form 100 (ფორმა № IV-100/ა) - Health Status Certificate Mapping

## Overview

**Form Name**: სამედიცინო დოკუმენტაცია ფორმა № IV-100/ა
**Form Title**: ცნობა ჯანმრთელობის მდგომარეობის შესახებ (Health Status Certificate)
**Legal Reference**: დამტკიცებულია საქართველოს შრომის, ჯანმრთელობისა და სოციალური დაცვის მინისტრის 2008 წ. 15.10 №230/ნ ბრძანებით
**Purpose**: Official health certificate used in Georgian healthcare system for documenting patient health status

## Form Structure

### Header Section (Top Dropdowns)

| Element | Georgian Label | Type | Options | Default |
|---------|---------------|------|---------|---------|
| Form Category | ამბულატორიული | Dropdown | ამბულატორიული (Ambulatory), სტაციონარი (Stationary) | ამბულატორიული |
| Form Type | 100/ა | Dropdown | 100/ა, other variants | 100/ა |

### Form Fields (20 Fields Total)

#### Section 1: Institution Information

| # | Georgian Label | English Translation | Field Type | Required | Notes |
|---|---------------|---------------------|------------|----------|-------|
| 1 | ცნობის გამცემი დაწესებულების დასახელება ან/და ექიმი სპეციალისტის გვარი, სახელი, სახელმწიფო სერტიფიკატით მინიჭებული სპეციალობა. სახელმწიფო სერთიფიკატის ნომერი ან/და საკონტაქტო ინფორმაცია | Institution name and/or doctor's specialty, name, specialty assigned by state certificate. State certificate number and/or contact information | Text (single line) | Yes | Auto-populated from logged-in user/institution |

#### Section 2: Destination Information

| # | Georgian Label | English Translation | Field Type | Required | Notes |
|---|---------------|---------------------|------------|----------|-------|
| 2 | დაწესებულების დასახელება, მისამართი სადაც იგზავნება ცნობა | Institution name, address where certificate is sent | Textarea (2 columns) | Yes | Split into two columns: დანიშნულებისამებრ (By appointment) and წარსადგენად (To be presented) |

#### Section 3: Patient Demographics

| # | Georgian Label | English Translation | Field Type | Required | Validation | FHIR Mapping |
|---|---------------|---------------------|------------|----------|------------|--------------|
| 3 | პაციენტის სახელი და გვარი | Patient's first name and surname | Text | Yes | Georgian/Latin characters | Patient.name |
| 4 | დაბადების თარიღი (რიცხვი/თვე/წელი) | Date of birth (day/month/year) | Date | Yes | dd/mm/yyyy format | Patient.birthDate |
| 5 | პირადი ნომერი | Personal ID number | Text | Conditional | 11-digit Georgian ID (Luhn checksum). Note: "ივსება 16 წელს მიღწეული პირის შემთხვევაში" (filled for persons 16 years and older) | Patient.identifier |
| 6 | მისამართი | Address | Text | Yes | Free text | Patient.address |

#### Section 4: Study/Work Information

| # | Georgian Label | English Translation | Field Type | Required | Notes |
|---|---------------|---------------------|------------|----------|-------|
| 7 | სამუშაო ადგილი და თანამდებობა (მოსწავლის/სტუდენტის შემთხვევაში - იმ სასწავლო დაწესებულების/სკოლის დასახელება და კლასი/კურსი. სადაც იგი სწავლობს) | Workplace and position (for student - name of educational institution/school and class/course where they study) | Textarea | No | Multi-line input for detailed information |

#### Section 5: Dates and History

| # | Georgian Label | English Translation | Field Type | Required | Notes |
|---|---------------|---------------------|------------|----------|-------|
| 8 | თარიღები: ა) ექიმთან მიმართვის | Dates: a) Visit to doctor | Date | Yes | First contact date |
| 8b | ბ) სტაციონარში გაგზავნის | b) Sent to hospital | Date | No | Hospital referral date |
| 8c | გ) სტაციონარში მოთავსების | c) Placed in hospital | Date | No | Hospital admission date |
| 8d | დ) განერის | d) Discharge | Date | No | Discharge date |

#### Section 6: Health Status Details

| # | Georgian Label | English Translation | Field Type | Required | Notes |
|---|---------------|---------------------|------------|----------|-------|
| 9 | დასკვნა ჯანმრთელობის მდგომარეობის შესახებ ან სრული დიაგნოზი (ძირითადი დაავადება, თანმხლები დაავადებები, გართულებები) | Conclusion about health status or full diagnosis (main disease, accompanying diseases, complications) | Textarea | Yes | Multi-line, detailed diagnosis |
| 10 | გადატანილი დაავადებები | Past diseases | Textarea | No | Medical history |
| 11 | მოკლე ანამნეზი | Brief anamnesis | Textarea | No | Short medical history |
| 12 | ჩატარებული დიაგნოსტიკური გამოკვლევები და კონსულტაციები | Conducted diagnostic examinations and consultations | Text | No | List of tests/consultations |
| 13 | ავადმყოფობის მიმდინარეობა | Course of illness | Textarea | No | Disease progression |
| 14 | ჩატარებული მკურნალობა | Treatment provided | Textarea | No | Treatment details |
| 15 | მდგომარეობა სტაციონარში მოთავსებისას | Condition at hospital admission | Textarea | No | Admission status |
| 16 | მდგომარეობა სტაციონარიდან განერისას | Condition at hospital discharge | Textarea | No | Discharge status |

#### Section 7: Recommendations and Certification

| # | Georgian Label | English Translation | Field Type | Required | Notes |
|---|---------------|---------------------|------------|----------|-------|
| 17 | სამკურნალო და შრომითი რეკომენდაციები | Treatment and work recommendations | Text | No | Post-treatment guidance |
| 18 | მკურნალი ექიმი (ექიმი სპეციალისტი) | Attending physician (specialist doctor) | Text | Yes | Doctor's name/specialty |
| 19 | დაწესებულების ხელმძღვანელის/ხელმძღვანელის მოადგილის/მკურნალი ექიმის (ექიმი-სპეციალისტის) ხელმოწერა | Signature of institution head/deputy head/attending physician (specialist doctor) | Signature | Yes | Digital signature field |
| 20 | ცნობის გაცემის თარიღი | Certificate issue date | Date | Yes | Auto-filled or manual |

### Footer Section

| Element | Georgian Label | English Translation | Type |
|---------|---------------|---------------------|------|
| Seal | ბეჭდის ადგილი | Seal place | Stamp/Seal area |
| Print | Print icon | Print | Action button |
| Download | download SQL | Download SQL | Link (for form template export) |

## Form Configuration Table (Admin Panel)

The form has a configuration table at the bottom for customizing the form layout:

### Table Columns

| Column | Georgian | English | Description |
|--------|----------|---------|-------------|
| Section | (dropdown) | Section selector | მარჯვენა (Right), ცენტრი ზედა (Center Top), ცენტრი ქვედა (Center Bottom) |
| მნიშვნელობა | Value | Content/text for this section |
| კლასი | Class | CSS class name |
| სიმაღლე | Height | Height in pixels |
| სიგანე | Width | Width in pixels |
| ფონტის ზომა | Font Size | Font size in points |
| ფერი | Color | Text color |
| ფონტი | Font | Font family |
| ტიპი | Type | Element type |

### Pre-configured Sections

| Section | Content | Height | Width | Font Size | Font | Type |
|---------|---------|--------|-------|-----------|------|------|
| მარჯვენა (Right) | Header text (Ministry approval info) | 0 | 0 | 10 | - | 0 |
| ცენტრი ზედა (Center Top) | Form title | 0 | 0 | 17 | - | 0 |
| ცენტრი ქვედა (Center Bottom) | Main form content (ltsp) | 0 | 0 | 20 | mtavruli | 100 |

## FHIR Resource Mapping

### Primary Resource: DocumentReference

```typescript
interface Form100Document {
  resourceType: 'DocumentReference';
  status: 'current' | 'superseded' | 'entered-in-error';
  type: {
    coding: [{
      system: 'http://medimind.ge/document-types',
      code: 'form-100',
      display: 'Health Status Certificate (ფორმა № IV-100/ა)'
    }]
  };
  subject: Reference<Patient>;
  author: Reference<Practitioner | Organization>[];
  date: dateTime; // Field 20: Certificate issue date
  content: [{
    attachment: {
      contentType: 'application/pdf',
      url: string
    }
  }];
}
```

### Supporting Resources

#### QuestionnaireResponse (for form data)

```typescript
interface Form100Response {
  resourceType: 'QuestionnaireResponse';
  questionnaire: 'http://medimind.ge/questionnaires/form-100';
  status: 'completed' | 'in-progress' | 'amended';
  subject: Reference<Patient>;
  authored: dateTime;
  author: Reference<Practitioner>;
  item: QuestionnaireResponseItem[]; // 20 fields
}
```

#### Patient (linked)

```typescript
// Fields 3-6 map to Patient resource
Patient.name // Field 3
Patient.birthDate // Field 4
Patient.identifier // Field 5 (Personal ID)
Patient.address // Field 6
```

#### Encounter (for visit context)

```typescript
// Fields 8a-8d map to Encounter
Encounter.period.start // Field 8a (visit date)
Encounter.hospitalization.admitSource // Field 8b (sent to hospital)
Encounter.period.start // Field 8c (admission date, if hospitalized)
Encounter.period.end // Field 8d (discharge date)
```

#### Condition (for diagnoses)

```typescript
// Field 9 maps to Condition
Condition.code // Main diagnosis
Condition.note // Full diagnosis text
```

#### Procedure (for treatments)

```typescript
// Field 14 maps to Procedure
Procedure.code
Procedure.note // Treatment details
```

## Form Questionnaire Definition

```typescript
const form100Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'form-100',
  url: 'http://medimind.ge/questionnaires/form-100',
  name: 'Form100HealthStatusCertificate',
  title: 'ცნობა ჯანმრთელობის მდგომარეობის შესახებ',
  status: 'active',
  subjectType: ['Patient'],
  item: [
    {
      linkId: '1',
      text: 'ცნობის გამცემი დაწესებულების დასახელება...',
      type: 'text',
      required: true
    },
    {
      linkId: '2',
      text: 'დაწესებულების დასახელება, მისამართი სადაც იგზავნება ცნობა',
      type: 'group',
      item: [
        { linkId: '2a', text: 'დანიშნულებისამებრ', type: 'text' },
        { linkId: '2b', text: 'წარსადგენად', type: 'text' }
      ]
    },
    {
      linkId: '3',
      text: 'პაციენტის სახელი და გვარი',
      type: 'string',
      required: true
    },
    {
      linkId: '4',
      text: 'დაბადების თარიღი',
      type: 'date',
      required: true
    },
    {
      linkId: '5',
      text: 'პირადი ნომერი',
      type: 'string',
      required: false,
      enableWhen: [{
        question: 'age',
        operator: '>=',
        answerInteger: 16
      }]
    },
    {
      linkId: '6',
      text: 'მისამართი',
      type: 'text',
      required: true
    },
    {
      linkId: '7',
      text: 'სამუშაო ადგილი და თანამდებობა',
      type: 'text'
    },
    {
      linkId: '8',
      text: 'თარიღები',
      type: 'group',
      item: [
        { linkId: '8a', text: 'ექიმთან მიმართვის', type: 'date', required: true },
        { linkId: '8b', text: 'სტაციონარში გაგზავნის', type: 'date' },
        { linkId: '8c', text: 'სტაციონარში მოთავსების', type: 'date' },
        { linkId: '8d', text: 'განერის', type: 'date' }
      ]
    },
    {
      linkId: '9',
      text: 'დასკვნა ჯანმრთელობის მდგომარეობის შესახებ',
      type: 'text',
      required: true
    },
    {
      linkId: '10',
      text: 'გადატანილი დაავადებები',
      type: 'text'
    },
    {
      linkId: '11',
      text: 'მოკლე ანამნეზი',
      type: 'text'
    },
    {
      linkId: '12',
      text: 'ჩატარებული დიაგნოსტიკური გამოკვლევები და კონსულტაციები',
      type: 'text'
    },
    {
      linkId: '13',
      text: 'ავადმყოფობის მიმდინარეობა',
      type: 'text'
    },
    {
      linkId: '14',
      text: 'ჩატარებული მკურნალობა',
      type: 'text'
    },
    {
      linkId: '15',
      text: 'მდგომარეობა სტაციონარში მოთავსებისას',
      type: 'text'
    },
    {
      linkId: '16',
      text: 'მდგომარეობა სტაციონარიდან განერისას',
      type: 'text'
    },
    {
      linkId: '17',
      text: 'სამკურნალო და შრომითი რეკომენდაციები',
      type: 'text'
    },
    {
      linkId: '18',
      text: 'მკურნალი ექიმი (ექიმი სპეციალისტი)',
      type: 'string',
      required: true
    },
    {
      linkId: '19',
      text: 'ხელმოწერა',
      type: 'attachment',
      required: true
    },
    {
      linkId: '20',
      text: 'ცნობის გაცემის თარიღი',
      type: 'date',
      required: true
    }
  ]
};
```

## UI Implementation Notes

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ [Dropdown: ამბულატორიული ▼]     [Dropdown: 100/ა ▼]        │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                    დამტკიცებულია...                      │ │ ← Right-aligned header
│ │         სამედიცინო დოკუმენტაცია ფორმა № IV-100/ა         │ │ ← Center title
│ │                     ცნობა                                │ │
│ │        ჯანმრთელობის მდგომარეობის შესახებ                  │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ 1. [Institution info field]                              │ │
│ │ 2. [Two-column destination fields]                       │ │
│ │ 3-6. [Patient demographics]                              │ │
│ │ 7. [Work/Study info]                                     │ │
│ │ 8. [4 date fields in a row]                             │ │
│ │ 9-17. [Health/diagnosis/treatment fields]                │ │
│ │ 18-19. [Doctor info and signature]                       │ │
│ │ 20. [Issue date]                                         │ │
│ │                                          ბეჭდის ადგილი   │ │ ← Seal placement
│ └─────────────────────────────────────────────────────────┘ │
│                                    [🖨️] [download SQL]      │
└─────────────────────────────────────────────────────────────┘
```

### Styling Requirements

1. **Form Container**: Dashed border, light blue/lavender background (#e8eaf6)
2. **Header Text**: Right-aligned, font-size 10px
3. **Title**: Center-aligned, font-size 17px, bold
4. **Form Fields**: Full-width inputs with underline style
5. **Field Labels**: Georgian text, numbered
6. **Textarea Fields**: Resizable, min-height 60px
7. **Date Fields**: dd/mm/yyyy format
8. **Signature Area**: Bottom right placement
9. **Print Button**: Icon button for printing

### Validation Rules

1. **Personal ID (Field 5)**:
   - Only required for patients 16+ years old
   - Must be 11 digits
   - Luhn checksum validation

2. **Date Fields**:
   - Birth date cannot be in future
   - Issue date cannot be in future
   - Hospital discharge date must be after admission date

3. **Required Fields**:
   - Field 1 (Institution)
   - Field 3 (Patient name)
   - Field 4 (Birth date)
   - Field 8a (Visit date)
   - Field 9 (Diagnosis/conclusion)
   - Field 18 (Doctor)
   - Field 20 (Issue date)

### Print Functionality

- Form should be printable on A4 paper
- Preserve dashed border in print
- Include seal placeholder
- Print date auto-stamped
- Header includes ministry approval info

## API Endpoints (Suggested)

```typescript
// Create new Form 100
POST /api/forms/form-100
Body: Form100CreateRequest

// Get Form 100 by ID
GET /api/forms/form-100/:id

// Update Form 100
PUT /api/forms/form-100/:id
Body: Form100UpdateRequest

// Delete Form 100
DELETE /api/forms/form-100/:id

// Search Form 100
GET /api/forms/form-100?patient=:patientId&date=:date

// Print Form 100
GET /api/forms/form-100/:id/print
Response: PDF

// Export Form 100 template
GET /api/forms/form-100/template
Response: SQL/JSON
```

## Integration with Form Builder

This form can be created in our FHIR Form Builder system using:

1. **Questionnaire Resource**: Define all 20 fields as items
2. **QuestionnaireResponse**: Store filled form data
3. **DocumentReference**: Link to generated PDF
4. **Extensions**: Custom Georgian field labels and validation rules

## Screenshots Reference

Located in `.playwright-mcp/` directory:
- `form-100-full.png` - Full page screenshot
- `form-100-top.png` - Header and fields 1-6
- `form-100-fields-6-12.png` - Fields 6-12
- `form-100-fields-11-17.png` - Fields 11-17
- `form-100-fields-15-20.png` - Fields 15-20
- `form-100-fields-19-20-signature.png` - Signature and seal area
- `form-100-section2.png` - Configuration table

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-22 | Initial mapping from original EMR system |
