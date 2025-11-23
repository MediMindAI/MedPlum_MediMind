# Patient Examination Form Mapping  ფორმა №IV-200-5/ა	
# (პაციენტის გასინჯვის ფურცელი)

## Form Overview

| Property | Value |
|----------|-------|
| Form Name (Georgian) | პაციენტის გასინჯვის ფურცელი |
| Form Name (English) | Patient Examination Form |
| Form Type | Medical Examination / Gynecological Assessment |
| URL Pattern | `/index.php` with form selector |
| Form Container Class | `.olvn` |
| Total Fields | ~90 fields |
| Dropdowns | 35 |
| Checkboxes | 45 |
| Text Inputs | ~15 |
| Textareas | 4 |

---

## Section 1: Header Information
### პაციენტის გასინჯვის ფურცელი (Patient Examination Form)

| Field Label (Georgian) | Field Label (English) | Type | Required | Options/Notes |
|------------------------|----------------------|------|----------|---------------|
| პაციენტი | Patient | text | No | Underline input for patient name |
| სამედიცინო ბარათის ნომერი | Medical Card Number | text | No | Underline input |

---

## Section 2: Complaints and History

| Field Label (Georgian) | Field Label (English) | Type | Required | Options/Notes |
|------------------------|----------------------|------|----------|---------------|
| ჩივილები | Complaints | textarea | No | Large text area |
| დაავადების ანამნეზი | Disease Anamnesis | textarea | No | Large text area |

---

## Section 3: Menstrual Function
### მენსტრუალური ფუნქცია

| Field Label (Georgian) | Field Label (English) | Type | Required | Options/Values |
|------------------------|----------------------|------|----------|----------------|
| მენარხე | Menarche | text | No | Age at first menstruation |
| წლის ასაკში, ჩამოყალიბდა | Established at age | dropdown | No | 914: მაშინვე (Immediately), 915: თვის შემდეგ (After months), 916: წლის შემდეგ (After years) |
| მენსტრუალური ციკლი | Menstrual Cycle | dropdown | No | 917: არარეგულარული (Irregular), 918: რეგულარული (Regular) |
| [Cycle frequency] | Cycle Frequency | dropdown | No | 919: დღეში ერთხელ (Once a day), 920: თვეში ერთხელ (Once a month) |
| დღე | Days | text | No | Duration in days |
| [Pain level] | Pain Level | dropdown | No | 921: უმტკივნეულო (Painless), 922: მცირედ მტკივნეული (Slightly painful), 923: მტკივნეული (Painful) |
| რაოდენობა | Amount | dropdown | No | 924: მცირე (Scanty), 925: ზომიერი (Moderate), 926: ჭარბი (Heavy) |
| ბოლო მენსტრუაცია | Last Menstruation | text | No | Date field |
| ბოლოს წინა მენსტრუაცია | Previous Menstruation | text | No | Date field |
| მენსტრუალური ფუნქცია დაირღვა | Menstrual Function Disruption | checkbox + dropdown | No | 927: მენარხედან (Since menarche), 928: სქესობრივი ცხოვრების დაწყების შემდეგ (After sexual activity onset), 929: მშობიარონის შემდეგ (After childbirth), 930: აბორტის შემდეგ (After abortion), 931: სტრესის ფონზე (Due to stress) |
| მენსტრუალური ციკლის დარღვევის ხასიათი | Character of Menstrual Cycle Disorder | textarea | No | Free text |
| მენსტრუაციისწინა სინდრომი | Premenstrual Syndrome | dropdown | No | 932: აღენიშნება (Present), 933: არ აღენიშნება (Not present) |

### Premenstrual Syndrome Symptoms (Checkboxes)

| Field Label (Georgian) | Field Label (English) | Type |
|------------------------|----------------------|------|
| სართო სისუსტე | General Weakness | checkbox |
| თავის ტკივილი | Headache | checkbox |
| გულის რევა | Nausea | checkbox |
| ღებინება | Vomiting | checkbox |
| მუცლის არეში ტკივილი | Abdominal Pain | checkbox |
| ქვ.კიდურების ტკივილი | Lower Limb Pain | checkbox |
| T/A -ის მომატება | Blood Pressure Increase | checkbox |
| სარძევე ჯირკვლის შესიება/ტკივილი და სხ. | Breast Swelling/Pain etc. | checkbox + text |

---

## Section 4: Sexual Function
### სქესობრივი ფუნქცია

