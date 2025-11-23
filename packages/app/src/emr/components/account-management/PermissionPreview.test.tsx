// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { PermissionPreview } from './PermissionPreview';
import type { PermissionRow } from '../../types/account-management';

describe('PermissionPreview', () => {
  const mockPermissions: PermissionRow[] = [
    { resourceType: 'Patient', create: true, read: true, update: true, delete: false, search: true },
    { resourceType: 'Practitioner', create: false, read: true, update: false, delete: false, search: true },
    { resourceType: 'Observation', create: false, read: false, update: false, delete: false, search: false },
  ];

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
  });

  it('should render accordion with title', () => {
    renderWithProviders(<PermissionPreview permissions={mockPermissions} />, { initialLanguage: 'en' });

    expect(screen.getByText('Permissions')).toBeInTheDocument();
  });

  it('should show resource count badge', () => {
    renderWithProviders(<PermissionPreview permissions={mockPermissions} />, { initialLanguage: 'en' });

    // 2 resources with permissions (Patient and Practitioner, Observation has none)
    expect(screen.getByText('2 resources')).toBeInTheDocument();
  });

  it('should show total permission count badge', () => {
    renderWithProviders(<PermissionPreview permissions={mockPermissions} />, { initialLanguage: 'en' });

    // Patient: 4 (create, read, update, search) + Practitioner: 2 (read, search) = 6
    expect(screen.getByText('6 permissions')).toBeInTheDocument();
  });

  it('should expand accordion when clicked', () => {
    renderWithProviders(<PermissionPreview permissions={mockPermissions} />, { initialLanguage: 'en' });

    const accordionControl = screen.getByRole('button');
    fireEvent.click(accordionControl);

    // Should show resource types
    expect(screen.getByText('Patient')).toBeInTheDocument();
    expect(screen.getByText('Practitioner')).toBeInTheDocument();
  });

  it('should be expanded by default when defaultExpanded is true', () => {
    renderWithProviders(
      <PermissionPreview permissions={mockPermissions} defaultExpanded />,
      { initialLanguage: 'en' }
    );

    // Should show resource types immediately
    expect(screen.getByText('Patient')).toBeInTheDocument();
    expect(screen.getByText('Practitioner')).toBeInTheDocument();
  });

  it('should not show resources with no permissions', () => {
    renderWithProviders(
      <PermissionPreview permissions={mockPermissions} defaultExpanded />,
      { initialLanguage: 'en' }
    );

    // Observation has no permissions, should not be shown
    expect(screen.queryByText('Observation')).not.toBeInTheDocument();
  });

  it('should show operation badges for enabled permissions', () => {
    renderWithProviders(
      <PermissionPreview permissions={mockPermissions} defaultExpanded />,
      { initialLanguage: 'en' }
    );

    // Patient has create, read, update, search enabled
    const createBadges = screen.getAllByText('Create');
    expect(createBadges.length).toBeGreaterThan(0);

    const readBadges = screen.getAllByText('Read');
    expect(readBadges.length).toBeGreaterThan(0);
  });

  it('should show empty state when no permissions', () => {
    const emptyPermissions: PermissionRow[] = [
      { resourceType: 'Patient', create: false, read: false, update: false, delete: false, search: false },
    ];

    renderWithProviders(
      <PermissionPreview permissions={emptyPermissions} defaultExpanded />,
      { initialLanguage: 'en' }
    );

    expect(screen.getByText(/no permissions selected/i)).toBeInTheDocument();
  });

  it('should show custom title when provided', () => {
    renderWithProviders(
      <PermissionPreview permissions={mockPermissions} title="Custom Title" />,
      { initialLanguage: 'en' }
    );

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('should show loading skeleton when loading', () => {
    const { container } = renderWithProviders(
      <PermissionPreview permissions={[]} loading />,
      { initialLanguage: 'en' }
    );

    expect(container.querySelectorAll('.mantine-Skeleton-root').length).toBeGreaterThan(0);
  });

  it('should handle empty permissions array', () => {
    renderWithProviders(
      <PermissionPreview permissions={[]} defaultExpanded />,
      { initialLanguage: 'en' }
    );

    expect(screen.getByText('0 resources')).toBeInTheDocument();
    expect(screen.getByText('0 permissions')).toBeInTheDocument();
  });

  it('should use accordion variant', () => {
    const { container } = renderWithProviders(
      <PermissionPreview permissions={mockPermissions} />,
      { initialLanguage: 'en' }
    );

    // Check accordion structure
    expect(container.querySelector('.mantine-Accordion-root')).toBeInTheDocument();
  });
});
