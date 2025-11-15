/**
 * Verification Script for My Patients Page Extraction
 *
 * Run this in the browser console AFTER completing all extraction steps
 * to verify that all data has been captured correctly.
 *
 * Usage:
 * 1. Navigate to My Patients page
 * 2. Open DevTools Console
 * 3. Paste this entire script
 * 4. Press Enter
 * 5. Review the verification report
 */

(function() {
  console.log('🔍 Starting My Patients Page Extraction Verification...\n');

  const report = {
    timestamp: new Date().toISOString(),
    pageUrl: window.location.href,
    checks: [],
    errors: [],
    warnings: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0
    }
  };

  // Helper function to add check result
  function addCheck(name, passed, message, severity = 'error') {
    report.checks.push({ name, passed, message, severity });
    report.summary.total++;

    if (passed) {
      report.summary.passed++;
      console.log(`✅ ${name}: ${message}`);
    } else {
      if (severity === 'warning') {
        report.summary.warnings++;
        report.warnings.push({ name, message });
        console.warn(`⚠️  ${name}: ${message}`);
      } else {
        report.summary.failed++;
        report.errors.push({ name, message });
        console.error(`❌ ${name}: ${message}`);
      }
    }
  }

  // ==========================================
  // Check 1: Table Presence
  // ==========================================
  const table = document.querySelector('table');
  addCheck(
    'Table Presence',
    !!table,
    table ? 'Table found on page' : 'No table found - are you on the correct page?'
  );

  // ==========================================
  // Check 2: Table Columns
  // ==========================================
  if (table) {
    const headers = table.querySelectorAll('thead th, thead td');
    const expectedColumns = 7;
    const actualColumns = headers.length;

    addCheck(
      'Table Columns Count',
      actualColumns >= expectedColumns,
      `Found ${actualColumns} columns (expected ${expectedColumns})`,
      actualColumns < expectedColumns ? 'error' : 'warning'
    );

    // Check Column 2 specifically
    if (headers[1]) {
      const col2Text = headers[1].textContent.trim();
      const col2DataCell = table.querySelector('tbody tr:first-child td:nth-child(2)');
      const col2Data = col2DataCell ? col2DataCell.textContent.trim() : '';

      addCheck(
        'Column 2 Header Extracted',
        !!col2Text,
        `Column 2 header: "${col2Text}"`
      );

      addCheck(
        'Column 2 Data Extracted',
        !!col2Data,
        `Column 2 first data cell: "${col2Data}"`
      );

      // Check for mismatch
      const isBedNumber = /^\d+$|^[A-Z]-\d+$/i.test(col2Data);
      const isName = /^[ა-ჰ]+$/u.test(col2Data);

      if (col2Text.includes('საწოლი') && isName) {
        addCheck(
          'Column 2 Consistency',
          false,
          'MISMATCH: Header says "საწოლი" (Bed) but data looks like names!',
          'warning'
        );
      } else if (col2Text.includes('საწოლი') && isBedNumber) {
        addCheck(
          'Column 2 Consistency',
          true,
          'Column 2 is correctly labeled as Bed with bed numbers'
        );
      } else if (col2Text.includes('სახელი') && isName) {
        addCheck(
          'Column 2 Consistency',
          true,
          'Column 2 is correctly labeled as First Name'
        );
      }
    }
  }

  // ==========================================
  // Check 3: Filter Form
  // ==========================================
  const form = document.querySelector('form');
  addCheck(
    'Filter Form Presence',
    !!form,
    form ? 'Filter form found' : 'No form found on page'
  );

  // ==========================================
  // Check 4: Doctor Dropdown
  // ==========================================
  const doctorSelect = document.querySelector('select[name*="doctor"], select[name*="ექიმი"]') ||
                       Array.from(document.querySelectorAll('select')).find(sel => {
                         const prevLabel = sel.previousElementSibling;
                         return prevLabel && prevLabel.textContent.includes('ექიმი');
                       });

  if (doctorSelect) {
    const optionCount = doctorSelect.options.length;
    addCheck(
      'Doctor Dropdown Found',
      true,
      `Doctor dropdown found with ${optionCount} options`
    );

    addCheck(
      'Doctor Dropdown Has Options',
      optionCount > 1,
      optionCount > 1 ? `${optionCount} doctor options available` : 'Doctor dropdown is empty!',
      optionCount > 1 ? 'info' : 'error'
    );
  } else {
    addCheck(
      'Doctor Dropdown Found',
      false,
      'Doctor dropdown not found - check selectors'
    );
  }

  // ==========================================
  // Check 5: Department Dropdown
  // ==========================================
  const deptSelect = document.querySelector('select[name*="department"], select[name*="განყოფილება"]') ||
                     Array.from(document.querySelectorAll('select')).find(sel => {
                       const prevLabel = sel.previousElementSibling;
                       return prevLabel && prevLabel.textContent.includes('განყოფილება');
                     });

  if (deptSelect) {
    const optionCount = deptSelect.options.length;
    addCheck(
      'Department Dropdown Found',
      true,
      `Department dropdown found with ${optionCount} options`
    );

    addCheck(
      'Department Dropdown Has Options',
      optionCount > 1,
      optionCount > 1 ? `${optionCount} department options available` : 'Department dropdown is empty!',
      optionCount > 1 ? 'info' : 'error'
    );
  } else {
    addCheck(
      'Department Dropdown Found',
      false,
      'Department dropdown not found - check selectors'
    );
  }

  // ==========================================
  // Check 6: Transferred Checkbox
  // ==========================================
  const transferredCheckbox = document.querySelector('input[type="checkbox"][name*="transfer"]') ||
                              Array.from(document.querySelectorAll('input[type="checkbox"]')).find(cb => {
                                const label = cb.labels?.[0]?.textContent || '';
                                return label.includes('გადწერილება');
                              });

  addCheck(
    'Transferred Checkbox Found',
    !!transferredCheckbox,
    transferredCheckbox ?
      `Transferred checkbox found (name="${transferredCheckbox.name}", id="${transferredCheckbox.id}")` :
      'Transferred checkbox not found'
  );

  // ==========================================
  // Check 7: Registration Number Input
  // ==========================================
  const regNumberInput = document.querySelector('input[name*="registration"], input[name*="reg"]') ||
                         Array.from(document.querySelectorAll('input[type="text"]')).find(inp => {
                           const label = inp.labels?.[0]?.textContent || '';
                           return label.includes('ისხ');
                         });

  addCheck(
    'Registration Number Input Found',
    !!regNumberInput,
    regNumberInput ?
      `Registration number input found (name="${regNumberInput.name}")` :
      'Registration number input not found'
  );

  // ==========================================
  // Check 8: Search Button
  // ==========================================
  const searchButton = document.querySelector('button[type="submit"]') ||
                       Array.from(document.querySelectorAll('button, input[type="submit"]')).find(btn => {
                         return btn.textContent.includes('ძებნა') || btn.value?.includes('ძებნა');
                       });

  addCheck(
    'Search Button Found',
    !!searchButton,
    searchButton ? 'Search button found' : 'Search button not found'
  );

  // ==========================================
  // Check 9: Table Has Data
  // ==========================================
  if (table) {
    const rows = table.querySelectorAll('tbody tr');
    addCheck(
      'Table Has Data Rows',
      rows.length > 0,
      `Table has ${rows.length} data rows`,
      rows.length === 0 ? 'warning' : 'info'
    );
  }

  // ==========================================
  // Check 10: Georgian Text Encoding
  // ==========================================
  const georgianText = document.body.textContent;
  const hasGeorgian = /[ა-ჰ]/u.test(georgianText);
  addCheck(
    'Georgian Text Rendering',
    hasGeorgian,
    hasGeorgian ? 'Georgian characters rendering correctly' : 'No Georgian text found - encoding issue?',
    hasGeorgian ? 'info' : 'warning'
  );

  // ==========================================
  // Generate Report
  // ==========================================
  console.log('\n' + '='.repeat(50));
  console.log('VERIFICATION REPORT');
  console.log('='.repeat(50));
  console.log(`Total Checks: ${report.summary.total}`);
  console.log(`✅ Passed: ${report.summary.passed}`);
  console.log(`❌ Failed: ${report.summary.failed}`);
  console.log(`⚠️  Warnings: ${report.summary.warnings}`);
  console.log('='.repeat(50));

  if (report.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    report.errors.forEach((err, idx) => {
      console.log(`  ${idx + 1}. ${err.name}: ${err.message}`);
    });
  }

  if (report.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    report.warnings.forEach((warn, idx) => {
      console.log(`  ${idx + 1}. ${warn.name}: ${warn.message}`);
    });
  }

  // ==========================================
  // Extraction Readiness Assessment
  // ==========================================
  console.log('\n' + '='.repeat(50));
  console.log('EXTRACTION READINESS');
  console.log('='.repeat(50));

  const readinessScore = (report.summary.passed / report.summary.total) * 100;

  if (readinessScore >= 90) {
    console.log(`✅ ${readinessScore.toFixed(0)}% - EXCELLENT! Page is ready for extraction.`);
  } else if (readinessScore >= 70) {
    console.log(`⚠️  ${readinessScore.toFixed(0)}% - GOOD. Some elements missing but extraction can proceed.`);
  } else if (readinessScore >= 50) {
    console.log(`⚠️  ${readinessScore.toFixed(0)}% - FAIR. Multiple elements missing. Verify you're on the correct page.`);
  } else {
    console.log(`❌ ${readinessScore.toFixed(0)}% - POOR. Many critical elements missing. Check page URL and navigation.`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('NEXT STEPS');
  console.log('='.repeat(50));

  if (report.summary.failed > 0) {
    console.log('1. Fix the errors listed above');
    console.log('2. Verify you are on the "ჩემი პაციენტები" page');
    console.log('3. Check that the page is fully loaded');
    console.log('4. Re-run this verification script');
  } else {
    console.log('✅ All critical elements found!');
    console.log('📋 Proceed with extraction using LIVE-EXTRACTION-GUIDE.md');
    console.log('📁 Save extraction data to: extraction-data/ folder');
  }

  console.log('\n' + '='.repeat(50));

  // Return report for programmatic access
  window.__extractionVerificationReport = report;
  console.log('\n💾 Full report saved to: window.__extractionVerificationReport');
  console.log('Copy report with: copy(JSON.stringify(window.__extractionVerificationReport, null, 2))');

  return report;
})();
