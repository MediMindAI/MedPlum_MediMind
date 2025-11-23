#!/usr/bin/env npx tsx
/**
 * Playwright Background Server
 *
 * Keeps browser alive and accepts commands via a command file.
 *
 * Usage:
 *   # Terminal 1: Start server (keeps running)
 *   npx tsx scripts/playwright/server.ts
 *
 *   # Terminal 2: Send commands
 *   npx tsx scripts/playwright/cmd.ts navigate "http://example.com"
 *   npx tsx scripts/playwright/cmd.ts fill "#username" "cicig"
 *   npx tsx scripts/playwright/cmd.ts click "button[type=submit]"
 *   npx tsx scripts/playwright/cmd.ts screenshot "my-screenshot"
 *   npx tsx scripts/playwright/cmd.ts stop
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// File-based communication
const CMD_FILE = path.join(os.tmpdir(), 'playwright-cmd.json');
const RESULT_FILE = path.join(os.tmpdir(), 'playwright-result.json');
const PID_FILE = path.join(os.tmpdir(), 'playwright-server.pid');
const SCREENSHOT_DIR = path.join(process.cwd(), 'screenshots');

interface Command {
  id: string;
  action: string;
  args: string[];
  timestamp: number;
}

interface Result {
  id: string;
  success: boolean;
  data?: any;
  error?: string;
  timestamp: number;
}

let browser: Browser | null = null;
let context: BrowserContext | null = null;
let page: Page | null = null;
let lastCommandId = '';

async function initialize() {
  console.log('🚀 Starting Playwright Background Server...');

  // Check if already running
  if (fs.existsSync(PID_FILE)) {
    const pid = fs.readFileSync(PID_FILE, 'utf-8').trim();
    try {
      process.kill(parseInt(pid), 0); // Check if process exists
      console.error(`❌ Server already running (PID: ${pid})`);
      console.error('   Run: npx tsx scripts/playwright/cmd.ts stop');
      process.exit(1);
    } catch {
      // Process doesn't exist, clean up stale PID file
      fs.unlinkSync(PID_FILE);
    }
  }

  // Save PID
  fs.writeFileSync(PID_FILE, process.pid.toString());

  // Ensure screenshot directory exists
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  // Launch browser
  browser = await chromium.launch({
    headless: false, // Show browser window
    args: ['--no-first-run', '--no-default-browser-check'],
  });

  context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  });

  page = await context.newPage();

  // Clean up old command/result files
  if (fs.existsSync(CMD_FILE)) fs.unlinkSync(CMD_FILE);
  if (fs.existsSync(RESULT_FILE)) fs.unlinkSync(RESULT_FILE);

  console.log('✅ Browser ready!');
  console.log('📁 Command file:', CMD_FILE);
  console.log('📁 Result file:', RESULT_FILE);
  console.log('📁 Screenshots:', SCREENSHOT_DIR);
  console.log('');
  console.log('💡 Send commands using:');
  console.log('   npx tsx scripts/playwright/cmd.ts navigate "http://example.com"');
  console.log('   npx tsx scripts/playwright/cmd.ts fill "#selector" "value"');
  console.log('   npx tsx scripts/playwright/cmd.ts click "#selector"');
  console.log('   npx tsx scripts/playwright/cmd.ts screenshot "name"');
  console.log('   npx tsx scripts/playwright/cmd.ts stop');
  console.log('');
  console.log('⏳ Waiting for commands... (Ctrl+C to stop)');
}

async function processCommand(cmd: Command): Promise<Result> {
  const { id, action, args } = cmd;

  try {
    if (!page) throw new Error('No page available');

    let data: any = {};

    switch (action) {
      case 'navigate':
        const url = args[0];
        if (!url) throw new Error('URL required');
        await page.goto(url, { waitUntil: 'load', timeout: 30000 });
        data = { url: page.url(), title: await page.title() };
        console.log(`📍 Navigated to: ${data.url}`);
        break;

      case 'fill':
        const [selector, value] = args;
        if (!selector || value === undefined) throw new Error('Selector and value required');
        await page.fill(selector, value);
        data = { selector, filled: true };
        console.log(`✏️  Filled ${selector}`);
        break;

      case 'click':
        const clickSelector = args[0];
        if (!clickSelector) throw new Error('Selector required');
        await page.click(clickSelector);
        // Wait a bit for any navigation/loading
        await page.waitForTimeout(500);
        data = { selector: clickSelector, clicked: true, url: page.url() };
        console.log(`🖱️  Clicked ${clickSelector}`);
        break;

      case 'screenshot':
        const name = args[0] || `screenshot-${Date.now()}`;
        const screenshotPath = path.join(SCREENSHOT_DIR, `${name}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: args.includes('--fullpage') });
        data = { path: screenshotPath, name };
        console.log(`📸 Screenshot saved: ${screenshotPath}`);
        break;

      case 'wait':
        const waitMs = parseInt(args[0] || '1000');
        await page.waitForTimeout(waitMs);
        data = { waited: waitMs };
        console.log(`⏳ Waited ${waitMs}ms`);
        break;

      case 'waitfor':
        const waitSelector = args[0];
        if (!waitSelector) throw new Error('Selector required');
        await page.waitForSelector(waitSelector, { timeout: 10000 });
        data = { selector: waitSelector, found: true };
        console.log(`✅ Found ${waitSelector}`);
        break;

      case 'text':
        const textSelector = args[0];
        if (!textSelector) throw new Error('Selector required');
        const text = await page.textContent(textSelector);
        data = { selector: textSelector, text };
        console.log(`📝 Text: ${text?.substring(0, 50)}...`);
        break;

      case 'evaluate':
        const script = args[0];
        if (!script) throw new Error('Script required');
        const result = await page.evaluate(script);
        data = { result };
        console.log(`🔧 Evaluated script`);
        break;

      case 'url':
        data = { url: page.url(), title: await page.title() };
        console.log(`📍 Current URL: ${data.url}`);
        break;

      case 'stop':
        console.log('🛑 Stopping server...');
        await cleanup();
        process.exit(0);
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return { id, success: true, data, timestamp: Date.now() };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`❌ Error: ${errorMsg}`);
    return { id, success: false, error: errorMsg, timestamp: Date.now() };
  }
}

async function watchCommands() {
  // Poll for new commands
  setInterval(async () => {
    try {
      if (!fs.existsSync(CMD_FILE)) return;

      const content = fs.readFileSync(CMD_FILE, 'utf-8');
      const cmd: Command = JSON.parse(content);

      // Skip if we already processed this command
      if (cmd.id === lastCommandId) return;
      lastCommandId = cmd.id;

      // Process command
      const result = await processCommand(cmd);

      // Write result
      fs.writeFileSync(RESULT_FILE, JSON.stringify(result, null, 2));

      // Delete command file
      fs.unlinkSync(CMD_FILE);

    } catch (error) {
      // Ignore parse errors (file being written)
    }
  }, 100); // Check every 100ms
}

async function cleanup() {
  if (browser) {
    await browser.close();
    browser = null;
  }
  if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
  if (fs.existsSync(CMD_FILE)) fs.unlinkSync(CMD_FILE);
  console.log('🧹 Cleaned up');
}

// Handle shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await cleanup();
  process.exit(0);
});

// Main
async function main() {
  await initialize();
  await watchCommands();
}

main().catch(async (error) => {
  console.error('Fatal error:', error);
  await cleanup();
  process.exit(1);
});
