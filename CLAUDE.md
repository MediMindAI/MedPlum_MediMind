# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Medplum monorepo** - a healthcare developer platform that enables FHIR-based healthcare application development. Medplum provides authentication, clinical data repository (CDR), FHIR API, SDK, web app, bots, and React UI components.

**Tech Stack:**
- TypeScript (full-stack)
- Node.js (backend)
- React 19 (frontend)
- PostgreSQL (data storage)
- Redis (background jobs & caching)
- Express (API server)
- Turborepo (monorepo orchestration)

## Monorepo Structure

```
packages/
├── core            # Core FHIR client library (browser & Node.js compatible)
├── server          # Backend Express API server with FHIR endpoints
├── app             # Main Medplum web application (Vite + React)
├── react           # Reusable React component library
├── react-hooks     # React hooks for Medplum operations
├── fhirtypes       # TypeScript definitions for FHIR resources
├── definitions     # FHIR data definitions and schemas
├── mock            # Mock FHIR data for testing
└── [others]        # Additional packages
```

## Development Commands

### Initial Setup
```bash
npm install                    # Install all dependencies
docker-compose up              # Start PostgreSQL + Redis
```

### Building
```bash
npm run build                  # Build all packages except docs and examples
npm run build:fast             # Build only app and server (faster)
npm run clean                  # Clean all build artifacts
```

### Testing
```bash
npm test                       # Run all tests across packages
cd packages/app && npm test -- emr  # Run EMR tests
npm test -- --watch registration    # Watch mode for registration
```

### Linting
```bash
npm run lint                   # Lint all packages
npm run lint:fix              # Lint and auto-fix issues
```

## Key Architecture Patterns

### FHIR Resource Handling
- All data operations follow FHIR R4 specification
- Resources are strongly typed using `@medplum/fhirtypes`
- `MedplumClient` (from `@medplum/core`) is the primary API client
- Server implements full FHIR REST API with search, CRUD, and operations

### Authentication & Authorization
- OAuth 2.0 / OpenID Connect / SMART-on-FHIR
- Project-based access control with AccessPolicy resources
- JWT-based authentication

### Data Layer
- PostgreSQL stores all FHIR resources as JSONB
- Redis used for caching, rate limiting, and background jobs (BullMQ)
- Custom search implementation supporting FHIR search parameters

### React Components
- Mantine UI component library for styling
- Component library in `packages/react/` provides FHIR-aware components
- Each component typically has: `ComponentName.tsx`, `ComponentName.test.tsx`, `ComponentName.stories.tsx`
- Custom hooks in `packages/react-hooks/` for common operations

## Important Conventions

### Code Organization
- Each package has `src/` for source code and `dist/` for build output
- Tests colocated with source: `filename.test.ts` next to `filename.ts`
- TypeScript strict mode enabled across all packages
- ESM modules used throughout (type: "module" in package.json)

### UI Component Reuse (CRITICAL)
**When we add UI elements that repeat between pages, either reuse an existing shared component or refactor the repeated markup into a shared component before finishing the task.**

This means:
- Before creating new UI elements, check if similar components already exist
- If you find yourself copying UI code between pages, extract it into a shared component
- Place shared components in appropriate locations:
  - EMR-specific: `packages/app/src/emr/components/`
  - App-wide: `packages/app/src/components/`
  - Cross-package: `packages/react/src/`
- This ensures consistency, reduces maintenance burden, and prevents code duplication

### Theme Colors Only (CRITICAL)
**When building UI components, ALWAYS use theme colors defined in `packages/app/src/emr/styles/theme.css`. NEVER hardcode color values directly in components.**

This means:
- Use CSS custom properties: `var(--emr-primary)`, `var(--emr-secondary)`, `var(--emr-accent)`, etc.
- Reference theme gradients: `var(--emr-gradient-primary)`, `var(--emr-gradient-submenu)`
- For Mantine components, use theme tokens or CSS variables
- Check `theme.css` for available colors before adding any new color
- If a new color is needed, add it to `theme.css` first with proper naming convention
- This ensures visual consistency across the entire EMR system

### Testing Patterns
- Jest for unit/integration tests
- `@medplum/mock` provides MockClient for testing without a server
- Use `MemoryRouter` for route testing
- Clear `localStorage` in `beforeEach` blocks

### Mobile-First Development (CRITICAL)
**All UI components MUST be built with mobile-first responsive design. Every component should work flawlessly on mobile devices before being enhanced for larger screens.**