| Field Label (Georgian) | Field Label (English) | Type | Required | Options/Values |
|------------------------|----------------------|------|----------|----------------|
| სქესობრივი ცხოვრება | Sexual Life | text | No | Free text |
| virgo | Virgin | text | No | Label indicator |
| ქორწინებაში | In Marriage | dropdown | No | 934: არის (Yes), 935: არ არის (No) |
| ლიბიდო | Libido | dropdown | No | 998: დაქვეითებული (Decreased), 999: ზომიერი (Moderate), 1000: გაძლიერებული (Increased) |
| ორგაზმი | Orgasm | dropdown | No | 936: არის (Present), 937: არ არის (Absent) |
| სხვა | Other | text | No | Free text |

---

## Section 5: Reproductive History

| Field Label (Georgian) | Field Label (English) | Type | Required | Options/Values |
|------------------------|----------------------|------|----------|----------------|
| ორსულობის რაოდენობა | Number of Pregnancies | text | No | Numeric |
| ფიზ.მშობიარობა | Vaginal Deliveries | text | No | Numeric |
| საკეისრო კვეთა | Cesarean Sections | text | No | Numeric |
| ბოლო მშობიარობა | Last Delivery | text | No | Date |
| საშვილოსნოს გარე ორსულობა | Ectopic Pregnancy | text | No | Numeric |
| თვითნებითი აბორტი | Spontaneous Abortion | text | No | Numeric |
| ბოლო | Last (spontaneous) | text | No | Date |
| ხელოვნური აბორტი | Induced Abortion | text | No | Numeric |
| ბოლო | Last (induced) | text | No | Date |
| გართულება | Complications | dropdown | No | 938: იყო (Yes), 939: არ იყო (No) |
| კონტრაცეპციის მეთოდების გამოყენება ამჟამად | Current Use of Contraception Methods | dropdown | No | 940: დიახ (Yes), 941: არა (No) |
| რა სახის | What Type | text | No | Free text |
| კონტრაცეპტივებს | Contraceptives | dropdown | No | 942: მიმართავს (Currently using), 943: მიმართავდა (Previously used) |
| [Contraceptives description] | Contraceptives Description | textarea | No | Free text |
| მენოპაუზა | Menopause | text | No | Date/Age |

---

## Section 6: Objective Data (Status Presents)
### ობიექტური მონაცემები (status presents)

| Field Label (Georgian) | Field Label (English) | Type | Required | Options/Values |
|------------------------|----------------------|------|----------|----------------|
| კონსტიტუცია | Constitution | dropdown | No | 944: ქალური (Feminine), 945: მამაკაცური (Masculine), 946: ინფანტილური (Infantile) |
| სიმაღლე | Height | text | No | cm |
| სმ,წონა | Weight | text | No | kg |
| კგ,სმი | BMI | text | No | kg/m2 |
| წგ/თგ | [Blood Pressure] | text | No | mmHg |
| გაცხიმოვნების ტიპი | Obesity Type | dropdown | No | 947: ვისცერალური (Visceral), 948: გინოიდური (Gynoid), 949: ჰიპოთალამური (Hypothalamic), 950: ნორმალური (Normal) |
| სიმსუქნის ხარისხი | Obesity Degree | dropdown | No | 951: პირველი (First), 952: მეორე (Second), 953: მესამე (Third), 954: მეოთხე (Fourth), 955: ჭარბი წონა (Overweight) |
| წონის დეფიციტის ხარისხი | Weight Deficit Degree | dropdown | No | 956: პირველი (First), 957: მეორე (Second), 958: მესამე (Third) |
| ხილული ლორწოვანი გარსები | Visible Mucous Membranes | dropdown | No | 1001: ვარდისფერი (Pink), 1002: იქტერული (Icteric), 1003: მკრთალი (Pale) |
| კანის ფერი | Skin Color | dropdown | No | 959: თეთრი (White), 960: ხორბლისფერი (Wheat-colored) |
| კანის სტრუქტურა | Skin Structure | dropdown | No | 961: ნორმალური (Normal), 962: მშრალი (Dry), 963: ცხიმიანი (Oily), 964: შერეული (Mixed) |
| სტრიები | Striae | dropdown | No | 965: წითელი (Red), 966: მუქი ალუბლისფერი (Dark cherry), 967: ვარდისფერი (Pink), 968: თეთრი (White) |
| პიგმენტაცია | Pigmentation | dropdown + text | No | 969: არ არის (None), 970: არის შავი აკანტოზი (Black acanthosis present) |
| აკნე | Acne | dropdown | No | 971: აღენიშნება (Present), 972: არ აღენიშნება (Not present) |

