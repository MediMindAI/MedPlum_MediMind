#!/usr/bin/env tsx
/**
 * Medical Services Nomenclature Import Script
 *
 * Parses Apple Numbers file and imports medical services into FHIR ActivityDefinition resources.
 *
 * Usage:
 *   npx tsx scripts/import-nomenclature.ts
 *
 * Environment variables required:
 *   MEDPLUM_BASE_URL - Medplum server URL (default: http://localhost:8103)
 *   MEDPLUM_CLIENT_ID - Client application ID
 *   MEDPLUM_CLIENT_SECRET - Client secret
 */

import { MedplumClient } from '@medplum/core';
import type { ActivityDefinition } from '@medplum/fhirtypes';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// FHIR Extension URLs (matching nomenclature system)
const EXTENSION_URLS = {
  SUBGROUP: 'http://medimind.ge/extensions/service-subgroup',
  SERVICE_TYPE: 'http://medimind.ge/extensions/service-type',
  SERVICE_CATEGORY: 'http://medimind.ge/extensions/service-category',
  BASE_PRICE: 'http://medimind.ge/extensions/base-price',
  TOTAL_AMOUNT: 'http://medimind.ge/extensions/total-amount',
  CAL_HED: 'http://medimind.ge/extensions/cal-hed',
  PRINTABLE: 'http://medimind.ge/extensions/printable',
  ITEM_GET_PRICE: 'http://medimind.ge/extensions/item-get-price',
  LIS_INTEGRATION: 'http://medimind.ge/extensions/lis-integration',
  LIS_PROVIDER: 'http://medimind.ge/extensions/lis-provider',
  EXTERNAL_ORDER_CODE: 'http://medimind.ge/extensions/external-order-code',
  GIS_CODE: 'http://medimind.ge/extensions/gis-code',
  CREATED_DATE: 'http://medimind.ge/extensions/created-date',
  TAGS: 'http://medimind.ge/extensions/tags',
} as const;

const IDENTIFIER_SYSTEM = 'http://medimind.ge/nomenclature/service-code';

// Interface matching the Excel/Numbers file structure
interface MedicalServiceRow {
  ID: number;
  კოდი: string; // Code
  დასახელება: string; // Name
  'სამედიცინო დასახელება': string; // Medical Name
  ჯგუფი: string; // Group
  ტიპი: string; // Type
  ფასი: number; // Price
  ჯამი: number; // Total
  'კალკულაციის დათვლა': string; // Calculation
  'შექმნის თარიღი': string; // Created Date
  ტეგები: string; // Tags
  'LIS ინტეგრაცია': number; // LIS Integration (0 or 1)
  'LIS პროვაიდერი': string; // LIS Provider
  'გარე შეკვეთის კოდი': string; // External Order Code
  'GIS კოდი': string; // GIS Code
}

// Statistics tracking
interface ImportStats {
  total: number;
  success: number;
  failed: number;
  skipped: number;
  errors: Array<{ row: number; code: string; error: string }>;
}

/**
 * Parse Apple Numbers file (.numbers is a ZIP archive)
 */
function parseNumbersFile(filePath: string): MedicalServiceRow[] {
  console.log(`📖 Reading file: ${filePath}`);

  // Apple Numbers files are ZIP archives containing Index.zip
  // For simplicity, we'll ask the user to export to CSV or XLSX first
  // But xlsx library can handle .numbers files if they're exported as .xlsx

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON with headers
  const rows: MedicalServiceRow[] = XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
    raw: false, // Get formatted text values
  });

  console.log(`✅ Found ${rows.length} rows in spreadsheet`);
  return rows;
}

/**
 * Validate a single service row
 */
function validateRow(row: MedicalServiceRow, rowIndex: number): { valid: boolean; error?: string } {
  // Required fields
  if (!row.კოდი || row.კოდი.trim() === '') {
    return { valid: false, error: 'Missing service code (კოდი)' };
  }

  if (!row.დასახელება || row.დასახელება.trim() === '') {
    return { valid: false, error: 'Missing service name (დასახელება)' };
  }

  if (!row.ჯგუფი || row.ჯგუფი.trim() === '') {
    return { valid: false, error: 'Missing service group (ჯგუფი)' };
  }

  if (!row.ტიპი || row.ტიპი.trim() === '') {
    return { valid: false, error: 'Missing service type (ტიპი)' };
  }

  // Validate price if present
  if (row.ფასი !== undefined && row.ფასი !== null && isNaN(Number(row.ფასი))) {
    return { valid: false, error: 'Invalid price (ფასი) - must be a number' };
  }

  return { valid: true };
}

