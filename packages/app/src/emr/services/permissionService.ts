// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { AccessPolicy, AccessPolicyResource } from '@medplum/fhirtypes';
import type { PermissionCategory } from '../types/role-management';
import { Permission } from '../types/role-management';

/**
 * Returns the complete permission tree with all 6 categories and permissions
 *
 * @returns Array of PermissionCategory with nested permissions
 */
export function getPermissionTree(): PermissionCategory[] {
  return [
    {
      code: 'patient-management',
      name: 'Patient Management',
      description: 'Permissions for patient registration, demographics, and history',
      displayOrder: 1,
      icon: 'user',
      permissions: [
        {
          code: 'view-patient-list',
          name: 'View Patient List',
          description: 'Access the patient registration page and view list of patients',
          category: 'patient-management',
          resourceType: 'Patient',
          accessLevel: 'read',
        },
        {
          code: 'view-patient-demographics',
          name: 'View Patient Demographics',
          description: 'View patient personal information (name, DOB, address, etc.)',
          category: 'patient-management',
          resourceType: 'Patient',
          accessLevel: 'read',
        },
        {
          code: 'edit-patient-demographics',
          name: 'Edit Patient Demographics',
          description: 'Modify patient personal information',
          category: 'patient-management',
          resourceType: 'Patient',
          accessLevel: 'write',
          dependencies: ['view-patient-demographics'],
        },
        {
          code: 'create-patient',
          name: 'Create New Patient',
          description: 'Register new patients in the system',
          category: 'patient-management',
          resourceType: 'Patient',
          accessLevel: 'write',
          dependencies: ['view-patient-list'],
        },
        {
          code: 'delete-patient',
          name: 'Delete Patient',
          description: 'Remove patient records from the system',
          category: 'patient-management',
          resourceType: 'Patient',
          accessLevel: 'delete',
          dependencies: ['view-patient-demographics', 'edit-patient-demographics'],
        },
        {
          code: 'view-patient-history',
          name: 'Access Patient History',
          description: 'View patient visit history and encounter details',
          category: 'patient-management',
          resourceType: 'Encounter',
          accessLevel: 'read',
          dependencies: ['view-patient-demographics'],
        },
      ],
    },
    {
      code: 'clinical-documentation',
      name: 'Clinical Documentation',
      description: 'Permissions for encounters, clinical notes, and medical records',
      displayOrder: 2,
      icon: 'file-text',
      permissions: [
        {
          code: 'view-encounters',
          name: 'View Encounters',
          description: 'View patient encounters and visit details',
          category: 'clinical-documentation',
          resourceType: 'Encounter',
          accessLevel: 'read',
        },
        {
          code: 'create-encounter',
          name: 'Create Encounter',
          description: 'Create new patient encounters',
          category: 'clinical-documentation',
          resourceType: 'Encounter',
          accessLevel: 'write',
          dependencies: ['view-encounters'],
        },
        {
          code: 'edit-encounter',
          name: 'Edit Encounter',
          description: 'Modify existing encounters',
          category: 'clinical-documentation',
          resourceType: 'Encounter',
          accessLevel: 'write',
          dependencies: ['view-encounters'],
        },
        {
          code: 'view-clinical-notes',
          name: 'View Clinical Notes',
          description: 'Read clinical notes and documentation',
          category: 'clinical-documentation',
          resourceType: 'DocumentReference',
          accessLevel: 'read',
        },
        {
          code: 'create-clinical-notes',
          name: 'Create Clinical Notes',
          description: 'Create new clinical notes',
          category: 'clinical-documentation',
          resourceType: 'DocumentReference',
          accessLevel: 'write',
          dependencies: ['view-clinical-notes'],
        },
        {
          code: 'sign-clinical-documents',
          name: 'Sign Clinical Documents',
          description: 'Digitally sign and approve clinical documents',
          category: 'clinical-documentation',
          resourceType: 'DocumentReference',
          accessLevel: 'write',
          dependencies: ['view-clinical-notes', 'create-clinical-notes'],
        },
      ],
    },
    {
      code: 'laboratory',
      name: 'Laboratory',
      description: 'Permissions for lab orders, results, and specimen management',
      displayOrder: 3,
      icon: 'flask',
      permissions: [
        {
          code: 'view-lab-results',
          name: 'View Lab Results',
          description: 'View laboratory test results',
          category: 'laboratory',
          resourceType: 'Observation',
          accessLevel: 'read',
        },
        {
          code: 'order-lab-tests',
          name: 'Order Lab Tests',
          description: 'Create new laboratory test orders',
          category: 'laboratory',
          resourceType: 'ServiceRequest',
          accessLevel: 'write',
        },
        {
          code: 'edit-lab-results',
          name: 'Edit Lab Results',
          description: 'Modify laboratory test results',
          category: 'laboratory',
          resourceType: 'Observation',
          accessLevel: 'write',
          dependencies: ['view-lab-results'],
        },
        {
          code: 'approve-lab-results',
          name: 'Approve Lab Results',
          description: 'Approve and finalize laboratory results',
          category: 'laboratory',
          resourceType: 'Observation',
          accessLevel: 'write',
          dependencies: ['view-lab-results', 'edit-lab-results'],
        },
      ],
    },
    {
      code: 'billing-financial',
      name: 'Billing & Financial',
      description: 'Permissions for invoicing, payments, and insurance claims',
      displayOrder: 4,
      icon: 'currency-dollar',
      permissions: [
        {
          code: 'view-invoices',
          name: 'View Invoices',
          description: 'View patient invoices and billing information',
          category: 'billing-financial',
          resourceType: 'Invoice',
          accessLevel: 'read',
        },
        {
          code: 'create-invoices',
          name: 'Create Invoices',
          description: 'Create new invoices for services',
          category: 'billing-financial',
          resourceType: 'Invoice',
          accessLevel: 'write',
          dependencies: ['view-invoices'],
        },
        {
          code: 'process-payments',
          name: 'Process Payments',
          description: 'Process and record patient payments',
          category: 'billing-financial',
          resourceType: 'PaymentReconciliation',
          accessLevel: 'write',
        },
        {
          code: 'view-financial-reports',
          name: 'View Financial Reports',
          description: 'Access financial reports and analytics',
          category: 'billing-financial',
          resourceType: 'Invoice',
          accessLevel: 'read',
        },
        {
          code: 'manage-insurance-claims',
          name: 'Manage Insurance Claims',
          description: 'Create, submit, and manage insurance claims',
          category: 'billing-financial',
          resourceType: 'Claim',
          accessLevel: 'write',
        },
      ],
    },
    {
      code: 'administration',
      name: 'Administration',
      description: 'Permissions for user management, roles, and system settings',
      displayOrder: 5,
      icon: 'settings',
      permissions: [
        {
          code: 'view-users',
          name: 'View User Accounts',
          description: 'Access the account management page and view practitioner accounts',
          category: 'administration',
          resourceType: 'Practitioner',
          accessLevel: 'read',
        },
        {
          code: 'create-user',
          name: 'Create User Accounts',
          description: 'Register new practitioner accounts',
          category: 'administration',
          resourceType: 'Practitioner',
          accessLevel: 'write',
          dependencies: ['view-users'],
        },
        {
          code: 'edit-user',
          name: 'Edit User Accounts',
          description: 'Modify practitioner account details',
          category: 'administration',
          resourceType: 'Practitioner',
          accessLevel: 'write',
          dependencies: ['view-users'],
        },
        {
          code: 'view-roles',
          name: 'View Roles',
          description: 'Access the role management page and view existing roles',
          category: 'administration',
          resourceType: 'AccessPolicy',
          accessLevel: 'read',
        },
        {
          code: 'create-role',
          name: 'Create Roles',
          description: 'Create new roles with permissions',
          category: 'administration',
          resourceType: 'AccessPolicy',
          accessLevel: 'write',
          dependencies: ['view-roles'],
        },
        {
          code: 'edit-role',
          name: 'Edit Roles',
          description: 'Modify existing role names, descriptions, and permissions',
          category: 'administration',
          resourceType: 'AccessPolicy',
          accessLevel: 'write',
          dependencies: ['view-roles'],
        },
        {
          code: 'delete-role',
          name: 'Delete Roles',
          description: 'Remove roles from the system',
          category: 'administration',
          resourceType: 'AccessPolicy',
          accessLevel: 'delete',
          dependencies: ['view-roles', 'edit-role'],
        },
        {
          code: 'assign-roles',
          name: 'Assign Roles to Users',
          description: 'Add or remove roles from practitioner accounts',
          category: 'administration',
          resourceType: 'PractitionerRole',
          accessLevel: 'write',
          dependencies: ['view-roles', 'view-users'],
        },
        {
          code: 'view-audit-logs',
          name: 'View Audit Logs',
          description: 'Access system audit trail and security logs',
          category: 'administration',
          resourceType: 'AuditEvent',
          accessLevel: 'read',
        },
      ],
    },
    {
      code: 'reports',
      name: 'Reports',
      description: 'Permissions for analytics, exports, and compliance reports',
      displayOrder: 6,
      icon: 'chart-bar',
      permissions: [],
    },
  ];
}

