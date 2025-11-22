# Patient Card Sections - Mapping Index

## 📋 Overview

ეს დირექტორია შეიცავს **პაციენტის ბარათის (Patient Card)** თითოეული section-ის mapping დოকუმენტაციას.

**Patient Card URL**: http://178.134.21.82:8008/sub/2/22/patientdata.php
**Navigation**: Login → პაციენტის ისტორია → ჩემი პაციენტები → Select Patient → Open Card
**Total Sections**: 20

---

## 📊 Progress Tracker

**Status Legend**:
- ⬜ Not Started
- 🚧 In Progress
- ✅ Complete

**Overall Progress**: 4 / 20 (20%)

---

## 📁 Section List

### Core Medical Data (Priority: High)

| # | File | Section Name (Georgian) | Section Name (English) | Status | Lines |
|---|------|-------------------------|------------------------|--------|-------|
| 01 | [01-ehr.md](01-ehr.md) | EHR | Electronic Health Record | ✅ | 786 |
| 02 | [02-kvlevebis-sia.md](02-kvlevebis-sia.md) | კვლევების სია | Research List | ✅ | 586 |
| 03 | [03-anamnesis-vitae.md](03-anamnesis-vitae.md) | ANAMNESIS VITAE ■■ | Patient Medical History | ✅ | 508 |
| 04 | [04-er-reception.md](04-er-reception.md) | ER / RECEPTION ■■ | Emergency/Reception | ✅ | 284 |
| 05 | [05-anamnesis-morbi.md](05-anamnesis-morbi.md) | ANAMNESIS MORBI ■■ | Current Illness | ⬜ | 0 |
| 06 | [06-gantsera.md](06-gantsera.md) | განწერა ■■ | Discharge | ⬜ | 0 |
| 07 | [07-moh.md](07-moh.md) | MOH ■■ | Ministry of Health | ⬜ | 0 |
| 08 | [08-morphology.md](08-morphology.md) | Morphology ■■ | Morphology | ⬜ | 0 |

### Reports (Priority: Medium)

| # | File | Section Name (Georgian) | Section Name (English) | Status | Lines |
|---|------|-------------------------|------------------------|--------|-------|
| 09 | [09-reporti.md](09-reporti.md) | რეპორტი | Report 1 | ⬜ | 0 |
| 10 | [10-reporti-2.md](10-reporti-2.md) | რეპორტი 2 | Report 2 | ⬜ | 0 |

### Medical Forms (Priority: Low)

| # | File | Section Name (Georgian) | Section Name (English) | Status | Lines |
|---|------|-------------------------|------------------------|--------|-------|
| 11 | [11-e-100a-star.md](11-e-100a-star.md) | ე 100/ა* | Form E-100/A* | ⬜ | 0 |
| 12 | [12-100a-star.md](12-100a-star.md) | 100/ა* | Form 100/A* | ⬜ | 0 |
| 13 | [13-300-a-star.md](13-300-a-star.md) | 300-/ა* | Form 300-/A* | ⬜ | 0 |
| 14 | [14-300-pgv.md](14-300-pgv.md) | 300 პგვ | Form 300-PGV | ⬜ | 0 |
| 15 | [15-300-klm.md](15-300-klm.md) | 300 კლმ | Form 300-KLM | ⬜ | 0 |
| 16 | [16-300-mei.md](16-300-mei.md) | 300 მეი | Form 300-MEI | ⬜ | 0 |
| 17 | [17-dghva.md](17-dghva.md) | დღვა ❤ | DGHVA | ⬜ | 0 |
| 18 | [18-300-10a-star.md](18-300-10a-star.md) | 300-10/ა* | Form 300-10/A* | ⬜ | 0 |
| 19 | [19-300-11a-star.md](19-300-11a-star.md) | 300-11/ა* | Form 300-11/A* | ⬜ | 0 |
| 20 | [20-300-12a-star.md](20-300-12a-star.md) | 300-12/ა* | Form 300-12/A* | ⬜ | 0 |

---

## 🎯 Mapping Workflow

### Step 1: Prepare Prompt
```bash
cd /Users/apple/Desktop/MEDPLUM_MEDIMIND/MedPlum_MediMind
claude --dangerously-skip-permissions --mcp-config .mcp.json.playwright-only
```

