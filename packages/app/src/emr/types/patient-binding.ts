// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { Patient, Encounter } from '@medplum/fhirtypes';

/**
 * Available patient data binding keys
 * These map to specific FHIR Patient and Encounter resource fields
 */
export type BindingKey =
  | 'name'              // Patient.name (combined first + last)
  | 'firstName'         // Patient.name.given[0]
  | 'lastName'          // Patient.name.family
  | 'patronymic'        // Patient.name.extension[patronymic]
  | 'fullName'          // Calculated: firstName + patronymic + lastName
  | 'dob'               // Patient.birthDate
  | 'age'               // Calculated from Patient.birthDate
  | 'personalId'        // Patient.identifier (personal-id system)
  | 'gender'            // Patient.gender
  | 'phone'             // Patient.telecom (phone system)
  | 'email'             // Patient.telecom (email system)
  | 'address'           // Patient.address.text
  | 'workplace'         // Patient.extension[workplace]
  | 'admissionDate'     // Encounter.period.start
  | 'dischargeDate'     // Encounter.period.end
  | 'treatingPhysician' // Encounter.participant[].individual.display
  | 'registrationNumber'; // Encounter.identifier (registration-number system)

/**
 * Patient data binding configuration
 */
export interface BindingConfig {
  key: BindingKey;
  label: string;
  description: string;
  category: BindingCategory;
  fhirPath: string;
  dataType: BindingDataType;
  isCalculated: boolean;
  calculationFunction?: CalculatedFieldType;
}

/**
 * Binding category for grouping in UI
 */
export type BindingCategory =
  | 'demographics'    // Basic patient information
  | 'contact'         // Contact information
  | 'identifiers'     // ID numbers
  | 'encounter'       // Visit/encounter data
  | 'calculated';     // Calculated fields

/**
 * Data type for binding
 */
export type BindingDataType =
  | 'string'
  | 'date'
  | 'number'
  | 'boolean'
  | 'gender';

/**
 * Calculated field configuration
 */
export interface CalculatedField {
  type: CalculatedFieldType;
  sourceFields: BindingKey[];
  format?: string;
  calculation: (data: PatientEncounterData) => any;
}

/**
 * Types of calculated fields
 */
export type CalculatedFieldType =
  | 'age'              // Calculate age from birthDate
  | 'fullName'         // Combine firstName + patronymic + lastName
  | 'custom';          // Custom calculation function

/**
 * Patient and encounter data for binding
 */
export interface PatientEncounterData {
  patient?: Patient;
  encounter?: Encounter;
}

/**
 * Extracted patient data for form population
 */
export interface ExtractedPatientData {
  name?: string;
  firstName?: string;
  lastName?: string;
  patronymic?: string;
  fullName?: string;
  dob?: string;
  age?: number;
  personalId?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  workplace?: string;
  admissionDate?: string;
  dischargeDate?: string;
  treatingPhysician?: string;
  registrationNumber?: string;
}

/**
 * Binding validation result
 */
export interface BindingValidationResult {
  isValid: boolean;
  missingFields?: BindingKey[];
  errors?: string[];
}

/**
 * All available binding configurations
 * This constant will be defined in patient-binding service
 */
export const BINDING_CONFIGS: Record<BindingKey, BindingConfig> = {
  name: {
    key: 'name',
    label: 'Patient Name',
    description: 'Patient full name (first + last)',
    category: 'demographics',
    fhirPath: 'Patient.name',
    dataType: 'string',
    isCalculated: false,
  },
  firstName: {
    key: 'firstName',
    label: 'First Name',
    description: 'Patient first name',
    category: 'demographics',
    fhirPath: 'Patient.name.given[0]',
    dataType: 'string',
    isCalculated: false,
  },
  lastName: {
    key: 'lastName',
    label: 'Last Name',
    description: 'Patient last name (family name)',
    category: 'demographics',
    fhirPath: 'Patient.name.family',
    dataType: 'string',
    isCalculated: false,
  },
  patronymic: {
    key: 'patronymic',
    label: 'Patronymic',
    description: "Patient's father name (patronymic)",
    category: 'demographics',
    fhirPath: "Patient.name.extension.where(url='patronymic').valueString",
    dataType: 'string',
    isCalculated: false,
  },
  fullName: {
    key: 'fullName',
    label: 'Full Name',
    description: 'Patient full name with patronymic (firstName + patronymic + lastName)',
    category: 'calculated',
    fhirPath: '', // Calculated field
    dataType: 'string',
    isCalculated: true,
    calculationFunction: 'fullName',
  },
  dob: {
    key: 'dob',
    label: 'Date of Birth',
    description: 'Patient birth date',
    category: 'demographics',
    fhirPath: 'Patient.birthDate',
    dataType: 'date',
    isCalculated: false,
  },
  age: {
    key: 'age',
    label: 'Age',
    description: 'Patient age calculated from birth date',
    category: 'calculated',
    fhirPath: '', // Calculated field
    dataType: 'number',
    isCalculated: true,
    calculationFunction: 'age',
  },
  personalId: {
    key: 'personalId',
    label: 'Personal ID',
    description: 'Georgian personal identification number (11 digits)',
    category: 'identifiers',
    fhirPath: "Patient.identifier.where(system='http://medimind.ge/identifiers/personal-id').value",
    dataType: 'string',
    isCalculated: false,
  },
  gender: {
    key: 'gender',
    label: 'Gender',
    description: 'Patient gender (male/female/other/unknown)',
    category: 'demographics',
    fhirPath: 'Patient.gender',
    dataType: 'gender',
    isCalculated: false,
  },
  phone: {
    key: 'phone',
    label: 'Phone Number',
    description: 'Patient phone number',
    category: 'contact',
    fhirPath: "Patient.telecom.where(system='phone').value",
    dataType: 'string',
    isCalculated: false,
  },
  email: {
    key: 'email',
    label: 'Email Address',
    description: 'Patient email address',
    category: 'contact',
    fhirPath: "Patient.telecom.where(system='email').value",
    dataType: 'string',
    isCalculated: false,
  },
  address: {
    key: 'address',
    label: 'Address',
    description: 'Patient address',
    category: 'contact',
    fhirPath: 'Patient.address.text',
    dataType: 'string',
    isCalculated: false,
  },
  workplace: {
    key: 'workplace',
    label: 'Workplace',
    description: 'Patient workplace',
    category: 'demographics',
    fhirPath: "Patient.extension.where(url='workplace').valueString",
    dataType: 'string',
    isCalculated: false,
  },
  admissionDate: {
    key: 'admissionDate',
    label: 'Admission Date',
    description: 'Encounter admission date',
    category: 'encounter',
    fhirPath: 'Encounter.period.start',
    dataType: 'date',
    isCalculated: false,
  },
  dischargeDate: {
    key: 'dischargeDate',
    label: 'Discharge Date',
    description: 'Encounter discharge date',
    category: 'encounter',
    fhirPath: 'Encounter.period.end',
    dataType: 'date',
    isCalculated: false,
  },
  treatingPhysician: {
    key: 'treatingPhysician',
    label: 'Treating Physician',
    description: 'Primary treating physician for the encounter',
    category: 'encounter',
    fhirPath: "Encounter.participant.where(type.coding.code='ATND').individual.display",
    dataType: 'string',
    isCalculated: false,
  },
  registrationNumber: {
    key: 'registrationNumber',
    label: 'Registration Number',
    description: 'Encounter registration number',
    category: 'identifiers',
    fhirPath: "Encounter.identifier.where(system='http://medimind.ge/identifiers/registration-number').value",
    dataType: 'string',
    isCalculated: false,
  },
};