/**
 * Map Excel row to FHIR ActivityDefinition
 */
function mapToActivityDefinition(row: MedicalServiceRow): ActivityDefinition {
  const service: ActivityDefinition = {
    resourceType: 'ActivityDefinition',
    status: 'active',
    identifier: [
      {
        system: IDENTIFIER_SYSTEM,
        value: row.კოდი.trim(),
      },
    ],
    title: row.დასახელება.trim(),
    description: row['სამედიცინო დასახელება']?.trim() || undefined,
    topic: [
      {
        text: row.ჯგუფი.trim(),
      },
    ],
    extension: [],
  };

  // Service type
  if (row.ტიპი) {
    service.extension?.push({
      url: EXTENSION_URLS.SERVICE_TYPE,
      valueString: row.ტიპი.trim(),
    });
  }

  // Base price
  if (row.ფასი !== undefined && row.ფასი !== null && row.ფასი !== '') {
    const price = Number(row.ფასი);
    if (!isNaN(price)) {
      service.extension?.push({
        url: EXTENSION_URLS.BASE_PRICE,
        valueMoney: {
          value: price,
          currency: 'GEL',
        },
      });
    }
  }

  // Total amount
  if (row.ჯამი !== undefined && row.ჯამი !== null && row.ჯამი !== '') {
    const total = Number(row.ჯამი);
    if (!isNaN(total) && total > 0) {
      service.extension?.push({
        url: EXTENSION_URLS.TOTAL_AMOUNT,
        valueMoney: {
          value: total,
          currency: 'GEL',
        },
      });
    }
  }

  // Calculable flag (დათვლადი/არა დათვლადი)
  if (row['კალკულაციის დათვლა']) {
    service.extension?.push({
      url: EXTENSION_URLS.CAL_HED,
      valueString: row['კალკულაციის დათვლა'].trim(),
    });
  }

  // Created date
  if (row['შექმნის თარიღი']) {
    service.extension?.push({
      url: EXTENSION_URLS.CREATED_DATE,
      valueString: row['შექმნის თარიღი'].trim(),
    });
  }

  // Tags
  if (row.ტეგები && row.ტეგები.trim() !== '') {
    service.extension?.push({
      url: EXTENSION_URLS.TAGS,
      valueString: row.ტეგები.trim(),
    });
  }

  // LIS Integration
  if (row['LIS ინტეგრაცია'] !== undefined && row['LIS ინტეგრაცია'] !== null) {
    service.extension?.push({
      url: EXTENSION_URLS.LIS_INTEGRATION,
      valueBoolean: Number(row['LIS ინტეგრაცია']) === 1,
    });
  }

  // LIS Provider
  if (row['LIS პროვაიდერი'] && row['LIS პროვაიდერი'].trim() !== '') {
    service.extension?.push({
      url: EXTENSION_URLS.LIS_PROVIDER,
      valueString: row['LIS პროვაიდერი'].trim(),
    });
  }

  // External Order Code
  if (row['გარე შეკვეთის კოდი'] && row['გარე შეკვეთის კოდი'].trim() !== '') {
    service.extension?.push({
      url: EXTENSION_URLS.EXTERNAL_ORDER_CODE,
      valueString: row['გარე შეკვეთის კოდი'].trim(),
    });
  }

  // GIS Code
  if (row['GIS კოდი'] && row['GIS კოდი'].trim() !== '') {
    service.extension?.push({
      url: EXTENSION_URLS.GIS_CODE,
      valueString: row['GIS კოდი'].trim(),
    });
  }

  return service;
}

/**
 * Import services in batches
 */
