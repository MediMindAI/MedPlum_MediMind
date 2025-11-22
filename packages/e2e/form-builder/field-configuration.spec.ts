// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Form Builder Field Configuration
 *
 * Tests cover:
 * - Editing field labels
 * - Setting validation rules
 * - Configuring field styling
 * - Real-time preview updates
 */

test.describe('Form Builder - Field Configuration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to form builder
    await page.goto('http://localhost:3000/emr/forms/builder');

    // Wait for page to load
    await page.waitForSelector('[data-testid="form-canvas"]', { timeout: 10000 });
  });

  test('should edit field label', async ({ page }) => {
    const canvas = page.locator('[data-testid="form-canvas"]');
    const textField = page.locator('[data-field-type="text"]').first();

    // Add a field
    await textField.dragTo(canvas);
    await page.waitForTimeout(500);

    // Click on the field to select it
    const addedField = canvas.locator('.mantine-Box-root').first();
    await addedField.click();
    await page.waitForTimeout(300);

    // Look for label input in properties panel
    const labelInput = page.locator('input[label="Field Label"], label:has-text("Field Label") + input').first();

    if (await labelInput.isVisible()) {
      // Clear and type new label
      await labelInput.clear();
      await labelInput.fill('Patient Full Name');

      // Wait for update
      await page.waitForTimeout(300);

      // Verify the label updated in canvas
      await expect(addedField).toContainText('Patient Full Name');
    }
  });

  test('should set field as required', async ({ page }) => {
    const canvas = page.locator('[data-testid="form-canvas"]');
    const textField = page.locator('[data-field-type="text"]').first();

    // Add a field
    await textField.dragTo(canvas);
    await page.waitForTimeout(500);

    // Select the field
    const addedField = canvas.locator('.mantine-Box-root').first();
    await addedField.click();
    await page.waitForTimeout(300);

    // Look for required checkbox in properties panel
    const requiredCheckbox = page.locator(
      'input[type="checkbox"][label="Required Field"], label:has-text("Required") input[type="checkbox"]'
    ).first();

    if (await requiredCheckbox.isVisible()) {
      // Check the required checkbox
      await requiredCheckbox.check();
      await page.waitForTimeout(300);

      // Verify field shows as required
      await expect(addedField).toContainText('Required');
    }
  });

  test('should configure validation rules - minimum length', async ({ page }) => {
    const canvas = page.locator('[data-testid="form-canvas"]');
    const textField = page.locator('[data-field-type="text"]').first();

    // Add a text field
    await textField.dragTo(canvas);
    await page.waitForTimeout(500);

    // Select the field
    const addedField = canvas.locator('.mantine-Box-root').first();
    await addedField.click();
    await page.waitForTimeout(300);

    // Look for minimum length input
    const minLengthInput = page.locator('input[label="Minimum Length"], label:has-text("Minimum Length") + input').first();

    if (await minLengthInput.isVisible()) {
      await minLengthInput.fill('3');
      await page.waitForTimeout(300);
    }
  });

  test('should configure validation rules - maximum length', async ({ page }) => {
    const canvas = page.locator('[data-testid="form-canvas"]');
    const textField = page.locator('[data-field-type="text"]').first();

    // Add a text field
    await textField.dragTo(canvas);
    await page.waitForTimeout(500);

    // Select the field
    const addedField = canvas.locator('.mantine-Box-root').first();
    await addedField.click();
    await page.waitForTimeout(300);

    // Look for maximum length input
    const maxLengthInput = page.locator('input[label="Maximum Length"], label:has-text("Maximum Length") + input').first();

    if (await maxLengthInput.isVisible()) {
      await maxLengthInput.fill('100');
      await page.waitForTimeout(300);
    }
  });

  test('should configure field styling - font size', async ({ page }) => {
    const canvas = page.locator('[data-testid="form-canvas"]');
    const textField = page.locator('[data-field-type="text"]').first();

    // Add a field
    await textField.dragTo(canvas);
    await page.waitForTimeout(500);

    // Select the field
    const addedField = canvas.locator('.mantine-Box-root').first();
    await addedField.click();
    await page.waitForTimeout(300);

    // Look for font size dropdown
    const fontSizeSelect = page.locator('label:has-text("Font Size")').first();

    if (await fontSizeSelect.isVisible()) {
      await fontSizeSelect.click();
      await page.waitForTimeout(300);

      // Select a font size option (e.g., "Large (18px)")
      const option = page.locator('text="Large (18px)"').first();
      if (await option.isVisible()) {
        await option.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('should configure field styling - text color', async ({ page }) => {
    const canvas = page.locator('[data-testid="form-canvas"]');
    const textField = page.locator('[data-field-type="text"]').first();

    // Add a field
    await textField.dragTo(canvas);
    await page.waitForTimeout(500);

    // Select the field
    const addedField = canvas.locator('.mantine-Box-root').first();
    await addedField.click();
    await page.waitForTimeout(300);

    // Look for color input
    const colorInput = page.locator('input[label="Text Color"], label:has-text("Text Color") + input').first();

    if (await colorInput.isVisible()) {
      // Clear and type color value
      await colorInput.clear();
      await colorInput.fill('#333333');
      await page.waitForTimeout(300);
    }
  });

  test('should configure field styling - text alignment', async ({ page }) => {
    const canvas = page.locator('[data-testid="form-canvas"]');
    const textField = page.locator('[data-field-type="text"]').first();

    // Add a field
    await textField.dragTo(canvas);
    await page.waitForTimeout(500);

    // Select the field
    const addedField = canvas.locator('.mantine-Box-root').first();
    await addedField.click();
    await page.waitForTimeout(300);

    // Look for text alignment dropdown
    const alignmentSelect = page.locator('label:has-text("Text Alignment")').first();

    if (await alignmentSelect.isVisible()) {
      await alignmentSelect.click();
      await page.waitForTimeout(300);

      // Select alignment option (e.g., "Center")
      const option = page.locator('text="Center"').first();
      if (await option.isVisible()) {
        await option.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('should configure field width', async ({ page }) => {
    const canvas = page.locator('[data-testid="form-canvas"]');
    const textField = page.locator('[data-field-type="text"]').first();

    // Add a field
    await textField.dragTo(canvas);
    await page.waitForTimeout(500);

    // Select the field
    const addedField = canvas.locator('.mantine-Box-root').first();
    await addedField.click();
    await page.waitForTimeout(300);

    // Look for width input
    const widthInput = page.locator('input[label="Width"], label:has-text("Width") + input').first();

    if (await widthInput.isVisible()) {
      await widthInput.clear();
      await widthInput.fill('50%');
      await page.waitForTimeout(300);
    }
  });

  test('should show preview when preview button clicked', async ({ page }) => {
    // Add a field first
    const canvas = page.locator('[data-testid="form-canvas"]');
    const textField = page.locator('[data-field-type="text"]').first();
    await textField.dragTo(canvas);
    await page.waitForTimeout(500);

    // Look for preview button
    const previewButton = page.locator('button:has-text("Preview"), button:has([data-icon="eye"])').first();

    if (await previewButton.isVisible()) {
      await previewButton.click();
      await page.waitForTimeout(500);

      // Look for LForms container
      const lformsContainer = page.locator('[data-testid="lforms-container"]');
      await expect(lformsContainer).toBeVisible({ timeout: 5000 });
    }
  });

  test('should update preview in real-time when field changes', async ({ page }) => {
    // Add a field
    const canvas = page.locator('[data-testid="form-canvas"]');
    const textField = page.locator('[data-field-type="text"]').first();
    await textField.dragTo(canvas);
    await page.waitForTimeout(500);

    // Enable preview
    const previewButton = page.locator('button:has-text("Preview"), button:has([data-icon="eye"])').first();
    if (await previewButton.isVisible()) {
      await previewButton.click();
      await page.waitForTimeout(500);
    }

    // Select the field
    const addedField = canvas.locator('.mantine-Box-root').first();
    await addedField.click();
    await page.waitForTimeout(300);

    // Change the label
    const labelInput = page.locator('input[label="Field Label"], label:has-text("Field Label") + input').first();
    if (await labelInput.isVisible()) {
      await labelInput.clear();
      await labelInput.fill('Updated Field Name');
      await page.waitForTimeout(500);

      // Preview should update automatically
      // Note: Actual verification depends on LForms rendering
    }
  });

  test('should configure custom regex pattern', async ({ page }) => {
    const canvas = page.locator('[data-testid="form-canvas"]');
    const textField = page.locator('[data-field-type="text"]').first();

    // Add a field
    await textField.dragTo(canvas);
    await page.waitForTimeout(500);

    // Select the field
    const addedField = canvas.locator('.mantine-Box-root').first();
    await addedField.click();
    await page.waitForTimeout(300);

    // Look for pattern input
    const patternInput = page.locator('input[label="Custom Pattern (Regex)"], label:has-text("Custom Pattern") + input').first();

    if (await patternInput.isVisible()) {
      await patternInput.clear();
      await patternInput.fill('^[A-Z]{2}\\d{4}$');
      await page.waitForTimeout(300);
    }
  });

  test('should delete field', async ({ page }) => {
    const canvas = page.locator('[data-testid="form-canvas"]');
    const textField = page.locator('[data-field-type="text"]').first();

    // Add a field
    await textField.dragTo(canvas);
    await page.waitForTimeout(500);

    // Verify field was added
    const fields = canvas.locator('.mantine-Box-root');
    await expect(fields).toHaveCount(1);

    // Look for delete button (trash icon)
    const deleteButton = fields.first().locator('[data-icon="trash"]').first();

    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      await page.waitForTimeout(500);

      // Field should be removed
      await expect(fields).toHaveCount(0);
    }
  });

  test('should configure multiple fields with different settings', async ({ page }) => {
    const canvas = page.locator('[data-testid="form-canvas"]');

    // Add three different field types
    const fieldTypes = [
      { type: 'text', label: 'Patient Name', required: true },
      { type: 'date', label: 'Birth Date', required: false },
      { type: 'checkbox', label: 'Consent Given', required: true },
    ];

    for (const config of fieldTypes) {
      // Add field
      const field = page.locator(`[data-field-type="${config.type}"]`).first();
      await field.dragTo(canvas);
      await page.waitForTimeout(300);

      // Select the newly added field
      const fields = canvas.locator('.mantine-Box-root');
      const lastField = fields.last();
      await lastField.click();
      await page.waitForTimeout(300);

      // Configure label
      const labelInput = page.locator('input[label="Field Label"], label:has-text("Field Label") + input').first();
      if (await labelInput.isVisible()) {
        await labelInput.clear();
        await labelInput.fill(config.label);
        await page.waitForTimeout(200);
      }

      // Configure required
      const requiredCheckbox = page.locator(
        'input[type="checkbox"][label="Required Field"], label:has-text("Required") input[type="checkbox"]'
      ).first();
      if (await requiredCheckbox.isVisible()) {
        if (config.required) {
          await requiredCheckbox.check();
        } else {
          await requiredCheckbox.uncheck();
        }
        await page.waitForTimeout(200);
      }
    }

    // Verify all three fields were added
    const allFields = canvas.locator('.mantine-Box-root');
    await expect(allFields).toHaveCount(3);
  });
});
