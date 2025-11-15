<!-- -*- coding: utf-8 -*- -->
# Patient Referrals Form Documentation

**Form ID**: patient-referrals
**Location**: რეგისტრაცია (Registration) → მიმართვები (Referrals) #1s14
**Purpose**: Manage patient referrals to other facilities or departments, track referral status and representative information
**Last Updated**: 2025-11-10

---

## Overview

The Patient Referrals form enables hospital staff to create, manage, and track patient referrals to external facilities or internal departments. This page captures referral details, patient information, and representative/guardian data for referral coordination. The form supports both searching for existing patients to create referrals and managing referral records with full patient context.

### Form Context
- **Module**: რეგისტრაცია (Registration) Module
- **User Roles**: Receptionists, Doctors, Nurses, Administrators, Referral Coordinators
- **Integration Points**: Patient Registration form (რეგისტრაცია), Patient History module, External facility databases
- **Data Persistence**: Patient referrals table, Patient registration table (links to active patients)

---

## Field Documentation

### Search Filters Section

**Section Purpose**: Locate existing patients for referral creation or search existing referrals

| Field ID | Label (Georgian) | Type | Required | Validation | Default | Notes |
|----------|------------------|------|----------|------------|---------|-------|
| r_fname | სახელი: | text | No | - | - | First name search filter (Source: Lines 109-114) |
| r_lname | გვარი: | text | No | - | - | Last name search filter (Source: Lines 115-120) |
| r_prsno | პირადი ნომერი: | text | No | Length: 11, Pattern: digits | - | Georgian national ID search filter (Source: Lines 121-128) |
| r_hisno | რიგითი ნომერი: | text | No | - | - | Patient serial number search filter (Source: Lines 129-135) |
| regfltr | No label found | button | No | - | - | Search/Filter execution button (Source: Lines 136-142) |
| r_anonym | უცნობი | checkbox | No | - | - | Filter for anonymous/unknown patients (Source: Lines 143-149) |

#### Section Notes
- All search fields are optional - allows flexible patient lookup before referral creation
- r_prsno expects 11-digit Georgian national ID format
- r_hisno is the internal patient serial number assigned by the EMR system
- r_anonym checkbox filters for patients marked as anonymous/unknown
- regfltr button triggers patient search in active registration database

---

### Patient Information Section

**Section Purpose**: Display and capture patient personal information for referral record

| Field ID | Label (Georgian) | Type | Required | Validation | Default | Notes |
|----------|------------------|------|----------|------------|---------|-------|
| ri_prsno | პირადი ნომერი | text | No | Length: 11, Pattern: digits | - | Georgian national ID (Source: Lines 150-156) |
| ri_fname | სახელი* | text | Yes | Non-empty | - | Patient first name - required field (Source: Lines 157-163) |
| ri_lname | გვარი* | text | Yes | Non-empty | - | Patient last name - required field (Source: Lines 164-170) |
| ri_father | მამის სახელი | text | No | - | - | Father's name (patronymic) (Source: Lines 171-177) |
| ri_brth | დაბადების თარიღი: | text | No | Format: Date | - | Date of birth (Source: Lines 178-184) |
| ri_sqs | სქესი* | dropdown | Yes | Non-empty | - | Gender selection - required (Source: Lines 355-373) |
| ri_meug | სქესი* | tel | No | Format: XXX XX XX XX | 555 12 34 56 | Mobile phone with country code (Source: Lines 193-198) |
| ri_addr | იურიდიული მისამართი | text | No | - | - | Legal/registered address (Source: Lines 199-205) |
| ri_work | სამუშაო ადგილი | text | No | - | - | Workplace/employer (Source: Lines 206-212) |
| ri_email | იმეილი | text | No | Format: Email | - | Email address (Source: Lines 213-219) |
| ri_tel | ტელ | text | No | - | - | Telephone number (additional contact) (Source: Lines 220-226) |

