// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * Form values for creating/editing diagnostic reports
 * Maps to FHIR DiagnosticReport resource
 */
export interface DiagnosticReportFormValues {
  /** Resource ID (for editing) */
  id?: string;

  /** Patient reference (required) */
  patientId: string;

  /** Performing practitioner reference */
  performerId?: string;

  /** Report category (e.g., LAB, RAD, PATH) */
  category: 'LAB' | 'RAD' | 'PATH' | 'CARD' | 'OTHER';

  /** Report code/type */
  reportCode?: string;

  /** Report name/title */
  reportName: string;

  /** Report status */
  status: 'registered' | 'partial' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'appended' | 'cancelled' | 'entered-in-error';

  /** Effective date/time (when the study was performed) */
  effectiveDateTime?: string;

  /** Issued date/time (when the report was released) */
  issuedDateTime?: string;

  /** Conclusion/interpretation text */
  conclusion?: string;

  /** Coded conclusion */
  conclusionCode?: string;

  /** Additional notes */
  notes?: string;

  /** Linked Observation IDs */
  observationIds?: string[];

  /** Specimen IDs */
  specimenIds?: string[];
}

/**
 * Row data for diagnostic report table display
 */
export interface DiagnosticReportRow {
  /** Resource ID */
  id: string;

  /** Patient name */
  patientName: string;

  /** Patient ID */
  patientId: string;

  /** Report name */
  reportName: string;

  /** Report category */
  category: string;

  /** Status */
  status: string;

  /** Performer name */
  performerName?: string;

  /** Effective date */
  effectiveDate?: string;

  /** Issued date */
  issuedDate?: string;

  /** Conclusion preview */
  conclusionPreview?: string;
}

/**
 * Search/filter parameters for diagnostic reports
 */
export interface DiagnosticReportFilters {
  /** Patient ID filter */
  patientId?: string;

  /** Performer ID filter */
  performerId?: string;

  /** Category filter */
  category?: string;

  /** Status filter */
  status?: string;

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
 * Report category options
 */
export const REPORT_CATEGORIES = [
  { value: 'LAB', labelKey: 'diagnostic.category.lab' },
  { value: 'RAD', labelKey: 'diagnostic.category.radiology' },
  { value: 'PATH', labelKey: 'diagnostic.category.pathology' },
  { value: 'CARD', labelKey: 'diagnostic.category.cardiology' },
  { value: 'OTHER', labelKey: 'diagnostic.category.other' },
] as const;

/**
 * Report status options
 */
export const REPORT_STATUSES = [
  { value: 'registered', labelKey: 'diagnostic.status.registered' },
  { value: 'partial', labelKey: 'diagnostic.status.partial' },
  { value: 'preliminary', labelKey: 'diagnostic.status.preliminary' },
  { value: 'final', labelKey: 'diagnostic.status.final' },
  { value: 'amended', labelKey: 'diagnostic.status.amended' },
  { value: 'corrected', labelKey: 'diagnostic.status.corrected' },
  { value: 'cancelled', labelKey: 'diagnostic.status.cancelled' },
] as const;
