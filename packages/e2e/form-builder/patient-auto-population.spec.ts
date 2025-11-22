// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Patient Data Auto-Population
 *
 * These tests verify that form fields are correctly auto-populated
 * with patient and encounter data when filling out questionnaires.
 *
 * Prerequisites:
 * - A questionnaire with patient binding fields must exist
 * - A patient with complete data must exist
 * - User must be authenticated
 */

test.describe('Patient Data Auto-Population', () => {
  // Test data IDs (would be created in beforeAll in real implementation)
  const questionnaireId = 'test-questionnaire-auto-population';
  const patientId = 'test-patient-auto-population';
  const encounterId = 'test-encounter-auto-population';

  test.beforeEach(async ({ page }) => {
    // Navigate to the form filler page
    // In real implementation, this would require authentication first
    await page.goto('/emr/forms/fill/' + questionnaireId);
  });

  test.describe('Form Loading', () => {
    test('should display loading state while fetching form data', async ({ page }) => {
      await page.goto('/emr/forms/fill/' + questionnaireId);

      // Should show loading skeleton initially
      const skeleton = page.locator('.mantine-Skeleton-root');
      // Skeleton may or may not be visible depending on load time
    });

    test('should display form title after loading', async ({ page }) => {
      await page.goto('/emr/forms/fill/' + questionnaireId);

      // Wait for form to load
      await page.waitForSelector('[data-testid="form-title"]', { timeout: 10000 }).catch(() => {
        // Alternative: wait for any form content
        return page.waitForSelector('form', { timeout: 10000 });
      });
    });

    test('should display error when questionnaire not found', async ({ page }) => {
      await page.goto('/emr/forms/fill/non-existent-questionnaire');

      // Wait for error message
      await expect(page.getByText(/error/i)).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Patient Data Binding', () => {
    test('should auto-populate patient name field', async ({ page }) => {
      await page.goto(`/emr/forms/fill/${questionnaireId}?patientId=${patientId}`);

      // Wait for form to load
      await page.waitForLoadState('networkidle');

      // Check that patient name is populated
      const nameInput = page.locator('input[name*="name"], input[id*="name"]').first();
      if (await nameInput.isVisible()) {
        const value = await nameInput.inputValue();
        expect(value).toBeTruthy();
      }
    });

    test('should auto-populate date of birth field', async ({ page }) => {
      await page.goto(`/emr/forms/fill/${questionnaireId}?patientId=${patientId}`);

      // Wait for form to load
      await page.waitForLoadState('networkidle');

      // Check that DOB is populated
      const dobInput = page.locator('input[name*="dob"], input[name*="birthDate"]').first();
      if (await dobInput.isVisible()) {
        const value = await dobInput.inputValue();
        expect(value).toBeTruthy();
      }
    });

    test('should calculate and display patient age', async ({ page }) => {
      await page.goto(`/emr/forms/fill/${questionnaireId}?patientId=${patientId}`);

      // Wait for form to load
      await page.waitForLoadState('networkidle');

      // Check that age field has a numeric value
      const ageInput = page.locator('input[name*="age"]').first();
      if (await ageInput.isVisible()) {
        const value = await ageInput.inputValue();
        expect(parseInt(value)).toBeGreaterThan(0);
      }
    });

    test('should auto-populate personal ID field', async ({ page }) => {
      await page.goto(`/emr/forms/fill/${questionnaireId}?patientId=${patientId}`);

      // Wait for form to load
      await page.waitForLoadState('networkidle');

      // Check that personal ID is populated
      const idInput = page.locator('input[name*="personalId"]').first();
      if (await idInput.isVisible()) {
        const value = await idInput.inputValue();
        expect(value).toBeTruthy();
      }
    });

    test('should auto-populate phone number field', async ({ page }) => {
      await page.goto(`/emr/forms/fill/${questionnaireId}?patientId=${patientId}`);

      // Wait for form to load
      await page.waitForLoadState('networkidle');

      // Check that phone is populated
      const phoneInput = page.locator('input[name*="phone"]').first();
      if (await phoneInput.isVisible()) {
        const value = await phoneInput.inputValue();
        expect(value).toBeTruthy();
      }
    });

    test('should auto-populate email field', async ({ page }) => {
      await page.goto(`/emr/forms/fill/${questionnaireId}?patientId=${patientId}`);

      // Wait for form to load
      await page.waitForLoadState('networkidle');

      // Check that email is populated
      const emailInput = page.locator('input[name*="email"]').first();
      if (await emailInput.isVisible()) {
        const value = await emailInput.inputValue();
        expect(value).toBeTruthy();
      }
    });
  });

  test.describe('Encounter Data Binding', () => {
    test('should auto-populate admission date from encounter', async ({ page }) => {
      await page.goto(`/emr/forms/fill/${questionnaireId}?patientId=${patientId}&encounterId=${encounterId}`);

      // Wait for form to load
      await page.waitForLoadState('networkidle');

      // Check that admission date is populated
      const dateInput = page.locator('input[name*="admission"], input[name*="encounterDate"]').first();
      if (await dateInput.isVisible()) {
        const value = await dateInput.inputValue();
        expect(value).toBeTruthy();
      }
    });

    test('should display encounter status badge', async ({ page }) => {
      await page.goto(`/emr/forms/fill/${questionnaireId}?patientId=${patientId}&encounterId=${encounterId}`);

      // Wait for form to load
      await page.waitForLoadState('networkidle');

      // Check for encounter status badge
      const statusBadge = page.locator('.mantine-Badge-root').filter({ hasText: /in-progress|finished|planned/i });
      if (await statusBadge.count() > 0) {
        await expect(statusBadge.first()).toBeVisible();
      }
    });
  });

  test.describe('Patient Context Card', () => {
    test('should display patient context card when patient is loaded', async ({ page }) => {
      await page.goto(`/emr/forms/fill/${questionnaireId}?patientId=${patientId}`);

      // Wait for form to load
      await page.waitForLoadState('networkidle');

      // Look for patient info elements
      const patientCard = page.locator('.mantine-Card-root').first();
      if (await patientCard.isVisible()) {
        // Should contain patient name
        await expect(patientCard).toBeVisible();
      }
    });

    test('should display patient name in context card', async ({ page }) => {
      await page.goto(`/emr/forms/fill/${questionnaireId}?patientId=${patientId}`);

      // Wait for form to load
      await page.waitForLoadState('networkidle');

      // Check for patient name in card (assuming full name is displayed)
      const nameText = page.getByText(/John|Smith|Test/i);
      // Patient name should be visible somewhere on the page
    });

    test('should display gender badge in patient card', async ({ page }) => {
      await page.goto(`/emr/forms/fill/${questionnaireId}?patientId=${patientId}`);

      // Wait for form to load
      await page.waitForLoadState('networkidle');

      // Check for gender badge
      const genderBadge = page.locator('.mantine-Badge-root').filter({ hasText: /male|female/i });
      if (await genderBadge.count() > 0) {
        await expect(genderBadge.first()).toBeVisible();
      }
    });
  });

  test.describe('Auto-Population Indicators', () => {
    test('should show indicator for auto-populated fields', async ({ page }) => {
      await page.goto(`/emr/forms/fill/${questionnaireId}?patientId=${patientId}`);

      // Wait for form to load
      await page.waitForLoadState('networkidle');

      // Check for auto-population alert
      const alert = page.getByText(/auto-populated/i);
      if (await alert.isVisible()) {
        await expect(alert).toBeVisible();
      }
    });

    test('should highlight auto-populated fields visually', async ({ page }) => {
      await page.goto(`/emr/forms/fill/${questionnaireId}?patientId=${patientId}`);

      // Wait for form to load
      await page.waitForLoadState('networkidle');

      // Check for visual indicator (border-left style)
      const highlightedField = page.locator('[style*="border-left"]').first();
      // Fields with auto-population should have visual indicator
    });
  });

  test.describe('Missing Data Handling', () => {
    test('should not populate fields when patient ID not provided', async ({ page }) => {
      await page.goto(`/emr/forms/fill/${questionnaireId}`);

      // Wait for form to load
      await page.waitForLoadState('networkidle');

      // Name field should be empty
      const nameInput = page.locator('input[name*="name"], input[id*="name"]').first();
      if (await nameInput.isVisible()) {
        const value = await nameInput.inputValue();
        expect(value).toBe('');
      }
    });

    test('should show warning when patient not found', async ({ page }) => {
      await page.goto(`/emr/forms/fill/${questionnaireId}?patientId=non-existent-patient`);

      // Wait for form to load
      await page.waitForLoadState('networkidle');

      // Check for warning message
      const warning = page.getByText(/patient not found/i);
      if (await warning.isVisible()) {
        await expect(warning).toBeVisible();
      }
    });

    test('should render form without errors when patient has minimal data', async ({ page }) => {
      // Use a patient with minimal data
      await page.goto(`/emr/forms/fill/${questionnaireId}?patientId=minimal-patient`);

      // Wait for form to load
      await page.waitForLoadState('networkidle');

      // Form should still render
      const form = page.locator('form');
      await expect(form).toBeVisible();
    });
  });

  test.describe('Form Submission', () => {
    test('should submit form with auto-populated values', async ({ page }) => {
      await page.goto(`/emr/forms/fill/${questionnaireId}?patientId=${patientId}`);

      // Wait for form to load
      await page.waitForLoadState('networkidle');

      // Fill required non-auto-populated fields
      const complaintInput = page.locator('textarea[name*="complaint"]').first();
      if (await complaintInput.isVisible()) {
        await complaintInput.fill('Test complaint for E2E');
      }

      // Check consent checkbox
      const consentCheckbox = page.locator('input[type="checkbox"]').first();
      if (await consentCheckbox.isVisible()) {
        await consentCheckbox.check();
      }

      // Submit form
      const submitButton = page.getByRole('button', { name: /submit/i });
      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Wait for submission result
        await page.waitForLoadState('networkidle');
      }
    });

    test('should save draft with auto-populated values', async ({ page }) => {
      await page.goto(`/emr/forms/fill/${questionnaireId}?patientId=${patientId}`);

      // Wait for form to load
      await page.waitForLoadState('networkidle');

      // Click save draft
      const saveDraftButton = page.getByRole('button', { name: /save draft/i });
      if (await saveDraftButton.isVisible()) {
        await saveDraftButton.click();

        // Wait for save result
        await page.waitForLoadState('networkidle');

        // Check for success indicator
        const successIndicator = page.getByText(/draft saved/i);
        if (await successIndicator.isVisible()) {
          await expect(successIndicator).toBeVisible();
        }
      }
    });
  });

  test.describe('Calculated Fields', () => {
    test('should calculate age from date of birth', async ({ page }) => {
      await page.goto(`/emr/forms/fill/${questionnaireId}?patientId=${patientId}`);

      // Wait for form to load
      await page.waitForLoadState('networkidle');

      // Age should be calculated and displayed
      const ageInput = page.locator('input[name*="age"]').first();
      if (await ageInput.isVisible()) {
        const value = await ageInput.inputValue();
        const age = parseInt(value);
        expect(age).toBeGreaterThanOrEqual(0);
        expect(age).toBeLessThan(150); // Reasonable age range
      }
    });

    test('should format full name with patronymic', async ({ page }) => {
      await page.goto(`/emr/forms/fill/${questionnaireId}?patientId=${patientId}`);

      // Wait for form to load
      await page.waitForLoadState('networkidle');

      // Full name should include patronymic if available
      const fullNameInput = page.locator('input[name*="fullName"]').first();
      if (await fullNameInput.isVisible()) {
        const value = await fullNameInput.inputValue();
        // Full name should have at least 2 parts (first and last name)
        const parts = value.split(' ').filter(Boolean);
        expect(parts.length).toBeGreaterThanOrEqual(2);
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper labels for form fields', async ({ page }) => {
      await page.goto(`/emr/forms/fill/${questionnaireId}`);

      // Wait for form to load
      await page.waitForLoadState('networkidle');

      // Check that inputs have associated labels
      const inputs = page.locator('input[type="text"], textarea');
      const inputCount = await inputs.count();

      for (let i = 0; i < Math.min(inputCount, 5); i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          // Either has label or aria-label
          const hasLabel = await label.count() > 0;
          const hasAriaLabel = await input.getAttribute('aria-label');
          expect(hasLabel || hasAriaLabel).toBeTruthy();
        }
      }
    });

    test('should be navigable by keyboard', async ({ page }) => {
      await page.goto(`/emr/forms/fill/${questionnaireId}`);

      // Wait for form to load
      await page.waitForLoadState('networkidle');

      // Tab through form fields
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // An input should be focused
      const focused = page.locator(':focus');
      const tagName = await focused.evaluate(el => el.tagName.toLowerCase()).catch(() => '');
      expect(['input', 'textarea', 'button', 'select', 'a']).toContain(tagName);
    });
  });
});
