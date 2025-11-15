# Complete Dropdown Options - Visit Edit Window

**Source**: Visit Edit Window (pen icon from Patient History list)
**Extraction Date**: 2025-11-10
**Total Dropdowns**: 25
**Total Options**: 633 (across all dropdowns)

---

## Large Dropdowns (Separate Files)

These dropdowns have >20 options and are documented in separate appendix files:

1. **Insurance Companies** (42-58 options)
   - File: `insurance-companies-complete.md`
   - Fields: `zi_sendcmp` (58), `lak_comp` (42), `lak_comp1` (42), `lak_comp2` (42)

2. **Insurance Types/Programs** (49 options)
   - File: `insurance-types-complete.md`
   - Fields: `lak_instp` (49), `lak_instp1` (49), `lak_instp2` (49)

3. **Departments** (24 options)
   - Field: `Ros_br`
   - See section below

4. **Referrers/Ambulance Services** (30 options)
   - Field: `mo_selsas`
   - See section below

5. **Districts - All Georgia** (94 options)
   - Field: `mo_raions_hid`
   - See section below

6. **Year Selector** (119 options: 1912-2030)
   - Field: No ID
   - See section below

---

## Dropdown 1: Departments (`Ros_br`) - 24 Options

| Value | Georgian Text | English |
|-------|---------------|---------|
| (empty) | (empty) | No selection |
| 18 | კარდიოქირურგია | Cardiac Surgery |
| 620 | სისხლძარღვთა ქირურგია | Vascular Surgery |
| 735 | კარდიოლოგია | Cardiology |
| 736 | ამბულატორია | Ambulatory |
| 981 | არითმოლოგია | Arrhythmology |
| 3937 | კარდიოქირურგიული განყოფილება | Cardiac Surgical Department |
| 17828 | გადაუდებელი განყოფილება (ER) | Emergency Department (ER) |
| 25119 | ზოგადი ქირურგიის დეპარტამენტი | General Surgery Department |
| 25612 | პოსტოპი ორი | Post-Op Two |
| 33965 | კლინიკური ონკოლოგია | Clinical Oncology |
| 36614 | შინაგან სნეულებათა დეპარტამენტი | Internal Medicine Department |
| 38129 | კოვიდ განყოფილება | COVID Department |
| 40908 | ზოგადი რეანიმაცია | General Reanimation/ICU |
| 42171 | ტრავმა ორთოპედია | Trauma Orthopedics |
| 44164 | ნეიროქირურგია | Neurosurgery |
| 50549 | ონკოლოგია | Oncology |
| 51442 | ამბულატორიული ონკოლოგია | Ambulatory Oncology |
| 55320 | ნევროლოგია | Neurology |
| 59741 | ნევროლოგიური კვლევები | Neurological Studies |
| 77934 | მიკროქირურგია | Microsurgery |
| 81437 | პლასტიკური ქირურგია | Plastic Surgery |
| 90587 | უროლოგია | Urology |
| 96800 | ჩირქოვანი ქირურგია | Purulent Surgery |

---

## Dropdown 2: Registration Type (`lak_regtype`) - 2 Options

| Value | Georgian Text | English |
|-------|---------------|---------|
| 1 | გეგმიური სტაციონარული | Planned Stationary |
| 2 | გადაუდებელი სტაციონარული | Emergency Stationary |

---

## Dropdown 3: Status/Type (`mo_stat`) - 4 Options

| Value | Georgian Text | Purpose |
|-------|---------------|---------|
| 1 | (empty) | Standard/default |
| 2 | უფასო | Free |
| 3 | კვლევის პაციენტები | Research Patients |
| 5 | პროტოკოლი: R3767-ONC-2266 | Protocol: R3767-ONC-2266 |

---

## Dropdown 4: Stationary Type (`lak_ddyastac`) - 1 Option

| Value | Georgian Text |
|-------|---------------|
| 1 | სტაციონარი |

---

## Dropdown 5: Stationary Type - All (`lak_ddyastac_all`) - 3 Options

| Value | Georgian Text | English |
|-------|---------------|---------|
| 1 | სტაციონარი | Stationary |
| 3 | გეგმიური ამბულატორია | Planned Ambulatory |
| 2 | დღის სტაციონარი | Day Hospital |

---

## Dropdown 6: Referral Type (`lak_incmtp`) - 4 Options

| Value | Georgian Text | English |
|-------|---------------|---------|
| (empty) | (empty) | No selection |
| 1 | თვითდინება | Self-referral |
| 2 | სასწრაფო | Emergency |
| 3 | გადმოყვანილია კატასტროფით | Transferred by disaster |

