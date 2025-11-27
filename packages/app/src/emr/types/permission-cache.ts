// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * Permission Cache Type Definitions
 *
 * Types for the permission caching system that optimizes permission checks
 * by storing results in memory and sessionStorage with configurable TTL.
 *
 * @see specs/008-permission-system-redesign/data-model.md
 * @see specs/008-permission-system-redesign/contracts/permission-types.ts
 */

/**
 * Cache entry for a single permission check result.
 *
 * Stores the permission check outcome with expiration and fetch timestamps
 * to enable TTL-based invalidation and cache freshness tracking.
 */
export interface PermissionCacheEntry {
  /** Permission code that was checked (e.g., "view-patient-list") */
  permissionCode: string;

  /** Whether the user has this permission */
  hasPermission: boolean;

  /** Unix timestamp (milliseconds) when this entry expires */
  expiresAt: number;

  /** Unix timestamp (milliseconds) when this entry was fetched */
  fetchedAt: number;
}

/**
 * Configuration for the permission cache system.
 *
 * Controls cache behavior including TTL, maximum entries, and storage strategy.
 */
export interface PermissionCacheConfig {
  /**
   * Time-to-live in milliseconds.
   * Default: 10000 (10 seconds)
   *
   * Balances performance with permission freshness. Longer TTL reduces
   * API calls but may show stale permissions after role changes.
   */
  ttlMs: number;

  /**
   * Maximum number of cache entries to store.
   * Default: 200
   *
   * Should be >= total number of permissions in the system.
   * When exceeded, oldest entries are evicted (LRU).
   */
  maxEntries: number;

  /**
   * Where to store cached permissions.
   *
   * - 'memory': Fast, but lost on page refresh
   * - 'sessionStorage': Persists across page refreshes, cleared on tab close
   * - 'both': Best of both worlds (recommended)
   */
  storage: 'memory' | 'sessionStorage' | 'both';
}

/**
 * Context for permission checks.
 *
 * Provides additional context for department-scoped permissions,
 * resource-specific permissions, and audit trail generation.
 */
export interface PermissionCheckContext {
  /**
   * Department ID for scoped permissions.
   *
   * Used when checking permissions that are restricted to specific
   * departments (e.g., physician can only view patients in their department).
   */
  departmentId?: string;

  /**
   * Target resource ID being accessed.
   *
   * Used for record-level permissions and audit logging.
   */
  resourceId?: string;

  /**
   * Target FHIR resource type.
   *
   * Used to determine which AccessPolicy rules apply.
   */
  resourceType?: string;
}

/**
 * Result of a single permission check.
 *
 * Includes metadata about the check for debugging and audit purposes.
 */
export interface PermissionCheckResult {
  /** Whether the user has the requested permission */
  hasPermission: boolean;

  /** Permission code that was checked */
  permissionCode: string;

  /** Whether this result came from cache (true) or API (false) */
  cached: boolean;

  /** ISO timestamp when the check was performed */
  checkedAt: string;
}

/**
 * Result of a batch permission check.
 *
 * Optimizes multiple permission checks by batching API requests.
 */
export interface BatchPermissionCheckResult {
  /**
   * Map of permission code to boolean result.
   *
   * Example:
   * {
   *   "view-patient-list": true,
   *   "edit-patient-demographics": false,
   *   "delete-patient": false
   * }
   */
  results: Record<string, boolean>;

  /** Whether all results came from cache */
  cached: boolean;

  /** ISO timestamp when the batch check was performed */
  checkedAt: string;
}

/**
 * Metrics tracking for permission system observability.
 *
 * Tracks cache performance, denial rates, and latency for monitoring
 * and optimization purposes.
 */
export interface PermissionMetrics {
  /** Total number of permission checks performed */
  totalChecks: number;

  /** Number of checks served from cache */
  cacheHits: number;

  /** Number of checks that required API call */
  cacheMisses: number;

  /** Number of permission checks that resulted in denial */
  denials: number;

  /** Number of permission checks that encountered errors */
  errors: number;

  /** Average latency in milliseconds for permission checks */
  avgLatencyMs: number;

  /** Unix timestamp (milliseconds) when metrics were last updated */
  lastUpdated: number;
}

/**
 * Configuration for time-based edit restrictions
 */
export interface EditWindowConfig {
  /** Hours after creation when editing is allowed */
  windowHours: number;
  /** Resource types this applies to */
  resourceTypes: string[];
  /** Roles that can override the lock */
  overrideRoles: string[];
}

/**
 * Lock status for a specific record
 */
export interface RecordLockStatus {
  /** Whether record is locked */
  isLocked: boolean;
  /** When record was created */
  createdAt: string;
  /** When edit window closes/closed */
  locksAt: string;
  /** Whether current user can override */
  canOverride: boolean;
  /** Time remaining in edit window (ms), negative if locked */
  timeRemainingMs: number;
}

/**
 * Categories of sensitive data requiring special permissions
 */
export type SensitiveCategory =
  | 'mental-health'
  | 'hiv-status'
  | 'substance-abuse'
  | 'genetic-testing'
  | 'reproductive-health'
  | 'vip-patient';

/**
 * Result of checking sensitive data access
 */
export interface SensitiveDataAccessResult {
  /** Whether user can access this sensitive data */
  canAccess: boolean;
  /** Category that triggered restriction */
  restrictedCategory?: SensitiveCategory;
  /** Human-readable reason for restriction */
  reason?: string;
}

/**
 * Request for emergency (break-glass) access to restricted patient data
 */
export interface EmergencyAccessRequest {
  /** Patient or resource being accessed */
  resourceId: string;
  resourceType: string;
  /** Mandatory reason for emergency access */
  reason: string;
  /** Timestamp when access was requested */
  requestedAt: string;
  /** User requesting access */
  requestedBy: string;
}

/**
 * Result of emergency access request
 */
export interface EmergencyAccessResult {
  /** Whether access was granted */
  granted: boolean;
  /** When access expires (typically 1 hour) */
  expiresAt?: string;
  /** Audit event ID for tracking */
  auditEventId?: string;
  /** Error message if denied */
  error?: string;
}
