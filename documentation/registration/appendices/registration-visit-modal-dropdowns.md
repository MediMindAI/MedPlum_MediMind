# Registration Visit Modal - Complete Dropdown Options

**Source URL**: http://178.134.21.82:8008/index.php
**Extraction Date**: 2025-11-10 (compiled: 2025-11-16)
**Extraction Method**: Programmatic JavaScript extraction via browser console
**Total Dropdowns Documented**: 15 core dropdowns
**Total Options Extracted**: 633+

---

## Summary Table

| # | Field ID | Georgian Label | English Label | Options Count |
|---|----------|----------------|---------------|---------------|
| 1 | lak_regtype | შემოსვლის ტიპი | Admission Type | 2 |
| 2 | Ros_br | განყოფილება | Department | 24 |
| 3 | lak_ddyastac_all | სტაციონარის ტიპი | Stationary Type | 3 |
| 4 | lak_comp | კომპანია | Insurance Company | 42 |
| 5 | lak_instp | ტიპი | Insurance Type | 49 |
| 6 | mo_regions | რეგიონი | Region | 14 |
| 7 | mo_raions | რაიონი | District | 18 (Tbilisi) / 94 (All) |
| 8 | mo_ganatleba | განათლება | Education | 7 |
| 9 | no_ojaxi | ოჯახური მდგომარეობა | Family Status | 6 |
| 10 | no_dasaqmeba | დასაქმება | Employment | 9 |
| 11 | lak_incmtp | მიმართვის ტიპი | Referral Type | 4 |
| 12 | mo_selsas | მომართავი სასწრაფო | Referrer Service | 30 |
| 13 | mo_stat | სტატუსი | Status/Type | 4 |
| 14 | pavcmpto | გადახდის მეთოდი | Payment Type | 10 |
| 15 | newbo_gend | სქესი | Gender | 3 |

---

## 1. Admission Type (შემოსვლის ტიპი)

**Field ID**: `lak_regtype`
**Options**: 2

| Value | Georgian Text | English |
|-------|---------------|---------|
| 1 | გეგმიური სტაციონარული | Planned Stationary |
| 2 | გადაუდებელი სტაციონარული | Emergency Stationary |

---

## 2. Department (განყოფილება)

**Field ID**: `Ros_br`
**Options**: 24

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

## 3. Stationary Type (სტაციონარის ტიპი)

**Field ID**: `lak_ddyastac_all`
**Options**: 3

| Value | Georgian Text | English |
|-------|---------------|---------|
| 1 | სტაციონარი | Stationary |
| 2 | დღის სტაციონარი | Day Hospital |
| 3 | გეგმიური ამბულატორია | Planned Ambulatory |

---

## 4. Insurance Company (კომპანია)

**Field ID**: `lak_comp`, `lak_comp1`, `lak_comp2`
**Options**: 42
**Note**: Used for Primary, Secondary, and Tertiary insurance

