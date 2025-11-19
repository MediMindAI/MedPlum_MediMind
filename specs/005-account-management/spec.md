# Feature Specification: Hospital Account Management Dashboard

**Feature Branch**: `005-account-management`
**Created**: 2025-11-19
**Status**: Draft
**Input**: User description: "now i want to create the account crreation dashboard, with all the necessary role assigment systems following all the FHIR standarts and hospital EMR best practicies. i want the admin suers to be able to access that dashboard from the right side menue. were admin can create the accounts for every role in the hospital give me beautiful production ready pracitcal workimg system , use FHIR and medplum infrucstructure adn help me build everything necessary"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Creates Healthcare Provider Account (Priority: P1)

Hospital administrators need to quickly onboard new healthcare providers (doctors, nurses, technicians) with appropriate system access and role assignments to ensure they can start serving patients immediately.

**Why this priority**: This is the core MVP functionality - without the ability to create accounts for healthcare staff, the system cannot function. This represents the most critical workflow that delivers immediate value.

**Independent Test**: Can be fully tested by creating a practitioner account with basic information (name, email, role) and verifying the account appears in the system and can log in. Delivers standalone value by enabling staff onboarding.

**Acceptance Scenarios**:

1. **Given** an administrator is logged into the EMR system, **When** they navigate to the Account Management dashboard from the right-side menu, **Then** they see the account creation interface
2. **Given** the administrator is on the account creation page, **When** they enter required information (first name, last name, email, role type) and submit, **Then** a new account is created with default permissions for that role
3. **Given** a new practitioner account was just created, **When** the practitioner logs in with their credentials, **Then** they can access features appropriate to their assigned role
4. **Given** an administrator creates an account with an existing email, **When** they submit the form, **Then** they see a clear error message indicating the email is already in use

---

### User Story 2 - Admin Assigns Multiple Roles and Specialties (Priority: P2)

Administrators need to assign complex role combinations and medical specialties to staff members who serve multiple functions (e.g., a doctor who is both an anesthesiologist and department head) to accurately represent their responsibilities and access needs.

**Why this priority**: Once basic account creation works, role flexibility becomes essential for real-world hospital scenarios where staff often have overlapping responsibilities.

**Independent Test**: Can be tested by assigning multiple roles (e.g., "Physician" + "Department Head") and verifying the user has combined permissions. Delivers value by supporting complex organizational structures.

**Acceptance Scenarios**:

1. **Given** an administrator is creating a physician account, **When** they select "Cardiologist" as the specialty from a searchable dropdown, **Then** the specialty is added to the account profile
2. **Given** an administrator is editing an existing account, **When** they assign multiple roles (e.g., Physician, Researcher, Department Head), **Then** all roles are saved and reflected in the user's permissions
3. **Given** a staff member has multiple assigned roles, **When** they log in, **Then** they can access all features granted by any of their assigned roles
4. **Given** an administrator removes a role from a user, **When** the change is saved, **Then** the user immediately loses access to features exclusive to that role

---

### User Story 3 - Admin Manages Department and Location Assignments (Priority: P3)

Administrators need to assign staff to specific hospital departments and physical locations to control which patients and records they can access based on their work area.

**Why this priority**: Department and location-based access control is important for security and workflow organization but the system can function without it initially.

**Independent Test**: Can be tested by assigning a user to "Cardiology Department" and verifying they only see patients from that department. Delivers value by improving data security and workflow efficiency.

**Acceptance Scenarios**:

1. **Given** an administrator is creating a new account, **When** they select one or more departments from the available list, **Then** the departments are associated with the account
2. **Given** a nurse is assigned to the "Emergency Department", **When** they log in and view their patient list, **Then** they primarily see patients admitted to Emergency
3. **Given** an administrator assigns a physician to multiple locations (e.g., Main Hospital, Satellite Clinic), **When** the physician schedules appointments, **Then** they can select from their assigned locations

---

### User Story 4 - Admin Searches and Filters Existing Accounts (Priority: P3)

