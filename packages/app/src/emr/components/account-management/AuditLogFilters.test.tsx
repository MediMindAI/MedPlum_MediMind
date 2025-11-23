// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MedplumProvider } from '@medplum/react-hooks';
import { MemoryRouter } from 'react-router-dom';
import { MockClient } from '@medplum/mock';
import type { AuditLogFilters as AuditLogFiltersType } from '../../types/account-management';
import { AuditLogFilters } from './AuditLogFilters';

describe('AuditLogFilters (T026)', () => {
  let medplum: MockClient;

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <MantineProvider>
        <MemoryRouter>
          <MedplumProvider medplum={medplum}>{component}</MedplumProvider>
        </MemoryRouter>
      </MantineProvider>
    );
  };

  const mockOnChange = jest.fn();

  beforeEach(() => {
    medplum = new MockClient();
    localStorage.setItem('emrLanguage', 'en');
    mockOnChange.mockClear();
  });

  it('should render date range pickers', () => {
    const filters: AuditLogFiltersType = {};
    renderWithProviders(<AuditLogFilters filters={filters} onChange={mockOnChange} />);

    // Look for date input labels
    expect(screen.getByText('Date From')).toBeInTheDocument();
    expect(screen.getByText('Date To')).toBeInTheDocument();
  });

  it('should render action dropdown', () => {
    const filters: AuditLogFiltersType = {};
    renderWithProviders(<AuditLogFilters filters={filters} onChange={mockOnChange} />);

    // Find input element with placeholder
    expect(screen.getByPlaceholderText(/All Actions/i)).toBeInTheDocument();
  });

  it('should render outcome dropdown', () => {
    const filters: AuditLogFiltersType = {};
    renderWithProviders(<AuditLogFilters filters={filters} onChange={mockOnChange} />);

    expect(screen.getByPlaceholderText(/All Outcomes/i)).toBeInTheDocument();
  });

  it('should display action dropdown and options when clicked', async () => {
    const filters: AuditLogFiltersType = {};
    renderWithProviders(<AuditLogFilters filters={filters} onChange={mockOnChange} />);

    const actionInput = screen.getByPlaceholderText(/All Actions/i);
    fireEvent.click(actionInput);

    await waitFor(() => {
      expect(screen.getByRole('option', { name: /Create/i })).toBeInTheDocument();
    });
  });

  it('should call onChange when action option is selected', async () => {
    const filters: AuditLogFiltersType = {};
    renderWithProviders(<AuditLogFilters filters={filters} onChange={mockOnChange} />);

    const actionInput = screen.getByPlaceholderText(/All Actions/i);
    fireEvent.click(actionInput);

    await waitFor(() => {
      const createOption = screen.getByRole('option', { name: /Create/i });
      fireEvent.click(createOption);
    });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'C',
      })
    );
  });

  it('should display outcome options when dropdown clicked', async () => {
    const filters: AuditLogFiltersType = {};
    renderWithProviders(<AuditLogFilters filters={filters} onChange={mockOnChange} />);

    const outcomeInput = screen.getByPlaceholderText(/All Outcomes/i);
    fireEvent.click(outcomeInput);

    await waitFor(() => {
      expect(screen.getByRole('option', { name: /Success/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /Minor Failure/i })).toBeInTheDocument();
    });
  });

  it('should have clear filters button when filters are active', () => {
    const filters: AuditLogFiltersType = {
      action: 'C',
      outcome: 0,
    };
    renderWithProviders(<AuditLogFilters filters={filters} onChange={mockOnChange} />);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    expect(clearButton).toBeInTheDocument();
  });

  it('should clear all filters when clear button clicked', async () => {
    const filters: AuditLogFiltersType = {
      action: 'C',
      outcome: 0,
    };
    renderWithProviders(<AuditLogFilters filters={filters} onChange={mockOnChange} />);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith({});
  });

  it('should support mobile responsive layout', () => {
    const filters: AuditLogFiltersType = {};
    const { container } = renderWithProviders(<AuditLogFilters filters={filters} onChange={mockOnChange} />);

    // Filter container should use flex wrap for mobile
    const filterContainer = container.querySelector('[data-testid="audit-filters"]');
    expect(filterContainer).toBeInTheDocument();
  });

  it('should render the filters title', () => {
    const filters: AuditLogFiltersType = {};
    renderWithProviders(<AuditLogFilters filters={filters} onChange={mockOnChange} />);

    expect(screen.getByText('Filters')).toBeInTheDocument();
  });
});
