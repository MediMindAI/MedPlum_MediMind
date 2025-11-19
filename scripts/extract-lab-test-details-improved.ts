#!/usr/bin/env tsx
/**
 * Laboratory Test Details Extractor (Improved Version)
 *
 * Extracts detailed information from each laboratory test in the original EMR system
 * including containers, components, correlations, and financial data.
 *
 * Usage:
 *   npx tsx scripts/extract-lab-test-details-improved.ts
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
  containers: Container[];
  components: TestComponent[];
  correlations: Correlation[];
  financial: {
    calHed: string;
    printable: boolean;
    itemGetPrice: number;
  };
  additionalInfo: {
    createdDate?: string;
    lisIntegration?: boolean;
    lisProvider?: string;
    tags?: string;
  };
}

interface Container {
  code: string;
  name: string;
  color: string;
  biometricSampleName: string;
  referenceInterval: string;
}

interface TestComponent {
  code: string;
  type: string;
  name: string;
}

interface Correlation {
  containerCode: string;
  type: string;
  name: string;
}

const EMR_URL = 'http://178.134.21.82:8008/index.php';
const USERNAME = 'cicig';
const PASSWORD = 'Tsotne2011';

async function login(page: Page): Promise<void> {
  console.log('🔐 Logging in to EMR system...');

  await page.goto(EMR_URL, { waitUntil: 'networkidle' });

  // Wait for login form
  await page.waitForSelector('input[name="username"], input[type="text"]', { timeout: 10000 });

  // Fill login credentials
  await page.fill('input[name="username"], input[type="text"]', USERNAME);
  await page.fill('input[name="password"], input[type="password"]', PASSWORD);

  // Submit login
  await page.click('button[type="submit"], input[type="submit"]');

  // Wait for navigation after login
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('✅ Login successful!');
}

async function navigateToLaboratoryNomenclature(page: Page): Promise<void> {
  console.log('🧭 Navigating to Laboratory Nomenclature...');

  // Click on ნომენკლატურა (Nomenclature) tab
  const nomenclatureTab = page.locator('text=ნომენკლატურა').first();
  await nomenclatureTab.click();
  await page.waitForTimeout(1000);

  // Click on სამედიცინო I (Medical I) tab
  const medicalTab = page.locator('text=სამედიცინო I').first();
  await medicalTab.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('✅ Navigated to Medical Services Nomenclature');
}

async function selectLaboratoryGroup(page: Page): Promise<void> {
  console.log('🔍 Selecting laboratory tests group...');

  try {
    // Find the group dropdown - look for the one with "ჯგუფი" label nearby
    const groupDropdown = page.locator('select').filter({ hasText: /ინსტრუმენტული|ლაბორატორიული|კონსულტაციები/ }).first();

    if (await groupDropdown.count() > 0) {
      // Select "ლაბორატორიული გამოკვლევები" (Laboratory Tests)
      await groupDropdown.selectOption({ label: 'ლაბორატორიული გამოკვლევები' });
      await page.waitForTimeout(1000);
      console.log('✅ Selected laboratory tests group');

      // Click the filter button to apply the filter
      const filterButton = page.locator('button, a, .btn').filter({ hasText: /ფილტრი|filter|🔍|search/i }).first();

      // Also try to find filter icon button
      const filterIconButton = page.locator('button:has(i.fa-filter), button:has(svg), .filter-btn, #filter-btn').first();

      let clicked = false;

      if (await filterButton.isVisible()) {
        await filterButton.click();
        clicked = true;
      } else if (await filterIconButton.isVisible()) {
        await filterIconButton.click();
        clicked = true;
      }

      if (clicked) {
        await page.waitForTimeout(2000);
        console.log('✅ Clicked filter button to apply filter');
      } else {
        console.log('⚠️  Filter button not found, filter may auto-apply');
      }
    } else {
      console.log('⚠️  Group dropdown not found, will extract all visible tests');
    }
  } catch (err) {
    console.log('⚠️  Could not filter by group, proceeding with all tests');
  }
}

async function closeAnyOpenModal(page: Page): Promise<void> {
  // Try multiple methods to close modal
  try {
    // Method 1: Press Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Method 2: Click X button
    const closeButton = page.locator('button.close, .modal-header button, button:has-text("×")').first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await page.waitForTimeout(500);
    }

    // Method 3: Click outside modal (backdrop)
    const backdrop = page.locator('.modal-backdrop, .overlay').first();
    if (await backdrop.isVisible()) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
  } catch (err) {
    // Ignore errors
  }
}

async function extractContainersFromModal(page: Page): Promise<Container[]> {
  const containers: Container[] = [];

  try {
    // Find the "სინჯარები" (Containers) section
    const containerSection = page.locator('text=სინჯარები').locator('..').locator('table').first();

    if (await containerSection.count() > 0) {
      const rows = await containerSection.locator('tbody tr').all();

      for (const row of rows) {
        const cells = await row.locator('td').allTextContents();
        if (cells.length >= 3) {
          // Extract color from style or class
          let color = '';
          const colorCell = row.locator('td').nth(1);
          const bgColor = await colorCell.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return computed.backgroundColor || '';
          });

          containers.push({
            code: cells[0]?.trim() || '',
            name: cells[1]?.trim() || '',
            color: bgColor || color,
            biometricSampleName: cells[2]?.trim() || '',
            referenceInterval: cells[3]?.trim() || '',
          });
        }
      }
    }
  } catch (err) {
    console.error('⚠️  Error extracting containers:', err);
  }

  return containers;
}

async function extractComponentsFromModal(page: Page): Promise<TestComponent[]> {
  const components: TestComponent[] = [];

  try {
    // Find the "კომპონენტები" (Components) section
    const componentSection = page.locator('text=კომპონენტები').locator('..').locator('table').first();

    if (await componentSection.count() > 0) {
      const rows = await componentSection.locator('tbody tr').all();

      for (const row of rows) {
        const cells = await row.locator('td').allTextContents();
        if (cells.length >= 2) {
          components.push({
            code: cells[0]?.trim() || '',
            type: cells[1]?.trim() || '',
            name: cells[2]?.trim() || '',
          });
        }
      }
    }
  } catch (err) {
    console.error('⚠️  Error extracting components:', err);
  }

  return components;
}

async function extractCorrelationsFromModal(page: Page): Promise<Correlation[]> {
  const correlations: Correlation[] = [];

  try {
    // Find the "კორელაციები" (Correlations) section
    const correlationSection = page.locator('text=კორელაციები').locator('..').locator('table').first();

    if (await correlationSection.count() > 0) {
      const rows = await correlationSection.locator('tbody tr').all();

      for (const row of rows) {
        const cells = await row.locator('td').allTextContents();
        if (cells.length >= 2) {
          correlations.push({
            containerCode: cells[0]?.trim() || '',
            type: cells[1]?.trim() || '',
            name: cells[2]?.trim() || '',
          });
        }
      }
    }
  } catch (err) {
    console.error('⚠️  Error extracting correlations:', err);
  }

  return correlations;
}

async function extractAdditionalInfoFromModal(page: Page): Promise<Partial<LabTestDetail['additionalInfo']>> {
  const info: Partial<LabTestDetail['additionalInfo']> = {};

  try {
    // Check for LIS integration checkbox
    const lisCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /LIS/ }).first();
    if (await lisCheckbox.count() > 0) {
      info.lisIntegration = await lisCheckbox.isChecked();
    }

    // Get LIS provider from dropdown
    const lisProvider = page.locator('select').filter({ hasText: /WebLab|Limbach/ }).first();
    if (await lisProvider.count() > 0) {
      const selectedOption = await lisProvider.inputValue();
      info.lisProvider = selectedOption;
    }

    // Get tags
    const tagsInput = page.locator('input, textarea').filter({ hasText: /tags|თეგები/ }).first();
    if (await tagsInput.count() > 0) {
      info.tags = await tagsInput.inputValue();
    }
  } catch (err) {
    console.error('⚠️  Error extracting additional info:', err);
  }

  return info;
}

async function extractTestDetailsFromModal(page: Page): Promise<Partial<LabTestDetail>> {
  console.log('   📊 Extracting detailed data from modal...');

  const details: Partial<LabTestDetail> = {
    containers: [],
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
    // Wait for modal to be fully visible
    await page.waitForSelector('.modal-dialog:visible, div[role="dialog"]:visible', {
      timeout: 5000,
      state: 'visible'
    });

    await page.waitForTimeout(1000); // Extra wait for content to load

    // Extract containers
    const containers = await extractContainersFromModal(page);
    details.containers = containers;
    console.log(`      ✓ Extracted ${containers.length} containers`);

    // Extract components
    const components = await extractComponentsFromModal(page);
    details.components = components;
    console.log(`      ✓ Extracted ${components.length} components`);

    // Extract correlations
    const correlations = await extractCorrelationsFromModal(page);
    details.correlations = correlations;
    console.log(`      ✓ Extracted ${correlations.length} correlations`);

    // Extract additional info
    const additionalInfo = await extractAdditionalInfoFromModal(page);
    details.additionalInfo = additionalInfo;
    console.log(`      ✓ Extracted additional info`);

  } catch (err) {
    console.error('   ❌ Error waiting for modal:', err);
  }

  return details;
}

async function extractAllLabTests(page: Page): Promise<LabTestDetail[]> {
  console.log('🔬 Starting extraction of laboratory tests...\n');

  const allTests: LabTestDetail[] = [];

  // Get all table rows
  const tableBody = page.locator('table tbody').first();
  const rows = await tableBody.locator('tr').all();

  console.log(`📋 Found ${rows.length} rows in the table\n`);

  // Start from index 1 to skip header row if it's inside tbody
  for (let i = 1; i < Math.min(rows.length, 20); i++) { // Limit to first 20 for testing
    const row = rows[i];

    try {
      // Check if row is visible
      if (!(await row.isVisible())) {
        continue;
      }

      // Extract basic info from table row
      const cells = await row.locator('td').allTextContents();

      if (cells.length < 3) {
        continue; // Skip invalid rows
      }

      const testData: LabTestDetail = {
        code: cells[0]?.trim() || '',
        name: cells[1]?.trim() || '',
        group: cells[2]?.trim() || '',
        type: cells[3]?.trim() || '',
        price: parseFloat(cells[4]?.replace(/[^\d.]/g, '') || '0'),
        total: parseFloat(cells[5]?.replace(/[^\d.]/g, '') || '0'),
        containers: [],
        components: [],
        correlations: [],
        financial: {
          calHed: cells[6]?.trim() || '',
          printable: false,
          itemGetPrice: 0,
        },
        additionalInfo: {},
      };

      // Skip rows without code or name
      if (!testData.code || !testData.name) {
        continue;
      }

      console.log(`📌 Processing test ${i}/${rows.length}: ${testData.code} - ${testData.name}`);

      // Close any previously open modal
      await closeAnyOpenModal(page);
      await page.waitForTimeout(500);

      // Double-click to open modal with retry logic
      let modalOpened = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await row.dblclick({ timeout: 5000 });
          await page.waitForTimeout(2000);

          // Check if modal is visible
          const modalVisible = await page.locator('.modal-dialog:visible, div[role="dialog"]:visible').count() > 0;
          if (modalVisible) {
            modalOpened = true;
            break;
          }
        } catch (err) {
          console.log(`   ⚠️  Attempt ${attempt + 1} failed, retrying...`);
          await closeAnyOpenModal(page);
          await page.waitForTimeout(500);
        }
      }

      if (!modalOpened) {
        console.log(`   ❌ Could not open modal for test ${testData.code}, skipping...`);
        continue;
      }

      // Extract detailed info from modal
      const modalData = await extractTestDetailsFromModal(page);

      // Merge modal data into test data
      testData.containers = modalData.containers || [];
      testData.components = modalData.components || [];
      testData.correlations = modalData.correlations || [];
      testData.additionalInfo = { ...testData.additionalInfo, ...modalData.additionalInfo };

      allTests.push(testData);

      console.log(`   ✅ Successfully extracted test ${testData.code}\n`);

      // Close modal
      await closeAnyOpenModal(page);
      await page.waitForTimeout(1000);

    } catch (err) {
      console.error(`   ❌ Error processing row ${i}:`, err);
      // Try to close any open modal
      await closeAnyOpenModal(page);
      await page.waitForTimeout(500);
    }
  }

  return allTests;
}

function saveToMarkdown(tests: LabTestDetail[], outputPath: string): void {
  console.log('\n💾 Generating Markdown report...');

  let markdown = '# Laboratory Tests Detailed Extraction Report\n\n';
  markdown += `**Total Tests Extracted:** ${tests.length}\n\n`;
  markdown += `**Extraction Date:** ${new Date().toLocaleString('ka-GE', { timeZone: 'Asia/Tbilisi' })}\n\n`;
  markdown += '---\n\n';

  for (const test of tests) {
    markdown += `## ${test.code} - ${test.name}\n\n`;

    markdown += '### Basic Information\n\n';
    markdown += `- **კოდი (Code):** ${test.code}\n`;
    markdown += `- **დასახელება (Name):** ${test.name}\n`;
    markdown += `- **ჯგუფი (Group):** ${test.group}\n`;
    markdown += `- **ტიპი (Type):** ${test.type}\n`;
    markdown += `- **ფასი (Price):** ${test.price} ₾\n`;
    markdown += `- **ჯამი (Total):** ${test.total} ₾\n\n`;

    if (test.containers.length > 0) {
      markdown += '### სინჯარები (Containers)\n\n';
      markdown += '| კოდი | დასახელება | ფერი | ბიომეტრიული ნიმუშის დასახელება | საცნობარო ინტერვალი |\n';
      markdown += '|------|-----------|------|------------------------------|-------------------|\n';
      for (const container of test.containers) {
        markdown += `| ${container.code} | ${container.name} | ${container.color} | ${container.biometricSampleName} | ${container.referenceInterval} |\n`;
      }
      markdown += '\n';
    }

    if (test.components.length > 0) {
      markdown += '### კომპონენტები (Components)\n\n';
      markdown += '| კოდი | ტიპი | სახელი |\n';
      markdown += '|------|------|-------|\n';
      for (const comp of test.components) {
        markdown += `| ${comp.code} | ${comp.type} | ${comp.name} |\n`;
      }
      markdown += '\n';
    }

    if (test.correlations.length > 0) {
      markdown += '### კორელაციები (Correlations)\n\n';
      markdown += '| სინჯარის კოდი | ტიპი | სახელი |\n';
      markdown += '|--------------|------|-------|\n';
      for (const corr of test.correlations) {
        markdown += `| ${corr.containerCode} | ${corr.type} | ${corr.name} |\n`;
      }
      markdown += '\n';
    }

    markdown += '### Financial Information\n\n';
    markdown += `- **კალკულაციის დათვლა:** ${test.financial.calHed}\n`;
    markdown += `- **დასაბეჭდი:** ${test.financial.printable ? 'დიახ' : 'არა'}\n`;
    markdown += `- **Item Get Price:** ${test.financial.itemGetPrice}\n\n`;

    if (Object.keys(test.additionalInfo).length > 0) {
      markdown += '### Additional Information\n\n';
      if (test.additionalInfo.lisIntegration !== undefined) {
        markdown += `- **LIS ინტეგრაცია:** ${test.additionalInfo.lisIntegration ? 'დიახ' : 'არა'}\n`;
      }
      if (test.additionalInfo.lisProvider) {
        markdown += `- **LIS Provider:** ${test.additionalInfo.lisProvider}\n`;
      }
      if (test.additionalInfo.tags) {
        markdown += `- **Tags:** ${test.additionalInfo.tags}\n`;
      }
      markdown += '\n';
    }

    markdown += '---\n\n';
  }

  fs.writeFileSync(outputPath, markdown, 'utf-8');
  console.log(`✅ Markdown report saved to: ${outputPath}`);
}

function saveToJSON(tests: LabTestDetail[], outputPath: string): void {
  console.log('💾 Saving JSON data...');

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
    console.log('🚀 Starting Laboratory Test Detailed Extraction...\n');

    // Launch browser
    browser = await chromium.launch({
      headless: false, // Show browser for monitoring
      slowMo: 100, // Slow down slightly for stability
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

    // Select laboratory group
    await selectLaboratoryGroup(page);

    // Extract all tests
    const tests = await extractAllLabTests(page);

    if (tests.length === 0) {
      console.log('\n⚠️  No tests were extracted. Please check the page structure.');
      return;
    }

    // Save results
    const outputDir = path.join(__dirname, '../documentation/laboratory/extracted');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const mdPath = path.join(outputDir, `lab-tests-detailed-${timestamp}.md`);
    const jsonPath = path.join(outputDir, `lab-tests-detailed-${timestamp}.json`);

    saveToMarkdown(tests, mdPath);
    saveToJSON(tests, jsonPath);

    console.log('\n✅ Extraction complete!');
    console.log(`📄 Markdown report: ${mdPath}`);
    console.log(`📄 JSON data: ${jsonPath}`);
    console.log(`📊 Total tests extracted: ${tests.length}`);

    // Keep browser open for 5 seconds to see final state
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main();
