// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { MedplumClient } from '@medplum/core';
import type {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
  Patient,
  Encounter,
  Reference,
} from '@medplum/fhirtypes';
import type { FieldConfig, FormTemplate, PatientBinding } from '../types/form-builder';
import type { FormResponse, FieldAnswer, Answer, QuestionnaireResponseStatus } from '../types/form-renderer';
import type { PatientEncounterData, BindingKey } from '../types/patient-binding';
import { fromQuestionnaire } from './fhirHelpers';
import { getValueByBindingKey, extractCombinedData, evaluateFHIRPath } from './patientDataBindingService';

/**
 * @module formRendererService
 * @description Form Renderer Service for handling form filling and submission.
 *
 * Provides utilities for:
 * - Auto-populating form fields from patient/encounter data
 * - Rendering questionnaires with pre-filled values
 * - Creating QuestionnaireResponse resources
 * - Saving form responses (draft and completed)
 * - Searching and filtering completed forms
 * - Validating form submissions
 *
 * ## FHIR Resources Used
 * - Questionnaire: Form template definition
 * - QuestionnaireResponse: Completed form data
 * - Patient: Subject of the form
 * - Encounter: Clinical context
 *
 * ## Rate Limiting (T161 - Placeholder)
 * Recommended limits for form submission endpoints:
 * - submitForm: 20 requests/minute per user
 * - saveDraft: 60 requests/minute per user (higher due to auto-save)
 * - searchQuestionnaireResponses: 100 requests/minute per user
 *
 * @see formBuilderService for form template management
 * @see pdfGenerationService for PDF export
 */

// ============================================================================
// Form Population
// ============================================================================

/**
 * Populate form fields with patient and encounter data
 *
 * @param formTemplate - Form template with field configurations
 * @param data - Patient and encounter data
 * @returns Record of field linkId to populated value
 *
 * @example
 * ```typescript
 * const formTemplate = fromQuestionnaire(questionnaire);
 * const populatedValues = populateFormWithPatientData(formTemplate, { patient, encounter });
 * // { 'patient-name': 'თენგიზი ხოზვრია', 'patient-dob': '1990-05-15', ... }
 * ```
 */
export function populateFormWithPatientData(
  formTemplate: FormTemplate,
  data: PatientEncounterData
): Record<string, any> {
  const populatedValues: Record<string, any> = {};

  for (const field of formTemplate.fields) {
    if (field.patientBinding?.enabled && field.patientBinding.bindingKey) {
      const value = getPopulatedValue(field.patientBinding, data);
      if (value !== undefined && value !== null && value !== '') {
        populatedValues[field.linkId] = value;
      }
    }
  }

  return populatedValues;
}

/**
 * Populate a questionnaire with patient/encounter data
 *
 * @param questionnaire - FHIR Questionnaire resource
 * @param data - Patient and encounter data
 * @returns Populated values keyed by linkId
 */
export function populateQuestionnaire(
  questionnaire: Questionnaire,
  data: PatientEncounterData
): Record<string, any> {
  const formTemplate = fromQuestionnaire(questionnaire);
  return populateFormWithPatientData(formTemplate, data);
}

/**
 * Get populated value for a single field binding
 *
 * @param binding - Patient binding configuration
 * @param data - Patient and encounter data
 * @returns Populated value or undefined
 */
function getPopulatedValue(binding: PatientBinding, data: PatientEncounterData): any {
  // If a custom FHIRPath is provided, use it
  if (binding.fhirPath) {
    return evaluateFHIRPath(binding.fhirPath, data);
  }

  // Otherwise use the binding key
  return getValueByBindingKey(binding.bindingKey as BindingKey, data);
}

// ============================================================================
// QuestionnaireResponse Creation
// ============================================================================

/**
 * Create a QuestionnaireResponse from form values
 *
 * @param questionnaire - FHIR Questionnaire resource
 * @param values - Form field values (linkId -> value)
 * @param options - Additional options
 * @returns FHIR QuestionnaireResponse resource
 *
 * @example
 * ```typescript
 * const response = createQuestionnaireResponse(questionnaire, formValues, {
 *   status: 'completed',
 *   subject: { reference: 'Patient/123' },
 *   encounter: { reference: 'Encounter/456' },
 * });
 * ```
 */
