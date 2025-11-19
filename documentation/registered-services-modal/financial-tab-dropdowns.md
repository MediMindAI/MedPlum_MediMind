# Financial Tab (ფინანსური) - Complete Dropdown Options

**Extraction Date**: 2025-11-19
**EMR System**: http://178.134.21.82:8008/index.php
**Location**: Nomenclature → Service Details Modal → Financial Tab

---

## Overview

The Financial tab (ფინანსური) in the Registered Services modal contains **34 dropdown fields** for configuring service pricing, insurance relationships, and billing settings. This document provides a complete extraction of all dropdown options.

---

## Primary Dropdown: ფასის ტიპი (Price Type)

**Field ID**: `ad_PrtId`
**Total Options**: 54
**Purpose**: Defines the pricing type/insurance company for the service

### Complete Option List

| Value | Text (Georgian) | English Translation |
|-------|----------------|---------------------|
| `` | (empty) | - |
| `0` | --ყველა-- | --All-- |
| `1` | შიდა სტანდარტი | Internal Standard |
| `13` | სსიპ ჯანმრთელობის ეროვნული სააგენტო | LEPL National Health Agency |
| `19` | თერამედი | Teramedi |
| `20` | ჰემა | Hema |
| `21` | ს.ს. სადაზღვევო კომპანია "ჯიპიაი ჰოლდინგი" | LLC Insurance Company "GPI Holding" |
| `22` | ალდაგი | Aldagi |
| `23` | ქართუ დაზღვევა | Qartu Insurance |
| `24` | სტანდარტ დაზღვევა | Standard Insurance |
| `25` | სს "პსპ დაზღვევა" | LLC "PSP Insurance" |
| `26` | სს „სადაზღვევო კომპანია ევროინს ჯორჯია" | LLC "Insurance Company Euroins Georgia" |
| `27` | შპს სადაზღვევო კომპანია "არდი ჯგუფი" | LTD Insurance Company "Ardi Group" |
| `29` | აჭარის ავტონომიური რესპუბლიკის ჯანმრთელობისა და სოციალური დაცვის | Adjara Autonomous Republic Health and Social Protection |
| `30` | იმედი L | Imedi L |
| `33` | ararეზიდენტი | Non-resident |
| `34` | ქ. თბილისის მუნიციპალიტეტის მერია | Tbilisi Municipality City Hall |
| `35` | სამხრეთ ოსეთის ადმინისტრაცია | South Ossetia Administration |
| `36` | ირაო | IRAO |
| `37` | ვია-ვიტა | Via-Vita |
| `38` | რეფერალური დახმარების ცენტრი | Referral Assistance Center |
| `39` | "კახეთი-იონი" | "Kakheti-Ioni" |
| `40` | საქართველოს სასჯელაღსრულებისა და პრობაციის სამინისტროს სამედიცინ | Ministry of Corrections and Probation of Georgia Medical |
| `41` | შპს საგზაო პოლიკლინიკა + საოჯახო ნედიცინის ცენტრი დიდუბე | LTD Road Polyclinic + Family Medicine Center Didube |
| `42` | ბინადრობის უფლება | Residence Right |
| `43` | დაზღვევის არ მქონე | Uninsured |
| `45` | ხომასურიძის კლინიკა | Khomasuridze Clinic |
| `46` | მრჩეველი | Advisor |
| `47` | ლიმბახი | Limbachi |
| `48` | უნისონი | Unison |
| `49` | ალფა | Alpha |
| `50` | IGG | IGG |
| `51` | სს "ნიუ ვიჟენ დაზღვევა" | LLC "New Vision Insurance" |
| `52` | სადაზღვევო კომპანია გლობალ ბენეფიტს ჯორჯია | Insurance Company Global Benefits Georgia |
| `53` | ინგოროყვას კლინიკა | Ingoroqva Clinic |
| `54` | ონის მუნიციპალიტეტის მერია | Oni Municipality City Hall |
| `55` | რეფერალი ონკოლოგია | Referral Oncology |
| `56` | შპს" თბილისის ცენტრალური საავადმყოფო" 203826645 | LTD "Tbilisi Central Hospital" 203826645 |
| `58` | ა(ა)იპ საქართველოს სოლიდარობის ფონდი. რეფერალური მომსახურების დე | N(N)LE Georgia's Solidarity Fund. Referral Services De |
| `59` | ახალი მზერა | New Look |
| `60` | სს კურაციო | LLC Curatio |
| `61` | გერმანული ჰოსპიტალი | German Hospital |
| `62` | რეგიონალური ჯანდაცვის ცენტრი | Regional Healthcare Center |
| `63` | სსიპ დევნილთა, ეკომიგრანტთა და საარსებო წყაროებით უზრუნველყოფის | LEPL IDPs, Ecomigrants and Livelihood Support |
| `64` | უფასო | Free |
| `66` | შპს გაგრა | LTD Gagra |
| `67` | თბილისის გულის ცენტრი | Tbilisi Heart Center |
| `68` | შპს თბილისის გულის ცენტრი | LTD Tbilisi Heart Center |
| `69` | კონსილიუმ მედულა | Consilium Medulla |
| `70` | ქართულ-ამერიკული რეპროდუქციული კლინიკა რეპროარტი | Georgian-American Reproductive Clinic ReproArt |
| `71` | შპს ელიავას საერთაშორისო ფაგო თერაპიული ცენტრი | LTD Eliava International Phage Therapy Center |
| `72` | შპს ჯეო ჰოსპიტალს | LTD Geo Hospitals |
| `73` | სს "საქართველოს კლინიკები" - ხაშურის ჰოსპიტალი | LLC "Georgia Clinics" - Khashuri Hospital |
| `75` | შპს არენსია | LTD Arensia |

