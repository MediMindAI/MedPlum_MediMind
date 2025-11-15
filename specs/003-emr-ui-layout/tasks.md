# Implementation Tasks: EMR UI Layout on Medplum

**Branch**: `003-emr-ui-layout` | **Generated**: 2025-11-12
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Quick Reference

**Total Tasks**: 58
**User Stories**: 5 (US1-US5)
**Priority Breakdown**: P1 (2 stories), P2 (2 stories), P3 (1 story)
**Parallel Opportunities**: 31 tasks marked [P]

## MVP Scope Recommendation

**Minimum Viable Product**: User Story 5 + User Story 1 (Translation System + Main Menu)
- **Why**: Delivers core navigation structure with language switching
- **Value**: Users can see and navigate the menu in all 3 languages
- **Tasks**: T001-T022 (22 tasks)
- **Estimated Effort**: 2-3 days

---

## Task Summary by User Story

| Story | Priority | Task Range | Count | Description |
|-------|----------|------------|-------|-------------|
| Setup | - | T001-T004 | 4 | Project structure and dependencies |
| Foundational | - | T005-T012 | 8 | TypeScript types and translation data |
| US5 | P1 | T013-T022 | 10 | Multilingual Translation System |
| US1 | P1 | T023-T032 | 10 | Main Navigation Menu Display |
| US2 | P2 | T033-T041 | 9 | Registration Sub-Menu Navigation |
| US3 | P2 | T042-T050 | 9 | Patient History Sub-Menu Navigation |
| US4 | P3 | T051-T056 | 6 | Other Main Menu Items |
| Polish | - | T057-T058 | 2 | Cross-cutting concerns |

---

## Dependency Graph

```
Setup Phase (T001-T004)
    ↓
Foundational Phase (T005-T012)
    ↓
US5: Translation System (T013-T022) [P1 - MUST BE FIRST]
    ↓
US1: Main Menu (T023-T032) [P1 - Depends on US5]
    ↓
    ├─→ US2: Registration Sub-Menu (T033-T041) [P2 - Depends on US1]
    │
    └─→ US3: Patient History Sub-Menu (T042-T050) [P2 - Depends on US1, PARALLEL with US2]

    ↓
US4: Other Menus (T051-T056) [P3 - Depends on US1]
    ↓
Polish Phase (T057-T058)
```

**Critical Path**: Setup → Foundational → US5 → US1 → (US2 || US3) → US4 → Polish

**Parallel Execution Opportunities**:
- Setup phase: Most tasks can run in parallel after T001
- Foundational phase: T006-T012 can run in parallel after T005
- US2 and US3 can be implemented in parallel (different files, no dependencies)
- Within each story: Component creation tasks can be parallelized

---

## Phase 1: Setup

**Goal**: Initialize project structure and ensure environment is ready

- [x] T001 Create EMR feature folder structure at packages/app/src/emr/
- [x] T002 [P] Create components subfolder at packages/app/src/emr/components/
- [x] T003 [P] Create translations subfolder at packages/app/src/emr/translations/
- [x] T004 [P] Create hooks subfolder at packages/app/src/emr/hooks/ and types subfolder at packages/app/src/emr/types/

---

## Phase 2: Foundational Tasks

**Goal**: Establish type-safe foundation for all user stories

**Blocking Prerequisites**: These MUST be completed before any user story implementation

### TypeScript Type Definitions

- [x] T005 Create translation types in packages/app/src/emr/types/translation.ts (SupportedLanguage, TranslationKey, Translations)
- [x] T006 [P] Create menu structure types in packages/app/src/emr/types/menu.ts (MainMenuItem, SubMenuItem, MenuStructure)
- [x] T007 [P] Create navigation state types in packages/app/src/emr/types/navigation.ts (NavigationState, EMRLayoutState)
- [x] T008 [P] Create index export file at packages/app/src/emr/types/index.ts

### Translation Data

- [x] T009 [P] Create Georgian translations in packages/app/src/emr/translations/ka.json with all 35 translation keys
- [x] T010 [P] Create English translations in packages/app/src/emr/translations/en.json with all 35 translation keys
- [x] T011 [P] Create Russian translations in packages/app/src/emr/translations/ru.json with all 35 translation keys
- [x] T012 Create menu structure data in packages/app/src/emr/translations/menu-structure.ts with all 6 main items and 22 sub-items

---

## Phase 3: User Story 5 - Multilingual Translation System (P1)

