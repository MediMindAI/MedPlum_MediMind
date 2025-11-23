#!/usr/bin/env npx tsx
/**
 * Get accessibility tree snapshot of the current page
 *
 * This is crucial for element selection - returns a structured view of
 * interactive elements with their accessible names and roles.
 *
 * Usage:
 *   npx tsx scripts/playwright/snapshot.ts
 *   npx tsx scripts/playwright/snapshot.ts --root "#main"
 *   npx tsx scripts/playwright/snapshot.ts --interesting-only
 *
 * Options:
 *   --root <selector>    Root element for snapshot (default: entire page)
 *   --interesting-only   Only show interactive elements (buttons, links, inputs)
 *   --max-depth <n>      Maximum depth to traverse (default: 10)
 *
 * Output (JSON):
 *   { url, snapshot: AccessibilityNode[] }
 *
 * Each node contains: role, name, value, children, etc.
 */

import { getPage, output, outputError } from './index';

interface AccessibilityNode {
  role: string;
  name?: string;
  value?: string;
  description?: string;
  checked?: boolean | 'mixed';
  disabled?: boolean;
  expanded?: boolean;
  focused?: boolean;
  pressed?: boolean | 'mixed';
  selected?: boolean;
  children?: AccessibilityNode[];
}

async function main() {
  const args = process.argv.slice(2);

  // Parse options
  const rootSelector = getArgValue(args, '--root', '');
  const interestingOnly = args.includes('--interesting-only');
  const maxDepth = parseInt(getArgValue(args, '--max-depth', '10'), 10);

  // Interesting roles for filtering
  const interestingRoles = new Set([
    'button',
    'link',
    'textbox',
    'checkbox',
    'radio',
    'combobox',
    'listbox',
    'option',
    'menuitem',
    'tab',
    'slider',
    'spinbutton',
    'searchbox',
    'switch',
  ]);

  try {
    const page = await getPage();
    const currentUrl = page.url();

    if (currentUrl === 'about:blank') {
      outputError('No page loaded. Navigate to a URL first.', {
        hint: 'npx tsx scripts/playwright/navigate.ts "https://example.com"',
      });
      return;
    }

    // Get root element if specified
    let rootElement = null;
    if (rootSelector) {
      rootElement = await page.$(rootSelector);
      if (!rootElement) {
        outputError(`Root element not found: ${rootSelector}`, { currentUrl });
        return;
      }
    }

    // Get accessibility snapshot
    const snapshot = await page.accessibility.snapshot({
      root: rootElement ?? undefined,
      interestingOnly,
    });

    if (!snapshot) {
      output({
        success: true,
        url: currentUrl,
        snapshot: null,
        message: 'No accessibility tree available',
      });
      return;
    }

    // Filter by depth and optionally by interesting roles
    const filteredSnapshot = filterSnapshot(snapshot, maxDepth, interestingOnly ? interestingRoles : null);

    // Count interactive elements
    const stats = countNodes(filteredSnapshot);

    output({
      success: true,
      url: currentUrl,
      stats,
      snapshot: filteredSnapshot,
    });
  } catch (error) {
    outputError(
      error instanceof Error ? error.message : 'Snapshot failed',
      { rootSelector, interestingOnly }
    );
  }
}

function filterSnapshot(
  node: AccessibilityNode,
  maxDepth: number,
  interestingRoles: Set<string> | null,
  currentDepth = 0
): AccessibilityNode | null {
  if (currentDepth > maxDepth) {
    return null;
  }

  // If filtering by interesting roles, check if this node is interesting
  const isInteresting = !interestingRoles || interestingRoles.has(node.role);

  // Process children
  const children = node.children
    ?.map((child) => filterSnapshot(child, maxDepth, interestingRoles, currentDepth + 1))
    .filter((child): child is AccessibilityNode => child !== null);

  // If not interesting and has no interesting children, skip
  if (!isInteresting && (!children || children.length === 0)) {
    return null;
  }

  // Return cleaned node
  const cleanNode: AccessibilityNode = {
    role: node.role,
  };

  if (node.name) cleanNode.name = node.name;
  if (node.value) cleanNode.value = node.value;
  if (node.description) cleanNode.description = node.description;
  if (node.checked !== undefined) cleanNode.checked = node.checked;
  if (node.disabled) cleanNode.disabled = node.disabled;
  if (node.expanded !== undefined) cleanNode.expanded = node.expanded;
  if (node.focused) cleanNode.focused = node.focused;
  if (node.pressed !== undefined) cleanNode.pressed = node.pressed;
  if (node.selected) cleanNode.selected = node.selected;
  if (children && children.length > 0) cleanNode.children = children;

  return cleanNode;
}

function countNodes(node: AccessibilityNode | null): Record<string, number> {
  const counts: Record<string, number> = {};

  function traverse(n: AccessibilityNode): void {
    counts[n.role] = (counts[n.role] || 0) + 1;
    n.children?.forEach(traverse);
  }

  if (node) traverse(node);
  return counts;
}

function getArgValue(args: string[], flag: string, defaultValue: string): string {
  const index = args.indexOf(flag);
  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1];
  }
  return defaultValue;
}

main();
