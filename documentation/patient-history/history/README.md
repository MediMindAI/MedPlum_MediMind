# History Section (ისტორია)

## Overview

The History section is the primary clinical workspace within the Patient History module. It provides comprehensive functionality for managing patient visits, medical records, billing, and departmental operations.

**Parent Module**: Patient History (პაციენტის ისტორია) - [../README.md](../README.md)
**Section Status**: Partial documentation (main page ~75% complete)
**Last Updated**: 2025-11-10
**Georgian Name**: ისტორია
**EMR Anchor**: #2s21

---

## Section Structure

This section (ისტორია - #2s21) is one of 13 sub-sections under the Patient History module. It contains the primary clinical workspace documentation:

```
patient-history/history/
├── README.md                          # This file - History section overview
├── menu-structure.md                  # Complete parent module navigation (13 sub-sections)
├── forms/                             # Form documentation
│   ├── detail-forms-investigation.md  # Investigation report for edit forms (⚠️ PARTIAL)
│   ├── visit-edit-window.md           # Visit edit modal documentation (⚠️ PARTIAL - 40%)
│   ├── patient-discharge-form.md      # Patient discharge form (✅ COMPLETED)
│   ├── payment-form.md                # Payment processing form (✅ COMPLETED)
│   ├── invoice-insurance-references-form.md  # Invoice insurance refs (✅ COMPLETED)
│   ├── gadatsera-departmental-transfer-form.md  # Dept transfer (✅ COMPLETED)
│   └── print-receipt-window.md        # Receipt printing (✅ COMPLETED)
├── tables/                            # Table structure documentation
│   └── patient-history-main-table.md  # Main list table (✅ COMPLETED)
├── search/                            # Search and filter controls
│   └── history-filters.md             # Filter interface (✅ COMPLETED)
└── appendices/                        # Large datasets and helper scripts
    ├── field-extraction-script.js     # Manual field extraction helper script
    ├── insurance-companies.md         # Insurance company list
    ├── insurance-companies-complete.md   # Complete insurance data
    ├── insurance-types-complete.md    # Insurance types
    └── all-dropdown-options.md        # All dropdown values
```

---

## Section Purpose

The History section (ისტორია - #2s21) serves as the main clinical workspace for:

1. **Visit Management**: Register new patient visits, track active visits, process discharges
2. **Clinical Documentation**: Record medical history, diagnoses, and treatment details
3. **Financial Operations**: Handle payments, generate invoices, process insurance claims
4. **Patient Tracking**: Monitor patient status and location across hospital departments
5. **Departmental Transfers**: Manage patient transfers between departments (gadatsera)

This section provides the primary interface for clinicians to access and update patient medical records.

---

## Documentation Status

### Completed
- ✅ **menu-structure.md** - Complete navigation hierarchy and sub-menu mapping (13 items)
- ✅ **tables/patient-history-main-table.md** - Main data table (10 columns, color coding, actions)
- ✅ **search/history-filters.md** - Filter controls (12 filters, 58 insurance options)

### Partial Documentation
- ⚠️ **forms/visit-edit-window.md** - Visit edit modal (40% complete - 28+ fields documented, field IDs missing)
- ⚠️ **forms/detail-forms-investigation.md** - Edit forms investigation (requires manual documentation)
- ⚠️ **EXTRACTION-REPORT.md** - Technical challenges report with manual extraction solution

### Completed Forms
- ✅ **forms/patient-discharge-form.md** - Patient discharge workflow
- ✅ **forms/payment-form.md** - Payment processing
- ✅ **forms/invoice-insurance-references-form.md** - Insurance invoice references
- ✅ **forms/gadatsera-departmental-transfer-form.md** - Departmental transfers
- ✅ **forms/print-receipt-window.md** - Receipt printing

### Pending in History Section
1. Complete visit-edit-window.md field ID extraction (manual work required)
2. Document additional edit forms accessible from detail views
3. Map complete workflow diagrams for visit lifecycle

---

## Navigation

**Access Path**: Main Menu → პაციენტის ისტორია (Patient History)
**Navigation Type**: Anchor-based (#2, #2s21, #2s22, etc.)
**Parent Module Anchor**: #2

**Sub-Menu Pattern**:
- All sub-sections use anchor format: `#2s[id]`
- Examples: #2s21 (History), #2s24 (Invoices), #2s29 (Prescriptions)

---

## Key Statistics

**History Section Coverage**:
- Documentation files: 15 total
- Forms documented: 7 (5 complete, 2 partial)
- Tables documented: 1 (main patient list)
- Search/Filters: 12 controls with 58 insurance options
- Appendices: 5 files (insurance data, dropdowns, extraction script)
- Total fields documented: 100+ fields across all forms
- Completion: ~75%

---

## Integration Points

This section integrates with:
- **Parent Module**: Patient History (პაციენტის ისტორია) - See [../README.md](../README.md)
- **რეგისტრაცია (Registration)**: Patient demographic data (../../registration/)
- **ნომენკლატურა (Nomenclature)**: Medical terminology, procedures, medications
- **ადმინისტრირება (Administration)**: User permissions, system configuration
- **Other History Sub-sections**: Invoices (#2s24), Prescriptions (#2s202), Laboratory (#2s203)

---

## Usage Notes for Developers

### When Rebuilding This Module

1. **Start with menu-structure.md** - Understand the overall navigation flow
2. **Follow the priority order** - Begin with high-priority clinical sections
3. **Maintain anchor references** - Preserve the #2s[id] anchor pattern for navigation
4. **Georgian text accuracy** - All labels must match exactly (UTF-8 encoding)
5. **Form field IDs** - Use exact field names from detailed documentation for database compatibility

### Testing Considerations

- Verify all 13 sub-menu items are accessible
- Test anchor navigation between sections
- Validate role-based access permissions
- Ensure Georgian text displays correctly
- Test integration with Registration module for patient data

---

## Related Documentation

- **Parent Module**: [../README.md](../README.md) - Patient History module overview
- **Project Constitution**: `../../.specify/memory/constitution.md`
- **Documentation Templates**: `../../documentation-templates/`
- **Registration Module**: `../../registration/README.md` (completed reference module)
- **Specification**: `../../specs/003-patient-history/spec.md`

---

## Next Steps

**Immediate Actions for History Section**:
1. Complete visit-edit-window.md field ID extraction using manual script
2. Document additional edit forms from detail views
3. Create workflow diagrams for visit lifecycle (registration → discharge)
4. Map complete data flow between forms and tables

**For Other Sub-Sections**:
See parent module [README](../README.md) for documentation status of other 12 sub-sections

---

## Contact & Source Information

**Source System**: http://178.134.21.82:8008/clinic.php
**EMR Name**: SoftMedic - ჰელსიკორი
**Documentation Project**: SoftMedicMap
**Repository**: `/Users/toko/Desktop/SoftMedicMap`

---

**Section Version**: 1.0.0 (History section in hierarchical structure)
**Last Updated**: 2025-11-10
**Documented By**: EMR Documentation Specialist
**Completion**: ~75% (table, filters, 5 complete forms, 2 partial forms)

---

## Known Issues & Blockers

### Visit Edit Window Documentation (PARTIAL)

**Issue**: Playwright MCP browser automation tool returned excessive data (>25,000 tokens) for all extraction queries, preventing programmatic field ID extraction.

**Impact**:
- Field IDs (name/id attributes) not captured
- Dropdown option lists incomplete (only visible values documented)
- Fields below viewport not documented
- Database field mapping incomplete

**Workaround**: Created `appendices/field-extraction-script.js` for manual extraction via browser DevTools console.

**Action Required**: Run manual extraction script to complete field ID mapping (estimated 15-20 minutes).

**See**: `EXTRACTION-REPORT.md` for full technical details and resolution steps.