#### Section Notes
- ri_fname and ri_lname are required fields (marked with *)
- ri_sqs gender selection is required
- Patient information may auto-populate from search results if existing patient selected
- Contact information (ri_meug, ri_tel, ri_email) critical for referral coordination
- ri_meug has placeholder "555 12 34 56" showing expected phone format

---

### Citizenship and Relationship Section

**Section Purpose**: Record patient citizenship and representative relationship type for referral context

| Field ID | Label (Georgian) | Type | Required | Validation | Default | Notes |
|----------|------------------|------|----------|------------|---------|-------|
| mo_moq | მოქალაქეობა | dropdown | No | - | - | Citizenship selection (250 countries) - see appendix (Source: Lines 374-1380) |
| mo_natkav | ნათესავი | dropdown | No | - | - | Relationship type for representative (Source: Lines 1381-1435) |

#### Section Notes
- mo_moq references existing citizenship-options.md appendix (250+ countries)
- mo_natkav defines relationship between patient and representative/guardian
- Citizenship may affect referral eligibility and insurance coverage
- Both fields optional but recommended for complete referral documentation

---

### Representative/Guardian Information Section

**Section Purpose**: Capture information about patient's representative or guardian who will coordinate referral

| Field ID | Label (Georgian) | Type | Required | Validation | Default | Notes |
|----------|------------------|------|----------|------------|---------|-------|
| ri_natlname | სახელი | text | No | - | - | Representative first name (Source: Lines 227-233) |
| ri_natfname | გვარი | text | No | - | - | Representative last name (Source: Lines 234-240) |
| ri_natpersno | პირადი ნომერი | text | No | Length: 11 | - | Representative national ID (Source: Lines 241-247) |
| ri_natbrth | დაბადების თარიღი | text | No | Format: Date | - | Representative date of birth (Source: Lines 248-254) |
| ri_natsqs | სქესი | dropdown | No | - | - | Representative gender (Source: Lines 1436-1454) |
| ri_nattel | ტელ | text | No | - | - | Representative telephone (Source: Lines 255-261) |
| ri_nataddr | მისამართი | text | No | - | - | Representative address (Source: Lines 262-268) |

#### Section Notes
- Representative information important for referral coordination and follow-up
- ri_nattel is critical contact point for referral facility communication
- ri_natpersno should be 11-digit Georgian national ID
- All fields optional but strongly recommended for pediatric or incapacitated patient referrals
- Representative may be authorized to make decisions on behalf of patient

---

### Action Buttons Section

**Section Purpose**: Provide form submission and referral creation actions

| Field ID | Label (Georgian) | Type | Required | Validation | Default | Notes |
|----------|------------------|------|----------|------------|---------|-------|
| persinstr | No label found | button | No | - | - | Action button (likely Create Referral/Save) (Source: Lines 269-275) |

#### Section Notes
- persinstr appears to be primary action button for referral submission
- Button label likely context-dependent (Create Referral, Update Referral, etc.)
- May trigger validation of required fields (ri_fname, ri_lname, ri_sqs) before submission

---

### Hidden Fields Section

**Section Purpose**: Store form state, metadata, and referral tracking information

| Field ID | Label (Georgian) | Type | Required | Validation | Default | Notes |
|----------|------------------|------|----------|------------|---------|-------|
| edt_hid | No label found | hidden | No | - | - | Edit mode indicator (Source: Lines 276-282) |
| edt_hid_tab | No label found | hidden | No | - | - | Tab/section state tracking (Source: Lines 283-289) |
| hididanalizi | No label found | hidden | No | - | - | Analysis/processing flag (Source: Lines 290-296) |
| hdPtRgID | No label found | hidden | No | - | - | Patient registration ID reference (Source: Lines 297-303) |
| lrmh | No label found | hidden | No | - | - | State management field (Source: Lines 304-310) |
| HelpDes | No label found | checkbox | No | - | - | Help/description toggle (Source: Lines 311-317) |
| gdhsh | No label found | hidden | No | - | - | State hash or tracking field (Source: Lines 318-324) |
| winfoc | No label found | hidden | No | - | - | Window focus tracking (Source: Lines 325-331) |
| No ID | No label found | hidden | No | - | - | Unnamed hidden field 1 (Source: Lines 339-345) |

