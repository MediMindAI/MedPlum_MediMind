# Registration System - Implementation Gap Analysis & Action Plan

**Date**: 2025-11-13
**Based on**: Original EMR Screenshot Analysis (`original-emr-mapping.md`)
**Purpose**: Detailed comparison and actionable implementation plan

---

## Executive Summary

The current FHIR registration implementation has **strong foundations** (correct data model, validation, FHIR mapping) but **critical UX differences** from the original EMR. The main gap is architectural: separate pages vs. unified view.

### Priority Classification

| Priority | Gap Count | Impact | Effort | Timeline |
|----------|-----------|--------|--------|----------|
| 🔴 **HIGH** | 3 | Critical UX | Medium | Week 1 |
| 🟡 **MEDIUM** | 5 | Enhanced UX | Medium | Week 2-3 |
| 🟢 **LOW** | 3 | Visual Polish | Low | Week 4+ |

---

## Detailed Gap Analysis

### 🔴 HIGH PRIORITY GAPS (Critical UX Issues)

#### Gap 1: Separate Pages vs. Unified Layout

**Current State**:
```
User Flow:
1. Click "რეგისტრაციაში" → PatientListView.tsx (search only)
2. Click "New Patient" → PatientRegistrationView.tsx (form only)
3. Click "Back" → Return to PatientListView
```

**Original EMR**:
```
User Flow:
1. Click "რეგისტრაციაში" → UnifiedView (search + form + table)
2. Search left → Results appear in table below
3. Register right → Patient appears in table immediately
4. No navigation required
```

**Impact**: 🔴 **CRITICAL**
- Users must navigate between pages (extra clicks)
- Can't see search results while registering
- Can't quickly switch between search and add
- Breaks muscle memory from original system

**Effort**: 🟡 **MEDIUM**
- Create new `UnifiedRegistrationView.tsx`
- Extract `PatientSearchForm.tsx` from `PatientListView.tsx`
- Update routing in `AppRoutes.tsx`
- Coordinate state between search, form, and table

**Solution**:
```tsx
// NEW: UnifiedRegistrationView.tsx
export function UnifiedRegistrationView(): JSX.Element {
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);

  const handleSearch = (filters: SearchFilters) => {
    // Update searchResults
    // Table shows searchResults when non-empty, else allPatients
  };

  const handleRegister = (patient: PatientFormValues) => {
    // Create patient
    // Add to allPatients and searchResults
    // Table updates immediately
  };

  return (
    <Stack gap="md" p="md">
      {/* Top Section: Side-by-side */}
      <Group align="flex-start" gap="md">
        {/* Left: Search (35%) */}
        <Paper style={{ flex: '0 0 35%' }}>
          <PatientSearchForm onSearch={handleSearch} />
        </Paper>

        {/* Right: Registration (65%) */}
        <Paper style={{ flex: '0 0 65%' }}>
          <PatientRegistrationForm
            onSubmit={handleRegister}
            inline // Don't navigate after submit
          />
        </Paper>
      </Group>

      {/* Bottom Section: Table (100%) */}
      <Paper>
        <PatientTable
          patients={searchResults.length > 0 ? searchResults : allPatients}
          searchFilters={currentFilters}
          highlightMatches
        />
      </Paper>
    </Stack>
  );
}
```

**Files to Create**:
- `packages/app/src/emr/views/registration/UnifiedRegistrationView.tsx`
- `packages/app/src/emr/views/registration/UnifiedRegistrationView.test.tsx`

**Files to Update**:
- `packages/app/src/AppRoutes.tsx` - Change route for `/receiver`
- `packages/app/src/emr/translations/menu-structure.ts` - Update route reference

**Testing**:
- [ ] Both forms render side-by-side
- [ ] Search updates table without navigation
- [ ] Registration adds to table immediately
- [ ] Responsive: stacks vertically on mobile
- [ ] No navigation occurs during workflow

---

#### Gap 2: Missing Registration Number Search Field

**Current State**:
- Search form has: First Name, Last Name, Personal ID, Birth Date, Gender, Phone
- **Missing**: Registration Number field

**Original EMR**:
- Search form has: სახელი, გვარი, პირადი ნომერი, **რეგისტრაცია ნომერი**
- Registration number is hospital-assigned ID (e.g., "99091")

**Impact**: 🔴 **HIGH**
- Users can't search by registration number (common use case)
- Front desk staff rely on this field
- Patient cards show registration number prominently

