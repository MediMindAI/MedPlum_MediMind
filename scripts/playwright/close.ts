#!/usr/bin/env npx tsx
/**
 * Close the browser and clean up
 *
 * Usage:
 *   npx tsx scripts/playwright/close.ts
 *
 * This closes the browser instance and clears all state files.
 * Use this when you're done with browser automation to free resources.
 *
 * Output (JSON):
 *   { success, message }
 */

import { closeBrowser, loadState, output } from './index';

async function main() {
  try {
    const state = loadState();
    const wasRunning = !!state.wsEndpoint || !!state.launchedAt;

    await closeBrowser();

    output({
      success: true,
      message: wasRunning
        ? 'Browser closed and state cleared'
        : 'No browser was running, state cleared',
      previousUrl: state.currentUrl || null,
    });
  } catch (error) {
    // Even if close fails, output success since browser is likely already closed
    output({
      success: true,
      message: 'Browser cleanup completed',
      note: error instanceof Error ? error.message : 'Unknown error during cleanup',
    });
  }
}

main();
