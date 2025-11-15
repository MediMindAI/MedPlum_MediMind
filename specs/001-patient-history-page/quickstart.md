# Quickstart Guide: Patient History Page (ისტორია)

**Feature**: Patient History Page
**Date**: 2025-11-14
**For**: Developers implementing the patient history feature

## Overview

This guide provides step-by-step instructions for setting up your development environment, implementing the Patient History page, running tests, and deploying the feature. Follow the 5-phase implementation plan (P1-P7 user stories) for incremental delivery.

## Prerequisites

### Required Software

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Docker** and **Docker Compose** (for PostgreSQL + Redis)
- **Git** (for version control)

### Required Knowledge

- TypeScript fundamentals
- React 19 basics (hooks, components, JSX)
- FHIR R4 specification (basic understanding)
- Mantine UI component library

### Recommended Tools

- VS Code with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Jest Runner
- Postman or similar (for FHIR API testing)
- React DevTools browser extension

## Initial Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to monorepo root
cd /Users/toko/Desktop/medplum_medimind

# Install all dependencies (runs Turborepo)
npm install

# Verify installation
npm run build:fast
```

### 2. Start Backend Services

```bash
# Start PostgreSQL + Redis via Docker Compose
docker-compose up -d

# Verify services running
docker ps
# Should see medplum-postgres and medplum-redis containers
```

### 3. Start Development Servers

```bash
# Terminal 1: Start Medplum server (backend)
cd packages/server
npm run dev

# Terminal 2: Start Medplum app (frontend)
cd packages/app
npm run dev

# App will be available at http://localhost:3000
# Server will be available at http://localhost:8103
```

### 4. Verify Setup

Navigate to `http://localhost:3000` and log in with test credentials. You should see the EMR main menu with "პაციენტის ისტორია" (Patient History) option.

## Project Structure

Create the following directory structure in `packages/app/src/emr/`:

```bash
# Create directories
mkdir -p packages/app/src/emr/views/patient-history
mkdir -p packages/app/src/emr/components/patient-history
mkdir -p packages/app/src/emr/services
mkdir -p packages/app/src/emr/hooks
mkdir -p packages/app/src/emr/types

# Verify structure
tree packages/app/src/emr/
```

## Implementation Phases

### Phase 1 (MVP - Week 1-2): View Patient Visit History

**Goal**: Display patient visits in a 10-column table with green highlighting for outstanding debts.

**User Stories**: P1 (View Patient Visit History), P7 (View Financial Summary)

#### Step 1.1: Create TypeScript Interfaces

```bash
# Create types file
touch packages/app/src/emr/types/patient-history.ts
```

Copy interfaces from `specs/001-patient-history-page/data-model.md` section "TypeScript Interfaces":
- `VisitTableRow`
- `PatientHistorySearchParams`
- `VisitFormValues`
- `InsuranceOption`
- `FinancialSummary`

#### Step 1.2: Create Patient History Service

```bash
# Create service file
touch packages/app/src/emr/services/patientHistoryService.ts
touch packages/app/src/emr/services/patientHistoryService.test.ts
```

Implement functions:
- `fetchPatientVisits()` - Query FHIR Encounters with `_include`
- `mapBundleToTableRows()` - Transform FHIR Bundle to VisitTableRow[]

**Test command**:
```bash
cd packages/app
npm test -- patientHistoryService.test.ts
```

#### Step 1.3: Create Patient History Table Component

```bash
# Create component files
touch packages/app/src/emr/components/patient-history/PatientHistoryTable.tsx
touch packages/app/src/emr/components/patient-history/PatientHistoryTable.test.tsx
touch packages/app/src/emr/components/patient-history/PatientHistoryTable.stories.tsx
```

Implement:
- 10-column table using Mantine `<Table>` component
- Green highlighting for debt cells (`debt > 0`)
- Click handler for row navigation
- Sort by date column

**Test command**:
```bash
npm test -- PatientHistoryTable.test.ts
```

**View in Storybook**:
```bash
npm run storybook
# Navigate to EMR/PatientHistory/Table
```

#### Step 1.4: Create Patient History View

```bash
# Create view files
touch packages/app/src/emr/views/patient-history/PatientHistoryView.tsx
touch packages/app/src/emr/views/patient-history/PatientHistoryView.test.tsx
touch packages/app/src/emr/views/patient-history/PatientHistoryView.stories.tsx
```

Implement:
- Fetch visits on component mount using `usePatientHistory` hook
- Display table with loading/empty states
- Integrate with EMR layout (4-row navigation)

#### Step 1.5: Add Route

Edit `packages/app/src/emr/EMRPage.tsx`:

```typescript
import { PatientHistoryView } from './views/patient-history/PatientHistoryView';

// Add route
<Route path="patient-history" element={<PatientHistoryView />} />
```

