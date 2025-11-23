#!/usr/bin/env npx tsx
/**
 * Execute JavaScript in the page context
 *
 * Usage:
 *   npx tsx scripts/playwright/evaluate.ts "document.title"
 *   npx tsx scripts/playwright/evaluate.ts "window.localStorage.getItem('token')"
 *   npx tsx scripts/playwright/evaluate.ts "document.querySelectorAll('a').length"
 *   npx tsx scripts/playwright/evaluate.ts --file "./my-script.js"
 *
 * Options:
 *   --file <path>     Execute JavaScript from a file instead of inline
 *   --stringify       Force JSON.stringify on result (for complex objects)
 *
 * Output (JSON):
 *   { success, result, type }
 *
 * Note: The expression should be a valid JavaScript expression.
 * For multi-line scripts, use --file option.
 */

import * as fs from 'fs';
import { getPage, output, outputError } from './index';

async function main() {
  const args = process.argv.slice(2);

  // Parse expression (first non-flag argument) or file
  const expression = args.find((arg) => !arg.startsWith('--'));
  const filePath = getArgValue(args, '--file', '');
  const stringify = args.includes('--stringify');

  // Get code to execute
  let code = expression || '';

  if (filePath) {
    if (!fs.existsSync(filePath)) {
      outputError(`File not found: ${filePath}`, {});
      return;
    }
    code = fs.readFileSync(filePath, 'utf-8');
  }

  if (!code) {
    outputError('JavaScript expression required', {
      usage: 'npx tsx scripts/playwright/evaluate.ts "document.title"',
      examples: [
        '"document.querySelectorAll(\'button\').length"',
        '"window.location.href"',
        '--file "./my-script.js"',
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

    // Execute the JavaScript
    const result = await page.evaluate((codeToRun) => {
      // eslint-disable-next-line no-eval
      return eval(codeToRun);
    }, code);

    // Determine result type
    const resultType = result === null ? 'null' : typeof result;

    // Format result
    let formattedResult = result;
    if (stringify && typeof result === 'object' && result !== null) {
      try {
        formattedResult = JSON.stringify(result, null, 2);
      } catch {
        formattedResult = String(result);
      }
    }

    output({
      success: true,
      result: formattedResult,
      type: resultType,
      url: currentUrl,
    });
  } catch (error) {
    outputError(
      error instanceof Error ? error.message : 'Evaluation failed',
      { code: code.substring(0, 100) + (code.length > 100 ? '...' : '') }
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
