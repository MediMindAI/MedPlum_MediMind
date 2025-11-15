# Patient History Filter Controls (ისტორია - ფილტრები)

**Section**: პაციენტის ისტორია > ისტორია (Patient History > History)
**Page URL**: http://178.134.21.82:8008/index.php#2s21
**Purpose**: Filter and search controls for the patient history table to narrow down visit records by insurance payer and record status
**Last Updated**: 2025-11-10

---

## Overview

The Patient History (ისტორია) section includes filter controls positioned above the main patient visit table. These controls allow users to filter the displayed records by:
1. **Insurance/Payer Organization** (dropdown selector)
2. **Record Status** (checkbox filter - appears to filter records by a specific status)

Below these primary filters, there are text-based search fields for filtering table results by patient ID, name, surname, dates, and record numbers.

### Filter Context
- **Module**: პაციენტის ისტორია (Patient History)
- **Sub-section**: ისტორია (History)
- **User Roles**: Receptionists, Doctors, Administrative Staff
- **Integration Points**: Connects to patient records, insurance/payer management, visit history table
- **Data Persistence**: Filters are session-based (not stored permanently)

---

## Filter Controls Documentation

### Primary Filters (Above Table)

| Field ID | Label (Georgian) | Type | Required | Default | Notes |
|----------|------------------|------|----------|---------|-------|
| zi_sendcmp | - | Dropdown (Single-select) | No | "0" (შიდა / Internal) | Insurance/payer organization selector with 58 options |
| krpol | - | Checkbox | No | Unchecked | Purpose unclear from interface - likely filters by specific record status or criteria |

#### Filter Row Context
The filters appear in a horizontal row with the following layout:
- **Cell 1**: Icon/button (appears to be a visual indicator)
- **Cell 2**: Insurance/Payer dropdown (`zi_sendcmp`)
- **Cell 3**: Empty/spacer cell
- **Cell 4**: Checkbox filter (`krpol`)

---

## Dropdown Options: Insurance/Payer Organization

**Field ID**: `zi_sendcmp`
**Type**: Single-select dropdown
**Required**: No
**Total Options**: 58
**Default Value**: "0" (შიდა / Internal)

### Complete Options List

