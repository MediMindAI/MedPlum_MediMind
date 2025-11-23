// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import {
  Box,
  Stack,
  Group,
  Button,
  Text,
  Alert,
  Modal,
  Badge,
} from '@mantine/core';
import { useForm as useMantineForm } from '@mantine/form';
import { useForm as useReactHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useVirtualizer } from '@tanstack/react-virtual';
import { IconCheck, IconDeviceFloppy, IconAlertCircle, IconCloudUpload, IconRestore, IconTrash } from '@tabler/icons-react';
import type { Questionnaire, QuestionnaireItem, Patient, Encounter } from '@medplum/fhirtypes';
import type { FormRendererConfig, SignatureData } from '../../types/form-renderer';
import type { PatientEncounterData } from '../../types/patient-binding';
import { populateQuestionnaire, validateFormValues } from '../../services/formRendererService';
import { generateSchema } from '../../services/formValidationService';
// Note: evaluateEnableWhen and getFieldsToClear are used by ConditionalLogic component
import { createCompletionTimeExtension } from '../../services/formAnalyticsService';
import { useTranslation } from '../../hooks/useTranslation';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useDraftRecovery } from '../../hooks/useDraftRecovery';
import { FormField } from './FormField';
import { ConditionalLogic } from './ConditionalLogic';
import { FormLoadingSkeleton } from '../common/FormLoadingSkeleton';

/**
 * Threshold for enabling virtual scrolling
 * Forms with more items than this will use virtualization
 */
const VIRTUAL_SCROLL_THRESHOLD = 50;

/**
 * Extract initial values from FHIR Questionnaire items
 * Reads the `initial` property from each item and returns a map of linkId -> value
 */
function extractQuestionnaireInitialValues(questionnaire: Questionnaire): Record<string, unknown> {
  const values: Record<string, unknown> = {};

  const processItem = (item: QuestionnaireItem): void => {
    if (item.initial && item.initial.length > 0) {
      const initialValue = item.initial[0];
      // Extract value based on type
      if (initialValue.valueString !== undefined) {
        values[item.linkId] = initialValue.valueString;
      } else if (initialValue.valueInteger !== undefined) {
        values[item.linkId] = initialValue.valueInteger;
      } else if (initialValue.valueDecimal !== undefined) {
        values[item.linkId] = initialValue.valueDecimal;
      } else if (initialValue.valueBoolean !== undefined) {
        values[item.linkId] = initialValue.valueBoolean;
      } else if (initialValue.valueDate !== undefined) {
        values[item.linkId] = initialValue.valueDate;
      } else if (initialValue.valueDateTime !== undefined) {
        values[item.linkId] = initialValue.valueDateTime;
      } else if (initialValue.valueTime !== undefined) {
        values[item.linkId] = initialValue.valueTime;
      } else if (initialValue.valueCoding !== undefined) {
        values[item.linkId] = initialValue.valueCoding.code;
      }
    }

    // Process nested items
    if (item.item) {
      item.item.forEach(processItem);
    }
  };

  questionnaire.item?.forEach(processItem);
  return values;
}

/**
 * FormRenderer Props
 */
export interface FormRendererProps {
  /** FHIR Questionnaire resource */
  questionnaire: Questionnaire;
  /** Optional patient for auto-population */
  patient?: Patient;
  /** Optional encounter for auto-population */
  encounter?: Encounter;
  /** Pre-populated values (will be merged with patient data) */
  initialValues?: Record<string, any>;
  /** Form mode */
  mode?: FormRendererConfig['mode'];
  /** Enable patient data binding */
  enablePatientBinding?: boolean;
  /** Show auto-populated field indicators */
  showBindingIndicators?: boolean;
  /** Called when form is submitted */
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  /** Called when form values change */
  onChange?: (values: Record<string, any>) => void;
  /** Called when save draft is requested */
  onSaveDraft?: (values: Record<string, any>) => void | Promise<void>;
  /** Called when signature is captured */
  onSignatureCapture?: (signature: SignatureData) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Submitting state */
  isSubmitting?: boolean;
  /** Custom submit button text */
  submitButtonText?: string;
  /** Custom save draft button text */
  saveDraftButtonText?: string;
  /** Hide action buttons */
  hideButtons?: boolean;
  /** Enable Zod validation (React Hook Form) */
  useZodValidation?: boolean;
  /** Current user reference for signatures */
  currentUserRef?: string;
  /** Patient ID for signature context */
  patientId?: string;
  /** Enable virtual scrolling for large forms (auto-enabled for 50+ fields) */
  enableVirtualScrolling?: boolean;
  /** Estimated row height for virtual scrolling (default: 80) */
  estimatedRowHeight?: number;
  /** Unique form instance ID for auto-save (required for auto-save) */
  formId?: string;
  /** Enable auto-save feature (default: false) */
  enableAutoSave?: boolean;
  /** Auto-save interval in milliseconds (default: 5000) */
  autoSaveIntervalMs?: number;
  /** Background sync interval in milliseconds (default: 30000) */
  syncIntervalMs?: number;
  /** Encounter ID for auto-save context */
  encounterId?: string;
  /** Called when auto-save completes */
  onAutoSave?: (draft: any) => void;
  /** Called when draft is recovered */
  onDraftRecover?: (draft: any) => void;
  /** Show browser close warning when form has unsaved changes */
  warnOnClose?: boolean;
}