**Story Goal**: Enable language switching between Georgian, English, and Russian with persistent user preferences

**Why P1**: Foundational requirement affecting all other features. Must be implemented first.

**Independent Test Criteria**:
- ✅ User can switch between ka/en/ru languages via LanguageSelector
- ✅ Selected language persists in localStorage after page refresh
- ✅ All visible UI labels update within 500ms of language change
- ✅ Missing translations fall back to Georgian

### Translation Hook

- [x] T013 [US5] Implement useTranslation hook in packages/app/src/emr/hooks/useTranslation.ts with t(), lang, setLang functions
- [x] T014 [P] [US5] Write unit tests for useTranslation hook in packages/app/src/emr/hooks/useTranslation.test.ts

### Translation Utilities

- [x] T015 [P] [US5] Implement localStorage helpers in packages/app/src/emr/hooks/useTranslation.ts for language persistence
- [x] T016 [P] [US5] Implement type guard functions isSupportedLanguage() and isTranslationKey() in packages/app/src/emr/types/translation.ts

### Language Selector Component

- [x] T017 [US5] Create LanguageSelector component at packages/app/src/emr/components/LanguageSelector/LanguageSelector.tsx
- [x] T018 [P] [US5] Create LanguageSelector styles at packages/app/src/emr/components/LanguageSelector/LanguageSelector.module.css
- [x] T019 [P] [US5] Write LanguageSelector component tests at packages/app/src/emr/components/LanguageSelector/LanguageSelector.test.tsx

### Translation Validation

- [x] T020 [P] [US5] Implement translation validation function validateTranslations() in packages/app/src/emr/translations/validation.ts
- [x] T021 [P] [US5] Implement menu structure validation function validateMenuStructure() in packages/app/src/emr/translations/validation.ts
- [x] T022 [P] [US5] Write validation tests at packages/app/src/emr/translations/validation.test.ts

**Acceptance Criteria** (from spec.md):
- [x] User viewing Georgian interface can switch to English, all labels update to English
- [x] User viewing English interface can switch to Russian, all labels update to Russian
- [x] Selected language persists after page refresh
- [x] New components automatically support all 3 languages via translation keys

---

## Phase 4: User Story 1 - Main Navigation Menu Display (P1)

**Story Goal**: Display horizontal main menu with 6 items, language switching, and visual active states

**Why P1**: Entry point to entire EMR system. Users cannot access functionality without it.

**Depends On**: US5 (Translation System)

**Independent Test Criteria**:
- ✅ 6 main menu items appear horizontally on page load
- ✅ Clicking menu item makes it visually active and shows sub-menu
- ✅ Language switching updates all menu labels
- ✅ Medplum sidebar is collapsed by default

### Navigation Hook

- [x] T023 [US1] Implement useEMRNavigation hook in packages/app/src/emr/hooks/useEMRNavigation.ts with state, toggleSidebar, setActiveMenu functions
- [x] T024 [P] [US1] Write unit tests for useEMRNavigation hook in packages/app/src/emr/hooks/useEMRNavigation.test.ts

### Main Menu Component

- [x] T025 [US1] Create EMRMainMenu component at packages/app/src/emr/components/EMRMainMenu/EMRMainMenu.tsx rendering 6 main items horizontally
- [x] T026 [P] [US1] Create EMRMainMenu styles at packages/app/src/emr/components/EMRMainMenu/EMRMainMenu.module.css with horizontal layout and active states
- [x] T027 [P] [US1] Write EMRMainMenu component tests at packages/app/src/emr/components/EMRMainMenu/EMRMainMenu.test.tsx

### Main Layout Component

- [x] T028 [US1] Create EMRPage layout component at packages/app/src/emr/EMRPage.tsx integrating EMRMainMenu and LanguageSelector
- [x] T029 [P] [US1] Create EMRPage styles at packages/app/src/emr/EMRPage.module.css
- [x] T030 [P] [US1] Write EMRPage component tests at packages/app/src/emr/EMRPage.test.tsx

### Routing Integration

- [x] T031 [US1] Add /emr route to packages/app/src/AppRoutes.tsx with nested route structure
- [x] T032 [US1] Write integration tests for EMR routing in packages/app/src/emr/EMRRouting.test.tsx testing navigation flow

