# FHIR Form Builder Quick Start Guide

This guide helps developers get started with the MediMind Form Builder system.

## Table of Contents

- [Installation](#installation)
- [Routes](#routes)
- [Key Components](#key-components)
- [Services](#services)
- [Hooks](#hooks)
- [Types](#types)
- [Examples](#examples)
- [Testing](#testing)
- [Performance](#performance)

---

## Installation

The form builder is included in the MediMind EMR package. Dependencies are already configured.

```bash
# Install all dependencies
npm install

# Start development server
cd packages/app
npm run dev
```

### Required Environment

- Node.js 18+
- Medplum server running (local or remote)
- PostgreSQL for FHIR storage

---

## Routes

The form builder is accessible under the `/emr/forms` path:

| Route | Component | Description |
|-------|-----------|-------------|
| `/emr/forms` | FormsSection | Main forms dashboard (redirects to /search) |
| `/emr/forms/builder` | FormBuilderView | Create new form template |
| `/emr/forms/edit/:id` | FormBuilderView | Edit existing form template |
| `/emr/forms/fill/:id` | FormFillerView | Fill out a form for a patient |
| `/emr/forms/view/:id` | FormViewerView | View completed form (read-only) |
| `/emr/forms/search` | FormSearchView | Search and filter forms |
| `/emr/forms/analytics` | FormAnalyticsView | View form analytics dashboard |

### Route Configuration

Routes are defined in `packages/app/src/AppRoutes.tsx`:

```typescript
import { FormsSection } from './emr/sections/FormsSection';

// Inside Routes
<Route path="forms" element={<FormsSection />}>
  <Route index element={<Navigate to="search" replace />} />
  <Route path="builder" element={<FormBuilderView />} />
  <Route path="edit/:id" element={<FormBuilderView />} />
  <Route path="fill/:id" element={<FormFillerView />} />
  <Route path="view/:id" element={<FormViewerView />} />
  <Route path="search" element={<FormSearchView />} />
  <Route path="analytics" element={<FormAnalyticsView />} />
</Route>
```

---

## Key Components

### Form Builder Components

Located in `packages/app/src/emr/components/form-builder/`:

| Component | Description |
|-----------|-------------|
| `FormBuilderLayout` | Main 3-panel layout (palette, canvas, properties) |
| `FieldPalette` | Draggable field type selector |
| `FormCanvas` | Drop zone for building form structure |
| `FieldProperties` | Configuration panel for selected field |
| `FieldRenderer` | Renders individual field in canvas |
| `ConditionalLogicEditor` | Configure show/hide conditions |
| `PatientBindingConfig` | Configure patient data auto-fill |

### Form Renderer Components

Located in `packages/app/src/emr/components/form-renderer/`:

| Component | Description |
|-----------|-------------|
| `FormRenderer` | Main form filling interface |
| `FieldInput` | Renders form input based on field type |
| `SignatureCapture` | Digital signature component |
| `FormProgress` | Progress indicator for multi-section forms |

### Form Viewer Components

| Component | Description |
|-----------|-------------|
| `FormViewer` | Read-only form display |
| `FormPDFDocument` | PDF generation component (react-pdf) |
| `PrintableForm` | Print-optimized view |

---

## Services

Located in `packages/app/src/emr/services/`:

### formBuilderService.ts

Manages FHIR Questionnaire resources.

```typescript
import {
  createQuestionnaire,
  updateQuestionnaire,
  getQuestionnaire,
  listQuestionnaires,
  deleteQuestionnaire,
  cloneQuestionnaire,
} from '@/emr/services/formBuilderService';

// Create a new form
const questionnaire = await createQuestionnaire(medplum, {
  title: 'Consent Form',
  status: 'draft',
  fields: [
    { id: 'field-1', linkId: 'patient-name', type: 'text', label: 'Patient Name' }
  ]
});

// List active forms
const forms = await listQuestionnaires(medplum, { status: 'active' });
```

### formRendererService.ts

Handles form filling and submission.

```typescript
import {
  populateFormWithPatientData,
  createQuestionnaireResponse,
  submitForm,
  saveDraft,
  searchQuestionnaireResponses,
} from '@/emr/services/formRendererService';

// Pre-fill form with patient data
const populatedValues = populateFormWithPatientData(formTemplate, { patient, encounter });

// Submit completed form
const response = await submitForm(medplum, questionnaire, values, {
  subject: { reference: `Patient/${patientId}` },
});

// Search completed forms
const results = await searchQuestionnaireResponses(medplum, {
  patientId: '123',
  status: 'completed',
  dateFrom: '2025-01-01',
});
```

### pdfGenerationService.ts

PDF generation utilities.

```typescript
import {
  registerFonts,
  generatePDFFilename,
  downloadPDF,
  previewPDF,
} from '@/emr/services/pdfGenerationService';

// Register Georgian fonts (call once)
registerFonts();

// Generate filename
const filename = generatePDFFilename(questionnaire, patient);
// Result: "Consent_Form_თენგიზი_ხოზვრია_2025-11-22.pdf"
```

### formAnalyticsService.ts

Analytics and reporting.

```typescript
import {
  aggregateMetrics,
  generateDailyReport,
  exportToCSV,
} from '@/emr/services/formAnalyticsService';

// Get form analytics
const analytics = await aggregateMetrics(medplum, {
  dateFrom: '2025-11-01',
  dateTo: '2025-11-30',
});

console.log(analytics.completionRate); // 85.5
console.log(analytics.averageCompletionTimeMs); // 180000 (3 minutes)
```

---

## Hooks

Located in `packages/app/src/emr/hooks/`:

### useFormBuilder

State management for form builder with undo/redo.

```typescript
import { useFormBuilder } from '@/emr/hooks/useFormBuilder';

function FormBuilderView() {
  const { state, actions, canUndo, canRedo, undo, redo, save } = useFormBuilder();

  // Add a field
  actions.addField({
    id: 'field-1',
    linkId: 'question-1',
    type: 'text',
    label: 'Enter your name',
    required: true,
  });

  // Update form title
  actions.setTitle('New Form Title');

  // Save to server
  await save(medplum);
}
```

### useResponsiveLayout

Responsive layout management for mobile/tablet/desktop.

```typescript
import { useResponsiveLayout } from '@/emr/hooks/useResponsiveLayout';

function ResponsiveForm() {
  const { isMobile, layoutMode, panelVisibility, togglePalette } = useResponsiveLayout();

  return (
    <Box>
      {isMobile && (
        <Button onClick={togglePalette}>Show Palette</Button>
      )}
      {panelVisibility.palette && <FieldPalette />}
      <FormCanvas />
    </Box>
  );
}
```

### useFormAnalytics

Analytics data fetching with filters.

```typescript
import { useFormAnalytics } from '@/emr/hooks/useFormAnalytics';

function AnalyticsDashboard() {
  const { analytics, loading, error, setFilters, refresh } = useFormAnalytics({
    period: '30d',
  });

  return (
    <Box>
      <Text>Completion Rate: {analytics?.completionRate}%</Text>
      <Text>Total Forms: {analytics?.totalForms}</Text>
    </Box>
  );
}
```

---

## Types

Located in `packages/app/src/emr/types/`:

### form-builder.ts

```typescript
// Field configuration
interface FieldConfig {
  id: string;
  linkId: string;
  type: FieldType;
  label: string;
  required?: boolean;
  helpText?: string;
  validation?: ValidationRule[];
  options?: FieldOption[];
  patientBinding?: PatientBinding;
  conditionalDisplay?: ConditionalRule;
}

// Form template
interface FormTemplate {
  id?: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'retired';
  category?: string;
  fields: FieldConfig[];
  version?: string;
}

// Field types
type FieldType =
  | 'text'
  | 'textarea'
  | 'integer'
  | 'decimal'
  | 'boolean'
  | 'date'
  | 'dateTime'
  | 'time'
  | 'choice'
  | 'open-choice'
  | 'attachment'
  | 'signature'
  | 'group'
  | 'display';
```

### form-renderer.ts

```typescript
// Form response
interface FormResponse {
  responseId?: string;
  questionnaireId: string;
  status: 'in-progress' | 'completed' | 'amended' | 'stopped';
  subject?: Reference;
  answers: FieldAnswer[];
  authored: string;
}

// Field answer
interface FieldAnswer {
  linkId: string;
  value: Answer;
}
```

---

## Examples

### Creating a Simple Form

```typescript
const consentForm: FormTemplate = {
  title: 'Patient Consent Form',
  description: 'Standard consent for medical treatment',
  status: 'draft',
  category: 'consent',
  fields: [
    {
      id: 'field-1',
      linkId: 'patient-name',
      type: 'text',
      label: 'Patient Full Name',
      required: true,
      patientBinding: {
        enabled: true,
        bindingKey: 'patient-name',
      },
    },
    {
      id: 'field-2',
      linkId: 'consent-agree',
      type: 'boolean',
      label: 'I agree to the terms and conditions',
      required: true,
    },
    {
      id: 'field-3',
      linkId: 'signature',
      type: 'signature',
      label: 'Patient Signature',
      required: true,
    },
  ],
};

const questionnaire = await createQuestionnaire(medplum, consentForm);
```

### Form with Conditional Logic

```typescript
const assessmentForm: FormTemplate = {
  title: 'Health Assessment',
  status: 'active',
  fields: [
    {
      id: 'field-1',
      linkId: 'has-allergies',
      type: 'boolean',
      label: 'Do you have any allergies?',
    },
    {
      id: 'field-2',
      linkId: 'allergy-details',
      type: 'textarea',
      label: 'Please describe your allergies',
      conditionalDisplay: {
        sourceFieldId: 'has-allergies',
        operator: 'equals',
        value: true,
      },
    },
  ],
};
```

---

## Testing

### Running Tests

```bash
cd packages/app

# Run all form builder tests
npm test -- form

# Run specific test files
npm test -- formBuilderService.test.ts
npm test -- useFormBuilder.test.tsx

# Watch mode
npm test -- --watch form
```

### Test Utilities

```typescript
import { MockClient } from '@medplum/mock';
import { renderWithProviders } from '@/emr/test-utils';

describe('FormBuilder', () => {
  let medplum: MockClient;

  beforeEach(() => {
    medplum = new MockClient();
    localStorage.clear();
  });

  it('should create a form', async () => {
    renderWithProviders(<FormBuilderView />, { medplum });
    // ... test logic
  });
});
```

---

## Performance

### Benchmarks

| Metric | Target | Actual |
|--------|--------|--------|
| Form render (50 fields) | <100ms | ~80ms |
| Form render (500 fields) | <500ms | ~400ms |
| Auto-save latency | <200ms | ~150ms |
| PDF generation (simple) | <1s | ~700ms |
| PDF generation (complex) | <3s | ~2.5s |

### Code Splitting

Form builder routes are lazy-loaded:

```typescript
const FormBuilderView = lazy(() => import('./emr/views/form-builder/FormBuilderView'));

<Suspense fallback={<LoadingSkeleton />}>
  <FormBuilderView />
</Suspense>
```

### Optimization Tips

1. **Use virtual scrolling** for forms with 100+ fields
2. **Debounce auto-save** to reduce API calls (default: 500ms)
3. **Lazy load PDF components** only when needed
4. **Cache questionnaire data** when filling multiple forms

---

## Troubleshooting

### Common Issues

**CORS errors with PDF fonts**
- Ensure fonts are in `public/fonts/` directory
- Check CORS headers on font requests

**Form not saving**
- Verify Medplum client is authenticated
- Check network tab for API errors
- Ensure questionnaire ID is valid

**Patient binding not working**
- Verify patient is selected before opening form
- Check binding key matches patient field
- Ensure patient has the required data

### Debug Mode

Enable debug logging:

```typescript
// In browser console
localStorage.setItem('formBuilder:debug', 'true');
```

---

## Related Documentation

- [User Guide](../../documentation/forms/user-guide.md)
- [FHIR Questionnaire Spec](https://hl7.org/fhir/R4/questionnaire.html)
- [Medplum Documentation](https://www.medplum.com/docs)
- [Feature Specification](./spec.md)

---

*Last updated: November 2025*