async function importServices(
  medplum: MedplumClient,
  rows: MedicalServiceRow[],
  batchSize: number = 100
): Promise<ImportStats> {
  const stats: ImportStats = {
    total: rows.length,
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  console.log(`\n🚀 Starting import of ${stats.total} services...`);
  console.log(`📦 Batch size: ${batchSize}\n`);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // +2 because row 1 is header, and array is 0-indexed

    try {
      // Validate row
      const validation = validateRow(row, rowNum);
      if (!validation.valid) {
        stats.skipped++;
        stats.errors.push({
          row: rowNum,
          code: row.კოდი || 'N/A',
          error: validation.error || 'Unknown validation error',
        });
        console.log(`⚠️  Row ${rowNum}: Skipped - ${validation.error}`);
        continue;
      }

      // Map to FHIR ActivityDefinition
      const service = mapToActivityDefinition(row);

      // Create resource
      await medplum.createResource(service);
      stats.success++;

      // Progress logging
      if (stats.success % 100 === 0) {
        console.log(`✅ Imported ${stats.success}/${stats.total} services...`);
      }
    } catch (error) {
      stats.failed++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      stats.errors.push({
        row: rowNum,
        code: row.კოდი || 'N/A',
        error: errorMessage,
      });
      console.error(`❌ Row ${rowNum}: Failed - ${errorMessage}`);
    }

    // Small delay every 100 requests to avoid overwhelming the server
    if ((i + 1) % 100 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return stats;
}

/**
 * Print import summary
 */
function printSummary(stats: ImportStats) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total rows:      ${stats.total}`);
  console.log(`✅ Success:      ${stats.success}`);
  console.log(`⚠️  Skipped:      ${stats.skipped}`);
  console.log(`❌ Failed:       ${stats.failed}`);
  console.log('='.repeat(60));

  if (stats.errors.length > 0) {
    console.log('\n⚠️  ERRORS:');
    stats.errors.slice(0, 10).forEach((err) => {
      console.log(`  Row ${err.row} [${err.code}]: ${err.error}`);
    });
    if (stats.errors.length > 10) {
      console.log(`  ... and ${stats.errors.length - 10} more errors`);
    }
  }

  console.log('\n');
}

/**
 * Save error log to file
 */
function saveErrorLog(stats: ImportStats, outputPath: string) {
  if (stats.errors.length === 0) {
    return;
  }

  const errorReport = {
    timestamp: new Date().toISOString(),
    summary: {
      total: stats.total,
      success: stats.success,
      failed: stats.failed,
      skipped: stats.skipped,
    },
    errors: stats.errors,
  };

  fs.writeFileSync(outputPath, JSON.stringify(errorReport, null, 2), 'utf-8');
  console.log(`📄 Error log saved to: ${outputPath}`);
}

/**
 * Main import function
 */
async function main() {
  try {
    // Configuration
    const XLSX_FILE_PATH = path.join(
      __dirname,
      '../documentation/xsl/სამედიცინო სერვისების ცხრილი.xlsx'
    );
    const ERROR_LOG_PATH = path.join(__dirname, '../logs/nomenclature-import-errors.json');

    // Check if file exists
    if (!fs.existsSync(XLSX_FILE_PATH)) {
      console.error(`❌ File not found: ${XLSX_FILE_PATH}`);
      console.error('\n💡 Run: npx tsx scripts/convert-numbers-to-xlsx.ts first');
      process.exit(1);
    }

    // Initialize Medplum client
    const baseUrl = process.env.MEDPLUM_BASE_URL || 'http://localhost:8103';
    const clientId = process.env.MEDPLUM_CLIENT_ID;
    const clientSecret = process.env.MEDPLUM_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('❌ Missing required environment variables:');
      console.error('   MEDPLUM_CLIENT_ID');
      console.error('   MEDPLUM_CLIENT_SECRET');
      console.error('\n💡 Set these in your .env file or export them before running this script.');
      process.exit(1);
    }

    console.log('🔧 Initializing Medplum client...');
    console.log(`   Base URL: ${baseUrl}`);

    const medplum = new MedplumClient({ baseUrl });
    await medplum.startClientLogin(clientId, clientSecret);

    console.log('✅ Authenticated successfully!\n');

    // Parse file
    const rows = parseNumbersFile(XLSX_FILE_PATH);

    // Import services
    const stats = await importServices(medplum, rows);

    // Print summary
    printSummary(stats);

    // Save error log if there are errors
    if (stats.errors.length > 0) {
      const logDir = path.dirname(ERROR_LOG_PATH);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      saveErrorLog(stats, ERROR_LOG_PATH);
    }

    // Exit with appropriate code
    if (stats.failed > 0) {
      console.error('⚠️  Import completed with errors');
      process.exit(1);
    } else {
      console.log('✅ Import completed successfully!');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Fatal error during import:');
    console.error(error);
    process.exit(1);
  }
}

// Run the script
main();