Administrators need to quickly find and manage existing user accounts using search and filter capabilities to efficiently handle account modifications and reviews across large staff populations.

**Why this priority**: Search and filter improve administrative efficiency but are not required for initial MVP functionality.

**Independent Test**: Can be tested by creating 20+ accounts and using search to find specific users by name, email, role, or department. Delivers value by reducing administrative time.

**Acceptance Scenarios**:

1. **Given** an administrator is viewing the account management dashboard, **When** they enter a name in the search box, **Then** the account list filters to show matching results in real-time
2. **Given** there are 100+ user accounts in the system, **When** an administrator filters by role type (e.g., "Nurses"), **Then** only accounts with that role are displayed
3. **Given** an administrator filters by department and role simultaneously, **When** both filters are active, **Then** results match all selected criteria (AND logic)
4. **Given** an administrator clicks on an account in the search results, **When** the account detail view opens, **Then** they can edit all account properties

---

### User Story 5 - Admin Deactivates and Reactivates Accounts (Priority: P2)

Administrators need to temporarily deactivate accounts (for leave, suspension) or permanently deactivate accounts (for departures) while preserving historical records and audit trails.

**Why this priority**: Account lifecycle management is critical for security and compliance but not needed for initial account creation MVP.

**Independent Test**: Can be tested by deactivating an account, verifying the user cannot log in, then reactivating and confirming access is restored. Delivers value by maintaining security.

**Acceptance Scenarios**:

1. **Given** an administrator views an active user account, **When** they click the "Deactivate" button and confirm, **Then** the account status changes to inactive and the user cannot log in
2. **Given** a user account is inactive, **When** an administrator clicks "Reactivate" and confirms, **Then** the account status changes to active and the user can log in again
3. **Given** a user account is deactivated, **When** viewing audit logs, **Then** all historical actions by that user remain visible with proper attribution
4. **Given** an administrator attempts to deactivate their own account, **When** they try to submit, **Then** they see an error preventing self-deactivation

---

### User Story 6 - Admin Manages User Permissions and Access Policies (Priority: P2)

Administrators need granular control over what specific actions and data each role can access to comply with privacy regulations and organizational policies.

**Why this priority**: Fine-grained permissions are essential for security and compliance but can start with sensible role-based defaults.

**Independent Test**: Can be tested by restricting a role's access to certain patient data and verifying the restriction is enforced. Delivers value by enabling compliance with privacy regulations.

**Acceptance Scenarios**:

1. **Given** an administrator is configuring a role's permissions, **When** they toggle specific capabilities (e.g., "View Lab Results", "Prescribe Medications"), **Then** users with that role gain or lose those capabilities
2. **Given** a custom access policy is created for sensitive patient data, **When** an administrator assigns it to a user, **Then** that user's access is restricted according to the policy
3. **Given** a user attempts to access a restricted resource, **When** the system checks their permissions, **Then** access is denied with a clear message explaining the restriction
4. **Given** an administrator creates a new custom role, **When** they set its permissions, **Then** users assigned that role inherit those exact permissions

---

### User Story 7 - Admin Views Account Activity and Audit Logs (Priority: P3)

Administrators need to view account creation history, login activity, and permission changes for security audits, compliance reporting, and troubleshooting access issues.

**Why this priority**: Audit capabilities are important for compliance but not required for basic account management functionality.

**Independent Test**: Can be tested by creating an account, modifying it, and viewing the complete audit trail. Delivers value by enabling compliance and security monitoring.

**Acceptance Scenarios**:

1. **Given** an administrator views a user account, **When** they click the "Audit Log" tab, **Then** they see a chronological list of all changes made to that account
2. **Given** an audit log entry exists for a permission change, **When** an administrator views it, **Then** they see who made the change, when, what changed, and the reason (if provided)
3. **Given** an administrator needs to investigate suspicious activity, **When** they filter audit logs by date range and action type, **Then** relevant entries are displayed
4. **Given** compliance requires audit retention, **When** audit logs are generated, **Then** they cannot be deleted or modified by any user including administrators

---

### Edge Cases

