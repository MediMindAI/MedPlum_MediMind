# Patient History Detail Modal - Complete Specification

**Status**: Implementation Ready
**Created**: 2025-11-16
**Feature Branch**: `001-patient-history-page`
**Related Component**: Patient History Table Row Click Handler
**FHIR Resources**: Encounter, Coverage, Patient
**Languages**: Georgian (ka), English (en), Russian (ru)

---

## Overview

The Patient History Detail Modal is a popup window that opens when clicking on a patient visit row in the Patient History table. It provides a comprehensive view of visit information with 4 main sections: Registration, Insurance (with expandable insurers), Guarantee, and Demographics (with Copy tab). This modal allows both viewing and editing patient visit information.

### Key Characteristics

- **Trigger**: Click on any patient row in the Patient History table
- **Modal Type**: Mantine Modal with size="xl" (extra large)
- **Header**: Patient name + Visit count indicator (e.g., "ვიზიტები: 0/1 (ამბულატორა)")
- **Sections**: 4 collapsible/expandable sections
- **Actions**: Save (შენახვა), Cancel (X button), Close modal
- **Read-Write**: Hybrid - some fields editable, Demographics section is READ-ONLY with Copy option

---

## Modal Structure

### Header Section

```
┌─────────────────────────────────────────────────────┐
│ [Patient Name]                        [X Close]    │
│ ვიზიტები: 0/1 (ამბულატორა)                        │
└─────────────────────────────────────────────────────┘
```

**Header Fields:**
- **Patient Name**: Full name from Patient resource (e.g., "კონსტანტინე ხაჭაკაძე")
- **Visit Counter**: Format: "ვიზიტები: {current}/{total} ({visitType})"
- **Close Button (X)**: Top-right corner

---

## Section 1: Registration (რეგისტრაცია)

This section contains core visit registration data.

### Field Inventory

| # | Field Label (Georgian) | Field ID | Type | Required | Validation | Default Value | FHIR Mapping |
|---|------------------------|----------|------|----------|------------|---------------|--------------|
| 1 | თარიღი* | `lak_regdate` | datetime-local | **Yes** | ISO 8601, not future date | Current datetime | `Encounter.period.start` |
| 2 | შემოსვლის ტიპი* | `lak_regtype` | select | **Yes** | Must select value | Empty | `Encounter.type[].coding[].code` |
| 3 | სტატუსი | `mo_stat` | select | No | Valid option from list | Empty | `Encounter.status` |
| 4 | კომენტარი | `lak_commt` | textarea | No | Max 2000 chars | Empty | `Encounter.reasonCode[].text` |
| 5 | განყოფილება* | `Ros_br` | select | **Yes** | Must select value | Empty | `Encounter.serviceProvider` |
| 6 | სტაციონარის ტიპი | `lak_ddyastac` | select | No | Valid option from list | Empty | `Encounter.class.code` |

### Dropdown Options

#### შემოსვლის ტიპი* (Admission Type) - `lak_regtype`
| Value | Georgian Label | English | Russian |
|-------|----------------|---------|---------|
| 1 | ამბულატორიული | Ambulatory | Амбулаторный |
| 2 | სტაციონარული | Inpatient | Стационарный |
| 3 | გადაუდებელი | Emergency | Экстренный |

#### სტატუსი (Status) - `mo_stat`
| Value | Georgian Label | English | Russian |
|-------|----------------|---------|---------|
| 1 | დაგეგმილი | Planned | Запланированный |
| 2 | მიღებული | Arrived | Принят |
| 3 | პროცესში | In Progress | В процессе |
| 4 | დასრულებული | Finished | Завершенный |

#### განყოფილება* (Department) - `Ros_br`
(24 options - see appendix/departments.md for full list)
| Value | Georgian Label |
|-------|----------------|
| 1 | გეგმიური ამბულატორია |
| 2 | გადაუდებელი ამბულატორია |
| 3 | ინტენსიური თერაპია |
| 4 | ქირურგია |
| 5 | თერაპია |
| ... | (19 more departments) |

#### სტაციონარის ტიპი (Hospital Type) - `lak_ddyastac`
| Value | Georgian Label | English | Russian |
|-------|----------------|---------|---------|
| 1 | ზოგადი | General | Общий |
| 2 | ინტენსიური | Intensive | Интенсивный |
| 3 | დღის | Day | Дневной |

### Registration Section Layout (Mantine)

```tsx
<Paper p="md" mb="md" style={{ backgroundColor: '#f8f9fa' }}>
  <Text fw={600} mb="sm">რეგისტრაცია</Text>
  <Stack gap="sm">
    <Group grow>
      <DateTimePicker label="თარიღი*" required />
      <Select label="შემოსვლის ტიპი*" required data={admissionTypes} />
    </Group>
    <Group grow>
      <Select label="სტატუსი" data={statusOptions} />
      <Textarea label="კომენტარი" rows={3} />
    </Group>
    <Group grow>
      <Select label="განყოფილება*" required data={departments} />
      <Select label="სტაციონარის ტიპი" data={hospitalTypes} />
    </Group>
  </Stack>
</Paper>
```

