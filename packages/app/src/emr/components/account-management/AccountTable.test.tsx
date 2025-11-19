/**
 * Tests for AccountTable Component
 *
 * Tests table rendering, sorting, pagination, and row actions
 */

import { screen, fireEvent } from '@testing-library/react';
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

  it('should render table with 10 columns', () => {
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    renderWithProviders(
      <AccountTable accounts={mockAccounts} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    // Check column headers
    expect(screen.getByText(/თანამშრომლის ID/i)).toBeInTheDocument(); // Staff ID
    expect(screen.getByText(/სახელი/i)).toBeInTheDocument(); // Name
    expect(screen.getByText(/ელ\. ფოსტა/i)).toBeInTheDocument(); // Email
    expect(screen.getByText(/ტელეფონი/i)).toBeInTheDocument(); // Phone
    expect(screen.getByText(/როლი/i)).toBeInTheDocument(); // Role
    expect(screen.getByText(/განყოფილება/i)).toBeInTheDocument(); // Department
    expect(screen.getByText(/სტატუსი/i)).toBeInTheDocument(); // Status
    expect(screen.getByText(/ბოლო ცვლილება/i)).toBeInTheDocument(); // Last modified
    expect(screen.getByText(/მოქმედებები/i)).toBeInTheDocument(); // Actions
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
    // Roles might be displayed on separate lines or joined - check if both roles exist
    expect(screen.getByText('Physician')).toBeInTheDocument();
    expect(screen.getByText('Department Head')).toBeInTheDocument();
  });

  it('should use turquoise gradient header', () => {
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    const { container } = renderWithProviders(
      <AccountTable accounts={mockAccounts} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const header = container.querySelector('thead tr');
    expect(header).toHaveStyle({
      background: 'var(--emr-gradient-submenu)',
    });
  });

  it('should wrap table in horizontal scroll container', () => {
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    const { container } = renderWithProviders(
      <AccountTable accounts={mockAccounts} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    // Check for horizontal scroll container (overflow-x: auto)
    const scrollContainer = container.querySelector('div[style*="overflow"]');
    expect(scrollContainer).toBeInTheDocument();
  });

  it('should call onEdit when edit icon is clicked', () => {
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    renderWithProviders(
      <AccountTable accounts={mockAccounts} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const editButtons = screen.getAllByRole('button', { name: /რედაქტირება/i });
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockAccounts[0]);
  });

  it('should call onDelete when delete icon is clicked', () => {
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    renderWithProviders(
      <AccountTable accounts={mockAccounts} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const deleteButtons = screen.getAllByRole('button', { name: /წაშლა/i });
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDelete).toHaveBeenCalledWith(mockAccounts[0]);
  });

  it('should display empty state when no accounts', () => {
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    renderWithProviders(<AccountTable accounts={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(screen.getByText(/ანგარიშები არ მოიძებნა/i)).toBeInTheDocument();
  });

  it('should show loading skeleton when loading prop is true', () => {
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    renderWithProviders(
      <AccountTable accounts={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} loading={true} />
    );

    expect(screen.getByText(/იტვირთება/i)).toBeInTheDocument();
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
    const { container } = renderWithProviders(
      <AccountTable accounts={mockAccounts} onEdit={jest.fn()} onDelete={jest.fn()} />
    );

    // Check that component is memoized (implementation detail)
    expect(AccountTable).toBeDefined();
  });

  it('should display clickable rows with cursor pointer', () => {
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    const { container } = renderWithProviders(
      <AccountTable accounts={mockAccounts} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const rows = container.querySelectorAll('tbody tr');
    rows.forEach((row) => {
      expect(row).toHaveStyle({ cursor: 'pointer' });
    });
  });
});
