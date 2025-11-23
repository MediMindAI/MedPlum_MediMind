// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { Questionnaire, QuestionnaireItem, Coding, Extension } from '@medplum/fhirtypes';

/**
 * Form template data that maps to FHIR Questionnaire resource
 */
export interface FormTemplate {
  id?: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'retired';
  version?: string;
  fields: FieldConfig[];
  createdDate?: string;
  lastModified?: string;
  createdBy?: string;
  category?: string[];
  resourceType?: 'Questionnaire';
  // Form-level styling for container and title
  formStyling?: FormStyling;
}

/**
 * Form-level styling configuration for exact visual matching
 */
export interface FormStyling {
  container?: {
    border?: string;
    borderRadius?: string;
    backgroundColor?: string;
    padding?: string;
    margin?: string;
  };
  title?: {
    textAlign?: 'left' | 'center' | 'right';
    fontWeight?: string;
    fontSize?: string;
    marginBottom?: string;
    color?: string;
  };
}

/**
 * Individual field configuration that maps to QuestionnaireItem
 */
export interface FieldConfig {
  id: string;
  linkId: string;
  type: FieldType;
  label: string;
  text?: string;
  required?: boolean;
  readOnly?: boolean;
  repeats?: boolean;

  // Default value (for pre-filled fields)
  defaultValue?: string | number | boolean;

  // Patient data binding
  patientBinding?: PatientBinding;

  // Validation
  validation?: ValidationConfig;

  // Styling
  styling?: FieldStyling;

  // Options for select/radio/checkbox
  options?: FieldOption[];

  // For checkbox-group: whether to include a text field at the end
  hasTextField?: boolean;

  // Conditional logic
  conditional?: ConditionalLogic;

  // Layout
  width?: string;
  order?: number;

  // Extensions
  extensions?: Extension[];
}

/**
 * Supported field types mapping to FHIR Questionnaire item types
 */
export type FieldType =
  | 'text'           // Short text input (string)
  | 'textarea'       // Long text input (text)
  | 'date'           // Date picker (date)
  | 'datetime'       // Date and time picker (dateTime)
  | 'time'           // Time picker (time)
  | 'integer'        // Integer number input (integer)
  | 'decimal'        // Decimal number input (decimal)
  | 'boolean'        // Checkbox (boolean)
  | 'choice'         // Single select dropdown (choice)
  | 'open-choice'    // Select with custom option (open-choice)
  | 'radio'          // Radio buttons (choice with radio display)
  | 'checkbox-group' // Multiple checkboxes (choice with checkbox display, repeats=true)
  | 'signature'      // Digital signature capture (attachment)
  | 'attachment'     // File upload (attachment)
  | 'display'        // Display text only (display)
  | 'group';         // Group of fields (group)

/**
 * Field option for select/radio/checkbox fields
 */
export interface FieldOption {
  value: string;
  label: string;
  labelEn?: string;
  coding?: Coding;
}

/**
 * Dropdown option (alias for FieldOption with English label)
 */
export type DropdownOption = FieldOption;

/**
 * Patient data binding configuration
 */
export interface PatientBinding {
  enabled: boolean;
  bindingKey: BindingKey;
  fhirPath?: string;
  isCalculated?: boolean;
  calculationType?: 'age' | 'fullName' | 'custom';
}

/**
 * Available patient data binding keys
 * Maps to Patient and Encounter FHIR resources
 */
export type BindingKey =
  | 'name'              // Patient.name (combined first + last)
  | 'firstName'         // Patient.name.given[0]
  | 'lastName'          // Patient.name.family
  | 'patronymic'        // Patient.name.extension[patronymic]
  | 'fullName'          // Calculated: firstName + patronymic + lastName
  | 'dob'               // Patient.birthDate
  | 'age'               // Calculated from Patient.birthDate
  | 'personalId'        // Patient.identifier (personal-id system)
  | 'gender'            // Patient.gender
  | 'phone'             // Patient.telecom (phone system)
  | 'email'             // Patient.telecom (email system)
  | 'address'           // Patient.address.text
  | 'workplace'         // Patient.extension[workplace]
  | 'admissionDate'     // Encounter.period.start
  | 'dischargeDate'     // Encounter.period.end
  | 'treatingPhysician' // Encounter.participant[].individual.display
  | 'registrationNumber'; // Encounter.identifier (registration-number system)

/**
 * Field validation configuration
 */
export interface ValidationConfig {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
  customValidator?: string;
}

/**
 * Field styling configuration
 */
export interface FieldStyling {
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  width?: string;
  height?: string;
  padding?: string;
  margin?: string;
  resizable?: boolean;  // For textareas - allow user to resize
  inputStyle?: 'underline' | 'bordered' | 'dropdown';  // Visual style of input
  display?: 'block' | 'inline' | 'inline-block';  // CSS display property for inline layouts
}

/**
 * Conditional logic for field visibility
 * Maps to QuestionnaireItem.enableWhen
 */
export interface ConditionalLogic {
  enabled: boolean;
  conditions: Condition[];
  operator?: 'any' | 'all'; // OR or AND logic
}

/**
 * Individual condition for conditional logic
 */
export interface Condition {
  questionId: string;
  operator: ConditionOperator;
  answer: any;
}

/**
 * Condition operators mapping to FHIR enableWhen operators
 */
export type ConditionOperator =
  | 'exists'      // Field has any value
  | '='           // Equal
  | '!='          // Not equal
  | '>'           // Greater than
  | '<'           // Less than
  | '>='          // Greater than or equal
  | '<='          // Less than or equal
  | 'contains';   // String contains (custom)

/**
 * Form builder state for undo/redo functionality
 */
export interface FormBuilderState {
  present: FormTemplate;
  past: FormTemplate[];
  future: FormTemplate[];
}

/**
 * Form builder action types
 */
export type FormBuilderAction =
  | { type: 'UPDATE_FORM'; payload: Partial<FormTemplate> }
  | { type: 'ADD_FIELD'; payload: FieldConfig }
  | { type: 'UPDATE_FIELD'; payload: { id: string; updates: Partial<FieldConfig> } }
  | { type: 'DELETE_FIELD'; payload: string }
  | { type: 'REORDER_FIELDS'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET'; payload: FormTemplate };
