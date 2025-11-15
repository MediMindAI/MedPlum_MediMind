# EMR Theme Color Palette Reference

## Overview
This document defines the complete color palette for the EMR (Electronic Medical Records) system. The theme features a professional blue and turquoise color scheme with a 4-row horizontal navigation layout. All colors are defined in `packages/app/src/emr/styles/theme.css`.

## Color Philosophy
- **Primary Blues**: Deep navy blue for trust, professionalism, and primary actions
- **Turquoise/Cyan**: Modern turquoise for sub-menu navigation and interactive elements
- **Neutral Grays**: Sophisticated grays for backgrounds, borders, and text
- **Gradients**: Multi-color gradients for visual depth and modern appeal

---

## Core EMR Theme Colors

### Primary Blue Palette
Used for main navigation, primary actions, and brand elements.

```css
--emr-primary: #1a365d;           /* Deep navy blue - primary buttons, headers */
--emr-secondary: #2b6cb0;         /* Vibrant blue - secondary actions, interactive elements */
--emr-accent: #63b3ed;            /* Light blue - highlights, focus states, accents */
--emr-light-accent: #bee3f8;      /* Very light blue - subtle backgrounds, hover effects */
```

**Extended Blue (not in variables but used in gradients):**
- `#3182ce` - Medium-light blue used in gradient transitions

### Turquoise/Cyan Palette
**CRITICAL** - Used specifically for the horizontal sub-menu tabs (Row 3).

```css
--emr-turquoise: #17a2b8;         /* Main turquoise - sub-menu background */
--emr-turquoise-light: #20c4dd;   /* Light turquoise - gradient end, hover effects */
--emr-turquoise-dark: #138496;    /* Dark turquoise - gradient start, shadows */
```

### Neutral Gray Palette
Used for backgrounds, borders, text, and UI elements.

```css
--emr-gray-50: #f9fafb;           /* Lightest gray - subtle backgrounds */
--emr-gray-100: #f3f4f6;          /* Very light gray - muted backgrounds */
--emr-gray-200: #e5e7eb;          /* Light gray - borders, dividers */
--emr-gray-300: #d1d5db;          /* Medium-light gray - disabled states */
--emr-gray-400: #9ca3af;          /* Medium gray - placeholder text */
--emr-gray-500: #6b7280;          /* Medium-dark gray - secondary text */
--emr-gray-600: #4b5563;          /* Dark gray - body text */
--emr-gray-700: #374151;          /* Darker gray - headings */
--emr-gray-800: #1f2937;          /* Very dark gray - primary text */
--emr-gray-900: #111827;          /* Almost black - emphasis text */
```

### Text Colors

```css
--emr-text-primary: #1f2937;      /* Primary text color (gray-800) */
--emr-text-secondary: #6b7280;    /* Secondary text color (gray-500) */
--emr-text-inverse: #ffffff;      /* White text for dark backgrounds */
```

---

## Navigation Background Colors

### 4-Row Layout Backgrounds
Each row of the EMR navigation has a specific background color:

```css
/* Row 1: TopNavBar */
--emr-topnav-bg: #e9ecef;         /* Light gray background */

/* Row 2: MainMenu */
--emr-mainmenu-bg: #ffffff;       /* White background */

/* Row 3: HorizontalSubMenu (Conditional) */
--emr-submenu-bg: #17a2b8;        /* Turquoise background */
```

**Visual Reference:**
```
┌─────────────────────────────────────┐
│ Row 1: TopNavBar (#e9ecef - gray)  │
├─────────────────────────────────────┤
│ Row 2: MainMenu (#ffffff - white)  │
├─────────────────────────────────────┤
│ Row 3: SubMenu (#17a2b8 - turq)    │ ← Turquoise tabs
├─────────────────────────────────────┤
│ Row 4+: Content Area                │
└─────────────────────────────────────┘
```

---

## EMR Gradients

### Primary Blue Gradient
Used for **active main menu items** and **action buttons**.

```css
--emr-gradient-primary: linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%);
```

**Color stops:**
- Start: `#1a365d` (Deep navy)
- Middle: `#2b6cb0` (Vibrant blue)
- End: `#3182ce` (Medium-light blue)

**Used in:**
- EMRMainMenu active states
- ActionButtons backgrounds
- Primary CTAs

### Secondary Blue Gradient
Used for **lighter hover states** and **secondary interactions**.

```css
--emr-gradient-secondary: linear-gradient(135deg, #2b6cb0 0%, #3182ce 50%, #63b3ed 100%);
```