export function createQuestionnaireResponse(
  questionnaire: Questionnaire,
  values: Record<string, any>,
  options: {
    status?: QuestionnaireResponseStatus;
    subject?: Reference;
    encounter?: Reference;
    author?: Reference;
  } = {}
): QuestionnaireResponse {
  const response: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    questionnaire: `Questionnaire/${questionnaire.id}`,
    status: options.status || 'in-progress',
    authored: new Date().toISOString(),
    subject: options.subject,
    encounter: options.encounter,
    author: options.author,
    item: questionnaire.item?.map((item) => createResponseItem(item, values)) || [],
  };

  return response;
}

/**
 * Create a QuestionnaireResponseItem from a QuestionnaireItem and values
 */
function createResponseItem(
  questionnaireItem: QuestionnaireItem,
  values: Record<string, any>
): QuestionnaireResponseItem {
  const responseItem: QuestionnaireResponseItem = {
    linkId: questionnaireItem.linkId,
    text: questionnaireItem.text,
  };

  const value = values[questionnaireItem.linkId];

  // Add answer if value exists
  if (value !== undefined && value !== null && value !== '') {
    responseItem.answer = [createAnswer(questionnaireItem, value)];
  }

  // Handle nested items (groups)
  if (questionnaireItem.item && questionnaireItem.item.length > 0) {
    responseItem.item = questionnaireItem.item.map((nestedItem) => createResponseItem(nestedItem, values));
  }

  return responseItem;
}

/**
 * Create an answer object based on item type and value
 */
function createAnswer(item: QuestionnaireItem, value: any): QuestionnaireResponseItemAnswer {
  const answer: QuestionnaireResponseItemAnswer = {};

  switch (item.type) {
    case 'boolean':
      answer.valueBoolean = Boolean(value);
      break;

    case 'integer':
      answer.valueInteger = parseInt(value, 10);
      break;

    case 'decimal':
      answer.valueDecimal = parseFloat(value);
      break;

    case 'date':
      answer.valueDate = String(value);
      break;

    case 'dateTime':
      answer.valueDateTime = String(value);
      break;

    case 'time':
      answer.valueTime = String(value);
      break;

    case 'choice':
    case 'open-choice':
      // Check if it's a coding or string
      if (typeof value === 'object' && value.code) {
        answer.valueCoding = value;
      } else {
        answer.valueString = String(value);
      }
      break;

    case 'attachment':
      if (typeof value === 'object') {
        answer.valueAttachment = value;
      }
      break;

    case 'reference':
      if (typeof value === 'object' && value.reference) {
        answer.valueReference = value;
      }
      break;

    case 'string':
    case 'text':
    default:
      answer.valueString = String(value);
      break;
  }

  return answer;
}

// ============================================================================
// FHIR Operations
// ============================================================================

/**
 * Save a QuestionnaireResponse to the server
 *
 * @param medplum - Medplum client
 * @param response - QuestionnaireResponse to save
 * @returns Saved QuestionnaireResponse with server-assigned ID
 *
 * @example
 * ```typescript
 * const savedResponse = await saveQuestionnaireResponse(medplum, response);
 * console.log(savedResponse.id); // Server-assigned ID
 * ```
 */
export async function saveQuestionnaireResponse(
  medplum: MedplumClient,
  response: QuestionnaireResponse
): Promise<QuestionnaireResponse> {
  if (response.id) {
    return await medplum.updateResource(response);
  }
  return await medplum.createResource(response);
}

/**
 * Fetch a questionnaire by ID
 *
 * @param medplum - Medplum client
 * @param id - Questionnaire ID
 * @returns FHIR Questionnaire resource
 */
export async function fetchQuestionnaire(medplum: MedplumClient, id: string): Promise<Questionnaire> {
  return await medplum.readResource('Questionnaire', id);
}

/**
 * Fetch a patient by ID
 *
 * @param medplum - Medplum client
 * @param id - Patient ID
 * @returns FHIR Patient resource
 */
export async function fetchPatient(medplum: MedplumClient, id: string): Promise<Patient> {
  return await medplum.readResource('Patient', id);
}

/**
 * Fetch an encounter by ID
 *
 * @param medplum - Medplum client
 * @param id - Encounter ID
 * @returns FHIR Encounter resource
 */
export async function fetchEncounter(medplum: MedplumClient, id: string): Promise<Encounter> {
  return await medplum.readResource('Encounter', id);
}

/**
 * Fetch form data (questionnaire + patient + encounter) for rendering
 *
 * @param medplum - Medplum client
 * @param questionnaireId - Questionnaire ID
 * @param patientId - Optional patient ID
 * @param encounterId - Optional encounter ID
 * @returns Form data including questionnaire, patient, encounter, and pre-populated values
 */
