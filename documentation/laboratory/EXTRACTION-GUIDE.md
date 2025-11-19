# Laboratory Tests Data Extraction Guide

This guide explains how to extract detailed laboratory test data from the original EMR system at `http://178.134.21.82:8008/clinic.php`.

## Overview

The extraction process captures:
- **სინჯარები (Samples/Containers)**: Code, name, color, description
- **კომპონენტები (Components)**: Sample code, test code, test type, test name
- **LIS Integration**: Integration status and provider (e.g., WebLab)
- **Financial Data**: Price, group, type

## Prerequisites

1. Playwright browser open with EMR system loaded
2. Logged into the EMR system with credentials (Username: `cicig`, Password: `Tsotne2011`)
3. Navigated to: **ნომენკლატურა → სამედიცინო I**
4. **CRITICAL STEP:** Filter and load laboratory tests:
   - In the filter dropdowns at the top of the page, select **"ლაბორატორიული გამოკვლევები"** (Laboratory Tests) from the ჯგუფი (Group) dropdown
   - Click the **circular reload button (↻)** located to the right of the XL export button
   - Wait for the table to reload with only laboratory tests visible
   - You should now see tests like: CG.7, CG.2.1.7, A10068, A10071, MB.25, etc.

**Visual Reference:** After filtering, you'll see the turquoise header table with columns: კოდი (Code), დასახელება (Name), ჯგუფი (Group), ტიპი (Type), ფასი (Price), etc.

## Method 1: Browser Console (Recommended for Testing)

### Step 1: Load the Script

In the Playwright browser console, paste and run:

\`\`\`javascript
// Copy the entire contents of scripts/extract-lab-tests-browser.js
// and paste it into the console
\`\`\`

You should see:

\`\`\`
╔═══════════════════════════════════════════════════════════╗
║  Laboratory Tests Extraction Script Loaded                ║
╠═══════════════════════════════════════════════════════════╣
║  Available commands...                                     ║
╚═══════════════════════════════════════════════════════════╝
\`\`\`

### Step 2: Test with Single Entry

Extract one test to verify the script works:

\`\`\`javascript
await labExtractor.extractSingleTest()
\`\`\`

This will:
1. Double-click the first laboratory test row
2. Wait for modal to open
3. Extract all data from the modal
4. Return the extracted data

**Expected Output:**
\`\`\`javascript
{
  code: "CG.2.1.7",
  name: "INR (პროთრომბინი)",
  group: "ლაბორატორიული კვლევები",
  type: "შიდა",
  price: 15,
  samples: [
    {
      code: "K2EDTA",
      name: "102",
      color: "rgb(255, 0, 255)", // Magenta
      description: "24სთ მარტის შემდეგ სისხლის ნიმუშში Na ვადა"
    }
  ],
  components: [
    {
      sampleCode: "K2EDTA",
      testCode: "102",
      testType: "PT",
      testName: "პროთრომბინის დრო - II"
    },
    {
      sampleCode: "K2EDTA",
      testCode: "102",
      testType: "PI",
      testName: "პროთრომბინის ინდექსი - II"
    },
    {
      sampleCode: "K2EDTA",
      testCode: "102",
      testType: "INR",
      testName: "საერთაშორისო ნორმალიზებული ფარდობა - II"
    }
  ],
  lisIntegration: true,
  lisProvider: "WebLab"
}
\`\`\`

### Step 3: Extract All Visible Tests

Once verified, extract all visible laboratory tests:

\`\`\`javascript
await labExtractor.extractAllTests()
\`\`\`

This will:
1. Iterate through all visible rows
2. Double-click each row
3. Extract data from modal
4. Close modal
5. Move to next test

**Progress will be logged:**
\`\`\`
[1/50] Processing: CG.7 - კოაგულოგრამა
[2/50] Processing: CG.2.1.7 - INR (პროთრომბინი)
...
✓ Extraction complete! Processed 50 tests
\`\`\`

### Step 4: Download Results

#### Download as Markdown

\`\`\`javascript
labExtractor.downloadMarkdown(labExtractor.getExtractedTests())
\`\`\`

This downloads `extracted-lab-tests.md` with formatted data.

#### Download as JSON

\`\`\`javascript
labExtractor.downloadJSON(labExtractor.getExtractedTests())
\`\`\`

This downloads `extracted-lab-tests.json` for programmatic use.

## Method 2: Parallel Multi-Agent Extraction (⚡ FASTEST - Recommended for Large Datasets)

**Time Savings:** Extract 100+ tests in minutes instead of hours by running multiple agents in parallel.

### Overview

This method uses Claude Code's EMR mapper agents to extract data from multiple laboratory tests simultaneously. Each agent opens its own Playwright browser session and extracts a different subset of tests.

### Prerequisites

1. **EMR System Credentials:**
   - Username: `cicig`
   - Password: `Tsotne2011`
   - URL: `http://178.134.21.82:8008/clinic.php`

2. **Multiple Terminal Windows:** Open 3-5 terminal tabs/windows

### Step 1: Determine Test Count

First, count the total number of laboratory tests to extract:

