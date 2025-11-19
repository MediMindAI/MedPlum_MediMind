# Financial Tab Dropdown Data - Extraction Summary

**Date**: 2025-11-19
**Source**: `/documentation/registered-services-modal/financial-tab-complete-structure.md`
**Target Folder**: `/packages/app/src/emr/translations/`

---

## Summary

Successfully extracted **19 dropdown datasets** from the Financial tab documentation and created **Georgian-only JSON files** with simplified `value/label` structure.

---

## Files Created (19 total)

### ✅ Complete Files (16)

| # | Filename | Options | Status |
|---|----------|---------|--------|
| 1 | `price-types.json` | 54 | ✅ Complete - Updated from multilingual to Georgian-only |
| 2 | `expense-categories.json` | 7 | ✅ Complete |
| 3 | `rounding-types.json` | 2 | ✅ Complete |
| 4 | `service-units.json` | 17 | ✅ Complete (for Financial tab, distinct from laboratory measurement-units.json) |
| 5 | `insurance-benefit-types.json` | 49 | ✅ Complete |
| 6 | `care-levels.json` | 4 | ✅ Complete |
| 7 | `calculation-types.json` | 5 | ✅ Complete |
| 8 | `payment-types.json` | 3 | ✅ Complete |
| 9 | `lab-execution-types.json` | 3 | ✅ Complete |
| 10 | `blood-components.json` | 7 | ✅ Complete |
| 11 | `lis-providers.json` | 4 | ✅ Complete (TerraLab, WebLab, LabExchange, Pipacso) |
| 12 | `payment-visibility-types.json` | 4 | ✅ Complete |
| 13 | `calculation-counting-types.json` | 3 | ✅ Complete |
| 14 | `morphology-types.json` | 4 | ✅ Complete |
| 15 | `active-passive-types.json` | 2 | ✅ Complete |
| 16 | `wait-for-answer-types.json` | 2 | ✅ Complete |

### ⚠️ Incomplete Files (3) - Need Additional Extraction

| # | Filename | Expected Options | Status |
|---|----------|------------------|--------|
| 17 | `consultation-types.json` | 121 | ⚠️ Placeholder - Contains only 1 example (ფთიზიატრია) |
| 18 | `primary-healthcare-services.json` | 39 | ⚠️ Placeholder - Needs browser automation extraction |
| 19 | `financial-service-groups.json` | 50 | ⚠️ Placeholder - Needs browser automation extraction |

---

## JSON Format

All files follow this simplified Georgian-only format:

```json
[
  { "value": "", "label": "" },
  { "value": "1", "label": "შიდა სტანდარტი" },
  { "value": "2", "label": "სსიპ ჯანმრთელობის ეროვნული სააგენტო" }
]
```

**Previous format** (multilingual):
```json
{ "value": "1", "label": { "ka": "შიდა სტანდარტი", "en": "Internal Standard", "ru": "Внутренний стандарт" } }
```

**New format** (Georgian-only):
```json
{ "value": "1", "label": "შიდა სტანდარტი" }
```

---

## Key Changes

### 1. Updated Existing File
- **price-types.json**: Converted from multilingual to Georgian-only format (54 options)

### 2. Created 18 New Files
- 15 complete dropdown files
- 3 placeholder files for incomplete data

---

## Validation Results

✅ **All 19 files have valid JSON syntax** (verified with `python3 -m json.tool`)

---

## Important Distinctions

### service-units.json vs measurement-units.json
- **service-units.json** (Financial tab): 17 options for billing/pricing units (ცალი, დღე, გრ, etc.)
- **measurement-units.json** (Laboratory): 25+ options for lab result units (IU/l, mmol/l, etc.)
- These are **different dropdowns** for different purposes

### service-groups.json vs financial-service-groups.json
- **service-groups.json** (Nomenclature): 7 main service categories (კონსულტაცია, ოპერაცია, etc.)
- **financial-service-groups.json** (Financial tab): 50 detailed service groups (needs extraction)
- These are **different dropdowns** in different parts of the system

---

## Missing Data - Action Required

### consultation-types.json (121 options)
- **Field ID**: `mdcspecs`
- **Default Value**: `"21"` (ფთიზიატრია)
- **Extraction Method**: Browser automation on http://178.134.21.82:8008/clinic.php
- **Notes**: Documentation mentions 121 medical specialties including:
  - ალერგოლოგია-იმუნოლოგია (Allergology-Immunology)
  - ანესთეზიოლოგია (Anesthesiology)
  - კარდიოლოგია (Cardiology)
  - etc.

### primary-healthcare-services.json (39 options)
- **Field ID**: `mo_phctypes`
- **Categories**:
  - Consultations (13 types)
  - Laboratory (21 types)
  - Instrumental Studies (5 types)
- **Extraction Method**: Browser automation required

### financial-service-groups.json (50 options)
- **Field ID**: `mo1_serttv`
- **Examples**:
  - ინსტრუმენტული გამოკვლევები (Instrumental Studies)
  - ლაბორატორიული გამოკვლევები (Laboratory Studies)
- **Extraction Method**: Browser automation required

---

## Next Steps

1. **Extract Missing Dropdown Data**:
   - Use Playwright MCP or browser automation
   - Navigate to http://178.134.21.82:8008/clinic.php
   - Open Registered Services modal
   - Extract options from `mdcspecs`, `mo_phctypes`, and `mo1_serttv` dropdowns

2. **Update Placeholder Files**:
   - Replace placeholder JSON with complete option lists
   - Maintain Georgian-only format

3. **Integration**:
   - Import these JSON files in Financial tab components
   - Use Mantine Select components with data from these files
   - Ensure proper value/label mapping

---

## Usage Example

```typescript
import priceTypes from '@/emr/translations/price-types.json';
import insuranceBenefitTypes from '@/emr/translations/insurance-benefit-types.json';
import calculationTypes from '@/emr/translations/calculation-types.json';

// In Mantine Select component
<Select
  label="ფასის ტიპი"
  data={priceTypes}
  searchable
/>

<Select
  label="დაზღვევის ტიპი"
  data={insuranceBenefitTypes}
  searchable
/>

<Select
  label="კალკულაციის ტიპი"
  data={calculationTypes}
/>
```

---

## Documentation Source

All data extracted from:
- **Primary**: `/documentation/registered-services-modal/financial-tab-complete-structure.md`
- **Secondary**: `/documentation/registered-services-modal/financial-tab-dropdowns.md`

---

## Completion Status

- ✅ **16/19 files complete** (84% completion)
- ⚠️ **3/19 files incomplete** (16% remaining)
- ✅ **All JSON syntax valid**
- ✅ **Georgian-only format applied**

---

**Document Created**: 2025-11-19
**Author**: Claude Code
**Task**: Financial tab dropdown data extraction
