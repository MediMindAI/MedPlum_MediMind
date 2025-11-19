# კვლევის კომპონენტები (Research Components) Modal Analysis

## Overview
Analysis of the modal window that appears when double-clicking a research component entry in the laboratory nomenclature system.

**Date**: 2025-11-18
**Source**: Original EMR System Screenshots

---

## Screenshot Analysis

### Main Modal Title
**Title**: `ჰემოგლობინი HGB` (Hemoglobin HGB)

This indicates the modal is showing detailed configuration for a specific research component (HGB - Hemoglobin).

---

## Modal Structure

### Section 1: Related Component Codes (Top Table)

**Header**: `ფილიალი` (Branch/Department) dropdown + `+` button

**Table Columns**:
- **კოდი** (Code) - Component code identifier
- **დასახელება** (Description) - Component description

**Visible Entries**:
1. `BL.1.1` - ჰემოგლობინის, ჰემატოკრიტისა და ერითროციტების რაოდენობის განსაზღვრა
2. `BL.6` - CBC - FORMULA სისხლის საერთო ანალიზი
3. `BL.1.1` - Hb ჰემოგლობინი
4. `Lab -1` - სისხლის საერთო ანალიზი (ქიმიო)

**Purpose**: These appear to be **parent test codes** or **test packages** that include HGB as a component.

**Key Insight**: This is a **many-to-many relationship** - one research component (HGB) can belong to multiple test codes/packages.

---

### Section 2: Unit of Measurement

**Fields**:
- **დასახელება** (Name/Unit): `g/dl`
- **ერთეული** (Unit): `g/dl` (with edit icon)

**Purpose**: Defines the measurement unit for this component (grams per deciliter for hemoglobin).

---

### Section 3: Value Type Selection

**Radio Buttons**:
- ⚪ **ახარჩევი ველი** (Selection Field) - for dropdown/coded values
- 🔵 **ჩასაწერი ველი** (Input Field) - for numeric/text values (SELECTED)

**Associated Input Fields**:
- Left field (under ახარჩევი ველი): Text input + `+` button
- Right field (under ჩასაწერი ველი): Text input

**Purpose**: Determines how results are entered for this component:
- **Selection Field**: User picks from predefined values (e.g., "Positive/Negative")
- **Input Field**: User types numeric value (e.g., "13.5")

---

### Section 4: Reference Ranges Table (Bottom Table)

**Table Headers**:
| მოქალაქეობა | ასაკიდან | ასაკამდე | ნორმა-დან | ნორმა-მდე | სხვა ნორმა/კომენტარი | მაჩვენები |
|------------|----------|----------|-----------|-----------|---------------------|----------|
| Citizenship | Age From | Age To | Norm From | Norm To | Other Norm/Comment | Indicator |

**Visible Data Row**:
- **მოქალაქეობა** (Citizenship): `მამრობითი` (Male)
- **ასაკიდან** (Age From): `0`
- **ასაკამდე** (Age To): `120`
- **ნორმა-დან** (Norm From): `13.5`
- **ნორმა-მდე** (Norm To): `____` (blank or separator)
- **ნორმა-მდე** (Norm To cont.): `18`
- **სხვა ნორმა/კომენტარი** (Other Norm/Comment): (empty)
- **მაჩვენები** (Indicator): (empty)

**Dropdowns Above Table**:
- **მოქალაქეობა** (Citizenship) - dropdown
- **წელი** (Year) - dropdown (appears twice, likely Age From/To units)

**Purpose**: Defines **reference ranges** based on demographics:
- **Gender-specific** (Male/Female)
- **Age-specific** (0-120 years)
- **Normal range**: 13.5 - 18 g/dl for males

---

## Data Relationships Analysis

### 1. What are the codes in the first table?

**Answer**: The codes (BL.1.1, BL.6, Lab-1) are **parent test codes** or **test packages** that include HGB as a sub-component.

**Examples**:
- `BL.1.1` = Hemoglobin count determination (individual test)
- `BL.6` = CBC - FORMULA (Complete Blood Count - includes HGB as one parameter)
- `Lab -1` = General blood analysis (chemistry panel)

---

### 2. Where are these codes coming from?

**Database Source**: These codes likely come from:
- **Medical Services Nomenclature** (სამედიცინო სერვისები)
  - System: `http://medimind.ge/nomenclature/service-code`
  - FHIR Resource: `ActivityDefinition`
  - These are billable lab test codes

**Relationship**:
```
ActivityDefinition (Lab Test BL.6 "CBC")
    ├── ObservationDefinition (HGB component)
    ├── ObservationDefinition (WBC component)
    ├── ObservationDefinition (RBC component)
    └── ... (other CBC components)
```

