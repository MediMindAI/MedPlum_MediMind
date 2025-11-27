// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useCallback } from 'react';
import { permissionCache } from '../services/permissionCacheService';
import type { PermissionMetrics } from '../types/permission-cache';

interface UsePermissionMetricsResult {
  metrics: PermissionMetrics;
  /** Refresh metrics from cache service */
  refresh: () => void;
  /** Calculated hit rate (0-1) */
  hitRate: number;
  /** Calculated denial rate (0-1) */
  denialRate: number;
  /** Calculated error rate (0-1) */
  errorRate: number;
}

/**
 * Hook to access permission system metrics for monitoring dashboards
 * Refreshes automatically every 5 seconds
 */
export function usePermissionMetrics(): UsePermissionMetricsResult {
  const [metrics, setMetrics] = useState<PermissionMetrics>(permissionCache.getMetrics());

  const refresh = useCallback(() => {
    setMetrics(permissionCache.getMetrics());
  }, []);

  useEffect(() => {
    // Auto-refresh every 5 seconds
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  const totalChecks = metrics.totalChecks || 1; // Avoid division by zero

  return {
    metrics,
    refresh,
    hitRate: metrics.cacheHits / totalChecks,
    denialRate: metrics.denials / totalChecks,
    errorRate: metrics.errors / totalChecks,
  };
}
