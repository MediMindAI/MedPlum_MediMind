#!/usr/bin/env tsx
/**
 * Research Components Import with Browser Token
 *
 * This script imports laboratory test parameters from Excel into FHIR ObservationDefinition resources.
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
 *   npx tsx scripts/import-research-components.ts
 *
 * Or pass token as argument:
 *   npx tsx scripts/import-research-components.ts "your-access-token-here"
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// FHIR Extension URLs
const EXTENSION_URLS = {
  SERVICE_TYPE: 'http://medimind.ge/fhir/StructureDefinition/service-type',
  DEPARTMENT: 'http://medimind.ge/fhir/StructureDefinition/department',
  STATUS: 'http://medimind.ge/fhir/StructureDefinition/component-status',
} as const;

const IDENTIFIER_SYSTEMS = {
  COMPONENT_CODE: 'http://medimind.ge/lab/component-code',
  GIS_CODE: 'http://medimind.ge/lab/gis-code',
} as const;

interface ResearchComponentRow {
  კოდი: string; // Code
  'GIS კოდი': string; // GIS Code (with semicolon prefix)
  დასახელება: string; // Name/Description
  ტიპი: string; // Type (Georgian: შიდა, ხომასურიძე, თოდუა)
  ზომა: string; // Unit of measurement
  ფილიალი: string; // Department (თბილისი)
  სტატუსი: string; // Status (აქტიური)
}

interface ImportStats {
  total: number;
  success: number;
  failed: number;
  skipped: number;
  errors: Array<{ row: number; code: string; error: string }>;
}

// Georgian to English type mapping (CRITICAL)
const TYPE_MAPPING: Record<string, string> = {
  შიდა: 'internal',
  ხომასურიძე: 'khomasuridze',
  თოდუა: 'todua',
};

// Georgian to English status mapping
const STATUS_MAPPING: Record<string, string> = {
  აქტიური: 'active',
  არააქტიური: 'retired',
};

function parseExcelFile(filePath: string): ResearchComponentRow[] {
  console.log(`📖 Reading file: ${filePath}`);
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows: ResearchComponentRow[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  console.log(`✅ Found ${rows.length} rows\n`);
  return rows;
}

function validateRow(row: ResearchComponentRow, rowIndex: number): { valid: boolean; error?: string } {
  // Check if row is completely blank
  if (
    !row.კოდი &&
    !row['GIS კოდი'] &&
    !row.დასახელება &&
    !row.ტიპი &&
    !row.ზომა &&
    !row.ფილიალი &&
    !row.სტატუსი
  ) {
    return { valid: false, error: 'Completely blank row' };
  }

  // Name is REQUIRED
  if (!row.დასახელება || row.დასახელება.trim() === '') {
    return { valid: false, error: 'Missing name (დასახელება)' };
  }

  // Type is REQUIRED
  if (!row.ტიპი || row.ტიპი.trim() === '') {
    return { valid: false, error: 'Missing type (ტიპი)' };
  }

  // Unit is REQUIRED
  if (!row.ზომა || row.ზომა.trim() === '') {
    return { valid: false, error: 'Missing unit (ზომა)' };
  }

  // Validate type mapping exists
  const georgianType = row.ტიპი.trim();
  if (!TYPE_MAPPING[georgianType]) {
    return { valid: false, error: `Unknown type: ${georgianType}. Expected: შიდა, ხომასურიძე, თოდუა` };
  }

  return { valid: true };
}

function cleanGisCode(gisCode: string): string {
  // Remove leading semicolon if present
  return gisCode.startsWith(';') ? gisCode.substring(1) : gisCode;
}

function mapToObservationDefinition(row: ResearchComponentRow): any {
  const identifiers: any[] = [];

  // Add component code identifier (optional - allow empty)
  if (row.კოდი && row.კოდი.trim() !== '') {
    identifiers.push({
      system: IDENTIFIER_SYSTEMS.COMPONENT_CODE,
      value: row.კოდი.trim(),
    });
  }

  // Add GIS code identifier (optional - allow empty)
  if (row['GIS კოდი'] && row['GIS კოდი'].trim() !== '') {
    identifiers.push({
      system: IDENTIFIER_SYSTEMS.GIS_CODE,
      value: cleanGisCode(row['GIS კოდი'].trim()),
    });
  }

  const extensions: any[] = [];

  // Service type (REQUIRED - convert Georgian to English)
  const georgianType = row.ტიპი.trim();
  const englishType = TYPE_MAPPING[georgianType] || 'internal';
  extensions.push({
    url: EXTENSION_URLS.SERVICE_TYPE,
    valueCodeableConcept: {
      coding: [
        {
          code: englishType,
        },
      ],
    },
  });

  // Department (optional)
  if (row.ფილიალი && row.ფილიალი.trim() !== '') {
    extensions.push({
      url: EXTENSION_URLS.DEPARTMENT,
      valueString: row.ფილიალი.trim(),
    });
  }

  // Status as extension (convert Georgian to English)
  const georgianStatus = row.სტატუსი?.trim() || 'აქტიური';
  const status = STATUS_MAPPING[georgianStatus] || 'active';
  extensions.push({
    url: EXTENSION_URLS.STATUS,
    valueCode: status,
  });

  const resource: any = {
    resourceType: 'ObservationDefinition',
    code: {
      text: row.დასახელება.trim(),
    },
    quantitativeDetails: {
      unit: {
        text: row.ზომა.trim(),
      },
    },
  };

  // Add identifiers if any exist
  if (identifiers.length > 0) {
    resource.identifier = identifiers;
  }

  // Add extensions
  if (extensions.length > 0) {
    resource.extension = extensions;
  }

  return resource;
}

async function createResource(baseUrl: string, accessToken: string, resource: any): Promise<void> {
  const response = await fetch(`${baseUrl}/fhir/R4/ObservationDefinition`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/fhir+json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(resource),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }
}

async function importComponents(
  baseUrl: string,
  accessToken: string,
  rows: ResearchComponentRow[]
): Promise<ImportStats> {
  const stats: ImportStats = {
    total: rows.length,
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  console.log(`🚀 Starting import of ${stats.total} research components...\n`);

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
      const resource = mapToObservationDefinition(row);
      await createResource(baseUrl, accessToken, resource);
      stats.success++;

      // Progress logging
      if (stats.success % 50 === 0) {
        console.log(`✅ Imported ${stats.success}/${stats.total} components...`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Handle rate limiting (HTTP 429)
      if (errorMessage.includes('HTTP 429') || errorMessage.includes('Too Many Requests')) {
        console.log(`\n⏸️  Rate limit reached. Waiting 60 seconds before continuing...\n`);
        await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait 1 minute

        // Retry this row
        try {
          const resource = mapToObservationDefinition(row);
          await createResource(baseUrl, accessToken, resource);
          stats.success++;
          console.log(`✅ Retry successful for row ${rowNum}`);
        } catch (retryError) {
          stats.failed++;
          const retryErrorMessage = retryError instanceof Error ? retryError.message : String(retryError);
          stats.errors.push({
            row: rowNum,
            code: row.კოდი || 'N/A',
            error: retryErrorMessage,
          });
          console.error(`❌ Retry failed for row ${rowNum}: ${retryErrorMessage}`);
        }
      } else {
        // Regular error
        stats.failed++;
        stats.errors.push({
          row: rowNum,
          code: row.კოდი || 'N/A',
          error: errorMessage,
        });

        // Only log first 10 errors to avoid spam
        if (stats.failed <= 10) {
          console.error(`❌ Row ${rowNum} [${row.კოდი || 'N/A'}]: ${errorMessage}`);
        }
      }
    }

    // Small delay every 50 requests
    if ((i + 1) % 50 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
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
    const XLSX_FILE_PATH = path.join(__dirname, '../documentation/xsl/ლაბორატორია.xlsx');
    const BASE_URL = process.env.MEDPLUM_BASE_URL || 'http://localhost:8103';

    // Get access token from env or command line
    const accessToken = process.argv[2] || process.env.MEDPLUM_TOKEN;

    if (!accessToken) {
      console.error('❌ Missing access token!');
      console.error('\n📝 How to get your token:');
      console.error('   1. Open http://localhost:3000 in your browser');
      console.error('   2. Login with your admin account');
      console.error('   3. Open DevTools (F12)');
      console.error('   4. Go to: Application → Local Storage → http://localhost:3000');
      console.error('   5. Find "activeLogin" key, copy the JSON value');
      console.error('   6. Look for "accessToken" field in that JSON');
      console.error('\n💡 Usage:');
      console.error('   export MEDPLUM_TOKEN="your-token-here"');
      console.error('   npx tsx scripts/import-research-components.ts');
      console.error('\n   OR');
      console.error('\n   npx tsx scripts/import-research-components.ts "your-access-token-here"');
      process.exit(1);
    }

    console.log('🔧 Configuration:');
    console.log(`   Base URL: ${BASE_URL}`);
    console.log(`   Token: ${accessToken.substring(0, 20)}...`);
    console.log('');

    // Check file exists
    if (!fs.existsSync(XLSX_FILE_PATH)) {
      console.error(`❌ File not found: ${XLSX_FILE_PATH}`);
      process.exit(1);
    }

    // Parse file
    const rows = parseExcelFile(XLSX_FILE_PATH);

    // Import components
    const stats = await importComponents(BASE_URL, accessToken, rows);

    // Print summary
    printSummary(stats);

    // Save error log if needed
    if (stats.errors.length > 0) {
      const errorLogPath = path.join(__dirname, '../logs/research-components-import-errors.json');
      const logDir = path.dirname(errorLogPath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
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

      fs.writeFileSync(errorLogPath, JSON.stringify(errorReport, null, 2), 'utf-8');
      console.log(`📄 Error log saved to: ${errorLogPath}\n`);
    }

    // Exit
    if (stats.failed > 0) {
      console.error('⚠️  Import completed with errors');
      process.exit(1);
    } else {
      console.log('✅ Import completed successfully!');
      console.log('📍 View imported components at: http://localhost:3000/emr/nomenclature/laboratory');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