---

## Section 2: Insurance (დაზღვევა)

This section has an enable/disable checkbox and supports up to 3 insurers with "+ მეტი მზღვეველის დამატება" (Add more insurer) button.

### Section Enable Checkbox
- **Field ID**: `lak_sbool`
- **Label**: დაზღვევა (Insurance)
- **Type**: Checkbox
- **Default**: Unchecked (disabled)
- **Behavior**: When checked, enables all insurance fields below

### Primary Insurer Fields (პირველი მზღვეველი)

| # | Field Label (Georgian) | Field ID | Type | Required | Validation | FHIR Mapping |
|---|------------------------|----------|------|----------|------------|--------------|
| 1 | კომპანია | `lak_comp` | select | No | Valid insurance ID | `Coverage.payor[].reference` |
| 2 | ტიპი | `lak_instp` | select | No | Valid type ID | `Coverage.type.coding[].code` |
| 3 | პოლისის # | `lak_polnmb` | text | No | Alphanumeric | `Coverage.subscriberId` |
| 4 | მიმართვის # | `lak_vano` | text | No | Alphanumeric | `Coverage.extension[url=referral-number].valueString` |
| 5 | გაცემის თარიღი | `lak_deldat` | date | No | Valid date, not future | `Coverage.period.start` |
| 6 | მოქმედების ვადა | `lak_valdat` | date | No | >= issue date | `Coverage.period.end` |
| 7 | თანაგადახდის % | `lak_insprsnt` | number | No | 0-100, numeric | `Coverage.costToBeneficiary[].value.value` |

### Secondary Insurer Fields (Set 1)

Same fields as primary but with "1" suffix:
- `lak_comp1`, `lak_instp1`, `lak_polnmb1`, `lak_vano1`, `lak_deldat1`, `lak_valdat1`, `lak_insprsnt1`

### Tertiary Insurer Fields (Set 2)

Same fields as primary but with "2" suffix:
- `lak_comp2`, `lak_instp2`, `lak_polnmb2`, `lak_vano2`, `lak_deldat2`, `lak_valdat2`, `lak_insprsnt2`

### Insurance Company Options (კომპანია)

(58 total options - showing top 20)

| Value | Georgian Label | English | Type |
|-------|----------------|---------|------|
| 0 | შიდა | Internal/Private pay | Internal |
| 1 | სსიპ ჯანმრთელობის ეროვნული სააგენტო | National Health Agency | Government |
| 2 | ალდაგი | Aldagi Insurance | Private |
| 3 | GPI ჰოლდინგი | GPI Holding | Private |
| 4 | არდი | Ardi Insurance | Private |
| 5 | ბაზისბანკი დაზღვევა | Basisbank Insurance | Private |
| 6 | გალფ ინშურანს | Gulf Insurance | Private |
| 7 | ჯი პი აი ჰოლდინგი | GPI Holding | Private |
| 8 | ალფა | Alpha Insurance | Private |
| 9 | თიბისი დაზღვევა | TBC Insurance | Private |
| 10 | იმედი L | Imedi L | Private |
| ... | (48 more companies) | | |

### Insurance Type Options (ტიპი)

(49 total types - showing key ones)

| Value | Georgian Label | English | Program Code |
|-------|----------------|---------|--------------|
| 0 | სტანდარტული | Standard | Default |
| 36 | საყოველთაო ჯანდაცვა | Universal Healthcare | UHC |
| 165 | ვეტერანთა პროგრამა | Veterans Program | VET |
| 218 | მძიმე დაავადებები | Severe Diseases | SD |
| 219 | ონკოლოგია | Oncology | ONC |
| ... | (44 more types) | | |

### Insurance Section Layout

```tsx
<Paper p="md" mb="md" style={{ backgroundColor: '#f8f9fa' }}>
  <Group position="apart">
    <Checkbox label="დაზღვევა" {...form.getInputProps('insuranceEnabled', { type: 'checkbox' })} />
  </Group>

  {insuranceEnabled && (
    <>
      <Text fw={600} mt="sm">პირველი მზღვეველი</Text>
      <Stack gap="sm">
        <Select label="კომპანია" data={insuranceCompanies} />
        <Group grow>
          <Select label="ტიპი" data={insuranceTypes} />
          <TextInput label="პოლისის #" />
        </Group>
        <Group grow>
          <TextInput label="მიმართვის #" />
          <NumberInput label="თანაგადახდის %" min={0} max={100} />
        </Group>
        <Group grow>
          <DateInput label="გაცემის თარიღი" />
          <DateInput label="მოქმედების ვადა" />
        </Group>
      </Stack>

      <Button variant="subtle" mt="md" leftIcon={<IconPlus />}>
        + მეტი მზღვეველის დამატება
      </Button>
    </>
  )}
</Paper>
```

