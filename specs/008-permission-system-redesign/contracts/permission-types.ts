/**
 * Permission System Type Contracts
 *
 * TypeScript interfaces for the permission system redesign.
 * These types extend existing types in packages/app/src/emr/types/
 */

import type { AccessPolicy, AccessPolicyResource, Reference, Practitioner, Organization, AuditEvent } from '@medplum/fhirtypes';

// ============================================================
// PERMISSION DEFINITIONS
// ============================================================

/**
 * Access level for a permission
 */
export type PermissionAccessLevel = 'read' | 'write' | 'delete' | 'admin';

/**
 * FHIR interactions supported by AccessPolicy
 */
export type FHIRInteraction = 'create' | 'read' | 'update' | 'delete' | 'search' | 'history' | 'vread';

/**
 * Permission definition - application-level concept
 */
export interface Permission {
  /** Unique identifier, e.g., "view-patient-list" */
  code: string;

  /** Display name (translated) */
  name: string;

  /** Detailed description (translated) */
  description: string;

  /** Category code */
  category: string;

  /** Sort order within category */
  displayOrder: number;

  /** Target FHIR resource type (optional) */
  resourceType?: string;

  /** Access level determining FHIR interactions */
  accessLevel: PermissionAccessLevel;

  /** Permission codes that must also be enabled */
  dependencies?: string[];

  /** Mantine icon name */
  icon?: string;

  /** Show warning when enabling (dangerous actions) */
  dangerous?: boolean;
}

/**
 * Permission category grouping
 */
export interface PermissionCategory {
  /** Unique identifier, e.g., "patient-management" */
  code: string;

  /** Display name (translated) */
  name: string;

  /** Description (translated) */
  description: string;

  /** Sort order for display */
  displayOrder: number;

  /** Mantine icon name */
  icon?: string;

  /** Permissions in this category */
  permissions: Permission[];
}

// ============================================================
// ROLE DEFINITIONS
// ============================================================

/**
 * Role status
 */
export type RoleStatus = 'active' | 'inactive';

/**
 * Role definition - stored as AccessPolicy with meta.tag
 */
export interface Role {
  /** AccessPolicy resource ID */
  id: string;

  /** Unique code, e.g., "physician" */
  code: string;

  /** Display name (translated) */
  name: string;

  /** Optional description */
  description?: string;

  /** Active/inactive status */
  status: RoleStatus;

  /** Whether role uses department scoping */
  departmentScoped: boolean;

  /** Number of users assigned to this role */
  userCount: number;

  /** Number of permissions enabled */
  permissionCount: number;

  /** Default landing page route */
  defaultPage?: string;

  /** ISO timestamp of creation */
  createdAt: string;

  /** ISO timestamp of last update */
  updatedAt: string;
}

/**
 * Input for creating/updating a role
 */
export interface RoleInput {
  /** Unique code (lowercase, alphanumeric with dashes) */
  code: string;

  /** Display name */
  name: string;

  /** Optional description */
  description?: string;

  /** Whether role uses department scoping */
  departmentScoped?: boolean;

  /** Permission codes to enable */
  permissions?: string[];

  /** Default landing page route */
  defaultPage?: string;
}

/**
 * Predefined role template
 */
export interface RoleTemplate {
  /** Template code, e.g., "physician" */
  code: string;

  /** Display name (translated) */
  name: string;

  /** Description (translated) */
  description: string;

  /** Default permissions for this template */
  defaultPermissions: string[];

  /** Whether template uses department scoping */
  departmentScoped: boolean;

  /** Default landing page route */
  defaultPage?: string;
}

// ============================================================
// ROLE ASSIGNMENTS
// ============================================================

/**
 * Role assignment status
 */
export type AssignmentStatus = 'active' | 'inactive' | 'pending' | 'expired';

/**
 * Role assignment - stored as PractitionerRole
 */
export interface RoleAssignment {
  /** PractitionerRole resource ID */
  id: string;

  /** Assigned user */
  userId: string;
  userName: string;

  /** Assigned role */
  roleId: string;
  roleCode: string;
  roleName: string;

  /** Department (optional) */
  departmentId?: string;
  departmentName?: string;

