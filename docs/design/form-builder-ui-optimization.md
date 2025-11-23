# Form Builder UI/UX Optimization Guide

## Executive Summary

This document provides a comprehensive analysis and optimization roadmap for the MediMind EMR Form Builder page. The goal is to achieve a world-class, modern form builder experience comparable to Typeform, JotForm, or Google Forms.

---

## 1. Current State Analysis

### 1.1 Component Architecture
```
FormBuilderView.tsx
├── Hero Header (Blue gradient with title, status badge, save button)
├── Form Metadata Section (Title + Description inputs)
└── FormBuilderLayout.tsx
    ├── FieldPalette.tsx (Left panel - 20%)
    │   ├── Header (Blue gradient)
    │   ├── Search input
    │   ├── Category filters (All, Basic, Advanced, Layout)
    │   └── Draggable field list
    ├── FormCanvas.tsx (Center panel - 55%)
    │   ├── Header (Blue gradient with "Add Field" button)
    │   ├── Drop zone with empty state
    │   └── Sortable field items
    └── PropertiesPanel.tsx (Right panel - 25%)
        ├── Header
        ├── Field type info
        └── FieldConfigEditor
```

### 1.2 Identified Issues

#### Visual Hierarchy Problems
| Issue | Location | Impact |
|-------|----------|--------|
| Duplicate headers | FormBuilderLayout has its own header that duplicates FormBuilderView header | Confusing information architecture |
| Too many blue gradient sections | FieldPalette header, FormCanvas header, main header | Visual competition, reduces focus |
| Form metadata cramped | Title/Description inputs lack breathing room | Poor scannability |
| Empty state is sparse | Drop zone looks uninviting | Low engagement |

#### Spacing & Layout Issues
| Issue | Current Value | Recommended |
|-------|--------------|-------------|
| Metadata section padding | 20px 24px | 24px 32px |
| Gap between Title/Description | default | 16px explicit |
| Field palette item padding | 12px 14px | 14px 16px |
| Canvas drop zone margin | 16px | 20px |
| Panel min-height | 500px | calc(100vh - header heights) |

#### Color Consistency Issues
- Multiple blue gradients competing for attention
- Category badges have inconsistent styling when active vs inactive
- FieldPalette header gradient clashes with main header

#### UX Flow Issues
- "Add Field" button isolated in canvas header (should be more prominent in empty state)
- Preview toggle disconnected from main workflow
- Properties panel only shows when field selected (should show helpful empty state)

---

## 2. Design System Tokens Reference

### 2.1 Available CSS Variables (from theme.css)
```css
/* Glassmorphism - USE THESE for panels */
--emr-glass-bg: rgba(255, 255, 255, 0.85);
--emr-glass-border: rgba(255, 255, 255, 0.3);
--emr-glass-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
--emr-backdrop-blur: blur(10px);

/* Modern soft shadows - USE THESE for cards */
--emr-shadow-soft: 0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.04);
--emr-shadow-soft-md: 0 4px 12px rgba(0, 0, 0, 0.05), 0 8px 24px rgba(0, 0, 0, 0.05);
--emr-shadow-glow: 0 0 20px rgba(99, 179, 237, 0.3);

/* Modern gradients - USE SPARINGLY */
--emr-gradient-soft: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
--emr-gradient-canvas: linear-gradient(180deg, #fafbfc 0%, #f4f6f8 100%);
--emr-gradient-card: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);

/* Selection states - USE for interactive elements */
--emr-selected-bg: rgba(59, 130, 246, 0.08);
--emr-selected-border: #3b82f6;
--emr-hover-bg: rgba(59, 130, 246, 0.04);
--emr-focus-ring: 0 0 0 3px rgba(59, 130, 246, 0.15);

/* Transitions */
--emr-transition-smooth: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
```

### 2.2 Color Hierarchy Recommendation
```
Primary Blue (#1e40af / #3b82f6) - RESERVE FOR:
  - Primary CTAs (Save button)
  - Selected states
  - Active indicators

Secondary/Accent (#60a5fa / #93c5fd) - USE FOR:
  - Field type icons
  - Subtle highlights
  - Links

Neutral Grays (--emr-gray-*) - USE FOR:
  - Panel backgrounds
  - Borders
  - Secondary text
  - Disabled states

White/Glass - USE FOR:
  - Cards
  - Input fields
  - Panel content areas
```

