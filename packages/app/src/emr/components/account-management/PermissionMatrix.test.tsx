// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { PermissionMatrix } from './PermissionMatrix';
import type { PermissionRow } from '../../types/account-management';

describe('PermissionMatrix', () => {
  const mockPermissions: PermissionRow[] = [
    { resourceType: 'Patient', create: true, read: true, update: true, delete: false, search: true },
    { resourceType: 'Practitioner', create: false, read: true, update: false, delete: false, search: true },
    { resourceType: 'Observation', create: false, read: false, update: false, delete: false, search: false },
  ];

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
  });

  it('should render permission matrix table', () => {
    renderWithProviders(<PermissionMatrix permissions={mockPermissions} />, { initialLanguage: 'en' });

    expect(screen.getByText('Permission Matrix')).toBeInTheDocument();
    expect(screen.getByText('Patient')).toBeInTheDocument();
    expect(screen.getByText('Practitioner')).toBeInTheDocument();
  });

  it('should render column headers for operations', () => {
    renderWithProviders(<PermissionMatrix permissions={mockPermissions} />, { initialLanguage: 'en' });

    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Read')).toBeInTheDocument();
    expect(screen.getByText('Update')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('should display checkboxes for each permission', () => {
    renderWithProviders(<PermissionMatrix permissions={mockPermissions} />, { initialLanguage: 'en' });

    // Patient has create, read, update, search enabled
    const patientCreateCheckbox = screen.getByRole('checkbox', { name: 'Patient create' });
    expect(patientCreateCheckbox).toBeChecked();

    const patientDeleteCheckbox = screen.getByRole('checkbox', { name: 'Patient delete' });
    expect(patientDeleteCheckbox).not.toBeChecked();
  });

  it('should call onPermissionChange when checkbox is toggled', () => {
    const handleChange = jest.fn();

    renderWithProviders(
      <PermissionMatrix permissions={mockPermissions} onPermissionChange={handleChange} />,
      { initialLanguage: 'en' }
    );

    const patientDeleteCheckbox = screen.getByRole('checkbox', { name: 'Patient delete' });
    fireEvent.click(patientDeleteCheckbox);

    expect(handleChange).toHaveBeenCalledWith('Patient', 'delete', true);
  });

  it('should disable checkboxes when readOnly is true', () => {
    renderWithProviders(<PermissionMatrix permissions={mockPermissions} readOnly />, { initialLanguage: 'en' });

    const patientCreateCheckbox = screen.getByRole('checkbox', { name: 'Patient create' });
    expect(patientCreateCheckbox).toBeDisabled();
  });

  it('should not call onPermissionChange when readOnly', () => {
    const handleChange = jest.fn();

    renderWithProviders(
      <PermissionMatrix permissions={mockPermissions} readOnly onPermissionChange={handleChange} />,
      { initialLanguage: 'en' }
    );

    const patientDeleteCheckbox = screen.getByRole('checkbox', { name: 'Patient delete' });
    fireEvent.click(patientDeleteCheckbox);

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should show loading skeleton when loading', () => {
    const { container } = renderWithProviders(
      <PermissionMatrix permissions={[]} loading />,
      { initialLanguage: 'en' }
    );

    // Check for skeleton elements
    expect(container.querySelectorAll('.mantine-Skeleton-root').length).toBeGreaterThan(0);
  });

  it('should show save button when onSave is provided', () => {
    const handleSave = jest.fn();

    renderWithProviders(
      <PermissionMatrix permissions={mockPermissions} onSave={handleSave} hasChanges />,
      { initialLanguage: 'en' }
    );

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('should disable save button when no changes', () => {
    const handleSave = jest.fn();

    renderWithProviders(
      <PermissionMatrix permissions={mockPermissions} onSave={handleSave} hasChanges={false} />,
      { initialLanguage: 'en' }
    );

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('should call onSave when save button is clicked', async () => {
    const handleSave = jest.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <PermissionMatrix permissions={mockPermissions} onSave={handleSave} hasChanges />,
      { initialLanguage: 'en' }
    );

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalled();
  });

  it('should show refresh button when onRefresh is provided', () => {
    const handleRefresh = jest.fn();

    renderWithProviders(
      <PermissionMatrix permissions={mockPermissions} onRefresh={handleRefresh} />,
      { initialLanguage: 'en' }
    );

    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
  });

  it('should show unsaved changes indicator when hasChanges is true', () => {
    renderWithProviders(
      <PermissionMatrix permissions={mockPermissions} hasChanges />,
      { initialLanguage: 'en' }
    );

    expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
  });

  it('should render resource types from PERMISSION_RESOURCES', () => {
    renderWithProviders(<PermissionMatrix permissions={mockPermissions} />, { initialLanguage: 'en' });

    expect(screen.getByText('Patient')).toBeInTheDocument();
    expect(screen.getByText('Practitioner')).toBeInTheDocument();
    expect(screen.getByText('Observation')).toBeInTheDocument();
  });

  it('should work with empty permissions array', () => {
    renderWithProviders(<PermissionMatrix permissions={[]} />, { initialLanguage: 'en' });

    // Should still render resource types with all unchecked
    const patientCreateCheckbox = screen.getByRole('checkbox', { name: 'Patient create' });
    expect(patientCreateCheckbox).not.toBeChecked();
  });
});
