# Laboratory Tests Data Extraction

**Extraction Date:** 2025-11-18 20:30:00

**Total Tests Extracted:** 1

**Source:** Original EMR System - http://178.134.21.82:8008/clinic.php (ნომენკლატურა → სამედიცინო I)

---

## 1. CG.7 - კოაგულოგრამა (Coagulogram)

**Basic Information:**
- **Code:** CG.7
- **Name:** კოაგულოგრამა
- **Group:** ლაბორატორიული კვლევები (Laboratory Tests)
- **Type:** შიდა (Internal)
- **Price:** 44 GEL

### სინჯარები (Samples/Containers)

| GIS Code | Container | Manipulation | Biomaterial | Volume |
|----------|-----------|--------------|-------------|--------|
| 630f61fc-e6c1-11ea-a494-1866daf56389 | K2EDTA | 24სთ შარდის შეგროვება | ვენური სისხლის NaCit პლაზმა | 0 ml |

**Container Details:**
- **Type:** K2EDTA (Purple/Lavender top tube with EDTA anticoagulant)
- **Collection Method:** 24-hour urine collection (24სთ შარდის შეგროვება)
- **Biomaterial:** Venous blood NaCit plasma (ვენური სისხლის NaCit პლაზმა)

### კომპონენტები (Test Components)

| Sample Container | Test Code | Test Name |
|------------------|-----------|-----------|
| K2EDTA - 630f61fc-e6c1-11ea-a494-1866daf56389 | PT | პროთრომბინის დრო (Prothrombin Time) |
| K2EDTA - 630f61fc-e6c1-11ea-a494-1866daf56389 | PI | პროთრომბინის ინდექსი (Prothrombin Index) |
| K2EDTA - 630f61fc-e6c1-11ea-a494-1866daf56389 | INR | საერთაშორისო ნორმალიზებული ფარდობა (International Normalized Ratio) |
| K2EDTA - 630f61fc-e6c1-11ea-a494-1866daf56389 | APTT | აქტიური ნაწილობრივი თრომბოპლასტინური დრო (Activated Partial Thromboplastin Time) |
| K2EDTA - 630f61fc-e6c1-11ea-a494-1866daf56389 | TT | თრომბინის დრო (Thrombin Time) |
| K2EDTA - 630f61fc-e6c1-11ea-a494-1866daf56389 | FIBR | ფიბრინოგენის კონცენტრაცია (Fibrinogen Concentration) |

**Component Count:** 6 tests

### Integration & Settings

- **LIS Integration:** ✅ Yes (Integrated with Laboratory Information System)
- **LIS Provider:** WebLab
- **External Order Code:** (if applicable)
- **Waiting for Analysis Response:** Yes

### Clinical Significance

This coagulation panel (coagulogram) assesses:
1. **PT/INR** - Monitors warfarin therapy, evaluates extrinsic pathway
2. **APTT** - Monitors heparin therapy, evaluates intrinsic pathway
3. **TT** - Detects fibrinogen abnormalities
4. **Fibrinogen** - Measures clotting protein levels
5. **PI** - Prothrombin index calculation

### FHIR Mapping Notes

**Target Resource:** ObservationDefinition

**Mapping:**
- `code` → CG.7
- `title` → კოაგულოგრამა
- `specimen` → K2EDTA container (SpecimenDefinition reference)
- `hasMember` → 6 component ObservationDefinitions (PT, PI, INR, APTT, TT, FIBR)
- `extension[lis-integration]` → true
- `extension[lis-provider]` → WebLab
- `extension[gis-code]` → 630f61fc-e6c1-11ea-a494-1866daf56389

---

## Extraction Notes

- This is a **composite test** with 6 individual components
- All components share the same sample container (K2EDTA)
- LIS integration is active with WebLab provider
- GIS code links to national health information system
- Price: 44 GEL across all insurance providers

## Next Steps

1. Extract remaining laboratory tests from the სამედიცინო I page
2. Map to FHIR ObservationDefinition resources
3. Create SpecimenDefinition for K2EDTA container
4. Import into Medplum system
5. Link to patient orders and results workflows