---

## 3. Visual Hierarchy Improvements

### 3.1 Header Simplification

**Problem**: Two competing headers (FormBuilderView + FormBuilderLayout)

**Solution**: Remove the inner FormBuilderLayout header, consolidate into single hero header

```tsx
// BEFORE: FormBuilderLayout line 166-183
<Box style={{ padding: '...', borderBottom: '...', backgroundColor: 'var(--emr-gray-50)' }}>
  <Group justify="space-between">
    <Text fw={600}>{formTitle || t('formUI.builder.title')}</Text>
    <Button>{isPreview ? 'Edit' : 'Preview'}</Button>
  </Group>
</Box>

// AFTER: Move preview toggle to main header, remove this section entirely
// The formTitle is already shown in the metadata section input
```

**Implementation**:
1. Move Preview toggle button to the main header (FormBuilderView line 189-227)
2. Remove the redundant header from FormBuilderLayout
3. Update FormBuilderLayout to start directly with the three-panel flex container

### 3.2 Panel Header Consolidation

**Problem**: Both FieldPalette and FormCanvas have blue gradient headers

**Solution**: Use subtle, consistent panel headers that don't compete

**Recommended Panel Header Style**:
```tsx
// Consistent panel header for FieldPalette and FormCanvas
const panelHeaderStyle = {
  padding: '14px 16px',
  borderBottom: '1px solid var(--emr-gray-200)',
  background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
};

const panelTitleStyle = {
  color: 'var(--emr-gray-700)',
  fontSize: 'var(--emr-font-sm)',
  fontWeight: 600,
  letterSpacing: '-0.01em',
  textTransform: 'uppercase' as const,
};
```

### 3.3 Form Metadata Section Redesign

**Current**: Two inputs side-by-side with minimal styling

**Recommended Design**:
```tsx
<Box
  style={{
    padding: '24px 32px',
    background: 'white',
    borderBottom: '1px solid var(--emr-gray-200)',
    boxShadow: 'var(--emr-shadow-soft)',
  }}
>
  <Stack gap="lg">
    {/* Section label */}
    <Group gap="xs" align="center">
      <IconFileDescription size={16} style={{ color: 'var(--emr-gray-400)' }} />
      <Text size="xs" fw={500} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
        Form Details
      </Text>
    </Group>

    {/* Inputs */}
    <Grid gutter="xl">
      <Grid.Col span={{ base: 12, md: 6 }}>
        <TextInput
          label={null}
          placeholder="Enter form title..."
          value={state.title}
          onChange={(e) => actions.setTitle(e.currentTarget.value)}
          size="lg"
          radius="md"
          styles={{
            input: {
              fontSize: '1.25rem',
              fontWeight: 500,
              border: '2px solid transparent',
              background: 'var(--emr-gray-50)',
              height: '56px',
              '&:focus': {
                borderColor: '#3b82f6',
                background: 'white',
              },
              '&::placeholder': {
                color: 'var(--emr-gray-400)',
                fontWeight: 400,
              },
            },
          }}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Textarea
          label={null}
          placeholder="Add a description (optional)..."
          value={state.description}
          onChange={(e) => actions.setDescription(e.currentTarget.value)}
          minRows={2}
          maxRows={2}
          radius="md"
          styles={{
            input: {
              border: '2px solid transparent',
              background: 'var(--emr-gray-50)',
              '&:focus': {
                borderColor: '#3b82f6',
                background: 'white',
              },
            },
          }}
        />
      </Grid.Col>
    </Grid>
  </Stack>
</Box>
```

---

## 4. Layout Optimizations

### 4.1 Three-Panel Arrangement

**Current proportions**: 20% / 55% / 25%
**Recommended proportions**: 240px fixed / flex(1) / 320px fixed

```tsx
// FormBuilderLayout three-panel container
<Box style={{
  flex: 1,
  overflow: 'hidden',
  display: 'flex',
  minHeight: 0,
  background: 'var(--emr-gray-50)',
}}>
  {/* Left Panel: Field Palette - FIXED WIDTH */}
  {!isMobile && !isPreview && (
    <Box
      style={{
        width: '240px',
        flexShrink: 0,
        background: 'white',
        borderRight: '1px solid var(--emr-gray-200)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <FieldPalette />
    </Box>
  )}

  {/* Center Panel: Form Canvas - FLEXIBLE */}
  <Box
    style={{
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'var(--emr-gradient-canvas)',
    }}
  >
    <FormCanvas ... />
  </Box>

  {/* Right Panel: Properties - FIXED WIDTH */}
  {!isMobile && !isPreview && (
    <Box
      style={{
        width: '320px',
        flexShrink: 0,
        background: 'white',
        borderLeft: '1px solid var(--emr-gray-200)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <PropertiesPanel ... />
    </Box>
  )}
</Box>
```

