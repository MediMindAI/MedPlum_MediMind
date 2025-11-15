# Original EMR Registration Page - Complete Field Mapping

**Date:** 2025-11-14
**Purpose:** Match current implementation to original EMR exactly

---

## 📋 TABLE OF CONTENTS
1. [Search Form Fields](#search-form-fields)
2. [Registration Form Fields](#registration-form-fields)
3. [Patient Table Columns](#patient-table-columns)
4. [Edit Modal Fields](#edit-modal-fields)
5. [Comparison with Current Implementation](#comparison)
6. [Implementation Action Plan](#action-plan)

---

## 1️⃣ SEARCH FORM FIELDS (Left Section - "პაციენტის ძიება")

### Current Implementation ✅
```typescript
1. პირადი ნომერი (Personal ID) - TextInput
2. სახელი (First Name) - TextInput
3. გვარი (Last Name) - TextInput
4. რეგისტრაციის ნომერი (Registration Number) - TextInput
5. Search Button
```

### Original EMR 🎯
```typescript
1. სახელი: (First Name) - TextInput
2. გვარი: (Last Name) - TextInput
3. პირადი ნომერი: (Personal ID) - TextInput
4. რიგითი ნომერი: (Registration Number) - TextInput
5. Search Button with Magnifying Glass Icon
```

### ✅ Status: COMPLETE - Fields match (order slightly different)

---

## 2️⃣ REGISTRATION FORM FIELDS (Right Section - "პაციენტის დამატება")

### Current Implementation (After Collapsible Sections)
```typescript
Section 1: Personal Information (6 fields)
├── პირადი ნომერი (Personal ID)
├── სქესი* (Gender*)
├── სახელი* (First Name*)
├── გვარი* (Last Name*)
├── მამის სახელი (Father's Name)
└── დაბადების თარიღი (Birth Date)

Section 2: Contact Information (3 fields)
├── ტელეფონის ნომერი (Phone Number)
├── ელ. ფოსტა (Email)
└── მისამართი (Address)

Section 3: Additional Details (1 field)
└── მოქალაქეობა (Citizenship)
```

### Original EMR 🎯
```typescript
Row 1 (4 fields):
├── პირადი ნომერი (Personal ID) - with search icon
├── სახელი* (First Name*) - required
├── გვარი* (Last Name*) - required
└── მამის სახელი (Father's Name)

Row 2 (4 fields):
├── დაბადების თარიღი: (Birth Date) - date picker
├── სქესი* (Gender*) - dropdown required
├── მოკალუბელობა (Marital Status) - dropdown
└── მოქალაქეობა (Citizenship) - dropdown with search

Row 3 (2 fields):
├── ტელეფონი (Phone) - with country flag dropdown (+995)
└── იმეილი (Email)

Row 4 (2 fields):
├── ნათესაური კავშირი (Family Relationship) - text/dropdown
└── სამუშაო აყროლი (Workplace Address)

Row 5 (4 fields):
├── სამუშაო (Workplace/Occupation)
├── ისუნი (City/Region) - dropdown
├── სუხა (District) - dropdown
└── ბუვა (Building/Street)

Additional visible section (scrolled):
├── ნათესავა (Relative section) - dropdown
├── სახელი (Name)
├── გვარი (Surname)
└── პირადი ნომერი (Personal ID)

Checkbox (Top Right):
└── ☐ უცნობი (Unknown Patient)

Blue Submit Button (Bottom)
```

### ❌ MISSING FIELDS TO ADD:
1. **მოკალუბელობა** (Marital Status) - dropdown
2. **ნათესაური კავშირი** (Family Relationship) - text input
3. **სამუშაო აყროლი** (Workplace Address) - text input
4. **სამუშაო** (Workplace/Occupation) - text input
5. **ისუნი** (City/Region) - dropdown
6. **სუხა** (District) - dropdown
7. **ბუვა** (Building/Street) - text input
8. **Relative/Guardian section fields** (visible when scrolled):
   - ნათესავა (Relative) - dropdown
   - სახელი (Name)
   - გვარი (Surname)
   - პირადი ნომერი (Personal ID)

---

## 3️⃣ PATIENT TABLE COLUMNS (Bottom Section)

### Current Implementation ✅
```typescript
1. პირადი ნომერი (Personal ID)
2. სახელი (First Name)
3. გვარი (Last Name)
4. სქესი (Gender)
5. დაბადების თარიღი (Birth Date)
6. ტელეფონი (Phone)
7. Actions (Edit/Delete)
```

### Original EMR 🎯
```typescript
1. რიგი # (Row Number) - auto-generated
2. პირადი # (Personal ID Number)
3. სახელი (First Name)
4. გვარი (Last Name)
5. დაბ. თარიღი (Birth Date)
6. სქესი (Gender)
7. ტელეფონი (Phone)
8. მისამართი (Address) - NEW COLUMN
9. ✏️ Edit Icon
10. 🗑️ Delete Icon
```

### ❌ MISSING COLUMN:
- **Column 1: რიგი #** (Row Number) - Sequential numbering
- **Column 8: მისამართი** (Address) - Full address display

---

## 4️⃣ EDIT MODAL FIELDS (Opens on clicking Edit Icon)

### Modal Header
```typescript
Title: "პერსონალური ინფორმაცია" (Personal Information)
Tab: "ძირითადი" (Basic)

Metadata displayed:
├── შექმნა: (Created by) - User name
├── შექმნის თარიღი: (Creation date) - 2025-11-14 17:49:53
└── რიგითი # 99201 (Registration Number)
```

### Current Implementation (PatientEditModal - 11 fields)
```typescript
Same as PatientForm:
1. პირადი ნომერი (Personal ID)
2. სახელი* (First Name*)
3. გვარი* (Last Name*)
4. მამის სახელი (Father's Name)
5. სქესი* (Gender*)
6. დაბადების თარიღი (Birth Date)
7. მოქალაქეობა (Citizenship)
8. ტელეფონი (Phone)
9. ელ. ფოსტა (Email)
10. მისამართი (Address)
11. Submit button
```

### Original EMR 🎯
```typescript
Main Form Fields (Left Column):
1. პირადი # (Personal ID) - 01024070075
2. სახელი* (First Name*) - ნიკა
3. გვარი* (Last Name*) - მესხიშვილი
4. დაბადების თარიღი: (Birth Date) - 12-10-1993 with checkbox
5. სქესი* (Gender*) - მამრობითი dropdown
6. ტელეფონი (Phone) - +995 555 86 66 86 with country flag
7. მამის სახელი (Father's Name)
8. იმეილი (Email)
9. მოკალუბელობა (Marital Status) - "სატწაროკუთლო" dropdown
10. მოქალაქეობა (Citizenship) - dropdown
11. მისამართი (Address) - LARGE textarea showing:
    "სატწაროკუთლო, ქვაძი თბილისი, გამის-
    მაწიგენანს გამბინი, N 785, ბინა 49"
12. სამუშაო აყროლი (Workplace Address) - textarea

Additional Section Fields (appears to be guardian/relative):
13. ნათესავა (Citizenship/Relationship) - dropdown
14. სახელი (Name)
15. გვარი (Surname)
16. პირადი # (Personal ID)
17. დაბადების თარიღი (Birth Date)
18. სქესი (Gender) - dropdown
19. ტელეფონი (Phone) - with checkbox
20. მოკალუბელობა (Marital Status) - dropdown
21. მისამართი (Address)

Bottom Fields:
22. უბური (Region/District) - dropdown at bottom
23. უნივერსიტი კოლი (University/Education) - dropdown

Green "შენახვა" (Save) Button
```

### ❌ MISSING FIELDS IN EDIT MODAL:
1. **Modal metadata header** (Created by, Creation date, Reg #)
2. **მოკალუბელობა** (Marital Status) - dropdown
3. **სამუშაო აყროლი** (Workplace Address) - textarea
4. **Guardian/Relative section** (13-21 fields listed above)
5. **უბური** (Region/District) - dropdown
6. **უნივერსიტი კოლი** (Education Level) - dropdown
7. **Checkboxes** next to certain fields (birth date, phone)
8. **Address as LARGE textarea** (currently single line)

---

## 5️⃣ COMPARISON WITH CURRENT IMPLEMENTATION

### ✅ WHAT'S CORRECT:
1. Search form fields match (4 fields)
2. Basic personal information fields present
3. Phone with international flag selector
4. Email field
5. Citizenship dropdown with 250 countries
6. Table has edit/delete actions
7. Collapsible UI implemented beautifully

### ❌ WHAT'S MISSING:

#### Registration Form:
- [ ] **მოკალუბელობა** (Marital Status) dropdown
- [ ] **ნათესაური კავშირი** (Family Relationship) field
- [ ] **სამუშაო** (Workplace/Occupation) field
- [ ] **სამუშაო აყროლი** (Workplace Address) textarea
- [ ] **ისუნი** (City) dropdown
- [ ] **სუხა** (District) dropdown
- [ ] **ბუვა** (Building/Street) field
- [ ] Relative/Guardian subsection with 4 fields
- [ ] **უცნობი** (Unknown Patient) checkbox positioning

#### Patient Table:
- [ ] **რიგი #** (Row Number) column as first column
- [ ] **მისამართი** (Address) column

#### Edit Modal:
- [ ] Modal header with metadata (Created by, Creation date, Reg #)
- [ ] **მოკალუბელობა** (Marital Status) dropdown
- [ ] **სამუშაო აყროლი** (Workplace Address) textarea
- [ ] Guardian/Relative section (complete subsection)
- [ ] **უბური** (Region) dropdown
- [ ] **უნივერსიტი კოლი** (Education) dropdown
- [ ] Checkboxes next to birth date and phone fields
- [ ] Address as LARGE multiline textarea (not single line)

### 🔄 WHAT NEEDS REORDERING:
1. Field order in registration form needs to match original exactly
2. Table columns order (add Row # as first column, Address before actions)

---

## 6️⃣ IMPLEMENTATION ACTION PLAN

### Phase 1: Add Missing Fields to Registration Form
**Files to modify:**
- `PatientForm.tsx`
- `types/registration.ts`
- `services/patientService.ts`

**Fields to add:**
```typescript
interface PatientFormValues {
  // Existing fields...
  personalId: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  gender: string;
  birthDate: string;
  phoneNumber: string;
  email: string;
  address: string;
  citizenship: string;

  // NEW FIELDS TO ADD:
  maritalStatus: string;           // მოკალუბელობა
  familyRelationship: string;      // ნათესაური კავშირი
  workplace: string;               // სამუშაო
  workplaceAddress: string;        // სამუშაო აყროლი
  city: string;                    // ისუნი
  district: string;                // სუხა
  building: string;                // ბუვა
  region: string;                  // უბური
  educationLevel: string;          // უნივერსიტი კოლი

  // Guardian/Relative fields
  guardianRelationship: string;    // ნათესავა
  guardianFirstName: string;       // სახელი
  guardianLastName: string;        // გვარი
  guardianPersonalId: string;      // პირადი #
  guardianBirthDate: string;       // დაბადების თარიღი
  guardianGender: string;          // სქესი
  guardianPhone: string;           // ტელეფონი
  guardianMaritalStatus: string;   // მოკალუბელობა
  guardianAddress: string;         // მისამართი
}
```

### Phase 2: Update Patient Table
**Files to modify:**
- `PatientTable.tsx`

**Changes:**
1. Add **Row Number** column as first column (auto-generated)
2. Add **Address** column (8th column, before actions)
3. Reorder columns to match original exactly

### Phase 3: Enhance Edit Modal
**Files to modify:**
- `PatientEditModal.tsx`

**Changes:**
1. Add modal header with metadata:
   - Created by user
   - Creation timestamp
   - Registration number display
2. Add all missing fields (same as registration form)
3. Convert address field to **large textarea** (multiline)
4. Add checkboxes next to birth date and phone
5. Add complete Guardian/Relative section
6. Add Region and Education dropdowns at bottom

### Phase 4: Add Translations
**Files to modify:**
- `translations/ka.json`
- `translations/en.json`
- `translations/ru.json`

**New translation keys needed:**
```json
{
  "registration.field.maritalStatus": "მოკალუბელობა | Marital Status | Семейное положение",
  "registration.field.familyRelationship": "ნათესაური კავშირი | Family Relationship | Семейная связь",
  "registration.field.workplace": "სამუშაო | Workplace | Место работы",
  "registration.field.workplaceAddress": "სამუშაო აყროლი | Workplace Address | Адрес работы",
  "registration.field.city": "ისუნი | City | Город",
  "registration.field.district": "სუხა | District | Район",
  "registration.field.building": "ბუვა | Building | Здание",
  "registration.field.region": "უბური | Region | Регион",
  "registration.field.educationLevel": "უნივერსიტი კოლი | Education | Образование",
  "registration.section.guardian": "წარმომადგენელი/ნათესავი | Guardian/Relative | Представитель/Родственник",
  "registration.table.rowNumber": "რიგი # | Row # | № строки",
  "registration.table.address": "მისამართი | Address | Адрес",
  "registration.modal.createdBy": "შექმნა | Created by | Создано",
  "registration.modal.creationDate": "შექმნის თარიღი | Creation Date | Дата создания"
}
```

### Phase 5: FHIR Mapping
**Update FHIR resource mappings:**
```typescript
// Patient resource extensions
{
  extension: [
    { url: "maritalStatus", valueCodeableConcept: {...} },
    { url: "workplace", valueString: "..." },
    { url: "workplaceAddress", valueString: "..." },
    { url: "city", valueString: "..." },
    { url: "district", valueString: "..." },
    { url: "building", valueString: "..." },
    { url: "region", valueString: "..." },
    { url: "educationLevel", valueCodeableConcept: {...} }
  ]
}
```

---

## 📊 ESTIMATED SCOPE

**Total Missing Fields:** 17 fields
**Total Missing Columns:** 2 columns
**Files to Modify:** 8-10 files
**Estimated Time:** 4-6 hours

**Priority:**
1. 🔴 HIGH: Patient Table columns (visible immediately)
2. 🟡 MEDIUM: Registration form fields (frequently used)
3. 🟢 LOW: Edit modal enhancements (less frequently accessed)

---

## ✅ READY TO IMPLEMENT

I have extracted all field information from the original EMR. You can now:

1. **Review this mapping** to confirm accuracy
2. **Prioritize which fields** to add first
3. **Approve implementation** to proceed

Would you like me to:
- Start with the Patient Table updates (add Row # and Address columns)?
- Add all missing fields to the Registration Form?
- Complete the Edit Modal enhancements?
- Do all of the above in sequence?

Please confirm and I'll begin implementation! 🚀
