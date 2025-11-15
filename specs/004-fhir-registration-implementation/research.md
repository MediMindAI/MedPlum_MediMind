# Research: FHIR-Based Patient Registration System

**Feature**: 004-fhir-registration-implementation
**Date**: 2025-11-12
**Purpose**: Resolve technical decisions and document best practices for implementing patient registration with FHIR resources

---

## Executive Summary

This research document addresses key technical decisions for implementing a patient registration system that bridges legacy Georgian hospital EMR data structures to FHIR R4 resources within the Medplum platform. The system must support multilingual operations (Georgian/English/Russian), handle 250 country citizenships, manage representative relationships, and provide duplicate detection while maintaining HIPAA compliance.

---

## 1. FHIR Resource Mapping Strategy

### Decision: Use FHIR Patient and RelatedPerson Resources with Extensions

**Rationale**:
- **FHIR Patient Resource** naturally maps to legacy patient demographics with built-in support for identifiers, names, contact information, and demographics
- **FHIR RelatedPerson Resource** provides standard structure for representative/guardian relationships with proper linkage to Patient resources
- **FHIR Extensions** allow storing Georgian-specific data (personal ID validation, patronymic) without breaking FHIR conformance

**Implementation Pattern**:
```typescript
// Patient resource mapping
const patient: Patient = {
  resourceType: 'Patient',
  identifier: [
    {
      system: 'http://medimind.ge/identifiers/personal-id',
      value: '26001014632', // Georgian national ID (პირადი ნომერი)
      use: 'official'
    },
    {
      system: 'http://medimind.ge/identifiers/registration-number',
      value: '98960', // Hospital registration number (რიგითი ნომერი)
      use: 'secondary'
    }
  ],
  name: [
    {
      use: 'official',
      family: 'ხოზვრია', // Last name (გვარი)
      given: ['თენგიზი'], // First name (სახელი)
      extension: [
        {
          url: 'http://medimind.ge/fhir/StructureDefinition/patronymic',
          valueString: 'მამის სახელი' // Father's name
        }
      ]
    }
  ],
  gender: 'male', // მამრობითი
  birthDate: '1986-01-26',
  telecom: [
    {
      system: 'phone',
      value: '+995500050610',
      use: 'mobile'
    },
    {
      system: 'email',
      value: 'patient@example.com',
      use: 'work'
    }
  ],
  address: [
    {
      use: 'home',
      type: 'physical',
      text: 'საქართველო, თბილისი, დიდობა', // Legal address (იურიდიული მისამართი)
      city: 'თბილისი',
      country: 'GE'
    }
  ],
  extension: [
    {
      url: 'http://medimind.ge/fhir/StructureDefinition/citizenship',
      valueCodeableConcept: {
        coding: [
          {
            system: 'urn:iso:std:iso:3166',
            code: 'GE',
            display: 'საქართველო' // Georgia
          }
        ]
      }
    },
    {
      url: 'http://medimind.ge/fhir/StructureDefinition/workplace',
      valueString: 'სამუშაო ადგილი'
    }
  ]
};

// RelatedPerson resource mapping for representatives
const representative: RelatedPerson = {
  resourceType: 'RelatedPerson',
  patient: {
    reference: 'Patient/[patient-id]'
  },
  relationship: [
    {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
          code: 'MTH', // Mother (დედა)
          display: 'mother'
        }
      ]
    }
  ],
  name: [
    {
      use: 'official',
      family: 'გვარი',
      given: ['სახელი']
    }
  ],
  identifier: [
    {
      system: 'http://medimind.ge/identifiers/personal-id',
      value: '12345678901'
    }
  ],
  birthDate: '1965-05-15',
  gender: 'female',
  telecom: [
    {
      system: 'phone',
      value: '+995555123456'
    }
  ],
  address: [
    {
      use: 'home',
      text: 'მისამართი'
    }
  ]
};
```

**Alternatives Considered**:
1. **Custom Resources**: Rejected because it breaks FHIR interoperability and requires custom validators
2. **Contained Resources**: Rejected because representatives need independent lifecycle management
3. **Patient.contact**: Considered but RelatedPerson provides richer relationship modeling and independent searchability

