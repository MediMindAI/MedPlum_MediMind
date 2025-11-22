# ER/RECEPTION Section - Patient Card
## სასწრაფოს მიღება / ER Reception

**Page URL:** http://178.134.21.82:8008/clinic.php
**Section Tab:** ER / RECEPTION ■■
**Extraction Date:** 2025-11-19
**System:** SoftMedic | ჰელსიკორი (Ratiokhost Legacy EMR)

---

## Overview

The ER/RECEPTION section is part of the patient card interface and handles emergency department admissions and reception data. This section captures:
- Patient admission date and time
- Time tracking for disease onset and trauma
- Admission diagnosis (preliminary diagnosis)
- Emergency diagnosis

---

## Section Structure

The ER/RECEPTION section consists of 4 main subsections:

### 1. რეგისტრაციის მონაცემები (Registration Data)
### 2. შემოყვანილია (Brought In After)
### 3. დიაგნოზი შემოსვლისას / წინასწარი დიაგნოზი (Admission Diagnosis / Preliminary Diagnosis)
### 4. სასწრაფოს დიაგნოზი (Emergency Diagnosis)

---

## 1. რეგისტრაციის მონაცემები (Registration Data)

**Section Header:** "რეგისტრაციის მონაცემები"
**Background Color:** Transparent (rgba(0, 0, 0, 0))
**Font Size:** 19px

### Fields

| Field ID | Name Attribute | Label (ქართული) | Type | Disabled | Value Example | Notes |
|----------|----------------|------------------|------|----------|---------------|-------|
| *(none)* | *(none)* | პაციენტის შემოსვლის თარიღი და დრო | text | No | 19-11-2025 00:13 | Patient admission date and time (auto-populated) |
| *(none)* | *(none)* | ისტორიის ნომერი | text | No | 10619-2025 | History number (auto-populated from registration) |