### Acne Location (Checkboxes)

| Field Label (Georgian) | Field Label (English) | Type |
|------------------------|----------------------|------|
| სახეზე | On face | checkbox |
| ზურგზე | On back | checkbox |
| გულმკერდზე | On chest | checkbox |

### Acne Severity

| Field Label (Georgian) | Field Label (English) | Type | Options |
|------------------------|----------------------|------|---------|
| [Severity] | Severity | dropdown | 973: საშ.რაოდენობით (Moderate amount), 974: ჭარბად (Excessive), 975: ერთეული (Single) |

### Hirsutism (ჭარბთმიანობა) - Checkboxes

| Field Label (Georgian) | Field Label (English) | Type |
|------------------------|----------------------|------|
| არ არის | Not present | checkbox |
| არის | Present | checkbox |
| სახეზე | On face | checkbox |
| ქვედა ყბაზე | On lower jaw | checkbox |
| ბაკებზე | On sideburns | checkbox |
| მკერდზე | On chest | checkbox |
| ს/ჯ არეოლების ირგვლივ | Around breast areolas | checkbox |
| თეთრ ხაზზე | On linea alba | checkbox |
| ზურგზე | On back | checkbox |
| წელზე | On waist | checkbox |
| დუნდულოებზე | On buttocks | checkbox |
| ბარძაყებზე | On thighs | checkbox |

| Field Label (Georgian) | Field Label (English) | Type | Notes |
|------------------------|----------------------|------|-------|
| ჰირსუტული რიცხვი | Hirsutism Score | text | Ferriman-Gallwey score |
| ფარისებრი ჯირკვალი | Thyroid Gland | text | Free text description |
| სარძევე ჯირკვლები | Mammary Glands | text | Free text description |
| გალაქტორეა | Galactorrhea | dropdown | 976: არ არის (None), 977: არის (Present) |

---

## Section 7: Genital Status (Status Genitalis)
### გენიტალური სტატუსი (Status Genitalis)

| Field Label (Georgian) | Field Label (English) | Type | Required | Options/Values |
|------------------------|----------------------|------|----------|----------------|
| ბოქვენზე გათმიანება | Pubic Hair Pattern | dropdown | No | 978: ქალური (Feminine), 979: მამაკაცური (Masculine), 980: შერეული ტიპის (Mixed type) |
| გარეთა სასქესო ორგანოები | External Genitalia | dropdown | No | 981: ნორმალური განვითარების (Normal development), 982: პათოლოგიური განვითარების (Pathological development) |
| კლიტორი | Clitoris | dropdown | No | 983: არავირილიზებული (Non-virilized), 984: ვირილიზებული (Virilized) |
| დიდი სასირცხვო ბაგეები, მცირე სასირცხვო ბაგეები | Labia Majora, Labia Minora | dropdown | No | 985: პათოლოგიის გარეშე (Without pathology), 986: შეცვლილი (Changed) |
| ვულვა | Vulva | dropdown | No | 987: შეუცვლელი (Unchanged), 988: პათოლოგია (Pathology) |
| სკენეს და ბართოლინის ჯირკვლები | Skene's and Bartholin's Glands | dropdown | No | 989: შეუცვლელი (Unchanged), 990: პათოლოგია (Pathology) |

### Speculum Examination (სარკეებში)

| Field Label (Georgian) | Field Label (English) | Type |
|------------------------|----------------------|------|
| საშო - არანამშობიარევი | Vagina - Nulliparous | checkbox |
| ნამშობიარევი ქალის | Parous woman's | checkbox |
| ლორწოვანი სუფთა | Clean mucosa | checkbox |
| ვარდისფერი | Pink | checkbox |
| მცირედ ჰიპერემიული | Slightly hyperemic | checkbox |
| ჰიპერემიული | Hyperemic | checkbox |
| დაფარული ნადებით | Covered with deposits | checkbox |

