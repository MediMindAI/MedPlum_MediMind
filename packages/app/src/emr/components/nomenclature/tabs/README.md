# Registered Services Modal - Tab Components

This directory contains the 4 tab components for the Registered Services Modal:

## Created Components

### 1. FinancialTab.tsx ✅
- **Purpose**: Insurance-based pricing configuration
- **Sections**: Add price form, price history table
- **Features**: Date-effective pricing, currency selection (GEL), insurance company selection

### 2. SalaryTab.tsx ✅
- **Purpose**: Compensation distribution for medical services
- **Sections**:
  - Performers (შემსრულებლები) - form + table
  - Secondary Personnel (დამხმარე პერსონალი) - 3 dropdowns + list
  - Other Salaries (სხვა ხელფასი) - input + list
  - Description (აღწერილობა) - textarea
- **Features**: Percentage-based compensation, multiple performers support

### 3. MedicalTab.tsx ✅
- **Purpose**: Laboratory and medical configurations
- **Sections**:
  - Samples (სინჯარები) - 4 filter dropdowns + table
  - Components (კომპონენტები) - dropdown + table
  - Other Parameters (სხვა პარამეტრები) - 3 checkboxes + conditional LIS provider dropdown + textarea
- **Features**: Lab sample management, research components, LIS integration

### 4. AttributesTab.tsx ✅
- **Purpose**: Service attributes and configurations
- **Sections**:
  - Color Picker (ფერი) - dropdown + category display + HEX input with color preview
  - Online Blocking Hours (ონლაინ ბლოკირება) - time range form + table
  - Equipment/Consumables (აღჭურვილობა ხარჯვა) - dropdown + quantity + table
- **Features**: Color coding, time blocking, equipment management

## Common Patterns

All tab components follow the same structure:

1. **Props**: `service: ActivityDefinition`, `onSave: (service: ActivityDefinition) => Promise<void>`
2. **Header Section**: Paper with #f8f9fa background, title and description
3. **Form Sections**: Paper components with borders
4. **Table Headers**: Turquoise gradient (var(--emr-gradient-submenu)) with white text
5. **Section Headers**: #E8E8F5 background (SalaryTab) or regular styling
6. **TODO Comments**: Placeholders for logic to be implemented

## Styling

- **Theme Colors**: Uses CSS custom properties from `packages/app/src/emr/styles/theme.css`
- **Gradient**: `var(--emr-gradient-submenu)` for table headers and buttons
- **Section Background**: #f8f9fa for header sections
- **Section Background**: #E8E8F5 for salary tab subsections
- **Mantine Components**: Stack, Group, Paper, Table, Select, TextInput, NumberInput, Checkbox, Button, etc.

## Next Steps

To complete implementation:

1. Add translation keys to `packages/app/src/emr/translations/*.json`
2. Implement form state management (Mantine useForm)
3. Implement data loading from FHIR extensions
4. Implement save logic to update ActivityDefinition
5. Add row actions (edit/delete) to tables
6. Wire up to RegisteredServicesModal component
7. Add tests for each tab component

## Related Documentation

- Salary Tab: `documentation/registered-services-modal/salary-tab.md`
- Medical Tab: `documentation/registered-services-modal/medical-tab.md`
- Attributes Tab: `documentation/registered-services-modal/attributes-tab.md`
- Financial Tab: `documentation/registered-services-modal/financial-tab.md`
