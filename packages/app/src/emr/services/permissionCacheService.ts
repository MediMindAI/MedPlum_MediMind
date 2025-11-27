// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * Permission Cache Service
 *
 * Implements a TTL-based cache with fail-closed behavior for permission checks.
 * Balances performance (<50ms latency) with security (deny access when cache misses).
 *
 * Features:
 * - 10-second TTL (configurable)
 * - Max 200 entries (LRU eviction)
 * - In-memory + sessionStorage persistence
 * - Fail-closed: Returns false (deny) on cache miss or error
 * - Metrics tracking for observability
 *
 * @see specs/008-permission-system-redesign/research.md
 */

import type {
  PermissionCacheEntry,
  PermissionCacheConfig,
  PermissionMetrics,
} from '../types/permission-cache';

const DEFAULT_CONFIG: PermissionCacheConfig = {
  ttlMs: 10_000, // 10 seconds
  maxEntries: 200,
  storage: 'both',
};

const SESSION_STORAGE_KEY = 'emr-permission-cache';

class PermissionCacheService {
  private cache = new Map<string, PermissionCacheEntry>();
  private config: PermissionCacheConfig;
  private metrics: PermissionMetrics = {
    totalChecks: 0,
    cacheHits: 0,
    cacheMisses: 0,
    denials: 0,
    errors: 0,
    avgLatencyMs: 0,
    lastUpdated: Date.now(),
  };
  private latencies: number[] = [];

  constructor(config: Partial<PermissionCacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadFromSessionStorage();
  }

  /**
   * Get cached permission value.
   *
   * Returns null if:
   * - Entry not found
   * - Entry expired
   * - Error occurred
   *
   * FAIL-CLOSED BEHAVIOR: Caller should treat null as denial.
   *
   * @param permissionCode - Permission code to check
   * @returns Permission value or null if not cached/expired
   */
  get(permissionCode: string): boolean | null {
    try {
      const entry = this.cache.get(permissionCode);

      // Cache miss
      if (!entry) {
        return null;
      }

      // Expired entry
      if (entry.expiresAt < Date.now()) {
        this.cache.delete(permissionCode);
        this.saveToSessionStorage();
        return null;
      }

      // Valid cached entry
      return entry.hasPermission;
    } catch (error) {
      // Log error but fail closed
      console.error('[PermissionCache] Error in get():', error);
      this.metrics.errors++;
      return null;
    }
  }

  /**
   * Set permission value in cache with TTL.
   *
   * Automatically:
   * - Prunes expired entries
   * - Enforces max entries limit (LRU eviction)
   * - Syncs to sessionStorage if configured
   *
   * @param permissionCode - Permission code
   * @param hasPermission - Whether user has permission
   */
  set(permissionCode: string, hasPermission: boolean): void {
    try {
      const now = Date.now();

      const entry: PermissionCacheEntry = {
        permissionCode,
        hasPermission,
        expiresAt: now + this.config.ttlMs,
        fetchedAt: now,
      };

      this.cache.set(permissionCode, entry);

      // Maintain cache size
      this.pruneExpired();
      this.enforceMaxEntries();

      // Persist to sessionStorage
      this.saveToSessionStorage();
    } catch (error) {
      console.error('[PermissionCache] Error in set():', error);
      this.metrics.errors++;
    }
  }