- What happens when an administrator tries to create an account with a duplicate email address?
- How does the system handle account creation when the email service is unavailable (cannot send welcome email)?
- What happens when a user has conflicting permissions from multiple assigned roles?
- How does the system behave when an administrator tries to assign a role that doesn't exist?
- What happens when a user's account is deactivated while they are actively logged in?
- How does the system handle bulk account creation (importing 100+ accounts)?
- What happens when network connectivity is lost during account creation?
- How does the system handle special characters or non-Latin characters in user names?
- What happens when an administrator assigns a user to a department that no longer exists?
- How does the system handle permission inheritance when role definitions are updated?

## Requirements *(mandatory)*

### Functional Requirements

#### Account Creation
- **FR-001**: System MUST allow administrators to create new user accounts by providing: first name, last name, email address, phone number, and at least one role assignment
- **FR-002**: System MUST validate email addresses conform to RFC 5322 standard before account creation
- **FR-003**: System MUST prevent duplicate accounts with the same email address
- **FR-004**: System MUST generate unique user identifiers for each account
- **FR-005**: System MUST send account activation notifications to new users at their registered email address
- **FR-006**: System MUST allow administrators to set initial password policies (temporary password, force reset on first login)

#### Role Management
- **FR-007**: System MUST support assigning one or more roles to each user account from predefined hospital roles (Physician, Nurse, Technician, Administrator, Receptionist, Pharmacist, Laboratory Staff, Radiologist, Therapist, Department Head, Researcher)
- **FR-008**: System MUST associate each role with a specific set of permissions that control access to features and data
- **FR-009**: System MUST support medical specialty assignments for clinical roles (e.g., Cardiologist, Orthopedic Surgeon, Pediatrician)
- **FR-010**: System MUST allow administrators to create custom roles with configurable permissions
- **FR-011**: System MUST handle permission conflicts when users have multiple roles by granting the union of all permissions (most permissive wins)

#### Access Control
- **FR-012**: System MUST enforce role-based access control (RBAC) on all features and data access
- **FR-013**: System MUST allow administrators to assign users to one or more hospital departments
- **FR-014**: System MUST restrict patient data access based on department assignments when configured
- **FR-015**: System MUST support location-based access control for multi-site hospitals
- **FR-016**: System MUST log all authorization decisions for audit purposes

#### User Interface
- **FR-017**: System MUST provide an "Account Management" menu item in the right-side administrative menu accessible only to administrators
- **FR-018**: System MUST display a searchable, sortable table of all user accounts with key information (name, email, roles, status, last login)
- **FR-019**: System MUST provide a form interface for creating new accounts with validation feedback
- **FR-020**: System MUST support inline editing of existing accounts
- **FR-021**: System MUST provide visual indicators for account status (active, inactive, locked, pending activation)

#### Account Lifecycle
- **FR-022**: System MUST allow administrators to deactivate user accounts, preventing login while preserving historical data
- **FR-023**: System MUST allow administrators to reactivate previously deactivated accounts
- **FR-024**: System MUST support permanent account deletion with confirmation safeguards (two-step confirmation)
- **FR-025**: System MUST preserve audit trails and historical records even when accounts are deactivated or deleted

#### Search and Filtering
- **FR-026**: System MUST provide real-time search across user accounts by name, email, and user ID
- **FR-027**: System MUST support filtering accounts by role, department, status, and last login date
- **FR-028**: System MUST support combined search and filter operations with AND logic
- **FR-029**: System MUST display search result counts and pagination for large result sets

#### Audit and Compliance
- **FR-030**: System MUST log all account creation, modification, and deletion events with timestamp, administrator ID, and changes made
- **FR-031**: System MUST display audit logs for each user account showing complete change history
- **FR-032**: System MUST prevent modification or deletion of audit log entries
- **FR-033**: System MUST retain audit logs for minimum 7 years to meet healthcare compliance requirements

