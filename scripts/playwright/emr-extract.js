// Comprehensive EMR page extraction script
// Usage: npx tsx scripts/playwright/evaluate.ts --file "scripts/playwright/emr-extract.js" --stringify

({
  // Page metadata
  page: {
    url: window.location.href,
    title: document.title,
    timestamp: new Date().toISOString()
  },

  // All forms and fields
  forms: Array.from(document.querySelectorAll('form')).map(form => ({
    id: form.id,
    name: form.name,
    action: form.action,
    method: form.method,
    fields: Array.from(form.elements).map(el => ({
      tag: el.tagName,
      type: el.type,
      id: el.id,
      name: el.name,
      required: el.required,
      value: el.value,
      placeholder: el.placeholder,
      label: el.labels?.[0]?.textContent?.trim(),
      onclick: el.getAttribute('onclick'),
      onchange: el.getAttribute('onchange'),
      disabled: el.disabled,
      readonly: el.readOnly,
      maxLength: el.maxLength > 0 ? el.maxLength : null,
      pattern: el.pattern || null,
      className: el.className
    }))
  })),

  // All dropdowns with options
  dropdowns: Array.from(document.querySelectorAll('select')).map(select => ({
    id: select.id,
    name: select.name,
    required: select.required,
    disabled: select.disabled,
    selectedValue: select.value,
    optionCount: select.options.length,
    options: Array.from(select.options).map(opt => ({
      value: opt.value,
      text: opt.text,
      selected: opt.selected
    }))
  })),

  // All interactive elements (buttons, links with onclick)
  buttons: Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], [onclick]')).map((btn, idx) => ({
    index: idx,
    tag: btn.tagName,
    type: btn.type,
    id: btn.id,
    name: btn.name,
    text: btn.textContent?.trim() || btn.value,
    onclick: btn.getAttribute('onclick'),
    disabled: btn.disabled,
    className: btn.className
  })),

  // All links
  links: Array.from(document.querySelectorAll('a[href]')).map((link, idx) => ({
    index: idx,
    href: link.href,
    text: link.textContent?.trim(),
    onclick: link.getAttribute('onclick'),
    target: link.target,
    className: link.className
  })),

  // Hidden fields (often contain important state)
  hidden: Array.from(document.querySelectorAll('[type="hidden"]')).map(el => ({
    name: el.name,
    id: el.id,
    value: el.value
  })),

  // All input fields (standalone, not in forms)
  inputs: Array.from(document.querySelectorAll('input:not(form input)')).map(el => ({
    tag: el.tagName,
    type: el.type,
    id: el.id,
    name: el.name,
    value: el.value,
    placeholder: el.placeholder,
    required: el.required
  })),

  // Tables (common in EMR systems)
  tables: Array.from(document.querySelectorAll('table')).map((table, idx) => ({
    index: idx,
    id: table.id,
    className: table.className,
    rowCount: table.rows.length,
    headers: Array.from(table.querySelectorAll('th')).map(th => th.textContent?.trim())
  })),

  // Modals/dialogs (common patterns)
  modals: Array.from(document.querySelectorAll('.modal, [role="dialog"], .popup, .dialog')).map(modal => ({
    id: modal.id,
    className: modal.className,
    visible: window.getComputedStyle(modal).display !== 'none',
    fields: Array.from(modal.querySelectorAll('input, select, textarea')).map(el => ({
      type: el.type || el.tagName.toLowerCase(),
      id: el.id,
      name: el.name
    }))
  })),

  // Summary statistics
  stats: {
    formCount: document.querySelectorAll('form').length,
    inputCount: document.querySelectorAll('input').length,
    selectCount: document.querySelectorAll('select').length,
    buttonCount: document.querySelectorAll('button, input[type="button"], input[type="submit"]').length,
    linkCount: document.querySelectorAll('a[href]').length,
    tableCount: document.querySelectorAll('table').length
  }
})
