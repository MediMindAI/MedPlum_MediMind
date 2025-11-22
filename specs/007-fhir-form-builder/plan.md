# Implementation Plan: FHIR-Compliant Medical Form Builder System

**Branch**: `007-fhir-form-builder` | **Date**: 2025-11-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-fhir-form-builder/spec.md`

**Note**: This implementation plan consolidates findings from 6 parallel research streams and provides concrete technical guidance for building a medical-grade FHIR form builder.

## Summary

Build a production-ready, FHIR R4-compliant medical form builder that enables healthcare administrators to create structured forms (consent forms, patient intake, clinical assessments) with drag-and-drop interfaces, automatic patient data population, digital signatures, and PDF export. The system must support 49 existing EMR form templates, comply with HIPAA/21 CFR Part 11/FDA regulations, meet WCAG 2.1 Level AA accessibility standards, and support Georgian, English, and Russian languages.

**Primary Technical Approach**:
- FHIR Questionnaire resources for form templates
- FHIR QuestionnaireResponse resources for completed forms
- LHC-Forms (NIH) for FHIR-native form rendering
- React 19 + Mantine 7.x + dnd-kit for drag-and-drop form builder UI
- Zod for runtime validation with dynamic schema generation
- Hybrid PDF generation (@react-pdf/renderer client + Puppeteer server)
- IndexedDB + FHIR server for auto-save with offline support

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enabled), React 19, Node.js 18+
**Primary Dependencies**:
- LHC-Forms (FHIR Questionnaire renderer)
- dnd-kit 6.x (drag-and-drop, 10KB, actively maintained)
- React Hook Form 7.x (form state, 12KB)
- Zod 3.x (validation, 49KB, TypeScript-first)
- react-signature-canvas (digital signatures)
- @react-pdf/renderer (client-side PDFs)
- Puppeteer (server-side complex PDFs)
- @tanstack/react-virtual (virtual scrolling for large forms)
- Immer (immutable state for undo/redo)

**Storage**:
- PostgreSQL (Medplum FHIR server) - Questionnaire, QuestionnaireResponse, Patient, Encounter, Binary (signatures/PDFs), AuditEvent
- IndexedDB (browser) - Draft storage, offline support
- Redis (Medplum) - Caching, session management
- S3/Blob Storage (optional) - PDF archival, signature images

**Testing**:
- Jest (unit tests, >80% coverage requirement)
- React Testing Library (component tests)
- Playwright (E2E tests for form builder workflows)
- axe-playwright (accessibility tests, WCAG 2.1 Level AA)
- Medplum MockClient (@medplum/mock) for FHIR testing

**Target Platform**:
- Web (desktop primary, tablet/mobile responsive)
- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Medplum FHIR R4 server (PostgreSQL + Redis backend)

**Project Type**: Web application within Medplum monorepo (packages/app)

**Performance Goals**:
- Form rendering: < 150ms for 100-field forms (with virtual scrolling)
- Auto-save latency: < 30ms to IndexedDB
- PDF generation: < 5s for 50-field forms
- Form search: < 2s for 10,000+ completed forms
- Support 100 concurrent users without degradation

**Constraints**:
- FHIR R4 specification compliance (HL7 FHIR + SDC Implementation Guide)
- HIPAA compliance (encryption, audit trails, 6-year retention)
- 21 CFR Part 11 compliance (FDA electronic signatures)
- WCAG 2.1 Level AA accessibility
- Georgian Unicode (U+10A0-10FF) support throughout
- Forms limited to 100 fields (performance constraint)
- Digital signatures < 1MB (storage constraint)
- Form search limited to 1000 results per query (pagination required)
- Offline support (forms must function without network)

**Scale/Scope**:
- 49 existing EMR form templates to migrate
- 15 field types supported (text, textarea, select, checkbox, date, signature, file upload, etc.)
- 14 patient data binding options (name, DOB, personal ID, gender, phone, address, encounter data)
- 10,000+ form completions per month expected
- 1,000+ forms stored per patient (7-10 year medical record retention)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. FHIR-First Architecture
**Status**: COMPLIANT
- All form data stored as FHIR Questionnaire (templates) and QuestionnaireResponse (completed forms)
- Patient/Encounter data follows FHIR R4 spec
- LHC-Forms library ensures FHIR compatibility
- HL7 SDC (Structured Data Capture) Implementation Guide followed

### ✅ II. Package-Based Modularity
**Status**: COMPLIANT
- Form builder implemented in `packages/app/src/emr/` (existing EMR module)
- Shared FHIR types from `@medplum/fhirtypes`
- React components from `@medplum/react` (optional extraction later)
- Clear dependency boundaries (app → core → fhirtypes)

### ✅ III. Test-First Development
**Status**: COMPLIANT
- Tests colocated with source code (`FormBuilder.test.tsx` next to `FormBuilder.tsx`)
- Jest + React Testing Library for component tests
- Playwright for E2E tests (form builder workflows)
- MockClient for FHIR testing without server
- Target: >80% code coverage for new code

### ✅ IV. Type Safety & Strict Mode
**Status**: COMPLIANT
- TypeScript strict mode enabled (already configured in monorepo)
- All FHIR resources use `@medplum/fhirtypes` generated types
- Zod schemas provide runtime type validation
- No `any` types without explicit justification

### ✅ V. Security & Compliance by Default
**Status**: COMPLIANT
- OAuth 2.0/SMART on FHIR authentication (already implemented in Medplum)
- AccessPolicy resources for authorization (admin vs clinical staff)
- HIPAA compliance (encryption at rest/transit, audit logs, 6-year retention)
- 21 CFR Part 11 compliance (digital signatures with audit trails)
- AES-256 encryption for draft storage (Web Crypto API)
- SHA-256 hashing for signature integrity

### ✅ VI. Build Order & Dependency Management
**Status**: COMPLIANT
- Follows existing monorepo structure (core → fhirtypes → app)
- Turborepo handles build orchestration (already configured)
- Internal packages use workspace references (`@medplum/core`)
- New dependencies added to `packages/app/package.json`

### ✅ VII. Observability & Debugging
**Status**: COMPLIANT
- FHIR AuditEvent resources for all form operations (create, complete, view, edit, delete)
- Medplum structured logging (already in place)
- Digital signature audit trail (capture, verify, revoke)
- Error messages include actionable context (validation errors, network failures)

### ✅ Healthcare & Compliance Standards
**Status**: COMPLIANT
- HIPAA: PHI encrypted (PostgreSQL at rest, HTTPS in transit), audit logs (AuditEvent), MFA supported (Medplum)
- FHIR Conformance: Questionnaire/QuestionnaireResponse validate against FHIR R4 schema
- Data Migration: Database migrations use Medplum migration system (transaction-wrapped)

### ✅ Testing Gates
**Status**: COMPLIANT
- Unit tests: >80% coverage for new code (Jest + React Testing Library)
- Integration tests: FHIR endpoint changes tested with MockClient
- E2E tests: Form builder workflows (Playwright)
- Performance tests: 100-field form rendering, auto-save latency, PDF generation

### ✅ Documentation Requirements
**Status**: COMPLIANT
- FHIR Questionnaire usage examples in research.md
- React components will include Storybook stories (form builder components)
- API changes documented in implementation plan
- Breaking changes tracked in feature spec

## Project Structure

### Documentation (this feature)

```text
specs/007-fhir-form-builder/
├── spec.md                      # Feature specification (COMPLETE)
├── plan.md                      # This file (IN PROGRESS)
├── research.md                  # Comprehensive research (COMPLETE)
├── research-fhir-systems.md     # FHIR deep dive (COMPLETE)
├── research-form-builders.md    # UI/UX patterns (COMPLETE)
├── research-digital-signatures.md # Legal & security (COMPLETE)
├── research-pdf-generation.md   # PDF solutions (COMPLETE)
├── research-form-validation.md  # Validation patterns (COMPLETE)
├── research-autosave-drafts.md  # Auto-save strategies (COMPLETE)
├── data-model.md                # Phase 1 output (PENDING)
├── quickstart.md                # Phase 1 output (PENDING)
├── contracts/                   # Phase 1 output (PENDING)
│   ├── form-builder-api.yaml    # OpenAPI spec for form management
│   ├── fhir-questionnaire.json  # FHIR Questionnaire schema examples
│   └── fhir-response.json       # FHIR QuestionnaireResponse schema examples
├── checklists/
│   └── requirements.md          # Spec quality validation (COMPLETE)
└── tasks.md                     # Phase 2 output (via /speckit.tasks - NOT YET)
```

### Source Code (repository root)

```text
packages/app/src/emr/
├── components/
│   ├── form-builder/
│   │   ├── FormBuilderLayout.tsx        # Three-panel layout (Palette | Canvas | Properties)
│   │   ├── FormBuilderLayout.test.tsx
│   │   ├── FieldPalette.tsx             # Draggable field types (15 fields)
│   │   ├── FieldPalette.test.tsx
│   │   ├── FormCanvas.tsx               # Drop zone with dnd-kit
│   │   ├── FormCanvas.test.tsx
│   │   ├── PropertiesPanel.tsx          # Field configuration panel
│   │   ├── PropertiesPanel.test.tsx
│   │   ├── FieldConfigEditor.tsx        # Edit field properties (label, required, validation)
│   │   ├── FieldConfigEditor.test.tsx
│   │   ├── PatientBindingSelector.tsx   # 14 patient data binding options
│   │   ├── PatientBindingSelector.test.tsx
│   │   ├── FormPreview.tsx              # Real-time preview with LHC-Forms
│   │   └── FormPreview.test.tsx
│   ├── form-renderer/
│   │   ├── FormRenderer.tsx             # LHC-Forms wrapper for filling forms
│   │   ├── FormRenderer.test.tsx
│   │   ├── FormField.tsx                # Individual field components (15 types)
│   │   ├── FormField.test.tsx
│   │   ├── SignatureField.tsx           # Signature capture modal
│   │   ├── SignatureField.test.tsx
│   │   ├── ConditionalLogic.tsx         # Show/hide based on other fields
│   │   └── ConditionalLogic.test.tsx
│   ├── form-management/
│   │   ├── FormTemplateList.tsx         # List of form templates (searchable)
│   │   ├── FormTemplateList.test.tsx
│   │   ├── FormTemplateCard.tsx         # Template preview card
│   │   ├── FormTemplateCard.test.tsx
│   │   ├── FormVersionHistory.tsx       # Version comparison view
│   │   ├── FormVersionHistory.test.tsx
│   │   ├── FormCloneModal.tsx           # Clone form workflow
│   │   └── FormCloneModal.test.tsx
│   ├── form-search/
│   │   ├── FormSearchView.tsx           # Search completed forms
│   │   ├── FormSearchView.test.tsx
│   │   ├── FormSearchFilters.tsx        # Patient, date, type, status filters
│   │   ├── FormSearchFilters.test.tsx
│   │   ├── FormResultsTable.tsx         # Paginated results table
│   │   └── FormResultsTable.test.tsx
│   ├── form-pdf/
│   │   ├── PDFGenerator.tsx             # @react-pdf/renderer wrapper
│   │   ├── PDFGenerator.test.tsx
│   │   ├── FormPDFDocument.tsx          # PDF layout component
│   │   └── FormPDFDocument.test.tsx
│   └── form-analytics/
│       ├── FormAnalyticsDashboard.tsx   # Usage metrics dashboard
│       ├── FormAnalyticsDashboard.test.tsx
│       ├── FormCompletionChart.tsx      # Completion rate chart
│       └── FormCompletionChart.test.tsx
├── services/
│   ├── formBuilderService.ts            # Questionnaire CRUD operations
│   ├── formBuilderService.test.ts
│   ├── formRendererService.ts           # QuestionnaireResponse CRUD
│   ├── formRendererService.test.ts
│   ├── patientDataBindingService.ts     # Auto-populate patient data
│   ├── patientDataBindingService.test.ts
│   ├── formValidationService.ts         # Zod schema generation
│   ├── formValidationService.test.ts
│   ├── signatureService.ts              # Signature capture, storage, verification
│   ├── signatureService.test.ts
│   ├── pdfGenerationService.ts          # PDF generation (client + server)
│   ├── pdfGenerationService.test.ts
│   ├── draftService.ts                  # IndexedDB draft storage
│   ├── draftService.test.ts
│   └── formAnalyticsService.ts          # Usage tracking and reporting
│       └── formAnalyticsService.test.ts
├── hooks/
│   ├── useFormBuilder.ts                # Form builder state management
│   ├── useFormBuilder.test.tsx
│   ├── useFormRenderer.ts               # Form rendering state
│   ├── useFormRenderer.test.tsx
│   ├── useAutoSave.ts                   # 5-second throttled auto-save
│   ├── useAutoSave.test.tsx
│   ├── useDraftRecovery.ts              # Draft detection and recovery
│   ├── useDraftRecovery.test.tsx
│   ├── useSignatureCapture.ts           # Signature modal management
│   ├── useSignatureCapture.test.tsx
│   └── useFormAnalytics.ts              # Analytics data fetching
│       └── useFormAnalytics.test.tsx
├── types/
│   ├── form-builder.ts                  # TypeScript interfaces for form builder
│   ├── form-renderer.ts                 # Form rendering types
│   ├── patient-binding.ts               # Patient data binding types
│   └── form-validation.ts               # Validation rule types
├── views/
│   ├── form-builder/
│   │   ├── FormBuilderView.tsx          # /emr/forms/builder
│   │   ├── FormBuilderView.test.tsx
│   │   ├── FormEditView.tsx             # /emr/forms/edit/:id
│   │   └── FormEditView.test.tsx
│   ├── form-filler/
│   │   ├── FormFillerView.tsx           # /emr/forms/fill/:id
│   │   ├── FormFillerView.test.tsx
│   │   ├── FormViewerView.tsx           # /emr/forms/view/:id (read-only)
│   │   └── FormViewerView.test.tsx
│   └── form-management/
│       ├── FormManagementView.tsx       # /emr/forms (list templates)
│       ├── FormManagementView.test.tsx
│       ├── FormSearchView.tsx           # /emr/forms/search (completed forms)
│       └── FormSearchView.test.tsx
└── translations/
    ├── forms/
    │   ├── field-types.json             # 15 field type translations (ka/en/ru)
    │   ├── patient-bindings.json        # 14 binding option translations
    │   ├── validation-messages.json     # Error messages (ka/en/ru)
    │   └── form-ui.json                 # UI labels (builder, renderer, search)
    └── medical-forms/
        ├── consent-forms.json           # Consent form templates (49 forms)
        └── clinical-forms.json          # Clinical assessment templates

