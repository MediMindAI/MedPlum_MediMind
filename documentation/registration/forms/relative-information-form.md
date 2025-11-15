# Patient Relative/Representative Information Form

## Overview

This form captures detailed information about the patient's family members or legal representatives. The system allows associating multiple relatives with a single patient record, including their personal identification, contact details, and relationship type to the patient. This information is crucial for emergency contacts, legal guardianship, and family medical history tracking.

## Relative Information Fields

All fields in this section are **optional** unless explicitly marked as required.

| Field ID | Label (Georgian) | Label (English) | Type | Required | Validation Rules | Description |
|----------|------------------|-----------------|------|----------|------------------|-------------|
| `ri_natlname` | სახელი | First Name | Text | No | - | Relative's first name |
| `ri_natfname` | გვარი | Last Name | Text | No | - | Relative's last name (family name) |
| `ri_natpersno` | პირადი ნომერი | Personal ID Number | Text | No | Should be 11-digit Georgian national ID format | Relative's national identification number |
| `ri_natbrth` | დაბადების თარიღი | Birth Date | Date | No | Valid date format | Relative's date of birth |
| `ri_nattel` | ტელ | Phone Number | Text | No | Phone number format | Relative's contact phone number |
| `ri_nataddr` | მისამართი | Address | Text | No | - | Relative's residential address |

## Relationship Type Dropdown

The relationship type dropdown (`mo_natkav`) defines how the relative is related to the patient. This field uses predefined relationship categories.

### Field Details
- **Field ID**: `mo_natkav`
- **Label**: ნათესავი (Relative/Relationship)
- **Type**: Dropdown (Single Select)
- **Required**: Optional
- **Default**: Empty (no selection)

### Relationship Options

| Value | Georgian Label | English Translation | Description |
|-------|----------------|---------------------|-------------|
| 1 | დედა | Mother | Patient's biological or adoptive mother |
| 2 | მამა | Father | Patient's biological or adoptive father |
| 3 | და | Sister | Patient's sister |
| 4 | ძმა | Brother | Patient's brother |
| 5 | ბებია | Grandmother | Patient's grandmother (maternal or paternal) |
| 6 | ბაბუა | Grandfather | Patient's grandfather (maternal or paternal) |
| 7 | შვილი | Child | Patient's son or daughter |
| 8 | მეუღლე | Spouse | Patient's husband or wife |
| 9 | ნათესავი | Relative | General relative (unspecified relationship) |
| 10 | ნათესავი დედის მხრიდან | Maternal Relative | Relative from mother's side of family |
| 11 | ნათესავი მამის მხრიდან | Paternal Relative | Relative from father's side of family |

## Business Logic

### Multiple Relatives Support
- The system allows associating multiple relatives with a single patient record
- Each relative entry is stored as a separate record linked to the patient
- No limit is imposed on the number of relatives that can be added

### Data Entry Rules
1. All fields are optional to accommodate varying levels of available information
2. Personal ID number (`ri_natpersno`) should follow the 11-digit Georgian national ID format when provided
3. Birth date (`ri_natbrth`) should be validated as a valid date
4. Phone number (`ri_nattel`) should accept standard Georgian phone number formats
5. Relationship type dropdown allows selecting from predefined categories or leaving empty

### Validation
- No mandatory validation rules since all fields are optional
- When Personal ID is provided, the system may validate against the Georgian national ID format (11 digits)
- Date fields should be validated to prevent future dates or invalid date values
- Phone number format validation for proper entry

### Use Cases
1. **Emergency Contact**: Recording emergency contact person with their phone and address
2. **Legal Guardian**: For minors or incapacitated patients, recording guardian information
3. **Family Medical History**: Tracking family relationships for genetic and hereditary condition documentation
4. **Next of Kin**: Identifying family members for notification and decision-making purposes

## Integration Points

### Related Forms
- **Patient Registration Form**: Relative information is captured as part of or linked to the main patient registration
- **Patient Demographics**: Relative data complements the patient's own demographic information

### Data Relationships
- Each relative record is linked to a specific patient via patient ID
- Multiple relative records can exist for one patient
- Relationship type links to the relationship reference table (`mo_natkav` dropdown values)

## Source References

**Source File**: `/Users/toko/Desktop/SoftMedicMap/რეგისტრაცია_რეგისტრაცია.md`

**Field Definitions**: Lines 228-268
- `ri_natlname` (line 228-232): Relative first name
- `ri_natfname` (line 235-239): Relative last name
- `ri_natpersno` (line 242-246): Relative personal ID number
- `ri_natbrth` (line 249-253): Relative birth date
- `ri_nattel` (line 256-260): Relative phone number
- `ri_nataddr` (line 263-267): Relative address

**Relationship Dropdown**: Lines 1381-1435
- `mo_natkav` dropdown with 11 relationship type options

---

*Documentation created as part of EMR system mapping project*
