// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { ValidationResult } from '../types/account-management';

/**
 * Validate email address format (RFC 5322 simplified)
 *
 * This regex is a simplified version of RFC 5322 that covers most common email formats:
 * - Local part: alphanumeric, dots, underscores, hyphens, plus signs
 * - Domain: alphanumeric, dots, hyphens
 * - TLD: minimum 2 characters
 *
 * @param email - Email address to validate
 * @returns ValidationResult with isValid boolean and optional error message
 *
 * @example
 * validateEmail('tengizi@medimind.ge') // { isValid: true }
 * validateEmail('invalid@email') // { isValid: false, error: 'Invalid email format' }
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  // RFC 5322 simplified regex
  const emailRegex =
    /^[a-zA-Z0-9]([a-zA-Z0-9._+-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

  const trimmedEmail = email.trim();

  if (!emailRegex.test(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Invalid email format. Expected format: user@example.com',
    };
  }

  // Additional checks
  if (trimmedEmail.length > 254) {
    return {
      isValid: false,
      error: 'Email address too long (maximum 254 characters)',
    };
  }

  const [localPart, domain] = trimmedEmail.split('@');

  if (localPart.length > 64) {
    return {
      isValid: false,
      error: 'Email local part too long (maximum 64 characters before @)',
    };
  }

  if (domain.length > 253) {
    return {
      isValid: false,
      error: 'Email domain too long (maximum 253 characters after @)',
    };
  }

  return { isValid: true };
}

/**
 * Validate phone number format (E.164 international format)
 *
 * E.164 format: +[country code][subscriber number]
 * - Maximum 15 digits (including country code)
 * - Must start with '+'
 * - Georgia country code: +995
 *
 * @param phoneNumber - Phone number to validate
 * @param countryCode - Optional country code to enforce (e.g., '995' for Georgia)
 * @returns ValidationResult with isValid boolean and optional error message
 *
 * @example
 * validatePhone('+995500050610') // { isValid: true }
 * validatePhone('+995500050610', '995') // { isValid: true }
 * validatePhone('500050610') // { isValid: false, error: 'Phone must start with +' }
 */
export function validatePhone(phoneNumber: string, countryCode?: string): ValidationResult {
  if (!phoneNumber || phoneNumber.trim() === '') {
    // Phone is optional, so empty is valid
    return { isValid: true };
  }

  const trimmedPhone = phoneNumber.trim();

  // Must start with +
  if (!trimmedPhone.startsWith('+')) {
    return {
      isValid: false,
      error: 'Phone number must start with + (E.164 format)',
    };
  }

  // Extract digits only (remove +)
  const digits = trimmedPhone.slice(1);

  // Must contain only digits
  if (!/^\d+$/.test(digits)) {
    return {
      isValid: false,
      error: 'Phone number must contain only digits after +',
    };
  }

  // E.164 maximum length is 15 digits
  if (digits.length > 15) {
    return {
      isValid: false,
      error: 'Phone number too long (maximum 15 digits)',
    };
  }

  // Minimum length check (country code + number)
  if (digits.length < 7) {
    return {
      isValid: false,
      error: 'Phone number too short (minimum 7 digits)',
    };
  }

  // Optional country code enforcement
  if (countryCode && !digits.startsWith(countryCode)) {
    return {
      isValid: false,
      error: `Phone number must start with +${countryCode} (${getCountryName(countryCode)})`,
    };
  }

  return { isValid: true };
}

/**
 * Get country name from country code
 * Used for better error messages
 * @param countryCode
 */
function getCountryName(countryCode: string): string {
  const countries: Record<string, string> = {
    '995': 'Georgia',
    '1': 'USA/Canada',
    '44': 'UK',
    '7': 'Russia',
    '380': 'Ukraine',
    '374': 'Armenia',
    '994': 'Azerbaijan',
  };

  return countries[countryCode] || 'Unknown';
}

/**
 * Validate date format and constraints
 *
 * @param dateValue - ISO 8601 date string (YYYY-MM-DD) or Date object
 * @param allowFuture - Whether to allow future dates (default: false)
 * @param maxYearsAgo - Maximum years in the past (default: 120)
 * @returns ValidationResult with isValid boolean and optional error message
 *
 * @example
 * validateDate('1986-01-26') // { isValid: true }
 * validateDate(new Date('1986-01-26')) // { isValid: true }
 * validateDate('2026-01-01', false) // { isValid: false, error: 'Future dates not allowed' }
 * validateDate('1850-01-01') // { isValid: false, error: 'Date too far in the past' }
 */
