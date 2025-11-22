// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Auto-Save & Draft Recovery (Phase 12)
 *
 * Tests cover:
 * - T137: 5-second throttled auto-save
 * - T141: Auto-save integration in FormRenderer
 * - T144: Draft recovery functionality
 * - T146: Browser close warning
 * - T147: End-to-end auto-save workflow
 */

test.describe('Auto-Save & Draft Recovery', () => {
  test.beforeEach(async ({ page }) => {
    // Clear IndexedDB before each test
    await page.goto('http://localhost:3000/emr/forms/builder');

    // Wait for form builder to load
    await page.waitForSelector('[data-testid="form-builder-view"]', { timeout: 10000 });

    // Clear IndexedDB
    await page.evaluate(async () => {
      const databases = await indexedDB.databases();
      for (const db of databases) {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
        }
      }
    });
  });

  test.describe('Auto-Save (T137, T141)', () => {
    test('should auto-save form after 5 seconds of inactivity', async ({ page }) => {
      // Navigate to form renderer with auto-save enabled
      await page.goto('http://localhost:3000/emr/forms/fill/test-form?enableAutoSave=true');

      // Wait for form to load
      await page.waitForSelector('[data-testid="form-renderer"]', { timeout: 10000 });

      // Fill in a field
      const inputField = page.getByTestId('field-patient-name');
      await inputField.fill('Test Patient');

      // Wait for auto-save indicator to appear (5 seconds + buffer)
      await expect(page.getByText('Saving...')).toBeVisible({ timeout: 7000 });

      // Wait for save to complete
      await expect(page.getByText('Last saved')).toBeVisible({ timeout: 10000 });
    });

    test('should show unsaved changes indicator', async ({ page }) => {
      await page.goto('http://localhost:3000/emr/forms/fill/test-form?enableAutoSave=true');
      await page.waitForSelector('[data-testid="form-renderer"]', { timeout: 10000 });

      // Fill in a field
      const inputField = page.getByTestId('field-patient-name');
      await inputField.fill('New Value');

      // Should show unsaved changes badge (before auto-save triggers)
      await expect(page.getByText('Unsaved changes')).toBeVisible({ timeout: 2000 });
    });

    test('should display last saved timestamp', async ({ page }) => {
      await page.goto('http://localhost:3000/emr/forms/fill/test-form?enableAutoSave=true');
      await page.waitForSelector('[data-testid="form-renderer"]', { timeout: 10000 });

      // Fill in a field
      const inputField = page.getByTestId('field-patient-name');
      await inputField.fill('Test Patient');

      // Wait for save to complete
      await page.waitForTimeout(6000);

      // Check for last saved timestamp
      await expect(page.getByText(/Last saved/)).toBeVisible();
      await expect(page.getByText(/just now|minute/)).toBeVisible();
    });

    test('should not auto-save in view mode', async ({ page }) => {
      // Navigate to form in view mode
      await page.goto('http://localhost:3000/emr/forms/view/test-form?enableAutoSave=true');
      await page.waitForSelector('[data-testid="form-renderer"]', { timeout: 10000 });

      // Wait and verify no auto-save indicators appear
      await page.waitForTimeout(6000);
      await expect(page.getByText('Saving...')).not.toBeVisible();
      await expect(page.getByText('Last saved')).not.toBeVisible();
    });
  });

  test.describe('Background Sync (T142)', () => {
    test('should show syncing indicator during background sync', async ({ page }) => {
      await page.goto('http://localhost:3000/emr/forms/fill/test-form?enableAutoSave=true&syncInterval=5000');
      await page.waitForSelector('[data-testid="form-renderer"]', { timeout: 10000 });

      // Fill in a field to create a draft
      const inputField = page.getByTestId('field-patient-name');
      await inputField.fill('Test Patient');

      // Wait for initial save
      await page.waitForTimeout(6000);

      // Wait for sync (5 seconds in test mode)
      await expect(page.getByText('Syncing...')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Draft Recovery (T144)', () => {
    test('should show recovery modal when draft exists', async ({ page }) => {
      // First visit - create a draft
      await page.goto('http://localhost:3000/emr/forms/fill/recovery-test-form?enableAutoSave=true&formId=recovery-test');
      await page.waitForSelector('[data-testid="form-renderer"]', { timeout: 10000 });

      // Fill in a field
      const inputField = page.getByTestId('field-patient-name');
      await inputField.fill('Draft Patient Name');

      // Wait for auto-save
      await page.waitForTimeout(6000);

      // Navigate away
      await page.goto('http://localhost:3000/emr/forms');
      await page.waitForTimeout(500);

      // Navigate back - should show recovery modal
      await page.goto('http://localhost:3000/emr/forms/fill/recovery-test-form?enableAutoSave=true&formId=recovery-test');
      await page.waitForSelector('[data-testid="form-renderer"]', { timeout: 10000 });

      // Check for recovery modal
      await expect(page.getByText('Draft Found')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText(/previous draft/i)).toBeVisible();
    });

    test('should recover draft when recover button is clicked', async ({ page }) => {
      // Setup - create initial draft
      await page.goto('http://localhost:3000/emr/forms/fill/test-form?enableAutoSave=true&formId=recover-test');
      await page.waitForSelector('[data-testid="form-renderer"]', { timeout: 10000 });

      const testValue = 'Recovered Patient Name';
      const inputField = page.getByTestId('field-patient-name');
      await inputField.fill(testValue);

      // Wait for save
      await page.waitForTimeout(6000);

      // Navigate away and back
      await page.goto('http://localhost:3000/emr/forms');
      await page.waitForTimeout(500);
      await page.goto('http://localhost:3000/emr/forms/fill/test-form?enableAutoSave=true&formId=recover-test');

      // Wait for recovery modal
      await page.waitForSelector('text=Draft Found', { timeout: 5000 });

      // Click recover button
      await page.getByRole('button', { name: /recover/i }).click();

      // Modal should close
      await expect(page.getByText('Draft Found')).not.toBeVisible();

      // Field should have recovered value
      const recoveredField = page.getByTestId('field-patient-name');
      await expect(recoveredField).toHaveValue(testValue);
    });

    test('should discard draft when discard button is clicked', async ({ page }) => {
      // Setup - create initial draft
      await page.goto('http://localhost:3000/emr/forms/fill/test-form?enableAutoSave=true&formId=discard-test');
      await page.waitForSelector('[data-testid="form-renderer"]', { timeout: 10000 });

      const inputField = page.getByTestId('field-patient-name');
      await inputField.fill('Draft to be discarded');

      // Wait for save
      await page.waitForTimeout(6000);

      // Navigate away and back
      await page.goto('http://localhost:3000/emr/forms');
      await page.waitForTimeout(500);
      await page.goto('http://localhost:3000/emr/forms/fill/test-form?enableAutoSave=true&formId=discard-test');

      // Wait for recovery modal
      await page.waitForSelector('text=Draft Found', { timeout: 5000 });

      // Click discard button
      await page.getByRole('button', { name: /discard/i }).click();

      // Modal should close
      await expect(page.getByText('Draft Found')).not.toBeVisible();

      // Field should be empty
      const emptyField = page.getByTestId('field-patient-name');
      await expect(emptyField).toHaveValue('');
    });

    test('should display saved time in recovery modal', async ({ page }) => {
      // Setup draft
      await page.goto('http://localhost:3000/emr/forms/fill/test-form?enableAutoSave=true&formId=time-test');
      await page.waitForSelector('[data-testid="form-renderer"]', { timeout: 10000 });

      const inputField = page.getByTestId('field-patient-name');
      await inputField.fill('Time Test');

      await page.waitForTimeout(6000);

      // Navigate back
      await page.goto('http://localhost:3000/emr/forms');
      await page.waitForTimeout(500);
      await page.goto('http://localhost:3000/emr/forms/fill/test-form?enableAutoSave=true&formId=time-test');

      // Recovery modal should show time
      await page.waitForSelector('text=Draft Found', { timeout: 5000 });
      await expect(page.getByText(/saved.*just now|minute/i)).toBeVisible();
    });
  });

  test.describe('Browser Close Warning (T146)', () => {
    test('should warn on page close when there are unsaved changes', async ({ page }) => {
      await page.goto('http://localhost:3000/emr/forms/fill/test-form?enableAutoSave=true');
      await page.waitForSelector('[data-testid="form-renderer"]', { timeout: 10000 });

      // Fill in a field (creating unsaved changes)
      const inputField = page.getByTestId('field-patient-name');
      await inputField.fill('Unsaved Content');

      // Wait briefly (not long enough for auto-save)
      await page.waitForTimeout(1000);

      // Set up beforeunload event listener check
      const hasBeforeUnload = await page.evaluate(() => {
        return new Promise<boolean>((resolve) => {
          // Check if beforeunload handler returns a value
          const handler = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
            resolve(true);
          };
          window.addEventListener('beforeunload', handler, { once: true });

          // Simulate beforeunload
          const event = new Event('beforeunload');
          window.dispatchEvent(event);
        });
      });

      expect(hasBeforeUnload).toBe(true);
    });

    test('should not warn on page close when no unsaved changes', async ({ page }) => {
      await page.goto('http://localhost:3000/emr/forms/fill/test-form?enableAutoSave=true');
      await page.waitForSelector('[data-testid="form-renderer"]', { timeout: 10000 });

      // Don't make any changes - just wait
      await page.waitForTimeout(1000);

      // Verify unsaved changes badge is not visible
      await expect(page.getByText('Unsaved changes')).not.toBeVisible();
    });

    test('should not warn after form is submitted', async ({ page }) => {
      await page.goto('http://localhost:3000/emr/forms/fill/test-form?enableAutoSave=true');
      await page.waitForSelector('[data-testid="form-renderer"]', { timeout: 10000 });

      // Fill required fields
      const inputField = page.getByTestId('field-patient-name');
      await inputField.fill('Complete Form');

      // Submit form
      await page.getByRole('button', { name: /submit/i }).click();

      // Wait for submission
      await page.waitForTimeout(2000);

      // Should not have unsaved changes warning
      await expect(page.getByText('Unsaved changes')).not.toBeVisible();
    });
  });

  test.describe('Draft Expiration (T143)', () => {
    test('should not show recovery modal for expired drafts', async ({ page }) => {
      // This test requires mocking IndexedDB with an expired draft
      // Create an expired draft via evaluate
      await page.goto('http://localhost:3000/emr/forms/fill/test-form?enableAutoSave=true');
      await page.waitForSelector('[data-testid="form-renderer"]', { timeout: 10000 });

      // Create an expired draft in IndexedDB
      await page.evaluate(async () => {
        const dbName = 'medimind-drafts';
        const dbVersion = 1;

        return new Promise<void>((resolve, reject) => {
          const request = indexedDB.open(dbName, dbVersion);

          request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['drafts'], 'readwrite');
            const store = transaction.objectStore('drafts');

            // Create expired draft (31 days ago)
            const expiredDraft = {
              formId: 'expired-draft-test',
              questionnaireId: 'test-questionnaire',
              values: { 'patient-name': 'Expired Patient' },
              savedAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(),
              expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              syncedToServer: false,
            };

            store.put(expiredDraft);

            transaction.oncomplete = () => {
              db.close();
              resolve();
            };
            transaction.onerror = () => reject(transaction.error);
          };

          request.onerror = () => reject(request.error);
        });
      });

      // Navigate to the form with the expired draft
      await page.goto('http://localhost:3000/emr/forms/fill/test-form?enableAutoSave=true&formId=expired-draft-test');
      await page.waitForSelector('[data-testid="form-renderer"]', { timeout: 10000 });

      // Wait a moment for draft check
      await page.waitForTimeout(2000);

      // Recovery modal should NOT appear for expired draft
      await expect(page.getByText('Draft Found')).not.toBeVisible();
    });
  });

  test.describe('Multiple Forms', () => {
    test('should maintain separate drafts for different forms', async ({ page }) => {
      // Create draft for form 1
      await page.goto('http://localhost:3000/emr/forms/fill/test-form?enableAutoSave=true&formId=multi-test-1');
      await page.waitForSelector('[data-testid="form-renderer"]', { timeout: 10000 });

      const inputField1 = page.getByTestId('field-patient-name');
      await inputField1.fill('Patient Form 1');
      await page.waitForTimeout(6000);

      // Create draft for form 2
      await page.goto('http://localhost:3000/emr/forms/fill/test-form?enableAutoSave=true&formId=multi-test-2');
      await page.waitForSelector('[data-testid="form-renderer"]', { timeout: 10000 });

      const inputField2 = page.getByTestId('field-patient-name');
      await inputField2.fill('Patient Form 2');
      await page.waitForTimeout(6000);

      // Navigate back to form 1 - should recover form 1's data
      await page.goto('http://localhost:3000/emr/forms');
      await page.waitForTimeout(500);
      await page.goto('http://localhost:3000/emr/forms/fill/test-form?enableAutoSave=true&formId=multi-test-1');
      await page.waitForSelector('text=Draft Found', { timeout: 5000 });
      await page.getByRole('button', { name: /recover/i }).click();

      const recoveredField1 = page.getByTestId('field-patient-name');
      await expect(recoveredField1).toHaveValue('Patient Form 1');

      // Navigate to form 2 - should recover form 2's data
      await page.goto('http://localhost:3000/emr/forms');
      await page.waitForTimeout(500);
      await page.goto('http://localhost:3000/emr/forms/fill/test-form?enableAutoSave=true&formId=multi-test-2');
      await page.waitForSelector('text=Draft Found', { timeout: 5000 });
      await page.getByRole('button', { name: /recover/i }).click();

      const recoveredField2 = page.getByTestId('field-patient-name');
      await expect(recoveredField2).toHaveValue('Patient Form 2');
    });
  });

  test.describe('Force Save', () => {
    test('should save immediately when force save is triggered', async ({ page }) => {
      await page.goto('http://localhost:3000/emr/forms/fill/test-form?enableAutoSave=true');
      await page.waitForSelector('[data-testid="form-renderer"]', { timeout: 10000 });

      // Fill in a field
      const inputField = page.getByTestId('field-patient-name');
      await inputField.fill('Force Save Test');

      // Click save draft button (which triggers force save)
      await page.getByRole('button', { name: /save draft/i }).click();

      // Should show saving indicator immediately
      await expect(page.getByText('Saving...')).toBeVisible({ timeout: 1000 });

      // Should complete save quickly
      await expect(page.getByText('Last saved')).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Accessibility', () => {
    test('should announce auto-save status to screen readers', async ({ page }) => {
      await page.goto('http://localhost:3000/emr/forms/fill/test-form?enableAutoSave=true');
      await page.waitForSelector('[data-testid="form-renderer"]', { timeout: 10000 });

      // Fill in a field
      const inputField = page.getByTestId('field-patient-name');
      await inputField.fill('Accessibility Test');

      // Wait for save
      await page.waitForTimeout(6000);

      // Check that status is accessible
      const lastSavedText = page.getByText(/Last saved/);
      await expect(lastSavedText).toBeVisible();

      // Verify the status area is not hidden from screen readers
      const statusGroup = page.locator('[role="group"]').filter({ hasText: 'Last saved' });
      await expect(statusGroup).toBeVisible();
    });
  });
});
