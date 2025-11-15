# Feature Specification: EMR UI Layout on Medplum

**Feature Branch**: `003-emr-ui-layout`
**Created**: 2025-11-12
**Status**: Draft
**Input**: User description: "Build EMR UI layout on Medplum with Georgian/English/Russian multilingual support"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Main Navigation Menu Display (Priority: P1)

As a healthcare worker, I need to see the familiar EMR menu structure when I access the Medplum-based system, so that I can navigate to different sections of the EMR without retraining.

**Why this priority**: The main menu is the entry point to the entire EMR system. Without it, users cannot access any functionality. This forms the foundation for all other features.

**Independent Test**: Can be fully tested by logging into the system and verifying that all 6 main menu items appear and are clickable. Delivers immediate value by providing system navigation structure.

**Acceptance Scenarios**:

1. **Given** user is logged into the Medplum EMR system, **When** the main page loads, **Then** user sees 6 main menu items displayed horizontally: рдвистраъиа (Registration), оаъидмтис истнриа (Patient History), мнлдмйкатура (Nomenclature), аглимистрирдба (Administration), фнреарги (Forward), and амваришдби (Reports)
2. **Given** user sees the main menu, **When** user clicks any menu item, **Then** that menu item becomes visually active and its corresponding sub-menu appears
3. **Given** user has selected a main menu item, **When** user switches to a different language (Georgian/English/Russian), **Then** all menu labels update to show the selected language
4. **Given** the Medplum sidebar is present, **When** the main page loads, **Then** the Medplum sidebar is collapsed by default and does not interfere with the EMR menu

---

### User Story 2 - Registration Sub-Menu Navigation (Priority: P2)

As a registration clerk, I need to access the 9 registration sub-sections (оаъидмти, лилцдби, йнмтрахтдби, etc.) so that I can perform patient registration, manage contracts, track debts, and handle other registration tasks.

**Why this priority**: Registration is the first point of contact for patients and one of the most frequently used modules. Staff need quick access to all registration functions.

**Independent Test**: Can be tested by clicking the Registration menu item and verifying all 9 sub-menu items appear and are navigable. Delivers value by providing access to core registration workflows.

**Acceptance Scenarios**:

1. **Given** user is on the main page, **When** user clicks рдвистраъиа (Registration) in the main menu, **Then** 9 sub-menu items appear: рдвистраъиа (Registration), лилцдби (Receiver/Admission), йнмтрахтдби (Contracts), стаъинмари (Inpatient), еакдби (Debts), аеамсдби (Advances), архиеи (Archive), лиларзедби (Referrals), еакута (Currency)
2. **Given** the Registration sub-menu is displayed, **When** user clicks any sub-menu item, **Then** that item becomes visually active and displays a placeholder content area
3. **Given** the Registration sub-menu is displayed, **When** user switches language, **Then** all 9 sub-menu labels update to the selected language

---

### User Story 3 - Patient History Sub-Menu Navigation (Priority: P2)

As a clinician, I need to access the 13 patient history sub-sections (истнриа, щдли оаъидмтдби, именисдби, etc.) so that I can view patient records, manage visits, process billing, and handle clinical documentation.

**Why this priority**: Patient History is the primary clinical workspace where doctors and nurses spend most of their time. Access to these sub-sections is critical for daily operations.

**Independent Test**: Can be tested by clicking the Patient History menu item and verifying all 13 sub-menu items appear and are navigable. Delivers value by providing access to clinical workflows.

**Acceptance Scenarios**:

1. **Given** user is on the main page, **When** user clicks оаъидмтис истнриа (Patient History) in the main menu, **Then** 13 sub-menu items appear: истнриа (History), щдли оаъидмтдби (My Patients), сурнваъиа (Surrogacy), именисдби (Invoices), 100 рдонрти (Form 100 Report), ваьдрдби (Prescriptions), шдсрукдба (Execution/Performance), кабнратнриа (Laboratory), лнривднба (Duty/On-call), гамишмукдба (Appointments), стаъинмари (Hospital/Inpatient), йедба (Nutrition/Feeding), MOH (Ministry of Health)
2. **Given** the Patient History sub-menu is displayed, **When** user clicks any sub-menu item, **Then** that item becomes visually active and displays a placeholder content area
3. **Given** the Patient History sub-menu is displayed, **When** user switches language, **Then** all 13 sub-menu labels update to the selected language

---

### User Story 4 - Other Main Menu Items Navigation (Priority: P3)

As a system user, I need access to Nomenclature, Administration, Forward, and Reports sections so that I can perform supporting tasks like managing medical terminology, system configuration, and generating reports.

**Why this priority**: These sections support core clinical and registration workflows but are used less frequently than Registration and Patient History.

**Independent Test**: Can be tested by clicking each main menu item and verifying sub-menus appear (even if showing placeholder content). Delivers value by completing the navigation structure.

**Acceptance Scenarios**:

