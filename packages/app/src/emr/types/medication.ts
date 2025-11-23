// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * Form values for creating/editing medication requests (prescriptions)
 * Maps to FHIR MedicationRequest resource
 */
export interface MedicationRequestFormValues {
  /** Resource ID (for editing) */
  id?: string;

  /** Patient reference (required) */
  patientId: string;

  /** Prescribing practitioner reference */
  prescriberId?: string;

  /** Medication name or code */
  medicationName: string;

  /** Medication code (e.g., NDC, RxNorm) */
  medicationCode?: string;

  /** Dosage instruction text */
  dosageInstruction: string;

  /** Dose quantity (e.g., "500") */
  doseQuantity?: number;

  /** Dose unit (e.g., "mg", "ml") */
  doseUnit?: string;

  /** Frequency (e.g., "twice daily", "every 8 hours") */
  frequency?: string;

  /** Route of administration (oral, IV, topical, etc.) */
  route?: 'oral' | 'intravenous' | 'intramuscular' | 'subcutaneous' | 'topical' | 'inhalation' | 'other';

  /** Duration in days */
  durationDays?: number;

  /** Quantity to dispense */
  dispenseQuantity?: number;

  /** Number of refills allowed */
  numberOfRefills?: number;

  /** Start date (ISO 8601) */
  startDate?: string;

  /** End date (ISO 8601) */
  endDate?: string;

  /** Request status */
  status: 'draft' | 'active' | 'on-hold' | 'cancelled' | 'completed' | 'entered-in-error' | 'stopped';

  /** Priority */
  priority?: 'routine' | 'urgent' | 'asap' | 'stat';

  /** Additional notes */
  notes?: string;

  /** Reason for prescription */
  reasonText?: string;

  /** Substitution allowed */
  substitutionAllowed?: boolean;
}

/**
 * Row data for medication request table display
 */
export interface MedicationRequestRow {
  /** Resource ID */
  id: string;

  /** Patient name */
  patientName: string;

  /** Patient ID */
  patientId: string;

  /** Medication name */
  medicationName: string;

  /** Dosage instruction */
  dosageInstruction: string;

  /** Status */
  status: string;

  /** Prescriber name */
  prescriberName?: string;

  /** Authored date */
  authoredOn?: string;

  /** Start date */
  startDate?: string;

  /** End date */
  endDate?: string;
}

/**
 * Search/filter parameters for medication requests
 */
export interface MedicationRequestFilters {
  /** Patient ID filter */
  patientId?: string;

  /** Prescriber ID filter */
  prescriberId?: string;

  /** Status filter */
  status?: string;

  /** Medication name search */
  medicationName?: string;

  /** Date range - from */
  dateFrom?: string;

  /** Date range - to */
  dateTo?: string;

  /** Page number */
  page?: number;

  /** Results per page */
  count?: number;
}

/**
 * Route of administration options
 */
export const MEDICATION_ROUTES = [
  { value: 'oral', labelKey: 'medication.route.oral' },
  { value: 'intravenous', labelKey: 'medication.route.intravenous' },
  { value: 'intramuscular', labelKey: 'medication.route.intramuscular' },
  { value: 'subcutaneous', labelKey: 'medication.route.subcutaneous' },
  { value: 'topical', labelKey: 'medication.route.topical' },
  { value: 'inhalation', labelKey: 'medication.route.inhalation' },
  { value: 'other', labelKey: 'medication.route.other' },
] as const;

/**
 * Status options for medication requests
 */
export const MEDICATION_STATUSES = [
  { value: 'draft', labelKey: 'medication.status.draft' },
  { value: 'active', labelKey: 'medication.status.active' },
  { value: 'on-hold', labelKey: 'medication.status.onHold' },
  { value: 'cancelled', labelKey: 'medication.status.cancelled' },
  { value: 'completed', labelKey: 'medication.status.completed' },
  { value: 'stopped', labelKey: 'medication.status.stopped' },
] as const;

/**
 * Priority options
 */
export const MEDICATION_PRIORITIES = [
  { value: 'routine', labelKey: 'medication.priority.routine' },
  { value: 'urgent', labelKey: 'medication.priority.urgent' },
  { value: 'asap', labelKey: 'medication.priority.asap' },
  { value: 'stat', labelKey: 'medication.priority.stat' },
] as const;

/**
 * Common dose units
 */
export const DOSE_UNITS = [
  { value: 'mg', label: 'mg' },
  { value: 'g', label: 'g' },
  { value: 'ml', label: 'ml' },
  { value: 'mcg', label: 'mcg' },
  { value: 'IU', label: 'IU' },
  { value: 'tablet', label: 'tablet(s)' },
  { value: 'capsule', label: 'capsule(s)' },
  { value: 'drop', label: 'drop(s)' },
  { value: 'puff', label: 'puff(s)' },
] as const;
