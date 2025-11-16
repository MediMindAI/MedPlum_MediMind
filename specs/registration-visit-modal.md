# Registration Visit Modal - Technical Specification

**Last Updated:** 2025-11-16
**Source:** Extracted from live EMR system at http://178.134.21.82:8008/clinic.php
**Modal Container ID:** `#shnek`

## Overview

The Registration Visit Modal is a wide modal dialog that opens when clicking on a patient entry from the Registration page (რეგისტრაცია tab). It is specifically designed for creating and editing patient visit registrations.

**Key Characteristics:**
- Modal Size: Extra large (almost full-screen width)
- Opens from: Registration page patient table row click
- Purpose: Create/edit patient visit registration with insurance and demographics
- Layout: 4 collapsible sections in vertical arrangement
- Primary Action: Save visit registration (შენახვა)
- **All Field IDs use `mo_` prefix** (e.g., `mo_regdate`, `mo_comp`)

## Modal Header

### Patient Information Display

```
┌─────────────────────────────────────────────────────────────────┐
│ ლევან ჭილაია                    [ვიზიტები: 1/0 (ამბუ/სტაც)]     │
└─────────────────────────────────────────────────────────────────┘
```

**Components:**
- Patient Name: Bold text, `fw={700}`, `size="lg"`
- Visit Badge: Cyan badge (`color="cyan"`)
  - Format: `ვიზიტები: {ambulatory}/{inpatient} (ამბუ/სტაც)`

**FHIR Mapping:**
- Patient Name: `Patient.name[0].given` + `Patient.name[0].family`
- Ambulatory Visits: Count of Encounters with `class.code = "AMB"`
- Inpatient Visits: Count of Encounters with `class.code = "IMP"`

---

## Section 1: რეგისტრაცია (Registration)

**Section Styling:**
- Background: Light gray (`#f8f9fa`)
- Section number: Blue text (`c="blue"`)
- Header text: `1 რეგისტრაცია`
- Collapsible: Yes

### Field Specifications

| Field ID | Label (ქართული) | Label (English) | Type | Required | Widget | Default | FHIR Mapping |
|----------|------------------|-----------------|------|----------|--------|---------|--------------|
| `mo_regdate` | თარიღი | Date/Time | `datetime` | Yes (*) | DateTimePicker (hasDatepicker) | Current datetime (2025-11-16 14:10) | `Encounter.period.start` |
| `mo_regtype` | შემოსვლის ტიპი | Admission Type | `select` | Yes (*) | Select | Empty | `Encounter.class.code` |
| `mo_stat` | სტატუსი | Status | `select` | No | Select | `1` (empty) | `Encounter.extension[status-code]` |
| `mo_incomgrp` | განყოფილება | Department | `select` | Yes (*) | Select (searchable) | Empty | `Encounter.serviceType.coding[0].code` |
| `mo_incmtp` | მომართვის ტიპი | Referral Type | `select` | No | Select | Empty | `Encounter.extension[referral-type]` |
| `mo_ddyastac` | სტაციონარის ტიპი | Hospital Type | `select` | No | Select | Empty | `Encounter.extension[hospital-type]` |
| `mo_myp` | მომყვანი | Referrer/Ambulance | `select` | No | Select | Empty | `Encounter.extension[ambulance-service]` |
| `mo_patsender` | გამომგზავნი | Sending Institution | `select` | No | Select | Empty | `Encounter.extension[sending-institution]` |
| `mo_patsendrdatetime` | გამომგზავნ დაწესებულებაში მიმართვის თარიღი/დრო | Referral Date/Time to Sending Institution | `datetime` | No | DateTimePicker | Empty | `Encounter.extension[sending-referral-datetime]` |

### Dropdown Options

#### შემოსვლის ტიპი (Admission Type) - mo_regtype - REQUIRED
| Value | Georgian (ka) | English (en) | FHIR Code |
|-------|---------------|--------------|-----------|
| `3` | ამბულატორიული | Ambulatory | `AMB` |
| `1` | გეგმიური სტაციონარული | Planned Inpatient | `IMP` |
| `2` | გადაუდებელი სტაციონარული | Emergency Inpatient | `EMER` |

**NOTE:** Value `3` = Ambulatory (not `1`)

#### სტატუსი (Status) - mo_stat
| Value | Georgian (ka) | English (en) |
|-------|---------------|--------------|
| `1` | (empty/default) | None |
| `2` | უფასო | Free |
| `3` | კვლევის პაციენტები | Research Patients |
| `5` | პროტოკოლი: R3767-ONC-2266 | Protocol: R3767-ONC-2266 |

#### განყოფილება (Department) - mo_incomgrp - REQUIRED
| Value | Georgian (ka) | English (en) |
|-------|---------------|--------------|
| `` | (empty) | None |
| `736` | ამბულატორია | Ambulatory |
| `51442` | ამბულატორიული ონკოლოგია | Ambulatory Oncology |