packages/app/src/emr/sections/
└── FormsSection.tsx                     # Route wrapper for /emr/forms/*

tests/e2e/
├── form-builder/
│   ├── create-form.spec.ts              # Create 10-field form
│   ├── drag-drop.spec.ts                # Drag field from palette to canvas
│   ├── field-configuration.spec.ts      # Edit field properties
│   ├── patient-binding.spec.ts          # Configure auto-population
│   └── form-preview.spec.ts             # Real-time preview
├── form-renderer/
│   ├── fill-form.spec.ts                # Fill out form with patient data
│   ├── auto-population.spec.ts          # Verify patient data loads
│   ├── validation.spec.ts               # Test validation errors
│   ├── signature-capture.spec.ts        # Capture digital signature
│   └── auto-save.spec.ts                # Verify auto-save works
├── form-management/
│   ├── search-forms.spec.ts             # Search completed forms
│   ├── version-history.spec.ts          # View form versions
│   └── clone-form.spec.ts               # Clone existing form
└── accessibility/
    ├── form-builder-a11y.spec.ts        # WCAG 2.1 Level AA compliance
    ├── form-renderer-a11y.spec.ts       # Keyboard navigation, screen reader
    └── pdf-export-a11y.spec.ts          # PDF accessibility

packages/server/ (Medplum bot for PDF generation)
└── src/bots/
    └── form-pdf-generator/
        ├── index.ts                     # Puppeteer PDF generation
        ├── index.test.ts
        └── templates/
            ├── consent-form.html        # HTML template for consent forms
            └── clinical-form.html       # HTML template for clinical forms
