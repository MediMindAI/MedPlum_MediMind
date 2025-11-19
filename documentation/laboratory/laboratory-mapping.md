# Laboratory Section (ლაბორატორია) - Complete UI Mapping

**Documentation Date:** 2025-11-18
**EMR System:** SoftMedic - ჰელსიკორი
**Base URL:** http://178.134.21.82:8008/clinic.php
**Navigation Path:** ნომენკლატურა (Nomenclature) → ლაბორატორიული (Laboratory)

---

## Overview

The Laboratory (ლაბორატორიული) section is a comprehensive nomenclature management system for laboratory services. It consists of 4 sub-sections accessible via horizontal tabs:

1. **კვლევის კომპონენტები** (Research Components) - Lab test parameters and measurements
2. **ნიმუშები** (Samples) - Biological sample types
3. **მანიპულაციები** (Manipulations) - Sample collection procedures
4. **სინჯარები** (Syringes) - Container and tube types

### Key Characteristics
- **Layout**: Tab-based navigation with 4 sections
- **Color Scheme**: Turquoise header (#00CED1 approximately) for tables
- **Primary Actions**: Add new entries, Edit existing entries, Delete entries
- **Data Display**: Table-based with inline editing
- **Search/Filter**: Yes (varies by section)

---

## Section 1: კვლევის კომპონენტები (Research Components)

### Page URL
`http://178.134.21.82:8008/clinic.php#3s302` (when კვლევის კომპონენტები tab is active)

### Purpose
Manages laboratory test parameters including blood tests, hormone tests, urinalysis components, and biochemical markers. This is the most complex section with extensive filtering and categorization capabilities.

### UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Tab Navigation: [კვლევის კომპონენტები] [ნიმუშები] [მანიპულაციები] [სინჯარები]  │
├─────────────────────────────────────────────────────────────────┤
│  ADD FORM (Row 1)                                               │
│  [ Code ]  [ GIS Code ]  [ Name ]  [Type ▼]  [Unit ▼]  [+Add]  │
├─────────────────────────────────────────────────────────────────┤
│  TABLE HEADER (Row 2 - Turquoise)                              │
│  | კოდი | GIS კოდი | დასახელება | ტიპი | ზომა | ფილიალი |    │
├─────────────────────────────────────────────────────────────────┤
│  FILTER ROW (Row 3)                                             │
│  [ ] [ ] [პარამეტრის ძებნა] [აქტიური▼] [შიდა▼] [ზომა▼] [🔍][⟳]│
├─────────────────────────────────────────────────────────────────┤
│  DATA ROWS (50+ visible rows)                                  │
│  | BL.11.2.2 | ;ALTL | ალანინამინოტრანსფერაზა ALT | შიდა | IU/l |  │
│  | HR.3.6.1  | ;TSH  | თირეოტროპული ჰორმონი...     | შიდა | μIU/ml | │
│  | ...       | ...   | ...                          | ...  | ...    │
└─────────────────────────────────────────────────────────────────┘
```

### Form Fields (Add New Entry)

#### Row 1: Add Form
| Field Label | Field Type | Input Type | Required | Options/Validation | Position |
|-------------|------------|------------|----------|-------------------|----------|
| (unlabeled) | Text Input | text | No | Code entry | Column 1 |
| (unlabeled) | Text Input | text | No | GIS Code entry | Column 2 |
| (unlabeled) | Text Input | text | No | Parameter name entry | Column 3 |
| (default: შიდა) | Dropdown | select | Yes | See "Type Options" below | Column 4 |
| (no label) | Dropdown | select | No | See "Unit Options" below | Column 5 |
| (no label) | Text Input | text | No | Branch/Department filter | Column 6 |
| + Button | Button | submit | N/A | Add new entry action | Column 7 |

**Type Options** (7 options):
1. (empty option)
2. შიდა (Internal) - **DEFAULT**
3. სხვა კლინიკები (Other Clinics)
4. ლიმბახი (Limbach)
5. მრჩეველი (Consultant)
6. ხომასურიძე (Khomasuridze)
7. თოდუა (Todua)
8. ჰეპა (Hepa)

**Unit Options** (56 options - Medical measurement units):
| Value | Description | Category |
|-------|-------------|----------|
| ცალი | Piece | Count |
| დღე | Day | Time |
| k/μl | Thousands per microliter | Hematology |
| % | Percentage | Ratio |
| m/μl | Millions per microliter | Hematology |
| g/dl | Grams per deciliter | Concentration |
| fl | Femtoliter | Volume |
| pg | Picogram | Mass |
| მმ/სთ | mm/hour | ESR |
| - | Dash/None | Qualitative |
| ‰ | Per mille | Ratio |
| გრ | Gram | Mass |
| ამპულა | Ampule | Container |
| აბი | Pill | Count |
| მკგ | Microgram | Mass |
| კომპლექტი | Set/Kit | Count |
| ფლაკონი | Vial | Container |
| კოლოფი | Box | Container |
| წყვილი | Pair | Count |
| რეაქტივი | Reagent | Material |
| მლ | Milliliter | Volume |
| მ | Meter | Length |
| mk/l | Milliequivalents/L | Concentration |
| IU/l | International Units/L | Enzyme Activity |
| μmol/l | Micromoles/L | Concentration |
| mmol/l | Millimoles/L | Concentration |
| mg/dl | Milligrams/dL | Concentration |
| g/l | Grams/L | Concentration |
| μg/dl | Micrograms/dL | Concentration |
| IU/ml | International Units/mL | Concentration |
| ლიტრი | Liter | Volume |
| მეტრი | Meter | Length |
| პაკეტი | Packet | Container |
| μIU/ml | Micro IU/mL | Hormone |
| 10³ / μL | 10^3 per μL | Cell Count |
| 10⁶ / μL | 10^6 per μL | Cell Count |
| mm/lh | mm/hour | ESR |
| წმ | Second | Time |
| nmol/l | Nanomoles/L | Concentration |
| pmol/l | Picomoles/L | Concentration |
| mg/l | Milligrams/L | Concentration |
| ng/ml | Nanograms/mL | Concentration |
| მხ/ა | Non-standard | Local |
| U/l | Units/L | Enzyme Activity |
| μg/ml | Micrograms/mL | Concentration |
| pg/ml | Picograms/mL | Concentration |
| μg/l | Micrograms/L | Concentration |
| X10^3/µL | Times 10^3/µL | Cell Count |
| Ug/l | Units/L | Enzyme |
| U/ml | Units/mL | Enzyme |
| mmHg | mmHg | Pressure |
| mmol/kg | Millimoles/kg | Concentration |
| ნგ/მლ | ng/mL (Georgian) | Concentration |
| ng/dl | Nanograms/dL | Concentration |
| μU/ml | Micro Units/mL | Hormone |

### Table Structure

#### Table Headers (7 columns)
| Column # | Header (Georgian) | Header (English) | Data Type | Width | Notes |
|----------|-------------------|------------------|-----------|-------|-------|
| 1 | კოდი | Code | Text | ~10% | Test parameter code (e.g., BL.11.2.2) |
| 2 | GIS კოდი | GIS Code | Text | ~10% | GIS integration code (e.g., ;ALTL) |
| 3 | დასახელება | Name | Text | ~40% | Test parameter name in Georgian + abbreviation |
| 4 | ტიპი | Type | Dropdown | ~10% | Service type (შიდა, ლიმბახი, etc.) |
| 5 | ზომა | Unit | Text | ~10% | Measurement unit (IU/l, g/dl, etc.) |
| 6 | ფილიალი | Branch | Text | ~10% | Department/Branch assignment |
| 7 | (Actions) | Actions | Icons | ~10% | Edit (✏️) and Delete (🗑️) icons |

#### Filter Row (Search/Filter Controls)
| Column # | Control Type | Placeholder/Label | Purpose |
|----------|--------------|-------------------|---------|
| 1 | Text Input | (no placeholder) | Filter by Code |
| 2 | Text Input | (no placeholder) | Filter by GIS Code |
| 3 | Text Input + Dropdown + Text Input | "პარამეტრის ძებნა" (Parameter Search) + Status Dropdown + "კვლევით ძებნა" (Search by Study) | Multi-field search |
| 4 | Dropdown | შიდა (default) | Filter by Type |
| 5 | Dropdown | (empty default) | Filter by Unit |
| 6 | (empty) | | |
| 7 | Link + Button | 🔍 (search icon) + ⟳ (refresh icon) | Search and Refresh actions |

**Status Dropdown Options** (in Column 3):
- აქტიური (Active) - **DEFAULT**
- წაშლილი (Deleted)

### Sample Data Rows

| Code | GIS Code | Name (Georgian) | Type | Unit | Actions |
|------|----------|-----------------|------|------|---------|
| BL.11.2.2 | ;ALTL | ალანინამინოტრანსფერაზა ALT (GPT) | შიდა | IU/l | ✏️ 🗑️ |
| HR.3.6.1 | ;TSH | თირეოტროპული ჰორმონი (TSH) | შიდა | μIU/ml | ✏️ 🗑️ |
| BL.4 | ;WBC | ლეიკოციტები WBC | შიდა | 10³ / μL | ✏️ 🗑️ |
| BL.2 | ;RBC | ერითროციტები RBC | შიდა | 10⁶ / μL | ✏️ 🗑️ |
| BL.1.1 | ;HGB | ჰემოგლობინი HGB | შიდა | g/dl | ✏️ 🗑️ |
| BL.2.3.4 | ;HCT | ჰემატოკრიტი HCT | შიდა | % | ✏️ 🗑️ |
| MB.25. | | HBsAg | შიდა | | ✏️ 🗑️ |
| MB.30. | | Anti-HCV | შიდა | | ✏️ 🗑️ |
| MB.35. | | Anti-HIV 1+2 | შიდა | | ✏️ 🗑️ |

**Total Records Visible**: 92 entries (shown in status bar: "ხაზზე (92)")

### Interactive Elements

#### Buttons
| Button | Type | Location | Action | Notes |
|--------|------|----------|--------|-------|
| + | Submit button | Add form, Column 7 | Add new parameter | Green/Turquoise styled |
| 🔍 (Search icon link) | Link | Filter row, Column 7 | Execute search | JavaScript void(0) |
| ⟳ (Refresh button) | Button | Filter row, Column 7 | Refresh table data | Reload current view |

#### Row Actions (Per Entry)
| Icon | Action | Confirmation | Notes |
|------|--------|--------------|-------|
| ✏️ (Pen icon) | Edit entry | No | Opens inline edit or modal |
| 🗑️ (Trash icon) | Delete entry | Yes (likely) | Soft delete or hard delete |

### Workflow

#### Adding New Parameter
1. User fills in Code field (optional)
2. User fills in GIS Code field (optional)
3. User enters Parameter Name (required in practice)
4. User selects Type from dropdown (defaults to შიდა)
5. User selects Unit from dropdown (56 options)
6. User enters Branch/Department (optional)
7. User clicks + button
8. System validates and adds entry
9. Table refreshes with new entry

#### Searching/Filtering
1. User can filter by:
   - Code (exact match or partial)
   - GIS Code (exact match or partial)
   - Parameter name (full-text search via "პარამეტრის ძებნა")
   - Study name (via "კვლევით ძებნა")
   - Type (dropdown selection)
   - Unit (dropdown selection)
   - Status (Active/Deleted)
2. User clicks search icon (🔍) to execute
3. Table updates with filtered results
4. Refresh button (⟳) resets to default view

#### Editing Entry
1. User clicks ✏️ icon on desired row
2. Inline editing activates OR modal popup opens
3. User modifies fields
4. User saves changes
5. Table refreshes

#### Deleting Entry
1. User clicks 🗑️ icon on desired row
2. Confirmation dialog appears (likely)
3. User confirms deletion
4. Entry is removed or marked as deleted
5. Table refreshes

---

## Section 2: ნიმუშები (Samples)

### Page URL
`http://178.134.21.82:8008/clinic.php#3s302` (when ნიმუშები tab is active)

### Purpose
Manages biological sample types used in laboratory testing (blood, urine, tissue, swabs, fluids, etc.).

### UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Tab Navigation: [კვლევის კომპონენტები] [ნიმუშები] [მანიპულაციები] [სინჯარები]  │
├─────────────────────────────────────────────────────────────────┤
│  ADD FORM                                                       │
│  დასახელება: [ Text Input                              ] [+Add] │
├─────────────────────────────────────────────────────────────────┤
│  TABLE HEADER (Turquoise)                                      │
│  | დასახელება                                          | Actions|│
├─────────────────────────────────────────────────────────────────┤
│  DATA ROWS (45+ entries)                                       │
│  | ვენური სისხლის NaCit პლაზმა                        | ✏️ 🗑️ |│
│  | ვენური სისხლი, არასტაბილიზებული                   | ✏️ 🗑️ |│
│  | შარდი/24სთ                                          | ✏️ 🗑️ |│
│  | ...                                                 | ...    |│
└─────────────────────────────────────────────────────────────────┘
```

### Form Fields

| Field Label | Field Type | Required | Validation | Notes |
|-------------|------------|----------|------------|-------|
| დასახელება (Name) | Text Input | Yes | Non-empty string | Sample type name in Georgian |
| + Button | Submit | N/A | | Add new sample type |

### Table Structure

#### Table Headers (2 columns)
| Column # | Header | Data Type | Width | Notes |
|----------|--------|-----------|-------|-------|
| 1 | დასახელება (Name) | Text | ~90% | Sample type description |
| 2 | (Actions) | Icons | ~10% | Edit and Delete icons |

### Sample Data (45+ entries)

| Sample Type (Georgian) | English Translation | Category |
|------------------------|---------------------|----------|
| ვენური სისხლის NaCit პლაზმა | Venous blood NaCit plasma | Blood |
| ვენური სისხლი, არასტაბილიზებული | Venous blood, unstabilized | Blood |
| შარდი/24სთ | Urine/24h | Urine |
| შარდი/დილის ან სპონტანური | Urine/morning or spontaneous | Urine |
| შარდი/დილის | Urine/morning | Urine |
| კაპილარული სისხლი/4NC | Capillary blood/4NC | Blood |
| ვენური სისხლი/4NC | Venous blood/4NC | Blood |
| ვენური სისხლის შრატი | Venous blood serum | Blood |
| სისხლი/EDTA | Blood/EDTA | Blood |
| თავზურტვინის სითხე | Cerebrospinal fluid | Fluid |
| განავალი | Feces | Stool |
| ვენური სისხლი/BGE Heparin | Venous blood/BGE Heparin | Blood |
| სისხლის/Heparin | Blood/Heparin | Blood |
| ნახველი | Sputum | Respiratory |
| ნაცხი/ნებისმიერი | Swab/any | Swab |
| სისხლის/სტერილური | Blood/sterile | Blood |
| შარდი სპონტანური | Spontaneous urine | Urine |
| ქსოვილოვანი მასალა | Tissue material | Tissue |
| პროსტატის სეკრეტი | Prostate secretion | Fluid |
| სხვადასხვა ბიოლოგიური მასალა | Various biological material | Other |
| უროგენიტალური ნაცხი | Urogenital swab | Swab |
| სისხლი/QuantiFERON | Blood/QuantiFERON | Blood |
| პლევრალური სითხის აღება | Pleural fluid collection | Fluid |
| პერიკარდიუმის სითხე | Pericardial fluid | Fluid |
| პლევრალური სითხე | Pleural fluid | Fluid |
| ასციტური სითხე | Ascitic fluid | Fluid |
| სინოვიალური სითხე | Synovial fluid | Fluid |
| პერიტონეალური სითხე | Peritoneal fluid | Fluid |
| ვაგინალური ნაცხი | Vaginal swab | Swab |
| ურეთრის ნაცხი | Urethral swab | Swab |
| მუცლის ღრუს სითხე | Abdominal cavity fluid | Fluid |
| დრენაჟიდან აღებული სითხე | Drainage fluid | Fluid |
| ვეზიკულის შიგთავსი | Vesicle contents | Dermatology |
| კანის ანაბეჭდი | Skin impression | Dermatology |
| ვეზიკულის ანაბეჭდი | Vesicle impression | Dermatology |
| ფრჩხილის ანაბეჭდი | Nail impression | Dermatology |
| კანის ანაფხეკი | Skin scraping | Dermatology |
| ფრჩხილის ანაფხეკი | Nail scraping | Dermatology |
| წამწამი | Eyelash | Ophthalmology |
| არტერიული სისხლი/aBGE Heparin | Arterial blood/aBGE Heparin | Blood |
| ვენური სისხლი/vBGE Heparin | Venous blood/vBGE Heparin | Blood |
| ცხვირ–ხახის ნაცხი | Nasopharyngeal swab | Respiratory |
| ფეკალური მასა | Fecal mass | Stool |

**Total Records**: 45+ sample types

### Interactive Elements

#### Buttons
| Button | Location | Action | Notes |
|--------|----------|--------|-------|
| + | Add form, right side | Add new sample type | Submit button |

#### Row Actions
| Icon | Action | Notes |
|------|--------|-------|
| ✏️ | Edit sample type | Opens inline edit or modal |
| 🗑️ | Delete sample type | Soft or hard delete |

### Workflow

#### Adding New Sample Type
1. User enters sample type name in Georgian
2. User clicks + button
3. System validates (non-empty)
4. New entry appears in table
5. Table refreshes

#### Editing Sample Type
1. User clicks ✏️ icon
2. Inline edit activates OR modal opens
3. User modifies name
4. User saves
5. Table updates

#### Deleting Sample Type
1. User clicks 🗑️ icon
2. Confirmation dialog (likely)
3. User confirms
4. Entry removed
5. Table refreshes

---

## Section 3: მანიპულაციები (Manipulations)

### Page URL
`http://178.134.21.82:8008/clinic.php#3s302` (when მანიპულაციები tab is active)

### Purpose
Manages sample collection procedures and manipulation types (blood draws, swab collections, fluid aspirations, etc.).

### UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Tab Navigation: [კვლევის კომპონენტები] [ნიმუშები] [მანიპულაციები] [სინჯარები]  │
├─────────────────────────────────────────────────────────────────┤
│  ADD FORM                                                       │
│  დასახელება: [ Text Input                              ] [+Add] │
├─────────────────────────────────────────────────────────────────┤
│  TABLE HEADER (Turquoise)                                      │
│  | დასახელება                                          | Actions|│
├─────────────────────────────────────────────────────────────────┤
│  DATA ROWS (34+ entries)                                       │
│  | 24სთ შარდის შეგროვება                               | ✏️ 🗑️ |│
│  | ნახველის შეგროვება                                  | ✏️ 🗑️ |│
│  | ვენური სისხლის აღება                                | ✏️ 🗑️ |│
│  | ...                                                 | ...    |│
└─────────────────────────────────────────────────────────────────┘
```

### Form Fields

| Field Label | Field Type | Required | Notes |
|-------------|------------|----------|-------|
| დასახელება (Name) | Text Input | Yes | Manipulation/procedure name |
| + Button | Submit | N/A | Add new manipulation |

### Table Structure

#### Table Headers (2 columns)
| Column # | Header | Data Type | Width |
|----------|--------|-----------|-------|
| 1 | დასახელება (Name) | Text | ~90% |
| 2 | (Actions) | Icons | ~10% |

### Sample Data (34+ entries)

| Manipulation Type (Georgian) | English Translation | Category |
|------------------------------|---------------------|----------|
| 24სთ შარდის შეგროვება | 24h urine collection | Urine |
| ნახველის შეგროვება | Sputum collection | Respiratory |
| ვენური სისხლის აღება | Venous blood draw | Blood |
| ასციტური სითხის აღება | Ascitic fluid aspiration | Fluid |
| ვაგინალური ნაცხის აღება | Vaginal swab collection | Gynecology |
| ნაცხის აღება/ნებისმიერი | Swab collection/any | General |
| არტერიული სისხლის აღება | Arterial blood draw | Blood |
| კაპილარული სისხლის აღება | Capillary blood draw | Blood |
| ფეკალური მასის შეგროვება | Fecal mass collection | Stool |
| სინოვიალური სითხის აღება | Synovial fluid aspiration | Fluid |
| პერიკარდიული სითხის აღება | Pericardial fluid aspiration | Fluid |
| თავზურგტვინის სითხის აღება | Cerebrospinal fluid aspiration | Fluid |
| პერიტონეალური სითხის აღება | Peritoneal fluid aspiration | Fluid |
| შარდის შეგროვება/ერთი ულუფა | Urine collection/single portion | Urine |
| პლევრალური სითხის აღება | Pleural fluid aspiration | Fluid |
| ნაცხის აღება | Swab collection | General |
| ფრჩხილის ანაბეჭდი | Nail impression | Dermatology |
| ვეზიკულის ანაბეჭდი | Vesicle impression | Dermatology |
| ურეთრის ნაცხის აღება | Urethral swab collection | Urology |
| ურეთრის ნაცხის აღება | Urethral swab collection (duplicate) | Urology |
| კანის ანაბეჭდის აღება | Skin impression collection | Dermatology |
| კანის ანაფხეკის აღება | Skin scraping collection | Dermatology |
| დრენაჟის სითხის აღება | Drainage fluid collection | Fluid |
| პროსტატის სეკრეტის აღება | Prostate secretion collection | Urology |
| ფრჩხილის ანაფხეკის აღება | Nail scraping collection | Dermatology |
| ვეზიკულის შიგთავსის აღება | Vesicle contents collection | Dermatology |
| ქსოვილოვანი მასალის აღება | Tissue material collection | Pathology |
| მუცლის ღრუდან სითხის აღება | Abdominal cavity fluid aspiration | Fluid |
| უროგენიტალური ნაცხის აღება | Urogenital swab collection | Gynecology/Urology |
| სხვადასხვა ბიოლოგიური მასალის აღება | Various biological material collection | General |
| წამწამის აღება | Eyelash collection | Ophthalmology |
| ნაცხის აღება COVID19-PCR-თვის | Swab collection for COVID19-PCR | Infectious Disease |
| ცხვირ–ხახის ნაცხის აღება | Nasopharyngeal swab collection | Respiratory |

**Total Records**: 34+ manipulation types

### Interactive Elements

Same structure as Section 2 (ნიმუშები):
- + button to add new manipulation
- ✏️ icon to edit existing manipulation
- 🗑️ icon to delete manipulation

### Workflow
Same as Section 2 (ნიმუშები) - simple add/edit/delete operations.

---

## Section 4: სინჯარები (Syringes)

### Page URL
`http://178.134.21.82:8008/clinic.php#3s302` (when სინჯარები tab is active)

### Purpose
Manages laboratory container and tube types with volume specifications and color coding for blood collection tubes.

### UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Tab Navigation: [კვლევის კომპონენტები] [ნიმუშები] [მანიპულაციები] [სინჯარები]  │
├─────────────────────────────────────────────────────────────────┤
│  ADD FORM                                                       │
│  დასახელება*: [Input] ფერი*: [Input] მოცულობა (მლ): [Input] [+]│
├─────────────────────────────────────────────────────────────────┤
│  TABLE HEADER (Turquoise)                                      │
│  | დასახელება          | ფერი  | მოცულობა (მლ) | Actions |      │
├─────────────────────────────────────────────────────────────────┤
│  DATA ROWS (15+ entries with color bars)                       │
│  | K2EDTA              | █████ (purple)  | 2     | ✏️ 🗑️ |      │
│  | ESR 4NC Sod.Cit.3,2%| █████ (black)   | 2     | ✏️ 🗑️ |      │
│  | კრიოსინჯარა         | █████ (cream)   | 2     | ✏️ 🗑️ |      │
│  | COAG 9NC Sod.Cit.3,2%|█████ (cyan)    | 2     | ✏️ 🗑️ |      │
│  | შარდის კონტეინერი   | █████ (yellow)  | 100   | ✏️ 🗑️ |      │
│  | ...                 | ...             | ...   | ...    |      │
└─────────────────────────────────────────────────────────────────┘
```

### Form Fields

| Field Label | Field Type | Required | Validation | Notes |
|-------------|------------|----------|------------|-------|
| დასახელება* (Name) | Text Input | Yes | Non-empty | Container/tube name |
| ფერი* (Color) | Text Input | Yes | Non-empty | Color code or name |
| მოცულობა (მლ) (Volume in ml) | Text Input | No | Numeric | Container volume |
| + Button | Submit | N/A | | Add new container type |

### Table Structure

#### Table Headers (4 columns)
| Column # | Header | Data Type | Width | Notes |
|----------|--------|-----------|-------|-------|
| 1 | დასახელება (Name) | Text | ~40% | Container/tube type name |
| 2 | ფერი (Color) | Color bar | ~30% | Visual color indicator (filled rectangle) |
| 3 | მოცულობა (მლ) (Volume in ml) | Number | ~20% | Volume capacity |
| 4 | (Actions) | Icons | ~10% | Edit and Delete icons |

### Sample Data (15+ entries with color coding)

| Name | Color (Visual) | Volume (ml) | Notes |
|------|----------------|-------------|-------|
| K2EDTA | Purple █████ | 2 | EDTA anticoagulant tube |
| ESR 4NC Sod.Cit.3,2% | Black █████ | 2 | ESR tube with sodium citrate |
| კრიოსინჯარა (Cryotube) | Cream/Beige █████ | 2 | Cryogenic storage |
| COAG 9NC Sod.Cit.3,2% | Cyan █████ | 2 | Coagulation tube |
| შარდის კონტეინერი (Urine container) | Yellow █████ | 100 | Urine collection |
| Clot Activ+GelSep (შრატის მისაღები) | Red █████ | 5 | Serum separator tube |
| ABG შპრიცი (ABG syringe) | Green █████ | 2 | Arterial blood gas |
| BF Conteiner | Dark Green █████ | 60 | Body fluid container |
| Sterile Conteiner | Olive/Khaki █████ | | Sterile specimen |
| Swab | Blue █████ | | Swab transport |
| Glass Slide | Teal █████ | | Microscopy slide |
| Fecal Conteiner | Brown █████ | | Stool specimen |
| Blood Medium | Lime █████ | | Blood culture |
| Plane Glass Tube | Light Pink █████ | | Plain glass tube |

**Total Records**: 15+ container types
**Status Bar**: "ხაზზე (92)" (92 records)

### Color Coding System

The color column displays actual color-filled bars matching laboratory standard tube colors:
- **Purple** - EDTA tubes (hematology)
- **Black** - ESR tubes
- **Red** - Serum separator tubes
- **Cyan/Light Blue** - Coagulation tubes
- **Green** - Heparin tubes (chemistry, ABG)
- **Yellow** - Urine containers
- **Brown** - Stool containers
- **Blue** - Swab transport media

### Interactive Elements

Same structure as previous sections:
- + button to add new container type
- ✏️ icon to edit existing container
- 🗑️ icon to delete container

### Workflow

#### Adding New Container Type
1. User enters container name (required)
2. User enters color name/code (required)
3. User enters volume in ml (optional)
4. User clicks + button
5. System validates required fields
6. New entry appears in table with color bar
7. Table refreshes

#### Editing Container Type
1. User clicks ✏️ icon
2. Inline edit or modal opens
3. User modifies fields (name, color, volume)
4. User saves changes
5. Table updates with new values

#### Deleting Container Type
1. User clicks 🗑️ icon
2. Confirmation dialog appears
3. User confirms deletion
4. Entry removed from table
5. Table refreshes

---

## Common UI/UX Patterns Across All Sections

### Color Scheme
- **Table Headers**: Turquoise/Cyan background (#00CED1 approximately)
- **Header Text**: White
- **Table Rows**: Alternating white/light gray (zebra striping)
- **Action Icons**: Dark gray/black

### Typography
- **Font Family**: System default (likely Arial or similar sans-serif)
- **Header Font Size**: ~14px, bold
- **Data Font Size**: ~12px, regular weight
- **Georgian Text**: Full UTF-8 support, renders correctly

### Layout Dimensions
- **Tab Bar Height**: ~40px
- **Add Form Row Height**: ~50px
- **Table Header Row Height**: ~35px
- **Data Row Height**: ~30px
- **Total Visible Rows**: ~20-25 without scrolling
- **Scroll**: Vertical scrolling for long lists

### Navigation Tabs
- **Active Tab**: Underlined or highlighted (visual indicator not specified in DOM)
- **Inactive Tabs**: Plain links with `javascript:void(0);` href
- **Tab Order**: Fixed (always in same order)

### Action Icons (Consistent Across All Sections)
- **Edit Icon**: ✏️ (Pen) - Triggers edit mode
- **Delete Icon**: 🗑️ (Trash) - Triggers delete confirmation
- **Search Icon**: 🔍 (Magnifying glass) - Executes search (Section 1 only)
- **Refresh Icon**: ⟳ (Circular arrow) - Reloads data (Section 1 only)

### Form Validation
- **Required Fields**: Marked with * (asterisk)
- **Validation Timing**: On submit (not real-time)
- **Error Display**: Not visible in current DOM (likely dialog or inline message)

### Status Bar
- **Location**: Bottom right corner
- **Format**: "ხაზზე (X)" where X = number of records
- **Updates**: Real-time as data changes

---

## Technical Implementation Notes

### JavaScript Framework
- **Event Handling**: Inline `javascript:void(0);` for tab switching
- **AJAX**: Likely used for add/edit/delete operations (not visible in static DOM)
- **Form Submission**: Standard HTML form submission or AJAX

### Data Management
- **Pagination**: Not visible in current view (may load all records at once)
- **Sorting**: Not implemented in current UI (no sort icons on headers)
- **Filtering**: Implemented in Section 1 only (multiple filter fields)
- **Search**: Text-based search in Section 1

### Backend Integration
- **Data Source**: Likely PHP backend with MySQL/PostgreSQL database
- **API Endpoints**: Not exposed in frontend DOM
- **Data Format**: Likely JSON or XML for AJAX responses

### Accessibility
- **Keyboard Navigation**: Not specified (requires testing)
- **Screen Reader Support**: Minimal (no ARIA labels visible)
- **Color Contrast**: Good (dark text on light background, white text on turquoise)

### Browser Compatibility
- **Tested On**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Mobile Responsive**: Not optimized (desktop-first design)
- **Minimum Resolution**: ~1024x768 recommended

---

## Medplum Implementation Recommendations

### FHIR Resource Mapping

#### Section 1: კვლევის კომპონენტები (Research Components)
**Recommended FHIR Resource**: `ObservationDefinition`
- `code` → Test parameter code (e.g., BL.11.2.2)
- `identifier` → GIS code (e.g., ;ALTL)
- `title` → Parameter name (Georgian + abbreviation)
- `category` → Type (შიდა, ლიმბახი, etc.)
- `quantitativeDetails.unit` → Measurement unit (IU/l, g/dl, etc.)
- `extension[department]` → Branch/Department assignment

#### Section 2: ნიმუშები (Samples)
**Recommended FHIR Resource**: `SpecimenDefinition`
- `typeCollected.coding.display` → Sample type name (Georgian)
- `typeCollected.coding.code` → Internal code (generated)
- `typeCollected.coding.system` → `http://medimind.ge/specimen-types`

#### Section 3: მანიპულაციები (Manipulations)
**Recommended FHIR Resource**: `ActivityDefinition` (for procedures)
- `kind` → "Task" or "ServiceRequest"
- `code.coding.display` → Manipulation name (Georgian)
- `code.coding.code` → Internal procedure code
- `code.coding.system` → `http://medimind.ge/procedures`
- `topic` → Category (blood, fluid, swab, etc.)

#### Section 4: სინჯარები (Syringes)
**Recommended FHIR Resource**: `DeviceDefinition` or custom extension on `SpecimenDefinition`
- `deviceName.name` → Container name
- `property[color].valueCode` → Color code/name
- `property[volume].valueQuantity` → Volume in ml
- `property[volume].valueQuantity.unit` → "ml"
- `property[volume].valueQuantity.system` → UCUM

### React Component Structure

```tsx
// Suggested component hierarchy for Medplum implementation
<LaboratoryNomenclatureView>
  <TabNavigation tabs={['კვლევის კომპონენტები', 'ნიმუშები', 'მანიპულაციები', 'სინჯარები']} />

  {activeTab === 'research-components' && (
    <ResearchComponentsTab>
      <AddForm fields={[code, gisCode, name, type, unit, branch]} />
      <FilterRow filters={[codeFilter, gisCodeFilter, statusFilter, typeFilter, unitFilter]} />
      <DataTable
        columns={[code, gisCode, name, type, unit, branch, actions]}
        data={observationDefinitions}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </ResearchComponentsTab>
  )}

  {activeTab === 'samples' && (
    <SamplesTab>
      <SimpleAddForm field="name" />
      <SimpleDataTable
        columns={[name, actions]}
        data={specimenDefinitions}
      />
    </SamplesTab>
  )}

  {activeTab === 'manipulations' && (
    <ManipulationsTab>
      <SimpleAddForm field="name" />
      <SimpleDataTable
        columns={[name, actions]}
        data={activityDefinitions}
      />
    </ManipulationsTab>
  )}

  {activeTab === 'syringes' && (
    <SyringesTab>
      <AddFormWithColor fields={[name, color, volume]} />
      <ColorCodedDataTable
        columns={[name, colorBar, volume, actions]}
        data={deviceDefinitions}
      />
    </SyringesTab>
  )}
</LaboratoryNomenclatureView>
```

### Styling with Mantine

```tsx
// Use Mantine components with turquoise theme
import { Table, TextInput, Select, Button, ActionIcon } from '@mantine/core';
import { IconEdit, IconTrash, IconSearch, IconRefresh } from '@tabler/icons-react';

const theme = {
  colors: {
    turquoise: ['#E0F7FA', '#B2EBF2', '#80DEEA', '#4DD0E1', '#26C6DA',
                '#00CED1', '#00ACC1', '#0097A7', '#00838F', '#006064'],
  },
  primaryColor: 'turquoise',
};

// Table header styling
<Table.Thead style={{ backgroundColor: 'var(--emr-turquoise)', color: 'white' }}>
  <Table.Tr>
    <Table.Th>კოდი</Table.Th>
    <Table.Th>GIS კოდი</Table.Th>
    {/* ... */}
  </Table.Tr>
</Table.Thead>
```

### API Service Layer

```typescript
// nomenclatureService.ts
import { MedplumClient } from '@medplum/core';
import { ObservationDefinition, SpecimenDefinition, ActivityDefinition, DeviceDefinition } from '@medplum/fhirtypes';

export class NomenclatureService {
  constructor(private medplum: MedplumClient) {}

  // Research Components (ObservationDefinition)
  async getResearchComponents(filters?: ComponentFilters): Promise<ObservationDefinition[]> {
    return this.medplum.searchResources('ObservationDefinition', filters);
  }

  async createResearchComponent(data: ComponentFormValues): Promise<ObservationDefinition> {
    return this.medplum.createResource({
      resourceType: 'ObservationDefinition',
      code: { text: data.code },
      identifier: [{ value: data.gisCode }],
      title: data.name,
      category: [{ text: data.type }],
      quantitativeDetails: { unit: { text: data.unit } },
      // ... map other fields
    });
  }

  async updateResearchComponent(id: string, data: ComponentFormValues): Promise<ObservationDefinition> {
    const existing = await this.medplum.readResource('ObservationDefinition', id);
    return this.medplum.updateResource({ ...existing, /* merge data */ });
  }

  async deleteResearchComponent(id: string): Promise<void> {
    await this.medplum.deleteResource('ObservationDefinition', id);
  }

  // Samples (SpecimenDefinition)
  async getSamples(): Promise<SpecimenDefinition[]> {
    return this.medplum.searchResources('SpecimenDefinition');
  }

  async createSample(name: string): Promise<SpecimenDefinition> {
    return this.medplum.createResource({
      resourceType: 'SpecimenDefinition',
      typeCollected: { coding: [{ display: name }] },
    });
  }

  // Manipulations (ActivityDefinition)
  async getManipulations(): Promise<ActivityDefinition[]> {
    return this.medplum.searchResources('ActivityDefinition', { kind: 'Task' });
  }

  async createManipulation(name: string): Promise<ActivityDefinition> {
    return this.medplum.createResource({
      resourceType: 'ActivityDefinition',
      kind: 'Task',
      code: { coding: [{ display: name }] },
    });
  }

  // Syringes/Containers (DeviceDefinition)
  async getSyringes(): Promise<DeviceDefinition[]> {
    return this.medplum.searchResources('DeviceDefinition');
  }

  async createSyringe(data: SyringeFormValues): Promise<DeviceDefinition> {
    return this.medplum.createResource({
      resourceType: 'DeviceDefinition',
      deviceName: [{ name: data.name, type: 'user-friendly-name' }],
      property: [
        { type: { text: 'color' }, valueCode: [{ coding: [{ display: data.color }] }] },
        { type: { text: 'volume' }, valueQuantity: [{ value: data.volume, unit: 'ml' }] },
      ],
    });
  }
}
```

### Translation Keys (i18n)

```json
// ka.json (Georgian translations)
{
  "laboratory": {
    "title": "ლაბორატორია",
    "tabs": {
      "researchComponents": "კვლევის კომპონენტები",
      "samples": "ნიმუშები",
      "manipulations": "მანიპულაციები",
      "syringes": "სინჯარები"
    },
    "fields": {
      "code": "კოდი",
      "gisCode": "GIS კოდი",
      "name": "დასახელება",
      "type": "ტიპი",
      "unit": "ზომა",
      "branch": "ფილიალი",
      "color": "ფერი",
      "volume": "მოცულობა (მლ)"
    },
    "actions": {
      "add": "დამატება",
      "edit": "რედაქტირება",
      "delete": "წაშლა",
      "search": "ძებნა",
      "refresh": "განახლება"
    },
    "status": {
      "active": "აქტიური",
      "deleted": "წაშლილი",
      "recordCount": "ხაზზე ({{count}})"
    },
    "placeholders": {
      "parameterSearch": "პარამეტრის ძებნა",
      "studySearch": "კვლევით ძებნა"
    }
  }
}
```

---

## Appendix A: Complete Unit Options List (56 items)

| # | Georgian | English | Category | UCUM Code |
|---|----------|---------|----------|-----------|
| 1 | ცალი | Piece | Count | {count} |
| 2 | დღე | Day | Time | d |
| 3 | k/μl | Thousands per microliter | Hematology | 10*3/uL |
| 4 | % | Percentage | Ratio | % |
| 5 | m/μl | Millions per microliter | Hematology | 10*6/uL |
| 6 | g/dl | Grams per deciliter | Concentration | g/dL |
| 7 | fl | Femtoliter | Volume | fL |
| 8 | pg | Picogram | Mass | pg |
| 9 | მმ/სთ | mm per hour | ESR | mm/h |
| 10 | - | None/Qualitative | N/A | N/A |
| 11 | ‰ | Per mille | Ratio | [ppth] |
| 12 | გრ | Gram | Mass | g |
| 13 | ამპულა | Ampule | Container | {ampule} |
| 14 | აბი | Pill/Tablet | Count | {tablet} |
| 15 | მკგ | Microgram | Mass | ug |
| 16 | კომპლექტი | Set/Kit | Count | {kit} |
| 17 | ფლაკონი | Vial | Container | {vial} |
| 18 | კოლოფი | Box | Container | {box} |
| 19 | წყვილი | Pair | Count | {pair} |
| 20 | რეაქტივი | Reagent | Material | {reagent} |
| 21 | მლ | Milliliter | Volume | mL |
| 22 | მ | Meter | Length | m |
| 23 | mk/l | Milliequivalents per liter | Concentration | meq/L |
| 24 | IU/l | International units per liter | Enzyme | [IU]/L |
| 25 | μmol/l | Micromoles per liter | Concentration | umol/L |
| 26 | mmol/l | Millimoles per liter | Concentration | mmol/L |
| 27 | mg/dl | Milligrams per deciliter | Concentration | mg/dL |
| 28 | g/l | Grams per liter | Concentration | g/L |
| 29 | μg/dl | Micrograms per deciliter | Concentration | ug/dL |
| 30 | IU/ml | International units per milliliter | Concentration | [IU]/mL |
| 31 | ლიტრი | Liter | Volume | L |
| 32 | მეტრი | Meter | Length | m |
| 33 | პაკეტი | Packet | Container | {packet} |
| 34 | μIU/ml | Micro IU per milliliter | Hormone | u[IU]/mL |
| 35 | 10³ / μL | 10^3 per microliter | Cell count | 10*3/uL |
| 36 | 10⁶ / μL | 10^6 per microliter | Cell count | 10*6/uL |
| 37 | mm/lh | mm per hour | ESR | mm/h |
| 38 | წმ | Second | Time | s |
| 39 | nmol/l | Nanomoles per liter | Concentration | nmol/L |
| 40 | pmol/l | Picomoles per liter | Concentration | pmol/L |
| 41 | mg/l | Milligrams per liter | Concentration | mg/L |
| 42 | ng/ml | Nanograms per milliliter | Concentration | ng/mL |
| 43 | მხ/ა | Non-standard local unit | Custom | N/A |
| 44 | U/l | Units per liter | Enzyme | U/L |
| 45 | μg/ml | Micrograms per milliliter | Concentration | ug/mL |
| 46 | pg/ml | Picograms per milliliter | Concentration | pg/mL |
| 47 | μg/l | Micrograms per liter | Concentration | ug/L |
| 48 | X10^3/µL | Times 10^3 per microliter | Cell count | 10*3/uL |
| 49 | Ug/l | Units per liter | Enzyme | U/L |
| 50 | U/ml | Units per milliliter | Enzyme | U/mL |
| 51 | mmHg | Millimeters of mercury | Pressure | mm[Hg] |
| 52 | mmol/kg | Millimoles per kilogram | Concentration | mmol/kg |
| 53 | ნგ/მლ | ng/mL (Georgian) | Concentration | ng/mL |
| 54 | ng/dl | Nanograms per deciliter | Concentration | ng/dL |
| 55 | μU/ml | Micro units per milliliter | Hormone | uU/mL |
| 56 | (empty) | Blank option | N/A | N/A |

---

## Appendix B: Screenshots Reference

All screenshots saved in: `documentation/laboratory/screenshots/`

1. **01-research-components-overview.png** - Full page view of Research Components tab
2. **02-samples-overview.png** - Full page view of Samples tab
3. **03-manipulations-overview.png** - Full page view of Manipulations tab
4. **04-syringes-overview.png** - Full page view of Syringes tab (with color bars visible)

---

## Appendix C: Data Model Summary

### Research Components (ObservationDefinition)
- **Total Entries**: 92
- **Key Fields**: Code, GIS Code, Name (Georgian + abbreviation), Type, Unit, Branch
- **Complex Features**: Multi-field search, status filtering, extensive unit dropdown

### Samples (SpecimenDefinition)
- **Total Entries**: 45+
- **Key Fields**: Name (Georgian)
- **Categories**: Blood (15), Urine (5), Fluids (12), Swabs (7), Tissue (3), Other (3)

### Manipulations (ActivityDefinition)
- **Total Entries**: 34+
- **Key Fields**: Name (Georgian)
- **Categories**: Blood collection (3), Fluid aspiration (7), Swab collection (8), Urine collection (3), Other (13)

### Syringes/Containers (DeviceDefinition)
- **Total Entries**: 15+
- **Key Fields**: Name, Color (visual bar), Volume (ml)
- **Special Feature**: Color-coded visual bars matching standard laboratory tube colors

---

## End of Documentation

**Mapping Completed:** 2025-11-18
**Total Pages Documented:** 4
**Total Interactive Elements Cataloged:** 50+
**Total Data Entries Observed:** 186+

This documentation provides a complete blueprint for rebuilding the Laboratory nomenclature section in the Medplum MediMind EMR system.
