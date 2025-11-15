# Implementation Plan: EMR UI Layout on Medplum

**Branch**: `003-emr-ui-layout` | **Date**: 2025-11-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-emr-ui-layout/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a multilingual (Georgian/English/Russian) EMR navigation system within the Medplum React application. The system provides a two-tier menu structure (6 main items + sub-menus) matching the existing EMR system layout, with Registration (9 sub-items) and Patient History (13 sub-items) as primary sections. All UI text uses translation keys for language switching, with persistence across sessions. The menu integrates with Medplum's existing sidebar without conflicts.

## Technical Context

**Language/Version**: TypeScript 5.x (Medplum monorepo standard)
**Primary Dependencies**: React 19, Mantine UI (Medplum's UI library), React Router (existing), i18next (or similar translation library - NEEDS CLARIFICATION)
**Storage**: Browser localStorage for language preference persistence; menu structures stored in JSON/TypeScript translation files
**Testing**: Jest (Medplum standard), React Testing Library for component tests
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge) - desktop-first, responsive secondary
**Project Type**: Web application (React SPA within Medplum monorepo)
**Performance Goals**: <500ms language switching, <1s menu rendering, instant navigation feel
**Constraints**: Cannot modify Medplum sidebar structure, must handle Georgian Cyrillic (UTF-8), no breaking changes to existing Medplum functionality
**Scale/Scope**: 6 main menu items, 35 total sub-menu items (9 Registration + 13 Patient History + 13 placeholder), 3 languages, placeholder content areas only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. FHIR-First Architecture
**Status**: ✅ PASS (with exception)
**Assessment**: This feature is UI-only navigation scaffolding with no FHIR resource operations. However, future menu content will interact with FHIR resources, so routing structure must accommodate FHIR resource URLs (e.g., `/Patient`, `/Encounter`).
**Action Required**: Ensure routing patterns align with future FHIR resource rendering.

### II. Package-Based Modularity
**Status**: ⚠️ NEEDS CLARIFICATION
**Assessment**: Feature will be implemented within `packages/app` (Medplum web app). Need to determine if the EMR menu components should be:
- Option A: Integrated directly into `packages/app/src/` as core app components
- Option B: Created as a separate package `packages/emr-ui` for potential reuse
- Option C: Created as a feature folder within `packages/app/src/emr/`

**Research Task**: Determine optimal package structure following Medplum conventions.

### III. Test-First Development (NON-NEGOTIABLE)
**Status**: ✅ PASS
**Assessment**: All React components will have colocated `.test.tsx` files using Jest + React Testing Library. Test cases will verify:
- Menu rendering
- Language switching
- Active state management
- localStorage persistence
- No conflicts with Medplum sidebar

### IV. Type Safety & Strict Mode
**Status**: ✅ PASS
**Assessment**: All TypeScript strict mode enabled (Medplum default). Types will be defined for:
- `MenuItem` interface (id, labels, route, parent, order)
- `SubMenuItem` interface (inherits from MenuItem)
- `TranslationKey` type for i18n keys
- `SupportedLanguage` union type ('ka' | 'en' | 'ru')

### V. Security & Compliance by Default
**Status**: ✅ PASS (minimal security surface)
**Assessment**: Feature uses existing Medplum authentication. No new auth flows, no data mutations, no external API calls. Menu visibility is not role-based in this phase (assumption from spec).

### VI. Build Order & Dependency Management
**Status**: ✅ PASS
**Assessment**: Feature integrates into existing `packages/app` which already has proper dependency hierarchy. Will use workspace references for any shared utilities.

### VII. Observability & Debugging
**Status**: ⚠️ NEEDS CLARIFICATION
**Assessment**: Need to determine logging strategy for:
- Language switching events (user analytics?)
- Menu navigation tracking (debugging/support)
- Translation fallback errors (missing keys)

**Research Task**: Define logging approach aligned with Medplum's observability patterns.

