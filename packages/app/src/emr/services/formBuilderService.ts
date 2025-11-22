// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { MedplumClient } from '@medplum/core';
import type { Questionnaire } from '@medplum/fhirtypes';
import type { FormTemplate } from '../types/form-builder';
import { toQuestionnaire, fromQuestionnaire } from './fhirHelpers';

/**
 * @module formBuilderService
 * @description Form builder service for managing FHIR Questionnaire resources.
 *
 * Provides CRUD operations for form templates:
 * - Create new form templates
 * - Update existing templates (creates new version)
 * - Fetch templates by ID
 * - List templates with optional filters
 * - Version management and history
 * - Archiving and restoration
 *
 * ## Rate Limiting (T161 - Placeholder)
 *
 * In production, these API endpoints should be rate-limited to prevent abuse:
 *
 * Recommended limits:
 * - createQuestionnaire: 10 requests/minute per user
 * - updateQuestionnaire: 30 requests/minute per user
 * - listQuestionnaires: 100 requests/minute per user
 * - deleteQuestionnaire: 5 requests/minute per user
 *
 * Implementation options:
 * 1. Server-side: Configure Medplum server rate limits
 * 2. API Gateway: Use Kong, AWS API Gateway, etc.
 * 3. Custom middleware: Implement token bucket algorithm
 *
 * Example with express-rate-limit:
 * ```typescript
 * import rateLimit from 'express-rate-limit';
 *
 * const formBuilderLimiter = rateLimit({
 *   windowMs: 60 * 1000, // 1 minute
 *   max: 30, // 30 requests per minute
 *   message: 'Too many requests, please try again later',
 *   standardHeaders: true,
 *   legacyHeaders: false,
 * });
 *
 * app.use('/fhir/Questionnaire', formBuilderLimiter);
 * ```
 *
 * TODO: Implement rate limiting when deploying to production
 */

/**
 * Search filters for listing questionnaires
 */
export interface QuestionnaireSearchFilters {
  status?: 'draft' | 'active' | 'retired';
  title?: string;
  category?: string;
  count?: number;
  offset?: number;
}

/**
 * Create a new form template as FHIR Questionnaire
 *
 * @param medplum - Medplum client
 * @param formData - Form template data
 * @returns Created FHIR Questionnaire resource
 * @throws Error if creation fails
 *
 * @example
 * ```typescript
 * const formData: FormTemplate = {
 *   title: 'Patient Consent Form',
 *   description: 'Standard consent form',
 *   status: 'draft',
 *   fields: [
 *     {
 *       id: 'field-1',
 *       linkId: 'patientName',
 *       type: 'text',
 *       label: 'Patient Name',
 *       required: true
 *     }
 *   ]
 * };
 * const questionnaire = await createQuestionnaire(medplum, formData);
 * ```
 */
export async function createQuestionnaire(
  medplum: MedplumClient,
  formData: FormTemplate
): Promise<Questionnaire> {
  const questionnaire = toQuestionnaire(formData);
  return await medplum.createResource(questionnaire);
}

/**
 * Update an existing form template (creates new version)
 *
 * @param medplum - Medplum client
 * @param id - Questionnaire resource ID
 * @param formData - Updated form template data
 * @returns Updated FHIR Questionnaire resource
 * @throws Error if update fails or resource not found
 *
 * @example
 * ```typescript
 * const updatedData: FormTemplate = {
 *   ...existingFormData,
 *   title: 'Updated Patient Consent Form',
 *   version: '2.0'
 * };
 * const questionnaire = await updateQuestionnaire(medplum, 'questionnaire-id', updatedData);
 * ```
 */
export async function updateQuestionnaire(
  medplum: MedplumClient,
  id: string,
  formData: FormTemplate
): Promise<Questionnaire> {
  const questionnaire = toQuestionnaire({ ...formData, id });
  return await medplum.updateResource(questionnaire);
}

