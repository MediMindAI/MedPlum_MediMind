// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * E2E Tests for Form Builder Conditional Logic
 *
 * These tests verify the conditional display functionality:
 * - Showing/hiding fields based on enableWhen conditions
 * - AND (all) and OR (any) logic for multiple conditions
 * - Clearing values when fields become hidden
 * - Visual rule builder in field configuration
 * - Nested conditions (up to 3 levels)
 */

import { test, expect } from '@playwright/test';

test.describe('Conditional Logic', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the form builder page
    await page.goto('/emr/forms');
  });

  test.describe('Form Rendering with Conditions', () => {
    test('should show conditional field when trigger condition is met', async ({ page }) => {
      // This test assumes a form with conditional logic exists
      // Navigate to form fill view
      await page.goto('/emr/forms/fill/test-conditional-form');

      // Find the trigger field (e.g., a checkbox "Has Allergies")
      const triggerCheckbox = page.getByLabel('Has Allergies');

      // Verify conditional field is initially hidden
      const conditionalField = page.getByTestId('conditional-allergyDetails');
      await expect(conditionalField).not.toBeVisible();

      // Check the trigger checkbox
      await triggerCheckbox.check();

      // Verify conditional field is now visible
      await expect(conditionalField).toBeVisible();
    });

    test('should hide conditional field when trigger condition is not met', async ({ page }) => {
      await page.goto('/emr/forms/fill/test-conditional-form');

      const triggerCheckbox = page.getByLabel('Has Allergies');

      // First, check to show the field
      await triggerCheckbox.check();
      const conditionalField = page.getByTestId('conditional-allergyDetails');
      await expect(conditionalField).toBeVisible();

      // Fill in some value
      await page.getByLabel('Allergy Details').fill('Penicillin allergy');

      // Uncheck to hide the field
      await triggerCheckbox.uncheck();

      // Field should be hidden
      await expect(conditionalField).not.toBeVisible();
    });

    test('should clear field value when it becomes hidden', async ({ page }) => {
      await page.goto('/emr/forms/fill/test-conditional-form');

      const triggerCheckbox = page.getByLabel('Has Allergies');

      // Show the field and fill value
      await triggerCheckbox.check();
      await page.getByLabel('Allergy Details').fill('Penicillin allergy');

      // Verify value is entered
      await expect(page.getByLabel('Allergy Details')).toHaveValue('Penicillin allergy');

      // Hide the field
      await triggerCheckbox.uncheck();

      // Show the field again
      await triggerCheckbox.check();

      // Value should be cleared
      await expect(page.getByLabel('Allergy Details')).toHaveValue('');
    });

    test('should handle numeric comparison conditions', async ({ page }) => {
      await page.goto('/emr/forms/fill/test-conditional-form');

      const ageInput = page.getByLabel('Age');
      const adultField = page.getByTestId('conditional-adultConsent');

      // Enter age below threshold
      await ageInput.fill('15');
      await expect(adultField).not.toBeVisible();

      // Enter age at threshold
      await ageInput.fill('18');
      await expect(adultField).toBeVisible();

      // Enter age above threshold
      await ageInput.fill('25');
      await expect(adultField).toBeVisible();
    });
  });

  test.describe('AND Logic (enableBehavior: all)', () => {
    test('should show field only when ALL conditions are met', async ({ page }) => {
      await page.goto('/emr/forms/fill/test-and-conditions');

      const condition1 = page.getByLabel('Is Adult');
      const condition2 = page.getByLabel('Has Insurance');
      const conditionalField = page.getByTestId('conditional-insuranceDetails');

      // Only first condition met
      await condition1.check();
      await expect(conditionalField).not.toBeVisible();

      // Only second condition met
      await condition1.uncheck();
      await condition2.check();
      await expect(conditionalField).not.toBeVisible();

      // Both conditions met
      await condition1.check();
      await expect(conditionalField).toBeVisible();
    });

    test('should hide field when any condition becomes false', async ({ page }) => {
      await page.goto('/emr/forms/fill/test-and-conditions');

      const condition1 = page.getByLabel('Is Adult');
      const condition2 = page.getByLabel('Has Insurance');
      const conditionalField = page.getByTestId('conditional-insuranceDetails');

      // Both conditions met
      await condition1.check();
      await condition2.check();
      await expect(conditionalField).toBeVisible();

      // Uncheck first condition
      await condition1.uncheck();
      await expect(conditionalField).not.toBeVisible();
    });
  });

  test.describe('OR Logic (enableBehavior: any)', () => {
    test('should show field when ANY condition is met', async ({ page }) => {
      await page.goto('/emr/forms/fill/test-or-conditions');

      const condition1 = page.getByLabel('Emergency Case');
      const condition2 = page.getByLabel('VIP Patient');
      const conditionalField = page.getByTestId('conditional-priorityNotes');

      // No conditions met
      await expect(conditionalField).not.toBeVisible();

      // Only first condition met
      await condition1.check();
      await expect(conditionalField).toBeVisible();

      // Both conditions met
      await condition2.check();
      await expect(conditionalField).toBeVisible();

      // Only second condition met
      await condition1.uncheck();
      await expect(conditionalField).toBeVisible();

      // No conditions met again
      await condition2.uncheck();
      await expect(conditionalField).not.toBeVisible();
    });
  });

  test.describe('Visual Rule Builder', () => {
    test('should display conditional logic accordion in field config', async ({ page }) => {
      await page.goto('/emr/forms/builder/new');

      // Add a text field
      const textField = page.locator('[data-field-type="text"]');
      await textField.dragTo(page.locator('[data-testid="form-canvas"]'));

      // Click on the field to select it
      await page.locator('[data-testid="canvas-field"]').first().click();

      // Open properties panel
      const propertiesPanel = page.getByTestId('properties-panel');

      // Find and click the Conditional Display accordion
      const conditionalAccordion = propertiesPanel.getByText('Conditional Display');
      await expect(conditionalAccordion).toBeVisible();
      await conditionalAccordion.click();
    });

    test('should enable conditional logic with toggle', async ({ page }) => {
      await page.goto('/emr/forms/builder/new');

      // Add two fields (trigger and conditional)
      const textField = page.locator('[data-field-type="text"]');
      await textField.dragTo(page.locator('[data-testid="form-canvas"]'));

      const checkboxField = page.locator('[data-field-type="boolean"]');
      await checkboxField.dragTo(page.locator('[data-testid="form-canvas"]'));

      // Select the text field (second one added)
      await page.locator('[data-testid="canvas-field"]').nth(1).click();

      // Open conditional display section
      await page.getByText('Conditional Display').click();

      // Enable conditional logic
      const enableSwitch = page.getByLabel('Enable conditional display');
      await enableSwitch.click();

      // Verify condition controls appear
      await expect(page.getByText('Match behavior')).toBeVisible();
      await expect(page.getByText('Add Condition')).toBeVisible();
    });

    test('should add condition with field selector and operator', async ({ page }) => {
      await page.goto('/emr/forms/builder/new');

      // Add trigger field first
      const checkboxField = page.locator('[data-field-type="boolean"]');
      await checkboxField.dragTo(page.locator('[data-testid="form-canvas"]'));

      // Add conditional field
      const textField = page.locator('[data-field-type="text"]');
      await textField.dragTo(page.locator('[data-testid="form-canvas"]'));

      // Select the conditional field
      await page.locator('[data-testid="canvas-field"]').nth(1).click();

      // Open conditional display and enable
      await page.getByText('Conditional Display').click();
      await page.getByLabel('Enable conditional display').click();

      // Add a condition
      await page.getByText('Add Condition').click();

      // Select the trigger field
      const fieldSelect = page.getByLabel('When field');
      await fieldSelect.click();
      await page.getByRole('option').first().click();

      // Select operator
      const operatorSelect = page.getByLabel('Operator');
      await operatorSelect.click();
      await page.getByRole('option', { name: 'Equals' }).click();

      // Enter value
      const valueInput = page.getByLabel('Value');
      await valueInput.fill('true');

      // Verify condition is added
      await expect(page.getByText('Condition 1')).toBeVisible();
    });

    test('should remove condition when delete button is clicked', async ({ page }) => {
      await page.goto('/emr/forms/builder/new');

      // Setup: Add fields and create a condition
      const checkboxField = page.locator('[data-field-type="boolean"]');
      await checkboxField.dragTo(page.locator('[data-testid="form-canvas"]'));

      const textField = page.locator('[data-field-type="text"]');
      await textField.dragTo(page.locator('[data-testid="form-canvas"]'));

      await page.locator('[data-testid="canvas-field"]').nth(1).click();
      await page.getByText('Conditional Display').click();
      await page.getByLabel('Enable conditional display').click();
      await page.getByText('Add Condition').click();

      // Verify condition exists
      await expect(page.getByText('Condition 1')).toBeVisible();

      // Click remove button
      await page.getByLabel('Remove condition').click();

      // Verify condition is removed
      await expect(page.getByText('Condition 1')).not.toBeVisible();
    });

    test('should switch between AND and OR logic', async ({ page }) => {
      await page.goto('/emr/forms/builder/new');

      // Setup field with conditional logic
      const textField = page.locator('[data-field-type="text"]');
      await textField.dragTo(page.locator('[data-testid="form-canvas"]'));

      await page.locator('[data-testid="canvas-field"]').first().click();
      await page.getByText('Conditional Display').click();
      await page.getByLabel('Enable conditional display').click();

      // Default should be AND
      const behaviorSelect = page.getByLabel('Match behavior');
      await expect(behaviorSelect).toHaveValue('all');

      // Switch to OR
      await behaviorSelect.click();
      await page.getByRole('option', { name: 'Any condition must match (OR)' }).click();
      await expect(behaviorSelect).toHaveValue('any');
    });
  });

  test.describe('Nested Conditions', () => {
    test('should handle nested conditional fields (2 levels)', async ({ page }) => {
      await page.goto('/emr/forms/fill/test-nested-conditions');

      const level1Trigger = page.getByLabel('Show Details');
      const level2Trigger = page.getByLabel('Show Advanced Options');
      const level2Field = page.getByTestId('conditional-advancedOption');

      // Level 2 field should be hidden initially
      await expect(level2Field).not.toBeVisible();

      // Show level 1
      await level1Trigger.check();

      // Level 2 trigger should now be visible
      await expect(level2Trigger).toBeVisible();

      // Level 2 field still hidden
      await expect(level2Field).not.toBeVisible();

      // Show level 2
      await level2Trigger.check();
      await expect(level2Field).toBeVisible();

      // Hide level 1 should also hide level 2
      await level1Trigger.uncheck();
      await expect(level2Field).not.toBeVisible();
    });

    test('should limit nesting to 3 levels', async ({ page }) => {
      await page.goto('/emr/forms/fill/test-max-nesting');

      // This test verifies that deeply nested conditions (beyond 3 levels)
      // default to visible to prevent infinite loops
      const level3Trigger = page.getByLabel('Show Level 3');
      const level4Field = page.getByTestId('conditional-level4Field');

      // Level 4 field should be visible regardless of conditions
      // because it exceeds the maximum nesting depth
      await expect(level4Field).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should maintain keyboard navigation with conditional fields', async ({ page }) => {
      await page.goto('/emr/forms/fill/test-conditional-form');

      // Tab to trigger field
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Verify focus is on trigger checkbox
      const triggerCheckbox = page.getByLabel('Has Allergies');
      await expect(triggerCheckbox).toBeFocused();

      // Press space to check
      await page.keyboard.press('Space');

      // Tab to conditional field
      await page.keyboard.press('Tab');

      // Verify focus moved to conditional field
      const conditionalField = page.getByLabel('Allergy Details');
      await expect(conditionalField).toBeFocused();
    });

    test('should announce visibility changes to screen readers', async ({ page }) => {
      await page.goto('/emr/forms/fill/test-conditional-form');

      // Check for aria-live region or role="status" for visibility changes
      const conditionalWrapper = page.getByTestId('conditional-allergyDetails');
      const ariaLive = await conditionalWrapper.getAttribute('aria-live');

      // The Collapse component should handle accessibility
      // Check that the content is properly hidden from screen readers when collapsed
      const triggerCheckbox = page.getByLabel('Has Allergies');

      // When hidden
      await expect(conditionalWrapper).toHaveAttribute('data-visible', 'false');

      // When shown
      await triggerCheckbox.check();
      await expect(conditionalWrapper).toHaveAttribute('data-visible', 'true');
    });
  });
});
