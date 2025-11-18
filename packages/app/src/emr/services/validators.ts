// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * Validation functions for EMR forms
 *
 * Includes validators for:
 * - Georgian Personal ID (11 digits)
 * - Email addresses (RFC 5322)
 * - Birthdates
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate Georgian Personal ID (11 digits)
 *
 * Format: XXXXXXXXXXX (11 digits)
 * Georgian personal IDs are 11-digit numbers without checksum validation
 *
 * Valid examples:
 * - 01011076709
 * - 26001014632
 * - 01001011116
 */
export function validateGeorgianPersonalId(id: string): ValidationResult {
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

  return { isValid: true };
}

/**
 * Validate email address (RFC 5322 simplified)
 *
 * Checks for basic email format: localpart@domain.tld
 */
export function validateEmail(email: string): ValidationResult {
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
 * Validate birthdate
 *
 * Checks:
 * - Not in the future
 * - Not more than 120 years ago
 */
export function validateBirthdate(birthdate: Date | string): ValidationResult {
  const date = typeof birthdate === 'string' ? new Date(birthdate) : birthdate;

  // Check if valid date
  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      error: 'Invalid date format',
    };
  }

  const now = new Date();
  const maxAge = 120;
  const minDate = new Date();
  minDate.setFullYear(now.getFullYear() - maxAge);

  // Check if in future
  if (date > now) {
    return {
      isValid: false,
      error: 'Birthdate cannot be in the future',
    };
  }

  // Check if too old
  if (date < minDate) {
    return {
      isValid: false,
      error: `Birthdate cannot be more than ${maxAge} years ago`,
    };
  }

  return { isValid: true };
}
