# My Patients - Translation Documentation

## Overview
This document provides Georgian to English (and Russian) translations for all UI text on the My Patients page. These translations are essential for implementing multilingual support in the Medplum-based system.

**Extraction Date**: 2025-11-14
**Languages**: Georgian (ka), English (en), Russian (ru)
**Default Language**: Georgian (ka)

---

## Navigation Translations

### Main Menu (Top Navigation)

| Georgian (ka) | English (en) | Russian (ru) | Key | Notes |
|--------------|-------------|-------------|-----|-------|
| რეგისტრაცია | Registration | Регистрация | menu.registration | Patient registration module |
| პაციენტის ისტორია | Patient History | История пациента | menu.patientHistory | Patient history module (active) |
| ნომენკლატურა | Nomenclature | Номенклатура | menu.nomenclature | Medical coding/terminology |
| ადმინისტრირება | Administration | Администрирование | menu.administration | System administration |
| ფორმები | Forms | Формы | menu.forms | Medical forms |
| ანგარიშები | Reports | Отчеты | menu.reports | Reporting module |

### Patient History Sub-Menu

| Georgian (ka) | English (en) | Russian (ru) | Key | Notes |
|--------------|-------------|-------------|-----|-------|
| ისტორია | History | История | patientHistory.history | Visit history table |
| ჩემი პაციენტები | My Patients | Мои пациенты | patientHistory.myPatients | Current page (active) |
| სუროგაცია | Surrogacy | Суррогатное материнство | patientHistory.surrogacy | Surrogacy management |
| ინვოისები | Invoices | Счета | patientHistory.invoices | Billing/invoices |
| 100 რეკორდი | 100 Records | 100 записей | patientHistory.records100 | Special records view |
| განრიგი | Schedule | Расписание | patientHistory.schedule | Scheduling |
| მესანჯერი | Messenger | Мессенджер | patientHistory.messenger | Internal messaging |
| ლაბორატორია | Laboratory | Лаборатория | patientHistory.laboratory | Lab results |
| მორიგეობა | Duty | Дежурство | patientHistory.duty | Duty/on-call schedule |
| დანიშნულება | Appointments | Назначения | patientHistory.appointments | Appointment management |
| სტაციონარი | Inpatient | Стационар | patientHistory.inpatient | Inpatient management |
| კვება | Nutrition | Питание | patientHistory.nutrition | Nutrition/diet plans |
| MOH | MOH | МЗ | patientHistory.moh | Ministry of Health |

---

## Filter Controls Translations

### Filter Labels

| Georgian (ka) | English (en) | Russian (ru) | Key | Notes |
|--------------|-------------|-------------|-----|-------|
| მკურნალი ექიმი | Treating Doctor | Лечащий врач | filters.treatingDoctor | Doctor dropdown label |
| განყოფილება | Department | Отделение | filters.department | Department dropdown label |
| გაუწერელი | Not Discharged | Не выписанный | filters.notDischarged | Not discharged checkbox label |
| ისხ # | Reg # | Рег. № | filters.registrationNumber | Registration number input label |

### Filter Placeholders

| Georgian (ka) | English (en) | Russian (ru) | Key | Notes |
|--------------|-------------|-------------|-----|-------|
| - | - | - | filters.defaultOption | Default dropdown option |
| აირჩიეთ ექიმი | Select Doctor | Выберите врача | filters.selectDoctor | Doctor dropdown placeholder |
| აირჩიეთ განყოფილება | Select Department | Выберите отделение | filters.selectDepartment | Department dropdown placeholder |
| შეიყვანეთ ნომერი | Enter Number | Введите номер | filters.enterNumber | Registration number placeholder |

### Filter Tooltips

| Georgian (ka) | English (en) | Russian (ru) | Key | Notes |
|--------------|-------------|-------------|-----|-------|
| აირჩიეთ მკურნალი ექიმი პაციენტების ფილტრაციისთვის | Select treating doctor to filter patients | Выберите лечащего врача для фильтрации пациентов | filters.doctorTooltip | Tooltip for doctor dropdown |
| აირჩიეთ განყოფილება პაციენტების ფილტრაციისთვის | Select department to filter patients | Выберите отделение для фильтрации пациентов | filters.departmentTooltip | Tooltip for department dropdown |
| მონიშნეთ გაუწერელი პაციენტების სანახავად | Check to view patients not yet discharged | Отметьте для просмотра не выписанных пациентов | filters.notDischargedTooltip | Tooltip for not discharged checkbox |
| შეიყვანეთ რეგისტრაციის ნომერი | Enter registration number | Введите регистрационный номер | filters.regNumberTooltip | Tooltip for registration input |