---

### 3. Relationship between Research Component and Codes

**Data Model**:

```
კვლევის კომპონენტი (Research Component)
├── ID: HGB
├── Name: ჰემოგლობინი HGB
├── Unit: g/dl
├── Value Type: Input Field
├── Related Test Codes: [BL.1.1, BL.6, BL.1.1, Lab-1]
└── Reference Ranges:
    ├── Male, 0-120 years: 13.5-18 g/dl
    ├── Female, 0-120 years: 12.0-16.0 g/dl
    └── ... (other demographic groups)
```

**Many-to-Many Relationship**:
- One research component (HGB) → belongs to multiple test codes
- One test code (CBC) → contains multiple research components

---

### 4. What happens when you double-click?

**Action**: Opens a **detailed configuration modal** for the research component.

**Functionality**:
1. **View/Edit Related Test Codes**: See which lab tests include this component
2. **Configure Measurement Unit**: Set unit of measurement
3. **Set Value Type**: Choose input method (numeric entry vs. dropdown selection)
4. **Define Reference Ranges**: Set normal ranges by gender, age, and other demographics

---

### 5. Are these codes reference ranges or sub-parameters?

**Answer**: Neither - they are **parent test codes** (billable services).

**Clarification**:
- **Codes in top table** (BL.1.1, BL.6) = Parent test codes (what gets ordered)
- **Research Component** (HGB) = Sub-parameter (what gets measured)
- **Reference Ranges** (bottom table) = Normal value ranges for interpretation

**Analogy**:
- **Test Code** = "Complete Blood Count (CBC)" - what doctor orders
- **Research Component** = "Hemoglobin (HGB)" - individual measurement within CBC
- **Reference Range** = "13.5-18 g/dl for males" - normal values

---

## Exact Table Structure

### Top Table (Related Test Codes)

| Column Name (Georgian) | Column Name (English) | Data Type | Purpose |
|------------------------|----------------------|-----------|---------|
| კოდი | Code | String | Service code (e.g., BL.1.1) |
| დასახელება | Description | String | Service name (Georgian) |

**Actions**:
- `+` button: Add new related test code
- Edit icon: Modify existing relationship
- Delete icon: Remove relationship

---

### Bottom Table (Reference Ranges)

| Column Name (Georgian) | Column Name (English) | Data Type | Purpose |
|------------------------|----------------------|-----------|---------|
| მოქალაქეობა | Citizenship/Gender | Dropdown | Male/Female/Other |
| ასაკიდან | Age From | Number | Minimum age (years) |
| ასაკამდე | Age To | Number | Maximum age (years) |
| ნორმა-დან | Norm From | Number | Lower bound of normal range |
| ნორმა-მდე | Norm To | Number | Upper bound of normal range |
| სხვა ნორმა/კომენტარი | Other Norm/Comment | Text | Additional notes |
| მაჩვენები | Indicator | Text | Clinical significance indicator |

**Actions**:
- `+` button: Add new reference range row
- Edit icon: Modify existing range
- Delete icon: Remove range

---

## FHIR Resource Mapping (Proposed)

### ObservationDefinition (Research Component)

```typescript
{
  resourceType: "ObservationDefinition",
  id: "hgb-component",
  identifier: [{
    system: "http://medimind.ge/laboratory/component-code",
    value: "HGB"
  }],
  title: "ჰემოგლობინი HGB",
  code: {
    coding: [{
      system: "http://loinc.org",
      code: "718-7",
      display: "Hemoglobin [Mass/volume] in Blood"
    }]
  },

  // Measurement unit
  quantitativeDetails: {
    unit: {
      coding: [{
        system: "http://unitsofmeasure.org",
        code: "g/dL",
        display: "g/dl"
      }]
    }
  },

  // Value type (numeric vs. coded)
  permittedDataType: ["Quantity"], // or ["CodeableConcept"] for dropdown

  // Related test codes (parent services)
  extension: [{
    url: "http://medimind.ge/fhir/extension/related-test-codes",
    valueReference: [{
      reference: "ActivityDefinition/BL.1.1",
      display: "ჰემოგლობინის, ჰემატოკრიტისა და ერითროციტების რაოდენობის განსაზღვრა"
    }, {
      reference: "ActivityDefinition/BL.6",
      display: "CBC - FORMULA სისხლის საერთო ანალიზი"
    }]
  }],

  // Reference ranges
  qualifiedInterval: [{
    category: "reference",
    gender: "male",
    age: {
      low: { value: 0, unit: "years" },
      high: { value: 120, unit: "years" }
    },
    range: {
      low: { value: 13.5, unit: "g/dL" },
      high: { value: 18, unit: "g/dL" }
    }
  }, {
    category: "reference",
    gender: "female",
    age: {
      low: { value: 0, unit: "years" },
      high: { value: 120, unit: "years" }
    },
    range: {
      low: { value: 12.0, unit: "g/dL" },
      high: { value: 16.0, unit: "g/dL" }
    }
  }]
}
```

