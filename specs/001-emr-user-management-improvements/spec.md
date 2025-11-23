# Feature Specification: EMR User Management Improvements

**Feature Branch**: `001-emr-user-management-improvements`
**Created**: 2025-11-23
**Status**: Draft
**Input**: Implement improvements to the existing account creation and role assignment system based on comprehensive research analysis documented in EMR-USER-MANAGEMENT-IMPROVEMENT-GUIDE.md

## Overview

This feature enhances the existing MediMind EMR Account Management system (currently 70% production-ready with 85% test coverage) to achieve production-ready status with industry-leading UI/UX, security, and HIPAA compliance standards.

**Current System Strengths:**
- FHIR compliance with Practitioner/PractitionerRole resources
- Mobile-first responsive design with Mantine UI
- Multi-role support with medical specialties
- Account lifecycle management (create/deactivate/reactivate)
- Data validation (email, phone, personal ID)

**Priority Focus Areas (from research):**
1. User onboarding workflow improvements
2. Permission management UI
3. Audit logging and compliance
4. Search/filtering enhancements
5. UI/UX polish

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Invitation Status and Resend (Priority: P1)

As an administrator, I need to see the status of account invitations (pending, accepted, expired, bounced) and resend invitations when needed, so that I can ensure all staff members successfully activate their accounts.

**Why this priority**: Currently there is no visibility into invitation status. Users can get stuck if invitation emails fail or expire, requiring manual intervention outside the system. This directly impacts user activation rates.

**Independent Test**: Can be fully tested by creating an account, viewing the invitation status badge in the table, and using the resend invitation action. Delivers immediate value by reducing failed onboarding.

**Acceptance Scenarios**:

1. **Given** an administrator has created a new account invitation, **When** they view the accounts table, **Then** they see a status badge showing "pending", "accepted", "expired", or "bounced"
2. **Given** an invitation shows "pending" or "expired" status, **When** the admin clicks the resend invitation action, **Then** a new invitation email is sent and the invitation expiry is reset to 7 days
3. **Given** an invitation has expired (older than 7 days), **When** viewing the accounts table, **Then** the status badge shows "expired" in a warning color
4. **Given** an admin wants to bypass email delivery issues, **When** they click "Generate Activation Link", **Then** they receive a secure URL they can copy and share manually

---

### User Story 2 - View Audit Logs for Account Changes (Priority: P1)

As a compliance officer, I need to view a complete audit trail of all account management actions (creates, updates, deactivations, permission changes) with filtering and export capabilities, so that I can demonstrate HIPAA compliance and investigate security incidents.

**Why this priority**: HIPAA requires comprehensive audit logging. Currently there is no UI to view audit logs, making compliance audits and incident investigation impossible without direct database access.

**Independent Test**: Can be tested by performing various account operations, then navigating to audit logs view and verifying all actions are recorded with correct timestamps, actors, and outcomes.

**Acceptance Scenarios**:

1. **Given** the audit logs view is accessible, **When** an admin navigates to account management audit logs, **Then** they see a table with columns: Timestamp, User (actor), Action, Resource Type, Entity, Outcome, IP Address
2. **Given** multiple audit events exist, **When** an admin applies date range, user, action type, or outcome filters, **Then** only matching audit events are displayed
3. **Given** audit events are displayed, **When** an admin clicks "Export", **Then** they can download filtered results as CSV or Excel file
4. **Given** an admin views a specific account, **When** they open the account's audit history tab, **Then** they see all changes made to that specific account in timeline format

---

### User Story 3 - View and Edit Permissions for Roles (Priority: P1)

As an administrator, I need to visually see and modify what permissions each role has using a permission matrix, so that I can configure access controls without requiring technical knowledge or backend changes.

**Why this priority**: Currently there is no UI for permission management. Admins cannot fine-tune permissions without direct database/API access, which is both risky and impractical.

**Independent Test**: Can be tested by viewing a role's permissions in the matrix, toggling a permission checkbox, saving, and verifying the access policy is updated correctly.

**Acceptance Scenarios**:

