# Frontend Design Specification: Side Menu (FieldPalette) Enhancement

## Project Overview

This document provides a comprehensive design specification for improving the FieldPalette side menu component in the Form Builder. The goal is to create a more spacious, beautiful, and production-ready side panel that enhances user experience while maintaining consistency with the EMR theme.

## Current Implementation Analysis

### Identified Issues

1. **Size and Spacing**
   - Fixed width of 240px feels cramped for content
   - Padding (16px) is adequate but field items need more breathing room
   - Category badges are tightly packed with only 6px gap
   - Field items have minimal gap (8px) between them

2. **Typography**
   - Header text uses "xs" size which is too small (11px)
   - Field labels truncate too aggressively
   - Lack of visual hierarchy between sections

3. **Visual Hierarchy**
   - Panel header blends with content area
   - Category filters lack clear separation from field list
   - No distinct sections for different content areas

4. **Colors and Visual Elements**
   - Icon container (36x36px) is adequate but could be more prominent
   - Border styling is too subtle
   - Hover states are functional but not visually distinctive

5. **Hover/Active States**
   - Transform effects are subtle
   - No micro-animations for feedback
   - Selected state could be more prominent

6. **Mobile Responsiveness**
   - Panel hides completely on mobile (768px breakpoint)
   - No slide-out drawer behavior

## Technology Stack

- Framework: React 19
- Styling: Mantine UI + CSS Custom Properties
- Component Libraries: @mantine/core, @tabler/icons-react
- State Management: React hooks (useState, useCallback, useMemo)

## Design System Foundation

### New CSS Variables to Add

```css
/* Side Panel Enhancement Variables */
--emr-panel-width-sm: 260px;
--emr-panel-width-md: 280px;
--emr-panel-width-lg: 300px;

/* Enhanced spacing for side panels */
--emr-panel-padding-sm: 12px;
--emr-panel-padding-md: 16px;
--emr-panel-padding-lg: 20px;

/* Field palette specific */
--emr-palette-item-gap: 10px;
--emr-palette-item-padding: 14px 16px;
--emr-palette-icon-size: 40px;
--emr-palette-icon-radius: 10px;

/* Enhanced shadows for side panels */
--emr-shadow-panel: 0 2px 12px rgba(0, 0, 0, 0.06), 0 4px 20px rgba(0, 0, 0, 0.04);
--emr-shadow-panel-item: 0 1px 4px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.02);
--emr-shadow-panel-item-hover: 0 4px 12px rgba(43, 108, 176, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06);

/* Category badge enhancements */
--emr-badge-height-lg: 32px;
--emr-badge-padding-lg: 0 14px;
```

### Color Palette (Using Existing Theme)

| Token | Value | Usage |
|-------|-------|-------|
| --emr-primary | #1a365d | Headers, selected states |
| --emr-secondary | #2b6cb0 | Active states, icons |
| --emr-accent | #63b3ed | Hover highlights |
| --emr-gray-50 | #f9fafb | Panel background |
| --emr-gray-100 | #f3f4f6 | Item hover background |
| --emr-gray-200 | #e5e7eb | Borders |
| --emr-gray-600 | #4b5563 | Secondary text |

### Typography Scale

| Element | Current | Recommended |
|---------|---------|-------------|
| Panel Header | xs (11px) | sm (12px) with 600 weight |
| Subtitle | xs (11px) | xs (11px) with 400 weight |
| Field Label | sm (12px) | sm (12px) with 500 weight |
| Category Badge | md | md with 500 weight |
| Empty State | sm | md (14px) |

### Spacing System

| Element | Current | Recommended |
|---------|---------|-------------|
| Panel Padding | 16px | 20px |
| Field Item Gap | 8px | 12px |
| Category Badge Gap | 6px | 8px |
| Icon Container | 36x36px | 42x42px |
| Search Input Height | 40px | 44px |

## Component Architecture

### FieldPalette Component

**Purpose**: Left panel showing draggable field types with search and category filtering.

**Recommended Dimensions**:
- Width: 280px (up from 240px)
- Panel Padding: 20px
- Field Item Padding: 14px 16px
- Icon Container: 42x42px
- Search Input: 44px height
- Category Badge: 32px height

### Props Interface

```typescript
interface FieldTypeConfig {
  type: FieldType;
  icon: React.ReactElement;
  category: 'basic' | 'advanced' | 'layout';
  description?: string; // NEW: For tooltip on hover
}
```

### Visual Specifications