### 4.2 Spacing System

Apply consistent spacing using theme variables:

```css
/* Panel internal padding */
--panel-padding: var(--emr-spacing-lg); /* 16px */

/* Section gaps */
--section-gap: var(--emr-spacing-xl); /* 20px */

/* Field item gaps */
--field-gap: var(--emr-spacing-sm); /* 8px */

/* Input field minimum height (touch-friendly) */
--input-min-height: 44px;
```

### 4.3 Mobile Responsiveness

**Breakpoints**:
- Desktop (>1024px): Three-panel layout
- Tablet (768px-1024px): Two-panel (palette slides over canvas, properties as modal)
- Mobile (<768px): Single panel with FAB to toggle palette

```tsx
// Mobile FAB for palette toggle
{isMobile && !isPreview && (
  <ActionIcon
    className="emr-fab"
    onClick={() => setMobilePaletteOpen(true)}
    aria-label="Open field palette"
    style={{
      position: 'fixed',
      bottom: '24px',
      left: '24px', // Left side for palette
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      background: 'var(--emr-gradient-primary)',
      color: 'white',
      boxShadow: 'var(--emr-shadow-lg)',
      zIndex: 999,
    }}
  >
    <IconPlus size={24} />
  </ActionIcon>
)}
```

---

## 5. Component-Specific Recommendations

### 5.1 Field Palette Redesign

**Goals**: Clean, scannable, less visual noise

```tsx
// Simplified FieldPalette structure
<Stack gap="md" style={{ height: '100%', padding: '16px' }}>
  {/* Subtle header - NO gradient */}
  <Group gap="xs" align="center" mb="xs">
    <IconPalette size={16} style={{ color: 'var(--emr-gray-400)' }} />
    <Text size="xs" fw={600} c="dimmed" tt="uppercase">
      {t('formUI.builder.palette')}
    </Text>
  </Group>

  {/* Search - cleaner styling */}
  <TextInput
    placeholder="Search fields..."
    leftSection={<IconSearch size={14} />}
    size="sm"
    radius="md"
    styles={{
      input: {
        border: '1px solid var(--emr-gray-200)',
        background: 'var(--emr-gray-50)',
        '&:focus': {
          border: '1px solid #3b82f6',
          background: 'white',
        },
      },
    }}
  />

  {/* Category filters - pill style */}
  <Group gap={6}>
    {categories.map(cat => (
      <Button
        key={cat.key}
        size="xs"
        radius="xl"
        variant={activeCategory === cat.key ? 'filled' : 'subtle'}
        color={activeCategory === cat.key ? 'blue' : 'gray'}
        styles={{
          root: {
            fontWeight: 500,
            padding: '4px 12px',
            height: '28px',
          },
        }}
        onClick={() => setActiveCategory(cat.key)}
      >
        {cat.label} ({cat.count})
      </Button>
    ))}
  </Group>

  {/* Field types - simplified cards */}
  <ScrollArea style={{ flex: 1 }}>
    <Stack gap={6}>
      {filteredFields.map(field => (
        <DraggableFieldItem
          key={field.type}
          field={field}
          style={{
            padding: '10px 12px',
            background: 'white',
            border: '1px solid var(--emr-gray-200)',
            borderRadius: 'var(--emr-border-radius)',
            cursor: 'grab',
            transition: 'var(--emr-transition-fast)',
            '&:hover': {
              borderColor: '#93c5fd',
              boxShadow: 'var(--emr-shadow-soft)',
              transform: 'translateX(2px)',
            },
          }}
        />
      ))}
    </Stack>
  </ScrollArea>
</Stack>
```

### 5.2 Canvas Empty State Redesign

**Goal**: Inviting, guides user action

