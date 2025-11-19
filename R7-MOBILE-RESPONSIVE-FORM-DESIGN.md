# R7: Mobile-Responsive Form Design Patterns

## Decision
The MediMind EMR system implements **mobile-first responsive design using Mantine Grid with responsive span values**, **Mantine Stack components for vertical field stacking**, and **conditional full-width buttons via useMediaQuery hooks**. Forms consistently use single-column layouts on mobile (base: 12), transitioning to multi-column layouts on larger screens (md: 6, 4, etc.). Tables employ horizontal scroll on mobile with `-webkit-overflow-scrolling: touch` for momentum scrolling. Multi-select components use Mantine's `Select` and `MultiSelect` with searchable dropdowns, not checkbox lists. All interactive elements maintain minimum 44x44px touch targets via `size="md"` and `minHeight: '44px'` styles.

---

## Form Layout Patterns

### Single-Column Mobile, Multi-Column Desktop

**Mobile-First Approach:**
- **Mobile (base)**: All fields stack vertically in single column (`Grid.Col span={12}`)
- **Tablet (sm/md)**: Fields arrange into 2-column layout (`Grid.Col span={{ base: 12, md: 6 }}`)
- **Desktop (md/lg)**: Fields arrange into 3-4 column layout (`Grid.Col span={{ base: 12, md: 4 }}`)

**PatientForm Example (lines 439-462):**
```typescript
// Personal ID + Gender = 2 columns on desktop, 1 on mobile
<Grid>
  <Grid.Col span={6}>  // 50% width on desktop
    <TextInput label="Personal ID" {...form.getInputProps('personalId')} />
  </Grid.Col>
  <Grid.Col span={6}>  // 50% width on desktop
    <Select label="Gender" {...form.getInputProps('gender')} />
  </Grid.Col>
</Grid>

// First Name + Last Name + Father Name = 3 columns on desktop
<Grid>
  <Grid.Col span={4}>  // 33% width on desktop
    <TextInput label="First Name" {...form.getInputProps('firstName')} />
  </Grid.Col>
  <Grid.Col span={4}>  // 33% width on desktop
    <TextInput label="Last Name" {...form.getInputProps('lastName')} />
  </Grid.Col>
  <Grid.Col span={4}>  // 33% width on desktop
    <TextInput label="Father Name" {...form.getInputProps('fatherName')} />
  </Grid.Col>
</Grid>
```

**Mantine Grid Behavior:**
- `Grid.Col span={6}` → 50% width on desktop, 100% on mobile
- `Grid.Col span={4}` → 33% width on desktop, 100% on mobile
- `Grid.Col span={12}` → 100% width (full width on all sizes)
- Automatic responsive wrapping built into Mantine Grid component

### Vertical Field Stacking

**Use Stack for vertical spacing:**
```typescript
<Stack gap="md">
  <TextInput label="First Name" />
  <TextInput label="Last Name" />
  <TextInput label="Email" />
</Stack>
```

**PatientForm Implementation (lines 509-529):**
```typescript
<CollapsibleSection title="Contact Information" icon={<IconPhone />} defaultOpen={false}>
  <Stack gap="md">
    <InternationalPhoneInput label="Phone Number" {...props} />
    <TextInput label="Email" type="email" {...props} />
    <TextInput label="Address" {...props} />
  </Stack>
</CollapsibleSection>
```

---

## Multi-Select Components

### Single Select Dropdowns (Mantine Select)

**Pattern for role/department/location selection:**
```typescript
import { Select } from '@mantine/core';

<Select
  label="Gender"
  placeholder="Select gender"
  data={[
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ]}
  {...form.getInputProps('gender')}
  searchable  // Enables search in dropdown
  required
/>
```

