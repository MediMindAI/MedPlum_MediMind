# Registration (რეგისტრაცია) Module Documentation

## Module Overview

The Registration module is the patient enrollment and record management section of the EMR system. This module handles all aspects of patient registration, including new patient data entry, relative/representative information capture, patient search and filtering, and patient record management.

## Purpose Statement

This documentation captures the exact structure, fields, logic, and workflows of the Registration section from the existing EMR system. The goal is to enable precise replication of all registration functionality, validation rules, and user interactions when rebuilding the EMR system.

## Contents / Navigation

### Module Structure
- **[Menu Structure](menu-structure.md)** ✓ - Navigation hierarchy and menu items

### Registration Forms (Workflow Order)
1. **[Patient Registration Form](forms/patient-registration-form.md)** ✓ - Main patient data entry form (რეგისტრაცია)
2. **[Receptionist Intake Form](forms/receptionist-intake-form.md)** ✓ - Patient intake processing (მიმღები)
3. **[Patient Contacts Form](forms/patient-contacts-form.md)** ✓ - Contact information management (კონტაქტები)
4. **[Inpatient Admission Form](forms/inpatient-admission-form.md)** ✓ - Hospital admission processing (სტაციონარი)
5. **[Patient Debts Form](forms/patient-debts-form.md)** ✓ - Debt tracking and management (ვალები)
6. **[Advance Payments Form](forms/advance-payments-form.md)** ✓ - Prepayment processing (ავანსები)
7. **[Patient Archive Form](forms/patient-archive-form.md)** ✓ - Archived records management (არქივი)
8. **[Patient Referrals Form](forms/patient-referrals-form.md)** ✓ - Referral coordination (მიმართვები)

### Supporting Components
- **[Relative Information Form](forms/relative-information-form.md)** ✓ - Patient relative/representative details capture
- **[Search Filters](search/patient-search-filters.md)** ✓ - Patient search and filtering controls
- **[Patient List Table](tables/patient-list-table.md)** ✓ - Patient list display structure and columns

### Reference Data
- **[Citizenship Options](appendices/citizenship-options.md)** ✓ - Complete country list (250 options)

## Source Reference

**Source Data File**: `რეგისტრაცია_რეგისტრაცია.md`

**Screenshot Reference**: Available in source documentation

## Quick Reference

| Page Name (Georgian) | Page Name (English) | File | Purpose | Fields | Status |
|---------------------|---------------------|------|---------|--------|--------|
| რეგისტრაცია | Patient Registration | patient-registration-form.md | Main patient enrollment | 19+ fields | ✅ Spec 001 |
| მიმღები | Receptionist Intake | receptionist-intake-form.md | Patient intake processing | 32 fields | ✅ Spec 002 |
| კონტაქტები | Patient Contacts | patient-contacts-form.md | Contact management | 32 fields | ✅ Spec 002 |
| სტაციონარი | Inpatient Admission | inpatient-admission-form.md | Hospital admissions | 32 fields | ✅ Spec 002 |
| ვალები | Patient Debts | patient-debts-form.md | Debt tracking | 38 fields | ✅ Spec 002 |
| ავანსები | Advance Payments | advance-payments-form.md | Prepayment processing | 38 fields | ✅ Spec 002 |
| არქივი | Patient Archive | patient-archive-form.md | Archived records | 39 fields | ✅ Spec 002 |
| მიმართვები | Patient Referrals | patient-referrals-form.md | Referral coordination | 39 fields | ✅ Spec 002 |

### Component Reference

| Component | File | Details |
|-----------|------|---------|
| Menu navigation | menu-structure.md | 15 items (6 main + 9 sub) |
| Relative/representative data | relative-information-form.md | Complete representative capture |
| Search and filters | patient-search-filters.md | 4 search filter controls |
| Patient list display | patient-list-table.md | 8 column table structure |
| Citizenship dropdown | citizenship-options.md | 250 country options |

## Documentation Status

**Status**: ✅ Complete

**Completion Details**:
- Completion Date: 2025-11-10
- Total Files: 12 documentation files (6 from Spec 001 + 7 from Spec 002 + README)
- Coverage: 100% of Registration section (8 of 9 pages documented; ვალუტა excluded as out-of-scope)
- Specifications Completed:
  - **Spec 001**: Registration menu structure, patient registration form, relative information form, patient search and list table
  - **Spec 002**: Receptionist intake, patient contacts, inpatient admission, patient debts, advance payments, patient archive, patient referrals

The Registration module has been fully documented with complete field-by-field analysis from the source EMR system. All documentation follows the principle of accuracy and completeness to ensure exact logic replication.

## Summary Statistics

| Metric | Count | Details |
|--------|-------|---------|
| Registration Forms | 8 pages | 100% coverage (excluding out-of-scope ვალუტა/Currency) |
| Total Form Fields | 269+ fields | Sum across all 8 registration forms |
| Dropdown Options | 1,848+ options | Citizenship (250×7 pages) + Gender + Marital Status + Relationship types |
| Menu Items | 15 | 6 main menu items + 9 sub-menu items |
| Table Columns | 8 | Patient list display columns |
| Search Filters | 4 | Patient search and filter controls |
| Documentation Files | 12 | Complete coverage of all components |

## See Also

- **[Spec 001: EMR Registration Map](../specs/001-emr-registration-map/spec.md)** - Original registration documentation project
- **[Spec 002: Registration Pages](../specs/002-registration-pages/spec.md)** - Extended registration pages documentation project
- **[Form Template](../documentation-templates/form-template.md)** - Template used for all form documentation
- **[SoftMedicMap Constitution](../.specify/memory/constitution.md)** - Documentation quality principles

## Next Steps

Future work to consider:

1. **Validation Phase**
   - Validate documentation against live EMR system
   - Cross-reference with actual user workflows
   - Verify all edge cases and validation rules

2. **Module Expansion**
   - Patient History (ისტორია) module documentation
   - Administration (ადმინისტრირება) module documentation
   - Other EMR modules as identified

3. **Documentation Enhancement**
   - Add workflow diagrams for complex processes
   - Document integration points between modules
   - Create cross-module integration documentation

4. **Quality Assurance**
   - Peer review of documentation accuracy
   - User acceptance testing against documentation
   - Update documentation based on feedback

---

*Last Updated: 2025-11-10*
*Spec 001: 2025-11-10 | Spec 002: 2025-11-10*
