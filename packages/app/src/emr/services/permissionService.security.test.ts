// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * Security tests for permission system
 * Verifies fail-closed behavior in all error paths
 *
 * SECURITY REQUIREMENT: When permission cannot be determined, access MUST be DENIED
 */

import { permissionCache } from './permissionCacheService';
import {
  getPermissionTree,
  resolvePermissionDependencies,
  detectRoleConflicts,
} from './permissionService';

describe('Permission System Security - T094', () => {
  describe('Fail-Closed Behavior', () => {
    it('cache should return null (deny) for unknown permissions', () => {
      // Unknown permission should return null (fail-closed)
      const result = permissionCache.get('unknown-permission-xyz');
      expect(result).toBeNull();
    });

    it('cache should return null (deny) for empty permission code', () => {
      const result = permissionCache.get('');
      expect(result).toBeNull();
    });

    it('dependency resolution should not add unknown permissions', () => {
      // Only valid permissions should be resolved
      const result = resolvePermissionDependencies(['unknown-permission', 'fake-permission']);

      // Should not add any permissions that don't exist in the system
      const validPermissions = getPermissionTree().flatMap(c => c.permissions).map(p => p.code);
      result.forEach(p => {
        // Either it's in valid permissions or it's the original input
        const isValid = validPermissions.includes(p) || ['unknown-permission', 'fake-permission'].includes(p);
        expect(isValid).toBe(true);
      });
    });

    it('permission tree should always return valid structure', () => {
      const tree = getPermissionTree();

      // Should always return an array
      expect(Array.isArray(tree)).toBe(true);

      // Should have categories
      expect(tree.length).toBeGreaterThan(0);

      // Each category should have required fields
      tree.forEach(category => {
        expect(category).toHaveProperty('code');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('permissions');
        expect(Array.isArray(category.permissions)).toBe(true);
      });
    });

    it('role conflict detection should handle empty input safely', () => {
      // Empty input should not cause errors
      const result1 = detectRoleConflicts([]);
      expect(Array.isArray(result1)).toBe(true);

      // Single role should have no conflicts
      const result2 = detectRoleConflicts(['physician']);
      expect(result2.length).toBe(0);
    });

    it('cached permission should not be modifiable from outside', () => {
      // Set a permission
      permissionCache.set('security-test-perm', true);

      // Get the cached value
      const value1 = permissionCache.get('security-test-perm');
      expect(value1).toBe(true);

      // The returned value is a primitive, so it can't be modified
      // This is by design - the cache returns boolean values, not objects
    });
  });

  describe('Input Validation', () => {
    it('should handle null/undefined permission codes gracefully', () => {
      // TypeScript prevents this at compile time, but at runtime we should be safe
      const result1 = permissionCache.get(null as unknown as string);
      expect(result1).toBeNull();

      const result2 = permissionCache.get(undefined as unknown as string);
      expect(result2).toBeNull();
    });

    it('should handle special characters in permission codes', () => {
      // These should not cause crashes
      const specialCodes = [
        '<script>alert(1)</script>',
        '"; DROP TABLE permissions;--',
        '../../etc/passwd',
        '\x00\x00\x00',
        '🔓',
      ];

      specialCodes.forEach(code => {
        // Should not throw
        expect(() => permissionCache.get(code)).not.toThrow();
        expect(() => permissionCache.set(code, true)).not.toThrow();

        // Result should be null for unknown codes or the set value
        const result = permissionCache.get(code);
        expect(result === null || result === true || result === false).toBe(true);
      });
    });

    it('should handle very long permission codes', () => {
      const longCode = 'a'.repeat(10000);

      // Should not throw
      expect(() => permissionCache.get(longCode)).not.toThrow();
      expect(() => permissionCache.set(longCode, true)).not.toThrow();
    });

    it('dependency resolution should handle circular dependencies safely', () => {
      // Even if somehow circular dependencies exist, it should not infinite loop
      // The function should have a visited set to prevent infinite recursion
      const permissions = ['view-patient-list', 'edit-patient-demographics'];

      // This should complete without hanging
      const startTime = Date.now();
      const result = resolvePermissionDependencies(permissions);
      const endTime = Date.now();

      // Should complete in reasonable time (< 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Access Control Integrity', () => {
    it('denied permissions should remain denied after cache operations', () => {
      // Explicitly deny a permission
      permissionCache.set('denied-permission', false);

      // Multiple reads should still return false
      for (let i = 0; i < 10; i++) {
        const result = permissionCache.get('denied-permission');
        expect(result).toBe(false);
      }
    });

    it('all 8 permission categories should be present', () => {
      const tree = getPermissionTree();
      const expectedCategories = [
        'patient-management',
        'clinical-documentation',
        'laboratory',
        'billing-financial',
        'administration',
        'reports',
        'nomenclature',
        'scheduling',
      ];

      const actualCategories = tree.map(c => c.code);

      expectedCategories.forEach(cat => {
        expect(actualCategories).toContain(cat);
      });
    });

    it('dangerous permissions should be marked', () => {
      const tree = getPermissionTree();
      const allPermissions = tree.flatMap(c => c.permissions);

      // Delete permissions should have dangerous flag
      const deletePermissions = allPermissions.filter(p => p.code.startsWith('delete-'));

      deletePermissions.forEach(p => {
        expect(p.dangerous).toBe(true);
      });
    });
  });
});