### Healthcare & Compliance Standards
**Status**: ✅ PASS (not applicable)
**Assessment**: No PHI handling, no audit requirements for UI navigation. Future content areas will require HIPAA compliance, but navigation structure itself does not.

### Development Workflow
**Status**: ✅ PASS
**Assessment**: Will follow standard Medplum PR workflow with Jest tests, ESLint, Prettier. Storybook stories recommended for menu components but not required for MVP.

## Project Structure

### Documentation (this feature)

```text
specs/003-emr-ui-layout/
├── spec.md              # Feature specification (already exists)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - Translation library choice, package structure
├── data-model.md        # Phase 1 output - MenuItem types, translation structure
├── quickstart.md        # Phase 1 output - Developer guide for adding menu items
├── contracts/           # Phase 1 output - (minimal for UI-only feature, may contain routing schema)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Medplum monorepo - packages/app integration (exact location TBD in Phase 0)

# Option A (if integrated into packages/app):
packages/app/
├── src/
│   ├── emr/                          # New folder for EMR-specific components
│   │   ├── components/
│   │   │   ├── EMRMainMenu/
│   │   │   │   ├── EMRMainMenu.tsx
│   │   │   │   ├── EMRMainMenu.test.tsx
│   │   │   │   └── EMRMainMenu.module.css
│   │   │   ├── EMRSubMenu/
│   │   │   │   ├── EMRSubMenu.tsx
│   │   │   │   ├── EMRSubMenu.test.tsx
│   │   │   │   └── EMRSubMenu.module.css
│   │   │   └── LanguageSelector/
│   │   │       ├── LanguageSelector.tsx
│   │   │       ├── LanguageSelector.test.tsx
│   │   │       └── LanguageSelector.module.css
│   │   ├── translations/
│   │   │   ├── ka.json               # Georgian translations
│   │   │   ├── en.json               # English translations
│   │   │   ├── ru.json               # Russian translations
│   │   │   └── menu-structure.ts     # Type-safe menu structure
│   │   ├── hooks/
│   │   │   ├── useLanguage.ts        # Language preference hook
│   │   │   └── useLanguage.test.ts
│   │   ├── pages/
│   │   │   ├── EMRLayout.tsx         # Main layout wrapper
│   │   │   └── EMRLayout.test.tsx
│   │   └── types/
│   │       └── menu.ts               # MenuItem, SubMenuItem interfaces
│   └── [existing Medplum app structure]
└── package.json

# Option B (if separate package - UNLIKELY based on monorepo conventions):
packages/emr-ui/
├── src/
│   ├── components/
│   ├── translations/
│   └── index.ts
└── package.json
```

**Structure Decision**: Will be determined in Phase 0 research after reviewing Medplum's conventions for feature organization within `packages/app`. Likely Option A (integrated folder) as this is app-specific UI, not a reusable library component.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations requiring justification at this stage. Two NEEDS CLARIFICATION items identified for Phase 0 research:
1. Translation library selection (i18next vs alternatives)
2. Package structure within Medplum app
3. Logging/observability approach

## Phase 0: Research & Discovery

**Status**: PENDING
**Output**: `research.md`

### Research Tasks

1. **Translation Library Selection**
   - **Question**: Which i18n library best integrates with Medplum's React setup?
   - **Options**: i18next, react-intl, custom solution
   - **Decision Criteria**: Bundle size, TypeScript support, localStorage integration, React hooks support
   - **Output**: Chosen library + rationale in research.md

2. **Package Structure & Organization**
   - **Question**: Where within `packages/app` should EMR components live?
   - **Method**: Review existing Medplum app structure, component organization patterns
   - **Decision Criteria**: Medplum conventions, scalability for future EMR features
   - **Output**: Concrete folder structure with justification

3. **Medplum Sidebar Integration**
   - **Question**: How to programmatically control Medplum sidebar default state?
   - **Method**: Review Medplum app layout components, sidebar state management
   - **Output**: Code snippet or approach for sidebar control

