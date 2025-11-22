// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type {
  Bundle,
  Encounter,
  Patient,
  Identifier,
  HumanName,
  ContactPoint,
  Extension,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireItemEnableWhen,
  Coding,
} from '@medplum/fhirtypes';
import type { VisitTableRow, FinancialSummary } from '../types/patient-history';
import type { FormTemplate, FieldConfig, FieldType, Condition } from '../types/form-builder';

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
 * Extract name parts from HumanName array
 * @param names
 */
export function getNameParts(names?: HumanName[]): { firstName: string; lastName: string } {
  const name = names?.[0];
  return {
    firstName: name?.given?.[0] || '',
    lastName: name?.family || '',
  };
}

/**
 * Extract telecom value by system
 * @param resource
 * @param system
 */
export function getTelecomValue(
  resource: { telecom?: ContactPoint[] } | undefined,
  system: string
): string {
  return resource?.telecom?.find((t) => t.system === system)?.value || '';
}

/**
 * Extract extension value by URL
 * @param resource
 * @param url
 */
export function getExtensionValue(resource: { extension?: Extension[] } | undefined, url: string): any {
  const ext = resource?.extension?.find((e) => e.url === url);
  return ext?.valueString || ext?.valueCodeableConcept?.coding?.[0]?.code || '';
}

/**
 * Map FHIR Encounter + Patient to table row
 * @param encounter
 * @param bundle
 */
export function mapEncounterToTableRow(encounter: Encounter, bundle: Bundle): VisitTableRow {
  // Find the CORRECT Patient in bundle by matching encounter.subject.reference
  // encounter.subject.reference is like "Patient/123" or full URL
  const subjectRef = encounter.subject?.reference || '';
  const patientId = subjectRef.split('/').pop() || ''; // Extract ID from "Patient/123"

  const patient = bundle.entry?.find((e) => {
    if (e.resource?.resourceType !== 'Patient') {return false;}
    const pat = e.resource as Patient;
    // Match by ID or full URL
    return pat.id === patientId || e.fullUrl?.includes(patientId);
  })?.resource as Patient;

  const personalId = getIdentifierValue(patient, 'http://medimind.ge/identifiers/personal-id');

  const { firstName, lastName } = getNameParts(patient?.name);

  const registrationNumber =
    getIdentifierValue(encounter, 'http://medimind.ge/identifiers/visit-registration') ||
    getIdentifierValue(encounter, 'http://medimind.ge/identifiers/ambulatory-registration');

  return {
    id: encounter.id!,
    encounterId: encounter.id!,
    patientId: patient?.id || patientId,
    personalId,
    firstName,
    lastName,
    date: encounter.period?.start || '',
    endDate: encounter.period?.end,
    registrationNumber,
    total: 0, // TODO: Calculate from ChargeItem resources
    discountPercent: 0,
    debt: 0,
    payment: 0,
    status: encounter.status,
    visitType: encounter.class?.code === 'IMP' ? 'stationary' : 'ambulatory',
  };
}

/**
 * Calculate financial summary
 * @param total
 * @param discountPercent
 * @param payment
 */
export function calculateFinancials(
  total: number,
  discountPercent: number,
  payment: number
): FinancialSummary {
  const discountAmount = total * (discountPercent / 100);
  const subtotal = total - discountAmount;
  const debt = Math.max(0, subtotal - payment);

  return {
    total,
    discountPercent,
    discountAmount,
    subtotal,
    payment,
    debt,
    currency: 'GEL',
  };
}

// ============================================================================
// Form Builder FHIR Questionnaire Utilities
// ============================================================================

/**
 * Convert form builder data to FHIR Questionnaire resource
 *
 * @param formData - Form template data from form builder
 * @returns FHIR Questionnaire resource
 */
export function toQuestionnaire(formData: FormTemplate): Questionnaire {
  const questionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    id: formData.id,
    status: formData.status || 'draft',
    title: formData.title,
    description: formData.description,
    version: formData.version,
    date: formData.lastModified || formData.createdDate || new Date().toISOString(),
    item: formData.fields.map(fieldToQuestionnaireItem),
  };

  // Add categories as meta tags
  if (formData.category && formData.category.length > 0) {
    questionnaire.meta = {
      tag: formData.category.map((cat) => ({
        system: 'http://medimind.ge/form-category',
        code: cat,
        display: cat,
      })),
    };
  }

  // Add created by as extension
  if (formData.createdBy) {
    questionnaire.extension = [
      {
        url: 'http://medimind.ge/created-by',
        valueString: formData.createdBy,
      },
    ];
  }

  return questionnaire;
}