---

## Table Translations

### Table Column Headers

| Georgian (ka) | English (en) | Russian (ru) | Key | Notes |
|--------------|-------------|-------------|-----|-------|
| პორად # | Portal # | Портал № | table.columns.portalNumber | Registration/Portal number |
| საწოლი | First Name | Имя | table.columns.firstName | First name (Note: header incorrectly says "Bed" in legacy system) |
| გვარი | Last Name | Фамилия | table.columns.lastName | Patient's last name |
| სქესი | Gender | Пол | table.columns.gender | Patient's gender |
| დაბ. თარიღი | Date of Birth | Дата рождения | table.columns.dateOfBirth | Patient's birthdate (abbreviated) |
| ტელეფონი | Phone | Телефон | table.columns.phone | Phone number |
| რეგ.# | Reg # | Рег. № | table.columns.regNumber | Registration number (abbreviated) |

### Table Column Headers (Full Forms)

| Georgian (ka) | English (en) | Russian (ru) | Key | Notes |
|--------------|-------------|-------------|-----|-------|
| პორტალის ნომერი | Portal Number | Портальный номер | table.columns.portalNumberFull | Full form |
| დაბადების თარიღი | Date of Birth | Дата рождения | table.columns.dateOfBirthFull | Full form |
| რეგისტრაციის ნომერი | Registration Number | Регистрационный номер | table.columns.regNumberFull | Full form |

### Gender Values

| Georgian (ka) | English (en) | Russian (ru) | Key | Notes |
|--------------|-------------|-------------|-----|-------|
| მამრობითი | Male | Мужской | gender.male | Male gender value |
| მდედრობითი | Female | Женский | gender.female | Female gender value |

---

## Action Buttons

### Primary Actions

| Georgian (ka) | English (en) | Russian (ru) | Key | Notes |
|--------------|-------------|-------------|-----|-------|
| ძებნა | Search | Поиск | actions.search | Search button (icon tooltip) |
| გაწმენდა | Clear | Очистить | actions.clear | Clear filters button |
| ექსპორტი | Export | Экспорт | actions.export | Export data button |
| ბეჭდვა | Print | Печать | actions.print | Print button |
| განახლება | Refresh | Обновить | actions.refresh | Refresh data button |

### Row Actions (If Present)

| Georgian (ka) | English (en) | Russian (ru) | Key | Notes |
|--------------|-------------|-------------|-----|-------|
| ნახვა | View | Просмотр | actions.view | View patient details |
| რედაქტირება | Edit | Редактировать | actions.edit | Edit patient |
| წაშლა | Delete | Удалить | actions.delete | Delete patient |
| ისტორია | History | История | actions.history | View patient history |

---

## Status Messages

### Success Messages

| Georgian (ka) | English (en) | Russian (ru) | Key | Notes |
|--------------|-------------|-------------|-----|-------|
| ძებნა წარმატებულია | Search successful | Поиск выполнен успешно | messages.searchSuccess | Search completed |
| მონაცემები განახლდა | Data refreshed | Данные обновлены | messages.dataRefreshed | Data reload success |

### Error Messages

| Georgian (ka) | English (en) | Russian (ru) | Key | Notes |
|--------------|-------------|-------------|-----|-------|
| მონაცემები არ მოიძებნა | No data found | Данные не найдены | messages.noDataFound | Empty state message |
| შეცდომა მოხდა | An error occurred | Произошла ошибка | messages.error | Generic error |
| სერვერთან კავშირი ვერ მოხერხდა | Could not connect to server | Не удалось подключиться к серверу | messages.connectionError | Network error |
| არასწორი მონაცემები | Invalid data | Неверные данные | messages.invalidData | Validation error |

### Info Messages

