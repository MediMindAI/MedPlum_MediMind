# Region-District Cascading Dropdown Mapping

## Overview

This document contains the complete region-district (რეგიონი-რაიონი) cascading dropdown data extracted from the SoftMedic EMR system's Registration Visit Modal demographics section.

## Source Information

- **Source**: SoftMedic EMR System - Registration Visit Modal
- **Section**: 4 დემოგრაფია (Demographics)
- **Extraction Date**: 2025-11-16
- **Source URL**: http://178.134.21.82:8008/clinic.php
- **Region Select ID**: `mo_regions`
- **District Select ID**: `mo_raions_hid` (hidden select containing all districts)

## Statistics

- **Total Regions**: 13
- **Total Districts**: 94
- **Largest Region**: თბილისი (Tbilisi) with 17 districts
- **Smallest Region**: საზღვარგარეთი (Foreign) with 1 district

## Technical Implementation Notes

### Region Select (`mo_regions`)

The region dropdown uses **internal database IDs** as values, NOT sequential numbers:

| Region Code | Internal ID | Region Name |
|-------------|-------------|-------------|
| 01 | 1 | აფხაზეთი |
| 02 | 10 | აჭარა |
| 03 | 17 | გურია |
| 04 | 21 | თბილისი |
| 05 | 39 | იმერეთი |
| 06 | 52 | კახეთი |
| 07 | 61 | მცხეთა-მთიანეთი |
| 08 | 67 | რაჭა-ლეჩხუმი და ქვემო სვანეთი |
| 09 | 72 | საზღვარგარეთი |
| 10 | 74 | სამეგრელო და ზემო სვანეთი |
| 11 | 84 | სამცხე-ჯავახეთი |
| 12 | 91 | ქვემო ქართლი |
| 13 | 99 | შიდა ქართლი |

### District Select (`mo_raions_hid`)

The hidden district select contains all 94 districts. Each option's `value` attribute corresponds to the region's internal ID. The district code follows the pattern: **RRDD** where:
- **RR** = Region code (01-13, based on display order, not internal ID)
- **DD** = District number within region (01-17)

### Cascading Behavior

When a user selects a region:
1. JavaScript filters the hidden `mo_raions_hid` select
2. Only districts with matching `value` (region internal ID) are shown
3. The visible district dropdown is populated with filtered options

## Complete Region-District Mapping

### 01 - აფხაზეთი (Abkhazia)
**Internal ID**: 1 | **Districts**: 8

| Code | District Name (Georgian) |
|------|-------------------------|
| 0101 | გაგრა |
| 0102 | გალი |
| 0103 | გუდაუთა |
| 0104 | გულრიფში |
| 0105 | ზემო აფხაზეთი |
| 0106 | ოჩამჩირე |
| 0107 | სოხუმი |
| 0108 | ტყვარჩელი |

### 02 - აჭარა (Adjara)
**Internal ID**: 10 | **Districts**: 6

| Code | District Name (Georgian) |
|------|-------------------------|
| 0201 | ბათუმი |
| 0202 | ქედა |
| 0203 | ქობულეთი |
| 0204 | შუახევი |
| 0205 | ხელვაჩაური |
| 0206 | ხულო |

### 03 - გურია (Guria)
**Internal ID**: 17 | **Districts**: 3

| Code | District Name (Georgian) |
|------|-------------------------|
| 0301 | ლანჩხუთი |
| 0302 | ოზურგეთი |
| 0303 | ჩოხატაური |

### 04 - თბილისი (Tbilisi)
**Internal ID**: 21 | **Districts**: 17

| Code | District Name (Georgian) |
|------|-------------------------|
| 0401 | გლდანი |
| 0402 | გლდანი-ნაძალადევი |
| 0403 | დიდგორი |
| 0404 | დიდუბე |
| 0405 | დიდუბე-ჩუღურეთი |
| 0406 | ვაკე |
| 0407 | ვაკე-საბურთალო |
| 0408 | თბილისი |
| 0409 | ისანი |
| 0410 | ისანი-სამგორი |
| 0411 | კრწანისი |
| 0412 | მთაწმინდა |
| 0413 | ნაძალადევი |
| 0414 | საბურთალო |
| 0415 | სამგორი |
| 0416 | ჩუღურეთი |
| 0417 | ძველი თბილისი |

### 05 - იმერეთი (Imereti)
**Internal ID**: 39 | **Districts**: 12

| Code | District Name (Georgian) |
|------|-------------------------|
| 0501 | ბაღდათი |
| 0502 | ვანი |
| 0503 | ზესტაფონი |
| 0504 | თერჯოლა |
| 0505 | სამტრედია |
| 0506 | საჩხერე |
| 0507 | ტყიბული |
| 0508 | ქუთაისი |
| 0509 | წყალტუბო |
| 0510 | ჭიათურა |
| 0511 | ხარაგაული |
| 0512 | ხონი |

### 06 - კახეთი (Kakheti)
**Internal ID**: 52 | **Districts**: 8

| Code | District Name (Georgian) |
|------|-------------------------|
| 0601 | ახმეტა |
| 0602 | გურჯაანი |
| 0603 | დედოფლისწყარო |
| 0604 | თელავი |
| 0605 | ლაგოდეხი |
| 0606 | საგარეჯო |
| 0607 | სიღნაღი |
| 0608 | ყვარელი |

