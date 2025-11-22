// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { renderHook, act, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MedplumProvider } from '@medplum/react-hooks';
import { MockClient } from '@medplum/mock';
import type { Practitioner } from '@medplum/fhirtypes';
import { useAccountList } from './useAccountList';

describe('useAccountList (T024)', () => {
  let medplum: MockClient;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MantineProvider>
      <MedplumProvider medplum={medplum}>{children}</MedplumProvider>
    </MantineProvider>
  );

  beforeEach(() => {
    medplum = new MockClient();
    localStorage.setItem('emrLanguage', 'ka');
  });

  it('should fetch accounts on mount', async () => {
    const mockPractitioners: Practitioner[] = [
      {
        resourceType: 'Practitioner',
        id: 'practitioner-1',
        name: [{ family: 'ხოზვრია', given: ['თენგიზი'] }],
        active: true,
      },
    ];

    medplum.searchResources = jest.fn().mockResolvedValue(mockPractitioners);

    const { result } = renderHook(() => useAccountList(), { wrapper });

    await waitFor(() => {
      expect(result.current.accounts.length).toBe(1);
      expect(result.current.loading).toBe(false);
    });

    expect(medplum.searchResources).toHaveBeenCalledWith(
      'Practitioner',
      expect.objectContaining({
        _count: '50',
        _sort: '-_lastUpdated',
      })
    );
  });

  it('should use cursor-based pagination with 50 results per page', async () => {
    medplum.searchResources = jest.fn().mockResolvedValue([]);

    renderHook(() => useAccountList(), { wrapper });

    await waitFor(() => {
      expect(medplum.searchResources).toHaveBeenCalledWith(
        'Practitioner',
        expect.objectContaining({
          _count: '50',
        })
      );
    });
  });

  it('should filter by name', async () => {
    medplum.searchResources = jest.fn().mockResolvedValue([]);

    const { result } = renderHook(() => useAccountList(), { wrapper });

    act(() => {
      result.current.setFilters({ name: 'თენგიზი' });
    });

    await waitFor(() => {
      expect(medplum.searchResources).toHaveBeenCalledWith(
        'Practitioner',
        expect.objectContaining({
          'name:contains': 'თენგიზი',
        })
      );
    });
  });

  it('should filter by email', async () => {
    medplum.searchResources = jest.fn().mockResolvedValue([]);

    const { result } = renderHook(() => useAccountList(), { wrapper });

    act(() => {
      result.current.setFilters({ email: 'tengizi@medimind.ge' });
    });

    await waitFor(() => {
      expect(medplum.searchResources).toHaveBeenCalledWith(
        'Practitioner',
        expect.objectContaining({
          email: 'tengizi@medimind.ge',
        })
      );
    });
  });

  it('should filter by active status', async () => {
    medplum.searchResources = jest.fn().mockResolvedValue([]);

    const { result } = renderHook(() => useAccountList(), { wrapper });

    act(() => {
      result.current.setFilters({ active: true });
    });

    await waitFor(() => {
      expect(medplum.searchResources).toHaveBeenCalledWith(
        'Practitioner',
        expect.objectContaining({
          active: 'true',
        })
      );
    });
  });

  it('should provide refresh function', async () => {
    const mockPractitioners: Practitioner[] = [
      {
        resourceType: 'Practitioner',
        id: 'practitioner-1',
        name: [{ family: 'Smith', given: ['John'] }],
        active: true,
      },
    ];

    medplum.searchResources = jest.fn().mockResolvedValue(mockPractitioners);

    const { result } = renderHook(() => useAccountList(), { wrapper });

    await waitFor(() => {
      expect(result.current.accounts.length).toBe(1);
    });

    act(() => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(medplum.searchResources).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle loading state', async () => {
    medplum.searchResources = jest
      .fn()
      .mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve([]), 100)));

    const { result } = renderHook(() => useAccountList(), { wrapper });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle errors gracefully', async () => {
    medplum.searchResources = jest.fn().mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useAccountList(), { wrapper });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.loading).toBe(false);
    });
  });

  it('should convert Practitioner resources to AccountRow format', async () => {
    const mockPractitioners: Practitioner[] = [
      {
        resourceType: 'Practitioner',
        id: 'practitioner-1',
        name: [{ family: 'ხოზვრია', given: ['თენგიზი'], use: 'official' }],
        telecom: [
          { system: 'email', value: 'tengizi@medimind.ge', use: 'work' },
          { system: 'phone', value: '+995500050610', use: 'work' },
        ],
        active: true,
      },
    ];

    medplum.searchResources = jest.fn().mockResolvedValue(mockPractitioners);

    const { result } = renderHook(() => useAccountList(), { wrapper });

    await waitFor(() => {
      expect(result.current.accounts[0]).toEqual(
        expect.objectContaining({
          id: 'practitioner-1',
          name: 'ხოზვრია თენგიზი',
          email: 'tengizi@medimind.ge',
          phone: '+995500050610',
          active: true,
        })
      );
    });
  });

  it('should debounce search filters to reduce API calls', async () => {
    jest.useFakeTimers();
    medplum.searchResources = jest.fn().mockResolvedValue([]);

    const { result } = renderHook(() => useAccountList(), { wrapper });

    // Rapidly change filters
    act(() => {
      result.current.setFilters({ name: 'T' });
    });
    act(() => {
      result.current.setFilters({ name: 'Te' });
    });
    act(() => {
      result.current.setFilters({ name: 'Ten' });
    });

    // Fast-forward debounce timer
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      // Should only call once after debounce
      expect(medplum.searchResources).toHaveBeenCalledTimes(1);
    });

    jest.useRealTimers();
  });
});
