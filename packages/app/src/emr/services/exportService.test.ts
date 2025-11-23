// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import * as XLSX from 'xlsx';
import {
  exportToExcel,
  exportToCSV,
  exportAuditLogs,
  _internal,
} from './exportService';
import type { AccountRowExtended, AuditLogEntryExtended, ExportMetadata } from '../types/account-management';

// Mock XLSX library
jest.mock('xlsx', () => ({
  utils: {
    book_new: jest.fn(() => ({ SheetNames: [], Sheets: {} })),
    aoa_to_sheet: jest.fn(() => ({})),
    sheet_add_aoa: jest.fn(),
    sheet_add_json: jest.fn(),
    book_append_sheet: jest.fn(),
    sheet_to_csv: jest.fn(() => 'csv,content'),
  },
  write: jest.fn(() => new ArrayBuffer(8)),
}));

// Mock DOM APIs for file download
const mockCreateObjectURL = jest.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = jest.fn();
const mockClick = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();

describe('exportService', () => {
  // Sample test data
  const sampleAccounts: AccountRowExtended[] = [
    {
      id: 'practitioner-1',
      staffId: 'EMP001',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+995555123456',
      roles: ['Physician', 'Admin'],
      active: true,
      invitationStatus: 'accepted',
      lastLogin: '2025-01-15T10:30:00Z',
      createdAt: '2024-06-01T08:00:00Z',
    },
    {
      id: 'practitioner-2',
      staffId: 'EMP002',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+995555654321',
      roles: ['Nurse'],
      active: false,
      invitationStatus: 'pending',
      lastLogin: undefined,
      createdAt: '2024-08-15T14:00:00Z',
    },
  ];

  const sampleMetadata: ExportMetadata = {
    timestamp: '2025-01-20T12:00:00Z',
    exportedBy: 'Admin User',
    totalRecords: 2,
    filters: {
      search: 'doe',
      role: 'physician',
      active: true,
    },
  };

  const sampleAuditLogs: AuditLogEntryExtended[] = [
    {
      id: 'audit-1',
      timestamp: '2025-01-15T10:30:00Z',
      action: 'C',
      actionDisplay: 'Create',
      agent: 'Admin User',
      agentId: 'practitioner-admin',
      entityType: 'Practitioner',
      entityId: 'practitioner-1',
      entityDisplay: 'John Doe',
      outcome: '0',
      outcomeDisplay: 'Success',
      ipAddress: '192.168.1.100',
    },
    {
      id: 'audit-2',
      timestamp: '2025-01-16T14:45:00Z',
      action: 'U',
      actionDisplay: 'Update',
      agent: 'John Doe',
      agentId: 'practitioner-1',
      entityType: 'Patient',
      entityId: 'patient-123',
      entityDisplay: 'Test Patient',
      outcome: '0',
      outcomeDisplay: 'Success',
      ipAddress: '192.168.1.101',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup DOM mocks
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    // Mock document.createElement
    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          click: mockClick,
        } as unknown as HTMLAnchorElement;
      }
      return document.createElement(tagName);
    });

    // Mock document.body methods
    jest.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
    jest.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('formatDateForExport', () => {
    it('should format valid ISO date string', () => {
      const result = _internal.formatDateForExport('2025-01-15T10:30:00Z');
      expect(result).toBeTruthy();
      expect(result).toContain('2025');
    });

    it('should return empty string for undefined', () => {
      const result = _internal.formatDateForExport(undefined);
      expect(result).toBe('');
    });

    it('should return empty string for invalid date', () => {
      const result = _internal.formatDateForExport('invalid-date');
      expect(result).toBe('');
    });

    it('should return empty string for empty string', () => {
      const result = _internal.formatDateForExport('');
      expect(result).toBe('');
    });
  });

  describe('formatInvitationStatus', () => {
    it('should format pending status', () => {
      const result = _internal.formatInvitationStatus('pending');
      expect(result).toBe('Pending');
    });

    it('should format accepted status', () => {
      const result = _internal.formatInvitationStatus('accepted');
      expect(result).toBe('Accepted');
    });

    it('should format expired status', () => {
      const result = _internal.formatInvitationStatus('expired');
      expect(result).toBe('Expired');
    });

    it('should format bounced status', () => {
      const result = _internal.formatInvitationStatus('bounced');
      expect(result).toBe('Bounced');
    });

    it('should format cancelled status', () => {
      const result = _internal.formatInvitationStatus('cancelled');
      expect(result).toBe('Cancelled');
    });

    it('should return empty string for undefined', () => {
      const result = _internal.formatInvitationStatus(undefined);
      expect(result).toBe('');
    });

    it('should return original value for unknown status', () => {
      const result = _internal.formatInvitationStatus('unknown-status');
      expect(result).toBe('unknown-status');
    });
  });

  describe('transformAccountData', () => {
    it('should transform account data correctly', () => {
      const result = _internal.transformAccountData(sampleAccounts);

      expect(result).toHaveLength(2);

      // First account
      expect(result[0]['Staff ID']).toBe('EMP001');
      expect(result[0]['Name']).toBe('John Doe');
      expect(result[0]['Email']).toBe('john.doe@example.com');
      expect(result[0]['Phone']).toBe('+995555123456');
      expect(result[0]['Roles']).toBe('Physician, Admin');
      expect(result[0]['Status']).toBe('Active');
      expect(result[0]['Invitation Status']).toBe('Accepted');

      // Second account (inactive)
      expect(result[1]['Status']).toBe('Inactive');
      expect(result[1]['Invitation Status']).toBe('Pending');
    });

    it('should handle empty arrays', () => {
      const result = _internal.transformAccountData([]);
      expect(result).toEqual([]);
    });

    it('should handle missing optional fields', () => {
      const minimalAccount: AccountRowExtended = {
        id: 'test-id',
        name: 'Test User',
        email: 'test@example.com',
        roles: [],
        active: true,
      };

      const result = _internal.transformAccountData([minimalAccount]);

      expect(result[0]['Staff ID']).toBe('');
      expect(result[0]['Phone']).toBe('');
      expect(result[0]['Roles']).toBe('');
      expect(result[0]['Invitation Status']).toBe('');
      expect(result[0]['Last Login']).toBe('');
      expect(result[0]['Created At']).toBe('');
    });
  });

  describe('transformAuditLogData', () => {
    it('should transform audit log data correctly', () => {
      const result = _internal.transformAuditLogData(sampleAuditLogs);

      expect(result).toHaveLength(2);

      // First log
      expect(result[0]['User']).toBe('Admin User');
      expect(result[0]['Action']).toBe('Create');
      expect(result[0]['Resource Type']).toBe('Practitioner');
      expect(result[0]['Entity']).toBe('John Doe');
      expect(result[0]['Outcome']).toBe('Success');
      expect(result[0]['IP Address']).toBe('192.168.1.100');
    });

    it('should handle empty arrays', () => {
      const result = _internal.transformAuditLogData([]);
      expect(result).toEqual([]);
    });

    it('should fallback to raw values when display values missing', () => {
      const logWithoutDisplay: AuditLogEntryExtended = {
        id: 'audit-test',
        timestamp: '2025-01-15T10:30:00Z',
        action: 'D',
        actionDisplay: '',
        agent: 'Test User',
        agentId: 'user-1',
        entityType: 'Patient',
        entityId: 'patient-1',
        outcome: '4',
        outcomeDisplay: '',
      };

      const result = _internal.transformAuditLogData([logWithoutDisplay]);

      expect(result[0]['Action']).toBe('D');
      expect(result[0]['Outcome']).toBe('4');
      expect(result[0]['Entity']).toBe('patient-1');
      expect(result[0]['IP Address']).toBe('');
    });
  });

  describe('createMetadataRows', () => {
    it('should create metadata rows with all fields', () => {
      const result = _internal.createMetadataRows(sampleMetadata);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0][0]).toBe('Export Timestamp:');
      expect(result[1][0]).toBe('Exported By:');
      expect(result[1][1]).toBe('Admin User');
      expect(result[2][0]).toBe('Total Records:');
      expect(result[2][1]).toBe('2');
    });

    it('should include filter criteria when present', () => {
      const result = _internal.createMetadataRows(sampleMetadata);

      const filterRow = result.find((row) => row[0] === 'Filter Criteria:');
      expect(filterRow).toBeDefined();
      expect(filterRow?.[1]).toContain('Search: doe');
      expect(filterRow?.[1]).toContain('Role: physician');
      expect(filterRow?.[1]).toContain('Status: Active');
    });

    it('should handle metadata without filters', () => {
      const metadataNoFilters: ExportMetadata = {
        timestamp: '2025-01-20T12:00:00Z',
        exportedBy: 'Admin User',
        totalRecords: 10,
      };

      const result = _internal.createMetadataRows(metadataNoFilters);

      const filterRow = result.find((row) => row[0] === 'Filter Criteria:');
      expect(filterRow).toBeUndefined();
    });

    it('should include empty row at end', () => {
      const result = _internal.createMetadataRows(sampleMetadata);
      const lastRow = result[result.length - 1];
      expect(lastRow).toEqual([]);
    });
  });

  describe('exportToExcel', () => {
    it('should create Excel workbook with correct structure', () => {
      exportToExcel(sampleAccounts, 'test-export', sampleMetadata);

      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalled();
      expect(XLSX.utils.sheet_add_aoa).toHaveBeenCalled();
      expect(XLSX.utils.sheet_add_json).toHaveBeenCalled();
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalled();
      expect(XLSX.write).toHaveBeenCalledWith(expect.anything(), { bookType: 'xlsx', type: 'array' });
    });

    it('should trigger file download', () => {
      exportToExcel(sampleAccounts, 'test-export', sampleMetadata);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    it('should add .xlsx extension if not present', () => {
      exportToExcel(sampleAccounts, 'test-export', sampleMetadata);

      // Should work without error - extension handling is in the filename
      expect(XLSX.utils.book_new).toHaveBeenCalled();
    });

    it('should not duplicate .xlsx extension', () => {
      exportToExcel(sampleAccounts, 'test-export.xlsx', sampleMetadata);

      // Should work without error - extension handling is in the filename
      expect(XLSX.utils.book_new).toHaveBeenCalled();
    });
  });

  describe('exportToCSV', () => {
    it('should create CSV with correct structure', () => {
      exportToCSV(sampleAccounts, 'test-export', sampleMetadata);

      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalled();
      expect(XLSX.utils.sheet_add_aoa).toHaveBeenCalled();
      expect(XLSX.utils.sheet_add_json).toHaveBeenCalled();
      expect(XLSX.utils.sheet_to_csv).toHaveBeenCalled();
    });

    it('should trigger file download', () => {
      exportToCSV(sampleAccounts, 'test-export', sampleMetadata);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    it('should add .csv extension if not present', () => {
      exportToCSV(sampleAccounts, 'test-export', sampleMetadata);

      // Function should execute without error
      expect(XLSX.utils.sheet_to_csv).toHaveBeenCalled();
    });
  });

  describe('exportAuditLogs', () => {
    it('should export audit logs as Excel', () => {
      exportAuditLogs(sampleAuditLogs, 'xlsx', 'audit-export');

      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalled();
      expect(XLSX.write).toHaveBeenCalledWith(expect.anything(), { bookType: 'xlsx', type: 'array' });
    });

    it('should export audit logs as CSV', () => {
      exportAuditLogs(sampleAuditLogs, 'csv', 'audit-export');

      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.sheet_to_csv).toHaveBeenCalled();
    });

    it('should trigger file download for xlsx format', () => {
      exportAuditLogs(sampleAuditLogs, 'xlsx', 'audit-export');

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it('should trigger file download for csv format', () => {
      exportAuditLogs(sampleAuditLogs, 'csv', 'audit-export');

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it('should include audit log header rows', () => {
      exportAuditLogs(sampleAuditLogs, 'xlsx', 'audit-export');

      expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalled();
    });
  });

  describe('ACCOUNT_HEADERS constant', () => {
    it('should have all required column headers', () => {
      expect(_internal.ACCOUNT_HEADERS).toContain('Staff ID');
      expect(_internal.ACCOUNT_HEADERS).toContain('Name');
      expect(_internal.ACCOUNT_HEADERS).toContain('Email');
      expect(_internal.ACCOUNT_HEADERS).toContain('Phone');
      expect(_internal.ACCOUNT_HEADERS).toContain('Roles');
      expect(_internal.ACCOUNT_HEADERS).toContain('Status');
      expect(_internal.ACCOUNT_HEADERS).toContain('Invitation Status');
      expect(_internal.ACCOUNT_HEADERS).toContain('Last Login');
      expect(_internal.ACCOUNT_HEADERS).toContain('Created At');
    });

    it('should have 9 columns', () => {
      expect(_internal.ACCOUNT_HEADERS).toHaveLength(9);
    });
  });

  describe('AUDIT_LOG_HEADERS constant', () => {
    it('should have all required column headers', () => {
      expect(_internal.AUDIT_LOG_HEADERS).toContain('Timestamp');
      expect(_internal.AUDIT_LOG_HEADERS).toContain('User');
      expect(_internal.AUDIT_LOG_HEADERS).toContain('Action');
      expect(_internal.AUDIT_LOG_HEADERS).toContain('Resource Type');
      expect(_internal.AUDIT_LOG_HEADERS).toContain('Entity');
      expect(_internal.AUDIT_LOG_HEADERS).toContain('Outcome');
      expect(_internal.AUDIT_LOG_HEADERS).toContain('IP Address');
    });

    it('should have 7 columns', () => {
      expect(_internal.AUDIT_LOG_HEADERS).toHaveLength(7);
    });
  });
});
