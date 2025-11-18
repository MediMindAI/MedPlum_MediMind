#!/usr/bin/env tsx
/**
 * Simplified Medical Services Import (No Auth Required for Local Dev)
 *
 * This version uses direct HTTP requests to create resources without OAuth.
 * For production, use import-nomenclature.ts with proper authentication.
 *
 * Usage: npx tsx scripts/import-nomenclature-simple.ts
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// FHIR Extension URLs
const EXTENSION_URLS = {
  SERVICE_TYPE: 'http://medimind.ge/extensions/service-type',
  BASE_PRICE: 'http://medimind.ge/extensions/base-price',
  TOTAL_AMOUNT: 'http://medimind.ge/extensions/total-amount',
  CAL_HED: 'http://medimind.ge/extensions/cal-hed',
  CREATED_DATE: 'http://medimind.ge/extensions/created-date',
  TAGS: 'http://medimind.ge/extensions/tags',
  LIS_INTEGRATION: 'http://medimind.ge/extensions/lis-integration',
  LIS_PROVIDER: 'http://medimind.ge/extensions/lis-provider',
  EXTERNAL_ORDER_CODE: 'http://medimind.ge/extensions/external-order-code',
  GIS_CODE: 'http://medimind.ge/extensions/gis-code',
} as const;

const IDENTIFIER_SYSTEM = 'http://medimind.ge/nomenclature/service-code';

interface MedicalServiceRow {
  ID: string;
  კოდი: string;
  დასახელება: string;
  'სამედიცინო დასახელება': string;
  ჯგუფი: string;
  ტიპი: string;
  ფასი: string;
  ჯამი: string;
  'კალკულაციის დათვლა': string;
  'შექმნის თარიღი': string;
  ტეგები: string;
  'LIS ინტეგრაცია': string;
  'LIS პროვაიდერი': string;
  'გარე შეკვეთის კოდი': string;
  'GIS კოდი': string;
}

interface ImportStats {
  total: number;
  success: number;
  failed: number;
  skipped: number;
  errors: Array<{ row: number; code: string; error: string }>;
}

function parseExcelFile(filePath: string): MedicalServiceRow[] {
  console.log(`📖 Reading file: ${filePath}`);
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows: MedicalServiceRow[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  console.log(`✅ Found ${rows.length} rows\n`);
  return rows;
}

function validateRow(row: MedicalServiceRow, rowIndex: number): { valid: boolean; error?: string } {
  if (!row.კოდი || row.კოდი.trim() === '') {
    return { valid: false, error: 'Missing code (კოდი)' };
  }
  if (!row.დასახელება || row.დასახელება.trim() === '') {
    return { valid: false, error: 'Missing name (დასახელება)' };
  }
  if (!row.ჯგუფი || row.ჯგუფი.trim() === '') {
    return { valid: false, error: 'Missing group (ჯგუფი)' };
  }
  if (!row.ტიპი || row.ტიპი.trim() === '') {
    return { valid: false, error: 'Missing type (ტიპი)' };
  }
  return { valid: true };
}

function mapToActivityDefinition(row: MedicalServiceRow): any {
  const service: any = {
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
    service.extension.push({
      url: EXTENSION_URLS.SERVICE_TYPE,
      valueString: row.ტიპი.trim(),
    });
  }

  // Base price
  if (row.ფასი && row.ფასი !== '') {
    const price = parseFloat(row.ფასი);
    if (!isNaN(price)) {
      service.extension.push({
        url: EXTENSION_URLS.BASE_PRICE,
        valueMoney: {
          value: price,
          currency: 'GEL',
        },
      });
    }
  }

  // Total amount
  if (row.ჯამი && row.ჯამი !== '') {
    const total = parseFloat(row.ჯამი);
    if (!isNaN(total) && total > 0) {
      service.extension.push({
        url: EXTENSION_URLS.TOTAL_AMOUNT,
        valueMoney: {
          value: total,
          currency: 'GEL',
        },
      });
    }
  }

  // Calculation method
  if (row['კალკულაციის დათვლა']) {
    service.extension.push({
      url: EXTENSION_URLS.CAL_HED,
      valueString: row['კალკულაციის დათვლა'].trim(),
    });
  }

  // Created date
  if (row['შექმნის თარიღი']) {
    service.extension.push({
      url: EXTENSION_URLS.CREATED_DATE,
      valueString: row['შექმნის თარიღი'].trim(),
    });
  }

  // Tags
  if (row.ტეგები && row.ტეგები.trim() !== '') {
    service.extension.push({
      url: EXTENSION_URLS.TAGS,
      valueString: row.ტეგები.trim(),
    });
  }

  // LIS Integration
  if (row['LIS ინტეგრაცია'] !== undefined && row['LIS ინტეგრაცია'] !== '') {
    service.extension.push({
      url: EXTENSION_URLS.LIS_INTEGRATION,
      valueBoolean: row['LIS ინტეგრაცია'] === '1',
    });
  }

  // LIS Provider
  if (row['LIS პროვაიდერი'] && row['LIS პროვაიდერი'].trim() !== '') {
    service.extension.push({
      url: EXTENSION_URLS.LIS_PROVIDER,
      valueString: row['LIS პროვაიდერი'].trim(),
    });
  }

  // External Order Code
  if (row['გარე შეკვეთის კოდი'] && row['გარე შეკვეთის კოდი'].trim() !== '') {
    service.extension.push({
      url: EXTENSION_URLS.EXTERNAL_ORDER_CODE,
      valueString: row['გარე შეკვეთის კოდი'].trim(),
    });
  }

  // GIS Code
  if (row['GIS კოდი'] && row['GIS კოდი'].trim() !== '') {
    service.extension.push({
      url: EXTENSION_URLS.GIS_CODE,
      valueString: row['GIS კოდი'].trim(),
    });
  }

  return service;
}

async function createResource(baseUrl: string, resource: any): Promise<void> {
  const response = await fetch(`${baseUrl}/fhir/R4/ActivityDefinition`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/fhir+json',
    },
    body: JSON.stringify(resource),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }
}

async function importServices(baseUrl: string, rows: MedicalServiceRow[]): Promise<ImportStats> {
  const stats: ImportStats = {
    total: rows.length,
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  console.log(`🚀 Starting import of ${stats.total} services...\n`);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // +2 for header and 0-index

    try {
      // Validate
      const validation = validateRow(row, rowNum);
      if (!validation.valid) {
        stats.skipped++;
        stats.errors.push({
          row: rowNum,
          code: row.კოდი || 'N/A',
          error: validation.error || 'Validation error',
        });
        continue;
      }

      // Map and create
      const service = mapToActivityDefinition(row);
      await createResource(baseUrl, service);
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
      console.error(`❌ Row ${rowNum} [${row.კოდი}]: ${errorMessage}`);
    }

    // Small delay every 50 requests
    if ((i + 1) % 50 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return stats;
}

function printSummary(stats: ImportStats) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total rows:      ${stats.total}`);
  console.log(`✅ Success:      ${stats.success}`);
  console.log(`⚠️  Skipped:      ${stats.skipped}`);
  console.log(`❌ Failed:       ${stats.failed}`);
  console.log('='.repeat(60));

  if (stats.errors.length > 0 && stats.errors.length <= 20) {
    console.log('\n⚠️  ERRORS:');
    stats.errors.forEach((err) => {
      console.log(`  Row ${err.row} [${err.code}]: ${err.error}`);
    });
  } else if (stats.errors.length > 20) {
    console.log(`\n⚠️  ${stats.errors.length} errors occurred. First 10:`);
    stats.errors.slice(0, 10).forEach((err) => {
      console.log(`  Row ${err.row} [${err.code}]: ${err.error}`);
    });
  }

  console.log('\n');
}

async function main() {
  try {
    const XLSX_FILE_PATH = path.join(
      __dirname,
      '../documentation/xsl/სამედიცინო სერვისების ცხრილი.xlsx'
    );
    const BASE_URL = process.env.MEDPLUM_BASE_URL || 'http://localhost:8103';

    // Check file exists
    if (!fs.existsSync(XLSX_FILE_PATH)) {
      console.error(`❌ File not found: ${XLSX_FILE_PATH}`);
      console.error('💡 Run: npx tsx scripts/convert-numbers-to-xlsx.ts first');
      process.exit(1);
    }

    // Parse file
    const rows = parseExcelFile(XLSX_FILE_PATH);

    // Import services
    const stats = await importServices(BASE_URL, rows);

    // Print summary
    printSummary(stats);

    // Exit
    if (stats.failed > 0) {
      console.error('⚠️  Import completed with errors');
      process.exit(1);
    } else {
      console.log('✅ Import completed successfully!');
      console.log('📍 Next: Open http://localhost:3000/emr/nomenclature/medical-1 to view');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
