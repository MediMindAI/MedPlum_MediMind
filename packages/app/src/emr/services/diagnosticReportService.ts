// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { MedplumClient } from '@medplum/core';
import type { DiagnosticReport, Patient, Practitioner, Reference, Resource } from '@medplum/fhirtypes';
import type {
  DiagnosticReportFormValues,
  DiagnosticReportRow,
  DiagnosticReportFilters,
} from '../types/diagnostic';

/**
 * Creates a new DiagnosticReport resource
 */
export async function createDiagnosticReport(
  medplum: MedplumClient,
  values: DiagnosticReportFormValues
): Promise<DiagnosticReport> {
  const resource: DiagnosticReport = {
    resourceType: 'DiagnosticReport',
    status: values.status,
    subject: {
      reference: `Patient/${values.patientId}`,
    },
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
            code: values.category,
            display: getCategoryDisplay(values.category),
          },
        ],
      },
    ],
    code: {
      text: values.reportName,
      coding: values.reportCode
        ? [
            {
              system: 'http://loinc.org',
              code: values.reportCode,
              display: values.reportName,
            },
          ]
        : undefined,
    },
    effectiveDateTime: values.effectiveDateTime,
    issued: values.issuedDateTime || new Date().toISOString(),
    performer: values.performerId
      ? [
          {
            reference: `Practitioner/${values.performerId}`,
          },
        ]
      : undefined,
    conclusion: values.conclusion,
    conclusionCode: values.conclusionCode
      ? [
          {
            text: values.conclusionCode,
          },
        ]
      : undefined,
    result: values.observationIds?.map((id) => ({
      reference: `Observation/${id}`,
    })),
    specimen: values.specimenIds?.map((id) => ({
      reference: `Specimen/${id}`,
    })),
  };

  return medplum.createResource(resource);
}

/**
 * Updates an existing DiagnosticReport resource
 */
export async function updateDiagnosticReport(
  medplum: MedplumClient,
  id: string,
  values: DiagnosticReportFormValues
): Promise<DiagnosticReport> {
  const existing = await medplum.readResource('DiagnosticReport', id);

  const updated: DiagnosticReport = {
    ...existing,
    status: values.status,
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
            code: values.category,
            display: getCategoryDisplay(values.category),
          },
        ],
      },
    ],
    code: {
      text: values.reportName,
      coding: values.reportCode
        ? [
            {
              system: 'http://loinc.org',
              code: values.reportCode,
              display: values.reportName,
            },
          ]
        : undefined,
    },
    effectiveDateTime: values.effectiveDateTime,
    conclusion: values.conclusion,
    conclusionCode: values.conclusionCode
      ? [
          {
            text: values.conclusionCode,
          },
        ]
      : undefined,
    result: values.observationIds?.map((id) => ({
      reference: `Observation/${id}`,
    })),
    specimen: values.specimenIds?.map((id) => ({
      reference: `Specimen/${id}`,
    })),
  };

  return medplum.updateResource(updated);
}

/**
 * Searches for diagnostic reports with filters
 */
