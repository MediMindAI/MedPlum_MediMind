// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { Practitioner, PractitionerRole, Reference } from '@medplum/fhirtypes';

/**
 * Form values for creating/editing practitioner accounts
 * Maps to Practitioner and PractitionerRole FHIR resources
 */
export interface AccountFormValues {
  // Basic Information
  firstName: string;
  lastName: string;
  fatherName?: string; // Patronymic (optional)
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string; // ISO 8601 date format

  // Contact Information
  email: string; // Required for login credentials
  phoneNumber?: string; // E.164 format (e.g., +995500050610)
  workPhone?: string; // Work phone number

  // Employment Details
  staffId?: string; // Employee ID/Staff number
  hireDate?: string; // ISO 8601 date format

  // Role Assignment (Single role for MVP - US1)
  role?: string; // Role code (e.g., 'physician', 'nurse', 'admin')
  specialty?: string; // Medical specialty code (NUCC Healthcare Provider Taxonomy)

  // Multi-Role Assignment (US2)
  roles?: RoleAssignment[]; // Array of roles with specialties and departments

  // RBAC Role Assignment (AccessPolicy-based roles from role management system)
  rbacRoles?: {
    roleId: string; // AccessPolicy resource ID
    roleName: string; // Role display name
    roleCode: string; // Role code
  }[];

  // Department/Location Assignment (US3)
  departments?: string[]; // Organization resource IDs
  locations?: string[]; // Location resource IDs

  // Account Status
  active?: boolean; // Account active status (default: true)

  // Notes
  notes?: string; // Administrative notes
}

/**
 * Role assignment for multi-role practitioners (US2)
 * Each assignment represents one PractitionerRole resource
 */
export interface RoleAssignment {
  code: string; // Role code (physician, nurse, etc.)
  specialty?: string; // Medical specialty (optional)
  department?: string; // Organization resource ID
  location?: string; // Location resource ID
  startDate?: string; // ISO 8601 date format
  endDate?: string; // ISO 8601 date format (optional)
  active: boolean; // Role active status
}

/**
 * Practitioner form data extracted from FHIR resources
 * Used for displaying and editing existing accounts
 */
export interface PractitionerFormData {
  id: string; // FHIR resource ID
  practitioner: Practitioner;
  roles: PractitionerRole[];
  formValues: AccountFormValues;
}

/**
 * Account row data for table display
 * Flattened structure for efficient table rendering
 */
export interface AccountRow {
  id: string; // Practitioner resource ID
  staffId?: string; // Employee ID
  name: string; // Full name (family given)
  email: string; // Primary email
  phone?: string; // Primary phone
  roles: string[]; // Role display names (comma-separated)
  departments?: string[]; // Department names
  active: boolean; // Account status
  lastModified?: string; // ISO 8601 timestamp
}

/**
 * Search and filter parameters for account list
 * Maps to FHIR search parameters
 */
export interface AccountSearchFilters {
  // Text search
  name?: string; // Search in name fields (given, family)
  email?: string; // Exact email match
  staffId?: string; // Employee ID search

  // Role and department filters
  role?: string; // Filter by role code
  department?: string; // Filter by organization ID
  specialty?: string; // Filter by specialty code

  // Status filter
  active?: boolean; // true=active only, false=inactive only, undefined=all

  // Date range
  hireDateFrom?: string; // ISO 8601 date
  hireDateTo?: string; // ISO 8601 date

  // Pagination
  page?: number; // Page number (cursor-based)
  count?: number; // Results per page (default: 50)
}

/**
 * Permission matrix data structure (US6)
 * Represents AccessPolicy resource configuration
 */
export interface PermissionMatrix {
  resourceType: string; // FHIR resource type (Patient, Observation, etc.)
  interactions: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    search: boolean;
  };
  criteria?: string; // FHIR search criteria (e.g., "Patient?organization=%department")
}

/**
 * Access policy template for roles
 * Maps to AccessPolicy FHIR resource
 */
export interface AccessPolicyTemplate {
  id: string; // AccessPolicy resource ID
  name: string; // Template name (e.g., "Physician Role Template")
  description?: string; // Template description
  resources: PermissionMatrix[]; // Array of resource permissions
  parameters?: AccessPolicyParameter[]; // Parameterized values
}

/**
 * Access policy parameter substitution
 * Used in ProjectMembership.access.parameter
 */
export interface AccessPolicyParameter {
  name: string; // Parameter name (e.g., 'department', 'profile')
  valueReference?: Reference; // Reference to Organization, Practitioner, etc.
  valueString?: string; // String value
}

/**
 * Role option for dropdowns
 * Loaded from translations/account-roles.json
 */
export interface RoleOption {
  code: string; // Role code (unique identifier)
  name: {
    ka: string; // Georgian name
    en: string; // English name
    ru: string; // Russian name
  };
  description?: {
    ka?: string;
    en?: string;
    ru?: string;
  };
}

/**
 * Medical specialty option for dropdowns
 * Loaded from translations/medical-specialties.json
 */
export interface SpecialtyOption {
  code: string; // NUCC code or SNOMED CT code
  system: string; // Coding system (nucc.org or snomed.info)
  name: {
    ka: string; // Georgian name
    en: string; // English name
    ru: string; // Russian name
  };
}

/**
 * Department option for dropdowns
 * Loaded from Organization resources with type=dept
 */
export interface DepartmentOption {
  id: string; // Organization resource ID
  code?: string; // Department code
  name: string; // Department name (localized)
  active: boolean; // Department active status
}

/**
 * Location option for dropdowns
 * Loaded from Location resources
 */
export interface LocationOption {
  id: string; // Location resource ID
  name: string; // Location name
  address?: string; // Physical address
  active: boolean; // Location active status
}

/**
 * Audit log entry for account operations (US7)
 * Maps to AuditEvent FHIR resource
 */
export interface AuditLogEntry {
  id: string; // AuditEvent resource ID
  timestamp: string; // ISO 8601 timestamp (recorded)
  action: 'C' | 'U' | 'D' | 'R' | 'E'; // Create, Update, Delete, Read, Execute
  agent: string; // Display name of user who performed action
  agentId: string; // Practitioner resource ID of agent
  entityType: string; // Resource type (Practitioner, PractitionerRole, etc.)
  entityId: string; // Resource ID affected
  entityDisplay?: string; // Display name of affected entity
  outcome: '0' | '4' | '8' | '12'; // Success (0), Minor failure (4), Serious failure (8), Major failure (12)
  outcomeDescription?: string; // Human-readable outcome
  details?: Record<string, string>; // Additional details
}

/**
 * Validation result structure
 * Used by accountValidators.ts
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string; // Error message if validation fails
}

/**
 * Account deactivation modal data (US5)
 */
export interface DeactivationData {
  practitionerId: string;
  practitionerName: string;
  currentStatus: boolean; // true=active, false=inactive
  reason?: string; // Deactivation reason
  effectiveDate?: string; // ISO 8601 date when deactivation takes effect
}

/**
 * Invite API request body
 * Used by accountService.createPractitioner
 */
export interface InviteRequest {
  resourceType: 'Practitioner';
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Optional, auto-generated if omitted
  sendEmail?: boolean; // Send welcome email (default: true)
  membership?: {
    admin?: boolean; // Grant admin privileges
    accessPolicy?: Reference; // AccessPolicy reference
  };
}

/**
 * Email activation link data
 * Used for fallback when email service fails (R8)
 */
export interface ActivationLinkData {
  activationUrl: string; // Full URL to password setup page
  email: string; // Recipient email
  expiresAt?: string; // ISO 8601 timestamp
}
