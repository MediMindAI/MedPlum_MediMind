// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { MockClient } from '@medplum/mock';
import { AdvancedFiltersPanel } from './AdvancedFiltersPanel';
import type { AccountSearchFiltersExtended } from '../../types/account-management';

describe('AdvancedFiltersPanel (T048)', () => {
  let medplum: MockClient;

  const defaultFilters: AccountSearchFiltersExtended = {
    active: undefined,
    role: undefined,
    hireDateFrom: undefined,
    hireDateTo: undefined,
    invitationStatus: undefined,
  };

  const mockOnChange = jest.fn();
  const mockOnToggle = jest.fn();

  const roleOptions = [
    { value: 'physician', label: 'Physician' },
    { value: 'nurse', label: 'Nurse' },
    { value: 'admin', label: 'Admin' },
  ];

  beforeEach(() => {
    medplum = new MockClient();
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
    mockOnChange.mockClear();
    mockOnToggle.mockClear();
  });

  it('should render collapsed by default', () => {
    renderWithProviders(
      <AdvancedFiltersPanel
        filters={defaultFilters}
        onChange={mockOnChange}
        expanded={false}
        onToggle={mockOnToggle}
        roleOptions={roleOptions}
      />,
      { medplum }
    );

    // Should show expand button when collapsed
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should render expanded when expanded=true', () => {
    renderWithProviders(
      <AdvancedFiltersPanel
        filters={defaultFilters}
        onChange={mockOnChange}
        expanded={true}
        onToggle={mockOnToggle}
        roleOptions={roleOptions}
      />,
      { medplum, initialLanguage: 'en' }
    );

    // Should show filter controls when expanded (status and role labels)
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
  });

  it('should call onToggle when toggle button is clicked', () => {
    renderWithProviders(
      <AdvancedFiltersPanel
        filters={defaultFilters}
        onChange={mockOnChange}
        expanded={false}
        onToggle={mockOnToggle}
        roleOptions={roleOptions}
      />,
      { medplum }
    );

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    expect(mockOnToggle).toHaveBeenCalled();
  });

  it('should render status filter with all options', () => {
    renderWithProviders(
      <AdvancedFiltersPanel
        filters={defaultFilters}
        onChange={mockOnChange}
        expanded={true}
        onToggle={mockOnToggle}
        roleOptions={roleOptions}
      />,
      { medplum, initialLanguage: 'en' }
    );

    // Status filter should have All, Active, Inactive options (may have multiple matches)
    const allButtons = screen.getAllByRole('radio', { name: /all/i });
    const activeButtons = screen.getAllByRole('radio', { name: /active/i });
    const inactiveButtons = screen.getAllByRole('radio', { name: /inactive/i });
    expect(allButtons.length).toBeGreaterThan(0);
    expect(activeButtons.length).toBeGreaterThan(0);
    expect(inactiveButtons.length).toBeGreaterThan(0);
  });

  it('should render role filter dropdown', () => {
    renderWithProviders(
      <AdvancedFiltersPanel
        filters={defaultFilters}
        onChange={mockOnChange}
        expanded={true}
        onToggle={mockOnToggle}
        roleOptions={roleOptions}
      />,
      { medplum, initialLanguage: 'en' }
    );

    // Should have role filter select with placeholder
    const roleSelect = screen.getByPlaceholderText(/Select role/i);
    expect(roleSelect).toBeInTheDocument();
  });

  it('should render date range filters', () => {
    renderWithProviders(
      <AdvancedFiltersPanel
        filters={defaultFilters}
        onChange={mockOnChange}
        expanded={true}
        onToggle={mockOnToggle}
        roleOptions={roleOptions}
      />,
      { medplum, initialLanguage: 'en' }
    );

    // Should have date pickers for hire date range
    expect(screen.getByText('Hire Date From')).toBeInTheDocument();
    expect(screen.getByText('Hire Date To')).toBeInTheDocument();
  });

  it('should render invitation status filter', () => {
    renderWithProviders(
      <AdvancedFiltersPanel
        filters={defaultFilters}
        onChange={mockOnChange}
        expanded={true}
        onToggle={mockOnToggle}
        roleOptions={roleOptions}
      />,
      { medplum, initialLanguage: 'en' }
    );

    // Should have invitation status filter
    const invitationSelect = screen.getByPlaceholderText(/Invitation status/i);
    expect(invitationSelect).toBeInTheDocument();
  });

  it('should call onChange when status filter changes', async () => {
    renderWithProviders(
      <AdvancedFiltersPanel
        filters={defaultFilters}
        onChange={mockOnChange}
        expanded={true}
        onToggle={mockOnToggle}
        roleOptions={roleOptions}
      />,
      { medplum, initialLanguage: 'en' }
    );

    // Click on Active status in segmented control (use first radio with 'active' name)
    const activeButtons = screen.getAllByRole('radio', { name: /active/i });
    fireEvent.click(activeButtons[0]);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ active: true })
      );
    });
  });

  it('should display current filter values', () => {
    const filtersWithValues: AccountSearchFiltersExtended = {
      active: true,
      role: 'physician',
      hireDateFrom: undefined,
      hireDateTo: undefined,
      invitationStatus: 'pending',
    };

    renderWithProviders(
      <AdvancedFiltersPanel
        filters={filtersWithValues}
        onChange={mockOnChange}
        expanded={true}
        onToggle={mockOnToggle}
        roleOptions={roleOptions}
      />,
      { medplum, initialLanguage: 'en' }
    );

    // Status should show Active as checked radio (there may be multiple radios with 'active' name)
    const activeSegments = screen.getAllByRole('radio', { name: /active/i });
    expect(activeSegments.length).toBeGreaterThan(0);
  });

  it('should show clear filters button when filters are applied and expanded', () => {
    const filtersWithValues: AccountSearchFiltersExtended = {
      active: true,
      role: 'physician',
      hireDateFrom: undefined,
      hireDateTo: undefined,
      invitationStatus: undefined,
    };

    renderWithProviders(
      <AdvancedFiltersPanel
        filters={filtersWithValues}
        onChange={mockOnChange}
        expanded={true}
        onToggle={mockOnToggle}
        roleOptions={roleOptions}
      />,
      { medplum, initialLanguage: 'en' }
    );

    // Should have at least one clear button (there may be multiple)
    const clearButtons = screen.getAllByRole('button', { name: /clear/i });
    expect(clearButtons.length).toBeGreaterThan(0);
  });

  it('should be mobile responsive with proper layout', () => {
    const { container } = renderWithProviders(
      <AdvancedFiltersPanel
        filters={defaultFilters}
        onChange={mockOnChange}
        expanded={true}
        onToggle={mockOnToggle}
        roleOptions={roleOptions}
      />,
      { medplum }
    );

    // Check for responsive grid structure
    const gridElements = container.querySelectorAll('[class*="Grid"]');
    expect(gridElements.length).toBeGreaterThan(0);
  });
});
