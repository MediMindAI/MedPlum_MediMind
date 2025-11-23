// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import * as XLSX from 'xlsx';
import type { AccountRowExtended, AuditLogEntryExtended, ExportMetadata } from '../types/account-management';

/**
 * Column headers for account data export
 */
const ACCOUNT_HEADERS = [
  'Staff ID',
  'Name',
  'Email',
  'Phone',
  'Roles',
  'Status',
  'Invitation Status',
  'Last Login',
  'Created At',
];

/**
 * Column headers for audit log export
 */
const AUDIT_LOG_HEADERS = [
  'Timestamp',
  'User',
  'Action',
  'Resource Type',
  'Entity',
  'Outcome',
  'IP Address',
];

/**
 * Format a date string for Excel display
 * @param dateString - ISO 8601 date string
 * @returns Formatted date string or empty string if invalid
 */
function formatDateForExport(dateString: string | undefined): string {
  if (!dateString) {
    return '';
  }
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return '';
  }
}

/**
 * Format invitation status for display
 * @param status - Invitation status value
 * @returns Human-readable status string
 */
function formatInvitationStatus(status: string | undefined): string {
  if (!status) {
    return '';
  }
  const statusMap: Record<string, string> = {
    pending: 'Pending',
    accepted: 'Accepted',
    expired: 'Expired',
    bounced: 'Bounced',
    cancelled: 'Cancelled',
  };
  return statusMap[status] || status;
}

/**
 * Convert account data to export-ready format
 * @param data - Array of account rows
 * @returns Array of objects ready for XLSX conversion
 */
function transformAccountData(data: AccountRowExtended[]): Record<string, string>[] {
  return data.map((account) => ({
    'Staff ID': account.staffId || '',
    Name: account.name || '',
    Email: account.email || '',
    Phone: account.phone || '',
    Roles: Array.isArray(account.roles) ? account.roles.join(', ') : '',
    Status: account.active ? 'Active' : 'Inactive',
    'Invitation Status': formatInvitationStatus(account.invitationStatus),
    'Last Login': formatDateForExport(account.lastLogin),
    'Created At': formatDateForExport(account.createdAt),
  }));
}

/**
 * Convert audit log data to export-ready format
 * @param data - Array of audit log entries
 * @returns Array of objects ready for XLSX conversion
 */
function transformAuditLogData(data: AuditLogEntryExtended[]): Record<string, string>[] {
  return data.map((log) => ({
    Timestamp: formatDateForExport(log.timestamp),
    User: log.agent || '',
    Action: log.actionDisplay || log.action || '',
    'Resource Type': log.entityType || '',
    Entity: log.entityDisplay || log.entityId || '',
    Outcome: log.outcomeDisplay || log.outcome || '',
    'IP Address': log.ipAddress || '',
  }));
}

/**
 * Create metadata rows for export header
 * @param metadata - Export metadata
 * @returns Array of metadata rows
 */
function createMetadataRows(metadata: ExportMetadata): string[][] {
  const rows: string[][] = [];

  rows.push(['Export Timestamp:', formatDateForExport(metadata.timestamp) || metadata.timestamp]);
  rows.push(['Exported By:', metadata.exportedBy]);
  rows.push(['Total Records:', String(metadata.totalRecords)]);

  if (metadata.filters) {
    const filterParts: string[] = [];
    if (metadata.filters.search) {
      filterParts.push(`Search: ${metadata.filters.search}`);
    }
    if (metadata.filters.role) {
      filterParts.push(`Role: ${metadata.filters.role}`);
    }
    if (metadata.filters.department) {
      filterParts.push(`Department: ${metadata.filters.department}`);
    }
    if (metadata.filters.active !== undefined) {
      filterParts.push(`Status: ${metadata.filters.active ? 'Active' : 'Inactive'}`);
    }
    if (metadata.filters.invitationStatus) {
      filterParts.push(`Invitation Status: ${metadata.filters.invitationStatus}`);
    }
    if (filterParts.length > 0) {
      rows.push(['Filter Criteria:', filterParts.join('; ')]);
    }
  }

  rows.push([]); // Empty row before data
  return rows;
}

/**
 * Trigger file download in the browser
 * @param blob - File data as Blob
 * @param filename - Name of the file to download
 */