#### Core Principles
- **Mobile-First CSS**: Write styles for mobile first, then use `@media (min-width: ...)` for larger screens
- **Touch-Friendly**: All interactive elements must be at least 44x44px (Apple's minimum tap target)
- **Responsive Layouts**: Use flexbox/grid with `flex-wrap`, avoid fixed widths
- **Viewport Units**: Use `vw`, `vh`, `dvh` for full-screen layouts
- **Font Scaling**: Use `rem` units, minimum 16px base font size for readability

#### Mantine Responsive Utilities
```typescript
// Use Mantine's responsive props (preferred)
<Grid>
  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>Content</Grid.Col>
</Grid>

<Stack gap={{ base: 'xs', sm: 'md', lg: 'xl' }}>
  <Box p={{ base: 'sm', md: 'lg' }}>Responsive padding</Box>
</Stack>

// Use useMediaQuery hook for conditional rendering
import { useMediaQuery } from '@mantine/hooks';

function MyComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  return isMobile ? <MobileView /> : <DesktopView />;
}
```

#### Required Breakpoints
```css
/* Mobile First Breakpoints */
--breakpoint-xs: 576px;   /* Small phones */
--breakpoint-sm: 768px;   /* Tablets portrait */
--breakpoint-md: 992px;   /* Tablets landscape */
--breakpoint-lg: 1200px;  /* Desktops */
--breakpoint-xl: 1400px;  /* Large desktops */
```

#### Component Guidelines
1. **Forms**:
   - Stack form fields vertically on mobile (single column)
   - Use `size="md"` or larger for inputs (better touch targets)
   - Labels above inputs, not inline
   - Submit buttons full-width on mobile
   ```typescript
   <TextInput
     size="md"
     style={{ minHeight: '44px' }}
   />
   <Button fullWidth={isMobile} size="md">Submit</Button>
   ```

2. **Tables**:
   - Horizontal scroll wrapper on mobile: `<Box style={{ overflowX: 'auto' }}>`
   - Consider card-based layout for mobile instead of tables
   - Minimum column width to prevent text cramping
   - Sticky first column for identification
   ```typescript
   <Box style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
     <Table style={{ minWidth: '600px' }}>...</Table>
   </Box>
   ```

3. **Navigation**:
   - Hamburger menu or bottom navigation on mobile
   - Horizontal tabs should scroll or collapse on mobile
   - Ensure clickable areas are large enough (44px min)

4. **Modals**:
   - Full-screen on mobile: `fullScreen={isMobile}`
   - Proper padding for safe areas (notch, home indicator)
   - Close button easily accessible

5. **Typography**:
   - Minimum 16px font size (prevents iOS zoom on input focus)
   - Line height at least 1.5 for readability
   - Adequate contrast ratios (WCAG AA: 4.5:1)

#### Testing Requirements
- **Test on actual devices** or Chrome DevTools device emulation
- Test these viewport sizes: 320px, 375px, 414px, 768px, 1024px, 1440px
- Test landscape and portrait orientations
- Test touch interactions (tap, swipe, pinch)
- Test with on-screen keyboard visible
- Verify no horizontal scrolling on body

#### Performance Optimization for Mobile
- Lazy load images: `loading="lazy"`
- Use `will-change` sparingly for animations
- Avoid heavy JavaScript on initial load
- Minimize layout shifts (CLS)
- Touch event handlers should be passive: `{ passive: true }`

#### Example Mobile-First Component
```typescript
import { Box, Stack, TextInput, Button, Grid } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

export function ResponsiveForm() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Box p={{ base: 'sm', md: 'lg' }}>
      <Grid gutter={{ base: 'xs', md: 'md' }}>
        {/* Full width on mobile, half on desktop */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            label="First Name"
            size="md" // Touch-friendly size
            styles={{ input: { minHeight: '44px' } }}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            label="Last Name"
            size="md"
            styles={{ input: { minHeight: '44px' } }}
          />
        </Grid.Col>
      </Grid>

      <Button
        mt="md"
        size="md"
        fullWidth={isMobile} // Full width only on mobile
      >
        Submit
      </Button>
    </Box>
  );
}
```

#### Common Mobile Issues to Avoid
- ❌ Fixed pixel widths (use %, vw, or fr units)
- ❌ Hover-only interactions (no hover on touch devices)
- ❌ Small tap targets (< 44px)
- ❌ Horizontal scrolling on body
- ❌ Text too small to read (< 16px)
- ❌ Forms that break with on-screen keyboard
- ❌ Unoptimized images causing slow load
- ❌ Blocking touch events with JavaScript

## EMR UI Layout Feature

### Overview
The EMR UI Layout provides a modern **4-row horizontal navigation system** with multilingual (Georgian/English/Russian) support for healthcare workflows. The layout completely removes the Medplum AppShell on EMR routes, implementing a custom navigation hierarchy. Located in `packages/app/src/emr/`.

### Recent Updates (Updated: 2025-11-12)

**Major Restructuring Complete:**
- ✅ Transformed from sidebar-based layout to **4-row horizontal navigation**
- ✅ Medplum AppShell conditionally hidden on `/emr` routes (App.tsx updated)
- ✅ Global theme system with CSS custom properties (`styles/theme.css`)
- ✅ New **turquoise gradient horizontal sub-menu tabs** (Row 3 - CRITICAL component)
- ✅ Blue gradient active states for main menu items
- ✅ **187 tests passing** across all EMR components

### 4-Row Layout Architecture

```
┌─────────────────────────────────────────────┐
│ Row 1: TopNavBar (40px, gray #e9ecef)      │
├─────────────────────────────────────────────┤
│ Row 2: MainMenu + LanguageSelector (50px)  │
├─────────────────────────────────────────────┤
│ Row 3: HorizontalSubMenu (45px, turquoise) │ ← Conditional (Registration & Patient History only)
├─────────────────────────────────────────────┤
│ Row 4+: Content Area (flex: 1)             │
└─────────────────────────────────────────────┘
```

### Key Components

#### Core Navigation Components
- **TopNavBar** (Row 1): Gray navigation bar with 5 nav items and user menu dropdown (20 tests passing)
- **EMRMainMenu** (Row 2 left): Horizontal main menu with 6 items - blue gradient active states (21 tests passing)
- **HorizontalSubMenu** (Row 3): **CRITICAL** - Turquoise gradient horizontal tabs with white 3px bottom border for active tab (35 tests passing)
- **LanguageSelector** (Row 2 right): Language switcher (ka/en/ru) with blue accent active state (19 tests passing)
- **ActionButtons**: Floating action buttons positioned top-right with blue gradient backgrounds (24 tests passing)

#### Layout Components
- **EMRPage**: Main layout coordinator - manages 4-row structure, conditionally shows HorizontalSubMenu (36 tests passing)
- **RegistrationSection**: Simplified wrapper - removed old sidebar logic (15 tests passing)
- **PatientHistorySection**: Simplified wrapper - removed old sidebar logic (17 tests passing)

### Theme System

**Global Theme:** `packages/app/src/emr/styles/theme.css`

**CSS Custom Properties:**
```css
/* Core Colors */
--emr-primary: #1a365d (dark navy blue)
--emr-secondary: #2b6cb0 (medium blue)
--emr-accent: #63b3ed (light blue)
--emr-turquoise: #17a2b8 (turquoise for sub-menu)

/* Gradients */
--emr-gradient-primary: linear-gradient(135deg, #1a365d → #2b6cb0 → #3182ce)
--emr-gradient-submenu: linear-gradient(90deg, #138496 → #17a2b8 → #20c4dd)

/* Layout Dimensions */
--emr-topnav-height: 40px
--emr-mainmenu-height: 50px
--emr-submenu-height: 45px
```

### File Structure
```
packages/app/src/emr/
├── EMRPage.tsx                    # Main 4-row layout coordinator
├── styles/theme.css               # Global EMR theme with CSS variables
├── types/                         # TypeScript interfaces (menu, translation, navigation)
├── translations/                  # Translation data (ka/en/ru)
│   ├── ka.json, en.json, ru.json
│   ├── translations.ts
│   └── menu-structure.ts          # Menu hierarchy & routing
├── components/
│   ├── TopNavBar/                 # Row 1: Gray nav bar
│   ├── EMRMainMenu/               # Row 2: Main menu
│   ├── HorizontalSubMenu/         # Row 3: Turquoise tabs
│   ├── LanguageSelector/          # Row 2: Language switcher
│   └── ActionButtons/             # Floating buttons
├── sections/
│   ├── RegistrationSection.tsx
│   └── PatientHistorySection.tsx
├── hooks/
│   ├── useTranslation.ts          # Multilingual support
│   └── useEMRNavigation.ts        # Navigation state management
└── views/                         # Sub-route view components
    ├── registration/              # 9 registration views
    └── patient-history/           # 13 patient history views
```

### Translation Pattern
```typescript
import { useTranslation } from '../hooks/useTranslation';

function MyComponent() {
  const { t, lang, setLang } = useTranslation();
  return <h1>{t('menu.registration')}</h1>;
}
```

### localStorage Keys
- `emrLanguage`: 'ka' | 'en' | 'ru' (user's language preference)

### Testing
- **Total: 187 tests passing** across all EMR components
- Use `MockClient` from `@medplum/mock`
- Use `MemoryRouter` for route testing
- Test all 3 languages to ensure layout doesn't break
- Test responsive design (mobile/tablet/desktop)

## FHIR Patient Registration System

### Overview
The FHIR Patient Registration System provides comprehensive patient registration functionality with FHIR R4 compliance, Georgian healthcare requirements, multilingual support (Georgian/English/Russian), and 250-country citizenship management.

**Feature Branch**: `004-fhir-registration-implementation`
**FHIR Resources**: Patient, RelatedPerson
**Languages**: Georgian (ka), English (en), Russian (ru)

### Recent Updates (Updated: 2025-11-13)

**Implementation Complete:**
- ✅ **Unified Registration Page** - Single page with search + registration + table (all-in-one)
- ✅ **Patient Edit (Modal + Route)** - Two editing pathways for flexibility
- ✅ **Duplicate Detection** - Personal ID duplicate checking
- ✅ **Representative Management** - FHIR RelatedPerson for minors
- ✅ **Citizenship Support** - 250 countries with translations
- ✅ **Form Validation** - Georgian ID (11-digit Luhn), email, birthdate
- ✅ **Comprehensive Tests** - 9/9 tests passing for PatientEditModal

**Phase 2 Enhancements (Complete):**
- ✅ **Unified Registration Layout** - Search (35% left) + Form (65% right) + Table (100% bottom)
- ✅ **InternationalPhoneInput** - Country flag dropdown with +995 default
- ✅ **SubmitDropdownButton** - 4 actions (Save, Save & Continue, Save & New, Save & View)
- ✅ **Turquoise Gradient Theme** - Applied to table headers and buttons
- ✅ **Section Headers** - Light gray background (#f8f9fa)

**Phase 3: Patient Editing (Complete - 2025-11-13):**
- ✅ **PatientEditModal** - Beautiful modal popup for quick edits from unified view
- ✅ **PatientEditView** - Full-page route-based editing at `/emr/registration/edit/:id`
- ✅ **Two Edit Pathways**:
  - **Modal** - Click pen icon → edit in popup → stay on unified view
  - **Route** - Direct URL navigation → full-page edit experience
- ✅ **Auto Table Refresh** - Patient table updates automatically after edit
- ✅ **All Translations Added** - 14 new keys in Georgian, English, Russian
- ✅ **Cleaned Routes** - Removed unused separate search/list/create pages

### File Structure

```
packages/app/src/emr/
├── views/registration/
│   ├── UnifiedRegistrationView.tsx      # Main page: search + form + table (all-in-one)
│   └── PatientEditView.tsx              # Full-page edit route (fallback for direct URLs)
├── components/registration/
│   ├── PatientForm.tsx                  # Main patient form (used for create & edit)
│   ├── PatientEditModal.tsx             # Modal popup for editing (Phase 3) ⭐ NEW
│   ├── PatientEditModal.test.tsx        # 9/9 tests passing ✅
│   ├── PatientTable.tsx                 # Patient list table with edit/delete actions
│   ├── PatientSearchForm.tsx            # Reusable search form
│   ├── RepresentativeForm.tsx           # Guardian form for minors
│   ├── DuplicateWarningModal.tsx        # Duplicate detection UI
│   ├── CitizenshipSelect.tsx            # 250-country dropdown
│   ├── RelationshipSelect.tsx           # 11 relationship types
│   ├── InternationalPhoneInput.tsx      # Phone input with country flags
│   └── SubmitDropdownButton.tsx         # Split submit button (4 actions)
├── services/
│   ├── patientService.ts                # Patient CRUD (create, read, update, delete, search)
│   ├── representativeService.ts         # RelatedPerson CRUD operations
│   ├── validators.ts                    # Georgian ID, email, birthdate validation
│   ├── citizenshipHelper.ts             # Country code utilities
│   └── fhirHelpers.ts                   # FHIR data extraction helpers
├── hooks/
│   ├── usePatientForm.ts                # Form state management with Mantine
│   └── usePatientSearch.ts              # Search, pagination, filtering
├── types/
│   └── registration.ts                  # TypeScript interfaces (PatientFormValues, etc.)
└── translations/
    ├── ka.json                          # Georgian translations (14 edit keys added)
    ├── en.json                          # English translations
    └── ru.json                          # Russian translations
```

### Routing

**Main Registration Route:**
- `/emr/registration` → **auto-redirects to** → `/emr/registration/registration`
- Shows `UnifiedRegistrationView` with search + registration form + patient table

**Active Routes:**
```typescript
/emr/registration                    // Redirects to /registration
/emr/registration/registration       // Main unified page (search + form + table)
/emr/registration/edit/:id          // Full-page edit (or opens in modal from main page)
/emr/registration/contracts         // Placeholder (not implemented)
/emr/registration/inpatient         // Placeholder (not implemented)
/emr/registration/debts             // Placeholder (not implemented)
/emr/registration/advances          // Placeholder (not implemented)
/emr/registration/archive           // Placeholder (not implemented)
/emr/registration/referrals         // Placeholder (not implemented)
/emr/registration/currency          // Placeholder (not implemented)
```

**Removed Routes (Cleaned Up):**
- ❌ `/emr/registration/list` - PatientListView (separate search page - not needed)
- ❌ `/emr/registration/create` - PatientRegistrationView (redundant - use unified view)
- ❌ `/emr/registration/unknown` - UnknownPatientView (emergency patient - not currently used)
- ❌ `/emr/registration/receiver` - Duplicate of registration route

### Key Features

#### Unified Registration Page
- **All-in-one interface** matching original EMR design
- **Left (35%)**: Search form with filters (name, personal ID, registration number)
- **Right (65%)**: New patient registration form
- **Bottom (100%)**: Patient table with results
- **No navigation** - everything happens on one page
- **Instant feedback** - new patients appear in table immediately after registration

#### Patient Editing (Two Pathways)
1. **Modal Editing (Recommended)**:
   - Click pen icon (✏️) in patient table
   - Modal popup opens with patient form
   - Edit fields and save
   - Table refreshes automatically
   - Stay on unified view - no navigation!

2. **Route-Based Editing (Alternative)**:
   - Direct URL: `/emr/registration/edit/{patientId}`
   - Full-page editing experience
   - Useful for deep linking or opening in new tab

#### Patient Search and List
- Searchable patient table with filters (name, personal ID, registration number)
- Pagination (20 patients per page)
- Sortable columns
- Edit/Delete actions per row
- Conditional highlighting for search matches (light green)

#### New Patient Registration
- Personal ID validation (11-digit Georgian ID with Luhn checksum)
- Required fields: firstName, lastName, gender
- Optional fields: personalId, birthDate, phone, email, address, citizenship, workplace
- International phone input with country flags (+995 default)
- Automatic registration number generation
- Duplicate detection by personal ID
- Minor detection (age < 18) triggers representative form
- 4 submit actions: Save, Save & Continue, Save & New, Save & View

#### Duplicate Detection
- Checks personal ID before registration
- Displays existing patient information in modal
- Actions: Open existing patient, Register anyway, Cancel
- Prevents accidental duplicate registrations

#### Representative Management
- Auto-shown for minors (age < 18)
- Relationship types: mother, father, sibling, grandparent, spouse, child, general relative
- Personal ID validation (optional for representatives)
- International phone input with country flags

#### Citizenship Support
- 250 countries and territories
- Multilingual: Georgian (ka), English (en), Russian (ru)
- Searchable dropdown
- ISO 3166-1 alpha-2 codes
- Translations in `translations/citizenship.json`

### Validation Rules

#### Georgian Personal ID (11-digit with Luhn checksum)
```typescript
export function validateGeorgianPersonalId(id: string): ValidationResult {
  if (id.length !== 11) {
    return { isValid: false, error: 'Personal ID must be exactly 11 digits' };
  }
  if (!/^\d{11}$/.test(id)) {
    return { isValid: false, error: 'Personal ID must contain only digits' };
  }
  if (!validateLuhnChecksum(id)) {
    return { isValid: false, error: 'Invalid personal ID checksum' };
  }
  return { isValid: true };
}
```

**Valid Examples:**
- `26001014632` (თენგიზი ხოზვრია)
- `01001011116` (Test ID from HL7 FHIR validator)

#### Email Validation (RFC 5322)
```typescript
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._+-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Invalid email format' };
  }
  return { isValid: true };
}
```

#### Birthdate Validation
- Cannot be in the future
- Cannot be more than 120 years ago

### Common Patterns

#### Creating a New Patient
```typescript
import { useMedplum } from '@medplum/react-hooks';
import { createPatient } from '@/emr/services/patientService';

const medplum = useMedplum();

const values: PatientFormValues = {
  personalId: '26001014632',
  firstName: 'თენგიზი',
  lastName: 'ხოზვრია',
  gender: 'male',
  birthDate: '1986-01-26',
  phoneNumber: '+995500050610',
  citizenship: 'GE',
  unknownPatient: false
};

const patient = await createPatient(medplum, values);
```

#### Searching for Patients
```typescript
import { searchPatients } from '@/emr/services/patientService';

// Search by personal ID
const byId = await searchPatients(medplum, {
  personalId: '26001014632'
});

// Search by name
const byName = await searchPatients(medplum, {
  firstName: 'თენგიზი',
  lastName: 'ხოზვრია'
});
```

#### Extracting FHIR Data
```typescript
import { getIdentifierValue, getTelecomValue, getExtensionValue } from '@/emr/services/fhirHelpers';

const personalId = getIdentifierValue(patient, 'personal-id');
const phone = getTelecomValue(patient, 'phone');
const citizenship = getExtensionValue(patient, 'citizenship');
```

### FHIR Resource Mappings

#### Patient Resource
- **personalId** → `identifier[].value` (system: `http://medimind.ge/identifiers/personal-id`)
- **registrationNumber** → `identifier[].value` (system: `http://medimind.ge/identifiers/registration-number`)
- **firstName** → `name[].given[]`
- **lastName** → `name[].family`
- **fatherName** → `name[].extension[].valueString` (url: `patronymic`)
- **gender** → `gender`
- **birthDate** → `birthDate`
- **phoneNumber** → `telecom[].value` (system: `phone`)
- **citizenship** → `extension[].valueCodeableConcept.coding[].code` (url: `citizenship`)
- **isUnknownPatient** → `extension[].valueBoolean` (url: `unknown-patient`)

#### RelatedPerson Resource
- **relationshipCode** → `relationship[].coding[].code` (system: `http://terminology.hl7.org/CodeSystem/v3-RoleCode`)
- **patientId** → `patient.reference`
- **firstName** → `name[].given[]`
- **lastName** → `name[].family`

### Running Registration Tests

```bash
cd packages/app

# Run all registration tests
npm test -- registration

# Run specific component tests
npm test -- PatientEditModal.test.tsx      # 9/9 tests passing ✅
npm test -- UnifiedRegistrationView.test.tsx
npm test -- PatientForm.test.tsx

# Run service tests
npm test -- patientService.test.ts
npm test -- representativeService.test.ts
npm test -- validators.test.ts

# Watch mode for active development
npm test -- --watch registration
```

### Testing Patterns

#### Component Testing with Mantine Provider
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MedplumProvider } from '@medplum/react-hooks';
import { MantineProvider } from '@mantine/core';
import { MockClient } from '@medplum/mock';

describe('PatientEditModal', () => {
  let medplum: MockClient;

  // Helper to wrap component with required providers
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <MantineProvider>
        <MemoryRouter>
          <MedplumProvider medplum={medplum}>{component}</MedplumProvider>
        </MemoryRouter>
      </MantineProvider>
    );
  };

  beforeEach(() => {
    medplum = new MockClient();
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'ka');
  });

  it('should submit valid patient form', async () => {
    render(
      <MemoryRouter>
        <MedplumProvider medplum={medplum}>
          <PatientRegistrationView />
        </MedplumProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'თენგიზი' }
    });
    // ... more fields

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(medplum.createResource).toHaveBeenCalled();
    });
  });
});
```

## Patient History Page Feature

### Overview

The Patient History Page provides comprehensive FHIR Encounter-based patient visit management for the MediMind EMR system. It displays patient visit history in a 10-column table with advanced filtering, searching, sorting, editing, and deletion capabilities.

**Feature Branch**: `001-patient-history-page`
**FHIR Resources**: Encounter, Coverage, Patient
**Languages**: Georgian (ka), English (en), Russian (ru)

### Recent Updates (Updated: 2025-11-14)

**Implementation Complete:**
- ✅ **10-Column Visit History Table** - Full FHIR Encounter display with financial tracking
- ✅ **Insurance Filtering** - 58 insurance companies with multilingual support
- ✅ **Advanced Search** - Personal ID, name, date range, registration number filters
- ✅ **Date Sorting** - Ascending/descending sort by visit date
- ✅ **Visit Editing** - 134-field modal form with 3 insurance tabs
- ✅ **Admin Deletion** - Soft delete (entered-in-error) and hard delete options
- ✅ **Financial Highlighting** - Green debt cells for outstanding balances
- ✅ **Error Boundary** - API failure handling with user-friendly messages
- ✅ **Storybook Stories** - Complete component documentation
- ✅ **Menu Integration** - History sub-menu item activated

**All 7 User Stories Completed:**
- US1: View Patient Visit History (10-column table) ✅
- US2: Filter by Insurance/Payer (58 companies) ✅
- US3: Search by Patient Details (ID, name, date, registration) ✅
- US4: Sort Visits by Date (ascending/descending) ✅
- US5: Edit Visit Details (134-field modal with 3 insurance tabs) ✅
- US6: Delete Patient Visit (admin permissions, soft/hard delete) ✅
- US7: Financial Summary Status (green highlighting for debt > 0) ✅

### File Structure

```
packages/app/src/emr/
├── views/patient-history/
│   ├── PatientHistoryView.tsx          # Main page component with table and filters
│   ├── PatientHistoryView.test.tsx     # Comprehensive tests (187 passing)
│   └── PatientHistoryView.stories.tsx  # Storybook stories
├── components/patient-history/
│   ├── PatientHistoryTable.tsx         # 10-column table with clickable rows
│   ├── PatientHistoryTable.test.tsx    # Table component tests
│   ├── PatientHistoryTable.stories.tsx # Table Storybook stories (NEW)
│   ├── PatientHistoryFilters.tsx       # Insurance and search filters
│   ├── PatientHistoryFilters.test.tsx  # Filter component tests
│   ├── PatientHistoryFilters.stories.tsx # Filter Storybook stories (NEW)
│   ├── InsuranceSelect.tsx             # 58-option insurance dropdown
│   ├── InsuranceSelect.test.tsx        # Insurance select tests
│   ├── InsuranceSelect.stories.tsx     # Insurance select stories
│   ├── VisitEditModal.tsx              # 134-field visit edit modal
│   ├── VisitEditModal.test.tsx         # Edit modal tests
│   ├── VisitEditModal.stories.tsx      # Edit modal stories
│   └── DeletionConfirmationModal.tsx   # Delete confirmation dialog
├── services/
│   ├── patientHistoryService.ts        # Encounter CRUD operations
│   ├── patientHistoryService.test.ts   # Service tests
│   ├── insuranceService.ts             # Coverage CRUD operations
│   ├── insuranceService.test.ts        # Insurance service tests
│   └── fhirHelpers.ts                  # FHIR data mapping utilities
├── hooks/
│   ├── usePatientHistory.ts            # Visit data fetching and state management
│   ├── usePatientHistory.test.tsx      # Hook tests
│   ├── useVisitEdit.ts                 # Visit edit form state management
│   └── useVisitEdit.test.tsx           # Edit hook tests (11/11 passing)
├── types/
│   └── patient-history.ts              # TypeScript interfaces
└── translations/
    ├── ka.json                         # Georgian translations
    ├── en.json                         # English translations
    └── ru.json                         # Russian translations