4. **Routing Strategy**
   - **Question**: How to integrate EMR routes with existing Medplum routing?
   - **Method**: Review `packages/app` routing setup (React Router patterns)
   - **Output**: Routing structure pattern (e.g., `/emr/registration/receiver`)

5. **Logging & Observability**
   - **Question**: What logging approach aligns with Medplum's patterns?
   - **Method**: Review existing Medplum logging utilities, console patterns
   - **Output**: Logging strategy for language switches and navigation events

### Research Deliverable

`research.md` will document:
- **Decision**: [Selected approach]
- **Rationale**: [Why chosen over alternatives]
- **Alternatives Considered**: [Other options evaluated]
- **Code Examples**: [If applicable]

## Phase 1: Design & Contracts

**Status**: PENDING (blocked by Phase 0)
**Output**: `data-model.md`, `contracts/`, `quickstart.md`

### Data Model Design

**File**: `data-model.md`

Will define:

1. **MenuItem Interface**
   ```typescript
   interface MenuItem {
     id: string;
     labelKey: string;           // Translation key (e.g., 'menu.registration')
     route: string;              // React Router path
     subItems?: SubMenuItem[];
     order: number;
   }
   ```

2. **Translation Structure**
   - JSON schema for ka.json, en.json, ru.json
   - Validation rules for translation completeness
   - Fallback strategy for missing keys

3. **State Management**
   - Language preference storage (localStorage schema)
   - Active menu state (React context or URL-based)
   - Navigation state preservation during language switches

### API Contracts

**Directory**: `contracts/`

Minimal for UI-only feature. May include:
- **routing-schema.json**: OpenAPI-style documentation of menu routes (for future backend integration)
- **translation-schema.json**: JSON schema for translation file validation

### Quickstart Guide

**File**: `quickstart.md`

Developer documentation:
1. How to add a new menu item
2. How to add a new language
3. How to test menu components
4. How to handle Georgian Cyrillic
5. Common troubleshooting (missing translations, routing conflicts)

### Agent Context Update

After completing Phase 1 artifacts, will run:
```bash
.specify/scripts/bash/update-agent-context.sh claude
```

This will update `.claude/CLAUDE.md` with:
- New EMR menu components location
- Translation file structure
- Testing patterns for menu components
- Language switching architecture

## Phase 2: Task Generation

**Status**: NOT STARTED (separate command)
**Command**: `/speckit.tasks`
**Output**: `tasks.md`

This phase is handled by a separate command after plan approval. Will generate dependency-ordered tasks for:
- Component creation
- Translation file setup
- Routing integration
- Testing
- Documentation updates

## Constitution Re-Check (Post-Design)

Will re-evaluate constitution compliance after Phase 1 design artifacts are complete, specifically:
- Verify package structure decision aligns with Principle II
- Confirm test coverage plan meets Principle III
- Validate type definitions satisfy Principle IV
- Ensure logging approach meets Principle VII

## Appendix: Key Constraints

1. **No Medplum Breaking Changes**: Must not modify core Medplum sidebar or routing
2. **UTF-8 Georgian Support**: All text handling must support Georgian Cyrillic
3. **Placeholder Content**: Sub-menu sections display placeholders, not functional UI
4. **Language Persistence**: User language choice persists across sessions
5. **Desktop-First**: Mobile/tablet is secondary concern
6. **Documentation as Source of Truth**: Menu structures from `/documentation` folder are authoritative

---

## Constitution Re-Check (Post Phase 1 Design)

**Date**: 2025-11-12
**Status**: ✅ ALL CHECKS PASSED

### I. FHIR-First Architecture
**Status**: ✅ PASS
**Assessment**: UI-only feature with no FHIR operations in this phase. Routing structure uses `/emr/*` paths that won't conflict with future FHIR resource routes (`/Patient/:id`, `/Encounter/:id`).
**No Changes Needed**: Design complies.