| # | Value | Georgian Text | English |
|---|-------|---------------|---------|
| 1 | 0 | შიდა | Internal (Private Pay) |
| 2 | 628 | სსიპ ჯანმრთელობის ეროვნული სააგენტო | National Health Agency |
| 3 | 6379 | ს.ს. სადაზღვევო კომპანია "ჯიპიაი ჰოლდინგი" | GPI Holding Insurance |
| 4 | 6380 | ალდაგი | Aldagi |
| 5 | 6381 | სს "დაზღვევის კომპანია ქართუ" | Qartu Insurance |
| 6 | 6382 | სტანდარტ დაზღვევა | Standard Insurance |
| 7 | 6383 | სს "პსპ დაზღვევა" | PSP Insurance |
| 8 | 6384 | სს „სადაზღვევო კომპანია ევროინს ჯორჯია" | Euroins Georgia |
| 9 | 6385 | შპს სადაზღვევო კომპანია "არდი ჯგუფი" | Ardi Group Insurance |
| 10 | 7603 | აჭარის ავტონომიური რესპუბლიკის ჯანმრთელობისა და სოციალური დაცვის სამინისტრო | Adjara Ministry of Health |
| 11 | 8175 | იმედი L | Imedi L |
| 12 | 9155 | ქ. თბილისის მუნიციპალიტეტის მერია | Tbilisi Municipality |
| 13 | 10483 | სამხრეთ ოსეთის ადმინისტრაცია | South Ossetia Administration |
| 14 | 10520 | ირაო | IRAO |
| 15 | 11209 | ვია-ვიტა | Via-Vita |
| 16 | 11213 | რეფერალური დახმარების ცენტრი | Referral Assistance Center |
| 17 | 12078 | "კახეთი-იონი" | Kakheti-Ioni |
| 18 | 12461 | საქართველოს სასჯელაღსრულებისა და პრობაციის სამინისტროს სამედიცინო დეპარტამენტი | Prison & Probation Ministry Medical Dept |
| 19 | 14134 | ბინადრობის უფლება | Residence Right |
| 20 | 14137 | დაზღვევის არ მქონე | No Insurance |
| 21 | 16476 | უნისონი | Unison |
| 22 | 16803 | ალფა | Alfa |
| 23 | 22108 | IGG | IGG |
| 24 | 41288 | სს "ნიუ ვიჟენ დაზღვევა" | New Vision Insurance |
| 25 | 46299 | სადაზღვევო კომპანია გლობალ ბენეფიტს ჯორჯია | Global Benefits Georgia |
| 26 | 49974 | ინგოროყვას კლინიკა | Ingorokva Clinic |
| 27 | 51870 | ონის მუნიციპალიტეტის მერია | Oni Municipality |
| 28 | 52103 | რეფერალი ონკოლოგია | Referral Oncology |
| 29 | 54184 | შპს" თბილისის ცენტრალური საავადმყოფო" | Tbilisi Central Hospital |
| 30 | 61677 | ა(ა)იპ საქართველოს სოლიდარობის ფონდი. რეფერალური მომსახურების დეპარტამენტი | Georgia Solidarity Fund - Referral Dept |
| 31 | 61768 | ახალი მზერა | Akhali Mzera (New Sun) |
| 32 | 63054 | სს კურაციო | Curatio |
| 33 | 67209 | გერმანული ჰოსპიტალი | German Hospital |
| 34 | 67469 | რეგიონალური ჯანდაცვის ცენტრი | Regional Healthcare Center |
| 35 | 70867 | სსიპ დევნილთა, ეკომიგრანტთა და საარსებო წყაროებით უზრუნველყოფის სააგენტო | IDPs & Livelihood Agency |
| 36 | 79541 | შპს გაგრა | Gagra Ltd |
| 37 | 81614 | შპს თბილისის გულის ცენტრი | Tbilisi Heart Center |
| 38 | 86705 | კონსილიუმ მედულა | Consilium Medulla |
| 39 | 88950 | ქართულ-ამერიკული რეპროდუქციული კლინიკა რეპროარტი | Georgian-American Reproductive Clinic ReproART |
| 40 | 89213 | შპს ელიავას საერთაშორისო ფაგო თერაპიული ცენტრი | Eliava Phage Therapy Center |
| 41 | 89718 | შპს ჯეო ჰოსპიტალს | Geo Hospitals |
| 42 | 91685 | სს "საქართველოს კლინიკები" - ხაშურის ჰოსპიტალი | Georgia Clinics - Khashuri Hospital |

---

## 5. Insurance Type/Program (ტიპი)

**Field ID**: `lak_instp`, `lak_instp1`, `lak_instp2`
**Options**: 49
**Note**: Used for Primary, Secondary, and Tertiary insurance