```tsx
// Enhanced empty state for FormCanvas
const EmptyCanvasState = () => (
  <Stack
    align="center"
    justify="center"
    style={{
      height: '100%',
      padding: '48px',
    }}
  >
    {/* Visual illustration */}
    <Box
      style={{
        width: '120px',
        height: '120px',
        borderRadius: '24px',
        background: 'var(--emr-gradient-accent-glow)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
        border: '2px dashed var(--emr-gray-300)',
        animation: 'pulse 2s ease-in-out infinite',
      }}
    >
      <IconLayoutKanban size={48} style={{ color: '#3b82f6', opacity: 0.7 }} />
    </Box>

    {/* Headline */}
    <Text size="xl" fw={600} c="var(--emr-gray-700)" ta="center">
      Start building your form
    </Text>

    {/* Instructions */}
    <Text size="sm" c="dimmed" ta="center" maw={320} mt="xs">
      Drag fields from the palette on the left, or use the button below to add your first field
    </Text>

    {/* Primary CTA */}
    <Button
      size="lg"
      radius="xl"
      leftSection={<IconPlus size={18} />}
      mt="xl"
      onClick={handleAddField}
      styles={{
        root: {
          background: 'var(--emr-gradient-primary)',
          padding: '0 32px',
          height: '48px',
          fontWeight: 600,
          boxShadow: 'var(--emr-shadow-soft-md)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 'var(--emr-shadow-glow-primary)',
          },
        },
      }}
    >
      Add your first field
    </Button>

    {/* Secondary hint */}
    <Group gap="xs" mt="lg" c="dimmed">
      <IconMouse size={14} />
      <Text size="xs">Or drag from the Field Palette</Text>
    </Group>
  </Stack>
);
```

### 5.3 Properties Panel Empty State

**Goal**: Helpful guidance when no field selected

```tsx
// PropertiesPanel empty state
const EmptyPropertiesState = () => (
  <Stack
    align="center"
    justify="center"
    style={{ height: '100%', padding: '32px' }}
  >
    <Box
      style={{
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        background: 'var(--emr-gray-100)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
      }}
    >
      <IconSettings size={28} style={{ color: 'var(--emr-gray-400)' }} />
    </Box>

    <Text size="sm" fw={500} c="var(--emr-gray-600)" ta="center">
      No field selected
    </Text>

    <Text size="xs" c="dimmed" ta="center" maw={200} mt="xs">
      Click on a field in the canvas to configure its properties
    </Text>
  </Stack>
);
```

### 5.4 Header Improvements

**Consolidate actions, reduce visual weight**:

```tsx
// Simplified header design
<Box
  style={{
    background: 'var(--emr-gradient-header-modern)',
    padding: '12px 24px',
    boxShadow: 'var(--emr-shadow-md)',
  }}
>
  <Group justify="space-between" align="center">
    {/* Left: Back + Title */}
    <Group gap="md">
      <ActionIcon
        variant="subtle"
        radius="xl"
        onClick={handleBack}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          color: 'white',
        }}
      >
        <IconArrowLeft size={18} />
      </ActionIcon>

      <Box>
        <Text size="md" fw={600} c="white">
          {state.title || t('formUI.builder.newForm')}
        </Text>
        <Text size="xs" c="rgba(255, 255, 255, 0.7)">
          {state.fields.length} fields | {state.status}
        </Text>
      </Box>
    </Group>

    {/* Right: Actions - grouped logically */}
    <Group gap="sm">
      {/* Undo/Redo group */}
      <Group gap={4}>
        <Tooltip label="Undo (Ctrl+Z)">
          <ActionIcon
            variant="subtle"
            size={36}
            radius="xl"
            onClick={undo}
            disabled={!canUndo}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: canUndo ? 'white' : 'rgba(255, 255, 255, 0.3)',
            }}
          >
            <IconArrowBackUp size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Redo (Ctrl+Shift+Z)">
          <ActionIcon ... />
        </Tooltip>
      </Group>

      <Divider orientation="vertical" color="rgba(255,255,255,0.2)" />

      {/* Preview toggle */}
      <Button
        variant="subtle"
        radius="xl"
        leftSection={isPreview ? <IconEyeOff size={16} /> : <IconEye size={16} />}
        onClick={handleTogglePreview}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
        }}
      >
        {isPreview ? 'Edit' : 'Preview'}
      </Button>

      {/* Primary Save */}
      <Button
        radius="xl"
        leftSection={<IconDeviceFloppy size={16} />}
        onClick={handleSave}
        style={{
          background: 'white',
          color: 'var(--emr-primary)',
          fontWeight: 600,
        }}
      >
        {t('formUI.buttons.save')}
      </Button>
    </Group>
  </Group>
</Box>
```

