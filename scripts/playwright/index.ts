/**
 * Playwright Browser State Manager
 *
 * This module provides a singleton browser instance that persists across script calls.
 * State is stored in a temp file to allow multiple scripts to share the same browser session.
 *
 * Usage:
 *   import { getBrowser, getPage, saveBrowserState } from './index';
 *
 * Token Efficiency:
 *   - Unlike MCP which loads 10,000+ tokens upfront, this only loads when scripts run
 *   - State persisted to disk allows browser reuse across calls
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// State file location
const STATE_FILE = path.join(os.tmpdir(), 'playwright-state.json');
const CDP_FILE = path.join(os.tmpdir(), 'playwright-cdp.json');

interface BrowserState {
  wsEndpoint?: string;
  currentUrl?: string;
  isHeaded?: boolean;
  launchedAt?: string;
}

// Module-level browser instance (for same-process reuse)
let browserInstance: Browser | null = null;
let contextInstance: BrowserContext | null = null;
let pageInstance: Page | null = null;

/**
 * Load browser state from disk
 */
export function loadState(): BrowserState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    }
  } catch {
    // State file corrupted or doesn't exist
  }
  return {};
}

/**
 * Save browser state to disk
 */
export function saveState(state: BrowserState): void {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

/**
 * Clear browser state
 */
export function clearState(): void {
  try {
    if (fs.existsSync(STATE_FILE)) fs.unlinkSync(STATE_FILE);
    if (fs.existsSync(CDP_FILE)) fs.unlinkSync(CDP_FILE);
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Launch a new browser or connect to existing one
 */
export async function getBrowser(options: {
  headed?: boolean;
  forceNew?: boolean;
} = {}): Promise<Browser> {
  const { headed = true, forceNew = false } = options;

  // Return existing instance if available
  if (browserInstance && browserInstance.isConnected() && !forceNew) {
    return browserInstance;
  }

  // Use persistent context with user data directory
  // This keeps cookies, session storage, and login state across script calls
  const userDataDir = path.join(os.tmpdir(), 'playwright-user-data');

  // Ensure user data directory exists
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }

  // Launch persistent context
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: !headed,
    args: [
      '--no-first-run',
      '--no-default-browser-check',
    ],
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  });

  // Store context as browser (they share similar APIs for our use)
  browserInstance = context.browser() as Browser;
  contextInstance = context;

  // Get or create page
  const pages = context.pages();
  if (pages.length > 0) {
    pageInstance = pages[0];
  } else {
    pageInstance = await context.newPage();
  }

  saveState({
    wsEndpoint: 'persistent',
    isHeaded: headed,
    launchedAt: new Date().toISOString(),
  });

  console.error('[playwright] Launched new browser');
  return browserInstance;
}

/**
 * Get the current page, creating one if needed
 */
export async function getPage(options: {
  headed?: boolean;
  forceNew?: boolean;
} = {}): Promise<Page> {
  // getBrowser now also sets up pageInstance for persistent context
  await getBrowser(options);
  const state = loadState();

  // Return existing page if available (same process)
  if (pageInstance && !pageInstance.isClosed()) {
    // Navigate to stored URL if page is on blank page
    const currentUrl = pageInstance.url();
    if (currentUrl === 'about:blank' && state.currentUrl && state.currentUrl !== 'about:blank') {
      console.error(`[playwright] Navigating to stored URL: ${state.currentUrl}`);
      await pageInstance.goto(state.currentUrl, { waitUntil: 'load' });
    }
    return pageInstance;
  }

  // This shouldn't happen with persistent context, but fallback
  if (contextInstance) {
    const pages = contextInstance.pages();
    if (pages.length > 0) {
      pageInstance = pages[0];
    } else {
      pageInstance = await contextInstance.newPage();
    }

    // Navigate to stored URL if we have one
    if (state.currentUrl && state.currentUrl !== 'about:blank') {
      console.error(`[playwright] Navigating to stored URL: ${state.currentUrl}`);
      await pageInstance.goto(state.currentUrl, { waitUntil: 'load' });
    }
  }

  if (!pageInstance) {
    throw new Error('Failed to get page - no context available');
  }

  return pageInstance;
}

/**
 * Close browser and cleanup
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    try {
      await browserInstance.close();
    } catch {
      // Browser may already be closed
    }
    browserInstance = null;
    contextInstance = null;
    pageInstance = null;
  }
  clearState();
  console.error('[playwright] Browser closed');
}

/**
 * Get current page URL
 */
export async function getCurrentUrl(): Promise<string | null> {
  if (pageInstance && !pageInstance.isClosed()) {
    return pageInstance.url();
  }
  return loadState().currentUrl || null;
}

/**
 * Update state with current URL
 */
export async function updateCurrentUrl(url: string): Promise<void> {
  const state = loadState();
  state.currentUrl = url;
  saveState(state);
}

/**
 * Output helper - formats response for Claude consumption
 * Keeps output minimal to conserve tokens
 */
export function output(data: Record<string, unknown>): void {
  console.log(JSON.stringify(data, null, 2));
}

/**
 * Error output helper
 */
export function outputError(error: string, details?: Record<string, unknown>): void {
  console.log(JSON.stringify({ error, ...details }, null, 2));
  process.exit(1);
}
