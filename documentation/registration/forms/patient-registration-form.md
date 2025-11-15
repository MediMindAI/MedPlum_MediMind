# Patient Registration Form Documentation

## Form Overview

The Patient Registration Form is the primary data entry interface for registering new patients in the EMR system. This form captures comprehensive patient information including personal identification, contact details, and demographic data.

**Form Context**: Located in the Registration (რეგისტრაცია) > Registration (რეგისტრაცია) subsection

---

## Contact Information

This section captures all patient contact details including phone numbers, address, workplace, and email.

### Contact Fields Table

| Field ID | Label (Georgian) | Label (English) | Type | Required | Format/Validation | Notes |
|----------|------------------|-----------------|------|----------|-------------------|-------|
| ri_fon | ტელეფონი | Telephone | Text with country code selector | No | 555 12 34 56 | Default country code: +995 (Georgia) |
| ri_meug | ტელეფონი | Phone | Tel | No | XXX XX XX XX | Phone input with country code selector, default +995 (Georgia) |
| ri_addr | იურიდიული მისამართი | Legal Address | Text | No | Free text | Patient's legal/registered address |
| ri_work | სამუშაო ადგილი | Workplace | Text | No | Free text | Patient's place of employment |
| ri_email | იმეილი | Email | Text | No | Email format | Patient's email address, validated for email format |

### Field Details

#### Phone Number Field (ri_fon)
- **Field ID**: ri_fon
- **Label**: ტელეფონი (Telephone)
- **Type**: Text input with country code selector
- **Required**: No
- **Format**: 555 12 34 56
- **Country Code**: +995 (Georgia)
- **Description**: Phone contact for the patient with Georgian country code selector

#### Phone Number Field (ri_meug)
- **Field ID**: ri_meug
- **Label**: ტელეფონი (Phone)
- **Type**: Tel input with country code selector
- **Required**: No
- **Format**: XXX XX XX XX
- **Placeholder**: 555 12 34 56
- **Country Code**: +995 (Georgia)
- **Description**: Telephone input field with country code selector for international phone numbers
- **Source**: Lines 193-198

#### Legal Address Field (ri_addr)
- **Field ID**: ri_addr
- **Label**: იურიდიული მისამართი (Legal Address)
- **Type**: Text
- **Required**: No
- **Format**: Free text input
- **Description**: Patient's official legal or registered address
- **Source**: Lines 200-205

#### Workplace Field (ri_work)
- **Field ID**: ri_work
- **Label**: სამუშაო ადგილი (Workplace)
- **Type**: Text
- **Required**: No
- **Format**: Free text input
- **Description**: Name and/or address of patient's place of employment
- **Source**: Lines 207-212

#### Email Field (ri_email)
- **Field ID**: ri_email
- **Label**: იმეილი (Email)
- **Type**: Text
- **Required**: No
- **Format**: Email format validation
- **Description**: Patient's email address for digital communication
- **Validation**: Must follow standard email format (user@domain.ext)
- **Source**: Lines 214-219

### Contact Information Notes

- All contact fields are optional (not required for registration)
- Phone fields (ri_fon, ri_meug) include country code selector with Georgia (+995) as default
- Email field validates for proper email format structure
- Multiple phone number fields may indicate primary/secondary contact options
- Legal address is specifically for official/registered address (not necessarily current residence)

---

## Gender Selection

### Gender Dropdown

**Field Details**:
- **Field ID**: ri_sqs
- **Label**: სქესი* (Gender)
- **Type**: Dropdown/Select
- **Required**: Yes (marked with asterisk)
- **Input Source**: Georgian EMR system line 354-373

**Description**:
Dropdown field for selecting the patient's biological sex/gender. The field has two primary options (Male and Female) with an empty default option for initial state.

**Options Table**:

| Value | Georgian Text | English Equivalent | Status |
|-------|---------------|--------------------|--------|
| (empty) | (empty) | Default/No Selection | Initial state |
| 1 | მამრობითი | Male | Primary option |
| 2 | მდედრობითი | Female | Primary option |

**Field Properties**:
- **Total Options**: 3 (including empty default)
- **Selectable Options**: 2 (Male, Female)
- **Default State**: Empty selection
- **Validation**: Must select a value before form submission (required field)

**Source Reference**:
- **Source File**: რეგისტრაცია_რეგისტრაცია.md
- **Lines**: 354-373
- **JSON Field Name**: ri_sqs

---

## Related Fields

This field is part of the core patient demographics section and works in conjunction with:
- Personal identification fields (name, personal number)
- Contact information (phone number, address)
- Citizenship/residency information

---

## Citizenship Information

### Citizenship Dropdown

**Field Details**:
- **Field ID**: mo_moq
- **Label**: მოქალაქეობა (Citizenship)
- **Type**: Dropdown/Select
- **Required**: No
- **Input Source**: Georgian EMR system lines 374-1380

**Description**:
Dropdown field for selecting patient citizenship from a comprehensive list of 250 countries and territories worldwide. This field allows the EMR system to track patient citizenship for regulatory, statistical, and administrative purposes.

**Options Overview**:
- **Total Options**: 251 (including empty default)
- **Selectable Options**: 250 countries and territories
- **Default State**: Empty selection
- **Format**: Numeric values with Georgian language country names

**Notable Options**:
- Value 184: საქართველო (Georgia) - Primary country for this EMR system
- Value 170: რუსეთი (Russia) - Neighboring country
- Value 9: ამერიკის შეერთებული შტატები (United States)
- Value 46: გერმანია (Germany)
- Value 56: დიდი ბრიტანეთი (Great Britain)

**Complete Options Reference**:
For the complete list of all 250 citizenship options with values and translations, see:
[Citizenship Options Appendix](../appendices/citizenship-options.md)

**Source Reference**:
- **Source File**: რეგისტრაცია_რეგისტრაცია.md
- **Lines**: 374-1380
- **JSON Field Name**: mo_moq

---

## Notes

- Gender is a required field for patient registration
- The field uses numeric values (1, 2) for storage with Georgian language labels for display
- Empty option provides user-friendly dropdown initialization
- This field is essential for EMR compliance and patient record accuracy
- Citizenship field contains 250 countries/territories - see appendix for complete list

---

*Documentation Created: 2025-11-10*
*Last Updated: 2025-11-10*
*Status: In Progress - Contact Information, Gender, and Citizenship sections documented*