---

## Section 3: Guarantee (საგარანტიო)

This section stores guarantor information for visits that require financial guarantees.

### Field Inventory

| # | Field Label (Georgian) | Field ID | Type | Required | Validation | FHIR Mapping |
|---|------------------------|----------|------|----------|------------|--------------|
| 1 | საგარანტიო წერილი | `guarantee_text` | textarea | No | Max 4000 chars | `Encounter.extension[url=guarantee].valueString` |

### Guarantee Section Layout

```tsx
<Paper p="md" mb="md" style={{ backgroundColor: '#f8f9fa' }}>
  <Text fw={600} mb="sm">საგარანტიო</Text>
  <Textarea
    placeholder="საგარანტიო ინფორმაცია..."
    rows={4}
    {...form.getInputProps('guaranteeText')}
  />
  <Button variant="subtle" size="xs" mt="sm" leftIcon={<IconPlus />}>
    დამატება
  </Button>
</Paper>
```

---

## Section 4: Demographics (დემოგრაფია)

This section displays patient demographic information. **CRITICAL: These fields are READ-ONLY** but include a "კოპირება" (Copy) tab feature to copy data from patient record.

### Tab Structure

```
┌─────────────────────────────────────────────┐
│ [დემოგრაფია] [კოპირება]                    │
└─────────────────────────────────────────────┘
```

### Demographics Tab Fields (All READ-ONLY)

| # | Field Label (Georgian) | Field ID | Type | Editable | Source | FHIR Mapping |
|---|------------------------|----------|------|----------|--------|--------------|
| 1 | რეგიონი | `mo_regions` | select (disabled) | **No** | Patient | `Patient.address[].state` |
| 2 | რაიონი | `mo_raions` | select (disabled) | **No** | Patient | `Patient.address[].district` |
| 3 | ქალაქი | `mo_city` | text (disabled) | **No** | Patient | `Patient.address[].city` |
| 4 | ფაქტიური მისამართი | `mo_otheraddress` | text (disabled) | **No** | Patient | `Patient.address[].line[]` |
| 5 | განათლება | `mo_ganatleba` | select (disabled) | **No** | Patient | `Patient.extension[url=education].valueCodeableConcept` |
| 6 | ოჯახური მდგომარეობა | `no_ojaxi` | select (disabled) | **No** | Patient | `Patient.maritalStatus` |
| 7 | დასაქმება | `no_dasaqmeba` | select (disabled) | **No** | Patient | `Patient.extension[url=employment].valueCodeableConcept` |

### Dropdown Options (READ-ONLY Display)

#### რეგიონი (Region) - `mo_regions`
(14 options - Georgian regions)
| Value | Georgian Label | English |
|-------|----------------|---------|
| 1 | თბილისი | Tbilisi |
| 2 | აჭარა | Adjara |
| 3 | გურია | Guria |
| 4 | იმერეთი | Imereti |
| 5 | კახეთი | Kakheti |
| 6 | მცხეთა-მთიანეთი | Mtskheta-Mtianeti |
| 7 | რაჭა-ლეჩხუმი | Racha-Lechkhumi |
| 8 | სამეგრელო-ზემო სვანეთი | Samegrelo-Zemo Svaneti |
| 9 | სამცხე-ჯავახეთი | Samtskhe-Javakheti |
| 10 | ქვემო ქართლი | Kvemo Kartli |
| 11 | შიდა ქართლი | Shida Kartli |
| 12 | აფხაზეთი | Abkhazia |
| 13 | სამხრეთ ოსეთი | South Ossetia |
| 14 | საზღვარგარეთ | Abroad |

#### რაიონი (District) - `mo_raions`
(94 options - cascading based on region selection)
- Tbilisi: Vake, Saburtalo, Isani, etc.
- Adjara: Batumi, Kobuleti, Khelvachauri, etc.
- (Full list in appendix/districts.md)

#### განათლება (Education) - `mo_ganatleba`
| Value | Georgian Label | English | Russian |
|-------|----------------|---------|---------|
| 1 | დაწყებითი | Primary | Начальное |
| 2 | არასრული საშუალო | Incomplete Secondary | Неполное среднее |
| 3 | საშუალო | Secondary | Среднее |
| 4 | პროფესიული | Vocational | Профессиональное |
| 5 | არასრული უმაღლესი | Incomplete Higher | Неполное высшее |
| 6 | უმაღლესი | Higher | Высшее |
| 7 | სამეცნიერო ხარისხი | Academic Degree | Научная степень |

