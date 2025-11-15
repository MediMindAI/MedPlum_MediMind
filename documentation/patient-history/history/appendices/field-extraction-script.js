// FIELD EXTRACTION SCRIPT FOR VISIT EDIT WINDOW
// Instructions: Open the visit edit window in browser, press F12, paste this entire script in Console tab

console.log("=== VISIT EDIT WINDOW FIELD EXTRACTION ===\n");

const modal = document.querySelector('.modal.show') || document.querySelector('[role="dialog"]') || document.body;

const allInputs = Array.from(modal.querySelectorAll('input'));
const allSelects = Array.from(modal.querySelectorAll('select'));
const allTextareas = Array.from(modal.querySelectorAll('textarea'));
const allButtons = Array.from(modal.querySelectorAll('button'));

console.log("COUNTS:");
console.log(`Total inputs: ${allInputs.length}`);
console.log(`Total selects: ${allSelects.length}`);
console.log(`Total textareas: ${allTextareas.length}`);
console.log(`Total buttons: ${allButtons.length}`);

console.log("\n=== INPUT FIELDS ===");
allInputs.forEach((input, idx) => {
  const label = input.closest('label') || document.querySelector(`label[for="${input.id}"]`);
  const labelText = label ? label.textContent.trim() : 'NO_LABEL';
  console.log(`Input ${idx}:`);
  console.log(`  Type: ${input.type}`);
  console.log(`  ID: ${input.id || 'NO_ID'}`);
  console.log(`  Name: ${input.name || 'NO_NAME'}`);
  console.log(`  Value: ${input.value || 'EMPTY'}`);
  console.log(`  Placeholder: ${input.placeholder || 'NONE'}`);
  console.log(`  Label: ${labelText}`);
  console.log(`  Required: ${input.required}`);
  console.log('---');
});

console.log("\n=== SELECT DROPDOWNS ===");
allSelects.forEach((select, idx) => {
  const label = select.closest('label') || document.querySelector(`label[for="${select.id}"]`);
  const labelText = label ? label.textContent.trim() : 'NO_LABEL';
  console.log(`Select ${idx}:`);
  console.log(`  ID: ${select.id || 'NO_ID'}`);
  console.log(`  Name: ${select.name || 'NO_NAME'}`);
  console.log(`  Label: ${labelText}`);
  console.log(`  Options Count: ${select.options.length}`);
  console.log(`  Current Value: ${select.value}`);
  console.log('---');
});

console.log("\n=== TEXTAREAS ===");
allTextareas.forEach((textarea, idx) => {
  const label = textarea.closest('label') || document.querySelector(`label[for="${textarea.id}"]`);
  const labelText = label ? label.textContent.trim() : 'NO_LABEL';
  console.log(`Textarea ${idx}:`);
  console.log(`  ID: ${textarea.id || 'NO_ID'}`);
  console.log(`  Name: ${textarea.name || 'NO_NAME'}`);
  console.log(`  Label: ${labelText}`);
  console.log(`  Rows: ${textarea.rows}`);
  console.log('---');
});

console.log("\n=== BUTTONS ===");
allButtons.forEach((button, idx) => {
  console.log(`Button ${idx}: ${button.textContent.trim()} (type: ${button.type})`);
});

console.log("\n\n=== TO EXTRACT SPECIFIC DROPDOWN OPTIONS ===");
console.log("Run this command (replace INDEX with select number):");
console.log("const sel = document.querySelectorAll('select')[INDEX];");
console.log("Array.from(sel.options).forEach((opt, i) => console.log(`${i}: value='${opt.value}' text='${opt.textContent.trim()}'`));");

console.log("\n=== EXTRACTION COMPLETE ===");
console.log("Copy the output above and provide to documentation team.");
