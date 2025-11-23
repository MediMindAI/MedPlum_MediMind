#!/usr/bin/env tsx
/**
 * Delete and Recreate Form 100
 *
 * This script deletes the existing Form 100 questionnaire and creates
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
 *   npx tsx scripts/recreate-form-100.ts
 *
 * Or pass token as argument:
 *   npx tsx scripts/recreate-form-100.ts "your-access-token-here"
 */

import { MedplumClient } from '@medplum/core';
import type { Questionnaire, QuestionnaireItem } from '@medplum/fhirtypes';
import {
  form100Template,
  FORM_100_ID,
} from '../packages/app/src/emr/data/form-templates/form-100-template';

const MEDPLUM_BASE_URL = 'http://localhost:8103';

async function main() {
  // Get token from environment or argument
  const token = process.argv[2] || process.env.MEDPLUM_TOKEN;

  if (!token) {
    console.error('❌ No access token provided!');
    console.error('');
    console.error('Usage:');
    console.error('  export MEDPLUM_TOKEN="your-access-token"');
    console.error('  npx tsx scripts/recreate-form-100.ts');
    console.error('');
    console.error('Or:');
    console.error('  npx tsx scripts/recreate-form-100.ts "your-access-token"');
    process.exit(1);
  }

  console.log('🔄 Recreating Form 100...');
  console.log(`📍 Server: ${MEDPLUM_BASE_URL}`);
  console.log('');

  // Create Medplum client with token
  const medplum = new MedplumClient({
    baseUrl: MEDPLUM_BASE_URL,
    fetch: fetch,
  });
  medplum.setAccessToken(token);

  try {
    // Step 1: Find existing Form 100
    console.log('🔍 Searching for existing Form 100...');
    const searchResult = await medplum.searchResources('Questionnaire', {
      _count: '100',
    });

    // Find Form 100 by title or identifier
    const existingForm100 = searchResult.find(
      (q) =>
        q.title === form100Template.title ||
        q.identifier?.some((id) => id.value === FORM_100_ID)
    );

    if (existingForm100) {
      console.log(`✅ Found existing Form 100: ${existingForm100.id}`);
      console.log(`   Title: ${existingForm100.title}`);
      console.log(`   Items: ${existingForm100.item?.length || 0}`);

      // Step 2: Delete existing Form 100
      console.log('');
      console.log('🗑️  Deleting existing Form 100...');
      await medplum.deleteResource('Questionnaire', existingForm100.id!);
      console.log('✅ Deleted successfully');
    } else {
      console.log('ℹ️  No existing Form 100 found, will create new one');
    }

    // Step 3: Create new Form 100 from template
    console.log('');
    console.log('📝 Creating new Form 100 from updated template...');

    // Convert template to FHIR Questionnaire
    const questionnaire = templateToQuestionnaire(form100Template);

    const created = await medplum.createResource(questionnaire);

    console.log('');
    console.log('✅ Form 100 recreated successfully!');
    console.log(`   ID: ${created.id}`);
    console.log(`   Title: ${created.title}`);
    console.log(`   Items: ${created.item?.length || 0}`);
    console.log(`   Status: ${created.status}`);

    // List first few items for verification
    console.log('');
    console.log('📋 First 5 fields:');
    created.item?.slice(0, 5).forEach((item, i) => {
      console.log(`   ${i + 1}. [${item.type}] ${item.text?.substring(0, 60)}...`);
    });

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
function templateToQuestionnaire(template: typeof form100Template): Questionnaire {
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
function fieldToQuestionnaireItem(field: (typeof form100Template.fields)[0]): QuestionnaireItem {
  const fhirType = mapFieldTypeToFhir(field.type);

  const item: QuestionnaireItem = {
    linkId: field.linkId,
    text: field.label, // Use Georgian label as primary text
    type: fhirType,
  };

  // FHIR constraint que-6: display items can't have required
  if (fhirType !== 'display') {
    item.required = field.required || false;
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

  // Add initial value extension (for pre-filled fields like field-2)
  if (field.extensions) {
    for (const ext of field.extensions) {
      if (ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-initialExpression') {
        // Convert to initial value
        item.initial = [{ valueString: ext.valueString }];
      } else if (ext.url === 'http://medimind.ge/fhir/extensions/field-note') {
        extensions.push({
          url: ext.url,
          valueString: ext.valueString,
        });
      }
    }
  }

  // Add order extension
  extensions.push({
    url: 'http://medimind.ge/fhir/extensions/field-order',
    valueInteger: field.order,
  });

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
