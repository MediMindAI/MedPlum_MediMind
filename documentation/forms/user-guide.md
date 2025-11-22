# FHIR Form Builder User Guide

This guide covers how to create, fill out, and manage forms in the MediMind EMR system.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating a Form Template](#creating-a-form-template)
3. [Configuring Fields](#configuring-fields)
4. [Setting Up Conditional Logic](#setting-up-conditional-logic)
5. [Filling Out Forms](#filling-out-forms)
6. [Searching Completed Forms](#searching-completed-forms)
7. [Exporting to PDF](#exporting-to-pdf)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Accessing the Form Builder

1. Log in to the MediMind EMR system
2. Navigate to **Forms** in the main menu
3. You will see the form management dashboard

### User Permissions

- **View Forms**: All clinical staff can view and fill out forms
- **Create/Edit Templates**: Requires admin permission
- **Delete Forms**: Requires admin permission

---

## Creating a Form Template

### Step 1: Start a New Form

1. Click **New Form** button in the forms dashboard
2. Enter the form details:
   - **Title**: Give your form a descriptive name (e.g., "Patient Consent Form")
   - **Description**: Briefly describe the form's purpose
   - **Category**: Select a category (Consent, Assessment, History, etc.)
   - **Status**: Start with "Draft" while building

### Step 2: Add Fields

The form builder has three main panels:

| Panel | Location | Purpose |
|-------|----------|---------|
| Field Palette | Left | Drag fields from here |
| Form Canvas | Center | Drop and arrange fields |
| Properties | Right | Configure selected field |

#### Available Field Types

| Field Type | Use Case | Example |
|------------|----------|---------|
| Text | Short text input | Patient name, ID numbers |
| Text Area | Long text | Medical history, notes |
| Number | Numeric values | Age, weight, dosage |
| Date | Calendar selection | Birth date, visit date |
| Date/Time | Date with time | Appointment time |
| Checkbox | Yes/No questions | Has allergies? |
| Radio | Single choice | Gender selection |
| Dropdown | Multiple options | Insurance provider |
| Signature | Digital signature | Patient consent |
| Group | Organize fields | Personal Information section |

### Step 3: Arrange Fields

- **Drag and drop** to reorder fields
- **Group related fields** using the Group field type
- Use **sections** to organize long forms

### Step 4: Save Your Form

- Click **Save Draft** to save without publishing
- Click **Publish** to make the form available for use

---

## Configuring Fields

### Basic Properties

Every field has these basic properties:

1. **Label**: The question or prompt shown to users
2. **Link ID**: Unique identifier (auto-generated, can customize)
3. **Required**: Toggle to make field mandatory
4. **Help Text**: Additional instructions for the user

### Validation Rules

Set validation to ensure data quality:

| Validation | Available For | Example |
|------------|---------------|---------|
| Min/Max Length | Text | 5-100 characters |
| Min/Max Value | Number | Age between 0-120 |
| Pattern (Regex) | Text | Email format |
| Date Range | Date | Not in future |

### Patient Data Binding

Auto-populate fields from patient records:

1. Select a field
2. In Properties panel, enable **Patient Binding**
3. Choose the binding source:
   - Patient name
   - Personal ID
   - Date of birth
   - Address
   - Phone number
   - And more...

Fields with patient binding will be pre-filled when filling out the form for a patient.

---

## Setting Up Conditional Logic

### Show/Hide Fields Based on Answers

Example: Show allergy details only if patient has allergies

1. Create a checkbox field "Has Allergies?"
2. Create a text field "Allergy Details"
3. Select "Allergy Details" field
4. In Properties, go to **Conditional Display**
5. Configure:
   - **Source Field**: "Has Allergies?"
   - **Operator**: "equals"
   - **Value**: true
6. The allergy details field will only show when checkbox is checked

### Available Operators

| Operator | Use Case |
|----------|----------|
| equals | Exact match |
| not equals | Exclude value |
| contains | Text contains string |
| greater than | Number comparison |
| less than | Number comparison |
| is empty | Field has no value |
| is not empty | Field has a value |

### Multiple Conditions

You can combine conditions with AND/OR logic:

- **AND**: All conditions must be true
- **OR**: Any condition can be true

---

## Filling Out Forms

### Starting a Form

1. Select a patient from the patient list
2. Click **New Form** or find the form in **Forms** section
3. Choose the form template to fill out

### Filling Fields

- Required fields are marked with a red asterisk (*)
- Patient data is auto-populated where configured
- Help text appears below fields when available

### Auto-Save

The form automatically saves your progress:
- Changes are saved every 30 seconds
- A save indicator shows "Saved" or "Saving..."
- You can close and return to continue later

### Draft Recovery

If you have an unsaved draft:
1. A notification will appear when you return
2. Choose **Restore Draft** to continue from where you left off
3. Choose **Start Fresh** to begin a new form

### Submitting the Form

1. Fill all required fields
2. Review your entries
3. Click **Submit**
4. The form is saved as "Completed"

---

## Searching Completed Forms

### Basic Search

1. Go to **Forms** > **Search**
2. Enter search criteria:
   - Patient name or ID
   - Form type
   - Date range
   - Status (Completed, In Progress, Draft)

### Advanced Filters

| Filter | Description |
|--------|-------------|
| Patient | Search by patient name or ID |
| Form Type | Filter by form template |
| Date Range | Forms within date period |
| Status | Completed, In Progress, Draft |
| Author | Staff member who filled form |

### Full-Text Search

Search within form answers:
1. Enter keywords in the search box
2. Results show forms containing those keywords
3. Matching text is highlighted

### Sorting Results

Click column headers to sort by:
- Date (newest/oldest first)
- Patient name (A-Z / Z-A)
- Form type
- Status

---

## Exporting to PDF

### Single Form Export

1. Open the completed form
2. Click **Export PDF** button
3. Choose options:
   - Include patient header
   - Include signatures
   - Print-friendly formatting
4. Click **Download PDF**

### Batch Export

1. Select multiple forms using checkboxes
2. Click **Export Selected**
3. Forms are combined into a single PDF or separate files

### Print Preview

1. Click **Print** button
2. Browser print dialog opens
3. The form is formatted for printing:
   - Navigation hidden
   - Page breaks at sections
   - Patient info in header

### PDF Contents

The PDF includes:
- Form title and date
- Patient information (name, ID, DOB)
- All questions and answers
- Signatures (if captured)
- Footer with generation date

---

## Troubleshooting

### Common Issues

#### Form Won't Submit

**Symptoms**: Submit button is disabled or error appears

**Solutions**:
1. Check all required fields are filled
2. Look for validation errors (red borders)
3. Scroll through form to find missing fields
4. Try refreshing the page

#### Patient Data Not Auto-Filling

**Symptoms**: Fields with patient binding show empty

**Solutions**:
1. Ensure a patient is selected
2. Check if the patient has the required data
3. Verify field binding is configured correctly
4. Contact admin if bindings need adjustment

#### Draft Not Recovered

**Symptoms**: Previous work is lost

**Solutions**:
1. Check browser localStorage is not cleared
2. Ensure you're logged in as the same user
3. Drafts expire after 7 days by default
4. Server-side drafts require save action

#### PDF Export Fails

**Symptoms**: PDF download doesn't start or is corrupted

**Solutions**:
1. Try a different browser
2. Disable ad blockers temporarily
3. Check popup blockers
4. Try print option instead

### Getting Help

If you encounter issues:

1. **Check this guide** for solutions
2. **Contact IT Support** for technical issues
3. **Contact Admin** for permission issues

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl + S | Save draft |
| Ctrl + Enter | Submit form |
| Ctrl + Z | Undo (in builder) |
| Ctrl + Y | Redo (in builder) |
| Tab | Move to next field |
| Shift + Tab | Move to previous field |
| Esc | Close modal/panel |

---

## Best Practices

### For Form Builders

1. **Keep forms focused** - One purpose per form
2. **Use sections** - Group related fields
3. **Add help text** - Guide users on complex fields
4. **Test thoroughly** - Fill out form before publishing
5. **Use patient binding** - Reduce manual data entry

### For Form Fillers

1. **Review before submitting** - Check all answers
2. **Use tab key** - Navigate efficiently
3. **Save frequently** - Don't rely only on auto-save
4. **Report issues** - Help improve the forms

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2025-11 | Added conditional logic, signatures |
| 1.5 | 2025-10 | Added patient data binding |
| 1.0 | 2025-09 | Initial release |

---

*Last updated: November 2025*
*MediMind EMR System - FHIR Form Builder*
