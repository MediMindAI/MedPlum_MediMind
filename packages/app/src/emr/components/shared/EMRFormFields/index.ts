/**
 * EMRFormFields - Standardized Form Input Components
 *
 * A production-ready, consistent form component library for the MediMind EMR system.
 * All components follow the same visual design language with proper validation states,
 * accessibility, and mobile responsiveness.
 *
 * Usage:
 * ```tsx
 * import {
 *   EMRTextInput,
 *   EMRSelect,
 *   EMRDatePicker,
 *   EMRFormRow,
 *   EMRFormSection
 * } from '@/emr/components/shared/EMRFormFields';
 *
 * <EMRFormSection title="Personal Information" icon={IconUser} defaultOpen>
 *   <EMRFormRow>
 *     <EMRTextInput
 *       label="First Name"
 *       placeholder="Enter first name"
 *       required
 *       {...form.getInputProps('firstName')}
 *     />
 *     <EMRTextInput
 *       label="Last Name"
 *       placeholder="Enter last name"
 *       required
 *       {...form.getInputProps('lastName')}
 *     />
 *   </EMRFormRow>
 *   <EMRFormRow>
 *     <EMRSelect
 *       label="Gender"
 *       data={genderOptions}
 *       required
 *       {...form.getInputProps('gender')}
 *     />
 *     <EMRDatePicker
 *       label="Date of Birth"
 *       maxDate={new Date()}
 *       {...form.getInputProps('birthDate')}
 *     />
 *   </EMRFormRow>
 * </EMRFormSection>
 * ```
 */

// Types
export * from './EMRFieldTypes';

// CSS (must be imported once)
import './emr-fields.css';

// Core wrapper
export { EMRFieldWrapper } from './EMRFieldWrapper';

// Input components
export { EMRTextInput } from './EMRTextInput';
export { EMRSelect } from './EMRSelect';
export { EMRNumberInput } from './EMRNumberInput';
export { EMRTextarea } from './EMRTextarea';

// Date picker - use custom Apple-inspired calendar from common
export { EMRDatePicker } from '../../common/EMRDatePicker';

// Toggle components
export { EMRCheckbox } from './EMRCheckbox';
export { EMRSwitch } from './EMRSwitch';
export { EMRRadioGroup } from './EMRRadioGroup';

// Layout components
export { EMRFormRow } from './EMRFormRow';
export { EMRFormSection } from './EMRFormSection';
export { EMRFormActions } from './EMRFormActions';

// Default exports for convenience
export { EMRTextInput as default } from './EMRTextInput';
