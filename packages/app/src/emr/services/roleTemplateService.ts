// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { RoleTemplate } from '../types/role-management';
import roleTemplateTranslations from '../translations/role-templates.json';

type SupportedLanguage = 'ka' | 'en' | 'ru';

/**
 * Get role template name in the specified language
 */
function getTemplateName(code: string, lang: SupportedLanguage): string {
  const translations = roleTemplateTranslations as Record<string, any>;
  return translations[code]?.name?.[lang] || translations[code]?.name?.en || code;
}

/**
 * Get role template description in the specified language
 */
function getTemplateDescription(code: string, lang: SupportedLanguage): string {
  const translations = roleTemplateTranslations as Record<string, any>;
  return translations[code]?.description?.[lang] || translations[code]?.description?.en || '';
}

/**
 * Get all available role templates
 */
export function getRoleTemplates(lang: SupportedLanguage = 'en'): RoleTemplate[] {
  return [
    {
      code: 'owner',
      name: getTemplateName('owner', lang),
      description: getTemplateDescription('owner', lang),
      departmentScoped: false,
      defaultPage: '/emr/administration',
      defaultPermissions: [
        // Patient Management (all)
        'view-patient-list',
        'view-patient-demographics',
        'edit-patient-demographics',
        'create-patient',
        'delete-patient',
        'view-patient-history',
        'merge-patients',
        'export-patient-data',
        'view-patient-documents',
        'upload-patient-documents',
        'view-patient-photo',
        'upload-patient-photo',
        'view-patient-contacts',
        'edit-patient-contacts',
        'view-patient-insurance',
        // Clinical Documentation (all)
        'view-encounters',
        'create-encounter',
        'edit-encounter',
        'delete-encounter',
        'view-clinical-notes',
        'create-clinical-notes',
        'edit-clinical-notes',
        'sign-clinical-notes',
        'view-diagnoses',
        'create-diagnosis',
        'edit-diagnosis',
        'view-procedures',
        'create-procedure',
        'view-medications',
        'prescribe-medication',
        'view-allergies',
        'edit-allergies',
        'edit-locked-records',
        // Laboratory (all)
        'view-lab-orders',
        'create-lab-order',
        'edit-lab-order',
        'cancel-lab-order',
        'view-lab-results',
        'enter-lab-results',
        'edit-lab-results',
        'approve-lab-results',
        'view-specimens',
        'manage-specimens',
        'view-lab-equipment',
        'manage-lab-equipment',
        // Billing & Financial (all)
        'view-invoices',
        'create-invoice',
        'edit-invoice',
        'void-invoice',
        'view-payments',
        'process-payment',
        'refund-payment',
        'view-claims',
        'submit-claim',
        'view-insurance-auth',
        'request-insurance-auth',
        'view-financial-reports',
        'export-financial-data',
        'view-debt-management',
        'manage-debt',
        // Administration (all)
        'view-users',
        'create-user',
        'edit-user',
        'deactivate-user',
        'delete-user',
        'view-roles',
        'create-role',
        'edit-role',
        'delete-role',
        'assign-roles',
        'view-departments',
        'manage-departments',
        'view-audit-logs',
        'export-audit-logs',
        'view-system-settings',
        'edit-system-settings',
        'view-access-logs',
        'emergency-access',
        // Reports (all)
        'view-clinical-reports',
        'view-operational-reports',
        'view-financial-summary',
        'generate-report',
        'export-reports',
        'schedule-reports',
        'view-analytics-dashboard',
        'view-quality-metrics',
        'view-utilization-reports',
        'view-compliance-reports',
        // Nomenclature (all)
        'view-services',
        'edit-services',
        'view-diagnoses-catalog',
        'edit-diagnoses-catalog',
        'view-medications-catalog',
        'edit-medications-catalog',
        'view-lab-catalog',
        'edit-lab-catalog',
        // Scheduling (all)
        'view-appointments',
        'create-appointment',
        'edit-appointment',
        'cancel-appointment',
        'view-schedules',
        'manage-schedules',
        'view-availability',
        'manage-availability',
      ],
    },
    {
      code: 'admin',
      name: getTemplateName('admin', lang),
      description: getTemplateDescription('admin', lang),
      departmentScoped: false,
      defaultPage: '/emr/administration',
      defaultPermissions: [
        // Patient Management (no delete)
        'view-patient-list',
        'view-patient-demographics',
        'edit-patient-demographics',
        'create-patient',
        'view-patient-history',
        'export-patient-data',
        'view-patient-documents',
        'upload-patient-documents',
        'view-patient-photo',
        'upload-patient-photo',
        'view-patient-contacts',
        'edit-patient-contacts',
        'view-patient-insurance',
        // Clinical Documentation (no delete-encounter, no edit-locked-records)
        'view-encounters',
        'create-encounter',
        'edit-encounter',
        'view-clinical-notes',
        'create-clinical-notes',
        'edit-clinical-notes',
        'sign-clinical-notes',
        'view-diagnoses',
        'create-diagnosis',
        'edit-diagnosis',
        'view-procedures',
        'create-procedure',
        'view-medications',
        'prescribe-medication',
        'view-allergies',
        'edit-allergies',
        // Laboratory (all)
        'view-lab-orders',
        'create-lab-order',
        'edit-lab-order',
        'cancel-lab-order',
        'view-lab-results',
        'enter-lab-results',
        'edit-lab-results',
        'approve-lab-results',
        'view-specimens',
        'manage-specimens',
        'view-lab-equipment',
        'manage-lab-equipment',
        // Billing & Financial (no void-invoice, no refund-payment)
        'view-invoices',
        'create-invoice',
        'edit-invoice',
        'view-payments',
        'process-payment',
        'view-claims',
        'submit-claim',
        'view-insurance-auth',
        'request-insurance-auth',
        'view-financial-reports',
        'export-financial-data',
        'view-debt-management',
        'manage-debt',
        // Administration (no delete-user, no delete-role, no edit-system-settings, no emergency-access)
        'view-users',
        'create-user',
        'edit-user',
        'deactivate-user',
        'view-roles',
        'create-role',
        'edit-role',
        'assign-roles',
        'view-departments',
        'manage-departments',
        'view-audit-logs',
        'export-audit-logs',
        'view-system-settings',
        'view-access-logs',
        // Reports (all)
        'view-clinical-reports',
        'view-operational-reports',
        'view-financial-summary',
        'generate-report',
        'export-reports',
        'schedule-reports',
        'view-analytics-dashboard',
        'view-quality-metrics',
        'view-utilization-reports',
        'view-compliance-reports',
        // Nomenclature (all)
        'view-services',
        'edit-services',
        'view-diagnoses-catalog',
        'edit-diagnoses-catalog',
        'view-medications-catalog',
        'edit-medications-catalog',
        'view-lab-catalog',
        'edit-lab-catalog',
        // Scheduling (all)
        'view-appointments',
        'create-appointment',
        'edit-appointment',
        'cancel-appointment',
        'view-schedules',
        'manage-schedules',
        'view-availability',
        'manage-availability',
      ],
    },
    {
      code: 'physician',
      name: getTemplateName('physician', lang),
      description: getTemplateDescription('physician', lang),
      departmentScoped: true,
      defaultPage: '/emr/patient-history',
      defaultPermissions: [
        // Patient Management (read/edit only)
        'view-patient-list',
        'view-patient-demographics',
        'edit-patient-demographics',
        'create-patient',
        'view-patient-history',
        'view-patient-documents',
        'upload-patient-documents',
        'view-patient-photo',
        'view-patient-contacts',
        'edit-patient-contacts',
        'view-patient-insurance',
        // Clinical Documentation (full clinical access)
        'view-encounters',
        'create-encounter',
        'edit-encounter',
        'view-clinical-notes',
        'create-clinical-notes',
        'edit-clinical-notes',
        'sign-clinical-notes',
        'view-diagnoses',
        'create-diagnosis',
        'edit-diagnosis',
        'view-procedures',
        'create-procedure',
        'view-medications',
        'prescribe-medication',
        'view-allergies',
        'edit-allergies',
        // Laboratory (order and view only)
        'view-lab-orders',
        'create-lab-order',
        'view-lab-results',
        'view-specimens',
        // No billing/financial permissions
        // No administration permissions
        // Reports (clinical only)
        'view-clinical-reports',
        'generate-report',
        'export-reports',
        'view-quality-metrics',
        // Nomenclature (view only)
        'view-services',
        'view-diagnoses-catalog',
        'view-medications-catalog',
        'view-lab-catalog',
        // Scheduling (full)
        'view-appointments',
        'create-appointment',
        'edit-appointment',
        'cancel-appointment',
        'view-schedules',
        'view-availability',
      ],
    },
    {
      code: 'nurse',
      name: getTemplateName('nurse', lang),
      description: getTemplateDescription('nurse', lang),
      departmentScoped: true,
      defaultPage: '/emr/patient-history',
      defaultPermissions: [
        // Patient Management (limited)
        'view-patient-list',
        'view-patient-demographics',
        'view-patient-history',
        'view-patient-documents',
        'view-patient-photo',
        'view-patient-contacts',
        'view-patient-insurance',
        // Clinical Documentation (limited)
        'view-encounters',
        'create-encounter',
        'view-clinical-notes',
        'create-clinical-notes',
        'view-diagnoses',
        'view-procedures',
        'view-medications',
        'view-allergies',
        'edit-allergies',
        // Laboratory (view and enter results)
        'view-lab-orders',
        'view-lab-results',
        'enter-lab-results',
        'view-specimens',
        'manage-specimens',
        // No billing/financial permissions
        // No administration permissions
        // No nomenclature edit permissions
        // Scheduling (view and create only)
        'view-appointments',
        'create-appointment',
        'view-schedules',
        'view-availability',
      ],
    },
    {
      code: 'registrar',
      name: getTemplateName('registrar', lang),
      description: getTemplateDescription('registrar', lang),
      departmentScoped: false,
      defaultPage: '/emr/registration',
      defaultPermissions: [
        // Patient Management (registration focused)
        'view-patient-list',
        'view-patient-demographics',
        'edit-patient-demographics',
        'create-patient',
        'view-patient-documents',
        'upload-patient-documents',
        'view-patient-photo',
        'upload-patient-photo',
        'view-patient-contacts',
        'edit-patient-contacts',
        'view-patient-insurance',
        // Clinical Documentation (encounter creation only)
        'create-encounter',
        'view-encounters',
        // No laboratory permissions
        // No billing/financial permissions
        // No administration permissions
        // No reports permissions
        // No nomenclature permissions
        // Scheduling (full)
        'view-appointments',
        'create-appointment',
        'edit-appointment',
        'cancel-appointment',
        'view-schedules',
        'manage-schedules',
        'view-availability',
        'manage-availability',
      ],
    },
    {
      code: 'laboratory',
      name: getTemplateName('laboratory', lang),
      description: getTemplateDescription('laboratory', lang),
      departmentScoped: true,
      defaultPage: '/emr/nomenclature/laboratory',
      defaultPermissions: [
        // Patient Management (limited view)
        'view-patient-list',
        'view-patient-demographics',
        'view-patient-history',
        // Clinical Documentation (view only)
        'view-encounters',
        'view-diagnoses',
        // Laboratory (full)
        'view-lab-orders',
        'edit-lab-order',
        'cancel-lab-order',
        'view-lab-results',
        'enter-lab-results',
        'edit-lab-results',
        'approve-lab-results',
        'view-specimens',
        'manage-specimens',
        'view-lab-equipment',
        'manage-lab-equipment',
        // No billing/financial permissions
        // No administration permissions
        // Reports (lab only)
        'view-clinical-reports',
        'view-operational-reports',
        // Nomenclature (lab catalog only)
        'view-lab-catalog',
        'edit-lab-catalog',
        // No scheduling permissions
      ],
    },
    {
      code: 'cashier',
      name: getTemplateName('cashier', lang),
      description: getTemplateDescription('cashier', lang),
      departmentScoped: false,
      defaultPage: '/emr/patient-history',
      defaultPermissions: [
        // Patient Management (limited view)
        'view-patient-list',
        'view-patient-demographics',
        'view-patient-history',
        'view-patient-insurance',
        // Clinical Documentation (view encounters only)
        'view-encounters',
        // No laboratory permissions
        // Billing & Financial (payment processing)
        'view-invoices',
        'view-payments',
        'process-payment',
        'view-claims',
        'view-insurance-auth',
        'view-debt-management',
        // No administration permissions
        // Reports (financial only)
        'view-financial-summary',
        // Nomenclature (services view only)
        'view-services',
        // No scheduling permissions
      ],
    },
    {
      code: 'hrManager',
      name: getTemplateName('hrManager', lang),
      description: getTemplateDescription('hrManager', lang),
      departmentScoped: false,
      defaultPage: '/emr/account-management',
      defaultPermissions: [
        // No patient management permissions
        // No clinical documentation permissions
        // No laboratory permissions
        // No billing/financial permissions
        // Administration (user management only)
        'view-users',
        'create-user',
        'edit-user',
        'deactivate-user',
        'view-roles',
        'assign-roles',
        'view-departments',
        'view-audit-logs',
        'export-audit-logs',
        // Reports (operational only)
        'view-operational-reports',
        'view-utilization-reports',
        // No nomenclature permissions
        // Scheduling (schedule management)
        'view-schedules',
        'manage-schedules',
        'view-availability',
        'manage-availability',
      ],
    },
    {
      code: 'seniorNurse',
      name: getTemplateName('seniorNurse', lang),
      description: getTemplateDescription('seniorNurse', lang),
      departmentScoped: true,
      defaultPage: '/emr/patient-history',
      defaultPermissions: [
        // Patient Management (read/edit)
        'view-patient-list',
        'view-patient-demographics',
        'edit-patient-demographics',
        'view-patient-history',
        'view-patient-documents',
        'upload-patient-documents',
        'view-patient-photo',
        'view-patient-contacts',
        'edit-patient-contacts',
        'view-patient-insurance',
        // Clinical Documentation (enhanced nurse permissions)
        'view-encounters',
        'create-encounter',
        'edit-encounter',
        'view-clinical-notes',
        'create-clinical-notes',
        'edit-clinical-notes',
        'view-diagnoses',
        'view-procedures',
        'view-medications',
        'view-allergies',
        'edit-allergies',
        // Laboratory (full specimen management)
        'view-lab-orders',
        'view-lab-results',
        'enter-lab-results',
        'view-specimens',
        'manage-specimens',
        // No billing/financial permissions
        // Administration (limited)
        'view-users',
        'view-departments',
        // Reports (clinical)
        'view-clinical-reports',
        'view-quality-metrics',
        // No nomenclature edit permissions
        // Scheduling (department schedules)
        'view-appointments',
        'create-appointment',
        'edit-appointment',
        'cancel-appointment',
        'view-schedules',
        'manage-schedules',
        'view-availability',
        'manage-availability',
      ],
    },
    {
      code: 'pharmacyManager',
      name: getTemplateName('pharmacyManager', lang),
      description: getTemplateDescription('pharmacyManager', lang),
      departmentScoped: true,
      defaultPage: '/emr/nomenclature',
      defaultPermissions: [
        // Patient Management (limited view)
        'view-patient-list',
        'view-patient-demographics',
        'view-patient-history',
        'view-patient-insurance',
        // Clinical Documentation (medication focus)
        'view-encounters',
        'view-diagnoses',
        'view-medications',
        'prescribe-medication',
        'view-allergies',
        // No laboratory permissions
        // No billing/financial permissions
        // No administration permissions
        // Reports (medication usage)
        'view-clinical-reports',
        'view-utilization-reports',
        // Nomenclature (medications only)
        'view-medications-catalog',
        'edit-medications-catalog',
        // No scheduling permissions
      ],
    },
    {
      code: 'viewAdmin',
      name: getTemplateName('viewAdmin', lang),
      description: getTemplateDescription('viewAdmin', lang),
      departmentScoped: false,
      defaultPage: '/emr/administration',
      defaultPermissions: [
        // Patient Management (view only)
        'view-patient-list',
        'view-patient-demographics',
        'view-patient-history',
        'view-patient-documents',
        'view-patient-photo',
        'view-patient-contacts',
        'view-patient-insurance',
        // Clinical Documentation (view only)
        'view-encounters',
        'view-clinical-notes',
        'view-diagnoses',
        'view-procedures',
        'view-medications',
        'view-allergies',
        // Laboratory (view only)
        'view-lab-orders',
        'view-lab-results',
        'view-specimens',
        'view-lab-equipment',
        // Billing & Financial (view only)
        'view-invoices',
        'view-payments',
        'view-claims',
        'view-insurance-auth',
        'view-financial-reports',
        'view-debt-management',
        // Administration (view only)
        'view-users',
        'view-roles',
        'view-departments',
        'view-audit-logs',
        'view-system-settings',
        'view-access-logs',
        // Reports (all view)
        'view-clinical-reports',
        'view-operational-reports',
        'view-financial-summary',
        'view-analytics-dashboard',
        'view-quality-metrics',
        'view-utilization-reports',
        'view-compliance-reports',
        // Nomenclature (view only)
        'view-services',
        'view-diagnoses-catalog',
        'view-medications-catalog',
        'view-lab-catalog',
        // Scheduling (view only)
        'view-appointments',
        'view-schedules',
        'view-availability',
      ],
    },
    {
      code: 'accounting',
      name: getTemplateName('accounting', lang),
      description: getTemplateDescription('accounting', lang),
      departmentScoped: false,
      defaultPage: '/emr/patient-history',
      defaultPermissions: [
        // Patient Management (limited view)
        'view-patient-list',
        'view-patient-demographics',
        'view-patient-insurance',
        // Clinical Documentation (view encounters only)
        'view-encounters',
        // No laboratory permissions
        // Billing & Financial (full)
        'view-invoices',
        'create-invoice',
        'edit-invoice',
        'void-invoice',
        'view-payments',
        'process-payment',
        'refund-payment',
        'view-claims',
        'submit-claim',
        'view-insurance-auth',
        'request-insurance-auth',
        'view-financial-reports',
        'export-financial-data',
        'view-debt-management',
        'manage-debt',
        // No administration permissions
        // Reports (financial)
        'view-financial-summary',
        'generate-report',
        'export-reports',
        'view-compliance-reports',
        // Nomenclature (services for pricing)
        'view-services',
        'edit-services',
        // No scheduling permissions
      ],
    },
    {
      code: 'manager',
      name: getTemplateName('manager', lang),
      description: getTemplateDescription('manager', lang),
      departmentScoped: true,
      defaultPage: '/emr/administration',
      defaultPermissions: [
        // Patient Management (view only)
        'view-patient-list',
        'view-patient-demographics',
        'view-patient-history',
        'view-patient-documents',
        // Clinical Documentation (view only)
        'view-encounters',
        'view-clinical-notes',
        'view-diagnoses',
        'view-procedures',
        'view-medications',
        // Laboratory (view only)
        'view-lab-orders',
        'view-lab-results',
        // Billing & Financial (view only)
        'view-invoices',
        'view-payments',
        'view-financial-reports',
        // Administration (department management)
        'view-users',
        'edit-user',
        'view-roles',
        'assign-roles',
        'view-departments',
        'manage-departments',
        'view-audit-logs',
        // Reports (all)
        'view-clinical-reports',
        'view-operational-reports',
        'view-financial-summary',
        'generate-report',
        'export-reports',
        'view-analytics-dashboard',
        'view-quality-metrics',
        'view-utilization-reports',
        'view-compliance-reports',
        // Nomenclature (view only)
        'view-services',
        'view-diagnoses-catalog',
        'view-medications-catalog',
        'view-lab-catalog',
        // Scheduling (full)
        'view-appointments',
        'create-appointment',
        'edit-appointment',
        'cancel-appointment',
        'view-schedules',
        'manage-schedules',
        'view-availability',
        'manage-availability',
      ],
    },
    {
      code: 'operator',
      name: getTemplateName('operator', lang),
      description: getTemplateDescription('operator', lang),
      departmentScoped: false,
      defaultPage: '/emr/registration',
      defaultPermissions: [
        // Patient Management (data entry)
        'view-patient-list',
        'view-patient-demographics',
        'edit-patient-demographics',
        'create-patient',
        'view-patient-documents',
        'upload-patient-documents',
        // Clinical Documentation (basic entry)
        'view-encounters',
        'create-encounter',
        'view-clinical-notes',
        // No laboratory permissions
        // No billing/financial permissions
        // No administration permissions
        // No reports permissions
        // No nomenclature permissions
        // Scheduling (view and create)
        'view-appointments',
        'create-appointment',
        'view-schedules',
        'view-availability',
      ],
    },
    {
      code: 'externalOrg',
      name: getTemplateName('externalOrg', lang),
      description: getTemplateDescription('externalOrg', lang),
      departmentScoped: false,
      defaultPage: '/emr/patient-history',
      defaultPermissions: [
        // Patient Management (limited view)
        'view-patient-demographics',
        'view-patient-history',
        // Clinical Documentation (shared data only)
        'view-encounters',
        'view-clinical-notes',
        'view-diagnoses',
        'view-medications',
        // Laboratory (view results only)
        'view-lab-results',
        // No billing/financial permissions
        // No administration permissions
        // No reports permissions
        // No nomenclature permissions
        // No scheduling permissions
      ],
    },
    {
      code: 'technician',
      name: getTemplateName('technician', lang),
      description: getTemplateDescription('technician', lang),
      departmentScoped: true,
      defaultPage: '/emr/nomenclature/laboratory',
      defaultPermissions: [
        // Patient Management (limited view)
        'view-patient-list',
        'view-patient-demographics',
        // Clinical Documentation (view only)
        'view-encounters',
        'view-procedures',
        // Laboratory (equipment focused)
        'view-lab-orders',
        'view-lab-results',
        'view-specimens',
        'view-lab-equipment',
        'manage-lab-equipment',
        // No billing/financial permissions
        // No administration permissions
        // No reports permissions
        // Nomenclature (lab catalog view)
        'view-lab-catalog',
        // No scheduling permissions
      ],
    },
  ];
}

/**
 * Get a specific role template by code
 */
export function getRoleTemplateByCode(code: string, lang: SupportedLanguage = 'en'): RoleTemplate | undefined {
  return getRoleTemplates(lang).find((t) => t.code === code);
}
