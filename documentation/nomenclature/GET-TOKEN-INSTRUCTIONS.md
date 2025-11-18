# How to Get Your Medplum Access Token

Follow these simple steps to get your access token from the browser:

## Step 1: Login to Medplum

1. Open your browser
2. Navigate to: **http://localhost:3000**
3. Login with your admin account (if not already logged in)

## Step 2: Open Browser DevTools

**Chrome/Edge/Brave:**
- Press `F12` or `Cmd+Option+I` (Mac) or `Ctrl+Shift+I` (Windows/Linux)

**Firefox:**
- Press `F12` or `Cmd+Option+K` (Mac) or `Ctrl+Shift+K` (Windows/Linux)

**Safari:**
- Enable Developer menu: Safari → Preferences → Advanced → Show Develop menu
- Then: `Cmd+Option+I`

## Step 3: Navigate to Local Storage

1. In DevTools, click on the **"Application"** tab (Chrome/Edge) or **"Storage"** tab (Firefox)
2. In the left sidebar, expand **"Local Storage"**
3. Click on **"http://localhost:3000"** (or your Medplum URL)

## Step 4: Find Your Token

1. Look for the key named **"activeLogin"**
2. Click on it to see the value (a large JSON object)
3. The value will look something like this:

```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6...",
  "refreshToken": "...",
  "profile": {...},
  "project": {...}
}
```

4. **Copy ONLY the `accessToken` value** (the long string starting with `eyJ...`)

## Step 5: Run the Import Script

**Option A: Using Environment Variable (Recommended)**

```bash
# Replace YOUR_TOKEN_HERE with the actual token
export MEDPLUM_TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6..."

# Run the import
npx tsx scripts/import-with-token.ts
```

**Option B: Pass Token as Argument**

```bash
npx tsx scripts/import-with-token.ts "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6..."
```

## Expected Output

You should see:

```
📖 Reading file: .../სამედიცინო სერვისების ცხრილი.xlsx
✅ Found 2222 rows

🚀 Starting import of 2222 services...

✅ Imported 100/2222 services...
✅ Imported 200/2222 services...
✅ Imported 300/2222 services...
...
✅ Imported 2200/2222 services...

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

## Troubleshooting

### Error: "Missing access token"
- Make sure you copied the `accessToken` value, not the entire JSON
- Check that you're logged in to Medplum
- Try logging out and logging back in to get a fresh token

### Error: "HTTP 401: Unauthorized"
- Your token may have expired (tokens typically last 1 hour)
- Get a fresh token by logging out and logging back in
- Then repeat the steps above

### Error: "HTTP 403: Forbidden"
- Your account may not have permission to create ActivityDefinition resources
- Make sure you're logged in as an admin
- Contact your Medplum administrator to grant you the necessary permissions

### Import is slow
- This is normal! Importing 2,222 services takes time
- The script pauses every 50 services to avoid overwhelming the server
- Estimated time: 5-10 minutes for 2,222 services
- Leave it running - it will show progress every 100 services

### Some services failed to import
- Check the error log at: `logs/nomenclature-import-errors.json`
- Common issues:
  - Missing required fields (code, name, group, type)
  - Invalid price format (must be a number)
  - Duplicate service codes

## After Import

Once the import completes successfully:

1. **Verify the data:**
   - Open: http://localhost:3000/emr/nomenclature/medical-1
   - You should see your 2,222 services in the table

2. **Test search/filtering** (once ServiceFilters component is added)

3. **Test adding/editing services** through the UI

## Need Help?

If you encounter issues:
1. Check `logs/nomenclature-import-errors.json` for error details
2. Verify your token is valid (not expired)
3. Ensure Medplum server is running: `curl http://localhost:8103/healthcheck`
4. Check Docker containers: `docker-compose ps`