| Field Label (Georgian) | Field Label (English) | Type | Options |
|------------------------|----------------------|------|---------|
| საშვილოსნოს და საშოს კედლების დაწევა | Uterine and Vaginal Wall Prolapse | dropdown | 991: არის (Present), 992: არ არის (Absent) |
| საშვილოსნოს ყელი | Cervix | dropdown | 993: კონუსური (Conical), 994: ცილინდრული (Cylindrical), 1004: ჰიპერტროფიული (Hypertrophic), 1005: ჰიპოტროფიული (Hypotrophic), 1006: დეფორმული (Deformed) |
| საშვილოსნოს ყელის ლორწოვანი | Cervical Mucosa | dropdown | 1007: ვარდისფერი (Pink), 1008: მცირედ ჰიპერემიული (Slightly hyperemic), 1009: ჰიპერემიული (Hyperemic), 1010: ციანოზური (Cyanotic) |
| ექტოპია | Ectopia | checkbox | Present/Absent |

---

## Section 8: Vaginal Examination
### ვაგინალური გასინჯვა

| Field Label (Georgian) | Field Label (English) | Type | Notes |
|------------------------|----------------------|------|-------|
| საშვილოსნოს ტანი : ზომით | Uterine Body: Size | text | Description |
| ნორმალური | Normal | checkbox | Size option |
| გადიდებული | Enlarged | checkbox | Size option |
| კვირამდე | Weeks (gestation) | text | If enlarged |
| ნორმალური | Normal | checkbox | Consistency |
| მკვრივი კონსისტენციის | Firm consistency | checkbox | |
| მოძრავი | Mobile | checkbox | Mobility |
| შეზღუდული მოძრაობაში | Restricted mobility | checkbox | |
| პალპაციით | On palpation | dropdown | 995: უმტკივნეულო (Painless), 996: მტკივნეული (Painful), 997: მგრძნობიარე (Sensitive) |

### Adnexa Examination

| Field Label (Georgian) | Field Label (English) | Type |
|------------------------|----------------------|------|
| დანამატები : მარჯვნივ | Adnexa: Right | text |
| პალპაციით უმტკივნეულო | Painless on palpation | checkbox |
| მტკივნეული | Painful | checkbox |
| მოცულობითი წარმონაქმნი | Mass | text |
| არ ვლინდება | Not detected | checkbox |
| ვლინდება | Detected | checkbox |

| Field Label (Georgian) | Field Label (English) | Type |
|------------------------|----------------------|------|
| ბიმანუალური გასინჯვა | Bimanual Examination | text |
| რექტალური გასინჯვა | Rectal Examination | text |

---

## Section 9: Organ Systems
### ორგანოთა სისტემები

| Field Label (Georgian) | Field Label (English) | Type |
|------------------------|----------------------|------|
| სასუნთქი | Respiratory | text |
| გულ-სისხლძარღვთა : არტ წნევა | Cardiovascular: Blood Pressure | text |
| პულსი | Pulse | text |
| საჭმლის მომნელებელი | Digestive | text |
| საშარდე | Urinary | text + N indicator |
| ნერვული | Nervous | text + N indicator |
| შინაგანი სეკრეციის ჯირკვლები | Endocrine Glands | text + N indicator |
| ყელ-ყურ-ცხვირი | ENT (Ear-Nose-Throat) | text + N indicator |

---

## Section 10: Partner Information
### ინფორმაცია მეუღლეზე (პარტნიორზე)

| Field Label (Georgian) | Field Label (English) | Type |
|------------------------|----------------------|------|
| გვარი და სახელი | Last Name and First Name | text |
| გადატანილი დაავადებები | Past Diseases | text |

### Spermogram Results (Checkboxes)

| Field Label (Georgian) | Field Label (English) | Type |
|------------------------|----------------------|------|
| სპერმოგრამა | Spermogram | label |
| ნორმოსპერმია | Normospermia | checkbox |
| ოლიგოსპერმია | Oligospermia | checkbox |
| აზოოსპერმია | Azoospermia | checkbox |

| Field Label (Georgian) | Field Label (English) | Type |
|------------------------|----------------------|------|
| ჩატარებული გამოკვლევები | Performed Examinations | text |
| ჩატარებული მკურნალობა | Treatment Provided | text |

---

## Section 11: Diagnosis and Recommendations

| Field Label (Georgian) | Field Label (English) | Type |
|------------------------|----------------------|------|
| წინასწარი დიაგნოზი | Preliminary Diagnosis | textarea |
| რეკომენდაცია | Recommendations | textarea |
| თარიღი | Date | text |
| ექიმი | Physician | text |

---

## Dropdown Options Reference

### Complete Dropdown Values