#### ოჯახური მდგომარეობა (Family Status) - `no_ojaxi`
| Value | Georgian Label | English | Russian |
|-------|----------------|---------|---------|
| 1 | დასაოჯახებელი | Single | Холост/Незамужняя |
| 2 | დაოჯახებული | Married | Женат/Замужем |
| 3 | განქორწინებული | Divorced | Разведен(а) |
| 4 | ქვრივი | Widowed | Вдовец/Вдова |
| 5 | ცალკე მცხოვრები | Separated | Разведен(а) |
| 6 | უცნობი | Unknown | Неизвестно |

#### დასაქმება (Employment) - `no_dasaqmeba`
| Value | Georgian Label | English | Russian |
|-------|----------------|---------|---------|
| 1 | დასაქმებული | Employed | Занят |
| 2 | უმუშევარი | Unemployed | Безработный |
| 3 | პენსიონერი | Pensioner | Пенсионер |
| 4 | შშმ პირი | Person with Disability | Инвалид |
| 5 | სტუდენტი | Student | Студент |
| 6 | მოსწავლე | Pupil | Ученик |
| 7 | დიასახლისი | Homemaker | Домохозяйка |
| 8 | თვითდასაქმებული | Self-employed | Самозанятый |
| 9 | სხვა | Other | Другое |

### Copy Tab (კოპირება) Functionality

The "კოპირება" (Copy) tab allows copying demographic data from the patient's current record to pre-fill the demographics section. This is useful when:
- Patient moved to new address
- Patient updated education/employment status
- Demographics need syncing with master patient record

**Copy Tab Implementation:**
```tsx
<Tabs defaultValue="demographics">
  <Tabs.List>
    <Tabs.Tab value="demographics">დემოგრაფია</Tabs.Tab>
    <Tabs.Tab value="copy">კოპირება</Tabs.Tab>
  </Tabs.List>

  <Tabs.Panel value="demographics">
    {/* READ-ONLY demographics fields */}
  </Tabs.Panel>

  <Tabs.Panel value="copy">
    <Button onClick={copyFromPatientRecord}>
      კოპირება პაციენტის ბარათიდან
    </Button>
  </Tabs.Panel>
</Tabs>
```

---

## Complete Form State Interface

```typescript
interface PatientHistoryDetailFormValues {
  // Modal Header
  patientName: string;
  visitCount: string; // "0/1 (ამბულატორა)"

  // Registration Section
  visitDate: Date;
  admissionType: string;
  status: string;
  comment: string;
  department: string;
  hospitalType: string;

  // Insurance Section
  insuranceEnabled: boolean;

  // Primary Insurance
  insuranceCompany: string;
  insuranceType: string;
  policyNumber: string;
  referralNumber: string;
  issueDate: Date | null;
  expirationDate: Date | null;
  copayPercent: number;

  // Secondary Insurance
  insuranceCompany2: string;
  insuranceType2: string;
  policyNumber2: string;
  referralNumber2: string;
  issueDate2: Date | null;
  expirationDate2: Date | null;
  copayPercent2: number;

  // Tertiary Insurance
  insuranceCompany3: string;
  insuranceType3: string;
  policyNumber3: string;
  referralNumber3: string;
  issueDate3: Date | null;
  expirationDate3: Date | null;
  copayPercent3: number;

  // Guarantee Section
  guaranteeText: string;

  // Demographics Section (READ-ONLY)
  region: string;
  district: string;
  city: string;
  actualAddress: string;
  education: string;
  familyStatus: string;
  employment: string;
}
```

---

## Component Hierarchy

```
PatientHistoryDetailModal (main modal)
├── ModalHeader
│   ├── PatientName (Text)
│   ├── VisitCounter (Badge)
│   └── CloseButton (ActionIcon)
├── ModalBody
│   ├── RegistrationSection (Paper)
│   │   ├── DateTimePicker (visitDate)
│   │   ├── Select (admissionType)
│   │   ├── Select (status)
│   │   ├── Textarea (comment)
│   │   ├── Select (department)
│   │   └── Select (hospitalType)
│   ├── InsuranceSection (Paper)
│   │   ├── Checkbox (insuranceEnabled)
│   │   ├── PrimaryInsurerForm
│   │   │   ├── InsuranceSelect (company)
│   │   │   ├── Select (type)
│   │   │   ├── TextInput (policyNumber)
│   │   │   ├── TextInput (referralNumber)
│   │   │   ├── DateInput (issueDate)
│   │   │   ├── DateInput (expirationDate)
│   │   │   └── NumberInput (copayPercent)
│   │   ├── SecondaryInsurerForm (conditionally rendered)
│   │   ├── TertiaryInsurerForm (conditionally rendered)
│   │   └── AddInsurerButton
│   ├── GuaranteeSection (Paper)
│   │   ├── Textarea (guaranteeText)
│   │   └── AddButton
│   └── DemographicsSection (Paper with Tabs)
│       ├── DemographicsTab
│       │   ├── Select (region) [disabled]
│       │   ├── Select (district) [disabled]
│       │   ├── TextInput (city) [disabled]
│       │   ├── TextInput (actualAddress) [disabled]
│       │   ├── Select (education) [disabled]
│       │   ├── Select (familyStatus) [disabled]
│       │   └── Select (employment) [disabled]
│       └── CopyTab
│           └── CopyButton
└── ModalFooter
    ├── CancelButton (optional)
    └── SaveButton
```

