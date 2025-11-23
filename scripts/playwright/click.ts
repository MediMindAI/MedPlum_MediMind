#!/usr/bin/env npx tsx
/**
 * Click an element on the page
 *
 * Usage:
 *   npx tsx scripts/playwright/click.ts "button:has-text('Submit')"
 *   npx tsx scripts/playwright/click.ts "#login-button"
 *   npx tsx scripts/playwright/click.ts --text "Sign In"
 *   npx tsx scripts/playwright/click.ts --role button --name "Submit"
 *
 * Options:
 *   --text <text>        Click element containing this text
 *   --role <role>        Click by ARIA role (button, link, textbox, etc.)
 *   --name <name>        Accessible name (used with --role)
 *   --timeout <ms>       Wait timeout (default: 5000)
 *   --force              Force click even if element is not visible
 *   --double             Double-click instead of single click
 *   --right              Right-click (context menu)
 *
 * Output (JSON):
 *   { success, selector, url }
 */

import { getPage, output, outputError } from './index';

async function main() {
  const args = process.argv.slice(2);

  // Parse selector (first non-flag argument)
  const selectorArg = args.find((arg) => !arg.startsWith('--'));

  // Parse options
  const text = getArgValue(args, '--text', '');
  const role = getArgValue(args, '--role', '');
  const name = getArgValue(args, '--name', '');
  const timeout = parseInt(getArgValue(args, '--timeout', '5000'), 10);
  const force = args.includes('--force');
  const double = args.includes('--double');
  const right = args.includes('--right');

  // Build selector based on options
  let selector = selectorArg || '';

  if (text && !selector) {
    selector = `text=${text}`;
  } else if (role) {
    // Use getByRole locator
    selector = `role=${role}`;
    if (name) {
      selector = `role=${role}[name="${name}"]`;
    }
  }

  if (!selector) {
    outputError('Selector required', {
      usage: 'npx tsx scripts/playwright/click.ts "button#submit"',
      alternatives: [
        '--text "Click me"',
        '--role button --name "Submit"',
        '"#element-id"',
        '".class-name"',
      ],
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
    if (selector.startsWith('role=')) {
      const roleMatch = selector.match(/role=(\w+)(?:\[name="([^"]+)"\])?/);
      if (roleMatch) {
        const [, roleType, roleName] = roleMatch;
        locator = page.getByRole(roleType as any, roleName ? { name: roleName } : undefined);
      }
    } else if (selector.startsWith('text=')) {
      const textContent = selector.replace('text=', '');
      locator = page.getByText(textContent);
    } else {
      locator = page.locator(selector);
    }

    if (!locator) {
      outputError('Invalid selector format', { selector });
      return;
    }

    // Wait for element to be visible (unless force)
    if (!force) {
      await locator.waitFor({ state: 'visible', timeout });
    }

    // Perform click action
    const clickOptions = { force, timeout };

    if (double) {
      await locator.dblclick(clickOptions);
    } else if (right) {
      await locator.click({ ...clickOptions, button: 'right' });
    } else {
      await locator.click(clickOptions);
    }

    // Wait a moment for any navigation/updates
    await page.waitForTimeout(100);

    output({
      success: true,
      selector,
      action: double ? 'double-click' : right ? 'right-click' : 'click',
      url: page.url(),
      urlChanged: page.url() !== currentUrl,
    });
  } catch (error) {
    outputError(
      error instanceof Error ? error.message : 'Click failed',
      { selector, timeout }
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