| Dropdown Context | Value | Georgian Text | English Translation |
|-----------------|-------|---------------|---------------------|
| Cycle Establishment | 914 | მაშინვე | Immediately |
| Cycle Establishment | 915 | თვის შემდეგ | After months |
| Cycle Establishment | 916 | წლის შემდეგ | After years |
| Cycle Regularity | 917 | არარეგულარული | Irregular |
| Cycle Regularity | 918 | რეგულარული | Regular |
| Cycle Frequency | 919 | დღეში ერთხელ | Once a day |
| Cycle Frequency | 920 | თვეში ერთხელ | Once a month |
| Pain Level | 921 | უმტკივნეულო | Painless |
| Pain Level | 922 | მცირედ მტკივნეული | Slightly painful |
| Pain Level | 923 | მტკივნეული | Painful |
| Flow Amount | 924 | მცირე | Scanty |
| Flow Amount | 925 | ზომიერი | Moderate |
| Flow Amount | 926 | ჭარბი | Heavy |
| Disruption Cause | 927 | მენარხედან | Since menarche |
| Disruption Cause | 928 | სქესობრივი ცხოვრების დაწყების შემდეგ | After sexual activity onset |
| Disruption Cause | 929 | მშობიარონის შემდეგ | After childbirth |
| Disruption Cause | 930 | აბორტის შემდეგ | After abortion |
| Disruption Cause | 931 | სტრესის ფონზე | Due to stress |
| PMS Presence | 932 | აღენიშნება | Present |
| PMS Presence | 933 | არ აღენიშნება | Not present |
| Marriage Status | 934 | არის | Yes |
| Marriage Status | 935 | არ არის | No |
| Orgasm | 936 | არის | Present |
| Orgasm | 937 | არ არის | Absent |
| Complications | 938 | იყო | Yes (was) |
| Complications | 939 | არ იყო | No (was not) |
| Contraception Use | 940 | დიახ | Yes |
| Contraception Use | 941 | არა | No |
| Contraceptive History | 942 | მიმართავს | Currently using |
| Contraceptive History | 943 | მიმართავდა | Previously used |
| Constitution | 944 | ქალური | Feminine |
| Constitution | 945 | მამაკაცური | Masculine |
| Constitution | 946 | ინფანტილური | Infantile |
| Obesity Type | 947 | ვისცერალური | Visceral |
| Obesity Type | 948 | გინოიდური | Gynoid |
| Obesity Type | 949 | ჰიპოთალამური | Hypothalamic |
| Obesity Type | 950 | ნორმალური | Normal |
| Obesity Degree | 951 | პირველი | First |
| Obesity Degree | 952 | მეორე | Second |
| Obesity Degree | 953 | მესამე | Third |
| Obesity Degree | 954 | მეოთხე | Fourth |
| Obesity Degree | 955 | ჭარბი წონა | Overweight |
| Weight Deficit | 956 | პირველი | First |
| Weight Deficit | 957 | მეორე | Second |
| Weight Deficit | 958 | მესამე | Third |
| Skin Color | 959 | თეთრი | White |
| Skin Color | 960 | ხორბლისფერი | Wheat-colored |
| Skin Structure | 961 | ნორმალური | Normal |
| Skin Structure | 962 | მშრალი | Dry |
| Skin Structure | 963 | ცხიმიანი | Oily |
| Skin Structure | 964 | შერეული | Mixed |
| Striae Color | 965 | წითელი | Red |
| Striae Color | 966 | მუქი ალუბლისფერი | Dark cherry |
| Striae Color | 967 | ვარდისფერი | Pink |
| Striae Color | 968 | თეთრი | White |
| Pigmentation | 969 | არ არის | None |
| Pigmentation | 970 | არის შავი აკანტოზი | Black acanthosis present |
| Acne Presence | 971 | აღენიშნება | Present |
| Acne Presence | 972 | არ აღენიშნება | Not present |
| Acne Severity | 973 | საშ.რაოდენობით | Moderate amount |
| Acne Severity | 974 | ჭარბად | Excessive |
| Acne Severity | 975 | ერთეული | Single |
| Galactorrhea | 976 | არ არის | None |
| Galactorrhea | 977 | არის | Present |
| Pubic Hair | 978 | ქალური | Feminine |
| Pubic Hair | 979 | მამაკაცური | Masculine |
| Pubic Hair | 980 | შერეული ტიპის | Mixed type |
| External Genitalia | 981 | ნორმალური განვითარების | Normal development |
| External Genitalia | 982 | პათოლოგიური განვითარების | Pathological development |
| Clitoris | 983 | არავირილიზებული | Non-virilized |
| Clitoris | 984 | ვირილიზებული | Virilized |
| Labia | 985 | პათოლოგიის გარეშე | Without pathology |
| Labia | 986 | შეცვლილი | Changed |
| Vulva | 987 | შეუცვლელი | Unchanged |
| Vulva | 988 | პათოლოგია | Pathology |
| Skene/Bartholin | 989 | შეუცვლელი | Unchanged |
| Skene/Bartholin | 990 | პათოლოგია | Pathology |
| Wall Prolapse | 991 | არის | Present |
| Wall Prolapse | 992 | არ არის | Absent |
| Cervix Shape | 993 | კონუსური | Conical |
| Cervix Shape | 994 | ცილინდრული | Cylindrical |
| Palpation | 995 | უმტკივნეულო | Painless |
| Palpation | 996 | მტკივნეული | Painful |
| Palpation | 997 | მგრძნობიარე | Sensitive |
| Libido | 998 | დაქვეითებული | Decreased |
| Libido | 999 | ზომიერი | Moderate |
| Libido | 1000 | გაძლიერებული | Increased |
| Mucous Membranes | 1001 | ვარდისფერი | Pink |
| Mucous Membranes | 1002 | იქტერული | Icteric |
| Mucous Membranes | 1003 | მკრთალი | Pale |
| Cervix Shape | 1004 | ჰიპერტროფიული | Hypertrophic |
| Cervix Shape | 1005 | ჰიპოტროფიული | Hypotrophic |
| Cervix Shape | 1006 | დეფორმული | Deformed |
| Cervical Mucosa | 1007 | ვარდისფერი | Pink |
| Cervical Mucosa | 1008 | მცირედ ჰიპერემიული | Slightly hyperemic |
| Cervical Mucosa | 1009 | ჰიპერემიული | Hyperemic |
| Cervical Mucosa | 1010 | ციანოზური | Cyanotic |