```

### Routing

**Main Patient History Route:**
- `/emr/patient-history` → **auto-redirects to** → `/emr/patient-history/history`

**Active Routes:**
```typescript
/emr/patient-history                 // Redirects to /history
/emr/patient-history/history         // Main patient history page ✅ IMPLEMENTED
/emr/patient-history/my-patients     // Placeholder (not implemented)
/emr/patient-history/surrogacy       // Placeholder (not implemented)
/emr/patient-history/invoices        // Placeholder (not implemented)
/emr/patient-history/form-100        // Placeholder (not implemented)
/emr/patient-history/prescriptions   // Placeholder (not implemented)
/emr/patient-history/execution       // Placeholder (not implemented)
/emr/patient-history/laboratory      // Placeholder (not implemented)
/emr/patient-history/duty            // Placeholder (not implemented)
/emr/patient-history/appointments    // Placeholder (not implemented)
/emr/patient-history/hospital        // Placeholder (not implemented)
/emr/patient-history/nutrition       // Placeholder (not implemented)
/emr/patient-history/moh             // Placeholder (not implemented)
```

### Key Components

#### PatientHistoryView (Main Page)
- Main view component coordinating all patient history functionality
- Displays 10-column table with visit data
- Insurance company filter dropdown
- Search filters (personal ID, name, date range, registration number)
- Edit and delete actions
- Record count status display (e.g., "ხაზზე (44)")
- Wrapped in ErrorBoundary for API failure handling

**Table Columns:**
1. **პ/ნ** - Personal ID (11-digit Georgian ID)
2. **სახელი** - First Name
3. **გვარი** - Last Name
4. **თარიღი** - Date (admission + discharge on separate lines)
5. **#** - Registration Number (numeric: "10357-2025" or ambulatory: "a-6871-2025")
6. **ჯამი** - Total Amount (GEL)
7. **%** - Discount Percentage
8. **ვალი** - Debt (green highlighting when > 0)
9. **გადახდ.** - Payment Amount (GEL)
10. **Actions** - Edit (✏️) and Delete (🗑️) icons

#### PatientHistoryTable
- 10-column Mantine Table with turquoise gradient header
- Clickable rows with cursor pointer
- Navigate to `/emr/patient-history/:id` on row click
- Multiple timestamps displayed on separate lines
- Edit and delete action icons
- Empty state when no results
- Loading skeleton while fetching data
- Green background (rgba(0, 255, 0, 0.2)) on debt cells when debt > 0

#### PatientHistoryFilters
- Insurance company dropdown (58 options)
- Personal ID search with debounced input (500ms)
- First name and last name search with debounced input
- Date range filter (from/to DateInput)
- Registration number search (supports both formats)
- Defaults to "0 - შიდა" (Internal/Private pay)
- Turquoise gradient theme

#### InsuranceSelect
- 58 insurance company options
- Multilingual: Georgian (ka), English (en), Russian (ru)
- Searchable dropdown
- Options loaded from insurance-companies.json
- Default: "0 - შიდა (Internal/Private pay)"

#### VisitEditModal
- 134-field modal form with 3 sections:
  - **რეგისტრაცია (Registration)** - 14 fields (visit date, registration type, referrer, etc.)
  - **დემოგრაფია (Demographics)** - 8 READ-ONLY fields (region, district, city, address, education, family status, employment)
  - **დაზღვევა I, II, III (Insurance)** - 3 tabs with 7 fields each (company, type, policy number, referral number, dates, copay %)
- Form validation for required fields
- Success/error notifications
- Auto-refreshes table after save

#### DeletionConfirmationModal
- Confirmation dialog for visit deletion
- Soft delete (status='entered-in-error') - default
- Hard delete (permanent removal) - admin only
- Displays patient name, registration number, visit date
- Loading state during deletion
- Admin permission check

### Key Features

#### View Patient Visit History (US1)
- 10-column table displaying FHIR Encounter resources
- Personal ID, first name, last name, visit date
- Registration number (numeric and ambulatory formats)
- Financial information (total, discount, debt, payment)
- Clickable rows navigating to visit detail page
- Record count status (e.g., "ხაზზე (44)")

#### Filter by Insurance/Payer (US2)
- Insurance company dropdown with 58 options
- Default filter: "0 - შიდა" (Internal/Private pay)
- Multilingual insurance company names (ka/en/ru)
- Options include:
  - 0 - შიდა (Internal/Private pay)
  - 1 - სსიპ ჯანმრთელობის ეროვნული სააგენტო (National Health Agency)
  - 2 - ალდაგი (Aldagi Insurance)
  - ... (55 more options)

#### Search by Patient Details (US3)
- Personal ID search (11-digit Georgian ID)
- First name search (სახელი)
- Last name search (გვარი)
- Date range filter (from/to)
- Registration number search (stationary and ambulatory)
- Debounced input (500ms) to reduce API calls
- AND logic for multiple active filters

#### Sort Visits by Date (US4)
- Click თარიღი (Date) column header to sort
- Toggle between ascending and descending
- Sort direction indicator (↑/↓) on column header
- Preserves sort order when filters change
- Uses FHIR `_sort` parameter (-period-start for descending)

#### Edit Visit Details (US5)
- Click edit icon (✏️) to open modal
- 134-field form with 3 sections
- 3 insurance tabs (primary, secondary, tertiary)
- Form validation for required fields
- Success/error notifications
- Auto-refreshes table after save
- Updates FHIR Encounter + up to 3 Coverage resources

#### Delete Patient Visit (US6)
- Click delete icon (🗑️) to open confirmation dialog
- Admin permission check (only admins can delete)
- Soft delete (status='entered-in-error') - default
- Hard delete (permanent removal) - admin only
- Success/error notifications
- Auto-refreshes table after deletion

#### Financial Status Highlighting (US7)
- Green background (rgba(0, 255, 0, 0.2)) on debt cells when debt > 0
- No background when debt = 0
- Accurate financial calculations: debt = total - payment
- Discount percentage displayed in % column
- Currency values formatted with proper decimals (GEL)

### Common Patterns

#### Searching for Patient Visits
```typescript
import { useMedplum } from '@medplum/react-hooks';
import { searchEncounters } from '@/emr/services/patientHistoryService';

