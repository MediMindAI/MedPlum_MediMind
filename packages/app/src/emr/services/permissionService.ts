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
  nomenclature: {
    ka: 'სერვისების, დიაგნოზების და მედიკამენტების კატალოგების მართვის უფლებები',
    en: 'Permissions for managing service, diagnosis, and medication catalogs',
    ru: 'Разрешения для управления каталогами услуг, диагнозов и лекарств',
  },
  scheduling: {
    ka: 'ვიზიტების დანიშვნის, განრიგისა და ხელმისაწვდომობის მართვის უფლებები',
    en: 'Permissions for appointment scheduling and availability management',
    ru: 'Разрешения для планирования встреч и управления доступностью',
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
 * Returns the complete permission tree with all 8 categories and 104 permissions
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
      icon: 'IconUsers',
      permissions: [
        {
          code: 'view-patient-list',
          name: getPermissionName('view-patient-list', lang),
          description: getPermissionDescription('view-patient-list', lang),
          category: 'patient-management',
          displayOrder: 1,
          resourceType: 'Patient',
          accessLevel: 'read',
        },
        {
          code: 'view-patient-demographics',
          name: getPermissionName('view-patient-demographics', lang),
          description: getPermissionDescription('view-patient-demographics', lang),
          category: 'patient-management',
          displayOrder: 2,
          resourceType: 'Patient',
          accessLevel: 'read',
          dependencies: ['view-patient-list'],
        },
        {
          code: 'edit-patient-demographics',
          name: getPermissionName('edit-patient-demographics', lang),
          description: getPermissionDescription('edit-patient-demographics', lang),
          category: 'patient-management',
          displayOrder: 3,
          resourceType: 'Patient',
          accessLevel: 'write',
          dependencies: ['view-patient-demographics'],
        },
        {
          code: 'create-patient',
          name: getPermissionName('create-patient', lang),
          description: getPermissionDescription('create-patient', lang),
          category: 'patient-management',
          displayOrder: 4,
          resourceType: 'Patient',
          accessLevel: 'write',
          dependencies: ['view-patient-list'],
        },
        {
          code: 'delete-patient',
          name: getPermissionName('delete-patient', lang),
          description: getPermissionDescription('delete-patient', lang),
          category: 'patient-management',
          displayOrder: 5,
          resourceType: 'Patient',
          accessLevel: 'delete',
          dependencies: ['view-patient-demographics'],
          dangerous: true,
        },
        {
          code: 'view-patient-history',
          name: getPermissionName('view-patient-history', lang),
          description: getPermissionDescription('view-patient-history', lang),
          category: 'patient-management',
          displayOrder: 6,
          resourceType: 'Encounter',
          accessLevel: 'read',
          dependencies: ['view-patient-list'],
        },
        {
          code: 'merge-patients',
          name: getPermissionName('merge-patients', lang),
          description: getPermissionDescription('merge-patients', lang),
          category: 'patient-management',
          displayOrder: 7,
          resourceType: 'Patient',
          accessLevel: 'admin',
          dependencies: ['edit-patient-demographics'],
          dangerous: true,
        },
        {
          code: 'export-patient-data',
          name: getPermissionName('export-patient-data', lang),
          description: getPermissionDescription('export-patient-data', lang),
          category: 'patient-management',
          displayOrder: 8,
          resourceType: 'Patient',
          accessLevel: 'read',
          dependencies: ['view-patient-demographics'],
        },
        {
          code: 'view-patient-documents',
          name: getPermissionName('view-patient-documents', lang),
          description: getPermissionDescription('view-patient-documents', lang),
          category: 'patient-management',
          displayOrder: 9,
          resourceType: 'DocumentReference',
          accessLevel: 'read',
          dependencies: ['view-patient-demographics'],
        },
        {
          code: 'upload-patient-documents',
          name: getPermissionName('upload-patient-documents', lang),
          description: getPermissionDescription('upload-patient-documents', lang),
          category: 'patient-management',
          displayOrder: 10,
          resourceType: 'DocumentReference',
          accessLevel: 'write',
          dependencies: ['view-patient-documents'],
        },
        {
          code: 'view-patient-photo',
          name: getPermissionName('view-patient-photo', lang),
          description: getPermissionDescription('view-patient-photo', lang),
          category: 'patient-management',
          displayOrder: 11,
          resourceType: 'Patient',
          accessLevel: 'read',
          dependencies: ['view-patient-demographics'],
        },
        {
          code: 'upload-patient-photo',
          name: getPermissionName('upload-patient-photo', lang),
          description: getPermissionDescription('upload-patient-photo', lang),
          category: 'patient-management',
          displayOrder: 12,
          resourceType: 'Patient',
          accessLevel: 'write',
          dependencies: ['view-patient-photo'],
        },
        {
          code: 'view-patient-contacts',
          name: getPermissionName('view-patient-contacts', lang),
          description: getPermissionDescription('view-patient-contacts', lang),
          category: 'patient-management',
          displayOrder: 13,
          resourceType: 'RelatedPerson',
          accessLevel: 'read',
          dependencies: ['view-patient-demographics'],
        },
        {
          code: 'edit-patient-contacts',
          name: getPermissionName('edit-patient-contacts', lang),
          description: getPermissionDescription('edit-patient-contacts', lang),
          category: 'patient-management',
          displayOrder: 14,
          resourceType: 'RelatedPerson',
          accessLevel: 'write',
          dependencies: ['view-patient-contacts'],
        },
        {
          code: 'view-patient-insurance',
          name: getPermissionName('view-patient-insurance', lang),
          description: getPermissionDescription('view-patient-insurance', lang),
          category: 'patient-management',
          displayOrder: 15,
          resourceType: 'Coverage',
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
      icon: 'IconClipboard',
      permissions: [
        {
          code: 'view-encounters',
          name: getPermissionName('view-encounters', lang),
          description: getPermissionDescription('view-encounters', lang),
          category: 'clinical-documentation',
          displayOrder: 1,
          resourceType: 'Encounter',
          accessLevel: 'read',
          dependencies: ['view-patient-history'],
        },
        {
          code: 'create-encounter',
          name: getPermissionName('create-encounter', lang),
          description: getPermissionDescription('create-encounter', lang),
          category: 'clinical-documentation',
          displayOrder: 2,
          resourceType: 'Encounter',
          accessLevel: 'write',
          dependencies: ['view-encounters'],
        },
        {
          code: 'edit-encounter',
          name: getPermissionName('edit-encounter', lang),
          description: getPermissionDescription('edit-encounter', lang),
          category: 'clinical-documentation',
          displayOrder: 3,
          resourceType: 'Encounter',
          accessLevel: 'write',
          dependencies: ['view-encounters'],
        },
        {
          code: 'delete-encounter',
          name: getPermissionName('delete-encounter', lang),
          description: getPermissionDescription('delete-encounter', lang),
          category: 'clinical-documentation',
          displayOrder: 4,
          resourceType: 'Encounter',
          accessLevel: 'delete',
          dependencies: ['edit-encounter'],
          dangerous: true,
        },
        {
          code: 'view-clinical-notes',
          name: getPermissionName('view-clinical-notes', lang),
          description: getPermissionDescription('view-clinical-notes', lang),
          category: 'clinical-documentation',
          displayOrder: 5,
          resourceType: 'DocumentReference',
          accessLevel: 'read',
          dependencies: ['view-encounters'],
        },
        {
          code: 'create-clinical-notes',
          name: getPermissionName('create-clinical-notes', lang),
          description: getPermissionDescription('create-clinical-notes', lang),
          category: 'clinical-documentation',
          displayOrder: 6,
          resourceType: 'DocumentReference',
          accessLevel: 'write',
          dependencies: ['view-clinical-notes'],
        },
        {
          code: 'edit-clinical-notes',
          name: getPermissionName('edit-clinical-notes', lang),
          description: getPermissionDescription('edit-clinical-notes', lang),
          category: 'clinical-documentation',
          displayOrder: 7,
          resourceType: 'DocumentReference',
          accessLevel: 'write',
          dependencies: ['create-clinical-notes'],
        },
        {
          code: 'sign-clinical-notes',
          name: getPermissionName('sign-clinical-notes', lang),
          description: getPermissionDescription('sign-clinical-notes', lang),
          category: 'clinical-documentation',
          displayOrder: 8,
          resourceType: 'DocumentReference',
          accessLevel: 'admin',
          dependencies: ['edit-clinical-notes'],
        },
        {
          code: 'view-diagnoses',
          name: getPermissionName('view-diagnoses', lang),
          description: getPermissionDescription('view-diagnoses', lang),
          category: 'clinical-documentation',
          displayOrder: 9,
          resourceType: 'Condition',
          accessLevel: 'read',
          dependencies: ['view-encounters'],
        },
        {
          code: 'create-diagnosis',
          name: getPermissionName('create-diagnosis', lang),
          description: getPermissionDescription('create-diagnosis', lang),
          category: 'clinical-documentation',
          displayOrder: 10,
          resourceType: 'Condition',
          accessLevel: 'write',
          dependencies: ['view-diagnoses'],
        },
        {
          code: 'edit-diagnosis',
          name: getPermissionName('edit-diagnosis', lang),
          description: getPermissionDescription('edit-diagnosis', lang),
          category: 'clinical-documentation',
          displayOrder: 11,
          resourceType: 'Condition',
          accessLevel: 'write',
          dependencies: ['create-diagnosis'],
        },
        {
          code: 'view-procedures',
          name: getPermissionName('view-procedures', lang),
          description: getPermissionDescription('view-procedures', lang),
          category: 'clinical-documentation',
          displayOrder: 12,
          resourceType: 'Procedure',
          accessLevel: 'read',
          dependencies: ['view-encounters'],
        },
        {
          code: 'create-procedure',
          name: getPermissionName('create-procedure', lang),
          description: getPermissionDescription('create-procedure', lang),
          category: 'clinical-documentation',
          displayOrder: 13,
          resourceType: 'Procedure',
          accessLevel: 'write',
          dependencies: ['view-procedures'],
        },
        {
          code: 'view-medications',
          name: getPermissionName('view-medications', lang),
          description: getPermissionDescription('view-medications', lang),
          category: 'clinical-documentation',
          displayOrder: 14,
          resourceType: 'MedicationRequest',
          accessLevel: 'read',
          dependencies: ['view-encounters'],
        },
        {
          code: 'prescribe-medication',
          name: getPermissionName('prescribe-medication', lang),
          description: getPermissionDescription('prescribe-medication', lang),
          category: 'clinical-documentation',
          displayOrder: 15,
          resourceType: 'MedicationRequest',
          accessLevel: 'write',
          dependencies: ['view-medications'],
        },
        {
          code: 'view-allergies',
          name: getPermissionName('view-allergies', lang),
          description: getPermissionDescription('view-allergies', lang),
          category: 'clinical-documentation',
          displayOrder: 16,
          resourceType: 'AllergyIntolerance',
          accessLevel: 'read',
          dependencies: ['view-patient-demographics'],
        },
        {
          code: 'edit-allergies',
          name: getPermissionName('edit-allergies', lang),
          description: getPermissionDescription('edit-allergies', lang),
          category: 'clinical-documentation',
          displayOrder: 17,
          resourceType: 'AllergyIntolerance',
          accessLevel: 'write',
          dependencies: ['view-allergies'],
        },
        {
          code: 'edit-locked-records',
          name: getPermissionName('edit-locked-records', lang),
          description: getPermissionDescription('edit-locked-records', lang),
          category: 'clinical-documentation',
          displayOrder: 18,
          resourceType: 'Encounter',
          accessLevel: 'admin',
          dependencies: ['edit-encounter'],
          dangerous: true,
        },
      ],
    },
    {
      code: 'laboratory',
      name: getCategoryName('laboratory', lang),
      description: getCategoryDescription('laboratory', lang),
      displayOrder: 3,
      icon: 'IconMicroscope',
      permissions: [
        {
          code: 'view-lab-orders',
          name: getPermissionName('view-lab-orders', lang),
          description: getPermissionDescription('view-lab-orders', lang),
          category: 'laboratory',
          displayOrder: 1,
          resourceType: 'ServiceRequest',
          accessLevel: 'read',
          dependencies: ['view-encounters'],
        },
        {
          code: 'create-lab-order',
          name: getPermissionName('create-lab-order', lang),
          description: getPermissionDescription('create-lab-order', lang),
          category: 'laboratory',
          displayOrder: 2,
          resourceType: 'ServiceRequest',
          accessLevel: 'write',
          dependencies: ['view-lab-orders'],
        },
        {
          code: 'edit-lab-order',
          name: getPermissionName('edit-lab-order', lang),
          description: getPermissionDescription('edit-lab-order', lang),
          category: 'laboratory',
          displayOrder: 3,
          resourceType: 'ServiceRequest',
          accessLevel: 'write',
          dependencies: ['create-lab-order'],
        },
        {
          code: 'cancel-lab-order',
          name: getPermissionName('cancel-lab-order', lang),
          description: getPermissionDescription('cancel-lab-order', lang),
          category: 'laboratory',
          displayOrder: 4,
          resourceType: 'ServiceRequest',
          accessLevel: 'write',
          dependencies: ['edit-lab-order'],
        },
        {
          code: 'view-lab-results',
          name: getPermissionName('view-lab-results', lang),
          description: getPermissionDescription('view-lab-results', lang),
          category: 'laboratory',
          displayOrder: 5,
          resourceType: 'Observation',
          accessLevel: 'read',
          dependencies: ['view-lab-orders'],
        },
        {
          code: 'enter-lab-results',
          name: getPermissionName('enter-lab-results', lang),
          description: getPermissionDescription('enter-lab-results', lang),
          category: 'laboratory',
          displayOrder: 6,
          resourceType: 'Observation',
          accessLevel: 'write',
          dependencies: ['view-lab-results'],
        },
        {
          code: 'edit-lab-results',
          name: getPermissionName('edit-lab-results', lang),
          description: getPermissionDescription('edit-lab-results', lang),
          category: 'laboratory',
          displayOrder: 7,
          resourceType: 'Observation',
          accessLevel: 'write',
          dependencies: ['enter-lab-results'],
        },
        {
          code: 'approve-lab-results',
          name: getPermissionName('approve-lab-results', lang),
          description: getPermissionDescription('approve-lab-results', lang),
          category: 'laboratory',
          displayOrder: 8,
          resourceType: 'Observation',
          accessLevel: 'admin',
          dependencies: ['edit-lab-results'],
        },
        {
          code: 'view-specimens',
          name: getPermissionName('view-specimens', lang),
          description: getPermissionDescription('view-specimens', lang),
          category: 'laboratory',
          displayOrder: 9,
          resourceType: 'Specimen',
          accessLevel: 'read',
          dependencies: ['view-lab-orders'],
        },
        {
          code: 'manage-specimens',
          name: getPermissionName('manage-specimens', lang),
          description: getPermissionDescription('manage-specimens', lang),
          category: 'laboratory',
          displayOrder: 10,
          resourceType: 'Specimen',
          accessLevel: 'write',
          dependencies: ['view-specimens'],
        },
        {
          code: 'view-lab-equipment',
          name: getPermissionName('view-lab-equipment', lang),
          description: getPermissionDescription('view-lab-equipment', lang),
          category: 'laboratory',
          displayOrder: 11,
          resourceType: 'Device',
          accessLevel: 'read',
          dependencies: ['view-lab-results'],
        },
        {
          code: 'manage-lab-equipment',
          name: getPermissionName('manage-lab-equipment', lang),
          description: getPermissionDescription('manage-lab-equipment', lang),
          category: 'laboratory',
          displayOrder: 12,
          resourceType: 'Device',
          accessLevel: 'write',
          dependencies: ['view-lab-equipment'],
        },
      ],
    },
    {
      code: 'billing-financial',
      name: getCategoryName('billing-financial', lang),
      description: getCategoryDescription('billing-financial', lang),
      displayOrder: 4,
      icon: 'IconCoin',
      permissions: [
        {
          code: 'view-invoices',
          name: getPermissionName('view-invoices', lang),
          description: getPermissionDescription('view-invoices', lang),
          category: 'billing-financial',
          displayOrder: 1,
          resourceType: 'Invoice',
          accessLevel: 'read',
          dependencies: ['view-encounters'],
        },
        {
          code: 'create-invoice',
          name: getPermissionName('create-invoice', lang),
          description: getPermissionDescription('create-invoice', lang),
          category: 'billing-financial',
          displayOrder: 2,
          resourceType: 'Invoice',
          accessLevel: 'write',
          dependencies: ['view-invoices'],
        },
        {
          code: 'edit-invoice',
          name: getPermissionName('edit-invoice', lang),
          description: getPermissionDescription('edit-invoice', lang),
          category: 'billing-financial',
          displayOrder: 3,
          resourceType: 'Invoice',
          accessLevel: 'write',
          dependencies: ['create-invoice'],
        },
        {
          code: 'void-invoice',
          name: getPermissionName('void-invoice', lang),
          description: getPermissionDescription('void-invoice', lang),
          category: 'billing-financial',
          displayOrder: 4,
          resourceType: 'Invoice',
          accessLevel: 'delete',
          dependencies: ['edit-invoice'],
          dangerous: true,
        },
        {
          code: 'view-payments',
          name: getPermissionName('view-payments', lang),
          description: getPermissionDescription('view-payments', lang),
          category: 'billing-financial',
          displayOrder: 5,
          resourceType: 'PaymentReconciliation',
          accessLevel: 'read',
          dependencies: ['view-invoices'],
        },
        {
          code: 'process-payment',
          name: getPermissionName('process-payment', lang),
          description: getPermissionDescription('process-payment', lang),
          category: 'billing-financial',
          displayOrder: 6,
          resourceType: 'PaymentReconciliation',
          accessLevel: 'write',
          dependencies: ['view-payments'],
        },
        {
          code: 'refund-payment',
          name: getPermissionName('refund-payment', lang),
          description: getPermissionDescription('refund-payment', lang),
          category: 'billing-financial',
          displayOrder: 7,
          resourceType: 'PaymentReconciliation',
          accessLevel: 'write',
          dependencies: ['process-payment'],
          dangerous: true,
        },
        {
          code: 'view-claims',
          name: getPermissionName('view-claims', lang),
          description: getPermissionDescription('view-claims', lang),
          category: 'billing-financial',
          displayOrder: 8,
          resourceType: 'Claim',
          accessLevel: 'read',
          dependencies: ['view-invoices'],
        },
        {
          code: 'submit-claim',
          name: getPermissionName('submit-claim', lang),
          description: getPermissionDescription('submit-claim', lang),
          category: 'billing-financial',
          displayOrder: 9,
          resourceType: 'Claim',
          accessLevel: 'write',
          dependencies: ['view-claims'],
        },
        {
          code: 'view-insurance-auth',
          name: getPermissionName('view-insurance-auth', lang),
          description: getPermissionDescription('view-insurance-auth', lang),
          category: 'billing-financial',
          displayOrder: 10,
          resourceType: 'CoverageEligibilityResponse',
          accessLevel: 'read',
          dependencies: ['view-invoices'],
        },
        {
          code: 'request-insurance-auth',
          name: getPermissionName('request-insurance-auth', lang),
          description: getPermissionDescription('request-insurance-auth', lang),
          category: 'billing-financial',
          displayOrder: 11,
          resourceType: 'CoverageEligibilityRequest',
          accessLevel: 'write',
          dependencies: ['view-insurance-auth'],
        },
        {
          code: 'view-financial-reports',
          name: getPermissionName('view-financial-reports', lang),
          description: getPermissionDescription('view-financial-reports', lang),
          category: 'billing-financial',
          displayOrder: 12,
          resourceType: 'MeasureReport',
          accessLevel: 'read',
          dependencies: ['view-invoices'],
        },
        {
          code: 'export-financial-data',
          name: getPermissionName('export-financial-data', lang),
          description: getPermissionDescription('export-financial-data', lang),
          category: 'billing-financial',
          displayOrder: 13,
          resourceType: 'Invoice',
          accessLevel: 'read',
          dependencies: ['view-financial-reports'],
        },
        {
          code: 'view-debt-management',
          name: getPermissionName('view-debt-management', lang),
          description: getPermissionDescription('view-debt-management', lang),
          category: 'billing-financial',
          displayOrder: 14,
          resourceType: 'Invoice',
          accessLevel: 'read',
          dependencies: ['view-invoices'],
        },
        {
          code: 'manage-debt',
          name: getPermissionName('manage-debt', lang),
          description: getPermissionDescription('manage-debt', lang),
          category: 'billing-financial',
          displayOrder: 15,
          resourceType: 'Invoice',
          accessLevel: 'write',
          dependencies: ['view-debt-management'],
        },
      ],
    },
    {
      code: 'administration',
      name: getCategoryName('administration', lang),
      description: getCategoryDescription('administration', lang),
      displayOrder: 5,
      icon: 'IconSettings',
      permissions: [
        {
          code: 'view-users',
          name: getPermissionName('view-users', lang),
          description: getPermissionDescription('view-users', lang),
          category: 'administration',
          displayOrder: 1,
          resourceType: 'Practitioner',
          accessLevel: 'read',
        },
        {
          code: 'create-user',
          name: getPermissionName('create-user', lang),
          description: getPermissionDescription('create-user', lang),
          category: 'administration',
          displayOrder: 2,
          resourceType: 'Practitioner',
          accessLevel: 'write',
          dependencies: ['view-users'],
        },
        {
          code: 'edit-user',
          name: getPermissionName('edit-user', lang),
          description: getPermissionDescription('edit-user', lang),
          category: 'administration',
          displayOrder: 3,
          resourceType: 'Practitioner',
          accessLevel: 'write',
          dependencies: ['view-users'],
        },
        {
          code: 'deactivate-user',
          name: getPermissionName('deactivate-user', lang),
          description: getPermissionDescription('deactivate-user', lang),
          category: 'administration',
          displayOrder: 4,
          resourceType: 'Practitioner',
          accessLevel: 'write',
          dependencies: ['edit-user'],
        },
        {
          code: 'delete-user',
          name: getPermissionName('delete-user', lang),
          description: getPermissionDescription('delete-user', lang),
          category: 'administration',
          displayOrder: 5,
          resourceType: 'Practitioner',
          accessLevel: 'delete',
          dependencies: ['deactivate-user'],
          dangerous: true,
        },
        {
          code: 'view-roles',
          name: getPermissionName('view-roles', lang),
          description: getPermissionDescription('view-roles', lang),
          category: 'administration',
          displayOrder: 6,
          resourceType: 'AccessPolicy',
          accessLevel: 'read',
        },
        {
          code: 'create-role',
          name: getPermissionName('create-role', lang),
          description: getPermissionDescription('create-role', lang),
          category: 'administration',
          displayOrder: 7,
          resourceType: 'AccessPolicy',
          accessLevel: 'write',
          dependencies: ['view-roles'],
        },
        {
          code: 'edit-role',
          name: getPermissionName('edit-role', lang),
          description: getPermissionDescription('edit-role', lang),
          category: 'administration',
          displayOrder: 8,
          resourceType: 'AccessPolicy',
          accessLevel: 'write',
          dependencies: ['view-roles'],
        },
        {
          code: 'delete-role',
          name: getPermissionName('delete-role', lang),
          description: getPermissionDescription('delete-role', lang),
          category: 'administration',
          displayOrder: 9,
          resourceType: 'AccessPolicy',
          accessLevel: 'delete',
          dependencies: ['edit-role'],
          dangerous: true,
        },
        {
          code: 'assign-roles',
          name: getPermissionName('assign-roles', lang),
          description: getPermissionDescription('assign-roles', lang),
          category: 'administration',
          displayOrder: 10,
          resourceType: 'PractitionerRole',
          accessLevel: 'write',
          dependencies: ['view-roles', 'view-users'],
        },
        {
          code: 'view-departments',
          name: getPermissionName('view-departments', lang),
          description: getPermissionDescription('view-departments', lang),
          category: 'administration',
          displayOrder: 11,
          resourceType: 'Organization',
          accessLevel: 'read',
        },
        {
          code: 'manage-departments',
          name: getPermissionName('manage-departments', lang),
          description: getPermissionDescription('manage-departments', lang),
          category: 'administration',
          displayOrder: 12,
          resourceType: 'Organization',
          accessLevel: 'write',
          dependencies: ['view-departments'],
        },
        {
          code: 'view-audit-logs',
          name: getPermissionName('view-audit-logs', lang),
          description: getPermissionDescription('view-audit-logs', lang),
          category: 'administration',
          displayOrder: 13,
          resourceType: 'AuditEvent',
          accessLevel: 'read',
        },
        {
          code: 'export-audit-logs',
          name: getPermissionName('export-audit-logs', lang),
          description: getPermissionDescription('export-audit-logs', lang),
          category: 'administration',
          displayOrder: 14,
          resourceType: 'AuditEvent',
          accessLevel: 'read',
          dependencies: ['view-audit-logs'],
        },
        {
          code: 'view-system-settings',
          name: getPermissionName('view-system-settings', lang),
          description: getPermissionDescription('view-system-settings', lang),
          category: 'administration',
          displayOrder: 15,
          resourceType: 'Parameters',
          accessLevel: 'read',
        },
        {
          code: 'edit-system-settings',
          name: getPermissionName('edit-system-settings', lang),
          description: getPermissionDescription('edit-system-settings', lang),
          category: 'administration',
          displayOrder: 16,
          resourceType: 'Parameters',
          accessLevel: 'admin',
          dependencies: ['view-system-settings'],
          dangerous: true,
        },
        {
          code: 'view-access-logs',
          name: getPermissionName('view-access-logs', lang),
          description: getPermissionDescription('view-access-logs', lang),
          category: 'administration',
          displayOrder: 17,
          resourceType: 'AuditEvent',
          accessLevel: 'read',
        },
        {
          code: 'view-sensitive-mental-health',
          name: getPermissionName('view-sensitive-mental-health', lang),
          description: getPermissionDescription('view-sensitive-mental-health', lang),
          category: 'administration',
          displayOrder: 18,
          resourceType: 'Observation',
          accessLevel: 'read',
          dependencies: ['view-patient-demographics'],
        },
        {
          code: 'view-sensitive-hiv',
          name: getPermissionName('view-sensitive-hiv', lang),
          description: getPermissionDescription('view-sensitive-hiv', lang),
          category: 'administration',
          displayOrder: 19,
          resourceType: 'Observation',
          accessLevel: 'read',
          dependencies: ['view-patient-demographics'],
        },
        {
          code: 'view-sensitive-substance-abuse',
          name: getPermissionName('view-sensitive-substance-abuse', lang),
          description: getPermissionDescription('view-sensitive-substance-abuse', lang),
          category: 'administration',
          displayOrder: 20,
          resourceType: 'Observation',
          accessLevel: 'read',
          dependencies: ['view-patient-demographics'],
        },
        {
          code: 'view-sensitive-genetic',
          name: getPermissionName('view-sensitive-genetic', lang),
          description: getPermissionDescription('view-sensitive-genetic', lang),
          category: 'administration',
          displayOrder: 21,
          resourceType: 'Observation',
          accessLevel: 'read',
          dependencies: ['view-patient-demographics'],
        },
        {
          code: 'view-sensitive-reproductive',
          name: getPermissionName('view-sensitive-reproductive', lang),
          description: getPermissionDescription('view-sensitive-reproductive', lang),
          category: 'administration',
          displayOrder: 22,
          resourceType: 'Observation',
          accessLevel: 'read',
          dependencies: ['view-patient-demographics'],
        },
        {
          code: 'view-sensitive-vip',
          name: getPermissionName('view-sensitive-vip', lang),
          description: getPermissionDescription('view-sensitive-vip', lang),
          category: 'administration',
          displayOrder: 23,
          resourceType: 'Patient',
          accessLevel: 'read',
          dependencies: ['view-patient-demographics'],
        },
        {
          code: 'emergency-access',
          name: getPermissionName('emergency-access', lang),
          description: getPermissionDescription('emergency-access', lang),
          category: 'administration',
          displayOrder: 24,
          resourceType: '*',
          accessLevel: 'admin',
          dangerous: true,
        },
      ],
    },
    {
      code: 'reports',
      name: getCategoryName('reports', lang),
      description: getCategoryDescription('reports', lang),
      displayOrder: 6,
      icon: 'IconChartBar',
      permissions: [
        {
          code: 'view-clinical-reports',
          name: getPermissionName('view-clinical-reports', lang),
          description: getPermissionDescription('view-clinical-reports', lang),
          category: 'reports',
          displayOrder: 1,
          resourceType: 'MeasureReport',
          accessLevel: 'read',
          dependencies: ['view-encounters'],
        },
        {
          code: 'view-operational-reports',
          name: getPermissionName('view-operational-reports', lang),
          description: getPermissionDescription('view-operational-reports', lang),
          category: 'reports',
          displayOrder: 2,
          resourceType: 'MeasureReport',
          accessLevel: 'read',
        },
        {
          code: 'view-financial-summary',
          name: getPermissionName('view-financial-summary', lang),
          description: getPermissionDescription('view-financial-summary', lang),
          category: 'reports',
          displayOrder: 3,
          resourceType: 'MeasureReport',
          accessLevel: 'read',
          dependencies: ['view-invoices'],
        },
        {
          code: 'generate-report',
          name: getPermissionName('generate-report', lang),
          description: getPermissionDescription('generate-report', lang),
          category: 'reports',
          displayOrder: 4,
          resourceType: 'MeasureReport',
          accessLevel: 'write',
          dependencies: ['view-clinical-reports'],
        },
        {
          code: 'export-reports',
          name: getPermissionName('export-reports', lang),
          description: getPermissionDescription('export-reports', lang),
          category: 'reports',
          displayOrder: 5,
          resourceType: 'MeasureReport',
          accessLevel: 'read',
          dependencies: ['view-clinical-reports'],
        },
        {
          code: 'schedule-reports',
          name: getPermissionName('schedule-reports', lang),
          description: getPermissionDescription('schedule-reports', lang),
          category: 'reports',
          displayOrder: 6,
          resourceType: 'Task',
          accessLevel: 'write',
          dependencies: ['generate-report'],
        },
        {
          code: 'view-analytics-dashboard',
          name: getPermissionName('view-analytics-dashboard', lang),
          description: getPermissionDescription('view-analytics-dashboard', lang),
          category: 'reports',
          displayOrder: 7,
          resourceType: 'MeasureReport',
          accessLevel: 'read',
        },
        {
          code: 'view-quality-metrics',
          name: getPermissionName('view-quality-metrics', lang),
          description: getPermissionDescription('view-quality-metrics', lang),
          category: 'reports',
          displayOrder: 8,
          resourceType: 'MeasureReport',
          accessLevel: 'read',
          dependencies: ['view-clinical-reports'],
        },
        {
          code: 'view-utilization-reports',
          name: getPermissionName('view-utilization-reports', lang),
          description: getPermissionDescription('view-utilization-reports', lang),
          category: 'reports',
          displayOrder: 9,
          resourceType: 'MeasureReport',
          accessLevel: 'read',
          dependencies: ['view-operational-reports'],
        },
        {
          code: 'view-compliance-reports',
          name: getPermissionName('view-compliance-reports', lang),
          description: getPermissionDescription('view-compliance-reports', lang),
          category: 'reports',
          displayOrder: 10,
          resourceType: 'MeasureReport',
          accessLevel: 'read',
          dependencies: ['view-audit-logs'],
        },
      ],
    },
    {
      code: 'nomenclature',
      name: getCategoryName('nomenclature', lang),
      description: getCategoryDescription('nomenclature', lang),
      displayOrder: 7,
      icon: 'IconList',
      permissions: [
        {
          code: 'view-services',
          name: getPermissionName('view-services', lang),
          description: getPermissionDescription('view-services', lang),
          category: 'nomenclature',
          displayOrder: 1,
          resourceType: 'ActivityDefinition',
          accessLevel: 'read',
        },
        {
          code: 'edit-services',
          name: getPermissionName('edit-services', lang),
          description: getPermissionDescription('edit-services', lang),
          category: 'nomenclature',
          displayOrder: 2,
          resourceType: 'ActivityDefinition',
          accessLevel: 'write',
          dependencies: ['view-services'],
        },
        {
          code: 'view-diagnoses-catalog',
          name: getPermissionName('view-diagnoses-catalog', lang),
          description: getPermissionDescription('view-diagnoses-catalog', lang),
          category: 'nomenclature',
          displayOrder: 3,
          resourceType: 'ValueSet',
          accessLevel: 'read',
        },
        {
          code: 'edit-diagnoses-catalog',
          name: getPermissionName('edit-diagnoses-catalog', lang),
          description: getPermissionDescription('edit-diagnoses-catalog', lang),
          category: 'nomenclature',
          displayOrder: 4,
          resourceType: 'ValueSet',
          accessLevel: 'write',
          dependencies: ['view-diagnoses-catalog'],
        },
        {
          code: 'view-medications-catalog',
          name: getPermissionName('view-medications-catalog', lang),
          description: getPermissionDescription('view-medications-catalog', lang),
          category: 'nomenclature',
          displayOrder: 5,
          resourceType: 'Medication',
          accessLevel: 'read',
        },
        {
          code: 'edit-medications-catalog',
          name: getPermissionName('edit-medications-catalog', lang),
          description: getPermissionDescription('edit-medications-catalog', lang),
          category: 'nomenclature',
          displayOrder: 6,
          resourceType: 'Medication',
          accessLevel: 'write',
          dependencies: ['view-medications-catalog'],
        },
        {
          code: 'view-lab-catalog',
          name: getPermissionName('view-lab-catalog', lang),
          description: getPermissionDescription('view-lab-catalog', lang),
          category: 'nomenclature',
          displayOrder: 7,
          resourceType: 'ObservationDefinition',
          accessLevel: 'read',
        },
        {
          code: 'edit-lab-catalog',
          name: getPermissionName('edit-lab-catalog', lang),
          description: getPermissionDescription('edit-lab-catalog', lang),
          category: 'nomenclature',
          displayOrder: 8,
          resourceType: 'ObservationDefinition',
          accessLevel: 'write',
          dependencies: ['view-lab-catalog'],
        },
      ],
    },
    {
      code: 'scheduling',
      name: getCategoryName('scheduling', lang),
      description: getCategoryDescription('scheduling', lang),
      displayOrder: 8,
      icon: 'IconCalendar',
      permissions: [
        {
          code: 'view-appointments',
          name: getPermissionName('view-appointments', lang),
          description: getPermissionDescription('view-appointments', lang),
          category: 'scheduling',
          displayOrder: 1,
          resourceType: 'Appointment',
          accessLevel: 'read',
          dependencies: ['view-patient-list'],
        },
        {
          code: 'create-appointment',
          name: getPermissionName('create-appointment', lang),
          description: getPermissionDescription('create-appointment', lang),
          category: 'scheduling',
          displayOrder: 2,
          resourceType: 'Appointment',
          accessLevel: 'write',
          dependencies: ['view-appointments'],
        },
        {
          code: 'edit-appointment',
          name: getPermissionName('edit-appointment', lang),
          description: getPermissionDescription('edit-appointment', lang),
          category: 'scheduling',
          displayOrder: 3,
          resourceType: 'Appointment',
          accessLevel: 'write',
          dependencies: ['create-appointment'],
        },
        {
          code: 'cancel-appointment',
          name: getPermissionName('cancel-appointment', lang),
          description: getPermissionDescription('cancel-appointment', lang),
          category: 'scheduling',
          displayOrder: 4,
          resourceType: 'Appointment',
          accessLevel: 'write',
          dependencies: ['edit-appointment'],
        },
        {
          code: 'view-schedules',
          name: getPermissionName('view-schedules', lang),
          description: getPermissionDescription('view-schedules', lang),
          category: 'scheduling',
          displayOrder: 5,
          resourceType: 'Schedule',
          accessLevel: 'read',
        },
        {
          code: 'manage-schedules',
          name: getPermissionName('manage-schedules', lang),
          description: getPermissionDescription('manage-schedules', lang),
          category: 'scheduling',
          displayOrder: 6,
          resourceType: 'Schedule',
          accessLevel: 'write',
          dependencies: ['view-schedules'],
        },
        {
          code: 'view-availability',
          name: getPermissionName('view-availability', lang),
          description: getPermissionDescription('view-availability', lang),
          category: 'scheduling',
          displayOrder: 7,
          resourceType: 'Slot',
          accessLevel: 'read',
          dependencies: ['view-schedules'],
        },
        {
          code: 'manage-availability',
          name: getPermissionName('manage-availability', lang),
          description: getPermissionDescription('manage-availability', lang),
          category: 'scheduling',
          displayOrder: 8,
          resourceType: 'Slot',
          accessLevel: 'write',
          dependencies: ['view-availability'],
        },
      ],
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
 * Uses interaction[] array format with FHIR CRUD operations
 *
 * @param permissions - Array of permission codes
 * @returns Array of AccessPolicyResource with interaction arrays
 */
export function permissionsToAccessPolicy(permissions: string[]): AccessPolicyResource[] {
  const permissionTree = getPermissionTree();
  const allPermissions = permissionTree.flatMap((category) => category.permissions);

  // Resolve dependencies first
  const resolvedPermissions = resolvePermissionDependencies(permissions);

  // Map resource type to set of interactions
  const resourceMap = new Map<string, Set<string>>();

  resolvedPermissions.forEach((permCode) => {
    const permission = allPermissions.find((p) => p.code === permCode);
    if (permission?.resourceType) {
      // Get or create interaction set for this resource type
      if (!resourceMap.has(permission.resourceType)) {
        resourceMap.set(permission.resourceType, new Set<string>());
      }
      const interactions = resourceMap.get(permission.resourceType)!;

      // Map accessLevel to interactions
      switch (permission.accessLevel) {
        case 'read':
          interactions.add('read');
          interactions.add('search');
          break;
        case 'write':
          interactions.add('read');
          interactions.add('create');
          interactions.add('update');
          interactions.add('search');
          break;
        case 'delete':
          interactions.add('delete');
          // Note: read dependency is added via resolvePermissionDependencies
          break;
        case 'admin':
          interactions.add('read');
          interactions.add('create');
          interactions.add('update');
          interactions.add('delete');
          interactions.add('search');
          break;
      }
    }
  });

  // Convert map to AccessPolicyResource array
  return Array.from(resourceMap.entries()).map(([resourceType, interactions]) => ({
    resourceType,
    interaction: Array.from(interactions).sort(), // Sort for consistency
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
// Department-Scoped Access
// ============================================================================

/**
 * Adds department scoping criteria to AccessPolicyResource array.
 * Restricts access to resources within a specific department compartment.
 *
 * @param resources - Array of AccessPolicyResource rules
 * @param departmentId - Organization ID for the department
 * @returns AccessPolicyResource[] - Resources with department scoping applied
 *
 * @example
 * ```typescript
 * const resources = [
 *   { resourceType: 'Patient', readonly: false },
 *   { resourceType: 'Encounter', readonly: false },
 * ];
 * const scoped = addDepartmentScoping(resources, 'dept-001');
 * // Result:
 * // [
 * //   { resourceType: 'Patient', readonly: false, criteria: 'Patient?_compartment=Organization/dept-001' },
 * //   { resourceType: 'Encounter', readonly: false, criteria: 'Encounter?_compartment=Organization/dept-001' },
 * // ]
 * ```
 */
export function addDepartmentScoping(
  resources: AccessPolicyResource[],
  departmentId: string
): AccessPolicyResource[] {
  const scopedResourceTypes = ['Patient', 'Encounter', 'Observation', 'DocumentReference', 'ServiceRequest'];

  return resources.map((resource) => {
    if (scopedResourceTypes.includes(resource.resourceType)) {
      return {
        ...resource,
        criteria: `${resource.resourceType}?_compartment=Organization/${departmentId}`,
      };
    }
    return resource;
  });
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

// ============================================================================
// Permission Check Functions (for usePermissionCheck hook and PermissionContext)
// ============================================================================

/**
 * Check if a user has a specific permission by checking their assigned roles.
 *
 * This function is used by usePermissionCheck hook and PermissionContext.
 * It fetches the user's roles, retrieves the associated AccessPolicy resources,
 * and checks if any role grants the requested permission.
 *
 * @param medplum - MedplumClient instance
 * @param userId - Practitioner ID
 * @param permissionCode - Permission code to check (e.g., 'view-patient-list')
 * @returns Promise<boolean> - true if user has the permission, false otherwise
 *
 * @example
 * ```typescript
 * const hasPermission = await checkPermissionFromServer(medplum, practitionerId, 'view-patient-list');
 * if (hasPermission) {
 *   // Allow access to patient list
 * }
 * ```
 */
export async function checkPermissionFromServer(
  medplum: MedplumClient,
  userId: string,
  permissionCode: string
): Promise<boolean> {
  try {
    // Import getUserRoles dynamically to avoid circular dependency
    const { getUserRoles } = await import('./roleService');

    // Get all roles for the user
    const practitionerRoles = await getUserRoles(medplum, userId);

    // Extract role codes from PractitionerRole resources
    const roleCodes = practitionerRoles
      .map((pr) => pr.meta?.tag?.find((tag) => tag.system === 'http://medimind.ge/role-assignment')?.code)
      .filter((code): code is string => code !== undefined);

    // Get AccessPolicy resources for each role code
    const allPermissions: string[] = [];
    for (const roleCode of roleCodes) {
      // Search for AccessPolicy with this role code
      const bundle = await medplum.search('AccessPolicy', {
        _tag: `http://medimind.ge/role-identifier|${roleCode}`,
      });

      const roles = bundle.entry?.map((entry) => entry.resource as AccessPolicy) || [];

      // Extract permissions from each role
      for (const role of roles) {
        const permissions = accessPolicyToPermissions(role);
        allPermissions.push(...permissions);
      }
    }

    // Check if permission exists
    return allPermissions.includes(permissionCode);
  } catch (error) {
    console.error('[checkPermissionFromServer] Error checking permission:', error);
    return false; // fail-closed on error
  }
}

/**
 * Get all permissions for a user by fetching their assigned roles.
 *
 * This function is used by PermissionContext to preload all user permissions
 * into the cache on mount, reducing the number of individual permission checks.
 *
 * @param medplum - MedplumClient instance
 * @param userId - Practitioner ID
 * @returns Promise<string[]> - Array of permission codes the user has
 *
 * @example
 * ```typescript
 * const permissions = await getUserPermissions(medplum, practitionerId);
 * // ['view-patient-list', 'edit-patient-demographics', 'create-patient', ...]
 *
 * // Preload into cache
 * for (const permission of permissions) {
 *   permissionCache.set(permission, true);
 * }
 * ```
 */
export async function getUserPermissions(medplum: MedplumClient, userId: string): Promise<string[]> {
  try {
    // Import getUserRoles dynamically to avoid circular dependency
    const { getUserRoles } = await import('./roleService');

    // Get all roles for the user
    const practitionerRoles = await getUserRoles(medplum, userId);

    // Extract role codes from PractitionerRole resources
    const roleCodes = practitionerRoles
      .map((pr) => pr.meta?.tag?.find((tag) => tag.system === 'http://medimind.ge/role-assignment')?.code)
      .filter((code): code is string => code !== undefined);

    // Get AccessPolicy resources for each role code
    const allPermissions = new Set<string>();
    for (const roleCode of roleCodes) {
      // Search for AccessPolicy with this role code
      const bundle = await medplum.search('AccessPolicy', {
        _tag: `http://medimind.ge/role-identifier|${roleCode}`,
      });

      const roles = bundle.entry?.map((entry) => entry.resource as AccessPolicy) || [];

      // Extract permissions from each role
      for (const role of roles) {
        const permissions = accessPolicyToPermissions(role);
        permissions.forEach((p) => allPermissions.add(p));
      }
    }

    return Array.from(allPermissions);
  } catch (error) {
    console.error('[getUserPermissions] Error fetching user permissions:', error);
    return []; // Return empty array on error (fail-closed)
  }
}
