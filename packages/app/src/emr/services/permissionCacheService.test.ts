// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { PermissionCacheService, permissionCache } from './permissionCacheService';

describe('PermissionCacheService', () => {
  let cache: PermissionCacheService;

  beforeEach(() => {
    jest.useFakeTimers();
    // Use memory-only storage to avoid sessionStorage issues in tests
    cache = new PermissionCacheService({ ttlMs: 10000, maxEntries: 5, storage: 'memory' });
  });

  afterEach(() => {
    jest.useRealTimers();
    cache.invalidate();
  });

  describe('basic operations', () => {
    it('returns null for non-existent entry', () => {
      expect(cache.get('unknown-permission')).toBeNull();
    });

    it('stores and retrieves values', () => {
      cache.set('view-patient', true);
      expect(cache.get('view-patient')).toBe(true);
    });

    it('stores false values correctly', () => {
      cache.set('delete-patient', false);
      expect(cache.get('delete-patient')).toBe(false);
    });

    it('stores multiple entries independently', () => {
      cache.set('view-patient', true);
      cache.set('edit-patient', false);
      cache.set('delete-patient', false);

      expect(cache.get('view-patient')).toBe(true);
      expect(cache.get('edit-patient')).toBe(false);
      expect(cache.get('delete-patient')).toBe(false);
    });
  });

  describe('TTL expiration', () => {
    it('returns value before TTL expires', () => {
      cache.set('view-patient', true);
      jest.advanceTimersByTime(9000); // 9 seconds (< 10 second TTL)
      expect(cache.get('view-patient')).toBe(true);
    });

    it('returns null after TTL expires', () => {
      cache.set('view-patient', true);
      jest.advanceTimersByTime(11000); // 11 seconds (> 10 second TTL)
      expect(cache.get('view-patient')).toBeNull();
    });

    it('returns null exactly at TTL boundary', () => {
      cache.set('view-patient', true);
      jest.advanceTimersByTime(10001); // Just past 10 seconds
      expect(cache.get('view-patient')).toBeNull();
    });

    it('removes expired entry from cache', () => {
      cache.set('view-patient', true);
      const statsBefore = cache.getStats();
      expect(statsBefore.size).toBe(1);

      jest.advanceTimersByTime(11000);
      cache.get('view-patient'); // Triggers cleanup

      const statsAfter = cache.getStats();
      expect(statsAfter.size).toBe(0);
    });

    it('prunes multiple expired entries', () => {
      cache.set('permission-1', true);
      cache.set('permission-2', true);
      cache.set('permission-3', true);

      jest.advanceTimersByTime(11000);
      cache.set('permission-4', true); // Triggers pruning

      const stats = cache.getStats();
      expect(stats.size).toBe(1); // Only permission-4 remains
      expect(cache.get('permission-1')).toBeNull();
      expect(cache.get('permission-2')).toBeNull();
      expect(cache.get('permission-3')).toBeNull();
      expect(cache.get('permission-4')).toBe(true);
    });
  });

  describe('fail-closed behavior', () => {
    it('returns null for missing entries (not false)', () => {
      const result = cache.get('non-existent');
      expect(result).toBeNull();
      expect(result).not.toBe(false);
    });

    it('returns null for expired entries (not false)', () => {
      cache.set('view-patient', true);
      jest.advanceTimersByTime(11000);

      const result = cache.get('view-patient');
      expect(result).toBeNull();
      expect(result).not.toBe(false);
    });

    it('returns null on error (not false)', () => {
      // Spy on console.error to suppress error logs in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Create a cache instance
      const brokenCache = new PermissionCacheService({ storage: 'memory' });

      // Replace the internal cache Map with a broken implementation
      (brokenCache as any).cache = {
        get: () => {
          throw new Error('Simulated error');
        },
      };

      const result = brokenCache.get('view-patient');
      expect(result).toBeNull();
      expect(result).not.toBe(false);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[PermissionCache] Error in get():',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('increments error count on get() failure', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const brokenCache = new PermissionCacheService({ storage: 'memory' });

      // Replace the internal cache Map with a broken implementation
      (brokenCache as any).cache = {
        get: () => {
          throw new Error('Simulated error');
        },
      };

      const metricsBefore = brokenCache.getMetrics();
      brokenCache.get('view-patient');
      const metricsAfter = brokenCache.getMetrics();

      expect(metricsAfter.errors).toBe(metricsBefore.errors + 1);

      consoleSpy.mockRestore();
    });
  });

  describe('cache invalidation', () => {
    it('invalidate() clears all entries', () => {
      cache.set('permission-1', true);
      cache.set('permission-2', false);
      cache.set('permission-3', true);

      expect(cache.getStats().size).toBe(3);

      cache.invalidate();

      expect(cache.getStats().size).toBe(0);
      expect(cache.get('permission-1')).toBeNull();
      expect(cache.get('permission-2')).toBeNull();
      expect(cache.get('permission-3')).toBeNull();
    });

    it('invalidateFor() clears specific entries', () => {
      cache.set('permission-1', true);
      cache.set('permission-2', false);
      cache.set('permission-3', true);

      cache.invalidateFor(['permission-1', 'permission-3']);

      expect(cache.get('permission-1')).toBeNull();
      expect(cache.get('permission-2')).toBe(false); // Not invalidated
      expect(cache.get('permission-3')).toBeNull();
      expect(cache.getStats().size).toBe(1);
    });

    it('invalidateFor() handles non-existent entries gracefully', () => {
      cache.set('permission-1', true);

      expect(() => {
        cache.invalidateFor(['permission-1', 'non-existent', 'also-non-existent']);
      }).not.toThrow();

      expect(cache.get('permission-1')).toBeNull();
    });

    it('invalidateFor() with empty array does nothing', () => {
      cache.set('permission-1', true);
      cache.invalidateFor([]);

      expect(cache.get('permission-1')).toBe(true);
      expect(cache.getStats().size).toBe(1);
    });
  });

  describe('metrics tracking', () => {
    it('recordCheck() updates totalChecks', () => {
      const before = cache.getMetrics();
      cache.recordCheck({ hit: true, denied: false, latencyMs: 5 });
      const after = cache.getMetrics();

      expect(after.totalChecks).toBe(before.totalChecks + 1);
    });

    it('recordCheck() updates cacheHits', () => {
      const before = cache.getMetrics();
      cache.recordCheck({ hit: true, denied: false, latencyMs: 5 });
      const after = cache.getMetrics();

      expect(after.cacheHits).toBe(before.cacheHits + 1);
    });

    it('recordCheck() updates cacheMisses', () => {
      const before = cache.getMetrics();
      cache.recordCheck({ hit: false, denied: false, latencyMs: 50 });
      const after = cache.getMetrics();

      expect(after.cacheMisses).toBe(before.cacheMisses + 1);
    });

    it('recordCheck() updates denials', () => {
      const before = cache.getMetrics();
      cache.recordCheck({ hit: true, denied: true, latencyMs: 5 });
      const after = cache.getMetrics();

      expect(after.denials).toBe(before.denials + 1);
    });

    it('recordCheck() calculates average latency', () => {
      cache.recordCheck({ hit: true, denied: false, latencyMs: 10 });
      cache.recordCheck({ hit: true, denied: false, latencyMs: 20 });
      cache.recordCheck({ hit: true, denied: false, latencyMs: 30 });

      const metrics = cache.getMetrics();
      expect(metrics.avgLatencyMs).toBe(20); // (10 + 20 + 30) / 3 = 20
    });

    it('recordCheck() maintains rolling average of last 100 samples', () => {
      // Record 150 checks to test rolling window
      for (let i = 1; i <= 150; i++) {
        cache.recordCheck({ hit: true, denied: false, latencyMs: i });
      }

      const metrics = cache.getMetrics();
      // Should only average last 100 samples (51-150)
      // Average = (51 + 52 + ... + 150) / 100 = 100.5
      expect(metrics.avgLatencyMs).toBe(101); // Rounded
    });

    it('recordCheck() updates lastUpdated timestamp', () => {
      const now = Date.now();
      cache.recordCheck({ hit: true, denied: false, latencyMs: 5 });
      const metrics = cache.getMetrics();

      expect(metrics.lastUpdated).toBeGreaterThanOrEqual(now);
    });

    it('getMetrics() returns a copy of metrics', () => {
      const metrics1 = cache.getMetrics();
      const metrics2 = cache.getMetrics();

      expect(metrics1).not.toBe(metrics2); // Different objects
      expect(metrics1).toEqual(metrics2); // Same values
    });

    it('recordCheck() handles errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const brokenCache = new PermissionCacheService({ storage: 'memory' });

      // Replace latencies array with a broken implementation
      Object.defineProperty(brokenCache, 'latencies', {
        get: () => {
          throw new Error('Simulated error');
        },
        set: () => {
          throw new Error('Simulated error');
        },
        configurable: true,
      });

      expect(() => {
        brokenCache.recordCheck({ hit: true, denied: false, latencyMs: 5 });
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        '[PermissionCache] Error in recordCheck():',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('calculates hit rate correctly', () => {
      cache.recordCheck({ hit: true, denied: false, latencyMs: 5 });
      cache.recordCheck({ hit: true, denied: false, latencyMs: 5 });
      cache.recordCheck({ hit: false, denied: false, latencyMs: 50 });
      cache.recordCheck({ hit: false, denied: false, latencyMs: 50 });

      const metrics = cache.getMetrics();
      const totalChecks = metrics.totalChecks;
      const hitRate = metrics.cacheHits / totalChecks;

      expect(totalChecks).toBe(4);
      expect(hitRate).toBeCloseTo(0.5); // 2 hits out of 4 = 50%
    });

    it('calculates denial rate correctly', () => {
      cache.recordCheck({ hit: true, denied: false, latencyMs: 5 });
      cache.recordCheck({ hit: true, denied: true, latencyMs: 5 });
      cache.recordCheck({ hit: false, denied: true, latencyMs: 50 });
      cache.recordCheck({ hit: false, denied: false, latencyMs: 50 });

      const metrics = cache.getMetrics();
      const totalChecks = metrics.totalChecks;
      const denialRate = metrics.denials / totalChecks;

      expect(totalChecks).toBe(4);
      expect(denialRate).toBeCloseTo(0.5); // 2 denials out of 4 = 50%
    });

    it('calculates error rate correctly', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Simulate 2 errors in get()
      const brokenCache = new PermissionCacheService({ storage: 'memory' });
      (brokenCache as any).cache = {
        get: () => {
          throw new Error('Simulated error');
        },
      };
      brokenCache.get('permission-1');
      brokenCache.get('permission-2');

      // Record 2 successful checks
      brokenCache.recordCheck({ hit: true, denied: false, latencyMs: 5 });
      brokenCache.recordCheck({ hit: false, denied: false, latencyMs: 50 });

      const metrics = brokenCache.getMetrics();
      const errorRate = metrics.errors / 4; // 2 errors + 2 checks = 4 total operations

      expect(metrics.errors).toBe(2);
      expect(errorRate).toBeCloseTo(0.5); // 2 errors out of 4 operations = 50%

      consoleSpy.mockRestore();
    });
  });

  describe('cache statistics', () => {
    it('getStats() returns current cache size', () => {
      cache.set('permission-1', true);
      cache.set('permission-2', false);

      const stats = cache.getStats();
      expect(stats.size).toBe(2);
    });

    it('getStats() returns maxSize from config', () => {
      const stats = cache.getStats();
      expect(stats.maxSize).toBe(5); // From beforeEach config
    });

    it('getStats() returns ttlMs from config', () => {
      const stats = cache.getStats();
      expect(stats.ttlMs).toBe(10000); // From beforeEach config
    });

    it('getStats() calculates hit rate correctly', () => {
      cache.recordCheck({ hit: true, denied: false, latencyMs: 5 });
      cache.recordCheck({ hit: true, denied: false, latencyMs: 5 });
      cache.recordCheck({ hit: false, denied: false, latencyMs: 50 });

      const stats = cache.getStats();
      expect(stats.hitRate).toBeCloseTo(2 / 3); // 2 hits out of 3 checks
    });

    it('getStats() returns 0 hit rate when no checks performed', () => {
      const stats = cache.getStats();
      expect(stats.hitRate).toBe(0);
    });

    it('getStats() returns oldest entry timestamp', () => {
      const now = Date.now();
      cache.set('permission-1', true);
      jest.advanceTimersByTime(1000);
      cache.set('permission-2', true);

      const stats = cache.getStats();
      expect(stats.oldestEntry).toBeCloseTo(now, -2); // Within 100ms
    });

    it('getStats() returns null when cache is empty', () => {
      const stats = cache.getStats();
      expect(stats.oldestEntry).toBeNull();
    });
  });

  describe('size limits', () => {
    it('enforces maxEntries limit', () => {
      // Cache has maxEntries=5
      cache.set('permission-1', true);
      cache.set('permission-2', true);
      cache.set('permission-3', true);
      cache.set('permission-4', true);
      cache.set('permission-5', true);

      expect(cache.getStats().size).toBe(5);

      cache.set('permission-6', true); // Should trigger eviction

      const stats = cache.getStats();
      expect(stats.size).toBe(5); // Still at max
    });

    it('evicts oldest entries first (LRU)', () => {
      cache.set('permission-1', true);
      jest.advanceTimersByTime(100);
      cache.set('permission-2', true);
      jest.advanceTimersByTime(100);
      cache.set('permission-3', true);
      jest.advanceTimersByTime(100);
      cache.set('permission-4', true);
      jest.advanceTimersByTime(100);
      cache.set('permission-5', true);

      // Add 6th entry - should evict permission-1 (oldest)
      jest.advanceTimersByTime(100);
      cache.set('permission-6', true);

      expect(cache.get('permission-1')).toBeNull(); // Evicted
      expect(cache.get('permission-2')).toBe(true); // Still present
      expect(cache.get('permission-6')).toBe(true); // New entry
    });

    it('evicts multiple entries when over limit', () => {
      cache.set('permission-1', true);
      cache.set('permission-2', true);
      cache.set('permission-3', true);

      // Manually exceed limit by changing maxEntries
      const smallCache = new PermissionCacheService({ maxEntries: 2, storage: 'memory' });
      smallCache.set('permission-1', true);
      jest.advanceTimersByTime(100);
      smallCache.set('permission-2', true);
      jest.advanceTimersByTime(100);
      smallCache.set('permission-3', true);
      jest.advanceTimersByTime(100);
      smallCache.set('permission-4', true); // Should evict 1 and 2

      expect(smallCache.getStats().size).toBe(2);
      expect(smallCache.get('permission-1')).toBeNull();
      expect(smallCache.get('permission-2')).toBeNull();
      expect(smallCache.get('permission-3')).toBe(true);
      expect(smallCache.get('permission-4')).toBe(true);
    });
  });

  describe('sessionStorage integration', () => {
    let sessionStorageCache: PermissionCacheService;
    let sessionStorageMock: { [key: string]: string };

    beforeEach(() => {
      // Mock sessionStorage
      sessionStorageMock = {};
      Object.defineProperty(window, 'sessionStorage', {
        value: {
          getItem: (key: string) => sessionStorageMock[key] || null,
          setItem: (key: string, value: string) => {
            sessionStorageMock[key] = value;
          },
          removeItem: (key: string) => {
            delete sessionStorageMock[key];
          },
        },
        writable: true,
      });

      sessionStorageCache = new PermissionCacheService({ storage: 'sessionStorage' });
    });

    it('saves entries to sessionStorage', () => {
      sessionStorageCache.set('view-patient', true);

      const stored = sessionStorage.getItem('emr-permission-cache');
      expect(stored).toBeTruthy();

      const entries = JSON.parse(stored!);
      expect(entries).toHaveLength(1);
      expect(entries[0].permissionCode).toBe('view-patient');
      expect(entries[0].hasPermission).toBe(true);
    });

    it('loads non-expired entries from sessionStorage on init', () => {
      const now = Date.now();
      const entries = [
        {
          permissionCode: 'view-patient',
          hasPermission: true,
          expiresAt: now + 10000, // Not expired
          fetchedAt: now,
        },
      ];

      sessionStorage.setItem('emr-permission-cache', JSON.stringify(entries));

      const newCache = new PermissionCacheService({ storage: 'sessionStorage' });
      expect(newCache.get('view-patient')).toBe(true);
    });

    it('ignores expired entries when loading from sessionStorage', () => {
      const now = Date.now();
      const entries = [
        {
          permissionCode: 'view-patient',
          hasPermission: true,
          expiresAt: now - 1000, // Expired
          fetchedAt: now - 11000,
        },
      ];

      sessionStorage.setItem('emr-permission-cache', JSON.stringify(entries));

      const newCache = new PermissionCacheService({ storage: 'sessionStorage' });
      expect(newCache.get('view-patient')).toBeNull();
    });

    it('clears sessionStorage on invalidate()', () => {
      sessionStorageCache.set('view-patient', true);
      expect(sessionStorage.getItem('emr-permission-cache')).toBeTruthy();

      sessionStorageCache.invalidate();
      expect(sessionStorage.getItem('emr-permission-cache')).toBeNull();
    });

    it('updates sessionStorage after invalidateFor()', () => {
      sessionStorageCache.set('permission-1', true);
      sessionStorageCache.set('permission-2', true);

      sessionStorageCache.invalidateFor(['permission-1']);

      const stored = sessionStorage.getItem('emr-permission-cache');
      const entries = JSON.parse(stored!);

      expect(entries).toHaveLength(1);
      expect(entries[0].permissionCode).toBe('permission-2');
    });

    it('handles sessionStorage errors gracefully', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Make sessionStorage throw an error
      Object.defineProperty(window, 'sessionStorage', {
        value: {
          getItem: () => {
            throw new Error('Storage error');
          },
          setItem: () => {
            throw new Error('Storage error');
          },
          removeItem: () => {
            throw new Error('Storage error');
          },
        },
        writable: true,
      });

      const errorCache = new PermissionCacheService({ storage: 'sessionStorage' });
      expect(() => {
        errorCache.set('view-patient', true);
      }).not.toThrow();

      consoleWarnSpy.mockRestore();
    });

    it('uses memory-only when storage=memory', () => {
      const memoryCache = new PermissionCacheService({ storage: 'memory' });
      memoryCache.set('view-patient', true);

      // Should not save to sessionStorage
      expect(sessionStorage.getItem('emr-permission-cache')).toBeNull();
    });

    it('uses both memory and sessionStorage when storage=both', () => {
      const bothCache = new PermissionCacheService({ storage: 'both' });
      bothCache.set('view-patient', true);

      // Should save to sessionStorage
      expect(sessionStorage.getItem('emr-permission-cache')).toBeTruthy();

      // Should be in memory too
      expect(bothCache.get('view-patient')).toBe(true);
    });
  });

  describe('singleton instance', () => {
    it('exports a singleton permissionCache instance', () => {
      expect(permissionCache).toBeInstanceOf(PermissionCacheService);
    });

    it('singleton uses default config', () => {
      const stats = permissionCache.getStats();
      expect(stats.ttlMs).toBe(10000); // Default 10 seconds
      expect(stats.maxSize).toBe(200); // Default 200 entries
    });
  });

  describe('error handling', () => {
    it('set() handles errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const brokenCache = new PermissionCacheService({ storage: 'memory' });

      // Replace the internal cache Map with a broken implementation
      (brokenCache as any).cache = {
        set: () => {
          throw new Error('Simulated error');
        },
      };

      expect(() => {
        brokenCache.set('view-patient', true);
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        '[PermissionCache] Error in set():',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('invalidate() handles errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const brokenCache = new PermissionCacheService({ storage: 'memory' });

      // Replace the internal cache Map with a broken implementation
      (brokenCache as any).cache = {
        clear: () => {
          throw new Error('Simulated error');
        },
      };

      expect(() => {
        brokenCache.invalidate();
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        '[PermissionCache] Error in invalidate():',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('invalidateFor() handles errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const brokenCache = new PermissionCacheService({ storage: 'memory' });

      // Replace the internal cache Map with a broken implementation
      (brokenCache as any).cache = {
        delete: () => {
          throw new Error('Simulated error');
        },
      };

      expect(() => {
        brokenCache.invalidateFor(['view-patient']);
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        '[PermissionCache] Error in invalidateFor():',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('edge cases', () => {
    it('handles empty permission code', () => {
      cache.set('', true);
      expect(cache.get('')).toBe(true);
    });

    it('handles very long permission codes', () => {
      const longCode = 'a'.repeat(1000);
      cache.set(longCode, true);
      expect(cache.get(longCode)).toBe(true);
    });

    it('handles special characters in permission codes', () => {
      const specialCode = 'view:patient/demographics@dept-1';
      cache.set(specialCode, false);
      expect(cache.get(specialCode)).toBe(false);
    });

    it('handles zero TTL', () => {
      const zeroTTLCache = new PermissionCacheService({ ttlMs: 0, storage: 'memory' });
      zeroTTLCache.set('view-patient', true);

      jest.advanceTimersByTime(1);
      expect(zeroTTLCache.get('view-patient')).toBeNull();
    });

    it('handles very large TTL', () => {
      const largeTTLCache = new PermissionCacheService({
        ttlMs: 1000000000,
        storage: 'memory',
      });
      largeTTLCache.set('view-patient', true);

      jest.advanceTimersByTime(999999999);
      expect(largeTTLCache.get('view-patient')).toBe(true);
    });

    it('handles maxEntries=1', () => {
      const tinyCache = new PermissionCacheService({ maxEntries: 1, storage: 'memory' });
      tinyCache.set('permission-1', true);
      tinyCache.set('permission-2', true);

      expect(tinyCache.getStats().size).toBe(1);
      expect(tinyCache.get('permission-1')).toBeNull();
      expect(tinyCache.get('permission-2')).toBe(true);
    });
  });
});
