// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { Encounter } from '@medplum/fhirtypes';

// Table row data structure (10 columns)
export interface VisitTableRow {
  id: string;                     // Encounter ID
  encounterId: string;
  patientId: string;
  personalId: string;             // 11-digit Georgian ID
  firstName: string;
  lastName: string;
  date: string;                   // ISO 8601 admission date
  endDate?: string;               // ISO 8601 discharge date (optional)
  registrationNumber: string;     // "10357-2025" or "a-6871-2025"
  total: number;                  // Total amount (GEL)
  discountPercent: number;        // Discount percentage (0-100)
  debt: number;                   // Outstanding debt (GEL)
  payment: number;                // Amount paid (GEL)
  status: Encounter['status'];    // FHIR Encounter status
  visitType: 'stationary' | 'ambulatory' | 'emergency';
  insuranceCompanyId?: string;
  insuranceCompanyName?: string;
}

// Search/filter parameters
export interface PatientHistorySearchParams {
  insuranceCompanyId?: string;    // Filter by insurance company
  personalId?: string;            // 11-digit search
  firstName?: string;
  lastName?: string;
  dateFrom?: string;              // ISO 8601
  dateTo?: string;                // ISO 8601
  registrationNumber?: string;    // Stationary or ambulatory
  _sort?: string;                 // FHIR sort parameter (-date for descending)
  _count?: string;                // Results per page
}

// Edit modal form values (134 fields total)
export interface VisitFormValues {
  // Registration section (14 fields)
  visitDate: string;
  registrationType: string;
  stationaryNumber?: string;
  ambulatoryNumber?: string;
  statusType: string;
  referrer?: string;
  visitPurpose?: string;
  admissionType?: string;
  dischargeType?: string;
  dischargeDate?: string;
  attendingDoctor?: string;
  department?: string;
  room?: string;
  bed?: string;

  // Demographics section (8 READ-ONLY fields)
  region?: string;
  district?: string;
  city?: string;
  address?: string;
  education?: string;
  familyStatus?: string;
  employment?: string;
  workplace?: string;

  // Insurance I (primary - 7 fields)
  insuranceCompany?: string;
  insuranceType?: string;
  policyNumber?: string;
  referralNumber?: string;
  issueDate?: string;
  expirationDate?: string;
  copayPercent?: number;

  // Insurance II (secondary - 7 fields)
  insuranceCompany2?: string;
  insuranceType2?: string;
  policyNumber2?: string;
  referralNumber2?: string;
  issueDate2?: string;
  expirationDate2?: string;
  copayPercent2?: number;

  // Insurance III (tertiary - 7 fields)
  insuranceCompany3?: string;
  insuranceType3?: string;
  policyNumber3?: string;
  referralNumber3?: string;
  issueDate3?: string;
  expirationDate3?: string;
  copayPercent3?: number;
}

// Insurance company option
export interface InsuranceOption {
  value: string;                  // ID
  label: string;                  // Translated name
  group?: string;                 // Government/Private/Hospital
}

// Insurance coverage values (for upsert)
export interface InsuranceCoverageValues {
  insuranceCompany?: string;
  insuranceType?: string;
  policyNumber?: string;
  referralNumber?: string;
  issueDate?: string;
  expirationDate?: string;
  copayPercent?: number;
}

// Financial summary
export interface FinancialSummary {
  total: number;
  discountPercent: number;
  discountAmount: number;
  subtotal: number;
  payment: number;
  debt: number;
  currency: 'GEL';
}
