/**
 * Quick Test - Insurance Table Extraction
 * Run this in browser console to verify the fix works
 */

(function testInsuranceExtraction() {
  const modal = document.querySelector('.overlay');
  if (!modal) {
    console.error('❌ No modal found! Open a service first.');
    return;
  }

  const tables = modal.querySelectorAll('table');
  console.log(`Found ${tables.length} tables in modal\n`);

  let insuranceData = [];
  let foundInsuranceTable = false;

  tables.forEach((table, index) => {
    const rows = table.querySelectorAll('tbody tr');
    const rowCount = rows.length;
    const columnCount = rows[0]?.querySelectorAll('td').length || 0;

    // NEW FLEXIBLE DETECTION (20-60 rows, not 40-60)
    if (rowCount >= 20 && rowCount <= 60 && columnCount === 4) {
      const firstRow = rows[0];
      const cells = firstRow?.querySelectorAll('td');
      const firstCell = cells[0]?.textContent.trim() || '';

      console.log(`\nTable ${index}:`);
      console.log(`  Rows: ${rowCount}, Columns: ${columnCount}`);
      console.log(`  First cell: "${firstCell.substring(0, 30)}..."`);
      console.log(`  First cell length: ${firstCell.length}`);
      console.log(`  Is number: ${/^\d+$/.test(firstCell)}`);

      // Skip if first cell looks like a header or pure number
      if (firstCell && firstCell.length > 3 && !/^\d+$/.test(firstCell)) {
        console.log(`  ✅ MATCHES insurance table criteria!`);
        foundInsuranceTable = true;

        // Extract first 3 rows as sample
        for (let i = 0; i < Math.min(3, rowCount); i++) {
          const row = rows[i];
          const cells = row.querySelectorAll('td');
          insuranceData.push({
            company: cells[0]?.textContent.trim().substring(0, 40),
            date: cells[1]?.textContent.trim(),
            price: cells[2]?.textContent.trim(),
            currency: cells[3]?.textContent.trim()
          });
        }
      } else {
        console.log(`  ❌ Does NOT match (too short or is number)`);
      }
    }
  });

  console.log('\n' + '='.repeat(60));
  if (foundInsuranceTable) {
    console.log('✅ SUCCESS! Insurance table found and extracted');
    console.log(`Sample data (first 3 rows):`);
    insuranceData.forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.company} | ${item.date} | ${item.price} ${item.currency}`);
    });
  } else {
    console.log('❌ FAILED! No insurance table found');
    console.log('This means the detection logic needs further adjustment');
  }
  console.log('='.repeat(60));

  return {
    success: foundInsuranceTable,
    sampleData: insuranceData
  };
})();
