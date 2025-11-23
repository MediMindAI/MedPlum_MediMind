// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { MedplumClient } from '@medplum/core';
import type { AccessPolicy, AccessPolicyResource } from '@medplum/fhirtypes';
import type { PermissionCategory } from '../types/role-management';
import type { PermissionRow, RoleConflict } from '../types/account-management';
import { PERMISSION_RESOURCES, PERMISSION_OPERATIONS } from '../types/account-management';
import { Permission } from '../types/role-management';
import permissionTranslations from '../translations/permissions.json';
import categoryTranslations from '../translations/permission-categories.json';

type SupportedLanguage = 'ka' | 'en' | 'ru';

// Category descriptions for each language
const categoryDescriptions: Record<string, Record<SupportedLanguage, string>> = {
  'patient-management': {
    ka: 'პაციენტის რეგისტრაციის, დემოგრაფიის და ისტორიის უფლებები',
    en: 'Permissions for patient registration, demographics, and history',
    ru: 'Разрешения для регистрации пациентов, демографии и истории',
  },
  'clinical-documentation': {
    ka: 'ვიზიტების, კლინიკური ჩანაწერებისა და სამედიცინო დოკუმენტაციის უფლებები',
    en: 'Permissions for encounters, clinical notes, and medical records',
    ru: 'Разрешения для визитов, клинических заметок и медицинских записей',
  },
  laboratory: {
    ka: 'ლაბორატორიული შეკვეთების, შედეგებისა და ნიმუშების მართვის უფლებები',
    en: 'Permissions for lab orders, results, and specimen management',
    ru: 'Разрешения для лабораторных заказов, результатов и управления образцами',
  },
  'billing-financial': {
    ka: 'ინვოისების, გადახდებისა და სადაზღვევო პრეტენზიების უფლებები',
    en: 'Permissions for invoicing, payments, and insurance claims',
    ru: 'Разрешения для выставления счетов, платежей и страховых претензий',
  },
  administration: {
    ka: 'მომხმარებლების მართვის, როლებისა და სისტემის პარამეტრების უფლებები',
    en: 'Permissions for user management, roles, and system settings',
    ru: 'Разрешения для управления пользователями, ролями и настройками системы',
  },
  reports: {
    ka: 'ანალიტიკის, ექსპორტისა და შესაბამისობის ანგარიშების უფლებები',
    en: 'Permissions for analytics, exports, and compliance reports',
    ru: 'Разрешения для аналитики, экспорта и отчетов о соответствии',
  },
};