const medplum = useMedplum();

// Search by insurance company
const byInsurance = await searchEncounters(medplum, {
  insuranceCompany: '1', // National Health Agency
});

// Search by personal ID
const byPersonalId = await searchEncounters(medplum, {
  personalId: '26001014632',
});

// Search with multiple filters (AND logic)
const filtered = await searchEncounters(medplum, {
  insuranceCompany: '0',
  firstName: 'თენგიზი',
  dateFrom: new Date('2025-11-01'),
  dateTo: new Date('2025-11-14'),
});
```

#### Updating a Visit (Encounter + Coverage)
```typescript
import { updateEncounter } from '@/emr/services/patientHistoryService';
import { upsertCoverage } from '@/emr/services/insuranceService';

// Update Encounter
const updatedEncounter = await updateEncounter(medplum, {
  ...encounter,
  // ... modifications
});

// Update primary insurance (order 1)
await upsertCoverage(medplum, encounter, primaryInsuranceValues, 1);

// Update secondary insurance (order 2)
await upsertCoverage(medplum, encounter, secondaryInsuranceValues, 2);

// Update tertiary insurance (order 3)
await upsertCoverage(medplum, encounter, tertiaryInsuranceValues, 3);
```

#### Deleting a Visit
```typescript
import { deleteEncounter, hardDeleteEncounter } from '@/emr/services/patientHistoryService';