/**
 * Fetch a form template by ID
 *
 * @param medplum - Medplum client
 * @param id - Questionnaire resource ID
 * @returns FHIR Questionnaire resource
 * @throws Error if resource not found
 *
 * @example
 * ```typescript
 * const questionnaire = await getQuestionnaire(medplum, 'questionnaire-id');
 * console.log(questionnaire.title); // "Patient Consent Form"
 * ```
 */
export async function getQuestionnaire(medplum: MedplumClient, id: string): Promise<Questionnaire> {
  return await medplum.readResource('Questionnaire', id);
}

/**
 * List form templates with optional filters
 *
 * @param medplum - Medplum client
 * @param filters - Optional search filters
 * @returns Array of FHIR Questionnaire resources
 * @throws Error if search fails
 *
 * @example
 * ```typescript
 * // Get all active questionnaires
 * const activeQuestionnaires = await listQuestionnaires(medplum, {
 *   status: 'active'
 * });
 *
 * // Search by title
 * const consentForms = await listQuestionnaires(medplum, {
 *   title: 'consent'
 * });
 *
 * // Paginated results
 * const page1 = await listQuestionnaires(medplum, {
 *   count: 20,
 *   offset: 0
 * });
 * ```
 */
export async function listQuestionnaires(
  medplum: MedplumClient,
  filters?: QuestionnaireSearchFilters
): Promise<Questionnaire[]> {
  const searchParams: Record<string, string> = {};

  if (filters?.status) {
    searchParams.status = filters.status;
  }

  if (filters?.title) {
    searchParams.title = filters.title;
  }

  if (filters?.category) {
    searchParams['_tag'] = `http://medimind.ge/form-category|${filters.category}`;
  }

  if (filters?.count) {
    searchParams._count = filters.count.toString();
  }

  if (filters?.offset) {
    searchParams._offset = filters.offset.toString();
  }

  // Add default sort by date (newest first)
  searchParams._sort = '-date';

  const bundle = await medplum.searchResources('Questionnaire', searchParams);
  return bundle;
}

/**
 * Convert FHIR Questionnaire to form template data
 *
 * @param questionnaire - FHIR Questionnaire resource
 * @returns Form template data
 *
 * @example
 * ```typescript
 * const questionnaire = await getQuestionnaire(medplum, 'questionnaire-id');
 * const formData = questionnaireToFormTemplate(questionnaire);
 * console.log(formData.title); // "Patient Consent Form"
 * console.log(formData.fields.length); // 10
 * ```
 */
export function questionnaireToFormTemplate(questionnaire: Questionnaire): FormTemplate {
  return fromQuestionnaire(questionnaire);
}

/**
 * Delete a form template (soft delete - sets status to 'retired')
 *
 * @param medplum - Medplum client
 * @param id - Questionnaire resource ID
 * @returns Updated FHIR Questionnaire resource with status 'retired'
 * @throws Error if update fails or resource not found
 *
 * @example
 * ```typescript
 * const retired = await deleteQuestionnaire(medplum, 'questionnaire-id');
 * console.log(retired.status); // "retired"
 * ```
 */
export async function deleteQuestionnaire(medplum: MedplumClient, id: string): Promise<Questionnaire> {
  const questionnaire = await getQuestionnaire(medplum, id);
  return await medplum.updateResource({
    ...questionnaire,
    status: 'retired',
  });
}

/**
 * Permanently delete a form template (hard delete)
 *
 * WARNING: This permanently removes the resource. Use with caution.
 * Consider using deleteQuestionnaire (soft delete) instead.
 *
 * @param medplum - Medplum client
 * @param id - Questionnaire resource ID
 * @throws Error if deletion fails or resource not found
 *
 * @example
 * ```typescript
 * await hardDeleteQuestionnaire(medplum, 'questionnaire-id');
 * // Resource is permanently deleted
 * ```
 */
export async function hardDeleteQuestionnaire(medplum: MedplumClient, id: string): Promise<void> {
  await medplum.deleteResource('Questionnaire', id);
}

