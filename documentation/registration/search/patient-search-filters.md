# Patient Search Filters

## Overview

This document describes the search panel used to filter the patient list in the Registration module. The search panel provides four text-based search fields and a filter button to help users quickly locate specific patients in the system.

## Search Fields

| Field ID | Label (Georgian) | English Translation | Type | Search Method | Notes |
|----------|------------------|---------------------|------|---------------|-------|
| r_fname | სახელი: | First Name | text | Partial matching | Case-insensitive substring search |
| r_lname | გვარი: | Last Name | text | Partial matching | Case-insensitive substring search |
| r_prsno | პირადი ნომერი: | Personal ID Number | text | Partial matching | National identification number |
| r_hisno | რიგითი ნომერი: | Registration Number | text | Partial matching | Hospital registration/record number |

### Field Details

**r_fname (First Name)**
- Type: text
- Placeholder: Empty
- Purpose: Search patients by first name
- Matching: Partial/substring matching

**r_lname (Last Name)**
- Type: text
- Placeholder: Empty
- Purpose: Search patients by last name
- Matching: Partial/substring matching

**r_prsno (Personal ID Number)**
- Type: text
- Placeholder: Empty
- Purpose: Search by national personal identification number
- Matching: Partial/substring matching
- Note: Primary unique identifier for citizens

**r_hisno (Registration Number)**
- Type: text
- Placeholder: Empty
- Purpose: Search by hospital-assigned registration/record number
- Matching: Partial/substring matching
- Note: Internal hospital identifier

## Filter Button

**regfltr**
- Type: button
- Icon: 🔍 (search/filter icon)
- Function: Apply search filters to patient list
- Action: Triggers filtering of the Patient List Table based on entered criteria

## Behavior

### Filter Logic
- **Combination**: All non-empty filters are combined with AND logic
  - Example: If "სახელი" (First Name) = "ნინო" AND "გვარი" (Last Name) = "გელაშვილი", only patients matching both criteria are displayed
- **Empty Filters**: Fields left empty are ignored in the search
- **No Filters**: When all fields are empty, the system displays all patients or the most recent entries based on default sorting

### Search Execution
1. User enters search criteria in one or more fields
2. User clicks the `regfltr` (🔍) button
3. System filters the Patient List Table to show only matching records
4. Results are displayed in real-time in the Patient List Table

### Text Matching
- **Case-Insensitive**: Search is assumed to be case-insensitive for all text fields
- **Partial Matching**: Users can enter partial values (e.g., "გელა" will match "გელაშვილი")
- **Substring Search**: Matching occurs anywhere within the field value, not just at the beginning

## Relationship to Patient List

The search filters directly affect the **Patient List Table** display:
- Filters reduce the visible records in the table to only those matching the search criteria
- The table dynamically updates when filters are applied
- All table columns remain visible; only the rows (patient records) are filtered
- Users can clear filters by emptying the search fields and clicking the filter button again

## Integration Points

- **Patient List Table**: Primary target of search filters
- **Patient Registration Form**: Selected patients from filtered results can be opened for editing
- **Database Query**: Filters are translated into database queries to retrieve matching patient records

## Source

- Source File: `/Users/toko/Desktop/SoftMedicMap/რეგისტრაცია_რეგისტრაცია.md`
- Lines: 108-142
- Section: Search Panel Fields