// Soft delete (status='entered-in-error')
await deleteEncounter(medplum, visitId);

// Hard delete (permanent removal)
await hardDeleteEncounter(medplum, visitId);
```

### FHIR Resource Mappings

#### Encounter Resource
- **visitDate** → `period.start`
- **admissionDate** → `period.start`
- **dischargeDate** → `period.end`
- **registrationNumber** → `identifier[].value` (system: `http://medimind.ge/identifiers/registration-number`)
- **registrationType** → `type[].coding[].code`
- **patientId** → `subject.reference`
- **status** → `status` (planned, arrived, in-progress, finished, entered-in-error)

#### Coverage Resource
- **insuranceCompany** → `payor[].reference` (Organization)
- **insuranceType** → `type.coding[].code`
- **policyNumber** → `subscriberId`
- **referralNumber** → `extension[].valueString` (url: `referral-number`)
- **copayPercent** → `costToBeneficiary[].value.value`
- **order** → `order` (1=primary, 2=secondary, 3=tertiary)

### Testing Patterns

#### Component Testing with Mantine Provider
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MedplumProvider } from '@medplum/react-hooks';
import { MantineProvider } from '@mantine/core';
import { MockClient } from '@medplum/mock';
import { PatientHistoryView } from './PatientHistoryView';

describe('PatientHistoryView', () => {
  let medplum: MockClient;

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <MantineProvider>
        <MemoryRouter initialEntries={['/emr/patient-history']}>
          <MedplumProvider medplum={medplum}>
            <Routes>
              <Route path="/emr/patient-history" element={component} />
              <Route path="/emr/patient-history/:id" element={<div>Visit Detail Page</div>} />
            </Routes>
          </MedplumProvider>
        </MemoryRouter>
      </MantineProvider>
    );
  };

  beforeEach(() => {
    medplum = new MockClient();
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'ka');
  });

  it('displays patient visit table with 10 columns', async () => {
    renderWithProviders(<PatientHistoryView />);

    await waitFor(() => {
      expect(screen.getByText('პ/ნ')).toBeInTheDocument(); // Personal ID
      expect(screen.getByText('სახელი')).toBeInTheDocument(); // First Name
      expect(screen.getByText('გვარი')).toBeInTheDocument(); // Last Name
      expect(screen.getByText('თარიღი')).toBeInTheDocument(); // Date
      expect(screen.getByText('#')).toBeInTheDocument(); // Registration Number
      expect(screen.getByText('ჯამი')).toBeInTheDocument(); // Total
      expect(screen.getByText('%')).toBeInTheDocument(); // Discount
      expect(screen.getByText('ვალი')).toBeInTheDocument(); // Debt
      expect(screen.getByText('გადახდ.')).toBeInTheDocument(); // Payment
    });
  });
});
```

### Running Patient History Tests

```bash
cd packages/app

# Run all patient history tests
npm test -- patient-history

# Run specific component tests
npm test -- PatientHistoryView.test.tsx      # 187 tests passing
npm test -- PatientHistoryTable.test.tsx
npm test -- PatientHistoryFilters.test.tsx
npm test -- VisitEditModal.test.tsx
npm test -- useVisitEdit.test.tsx            # 11/11 tests passing

# Run service tests
npm test -- patientHistoryService.test.ts
npm test -- insuranceService.test.ts

