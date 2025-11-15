# Citizenship Display Requirements for PatientTable

## Task: T079 - Add Citizenship Display Logic to PatientTable

**Status**: Blocked - PatientTable component does not exist yet
**Prerequisites**: T029 (Create PatientTable component) must be completed first

---

## Overview

The PatientTable component should display citizenship information for each patient in the patient list. This document specifies the requirements for implementing citizenship display functionality.

## Requirements

### 1. Add Citizenship Column to Table

**Column Header**:
- Georgian (ka): "მოქალაქეობა"
- English (en): "Citizenship"
- Russian (ru): "Гражданство"

**Column Position**: After "Address" column, before "Actions" column

**Updated Column Order**:
1. № (Row Number)
2. Registration Number
3. Personal ID
4. First Name
5. Last Name
6. Birth Date
7. Gender
8. Phone
9. **Citizenship** ← NEW
10. Actions

### 2. Extract Citizenship from Patient Resource

Use the `getCitizenshipCode` helper function from `/packages/app/src/emr/services/citizenshipHelper.ts`:

```typescript
import { getCitizenshipCode, getPatientCitizenshipDisplay } from '../../services/citizenshipHelper';

// In PatientTable component
const citizenshipCode = getCitizenshipCode(patient);
const citizenshipDisplay = getPatientCitizenshipDisplay(patient, lang);
```

### 3. Display Logic

**When citizenship is set**:
- Display the translated country name based on current language
- Example: "საქართველო" (Georgian), "United States" (English), "Грузия" (Russian)

**When citizenship is not set**:
- Display empty string or "—" (em dash)
- Do NOT display "N/A" or "Unknown"

**Example Implementation**:

```typescript
// PatientTable.tsx
import { useTranslation } from '../../hooks/useTranslation';
import { getPatientCitizenshipDisplay } from '../../services/citizenshipHelper';

export function PatientTable({ patients }: PatientTableProps) {
  const { lang } = useTranslation();

  return (
    <Table>
      <thead>
        <tr>
          <th>{t('patient.table.number')}</th>
          {/* ... other headers ... */}
          <th>{t('patient.table.citizenship')}</th>
          <th>{t('patient.table.actions')}</th>
        </tr>
      </thead>
      <tbody>
        {patients.map((patient, index) => {
          const citizenshipDisplay = getPatientCitizenshipDisplay(patient, lang);

          return (
            <tr key={patient.id}>
              <td>{index + 1}</td>
              {/* ... other cells ... */}
              <td>{citizenshipDisplay || '—'}</td>
              <td>{/* Action icons */}</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
```

### 4. Translation Keys

Add these keys to translation files:

**packages/app/src/emr/translations/ka.json**:
```json
{
  "patient.table.citizenship": "მოქალაქეობა"
}
```

**packages/app/src/emr/translations/en.json**:
```json
{
  "patient.table.citizenship": "Citizenship"
}
```

**packages/app/src/emr/translations/ru.json**:
```json
{
  "patient.table.citizenship": "Гражданство"
}
```

### 5. Sorting

**Optional Enhancement**: If table supports column sorting, citizenship column should:
- Sort alphabetically by display name (not by code)
- Use locale-aware sorting (e.g., Georgian alphabetical order for ka language)

```typescript
// Example sort function
const sortByCitizenship = (a: Patient, b: Patient) => {
  const aDisplay = getPatientCitizenshipDisplay(a, lang);
  const bDisplay = getPatientCitizenshipDisplay(b, lang);
  return aDisplay.localeCompare(bDisplay, lang);
};
```

### 6. Responsive Design

**Desktop (>1200px)**:
- Full country name displayed
- No truncation

**Tablet (768px - 1200px)**:
- May truncate long names with ellipsis
- Show tooltip on hover with full name

**Mobile (<768px)**:
- Citizenship column hidden by default
- Available in expandable row details

### 7. Accessibility