| Value | Georgian Text | English |
|-------|---------------|---------|
| 0 | (empty) | No selection |
| 10 | საპენსიო | Pension |
| 13 | პედაგოგი | Teacher |
| 14 | უმწეო | Vulnerable/Poor |
| 15 | შშმპ | Persons with Disabilities |
| 17 | 36-2-გადაუდებალი ამბულატორია (მინიმალური) | 36-2 Emergency Ambulatory (Minimal) |
| 18 | 36-3-გადაუდებალი სტაციონარი | 36-3 Emergency Stationary |
| 19 | 36-3-გადაუდებელი სტაციონარი (მინიმალური) | 36-3 Emergency Stationary (Minimal) |
| 20 | 36-4-გეგმიური ქირურგიული მომსახურება | 36-4 Planned Surgical Service |
| 21 | 36-5-კარდიოქირურგია | 36-5 Cardiac Surgery |
| 22 | 165-2-გადაუდებელი ამბულატორია | 165-2 Emergency Ambulatory |
| 23 | 165-3-გადაუდებალი სტაციონარი | 165-3 Emergency Stationary |
| 24 | 165-4-გეგმიური ქირურგიული მომსახურება | 165-4 Planned Surgical Service |
| 25 | 165-5-კარდიოქირურგია | 165-5 Cardiac Surgery |
| 26 | 218-2-გადაუდებალი ამბულატორია | 218-2 Emergency Ambulatory |
| 27 | 218-3-გადაუდებალი სტაციონარი | 218-3 Emergency Stationary |
| 28 | 218-4-გეგმიური ქირურგიული მომსახურება | 218-4 Planned Surgical Service |
| 29 | 218-5-კარდიოქირურგია | 218-5 Cardiac Surgery |
| 30 | კორპორატიული | Corporate |
| 32 | რეფერალური მომსახურების სახელმწიფო პროგრამა | State Referral Service Program |
| 33 | ვეტერანი | Veteran |
| 36 | ქ. თბილისი მერიის სამედიცინო სერვისი | Tbilisi Mayor's Medical Service |
| 37 | სისხლძარღვოვანი მიდგომით უზრუნველყოფა | Vascular Approach Coverage |
| 38 | - | Placeholder |
| 39 | საბაზისო < 1000 | Basic < 1000 |
| 40 | საბაზისო >= 1000 | Basic >= 1000 |
| 41 | 36-2-გადაუდებელი ამბულატორია (ახალი) | 36-2 Emergency Ambulatory (New) |
| 42 | 36-2-გადაუდებალი ამბულატორია (მინიმალური) (ახალი) | 36-2 Emergency Ambulatory (Minimal) (New) |
| 43 | 36-3-გადაუდებალი სტაციონარი (ახალი) | 36-3 Emergency Stationary (New) |
| 44 | 36-3-გადაუდებელი სტაციონარი (მინიმალური) (ახალი) | 36-3 Emergency Stationary (Minimal) (New) |
| 45 | 36-4-გეგმიური ქირურგიული მომსახურება (ახალი) | 36-4 Planned Surgical Service (New) |
| 46 | 36-5-კარდიოქირურგია (ახალი) | 36-5 Cardiac Surgery (New) |
| 47 | საბაზისო > 40000 | Basic > 40000 |
| 48 | მინიმალური პაკეტი | Minimal Package |
| 49 | 70000-დან 100000 ქულამდე | 70000 to 100000 points |
| 50 | მინიმალური < 1000 | Minimal < 1000 |
| 51 | მინიმალური >= 1000 | Minimal >= 1000 |
| 52 | საბაზისო, 2017 წლის 1 იანვრის მდგომარეობით დაზღვეული | Basic, insured as of January 1, 2017 |
| 53 | საბაზისო, 2017 წლის 1 იანვრის შემდგომ დაზღვეული | Basic, insured after January 1, 2017 |
| 54 | გადაუდებელი ამბულატორია 2 | Emergency Ambulatory 2 |
| 55 | კარდიოქირურგია 5 | Cardiac Surgery 5 |
| 56 | საბაზისო 6-დან 18 წლამდე | Basic 6 to 18 years old |
| 57 | 165-სტუდენტი | 165-Student |
| 58 | DRG გეგმიური ქირურგია | DRG Planned Surgery |
| 59 | DRG გადაუდებელი სტაციონარი | DRG Emergency Stationary |
| 60 | პროგრამა რეფერალური მომსახურება, კომპონენტი ონკოლოგია-თანაგადახდა | Referral Service Program, Oncology Component - Co-payment |
| 61 | ქიმიოთერაპია და ჰორმონოთერაპია | Chemotherapy and Hormone Therapy |
| 62 | გულის ქირურგიის დამატებითი სამედიცინო მომსახურების ქვეპროგრამა | Additional Medical Service Subprogram for Heart Surgery |
| 63 | სსიპ დევნილთა,ეკომიგრანტთა და საარსებო წყაროებით უზრუნველყოფის სააგენტო | IDPs, Eco-migrants and Livelihood Agency |