# Watch mode for active development
npm test -- --watch patient-history
```

### Error Handling

**API Failure Protection:**
- PatientHistoryView wrapped in ErrorBoundary component
- Displays user-friendly error message on API failures
- Logs errors to console for debugging
- Auto-clears error state on navigation change

**Loading States:**
- Skeleton loader while fetching visit data
- Loading spinner during edit/delete operations
- Disabled buttons during API calls

**Empty States:**
- "No visits found" message when table is empty
- Filter suggestions when search yields no results

### Performance Considerations

- Debounced search inputs (500ms) to reduce API calls
- Efficient FHIR search parameters (_count, _sort)
- React.memo() for table row components (optional optimization)
- Pagination support (future enhancement)

## Troubleshooting

### Build Failures
- Run `npm run clean` then `npm run build` at root
- Check TypeScript version matches across packages
- Clear Turbo cache: `npx turbo clean`

### Test Failures
- Ensure PostgreSQL and Redis are running via docker-compose
- Clear Jest cache: `npx jest --clearCache`

### Georgian characters display as boxes (□□□)
- Ensure UTF-8 encoding in all files
- Check font supports Georgian Unicode (U+10A0-U+10FF)

### Personal ID validation fails for valid IDs
- Verify Luhn checksum algorithm implementation
- Test with known valid IDs: `26001014632`, `01001011116`

### Duplicate detection not working
- Check Medplum server has indexing on `Patient.identifier`
- Verify identifier system URI matches: `http://medimind.ge/identifiers/personal-id`

### Representative form not showing for minors
- Check birthdate calculation logic
- Ensure age < 18 triggers `requireRepresentative` flag

### Form validation not triggering
- Ensure Mantine form `validate` object field names match `initialValues`

## Recent Implementation Summary (2025-11-13)

### Phase 3: Patient Editing Complete ✅

**What Was Built:**
1. **PatientEditModal Component** (303 lines)
   - Beautiful modal popup matching original EMR design
   - Auto-fetches patient data by ID
   - Shows loading states
   - Handles duplicate detection
   - Auto-refreshes table after save
   - All 9 tests passing ✅

2. **Route-Based Editing Enhanced**
   - Fixed PatientEditView placeholder → now uses actual PatientForm
   - Full-page editing at `/emr/registration/edit/:id`
   - Fallback for direct URL access

3. **Routing Cleaned Up**
   - Removed 4 unused routes (list, create, unknown, receiver)
   - Removed 3 unused imports (PatientListView, PatientRegistrationView, UnknownPatientView)
   - Main route `/emr/registration` now redirects to `/emr/registration/registration`
   - Clean, simple structure with only actively used pages

4. **Translations Added**
   - 14 new translation keys in Georgian, English, Russian
   - `registration.edit.*` - Edit modal titles and messages
   - `registration.duplicate.*` - Duplicate warning messages
   - `registration.representative.*` - Representative section labels

5. **Testing**
   - PatientEditModal: 9/9 tests passing
   - Fixed MantineProvider wrapper requirement
   - Fixed nested heading HTML validation warning

**How It Works:**
- Click რეგისტრაცია (Registration) in main menu → lands on unified registration page
- Click pen icon (✏️) next to any patient → modal opens with edit form
- Edit patient data → click შენახვა (Save) → table refreshes automatically
- Stay on unified view - no navigation away from the page!

**Two Edit Pathways Available:**
1. **Modal** (Recommended) - Quick edits without leaving unified view
2. **Route** (Alternative) - Full-page editing for deep linking

## Medical Services Nomenclature System

### Overview

The Medical Services Nomenclature System manages a catalog of 2,217+ medical services (operations, consultations, lab studies) stored as FHIR ActivityDefinition resources. Services are fully integrated with the EMR system and ready to link to patient encounters.

**Status**: ✅ **PRODUCTION READY** (2,217 services imported)
**FHIR Resource**: ActivityDefinition
**Languages**: Georgian (ka), English (en), Russian (ru)

### Recent Updates (Updated: 2025-11-18)

**Implementation Complete:**
- ✅ **2,217 Services Imported** - Full medical services catalog from Excel/Numbers file
- ✅ **FHIR Mapping** - All services stored as ActivityDefinition resources with extensions
- ✅ **Service Management UI** - Add, edit, delete services via `/emr/nomenclature/medical-1`
- ✅ **Multilingual Support** - Service groups, types, categories in ka/en/ru
- ✅ **Import Scripts** - Automated import with rate-limit handling
- ✅ **15-Field Data Model** - Complete service details (code, name, group, type, price, LIS integration, GIS codes)

### File Structure

```
packages/app/src/emr/
├── views/nomenclature/
│   └── NomenclatureMedical1View.tsx      # Main nomenclature page
├── components/nomenclature/
│   ├── ServiceTable.tsx                  # 10-column service table
│   ├── ServiceEntryForm.tsx              # Inline add/edit form
│   ├── ServiceEditModal.tsx              # Modal edit dialog
│   ├── ServiceDeletionModal.tsx          # Delete confirmation
│   ├── ServiceGroupSelect.tsx            # Group dropdown
│   ├── ServiceTypeSelect.tsx             # Type dropdown
│   ├── ServiceCategorySelect.tsx         # Category dropdown
│   └── ServiceSubgroupSelect.tsx         # Subgroup dropdown
├── services/
│   ├── nomenclatureService.ts            # ActivityDefinition CRUD operations
│   ├── nomenclatureHelpers.ts            # FHIR data extraction utilities
│   └── excelExportService.ts             # Excel export functionality (placeholder)
├── hooks/
│   ├── useNomenclature.ts                # Service data fetching with pagination
│   └── useServiceForm.ts                 # Form state management
├── types/
│   └── nomenclature.ts                   # TypeScript interfaces (ServiceFormValues, etc.)
├── translations/
│   ├── service-groups.json               # Service group options (ka/en/ru)
│   ├── service-types.json                # Service type options
│   ├── service-categories.json           # Category options
│   └── service-subgroups.json            # Subgroup options (50 medical specialties)
└── sections/
    └── NomenclatureSection.tsx           # Route wrapper

scripts/
├── import-with-token.ts                  # Main import script (used for 2,217 services)
├── import-nomenclature.ts                # OAuth version for production
├── convert-numbers-to-xlsx.ts            # File format converter
├── GET-TOKEN-INSTRUCTIONS.md             # Token extraction guide
├── IMPORT-READY.md                       # Quick start guide
└── README-IMPORT.md                      # Full documentation

documentation/xsl/
└── სამედიცინო სერვისების ცხრილი.xlsx     # Source data (2,217 services)
```

### Routing

**Main Nomenclature Route:**
- `/emr/nomenclature` → redirects to `/emr/nomenclature/medical-1`

**Active Routes:**
```typescript
/emr/nomenclature                      // Redirects to /medical-1
/emr/nomenclature/medical-1            // Main service catalog ✅ IMPLEMENTED
/emr/nomenclature/medical-2            // Placeholder (not implemented)
/emr/nomenclature/diagnosis            // Placeholder (not implemented)
/emr/nomenclature/hospitals            // Placeholder (not implemented)
// ... 10 more placeholder routes
```

### Key Features

#### Service Catalog Management
- **2,217 Medical Services** imported from Excel/Numbers file
- **10-Column Table** displaying all service data
- **Inline Add/Edit Form** for quick service creation/modification
- **Modal Edit Dialog** for detailed service editing
- **Delete Confirmation** with soft delete (status='retired')
- **Multilingual Display** with automatic language switching
- **Pagination Support** (backend ready for 100 services per page)

#### Service Data Model

Each service includes:
- **code** - Unique service code (კოდი)
- **name** - Service name (დასახელება)
- **group** - Service group (ჯგუფი): consultations, operations, lab studies, etc.
- **subgroup** - Medical specialty or DRG category (50 options)
- **type** - Service type (ტიპი): internal (შიდა), other clinics, limbach, etc.
- **serviceCategory** - Ambulatory/Stationary/Both
- **price** - Base price in GEL (ფასი)
- **totalAmount** - Total amount in GEL (ჯამი)
- **calHed** - Calculation method (კალკულაციის დათვლა)
- **printable** - Printable flag
- **itemGetPrice** - Item pricing count
- **departments** - Assigned department IDs
- **lisIntegration** - LIS integration flag
- **lisProvider** - LIS provider name
- **externalOrderCode** - External order code
- **gisCode** - GIS code
- **status** - active | retired | draft

