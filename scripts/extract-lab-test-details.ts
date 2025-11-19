#!/usr/bin/env tsx
/**
 * Laboratory Test Details Extractor
 *
 * Extracts detailed information from each laboratory test in the original EMR system
 * including correlations, financial data, and component mappings.
 *
 * Usage:
 *   npx tsx scripts/extract-lab-test-details.ts
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface LabTestDetail {
  code: string;
  name: string;
  group: string;
  type: string;
  price: number;
  total: number;
  components: ComponentMapping[];
  correlations: string[];
  financial: {
    calHed: string;
    printable: boolean;
    itemGetPrice: number;
  };
  additionalInfo: {
    createdDate?: string;
    tags?: string;
    lisIntegration?: boolean;
    lisProvider?: string;
    externalOrderCode?: string;
    gisCode?: string;
  };
}

interface ComponentMapping {
  code: string;
  name: string;
  unit: string;
  type: string;
}

const EMR_URL = 'http://178.134.21.82:8008/index.php';
const USERNAME = 'cicig';
const PASSWORD = 'Tsotne2011';

async function login(page: Page): Promise<void> {
  console.log('🔐 Logging in to EMR system...');

  await page.goto(EMR_URL);

  // Wait for login form
  await page.waitForSelector('input[name="username"], input[type="text"]', { timeout: 10000 });

  // Fill login credentials
  await page.fill('input[name="username"], input[type="text"]', USERNAME);
  await page.fill('input[name="password"], input[type="password"]', PASSWORD);

  // Submit login
  await page.click('button[type="submit"], input[type="submit"]');

  // Wait for navigation after login
  await page.waitForLoadState('networkidle');

  console.log('✅ Login successful!');
}

async function navigateToLaboratoryNomenclature(page: Page): Promise<void> {
  console.log('🧭 Navigating to Laboratory Nomenclature...');

  // Click on ნომენკლატურა (Nomenclature) menu
  await page.click('text=ნომენკლატურა');
  await page.waitForTimeout(1000);

  // Click on სამედიცინო I (Medical I)
  await page.click('text=სამედიცინო I');
  await page.waitForLoadState('networkidle');

  console.log('✅ Navigated to Medical Services Nomenclature');
}

async function filterLaboratoryTests(page: Page): Promise<void> {
  console.log('🔍 Filtering for laboratory tests...');

  // Find the group dropdown/filter
  const groupFilter = await page.locator('select, input').filter({ hasText: /ჯგუფი|Group/ }).first();

  if (await groupFilter.count() > 0) {
    // Select "ლაბორატორიული გამოკვლევები" (Laboratory Tests)
    await groupFilter.selectOption({ label: /ლაბორატორიული/ });
    await page.waitForTimeout(1000);
  } else {
    console.log('⚠️  Group filter not found, proceeding with all services...');
  }
}

async function extractTestDetailsFromModal(page: Page): Promise<Partial<LabTestDetail>> {
  console.log('📊 Extracting data from modal...');

  const details: Partial<LabTestDetail> = {
    components: [],
    correlations: [],
    financial: {
      calHed: '',
      printable: false,
      itemGetPrice: 0,
    },
    additionalInfo: {},
  };

  try {
    // Wait for modal to be visible
    await page.waitForSelector('.modal-dialog, .modal-content, div[role="dialog"]', { timeout: 5000 });

    // Extract component mappings from the components table
    const componentRows = await page.locator('table tbody tr').all();

    for (const row of componentRows) {
      try {
        const cells = await row.locator('td').allTextContents();
        if (cells.length >= 3) {
          details.components?.push({
            code: cells[0]?.trim() || '',
            name: cells[1]?.trim() || '',
            unit: cells[2]?.trim() || '',
            type: cells[3]?.trim() || '',
          });
        }
      } catch (err) {
        // Skip invalid rows
      }
    }

    // Extract correlations (related tests)
    const correlationElements = await page.locator('text=/კორელაცია|Correlation/').locator('..').locator('table tbody tr').all();
    for (const corr of correlationElements) {
      const text = await corr.textContent();
      if (text) {
        details.correlations?.push(text.trim());
      }
    }

    // Extract financial information
    const calHedElement = await page.locator('text=/კალკულაცია|Calculation/').locator('..').locator('input, select').first();
    if (await calHedElement.count() > 0) {
      details.financial.calHed = await calHedElement.inputValue();
    }

    const printableCheckbox = await page.locator('input[type="checkbox"]').filter({ hasText: /დასაბეჭდი|Printable/ }).first();
    if (await printableCheckbox.count() > 0) {
      details.financial.printable = await printableCheckbox.isChecked();
    }

    // Extract additional info
    const gisCodeInput = await page.locator('input').filter({ hasText: /GIS/ }).first();
    if (await gisCodeInput.count() > 0) {
      details.additionalInfo.gisCode = await gisCodeInput.inputValue();
    }

    console.log(`✅ Extracted ${details.components?.length} components from modal`);

  } catch (err) {
    console.error('❌ Error extracting modal data:', err);
  }

  return details;
}

async function extractAllLabTests(page: Page): Promise<LabTestDetail[]> {
  console.log('🔬 Starting extraction of all laboratory tests...');

  const allTests: LabTestDetail[] = [];

  // Get all table rows
  const rows = await page.locator('table tbody tr').all();
  console.log(`📋 Found ${rows.length} rows in the table`);

  for (let i = 0; i < Math.min(rows.length, 10); i++) { // Start with first 10 for testing
    const row = rows[i];

    try {
      // Extract basic info from table row
      const cells = await row.locator('td').allTextContents();

      if (cells.length < 4) {
        continue; // Skip invalid rows
      }

      const testData: LabTestDetail = {
        code: cells[0]?.trim() || '',
        name: cells[1]?.trim() || '',
        group: cells[2]?.trim() || '',
        type: cells[3]?.trim() || '',
        price: parseFloat(cells[4]?.replace(/[^\d.]/g, '') || '0'),
        total: parseFloat(cells[5]?.replace(/[^\d.]/g, '') || '0'),
        components: [],
        correlations: [],
        financial: {
          calHed: cells[6]?.trim() || '',
          printable: false,
          itemGetPrice: 0,
        },
        additionalInfo: {},
      };

      console.log(`\n📌 Processing test ${i + 1}/${rows.length}: ${testData.code} - ${testData.name}`);

      // Double-click to open modal
      await row.dblclick();
      await page.waitForTimeout(1500); // Wait for modal to open

      // Extract detailed info from modal
      const modalData = await extractTestDetailsFromModal(page);

      // Merge modal data into test data
      testData.components = modalData.components || [];
      testData.correlations = modalData.correlations || [];
      testData.financial = { ...testData.financial, ...modalData.financial };
      testData.additionalInfo = modalData.additionalInfo || {};

      allTests.push(testData);

      // Close modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      console.log(`✅ Extracted test: ${testData.code} with ${testData.components.length} components`);

    } catch (err) {
      console.error(`❌ Error processing row ${i}:`, err);
      // Try to close any open modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
  }

  return allTests;
}

function saveToMarkdown(tests: LabTestDetail[], outputPath: string): void {
  console.log('💾 Saving extracted data to Markdown...');

  let markdown = '# Laboratory Tests Extraction Report\n\n';
  markdown += `**Total Tests Extracted:** ${tests.length}\n\n`;
  markdown += `**Extraction Date:** ${new Date().toISOString()}\n\n`;
  markdown += '---\n\n';

  for (const test of tests) {
    markdown += `## ${test.code} - ${test.name}\n\n`;

    markdown += '### Basic Information\n\n';
    markdown += `- **Code:** ${test.code}\n`;
    markdown += `- **Name:** ${test.name}\n`;
    markdown += `- **Group:** ${test.group}\n`;
    markdown += `- **Type:** ${test.type}\n`;
    markdown += `- **Price:** ${test.price} ₾\n`;
    markdown += `- **Total:** ${test.total} ₾\n\n`;

    if (test.components.length > 0) {
      markdown += '### Components (კომპონენტები)\n\n';
      markdown += '| Code | Name | Unit | Type |\n';
      markdown += '|------|------|------|------|\n';
      for (const comp of test.components) {
        markdown += `| ${comp.code} | ${comp.name} | ${comp.unit} | ${comp.type} |\n`;
      }
      markdown += '\n';
    }

    if (test.correlations.length > 0) {
      markdown += '### Correlations (კორელაციები)\n\n';
      for (const corr of test.correlations) {
        markdown += `- ${corr}\n`;
      }
      markdown += '\n';
    }

    markdown += '### Financial Information\n\n';
    markdown += `- **Calculation Method:** ${test.financial.calHed}\n`;
    markdown += `- **Printable:** ${test.financial.printable ? 'Yes' : 'No'}\n`;
    markdown += `- **Item Get Price:** ${test.financial.itemGetPrice}\n\n`;

    if (Object.keys(test.additionalInfo).length > 0) {
      markdown += '### Additional Information\n\n';
      for (const [key, value] of Object.entries(test.additionalInfo)) {
        markdown += `- **${key}:** ${value}\n`;
      }
      markdown += '\n';
    }

    markdown += '---\n\n';
  }

  fs.writeFileSync(outputPath, markdown, 'utf-8');
  console.log(`✅ Markdown report saved to: ${outputPath}`);
}

function saveToJSON(tests: LabTestDetail[], outputPath: string): void {
  console.log('💾 Saving extracted data to JSON...');

  const jsonData = {
    extractionDate: new Date().toISOString(),
    totalTests: tests.length,
    tests: tests,
  };

  fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2), 'utf-8');
  console.log(`✅ JSON data saved to: ${outputPath}`);
}

async function main() {
  let browser: Browser | null = null;

  try {
    console.log('🚀 Starting Laboratory Test Extraction...\n');

    // Launch browser
    browser = await chromium.launch({
      headless: false, // Show browser for debugging
      slowMo: 500, // Slow down actions for visibility
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      locale: 'ka-GE',
    });

    const page = await context.newPage();

    // Login
    await login(page);

    // Navigate to laboratory nomenclature
    await navigateToLaboratoryNomenclature(page);

    // Filter for laboratory tests
    await filterLaboratoryTests(page);

    // Extract all tests
    const tests = await extractAllLabTests(page);

    // Save results
    const outputDir = path.join(__dirname, '../documentation/laboratory/extracted');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const mdPath = path.join(outputDir, 'lab-tests-extraction.md');
    const jsonPath = path.join(outputDir, 'lab-tests-extraction.json');

    saveToMarkdown(tests, mdPath);
    saveToJSON(tests, jsonPath);

    console.log('\n✅ Extraction complete!');
    console.log(`📄 Markdown report: ${mdPath}`);
    console.log(`📄 JSON data: ${jsonPath}`);
    console.log(`📊 Total tests extracted: ${tests.length}`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main();