**Effort**: 🟢 **LOW**
- Add one field to search form
- Update FHIR search logic
- Add translation key

**Solution**:

1. **Update Type** (`packages/app/src/emr/hooks/usePatientSearch.ts`):
```typescript
export interface SearchFilters {
  firstName?: string;
  lastName?: string;
  personalId?: string;
  registrationNumber?: string; // ADD THIS
  birthDate?: string;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  phone?: string;
}
```

2. **Update Search Service** (`packages/app/src/emr/services/patientService.ts`):
```typescript
export async function searchPatients(
  medplum: MedplumClient,
  filters: SearchFilters,
  options: SearchOptions = {}
): Promise<Patient[]> {
  const searchParams: any = {};

  // Existing filters...

  // ADD THIS:
  if (filters.registrationNumber?.trim()) {
    searchParams.identifier = `http://medimind.ge/identifiers/registration-number|${filters.registrationNumber.trim()}`;
  }

  // ...
}
```

3. **Update Form** (`PatientSearchForm.tsx` or `PatientListView.tsx`):
```tsx
<TextInput
  label={t('registration.search.registrationNumber' as any) || 'რეგისტრაცია ნომერი'}
  placeholder="99091"
  value={filters.registrationNumber || ''}
  onChange={(e) => handleFilterChange('registrationNumber', e.target.value)}
  onKeyPress={handleKeyPress}
/>
```

4. **Add Translation** (`packages/app/src/emr/translations/ka.json`):
```json
{
  "registration": {
    "search": {
      "registrationNumber": "რეგისტრაცია ნომერი"
    }
  }
}
```

**Testing**:
- [ ] Field appears in search form
- [ ] Search by registration number returns correct patient
- [ ] Combined with other filters works correctly
- [ ] Translation shows Georgian text

---

#### Gap 3: No Table Search Highlighting

**Current State**:
- Table shows results in plain white rows
- All data looks the same
- Hard to see which rows matched search

**Original EMR**:
- Matched rows have **light green background** (#c6efce)
- Matched cells (e.g., personal ID) also highlighted
- Clear visual feedback on search results

**Impact**: 🔴 **HIGH**
- Users can't quickly scan for search results
- Hard to verify search worked correctly
- Poor visual feedback

**Effort**: 🟡 **MEDIUM**
- Update `PatientTable.tsx` to accept `searchFilters` prop
- Add conditional styling logic
- Create matching helper functions

**Solution**:

1. **Update Props** (`packages/app/src/emr/components/registration/PatientTable.tsx`):
```tsx
interface PatientTableProps {
  patients: Patient[];
  searchFilters?: SearchFilters; // NEW
  highlightMatches?: boolean; // NEW
  onEdit?: (patientId: string) => void;
  onDelete?: (patientId: string) => void;
}
```

2. **Add Matching Logic**:
```tsx
/**
 * Check if patient matches any search filter
 */
function isMatchingPatient(patient: Patient, filters?: SearchFilters): boolean {
  if (!filters) return false;

  const firstName = patient.name?.[0]?.given?.[0]?.toLowerCase() || '';
  const lastName = patient.name?.[0]?.family?.toLowerCase() || '';
  const personalId = getIdentifierValue(patient, 'personal-id') || '';
  const regNumber = getIdentifierValue(patient, 'registration-number') || '';

  return (
    (filters.firstName && firstName.includes(filters.firstName.toLowerCase())) ||
    (filters.lastName && lastName.includes(filters.lastName.toLowerCase())) ||
    (filters.personalId && personalId.includes(filters.personalId)) ||
    (filters.registrationNumber && regNumber.includes(filters.registrationNumber))
  );
}

/**
 * Check if specific field matches search
 */
function isMatchingField(value: string, searchValue?: string): boolean {
  if (!searchValue || !value) return false;
  return value.toLowerCase().includes(searchValue.toLowerCase());
}
```

3. **Apply Conditional Styling**:
```tsx
<Table.Tr
  style={{
    backgroundColor:
      highlightMatches && isMatchingPatient(patient, searchFilters)
        ? '#c6efce' // Light green
        : 'transparent',
  }}