#### Data Validation
- **FR-034**: System MUST validate phone numbers conform to international E.164 format
- **FR-035**: System MUST require strong passwords meeting configurable complexity requirements (minimum length, character types)
- **FR-036**: System MUST validate that required fields are populated before account creation
- **FR-037**: System MUST sanitize all user inputs to prevent injection attacks

### Key Entities

- **User Account**: Represents a system user with authentication credentials, personal information (name, email, phone), status (active/inactive), and timestamps (created, last login)
- **Role**: Represents a job function with associated permissions (e.g., Physician, Nurse). Users can have multiple roles. Each role grants specific capabilities.
- **Permission**: Represents a specific capability or access right (e.g., "view patient records", "prescribe medications"). Permissions are assigned to roles and inherited by users.
- **Medical Specialty**: Represents a clinical specialty (e.g., Cardiology, Orthopedics) assigned to clinical roles. Used for workflow routing and expertise matching.
- **Department**: Represents a hospital department (e.g., Emergency, Cardiology, Radiology). Users can be assigned to multiple departments for access control.
- **Location**: Represents a physical hospital location or campus. Used for multi-site healthcare organizations to control data access by geography.
- **Access Policy**: Represents fine-grained access rules that can be assigned to users or roles, controlling specific data access patterns (e.g., "only own patients", "department patients only").
- **Audit Log Entry**: Immutable record of account-related events including who performed the action, what changed, when, and why (if provided). Cannot be modified or deleted.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can create a new user account with role assignment in under 2 minutes
- **SC-002**: System supports 500+ concurrent administrators managing accounts without performance degradation
- **SC-003**: 95% of account creation attempts succeed on the first try without validation errors
- **SC-004**: Account search returns results in under 1 second for datasets with up to 10,000 user accounts
- **SC-005**: Zero unauthorized access incidents related to improper role assignments within the first 6 months of deployment
- **SC-006**: 100% of account modifications are captured in audit logs with complete traceability
- **SC-007**: Administrator task completion time for account management reduces by 60% compared to previous manual processes
- **SC-008**: New staff members can log in and access appropriate features within 5 minutes of account creation
- **SC-009**: 90% of administrators rate the account management interface as "easy to use" or "very easy to use" in usability testing
- **SC-010**: System achieves 99.9% uptime for account management features during business hours

## Assumptions

1. **Authentication Infrastructure**: Assumes the Medplum platform provides OAuth 2.0 / OpenID Connect authentication infrastructure that this feature will leverage
2. **Email Service**: Assumes an email service is available for sending account activation and notification emails
3. **FHIR Resources**: Assumes Practitioner, PractitionerRole, Person, and Organization FHIR resources are used to represent users and their roles following FHIR R4 standard
4. **Multilingual Support**: Assumes Georgian, English, and Russian language support is required for all user-facing text
5. **Admin Role Exists**: Assumes at least one administrator account exists in the system to bootstrap additional account creation
6. **Permissions Model**: Assumes Medplum's AccessPolicy resource is used for fine-grained permission control
7. **Mobile Responsiveness**: Assumes the interface must work on tablets and mobile devices, not just desktop browsers
8. **Browser Support**: Assumes modern browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
9. **Default Roles**: Assumes a standard set of hospital roles are pre-configured: Physician, Nurse, Technician, Administrator, Receptionist, Pharmacist, Laboratory Staff, Radiologist, Therapist
10. **Password Security**: Assumes passwords are hashed using industry-standard algorithms (bcrypt, Argon2) and never stored in plain text

## Dependencies

- **Medplum Authentication System**: Requires Medplum's authentication and authorization infrastructure to be operational
- **FHIR API**: Requires Medplum FHIR API endpoints for creating and managing Practitioner, PractitionerRole, and AccessPolicy resources
- **Email Service**: Requires integration with email service (SMTP or API-based) for sending account notifications
- **EMR Layout System**: Requires the existing EMR UI layout and right-side menu structure to integrate the Account Management menu item
- **Role Configuration**: Requires initial setup of hospital roles and their associated permissions before the dashboard can be used
- **Translation System**: Requires the existing EMR translation infrastructure (useTranslation hook) for multilingual support