1. **Given** an admin views a role's permissions, **When** the permission matrix is displayed, **Then** they see a grid of resource types (Patient, Observation, etc.) vs operations (Create, Read, Update, Delete, Search) with checkboxes
2. **Given** the permission matrix is displayed, **When** an admin clicks a permission checkbox, **Then** the checkbox toggles and dependent permissions are auto-resolved (e.g., enabling "Update" auto-enables "Read")
3. **Given** an admin assigns multiple roles to a user, **When** they view the "Permission Preview" accordion, **Then** they see the combined effective permissions with conflict resolution visualization
4. **Given** an admin assigns conflicting roles (e.g., billing-clerk AND billing-manager), **When** validation runs, **Then** a warning alert displays the separation of duties violation

---

### User Story 4 - Server-Side Search and Pagination (Priority: P2)

As an administrator managing a large staff directory, I need server-side search and pagination that performs well with hundreds or thousands of accounts, so that I don't experience slow page loads or browser freezes.

**Why this priority**: Current client-side filtering doesn't scale beyond 100+ users. As the organization grows, performance will degrade significantly.

**Independent Test**: Can be tested by loading a page with pagination controls, verifying only one page of results loads initially, and confirming server-side search responds within acceptable time.

**Acceptance Scenarios**:

1. **Given** more than 20 accounts exist, **When** the accounts table loads, **Then** pagination shows "Showing 1-20 of X results" with page navigation controls
2. **Given** the accounts table is displayed, **When** an admin types in the search box, **Then** search is debounced (500ms) and executed server-side, returning matching results with pagination
3. **Given** advanced filters are available, **When** an admin opens the filter panel, **Then** they can filter by: role, department, status, date range (hire date, last login)
4. **Given** an admin frequently uses certain filter combinations, **When** they click "Save Filter Preset", **Then** the current filters are saved and available in a dropdown for quick access

---

### User Story 5 - Bulk Operations on Accounts (Priority: P2)

As an administrator, I need to select multiple accounts and perform bulk operations (deactivate, assign role, export), so that I can efficiently manage large groups of users instead of processing them one by one.

**Why this priority**: Managing users one-at-a-time is inefficient. Bulk operations significantly reduce administrative time for common tasks like end-of-year deactivations or department-wide role assignments.

**Independent Test**: Can be tested by selecting multiple accounts using checkboxes, clicking a bulk action, and verifying all selected accounts are processed correctly.

**Acceptance Scenarios**:

1. **Given** the accounts table is displayed, **When** an admin clicks the header checkbox, **Then** all visible accounts are selected and a bulk action bar appears
2. **Given** multiple accounts are selected, **When** an admin clicks "Deactivate Selected", **Then** a confirmation modal shows the count and list of accounts to be deactivated
3. **Given** bulk deactivation is confirmed, **When** the operation completes, **Then** all selected accounts are deactivated, a success notification appears, and the table refreshes
4. **Given** multiple accounts are selected, **When** an admin clicks "Assign Role", **Then** a modal allows selecting a role to add to all selected accounts

---

### User Story 6 - Enhanced Visual Feedback and UX Polish (Priority: P2)

As any user of the account management system, I need better visual feedback including loading skeletons, empty states, success animations, and keyboard shortcuts, so that the system feels responsive, professional, and efficient to use.

**Why this priority**: These UX improvements increase perceived performance and user satisfaction. While not functionally critical, they significantly impact the professional quality of the system.

**Independent Test**: Can be tested by triggering loading states (verify skeletons appear), creating accounts (verify success animations), and using keyboard shortcuts.

**Acceptance Scenarios**:

1. **Given** data is loading, **When** the accounts table is fetching, **Then** skeleton placeholders appear instead of empty space or generic "Loading..." text
2. **Given** no accounts match the current filter, **When** the table is empty, **Then** an illustrated empty state appears with helpful message and CTA button
3. **Given** an account is successfully created, **When** the success notification appears, **Then** it includes a checkmark animation and the new row animates into the table
4. **Given** keyboard shortcuts are enabled, **When** an admin presses Ctrl/Cmd+K, **Then** the search box receives focus
5. **Given** keyboard shortcuts are enabled, **When** an admin presses Ctrl/Cmd+N, **Then** the create account modal opens