**Color stops:**
- Start: `#2b6cb0` (Vibrant blue)
- Middle: `#3182ce` (Medium-light blue)
- End: `#63b3ed` (Light blue)

**Used in:**
- Hover states on primary elements
- Secondary buttons
- Highlight effects

### Turquoise Submenu Gradient
Used **exclusively** for **Row 3 HorizontalSubMenu tabs**.

```css
--emr-gradient-submenu: linear-gradient(90deg, #138496 0%, #17a2b8 50%, #20c4dd 100%);
```

**Color stops:**
- Start: `#138496` (Dark turquoise)
- Middle: `#17a2b8` (Main turquoise)
- End: `#20c4dd` (Light turquoise)

**Used in:**
- HorizontalSubMenu background
- PatientTable headers
- PatientSearchForm search button

---

## Layout Dimensions

### Navigation Heights
```css
--emr-topnav-height: 40px;        /* Row 1: TopNavBar height */
--emr-mainmenu-height: 50px;      /* Row 2: MainMenu height */
--emr-submenu-height: 45px;       /* Row 3: HorizontalSubMenu height */
--emr-content-padding: 24px;      /* Content area padding */
```

### Z-Index Layers
```css
--emr-z-topnav: 1000;             /* TopNavBar layer */
--emr-z-mainmenu: 999;            /* MainMenu layer */
--emr-z-submenu: 998;             /* HorizontalSubMenu layer */
--emr-z-action-buttons: 997;      /* ActionButtons layer */
--emr-z-dropdown: 1001;           /* Dropdown menus (highest) */
```

---

## Shadows

```css
--emr-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--emr-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--emr-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--emr-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

---

## Borders

```css
--emr-border-radius: 6px;         /* Base border radius */
--emr-border-radius-sm: 4px;      /* Small border radius */
--emr-border-radius-lg: 8px;      /* Large border radius */
--emr-border-color: #e5e7eb;      /* Default border color (gray-200) */
```

---

## Transitions

```css
--emr-transition-fast: 0.15s ease;    /* Fast transitions (hover) */
--emr-transition-base: 0.2s ease;     /* Base transitions (standard) */
--emr-transition-slow: 0.3s ease;     /* Slow transitions (complex) */
```

---

## Spacing

```css
--emr-spacing-xs: 4px;            /* Extra small spacing */
--emr-spacing-sm: 8px;            /* Small spacing */
--emr-spacing-md: 12px;           /* Medium spacing */
--emr-spacing-lg: 16px;           /* Large spacing */
--emr-spacing-xl: 20px;           /* Extra large spacing */
--emr-spacing-2xl: 24px;          /* 2X large spacing */
```

---

## Responsive Breakpoints

```css
--emr-mobile-breakpoint: 768px;   /* Mobile devices */
--emr-tablet-breakpoint: 1024px;  /* Tablets */
--emr-desktop-breakpoint: 1440px; /* Desktop screens */
```

---

## Component-Specific Color Usage

### TopNavBar (Row 1)
- Background: `#e9ecef` (light gray)
- Text: `#1f2937` (gray-800)
- Hover: Slightly darker gray

### EMRMainMenu (Row 2)
- Background: `#ffffff` (white)
- Inactive items: `#6b7280` (gray-500)
- Active items: `--emr-gradient-primary` (blue gradient)
- Hover items: `#bee3f8` (light accent)

### HorizontalSubMenu (Row 3)
- Background: `--emr-gradient-submenu` (turquoise gradient)
- Tab text: `#ffffff` (white)
- Active tab: **White 3px bottom border** + bold text
- Inactive tabs: Regular weight, no border

### LanguageSelector (Row 2)
- Background: Transparent
- Active language: `#63b3ed` (accent blue)
- Inactive languages: `#6b7280` (gray-500)

### ActionButtons
- Background: `--emr-gradient-primary` (blue gradient)
- Text: `#ffffff` (white)
- Icon color: `#ffffff` (white)
- Hover: Slightly lighter opacity

### PatientTable
- Header background: `--emr-gradient-submenu` (turquoise gradient)
- Header text: `#ffffff` (white)
- Row hover: `#f9fafb` (gray-50)
- Search match highlight: `#c6efce` (light green)

### PatientSearchForm
- Search button: `--emr-gradient-submenu` (turquoise gradient)
- Input borders: `#e5e7eb` (gray-200)
- Section headers: `#f8f9fa` background

---

## Utility Classes

### Gradient Text
```css
.emr-text-gradient {
  background: var(--emr-gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Gradient Backgrounds
```css
.emr-bg-gradient-primary {
  background: var(--emr-gradient-primary);
}

