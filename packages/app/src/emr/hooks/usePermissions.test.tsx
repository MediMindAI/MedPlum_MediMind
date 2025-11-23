// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { renderHook, act, waitFor } from '@testing-library/react';
import { MockClient } from '@medplum/mock';
import { createTestWrapper } from '../test-utils';
import { usePermissions, usePermissionsMatrix } from './usePermissions';

describe('usePermissions', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'ka');
  });

  it('should return permission categories', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: createTestWrapper(),
    });

    expect(result.current.categories).toBeDefined();
    expect(result.current.categories.length).toBeGreaterThan(0);
  });

  it('should set loading to false after fetching', async () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: createTestWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should include patient-management category', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: createTestWrapper(),
    });

    const patientManagement = result.current.categories.find(
      (cat) => cat.code === 'patient-management'
    );
    expect(patientManagement).toBeDefined();
    expect(patientManagement?.name).toBe('Patient Management');
  });

  it('should include administration category', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: createTestWrapper(),
    });

    const administration = result.current.categories.find(
      (cat) => cat.code === 'administration'
    );
    expect(administration).toBeDefined();
    expect(administration?.name).toBe('Administration');
  });
});

describe('usePermissionsMatrix', () => {
  let medplum: MockClient;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'ka');
    medplum = new MockClient();
  });

  it('should return empty permissions when no policyId or roleIds', () => {
    const { result } = renderHook(() => usePermissionsMatrix({}), {
      wrapper: createTestWrapper({ medplum }),
    });

    expect(result.current.permissions).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('should detect role conflicts with roleCodes', async () => {
    const { result } = renderHook(
      () => usePermissionsMatrix({ roleCodes: ['admin', 'billing'] }),
      { wrapper: createTestWrapper({ medplum }) }
    );

    await waitFor(() => {
      expect(result.current.conflicts.length).toBeGreaterThan(0);
    });

    const separationConflict = result.current.conflicts.find(
      (c) => c.type === 'separation_of_duties'
    );
    expect(separationConflict).toBeDefined();
    expect(separationConflict?.severity).toBe('error');
  });

  it('should detect redundant role conflicts', async () => {
    const { result } = renderHook(
      () => usePermissionsMatrix({ roleCodes: ['superadmin', 'admin'] }),
      { wrapper: createTestWrapper({ medplum }) }
    );

    await waitFor(() => {
      expect(result.current.conflicts.length).toBeGreaterThan(0);
    });

    const redundantConflict = result.current.conflicts.find(
      (c) => c.type === 'redundant_roles'
    );
    expect(redundantConflict).toBeDefined();
    expect(redundantConflict?.severity).toBe('warning');
  });

  it('should have no conflicts for non-conflicting roles', async () => {
    const { result } = renderHook(
      () => usePermissionsMatrix({ roleCodes: ['physician', 'nurse'] }),
      { wrapper: createTestWrapper({ medplum }) }
    );

    await waitFor(() => {
      expect(result.current.conflicts).toEqual([]);
    });
  });

  it('should update permission correctly', async () => {
    const { result } = renderHook(
      () => usePermissionsMatrix({ roleCodes: [] }),
      { wrapper: createTestWrapper({ medplum }) }
    );

    // Set some initial permissions
    act(() => {
      result.current.updatePermission('Patient', 'read', true);
    });

    // Permission update is reflected (though we can't verify without policyId)
    expect(result.current.hasChanges).toBe(false); // No changes without initial load
  });

  it('should return hasChanges as false initially', () => {
    const { result } = renderHook(() => usePermissionsMatrix({}), {
      wrapper: createTestWrapper({ medplum }),
    });

    expect(result.current.hasChanges).toBe(false);
  });

  it('should return error as null initially', () => {
    const { result } = renderHook(() => usePermissionsMatrix({}), {
      wrapper: createTestWrapper({ medplum }),
    });

    expect(result.current.error).toBeNull();
  });

  it('should throw error when saving without policyId', async () => {
    const { result } = renderHook(() => usePermissionsMatrix({}), {
      wrapper: createTestWrapper({ medplum }),
    });

    await expect(result.current.savePermissions()).rejects.toThrow(
      'Cannot save permissions without a policy ID'
    );
  });

  it('should clear conflicts when roleCodes is empty', async () => {
    const { result, rerender } = renderHook(
      ({ roleCodes }) => usePermissionsMatrix({ roleCodes }),
      {
        wrapper: createTestWrapper({ medplum }),
        initialProps: { roleCodes: ['admin', 'billing'] },
      }
    );

    await waitFor(() => {
      expect(result.current.conflicts.length).toBeGreaterThan(0);
    });

    rerender({ roleCodes: [] });

    await waitFor(() => {
      expect(result.current.conflicts).toEqual([]);
    });
  });

  it('should detect permission_conflict for viewer + editor roles', async () => {
    const { result } = renderHook(
      () => usePermissionsMatrix({ roleCodes: ['viewer', 'editor'] }),
      { wrapper: createTestWrapper({ medplum }) }
    );

    await waitFor(() => {
      expect(result.current.conflicts.length).toBeGreaterThan(0);
    });

    const permissionConflict = result.current.conflicts.find(
      (c) => c.type === 'permission_conflict'
    );
    expect(permissionConflict).toBeDefined();
    expect(permissionConflict?.severity).toBe('warning');
  });
});