export async function fetchFormData(
  medplum: MedplumClient,
  questionnaireId: string,
  patientId?: string,
  encounterId?: string
): Promise<{
  questionnaire: Questionnaire;
  patient?: Patient;
  encounter?: Encounter;
  populatedValues: Record<string, any>;
}> {
  // Fetch questionnaire (required)
  const questionnaire = await fetchQuestionnaire(medplum, questionnaireId);

  // Fetch patient and encounter if provided
  let patient: Patient | undefined;
  let encounter: Encounter | undefined;

  if (patientId) {
    try {
      patient = await fetchPatient(medplum, patientId);
    } catch (error) {
      console.warn(`Failed to fetch patient ${patientId}:`, error);
    }
  }

  if (encounterId) {
    try {
      encounter = await fetchEncounter(medplum, encounterId);
    } catch (error) {
      console.warn(`Failed to fetch encounter ${encounterId}:`, error);
    }
  }

  // Populate form with patient/encounter data
  const populatedValues = populateQuestionnaire(questionnaire, { patient, encounter });

  return {
    questionnaire,
    patient,
    encounter,
    populatedValues,
  };
}

// ============================================================================
// Response Parsing
// ============================================================================

/**
 * Extract values from a QuestionnaireResponse into a flat record
 *
 * @param response - QuestionnaireResponse resource
 * @returns Record of linkId to value
 */
export function extractResponseValues(response: QuestionnaireResponse): Record<string, any> {
  const values: Record<string, any> = {};

  function processItem(item: QuestionnaireResponseItem): void {
    if (item.answer && item.answer.length > 0) {
      const answer = item.answer[0];
      values[item.linkId] = extractAnswerValue(answer);
    }

    // Process nested items
    if (item.item) {
      for (const nestedItem of item.item) {
        processItem(nestedItem);
      }
    }
  }

  if (response.item) {
    for (const item of response.item) {
      processItem(item);
    }
  }

  return values;
}

/**
 * Extract value from a QuestionnaireResponseItemAnswer
 */