| Georgian (ka) | English (en) | Russian (ru) | Key | Notes |
|--------------|-------------|-------------|-----|-------|
| იტვირთება... | Loading... | Загрузка... | messages.loading | Loading indicator |
| გთხოვთ დაელოდოთ | Please wait | Пожалуйста, подождите | messages.pleaseWait | Wait message |
| შეცვალეთ ფილტრები და სცადეთ ხელახლა | Modify filters and try again | Измените фильтры и попробуйте снова | messages.modifyFilters | Suggestion when no results |

### Warning Messages

| Georgian (ka) | English (en) | Russian (ru) | Key | Notes |
|--------------|-------------|-------------|-----|-------|
| დარწმუნებული ხართ? | Are you sure? | Вы уверены? | messages.areYouSure | Confirmation prompt |
| ეს მოქმედება შეუქცევადია | This action is irreversible | Это действие необратимо | messages.irreversibleAction | Delete warning |

---

## Department Names

### Common Hospital Departments

| Georgian (ka) | English (en) | Russian (ru) | Key | Notes |
|--------------|-------------|-------------|-----|-------|
| კარდიოლოგია | Cardiology | Кардиология | departments.cardiology | Heart department |
| ქირურგია | Surgery | Хирургия | departments.surgery | Surgical department |
| თერაპია | Internal Medicine | Терапия | departments.therapy | General medicine |
| პედიატრია | Pediatrics | Педиатрия | departments.pediatrics | Children's department |
| გინეკოლოგია | Gynecology | Гинекология | departments.gynecology | Women's health |
| ნევროლოგია | Neurology | Неврология | departments.neurology | Nervous system |
| ორთოპედია | Orthopedics | Ортопедия | departments.orthopedics | Bone/joint department |
| რეანიმაცია | ICU | Реанимация | departments.icu | Intensive care unit |
| მშობიარობა | Maternity | Роддом | departments.maternity | Childbirth department |
| ონკოლოგია | Oncology | Онкология | departments.oncology | Cancer treatment |
| დერმატოლოგია | Dermatology | Дерматология | departments.dermatology | Skin conditions |
| ოფთალმოლოგია | Ophthalmology | Офтальмология | departments.ophthalmology | Eye care |
| ოტორინოლარინგოლოგია | ENT | Отоларингология | departments.ent | Ear, nose, throat |
| უროლოგია | Urology | Урология | departments.urology | Urinary system |
| ენდოკრინოლოგია | Endocrinology | Эндокринология | departments.endocrinology | Hormonal disorders |
| გასტროენტეროლოგია | Gastroenterology | Гастроэнтерология | departments.gastroenterology | Digestive system |
| ფსიქიატრია | Psychiatry | Психиатрия | departments.psychiatry | Mental health |

---

## Pagination & Record Count

### Pagination Controls

| Georgian (ka) | English (en) | Russian (ru) | Key | Notes |
|--------------|-------------|-------------|-----|-------|
| წინა | Previous | Предыдущая | pagination.previous | Previous page |
| შემდეგი | Next | Следующая | pagination.next | Next page |
| პირველი | First | Первая | pagination.first | First page |
| ბოლო | Last | Последняя | pagination.last | Last page |
| გვერდი | Page | Страница | pagination.page | Page label |
| სულ | Total | Всего | pagination.total | Total records |

### Record Count Display

| Georgian (ka) | English (en) | Russian (ru) | Key | Notes |
|--------------|-------------|-------------|-----|-------|
| ხაზზე ({count}) | On line ({count}) | На линии ({count}) | recordCount.online | Record count display format |
| ნაჩვენებია {from}-{to} {total}-დან | Showing {from}-{to} of {total} | Показано {from}-{to} из {total} | recordCount.showing | Showing X of Y format |
| პაციენტები: {count} | Patients: {count} | Пациенты: {count} | recordCount.patients | Patient count label |

---

## Accessibility Translations

### Screen Reader Labels

