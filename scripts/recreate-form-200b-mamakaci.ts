#!/usr/bin/env tsx
/**
 * Delete and Recreate Form 200-/b Mamakaci (Male Examination Form)
 *
 * This script deletes the existing Form 200-/b questionnaire and creates
 * a new one from the updated template.
 *
 * Steps to get your token:
 * 1. Open http://localhost:3000 in your browser
 * 2. Login with your admin account
 * 3. Open DevTools (F12 or Right-click → Inspect)
 * 4. Go to Application tab → Local Storage → http://localhost:3000
 * 5. Find "activeLogin" key and copy the entire JSON value
 * 6. Look for "accessToken" field in that JSON
 *
 * Usage:
 *   export MEDPLUM_TOKEN="your-access-token-here"
 *   npx tsx scripts/recreate-form-200b-mamakaci.ts
 *
 * Or pass token as argument:
 *   npx tsx scripts/recreate-form-200b-mamakaci.ts "your-access-token-here"
 */

import { MedplumClient } from '@medplum/core';
import type { Questionnaire, QuestionnaireItem, QuestionnaireItemAnswerOption } from '@medplum/fhirtypes';
import {
  form200bMamakacTemplate,
  FORM_200B_MAMAKACI_ID,
} from '../packages/app/src/emr/data/form-templates/form-200b-mamakaci-template';
import type { FieldConfig, FieldOption } from '../packages/app/src/emr/types/form-builder';

const MEDPLUM_BASE_URL = 'http://localhost:8103';

async function main() {
  // Get token from environment or argument
  const token = process.argv[2] || process.env.MEDPLUM_TOKEN;

  if (!token) {
    console.error('No access token provided!');
    console.error('');
    console.error('Usage:');
    console.error('  export MEDPLUM_TOKEN="your-access-token"');
    console.error('  npx tsx scripts/recreate-form-200b-mamakaci.ts');
    console.error('');
    console.error('Or:');
    console.error('  npx tsx scripts/recreate-form-200b-mamakaci.ts "your-access-token"');
    process.exit(1);
  }

  console.log('Recreating Form 200-/b Mamakaci (Male Examination Form)...');
  console.log(`Server: ${MEDPLUM_BASE_URL}`);
  console.log('');

  // Create Medplum client with token
  const medplum = new MedplumClient({
    baseUrl: MEDPLUM_BASE_URL,
    fetch: fetch,
  });
  medplum.setAccessToken(token);

  try {
    // Step 1: Find existing Form 200-/b Mamakaci
    console.log('Searching for existing Form 200-/b Mamakaci...');
    const searchResult = await medplum.searchResources('Questionnaire', {
      _count: '100',
    });

    // Find Form 200-/b by title or identifier
    const existingForm = searchResult.find(
      (q) =>
        q.title === form200bMamakacTemplate.title ||
        q.title?.includes('200-/ბ') ||
        q.title?.includes('მამაკაცი') ||
        q.title?.includes('გასინჯვის ფურცელი (მამაკაცი)') ||
        q.identifier?.some((id) => id.value === FORM_200B_MAMAKACI_ID)
    );

    if (existingForm) {
      console.log(`Found existing Form 200-/b Mamakaci: ${existingForm.id}`);
      console.log(`   Title: ${existingForm.title}`);
      console.log(`   Items: ${existingForm.item?.length || 0}`);

      // Step 2: Delete existing Form
      console.log('');
      console.log('Deleting existing Form 200-/b Mamakaci...');
      await medplum.deleteResource('Questionnaire', existingForm.id!);
      console.log('Deleted successfully');
    } else {
      console.log('No existing Form 200-/b Mamakaci found, will create new one');
    }

    // Step 3: Create new Form from template
    console.log('');
    console.log('Creating new Form 200-/b Mamakaci from template...');
    console.log(`   Total fields: ${form200bMamakacTemplate.fields.length}`);

    // Convert template to FHIR Questionnaire
    const questionnaire = templateToQuestionnaire(form200bMamakacTemplate);

    const created = await medplum.createResource(questionnaire);

    console.log('');
    console.log('Form 200-/b Mamakaci created successfully!');
    console.log(`   ID: ${created.id}`);
    console.log(`   Title: ${created.title}`);
    console.log(`   Items: ${created.item?.length || 0}`);
    console.log(`   Status: ${created.status}`);

    // Count field types
    const displayFields = form200bMamakacTemplate.fields.filter((f) => f.type === 'display').length;
    const dropdowns = form200bMamakacTemplate.fields.filter((f) => f.type === 'choice').length;
    const checkboxes = form200bMamakacTemplate.fields.filter((f) => f.type === 'boolean').length;
    const textFields = form200bMamakacTemplate.fields.filter((f) => f.type === 'text').length;
    const textareas = form200bMamakacTemplate.fields.filter((f) => f.type === 'textarea').length;
    const dateFields = form200bMamakacTemplate.fields.filter((f) => f.type === 'date').length;
    const decimalFields = form200bMamakacTemplate.fields.filter((f) => f.type === 'decimal').length;
    const integerFields = form200bMamakacTemplate.fields.filter((f) => f.type === 'integer').length;

    console.log('');
    console.log('Field breakdown:');
    console.log(`   Display/Headers: ${displayFields}`);
    console.log(`   Text inputs: ${textFields}`);
    console.log(`   Textareas: ${textareas}`);
    console.log(`   Dropdowns (choice): ${dropdowns}`);
    console.log(`   Checkboxes (boolean): ${checkboxes}`);
    console.log(`   Date fields: ${dateFields}`);
    console.log(`   Decimal fields: ${decimalFields}`);
    console.log(`   Integer fields: ${integerFields}`);
    console.log(`   TOTAL: ${form200bMamakacTemplate.fields.length}`);

    console.log('');
    console.log('Dropdown values used:');
    console.log('   Hereditary Diseases: 905 (No), 906 (Yes)');
    console.log('   Allergies: 907 (Present), 908 (Not present)');
    console.log('   Marital Status: 909 (Married), 910 (Not married)');
    console.log('   Libido: 911 (Decreased), 912 (Moderate), 913 (Increased)');

    console.log('');
    console.log('Done! Refresh your browser to see the updated form.');
  } catch (error: unknown) {
    console.error('');
    console.error('Error:', error instanceof Error ? error.message : error);
    if (error instanceof Error && 'response' in error) {
      console.error('Response:', (error as { response?: unknown }).response);
    }
    process.exit(1);
  }
}