### 07 - მცხეთა-მთიანეთი (Mtskheta-Mtianeti)
**Internal ID**: 61 | **Districts**: 5

| Code | District Name (Georgian) |
|------|-------------------------|
| 0701 | ახალგორი |
| 0702 | დუშეთი |
| 0703 | თიანეთი |
| 0704 | მცხეთა |
| 0705 | ყაზბეგი |

### 08 - რაჭა-ლეჩხუმი და ქვემო სვანეთი (Racha-Lechkhumi and Kvemo Svaneti)
**Internal ID**: 67 | **Districts**: 4

| Code | District Name (Georgian) |
|------|-------------------------|
| 0801 | ამბროლაური |
| 0802 | ლენტეხი |
| 0803 | ონი |
| 0804 | ცაგერი |

### 09 - საზღვარგარეთი (Foreign/Abroad)
**Internal ID**: 72 | **Districts**: 1

| Code | District Name (Georgian) |
|------|-------------------------|
| 0901 | საზღვარგარეთი |

### 10 - სამეგრელო და ზემო სვანეთი (Samegrelo-Zemo Svaneti)
**Internal ID**: 74 | **Districts**: 9

| Code | District Name (Georgian) |
|------|-------------------------|
| 1001 | აბაშა |
| 1002 | ზუგდიდი |
| 1003 | მარტვილი |
| 1004 | მესტია |
| 1005 | სენაკი |
| 1006 | ფოთი |
| 1007 | ჩხოროწყუ |
| 1008 | წალენჯიხა |
| 1009 | ხობი |

### 11 - სამცხე-ჯავახეთი (Samtskhe-Javakheti)
**Internal ID**: 84 | **Districts**: 6

| Code | District Name (Georgian) |
|------|-------------------------|
| 1101 | ადიგენი |
| 1102 | ასპინძა |
| 1103 | ახალქალაქი |
| 1104 | ახალციხე |
| 1105 | ბორჯომი |
| 1106 | ნინოწმინდა |

### 12 - ქვემო ქართლი (Kvemo Kartli)
**Internal ID**: 91 | **Districts**: 7

| Code | District Name (Georgian) |
|------|-------------------------|
| 1201 | ბოლნისი |
| 1202 | გარდაბანი |
| 1203 | დმანისი |
| 1204 | თეთრიწყარო |
| 1205 | მარნეული |
| 1206 | რუსთავი |
| 1207 | წალკა |

### 13 - შიდა ქართლი (Shida Kartli)
**Internal ID**: 99 | **Districts**: 8

| Code | District Name (Georgian) |
|------|-------------------------|
| 1301 | გორი |
| 1302 | კასპი |
| 1303 | ქარელი |
| 1304 | ქურთა |
| 1305 | ყორნისი |
| 1306 | ცხინვალი |
| 1307 | ხაშური |
| 1308 | ჯავა |

## React Implementation Example

```typescript
import regionDistrictData from './region-district-mapping.json';

interface District {
  code: string;
  label: string;
}

interface RegionData {
  regionName: string;
  regionCode: string;
  regionNameKa: string;
  districts: District[];
}

// Get districts for a selected region
function getDistrictsForRegion(regionInternalId: string): District[] {
  const regionData = regionDistrictData.regionDistrictMapping[regionInternalId];
  return regionData ? regionData.districts : [];
}

// React component usage
function DemographicsForm() {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [availableDistricts, setAvailableDistricts] = useState<District[]>([]);

  const handleRegionChange = (regionId: string) => {
    setSelectedRegion(regionId);
    setSelectedDistrict(''); // Reset district when region changes
    setAvailableDistricts(getDistrictsForRegion(regionId));
  };

  return (
    <div>
      <Select
        label="რეგიონი"
        value={selectedRegion}
        onChange={handleRegionChange}
        data={Object.entries(regionDistrictData.regionDistrictMapping).map(
          ([id, data]) => ({
            value: id,
            label: data.regionName
          })
        )}
      />
      <Select
        label="რაიონი"
        value={selectedDistrict}
        onChange={setSelectedDistrict}
        data={availableDistricts.map(d => ({
          value: d.code,
          label: `${d.code} - ${d.label}`
        }))}
        disabled={!selectedRegion}
      />
    </div>
  );
}
```

## Data Integrity Notes

1. **Georgian Character Encoding**: All Georgian text is UTF-8 encoded
2. **Historical Districts**: Some Tbilisi districts include historical names (e.g., "გლდანი-ნაძალადევი", "ვაკე-საბურთალო")
3. **Occupied Territories**: Includes districts in Abkhazia and South Ossetia (under Georgian sovereignty but occupied)
4. **Foreign Address**: Region 09 (საზღვარგარეთი) is for patients with foreign addresses

## Related Files

- JSON Data: `region-district-mapping.json`
- Modal Documentation: `../forms/registration-visit-modal.md`
- Patient Demographics: `../forms/patient-demographics.md`

## Change History

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-16 | 1.0 | Initial extraction from SoftMedic EMR |