| Georgian (ka) | English (en) | Russian (ru) | Key | Notes |
|--------------|-------------|-------------|-----|-------|
| პირველადი ნავიგაცია | Main navigation | Главная навигация | aria.mainNavigation | Main menu aria-label |
| პაციენტის ისტორიის ნავიგაცია | Patient history navigation | Навигация истории пациента | aria.patientHistoryNav | Sub-menu aria-label |
| პაციენტების ძებნა | Search patients | Поиск пациентов | aria.searchPatients | Search form aria-label |
| ჩემი პაციენტები | My patients | Мои пациенты | aria.myPatientsTable | Table aria-label |
| პაციენტის ჩანაწერი | Patient record | Запись пациента | aria.patientRecord | Row aria-label |
| სორტირება ზრდადობით | Sort ascending | Сортировка по возрастанию | aria.sortAscending | Sort state |
| სორტირება კლებადობით | Sort descending | Сортировка по убыванию | aria.sortDescending | Sort state |

---

## Date & Time Formats

### Date Format Patterns

| Georgian (ka) | English (en) | Russian (ru) | Key | Notes |
|--------------|-------------|-------------|-----|-------|
| დღე | Day | День | dateFormat.day | Day label |
| თვე | Month | Месяц | dateFormat.month | Month label |
| წელი | Year | Год | dateFormat.year | Year label |
| DD-MM-YYYY | DD-MM-YYYY | DD-MM-YYYY | dateFormat.pattern | Default date pattern |

### Month Names (If Needed)

| Georgian (ka) | English (en) | Russian (ru) | Key | Notes |
|--------------|-------------|-------------|-----|-------|
| იანვარი | January | Январь | months.january | Month 1 |
| თებერვალი | February | Февраль | months.february | Month 2 |
| მარტი | March | Март | months.march | Month 3 |
| აპრილი | April | Апрель | months.april | Month 4 |
| მაისი | May | Май | months.may | Month 5 |
| ივნისი | June | Июнь | months.june | Month 6 |
| ივლისი | July | Июль | months.july | Month 7 |
| აგვისტო | August | Август | months.august | Month 8 |
| სექტემბერი | September | Сентябрь | months.september | Month 9 |
| ოქტომბერი | October | Октябрь | months.october | Month 10 |
| ნოემბერი | November | Ноябрь | months.november | Month 11 |
| დეკემბერი | December | Декабрь | months.december | Month 12 |

---

## Sort Indicators

### Sort Direction Labels

| Georgian (ka) | English (en) | Russian (ru) | Key | Notes |
|--------------|-------------|-------------|-----|-------|
| სორტირება | Sort | Сортировка | sort.label | Sort action label |
| ზრდადობით | Ascending | По возрастанию | sort.ascending | A-Z, 0-9, old-new |
| კლებადობით | Descending | По убыванию | sort.descending | Z-A, 9-0, new-old |
| სორტირების გაუქმება | Clear sort | Очистить сортировку | sort.clear | Reset to default |

---

## Help & Documentation

### Help Text

| Georgian (ka) | English (en) | Russian (ru) | Key | Notes |
|--------------|-------------|-------------|-----|-------|
| დახმარება | Help | Помощь | help.label | Help link/button |
| ინსტრუქცია | Instructions | Инструкция | help.instructions | User guide |
| ხშირად დასმული კითხვები | FAQ | Часто задаваемые вопросы | help.faq | FAQ link |
| საკონტაქტო ინფორმაცია | Contact Information | Контактная информация | help.contact | Support contact |

---

## JSON Translation Files

### Georgian (ka.json)