---

### User Story 7 - Export Accounts to Excel/CSV (Priority: P3)

As an administrator, I need to export the current filtered account list to Excel or CSV format, so that I can create reports, share data with other systems, or perform offline analysis.

**Why this priority**: Export functionality is commonly needed for reporting but isn't blocking core functionality. It can be implemented after higher-priority features.

**Independent Test**: Can be tested by applying filters, clicking export, and verifying the downloaded file contains the correct filtered data with appropriate columns.

**Acceptance Scenarios**:

1. **Given** accounts are displayed (filtered or unfiltered), **When** an admin clicks "Export" and selects "Excel (.xlsx)", **Then** an Excel file downloads containing all visible columns
2. **Given** accounts are displayed, **When** an admin clicks "Export" and selects "CSV (.csv)", **Then** a CSV file downloads with proper formatting
3. **Given** the export includes metadata, **When** the file is opened, **Then** it shows: export timestamp, exported by user, and applied filters in a header

---

### User Story 8 - Welcome Message Customization (Priority: P3)

As an administrator creating a new account, I want to customize the welcome message included in the invitation email, so that I can personalize onboarding for different roles or departments.

**Why this priority**: Personalization improves user experience but isn't critical for basic functionality. Default templates work for most cases.

**Independent Test**: Can be tested by creating an account with a custom welcome message and verifying the invitation email contains the customized text.

**Acceptance Scenarios**:

1. **Given** an admin is creating a new account, **When** they expand the "Welcome Message" section, **Then** they see a textarea with a default template containing placeholders ({firstName}, {role}, etc.)
2. **Given** a custom welcome message is entered, **When** the invitation is sent, **Then** the email contains the customized message with placeholders replaced by actual values
3. **Given** the admin wants to use the default, **When** they leave the welcome message unchanged, **Then** the standard template is used

---

### Edge Cases

- What happens when an admin tries to deactivate their own account? System MUST prevent self-deactivation with clear error message.
- What happens when bulk deactivation includes the current admin? That account MUST be excluded from the bulk operation with notification.
- How does the system handle email delivery failures? Status shows "bounced" and resend option is available.
- What happens when invitation link is clicked after expiry? User sees friendly message and option to request new invitation.
- How does the system handle concurrent edits to the same account? Last-write-wins with notification if changes were overwritten.
- What happens when a role with assigned users is deleted? System MUST warn and require confirmation, optionally reassigning users to different role.

## Requirements *(mandatory)*

### Functional Requirements

**Invitation Management:**
- **FR-001**: System MUST track invitation status (pending, accepted, expired, bounced, cancelled) for each account
- **FR-002**: System MUST allow admins to resend invitations for pending or expired accounts
- **FR-003**: System MUST provide manual activation link generation for email delivery workarounds
- **FR-004**: System MUST expire invitation links after 7 days by default
- **FR-005**: System MUST display invitation status badge in the accounts table

**Audit Logging:**
- **FR-006**: System MUST log all account management actions (create, update, deactivate, permission changes) as AuditEvent resources
- **FR-007**: System MUST provide UI to view, filter, and search audit logs
- **FR-008**: System MUST allow filtering audit logs by date range, user, action type, resource type, and outcome
- **FR-009**: System MUST support exporting audit logs to CSV and Excel formats
- **FR-010**: System MUST display per-account audit history in a timeline format

**Permission Management:**
- **FR-011**: System MUST display a visual permission matrix showing resource types vs. operations (CRUD + Search)
- **FR-012**: System MUST allow toggling individual permissions via checkbox interaction
- **FR-013**: System MUST auto-resolve permission dependencies (e.g., "Update" requires "Read")
- **FR-014**: System MUST show combined permissions preview when multiple roles are assigned
- **FR-015**: System MUST detect and warn about role conflicts (separation of duties violations)