---

## 6. Interaction Improvements

### 6.1 Drag-and-Drop Visual Feedback

```tsx
// Enhanced drag overlay
<DragOverlay dropAnimation={null}>
  {activeField && (
    <Box
      style={{
        padding: '12px 16px',
        background: 'white',
        border: '2px solid #3b82f6',
        borderRadius: 'var(--emr-border-radius-xl)',
        boxShadow: '0 12px 40px rgba(59, 130, 246, 0.3)',
        transform: 'rotate(2deg) scale(1.02)',
        opacity: 0.95,
      }}
    >
      {/* Field content */}
    </Box>
  )}
</DragOverlay>

// Drop zone active state
const dropZoneActiveStyle = {
  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.1) 100%)',
  borderColor: '#3b82f6',
  borderStyle: 'dashed',
  animation: 'dropPulse 1s ease-in-out infinite',
};
```

### 6.2 Selection States

```css
/* Field item states */
.field-item {
  transition: var(--emr-transition-smooth);
}

.field-item:hover {
  border-color: #93c5fd;
  background: var(--emr-hover-bg);
  transform: translateX(2px);
}

.field-item.selected {
  border-color: #3b82f6;
  background: var(--emr-selected-bg);
  box-shadow: var(--emr-shadow-glow), var(--emr-shadow-soft-md);
}

.field-item:focus-visible {
  outline: none;
  box-shadow: var(--emr-focus-ring);
}
```

### 6.3 Hover Effects

```tsx
// Consistent hover effect for field palette items
const fieldPaletteItemHover = {
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.borderColor = '#93c5fd';
    e.currentTarget.style.transform = 'translateX(4px)';
    e.currentTarget.style.boxShadow = 'var(--emr-shadow-soft)';
  },
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.borderColor = 'var(--emr-gray-200)';
    e.currentTarget.style.transform = 'translateX(0)';
    e.currentTarget.style.boxShadow = 'none';
  },
};
```

### 6.4 Keyboard Navigation

```tsx
// Enhanced keyboard handling
const handleKeyDown = (e: React.KeyboardEvent): void => {
  // Save
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    handleSave();
    return;
  }

  // Undo/Redo
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
    e.preventDefault();
    if (canRedo) redo();
    return;
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault();
    if (canUndo) undo();
    return;
  }

  // Delete selected field
  if (e.key === 'Delete' && selectedField) {
    e.preventDefault();
    handleFieldDelete(selectedField.id);
    return;
  }

  // Navigate between fields
  if (e.key === 'ArrowDown' && selectedField) {
    e.preventDefault();
    selectNextField();
    return;
  }
  if (e.key === 'ArrowUp' && selectedField) {
    e.preventDefault();
    selectPreviousField();
    return;
  }

  // Toggle preview
  if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
    e.preventDefault();
    handleTogglePreview();
    return;
  }
};
```

---

## 7. CSS Additions for theme.css

Add these new variables and utility classes:

```css
/* Add to :root in theme.css */

/* Form Builder specific tokens */
--emr-builder-panel-width-palette: 240px;
--emr-builder-panel-width-properties: 320px;
--emr-builder-header-height: 64px;
--emr-builder-metadata-height: 100px;

/* Animation keyframes */
@keyframes dropPulse {
  0%, 100% {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.1) 100%);
  }
  50% {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.15) 100%);
  }
}

@keyframes emptyStatePulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.02);
    opacity: 1;
  }
}

/* Form builder utility classes */
.emr-panel-header {
  padding: 14px 16px;
  border-bottom: 1px solid var(--emr-gray-200);
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.emr-panel-title {
  color: var(--emr-gray-600);
  font-size: var(--emr-font-xs);
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.emr-field-item {
  padding: 12px 14px;
  background: white;
  border: 1px solid var(--emr-gray-200);
  border-radius: var(--emr-border-radius);
  cursor: pointer;
  transition: var(--emr-transition-smooth);
}

.emr-field-item:hover {
  border-color: #93c5fd;
  transform: translateX(2px);
  box-shadow: var(--emr-shadow-soft);
}

.emr-field-item.selected {
  border-color: #3b82f6;
  border-width: 2px;
  background: var(--emr-selected-bg);
  box-shadow: var(--emr-shadow-glow);
}

.emr-drop-zone {
  min-height: 400px;
  border: 2px dashed var(--emr-gray-300);
  border-radius: var(--emr-border-radius-xl);
  background: var(--emr-gradient-canvas);
  transition: var(--emr-transition-smooth);
}

.emr-drop-zone.active {
  border-color: #3b82f6;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.1) 100%);
  animation: dropPulse 1s ease-in-out infinite;
}

.emr-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
}

.emr-empty-state-icon {
  width: 120px;
  height: 120px;
  border-radius: 24px;
  background: var(--emr-gradient-accent-glow);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  border: 2px dashed var(--emr-gray-300);
}
```