/**
 * Convert FormTemplate to FHIR Questionnaire
 */
function templateToQuestionnaire(template: typeof form200bMamakacTemplate): Questionnaire {
  return {
    resourceType: 'Questionnaire',
    status: template.status === 'active' ? 'active' : 'draft',
    title: template.title,
    description: template.description,
    identifier: [
      {
        system: 'http://medimind.ge/questionnaires',
        value: template.id,
      },
    ],
    version: template.version,
    item: template.fields.map((field) => fieldToQuestionnaireItem(field)),
  };
}

/**
 * Convert FieldConfig to QuestionnaireItem
 */
function fieldToQuestionnaireItem(field: FieldConfig): QuestionnaireItem {
  const fhirType = mapFieldTypeToFhir(field.type);

  const item: QuestionnaireItem = {
    linkId: field.linkId,
    type: fhirType,
  };

  // Only set text if label is not empty (unlabeled fields like textareas)
  if (field.label && field.label.trim() !== '') {
    item.text = field.label;
  }

  // FHIR constraint que-6: display items can't have required
  if (fhirType !== 'display' && fhirType !== 'group') {
    item.required = field.required || false;
  }

  // Set readOnly if specified
  if (field.readOnly) {
    item.readOnly = true;
  }

  // Add answer options for choice fields
  if (field.type === 'choice' && field.options && field.options.length > 0) {
    item.answerOption = field.options.map((opt: FieldOption): QuestionnaireItemAnswerOption => ({
      valueCoding: {
        code: opt.value,
        display: opt.label,
        system: 'http://medimind.ge/dropdown-values',
      },
    }));
  }

  // Add default/initial value
  if (field.defaultValue !== undefined) {
    if (typeof field.defaultValue === 'string') {
      item.initial = [{ valueString: field.defaultValue }];
    } else if (typeof field.defaultValue === 'number') {
      item.initial = [{ valueInteger: Math.floor(field.defaultValue) }];
    } else if (typeof field.defaultValue === 'boolean') {
      item.initial = [{ valueBoolean: field.defaultValue }];
    }
  }

  // Add extensions for styling and other metadata
  const extensions: QuestionnaireItem['extension'] = [];

  // Add styling extension
  if (field.styling) {
    extensions.push({
      url: 'http://medimind.ge/fhir/extensions/field-styling',
      valueString: JSON.stringify(field.styling),
    });
  }

  // Add English text as extension
  if (field.text) {
    extensions.push({
      url: 'http://hl7.org/fhir/StructureDefinition/translation',
      extension: [
        { url: 'lang', valueCode: 'en' },
        { url: 'content', valueString: field.text },
      ],
    });
  }

  // Add patient binding extension
  if (field.patientBinding?.enabled) {
    extensions.push({
      url: 'http://medimind.ge/fhir/extensions/patient-binding',
      valueString: JSON.stringify(field.patientBinding),
    });
  }

  // Add order extension
  if (field.order !== undefined) {
    extensions.push({
      url: 'http://medimind.ge/fhir/extensions/field-order',
      valueInteger: field.order,
    });
  }

  // Add hasTextField extension for dropdowns with inline text fields
  if ((field as any).hasTextField === true) {
    extensions.push({
      url: 'http://medimind.ge/has-text-field',
      valueBoolean: true,
    });
  }

  // Add inlineFields extension for inline-row type
  if ((field as any).inlineFields) {
    extensions.push({
      url: 'http://medimind.ge/inline-fields',
      valueString: JSON.stringify((field as any).inlineFields),
    });
  }

  if (extensions.length > 0) {
    item.extension = extensions;
  }

  return item;
}

/**
 * Map template field type to FHIR Questionnaire item type
 */
function mapFieldTypeToFhir(type: string): QuestionnaireItem['type'] {
  const mapping: Record<string, QuestionnaireItem['type']> = {
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
    'inline-row': 'display', // Inline row uses display type with special extension for inline fields
    signature: 'string',
    attachment: 'attachment',
    display: 'display',
    group: 'group',
  };

  return mapping[type] || 'string';
}

main();