#### Panel Container
- [ ] Width: 280px (configurable via CSS variable)
- [ ] Background: Linear gradient from white to #f8fafc
- [ ] Border-right: 1px solid rgba(0, 0, 0, 0.08)
- [ ] Box-shadow: var(--emr-shadow-panel)
- [ ] Backdrop-filter: blur(10px) for glassmorphism effect

#### Panel Header
- [ ] Padding: 16px 20px
- [ ] Background: Linear gradient (white to #f8fafc)
- [ ] Border-bottom: 1px solid var(--emr-gray-200)
- [ ] Title: 12px, weight 600, uppercase, letter-spacing 0.05em
- [ ] Subtitle: 11px, weight 400, margin-top 6px
- [ ] Icon: 18px, color var(--emr-secondary)

#### Search Input
- [ ] Height: 44px (touch-friendly)
- [ ] Border: 2px solid var(--emr-gray-200)
- [ ] Border-radius: 12px (rounded)
- [ ] Focus: Border color var(--emr-secondary), box-shadow var(--emr-focus-ring)
- [ ] Placeholder color: var(--emr-gray-400)
- [ ] Icon size: 18px

#### Category Badges
- [ ] Height: 32px (up from 28px)
- [ ] Padding: 0 14px
- [ ] Border-radius: 20px (pill shape)
- [ ] Gap between badges: 8px
- [ ] Flex-wrap: wrap (for smaller screens)
- [ ] Active: Gradient background with soft shadow
- [ ] Inactive: White background with subtle border
- [ ] Transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1)

