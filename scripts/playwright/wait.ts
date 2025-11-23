#!/usr/bin/env npx tsx
/**
 * Wait for various conditions on the page
 *
 * Usage:
 *   npx tsx scripts/playwright/wait.ts --selector "#loading" --state hidden
 *   npx tsx scripts/playwright/wait.ts --selector ".modal" --state visible
 *   npx tsx scripts/playwright/wait.ts --text "Loading complete"
 *   npx tsx scripts/playwright/wait.ts --navigation
 *   npx tsx scripts/playwright/wait.ts --network
 *
 * Options:
 *   --selector <sel>     Wait for element selector
 *   --state <state>      Element state: visible, hidden, attached, detached (default: visible)
 *   --text <text>        Wait for text to appear on page
 *   --navigation         Wait for navigation to complete
 *   --network            Wait for network to be idle
 *   --timeout <ms>       Wait timeout (default: 30000)
 *   --url <pattern>      Wait for URL to match pattern (regex)
 *
 * Output (JSON):
 *   { success, waited, duration }
 */

import { getPage, output, outputError } from './index';

async function main() {
  const args = process.argv.slice(2);

  // Parse options
  const selector = getArgValue(args, '--selector', '');
  const state = getArgValue(args, '--state', 'visible') as 'visible' | 'hidden' | 'attached' | 'detached';
  const text = getArgValue(args, '--text', '');
  const waitForNavigation = args.includes('--navigation');
  const waitForNetwork = args.includes('--network');
  const timeout = parseInt(getArgValue(args, '--timeout', '30000'), 10);
  const urlPattern = getArgValue(args, '--url', '');

  // Validate at least one wait condition
  if (!selector && !text && !waitForNavigation && !waitForNetwork && !urlPattern) {
    outputError('Wait condition required', {
      usage: 'npx tsx scripts/playwright/wait.ts --selector "#element"',
      options: [
        '--selector "#element" --state visible',
        '--text "Success message"',
        '--navigation',
        '--network',
        '--url "dashboard"',
      ],
    });
    return;
  }

  try {
    const page = await getPage();
    const currentUrl = page.url();

    if (currentUrl === 'about:blank' && !waitForNavigation) {
      outputError('No page loaded. Navigate to a URL first.', {
        hint: 'npx tsx scripts/playwright/navigate.ts "https://example.com"',
      });
      return;
    }

    const startTime = Date.now();
    let waitedFor = '';

    // Wait based on condition
    if (selector) {
      const locator = page.locator(selector);
      await locator.waitFor({ state, timeout });
      waitedFor = `selector "${selector}" to be ${state}`;
    } else if (text) {
      await page.getByText(text).waitFor({ state: 'visible', timeout });
      waitedFor = `text "${text}" to appear`;
    } else if (waitForNavigation) {
      await page.waitForNavigation({ timeout });
      waitedFor = 'navigation to complete';
    } else if (waitForNetwork) {
      await page.waitForLoadState('networkidle', { timeout });
      waitedFor = 'network to be idle';
    } else if (urlPattern) {
      await page.waitForURL(new RegExp(urlPattern), { timeout });
      waitedFor = `URL to match "${urlPattern}"`;
    }

    const duration = Date.now() - startTime;

    output({
      success: true,
      waited: waitedFor,
      duration: `${duration}ms`,
      url: page.url(),
      urlChanged: page.url() !== currentUrl,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Wait failed';

    // Check if it's a timeout error
    if (errorMessage.includes('Timeout')) {
      outputError(`Timeout waiting for condition`, {
        timeout: `${timeout}ms`,
        selector,
        text,
        state,
      });
    } else {
      outputError(errorMessage, { selector, text, timeout });
    }
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
