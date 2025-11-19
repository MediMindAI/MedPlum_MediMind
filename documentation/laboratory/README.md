# Laboratory Section - Implementation Guide

**Status**: ✅ Fully Mapped and Ready for Implementation
**Date**: 2025-11-18
**Mapped From**: http://178.134.21.82:8008/clinic.php

---

## Overview

This directory contains comprehensive documentation for rebuilding the Laboratory (ლაბორატორიული) nomenclature section in the Medplum MediMind EMR system.

### What Was Mapped

The EMR Page Mapper agent systematically documented **4 complete sub-pages** of the laboratory section:

1. **კვლევის კომპონენტები (Research Components)** - 92 lab test parameters
2. **ნიმუშები (Samples)** - 45+ biological sample types
3. **მანიპულაციები (Manipulations)** - 34+ sample collection procedures
4. **სინჯარები (Syringes)** - 15+ container types with color coding

### Total Data Catalog

- **186+ Data Entries** documented
- **50+ Interactive Elements** (buttons, dropdowns, actions)
- **63 Dropdown Options** (56 measurement units + 7 service types)
- **4 Complete Workflows** (add, edit, delete, search)

---

## Documentation Files

### Main Mapping Document
📄 **[laboratory-mapping.md](./laboratory-mapping.md)** (47KB, 1000 lines)

Complete UI/UX mapping including:
- Page layouts (ASCII diagrams)
- All form fields with validation rules
- Complete dropdown option lists (56 measurement units)
- Table structures with column definitions
- Button actions and workflows
- Sample data from each section
- FHIR resource mapping recommendations

---

## Quick Navigation

### Section 1: Research Components (კვლევის კომპონენტები)
- **92 Lab Parameters**: ALT, TSH, HGB, HCT, WBC, RBC, and more
- **56 Measurement Units**: IU/l, μIU/ml, g/dl, k/μl, %, etc. with UCUM codes
- **7 Service Types**: შიდა (Internal), ლიმბახი (Limbach), სხვა კლინიკები (Other Clinics)
- **Complex Filtering**: Multi-field search, status filter, type filter, unit filter
- **FHIR Mapping**: ObservationDefinition

### Section 2: Samples (ნიმუშები)
- **45+ Biological Samples**: Blood, urine, swabs, fluids, tissue
- **Categories**: Blood (15), Urine (5), Fluids (12), Swabs (7), Tissue (3)
- **Simple Structure**: Single name field with Georgian text
- **FHIR Mapping**: SpecimenDefinition

### Section 3: Manipulations (მანიპულაციები)
- **34+ Procedures**: Blood collection, fluid aspiration, swab collection
- **Categories**: Blood draws (3), Fluid collection (7), Swab collection (8), Urine (3)
- **Simple Structure**: Single name field with Georgian text
- **FHIR Mapping**: ActivityDefinition (procedure type)

### Section 4: Syringes/Containers (სინჯარები)
- **15+ Container Types**: BD Vacutainer tubes, collection vials, sterile containers
- **Color Coding**: Visual color bars (red, purple, light blue, yellow, green, gray, dark blue)
- **Volume Display**: ml measurements (2ml, 3ml, 4ml, 5ml, 10ml)
- **Special Feature**: Matches standard ISO 6710 laboratory tube colors
- **FHIR Mapping**: DeviceDefinition

---

## Implementation Roadmap

### Phase 1: Research Components (Most Complex)
**Estimated Effort**: 5-7 days

**Components to Build**:
1. **ComponentTable.tsx** - 10-column table with turquoise header
2. **ComponentEntryForm.tsx** - 7-field inline add/edit form
3. **ComponentEditModal.tsx** - Modal edit dialog
4. **MeasurementUnitSelect.tsx** - 56-option dropdown with UCUM codes
5. **ServiceTypeSelect.tsx** - 7-option type dropdown

**Services**:
- `componentService.ts` - CRUD operations for ObservationDefinition
- `ucumService.ts` - UCUM code utilities