**NOTE:** Additional 46 departments available in hidden `mo_incomhidf` dropdown for non-ambulatory visits.

#### მომართვის ტიპი (Referral Type) - mo_incmtp
| Value | Georgian (ka) | English (en) |
|-------|---------------|--------------|
| `` | (empty) | None |
| `1` | თვითდინება | Self-referral |
| `2` | სასწრაფო | Emergency |
| `3` | გადმოყვანილია კატასტროფით | Transferred by Disaster |

#### სტაციონარის ტიპი (Hospital Type) - mo_ddyastac
| Value | Georgian (ka) | English (en) |
|-------|---------------|--------------|
| `3` | გეგმიური ამბულატორია | Planned Ambulatory |
| `2` | დღის სტაციონარი | Day Hospital |

**Full list (mo_ddyastac_all for all admission types):**
| Value | Georgian (ka) | English (en) |
|-------|---------------|--------------|
| `1` | სტაციონარი | Inpatient |
| `3` | გეგმიური ამბულატორია | Planned Ambulatory |
| `2` | დღის სტაციონარი | Day Hospital |

#### მომყვანი (Referrer/Ambulance Service) - mo_myp - 30 OPTIONS
| Value | Georgian (ka) | English (en) |
|-------|---------------|--------------|
| `` | (empty) | None |
| `1` | 112 | 112 |
| `2` | med life | med life |
| `3` | გადაუდებელი სამედიცინო დახმარება | Emergency Medical Service |
| `4` | ჯეო-მედი | Geo-Medi |
| `5` | ტაო-მედი | Tao-Medi |
| `6` | სასწრაფო და გადაუდებელი დახმარების ცენტრი | Emergency and Urgent Care Center |
| `7` | კატასტროფის მედიცინის პედიატრიული ცენტრი | Disaster Medicine Pediatric Center |
| `8` | კარდიოსერვისი | CardioService |
| `9` | მკურნალი | Mkurnali |
| `10` | სასწრაფო და სამედიცინო დახმარების ცენტრი | Emergency and Medical Aid Center |
| `11` | კარდიოლოგიური სასწრაფო დახმარება "გული" | Cardiology Emergency Service "Guli" |
| `12` | კატასტროფის მედიცინის ცენტრი | Disaster Medicine Center |
| `13` | რეფერალური დახმარების ცენტრი | Referral Assistance Center |
| `14` | med care | med care |
| `15` | LTD Disaster medical center | LTD Disaster medical center |
| `16` | ემერჯენსის სერვისი | Emergency Service |
| `17` | კარდიოექსპრესი | CardioExpress |
| `18` | აისისი-ინტენსიური ზრუნვის ცენტრი | ISIS-Intensive Care Center |
| `19` | ო. ღუდუშაურის სახ.ეროვნული სამედიცინო ცენტრი | O. Gudushauri National Medical Center |
| `20` | ნეო მედი | Neo Medi |
| `21` | სასწრაფო სამედიცინო დახმარება "მკურნალი" | Emergency Medical Service "Mkurnali" |
| `22` | გორმედი | GorMedi |
| `23` | შპს Brothers | LLC Brothers |
| `24` | საგანგებო სიტუაციების კოორდინაციისა და გადაუდებელი დახმარების ცენტრი | Emergency Situations Coordination and Urgent Aid Center |
| `25` | წმინდა მიქაელ მთავარანგელოზის სახელობის მრავალპროფილიანი კლინიკური საავადმყოფო | St. Michael Archangel Multiprofile Clinical Hospital |
| `26` | MediClubGeorgia | MediClubGeorgia |
| `27` | ინტენსიური ზრუნვის ცენტრი | Intensive Care Center |
| `28` | IGG | IGG |
| `29` | კატასტროფის მედიცინის ბრიგადა ქალაქი წნორი | Disaster Medicine Brigade Tsnori |

#### გამომგზავნი (Sending Institution) - mo_patsender
| Value | Georgian (ka) | English (en) |
|-------|---------------|--------------|
| `` | (empty) | None |
| `1` | 112 | 112 |
| `2` | არქიმედეს კლინიკა სიღნაღი | Archimedes Clinic Sighnaghi |

---

## Section 2: დაზღვევა (Insurance)

**Section Styling:**
- Background: Light gray (`#f8f9fa`)
- Header text: `2 დაზღვევა`
- Toggle: Checkbox `mo_sbool` to enable/disable section
- Expandable: Yes (controlled by checkbox)
- "+ მეტი მზღვეველის დამატება" link to add secondary/tertiary insurers

### Insurance Toggle

| Field ID | Label | Type | Purpose |
|----------|-------|------|---------|
| `mo_sbool` | დაზღვევის ჩართვა | `checkbox` | When checked, ALL insurance fields become ENABLED. When unchecked, they remain DISABLED with CSS class `.disSel` |

