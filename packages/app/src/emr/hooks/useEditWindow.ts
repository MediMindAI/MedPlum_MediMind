// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';
import { usePermissionCheck } from './usePermissionCheck';
import type { RecordLockStatus, EditWindowConfig } from '../types/permission-cache';

const DEFAULT_CONFIG: EditWindowConfig = {
  windowHours: 24, // 24 hours default
  resourceTypes: ['Encounter', 'DocumentReference', 'Observation'],
  overrideRoles: ['admin', 'owner'],
};

/**
 * Check if a record is within the edit window
 * @param createdAt - ISO timestamp when record was created
 * @param config - Optional custom config (defaults to 24 hours)
 */
export function useEditWindow(
  createdAt: string,
  config: Partial<EditWindowConfig> = {}
): RecordLockStatus {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const { hasPermission: canOverride } = usePermissionCheck('edit-locked-records');

  return useMemo(() => {
    const createdDate = new Date(createdAt);
    const locksAt = new Date(createdDate.getTime() + mergedConfig.windowHours * 60 * 60 * 1000);
    const now = new Date();
    const timeRemainingMs = locksAt.getTime() - now.getTime();
    const isLocked = timeRemainingMs <= 0;

    return {
      isLocked: isLocked && !canOverride,
      createdAt,
      locksAt: locksAt.toISOString(),
      canOverride,
      timeRemainingMs,
    };
  }, [createdAt, mergedConfig.windowHours, canOverride]);
}