**Acceptance Criteria** (from spec.md):
- [x] User sees 6 main menu items on page load (Registration, Patient History, Nomenclature, Administration, Forward, Reports)
- [x] Clicking menu item makes it visually active and shows sub-menu
- [x] Switching language updates all menu labels
- [x] Medplum sidebar is collapsed by default and doesn't interfere with EMR menu

---

## Phase 5: User Story 2 - Registration Sub-Menu Navigation (P2)

**Story Goal**: Provide access to 9 Registration sub-sections with navigation and placeholder views

**Why P2**: Registration is first point of contact for patients, frequently used module

**Depends On**: US1 (Main Menu Display)

**Independent Test Criteria**:
- ✅ Clicking Registration menu shows 9 sub-menu items vertically
- ✅ Clicking sub-menu item makes it visually active and shows placeholder
- ✅ Language switching updates all sub-menu labels
- ✅ All 9 routes are accessible via URL

### Sub-Menu Component

- [x] T033 [US2] Create EMRSubMenu component at packages/app/src/emr/components/EMRSubMenu/EMRSubMenu.tsx rendering sub-items vertically
- [x] T034 [P] [US2] Create EMRSubMenu styles at packages/app/src/emr/components/EMRSubMenu/EMRSubMenu.module.css with vertical sidebar layout
- [x] T035 [P] [US2] Write EMRSubMenu component tests at packages/app/src/emr/components/EMRSubMenu/EMRSubMenu.test.tsx

### Registration Views

- [x] T036 [P] [US2] Create placeholder view component at packages/app/src/emr/components/PlaceholderView/PlaceholderView.tsx showing "Under Development" message
- [x] T037 [P] [US2] Create placeholder view styles at packages/app/src/emr/components/PlaceholderView/PlaceholderView.module.css
- [x] T038 [US2] Integrate EMRSubMenu into EMRPage for Registration section in packages/app/src/emr/EMRPage.tsx

### Registration Routing

- [x] T039 [US2] Add 9 Registration sub-routes to packages/app/src/AppRoutes.tsx under /emr/registration/* paths
- [x] T040 [P] [US2] Write routing tests for Registration paths in packages/app/src/emr/EMRPage.test.tsx
- [x] T041 [US2] Write integration test for full Registration navigation flow (main menu → sub-menu → placeholder) in packages/app/src/emr/EMRPage.test.tsx

**Acceptance Criteria** (from spec.md):
- [x] Clicking Registration shows 9 sub-items (Registration, Receiver, Contracts, Inpatient, Debts, Advances, Archive, Referrals, Currency)
- [x] Clicking sub-item makes it active and displays placeholder content
- [x] Language switching updates all 9 sub-menu labels

---

## Phase 6: User Story 3 - Patient History Sub-Menu Navigation (P2)

**Story Goal**: Provide access to 13 Patient History sub-sections with navigation and placeholder views

**Why P2**: Primary clinical workspace for doctors and nurses, critical for daily operations

**Depends On**: US1 (Main Menu Display)

**Can Run in Parallel With**: US2 (different files, no shared dependencies)

**Independent Test Criteria**:
- ✅ Clicking Patient History menu shows 13 sub-menu items vertically
- ✅ Clicking sub-menu item makes it visually active and shows placeholder
- ✅ Language switching updates all sub-menu labels
- ✅ All 13 routes are accessible via URL

### Patient History Views

- [x] T042 [US3] Integrate EMRSubMenu into EMRPage for Patient History section in packages/app/src/emr/EMRPage.tsx (reuse component from US2)
- [x] T043 [P] [US3] Write EMRSubMenu rendering tests specific to Patient History in packages/app/src/emr/components/EMRSubMenu/EMRSubMenu.test.tsx

### Patient History Routing

- [x] T044 [US3] Add 13 Patient History sub-routes to packages/app/src/AppRoutes.tsx under /emr/patient-history/* paths
- [x] T045 [P] [US3] Write routing tests for Patient History paths in packages/app/src/emr/EMRPage.test.tsx
- [x] T046 [US3] Write integration test for full Patient History navigation flow (main menu → sub-menu → placeholder) in packages/app/src/emr/EMRPage.test.tsx

### Edge Case Handling

- [x] T047 [P] [US3] Implement translation fallback logic in useTranslation hook for missing keys (fallback to Georgian)
- [x] T048 [P] [US3] Write tests for translation fallback behavior in packages/app/src/emr/hooks/useTranslation.test.tsx
- [x] T049 [P] [US3] Write tests for language switching while viewing sub-section (maintains active view) in packages/app/src/emr/EMRPage.test.tsx
- [x] T050 [P] [US3] Write tests for localStorage persistence across page refresh in packages/app/src/emr/hooks/useTranslation.test.tsx

**Acceptance Criteria** (from spec.md):
- [x] Clicking Patient History shows 13 sub-items (History, My Patients, Surrogacy, Invoices, Form 100, Prescriptions, Execution, Laboratory, Duty, Appointments, Hospital, Nutrition, MOH)
- [x] Clicking sub-item makes it active and displays placeholder content
- [x] Language switching updates all 13 sub-menu labels

---

## Phase 7: User Story 4 - Other Main Menu Items Navigation (P3)

**Story Goal**: Complete navigation structure with placeholder support for Nomenclature, Administration, Forward, Reports

**Why P3**: Supporting sections used less frequently than Registration and Patient History

**Depends On**: US1 (Main Menu Display)

**Independent Test Criteria**:
- ✅ Clicking Nomenclature/Administration/Forward/Reports shows placeholder message
- ✅ Language switching updates menu labels
- ✅ All 4 routes are accessible via URL

### Placeholder Routes

- [x] T051 [P] [US4] Add Nomenclature route to packages/app/src/AppRoutes.tsx at /emr/nomenclature with PlaceholderView
- [x] T052 [P] [US4] Add Administration route to packages/app/src/AppRoutes.tsx at /emr/administration with PlaceholderView
- [x] T053 [P] [US4] Add Forward route to packages/app/src/AppRoutes.tsx at /emr/forward with PlaceholderView
- [x] T054 [P] [US4] Add Reports route to packages/app/src/AppRoutes.tsx at /emr/reports with PlaceholderView

### Testing

- [x] T055 [P] [US4] Write routing tests for all 4 placeholder sections in packages/app/src/emr/EMRPage.test.tsx
- [x] T056 [US4] Write integration test verifying placeholder message displays correctly in all 3 languages in packages/app/src/emr/components/PlaceholderView/PlaceholderView.test.tsx

**Acceptance Criteria** (from spec.md):
- [x] Clicking Nomenclature/Administration/Forward/Reports makes menu item active and shows placeholder
- [x] Language switching updates menu labels

---

## Phase 8: Polish & Cross-Cutting Concerns

**Goal**: Final touches and quality assurance

- [x] T057 Run ESLint and Prettier on all EMR files packages/app/src/emr/**/*.{ts,tsx}
- [x] T058 Verify Georgian character rendering by testing with real Georgian text in all components

