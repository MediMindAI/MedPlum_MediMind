/**
 * Form 100 Mapper Script
 * Logs into EMR, navigates to Form 100, and extracts all field data
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'documentation', 'forms');

async function main() {
  console.log('[form100] Starting Form 100 extraction...');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: false, // Keep visible for debugging
    args: ['--no-first-run', '--no-default-browser-check'],
  });

  const context = await browser.newContext({
    viewport: { width: 1600, height: 900 },
  });

  const page = await context.newPage();

  try {
    // Step 1: Navigate to login page
    console.log('[form100] Navigating to login page...');
    await page.goto('http://178.134.21.82:8008/index.php', { waitUntil: 'networkidle' });

    // Step 2: Login
    console.log('[form100] Logging in...');

    // Take screenshot of login page to see what we're working with
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'login-page.png'), fullPage: true });

    // Extract login form structure
    const loginForm = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input')).map(i => ({
        id: i.id,
        name: i.name,
        type: i.type,
        placeholder: i.placeholder
      }));
      const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], [type="button"]')).map(b => ({
        text: b.textContent?.trim() || (b as HTMLInputElement).value,
        type: b.getAttribute('type'),
        class: b.className
      }));
      return { inputs, buttons };
    });
    console.log('[form100] Login form structure:', JSON.stringify(loginForm, null, 2));

    // Try different selectors for username/password
    const usernameSelector = '#username, input[name="username"], input[name="user"], input[type="text"]:first-of-type';
    const passwordSelector = '#password, input[name="password"], input[type="password"]';
    const submitSelector = 'button[type="submit"], input[type="submit"], button:has-text("შესვლა"), button:has-text("Login"), .login-btn, .submit-btn';

    await page.fill(usernameSelector, 'cicig');
    await page.fill(passwordSelector, 'Tsotne2011');

    // Try to click submit
    const submitBtn = await page.locator(submitSelector).first();
    await submitBtn.click();
    await page.waitForLoadState('networkidle');

    // Take screenshot after login
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'after-login.png'), fullPage: true });
    console.log('[form100] Logged in successfully');

    // Step 3: Navigate to Forms section
    // Based on screenshot, need to click on "ფორმები" (Forms) in the menu
    console.log('[form100] Navigating to Forms section...');

    // Try to find and click the Forms menu item
    const formsMenu = await page.locator('text=ფორმები').first();
    if (await formsMenu.isVisible()) {
      await formsMenu.click();
      await page.waitForLoadState('networkidle');
    }

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'forms-menu.png'), fullPage: true });

    // Step 4: Look for Form 100 / IV-100
    console.log('[form100] Looking for Form 100...');

    // Take snapshot of current state
    const currentUrl = page.url();
    console.log('[form100] Current URL:', currentUrl);

    // Extract page structure
    const pageData = await page.evaluate(() => {
      // Get all links
      const links = Array.from(document.querySelectorAll('a')).map(a => ({
        text: a.textContent?.trim(),
        href: a.href,
        id: a.id,
        class: a.className
      }));

      // Get all menu items
      const menuItems = Array.from(document.querySelectorAll('[class*="menu"], [class*="nav"], [role="menuitem"]')).map(el => ({
        text: el.textContent?.trim().substring(0, 100),
        tag: el.tagName,
        class: el.className
      }));

      // Get tabs
      const tabs = Array.from(document.querySelectorAll('[class*="tab"], [role="tab"]')).map(el => ({
        text: el.textContent?.trim(),
        class: el.className
      }));

      return { links: links.slice(0, 50), menuItems: menuItems.slice(0, 30), tabs };
    });

    console.log('[form100] Page data:', JSON.stringify(pageData, null, 2));

    // Look for Form 100 related links
    const form100Links = pageData.links.filter(l =>
      l.text?.includes('100') ||
      l.text?.includes('IV-100') ||
      l.href?.includes('100') ||
      l.href?.includes('form')
    );
    console.log('[form100] Form 100 related links:', form100Links);

    // Try navigating directly to forms page if we can find it
    // Based on screenshot, there's a "ფორმები" tab

    // Let's try the Patient History section first since Form 100 might be there
    console.log('[form100] Trying Patient History section...');
    const patientHistory = await page.locator('text=პაციენტის ისტორია').first();
    if (await patientHistory.isVisible()) {
      await patientHistory.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'patient-history.png'), fullPage: true });

    // Now look for form-100 or ფორმა 100 tab
    const form100Tab = await page.locator('text=ფორმა 100').or(page.locator('text=form-100')).or(page.locator('text=IV-100')).first();
    if (await form100Tab.isVisible()) {
      console.log('[form100] Found Form 100 tab, clicking...');
      await form100Tab.click();
      await page.waitForLoadState('networkidle');
    }

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'form100-page.png'), fullPage: true });

    // Step 5: Extract the form fields
    console.log('[form100] Extracting form fields...');

    const formData = await page.evaluate(() => {
      const result: any = {
        title: '',
        forms: [],
        fields: [],
        dropdowns: [],
        checkboxes: [],
        textareas: [],
        buttons: [],
        labels: []
      };

      // Get page title
      const title = document.querySelector('h1, h2, h3, .title, [class*="title"]');
      result.title = title?.textContent?.trim() || document.title;

      // Get all form elements
      const forms = document.querySelectorAll('form');
      forms.forEach((form, idx) => {
        result.forms.push({
          id: form.id,
          name: form.name,
          action: form.action,
          method: form.method,
          class: form.className
        });
      });

      // Get all input fields
      const inputs = document.querySelectorAll('input:not([type="hidden"])');
      inputs.forEach((input: HTMLInputElement) => {
        const label = input.labels?.[0]?.textContent?.trim() ||
                     input.placeholder ||
                     document.querySelector(`label[for="${input.id}"]`)?.textContent?.trim() ||
                     input.name;

        result.fields.push({
          id: input.id,
          name: input.name,
          type: input.type,
          label: label,
          placeholder: input.placeholder,
          required: input.required,
          value: input.value,
          class: input.className,
          maxLength: input.maxLength > 0 ? input.maxLength : null,
          pattern: input.pattern || null
        });
      });

      // Get all select elements
      const selects = document.querySelectorAll('select');
      selects.forEach((select: HTMLSelectElement) => {
        const label = select.labels?.[0]?.textContent?.trim() ||
                     document.querySelector(`label[for="${select.id}"]`)?.textContent?.trim() ||
                     select.name;

        const options = Array.from(select.options).map(opt => ({
          value: opt.value,
          text: opt.text,
          selected: opt.selected
        }));

        result.dropdowns.push({
          id: select.id,
          name: select.name,
          label: label,
          required: select.required,
          class: select.className,
          options: options
        });
      });

      // Get all textareas
      const textareas = document.querySelectorAll('textarea');
      textareas.forEach((ta: HTMLTextAreaElement) => {
        const label = ta.labels?.[0]?.textContent?.trim() ||
                     document.querySelector(`label[for="${ta.id}"]`)?.textContent?.trim() ||
                     ta.name;

        result.textareas.push({
          id: ta.id,
          name: ta.name,
          label: label,
          placeholder: ta.placeholder,
          required: ta.required,
          rows: ta.rows,
          cols: ta.cols,
          class: ta.className
        });
      });

      // Get all checkboxes
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((cb: HTMLInputElement) => {
        const label = cb.labels?.[0]?.textContent?.trim() ||
                     cb.nextSibling?.textContent?.trim() ||
                     cb.name;

        result.checkboxes.push({
          id: cb.id,
          name: cb.name,
          label: label,
          checked: cb.checked,
          value: cb.value
        });
      });

      // Get all buttons
      const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"], [onclick]');
      buttons.forEach((btn: any) => {
        result.buttons.push({
          id: btn.id,
          name: btn.name,
          text: btn.textContent?.trim() || btn.value,
          type: btn.type,
          onclick: btn.getAttribute('onclick'),
          class: btn.className
        });
      });

      // Get all visible labels (for fields that might not have proper label association)
      const labels = document.querySelectorAll('label, .label, [class*="label"]');
      labels.forEach(lbl => {
        if (lbl.textContent?.trim()) {
          result.labels.push({
            text: lbl.textContent.trim(),
            for: lbl.getAttribute('for'),
            class: lbl.className
          });
        }
      });

      // Get form container
      const formContainer = document.querySelector('[class*="form-100"], [class*="form100"], [id*="form100"], [id*="form-100"]');
      if (formContainer) {
        result.formContainerHTML = formContainer.outerHTML.substring(0, 5000);
      }

      // Also look for the main content area
      const mainContent = document.querySelector('.content, #content, main, [class*="main"]');
      if (mainContent) {
        result.mainContentText = mainContent.textContent?.trim().substring(0, 3000);
      }

      return result;
    });

    console.log('[form100] Form data extracted');
    console.log(JSON.stringify(formData, null, 2));

    // Save extracted data to file
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'form100-extracted.json'),
      JSON.stringify(formData, null, 2)
    );

    // Step 6: Take final screenshots
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'form100-final.png'), fullPage: true });

    // Step 7: Get accessibility tree for more context
    const snapshot = await page.accessibility.snapshot();
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'form100-accessibility.json'),
      JSON.stringify(snapshot, null, 2)
    );

    console.log('[form100] Extraction complete!');
    console.log('[form100] Files saved to:', OUTPUT_DIR);

  } catch (error) {
    console.error('[form100] Error:', error);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'form100-error.png'), fullPage: true });
  } finally {
    // Keep browser open for manual inspection
    console.log('[form100] Browser will stay open for 30 seconds...');
    await page.waitForTimeout(30000);
    await browser.close();
  }
}

main().catch(console.error);