### II. Package-Based Modularity
**Status**: ✅ PASS (resolved from Phase 0)
**Assessment**: Feature integrated into `packages/app/src/emr/` following established patterns. Research confirmed this matches Medplum conventions for feature organization (e.g., `admin/`, `lab/`).
**Design Decision**: Feature folder within `packages/app` (not separate package).
**Rationale**: App-specific UI that doesn't need independent versioning or reuse across packages.

### III. Test-First Development (NON-NEGOTIABLE)
**Status**: ✅ PASS
**Assessment**: All components have colocated `.test.tsx` files defined in data model and quickstart guide. Testing patterns documented use Jest + React Testing Library + MockClient.
**Test Coverage Plan**:
- Unit tests for `useTranslation` hook
- Unit tests for `useEMRNavigation` hook
- Component tests for EMRMainMenu, EMRSubMenu, LanguageSelector
- Integration tests for full navigation flow
- localStorage persistence tests
- Georgian character rendering tests

### IV. Type Safety & Strict Mode
**Status**: ✅ PASS
**Assessment**: All types fully defined in `data-model.md`:
- `SupportedLanguage`: union type ('ka' | 'en' | 'ru')
- `TranslationKey`: literal union of all translation keys
- `MainMenuItem`, `SubMenuItem`: interfaces with required fields
- `EMRLayoutState`, `NavigationState`: state management types
- Type guards: `isSupportedLanguage()`, `isTranslationKey()`

**No `any` types used**: All translation, menu, and state structures are fully typed.

### V. Security & Compliance by Default
**Status**: ✅ PASS
**Assessment**:
- No new authentication flows (uses existing Medplum auth)
- No PHI stored in localStorage (only UI preferences)
- localStorage contains: language code, sidebar state, last route (not sensitive)
- No external API calls or data mutations
- HIPAA Compliance: N/A for navigation UI (no PHI handling)

### VI. Build Order & Dependency Management
**Status**: ✅ PASS
**Assessment**: Feature uses only existing dependencies:
- `react-router` (already in packages/app)
- `@mantine/core` (already in packages/app)
- `@mantine/notifications` (already in packages/app)
- `@medplum/react-hooks` (workspace reference)
- `@medplum/mock` (workspace reference, dev dependency)

**No new external dependencies added**.
**No changes to build order or turbo configuration needed**.

### VII. Observability & Debugging
**Status**: ✅ PASS (resolved from Phase 0)
**Assessment**: Logging approach defined in research.md:
- Simple `console.error` for errors (matches Medplum pattern)
- `showNotification` from `@mantine/notifications` for user feedback
- No centralized logging utility (consistent with Medplum)
**Design Decision**: Follow existing Medplum `.catch(console.error)` pattern.

### Healthcare & Compliance Standards
**Status**: ✅ PASS
**Assessment**:
- No HIPAA requirements for navigation UI
- No PHI displayed or stored
- Future content areas will require HIPAA compliance, but navigation structure itself does not

### Development Workflow
**Status**: ✅ PASS
**Assessment**:
- Standard Medplum PR workflow applies
- ESLint and Prettier checks will run
- All tests must pass before merge
- No Storybook stories required for MVP (optional)

---

## Final Assessment

✅ **All Constitution Principles: COMPLIANT**

All "NEEDS CLARIFICATION" items from initial Constitution Check have been resolved through Phase 0 research:
1. ✅ Translation library → Custom lightweight solution (no external lib)
2. ✅ Package structure → Feature folder in `packages/app/src/emr/`
3. ✅ Logging approach → Simple console.error + showNotification

**No Complexity Violations**: No exceptions or justifications required.

**Ready to Proceed**: Implementation can begin following `/speckit.tasks` command to generate task list.

---

## Change Log

- **2025-11-12**: Initial plan created with Technical Context and Constitution Check
- **2025-11-12**: Phase 0 research completed (research.md)
- **2025-11-12**: Phase 1 design completed (data-model.md, contracts/, quickstart.md)
- **2025-11-12**: Agent context updated (.claude/CLAUDE.md)
- **2025-11-12**: Constitution re-check passed with all items resolved