Update `packages/app/src/emr/translations/ka.json`:

```json
{
  "menu": {
    "patientHistory": "პაციენტის ისტორია"
  },
  "patientHistory": {
    "title": "ისტორია",
    "table": {
      "personalId": "პ/ნ",
      "firstName": "სახელი",
      "lastName": "გვარი",
      // ... add all column headers
    }
  }
}
```

**Test MVP**:
```bash
# Run all tests
npm test -- patient-history

# Start dev server and navigate to /emr/patient-history
npm run dev
```

**Success Criteria**:
- ✅ Table displays with 10 columns
- ✅ Green highlighting for debt > 0
- ✅ Clicking row navigates to detail view (placeholder)
- ✅ Test coverage >80%

---

### Phase 2 (Filters - Week 2-3): Filter by Insurance & Search

**Goal**: Add insurance dropdown filter and patient search fields.

**User Stories**: P2 (Filter by Insurance), P3 (Search by Patient Details)

#### Step 2.1: Create Insurance Service

```bash
touch packages/app/src/emr/services/insuranceService.ts
touch packages/app/src/emr/services/insuranceService.test.ts
```

Implement:
- `fetchInsuranceCompanyOptions()` - Load 58 insurance companies from Medplum
- Cache results in React Query or useState

#### Step 2.2: Create Filter Components

```bash
touch packages/app/src/emr/components/patient-history/PatientHistoryFilters.tsx
touch packages/app/src/emr/components/patient-history/PatientHistoryFilters.test.tsx
touch packages/app/src/emr/components/patient-history/InsuranceSelect.tsx
touch packages/app/src/emr/components/patient-history/InsuranceSelect.test.tsx
```

Implement:
- Insurance dropdown with multilingual labels (ka/en/ru)
- Text inputs for personal ID, first name, last name
- Date range pickers
- Registration number search fields
- Debounced search (500ms delay)

#### Step 2.3: Create Search Hook

```bash
touch packages/app/src/emr/hooks/usePatientHistory.ts
touch packages/app/src/emr/hooks/usePatientHistory.test.ts
```

Implement:
- State management for search params
- Debounced FHIR search
- Loading/error states

#### Step 2.4: Integrate Filters with Table

Update `PatientHistoryView.tsx`:
- Add `<PatientHistoryFilters>` above table
- Connect filter state to `usePatientHistory` hook
- Update table when filters change

**Test Phase 2**:
```bash
npm test -- PatientHistoryFilters
npm test -- usePatientHistory
```

**Success Criteria**:
- ✅ Insurance dropdown displays 58 options
- ✅ Filtering by insurance updates table (<1 second)
- ✅ Text search debounced (500ms)
- ✅ Date range filtering works
- ✅ Test coverage >80%

---

### Phase 3 (Sorting - Week 3): Sort by Date

**Goal**: Enable date column sorting (ascending/descending).

**User Story**: P4 (Sort Visits by Date)

#### Step 3.1: Add Sort Logic

Update `PatientHistoryTable.tsx`:
- Add click handler to date column header
- Toggle sort order state (`asc` / `desc`)
- Sort visits array before rendering

#### Step 3.2: Persist Sort Order

Update `usePatientHistory.ts`:
- Store sort order in state
- Preserve sort order when filters change

**Test Phase 3**:
```bash
npm test -- PatientHistoryTable -- --testNamePattern="sort"
```

**Success Criteria**:
- ✅ Clicking date header toggles sort order
- ✅ Sort order preserved on filter change
- ✅ Test coverage >80%

---

### Phase 4 (Editing - Week 4-5): Edit Visit Details

**Goal**: Implement visit edit modal with 134-field form.

**User Story**: P5 (Edit Patient Visit Details)

#### Step 4.1: Create Edit Modal Component

```bash
touch packages/app/src/emr/components/patient-history/VisitEditModal.tsx
touch packages/app/src/emr/components/patient-history/VisitEditModal.test.tsx
```

Implement:
- Mantine `<Modal>` with form
- 3 sections: Registration, Demographics, Insurance
- 3 insurance tabs (დაზღვევა I, II, III)
- Validation with Mantine `useForm`

#### Step 4.2: Create Edit Hook

```bash
touch packages/app/src/emr/hooks/useVisitEdit.ts
touch packages/app/src/emr/hooks/useVisitEdit.test.ts
```

Implement:
- Form state management
- Optimistic UI updates
- Error handling with rollback

#### Step 4.3: Add Edit Action to Table

Update `PatientHistoryTable.tsx`:
- Add edit icon (pencil) to action column
- Click handler opens `<VisitEditModal>`
- Pass visit ID to modal

#### Step 4.4: Implement Save Logic