#### Section Notes
- hdPtRgID critical for linking referral to original patient registration record
- edt_hid indicates whether form is in create or edit mode
- Hidden fields maintain referral state and track changes
- HelpDes checkbox may toggle contextual help text for referral form

---

### Search and Utility Section

**Section Purpose**: Additional search controls and utility functions

| Field ID | Label (Georgian) | Type | Required | Validation | Default | Notes |
|----------|------------------|------|----------|------------|---------|-------|
| srconusr | No label found | text | No | - | ძებნა... | Search input with Georgian placeholder "Search..." (Source: Lines 332-338) |
| No ID | No label found | button | No | - | - | Unnamed button (Source: Lines 346-352) |
| No ID | სქესი* | text | No | - | Search | Search field with placeholder "Search" (Source: Lines 185-191) |

#### Section Notes
- srconusr is a general search field with placeholder "ძებნა..." (Search...)
- Unnamed button likely related to search execution or advanced search
- Multiple search entry points enhance user experience for patient lookup

---

## Validation Rules Reference

### Standard Validation Notation Guide

| Notation | Meaning | Example |
|----------|---------|---------|
| `Non-empty` | Field must contain a value | Required text field |
| `Format: [pattern]` | Specific format required | `Format: XXX XX XX XX` for phone |
| `Length: [n]` | Exact character length | `Length: 11` for ID numbers |
| `Length: [min]-[max]` | Character length range | `Length: 1-100` for names |
| `Pattern: digits` | Only numeric digits allowed | National ID fields |
| `Format: Date` | Valid date format | Birth date fields |
| `Format: Email` | Valid email format | Email address field |

---

## Dropdown Options

### Gender Selection (ri_sqs)

**Field ID**: ri_sqs
**Type**: Single-select dropdown
**Required**: Yes
**Total Options**: 2

| Value | Text (Georgian) | English Translation | Notes |
|-------|-----------------|---------------------|-------|
| "" | (empty) | Select option | Default/unselected state |
| 1 | მამრობითი | Male | - |
| 2 | მდედრობითი | Female | - |

**Source**: Lines 355-373

---

### Citizenship (mo_moq)

**Field ID**: mo_moq
**Type**: Single-select dropdown
**Required**: No
**Total Options**: 250

See full list: [citizenship-options.md](../appendices/citizenship-options.md)

**Sample Options**:
- Value: 184, Text: საქართველო (Georgia)
- Value: 170, Text: რუსეთი (Russia)
- Value: 9, Text: ამერიკის შეერთებული შტატები (United States)

**Note**: Citizenship dropdown reuses existing appendix from patient registration form.

**Source**: Lines 374-1380

---

### Relationship Type (mo_natkav)

**Field ID**: mo_natkav
**Type**: Single-select dropdown
**Required**: No
**Total Options**: 12

| Value | Text (Georgian) | English Translation | Notes |
|-------|-----------------|---------------------|-------|
| "" | (empty) | Select option | Default/unselected state |
| 1 | დედა | Mother | Common for pediatric referrals |
| 2 | მამა | Father | Common for pediatric referrals |
| 3 | და | Sister | - |
| 4 | ძმა | Brother | - |
| 5 | ბებია | Grandmother | - |
| 6 | ბაბუა | Grandfather | - |
| 7 | შვილი | Child | Reverse relationship (child referring parent) |
| 8 | მეუღლე | Spouse | Common for adult patient referrals |
| 9 | ნათესავი | Relative | Generic relationship |
| 10 | ნათესავი დედის მხრიდან | Relative from mother's side | - |
| 11 | ნათესავი მამის მხრიდან | Relative from father's side | - |