### Field Specifications (Primary Insurer - Fields without suffix)

| Field ID | Label (ქართული) | Label (English) | Type | Required | Widget | Disabled Until Toggle | FHIR Mapping |
|----------|------------------|-----------------|------|----------|--------|----------------------|--------------|
| `mo_comp` | კომპანია | Company | `select` | No | InsuranceSelect | Yes | `Coverage.payor[0].reference` |
| `mo_instp` | ტიპი | Type | `select` | No | Select | Yes | `Coverage.type.coding[0].code` |
| `mo_polnmb` | პოლისის # | Policy Number | `text` | No | TextInput | Yes | `Coverage.subscriberId` |
| `mo_vano` | მიმართვის # | Referral Number | `text` | No | TextInput | Yes | `Coverage.extension[referral-number]` |
| `mo_deldat` | გაცემის თარიღი | Issue Date | `date` | No | DateInput (hasDatepicker) | Yes | `Coverage.period.start` |
| `mo_valdat` | მოქმედების ვადა | Expiration Date | `date` | No | DateInput (hasDatepicker) | Yes | `Coverage.period.end` |
| `mo_insprsnt` | თანაგადახდის % | Copay Percent | `text` | No | TextInput | Yes | `Coverage.costToBeneficiary[0].value.value` |

### Multiple Insurers Support

- **Maximum**: 3 insurers (primary, secondary, tertiary)
- **Add Link**: `მეტი მზღვეველის დამატება`
- **Secondary Fields** (suffix `1`): `mo_comp1`, `mo_instp1`, `mo_polnmb1`, `mo_vano1`, `mo_deldat1`, `mo_valdat1`, `mo_insprsnt1`
- **Tertiary Fields** (suffix `2`): `mo_comp2`, `mo_instp2`, `mo_polnmb2`, `mo_vano2`, `mo_deldat2`, `mo_valdat2`, `mo_insprsnt2`

**FHIR Mapping for Multiple Coverage:**
- Primary: `Coverage.order = 1`
- Secondary: `Coverage.order = 2`
- Tertiary: `Coverage.order = 3`
- All linked to same Encounter via `Coverage.extension[encounter-reference]`

### Insurance Company Options - mo_comp - 42 COMPANIES

| Value | Georgian (ka) | English (en) |
|-------|---------------|--------------|
| `0` | (empty) | None |
| `628` | სსიპ ჯანმრთელობის ეროვნული სააგენტო | National Health Agency |
| `6379` | ს.ს. სადაზღვევო კომპანია "ჯიპიაი ჰოლდინგი" | GPI Holding Insurance Company |
| `6380` | ალდაგი | Aldagi |
| `6381` | სს "დაზღვევის კომპანია ქართუ" | Qartu Insurance Company |
| `6382` | სტანდარტ დაზღვევა | Standard Insurance |
| `6383` | სს "პსპ დაზღვევა" | PSP Insurance |
| `6384` | სს „სადაზღვევო კომპანია ევროინს ჯორჯია" | Euroins Georgia Insurance Company |
| `6385` | შპს სადაზღვევო კომპანია "არდი ჯგუფი" | Ardi Group Insurance Company |
| `7603` | აჭარის ავტონომიური რესპუბლიკის ჯანმრთელობისა და სოციალური დაცვის სამინისტრო | Adjara Health and Social Protection Ministry |
| `8175` | იმედი L | Imedi L |
| `9155` | ქ. თბილისის მუნიციპალიტეტის მერია | Tbilisi City Hall |
| `10483` | სამხრეთ ოსეთის ადმინისტრაცია | South Ossetia Administration |
| `10520` | ირაო | IRAO |
| `11209` | ვია-ვიტა | Via-Vita |
| `11213` | რეფერალური დახმარების ცენტრი | Referral Assistance Center |
| `12078` | "კახეთი-იონი" | Kakheti-Ioni |
| `12461` | საქართველოს სასჯელაღსრულებისა და პრობაციის სამინისტროს სამედიცინო დეპარტამენტი | Ministry of Corrections Medical Department |
| `14134` | ბინადრობის უფლება | Residence Permit |
| `14137` | დაზღვევის არ მქონე | Uninsured |
| `16476` | უნისონი | Unisoni |
| `16803` | ალფა | Alpha |
| `22108` | IGG | IGG |
| `41288` | სს "ნიუ ვიჟენ დაზღვევა" | New Vision Insurance |
| `46299` | სადაზღვევო კომპანია გლობალ ბენეფიტს ჯორჯია | Global Benefits Georgia Insurance |
| `49974` | ინგოროყვას კლინიკა | Ingorokva Clinic |
| `51870` | ონის მუნიციპალიტეტის მერია | Oni Municipality |
| `52103` | რეფერალი ონკოლოგია | Referral Oncology |
| `54184` | შპს" თბილისის ცენტრალური საავადმყოფო" 203826645 | Tbilisi Central Hospital |
| `61677` | ა(ა)იპ საქართველოს სოლიდარობის ფონდი. რეფერალური მომსახურების დეპარტამენტი | Georgia Solidarity Fund Referral Services |
| `61768` | ახალი მზერა | New Vision |
| `63054` | სს კურაციო | Curatio |
| `67209` | გერმანული ჰოსპიტალი | German Hospital |
| `67469` | რეგიონალური ჯანდაცვის ცენტრი | Regional Healthcare Center |
| `70867` | სსიპ დევნილთა, ეკომიგრანტთა და საარსებო წყაროებით უზრუნველყოფის სააგენტო | IDPs, Eco-migrants and Livelihood Agency |
| `79541` | შპს გაგრა | Gagra LLC |
| `81614` | შპს თბილისის გულის ცენტრი | Tbilisi Heart Center |
| `86705` | კონსილიუმ მედულა | Consilium Medula |
| `88950` | ქართულ-ამერიკული რეპროდუქციული კლინიკა რეპროარტი | Georgian-American Reproductive Clinic ReproART |
| `89213` | შპს ელიავას საერთაშორისო ფაგო თერაპიული ცენტრი | Eliava International Phage Therapy Center |
| `89718` | შპს ჯეო ჰოსპიტალს | Geo Hospitals |
| `91685` | სს "საქართველოს კლინიკები" - ხაშურის ჰოსპიტალი | Georgian Clinics - Khashuri Hospital |

