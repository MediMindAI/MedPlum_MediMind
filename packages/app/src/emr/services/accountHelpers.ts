// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type {
  Practitioner,
  PractitionerRole,
  HumanName,
  ContactPoint,
  Identifier,
  Reference,
  CodeableConcept,
} from '@medplum/fhirtypes';
import type { AccountFormValues, PractitionerFormData, RoleAssignment, AccountRow } from '../types/account-management';

/**
 * Extract practitioner's full name from HumanName array
 * Prefers 'official' use, falls back to first name entry
 *
 * @param practitioner - Practitioner FHIR resource
 * @returns Full name as "Family Given" or empty string
 */
export function getPractitionerName(practitioner: Practitioner): string {
  if (!practitioner.name || practitioner.name.length === 0) {
    return '';
  }

  const officialName = practitioner.name.find((n) => n.use === 'official');
  const name = officialName || practitioner.name[0];

  const family = name.family || '';
  const given = name.given?.join(' ') || '';

  return `${family} ${given}`.trim();
}

/**
 * Extract telecom value by system type
 *
 * @param practitioner - Practitioner FHIR resource
 * @param system - ContactPoint system ('phone', 'email', 'fax', etc.)
 * @param use - Optional ContactPoint use ('work', 'home', 'mobile', etc.)
 * @returns Telecom value or undefined
 */
export function getTelecomValue(
  practitioner: Practitioner,
  system: 'phone' | 'email' | 'fax' | 'pager' | 'url' | 'sms' | 'other',
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile'
): string | undefined {
  if (!practitioner.telecom || practitioner.telecom.length === 0) {
    return undefined;
  }

  let telecom: ContactPoint | undefined;

  if (use) {
    // Find by system and use
    telecom = practitioner.telecom.find((t) => t.system === system && t.use === use);
  } else {
    // Find by system only
    telecom = practitioner.telecom.find((t) => t.system === system);
  }

  return telecom?.value;
}

/**
 * Extract identifier value by system
 *
 * @param practitioner - Practitioner FHIR resource
 * @param system - Identifier system URI
 * @returns Identifier value or undefined
 */
export function getIdentifierValue(practitioner: Practitioner, system: string): string | undefined {
  if (!practitioner.identifier || practitioner.identifier.length === 0) {
    return undefined;
  }

  const identifier = practitioner.identifier.find((id) => id.system === system);
  return identifier?.value;
}

/**
 * Extract staff ID from practitioner identifiers
 * Uses the system: http://medimind.ge/identifiers/staff-id
 *
 * @param practitioner - Practitioner FHIR resource
 * @returns Staff ID or undefined
 */
export function getStaffId(practitioner: Practitioner): string | undefined {
  return getIdentifierValue(practitioner, 'http://medimind.ge/identifiers/staff-id');
}

/**
 * Convert Practitioner + PractitionerRoles to AccountFormValues
 * Used for editing existing accounts
 *
 * @param practitioner - Practitioner FHIR resource
 * @param roles - Array of PractitionerRole resources
 * @returns AccountFormValues for form initialization
 */
export function practitionerToFormValues(
  practitioner: Practitioner,
  roles: PractitionerRole[] = []
): AccountFormValues {
  const name = practitioner.name?.[0];

  // Extract role assignments
  const roleAssignments: RoleAssignment[] = roles.map((role) => ({
    code: role.code?.[0]?.coding?.[0]?.code || '',
    specialty: role.specialty?.[0]?.coding?.[0]?.code,
    department: role.organization?.reference?.split('/')[1],
    location: role.location?.[0]?.reference?.split('/')[1],
    startDate: role.period?.start,
    endDate: role.period?.end,
    active: role.active ?? true,
  }));

  // For MVP (US1), use single role from first PractitionerRole
  const primaryRole = roles[0];

  return {
    firstName: name?.given?.[0] || '',
    lastName: name?.family || '',
    fatherName: name?.given?.[1], // Patronymic as second given name
    gender: practitioner.gender || 'unknown',
    birthDate: practitioner.birthDate,

    email: getTelecomValue(practitioner, 'email', 'work') || '',
    phoneNumber: getTelecomValue(practitioner, 'phone', 'work'),
    workPhone: getTelecomValue(practitioner, 'phone', 'work'),

    staffId: getStaffId(practitioner),

    // Single role for MVP
    role: primaryRole?.code?.[0]?.coding?.[0]?.code,
    specialty: primaryRole?.specialty?.[0]?.coding?.[0]?.code,

    // Multi-role for US2
    roles: roleAssignments.length > 0 ? roleAssignments : undefined,

    // Department/Location for US3
    departments: roleAssignments
      .map((r) => r.department)
      .filter((d): d is string => Boolean(d)),
    locations: roleAssignments
      .map((r) => r.location)
      .filter((l): l is string => Boolean(l)),

    active: practitioner.active ?? true,
  };
}

/**
 * Convert AccountFormValues to Practitioner resource
 * Used for creating/updating practitioner accounts
 *
 * @param values - Form values from AccountForm
 * @param existingPractitioner - Existing Practitioner resource (for updates)
 * @returns Practitioner FHIR resource
 */
