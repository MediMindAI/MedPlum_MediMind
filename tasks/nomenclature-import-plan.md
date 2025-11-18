# Medical Services Nomenclature Implementation Plan

## Executive Summary

**Goal:** Implement a Medical Services Nomenclature system with import of 10,000+ services from a .numbers file into FHIR, plus build a full-featured management UI.

**Status:** Research Complete - Ready for Implementation

**Discovered:** A significant portion of the nomenclature infrastructure already exists in the codebase:
- ✅ Route structure: `/emr/nomenclature/medical-1` 
- ✅ FHIR mapping: ActivityDefinition resource with extensions
- ✅ UI components: ServiceTable, ServiceEntryForm, ServiceEditModal, etc.
- ✅ Translation files: service-groups.json, service-types.json, etc.
- ✅ Hooks and services: useNomenclature, nomenclatureService.ts
- ⚠️ Missing: ServiceFilters component (TODO comment in code)
- ⚠️ Missing: Excel import functionality
- ⚠️ Missing: Actual import script for .numbers file
- ⚠️ Missing: Pagination for 10,000+ records

---

## Project Breakdown

### Phase 1: Data Import Script (High Priority)
**Goal:** Import 10,000+ services from .numbers file to FHIR

**Files to Create:**
- `scripts/import-nomenclature.ts` - Main import script
- `scripts/nomenclature-parser.ts` - .numbers file parser
- `scripts/batch-import-services.ts` - Batch processing for FHIR

**Approach:**
1. .numbers files are Apple Numbers format (ZIP archive with XML/JSON inside)
2. Use `xlsx` npm package (supports Numbers format) to read file
3. Parse rows into ServiceFormValues interface
4. Batch create ActivityDefinition resources (100 at a time to avoid timeout)
5. Add progress logging and error handling

**Data Source:**
`/Users/toko/Desktop/medplum_medimind/documentation/xsl/სამედიცინო სერვისების ცხრილი.numbers`

**Expected Columns (from documentation):**
- კოდი (Code) → identifier
- დასახელება (Name) → title
- ჯგუფი (Group) → topic
- ტიპი (Type) → extension (service-type)
- სერვისი (Service Category) → extension (service-category)
- ფასი (Price) → extension (base-price)
- ჯამი (Total) → extension (total-amount)
- კალჰედ (CalHed) → extension (cal-hed)
- Prt (Printable) → extension (printable)
- ItmGetPrc (Item Get Price) → extension (item-get-price)

**FHIR Resource:** ActivityDefinition with custom extensions

---

### Phase 2: Complete UI Components (Medium Priority)
**Goal:** Finish missing UI components

#### 2.1: ServiceFilters Component
**File:** `packages/app/src/emr/components/nomenclature/ServiceFilters.tsx`

**Features:**
- Code search (text input, debounced)
- Name search (text input, debounced)
- Group filter (dropdown, 7 options from service-groups.json)
- Subgroup filter (dropdown, 50 options from service-subgroups.json)
- Type filter (dropdown, 7 options from service-types.json)
- Service category filter (dropdown, 3 options from service-categories.json)
- Price range filter (start/end inputs)
- Status filter (active/retired/all)
- Department assignment filter (is/is-not + department selector)
- Clear filters button

**Pattern:** Follow `PatientHistoryFilters.tsx` pattern

#### 2.2: ExcelImport Component
**File:** `packages/app/src/emr/components/nomenclature/ExcelImport.tsx`

**Features:**
- Dropzone for file upload (CSV/Excel)
- File validation (columns, data types)
- Preview table with first 10 rows
- Import progress indicator
- Error handling with row-level feedback
- Success notification with count

**Dependencies:**
- `@mantine/dropzone` (already in package.json)
- `xlsx` package for parsing

#### 2.3: Pagination Component
**File:** `packages/app/src/emr/components/nomenclature/ServicePagination.tsx`

**Features:**
- Page size selector (20, 50, 100, 200)
- Previous/Next buttons
- Page number input
- Total count display
- Jump to page

**Pattern:** Use Mantine Pagination component

---

### Phase 3: Performance Optimization (High Priority for 10,000+ records)
**Goal:** Handle large datasets efficiently

#### 3.1: Virtual Scrolling (Option A - Recommended)
**Library:** `@tanstack/react-virtual`

