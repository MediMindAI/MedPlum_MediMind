// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

export interface RoleFormValues {
  code: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  permissions: string[];
  createdDate?: string;
  lastModified?: string;
  userCount?: number;
}

export interface RoleRow {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  permissionCount: number;
  userCount: number;
  createdDate: string;
  lastModified: string;
}

export interface Permission {
  code: string;
  name: string;
  description: string;
  category: string;
  displayOrder: number;
  resourceType?: string;
  accessLevel: 'read' | 'write' | 'delete' | 'admin';
  dependencies?: string[];
  icon?: string;
  dangerous?: boolean;
}

export interface PermissionCategory {
  code: string;
  name: string;
  description: string;
  displayOrder: number;
  icon?: string;
  permissions: Permission[];
}

export interface PermissionNode {
  code: string;
  name: string;
  description: string;
  children?: PermissionNode[];
  parent?: string;
  level: number;
}

/**
 * Predefined role template for quick role creation
 */
export interface RoleTemplate {
  /** Unique template code, e.g., "physician" */
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