---

## Parallel Execution Strategies

### By Phase

**Setup Phase** (T001-T004):
```bash
# After T001 (folder structure), run in parallel:
T002 && T003 && T004  # All folder creation tasks
```

**Foundational Phase** (T005-T012):
```bash
# After T005 (translation types), run in parallel:
T006 && T007 && T008  # Type definitions
T009 && T010 && T011 && T012  # Translation data files
```

**User Story 5** (T013-T022):
```bash
# Can parallelize component and validation work:
(T017 && T018 && T019)  # LanguageSelector component
(T020 && T021 && T022)  # Validation functions
```

**User Stories 2 & 3** (T033-T050):
```bash
# US2 and US3 can run completely in parallel:
# Team A implements US2 (Registration)
# Team B implements US3 (Patient History)
```

### By Component

**Within Each User Story**:
- Component creation (TSX) → Style (CSS) → Tests (test.tsx) can be done by different developers
- Mark tasks with [P] to indicate parallelizable work

---

## Implementation Strategy

### Week 1: MVP (US5 + US1)
**Goal**: Deliverable navigation with language switching

- Days 1-2: Setup + Foundational + US5 (Translation System)
- Days 3-4: US1 (Main Menu Display)
- Day 5: Testing and bug fixes

**Deliverable**: Working EMR menu with 6 items, language switching, no sub-menus yet

### Week 2: Core Features (US2 + US3)
**Goal**: Complete Registration and Patient History navigation

- Days 1-3: US2 (Registration Sub-Menu) - Can be parallel
- Days 1-3: US3 (Patient History Sub-Menu) - Can be parallel
- Days 4-5: Integration testing and bug fixes

**Deliverable**: Full Registration and Patient History navigation with placeholders

### Week 3: Completion (US4 + Polish)
**Goal**: Complete all features and polish

