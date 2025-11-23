#!/usr/bin/env npx tsx
/**
 * Navigate to a URL
 *
 * Usage:
 *   npx tsx scripts/playwright/navigate.ts "https://example.com"
 *   npx tsx scripts/playwright/navigate.ts "https://example.com" --wait networkidle
 *
 * Options:
 *   --wait <state>   Wait until: load, domcontentloaded, networkidle (default: load)
 *   --timeout <ms>   Navigation timeout in milliseconds (default: 30000)
 *   --headless       Run in headless mode (default: headed)
 *
 * Output (JSON):
 *   { url, title, status }
 */

import { getPage, updateCurrentUrl, output, outputError } from './index';

async function main() {
  const args = process.argv.slice(2);

  // Parse URL (first non-flag argument)
  const url = args.find((arg) => !arg.startsWith('--'));
  if (!url) {
    outputError('URL required', { usage: 'npx tsx scripts/playwright/navigate.ts "https://example.com"' });
    return;
  }

  // Parse options
  const waitUntil = getArgValue(args, '--wait', 'load') as 'load' | 'domcontentloaded' | 'networkidle';
  const timeout = parseInt(getArgValue(args, '--timeout', '30000'), 10);
  const headless = args.includes('--headless');

  try {
    const page = await getPage({ headed: !headless });

    // Navigate to URL
    const response = await page.goto(url, {
      waitUntil,
      timeout,
    });

    // Update state with current URL
    await updateCurrentUrl(page.url());

    // Get page title
    const title = await page.title();

    output({
      success: true,
      url: page.url(),
      title,
      status: response?.status() ?? null,
      waitUntil,
    });
  } catch (error) {
    outputError(
      error instanceof Error ? error.message : 'Navigation failed',
      { url, waitUntil, timeout }
    );
  }
}

function getArgValue(args: string[], flag: string, defaultValue: string): string {
  const index = args.indexOf(flag);
  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1];
  }
  return defaultValue;
}

main();
