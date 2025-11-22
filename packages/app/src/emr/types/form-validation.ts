// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { ZodType, ZodObject } from 'zod';
import type { FieldConfig } from './form-builder';

/**
 * Validation rule types supported by the form builder
 */
export type ValidationRule =
  | 'required'           // Field must have a value
  | 'email'              // Valid email format (RFC 5322)
  | 'personalId'         // Georgian personal ID (11 digits with Luhn checksum)
  | 'phone'              // E.164 phone number format
  | 'url'                // Valid URL
  | 'minLength'          // Minimum string length
  | 'maxLength'          // Maximum string length
  | 'min'                // Minimum numeric value
  | 'max'                // Maximum numeric value
  | 'pattern'            // Custom regex pattern
  | 'dateRange'          // Date within valid range
  | 'futureDate'         // Date must be in the future
  | 'pastDate'           // Date must be in the past
  | 'custom';            // Custom validation function

/**
 * Validation error structure
 */
export interface ValidationError {
  fieldId: string;
  fieldLabel: string;
  rule: ValidationRule;
  message: string;
  path?: string; // Nested field path
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Schema configuration for Zod schema generation
 */
export interface SchemaConfig {
  fields: FieldConfig[];
  customValidators?: Record<string, CustomValidator>;
  validationMode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched';
}

/**
 * Custom validation function
 */
export interface CustomValidator {
  name: string;
  validate: (value: any, context?: ValidationContext) => ValidationResult | Promise<ValidationResult>;
  message?: string;
  async?: boolean;
}

/**
 * Validation context for custom validators
 */
export interface ValidationContext {
  fieldId: string;
  fieldLabel: string;
  formData: Record<string, any>;
  patient?: any;
  encounter?: any;
}

/**
 * Field-level validation configuration
 */
export interface FieldValidationConfig {
  rules: ValidationRuleConfig[];
  messages?: ValidationMessages;
  dependencies?: string[]; // Other field IDs that affect this field's validation
}

/**
 * Individual validation rule configuration
 */
export interface ValidationRuleConfig {
  rule: ValidationRule;
  params?: any; // Parameters for the rule (e.g., min: 5, max: 100)
  message?: string; // Custom error message
  when?: WhenCondition; // Conditional validation
}

/**
 * Conditional validation configuration
 */
export interface WhenCondition {
  field: string; // Field ID to check
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'exists';
  value: any;
  then?: ValidationRuleConfig[]; // Rules to apply when condition is true
  otherwise?: ValidationRuleConfig[]; // Rules to apply when condition is false
}

/**
 * Custom validation messages
 */
export interface ValidationMessages {
  required?: string;
  email?: string;
  personalId?: string;
  phone?: string;
  minLength?: string;
  maxLength?: string;
  min?: string;
  max?: string;
  pattern?: string;
  dateRange?: string;
  custom?: string;
}

/**
 * Georgian personal ID validation configuration
 */
export interface PersonalIdValidationConfig {
  enableLuhnChecksum: boolean; // Whether to validate Luhn checksum
  allowTestIds: boolean; // Whether to allow test IDs like '01001011116'
}

/**
 * Date range validation configuration
 */
export interface DateRangeConfig {
  minDate?: Date | string;
  maxDate?: Date | string;
  maxAgeYears?: number; // Maximum age (e.g., 120 years)
  allowFuture?: boolean;
  allowPast?: boolean;
}

/**
 * Email validation configuration
 */
export interface EmailValidationConfig {
  allowDisposable?: boolean; // Allow disposable email providers
  requireTLD?: boolean; // Require top-level domain
  domains?: string[]; // Allowed domains (whitelist)
}

/**
 * Phone validation configuration
 */
export interface PhoneValidationConfig {
  format: 'E164' | 'national' | 'international';
  allowedCountries?: string[]; // ISO country codes
  defaultCountry?: string; // Default country for national format
}

/**
 * Async validation state
 */
export interface AsyncValidationState {
  isValidating: boolean;
  pendingFields: Set<string>;
  errors: Record<string, ValidationError[]>;
}

/**
 * Validation trigger configuration
 */
export interface ValidationTriggerConfig {
  onChange?: boolean;
  onBlur?: boolean;
  onSubmit?: boolean;
  onTouched?: boolean;
  debounceMs?: number; // Debounce delay for onChange validation
}

/**
 * Validation summary
 */
export interface ValidationSummary {
  isValid: boolean;
  totalErrors: number;
  errorsByField: Record<string, ValidationError[]>;
  firstErrorField?: string;
  invalidFields: string[];
}

/**
 * Form validation state
 */
export interface FormValidationState {
  schema?: ZodObject<any>;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  isValidating: boolean;
  isValid: boolean;
  isDirty: boolean;
  summary?: ValidationSummary;
}

/**
 * Validator function type
 */
export type ValidatorFunction = (
  value: any,
  config?: any,
  context?: ValidationContext
) => ValidationResult | Promise<ValidationResult>;

/**
 * Built-in validators registry
 */
export interface ValidatorsRegistry {
  required: ValidatorFunction;
  email: ValidatorFunction;
  personalId: ValidatorFunction;
  phone: ValidatorFunction;
  url: ValidatorFunction;
  minLength: ValidatorFunction;
  maxLength: ValidatorFunction;
  min: ValidatorFunction;
  max: ValidatorFunction;
  pattern: ValidatorFunction;
  dateRange: ValidatorFunction;
  futureDate: ValidatorFunction;
  pastDate: ValidatorFunction;
}