export async function searchDiagnosticReports(
  medplum: MedplumClient,
  filters: DiagnosticReportFilters = {}
): Promise<DiagnosticReportRow[]> {
  const searchParams: Record<string, string> = {
    _count: String(filters.count || 50),
    _sort: '-issued',
    _include: 'DiagnosticReport:subject,DiagnosticReport:performer',
  };

  if (filters.patientId) {
    searchParams.subject = `Patient/${filters.patientId}`;
  }

  if (filters.performerId) {
    searchParams.performer = `Practitioner/${filters.performerId}`;
  }

  if (filters.status) {
    searchParams.status = filters.status;
  }

  if (filters.category) {
    searchParams.category = filters.category;
  }

  if (filters.dateFrom) {
    searchParams['date'] = `ge${filters.dateFrom}`;
  }

  if (filters.dateTo) {
    searchParams['date'] = `le${filters.dateTo}`;
  }

  const bundle = await medplum.search('DiagnosticReport', searchParams);

  // Extract included resources
  const patients = new Map<string, Patient>();
  const practitioners = new Map<string, Practitioner>();

  bundle.entry?.forEach((entry) => {
    const resource = entry.resource as Resource | undefined;
    if (resource?.resourceType === 'Patient' && resource.id) {
      patients.set(`Patient/${resource.id}`, resource as Patient);
    }
    if (resource?.resourceType === 'Practitioner' && resource.id) {
      practitioners.set(`Practitioner/${resource.id}`, resource as Practitioner);
    }
  });

  // Convert to row format
  const rows: DiagnosticReportRow[] = [];

  bundle.entry?.forEach((entry) => {
    const resource = entry.resource;
    if (resource?.resourceType === 'DiagnosticReport' && resource.id) {
      const patientRef = (resource.subject as Reference)?.reference;
      const patient = patientRef ? patients.get(patientRef) : undefined;
      const performerRef = (resource.performer?.[0] as Reference)?.reference;
      const performer = performerRef ? practitioners.get(performerRef) : undefined;

      rows.push({
        id: resource.id,
        patientId: patientRef?.replace('Patient/', '') || '',
        patientName: patient
          ? `${patient.name?.[0]?.given?.join(' ') || ''} ${patient.name?.[0]?.family || ''}`.trim()
          : 'Unknown',
        reportName: resource.code?.text || resource.code?.coding?.[0]?.display || 'Unknown',
        category: resource.category?.[0]?.coding?.[0]?.code || 'OTHER',
        status: resource.status || 'unknown',
        performerName: performer
          ? `${performer.name?.[0]?.given?.join(' ') || ''} ${performer.name?.[0]?.family || ''}`.trim()
          : undefined,
        effectiveDate: resource.effectiveDateTime,
        issuedDate: resource.issued,
        conclusionPreview: resource.conclusion
          ? resource.conclusion.substring(0, 100) + (resource.conclusion.length > 100 ? '...' : '')
          : undefined,
      });
    }
  });

  return rows;
}

/**
 * Gets a single diagnostic report by ID
 */
export async function getDiagnosticReport(
  medplum: MedplumClient,
  id: string
): Promise<DiagnosticReport> {
  return medplum.readResource('DiagnosticReport', id);
}

/**
 * Cancels a diagnostic report (soft delete)
 */
export async function cancelDiagnosticReport(
  medplum: MedplumClient,
  id: string
): Promise<DiagnosticReport> {
  const existing = await medplum.readResource('DiagnosticReport', id);

  const updated: DiagnosticReport = {
    ...existing,
    status: 'cancelled',
  };

  return medplum.updateResource(updated);
}

/**
 * Deletes a diagnostic report (hard delete)
 */
export async function deleteDiagnosticReport(medplum: MedplumClient, id: string): Promise<void> {
  await medplum.deleteResource('DiagnosticReport', id);
}

/**
 * Extracts form values from a DiagnosticReport resource
 */
export function extractFormValues(resource: DiagnosticReport): DiagnosticReportFormValues {
  return {
    id: resource.id,
    patientId: (resource.subject as Reference)?.reference?.replace('Patient/', '') || '',
    performerId: (resource.performer?.[0] as Reference)?.reference?.replace('Practitioner/', ''),
    category: (resource.category?.[0]?.coding?.[0]?.code as DiagnosticReportFormValues['category']) || 'OTHER',
    reportCode: resource.code?.coding?.[0]?.code,
    reportName: resource.code?.text || resource.code?.coding?.[0]?.display || '',
    status: resource.status as DiagnosticReportFormValues['status'],
    effectiveDateTime: resource.effectiveDateTime,
    issuedDateTime: resource.issued,
    conclusion: resource.conclusion,
    conclusionCode: resource.conclusionCode?.[0]?.text,
    observationIds: resource.result?.map((r) => (r as Reference).reference?.replace('Observation/', '') || ''),
    specimenIds: resource.specimen?.map((s) => (s as Reference).reference?.replace('Specimen/', '') || ''),
  };
}

/**
 * Gets display text for category code
 */
function getCategoryDisplay(category: string): string {
  const displays: Record<string, string> = {
    LAB: 'Laboratory',
    RAD: 'Radiology',
    PATH: 'Pathology',
    CARD: 'Cardiology',
    OTHER: 'Other',
  };
  return displays[category] || 'Other';
}
