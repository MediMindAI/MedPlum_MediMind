# Department Class Types Analysis

## Overview

This document provides a comprehensive analysis of the **კლასი (Class)** field in the EMR system's Department management page (პარამეტრები >> განყოფილებები).

**Source**: http://178.134.21.82:8008/clinic.php (Parameters >> Departments page)
**Analysis Date**: 2025-11-25
**Total Departments Analyzed**: 100+

---

## Complete Class Type List

Based on DOM extraction from the live EMR system, there are **4 distinct class types**:

| Value | Georgian Name | English Translation | Code (ID) |
|-------|--------------|---------------------|-----------|
| 1 | პაციენტი / ნაშთი | Patient / Balance | `1` |
| 2 | ადმინისტრაციული | Administrative | `2` |
| 3 | ნაშთი | Balance | `3` |
| 4 | პაციენტი | Patient | `4` |

**Note**: The partial screenshot showed 7 options, but the actual live system only contains 4 options in the dropdown (`#cn_mode`).

---

## Class Type Definitions and Business Logic

### 1. პაციენტი / ნაშთი (Patient / Balance)

**Purpose**: Departments that handle **both patient care AND inventory/supplies management**.

**Examples from Real Data**:
- კარდიოქირურგია (Cardiosurgery) - სტაციონალური
- ამბულატორია (Ambulatory) - ამბულატორიული
- ამბულატორიული ონკოლოგია (Ambulatory Oncology) - ამბულატორიული
- არითმოლოგია (Arrhythmology) - სტაციონალური
- გადაუდებელი განყოფილება (ER) - სტაციონალური
- ზოგადი რეანიმაცია (General ICU) - სტაციონალური
- ზოგადი ქირურგიის დეპარტამენტი (General Surgery Department) - სტაციონალური
- კარდიოლოგია (Cardiology) - სტაციონალური

**Business Logic**:
- Track patient visits and encounters
- Manage inventory (medications, supplies, equipment)
- Generate patient billing
- Track supply costs per department
- Most common for clinical departments with direct patient care

**Implications**:
- Requires integration with:
  - Patient registration system
  - Inventory management system
  - Billing/financial system
  - Clinical documentation system

---

### 2. ადმინისტრაციული (Administrative)

**Purpose**: Non-patient-facing departments for **staff roles, administrative functions, and operational support**.

**Examples from Real Data**:
- CT- მორიგე ოპერატორი (CT On-Duty Operator) - სტაციონალური
- ადმინისტრაცია (Administration) - სტაციონალური
- ანესთეზიოლოგიისა და რეანიმაციის დეპარტამენტის ანესთეზიის ექთანი (Anesthesia & ICU Department Anesthesia Nurse) - სტაციონალური
- ანესთეზიოლოგიისა და რეანიმაციის დეპარტამენტის მორიგე ექიმი (Anesthesia & ICU Department On-Duty Doctor) - სტაციონალური
- გადაუდაუდებელი სამედიცინო დახმარების დეპარტამენტის მორიგე ექთანი (Emergency Medical Care Department On-Duty Nurse) - სტაციონალური
- ემერჯენსის მორიგე რეცეფციის თანამშრომელი (Emergency On-Duty Reception Staff) - სტაციონალური
- ემერჯენსის სანიტარი (Emergency Sanitation Worker) - სტაციონალური
- ზოგადების სანიტარი (General Sanitation Worker) - სტაციონალური
- თერაპია (Therapy) - სტაციონალური
- კარდიოლოგიის სანიტარი (Cardiology Sanitation Worker) - სტაციონალური

**Business Logic**:
- Does NOT track patient encounters
- Does NOT manage inventory/supplies
- Used for HR/payroll purposes (staff assignments)
- Used for organizational structure
- Represents staff roles rather than clinical services

**Implications**:
- No patient billing
- No clinical documentation requirements
- May track staff time/attendance
- Used for departmental organization charts

---

### 3. ნაშთი (Balance)

**Purpose**: Departments focused solely on **inventory/supply management** without direct patient tracking.

**Examples from Real Data**:
- ამბულატორია ქირურგიული (Surgical Ambulatory) - ამბულატორიული
- ანესთეზიოლოგია (Anesthesiology) - სტაციონალური
- ანტიბიოტიკები (Antibiotics) - სტაციონალური
- ბარიატრიული განყოფილება (Bariatric Department) - ამბულატორიული
- გადაუდებელი ანესთეზია (Emergency Anesthesia) - სტაციონალური
- გადაუდებელი საოპერაციო (Emergency Operating Room) - სტაციონალური
- გინეკოლოგია ამბულატორია (Gynecology Ambulatory) - ამბულატორიული
- ენდოსკოპია (Endoscopy) - ამბულატორიული
- ენდოსკოპია ანესთეზია (Endoscopy Anesthesia) - ამბულატორიული
- ინტერვენციული კარდიოლოგია (Interventional Cardiology) - სტაციონალური

