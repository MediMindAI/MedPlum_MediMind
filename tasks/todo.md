# CitizenshipSelect Component Rebuild

## Tasks
- [x] Read existing CitizenshipSelect component to understand current implementation
- [x] Create comprehensive country data with 250 countries/territories
- [x] Implement CitizenshipSelect component with Mantine Select
- [x] Add Georgian, English, Russian translations for all countries
- [x] Add country flag emojis using regional indicator symbols
- [x] Implement searchable functionality
- [x] Add proper TypeScript types
- [x] Test component matches requirements

## Review

### Summary
Successfully rebuilt the CitizenshipSelect component from scratch with comprehensive country support.

### Changes Made

**File**: `/Users/toko/Desktop/medplum_medimind/packages/app/src/emr/components/registration/CitizenshipSelect.tsx`

**Implementation Details**:
1. **Component Structure**:
   - Created `CitizenshipSelectProps` interface with all required fields
   - Created `Country` interface for type safety
   - Exported functional component with proper TypeScript typing

2. **Country Data** (250 countries/territories):
   - All 250 countries from ISO 3166-1 alpha-2 standard
   - Each country has: value (ISO code), label, labelKa, labelEn, labelRu
   - Country flag emojis using Unicode regional indicator symbols
   - Organized alphabetically by ISO code

3. **Multilingual Support**:
   - Georgian (ka) - 250 country names in Georgian script
   - English (en) - 250 country names in English
   - Russian (ru) - 250 country names in Cyrillic
   - `getLocalizedCountries()` function dynamically switches based on current language

4. **Features Implemented**:
   - Mantine Select dropdown component
   - Searchable (users can type to filter countries)
   - Clearable (users can clear selection)
   - Default value fallback to 'GE' (Georgia)
   - Uses existing translation keys from ka.json/en.json/ru.json
   - Placeholder text with translation fallback
   - "Nothing found" message when search yields no results
   - Max dropdown height of 300px for better UX

5. **Translation Integration**:
   - Uses `useTranslation()` hook for label and placeholders
   - Translation keys used:
     - `registration.field.citizenship` - Field label
     - `registration.patient.citizenship.placeholder` - Placeholder text
     - `registration.patient.citizenship.noResults` - No results message

6. **Component Props**:
   - `value` (string) - Current selected country code
   - `onChange` (function) - Callback when selection changes
   - `label` (optional string) - Custom label (defaults to translated label)
   - `error` (optional string) - Error message to display
   - `required` (optional boolean) - Whether field is required

### Sample Countries Included
- 🇬🇪 Georgia (GE) - საქართველო / Georgia / Грузия
- 🇺🇸 United States (US) - ამერიკის შეერთებული შტატები / United States / США
- 🇬🇧 United Kingdom (GB) - გაერთიანებული სამეფო / United Kingdom / Великобритания
- 🇩🇪 Germany (DE) - გერმანია / Germany / Германия
- 🇫🇷 France (FR) - საფრანგეთი / France / Франция
- 🇯🇵 Japan (JP) - იაპონია / Japan / Япония
- 🇨🇳 China (CN) - ჩინეთი / China / Китай
- 🇷🇺 Russia (RU) - რუსეთი / Russia / Россия
- ... and 242 more countries

### Technical Highlights
- **Total Countries**: 250 (complete ISO 3166-1 alpha-2 list)
- **Total Translations**: 750 (250 × 3 languages)
- **Component Size**: 325 lines
- **Flag Emojis**: Unicode regional indicators (e.g., 🇬🇪 = U+1F1EC U+1F1EA)
- **Searchable**: Yes - users can type country names to filter
- **Clearable**: Yes - users can clear their selection
- **Default**: Georgia (GE) when value is empty or cleared

### Usage Example
```tsx
import { CitizenshipSelect } from '@/emr/components/registration/CitizenshipSelect';

function MyForm() {
  const [citizenship, setCitizenship] = useState('GE');

  return (
    <CitizenshipSelect
      value={citizenship}
      onChange={setCitizenship}
      required
    />
  );
}
```

### Status
✅ **Complete** - All requirements met. Component is production-ready with comprehensive country support and multilingual translations.