### Insurance Type Options - mo_instp - 49 TYPES

**NOTE:** These are specific Georgian healthcare insurance codes, NOT simple State/Private/Corporate types.

| Value | Georgian (ka) | English (en) |
|-------|---------------|--------------|
| `0` | (empty) | None |
| `10` | საპენსიო | Pensioner |
| `13` | პედაგოგი | Teacher |
| `14` | უმწეო | Vulnerable |
| `15` | შშმპ | Disabled |
| `17` | 36-2-გადაუდებალი ამბულატორია (მინიმალური) | 36-2-Emergency Ambulatory (Minimal) |
| `18` | 36-3-გადაუდებალი სტაციონარი | 36-3-Emergency Inpatient |
| `19` | 36-3-გადაუდებელი სტაციონარი (მინიმალური) | 36-3-Emergency Inpatient (Minimal) |
| `20` | 36-4-გეგმიური ქირურგიული მომსახურება | 36-4-Planned Surgical Service |
| `21` | 36-5-კარდიოქირურგია | 36-5-Cardiac Surgery |
| `22` | 165-2-გადაუდებელი ამბულატორია | 165-2-Emergency Ambulatory |
| `23` | 165-3-გადაუდებალი სტაციონარი | 165-3-Emergency Inpatient |
| `24` | 165-4-გეგმიური ქირურგიული მომსახურება | 165-4-Planned Surgical Service |
| `25` | 165-5-კარდიოქირურგია | 165-5-Cardiac Surgery |
| `26` | 218-2-გადაუდებალი ამბულატორია | 218-2-Emergency Ambulatory |
| `27` | 218-3-გადაუდებალი სტაციონარი | 218-3-Emergency Inpatient |
| `28` | 218-4-გეგმიური ქირურგიული მომსახურება | 218-4-Planned Surgical Service |
| `29` | 218-5-კარდიოქირურგია | 218-5-Cardiac Surgery |
| `30` | კორპორატიული | Corporate |
| `32` | რეფერალური მომსახურების სახელმწიფო პროგრამა | State Referral Service Program |
| `33` | ვეტერანი | Veteran |
| `36` | ქ. თბილისი მერიის სამედიცინო სერვისი | Tbilisi City Hall Medical Service |
| `37` | სისხლძარღვოვანი მიდგომით უზრუნველყოფა | Vascular Approach Provision |
| `38` | - | - |
| `39` | საბაზისო < 1000 | Basic < 1000 |
| `40` | საბაზისო >= 1000 | Basic >= 1000 |
| `41` | 36-2-გადაუდებელი ამბულატორია (ახალი) | 36-2-Emergency Ambulatory (New) |
| `42` | 36-2-გადაუდებალი ამბულატორია (მინიმალური) (ახალი) | 36-2-Emergency Ambulatory (Minimal) (New) |
| `43` | 36-3-გადაუდებალი სტაციონარი (ახალი) | 36-3-Emergency Inpatient (New) |
| `44` | 36-3-გადაუდებელი სტაციონარი (მინიმალური) (ახალი) | 36-3-Emergency Inpatient (Minimal) (New) |
| `45` | 36-4-გეგმიური ქირურგიული მომსახურება (ახალი) | 36-4-Planned Surgical Service (New) |
| `46` | 36-5-კარდიოქირურგია (ახალი) | 36-5-Cardiac Surgery (New) |
| `47` | საბაზისო > 40000 | Basic > 40000 |
| `48` | მინიმალური პაკეტი | Minimal Package |
| `49` | 70000-დან 100000 ქულამდე | 70000 to 100000 Points |
| `50` | მინიმალური < 1000 | Minimal < 1000 |
| `51` | მინიმალური >= 1000 | Minimal >= 1000 |
| `52` | საბაზისო, 2017 წლის 1 იანვრის მდგომარეობით დაზღვეული | Basic, Insured as of Jan 1, 2017 |
| `53` | საბაზისო, 2017 წლის 1 იანვრის შემდგომ დაზღვეული | Basic, Insured after Jan 1, 2017 |
| `54` | გადაუდებელი ამბულატორია 2 | Emergency Ambulatory 2 |
| `55` | კარდიოქირურგია 5 | Cardiac Surgery 5 |
| `56` | საბაზისო 6-დან 18 წლამდე | Basic 6 to 18 Years |
| `57` | 165-სტუდენტი | 165-Student |
| `58` | DRG გეგმიური ქირურგია | DRG Planned Surgery |
| `59` | DRG გადაუდებელი სტაციონარი | DRG Emergency Inpatient |
| `60` | პროგრამა რეფერალური მომსახურება, კომპონენტი ონკოლოგია-თანაგადახდა | Referral Service Program, Oncology-Copay Component |
| `61` | ქიმიოთერაპია და ჰორმონოთერაპია | Chemotherapy and Hormone Therapy |
| `62` | გულის ქირურგიის დამატებითი სამედიცინო მომსახურების ქვეპროგრამა | Cardiac Surgery Additional Medical Service Subprogram |
| `63` | სსიპ დევნილთა,ეკომიგრანტთა და საარსებო წყაროებით უზრუნველყოფის სააგენტო | IDPs and Eco-migrants Agency |

