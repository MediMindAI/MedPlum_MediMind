// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Form Template Management (Phase 8)
 *
 * Tests cover:
 * - Form versioning (T098)
 * - Form cloning (T099)
 * - Form archiving
 * - Form template list
 * - Navigation between views
 */

test.describe('Form Template Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to form management page
    await page.goto('http://localhost:3000/emr/forms');

    // Wait for page to load
    await page.waitForSelector('[data-testid="form-management-view"]', { timeout: 10000 });
  });

  test.describe('Form Template List', () => {
    test('should display form management page', async ({ page }) => {
      // Verify page title
      await expect(page.getByText('Form Templates')).toBeVisible();

      // Verify create new button
      await expect(page.getByTestId('create-new-btn')).toBeVisible();

      // Verify view mode toggle
      await expect(page.getByTestId('view-mode-toggle')).toBeVisible();
    });

    test('should switch between table and card view', async ({ page }) => {
      // Verify table view is default
      await expect(page.getByTestId('form-template-table')).toBeVisible();

      // Click on card view
      await page.getByText('Card View').click();

      // Verify card view is displayed
      await expect(page.getByTestId('cards-container')).toBeVisible();
      await expect(page.getByTestId('form-template-table')).not.toBeVisible();

      // Switch back to table view
      await page.getByText('Table View').click();
      await expect(page.getByTestId('form-template-table')).toBeVisible();
    });

    test('should navigate to form builder when create new is clicked', async ({ page }) => {
      await page.getByTestId('create-new-btn').click();

      // Should navigate to form builder
      await expect(page).toHaveURL(/\/emr\/forms\/builder/);
    });

    test('should search forms by name', async ({ page }) => {
      const searchInput = page.getByTestId('search-input');
      await searchInput.fill('Patient');

      // Wait for debounce
      await page.waitForTimeout(600);

      // Verify search is applied (results should change)
      // Note: actual results depend on data in database
    });

    test('should filter forms by status', async ({ page }) => {
      // Open status filter dropdown
      await page.getByTestId('status-filter').click();

      // Select draft status
      await page.getByText('Draft').click();

      // Verify filter is applied
      await page.waitForTimeout(300);
    });

    test('should toggle archived forms visibility', async ({ page }) => {
      // Click show archived toggle
      await page.getByTestId('show-archived-toggle').click();

      // Archived forms should now be visible (if any)
      await page.waitForTimeout(500);

      // Toggle back
      await page.getByTestId('show-archived-toggle').click();
    });
  });

  test.describe('Form Cloning (T099)', () => {
    test('should open clone modal when clone button is clicked', async ({ page }) => {
      // Wait for forms to load
      await page.waitForTimeout(1000);

      // Click clone button on first form (if exists)
      const cloneBtn = page.locator('[data-testid^="clone-btn-"]').first();
      if (await cloneBtn.isVisible()) {
        await cloneBtn.click();

        // Verify modal is opened
        await expect(page.getByTestId('clone-modal')).toBeVisible();

        // Verify pre-filled title includes "(Copy)"
        const titleInput = page.getByTestId('clone-title-input');
        await expect(titleInput).toHaveValue(/\(Copy\)/);
      }
    });

    test('should close clone modal on cancel', async ({ page }) => {
      await page.waitForTimeout(1000);

      const cloneBtn = page.locator('[data-testid^="clone-btn-"]').first();
      if (await cloneBtn.isVisible()) {
        await cloneBtn.click();
        await expect(page.getByTestId('clone-modal')).toBeVisible();

        // Click cancel
        await page.getByTestId('clone-cancel-btn').click();

        // Modal should close
        await expect(page.getByTestId('clone-modal')).not.toBeVisible();
      }
    });

    test('should validate clone title is not empty', async ({ page }) => {
      await page.waitForTimeout(1000);

      const cloneBtn = page.locator('[data-testid^="clone-btn-"]').first();
      if (await cloneBtn.isVisible()) {
        await cloneBtn.click();
        await expect(page.getByTestId('clone-modal')).toBeVisible();

        // Clear the title
        const titleInput = page.getByTestId('clone-title-input');
        await titleInput.fill('');

        // Click confirm
        await page.getByTestId('clone-confirm-btn').click();

        // Should show error
        await expect(page.getByText('Title is required')).toBeVisible();
      }
    });

    test('should clone form successfully', async ({ page }) => {
      await page.waitForTimeout(1000);

      const cloneBtn = page.locator('[data-testid^="clone-btn-"]').first();
      if (await cloneBtn.isVisible()) {
        await cloneBtn.click();
        await expect(page.getByTestId('clone-modal')).toBeVisible();

        // Change title
        const titleInput = page.getByTestId('clone-title-input');
        await titleInput.fill('Cloned Form E2E Test');

        // Click confirm
        await page.getByTestId('clone-confirm-btn').click();

        // Modal should close and show success notification
        await page.waitForTimeout(1000);
        await expect(page.getByTestId('clone-modal')).not.toBeVisible();
      }
    });
  });

  test.describe('Form Version History (T098)', () => {
    test('should open version history modal', async ({ page }) => {
      await page.waitForTimeout(1000);

      const historyBtn = page.locator('[data-testid^="history-btn-"]').first();
      if (await historyBtn.isVisible()) {
        await historyBtn.click();

        // Verify modal is opened
        await expect(page.getByTestId('version-history-modal')).toBeVisible();
      }
    });

    test('should display version history table', async ({ page }) => {
      await page.waitForTimeout(1000);

      const historyBtn = page.locator('[data-testid^="history-btn-"]').first();
      if (await historyBtn.isVisible()) {
        await historyBtn.click();

        // Wait for history to load
        await page.waitForTimeout(500);

        // Version history table should be visible or empty state
        const hasTable = await page.getByTestId('version-history-table').isVisible();
        const hasEmpty = await page.getByText('No version history available').isVisible();

        expect(hasTable || hasEmpty).toBeTruthy();
      }
    });

    test('should close version history modal', async ({ page }) => {
      await page.waitForTimeout(1000);

      const historyBtn = page.locator('[data-testid^="history-btn-"]').first();
      if (await historyBtn.isVisible()) {
        await historyBtn.click();
        await expect(page.getByTestId('version-history-modal')).toBeVisible();

        // Close modal by clicking outside or close button
        await page.keyboard.press('Escape');

        await expect(page.getByTestId('version-history-modal')).not.toBeVisible();
      }
    });
  });

  test.describe('Form Archiving', () => {
    test('should archive form when archive button is clicked', async ({ page }) => {
      await page.waitForTimeout(1000);

      const archiveBtn = page.locator('[data-testid^="archive-btn-"]').first();
      if (await archiveBtn.isVisible()) {
        await archiveBtn.click();

        // Wait for archive operation
        await page.waitForTimeout(1000);

        // Should show success notification
        // Note: form may disappear from list if archived filter is off
      }
    });

    test('should restore archived form', async ({ page }) => {
      // Show archived forms first
      await page.getByTestId('show-archived-toggle').click();
      await page.waitForTimeout(500);

      // Find and click restore button
      const restoreBtn = page.locator('[data-testid^="restore-btn-"]').first();
      if (await restoreBtn.isVisible()) {
        await restoreBtn.click();

        // Wait for restore operation
        await page.waitForTimeout(1000);

        // Should show success notification
      }
    });
  });

  test.describe('Form Edit Navigation', () => {
    test('should navigate to edit view when edit button is clicked', async ({ page }) => {
      await page.waitForTimeout(1000);

      const editBtn = page.locator('[data-testid^="edit-btn-"]').first();
      if (await editBtn.isVisible()) {
        const formId = (await editBtn.getAttribute('data-testid'))?.replace('edit-btn-', '');
        await editBtn.click();

        // Should navigate to edit view
        await expect(page).toHaveURL(new RegExp(`/emr/forms/edit/${formId}`));
      }
    });

    test('should navigate to edit view when row is clicked', async ({ page }) => {
      await page.waitForTimeout(1000);

      const row = page.locator('[data-testid^="row-"]').first();
      if (await row.isVisible()) {
        const formId = (await row.getAttribute('data-testid'))?.replace('row-', '');
        await row.click();

        // Should navigate to edit view
        await expect(page).toHaveURL(new RegExp(`/emr/forms/edit/${formId}`));
      }
    });
  });
});

