#!/usr/bin/env npx tsx
/**
 * Send command to Playwright Background Server
 *
 * Usage:
 *   npx tsx scripts/playwright/cmd.ts navigate "http://example.com"
 *   npx tsx scripts/playwright/cmd.ts fill "#username" "cicig"
 *   npx tsx scripts/playwright/cmd.ts fill "#password" "Tsotne2011"
 *   npx tsx scripts/playwright/cmd.ts click "button[type=submit]"
 *   npx tsx scripts/playwright/cmd.ts screenshot "after-login"
 *   npx tsx scripts/playwright/cmd.ts wait 2000
 *   npx tsx scripts/playwright/cmd.ts waitfor ".dashboard"
 *   npx tsx scripts/playwright/cmd.ts url
 *   npx tsx scripts/playwright/cmd.ts stop
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const CMD_FILE = path.join(os.tmpdir(), 'playwright-cmd.json');
const RESULT_FILE = path.join(os.tmpdir(), 'playwright-result.json');
const PID_FILE = path.join(os.tmpdir(), 'playwright-server.pid');

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

function generateId(): string {
  return `cmd-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

async function waitForResult(commandId: string, timeoutMs = 30000): Promise<Result> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (fs.existsSync(RESULT_FILE)) {
      try {
        const content = fs.readFileSync(RESULT_FILE, 'utf-8');
        const result: Result = JSON.parse(content);

        if (result.id === commandId) {
          // Delete result file after reading
          fs.unlinkSync(RESULT_FILE);
          return result;
        }
      } catch {
        // File being written, retry
      }
    }

    // Wait 50ms before checking again
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  throw new Error('Timeout waiting for server response');
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Playwright Command Sender

Usage:
  npx tsx scripts/playwright/cmd.ts <action> [args...]

Actions:
  navigate <url>           Navigate to URL
  fill <selector> <value>  Fill input field
  click <selector>         Click element
  screenshot <name>        Take screenshot
  wait <ms>                Wait milliseconds
  waitfor <selector>       Wait for element
  text <selector>          Get text content
  url                      Get current URL
  evaluate <script>        Run JavaScript
  stop                     Stop the server

Examples:
  npx tsx scripts/playwright/cmd.ts navigate "http://example.com"
  npx tsx scripts/playwright/cmd.ts fill "#username" "admin"
  npx tsx scripts/playwright/cmd.ts click "button[type=submit]"
  npx tsx scripts/playwright/cmd.ts screenshot "my-page"
`);
    process.exit(0);
  }

  // Check if server is running
  if (!fs.existsSync(PID_FILE)) {
    console.error('❌ Server not running!');
    console.error('   Start it first: npx tsx scripts/playwright/server.ts');
    process.exit(1);
  }

  const pid = fs.readFileSync(PID_FILE, 'utf-8').trim();
  try {
    process.kill(parseInt(pid), 0);
  } catch {
    console.error('❌ Server not running (stale PID file)');
    console.error('   Start it: npx tsx scripts/playwright/server.ts');
    fs.unlinkSync(PID_FILE);
    process.exit(1);
  }

  const action = args[0];
  const commandArgs = args.slice(1);

  const command: Command = {
    id: generateId(),
    action,
    args: commandArgs,
    timestamp: Date.now(),
  };

  // Write command
  fs.writeFileSync(CMD_FILE, JSON.stringify(command, null, 2));

  // Wait for result
  try {
    const result = await waitForResult(command.id);

    if (result.success) {
      console.log(JSON.stringify(result.data, null, 2));
    } else {
      console.error(JSON.stringify({ error: result.error }, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, null, 2));
    process.exit(1);
  }
}

main();