---

## Section 3: საგარანტიო (Guarantee)

**Section Styling:**
- Background: Light gray (`#f8f9fa`)
- Header text: `3 საგარანტიო`
- Add button: `+` (mo_tog) to add guarantee letter entries
- Purpose: **Guarantee letter management system** (NOT a simple textarea)

### Field Specifications

| Field ID | Label (ქართული) | Label (English) | Type | Required | Widget | CSS Class | Purpose |
|----------|------------------|-----------------|------|----------|--------|-----------|---------|
| `mo_timwh` | დონორი | Donor | `text` | No | TextInput | `knop` | Name of guarantee donor |
| `mo_timamo` | თანხა | Amount | `text` | No | NumberInput | `isdoubl` | Guarantee amount |
| `mo_timltdat` | თარიღი | Start Date | `date` | No | DateInput (hasDatepicker) | | Letter start date |
| `mo_timdrdat` | | End Date | `date` | No | DateInput (hasDatepicker) | | Letter end date |
| `mo_letterno` | ნომერი | Letter Number | `text` | No | TextInput | | Guarantee letter number |

### Buttons in Section

| Button ID | Text | Purpose |
|-----------|------|---------|
| `mo_tog` | + | Add new guarantee letter entry |
| `mo_timins` | (icon) | Search for guarantee donor in database |

**Layout Structure:**
```
┌─────────────────────────────────────────────────────────────────┐
│ 3 საგარანტიო                                             [+ btn] │
├─────────────────────────────────────────────────────────────────┤
│ ┌───────────────────┐  ┌───────────────┐  ┌─────────────────┐  │
│ │ დონორი            │  │ თანხა         │  │ [Search Button] │  │
│ │ [mo_timwh]        │  │ [mo_timamo]   │  │                 │  │
│ └───────────────────┘  └───────────────┘  └─────────────────┘  │
│                                                                   │
│ ┌───────────────────┐  ┌───────────────┐  ┌─────────────────┐  │
│ │ თარიღი            │  │ (End Date)    │  │ ნომერი          │  │
│ │ [mo_timltdat]     │  │ [mo_timdrdat] │  │ [mo_letterno]   │  │
│ └───────────────────┘  └───────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Section 4: დემოგრაფია (Demographics)

**Section Styling:**
- Background: Light gray (`#f8f9fa`)
- Header text: `4 დემოგრაფია`
- Copy button: `კოპირება` (Copy demographics from patient record)
- Fields: **EDITABLE** (NOT read-only as previously assumed)

### Field Specifications

| Field ID | Label (ქართული) | Label (English) | Type | Required | Widget | CSS Class | FHIR Mapping |
|----------|------------------|-----------------|------|----------|--------|-----------|--------------|
| `mo_regions` | რეგიონი | Region | `select` | No | Select | `nondrg` | `Patient.address[0].state` |
| `mo_raions_hid` | რაიონი | District | `select` | No | Select (hidden, filtered by region) | | `Patient.address[0].district` |
| `mo_city` | ქალაქი | City | `text` | No | TextInput | `nondrg` | `Patient.address[0].city` |
| `mo_otheraddress` | ფაქტიური მისამართი | Actual Address | `text` | No | TextInput | `nondrg` | `Patient.address[0].line[0]` |
| `mo_ganatleba` | განათლება | Education | `select` | No | Select | | `Patient.extension[education]` |
| `mo_ojaxi` | ოჯახური მდგომარეობა | Family Status | `select` | No | Select | | `Patient.maritalStatus.coding[0].code` |
| `mo_dasaqmeba` | დასაქმება | Employment | `select` | No | Select | | `Patient.extension[employment]` |