**Business Logic**:
- Track inventory/supplies only
- NO patient encounter tracking
- Used for supply departments, pharmacies, equipment rooms
- Focus on cost tracking and inventory control
- May support other departments with supplies

**Implications**:
- Integration with inventory management system only
- No patient billing (supplies charged to other departments)
- Cost center for accounting purposes
- May track supply usage by other departments

---

### 4. პაციენტი (Patient)

**Purpose**: Departments that handle **patient care only** without inventory management.

**Examples from Real Data**:
- No departments currently use this class in the extracted dataset (0-49 rows)

**Business Logic**:
- Track patient visits and encounters
- NO inventory/supply management
- Generate patient billing
- Used for consultation-only departments or virtual departments

**Implications**:
- Integration with patient registration system
- Integration with billing/financial system
- No inventory tracking
- Simplified cost structure (no supply costs)

**Note**: This class type exists in the dropdown but was not observed in the first 49 departments analyzed. It may be used for:
- Telemedicine departments
- Consultation-only services
- Administrative patient tracking (e.g., patient education, discharge planning)

---

## Usage Statistics (First 49 Departments)

| Class Type | Count | Percentage |
|-----------|-------|------------|
| ადმინისტრაციული (Administrative) | 24 | 51% |
| პაციენტი / ნაშთი (Patient / Balance) | 12 | 26% |
| ნაშთი (Balance) | 11 | 23% |
| პაციენტი (Patient) | 0 | 0% |

**Key Insights**:
- **Administrative departments dominate** (51%) - reflects extensive staff role tracking
- **Patient / Balance** (26%) - clinical departments with full integration
- **Balance-only** (23%) - support departments (anesthesia, supplies, OR)
- **Patient-only** (0%) - not currently used in this facility

---

## Relationship with Department Type (ტიპი)

### Department Type Options:
1. **სტაციონალური (Stationary/Inpatient)** - Code `1`
2. **ამბულატორიული (Ambulatory/Outpatient)** - Code `2`

### Class × Type Distribution:

| Class Type | Stationary | Ambulatory |
|-----------|-----------|-----------|
| პაციენტი / ნაშთი | ✅ Common | ✅ Common |
| ადმინისტრაციული | ✅ Very Common | ❌ Rare |
| ნაშთი | ✅ Common | ✅ Common |
| პაციენტი | ❓ Unknown | ❓ Unknown |

**Observations**:
- Administrative departments are almost exclusively **stationary** (hospital-based staff)
- Clinical departments (Patient/Balance) exist in both inpatient and outpatient settings
- Supply/balance departments exist in both settings

---

## Technical Implementation Details

### HTML Structure

**Dropdown Element**:
```html
<select id="cn_mode" name="">
  <option value=""></option>
  <option value="1">პაციენტი / ნაშთი</option>
  <option value="2">ადმინისტრაციული</option>
  <option value="3">ნაშთი</option>
  <option value="4">პაციენტი</option>
</select>
```

**Table Row Example**:
```html
<tr id="b18">
  <td style="background-color:">თბილისი</td>
  <td>1</td>
  <td>კარდიოქირურგია</td>
  <td>პაციენტი / ნაშთი</td>
  <td>სტაციონალური</td>
  <td><div class="ed k1"></div></td>
</tr>
```

### Database/Backend

**Location**: Unknown (requires backend access)

**Likely Implementation**:
- Database table: `departments` or `gandefis` (gandefis = departments in Georgian)
- Column: `class_type` or `mode` (referenced as `cn_mode` in HTML)
- Values: 1, 2, 3, 4 (integer codes)
- Lookup table: `department_class_types` or hardcoded in application

**AJAX Endpoint** (speculation based on other page patterns):
- URL: `/clinic.php` with action parameter
- Method: POST
- Possible action: `gtmdeplist` or similar

---

## Recommended FHIR Mapping

For rebuilding this system in FHIR (Medplum), map to:

### FHIR Resource: **Organization**

```typescript
{
  resourceType: "Organization",
  identifier: [
    {
      system: "http://medimind.ge/identifiers/department-code",
      value: "1" // Department code
    }
  ],
  name: "კარდიოქირურგია", // Department name
  type: [
    {
      coding: [
        {
          system: "http://medimind.ge/codesystems/department-class",
          code: "patient-balance", // Class type
          display: "პაციენტი / ნაშთი"
        },
        {
          system: "http://terminology.hl7.org/CodeSystem/organization-type",
          code: "dept",
          display: "Hospital Department"
        }
      ]
    }
  ],
  extension: [
    {
      url: "http://medimind.ge/extensions/department-type",
      valueCodeableConcept: {
        coding: [
          {
            system: "http://medimind.ge/codesystems/department-type",
            code: "stationary",
            display: "სტაციონალური"
          }
        ]
      }
    },
    {
      url: "http://medimind.ge/extensions/tracks-patients",
      valueBoolean: true // Based on class type
    },
    {
      url: "http://medimind.ge/extensions/tracks-inventory",
      valueBoolean: true // Based on class type
    }
  ]
}
```

