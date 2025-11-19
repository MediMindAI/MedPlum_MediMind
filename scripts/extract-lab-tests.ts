/**
 * Laboratory Tests Data Extraction Script
 *
 * This script extracts detailed laboratory test data from the original EMR system.
 * It double-clicks each test row, extracts the modal data, and saves to markdown.
 *
 * Usage: Run this in the Playwright browser console or as a script
 */

import * as fs from 'fs';
import * as path from 'path';

interface SampleContainer {
  code: string;
  name: string;
  color: string;
  description: string;
  naCitValue?: string;
}

interface TestComponent {
  sampleCode: string;
  testCode: string;
  testType: string;
  testName: string;
}

interface LabTestDetails {
  code: string;
  name: string;
  group: string;
  type: string;
  price: number;
  samples: SampleContainer[];
  components: TestComponent[];
  lisIntegration: boolean;
  lisProvider?: string;
  notes?: string;
}

const extractedTests: LabTestDetails[] = [];

/**
 * Extract color from style attribute or class
 */
function extractColor(element: HTMLElement): string {
  const bgColor = element.style.backgroundColor;
  if (bgColor) return bgColor;

  const colorAttr = element.getAttribute('color');
  if (colorAttr) return colorAttr;

  // Try to extract from inline style
  const style = element.getAttribute('style');
  if (style && style.includes('background')) {
    const match = style.match(/background[^:]*:\s*([^;]+)/);
    if (match) return match[1].trim();
  }

  return '';
}

/**
 * Extract sample/container data from the სინჯარები section
 */
function extractSamples(): SampleContainer[] {
  const samples: SampleContainer[] = [];

  // Find the სინჯარები (Containers) table
  const samplesSection = document.querySelector('div:has(> h3:contains("სინჯარები"))') ||
                         document.querySelector('div:has(> div:contains("სინჯარები"))');

  if (!samplesSection) {
    console.log('Samples section not found');
    return samples;
  }

  // Find the table rows
  const rows = samplesSection.querySelectorAll('table tbody tr');

  rows.forEach((row) => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 4) {
      const codeCell = cells[0];
      const nameCell = cells[1];
      const colorCell = cells[2]; // This should have the colored background
      const descCell = cells[3];
      const naCitCell = cells[4]; // Optional Na Cit value

      samples.push({
        code: codeCell.textContent?.trim() || '',
        name: nameCell.textContent?.trim() || '',
        color: extractColor(colorCell as HTMLElement),
        description: descCell.textContent?.trim() || '',
        naCitValue: naCitCell?.textContent?.trim() || undefined,
      });
    }
  });

  return samples;
}

/**
 * Extract component data from the კომპონენტები section
 */
function extractComponents(): TestComponent[] {
  const components: TestComponent[] = [];

  // Find the კომპონენტები (Components) table
  const componentsSection = document.querySelector('div:has(> h3:contains("კომპონენტები"))') ||
                            document.querySelector('div:has(> div:contains("კომპონენტები"))');

  if (!componentsSection) {
    console.log('Components section not found');
    return components;
  }

  // Find the table rows
  const rows = componentsSection.querySelectorAll('table tbody tr');

  rows.forEach((row) => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 3) {
      const sampleCodeCell = cells[0];
      const testCodeCell = cells[1];
      const testNameCell = cells[2];

      // Extract sample code and test type (e.g., "K2EDTA - 102")
      const sampleText = sampleCodeCell.textContent?.trim() || '';
      const [sampleCode, testCode] = sampleText.split('-').map(s => s.trim());

      // Extract test type (PT, PI, INR, etc.)
      const testTypeText = testCodeCell.textContent?.trim() || '';

      components.push({
        sampleCode: sampleCode || '',
        testCode: testCode || '',
        testType: testTypeText,
        testName: testNameCell.textContent?.trim() || '',
      });
    }
  });

  return components;
}

/**
 * Extract LIS integration settings
 */
function extractLISSettings(): { integrated: boolean; provider?: string } {
  // Look for "ინტეგრირებულია LIS-თან" checkbox
  const lisCheckbox = document.querySelector('input[type="checkbox"]:has(+ label:contains("LIS"))') as HTMLInputElement;
  const integrated = lisCheckbox?.checked || false;

  // Look for WebLab or other provider dropdown
  const providerDropdown = document.querySelector('select:has(option:contains("WebLab"))') as HTMLSelectElement;
  const provider = providerDropdown?.value || undefined;

  return { integrated, provider };
}

/**
 * Extract data from the modal dialog
 */