### რეგიონი (Region) - mo_regions - 13 REGIONS

| Value | Georgian (ka) | English (en) |
|-------|---------------|--------------|
| `` | (empty) | None |
| `1` | 01 - აფხაზეთი | 01 - Abkhazia |
| `10` | 02 - აჭარა | 02 - Adjara |
| `17` | 03 - გურია | 03 - Guria |
| `21` | 04 - თბილისი | 04 - Tbilisi |
| `39` | 05 - იმერეთი | 05 - Imereti |
| `52` | 06 - კახეთი | 06 - Kakheti |
| `61` | 07 - მცხეთა-მთიანეთი | 07 - Mtskheta-Mtianeti |
| `67` | 08 - რაჭა-ლეჩხუმი და ქვემო სვანეთი | 08 - Racha-Lechkhumi and Kvemo Svaneti |
| `72` | 09 - საზღვარგარეთი | 09 - Abroad |
| `74` | 10 - სამეგრელო და ზემო სვანეთი | 10 - Samegrelo and Zemo Svaneti |
| `84` | 11 - სამცხე-ჯავახეთი | 11 - Samtskhe-Javakheti |
| `91` | 12 - ქვემო ქართლი | 12 - Kvemo Kartli |
| `99` | 13 - შიდა ქართლი | 13 - Shida Kartli |

### რაიონი (District) - mo_raions_hid - 94 DISTRICTS

**NOTE:** Districts are dynamically filtered based on selected region. Hidden select contains all 94 districts with values like:
- `0101` - გაგრა (Abkhazia)
- `0102` - გალი (Abkhazia)
- `0201` - ბათუმი (Adjara)
- `0401` - გლდანი (Tbilisi)
- etc.

### განათლება (Education) - mo_ganatleba

| Value | Georgian (ka) | English (en) |
|-------|---------------|--------------|
| `` | (empty) | None |
| `4` | უმაღლესი განათლება | Higher Education |
| `5` | სკოლამდელი განათლება | Preschool Education |
| `6` | საბაზისო განათლება (1-6 კლასი) | Basic Education (Grades 1-6) |
| `7` | მეორე საფეხურის განათლება (7-9 კლასი) | Secondary Education (Grades 7-9) |
| `8` | მეორე საფეხურის განათლება (9-12 კლასი) | Secondary Education (Grades 9-12) |
| `9` | პროფესიული განათლება | Vocational Education |

### ოჯახური მდგომარეობა (Family Status) - mo_ojaxi

| Value | Georgian (ka) | English (en) |
|-------|---------------|--------------|
| `` | (empty) | None |
| `1` | დასაოჯახებელი | Single |
| `2` | დაოჯახებული | Married |
| `3` | განქორწინებული | Divorced |
| `4` | ქვრივი | Widowed |
| `5` | თანაცხოვრებაში მყოფი | Cohabiting |

### დასაქმება (Employment) - mo_dasaqmeba

| Value | Georgian (ka) | English (en) |
|-------|---------------|--------------|
| `` | (empty) | None |
| `1` | დასაქმებული | Employed |
| `2` | უმუშევარი | Unemployed |
| `3` | პენსიონერი | Pensioner |
| `4` | სტუდენტი | Student |
| `5` | მოსწავლე | Pupil |
| `6` | მომუშავე პენსიაზე გასვლის შემდგომ | Working After Retirement |
| `7` | თვითდასაქმებული | Self-employed |
| `8` | მომუშავე სტუდენტი | Working Student |

### Copy Button

- **Text:** `კოპირება` (Copy)
- **Purpose:** Copy demographics from Patient resource to visit record
- **Action:** Fills all demographics fields from Patient resource data

---

## Modal Footer / Buttons

### Primary Buttons

| Button ID | Text (ქართული) | Text (English) | CSS Class | Purpose |
|-----------|-----------------|----------------|-----------|---------|
| `mo_fnlinstr` | შენახვა | Save | `rgpap nondrg` | Main form submission button |
| (none) | პჯდ შემოწმება | Check Personal ID | `whipap nondrg` | Verify personal ID in database |

### Button Specifications

- **Save Button** (`mo_fnlinstr`):
  - Position: Right-aligned at bottom
  - Loading State: Shows spinner during API call
  - Disabled: When form is invalid or submitting

---

## Additional Checkboxes

