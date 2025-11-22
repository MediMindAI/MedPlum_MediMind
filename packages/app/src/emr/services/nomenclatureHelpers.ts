// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { ActivityDefinition, Extension, Identifier, CodeableConcept } from '@medplum/fhirtypes';
import type { ServiceFormValues, ServiceTableRow } from '../types/nomenclature';
import { NOMENCLATURE_EXTENSION_URLS, NOMENCLATURE_IDENTIFIER_SYSTEMS } from '../types/nomenclature';

/**
 * Extract identifier value by system URL
 * @param resource
 * @param system
 */
export function getIdentifierValue(
  resource: { identifier?: Identifier[] } | undefined,
  system: string
): string {
  return resource?.identifier?.find((id) => id.system === system)?.value || '';
}

/**
 * Extract string extension value by URL
 * @param resource
 * @param url
 */
export function getExtensionStringValue(
  resource: { extension?: Extension[] } | undefined,
  url: string
): string {
  return resource?.extension?.find((e) => e.url === url)?.valueString || '';
}

/**
 * Extract number extension value by URL
 * @param resource
 * @param url
 */
export function getExtensionNumberValue(
  resource: { extension?: Extension[] } | undefined,
  url: string
): number | undefined {
  const ext = resource?.extension?.find((e) => e.url === url);
  if (ext?.valueInteger !== undefined) {return ext.valueInteger;}
  if (ext?.valueDecimal !== undefined) {return ext.valueDecimal;}
  if (ext?.valueMoney?.value !== undefined) {return ext.valueMoney.value;}
  return undefined;
}

/**
 * Extract boolean extension value by URL
 * @param resource
 * @param url
 */
export function getExtensionBooleanValue(
  resource: { extension?: Extension[] } | undefined,
  url: string
): boolean {
  return resource?.extension?.find((e) => e.url === url)?.valueBoolean || false;
}

/**
 * Extract string array extension value by URL
 * @param resource
 * @param url
 */
export function getExtensionStringArrayValue(
  resource: { extension?: Extension[] } | undefined,
  url: string
): string[] {
  const ext = resource?.extension?.find((e) => e.url === url);
  if (!ext) {return [];}

  // Handle array of valueString
  if (Array.isArray(ext.extension)) {
    return ext.extension.map((e) => e.valueString || '').filter(Boolean);
  }

  // Handle single valueString
  if (ext.valueString) {
    return [ext.valueString];
  }

  return [];
}

/**
 * Extract CodeableConcept code value by URL
 * @param resource
 * @param url
 */
export function getExtensionCodeableConceptValue(
  resource: { extension?: Extension[] } | undefined,
  url: string
): string {
  const ext = resource?.extension?.find((e) => e.url === url);
  return ext?.valueCodeableConcept?.coding?.[0]?.code || '';
}

/**
 * Extract service code from ActivityDefinition identifier
 * @param activity
 */
export function getServiceCode(activity: ActivityDefinition): string {
  return getIdentifierValue(activity, NOMENCLATURE_IDENTIFIER_SYSTEMS.SERVICE_CODE);
}

/**
 * Extract service name from ActivityDefinition title
 * @param activity
 */
export function getServiceName(activity: ActivityDefinition): string {
  return activity.title || '';
}

/**
 * Extract service group from ActivityDefinition topic
 * @param activity
 */
export function getServiceGroup(activity: ActivityDefinition): string {
  // Try CodeableConcept code first (preferred format)
  const code = activity.topic?.[0]?.coding?.[0]?.code;
  if (code) {return code;}

  // Fallback to plain text (imported data format)
  return activity.topic?.[0]?.text || '';
}

/**
 * Extract service subgroup from ActivityDefinition extension
 * @param activity
 */
export function getServiceSubgroup(activity: ActivityDefinition): string {
  return getExtensionCodeableConceptValue(activity, NOMENCLATURE_EXTENSION_URLS.SUBGROUP);
}