Update `patientHistoryService.ts`:
- `updateVisit()` function
- Update Encounter + up to 3 Coverage resources
- Refresh table after successful save

**Test Phase 4**:
```bash
npm test -- VisitEditModal
npm test -- useVisitEdit
```

**Success Criteria**:
- ✅ Modal opens with all 134 fields populated
- ✅ Validation prevents invalid saves
- ✅ Table refreshes after save
- ✅ Rollback on error
- ✅ Test coverage >80%

---

### Phase 5 (Admin - Week 5): Delete Visit

**Goal**: Enable administrators to delete erroneous visit records.

**User Story**: P6 (Delete Patient Visit)

#### Step 5.1: Add Delete Action

Update `PatientHistoryTable.tsx`:
- Add delete icon (circle) to action column
- Check user permissions before showing icon

#### Step 5.2: Implement Delete Logic

Update `patientHistoryService.ts`:
- `deleteVisit()` function (soft delete - set status to `entered-in-error`)
- Show confirmation dialog before delete
- Refresh table after successful delete

**Test Phase 5**:
```bash
npm test -- --testNamePattern="delete"
```

**Success Criteria**:
- ✅ Confirmation dialog appears
- ✅ Visit soft-deleted (status = entered-in-error)
- ✅ Table refreshes
- ✅ Non-admin users don't see delete icon
- ✅ Test coverage >80%

---

## Testing Guide

### Unit Tests

```bash
# Run all patient history tests
cd packages/app
npm test -- patient-history

# Run specific test file
npm test -- PatientHistoryTable.test.tsx

# Watch mode for active development
npm test -- --watch patient-history

# Coverage report
npm test -- --coverage patient-history
```

### Integration Tests

```bash
# Test FHIR queries with MockClient
npm test -- patientHistoryService.test.ts

# Test component integration
npm test -- PatientHistoryView.test.tsx
```

### E2E Tests (Manual for now)

1. Start dev server: `npm run dev`
2. Navigate to `/emr/patient-history`
3. Test all 7 user stories (P1-P7):
   - P1: View table with 10 columns
   - P2: Filter by insurance company
   - P3: Search by patient name/ID
   - P4: Sort by date
   - P5: Edit visit and save
   - P6: Delete visit (admin only)
   - P7: Verify green highlighting for debt

### Storybook Development

```bash
# Start Storybook
npm run storybook

# View components in isolation
# Navigate to: EMR/PatientHistory/Table
#              EMR/PatientHistory/Filters
#              EMR/PatientHistory/EditModal
```

## Troubleshooting

### Common Issues

**Issue**: `Cannot find module '@medplum/core'`
- **Solution**: Run `npm install` in monorepo root

**Issue**: Tests fail with "MedplumClient is not a constructor"
- **Solution**: Import `MockClient` from `@medplum/mock` instead of `MedplumClient`

**Issue**: Georgian characters display as boxes (□□□)
- **Solution**: Ensure UTF-8 encoding in all files, check font supports Georgian Unicode

**Issue**: Green highlighting not showing
- **Solution**: Verify `debt > 0` in table data, check CSS `backgroundColor` inline style

**Issue**: FHIR search returns no results
- **Solution**: Check Medplum server is running (`docker ps`), verify Encounter resources exist in database

### Debug Commands

```bash
# Check Docker services
docker ps

# View Medplum server logs
docker logs medplum-postgres

# Clear Redis cache
docker exec -it medplum-redis redis-cli FLUSHALL

# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
```

## Deployment

### Build for Production

```bash
# Build all packages
npm run build

# Or build only app + server (faster)
npm run build:fast

# Verify build output
ls -la packages/app/dist
ls -la packages/server/dist
```

### Run Tests Before Deploy

```bash
# Run all tests
npm test

# Run linting
npm run lint

# Type check
npm run typecheck
```

### Deploy to Server

```bash
# Example deployment (adjust for your hosting)
npm run build
npm run deploy
```

## Additional Resources

- **FHIR R4 Spec**: https://hl7.org/fhir/R4/
- **Medplum Docs**: https://www.medplum.com/docs
- **Mantine UI**: https://mantine.dev/
- **Project Constitution**: `.specify/memory/constitution.md`
- **Research Document**: `specs/001-patient-history-page/research.md`
- **Data Model**: `specs/001-patient-history-page/data-model.md`

## Next Steps

After completing Phase 5:
1. **Performance optimization**: Add pagination if >100 visits
2. **Mobile responsiveness**: Implement responsive table design
3. **Advanced features**: Bulk operations, saved filters, export to Excel
4. **Integration**: Connect to payment processing form, discharge workflow

For detailed task breakdown, run `/speckit.tasks` to generate `tasks.md`.

---

**Last Updated**: 2025-11-14
**Maintainer**: Medplum MediMind Team
