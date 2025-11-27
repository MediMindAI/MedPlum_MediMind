// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * Performance tests for permission system
 * Verifies FR-035 to FR-038 requirements:
 * - Permission check latency < 50ms
 * - Cache hit rate tracking
 * - Denial rate tracking
 */

import {
  getPermissionTree,
  resolvePermissionDependencies,
  permissionsToAccessPolicy,
} from './permissionService';
import { permissionCache } from './permissionCacheService';

describe('Permission System Performance', () => {
  beforeEach(() => {
    // Clear cache by creating new entries (no direct clear method exposed)
    // The cache will expire entries after TTL
  });

  describe('T093: Permission Check Latency', () => {
    it('should complete getPermissionTree in under 50ms', () => {
      const iterations = 100;
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        getPermissionTree();
        const end = performance.now();
        times.push(end - start);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);

      console.log(`getPermissionTree - Avg: ${avgTime.toFixed(2)}ms, Max: ${maxTime.toFixed(2)}ms`);

      // Average should be under 50ms
      expect(avgTime).toBeLessThan(50);
      // Max should be under 100ms (allowing for cold start)
      expect(maxTime).toBeLessThan(100);
    });

    it('should complete cache lookup in under 5ms', () => {
      const iterations = 1000;
      const times: number[] = [];

      // Pre-populate cache
      permissionCache.set('test-permission', true);

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        permissionCache.get('test-permission');
        const end = performance.now();
        times.push(end - start);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);

      console.log(`Cache lookup - Avg: ${avgTime.toFixed(4)}ms, Max: ${maxTime.toFixed(4)}ms`);

      // Cache lookups should be extremely fast
      expect(avgTime).toBeLessThan(5);
    });

    it('should complete dependency resolution in under 20ms', () => {
      const iterations = 100;
      const times: number[] = [];

      // Test with a permission that has dependencies
      const permissions = ['edit-patient-demographics', 'delete-patient', 'create-encounter'];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        resolvePermissionDependencies(permissions);
        const end = performance.now();
        times.push(end - start);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);

      console.log(`Dependency resolution - Avg: ${avgTime.toFixed(2)}ms, Max: ${maxTime.toFixed(2)}ms`);

      expect(avgTime).toBeLessThan(20);
    });

    it('should complete permissionsToAccessPolicy in under 30ms', () => {
      const iterations = 50;
      const times: number[] = [];

      // Test with multiple permissions
      const permissions = [
        'view-patient-list',
        'view-patient-demographics',
        'edit-patient-demographics',
        'view-encounters',
        'create-encounter',
        'view-lab-order',
        'create-lab-order',
      ];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        permissionsToAccessPolicy(permissions, 'test-role');
        const end = performance.now();
        times.push(end - start);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);

      console.log(`permissionsToAccessPolicy - Avg: ${avgTime.toFixed(2)}ms, Max: ${maxTime.toFixed(2)}ms`);

      expect(avgTime).toBeLessThan(30);
    });
  });

  describe('Cache Performance', () => {
    it('should provide cache metrics interface', () => {
      // Set some permissions
      permissionCache.set('test-perm-1', true);
      permissionCache.set('test-perm-2', false);

      // Perform some cache operations
      for (let i = 0; i < 10; i++) {
        permissionCache.get('test-perm-1');
        permissionCache.get('test-perm-2');
      }

      const metrics = permissionCache.getMetrics();
      const stats = permissionCache.getStats();

      console.log(`Cache metrics:`, metrics);
      console.log(`Cache stats:`, stats);

      // Should have valid metrics structure
      expect(metrics).toHaveProperty('totalChecks');
      expect(metrics).toHaveProperty('cacheHits');
      expect(metrics).toHaveProperty('cacheMisses');
      expect(metrics).toHaveProperty('denials');
      expect(metrics).toHaveProperty('avgLatencyMs');

      // Stats should be valid
      expect(stats).toHaveProperty('size');
      expect(stats.size).toBeGreaterThanOrEqual(0);
    });

    it('should handle high-volume permission checks efficiently', () => {
      const permissionCodes = [
        'view-patient-list',
        'edit-patient-demographics',
        'view-encounters',
        'create-lab-order',
        'view-invoice',
      ];

      // Pre-populate cache
      permissionCodes.forEach((code, i) => {
        permissionCache.set(code, i % 2 === 0);
      });

      const iterations = 10000;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        const code = permissionCodes[i % permissionCodes.length];
        permissionCache.get(code);
      }

      const end = performance.now();
      const totalTime = end - start;
      const avgTimePerCheck = totalTime / iterations;

      console.log(`High-volume test: ${iterations} checks in ${totalTime.toFixed(2)}ms (${avgTimePerCheck.toFixed(4)}ms/check)`);

      // Should handle 10k checks in under 100ms
      expect(totalTime).toBeLessThan(100);
    });
  });
});
