// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { PatientHistoryTable } from './PatientHistoryTable';
import type { VisitTableRow } from '../../types/patient-history';

// Mock navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('PatientHistoryTable', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnSort = jest.fn();

  const mockVisits: VisitTableRow[] = [
    {
      id: 'visit-1',
      encounterId: 'enc-1',
      patientId: 'pat-1',
      personalId: '26001014632',
      firstName: 'თენგიზი',
      lastName: 'ხოზვრია',
      date: '2025-11-14T10:00:00Z',
      endDate: '2025-11-14T14:00:00Z',
      registrationNumber: '10357-2025',
      total: 500,
      discountPercent: 10,
      debt: 50, // Has debt - should highlight
      payment: 450,
      status: 'finished',
      visitType: 'stationary',
    },
    {
      id: 'visit-2',
      encounterId: 'enc-2',
      patientId: 'pat-2',
      personalId: '01001011116',
      firstName: 'ანა',
      lastName: 'გელაშვილი',
      date: '2025-11-13T09:00:00Z',
      endDate: undefined,
      registrationNumber: 'a-6871-2025',
      total: 300,
      discountPercent: 0,
      debt: 0, // No debt - no highlight
      payment: 300,
      status: 'in-progress',
      visitType: 'ambulatory',
    },
  ];

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'ka');
    jest.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <MantineProvider>
        <MemoryRouter>{component}</MemoryRouter>
      </MantineProvider>
    );
  };

  describe('Table Rendering', () => {
    it('renders 10 column headers correctly', () => {
      renderWithProviders(
        <PatientHistoryTable
          visits={mockVisits}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onSort={mockOnSort}
          sortField={null}
          sortDirection="asc"
        />
      );

      // Check for all 10 column headers
      expect(screen.getByText('პ/ნ')).toBeInTheDocument(); // Personal ID
      expect(screen.getByText('სახელი')).toBeInTheDocument(); // First Name
      expect(screen.getByText('გვარი')).toBeInTheDocument(); // Last Name
      expect(screen.getByText('თარიღი')).toBeInTheDocument(); // Date
      expect(screen.getByText('#')).toBeInTheDocument(); // Registration Number
      expect(screen.getByText('ჯამი')).toBeInTheDocument(); // Total
      expect(screen.getByText('%')).toBeInTheDocument(); // Discount
      expect(screen.getByText('ვალი')).toBeInTheDocument(); // Debt
      expect(screen.getByText('გადახდ.')).toBeInTheDocument(); // Payment
      // Actions column doesn't have a header label
    });

    it('displays patient data in correct columns', () => {
      renderWithProviders(
        <PatientHistoryTable
          visits={mockVisits}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onSort={mockOnSort}
          sortField={null}
          sortDirection="asc"
        />
      );

      // Check first visit data
      expect(screen.getByText('26001014632')).toBeInTheDocument(); // Personal ID
      expect(screen.getByText('თენგიზი')).toBeInTheDocument(); // First Name
      expect(screen.getByText('ხოზვრია')).toBeInTheDocument(); // Last Name
      expect(screen.getByText('10357-2025')).toBeInTheDocument(); // Registration Number
      expect(screen.getByText('500')).toBeInTheDocument(); // Total
      expect(screen.getByText('10')).toBeInTheDocument(); // Discount percent
      expect(screen.getByText('50')).toBeInTheDocument(); // Debt
      expect(screen.getByText('450')).toBeInTheDocument(); // Payment

      // Check second visit data
      expect(screen.getByText('01001011116')).toBeInTheDocument(); // Personal ID
      expect(screen.getByText('ანა')).toBeInTheDocument(); // First Name
      expect(screen.getByText('გელაშვილი')).toBeInTheDocument(); // Last Name
      expect(screen.getByText('a-6871-2025')).toBeInTheDocument(); // Ambulatory Registration Number
      expect(screen.getByText('300')).toBeInTheDocument(); // Total
      expect(screen.getByText('0')).toBeInTheDocument(); // Discount percent (0)
    });
  });

  describe('Financial Highlighting (US7)', () => {
    it('highlights debt cells with green background when debt > 0', () => {
      const { container } = renderWithProviders(
        <PatientHistoryTable
          visits={mockVisits}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onSort={mockOnSort}
          sortField={null}
          sortDirection="asc"
        />
      );

      // Find the debt cell for visit-1 (debt = 50)
      const debtCells = container.querySelectorAll('td');
      const debtCell = Array.from(debtCells).find((cell) => cell.textContent === '50');

      expect(debtCell).toHaveStyle({ backgroundColor: 'rgba(0, 255, 0, 0.2)' });
    });

    it('shows no background on debt cells when debt = 0', () => {
      const { container } = renderWithProviders(
        <PatientHistoryTable
          visits={mockVisits}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onSort={mockOnSort}
          sortField={null}
          sortDirection="asc"
        />
      );

      // Find the debt cell for visit-2 (debt = 0)
      // Since there are multiple "0" values (discount and debt), we need a better selector
      const rows = container.querySelectorAll('tbody tr');
      const secondRow = rows[1];
      const debtCellInSecondRow = secondRow?.querySelectorAll('td')[7]; // 8th column (0-indexed)

      expect(debtCellInSecondRow).not.toHaveStyle({ backgroundColor: 'rgba(0, 255, 0, 0.2)' });
    });

    it('displays discount percentage correctly in % column', () => {
      renderWithProviders(
        <PatientHistoryTable
          visits={mockVisits}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onSort={mockOnSort}
          sortField={null}
          sortDirection="asc"
        />
      );

      // First visit has 10% discount
      expect(screen.getByText('10')).toBeInTheDocument();

      // Second visit has 0% discount
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Action Icons', () => {
    it('displays clickable edit and delete icons', () => {
      renderWithProviders(
        <PatientHistoryTable
          visits={mockVisits}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onSort={mockOnSort}
          sortField={null}
          sortDirection="asc"
        />
      );

      // IconEdit and IconTrash should be rendered (2 per row, 2 rows = 4 total)
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });

      expect(editButtons).toHaveLength(2);
      expect(deleteButtons).toHaveLength(2);
    });

    it('calls onEdit when edit icon clicked', () => {
      renderWithProviders(
        <PatientHistoryTable
          visits={mockVisits}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onSort={mockOnSort}
          sortField={null}
          sortDirection="asc"
        />
      );

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      fireEvent.click(editButtons[0]);

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
      expect(mockOnEdit).toHaveBeenCalledWith('visit-1');
    });

    it('calls onDelete when delete icon clicked', () => {
      renderWithProviders(
        <PatientHistoryTable
          visits={mockVisits}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onSort={mockOnSort}
          sortField={null}
          sortDirection="asc"
        />
      );

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[1]);

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
      expect(mockOnDelete).toHaveBeenCalledWith('visit-2');
    });
  });

  describe('Loading and Empty States', () => {
    it('shows loading skeleton while loading', () => {
      renderWithProviders(
        <PatientHistoryTable
          visits={[]}
          loading={true}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onSort={mockOnSort}
          sortField={null}
          sortDirection="asc"
        />
      );

      // Mantine Skeleton components should be rendered
      expect(screen.getByTestId('table-loading-skeleton')).toBeInTheDocument();
    });

    it('displays empty state when no visits', () => {
      renderWithProviders(
        <PatientHistoryTable
          visits={[]}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onSort={mockOnSort}
          sortField={null}
          sortDirection="asc"
        />
      );

      expect(screen.getByText(/no visits found/i)).toBeInTheDocument();
    });
  });

  describe('Row Navigation (US1)', () => {
    it('makes rows clickable and calls navigation on row click', () => {
      renderWithProviders(
        <PatientHistoryTable
          visits={mockVisits}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onSort={mockOnSort}
          sortField={null}
          sortDirection="asc"
        />
      );

      const rows = screen.getAllByRole('row');
      // First row is header, second row is first data row
      const firstDataRow = rows[1];

      fireEvent.click(firstDataRow);

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/emr/patient-history/visit-1');
    });
  });

  describe('Sorting (US4)', () => {
    it('displays date column header as sortable (cursor pointer)', () => {
      renderWithProviders(
        <PatientHistoryTable
          visits={mockVisits}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onSort={mockOnSort}
          sortField={null}
          sortDirection="asc"
        />
      );

      const dateHeader = screen.getByText('თარიღი');
      expect(dateHeader).toHaveStyle({ cursor: 'pointer' });
    });

    it('calls onSort when date header clicked', () => {
      renderWithProviders(
        <PatientHistoryTable
          visits={mockVisits}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onSort={mockOnSort}
          sortField={null}
          sortDirection="asc"
        />
      );

      const dateHeader = screen.getByText('თარიღი');
      fireEvent.click(dateHeader);

      expect(mockOnSort).toHaveBeenCalledTimes(1);
      expect(mockOnSort).toHaveBeenCalledWith('date');
    });

    it('displays sort direction indicator (↑/↓)', () => {
      const { rerender } = renderWithProviders(
        <PatientHistoryTable
          visits={mockVisits}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onSort={mockOnSort}
          sortField="date"
          sortDirection="asc"
        />
      );

      // Ascending sort indicator
      expect(screen.getByText('↑')).toBeInTheDocument();

      // Re-render with descending sort
      rerender(
        <MantineProvider>
          <MemoryRouter>
            <PatientHistoryTable
              visits={mockVisits}
              loading={false}
              onEdit={mockOnEdit}
              onDelete={mockOnDelete}
              onSort={mockOnSort}
              sortField="date"
              sortDirection="desc"
            />
          </MemoryRouter>
        </MantineProvider>
      );

      // Descending sort indicator
      expect(screen.getByText('↓')).toBeInTheDocument();
    });
  });
});