| Checkbox ID | Purpose | Default State | Notes |
|-------------|---------|---------------|-------|
| `mo_sbool` | Enable/disable insurance section | Unchecked | Controls all insurance fields |
| `viravans` | Unknown | Checked | Found checked by default |
| `cgbevb` | Unknown | Unchecked | Found unchecked |

---

## JavaScript Event Handlers

### Form Submission Interface

```typescript
interface RegistrationVisitFormValues {
  // Registration Section
  mo_regdate: string; // "YYYY-MM-DD HH:mm"
  mo_regtype: '1' | '2' | '3'; // 1=Planned Inpatient, 2=Emergency Inpatient, 3=Ambulatory
  mo_stat: '1' | '2' | '3' | '5'; // 1=None, 2=Free, 3=Research, 5=Protocol
  mo_incomgrp: string; // Department code (e.g., "736", "51442")
  mo_incmtp: '' | '1' | '2' | '3'; // Referral type
  mo_ddyastac: '2' | '3'; // Hospital type
  mo_myp: string; // Ambulance service code
  mo_patsender: string; // Sending institution code
  mo_patsendrdatetime: string; // "YYYY-MM-DD HH:mm"

  // Insurance Section (Primary)
  mo_sbool: boolean; // Insurance enabled
  mo_comp: string; // Insurance company code (e.g., "628", "6380")
  mo_instp: string; // Insurance type code (e.g., "10", "30")
  mo_polnmb: string; // Policy number
  mo_vano: string; // Referral number
  mo_deldat: string; // Issue date "YYYY-MM-DD"
  mo_valdat: string; // Expiration date "YYYY-MM-DD"
  mo_insprsnt: string; // Copay percent

  // Secondary Insurer (suffix 1)
  mo_comp1: string;
  mo_instp1: string;
  mo_polnmb1: string;
  mo_vano1: string;
  mo_deldat1: string;
  mo_valdat1: string;
  mo_insprsnt1: string;

  // Tertiary Insurer (suffix 2)
  mo_comp2: string;
  mo_instp2: string;
  mo_polnmb2: string;
  mo_vano2: string;
  mo_deldat2: string;
  mo_valdat2: string;
  mo_insprsnt2: string;

  // Guarantee Section
  mo_timwh: string; // Donor
  mo_timamo: string; // Amount
  mo_timltdat: string; // Start date
  mo_timdrdat: string; // End date
  mo_letterno: string; // Letter number

  // Demographics Section
  mo_regions: string; // Region code (e.g., "21" for Tbilisi)
  mo_raions_hid: string; // District code (e.g., "0401")
  mo_city: string; // City name
  mo_otheraddress: string; // Actual address
  mo_ganatleba: string; // Education code
  mo_ojaxi: string; // Family status code
  mo_dasaqmeba: string; // Employment code
}
```

---

## FHIR Resource Structure

### Encounter Resource (Visit)

```json
{
  "resourceType": "Encounter",
  "id": "visit-123",
  "status": "in-progress",
  "class": {
    "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
    "code": "AMB",
    "display": "ambulatory"
  },
  "type": [
    {
      "coding": [
        {
          "system": "http://medimind.ge/CodeSystem/encounter-type",
          "code": "registration-visit",
          "display": "Registration Visit"
        }
      ]
    }
  ],
  "serviceType": {
    "coding": [
      {
        "system": "http://medimind.ge/CodeSystem/department",
        "code": "736",
        "display": "Ambulatory"
      }
    ]
  },
  "subject": {
    "reference": "Patient/patient-456",
    "display": "ლევან ჭილაია"
  },
  "period": {
    "start": "2025-11-16T14:10:00+04:00"
  },
  "extension": [
    {
      "url": "http://medimind.ge/StructureDefinition/status-code",
      "valueCode": "1"
    },
    {
      "url": "http://medimind.ge/StructureDefinition/hospital-type",
      "valueCode": "3"
    },
    {
      "url": "http://medimind.ge/StructureDefinition/referral-type",
      "valueCode": "1"
    },
    {
      "url": "http://medimind.ge/StructureDefinition/ambulance-service",
      "valueCode": "1"
    },
    {
      "url": "http://medimind.ge/StructureDefinition/sending-institution",
      "valueCode": "1"
    },
    {
      "url": "http://medimind.ge/StructureDefinition/sending-referral-datetime",
      "valueDateTime": "2025-11-16T12:00:00+04:00"
    },
    {
      "url": "http://medimind.ge/StructureDefinition/guarantee-letter",
      "extension": [
        {
          "url": "donor",
          "valueString": "Donor Name"
        },
        {
          "url": "amount",
          "valueDecimal": 1000.00
        },
        {
          "url": "start-date",
          "valueDate": "2025-11-01"
        },
        {
          "url": "end-date",
          "valueDate": "2025-12-31"
        },
        {
          "url": "letter-number",
          "valueString": "GL-2025-001"
        }
      ]
    }
  ]
}
```

