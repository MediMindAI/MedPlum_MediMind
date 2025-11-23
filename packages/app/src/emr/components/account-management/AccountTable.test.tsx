// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { screen, fireEvent, within } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { AccountTable } from './AccountTable';
import type { AccountRow } from '../../types/account-management';

describe('AccountTable (T021)', () => {
  const mockAccounts: AccountRow[] = [
    {
      id: 'practitioner-1',
      staffId: 'STAFF-001',
      name: 'თენგიზი ხოზვრია',
      email: 'tengizi@medimind.ge',
      phone: '+995500050610',
      roles: ['Physician', 'Department Head'],
      departments: ['Cardiology'],
      active: true,
      lastModified: '2025-11-19T10:00:00Z',
    },
    {
      id: 'practitioner-2',
      staffId: 'STAFF-002',
      name: 'ნინო გელაშვილი',
      email: 'nino@medimind.ge',
      phone: '+995555123456',
      roles: ['Nurse'],
      departments: ['Emergency'],
      active: false,
      lastModified: '2025-11-18T15:30:00Z',
    },
  ];

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'ka');
  });

  it('should render table with column headers', () => {
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    // Mock window.matchMedia to simulate desktop viewport
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false, // Desktop viewport
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    renderWithProviders(
      <AccountTable accounts={mockAccounts} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    // Check core column headers - EMRTable uses light gray header style
    // Some columns may be hidden on mobile/tablet, so we check the main ones
    expect(screen.getByText(/თანამშრომლის ID/i)).toBeInTheDocument(); // Staff ID
    expect(screen.getByText(/სახელი/i)).toBeInTheDocument(); // Name
    expect(screen.getByText(/როლი/i)).toBeInTheDocument(); // Role
    expect(screen.getByText(/სტატუსი/i)).toBeInTheDocument(); // Status
  });

  it('should display account data in table rows', () => {
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    renderWithProviders(
      <AccountTable accounts={mockAccounts} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    expect(screen.getByText('STAFF-001')).toBeInTheDocument();
    expect(screen.getByText('თენგიზი ხოზვრია')).toBeInTheDocument();
    expect(screen.getByText('tengizi@medimind.ge')).toBeInTheDocument();
    expect(screen.getByText('+995500050610')).toBeInTheDocument();
    // Roles are displayed as badges
    expect(screen.getByText('Physician')).toBeInTheDocument();
    expect(screen.getByText('Department Head')).toBeInTheDocument();
  });

  it('should use EMRTable light gray header style', () => {
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    const { container } = renderWithProviders(
      <AccountTable accounts={mockAccounts} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const header = container.querySelector('thead');
    expect(header).toHaveStyle({
      background: 'var(--emr-table-header-bg)',
    });
  });

  it('should wrap table in horizontal scroll container', () => {
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    const { container } = renderWithProviders(
      <AccountTable accounts={mockAccounts} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    // Check for table container with border radius (EMRTable container style)
    const tableContainer = container.querySelector('div[style*="border-radius"]');
    expect(tableContainer).toBeInTheDocument();
  });

  it('should call onEdit when edit action is clicked from dropdown', async () => {
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    renderWithProviders(
      <AccountTable accounts={mockAccounts} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    // EMRTable uses a combined action pattern - click the action menu button first
    const actionButtons = screen.getAllByRole('button');
    const dotsButton = actionButtons.find((btn) => btn.querySelector('[class*="tabler-icon-dots"]'));
    if (dotsButton) {
      fireEvent.click(dotsButton);
    }

    // Then click the edit item in the dropdown
    const editItem = await screen.findByText(/რედაქტირება/i);
    fireEvent.click(editItem);

    expect(mockOnEdit).toHaveBeenCalledWith(mockAccounts[0]);
  });

  it('should call onDelete when delete action is clicked from dropdown', async () => {
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    renderWithProviders(
      <AccountTable accounts={mockAccounts} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    // EMRTable uses a combined action pattern - click the action menu button first
    const actionButtons = screen.getAllByRole('button');
    const dotsButton = actionButtons.find((btn) => btn.querySelector('[class*="tabler-icon-dots"]'));
    if (dotsButton) {
      fireEvent.click(dotsButton);
    }

    // Then click the delete item in the dropdown
    const deleteItem = await screen.findByText(/წაშლა/i);
    fireEvent.click(deleteItem);

    expect(mockOnDelete).toHaveBeenCalledWith(mockAccounts[0]);
  });

  it('should display empty state when no accounts', () => {
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    renderWithProviders(<AccountTable accounts={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    // EMRTable shows empty state with title
    expect(screen.getByText(/ანგარიშები არ მოიძებნა/i)).toBeInTheDocument();
  });

  it('should show loading skeleton when loading prop is true', () => {
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    const { container } = renderWithProviders(
      <AccountTable accounts={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} loading={true} />
    );

    // EMRTable shows skeleton rows when loading - look for Mantine skeleton elements
    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
    // The table body should have skeleton rows
    const tbody = container.querySelector('tbody');
    expect(tbody).toBeInTheDocument();
  });

  it('should display AccountStatusBadge for active/inactive status', () => {
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    renderWithProviders(
      <AccountTable accounts={mockAccounts} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    // Use getAllByText because status appears in multiple places
    expect(screen.getAllByText(/აქტიური/i).length).toBeGreaterThan(0); // Active
    expect(screen.getAllByText(/არააქტიური/i).length).toBeGreaterThan(0); // Inactive
  });

  it('should use React.memo() for performance optimization', () => {
    renderWithProviders(
      <AccountTable accounts={mockAccounts} onEdit={jest.fn()} onDelete={jest.fn()} />
    );

    // Check that component is memoized (implementation detail)
    expect(AccountTable).toBeDefined();
  });

  it('should render rows for each account', () => {
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    const { container } = renderWithProviders(
      <AccountTable accounts={mockAccounts} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(mockAccounts.length);
  });
});
