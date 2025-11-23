// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import React from 'react';
import { BulkActionBar } from './BulkActionBar';
import type { BulkOperationProgress, BulkOperationResult } from '../../types/account-management';

const mockOnDeactivate = jest.fn();
const mockOnActivate = jest.fn();
const mockOnAssignRole = jest.fn();
const mockOnClear = jest.fn();

const renderComponent = (props: Partial<React.ComponentProps<typeof BulkActionBar>> = {}) => {
  const defaultProps = {
    selectedCount: 3,
    onDeactivate: mockOnDeactivate,
    onActivate: mockOnActivate,
    onAssignRole: mockOnAssignRole,
    onClear: mockOnClear,
  };

  return render(
    <MantineProvider>
      <BulkActionBar {...defaultProps} {...props} />
    </MantineProvider>
  );
};

describe('BulkActionBar', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when selectedCount is 0', () => {
      renderComponent({ selectedCount: 0 });

      expect(screen.queryByTestId('bulk-action-bar')).not.toBeInTheDocument();
    });

    it('should render when accounts are selected', () => {
      renderComponent({ selectedCount: 3 });

      expect(screen.getByTestId('bulk-action-bar')).toBeInTheDocument();
    });

    it('should display selected count', () => {
      renderComponent({ selectedCount: 5 });

      expect(screen.getByText(/5 selected/i)).toBeInTheDocument();
    });

    it('should render deactivate button', () => {
      renderComponent();

      expect(screen.getByRole('button', { name: /deactivate/i })).toBeInTheDocument();
    });

    it('should render activate button', () => {
      renderComponent();

      expect(screen.getByRole('button', { name: /^activate$/i })).toBeInTheDocument();
    });

    it('should render assign role button', () => {
      renderComponent();

      expect(screen.getByRole('button', { name: /assign role/i })).toBeInTheDocument();
    });

    it('should render close button', () => {
      renderComponent();

      // Close button has aria-label
      expect(screen.getByRole('button', { name: /deselect/i })).toBeInTheDocument();
    });
  });

  describe('Button interactions', () => {
    it('should call onDeactivate when deactivate button is clicked', () => {
      renderComponent();

      fireEvent.click(screen.getByRole('button', { name: /deactivate/i }));

      expect(mockOnDeactivate).toHaveBeenCalledTimes(1);
    });

    it('should call onActivate when activate button is clicked', () => {
      renderComponent();

      fireEvent.click(screen.getByRole('button', { name: /^activate$/i }));

      expect(mockOnActivate).toHaveBeenCalledTimes(1);
    });

    it('should call onAssignRole when assign role button is clicked', () => {
      renderComponent();

      fireEvent.click(screen.getByRole('button', { name: /assign role/i }));

      expect(mockOnAssignRole).toHaveBeenCalledTimes(1);
    });

    it('should call onClear when close button is clicked', () => {
      renderComponent();

      fireEvent.click(screen.getByRole('button', { name: /deselect/i }));

      expect(mockOnClear).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading state', () => {
    it('should disable buttons when loading', () => {
      renderComponent({ loading: true });

      expect(screen.getByRole('button', { name: /deactivate/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /^activate$/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /assign role/i })).toBeDisabled();
    });

    it('should show progress bar when loading with progress', () => {
      const progress: BulkOperationProgress = {
        current: 5,
        total: 10,
        percentage: 50,
      };

      renderComponent({ loading: true, progress });

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Result display', () => {
    it('should show success count in result', () => {
      const result: BulkOperationResult = {
        operationType: 'deactivate',
        total: 5,
        successful: 4,
        failed: 1,
        errors: [{ id: 'test', name: 'Test', error: 'Error' }],
      };

      renderComponent({ result });

      expect(screen.getByText(/4/)).toBeInTheDocument();
    });

    it('should show failed count when there are failures', () => {
      const result: BulkOperationResult = {
        operationType: 'deactivate',
        total: 5,
        successful: 3,
        failed: 2,
        errors: [
          { id: 'test1', name: 'Test 1', error: 'Error 1' },
          { id: 'test2', name: 'Test 2', error: 'Error 2' },
        ],
      };

      renderComponent({ result });

      expect(screen.getByText(/2 failed/i)).toBeInTheDocument();
    });

    it('should show self-excluded badge when current user was excluded', () => {
      const result: BulkOperationResult = {
        operationType: 'deactivate',
        total: 3,
        successful: 2,
        failed: 1,
        errors: [{ id: 'current-user', name: 'Your account', error: 'Cannot deactivate', code: 'SELF_EXCLUDED' }],
      };

      renderComponent({ result });

      expect(screen.getByText(/excluded/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels', () => {
      renderComponent();

      // Close button has aria-label
      const closeButton = screen.getByRole('button', { name: /deselect/i });
      expect(closeButton).toHaveAttribute('aria-label');
    });
  });
});
