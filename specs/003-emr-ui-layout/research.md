# Research: EMR UI Layout on Medplum

**Branch**: `003-emr-ui-layout` | **Date**: 2025-11-12
**Status**: Complete

This document captures research findings on how to implement the EMR UI Layout feature following Medplum's existing patterns and conventions.

## Research Questions & Decisions

### 1. Translation/Internationalization Library

**Question**: Which i18n library should we use for Georgian/English/Russian support?

**Findings**:
- Medplum has NO existing internationalization system
- All UI text is currently hardcoded in English
- No evidence of i18next, react-intl, or any i18n library in codebase

**Decision**: Implement custom lightweight translation system

**Rationale**:
1. **Simplicity**: Adding a full i18n library for 3 languages is overkill
2. **No breaking changes**: Introducing i18next would affect bundle size and require broader adoption
3. **Localized scope**: Translation needs are limited to EMR UI only, not entire Medplum app
4. **Type safety**: Custom solution can be fully type-safe with TypeScript

**Alternatives Considered**:
- **i18next**: Too heavy (50KB+), requires provider setup, affects entire app
- **react-intl**: Similar weight and complexity concerns
- **Lingui**: Good TypeScript support but adds build complexity

**Implementation Approach**:
```typescript
// Translation structure in TypeScript files
export const translations = {
  ka: {  // Georgian
    'menu.registration': 'რეგისტრაცია',
    'menu.patientHistory': 'პაციენტის ისტორია',
    // ...
  },
  en: {  // English
    'menu.registration': 'Registration',
    'menu.patientHistory': 'Patient History',
    // ...
  },
  ru: {  // Russian
    'menu.registration': 'Регистрация',
    'menu.patientHistory': 'История пациента',
    // ...
  },
} as const;

// Simple hook
export function useTranslation() {
  const [lang, setLang] = useState<'ka' | 'en' | 'ru'>(
    (localStorage['emrLanguage'] as 'ka' | 'en' | 'ru') || 'ka'
  );

  const t = (key: keyof typeof translations.ka): string => {
    return translations[lang][key] || translations.ka[key];
  };

  return { t, lang, setLang };
}
```

---

### 2. Package Structure & Organization

**Question**: Where within the Medplum monorepo should EMR components live?

**Findings**:
- Medplum uses feature-based folders within `packages/app/src/`
- Examples: `admin/`, `resource/`, `lab/`
- Components are colocated with tests and styles
- Pattern: `ComponentName.tsx`, `ComponentName.test.tsx`, `ComponentName.module.css`

**Decision**: Create `packages/app/src/emr/` feature folder

**Rationale**:
1. **Follows established patterns**: Matches existing `admin/`, `lab/` folder structure
2. **Feature isolation**: All EMR code lives in one place
3. **Scalability**: Easy to add more EMR features in future
4. **Clear ownership**: Distinct boundary for EMR-specific code