/**
 * Convert form builder field to FHIR QuestionnaireItem
 *
 * @param field - Field configuration
 * @returns FHIR QuestionnaireItem
 */
function fieldToQuestionnaireItem(field: FieldConfig): QuestionnaireItem {
  const item: QuestionnaireItem = {
    linkId: field.linkId,
    text: field.label,
    type: mapFieldTypeToFHIR(field.type),
    required: field.required,
    readOnly: field.readOnly,
    repeats: field.repeats,
  };

  // Add options for choice fields
  if (field.options && field.options.length > 0) {
    item.answerOption = field.options.map((opt) => ({
      valueCoding: opt.coding || {
        code: opt.value,
        display: opt.label,
      },
    }));
  }

  // Add conditional logic (enableWhen)
  if (field.conditional && field.conditional.enabled && field.conditional.conditions.length > 0) {
    item.enableWhen = field.conditional.conditions.map(conditionToEnableWhen);
    item.enableBehavior = field.conditional.operator === 'all' ? 'all' : 'any';
  }

  // Add extensions for patient binding, styling, validation
  const extensions: Extension[] = [];

  if (field.patientBinding?.enabled) {
    extensions.push({
      url: 'http://medimind.ge/patient-binding',
      valueString: field.patientBinding.bindingKey,
    });
    if (field.patientBinding.fhirPath) {
      extensions.push({
        url: 'http://medimind.ge/fhir-path',
        valueString: field.patientBinding.fhirPath,
      });
    }
  }

  if (field.styling) {
    extensions.push({
      url: 'http://medimind.ge/field-styling',
      valueString: JSON.stringify(field.styling),
    });
  }

  if (field.validation) {
    extensions.push({
      url: 'http://medimind.ge/validation-config',
      valueString: JSON.stringify(field.validation),
    });
  }

  if (extensions.length > 0) {
    item.extension = extensions;
  }

  return item;
}

/**
 * Map form builder field type to FHIR Questionnaire item type
 *
 * @param fieldType - Form builder field type
 * @returns FHIR item type
 */
function mapFieldTypeToFHIR(fieldType: FieldType): QuestionnaireItem['type'] {
  const typeMap: Record<FieldType, QuestionnaireItem['type']> = {
    text: 'string',
    textarea: 'text',
    date: 'date',
    datetime: 'dateTime',
    time: 'time',
    integer: 'integer',
    decimal: 'decimal',
    boolean: 'boolean',
    choice: 'choice',
    'open-choice': 'open-choice',
    radio: 'choice',
    'checkbox-group': 'choice',
    signature: 'attachment',
    attachment: 'attachment',
    display: 'display',
    group: 'group',
  };

  return typeMap[fieldType] || 'string';
}

/**
 * Convert condition to FHIR enableWhen
 *
 * @param condition - Condition configuration
 * @returns FHIR QuestionnaireItemEnableWhen
 */
function conditionToEnableWhen(condition: Condition): QuestionnaireItemEnableWhen {
  const enableWhen: QuestionnaireItemEnableWhen = {
    question: condition.questionId,
    operator: mapConditionOperator(condition.operator),
  };

  // Add answer value based on type
  if (typeof condition.answer === 'boolean') {
    enableWhen.answerBoolean = condition.answer;
  } else if (typeof condition.answer === 'number') {
    if (Number.isInteger(condition.answer)) {
      enableWhen.answerInteger = condition.answer;
    } else {
      enableWhen.answerDecimal = condition.answer;
    }
  } else if (typeof condition.answer === 'string') {
    enableWhen.answerString = condition.answer;
  }

  return enableWhen;
}

/**
 * Map condition operator to FHIR operator
 *
 * @param operator - Condition operator
 * @returns FHIR operator
 */
function mapConditionOperator(operator: string): QuestionnaireItemEnableWhen['operator'] {
  const operatorMap: Record<string, QuestionnaireItemEnableWhen['operator']> = {
    exists: 'exists',
    '=': '=',
    '!=': '!=',
    '>': '>',
    '<': '<',
    '>=': '>=',
    '<=': '<=',
  };

  return operatorMap[operator] || '=';
}

