// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { MedplumClient } from '@medplum/core';
import type { Questionnaire } from '@medplum/fhirtypes';
import { form100Template, FORM_100_ID, form100Metadata } from '../data/form-templates/form-100-template';
import { createQuestionnaire, listQuestionnaires } from './formBuilderService';

/**
 * @module form100Service
 * @description Service for managing Form 100 (IV-100/a) - Health Status Certificate
 *
 * Georgian official medical document form for health status certification.
 * Legal Reference: Ministry Order #230/n dated 15.10.2008
 */

/**
 * Check if Form 100 template already exists in the system
 *
 * @param medplum - Medplum client
 * @returns True if Form 100 template exists
 */
export async function form100Exists(medplum: MedplumClient): Promise<boolean> {
  try {
    const questionnaires = await listQuestionnaires(medplum, {
      title: form100Template.title,
    });

    // Check if any questionnaire matches the Form 100 ID or title
    return questionnaires.some(
      (q) =>
        q.identifier?.some((id) => id.value === FORM_100_ID) ||
        q.title === form100Template.title
    );
  } catch {
    return false;
  }
}

/**
 * Get Form 100 template if it exists
 *
 * @param medplum - Medplum client
 * @returns Form 100 Questionnaire or null if not found
 */
export async function getForm100(medplum: MedplumClient): Promise<Questionnaire | null> {
  try {
    const questionnaires = await listQuestionnaires(medplum, {
      title: form100Template.title,
    });

    return (
      questionnaires.find(
        (q) =>
          q.identifier?.some((id) => id.value === FORM_100_ID) ||
          q.title === form100Template.title
      ) || null
    );
  } catch {
    return null;
  }
}

/**
 * Seed Form 100 template into the system
 *
 * Creates the Form 100 template as a FHIR Questionnaire if it doesn't exist.
 * Returns existing template if already present.
 *
 * @param medplum - Medplum client
 * @param force - If true, create even if already exists (creates duplicate)
 * @returns Created or existing FHIR Questionnaire resource
 *
 * @example
 * ```typescript
 * // Create Form 100 if not exists
 * const form100 = await seedForm100(medplum);
 * console.log(form100.id); // Questionnaire ID
 *
 * // Force create (even if exists)
 * const newForm = await seedForm100(medplum, true);
 * ```
 */
export async function seedForm100(
  medplum: MedplumClient,
  force = false
): Promise<Questionnaire> {
  // Check if already exists
  if (!force) {
    const existing = await getForm100(medplum);
    if (existing) {
      console.log('Form 100 template already exists:', existing.id);
      return existing;
    }
  }

  // Create the Form 100 template
  console.log('Creating Form 100 template...');
  const questionnaire = await createQuestionnaire(medplum, form100Template);
  console.log('Form 100 template created:', questionnaire.id);

  return questionnaire;
}

/**
 * Get Form 100 metadata for display
 *
 * @returns Form 100 metadata object
 */
export function getForm100Metadata() {
  return form100Metadata;
}

/**
 * Get Form 100 template data (without creating in FHIR)
 *
 * Useful for preview or local editing before saving
 *
 * @returns Form 100 template data
 */
export function getForm100Template() {
  return form100Template;
}

/**
 * List of all system form templates
 *
 * System templates are pre-defined forms that come with the EMR system.
 * They cannot be deleted but can be cloned for customization.
 */
export const SYSTEM_FORM_TEMPLATES = [
  {
    id: FORM_100_ID,
    metadata: form100Metadata,
    template: form100Template,
    seedFunction: seedForm100,
  },
];

/**
 * Seed all system form templates
 *
 * @param medplum - Medplum client
 * @returns Array of seeded questionnaires
 */
export async function seedAllSystemTemplates(
  medplum: MedplumClient
): Promise<Questionnaire[]> {
  const results: Questionnaire[] = [];

  for (const systemTemplate of SYSTEM_FORM_TEMPLATES) {
    const questionnaire = await systemTemplate.seedFunction(medplum);
    results.push(questionnaire);
  }

  return results;
}

/**
 * Check if a questionnaire is a system template
 *
 * @param questionnaireId - Questionnaire ID to check
 * @returns True if it's a system template
 */
export function isSystemTemplate(questionnaireId: string): boolean {
  return SYSTEM_FORM_TEMPLATES.some((t) => t.id === questionnaireId);
}