**Alternatives Considered**:
- **Separate package** (`packages/emr-ui`): Overkill for app-specific UI, would require package.json management
- **Direct in src/** (no folder): Would pollute root src directory, harder to organize

**Structure**:
```text
packages/app/src/emr/
├── EMRPage.tsx                    # Main EMR page component
├── EMRPage.test.tsx
├── EMRPage.module.css
├── components/
│   ├── EMRMainMenu/
│   │   ├── EMRMainMenu.tsx
│   │   ├── EMRMainMenu.test.tsx
│   │   └── EMRMainMenu.module.css
│   ├── EMRSubMenu/
│   │   ├── EMRSubMenu.tsx
│   │   ├── EMRSubMenu.test.tsx
│   │   └── EMRSubMenu.module.css
│   └── LanguageSelector/
│       ├── LanguageSelector.tsx
│       ├── LanguageSelector.test.tsx
│       └── LanguageSelector.module.css
├── hooks/
│   ├── useTranslation.ts
│   ├── useTranslation.test.ts
│   ├── useEMRNavigation.ts
│   └── useEMRNavigation.test.ts
├── translations/
│   ├── index.ts                   # Translation data export
│   └── menu-structure.ts          # Menu structure definition
└── types/
    └── menu.ts                    # TypeScript interfaces
```

---

### 3. Medplum Sidebar Integration

**Question**: How to control Medplum's default sidebar state without breaking existing functionality?

**Findings**:
- Sidebar implemented in `packages/react/src/AppShell/AppShell.tsx`
- Uses `useState` with `localStorage['navbarOpen']` for persistence
- Controlled via `navbarOpen` state and `toggleNavbar` callback
- Mantine's AppShell component handles responsive behavior

**Decision**: Do NOT modify Medplum sidebar; implement independent EMR layout

**Rationale**:
1. **No breaking changes**: Modifying AppShell would affect entire Medplum app
2. **Clear separation**: EMR layout is distinct from Medplum admin UI
3. **Constitution compliance**: Constraint states "cannot modify Medplum sidebar"
4. **Independent state**: EMR layout can have its own sidebar logic

**Implementation Approach**:
```typescript
// EMRPage will have its own layout independent of Medplum's AppShell
export function EMRPage(): JSX.Element {
  const { sidebarOpen, toggleSidebar } = useEMRLayout();

  return (
    <Box style={{ display: 'flex', height: '100vh' }}>
      {/* EMR Main Menu (horizontal) */}
      <EMRMainMenu />

      <Box style={{ display: 'flex', flex: 1 }}>
        {/* EMR Sub-Menu (vertical sidebar) */}
        {sidebarOpen && <EMRSubMenu />}

        {/* Content Area */}
        <Box style={{ flex: 1 }}>
          <Outlet />  {/* Nested routes render here */}
        </Box>
      </Box>
    </Box>
  );
}
```

**Alternatives Considered**:
- **Modify AppShell**: Rejected due to breaking change risk and constitution constraint
- **Use AppShell's navbar**: Rejected because we need custom menu structure
- **Nested AppShell**: Would cause visual conflicts and complexity

---

### 4. Routing Strategy

**Question**: How to integrate EMR routes with existing Medplum routing?

**Findings**:
- React Router v7.9.5 already in use
- Routes defined in `packages/app/src/AppRoutes.tsx`
- Supports nested routes with `<Outlet />` pattern
- Example: `/admin` has nested routes like `/admin/patients`, `/admin/bots`

**Decision**: Add top-level `/emr` route with nested sub-routes

**Rationale**:
1. **Clean URLs**: `/emr/registration/receiver`, `/emr/patient-history/timeline`
2. **Follows patterns**: Matches `/admin/*` route structure
3. **Flexible**: Easy to add new sections without route refactoring
4. **State preservation**: URL-based state naturally preserves navigation

**Implementation**:
```typescript
// In packages/app/src/AppRoutes.tsx
<Route path="/emr" element={<EMRPage />}>
  {/* Registration sub-routes */}
  <Route path="registration" element={<RegistrationLayout />}>
    <Route path="registration" element={<RegistrationView />} />
    <Route path="receiver" element={<ReceiverView />} />
    <Route path="contracts" element={<ContractsView />} />
    <Route path="inpatient" element={<InpatientView />} />
    <Route path="debts" element={<DebtsView />} />
    <Route path="advances" element={<AdvancesView />} />
    <Route path="archive" element={<ArchiveView />} />
    <Route path="referrals" element={<ReferralsView />} />
    <Route path="currency" element={<CurrencyView />} />
  </Route>

  {/* Patient History sub-routes */}
  <Route path="patient-history" element={<PatientHistoryLayout />}>
    <Route path="history" element={<HistoryView />} />
    <Route path="my-patients" element={<MyPatientsView />} />
    <Route path="surrogacy" element={<SurrogacyView />} />
    <Route path="invoices" element={<InvoicesView />} />
    <Route path="form-100" element={<Form100View />} />
    <Route path="prescriptions" element={<PrescriptionsView />} />
    <Route path="execution" element={<ExecutionView />} />
    <Route path="laboratory" element={<LaboratoryView />} />
    <Route path="duty" element={<DutyView />} />
    <Route path="appointments" element={<AppointmentsView />} />
    <Route path="hospital" element={<HospitalView />} />
    <Route path="nutrition" element={<NutritionView />} />
    <Route path="moh" element={<MOHView />} />
  </Route>

  {/* Placeholder routes for other sections */}
  <Route path="nomenclature" element={<PlaceholderView section="nomenclature" />} />
  <Route path="administration" element={<PlaceholderView section="administration" />} />
  <Route path="forward" element={<PlaceholderView section="forward" />} />
  <Route path="reports" element={<PlaceholderView section="reports" />} />

  {/* Default redirect */}
  <Route index element={<Navigate to="/emr/registration/registration" replace />} />
