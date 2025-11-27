// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';
import { usePermissionCheck } from './usePermissionCheck';
import type { SensitiveCategory, SensitiveDataAccessResult } from '../types/permission-cache';

const SENSITIVE_PERMISSIONS: Record<SensitiveCategory, string> = {
  'mental-health': 'view-sensitive-mental-health',
  'hiv-status': 'view-sensitive-hiv',
  'substance-abuse': 'view-sensitive-substance-abuse',
  'genetic-testing': 'view-sensitive-genetic',
  'reproductive-health': 'view-sensitive-reproductive',
  'vip-patient': 'view-sensitive-vip',
};

/**
 * Hook to check if user has access to sensitive data categories
 *
 * @param categories - Array of sensitive data categories on the record
 * @returns SensitiveDataAccessResult with access status
 *
 * @example
 * ```typescript
 * const { canAccess, restrictedCategory } = useSensitiveDataAccess(['mental-health', 'hiv-status']);
 * if (!canAccess) {
 *   return <Alert>Access to {restrictedCategory} data requires special permission</Alert>;
 * }
 * return <SensitivePatientData />;
 * ```
 */
export function useSensitiveDataAccess(categories: SensitiveCategory[]): SensitiveDataAccessResult {
  // Check each category's permission
  const mentalHealth = usePermissionCheck(SENSITIVE_PERMISSIONS['mental-health']);
  const hiv = usePermissionCheck(SENSITIVE_PERMISSIONS['hiv-status']);
  const substanceAbuse = usePermissionCheck(SENSITIVE_PERMISSIONS['substance-abuse']);
  const genetic = usePermissionCheck(SENSITIVE_PERMISSIONS['genetic-testing']);
  const reproductive = usePermissionCheck(SENSITIVE_PERMISSIONS['reproductive-health']);
  const vip = usePermissionCheck(SENSITIVE_PERMISSIONS['vip-patient']);

  const permissionMap: Record<SensitiveCategory, boolean> = {
    'mental-health': mentalHealth.hasPermission,
    'hiv-status': hiv.hasPermission,
    'substance-abuse': substanceAbuse.hasPermission,
    'genetic-testing': genetic.hasPermission,
    'reproductive-health': reproductive.hasPermission,
    'vip-patient': vip.hasPermission,
  };

  return useMemo(() => {
    for (const category of categories) {
      if (!permissionMap[category]) {
        return {
          canAccess: false,
          restrictedCategory: category,
          reason: `Access to ${category} data requires special permission`,
        };
      }
    }
    return { canAccess: true };
  }, [categories, JSON.stringify(permissionMap)]);
}