**Benefits:**
- Only render visible rows (50-100 at a time)
- Smooth scrolling for 10,000+ rows
- Minimal DOM nodes

**Changes Required:**
- Modify `ServiceTable.tsx` to use virtualization
- Add scroll container with fixed height
- Calculate row heights dynamically

#### 3.2: Server-Side Pagination (Option B - Simpler)
**Approach:**
- Use FHIR `_count` and `_offset` parameters
- Fetch 20-100 records per page
- Add pagination controls

**Benefits:**
- Simpler implementation
- Less memory usage on client
- Already partially implemented in `nomenclatureService.ts`

**Recommendation:** Use Option B (server-side pagination) first, add Option A (virtualization) later if needed.

---

### Phase 4: Excel Export Enhancement (Low Priority)
**Goal:** Complete Excel export functionality

**File:** `packages/app/src/emr/services/excelExportService.ts`

**Features:**
- Export current page or all records
- Respect active filters
- Include all table columns
- Format dates and currency
- Georgian language headers

**Libraries:**
- `xlsx` package (already used for import)

---

## File Structure

### New Files to Create

```
packages/app/src/emr/
├── components/nomenclature/
│   ├── ServiceFilters.tsx           # ⭐ NEW - Multi-field search/filter
│   ├── ServiceFilters.test.tsx      # ⭐ NEW - Component tests
│   ├── ExcelImport.tsx              # ⭐ NEW - Excel/CSV import UI
│   ├── ExcelImport.test.tsx         # ⭐ NEW - Import tests
│   └── ServicePagination.tsx        # ⭐ NEW - Pagination controls
├── services/
│   ├── excelExportService.ts        # ⭐ NEW - Excel export logic
│   └── excelImportService.ts        # ⭐ NEW - Excel import logic
└── scripts/
    ├── import-nomenclature.ts       # ⭐ NEW - Main import script
    ├── nomenclature-parser.ts       # ⭐ NEW - File parser
    └── batch-import-services.ts     # ⭐ NEW - Batch FHIR operations
```

### Existing Files to Modify

```
packages/app/src/emr/
├── views/nomenclature/
│   └── NomenclatureMedical1View.tsx # Add ServiceFilters integration
├── components/nomenclature/
│   └── ServiceTable.tsx             # Add pagination support
├── hooks/
│   └── useNomenclature.ts           # Already has pagination - just wire it up
└── translations/
    ├── ka.json                      # Add new translation keys
    ├── en.json                      # Add new translation keys
    └── ru.json                      # Add new translation keys
```

---

## FHIR Resource Strategy

### ActivityDefinition Mapping (Already Implemented)

```typescript
{
  resourceType: 'ActivityDefinition',
  status: 'active' | 'retired' | 'draft',
  
  // Service code
  identifier: [{
    system: 'http://medimind.ge/nomenclature/service-code',
    value: 'CO456'  // From კოდი column
  }],
  
  // Service name
  title: 'კონსულტაცია კარდიოლოგთან',  // From დასახელება column
  
  // Service group
  topic: [{
    coding: [{
      code: '5',  // From ჯგუფი column
      display: 'კონსულტაცია'
    }]
  }],
  
  // Custom extensions
  extension: [
    {
      url: 'http://medimind.ge/extensions/service-subgroup',
      valueString: '60251'  // From ქვეჯგუფი column
    },
    {
      url: 'http://medimind.ge/extensions/service-type',
      valueString: '1'  // From ტიპი column (შიდა, სხვა კლინიკები, etc.)
    },
    {
      url: 'http://medimind.ge/extensions/service-category',
      valueString: '1'  // From სერვისი column (ამბულატორიული, სტაციონარული, ორივე)
    },
    {
      url: 'http://medimind.ge/extensions/base-price',
      valueMoney: { value: 150.00, currency: 'GEL' }  // From ფასი column
    },
    {
      url: 'http://medimind.ge/extensions/total-amount',
      valueMoney: { value: 150.00, currency: 'GEL' }  // From ჯამი column
    },
    {
      url: 'http://medimind.ge/extensions/cal-hed',
      valueDecimal: 1  // From კალჰედ column
    },
    {
      url: 'http://medimind.ge/extensions/printable',
      valueBoolean: true  // From Prt column
    },
    {
      url: 'http://medimind.ge/extensions/item-get-price',
      valueDecimal: 0  // From ItmGetPrc column
    },
    {
      url: 'http://medimind.ge/extensions/assigned-departments',
      valueString: '["735", "746"]'  // JSON array of department IDs
    }
  ]
}
```

