# EMR UI/UX Design Guidelines
## Production-Ready Design System for MediMind EMR

> **Purpose**: Comprehensive design guidelines for creating a modern, performant, accessible, and visually stunning EMR system that rivals industry leaders like Epic and Cerner.

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Layout & Spacing](#4-layout--spacing)
5. [Navigation Patterns](#5-navigation-patterns)
6. [Component Design](#6-component-design)
7. [Form Design](#7-form-design)
8. [Data Tables](#8-data-tables)
9. [Data Visualization](#9-data-visualization)
10. [Micro-interactions & Animations](#10-micro-interactions--animations)
11. [Performance Optimization](#11-performance-optimization)
12. [Accessibility (WCAG 2.1 AA)](#12-accessibility-wcag-21-aa)
13. [Mobile-First Design](#13-mobile-first-design)
14. [Dark Mode](#14-dark-mode)
15. [Design Inspiration Resources](#15-design-inspiration-resources)

---

## 1. Design Philosophy

### Core Principles

#### 1.1 Human-Centric Design
- **Users first**: Physicians, nurses, and admin staff spend 6+ hours daily in EMR systems
- **Reduce cognitive load**: Present critical data upfront, hide secondary details until needed
- **Minimize clicks**: Geisinger Health System improved EHR workflows by 20% by eliminating low-value steps
- **Prevent burnout**: 70% of clinicians associate EHR integration with increased burnout—design must reduce friction

#### 1.2 Visual Hierarchy
```
Priority 1: Patient identification & critical alerts (largest, boldest)
Priority 2: Active task/current workflow (prominent positioning)
Priority 3: Supporting information (secondary styling)
Priority 4: Navigation & system controls (subtle, accessible)
```

#### 1.3 Progressive Disclosure
- Show only essential information initially
- Reveal details on demand (expand, hover, click)
- Use "Show more" patterns instead of overwhelming users
- Collapse non-critical sections by default

#### 1.4 Consistency
- Same component = same behavior everywhere
- Predictable patterns reduce learning curve
- Adopt familiar conventions (hamburger = menu, + = add, ✏️ = edit)

#### 1.5 Forgiveness
- Easy undo/redo for all actions
- Confirmation dialogs for destructive operations
- Auto-save drafts to prevent data loss
- Clear error recovery paths

---

## 2. Color System

### 2.1 Primary Palette (Healthcare-Optimized)

**Why Blue?** 85% of leading healthcare companies use blue—it builds trust and has calming properties. Research shows blue reduces blood pressure and heart rate.

```css
/* Primary Blues - Trust & Professionalism */
--color-primary-50: #eff6ff;   /* Backgrounds, hover states */
--color-primary-100: #dbeafe;  /* Light accents */
--color-primary-200: #bfdbfe;  /* Borders, dividers */
--color-primary-300: #93c5fd;  /* Secondary elements */
--color-primary-400: #60a5fa;  /* Interactive elements */
--color-primary-500: #3b82f6;  /* Primary buttons, links */
--color-primary-600: #2563eb;  /* Primary button hover */
--color-primary-700: #1d4ed8;  /* Active states */
--color-primary-800: #1e40af;  /* Dark accents */
--color-primary-900: #1e3a8a;  /* Headers, emphasis */

/* Secondary - Teal/Turquoise (Balance & Health) */
--color-secondary-400: #2dd4bf;
--color-secondary-500: #14b8a6;
--color-secondary-600: #0d9488;
```

### 2.2 Semantic Colors

```css
/* Success - Green (Health, Positive Outcomes) */
--color-success-50: #ecfdf5;
--color-success-500: #10b981;
--color-success-600: #059669;

/* Warning - Amber (Attention Required) */
--color-warning-50: #fffbeb;
--color-warning-500: #f59e0b;
--color-warning-600: #d97706;

/* Error/Critical - Red (Urgent, Alerts) */
--color-error-50: #fef2f2;
--color-error-500: #ef4444;
--color-error-600: #dc2626;

/* Info - Blue (Informational) */
--color-info-50: #eff6ff;
--color-info-500: #3b82f6;
--color-info-600: #2563eb;
```

### 2.3 Neutral Palette

```css
/* Grays - UI Foundation */
--color-gray-50: #f9fafb;   /* Page backgrounds */
--color-gray-100: #f3f4f6;  /* Card backgrounds */
--color-gray-200: #e5e7eb;  /* Borders, dividers */
--color-gray-300: #d1d5db;  /* Disabled states */
--color-gray-400: #9ca3af;  /* Placeholder text */
--color-gray-500: #6b7280;  /* Secondary text */
--color-gray-600: #4b5563;  /* Body text */
--color-gray-700: #374151;  /* Headings */
--color-gray-800: #1f2937;  /* Primary text */
--color-gray-900: #111827;  /* Highest contrast */
```

### 2.4 Color Psychology in Healthcare

| Color | Emotion | Use Case |
|-------|---------|----------|
| **Blue** | Trust, calm, stability | Primary UI, headers, CTAs |
| **Green** | Health, growth, success | Positive indicators, confirmations |
| **Teal** | Balance, healing | Secondary accents, sub-navigation |
| **White** | Cleanliness, clarity | Backgrounds (not too clinical) |
| **Red** | Urgency, alert | Critical alerts, errors only |
| **Amber** | Caution, attention | Warnings, pending states |

### 2.5 Color Contrast Requirements

```
Normal text (< 18px): Minimum 4.5:1 contrast ratio
Large text (≥ 18px or 14px bold): Minimum 3:1 contrast ratio
UI components & graphics: Minimum 3:1 contrast ratio
```

**Best Practice**: Use `#1f2937` (gray-800) on white for body text = 12.6:1 ratio ✅

---

## 3. Typography

### 3.1 Font Selection

**Primary Font**: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
**Georgian Support**: 'Noto Sans Georgian', 'DejaVu Sans', sans-serif

**Why Sans-Serif?** Studies show sans-serif fonts improve legibility on screens, especially for users with dyslexia.

### 3.2 Type Scale

```css
/* Base size: 16px (prevents iOS zoom on input focus) */
--font-size-xs: 0.75rem;    /* 12px - Labels, captions */
--font-size-sm: 0.875rem;   /* 14px - Secondary text */
--font-size-base: 1rem;     /* 16px - Body text */
--font-size-lg: 1.125rem;   /* 18px - Emphasized body */
--font-size-xl: 1.25rem;    /* 20px - Section headers */
--font-size-2xl: 1.5rem;    /* 24px - Page titles */
--font-size-3xl: 1.875rem;  /* 30px - Major headings */
--font-size-4xl: 2.25rem;   /* 36px - Hero text */
```

### 3.3 Font Weights

```css
--font-weight-normal: 400;   /* Body text */
--font-weight-medium: 500;   /* Emphasized text */
--font-weight-semibold: 600; /* Subheadings */
--font-weight-bold: 700;     /* Headings, buttons */
```

### 3.4 Line Heights

```css
--line-height-tight: 1.25;   /* Headings */
--line-height-normal: 1.5;   /* Body text (WCAG recommendation) */
--line-height-relaxed: 1.75; /* Long-form content */
```

### 3.5 Typography Best Practices

1. **Minimum 16px** for all body text (prevents iOS zoom)
2. **Line length**: 50-75 characters per line optimal
3. **Adequate spacing**: Letter-spacing slightly increased for titles
4. **Hierarchy**: Use size + weight + color to establish hierarchy
5. **Georgian text**: Test with Georgian characters—they're taller than Latin

```css
/* Example: Heading styles */
.heading-1 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  color: var(--color-gray-900);
  letter-spacing: -0.025em;
}

.body-text {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  color: var(--color-gray-700);
}
```

---

## 4. Layout & Spacing

### 4.1 Spacing Scale (8px Base)

```css
--space-0: 0;
--space-1: 0.25rem;  /* 4px - Tight spacing */
--space-2: 0.5rem;   /* 8px - Base unit */
--space-3: 0.75rem;  /* 12px - Small gaps */
--space-4: 1rem;     /* 16px - Default spacing */
--space-5: 1.25rem;  /* 20px - Medium gaps */
--space-6: 1.5rem;   /* 24px - Section spacing */
--space-8: 2rem;     /* 32px - Large gaps */
--space-10: 2.5rem;  /* 40px - Section breaks */
--space-12: 3rem;    /* 48px - Major sections */
--space-16: 4rem;    /* 64px - Page sections */
```

### 4.2 Layout Patterns

#### Single-Column (Mobile/Forms)
```
┌──────────────────────────────────────┐
│              Header                  │
├──────────────────────────────────────┤
│                                      │
│           Content Area               │
│        (max-width: 640px)            │
│                                      │
└──────────────────────────────────────┘
```

#### Split View (Search + Details)
```
┌─────────────────┬────────────────────┐
│                 │                    │
│   Search/List   │   Detail View      │
│     (35%)       │      (65%)         │
│                 │                    │
└─────────────────┴────────────────────┘
```

#### Dashboard Grid
```
┌─────────┬─────────┬─────────┬─────────┐
│  Card   │  Card   │  Card   │  Card   │
│  (KPI)  │  (KPI)  │  (KPI)  │  (KPI)  │
├─────────┴─────────┼─────────┴─────────┤
│                   │                   │
│   Chart/Graph     │   Recent List     │
│                   │                   │
├───────────────────┴───────────────────┤
│                                       │
│            Data Table                 │
│                                       │
└───────────────────────────────────────┘
```

### 4.3 Container Widths

```css
--container-sm: 640px;   /* Forms, modals */
--container-md: 768px;   /* Content pages */
--container-lg: 1024px;  /* Standard pages */
--container-xl: 1280px;  /* Wide layouts */
--container-2xl: 1536px; /* Full dashboards */
```

### 4.4 Border Radius

```css
--radius-sm: 0.25rem;   /* 4px - Buttons, inputs */
--radius-md: 0.375rem;  /* 6px - Cards */
--radius-lg: 0.5rem;    /* 8px - Modals, panels */
--radius-xl: 0.75rem;   /* 12px - Large cards */
--radius-2xl: 1rem;     /* 16px - Hero cards */
--radius-full: 9999px;  /* Pills, avatars */
```

---

## 5. Navigation Patterns

### 5.1 Desktop Navigation

**Recommended: Horizontal Navigation (Current Pattern)**
```
┌─────────────────────────────────────────────────────────────┐
│ Logo    │ Registration │ Patient History │ ... │ User Menu │
├─────────────────────────────────────────────────────────────┤
│         Sub-navigation tabs (context-aware)                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                     Content Area                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Enhancements:**
- Add icons alongside text labels (improves scanning speed)
- Add breadcrumbs for deep navigation
- Sticky header on scroll
- Visual "active" indicator (underline or background)

### 5.2 Mobile Navigation

**Recommended: Bottom Navigation + Hamburger**
```
┌─────────────────────────────────────┐
│ ☰ Logo              [Search] [User]│  ← Top bar
├─────────────────────────────────────┤
│                                     │
│           Content Area              │
│                                     │
├─────────────────────────────────────┤
│ 🏠    📋    ➕    📊    👤         │  ← Bottom nav (5 items max)
│ Home  List  Add  Stats  Profile    │
└─────────────────────────────────────┘
```

**Why Bottom Navigation?**
- Thumb-friendly (natural thumb zone)
- Always visible (no extra taps)
- Redbooth saw increased user sessions after switching from hamburger to bottom tabs

### 5.3 Breadcrumbs

```tsx
<Breadcrumb>
  <BreadcrumbItem href="/emr">EMR</BreadcrumbItem>
  <BreadcrumbSeparator />
  <BreadcrumbItem href="/emr/registration">Registration</BreadcrumbItem>
  <BreadcrumbSeparator />
  <BreadcrumbItem active>Patient Details</BreadcrumbItem>
</Breadcrumb>
```

### 5.4 Navigation Best Practices

1. **5-7 items max** in primary navigation
2. **Icons + Labels** for quick recognition
3. **Active state** clearly distinguished
4. **Keyboard accessible** (Tab, Enter, Arrow keys)
5. **Skip navigation link** for screen readers
6. **Consistent positioning** across all pages

---

## 6. Component Design

### 6.1 Cards

**Standard Card**
```css
.card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1),
              0 1px 2px rgba(0, 0, 0, 0.06);
  padding: var(--space-6);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.card:hover {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1),
              0 4px 6px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}
```

**Glass Card (Modern Effect)**
```css
.glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-xl);
}
```

### 6.2 Buttons

**Button Hierarchy**
```
Primary   → Main action (Save, Submit, Confirm)
Secondary → Alternative action (Cancel, Back)
Tertiary  → Subtle action (Learn more, View all)
Ghost     → Minimal action (Close, Dismiss)
Danger    → Destructive action (Delete, Remove)
```

**Button Sizes**
```css
.btn-sm { height: 32px; padding: 0 12px; font-size: 14px; }
.btn-md { height: 40px; padding: 0 16px; font-size: 14px; }
.btn-lg { height: 48px; padding: 0 24px; font-size: 16px; }
```

**Touch Target**: Minimum 44x44px clickable area (Apple HIG)

### 6.3 Inputs

**Modern Input Design**
```css
.input {
  height: 44px;  /* Touch-friendly */
  padding: 0 14px;
  font-size: 16px;  /* Prevents iOS zoom */
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  background: white;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

.input:invalid:not(:placeholder-shown) {
  border-color: var(--color-error-500);
}
```

**Floating Labels (Modern Pattern)**
```tsx
<div className="floating-label-group">
  <input id="name" placeholder=" " />
  <label htmlFor="name">Patient Name</label>
</div>
```

### 6.4 Status Badges

```css
.badge-success { background: #dcfce7; color: #166534; }
.badge-warning { background: #fef3c7; color: #92400e; }
.badge-error   { background: #fee2e2; color: #991b1b; }
.badge-info    { background: #dbeafe; color: #1e40af; }
.badge-neutral { background: #f3f4f6; color: #374151; }
```

### 6.5 Modals & Dialogs

**Best Practices:**
- Fullscreen on mobile (`fullScreen={isMobile}`)
- Max-width on desktop (480px for alerts, 640px for forms, 800px for complex)
- Focus trap inside modal
- Close on Escape key
- Dimmed overlay (rgba(0, 0, 0, 0.5))
- Smooth enter/exit animations

**Alternative: Slide-out Panels**
```
For edit operations, consider slide-out panels from the right
instead of center modals—allows user to see context behind.
```

---

## 7. Form Design

### 7.1 Form Structure

**Recommended Layout:**
```
1. Start with easy fields (name, contact info)
2. Group related fields (Personal, Medical, Insurance)
3. Complex fields last (medical history, documents)
4. Progress indicator for multi-step forms
```

**Section Grouping:**
```tsx
<FormSection title="Personal Information" icon={<UserIcon />}>
  <Grid cols={2}>
    <TextInput label="First Name" required />
    <TextInput label="Last Name" required />
  </Grid>
  <TextInput label="Email" type="email" />
</FormSection>
```

### 7.2 Field Design

**Labels:**
- Always visible (not just placeholders)
- Above the field (not inline on left)
- Required indicator: asterisk (*) or "(required)" text

**Placeholder Text:**
- Example format, not label repetition
- E.g., "01001011116" for personal ID, "user@example.com" for email

**Help Text:**
- Below the field
- Gray, smaller font
- Explains format or constraints

**Error Messages:**
- Red text below field
- Specific error (not just "Invalid")
- Appears on blur or submit

### 7.3 Validation Patterns

**Real-time Validation:**
```tsx
// Validate on blur, show success on valid
<TextInput
  label="Personal ID"
  onBlur={validate}
  rightSection={isValid ? <CheckIcon color="green" /> : null}
  error={error}
/>
```

**Form Validation Checklist:**
- ✅ Validate on blur (not on every keystroke)
- ✅ Show inline errors near the field
- ✅ Scroll to first error on submit
- ✅ Shake animation on error fields
- ✅ Green checkmark on valid fields
- ✅ Disable submit until required fields valid

### 7.4 Patient Registration Form Best Practices

```
Essential Sections:
1. Demographics (Name, DOB, Gender, Personal ID)
2. Contact Information (Phone, Email, Address)
3. Emergency Contact (Name, Relationship, Phone)
4. Insurance Information (Provider, Policy #)
5. Medical History (Conditions, Allergies, Medications)
6. Consent (Treatment consent, HIPAA acknowledgment)

For Returning Patients:
- Pre-fill known information
- Show "What's changed?" form instead of full form
```

---

## 8. Data Tables

### 8.1 Table Design

**Modern Table Styling:**
```css
.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table th {
  background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700));
  color: white;
  font-weight: 600;
  text-align: left;
  padding: 12px 16px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-gray-200);
}

.table tr:hover td {
  background: var(--color-gray-50);
}

/* Zebra striping (optional) */
.table tr:nth-child(even) td {
  background: var(--color-gray-50);
}
```

### 8.2 Table Features Checklist

- ✅ **Sticky headers** (scroll content, headers stay visible)
- ✅ **Sortable columns** (click header to sort, show ↑/↓ indicator)
- ✅ **Column resizing** (drag column borders)
- ✅ **Column visibility toggle** (hide/show columns)
- ✅ **Row selection** (checkbox column for bulk actions)
- ✅ **Inline actions** (edit, delete icons on hover/always)
- ✅ **Row expansion** (click to expand for more details)
- ✅ **Pagination** (or infinite scroll with virtual rendering)
- ✅ **Empty state** (illustration + message when no data)
- ✅ **Loading skeleton** (animated placeholders while loading)

### 8.3 Mobile Table Strategies

**Option 1: Horizontal Scroll**
```tsx
<Box style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
  <Table style={{ minWidth: '800px' }}>
    ...
  </Table>
</Box>
```

**Option 2: Card Layout on Mobile**
```tsx
{isMobile ? (
  <Stack gap="md">
    {patients.map(patient => (
      <PatientCard key={patient.id} patient={patient} />
    ))}
  </Stack>
) : (
  <PatientTable patients={patients} />
)}
```

### 8.4 Virtual Scrolling for Large Datasets

**When to Use**: Tables with 100+ rows, especially 1,000+ rows

**Recommended Libraries:**
- `@tanstack/react-virtual` (most flexible)
- `react-window` (lightweight, easy)
- `react-virtualized` (feature-rich)

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualTable({ rows }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48, // Row height
    overscan: 5, // Buffer rows
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <TableRow
            key={virtualRow.key}
            style={{ transform: `translateY(${virtualRow.start}px)` }}
            data={rows[virtualRow.index]}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 9. Data Visualization

### 9.1 Chart Type Selection

| Data Type | Best Chart | Use Case |
|-----------|------------|----------|
| Trends over time | Line chart | Vital signs, lab results |
| Category comparison | Bar chart | Department statistics |
| Part-to-whole | Pie/Donut chart | Patient demographics |
| Distribution | Box plot, Histogram | Length of stay |
| Correlation | Scatter plot | Lab value relationships |
| Geographic | Choropleth map | Disease prevalence |
| Flow/Process | Sankey, Alluvial | Patient journey |

### 9.2 Healthcare Dashboard KPIs

**Essential KPI Cards:**
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  👥 1,234   │ │  📅 156     │ │  🏥 89%     │ │  ⏱️ 4.2d    │
│ Total       │ │ Today's     │ │ Bed         │ │ Avg Length  │
│ Patients    │ │ Appointments│ │ Occupancy   │ │ of Stay     │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

### 9.3 Chart Design Best Practices

1. **Clear titles**: Describe what the chart shows
2. **Axis labels**: Always label axes with units
3. **Legend positioning**: Near the data, not far away
4. **Color meaning**: Use semantic colors (green=good, red=bad)
5. **Data labels**: Show values on bars/points when helpful
6. **Gridlines**: Light, subtle, not overwhelming
7. **Responsive**: Charts should resize gracefully

### 9.4 Recommended Libraries

- **Recharts**: React-native, easy to use
- **Chart.js**: Canvas-based, performant
- **ECharts**: Feature-rich, WebGL support
- **Nivo**: Beautiful, declarative
- **Victory**: Modular, customizable

---

## 10. Micro-interactions & Animations

### 10.1 Animation Timing

```css
--duration-fast: 150ms;    /* Button clicks, toggles */
--duration-base: 200ms;    /* Hovers, focus states */
--duration-slow: 300ms;    /* Modals, panels */
--duration-slower: 500ms;  /* Page transitions */

--easing-default: cubic-bezier(0.4, 0, 0.2, 1);
--easing-in: cubic-bezier(0.4, 0, 1, 1);
--easing-out: cubic-bezier(0, 0, 0.2, 1);
--easing-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### 10.2 Essential Micro-interactions

**Button Feedback:**
```css
.btn {
  transition: transform var(--duration-fast) var(--easing-default),
              box-shadow var(--duration-fast) var(--easing-default);
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn:active {
  transform: translateY(0) scale(0.98);
}
```

**Input Focus:**
```css
.input {
  transition: border-color var(--duration-base),
              box-shadow var(--duration-base);
}

.input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}
```

**Success Checkmark:**
```tsx
// After successful save, pulse a checkmark
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ type: "spring", stiffness: 500, damping: 15 }}
>
  <CheckCircleIcon color="green" />
</motion.div>
```

### 10.3 Loading States

**Skeleton Loader:**
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-gray-200) 25%,
    var(--color-gray-100) 50%,
    var(--color-gray-200) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**Progress Bar:**
```tsx
<ProgressBar value={step} max={totalSteps} />
// Shows: "Step 2 of 4"
```

### 10.4 Toast Notifications

```tsx
// Success toast
showNotification({
  title: 'Patient Saved',
  message: 'Record updated successfully',
  color: 'green',
  icon: <CheckIcon />,
  autoClose: 3000,
});

// Error toast
showNotification({
  title: 'Save Failed',
  message: 'Please check your connection and try again',
  color: 'red',
  icon: <XIcon />,
  autoClose: 5000,
});
```

### 10.5 Motion Sensitivity

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 11. Performance Optimization

### 11.1 React Performance Patterns

**Memoization:**
```tsx
// Memoize expensive components
const PatientRow = React.memo(({ patient, onEdit, onDelete }) => {
  return (
    <tr>
      <td>{patient.name}</td>
      ...
    </tr>
  );
});

// Memoize callbacks
const handleEdit = useCallback((id) => {
  // edit logic
}, []);
```

**Lazy Loading:**
```tsx
// Lazy load heavy components
const FormBuilder = lazy(() => import('./views/FormBuilder'));

// In routes
<Route
  path="/forms/builder"
  element={
    <Suspense fallback={<LoadingSkeleton />}>
      <FormBuilder />
    </Suspense>
  }
/>
```

### 11.2 Virtual Scrolling Thresholds

| Row Count | Strategy |
|-----------|----------|
| < 100 | Regular rendering |
| 100-500 | Consider virtualization |
| 500+ | Virtual scrolling required |
| 2,000+ | Virtual scrolling + pagination |

### 11.3 Image Optimization

```tsx
// Lazy load images
<img
  src={patientPhoto}
  loading="lazy"
  alt={`Photo of ${patient.name}`}
/>

// Use modern formats
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <source srcSet="image.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="..." />
</picture>
```

### 11.4 Debouncing & Throttling

```tsx
// Debounce search input (wait 300-500ms after typing stops)
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebouncedValue(searchTerm, 500);

useEffect(() => {
  if (debouncedSearch) {
    searchPatients(debouncedSearch);
  }
}, [debouncedSearch]);
```

---

## 12. Accessibility (WCAG 2.1 AA)

### 12.1 Regulatory Compliance

**HHS Rule (May 2024)**: Healthcare organizations with 15+ employees must comply with WCAG 2.1 AA by May 2026.

### 12.2 Accessibility Checklist

**Perceivable:**
- [ ] Color contrast ≥ 4.5:1 for text
- [ ] Alt text for all images
- [ ] Captions for videos
- [ ] Don't rely on color alone to convey meaning

**Operable:**
- [ ] All functionality via keyboard
- [ ] Focus indicators visible
- [ ] Skip navigation links
- [ ] No keyboard traps
- [ ] Touch targets ≥ 44x44px

**Understandable:**
- [ ] Error messages clear and specific
- [ ] Labels associated with inputs
- [ ] Consistent navigation
- [ ] Language attribute set (`lang="ka"`)

**Robust:**
- [ ] Valid HTML
- [ ] ARIA attributes used correctly
- [ ] Works with screen readers

### 12.3 ARIA Patterns

```tsx
// Accessible modal
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Edit Patient</h2>
  <p id="modal-description">Update patient information below.</p>
  ...
</div>

// Accessible form field
<div>
  <label htmlFor="patient-name">Patient Name</label>
  <input
    id="patient-name"
    aria-required="true"
    aria-invalid={!!error}
    aria-describedby="patient-name-error"
  />
  {error && (
    <span id="patient-name-error" role="alert">
      {error}
    </span>
  )}
</div>
```

### 12.4 Screen Reader Testing

Test with:
- VoiceOver (macOS/iOS)
- NVDA (Windows, free)
- JAWS (Windows)

---

## 13. Mobile-First Design

### 13.1 Breakpoints

```css
/* Mobile First: Default styles are for mobile */
--breakpoint-sm: 640px;   /* Large phones */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large monitors */
```

### 13.2 Responsive Patterns

```tsx
// Mantine responsive props
<Grid>
  <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
    <Card />
  </Grid.Col>
</Grid>

<Stack gap={{ base: 'sm', md: 'lg' }}>
  <Content />
</Stack>

<Button fullWidth={{ base: true, md: false }}>
  Save
</Button>
```

### 13.3 Mobile-Specific Considerations

1. **Touch targets**: 44x44px minimum
2. **Font size**: 16px minimum (prevents iOS zoom)
3. **Button placement**: Important actions in thumb zone
4. **Forms**: Single column, large inputs
5. **Tables**: Card view or horizontal scroll
6. **Navigation**: Bottom nav or hamburger menu
7. **Modals**: Full screen on mobile

### 13.4 Testing Checklist

Test on these viewport widths:
- 320px (iPhone SE)
- 375px (iPhone standard)
- 414px (iPhone Plus/Max)
- 768px (iPad portrait)
- 1024px (iPad landscape)
- 1440px (Desktop)

---

## 14. Dark Mode

### 14.1 Implementation Strategy

```css
/* Light mode (default) */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
}

/* Dark mode */
[data-theme="dark"] {
  --bg-primary: #1f2937;
  --bg-secondary: #111827;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --border-color: #374151;
}

/* Respect system preference */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    /* Apply dark mode variables */
  }
}
```

### 14.2 Dark Mode Best Practices

1. **Avoid pure black**: Use `#121212` or `#1f2937` instead of `#000000`
2. **Avoid pure white text**: Use `#e1e1e1` or `#f9fafb` for body text
3. **Reduce contrast slightly**: Pure white on black causes "halation"
4. **Elevate with lightness**: Higher elevation = lighter shade
5. **Test charts**: Ensure data viz colors work in both modes
6. **Provide toggle**: Let users override system preference

### 14.3 Healthcare Dark Mode Considerations

- **Clinical settings**: Dark mode useful for night shifts, bedside monitors
- **Operating rooms**: May prefer dark to reduce harsh light
- **Data accuracy**: Ensure charts remain readable
- **Accessibility**: Maintain contrast ratios in both modes

---

## 15. Design Inspiration Resources

### 15.1 EMR/EHR Design Galleries

| Platform | Search Terms | URL |
|----------|--------------|-----|
| Dribbble | "EMR", "EHR", "Medical Dashboard" | [dribbble.com/tags/emr](https://dribbble.com/tags/emr) |
| Behance | "Electronic Medical Records" | [behance.net](https://www.behance.net/search/projects/electronic%20medical%20records%20dashboard) |
| Pinterest | "EMR UI Design" | [pinterest.com](https://www.pinterest.com/search/pins/?q=emr%20ui%20design) |

### 15.2 Reference Articles

- [Fuselab: EHR Interface Design Principles](https://fuselabcreative.com/ehr-interface-design-principles-ux-and-usability-challenges/)
- [Binariks: 14 Principles of User-Friendly EMR](https://binariks.com/blog/emr-interface-design-techniques/)
- [Stfalcon: EMR/EHR Key Design Principles](https://stfalcon.com/en/blog/post/ehr-user-interface-design-principles)
- [KoruUX: 50 Healthcare UX Examples](https://www.koruux.com/50-examples-of-healthcare-UI/)
- [AltexSoft: EHR Usability Improvements](https://www.altexsoft.com/blog/ehr-usability/)

### 15.3 Design System References

- [Carbon Design System (IBM)](https://carbondesignsystem.com/)
- [Material Design 3 (Google)](https://m3.material.io/)
- [Mantine UI](https://mantine.dev/)
- [Tailwind UI](https://tailwindui.com/)
- [Radix UI](https://radix-ui.com/)

### 15.4 Accessibility Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Section 508 Typography](https://www.section508.gov/develop/fonts-typography/)
- [Health.gov: Health Literacy Online](https://odphp.health.gov/healthliteracyonline/)

---

## Quick Reference: Design Tokens

```css
/* Copy-paste ready design tokens */
:root {
  /* Colors */
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --secondary: #14b8a6;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;

  /* Backgrounds */
  --bg-page: #f9fafb;
  --bg-card: #ffffff;
  --bg-input: #ffffff;

  /* Text */
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;

  /* Borders */
  --border: #e5e7eb;
  --border-focus: #3b82f6;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* Typography */
  --font-sans: Inter, -apple-system, sans-serif;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
}
```

---

## Summary: Top 10 Priorities for MediMind EMR

1. **Increase base font to 16px** - Better readability, prevents iOS zoom
2. **Add breadcrumb navigation** - Clear wayfinding
3. **Implement skeleton loaders** - Smooth loading experience
4. **Add toast notifications** - Immediate feedback on actions
5. **Virtual scrolling for nomenclature** - 2,217 services need it
6. **Mobile bottom navigation** - Thumb-friendly on phones
7. **Dark mode support** - For night shifts and preferences
8. **Real-time form validation** - Green checkmarks, inline errors
9. **Micro-interactions on buttons** - Subtle hover/active states
10. **Accessibility audit** - WCAG 2.1 AA compliance

---

*Last Updated: November 2025*
*Based on research from: Epic, Cerner, WCAG, Nielsen Norman Group, Dribbble, Behance, and healthcare UX best practices.*