---

## State Management

### Hook: `usePatientHistoryDetail`

```typescript
import { useForm } from '@mantine/form';
import { useMedplum } from '@medplum/react-hooks';
import { useState, useEffect } from 'react';

interface UsePatientHistoryDetailReturn {
  form: UseFormReturnType<PatientHistoryDetailFormValues>;
  loading: boolean;
  initialLoading: boolean;
  handleSave: (values: PatientHistoryDetailFormValues) => Promise<void>;
  handleCancel: () => void;
  addInsurer: () => void;
  insurerCount: number;
  copyDemographicsFromPatient: () => void;
}

export function usePatientHistoryDetail(
  visitId: string | null,
  patientId: string,
  onSuccess: () => void,
  onClose: () => void
): UsePatientHistoryDetailReturn {
  const medplum = useMedplum();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [insurerCount, setInsurerCount] = useState(1);

  const form = useForm<PatientHistoryDetailFormValues>({
    initialValues: {
      patientName: '',
      visitCount: '0/1 (ამბულატორა)',
      visitDate: new Date(),
      admissionType: '',
      status: '',
      comment: '',
      department: '',
      hospitalType: '',
      insuranceEnabled: false,
      insuranceCompany: '',
      insuranceType: '',
      policyNumber: '',
      referralNumber: '',
      issueDate: null,
      expirationDate: null,
      copayPercent: 0,
      insuranceCompany2: '',
      insuranceType2: '',
      policyNumber2: '',
      referralNumber2: '',
      issueDate2: null,
      expirationDate2: null,
      copayPercent2: 0,
      insuranceCompany3: '',
      insuranceType3: '',
      policyNumber3: '',
      referralNumber3: '',
      issueDate3: null,
      expirationDate3: null,
      copayPercent3: 0,
      guaranteeText: '',
      region: '',
      district: '',
      city: '',
      actualAddress: '',
      education: '',
      familyStatus: '',
      employment: '',
    },
    validate: {
      visitDate: (value) => (!value ? 'თარიღი სავალდებულოა' : null),
      admissionType: (value) => (!value ? 'შემოსვლის ტიპი სავალდებულოა' : null),
      department: (value) => (!value ? 'განყოფილება სავალდებულოა' : null),
      copayPercent: (value) => (value < 0 || value > 100 ? 'უნდა იყოს 0-100' : null),
      copayPercent2: (value) => (value < 0 || value > 100 ? 'უნდა იყოს 0-100' : null),
      copayPercent3: (value) => (value < 0 || value > 100 ? 'უნდა იყოს 0-100' : null),
    },
  });

  useEffect(() => {
    // Load visit and patient data
    async function loadData() {
      if (!visitId || !patientId) return;
      setInitialLoading(true);

      try {
        // Fetch Encounter
        const encounter = await medplum.readResource('Encounter', visitId);

        // Fetch Patient
        const patient = await medplum.readResource('Patient', patientId);

        // Fetch Coverage resources
        const coverages = await medplum.searchResources('Coverage', {
          beneficiary: `Patient/${patientId}`,
        });

        // Map to form values
        form.setValues({
          patientName: `${patient.name?.[0]?.given?.[0] || ''} ${patient.name?.[0]?.family || ''}`,
          // ... map all fields from FHIR resources
        });
      } catch (error) {
        console.error('Failed to load visit data:', error);
      } finally {
        setInitialLoading(false);
      }
    }

    loadData();
  }, [visitId, patientId]);

  const handleSave = async (values: PatientHistoryDetailFormValues) => {
    setLoading(true);
    try {
      // Update Encounter resource
      // Update Coverage resources (1-3)
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setLoading(false);
    }
  };

  const addInsurer = () => {
    if (insurerCount < 3) {
      setInsurerCount(insurerCount + 1);
    }
  };

  const copyDemographicsFromPatient = async () => {
    // Copy demographics from Patient resource to form
    // This syncs the visit demographics with patient master record
  };

  return {
    form,
    loading,
    initialLoading,
    handleSave,
    handleCancel: onClose,
    addInsurer,
    insurerCount,
    copyDemographicsFromPatient,
  };
}
```

---

## FHIR Resource Mappings

### Encounter Resource (Visit)

