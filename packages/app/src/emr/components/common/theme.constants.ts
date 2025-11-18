// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * EMR Theme Constants
 *
 * Centralized theme definitions for consistent styling across all EMR components.
 * Based on the premium UI patterns from PatientHistoryDetailModal.
 */

// Section color schemes by number - using only official theme colors (PRIMARY BLUES ONLY)
export const SECTION_COLORS = {
  1: {
    gradient: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%)',
    color: '#1a365d',
    name: 'Navy Blue',
  },
  2: {
    gradient: 'linear-gradient(135deg, #2b6cb0 0%, #3182ce 100%)',
    color: '#2b6cb0',
    name: 'Vibrant Blue',
  },
  3: {
    gradient: 'linear-gradient(135deg, #3182ce 0%, #63b3ed 100%)',
    color: '#3182ce',
    name: 'Medium Blue',
  },
  4: {
    gradient: 'linear-gradient(135deg, #63b3ed 0%, #bee3f8 100%)',
    color: '#63b3ed',
    name: 'Light Blue',
  },
} as const;

// Primary color palette - OFFICIAL THEME COLORS ONLY (PRIMARY BLUES ONLY - NO TURQUOISE)
export const COLORS = {
  // Primary blues (from THEME_COLORS.md)
  primary: {
    900: '#1a365d', // Deep navy - emr-primary
    700: '#2b6cb0', // Vibrant blue - emr-secondary
    600: '#3182ce', // Medium-light blue - gradient transition
    400: '#63b3ed', // Light blue - emr-accent
    200: '#bee3f8', // Very light blue - emr-light-accent
  },
  // Neutrals (from THEME_COLORS.md)
  gray: {
    50: '#f9fafb', // Lightest gray - emr-gray-50
    100: '#f3f4f6', // Very light gray - emr-gray-100
    200: '#e5e7eb', // Light gray (borders) - emr-gray-200
    300: '#d1d5db', // Medium-light gray - emr-gray-300
    400: '#9ca3af', // Medium gray - emr-gray-400
    500: '#6b7280', // Medium-dark gray - emr-gray-500
    600: '#4b5563', // Dark gray - emr-gray-600
    700: '#374151', // Darker gray - emr-gray-700
    800: '#1f2937', // Very dark gray - emr-gray-800
    900: '#111827', // Almost black - emr-gray-900
  },
  // Special colors (from THEME_COLORS.md)
  sectionHeader: '#f8f9fa', // Section header backgrounds
  searchHighlight: '#c6efce', // Search match highlight (light green)
  topNavBg: '#e9ecef', // TopNavBar background
  // Text colors
  white: '#ffffff',
  textPrimary: '#1f2937', // emr-text-primary (gray-800)
  textSecondary: '#6b7280', // emr-text-secondary (gray-500)
  textInverse: '#ffffff', // emr-text-inverse
} as const;

// Gradient presets - PRIMARY BLUES ONLY (NO TURQUOISE)
export const GRADIENTS = {
  // Primary Blue Gradient (emr-gradient-primary)
  primary: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%)',
  // Secondary Blue Gradient (emr-gradient-secondary)
  secondary: 'linear-gradient(135deg, #2b6cb0 0%, #3182ce 50%, #63b3ed 100%)',
  // Light Blue Gradient
  light: 'linear-gradient(135deg, #3182ce 0%, #63b3ed 50%, #bee3f8 100%)',
  // Header gradient (primary blue)
  header: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%)',
} as const;

// Common input styles
export const INPUT_STYLES = {
  input: {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    '&:focus': {
      borderColor: '#63b3ed',
      boxShadow: '0 0 0 3px rgba(99, 179, 237, 0.2)',
    },
  },
  label: {
    fontWeight: 600,
    color: '#374151',
    marginBottom: '6px',
  },
} as const;

// Shadow presets
export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  button: '0 4px 6px -1px rgba(26, 54, 93, 0.3)',
  buttonHover: '0 6px 10px -1px rgba(26, 54, 93, 0.4)',
} as const;

// Focus shadow for form fields
export const FOCUS_SHADOW = '0 0 0 3px rgba(99, 179, 237, 0.2)';

// Common border radius values
export const BORDER_RADIUS = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const;

// Spacing presets
export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
} as const;

// Transition presets
export const TRANSITIONS = {
  fast: 'all 0.15s ease',
  normal: 'all 0.2s ease',
  slow: 'all 0.3s ease',
} as const;

// Helper function to get section color
export function getSectionColor(sectionNumber: 1 | 2 | 3 | 4) {
  return SECTION_COLORS[sectionNumber];
}

// Helper function to get gradient by type
export function getGradient(type: keyof typeof GRADIENTS) {
  return GRADIENTS[type];
}