### Coverage Resource (Insurance)

```json
{
  "resourceType": "Coverage",
  "id": "coverage-789",
  "status": "active",
  "type": {
    "coding": [
      {
        "system": "http://medimind.ge/CodeSystem/insurance-type",
        "code": "30",
        "display": "Corporate"
      }
    ]
  },
  "subscriber": {
    "reference": "Patient/patient-456"
  },
  "beneficiary": {
    "reference": "Patient/patient-456"
  },
  "payor": [
    {
      "reference": "Organization/6380",
      "display": "ალდაგი"
    }
  ],
  "subscriberId": "POL-12345",
  "order": 1,
  "period": {
    "start": "2025-01-01",
    "end": "2025-12-31"
  },
  "costToBeneficiary": [
    {
      "type": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/coverage-copay-type",
            "code": "copay"
          }
        ]
      },
      "value": {
        "value": 20,
        "unit": "%"
      }
    }
  ],
  "extension": [
    {
      "url": "http://medimind.ge/StructureDefinition/referral-number",
      "valueString": "REF-67890"
    },
    {
      "url": "http://medimind.ge/StructureDefinition/encounter-reference",
      "valueReference": {
        "reference": "Encounter/visit-123"
      }
    }
  ]
}
```

---

## Files Created During Extraction

1. **Screenshot:** `/Users/toko/Desktop/medplum_medimind/.playwright-mcp/registration-visit-modal.png`
2. **Complete JSON Data:** `/Users/toko/Desktop/medplum_medimind/documentation/registration/appendices/registration-visit-modal-details.json`
3. **Corrections Document:** `/Users/toko/Desktop/medplum_medimind/documentation/registration/appendices/registration-visit-modal-corrections.md`

---

## Implementation Notes

### Key Differences from Original Assumptions

1. **ALL Field IDs use `mo_` prefix** - NOT camelCase names
2. **Insurance companies:** 42 companies (not 58)
3. **Insurance types:** 49 specific Georgian healthcare codes (not simple State/Private/Corporate)
4. **Guarantee section:** Letter management system with donor, amount, dates, number (NOT simple textarea)
5. **Status field:** Contains specific research protocols and free patient codes
6. **Demographics:** EDITABLE (not read-only)
7. **Missing fields:** Referral type, ambulance service, sending institution
8. **Regions:** 13 Georgian regions with specific value codes
9. **Districts:** 94 districts dynamically filtered by region

### Validation Rules

```typescript
const validateForm = (values: RegistrationVisitFormValues) => {
  const errors: Record<string, string> = {};

  // Required fields
  if (!values.mo_regdate) {
    errors.mo_regdate = 'Date is required';
  }
  if (!values.mo_regtype) {
    errors.mo_regtype = 'Admission type is required';
  }
  if (!values.mo_incomgrp) {
    errors.mo_incomgrp = 'Department is required';
  }

  // Date validation
  const dateTime = new Date(values.mo_regdate);
  if (dateTime > new Date()) {
    errors.mo_regdate = 'Date cannot be in the future';
  }

  // Insurance validation (if enabled)
  if (values.mo_sbool) {
    const copay = parseFloat(values.mo_insprsnt);
    if (copay < 0 || copay > 100) {
      errors.mo_insprsnt = 'Copay must be between 0 and 100';
    }
    const issueDate = new Date(values.mo_deldat);
    const expirationDate = new Date(values.mo_valdat);
    if (expirationDate < issueDate) {
      errors.mo_valdat = 'Expiration date must be after issue date';
    }
  }

  return errors;
};
```

---

## Testing Requirements

### Unit Tests

1. Modal opens with correct patient name and visit badge
2. All 4 sections render with correct headers (1 რეგისტრაცია, 2 დაზღვევა, 3 საგარანტიო, 4 დემოგრაფია)
3. Required fields (mo_regdate, mo_regtype, mo_incomgrp) show validation errors when empty
4. Insurance section toggle (mo_sbool) enables/disables all insurance fields
5. Add insurer link adds secondary/tertiary insurers
6. Demographics fields are EDITABLE (not disabled)
7. Save button (mo_fnlinstr) triggers form submission
8. Successful save calls onSuccess callback
9. Form values map correctly to FHIR resources
10. All translations render in ka/en/ru
11. Region selection filters district dropdown
12. Guarantee letter fields save correctly

### Integration Tests

1. Clicking patient row opens modal with correct patient data
2. Loading overlay shows while fetching data
3. Form submission creates Encounter + Coverage resources
4. Insurance toggle enables/disables fields correctly
5. Multiple insurers create multiple Coverage resources with correct order
6. Error states show notifications
7. Modal closes after successful save
8. Table refreshes with new visit data

---

## Route Trigger

**Opens from:** `/emr/registration` - clicking on patient row in table
**NOT from:** `/emr/patient-history` (that opens PatientHistoryDetailModal)