**PatientForm Examples (lines 449-460, 542-551):**
```typescript
// Gender Select
<Select
  label={t('registration.field.gender')}
  placeholder={t('registration.field.selectGender') || 'Select gender'}
  data={[
    { value: 'male', label: t('registration.gender.male') || 'Male' },
    { value: 'female', label: t('registration.gender.female') || 'Female' },
    { value: 'other', label: t('registration.gender.other') || 'Other' },
    { value: 'unknown', label: t('registration.gender.unknown') || 'Unknown' },
  ]}
  {...form.getInputProps('gender')}
  required={!form.values.isUnknownPatient}
/>

// Marital Status Select (repeats same pattern)
<Select
  label={t('registration.field.maritalStatus')}
  placeholder={t('registration.field.selectMaritalStatus') || 'Select'}
  data={[
    { value: 'single', label: t('registration.maritalStatus.single') || 'Single' },
    { value: 'married', label: t('registration.maritalStatus.married') || 'Married' },
    { value: 'divorced', label: t('registration.maritalStatus.divorced') || 'Divorced' },
    { value: 'widowed', label: t('registration.maritalStatus.widowed') || 'Widowed' },
  ]}
  {...form.getInputProps('maritalStatus')}
/>
```

### Searchable Multi-Select (Mantine MultiSelect)

**Pattern for multiple selections (future use for roles/departments):**
```typescript
import { MultiSelect } from '@mantine/core';

<MultiSelect
  label="Assigned Departments"
  placeholder="Select departments"
  data={[
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'orthopedics', label: 'Orthopedics' },
    { value: 'neurology', label: 'Neurology' },
  ]}
  searchable
  clearable
  maxDropdownHeight={200}  // Prevent super tall dropdowns
/>
```

### Composite Phone Input (Select + TextInput)

**InternationalPhoneInput Implementation (lines 62-82):**
```typescript
<Group align="flex-end" gap="xs">
  <Select
    label="Phone Number"
    data={countries}  // { value: '+995', label: '🇬🇪 +995 (Georgia)' }
    value={countryCode}
    onChange={(val) => handleCountryChange(val || '+995')}
    style={{ width: '180px' }}  // Fixed width for country code
    searchable
  />
  <TextInput
    placeholder="500050610"
    value={phoneNumber}
    onChange={(e) => handlePhoneChange(e.target.value)}
    style={{ flex: 1 }}  // Takes remaining space
  />
</Group>
```

**Key Pattern:**
- Select dropdown with fixed width for country codes
- TextInput with `flex: 1` takes remaining space
- Group component aligns both to baseline
- Works responsively because Group wraps automatically

---

## Table Design for Mobile

### Horizontal Scroll (Preferred for Data Tables)

**PatientHistoryTable Implementation (lines 131-209):**
```typescript
// Desktop version - standard table
<Table highlightOnHover>
  <Table.Thead style={{ background: 'var(--emr-gradient-submenu)' }}>
    <Table.Tr>
      <Table.Th>Personal ID</Table.Th>
      <Table.Th>First Name</Table.Th>
      <Table.Th>Last Name</Table.Th>
      <Table.Th onClick={() => onSort('date')} style={{ cursor: 'pointer' }}>
        Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
      </Table.Th>
      {/* ... 6 more columns ... */}
    </Table.Tr>
  </Table.Thead>
  <Table.Tbody>
    {visits.map((visit) => (
      <Table.Tr key={visit.id} onClick={() => handleRowClick(visit.id)} style={{ cursor: 'pointer' }}>
        <Table.Td>{visit.personalId}</Table.Td>
        {/* ... */}
      </Table.Tr>
    ))}
  </Table.Tbody>
</Table>
```

**Mobile Scroll Wrapper Pattern (from CLAUDE.md):**
```typescript
<Box style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
  <Table style={{ minWidth: '600px' }}>
    {/* ... table content ... */}
  </Table>
</Box>
```

**Key Mobile Features:**
- `-webkit-overflow-scrolling: touch` enables momentum scrolling on iOS
- `minWidth: '600px'` ensures all columns visible without cramping
- Horizontal scrollbar appears only when needed
- No horizontal scrolling on body element
- First column can be made sticky for identification (future enhancement)

### Financial Highlighting (Mobile-Friendly)