\`\`\`bash
# In one terminal, count visible tests
# Navigate to: ნომენკლატურა → სამედიცინო I
# Filter by: ლაბორატორიული კვლევები
# Count the rows in the table
\`\`\`

Example: If you have 100 laboratory tests, you can split them across 4 agents.

### Step 2: Launch Multiple Agents in Parallel

Open **4 terminal windows** and run these commands simultaneously:

#### Terminal 1 - Agent 1 (Tests 1-25)
\`\`\`bash
cd /Users/toko/Desktop/medplum_medimind

# Launch EMR mapper agent for tests 1-25
claude code --task "Extract laboratory tests 1-25 from EMR system.

STEP 1 - Login:
- Navigate to http://178.134.21.82:8008/clinic.php
- Login with username 'cicig' and password 'Tsotne2011'

STEP 2 - Navigate to Laboratory Tests:
- Click ნომენკლატურა (Nomenclature) menu
- Click სამედიცინო I (Medical I) submenu

STEP 3 - CRITICAL - Filter and Load Tests:
- In the filter dropdowns, select 'ლაბორატორიული გამოკვლევები' (Laboratory Tests) from the ჯგუფი (Group) dropdown
- Click the circular reload button (↻) to the right of the XL button
- Wait for table to reload with only laboratory tests

STEP 4 - Extract Tests 1-25:
- Double-click each test row to open detail modal
- Extract: samples (სინჯარები), components (კომპონენტები), LIS integration
- Save to documentation/laboratory/extracted-lab-tests-part1.md"
\`\`\`

#### Terminal 2 - Agent 2 (Tests 26-50)
\`\`\`bash
cd /Users/toko/Desktop/medplum_medimind

# Launch EMR mapper agent for tests 26-50
claude code --task "Extract laboratory tests 26-50 from EMR system.
Follow same steps as Agent 1 (login → navigate → CRITICAL: select 'ლაბორატორიული გამოკვლევები' and click circular reload button (↻)).
Extract tests 26-50, save to documentation/laboratory/extracted-lab-tests-part2.md"
\`\`\`

#### Terminal 3 - Agent 3 (Tests 51-75)
\`\`\`bash
cd /Users/toko/Desktop/medplum_medimind

# Launch EMR mapper agent for tests 51-75
claude code --task "Extract laboratory tests 51-75 from EMR system.
Login with username 'cicig' and password 'Tsotne2011'.
Navigate to ნომენკლատურა → სამედიცინო I → filter ლაბორატორიული კვლევები.
Start from test row 51, extract 25 tests with samples, components, and LIS integration.
Save to documentation/laboratory/extracted-lab-tests-part3.md"
\`\`\`

#### Terminal 4 - Agent 4 (Tests 76-100)
\`\`\`bash
cd /Users/toko/Desktop/medplum_medimind

# Launch EMR mapper agent for tests 76-100
claude code --task "Extract laboratory tests 76-100 from EMR system.
Login with username 'cicig' and password 'Tsotne2011'.
Follow same steps as Agent 1 (login → navigate → CRITICAL: select 'ლაბორატორიული გამოკვლევები' and click circular reload button (↻)).
Start from test row 76, extract 25 tests with samples, components, and LIS integration.
Save to documentation/laboratory/extracted-lab-tests-part4.md"
\`\`\`

### Step 3: Monitor Progress

Each agent will:
1. Open a new Playwright browser session
2. Navigate to the EMR system and login
3. Go to the laboratory tests page
4. Extract its assigned range of tests
5. Save results to its output file

**Watch the terminals for progress updates:**
\`\`\`
Terminal 1: [1/25] Processing: CG.7 - კოაგულოგრამა
Terminal 2: [26/50] Processing: A10068 - ცილის რაოდენობა
Terminal 3: [51/75] Processing: MB.25 - ჰეპატიტი B
Terminal 4: [76/100] Processing: HR.3.6 - TSH
\`\`\`

### Step 4: Merge Results

Once all agents complete, merge the results:

\`\`\`bash
# Merge all markdown files
cat documentation/laboratory/extracted-lab-tests-part1.md \
    documentation/laboratory/extracted-lab-tests-part2.md \
    documentation/laboratory/extracted-lab-tests-part3.md \
    documentation/laboratory/extracted-lab-tests-part4.md \
    > documentation/laboratory/extracted-lab-tests-complete.md

# Create combined JSON file
echo "[" > documentation/laboratory/extracted-lab-tests-complete.json
cat documentation/laboratory/extracted-lab-tests-part1.json \
    documentation/laboratory/extracted-lab-tests-part2.json \
    documentation/laboratory/extracted-lab-tests-part3.json \
    documentation/laboratory/extracted-lab-tests-part4.json \
    >> documentation/laboratory/extracted-lab-tests-complete.json
echo "]" >> documentation/laboratory/extracted-lab-tests-complete.json
\`\`\`

### Performance Comparison

| Method | Tests | Time | Speed |
|--------|-------|------|-------|
| **Single Browser Console** | 100 | ~3-4 hours | 25-33 tests/hour |
| **Single Automated Script** | 100 | ~2-3 hours | 33-50 tests/hour |
| **4 Parallel Agents** | 100 | ~30-45 min | 133-200 tests/hour |
| **5 Parallel Agents** | 100 | ~25-35 min | 171-240 tests/hour |

### Tips for Optimal Parallel Extraction

1. **Split Evenly:** Divide tests into equal chunks across agents
2. **Use 4-5 Agents:** More than 5 may cause browser resource issues
3. **Monitor Resources:** Check CPU/memory usage during extraction
4. **Stagger Starts:** Launch agents 10-15 seconds apart to avoid login conflicts
5. **Backup Frequently:** Save intermediate results in case of crashes

### Advanced: Pagination Support

If the table has pagination (e.g., 20 tests per page):

\`\`\`bash
# Agent 1: Page 1 (tests 1-20)
claude code --task "Extract page 1 of laboratory tests (rows 1-20)..."

# Agent 2: Page 2 (tests 21-40)
claude code --task "Extract page 2 of laboratory tests (rows 21-40).
First navigate to page 2, then extract..."

# Agent 3: Page 3 (tests 41-60)
claude code --task "Extract page 3 of laboratory tests (rows 41-60).
First navigate to page 3, then extract..."
\`\`\`

## Method 3: Playwright Script (For Automation)

### Step 1: Install Dependencies

\`\`\`bash
cd /Users/toko/Desktop/medplum_medimind
npm install
\`\`\`

### Step 2: Run the TypeScript Script

\`\`\`bash
npx tsx scripts/extract-lab-tests.ts
\`\`\`

This runs the full automated extraction.

## Output Format

### Markdown Output

\`\`\`markdown
# Laboratory Tests Data Extraction

**Extraction Date:** 2025-11-18T20:30:00.000Z
**Total Tests:** 50

---

## 1. CG.2.1.7 - INR (პროთრომბინი)

- **Group:** ლაბორატორიული კვლევები
- **Type:** შიდა
- **Price:** 15 GEL
- **LIS Integration:** Yes
- **LIS Provider:** WebLab

### Samples/Containers (სინჯარები)

| Code | Name | Color | Description |
|------|------|-------|-------------|
| K2EDTA | 102 | rgb(255, 0, 255) | 24სთ მარტის შემდეგ სისხლის ნიმუშში Na ვადა |

### Components (კომპონენტები)

| Sample Code | Test Code | Type | Name |
|-------------|-----------|------|------|
| K2EDTA | 102 | PT | პროთრომბინის დრო - II |
| K2EDTA | 102 | PI | პროთრომბინის ინდექსი - II |
| K2EDTA | 102 | INR | საერთაშორისო ნორმალიზებული ფარდობა - II |

---
\`\`\`

### JSON Output

\`\`\`json
[
  {
    "code": "CG.2.1.7",
    "name": "INR (პროთრომბინი)",
    "group": "ლაბორატორიული კვლევები",
    "type": "შიდა",
    "price": 15,
    "samples": [
      {
        "code": "K2EDTA",
        "name": "102",
        "color": "rgb(255, 0, 255)",
        "description": "24სთ მარტის შემდეგ სისხლის ნიმუშში Na ვადა"
      }
    ],
    "components": [
      {
        "sampleCode": "K2EDTA",
        "testCode": "102",
        "testType": "PT",
        "testName": "პროთრომბინის დრო - II"
      },
      {
        "sampleCode": "K2EDTA",
        "testCode": "102",
        "testType": "PI",
        "testName": "პროთრომბინის ინდექსი - II"
      },
      {
        "sampleCode": "K2EDTA",
        "testCode": "102",
        "testType": "INR",
        "testName": "საერთაშორისო ნორმალიზებული ფარდობა - II"
      }
    ],
    "lisIntegration": true,
    "lisProvider": "WebLab",
    "extractedAt": "2025-11-18T20:30:00.000Z"
  }
]
\`\`\`

## Troubleshooting

### Modal Not Opening

If the modal doesn't open when double-clicking:
- Verify you're on the correct page (სამედიცინო I)
- Ensure laboratory tests are visible in the table
- Try manually double-clicking a row to test

### Extraction Not Finding Data

If samples or components arrays are empty:
- Open a modal manually and inspect the HTML structure
- Update the selectors in the script if needed
- Check console for error messages

### Close Button Not Working

If modal won't close between extractions:
- Manually press ESC to close
- Inspect the modal HTML to find the correct close button selector
- Update the close button logic in the script

## Data Mapping to FHIR

After extraction, this data can be mapped to FHIR resources:

- **ObservationDefinition**: Laboratory test definitions
- **SpecimenDefinition**: Sample/container types with color codes
- **ActivityDefinition**: Test procedures and components

See `packages/app/src/emr/services/researchComponentService.ts` for implementation examples.

## Next Steps

1. Extract all laboratory tests
2. Review extracted markdown file
3. Map to FHIR ObservationDefinition resources
4. Import into Medplum system
5. Link to patient orders and results

## Support

For issues or questions:
- Check the console for error messages
- Review the script comments for implementation details
- Verify the EMR page structure hasn't changed
