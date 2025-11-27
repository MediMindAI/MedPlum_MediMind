// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { renderHook, waitFor } from '@testing-library/react';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react-hooks';
import { useActionPermission } from './useActionPermission';
import { permissionCache } from '../services/permissionCacheService';
import { ReactNode } from 'react';

// Mock the permission check hook
jest.mock('./usePermissionCheck', () => ({
  usePermissionCheck: jest.fn(),
}));

const mockUsePermissionCheck = jest.requireMock('./usePermissionCheck').usePermissionCheck;

describe('useActionPermission', () => {
  let medplum: MockClient;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <MedplumProvider medplum={medplum}>{children}</MedplumProvider>
  );

  beforeEach(() => {
    medplum = new MockClient();
    permissionCache.invalidate();
    jest.clearAllMocks();

    // Default: all permissions denied
    mockUsePermissionCheck.mockReturnValue({
      hasPermission: false,
      loading: false,
      error: null,
    });
  });

  it('should return all CRUD permissions for a resource', async () => {
    // Setup: user has all patient permissions
    mockUsePermissionCheck.mockImplementation((permissionCode: string) => {
      const hasPermission = [
        'view-patient',
        'create-patient',
        'edit-patient',
        'delete-patient',
      ].includes(permissionCode);

      return {
        hasPermission,
        loading: false,
        error: null,
      };
    });

    const { result } = renderHook(() => useActionPermission('patient'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.canView).toBe(true);
    expect(result.current.canCreate).toBe(true);
    expect(result.current.canEdit).toBe(true);
    expect(result.current.canDelete).toBe(true);
  });

  it('should return partial permissions when user has only some permissions', async () => {
    // Setup: user has view and create, but not edit or delete
    mockUsePermissionCheck.mockImplementation((permissionCode: string) => {
      const hasPermission = ['view-encounter', 'create-encounter'].includes(permissionCode);

      return {
        hasPermission,
        loading: false,
        error: null,
      };
    });

    const { result } = renderHook(() => useActionPermission('encounter'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.canView).toBe(true);
    expect(result.current.canCreate).toBe(true);
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canDelete).toBe(false);
  });

  it('should return false for all permissions when user has no permissions', async () => {
    // All permissions denied (default mock)
    const { result } = renderHook(() => useActionPermission('invoice'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.canView).toBe(false);
    expect(result.current.canCreate).toBe(false);
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canDelete).toBe(false);
  });

  it('should show loading state while checking permissions', async () => {
    mockUsePermissionCheck.mockReturnValue({
      hasPermission: false,
      loading: true,
      error: null,
    });

    const { result } = renderHook(() => useActionPermission('patient'), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.canView).toBe(false);
    expect(result.current.canCreate).toBe(false);
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canDelete).toBe(false);
  });

  it('should implement fail-closed behavior on error', async () => {
    mockUsePermissionCheck.mockReturnValue({
      hasPermission: false,
      loading: false,
      error: new Error('Permission check failed'),
    });

    const { result } = renderHook(() => useActionPermission('patient'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // All permissions should be false (fail-closed)
    expect(result.current.canView).toBe(false);
    expect(result.current.canCreate).toBe(false);
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canDelete).toBe(false);
  });

  it('should construct correct permission codes with resource prefix', async () => {
    const { result } = renderHook(() => useActionPermission('claim'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify correct permission codes were checked
    expect(mockUsePermissionCheck).toHaveBeenCalledWith('view-claim');
    expect(mockUsePermissionCheck).toHaveBeenCalledWith('create-claim');
    expect(mockUsePermissionCheck).toHaveBeenCalledWith('edit-claim');
    expect(mockUsePermissionCheck).toHaveBeenCalledWith('delete-claim');
  });

  it('should memoize results to prevent unnecessary re-renders', async () => {
    mockUsePermissionCheck.mockReturnValue({
      hasPermission: true,
      loading: false,
      error: null,
    });

    const { result, rerender } = renderHook(() => useActionPermission('patient'), { wrapper });

    const firstResult = result.current;

    // Rerender without changing props
    rerender();

    // Result object should be the same (memoized)
    expect(result.current).toBe(firstResult);
  });

  it('should handle loading state from any individual permission check', async () => {
    // Setup: one permission is still loading
    mockUsePermissionCheck.mockImplementation((permissionCode: string) => {
      if (permissionCode === 'delete-patient') {
        return { hasPermission: false, loading: true, error: null };
      }
      return { hasPermission: true, loading: false, error: null };
    });

    const { result } = renderHook(() => useActionPermission('patient'), { wrapper });

    // Should show loading if ANY permission is loading
    expect(result.current.loading).toBe(true);
  });
});