**Data**:
- 92 lab parameters to import
- 56 measurement units with translations (ka/en/ru)

### Phase 2: Samples (Simple)
**Estimated Effort**: 1-2 days

**Components to Build**:
1. **SampleTable.tsx** - Single-column table
2. **SampleEntryForm.tsx** - Simple text input form

**Services**:
- `sampleService.ts` - CRUD operations for SpecimenDefinition

**Data**:
- 45+ sample types to import

### Phase 3: Manipulations (Simple)
**Estimated Effort**: 1-2 days

**Components to Build**:
1. **ManipulationTable.tsx** - Single-column table
2. **ManipulationEntryForm.tsx** - Simple text input form

**Services**:
- `manipulationService.ts` - CRUD operations for ActivityDefinition

**Data**:
- 34+ manipulation procedures to import

### Phase 4: Syringes/Containers (Medium Complexity)
**Estimated Effort**: 2-3 days

**Components to Build**:
1. **SyringeTable.tsx** - 3-column table with color bars
2. **SyringeEntryForm.tsx** - 3-field form (name, color, volume)
3. **ColorPickerWithBar.tsx** - Visual color bar component

**Services**:
- `syringeService.ts` - CRUD operations for DeviceDefinition

**Data**:
- 15+ container types with colors

---

## FHIR Resource Mappings

### ObservationDefinition (Research Components)
```typescript
{
  resourceType: "ObservationDefinition",
  identifier: [{ system: "http://medimind.ge/lab/component-code", value: "BL.11.2.2" }],
  code: { coding: [{ system: "http://loinc.org", code: "ALT" }] },
  title: "ალანინამინოტრანსფერაზა ALT (GPT)",
  qualifiedInterval: [{
    range: { low: { value: 0 }, high: { value: 55 } },
    age: { low: { value: 18, unit: "a" } }
  }],
  quantitativeDetails: {
    unit: { coding: [{ system: "http://unitsofmeasure.org", code: "IU/L" }] }
  },
  extension: [
    { url: "gis-code", valueString: ";ALTL" },
    { url: "service-type", valueString: "შიდა" },
    { url: "department", valueString: "branch-id" }
  ]
}
```

### SpecimenDefinition (Samples)
```typescript
{
  resourceType: "SpecimenDefinition",
  identifier: [{ system: "http://medimind.ge/lab/sample-type", value: "auto-generated" }],
  typeCollected: {
    coding: [{ system: "http://terminology.hl7.org/CodeSystem/v2-0487", code: "BLD" }],
    text: "სისხლი (კაპილარული)"
  }
}
```

### ActivityDefinition (Manipulations)
```typescript
{
  resourceType: "ActivityDefinition",
  name: "VenousSampleCollection",
  title: "ვენური სისხლის აღება",
  kind: "ServiceRequest",
  code: {
    coding: [{ system: "http://snomed.info/sct", code: "82078001" }],
    text: "ვენური სისხლის აღება"
  }
}
```

### DeviceDefinition (Syringes/Containers)
```typescript
{
  resourceType: "DeviceDefinition",
  deviceName: [{ name: "BD Vacutainer® ვენური სისხლის შეგროვების სისტემა", type: "user-friendly-name" }],
  property: [
    { type: { text: "color" }, valueCode: [{ coding: [{ code: "#8A2BE2" }] }] },
    { type: { text: "volume" }, valueQuantity: [{ value: 4, unit: "ml" }] }
  ]
}
```

---

## Key Features to Implement

### 1. Turquoise Gradient Theme
```css
--lab-header-gradient: linear-gradient(90deg, #00CED1, #20E4E7);
--lab-header-text: #ffffff;
```

### 2. Inline Add/Edit Forms
- Top-row form matching table columns
- Instant validation feedback
- Auto-refresh table after submission

### 3. Multi-Field Search (Research Components)
- Code search (partial match)
- Name search (partial match)
- Status filter dropdown
- Type filter dropdown
- Unit filter dropdown
- Search + Reset buttons

