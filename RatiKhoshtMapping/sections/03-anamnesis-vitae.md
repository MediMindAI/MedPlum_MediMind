# ANAMNESIS VITAE (ანამნეზის ვიტაე)

## Overview
The ANAMNESIS VITAE section is a comprehensive patient life history and medical background form within the Patient Card. This section collects detailed demographic information, medical history, allergies, chronic conditions, surgical procedures, blood transfusions, immunizations, screening results, and pregnancy history.



---

## Section Structure

The ANAMNESIS VITAE section is organized into the following major subsections:

1. **დემოგრაფია (Demographics)** - Patient demographic information
2. **სისხლის ჯგუფი და რეზუს ფაქტორი (Blood Group and Rh Factor)**
3. **ალერგიები (Allergies)**
   - ალერგია მედიკამენტებზე (Drug Allergies)
   - სხვა ალერგია (Other Allergies)
4. **გადატანილი დაავადებები (Past Diseases)**
5. **გადატანილი ქირურგიული ჩარევები (Past Surgical Interventions)**
6. **ქრონიკული დაავადებები (Chronic Diseases)**
7. **სისხლის გადასხმები (Blood Transfusions)**
8. **იმუნიზაცია (Immunization)**
9. **სკრინინგი (Screening)**
10. **ორსულობა (Pregnancy)** - For female patients

---

## 1. Demographics Section (დემოგრაფია)

### 1.1 Basic Patient Information

| Field Label (Georgian) | Field Name/ID | Type | Required | Validation | Notes |
|------------------------|---------------|------|----------|------------|-------|
| სახელი | - | text | Yes* | - | First name (pre-filled, editable) |
| გვარი | - | text | Yes* | - | Last name (pre-filled, editable) |
| პირადი ნომერი | - | text | No | 11-digit ID | Personal ID number (pre-filled) |
| დაბადების თარიღი | - | date | No | DD-MM-YYYY | Birth date with date picker |
| მისამართი | - | text | No | - | Address |
| იმეილი | - | text | No | Email format | Email address |
| სამუშაო ადგილი | - | text | No | - | Workplace |

**Save Button**: შენახვა (Save) - Updates basic demographic information

### 1.2 Geographic Information (READ-ONLY Fields)

| Field Label (Georgian) | Field Name/ID | Type | Disabled | Options Count | Notes |
|------------------------|---------------|------|----------|---------------|-------|
| რეგიონი | mo_regions | select | Yes | 13 regions | Region dropdown (disabled) |
| რაიონი | mo_raions | select | Yes | 107 districts | District dropdown (disabled) |
| ქალაქი | - | text | Yes | - | City (disabled) |
| ფაქტიური მისამართი | - | text | Yes | - | Actual address (disabled) |

**Region Options (13 total)**:
- 01 - აფხაზეთი (Abkhazia)
- 02 - აჭარა (Adjara)
- 03 - გურია (Guria)
- 04 - თბილისი (Tbilisi)
- 05 - იმერეთი (Imereti)
- 06 - კახეთი (Kakheti)
- 07 - მცხეთა-მთიანეთი (Mtskheta-Mtianeti)
- 08 - რაჭა-ლეჩხუმი და ქვემო სვანეთი (Racha-Lechkhumi and Kvemo Svaneti)
- 09 - საზღვარგარეთი (Abroad)
- 10 - სამეგრელო და ზემო სვანეთი (Samegrelo-Zemo Svaneti)
- 11 - სამცხე-ჯავახეთი (Samtskhe-Javakheti)
- 12 - ქვემო ქართლი (Kvemo Kartli)
- 13 - შიდა ქართლი (Shida Kartli)

**District Options**: 107 districts mapped to regions (see dropdown data for complete list)

### 1.3 Social Information (READ-ONLY Fields)

| Field Label (Georgian) | Field Name/ID | Type | Disabled | Options Count | Notes |
|------------------------|---------------|------|----------|---------------|-------|
| განათლება | mo_ganatleba | select | Yes | 6 options | Education level |
| ოჯახური მდგომარეობა | mo_ojaxi | select | Yes | 5 options | Family status |
| დასაქმება | mo_dasaqmeba | select | Yes | 8 options | Employment status |