---

## Key Technical Insights

### 1. Component-to-Test Relationship (Many-to-Many)

**Database Structure** (likely):
```sql
-- Research components table
CREATE TABLE research_components (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  name_ka TEXT,
  unit VARCHAR(20),
  value_type VARCHAR(20) -- 'input' or 'selection'
);

-- Lab test services table (already exists as medical services)
CREATE TABLE medical_services (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  name_ka TEXT,
  -- ... other fields
);

-- Junction table (many-to-many relationship)
CREATE TABLE test_component_mapping (
  id SERIAL PRIMARY KEY,
  test_code VARCHAR(50) REFERENCES medical_services(code),
  component_code VARCHAR(50) REFERENCES research_components(code),
  display_order INT
);

-- Reference ranges table
CREATE TABLE component_reference_ranges (
  id SERIAL PRIMARY KEY,
  component_code VARCHAR(50) REFERENCES research_components(code),
  gender VARCHAR(20), -- 'male', 'female', 'other'
  age_from INT,
  age_to INT,
  norm_from DECIMAL(10,2),
  norm_to DECIMAL(10,2),
  comment TEXT,
  indicator TEXT
);
```

### 2. Value Type Implications

**Input Field (ჩასაწერი ველი)**:
- Stores numeric values in `Observation.valueQuantity`
- Example: HGB = 14.2 g/dl

**Selection Field (ახარჩევი ველი)**:
- Stores coded values in `Observation.valueCodeableConcept`
- Example: Blood Type = "A+" (from predefined list)

### 3. Reference Range Logic

**Interpretation Engine**:
```typescript
function interpretResult(
  componentCode: string,
  value: number,
  gender: string,
  ageYears: number
): string {
  const range = findReferenceRange(componentCode, gender, ageYears);

  if (value < range.normFrom) return "Low";
  if (value > range.normTo) return "High";
  return "Normal";
}
```

**Clinical Workflow**:
1. Lab technician enters HGB value: `14.5 g/dl`
2. System looks up patient demographics: Male, 35 years old
3. System finds matching reference range: Male, 0-120 years → 13.5-18 g/dl
4. System interprets: `14.5` is within `13.5-18` → **Normal**
5. Result flagged on report accordingly

---

## Implementation Recommendations

### Phase 1: Basic Component CRUD
- Create/Read/Update/Delete research components
- Store component code, name, unit, value type

### Phase 2: Test-Component Association
- UI to link components to parent test codes
- Display in top table (as shown in modal)
- Enable adding/removing relationships

### Phase 3: Reference Ranges
- UI to add/edit reference ranges (bottom table)
- Support multiple ranges per component (gender, age-specific)
- Validation to prevent overlapping ranges

### Phase 4: Results Interpretation
- Auto-flag abnormal results based on reference ranges
- Display normal/high/low indicators
- Support critical value alerts

---

## Questions for Further Investigation

1. **Department/Branch Filter**: What does the `ფილიალი` (Branch) dropdown do in the modal?
   - Likely filters which lab departments/branches can perform this test

2. **Indicator Column**: What values go in the `მაჩვენები` (Indicator) column?
   - Possibly clinical significance flags (H/L/HH/LL)

3. **Value Type Toggle**: Can a component support both input and selection?
   - Or is it strictly one or the other?

4. **Multiple Reference Ranges**: How many ranges can one component have?
   - Screenshot shows gender-based (Male/Female)
   - Could also be age-based, ethnicity-based, pregnancy-status-based, etc.

---

## Summary

The modal window for Research Components is a **comprehensive configuration interface** that:

1. **Links components to parent test codes** (many-to-many relationship)
2. **Defines measurement units** (g/dl, mg/L, mmol/L, etc.)
3. **Sets value entry method** (numeric input vs. dropdown selection)
4. **Configures reference ranges** (gender, age, demographic-specific normal values)

This enables the system to:
- **Order tests** (e.g., "CBC") that automatically include all linked components
- **Capture results** with appropriate units and data types
- **Interpret results** by comparing values to demographic-specific reference ranges
- **Flag abnormalities** for clinical review

The data structure supports complex laboratory workflows while maintaining FHIR compliance through `ObservationDefinition` resources.