  /**
   * Invalidate entire cache.
   *
   * Clears both in-memory cache and sessionStorage.
   * Call on:
   * - User logout
   * - Role assignment changes
   * - Manual cache clear
   */
  invalidate(): void {
    try {
      this.cache.clear();

      if (this.config.storage === 'sessionStorage' || this.config.storage === 'both') {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (error) {
      console.error('[PermissionCache] Error in invalidate():', error);
      this.metrics.errors++;
    }
  }

  /**
   * Invalidate specific permissions.
   *
   * More efficient than full invalidation when only certain permissions changed.
   *
   * @param codes - Array of permission codes to invalidate
   */
  invalidateFor(codes: string[]): void {
    try {
      for (const code of codes) {
        this.cache.delete(code);
      }

      this.saveToSessionStorage();
    } catch (error) {
      console.error('[PermissionCache] Error in invalidateFor():', error);
      this.metrics.errors++;
    }
  }

  /**
   * Get current cache metrics.
   *
   * Use for observability dashboards and performance tuning.
   *
   * @returns Copy of current metrics
   */
  getMetrics(): PermissionMetrics {
    return { ...this.metrics };
  }

  /**
   * Record permission check result for metrics.
   *
   * Updates:
   * - Total checks
   * - Cache hits/misses
   * - Denials
   * - Average latency
   *
   * @param result - Check result metadata
   */
  recordCheck(result: { hit: boolean; denied: boolean; latencyMs: number }): void {
    try {
      this.metrics.totalChecks++;

      if (result.hit) {
        this.metrics.cacheHits++;
      } else {
        this.metrics.cacheMisses++;
      }

      if (result.denied) {
        this.metrics.denials++;
      }

      // Track latency (keep last 100 samples for rolling average)
      this.latencies.push(result.latencyMs);
      if (this.latencies.length > 100) {
        this.latencies.shift();
      }

      // Calculate average latency
      const sum = this.latencies.reduce((acc, val) => acc + val, 0);
      this.metrics.avgLatencyMs = Math.round(sum / this.latencies.length);

      this.metrics.lastUpdated = Date.now();
    } catch (error) {
      console.error('[PermissionCache] Error in recordCheck():', error);
      this.metrics.errors++;
    }
  }

  /**
   * Get cache statistics for debugging.
   *
   * @returns Cache size, hit rate, and expiration info
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    ttlMs: number;
    oldestEntry: number | null;
  } {
    const entries = Array.from(this.cache.values());
    const oldestEntry = entries.length > 0 ? Math.min(...entries.map((e) => e.fetchedAt)) : null;

    return {
      size: this.cache.size,
      maxSize: this.config.maxEntries,
      hitRate: this.metrics.totalChecks > 0 ? this.metrics.cacheHits / this.metrics.totalChecks : 0,
      ttlMs: this.config.ttlMs,
      oldestEntry,
    };
  }

  /**
   * Load cache from sessionStorage on initialization.
   *
   * Automatically removes expired entries during load.
   */
  private loadFromSessionStorage(): void {
    if (this.config.storage === 'memory') {
      return;
    }

    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) {
        return;
      }

      const entries: PermissionCacheEntry[] = JSON.parse(stored);
      const now = Date.now();

      // Only restore non-expired entries
      for (const entry of entries) {
        if (entry.expiresAt > now) {
          this.cache.set(entry.permissionCode, entry);
        }
      }
    } catch (error) {
      // Fail silently - cache load is best-effort
      console.warn('[PermissionCache] Failed to load from sessionStorage:', error);
      this.metrics.errors++;
    }
  }

  /**
   * Save cache to sessionStorage.
   *
   * Persists cache across page refreshes (not across tabs).
   */
  private saveToSessionStorage(): void {
    if (this.config.storage === 'memory') {
      return;
    }

    try {
      const entries = Array.from(this.cache.values());
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      // Fail silently - sessionStorage might be full or disabled
      console.warn('[PermissionCache] Failed to save to sessionStorage:', error);
      this.metrics.errors++;
    }
  }

  /**
   * Remove expired entries from cache.
   *
   * Called automatically on set() operations.
   */
  private pruneExpired(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [code, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        toDelete.push(code);
      }
    }

    for (const code of toDelete) {
      this.cache.delete(code);
    }
  }

  /**
   * Enforce maximum cache entries limit.
   *
   * Removes oldest entries (by fetchedAt) when over limit.
   * LRU (Least Recently Used) eviction policy.
   */
  private enforceMaxEntries(): void {
    if (this.cache.size <= this.config.maxEntries) {
      return;
    }

    // Sort entries by fetchedAt (oldest first)
    const entries = Array.from(this.cache.entries()).sort(
      (a, b) => a[1].fetchedAt - b[1].fetchedAt
    );

    // Remove oldest entries until under limit
    const toRemove = this.cache.size - this.config.maxEntries;
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }
}

// Export singleton instance with default config
export const permissionCache = new PermissionCacheService();

// Export class for testing with custom config
export { PermissionCacheService };
