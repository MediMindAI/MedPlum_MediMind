/**
 * Script to map the Financial tab from the Registered Services modal
 * on the Nomenclature Medical 1 page
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://178.134.21.82:8008/index.php';
const USERNAME = 'cicig';
const PASSWORD = 'Tsotne2011';

interface ExtractedData {
  modalHeader: {
    serviceCode: string;
    serviceName: string;
  };
  tabs: string[];
  formFields: {
    priceType: {
      label: string;
      type: string;
      options: Array<{ value: string; text: string }>;
    };
    currency: {
      label: string;
      type: string;
      options: Array<{ value: string; text: string }>;
    };
    date: {
      label: string;
      type: string;
    };
    price: {
      label: string;
      type: string;
    };
  };
  tableColumns: string[];
  tableData: Array<Record<string, string>>;
  buttons: Array<{
    text: string;
    type: string;
    action: string;
  }>;
}

async function login(page: Page): Promise<void> {
  console.log('Navigating to login page...');
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');

  // Check if already logged in (redirected to clinic.php)
  if (page.url().includes('clinic.php')) {
    console.log('Already logged in, skipping login form');
    return;
  }

  // Check if login form exists
  const userInput = page.locator('input[name="user"]');
  if (await userInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Filling login credentials...');
    await page.fill('input[name="user"]', USERNAME);
    await page.fill('input[name="password"]', PASSWORD);

    console.log('Clicking login button...');
    await page.click('input[type="submit"]');
    await page.waitForLoadState('networkidle');
  }

  console.log('Login successful!');
}

async function navigateToNomenclature(page: Page): Promise<void> {
  console.log('Navigating to Nomenclature page...');

  // Take screenshot of the main page to see structure
  await page.screenshot({ path: 'screenshots/01-main-page.png', fullPage: true });

  // Wait for page to load
  await page.waitForTimeout(2000);

  // Get page HTML to inspect structure
  const pageContent = await page.evaluate(() => {
    // Look for menu items
    const menuItems = Array.from(document.querySelectorAll('a, button, li')).map(el => ({
      tag: el.tagName,
      text: el.textContent?.trim().substring(0, 100),
      href: el.getAttribute('href'),
      onclick: el.getAttribute('onclick'),
    })).filter(item => item.text && item.text.length > 0);

    return menuItems;
  });

  console.log('Found menu items:', pageContent.filter(item =>
    item.text?.includes('ნომენკლატურა') ||
    item.text?.includes('სამედიცინო') ||
    item.text?.includes('სერვის')
  ));

  // Try to find and click on nomenclature menu
  const nomenclatureSelectors = [
    'text=ნომენკლატურა',
    'a:has-text("ნომენკლატურა")',
    'li:has-text("ნომენკლატურა")',
    '[onclick*="nomenclature"]',
    '[href*="nomenclature"]',
  ];

  let found = false;
  for (const selector of nomenclatureSelectors) {
    const element = page.locator(selector).first();
    if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log(`Clicking nomenclature with selector: ${selector}`);
      await element.click();
      await page.waitForTimeout(1500);
      found = true;
      break;
    }
  }

  if (!found) {
    console.log('Could not find nomenclature menu, taking diagnostic screenshot');
    await page.screenshot({ path: 'screenshots/02-menu-not-found.png', fullPage: true });
  }

  await page.screenshot({ path: 'screenshots/03-after-nomenclature-click.png', fullPage: true });

  // Try to find medical services link
  const medicalSelectors = [
    'text=სამედიცინო სერვისები',
    'a:has-text("სამედიცინო")',
    'li:has-text("სამედიცინო")',
    '[onclick*="medical"]',
    '[href*="medical"]',
  ];

  for (const selector of medicalSelectors) {
    const element = page.locator(selector).first();
    if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log(`Clicking medical services with selector: ${selector}`);
      await element.click();
      await page.waitForLoadState('networkidle');
      found = true;
      break;
    }
  }

  await page.screenshot({ path: 'screenshots/04-nomenclature-page.png', fullPage: true });
  console.log('Navigated to Nomenclature Medical 1 page');
}

async function openRegisteredServicesModal(page: Page): Promise<void> {
  console.log('Looking for "registered services" button...');

  // Get all interactive elements to inspect
  const allElements = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('button, a, input, img[onclick], td[onclick], div[onclick]'));
    return elements.map(el => ({
      tag: el.tagName,
      text: el.textContent?.trim().substring(0, 100),
      value: (el as HTMLInputElement).value,
      onclick: el.getAttribute('onclick'),
      title: el.getAttribute('title'),
      alt: el.getAttribute('alt'),
    })).filter(item =>
      item.text || item.value || item.onclick || item.title || item.alt
    );
  });

  console.log('Interactive elements containing "რეგისტრ":', allElements.filter(el =>
    el.text?.includes('რეგისტრ') ||
    el.value?.includes('რეგისტრ') ||
    el.onclick?.includes('რეგისტრ') ||
    el.title?.includes('რეგისტრ')
  ));

  // First, try to find any service in the table and click an edit/view button
  // This will open the modal with all tabs including Financial
  const editButtonSelectors = [
    'img[src*="edit"]',
    'img[alt*="რედაქტ"]',
    'a:has-text("რედაქტირება")',
    'button:has-text("რედაქტირება")',
    'img[onclick*="edit"]',
    'td[onclick*="edit"]',
  ];

  let buttonFound = false;
  for (const selector of editButtonSelectors) {
    const buttons = await page.locator(selector).all();
    if (buttons.length > 0) {
      console.log(`Found ${buttons.length} edit buttons with selector: ${selector}`);
      // Click the first one
      await buttons[0].click();
      buttonFound = true;
      break;
    }
  }

  if (!buttonFound) {
    console.log('Edit button not found, looking for table rows...');
    // Try clicking on a table row if it's clickable
    const tableRows = await page.locator('table tbody tr').all();
    if (tableRows.length > 0) {
      console.log(`Found ${tableRows.length} table rows, clicking first one...`);
      await tableRows[0].click();
      buttonFound = true;
    }
  }

  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/05-after-modal-open.png', fullPage: true });
  console.log('Clicked to open modal');
}

async function ensureFinancialTab(page: Page): Promise<void> {
  console.log('Ensuring Financial tab is active...');

  await page.screenshot({ path: 'screenshots/06-modal-opened.png', fullPage: true });

  // List all tabs to find the financial tab
  const tabs = await page.evaluate(() => {
    const tabElements = Array.from(document.querySelectorAll('button, a, li, div'));
    return tabElements
      .filter(el => {
        const text = el.textContent?.trim();
        return text && (
          text.includes('ფინანსური') ||
          text.includes('სახელფასო') ||
          text.includes('სამედიცინო') ||
          text.includes('აქრიმებები')
        );
      })
      .map(el => ({
        tag: el.tagName,
        text: el.textContent?.trim(),
        class: el.className,
      }));
  });

  console.log('Found tabs:', tabs);

  // Look for the ფინანსური tab
  const financialTabSelectors = [
    'text=ფინანსური',
    'button:has-text("ფინანსური")',
    'a:has-text("ფინანსური")',
    'li:has-text("ფინანსური")',
    '[onclick*="financial"]',
  ];

  let found = false;
  for (const selector of financialTabSelectors) {
    const tab = page.locator(selector).first();
    if (await tab.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log(`Clicking financial tab with selector: ${selector}`);
      await tab.click();
      await page.waitForTimeout(1000);
      found = true;
      break;
    }
  }

  if (!found) {
    console.log('Financial tab might already be active or not found');
  }

  await page.screenshot({ path: 'screenshots/07-financial-tab-active.png', fullPage: true });
  console.log('Financial tab ensured');
}

async function extractModalData(page: Page): Promise<ExtractedData> {
  console.log('Extracting modal data...');

  // Take screenshot of the modal
  await page.screenshot({ path: 'screenshots/08-financial-modal-final.png', fullPage: true });

  // Also save the HTML for reference
  const html = await page.content();
  const fs = require('fs');
  fs.writeFileSync('screenshots/modal-html.html', html);

  const data = await page.evaluate(() => {
    const result: Partial<ExtractedData> = {
      tabs: [],
      formFields: {} as any,
      tableColumns: [],
      tableData: [],
      buttons: [],
    };

    // Extract modal header
    const modalTitle = document.querySelector('.modal-title, .modal-header h3, .modal-header h4');
    if (modalTitle) {
      const text = modalTitle.textContent?.trim() || '';
      result.modalHeader = {
        serviceCode: text.split('-')[0]?.trim() || '',
        serviceName: text.split('-')[1]?.trim() || '',
      };
    }

    // Extract tabs
    const tabElements = document.querySelectorAll('.nav-tabs li, .tabs > *');
    tabElements.forEach((tab) => {
      const tabText = tab.textContent?.trim();
      if (tabText) {
        result.tabs!.push(tabText);
      }
    });

    // Extract form fields - Price Type
    const priceTypeSelect = document.querySelector('select[name*="price"], select[name*="ფას"]') as HTMLSelectElement;
    if (priceTypeSelect) {
      const label = document.querySelector(`label[for="${priceTypeSelect.id}"]`)?.textContent?.trim() ||
                    priceTypeSelect.previousElementSibling?.textContent?.trim() || 'ფასის ტიპი';

      const options = Array.from(priceTypeSelect.options).map((opt) => ({
        value: opt.value,
        text: opt.text,
      }));

      result.formFields!.priceType = {
        label,
        type: 'select',
        options,
      };
    }

    // Extract Currency field
    const currencySelect = document.querySelector('select[name*="currency"], select[name*="ვალუტა"]') as HTMLSelectElement;
    if (currencySelect) {
      const label = document.querySelector(`label[for="${currencySelect.id}"]`)?.textContent?.trim() ||
                    currencySelect.previousElementSibling?.textContent?.trim() || 'ვალუტა';

      const options = Array.from(currencySelect.options).map((opt) => ({
        value: opt.value,
        text: opt.text,
      }));

      result.formFields!.currency = {
        label,
        type: 'select',
        options,
      };
    }

    // Extract Date field
    const dateInput = document.querySelector('input[type="date"], input[name*="date"], input[name*="თარიღ"]') as HTMLInputElement;
    if (dateInput) {
      const label = document.querySelector(`label[for="${dateInput.id}"]`)?.textContent?.trim() ||
                    dateInput.previousElementSibling?.textContent?.trim() || 'თარიღი';

      result.formFields!.date = {
        label,
        type: dateInput.type,
      };
    }

    // Extract Price field
    const priceInput = document.querySelector('input[name*="price"], input[name*="ფას"]') as HTMLInputElement;
    if (priceInput && priceInput.type !== 'hidden') {
      const label = document.querySelector(`label[for="${priceInput.id}"]`)?.textContent?.trim() ||
                    priceInput.previousElementSibling?.textContent?.trim() || 'ფასი';

      result.formFields!.price = {
        label,
        type: priceInput.type,
      };
    }

    // Extract table columns
    const headerCells = document.querySelectorAll('table thead th, table tr:first-child td');
    headerCells.forEach((cell) => {
      const text = cell.textContent?.trim();
      if (text) {
        result.tableColumns!.push(text);
      }
    });

    // Extract table data
    const dataRows = document.querySelectorAll('table tbody tr');
    dataRows.forEach((row) => {
      const rowData: Record<string, string> = {};
      const cells = row.querySelectorAll('td');
      cells.forEach((cell, index) => {
        const columnName = result.tableColumns![index] || `Column ${index}`;
        rowData[columnName] = cell.textContent?.trim() || '';
      });
      result.tableData!.push(rowData);
    });

    // Extract buttons
    const buttonElements = document.querySelectorAll('button, input[type="button"], input[type="submit"]');
    buttonElements.forEach((btn) => {
      const text = btn.textContent?.trim() || (btn as HTMLInputElement).value || '';
      const type = btn.getAttribute('type') || 'button';
      const onclick = btn.getAttribute('onclick') || '';

      if (text) {
        result.buttons!.push({
          text,
          type,
          action: onclick,
        });
      }
    });

    return result as ExtractedData;
  });

  console.log('Data extraction complete');
  return data;
}

async function main() {
  let browser: Browser | null = null;

  try {
    console.log('Launching browser...');
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Login
    await login(page);

    // Navigate to nomenclature page
    await navigateToNomenclature(page);

    // Open registered services modal
    await openRegisteredServicesModal(page);

    // Ensure financial tab is active
    await ensureFinancialTab(page);

    // Extract data
    const data = await extractModalData(page);

    // Save extracted data
    const outputDir = path.join(process.cwd(), 'documentation', 'registered-services-modal');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'financial-tab-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

    console.log(`Data saved to: ${outputPath}`);
    console.log('\nExtracted data summary:');
    console.log(`- Tabs: ${data.tabs.length}`);
    console.log(`- Form fields: ${Object.keys(data.formFields).length}`);
    console.log(`- Table columns: ${data.tableColumns.length}`);
    console.log(`- Table rows: ${data.tableData.length}`);
    console.log(`- Buttons: ${data.buttons.length}`);

    // Keep browser open for manual inspection
    console.log('\nBrowser will remain open for manual inspection. Press Ctrl+C to close.');
    await page.waitForTimeout(60000);

  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main();