---

## Dropdown 7: Referrers (`mo_selsas`) - 30 Options

Ambulance and emergency medical services:

| Value | Georgian Text | English |
|-------|---------------|---------|
| (empty) | (empty) | No selection |
| 1 | 112 | 112 |
| 2 | med life | Med Life |
| 3 | გადაუდებელი სამედიცინო დახმარება | Emergency Medical Assistance |
| 4 | ჯეო-მედი | Geo-Medi |
| 5 | ტაო-მედი | Tao-Medi |
| 6 | სასწრაფო და გადაუდებელი დახმარების ცენტრი | Emergency and Urgent Assistance Center |
| 7 | კატასტროფის მედიცინის პედიატრიული ცენტრი | Disaster Medicine Pediatric Center |
| 8 | კარდიოსერვისი | Cardioservice |
| 9 | მკურნალი | Mkurnali |
| 10 | სასწრაფო და სამედიცინო დახმარების ცენტრი | Emergency and Medical Assistance Center |
| 11 | კარდიოლოგიური სასწრაფო დახმარება "გული" | Cardiological Emergency "Guli" |
| 12 | კატასტროფის მედიცინის ცენტრი | Disaster Medicine Center |
| 13 | რეფერალური დახმარების ცენტრი | Referral Assistance Center |
| 14 | med care | Med Care |
| 15 | LTD Disaster medical center | LTD Disaster Medical Center |
| 16 | ემერჯენსის სერვისი | Emergency Service |
| 17 | კარდიოექსპრესი | Cardio Express |
| 18 | აისისი-ინტენსიური ზრუნვის ცენტრი | ISIS - Intensive Care Center |
| 19 | ო. ღუდუშაურის სახ.ეროვნული სამედიცინო  ცენტრი | O. Ghudushauri National Medical Center |
| 20 | ნეო მედი | Neo Medi |
| 21 | სასწრაფო სამედიცინო დახმარება "მკურნალი" | Emergency Medical Assistance "Mkurnali" |
| 22 | გორმედი | Gormedi |
| 23 | შპს Brothers | Brothers Ltd |
| 24 | საგანგებო სიტუაციების კოორდინაციისა და გადაუდებელი დახმარების ცენტრი | Emergency Situations Coordination & Urgent Assistance Center |
| 25 | წმინდა მიქაელ მთავარანგელოზის სახელობის მრავალპროფილიანი კლინიკური საავადმყოფო | St. Michael Archangel Multiprofile Clinical Hospital |
| 26 | MediClubGeorgia | MediClubGeorgia |
| 27 | ინტენსიური ზრუნვის ცენტრი | Intensive Care Center |
| 28 | IGG | IGG |
| 29 | კატასტროფის მედიცინის ბრიგადა ქალაქი წნორი | Disaster Medicine Brigade - City of Tsnori |

---

## Dropdown 8: Sender (`ro_patsender`) - 3 Options

| Value | Georgian Text |
|-------|---------------|
| (empty) | (empty) |
| 1 | 112 |
| 2 | არქიმედეს კლინიკა სიღნაღი |

---

## Dropdown 9: Regions (`mo_regions`) - 14 Options

| Value | Code | Georgian Text |
|-------|------|---------------|
| (empty) | | No selection |
| 1 | 01 | აფხაზეთი (Abkhazia) |
| 10 | 02 | აჭარა (Adjara) |
| 17 | 03 | გურია (Guria) |
| 21 | 04 | თბილისი (Tbilisi) |
| 39 | 05 | იმერეთი (Imereti) |
| 52 | 06 | კახეთი (Kakheti) |
| 61 | 07 | მცხეთა-მთიანეთი (Mtskheta-Mtianeti) |
| 67 | 08 | რაჭა-ლეჩხუმი და ქვემო სვანეთი (Racha-Lechkhumi & Kvemo Svaneti) |
| 72 | 09 | საზღვარგარეთი (Abroad) |
| 74 | 10 | სამეგრელო და ზემო სვანეთი (Samegrelo & Zemo Svaneti) |
| 84 | 11 | სამცხე-ჯავახეთი (Samtskhe-Javakheti) |
| 91 | 12 | ქვემო ქართლი (Kvemo Kartli) |
| 99 | 13 | შიდა ქართლი (Shida Kartli) |

---

## Dropdown 10: Districts - All (`mo_raions_hid`) - 94 Options

**Complete list of all districts in Georgia**. See separate section below for full table.

---