export function validateDate(
  dateValue: Date | string | null | undefined,
  allowFuture: boolean = false,
  maxYearsAgo: number = 120
): ValidationResult {
  // Handle null/undefined
  if (!dateValue) {
    // Date is optional
    return { isValid: true };
  }

  // Convert Date object to ISO string
  let dateString: string;
  if (dateValue instanceof Date) {
    // Check if valid Date object
    if (isNaN(dateValue.getTime())) {
      return {
        isValid: false,
        error: 'Invalid date object',
      };
    }
    // Convert to YYYY-MM-DD format (ISO 8601)
    dateString = dateValue.toISOString().split('T')[0];
  } else {
    dateString = dateValue;
  }

  // Handle empty string
  if (dateString.trim() === '') {
    // Date is optional
    return { isValid: true };
  }

  // ISO 8601 date format: YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(dateString)) {
    return {
      isValid: false,
      error: 'Invalid date format. Expected: YYYY-MM-DD (e.g., 1986-01-26)',
    };
  }

  // Parse date components manually to catch invalid dates
  const [year, month, day] = dateString.split('-').map(Number);

  // Create date using components
  const date = new Date(year, month - 1, day);

  // Check if date is valid (e.g., not February 30)
  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      error: 'Invalid date. Please check day/month combination.',
    };
  }

  // Check if date components match (JavaScript auto-corrects invalid dates)
  // Example: Feb 30 becomes Mar 2, so we check if month/day changed
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return {
      isValid: false,
      error: 'Invalid date. Please check day/month combination.',
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day

  const inputDate = new Date(dateString);
  inputDate.setHours(0, 0, 0, 0);

  // Check if future date
  if (!allowFuture && inputDate > today) {
    return {
      isValid: false,
      error: 'Future dates are not allowed',
    };
  }

  // Check if too far in the past
  const maxPastDate = new Date(today);
  maxPastDate.setFullYear(today.getFullYear() - maxYearsAgo);

  if (inputDate < maxPastDate) {
    return {
      isValid: false,
      error: `Date cannot be more than ${maxYearsAgo} years ago`,
    };
  }

  return { isValid: true };
}

/**
 * Validate birth date
 * Special case of date validation for birth dates
 *
 * @param birthDate - ISO 8601 date string (YYYY-MM-DD)
 * @returns ValidationResult with isValid boolean and optional error message
 */
export function validateBirthDate(birthDate: string): ValidationResult {
  return validateDate(birthDate, false, 120);
}

/**
 * Validate hire date
 * Special case of date validation for employment hire dates
 *
 * @param hireDate - ISO 8601 date string (YYYY-MM-DD)
 * @returns ValidationResult with isValid boolean and optional error message
 */
export function validateHireDate(hireDate: string): ValidationResult {
  // Allow dates up to 50 years ago (reasonable employment history)
  return validateDate(hireDate, true, 50);
}

/**
 * Validate required text field
 *
 * @param value - Text value to validate
 * @param fieldName - Name of field for error message
 * @param minLength - Minimum length (default: 1)
 * @param maxLength - Maximum length (default: 255)
 * @returns ValidationResult with isValid boolean and optional error message
 */
export function validateRequired(
  value: string | undefined,
  fieldName: string,
  minLength: number = 1,
  maxLength: number = 255
): ValidationResult {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  const trimmedValue = value.trim();

  if (trimmedValue.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} character${minLength === 1 ? '' : 's'}`,
    };
  }

  if (trimmedValue.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must not exceed ${maxLength} characters`,
    };
  }

  return { isValid: true };
}

/**
 * Validate staff ID format
 * Currently accepts any non-empty alphanumeric string
 * Can be customized to enforce specific formats (e.g., STAFF-YYYY-NNN)
 *
 * @param staffId - Staff ID to validate
 * @returns ValidationResult with isValid boolean and optional error message
 */
export function validateStaffId(staffId: string): ValidationResult {
  if (!staffId || staffId.trim() === '') {
    // Staff ID is optional
    return { isValid: true };
  }

  const trimmedId = staffId.trim();

  // Allow alphanumeric, hyphens, underscores
  const staffIdRegex = /^[a-zA-Z0-9_-]+$/;

  if (!staffIdRegex.test(trimmedId)) {
    return {
      isValid: false,
      error: 'Staff ID must contain only letters, numbers, hyphens, and underscores',
    };
  }

  if (trimmedId.length < 3) {
    return {
      isValid: false,
      error: 'Staff ID must be at least 3 characters',
    };
  }

  if (trimmedId.length > 50) {
    return {
      isValid: false,
      error: 'Staff ID must not exceed 50 characters',
    };
  }

  return { isValid: true };
}

/**
 * Validate account form values
 * Comprehensive validation for entire account form
 *
 * @param values - AccountFormValues to validate
 * @param values.firstName
 * @param values.lastName
 * @param values.email
 * @param values.phoneNumber
 * @param values.birthDate
 * @param values.hireDate
 * @param values.staffId
 * @returns Map of field names to validation errors
 */
export function validateAccountForm(values: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  birthDate?: string;
  hireDate?: string;
  staffId?: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  // Required fields
  const firstNameResult = validateRequired(values.firstName, 'First name', 2, 100);
  if (!firstNameResult.isValid) {
    errors.firstName = firstNameResult.error!;
  }

  const lastNameResult = validateRequired(values.lastName, 'Last name', 2, 100);
  if (!lastNameResult.isValid) {
    errors.lastName = lastNameResult.error!;
  }

  const emailResult = validateEmail(values.email || '');
  if (!emailResult.isValid) {
    errors.email = emailResult.error!;
  }

  // Optional fields
  if (values.phoneNumber) {
    const phoneResult = validatePhone(values.phoneNumber, '995'); // Georgia
    if (!phoneResult.isValid) {
      errors.phoneNumber = phoneResult.error!;
    }
  }

  if (values.birthDate) {
    const birthDateResult = validateBirthDate(values.birthDate);
    if (!birthDateResult.isValid) {
      errors.birthDate = birthDateResult.error!;
    }
  }

  if (values.hireDate) {
    const hireDateResult = validateHireDate(values.hireDate);
    if (!hireDateResult.isValid) {
      errors.hireDate = hireDateResult.error!;
    }
  }

  if (values.staffId) {
    const staffIdResult = validateStaffId(values.staffId);
    if (!staffIdResult.isValid) {
      errors.staffId = staffIdResult.error!;
    }
  }

  return errors;
}
