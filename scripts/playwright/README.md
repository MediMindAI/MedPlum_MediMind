# Playwright Scripts (MCP-Free Browser Automation)

Token-efficient browser automation scripts that replace MCP Playwright tools.

## Why Scripts Instead of MCP?

| Approach | Initial Token Cost | Per-Operation Cost |
|----------|-------------------|-------------------|
| **MCP** | ~10,000+ tokens (all tool schemas load upfront) | Output only |
| **Scripts** | ~100 tokens (skill metadata only) | Output only |

**Result: ~99% reduction in baseline token consumption**

## Quick Start

```bash
# Install Playwright (one-time)
npm run playwright:install

# Navigate to a page
npx tsx scripts/playwright/navigate.ts "https://example.com"

# Take a screenshot
npx tsx scripts/playwright/screenshot.ts

# Close browser when done
npx tsx scripts/playwright/close.ts
```

## Available Scripts

| Script | Description | Example |
|--------|-------------|---------|
| `navigate.ts` | Go to URL | `npx tsx scripts/playwright/navigate.ts "https://google.com"` |
| `screenshot.ts` | Capture page | `npx tsx scripts/playwright/screenshot.ts --fullpage` |
| `snapshot.ts` | Get accessibility tree | `npx tsx scripts/playwright/snapshot.ts --interesting-only` |
| `click.ts` | Click element | `npx tsx scripts/playwright/click.ts "button#submit"` |
| `fill.ts` | Fill input | `npx tsx scripts/playwright/fill.ts "#email" "test@example.com"` |
| `evaluate.ts` | Run JS | `npx tsx scripts/playwright/evaluate.ts "document.title"` |
| `wait.ts` | Wait for condition | `npx tsx scripts/playwright/wait.ts --selector "#loaded"` |
| `extract.ts` | Extract data | `npx tsx scripts/playwright/extract.ts --table "#data"` |
| `close.ts` | Close browser | `npx tsx scripts/playwright/close.ts` |

## State Management

- Browser persists across script calls within a session
- State file: `/tmp/playwright-state.json`
- Screenshots: `/tmp/playwright-screenshots/`

## Claude Skill Integration

See `.claude/skills/playwright/SKILL.md` for full documentation loaded by Claude on-demand.

## Common Workflows

### Login Flow
```bash
npx tsx scripts/playwright/navigate.ts "https://app.example.com/login"
npx tsx scripts/playwright/fill.ts "#username" "myuser"
npx tsx scripts/playwright/fill.ts "#password" "mypass"
npx tsx scripts/playwright/click.ts "button[type=submit]"
npx tsx scripts/playwright/wait.ts --url "dashboard"
```

### Web Scraping
```bash
npx tsx scripts/playwright/navigate.ts "https://example.com/data" --wait networkidle
npx tsx scripts/playwright/extract.ts --table "#data-table"
```

### Screenshot Documentation
```bash
npx tsx scripts/playwright/navigate.ts "https://app.example.com"
npx tsx scripts/playwright/screenshot.ts --fullpage --name "homepage"
npx tsx scripts/playwright/close.ts
```
