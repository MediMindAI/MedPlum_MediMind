/**
 * Tests for AccountDeactivateModal Component (T067)
 *
 * Tests deactivation/reactivation confirmation dialog functionality
 */

import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { MockClient } from '@medplum/mock';
import { Practitioner } from '@medplum/fhirtypes';
import { AccountDeactivateModal } from './AccountDeactivateModal';

describe('AccountDeactivateModal', () => {
  let medplum: MockClient;
  let activePractitioner: Practitioner;
  let inactivePractitioner: Practitioner;

  beforeEach(async () => {
    medplum = new MockClient();

    // Create active practitioner
    activePractitioner = await medplum.createResource<Practitioner>({
      resourceType: 'Practitioner',
      id: 'practitioner-active',
      active: true,
      name: [
        {
          use: 'official',
          family: 'ხოზვრია',
          given: ['თენგიზი']
        }
      ],
      telecom: [
        {
          system: 'email',
          value: 'tengiz@medimind.ge',
          use: 'work'
        }
      ]
    });

    // Create inactive practitioner
    inactivePractitioner = await medplum.createResource<Practitioner>({
      resourceType: 'Practitioner',
      id: 'practitioner-inactive',
      active: false,
      name: [
        {
          use: 'official',
          family: 'გელაშვილი',
          given: ['ნინო']
        }
      ]
    });

    // Set up localStorage with Georgian language
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'ka');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Deactivation Flow', () => {
    it('should render deactivation modal when opened', () => {
      renderWithProviders(
        <AccountDeactivateModal
          opened={true}
          onClose={jest.fn()}
          practitioner={activePractitioner}
          onSuccess={jest.fn()}
        />,
        { medplum }
      );

      expect(screen.getByText('ანგარიშის დეაქტივაცია')).toBeInTheDocument();
    });

    it('should display practitioner name in modal', () => {
      renderWithProviders(
        <AccountDeactivateModal
          opened={true}
          onClose={jest.fn()}
          practitioner={activePractitioner}
          onSuccess={jest.fn()}
        />,
        { medplum }
      );

      expect(screen.getByText(/თენგიზი/i)).toBeInTheDocument();
      expect(screen.getByText(/ხოზვრია/i)).toBeInTheDocument();
    });

    it('should show deactivate button for active practitioner', () => {
      renderWithProviders(
        <AccountDeactivateModal
          opened={true}
          onClose={jest.fn()}
          practitioner={activePractitioner}
          onSuccess={jest.fn()}
        />,
        { medplum }
      );

      const deactivateButton = screen.getByText('დეაქტივაცია');
      expect(deactivateButton).toBeInTheDocument();
    });

    it('should call deactivatePractitioner when deactivate button clicked', async () => {
      const onSuccess = jest.fn();
      const onClose = jest.fn();

      renderWithProviders(
        <AccountDeactivateModal
          opened={true}
          onClose={onClose}
          practitioner={activePractitioner}
          onSuccess={onSuccess}
        />,
        { medplum }
      );

      const deactivateButton = screen.getByText('დეაქტივაცია');
      fireEvent.click(deactivateButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('should show loading state during deactivation', async () => {
      renderWithProviders(
        <AccountDeactivateModal
          opened={true}
          onClose={jest.fn()}
          practitioner={activePractitioner}
          onSuccess={jest.fn()}
        />,
        { medplum }
      );

      const deactivateButton = screen.getByText('დეაქტივაცია');
      fireEvent.click(deactivateButton);

      await waitFor(() => {
        expect(deactivateButton.closest('button')).toBeDisabled();
      });
    });

    it('should close modal after successful deactivation', async () => {
      const onClose = jest.fn();

      renderWithProviders(
        <AccountDeactivateModal
          opened={true}
          onClose={onClose}
          practitioner={activePractitioner}
          onSuccess={jest.fn()}
        />,
        { medplum }
      );

      const deactivateButton = screen.getByText('დეაქტივაცია');
      fireEvent.click(deactivateButton);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('should display confirmation message for deactivation', () => {
      renderWithProviders(
        <AccountDeactivateModal
          opened={true}
          onClose={jest.fn()}
          practitioner={activePractitioner}
          onSuccess={jest.fn()}
        />,
        { medplum }
      );

      expect(screen.getByText(/დარწმუნებული ხართ/i)).toBeInTheDocument();
    });

    it('should have cancel button', () => {
      renderWithProviders(
        <AccountDeactivateModal
          opened={true}
          onClose={jest.fn()}
          practitioner={activePractitioner}
          onSuccess={jest.fn()}
        />,
        { medplum }
      );

      const cancelButton = screen.getByText('გაუქმება');
      expect(cancelButton).toBeInTheDocument();
    });

    it('should close modal when cancel button clicked', () => {
      const onClose = jest.fn();

      renderWithProviders(
        <AccountDeactivateModal
          opened={true}
          onClose={onClose}
          practitioner={activePractitioner}
          onSuccess={jest.fn()}
        />,
        { medplum }
      );

      const cancelButton = screen.getByText('გაუქმება');
      fireEvent.click(cancelButton);

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Reactivation Flow', () => {
    it('should show reactivate button for inactive practitioner', () => {
      renderWithProviders(
        <AccountDeactivateModal
          opened={true}
          onClose={jest.fn()}
          practitioner={inactivePractitioner}
          onSuccess={jest.fn()}
        />,
        { medplum }
      );

      const reactivateButton = screen.getByText('გააქტიურება');
      expect(reactivateButton).toBeInTheDocument();
    });

    it('should call reactivatePractitioner when reactivate button clicked', async () => {
      const onSuccess = jest.fn();

      renderWithProviders(
        <AccountDeactivateModal
          opened={true}
          onClose={jest.fn()}
          practitioner={inactivePractitioner}
          onSuccess={onSuccess}
        />,
        { medplum }
      );

      const reactivateButton = screen.getByText('გააქტიურება');
      fireEvent.click(reactivateButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('should show loading state during reactivation', async () => {
      renderWithProviders(
        <AccountDeactivateModal
          opened={true}
          onClose={jest.fn()}
          practitioner={inactivePractitioner}
          onSuccess={jest.fn()}
        />,
        { medplum }
      );

      const reactivateButton = screen.getByText('გააქტიურება');
      fireEvent.click(reactivateButton);

      await waitFor(() => {
        expect(reactivateButton.closest('button')).toBeDisabled();
      });
    });

    it('should display confirmation message for reactivation', () => {
      renderWithProviders(
        <AccountDeactivateModal
          opened={true}
          onClose={jest.fn()}
          practitioner={inactivePractitioner}
          onSuccess={jest.fn()}
        />,
        { medplum }
      );

      expect(screen.getByText(/დარწმუნებული ხართ/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message if deactivation fails', async () => {
      // Mock a deactivation failure
      const mockError = new Error('Deactivation failed');
      medplum.updateResource = jest.fn().mockRejectedValue(mockError);

      renderWithProviders(
        <AccountDeactivateModal
          opened={true}
          onClose={jest.fn()}
          practitioner={activePractitioner}
          onSuccess={jest.fn()}
        />,
        { medplum }
      );

      const deactivateButton = screen.getByText('დეაქტივაცია');
      fireEvent.click(deactivateButton);

      await waitFor(() => {
        expect(screen.getByText('შეცდომა')).toBeInTheDocument();
      });
    });

    it('should not close modal if operation fails', async () => {
      const onClose = jest.fn();
      medplum.updateResource = jest.fn().mockRejectedValue(new Error('Failed'));

      renderWithProviders(
        <AccountDeactivateModal
          opened={true}
          onClose={onClose}
          practitioner={activePractitioner}
          onSuccess={jest.fn()}
        />,
        { medplum }
      );

      const deactivateButton = screen.getByText('დეაქტივაცია');
      fireEvent.click(deactivateButton);

      await waitFor(() => {
        expect(screen.getByText('შეცდომა')).toBeInTheDocument();
      });

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should display specific error message for self-deactivation', async () => {
      const mockError = new Error('Cannot deactivate your own account');
      medplum.updateResource = jest.fn().mockRejectedValue(mockError);

      renderWithProviders(
        <AccountDeactivateModal
          opened={true}
          onClose={jest.fn()}
          practitioner={activePractitioner}
          onSuccess={jest.fn()}
        />,
        { medplum }
      );

      const deactivateButton = screen.getByText('დეაქტივაცია');
      fireEvent.click(deactivateButton);

      await waitFor(() => {
        expect(screen.getByText('არ შეგიძლიათ საკუთარი ანგარიშის დეაქტივაცია')).toBeInTheDocument();
      });
    });
  });

  describe('Modal Visibility', () => {
    it('should not render when opened is false', () => {
      renderWithProviders(
        <AccountDeactivateModal
          opened={false}
          onClose={jest.fn()}
          practitioner={activePractitioner}
          onSuccess={jest.fn()}
        />,
        { medplum }
      );

      expect(screen.queryByText('ანგარიშის დეაქტივაცია')).not.toBeInTheDocument();
    });

    it('should render when opened is true', () => {
      renderWithProviders(
        <AccountDeactivateModal
          opened={true}
          onClose={jest.fn()}
          practitioner={activePractitioner}
          onSuccess={jest.fn()}
        />,
        { medplum }
      );

      expect(screen.getByText('ანგარიშის დეაქტივაცია')).toBeInTheDocument();
    });
  });

  describe('Multilingual Support', () => {
    it('should display Georgian text when language is ka', () => {
      localStorage.setItem('emrLanguage', 'ka');

      renderWithProviders(
        <AccountDeactivateModal
          opened={true}
          onClose={jest.fn()}
          practitioner={activePractitioner}
          onSuccess={jest.fn()}
        />,
        { medplum }
      );

      expect(screen.getByText('დეაქტივაცია')).toBeInTheDocument();
      expect(screen.getByText('გაუქმება')).toBeInTheDocument();
    });

    it('should display English text when language is en', () => {
      localStorage.setItem('emrLanguage', 'en');

      renderWithProviders(
        <AccountDeactivateModal
          opened={true}
          onClose={jest.fn()}
          practitioner={activePractitioner}
          onSuccess={jest.fn()}
        />,
        { medplum }
      );

      expect(screen.getByText('Deactivate')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should display Russian text when language is ru', () => {
      localStorage.setItem('emrLanguage', 'ru');

      renderWithProviders(
        <AccountDeactivateModal
          opened={true}
          onClose={jest.fn()}
          practitioner={activePractitioner}
          onSuccess={jest.fn()}
        />,
        { medplum }
      );

      expect(screen.getByText('Деактивировать')).toBeInTheDocument();
      expect(screen.getByText('Отмена')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible modal title', () => {
      renderWithProviders(
        <AccountDeactivateModal
          opened={true}
          onClose={jest.fn()}
          practitioner={activePractitioner}
          onSuccess={jest.fn()}
        />,
        { medplum }
      );

      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('should have accessible buttons with roles', () => {
      renderWithProviders(
        <AccountDeactivateModal
          opened={true}
          onClose={jest.fn()}
          practitioner={activePractitioner}
          onSuccess={jest.fn()}
        />,
        { medplum }
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation', () => {
      renderWithProviders(
        <AccountDeactivateModal
          opened={true}
          onClose={jest.fn()}
          practitioner={activePractitioner}
          onSuccess={jest.fn()}
        />,
        { medplum }
      );

      const deactivateButton = screen.getByText('დეაქტივაცია').closest('button')!;
      deactivateButton.focus();

      expect(deactivateButton).toHaveFocus();
    });
  });

  describe('Props Validation', () => {
    it('should accept all required props without error', () => {
      expect(() => {
        renderWithProviders(
          <AccountDeactivateModal
            opened={true}
            onClose={jest.fn()}
            practitioner={activePractitioner}
            onSuccess={jest.fn()}
          />,
          { medplum }
        );
      }).not.toThrow();
    });

    it('should call onSuccess callback after successful operation', async () => {
      const onSuccess = jest.fn();

      renderWithProviders(
        <AccountDeactivateModal
          opened={true}
          onClose={jest.fn()}
          practitioner={activePractitioner}
          onSuccess={onSuccess}
        />,
        { medplum }
      );

      const deactivateButton = screen.getByText('დეაქტივაცია');
      fireEvent.click(deactivateButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
      });
    });
  });
});