**PatientHistoryTable Lines 154-184:**
```typescript
const hasDebt = visit.debt > 0;
const DEBT_HIGHLIGHT_COLOR = 'rgba(0, 255, 0, 0.2)'; // Green background

<Table.Td
  style={{
    textAlign: 'right',
    backgroundColor: hasDebt ? DEBT_HIGHLIGHT_COLOR : 'transparent',
    fontWeight: hasDebt ? 600 : 400,  // Bold when > 0
  }}
>
  {formatCurrency(visit.debt)}
</Table.Td>
```

**Advantages:**
- Works on mobile and desktop
- Color change alone sufficient (not relying on size)
- Bold font weight adds emphasis without layout shift
- No hover effects (touch-unfriendly)

### Card-Based Layout Alternative (Not Currently Used)

For highly mobile-focused tables, convert to card layout:
```typescript
// For mobile only
const isMobile = useMediaQuery('(max-width: 768px)');

return isMobile ? (
  <Stack gap="md">
    {visits.map((visit) => (
      <Card key={visit.id} p="md" onClick={() => handleRowClick(visit.id)}>
        <Grid>
          <Grid.Col span={6}><Text size="sm" c="dimmed">Personal ID</Text>{visit.personalId}</Grid.Col>
          <Grid.Col span={6}><Text size="sm" c="dimmed">First Name</Text>{visit.firstName}</Grid.Col>
          {/* Repeat for all columns */}
        </Grid>
      </Card>
    ))}
  </Stack>
) : (
  <Table>{/* Desktop table */}</Table>
);
```

---

## Touch-Friendly Interaction Patterns

### Button Sizes and Spacing