```json
{
  "resourceType": "Encounter",
  "id": "visit-123",
  "status": "finished",
  "class": {
    "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
    "code": "AMB",
    "display": "ambulatory"
  },
  "type": [
    {
      "coding": [
        {
          "system": "http://medimind.ge/CodeSystem/admission-type",
          "code": "1",
          "display": "ამბულატორიული"
        }
      ]
    }
  ],
  "subject": {
    "reference": "Patient/pat-456"
  },
  "serviceProvider": {
    "reference": "Organization/dept-789",
    "display": "გეგმიური ამბულატორია"
  },
  "period": {
    "start": "2025-11-16T12:43:00+04:00"
  },
  "reasonCode": [
    {
      "text": "კომენტარი/შენიშვნა"
    }
  ],
  "extension": [
    {
      "url": "http://medimind.ge/StructureDefinition/guarantee-letter",
      "valueString": "საგარანტიო ტექსტი..."
    }
  ]
}
```

### Coverage Resource (Insurance)

```json
{
  "resourceType": "Coverage",
  "id": "cov-001",
  "status": "active",
  "beneficiary": {
    "reference": "Patient/pat-456"
  },
  "payor": [
    {
      "reference": "Organization/ins-company-001",
      "display": "ალდაგი"
    }
  ],
  "type": {
    "coding": [
      {
        "system": "http://medimind.ge/CodeSystem/insurance-type",
        "code": "36",
        "display": "საყოველთაო ჯანდაცვა"
      }
    ]
  },
  "subscriberId": "POL-123456",
  "period": {
    "start": "2025-01-01",
    "end": "2025-12-31"
  },
  "costToBeneficiary": [
    {
      "type": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/coverage-copay-type",
            "code": "copaypct"
          }
        ]
      },
      "value": {
        "value": 20,
        "unit": "%"
      }
    }
  ],
  "order": 1,
  "extension": [
    {
      "url": "http://medimind.ge/StructureDefinition/referral-number",
      "valueString": "REF-789"
    }
  ]
}
```

### Patient Resource (Demographics - READ-ONLY)

```json
{
  "resourceType": "Patient",
  "id": "pat-456",
  "identifier": [
    {
      "system": "http://medimind.ge/identifiers/personal-id",
      "value": "51001028318"
    }
  ],
  "name": [
    {
      "given": ["კონსტანტინე"],
      "family": "ხაჭაკაძე"
    }
  ],
  "address": [
    {
      "state": "თბილისი",
      "district": "ვაკე",
      "city": "თბილისი",
      "line": ["რუსთაველის გამზ. 10"]
    }
  ],
  "maritalStatus": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus",
        "code": "M",
        "display": "Married"
      }
    ]
  },
  "extension": [
    {
      "url": "http://medimind.ge/StructureDefinition/education",
      "valueCodeableConcept": {
        "coding": [
          {
            "system": "http://medimind.ge/CodeSystem/education-level",
            "code": "6",
            "display": "უმაღლესი"
          }
        ]
      }
    },
    {
      "url": "http://medimind.ge/StructureDefinition/employment",
      "valueCodeableConcept": {
        "coding": [
          {
            "system": "http://medimind.ge/CodeSystem/employment-status",
            "code": "1",
            "display": "დასაქმებული"
          }
        ]
      }
    }
  ]
}
```

---

## Translations (i18n)

### Georgian (ka.json)

```json
{
  "patientHistory.detail.title": "პაციენტის ვიზიტის დეტალები",
  "patientHistory.detail.visits": "ვიზიტები",
  "patientHistory.detail.ambulatory": "ამბულატორია",
  "patientHistory.detail.stationary": "სტაციონარი",
  "patientHistory.detail.emergency": "გადაუდებელი",

  "patientHistory.detail.registration": "რეგისტრაცია",
  "patientHistory.detail.date": "თარიღი",
  "patientHistory.detail.admissionType": "შემოსვლის ტიპი",
  "patientHistory.detail.status": "სტატუსი",
  "patientHistory.detail.comment": "კომენტარი",
  "patientHistory.detail.department": "განყოფილება",
  "patientHistory.detail.hospitalType": "სტაციონარის ტიპი",

  "patientHistory.detail.insurance": "დაზღვევა",
  "patientHistory.detail.primaryInsurer": "პირველი მზღვეველი",
  "patientHistory.detail.company": "კომპანია",
  "patientHistory.detail.type": "ტიპი",
  "patientHistory.detail.policyNumber": "პოლისის #",
  "patientHistory.detail.referralNumber": "მიმართვის #",
  "patientHistory.detail.issueDate": "გაცემის თარიღი",
  "patientHistory.detail.expirationDate": "მოქმედების ვადა",
  "patientHistory.detail.copayPercent": "თანაგადახდის %",
  "patientHistory.detail.addInsurer": "+ მეტი მზღვეველის დამატება",

  "patientHistory.detail.guarantee": "საგარანტიო",
  "patientHistory.detail.addGuarantee": "დამატება",

  "patientHistory.detail.demographics": "დემოგრაფია",
  "patientHistory.detail.copy": "კოპირება",
  "patientHistory.detail.copyFromPatient": "კოპირება პაციენტის ბარათიდან",
  "patientHistory.detail.region": "რეგიონი",
  "patientHistory.detail.district": "რაიონი",
  "patientHistory.detail.city": "ქალაქი",
  "patientHistory.detail.actualAddress": "ფაქტიური მისამართი",
  "patientHistory.detail.education": "განათლება",
  "patientHistory.detail.familyStatus": "ოჯახური მდგომარეობა",
  "patientHistory.detail.employment": "დასაქმება",

  "patientHistory.detail.save": "შენახვა",
  "patientHistory.detail.cancel": "გაუქმება",
  "patientHistory.detail.close": "დახურვა",

  "patientHistory.detail.validation.dateRequired": "თარიღი სავალდებულოა",
  "patientHistory.detail.validation.admissionTypeRequired": "შემოსვლის ტიპი სავალდებულოა",
  "patientHistory.detail.validation.departmentRequired": "განყოფილება სავალდებულოა",
  "patientHistory.detail.validation.copayRange": "თანაგადახდა უნდა იყოს 0-100 შორის",

  "patientHistory.detail.success": "ვიზიტი წარმატებით განახლდა",
  "patientHistory.detail.error": "ვიზიტის განახლება ვერ მოხერხდა"
}
```

