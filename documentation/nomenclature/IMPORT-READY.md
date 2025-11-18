# 🎉 Nomenclature Import Ready!

Everything is set up and ready for you to import your 2,222 medical services into FHIR!

## ✅ What's Been Completed

1. ✅ **Dependencies Installed** - `xlsx` and `@tanstack/react-virtual` packages added
2. ✅ **File Conversion** - Your `.numbers` file converted to `.xlsx` format
3. ✅ **Import Scripts Created** - Three scripts ready to use:
   - `import-with-token.ts` - **Use this one!** (token-based authentication)
   - `import-nomenclature.ts` - Full OAuth authentication (for production)
   - `import-nomenclature-simple.ts` - No auth (doesn't work with your server)
4. ✅ **Documentation** - Complete guides created:
   - `GET-TOKEN-INSTRUCTIONS.md` - Step-by-step token extraction
   - `README-IMPORT.md` - Full import documentation

## 🚀 Quick Start (3 Steps)

### Step 1: Get Your Access Token

1. Open http://localhost:3000 in your browser
2. Login with your admin account
3. Press `F12` to open DevTools
4. Go to: **Application** → **Local Storage** → **http://localhost:3000**
5. Find `activeLogin` key
6. Copy the `accessToken` value (long string starting with `eyJ...`)

**Detailed instructions:** See `scripts/GET-TOKEN-INSTRUCTIONS.md`

### Step 2: Set Your Token

```bash
# In your terminal, set the token as an environment variable
export MEDPLUM_TOKEN="paste-your-token-here"
```

### Step 3: Run the Import

```bash
# From project root
npx tsx scripts/import-with-token.ts
```

That's it! The script will:
- Read your 2,222 services from the Excel file
- Validate each row
- Create FHIR ActivityDefinition resources
- Show progress every 100 services
- Complete in about 5-10 minutes

## 📊 Expected Output

```
📖 Reading file: .../სამედიცინო სერვისების ცხრილი.xlsx
✅ Found 2222 rows

🚀 Starting import of 2222 services...

✅ Imported 100/2222 services...
✅ Imported 200/2222 services...
✅ Imported 300/2222 services...
...

============================================================
📊 IMPORT SUMMARY
============================================================
Total rows:      2222
✅ Success:      2222
⚠️  Skipped:      0
❌ Failed:       0
============================================================

✅ Import completed successfully!
📍 View imported services at: http://localhost:3000/emr/nomenclature/medical-1
```

## 🔍 After Import - Verify Your Data

Once the import completes:

1. **Open the Nomenclature page:**
   ```
   http://localhost:3000/emr/nomenclature/medical-1
   ```

2. **You should see:**
   - All 2,222 services in the table
   - Columns: Code (კოდი), Name (დასახელება), Group (ჯგუფი), Type (ტიპი), Price (ფასი)
   - Working add/edit/delete functionality (already built!)

3. **Test the UI:**
   - Click "დამატება" (Add) to add a new service
   - Click edit icon (✏️) to edit an existing service
   - Click delete icon (🗑️) to delete a service

## 📁 Files Created

```
scripts/
├── import-with-token.ts              # ⭐ Main import script (use this!)
├── import-nomenclature.ts            # Full OAuth version (for production)
├── import-nomenclature-simple.ts     # No-auth version (doesn't work)
├── convert-numbers-to-xlsx.ts        # File converter (already run)
├── GET-TOKEN-INSTRUCTIONS.md         # How to get your token
├── README-IMPORT.md                  # Full documentation
└── IMPORT-READY.md                   # This file!

documentation/xsl/
├── სამედიცინო სერვისების ცხრილი.numbers  # Original file
└── სამედიცინო სერვისების ცხრილი.xlsx     # Converted file ✅

logs/
└── nomenclature-import-errors.json   # Error log (created if errors occur)
```

## 🛠️ Data Mapping

Your Excel columns are mapped to FHIR ActivityDefinition as follows:

| Excel Column | FHIR Field | Type |
|--------------|------------|------|
| კოდი (Code) | `identifier[].value` | Unique service code |
| დასახელება (Name) | `title` | Service name |
| სამედიცინო დასახელება | `description` | Medical description |
| ჯგუფი (Group) | `topic[].text` | Service group |
| ტიპი (Type) | `extension[service-type]` | Internal/External |
| ფასი (Price) | `extension[base-price]` | Base price in GEL |
| ჯამი (Total) | `extension[total-amount]` | Total amount in GEL |
| კალკულაციის დათვლა | `extension[cal-hed]` | Calculation method |
| შექმნის თარიღი | `extension[created-date]` | Created date |
| ტეგები | `extension[tags]` | Tags |
| LIS ინტეგრაცია | `extension[lis-integration]` | LIS integration flag |
| LIS პროვაიდერი | `extension[lis-provider]` | LIS provider |
| გარე შეკვეთის კოდი | `extension[external-order-code]` | External code |
| GIS კოდი | `extension[gis-code]` | GIS code |

## ⚠️ Troubleshooting

### "Missing access token"
→ Follow Step 1 above to get your token from the browser

### "HTTP 401: Unauthorized"
→ Your token expired. Get a fresh one (tokens last ~1 hour)

### "HTTP 403: Forbidden"
→ Your account needs admin permissions. Contact your Medplum admin.

### Import is slow
→ Normal! 2,222 services takes 5-10 minutes. The script pauses every 50 services.

### Some services failed
→ Check `logs/nomenclature-import-errors.json` for details

## 🎯 Next Steps After Import

Once your 2,222 services are imported, we can add:

1. **ServiceFilters Component** (Optional)
   - Search by code/name
   - Filter by group/type
   - Price range filtering

2. **Virtual Scrolling** (Optional)
   - Smooth scrolling for large lists
   - Better performance

3. **Excel Export** (Optional)
   - Export services back to Excel
   - Include filters

These are already planned in the todo list and can be added later when needed!

## 📞 Need Help?

If you encounter any issues:

1. Check `logs/nomenclature-import-errors.json` for error details
2. Verify Medplum is running: `curl http://localhost:8103/healthcheck`
3. Check your token is valid (not expired)
4. Review `GET-TOKEN-INSTRUCTIONS.md` for detailed token extraction steps

---

**You're all set! Just follow the 3 steps above to import your services. Good luck! 🚀**
