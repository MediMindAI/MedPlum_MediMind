#!/usr/bin/env tsx
/**
 * Convert Apple Numbers file to Excel format
 *
 * Apple Numbers files (.numbers) are ZIP archives.
 * This script extracts and converts them to .xlsx format.
 */

import * as XLSX from 'xlsx';
import * as path from 'path';

async function convertNumbersToExcel() {
  const inputPath = path.join(
    __dirname,
    '../documentation/xsl/სამედიცინო სერვისების ცხრილი.numbers'
  );
  const outputPath = path.join(
    __dirname,
    '../documentation/xsl/სამედიცინო სერვისების ცხრილი.xlsx'
  );

  console.log('📖 Reading Numbers file:', inputPath);

  try {
    // xlsx library can read .numbers files directly
    const workbook = XLSX.readFile(inputPath);
    console.log('✅ File read successfully!');
    console.log(`   Sheets: ${workbook.SheetNames.join(', ')}`);

    // Write as Excel file
    XLSX.writeFile(workbook, outputPath);
    console.log('✅ Converted to Excel:', outputPath);

    // Show preview of first few rows
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    console.log(`\n📊 Preview (first 3 rows of ${rows.length} total):`);
    console.table(rows.slice(0, 3));

    console.log('\n✅ Conversion complete!');
    console.log('   Next step: npm tsx scripts/import-nomenclature.ts');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

convertNumbersToExcel();
