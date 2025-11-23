# Form Recreation Guide

Quick guide for creating official Georgian medical forms in MediMind EMR.

## Overview

Forms are stored as FHIR Questionnaire resources. Each form has:
1. **Template file** - TypeScript definition with fields, dropdowns, labels
2. **Recreation script** - Creates/updates the form in Medplum database

## Quick Start

### Step 1: Get Your Access Token

**Note: Tokens expire after ~1 hour. Get a fresh one each time.**

**Quick Copy Method (Chrome):**
1. Open http://localhost:3000 and login
2. Press **F12** → **Application** tab → **Local Storage** → **http://localhost:3000**
3. Click `activeLogin` row
4. In the value panel, find `"accessToken":"eyJ..."`
5. Double-click the token value to select it, then **Ctrl+C**

**Console Method (faster):**
```javascript
// Paste this in browser console (F12 → Console):
copy(JSON.parse(localStorage.getItem('activeLogin')).accessToken)
// Token is now in your clipboard!
```

**Login Credentials:**
- URL: http://localhost:3000
- User: `lasha.khoshtaria@...` (your admin account)
- Server: http://localhost:8103

### Step 2: Run the Script

```bash
# Set token
export MEDPLUM_TOKEN="your-token-here"

# Run script (examples)
npx tsx scripts/recreate-form-100.ts        # Form IV-100/a (Health Certificate)
npx tsx scripts/recreate-form-200-5a.ts     # Form IV-200-5/a (Patient Examination)
```

## Creating a New Form

### 1. Map the EMR Form

Use the `emr-page-mapper` agent to extract all fields:

```bash
# Start Playwright server
npx tsx scripts/playwright/server.ts &

# Login to EMR
npx tsx scripts/playwright/cmd.ts navigate "http://178.134.21.82:8008/index.php"
npx tsx scripts/playwright/cmd.ts fill "#username" "cicig"
npx tsx scripts/playwright/cmd.ts fill "#password" "Tsotne2011"
npx tsx scripts/playwright/cmd.ts click "text=შესვლა"

# Navigate to form and take screenshot
npx tsx scripts/playwright/cmd.ts screenshot "form-name"
```

Then ask Claude to map the form using the screenshot.

### 2. Create Template File

Create `packages/app/src/emr/data/form-templates/form-XXX-template.ts`:

```typescript
import type { FormTemplate, FieldConfig, DropdownOption } from '../../types/form-builder';

export const FORM_XXX_ID = 'form-xxx-name';
export const FORM_XXX_VERSION = '1.0.0';

// Dropdown options
export const myDropdownOptions: DropdownOption[] = [
  { value: '1', label: 'ქართული', labelEn: 'Georgian' },
  { value: '2', label: 'სხვა', labelEn: 'Other' },
];

// Fields
export const formXXXFields: FieldConfig[] = [
  // Section header
  {
    id: 'section-1',
    linkId: 'header-section',
    type: 'group',
    label: 'სექციის სათაური',
    text: 'Section Title',
    order: 1,
  },
  // Text field
  {
    id: 'field-1',
    linkId: 'patient-name',
    type: 'text',
    label: 'პაციენტი',
    text: 'Patient',
    required: true,
    patientBinding: { enabled: true, bindingKey: 'fullName' },
    styling: { width: '50%' },
    order: 2,
  },
  // Dropdown
  {
    id: 'field-2',
    linkId: 'my-dropdown',
    type: 'choice',
    label: 'აირჩიეთ',
    text: 'Select',
    required: false,
    options: myDropdownOptions,
    styling: { width: '25%' },
    order: 3,
  },
  // Checkbox
  {
    id: 'field-3',
    linkId: 'my-checkbox',
    type: 'boolean',
    label: 'თანხმობა',
    text: 'Consent',
    required: false,
    order: 4,
  },
  // Textarea
  {
    id: 'field-4',
    linkId: 'notes',
    type: 'textarea',
    label: 'შენიშვნები',
    text: 'Notes',
    required: false,
    styling: { width: '100%', height: '100px' },
    order: 5,
  },
  // Date
  {
    id: 'field-5',
    linkId: 'exam-date',
    type: 'date',
    label: 'თარიღი',
    text: 'Date',
    required: false,
    styling: { width: '25%' },
    order: 6,
  },
];

export const formXXXTemplate: FormTemplate = {
  id: FORM_XXX_ID,
  title: 'ფორმის სათაური (ფორმა № XXX)',
  description: 'აღწერა ქართულად და English description.',
  status: 'active',
  version: FORM_XXX_VERSION,
  fields: formXXXFields,
  category: ['category-1', 'category-2'],
  resourceType: 'Questionnaire',
};

export default formXXXTemplate;
```