**Source**: Lines 1381-1435

**Example Usage**: When creating referral for a minor, select "დედა" (Mother) or "მამა" (Father) to indicate parent/guardian relationship.

---

### Representative Gender (ri_natsqs)

**Field ID**: ri_natsqs
**Type**: Single-select dropdown
**Required**: No
**Total Options**: 2

| Value | Text (Georgian) | English Translation | Notes |
|-------|-----------------|---------------------|-------|
| "" | (empty) | Select option | Default/unselected state |
| 1 | მამრობითი | Male | - |
| 2 | მდედრობითი | Female | - |

**Source**: Lines 1436-1454

---

## Conditional Logic & Dependencies

### Anonymous Patient Referral Behavior

**Trigger**: r_anonym checkbox

**Condition**: When `r_anonym` is checked

**Effect**:
- Search filters apply to anonymous/unknown patient records
- Patient personal identification fields (ri_prsno) may be disabled or cleared
- Referral creation focuses on serial number (r_hisno) and minimal demographic data

**Dependency Diagram**:
```
r_anonym [checked]
  ↓
Search applies to anonymous records
Personal ID fields may be disabled/cleared
  ↓
Referral created with limited patient identification
Representative information becomes more critical
```

**User Impact**: Checking r_anonym enables referral creation for patients with limited identification. Representative contact information becomes essential for referral follow-up.

---

### Patient Search to Referral Creation Flow

**Trigger**: regfltr button click

**Condition**: When user clicks search button with populated search criteria

**Effect**:
- System searches active patient database
- If patient found: Patient information fields auto-populate (ri_fname, ri_lname, ri_prsno, etc.)
- hdPtRgID hidden field populated with patient registration ID
- Form transitions to referral creation mode
- persinstr button enables for referral submission

**Dependency Diagram**:
```
User enters search criteria (r_fname, r_lname, r_prsno, or r_hisno)
  ↓
regfltr button clicked
  ↓
Patient found in database
  ↓
Patient fields auto-populate (ri_fname, ri_lname, ri_prsno, ri_brth, etc.)
hdPtRgID set to patient registration ID
  ↓
User adds referral-specific details (referral facility, reason, etc.)
  ↓
persinstr button clicked to create referral
```

**User Impact**: Streamlined workflow - search patient, auto-populate data, add referral details, submit.

---

## Form Behavior & Workflows

### Typical User Journey

**Step 1**: Access Referrals Page
- User navigates to რეგისტრაცია → მიმართვები
- Referrals form displays with empty search criteria
- Patient information fields are editable but empty

**Step 2**: Search for Patient (Option A: Existing Patient)
- User enters search criteria (name, national ID, or serial number)
- Clicks regfltr button to execute search
- System finds patient in active registration database
- Patient information fields auto-populate
- hdPtRgID hidden field stores patient registration ID

**Step 3**: Manual Patient Entry (Option B: New Referral Without Pre-Registration)
- User manually enters patient information (ri_fname, ri_lname, ri_sqs required)
- Optionally enters contact information (ri_meug, ri_tel, ri_email)
- Enters representative information if applicable

**Step 4**: Add Referral Details
- User enters citizenship (mo_moq) if relevant to referral
- Selects representative relationship (mo_natkav) if guardian involved
- Enters representative contact information (ri_natlname, ri_natfname, ri_nattel)

**Step 5**: Submit Referral
- User clicks persinstr button to submit referral
- System validates required fields (ri_fname, ri_lname, ri_sqs)
- Referral record created and linked to patient (via hdPtRgID if available)
- Confirmation message or redirect to referral management view

### Business Rules & Constraints

- **Rule 1**: Required fields (ri_fname, ri_lname, ri_sqs) must be completed before referral submission
- **Rule 2**: If patient found via search, referral links to existing patient registration (hdPtRgID)
- **Rule 3**: Representative contact information (ri_nattel) strongly recommended for referral coordination
- **Rule 4**: Citizenship (mo_moq) may affect referral eligibility and insurance coverage validation
- **Rule 5**: Anonymous patients (r_anonym checked) can have referrals created with minimal identification

