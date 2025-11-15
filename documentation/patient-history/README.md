# Patient History Module (პაციენტის ისტორია)

## Overview

This module documents the **Patient History** (პაციენტის ისტორია) section of the EMR system, which is the main clinical workspace for managing patient records, visits, treatments, and related medical information.

**EMR Menu Location**: Main Menu #2 - "პაციენტის ისტორია"

**Status**: 🚧 In Progress (History sub-section ~75% complete)

**Georgian Name**: პაციენტის ისტორია

**Module Anchor**: #2

## Module Structure

This module contains **13 sub-sections** accessible from the Patient History main menu:

### Documentation Status

| # | Sub-Section | Georgian Name | Anchor | Status | Location |
|---|-------------|---------------|--------|--------|----------|
| 1 | **History** | **ისტორია** | #2s21 | 🚧 75% | `history/` |
| 2 | My Patients | ჩემი პაციენტები | #2s22 | ⬜ Not Started | - |
| 3 | Surrogacy | სუროგაცია | #2s20 | ⬜ Not Started | - |
| 4 | Invoices | ინვოისები | #2s24 | ⬜ Not Started | - |
| 5 | Prescriptions | რეცეპტები | #2s202 | ⬜ Not Started | - |
| 6 | Laboratory | შესრულება | #2s203 | ⬜ Not Started | - |
| 7 | Diagnosis/Therapy | დიაგნოსტიკა/მკურნალობა | #2s25 | ⬜ Not Started | - |
| 8 | Surgeries | ოპერაციები | #2s26 | ⬜ Not Started | - |
| 9 | Pregnancies | სამშობიარო | #2s27 | ⬜ Not Started | - |
| 10 | Archive | არქივები | #2s28 | ⬜ Not Started | - |
| 11 | Nutrition | კვების კალენდარი | #2s29 | ⬜ Not Started | - |
| 12 | IVF | IVF | #2s30 | ⬜ Not Started | - |
| 13 | Unknown | MOH | #2s204 | ⬜ Not Started | - |

## Sub-Section Navigation

### 1. History (ისტორია) - 75% Complete

**Location**: `history/`

The primary clinical workspace for managing patient visits, registrations, discharges, and billing.

**Contents**:
- Main patient list table with visit history
- Visit registration and editing
- Patient discharge process
- Payment and invoice management
- Insurance references
- Departmental transfers

**See**: [history/README.md](history/README.md)

### 2-13. Other Sub-Sections (Future)

Documentation for remaining sub-sections will be added as they are mapped from the EMR system.

## Module Purpose

The Patient History module serves as the central hub for:

1. **Visit Management**: Register, track, and close patient visits
2. **Clinical Documentation**: Record medical history and treatment details
3. **Financial Operations**: Handle payments, invoices, and insurance
4. **Patient Tracking**: Monitor patient status across departments
5. **Medical Records**: Maintain comprehensive patient histories

## Integration Points

This module integrates with:

- **Registration Module** (`registration/`): Patient demographics and identity
- **Nomenclature** (future): Medical services, procedures, diagnoses
- **Administration** (future): Department management, user permissions
- **Finance** (future): Billing and accounting

## Statistics

- **Sub-Sections Documented**: 1 / 13 (7.7%)
- **Forms Documented**: 7 (in History section)
- **Tables Documented**: 1 (in History section)
- **Total Files**: 15+ documentation files

## Related Documentation

- **Project Constitution**: `.specify/memory/constitution.md`
- **Documentation Templates**: `documentation-templates/`
- **Specification**: `specs/003-patient-history/spec.md`
- **Registration Module**: `registration/` (reference implementation)

---

**Last Updated**: 2025-11-10
**Module Version**: 1.0.0 (Hierarchical Structure)
**EMR Version**: SoftMedic (Georgian Hospital System)