  /** Assignment status */
  status: AssignmentStatus;

  /** Validity period */
  startDate?: string;
  endDate?: string;

  /** Who made the assignment */
  assignedBy: string;
  assignedAt: string;
}

/**
 * Input for creating a role assignment
 */
export interface AssignmentInput {
  /** Practitioner ID */
  userId: string;

  /** AccessPolicy ID (role) */
  roleId: string;

  /** Organization ID (department) - optional */
  departmentId?: string;

  /** Start date (ISO format) - optional, defaults to now */
  startDate?: string;

  /** End date (ISO format) - optional */
  endDate?: string;
}

// ============================================================
// PERMISSION MATRIX
// ============================================================

/**
 * Single row in the permission matrix
 */
export interface PermissionMatrixRow {
  /** Permission code */
  code: string;

  /** Permission name (translated) */
  name: string;

  /** Whether permission is enabled */
  enabled: boolean;

  /** Whether enabled due to dependency (read-only) */
  inherited: boolean;

  /** Which permission(s) caused inheritance */
  inheritedFrom?: string[];
}

/**
 * Permission matrix category
 */
export interface PermissionMatrixCategory {
  /** Category code */
  categoryCode: string;

  /** Category name (translated) */
  categoryName: string;

  /** Permissions in this category */
  permissions: PermissionMatrixRow[];
}

/**
 * Full permission matrix for a role
 */
export interface PermissionMatrix {
  /** Role ID */
  roleId: string;

  /** Role name */
  roleName: string;

  /** Categories with permissions */
  categories: PermissionMatrixCategory[];

  /** Total enabled permissions */
  totalEnabled: number;

  /** Last updated timestamp */
  updatedAt: string;
}

// ============================================================
// ROLE CONFLICTS
// ============================================================

/**
 * Type of role conflict
 */
export type RoleConflictType = 'separation_of_duties' | 'redundant_roles' | 'permission_conflict';

/**
 * Severity of conflict
 */
export type ConflictSeverity = 'warning' | 'error';

/**
 * Role conflict detected during assignment
 */
export interface RoleConflict {
  /** Type of conflict */
  type: RoleConflictType;

  /** Severity level */
  severity: ConflictSeverity;

  /** Human-readable description */
  description: string;

  /** Role codes involved */
  affectedRoles: string[];

  /** Permission codes causing conflict (if applicable) */
  conflictingPermissions?: string[];
}

// ============================================================
// PERMISSION CHECKING
// ============================================================

/**
 * Context for permission check
 */
export interface PermissionCheckContext {
  /** Department ID for scoped permissions */
  departmentId?: string;

  /** Target resource ID */
  resourceId?: string;

  /** Target resource type */
  resourceType?: string;
}

/**
 * Result of permission check
 */
export interface PermissionCheckResult {
  /** Whether permission is granted */
  hasPermission: boolean;

  /** Permission code checked */
  permissionCode: string;

  /** Whether result came from cache */
  cached: boolean;

  /** Timestamp of check */
  checkedAt: string;
}

/**
 * Batch permission check result
 */
export interface BatchPermissionCheckResult {
  /** Map of permission code to result */
  results: Record<string, boolean>;

  /** Whether results came from cache */
  cached: boolean;

  /** Timestamp of check */
  checkedAt: string;
}

// ============================================================
// PERMISSION CACHING
// ============================================================

/**
 * Cache entry for a permission
 */
export interface PermissionCacheEntry {
  /** Permission code */
  permissionCode: string;

  /** Whether permission is granted */
  hasPermission: boolean;

  /** Expiration timestamp (Unix ms) */
  expiresAt: number;

  /** When fetched (Unix ms) */
  fetchedAt: number;
}

/**
 * Cache configuration
 */
export interface PermissionCacheConfig {
  /** Time-to-live in milliseconds */
  ttlMs: number;

  /** Maximum entries to cache */
  maxEntries: number;

  /** Storage type */
  storage: 'memory' | 'sessionStorage' | 'both';
}

// ============================================================
// EMERGENCY ACCESS
// ============================================================

/**
 * Emergency access request
 */