```json
{
  "menu": {
    "registration": "რეგისტრაცია",
    "patientHistory": "პაციენტის ისტორია",
    "nomenclature": "ნომენკლატურა",
    "administration": "ადმინისტრირება",
    "forms": "ფორმები",
    "reports": "ანგარიშები"
  },
  "patientHistory": {
    "history": "ისტორია",
    "myPatients": "ჩემი პაციენტები",
    "surrogacy": "სუროგაცია",
    "invoices": "ინვოისები",
    "records100": "100 რეკორდი",
    "schedule": "განრიგი",
    "messenger": "მესანჯერი",
    "laboratory": "ლაბორატორია",
    "duty": "მორიგეობა",
    "appointments": "დანიშნულება",
    "inpatient": "სტაციონარი",
    "nutrition": "კვება",
    "moh": "MOH"
  },
  "filters": {
    "treatingDoctor": "მკურნალი ექიმი",
    "department": "განყოფილება",
    "transferred": "გადწერილება",
    "registrationNumber": "ისხ #",
    "defaultOption": "-",
    "selectDoctor": "აირჩიეთ ექიმი",
    "selectDepartment": "აირჩიეთ განყოფილება",
    "enterNumber": "შეიყვანეთ ნომერი"
  },
  "table": {
    "columns": {
      "portalNumber": "პორად #",
      "bed": "საწოლი",
      "lastName": "გვარი",
      "gender": "სქესი",
      "dateOfBirth": "დაბ. თარიღი",
      "phone": "ტელეფონი",
      "regNumber": "რეგ.#"
    }
  },
  "gender": {
    "male": "მამრობითი",
    "female": "მდედრობითი"
  },
  "actions": {
    "search": "ძებნა",
    "clear": "გაწმენდა",
    "export": "ექსპორტი",
    "print": "ბეჭდვა",
    "refresh": "განახლება",
    "view": "ნახვა",
    "edit": "რედაქტირება",
    "delete": "წაშლა"
  },
  "messages": {
    "noDataFound": "მონაცემები არ მოიძებნა",
    "loading": "იტვირთება...",
    "pleaseWait": "გთხოვთ დაელოდოთ",
    "modifyFilters": "შეცვალეთ ფილტრები და სცადეთ ხელახლა",
    "error": "შეცდომა მოხდა",
    "searchSuccess": "ძებნა წარმატებულია"
  },
  "recordCount": {
    "online": "ხაზზე ({count})",
    "showing": "ნაჩვენებია {from}-{to} {total}-დან"
  }
}
```

### English (en.json)

```json
{
  "menu": {
    "registration": "Registration",
    "patientHistory": "Patient History",
    "nomenclature": "Nomenclature",
    "administration": "Administration",
    "forms": "Forms",
    "reports": "Reports"
  },
  "patientHistory": {
    "history": "History",
    "myPatients": "My Patients",
    "surrogacy": "Surrogacy",
    "invoices": "Invoices",
    "records100": "100 Records",
    "schedule": "Schedule",
    "messenger": "Messenger",
    "laboratory": "Laboratory",
    "duty": "Duty",
    "appointments": "Appointments",
    "inpatient": "Inpatient",
    "nutrition": "Nutrition",
    "moh": "MOH"
  },
  "filters": {
    "treatingDoctor": "Treating Doctor",
    "department": "Department",
    "transferred": "Transferred",
    "registrationNumber": "Reg #",
    "defaultOption": "-",
    "selectDoctor": "Select Doctor",
    "selectDepartment": "Select Department",
    "enterNumber": "Enter Number"
  },
  "table": {
    "columns": {
      "portalNumber": "Portal #",
      "bed": "Bed",
      "lastName": "Last Name",
      "gender": "Gender",
      "dateOfBirth": "Date of Birth",
      "phone": "Phone",
      "regNumber": "Reg #"
    }
  },
  "gender": {
    "male": "Male",
    "female": "Female"
  },
  "actions": {
    "search": "Search",
    "clear": "Clear",
    "export": "Export",
    "print": "Print",
    "refresh": "Refresh",
    "view": "View",
    "edit": "Edit",
    "delete": "Delete"
  },
  "messages": {
    "noDataFound": "No data found",
    "loading": "Loading...",
    "pleaseWait": "Please wait",
    "modifyFilters": "Modify filters and try again",
    "error": "An error occurred",
    "searchSuccess": "Search successful"
  },
  "recordCount": {
    "online": "Online ({count})",
    "showing": "Showing {from}-{to} of {total}"
  }
}
```

### Russian (ru.json)

