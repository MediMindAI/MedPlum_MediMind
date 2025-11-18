# Medical Services Nomenclature Documentation

This folder contains all documentation related to the Medical Services Nomenclature system in the MediMind EMR.

## 📊 Project Status

**Status**: ✅ **PRODUCTION READY**
**Imported**: 2,217 medical services (99.8% success rate)
**Date**: 2025-11-18
**FHIR Resource**: ActivityDefinition

---

## 📁 Documentation Files

### Quick Start & Usage

- **[IMPORT-READY.md](./IMPORT-READY.md)**
  Quick start guide for the 2,217 services import that was completed.
  *Use this as a reference for what was accomplished.*

- **[GET-TOKEN-INSTRUCTIONS.md](./GET-TOKEN-INSTRUCTIONS.md)**
  Step-by-step guide to extract your Medplum access token from the browser.
  *Needed for running import scripts.*

### Import Documentation

- **[README-IMPORT.md](./README-IMPORT.md)**
  Technical documentation for the medical services import process.
  *Details about file structure, FHIR mapping, and troubleshooting.*

- **[TableImportGuide.md](./TableImportGuide.md)** ⭐
  **Comprehensive guide for importing ANY medical data list** (not just services).
  *Use this for future imports: diagnosis codes, insurance companies, lab tests, etc.*

### System Documentation

- **[nomenclature-medical-1-page.md](./nomenclature-medical-1-page.md)**
  Original specification document for the nomenclature page implementation.

---

## 🚀 Quick Links

### View Imported Services
```
http://localhost:3000/emr/nomenclature/medical-1
```

### Import Scripts Location
```
scripts/import-with-token.ts          # Main import script (used)
scripts/import-nomenclature.ts        # OAuth version
scripts/convert-numbers-to-xlsx.ts    # File converter
```

### Source Data
```
documentation/xsl/სამედიცინო სერვისების ცხრილი.xlsx
```

### Error Logs
```
logs/nomenclature-import-errors.json
```

---

## 📖 Main Project Documentation

Complete nomenclature documentation is also available in:
```
CLAUDE.md (lines 1196-1465)
```

This includes:
- FHIR resource mappings
- Code examples
- Common patterns
- Performance considerations
- Testing instructions

---

## 🎯 For Future Imports

When you need to import other medical data lists:

1. **Read**: [TableImportGuide.md](./TableImportGuide.md)
2. **Extract token**: [GET-TOKEN-INSTRUCTIONS.md](./GET-TOKEN-INSTRUCTIONS.md)
3. **Follow the 6-step process** outlined in the guide
4. **Test with small dataset** before full import

### Supported Import Types

The guide covers importing:
- ✅ Medical services (ActivityDefinition) - **Already imported**
- 📋 Diagnosis codes (CodeSystem + ValueSet) - ICD-10, ICD-9
- 💊 Medications (Medication) - Drug formulary
- 🧪 Lab tests (ObservationDefinition) - Lab catalog
- 🏥 Hospitals/Facilities (Organization + Location)
- 🛡️ Insurance companies (Organization) - Payer list
- 🏢 Departments (Organization) - Hospital units
- 👨‍⚕️ Practitioners (Practitioner) - Staff directory
- 🧑‍🤝‍🧑 Patients (Patient) - Patient registry
- 🔧 Medical equipment (Device) - Equipment inventory

---

## 📊 Import Statistics

### Medical Services Import (Completed)

| Metric | Value |
|--------|-------|
| Total rows | 2,222 |
| ✅ Successfully imported | 2,217 (99.8%) |
| ⚠️ Skipped | 5 (0.2%) |
| ❌ Failed | 0 |
| ⏱️ Duration | ~6 minutes |
| 🔄 Rate limit pauses | 4 times (60 sec each) |

### Skipped Rows (Missing Code Field)
- Row 537
- Row 551
- Row 2129
- Row 2134
- Row 2143

---

## 🛠️ Technical Details

### FHIR Resource Type
**ActivityDefinition** - Represents computable healthcare activities

### Extension URLs Used
```typescript
http://medimind.ge/extensions/service-type
http://medimind.ge/extensions/service-subgroup
http://medimind.ge/extensions/service-category
http://medimind.ge/extensions/base-price
http://medimind.ge/extensions/total-amount
http://medimind.ge/extensions/cal-hed
http://medimind.ge/extensions/printable
http://medimind.ge/extensions/item-get-price
http://medimind.ge/extensions/assigned-departments
http://medimind.ge/extensions/lis-integration
http://medimind.ge/extensions/lis-provider
http://medimind.ge/extensions/external-order-code
http://medimind.ge/extensions/gis-code
```

### Identifier System
```
http://medimind.ge/nomenclature/service-code
```

---

## 🔍 Verification

To verify the import was successful:

```bash
# Check total count
curl -H "Authorization: Bearer $MEDPLUM_TOKEN" \
  "http://localhost:8103/fhir/R4/ActivityDefinition?_summary=count"

# View sample services
curl -H "Authorization: Bearer $MEDPLUM_TOKEN" \
  "http://localhost:8103/fhir/R4/ActivityDefinition?_count=5"

# Search by code
curl -H "Authorization: Bearer $MEDPLUM_TOKEN" \
  "http://localhost:8103/fhir/R4/ActivityDefinition?identifier=JXDD3A"
```

---

## 📞 Support

For questions about:
- **Import process**: See [TableImportGuide.md](./TableImportGuide.md)
- **Token issues**: See [GET-TOKEN-INSTRUCTIONS.md](./GET-TOKEN-INSTRUCTIONS.md)
- **FHIR mapping**: See [README-IMPORT.md](./README-IMPORT.md) or CLAUDE.md
- **System architecture**: See CLAUDE.md (lines 1196-1465)

---

## 🎉 Next Steps

The medical services catalog is now complete. Optional enhancements:

- [ ] ServiceFilters component (search/filter UI)
- [ ] Virtual scrolling (smooth scrolling for 2,217+ services)
- [ ] Excel export functionality
- [ ] Import additional medical data (see TableImportGuide.md)

---

**Last Updated**: 2025-11-18
**Import Status**: ✅ Complete (2,217 services)
**Documentation Status**: ✅ Complete