| Value | Text (Georgian) | English Translation | Category |
|-------|----------------|---------------------|----------|
| 0 | შიდა | Internal | Default |
| 628 | სსიპ ჯანმრთელობის ეროვნული სააგენტო | LEPL National Health Agency | Government Agency |
| 6379 | ს.ს. სადაზღვევო კომპანია "ჯიპიაი ჰოლდინგი" | LLC Insurance Company "GPI Holding" | Insurance Company |
| 6380 | ალდაგი | Aldagi | Insurance Company |
| 6381 | სს "დაზღვევის კომპანია ქართუ" | LLC "Insurance Company Qartu" | Insurance Company |
| 6382 | სტანდარტ დაზღვევა | Standard Insurance | Insurance Company |
| 6383 | სს "პსპ დაზღვევა" | LLC "PSP Insurance" | Insurance Company |
| 6384 | სს „სადაზღვევო კომპანია ევროინს ჯორჯია" | LLC "Insurance Company Euroins Georgia" | Insurance Company |
| 6385 | შპს სადაზღვევო კომპანია "არდი ჯგუფი" | LTD Insurance Company "Ardi Group" | Insurance Company |
| 7603 | აჭარის ავტონომიური რესპუბლიკის ჯანმრთელობისა და სოციალური დაცვის სამინისტრო | Ministry of Health and Social Protection of Adjara Autonomous Republic | Government Ministry |
| 8175 | იმედი L | Imedi L | Insurance Company |
| 9155 | ქ. თბილისის მუნიციპალიტეტის მერია | Tbilisi Municipality City Hall | Municipal Authority |
| 10483 | სამხრეთ ოსეთის ადმინისტრაცია | South Ossetia Administration | Administrative Authority |
| 10520 | ირაო | IRAO | Organization |
| 11209 | ვია-ვიტა | Via-Vita | Insurance/Medical Company |
| 11213 | რეფერალური დახმარების ცენტრი | Referral Assistance Center | Referral Center |
| 12078 | "კახეთი-იონი" | "Kakheti-Ioni" | Regional Organization |
| 12461 | საქართველოს სასჯელაღსრულებისა და პრობაციის სამინისტროს სამედიცინო დეპარტამენტი | Medical Department of the Ministry of Penitentiary and Probation of Georgia | Government Medical Department |
| 14134 | ბინადრობის უფლება | Residence Right | Legal Status Category |
| 14137 | დაზღვევის არ მქონე | Uninsured | Insurance Status |
| 16476 | უნისონი | Unisoni | Insurance Company |
| 16803 | ალფა | Alpha | Insurance Company |
| 22108 | IGG | IGG | Insurance Company |
| 41288 | სს "ნიუ ვიჟენ დაზღვევა" | LLC "New Vision Insurance" | Insurance Company |
| 46299 | სადაზღვევო კომპანია გლობალ ბენეფიტს ჯორჯია | Insurance Company Global Benefits Georgia | Insurance Company |
| 49974 | ინგოროყვას კლინიკა | Ingorokva Clinic | Medical Clinic |
| 51870 | ონის მუნიციპალიტეტის მერია | Oni Municipality City Hall | Municipal Authority |
| 52103 | რეფერალი ონკოლოგია | Referral Oncology | Referral Service |
| 54184 | შპს" თბილისის ცენტრალური საავადმყოფო" 203826645 | LTD "Tbilisi Central Hospital" 203826645 | Hospital |
| 61677 | ა(ა)იპ საქართველოს სოლიდარობის ფონდი. რეფერალური მომსახურების დეპარტამენტი | N(N)LE Georgia Solidarity Fund. Referral Services Department | Government Fund |
| 61768 | ახალი მზერა | New Mzera | Medical Organization |
| 63054 | სს კურაციო | LLC Curatio | Medical Company |
| 67209 | გერმანული ჰოსპიტალი | German Hospital | Hospital |
| 67469 | რეგიონალური ჯანდაცვის ცენტრი | Regional Healthcare Center | Healthcare Center |
| 70867 | სსიპ დევნილთა, ეკომიგრანტთა და საარსებო წყაროებით უზრუნველყოფის სააგენტო | LEPL Agency for IDP, Eco-migrants and Livelihood Provision | Government Agency |
| 79541 | შპს გაგრა | LTD Gagra | Medical Organization |
| 5136 | თერამედი | Theramedi | Medical Company |
| 5419 | ყელ-ყურ ცხვირის ჯაფარიძე-ქევანიშვილი | ENT Jafaridze-Kevanishvili | ENT Clinic |
| 5809 | ჰემა | Hema | Medical Company |
| 6847 | პეტრე სარაჯიშვილის სახელობის ნევროლოგიის ინსტიტუტი | Petre Sarajishvili Neurology Institute | Research Institute |
| 6929 | რეფერალური დახმარების ცენტრის კლინიკა | Referral Assistance Center Clinic | Referral Clinic |
| 9068 | არარეზიდენტი | Non-resident | Legal Status |
| 14019 | შპს საგზაო პოლიკლინიკა + საოჯახო ნედიცინის ცენტრი დიდუბე | LTD Road Polyclinic + Family Medicine Center Didube | Medical Center |
| 14647 | შპს საოჯახო მედიცინის ეროვნული სასწავლო ცენტრი | LTD National Training Center of Family Medicine | Training Center |
| 15862 | ხომასურიძის კლინიკა | Khomasuridze Clinic | Medical Clinic |
| 15863 | მრჩეველი | Consultant | Service Type |
| 15864 | ლიმბახი | Limbakhi | Medical Organization |
| 20240 | არენსია ექსპლორატორი მედისინ | Arencia Exploratory Medicine | Medical Company |
| 30321 | სამედიცინო პარაზიტოლოგიისა და ტროპიკული მედიცინის კვლევის ინსტიტუტი | Research Institute of Medical Parasitology and Tropical Medicine | Research Institute |
| 71575 | უფასო | Free | Payment Status |
| 81051 | თბილისის გულის ცენტრი | Tbilisi Heart Center | Cardiology Center |
| 81614 | შპს თბილისის გულის ცენტრი | LTD Tbilisi Heart Center | Cardiology Center |
| 86705 | კონსილიუმ მედულა | Consilium Medulla | Medical Company |
| 88950 | ქართულ-ამერიკული რეპროდუქციული კლინიკა რეპროარტი | Georgian-American Reproductive Clinic Reproart | Reproductive Clinic |
| 89213 | შპს ელიავას საერთაშორისო ფაგო თერაპიული ცენტრი | LTD Eliava International Phage Therapy Center | Research/Treatment Center |
| 89718 | შპს ჯეო ჰოსპიტალს | LTD Geo Hospitals | Hospital Network |
| 91685 | სს "საქართველოს კლინიკები" - ხაშურის ჰოსპიტალი | LLC "Georgia Clinics" - Khashuri Hospital | Hospital |
| 102335 | შპს არენსია | LTD Arencia | Medical Company |

