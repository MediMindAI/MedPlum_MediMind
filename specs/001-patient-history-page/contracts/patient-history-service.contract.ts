/**
 * Patient History Service Contract
 *
 * Defines CRUD operations for Encounter resources (patient visits)
 * All methods use MedplumClient for FHIR R4 operations
 *
 * @packageDocumentation
 */

import type { MedplumClient } from '@medplum/core';
import type { Encounter, Patient, Bundle } from '@medplum/fhirtypes';
import type { VisitFormValues, VisitTableRow } from '../types/patient-history';

/**
 * Main service for patient history operations
 */
export interface IPatientHistoryService {
  /**
   * Fetch all patient visits with optional filters
   *
   * @param medplum - Authenticated Medplum client
   * @param params - Search parameters (insurance, dates, status, etc.)
   * @returns Bundle of Encounters with included Patient and Coverage resources
   *
   * @example
   * ```typescript
   * const bundle = await fetchPatientVisits(medplum, {
   *   insuranceCompanyId: 'Organization/628',
   *   dateFrom: '2025-01-01',
   *   dateTo: '2025-12-31'
   * });
   * ```
   */
  fetchPatientVisits(
    medplum: MedplumClient,
    params: PatientHistorySearchParams
  ): Promise<Bundle<Encounter>>;

  /**
   * Get a single visit by ID with all related resources
   *
   * @param medplum - Authenticated Medplum client
   * @param encounterId - Encounter resource ID
   * @returns Encounter with populated references (patient, coverages)
   *
   * @throws Error if encounter not found
   */
  getVisitById(
    medplum: MedplumClient,
    encounterId: string
  ): Promise<EncounterWithRelations>;

  /**
   * Create a new patient visit
   *
   * @param medplum - Authenticated Medplum client
   * @param values - Form values from visit registration
   * @returns Created Encounter resource
   *
   * @throws ValidationError if data invalid
   */
  createVisit(
    medplum: MedplumClient,
    values: VisitFormValues
  ): Promise<Encounter>;

  /**
   * Update an existing patient visit
   *
   * @param medplum - Authenticated Medplum client
   * @param encounterId - Encounter resource ID
   * @param values - Updated form values
   * @returns Updated Encounter resource
   *
   * @throws ValidationError if data invalid
   * @throws Error if encounter not found
   */
  updateVisit(
    medplum: MedplumClient,
    encounterId: string,
    values: VisitFormValues
  ): Promise<Encounter>;

  /**
   * Delete a patient visit (soft delete - sets status to entered-in-error)
   *
   * @param medplum - Authenticated Medplum client
   * @param encounterId - Encounter resource ID
   * @returns Deleted Encounter resource
   *
   * @throws PermissionError if user lacks delete permission
   * @throws Error if encounter not found
   */
  deleteVisit(
    medplum: MedplumClient,
    encounterId: string
  ): Promise<Encounter>;

  /**
   * Transform Bundle of Encounters to table rows for display
   *
   * @param bundle - FHIR Bundle from fetchPatientVisits
   * @returns Array of table row data
   */
  mapBundleToTableRows(
    bundle: Bundle<Encounter>
  ): VisitTableRow[];

  /**
   * Transform Encounter to form values for editing
   *
   * @param encounter - Encounter resource
   * @param patient - Patient resource (from _include)
   * @param coverages - Array of Coverage resources (0-3)
   * @returns Form values for VisitEditModal
   */
  mapEncounterToFormValues(
    encounter: Encounter,
    patient: Patient,
    coverages: Coverage[]
  ): VisitFormValues;
}

/**
 * Encounter with all related resources loaded
 */
export interface EncounterWithRelations {
  encounter: Encounter;
  patient: Patient;
  coverages: Coverage[];
  referrer?: Practitioner;
  senderOrganization?: Organization;
}

/**
 * Search parameters for patient history queries
 */
export interface PatientHistorySearchParams {
  insuranceCompanyId?: string;
  personalId?: string;
  firstName?: string;
  lastName?: string;
  dateFrom?: string;
  dateTo?: string;
  registrationNumber?: string;
  status?: EncounterStatus;
  visitType?: 'stationary' | 'ambulatory' | 'emergency';
  _count?: number;
  _offset?: number;
}

/**
 * Validation result with errors by field
 */
export interface ValidationResult {
  isValid: boolean;
  errors?: Record<string, string>;
}
