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
  resourceType?: string;
  accessLevel: 'read' | 'write' | 'delete' | 'admin';
  dependencies?: string[];
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
