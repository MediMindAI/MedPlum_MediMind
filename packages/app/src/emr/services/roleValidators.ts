// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { MedplumClient } from '@medplum/core';
import { searchRoles } from './roleService';
import { getPermissionTree } from './permissionService';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a role name
 *
 * @param name - Role name to validate
 * @returns Validation result
 */
export function validateRoleName(name: string): ValidationResult {
  // Check if name is provided
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Role name is required' };
  }

  // Check minimum length
  if (name.trim().length < 2) {
    return { valid: false, error: 'Role name must be at least 2 characters' };
  }

  // Check maximum length
  if (name.trim().length > 100) {
    return { valid: false, error: 'Role name must be at most 100 characters' };
  }

  return { valid: true };
}

/**
 * Validates a role code
 *
 * @param code - Role code to validate
 * @returns Validation result
 */
export function validateRoleCode(code: string): ValidationResult {
  // Check if code is provided
  if (!code || code.trim().length === 0) {
    return { valid: false, error: 'Role code is required' };
  }

  // Check minimum length
  if (code.trim().length < 2) {
    return { valid: false, error: 'Role code must be at least 2 characters' };
  }

  // Check maximum length
  if (code.trim().length > 50) {
    return { valid: false, error: 'Role code must be at most 50 characters' };
  }

  // Check format: lowercase with hyphens only
  const codeRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  if (!codeRegex.test(code)) {
    return { valid: false, error: 'Role code must be lowercase letters, numbers, and hyphens only' };
  }

  return { valid: true };
}

/**
 * Validates a role description
 *
 * @param description - Role description to validate
 * @returns Validation result
 */
export function validateRoleDescription(description?: string): ValidationResult {
  // Description is optional, so empty is valid
  if (!description || description.trim().length === 0) {
    return { valid: true };
  }

  // Check maximum length if provided
  if (description.trim().length > 500) {
    return { valid: false, error: 'Role description must be at most 500 characters' };
  }

  return { valid: true };
}

/**
 * Validates permissions array
 *
 * @param permissions - Array of permission codes
 * @returns Validation result
 */
export function validatePermissions(permissions: string[]): ValidationResult {
  // Check if permissions array exists
  if (!permissions) {
    return { valid: false, error: 'Permissions array is required' };
  }

  // For new roles, permissions should not be empty
  if (permissions.length === 0) {
    return { valid: false, error: 'At least one permission must be selected' };
  }

  // Get all valid permission codes
  const permissionTree = getPermissionTree();
  const validPermissionCodes = new Set(
    permissionTree.flatMap((category) => category.permissions.map((p) => p.code))
  );

  // Check if all provided permissions are valid
  for (const permCode of permissions) {
    if (!validPermissionCodes.has(permCode)) {
      return { valid: false, error: `Invalid permission code: ${permCode}` };
    }
  }

  return { valid: true };
}

/**
 * Checks if a role name already exists (case-insensitive)
 *
 * @param medplum - Medplum client instance
 * @param name - Role name to check
 * @param excludeId - Optional role ID to exclude (for edit scenarios)
 * @returns True if duplicate exists, false otherwise
 */
export async function checkDuplicateRoleName(
  medplum: MedplumClient,
  name: string,
  excludeId?: string
): Promise<boolean> {
  const roles = await searchRoles(medplum, { name: name.trim() });

  // Filter out the role being edited
  const duplicates = roles.filter((role) => {
    if (excludeId && role.id === excludeId) {
      return false;
    }

    const roleNameTag = role.meta?.tag?.find((tag) => tag.system === 'http://medimind.ge/role-identifier');
    return roleNameTag?.display?.toLowerCase() === name.trim().toLowerCase();
  });

  return duplicates.length > 0;
}

/**
 * Checks if a role code already exists
 *
 * @param medplum - Medplum client instance
 * @param code - Role code to check
 * @param excludeId - Optional role ID to exclude (for edit scenarios)
 * @returns True if duplicate exists, false otherwise
 */
export async function checkDuplicateRoleCode(
  medplum: MedplumClient,
  code: string,
  excludeId?: string
): Promise<boolean> {
  const roles = await searchRoles(medplum);

  // Filter out the role being edited
  const duplicates = roles.filter((role) => {
    if (excludeId && role.id === excludeId) {
      return false;
    }

    const roleCodeTag = role.meta?.tag?.find((tag) => tag.system === 'http://medimind.ge/role-identifier');
    return roleCodeTag?.code === code.trim();
  });

  return duplicates.length > 0;
}
