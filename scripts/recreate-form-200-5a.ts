#!/usr/bin/env tsx
/**
 * Delete and Recreate Form 200-5/a (Patient Examination Form)
 *
 * This script deletes the existing Form 200-5/a questionnaire and creates
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
 *   npx tsx scripts/recreate-form-200-5a.ts
 *
 * Or pass token as argument:
 *   npx tsx scripts/recreate-form-200-5a.ts "your-access-token-here"
 */

import { MedplumClient } from '@medplum/core';
import type { Questionnaire, QuestionnaireItem, QuestionnaireItemAnswerOption } from '@medplum/fhirtypes';
import {
  form200_5aTemplate,
  FORM_200_5A_ID,
} from '../packages/app/src/emr/data/form-templates/form-200-5a-template';
import type { FieldConfig, FieldOption } from '../packages/app/src/emr/types/form-builder';

const MEDPLUM_BASE_URL = 'http://localhost:8103';

async function main() {
  // Get token from environment or argument
  const token = process.argv[2] || process.env.MEDPLUM_TOKEN;

  if (!token) {
    console.error('❌ No access token provided!');
    console.error('');
    console.error('Usage:');
    console.error('  export MEDPLUM_TOKEN="your-access-token"');
    console.error('  npx tsx scripts/recreate-form-200-5a.ts');
    console.error('');
    console.error('Or:');
    console.error('  npx tsx scripts/recreate-form-200-5a.ts "your-access-token"');
    process.exit(1);
  }

  console.log('🔄 Recreating Form 200-5/a (Patient Examination Form)...');
  console.log(`📍 Server: ${MEDPLUM_BASE_URL}`);
  console.log('');

  // Create Medplum client with token
  const medplum = new MedplumClient({
    baseUrl: MEDPLUM_BASE_URL,
    fetch: fetch,
  });
  medplum.setAccessToken(token);

  try {
    // Step 1: Find existing Form 200-5/a
    console.log('🔍 Searching for existing Form 200-5/a...');
    const searchResult = await medplum.searchResources('Questionnaire', {
      _count: '100',
    });

    // Find Form 200-5/a by title or identifier
    const existingForm = searchResult.find(
      (q) =>
        q.title === form200_5aTemplate.title ||
        q.title?.includes('IV-200-5') ||
        q.title?.includes('პაციენტის გასინჯვის') ||
        q.identifier?.some((id) => id.value === FORM_200_5A_ID)
    );

    if (existingForm) {
      console.log(`✅ Found existing Form 200-5/a: ${existingForm.id}`);
      console.log(`   Title: ${existingForm.title}`);
      console.log(`   Items: ${existingForm.item?.length || 0}`);

      // Step 2: Delete existing Form
      console.log('');
      console.log('🗑️  Deleting existing Form 200-5/a...');
      await medplum.deleteResource('Questionnaire', existingForm.id!);
      console.log('✅ Deleted successfully');
    } else {
      console.log('ℹ️  No existing Form 200-5/a found, will create new one');
    }

    // Step 3: Create new Form from template
    console.log('');
    console.log('📝 Creating new Form 200-5/a from template...');
    console.log(`   Total fields: ${form200_5aTemplate.fields.length}`);

    // Convert template to FHIR Questionnaire
    const questionnaire = templateToQuestionnaire(form200_5aTemplate);

    const created = await medplum.createResource(questionnaire);

    console.log('');
    console.log('✅ Form 200-5/a created successfully!');
    console.log(`   ID: ${created.id}`);
    console.log(`   Title: ${created.title}`);
    console.log(`   Items: ${created.item?.length || 0}`);
    console.log(`   Status: ${created.status}`);

    // Count field types
    const sections = form200_5aTemplate.fields.filter((f) => f.type === 'group').length;
    const dropdowns = form200_5aTemplate.fields.filter((f) => f.type === 'choice').length;
    const checkboxes = form200_5aTemplate.fields.filter((f) => f.type === 'boolean').length;
    const textFields = form200_5aTemplate.fields.filter((f) => ['text', 'textarea'].includes(f.type)).length;

    console.log('');
    console.log('📊 Field breakdown:');
    console.log(`   Sections: ${sections}`);
    console.log(`   Dropdowns: ${dropdowns}`);
    console.log(`   Checkboxes: ${checkboxes}`);
    console.log(`   Text fields: ${textFields}`);

    console.log('');
    console.log('🎉 Done! Refresh your browser to see the updated form.');
  } catch (error: unknown) {
    console.error('');
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    if (error instanceof Error && 'response' in error) {
      console.error('Response:', (error as { response?: unknown }).response);
    }
    process.exit(1);
  }
}

/**
 * Convert FormTemplate to FHIR Questionnaire
 */
function templateToQuestionnaire(template: typeof form200_5aTemplate): Questionnaire {
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

  // Add answer options for choice and checkbox-group fields
  if ((field.type === 'choice' || field.type === 'checkbox-group') && field.options && field.options.length > 0) {
    item.answerOption = field.options.map((opt: FieldOption): QuestionnaireItemAnswerOption => ({
      valueCoding: {
        code: opt.value,
        display: opt.label,
        system: 'http://medimind.ge/dropdown-values',
      },
    }));

    // For checkbox-group, allow multiple selections
    if (field.type === 'checkbox-group') {
      item.repeats = true;
    }
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

  // Add hasTextField extension for checkbox-group fields
  if (field.hasTextField) {
    extensions.push({
      url: 'http://medimind.ge/has-text-field',
      valueBoolean: true,
    });
  }

  // Add initial value extension (for pre-filled fields)
  if (field.extensions) {
    for (const ext of field.extensions) {
      if (ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-initialExpression') {
        // Convert to initial value
        item.initial = [{ valueString: (ext as { valueString?: string }).valueString }];
      } else if (ext.url === 'http://medimind.ge/fhir/extensions/field-note') {
        extensions.push({
          url: ext.url,
          valueString: (ext as { valueString?: string }).valueString,
        });
      }
    }
  }

  // Add order extension
  if (field.order !== undefined) {
    extensions.push({
      url: 'http://medimind.ge/fhir/extensions/field-order',
      valueInteger: field.order,
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
    signature: 'string',
    attachment: 'attachment',
    display: 'display',
    group: 'group',
  };

  return mapping[type] || 'string';
}

main();
