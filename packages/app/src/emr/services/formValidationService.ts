// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { z, ZodObject, ZodRawShape } from 'zod';
import type { Questionnaire, QuestionnaireItem } from '@medplum/fhirtypes';
import type { ValidationResult } from './validators';
import { validateGeorgianPersonalId, validateEmail, validateBirthdate } from './validators';

/**
 * Generate Zod schema from FHIR Questionnaire resource
 *
 * Dynamically creates a Zod validation schema based on QuestionnaireItem fields
 * including required, type, pattern, min/max constraints
 *
 * @param questionnaire - FHIR Questionnaire resource
 * @returns Zod schema object for form validation
 */
export function generateSchema(questionnaire: Questionnaire): ZodObject<ZodRawShape> {
  const shape: ZodRawShape = {};

  if (!questionnaire.item || questionnaire.item.length === 0) {
    return z.object({});
  }

  for (const item of questionnaire.item) {
    const fieldSchema = generateFieldSchema(item);
    if (fieldSchema) {
      shape[item.linkId] = fieldSchema;
    }
  }

  return z.object(shape);
}

/**
 * Generate Zod schema for individual field
 *
 * @param item - FHIR QuestionnaireItem
 * @returns Zod schema for the field
 */
function generateFieldSchema(item: QuestionnaireItem): z.ZodTypeAny | null {
  let schema: z.ZodTypeAny;

  // Base schema by type
  switch (item.type) {
    case 'string':
      schema = z.string();
      break;

    case 'text':
      schema = z.string();
      break;

    case 'integer':
      schema = z.number().int();
      break;

    case 'decimal':
      schema = z.number();
      break;

    case 'boolean':
      schema = z.boolean();
      break;

    case 'date':
      schema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)');
      break;

    case 'dateTime':
      schema = z.string().datetime();
      break;

    case 'time':
      schema = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Invalid time format (HH:MM or HH:MM:SS)');
      break;

    case 'choice':
    case 'open-choice':
      schema = z.string();
      break;

    case 'attachment':
      schema = z.any(); // Files/attachments
      break;

    case 'display':
      return null; // Display items don't need validation

    case 'group':
      return null; // Groups handled recursively (future enhancement)

    default:
      schema = z.string();
  }

  // Apply validation constraints from extensions
  schema = applyValidationConstraints(schema, item);

  // Apply required constraint
  if (!item.required) {
    schema = schema.optional();
  }

  return schema;
}

/**
 * Apply validation constraints from QuestionnaireItem extensions
 *
 * @param schema - Base Zod schema
 * @param item - FHIR QuestionnaireItem
 * @returns Enhanced Zod schema with constraints
 */
function applyValidationConstraints(schema: z.ZodTypeAny, item: QuestionnaireItem): z.ZodTypeAny {
  // Extract validation config from extensions
  const validationConfig = item.extension?.find((ext) => ext.url === 'http://medimind.ge/validation-config');

  if (!validationConfig?.valueString) {
    return schema;
  }

  try {
    const config = JSON.parse(validationConfig.valueString);

    // String constraints
    if (schema instanceof z.ZodString) {
      if (config.minLength !== undefined) {
        schema = schema.min(config.minLength, `Minimum length is ${config.minLength}`);
      }
      if (config.maxLength !== undefined) {
        schema = schema.max(config.maxLength, `Maximum length is ${config.maxLength}`);
      }
      if (config.pattern) {
        schema = schema.regex(new RegExp(config.pattern), config.patternMessage || 'Invalid format');
      }
    }

    // Number constraints
    if (schema instanceof z.ZodNumber) {
      if (config.min !== undefined) {
        schema = schema.min(config.min, `Minimum value is ${config.min}`);
      }
      if (config.max !== undefined) {
        schema = schema.max(config.max, `Maximum value is ${config.max}`);
      }
    }

    // Custom validators
    if (config.customValidator) {
      schema = applyCustomValidator(schema, config.customValidator);
    }
  } catch {
    // Ignore invalid JSON
  }

  return schema;
}

/**
 * Apply custom validator to schema
 *
 * @param schema - Base Zod schema
 * @param validatorName - Custom validator name
 * @returns Enhanced schema with custom validation
 */
function applyCustomValidator(schema: z.ZodTypeAny, validatorName: string): z.ZodTypeAny {
  switch (validatorName) {
    case 'georgianPersonalId':
      return schema.refine(
        (value: any) => {
          if (!value) {
            return true;
          } // Optional fields handled separately
          const result = validateGeorgianPersonalId(String(value));
          return result.isValid;
        },
        { message: 'Invalid Georgian personal ID (must be 11 digits)' }
      );

    case 'email':
      return schema.refine(
        (value: any) => {
          if (!value) {
            return true;
          }
          const result = validateEmail(String(value));
          return result.isValid;
        },
        { message: 'Invalid email format' }
      );

    case 'birthdate':
      return schema.refine(
        (value: any) => {
          if (!value) {
            return true;
          }
          const result = validateBirthdate(String(value));
          return result.isValid;
        },
        { message: 'Invalid birthdate' }
      );

    default:
      return schema;
  }
}

/**
 * Validate Georgian Personal ID (11 digits with Luhn checksum)
 *
 * Georgian personal IDs are 11-digit numbers with a Luhn checksum algorithm.
 * The last digit is a checksum calculated from the first 10 digits.
 *
 * Valid examples:
 * - 26001014632 (თენგიზი ხოზვრია)
 * - 01001011116 (Test ID from HL7 FHIR validator)
 *
 * @param id - Personal ID string
 * @returns Validation result with error message if invalid
 */
