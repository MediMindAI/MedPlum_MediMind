# Accessibility Testing Setup Guide

## Prerequisites

Before running accessibility tests, install the required dependency:

```bash
cd packages/app
npm install --save @mantine/dates@8.3.6
```

## Running Accessibility Tests

```bash
# Run all accessibility tests
npm test -- Accessibility.test.tsx

# Run specific test suite
npm test -- Accessibility.test.tsx -t "PatientForm"

# Run with coverage
npm test -- Accessibility.test.tsx --coverage
```

## Test Coverage

The `Accessibility.test.tsx` file includes comprehensive tests for:

### 1. Keyboard Navigation (WCAG 2.1.1, 2.1.2)
- ✅ Full form completion using keyboard only
- ✅ Enter key submission
- ✅ Space key for checkbox activation
- ✅ No keyboard traps
- ✅ Tab order verification

### 2. Screen Reader Support (WCAG 1.3.1, 4.1.2)
- ✅ Form labels associated with inputs
- ✅ Error messages linked via aria-describedby
- ✅ Required fields marked with aria-required
- ✅ Proper ARIA roles (checkbox, textbox, button)
- ✅ Table structure with semantic elements

### 3. Form Accessibility (WCAG 3.3.1, 3.3.2, 3.3.3)
- ✅ Labels for all inputs
- ✅ Placeholder text for expected format
- ✅ Input type attributes (tel, email)
- ✅ maxLength constraints
- ✅ Required field validation

### 4. Modal Accessibility (WCAG 2.1.2, 2.4.3)
- ✅ Focus trap within modal
- ✅ ESC key to close
- ✅ Focus return after close
- ✅ role="dialog"
- ✅ Accessible title

### 5. Table Accessibility (WCAG 1.3.1)
- ✅ Semantic table structure
- ✅ Column headers
- ✅ Table caption or aria-label
- ✅ Keyboard accessible action buttons
- ✅ Descriptive aria-labels

### 6. Status Messages (WCAG 4.1.3)
- ✅ Empty state announcements
- ✅ role="status" for dynamic content

### 7. Error Prevention (WCAG 3.3.4)
- ✅ Confirmation modals for destructive actions

## Manual Testing Checklist

After automated tests pass, perform manual testing:

### Keyboard Navigation
- [ ] Navigate entire form using Tab key only (no mouse)
- [ ] Submit form using Enter key
- [ ] Activate checkboxes using Space key
- [ ] Close modals using ESC key
- [ ] Verify no keyboard traps exist

### Screen Reader Testing
- [ ] Test with NVDA (Windows) or JAWS
- [ ] Test with VoiceOver (macOS)
- [ ] Verify all labels are announced
- [ ] Verify error messages are announced
- [ ] Verify table structure is announced correctly
- [ ] Verify modal title and buttons are announced

### Visual Testing
- [ ] Test with browser zoom at 200%
- [ ] Verify no horizontal scrolling
- [ ] Verify text remains readable
- [ ] Verify focus indicators are visible
- [ ] Test in high contrast mode (Windows)

### Color Contrast Testing
Use automated tools:
- [ ] Chrome DevTools Lighthouse audit
- [ ] axe DevTools extension
- [ ] WAVE extension
- [ ] WebAIM Contrast Checker

### Mobile/Touch Testing
- [ ] Test with mobile screen reader (TalkBack/VoiceOver)
- [ ] Verify touch targets are at least 44x44px
- [ ] Test form completion on mobile device

## Known Issues to Fix

Based on the accessibility audit report, prioritize fixing:

### Critical Issues (P0)
1. Color contrast in TopNavBar (#6b7280 on #e9ecef = 2.8:1, needs 4.5:1)
2. Modal focus trap implementation (add `trapFocus={true}`)
3. Remove redundant aria-labels where label prop exists
4. Add error announcements with role="alert"
5. Make PatientTable action buttons keyboard accessible

### High Priority (P1)
6. Add skip navigation link
7. Add table caption
8. Add scope="col" to table headers
9. Add visual asterisks for required fields
10. Add input format instructions

## Automated Testing Tools

### Install axe-core for Jest
```bash
npm install --save-dev jest-axe
```

### Usage in tests
```tsx
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = renderWithProviders(<PatientForm onSubmit={jest.fn()} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## CI/CD Integration

Add accessibility testing to GitHub Actions:

```yaml
# .github/workflows/accessibility.yml
name: Accessibility Tests

on: [push, pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- Accessibility.test.tsx
      - run: npm run lint:a11y  # If using eslint-plugin-jsx-a11y
```

## Resources

### WCAG 2.1 Guidelines
- [WCAG 2.1 Overview](https://www.w3.org/WAI/WCAG21/quickref/)
- [WCAG 2.1 Level AA Checklist](https://www.w3.org/WAI/WCAG21/quickref/?levels=aaa)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Pa11y](https://pa11y.org/)

### Screen Readers
- [NVDA (Free, Windows)](https://www.nvaccess.org/)
- [JAWS (Commercial, Windows)](https://www.freedomscientific.com/products/software/jaws/)
- [VoiceOver (Built-in, macOS/iOS)](https://www.apple.com/accessibility/voiceover/)
- [TalkBack (Built-in, Android)](https://support.google.com/accessibility/android/answer/6283677)

### Learning Resources
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Inclusive Components](https://inclusive-components.design/)

## Next Steps

1. Install @mantine/dates: `npm install --save @mantine/dates@8.3.6`
2. Run accessibility tests: `npm test -- Accessibility.test.tsx`
3. Fix critical issues identified in ACCESSIBILITY_AUDIT_REPORT.md
4. Perform manual testing with keyboard and screen reader
5. Run automated tools (axe, WAVE, Lighthouse)
6. Iterate and improve based on findings
7. Set up CI/CD integration for continuous monitoring
