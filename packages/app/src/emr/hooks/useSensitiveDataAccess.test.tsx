// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { renderHook } from '@testing-library/react';
import { MedplumProvider } from '@medplum/react-hooks';
import { MockClient } from '@medplum/mock';
import { useSensitiveDataAccess } from './useSensitiveDataAccess';
import { usePermissionCheck } from './usePermissionCheck';
import type { SensitiveCategory } from '../types/permission-cache';

// Mock usePermissionCheck
jest.mock('./usePermissionCheck');

const mockUsePermissionCheck = usePermissionCheck as jest.MockedFunction<typeof usePermissionCheck>;

describe('useSensitiveDataAccess', () => {
  let medplum: MockClient;

  beforeEach(() => {
    medplum = new MockClient();
    jest.clearAllMocks();
  });

  function renderHookWithProviders(categories: SensitiveCategory[]) {
    return renderHook(() => useSensitiveDataAccess(categories), {
      wrapper: ({ children }) => <MedplumProvider medplum={medplum}>{children}</MedplumProvider>,
    });
  }

  it('should allow access when user has all required permissions', () => {
    // Mock all permissions as granted
    mockUsePermissionCheck.mockReturnValue({
      hasPermission: true,
      loading: false,
      error: null,
    });

    const { result } = renderHookWithProviders(['mental-health', 'hiv-status']);

    expect(result.current.canAccess).toBe(true);
    expect(result.current.restrictedCategory).toBeUndefined();
    expect(result.current.reason).toBeUndefined();
  });

  it('should deny access when user lacks mental-health permission', () => {
    // Mock mental-health as denied, others as granted
    mockUsePermissionCheck.mockImplementation((permissionCode: string) => {
      if (permissionCode === 'view-sensitive-mental-health') {
        return { hasPermission: false, loading: false, error: null };
      }
      return { hasPermission: true, loading: false, error: null };
    });

    const { result } = renderHookWithProviders(['mental-health']);

    expect(result.current.canAccess).toBe(false);
    expect(result.current.restrictedCategory).toBe('mental-health');
    expect(result.current.reason).toBe('Access to mental-health data requires special permission');
  });

  it('should deny access when user lacks hiv-status permission', () => {
    mockUsePermissionCheck.mockImplementation((permissionCode: string) => {
      if (permissionCode === 'view-sensitive-hiv') {
        return { hasPermission: false, loading: false, error: null };
      }
      return { hasPermission: true, loading: false, error: null };
    });

    const { result } = renderHookWithProviders(['hiv-status']);

    expect(result.current.canAccess).toBe(false);
    expect(result.current.restrictedCategory).toBe('hiv-status');
    expect(result.current.reason).toBe('Access to hiv-status data requires special permission');
  });

  it('should deny access when user lacks substance-abuse permission', () => {
    mockUsePermissionCheck.mockImplementation((permissionCode: string) => {
      if (permissionCode === 'view-sensitive-substance-abuse') {
        return { hasPermission: false, loading: false, error: null };
      }
      return { hasPermission: true, loading: false, error: null };
    });

    const { result } = renderHookWithProviders(['substance-abuse']);

    expect(result.current.canAccess).toBe(false);
    expect(result.current.restrictedCategory).toBe('substance-abuse');
  });

  it('should deny access when user lacks genetic-testing permission', () => {
    mockUsePermissionCheck.mockImplementation((permissionCode: string) => {
      if (permissionCode === 'view-sensitive-genetic') {
        return { hasPermission: false, loading: false, error: null };
      }
      return { hasPermission: true, loading: false, error: null };
    });

    const { result } = renderHookWithProviders(['genetic-testing']);

    expect(result.current.canAccess).toBe(false);
    expect(result.current.restrictedCategory).toBe('genetic-testing');
  });

  it('should deny access when user lacks reproductive-health permission', () => {
    mockUsePermissionCheck.mockImplementation((permissionCode: string) => {
      if (permissionCode === 'view-sensitive-reproductive') {
        return { hasPermission: false, loading: false, error: null };
      }
      return { hasPermission: true, loading: false, error: null };
    });

    const { result } = renderHookWithProviders(['reproductive-health']);

    expect(result.current.canAccess).toBe(false);
    expect(result.current.restrictedCategory).toBe('reproductive-health');
  });

  it('should deny access when user lacks vip-patient permission', () => {
    mockUsePermissionCheck.mockImplementation((permissionCode: string) => {
      if (permissionCode === 'view-sensitive-vip') {
        return { hasPermission: false, loading: false, error: null };
      }
      return { hasPermission: true, loading: false, error: null };
    });

    const { result } = renderHookWithProviders(['vip-patient']);

    expect(result.current.canAccess).toBe(false);
    expect(result.current.restrictedCategory).toBe('vip-patient');
  });

  it('should return first restricted category when multiple are denied', () => {
    // Deny all permissions
    mockUsePermissionCheck.mockReturnValue({
      hasPermission: false,
      loading: false,
      error: null,
    });

    const { result } = renderHookWithProviders(['mental-health', 'hiv-status', 'vip-patient']);

    expect(result.current.canAccess).toBe(false);
    expect(result.current.restrictedCategory).toBe('mental-health'); // First one in the array
  });

  it('should allow access when no categories are specified', () => {
    mockUsePermissionCheck.mockReturnValue({
      hasPermission: true,
      loading: false,
      error: null,
    });

    const { result } = renderHookWithProviders([]);

    expect(result.current.canAccess).toBe(true);
    expect(result.current.restrictedCategory).toBeUndefined();
  });

  it('should handle all 6 sensitive categories correctly', () => {
    // All permissions granted
    mockUsePermissionCheck.mockReturnValue({
      hasPermission: true,
      loading: false,
      error: null,
    });

    const allCategories: SensitiveCategory[] = [
      'mental-health',
      'hiv-status',
      'substance-abuse',
      'genetic-testing',
      'reproductive-health',
      'vip-patient',
    ];

    const { result } = renderHookWithProviders(allCategories);

    expect(result.current.canAccess).toBe(true);
  });
});
