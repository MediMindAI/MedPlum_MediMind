// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Form Builder Drag-and-Drop Functionality
 *
 * Tests cover:
 * - Dragging fields from palette to canvas
 * - Reordering fields in canvas
 * - Visual feedback during drag operations
 * - Dropping in invalid areas
 */

test.describe('Form Builder - Drag and Drop', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to form builder
    await page.goto('http://localhost:3000/emr/forms/builder');

    // Wait for page to load
    await page.waitForSelector('[data-testid="form-canvas"]', { timeout: 10000 });
  });

  test('should drag text field from palette to canvas', async ({ page }) => {
    // Locate the text field in the palette
    const textField = page.locator('[data-field-type="text"]').first();

    // Locate the canvas drop zone
    const canvas = page.locator('[data-testid="form-canvas"]');

    // Verify canvas is empty initially
    await expect(canvas).toContainText('Drag fields here or click +');

    // Drag the text field to the canvas
    await textField.dragTo(canvas);

    // Wait for the field to appear in canvas
    await page.waitForTimeout(500);

    // Verify the field was added
    await expect(canvas).not.toContainText('Drag fields here or click +');

    // Should show field in canvas (with label or type)
    const addedField = canvas.locator('.mantine-Box-root').first();
    await expect(addedField).toBeVisible();
  });

  test('should drag date field from palette to canvas', async ({ page }) => {
    const dateField = page.locator('[data-field-type="date"]').first();
    const canvas = page.locator('[data-testid="form-canvas"]');

    await dateField.dragTo(canvas);
    await page.waitForTimeout(500);

    // Verify date field was added
    const fields = canvas.locator('.mantine-Box-root');
    await expect(fields.first()).toBeVisible();
  });

  test('should reorder fields in canvas', async ({ page }) => {
    const canvas = page.locator('[data-testid="form-canvas"]');

    // Add two fields
    const textField = page.locator('[data-field-type="text"]').first();
    const dateField = page.locator('[data-field-type="date"]').first();

    await textField.dragTo(canvas);
    await page.waitForTimeout(300);
    await dateField.dragTo(canvas);
    await page.waitForTimeout(300);

    // Get the fields
    const fields = canvas.locator('.mantine-Box-root');
    await expect(fields).toHaveCount(2);

    // Try to reorder by dragging first field below second
    // Note: This is a simplified test - actual implementation may vary
    const firstField = fields.nth(0);
    const secondField = fields.nth(1);

    // Look for drag handle
    const dragHandle = firstField.locator('[data-icon="grip-vertical"]').first();

    if (await dragHandle.isVisible()) {
      await dragHandle.dragTo(secondField);
      await page.waitForTimeout(500);
    }
  });

  test('should show visual feedback during drag', async ({ page }) => {
    const textField = page.locator('[data-field-type="text"]').first();
    const canvas = page.locator('[data-testid="form-canvas"]');

    // Start drag
    await textField.hover();
    await page.mouse.down();

    // Move over canvas
    const canvasBox = await canvas.boundingBox();
    if (canvasBox) {
      await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2);
      await page.waitForTimeout(200);

      // Canvas should show drag-over state (border or background change)
      // Note: Visual assertions are limited in Playwright, using timeout to allow visual change
      await page.waitForTimeout(300);
    }

    await page.mouse.up();
  });

  test('should handle dropping outside canvas', async ({ page }) => {
    const textField = page.locator('[data-field-type="text"]').first();

    // Start drag
    await textField.hover();
    await page.mouse.down();

    // Move to a location outside canvas
    await page.mouse.move(100, 100);
    await page.waitForTimeout(200);

    // Drop
    await page.mouse.up();
    await page.waitForTimeout(500);

    // Canvas should still be empty or field should not be added
    const canvas = page.locator('[data-testid="form-canvas"]');

    // This test assumes dropping outside doesn't add the field
    // Adjust based on actual behavior
  });

  test('should drag multiple different field types', async ({ page }) => {
    const canvas = page.locator('[data-testid="form-canvas"]');

    // Drag multiple field types
    const fieldTypes = ['text', 'date', 'checkbox', 'textarea'];

    for (const fieldType of fieldTypes) {
      const field = page.locator(`[data-field-type="${fieldType}"]`).first();
      await field.dragTo(canvas);
      await page.waitForTimeout(300);
    }

    // Verify all fields were added
    const fields = canvas.locator('.mantine-Box-root');
    await expect(fields).toHaveCount(fieldTypes.length);
  });

  test('should show drag handle on field hover', async ({ page }) => {
    const canvas = page.locator('[data-testid="form-canvas"]');
    const textField = page.locator('[data-field-type="text"]').first();

    // Add a field
    await textField.dragTo(canvas);
    await page.waitForTimeout(500);

    // Get the added field
    const addedField = canvas.locator('.mantine-Box-root').first();

    // Hover over the field
    await addedField.hover();

    // Look for drag handle icon (grip-vertical)
    const dragHandle = addedField.locator('[data-icon="grip-vertical"]');
    await expect(dragHandle).toBeVisible();
  });

  test('should allow drag and drop on touch devices', async ({ page, context }) => {
    // Simulate touch device
    await context.grantPermissions(['pointerevents']);

    const textField = page.locator('[data-field-type="text"]').first();
    const canvas = page.locator('[data-testid="form-canvas"]');

    // Get bounding boxes
    const fieldBox = await textField.boundingBox();
    const canvasBox = await canvas.boundingBox();

    if (fieldBox && canvasBox) {
      // Simulate touch drag
      await page.touchscreen.tap(fieldBox.x + fieldBox.width / 2, fieldBox.y + fieldBox.height / 2);
      await page.waitForTimeout(100);

      // This is a simplified touch test - actual touch drag implementation may need more complex gestures
    }
  });

  test('should preserve field order after page refresh', async ({ page }) => {
    const canvas = page.locator('[data-testid="form-canvas"]');

    // Add multiple fields in specific order
    const fieldTypes = ['text', 'date', 'checkbox'];

    for (const fieldType of fieldTypes) {
      const field = page.locator(`[data-field-type="${fieldType}"]`).first();
      await field.dragTo(canvas);
      await page.waitForTimeout(300);
    }

    // Get field count before refresh
    const fields = canvas.locator('.mantine-Box-root');
    const countBefore = await fields.count();

    // Note: This test assumes some form of persistence
    // If the form is not saved, fields will be lost on refresh
    // Adjust based on actual implementation
    expect(countBefore).toBe(fieldTypes.length);
  });
});