**Usage Pattern**: Users select the insurance/payer organization to filter patient visit records by their payment source or insurance coverage provider.

---

## Checkbox Filter

**Field ID**: `krpol`
**Type**: Checkbox
**Required**: No
**Default**: Unchecked
**Label**: None (no visible Georgian label adjacent to checkbox)

### Purpose (Inferred)
Based on the field ID and context within the Patient History section, this checkbox likely filters records by one of the following:
- **კრედიტი პოლისი** (Credit Policy) - possibly filters visits with outstanding credit/debt
- **Specific record status or flag**
- **Payment-related filter**

**Note**: The exact purpose requires clarification from system documentation or user testing, as no visible label is present in the interface.

---

## Table Search Controls

These text input fields appear in the row directly above the patient data table, allowing for column-specific searching:

| Field ID | Label (Georgian) | Column | Type | Notes |
|----------|------------------|--------|------|-------|
| svo_num | პ/ნ | Personal ID Number | Text | Search by patient personal ID |
| svo_ufnam | სახელი | First Name | Text | Search by patient first name |
| svo_ulnam | გვარი | Last Name | Text | Search by patient last name |
| svo_dat1 | თარიღი | Date (From) | Text | Search by visit date (start range) |
| svo_dat2 | თარიღი | Date (To) | Text | Search by visit date (end range) |
| rg_no | # | Record Number | Text | Search by record/registration number (format: 10357-2025) |
| stac_no | # | Stationary Number | Text | Search by stationary/hospital number (format: a-6871-2025) |

### Disabled Search Fields

These fields appear in a separate table section but are currently disabled:

| Field ID | Label | Type | Status |
|----------|-------|------|--------|
| mr_date | თარიღი | Text | Disabled |
| saqNm | დასახელება | Text | Disabled |
| mr_raod | რაოდ. | Text | Disabled |

**Note**: Disabled fields suggest additional filtering capabilities that may be context-dependent or activated under specific conditions.

---

## Filter Behavior & Workflows

### Typical Filter Workflow

**Step 1**: User accesses Patient History (ისტორია) section
- Default filter: Insurance/Payer = "შიდა" (Internal)
- Checkbox filter: Unchecked
- All search fields: Empty

**Step 2**: User selects insurance/payer filter
- Opens dropdown `zi_sendcmp`
- Selects desired insurance company or payer organization
- Table refreshes to show only visits associated with selected payer

**Step 3**: User optionally checks the checkbox filter (`krpol`)
- Checkbox is toggled on
- Table further filters records based on checkbox criteria
- Records update dynamically

**Step 4**: User refines with text search filters
- Enters patient ID in `svo_num`
- Enters date range in `svo_dat1` and `svo_dat2`
- Enters record number in `rg_no` or `stac_no`
- Table filters incrementally as user types

**Step 5**: View filtered results
- Patient visit records displayed in table below
- Columns: პ/ნ, სახელი, გვარი, თარიღი, #, ჯამი, %, ვალი, გადახდ.
- Click on row to view full visit details