### 3. Create Recreation Script

Create `scripts/recreate-form-XXX.ts`:

```typescript
#!/usr/bin/env tsx
import { MedplumClient } from '@medplum/core';
import type { Questionnaire, QuestionnaireItem, QuestionnaireItemAnswerOption } from '@medplum/fhirtypes';
import { formXXXTemplate, FORM_XXX_ID } from '../packages/app/src/emr/data/form-templates/form-XXX-template';

const MEDPLUM_BASE_URL = 'http://localhost:8103';

async function main() {
  const token = process.argv[2] || process.env.MEDPLUM_TOKEN;
  if (!token) {
    console.error('❌ No token. Usage: npx tsx scripts/recreate-form-XXX.ts "token"');
    process.exit(1);
  }

  const medplum = new MedplumClient({ baseUrl: MEDPLUM_BASE_URL, fetch });
  medplum.setAccessToken(token);

  // Delete existing
  const existing = await medplum.searchResources('Questionnaire', { _count: '100' });
  const found = existing.find(q => q.identifier?.some(id => id.value === FORM_XXX_ID));
  if (found) {
    await medplum.deleteResource('Questionnaire', found.id!);
    console.log('Deleted existing form');
  }

  // Create new
  const questionnaire = templateToQuestionnaire(formXXXTemplate);
  const created = await medplum.createResource(questionnaire);
  console.log(`✅ Created: ${created.id}`);
}

// Copy templateToQuestionnaire and fieldToQuestionnaireItem functions
// from recreate-form-100.ts or recreate-form-200-5a.ts

main();
```

### 4. Run the Script

```bash
export MEDPLUM_TOKEN="your-token"
npx tsx scripts/recreate-form-XXX.ts
```

## Field Types Reference

| Type | FHIR Type | Description |
|------|-----------|-------------|
| `text` | string | Short text input |
| `textarea` | text | Long text input |
| `date` | date | Date picker |
| `datetime` | dateTime | Date + time picker |
| `time` | time | Time picker |
| `integer` | integer | Whole number |
| `decimal` | decimal | Decimal number |
| `boolean` | boolean | Checkbox |
| `choice` | choice | Dropdown select |
| `group` | group | Section header |
| `display` | display | Read-only text |

## Patient Data Bindings

Auto-populate fields from Patient/Encounter:

| Binding Key | Source |
|-------------|--------|
| `fullName` | Patient.name (first + last) |
| `firstName` | Patient.name.given[0] |
| `lastName` | Patient.name.family |
| `dob` | Patient.birthDate |
| `personalId` | Patient.identifier (personal-id) |
| `gender` | Patient.gender |
| `phone` | Patient.telecom (phone) |
| `address` | Patient.address.text |
| `workplace` | Patient.extension[workplace] |
| `admissionDate` | Encounter.period.start |
| `dischargeDate` | Encounter.period.end |
| `treatingPhysician` | Encounter.participant |
| `registrationNumber` | Encounter.identifier |

## Dropdown Values

EMR dropdown values are numeric codes (e.g., 914-1010). Map them like:

```typescript
export const myOptions: DropdownOption[] = [
  { value: '914', label: 'მაშინვე', labelEn: 'Immediately' },
  { value: '915', label: 'თვის შემდეგ', labelEn: 'After months' },
];
```

## Existing Forms

| Form | Template | Script |
|------|----------|--------|
| IV-100/a Health Certificate | `form-100-template.ts` | `recreate-form-100.ts` |
| IV-200-5/a Patient Examination | `form-200-5a-template.ts` | `recreate-form-200-5a.ts` |

## Troubleshooting

### FHIR Constraint que-6 Error
> "Required and repeat aren't permitted for display items"

**Fix**: Don't set `required` on `display` or `group` type fields.

### Token Expired
Get a new token from DevTools → Local Storage.

### Form Not Showing
1. Check Medplum server is running (`http://localhost:8103`)
2. Verify token is valid
3. Refresh browser after running script

---

*Created: 2025-11-23*
