// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { useState, useEffect } from 'react';
import type { PermissionCategory } from '../types/role-management';
import { getPermissionTree } from '../services/permissionService';
import { useTranslation } from '../hooks/useTranslation';

interface UsePermissionsResult {
  categories: PermissionCategory[];
  loading: boolean;
}

/**
 * Hook for fetching permission tree
 * @returns Permission categories with loading state
 */
export function usePermissions(): UsePermissionsResult {
  const { lang } = useTranslation();
  const [categories, setCategories] = useState<PermissionCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // Get permission tree for current language
    const tree = getPermissionTree();
    setCategories(tree);

    setLoading(false);
  }, [lang]);

  return { categories, loading };
}