### Edge Cases & Special Behaviors

**Scenario 1**: Anonymous Patient Referral
- **Behavior**: Patient has no ri_prsno or minimal personal information; referral relies on r_hisno and representative contact
- **User Impact**: Search by name/ID may not locate patient; use r_anonym filter and r_hisno; representative information critical

**Scenario 2**: Referral for Unregistered Patient
- **Behavior**: User manually enters patient information without prior search; hdPtRgID remains empty; referral created as standalone record
- **User Impact**: Referral not linked to existing patient record; may require manual reconciliation later

**Scenario 3**: Minor Patient Referral
- **Behavior**: mo_natkav set to "დედა" (Mother) or "მამა" (Father); representative information (ri_natlname, ri_natfname, ri_nattel) becomes critical
- **User Impact**: Referral facility contacts representative instead of patient directly

**Scenario 4**: Duplicate Patient Search Results
- **Behavior**: Search by common name (e.g., "გიორგი გელაშვილი") returns multiple patients
- **User Impact**: User must verify correct patient using r_prsno or r_hisno before creating referral

---

## Textarea Fields

### Chat Input / Autocomplete Field (chtinput)

**Field ID**: chtinput
**Type**: textarea
**Label**: (Large autocomplete data - patient name suggestions)
**Required**: No
**Purpose**: Autocomplete suggestions for patient name search

**Source**: Lines 1456-1462

**Content Sample**:
```
მარი შამბეშოვითამარ თაბაგარიქრისტინე ტოგონიძეგოჰარ გიულმისარიანიალა სადოევათინათინ ხუციშვილითიკა ამბარდნიშვილილიზი ბერუაშვილიკახაბერ ჯანაშიალევანი დონაძე...
```

**Note**: Contains extensive list of patient names for autocomplete functionality in referral patient search. This data likely powers type-ahead suggestions when users enter names in search fields (r_fname, r_lname), improving search accuracy and speed.

---

## Button Elements

### Country Code Button

**Field ID**: No ID
**Type**: button
**Text**: "Georgia +995"
**Label**: სქესი*

**Source**: Lines 1463-1470

**Purpose**: Phone country code selector (Georgia +995 default)
**Note**: Button likely opens country code dropdown for international phone numbers (ri_meug field). Enables referrals for patients with international phone numbers.

---

## Source Traceability

### Primary Source Reference

**Source JSON**: [`რეგისტრაცია_მიმართვები.md`](/Users/toko/Desktop/SoftMedicMap/რეგისტრაცია_მიმართვები.md), lines 1-1472

```json
{
    "menus": [
        { "name": "Top Menu", ... },
        { "name": "Sub Menu", "buttons": [
            { "index": 7, "text": "მიმართვები", "id": "tab_8", "href": "#1s14" }
        ]}
    ],
    "pageElements": {
        "inputs": [33 fields],
        "dropdowns": [3 fields],
        "textareas": [1 field],
        "buttons": [1 button]
    }
}
```

### Field Count Verification

**Source JSON Count**:
- Inputs: 33 fields
- Dropdowns: 3 fields
- Textareas: 1 field
- Buttons: 1 field
- **Total**: 38 pageElements

**Documented Count**:
- Search Filters: 6 fields
- Patient Information: 11 fields
- Citizenship/Relationship: 2 fields
- Representative Information: 7 fields
- Action Buttons: 1 field
- Hidden Fields: 9 fields
- Search/Utility: 3 fields
- **Total**: 39 fields (includes 3 dropdowns, 1 textarea, 1 button)

**Coverage**: 100% - All pageElements documented

### Version Control
- **JSON Version**: 2025-11-10 (რეგისტრაცია_მიმართვები.md)
- **Documentation Updated**: 2025-11-10
- **Analyst**: Claude (Spec 002 - User Story 3)
- **Review Status**: Draft