## Out of Scope

The following items are explicitly excluded from this feature to maintain focused scope:

- **Patient Account Management**: Managing patient accounts and portal access is a separate feature
- **Billing/Payroll Integration**: Connecting user accounts to billing, payroll, or HR systems
- **Advanced Scheduling**: Shift scheduling, calendar management, or resource allocation features
- **Training/Certification Tracking**: Tracking continuing education, certifications, or credentialing requirements
- **Performance Reviews**: Employee performance evaluation or review workflows
- **Bulk Import UI**: Web-based interface for importing hundreds of accounts from CSV (command-line import tools may be provided separately)
- **Single Sign-On (SSO)**: Integration with external identity providers (LDAP, Active Directory, Azure AD) - may be future enhancement
- **Two-Factor Authentication (2FA)**: Multi-factor authentication setup and enforcement - considered future enhancement
- **Custom Permission Builder**: Advanced UI for creating custom permissions from scratch (custom roles using existing permissions are in scope)
- **Account Templates**: Pre-configured account templates for common role combinations

## Risks and Mitigations

### High Priority Risks

**Risk 1: Unauthorized Access Due to Permission Misconfiguration**
- **Impact**: High - Could lead to privacy violations and regulatory non-compliance
- **Likelihood**: Medium
- **Mitigation**: Implement comprehensive permission testing, default to least-privilege model, require explicit permission grants, provide permission preview before saving

**Risk 2: Data Loss During Account Operations**
- **Impact**: High - Could result in inability to access patient records or system features
- **Likelihood**: Low
- **Mitigation**: Implement soft deletes (deactivation) instead of hard deletes, maintain audit trails, provide account recovery mechanisms, implement database backups

**Risk 3: Performance Degradation with Large User Base**
- **Impact**: Medium - Could slow administrative workflows and user management
- **Likelihood**: Medium
- **Mitigation**: Implement pagination for account lists, optimize database queries with proper indexing, use caching for role/permission lookups, conduct load testing

### Medium Priority Risks

**Risk 4: Email Delivery Failures**
- **Impact**: Medium - New users may not receive activation instructions
- **Likelihood**: Medium
- **Mitigation**: Display activation link in admin interface as backup, implement email retry logic, provide manual account activation option, log all email delivery attempts

**Risk 5: Complex Permission Conflicts**
- **Impact**: Medium - Users with multiple roles may have unexpected access patterns
- **Likelihood**: Medium
- **Mitigation**: Document clear permission inheritance rules (union of permissions), provide permission simulation/preview tools, implement comprehensive permission testing

**Risk 6: Usability Issues for Non-Technical Administrators**
- **Impact**: Medium - Could lead to errors in account setup and reduced adoption
- **Likelihood**: Medium
- **Mitigation**: Conduct usability testing with actual hospital administrators, provide contextual help and tooltips, implement validation with clear error messages, offer training documentation

## Compliance and Security

### Healthcare Compliance
- **HIPAA Compliance**: All user access must be logged and auditable to comply with HIPAA audit trail requirements
- **Access Control**: System must implement role-based access control (RBAC) to ensure minimum necessary access principle
- **Data Retention**: Audit logs must be retained for minimum 7 years per healthcare industry standards

### Security Requirements
- **Password Security**: All passwords must be hashed using industry-standard algorithms (bcrypt with minimum 10 rounds or Argon2)
- **Session Management**: User sessions must expire after configurable period of inactivity (default 30 minutes)
- **Audit Logging**: All privileged operations (account creation, role changes, permission modifications) must be logged with administrator identity and timestamp
- **Input Validation**: All user inputs must be validated and sanitized to prevent injection attacks (SQL injection, XSS)
- **Principle of Least Privilege**: New accounts must default to minimum necessary permissions for their assigned role

### Data Privacy
- **Personal Information Protection**: User personal information (email, phone) must be protected and access controlled
- **Right to be Forgotten**: System must support permanent account deletion with data anonymization for compliance with privacy regulations
- **Data Access Logging**: All access to user account data must be logged for audit purposes
