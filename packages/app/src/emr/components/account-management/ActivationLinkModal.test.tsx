// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { ActivationLinkModal } from './ActivationLinkModal';

// Mock clipboard API
const mockWriteText = jest.fn().mockResolvedValue(undefined);
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

describe('ActivationLinkModal (T018)', () => {
  const defaultProps = {
    opened: true,
    onClose: jest.fn(),
    activationUrl: 'https://medimind.ge/setpassword/user-123?secret=abc123',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'ka');
    jest.clearAllMocks();
  });

  describe('Modal rendering', () => {
    it('should render modal when opened is true', () => {
      renderWithProviders(<ActivationLinkModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render modal when opened is false', () => {
      renderWithProviders(<ActivationLinkModal {...defaultProps} opened={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should display activation link title', () => {
      renderWithProviders(<ActivationLinkModal {...defaultProps} />, { initialLanguage: 'en' });

      // Modal title shows activation link title
      expect(screen.getByText('Activation Link Generated')).toBeInTheDocument();
    });

    it('should display the activation URL', () => {
      renderWithProviders(<ActivationLinkModal {...defaultProps} />);

      expect(screen.getByDisplayValue(defaultProps.activationUrl)).toBeInTheDocument();
    });

    it('should display expiry date information', () => {
      renderWithProviders(<ActivationLinkModal {...defaultProps} />, { initialLanguage: 'en' });

      // Should show expiration info (7 days from now)
      expect(screen.getByText(/Expires in 7 days/i)).toBeInTheDocument();
    });
  });

  describe('Copy functionality', () => {
    it('should copy link when copy button is clicked', async () => {
      renderWithProviders(<ActivationLinkModal {...defaultProps} />, { initialLanguage: 'en' });

      // Get all copy buttons and click the first one (ActionIcon)
      const copyButtons = screen.getAllByRole('button', { name: /copy/i });
      fireEvent.click(copyButtons[0]);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(defaultProps.activationUrl);
      });
    });

    it('should show success message after copying', async () => {
      renderWithProviders(<ActivationLinkModal {...defaultProps} />, { initialLanguage: 'en' });

      // Get all copy buttons and click the first one (ActionIcon)
      const copyButtons = screen.getAllByRole('button', { name: /copy/i });
      fireEvent.click(copyButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/copied/i)).toBeInTheDocument();
      });
    });
  });

  describe('Close functionality', () => {
    it('should call onClose when close button is clicked', () => {
      renderWithProviders(<ActivationLinkModal {...defaultProps} />, { initialLanguage: 'en' });

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Translations', () => {
    it('should display Georgian translations', () => {
      renderWithProviders(<ActivationLinkModal {...defaultProps} />, { initialLanguage: 'ka' });

      expect(screen.getByText('აქტივაციის ბმული შექმნილია')).toBeInTheDocument();
    });

    it('should display English translations', () => {
      renderWithProviders(<ActivationLinkModal {...defaultProps} />, { initialLanguage: 'en' });

      expect(screen.getByText('Activation Link Generated')).toBeInTheDocument();
    });

    it('should display Russian translations', () => {
      renderWithProviders(<ActivationLinkModal {...defaultProps} />, { initialLanguage: 'ru' });

      expect(screen.getByText('Создана ссылка активации')).toBeInTheDocument();
    });
  });

  describe('Expiry calculation', () => {
    it('should display correct days until expiry', () => {
      const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      renderWithProviders(
        <ActivationLinkModal {...defaultProps} expiresAt={threeDaysFromNow} />,
        { initialLanguage: 'en' }
      );

      expect(screen.getByText(/Expires in 3 days/i)).toBeInTheDocument();
    });

    it('should display 1 day when less than 2 days remaining', () => {
      const oneDayFromNow = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString();
      renderWithProviders(
        <ActivationLinkModal {...defaultProps} expiresAt={oneDayFromNow} />,
        { initialLanguage: 'en' }
      );

      expect(screen.getByText(/Expires in 1 days/i)).toBeInTheDocument();
    });
  });

  describe('Input field', () => {
    it('should have readonly input for activation URL', () => {
      renderWithProviders(<ActivationLinkModal {...defaultProps} />);

      const input = screen.getByDisplayValue(defaultProps.activationUrl);
      expect(input).toHaveAttribute('readonly');
    });
  });
});