</Route>
```

**Alternatives Considered**:
- **Flat routes** (`/emr-registration-receiver`): Poor UX, hard to maintain
- **Query params** (`/emr?section=registration&view=receiver`): State not preserved in bookmarks, harder navigation
- **Patient-scoped routes** (`/Patient/:id/emr`): Conflates resource routing with EMR UI routing

---

### 5. Logging & Observability

**Question**: What logging approach aligns with Medplum's patterns?

**Findings**:
- Medplum uses minimal logging: direct `console.error` in catch blocks
- Pattern: `.catch(console.error)` for promise rejections
- User feedback: `showNotification()` from `@mantine/notifications`
- No centralized logging utility or error tracking service

**Decision**: Use simple console.error + showNotification pattern

**Rationale**:
1. **Consistency**: Matches existing Medplum patterns
2. **Simplicity**: No new dependencies or infrastructure
3. **Sufficient**: EMR navigation is low-risk UI with minimal error cases
4. **User feedback**: Notifications provide actionable error messages

**Implementation**:
```typescript
// In EMR components
import { showNotification } from '@mantine/notifications';

export function EMRMainMenu(): JSX.Element {
  const navigate = useMedplumNavigate();
  const { t, setLang } = useTranslation();

  const handleLanguageChange = (newLang: 'ka' | 'en' | 'ru'): void => {
    try {
      setLang(newLang);
      showNotification({
        message: t('notification.languageChanged'),
        color: 'green',
      });
    } catch (err) {
      console.error('Failed to change language:', err);
      showNotification({
        message: t('notification.languageChangeFailed'),
        color: 'red',
        autoClose: false,
      });
    }
  };

  const handleNavigate = (path: string): void => {
    navigate(path).catch((err) => {
      console.error('Navigation failed:', err);
      showNotification({
        message: t('notification.navigationFailed'),
        color: 'red',
      });
    });
  };

  // ... rest of component
}
```

**Alternatives Considered**:
- **Sentry/error tracking**: Overkill for UI-only navigation feature
- **Custom logging utility**: Would diverge from Medplum patterns, adds complexity
- **Silent failures**: Poor UX, users wouldn't know when errors occur

---

## Dependencies Summary

All required dependencies are already available in the Medplum monorepo:

| Dependency | Version | Purpose |
|------------|---------|---------|
| `react` | 19.x | Component framework |
| `react-router` | 7.9.5 | Client-side routing |
| `@mantine/core` | 8.3.6 | UI component library |
| `@mantine/notifications` | 8.3.6 | Toast notifications |
| `@tabler/icons-react` | 3.35.0 | Icon library |
| `@medplum/react-hooks` | (workspace) | Medplum-specific hooks |
| `@medplum/mock` | (workspace) | Testing mock client |

**No new dependencies required.**

---

## Risk Assessment

### Low Risk
- ✅ Translation implementation (isolated, simple logic)
- ✅ Component structure (follows established patterns)
- ✅ Routing integration (additive, no modifications to existing routes)
- ✅ Logging approach (uses existing patterns)

### Medium Risk
- ⚠️ **UTF-8 Georgian character handling**: Need to verify proper encoding in build pipeline
  - **Mitigation**: Test Georgian text rendering early, verify webpack/vite config
- ⚠️ **localStorage size limits**: Translation data + menu structures could be large
  - **Mitigation**: Keep translations lean, only store preference (not full translation data)

### High Risk
- None identified

---

## Code Examples & References

**Relevant Files for Reference**:
- Sidebar pattern: `packages/react/src/AppShell/AppShell.tsx`
- Routing example: `packages/app/src/AppRoutes.tsx`
- Component organization: `packages/app/src/admin/ProjectPage.tsx`
- Testing pattern: `packages/app/src/HomePage.test.tsx`

**Key Patterns to Follow**:
1. Colocated tests and styles
2. Simple useState + localStorage for persistence
3. React Router for navigation
4. MockClient for testing
5. Mantine UI components

---

## Recommendations for Implementation

### Phase 1 Priorities
1. Create `packages/app/src/emr/` folder structure
2. Implement `useTranslation` custom hook
3. Define translation data structure in TypeScript
4. Build `EMRMainMenu` component (horizontal menu)
5. Build `EMRSubMenu` component (vertical sidebar)
6. Build `LanguageSelector` component

### Testing Strategy
1. Unit tests for translation hook
2. Component tests for menu rendering
3. Integration tests for navigation flow
4. localStorage persistence tests
5. Georgian character rendering tests

### Documentation Needs
1. Developer guide for adding new menu items
2. Translation guide for adding new languages
3. Testing guide for EMR components
4. Architecture decision records (this research.md serves as one)

---

## Open Questions / Follow-up Tasks

✅ All research questions resolved.

**Ready to proceed to Phase 1: Data Model & Contracts Design**
