# Medical Services Nomenclature Import

This directory contains scripts for importing medical services from Excel/Numbers files into the FHIR-based Medplum system.

## Files

- `import-nomenclature.ts` - Main import script that parses spreadsheet and creates ActivityDefinition resources
- `README-IMPORT.md` - This file

## Prerequisites

1. **Medplum Server Running**
   ```bash
   docker-compose up -d
   ```

2. **Environment Variables**
   Create a `.env` file in the project root with:
   ```bash
   MEDPLUM_BASE_URL=http://localhost:8103
   MEDPLUM_CLIENT_ID=your-client-id
   MEDPLUM_CLIENT_SECRET=your-client-secret
   ```

3. **Data File Preparation**
   - The import script expects a spreadsheet file at:
     `documentation/xsl/სამედიცინო სერვისების ცხრილი.numbers`

   - **If using Apple Numbers format (.numbers):**
     1. Open the file in Numbers app
     2. Go to File → Export To → Excel...
     3. Save as `.xlsx` format
     4. Update the file path in `import-nomenclature.ts` if needed

   - **Required columns:**
     - `ID` - Unique ID (optional)
     - `კოდი` - Service code (required, unique)
     - `დასახელება` - Service name (required)
     - `სამედიცინო დასახელება` - Medical description (optional)
     - `ჯგუფი` - Service group (required)
     - `ტიპი` - Service type (required)
     - `ფასი` - Price (optional)
     - `ჯამი` - Total amount (optional)
     - `კალკულაციის დათვლა` - Calculation method (optional)
     - `შექმნის თარიღი` - Created date (optional)
     - `ტეგები` - Tags (optional)
     - `LIS ინტეგრაცია` - LIS integration flag (0/1)
     - `LIS პროვაიდერი` - LIS provider name (optional)
     - `გარე შეკვეთის კოდი` - External order code (optional)
     - `GIS კოდი` - GIS code (optional)

## Usage

### Step 1: Convert .numbers to .xlsx (if needed)

If your file is in Apple Numbers format:

```bash
# Option A: Use Numbers app
open "documentation/xsl/სამედიცინო სერვისების ცხრილი.numbers"
# Then: File → Export To → Excel → Save as .xlsx

# Option B: Use command-line conversion (requires Numbers app)
osascript -e 'tell application "Numbers"
  set theDoc to open POSIX file "/Users/toko/Desktop/medplum_medimind/documentation/xsl/სამედიცინო სერვისების ცხრილი.numbers"
  export theDoc to POSIX file "/Users/toko/Desktop/medplum_medimind/documentation/xsl/სამედიცინო სერვისების ცხრილი.xlsx" as Excel
  close theDoc
end tell'
```

### Step 2: Run the import script

```bash
# From project root
npx tsx scripts/import-nomenclature.ts
```

### Step 3: Monitor progress

The script will:
1. Parse the spreadsheet file
2. Validate each row
3. Create ActivityDefinition resources in batches of 100
4. Log progress every 100 services
5. Generate an error report if any imports fail

### Step 4: Review results

- **Success:** All services imported
- **Errors:** Check `logs/nomenclature-import-errors.json` for details
- **Verify:** Open the Nomenclature page in the UI to see imported services

## FHIR Mapping

The script maps spreadsheet columns to FHIR ActivityDefinition resources:

| Excel Column | FHIR Field | Notes |
|--------------|------------|-------|
| კოდი (Code) | `identifier[].value` | Unique service code |
| დასახელება (Name) | `title` | Service name |
| სამედიცინო დასახელება | `description` | Medical description |
| ჯგუფი (Group) | `topic[].text` | Service group |
| ტიპი (Type) | `extension[service-type]` | Internal/External/etc. |
| ფასი (Price) | `extension[base-price]` | Base price in GEL |
| ჯამი (Total) | `extension[total-amount]` | Total amount in GEL |
| კალკულაციის დათვლა | `extension[cal-hed]` | Calculation method |
| LIS ინტეგრაცია | `extension[lis-integration]` | Boolean flag |
| LIS პროვაიდერი | `extension[lis-provider]` | Provider name |
| გარე შეკვეთის კოდი | `extension[external-order-code]` | External code |
| GIS კოდი | `extension[gis-code]` | GIS code |

## Troubleshooting

### Error: File not found

```bash
# Check if file exists
ls -la "documentation/xsl/"

# Convert to .xlsx if it's a .numbers file
# See Step 1 above
```

### Error: Authentication failed

```bash
# Check environment variables
echo $MEDPLUM_CLIENT_ID
echo $MEDPLUM_CLIENT_SECRET

# Make sure Medplum server is running
curl http://localhost:8103/healthcheck
```

### Error: Duplicate service codes

```bash
# The script will skip duplicates and log them
# Check logs/nomenclature-import-errors.json for details

# To re-import, you may need to delete existing services first
# Be careful with this - it's destructive!
```

### Performance issues (10,000+ services)

The script automatically:
- Batches requests (100 per batch)
- Adds delays (1 second per 100 services)
- Logs progress every 100 services

For very large datasets (50,000+), consider:
1. Importing in chunks (split the file)
2. Increasing server resources
3. Running overnight

## Next Steps

After successful import:

1. **Verify Data**
   - Navigate to EMR → ნომენკლატურა → სამედიცინო 1
   - Check that services appear correctly
   - Test search and filtering

2. **Add Service Filters** (optional)
   - The UI already has the table
   - You can add search/filter components later

3. **Virtual Scrolling** (optional)
   - For smooth scrolling with 10,000+ services
   - Can be added later if needed

4. **Excel Export** (optional)
   - Allow users to export services back to Excel
   - Can be added later

## Safety Features

- **Validation:** Each row is validated before import
- **Error Logging:** All errors are saved to JSON file
- **Batch Processing:** Prevents overwhelming the server
- **Progress Tracking:** Real-time import status
- **Rollback:** Services can be deleted if import fails

## Support

If you encounter issues:
1. Check `logs/nomenclature-import-errors.json` for error details
2. Review the FHIR mapping table above
3. Verify spreadsheet column names match exactly (Georgian characters)
4. Ensure Medplum server is running and accessible