**ARIA Labels**:
```tsx
<th aria-label={t('patient.table.citizenship')} scope="col">
  {t('patient.table.citizenship')}
</th>
```

**Screen Reader Support**:
- Each citizenship cell should be properly associated with its header
- Empty cells should be announced as "empty" or "not specified"

### 8. Testing Requirements

#### Unit Tests (PatientTable.test.tsx)

```typescript
describe('Citizenship Display', () => {
  it('displays Georgian citizenship in Georgian language', () => {
    // Setup patient with citizenship="GE", language="ka"
    // Verify "საქართველო" displayed
  });

  it('displays US citizenship in English language', () => {
    // Setup patient with citizenship="US", language="en"
    // Verify "United States" displayed
  });

  it('displays Russian citizenship in Russian language', () => {
    // Setup patient with citizenship="RU", language="ru"
    // Verify "Российская Федерация" displayed
  });

  it('displays em dash when citizenship not set', () => {
    // Setup patient without citizenship
    // Verify "—" displayed
  });

  it('updates citizenship display when language changes', () => {
    // Setup patient with citizenship="GE"
    // Change language from ka to en
    // Verify display changes from "საქართველო" to "Georgia"
  });
});
```

#### Integration Tests

See `/packages/app/src/emr/services/patientService.citizenship.test.ts` for comprehensive integration tests covering:
- Creating patients with citizenship
- Retrieving citizenship from Patient resources
- Updating citizenship values
- Mapping codes to display names
- All 250 countries validation

## Implementation Checklist

- [ ] PatientTable component exists (T029)
- [ ] Add citizenship column to table header
- [ ] Import citizenship helper functions
- [ ] Extract citizenship from each patient in table
- [ ] Display translated citizenship name based on language
- [ ] Handle empty citizenship gracefully
- [ ] Add translation keys to ka.json, en.json, ru.json
- [ ] Add unit tests for citizenship display
- [ ] Verify responsive design
- [ ] Verify accessibility (ARIA labels, keyboard navigation)
- [ ] Test with all 3 languages (ka, en, ru)
- [ ] Test with sample of countries from citizenship.json

## Related Files

**Helper Functions**:
- `/packages/app/src/emr/services/citizenshipHelper.ts` - Citizenship extraction and display utilities

**Data Source**:
- `/packages/app/src/emr/translations/citizenship.json` - 250 countries with translations

**Service Layer**:
- `/packages/app/src/emr/services/patientService.ts` - Patient CRUD with citizenship extensions

**Tests**:
- `/packages/app/src/emr/services/patientService.citizenship.test.ts` - Integration tests
- `/packages/app/src/emr/components/registration/PatientTable.test.tsx` - Component tests (when created)

## FHIR Extension Structure

```json
{
  "resourceType": "Patient",
  "id": "patient-123",
  "extension": [
    {
      "url": "http://medimind.ge/fhir/StructureDefinition/citizenship",
      "valueCodeableConcept": {
        "coding": [
          {
            "system": "urn:iso:std:iso:3166",
            "code": "GE"
          }
        ]
      }
    }
  ]
}
```

## Common Countries for Testing

Use these countries when testing PatientTable:

| Code | Georgian | English | Russian |
|------|----------|---------|---------|
| GE   | საქართველო | Georgia | Грузия |
| US   | ამერიკის შეერთებული შტატები | United States | Соединенные Штаты |
| RU   | რუსეთი | Russian Federation | Российская Федерация |
| GB   | გაერთიანებული სამეფო | United Kingdom | Великобритания |
| DE   | გერმანია | Germany | Германия |
| FR   | საფრანგეთი | France | Франция |
| TR   | თურქეთი | Turkey | Турция |
| AM   | სომხეთი | Armenia | Армения |
| AZ   | აზერბაიჯანი | Azerbaijan | Азербайджан |
| UA   | უკრაინა | Ukraine | Украина |

---

**Document Version**: 1.0
**Created**: 2025-11-12
**Author**: Phase 7 Implementation (User Story 5)
