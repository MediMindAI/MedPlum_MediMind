#!/usr/bin/env npx tsx

// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @file Migration script for existing forms
 * @description Migrates existing Questionnaire resources to new schema format
 *
 * PLACEHOLDER: This script provides the structure for form migration.
 * Actual implementation depends on the specific schema changes needed.
 *
 * Usage:
 *   npx tsx scripts/migrations/migrate-existing-forms.ts --dry-run
 *   npx tsx scripts/migrations/migrate-existing-forms.ts --execute
 *
 * Environment:
 *   MEDPLUM_BASE_URL - Medplum server URL (default: http://localhost:8103)
 *   MEDPLUM_CLIENT_ID - OAuth client ID
 *   MEDPLUM_CLIENT_SECRET - OAuth client secret
 *   OR
 *   MEDPLUM_TOKEN - Bearer token for authentication
 */

import { MedplumClient } from '@medplum/core';
import type { Questionnaire, Bundle } from '@medplum/fhirtypes';

// ============================================================================
// Configuration
// ============================================================================

interface MigrationConfig {
  /** Run without making changes */
  dryRun: boolean;
  /** Batch size for processing */
  batchSize: number;
  /** Log verbose output */
  verbose: boolean;
  /** Medplum base URL */
  baseUrl: string;
}

const DEFAULT_CONFIG: MigrationConfig = {
  dryRun: true,
  batchSize: 50,
  verbose: true,
  baseUrl: process.env.MEDPLUM_BASE_URL || 'http://localhost:8103',
};

// ============================================================================
// Migration Results
// ============================================================================

interface MigrationResult {
  /** Total questionnaires processed */
  total: number;
  /** Successfully migrated */
  migrated: number;
  /** Skipped (already up to date) */
  skipped: number;
  /** Failed migrations */
  failed: number;
  /** Error details */
  errors: Array<{ id: string; error: string }>;
  /** Timestamp */
  timestamp: string;
  /** Duration in ms */
  durationMs: number;
}

// ============================================================================
// Schema Version Constants
// ============================================================================

/**
 * Schema version extension URL
 */
const SCHEMA_VERSION_URL = 'http://medimind.ge/fhir/StructureDefinition/schema-version';

/**
 * Current schema version
 */
const CURRENT_SCHEMA_VERSION = '2.0';

/**
 * Minimum version that needs migration
 */
const MINIMUM_VERSION = '1.0';

// ============================================================================
// Migration Functions
// ============================================================================

/**
 * Get schema version from Questionnaire
 */
function getSchemaVersion(questionnaire: Questionnaire): string {
  const extension = questionnaire.extension?.find((ext) => ext.url === SCHEMA_VERSION_URL);
  return extension?.valueString || '1.0';
}

/**
 * Check if questionnaire needs migration
 */
function needsMigration(questionnaire: Questionnaire): boolean {
  const version = getSchemaVersion(questionnaire);
  return version < CURRENT_SCHEMA_VERSION;
}

/**
 * Migrate a single Questionnaire to new schema
 *
 * PLACEHOLDER: Implement actual migration logic here
 */
function migrateQuestionnaire(questionnaire: Questionnaire): Questionnaire {
  // Clone the questionnaire
  const migrated: Questionnaire = JSON.parse(JSON.stringify(questionnaire));

  // ========================================================================
  // Migration T166: Add new required extensions
  // ========================================================================

  // Initialize extension array if needed
  if (!migrated.extension) {
    migrated.extension = [];
  }

  // Add or update schema version
  const versionExtIdx = migrated.extension.findIndex((ext) => ext.url === SCHEMA_VERSION_URL);
  if (versionExtIdx >= 0) {
    migrated.extension[versionExtIdx].valueString = CURRENT_SCHEMA_VERSION;
  } else {
    migrated.extension.push({
      url: SCHEMA_VERSION_URL,
      valueString: CURRENT_SCHEMA_VERSION,
    });
  }

  // ========================================================================
  // Migration T166: Add category tag if missing
  // ========================================================================

  if (!migrated.meta) {
    migrated.meta = {};
  }
  if (!migrated.meta.tag) {
    migrated.meta.tag = [];
  }

  const hasCategoryTag = migrated.meta.tag.some(
    (tag) => tag.system === 'http://medimind.ge/form-category'
  );

  if (!hasCategoryTag) {
    migrated.meta.tag.push({
      system: 'http://medimind.ge/form-category',
      code: 'general',
      display: 'General Form',
    });
  }

  // ========================================================================
  // Migration T167: Update item structure
  // ========================================================================

  if (migrated.item) {
    migrated.item = migrateItems(migrated.item);
  }

  return migrated;
}

/**
 * Migrate questionnaire items recursively
 */
function migrateItems(
  items: Questionnaire['item']
): Questionnaire['item'] {
  if (!items) return items;

  return items.map((item) => {
    const migratedItem = { ...item };

    // Ensure linkId follows new naming convention
    if (migratedItem.linkId && !migratedItem.linkId.includes('-')) {
      // Legacy linkIds might be simple strings, prefix with "field-"
      // migratedItem.linkId = `field-${migratedItem.linkId}`;
      // Note: Commented out as this would break existing responses
    }

    // Add extension for field metadata if missing
    if (!migratedItem.extension) {
      migratedItem.extension = [];
    }

    // Ensure required fields have proper metadata
    if (migratedItem.required && !migratedItem.extension.some((e) => e.url?.includes('validation'))) {
      migratedItem.extension.push({
        url: 'http://medimind.ge/fhir/StructureDefinition/field-validation',
        valueCode: 'required',
      });
    }

    // Recursively migrate nested items
    if (migratedItem.item) {
      migratedItem.item = migrateItems(migratedItem.item);
    }

    return migratedItem;
  });
}

/**
 * Validate migrated questionnaire
 */
function validateMigration(original: Questionnaire, migrated: Questionnaire): boolean {
  // Check schema version was updated
  if (getSchemaVersion(migrated) !== CURRENT_SCHEMA_VERSION) {
    return false;
  }

  // Check item count is preserved
  const originalCount = countItems(original.item);
  const migratedCount = countItems(migrated.item);
  if (originalCount !== migratedCount) {
    return false;
  }

  // Check required fields are preserved
  const originalRequired = countRequiredFields(original.item);
  const migratedRequired = countRequiredFields(migrated.item);
  if (originalRequired !== migratedRequired) {
    return false;
  }

  return true;
}

/**
 * Count total items recursively
 */
function countItems(items?: Questionnaire['item']): number {
  if (!items) return 0;
  return items.reduce((count, item) => {
    return count + 1 + countItems(item.item);
  }, 0);
}

/**
 * Count required fields recursively
 */
function countRequiredFields(items?: Questionnaire['item']): number {
  if (!items) return 0;
  return items.reduce((count, item) => {
    const isRequired = item.required ? 1 : 0;
    return count + isRequired + countRequiredFields(item.item);
  }, 0);
}

// ============================================================================
// Main Migration Script
// ============================================================================

async function runMigration(config: MigrationConfig): Promise<MigrationResult> {
  const startTime = Date.now();
  const result: MigrationResult = {
    total: 0,
    migrated: 0,
    skipped: 0,
    failed: 0,
    errors: [],
    timestamp: new Date().toISOString(),
    durationMs: 0,
  };

  console.log('='.repeat(60));
  console.log('FHIR Form Builder - Migration Script');
  console.log('='.repeat(60));
  console.log(`Mode: ${config.dryRun ? 'DRY RUN (no changes)' : 'EXECUTE'}`);
  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`Batch Size: ${config.batchSize}`);
  console.log('');

  // PLACEHOLDER: Initialize Medplum client
  // In actual implementation, would authenticate and connect
  console.log('PLACEHOLDER: Medplum client initialization would happen here');
  console.log('');

  // PLACEHOLDER: Fetch questionnaires
  console.log('Fetching questionnaires...');
  const mockQuestionnaires: Questionnaire[] = [
    {
      resourceType: 'Questionnaire',
      id: 'example-1',
      status: 'active',
      title: 'Example Form 1',
      item: [
        { linkId: 'q1', type: 'string', text: 'Question 1' },
        { linkId: 'q2', type: 'boolean', text: 'Question 2', required: true },
      ],
    },
    {
      resourceType: 'Questionnaire',
      id: 'example-2',
      status: 'draft',
      title: 'Example Form 2',
      extension: [
        { url: SCHEMA_VERSION_URL, valueString: '2.0' },
      ],
      item: [
        { linkId: 'field-1', type: 'date', text: 'Date Field' },
      ],
    },
  ];

  console.log(`Found ${mockQuestionnaires.length} questionnaires`);
  console.log('');

  // Process each questionnaire
  for (const questionnaire of mockQuestionnaires) {
    result.total++;

    if (config.verbose) {
      console.log(`Processing: ${questionnaire.id} - ${questionnaire.title}`);
    }

    try {
      // Check if migration is needed
      if (!needsMigration(questionnaire)) {
        result.skipped++;
        if (config.verbose) {
          console.log(`  Skipped: Already at version ${CURRENT_SCHEMA_VERSION}`);
        }
        continue;
      }

      // Perform migration
      const migrated = migrateQuestionnaire(questionnaire);

      // Validate migration
      if (!validateMigration(questionnaire, migrated)) {
        throw new Error('Migration validation failed');
      }

      if (config.dryRun) {
        console.log(`  Would migrate: ${questionnaire.id}`);
        console.log(`    Before: v${getSchemaVersion(questionnaire)}`);
        console.log(`    After:  v${getSchemaVersion(migrated)}`);
        result.migrated++;
      } else {
        // PLACEHOLDER: Save migrated questionnaire
        // await medplum.updateResource(migrated);
        console.log(`  Migrated: ${questionnaire.id}`);
        result.migrated++;
      }
    } catch (error) {
      result.failed++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push({
        id: questionnaire.id || 'unknown',
        error: errorMessage,
      });
      console.error(`  Failed: ${errorMessage}`);
    }
  }

  result.durationMs = Date.now() - startTime;

  // Print summary
  console.log('');
  console.log('='.repeat(60));
  console.log('Migration Summary');
  console.log('='.repeat(60));
  console.log(`Total:    ${result.total}`);
  console.log(`Migrated: ${result.migrated}`);
  console.log(`Skipped:  ${result.skipped}`);
  console.log(`Failed:   ${result.failed}`);
  console.log(`Duration: ${result.durationMs}ms`);
  console.log('');

  if (result.errors.length > 0) {
    console.log('Errors:');
    for (const err of result.errors) {
      console.log(`  - ${err.id}: ${err.error}`);
    }
  }

  return result;
}

// ============================================================================
// CLI Entry Point
// ============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  const config: MigrationConfig = {
    ...DEFAULT_CONFIG,
    dryRun: !args.includes('--execute'),
    verbose: args.includes('--verbose') || args.includes('-v'),
  };

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
FHIR Form Builder Migration Script

Usage:
  npx tsx scripts/migrations/migrate-existing-forms.ts [options]

Options:
  --dry-run     Run without making changes (default)
  --execute     Actually perform the migration
  --verbose     Show detailed output
  --help        Show this help message

Environment Variables:
  MEDPLUM_BASE_URL       Medplum server URL
  MEDPLUM_TOKEN          Bearer token for authentication
  MEDPLUM_CLIENT_ID      OAuth client ID
  MEDPLUM_CLIENT_SECRET  OAuth client secret
`);
    process.exit(0);
  }

  try {
    const result = await runMigration(config);

    if (result.failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
main();