/**
 * Extract service type from ActivityDefinition extension
 * @param activity
 */
export function getServiceType(activity: ActivityDefinition): string {
  // Try CodeableConcept first (preferred format)
  const code = getExtensionCodeableConceptValue(activity, NOMENCLATURE_EXTENSION_URLS.SERVICE_TYPE);
  if (code) {return code;}

  // Fallback to valueString (imported data format)
  return getExtensionStringValue(activity, NOMENCLATURE_EXTENSION_URLS.SERVICE_TYPE);
}

/**
 * Extract service category from ActivityDefinition extension
 * @param activity
 */
export function getServiceCategory(activity: ActivityDefinition): string {
  return getExtensionCodeableConceptValue(activity, NOMENCLATURE_EXTENSION_URLS.SERVICE_CATEGORY);
}

/**
 * Extract service base price from ActivityDefinition extension
 * @param activity
 */
export function getServicePrice(activity: ActivityDefinition): number | undefined {
  return getExtensionNumberValue(activity, NOMENCLATURE_EXTENSION_URLS.BASE_PRICE);
}

/**
 * Extract total amount from ActivityDefinition extension
 * @param activity
 */
export function getTotalAmount(activity: ActivityDefinition): number | undefined {
  return getExtensionNumberValue(activity, NOMENCLATURE_EXTENSION_URLS.TOTAL_AMOUNT);
}

/**
 * Extract calculator header/count from ActivityDefinition extension
 * @param activity
 */
export function getCalHed(activity: ActivityDefinition): number | undefined {
  return getExtensionNumberValue(activity, NOMENCLATURE_EXTENSION_URLS.CAL_HED);
}

/**
 * Extract printable flag from ActivityDefinition extension
 * @param activity
 */
export function getPrintable(activity: ActivityDefinition): boolean {
  return getExtensionBooleanValue(activity, NOMENCLATURE_EXTENSION_URLS.PRINTABLE);
}

/**
 * Extract item get price from ActivityDefinition extension
 * @param activity
 */
export function getItemGetPrice(activity: ActivityDefinition): number | undefined {
  return getExtensionNumberValue(activity, NOMENCLATURE_EXTENSION_URLS.ITEM_GET_PRICE);
}

/**
 * Extract assigned departments from ActivityDefinition extension
 * @param activity
 */
export function getDepartments(activity: ActivityDefinition): string[] {
  return getExtensionStringArrayValue(activity, NOMENCLATURE_EXTENSION_URLS.ASSIGNED_DEPARTMENTS);
}

/**
 * Get display text for service group code
 * @param groupCode
 * @param lang
 */
export function getServiceGroupDisplayText(groupCode: string, lang: string): string {
  // TODO: Load from translations/service-groups.json
  // For now, return the code as fallback
  return groupCode;
}

/**
 * Get display text for service type code
 * @param typeCode
 * @param lang
 */
export function getServiceTypeDisplayText(typeCode: string, lang: string): string {
  // TODO: Load from translations/service-types.json
  // For now, return the code as fallback
  return typeCode;
}

/**
 * Map ActivityDefinition to ServiceTableRow for display
 * @param activity
 * @param lang
 */
export function mapActivityDefinitionToTableRow(
  activity: ActivityDefinition,
  lang: string = 'ka'
): ServiceTableRow {
  const groupCode = getServiceGroup(activity);
  const typeCode = getServiceType(activity);

  return {
    id: activity.id || '',
    code: getServiceCode(activity),
    name: getServiceName(activity),
    group: getServiceGroupDisplayText(groupCode, lang),
    type: getServiceTypeDisplayText(typeCode, lang),
    price: getServicePrice(activity),
    totalAmount: getTotalAmount(activity),
    calHed: getCalHed(activity),
    printable: getPrintable(activity),
    itemGetPrice: getItemGetPrice(activity),
    status: (activity.status as 'active' | 'retired' | 'draft') || 'draft',
    resource: activity,
  };
}

