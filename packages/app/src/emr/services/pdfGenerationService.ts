// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Font } from '@react-pdf/renderer';
import type { Questionnaire, QuestionnaireResponse, Patient } from '@medplum/fhirtypes';

/**
 * @module pdfGenerationService
 * @description PDF Generation Service for creating printable form documents.
 *
 * Provides utilities for:
 * - Generating PDF documents from QuestionnaireResponse data
 * - Downloading PDFs with sanitized filenames
 * - Previewing PDFs in new browser tabs
 * - Formatting dates and patient information for PDF display
 * - Georgian language font support via Noto Sans Georgian
 *
 * ## Usage Example
 * ```typescript
 * import {
 *   registerFonts,
 *   generatePDFFilename,
 *   downloadPDF,
 * } from '@/emr/services/pdfGenerationService';
 *
 * // Register fonts (call once at app startup)
 * registerFonts();
 *
 * // Generate filename
 * const filename = generatePDFFilename(questionnaire, patient);
 * // Result: "Consent_Form_თენგიზი_ხოზვრია_2025-11-22.pdf"
 *
 * // Download PDF
 * downloadPDF(pdfBlob, filename);
 * ```
 *
 * ## Font Requirements
 * Georgian text support requires:
 * - NotoSansGeorgian-Regular.ttf
 * - NotoSansGeorgian-Bold.ttf
 *
 * Place fonts in: `public/fonts/`
 *
 * @see FormPDFDocument component for actual PDF rendering
 */

// Track font registration state
let fontsRegistered = false;

/**
 * Register Noto Sans Georgian fonts for PDF generation.
 * This should be called once before generating any PDF with Georgian text.
 */
export function registerFonts(): void {
  if (fontsRegistered) {
    return;
  }

  try {
    Font.register({
      family: 'NotoSansGeorgian',
      fonts: [
        {
          src: '/fonts/NotoSansGeorgian-Regular.ttf',
          fontWeight: 'normal',
        },
        {
          src: '/fonts/NotoSansGeorgian-Bold.ttf',
          fontWeight: 'bold',
        },
      ],
    });

    // Also register a fallback for Latin characters
    Font.register({
      family: 'Helvetica',
      fonts: [
        { src: 'Helvetica', fontWeight: 'normal' },
        { src: 'Helvetica-Bold', fontWeight: 'bold' },
      ],
    });

    fontsRegistered = true;
  } catch (error) {
    console.error('Failed to register fonts:', error);
  }
}

/**
 * Check if fonts have been registered
 */
export function areFontsRegistered(): boolean {
  return fontsRegistered;
}

/**
 * Reset font registration state (for testing)
 */
export function resetFontRegistration(): void {
  fontsRegistered = false;
}

/**
 * Generate a PDF filename from form data
 *
 * @param questionnaire - The Questionnaire resource
 * @param patient - Optional Patient resource
 * @returns Formatted filename: "{FormTitle}_{PatientName}_{Date}.pdf"
 */
export function generatePDFFilename(
  questionnaire: Questionnaire | null,
  patient?: Patient | null
): string {
  const formTitle = questionnaire?.title || 'Form';
  const patientName = getPatientDisplayName(patient);
  const date = formatDateForFilename(new Date());

  // Sanitize filename - remove/replace invalid characters
  const sanitizedTitle = sanitizeFilename(formTitle);
  const sanitizedName = sanitizeFilename(patientName);

  return `${sanitizedTitle}_${sanitizedName}_${date}.pdf`;
}

/**
 * Get patient display name for filename
 */
function getPatientDisplayName(patient?: Patient | null): string {
  if (!patient?.name?.[0]) {
    return 'Unknown';
  }

  const name = patient.name[0];
  const given = name.given?.join(' ') || '';
  const family = name.family || '';

  return [given, family].filter(Boolean).join(' ') || 'Unknown';
}

/**
 * Format date for filename (YYYY-MM-DD)
 */
function formatDateForFilename(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Sanitize string for use in filename
 */
function sanitizeFilename(str: string): string {
  return str
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .trim();
}

/**
 * Download a PDF blob as a file
 *
 * @param blob - The PDF blob to download
 * @param filename - The filename for the download
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Preview a PDF blob in a new browser tab
 *
 * @param blob - The PDF blob to preview
 * @returns The window object of the new tab, or null if blocked
 */
export function previewPDF(blob: Blob): Window | null {
  const url = URL.createObjectURL(blob);
  const newWindow = window.open(url, '_blank');

  // Clean up URL after a delay to allow the new tab to load
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 10000);

  return newWindow;
}

/**
 * Print the current page using browser print dialog
 */
export function printPage(): void {
  window.print();
}

/**
 * Format a date string for display in PDF
 */
export function formatDateForDisplay(dateString?: string): string {
  if (!dateString) {
    return '-';
  }

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Format a datetime string for display in PDF
 */
export function formatDateTimeForDisplay(dateString?: string): string {
  if (!dateString) {
    return '-';
  }

  try {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

/**
 * Extract patient personal ID from Patient resource
 */
export function getPatientPersonalId(patient?: Patient | null): string | null {
  if (!patient?.identifier) {
    return null;
  }

  const personalId = patient.identifier.find(
    (id) => id.system?.includes('personal-id')
  );

  return personalId?.value || null;
}

/**
 * PDF Theme Colors (matching EMR theme)
 * These are used in FormPDFDocument component
 */
export const PDF_THEME = {
  primary: '#1a365d',
  secondary: '#2b6cb0',
  accent: '#63b3ed',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  background: '#f9fafb',
  white: '#ffffff',
} as const;

/**
 * PDF Layout Constants
 */
export const PDF_LAYOUT = {
  pageSize: 'A4' as const,
  marginTop: 40,
  marginBottom: 40,
  marginLeft: 40,
  marginRight: 40,
  headerHeight: 60,
  footerHeight: 30,
} as const;