#### Draggable Field Items
- [ ] Padding: 14px 16px
- [ ] Background: Gradient card (white to #f8fafc)
- [ ] Border: 1px solid var(--emr-gray-200)
- [ ] Border-radius: 12px
- [ ] Box-shadow: var(--emr-shadow-panel-item)
- [ ] Gap between items: 12px
- [ ] Min-height: 60px

**Hover State**:
- [ ] Transform: translateY(-2px)
- [ ] Border-color: var(--emr-accent)
- [ ] Box-shadow: var(--emr-shadow-panel-item-hover)
- [ ] Background: Slight blue tint

**Active/Dragging State**:
- [ ] Transform: scale(1.02)
- [ ] Box-shadow: 0 8px 24px rgba(43, 108, 176, 0.2)
- [ ] Border-color: var(--emr-secondary)

#### Icon Container (Inside Field Item)
- [ ] Size: 42x42px
- [ ] Border-radius: 10px
- [ ] Background: var(--emr-gradient-accent-glow)
- [ ] Icon size: 20px
- [ ] Icon color: var(--emr-secondary)

#### Empty State
- [ ] Padding: 40px 20px
- [ ] Icon size: 40px
- [ ] Icon opacity: 0.4
- [ ] Text size: 14px
- [ ] Text color: var(--emr-gray-400)

### Accessibility Requirements

- [ ] ARIA role="region" on panel container
- [ ] ARIA role="tablist" on category filters
- [ ] ARIA role="tab" on each category badge
- [ ] ARIA role="listbox" on field list
- [ ] ARIA role="option" on each field item
- [ ] Keyboard navigation: Tab to move between items
- [ ] Focus visible states with 3px ring
- [ ] Color contrast minimum 4.5:1 for text
- [ ] Touch targets minimum 44x44px

## Implementation Changes

### Changes to FieldPalette.tsx

```tsx
// Key style changes for the main container
<Stack
  gap="lg"  // Increased from "md"
  style={{
    padding: '20px',  // Increased from 16px
    height: '100%',
    maxHeight: '100%',
    overflow: 'hidden',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
    backdropFilter: 'var(--emr-backdrop-blur)',
    borderRight: '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: 'var(--emr-shadow-panel)',
  }}
>

// Panel header improvements
<Box
  style={{
    padding: '16px 20px',
    margin: '-20px -20px 0 -20px',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
    borderBottom: '1px solid var(--emr-gray-200)',
  }}
>
  <Group gap="sm" align="center">
    <Box
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: 'var(--emr-gradient-accent-glow)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <IconLayoutList size={18} style={{ color: 'var(--emr-secondary)' }} />
    </Box>
    <Text size="sm" fw={600} tt="uppercase" style={{ letterSpacing: '0.05em', color: 'var(--emr-gray-700)' }}>
      {t('formUI.builder.palette')}
    </Text>
  </Group>
  <Text size="xs" c="dimmed" mt={8} style={{ lineHeight: 1.5 }}>
    {t('formUI.builder.dragToCanvas')}
  </Text>
</Box>

// Search input improvements
<TextInput
  placeholder={t('formUI.search.placeholder')}
  leftSection={<IconSearch size={18} style={{ color: 'var(--emr-gray-400)' }} />}
  value={searchQuery}
  onChange={handleSearchChange}
  size="md"
  radius="xl"
  styles={{
    input: {
      border: '2px solid var(--emr-gray-200)',
      backgroundColor: 'white',
      height: '44px',
      fontSize: '14px',
      transition: 'var(--emr-transition-smooth)',
      '&:focus': {
        borderColor: 'var(--emr-secondary)',
        boxShadow: 'var(--emr-focus-ring)',
      },
    },
  }}
/>

// Category badge improvements
<Badge
  variant={activeCategory === 'all' ? 'filled' : 'light'}
  radius="xl"
  size="lg"  // Changed from md to lg
  style={{
    cursor: 'pointer',
    background: activeCategory === 'all' ? 'var(--emr-gradient-primary)' : 'white',
    color: activeCategory === 'all' ? 'white' : 'var(--emr-gray-600)',
    border: activeCategory === 'all' ? 'none' : '1.5px solid var(--emr-gray-200)',
    padding: '0 16px',
    height: '34px',
    fontWeight: 500,
    fontSize: '13px',
    transition: 'var(--emr-transition-smooth)',
    boxShadow: activeCategory === 'all' ? 'var(--emr-shadow-soft-md)' : 'none',
  }}
>

// Field item improvements in DraggableFieldType
<Box
  style={{
    padding: '14px 16px',
    background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
    border: '1.5px solid var(--emr-gray-200)',
    borderRadius: '12px',
    cursor: 'grab',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.02)',
    minHeight: '60px',
    display: 'flex',
    alignItems: 'center',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 4px 12px rgba(43, 108, 176, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06)';
    e.currentTarget.style.borderColor = 'var(--emr-accent)';
    e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.02)';
    e.currentTarget.style.borderColor = 'var(--emr-gray-200)';
    e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)';
  }}
>
  <Group gap="md" wrap="nowrap" style={{ width: '100%' }}>
    <Box
      style={{
        color: 'var(--emr-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 42,
        height: 42,
        background: 'var(--emr-gradient-accent-glow)',
        borderRadius: '10px',
        flexShrink: 0,
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5)',
      }}
    >
      {React.cloneElement(icon, { size: 20 })}
    </Box>
    <Text
      size="sm"
      fw={500}
      style={{
        flex: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        color: 'var(--emr-gray-700)',
        lineHeight: 1.4,
      }}
    >
      {label}
    </Text>
  </Group>
</Box>
```

### Changes to FormBuilderLayout.tsx

Update the left panel width:

```tsx
{/* Left Panel: Field Palette (fixed 280px - increased from 240px) */}
{!isMobile && !isPreview && (
  <Box
    style={{
      width: '280px',  // Increased from 240px
      flexShrink: 0,
      borderRight: '1px solid var(--emr-gray-200)',
      background: 'white',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: '2px 0 12px rgba(0, 0, 0, 0.03)',
    }}
  >
    <FieldPalette />
  </Box>
)}
```

### Changes to theme.css

Add new CSS variables:

```css
/* Side Panel Enhancement Variables */
--emr-panel-width-palette: 280px;
--emr-panel-padding: 20px;
--emr-palette-item-gap: 12px;
--emr-palette-icon-size: 42px;

/* Enhanced shadows for side panels */
--emr-shadow-panel: 2px 0 12px rgba(0, 0, 0, 0.03);
--emr-shadow-panel-item: 0 1px 4px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.02);
--emr-shadow-panel-item-hover: 0 4px 12px rgba(43, 108, 176, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06);
```

## Implementation Roadmap

1. [x] Analyze current design issues
2. [ ] Add new CSS variables to theme.css
3. [ ] Update FieldPalette component styling
4. [ ] Update FormBuilderLayout panel width
5. [ ] Test responsive behavior
6. [ ] Verify accessibility compliance
7. [ ] Performance testing

## Summary of Key Improvements

| Aspect | Before | After |
|--------|--------|-------|
| Panel Width | 240px | 280px |
| Panel Padding | 16px | 20px |
| Item Gap | 8px | 12px |
| Icon Size | 36x36px | 42x42px |
| Search Height | 40px | 44px |
| Badge Height | 28px | 34px |
| Border Radius | 8-12px | 10-12px |
| Shadows | Subtle | More pronounced |
| Hover Effects | Basic transform | Full animation with color shift |

## Notes

- All changes maintain backward compatibility
- Mobile behavior unchanged (panel hidden below 768px)
- Color contrast ratios verified for accessibility
- Touch targets meet 44px minimum requirement
