# Patient List Table

## Location
**Module**: Registration
**Page**: Patient List View
**Component Type**: Data Table

## Purpose
The patient list table displays all registered patients in the EMR system with key identifying information and action controls. This table provides a searchable, paginated view of patient records for quick access and management.

## Data Source
Patient records from the main patient registration database, including personal identification, demographics, and contact information.

## Column Structure

| # | Column Header | Data Type | Width | Format/Rules | Description |
|---|---------------|-----------|-------|--------------|-------------|
| 1 | **ნომერი #** | Integer | Narrow | Sequential numbering | Row number/sequence in the current table view |
| 2 | **პირადი #** | String | Medium | 11 digits | Personal ID number (Georgian national ID) |
| 3 | **სახელი** | String | Medium | Text | Patient's first name |
| 4 | **გვარი** | String | Medium | Text | Patient's last name |
| 5 | **დაბ. თარიღი** | Date | Medium | DD-MM-YYYY | Date of birth |
| 6 | **სქესი** | String | Medium | მამრობითი/მდედრობითი | Gender (Male/Female in Georgian) |
| 7 | **ტელეფონი** | String | Medium | "; +995XXXXXXXXX" | Phone number with prefix "; " |
| 8 | **მისამართი** | String | Wide | Text with "..." truncation | Address with action icons (✏️ edit, ⊗ delete) |

## Row Behavior

### Action Icons
Located in the last column (მისამართი) after the address text:
- **✏️ Edit Icon**: Opens patient record for editing
- **⊗ Delete Icon**: Triggers patient record deletion (with confirmation)

### Interaction
- **Row Click**: Selects the row or opens patient details
- **Icon Hover**: Changes cursor to pointer indicating clickable action
- **Edit Action**: Opens patient registration form in edit mode
- **Delete Action**: Shows confirmation dialog before permanent deletion

## Sample Data

The following examples show actual patient records as displayed in the system:

| ნომერი # | პირადი # | სახელი | გვარი | დაბ. თარიღი | სქესი | ტელეფონი | მისამართი |
|---------|----------|--------|-------|------------|------|-----------|-----------|
| 98960 | 26001014632 | თენგიზი | ხოზვრია | 26-01-1986 | მამრობითი | ; 995500050610 | საქართველო, თბილის... ✏️ ⊗ |
| 98959 | 31001018206 | დომენტი | ხოშახაშვილი | 31-10-1978 | მამრობითი | ; 995579477799 | თბილისი ს. დიდობა ✏️ ⊗ |
| 98958 | 00000000000 | თეიმურაზ | ხუბუნაშვილი | 31-01-1994 | მამრობითი | ; 995551595700 | საქართველო თბილის... ✏️ ⊗ |
| 98957 | 01029034510 | ოთარ | ხუციშვილი | 01-02-1990 | მამრობითი | ; 995568020815 | საქართველო თბილის... ✏️ ⊗ |
| 98954 | 01027034521 | დავითა | ჯაფარიძე | 01-02-1992 | მამრობითი | ; 995593353333 | მარტყოფიდორფი, გა... ✏️ ⊗ |
| 98953 | 61001001326 | გელა | ჯაფარიძე | 01-01-1950 | მამრობითი | ; 995577332211 | შალვა დადიანის ქუჩ... ✏️ ⊗ |
| 98952 | 60001015705 | ფიქრია | ჯინჯიხაძე | 01-01-1960 | მამრობითი | ; 995593593593 | ჩაიკოვსკის ქუჩა თბ... ✏️ ⊗ |
| 98951 | 60001046001 | ზურაბი | ჯოჯუა | 01-01-1960 | მამრობითი | ; 995577987789 | საქართველო, თბილის... ✏️ ⊗ |

### Data Observations
- All sample records show male patients (მამრობითი)
- Personal IDs follow standard 11-digit format
- Some records use placeholder ID (00000000000) for unverified patients
- Phone numbers consistently use "; " prefix before the country code (995)
- Addresses frequently contain Georgian place names (საქართველო, თბილისი)
- Row numbers are in descending order (newest registrations have higher numbers)

## Display Rules

### Address Truncation
- **Rule**: Address text is truncated with ellipsis "..." when it exceeds the column width
- **Format**: `[Location prefix]...` (e.g., "საქართველო, თბილის...")
- **Full Text Access**: Hover tooltip or detail view shows complete address
- **Truncation Point**: Typically after 20-25 characters depending on column width

### Phone Number Prefix
- **Format**: All phone numbers are prefixed with "; " (semicolon and space)
- **Standard Format**: 995XXXXXXXXX (Georgian country code 995 followed by 9 digits)
- **Display Example**: `; 995500050610`
- **Note**: The "; " prefix is a system convention for phone number display

### Date Format
- **Standard**: DD-MM-YYYY (day-month-year)
- **Separator**: Hyphen (-)
- **Leading Zeros**: Day and month are zero-padded (e.g., 05-03-1985)
- **Examples**: `26-01-1986`, `31-10-1978`, `01-02-1990`

### Gender Display
- **მამრობითი**: Male (masculine in Georgian)
- **მდედრობითი**: Female (feminine in Georgian)
- **Values**: Only these two options are displayed

### Row Numbering
- **Sequential**: Numbers start from 1 and increment for each visible row
- **Dynamic**: Row numbers update when table is sorted, filtered, or paginated
- **Non-consecutive**: Gaps may exist in numbering (98960, 98959, 98958, 98957, 98954...)
- **Purpose**: Row numbers may represent unique patient record IDs rather than display sequence

## Functional Behavior

### Sorting
- Table appears sorted by row number in descending order by default
- Column headers likely support click-to-sort functionality
- Common sort fields: Personal ID, Name, Birth Date

### Pagination
- Large patient lists are paginated
- Navigation controls for moving between pages
- Page size configuration may be available

### Search and Filtering
- Search functionality to filter visible records
- Likely supports searching across multiple fields (name, ID, phone)
- Real-time or submit-based filtering

## Integration Points
- **Patient Registration Form**: Links to detailed patient records when edit icon is clicked
- **Patient Detail View**: Row click may open full patient profile
- **Delete Confirmation**: Delete action triggers confirmation dialog before permanent removal
- **Search Module**: Integrates with patient search functionality

## User Permissions
- View access: Required to see patient list
- Edit access: Required to see and use edit icon (✏️)
- Delete access: Required to see and use delete icon (⊗)
- Role-based visibility: Certain user roles may have read-only access

## Technical Notes
- Georgian language (ქართული) is the primary display language
- Character encoding must support Georgian Unicode characters
- Table likely implemented with pagination component for performance
- Row numbers suggest auto-incrementing primary key system

## Source
**Screenshot Reference**: `/var/folders/.../Screenshot 2025-11-10 at 13.18.10.png`
**Documentation Date**: 2025-11-10
**Documented By**: Claude Code
**Analysis Method**: Screenshot analysis and structural documentation
