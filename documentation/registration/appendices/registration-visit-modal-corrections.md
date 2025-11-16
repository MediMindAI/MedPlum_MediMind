# Registration Visit Modal - Corrections and Actual Data

**Extraction Date:** 2025-11-16
**Source URL:** http://178.134.21.82:8008/clinic.php
**Modal Container ID:** `#shnek`

## Overview

This document provides corrections to the assumed spec at `/specs/registration-visit-modal.md` based on actual data extracted from the live EMR system at http://178.134.21.82:8008/index.php.

---

## CRITICAL CORRECTIONS

### 1. Field IDs (NOT as assumed in spec)

| Spec Field Name | **ACTUAL Field ID** | Notes |
|-----------------|---------------------|-------|
| `visitDate` | **`mo_regdate`** | DateTime picker with class `hasDatepicker` |
| `admissionType` | **`mo_regtype`** | Only 3 options, not 4 |
| `status` | **`mo_stat`** | Different values than assumed |
| `comment` | **NOT A FIELD** | The spec incorrectly assumed a comment textarea |
| `department` | **`mo_incomgrp`** | Only 2-3 ambulatory departments visible |
| `hospitalType` | **`mo_ddyastac`** | Different options |
| `insuranceCompany` | **`mo_comp`** | 42 companies, not 58 |
| `insuranceType` | **`mo_instp`** | 49 types, very specific Georgian healthcare codes |
| `policyNumber` | **`mo_polnmb`** | |
| `referralNumber` | **`mo_vano`** | |
| `copayPercent` | **`mo_insprsnt`** | |
| `region` | **`mo_regions`** | 13 regions + empty |
| `district` | **`mo_raions_hid`** | 94 districts |
| `city` | **`mo_city`** | |
| `actualAddress` | **`mo_otheraddress`** | |
| `education` | **`mo_ganatleba`** | |
| `familyStatus` | **`mo_ojaxi`** | |
| `employment` | **`mo_dasaqmeba`** | |

### 2. Section 3: საგარანტიო (Guarantee) - COMPLETELY DIFFERENT

**SPEC WAS WRONG:** Spec assumed a simple textarea for guarantee text.

**ACTUAL STRUCTURE:**
- **mo_timwh** - დონორი (Donor) - Text input
- **mo_timamo** - თანხა (Amount) - Text/number input
- **mo_timltdat** - თარიღი (Start Date) - Date picker
- **mo_timdrdat** - (End Date) - Date picker
- **mo_letterno** - ნომერი (Letter Number) - Text input
- **mo_tog** - "+" button to add more guarantee letters
- **mo_timins** - Search button for donors

This is a guarantee LETTER management system, not a simple text field.

### 3. Registration Section - Missing Fields

**SPEC MISSED:**
- **mo_incmtp** - მომართვის ტიპი (Referral Type)
  - თვითდინება (Self-referral)
  - სასწრაფო (Emergency)
  - გადმოყვანილია კატასტროფით (Transferred by Disaster)

- **mo_myp** - მომყვანი (Referrer/Ambulance Service) - 30 options!
  - 112, med life, ჯეო-მედი, etc.

- **mo_patsender** - გამომგზავნი (Sending Institution)

- **mo_patsendrdatetime** - გამომგზავნ დაწესებულებაში მიმართვის თარიღი/დრო

### 4. Demographics - NOT Read-Only

**SPEC WAS WRONG:** Assumed demographics are disabled/read-only.

**ACTUAL:** All demographics fields are EDITABLE (enabled). They can be filled in during registration.

---

## DROPDOWN OPTIONS - ACTUAL VALUES

### შემოსვლის ტიპი (Admission Type) - mo_regtype

| Value | Georgian Text | English Translation |
|-------|---------------|---------------------|
| 3 | ამბულატორიული | Ambulatory |
| 1 | გეგმიური სტაციონარული | Planned Inpatient |
| 2 | გადაუდებელი სტაციონარული | Emergency Inpatient |

**NOTE:** Value "3" is Ambulatory (default), NOT value "1"

### სტატუსი (Status) - mo_stat

| Value | Georgian Text | English Translation |
|-------|---------------|---------------------|
| 1 | (empty) | Default/None |
| 2 | უფასო | Free |
| 3 | კვლევის პაციენტები | Research Patients |
| 5 | პროტოკოლი: R3767-ONC-2266 | Protocol: R3767-ONC-2266 |

**SPEC WAS COMPLETELY WRONG** about status values!

### განყოფილება (Department) - mo_incomgrp