## Dropdown 11: Districts - Tbilisi (`mo_raions`) - 18 Options

Filtered list for Tbilisi (region 04):

| Value | Code | Georgian Text |
|-------|------|---------------|
| (empty) | | No selection |
| 22 | 0401 | გლდანი (Gldani) |
| 23 | 0402 | გლდანი-ნაძალადევი (Gldani-Nadzaladevi) |
| 24 | 0403 | დიდგორი (Didgori) |
| 25 | 0404 | დიდუბე (Didube) |
| 26 | 0405 | დიდუბე-ჩუღურეთი (Didube-Chugureti) |
| 27 | 0406 | ვაკე (Vake) |
| 28 | 0407 | ვაკე-საბურთალო (Vake-Saburtalo) |
| 29 | 0408 | თბილისი (Tbilisi center) |
| 30 | 0409 | ისანი (Isani) |
| 31 | 0410 | ისანი-სამგორი (Isani-Samgori) |
| 32 | 0411 | კრწანისი (Krtsanisi) |
| 33 | 0412 | მთაწმინდა (Mtatsminda) |
| 34 | 0413 | ნაძალადევი (Nadzaladevi) |
| 35 | 0414 | საბურთალო (Saburtalo) |
| 36 | 0415 | სამგორი (Samgori) |
| 37 | 0416 | ჩუღურეთი (Chugureti) |
| 38 | 0417 | ძველი თბილისი (Old Tbilisi) |

---

## Dropdown 12: Education (`mo_ganatleba`) - 7 Options

| Value | Georgian Text | English |
|-------|---------------|---------|
| (empty) | (empty) | No selection |
| 4 | უმაღლესი განათლება | Higher Education |
| 5 | სკოლამდელი განათლება | Pre-school Education |
| 6 | საბაზისო განათლება (1-6 კლასი) | Basic Education (Grades 1-6) |
| 7 | მეორე საფეხურის განათლება (7-9 კლასი) | Secondary Education (Grades 7-9) |
| 8 | მეორე საფეხურის განათლება (9-12 კლასი) | Secondary Education (Grades 9-12) |
| 9 | პროფესიული განათლება | Vocational Education |

---

## Dropdown 13: Family Status (`no_ojaxi`) - 6 Options

| Value | Georgian Text | English |
|-------|---------------|---------|
| (empty) | (empty) | No selection |
| 1 | დასაოჯახებელი | Unmarried |
| 2 | დაოჯახებული | Married |
| 3 | განქორწინებული | Divorced |
| 4 | ქვრივი | Widowed |
| 5 | თანაცხოვრებაში მყოფი | Cohabiting |

---

## Dropdown 14: Employment (`no_dasaqmeba`) - 9 Options

| Value | Georgian Text | English |
|-------|---------------|---------|
| (empty) | (empty) | No selection |
| 1 | დასაქმებული | Employed |
| 2 | უმუშევარი | Unemployed |
| 3 | პენსიონერი | Pensioner |
| 4 | სტუდენტი | Student |
| 5 | მოსწავლე | Pupil |
| 6 | მომუშავე პენსიაზე გასვლის შემდგომ | Working after retirement |
| 7 | თვითდასაქმებული | Self-employed |
| 8 | მომუშავე სტუდენტი | Working student |

---

## Dropdown 21: Payment Type (`pavcmpto`) - 10 Options

| Value | Georgian Text | English |
|-------|---------------|---------|
| (empty) | (empty) | No selection |
| 34 | სალარო 1 | Cash Register 1 |
| 8030 | სალარო 2 | Cash Register 2 |
| 8544 | სალარო 3 | Cash Register 3 |
| 10422 | სალარო 4 | Cash Register 4 |
| 627 | ბაზის ბანკი | Basis Bank |
| 36696 | TBC | TBC Bank |
| 36697 | HALYKBANK | Halyk Bank |
| 37554 | საქართველოს ბანკი | Bank of Georgia |
| 17795 | გადმორიცხვა | Transfer |

---

## Dropdown 22: Gender (`newbo_gend`) - 3 Options

| Value | Georgian Text | English |
|-------|---------------|---------|
| (empty) | (empty) | No selection |
| 1 | მამრობითი | Male |
| 2 | მდედრობითი | Female |

---

## Dropdown 23: Month Selector (No ID) - 12 Options

