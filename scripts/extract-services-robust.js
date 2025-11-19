/**
 * Services Nomenclature ROBUST Extraction Script
 *
 * IMPROVEMENTS OVER ORIGINAL:
 * - Extracts ALL 4 tabs (including missing Attributes tab)
 * - Better error handling with try/catch blocks
 * - Data validation and completeness checking
 * - Extraction statistics logging
 * - More robust table identification
 * - Works for ANY service type (consultation, operation, lab test)
 *
 * Created: 2025-11-18
 * Based on: extract-lab-tests-working.js
 */

const servicesExtractor = {
  config: {
    delayBetweenServices: 2000,
    delayAfterModalOpen: 2000,
    autoSaveInterval: 10,
    skipFirstRows: 3,
  },

  extractedServices: [],
  extractionStats: {
    total_processed: 0,
    successful: 0,
    failed: 0,
    partial: 0
  },

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  getRGBColor(element) {
    if (!element) return null;
    return window.getComputedStyle(element).backgroundColor;
  },

  findMainTable() {
    const tables = Array.from(document.querySelectorAll('table'));

    // Find table that has service codes (like CO456, BL001, JXDD3A)
    const serviceTable = tables.find(table => {
      const rows = table.querySelectorAll('tbody tr');
      if (rows.length < 10) return false;

      // Check first 5 rows for service code pattern
      const hasServiceCodes = Array.from(rows).slice(0, 5).some(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 10) return false; // Service table should have 10+ columns

        const code = cells[0]?.textContent.trim() || '';
        // Match patterns like: CO456, BL001, JXDD3A, I20-I25
        return /[A-Z]{2,}\d+/.test(code) || /[A-Z]\d+-[A-Z]\d+/.test(code);
      });

      return hasServiceCodes;
    });

    if (serviceTable) return serviceTable;

    // Fallback: largest table with >10 rows
    return tables.reduce((largest, table) => {
      const rows = table.querySelectorAll('tbody tr').length;
      return rows > (largest?.querySelectorAll('tbody tr').length || 0) ? table : largest;
    }, null);
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

  /**
   * Extract selected value from dropdown OR text content
   * CRITICAL: Only returns SELECTED value, not all options!
   */
  extractSelectedValue(cell) {
    if (!cell) return '';

    const select = cell.querySelector('select');
    if (select) {
      const selectedOption = select.options[select.selectedIndex];
      return selectedOption?.text?.trim() || '';
    }

    return cell.textContent.trim() || '';
  },

  /**
   * Find label text for a checkbox element
   */
  findLabelForCheckbox(checkbox) {
    const id = checkbox.id;
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) return label.textContent.trim();
    }

    const parentLabel = checkbox.closest('label');
    if (parentLabel) return parentLabel.textContent.trim();

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

  /**
   * Extract ALL data from modal (all tabs visible at once)
   * Structure: Financial → Salary → Medical → Attributes
   */
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
          provider: '',
          external_order_code: ''
        }
      },
      attributes: {
        color_tags: [],
        active_dates: {
          start: '',
          end: ''
        },
        color: '',
        various_codes: [],
        subgroup: ''
      },
      _extraction_stats: {
        tables_found: 0,
        insurance_table: false,
        samples_table: false,
        components_table: false,
        attributes_extracted: false
      }
    };

    const tables = modal.querySelectorAll('table');
    data._extraction_stats.tables_found = tables.length;
    console.log(`  📊 Found ${tables.length} tables in modal`);

    // SECTION 1: EXTRACT FINANCIAL TAB DATA
    try {
      this.extractFinancialTab(modal, tables, data);
    } catch (error) {
      console.warn('  ⚠️ Error extracting Financial tab:', error.message);
    }

    // SECTION 2: EXTRACT SALARY TAB DATA
    try {
      this.extractSalaryTab(modal, tables, data);
    } catch (error) {
      console.warn('  ⚠️ Error extracting Salary tab:', error.message);
    }

    // SECTION 3: EXTRACT MEDICAL TAB DATA
    try {
      this.extractMedicalTab(modal, tables, data);
    } catch (error) {
      console.warn('  ⚠️ Error extracting Medical tab:', error.message);
    }

    // SECTION 4: EXTRACT ATTRIBUTES TAB DATA (NEW!)
    try {
      this.extractAttributesTab(modal, tables, data);
      data._extraction_stats.attributes_extracted = true;
    } catch (error) {
      console.warn('  ⚠️ Error extracting Attributes tab:', error.message);
    }

    return data;
  },

  /**
   * Extract Financial Tab data
   */
  extractFinancialTab(modal, tables, data) {
    // Extract insurance pricing table (20-60 rows, 4-5 columns)
    // IMPROVED: Handles both 4 and 5 column tables (5th column is usually actions)
    tables.forEach((table, index) => {
      const rows = table.querySelectorAll('tbody tr');
      const rowCount = rows.length;

      // CRITICAL FIX: Skip header row (<th> elements) - check row 1 instead of row 0
      const dataRow = rows[1] || rows[0]; // Use row 1 if exists, fallback to row 0
      const columnCount = dataRow?.querySelectorAll('td').length || 0;

      // Insurance pricing table - FLEXIBLE DETECTION
      // Check: 20-60 rows, 4 OR 5 columns (5th is action buttons)
      if (rowCount >= 20 && rowCount <= 60 && (columnCount === 4 || columnCount === 5)) {
        // Additional validation: check if first data row looks like insurance data
        const cells = dataRow?.querySelectorAll('td');
        const firstCell = cells[0]?.textContent.trim() || '';

        // Skip if first cell looks like a header or number
        if (firstCell && firstCell.length > 3 && !/^\d+$/.test(firstCell)) {
          console.log(`    💰 Extracting insurance pricing from table ${index + 1} (${rowCount} rows, ${columnCount} cols)`);
          data._extraction_stats.insurance_table = true;

          rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 4) {
              const companyName = cells[0]?.textContent.trim();
              const date = cells[1]?.textContent.trim();
              const price = cells[2]?.textContent.trim();
              const currency = cells[3]?.textContent.trim();
              // cells[4] is action column (ignored)

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
      }
    });

    // Extract GIS code
    const allInputs = modal.querySelectorAll('input[type="text"]');
    allInputs.forEach(input => {
      const value = input.value?.trim();
      if (!value || value.length === 0) return;

      if (value.length > 30 && value.includes('-')) {
        data.financial.gis_code = value;
      }
    });

    // Extract configuration dropdowns
    const allSelects = modal.querySelectorAll('select');
    allSelects.forEach((select, index) => {
      const selectedOption = select.options[select.selectedIndex];
      const value = selectedOption?.text?.trim();

      if (!value || value.length === 0 || value === '0') return;

      // Map dropdowns by Georgian text patterns
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
        if (!data.financial.wait_result) {
          data.financial.wait_result = value;
        }
      } else if (value.includes('აქტიურ')) {
        data.financial.patient_history_match = value;
      } else if (value.includes('განყოფილებაში')) {
        data.financial.department_assignment = value;
      }
    });
  },

  /**
   * Extract Salary Tab data
   */
  extractSalaryTab(modal, tables, data) {
    // Extract salary configuration dropdowns
    const allSelects = modal.querySelectorAll('select');
    allSelects.forEach(select => {
      const selectedOption = select.options[select.selectedIndex];
      const value = selectedOption?.text?.trim();

      if (!value || value.length === 0) return;

      if (value.includes('ქვეკით') || value.includes('ზევით')) {
        data.salary.salary_type = value;
      } else if (value.includes('დაზღვ')) {
        data.salary.insurance_type = value;
      }
    });

    // Extract performer tables
    tables.forEach((table, index) => {
      const rows = table.querySelectorAll('tbody tr');
      const rowCount = rows.length;

      // FIXED: Expanded row range from 1-5 to 1-20 to capture operations with many performers
      if (rowCount >= 1 && rowCount <= 20) {
        const firstRow = rows[0];
        const cells = firstRow?.querySelectorAll('td');

        if (cells && cells.length >= 4) {
          const cell0 = cells[0]?.textContent.trim() || '';
          const cell1 = cells[1]?.textContent.trim() || '';

          // IMPROVED: Added more patterns (ანესთეზიოლოგი, ასისტენტი)
          if (cell0.includes('შემსრულებელი') || cell0.includes('ოპერატორი') ||
              cell0.includes('ანესთეზიოლოგი') || cell0.includes('ასისტენტი') ||
              cell1.includes('მიქრო') || cell1.includes('პრივანა') || cell1.includes('მოჭრილი')) {
            console.log(`    👥 Extracting salary data from table ${index + 1} (${rowCount} rows)`);

            rows.forEach(row => {
              const salaryCells = row.querySelectorAll('td');
              if (salaryCells.length >= 5) {
                data.salary.tables.push({
                  performer_type: this.extractSelectedValue(salaryCells[0]),
                  micro_type: this.extractSelectedValue(salaryCells[1]),
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
  },

  /**
   * Extract Medical Tab data
   */
  extractMedicalTab(modal, tables, data) {
    tables.forEach((table, index) => {
      const rows = table.querySelectorAll('tbody tr');
      const rowCount = rows.length;

      // SAMPLES TABLE (2-10 rows with color bars + sample codes)
      if (rowCount >= 2 && rowCount <= 10) {
        const firstRow = rows[0];
        const cells = firstRow?.querySelectorAll('td');

        if (cells && cells.length >= 3) {
          const cellText = cells[1]?.textContent.trim() || '';

          if (cellText.includes('K2EDTA') || cellText.includes('ESR') || cellText.includes('Sod.Cit')) {
            console.log(`    🧪 Extracting samples from table ${index + 1} (${rowCount} rows)`);
            data._extraction_stats.samples_table = true;

            rows.forEach(row => {
              const sampleCells = row.querySelectorAll('td');
              if (sampleCells.length >= 3) {
                // Extract color from first cell
                let color = '';
                const colorBar = sampleCells[0]?.querySelector('[style*="background"]');
                if (colorBar) {
                  color = this.getRGBColor(colorBar);
                }

                const sampleCode = this.extractSelectedValue(sampleCells[1]);
                const description = this.extractSelectedValue(sampleCells[2]);
                const biomatType = sampleCells.length >= 4 ? this.extractSelectedValue(sampleCells[3]) : '';

                // IMPROVED: Only add if at least sample code or description has value
                if (sampleCode || description || color) {
                  data.medical.samples.push({
                    sample_code: sampleCode,
                    color: color,
                    description: description,
                    biomat_type: biomatType
                  });
                }
              }
            });
          }
        }
      }

      // COMPONENTS TABLE (5-15 rows with test codes)
      if (rowCount >= 5 && rowCount <= 15) {
        const firstRow = rows[0];
        const cells = firstRow?.querySelectorAll('td');

        if (cells && cells.length >= 3) {
          const cell0Text = cells[0]?.textContent.trim() || '';
          const cell1Text = cells[1]?.textContent.trim() || '';

          if (cell1Text === 'PT' || cell1Text === 'INR' || cell1Text === 'APTT' ||
              cell1Text === 'TT' || cell1Text === 'FIBR' ||
              cell0Text.includes('K2EDTA') || cell0Text.includes('630f61fc')) {
            console.log(`    🔬 Extracting components from table ${index + 1} (${rowCount} rows)`);
            data._extraction_stats.components_table = true;

            rows.forEach(row => {
              const compCells = row.querySelectorAll('td');
              if (compCells.length >= 3) {
                const sampleId = this.extractSelectedValue(compCells[0]);
                const testCode = this.extractSelectedValue(compCells[1]);
                const testName = this.extractSelectedValue(compCells[2]);

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

    // Extract LIS integration checkbox
    const lisCheckbox = Array.from(modal.querySelectorAll('input[type="checkbox"]')).find(cb => {
      const label = this.findLabelForCheckbox(cb);
      return label && label.includes('LIS');
    });

    if (lisCheckbox) {
      data.medical.lis_integration.enabled = lisCheckbox.checked;
    }

    // Extract LIS provider dropdown
    const lisDropdowns = Array.from(modal.querySelectorAll('select')).filter(select => {
      const options = Array.from(select.options).map(o => o.text);
      return options.some(o => o.includes('WebLab') || o.includes('Limbach') || o.includes('TerraLab'));
    });

    if (lisDropdowns.length > 0) {
      const selectedOption = lisDropdowns[0].options[lisDropdowns[0].selectedIndex];
      data.medical.lis_integration.provider = selectedOption?.text?.trim() || '';
    }
  },

  /**
   * Extract Attributes Tab data (NEW!)
   */
  extractAttributesTab(modal, tables, data) {
    console.log('    🎨 Extracting Attributes tab data...');

    // Extract color picker value
    const allInputs = modal.querySelectorAll('input[type="text"], input[type="color"]');
    allInputs.forEach(input => {
      const value = input.value?.trim();
      if (value && value.startsWith('#') && value.length === 7) {
        data.attributes.color = value;
      }
    });

    // Extract active dates
    const dateInputs = modal.querySelectorAll('input[type="date"], input[placeholder*="თარიღ"]');
    if (dateInputs.length >= 2) {
      data.attributes.active_dates.start = dateInputs[0]?.value || '';
      data.attributes.active_dates.end = dateInputs[1]?.value || '';
    }

    // Extract color tags/badges
    const tagElements = modal.querySelectorAll('[onclick*="remove"], [title*="წაშლა"], .tag, .badge');
    tagElements.forEach(elem => {
      const tagText = elem.textContent?.trim();
      if (tagText && tagText.length > 2 && !tagText.includes('×') && !tagText.includes('X')) {
        if (!data.attributes.color_tags.includes(tagText)) {
          data.attributes.color_tags.push(tagText);
        }
      }
    });

    // Alternative tag extraction: Look for "ტევები" section
    const headers = modal.querySelectorAll('div, span, label');
    headers.forEach(header => {
      if (header.textContent?.includes('ტევები') || header.textContent?.includes('ტევი')) {
        const section = header.closest('div[class*="section"], div[class*="group"], fieldset');
        if (section) {
          const tagItems = section.querySelectorAll('div, span');
          tagItems.forEach(item => {
            const text = item.textContent?.trim();
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

    // Extract various codes table (ფილიალი | განყოფილება)
    tables.forEach((table, index) => {
      const rows = table.querySelectorAll('tbody tr');
      const rowCount = rows.length;

      // FIXED: Expanded row range from 1-10 to 1-150 for large hospitals
      if (rowCount >= 1 && rowCount <= 150) {
        const headerRow = table.querySelector('thead tr');
        if (headerRow) {
          const headerText = headerRow.textContent;
          if (headerText.includes('ფილიალი') && headerText.includes('განყოფილება')) {
            console.log(`    🏢 Extracting various codes from table ${index + 1} (${rowCount} rows)`);
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

    // Extract subgroup dropdown (50+ options)
    const subgroupDropdowns = Array.from(modal.querySelectorAll('select')).filter(select => {
      return select.options.length >= 40; // Subgroup has 50+ options
    });

    if (subgroupDropdowns.length > 0) {
      const selectedOption = subgroupDropdowns[0].options[subgroupDropdowns[0].selectedIndex];
      data.attributes.subgroup = selectedOption?.text?.trim() || '';
    }
  },

  /**
   * Validate extracted data and log statistics
   */
  validateExtraction(data, serviceCode) {
    const stats = data._extraction_stats;
    const warnings = [];

    if (stats.tables_found < 5) {
      warnings.push(`Only ${stats.tables_found} tables found (expected 10+)`);
    }

    if (!stats.insurance_table) {
      warnings.push('Insurance pricing table not found');
    }

    if (data.financial.insurance_companies.length === 0) {
      warnings.push('No insurance companies extracted');
    }

    // For lab tests, expect samples and components
    if (serviceCode.includes('BL') || serviceCode.includes('HR') || serviceCode.includes('PT')) {
      if (!stats.samples_table) {
        warnings.push('Samples table not found (expected for lab test)');
      }
      if (!stats.components_table) {
        warnings.push('Components table not found (expected for lab test)');
      }
    }

    if (!stats.attributes_extracted) {
      warnings.push('Attributes tab extraction failed');
    }

    if (warnings.length > 0) {
      console.warn(`  ⚠️ Validation warnings for ${serviceCode}:`);
      warnings.forEach(w => console.warn(`     - ${w}`));
      return 'partial';
    }

    console.log(`  ✅ All validations passed for ${serviceCode}`);
    return 'complete';
  },

  async extractSingleService(rowIndex) {
    console.log(`\n[${rowIndex}] Processing service...`);

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

      console.log(`  Service: ${basicInfo.code} - ${basicInfo.name_georgian}`);

      // Double-click row to open modal
      row.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      await this.sleep(this.config.delayAfterModalOpen);

      // Find modal
      let modal = document.querySelector('.modal.show, [role="dialog"], .overlay');
      if (!modal) {
        const allDivs = Array.from(document.querySelectorAll('div'));
        modal = allDivs.find(div => {
          const text = div.textContent;
          return text.includes('ფინანსური') && text.includes('სამედიცინო') && div.querySelector('table');
        });
      }

      if (!modal) throw new Error('Modal not found');

      console.log('  ✅ Modal found');

      // Extract all data at once (all tabs loaded!)
      console.log('  📊 Extracting data from all tabs...');
      const modalData = this.extractModalData(modal);

      // Validate extraction
      const validationStatus = this.validateExtraction(modalData, basicInfo.code);

      // Structure final data
      const serviceData = {
        code: basicInfo.code,
        name_georgian: basicInfo.name_georgian,
        financial: modalData.financial,
        salary: modalData.salary,
        medical: modalData.medical,
        attributes: modalData.attributes,
        extraction_metadata: {
          extracted_at: new Date().toISOString(),
          validation_status: validationStatus,
          stats: modalData._extraction_stats
        }
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

      await this.sleep(this.config.delayBetweenServices);

      // Update stats
      this.extractionStats.total_processed++;
      if (validationStatus === 'complete') {
        this.extractionStats.successful++;
      } else if (validationStatus === 'partial') {
        this.extractionStats.partial++;
      }

      console.log(`✅ Service ${rowIndex} extracted (${validationStatus})`);
      return serviceData;

    } catch (error) {
      console.error(`❌ Error extracting service ${rowIndex}:`, error.message);
      this.extractionStats.total_processed++;
      this.extractionStats.failed++;
      return null;
    }
  },

  async extractAllServices(startIndex = 1, endIndex = null) {
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
    console.log(`🚀 Starting extraction: Services ${startIndex}-${lastIndex} of ${totalDataRows}`);
    console.log(`   (Skipping first ${this.config.skipFirstRows} filter rows)`);
    console.log(`${'='.repeat(60)}\n`);

    this.extractedServices = [];
    this.extractionStats = {
      total_processed: 0,
      successful: 0,
      partial: 0,
      failed: 0
    };

    for (let i = startIndex; i <= lastIndex && i <= totalDataRows; i++) {
      try {
        const serviceData = await this.extractSingleService(i);
        if (serviceData) {
          this.extractedServices.push(serviceData);

          if (this.extractedServices.length % this.config.autoSaveInterval === 0) {
            console.log(`\n💾 Auto-saving... (${this.extractedServices.length} services extracted so far)`);
            this.downloadJSON(`extracted-services-robust-backup-${this.extractedServices.length}.json`);
          }
        }
      } catch (error) {
        console.error(`❌ Error at service ${i}:`, error);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Extraction complete!`);
    console.log(`   Total: ${this.extractionStats.total_processed}`);
    console.log(`   ✅ Complete: ${this.extractionStats.successful}`);
    console.log(`   ⚠️  Partial: ${this.extractionStats.partial}`);
    console.log(`   ❌ Failed: ${this.extractionStats.failed}`);
    console.log(`${'='.repeat(60)}\n`);

    if (this.extractedServices.length > 0) {
      console.log('💾 Saving final results...');
      this.downloadJSON('extracted-services-robust.json');
    }

    return this.extractedServices;
  },

  getExtractedServices() {
    return this.extractedServices;
  },

  getExtractionStats() {
    return this.extractionStats;
  },

  downloadJSON(filename = 'extracted-services-robust.json') {
    const json = JSON.stringify({
      extraction_metadata: {
        extraction_date: new Date().toISOString(),
        total_services: this.extractedServices.length,
        extraction_method: 'Browser Console Script (Robust - All 4 Tabs)',
        source_url: window.location.href,
        statistics: this.extractionStats,
        improvements: [
          'Extracts all 4 tabs (including Attributes)',
          'Better error handling with try/catch',
          'Data validation and completeness checking',
          'Extraction statistics logging',
          'Works for ANY service type'
        ]
      },
      services: this.extractedServices
    }, null, 2);

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    console.log(`✅ Downloaded: ${filename} (${this.extractedServices.length} services)`);
  }
};

window.servicesExtractor = servicesExtractor;

console.log(`
╔═══════════════════════════════════════════════════════════╗
║  Services Nomenclature ROBUST Extraction Script          ║
╠═══════════════════════════════════════════════════════════╣
║  IMPROVEMENTS:                                             ║
║  ✅ Extracts ALL 4 tabs (including Attributes)            ║
║  ✅ Better error handling (try/catch per section)         ║
║  ✅ Data validation & completeness checking               ║
║  ✅ Extraction statistics logging                         ║
║  ✅ Works for ANY service type (consultation/op/lab)      ║
║                                                            ║
║  Extracts:                                                 ║
║  • Financial: Insurance (50 rows), GIS code, 14 dropdowns ║
║  • Salary: Performer tables, salary config                ║
║  • Medical: Samples (colors), Components (test codes),    ║
║             LIS integration                               ║
║  • Attributes: Color, dates, tags, codes table (NEW!)     ║
╠═══════════════════════════════════════════════════════════╣
║  Usage:                                                    ║
║  1. await servicesExtractor.extractAllServices(1, 5)      ║
║     → Test with first 5 services                          ║
║                                                            ║
║  2. await servicesExtractor.extractAllServices()          ║
║     → Extract ALL services with auto-save                 ║
║                                                            ║
║  3. servicesExtractor.getExtractionStats()                ║
║     → View extraction statistics                          ║
╚═══════════════════════════════════════════════════════════╝

Ready! Run: await servicesExtractor.extractAllServices(1, 5)
`);