| Value | Georgian Text | English Translation |
|-------|---------------|---------------------|
| (empty) | | |
| 736 | ამბულატორია | Ambulatory |
| 51442 | ამბულატორიული ონკოლოგია | Ambulatory Oncology |

**NOTE:** Only 2 departments shown for ambulatory visits. A hidden dropdown `mo_incomhidf` has 46 departments.

### სტაციონარის ტიპი (Hospital Type) - mo_ddyastac

| Value | Georgian Text | English Translation |
|-------|---------------|---------------------|
| 3 | გეგმიური ამბულატორია | Planned Ambulatory |
| 2 | დღის სტაციონარი | Day Hospital |

### Insurance Companies (mo_comp) - 42 Companies (NOT 58)

Top 10:
1. (empty) - value: 0
2. სსიპ ჯანმრთელობის ეროვნული სააგენტო - value: 628
3. ს.ს. სადაზღვევო კომპანია "ჯიპიაი ჰოლდინგი" - value: 6379
4. ალდაგი - value: 6380
5. სს "დაზღვევის კომპანია ქართუ" - value: 6381
6. სტანდარტ დაზღვევა - value: 6382
7. სს "პსპ დაზღვევა" - value: 6383
8. სს „სადაზღვევო კომპანია ევროინს ჯორჯია" - value: 6384
9. შპს სადაზღვევო კომპანია "არდი ჯგუფი" - value: 6385
10. აჭარის ავტონომიური რესპუბლიკის ჯანმრთელობისა და სოციალური დაცვის სამინისტრო - value: 7603

Full list in: `/documentation/registration/appendices/registration-visit-modal-details.json`

### Insurance Types (mo_instp) - 49 Types (NOT 3)

**SPEC WAS COMPLETELY WRONG!** These are NOT simple "State/Private/Corporate" types.

These are specific Georgian healthcare insurance codes:
- საპენსიო (Pensioner) - value: 10
- პედაგოგი (Teacher) - value: 13
- უმწეო (Vulnerable) - value: 14
- შშმპ (Disabled) - value: 15
- 36-2-გადაუდებალი ამბულატორია (მინიმალური) - value: 17
- 36-3-გადაუდებალი სტაციონარი - value: 18
- 165-2-გადაუდებელი ამბულატორია - value: 22
- კორპორატიული - value: 30
- რეფერალური მომსახურების სახელმწიფო პროგრამა - value: 32
- ვეტერანი - value: 33
- DRG გეგმიური ქირურგია - value: 58
- DRG გადაუდებელი სტაციონარი - value: 59
- ქიმიოთერაპია და ჰორმონოთერაპია - value: 61

Full list in JSON file.

### რეგიონი (Region) - mo_regions - 13 Regions

| Value | Code & Name |
|-------|-------------|
| 1 | 01 - აფხაზეთი (Abkhazia) |
| 10 | 02 - აჭარა (Adjara) |
| 17 | 03 - გურია (Guria) |
| 21 | 04 - თბილისი (Tbilisi) |
| 39 | 05 - იმერეთი (Imereti) |
| 52 | 06 - კახეთი (Kakheti) |
| 61 | 07 - მცხეთა-მთიანეთი (Mtskheta-Mtianeti) |
| 67 | 08 - რაჭა-ლეჩხუმი და ქვემო სვანეთი (Racha-Lechkhumi) |
| 72 | 09 - საზღვარგარეთი (Abroad) |
| 74 | 10 - სამეგრელო და ზემო სვანეთი (Samegrelo) |
| 84 | 11 - სამცხე-ჯავახეთი (Samtskhe-Javakheti) |
| 91 | 12 - ქვემო ქართლი (Kvemo Kartli) |
| 99 | 13 - შიდა ქართლი (Shida Kartli) |

### რაიონი (District) - mo_raions_hid - 94 Districts

Hidden select with dynamic filtering based on selected region. Contains codes like:
- 0101 - გაგრა
- 0102 - გალი
- 0201 - ბათუმი
- 0401 - გლდანი
- etc.

### განათლება (Education) - mo_ganatleba - 7 Options

| Value | Georgian Text | English Translation |
|-------|---------------|---------------------|
| (empty) | | |
| 4 | უმაღლესი განათლება | Higher Education |
| 5 | სკოლამდელი განათლება | Preschool Education |
| 6 | საბაზისო განათლება (1-6 კლასი) | Basic Education (Grades 1-6) |
| 7 | მეორე საფეხურის განათლება (7-9 კლასი) | Secondary Education (Grades 7-9) |
| 8 | მეორე საფეხურის განათლება (9-12 კლასი) | Secondary Education (Grades 9-12) |
| 9 | პროფესიული განათლება | Vocational Education |

