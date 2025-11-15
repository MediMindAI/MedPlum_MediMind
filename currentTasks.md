# EMR Layout Restructuring & Theme Color Integration - Task List

**Feature**: Transform EMR to 4-row horizontal layout with blue gradient theme
**Branch**: `003-emr-ui-layout` (or create new branch for theme updates)
**Reference**: `/Users/toko/Desktop/medplum_medimind/documentation/THEME_COLORS.md`
**Screenshot**: Reference layout with turquoise sub-menu tabs

---

## PHASE 1: Hide Medplum AppShell on EMR Routes (30 min)

### Task 1.1: Conditionally Render AppShell
- [ ] **File**: `packages/app/src/App.tsx`
- [ ] Add `isEMRRoute` check: `location.pathname.startsWith('/emr')`
- [ ] Wrap AppShell in conditional: only render if NOT EMR route
- [ ] For EMR routes, render `<AppRoutes />` directly without AppShell
- [ ] Test: Navigate to `/emr` - should see no Medplum sidebar
- [ ] Test: Navigate to `/Patient` - should see Medplum sidebar

**Complexity**: Low | **Estimated Time**: 30 min

---

## PHASE 2: Create Global Theme System (30 min)

### Task 2.1: Create Theme CSS File
- [ ] **New File**: `packages/app/src/emr/styles/theme.css`
- [ ] Define CSS custom properties for:
  - [ ] Core colors: `--emr-primary` (#1a365d), `--emr-secondary` (#2b6cb0), `--emr-accent` (#63b3ed)
  - [ ] Navigation backgrounds: `--emr-topnav-bg`, `--emr-mainmenu-bg`, `--emr-submenu-bg` (#17a2b8)
  - [ ] Gradients: `--emr-gradient-primary`, `--emr-gradient-secondary`, `--emr-gradient-submenu`
  - [ ] Layout dimensions: `--emr-topnav-height` (40px), `--emr-mainmenu-height` (50px), `--emr-submenu-height` (45px)
  - [ ] Shadows: `--emr-shadow-sm`, `--emr-shadow-md`, `--emr-shadow-lg`
- [ ] Add font family with Georgian support

### Task 2.2: Import Theme in EMRPage
- [ ] **File**: `packages/app/src/emr/EMRPage.tsx`
- [ ] Add import: `import './styles/theme.css';` at top of file
- [ ] Verify CSS variables are available globally within EMR

**Complexity**: Low | **Estimated Time**: 30 min

---

## PHASE 3: Create Top Navigation Bar - Row 1 (1-2 hours)

### Task 3.1: Create TopNavBar Component Files
- [ ] **New File**: `packages/app/src/emr/components/TopNavBar/TopNavBar.tsx`
- [ ] **New File**: `packages/app/src/emr/components/TopNavBar/TopNavBar.module.css`
- [ ] **New File**: `packages/app/src/emr/components/TopNavBar/TopNavBar.test.tsx`

### Task 3.2: Implement TopNavBar Component
- [ ] Use Mantine `Flex`, `UnstyledButton`, `Menu` components
- [ ] Add left side navigation items: მთავარი, HR, რეკვიზიტი, დეპარტმენტი, ჩაბარება
- [ ] Add right side user menu: "Tako" with dropdown (პროფილი, პარამეტრები, გასვლა)
- [ ] Apply gray background (`--emr-topnav-bg`: #e9ecef)
- [ ] Height: 40px
- [ ] Box shadow for depth

### Task 3.3: Add TopNavBar Translations
- [ ] **File**: `packages/app/src/emr/types/translation.ts`
- [ ] Add new translation keys for topnav items
- [ ] **File**: `packages/app/src/emr/translations/translations.ts`
- [ ] Add Georgian translations: მთავარი, HR, რეკვიზიტი, დეპარტმენტი, ჩაბარება, პროფილი, პარამეტრები, გასვლა
- [ ] Add English translations: Main, HR, Requisites, Department, Delivery, Profile, Settings, Logout
- [ ] Add Russian translations: Главная, HR, Реквизиты, Департамент, Доставка, Профиль, Настройки, Выход

### Task 3.4: Write TopNavBar Tests
- [ ] Test component renders all nav items
- [ ] Test user menu opens on click
- [ ] Test all 3 languages display correctly
- [ ] Test hover states

**Complexity**: Medium | **Estimated Time**: 1-2 hours

---

## PHASE 4: Transform Sub-Menu to Horizontal Tabs - Row 3 (2-3 hours) ⚠️ CRITICAL

### Task 4.1: Create HorizontalSubMenu Component Files
- [ ] **New File**: `packages/app/src/emr/components/HorizontalSubMenu/HorizontalSubMenu.tsx`
- [ ] **New File**: `packages/app/src/emr/components/HorizontalSubMenu/HorizontalSubMenu.module.css`
- [ ] **New File**: `packages/app/src/emr/components/HorizontalSubMenu/HorizontalSubMenu.test.tsx`

### Task 4.2: Implement HorizontalSubMenu Component
- [ ] Props: `items: SubMenuItem[]`, `parentMenuId: string`
- [ ] Use Mantine `Flex`, `ScrollArea`, `UnstyledButton`
- [ ] Render sub-items horizontally (flex-direction: row)
- [ ] Apply **turquoise/cyan gradient** background (#17a2b8)
- [ ] Height: 45px
- [ ] Active tab: white bottom border (3px), bold font
- [ ] Hover: semi-transparent white overlay
- [ ] Enable horizontal scrolling if too many tabs
- [ ] Hide scrollbar but keep functionality

### Task 4.3: Style HorizontalSubMenu
- [ ] Background: `var(--emr-gradient-submenu)` (turquoise gradient)
- [ ] Tab padding: 10px 20px
- [ ] White text color
- [ ] Active state: `rgba(255, 255, 255, 0.2)` background + white bottom border
- [ ] Smooth transitions (0.2s ease)
- [ ] Ensure Georgian text displays correctly

### Task 4.4: Write HorizontalSubMenu Tests
- [ ] Test renders correct number of tabs
- [ ] Test active tab highlighting
- [ ] Test navigation on tab click
- [ ] Test horizontal scrolling with many items
- [ ] Test all 3 languages
- [ ] Test with Registration sub-items (9 items)
- [ ] Test with Patient History sub-items (13 items)

**Complexity**: Medium-High | **Estimated Time**: 2-3 hours

---

## PHASE 5: Restructure EMRPage Layout (1-2 hours)

### Task 5.1: Complete Rewrite of EMRPage Component
- [ ] **File**: `packages/app/src/emr/EMRPage.tsx`
- [ ] Remove old header/sidebar structure
- [ ] Import new components: `TopNavBar`, `HorizontalSubMenu`
- [ ] Create 4-layer structure:
  - [ ] **Row 1**: `<TopNavBar />`
  - [ ] **Row 2**: `<Box className={styles.mainMenuRow}>` with `<EMRMainMenu />` + `<LanguageSelector />`
  - [ ] **Row 3**: Conditional `<HorizontalSubMenu />` (only if sub-items exist for active main menu)
  - [ ] **Row 4+**: `<Box className={styles.contentArea}>` with `<Outlet />`
- [ ] Logic: `getActiveParentMenu()` function to determine which sub-menu to show
- [ ] Preserve all routing logic

### Task 5.2: Rewrite EMRPage.module.css
- [ ] **File**: `packages/app/src/emr/EMRPage.module.css`
- [ ] Remove all old sidebar styles
- [ ] `.emrPage`: flex column, full viewport height/width
- [ ] `.mainMenuRow`: flex row, justify-between, height 50px, white background
- [ ] `.contentArea`: flex 1, overflow auto, light gray background
- [ ] Apply shadows and borders for depth

### Task 5.3: Test EMRPage Integration
- [ ] Test all 4 rows render correctly
- [ ] Test sub-menu appears when navigating to Registration
- [ ] Test sub-menu appears when navigating to Patient History
- [ ] Test sub-menu hides when navigating to Nomenclature
- [ ] Test language selector in Row 2
- [ ] Test no Medplum sidebar visible

**Complexity**: Medium-High | **Estimated Time**: 1-2 hours

---

## PHASE 6: Update Main Menu Styling - Row 2 (30 min)

### Task 6.1: Apply Theme Colors to EMRMainMenu
- [ ] **File**: `packages/app/src/emr/components/EMRMainMenu/EMRMainMenu.module.css`
- [ ] Update `.menuItem` styles:
  - [ ] Default: gray text, transparent background
  - [ ] Hover: light blue background (`--emr-light-accent`)
  - [ ] Active: **blue gradient** (`--emr-gradient-primary`), white text, bold, shadow
- [ ] Ensure proper spacing and padding
- [ ] Add focus-visible outline with accent color
- [ ] Test Georgian font rendering

### Task 6.2: Test EMRMainMenu Visual Updates
- [ ] Test all 6 menu items render
- [ ] Test hover effects
- [ ] Test active state with gradient
- [ ] Test keyboard navigation (focus states)
- [ ] Test in all 3 languages

**Complexity**: Low | **Estimated Time**: 30 min

---

## PHASE 7: Simplify Section Components (30 min)

### Task 7.1: Update RegistrationSection
- [ ] **File**: `packages/app/src/emr/sections/RegistrationSection.tsx`
- [ ] Remove all sidebar logic (old `EMRSubMenu`)
- [ ] Simplify to just `<Outlet />` wrapped in styled Box
- [ ] **File**: `packages/app/src/emr/sections/RegistrationSection.module.css`
- [ ] Simple wrapper styles: padding, full width/height

### Task 7.2: Update PatientHistorySection
- [ ] **File**: `packages/app/src/emr/sections/PatientHistorySection.tsx`
- [ ] Remove all sidebar logic
- [ ] Simplify to just `<Outlet />` wrapped in styled Box
- [ ] **File**: `packages/app/src/emr/sections/PatientHistorySection.module.css`
- [ ] Simple wrapper styles: padding, full width/height

### Task 7.3: Test Section Components
- [ ] Test RegistrationSection renders correctly
- [ ] Test PatientHistorySection renders correctly
- [ ] Test routing to sub-routes still works
- [ ] Test no visual remnants of old sidebar

**Complexity**: Low | **Estimated Time**: 30 min

---

## PHASE 8: Create Action Buttons Component (1 hour)

### Task 8.1: Create ActionButtons Component Files
- [ ] **New File**: `packages/app/src/emr/components/ActionButtons/ActionButtons.tsx`
- [ ] **New File**: `packages/app/src/emr/components/ActionButtons/ActionButtons.module.css`
- [ ] **New File**: `packages/app/src/emr/components/ActionButtons/ActionButtons.test.tsx`

### Task 8.2: Implement ActionButtons Component
- [ ] Use Mantine `Stack` and `Button` components
- [ ] Position: absolute, top-right of content area
- [ ] 4 buttons stacked vertically:
  - [ ] გადასვლა / Navigate / Перейти
  - [ ] განახლე / Update / Обновить
  - [ ] გადაცემა / Transfer / Передать
  - [ ] ინფოთხი / Info / Инфо
- [ ] Style: **blue gradient** background (`--emr-gradient-primary`)
- [ ] White text, bold, min-width 120px
- [ ] Hover: lift effect (translateY -2px) + larger shadow
- [ ] Box shadows for depth

### Task 8.3: Add Action Button Translations
- [ ] **File**: `packages/app/src/emr/types/translation.ts`
- [ ] Add action translation keys
- [ ] **File**: `packages/app/src/emr/translations/translations.ts`
- [ ] Add translations for all 3 languages

### Task 8.4: Integrate ActionButtons into Views
- [ ] Add `<ActionButtons />` to appropriate view components (or globally in content area)
- [ ] Test positioning (should be visible but not block content)

### Task 8.5: Write ActionButtons Tests
- [ ] Test all 4 buttons render
- [ ] Test click handlers (can be no-op for now)
- [ ] Test all 3 languages
- [ ] Test hover/focus states

**Complexity**: Low-Medium | **Estimated Time**: 1 hour

---

## PHASE 9: Adjust Language Selector Position (15 min)

### Task 9.1: Update LanguageSelector Styles
- [ ] **File**: `packages/app/src/emr/components/LanguageSelector/LanguageSelector.module.css`
- [ ] Update for Row 2 position (right side of main menu row)
- [ ] Min-width: 200px
- [ ] Add subtle shadow
- [ ] Border radius: 6px
- [ ] Active button: accent color background, white text, bold
- [ ] Ensure proper sizing and spacing

### Task 9.2: Test LanguageSelector
- [ ] Test renders in correct position (Row 2, right side)
- [ ] Test language switching still works
- [ ] Test localStorage persistence
- [ ] Test visual appearance matches design

**Complexity**: Low | **Estimated Time**: 15 min

---

## PHASE 10: Update All Tests (2-3 hours)

### Task 10.1: Update EMRPage Tests
- [ ] **File**: `packages/app/src/emr/EMRPage.test.tsx`
- [ ] Update tests for new 4-row structure
- [ ] Test TopNavBar renders
- [ ] Test MainMenu + LanguageSelector render in Row 2
- [ ] Test HorizontalSubMenu appears when expected
- [ ] Test content area renders
- [ ] Remove old sidebar tests

### Task 10.2: Update EMRMainMenu Tests
- [ ] **File**: `packages/app/src/emr/components/EMRMainMenu/EMRMainMenu.test.tsx`
- [ ] Update for new styles (gradients)
- [ ] Test active state styling
- [ ] Test hover states

### Task 10.3: Update Section Tests
- [ ] **File**: `packages/app/src/emr/sections/RegistrationSection.test.tsx`
- [ ] Remove sidebar-related tests
- [ ] Test simple Outlet rendering
- [ ] **File**: `packages/app/src/emr/sections/PatientHistorySection.test.tsx`
- [ ] Remove sidebar-related tests
- [ ] Test simple Outlet rendering

### Task 10.4: Run Full Test Suite
- [ ] Run: `cd packages/app && npm test`
- [ ] Fix any failing tests
- [ ] Ensure all new components have >80% coverage
- [ ] Verify no regression in existing tests

**Complexity**: Medium-High | **Estimated Time**: 2-3 hours

---

## PHASE 11: Add Responsive Design (1-2 hours)

### Task 11.1: Add Mobile Breakpoints to Theme
- [ ] **File**: `packages/app/src/emr/styles/theme.css`
- [ ] Add mobile breakpoint variable: `--emr-mobile-breakpoint: 768px`
- [ ] Add tablet breakpoint: `--emr-tablet-breakpoint: 1024px`

### Task 11.2: Update TopNavBar for Mobile
- [ ] **File**: `packages/app/src/emr/components/TopNavBar/TopNavBar.module.css`
- [ ] Add `@media (max-width: 768px)` query
- [ ] Stack items vertically on mobile
- [ ] Adjust height to auto
- [ ] Consider hamburger menu for nav items

### Task 11.3: Update MainMenuRow for Mobile
- [ ] **File**: `packages/app/src/emr/EMRPage.module.css`
- [ ] Flex column layout on mobile
- [ ] Language selector full width
- [ ] Adjust padding

### Task 11.4: Update HorizontalSubMenu for Mobile
- [ ] **File**: `packages/app/src/emr/components/HorizontalSubMenu/HorizontalSubMenu.module.css`
- [ ] Enable horizontal scrolling
- [ ] Smaller padding on mobile
- [ ] Touch-friendly tap targets (min 44px)

### Task 11.5: Update ActionButtons for Mobile
- [ ] **File**: `packages/app/src/emr/components/ActionButtons/ActionButtons.module.css`
- [ ] Position: fixed bottom-right on mobile
- [ ] Smaller buttons
- [ ] Consider floating action button (FAB) pattern

### Task 11.6: Test Responsive Behavior
- [ ] Test at 320px width (iPhone SE)
- [ ] Test at 768px width (iPad portrait)
- [ ] Test at 1024px width (iPad landscape)
- [ ] Test at 1440px+ width (desktop)
- [ ] Test touch interactions on mobile
- [ ] Test horizontal scrolling of sub-menu tabs

**Complexity**: Medium | **Estimated Time**: 1-2 hours

---

## PHASE 12: Update Documentation (1-2 hours)

### Task 12.1: Update Feature Specification
- [ ] **File**: `specs/003-emr-ui-layout/spec.md`
- [ ] Add section describing 4-row layout structure
- [ ] Update screenshots/diagrams if needed
- [ ] Document turquoise sub-menu tabs
- [ ] Document theme color system integration

### Task 12.2: Update Data Model Documentation
- [ ] **File**: `specs/003-emr-ui-layout/data-model.md`
- [ ] Add TopNavBar types if needed
- [ ] Update component hierarchy diagram
- [ ] Document theme CSS custom properties

### Task 12.3: Update Quickstart Guide
- [ ] **File**: `specs/003-emr-ui-layout/quickstart.md`
- [ ] Update "How to add a new menu item" section
- [ ] Document new component structure
- [ ] Add examples of using theme colors
- [ ] Update troubleshooting section

### Task 12.4: Create Migration Guide
- [ ] **New File**: `specs/003-emr-ui-layout/MIGRATION.md`
- [ ] Document changes from old layout to new layout
- [ ] Note removed components (vertical EMRSubMenu)
- [ ] Note new components (TopNavBar, HorizontalSubMenu, ActionButtons)
- [ ] Document breaking changes (if any)

### Task 12.5: Update CLAUDE.md
- [ ] **File**: `.claude/CLAUDE.md`
- [ ] Update EMR section with new layout structure
- [ ] Document theme color system location
- [ ] Update component file structure

**Complexity**: Low-Medium | **Estimated Time**: 1-2 hours

---

## FINAL VERIFICATION CHECKLIST

### Visual Verification
- [ ] Navigate to `/emr` - see NO Medplum sidebar
- [ ] See 4 distinct rows: TopNav (gray), MainMenu (white/blue), SubMenu (turquoise), Content
- [ ] Click Registration - see 9 turquoise sub-menu tabs appear
- [ ] Click Patient History - see 13 turquoise sub-menu tabs appear
- [ ] Click Nomenclature - see sub-menu disappear
- [ ] See action buttons on right side (blue gradient)
- [ ] Test all 3 languages - all text displays correctly
- [ ] Test Georgian characters render properly (no boxes/fallback fonts)

### Functional Verification
- [ ] All routing still works (35 routes)
- [ ] Language switching persists across sessions
- [ ] Active states work on all menus
- [ ] Hover states work on all interactive elements
- [ ] No console errors
- [ ] No TypeScript errors: `npm run build`
- [ ] All tests pass: `npm test`

### Code Quality Verification
- [ ] ESLint passes: `npm run lint`
- [ ] Prettier formatted: `npm run prettier`
- [ ] No unused imports
- [ ] No any types
- [ ] All components have tests
- [ ] Test coverage >80%

### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## SUMMARY STATISTICS

**Total Tasks**: 70+ individual tasks across 12 phases
**New Files**: 10 (components, CSS, tests)
**Modified Files**: 20-25
**Estimated Total Time**: 12-18 hours

**Priority Order**: P1 (Phases 1-5), P2 (Phases 6-9), P3 (Phases 10-12)

**Critical Path**: Phase 1 → Phase 2 → Phase 4 (HorizontalSubMenu) → Phase 5 (EMRPage)

---

## PARALLEL EXECUTION STRATEGY

### Wave 1 (Can run in parallel after Phase 2 complete):
- Agent 1: Phase 3 (TopNavBar)
- Agent 2: Phase 4 (HorizontalSubMenu) ⚠️ CRITICAL
- Agent 3: Phase 6 (MainMenu styling)
- Agent 4: Phase 8 (ActionButtons)

### Wave 2 (After Wave 1 complete):
- Agent 1: Phase 5 (EMRPage integration)
- Agent 2: Phase 7 (Section simplification)
- Agent 3: Phase 9 (LanguageSelector)

### Wave 3 (After Wave 2 complete):
- Agent 1: Phase 10 (Testing)
- Agent 2: Phase 11 (Responsive)
- Agent 3: Phase 12 (Documentation)

**Note**: Phase 1 must be done first (sequential), then Phase 2, then parallel execution begins.
