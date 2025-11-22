// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { renderHook, waitFor, act } from '@testing-library/react';
import { MedplumProvider } from '@medplum/react-hooks';
import { MockClient } from '@medplum/mock';
import type { ReactNode } from 'react';
import { useRoles } from './useRoles';
import { createRole } from '../services/roleService';

describe('useRoles', () => {
  let medplum: MockClient;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <MedplumProvider medplum={medplum}>{children}</MedplumProvider>
  );

  beforeEach(() => {
    medplum = new MockClient();
  });

  it('should fetch all roles', async () => {
    // Create test roles
    await createRole(medplum, {
      code: 'physician',
      name: 'Physician',
      status: 'active',
      permissions: ['view-patient-demographics'],
    });

    await createRole(medplum, {
      code: 'nurse',
      name: 'Nurse',
      status: 'active',
      permissions: ['view-patient-list'],
    });

    const { result } = renderHook(() => useRoles(), { wrapper });

    // Initially loading
    expect(result.current.loading).toBe(true);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.roles.length).toBeGreaterThanOrEqual(2);
    expect(result.current.error).toBeNull();
  });

  it('should filter roles by name', async () => {
    await createRole(medplum, {
      code: 'physician',
      name: 'Physician',
      status: 'active',
      permissions: ['view-patient-demographics'],
    });

    await createRole(medplum, {
      code: 'nurse',
      name: 'Nurse',
      status: 'active',
      permissions: ['view-patient-list'],
    });

    const { result } = renderHook(() => useRoles({ name: 'Physician' }), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.roles.length).toBeGreaterThan(0);
    expect(result.current.roles[0].name).toBe('Physician');
  });

  it('should filter roles by status', async () => {
    await createRole(medplum, {
      code: 'active-role',
      name: 'Active Role',
      status: 'active',
      permissions: ['view-patient-list'],
    });

    await createRole(medplum, {
      code: 'inactive-role',
      name: 'Inactive Role',
      status: 'inactive',
      permissions: ['view-patient-list'],
    });

    const { result } = renderHook(() => useRoles({ status: 'active' }), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.roles.length).toBeGreaterThanOrEqual(1);
    result.current.roles.forEach((role) => {
      expect(role.status).toBe('active');
    });
  });

  it('should handle errors gracefully', async () => {
    // Mock a failed search
    const mockSearch = jest.spyOn(medplum, 'search').mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useRoles(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.message).toBe('Network error');

    mockSearch.mockRestore();
  });

  it('should refresh roles when refresh is called', async () => {
    const { result } = renderHook(() => useRoles(), { wrapper });

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialRoleCount = result.current.roles.length;

    // Create a new role
    await createRole(medplum, {
      code: 'new-role',
      name: 'New Role',
      status: 'active',
      permissions: ['view-patient-list'],
    });

    // Refresh
    await act(async () => {
      await result.current.refresh();
    });

    // Wait for refresh to complete
    await waitFor(() => {
      expect(result.current.roles.length).toBeGreaterThan(initialRoleCount);
    });
  });
});