---

## Form Structure Summary

### Section Count: 11 sections
1. Header Information (2 fields)
2. Complaints and History (2 textareas)
3. Menstrual Function (~20 fields)
4. Sexual Function (~6 fields)
5. Reproductive History (~15 fields)
6. Objective Data / Status Presents (~25 fields)
7. Genital Status (~10 fields)
8. Vaginal Examination (~15 fields)
9. Organ Systems (~8 fields)
10. Partner Information (~6 fields)
11. Diagnosis and Recommendations (4 fields)

### Field Type Distribution
- **Text inputs**: ~40
- **Textareas**: 4
- **Dropdowns (select)**: 35
- **Checkboxes**: 45
- **Total**: ~124 form elements

---

## Screenshots Reference

Screenshots captured during mapping:
- `screenshots/form-examination-1.png` - Header and complaints section
- `screenshots/form-examination-2.png` - Menstrual function section
- `screenshots/form-examination-3.png` - Sexual function section
- `screenshots/form-examination-4.png` - Objective data section
- `screenshots/form-examination-5.png` - Genital status section
- `screenshots/form-examination-6.png` - Vaginal examination section
- `screenshots/form-examination-7.png` - Organ systems section
- `screenshots/form-examination-8.png` - Partner info and diagnosis section

---

## Technical Notes

### Form Characteristics
1. Form uses class `.olvn` as main container
2. Most fields have NO id or name attributes
3. Dropdown values use numeric codes (914-1010 range)
4. Checkboxes are unlabeled in HTML, labels are adjacent text
5. Form has dashed border styling for print layout
6. Contains "download SQL" link and print icon at bottom

### Integration Considerations
- Fields need proper IDs/names for FHIR mapping
- Dropdown values map to coded concepts
- Many fields are optional (no required attribute)
- Form is specifically designed for gynecological examinations
- Includes both subjective (history) and objective (examination) data

### FHIR Resource Mapping Suggestions
- Main form: `Observation` or `DiagnosticReport`
- Patient demographics: `Patient` resource reference
- Menstrual history: `Observation` (category: social-history)
- Reproductive history: `Condition` (pregnancy-related codes)
- Physical examination: `Observation` (vital-signs, exam)
- Diagnosis: `Condition`
- Recommendations: `CarePlan` or `ServiceRequest`

---

*Document generated: 2025-11-23*
*Source: EMR Patient Examination Form (200-/b)*