// Permission descriptions for each language
const permissionDescriptions: Record<string, Record<SupportedLanguage, string>> = {
  'view-patient-list': {
    ka: 'პაციენტების რეგისტრაციის გვერდზე წვდომა და პაციენტთა სიის ნახვა',
    en: 'Access the patient registration page and view list of patients',
    ru: 'Доступ к странице регистрации пациентов и просмотр списка пациентов',
  },
  'view-patient-demographics': {
    ka: 'პაციენტის პირადი ინფორმაციის ნახვა (სახელი, დაბადების თარიღი, მისამართი და სხვ.)',
    en: 'View patient personal information (name, DOB, address, etc.)',
    ru: 'Просмотр личной информации пациента (имя, дата рождения, адрес и т.д.)',
  },
  'edit-patient-demographics': {
    ka: 'პაციენტის პირადი ინფორმაციის შეცვლა',
    en: 'Modify patient personal information',
    ru: 'Изменение личной информации пациента',
  },
  'create-patient': {
    ka: 'ახალი პაციენტების რეგისტრაცია სისტემაში',
    en: 'Register new patients in the system',
    ru: 'Регистрация новых пациентов в системе',
  },
  'delete-patient': {
    ka: 'პაციენტის ჩანაწერების წაშლა სისტემიდან',
    en: 'Remove patient records from the system',
    ru: 'Удаление записей пациентов из системы',
  },
  'view-patient-history': {
    ka: 'პაციენტის ვიზიტების ისტორიისა და დეტალების ნახვა',
    en: 'View patient visit history and encounter details',
    ru: 'Просмотр истории визитов пациента и деталей посещений',
  },
  'view-encounters': {
    ka: 'პაციენტის ვიზიტებისა და დეტალების ნახვა',
    en: 'View patient encounters and visit details',
    ru: 'Просмотр визитов пациента и деталей посещений',
  },
  'create-encounter': {
    ka: 'ახალი ვიზიტის შექმნა',
    en: 'Create new patient encounters',
    ru: 'Создание новых визитов пациентов',
  },
  'edit-encounter': {
    ka: 'არსებული ვიზიტების რედაქტირება',
    en: 'Modify existing encounters',
    ru: 'Редактирование существующих визитов',
  },
  'view-clinical-notes': {
    ka: 'კლინიკური ჩანაწერებისა და დოკუმენტაციის წაკითხვა',
    en: 'Read clinical notes and documentation',
    ru: 'Чтение клинических заметок и документации',
  },
  'create-clinical-notes': {
    ka: 'ახალი კლინიკური ჩანაწერების შექმნა',
    en: 'Create new clinical notes',
    ru: 'Создание новых клинических заметок',
  },
  'sign-clinical-documents': {
    ka: 'კლინიკური დოკუმენტების ციფრული ხელმოწერა და დამტკიცება',
    en: 'Digitally sign and approve clinical documents',
    ru: 'Цифровая подпись и утверждение клинических документов',
  },
  'view-lab-results': {
    ka: 'ლაბორატორიული კვლევის შედეგების ნახვა',
    en: 'View laboratory test results',
    ru: 'Просмотр результатов лабораторных исследований',
  },
  'order-lab-tests': {
    ka: 'ახალი ლაბორატორიული კვლევების შეკვეთა',
    en: 'Create new laboratory test orders',
    ru: 'Создание новых заказов лабораторных исследований',
  },
  'edit-lab-results': {
    ka: 'ლაბორატორიული კვლევის შედეგების რედაქტირება',
    en: 'Modify laboratory test results',
    ru: 'Редактирование результатов лабораторных исследований',
  },
  'approve-lab-results': {
    ka: 'ლაბორატორიული შედეგების დამტკიცება და დასრულება',
    en: 'Approve and finalize laboratory results',
    ru: 'Утверждение и завершение результатов лабораторных исследований',
  },
  'view-invoices': {
    ka: 'პაციენტის ინვოისებისა და ბილინგის ინფორმაციის ნახვა',
    en: 'View patient invoices and billing information',
    ru: 'Просмотр счетов пациентов и информации о выставлении счетов',
  },
  'create-invoices': {
    ka: 'მომსახურებისთვის ახალი ინვოისების შექმნა',
    en: 'Create new invoices for services',
    ru: 'Создание новых счетов за услуги',
  },
  'process-payments': {
    ka: 'პაციენტის გადახდების დამუშავება და აღრიცხვა',
    en: 'Process and record patient payments',
    ru: 'Обработка и учет платежей пациентов',
  },
  'view-financial-reports': {
    ka: 'ფინანსურ ანგარიშებზე და ანალიტიკაზე წვდომა',
    en: 'Access financial reports and analytics',
    ru: 'Доступ к финансовым отчетам и аналитике',
  },
  'manage-insurance-claims': {
    ka: 'სადაზღვევო პრეტენზიების შექმნა, წარდგენა და მართვა',
    en: 'Create, submit, and manage insurance claims',
    ru: 'Создание, подача и управление страховыми претензиями',
  },
  'view-users': {
    ka: 'ანგარიშების მართვის გვერდზე წვდომა და პრაქტიკოსთა ანგარიშების ნახვა',
    en: 'Access the account management page and view practitioner accounts',
    ru: 'Доступ к странице управления учетными записями и просмотр учетных записей практикующих врачей',
  },
  'create-user': {
    ka: 'ახალი პრაქტიკოსთა ანგარიშების რეგისტრაცია',
    en: 'Register new practitioner accounts',
    ru: 'Регистрация новых учетных записей практикующих врачей',
  },
  'edit-user': {
    ka: 'პრაქტიკოსთა ანგარიშების დეტალების შეცვლა',
    en: 'Modify practitioner account details',
    ru: 'Изменение деталей учетных записей практикующих врачей',
  },
  'view-roles': {
    ka: 'როლების მართვის გვერდზე წვდომა და არსებული როლების ნახვა',
    en: 'Access the role management page and view existing roles',
    ru: 'Доступ к странице управления ролями и просмотр существующих ролей',
  },
  'create-role': {
    ka: 'ახალი როლების შექმნა უფლებებით',
    en: 'Create new roles with permissions',
    ru: 'Создание новых ролей с разрешениями',
  },
  'edit-role': {
    ka: 'არსებული როლების სახელების, აღწერებისა და უფლებების შეცვლა',
    en: 'Modify existing role names, descriptions, and permissions',
    ru: 'Изменение имен, описаний и разрешений существующих ролей',
  },
  'delete-role': {
    ka: 'როლების წაშლა სისტემიდან',
    en: 'Remove roles from the system',
    ru: 'Удаление ролей из системы',
  },
  'assign-roles': {
    ka: 'პრაქტიკოსთა ანგარიშებისთვის როლების დამატება ან წაშლა',
    en: 'Add or remove roles from practitioner accounts',
    ru: 'Добавление или удаление ролей из учетных записей практикующих врачей',
  },
  'view-audit-logs': {
    ka: 'სისტემის აუდიტის ჟურნალსა და უსაფრთხოების ჩანაწერებზე წვდომა',
    en: 'Access system audit trail and security logs',
    ru: 'Доступ к журналу аудита системы и журналам безопасности',
  },
};