/**
 * FormRenderer Component
 *
 * Renders a FHIR Questionnaire with automatic patient data population.
 *
 * Features:
 * - Renders all FHIR Questionnaire item types
 * - Auto-populates fields from Patient and Encounter resources
 * - Supports calculated fields (age, fullName)
 * - Real-time validation
 * - Draft saving support
 * - Mobile-responsive design
 *
 * @example
 * ```tsx
 * <FormRenderer
 *   questionnaire={questionnaire}
 *   patient={patient}
 *   encounter={encounter}
 *   enablePatientBinding={true}
 *   onSubmit={handleSubmit}
 *   onSaveDraft={handleSaveDraft}
 * />
 * ```
 */
export function FormRenderer({
  questionnaire,
  patient,
  encounter,
  initialValues = {},
  mode = 'fill',
  enablePatientBinding = true,
  showBindingIndicators = true,
  onSubmit,
  onChange,
  onSaveDraft,
  onSignatureCapture,
  isLoading = false,
  isSubmitting = false,
  submitButtonText,
  saveDraftButtonText,
  hideButtons = false,
  useZodValidation = false,
  currentUserRef,
  patientId,
  enableVirtualScrolling,
  estimatedRowHeight = 80,
  formId,
  enableAutoSave = false,
  autoSaveIntervalMs = 5000,
  syncIntervalMs = 30000,
  encounterId,
  onAutoSave,
  onDraftRecover,
  warnOnClose = true,
}: FormRendererProps): React.ReactElement {
  const { t } = useTranslation();
  const [autoPopulatedFields, setAutoPopulatedFields] = useState<Set<string>>(new Set());
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [signatures, setSignatures] = useState<Record<string, SignatureData>>({});
  const [hiddenFields, setHiddenFields] = useState<Set<string>>(new Set());
  const prevHiddenFieldsRef = useRef<Set<string>>(new Set());
  const parentRef = useRef<HTMLDivElement>(null);
  const [errorAnnouncement, setErrorAnnouncement] = useState<string>('');
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  // Track form start time for analytics
  const formStartTimeRef = useRef<number>(Date.now());

  // Determine if virtual scrolling should be used
  const itemCount = questionnaire.item?.length ?? 0;
  const useVirtualScroll = enableVirtualScrolling ?? itemCount > VIRTUAL_SCROLL_THRESHOLD;

  // Virtual scrolling setup for large forms
  const rowVirtualizer = useVirtualizer({
    count: itemCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedRowHeight,
    overscan: 5,
    enabled: useVirtualScroll,
  });

  // Generate stable formId for auto-save if not provided
  const effectiveFormId = formId || (questionnaire.id ? `form-${questionnaire.id}-${Date.now()}` : '');
  const questionnaireId = questionnaire.id || '';

  // Auto-save hook (only enabled when formId is available)
  const autoSave = useAutoSave({
    formId: effectiveFormId,
    questionnaireId,
    data: formValues,
    enabled: enableAutoSave && !!effectiveFormId && mode === 'fill',
    intervalMs: autoSaveIntervalMs,
    syncIntervalMs,
    patientId,
    encounterId,
    onSave: onAutoSave,
    onError: (error) => console.warn('Auto-save failed:', error),
  });

  // Draft recovery hook
  const draftRecovery = useDraftRecovery({
    formId: effectiveFormId,
    questionnaireId,
    patientId,
    autoCheck: enableAutoSave && !!effectiveFormId,
    onRecover: (draft) => {
      // Apply recovered values to form
      Object.entries(draft.values).forEach(([key, value]) => {
        form.setFieldValue(key, value);
      });
      setFormValues(draft.values);
      onDraftRecover?.(draft);
    },
  });

  // Browser close warning - warn when there are unsaved changes
  useEffect(() => {
    if (!warnOnClose || !enableAutoSave) {
      return;
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (autoSave.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; // Chrome requires this
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [warnOnClose, enableAutoSave, autoSave.hasUnsavedChanges]);

  // Build patient/encounter data for binding
  const patientData: PatientEncounterData = useMemo(
    () => ({ patient, encounter }),
    [patient, encounter]
  );

  // Get initial values from FHIR Questionnaire items (item.initial)
  const questionnaireInitialValues = useMemo(() => {
    return extractQuestionnaireInitialValues(questionnaire);
  }, [questionnaire]);

  // Get auto-populated values from patient/encounter data
  const populatedValues = useMemo(() => {
    if (!enablePatientBinding) {
      return {};
    }
    return populateQuestionnaire(questionnaire, patientData);
  }, [questionnaire, patientData, enablePatientBinding]);

  // Merge initial values with populated values
  // Priority: initialValues (prop) > populatedValues (patient) > questionnaireInitialValues (FHIR item.initial)
  const mergedInitialValues = useMemo(() => {
    const merged = { ...questionnaireInitialValues, ...populatedValues, ...initialValues };
    return merged;
  }, [questionnaireInitialValues, populatedValues, initialValues]);

  // Generate Zod schema for validation
  const zodSchema = useMemo(() => {
    if (useZodValidation) {
      return generateSchema(questionnaire);
    }
    return undefined;
  }, [questionnaire, useZodValidation]);

  // Initialize Mantine form (fallback/basic)
  const mantineForm = useMantineForm({
    initialValues: mergedInitialValues,
  });

  // Initialize React Hook Form with Zod validation
  const rhfMethods = useReactHookForm({
    defaultValues: mergedInitialValues,
    resolver: zodSchema ? zodResolver(zodSchema) : undefined,
  });

  // Use appropriate form based on configuration
  const form = useZodValidation ? {
    values: rhfMethods.watch(),
    setFieldValue: (field: string, value: any) => rhfMethods.setValue(field, value),
    onSubmit: (handler: (values: Record<string, any>) => void) => rhfMethods.handleSubmit(handler),
  } : mantineForm;

  // Track which fields were auto-populated
  useEffect(() => {
    const populated = new Set<string>(Object.keys(populatedValues));
    setAutoPopulatedFields(populated);
  }, [populatedValues]);

  // Update form when patient/encounter changes
  useEffect(() => {
    if (enablePatientBinding) {
      // Only update fields that are still at their auto-populated values
      Object.entries(populatedValues).forEach(([key, value]) => {
        const currentValue = form.values[key];
        // Update if field is empty or still has the old auto-populated value
        if (currentValue === undefined || currentValue === null || currentValue === '') {
          form.setFieldValue(key, value);
        }
      });
    }
  }, [populatedValues, enablePatientBinding]);

  // Handle value changes
  const handleChange = useCallback(
    (fieldId: string, value: any) => {
      form.setFieldValue(fieldId, value);
      const updatedValues = { ...form.values, [fieldId]: value };
      setFormValues(updatedValues);
      onChange?.(updatedValues);
    },
    [form, onChange]
  );

  // Sync form values with formValues state on initial load
  useEffect(() => {
    setFormValues(form.values);
  }, [form.values]);

  // Handle signature capture
  const handleSignatureCapture = useCallback(
    (signature: SignatureData) => {
      setSignatures((prev) => ({
        ...prev,
        [signature.fieldId]: signature,
      }));
      form.setFieldValue(signature.fieldId, signature);
      onSignatureCapture?.(signature);
    },
    [form, onSignatureCapture]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (values: Record<string, any>) => {
      // If using Zod validation, React Hook Form handles validation
      if (!useZodValidation) {
        // Validate with built-in validation
        const validation = validateFormValues(questionnaire, values);
        if (!validation.isValid) {
          setValidationErrors(validation.errors);
          // Announce errors for screen readers
          const errorCount = Object.keys(validation.errors).length;
          setErrorAnnouncement(
            t('formUI.messages.validationErrors', { count: errorCount }) ||
              `${errorCount} validation error${errorCount === 1 ? '' : 's'}. Please review the form.`
          );
          return;
        }
      }

      setValidationErrors({});
      setErrorAnnouncement('');

      // Calculate completion time for analytics
      const completionTimeExtension = createCompletionTimeExtension(formStartTimeRef.current);

      // Include signatures and analytics in submitted values
      const valuesWithMetadata = {
        ...values,
        _signatures: signatures,
        _analytics: {
          completionTimeMs: completionTimeExtension.valueInteger,
          completionTimeExtension,
        },
      };

      await onSubmit?.(valuesWithMetadata);
    },
    [questionnaire, onSubmit, useZodValidation, signatures]
  );

  // Handle save draft
  const handleSaveDraft = useCallback(async () => {
    const valuesWithSignatures = {
      ...form.values,
      _signatures: signatures,
    };
    await onSaveDraft?.(valuesWithSignatures);
  }, [form.values, onSaveDraft, signatures]);

  // Handle visibility changes for conditional fields
  const handleVisibilityChange = useCallback(
    (linkId: string, isVisible: boolean) => {
      setHiddenFields((prev) => {
        const newSet = new Set(prev);
        if (isVisible) {
          newSet.delete(linkId);
        } else {
          newSet.add(linkId);
        }
        return newSet;
      });
    },
    []
  );

  // Clear hidden field values when they become hidden
  useEffect(() => {
    if (!questionnaire.item) {return;}

    // Find fields that just became hidden
    const newlyHidden = Array.from(hiddenFields).filter(
      (linkId) => !prevHiddenFieldsRef.current.has(linkId)
    );

    // Clear values for newly hidden fields
    newlyHidden.forEach((linkId) => {
      if (form.values[linkId] !== undefined && form.values[linkId] !== null) {
        form.setFieldValue(linkId, undefined);
      }
    });

    // Update ref for next comparison
    prevHiddenFieldsRef.current = new Set(hiddenFields);
  }, [hiddenFields, questionnaire.item, form]);

  // Render loading skeleton
  if (isLoading) {
    return <FormLoadingSkeleton fieldCount={5} showTitle showButtons />;
  }

  // Helper function to render a single field (memoized for performance)
  const renderField = (item: QuestionnaireItem, index: number): React.ReactElement => {
    // Check if item has enableWhen conditions
    const hasConditions = item.enableWhen && item.enableWhen.length > 0;

    const fieldContent = (
      <MemoizedFormField
        key={item.linkId}
        item={item}
        value={form.values[item.linkId]}
        onChange={(value) => handleChange(item.linkId, value)}
        error={validationErrors[item.linkId]?.[0] || (useZodValidation ? rhfMethods.formState.errors[item.linkId]?.message as string : undefined)}
        isAutoPopulated={showBindingIndicators && autoPopulatedFields.has(item.linkId)}
        readOnly={mode === 'view'}
        currentUserRef={currentUserRef}
        patientId={patientId}
        onSignatureCapture={handleSignatureCapture}
      />
    );

    // Wrap with ConditionalLogic if has conditions
    if (hasConditions) {
      return (
        <ConditionalLogic
          key={item.linkId}
          item={item}
          formValues={form.values}
          onVisibilityChange={handleVisibilityChange}
        >
          {fieldContent}
        </ConditionalLogic>
      );
    }

    // Return field without wrapper
    return fieldContent;
  };

  // Calculate total error count for ARIA announcement
  const totalErrorCount = Object.keys(validationErrors).length;

  // Render form
  return (
    <Box
      component="form"
      onSubmit={form.onSubmit(handleSubmit)}
      role="form"
      aria-label={questionnaire.title || 'Form'}
    >
      {/* ARIA Live Region for validation errors */}
      <div
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {errorAnnouncement}
      </div>

      <Stack gap="md">
        {/* Validation errors summary */}
        {totalErrorCount > 0 && (
          <Alert
            icon={<IconAlertCircle size={18} />}
            color="red"
            variant="light"
            role="alert"
            aria-live="assertive"
            radius="sm"
            styles={{
              root: {
                border: '1px solid var(--mantine-color-red-6)',
                backgroundColor: 'var(--mantine-color-red-0)',
              },
              message: {
                color: 'var(--emr-primary)',
                fontWeight: 500,
              },
            }}
          >
            {t('formUI.messages.validationErrors', { count: totalErrorCount }) ||
              `${totalErrorCount} validation error${totalErrorCount === 1 ? '' : 's'}. Please review the form below.`}
          </Alert>
        )}

        {/* Patient binding info */}
        {enablePatientBinding && patient && autoPopulatedFields.size > 0 && showBindingIndicators && (
          <Alert
            icon={<IconCheck size={18} />}
            color="teal"
            variant="light"
            radius="sm"
            styles={{
              root: {
                border: '1px solid var(--emr-secondary)',
                backgroundColor: 'var(--emr-light-accent)',
              },
              message: {
                color: 'var(--emr-primary)',
              },
            }}
          >
            {t('formUI.messages.autoPopulated') || `${autoPopulatedFields.size} field(s) auto-populated from patient data`}
          </Alert>
        )}

        {/* Auto-save status indicator */}
        {enableAutoSave && (
          <Group gap="sm" justify="flex-end">
            {autoSave.isSaving && (
              <Badge color="blue" variant="light" leftSection={<IconDeviceFloppy size={12} />}>
                {t('formUI.autoSave.saving') || 'Saving...'}
              </Badge>
            )}
            {autoSave.isSyncing && (
              <Badge color="cyan" variant="light" leftSection={<IconCloudUpload size={12} />}>
                {t('formUI.autoSave.syncing') || 'Syncing...'}
              </Badge>
            )}
            {autoSave.lastSaved && !autoSave.isSaving && (
              <Text size="xs" c="dimmed">
                {t('formUI.autoSave.lastSaved') || 'Last saved'}: {draftRecovery.formatLastSaved(autoSave.lastSaved)}
              </Text>
            )}
            {autoSave.hasUnsavedChanges && !autoSave.isSaving && (
              <Badge color="yellow" variant="light">
                {t('formUI.autoSave.unsavedChanges') || 'Unsaved changes'}
              </Badge>
            )}
          </Group>
        )}

        {/* Draft Recovery Modal */}
        <Modal
          opened={draftRecovery.showRecoveryModal}
          onClose={() => draftRecovery.setShowRecoveryModal(false)}
          title={t('formUI.draftRecovery.title') || 'Draft Found'}
          centered
        >
          <Stack gap="md">
            <Text>
              {t('formUI.draftRecovery.message') ||
                'A previous draft of this form was found. Would you like to recover your changes?'}
            </Text>
            {draftRecovery.draft && (
              <Text size="sm" c="dimmed">
                {t('formUI.draftRecovery.savedAt') || 'Saved'}: {draftRecovery.formatLastSaved(draftRecovery.draft.savedAt)}
              </Text>
            )}
            <Group justify="flex-end" gap="sm">
              <Button
                variant="outline"
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={() => draftRecovery.discardDraft()}
              >
                {t('formUI.draftRecovery.discard') || 'Discard'}
              </Button>
              <Button
                leftSection={<IconRestore size={16} />}
                onClick={() => draftRecovery.recoverDraft()}
              >
                {t('formUI.draftRecovery.recover') || 'Recover'}
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* Form fields - with or without virtual scrolling */}
        {useVirtualScroll ? (
          // Virtual scrolling for large forms (50+ fields)
          <Box
            ref={parentRef}
            style={{
              height: '600px',
              overflow: 'auto',
              contain: 'strict',
            }}
            role="region"
            aria-label="Form fields"
            tabIndex={0}
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const item = questionnaire.item?.[virtualRow.index];
                if (!item) return null;

                return (
                  <div
                    key={item.linkId}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                      padding: 'var(--mantine-spacing-xs) 0',
                    }}
                    data-index={virtualRow.index}
                  >
                    {renderField(item, virtualRow.index)}
                  </div>
                );
              })}
            </div>
          </Box>
        ) : (
          // Standard rendering for smaller forms - compact spacing like original EMR
          <Box
            role="group"
            aria-label="Form fields"
            style={{
              padding: '8px 0',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px 16px',
              alignItems: 'flex-start',
            }}
          >
            {questionnaire.item?.map((item, index) => {
              // Check if this is a section header (display type)
              const isSection = item.type === 'display';
              // Check if this is a checkbox/boolean field
              const isCheckbox = item.type === 'boolean';
              // Check if this is a checkbox-group (choice with repeats)
              const isCheckboxGroup = item.type === 'choice' && item.repeats === true;
              // Check if this is a textarea
              const isTextarea = item.type === 'text';

              // Full width items: sections, checkbox-groups, textareas
              const isFullWidth = isSection || isCheckboxGroup || isTextarea;

              return (
                <Box
                  key={item.linkId}
                  style={{
                    // Full-width items
                    width: isFullWidth ? '100%' : isCheckbox ? 'auto' : undefined,
                    // Non-full-width fields can flex
                    flex: isFullWidth || isCheckbox ? undefined : '1 1 300px',
                    maxWidth: isFullWidth ? '100%' : isCheckbox ? undefined : '500px',
                    minWidth: isCheckbox ? undefined : '200px',
                    // Add top margin for sections
                    marginTop: isSection ? '16px' : undefined,
                    paddingTop: isSection ? '8px' : undefined,
                    borderTop: isSection ? '2px solid var(--emr-secondary)' : undefined,
                    // Checkbox-group row styling
                    paddingBottom: isCheckboxGroup ? '4px' : undefined,
                  }}
                >
                  {renderField(item, index)}
                </Box>
              );
            })}
          </Box>
        )}

        {/* Action buttons */}
        {!hideButtons && mode === 'fill' && (
          <Box
            mt="xl"
            pt="lg"
            style={{
              borderTop: '1px solid var(--emr-border-color)',
            }}
          >
            <Group justify="flex-end" gap="md" role="group" aria-label="Form actions">
              {onSaveDraft && (
                <Button
                  variant="outline"
                  size="md"
                  leftSection={<IconDeviceFloppy size={18} />}
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  aria-label={saveDraftButtonText || t('formUI.buttons.saveDraft') || 'Save Draft'}
                  styles={{
                    root: {
                      borderColor: 'var(--emr-gray-800)',
                      color: 'var(--emr-primary)',
                      fontWeight: 500,
                      padding: '10px 20px',
                      height: '44px',
                      borderRadius: 'var(--emr-border-radius-sm)',
                      transition: 'var(--emr-transition-base)',
                      '&:hover:not(:disabled)': {
                        borderColor: 'var(--emr-secondary)',
                        backgroundColor: 'var(--emr-gray-50)',
                      },
                    },
                  }}
                >
                  {saveDraftButtonText || t('formUI.buttons.saveDraft') || 'Save Draft'}
                </Button>
              )}
              <Button
                type="submit"
                size="md"
                leftSection={<IconCheck size={18} />}
                loading={isSubmitting}
                aria-label={submitButtonText || t('formUI.buttons.submit') || 'Submit'}
                styles={{
                  root: {
                    backgroundColor: 'var(--emr-secondary)',
                    fontWeight: 600,
                    padding: '10px 28px',
                    height: '44px',
                    borderRadius: 'var(--emr-border-radius-sm)',
                    transition: 'var(--emr-transition-base)',
                    '&:hover:not(:disabled)': {
                      backgroundColor: 'var(--emr-primary)',
                    },
                  },
                }}
              >
                {submitButtonText || t('formUI.buttons.submit') || 'Submit'}
              </Button>
            </Group>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

/**
 * Memoized FormField component to prevent unnecessary re-renders
 */
const MemoizedFormField = memo(FormField, (prevProps, nextProps) => {
  // Custom comparison for performance - only re-render when these props change
  return (
    prevProps.item.linkId === nextProps.item.linkId &&
    prevProps.value === nextProps.value &&
    prevProps.error === nextProps.error &&
    prevProps.isAutoPopulated === nextProps.isAutoPopulated &&
    prevProps.readOnly === nextProps.readOnly
  );
});

export default FormRenderer;