**Education Options (განათლება)**:
1. უმაღლესი განათლება (Higher education)
2. სკოლამდელი განათლება (Preschool education)
3. საბაზისო განათლება (1-6 კლასი) (Basic education, grades 1-6)
4. მეორე საფეხურის განათლება (7-9 კლასი) (Secondary education, grades 7-9)
5. მეორე საფეხურის განათლება (9-12 კლასი) (Secondary education, grades 9-12)
6. პროფესიული განათლება (Vocational education)

**Family Status Options (ოჯახური მდგომარეობა)**:
1. დასაოჯახებელი (Single)
2. დაოჯახებული (Married)
3. განქორწინებული (Divorced)
4. ქვრივი (Widowed)
5. თანაცხოვრებაში მყოფი (Cohabiting)

**Employment Status Options (დასაქმება)**:
1. დასაქმებული (Employed)
2. უმუშევარი (Unemployed)
3. პენსიონერი (Pensioner)
4. სტუდენტი (Student)
5. მოსწავლე (Pupil/School student)
6. მომუშავე პენსიაზე გასვლის შემდგომ (Working after retirement)
7. თვითდასაქმებული (Self-employed)
8. მომუშავე სტუდენტი (Working student)

### 1.4 MOH VITAE Button

**Button**: MOH VITAE
**Purpose**: Likely generates a report or form for Ministry of Health (MOH) purposes

---

## 2. Blood Group and Rh Factor (სისხლის ჯგუფი და რეზუს ფაქტორი)

### Blood Type Selection

| Field Name/ID | Type | Options Count | Required | Notes |
|---------------|------|---------------|----------|-------|
| mo_bloodgrprh | select | 9 options | No | Blood group with Rh factor |

**Blood Group Options**:
1. IV უარყოფითი (AB Negative)
2. III უარყოფითი (B Negative)
3. II უარყოფითი (A Negative)
4. I უარყოფითი (O Negative)
5. I დადებითი (O Positive)
6. II დადებითი (A Positive)
7. III დადებითი (B Positive)
8. IV დადებითი (AB Positive)
9. უცნობია (Unknown)

**Save Action**: შენახვა link - Saves blood group selection

---

## 3. Allergies Section (ალერგიები)

### 3.1 Drug Allergies (ალერგია მედიკამენტებზე)

#### Add Drug Allergy Form

| Field Label (Georgian) | Field Name/ID | Type | Required | Validation | Notes |
|------------------------|---------------|------|----------|------------|-------|
| მედიკამენტი რომელზეც გამოვლინდა ალერგია | - | text | Yes* | - | Drug name (with search functionality) |
| - | - | button | - | - | ძებნა (Search) button for drug lookup |
| კომპონენტი რომელზეც გამოვლინდა ალერგია | mo_drugpharmgroup | select | Yes* | - | Component type causing allergy |
| ექიმის კომენტარი | - | textarea | No | - | Doctor's comments |

**Component Type Options (კომპონენტი რომელზეც გამოვლინდა ალერგია)**:
1. სავაჭრო დასახელება (Trade name)
2. გენერიკი (Generic)
3. აქტიური ნივთიერება (Active substance)
4. ფარმჯგუფი (Pharmaceutical group)

**Action Button**: დამატება (Add) - Adds drug allergy to the list

#### Drug Allergy Table