function extractModalData(testCode: string, testName: string, group: string, type: string, price: number): LabTestDetails {
  console.log(`Extracting data for test: ${testCode} - ${testName}`);

  const samples = extractSamples();
  const components = extractComponents();
  const lisSettings = extractLISSettings();

  // Extract any additional notes
  const notesTextarea = document.querySelector('textarea[placeholder*="პროცედურების კორება"]');
  const notes = notesTextarea?.textContent?.trim() || undefined;

  return {
    code: testCode,
    name: testName,
    group: group,
    type: type,
    price: price,
    samples: samples,
    components: components,
    lisIntegration: lisSettings.integrated,
    lisProvider: lisSettings.provider,
    notes: notes,
  };
}

/**
 * Main extraction function
 */
async function extractAllLabTests() {
  console.log('Starting laboratory tests extraction...');

  // Find all table rows with laboratory tests
  const tableRows = document.querySelectorAll('table tbody tr[data-id]');

  console.log(`Found ${tableRows.length} test rows`);

  for (let i = 0; i < tableRows.length; i++) {
    const row = tableRows[i] as HTMLTableRowElement;
    const cells = row.querySelectorAll('td');

    if (cells.length < 5) continue;

    const code = cells[0].textContent?.trim() || '';
    const name = cells[1].textContent?.trim() || '';
    const group = cells[2].textContent?.trim() || '';
    const type = cells[3].textContent?.trim() || '';
    const priceText = cells[4].textContent?.trim() || '0';
    const price = parseFloat(priceText) || 0;

    // Only process laboratory tests
    if (group !== 'ლაბორატორიული კვლევები') continue;

    console.log(`Processing ${i + 1}/${tableRows.length}: ${code} - ${name}`);

    // Double-click the row to open the modal
    row.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));

    // Wait for modal to open
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Extract data from modal
    const testData = extractModalData(code, name, group, type, price);
    extractedTests.push(testData);

    // Close modal (press ESC or click close button)
    const closeButton = document.querySelector('button.close, button:contains("×")') as HTMLElement;
    if (closeButton) {
      closeButton.click();
    } else {
      // Try ESC key
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27 }));
    }

    // Wait for modal to close
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`Extraction complete! Processed ${extractedTests.length} tests`);

  // Save to file
  saveToMarkdown();
}

/**
 * Save extracted data to markdown file
 */
function saveToMarkdown() {
  const outputPath = path.join(__dirname, '../documentation/laboratory/extracted-lab-tests.md');

  let markdown = `# Laboratory Tests Data Extraction\n\n`;
  markdown += `**Extraction Date:** ${new Date().toISOString()}\n\n`;
  markdown += `**Total Tests:** ${extractedTests.length}\n\n`;
  markdown += `---\n\n`;

  extractedTests.forEach((test, index) => {
    markdown += `## ${index + 1}. ${test.code} - ${test.name}\n\n`;
    markdown += `**Group:** ${test.group}\n\n`;
    markdown += `**Type:** ${test.type}\n\n`;
    markdown += `**Price:** ${test.price} GEL\n\n`;

    // Samples/Containers section
    if (test.samples.length > 0) {
      markdown += `### სინჯარები (Samples/Containers)\n\n`;
      markdown += `| Code | Name | Color | Description | Na Cit Value |\n`;
      markdown += `|------|------|-------|-------------|-------------|\n`;

      test.samples.forEach(sample => {
        markdown += `| ${sample.code} | ${sample.name} | ${sample.color} | ${sample.description} | ${sample.naCitValue || 'N/A'} |\n`;
      });

      markdown += `\n`;
    }

    // Components section
    if (test.components.length > 0) {
      markdown += `### კომპონენტები (Components)\n\n`;
      markdown += `| Sample Code | Test Code | Test Type | Test Name |\n`;
      markdown += `|-------------|-----------|-----------|----------|\n`;

      test.components.forEach(component => {
        markdown += `| ${component.sampleCode} | ${component.testCode} | ${component.testType} | ${component.testName} |\n`;
      });

      markdown += `\n`;
    }

    // LIS Integration
    markdown += `### Integration\n\n`;
    markdown += `**LIS Integration:** ${test.lisIntegration ? 'Yes' : 'No'}\n\n`;
    if (test.lisProvider) {
      markdown += `**LIS Provider:** ${test.lisProvider}\n\n`;
    }

    // Notes
    if (test.notes) {
      markdown += `### Notes\n\n`;
      markdown += `${test.notes}\n\n`;
    }

    markdown += `---\n\n`;
  });

  // Save to file
  fs.writeFileSync(outputPath, markdown, 'utf-8');
  console.log(`Markdown file saved to: ${outputPath}`);

  // Also save as JSON for programmatic use
  const jsonPath = path.join(__dirname, '../documentation/laboratory/extracted-lab-tests.json');
  fs.writeFileSync(jsonPath, JSON.stringify(extractedTests, null, 2), 'utf-8');
  console.log(`JSON file saved to: ${jsonPath}`);
}

// Run the extraction
extractAllLabTests().catch(console.error);
