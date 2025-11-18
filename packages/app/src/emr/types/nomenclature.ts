/**
 * Nomenclature Types
 *
 * TypeScript interfaces for the Nomenclature Medical 1 page
 * managing medical services (operations, consultations, studies).
 */

import type { ActivityDefinition } from '@medplum/fhirtypes';

/**
 * Service form values for creating/editing a medical service
 */
export interface ServiceFormValues {
  /** Service code (unique identifier) */
  code: string;

  /** Service name/description */
  name: string;

  /** Service group ID (consultation, operation, lab studies, etc.) */
  group: string;

  /** Service subgroup ID (medical specialty or DRG category) - optional */
  subgroup?: string;

  /** Service type ID (internal, other clinics, limbach, etc.) */
  type: string;

  /** Service category (ambulatory, stationary, both) */
  serviceCategory: string;

  /** Base price for the service - optional */
  price?: number;

  /** Total amount - optional */
  totalAmount?: number;

  /** Calculator header/count - optional */
  calHed?: number;

  /** Printable flag */
  printable?: boolean;

  /** Item get price count - optional */
  itemGetPrice?: number;

  /** Department assignments (array of department IDs) */
  departments?: string[];

  /** Service status (active, retired, draft) */
  status?: 'active' | 'retired' | 'draft';
}

/**
 * Service table row for display in the data table
 */
export interface ServiceTableRow {
  /** Resource ID */
  id: string;

  /** Service code */
  code: string;

  /** Service name/description */
  name: string;

  /** Service group display text */
  group: string;

  /** Service type display text */
  type: string;

  /** Base price */
  price?: number;

  /** Total amount */
  totalAmount?: number;

  /** Calculator header/count */
  calHed?: number;

  /** Printable flag */
  printable?: boolean;

  /** Item get price count */
  itemGetPrice?: number;

  /** Service status */
  status: 'active' | 'retired' | 'draft';

  /** Full ActivityDefinition resource for edit operations */
  resource: ActivityDefinition;
}

/**
 * Search and filter parameters for service queries
 */
export interface ServiceSearchParams {
  /** Search by service code (partial match) */
  code?: string;

  /** Search by service name (partial match) */
  name?: string;

  /** Filter by group ID (exact match) */
  group?: string;

  /** Filter by subgroup ID (exact match) */
  subgroup?: string;

  /** Filter by type ID (exact match) */
  type?: string;

  /** Filter by service category (exact match) */
  serviceCategory?: string;

  /** Price range start (minimum price) */
  priceStart?: number;

  /** Price range end (maximum price) */
  priceEnd?: number;

  /** Filter by status (active, retired, all) */
  status?: 'active' | 'retired' | 'all';

  /** Filter by department assignment */
  departmentAssignment?: 'is' | 'is-not' | '';

  /** Department ID for assignment filter */
  departmentId?: string;

  /** Page number for pagination */
  page?: number;

  /** Number of results per page */
  count?: number;

  /** Sort field */
  sortField?: string;

  /** Sort order (asc/desc) */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Service group option for dropdown
 */
export interface ServiceGroupOption {
  value: string;
  ka: string;
  en: string;
  ru: string;
}

/**
 * Service subgroup option for dropdown
 */
export interface ServiceSubgroupOption {
  value: string;
  ka: string;
  en: string;
  ru: string;
}

/**
 * Service type option for dropdown
 */
export interface ServiceTypeOption {
  value: string;
  ka: string;
  en: string;
  ru: string;
}

/**
 * Service category option for dropdown
 */
export interface ServiceCategoryOption {
  value: string;
  ka: string;
  en: string;
  ru: string;
}

/**
 * Department option for dropdown
 */
export interface DepartmentOption {
  value: string;
  ka: string;
  en: string;
  ru: string;
}

/**
 * Extension URLs for custom ActivityDefinition fields
 */
export const NOMENCLATURE_EXTENSION_URLS = {
  SUBGROUP: 'http://medimind.ge/extensions/service-subgroup',
  SERVICE_TYPE: 'http://medimind.ge/extensions/service-type',
  SERVICE_CATEGORY: 'http://medimind.ge/extensions/service-category',
  BASE_PRICE: 'http://medimind.ge/extensions/base-price',
  TOTAL_AMOUNT: 'http://medimind.ge/extensions/total-amount',
  CAL_HED: 'http://medimind.ge/extensions/cal-hed',
  PRINTABLE: 'http://medimind.ge/extensions/printable',
  ITEM_GET_PRICE: 'http://medimind.ge/extensions/item-get-price',
  ASSIGNED_DEPARTMENTS: 'http://medimind.ge/extensions/assigned-departments',
} as const;

/**
 * Identifier system URLs for service codes
 */
export const NOMENCLATURE_IDENTIFIER_SYSTEMS = {
  SERVICE_CODE: 'http://medimind.ge/nomenclature/service-code',
  REGISTRATION_NUMBER: 'http://medimind.ge/identifiers/registration-number',
} as const;

/**
 * ValueSet URLs for service categorization
 */
export const NOMENCLATURE_VALUESETS = {
  SERVICE_GROUPS: 'http://medimind.ge/valueset/service-groups',
  SERVICE_SUBGROUPS: 'http://medimind.ge/valueset/service-subgroups',
  SERVICE_TYPES: 'http://medimind.ge/valueset/service-types',
  SERVICE_CATEGORIES: 'http://medimind.ge/valueset/service-categories',
} as const;

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Excel export options
 */
export interface ExcelExportOptions {
  /** Include all columns or specific columns */
  columns?: string[];

  /** File name for the exported file */
  fileName?: string;

  /** Current filter parameters to apply */
  filterParams?: ServiceSearchParams;
}
