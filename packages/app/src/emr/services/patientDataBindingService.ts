// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { Patient, Encounter, HumanName, Extension } from '@medplum/fhirtypes';
import type { BindingKey, ExtractedPatientData, PatientEncounterData } from '../types/patient-binding';

/**
 * Patient Data Binding Service
 *
 * Provides utilities for extracting patient and encounter data for form auto-population.
 * Supports FHIRPath-like expressions for data extraction and calculated fields.
 */

// ============================================================================
// Constants
// ============================================================================

/** Personal ID identifier system */
const PERSONAL_ID_SYSTEM = 'http://medimind.ge/identifiers/personal-id';

/** Registration number identifier system */
const REGISTRATION_NUMBER_SYSTEM = 'http://medimind.ge/identifiers/registration-number';

/** Patronymic extension URL */
const PATRONYMIC_URL = 'patronymic';

/** Workplace extension URL */
const WORKPLACE_URL = 'workplace';

/** Citizenship extension URL */
const CITIZENSHIP_URL = 'citizenship';

// ============================================================================
// Patient Data Extraction
// ============================================================================

/**
 * Extract all available data from a Patient resource
 *
 * @param patient - FHIR Patient resource
 * @returns Extracted patient data for form binding
 *
 * @example
 * ```typescript
 * const patient = await medplum.readResource('Patient', patientId);
 * const data = extractPatientData(patient);
 * console.log(data.firstName); // "თენგიზი"
 * console.log(data.age); // 35
 * ```
 */
export function extractPatientData(patient: Patient | undefined): ExtractedPatientData {
  if (!patient) {
    return {};
  }

  const name = patient.name?.[0];
  const firstName = name?.given?.[0] || '';
  const lastName = name?.family || '';
  const patronymic = extractPatronymic(name);

  return {
    firstName,
    lastName,
    patronymic,
    name: formatName(firstName, lastName),
    fullName: formatFullName(firstName, patronymic, lastName),
    dob: patient.birthDate,
    age: calculateAge(patient.birthDate),
    personalId: extractIdentifier(patient, PERSONAL_ID_SYSTEM),
    gender: patient.gender,
    phone: extractTelecom(patient, 'phone'),
    email: extractTelecom(patient, 'email'),
    address: extractAddress(patient),
    workplace: extractExtensionString(patient.extension, WORKPLACE_URL),
  };
}

/**
 * Extract all available data from an Encounter resource
 *
 * @param encounter - FHIR Encounter resource
 * @returns Extracted encounter data for form binding
 *
 * @example
 * ```typescript
 * const encounter = await medplum.readResource('Encounter', encounterId);
 * const data = extractEncounterData(encounter);
 * console.log(data.admissionDate); // "2025-11-22T10:30:00Z"
 * ```
 */
export function extractEncounterData(encounter: Encounter | undefined): ExtractedPatientData {
  if (!encounter) {
    return {};
  }

  return {
    admissionDate: encounter.period?.start,
    dischargeDate: encounter.period?.end,
    treatingPhysician: extractTreatingPhysician(encounter),
    registrationNumber: extractIdentifier(encounter, REGISTRATION_NUMBER_SYSTEM),
  };
}

/**
 * Extract combined data from Patient and Encounter resources
 *
 * @param data - Patient and encounter data
 * @returns Combined extracted data for form binding
 *
 * @example
 * ```typescript
 * const combinedData = extractCombinedData({
 *   patient,
 *   encounter,
 * });
 * ```
 */
export function extractCombinedData(data: PatientEncounterData): ExtractedPatientData {
  return {
    ...extractPatientData(data.patient),
    ...extractEncounterData(data.encounter),
  };
}

// ============================================================================
// Calculated Fields
// ============================================================================

/**
 * Calculate age from birth date
 *
 * @param birthDate - ISO date string (YYYY-MM-DD)
 * @returns Age in years or undefined if invalid
 *
 * @example
 * ```typescript
 * const age = calculateAge('1990-05-15');
 * console.log(age); // 34 (as of 2025)
 * ```
 */
export function calculateAge(birthDate: string | undefined): number | undefined {
  if (!birthDate) {
    return undefined;
  }

  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) {
    return undefined;
  }

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  // Adjust if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age >= 0 ? age : undefined;
}

/**
 * Format first name + last name
 *
 * @param firstName - First name
 * @param lastName - Last name
 * @returns Formatted name string
 */