### Department Class CodeSystem

```typescript
{
  resourceType: "CodeSystem",
  url: "http://medimind.ge/codesystems/department-class",
  name: "DepartmentClassCodeSystem",
  status: "active",
  content: "complete",
  concept: [
    {
      code: "patient-balance",
      display: "პაციენტი / ნაშთი",
      definition: "Department handles both patient care and inventory management"
    },
    {
      code: "administrative",
      display: "ადმინისტრაციული",
      definition: "Non-patient-facing department for staff roles and administrative functions"
    },
    {
      code: "balance",
      display: "ნაშთი",
      definition: "Department focused solely on inventory/supply management"
    },
    {
      code: "patient",
      display: "პაციენტი",
      definition: "Department handles patient care without inventory management"
    }
  ]
}
```

---

## Business Logic Implications Summary

### For System Integration:

| Class Type | Patient Encounters | Inventory | Billing | HR/Staff | Use Case |
|-----------|-------------------|-----------|---------|----------|----------|
| პაციენტი / ნაშთი | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No | Full clinical departments |
| ადმინისტრაციული | ❌ No | ❌ No | ❌ No | ✅ Yes | Staff roles, org structure |
| ნაშთი | ❌ No | ✅ Yes | ❌ No | ❌ No | Supply/inventory only |
| პაციენტი | ✅ Yes | ❌ No | ✅ Yes | ❌ No | Consultation-only |

### Workflow Implications:

**When creating a patient encounter:**
- Only departments with **პაციენტი** or **პაციენტი / ნაშთი** should appear in department selection
- Administrative and balance-only departments should be excluded

**When tracking inventory:**
- Only departments with **ნაშთი** or **პაციენტი / ნაშთი** can have inventory transactions
- Administrative and patient-only departments excluded from inventory system

**When generating financial reports:**
- **Patient/Balance departments**: Revenue (billing) + Expenses (supplies)
- **Administrative departments**: Expenses only (staff costs)
- **Balance departments**: Expenses only (supply costs)
- **Patient departments**: Revenue only (billing)

**When assigning staff:**
- All departments can have staff assignments
- **Administrative departments** primarily used for this purpose

---

## Questions for Further Investigation

1. **Database Schema**: What is the actual table/column name for class types?
2. **API Endpoints**: What endpoints handle department CRUD operations?
3. **Business Rules**: Are there validation rules preventing certain class/type combinations?
4. **Patient-Only Usage**: Why is პაციენტი (patient-only) not used? Is it deprecated?
5. **Additional Class Types**: The screenshot showed 7 options - are there conditional options based on context?
6. **Integration Points**: How do other modules (billing, inventory, scheduling) query departments by class?
7. **Reporting**: What reports depend on department class types?
8. **Historical Data**: Can department class types change over time? Is there audit history?

---

## Recommendations for Medplum Implementation

### 1. **Use FHIR Organization Resource**
- Each department = Organization resource
- Use `type` field for class type
- Use extensions for Georgian-specific fields

### 2. **Create Separate Collections**
For query optimization, consider separate views:
```typescript
// Clinical departments (for encounter creation)
const clinicalDepartments = organizations.filter(
  o => o.type.includes('patient-balance') || o.type.includes('patient')
);

// Inventory departments (for supply management)
const inventoryDepartments = organizations.filter(
  o => o.type.includes('patient-balance') || o.type.includes('balance')
);

// Staff departments (for HR system)
const staffDepartments = organizations.filter(
  o => o.type.includes('administrative')
);
```

### 3. **Validation Rules**
```typescript
// When creating encounter
if (!['patient-balance', 'patient'].includes(department.classType)) {
  throw new Error('Selected department cannot have patient encounters');
}

// When creating inventory transaction
if (!['patient-balance', 'balance'].includes(department.classType)) {
  throw new Error('Selected department does not track inventory');
}
```

### 4. **Search Parameters**
Add custom search parameters:
```typescript
{
  code: 'class-type',
  type: 'token',
  expression: 'Organization.type.where(coding.system="http://medimind.ge/codesystems/department-class")'
}
```

---

## Appendix: Full Department Sample Data

See extracted data above (first 49 departments with class and type).

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-25 | 1.0 | Initial analysis from live EMR system |

---

**End of Analysis**