- Days 1-2: US4 (Other Menu Items)
- Days 3-5: Polish, testing, documentation

**Deliverable**: Complete EMR UI Layout ready for production

---

## Testing Checklist

### Unit Tests
- [ ] useTranslation hook (language switching, localStorage)
- [ ] useEMRNavigation hook (state management, sidebar toggle)
- [ ] Translation validation functions
- [ ] Type guard functions

### Component Tests
- [ ] LanguageSelector component renders and switches languages
- [ ] EMRMainMenu component renders 6 items, handles clicks, shows active state
- [ ] EMRSubMenu component renders sub-items, handles clicks, shows active state
- [ ] PlaceholderView component displays message in all languages
- [ ] EMRPage component integrates all components correctly

### Integration Tests
- [ ] Full navigation flow: main menu → sub-menu → placeholder
- [ ] Language switching updates all visible labels
- [ ] localStorage persistence across page refresh
- [ ] URL routing works for all paths
- [ ] No visual conflicts with Medplum sidebar

### Edge Case Tests
- [ ] Missing translation keys fall back to Georgian
- [ ] Invalid language code defaults to Georgian
- [ ] Language switching maintains current sub-section
- [ ] Georgian Cyrillic characters render correctly

---

## Success Metrics (from spec.md)

After implementation, verify:
- [ ] SC-001: 6 main menu items load within 1 second
- [ ] SC-002: Sub-menu items (9 + 13) load within 1 second of clicking main item
- [ ] SC-003: Language switching updates labels within 500ms
- [ ] SC-004: 100% of menu labels have translations in all 3 languages
- [ ] SC-005: Language preference persists across sessions
- [ ] SC-006: No visual overlap between EMR menu and Medplum sidebar
- [ ] SC-007: Menu structure matches documentation exactly
- [ ] SC-008: Any menu item reachable within 2 clicks

---

## File Tree (Expected After Completion)

```
packages/app/src/emr/
├── types/
│   ├── translation.ts          # SupportedLanguage, TranslationKey, Translations
│   ├── menu.ts                 # MainMenuItem, SubMenuItem, MenuStructure
│   ├── navigation.ts           # NavigationState, EMRLayoutState
│   └── index.ts                # Type exports
├── translations/
│   ├── ka.json                 # Georgian translations (33 keys)
│   ├── en.json                 # English translations (33 keys)
│   ├── ru.json                 # Russian translations (33 keys)
│   ├── menu-structure.ts       # Menu structure data (6 main + 22 sub)
│   ├── validation.ts           # Validation functions
│   └── validation.test.ts      # Validation tests
├── hooks/
│   ├── useTranslation.ts       # Translation hook
│   ├── useTranslation.test.ts  # Translation hook tests
│   ├── useEMRNavigation.ts     # Navigation state hook
│   ├── useEMRNavigation.test.ts # Navigation hook tests
│   └── index.ts                # Hook exports
├── components/
│   ├── EMRMainMenu/
│   │   ├── EMRMainMenu.tsx
│   │   ├── EMRMainMenu.module.css
│   │   └── EMRMainMenu.test.tsx
│   ├── EMRSubMenu/
│   │   ├── EMRSubMenu.tsx
│   │   ├── EMRSubMenu.module.css
│   │   └── EMRSubMenu.test.tsx
│   ├── LanguageSelector/
│   │   ├── LanguageSelector.tsx
│   │   ├── LanguageSelector.module.css
│   │   └── LanguageSelector.test.tsx
│   └── PlaceholderView/
│       ├── PlaceholderView.tsx
│       ├── PlaceholderView.module.css
│       └── PlaceholderView.test.tsx
├── EMRPage.tsx                 # Main layout component
├── EMRPage.module.css          # Layout styles
└── EMRPage.test.tsx            # Layout tests
```

**Total Files**: 40 files (16 components, 8 tests, 4 types, 4 translations, 4 hooks, 4 styles)

---

## Next Steps

1. **Start with MVP**: Implement T001-T022 (Setup + Foundational + US5 + US1)
2. **Get feedback**: Demo main menu with language switching to stakeholders
3. **Iterate**: Implement US2 and US3 in parallel
4. **Complete**: Add US4 placeholder sections
5. **Polish**: Run T057-T058 for code quality

**Ready to begin implementation!** 🚀

---

**Generated**: 2025-11-12 by `/speckit.tasks`
**Last Updated**: 2025-11-12