/**
 * Clone a form template with a new name
 *
 * @param medplum - Medplum client
 * @param id - Source questionnaire ID
 * @param newTitle - Title for cloned questionnaire
 * @returns Cloned FHIR Questionnaire resource
 * @throws Error if cloning fails or source not found
 *
 * @example
 * ```typescript
 * const original = await getQuestionnaire(medplum, 'questionnaire-id');
 * const clone = await cloneQuestionnaire(medplum, 'questionnaire-id', 'Patient Consent Form (Copy)');
 * console.log(clone.title); // "Patient Consent Form (Copy)"
 * console.log(clone.id !== original.id); // true
 * ```
 */
export async function cloneQuestionnaire(
  medplum: MedplumClient,
  id: string,
  newTitle: string
): Promise<Questionnaire> {
  const source = await getQuestionnaire(medplum, id);
  const formData = fromQuestionnaire(source);

  // Create new form with updated title and no ID
  const clonedFormData: FormTemplate = {
    ...formData,
    id: undefined, // Remove ID to create new resource
    title: newTitle,
    status: 'draft',
    version: '1.0',
  };

  return await createQuestionnaire(medplum, clonedFormData);
}

/**
 * Search questionnaires by category
 *
 * @param medplum - Medplum client
 * @param category - Category code to filter by
 * @returns Array of FHIR Questionnaire resources
 * @throws Error if search fails
 *
 * @example
 * ```typescript
 * const consentForms = await searchByCategory(medplum, 'consent');
 * const admissionForms = await searchByCategory(medplum, 'admission');
 * ```
 */
export async function searchByCategory(medplum: MedplumClient, category: string): Promise<Questionnaire[]> {
  return await listQuestionnaires(medplum, { category });
}

// ============================================================================
// Versioning Functions (T089)
// ============================================================================

/**
 * Version history entry representing a single version of a questionnaire
 */
export interface VersionHistoryEntry {
  versionId: string;
  version: string;
  date: string;
  status: 'draft' | 'active' | 'retired';
  title: string;
  modifiedBy?: string;
}

/**
 * Increment the version number of a questionnaire
 *
 * @param currentVersion - Current version string (e.g., '1.0', '2.3')
 * @returns New version string with incremented minor version
 *
 * @example
 * ```typescript
 * incrementVersion('1.0'); // Returns '1.1'
 * incrementVersion('2.5'); // Returns '2.6'
 * incrementVersion(undefined); // Returns '1.0'
 * ```
 */
export function incrementVersion(currentVersion?: string): string {
  if (!currentVersion) {
    return '1.0';
  }

  const parts = currentVersion.split('.');
  if (parts.length >= 2) {
    const major = parseInt(parts[0], 10) || 1;
    const minor = parseInt(parts[1], 10) || 0;
    return `${major}.${minor + 1}`;
  }

  const major = parseInt(parts[0], 10) || 1;
  return `${major}.1`;
}

/**
 * Increment the major version number
 *
 * @param currentVersion - Current version string
 * @returns New version string with incremented major version and reset minor
 *
 * @example
 * ```typescript
 * incrementMajorVersion('1.5'); // Returns '2.0'
 * incrementMajorVersion('3.2'); // Returns '4.0'
 * ```
 */
export function incrementMajorVersion(currentVersion?: string): string {
  if (!currentVersion) {
    return '1.0';
  }

  const parts = currentVersion.split('.');
  const major = parseInt(parts[0], 10) || 0;
  return `${major + 1}.0`;
}

/**
 * Get the version history for a questionnaire
 *
 * Uses FHIR _history endpoint to retrieve all versions of a resource.
 * Note: The actual history depends on Medplum server configuration.
 *
 * @param medplum - Medplum client
 * @param id - Questionnaire resource ID
 * @returns Array of version history entries, newest first
 *
 * @example
 * ```typescript
 * const history = await getVersionHistory(medplum, 'questionnaire-id');
 * console.log(history[0].version); // Latest version
 * console.log(history.length); // Number of versions
 * ```
 */