**Search and Filtering:**
- **FR-016**: System MUST implement server-side pagination with configurable page sizes (10, 20, 50, 100)
- **FR-017**: System MUST implement server-side search with debounced input (500ms)
- **FR-018**: System MUST provide advanced filter panel with: role, department, status, hire date range, last login range
- **FR-019**: System MUST allow saving and loading named filter presets

**Bulk Operations:**
- **FR-020**: System MUST allow selecting multiple accounts via checkboxes
- **FR-021**: System MUST display bulk action bar when accounts are selected
- **FR-022**: System MUST support bulk deactivation with confirmation dialog
- **FR-023**: System MUST support bulk role assignment
- **FR-024**: System MUST exclude current user from bulk deactivation operations

**UX Enhancements:**
- **FR-025**: System MUST display loading skeletons during data fetch operations
- **FR-026**: System MUST display illustrated empty states with helpful CTAs
- **FR-027**: System MUST display success animations on account creation/update
- **FR-028**: System MUST support keyboard shortcuts (Ctrl/Cmd+K for search, Ctrl/Cmd+N for create)
- **FR-029**: System MUST display keyboard shortcut help via Ctrl/Cmd+/

**Export:**
- **FR-030**: System MUST support exporting filtered account list to Excel (.xlsx) format
- **FR-031**: System MUST support exporting filtered account list to CSV format
- **FR-032**: System MUST include export metadata (timestamp, user, filters) in exported files

**Welcome Message:**
- **FR-033**: System MUST provide optional welcome message customization during account creation
- **FR-034**: System MUST support placeholder substitution in welcome messages ({firstName}, {role}, {adminName})

### Key Entities

- **Practitioner**: Staff member account with personal information, contact details, and active status
- **PractitionerRole**: Role assignment linking a Practitioner to one or more roles with optional specialty
- **AccessPolicy**: Permission set defining resource access (CRUD operations) for a role
- **AuditEvent**: Immutable log entry recording who did what, when, to which resource, with what outcome
- **Invite**: Pending invitation with token, expiry, and status tracking

## Success Criteria *(mandatory)*

### Measurable Outcomes

**User Experience:**
- **SC-001**: Administrators can identify invitation status and resend within 10 seconds
- **SC-002**: Administrators can create a new account in under 60 seconds
- **SC-003**: User activation rate improves from baseline 58% to 75%+ (measured over 30 days)
- **SC-004**: 95% of admin tasks complete successfully on first attempt

**Performance:**
- **SC-005**: Accounts table loads within 500ms for up to 1000 accounts
- **SC-006**: Search results return within 200ms after debounce
- **SC-007**: Bulk operations process 50 accounts in under 5 seconds

**Compliance:**
- **SC-008**: 100% of account management actions are logged in audit trail
- **SC-009**: Audit logs can be exported for any date range within 30 seconds
- **SC-010**: All HIPAA-required audit fields are captured (timestamp, actor, action, entity, outcome, IP)

**Permission Management:**
- **SC-011**: Administrators can view and modify role permissions without technical assistance
- **SC-012**: Permission conflicts are detected and displayed before saving
- **SC-013**: Permission changes take effect immediately after save (no delay or cache issues)

## Assumptions

- The existing Medplum Invite API supports retrieving invitation status (will verify during implementation)
- AuditEvent resources are already being created for some operations (will extend to cover all operations)
- Server-side FHIR search supports the required filter parameters (_count, _offset, name, identifier, etc.)
- The organization will have fewer than 5,000 total accounts (influences pagination strategy)
- Administrators have basic understanding of role-based access control concepts

## Out of Scope

The following items from the improvement guide are explicitly out of scope for this feature and may be addressed in future iterations:

- Multi-Factor Authentication (MFA) enforcement
- Password policy enforcement
- Session timeout configuration
- IP whitelisting / geofencing
- Audit log immutability (blockchain-style hash chain)
- AI-powered features (role suggestions, anomaly detection, predictive search)
- Real-time WebSocket updates for audit logs
- Role hierarchy visualization and inheritance
- Inline table cell editing
- Dark mode support
