#!/usr/bin/env npx tsx
/**
 * Take a screenshot of the current page
 *
 * Usage:
 *   npx tsx scripts/playwright/screenshot.ts
 *   npx tsx scripts/playwright/screenshot.ts --name "my-screenshot"
 *   npx tsx scripts/playwright/screenshot.ts --fullpage
 *   npx tsx scripts/playwright/screenshot.ts --selector "#main-content"
 *
 * Options:
 *   --name <name>      Screenshot filename (without extension)
 *   --fullpage         Capture full scrollable page (default: viewport only)
 *   --selector <sel>   Capture specific element only
 *   --quality <1-100>  JPEG quality (default: 80, only for JPEG)
 *   --format <fmt>     png or jpeg (default: png)
 *
 * Output (JSON):
 *   { path, width, height, format }
 */

import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { getPage, output, outputError } from './index';

async function main() {
  const args = process.argv.slice(2);

  // Parse options
  const name = getArgValue(args, '--name', `screenshot-${Date.now()}`);
  const fullPage = args.includes('--fullpage');
  const selector = getArgValue(args, '--selector', '');
  const quality = parseInt(getArgValue(args, '--quality', '80'), 10);
  const format = getArgValue(args, '--format', 'png') as 'png' | 'jpeg';

  // Ensure screenshots directory exists
  const screenshotsDir = path.join(os.tmpdir(), 'playwright-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const filePath = path.join(screenshotsDir, `${name}.${format}`);

  try {
    const page = await getPage();
    const currentUrl = page.url();

    if (currentUrl === 'about:blank') {
      outputError('No page loaded. Navigate to a URL first.', {
        hint: 'npx tsx scripts/playwright/navigate.ts "https://example.com"',
      });
      return;
    }

    let screenshotBuffer: Buffer;

    if (selector) {
      // Screenshot specific element
      const element = await page.$(selector);
      if (!element) {
        outputError(`Element not found: ${selector}`, { currentUrl });
        return;
      }
      screenshotBuffer = await element.screenshot({
        type: format,
        quality: format === 'jpeg' ? quality : undefined,
      });
    } else {
      // Screenshot page
      screenshotBuffer = await page.screenshot({
        path: filePath,
        fullPage,
        type: format,
        quality: format === 'jpeg' ? quality : undefined,
      });
    }

    // Save to file
    fs.writeFileSync(filePath, screenshotBuffer);

    // Get viewport size
    const viewport = page.viewportSize();

    output({
      success: true,
      path: filePath,
      url: currentUrl,
      width: viewport?.width ?? null,
      height: viewport?.height ?? null,
      format,
      fullPage,
      selector: selector || null,
    });
  } catch (error) {
    outputError(
      error instanceof Error ? error.message : 'Screenshot failed',
      { name, format, fullPage }
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