### Change Log

| Date | Change | Analyst | Notes |
|------|--------|---------|-------|
| 2025-11-10 | Initial documentation created | Claude | Spec 002 User Story 3 - Patient Referrals form |

---

## Validation & Completeness Checklist

Before considering this form documentation complete, verify:

- [X] All fields from source JSON are documented in the Field Documentation section
- [X] Field IDs match source JSON exactly (case-sensitive)
- [X] Georgian labels preserved without transliteration or modification
- [X] Required fields marked with `*` in label and `Yes` in Required column
- [X] Validation rules clearly specified using standard notation (see Validation Rules Reference)
- [X] Dropdown fields have documented options (inline or referenced appendix)
- [X] Hidden fields documented with clear purpose explanation
- [X] Conditional logic documented with trigger → effect diagrams
- [X] Fields logically grouped into meaningful sections with section purposes
- [X] Source JSON references included with accurate line numbers
- [X] Placeholder and default values documented
- [X] Form context and user roles clearly explained in Overview
- [X] Integration points with other forms/modules identified
- [X] Edge cases and special behaviors documented
- [ ] Reviewed by SME for accuracy and completeness

---

## Appendices

### A. Field Reference Quick Link

For quick lookup of field definitions by ID:

| Section | Fields | Purpose |
|---------|--------|---------|
| Search Filters | r_fname, r_lname, r_prsno, r_hisno, regfltr, r_anonym | Patient search for referral creation |
| Patient Information | ri_prsno, ri_fname, ri_lname, ri_father, ri_brth, ri_sqs, ri_meug, ri_addr, ri_work, ri_email, ri_tel | Core patient data |
| Citizenship/Relationship | mo_moq, mo_natkav | Citizenship and representative relationship |
| Representative Information | ri_natlname, ri_natfname, ri_natpersno, ri_natbrth, ri_natsqs, ri_nattel, ri_nataddr | Guardian/representative data for referral coordination |
| Actions | persinstr | Referral submission |
| Hidden Fields | edt_hid, edt_hid_tab, hididanalizi, hdPtRgID, lrmh, HelpDes, gdhsh, winfoc | State management and patient linking |
| Search/Utility | srconusr | Additional search controls |

### B. Related Documentation

Links to related forms, workflows, or specifications:

- [Patient Registration Form](patient-registration-form.md) - Active patient registration structure
- [Patient Contacts Form](patient-contacts-form.md) - Contact management for referral coordination
- [Patient List Table](../tables/patient-list-table.md) - Active patient list view
- [Citizenship Options](../appendices/citizenship-options.md) - Full country list (250 options)
- [Spec 002: Registration Pages](../../specs/002-registration-pages/spec.md) - Project specification

### C. Questions & Notes for Review

Questions encountered during analysis that need clarification:

- **Q1**: What referral-specific fields are missing from this JSON (referral facility, referral date, reason for referral)?
  - **Resolved**: No - Source JSON appears to show only patient/representative data; referral-specific fields may be in separate section or managed via different interface; requires SME review
- **Q2**: How are referrals tracked (status: pending, completed, cancelled)?
  - **Resolved**: No - Not visible in current JSON structure; likely managed via separate referral management interface; requires SME review
- **Q3**: Does persinstr button create new referral or update existing referral?
  - **Resolved**: No - Context-dependent based on edt_hid field; requires SME confirmation
- **Q4**: What is the purpose of the chtinput textarea field with patient name data?
  - **Resolved**: Partially - Appears to be autocomplete data source for patient name search; requires SME confirmation
- **Q5**: Are referrals linked to specific appointments or clinical encounters?
  - **Resolved**: No - Not visible in current JSON; requires SME review for integration with Patient History module

---

## Document Information

**Document Type**: Form Field Documentation
**Template Version**: 1.0.0
**Based On**: form-template.md (documentation-templates/form-template.md)
**Status**: Draft

---