---

## 8. Implementation Roadmap

### Phase 1: Structural Cleanup (Priority: High)
- [ ] Remove duplicate header from FormBuilderLayout
- [ ] Move Preview toggle to main header
- [ ] Consolidate panel headers to consistent subtle style
- [ ] Fix panel width proportions (240px / flex / 320px)

### Phase 2: Visual Polish (Priority: High)
- [ ] Redesign Form Metadata section
- [ ] Simplify FieldPalette header (remove gradient)
- [ ] Simplify FormCanvas header (remove gradient)
- [ ] Add CSS utility classes to theme.css

### Phase 3: Empty States (Priority: Medium)
- [ ] Redesign Canvas empty state with illustration
- [ ] Add Properties Panel empty state
- [ ] Improve Field Palette empty search state

### Phase 4: Interactions (Priority: Medium)
- [ ] Enhance drag overlay visual
- [ ] Add drop zone animation
- [ ] Implement consistent hover effects
- [ ] Add keyboard navigation hints

### Phase 5: Mobile Optimization (Priority: Low)
- [ ] Add FAB for palette on mobile
- [ ] Implement slide-over panels
- [ ] Test touch interactions

---

## 9. Testing Checklist

### Visual Regression
- [ ] Header renders correctly at all breakpoints
- [ ] Panel proportions maintained on resize
- [ ] Empty states display correctly
- [ ] Selection states visible and accessible

### Accessibility
- [ ] All interactive elements have focus states
- [ ] ARIA labels present on panels and controls
- [ ] Keyboard navigation works for all actions
- [ ] Color contrast meets WCAG AA

### Interaction
- [ ] Drag from palette to canvas works
- [ ] Reorder within canvas works
- [ ] Delete via keyboard and button works
- [ ] Undo/Redo keyboard shortcuts work
- [ ] Preview toggle works

### Mobile
- [ ] Layout adapts at each breakpoint
- [ ] Touch targets are 44px minimum
- [ ] Panels slide correctly on mobile
- [ ] FAB appears and functions

---

## 10. Reference Implementations

### Typeform-Style Features
- Focused, one-question-at-a-time preview
- Smooth transitions between questions
- Minimal chrome, maximum content focus

### JotForm-Style Features
- Clear three-panel layout
- Rich field type palette with categories
- Inline property editing

### Google Forms-Style Features
- Simple, clean interface
- Drag-to-reorder with clear visual feedback
- Automatic save indication

---

## Appendix: File Paths for Implementation

| Component | File Path |
|-----------|-----------|
| Main View | `/packages/app/src/emr/views/form-builder/FormBuilderView.tsx` |
| Layout | `/packages/app/src/emr/components/form-builder/FormBuilderLayout.tsx` |
| Field Palette | `/packages/app/src/emr/components/form-builder/FieldPalette.tsx` |
| Form Canvas | `/packages/app/src/emr/components/form-builder/FormCanvas.tsx` |
| Properties Panel | `/packages/app/src/emr/components/form-builder/PropertiesPanel.tsx` |
| Theme CSS | `/packages/app/src/emr/styles/theme.css` |
| EN Translations | `/packages/app/src/emr/translations/en.json` |
| KA Translations | `/packages/app/src/emr/translations/ka.json` |
| RU Translations | `/packages/app/src/emr/translations/ru.json` |

---

*Document Version: 1.0*
*Last Updated: 2025-11-22*
*Author: Claude Code - UI/UX Design Agent*