/**
 * Resolves permission dependencies by auto-enabling parent permissions
 *
 * @param selectedPermissions - Array of selected permission codes
 * @returns Array of permission codes with dependencies resolved
 */
export function resolvePermissionDependencies(selectedPermissions: string[]): string[] {
  const permissionTree = getPermissionTree();
  const allPermissions = permissionTree.flatMap((category) => category.permissions);

  const resolvedSet = new Set<string>(selectedPermissions);

  // Iterate until no new dependencies are added
  let added = true;
  while (added) {
    added = false;
    for (const permCode of Array.from(resolvedSet)) {
      const permission = allPermissions.find((p) => p.code === permCode);
      if (permission?.dependencies) {
        for (const dep of permission.dependencies) {
          if (!resolvedSet.has(dep)) {
            resolvedSet.add(dep);
            added = true;
          }
        }
      }
    }
  }

  return Array.from(resolvedSet);
}

/**
 * Converts permission codes to AccessPolicy resource rules
 *
 * @param permissions - Array of permission codes
 * @returns Array of AccessPolicyResource
 */
export function permissionsToAccessPolicy(permissions: string[]): AccessPolicyResource[] {
  const permissionTree = getPermissionTree();
  const allPermissions = permissionTree.flatMap((category) => category.permissions);

  // Map resource type to readonly status
  const resourceMap = new Map<string, boolean>();

  permissions.forEach((permCode) => {
    const permission = allPermissions.find((p) => p.code === permCode);
    if (permission?.resourceType) {
      const readonly = permission.accessLevel === 'read';
      const existing = resourceMap.get(permission.resourceType);

      // If any permission is read-write, resource is read-write
      resourceMap.set(permission.resourceType, existing !== undefined ? existing && readonly : readonly);
    }
  });

  return Array.from(resourceMap.entries()).map(([resourceType, readonly]) => ({
    resourceType,
    readonly,
  }));
}

/**
 * Extracts permission codes from an AccessPolicy resource
 *
 * @param policy - AccessPolicy resource
 * @returns Array of permission codes
 */
export function accessPolicyToPermissions(policy: AccessPolicy): string[] {
  const permissionTree = getPermissionTree();
  const allPermissions = permissionTree.flatMap((category) => category.permissions);

  const selectedPermissions: string[] = [];

  // Extract resource types from AccessPolicy
  const resources = policy.resource || [];

  resources.forEach((resource) => {
    const resourceType = resource.resourceType;
    const readonly = resource.readonly ?? false;

    // Find matching permissions
    const matchingPermissions = allPermissions.filter((p) => {
      if (p.resourceType !== resourceType) {
        return false;
      }

      // If resource is read-only, only include 'read' permissions
      if (readonly) {
        return p.accessLevel === 'read';
      }

      // If resource is read-write, include all permissions for that resource
      return true;
    });

    matchingPermissions.forEach((p) => {
      if (!selectedPermissions.includes(p.code)) {
        selectedPermissions.push(p.code);
      }
    });
  });

  return selectedPermissions;
}
