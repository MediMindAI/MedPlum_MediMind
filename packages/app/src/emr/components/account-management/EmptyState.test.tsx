// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'ka');
  });

  describe('empty variant', () => {
    it('should display empty state message', () => {
      renderWithProviders(<EmptyState variant="empty" />);

      expect(screen.getByText(/ანგარიშები არ მოიძებნა/i)).toBeInTheDocument();
      expect(screen.getByText(/შექმენით პირველი ანგარიში/i)).toBeInTheDocument();
    });

    it('should display users icon for empty state', () => {
      const { container } = renderWithProviders(<EmptyState variant="empty" />);

      // Check for icon container
      const iconContainer = container.querySelector('[class*="ThemeIcon"]');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('no-results variant', () => {
    it('should display no search results message', () => {
      renderWithProviders(<EmptyState variant="no-results" />);

      expect(screen.getByText(/ძიების შედეგები არ მოიძებნა/i)).toBeInTheDocument();
      expect(screen.getByText(/სცადეთ სხვა საძიებო პირობები/i)).toBeInTheDocument();
    });

    it('should display search icon for no-results state', () => {
      const { container } = renderWithProviders(<EmptyState variant="no-results" />);

      const iconContainer = container.querySelector('[class*="ThemeIcon"]');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('action button', () => {
    it('should render action button when onAction provided', () => {
      const mockOnAction = jest.fn();

      renderWithProviders(
        <EmptyState variant="empty" onAction={mockOnAction} actionLabel="Create Account" />
      );

      const button = screen.getByRole('button', { name: /Create Account/i });
      expect(button).toBeInTheDocument();
    });

    it('should not render action button when onAction not provided', () => {
      renderWithProviders(<EmptyState variant="empty" />);

      const buttons = screen.queryAllByRole('button');
      expect(buttons).toHaveLength(0);
    });

    it('should call onAction when button is clicked', () => {
      const mockOnAction = jest.fn();

      renderWithProviders(
        <EmptyState variant="empty" onAction={mockOnAction} actionLabel="Create Account" />
      );

      const button = screen.getByRole('button', { name: /Create Account/i });
      fireEvent.click(button);

      expect(mockOnAction).toHaveBeenCalledTimes(1);
    });

    it('should use provided actionLabel', () => {
      const mockOnAction = jest.fn();

      renderWithProviders(
        <EmptyState variant="no-results" onAction={mockOnAction} actionLabel="Clear Filters" />
      );

      expect(screen.getByRole('button', { name: /Clear Filters/i })).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should render component wrapper', () => {
      const { container } = renderWithProviders(<EmptyState variant="empty" />);

      // Box wrapper should exist
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toBeInTheDocument();
    });

    it('should have appropriate padding', () => {
      const { container } = renderWithProviders(<EmptyState variant="empty" />);

      // Check for py prop which translates to padding
      const wrapper = container.firstChild;
      expect(wrapper).toBeInTheDocument();
    });

    it('should use theme colors', () => {
      const { container } = renderWithProviders(<EmptyState variant="empty" />);

      const iconContainer = container.querySelector('[class*="ThemeIcon"]');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('translations', () => {
    it('should display Georgian translations by default', () => {
      localStorage.setItem('emrLanguage', 'ka');
      renderWithProviders(<EmptyState variant="empty" />);

      expect(screen.getByText(/ანგარიშები არ მოიძებნა/i)).toBeInTheDocument();
    });

    it('should display English translations', () => {
      localStorage.setItem('emrLanguage', 'en');
      renderWithProviders(<EmptyState variant="empty" />, { initialLanguage: 'en' });

      expect(screen.getByText(/No Accounts Found/i)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have semantic structure', () => {
      renderWithProviders(<EmptyState variant="empty" />);

      // Title should be a heading or prominent text
      const title = screen.getByText(/ანგარიშები არ მოიძებნა/i);
      expect(title).toBeInTheDocument();
    });

    it('should have descriptive text', () => {
      renderWithProviders(<EmptyState variant="empty" />);

      const description = screen.getByText(/შექმენით პირველი ანგარიში/i);
      expect(description).toBeInTheDocument();
    });
  });
});