/**
 * Parse FHIR Questionnaire to form builder format
 *
 * @param questionnaire - FHIR Questionnaire resource
 * @returns Form template data
 */
export function fromQuestionnaire(questionnaire: Questionnaire): FormTemplate {
  const formData: FormTemplate = {
    id: questionnaire.id,
    title: questionnaire.title || 'Untitled Form',
    description: questionnaire.description,
    status: questionnaire.status as 'draft' | 'active' | 'retired',
    version: questionnaire.version,
    createdDate: questionnaire.date,
    lastModified: questionnaire.date,
    fields: questionnaire.item?.map(questionnaireItemToField) || [],
    category: questionnaire.meta?.tag
      ?.filter((tag) => tag.system === 'http://medimind.ge/form-category')
      .map((tag) => tag.code || ''),
    createdBy: questionnaire.extension?.find((ext) => ext.url === 'http://medimind.ge/created-by')?.valueString,
  };

  return formData;
}

/**
 * Convert FHIR QuestionnaireItem to form builder field
 *
 * @param item - FHIR QuestionnaireItem
 * @returns Field configuration
 */
function questionnaireItemToField(item: QuestionnaireItem): FieldConfig {
  const field: FieldConfig = {
    id: item.linkId,
    linkId: item.linkId,
    type: mapFHIRTypeToField(item.type),
    label: item.text || '',
    required: item.required,
    readOnly: item.readOnly,
    repeats: item.repeats,
  };

  // Extract options
  if (item.answerOption && item.answerOption.length > 0) {
    field.options = item.answerOption.map((opt) => ({
      value: opt.valueCoding?.code || '',
      label: opt.valueCoding?.display || opt.valueCoding?.code || '',
      coding: opt.valueCoding,
    }));
  }

  // Extract conditional logic
  if (item.enableWhen && item.enableWhen.length > 0) {
    field.conditional = {
      enabled: true,
      conditions: item.enableWhen.map(enableWhenToCondition),
      operator: item.enableBehavior === 'all' ? 'all' : 'any',
    };
  }

  // Extract extensions
  extractExtensions(item, field);

  return field;
}

/**
 * Map FHIR item type to form builder field type
 *
 * @param fhirType - FHIR item type
 * @returns Form builder field type
 */
function mapFHIRTypeToField(fhirType: QuestionnaireItem['type']): FieldType {
  const typeMap: Record<string, FieldType> = {
    string: 'text',
    text: 'textarea',
    date: 'date',
    dateTime: 'datetime',
    time: 'time',
    integer: 'integer',
    decimal: 'decimal',
    boolean: 'boolean',
    choice: 'choice',
    'open-choice': 'open-choice',
    attachment: 'attachment',
    display: 'display',
    group: 'group',
  };

  return typeMap[fhirType] || 'text';
}

/**
 * Convert FHIR enableWhen to condition
 *
 * @param enableWhen - FHIR QuestionnaireItemEnableWhen
 * @returns Condition configuration
 */
function enableWhenToCondition(enableWhen: QuestionnaireItemEnableWhen): Condition {
  const condition: Condition = {
    questionId: enableWhen.question,
    operator: enableWhen.operator as any,
    answer:
      enableWhen.answerBoolean ??
      enableWhen.answerInteger ??
      enableWhen.answerDecimal ??
      enableWhen.answerString ??
      '',
  };

  return condition;
}

/**
 * Extract custom extensions from QuestionnaireItem and populate field config
 *
 * @param item - FHIR QuestionnaireItem
 * @param field - Field configuration to populate
 */
export function extractExtensions(item: QuestionnaireItem, field: FieldConfig): void {
  if (!item.extension || item.extension.length === 0) {
    return;
  }

  for (const ext of item.extension) {
    switch (ext.url) {
      case 'http://medimind.ge/patient-binding':
        field.patientBinding = {
          enabled: true,
          bindingKey: ext.valueString as any,
        };
        break;

      case 'http://medimind.ge/fhir-path':
        if (field.patientBinding) {
          field.patientBinding.fhirPath = ext.valueString;
        }
        break;

      case 'http://medimind.ge/field-styling':
        try {
          field.styling = JSON.parse(ext.valueString || '{}');
        } catch {
          // Ignore invalid JSON
        }
        break;

      case 'http://medimind.ge/validation-config':
        try {
          field.validation = JSON.parse(ext.valueString || '{}');
        } catch {
          // Ignore invalid JSON
        }
        break;
    }
  }
}