export async function getVersionHistory(
  medplum: MedplumClient,
  id: string
): Promise<VersionHistoryEntry[]> {
  try {
    // Get the resource history from FHIR
    const historyBundle = await medplum.readHistory('Questionnaire', id);
    const entries: VersionHistoryEntry[] = [];

    if (historyBundle.entry) {
      for (const entry of historyBundle.entry) {
        const questionnaire = entry.resource as Questionnaire;
        if (questionnaire) {
          entries.push({
            versionId: questionnaire.meta?.versionId || '',
            version: questionnaire.version || '1.0',
            date: questionnaire.meta?.lastUpdated || questionnaire.date || '',
            status: (questionnaire.status as 'draft' | 'active' | 'retired') || 'draft',
            title: questionnaire.title || 'Untitled',
            modifiedBy: questionnaire.extension?.find(
              (ext) => ext.url === 'http://medimind.ge/created-by'
            )?.valueString,
          });
        }
      }
    }

    // Sort by date descending (newest first)
    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return entries;
  } catch {
    // If history endpoint fails, return current version only
    const current = await getQuestionnaire(medplum, id);
    return [
      {
        versionId: current.meta?.versionId || '1',
        version: current.version || '1.0',
        date: current.meta?.lastUpdated || current.date || new Date().toISOString(),
        status: (current.status as 'draft' | 'active' | 'retired') || 'draft',
        title: current.title || 'Untitled',
        modifiedBy: current.extension?.find(
          (ext) => ext.url === 'http://medimind.ge/created-by'
        )?.valueString,
      },
    ];
  }
}

/**
 * Update a questionnaire with automatic version increment
 *
 * @param medplum - Medplum client
 * @param id - Questionnaire resource ID
 * @param formData - Updated form template data
 * @param incrementMajor - Whether to increment major version (default: false)
 * @returns Updated FHIR Questionnaire resource with new version
 *
 * @example
 * ```typescript
 * // Minor version increment (1.0 -> 1.1)
 * const updated = await updateWithVersioning(medplum, id, formData);
 *
 * // Major version increment (1.5 -> 2.0)
 * const major = await updateWithVersioning(medplum, id, formData, true);
 * ```
 */
export async function updateWithVersioning(
  medplum: MedplumClient,
  id: string,
  formData: FormTemplate,
  incrementMajor = false
): Promise<Questionnaire> {
  const current = await getQuestionnaire(medplum, id);
  const newVersion = incrementMajor
    ? incrementMajorVersion(current.version)
    : incrementVersion(current.version);

  const updatedFormData: FormTemplate = {
    ...formData,
    id,
    version: newVersion,
    lastModified: new Date().toISOString(),
  };

  return await updateQuestionnaire(medplum, id, updatedFormData);
}

/**
 * Get a specific version of a questionnaire
 *
 * @param medplum - Medplum client
 * @param id - Questionnaire resource ID
 * @param versionId - Version ID to retrieve
 * @returns FHIR Questionnaire resource at specified version
 *
 * @example
 * ```typescript
 * const v1 = await getQuestionnaireVersion(medplum, 'q-123', '1');
 * const v2 = await getQuestionnaireVersion(medplum, 'q-123', '2');
 * ```
 */
export async function getQuestionnaireVersion(
  medplum: MedplumClient,
  id: string,
  versionId: string
): Promise<Questionnaire> {
  return await medplum.readVersion('Questionnaire', id, versionId);
}

// ============================================================================
// Archiving Functions (T091)
// ============================================================================

/**
 * Archive a form template (sets status to 'retired')
 *
 * Archived forms are hidden from the default list view but can still be
 * retrieved by ID or by filtering for retired status.
 *
 * @param medplum - Medplum client
 * @param id - Questionnaire resource ID
 * @returns Updated FHIR Questionnaire resource with status 'retired'
 *
 * @example
 * ```typescript
 * const archived = await archiveQuestionnaire(medplum, 'questionnaire-id');
 * console.log(archived.status); // "retired"
 * ```
 */
