// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import {
  IconShieldCheck,
  IconStethoscope,
  IconHeartbeat,
  IconCalendar,
  IconFlask,
  IconPlus,
} from '@tabler/icons-react';
import type { TablerIconsProps } from '@tabler/icons-react';
import type { FC } from 'react';

/**
 * Role template for quick role creation
 */
export interface RoleTemplate {
  /** Unique template identifier */
  id: string;
  /** English name */
  name: string;
  /** Georgian name */
  nameKa: string;
  /** Russian name */
  nameRu: string;
  /** Template description */
  description: string;
  /** Georgian description */
  descriptionKa: string;
  /** Russian description */
  descriptionRu: string;
  /** Icon component */
  icon: FC<TablerIconsProps>;
  /** Icon/accent color (hex) */
  color: string;
  /** Number of pre-configured permissions */
  permissionCount: number;
  /** Pre-configured permission codes */
  permissions: string[];
  /** Suggested role code (auto-generated from name) */
  suggestedCode: string;
  /** Whether this template is recommended for new users */
  recommended?: boolean;
  /** Display order */
  order: number;
}

/**
 * Pre-configured role templates for quick onboarding
 *
 * These templates provide common role configurations for healthcare settings.
 * Users can select a template to pre-fill the role creation form with
 * appropriate permissions.
 */
export const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: 'admin',
    name: 'Administrator',
    nameKa: 'ადმინისტრატორი',
    nameRu: 'Администратор',
    description: 'Full system access with all permissions',
    descriptionKa: 'სრული სისტემის წვდომა ყველა უფლებით',
    descriptionRu: 'Полный доступ к системе со всеми разрешениями',
    icon: IconShieldCheck,
    color: '#1a365d',
    permissionCount: 34,
    suggestedCode: 'admin',
    order: 1,
    permissions: [
      // Patient Management - ALL
      'view-patient-demographics',
      'edit-patient-demographics',
      'create-patient',
      'delete-patient',
      'search-patients',
      'export-patient-data',
      // Clinical Documentation - ALL
      'view-encounters',
      'create-encounters',
      'edit-encounters',
      'delete-encounters',
      'view-clinical-notes',
      'create-clinical-notes',
      // Laboratory - ALL
      'view-lab-orders',
      'create-lab-orders',
      'view-lab-results',
      'edit-lab-results',
      // Billing & Financial - ALL
      'view-billing',
      'create-invoices',
      'edit-invoices',
      'process-payments',
      'view-financial-reports',
      // Administration - ALL
      'manage-users',
      'manage-roles',
      'view-audit-logs',
      'manage-system-settings',
      'manage-integrations',
      'backup-restore',
      'manage-templates',
      'manage-workflows',
      'manage-notifications',
      // Reports - ALL
      'view-reports',
      'create-reports',
      'export-reports',
      'schedule-reports',
    ],
  },
  {
    id: 'physician',
    name: 'Physician',
    nameKa: 'ექიმი',
    nameRu: 'Врач',
    description: 'Clinical access for patient care and documentation',
    descriptionKa: 'კლინიკური წვდომა პაციენტის მოვლისა და დოკუმენტაციისთვის',
    descriptionRu: 'Клинический доступ для ухода за пациентами и документации',
    icon: IconStethoscope,
    color: '#2b6cb0',
    permissionCount: 18,
    suggestedCode: 'physician',
    recommended: true,
    order: 2,
    permissions: [
      // Patient Management
      'view-patient-demographics',
      'edit-patient-demographics',
      'create-patient',
      'search-patients',
      // Clinical Documentation - FULL
      'view-encounters',
      'create-encounters',
      'edit-encounters',
      'view-clinical-notes',
      'create-clinical-notes',
      // Laboratory
      'view-lab-orders',
      'create-lab-orders',
      'view-lab-results',
      // Billing (view only)
      'view-billing',
      // Reports
      'view-reports',
      'create-reports',
      'export-reports',
      // Administration (limited)
      'view-audit-logs',
      'manage-templates',
    ],
  },
  {
    id: 'nurse',
    name: 'Nurse',
    nameKa: 'ექთანი',
    nameRu: 'Медсестра',
    description: 'Patient care, vitals, and clinical documentation',
    descriptionKa: 'პაციენტის მოვლა, სასიცოცხლო მაჩვენებლები და დოკუმენტაცია',
    descriptionRu: 'Уход за пациентами, показатели жизненных функций и документация',
    icon: IconHeartbeat,
    color: '#10b981',
    permissionCount: 14,
    suggestedCode: 'nurse',
    order: 3,
    permissions: [
      // Patient Management
      'view-patient-demographics',
      'edit-patient-demographics',
      'search-patients',
      // Clinical Documentation
      'view-encounters',
      'create-encounters',
      'edit-encounters',
      'view-clinical-notes',
      'create-clinical-notes',
      // Laboratory (view only)
      'view-lab-orders',
      'view-lab-results',
      // Billing (view only)
      'view-billing',
      // Reports (view only)
      'view-reports',
      // Administration (limited)
      'view-audit-logs',
      'manage-notifications',
    ],
  },
  {
    id: 'receptionist',
    name: 'Receptionist',
    nameKa: 'რეგისტრატორი',
    nameRu: 'Регистратор',
    description: 'Patient registration, scheduling, and billing',
    descriptionKa: 'პაციენტის რეგისტრაცია, დაგეგმვა და ანგარიშფაქტურები',
    descriptionRu: 'Регистрация пациентов, расписание и выставление счетов',
    icon: IconCalendar,
    color: '#f59e0b',
    permissionCount: 10,
    suggestedCode: 'receptionist',
    order: 4,
    permissions: [
      // Patient Management
      'view-patient-demographics',
      'edit-patient-demographics',
      'create-patient',
      'search-patients',
      // Clinical (limited)
      'view-encounters',
      'create-encounters',
      // Billing
      'view-billing',
      'create-invoices',
      'process-payments',
      // Reports (limited)
      'view-reports',
    ],
  },
  {
    id: 'lab-tech',
    name: 'Lab Technician',
    nameKa: 'ლაბორანტი',
    nameRu: 'Лаборант',
    description: 'Laboratory orders, results, and specimen management',
    descriptionKa: 'ლაბორატორიული შეკვეთები, შედეგები და ნიმუშების მართვა',
    descriptionRu: 'Лабораторные заказы, результаты и управление образцами',
    icon: IconFlask,
    color: '#8b5cf6',
    permissionCount: 8,
    suggestedCode: 'lab-tech',
    order: 5,
    permissions: [
      // Patient Management (limited)
      'view-patient-demographics',
      'search-patients',
      // Clinical (limited)
      'view-encounters',
      // Laboratory - FULL
      'view-lab-orders',
      'create-lab-orders',
      'view-lab-results',
      'edit-lab-results',
      // Reports (limited)
      'view-reports',
    ],
  },
  {
    id: 'custom',
    name: 'Custom Role',
    nameKa: 'სხვა როლი',
    nameRu: 'Другая роль',
    description: 'Start from scratch with no pre-selected permissions',
    descriptionKa: 'დაიწყეთ ნულიდან წინასწარ არჩეული უფლებების გარეშე',
    descriptionRu: 'Начните с нуля без предварительно выбранных разрешений',
    icon: IconPlus,
    color: '#6b7280',
    permissionCount: 0,
    suggestedCode: '',
    order: 6,
    permissions: [],
  },
];