### Step 2: Run Mapping for Each Section
Use the emr-page-mapper agent with section-specific prompt:
- Navigate to patient card
- Click target section tab
- Extract all fields, dropdowns, tables, buttons
- Capture screenshots
- Monitor API endpoints
- Document in corresponding .md file

### Step 3: Update This README
After completing each section:
- Change status: ⬜ → 🚧 → ✅
- Add line count
- Update progress percentage

---

## 📝 Documentation Template

Each section file should include:

```markdown
# [Section Name]

**Status**: ⬜ Not Started / 🚧 In Progress / ✅ Complete
**Priority**: High / Medium / Low
**Extraction Date**: YYYY-MM-DD

## Overview

(Brief description of this section's purpose)

---

## Navigation Path

1. Login → პაციენტის ისტორია → ჩემი პაციენტები
2. Select patient → Open card
3. Click [Section Name] tab

---

## Form Fields

| Field ID | Label (Georgian) | Type | Required | Disabled | Default | Notes |
|----------|------------------|------|----------|----------|---------|-------|
| ... | ... | ... | ... | ... | ... | ... |

---

## Dropdowns

### [Dropdown Name]

**Total Options**: X

| Value | Text (Georgian) | Text (English) |
|-------|----------------|----------------|
| ... | ... | ... |

---

## Tables

(Table structure and data)

---

## Buttons

| Button ID | Text | Purpose |
|-----------|------|---------|
| ... | ... | ... |

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| ... | ... | ... |

---

## Screenshots

![Section View](/.playwright-mcp/[filename].png)

---

## Validation Rules

(Client-side and server-side validation)

---

## Notes

(Any special observations, dependencies, or implementation notes)
```

---

## 🔐 Safety Rules

**READ-ONLY Mode**: ყველა mapping არის documentation only
- ✅ READ all field values
- ✅ EXTRACT dropdown options
- ✅ CAPTURE screenshots
- ✅ MONITOR API calls
- ❌ DO NOT SUBMIT forms
- ❌ DO NOT MODIFY data
- ❌ DO NOT DELETE records

---

## 📈 Statistics

### By Priority

| Priority | Sections | Completed | Progress |
|----------|----------|-----------|----------|
| High | 8 | 4 | 50% |
| Medium | 2 | 0 | 0% |
| Low | 10 | 0 | 0% |
| **Total** | **20** | **4** | **20%** |

### By Category

| Category | Sections | Completed |
|----------|----------|-----------|
| Core Medical | 8 | 4 |
| Reports | 2 | 0 |
| Forms | 10 | 0 |

---

## 🎯 Recommended Mapping Order

### Phase 1: Core Data (Week 1)
1. ✅ EHR (01) - **COMPLETED** (786 lines)
2. ✅ კვლევების სია (02) - **COMPLETED** (586 lines)
3. ✅ ANAMNESIS VITAE (03) - **COMPLETED** (508 lines)
4. ⬜ ANAMNESIS MORBI (05)

### Phase 2: Administrative (Week 2)
5. ✅ ER / RECEPTION (04) - **COMPLETED** (284 lines)
6. ⬜ განწერა (06)
7. ⬜ MOH (07)
8. ⬜ Morphology (08)

### Phase 3: Reports (Week 3)
9. ⬜ რეპორტი (09)
10. ⬜ რეპორტი 2 (10)

### Phase 4: Forms (Week 4)
11-20. ⬜ All medical forms (11-20)

---

## 🔗 Related Documentation

- **Main Patient Card**: `../patient-card-my-patients.md` (882 lines)
- **Project Root**: `/Users/apple/Desktop/MEDPLUM_MEDIMIND/MedPlum_MediMind/`
- **Agent**: `.claude/agents/emr-page-mapper.md`
- **MCP Config**: `.mcp.json.playwright-only`
- **Screenshots**: `/.playwright-mcp/`

---

## 📞 Notes

- **Extraction Method**: Playwright MCP + emr-page-mapper agent
- **Automation Level**: 100% automated
- **Documentation Format**: Markdown with tables
- **Georgian Text**: UTF-8 encoding preserved
- **Production System**: http://178.134.21.82:8008

---

**Created**: 2025-11-18
**Last Updated**: 2025-11-18
**Sections Mapped**: 4 / 20
**Overall Progress**: 20%