/**
 * Create CodeableConcept from code and system
 * @param code
 * @param system
 */
function createCodeableConcept(code: string, system: string): CodeableConcept {
  return {
    coding: [
      {
        system,
        code,
      },
    ],
  };
}

/**
 * Create Extension with valueCodeableConcept
 * @param url
 * @param code
 * @param system
 */
function createCodeableConceptExtension(url: string, code: string, system: string): Extension {
  return {
    url,
    valueCodeableConcept: createCodeableConcept(code, system),
  };
}

/**
 * Create Extension with valueInteger
 * @param url
 * @param value
 */
function createIntegerExtension(url: string, value: number): Extension {
  return {
    url,
    valueInteger: value,
  };
}

/**
 * Create Extension with valueBoolean
 * @param url
 * @param value
 */
function createBooleanExtension(url: string, value: boolean): Extension {
  return {
    url,
    valueBoolean: value,
  };
}

/**
 * Create Extension with valueMoney
 * Using valueDecimal instead for price values since GEL is not a standard ISO 4217 currency code
 * @param url
 * @param value
 */
function createMoneyExtension(url: string, value: number): Extension {
  return {
    url,
    valueDecimal: value,
  };
}

/**
 * Create Extension with array of valueString
 * @param url
 * @param values
 */
function createStringArrayExtension(url: string, values: string[]): Extension {
  if (values.length === 0) {
    return {
      url,
      extension: [],
    };
  }

  return {
    url,
    extension: values.map((value) => ({
      url: 'department',
      valueString: value,
    })),
  };
}

/**
 * Create new ActivityDefinition from ServiceFormValues
 * @param values
 */
export function createActivityDefinition(values: ServiceFormValues): ActivityDefinition {
  const extensions: Extension[] = [];

  // Subgroup (optional)
  if (values.subgroup) {
    extensions.push(
      createCodeableConceptExtension(
        NOMENCLATURE_EXTENSION_URLS.SUBGROUP,
        values.subgroup,
        'http://medimind.ge/valueset/service-subgroups'
      )
    );
  }

  // Service Type (required)
  extensions.push(
    createCodeableConceptExtension(
      NOMENCLATURE_EXTENSION_URLS.SERVICE_TYPE,
      values.type,
      'http://medimind.ge/valueset/service-types'
    )
  );

  // Service Category (required)
  extensions.push(
    createCodeableConceptExtension(
      NOMENCLATURE_EXTENSION_URLS.SERVICE_CATEGORY,
      values.serviceCategory,
      'http://medimind.ge/valueset/service-categories'
    )
  );

  // Base Price (optional)
  if (values.price !== undefined) {
    extensions.push(createMoneyExtension(NOMENCLATURE_EXTENSION_URLS.BASE_PRICE, values.price));
  }

  // Total Amount (optional)
  if (values.totalAmount !== undefined) {
    extensions.push(createMoneyExtension(NOMENCLATURE_EXTENSION_URLS.TOTAL_AMOUNT, values.totalAmount));
  }

  // Cal Hed (optional)
  if (values.calHed !== undefined) {
    extensions.push(createIntegerExtension(NOMENCLATURE_EXTENSION_URLS.CAL_HED, values.calHed));
  }

  // Printable (optional)
  if (values.printable !== undefined) {
    extensions.push(createBooleanExtension(NOMENCLATURE_EXTENSION_URLS.PRINTABLE, values.printable));
  }

  // Item Get Price (optional)
  if (values.itemGetPrice !== undefined) {
    extensions.push(createIntegerExtension(NOMENCLATURE_EXTENSION_URLS.ITEM_GET_PRICE, values.itemGetPrice));
  }

  // Assigned Departments (optional)
  if (values.departments && values.departments.length > 0) {
    extensions.push(createStringArrayExtension(NOMENCLATURE_EXTENSION_URLS.ASSIGNED_DEPARTMENTS, values.departments));
  }

  return {
    resourceType: 'ActivityDefinition',
    status: values.status || 'active',
    identifier: [
      {
        system: NOMENCLATURE_IDENTIFIER_SYSTEMS.SERVICE_CODE,
        value: values.code,
      },
    ],
    title: values.name,
    topic: [
      createCodeableConcept(values.group, 'http://medimind.ge/valueset/service-groups'),
    ],
    extension: extensions,
  };
}