export interface EmergencyAccessRequest {
  /** ID of restricted resource */
  resourceId: string;

  /** Mandatory reason for access */
  reason: string;
}

/**
 * Emergency access result
 */
export interface EmergencyAccessResult {
  /** Whether access was granted */
  granted: boolean;

  /** AuditEvent ID for this access */
  auditEventId: string;

  /** When access expires */
  expiresAt: string;

  /** Warning message to display */
  warningMessage?: string;
}

// ============================================================
// AUDIT EVENTS
// ============================================================

/**
 * DICOM audit event codes for permission system
 */
export const PERMISSION_AUDIT_CODES = {
  PATIENT_RECORD: 'DCM 110110',
  RESTRICTED_ACCESS: 'DCM 110111',
  AUTHENTICATION: 'DCM 110112',
  EMERGENCY_ACCESS: 'DCM 110113',
  POLICY_CHANGE: 'DCM 110114',
  PERMISSION_GRANT: 'DCM 110136',
  PERMISSION_REVOKE: 'DCM 110137',
} as const;

/**
 * Audit event outcome
 */
export type AuditOutcome = 'success' | 'denied' | 'failure';

/**
 * Audit event summary for display
 */
export interface AuditEventSummary {
  /** AuditEvent resource ID */
  id: string;

  /** When event occurred */
  timestamp: string;

  /** Action performed */
  action: string;

  /** Outcome of action */
  outcome: AuditOutcome;

  /** User who performed action */
  userId: string;
  userName: string;

  /** Target resource (if applicable) */
  targetResource?: string;

  /** Human-readable details */
  details?: string;
}

// ============================================================
// EXTENDED ACCESSPOLICY
// ============================================================

/**
 * Extended AccessPolicyResource with interaction array
 */
export interface ExtendedAccessPolicyResource extends AccessPolicyResource {
  /** Explicit interactions (preferred over readonly) */
  interaction?: FHIRInteraction[];
}

/**
 * AccessPolicy with role metadata in meta.tag
 */
export interface RoleAccessPolicy extends AccessPolicy {
  meta: {
    versionId?: string;
    lastUpdated?: string;
    tag: [
      {
        system: 'http://medimind.ge/role-identifier';
        code: string;
        display: string;
      },
      {
        system: 'http://medimind.ge/role-status';
        code: RoleStatus;
      }
    ];
  };
  resource?: ExtendedAccessPolicyResource[];
}

// ============================================================
// DEPARTMENT SCOPING
// ============================================================

/**
 * Department access configuration
 */
export interface DepartmentAccess {
  /** Organization ID */
  departmentId: string;

  /** Organization name */
  departmentName: string;

  /** Permissions specific to this department */
  permissions?: string[];

  /** Role ID for this department access */
  roleId: string;
}

/**
 * User's department assignments
 */
export interface UserDepartmentAssignments {
  /** Primary department */
  primary?: DepartmentAccess;

  /** Additional departments with access */
  additional: DepartmentAccess[];

  /** Cross-department access granted */
  crossDepartment: boolean;
}

// ============================================================
// TIME-BASED RESTRICTIONS
// ============================================================

/**
 * Edit window configuration
 */
export interface EditWindowConfig {
  /** Hours after creation when editing is allowed */
  windowHours: number;

  /** Resource types this applies to */
  resourceTypes: string[];

  /** Roles that can override */
  overrideRoles: string[];
}

/**
 * Record lock status
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
}

// ============================================================
// SENSITIVE DATA
// ============================================================

/**
 * Data classification levels
 */
export type DataClassification = 'normal' | 'sensitive' | 'restricted';

/**
 * Sensitive data categories
 */
export type SensitiveCategory =
  | 'mental-health'
  | 'substance-abuse'
  | 'hiv-status'
  | 'reproductive-health'
  | 'genetic-data'
  | 'vip-patient';

/**
 * Sensitive data access configuration
 */
export interface SensitiveDataAccess {
  /** Category of sensitive data */
  category: SensitiveCategory;

  /** Permission required to view */
  viewPermission: string;

  /** Permission required to edit */
  editPermission?: string;

  /** Whether emergency access is allowed */
  emergencyAccessAllowed: boolean;
}