```

**Structure Decision**:
This follows the existing Medplum monorepo structure with EMR-specific code in `packages/app/src/emr/`. The form builder is a major EMR feature module with clear separation between builder (admin), renderer (clinical staff), and management (search/analytics). Tests are colocated with source code following Medplum conventions. The Puppeteer PDF generation is implemented as a Medplum Bot (serverless function) to avoid bundling Puppeteer in the client.

## Complexity Tracking

No constitution violations. All principles are fully compliant:
- FHIR-first architecture maintained (Questionnaire/QuestionnaireResponse)
- Package modularity preserved (app → core → fhirtypes)
- Test-first development enforced (>80% coverage, colocated tests)
- Type safety with TypeScript strict mode + Zod runtime validation
- Security & compliance by default (HIPAA, 21 CFR Part 11, WCAG 2.1)
- Build order respects dependencies (Turborepo orchestration)
- Observability via FHIR AuditEvent resources

## Phase 0: Research & Technology Selection

### Research Completed ✅

All research has been completed by 6 parallel agents. Key decisions documented in [research.md](./research.md):

1. **FHIR Form Library**: LHC-Forms (NIH-backed, 2,000+ LOINC forms, SDC support)
2. **Drag-and-Drop**: dnd-kit (10KB, actively maintained, replaces archived react-beautiful-dnd)
3. **Form State**: React Hook Form (12KB, best performance, uncontrolled inputs)
4. **Validation**: Zod (49KB, TypeScript-first, dynamic schema generation)
5. **Digital Signatures**: react-signature-canvas (100% test coverage, actively maintained)
6. **PDF Generation**: Hybrid (@react-pdf/renderer client + Puppeteer server)
7. **Auto-Save**: 5-second throttle + IndexedDB local + FHIR server backup
8. **Georgian Fonts**: Noto Sans Georgian (embedded in PDFs, Docker fonts configuration)

### Technology Rationale

| Technology | Reason | Alternative Rejected |
|------------|--------|---------------------|
| **LHC-Forms** | NIH-backed, 2,000+ LOINC forms, native FHIR support, production-ready | SurveyJS (no native FHIR), FormIO (heavyweight) |
| **dnd-kit** | 10KB, zero deps, actively maintained, supports touch | react-beautiful-dnd (archived 4/2025), react-dnd (outdated API) |
| **React Hook Form** | 12KB, best performance (uncontrolled inputs), actively maintained | Formik (44KB, unmaintained since 2021) |
| **Zod** | TypeScript-first, 49KB, native type inference, dynamic schemas | Yup (no native TS), Joi (146KB, Node.js focused) |
| **react-signature-canvas** | 100% test coverage, actively maintained, TypeScript | Custom canvas implementation (reinventing wheel) |
| **@react-pdf/renderer** | Client-side, HIPAA-friendly (PHI stays on device), React-native | jsPDF (DOM-based, limited styling) |
| **Puppeteer** | Pixel-perfect, Georgian fonts, battle-tested for complex PDFs | wkhtmltopdf (unmaintained), Playwright (heavier) |

### Performance Benchmarks

| Scenario | Metric | Target | Achieved (Research) |
|----------|--------|--------|---------------------|
| Form rendering (100 fields) | Initial render time | < 150ms | 150ms (with virtual scrolling) |
| Auto-save to IndexedDB | Write latency | < 30ms | 15-30ms |
| PDF generation (simple) | Generation time | < 5s | 50-100ms (@react-pdf/renderer) |
| PDF generation (complex) | Generation time | < 5s | 800-1200ms (Puppeteer) |
| Form search (10K forms) | Query time | < 2s | < 500ms (PostgreSQL with indexes) |
| Signature capture | Tap to render | < 16ms (60fps) | < 10ms (canvas optimized) |

## Phase 1: Data Model & Contracts

### FHIR Resource Mapping

This section will be expanded in `data-model.md` (Phase 1 output).

**Core Resources**:
1. **Questionnaire** (Form Template)
   - Fields: id, identifier, version, status, title, item[]
   - Extensions: patient-binding, styling, conditional-logic
   - Versioning: meta.versionId incremented on edits

2. **QuestionnaireResponse** (Completed Form)
   - Fields: id, questionnaire, status, authored, author, source, encounter, item[]
   - Status: in-progress (draft), completed, entered-in-error (soft delete)
   - Relationships: Patient (source), Encounter (context), Practitioner (author)

3. **Binary** (Signatures & PDFs)
   - Fields: id, contentType, data (base64)
   - Used for: Digital signatures (image/png), Generated PDFs (application/pdf)

4. **DocumentReference** (Signature Metadata)
   - Fields: id, status, type, subject, content[]
   - Links Binary to Patient/QuestionnaireResponse
   - Extensions: signature-hash (SHA-256), signature-method (touch/mouse/typed)

5. **AuditEvent** (Audit Trail)
   - Fields: recorded, agent, entity, source
   - Tracks: Form create, complete, view, edit, delete, signature capture

### API Contracts

This section will be detailed in `contracts/` directory (Phase 1 output).

**Form Builder API** (OpenAPI):
- POST `/fhir/Questionnaire` - Create form template
- GET `/fhir/Questionnaire/:id` - Fetch form template
- PUT `/fhir/Questionnaire/:id` - Update form template (creates new version)
- GET `/fhir/Questionnaire?_sort=-_lastUpdated` - List form templates
- POST `/fhir/Questionnaire/:id/$clone` - Clone form template (custom operation)

**Form Filler API** (OpenAPI):
- POST `/fhir/QuestionnaireResponse` - Create draft or completed form
- GET `/fhir/QuestionnaireResponse/:id` - Fetch completed form
- PUT `/fhir/QuestionnaireResponse/:id` - Update draft (auto-save)
- GET `/fhir/QuestionnaireResponse?subject=Patient/:id` - Search forms by patient
- GET `/fhir/QuestionnaireResponse?questionnaire=Questionnaire/:id` - Search by template

**Signature API** (FHIR Binary):
- POST `/fhir/Binary` - Upload signature image (base64 PNG)
- GET `/fhir/Binary/:id` - Fetch signature image
- POST `/fhir/DocumentReference` - Link signature to QuestionnaireResponse

**PDF Generation API** (Medplum Bot):
- POST `/fhir/Bot/:id/$execute` - Generate PDF from QuestionnaireResponse
  - Input: { questionnaireId, responseId, method: 'simple' | 'complex' }
  - Output: { pdfUrl: 'Binary/:id' }

## Phase 2: Implementation Tasks

*This section will be completed by `/speckit.tasks` command after Phase 1.*

Tasks will be organized by:
1. **Foundation** (Weeks 1-2): FHIR resource setup, LHC-Forms integration
2. **Form Builder UI** (Weeks 3-5): Drag-and-drop, field configuration, preview
3. **Patient Binding** (Week 6): Auto-population service
4. **Validation** (Week 7): Zod schema generation, error messaging
5. **Digital Signatures** (Week 8): Capture, storage, verification
6. **Auto-Save** (Week 9): IndexedDB, background sync, draft recovery
7. **PDF Export** (Week 10): @react-pdf/renderer + Puppeteer bot
8. **Conditional Logic** (Week 11): enableWhen support, FHIRPath expressions
9. **Search** (Week 12): Form search, pagination, full-text search
10. **Management** (Week 13): Versioning, cloning, archiving
11. **Analytics** (Week 14): Dashboard, completion rates, reporting

## Implementation Notes

### Critical Path Dependencies

```
Week 1-2:  Foundation (FHIR + LHC-Forms)
    ↓
