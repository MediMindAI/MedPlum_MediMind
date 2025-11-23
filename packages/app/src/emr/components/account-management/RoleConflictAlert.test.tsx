// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { RoleConflictAlert } from './RoleConflictAlert';
import type { RoleConflict } from '../../types/account-management';

describe('RoleConflictAlert', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
  });

  it('should render nothing when no conflicts', () => {
    const { container } = renderWithProviders(<RoleConflictAlert conflicts={[]} />);

    // Container contains Mantine styles, so check for Alert component
    expect(container.querySelector('.mantine-Alert-root')).toBeNull();
  });

  it('should render nothing when conflicts is undefined', () => {
    const { container } = renderWithProviders(
      <RoleConflictAlert conflicts={undefined as unknown as RoleConflict[]} />
    );

    expect(container.querySelector('.mantine-Alert-root')).toBeNull();
  });

  it('should render separation_of_duties conflict with error style', () => {
    const conflicts: RoleConflict[] = [
      {
        type: 'separation_of_duties',
        roles: ['admin', 'billing'],
        message: 'Admin and billing roles should not be combined',
        severity: 'error',
      },
    ];

    renderWithProviders(<RoleConflictAlert conflicts={conflicts} />, { initialLanguage: 'en' });

    // Check for translated title or message content
    expect(screen.getByText('Admin and billing roles should not be combined')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('billing')).toBeInTheDocument();
  });

  it('should render redundant_roles conflict with warning style', () => {
    const conflicts: RoleConflict[] = [
      {
        type: 'redundant_roles',
        roles: ['superadmin', 'admin'],
        message: 'Superadmin already includes admin permissions',
        severity: 'warning',
      },
    ];

    renderWithProviders(<RoleConflictAlert conflicts={conflicts} />, { initialLanguage: 'en' });

    expect(screen.getByText('Superadmin already includes admin permissions')).toBeInTheDocument();
  });

  it('should render permission_conflict with warning style', () => {
    const conflicts: RoleConflict[] = [
      {
        type: 'permission_conflict',
        roles: ['viewer', 'editor'],
        message: 'Read-only and write roles conflict',
        severity: 'warning',
      },
    ];

    renderWithProviders(<RoleConflictAlert conflicts={conflicts} />, { initialLanguage: 'en' });

    expect(screen.getByText('Read-only and write roles conflict')).toBeInTheDocument();
  });

  it('should render multiple conflicts', () => {
    const conflicts: RoleConflict[] = [
      {
        type: 'separation_of_duties',
        roles: ['admin', 'billing'],
        message: 'Separation of duties violation',
        severity: 'error',
      },
      {
        type: 'redundant_roles',
        roles: ['superadmin', 'admin'],
        message: 'Redundant role detected',
        severity: 'warning',
      },
    ];

    renderWithProviders(<RoleConflictAlert conflicts={conflicts} />, { initialLanguage: 'en' });

    expect(screen.getByText('Separation of duties violation')).toBeInTheDocument();
    expect(screen.getByText('Redundant role detected')).toBeInTheDocument();
  });

  it('should display affected roles as badges', () => {
    const conflicts: RoleConflict[] = [
      {
        type: 'separation_of_duties',
        roles: ['admin', 'billing', 'finance'],
        message: 'Conflict detected',
        severity: 'error',
      },
    ];

    renderWithProviders(<RoleConflictAlert conflicts={conflicts} />, { initialLanguage: 'en' });

    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('billing')).toBeInTheDocument();
    expect(screen.getByText('finance')).toBeInTheDocument();
  });

  it('should show "Affected roles" label', () => {
    const conflicts: RoleConflict[] = [
      {
        type: 'redundant_roles',
        roles: ['admin'],
        message: 'Test message',
        severity: 'warning',
      },
    ];

    renderWithProviders(<RoleConflictAlert conflicts={conflicts} />, { initialLanguage: 'en' });

    expect(screen.getByText('Affected roles:')).toBeInTheDocument();
  });

  it('should use gradient for error severity', () => {
    const conflicts: RoleConflict[] = [
      {
        type: 'separation_of_duties',
        roles: ['admin'],
        message: 'Test',
        severity: 'error',
      },
    ];

    const { container } = renderWithProviders(
      <RoleConflictAlert conflicts={conflicts} />,
      { initialLanguage: 'en' }
    );

    const alert = container.querySelector('.mantine-Alert-root');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('style', expect.stringContaining('gradient'));
  });

  it('should use gradient for warning severity', () => {
    const conflicts: RoleConflict[] = [
      {
        type: 'redundant_roles',
        roles: ['admin'],
        message: 'Test',
        severity: 'warning',
      },
    ];

    const { container } = renderWithProviders(
      <RoleConflictAlert conflicts={conflicts} />,
      { initialLanguage: 'en' }
    );

    const alert = container.querySelector('.mantine-Alert-root');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('style', expect.stringContaining('gradient'));
  });

  it('should display appropriate icon for each conflict type', () => {
    const conflicts: RoleConflict[] = [
      {
        type: 'separation_of_duties',
        roles: ['admin'],
        message: 'Test',
        severity: 'error',
      },
    ];

    const { container } = renderWithProviders(
      <RoleConflictAlert conflicts={conflicts} />,
      { initialLanguage: 'en' }
    );

    // Alert should have an icon
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
