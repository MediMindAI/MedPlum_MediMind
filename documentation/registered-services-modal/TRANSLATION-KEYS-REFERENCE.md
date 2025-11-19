# Registered Services Modal - Translation Keys Reference

**Added**: 2025-11-19  
**Location**: `packages/app/src/emr/translations/{ka,en,ru}.json`  
**Total Keys**: 154 translation keys across 3 languages

## Summary

All translation keys for the Registered Services Modal have been added to the EMR translation system. The translations cover all 4 tabs (Financial, Salary, Medical, Attributes) with comprehensive support for Georgian, English, and Russian.

## Key Count by Section

| Section | Keys |
|---------|------|
| Modal (title, close) | 2 |
| Tabs (4 tab names) | 4 |
| **Financial Tab** | 31 |
| **Salary Tab** | 41 |
| **Medical Tab** | 38 |
| **Attributes Tab** | 38 |
| **TOTAL** | **154** |

## Usage Example

```typescript
import { useTranslation } from '@/emr/hooks/useTranslation';

function RegisteredServicesModal() {
  const { t } = useTranslation();

  return (
    <Modal
      title={t('registeredServices.modal.title')}
      onClose={() => console.log('close')}
    >
      <Tabs>
        <Tabs.Tab value="financial" label={t('registeredServices.tabs.financial')}>
          {/* Financial Tab Content */}
        </Tabs.Tab>
        <Tabs.Tab value="salary" label={t('registeredServices.tabs.salary')}>
          {/* Salary Tab Content */}
        </Tabs.Tab>
        <Tabs.Tab value="medical" label={t('registeredServices.tabs.medical')}>
          {/* Medical Tab Content */}
        </Tabs.Tab>
        <Tabs.Tab value="attributes" label={t('registeredServices.tabs.attributes')}>
          {/* Attributes Tab Content */}
        </Tabs.Tab>
      </Tabs>
    </Modal>
  );
}
```

## Translation Key Structure

### Modal Keys
```typescript
registeredServices.modal.title        // "რეგისტრირებული სერვისები" / "Registered Services"
registeredServices.modal.close        // "დახურვა" / "Close"
```

### Tab Names
```typescript
registeredServices.tabs.financial     // "ფინანსური" / "Financial"
registeredServices.tabs.salary        // "სახელფასო" / "Salary"
registeredServices.tabs.medical       // "სამედიცინო" / "Medical"
registeredServices.tabs.attributes    // "ატრიბუტები" / "Attributes"
```

### Financial Tab (31 keys)
```typescript
// Fields
registeredServices.financial.priceType
registeredServices.financial.currency
registeredServices.financial.date
registeredServices.financial.price

// Buttons
registeredServices.financial.addButton
registeredServices.financial.editButton
registeredServices.financial.deleteButton
registeredServices.financial.saveButton
registeredServices.financial.cancelButton

// Table Headers
registeredServices.financial.table.priceType
registeredServices.financial.table.date
registeredServices.financial.table.price
registeredServices.financial.table.currency
registeredServices.financial.table.actions

// Validation Messages
registeredServices.financial.validation.priceTypeRequired
registeredServices.financial.validation.currencyRequired
registeredServices.financial.validation.dateRequired
registeredServices.financial.validation.dateInvalid
registeredServices.financial.validation.priceRequired
registeredServices.financial.validation.pricePositive

// Success Messages
registeredServices.financial.success.added
registeredServices.financial.success.updated
registeredServices.financial.success.deleted

// Error Messages
registeredServices.financial.error.addFailed
registeredServices.financial.error.updateFailed
registeredServices.financial.error.deleteFailed
registeredServices.financial.error.fetchFailed

// Confirmation Dialog
registeredServices.financial.confirmDelete.title
registeredServices.financial.confirmDelete.message
registeredServices.financial.confirmDelete.confirm
registeredServices.financial.confirmDelete.cancel
```

### Salary Tab (41 keys)
```typescript
// Performers Section
registeredServices.salary.performers.title
registeredServices.salary.performers.name
registeredServices.salary.performers.type
registeredServices.salary.performers.percentage
registeredServices.salary.performers.checkbox
registeredServices.salary.performers.addButton
registeredServices.salary.performers.table.name
registeredServices.salary.performers.table.type
registeredServices.salary.performers.table.percentage
registeredServices.salary.performers.table.checkbox
registeredServices.salary.performers.table.actions

// Secondary Personnel Section
registeredServices.salary.secondaryPersonnel.title
registeredServices.salary.secondaryPersonnel.dropdown1
registeredServices.salary.secondaryPersonnel.dropdown2
registeredServices.salary.secondaryPersonnel.dropdown3
registeredServices.salary.secondaryPersonnel.addButton
registeredServices.salary.secondaryPersonnel.personnelSubtitle

// Other Salaries Section
registeredServices.salary.otherSalaries.title
registeredServices.salary.otherSalaries.input
registeredServices.salary.otherSalaries.addButton
registeredServices.salary.otherSalaries.itemsSubtitle

// Description Section
registeredServices.salary.description.title
registeredServices.salary.description.placeholder

// Validation
registeredServices.salary.validation.nameRequired
registeredServices.salary.validation.typeRequired
registeredServices.salary.validation.percentageRequired
registeredServices.salary.validation.percentageRange
registeredServices.salary.validation.otherSalaryRequired

// Success Messages
registeredServices.salary.success.performerAdded
registeredServices.salary.success.performerUpdated
registeredServices.salary.success.performerDeleted
registeredServices.salary.success.secondaryAdded
registeredServices.salary.success.otherSalaryAdded

// Error Messages
registeredServices.salary.error.addFailed
registeredServices.salary.error.updateFailed
registeredServices.salary.error.deleteFailed

// Confirmation Dialog
registeredServices.salary.confirmDelete.title
registeredServices.salary.confirmDelete.message
registeredServices.salary.confirmDelete.confirm
registeredServices.salary.confirmDelete.cancel
```