1. **Given** user is on the main page, **When** user clicks мнлдмйкатура (Nomenclature), аглимистрирдба (Administration), фнреарги (Forward), or амваришдби (Reports), **Then** the menu item becomes active and shows a placeholder message indicating sub-sections are not yet implemented
2. **Given** any of these sections are active, **When** user switches language, **Then** menu labels update to the selected language

---

### User Story 5 - Multilingual Translation System (Priority: P1)

As a healthcare worker, I need the ability to switch between Georgian, English, and Russian languages so that I can work in my preferred language.

**Why this priority**: This is a foundational requirement that affects all other features. The translation system must be implemented early to ensure all UI components are properly structured for multilingual support.

**Independent Test**: Can be tested by toggling between languages and verifying all visible menu labels change. Delivers immediate value by demonstrating the translation system works.

**Acceptance Scenarios**:

1. **Given** user is viewing the EMR interface in Georgian, **When** user selects English language, **Then** all menu items, sub-menu items, and UI labels change to English equivalents
2. **Given** user is viewing the EMR interface in English, **When** user selects Russian language, **Then** all menu items, sub-menu items, and UI labels change to Russian equivalents
3. **Given** user has selected a preferred language, **When** user refreshes the page, **Then** the previously selected language is maintained
4. **Given** new UI components are added, **When** developers use translation keys, **Then** the component automatically supports all three languages without hardcoded text

---

### Edge Cases

- What happens when user navigates to a sub-menu item that has no content yet? (Should display a placeholder message indicating the section is under development)
- How does the system handle if translation keys are missing for a specific language? (Should fall back to Georgian as default, or show the translation key)
- What happens when user has the Medplum sidebar expanded and tries to view the EMR menu? (Should ensure no UI overlap or conflicts)
- How does the navigation behave on mobile/tablet devices? (Should adapt responsively while maintaining usability)
- What happens when user switches language while viewing a specific sub-section? (Should maintain the current sub-section but update all labels)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a horizontal main menu with 6 items: рдвистраъиа (Registration), оаъидмтис истнриа (Patient History), мнлдмйкатура (Nomenclature), аглимистрирдба (Administration), фнреарги (Forward), and амваришдби (Reports)
- **FR-002**: System MUST display a vertical sub-menu with 9 items when Registration is selected: рдвистраъиа (Registration), лилцдби (Receiver/Admission), йнмтрахтдби (Contracts), стаъинмари (Inpatient), еакдби (Debts), аеамсдби (Advances), архиеи (Archive), лиларзедби (Referrals), еакута (Currency)
- **FR-003**: System MUST display a vertical sub-menu with 13 items when Patient History is selected: истнриа (History), щдли оаъидмтдби (My Patients), сурнваъиа (Surrogacy), именисдби (Invoices), 100 рдонрти (Form 100 Report), ваьдрдби (Prescriptions), шдсрукдба (Execution/Performance), кабнратнриа (Laboratory), лнривднба (Duty/On-call), гамишмукдба (Appointments), стаъинмари (Hospital/Inpatient), йедба (Nutrition/Feeding), MOH (Ministry of Health)
- **FR-004**: System MUST support three languages: Georgian (default), English, and Russian
- **FR-005**: System MUST use key-value pairs for all UI text to enable easy translation management
- **FR-006**: System MUST visually indicate the currently active main menu item
- **FR-007**: System MUST visually indicate the currently active sub-menu item
- **FR-008**: System MUST keep the Medplum default sidebar collapsed by default
- **FR-009**: System MUST NOT modify or remove the Medplum sidebar, only control its default state
- **FR-010**: System MUST persist the user's selected language across page refreshes and sessions
- **FR-011**: System MUST render placeholder content areas when a sub-menu item is clicked (no functional logic required in this phase)
- **FR-012**: System MUST maintain navigation state when switching languages (if user is on Registration > еакдби, switching to English should show Registration > Debts)
- **FR-013**: System MUST load all menu structures from translation files, not hardcoded strings
- **FR-014**: System MUST follow the exact menu item order and naming as documented in the source EMR system

### Key Entities *(include if feature involves data)*

- **Menu Item**: Represents a clickable navigation element with properties: id, label (Georgian), label (English), label (Russian), href/route, parent menu reference, display order
- **Sub-Menu Item**: Represents a secondary navigation element under a main menu item with properties: id, label (Georgian), label (English), label (Russian), href/route, parent menu id, display order
- **Translation Key**: Represents a unique identifier for UI text with associated values for each supported language (Georgian, English, Russian)
- **User Language Preference**: Stores the user's selected language for the interface

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can access all 6 main menu items within 1 second of page load
- **SC-002**: Users can view all sub-menu items for Registration (9 items) and Patient History (13 items) within 1 second of clicking the main menu item
- **SC-003**: Language switching updates all visible UI labels within 500 milliseconds
- **SC-004**: 100% of menu labels have translations in all three languages (Georgian, English, Russian)
- **SC-005**: User's language preference persists across sessions (verified by refreshing page and checking language remains the same)
- **SC-006**: No visual overlap or conflicts occur between the EMR menu and the Medplum sidebar in any state (collapsed or expanded)
- **SC-007**: The menu structure exactly matches the documented structure from the source EMR system (6 main items, 9 Registration sub-items, 13 Patient History sub-items)
- **SC-008**: Users can navigate to any menu/sub-menu item with no more than 2 clicks from the home screen

