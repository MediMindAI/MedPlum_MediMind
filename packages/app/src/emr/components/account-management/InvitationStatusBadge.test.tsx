// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { InvitationStatusBadge } from './InvitationStatusBadge';
import type { InvitationStatus } from '../../types/account-management';

describe('InvitationStatusBadge (T017)', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'ka');
  });

  describe('Status rendering', () => {
    it('should render pending status with yellow/orange badge', () => {
      renderWithProviders(<InvitationStatusBadge status="pending" />);

      const badge = screen.getByText(/მოლოდინში/i);
      expect(badge).toBeInTheDocument();
    });

    it('should render accepted status with green badge', () => {
      renderWithProviders(<InvitationStatusBadge status="accepted" />);

      const badge = screen.getByText(/აქტივირებული/i);
      expect(badge).toBeInTheDocument();
    });

    it('should render expired status with gray badge', () => {
      renderWithProviders(<InvitationStatusBadge status="expired" />);

      const badge = screen.getByText(/ვადაგასული/i);
      expect(badge).toBeInTheDocument();
    });

    it('should render bounced status with red badge', () => {
      renderWithProviders(<InvitationStatusBadge status="bounced" />);

      const badge = screen.getByText(/მიუწვდომელი/i);
      expect(badge).toBeInTheDocument();
    });

    it('should render cancelled status with gray badge', () => {
      renderWithProviders(<InvitationStatusBadge status="cancelled" />);

      const badge = screen.getByText(/გაუქმებული/i);
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Mantine Badge component', () => {
    it('should use Mantine Badge component', () => {
      const { container } = renderWithProviders(<InvitationStatusBadge status="pending" />);

      const badge = container.querySelector('[class*="Badge"]');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Translations', () => {
    it('should display correct text in Georgian for pending', () => {
      renderWithProviders(<InvitationStatusBadge status="pending" />, { initialLanguage: 'ka' });
      expect(screen.getByText('მოლოდინში')).toBeInTheDocument();
    });

    it('should display correct text in Georgian for accepted', () => {
      renderWithProviders(<InvitationStatusBadge status="accepted" />, { initialLanguage: 'ka' });
      expect(screen.getByText('აქტივირებული')).toBeInTheDocument();
    });

    it('should display correct text in Georgian for expired', () => {
      renderWithProviders(<InvitationStatusBadge status="expired" />, { initialLanguage: 'ka' });
      expect(screen.getByText('ვადაგასული')).toBeInTheDocument();
    });

    it('should display correct text in Georgian for bounced', () => {
      renderWithProviders(<InvitationStatusBadge status="bounced" />, { initialLanguage: 'ka' });
      expect(screen.getByText('მიუწვდომელი')).toBeInTheDocument();
    });

    it('should display correct text in Georgian for cancelled', () => {
      renderWithProviders(<InvitationStatusBadge status="cancelled" />, { initialLanguage: 'ka' });
      expect(screen.getByText('გაუქმებული')).toBeInTheDocument();
    });

    it('should display correct text in English for pending', () => {
      renderWithProviders(<InvitationStatusBadge status="pending" />, { initialLanguage: 'en' });
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('should display correct text in English for accepted', () => {
      renderWithProviders(<InvitationStatusBadge status="accepted" />, { initialLanguage: 'en' });
      expect(screen.getByText('Activated')).toBeInTheDocument();
    });

    it('should display correct text in English for expired', () => {
      renderWithProviders(<InvitationStatusBadge status="expired" />, { initialLanguage: 'en' });
      expect(screen.getByText('Expired')).toBeInTheDocument();
    });

    it('should display correct text in English for bounced', () => {
      renderWithProviders(<InvitationStatusBadge status="bounced" />, { initialLanguage: 'en' });
      expect(screen.getByText('Bounced')).toBeInTheDocument();
    });

    it('should display correct text in English for cancelled', () => {
      renderWithProviders(<InvitationStatusBadge status="cancelled" />, { initialLanguage: 'en' });
      expect(screen.getByText('Cancelled')).toBeInTheDocument();
    });

    it('should display correct text in Russian for pending', () => {
      renderWithProviders(<InvitationStatusBadge status="pending" />, { initialLanguage: 'ru' });
      expect(screen.getByText('Ожидание')).toBeInTheDocument();
    });

    it('should display correct text in Russian for accepted', () => {
      renderWithProviders(<InvitationStatusBadge status="accepted" />, { initialLanguage: 'ru' });
      expect(screen.getByText('Активирован')).toBeInTheDocument();
    });

    it('should display correct text in Russian for expired', () => {
      renderWithProviders(<InvitationStatusBadge status="expired" />, { initialLanguage: 'ru' });
      expect(screen.getByText('Истёк')).toBeInTheDocument();
    });

    it('should display correct text in Russian for bounced', () => {
      renderWithProviders(<InvitationStatusBadge status="bounced" />, { initialLanguage: 'ru' });
      expect(screen.getByText('Не доставлено')).toBeInTheDocument();
    });

    it('should display correct text in Russian for cancelled', () => {
      renderWithProviders(<InvitationStatusBadge status="cancelled" />, { initialLanguage: 'ru' });
      expect(screen.getByText('Отменено')).toBeInTheDocument();
    });
  });

  describe('All status types', () => {
    const statuses: InvitationStatus[] = ['pending', 'accepted', 'expired', 'bounced', 'cancelled'];

    statuses.forEach((status) => {
      it(`should render ${status} status without errors`, () => {
        const { container } = renderWithProviders(<InvitationStatusBadge status={status} />);
        expect(container).toBeInTheDocument();
      });
    });
  });
});