/**
 * Get a role template by ID
 * @param id - Template ID
 * @returns Role template or undefined
 */
export function getRoleTemplateById(id: string): RoleTemplate | undefined {
  return ROLE_TEMPLATES.find((template) => template.id === id);
}

/**
 * Get role templates sorted by display order
 * @param includeCustom - Whether to include the custom template
 * @returns Sorted array of role templates
 */
export function getSortedRoleTemplates(includeCustom = false): RoleTemplate[] {
  return ROLE_TEMPLATES.filter((t) => includeCustom || t.id !== 'custom').sort((a, b) => a.order - b.order);
}

/**
 * Get the recommended template (for highlighting)
 * @returns The recommended role template or undefined
 */
export function getRecommendedTemplate(): RoleTemplate | undefined {
  return ROLE_TEMPLATES.find((template) => template.recommended);
}

/**
 * Get template name in specified language
 * @param template - Role template
 * @param lang - Language code (ka, en, ru)
 * @returns Template name in specified language
 */
export function getTemplateName(template: RoleTemplate, lang: 'ka' | 'en' | 'ru'): string {
  switch (lang) {
    case 'ka':
      return template.nameKa;
    case 'ru':
      return template.nameRu;
    default:
      return template.name;
  }
}

/**
 * Get template description in specified language
 * @param template - Role template
 * @param lang - Language code (ka, en, ru)
 * @returns Template description in specified language
 */
export function getTemplateDescription(template: RoleTemplate, lang: 'ka' | 'en' | 'ru'): string {
  switch (lang) {
    case 'ka':
      return template.descriptionKa;
    case 'ru':
      return template.descriptionRu;
    default:
      return template.description;
  }
}