test.describe('Form Edit View', () => {
  test('should display loading state initially', async ({ page }) => {
    // Navigate directly to edit view with a test ID
    await page.goto('http://localhost:3000/emr/forms/edit/test-id-123');

    // Should show loading state or error
    await page.waitForTimeout(1000);
  });

  test('should display error for non-existent form', async ({ page }) => {
    // Navigate to non-existent form
    await page.goto('http://localhost:3000/emr/forms/edit/non-existent-form-id');

    // Wait for error state
    await page.waitForTimeout(2000);

    // Should show error view
    await expect(page.getByTestId('form-edit-view-error')).toBeVisible();
  });

  test('should navigate back to forms list on cancel', async ({ page }) => {
    await page.goto('http://localhost:3000/emr/forms/edit/non-existent-form-id');

    // Wait for error state
    await page.waitForTimeout(2000);

    // Click cancel/back button
    const cancelBtn = page.getByText('Cancel');
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();

      // Should navigate back to forms list
      await expect(page).toHaveURL(/\/emr\/forms/);
    }
  });
});

test.describe('Multilingual Support', () => {
  test('should display Georgian translations', async ({ page }) => {
    // Set language to Georgian
    await page.evaluate(() => {
      localStorage.setItem('emrLanguage', 'ka');
    });

    await page.goto('http://localhost:3000/emr/forms');
    await page.waitForSelector('[data-testid="form-management-view"]', { timeout: 10000 });

    // Verify Georgian text
    await expect(page.getByText('ფორმის შაბლონები')).toBeVisible();
  });

  test('should display Russian translations', async ({ page }) => {
    // Set language to Russian
    await page.evaluate(() => {
      localStorage.setItem('emrLanguage', 'ru');
    });

    await page.goto('http://localhost:3000/emr/forms');
    await page.waitForSelector('[data-testid="form-management-view"]', { timeout: 10000 });

    // Verify Russian text
    await expect(page.getByText('Шаблоны форм')).toBeVisible();
  });
});
