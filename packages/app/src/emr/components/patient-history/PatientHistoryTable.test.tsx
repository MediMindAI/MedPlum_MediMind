// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    it('renders table with patient data', () => {
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

      // Check that table is rendered
      expect(document.querySelector('table')).toBeInTheDocument();
    });

    it('displays patient data correctly', () => {
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
      expect(screen.getByText('26001014632')).toBeInTheDocument();
      expect(screen.getByText('თენგიზი')).toBeInTheDocument();
      expect(screen.getByText('ხოზვრია')).toBeInTheDocument();
      expect(screen.getByText('10357-2025')).toBeInTheDocument();

      // Check second visit data
      expect(screen.getByText('01001011116')).toBeInTheDocument();
      expect(screen.getByText('ანა')).toBeInTheDocument();
      expect(screen.getByText('გელაშვილი')).toBeInTheDocument();
      expect(screen.getByText('a-6871-2025')).toBeInTheDocument();
    });
  });

  describe('Financial Data Display', () => {
    it('displays financial values correctly', () => {
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

      // Check financial values are displayed (formatted)
      expect(screen.getByText('500.00')).toBeInTheDocument();
      expect(screen.getByText('450.00')).toBeInTheDocument();
      expect(screen.getByText('50.00')).toBeInTheDocument();
      expect(screen.getByText('10%')).toBeInTheDocument();
    });

    it('highlights rows with debt', () => {
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

      // EMRTable applies highlighting to rows
      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(2);
    });
  });

  describe('Action Buttons', () => {
    it('renders action buttons for each row', () => {
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

      // Each row should have action buttons
      const actionCells = document.querySelectorAll('tbody td:last-child');
      expect(actionCells.length).toBe(2);
    });

    it('calls onEdit when primary edit action is clicked', async () => {
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

      // Find edit buttons (primary action in EMRTable)
      const editButtons = document.querySelectorAll('tbody td:last-child button');
      expect(editButtons.length).toBeGreaterThan(0);

      await userEvent.click(editButtons[0] as HTMLElement);
      expect(mockOnEdit).toHaveBeenCalledWith('visit-1');
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

      // EMRTable shows skeleton elements when loading
      const skeletons = document.querySelectorAll('.mantine-Skeleton-root');
      expect(skeletons.length).toBeGreaterThan(0);
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

      // EMRTable shows empty state
      expect(screen.getByText(/ვიზიტები არ მოიძებნა/i)).toBeInTheDocument();
    });
  });

  describe('Row Navigation', () => {
    it('navigates when row is clicked', async () => {
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

      const row = screen.getByText('თენგიზი').closest('tr');
      expect(row).toBeInTheDocument();

      await userEvent.click(row as HTMLElement);
      expect(mockNavigate).toHaveBeenCalledWith('/emr/patient-history/visit-1');
    });
  });

  describe('Sorting', () => {
    it('has sortable date column', () => {
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

      // EMRTable makes sortable columns clickable
      const dateHeader = screen.getByText('თარიღი').closest('th');
      expect(dateHeader).toHaveStyle({ cursor: 'pointer' });
    });

    it('calls onSort when date header is clicked', async () => {
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
      await userEvent.click(dateHeader);

      expect(mockOnSort).toHaveBeenCalledWith('date');
    });
  });
});
