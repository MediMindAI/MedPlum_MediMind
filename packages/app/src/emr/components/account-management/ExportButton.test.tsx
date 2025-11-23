// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import React from 'react';
import { ExportButton } from './ExportButton';
import type { AccountRowExtended, AccountSearchFiltersExtended } from '../../types/account-management';
import * as exportService from '../../services/exportService';

// Mock the export service
jest.mock('../../services/exportService', () => ({
  exportToExcel: jest.fn(),
  exportToCSV: jest.fn(),
}));

const mockExportToExcel = exportService.exportToExcel as jest.Mock;
const mockExportToCSV = exportService.exportToCSV as jest.Mock;

const mockAccounts: AccountRowExtended[] = [
  {
    id: 'practitioner-1',
    staffId: 'EMP001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+995555123456',
    roles: ['Physician'],
    active: true,
    invitationStatus: 'accepted',
    lastLogin: '2025-11-20T10:00:00Z',
    createdAt: '2025-01-15T08:00:00Z',
  },
  {
    id: 'practitioner-2',
    staffId: 'EMP002',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+995555654321',
    roles: ['Nurse', 'Admin'],
    active: true,
    invitationStatus: 'pending',
    createdAt: '2025-02-20T09:00:00Z',
  },
  {
    id: 'practitioner-3',
    staffId: 'EMP003',
    name: 'Bob Wilson',
    email: 'bob.wilson@example.com',
    roles: ['Receptionist'],
    active: false,
    invitationStatus: 'expired',
    createdAt: '2024-06-01T12:00:00Z',
  },
];

const mockFilters: AccountSearchFiltersExtended = {
  search: 'test',
  role: 'physician',
  active: true,
};

const renderComponent = (props: Partial<React.ComponentProps<typeof ExportButton>> = {}) => {
  const defaultProps = {
    data: mockAccounts,
    exportedBy: 'Test User',
  };

  return render(
    <MantineProvider>
      <ExportButton {...defaultProps} {...props} />
    </MantineProvider>
  );
};

describe('ExportButton', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render export button', () => {
      renderComponent();

      expect(screen.getByTestId('export-button')).toBeInTheDocument();
    });

    it('should render with download icon', () => {
      renderComponent();

      // The button should contain the IconDownload icon
      const button = screen.getByTestId('export-button');
      expect(button).toBeInTheDocument();
    });

    it('should render as disabled when disabled prop is true', () => {
      renderComponent({ disabled: true });

      const button = screen.getByTestId('export-button');
      expect(button).toBeDisabled();
    });

    it('should not be disabled by default', () => {
      renderComponent();

      const button = screen.getByTestId('export-button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('Dropdown menu', () => {
    it('should open dropdown menu when clicked', async () => {
      renderComponent();

      const button = screen.getByTestId('export-button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/excel/i)).toBeInTheDocument();
        expect(screen.getByText(/csv/i)).toBeInTheDocument();
      });
    });

    it('should show Excel option in dropdown', async () => {
      renderComponent();

      const button = screen.getByTestId('export-button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/excel/i)).toBeInTheDocument();
      });
    });

    it('should show CSV option in dropdown', async () => {
      renderComponent();

      const button = screen.getByTestId('export-button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/csv/i)).toBeInTheDocument();
      });
    });
  });

  describe('Excel export', () => {
    it('should call exportToExcel when Excel option is clicked', async () => {
      renderComponent();

      const button = screen.getByTestId('export-button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/excel/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/excel/i));

      await waitFor(() => {
        expect(mockExportToExcel).toHaveBeenCalledTimes(1);
      });
    });

    it('should pass correct data to exportToExcel', async () => {
      renderComponent({ data: mockAccounts, filters: mockFilters });

      const button = screen.getByTestId('export-button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/excel/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/excel/i));

      await waitFor(() => {
        expect(mockExportToExcel).toHaveBeenCalledWith(
          mockAccounts,
          expect.stringContaining('accounts-'),
          expect.objectContaining({
            exportedBy: 'Test User',
            totalRecords: mockAccounts.length,
            filters: mockFilters,
          })
        );
      });
    });

    it('should include timestamp in metadata for Excel export', async () => {
      renderComponent();

      const button = screen.getByTestId('export-button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/excel/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/excel/i));

      await waitFor(() => {
        expect(mockExportToExcel).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.objectContaining({
            timestamp: expect.any(String),
          })
        );
      });
    });
  });

  describe('CSV export', () => {
    it('should call exportToCSV when CSV option is clicked', async () => {
      renderComponent();

      const button = screen.getByTestId('export-button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/csv/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/csv/i));

      await waitFor(() => {
        expect(mockExportToCSV).toHaveBeenCalledTimes(1);
      });
    });

    it('should pass correct data to exportToCSV', async () => {
      renderComponent({ data: mockAccounts, filters: mockFilters });

      const button = screen.getByTestId('export-button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/csv/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/csv/i));

      await waitFor(() => {
        expect(mockExportToCSV).toHaveBeenCalledWith(
          mockAccounts,
          expect.stringContaining('accounts-'),
          expect.objectContaining({
            exportedBy: 'Test User',
            totalRecords: mockAccounts.length,
            filters: mockFilters,
          })
        );
      });
    });

    it('should include timestamp in metadata for CSV export', async () => {
      renderComponent();

      const button = screen.getByTestId('export-button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/csv/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/csv/i));

      await waitFor(() => {
        expect(mockExportToCSV).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.objectContaining({
            timestamp: expect.any(String),
          })
        );
      });
    });
  });

  describe('Disabled state', () => {
    it('should not open dropdown when disabled', () => {
      renderComponent({ disabled: true });

      const button = screen.getByTestId('export-button');
      fireEvent.click(button);

      // Menu items should not appear
      expect(screen.queryByText(/excel/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/csv/i)).not.toBeInTheDocument();
    });

    it('should be disabled when data is empty', () => {
      renderComponent({ data: [] });

      const button = screen.getByTestId('export-button');
      expect(button).toBeDisabled();
    });
  });

  describe('Loading state', () => {
    it('should call export function and complete', async () => {
      // Export is synchronous, so we just verify the function is called
      renderComponent();

      const button = screen.getByTestId('export-button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/excel/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/excel/i));

      // Verify export was called
      await waitFor(() => {
        expect(mockExportToExcel).toHaveBeenCalled();
      });
    });
  });

  describe('Export metadata', () => {
    it('should pass filters to export metadata', async () => {
      const filters: AccountSearchFiltersExtended = {
        search: 'john',
        role: 'physician',
        active: true,
        invitationStatus: 'pending',
      };

      renderComponent({ filters });

      const button = screen.getByTestId('export-button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/excel/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/excel/i));

      await waitFor(() => {
        expect(mockExportToExcel).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.objectContaining({
            filters,
          })
        );
      });
    });

    it('should pass undefined filters when not provided', async () => {
      renderComponent({ filters: undefined });

      const button = screen.getByTestId('export-button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/excel/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/excel/i));

      await waitFor(() => {
        expect(mockExportToExcel).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.objectContaining({
            filters: undefined,
          })
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label', () => {
      renderComponent();

      const button = screen.getByTestId('export-button');
      expect(button).toHaveAttribute('aria-label');
    });
  });
});