**References**:
- [FHIR Patient Resource](https://hl7.org/fhir/R4/patient.html)
- [FHIR RelatedPerson Resource](https://hl7.org/fhir/R4/relatedperson.html)
- [FHIR Extensions Guide](https://hl7.org/fhir/R4/extensibility.html)

---

## 2. Georgian Personal ID Validation

### Decision: Implement Georgian National ID Checksum Validation

**Rationale**:
- Georgian personal IDs follow a specific 11-digit format with checksum validation
- Client-side validation provides immediate feedback reducing server load
- Checksum algorithm prevents typos and accidental invalid entries

**Implementation Pattern**:
```typescript
/**
 * Validates Georgian personal ID (11 digits with checksum)
 * Format: YYMMDDSSSSC where:
 * - YY: Year of birth (last 2 digits)
 * - MM: Month of birth (01-12)
 * - DD: Day of birth (01-31)
 * - SSS: Sequential number
 * - C: Check digit
 */
function validateGeorgianPersonalID(personalID: string): boolean {
  // Remove any whitespace
  const id = personalID.replace(/\s/g, '');

  // Check length
  if (id.length !== 11) {
    return false;
  }

  // Check all digits
  if (!/^\d{11}$/.test(id)) {
    return false;
  }

  // Extract components
  const year = parseInt(id.substring(0, 2));
  const month = parseInt(id.substring(2, 4));
  const day = parseInt(id.substring(4, 6));

  // Validate date components
  if (month < 1 || month > 12) {
    return false;
  }
  if (day < 1 || day > 31) {
    return false;
  }

  // Calculate check digit (Luhn algorithm variant)
  const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;

  for (let i = 0; i < 10; i++) {
    let digit = parseInt(id[i]) * weights[i];
    if (digit > 9) {
      digit = digit - 9; // Sum of digits if > 9
    }
    sum += digit;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  const providedCheckDigit = parseInt(id[10]);

  return checkDigit === providedCheckDigit;
}

// Form validation hook
const personalIDValidator = (value: string | undefined): string | null => {
  if (!value) return null; // Optional field
  if (!validateGeorgianPersonalID(value)) {
    return 'არასწორი პირადი ნომერი (Invalid personal ID format)';
  }
  return null;
};
```

**Alternatives Considered**:
1. **Server-only validation**: Rejected due to poor UX (no immediate feedback)
2. **Length-only validation**: Rejected because it doesn't catch typos or invalid IDs
3. **External API validation**: Rejected due to privacy concerns and network dependency

**References**:
- Georgian Civil Registry specifications
- Medplum form validation patterns from `@mantine/form`

---

## 3. Citizenship Data Management

### Decision: Use ISO 3166-1 Country Codes with Georgian Translations

**Rationale**:
- ISO 3166-1 alpha-2 codes provide standard interoperability
- Georgian translations maintain UX consistency with legacy system
- ValueSet resource enables future expansion and localization

**Implementation Pattern**:
```typescript
// Citizenship ValueSet definition
const citizenshipValueSet = {
  resourceType: 'ValueSet',
  id: 'medimind-citizenship',
  url: 'http://medimind.ge/fhir/ValueSet/citizenship',
  version: '1.0.0',
  name: 'MediMindCitizenship',
  title: 'MediMind Citizenship Codes',
  status: 'active',
  description: 'Country codes for patient citizenship with Georgian translations',
  compose: {
    include: [
      {
        system: 'urn:iso:std:iso:3166',
        concept: [
          { code: 'GE', display: 'საქართველო', designation: [
            { language: 'en', value: 'Georgia' },
            { language: 'ru', value: 'Грузия' }
          ]},
          { code: 'US', display: 'ამერიკის შეერთებული შტატები', designation: [
            { language: 'en', value: 'United States' },
            { language: 'ru', value: 'Соединенные Штаты' }
          ]},
          { code: 'RU', display: 'რუსეთი', designation: [
            { language: 'en', value: 'Russia' },
            { language: 'ru', value: 'Россия' }
          ]},
          // ... 247 more countries
        ]
      }
    ]
  }
};

// React component usage
function CitizenshipSelect({ value, onChange }: CitizenshipSelectProps) {
  const { t, lang } = useTranslation();
  const [countries, setCountries] = useState<CitizenshipOption[]>([]);

  useEffect(() => {
    // Load citizenship data from JSON file
    import('@/emr/translations/citizenship.json').then(data => {
      setCountries(data.countries);
    });
  }, []);

  const getCountryDisplay = (country: CitizenshipOption) => {
    switch(lang) {
      case 'ka': return country.displayKa;
      case 'en': return country.displayEn;
      case 'ru': return country.displayRu;
      default: return country.displayKa;
    }
  };

  return (
    <Select
      label={t('citizenship')}
      data={countries.map(c => ({
        value: c.code,
        label: getCountryDisplay(c)
      }))}
      value={value}
      onChange={onChange}
      searchable
      clearable
    />
  );
}
```

**Data File Structure** (`packages/app/src/emr/translations/citizenship.json`):
```json
{
  "countries": [
    {
      "code": "GE",
      "displayKa": "საქართველო",
      "displayEn": "Georgia",
      "displayRu": "Грузия",
      "numeric": "268"
    },
    {
      "code": "US",
      "displayKa": "ამერიკის შეერთებული შტატები",
      "displayEn": "United States",
      "displayRu": "Соединенные Штаты",
      "numeric": "840"
    }
    // ... 248 more entries
  ]
}
```

**Alternatives Considered**:
1. **Hardcoded country list in component**: Rejected due to lack of maintainability and translation support
2. **Server-side ValueSet only**: Rejected because client needs offline capability for form rendering
3. **Third-party i18n library**: Rejected to maintain consistency with existing EMR translation system

---

## 4. Duplicate Patient Detection Strategy

### Decision: Search-Before-Create with FHIR Search Parameters

**Rationale**:
- FHIR search API provides built-in support for identifier and name matching
- Medplum server indexes enable efficient duplicate detection queries
- Search results can be presented to user for confirmation before creating duplicate

**Implementation Pattern**:
```typescript
async function checkDuplicatePatient(
  medplum: MedplumClient,
  personalID?: string,
  firstName?: string,
  lastName?: string,
  birthDate?: string
): Promise<Patient[]> {
  const searchParams: Record<string, string> = {};

  // Search by personal ID (highest priority)
  if (personalID) {
    searchParams.identifier = `http://medimind.ge/identifiers/personal-id|${personalID}`;
  }

  // Search by name and birth date
  if (firstName) {
    searchParams.given = firstName;
  }
  if (lastName) {
    searchParams.family = lastName;
  }
  if (birthDate) {
    searchParams.birthdate = birthDate;
  }

  // Execute search
  const bundle = await medplum.searchResources('Patient', searchParams);

  return bundle;
}

// Usage in registration form
async function handleSubmit(values: PatientFormValues) {
  // Check for duplicates before creating
  const duplicates = await checkDuplicatePatient(
    medplum,
    values.personalID,
    values.firstName,
    values.lastName,
    values.birthDate
  );

  if (duplicates.length > 0) {
    // Show confirmation dialog with duplicate records
    const confirmed = await showDuplicateWarning(duplicates);
    if (!confirmed) {
      return; // User cancelled
    }
  }

  // Create new patient
  const patient = await medplum.createResource<Patient>({
    resourceType: 'Patient',
    // ... patient data
  });

  notifications.show({
    title: 'პაციენტი დარეგისტრირდა',
    message: 'Patient registered successfully',
    color: 'green'
  });
}
```

**UI Pattern for Duplicate Warning**:
```typescript
function DuplicateWarningModal({
  duplicates,
  onConfirm,
  onCancel
}: DuplicateWarningProps) {
  const { t } = useTranslation();

  return (
    <Modal
      opened={true}
      onClose={onCancel}
      title={t('duplicatePatientWarning')}
    >
      <Text mb="md">
        {t('duplicatePatientMessage', { count: duplicates.length })}
      </Text>

      <Stack spacing="xs">
        {duplicates.map(patient => (
          <Card key={patient.id} withBorder>
            <Group>
              <div>
                <Text weight={500}>
                  {patient.name?.[0]?.given?.[0]} {patient.name?.[0]?.family}
                </Text>
                <Text size="sm" color="dimmed">
                  {t('personalID')}: {getIdentifierValue(patient, 'personal-id')}
                </Text>
                <Text size="sm" color="dimmed">
                  {t('birthDate')}: {patient.birthDate}
                </Text>
              </div>
              <Button
                variant="light"
                onClick={() => window.open(`/emr/registration/edit/${patient.id}`, '_blank')}
              >
                {t('viewRecord')}
              </Button>
            </Group>
          </Card>
        ))}
      </Stack>

      <Group position="right" mt="md">
        <Button variant="default" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button color="red" onClick={onConfirm}>
          {t('createAnyway')}
        </Button>
      </Group>
    </Modal>
  );
}
```

**Alternatives Considered**:
1. **Probabilistic matching algorithms**: Deferred to future phase due to complexity
2. **Blocking duplicate creation**: Rejected because emergency scenarios require override capability
3. **Post-creation merge tools**: Out of scope for this phase

---

## 5. Relationship Type Mapping to FHIR Value Sets

### Decision: Use HL7 v3 RoleCode with Custom Extensions for Georgian Terms

**Rationale**:
- HL7 v3 RoleCode provides standard relationship codes recognized across systems
- Custom extensions preserve Georgian terminology from legacy system
- Enables both interoperability and user-friendly display

**Mapping Table**:

| Legacy Value | Georgian Label | HL7 v3 RoleCode | Display (EN) |
|--------------|----------------|-----------------|--------------|
| 1 | დედა | MTH | Mother |
| 2 | მამა | FTH | Father |
| 3 | და | SIS | Sister |
| 4 | ძმა | BRO | Brother |
| 5 | ბებია | GRMTH | Grandmother |
| 6 | ბაბუა | GRFTH | Grandfather |
| 7 | შვილი | CHILD | Child |
| 8 | მეუღლე | SPS | Spouse |
| 9 | ნათესავი | FAMMEMB | Family Member |
| 10 | ნათესავი დედის მხრიდან | FAMMEMB | Family Member (maternal) |
| 11 | ნათესავი მამის მხრიდან | FAMMEMB | Family Member (paternal) |

**Implementation**:
```typescript
const relationshipMapping: Record<string, RelationshipCode> = {
  '1': { code: 'MTH', display: 'Mother', displayKa: 'დედა' },
  '2': { code: 'FTH', display: 'Father', displayKa: 'მამა' },
  '3': { code: 'SIS', display: 'Sister', displayKa: 'და' },
  '4': { code: 'BRO', display: 'Brother', displayKa: 'ძმა' },
  '5': { code: 'GRMTH', display: 'Grandmother', displayKa: 'ბებია' },
  '6': { code: 'GRFTH', display: 'Grandfather', displayKa: 'ბაბუა' },
  '7': { code: 'CHILD', display: 'Child', displayKa: 'შვილი' },
  '8': { code: 'SPS', display: 'Spouse', displayKa: 'მეუღლე' },
  '9': { code: 'FAMMEMB', display: 'Family Member', displayKa: 'ნათესავი' },
  '10': { code: 'FAMMEMB', display: 'Family Member', displayKa: 'ნათესავი დედის მხრიდან',
          extension: { maternalSide: true } },
  '11': { code: 'FAMMEMB', display: 'Family Member', displayKa: 'ნათესავი მამის მხრიდან',
          extension: { paternalSide: true } }
};

function createRelationshipCoding(legacyValue: string): Coding[] {
  const mapping = relationshipMapping[legacyValue];
  return [
    {
      system: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
      code: mapping.code,
      display: mapping.display
    }
  ];
}
```

**Alternatives Considered**:
1. **SNOMED CT relationship codes**: Rejected due to licensing and complexity
2. **Custom code system**: Rejected because it reduces interoperability
3. **FHIR v2 relationship codes**: Rejected in favor of more comprehensive v3 RoleCode

**References**:
- [HL7 v3 RoleCode System](http://terminology.hl7.org/CodeSystem/v3-RoleCode)
- [FHIR Relationship Value Set](https://hl7.org/fhir/R4/valueset-relatedperson-relationshiptype.html)

---

## 6. Form State Management and Validation

### Decision: Use Mantine Form Hooks with Custom FHIR Validators

**Rationale**:
- Mantine form library already used in Medplum app provides consistent UX
- Form hooks support complex validation rules and error display
- Custom validators enable FHIR-specific validation (identifier formats, date constraints)

**Implementation Pattern**:
```typescript
import { useForm } from '@mantine/form';
import { PatientFormValues } from './types';

function usePatientForm(initialPatient?: Patient) {
  const form = useForm<PatientFormValues>({
    initialValues: {
      personalID: getIdentifierValue(initialPatient, 'personal-id') || '',
      firstName: initialPatient?.name?.[0]?.given?.[0] || '',
      lastName: initialPatient?.name?.[0]?.family || '',
      fatherName: getPatronymicExtension(initialPatient) || '',
      birthDate: initialPatient?.birthDate || '',
      gender: initialPatient?.gender || '',
      phone: getTelecomValue(initialPatient, 'phone') || '',
      email: getTelecomValue(initialPatient, 'email') || '',
      legalAddress: initialPatient?.address?.[0]?.text || '',
      workplace: getWorkplaceExtension(initialPatient) || '',
      citizenship: getCitizenshipExtension(initialPatient) || '',
      unknownPatient: false,
      // Representative fields
      repFirstName: '',
      repLastName: '',
      repPersonalID: '',
      repBirthDate: '',
      repGender: '',
      repPhone: '',
      repAddress: '',
      repRelationship: ''
    },

    validate: {
      personalID: (value, values) => {
        if (values.unknownPatient) return null; // Optional for unknown patients
        if (!value) return 'პირადი ნომერი აუცილებელია';
        return validateGeorgianPersonalID(value)
          ? null
          : 'არასწორი პირადი ნომრის ფორმატი';
      },

      firstName: (value, values) => {
        if (values.unknownPatient) return null;
        return value ? null : 'სახელი აუცილებელია';
      },

      lastName: (value, values) => {
        if (values.unknownPatient) return null;
        return value ? null : 'გვარი აუცილებელია';
      },

      gender: (value, values) => {
        if (values.unknownPatient) return null;
        return value ? null : 'სქესი აუცილებელია';
      },

      birthDate: (value) => {
        if (!value) return null; // Optional
        const date = new Date(value);
        const now = new Date();
        const age = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

        if (date > now) {
          return 'დაბადების თარიღი არ შეიძლება იყოს მომავალში';
        }
        if (age > 120) {
          return 'დაბადების თარიღი ძალიან შორს არის წარსულში';
        }
        return null;
      },

      email: (value) => {
        if (!value) return null; // Optional
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? null : 'არასწორი ელ-ფოსტის ფორმატი';
      },

      // Representative validation when patient is minor
      repFirstName: (value, values) => {
        const isMinor = isPatientMinor(values.birthDate);
        if (isMinor && !value) {
          return 'წარმომადგენლის სახელი აუცილებელია არასრულწლოვნებისთვის';
        }
        return null;
      },

      repLastName: (value, values) => {
        const isMinor = isPatientMinor(values.birthDate);
        if (isMinor && !value) {
          return 'წარმომადგენლის გვარი აუცილებელია არასრულწლოვნებისთვის';
        }
        return null;
      },

      repRelationship: (value, values) => {
        const isMinor = isPatientMinor(values.birthDate);
        if (isMinor && !value) {
          return 'ნათესაური კავშირი აუცილებელია არასრულწლოვნებისთვის';
        }
        return null;
      }
    }
  });

  return form;
}

// Helper function
function isPatientMinor(birthDate: string): boolean {
  if (!birthDate) return false;
  const date = new Date(birthDate);
  const now = new Date();
  const age = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  return age < 18;
}

// Convert form values to FHIR Patient resource
function formValuesToPatient(values: PatientFormValues): Patient {
  const patient: Patient = {
    resourceType: 'Patient',
    identifier: [],
    name: [
      {
        use: 'official',
        family: values.lastName,
        given: [values.firstName],
        extension: values.fatherName ? [
          {
            url: 'http://medimind.ge/fhir/StructureDefinition/patronymic',
            valueString: values.fatherName
          }
        ] : undefined
      }
    ],
    gender: values.gender as 'male' | 'female' | 'other' | 'unknown',
    birthDate: values.birthDate || undefined,
    telecom: [],
    address: [],
    extension: []
  };

  // Add personal ID identifier if provided
  if (values.personalID) {
    patient.identifier?.push({
      system: 'http://medimind.ge/identifiers/personal-id',
      value: values.personalID,
      use: 'official'
    });
  }

  // Add phone
  if (values.phone) {
    patient.telecom?.push({
      system: 'phone',
      value: values.phone,
      use: 'mobile'
    });
  }

  // Add email
  if (values.email) {
    patient.telecom?.push({
      system: 'email',
      value: values.email,
      use: 'work'
    });
  }

  // Add address
  if (values.legalAddress) {
    patient.address?.push({
      use: 'home',
      type: 'physical',
      text: values.legalAddress
    });
  }

  // Add extensions
  if (values.workplace) {
    patient.extension?.push({
      url: 'http://medimind.ge/fhir/StructureDefinition/workplace',
      valueString: values.workplace
    });
  }

  if (values.citizenship) {
    patient.extension?.push({
      url: 'http://medimind.ge/fhir/StructureDefinition/citizenship',
      valueCodeableConcept: {
        coding: [
          {
            system: 'urn:iso:std:iso:3166',
            code: values.citizenship
          }
        ]
      }
    });
  }

  return patient;
}
```

**Alternatives Considered**:
1. **React Hook Form**: Rejected to maintain consistency with existing Medplum components using Mantine
2. **Custom validation library**: Rejected because Mantine form provides sufficient validation features
3. **Yup schema validation**: Considered but inline validators provide better integration with FHIR-specific rules

---

## 7. Patient List Display and Search Performance

### Decision: Server-Side Pagination with Client-Side Caching

**Rationale**:
- Large patient databases (100k+ records) require pagination to avoid memory issues
- Medplum FHIR search API supports pagination via `_count` and `_offset` parameters
- Client-side caching reduces redundant API calls for recently viewed pages

**Implementation Pattern**:
```typescript
function usePatientSearch() {
  const medplum = useMedplum();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const searchPatients = useCallback(async (
    firstName?: string,
    lastName?: string,
    personalID?: string,
    registrationNumber?: string,
    page: number = 1
  ) => {
    setLoading(true);

    try {
      const searchParams: Record<string, string> = {
        _count: String(pageSize),
        _offset: String((page - 1) * pageSize),
        _sort: '-_lastUpdated' // Newest first
      };

      if (firstName) searchParams.given = firstName;
      if (lastName) searchParams.family = lastName;
      if (personalID) {
        searchParams.identifier = `http://medimind.ge/identifiers/personal-id|${personalID}`;
      }
      if (registrationNumber) {
        searchParams.identifier = `http://medimind.ge/identifiers/registration-number|${registrationNumber}`;
      }

      const bundle = await medplum.search('Patient', searchParams);

      setPatients(bundle.entry?.map(e => e.resource as Patient) || []);
      setTotalCount(bundle.total || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Patient search failed:', error);
      notifications.show({
        title: 'ძებნის შეცდომა',
        message: 'Patient search failed',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  }, [medplum]);

  return {
    patients,
    totalCount,
    loading,
    currentPage,
    pageSize,
    searchPatients,
    totalPages: Math.ceil(totalCount / pageSize)
  };
}

// Patient list component
function PatientListTable() {
  const { t } = useTranslation();
  const {
    patients,
    totalCount,
    loading,
    currentPage,
    pageSize,
    searchPatients,
    totalPages
  } = usePatientSearch();

  // Search form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [personalID, setPersonalID] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');

  const handleSearch = () => {
    searchPatients(firstName, lastName, personalID, registrationNumber, 1);
  };

  const handlePageChange = (page: number) => {
    searchPatients(firstName, lastName, personalID, registrationNumber, page);
  };

  return (
    <Box>
      {/* Search filters */}
      <Grid mb="md">
        <Grid.Col span={3}>
          <TextInput
            label={t('firstName')}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </Grid.Col>
        <Grid.Col span={3}>
          <TextInput
            label={t('lastName')}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </Grid.Col>
        <Grid.Col span={3}>
          <TextInput
            label={t('personalID')}
            value={personalID}
            onChange={(e) => setPersonalID(e.target.value)}
          />
        </Grid.Col>
        <Grid.Col span={3}>
          <TextInput
            label={t('registrationNumber')}
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <Button onClick={handleSearch} loading={loading}>
            {t('search')}
          </Button>
        </Grid.Col>
      </Grid>

      {/* Results table */}
      <Table>
        <thead>
          <tr>
            <th>{t('registrationNumber')}</th>
            <th>{t('personalID')}</th>
            <th>{t('firstName')}</th>
            <th>{t('lastName')}</th>
            <th>{t('birthDate')}</th>
            <th>{t('gender')}</th>
            <th>{t('phone')}</th>
            <th>{t('address')}</th>
            <th>{t('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <PatientRow key={patient.id} patient={patient} />
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <Group position="center" mt="md">
        <Pagination
          page={currentPage}
          onChange={handlePageChange}
          total={totalPages}
          disabled={loading}
        />
        <Text size="sm" color="dimmed">
          {t('showing')} {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)} {t('of')} {totalCount}
        </Text>
      </Group>
    </Box>
  );
}
```

**Performance Optimizations**:
1. Debounce search input to reduce API calls
2. Cache search results for 5 minutes using React Query or SWR
3. Use FHIR `_elements` parameter to fetch only needed fields for list view
4. Implement virtual scrolling for very large result sets (future enhancement)

**Alternatives Considered**:
1. **Load all patients at once**: Rejected due to memory and network constraints
2. **GraphQL pagination**: Rejected to maintain FHIR REST API consistency
3. **Infinite scroll**: Rejected in favor of traditional pagination for better user control

---

## 8. Emergency "Unknown Patient" Workflow

### Decision: Conditional Field Requirements with Temporary Identifiers

**Rationale**:
- Emergency scenarios require immediate patient registration without full identification
- FHIR supports minimal Patient resources with only required FHIR elements
- Temporary identifiers enable later identification and record completion

**Implementation Pattern**:
```typescript
function createUnknownPatient(
  medplum: MedplumClient,
  minimalInfo: {
    estimatedAge?: number;
    gender?: 'male' | 'female' | 'unknown';
    arrivalDateTime: string;
    notes?: string;
  }
): Promise<Patient> {
  // Generate temporary identifier
  const tempID = `UNK-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // Calculate estimated birth year from age
  const estimatedBirthYear = minimalInfo.estimatedAge
    ? new Date().getFullYear() - minimalInfo.estimatedAge
    : undefined;

  const unknownPatient: Patient = {
    resourceType: 'Patient',
    identifier: [
      {
        system: 'http://medimind.ge/identifiers/temporary',
        value: tempID,
        use: 'temp'
      }
    ],
    name: [
      {
        use: 'temp',
        text: `Unknown Patient ${tempID}`
      }
    ],
    gender: minimalInfo.gender || 'unknown',
    birthDate: estimatedBirthYear ? `${estimatedBirthYear}-01-01` : undefined,
    extension: [
      {
        url: 'http://medimind.ge/fhir/StructureDefinition/unknown-patient',
        valueBoolean: true
      },
      {
        url: 'http://medimind.ge/fhir/StructureDefinition/arrival-datetime',
        valueDateTime: minimalInfo.arrivalDateTime
      }
    ]
  };

  if (minimalInfo.notes) {
    unknownPatient.extension?.push({
      url: 'http://medimind.ge/fhir/StructureDefinition/registration-notes',
      valueString: minimalInfo.notes
    });
  }

  return medplum.createResource(unknownPatient);
}

// UI component for unknown patient registration
function UnknownPatientForm({ onSuccess }: UnknownPatientFormProps) {
  const medplum = useMedplum();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      estimatedAge: '',
      gender: 'unknown',
      notes: ''
    }
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    try {
      const patient = await createUnknownPatient(medplum, {
        estimatedAge: values.estimatedAge ? parseInt(values.estimatedAge) : undefined,
        gender: values.gender as any,
        arrivalDateTime: new Date().toISOString(),
        notes: values.notes || undefined
      });

      notifications.show({
        title: t('unknownPatientRegistered'),
        message: `${t('tempID')}: ${getIdentifierValue(patient, 'temporary')}`,
        color: 'yellow'
      });

      onSuccess(patient);
    } catch (error) {
      console.error('Failed to create unknown patient:', error);
      notifications.show({
        title: t('registrationFailed'),
        message: t('unknownPatientError'),
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Alert
        icon={<IconAlertCircle />}
        title={t('emergencyRegistration')}
        color="yellow"
        mb="md"
      >
        {t('emergencyRegistrationWarning')}
      </Alert>

      <TextInput
        label={t('estimatedAge')}
        type="number"
        min={0}
        max={120}
        {...form.getInputProps('estimatedAge')}
      />

      <Select
        label={t('gender')}
        data={[
          { value: 'unknown', label: t('unknown') },
          { value: 'male', label: t('male') },
          { value: 'female', label: t('female') }
        ]}
        {...form.getInputProps('gender')}
      />

      <Textarea
        label={t('notes')}
        placeholder={t('emergencyNotesPlaceholder')}
        minRows={3}
        {...form.getInputProps('notes')}
      />

      <Group position="right" mt="md">
        <Button type="submit" color="yellow" loading={loading}>
          {t('registerUnknownPatient')}
        </Button>
      </Group>
    </form>
  );
}
```

**Follow-up Workflow**:
```typescript
// Update unknown patient with full identification
async function identifyUnknownPatient(
  medplum: MedplumClient,
  patientId: string,
  fullInfo: PatientFormValues
): Promise<Patient> {
  // Fetch existing patient
  const patient = await medplum.readResource('Patient', patientId);

  // Update with full information
  const updatedPatient: Patient = {
    ...patient,
    identifier: [
      ...(patient.identifier || []).filter(i => i.system !== 'http://medimind.ge/identifiers/temporary'),
      {
        system: 'http://medimind.ge/identifiers/personal-id',
        value: fullInfo.personalID,
        use: 'official'
      }
    ],
    name: [
      {
        use: 'official',
        family: fullInfo.lastName,
        given: [fullInfo.firstName]
      }
    ],
    gender: fullInfo.gender as any,
    birthDate: fullInfo.birthDate,
    // ... other fields
    extension: (patient.extension || []).filter(
      e => e.url !== 'http://medimind.ge/fhir/StructureDefinition/unknown-patient'
    )
  };

  return medplum.updateResource(updatedPatient);
}
```

**Alternatives Considered**:
1. **Block emergency registration**: Rejected as medically unsafe
2. **Separate "unknown patient" resource type**: Rejected because FHIR Patient can handle minimal data
3. **Manual ID assignment**: Rejected in favor of automatic temp ID generation

---

## 9. Testing Strategy for FHIR Resources

### Decision: Three-Layer Testing - Unit, Integration, Contract

**Rationale**:
- **Unit tests** validate form logic, validators, and utility functions in isolation
- **Integration tests** verify FHIR resource creation, search, and update operations against test server
- **Contract tests** ensure FHIR resource structure matches R4 specification

**Implementation Pattern**:

**Unit Tests** (validation, utilities):
```typescript
// validateGeorgianPersonalID.test.ts
import { validateGeorgianPersonalID } from './validators';

describe('validateGeorgianPersonalID', () => {
  it('should accept valid 11-digit Georgian personal ID', () => {
    expect(validateGeorgianPersonalID('26001014632')).toBe(true);
  });

  it('should reject personal ID with incorrect length', () => {
    expect(validateGeorgianPersonalID('123456')).toBe(false);
    expect(validateGeorgianPersonalID('123456789012')).toBe(false);
  });

  it('should reject personal ID with non-numeric characters', () => {
    expect(validateGeorgianPersonalID('2600101463A')).toBe(false);
  });

  it('should reject personal ID with invalid check digit', () => {
    expect(validateGeorgianPersonalID('26001014631')).toBe(false);
  });

  it('should reject personal ID with invalid date components', () => {
    expect(validateGeorgianPersonalID('26131014632')).toBe(false); // month 13
    expect(validateGeorgianPersonalID('26003214632')).toBe(false); // day 32
  });
});
```

**Integration Tests** (FHIR operations):
```typescript
// patientRegistration.test.ts
import { MockClient } from '@medplum/mock';
import { Patient, RelatedPerson } from '@medplum/fhirtypes';
import { createPatient, createRepresentative, checkDuplicatePatient } from './patientService';

describe('Patient Registration Integration', () => {
  let medplum: MockClient;

  beforeEach(() => {
    medplum = new MockClient();
  });

  it('should create patient with full demographics', async () => {
    const patientData = {
      personalID: '26001014632',
      firstName: 'თენგიზი',
      lastName: 'ხოზვრია',
      birthDate: '1986-01-26',
      gender: 'male' as const,
      phone: '+995500050610',
      email: 'tengizi@example.com',
      legalAddress: 'საქართველო, თბილისი',
      citizenship: 'GE'
    };

    const patient = await createPatient(medplum, patientData);

    expect(patient.resourceType).toBe('Patient');
    expect(patient.name?.[0]?.given?.[0]).toBe('თენგიზი');
    expect(patient.name?.[0]?.family).toBe('ხოზვრია');
    expect(patient.birthDate).toBe('1986-01-26');
    expect(patient.gender).toBe('male');

    // Verify identifier
    const personalIDIdentifier = patient.identifier?.find(
      i => i.system === 'http://medimind.ge/identifiers/personal-id'
    );
    expect(personalIDIdentifier?.value).toBe('26001014632');

    // Verify telecom
    const phoneContact = patient.telecom?.find(t => t.system === 'phone');
    expect(phoneContact?.value).toBe('+995500050610');
  });

  it('should create representative linked to patient', async () => {
    const patient = await medplum.createResource<Patient>({
      resourceType: 'Patient',
      name: [{ family: 'TestPatient', given: ['Child'] }],
      birthDate: '2015-01-01'
    });

    const repData = {
      patientId: patient.id!,
      firstName: 'ნინო',
      lastName: 'გელაშვილი',
      relationship: '1', // Mother
      personalID: '12345678901',
      phone: '+995555123456'
    };

    const representative = await createRepresentative(medplum, repData);

    expect(representative.resourceType).toBe('RelatedPerson');
    expect(representative.patient.reference).toBe(`Patient/${patient.id}`);
    expect(representative.relationship?.[0]?.coding?.[0]?.code).toBe('MTH');
  });

  it('should detect duplicate patients by personal ID', async () => {
    // Create initial patient
    await medplum.createResource<Patient>({
      resourceType: 'Patient',
      identifier: [{
        system: 'http://medimind.ge/identifiers/personal-id',
        value: '26001014632'
      }],
      name: [{ family: 'ხოზვრია', given: ['თენგიზი'] }]
    });

    // Search for duplicate
    const duplicates = await checkDuplicatePatient(
      medplum,
      '26001014632',
      undefined,
      undefined,
      undefined
    );

    expect(duplicates.length).toBeGreaterThan(0);
    expect(duplicates[0].identifier?.some(
      i => i.value === '26001014632'
    )).toBe(true);
  });

  it('should create unknown patient with minimal data', async () => {
    const unknownPatient = await createUnknownPatient(medplum, {
      estimatedAge: 35,
      gender: 'unknown',
      arrivalDateTime: new Date().toISOString()
    });

    expect(unknownPatient.resourceType).toBe('Patient');
    expect(unknownPatient.gender).toBe('unknown');

    // Verify temporary identifier
    const tempIdentifier = unknownPatient.identifier?.find(
      i => i.system === 'http://medimind.ge/identifiers/temporary'
    );
    expect(tempIdentifier).toBeDefined();
    expect(tempIdentifier?.value).toMatch(/^UNK-/);

    // Verify unknown patient extension
    const unknownExt = unknownPatient.extension?.find(
      e => e.url === 'http://medimind.ge/fhir/StructureDefinition/unknown-patient'
    );
    expect(unknownExt?.valueBoolean).toBe(true);
  });
});
```

**Contract Tests** (FHIR conformance):
```typescript
// fhirResourceConformance.test.ts
import { validateResource } from '@medplum/core';
import { Patient, RelatedPerson } from '@medplum/fhirtypes';

describe('FHIR Resource Conformance', () => {
  it('should create valid FHIR R4 Patient resource', () => {
    const patient: Patient = {
      resourceType: 'Patient',
      identifier: [{
        system: 'http://medimind.ge/identifiers/personal-id',
        value: '26001014632'
      }],
      name: [{ family: 'Test', given: ['Patient'] }],
      gender: 'male',
      birthDate: '1990-01-01'
    };

    const errors = validateResource(patient);
    expect(errors).toHaveLength(0);
  });

  it('should create valid FHIR R4 RelatedPerson resource', () => {
    const relatedPerson: RelatedPerson = {
      resourceType: 'RelatedPerson',
      patient: { reference: 'Patient/123' },
      relationship: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
          code: 'MTH'
        }]
      }],
      name: [{ family: 'Mother', given: ['Test'] }]
    };

    const errors = validateResource(relatedPerson);
    expect(errors).toHaveLength(0);
  });

  it('should validate custom extensions', () => {
    const patient: Patient = {
      resourceType: 'Patient',
      name: [{ family: 'Test', given: ['Patient'] }],
      extension: [
        {
          url: 'http://medimind.ge/fhir/StructureDefinition/citizenship',
          valueCodeableConcept: {
            coding: [{
              system: 'urn:iso:std:iso:3166',
              code: 'GE'
            }]
          }
        }
      ]
    };

    const errors = validateResource(patient);
    expect(errors).toHaveLength(0);
  });
});
```

**Test Coverage Requirements** (from Constitution):
- Unit tests: >80% coverage for validators, utilities, and form logic
- Integration tests: Cover all CRUD operations and search scenarios
- Contract tests: Validate all FHIR resources against R4 schema

**Alternatives Considered**:
1. **Manual testing only**: Rejected per Constitution Principle III (Test-First Development)
2. **E2E tests with Playwright**: Deferred to future phase (focus on API correctness first)
3. **Property-based testing**: Considered for validators but deferred due to complexity

**References**:
- Medplum testing patterns: `packages/core/src/client.test.ts`
- MockClient usage: `packages/mock/src/client.ts`

---

## 10. Multilingual Support Integration

### Decision: Reuse Existing EMR Translation System

**Rationale**:
- EMR UI Layout (Feature 003) provides working translation infrastructure
- Consistent user experience across all EMR modules
- Translation keys follow established naming conventions

**Implementation Pattern**:

**Translation Keys** (add to `packages/app/src/emr/translations/ka.json`, `en.json`, `ru.json`):
```json
{
  "registration": {
    "title": "რეგისტრაცია / Registration / Регистрация",
    "newPatient": "ახალი პაციენტი / New Patient / Новый пациент",
    "searchPatients": "პაციენტების ძებნა / Search Patients / Поиск пациентов",

    "form": {
      "personalID": "პირადი ნომერი / Personal ID / Личный номер",
      "firstName": "სახელი / First Name / Имя",
      "lastName": "გვარი / Last Name / Фамилия",
      "fatherName": "მამის სახელი / Father's Name / Отчество",
      "birthDate": "დაბადების თარიღი / Birth Date / Дата рождения",
      "gender": "სქესი / Gender / Пол",
      "male": "მამრობითი / Male / Мужской",
      "female": "მდედრობითი / Female / Женский",
      "phone": "ტელეფონი / Phone / Телефон",
      "email": "ელ-ფოსტა / Email / Эл. почта",
      "legalAddress": "იურიდიული მისამართი / Legal Address / Юридический адрес",
      "workplace": "სამუშაო ადგილი / Workplace / Место работы",
      "citizenship": "მოქალაქეობა / Citizenship / Гражданство",
      "unknownPatient": "უცნობი პაციენტი / Unknown Patient / Неизвестный пациент"
    },

    "representative": {
      "title": "წარმომადგენელი / Representative / Представитель",
      "firstName": "წარმომადგენლის სახელი / Representative First Name / Имя представителя",
      "lastName": "წარმომადგენლის გვარი / Representative Last Name / Фамилия представителя",
      "relationship": "ნათესავი / Relationship / Родство",
      "relationships": {
        "mother": "დედა / Mother / Мать",
        "father": "მამა / Father / Отец",
        "sister": "და / Sister / Сестра",
        "brother": "ძმა / Brother / Брат",
        "grandmother": "ბებია / Grandmother / Бабушка",
        "grandfather": "ბაბუა / Grandfather / Дедушка",
        "child": "შვილი / Child / Ребенок",
        "spouse": "მეუღლე / Spouse / Супруг(а)"
      }
    },

    "list": {
      "registrationNumber": "რიგითი ნომერი / Registration # / Регистрационный №",
      "actions": "მოქმედებები / Actions / Действия",
      "edit": "რედაქტირება / Edit / Редактировать",
      "delete": "წაშლა / Delete / Удалить"
    },

    "validation": {
      "personalIDRequired": "პირადი ნომერი აუცილებელია / Personal ID required / Требуется личный номер",
      "personalIDInvalid": "არასწორი პირადი ნომერი / Invalid personal ID / Неверный личный номер",
      "firstNameRequired": "სახელი აუცილებელია / First name required / Требуется имя",
      "lastNameRequired": "გვარი აუცილებელია / Last name required / Требуется фамилия",
      "genderRequired": "სქესი აუცილებელია / Gender required / Требуется пол",
      "emailInvalid": "არასწორი ელ-ფოსტის ფორმატი / Invalid email format / Неверный формат эл. почты",
      "birthDateFuture": "დაბადების თარიღი არ შეიძლება იყოს მომავალში / Birth date cannot be in future / Дата рождения не может быть в будущем",
      "birthDateTooOld": "დაბადების თარიღი ძალიან შორს არის წარსულში / Birth date too far in past / Дата рождения слишком давняя"
    },

    "messages": {
      "patientCreated": "პაციენტი დარეგისტრირდა / Patient registered / Пациент зарегистрирован",
      "patientUpdated": "პაციენტის ინფორმაცია განახლდა / Patient updated / Информация о пациенте обновлена",
      "duplicateWarning": "ნაპოვნია მსგავსი პაციენტები / Similar patients found / Найдены похожие пациенты",
      "deleteConfirm": "ნამდვილად გსურთ პაციენტის წაშლა? / Delete patient? / Удалить пациента?"
    }
  }
}
```

**Usage in Components**:
```typescript
import { useTranslation } from '@/emr/hooks/useTranslation';

function PatientRegistrationForm() {
  const { t } = useTranslation();

  return (
    <Box>
      <Title order={2}>{t('registration.title')}</Title>

      <TextInput
        label={t('registration.form.firstName')}
        required
      />

      <TextInput
        label={t('registration.form.lastName')}
        required
      />

      <Select
        label={t('registration.form.gender')}
        data={[
          { value: 'male', label: t('registration.form.male') },
          { value: 'female', label: t('registration.form.female') }
        ]}
        required
      />
    </Box>
  );
}
```

**Alternatives Considered**:
1. **Separate translation system**: Rejected to maintain consistency
2. **i18next library**: Rejected because existing system is sufficient
3. **Server-side translations**: Rejected for performance and offline capability

---

## Summary and Next Steps

All technical decisions for Phase 0 have been documented. Key decisions include:

1. **FHIR Patient/RelatedPerson mapping** with Georgian-specific extensions
2. **Georgian personal ID validation** with checksum algorithm
3. **ISO 3166 citizenship codes** with multilingual support
4. **Search-before-create duplicate detection** using FHIR search API
5. **HL7 v3 RoleCode relationship mapping** with Georgian terminology
6. **Mantine form hooks** with custom FHIR validators
7. **Server-side pagination** with client caching for patient lists
8. **Conditional requirements** for emergency unknown patient workflow
9. **Three-layer testing strategy** (unit, integration, contract)
10. **Integrated multilingual support** reusing existing EMR translation system

**Ready for Phase 1**: Data model, API contracts, and developer quickstart can now be generated based on these research findings.

---

**Research Date**: 2025-11-12
**Reviewed By**: Implementation Agent
**Status**: ✅ Complete - Ready for Phase 1 Design