>
  {/* Registration Number */}
  <Table.Td
    style={{
      backgroundColor:
        highlightMatches &&
        isMatchingField(getRegistrationNumber(patient), searchFilters?.registrationNumber)
          ? '#c6efce'
          : 'inherit',
      fontWeight:
        highlightMatches &&
        isMatchingField(getRegistrationNumber(patient), searchFilters?.registrationNumber)
          ? 600
          : 400,
    }}
  >
    {getRegistrationNumber(patient)}
  </Table.Td>

  {/* Personal ID */}
  <Table.Td
    style={{
      backgroundColor:
        highlightMatches && isMatchingField(getPersonalId(patient), searchFilters?.personalId)
          ? '#c6efce'
          : 'inherit',
      fontWeight:
        highlightMatches && isMatchingField(getPersonalId(patient), searchFilters?.personalId)
          ? 600
          : 400,
    }}
  >
    {getPersonalId(patient)}
  </Table.Td>

  {/* ... other cells ... */}
</Table.Tr>
```

4. **Update Usage**:
```tsx
// In UnifiedRegistrationView.tsx
<PatientTable
  patients={searchResults}
  searchFilters={currentSearchFilters}
  highlightMatches={true}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

**Testing**:
- [ ] Matching rows show light green background
- [ ] Matching cells (personal ID, reg number) highlighted
- [ ] Multiple matches highlighted correctly
- [ ] Highlighting disappears when search cleared
- [ ] No highlighting when `highlightMatches={false}`

---

### 🟡 MEDIUM PRIORITY GAPS (Enhanced UX)

#### Gap 4: Simple Phone Input vs. International Phone Component

**Current State**:
```tsx
<TextInput
  label="Phone"
  placeholder="+995555123456"
  type="tel"
  {...form.getInputProps('phoneNumber')}
/>
```
- Simple text input
- No country code dropdown
- No auto-formatting
- User must type full international format

**Original EMR**:
```
┌─────────────────────────────┐
│ [🇬🇪 +995 ▼] [555 12 34 56] │
└─────────────────────────────┘
```
- Country flag icon and dropdown
- Separate country code prefix
- Auto-formatted phone number (spaces)
- Default: Georgia (+995)

**Impact**: 🟡 **MEDIUM**
- Less user-friendly for international numbers
- No visual feedback on country
- No auto-formatting (harder to read)
- Not matching original UX

**Effort**: 🟡 **MEDIUM**
- Install library or create custom component
- Update PatientForm integration
- Test with multiple countries
- Ensure FHIR value format correct

**Solution Options**:

**Option A: Use Library (Recommended)**

Install `react-international-phone`:
```bash
npm install react-international-phone --workspace=@medplum/app
```

Create wrapper component:
```tsx
// packages/app/src/emr/components/registration/InternationalPhoneInput.tsx
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

interface InternationalPhoneInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  defaultCountry?: string;
}

export function InternationalPhoneInput({
  label,
  value,
  onChange,
  error,
  required,
  defaultCountry = 'ge', // Georgia
}: InternationalPhoneInputProps): JSX.Element {
  return (
    <Box>
      <Text size="sm" fw={500} mb={4}>
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </Text>
      <PhoneInput
        defaultCountry={defaultCountry}
        value={value}
        onChange={onChange}
        placeholder="555 12 34 56"
        style={{
          '--react-international-phone-height': '36px',
          '--react-international-phone-border-color': error ? '#fa5252' : '#ced4da',
        }}
      />
      {error && (
        <Text size="xs" c="red" mt={4}>
          {error}
        </Text>
      )}
    </Box>
  );
}
```

**Option B: Custom Component**

Create custom with country dropdown + formatted input (more work).

**Integration in PatientForm.tsx**:
```tsx
<InternationalPhoneInput
  label={t('registration.patient.phone' as any)}
  value={form.values.phoneNumber || ''}
  onChange={(value) => form.setFieldValue('phoneNumber', value)}
  error={form.errors.phoneNumber}
  defaultCountry="ge"
/>
```

**Testing**:
- [ ] Default country is Georgia with flag 🇬🇪
- [ ] Dropdown shows all countries with flags
- [ ] Phone number auto-formats with spaces
- [ ] Value stored as full international format (+995555123456)
- [ ] Validation works per country
- [ ] Georgian text labels display correctly

---

#### Gap 5: Address Textarea vs. Single-line Input

**Current State**:
```tsx
<Textarea
  label="Address"
  minRows={2}
  {...form.getInputProps('address')}
/>
```
- Multi-line textarea
- Takes more vertical space