function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export account data to Excel (.xlsx) format
 * @param data - Array of account rows to export
 * @param filename - Name of the output file (without extension)
 * @param metadata - Export metadata including timestamp, user, and filters
 */
export function exportToExcel(data: AccountRowExtended[], filename: string, metadata: ExportMetadata): void {
  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Create metadata rows
  const metadataRows = createMetadataRows(metadata);

  // Transform account data
  const transformedData = transformAccountData(data);

  // Create worksheet with metadata and headers
  const worksheet = XLSX.utils.aoa_to_sheet(metadataRows);

  // Append headers and data
  XLSX.utils.sheet_add_aoa(worksheet, [ACCOUNT_HEADERS], { origin: -1 });
  XLSX.utils.sheet_add_json(worksheet, transformedData, { origin: -1, skipHeader: true });

  // Set column widths for better readability
  worksheet['!cols'] = [
    { wch: 15 }, // Staff ID
    { wch: 25 }, // Name
    { wch: 30 }, // Email
    { wch: 18 }, // Phone
    { wch: 30 }, // Roles
    { wch: 12 }, // Status
    { wch: 18 }, // Invitation Status
    { wch: 22 }, // Last Login
    { wch: 22 }, // Created At
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Accounts');

  // Generate file and trigger download
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const finalFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  triggerDownload(blob, finalFilename);
}

/**
 * Export account data to CSV format
 * @param data - Array of account rows to export
 * @param filename - Name of the output file (without extension)
 * @param metadata - Export metadata including timestamp, user, and filters
 */
export function exportToCSV(data: AccountRowExtended[], filename: string, metadata: ExportMetadata): void {
  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Create metadata rows
  const metadataRows = createMetadataRows(metadata);

  // Transform account data
  const transformedData = transformAccountData(data);

  // Create worksheet with metadata and headers
  const worksheet = XLSX.utils.aoa_to_sheet(metadataRows);

  // Append headers and data
  XLSX.utils.sheet_add_aoa(worksheet, [ACCOUNT_HEADERS], { origin: -1 });
  XLSX.utils.sheet_add_json(worksheet, transformedData, { origin: -1, skipHeader: true });

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Accounts');

  // Convert to CSV
  const csvContent = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const finalFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  triggerDownload(blob, finalFilename);
}

/**
 * Export audit logs to Excel or CSV format
 * @param data - Array of audit log entries to export
 * @param format - Output format ('xlsx' or 'csv')
 * @param filename - Name of the output file (without extension)
 */
export function exportAuditLogs(
  data: AuditLogEntryExtended[],
  format: 'xlsx' | 'csv',
  filename: string
): void {
  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Create header rows with export info
  const headerRows: string[][] = [
    ['Audit Log Export'],
    ['Generated:', new Date().toISOString()],
    ['Total Records:', String(data.length)],
    [], // Empty row before data
  ];

  // Transform audit log data
  const transformedData = transformAuditLogData(data);

  // Create worksheet with headers
  const worksheet = XLSX.utils.aoa_to_sheet(headerRows);

  // Append column headers and data
  XLSX.utils.sheet_add_aoa(worksheet, [AUDIT_LOG_HEADERS], { origin: -1 });
  XLSX.utils.sheet_add_json(worksheet, transformedData, { origin: -1, skipHeader: true });

  // Set column widths for better readability
  worksheet['!cols'] = [
    { wch: 22 }, // Timestamp
    { wch: 25 }, // User
    { wch: 15 }, // Action
    { wch: 20 }, // Resource Type
    { wch: 30 }, // Entity
    { wch: 15 }, // Outcome
    { wch: 18 }, // IP Address
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Logs');

  if (format === 'xlsx') {
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const finalFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
    triggerDownload(blob, finalFilename);
  } else {
    // Generate CSV file
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const finalFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    triggerDownload(blob, finalFilename);
  }
}

// Export helper functions for testing
export const _internal = {
  formatDateForExport,
  formatInvitationStatus,
  transformAccountData,
  transformAuditLogData,
  createMetadataRows,
  triggerDownload,
  ACCOUNT_HEADERS,
  AUDIT_LOG_HEADERS,
};
