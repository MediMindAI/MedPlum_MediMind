/**
 * Integration Tests for Multi-Role Account Form
 *
 * Tests T058-T060 integration: multi-role selection, display, and editing
 */

import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { MockClient } from '@medplum/mock';
import { AccountForm } from './AccountForm';
import { AccountTable } from './AccountTable';
import { AccountEditModal } from './AccountEditModal';
import type { AccountFormValues, AccountRow } from '../../types/account-management';

describe('Multi-Role Integration (T058-T060)', () => {
  let medplum: MockClient;

  beforeEach(() => {
    medplum = new MockClient();
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'ka');
  });

  describe('T058: AccountForm Multi-Role Support', () => {
    it('should render role assignment section with Add Role button', () => {
      const mockOnSubmit = jest.fn();
      renderWithProviders(<AccountForm onSubmit={mockOnSubmit} />, { medplum });

      // Check role assignment section exists
      expect(screen.getByText(/როლის მინიჭება/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /როლის დამატება/i })).toBeInTheDocument();
    });

    it('should allow adding multiple roles', async () => {
      const mockOnSubmit = jest.fn();
      renderWithProviders(<AccountForm onSubmit={mockOnSubmit} />, { medplum });

      const addRoleButton = screen.getByRole('button', { name: /როლის დამატება/i });

      // Add first role
      fireEvent.click(addRoleButton);
      await waitFor(() => {
        expect(screen.getByText(/როლი 1/i)).toBeInTheDocument();
      });

      // Add second role
      fireEvent.click(addRoleButton);
      await waitFor(() => {
        expect(screen.getByText(/როლი 2/i)).toBeInTheDocument();
      });
    });

    it('should allow removing roles', async () => {
      const mockOnSubmit = jest.fn();
      renderWithProviders(<AccountForm onSubmit={mockOnSubmit} />, { medplum });

      const addRoleButton = screen.getByRole('button', { name: /როლის დამატება/i });

      // Add a role
      fireEvent.click(addRoleButton);
      await waitFor(() => {
        expect(screen.getByText(/როლი 1/i)).toBeInTheDocument();
      });

      // Remove the role
      const removeButtons = screen.getAllByLabelText(/როლის წაშლა/i);
      fireEvent.click(removeButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText(/როლი 1/i)).not.toBeInTheDocument();
      });
    });

    it('should display empty state when no roles added', () => {
      const mockOnSubmit = jest.fn();
      renderWithProviders(<AccountForm onSubmit={mockOnSubmit} />, { medplum });

      expect(screen.getByText('როლები არ არის დამატებული')).toBeInTheDocument();
    });
  });

  describe('T059: AccountTable Multi-Role Display', () => {
    it('should display roles as badges', () => {
      const accounts: AccountRow[] = [
        {
          id: '1',
          name: 'თენგიზი ხოზვრია',
          email: 'test@example.com',
          roles: ['ექიმი', 'განყოფილების ხელმძღვანელი'],
          active: true,
        },
      ];

      renderWithProviders(
        <AccountTable accounts={accounts} onEdit={jest.fn()} onDelete={jest.fn()} />,
        { medplum }
      );

      // Should show roles as badges
      expect(screen.getByText('ექიმი')).toBeInTheDocument();
      expect(screen.getByText('განყოფილების ხელმძღვანელი')).toBeInTheDocument();
    });

    it('should show overflow with +N badge when more than 2 roles', () => {
      const accounts: AccountRow[] = [
        {
          id: '1',
          name: 'თენგიზი ხოზვრია',
          email: 'test@example.com',
          roles: ['ექიმი', 'ექთანი', 'ადმინისტრატორი', 'ფარმაცევტი'],
          active: true,
        },
      ];

      renderWithProviders(
        <AccountTable accounts={accounts} onEdit={jest.fn()} onDelete={jest.fn()} />,
        { medplum }
      );

      // First two roles should be visible
      expect(screen.getByText('ექიმი')).toBeInTheDocument();
      expect(screen.getByText('ექთანი')).toBeInTheDocument();

      // Should show +2 badge for overflow
      expect(screen.getByText('+2')).toBeInTheDocument();
    });

    it('should handle accounts with no roles', () => {
      const accounts: AccountRow[] = [
        {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          roles: [],
          active: true,
        },
      ];

      renderWithProviders(
        <AccountTable accounts={accounts} onEdit={jest.fn()} onDelete={jest.fn()} />,
        { medplum }
      );

      // Should show dash for empty roles
      const tableCells = screen.getAllByRole('cell');
      const rolesCell = tableCells.find((cell) => cell.textContent === '-');
      expect(rolesCell).toBeInTheDocument();
    });
  });

  describe('T060: AccountEditModal Multi-Role Support', () => {
    it('should open modal and display role assignment section', async () => {
      const mockAccount: AccountRow = {
        id: 'practitioner-123',
        name: 'თენგიზი ხოზვრია',
        email: 'test@example.com',
        roles: ['ექიმი'],
        active: true,
      };

      renderWithProviders(
        <AccountEditModal
          account={mockAccount}
          opened={true}
          onClose={jest.fn()}
          onSuccess={jest.fn()}
        />,
        { medplum }
      );

      // Wait for modal to load practitioner data
      await waitFor(() => {
        expect(screen.getByText(/როლის მინიჭება/i)).toBeInTheDocument();
      });
    });
  });

  describe('Integration: Form Values with Multi-Roles', () => {
    it('should submit form with multiple roles', async () => {
      const mockOnSubmit = jest.fn();
      renderWithProviders(<AccountForm onSubmit={mockOnSubmit} />, { medplum });

      // Fill basic fields
      const firstNameInput = screen.getAllByLabelText(/სახელი/i)[0];
      fireEvent.change(firstNameInput, { target: { value: 'თენგიზი' } });

      const lastNameInput = screen.getByLabelText(/გვარი/i);
      fireEvent.change(lastNameInput, { target: { value: 'ხოზვრია' } });

      const emailInput = screen.getByLabelText(/ელფოსტა/i);
      fireEvent.change(emailInput, { target: { value: 'test@medimind.ge' } });

      // Add a role
      const addRoleButton = screen.getByText('როლის დამატება');
      fireEvent.click(addRoleButton);

      // Submit form
      const submitButton = screen.getByText('შენახვა');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
        const formValues = mockOnSubmit.mock.calls[0][0] as AccountFormValues;
        expect(formValues.roles).toBeDefined();
        expect(Array.isArray(formValues.roles)).toBe(true);
      });
    });
  });
});