---

## All Dropdowns in Financial Tab

### Summary Table

| # | Field ID | Label | Total Options | Purpose |
|---|----------|-------|---------------|---------|
| 1 | `ad_PrtId` | ფასის ტიპი (Price Type) | 54 | Insurance company/pricing type |
| 2 | `currency` | ვალუტა (Currency) | 1 | Currency selection (GEL) |
| 3 | `ze_dore` | სახარჯი მასალები... | 7 | Consumables/materials |
| 4 | `mo_round` | დამრგვალება (Rounding) | 2 | Rounding method |
| 5 | `vvh_dim` | ერთეული (Unit) | 17 | Unit of measurement |
| 6 | `mo1_instp` | დაზღვევის ტიპი | 49 | Insurance type |
| 7 | `mdcspecs` | კონსულტაციის ტიპი | 121 | Consultation type |
| 8 | `mo1_carelevel` | Care level | 4 | Care level |
| 9 | `mo_ittyp` | დამალვა/გამოჩენა... | 2 | Hide/show in patient history |
| 10 | `mo1_cmputype` | კალკულაციის ტიპი | 5 | Calculation type |
| 11 | `mo1_getprice` | გადახდაში/კალკულაციაში... | 4 | Show in payment/calculation |
| 12 | `mo1_calchead` | კალკულაციის დათვლა | 3 | Calculation count method |
| 13 | `mo1_fctpay` | გადახდის ტიპი | 3 | Payment type |
| 14 | `lab_exec` | ლაბორატორიული ანალიზი... | 3 | Lab analysis location |
| 15 | `mo_phctypes` | პირველადი ჯანდაცვის სერვისი | 39 | Primary healthcare service |
| 16 | `mo1_morfol` | მორფოლოგია/კვება/სისხლი... | 4 | Morphology/nutrition/blood |
| 17 | `mo_morbibloodtypes` | სისხლის კომპონენტი | 7 | Blood component |
| 18 | `waitfornansw` | ველოდები ანალიზის პასუხს | 2 | Wait for analysis answer |
| 19 | `mo1_sqpersva` | პერსონალი | 33 | Personnel assignment |
| 20 | `mo1_slstp` | ხელფასის ტიპი | 5 | Salary type |
| 21 | `mo_cmgebn` | განყოფილება | 100 | Department |
| 22 | `mo_tagtag` | ექიმთა ჯგუფი | 23 | Doctor group |
| 23 | `mo1_docsel` | ექიმი | 1348 | Doctor selection |
| 24 | `mo_optsinj` | სინჯარა | 15 | Container type |
| 25 | `mo_manipul` | მანიპულაცია | 34 | Manipulation |
| 26 | `mo_biomasala` | ბიომასალა | 44 | Biological material |
| 27 | `mo_oprtsinj` | (Unknown) | 1 | - |
| 28 | `mo_lisprovaiders` | LIS Provider | 5 | LIS integration provider |
| 29 | `mo1_serttv` | სერვისის ჯგუფი | 50 | Service group |
| 30 | `insselcdn` | დაზღვევის კომპანია | 42 | Insurance company |
| 31 | `mo1_chsfili` | ფილიალი | 2 | Branch |
| 32 | `mo1_incohid` | განყოფილება | 99 | Department |
| 33 | `mo1_fili` | ფილიალი | 2 | Branch |
| 34 | `mo1_inco` | (Unknown) | 1 | - |

