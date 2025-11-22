// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef, useState } from 'react';
import { Box, Text, Stack, Alert, Loader } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import type { Questionnaire } from '@medplum/fhirtypes';
import type { FieldConfig } from '../../types/form-builder';
import { toQuestionnaire } from '../../services/fhirHelpers';

// Declare LForms library types (standalone version)
declare global {
  interface Window {
    LForms?: {
      Util?: {
        addFormToPage: (questionnaire: unknown, container: HTMLElement, options?: unknown) => void;
        setFHIRVersion: (version: string) => void;
        _fhirVersionNum?: number;
      };
      FHIR?: {
        R4?: unknown;
      };
    };
  }
}

/**
 * Props for FormPreview component
 */
export interface FormPreviewProps {
  /** FHIR Questionnaire to preview */
  questionnaire?: Questionnaire;
  /** Form fields to convert to Questionnaire */
  fields?: FieldConfig[];
  /** Form title */
  title?: string;
  /** Form description */
  description?: string;
  /** Loading state */
  loading?: boolean;
}

/**
 * FormPreview Component
 *
 * Real-time preview of form using LHC-Forms library
 *
 * Features:
 * - Converts form configuration to FHIR Questionnaire
 * - Renders interactive preview with LForms
 * - Updates automatically when form changes
 * - Handles empty states and errors
 *
 * @example
 * ```typescript
 * <FormPreview
 *   fields={formFields}
 *   title="Patient Consent Form"
 *   description="Standard consent form"
 * />
 * ```
 */
export function FormPreview({
  questionnaire,
  fields,
  title,
  description,
  loading = false,
}: FormPreviewProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLFormsReady, setIsLFormsReady] = useState(false);

  // Load LForms library dynamically with proper sequencing
  useEffect(() => {
    // Check if LForms with FHIR R4 support is fully loaded
    const checkLFormsReady = (): boolean => {
      return typeof window !== 'undefined' &&
             window.LForms !== undefined &&
             window.LForms.Util !== undefined &&
             typeof window.LForms.Util.addFormToPage === 'function' &&
             window.LForms.FHIR !== undefined &&
             window.LForms.FHIR.R4 !== undefined;
    };

    // If already loaded, set FHIR version and we're good
    if (checkLFormsReady()) {
      try {
        window.LForms?.Util?.setFHIRVersion?.('R4');
      } catch {
        // Ignore if setFHIRVersion fails
      }
      setIsLFormsReady(true);
      return;
    }

    // Load a script and return a promise
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        // Check if script already exists
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = false; // Ensure sequential execution
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load: ${src}`));
        document.head.appendChild(script);
      });
    };

    // Load scripts in sequence
    const loadLForms = async (): Promise<void> => {
      try {
        // Step 1: Load base LForms library (using v29.0.0 which has standalone files)
        await loadScript('https://clinicaltables.nlm.nih.gov/lforms-versions/29.0.0/lforms.min.js');

        // Step 2: Wait for LForms to be defined
        await new Promise<void>((resolve) => {
          const check = setInterval(() => {
            if (window.LForms) {
              clearInterval(check);
              resolve();
            }
          }, 50);
        });

        // Step 3: Load FHIR R4 support (depends on LForms being defined)
        await loadScript('https://clinicaltables.nlm.nih.gov/lforms-versions/29.0.0/fhir/R4/lformsFHIR.min.js');

        // Step 4: Wait for FHIR R4 support to be fully available
        await new Promise<void>((resolve, reject) => {
          let attempts = 0;
          const check = setInterval(() => {
            attempts++;
            if (checkLFormsReady()) {
              clearInterval(check);
              resolve();
            } else if (attempts > 100) { // 5 seconds timeout
              clearInterval(check);
              reject(new Error('LForms FHIR R4 module failed to initialize'));
            }
          }, 50);
        });

        // Step 5: Set FHIR version to R4
        if (window.LForms?.Util?.setFHIRVersion) {
          window.LForms.Util.setFHIRVersion('R4');
        }

        setIsLFormsReady(true);
      } catch (err) {
        console.error('Error loading LForms:', err);
        setError(err instanceof Error ? err.message : 'Failed to load LForms library');
      }
    };

    loadLForms();
  }, []);

  // Render form when questionnaire or fields change
  useEffect(() => {
    if (!containerRef.current || !isLFormsReady || loading) {
      return;
    }

    try {
      // Clear previous content
      containerRef.current.innerHTML = '';
      setError(null);

      // Determine which Questionnaire to use
      let questionnaireToRender: Questionnaire | undefined;

      if (questionnaire) {
        questionnaireToRender = questionnaire;
      } else if (fields && fields.length > 0) {
        // Convert fields to Questionnaire
        questionnaireToRender = toQuestionnaire({
          title: title || 'Untitled Form',
          description,
          status: 'draft',
          fields,
        });
      }

      // Render with LForms if we have a questionnaire
      if (questionnaireToRender && window.LForms?.Util?.addFormToPage) {
        window.LForms.Util.addFormToPage(questionnaireToRender, containerRef.current, {
          prepopulate: false,
        });
      }
    } catch (err) {
      console.error('Error rendering form preview:', err);
      setError(err instanceof Error ? err.message : 'Failed to render form preview');
    }
  }, [questionnaire, fields, title, description, isLFormsReady, loading]);

  // Loading state
  if (loading) {
    return (
      <Stack align="center" justify="center" style={{ height: '100%', minHeight: '300px' }}>
        <Loader size="lg" />
        <Text size="sm" c="dimmed">
          Loading preview...
        </Text>
      </Stack>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert icon={<IconInfoCircle size={16} />} title="Preview Error" color="red">
        {error}
      </Alert>
    );
  }

  // LForms not ready state
  if (!isLFormsReady) {
    return (
      <Stack align="center" justify="center" style={{ height: '100%', minHeight: '300px' }}>
        <Loader size="lg" />
        <Text size="sm" c="dimmed">
          Initializing form renderer...
        </Text>
      </Stack>
    );
  }

  // Empty state
  if (!questionnaire && (!fields || fields.length === 0)) {
    return (
      <Stack align="center" justify="center" style={{ height: '100%', minHeight: '300px' }}>
        <IconInfoCircle size={48} color="var(--emr-gray-400)" />
        <Text size="lg" c="dimmed" ta="center">
          No fields to preview
        </Text>
        <Text size="sm" c="dimmed" ta="center">
          Add fields to the form to see a preview
        </Text>
      </Stack>
    );
  }

  return (
    <Box
      style={{
        height: '100%',
        overflowY: 'auto',
        padding: 'var(--mantine-spacing-md)',
      }}
    >
      {/* LForms will render here */}
      <div ref={containerRef} data-testid="lforms-container" />
    </Box>
  );
}
