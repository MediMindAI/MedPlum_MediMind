// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { renderHook, act, waitFor } from '@testing-library/react';
import { usePermissionMetrics } from './usePermissionMetrics';
import { permissionCache } from '../services/permissionCacheService';

describe('usePermissionMetrics', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Clear cache and reset metrics to ensure test isolation
    permissionCache.invalidate();
    // Reset metrics by accessing private property (for testing purposes only)
    (permissionCache as any).metrics = {
      totalChecks: 0,
      cacheHits: 0,
      cacheMisses: 0,
      denials: 0,
      errors: 0,
      avgLatencyMs: 0,
      lastUpdated: Date.now(),
    };
    (permissionCache as any).latencies = [];
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns initial metrics on mount', () => {
    const { result } = renderHook(() => usePermissionMetrics());

    expect(result.current.metrics).toBeDefined();
    expect(result.current.metrics.totalChecks).toBe(0);
    expect(result.current.metrics.cacheHits).toBe(0);
    expect(result.current.metrics.cacheMisses).toBe(0);
    expect(result.current.metrics.denials).toBe(0);
    expect(result.current.metrics.errors).toBe(0);
    expect(result.current.metrics.avgLatencyMs).toBe(0);
  });

  it('provides refresh function', () => {
    const { result } = renderHook(() => usePermissionMetrics());

    expect(result.current.refresh).toBeDefined();
    expect(typeof result.current.refresh).toBe('function');
  });

  it('calculates hit rate correctly', () => {
    // Record some checks
    permissionCache.recordCheck({ hit: true, denied: false, latencyMs: 5 });
    permissionCache.recordCheck({ hit: true, denied: false, latencyMs: 5 });
    permissionCache.recordCheck({ hit: false, denied: false, latencyMs: 50 });

    const { result } = renderHook(() => usePermissionMetrics());

    expect(result.current.hitRate).toBeCloseTo(2 / 3); // 2 hits out of 3 checks
  });

  it('calculates denial rate correctly', () => {
    // Record some checks with denials
    permissionCache.recordCheck({ hit: true, denied: false, latencyMs: 5 });
    permissionCache.recordCheck({ hit: true, denied: true, latencyMs: 5 });
    permissionCache.recordCheck({ hit: false, denied: true, latencyMs: 50 });

    const { result } = renderHook(() => usePermissionMetrics());

    expect(result.current.denialRate).toBeCloseTo(2 / 3); // 2 denials out of 3 checks
  });

  it('calculates error rate correctly', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // Trigger some errors
    const brokenCache = permissionCache as any;
    const originalCache = brokenCache.cache;

    brokenCache.cache = {
      get: () => {
        throw new Error('Test error');
      },
    };

    permissionCache.get('test-permission');
    permissionCache.get('test-permission-2');

    brokenCache.cache = originalCache;

    // Record some successful checks
    permissionCache.recordCheck({ hit: true, denied: false, latencyMs: 5 });
    permissionCache.recordCheck({ hit: false, denied: false, latencyMs: 50 });

    const { result } = renderHook(() => usePermissionMetrics());

    expect(result.current.errorRate).toBeGreaterThan(0);
    expect(result.current.metrics.errors).toBeGreaterThanOrEqual(2);

    consoleSpy.mockRestore();
  });

  it('avoids division by zero when no checks recorded', () => {
    const { result } = renderHook(() => usePermissionMetrics());

    expect(result.current.hitRate).toBe(0);
    expect(result.current.denialRate).toBe(0);
    expect(result.current.errorRate).toBe(0);
  });

  it('refresh function updates metrics', () => {
    const { result } = renderHook(() => usePermissionMetrics());

    const initialChecks = result.current.metrics.totalChecks;

    // Add new check
    act(() => {
      permissionCache.recordCheck({ hit: true, denied: false, latencyMs: 5 });
    });

    // Manually refresh
    act(() => {
      result.current.refresh();
    });

    expect(result.current.metrics.totalChecks).toBe(initialChecks + 1);
  });

  it('auto-refreshes metrics every 5 seconds', async () => {
    const { result } = renderHook(() => usePermissionMetrics());

    const initialChecks = result.current.metrics.totalChecks;

    // Add new check
    act(() => {
      permissionCache.recordCheck({ hit: true, denied: false, latencyMs: 5 });
    });

    // Fast-forward 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Metrics should auto-update
    await waitFor(() => {
      expect(result.current.metrics.totalChecks).toBe(initialChecks + 1);
    });
  });

  it('clears interval on unmount', () => {
    const { unmount } = renderHook(() => usePermissionMetrics());

    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();

    clearIntervalSpy.mockRestore();
  });

  it('returns metrics snapshot (not live reference)', () => {
    const { result, rerender } = renderHook(() => usePermissionMetrics());

    const metrics1 = result.current.metrics;

    // Add a check to change metrics
    act(() => {
      permissionCache.recordCheck({ hit: true, denied: false, latencyMs: 5 });
      result.current.refresh();
    });

    // Re-render to get new metrics
    rerender();

    const metrics2 = result.current.metrics;

    // After refresh, should be a different object
    expect(metrics1).not.toBe(metrics2);
    expect(metrics1.totalChecks).toBe(0);
    expect(metrics2.totalChecks).toBe(1);
  });

  it('handles high volume of checks correctly', () => {
    // Record 1000 checks
    for (let i = 0; i < 1000; i++) {
      permissionCache.recordCheck({
        hit: i % 2 === 0, // 50% hit rate
        denied: i % 3 === 0, // 33% denial rate
        latencyMs: i % 10,
      });
    }

    const { result } = renderHook(() => usePermissionMetrics());

    expect(result.current.metrics.totalChecks).toBe(1000);
    expect(result.current.hitRate).toBeCloseTo(0.5, 1); // ~50% hit rate
    expect(result.current.denialRate).toBeCloseTo(0.33, 1); // ~33% denial rate
    expect(result.current.metrics.avgLatencyMs).toBeGreaterThan(0);
  });

  it('updates calculated rates when metrics change', () => {
    const { result } = renderHook(() => usePermissionMetrics());

    // Initial state
    expect(result.current.hitRate).toBe(0);

    // Add check and refresh
    act(() => {
      permissionCache.recordCheck({ hit: true, denied: false, latencyMs: 5 });
      result.current.refresh();
    });

    expect(result.current.hitRate).toBe(1); // 1 hit out of 1 check = 100%

    // Add miss and refresh
    act(() => {
      permissionCache.recordCheck({ hit: false, denied: false, latencyMs: 50 });
      result.current.refresh();
    });

    expect(result.current.hitRate).toBeCloseTo(0.5); // 1 hit out of 2 checks = 50%
  });
});