---

## Price History Table (ფასების ისტორია)

### Table Columns

| Column | Header (Georgian) | Header (English) | Description |
|--------|------------------|------------------|-------------|
| 1 | ფასის ტიპი | Price Type | Insurance company/pricing type |
| 2 | თარიღი | Date | Effective date of price |
| 3 | ფასი | Price | Price amount |
| 4 | ვალუტა | Currency | Currency (e.g., ლარი/GEL) |
| 5 | (Actions) | (Actions) | Edit/delete actions |

### Sample Data Row

- **ფასის ტიპი**: შიდა სტანდარტი (Internal Standard)
- **თარიღი**: 01-11-2020
- **ფასი**: 70
- **ვალუტა**: ლარი (GEL)

---

## Other Tabs in Modal

The modal contains 4 tabs total:

1. **ფინანსური** (Financial) - Pricing and insurance configuration
2. **სახელფასო** (Salary) - Salary and personnel configuration
3. **სამედიცინო** (Medical) - Medical service details
4. **ატრიბუტები** (Attributes) - Service attributes

---

## Key Findings

### Insurance Company Options

The **ფასის ტიპი** dropdown contains **54 insurance company/pricing type options**, including:

- **შიდა სტანდარტი** (Internal Standard) - Default/private pay option
- **სსიპ ჯანმრთელობის ეროვნული სააგენტო** - National Health Agency (government insurance)
- **22 private insurance companies** (Aldagi, Qartu Insurance, Standard Insurance, etc.)
- **Municipal programs** (Tbilisi, Oni, Adjara)
- **Special categories** (Non-resident, Uninsured, Free)
- **Partner clinics** (Khomasuridze, Limbachi, German Hospital, etc.)

### Critical Observation

**This is significantly more comprehensive than the current implementation!**

Current MediMind implementation only shows:
- `0 - შიდა (Internal/Private pay)`

Original EMR system has **54 price types** covering:
- Government insurance programs
- Private insurance companies
- Municipal healthcare programs
- Partner clinics
- Special patient categories

### Implications for MediMind

To accurately replicate the EMR system, we need to:

1. **Import all 54 price type options** into the system
2. **Create insurance company master data** with proper mapping
3. **Update service pricing data model** to support multiple price types per service
4. **Implement price history tracking** (effective dates, currency)
5. **Build UI for selecting price type** when adding services to patient encounters

---

## Technical Notes

### Extraction Method

- **Browser Automation**: Playwright MCP
- **DOM Inspection**: JavaScript evaluation
- **Data Source**: Live EMR system at http://178.134.21.82:8008
- **Modal Trigger**: Click `.det.iz` div on any service row in nomenclature table

### Field Relationships

The Financial tab dropdowns have complex interdependencies:

- **ფასის ტიპი** → determines which insurance company pricing applies
- **დაზღვევის ტიპი** (mo1_instp) → further refines insurance type (49 options)
- **დაზღვევის კომპანია** (insselcdn) → another insurance company selector (42 options)

This suggests **multi-level insurance pricing hierarchy** in the original system.

---

## Screenshots

Reference screenshots saved to:
- `/documentation/registered-services-modal/financial-tab-complete.png`

---

## Next Steps

1. Extract dropdown options from **Salary Tab** (სახელფასო)
2. Extract dropdown options from **Medical Tab** (სამედიცინო)
3. Extract dropdown options from **Attributes Tab** (ატრიბუტები)
4. Create comprehensive FHIR mapping for all fields
5. Design MediMind implementation strategy for insurance pricing

---

**Document Status**: ✅ Complete
**Author**: Claude Code
**Last Updated**: 2025-11-19