export function formValuesToPractitioner(
  values: AccountFormValues,
  existingPractitioner?: Practitioner
): Practitioner {
  // FHIR-compliant HumanName structure for Georgian naming convention
  // Georgian patronymic (father's name) is stored as second given name
  // This follows FHIR guidance for cultures with patronymics
  // Alternative: Use http://hl7.org/fhir/StructureDefinition/humanname-fathers-family extension
  const name: HumanName = {
    use: 'official',
    family: values.lastName,
    given: values.fatherName ? [values.firstName, values.fatherName] : [values.firstName],
  };

  const telecom: ContactPoint[] = [];

  if (values.email) {
    telecom.push({
      system: 'email',
      value: values.email,
      use: 'work',
    });
  }

  if (values.phoneNumber) {
    telecom.push({
      system: 'phone',
      value: values.phoneNumber,
      use: 'work',
    });
  }

  if (values.workPhone && values.workPhone !== values.phoneNumber) {
    telecom.push({
      system: 'phone',
      value: values.workPhone,
      use: 'work',
    });
  }

  const identifier: Identifier[] = [];

  if (values.staffId) {
    // Custom identifier system for MediMind staff IDs
    // URI documentation: http://medimind.ge/identifiers/staff-id
    // FHIR best practice: Consider adding 'type' CodeableConcept for semantic clarity
    // Example: type.coding[0].code = 'EN' (Employee Number) from v2-0203 code system
    identifier.push({
      system: 'http://medimind.ge/identifiers/staff-id',
      value: values.staffId,
    });
  }

  const practitioner: Practitioner = {
    resourceType: 'Practitioner',
    id: existingPractitioner?.id,
    meta: existingPractitioner?.meta,
    active: values.active ?? true,
    name: [name],
    telecom: telecom.length > 0 ? telecom : undefined,
    identifier: identifier.length > 0 ? identifier : undefined,
    gender: values.gender || 'unknown',
    birthDate: values.birthDate,
  };

  return practitioner;
}

/**
 * Convert Practitioner + PractitionerRoles to AccountRow for table display
 *
 * @param practitioner - Practitioner FHIR resource
 * @param roles - Array of PractitionerRole resources
 * @returns AccountRow for table rendering
 */
export function practitionerToAccountRow(
  practitioner: Practitioner,
  roles: PractitionerRole[] = []
): AccountRow {
  const roleNames = roles
    .map((role) => role.code?.[0]?.coding?.[0]?.display || role.code?.[0]?.text || '')
    .filter((name) => name !== '');

  const departmentNames = roles
    .map((role) => role.organization?.display || '')
    .filter((name) => name !== '');

  return {
    id: practitioner.id!,
    staffId: getStaffId(practitioner),
    name: getPractitionerName(practitioner),
    email: getTelecomValue(practitioner, 'email', 'work') || '',
    phone: getTelecomValue(practitioner, 'phone', 'work'),
    roles: roleNames,
    departments: departmentNames.length > 0 ? departmentNames : undefined,
    active: practitioner.active ?? true,
    lastModified: practitioner.meta?.lastUpdated,
  };
}

/**
 * Create a Reference to a Practitioner resource
 *
 * @param practitioner - Practitioner FHIR resource
 * @returns Reference object
 */
export function createPractitionerReference(practitioner: Practitioner): Reference {
  return {
    reference: `Practitioner/${practitioner.id}`,
    display: getPractitionerName(practitioner),
  };
}

/**
 * Create a CodeableConcept for a role code
 * Uses SNOMED CT codes for roles
 *
 * @param roleCode - Role code (e.g., 'physician', 'nurse')
 * @param roleDisplay - Human-readable role display name
 * @returns CodeableConcept
 */
export function createRoleCodeableConcept(roleCode: string, roleDisplay?: string): CodeableConcept {
  return {
    coding: [
      {
        system: 'http://snomed.info/sct',
        code: roleCode,
        display: roleDisplay || roleCode,
      },
    ],
    text: roleDisplay || roleCode,
  };
}

/**
 * Create a CodeableConcept for a medical specialty
 * Uses NUCC Healthcare Provider Taxonomy codes
 *
 * @param specialtyCode - NUCC specialty code (e.g., '207RC0000X')
 * @param specialtyDisplay - Human-readable specialty display name
 * @returns CodeableConcept
 */
export function createSpecialtyCodeableConcept(
  specialtyCode: string,
  specialtyDisplay?: string
): CodeableConcept {
  return {
    coding: [
      {
        system: 'http://nucc.org/provider-taxonomy',
        code: specialtyCode,
        display: specialtyDisplay || specialtyCode,
      },
    ],
    text: specialtyDisplay || specialtyCode,
  };
}

/**
 * Batch convert multiple Practitioner resources to AccountRows
 * Used for table list rendering
 *
 * @param practitioners - Array of Practitioner resources
 * @param rolesMap - Map of practitioner IDs to their PractitionerRole arrays
 * @returns Array of AccountRow objects
 */
export function practitionersToAccountRows(
  practitioners: Practitioner[],
  rolesMap = new Map<string, PractitionerRole[]>()
): AccountRow[] {
  return practitioners.map((practitioner) => {
    const roles = rolesMap.get(practitioner.id!) || [];
    return practitionerToAccountRow(practitioner, roles);
  });
}