### English (en.json)

```json
{
  "patientHistory.detail.title": "Patient Visit Details",
  "patientHistory.detail.visits": "Visits",
  "patientHistory.detail.ambulatory": "Ambulatory",
  "patientHistory.detail.stationary": "Inpatient",
  "patientHistory.detail.emergency": "Emergency",

  "patientHistory.detail.registration": "Registration",
  "patientHistory.detail.date": "Date",
  "patientHistory.detail.admissionType": "Admission Type",
  "patientHistory.detail.status": "Status",
  "patientHistory.detail.comment": "Comment",
  "patientHistory.detail.department": "Department",
  "patientHistory.detail.hospitalType": "Hospital Type",

  "patientHistory.detail.insurance": "Insurance",
  "patientHistory.detail.primaryInsurer": "Primary Insurer",
  "patientHistory.detail.company": "Company",
  "patientHistory.detail.type": "Type",
  "patientHistory.detail.policyNumber": "Policy #",
  "patientHistory.detail.referralNumber": "Referral #",
  "patientHistory.detail.issueDate": "Issue Date",
  "patientHistory.detail.expirationDate": "Expiration Date",
  "patientHistory.detail.copayPercent": "Copay %",
  "patientHistory.detail.addInsurer": "+ Add More Insurer",

  "patientHistory.detail.guarantee": "Guarantee",
  "patientHistory.detail.addGuarantee": "Add",

  "patientHistory.detail.demographics": "Demographics",
  "patientHistory.detail.copy": "Copy",
  "patientHistory.detail.copyFromPatient": "Copy from Patient Record",
  "patientHistory.detail.region": "Region",
  "patientHistory.detail.district": "District",
  "patientHistory.detail.city": "City",
  "patientHistory.detail.actualAddress": "Actual Address",
  "patientHistory.detail.education": "Education",
  "patientHistory.detail.familyStatus": "Family Status",
  "patientHistory.detail.employment": "Employment",

  "patientHistory.detail.save": "Save",
  "patientHistory.detail.cancel": "Cancel",
  "patientHistory.detail.close": "Close",

  "patientHistory.detail.validation.dateRequired": "Date is required",
  "patientHistory.detail.validation.admissionTypeRequired": "Admission type is required",
  "patientHistory.detail.validation.departmentRequired": "Department is required",
  "patientHistory.detail.validation.copayRange": "Copay must be between 0-100",

  "patientHistory.detail.success": "Visit updated successfully",
  "patientHistory.detail.error": "Failed to update visit"
}
```

### Russian (ru.json)