---

## Translation Keys to Add

### Georgian (ka.json)
```json
{
  "nomenclature.filters.title": "ფილტრები",
  "nomenclature.filters.code": "კოდი",
  "nomenclature.filters.name": "დასახელება",
  "nomenclature.filters.group": "ჯგუფი",
  "nomenclature.filters.subgroup": "ქვეჯგუფი",
  "nomenclature.filters.type": "ტიპი",
  "nomenclature.filters.serviceCategory": "სერვისი",
  "nomenclature.filters.priceStart": "ფასი (დან)",
  "nomenclature.filters.priceEnd": "ფასი (მდე)",
  "nomenclature.filters.status": "სტატუსი",
  "nomenclature.filters.statusActive": "აქტიური",
  "nomenclature.filters.statusRetired": "წაშლილი",
  "nomenclature.filters.statusAll": "ყველა",
  "nomenclature.filters.departmentAssignment": "განყოფილება",
  "nomenclature.filters.departmentIs": "არის განყოფილებაში",
  "nomenclature.filters.departmentIsNot": "არ არის განყოფილებაში",
  "nomenclature.filters.clearAll": "გასუფთავება",
  "nomenclature.filters.search": "ძებნა",
  "nomenclature.import.title": "ფაილის იმპორტი",
  "nomenclature.import.dropzone": "ჩააგდეთ Excel ან CSV ფაილი აქ",
  "nomenclature.import.or": "ან",
  "nomenclature.import.selectFile": "აირჩიეთ ფაილი",
  "nomenclature.import.preview": "წინასწარი გადახედვა",
  "nomenclature.import.startImport": "იმპორტის დაწყება",
  "nomenclature.import.importing": "იმპორტირება...",
  "nomenclature.import.success": "წარმატებით იმპორტირდა {count} სერვისი",
  "nomenclature.import.error": "იმპორტი ვერ მოხერხდა",
  "nomenclature.pagination.pageSize": "ხაზების რაოდენობა",
  "nomenclature.pagination.page": "გვერდი",
  "nomenclature.pagination.of": "-დან",
  "nomenclature.pagination.total": "სულ: {count}",
  "common.exportExcel": "Excel-ის ექსპორტი",
  "common.recordCount": "ხაზზე ({count})"
}
```

### English (en.json) & Russian (ru.json)
Similar translations for multilingual support.

---

## Performance Considerations for 10,000+ Records

### Database Indexing
Ensure PostgreSQL indexes on:
- `ActivityDefinition.identifier` (for code search)
- `ActivityDefinition.title` (for name search)
- `ActivityDefinition.topic` (for group filter)
- `ActivityDefinition.extension[service-type]` (for type filter)
- `ActivityDefinition.status` (for status filter)

### FHIR Search Optimization
Use efficient search parameters:
```typescript
{
  _count: 100,          // Limit results per page
  _offset: 0,           // Pagination offset
  _sort: 'title',       // Sort by name (default)
  'identifier': 'http://medimind.ge/nomenclature/service-code|CO',  // Code search
  'title:contains': 'კონსულტაცია',  // Name search (partial match)
  'topic': '5',         // Group filter (exact match)
  'status': 'active'    // Status filter
}
```

### React Optimization
- Use React.memo() for ServiceTable rows
- Debounce search inputs (500ms)
- Lazy load large dropdown options
- Virtual scrolling for 1000+ records

---

## Integration Points

### Menu Structure (Already Done ✅)
```typescript
// packages/app/src/emr/translations/menu-structure.ts
{
  key: 'nomenclature',
  translationKey: 'menu.nomenclature',
  path: '/emr/nomenclature',
  subMenu: [
    { key: 'medical1', translationKey: 'submenu.nomenclature.medical1', path: '/emr/nomenclature/medical-1' },
    // ... 12 more sub-routes
  ]
}
```

### Routing (Already Done ✅)
```typescript
// packages/app/src/AppRoutes.tsx
<Route path="nomenclature" element={<NomenclatureSection />}>
  <Route index element={<Navigate to="medical-1" replace />} />
  <Route path="medical-1" element={<NomenclatureMedical1View />} />
  // ... other routes
</Route>
```

