// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { renderHook, waitFor } from '@testing-library/react';
import { MedplumProvider } from '@medplum/react-hooks';
import { MantineProvider } from '@mantine/core';
import { MockClient } from '@medplum/mock';
import { usePermissionCheck } from './usePermissionCheck';
import { permissionCache } from '../services/permissionCacheService';
import { checkPermissionFromServer } from '../services/permissionService';
import { Practitioner } from '@medplum/fhirtypes';

// Mock permissionCache
jest.mock('../services/permissionCacheService', () => ({
  permissionCache: {
    get: jest.fn(),
    set: jest.fn(),
    recordCheck: jest.fn(),
    invalidate: jest.fn(),
  },
}));

// Mock permissionService
jest.mock('../services/permissionService', () => ({
  checkPermissionFromServer: jest.fn(),
}));

// Mock useMedplumProfile hook
const mockUseMedplumProfile = jest.fn();
jest.mock('@medplum/react-hooks', () => ({
  ...jest.requireActual('@medplum/react-hooks'),
  useMedplumProfile: () => mockUseMedplumProfile(),
}));

describe('usePermissionCheck', () => {
  let medplum: MockClient;
  let mockProfile: Practitioner;

  beforeEach(() => {
    medplum = new MockClient();
    mockProfile = {
      resourceType: 'Practitioner',
      id: 'practitioner-123',
      name: [{ given: ['Test'], family: 'User' }],
    };

    // Mock useMedplumProfile to return our test profile
    mockUseMedplumProfile.mockReturnValue(mockProfile);

    // Clear all mock calls (but keep the mock setup)
    (permissionCache.get as jest.Mock).mockClear();
    (permissionCache.set as jest.Mock).mockClear();
    (permissionCache.recordCheck as jest.Mock).mockClear();
    (checkPermissionFromServer as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MantineProvider>
      <MedplumProvider medplum={medplum}>{children}</MedplumProvider>
    </MantineProvider>
  );

  it('returns false (fail-closed) by default before loading', () => {
    // Mock cache miss
    (permissionCache.get as jest.Mock).mockReturnValue(null);

    // Mock server check to never resolve (simulate loading state)
    (checkPermissionFromServer as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => usePermissionCheck('view-patient-list'), { wrapper });

    // Should return false and loading=true initially
    expect(result.current.hasPermission).toBe(false);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('returns true when permission is granted', async () => {
    // Mock cache miss initially
    (permissionCache.get as jest.Mock).mockReturnValue(null);

    // Mock server check to return true (permission granted)
    (checkPermissionFromServer as jest.Mock).mockResolvedValue(true);

    const { result } = renderHook(() => usePermissionCheck('view-patient-list'), { wrapper });

    // Wait for the permission check to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should return true (permission granted)
    expect(result.current.hasPermission).toBe(true);
    expect(result.current.error).toBeNull();

    // Should have cached the result
    expect(permissionCache.set).toHaveBeenCalledWith('view-patient-list', true);

    // Should have recorded metrics
    expect(permissionCache.recordCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        hit: false,
        denied: false,
        latencyMs: expect.any(Number),
      })
    );
  });

  it('returns false when permission is denied', async () => {
    // Mock cache miss initially
    (permissionCache.get as jest.Mock).mockReturnValue(null);

    // Mock server check to return false (permission denied)
    (checkPermissionFromServer as jest.Mock).mockResolvedValue(false);

    const { result } = renderHook(() => usePermissionCheck('view-patient-list'), { wrapper });

    // Wait for the permission check to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should return false (permission denied)
    expect(result.current.hasPermission).toBe(false);
    expect(result.current.error).toBeNull();

    // Should have cached the result
    expect(permissionCache.set).toHaveBeenCalledWith('view-patient-list', false);

    // Should have recorded metrics with denied=true
    expect(permissionCache.recordCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        hit: false,
        denied: true,
        latencyMs: expect.any(Number),
      })
    );
  });

  it('uses cache for subsequent checks', async () => {
    // Mock cache hit with permission granted
    (permissionCache.get as jest.Mock).mockReturnValue(true);

    const { result } = renderHook(() => usePermissionCheck('view-patient-list'), { wrapper });

    // Wait for state update
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should return cached value immediately
    expect(result.current.hasPermission).toBe(true);
    expect(result.current.error).toBeNull();

    // Should NOT have called server
    expect(checkPermissionFromServer).not.toHaveBeenCalled();

    // Should have recorded cache hit metric
    expect(permissionCache.recordCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        hit: true,
        denied: false,
        latencyMs: expect.any(Number),
      })
    );
  });

  it('fails closed on API errors', async () => {
    // Mock cache miss initially
    (permissionCache.get as jest.Mock).mockReturnValue(null);

    // Mock server check to throw error
    const testError = new Error('API error');
    (checkPermissionFromServer as jest.Mock).mockRejectedValue(testError);

    const { result } = renderHook(() => usePermissionCheck('view-patient-list'), { wrapper });

    // Wait for error handling to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should fail closed (return false)
    expect(result.current.hasPermission).toBe(false);
    expect(result.current.error).toBe(testError);

    // Should NOT have set cache to true
    expect(permissionCache.set).not.toHaveBeenCalledWith('view-patient-list', true);

    // Should have recorded error metric
    expect(permissionCache.recordCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        hit: false,
        denied: true,
        latencyMs: expect.any(Number),
      })
    );
  });

  it('loading state is true initially', () => {
    // Mock cache miss
    (permissionCache.get as jest.Mock).mockReturnValue(null);

    // Mock server check to never resolve
    (checkPermissionFromServer as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => usePermissionCheck('view-patient-list'), { wrapper });

    // Loading should be true initially
    expect(result.current.loading).toBe(true);
    expect(result.current.hasPermission).toBe(false); // fail-closed
    expect(result.current.error).toBeNull();
  });

  it('returns false when profile is not available', async () => {
    // Mock profile as undefined
    mockUseMedplumProfile.mockReturnValue(undefined);

    const { result } = renderHook(() => usePermissionCheck('view-patient-list'), { wrapper });

    // Wait for state update
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should return false (no profile = no permissions)
    expect(result.current.hasPermission).toBe(false);
    expect(result.current.error).toBeNull();

    // Should NOT have called server or cache
    expect(checkPermissionFromServer).not.toHaveBeenCalled();
  });
});