**Table Structure:**
\`\`\`html
<table class="tg">
  <tr>
    <td>პაციენტის შემოსვლის თარიღი და დრო</td>
    <td>ისტორიის ნომერი</td>
  </tr>
</table>
\`\`\`

---

## 2. შემოყვანილია (Brought In After)

**Section Header:** "შემოყვანილია"
**Background Color:** Transparent (rgba(0, 0, 0, 0))
**Font Size:** 19px

**Sub-Section Background:** Light pink (rgb(247, 238, 238))

### Fields

| Field ID | Name Attribute | Label (ქართული) | Label (English) | Type | Disabled | Default | Validation | Notes |
|----------|----------------|------------------|-----------------|------|----------|---------|------------|-------|
| \`dr_afterhour\` | *(none)* | საათის შემდეგ | Hours after | text | No | *(empty)* | Numeric | Time elapsed in hours |
| \`dr_disstart\` | *(none)* | დაავადების დაწყებიდან | From disease onset | text | No | *(empty)* | Numeric | Hours since disease started |
| \`dr_trastart\` | *(none)* | ტრამვის მიღებიდან | From trauma received | text | No | *(empty)* | Numeric | Hours since trauma occurred |

**Table Structure:**
\`\`\`html
<table class="tg">
  <tr>
    <td>საათის შემდეგ</td>
    <td>დაავადების დაწყებიდან</td>
    <td>ტრამვის მიღებიდან</td>
  </tr>
</table>
\`\`\`

### Action Button

| Button Text | ID | Type | onclick Handler | Purpose |
|-------------|-----|------|----------------|---------|
| შენახვა (Save) | *(none)* | button | \`glAj("insert5v","afterhourins","","LoadingImage","subGMsg2","\`,\`","\`,\`",{"my_dctrhid":"10"},{"dr_afterho...\` | Saves time tracking data |

**Full onclick:**
\`\`\`javascript
glAj("insert5v","afterhourins","","LoadingImage","subGMsg2","|","|",{"my_dctrhid":"10"},{"dr_afterho...
\`\`\`

---

## 3. დიაგნოზი შემოსვლისას / წინასწარი დიაგნოზი (Admission Diagnosis / Preliminary Diagnosis)

**Section Header:** "დიაგნოზი შემოსვლისას / წინასწარი დიაგნოზი"
**Background Color:** Transparent (rgba(0, 0, 0, 0))
**Font Size:** 19px

### Input Form

**Table ID:** \`cinasraddiagtab\`
**Table Class:** \`tg nondrg\`

| Field ID | Name Attribute | Label (ქართული) | Type | Required | Placeholder | Validation | Notes |
|----------|----------------|------------------|------|----------|-------------|------------|-------|
| \`scrchcinasardeas\` | *(none)* | ICD10* | text | Yes | ICD10 ძებნა | ICD10 code search | Autocomplete/search field for ICD10 codes |
| \`diagdate\` | *(none)* | დადგენის თარიღი* | text | Yes | *(none)* | Date format | Date of diagnosis establishment |
| *(button)* | *(none)* | ... | button | N/A | N/A | N/A | Date picker button (calendar icon) |
| \`cinascardiagcommnt\` | *(none)* | ექიმის კომენტარი | textarea | No | *(none)* | Text | Doctor's comment on diagnosis |

**Form Structure:**
\`\`\`html
<table id="cinasraddiagtab" class="tg nondrg">
  <tr>
    <td>ICD10*</td>
  </tr>
  <tr>
    <td>დადგენის თარიღი* ...</td>
  </tr>
  <tr>
    <td>ექიმის კომენტარი</td>
  </tr>
</table>
\`\`\`

### Action Button

| Button Text | ID | Type | onclick Handler | Purpose |
|-------------|-----|------|----------------|---------|
| დამატება (Add) | *(none)* | button | \`glAj("insert8v","cinaacdiagins","","LoadingImage","subGMsg2","\`,\`","\`,\`",{"my_dctrhid":"10"}, {"mo_HDicd...\` | Adds admission diagnosis to list |

**Full onclick:**
\`\`\`javascript
glAj("insert8v","cinaacdiagins","","LoadingImage","subGMsg2","|","|",{"my_dctrhid":"10"}, {"mo_HDicd...
\`\`\`

### Results Table

**Table ID:** \`cindiagres\`
**Table Class:** \`tt ce tbalce fmod\`

| Column Header | Description |
|---------------|-------------|
| ICD10 | ICD10 diagnosis code |
| ექიმის კომენტარი | Doctor's comment |
| თარიღი | Date of diagnosis |
| *(delete icon)* | Action column for removing diagnosis |

**Table Structure:**
\`\`\`html
<table id="cindiagres" class="tt ce tbalce fmod">
  <thead>
    <tr>
      <th>ICD10</th>
      <th>ექიმის კომენტარი</th>
      <th>თარიღი</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <!-- Diagnosis rows appear here after adding -->
  </tbody>
</table>
\`\`\`

---

## 4. სასწრაფოს დიაგნოზი (Emergency Diagnosis)

**Section Header:** "სასწრაფოს დიაგნოზი"
**Background Color:** Transparent (rgba(0, 0, 0, 0))
**Font Size:** 19px

### Input Form

**Table ID:** \`sascrafotab\`
**Table Class:** \`tg nondrg\`

| Field ID | Name Attribute | Label (ქართული) | Type | Required | Placeholder | Validation | Notes |
|----------|----------------|------------------|------|----------|-------------|------------|-------|
| \`srchicdlifediseas\` | *(none)* | ICD10* | text | Yes | ICD10 ძებნა | ICD10 code search | Autocomplete/search field for ICD10 codes |
| \`sascrfdiag\` | *(none)* | ექიმის კომენტარი | textarea | No | *(none)* | Text | Doctor's comment on emergency diagnosis |

**Form Structure:**
\`\`\`html
<table id="sascrafotab" class="tg nondrg">
  <tr>
    <td>ICD10*</td>
  </tr>
  <tr>
    <td>ექიმის კომენტარი</td>
  </tr>
</table>
\`\`\`

### Action Button

| Button Text | ID | Type | onclick Handler | Purpose |
|-------------|-----|------|----------------|---------|
| დამატება (Add) | *(none)* | button | \`glAj("insert5v","sascrfdiagins","","LoadingImage","subGMsg2","\`,\`","\`,\`",{"my_dctrhid":"10"}, {"mo_HDicd...\` | Adds emergency diagnosis to list |

**Full onclick:**
\`\`\`javascript
glAj("insert5v","sascrfdiagins","","LoadingImage","subGMsg2","|","|",{"my_dctrhid":"10"}, {"mo_HDicd...
\`\`\`

### Results Table

**Table ID:** \`sasdiagresults\`
**Table Class:** \`tt ce tbalce fmod\`

| Column Header | Description |
|---------------|-------------|
| ICD10 | ICD10 diagnosis code |
| ექიმის კომენტარი | Doctor's comment |
| *(delete icon)* | Action column for removing diagnosis |

**Table Structure:**
\`\`\`html
<table id="sasdiagresults" class="tt ce tbalce fmod">
  <thead>
    <tr>
      <th>ICD10</th>
      <th>ექიმის კომენტარი</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <!-- Emergency diagnosis rows appear here after adding -->
  </tbody>
</table>
\`\`\`

---

## Complete Field Summary

### Total Fields Documented: 8

#### Time Tracking Fields (3)
1. **საათის შემდეგ** (dr_afterhour) - Hours after
2. **დაავადების დაწყებიდან** (dr_disstart) - From disease onset
3. **ტრამვის მიღებიდან** (dr_trastart) - From trauma received

#### Admission Diagnosis Fields (3)
4. **ICD10*** (scrchcinasardeas) - ICD10 code search (admission)
5. **დადგენის თარიღი*** (diagdate) - Date of diagnosis establishment
6. **ექიმის კომენტარი** (cinascardiagcommnt) - Doctor's comment (admission)

#### Emergency Diagnosis Fields (2)
7. **ICD10*** (srchicdlifediseas) - ICD10 code search (emergency)
8. **ექიმის კომენტარი** (sascrfdiag) - Doctor's comment (emergency)

---

## Action Buttons Summary

### Total Buttons: 3

| Button # | Label (ქართული) | Label (English) | Purpose | Associated Fields |
|----------|------------------|-----------------|---------|-------------------|
| 1 | შენახვა | Save | Saves time tracking data | dr_afterhour, dr_disstart, dr_trastart |
| 2 | დამატება | Add | Adds admission diagnosis | scrchcinasardeas, diagdate, cinascardiagcommnt |
| 3 | დამატება | Add | Adds emergency diagnosis | srchicdlifediseas, sascrfdiag |

---

## Source Information

- **Page URL**: http://178.134.21.82:8008/clinic.php
- **Tab**: ER / RECEPTION ■■ (patient card sidebar)
- **Extraction Method**: Browser DOM inspection via Playwright MCP
- **Date**: 2025-11-19
- **Patient Example**: რევაზ ძიმისტარაშვილი (ID: 62006014983, Visit: 10619-2025)

---

**Document Status:** ✅ COMPLETE
**Georgian Character Encoding:** UTF-8
**Read-Only Mapping:** Yes (no data modified in legacy system)