```json
{
  "menu": {
    "registration": "Регистрация",
    "patientHistory": "История пациента",
    "nomenclature": "Номенклатура",
    "administration": "Администрирование",
    "forms": "Формы",
    "reports": "Отчеты"
  },
  "patientHistory": {
    "history": "История",
    "myPatients": "Мои пациенты",
    "surrogacy": "Суррогатное материнство",
    "invoices": "Счета",
    "records100": "100 записей",
    "schedule": "Расписание",
    "messenger": "Мессенджер",
    "laboratory": "Лаборатория",
    "duty": "Дежурство",
    "appointments": "Назначения",
    "inpatient": "Стационар",
    "nutrition": "Питание",
    "moh": "МЗ"
  },
  "filters": {
    "treatingDoctor": "Лечащий врач",
    "department": "Отделение",
    "transferred": "Переведенный",
    "registrationNumber": "Рег. №",
    "defaultOption": "-",
    "selectDoctor": "Выберите врача",
    "selectDepartment": "Выберите отделение",
    "enterNumber": "Введите номер"
  },
  "table": {
    "columns": {
      "portalNumber": "Портал №",
      "bed": "Койка",
      "lastName": "Фамилия",
      "gender": "Пол",
      "dateOfBirth": "Дата рождения",
      "phone": "Телефон",
      "regNumber": "Рег. №"
    }
  },
  "gender": {
    "male": "Мужской",
    "female": "Женский"
  },
  "actions": {
    "search": "Поиск",
    "clear": "Очистить",
    "export": "Экспорт",
    "print": "Печать",
    "refresh": "Обновить",
    "view": "Просмотр",
    "edit": "Редактировать",
    "delete": "Удалить"
  },
  "messages": {
    "noDataFound": "Данные не найдены",
    "loading": "Загрузка...",
    "pleaseWait": "Пожалуйста, подождите",
    "modifyFilters": "Измените фильтры и попробуйте снова",
    "error": "Произошла ошибка",
    "searchSuccess": "Поиск выполнен успешно"
  },
  "recordCount": {
    "online": "На линии ({count})",
    "showing": "Показано {from}-{to} из {total}"
  }
}
```

---

## Implementation Notes

### Translation Key Naming Convention
- Use dot notation: `category.subcategory.key`
- Use camelCase for multi-word keys
- Keep keys descriptive but concise
- Group related translations together

### Pluralization Support
Some translations may need plural forms:

**Georgian**:
- 1 patient: "1 პაციენტი"
- 2-4 patients: "2 პაციენტი"
- 5+ patients: "5 პაციენტი"

**English**:
- 1 patient: "1 patient"
- 2+ patients: "2 patients"

**Russian**:
- 1 patient: "1 пациент"
- 2-4 patients: "2 пациента"
- 5+ patients: "5 пациентов"

### Interpolation
Use placeholders for dynamic values:
- `{count}` for numbers
- `{name}` for names
- `{from}`, `{to}`, `{total}` for ranges

### RTL Support
Not needed for Georgian, English, or Russian (all LTR languages).

### Font Recommendations
- **Georgian**: BPG Arial, Sylfaen, Noto Sans Georgian
- **English**: System fonts, Arial, Helvetica
- **Russian**: System fonts, Arial, Helvetica

Ensure all fonts support full Georgian Unicode range (U+10A0-U+10FF).

---

## Corrections for New Medplum Implementation ✅

### UI Label Fixes
Based on verified information, the following corrections should be made in the new system:

| Old Label (Georgian) | Old Translation | New Label (Georgian) | New Translation | Reason |
|---------------------|----------------|---------------------|----------------|--------|
| საწოლი (Column 2) | Bed | სახელი | First Name | Column actually displays first names, not bed numbers |
| გადწერილება (Filter 3) | Transferred | გაუწერელი | Not Discharged | Filter shows patients not yet discharged, not transferred patients |

**Implementation Notes**:
- Update `table.columns.bed` → `table.columns.firstName` with new translations
- Update `filters.transferred` → `filters.notDischarged` with new translations
- These corrections will improve user experience and eliminate confusion

---

## Missing Translations (Needs Verification)

### Items That Need Live Extraction
1. Doctor names in dropdown (will be dynamic from database)
2. Department names in dropdown (may vary by hospital)
3. Specific error messages from server responses
4. User menu items (top-right corner, not visible in screenshot)
5. Additional column headers if present off-screen
6. Action button labels if present
7. Pagination text if present

### Recommended Additional Translations
1. Empty state variations for different scenarios
2. Success messages for CRUD operations
3. Validation error messages
4. Confirmation dialog text
5. Keyboard shortcut hints
6. Accessibility labels for all interactive elements