---

## 6. Region (რეგიონი)

**Field ID**: `mo_regions`
**Options**: 14

| Value | Code | Georgian Text | English |
|-------|------|---------------|---------|
| (empty) | | (empty) | No selection |
| 1 | 01 | აფხაზეთი | Abkhazia |
| 10 | 02 | აჭარა | Adjara |
| 17 | 03 | გურია | Guria |
| 21 | 04 | თბილისი | Tbilisi |
| 39 | 05 | იმერეთი | Imereti |
| 52 | 06 | კახეთი | Kakheti |
| 61 | 07 | მცხეთა-მთიანეთი | Mtskheta-Mtianeti |
| 67 | 08 | რაჭა-ლეჩხუმი და ქვემო სვანეთი | Racha-Lechkhumi & Kvemo Svaneti |
| 72 | 09 | საზღვარგარეთი | Abroad |
| 74 | 10 | სამეგრელო და ზემო სვანეთი | Samegrelo & Zemo Svaneti |
| 84 | 11 | სამცხე-ჯავახეთი | Samtskhe-Javakheti |
| 91 | 12 | ქვემო ქართლი | Kvemo Kartli |
| 99 | 13 | შიდა ქართლი | Shida Kartli |

---

## 7. District (რაიონი) - Tbilisi Only

**Field ID**: `mo_raions`
**Options**: 18 (Filtered for Tbilisi)

| Value | Code | Georgian Text | English |
|-------|------|---------------|---------|
| (empty) | | (empty) | No selection |
| 22 | 0401 | გლდანი | Gldani |
| 23 | 0402 | გლდანი-ნაძალადევი | Gldani-Nadzaladevi |
| 24 | 0403 | დიდგორი | Didgori |
| 25 | 0404 | დიდუბე | Didube |
| 26 | 0405 | დიდუბე-ჩუღურეთი | Didube-Chugureti |
| 27 | 0406 | ვაკე | Vake |
| 28 | 0407 | ვაკე-საბურთალო | Vake-Saburtalo |
| 29 | 0408 | თბილისი | Tbilisi center |
| 30 | 0409 | ისანი | Isani |
| 31 | 0410 | ისანი-სამგორი | Isani-Samgori |
| 32 | 0411 | კრწანისი | Krtsanisi |
| 33 | 0412 | მთაწმინდა | Mtatsminda |
| 34 | 0413 | ნაძალადევი | Nadzaladevi |
| 35 | 0414 | საბურთალო | Saburtalo |
| 36 | 0415 | სამგორი | Samgori |
| 37 | 0416 | ჩუღურეთი | Chugureti |
| 38 | 0417 | ძველი თბილისი | Old Tbilisi |

**Note**: Complete list of 94 districts (all regions) available in `all-dropdown-options.md`

---

## 8. Education (განათლება)

**Field ID**: `mo_ganatleba`
**Options**: 7

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