### 4. Color-Coded Containers (Syringes)
- Visual color bars in table cells
- 7 standard laboratory colors
- Matches ISO 6710 specifications

### 5. UCUM Unit Support
- 56 measurement units
- UCUM code mapping
- Multilingual unit names (ka/en/ru)

---

## Data Import Scripts

### Research Components Import
```typescript
// scripts/import-lab-components.ts
import { readFileSync } from 'fs';
import { MedplumClient } from '@medplum/core';

const components = JSON.parse(readFileSync('./data/lab-components.json', 'utf-8'));

for (const comp of components) {
  await medplum.createResource({
    resourceType: 'ObservationDefinition',
    // ... mapping logic
  });
}
```

### Sample/Manipulation/Syringe Imports
Similar pattern for other sections with simpler data structures.

---

## Testing Strategy

### Unit Tests
- Component rendering tests
- Form validation tests
- Service CRUD operation tests
- FHIR resource mapping tests

### Integration Tests
- Full workflow tests (add → edit → delete)
- Search/filter functionality tests
- Multi-language tests (ka/en/ru)

### Visual Regression Tests
- Table layout consistency
- Color bar rendering (syringes)
- Turquoise gradient theme

---

## Translation Keys Required

### Georgian (ka)
```json
{
  "laboratory.researchComponents": "კვლევის კომპონენტები",
  "laboratory.samples": "ნიმუშები",
  "laboratory.manipulations": "მანიპულაციები",
  "laboratory.syringes": "სინჯარები",
  "laboratory.code": "კოდი",
  "laboratory.gisCode": "GIS კოდი",
  "laboratory.name": "დასახელება",
  "laboratory.type": "ტიპი",
  "laboratory.unit": "ზომა",
  "laboratory.department": "ფილიალი",
  "laboratory.color": "ფერი",
  "laboratory.volume": "მოცულობა"
}
```

### English (en) + Russian (ru)
Similar structure with translated values.

---

## Performance Considerations

### Pagination
- 50 entries per page (default)
- Client-side pagination for < 100 entries
- Server-side pagination for > 100 entries

### Caching
- Cache measurement units (rarely change)
- Cache service types (rarely change)
- Invalidate cache on add/edit/delete

### Virtual Scrolling
- Optional for large datasets (> 200 entries)
- Use `react-window` or `react-virtualized`

---

## Common Pitfalls to Avoid

1. **UCUM Code Mismatches**: Always validate UCUM codes against official registry
2. **Color Encoding**: Use hex codes for syringe colors, not RGB strings
3. **Georgian Encoding**: Ensure UTF-8 encoding for all Georgian text
4. **FHIR Validation**: Validate all resources before creation (use Medplum validators)
5. **Inline Editing Conflicts**: Lock rows during edit to prevent concurrent modifications

---

## Next Steps

1. ✅ **Documentation Complete** - All 4 sections fully mapped
2. ⬜ **Create FHIR Resources** - Set up resource structures
3. ⬜ **Build UI Components** - Start with Research Components (most complex)
4. ⬜ **Import Data** - Create import scripts for 186+ entries
5. ⬜ **Add Translations** - Georgian/English/Russian
6. ⬜ **Write Tests** - Unit + integration tests
7. ⬜ **Deploy to Staging** - Test in production-like environment

---

## Questions or Issues?

Refer to the main mapping document: [laboratory-mapping.md](./laboratory-mapping.md)

For FHIR resource questions, consult:
- [FHIR R4 ObservationDefinition](https://hl7.org/fhir/R4/observationdefinition.html)
- [FHIR R4 SpecimenDefinition](https://hl7.org/fhir/R4/specimendefinition.html)
- [FHIR R4 ActivityDefinition](https://hl7.org/fhir/R4/activitydefinition.html)
- [FHIR R4 DeviceDefinition](https://hl7.org/fhir/R4/devicedefinition.html)

---

**Last Updated**: 2025-11-18
**Mapping Agent**: emr-page-mapper v1.0
**Total Mapping Time**: ~45 minutes
