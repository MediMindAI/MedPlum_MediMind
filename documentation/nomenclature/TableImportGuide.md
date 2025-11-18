# Table Import Guide for Medical Data Lists

This guide provides step-by-step instructions for importing medical data lists (Excel/Numbers/CSV files) into FHIR resources in the Medplum EMR system.

## Overview

This guide is based on the successful import of 2,217 medical services from an Apple Numbers file. Use this as a template for importing other medical data lists such as:
- Diagnosis codes (ICD-10)
- Medication lists
- Lab test catalogs
- Procedure codes
- Hospital/facility lists
- Insurance company lists
- Department/unit lists
- Staff/practitioner lists

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Prepare Your Data](#step-1-prepare-your-data)
3. [Step 2: Choose FHIR Resource Type](#step-2-choose-fhir-resource-type)
4. [Step 3: Create Import Script](#step-3-create-import-script)
5. [Step 4: Test with Small Dataset](#step-4-test-with-small-dataset)
6. [Step 5: Run Full Import](#step-5-run-full-import)
7. [Step 6: Verify Import](#step-6-verify-import)
8. [Common Patterns](#common-patterns)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools
- Node.js v22+ installed
- TypeScript (`tsx`) installed
- `xlsx` package installed: `npm install xlsx`
- Medplum server running (Docker: `docker-compose up`)
- Access token from browser (see [GET-TOKEN-INSTRUCTIONS.md](./GET-TOKEN-INSTRUCTIONS.md))

### Required Knowledge
- Basic understanding of FHIR resources
- Knowledge of your data structure (columns, data types)
- Understanding of required vs optional fields

---

## Step 1: Prepare Your Data

### 1.1 Convert File Format

If your file is not already in Excel format:

```bash
# For Apple Numbers files
npx tsx scripts/convert-numbers-to-xlsx.ts

# For CSV files (no conversion needed, xlsx library can read them)
# Just use the CSV file path directly
```

### 1.2 Review Data Structure

Open your Excel/CSV file and document:

1. **Column Names** (exactly as they appear in the file)
   ```
   Example:
   - ID
   - კოდი (Code)
   - დასახელება (Name)
   - ტიპი (Type)
   - etc.
   ```

2. **Required Fields** (which columns must have data?)
   ```
   Example:
   - Code: REQUIRED
   - Name: REQUIRED
   - Type: REQUIRED
   - Price: OPTIONAL
   ```

3. **Data Types** (string, number, boolean, date?)
   ```
   Example:
   - Code: string
   - Name: string
   - Price: number
   - Active: boolean (0/1)
   - CreatedDate: string (date format)
   ```

4. **Data Volume** (how many rows?)
   ```
   Example: 5,432 rows
   ```

### 1.3 Check Data Quality

Run these checks on your data:

```bash
# Preview first 5 rows
npx tsx scripts/preview-data.ts your-file.xlsx

# Check for missing required fields
npx tsx scripts/validate-data.ts your-file.xlsx

# Count total rows
wc -l your-file.csv  # For CSV files
```

---

## Step 2: Choose FHIR Resource Type

Select the appropriate FHIR resource based on your data type:

### Common Medical Data → FHIR Resources

| Data Type | FHIR Resource | Use Case |
|-----------|---------------|----------|
| Medical Services | **ActivityDefinition** | Services, procedures, operations ✅ (Used) |
| Diagnosis Codes | **CodeSystem** + **ValueSet** | ICD-10, ICD-9, custom diagnosis lists |
| Medications | **Medication** | Drug catalog, formulary |
| Lab Tests | **ObservationDefinition** | Lab test catalog, reference ranges |
| Hospitals/Facilities | **Organization** + **Location** | Hospital network, clinic locations |
| Insurance Companies | **Organization** | Payer list, insurance providers |
| Departments/Units | **Organization** | Hospital departments, units |
| Practitioners | **Practitioner** | Doctors, nurses, staff |
| Patients | **Patient** | Patient registry |
| Medical Equipment | **Device** | Equipment inventory |

### FHIR Resource Documentation

- **ActivityDefinition**: https://hl7.org/fhir/R4/activitydefinition.html
- **CodeSystem**: https://hl7.org/fhir/R4/codesystem.html
- **Medication**: https://hl7.org/fhir/R4/medication.html
- **Organization**: https://hl7.org/fhir/R4/organization.html
- **Practitioner**: https://hl7.org/fhir/R4/practitioner.html
- **ObservationDefinition**: https://hl7.org/fhir/R4/observationdefinition.html

---

## Step 3: Create Import Script

### 3.1 Copy Template Script

Use the medical services import script as a template:

```bash
# Copy the template
cp scripts/import-with-token.ts scripts/import-your-data.ts
```

### 3.2 Update Interface for Your Data

Define your row interface based on Excel columns:

```typescript
// Example: Diagnosis Codes Import
interface DiagnosisCodeRow {
  ID: string;
  'კოდი': string;              // Code (ICD-10)
  'დასახელება': string;        // Name
  'აღწერა': string;            // Description
  'კატეგორია': string;         // Category
  'სტატუსი': string;           // Status
}
```

### 3.3 Map to FHIR Resource

Create mapping function for your FHIR resource:

```typescript
// Example: Map to CodeSystem concept
function mapToCodeSystemConcept(row: DiagnosisCodeRow): any {
  return {
    code: row.კოდი.trim(),
    display: row.დასახელება.trim(),
    definition: row.აღწერა?.trim() || undefined,
    property: [
      {
        code: 'category',
        valueString: row.კატეგორია.trim()
      },
      {
        code: 'status',
        valueCode: row.სტატუსი.trim()
      }
    ]
  };
}

// Example: Map to Organization (Insurance Company)
function mapToOrganization(row: InsuranceCompanyRow): Organization {
  return {
    resourceType: 'Organization',
    identifier: [
      {
        system: 'http://medimind.ge/identifiers/insurance-company-code',
        value: row.კოდი.trim()
      }
    ],
    name: row.დასახელება.trim(),
    type: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/organization-type',
            code: 'ins',  // Insurance company
            display: 'Insurance Company'
          }
        ]
      }
    ],
    active: row.აქტიური === '1',
    telecom: row.ტელეფონი ? [
      {
        system: 'phone',
        value: row.ტელეფონი.trim()
      }
    ] : undefined,
    address: row.მისამართი ? [
      {
        text: row.მისამართი.trim()
      }
    ] : undefined
  };
}
```

### 3.4 Implement Validation

Add validation for required fields:

```typescript
function validateRow(row: YourDataRow, rowIndex: number): { valid: boolean; error?: string } {
  // Check required fields
  if (!row.კოდი || row.კოდი.trim() === '') {
    return { valid: false, error: 'Missing code (კოდი)' };
  }

  if (!row.დასახელება || row.დასახელება.trim() === '') {
    return { valid: false, error: 'Missing name (დასახელება)' };
  }

  // Validate data types
  if (row.ფასი && isNaN(Number(row.ფასი))) {
    return { valid: false, error: 'Invalid price (ფასი) - must be a number' };
  }

  // Check data constraints
  if (row.სტატუსი && !['active', 'inactive', 'draft'].includes(row.სტატუსი)) {
    return { valid: false, error: 'Invalid status - must be active, inactive, or draft' };
  }

  return { valid: true };
}
```

### 3.5 Update API Endpoint

Change the FHIR resource endpoint:

```typescript
// Original (Medical Services)
const response = await fetch(`${baseUrl}/fhir/R4/ActivityDefinition`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/fhir+json',
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify(resource),
});

// Example: Diagnosis Codes (CodeSystem)
const response = await fetch(`${baseUrl}/fhir/R4/CodeSystem`, {
  method: 'POST',
  // ... same headers
});

// Example: Insurance Companies (Organization)
const response = await fetch(`${baseUrl}/fhir/R4/Organization`, {
  method: 'POST',
  // ... same headers
});
```

---

## Step 4: Test with Small Dataset

### 4.1 Create Test File

Extract first 10-20 rows from your data:

```bash
# For CSV
head -n 21 your-file.csv > test-data.csv  # 1 header + 20 rows

# For Excel (manual)
# Open in Excel/Numbers, copy first 20 rows, save as test-data.xlsx
```

### 4.2 Run Test Import

```bash
# Get your access token
export MEDPLUM_TOKEN="your-token-here"

# Run test import
npx tsx scripts/import-your-data.ts
```

### 4.3 Verify Test Results

```bash
# Check if resources were created
curl -H "Authorization: Bearer $MEDPLUM_TOKEN" \
  "http://localhost:8103/fhir/R4/YourResourceType?_count=5"

# View in UI
open "http://localhost:3000/YourResourceType"
```

### 4.4 Fix Errors

Check error log:

```bash
cat logs/your-import-errors.json
```

Common issues:
- Missing required fields
- Wrong data types
- Invalid FHIR resource structure
- Authentication errors

---

## Step 5: Run Full Import

### 5.1 Update File Path

```typescript
const XLSX_FILE_PATH = path.join(
  __dirname,
  '../documentation/your-folder/your-file.xlsx'
);
```

### 5.2 Run Full Import

```bash
# Ensure fresh token (tokens expire after 1 hour)
export MEDPLUM_TOKEN="fresh-token-here"

# Run full import (this may take time for large datasets)
npx tsx scripts/import-your-data.ts

# Monitor progress in real-time
tail -f logs/your-import.log
```

### 5.3 Handle Rate Limits

The script automatically handles rate limits (pauses for 60 seconds when hitting API limits). For very large datasets (10,000+ rows):

- **Rate limit**: 50,000 requests per minute
- **Expected pauses**: Every ~500 rows
- **Estimated time**:
  - 1,000 rows: ~2 minutes
  - 5,000 rows: ~8 minutes
  - 10,000 rows: ~15 minutes
  - 50,000 rows: ~1 hour

---

## Step 6: Verify Import

### 6.1 Check Total Count

```bash
# Via API
curl -H "Authorization: Bearer $MEDPLUM_TOKEN" \
  "http://localhost:8103/fhir/R4/YourResourceType?_summary=count"

# Via SQL (if you have database access)
docker exec medplum-postgres psql -U medplum -d medplum \
  -c "SELECT COUNT(*) FROM fhir_resource WHERE resource_type = 'YourResourceType';"
```

### 6.2 Spot Check Data

```bash
# Get random samples
curl -H "Authorization: Bearer $MEDPLUM_TOKEN" \
  "http://localhost:8103/fhir/R4/YourResourceType?_count=5&_sort=-_lastUpdated"
```

### 6.3 Review Error Log

```bash
cat logs/your-import-errors.json | jq '.summary'
```

### 6.4 Test Search Functionality

```bash
# Search by code
curl -H "Authorization: Bearer $MEDPLUM_TOKEN" \
  "http://localhost:8103/fhir/R4/YourResourceType?identifier=your-code"

# Search by name
curl -H "Authorization: Bearer $MEDPLUM_TOKEN" \
  "http://localhost:8103/fhir/R4/YourResourceType?name:contains=test"
```

---

## Common Patterns

### Pattern 1: Diagnosis Codes (ICD-10)

```typescript
// Use CodeSystem resource for hierarchical code systems
interface ICD10Row {
  Code: string;        // A00.0
  Name: string;        // Cholera due to Vibrio cholerae 01
  Category: string;    // Infectious diseases
  Billable: string;    // Yes/No
}

function mapToCodeSystem(rows: ICD10Row[]): CodeSystem {
  return {
    resourceType: 'CodeSystem',
    url: 'http://medimind.ge/fhir/CodeSystem/icd-10-ge',
    status: 'active',
    content: 'complete',
    concept: rows.map(row => ({
      code: row.Code,
      display: row.Name,
      property: [
        { code: 'category', valueString: row.Category },
        { code: 'billable', valueBoolean: row.Billable === 'Yes' }
      ]
    }))
  };
}
```

### Pattern 2: Insurance Companies

```typescript
interface InsuranceRow {
  Code: string;
  Name: string;
  Phone: string;
  Email: string;
  Active: string;
}

function mapToOrganization(row: InsuranceRow): Organization {
  return {
    resourceType: 'Organization',
    identifier: [{ system: 'http://medimind.ge/insurance', value: row.Code }],
    name: row.Name,
    type: [{ coding: [{ code: 'ins', display: 'Insurance Company' }] }],
    active: row.Active === '1',
    telecom: [
      { system: 'phone', value: row.Phone },
      { system: 'email', value: row.Email }
    ]
  };
}
```

### Pattern 3: Lab Tests

```typescript
interface LabTestRow {
  Code: string;
  Name: string;
  Unit: string;
  ReferenceRangeMin: string;
  ReferenceRangeMax: string;
}

function mapToObservationDefinition(row: LabTestRow): ObservationDefinition {
  return {
    resourceType: 'ObservationDefinition',
    code: {
      coding: [{ system: 'http://medimind.ge/lab-tests', code: row.Code, display: row.Name }]
    },
    quantitativeDetails: {
      unit: { code: row.Unit, display: row.Unit },
      decimalPrecision: 2
    },
    qualifiedInterval: [{
      category: 'reference',
      range: {
        low: { value: parseFloat(row.ReferenceRangeMin), unit: row.Unit },
        high: { value: parseFloat(row.ReferenceRangeMax), unit: row.Unit }
      }
    }]
  };
}
```

---

## Troubleshooting

### Problem: "HTTP 401: Unauthorized"

**Solution**: Your token expired. Get a fresh token:
```bash
# Get new token from browser (see GET-TOKEN-INSTRUCTIONS.md)
export MEDPLUM_TOKEN="new-token-here"
```

### Problem: "HTTP 429: Too Many Requests"

**Solution**: Rate limit hit. The script should auto-retry. If not:
```bash
# Wait 60 seconds, then retry
sleep 60
npx tsx scripts/import-your-data.ts
```

### Problem: "Validation error: Missing required field"

**Solution**: Check your data and validation logic:
```bash
# Preview data to see actual column names
npx tsx scripts/preview-data.ts your-file.xlsx

# Update interface to match exact column names (including Georgian characters)
```

### Problem: "Import is very slow"

**Solutions**:
1. **Reduce delay**: Change `setTimeout(resolve, 1000)` to `setTimeout(resolve, 500)`
2. **Batch requests**: Use FHIR batch/transaction bundles
3. **Run overnight**: Large imports (50,000+) can take hours

### Problem: "Some rows skipped"

**Solution**: Check error log for details:
```bash
cat logs/your-import-errors.json | jq '.errors[] | select(.error | contains("Missing"))'
```

### Problem: "Duplicate entries"

**Solution**: Check for existing data before import:
```bash
# Check if data already exists
curl -H "Authorization: Bearer $MEDPLUM_TOKEN" \
  "http://localhost:8103/fhir/R4/YourResourceType?_count=1"

# Delete all existing resources (CAUTION!)
# Use Medplum UI or write a delete script
```

---

## Best Practices

### 1. Always Test First
- Start with 10-20 rows
- Verify structure and validation
- Check FHIR resource correctness
- Then run full import

### 2. Document Your Mapping
```typescript
/**
 * Maps Excel row to FHIR Organization resource
 *
 * Excel Columns:
 * - კოდი (Code): Organization identifier
 * - დასახელება (Name): Organization name
 * - ტიპი (Type): Organization type (hospital, clinic, etc.)
 *
 * FHIR Mapping:
 * - identifier[].value = Code
 * - name = Name
 * - type = Type
 */
```

### 3. Handle Georgian Text Carefully
```typescript
// ✅ Good: Use exact column names from Excel
interface Row {
  'კოდი': string;
  'დასახელება': string;
}

// ❌ Bad: Translated column names
interface Row {
  code: string;  // Won't match Excel column "კოდი"
  name: string;
}
```

### 4. Log Everything
```typescript
console.log(`Processing row ${rowNum}: ${row.კოდი} - ${row.დასახელება}`);
console.log(`✅ Created ${resourceType}/${resourceId}`);
console.error(`❌ Failed row ${rowNum}: ${error.message}`);
```

### 5. Save Progress
```typescript
// Save checkpoint every 500 rows
if (stats.success % 500 === 0) {
  fs.writeFileSync('import-checkpoint.json', JSON.stringify({
    lastProcessedRow: i,
    successCount: stats.success
  }));
}
```

---

## Next Steps

After successful import:

1. **Update CLAUDE.md** - Document your new data import
2. **Create UI Components** - Build views to display/manage the data
3. **Add Search/Filter** - Implement search functionality
4. **Write Tests** - Test CRUD operations
5. **Backup Data** - Export to JSON for backup

---

## Quick Reference Commands

```bash
# Convert Numbers to Excel
npx tsx scripts/convert-numbers-to-xlsx.ts

# Preview data
head -20 your-file.csv

# Get token
# See GET-TOKEN-INSTRUCTIONS.md

# Run import
export MEDPLUM_TOKEN="your-token"
npx tsx scripts/import-your-data.ts

# Check results
curl -H "Authorization: Bearer $MEDPLUM_TOKEN" \
  "http://localhost:8103/fhir/R4/YourResourceType?_count=5"

# View error log
cat logs/your-import-errors.json | jq
```

---

## Support

For help with imports:
1. Check this guide first
2. Review the successful medical services import (`scripts/import-with-token.ts`)
3. Check error logs (`logs/*.json`)
4. Verify FHIR resource documentation (https://hl7.org/fhir/R4/)
5. Test with small dataset first

---

**Last Updated**: 2025-11-18
**Based On**: Successful import of 2,217 medical services
**Next Imports**: Diagnosis codes, Insurance companies, Lab tests, Departments