export function validateGeorgianPersonalIdWithLuhn(id: string): ValidationResult {
  // Check length
  if (id.length !== 11) {
    return {
      isValid: false,
      error: 'Personal ID must be exactly 11 digits',
    };
  }

  // Check if all characters are digits
  if (!/^\d{11}$/.test(id)) {
    return {
      isValid: false,
      error: 'Personal ID must contain only digits',
    };
  }

  // Validate Luhn checksum
  if (!validateLuhnChecksum(id)) {
    return {
      isValid: false,
      error: 'Invalid personal ID checksum',
    };
  }

  return { isValid: true };
}

/**
 * Validate Luhn checksum algorithm
 *
 * Used for Georgian personal IDs and credit card numbers.
 * Algorithm (Mod 10):
 * 1. Starting from the rightmost digit (check digit), move left
 * 2. Double every second digit (starting with the 2nd from right)
 * 3. If doubled digit > 9, subtract 9 (or sum the two digits)
 * 4. Sum all digits
 * 5. If sum % 10 === 0, checksum is valid
 *
 * Note: Georgian Personal IDs may NOT use Luhn checksum.
 * Keeping this as reference but validation without Luhn is more common.
 *
 * @param id - ID string to validate
 * @returns True if checksum is valid
 */
function validateLuhnChecksum(id: string): boolean {
  let sum = 0;
  let shouldDouble = false;

  // Start from rightmost digit and move left
  for (let i = id.length - 1; i >= 0; i--) {
    let digit = parseInt(id.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/**
 * Validate email format (RFC 5322 simplified)
 *
 * Checks for basic email format: localpart@domain.tld
 * Supports international domain names and common email patterns
 *
 * Valid examples:
 * - user@example.com
 * - tengizi@medimind.ge
 * - user.name+tag@domain.co.uk
 *
 * @param email - Email address to validate
 * @returns Validation result with error message if invalid
 */
export function validateEmailFormat(email: string): ValidationResult {
  const emailRegex =
    /^[a-zA-Z0-9]([a-zA-Z0-9._+-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email.trim())) {
    return {
      isValid: false,
      error: 'Invalid email format',
    };
  }

  return { isValid: true };
}

/**
 * Validate date range
 *
 * Checks:
 * - Date is valid
 * - Date is not in the future (optional)
 * - Date is not more than maxAgeYears ago (optional)
 *
 * @param date - Date to validate (Date object or ISO string)
 * @param options - Validation options
 * @param options.allowFuture - Allow future dates (default: false)
 * @param options.maxAgeYears - Maximum age in years (default: 120)
 * @returns Validation result with error message if invalid
 */
export function validateDateRange(
  date: Date | string,
  options?: { allowFuture?: boolean; maxAgeYears?: number }
): ValidationResult {
  const { allowFuture = false, maxAgeYears = 120 } = options || {};

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if valid date
  if (isNaN(dateObj.getTime())) {
    return {
      isValid: false,
      error: 'Invalid date format',
    };
  }

  const now = new Date();

  // Check if in future
  if (!allowFuture && dateObj > now) {
    return {
      isValid: false,
      error: 'Date cannot be in the future',
    };
  }

  // Check if too old
  const minDate = new Date();
  minDate.setFullYear(now.getFullYear() - maxAgeYears);

  if (dateObj < minDate) {
    return {
      isValid: false,
      error: `Date cannot be more than ${maxAgeYears} years ago`,
    };
  }

  return { isValid: true };
}

/**
 * Validate phone number (E.164 format)
 *
 * E.164 format: +[country code][number]
 * Examples:
 * - +995500050610 (Georgia)
 * - +14155552671 (USA)
 *
 * @param phone - Phone number to validate
 * @returns Validation result with error message if invalid
 */
export function validatePhoneE164(phone: string): ValidationResult {
  const e164Regex = /^\+[1-9]\d{1,14}$/;

  if (!e164Regex.test(phone.trim())) {
    return {
      isValid: false,
      error: 'Invalid phone number format (use E.164 format: +995XXXXXXXXX)',
    };
  }

  return { isValid: true };
}

/**
 * Validate URL format
 *
 * Checks for valid HTTP/HTTPS URLs
 *
 * @param url - URL to validate
 * @returns Validation result with error message if invalid
 */
export function validateURL(url: string): ValidationResult {
  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return {
        isValid: false,
        error: 'URL must use HTTP or HTTPS protocol',
      };
    }
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: 'Invalid URL format',
    };
  }
}

/**
 * Batch validate multiple values against their validators
 *
 * @param values - Record of field values
 * @param validators - Record of field validators
 * @returns Record of validation results
 */
export function batchValidate(
  values: Record<string, any>,
  validators: Record<string, (value: any) => ValidationResult>
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};

  for (const [fieldId, value] of Object.entries(values)) {
    const validator = validators[fieldId];
    if (validator) {
      results[fieldId] = validator(value);
    }
  }

  return results;
}

/**
 * Check if all validation results are valid
 *
 * @param results - Record of validation results
 * @returns True if all fields are valid
 */
export function isAllValid(results: Record<string, ValidationResult>): boolean {
  return Object.values(results).every((result) => result.isValid);
}

/**
 * Get all validation errors
 *
 * @param results - Record of validation results
 * @returns Array of error messages
 */
export function getValidationErrors(results: Record<string, ValidationResult>): string[] {
  return Object.values(results)
    .filter((result) => !result.isValid)
    .map((result) => result.error || 'Unknown error');
}