```json
{
  "patientHistory.detail.title": "Детали визита пациента",
  "patientHistory.detail.visits": "Визиты",
  "patientHistory.detail.ambulatory": "Амбулаторный",
  "patientHistory.detail.stationary": "Стационарный",
  "patientHistory.detail.emergency": "Экстренный",

  "patientHistory.detail.registration": "Регистрация",
  "patientHistory.detail.date": "Дата",
  "patientHistory.detail.admissionType": "Тип приема",
  "patientHistory.detail.status": "Статус",
  "patientHistory.detail.comment": "Комментарий",
  "patientHistory.detail.department": "Отделение",
  "patientHistory.detail.hospitalType": "Тип стационара",

  "patientHistory.detail.insurance": "Страхование",
  "patientHistory.detail.primaryInsurer": "Основной страховщик",
  "patientHistory.detail.company": "Компания",
  "patientHistory.detail.type": "Тип",
  "patientHistory.detail.policyNumber": "№ полиса",
  "patientHistory.detail.referralNumber": "№ направления",
  "patientHistory.detail.issueDate": "Дата выдачи",
  "patientHistory.detail.expirationDate": "Срок действия",
  "patientHistory.detail.copayPercent": "% сооплаты",
  "patientHistory.detail.addInsurer": "+ Добавить страховщика",

  "patientHistory.detail.guarantee": "Гарантия",
  "patientHistory.detail.addGuarantee": "Добавить",

  "patientHistory.detail.demographics": "Демография",
  "patientHistory.detail.copy": "Копировать",
  "patientHistory.detail.copyFromPatient": "Копировать из карты пациента",
  "patientHistory.detail.region": "Регион",
  "patientHistory.detail.district": "Район",
  "patientHistory.detail.city": "Город",
  "patientHistory.detail.actualAddress": "Фактический адрес",
  "patientHistory.detail.education": "Образование",
  "patientHistory.detail.familyStatus": "Семейное положение",
  "patientHistory.detail.employment": "Занятость",

  "patientHistory.detail.save": "Сохранить",
  "patientHistory.detail.cancel": "Отмена",
  "patientHistory.detail.close": "Закрыть",

  "patientHistory.detail.validation.dateRequired": "Дата обязательна",
  "patientHistory.detail.validation.admissionTypeRequired": "Тип приема обязателен",
  "patientHistory.detail.validation.departmentRequired": "Отделение обязательно",
  "patientHistory.detail.validation.copayRange": "Сооплата должна быть от 0 до 100",

  "patientHistory.detail.success": "Визит успешно обновлен",
  "patientHistory.detail.error": "Не удалось обновить визит"
}
```

---

## Implementation Notes

### Differences from VisitEditModal

The existing `VisitEditModal.tsx` component focuses on editing visit data but has a different structure. This Patient History Detail Modal:

1. **Opens on row click** (not edit icon click)
2. **Has 4 distinct sections** vs. 3 in VisitEditModal
3. **Includes Guarantee section** (not present in VisitEditModal)
4. **Demographics with Copy tab** (READ-ONLY with sync capability)
5. **Dynamic insurer count** (1-3 with "Add" button)
6. **Header shows visit statistics** ("ვიზიტები: 0/1")

### Recommended Implementation Approach

1. **Create new component**: `PatientHistoryDetailModal.tsx`
2. **Create hook**: `usePatientHistoryDetail.ts`
3. **Add translations**: Update ka.json, en.json, ru.json
4. **Integrate with table**: Add row click handler in `PatientHistoryTable.tsx`
5. **Test thoroughly**: Test all 3 languages, insurance add/remove, demographics copy

### Key Testing Scenarios

1. Open modal by clicking on patient row
2. Verify patient name displays in header
3. Verify all 4 sections render correctly
4. Test adding 2nd and 3rd insurers
5. Test insurance checkbox enable/disable
6. Verify demographics fields are READ-ONLY
7. Test Copy tab functionality
8. Test form validation on save
9. Test successful save updates table
10. Test cancel/close without saving

---

## Files to Create/Update

### New Files
1. `/packages/app/src/emr/components/patient-history/PatientHistoryDetailModal.tsx`
2. `/packages/app/src/emr/components/patient-history/PatientHistoryDetailModal.test.tsx`
3. `/packages/app/src/emr/hooks/usePatientHistoryDetail.ts`
4. `/packages/app/src/emr/hooks/usePatientHistoryDetail.test.tsx`

### Files to Update
1. `/packages/app/src/emr/translations/ka.json` - Add detail modal translations
2. `/packages/app/src/emr/translations/en.json` - Add detail modal translations
3. `/packages/app/src/emr/translations/ru.json` - Add detail modal translations
4. `/packages/app/src/emr/components/patient-history/PatientHistoryTable.tsx` - Add row click handler
5. `/packages/app/src/emr/views/patient-history/PatientHistoryView.tsx` - Integrate modal state

---

## Success Criteria

- [ ] Modal opens when clicking on patient row in history table
- [ ] Patient name and visit count display in header
- [ ] All 4 sections render with correct fields
- [ ] Registration section has 6 fields with proper validation
- [ ] Insurance section has checkbox toggle and 3 insurer support
- [ ] Guarantee section has textarea with add button
- [ ] Demographics section has 7 READ-ONLY fields with Copy tab
- [ ] Save button updates Encounter and Coverage resources
- [ ] Table refreshes after successful save
- [ ] All translations work (Georgian, English, Russian)
- [ ] Form validation prevents invalid submissions
- [ ] Loading states show during data fetch and save

---

**Document Version**: 1.0
**Author**: EMR Documentation Specialist
**Created**: 2025-11-16
**Last Updated**: 2025-11-16
