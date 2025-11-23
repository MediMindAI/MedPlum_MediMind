#!/usr/bin/env npx tsx
/**
 * Extract data from the current page
 *
 * Usage:
 *   npx tsx scripts/playwright/extract.ts --text "#main-content"
 *   npx tsx scripts/playwright/extract.ts --html ".article-body"
 *   npx tsx scripts/playwright/extract.ts --attr href "a.download-link"
 *   npx tsx scripts/playwright/extract.ts --all ".product-item" --attr data-id
 *   npx tsx scripts/playwright/extract.ts --table "#data-table"
 *
 * Options:
 *   --text <selector>     Extract text content from element
 *   --html <selector>     Extract HTML content from element
 *   --attr <name> <sel>   Extract attribute value (e.g., href, src, data-*)
 *   --all <selector>      Extract from all matching elements (returns array)
 *   --table <selector>    Extract table data as JSON array
 *   --links               Extract all links from page
 *   --forms               Extract all form inputs from page
 *
 * Output (JSON):
 *   { success, data, count }
 */

import { getPage, output, outputError } from './index';

async function main() {
  const args = process.argv.slice(2);

  // Parse options
  const textSelector = getArgValue(args, '--text', '');
  const htmlSelector = getArgValue(args, '--html', '');
  const attrName = getArgValue(args, '--attr', '');
  const attrSelector = attrName ? getNextArg(args, '--attr', 1) : '';
  const allSelector = getArgValue(args, '--all', '');
  const tableSelector = getArgValue(args, '--table', '');
  const extractLinks = args.includes('--links');
  const extractForms = args.includes('--forms');

  try {
    const page = await getPage();
    const currentUrl = page.url();

    if (currentUrl === 'about:blank') {
      outputError('No page loaded. Navigate to a URL first.', {
        hint: 'npx tsx scripts/playwright/navigate.ts "https://example.com"',
      });
      return;
    }

    let data: unknown;
    let count = 1;

    if (textSelector) {
      data = await page.locator(textSelector).textContent();
    } else if (htmlSelector) {
      data = await page.locator(htmlSelector).innerHTML();
    } else if (attrName && attrSelector) {
      if (allSelector) {
        const elements = await page.locator(allSelector).all();
        data = await Promise.all(elements.map((el) => el.getAttribute(attrName)));
        count = (data as unknown[]).length;
      } else {
        data = await page.locator(attrSelector).getAttribute(attrName);
      }
    } else if (allSelector) {
      const elements = await page.locator(allSelector).all();
      data = await Promise.all(elements.map((el) => el.textContent()));
      count = (data as unknown[]).length;
    } else if (tableSelector) {
      data = await extractTableData(page, tableSelector);
      count = (data as unknown[]).length;
    } else if (extractLinks) {
      data = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]')).map((a) => ({
          text: a.textContent?.trim() || '',
          href: (a as HTMLAnchorElement).href,
        }));
      });
      count = (data as unknown[]).length;
    } else if (extractForms) {
      data = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('input, select, textarea')).map((el) => ({
          tag: el.tagName.toLowerCase(),
          type: (el as HTMLInputElement).type || null,
          name: (el as HTMLInputElement).name || null,
          id: el.id || null,
          placeholder: (el as HTMLInputElement).placeholder || null,
          value: (el as HTMLInputElement).value || null,
        }));
      });
      count = (data as unknown[]).length;
    } else {
      outputError('Extraction type required', {
        usage: 'npx tsx scripts/playwright/extract.ts --text "#content"',
        options: [
          '--text "#selector"',
          '--html "#selector"',
          '--attr href "a.link"',
          '--all ".items" --attr data-id',
          '--table "#data-table"',
          '--links',
          '--forms',
        ],
      });
      return;
    }

    output({
      success: true,
      data,
      count,
      url: currentUrl,
    });
  } catch (error) {
    outputError(
      error instanceof Error ? error.message : 'Extraction failed',
      { textSelector, htmlSelector, attrName, allSelector }
    );
  }
}

async function extractTableData(page: import('playwright').Page, selector: string): Promise<Record<string, string>[]> {
  return page.evaluate((sel) => {
    const table = document.querySelector(sel);
    if (!table) return [];

    const rows = Array.from(table.querySelectorAll('tr'));
    if (rows.length === 0) return [];

    // Get headers from first row
    const headerRow = rows[0];
    const headers = Array.from(headerRow.querySelectorAll('th, td')).map(
      (cell) => cell.textContent?.trim() || ''
    );

    // Extract data rows
    return rows.slice(1).map((row) => {
      const cells = Array.from(row.querySelectorAll('td'));
      const rowData: Record<string, string> = {};
      cells.forEach((cell, index) => {
        const header = headers[index] || `col${index}`;
        rowData[header] = cell.textContent?.trim() || '';
      });
      return rowData;
    });
  }, selector);
}

function getArgValue(args: string[], flag: string, defaultValue: string): string {
  const index = args.indexOf(flag);
  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1];
  }
  return defaultValue;
}

function getNextArg(args: string[], flag: string, offset: number): string {
  const index = args.indexOf(flag);
  if (index !== -1 && index + 1 + offset < args.length) {
    return args[index + 1 + offset];
  }
  return '';
}

main();