## Assumptions

1. **Authentication & Authorization**: Assume users are already authenticated through Medplum's existing authentication system. Menu visibility is not role-based in this initial phase (all users see all menu items).

2. **Content Areas**: Sub-menu items will display placeholder content or empty states. No functional forms, tables, or data operations are required in this phase.

3. **Visual Design**: The menu design will use modern, clean UI components (likely Mantine UI since Medplum uses it) but does not need to exactly replicate the visual styling of the original EMR system. The structure and organization are more important than pixel-perfect visual matching.

4. **Translation Management**: Translations will be stored in JSON or TypeScript files within the codebase. No database or external translation service is required for this phase.

5. **Routing**: The system will use client-side routing (React Router or similar) to handle navigation between sections without full page reloads.

6. **Responsive Design**: The menu should work on desktop screens (primary use case for hospital EMR systems). Mobile/tablet optimization is secondary.

7. **Browser Support**: The system will support modern browsers (Chrome, Firefox, Safari, Edge) used in healthcare settings. No Internet Explorer support required.

8. **Medplum Integration**: The EMR menu will be integrated into Medplum's existing React application structure, likely as a custom layout or page component.

9. **Performance**: Menu rendering and language switching should feel instant (<500ms) under normal network conditions with reasonable hardware (standard hospital workstations).

10. **Translation Completeness**: All menu labels have been documented in the source materials. If any labels are missing, Georgian will serve as the source of truth, and we will use Google Translate for missing English/Russian translations as placeholders.

## Out of Scope

The following items are explicitly NOT included in this feature:

1. **Functional Content**: No forms, tables, data entry, search functionality, or business logic for any menu sections
2. **Data Integration**: No FHIR resource mapping, patient data display, or backend API integration
3. **Role-Based Access Control**: All authenticated users see the same menu structure regardless of role or permissions
4. **Menu Customization**: No ability for users to customize, hide, or reorder menu items
5. **Additional Languages**: Only Georgian, English, and Russian. No support for other languages.
6. **Legacy EMR Integration**: No direct integration or data synchronization with the existing EMR system at http://178.134.21.82:8008
7. **Advanced Navigation**: No breadcrumbs, navigation history, bookmarking, or deep linking beyond basic URL routing
8. **Menu Search**: No search functionality to find menu items
9. **Keyboard Navigation**: Basic tab navigation is fine; advanced keyboard shortcuts are not required
10. **Accessibility Compliance**: Basic accessibility (semantic HTML, ARIA labels) is expected, but WCAG 2.1 AAA certification is not required
11. **Analytics/Tracking**: No event tracking or analytics for menu usage
12. **Menu Help/Documentation**: No inline help text, tooltips, or documentation links for menu items

## Dependencies

1. **Medplum React Application**: Requires access to the Medplum monorepo packages/app codebase
2. **Documentation Files**: Requires access to the documentation folder with menu structures:
   - `documentation/registration/menu-structure.md`
   - `documentation/patient-history/history/menu-structure.md`
3. **Translation Source Data**: All menu labels are documented in the existing documentation files
4. **UI Component Library**: Will use Mantine UI (already included in Medplum)
5. **Routing Library**: Will use React Router (already included in Medplum)

## Constraints

1. **No Medplum Sidebar Modifications**: Cannot remove or significantly modify the default Medplum sidebar - can only control its default collapsed state
2. **Medplum Architecture Compliance**: Must follow Medplum's existing React component structure and coding patterns
3. **TypeScript Required**: All code must be written in TypeScript to match Medplum's codebase
4. **No Breaking Changes**: Cannot break existing Medplum functionality or pages
5. **UTF-8 Encoding**: Must properly handle Georgian Cyrillic characters throughout the system
6. **Read-Only Documentation**: The source documentation files should not be modified; they serve as the reference specification

## Related Documentation

- **Registration Menu Structure**: `/Users/toko/Desktop/medplum_medimind/documentation/registration/menu-structure.md`
- **Registration Module Overview**: `/Users/toko/Desktop/medplum_medimind/documentation/registration/README.md`
- **Patient History Menu Structure**: `/Users/toko/Desktop/medplum_medimind/documentation/patient-history/history/menu-structure.md`
- **Patient History Module Overview**: `/Users/toko/Desktop/medplum_medimind/documentation/patient-history/README.md`
- **Medplum Project Overview**: `/Users/toko/Desktop/medplum_medimind/.claude/CLAUDE.md`

## Next Steps After Specification Approval

1. Run `/speckit.clarify` if any [NEEDS CLARIFICATION] items exist
2. Run `/speckit.plan` to generate detailed implementation plan
3. Run `/speckit.tasks` to generate actionable task list
4. Begin implementation following the task list