### Theme Colors (Use existing theme ✅)
- Turquoise gradient for table headers: `var(--emr-gradient-submenu)`
- Blue gradient for buttons: `var(--emr-gradient-primary)`
- Light gray for section headers: `#f8f9fa`

---

## Implementation Workflow

### Step 1: Install Dependencies
```bash
cd packages/app
npm install xlsx @tanstack/react-virtual
```

### Step 2: Create Import Script
```bash
# Create script to parse .numbers file and import to FHIR
node scripts/import-nomenclature.ts --file "documentation/xsl/სამედიცინო სერვისების ცხრილი.numbers"
```

### Step 3: Build ServiceFilters Component
Follow PatientHistoryFilters pattern with all filter fields.

### Step 4: Add Pagination to ServiceTable
Wire up existing pagination in useNomenclature hook to UI controls.

### Step 5: Implement Excel Import UI
Create ExcelImport component with Dropzone and validation.

### Step 6: Test with 10,000+ Records
- Load testing with full dataset
- Performance profiling
- Optimize if needed

---

## Testing Requirements

### Unit Tests
- ServiceFilters component (filter logic)
- ExcelImport component (file validation)
- nomenclature-parser (data parsing)
- excelImportService (batch processing)

### Integration Tests
- Full import workflow (file → FHIR)
- Search and filter functionality
- Pagination with large datasets
- Excel export with filters

### Performance Tests
- Load 10,000 services and measure render time
- Test search responsiveness with debouncing
- Test pagination speed
- Test export speed

### User Acceptance Tests
- Import .numbers file successfully
- Search by code/name works correctly
- Filter by group/type/category works
- Pagination shows correct results
- Export creates valid Excel file
- All translations display correctly (ka/en/ru)

---

## Dependencies

### Already in package.json ✅
- `@mantine/core` - UI components
- `@mantine/hooks` - useMediaQuery, useForm
- `@mantine/notifications` - Success/error messages
- `@mantine/dropzone` - File upload
- `@medplum/core` - FHIR client
- `@medplum/fhirtypes` - TypeScript types

### Need to Add
- `xlsx` - Excel/Numbers file parsing
- `@tanstack/react-virtual` - Virtual scrolling (optional, for Phase 3)

---

## Risks and Mitigations

### Risk 1: .numbers File Format Complexity
**Mitigation:** Use `xlsx` library which supports Numbers format. Test with actual file first.

### Risk 2: Import Performance (10,000+ records)
**Mitigation:** Batch processing (100 records at a time), progress logging, resume on failure.

### Risk 3: FHIR Server Load
**Mitigation:** Use batch operations, rate limiting, background job queue.

### Risk 4: UI Performance with Large Datasets
**Mitigation:** Server-side pagination first, virtual scrolling if needed.

### Risk 5: Data Validation Errors
**Mitigation:** Thorough validation before import, row-level error reporting, manual fix UI.

---

## Success Criteria

✅ Import 10,000+ services from .numbers file to FHIR ActivityDefinition
✅ ServiceFilters component with all search/filter fields
✅ Pagination working for large datasets
✅ Excel import UI with validation and preview
✅ Excel export with current filters
✅ All translations (Georgian/English/Russian)
✅ Performance: <3s for search/filter operations
✅ Performance: <5s for Excel export
✅ All tests passing (unit, integration, performance)

---

## Timeline Estimate

- **Phase 1 (Data Import):** 2-3 days
- **Phase 2 (UI Components):** 3-4 days
- **Phase 3 (Performance):** 2-3 days
- **Phase 4 (Excel Export):** 1-2 days
- **Testing & Bug Fixes:** 2-3 days

**Total:** 10-15 days (2-3 weeks)

---

## Questions for User

1. **Import Source:** Should we use the .numbers file or convert it to CSV first?
2. **Pagination:** Prefer server-side pagination (simpler) or virtual scrolling (smoother)?
3. **Excel Import:** Should it be a separate page or modal popup?
4. **Department Options:** Should we also import department data from another file?
5. **Subgroup Options:** The documentation shows 50 subgroup options - should we import these separately?

---

## Next Steps

1. ✅ Research complete - this document
2. ⏭️ User reviews and approves plan
3. ⏭️ Install dependencies (xlsx, etc.)
4. ⏭️ Start with Phase 1: Data Import Script
5. ⏭️ Test import with actual .numbers file
6. ⏭️ Proceed to Phase 2: UI Components