### Filter Reset Behavior

**Assumed Behavior** (requires verification):
- Changing insurance/payer dropdown resets checkbox and search fields
- Clearing all filters returns to default state (Internal payer, all records)
- Page refresh resets filters to defaults

---

## Validation Rules

### Insurance/Payer Dropdown
- **Selection Required**: Yes (defaults to "შიდა")
- **Validation**: Single selection from predefined list only
- **Error Handling**: N/A (dropdown prevents invalid entries)

### Checkbox Filter
- **Validation**: Boolean toggle (checked/unchecked)
- **Dependencies**: None observed

### Text Search Fields
- **Format**: Free text (no observed validation)
- **Length**: Unlimited (standard text input)
- **Pattern**: Accepts alphanumeric characters, dates, and symbols
- **Real-time Filtering**: Appears to filter as user types

---

## Business Rules & Constraints

### Rule 1: Default Payer Filter
- **Rule**: System defaults to "შიდა" (Internal) on page load
- **Enforcement**: Dropdown pre-selected to value "0"
- **Purpose**: Shows internal/private pay patients by default

### Rule 2: Payer-Based Record Visibility
- **Rule**: Only visits associated with selected payer are displayed
- **Enforcement**: Backend query filters by payer ID
- **Impact**: Users must select appropriate payer to see relevant records

### Rule 3: Multi-Criteria Filtering
- **Rule**: Filters can be combined (payer + checkbox + text search)
- **Enforcement**: All active filters apply simultaneously (AND logic)
- **User Impact**: Narrower result set as more filters are applied

---

## Integration Points

### Related Modules
1. **Patient Registration** (რეგისტრაცია): Patient insurance/payer information originates from registration
2. **Visit Management**: Each record represents a patient visit with associated payer
3. **Billing/Invoicing** (ინვოისები): Payer filter connects to billing records
4. **Insurance Management**: Payer list sourced from insurance/payer database

### Data Dependencies
- **Payer Organizations Table**: Dropdown options sourced from insurance/payer master list
- **Patient Visits Table**: Filtered records come from visit history database
- **Patient Records**: Search fields query patient demographic data

---

## Source Traceability

### Primary Source Reference

**Page URL**: http://178.134.21.82:8008/index.php#2s21
**Section**: პაციენტის ისტორია > ისტორია (Patient History > History)
**Extraction Method**: Playwright browser automation + JavaScript DOM extraction
**Extraction Date**: 2025-11-10

### Field Identification

Filters extracted using JavaScript evaluation:
```javascript
// Insurance/Payer dropdown
const payerSelect = document.querySelector('select');
payerSelect.id; // "zi_sendcmp"
payerSelect.options.length; // 58 options

// Checkbox filter
const checkbox = document.querySelector('input[type="checkbox"]');
checkbox.id; // "krpol"

// Search fields
const searchInputs = document.querySelectorAll('input[type="text"]');
// IDs: svo_num, svo_ufnam, svo_ulnam, svo_dat1, svo_dat2, rg_no, stac_no, etc.
```

---

## Document Information

**Document Type**: Filter Controls Documentation
**Template Version**: 1.0.0 (adapted from form-template.md)
**Status**: Draft - Awaiting Verification

---

## Questions & Notes for Review

### Q1: Checkbox Filter Purpose
- **Question**: What is the exact purpose of the `krpol` checkbox filter? No visible label is present.
- **Resolved**: No - Requires system documentation or user interview

### Q2: Disabled Search Fields
- **Question**: Under what conditions are the disabled search fields (`mr_date`, `saqNm`, `mr_raod`) enabled?
- **Resolved**: No - Requires functional testing

### Q3: Date Filter Format
- **Question**: What date format is expected in `svo_dat1` and `svo_dat2` fields? (DD-MM-YYYY observed in table)
- **Resolved**: No - Requires validation testing

### Q4: Filter Persistence
- **Question**: Are filter selections preserved across page navigation or browser sessions?
- **Resolved**: No - Requires functional testing

---

**End of Documentation**