export function formatName(firstName: string, lastName: string): string {
  return [firstName, lastName].filter(Boolean).join(' ');
}

/**
 * Format full name with patronymic (Georgian style)
 *
 * @param firstName - First name
 * @param patronymic - Father's name (patronymic)
 * @param lastName - Last name
 * @returns Full name formatted as "firstName patronymic lastName"
 *
 * @example
 * ```typescript
 * const fullName = formatFullName('თენგიზი', 'გიორგის ძე', 'ხოზვრია');
 * console.log(fullName); // "თენგიზი გიორგის ძე ხოზვრია"
 * ```
 */
export function formatFullName(firstName: string, patronymic: string | undefined, lastName: string): string {
  return [firstName, patronymic, lastName].filter(Boolean).join(' ');
}

// ============================================================================
// FHIRPath Expression Evaluator
// ============================================================================

/**
 * Simple FHIRPath expression evaluator for common patient data paths
 *
 * Supports:
 * - Patient.name.given[0] → firstName
 * - Patient.name.family → lastName
 * - Patient.birthDate → birthDate
 * - Patient.gender → gender
 * - Patient.identifier.where(system='...').value → identifier value
 * - Patient.telecom.where(system='phone').value → phone
 * - Patient.telecom.where(system='email').value → email
 * - Patient.address.text → address
 * - Encounter.period.start → admissionDate
 * - Encounter.period.end → dischargeDate
 *
 * @param fhirPath - FHIRPath expression
 * @param data - Patient and encounter data
 * @returns Evaluated value or undefined
 *
 * @example
 * ```typescript
 * const firstName = evaluateFHIRPath('Patient.name.given[0]', { patient });
 * const phone = evaluateFHIRPath("Patient.telecom.where(system='phone').value", { patient });
 * ```
 */
export function evaluateFHIRPath(fhirPath: string, data: PatientEncounterData): any {
  if (!fhirPath) {
    return undefined;
  }

  const { patient, encounter } = data;

  // Patient paths
  if (fhirPath.startsWith('Patient.')) {
    if (!patient) {
      return undefined;
    }

    const path = fhirPath.substring('Patient.'.length);

    // Name paths
    if (path === 'name.given[0]' || path === 'name.given') {
      return patient.name?.[0]?.given?.[0];
    }
    if (path === 'name.family') {
      return patient.name?.[0]?.family;
    }
    if (path === 'name') {
      const name = patient.name?.[0];
      return name ? formatName(name.given?.[0] || '', name.family || '') : undefined;
    }

    // Extension paths for patronymic
    if (path.includes('extension') && path.includes('patronymic')) {
      return extractPatronymic(patient.name?.[0]);
    }

    // Basic properties
    if (path === 'birthDate') {
      return patient.birthDate;
    }
    if (path === 'gender') {
      return patient.gender;
    }

    // Identifier paths
    if (path.includes('identifier.where')) {
      const systemMatch = path.match(/system='([^']+)'/);
      if (systemMatch) {
        return extractIdentifier(patient, systemMatch[1]);
      }
    }

    // Telecom paths
    if (path.includes('telecom.where')) {
      const systemMatch = path.match(/system='([^']+)'/);
      if (systemMatch) {
        return extractTelecom(patient, systemMatch[1]);
      }
    }

    // Address paths
    if (path === 'address.text' || path === 'address[0].text') {
      return extractAddress(patient);
    }

    // Extension paths
    if (path.includes('extension.where')) {
      const urlMatch = path.match(/url='([^']+)'/);
      if (urlMatch) {
        return extractExtensionString(patient.extension, urlMatch[1]);
      }
    }
  }

  // Encounter paths
  if (fhirPath.startsWith('Encounter.')) {
    if (!encounter) {
      return undefined;
    }

    const path = fhirPath.substring('Encounter.'.length);

    if (path === 'period.start') {
      return encounter.period?.start;
    }
    if (path === 'period.end') {
      return encounter.period?.end;
    }

    // Identifier paths
    if (path.includes('identifier.where')) {
      const systemMatch = path.match(/system='([^']+)'/);
      if (systemMatch) {
        return extractIdentifier(encounter, systemMatch[1]);
      }
    }

    // Participant paths (treating physician)
    if (path.includes('participant') && path.includes('ATND')) {
      return extractTreatingPhysician(encounter);
    }
  }

  return undefined;
}