**Minimum Touch Target: 44x44px (Apple's Standard)**

```typescript
<Button
  size="md"                           // Mantine size="md" = 40px height (close to 44px)
  styles={{ input: { minHeight: '44px' } }}  // Explicit minimum height
  fullWidth={isMobile}                // Full width on mobile for easier tapping
/>

<TextInput
  size="md"
  styles={{ input: { minHeight: '44px' } }}
/>

<Select
  size="md"
  styles={{ input: { minHeight: '44px' } }}
/>
```

**SubmitDropdownButton Pattern:**
```typescript
// 4 submit actions available via dropdown
<Button
  size="md"
  rightSection={<IconChevronDown size={16} />}
  onClick={handleMainAction}
/>
```

### Spacing Between Interactive Elements

**Stack with appropriate gaps:**
```typescript
<Stack gap="md">  // 12px gap between form fields
  <TextInput label="First Name" />
  <TextInput label="Last Name" />
  <TextInput label="Email" />
  <Button size="md">Submit</Button>
</Stack>
```

**Grid with responsive gaps:**
```typescript
<Grid gutter={{ base: 'xs', sm: 'md', lg: 'lg' }}>
  {/* Compact spacing on mobile, wider on desktop */}
  <Grid.Col span={6}>Field 1</Grid.Col>
  <Grid.Col span={6}>Field 2</Grid.Col>
</Grid>
```

### Hover-Free Interactions (Touch-Optimized)

**Avoid hover-only interactions:**
```typescript
// Bad: hover-only
<Button onMouseEnter={() => setHovered(true)}>Click me</Button>

// Good: click/tap-based
<Button onClick={() => setOpened(!opened)}>Expand Section</Button>

// Good: active state is visible without hover
<ActionIcon onClick={() => onEdit(id)} variant="subtle" color="blue">
  <IconEdit size={16} />
</ActionIcon>
```

**PatientHistoryTable Row Click (line 74-79):**
```typescript
const handleRowClick = (visitId: string) => {
  if (onRowClick) {
    onRowClick(visitId);
  } else {
    navigate(`/emr/patient-history/${visitId}`);
  }
};

// Row is clickable on mobile and desktop
<Table.Tr
  onClick={() => handleRowClick(visit.id)}
  style={{ cursor: 'pointer' }}
>
```

### Collapsible Sections (Touch-Friendly)

**CollapsibleSection Component (lines 30-89):**
```typescript
<UnstyledButton
  onClick={() => setOpened(!opened)}
  style={{
    width: '100%',
    padding: '14px 18px',      // Large touch target (>44px min)
    backgroundColor: isHovered ? '#f8f9fa' : 'white',
    borderRadius: '8px',
    border: '1px solid var(--emr-gray-200)',
    transition: 'all 0.2s ease',
  }}
>
  <Group justify="space-between" wrap="nowrap">
    <Text fw={600} size="md">{title}</Text>
    <IconChevronDown
      style={{
        transform: opened ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s ease',
      }}
    />
  </Group>
</UnstyledButton>

<Collapse in={opened}>
  <Box p="md">{children}</Box>  // Content below is also clickable
</Collapse>
```

---

## Mantine Responsive Utilities

### useMediaQuery Hook (Preferred for Conditional Rendering)

```typescript
import { useMediaQuery } from '@mantine/hooks';

export function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  return (
    <>
      {isMobile && <MobileView />}
      {!isMobile && <DesktopView />}
    </>
  );
}
```

### Responsive Props (Preferred for Layout Adjustments)

**Recommended Usage (no JavaScript needed):**
```typescript
<Grid gutter={{ base: 'xs', sm: 'md', lg: 'lg' }}>
  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
    <TextInput label="First Name" />
  </Grid.Col>
  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
    <TextInput label="Last Name" />
  </Grid.Col>
</Grid>

<Button
  fullWidth={isMobile}  // Only if logic needed; otherwise just omit
  size="md"
/>

<Box p={{ base: 'sm', md: 'lg' }}>
  {/* Small padding on mobile, large on desktop */}
  Content
</Box>
```

### Breakpoint System (from theme.css)

```css
/* Mobile First Breakpoints */
--emr-mobile-breakpoint: 768px;      /* Tablets portrait */
--emr-tablet-breakpoint: 1024px;     /* Tablets landscape */
--emr-desktop-breakpoint: 1440px;    /* Large desktops */
```

**Mantine Default Breakpoints:**
- `xs`: 576px (small phones)
- `sm`: 768px (tablets portrait)
- `md`: 992px (tablets landscape)
- `lg`: 1200px (desktops)
- `xl`: 1400px (large desktops)

**Example with All Sizes:**
```typescript
<Grid.Col
  span={{
    base: 12,    // Mobile: full width
    xs: 12,      // Small phones: full width
    sm: 6,       // Tablets: half width
    md: 4,       // Landscape tablets: one-third
    lg: 3,       // Desktops: one-quarter
    xl: 2,       // Large desktops: one-sixth
  }}
>
  <TextInput label="Field" />
</Grid.Col>
```

---

## Implementation Guidelines

### 1. Always Start Mobile-First

```typescript
// DO: Mobile first
<Grid.Col span={{ base: 12, md: 6 }}>  // 100% mobile, 50% desktop
  <TextInput label="Name" />
</Grid.Col>

// DON'T: Desktop first
<Grid.Col span={{ md: 6 }}>  // Not specified for mobile
  <TextInput label="Name" />
</Grid.Col>
```

### 2. Use size="md" for All Form Inputs

```typescript
// All form controls should be at least "md" size for 44px min-height
<TextInput size="md" />
<Select size="md" />
<Button size="md" />
<ActionIcon size="md" />
```

### 3. Stack Fields Vertically by Default

```typescript
// Group fields only when truly needed on desktop
<Stack gap="md">
  <Grid>
    <Grid.Col span={{ base: 12, md: 6 }}>
      <TextInput label="First Name" />
    </Grid.Col>
    <Grid.Col span={{ base: 12, md: 6 }}>
      <TextInput label="Last Name" />
    </Grid.Col>
  </Grid>
</Stack>
```

### 4. Make Buttons Full-Width on Mobile Only

```typescript
const isMobile = useMediaQuery('(max-width: 768px)');

<Button fullWidth={isMobile} size="md">
  Submit
</Button>

// Or use responsive props directly
<Button fullWidth={{ base: true, sm: false }} size="md">
  Submit
</Button>
```

### 5. Test Touch Interactions

```typescript
// DON'T: Hover-only actions
<button onMouseEnter={() => showMenu()}>Menu</button>

// DO: Click-based actions that work on touch
<button onClick={() => setMenuOpen(!menuOpen)}>Menu</button>
```

### 6. Use Horizontal Scroll for Tables

```typescript
import { Box, Table } from '@mantine/core';

<Box style={{
  overflowX: 'auto',
  WebkitOverflowScrolling: 'touch',  // Momentum scrolling on iOS
}}>
  <Table style={{ minWidth: '600px' }}>
    {/* ... table ... */}
  </Table>
</Box>
```

### 7. Color Not Size for Highlighting

```typescript
// For financial highlighting, use color + weight, not size changes
<Table.Td
  style={{
    backgroundColor: hasDebt ? 'rgba(0, 255, 0, 0.2)' : 'transparent',
    fontWeight: hasDebt ? 600 : 400,
  }}
>
  {value}
</Table.Td>
```

### 8. Proper Padding for Safe Areas

```typescript
// Account for notch and home indicator on mobile
<Box p={{ base: 'sm', md: 'lg' }} pb={{ base: 'xl', md: 'lg' }}>
  {/* Extra bottom padding on mobile for home indicator */}
  Content
</Box>
```

---

## Rationale

**Why Mantine Grid over custom CSS:**
Mantine Grid's responsive `span` prop provides a declarative, type-safe way to define breakpoint-aware column widths without writing media queries. This approach is consistent, reduces CSS, and matches modern React patterns.

**Why Stack for field spacing:**
Stack component provides automatic consistent spacing with `gap` prop that responds to responsive values. This ensures uniform vertical rhythm across all screen sizes and reduces CSS boilerplate.

**Why horizontal scroll for tables:**
Tables inherently contain fixed-width content. Horizontal scroll on mobile preserves table semantics and readability better than card-based layouts for data-dense content. The WebKit momentum scrolling makes mobile scrolling feel native.

**Why 44x44px minimum:**
Apple's Human Interface Guidelines specify 44x44pt as minimum tap target size. This prevents accidental taps on adjacent elements and accommodates various finger sizes and dexterity levels.

**Why no hover interactions:**
Touch devices don't have hover states. Relying on hover creates unusable interfaces on mobile. All interactive feedback should occur on click/tap.

**Why collapsible sections on forms:**
Long forms are overwhelming on mobile. Collapsible sections let users focus on relevant sections, reducing cognitive load and improving completion rates. Default-open sections ensure critical information is always visible.

---

## References

**Files Examined:**
- `/Users/toko/Desktop/medplum_medimind/packages/app/src/emr/components/registration/PatientForm.tsx` (753 lines) - Comprehensive form with 4 collapsible sections, Grid-based layout, responsive patterns
- `/Users/toko/Desktop/medplum_medimind/packages/app/src/emr/components/patient-history/PatientHistoryTable.tsx` (211 lines) - 10-column table with mobile scroll pattern, financial highlighting, sortable columns
- `/Users/toko/Desktop/medplum_medimind/packages/app/src/emr/styles/theme.css` (198 lines) - CSS custom properties, breakpoint definitions, layout dimensions
- `/Users/toko/Desktop/medplum_medimind/packages/app/src/emr/components/registration/CollapsibleSection.tsx` (90 lines) - Touch-friendly expandable section component with proper spacing
- `/Users/toko/Desktop/medplum_medimind/packages/app/src/emr/components/registration/InternationalPhoneInput.tsx` (85 lines) - Composite input with Select + TextInput responsive pattern
- `/Users/toko/Desktop/medplum_medimind/CLAUDE.md` (1518 lines) - Mobile-first development guidelines, Mantine responsive utilities, breakpoint constants, testing requirements

**Key CLAUDE.md Sections Referenced:**
- Lines 122-257: Mobile-First Development (CRITICAL) - Core principles, Mantine utilities, breakpoints, component guidelines, testing requirements
- Lines 164-176: Forms section - Stack vertically on mobile, size="md" for inputs, labels above, full-width buttons
- Lines 178-187: Tables section - Horizontal scroll wrapper, sticky first column, minimum column widths
- Lines 189-217: Component-specific mobile guidelines for navigation, modals, typography, performance

**Mantine Documentation:**
- Grid component with responsive span props
- Stack component with responsive gap values
- useMediaQuery hook for conditional rendering
- ActionIcon, Button, TextInput, Select with size variants