**Original EMR**:
```tsx
<TextInput
  label="მისამართი"
  {...}
/>
```
- Single-line text input
- More compact

**Impact**: 🟡 **LOW-MEDIUM**
- Different visual appearance
- Slightly different UX (no line breaks)
- Minor layout difference

**Effort**: 🟢 **TRIVIAL**
- Change component type

**Solution**:
```tsx
// In PatientForm.tsx
<TextInput  // Changed from Textarea
  label={t('registration.patient.address' as any)}
  placeholder={t('registration.placeholder.address' as any)}
  {...form.getInputProps('address')}
  aria-label={t('registration.patient.address' as any)}
  mb="md"
/>
```

**Testing**:
- [ ] Single line input renders
- [ ] Can still enter long addresses
- [ ] Text doesn't wrap (scrolls horizontally)
- [ ] Form validation still works

---

#### Gap 6: Simple Submit Button vs. Dropdown Button

**Current State**:
```tsx
<Button type="submit" loading={loading}>
  {t('registration.patient.submit' as any)}
</Button>
```
- Simple submit button
- One action only

**Original EMR**:
```
┌──────────────────┐
│ დამატება      ▼ │  ← Dropdown arrow
└──────────────────┘

Menu:
- შენახვა (Save)
- შენახვა და გაგრძელება (Save and Continue)
- შენახვა და ახალი (Save and New)
- შენახვა და ნახვა (Save and View)
```

**Impact**: 🟡 **MEDIUM**
- Missing workflow flexibility
- Users can't quickly do "Save and New"
- Not matching original power-user feature

**Effort**: 🟡 **MEDIUM**
- Create dropdown button component
- Handle different save actions
- Update form submission logic

**Solution**:

1. **Create Component** (`packages/app/src/emr/components/registration/SubmitDropdownButton.tsx`):
```tsx
import { Button, Menu } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';

export type SubmitAction = 'save' | 'saveAndContinue' | 'saveAndNew' | 'saveAndView';

interface SubmitDropdownButtonProps {
  onSubmit: (action: SubmitAction) => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
}

export function SubmitDropdownButton({
  onSubmit,
  loading = false,
  disabled = false,
  label = 'დამატება',
}: SubmitDropdownButtonProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <Menu position="bottom-end" shadow="md">
      <Menu.Target>
        <Button
          rightSection={<IconChevronDown size={16} />}
          loading={loading}
          disabled={disabled}
          style={{
            background: 'linear-gradient(90deg, #138496, #17a2b8, #20c4dd)',
            color: 'white',
          }}
          onClick={() => onSubmit('save')} // Default action
        >
          {label}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item onClick={() => onSubmit('save')}>
          {t('registration.submit.save' as any) || 'შენახვა'}
        </Menu.Item>
        <Menu.Item onClick={() => onSubmit('saveAndContinue')}>
          {t('registration.submit.saveAndContinue' as any) || 'შენახვა და გაგრძელება'}
        </Menu.Item>
        <Menu.Item onClick={() => onSubmit('saveAndNew')}>
          {t('registration.submit.saveAndNew' as any) || 'შენახვა და ახალი'}
        </Menu.Item>
        <Menu.Item onClick={() => onSubmit('saveAndView')}>
          {t('registration.submit.saveAndView' as any) || 'შენახვა და ნახვა'}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
```

2. **Update PatientForm.tsx**:
```tsx
interface PatientFormProps {
  onSubmit: (values: PatientFormValues, action: SubmitAction) => void; // Updated
  // ...
}

export function PatientForm({ onSubmit, ... }: PatientFormProps) {
  const handleSubmit = (action: SubmitAction) => {
    form.onSubmit((values) => {
      onSubmit(values, action);
    })();
  };

  return (
    <Box component="form">
      {/* ... fields ... */}

      <Group justify="flex-end" mt="xl">
        <SubmitDropdownButton
          onSubmit={handleSubmit}
          loading={loading}
          label={t('registration.patient.submit' as any)}
        />
      </Group>
    </Box>
  );
}
```