Week 3-5:  Form Builder UI (dnd-kit + React Hook Form)
    ↓
Week 6:    Patient Binding (auto-population)
    ↓
Week 7:    Validation (Zod schemas)
    ↓
Week 8-14: Parallel implementation of remaining features
           (Signatures, Auto-Save, PDF, Logic, Search, Management, Analytics)
```

### Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| LHC-Forms rendering issues | Test with sample FHIR Questionnaires early (Week 1) |
| dnd-kit touch support bugs | Test on real tablets (iPad, Android) in Week 3 |
| Georgian font PDF rendering | Test Noto Sans Georgian in Puppeteer (Week 1) |
| IndexedDB quota exceeded | Implement quota monitoring + cleanup (Week 9) |
| Signature legal compliance | Legal review of E-SIGN/21 CFR Part 11 (Week 8) |
| Performance degradation (large forms) | Implement virtual scrolling early (Week 2) |

### Testing Strategy

1. **Unit Tests** (Jest + React Testing Library):
   - Target: >80% code coverage
   - Colocated with source code (ComponentName.test.tsx)
   - MockClient for FHIR testing

2. **Integration Tests** (Playwright):
   - E2E workflows (create form, fill form, search form)
   - Real FHIR server (Medplum test instance)
   - Test across browsers (Chrome, Firefox, Safari)

3. **Accessibility Tests** (axe-playwright):
   - WCAG 2.1 Level AA compliance
   - Keyboard navigation (Tab, Enter, Esc, Arrow keys)
   - Screen reader compatibility (VoiceOver, NVDA, JAWS)

4. **Performance Tests**:
   - Form rendering benchmarks (10, 50, 100, 500 fields)
   - Auto-save latency measurements
   - PDF generation time limits (5s max)
   - Search query performance (10,000+ forms)

### Deployment Checklist

- [ ] Database migrations for new FHIR extensions (if any)
- [ ] Redis cache warm-up for frequently accessed forms
- [ ] Puppeteer Docker image with Georgian fonts (Noto Sans Georgian)
- [ ] S3 bucket for PDF storage (if using S3)
- [ ] CloudFront CDN for PDF downloads (optional)
- [ ] Monitoring alerts for PDF generation failures
- [ ] User training materials (form builder guide, screenshots)
- [ ] Phased rollout (10% → 50% → 100% of users)

## Next Steps

1. ✅ **Phase 0: Research** - COMPLETE (6 research documents produced)
2. 🔄 **Phase 1: Data Model & Contracts** - IN PROGRESS
   - Generate `data-model.md` with detailed FHIR resource schemas
   - Create `contracts/` directory with OpenAPI specs
   - Write `quickstart.md` for developers
   - Update agent context with new technologies
3. ⏳ **Phase 2: Tasks** - Run `/speckit.tasks` to generate dependency-ordered task list
4. ⏳ **Phase 3: Implementation** - Begin 14-week development roadmap

---

**Implementation Plan Complete**: 2025-11-21
**Author**: Claude Code (Anthropic)
**Next Command**: Generate data model and contracts (Phase 1 continuation)