/**
 * Get value by binding key
 *
 * @param bindingKey - Patient data binding key
 * @param data - Patient and encounter data
 * @returns Value for the binding key
 *
 * @example
 * ```typescript
 * const firstName = getValueByBindingKey('firstName', { patient, encounter });
 * const age = getValueByBindingKey('age', { patient });
 * ```
 */
export function getValueByBindingKey(bindingKey: BindingKey, data: PatientEncounterData): any {
  const extractedData = extractCombinedData(data);

  switch (bindingKey) {
    case 'name':
      return extractedData.name;
    case 'firstName':
      return extractedData.firstName;
    case 'lastName':
      return extractedData.lastName;
    case 'patronymic':
      return extractedData.patronymic;
    case 'fullName':
      return extractedData.fullName;
    case 'dob':
      return extractedData.dob;
    case 'age':
      return extractedData.age;
    case 'personalId':
      return extractedData.personalId;
    case 'gender':
      return extractedData.gender;
    case 'phone':
      return extractedData.phone;
    case 'email':
      return extractedData.email;
    case 'address':
      return extractedData.address;
    case 'workplace':
      return extractedData.workplace;
    case 'admissionDate':
      return extractedData.admissionDate;
    case 'dischargeDate':
      return extractedData.dischargeDate;
    case 'treatingPhysician':
      return extractedData.treatingPhysician;
    case 'registrationNumber':
      return extractedData.registrationNumber;
    default:
      return undefined;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract identifier value by system
 */
function extractIdentifier(resource: { identifier?: Array<{ system?: string; value?: string }> }, system: string): string | undefined {
  return resource.identifier?.find((id) => id.system === system)?.value;
}

/**
 * Extract telecom value by system
 */
function extractTelecom(patient: Patient, system: string): string | undefined {
  return patient.telecom?.find((t) => t.system === system)?.value;
}

/**
 * Extract address text
 */
function extractAddress(patient: Patient): string | undefined {
  const address = patient.address?.[0];
  if (!address) {
    return undefined;
  }

  // Prefer text if available
  if (address.text) {
    return address.text;
  }

  // Build address from parts
  const parts = [
    address.line?.join(', '),
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : undefined;
}

/**
 * Extract patronymic from HumanName extension
 */
function extractPatronymic(name: HumanName | undefined): string | undefined {
  if (!name?.extension) {
    return undefined;
  }

  const patronymicExt = name.extension.find((ext) => ext.url === PATRONYMIC_URL || ext.url?.endsWith(PATRONYMIC_URL));
  return patronymicExt?.valueString;
}

/**
 * Extract string value from extension array
 */
function extractExtensionString(extensions: Extension[] | undefined, url: string): string | undefined {
  if (!extensions) {
    return undefined;
  }

  const ext = extensions.find((e) => e.url === url || e.url?.endsWith(url));
  return ext?.valueString;
}

/**
 * Extract treating physician from encounter participants
 */
function extractTreatingPhysician(encounter: Encounter): string | undefined {
  if (!encounter.participant) {
    return undefined;
  }

  // Look for attending physician (ATND)
  const attending = encounter.participant.find((p) =>
    p.type?.some((t) => t.coding?.some((c) => c.code === 'ATND'))
  );

  if (attending?.individual?.display) {
    return attending.individual.display;
  }

  // Fallback to first participant with display name
  const firstWithDisplay = encounter.participant.find((p) => p.individual?.display);
  return firstWithDisplay?.individual?.display;
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate that required binding keys have values
 *
 * @param requiredKeys - Array of required binding keys
 * @param data - Patient and encounter data
 * @returns Validation result with missing fields
 *
 * @example
 * ```typescript
 * const result = validateRequiredBindings(['firstName', 'lastName', 'personalId'], { patient });
 * if (!result.isValid) {
 *   console.log('Missing fields:', result.missingFields);
 * }
 * ```
 */
export function validateRequiredBindings(
  requiredKeys: BindingKey[],
  data: PatientEncounterData
): { isValid: boolean; missingFields: BindingKey[] } {
  const missingFields: BindingKey[] = [];

  for (const key of requiredKeys) {
    const value = getValueByBindingKey(key, data);
    if (value === undefined || value === null || value === '') {
      missingFields.push(key);
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}