export async function archiveQuestionnaire(
  medplum: MedplumClient,
  id: string
): Promise<Questionnaire> {
  const questionnaire = await getQuestionnaire(medplum, id);
  return await medplum.updateResource({
    ...questionnaire,
    status: 'retired',
  });
}

/**
 * Restore an archived form template (sets status to 'active')
 *
 * @param medplum - Medplum client
 * @param id - Questionnaire resource ID
 * @returns Updated FHIR Questionnaire resource with status 'active'
 *
 * @example
 * ```typescript
 * const restored = await restoreQuestionnaire(medplum, 'questionnaire-id');
 * console.log(restored.status); // "active"
 * ```
 */
export async function restoreQuestionnaire(
  medplum: MedplumClient,
  id: string
): Promise<Questionnaire> {
  const questionnaire = await getQuestionnaire(medplum, id);
  return await medplum.updateResource({
    ...questionnaire,
    status: 'active',
  });
}

/**
 * Set questionnaire to draft status
 *
 * @param medplum - Medplum client
 * @param id - Questionnaire resource ID
 * @returns Updated FHIR Questionnaire resource with status 'draft'
 *
 * @example
 * ```typescript
 * const draft = await setQuestionnaireDraft(medplum, 'questionnaire-id');
 * console.log(draft.status); // "draft"
 * ```
 */
export async function setQuestionnaireDraft(
  medplum: MedplumClient,
  id: string
): Promise<Questionnaire> {
  const questionnaire = await getQuestionnaire(medplum, id);
  return await medplum.updateResource({
    ...questionnaire,
    status: 'draft',
  });
}

/**
 * Publish a questionnaire (sets status to 'active')
 *
 * @param medplum - Medplum client
 * @param id - Questionnaire resource ID
 * @returns Updated FHIR Questionnaire resource with status 'active'
 *
 * @example
 * ```typescript
 * const published = await publishQuestionnaire(medplum, 'questionnaire-id');
 * console.log(published.status); // "active"
 * ```
 */
export async function publishQuestionnaire(
  medplum: MedplumClient,
  id: string
): Promise<Questionnaire> {
  return await restoreQuestionnaire(medplum, id);
}

/**
 * List only active and draft questionnaires (excludes archived)
 *
 * @param medplum - Medplum client
 * @param filters - Optional additional filters
 * @returns Array of non-archived FHIR Questionnaire resources
 *
 * @example
 * ```typescript
 * const activeForms = await listActiveQuestionnaires(medplum);
 * // Only returns forms with status 'draft' or 'active'
 * ```
 */
export async function listActiveQuestionnaires(
  medplum: MedplumClient,
  filters?: Omit<QuestionnaireSearchFilters, 'status'>
): Promise<Questionnaire[]> {
  const searchParams: Record<string, string> = {
    'status:not': 'retired',
  };

  if (filters?.title) {
    searchParams.title = filters.title;
  }

  if (filters?.category) {
    searchParams['_tag'] = `http://medimind.ge/form-category|${filters.category}`;
  }

  if (filters?.count) {
    searchParams._count = filters.count.toString();
  }

  if (filters?.offset) {
    searchParams._offset = filters.offset.toString();
  }

  searchParams._sort = '-date';

  return await medplum.searchResources('Questionnaire', searchParams);
}

/**
 * List only archived questionnaires
 *
 * @param medplum - Medplum client
 * @param filters - Optional additional filters
 * @returns Array of archived FHIR Questionnaire resources
 *
 * @example
 * ```typescript
 * const archivedForms = await listArchivedQuestionnaires(medplum);
 * ```
 */
export async function listArchivedQuestionnaires(
  medplum: MedplumClient,
  filters?: Omit<QuestionnaireSearchFilters, 'status'>
): Promise<Questionnaire[]> {
  return await listQuestionnaires(medplum, { ...filters, status: 'retired' });
}