### FHIR Resource Mappings

#### ActivityDefinition Resource
- **code** → `identifier[].value` (system: `http://medimind.ge/nomenclature/service-code`)
- **name** → `title`
- **group** → `topic[].text`
- **subgroup** → `extension[service-subgroup]`
- **type** → `extension[service-type]`
- **serviceCategory** → `extension[service-category]`
- **price** → `extension[base-price]` (valueMoney with GEL currency)
- **totalAmount** → `extension[total-amount]`
- **calHed** → `extension[cal-hed]`
- **printable** → `extension[printable]`
- **itemGetPrice** → `extension[item-get-price]`
- **departments** → `extension[assigned-departments]` (comma-separated IDs)
- **lisIntegration** → `extension[lis-integration]` (boolean)
- **lisProvider** → `extension[lis-provider]`
- **externalOrderCode** → `extension[external-order-code]`
- **gisCode** → `extension[gis-code]`
- **status** → `status` (active, retired, draft)

### Common Patterns

#### Searching for Services
```typescript
import { searchServices } from '@/emr/services/nomenclatureService';

// Search by code
const byCode = await searchServices(medplum, {
  code: 'JXDD3A'
});

// Search by name (partial match)
const byName = await searchServices(medplum, {
  name: 'ექოსკოპია'
});

// Filter by group and type
const filtered = await searchServices(medplum, {
  group: 'ინსტრუმენტული კვლევები',
  type: 'შიდა',
  status: 'active'
});

// Pagination
const page2 = await searchServices(medplum, {
  page: 2,
  count: 100
});
```

#### Creating a New Service
```typescript
import { createService } from '@/emr/services/nomenclatureService';

const values: ServiceFormValues = {
  code: 'NEW001',
  name: 'ახალი სერვისი',
  group: 'კონსულტაციები',
  type: 'შიდა',
  serviceCategory: 'ambulatory',
  price: 50,
  status: 'active'
};

const service = await createService(medplum, values);
```

#### Updating a Service
```typescript
import { updateService } from '@/emr/services/nomenclatureService';

const updatedValues: ServiceFormValues = {
  code: 'JXDD3A',
  name: 'მუცლის ღრუს ექოსკოპია (სტაციონარი) - განახლებული',
  group: 'ინსტრუმენტული კვლევები',
  type: 'შიდა',
  serviceCategory: 'stationary',
  price: 150, // Updated price
  status: 'active'
};

const service = await updateService(medplum, serviceId, updatedValues);
```

#### Soft Delete (Recommended)
```typescript
import { deleteService } from '@/emr/services/nomenclatureService';

// Sets status='retired', preserves data for audit
await deleteService(medplum, serviceId);
```

#### Hard Delete (Admin Only)
```typescript
import { hardDeleteService } from '@/emr/services/nomenclatureService';

// Permanently removes the service (use with caution!)
await hardDeleteService(medplum, serviceId);
```

### Importing Services

**One-Time Import (Already Completed):**
```bash
# 2,217 services already imported on 2025-11-18
# If you need to re-import or add more services:

# Step 1: Get access token from browser (DevTools → Local Storage → activeLogin)
export MEDPLUM_TOKEN="your-access-token"

# Step 2: Run import script
npx tsx scripts/import-with-token.ts

# Features:
# - Automatic rate-limit handling (pauses when hitting API limits)
# - Progress tracking (updates every 100 services)
# - Error logging (saves to logs/nomenclature-import-errors.json)
# - Validation (checks required fields before import)
```

**Import Documentation:**
- **Quick Start**: `documentation/nomenclature/IMPORT-READY.md`
- **Token Guide**: `documentation/nomenclature/GET-TOKEN-INSTRUCTIONS.md`
- **Full Docs**: `documentation/nomenclature/README-IMPORT.md`
- **Future Imports**: `documentation/nomenclature/TableImportGuide.md` ⭐

### Performance Considerations

- **Pagination**: Use `count` and `page` parameters for large result sets
- **Filtering**: Use FHIR search parameters to reduce dataset before fetching
- **Virtual Scrolling**: Can be added for smooth scrolling of 2,217+ services
- **Caching**: Consider caching service groups/types/categories (rarely change)

### Testing

```bash
cd packages/app

# Run all nomenclature tests
npm test -- nomenclature

# Run specific component tests
npm test -- ServiceTable.test.tsx
npm test -- ServiceEditModal.test.tsx

# Run service tests
npm test -- nomenclatureService.test.ts
npm test -- nomenclatureHelpers.test.ts
```

### Future Enhancements (Optional)

1. **ServiceFilters Component** - Advanced search/filter UI
2. **Virtual Scrolling** - Smooth scrolling for 2,217+ services
3. **Excel Export** - Export services back to Excel (placeholder exists)
4. **Bulk Import UI** - File upload interface in the app
5. **Service Templates** - Pre-configured service templates
6. **Price History** - Track price changes over time

## Laboratory Nomenclature System

### Overview

Manages 4 laboratory nomenclature sub-systems at `/emr/nomenclature/laboratory`.

**Status**: ✅ **3 OF 4 TABS PRODUCTION READY**
**FHIR Resources**: ObservationDefinition, SpecimenDefinition, ActivityDefinition, DeviceDefinition

### File Structure

```
packages/app/src/emr/
├── components/laboratory/
│   ├── tabs/ (SamplesTab, ManipulationsTab, SyringesTab, ResearchComponentsTab)
│   ├── samples/, manipulations/, syringes/ (tables, forms, modals)
│   └── ColorBarDisplay.tsx
├── services/ (sampleService, manipulationService, syringeService, researchComponentService)
├── hooks/ (useSamples, useManipulations, useSyringes, useResearchComponents)
└── types/laboratory.ts
```

### Tabs

**1. Samples (ნიმუშები)** - SpecimenDefinition
- Inline editing, single field (name)
- 45+ sample types

**2. Manipulations (მანიპულაციები)** - ActivityDefinition
- Inline editing, single field (procedure name)
- 34+ procedures

**3. Syringes (სინჯარები)** - DeviceDefinition
- Modal editing, 3 fields (name, color, volume)
- Color visualization with ColorBarDisplay component
- 15+ container types

**4. Research Components (კვლევის კომპონენტები)** - ObservationDefinition (PLACEHOLDER)
- Service/hook ready for 7-field form implementation
- 92+ lab parameters planned

## Account Management System

### Overview

Manages practitioner/staff accounts with FHIR Practitioner, PractitionerRole, and AccessPolicy resources. Provides account creation, multi-role assignment, and deactivation workflows.

**Status**: ✅ **PRODUCTION READY** (85% test coverage)
**Route**: `/emr/account-management`
**FHIR Resources**: Practitioner, PractitionerRole, Invite, AccessPolicy, AuditEvent

### Key Features

- **Account Creation**: Email-based invitations via Medplum Invite API
- **Multi-Role Assignment**: Multiple roles with medical specialties per practitioner
- **Deactivation Workflow**: Soft delete with audit trails (DICOM DCM 110137)
- **Validation**: RFC 5322 email, E.164 phone (+995 Georgia), date validation
- **Security**: Self-deactivation prevention, admin-only permissions
- **Multilingual**: Georgian (ka), English (en), Russian (ru)

### File Structure

```
packages/app/src/emr/
├── views/account-management/
│   └── AccountManagementView.tsx        # Main page (form + table)
├── components/account-management/
│   ├── AccountForm.tsx                  # Create/edit form
│   ├── AccountTable.tsx                 # Account list table
│   ├── RoleSelector.tsx                 # Multi-role dropdown
│   ├── SpecialtySelect.tsx              # Medical specialty (NUCC codes)
│   └── deactivation/
│       └── DeactivationConfirmationModal.tsx
├── services/
│   ├── accountService.ts                # Practitioner + Invite CRUD
│   ├── accountValidators.ts             # Form validation utilities
│   └── accountHelpers.ts                # FHIR data extraction
├── hooks/
│   ├── useAccountForm.ts                # Form state management
│   └── useDeactivation.ts               # Deactivation workflow
├── types/
│   └── account-management.ts            # TypeScript interfaces
└── translations/
    ├── account-roles.json               # 12 role types
    └── medical-specialties.json         # 25 NUCC specialties
```