function extractAnswerValue(answer: QuestionnaireResponseItemAnswer): any {
  if (answer.valueBoolean !== undefined) {
    return answer.valueBoolean;
  }
  if (answer.valueInteger !== undefined) {
    return answer.valueInteger;
  }
  if (answer.valueDecimal !== undefined) {
    return answer.valueDecimal;
  }
  if (answer.valueDate !== undefined) {
    return answer.valueDate;
  }
  if (answer.valueDateTime !== undefined) {
    return answer.valueDateTime;
  }
  if (answer.valueTime !== undefined) {
    return answer.valueTime;
  }
  if (answer.valueString !== undefined) {
    return answer.valueString;
  }
  if (answer.valueCoding !== undefined) {
    return answer.valueCoding;
  }
  if (answer.valueAttachment !== undefined) {
    return answer.valueAttachment;
  }
  if (answer.valueReference !== undefined) {
    return answer.valueReference;
  }

  return undefined;
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate form values against questionnaire requirements
 *
 * @param questionnaire - FHIR Questionnaire
 * @param values - Form field values
 * @returns Validation result with errors
 */
export function validateFormValues(
  questionnaire: Questionnaire,
  values: Record<string, any>
): { isValid: boolean; errors: Record<string, string[]> } {
  const errors: Record<string, string[]> = {};

  function validateItem(item: QuestionnaireItem): void {
    const value = values[item.linkId];
    const fieldErrors: string[] = [];

    // Check required
    if (item.required && (value === undefined || value === null || value === '')) {
      fieldErrors.push('This field is required');
    }

    // Check maxLength for string/text
    if ((item.type === 'string' || item.type === 'text') && item.maxLength && typeof value === 'string') {
      if (value.length > item.maxLength) {
        fieldErrors.push(`Maximum length is ${item.maxLength} characters`);
      }
    }

    if (fieldErrors.length > 0) {
      errors[item.linkId] = fieldErrors;
    }

    // Validate nested items
    if (item.item) {
      for (const nestedItem of item.item) {
        validateItem(nestedItem);
      }
    }
  }

  if (questionnaire.item) {
    for (const item of questionnaire.item) {
      validateItem(item);
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ============================================================================
// Form Completion
// ============================================================================

/**
 * Submit a completed form
 *
 * @param medplum - Medplum client
 * @param questionnaire - FHIR Questionnaire
 * @param values - Form field values
 * @param options - Additional options
 * @returns Saved QuestionnaireResponse
 */
export async function submitForm(
  medplum: MedplumClient,
  questionnaire: Questionnaire,
  values: Record<string, any>,
  options: {
    subject?: Reference;
    encounter?: Reference;
    author?: Reference;
  } = {}
): Promise<QuestionnaireResponse> {
  // Create response with completed status
  const response = createQuestionnaireResponse(questionnaire, values, {
    status: 'completed',
    ...options,
  });

  // Save to server
  return await saveQuestionnaireResponse(medplum, response);
}

/**
 * Save a draft form
 *
 * @param medplum - Medplum client
 * @param questionnaire - FHIR Questionnaire
 * @param values - Form field values
 * @param options - Additional options
 * @returns Saved QuestionnaireResponse (in-progress status)
 */
export async function saveDraft(
  medplum: MedplumClient,
  questionnaire: Questionnaire,
  values: Record<string, any>,
  options: {
    responseId?: string;
    subject?: Reference;
    encounter?: Reference;
    author?: Reference;
  } = {}
): Promise<QuestionnaireResponse> {
  // Create response with in-progress status
  const response = createQuestionnaireResponse(questionnaire, values, {
    status: 'in-progress',
    ...options,
  });

  // If we have an existing response ID, update it
  if (options.responseId) {
    response.id = options.responseId;
  }

  // Save to server
  return await saveQuestionnaireResponse(medplum, response);
}

// ============================================================================
// Form Search and Retrieval
// ============================================================================

/**
 * Search parameters for QuestionnaireResponse queries
 */
export interface FormSearchParams {
  patientId?: string;
  patientName?: string;
  questionnaireId?: string;
  status?: QuestionnaireResponseStatus | QuestionnaireResponseStatus[];
  dateFrom?: string;
  dateTo?: string;
  _count?: number;
  _offset?: number;
  _sort?: string;
  _total?: 'none' | 'estimate' | 'accurate';
  fullTextSearch?: string;
}

/**
 * Search result with pagination metadata
 */
export interface FormSearchResult {
  responses: QuestionnaireResponse[];
  total: number;
  hasMore: boolean;
  pageInfo: {
    count: number;
    offset: number;
    totalPages: number;
    currentPage: number;
  };
}

/**
 * Search for QuestionnaireResponses with filters
 *
 * @param medplum - Medplum client
 * @param params - Search parameters
 * @returns Search results with pagination metadata
 *
 * @example
 * ```typescript
 * const results = await searchQuestionnaireResponses(medplum, {
 *   patientId: 'patient-123',
 *   status: 'completed',
 *   dateFrom: '2025-01-01',
 *   dateTo: '2025-12-31',
 *   _count: 100,
 *   _offset: 0,
 * });
 * ```
 */
export async function searchQuestionnaireResponses(
  medplum: MedplumClient,
  params: FormSearchParams = {}
): Promise<FormSearchResult> {
  const searchParams: Record<string, string> = {};

  // Patient filter
  if (params.patientId) {
    searchParams['subject'] = `Patient/${params.patientId}`;
  }

  // Questionnaire filter
  if (params.questionnaireId) {
    searchParams['questionnaire'] = `Questionnaire/${params.questionnaireId}`;
  }

  // Status filter
  if (params.status) {
    const statuses = Array.isArray(params.status) ? params.status : [params.status];
    searchParams['status'] = statuses.join(',');
  }

  // Date range filter
  if (params.dateFrom) {
    searchParams['authored'] = `ge${params.dateFrom}`;
  }
  if (params.dateTo) {
    // Use _authored parameter for second date constraint
    if (params.dateFrom) {
      searchParams['authored'] = `ge${params.dateFrom},le${params.dateTo}`;
    } else {
      searchParams['authored'] = `le${params.dateTo}`;
    }
  }

  // Pagination
  const count = params._count || 100;
  const offset = params._offset || 0;
  searchParams['_count'] = String(count);
  searchParams['_offset'] = String(offset);

  // Sorting (default to newest first)
  searchParams['_sort'] = params._sort || '-authored';

  // Request total count
  searchParams['_total'] = params._total || 'accurate';

  // Include referenced resources
  searchParams['_include'] = 'QuestionnaireResponse:subject';
  searchParams['_include:iterate'] = 'QuestionnaireResponse:questionnaire';

  // Execute search
  const bundle = await medplum.search('QuestionnaireResponse', searchParams);

  // Extract responses
  let responses: QuestionnaireResponse[] = [];
  if (bundle.entry) {
    responses = bundle.entry
      .filter((e) => e.resource?.resourceType === 'QuestionnaireResponse')
      .map((e) => e.resource as QuestionnaireResponse);
  }

  // Apply full-text search filter if provided (client-side filtering)
  if (params.fullTextSearch && params.fullTextSearch.trim()) {
    const searchTerm = params.fullTextSearch.toLowerCase().trim();
    responses = responses.filter((response) => {
      return responseMatchesFullTextSearch(response, searchTerm);
    });
  }

  // Apply patient name filter if provided (client-side filtering)
  if (params.patientName && params.patientName.trim()) {
    const patientNameLower = params.patientName.toLowerCase().trim();
    const patients = new Map<string, Patient>();

    // Build patient map from included resources
    if (bundle.entry) {
      for (const entry of bundle.entry) {
        if (entry.resource?.resourceType === 'Patient') {
          patients.set(`Patient/${entry.resource.id}`, entry.resource as Patient);
        }
      }
    }

    responses = responses.filter((response) => {
      if (!response.subject?.reference) {
        return false;
      }
      const patient = patients.get(response.subject.reference);
      if (!patient) {
        return false;
      }
      // Check patient name
      const patientName = patient.name?.[0];
      if (!patientName) {
        return false;
      }
      const fullName = [
        ...(patientName.given || []),
        patientName.family || '',
      ].join(' ').toLowerCase();
      return fullName.includes(patientNameLower);
    });
  }

  // Calculate pagination metadata
  const total = bundle.total || responses.length;
  const totalPages = Math.ceil(total / count);
  const currentPage = Math.floor(offset / count) + 1;
  const hasMore = offset + responses.length < total;

  return {
    responses,
    total,
    hasMore,
    pageInfo: {
      count,
      offset,
      totalPages,
      currentPage,
    },
  };
}

/**
 * Check if a QuestionnaireResponse matches a full-text search term
 */
function responseMatchesFullTextSearch(
  response: QuestionnaireResponse,
  searchTerm: string
): boolean {
  // Search in response items
  if (response.item) {
    for (const item of response.item) {
      if (itemMatchesSearch(item, searchTerm)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Recursively check if an item or its answers match a search term
 */
function itemMatchesSearch(
  item: QuestionnaireResponseItem,
  searchTerm: string
): boolean {
  // Check item text
  if (item.text?.toLowerCase().includes(searchTerm)) {
    return true;
  }

  // Check answers
  if (item.answer) {
    for (const answer of item.answer) {
      const value = extractAnswerValue(answer);
      if (value !== undefined && String(value).toLowerCase().includes(searchTerm)) {
        return true;
      }
    }
  }

  // Check nested items
  if (item.item) {
    for (const nestedItem of item.item) {
      if (itemMatchesSearch(nestedItem, searchTerm)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Fetch a single QuestionnaireResponse by ID
 *
 * @param medplum - Medplum client
 * @param id - QuestionnaireResponse ID
 * @returns QuestionnaireResponse with related resources
 */
export async function fetchQuestionnaireResponse(
  medplum: MedplumClient,
  id: string
): Promise<{
  response: QuestionnaireResponse;
  questionnaire?: Questionnaire;
  patient?: Patient;
}> {
  const response = await medplum.readResource('QuestionnaireResponse', id);

  let questionnaire: Questionnaire | undefined;
  let patient: Patient | undefined;

  // Fetch related questionnaire
  if (response.questionnaire) {
    const questionnaireRef = response.questionnaire.replace('Questionnaire/', '');
    try {
      questionnaire = await medplum.readResource('Questionnaire', questionnaireRef);
    } catch (error) {
      console.warn(`Failed to fetch questionnaire ${questionnaireRef}:`, error);
    }
  }

  // Fetch related patient
  if (response.subject?.reference) {
    const patientRef = response.subject.reference.replace('Patient/', '');
    try {
      patient = await medplum.readResource('Patient', patientRef);
    } catch (error) {
      console.warn(`Failed to fetch patient ${patientRef}:`, error);
    }
  }

  return { response, questionnaire, patient };
}

/**
 * Fetch all available Questionnaires for filtering
 *
 * @param medplum - Medplum client
 * @returns List of available questionnaires
 */
export async function fetchAvailableQuestionnaires(
  medplum: MedplumClient
): Promise<Questionnaire[]> {
  const bundle = await medplum.search('Questionnaire', {
    status: 'active',
    _count: '1000',
    _sort: 'title',
  });

  if (!bundle.entry) {
    return [];
  }

  return bundle.entry
    .filter((e) => e.resource?.resourceType === 'Questionnaire')
    .map((e) => e.resource as Questionnaire);
}