3. **Handle Actions in View**:
```tsx
// In UnifiedRegistrationView.tsx
const handleSubmit = async (values: PatientFormValues, action: SubmitAction) => {
  const patient = await createPatient(medplum, values);

  switch (action) {
    case 'save':
      // Stay on page
      break;
    case 'saveAndContinue':
      // Navigate to edit mode
      navigate(`/emr/registration/edit/${patient.id}`);
      break;
    case 'saveAndNew':
      // Clear form
      form.reset();
      break;
    case 'saveAndView':
      // Navigate to patient detail
      navigate(`/emr/patient-history/patient-card/${patient.id}`);
      break;
  }
};
```

**Testing**:
- [ ] Button shows dropdown arrow
- [ ] Clicking button (not arrow) triggers default save
- [ ] Clicking arrow opens menu
- [ ] Each menu item triggers correct action
- [ ] "Save and New" clears form
- [ ] "Save and View" navigates to patient detail
- [ ] Loading state disables button and menu

---

#### Gap 7: Missing Last Name in Search Form

**Current State**:
- Search has First Name field
- **No Last Name field** (searches both in single field?)

**Original EMR**:
- Separate სახელი (First Name) field
- Separate გვარი (Last Name) field

**Impact**: 🟡 **LOW-MEDIUM**
- Less precise search
- Can't search by last name only
- Not matching original granularity

**Effort**: 🟢 **TRIVIAL**
- Already implemented in `PatientListView.tsx`
- Just needs to appear in `PatientSearchForm.tsx`

**Solution**:
Already exists! Just ensure layout matches:
```tsx
<Grid.Col span={{ base: 12, sm: 6 }}>
  <TextInput
    label={t('registration.search.firstName' as any) || 'სახელი'}
    value={filters.firstName}
    onChange={(e) => handleFilterChange('firstName', e.target.value)}
  />
</Grid.Col>
<Grid.Col span={{ base: 12, sm: 6 }}>
  <TextInput
    label={t('registration.search.lastName' as any) || 'გვარი'}
    value={filters.lastName}
    onChange={(e) => handleFilterChange('lastName', e.target.value)}
  />
</Grid.Col>
```

**Testing**:
- [ ] Both first name and last name fields visible
- [ ] Search by first name only works
- [ ] Search by last name only works
- [ ] Combined search works (firstName AND lastName)

---

#### Gap 8: Search Button Icon vs. Text

**Current State**:
```tsx
<Button leftSection={<IconSearch size={18} />} onClick={handleSearch}>
  Search
</Button>
```
- Button with text label
- Icon on left

**Original EMR**:
```
     [ 🔍 ]
   (centered icon button)
```
- Icon-only button
- Centered below fields
- No text label

**Impact**: 🟢 **LOW**
- Visual difference only
- Functionality identical

**Effort**: 🟢 **TRIVIAL**

**Solution**:
```tsx
<Group justify="center">
  <ActionIcon
    size="xl"
    variant="filled"
    color="gray"
    onClick={handleSearch}
    loading={loading}
    aria-label={t('registration.search.button' as any) || 'Search'}
  >
    <IconSearch size={24} />
  </ActionIcon>
</Group>
```

**Testing**:
- [ ] Icon button centered
- [ ] Triggers search on click
- [ ] Shows loading state
- [ ] Accessible (aria-label)

---

### 🟢 LOW PRIORITY GAPS (Visual Polish)

#### Gap 9: Turquoise Theme vs. Mantine Blue