/**
 * Update existing ActivityDefinition with ServiceFormValues
 * @param activity
 * @param values
 */
export function updateActivityDefinition(
  activity: ActivityDefinition,
  values: ServiceFormValues
): ActivityDefinition {
  const extensions: Extension[] = [];

  // Subgroup (optional)
  if (values.subgroup) {
    extensions.push(
      createCodeableConceptExtension(
        NOMENCLATURE_EXTENSION_URLS.SUBGROUP,
        values.subgroup,
        'http://medimind.ge/valueset/service-subgroups'
      )
    );
  }

  // Service Type (required)
  extensions.push(
    createCodeableConceptExtension(
      NOMENCLATURE_EXTENSION_URLS.SERVICE_TYPE,
      values.type,
      'http://medimind.ge/valueset/service-types'
    )
  );

  // Service Category (required)
  extensions.push(
    createCodeableConceptExtension(
      NOMENCLATURE_EXTENSION_URLS.SERVICE_CATEGORY,
      values.serviceCategory,
      'http://medimind.ge/valueset/service-categories'
    )
  );

  // Base Price (optional)
  if (values.price !== undefined) {
    extensions.push(createMoneyExtension(NOMENCLATURE_EXTENSION_URLS.BASE_PRICE, values.price));
  }

  // Total Amount (optional)
  if (values.totalAmount !== undefined) {
    extensions.push(createMoneyExtension(NOMENCLATURE_EXTENSION_URLS.TOTAL_AMOUNT, values.totalAmount));
  }

  // Cal Hed (optional)
  if (values.calHed !== undefined) {
    extensions.push(createIntegerExtension(NOMENCLATURE_EXTENSION_URLS.CAL_HED, values.calHed));
  }

  // Printable (optional)
  if (values.printable !== undefined) {
    extensions.push(createBooleanExtension(NOMENCLATURE_EXTENSION_URLS.PRINTABLE, values.printable));
  }

  // Item Get Price (optional)
  if (values.itemGetPrice !== undefined) {
    extensions.push(createIntegerExtension(NOMENCLATURE_EXTENSION_URLS.ITEM_GET_PRICE, values.itemGetPrice));
  }

  // Assigned Departments (optional)
  if (values.departments && values.departments.length > 0) {
    extensions.push(createStringArrayExtension(NOMENCLATURE_EXTENSION_URLS.ASSIGNED_DEPARTMENTS, values.departments));
  }

  return {
    ...activity,
    status: values.status || activity.status,
    identifier: [
      {
        system: NOMENCLATURE_IDENTIFIER_SYSTEMS.SERVICE_CODE,
        value: values.code,
      },
    ],
    title: values.name,
    topic: [
      createCodeableConcept(values.group, 'http://medimind.ge/valueset/service-groups'),
    ],
    extension: extensions,
  };
}

/**
 * Extract ServiceFormValues from ActivityDefinition for editing
 * @param activity
 */
export function extractServiceFormValues(activity: ActivityDefinition): ServiceFormValues {
  return {
    code: getServiceCode(activity),
    name: getServiceName(activity),
    group: getServiceGroup(activity),
    subgroup: getServiceSubgroup(activity) || undefined,
    type: getServiceType(activity),
    serviceCategory: getServiceCategory(activity),
    price: getServicePrice(activity),
    totalAmount: getTotalAmount(activity),
    calHed: getCalHed(activity),
    printable: getPrintable(activity),
    itemGetPrice: getItemGetPrice(activity),
    departments: getDepartments(activity),
    status: (activity.status as 'active' | 'retired' | 'draft') || 'draft',
  };
}
