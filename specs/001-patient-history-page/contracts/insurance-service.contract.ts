/**
 * Insurance Service Contract
 *
 * Defines operations for Coverage resources (insurance policies)
 * Supports up to 3 insurance policies per visit
 *
 * @packageDocumentation
 */

import type { MedplumClient } from '@medplum/core';
import type { Coverage, Organization } from '@medplum/fhirtypes';
import type { InsuranceOption } from '../types/patient-history';

/**
 * Service for managing insurance coverage data
 */
export interface IInsuranceService {
  /**
   * Fetch all insurance company options (58 organizations)
   *
   * @param medplum - Authenticated Medplum client
   * @param language - Language code (ka, en, ru)
   * @returns Array of insurance company options with multilingual labels
   *
   * @example
   * ```typescript
   * const options = await fetchInsuranceCompanyOptions(medplum, 'ka');
   * // Returns: [{ id: '628', value: 'org-insurance-628', label: { ka: 'სსიპ ჯანმრთელობის ეროვნული სააგენტო', ... } }, ...]
   * ```
   */
  fetchInsuranceCompanyOptions(
    medplum: MedplumClient,
    language: 'ka' | 'en' | 'ru'
  ): Promise<InsuranceOption[]>;

  /**
   * Fetch Coverage resources for a specific Encounter
   *
   * @param medplum - Authenticated Medplum client
   * @param encounterId - Encounter resource ID
   * @returns Array of 0-3 Coverage resources ordered by priority
   */
  fetchCoveragesForEncounter(
    medplum: MedplumClient,
    encounterId: string
  ): Promise<Coverage[]>;

  /**
   * Create or update a Coverage resource
   *
   * @param medplum - Authenticated Medplum client
   * @param encounter - Encounter resource
   * @param values - Form values containing insurance data
   * @param order - Insurance priority (1=primary, 2=secondary, 3=tertiary)
   * @returns Created or updated Coverage resource
   */
  upsertCoverage(
    medplum: MedplumClient,
    encounter: Encounter,
    values: VisitFormValues,
    order: 1 | 2 | 3
  ): Promise<Coverage>;

  /**
   * Delete a Coverage resource
   *
   * @param medplum - Authenticated Medplum client
   * @param coverageId - Coverage resource ID
   */
  deleteCoverage(
    medplum: MedplumClient,
    coverageId: string
  ): Promise<void>;
}

/**
 * FHIR search parameters for insurance queries
 */
export interface InsuranceSearchParams {
  payorId?: string;              // Organization ID
  beneficiaryId?: string;        // Patient ID
  status?: 'active' | 'cancelled' | 'draft' | 'entered-in-error';
  type?: string;                 // Insurance type code
}
