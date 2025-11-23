#!/usr/bin/env npx tsx
/**
 * Fill an input field or textarea
 *
 * Usage:
 *   npx tsx scripts/playwright/fill.ts "#email" "user@example.com"
 *   npx tsx scripts/playwright/fill.ts --label "Email" "user@example.com"
 *   npx tsx scripts/playwright/fill.ts --placeholder "Enter email" "user@example.com"
 *   npx tsx scripts/playwright/fill.ts "#password" "secret123" --clear
 *
 * Options:
 *   --label <text>        Find input by its label text
 *   --placeholder <text>  Find input by placeholder text
 *   --clear               Clear field before typing (default: true)
 *   --no-clear            Don't clear, append to existing value
 *   --press-enter         Press Enter after filling
 *   --timeout <ms>        Wait timeout (default: 5000)
 *
 * Output (JSON):
 *   { success, selector, value, url }
 */

import { getPage, output, outputError } from './index';

async function main() {
  const args = process.argv.slice(2);

  // Parse selector and value
  const nonFlagArgs = args.filter((arg) => !arg.startsWith('--'));
  let selector = nonFlagArgs[0] || '';
  const value = nonFlagArgs[1] || '';

  // Parse options
  const label = getArgValue(args, '--label', '');
  const placeholder = getArgValue(args, '--placeholder', '');
  const timeout = parseInt(getArgValue(args, '--timeout', '5000'), 10);
  const shouldClear = !args.includes('--no-clear');
  const pressEnter = args.includes('--press-enter');

  // Build selector from options
  if (label && !selector) {
    selector = `label=${label}`;
  } else if (placeholder && !selector) {
    selector = `placeholder=${placeholder}`;
  }

  if (!selector) {
    outputError('Selector required', {
      usage: 'npx tsx scripts/playwright/fill.ts "#email" "user@example.com"',
      alternatives: [
        '--label "Email Address"',
        '--placeholder "Enter email"',
        '"input[name=email]"',
      ],
    });
    return;
  }

  if (value === undefined || value === '') {
    outputError('Value required', {
      usage: 'npx tsx scripts/playwright/fill.ts "#email" "user@example.com"',
    });
    return;
  }

  try {
    const page = await getPage();
    const currentUrl = page.url();

    if (currentUrl === 'about:blank') {
      outputError('No page loaded. Navigate to a URL first.', {
        hint: 'npx tsx scripts/playwright/navigate.ts "https://example.com"',
      });
      return;
    }

    // Build locator based on selector type
    let locator;
    if (selector.startsWith('label=')) {
      const labelText = selector.replace('label=', '');
      locator = page.getByLabel(labelText);
    } else if (selector.startsWith('placeholder=')) {
      const placeholderText = selector.replace('placeholder=', '');
      locator = page.getByPlaceholder(placeholderText);
    } else {
      locator = page.locator(selector);
    }

    // Wait for element to be visible
    await locator.waitFor({ state: 'visible', timeout });

    // Clear and fill
    if (shouldClear) {
      await locator.clear();
    }
    await locator.fill(value);

    // Optionally press Enter
    if (pressEnter) {
      await locator.press('Enter');
      // Wait for potential navigation
      await page.waitForTimeout(500);
    }

    output({
      success: true,
      selector,
      value,
      cleared: shouldClear,
      pressedEnter: pressEnter,
      url: page.url(),
      urlChanged: page.url() !== currentUrl,
    });
  } catch (error) {
    outputError(
      error instanceof Error ? error.message : 'Fill failed',
      { selector, value, timeout }
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