/**
 * Helper function to get translated permission name
 */
function getPermissionName(code: string, lang: SupportedLanguage): string {
  const translations = permissionTranslations as Record<string, Record<string, string>>;
  return translations[code]?.[lang] || translations[code]?.en || code;
}

/**
 * Helper function to get translated category name
 */
function getCategoryName(code: string, lang: SupportedLanguage): string {
  const translations = categoryTranslations as Record<string, Record<string, string>>;
  return translations[code]?.[lang] || translations[code]?.en || code;
}

/**
 * Helper function to get translated permission description
 */
function getPermissionDescription(code: string, lang: SupportedLanguage): string {
  return permissionDescriptions[code]?.[lang] || permissionDescriptions[code]?.en || '';
}

/**
 * Helper function to get translated category description
 */
function getCategoryDescription(code: string, lang: SupportedLanguage): string {
  return categoryDescriptions[code]?.[lang] || categoryDescriptions[code]?.en || '';
}

/**
 * Returns the complete permission tree with all 6 categories and permissions
 * Now supports multiple languages
 *
 * @param lang - Language code ('ka', 'en', 'ru')
 * @returns Array of PermissionCategory with nested permissions
 */
export function getPermissionTree(lang: SupportedLanguage = 'en'): PermissionCategory[] {
  return [
    {
      code: 'patient-management',
      name: getCategoryName('patient-management', lang),
      description: getCategoryDescription('patient-management', lang),
      displayOrder: 1,
      icon: 'user',
      permissions: [
        {
          code: 'view-patient-list',
          name: getPermissionName('view-patient-list', lang),
          description: getPermissionDescription('view-patient-list', lang),
          category: 'patient-management',
          resourceType: 'Patient',
          accessLevel: 'read',
        },
        {
          code: 'view-patient-demographics',
          name: getPermissionName('view-patient-demographics', lang),
          description: getPermissionDescription('view-patient-demographics', lang),
          category: 'patient-management',
          resourceType: 'Patient',
          accessLevel: 'read',
        },
        {
          code: 'edit-patient-demographics',
          name: getPermissionName('edit-patient-demographics', lang),
          description: getPermissionDescription('edit-patient-demographics', lang),
          category: 'patient-management',
          resourceType: 'Patient',
          accessLevel: 'write',
          dependencies: ['view-patient-demographics'],
        },
        {
          code: 'create-patient',
          name: getPermissionName('create-patient', lang),
          description: getPermissionDescription('create-patient', lang),
          category: 'patient-management',
          resourceType: 'Patient',
          accessLevel: 'write',
          dependencies: ['view-patient-list'],
        },
        {
          code: 'delete-patient',
          name: getPermissionName('delete-patient', lang),
          description: getPermissionDescription('delete-patient', lang),
          category: 'patient-management',
          resourceType: 'Patient',
          accessLevel: 'delete',
          dependencies: ['view-patient-demographics', 'edit-patient-demographics'],
        },
        {
          code: 'view-patient-history',
          name: getPermissionName('view-patient-history', lang),
          description: getPermissionDescription('view-patient-history', lang),
          category: 'patient-management',
          resourceType: 'Encounter',
          accessLevel: 'read',
          dependencies: ['view-patient-demographics'],
        },
      ],
    },
    {
      code: 'clinical-documentation',
      name: getCategoryName('clinical-documentation', lang),
      description: getCategoryDescription('clinical-documentation', lang),
      displayOrder: 2,
      icon: 'file-text',
      permissions: [
        {
          code: 'view-encounters',
          name: getPermissionName('view-encounters', lang),
          description: getPermissionDescription('view-encounters', lang),
          category: 'clinical-documentation',
          resourceType: 'Encounter',
          accessLevel: 'read',
        },
        {
          code: 'create-encounter',
          name: getPermissionName('create-encounter', lang),
          description: getPermissionDescription('create-encounter', lang),
          category: 'clinical-documentation',
          resourceType: 'Encounter',
          accessLevel: 'write',
          dependencies: ['view-encounters'],
        },
        {
          code: 'edit-encounter',
          name: getPermissionName('edit-encounter', lang),
          description: getPermissionDescription('edit-encounter', lang),
          category: 'clinical-documentation',
          resourceType: 'Encounter',
          accessLevel: 'write',
          dependencies: ['view-encounters'],
        },
        {
          code: 'view-clinical-notes',
          name: getPermissionName('view-clinical-notes', lang),
          description: getPermissionDescription('view-clinical-notes', lang),
          category: 'clinical-documentation',
          resourceType: 'DocumentReference',
          accessLevel: 'read',
        },
        {
          code: 'create-clinical-notes',
          name: getPermissionName('create-clinical-notes', lang),
          description: getPermissionDescription('create-clinical-notes', lang),
          category: 'clinical-documentation',
          resourceType: 'DocumentReference',
          accessLevel: 'write',
          dependencies: ['view-clinical-notes'],
        },
        {
          code: 'sign-clinical-documents',
          name: getPermissionName('sign-clinical-documents', lang),
          description: getPermissionDescription('sign-clinical-documents', lang),
          category: 'clinical-documentation',
          resourceType: 'DocumentReference',
          accessLevel: 'write',
          dependencies: ['view-clinical-notes', 'create-clinical-notes'],
        },
      ],
    },
    {
      code: 'laboratory',
      name: getCategoryName('laboratory', lang),
      description: getCategoryDescription('laboratory', lang),
      displayOrder: 3,
      icon: 'flask',
      permissions: [
        {
          code: 'view-lab-results',
          name: getPermissionName('view-lab-results', lang),
          description: getPermissionDescription('view-lab-results', lang),
          category: 'laboratory',
          resourceType: 'Observation',
          accessLevel: 'read',
        },
        {
          code: 'order-lab-tests',
          name: getPermissionName('order-lab-tests', lang),
          description: getPermissionDescription('order-lab-tests', lang),
          category: 'laboratory',
          resourceType: 'ServiceRequest',
          accessLevel: 'write',
        },
        {
          code: 'edit-lab-results',
          name: getPermissionName('edit-lab-results', lang),
          description: getPermissionDescription('edit-lab-results', lang),
          category: 'laboratory',
          resourceType: 'Observation',
          accessLevel: 'write',
          dependencies: ['view-lab-results'],
        },
        {
          code: 'approve-lab-results',
          name: getPermissionName('approve-lab-results', lang),
          description: getPermissionDescription('approve-lab-results', lang),
          category: 'laboratory',
          resourceType: 'Observation',
          accessLevel: 'write',
          dependencies: ['view-lab-results', 'edit-lab-results'],
        },
      ],
    },
    {
      code: 'billing-financial',
      name: getCategoryName('billing-financial', lang),
      description: getCategoryDescription('billing-financial', lang),
      displayOrder: 4,
      icon: 'currency-dollar',
      permissions: [
        {
          code: 'view-invoices',
          name: getPermissionName('view-invoices', lang),
          description: getPermissionDescription('view-invoices', lang),
          category: 'billing-financial',
          resourceType: 'Invoice',
          accessLevel: 'read',
        },
        {
          code: 'create-invoices',
          name: getPermissionName('create-invoices', lang),
          description: getPermissionDescription('create-invoices', lang),
          category: 'billing-financial',
          resourceType: 'Invoice',
          accessLevel: 'write',
          dependencies: ['view-invoices'],
        },
        {
          code: 'process-payments',
          name: getPermissionName('process-payments', lang),
          description: getPermissionDescription('process-payments', lang),
          category: 'billing-financial',
          resourceType: 'PaymentReconciliation',
          accessLevel: 'write',
        },
        {
          code: 'view-financial-reports',
          name: getPermissionName('view-financial-reports', lang),
          description: getPermissionDescription('view-financial-reports', lang),
          category: 'billing-financial',
          resourceType: 'Invoice',
          accessLevel: 'read',
        },
        {
          code: 'manage-insurance-claims',
          name: getPermissionName('manage-insurance-claims', lang),
          description: getPermissionDescription('manage-insurance-claims', lang),
          category: 'billing-financial',
          resourceType: 'Claim',
          accessLevel: 'write',
        },
      ],
    },
    {
      code: 'administration',
      name: getCategoryName('administration', lang),
      description: getCategoryDescription('administration', lang),
      displayOrder: 5,
      icon: 'settings',
      permissions: [
        {
          code: 'view-users',
          name: getPermissionName('view-users', lang),
          description: getPermissionDescription('view-users', lang),
          category: 'administration',
          resourceType: 'Practitioner',
          accessLevel: 'read',
        },
        {
          code: 'create-user',
          name: getPermissionName('create-user', lang),
          description: getPermissionDescription('create-user', lang),
          category: 'administration',
          resourceType: 'Practitioner',
          accessLevel: 'write',
          dependencies: ['view-users'],
        },
        {
          code: 'edit-user',
          name: getPermissionName('edit-user', lang),
          description: getPermissionDescription('edit-user', lang),
          category: 'administration',
          resourceType: 'Practitioner',
          accessLevel: 'write',
          dependencies: ['view-users'],
        },
        {
          code: 'view-roles',
          name: getPermissionName('view-roles', lang),
          description: getPermissionDescription('view-roles', lang),
          category: 'administration',
          resourceType: 'AccessPolicy',
          accessLevel: 'read',
        },
        {
          code: 'create-role',
          name: getPermissionName('create-role', lang),
          description: getPermissionDescription('create-role', lang),
          category: 'administration',
          resourceType: 'AccessPolicy',
          accessLevel: 'write',
          dependencies: ['view-roles'],
        },
        {
          code: 'edit-role',
          name: getPermissionName('edit-role', lang),
          description: getPermissionDescription('edit-role', lang),
          category: 'administration',
          resourceType: 'AccessPolicy',
          accessLevel: 'write',
          dependencies: ['view-roles'],
        },
        {
          code: 'delete-role',
          name: getPermissionName('delete-role', lang),
          description: getPermissionDescription('delete-role', lang),
          category: 'administration',
          resourceType: 'AccessPolicy',
          accessLevel: 'delete',
          dependencies: ['view-roles', 'edit-role'],
        },
        {
          code: 'assign-roles',
          name: getPermissionName('assign-roles', lang),
          description: getPermissionDescription('assign-roles', lang),
          category: 'administration',
          resourceType: 'PractitionerRole',
          accessLevel: 'write',
          dependencies: ['view-roles', 'view-users'],
        },
        {
          code: 'view-audit-logs',
          name: getPermissionName('view-audit-logs', lang),
          description: getPermissionDescription('view-audit-logs', lang),
          category: 'administration',
          resourceType: 'AuditEvent',
          accessLevel: 'read',
        },
      ],
    },
    {
      code: 'reports',
      name: getCategoryName('reports', lang),
      description: getCategoryDescription('reports', lang),
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

// ============================================================================
// Permission Matrix Functions (FHIR AccessPolicy-based)
// ============================================================================

/**
 * Default permission row with all operations set to false
 *
 * @param resourceType - FHIR resource type
 * @returns PermissionRow with all operations false
 */
function createDefaultPermissionRow(resourceType: string): PermissionRow {
  return {
    resourceType,
    create: false,
    read: false,
    update: false,
    delete: false,
    search: false,
  };
}

/**
 * Gets the permission matrix for a role (AccessPolicy)
 * Returns a row for each PERMISSION_RESOURCES with CRUD+search operations
 *
 * @param medplum - MedplumClient instance
 * @param policyId - AccessPolicy resource ID
 * @returns Promise<PermissionRow[]> - Array of permission rows for each resource type
 * @throws Error if AccessPolicy not found or fetch fails
 *
 * @example
 * ```typescript
 * const matrix = await getPermissionMatrix(medplum, 'abc123');
 * // [
 * //   { resourceType: 'Patient', create: true, read: true, update: true, delete: false, search: true },
 * //   { resourceType: 'Practitioner', create: false, read: true, update: false, delete: false, search: true },
 * //   ...
 * // ]
 * ```
 */
export async function getPermissionMatrix(
  medplum: MedplumClient,
  policyId: string
): Promise<PermissionRow[]> {
  // Fetch the AccessPolicy resource
  const policy = await medplum.readResource('AccessPolicy', policyId);

  // Initialize matrix with all resources set to false
  const matrix: Map<string, PermissionRow> = new Map();
  for (const resourceType of PERMISSION_RESOURCES) {
    matrix.set(resourceType, createDefaultPermissionRow(resourceType));
  }

  // Parse AccessPolicy.resource rules into permission matrix
  if (policy.resource) {
    for (const rule of policy.resource) {
      const resourceType = rule.resourceType;
      if (!resourceType || !matrix.has(resourceType)) {
        continue; // Skip resources not in our PERMISSION_RESOURCES list
      }

      const row = matrix.get(resourceType)!;

      // In FHIR AccessPolicy, readonly: true means only read/search allowed
      // readonly: false (or undefined) means all operations allowed
      const readonly = rule.readonly ?? false;

      if (readonly) {
        // Read-only: enable read and search only
        row.read = true;
        row.search = true;
      } else {
        // Full access: enable all operations
        row.create = true;
        row.read = true;
        row.update = true;
        row.delete = true;
        row.search = true;
      }
    }
  }

  return Array.from(matrix.values());
}

/**
 * Updates the permission matrix for a role (AccessPolicy)
 * Converts PermissionRow[] back to AccessPolicy.resource rules
 *
 * @param medplum - MedplumClient instance
 * @param policyId - AccessPolicy resource ID
 * @param permissions - Array of PermissionRow with updated permissions
 * @returns Promise<AccessPolicy> - Updated AccessPolicy resource
 * @throws Error if AccessPolicy not found or update fails
 *
 * @example
 * ```typescript
 * const permissions = [
 *   { resourceType: 'Patient', create: true, read: true, update: true, delete: false, search: true },
 *   { resourceType: 'Practitioner', create: false, read: true, update: false, delete: false, search: true },
 * ];
 * const updated = await updatePermissionMatrix(medplum, 'abc123', permissions);
 * ```
 */
export async function updatePermissionMatrix(
  medplum: MedplumClient,
  policyId: string,
  permissions: PermissionRow[]
): Promise<AccessPolicy> {
  // Fetch existing AccessPolicy to preserve other fields
  const existingPolicy = await medplum.readResource('AccessPolicy', policyId);

  // Convert PermissionRow[] to AccessPolicyResource[]
  const resources: AccessPolicyResource[] = [];

  for (const row of permissions) {
    // Skip if no permissions are granted for this resource
    if (!row.create && !row.read && !row.update && !row.delete && !row.search) {
      continue;
    }

    // Determine if this is read-only (only read and/or search enabled)
    const isReadOnly = !row.create && !row.update && !row.delete && (row.read || row.search);

    resources.push({
      resourceType: row.resourceType,
      readonly: isReadOnly,
    });
  }

  // Update the AccessPolicy
  const updatedPolicy: AccessPolicy = {
    ...existingPolicy,
    resource: resources,
  };

  return medplum.updateResource(updatedPolicy);
}

// ============================================================================
// Role Conflict Detection
// ============================================================================

/**
 * Role codes that are considered administrative roles
 */
const ADMIN_ROLES = ['admin', 'administrator', 'superadmin', 'super-admin', 'system-admin'];

/**
 * Role codes that are considered billing roles
 */
const BILLING_ROLES = ['billing', 'billing-admin', 'finance', 'accountant', 'cashier'];

/**
 * Role hierarchy where higher roles include permissions of lower roles
 */
const ROLE_HIERARCHY: Record<string, string[]> = {
  superadmin: ['admin', 'manager', 'physician', 'nurse', 'receptionist'],
  'super-admin': ['admin', 'manager', 'physician', 'nurse', 'receptionist'],
  admin: ['manager', 'physician', 'nurse', 'receptionist'],
  administrator: ['manager', 'physician', 'nurse', 'receptionist'],
  manager: ['receptionist'],
};

/**
 * Detects role conflicts based on separation of duties and redundant roles
 * Implements the following rules:
 * - 'separation_of_duties': admin role + billing role is a conflict (error severity)
 * - 'redundant_roles': superadmin includes admin permissions (warning severity)
 * - 'permission_conflict': conflicting resource access rules (warning severity)
 *
 * @param roles - Array of role codes to check for conflicts
 * @returns RoleConflict[] - Array of detected conflicts
 *
 * @example
 * ```typescript
 * const conflicts = detectRoleConflicts(['admin', 'billing']);
 * // [{ type: 'separation_of_duties', roles: ['admin', 'billing'], message: '...', severity: 'error' }]
 *
 * const conflicts2 = detectRoleConflicts(['superadmin', 'admin']);
 * // [{ type: 'redundant_roles', roles: ['superadmin', 'admin'], message: '...', severity: 'warning' }]
 * ```
 */
export function detectRoleConflicts(roles: string[]): RoleConflict[] {
  const conflicts: RoleConflict[] = [];
  const normalizedRoles = roles.map((r) => r.toLowerCase());

  // Check for separation of duties violations (admin + billing)
  const hasAdminRole = normalizedRoles.some((r) => ADMIN_ROLES.includes(r));
  const hasBillingRole = normalizedRoles.some((r) => BILLING_ROLES.includes(r));

  if (hasAdminRole && hasBillingRole) {
    const adminRolesFound = normalizedRoles.filter((r) => ADMIN_ROLES.includes(r));
    const billingRolesFound = normalizedRoles.filter((r) => BILLING_ROLES.includes(r));

    conflicts.push({
      type: 'separation_of_duties',
      roles: [...adminRolesFound, ...billingRolesFound],
      message:
        'Separation of duties violation: Administrative and billing roles should not be assigned to the same user. ' +
        'This combination presents a fraud risk as the user could create accounts and process payments.',
      severity: 'error',
    });
  }

  // Check for redundant roles (higher role includes lower role permissions)
  for (const role of normalizedRoles) {
    const includedRoles = ROLE_HIERARCHY[role];
    if (includedRoles) {
      const redundantRoles = normalizedRoles.filter((r) => r !== role && includedRoles.includes(r));
      if (redundantRoles.length > 0) {
        conflicts.push({
          type: 'redundant_roles',
          roles: [role, ...redundantRoles],
          message:
            `Redundant role assignment: "${role}" already includes permissions from: ${redundantRoles.join(', ')}. ` +
            'Consider removing the redundant lower-level roles to simplify permission management.',
          severity: 'warning',
        });
      }
    }
  }

  // Check for permission conflicts (same resource with conflicting access levels)
  // This is detected by checking if multiple roles grant different access to the same resource
  // For simplicity, we flag when a read-only role is combined with a write role for the same resource type
  const readOnlyRoles = ['viewer', 'read-only', 'readonly', 'auditor', 'observer'];
  const writeRoles = ['editor', 'creator', 'admin', 'administrator', 'manager'];

  const hasReadOnlyRole = normalizedRoles.some((r) => readOnlyRoles.includes(r));
  const hasWriteRole = normalizedRoles.some((r) => writeRoles.includes(r));

  if (hasReadOnlyRole && hasWriteRole) {
    const readOnlyFound = normalizedRoles.filter((r) => readOnlyRoles.includes(r));
    const writeFound = normalizedRoles.filter((r) => writeRoles.includes(r));

    conflicts.push({
      type: 'permission_conflict',
      roles: [...readOnlyFound, ...writeFound],
      message:
        `Permission conflict: Read-only roles (${readOnlyFound.join(', ')}) conflict with ` +
        `write roles (${writeFound.join(', ')}). The write permissions will override read-only restrictions.`,
      severity: 'warning',
    });
  }

  return conflicts;
}

// ============================================================================
// Permission Dependency Resolution (Resource/Operation based)
// ============================================================================

/**
 * Permission dependencies based on CRUD operations
 * - update requires read
 * - delete requires read
 * - search requires read (implicit)
 */
const OPERATION_DEPENDENCIES: Record<string, string[]> = {
  update: ['read'],
  delete: ['read'],
  search: ['read'],
  create: [], // create does not require other permissions
  read: [], // read has no dependencies
};

/**
 * Resolves permission dependencies for resource-level operations
 * Auto-enables required permissions based on dependencies:
 * - update requires read
 * - delete requires read
 * - search requires read
 *
 * @param resourceType - FHIR resource type (e.g., 'Patient', 'Observation')
 * @param operation - CRUD operation ('create', 'read', 'update', 'delete', 'search')
 * @param currentPermissions - Current permission matrix
 * @returns PermissionRow[] - Updated permission matrix with dependencies resolved
 *
 * @example
 * ```typescript
 * // If user enables 'update' for Patient, 'read' is auto-enabled
 * const current = [{ resourceType: 'Patient', create: false, read: false, update: true, delete: false, search: false }];
 * const resolved = resolvePermissionDependenciesForOperation('Patient', 'update', current);
 * // Result: [{ resourceType: 'Patient', create: false, read: true, update: true, delete: false, search: false }]
 * ```
 */
export function resolvePermissionDependenciesForOperation(
  resourceType: string,
  operation: string,
  currentPermissions: PermissionRow[]
): PermissionRow[] {
  // Validate operation
  if (!PERMISSION_OPERATIONS.includes(operation as (typeof PERMISSION_OPERATIONS)[number])) {
    return currentPermissions;
  }

  // Create a deep copy to avoid mutating the input
  const result = currentPermissions.map((row) => ({ ...row }));

  // Find the row for the specified resource type
  const targetRow = result.find((row) => row.resourceType === resourceType);
  if (!targetRow) {
    return result;
  }

  // Get dependencies for the operation
  const dependencies = OPERATION_DEPENDENCIES[operation] || [];

  // Auto-enable each dependency
  for (const dep of dependencies) {
    if (dep === 'read') {
      targetRow.read = true;
    } else if (dep === 'search') {
      targetRow.search = true;
    }
    // Add more dependencies as needed
  }

  return result;
}

// ============================================================================
// Combined Permissions from Multiple Roles
// ============================================================================

/**
 * Merges permissions from multiple AccessPolicy resources
 * Uses union logic: if any role grants a permission, it's enabled in the result
 *
 * @param medplum - MedplumClient instance
 * @param roleIds - Array of AccessPolicy resource IDs
 * @returns Promise<PermissionRow[]> - Combined permission matrix
 * @throws Error if any AccessPolicy fetch fails
 *
 * @example
 * ```typescript
 * // User has 'physician' and 'lab-tech' roles
 * const combined = await getCombinedPermissions(medplum, ['role-physician-id', 'role-lab-tech-id']);
 * // Result merges permissions from both roles
 * ```
 */
export async function getCombinedPermissions(
  medplum: MedplumClient,
  roleIds: string[]
): Promise<PermissionRow[]> {
  if (roleIds.length === 0) {
    // Return empty permissions for all resources
    return PERMISSION_RESOURCES.map((rt) => createDefaultPermissionRow(rt));
  }

  // Fetch permission matrix for each role
  const matrices = await Promise.all(roleIds.map((id) => getPermissionMatrix(medplum, id)));

  // Initialize combined matrix with all resources set to false
  const combined: Map<string, PermissionRow> = new Map();
  for (const resourceType of PERMISSION_RESOURCES) {
    combined.set(resourceType, createDefaultPermissionRow(resourceType));
  }

  // Merge permissions using union logic
  for (const matrix of matrices) {
    for (const row of matrix) {
      const combinedRow = combined.get(row.resourceType);
      if (combinedRow) {
        // Union: if any role grants the permission, enable it
        combinedRow.create = combinedRow.create || row.create;
        combinedRow.read = combinedRow.read || row.read;
        combinedRow.update = combinedRow.update || row.update;
        combinedRow.delete = combinedRow.delete || row.delete;
        combinedRow.search = combinedRow.search || row.search;
      }
    }
  }

  return Array.from(combined.values());
}
