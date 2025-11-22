// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useCallback } from 'react';
import { Button, Group, Modal, Loader, Stack, Text, Alert } from '@mantine/core';
import { IconFileDownload, IconEye, IconAlertCircle } from '@tabler/icons-react';
import { pdf } from '@react-pdf/renderer';
import type {
  Questionnaire,
  QuestionnaireResponse,
  Patient,
} from '@medplum/fhirtypes';
import { FormPDFDocument } from './FormPDFDocument';
import {
  generatePDFFilename,
  downloadPDF,
  previewPDF,
  registerFonts,
} from '../../services/pdfGenerationService';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Props for PDFGenerator component
 */
export interface PDFGeneratorProps {
  questionnaire: Questionnaire | null;
  response: QuestionnaireResponse;
  patient?: Patient | null;
  logoUrl?: string;
  organizationName?: string;
  showPreviewButton?: boolean;
  variant?: 'filled' | 'outline' | 'light' | 'subtle';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
}

/**
 * PDFGenerator Component
 *
 * React component wrapper for PDF generation functionality.
 * Features:
 * - Download button with loading state
 * - Optional preview modal
 * - Error handling with user feedback
 * - File naming: "{FormTitle}_{PatientName}_{Date}.pdf"
 *
 * Usage:
 * ```tsx
 * <PDFGenerator
 *   questionnaire={questionnaire}
 *   response={response}
 *   patient={patient}
 *   showPreviewButton={true}
 * />
 * ```
 */
export function PDFGenerator({
  questionnaire,
  response,
  patient,
  logoUrl,
  organizationName,
  showPreviewButton = false,
  variant = 'outline',
  size = 'sm',
  disabled = false,
}: PDFGeneratorProps): JSX.Element {
  const { t } = useTranslation();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  /**
   * Generate PDF document as blob
   */
  const generatePDFBlob = useCallback(async (): Promise<Blob> => {
    // Register fonts before generating
    registerFonts();

    const document = (
      <FormPDFDocument
        questionnaire={questionnaire}
        response={response}
        patient={patient}
        logoUrl={logoUrl}
        organizationName={organizationName}
      />
    );

    const blob = await pdf(document).toBlob();
    return blob;
  }, [questionnaire, response, patient, logoUrl, organizationName]);

  /**
   * Handle PDF download
   */
  const handleDownload = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const blob = await generatePDFBlob();
      const filename = generatePDFFilename(questionnaire, patient);
      downloadPDF(blob, filename);
    } catch (err) {
      console.error('PDF generation failed:', err);
      setError(
        t('formViewer.pdfGenerationError') ||
        'Failed to generate PDF. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  }, [generatePDFBlob, questionnaire, patient, t]);

  /**
   * Handle PDF preview in new tab
   */
  const handlePreviewNewTab = useCallback(async () => {
    setIsPreviewing(true);
    setError(null);

    try {
      const blob = await generatePDFBlob();
      const result = previewPDF(blob);

      if (!result) {
        setError(
          t('formViewer.popupBlockedError') ||
          'Popup blocked. Please allow popups for this site.'
        );
      }
    } catch (err) {
      console.error('PDF preview failed:', err);
      setError(
        t('formViewer.pdfPreviewError') ||
        'Failed to preview PDF. Please try again.'
      );
    } finally {
      setIsPreviewing(false);
    }
  }, [generatePDFBlob, t]);

  /**
   * Handle PDF preview in modal
   */
  const handlePreviewModal = useCallback(async () => {
    setIsPreviewing(true);
    setError(null);

    try {
      const blob = await generatePDFBlob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewModalOpen(true);
    } catch (err) {
      console.error('PDF preview failed:', err);
      setError(
        t('formViewer.pdfPreviewError') ||
        'Failed to preview PDF. Please try again.'
      );
    } finally {
      setIsPreviewing(false);
    }
  }, [generatePDFBlob, t]);

  /**
   * Close preview modal and cleanup
   */
  const handleClosePreview = useCallback(() => {
    setPreviewModalOpen(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  return (
    <>
      <Group gap="xs">
        {/* Download Button */}
        <Button
          variant={variant}
          size={size}
          leftSection={
            isGenerating ? (
              <Loader size={14} color="currentColor" />
            ) : (
              <IconFileDownload size={16} />
            )
          }
          onClick={handleDownload}
          disabled={disabled || isGenerating || isPreviewing}
          data-testid="pdf-download-button"
        >
          {isGenerating
            ? t('formViewer.generatingPdf') || 'Generating...'
            : t('formViewer.exportPdf') || 'Export PDF'}
        </Button>

        {/* Preview Button */}
        {showPreviewButton && (
          <Button
            variant="subtle"
            size={size}
            leftSection={
              isPreviewing ? (
                <Loader size={14} color="currentColor" />
              ) : (
                <IconEye size={16} />
              )
            }
            onClick={handlePreviewNewTab}
            disabled={disabled || isGenerating || isPreviewing}
            data-testid="pdf-preview-button"
          >
            {isPreviewing
              ? t('formViewer.loadingPreview') || 'Loading...'
              : t('formViewer.previewPdf') || 'Preview'}
          </Button>
        )}
      </Group>

      {/* Error Alert */}
      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          mt="sm"
          withCloseButton
          onClose={() => setError(null)}
          data-testid="pdf-error-alert"
        >
          {error}
        </Alert>
      )}

      {/* Preview Modal */}
      <Modal
        opened={previewModalOpen}
        onClose={handleClosePreview}
        title={questionnaire?.title || t('formViewer.pdfPreview') || 'PDF Preview'}
        size="xl"
        centered
      >
        <Stack>
          {previewUrl ? (
            <iframe
              src={previewUrl}
              style={{
                width: '100%',
                height: '70vh',
                border: '1px solid var(--emr-border-color)',
                borderRadius: '4px',
              }}
              title="PDF Preview"
              data-testid="pdf-preview-iframe"
            />
          ) : (
            <Text c="dimmed" ta="center">
              {t('formViewer.loadingPreview') || 'Loading preview...'}
            </Text>
          )}
          <Group justify="flex-end">
            <Button variant="subtle" onClick={handleClosePreview}>
              {t('common.close') || 'Close'}
            </Button>
            <Button
              leftSection={<IconFileDownload size={16} />}
              onClick={handleDownload}
              disabled={isGenerating}
            >
              {t('formViewer.exportPdf') || 'Export PDF'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

export default PDFGenerator;