**Current State**:
- Mantine default blue theme (#228be6)
- Blue buttons, blue active states

**Original EMR**:
- Turquoise gradient (#138496 → #17a2b8 → #20c4dd)
- Table headers: turquoise gradient
- Submit button: turquoise gradient
- Active states: turquoise

**Impact**: 🟢 **LOW**
- Visual branding difference
- Not affecting functionality

**Effort**: 🟢 **LOW**
- Update CSS variables
- Apply to components

**Solution**:

1. **Update Theme** (`packages/app/src/emr/styles/theme.css`):
```css
:root {
  /* Turquoise color system */
  --emr-turquoise-dark: #138496;
  --emr-turquoise-primary: #17a2b8;
  --emr-turquoise-light: #20c4dd;
  --emr-turquoise-gradient: linear-gradient(90deg, #138496 0%, #17a2b8 50%, #20c4dd 100%);

  /* Highlight colors */
  --emr-highlight-green: #c6efce;
  --emr-bg-light-gray: #f8f9fa;
}
```

2. **Apply to Components**:
```tsx
// PatientTable.tsx - Header
<Table.Thead
  style={{
    background: 'var(--emr-turquoise-gradient)',
    color: 'white',
  }}
>
  {/* ... */}
</Table.Thead>

// SubmitDropdownButton.tsx - Button
<Button
  style={{
    background: 'var(--emr-turquoise-gradient)',
    color: 'white',
  }}
>
  {/* ... */}
</Button>
```

**Testing**:
- [ ] Table headers use turquoise gradient
- [ ] Submit button uses turquoise gradient
- [ ] Active states use turquoise
- [ ] Consistent across all registration components

---

#### Gap 10: Section Headers Styling

**Current State**:
- Mantine Title components
- Default styling

**Original EMR**:
- Light gray background (#f1f3f5)
- Bold text
- Padding
- "პაციენტის მოძებნა" and "პაციენტის დამატება"

**Impact**: 🟢 **LOW**
- Visual difference
- Affects clarity

**Effort**: 🟢 **TRIVIAL**

**Solution**:
```tsx
<Box
  style={{
    backgroundColor: 'var(--emr-bg-light-gray)',
    padding: '12px 16px',
    borderRadius: '4px 4px 0 0',
    marginBottom: '16px',
  }}
>
  <Text size="md" fw={700}>
    {t('registration.search.title' as any) || 'პაციენტის მოძებნა'}
  </Text>
</Box>
```

**Testing**:
- [ ] Section headers have light gray background
- [ ] Text is bold
- [ ] Proper padding and spacing
- [ ] Matches original visual design

---

#### Gap 11: Unknown Action Buttons (H, Q)

**Current State**:
- No action buttons in top-right corner

**Original EMR**:
- Two icon buttons: "H" and "Q"
- Top-right corner of view
- Purpose unknown (need clarification)

**Impact**: 🟢 **LOW**
- Missing feature (unknown purpose)
- Could be important

**Effort**: 🟡 **UNKNOWN** (depends on functionality)

**Recommendations**:
1. **Identify functionality** by asking users or checking original system
2. Possible meanings:
   - **H**: Help, History, Home
   - **Q**: Query, Quick Actions, Queue
3. **Placeholder implementation**:
```tsx
<Group gap="xs" style={{ position: 'absolute', top: '16px', right: '16px' }}>
  <Tooltip label="Help">
    <ActionIcon variant="subtle" size="lg">
      <IconHelp size={20} />
    </ActionIcon>
  </Tooltip>
  <Tooltip label="Quick Actions">
    <ActionIcon variant="subtle" size="lg">
      <IconBolt size={20} />
    </ActionIcon>
  </Tooltip>
</Group>
```

**Next Steps**:
- **User interview**: Ask what H and Q buttons do
- **Document**: Record functionality
- **Implement**: Based on findings

---

## Implementation Roadmap

### Week 1: Critical Foundation (HIGH Priority)

**Goal**: Achieve unified layout with all core features

#### Day 1-2: Unified Layout
- [ ] Create `UnifiedRegistrationView.tsx`
- [ ] Extract `PatientSearchForm.tsx` from `PatientListView.tsx`
- [ ] Implement 2-column layout (35% left, 65% right)
- [ ] Add patient table below (100% width)
- [ ] Update routing (`AppRoutes.tsx`)
- [ ] Write tests for unified view

#### Day 3: Registration Number Search
- [ ] Add `registrationNumber` to `SearchFilters` type
- [ ] Update `searchPatients()` function
- [ ] Add field to search form
- [ ] Add Georgian translation
- [ ] Test search functionality

#### Day 4-5: Table Search Highlighting
- [ ] Update `PatientTable` props (`searchFilters`, `highlightMatches`)
- [ ] Implement `isMatchingPatient()` helper
- [ ] Implement `isMatchingField()` helper
- [ ] Apply conditional row/cell styling (light green #c6efce)
- [ ] Test highlighting with various filters
- [ ] Test clearing highlights

**Deliverable**: Functional unified registration page with search highlighting

---

### Week 2: Enhanced UX (MEDIUM Priority)

**Goal**: Add advanced components and improve user experience

#### Day 6-7: International Phone Input
- [ ] Research library: `react-international-phone` vs. custom
- [ ] Install chosen library
- [ ] Create `InternationalPhoneInput.tsx` wrapper
- [ ] Integrate into `PatientForm.tsx`
- [ ] Test with multiple countries
- [ ] Verify FHIR value format

#### Day 8: Form Improvements
- [ ] Change address from Textarea to TextInput
- [ ] Verify Last Name field in search form
- [ ] Update search button to icon-only
- [ ] Test form layout and spacing

#### Day 9-10: Submit Dropdown Button
- [ ] Create `SubmitDropdownButton.tsx`
- [ ] Implement dropdown menu (4 options)
- [ ] Update `PatientForm` to handle actions
- [ ] Implement action logic in view (save/continue/new/view)
- [ ] Add Georgian translations for menu items
- [ ] Test all submit actions

**Deliverable**: Enhanced registration with international phone and multi-action submit

---

### Week 3: Visual Polish (LOW Priority)

**Goal**: Match original EMR visual design exactly

#### Day 11-12: Turquoise Theme
- [ ] Update CSS variables in `theme.css`
- [ ] Apply gradient to table headers
- [ ] Apply gradient to submit button
- [ ] Update active states to turquoise
- [ ] Verify consistent branding

#### Day 13: Visual Refinements
- [ ] Add section header styling (light gray background)
- [ ] Adjust typography (font sizes, weights)
- [ ] Fine-tune spacing and padding
- [ ] Match border styles

#### Day 14: Final Testing
- [ ] Visual comparison with original screenshot
- [ ] Comprehensive integration testing
- [ ] Accessibility audit (keyboard nav, screen readers)
- [ ] Georgian text rendering verification
- [ ] Performance testing (table rendering)

**Deliverable**: Pixel-perfect registration matching original EMR

---

### Week 4: Documentation & Polish

#### Day 15: Unknown Features
- [ ] Identify H and Q button functionality (user interview)
- [ ] Document findings
- [ ] Implement if critical, defer if not

#### Day 16-17: Comprehensive Testing
- [ ] Unit tests for all new components
- [ ] Integration tests for unified workflow
- [ ] E2E tests for complete registration flow
- [ ] Test all 3 languages (ka, en, ru)
- [ ] Test responsive design (mobile, tablet, desktop)

#### Day 18: Documentation
- [ ] Update quickstart guide
- [ ] Document new components
- [ ] Create developer guide for customization
- [ ] Record demo video

#### Day 19-20: User Acceptance Testing (UAT)
- [ ] Deploy to staging environment
- [ ] User testing with front desk staff
- [ ] Collect feedback
- [ ] Fix critical issues
- [ ] Final adjustments

**Deliverable**: Production-ready registration system

---

## Testing Checklist

### Unit Tests (per component)

**UnifiedRegistrationView**:
- [ ] Renders both search and registration forms
- [ ] Table updates when search submitted
- [ ] Patient added to table after registration
- [ ] No navigation on registration
- [ ] Responsive layout (stacks on mobile)

**PatientSearchForm**:
- [ ] All fields render correctly
- [ ] Search triggers with correct filters
- [ ] Registration number field works
- [ ] Keyboard shortcuts (Enter, Escape)
- [ ] Georgian labels display

**PatientTable**:
- [ ] Highlights matching rows (light green)
- [ ] Highlights matching cells (personal ID, reg number)
- [ ] No highlights when `highlightMatches=false`
- [ ] Edit/delete actions work
- [ ] Responsive on mobile

**InternationalPhoneInput**:
- [ ] Default country is Georgia
- [ ] Dropdown shows all countries
- [ ] Auto-formats phone number
- [ ] Value stored correctly
- [ ] Validation works per country

**SubmitDropdownButton**:
- [ ] Default action on click
- [ ] Dropdown opens on arrow click
- [ ] All menu items trigger correct actions
- [ ] Loading state disables interactions
- [ ] Georgian menu items display

### Integration Tests

**Complete Registration Flow**:
- [ ] User searches for patient → results appear
- [ ] User clicks search result → patient loads
- [ ] User registers new patient → appears in table
- [ ] Duplicate detection works
- [ ] Minor registration triggers representative form
- [ ] Submit actions work correctly

**Search Highlighting**:
- [ ] Search by personal ID → cell highlighted
- [ ] Search by registration number → cell highlighted
- [ ] Search by name → row highlighted
- [ ] Multiple filters → correct highlighting
- [ ] Clear search → highlights disappear

**Phone Input**:
- [ ] Select country → prefix updates
- [ ] Enter phone → auto-formats
- [ ] Submit form → value stored correctly
- [ ] Edit patient → phone loads correctly

### E2E Tests

**Scenario 1: Quick Registration**:
1. Navigate to /emr/registration/receiver
2. Fill required fields (name, gender)
3. Click "დამატება"
4. Patient appears in table
5. Success notification shown

**Scenario 2: Search and Edit**:
1. Enter personal ID in search
2. Click search icon
3. Matching row highlighted
4. Click edit icon
5. Update patient
6. Changes reflected in table

**Scenario 3: International Patient**:
1. Fill registration form
2. Select different country (e.g., USA)
3. Enter US phone number
4. Submit
5. Verify stored as +1XXXXXXXXXX

**Scenario 4: Minor with Representative**:
1. Fill patient form
2. Enter birth date (age < 18)
3. Representative form appears
4. Fill representative info
5. Submit
6. Both Patient and RelatedPerson created

---

## Metrics for Success

### Functional Metrics

| Metric | Target | Current | Gap |
|--------|--------|---------|-----|
| Pages required for registration | 1 | 2 | -1 |
| Fields in search form | 4 | 3 | -1 |
| Submit action options | 4 | 1 | -3 |
| Phone input countries supported | 250 | 1 | -249 |
| Table search highlighting | Yes | No | Missing |

### UX Metrics

| Metric | Target | Current | Gap |
|--------|--------|---------|-----|
| Clicks to register new patient | 1 | 3 | -2 |
| Clicks to search and view | 1 | 2 | -1 |
| Fields visible simultaneously | 18 | 9 | -9 |
| Navigation during workflow | 0 | 2 | -2 |

### Visual Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Color scheme match | 100% | 50% | 🔴 Mismatch |
| Layout match | 100% | 40% | 🔴 Separate pages |
| Typography match | 100% | 80% | 🟡 Minor diffs |
| Component match | 100% | 70% | 🟡 Missing phone |

---

## Risk Assessment

### High Risk

1. **Unified Layout State Management** (Gap 1)
   - **Risk**: Complex state coordination between search, form, table
   - **Mitigation**: Use React Context or state management library
   - **Fallback**: Keep current separate pages if integration too complex

2. **International Phone Component** (Gap 4)
   - **Risk**: Library compatibility issues, Georgian language support
   - **Mitigation**: Test thoroughly with all 3 languages
   - **Fallback**: Keep simple text input, add country field separately

### Medium Risk

3. **Table Search Highlighting** (Gap 3)
   - **Risk**: Performance with large patient lists
   - **Mitigation**: Implement pagination, limit results to 100
   - **Fallback**: Highlight rows only, not individual cells

4. **Submit Dropdown Actions** (Gap 6)
   - **Risk**: Complex navigation logic for each action
   - **Mitigation**: Clear action handlers, comprehensive testing
   - **Fallback**: Simple submit button with checkbox options

### Low Risk

5. **Visual Theme Changes** (Gap 9-10)
   - **Risk**: CSS conflicts with Mantine theme
   - **Mitigation**: Use CSS variables, scoped styles
   - **Fallback**: Accept minor visual differences

---

## Conclusion

The current FHIR registration implementation has **excellent data model and backend integration** but requires **significant UX restructuring** to match the original EMR. The primary gap is architectural (unified page vs. separate pages), which is achievable in 2-3 weeks.

### Recommended Approach

1. **Week 1**: Focus on unified layout (HIGH priority) - this is the biggest user-facing change
2. **Week 2**: Add enhanced components (MEDIUM priority) - improves usability
3. **Week 3**: Visual polish (LOW priority) - matches original branding
4. **Week 4**: Testing and UAT - ensures quality

### Alternative Approach (If Resources Limited)

If full implementation is not feasible, prioritize:
1. **Unified Layout** (Gap 1) - Most impactful
2. **Registration Number Search** (Gap 2) - Quick win
3. **Table Highlighting** (Gap 3) - Visual feedback
4. Defer international phone and dropdown button to Phase 2

### Success Criteria

✅ Users can search and register on one page
✅ Registration number search works
✅ Table highlights search results
✅ Visual design matches original (turquoise theme)
✅ All tests passing (unit, integration, E2E)
✅ Georgian text renders correctly
✅ Performance acceptable (< 2s page load)

---

**Next Steps**: Review this plan with team, assign tasks, begin Week 1 implementation.

**Document Version**: 1.0
**Last Updated**: 2025-11-13
**Status**: Ready for Implementation