### Medical Tab (38 keys)
```typescript
// Samples Section
registeredServices.medical.samples.title
registeredServices.medical.samples.addButton
registeredServices.medical.samples.dropdown1
registeredServices.medical.samples.dropdown2
registeredServices.medical.samples.dropdown3
registeredServices.medical.samples.dropdown4
registeredServices.medical.samples.table.code
registeredServices.medical.samples.table.name
registeredServices.medical.samples.table.manipulation
registeredServices.medical.samples.table.biomaterial
registeredServices.medical.samples.table.quantity
registeredServices.medical.samples.table.actions

// Components Section
registeredServices.medical.components.title
registeredServices.medical.components.addButton
registeredServices.medical.components.dropdown
registeredServices.medical.components.table.container
registeredServices.medical.components.table.code
registeredServices.medical.components.table.name
registeredServices.medical.components.table.actions

// Other Parameters Section
registeredServices.medical.otherParameters.title
registeredServices.medical.otherParameters.orderCopying
registeredServices.medical.otherParameters.hideInResearch
registeredServices.medical.otherParameters.lisIntegration
registeredServices.medical.otherParameters.lisProvider
registeredServices.medical.otherParameters.nameInfo
registeredServices.medical.otherParameters.nameInfoPlaceholder

// Validation
registeredServices.medical.validation.sampleRequired
registeredServices.medical.validation.componentRequired
registeredServices.medical.validation.quantityPositive

// Success Messages
registeredServices.medical.success.sampleAdded
registeredServices.medical.success.sampleDeleted
registeredServices.medical.success.componentAdded
registeredServices.medical.success.componentDeleted
registeredServices.medical.success.saved

// Error Messages
registeredServices.medical.error.addFailed
registeredServices.medical.error.deleteFailed
registeredServices.medical.error.saveFailed
```

### Attributes Tab (38 keys)
```typescript
// Color Picker Section
registeredServices.attributes.colorPicker.label
registeredServices.attributes.colorPicker.category
registeredServices.attributes.colorPicker.hexLabel
registeredServices.attributes.colorPicker.hexPlaceholder

// Online Blocking Hours Section
registeredServices.attributes.onlineBlocking.title
registeredServices.attributes.onlineBlocking.startTime
registeredServices.attributes.onlineBlocking.endTime
registeredServices.attributes.onlineBlocking.addButton
registeredServices.attributes.onlineBlocking.table.startTime
registeredServices.attributes.onlineBlocking.table.endTime
registeredServices.attributes.onlineBlocking.table.actions

// Equipment/Consumables Section
registeredServices.attributes.equipment.title
registeredServices.attributes.equipment.name
registeredServices.attributes.equipment.quantity
registeredServices.attributes.equipment.addButton
registeredServices.attributes.equipment.table.name
registeredServices.attributes.equipment.table.quantity
registeredServices.attributes.equipment.table.actions

// Validation
registeredServices.attributes.validation.hexInvalid
registeredServices.attributes.validation.startTimeRequired
registeredServices.attributes.validation.endTimeRequired
registeredServices.attributes.validation.timeRangeInvalid
registeredServices.attributes.validation.equipmentRequired
registeredServices.attributes.validation.quantityPositive

// Success Messages
registeredServices.attributes.success.colorUpdated
registeredServices.attributes.success.timeRangeAdded
registeredServices.attributes.success.timeRangeDeleted
registeredServices.attributes.success.equipmentAdded
registeredServices.attributes.success.equipmentDeleted
registeredServices.attributes.success.saved

// Error Messages
registeredServices.attributes.error.updateFailed
registeredServices.attributes.error.addFailed
registeredServices.attributes.error.deleteFailed

// Actions
registeredServices.attributes.actions.add
registeredServices.attributes.actions.remove
registeredServices.attributes.actions.save
registeredServices.attributes.actions.cancel
```

## Translation Quality

- **Georgian (ka)**: Primary language - uses exact labels from original EMR documentation
- **English (en)**: Professional medical terminology appropriate for healthcare software
- **Russian (ru)**: Professional medical terminology appropriate for healthcare software

## Notes

1. All 154 keys are present in all 3 languages (ka, en, ru)
2. Keys follow existing naming conventions in the codebase
3. Validation messages are comprehensive and user-friendly
4. Success/error messages provide clear feedback
5. Table headers and field labels match the documentation screenshots
6. All JSON files are syntactically valid

## Next Steps

When implementing the Registered Services Modal components:

1. Import `useTranslation` hook: `import { useTranslation } from '@/emr/hooks/useTranslation';`
2. Use the hook: `const { t } = useTranslation();`
3. Reference keys: `t('registeredServices.financial.priceType')`
4. Display validation errors: `t('registeredServices.financial.validation.priceRequired')`
5. Show success notifications: `t('registeredServices.financial.success.added')`

## Files Modified

- `/packages/app/src/emr/translations/ka.json` - Georgian translations
- `/packages/app/src/emr/translations/en.json` - English translations
- `/packages/app/src/emr/translations/ru.json` - Russian translations
