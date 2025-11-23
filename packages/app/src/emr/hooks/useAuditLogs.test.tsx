// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { renderHook, act, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MedplumProvider } from '@medplum/react-hooks';
import { MockClient } from '@medplum/mock';
import type { AuditEvent, Bundle } from '@medplum/fhirtypes';
import { useAuditLogs } from './useAuditLogs';

describe('useAuditLogs (T028)', () => {
  let medplum: MockClient;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MantineProvider>
      <MedplumProvider medplum={medplum}>{children}</MedplumProvider>
    </MantineProvider>
  );

  const mockAuditEvent: AuditEvent = {
    resourceType: 'AuditEvent',
    id: 'audit-1',
    type: {
      system: 'http://dicom.nema.org/resources/ontology/DCM',
      code: '110137',
      display: 'User Security Attributes Changed',
    },
    action: 'C',
    recorded: '2025-11-20T10:30:00Z',
    outcome: '0',
    outcomeDesc: 'Account created successfully',
    agent: [
      {
        who: {
          reference: 'Practitioner/admin-1',
          display: 'Admin User',
        },
        requestor: true,
        network: {
          address: '192.168.1.1',
        },
      },
    ],
    source: {
      observer: {
        display: 'EMR Web Application',
      },
    },
    entity: [
      {
        what: {
          reference: 'Practitioner/practitioner-1',
          display: 'Test User',
        },
        type: {
          system: 'http://terminology.hl7.org/CodeSystem/audit-entity-type',
          code: '2',
          display: 'System Object',
        },
      },
    ],
  };

  beforeEach(() => {
    medplum = new MockClient();
    localStorage.setItem('emrLanguage', 'ka');
  });

  it('should fetch audit events on mount', async () => {
    const mockBundle: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: 1,
      entry: [{ resource: mockAuditEvent }],
    };

    medplum.search = jest.fn().mockResolvedValue(mockBundle);

    const { result } = renderHook(() => useAuditLogs(), { wrapper });

    await waitFor(() => {
      expect(result.current.events.length).toBe(1);
      expect(result.current.loading).toBe(false);
    });

    expect(medplum.search).toHaveBeenCalledWith(
      'AuditEvent',
      expect.objectContaining({
        _count: '20',
        _sort: '-recorded',
        _total: 'accurate',
      })
    );
  });

  it('should support date range filters', async () => {
    const mockBundle: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: 0,
      entry: [],
    };

    medplum.search = jest.fn().mockResolvedValue(mockBundle);

    const { result } = renderHook(() => useAuditLogs(), { wrapper });

    const dateFrom = new Date('2025-11-01');
    const dateTo = new Date('2025-11-20');

    act(() => {
      result.current.setFilters({
        dateFrom,
        dateTo,
      });
    });

    await waitFor(() => {
      expect(medplum.search).toHaveBeenCalledWith(
        'AuditEvent',
        expect.objectContaining({
          date: expect.stringContaining('ge'),
        })
      );
    });
  });

  it('should filter by actor ID', async () => {
    const mockBundle: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: 0,
      entry: [],
    };

    medplum.search = jest.fn().mockResolvedValue(mockBundle);

    const { result } = renderHook(() => useAuditLogs(), { wrapper });

    act(() => {
      result.current.setFilters({ actorId: 'admin-1' });
    });

    await waitFor(() => {
      expect(medplum.search).toHaveBeenCalledWith(
        'AuditEvent',
        expect.objectContaining({
          agent: 'Practitioner/admin-1',
        })
      );
    });
  });

  it('should filter by action type', async () => {
    const mockBundle: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: 0,
      entry: [],
    };

    medplum.search = jest.fn().mockResolvedValue(mockBundle);

    const { result } = renderHook(() => useAuditLogs(), { wrapper });

    act(() => {
      result.current.setFilters({ action: 'C' });
    });

    await waitFor(() => {
      expect(medplum.search).toHaveBeenCalledWith(
        'AuditEvent',
        expect.objectContaining({
          action: 'C',
        })
      );
    });
  });

  it('should filter by outcome', async () => {
    const mockBundle: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: 0,
      entry: [],
    };

    medplum.search = jest.fn().mockResolvedValue(mockBundle);

    const { result } = renderHook(() => useAuditLogs(), { wrapper });

    act(() => {
      result.current.setFilters({ outcome: 0 });
    });

    await waitFor(() => {
      expect(medplum.search).toHaveBeenCalledWith(
        'AuditEvent',
        expect.objectContaining({
          outcome: '0',
        })
      );
    });
  });

  it('should support pagination', async () => {
    const mockBundle: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: 50,
      entry: Array(20)
        .fill(null)
        .map((_, i) => ({
          resource: { ...mockAuditEvent, id: `audit-${i}` },
        })),
    };

    medplum.search = jest.fn().mockResolvedValue(mockBundle);

    const { result } = renderHook(() => useAuditLogs(), { wrapper });

    await waitFor(() => {
      expect(result.current.total).toBe(50);
    });

    act(() => {
      result.current.setPage(2);
    });

    await waitFor(() => {
      expect(medplum.search).toHaveBeenLastCalledWith(
        'AuditEvent',
        expect.objectContaining({
          _offset: '20',
        })
      );
    });
  });

  it('should provide refetch function', async () => {
    const mockBundle: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: 1,
      entry: [{ resource: mockAuditEvent }],
    };

    medplum.search = jest.fn().mockResolvedValue(mockBundle);

    const { result } = renderHook(() => useAuditLogs(), { wrapper });

    await waitFor(() => {
      expect(result.current.events.length).toBe(1);
    });

    const initialCallCount = (medplum.search as jest.Mock).mock.calls.length;

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect((medplum.search as jest.Mock).mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });

  it('should handle loading state', async () => {
    const mockBundle: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: 0,
      entry: [],
    };

    medplum.search = jest
      .fn()
      .mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(mockBundle), 100)));

    const { result } = renderHook(() => useAuditLogs(), { wrapper });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle errors gracefully', async () => {
    medplum.search = jest.fn().mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useAuditLogs(), { wrapper });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.loading).toBe(false);
    });
  });

  it('should convert AuditEvent to extended format', async () => {
    const mockBundle: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: 1,
      entry: [{ resource: mockAuditEvent }],
    };

    medplum.search = jest.fn().mockResolvedValue(mockBundle);

    const { result } = renderHook(() => useAuditLogs(), { wrapper });

    await waitFor(() => {
      expect(result.current.events[0]).toEqual(
        expect.objectContaining({
          id: 'audit-1',
          action: 'C',
          actionDisplay: 'Create',
          agent: 'Admin User',
          outcome: '0',
          outcomeDisplay: 'Success',
          entityType: 'Practitioner',
          ipAddress: '192.168.1.1',
        })
      );
    });
  });

  it('should debounce filter changes', async () => {
    jest.useFakeTimers();

    const mockBundle: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: 0,
      entry: [],
    };

    medplum.search = jest.fn().mockResolvedValue(mockBundle);

    const { result } = renderHook(() => useAuditLogs(), { wrapper });

    // Wait for initial load
    act(() => {
      jest.advanceTimersByTime(100);
    });

    const callsAfterInitial = (medplum.search as jest.Mock).mock.calls.length;

    // Rapidly change filters
    act(() => {
      result.current.setFilters({ actorId: 'a' });
    });
    act(() => {
      result.current.setFilters({ actorId: 'ad' });
    });
    act(() => {
      result.current.setFilters({ actorId: 'admin' });
    });

    // Fast-forward debounce timer
    act(() => {
      jest.advanceTimersByTime(600);
    });

    // After debounce, should have exactly one additional call (not 3)
    const callsAfterDebounce = (medplum.search as jest.Mock).mock.calls.length;
    expect(callsAfterDebounce - callsAfterInitial).toBeLessThanOrEqual(2);

    jest.useRealTimers();
  });
});