### ოჯახური მდგომარეობა (Family Status) - mo_ojaxi - 6 Options

| Value | Georgian Text | English Translation |
|-------|---------------|---------------------|
| (empty) | | |
| 1 | დასაოჯახებელი | Single |
| 2 | დაოჯახებული | Married |
| 3 | განქორწინებული | Divorced |
| 4 | ქვრივი | Widowed |
| 5 | თანაცხოვრებაში მყოფი | Cohabiting |

### დასაქმება (Employment) - mo_dasaqmeba - 9 Options

| Value | Georgian Text | English Translation |
|-------|---------------|---------------------|
| (empty) | | |
| 1 | დასაქმებული | Employed |
| 2 | უმუშევარი | Unemployed |
| 3 | პენსიონერი | Pensioner |
| 4 | სტუდენტი | Student |
| 5 | მოსწავლე | Pupil |
| 6 | მომუშავე პენსიაზე გასვლის შემდგომ | Working After Retirement |
| 7 | თვითდასაქმებული | Self-employed |
| 8 | მომუშავე სტუდენტი | Working Student |

---

## INTERACTIVE BEHAVIOR

### Insurance Section Toggle

- **Checkbox ID:** `mo_sbool`
- **Default:** Unchecked
- **Behavior:** When checked, ALL insurance fields become ENABLED. When unchecked, they remain DISABLED.
- **CSS Class:** `.disSel` for disabled fields

### Multiple Insurers

The modal supports 3 insurers:
1. **Primary** - Fields: `mo_comp`, `mo_instp`, `mo_polnmb`, `mo_vano`, `mo_deldat`, `mo_valdat`, `mo_insprsnt`
2. **Secondary** - Fields: `mo_comp1`, `mo_instp1`, `mo_polnmb1`, `mo_vano1`, `mo_deldat1`, `mo_valdat1`, `mo_insprsnt1`
3. **Tertiary** - Fields: `mo_comp2`, `mo_instp2`, `mo_polnmb2`, `mo_vano2`, `mo_deldat2`, `mo_valdat2`, `mo_insprsnt2`

### Buttons

| Button ID | Text | Purpose |
|-----------|------|---------|
| mo_fnlinstr | შენახვა | Save form |
| mo_tog | + | Add guarantee letter |
| (none) | კოპირება | Copy demographics from patient |
| (none) | პჯდ შემოწმება | Check Personal ID |
| mo_timins | (icon) | Search for guarantee donor |

---

## SUMMARY OF MAJOR DISCREPANCIES

1. **Field IDs:** ALL field IDs start with `mo_` prefix (e.g., `mo_regtype`, `mo_comp`)
2. **Insurance Companies:** 42 companies, not 58
3. **Insurance Types:** 49 specific Georgian healthcare codes, NOT simple State/Private/Corporate
4. **Guarantee Section:** Complex letter management system with donor, amount, dates, number - NOT a simple textarea
5. **Status Field:** 4 specific status values including research protocols
6. **Missing Fields in Spec:**
   - მომართვის ტიპი (Referral Type)
   - მომყვანი (Referrer/Ambulance - 30 options!)
   - გამომგზავნი (Sending Institution)
   - გამომგზავნ დაწესებულებაში მიმართვის თარიღი/დრო
7. **Demographics:** NOT read-only, fully editable
8. **Regions:** 13 Georgian regions with specific value codes
9. **Districts:** 94 districts dynamically filtered by region

---

## FILES CREATED

1. **Screenshot:** `/Users/toko/Desktop/medplum_medimind/.playwright-mcp/registration-visit-modal.png`
2. **Complete JSON:** `/Users/toko/Desktop/medplum_medimind/documentation/registration/appendices/registration-visit-modal-details.json`
3. **This corrections file:** `/Users/toko/Desktop/medplum_medimind/documentation/registration/appendices/registration-visit-modal-corrections.md`

---

## RECOMMENDATIONS

1. **UPDATE FIELD IDs** in all code to use `mo_` prefix
2. **UPDATE Insurance Type dropdown** with actual 49 Georgian healthcare codes
3. **REDESIGN Guarantee Section** as a letter management system
4. **ADD missing fields** for referral type, referrer, and sending institution
5. **MAKE demographics editable** (remove disabled attribute)
6. **UPDATE insurance company list** to actual 42 companies with correct value codes
7. **IMPLEMENT region/district cascading dropdown** with actual 13 regions and 94 districts
