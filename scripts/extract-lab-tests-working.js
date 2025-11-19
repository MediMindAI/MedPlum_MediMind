/**
 * Laboratory Tests WORKING Extraction Script
 *
 * KEY INSIGHT: All tabs are loaded at once in the modal!
 * No need to click tabs - just extract from specific table positions
 */

const labExtractor = {
  config: {
    delayBetweenTests: 2000,
    delayAfterModalOpen: 2000,
    autoSaveInterval: 10,
    skipFirstRows: 3,
  },

  extractedTests: [],

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  getRGBColor(element) {
    if (!element) return null;
    return window.getComputedStyle(element).backgroundColor;
  },

  findMainTable() {
    const tables = document.querySelectorAll('table');
    let largestTable = null;
    let maxRows = 0;

    for (const table of tables) {
      const rowCount = table.querySelectorAll('tbody tr').length;
      // Find the table with the most rows (should be the main data table)
      // Skip tables with very few rows (< 10)
      if (rowCount > 10 && rowCount > maxRows) {
        maxRows = rowCount;
        largestTable = table;
      }
    }

    return largestTable;
  },

  extractBasicInfo(row) {
    const cells = row.querySelectorAll('td');
    const code = cells[0]?.textContent.trim() || '';
    const name = cells[1]?.textContent.trim() || '';

    if (!code || !name) return null;
    if (/^[ა-ჰ\s]+$/.test(code) && !/[A-Za-z0-9]/.test(code)) return null;

    return {
      code,
      name_georgian: name,
    };
  },

  // Extract ALL data from modal (all tabs visible at once)
  // Structure follows tab order: ფინანსური → სახელფასო → სამედიცინო → ატრიბუტები
  extractModalData(modal) {
    const data = {
      financial: {
        insurance_companies: [],
        repeat_services: [],
        consilium_theme: '',
        gis_code: '',
        calculation_theme: '',
        calculation_counting: '',
        calculation_display: '',
        department_assignment: '',
        payment_calculation: '',
        payment_type: '',
        lab_analysis: '',
        wait_result: '',
        patient_history_match: ''
      },
      salary: {
        salary_type: '',
        insurance_type: '',
        tables: []
      },
      medical: {
        samples: [],
        components: [],
        lis_integration: {
          enabled: false,
          provider: ''
        }
      },
      attributes: {
        color_tags: [],
        active_dates: {
          start: '',
          end: ''
        },
        color: '',
        various_codes: []
      }
    };

    const tables = modal.querySelectorAll('table');
    console.log(`  Found ${tables.length} tables in modal`);

    tables.forEach((table, index) => {
      const rows = table.querySelectorAll('tbody tr');
      const rowCount = rows.length;

      // Table 5: Insurance pricing (52 rows)
      if (rowCount >= 40 && rowCount <= 60) {
        console.log(`    Extracting insurance pricing from table ${index + 1} (${rowCount} rows)`);
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 4) {
            const companyName = cells[0]?.textContent.trim();
            const date = cells[1]?.textContent.trim();
            const price = cells[2]?.textContent.trim();
            const currency = cells[3]?.textContent.trim();

            if (companyName && companyName !== 'ლარი' && companyName.length > 2) {
              data.financial.insurance_companies.push({
                company_name: companyName,
                date: date || '',
                price: price || '',
                currency: currency || ''
              });
            }
          }
        });
      }

      // Samples table (has color bars + sample codes)
      if (rowCount >= 2 && rowCount <= 10) {
        const firstRow = rows[0];
        const cells = firstRow?.querySelectorAll('td');

        // Check if first row has sample codes like "K2EDTA"
        if (cells && cells.length >= 3) {
          const cellText = cells[1]?.textContent.trim() || '';

          if (cellText.includes('K2EDTA') || cellText.includes('ESR') || cellText.includes('Sod.Cit')) {
            console.log(`    Extracting samples from table ${index + 1} (${rowCount} rows)`);

            rows.forEach(row => {
              const sampleCells = row.querySelectorAll('td');
              if (sampleCells.length >= 3) {
                // Get color from first cell
                let color = '';
                const colorBar = sampleCells[0]?.querySelector('[style*="background"]');
                if (colorBar) {
                  color = this.getRGBColor(colorBar);
                }

                // IMPORTANT: Only get SELECTED value from dropdowns, not all options
                // Extract sample code from cell[1] (may be dropdown or text)
                let sampleCode = '';
                const sampleCodeSelect = sampleCells[1]?.querySelector('select');
                if (sampleCodeSelect) {
                  sampleCode = sampleCodeSelect.options[sampleCodeSelect.selectedIndex]?.text?.trim() || '';
                } else {
                  sampleCode = sampleCells[1]?.textContent.trim() || '';
                }

                // Extract description from cell[2] (may be dropdown or text)
                let description = '';
                const descriptionSelect = sampleCells[2]?.querySelector('select');
                if (descriptionSelect) {
                  description = descriptionSelect.options[descriptionSelect.selectedIndex]?.text?.trim() || '';
                } else {
                  description = sampleCells[2]?.textContent.trim() || '';
                }

                // Extract biomat type from cell[3] (may be dropdown or text)
                let biomatType = '';
                const biomatSelect = sampleCells[3]?.querySelector('select');
                if (biomatSelect) {
                  biomatType = biomatSelect.options[biomatSelect.selectedIndex]?.text?.trim() || '';
                } else {
                  biomatType = sampleCells[3]?.textContent.trim() || '';
                }

                data.medical.samples.push({
                  sample_code: sampleCode,
                  color: color,
                  description: description,
                  biomat_type: biomatType
                });
              }
            });
          }
        }
      }

      // Components table (has test codes like PT, INR, APTT)
      // OR has colored background cells (purple/magenta) with K2EDTA codes
      if (rowCount >= 5 && rowCount <= 15) {
        const firstRow = rows[0];
        const cells = firstRow?.querySelectorAll('td');

        // Check if has test codes in second column
        if (cells && cells.length >= 3) {
          const cell0Text = cells[0]?.textContent.trim() || '';
          const cell1Text = cells[1]?.textContent.trim() || '';
          const cell2Text = cells[2]?.textContent.trim() || '';

          // Check for test codes OR K2EDTA sample IDs
          if (cell1Text === 'PT' || cell1Text === 'INR' || cell1Text === 'APTT' || cell1Text === 'TT' || cell1Text === 'FIBR' ||
              cell0Text.includes('K2EDTA') || cell0Text.includes('630f61fc')) {
            console.log(`    Extracting components from table ${index + 1} (${rowCount} rows)`);

            rows.forEach(row => {
              const compCells = row.querySelectorAll('td');
              if (compCells.length >= 3) {
                // Extract sample ID (may be dropdown or text)
                let sampleId = '';
                const sampleIdSelect = compCells[0]?.querySelector('select');
                if (sampleIdSelect) {
                  sampleId = sampleIdSelect.options[sampleIdSelect.selectedIndex]?.text?.trim() || '';
                } else {
                  sampleId = compCells[0]?.textContent.trim() || '';
                }

                // Extract test code (may be dropdown or text)
                let testCode = '';
                const testCodeSelect = compCells[1]?.querySelector('select');
                if (testCodeSelect) {
                  testCode = testCodeSelect.options[testCodeSelect.selectedIndex]?.text?.trim() || '';
                } else {
                  testCode = compCells[1]?.textContent.trim() || '';
                }

                // Extract test name (may be dropdown or text)
                let testName = '';
                const testNameSelect = compCells[2]?.querySelector('select');
                if (testNameSelect) {
                  testName = testNameSelect.options[testNameSelect.selectedIndex]?.text?.trim() || '';
                } else {
                  testName = compCells[2]?.textContent.trim() || '';
                }

                if (testCode && testCode.length > 0 && testCode !== 'კოდი') {
                  data.medical.components.push({
                    sample_id: sampleId,
                    test_code: testCode,
                    test_name: testName
                  });
                }
              }
            });
          }
        }
      }
    });

    // Extract LIS integration checkboxes
    const lisCheckbox = Array.from(modal.querySelectorAll('input[type="checkbox"]')).find(cb => {
      const label = this.findLabelForCheckbox(cb);
      return label && label.includes('LIS');
    });

    if (lisCheckbox) {
      data.medical.lis_integration.enabled = lisCheckbox.checked;
    }

    // Find LIS provider dropdown
    const lisDropdowns = Array.from(modal.querySelectorAll('select')).filter(select => {
      const options = Array.from(select.options).map(o => o.text);
      return options.some(o => o.includes('WebLab') || o.includes('Limbach') || o.includes('TerraLab'));
    });

    if (lisDropdowns.length > 0) {
      const selectedOption = lisDropdowns[0].options[lisDropdowns[0].selectedIndex];
      data.medical.lis_integration.provider = selectedOption?.text?.trim() || '';
    }

    // Extract salary table data (performer tables with 1-3 rows)
    tables.forEach((table, index) => {
      const rows = table.querySelectorAll('tbody tr');
      const rowCount = rows.length;

      // Salary performer tables (1-3 rows typically)
      if (rowCount >= 1 && rowCount <= 5) {
        const firstRow = rows[0];
        const cells = firstRow?.querySelectorAll('td');

        if (cells && cells.length >= 4) {
          const cell0 = cells[0]?.textContent.trim() || '';
          const cell1 = cells[1]?.textContent.trim() || '';

          // Look for performer table with columns: performer type | micro | value | checkbox | value | value
          if (cell0.includes('შემსრულებელი') || cell0.includes('ოპერატორი') || cell1.includes('მიქრო') || cell1.includes('პრივანა')) {
            console.log(`    Extracting salary data from table ${index + 1} (${rowCount} rows)`);

            rows.forEach(row => {
              const salaryCells = row.querySelectorAll('td');
              if (salaryCells.length >= 5) {
                // Extract performer type (may be dropdown)
                let performerType = '';
                const performerSelect = salaryCells[0]?.querySelector('select');
                if (performerSelect) {
                  performerType = performerSelect.options[performerSelect.selectedIndex]?.text?.trim() || '';
                } else {
                  performerType = salaryCells[0]?.textContent.trim() || '';
                }

                // Extract micro type (may be dropdown)
                let microType = '';
                const microSelect = salaryCells[1]?.querySelector('select');
                if (microSelect) {
                  microType = microSelect.options[microSelect.selectedIndex]?.text?.trim() || '';
                } else {
                  microType = salaryCells[1]?.textContent.trim() || '';
                }

                data.salary.tables.push({
                  performer_type: performerType,
                  micro_type: microType,
                  value_1: salaryCells[2]?.textContent.trim() || '',
                  checked: salaryCells[3]?.querySelector('input[type="checkbox"]')?.checked || false,
                  value_2: salaryCells[4]?.textContent.trim() || '',
                  total: salaryCells.length >= 6 ? salaryCells[5]?.textContent.trim() || '' : ''
                });
              }
            });
          }
        }
      }
    });

    // Extract text inputs (GIS code, color, etc.)
    const allInputs = modal.querySelectorAll('input[type="text"]');
    allInputs.forEach(input => {
      const value = input.value?.trim();
      if (!value || value.length === 0) return;

      // GIS code (UUID format) - in Financial tab
      if (value.length > 30 && value.includes('-')) {
        data.financial.gis_code = value;
      }
      // Color picker (hex color) - in Attributes tab
      else if (value.startsWith('#') && value.length === 7) {
        data.attributes.color = value;
      }
    });

    // Extract dropdowns and map to correct sections
    const allSelects = modal.querySelectorAll('select');

    allSelects.forEach((select, index) => {
      const selectedOption = select.options[select.selectedIndex];
      const value = selectedOption?.text?.trim();

      if (!value || value.length === 0 || value === '0') return;

      // Map dropdowns by Georgian text patterns to correct sections

      // FINANCIAL TAB dropdowns:
      if (value.includes('მორჩილად') || value.includes('არაპირდაპირი')) {
        data.financial.calculation_theme = value;
      } else if (value.includes('დათვლად')) {
        data.financial.calculation_counting = value;
      } else if (value.includes('ლაბორატორია')) {
        data.financial.lab_analysis = value;
      } else if (value.includes('გადახდასდელ') || value.includes('ჩანს')) {
        data.financial.payment_calculation = value;
      } else if (value.includes('ფქტიურ') || value.includes('ტარიფის')) {
        data.financial.payment_type = value;
      } else if (value === 'კი' || value === 'არა') {
        data.financial.wait_result = value;
      } else if (value.includes('აქტიურ')) {
        data.financial.patient_history_match = value;
      } else if (value.includes('განყოფილებაში')) {
        data.financial.department_assignment = value;
      }

      // SALARY TAB dropdowns:
      else if (value.includes('ქვეკით') || value.includes('ზევით')) {
        data.salary.salary_type = value;
      } else if (value.includes('დაზღვ')) {
        data.salary.insurance_type = value;
      }

    });

    // ATTRIBUTES TAB: Extract tags from "ტევები" section
    // Look for elements with X/remove buttons (typically spans or divs with onclick handlers)
    const tagElements = modal.querySelectorAll('[onclick*="remove"], [title*="წაშლა"], .tag, .badge');
    tagElements.forEach(elem => {
      const tagText = elem.textContent?.trim();
      if (tagText && tagText.length > 2 && !tagText.includes('×') && !tagText.includes('X')) {
        // Only add if not already in color_tags
        if (!data.attributes.color_tags.includes(tagText)) {
          data.attributes.color_tags.push(tagText);
        }
      }
    });

    // Alternative: Look for text items in ტევი section by finding elements near "ტევები" header
    const headers = modal.querySelectorAll('div, span, label');
    headers.forEach(header => {
      if (header.textContent?.includes('ტევები') || header.textContent?.includes('ტევი')) {
        // Find parent section
        const section = header.closest('div[class*="section"], div[class*="group"], fieldset');
        if (section) {
          // Look for displayed tag items (usually divs with text and X button)
          const tagItems = section.querySelectorAll('div, span');
          tagItems.forEach(item => {
            const text = item.textContent?.trim();
            // Check if has remove button sibling
            const hasRemoveButton = item.parentElement?.querySelector('[onclick], button, [class*="remove"]');
            if (hasRemoveButton && text && text.length > 5 && !text.includes('ტევი')) {
              if (!data.attributes.color_tags.includes(text)) {
                data.attributes.color_tags.push(text);
              }
            }
          });
        }
      }
    });

    // Extract date inputs for attributes active dates
    const dateInputs = modal.querySelectorAll('input[type="date"], input[placeholder*="თარიღ"]');
    if (dateInputs.length >= 2) {
      data.attributes.active_dates.start = dateInputs[0]?.value || '';
      data.attributes.active_dates.end = dateInputs[1]?.value || '';
    }

    // Extract various codes table (სხვადასხვა კოდები)
    tables.forEach((table, index) => {
      const rows = table.querySelectorAll('tbody tr');
      const rowCount = rows.length;

      // Look for tables with columns: ფილიალი | განყოფილება (Branch | Department)
      if (rowCount >= 1 && rowCount <= 10) {
        const headerRow = table.querySelector('thead tr');
        if (headerRow) {
          const headerText = headerRow.textContent;
          if (headerText.includes('ფილიალი') && headerText.includes('განყოფილება')) {
            rows.forEach(row => {
              const cells = row.querySelectorAll('td');
              if (cells.length >= 2) {
                data.attributes.various_codes.push({
                  branch: cells[0]?.textContent.trim() || '',
                  department: cells[1]?.textContent.trim() || '',
                  additional: cells.length >= 3 ? cells[2]?.textContent.trim() || '' : ''
                });
              }
            });
          }
        }
      }
    });

    return data;
  },

  findLabelForCheckbox(checkbox) {
    const id = checkbox.id;
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) return label.textContent.trim();
    }

    const parentLabel = checkbox.closest('label');
    if (parentLabel) {
      return parentLabel.textContent.trim();
    }

    let prev = checkbox.previousElementSibling;
    while (prev) {
      if (prev.tagName === 'LABEL' || prev.tagName === 'SPAN') {
        return prev.textContent.trim();
      }
      prev = prev.previousElementSibling;
    }

    const parent = checkbox.parentElement;
    if (parent) {
      let prevParent = parent.previousElementSibling;
      while (prevParent) {
        if (prevParent.tagName === 'LABEL' || prevParent.tagName === 'SPAN') {
          return prevParent.textContent.trim();
        }
        prevParent = prevParent.previousElementSibling;
      }
    }

    return '';
  },

  async extractSingleTest(rowIndex) {
    console.log(`\n[${rowIndex}] Processing test...`);

    try {
      const mainTable = this.findMainTable();
      if (!mainTable) throw new Error('Main table not found');

      const rows = mainTable.querySelectorAll('tbody tr');
      const actualRowIndex = rowIndex + this.config.skipFirstRows - 1;
      const row = rows[actualRowIndex];

      if (!row) throw new Error(`Row ${rowIndex} not found`);

      const basicInfo = this.extractBasicInfo(row);
      if (!basicInfo) {
        console.warn(`  ⚠️ Skipping row ${rowIndex} (invalid/filter row)`);
        return null;
      }

      console.log(`  Test: ${basicInfo.code} - ${basicInfo.name_georgian}`);

      // Double-click row
      row.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      await this.sleep(this.config.delayAfterModalOpen);

      // Find modal
      let modal = document.querySelector('.modal.show, [role="dialog"]');
      if (!modal) {
        const allDivs = Array.from(document.querySelectorAll('div'));
        modal = allDivs.find(div => {
          const text = div.textContent;
          return text.includes('ფინანსური') && text.includes('სამედიცინო') && div.querySelector('table');
        });
      }

      if (!modal) throw new Error('Modal not found');

      console.log('  ✅ Modal found');

      // Extract all data at once (no tab clicking needed!)
      console.log('  📊 Extracting data from all tables...');
      const modalData = this.extractModalData(modal);

      // Structure data in tab order: basic info → financial → salary → medical → attributes
      const testData = {
        code: basicInfo.code,
        name_georgian: basicInfo.name_georgian,
        financial: modalData.financial,
        salary: modalData.salary,
        medical: modalData.medical,
        attributes: modalData.attributes,
        extracted_at: new Date().toISOString()
      };

      // Close modal
      try {
        const closeButton = modal.querySelector('.close, [aria-label="Close"], button');
        if (closeButton) {
          closeButton.click();
        } else {
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27 }));
        }
      } catch (e) {
        // Ignore close errors
      }

      await this.sleep(this.config.delayBetweenTests);

      console.log(`✅ Test ${rowIndex} extracted successfully`);
      return testData;

    } catch (error) {
      console.error(`❌ Error extracting test ${rowIndex}:`, error.message);
      return null;
    }
  },

  async extractAllTests(startIndex = 1, endIndex = null) {
    const mainTable = this.findMainTable();
    if (!mainTable) {
      console.error('❌ Main table not found');
      return [];
    }

    const rows = mainTable.querySelectorAll('tbody tr');
    const totalRows = rows.length;
    const totalDataRows = totalRows - this.config.skipFirstRows;
    const lastIndex = endIndex || totalDataRows;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 Starting extraction: Tests ${startIndex}-${lastIndex} of ${totalDataRows}`);
    console.log(`   (Skipping first ${this.config.skipFirstRows} filter rows)`);
    console.log(`${'='.repeat(60)}\n`);

    this.extractedTests = [];

    for (let i = startIndex; i <= lastIndex && i <= totalDataRows; i++) {
      try {
        const testData = await this.extractSingleTest(i);
        if (testData) {
          this.extractedTests.push(testData);

          if (this.extractedTests.length % this.config.autoSaveInterval === 0) {
            console.log(`\n💾 Auto-saving... (${this.extractedTests.length} tests extracted so far)`);
            this.downloadJSON(`extracted-lab-tests-working-backup-${this.extractedTests.length}.json`);
          }
        }
      } catch (error) {
        console.error(`❌ Error at test ${i}:`, error);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Extraction complete! Extracted ${this.extractedTests.length} tests`);
    console.log(`${'='.repeat(60)}\n`);

    if (this.extractedTests.length > 0) {
      console.log('💾 Saving final results...');
      this.downloadJSON('extracted-lab-tests-working.json');
    }

    return this.extractedTests;
  },

  getExtractedTests() {
    return this.extractedTests;
  },

  downloadJSON(filename = 'extracted-lab-tests-working.json') {
    const json = JSON.stringify({
      extraction_metadata: {
        extraction_date: new Date().toISOString(),
        total_tests: this.extractedTests.length,
        extraction_method: 'Browser Console Script (Working - No Tab Switching)',
        source_url: window.location.href
      },
      tests: this.extractedTests
    }, null, 2);

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    console.log(`✅ Downloaded: ${filename} (${this.extractedTests.length} tests)`);
  }
};

window.labExtractor = labExtractor;

console.log(`
╔═══════════════════════════════════════════════════════════╗
║  Laboratory Tests WORKING Extraction Script Loaded        ║
╠═══════════════════════════════════════════════════════════╣
║  KEY INSIGHT: All tabs load at once - no switching!       ║
║                                                            ║
║  Extracts:                                                 ║
║  • Insurance pricing (Table 5 - 52 rows)                   ║
║  • Samples with RGB colors (color-coded table)            ║
║  • Components (PT, INR, APTT, etc.)                        ║
║  • LIS integration checkboxes + provider                  ║
╠═══════════════════════════════════════════════════════════╣
║  Usage:                                                    ║
║  1. await labExtractor.extractAllTests(1, 5)              ║
║     → Test with first 5 tests                             ║
║                                                            ║
║  2. await labExtractor.extractAllTests()                  ║
║     → Extract ALL 235 tests with auto-save                ║
║                                                            ║
║  3. labExtractor.getExtractedTests()                      ║
║     → View extracted data in console                      ║
╚═══════════════════════════════════════════════════════════╝

Ready! Run: await labExtractor.extractAllTests(1, 5)
`);