## 9. Family Status (ოჯახური მდგომარეობა)

**Field ID**: `no_ojaxi`
**Options**: 6

| Value | Georgian Text | English |
|-------|---------------|---------|
| (empty) | (empty) | No selection |
| 1 | დასაოჯახებელი | Unmarried |
| 2 | დაოჯახებული | Married |
| 3 | განქორწინებული | Divorced |
| 4 | ქვრივი | Widowed |
| 5 | თანაცხოვრებაში მყოფი | Cohabiting |

---

## 10. Employment (დასაქმება)

**Field ID**: `no_dasaqmeba`
**Options**: 9

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

## 11. Referral Type (მიმართვის ტიპი)

**Field ID**: `lak_incmtp`
**Options**: 4

| Value | Georgian Text | English |
|-------|---------------|---------|
| (empty) | (empty) | No selection |
| 1 | თვითდინება | Self-referral |
| 2 | სასწრაფო | Emergency |
| 3 | გადმოყვანილია კატასტროფით | Transferred by disaster |

---

## 12. Referrer/Ambulance Service (მომართავი სასწრაფო)

**Field ID**: `mo_selsas`
**Options**: 30

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
| 19 | ო. ღუდუშაურის სახ.ეროვნული სამედიცინო ცენტრი | O. Ghudushauri National Medical Center |
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

## 13. Status/Type (სტატუსი)

**Field ID**: `mo_stat`
**Options**: 4

| Value | Georgian Text | English |
|-------|---------------|---------|
| 1 | (empty) | Standard/default |
| 2 | უფასო | Free |
| 3 | კვლევის პაციენტები | Research Patients |
| 5 | პროტოკოლი: R3767-ONC-2266 | Protocol: R3767-ONC-2266 |

---

## 14. Payment Type (გადახდის მეთოდი)

**Field ID**: `pavcmpto`
**Options**: 10

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

## 15. Gender (სქესი)

**Field ID**: `newbo_gend`
**Options**: 3

| Value | Georgian Text | English |
|-------|---------------|---------|
| (empty) | (empty) | No selection |
| 1 | მამრობითი | Male |
| 2 | მდედრობითი | Female |

---

## JavaScript Extraction Script

The following JavaScript was used to extract all dropdown options programmatically:

```javascript
// Extract all SELECT elements and their options
const getAllSelectOptions = () => {
  const selects = document.querySelectorAll('select');
  const result = {};

  selects.forEach(select => {
    const label = select.closest('div')?.querySelector('label')?.textContent ||
                  select.previousElementSibling?.textContent ||
                  select.name || select.id;

    result[label] = {
      fieldId: select.id || select.name,
      options: Array.from(select.options).map(opt => ({
        value: opt.value,
        text: opt.text.trim()
      }))
    };
  });

  return result;
};

console.log(JSON.stringify(getAllSelectOptions(), null, 2));
```

---

## Source Reference

- **EMR URL**: http://178.134.21.82:8008/index.php
- **Login**: Username: Tako, Password: FNDD1Act33
- **Modal Location**: Click on any patient entry in Registration page to open Visit Modal
- **Extraction Date**: 2025-11-10
- **Compilation Date**: 2025-11-16
- **Method**: Programmatic JavaScript DOM extraction (NOT screenshots)

---

## Related Files

- **JSON Format**: `registration-visit-modal-dropdowns.json`
- **All Dropdowns**: `/documentation/patient-history/history/appendices/all-dropdown-options.md`
- **Insurance Companies**: `/documentation/patient-history/history/appendices/insurance-companies-complete.md`
- **Insurance Types**: `/documentation/patient-history/history/appendices/insurance-types-complete.md`
- **Citizenship Options**: `/documentation/registration/appendices/citizenship-options.md`
- **Full Districts List**: `/documentation/patient-history/history/appendices/all-dropdown-options.md` (94 districts)

---

**END OF DOCUMENT**