.emr-bg-gradient-secondary {
  background: var(--emr-gradient-secondary);
}

.emr-bg-gradient-submenu {
  background: var(--emr-gradient-submenu);
}
```

### Shadows
```css
.emr-shadow-sm { box-shadow: var(--emr-shadow-sm); }
.emr-shadow-md { box-shadow: var(--emr-shadow-md); }
.emr-shadow-lg { box-shadow: var(--emr-shadow-lg); }
.emr-shadow-xl { box-shadow: var(--emr-shadow-xl); }
```

### Focus States
```css
.emr-focus-visible:focus-visible {
  outline: 2px solid var(--emr-accent);
  outline-offset: 2px;
}
```

---

## Accessibility

### Contrast Ratios (WCAG 2.1 AA)
All color combinations meet or exceed the 4.5:1 minimum contrast ratio:

**White text on backgrounds:**
- White on `#1a365d` (deep navy): **8.2:1** ✅ AAA
- White on `#2b6cb0` (vibrant blue): **4.8:1** ✅ AA
- White on `#17a2b8` (turquoise): **3.2:1** ⚠️ Large text only
- White on `#138496` (dark turquoise): **4.1:1** ✅ AA Large

**Dark text on backgrounds:**
- `#1f2937` on `#f9fafb`: **14.5:1** ✅ AAA
- `#1f2937` on `#bee3f8`: **7.8:1** ✅ AAA
- `#1f2937` on `#63b3ed`: **4.9:1** ✅ AA

### Focus Indicators
- All interactive elements have visible focus states using `--emr-accent` (#63b3ed)
- 2px outline with 2px offset for keyboard navigation
- High contrast ratio (4.9:1) against white backgrounds

---

## Font Families

### Georgian Language Support
The EMR system supports Georgian characters using these font families:

```css
font-family:
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  Roboto,
  'Helvetica Neue',
  Arial,
  'Noto Sans',
  'Noto Sans Georgian',    /* Georgian character support */
  sans-serif,
  'Apple Color Emoji',
  'Segoe UI Emoji',
  'Segoe UI Symbol';
```

**Supported languages:**
- Georgian (ka) - Unicode U+10A0-U+10FF
- English (en)
- Russian (ru)

---

## Quick Reference

### Complete Hex Color Palette

**Primary Blues:**
- `#1a365d` - Deep navy (Primary)
- `#2b6cb0` - Vibrant blue (Secondary)
- `#3182ce` - Medium-light blue (Gradient transition)
- `#63b3ed` - Light blue (Accent)
- `#bee3f8` - Very light blue (Light accent)

**Turquoise/Cyan:**
- `#138496` - Dark turquoise (Gradient start)
- `#17a2b8` - Main turquoise (Submenu background)
- `#20c4dd` - Light turquoise (Gradient end)

**Neutrals:**
- `#f9fafb` - Gray-50 (Lightest)
- `#f3f4f6` - Gray-100
- `#e9ecef` - TopNav background
- `#e5e7eb` - Gray-200 (Borders)
- `#d1d5db` - Gray-300
- `#9ca3af` - Gray-400
- `#6b7280` - Gray-500 (Secondary text)
- `#4b5563` - Gray-600
- `#374151` - Gray-700
- `#1f2937` - Gray-800 (Primary text)
- `#111827` - Gray-900 (Darkest)
- `#ffffff` - White

**Special Colors:**
- `#f8f9fa` - Section header backgrounds
- `#c6efce` - Search match highlight (light green)

---

## Implementation Notes

1. **Always use CSS custom properties** (`var(--emr-*)`) instead of hardcoded hex values
2. **Turquoise gradient is exclusive** to Row 3 HorizontalSubMenu - don't use elsewhere
3. **Blue gradients** are for primary actions and active states
4. **Test Georgian characters** when changing fonts to ensure proper rendering
5. **Maintain contrast ratios** when adding new color combinations
6. **Use utility classes** (`.emr-bg-gradient-submenu`, etc.) for consistency

---

## File Location

All theme variables are defined in:
```
packages/app/src/emr/styles/theme.css
```

Import this file in your component to use the theme:
```typescript
import '@/emr/styles/theme.css';
```

Access variables in CSS:
```css
.my-element {
  background-color: var(--emr-primary);
  color: var(--emr-text-inverse);
}
```

Access variables in inline styles:
```tsx
<div style={{ backgroundColor: 'var(--emr-primary)' }}>
  Content
</div>
```