### Common Patterns

#### Creating Account
```typescript
import { createPractitionerWithInvite } from '@/emr/services/accountService';

const values: AccountFormValues = {
  firstName: 'თენგიზი',
  lastName: 'ხოზვრია',
  email: 'tengizi@medimind.ge',
  gender: 'male',
  roles: [
    { code: 'physician', specialty: '207RC0000X', active: true }
  ]
};

const { practitioner, invite } = await createPractitionerWithInvite(medplum, values);
```

#### Multi-Role Assignment
```typescript
// Each role creates a PractitionerRole resource
const roles: RoleAssignment[] = [
  { code: 'physician', specialty: '207RC0000X', active: true },
  { code: 'department-head', department: 'Cardiology', active: true }
];
```

#### Deactivation
```typescript
import { deactivatePractitioner } from '@/emr/services/accountService';

await deactivatePractitioner(medplum, practitionerId, 'Resigned', currentUserId);
// Creates AuditEvent with DICOM code DCM 110137
```

### FHIR Mappings

- **Practitioner.active** → Account status
- **Practitioner.name[].given/family** → First/Last name
- **Practitioner.telecom[]** → Email/Phone (system: email/phone)
- **Practitioner.gender** → Gender (male/female/other/unknown)
- **PractitionerRole.code** → Role (12 types: physician, nurse, etc.)
- **PractitionerRole.specialty** → Medical specialty (NUCC codes)
- **Invite** → Email invitation with setup link

### Testing

```bash
cd packages/app
npm test -- account-management  # 91/107 tests passing (85%)
```

### Dashboard Navigation

User dropdown menu (top-right) includes **Dashboard** button → navigates to `/emr/account-management`

## Role and Permission Management System

### Overview

The Role and Permission Management System provides FHIR-compliant RBAC (Role-Based Access Control) for the MediMind EMR system. Roles are stored as AccessPolicy resources with permissions mapped to resource-level rules.

**Status**: ✅ **PRODUCTION READY**
**Route**: `/emr/account-management` → Roles tab
**FHIR Resources**: AccessPolicy, PractitionerRole, AuditEvent

### Key Features

- **Role Creation**: Create roles with name, code, description, status
- **Permission Configuration**: 6 categories, 30+ permissions, auto-dependency resolution
- **Role Assignment**: Multi-role support via PractitionerRole resources
- **Search/Filter**: Debounced search (500ms), status filter, table sorting
- **Edit Roles**: Modal-based editing with permission updates
- **Deactivate/Reactivate**: Soft delete with user count warnings
- **Delete Roles**: Hard delete with user count validation (blocks if users assigned)
- **Clone Roles**: Duplicate role with " (Copy)" suffix

### File Structure

```
packages/app/src/emr/
├── views/role-management/
│   └── RoleManagementView.tsx          # Main role management page
├── components/role-management/
│   ├── RoleTable.tsx                   # 8-column table with actions
│   ├── RoleForm.tsx                    # Create/edit form
│   ├── PermissionTree.tsx              # Hierarchical permission selector
│   ├── RoleCreateModal.tsx             # Create modal
│   ├── RoleEditModal.tsx               # Edit modal
│   ├── RoleDeleteModal.tsx             # Delete confirmation with user count check
│   ├── RoleCloneModal.tsx              # Clone modal
│   ├── RoleDeactivationModal.tsx       # Deactivate confirmation
│   ├── RoleAssignmentPanel.tsx         # Multi-role assignment
│   └── RoleFilters.tsx                 # Search/filter controls
├── services/
│   ├── roleService.ts                  # CRUD operations (11 functions)
│   ├── permissionService.ts            # Permission tree utilities
│   └── roleValidators.ts               # Validation rules
├── hooks/
│   ├── useRoles.ts                     # Fetch roles with filters
│   ├── useRoleForm.ts                  # Form state management
│   └── usePermissions.ts               # Permission tree data
└── types/
    └── role-management.ts              # TypeScript interfaces
```

### Common Patterns

#### Creating a Role
```typescript
import { createRole } from '@/emr/services/roleService';

const role = await createRole(medplum, {
  code: 'physician',
  name: 'Physician',
  description: 'Medical doctor with full patient access',
  status: 'active',
  permissions: ['view-patient-demographics', 'edit-patient-demographics'],
});
```

#### Assigning Role to User
```typescript
import { assignRoleToUser } from '@/emr/services/roleService';

await assignRoleToUser(medplum, practitionerId, roleCode);
```

#### Cloning a Role
```typescript
import { cloneRole } from '@/emr/services/roleService';

// Creates a new role with " (Copy)" suffix and same permissions
await cloneRole(medplum, sourceRoleId, 'New Role Name', 'new-role-code');
```

#### Deleting a Role (with user count check)
```typescript
import { hardDeleteRole, getRoleUserCount } from '@/emr/services/roleService';

// Check if role has assigned users
const userCount = await getRoleUserCount(medplum, roleId);

if (userCount > 0) {
  // Block deletion - role has assigned users
  throw new Error(`Cannot delete role with ${userCount} assigned users`);
}

// Safe to delete
await hardDeleteRole(medplum, roleId);
```

#### Permission Dependency Resolution
```typescript
import { resolvePermissionDependencies } from '@/emr/services/permissionService';

// User selects "edit-patient-demographics"
// System auto-enables "view-patient-demographics" (dependency)
const resolved = resolvePermissionDependencies(
  ['edit-patient-demographics'],
  allPermissions
);
// Returns: ['edit-patient-demographics', 'view-patient-demographics']
```

### FHIR Resource Mappings

#### AccessPolicy (Role Storage)
- **meta.tag[role-identifier]** → Role code and name
- **meta.tag[role-status]** → Status (active/inactive)
- **description** → Role description
- **resource[]** → Permission rules (resourceType, readonly, etc.)

#### PractitionerRole (Role Assignment)
- **meta.tag[role-assignment]** → Assigned role code
- **practitioner.reference** → User ID
- **active** → Assignment status

### Permission Categories (6 Total)

1. **Patient Management** - Demographics, registration, search
2. **Clinical Data** - Encounters, observations, medications
3. **Billing & Finance** - Claims, payments, invoicing
4. **Administration** - Users, roles, system config
5. **Laboratory** - Orders, results, specimens
6. **Reporting** - Analytics, exports, audit logs

### Testing

```bash
cd packages/app
npm test -- role-management  # Run all role management tests
```

### User Interface

**Access**: Navigate to `/emr/account-management` → Click "Roles" tab

**Table Features**:
- 8 columns: Name, Description, # Users, Permission Count, Status, Created Date, Last Modified, Actions
- Sortable columns (click header to sort)
- Action buttons: Edit (✏️), Clone (📋), Deactivate/Reactivate (🔒/🔓), Delete (🗑️)

**Security Notes**:
- Delete button blocked if role has assigned users
- Audit trail preserved for deleted roles (role name in logs)
- Deactivation recommended over deletion for roles with history

## Documentation References

- EMR UI Layout Spec: `specs/003-emr-ui-layout/spec.md`
- Patient History Spec: `specs/001-patient-history-page/spec.md`
- Registration Spec: `specs/004-fhir-registration-implementation/spec.md`
- Account Management Spec: `specs/005-account-management/spec.md`
- Role Management Spec: `specs/006-role-permission-management/spec.md` ⭐
- Nomenclature Documentation: `documentation/nomenclature/README.md`
- Nomenclature Import Guide: `documentation/nomenclature/TableImportGuide.md`
- Official Docs: https://www.medplum.com/docs
- FHIR R4 Spec: https://hl7.org/fhir/R4/
- Contributing Guide: https://medplum.com/docs/contributing

## Active Technologies
- TypeScript 5.x (strict mode enabled per constitution) (006-role-permission-management)
- PostgreSQL (Medplum server) storing FHIR AccessPolicy resources (006-role-permission-management)

## Recent Changes
- 006-role-permission-management: Added TypeScript 5.x (strict mode enabled per constitution)