**Table Headers**:
- მედიკამენტი რომელზეც გამოვლინდა ალერგია (Drug causing allergy)
- კომპონენტი რომელზეც გამოვლინდა ალერგია (Component causing allergy)
- ექიმის კომენტარი (Doctor's comments)
- [Delete action column]

### 3.2 Other Allergies (სხვა ალერგია)

#### Add Other Allergy Form

| Field Label (Georgian) | Type | Required | Notes |
|------------------------|------|----------|-------|
| [Text input] | text | No | Free text for allergy description |
| + | button | - | Add button |

#### Other Allergy Table

**Table Headers**:
- ექიმის კომენტარი (Doctor's comments)
- [Delete action column]

---

## 4. Past Diseases (გადატანილი დაავადებები)

### Add Past Disease Form

| Field Label (Georgian) | Field Name/ID | Type | Required | Validation | Notes |
|------------------------|---------------|------|----------|------------|-------|
| ICD10 | - | text | Yes* | ICD-10 code | Autocomplete search for ICD-10 codes |
| წელი | hsel_yr | select | No | - | Year dropdown (1950-2025) |
| კლინიკური დიაგნოზი | - | textarea | No | - | Clinical diagnosis description |

**Year Range**: 1950 to 2025 (76 options)

**Action Button**: დამატება (Add) - Adds past disease to the list

### Past Diseases Table

**Table Headers**:
- ICD10
- წელი (Year)
- კლინიკური დიაგნოზი (Clinical diagnosis)
- [Delete action column]

---

## 5. Past Surgical Interventions (გადატანილი ქირურგიული ჩარევები)

### Add Surgical Intervention Form

| Field Label (Georgian) | Field Name/ID | Type | Required | Validation | Notes |
|------------------------|---------------|------|----------|------------|-------|
| NCSP | - | text | Yes* | NCSP code | Autocomplete search for NCSP procedure codes |
| წელი | ncsp_yr | select | No | - | Year dropdown (1950-2025) |
| ექიმის კომენტარი | - | textarea | No | - | Doctor's comments |

**Year Range**: 1950 to 2025 (76 options)

**Action Button**: დამატება (Add) - Adds surgical intervention to the list

### Surgical Interventions Table

**Table Headers**:
- NCSP
- წელი (Year)
- ექიმის კომენტარი (Doctor's comments)
- [Delete action column]

---

## 6. Chronic Diseases (ქრონიკული დაავადებები)

### Add Chronic Disease Form

| Field Label (Georgian) | Field Name/ID | Type | Required | Validation | Notes |
|------------------------|---------------|------|----------|------------|-------|
| ICD10 | - | text | Yes* | ICD-10 code | Autocomplete search for ICD-10 codes |
| ექიმის კომენტარი | - | textarea | No | - | Doctor's comments |

**Action Button**: დამატება (Add) - Adds chronic disease to the list

### Chronic Diseases Table

**Table Headers**:
- ICD10
- ექიმის კომენტარი (Doctor's comments)
- [Delete action column]

---

## 7. Blood Transfusions (სისხლის გადასხმები)

### Add Blood Transfusion Form

| Field Label (Georgian) | Field Name/ID | Type | Required | Options | Notes |
|------------------------|---------------|------|----------|---------|-------|
| სისხლის კომპონენტი | mo_bloodtypes | select | Yes* | 6 options | Blood component type |
| წელი | transfuz_yr | select | No | 76 options | Year dropdown (1950-2025) |
| ექიმის კომენტარი | - | textarea | No | - | Doctor's comments |

**Blood Component Options (სისხლის კომპონენტი)**:
1. ერითროციტული მასა (Red blood cell mass)
2. თრომბოციტული მასა (Platelet mass)
3. ახლადგაყინული პლაზმა (Fresh frozen plasma)
4. მთლიანი სისხლი (Whole blood)
5. კრიოპრეციპიტატი (Cryoprecipitate)
6. სხვა (Other)

**Year Range**: 1950 to 2025 (76 options)

**Action Button**: დამატება (Add) - Adds blood transfusion to the list

### Blood Transfusions Table

**Table Headers**:
- გადასხმის თარიღი (Transfusion date)
- სისხლის კომპონენტი (Blood component)
- ექიმის კომენტარი (Doctor's comments)
- [Delete action column]

---

## 8. Immunization (იმუნიზაცია)

### Add Immunization Form

| Field Label (Georgian) | Field Name/ID | Type | Required | Options | Notes |
|------------------------|---------------|------|----------|---------|-------|
| იმუნიზაციის დასახელება | mo_imuniztypes | select | Yes* | 10 options | Immunization type |
| წელი | imuniz_yr | select | No | 76 options | Year dropdown (1950-2025) |
| ვაქცინის დასახელება | - | text | No | - | Vaccine name |

**Immunization Type Options (იმუნიზაციის დასახელება)**:
1. ტუბერკულოზის აცრები (Tuberculosis vaccinations)
2. დიფთერიის-ყივანახველას-ტეტანუსის -Bჰეპ-ჰიb -იპვ აცრები (DTP-HepB-Hib-IPV vaccinations)
3. როტავირუსული ინფექციის აცრები (Rotavirus infection vaccinations)
4. პნევმოკოკური ინფექციის აცრები (Pneumococcal infection vaccinations)
5. ოპვ აცრები (OPV vaccinations)
6. დიფთერიის-ყივანახველას-ტეტანუსის აცრები (DTP vaccinations)
7. დიფთერიის-ტეტანუსის აცრები (DT vaccinations)
8. წითელას, წითურას და ყბაყურას აცრები (Measles, rubella, and mumps vaccinations)
9. B ჰეპატიტის აცრები (Hepatitis B vaccinations)
10. სხვა იმუნობიოლოგიური პრეპარატებით აცრები (იმუნოგლობულინი, შრატი, სხვა ვაქცინები) (Other immunobiological preparations - immunoglobulin, serum, other vaccines)

**Year Range**: 1950 to 2025 (76 options)

**Action Button**: დამატება (Add) - Adds immunization to the list

### Immunization Table

**Table Headers**:
- იმუნიზაციის თარიღი (Immunization date)
- იმუნიზაციის დასახელება (Immunization name)
- ვაქცინის დასახელება (Vaccine name)
- [Delete action column]

---

## 9. Screening (სკრინინგი)

### Add Screening Form

| Field Label (Georgian) | Field Name/ID | Type | Required | Options | Notes |
|------------------------|---------------|------|----------|---------|-------|
| სკრინინგის დასახელება | - | select | Yes* | 1 option | Screening type (currently only Hepatitis C) |
| წელი | - | select | No | 76 options | Year dropdown (1950-2025) |
| შედეგი | - | select | Yes* | 2 options | Result (Positive/Negative) |

**Screening Type Options (სკრინინგის დასახელება)**:
- ც ჰეპატიტი (Hepatitis C)

**Result Options (შედეგი)**:
1. დადებითი (Positive)
2. უარყოფითი (Negative)

**Year Range**: 1950 to 2025 (76 options)

**Action Button**: დამატება (Add) - Adds screening result to the list

### Screening Table

**Table Headers**:
- თარიღი (Date)
- სკრინინგის დასახელება (Screening name)
- შედეგი (Result)
- [Delete action column]

---

## 10. Pregnancy (ორსულობა)

**Note**: This section appears only for female patients

### Pregnancy Information Form

| Field Label (Georgian) | Type | Required | Validation | Notes |
|------------------------|------|----------|------------|-------|
| ორსულობების რაოდენობა | text/number | No | Numeric | Number of pregnancies |
| მშობიარობების რაოდენობა | text/number | No | Numeric | Number of childbirths |

**Save Button**: შენახვა (Save) - Saves pregnancy information

---

## Field Naming Conventions

Based on the extracted data, the system uses the following ID/name conventions:

### Select Field IDs:
- `mo_regions` - Region dropdown
- `mo_raions` - District dropdown
- `mo_ganatleba` - Education dropdown
- `mo_ojaxi` - Family status dropdown
- `mo_dasaqmeba` - Employment dropdown
- `mo_bloodgrprh` - Blood group and Rh factor
- `mo_drugpharmgroup` - Drug allergy component type
- `mo_bloodtypes` - Blood component type
- `mo_imuniztypes` - Immunization type
- `hsel_yr` - Past disease year
- `ncsp_yr` - Surgical intervention year
- `transfuz_yr` - Blood transfusion year
- `imuniz_yr` - Immunization year

### Other Field Patterns:
- Demographics use simple text inputs without specific IDs visible
- Most fields use Georgian labels directly
- Autocomplete fields for ICD10 and NCSP codes use placeholder text "ICD10 ძებნა" and "NCSP ძებნა"

---

## Data Validation Rules

### Required Fields:
- Fields marked with * are required in their respective forms
- Drug allergies require drug name and component type
- Past diseases require ICD10 code
- Surgical interventions require NCSP code
- Chronic diseases require ICD10 code
- Blood transfusions require blood component type
- Immunizations require immunization type
- Screening requires screening type and result

### Format Validation:
- Birth date: DD-MM-YYYY format
- Personal ID: 11-digit numeric
- Email: Standard email format
- Year fields: 1950-2025 range

### Data Integrity:
- All dropdown menus have defined option sets
- Year dropdowns are consistently 76 options (1950-2025)
- Disabled fields are read-only and cannot be modified in this section

---

## Workflow

### Typical User Flow:

1. **View Demographics**: Review pre-filled patient information
2. **Update Basic Info**: Edit name, address, email, workplace if needed
3. **Save Demographics**: Click შენახვა (Save) button
4. **Set Blood Type**: Select blood group and Rh factor, click შენახვა
5. **Add Allergies**:
   - Search for medications and add drug allergies
   - Add free-text other allergies
6. **Document Medical History**:
   - Add past diseases with ICD10 codes
   - Add past surgical interventions with NCSP codes
   - Add chronic diseases with ICD10 codes
7. **Record Transfusions**: Add blood transfusion history if applicable
8. **Document Immunizations**: Add vaccination records
9. **Add Screening Results**: Record screening test results
10. **Pregnancy Info** (female patients): Enter pregnancy and childbirth counts

### Action Buttons:
- **შენახვა (Save)**: Appears in Demographics and Blood Group sections - saves current section data
- **დამატება (Add)**: Appears in all list-based sections - adds new entry to respective table
- **MOH VITAE**: Generates Ministry of Health report
- **ძებნა (Search)**: Drug search functionality
- **[Delete icons]**: Remove entries from tables

---

## Integration Points

### Data Sources:
- **ICD10 Database**: Autocomplete for disease codes
- **NCSP Database**: Autocomplete for procedure codes
- **Drug Database**: Search functionality for medications
- **Geographic Data**: Regions and districts hierarchy

### Data Relationships:
- Demographics link to patient registration data
- Medical history integrates with clinical documentation
- Allergies connect to prescription and treatment modules
- Blood type information critical for transfusion management

---

## Notes

1. **Read-Only Fields**: Geographic information (region, district, city, actual address) and social information (education, family status, employment) are disabled and cannot be edited in this section. These may be managed elsewhere in the system.

2. **Autocomplete Search**: ICD10 and NCSP fields use autocomplete functionality with placeholder text indicating search capability.

3. **Year Dropdowns**: Consistent 76-year range (1950-2025) across all historical data entry forms.

4. **Table Management**: All list-based sections (allergies, diseases, surgeries, etc.) follow a consistent pattern:
   - Form above table for adding new entries
   - Table below displaying existing entries
   - Delete action for each entry

5. **Georgian Language**: All interface elements use Georgian language exclusively in this section.

6. **Patient Gender Logic**: Pregnancy section visibility depends on patient gender (displayed only for female patients).

7. **MOH Compliance**: Presence of "MOH VITAE" button suggests integration with Ministry of Health reporting requirements.

8. **Data Persistence**: Each subsection has its own save/add mechanism - changes are saved per subsection, not globally.

---

## Technical Implementation Notes

### Total UI Elements Captured:
- **156 input fields** (text, select, textarea, button, checkbox)
- **23 dropdown menus** (select elements)
- **27 tables** (for displaying data lists)

### Dropdown Options Summary:
- Regions: 13 options
- Districts: 107 options (hierarchical based on region)
- Education: 6 options
- Family Status: 5 options
- Employment: 8 options
- Blood Group: 9 options
- Drug Component Types: 4 options
- Blood Component Types: 6 options
- Immunization Types: 10 options
- Year Ranges: 76 options each (1950-2025)
- Screening Types: 1 option (Hepatitis C)
- Screening Results: 2 options (Positive/Negative)

### Form Structure:
- Multiple independent subsections within single page view
- Mix of editable and read-only fields
- Combination of single-save (Demographics, Blood Group) and add-to-list (all history sections) patterns
- Consistent Georgian labeling throughout