| Value | Georgian Text | English |
|-------|---------------|---------|
| 0 | იან | Jan |
| 1 | თებ | Feb |
| 2 | მარ | Mar |
| 3 | აპრ | Apr |
| 4 | მაი | May |
| 5 | ივნ | Jun |
| 6 | ივლ | Jul |
| 7 | აგვ | Aug |
| 8 | სექ | Sep |
| 9 | ოქტ | Oct |
| 10 | ნოე | Nov |
| 11 | დეკ | Dec |

---

## Dropdown 24: Year Selector (No ID) - 119 Options

**Range**: 1912-2030 (119 consecutive years)

Format: `value='YYYY' text='YYYY'` for all years from 1912 to 2030.

---

## Complete Districts List (Dropdown 10: `mo_raions_hid`)

All 94 districts organized by region:

### Abkhazia (Region 01) - 8 districts
0101 - გაგრა, 0102 - გალი, 0103 - გუდაუთა, 0104 - გულრიფში, 0105 - ზემო აფხაზეთი, 0106 - ოჩამჩირე, 0107 - სოხუმი, 0108 - ტყვარჩელი

### Adjara (Region 02) - 6 districts
0201 - ბათუმი, 0202 - ქედა, 0203 - ქობულეთი, 0204 - შუახევი, 0205 - ხელვაჩაური, 0206 - ხულო

### Guria (Region 03) - 3 districts
0301 - ლანჩხუთი, 0302 - ოზურგეთი, 0303 - ჩოხატაური

### Tbilisi (Region 04) - 17 districts
0401-0417 (see Dropdown 11 above for complete list)

### Imereti (Region 05) - 12 districts
0501 - ბაღდათი, 0502 - ვანი, 0503 - ზესტაფონი, 0504 - თერჯოლა, 0505 - სამტრედია, 0506 - საჩხერე, 0507 - ტყიბული, 0508 - ქუთაისი, 0509 - წყალტუბო, 0510 - ჭიათურა, 0511 - ხარაგაული, 0512 - ხონი

### Kakheti (Region 06) - 8 districts
0601 - ახმეტა, 0602 - გურჯაანი, 0603 - დედოფლისწყარო, 0604 - თელავი, 0605 - ლაგოდეხი, 0606 - საგარეჯო, 0607 - სიღნაღი, 0608 - ყვარელი

### Mtskheta-Mtianeti (Region 07) - 5 districts
0701 - ახალგორი, 0702 - დუშეთი, 0703 - თიანეთი, 0704 - მცხეთა, 0705 - ყაზბეგი

### Racha-Lechkhumi & Kvemo Svaneti (Region 08) - 4 districts
0801 - ამბროლაური, 0802 - ლენტეხი, 0803 - ონი, 0804 - ცაგერი

### Abroad (Region 09) - 1 district
0901 - საზღვარგარეთი

### Samegrelo & Zemo Svaneti (Region 10) - 9 districts
1001 - აბაშა, 1002 - ზუგდიდი, 1003 - მარტვილი, 1004 - მესტია, 1005 - სენაკი, 1006 - ფოთი, 1007 - ჩხოროწყუ, 1008 - წალენჯიხა, 1009 - ხობი

### Samtskhe-Javakheti (Region 11) - 6 districts
1101 - ადიგენი, 1102 - ასპინძა, 1103 - ახალქალაქი, 1104 - ახალციხე, 1105 - ბორჯომი, 1106 - ნინოწმინდა

### Kvemo Kartli (Region 12) - 7 districts
1201 - ბოლნისი, 1202 - გარდაბანი, 1203 - დმანისი, 1204 - თეთრიწყარო, 1205 - მარნეული, 1206 - რუსთავი, 1207 - წალკა

### Shida Kartli (Region 13) - 8 districts
1301 - გორი, 1302 - კასპი, 1303 - ქარელი, 1304 - ქურთა, 1305 - ყორნისი, 1306 - ცხინვალი, 1307 - ხაშური, 1308 - ჯავა

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Insurance Companies | 58 (filter) / 42 (selection) |
| Insurance Types | 49 |
| Departments | 24 |
| Referrers | 30 |
| Regions | 14 |
| Districts (All) | 94 |
| Districts (Tbilisi) | 18 |
| Education Levels | 7 |
| Family Status | 6 |
| Employment Status | 9 |
| Payment Types | 10 |
| Genders | 3 |
| Months | 12 |
| Years | 119 (1912-2030) |
| **TOTAL OPTIONS** | **633** |

---

## Source Reference

- **Extraction Date**: 2025-11-10
- **Extraction Method**: Manual browser console script
- **Source Page**: Visit Edit Window (pen icon from Patient History)
- **Script Location**: `patient-history/appendices/field-extraction-script.js`

---

**End of Document**
