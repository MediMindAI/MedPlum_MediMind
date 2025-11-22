// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useCallback } from 'react';
import {
  Box,
  TextInput,
  Textarea,
  NumberInput,
  Checkbox,
  Select,
  Radio,
  Group,
  Text,
  Alert,
  Paper,
  Title,
  Stack,
  FileInput,
  Anchor,
} from '@mantine/core';
import { DateInput, TimeInput } from '@mantine/dates';
import { IconAlertCircle, IconUpload, IconSignature } from '@tabler/icons-react';
import type { QuestionnaireItem } from '@medplum/fhirtypes';
import type { BindingKey } from '../../types/patient-binding';
import { BINDING_CONFIGS } from '../../types/patient-binding';
import { SignatureField } from './SignatureField';
import type { SignatureData, SignatureIntent } from '../../types/form-renderer';

/**
 * Props for FormField component
 */
export interface FormFieldProps {
  /** FHIR QuestionnaireItem */
  item: QuestionnaireItem;
  /** Current field value */
  value: any;
  /** Called when field value changes */
  onChange: (value: any) => void;
  /** Error message */
  error?: string;
  /** Whether field was auto-populated from patient data */
  isAutoPopulated?: boolean;
  /** Whether field is read-only */
  readOnly?: boolean;
  /** Current user reference for signatures */
  currentUserRef?: string;
  /** Patient ID for signature context */
  patientId?: string;
  /** Signature intent (for signature fields) */
  signatureIntent?: SignatureIntent;
  /** Callback when signature is captured */
  onSignatureCapture?: (signature: SignatureData) => void;
}

/**
 * Supported field types
 */
export type SupportedFieldType =
  | 'text'
  | 'textarea'
  | 'integer'
  | 'decimal'
  | 'date'
  | 'dateTime'
  | 'time'
  | 'boolean'
  | 'choice'
  | 'open-choice'
  | 'attachment'
  | 'signature'
  | 'display'
  | 'group'
  | 'url'
  | 'string'; // FHIR uses 'string' which maps to 'text'

/**
 * FormField Component
 *
 * Renders a single form field based on FHIR QuestionnaireItem type.
 * Supports 15 field types with automatic styling and validation.
 *
 * Field Types Supported:
 * - text/string: Single-line text input
 * - textarea: Multi-line text input
 * - integer: Whole number input
 * - decimal: Decimal number input
 * - date: Date picker
 * - dateTime: Date and time picker
 * - time: Time picker
 * - boolean: Checkbox
 * - choice: Radio buttons or select dropdown
 * - open-choice: Select with custom input option
 * - attachment: File upload
 * - signature: Digital signature capture
 * - display: Read-only text display
 * - group: Section with nested fields
 * - url: URL input with link preview
 */
export function FormField({
  item,
  value,
  onChange,
  error,
  isAutoPopulated = false,
  readOnly = false,
  currentUserRef,
  patientId,
  signatureIntent = 'consent',
  onSignatureCapture,
}: FormFieldProps): JSX.Element {
  // Get binding info for indicator
  const bindingKey = item.extension?.find(
    (ext) => ext.url === 'http://medimind.ge/patient-binding'
  )?.valueString as BindingKey | undefined;

  const bindingConfig = bindingKey ? BINDING_CONFIGS[bindingKey] : undefined;

  // Common props for all inputs
  const commonProps = {
    label: item.text || item.linkId,
    required: item.required,
    error,
    disabled: readOnly || item.readOnly,
    description: isAutoPopulated && bindingConfig
      ? `Auto-populated from ${bindingConfig.label}`
      : undefined,
  };

  // Auto-populated field styling
  const autoPopulatedStyle = isAutoPopulated
    ? { borderLeft: '3px solid var(--emr-turquoise)', paddingLeft: '8px' }
    : undefined;

  // Map FHIR type to our renderer
  const fieldType = mapFhirType(item.type);

  // Render based on field type
  switch (fieldType) {
    case 'text':
    case 'string':
      return (
        <TextInput
          {...commonProps}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          size="md"
          styles={{
            input: { minHeight: '44px' },
            root: autoPopulatedStyle,
          }}
        />
      );

    case 'textarea':
      return (
        <Textarea
          {...commonProps}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          minRows={3}
          autosize
          size="md"
          styles={{
            root: autoPopulatedStyle,
          }}
        />
      );

    case 'integer':
      return (
        <NumberInput
          {...commonProps}
          value={value ?? ''}
          onChange={(val) => onChange(val === '' ? undefined : val)}
          allowDecimal={false}
          size="md"
          styles={{
            input: { minHeight: '44px' },
            root: autoPopulatedStyle,
          }}
        />
      );

    case 'decimal':
      return (
        <NumberInput
          {...commonProps}
          value={value ?? ''}
          onChange={(val) => onChange(val === '' ? undefined : val)}
          decimalScale={2}
          size="md"
          styles={{
            input: { minHeight: '44px' },
            root: autoPopulatedStyle,
          }}
        />
      );

    case 'date':
      return (
        <DateInput
          {...commonProps}
          value={value ? new Date(value) : null}
          onChange={(date) => onChange(date?.toISOString().split('T')[0])}
          size="md"
          styles={{
            input: { minHeight: '44px' },
            root: autoPopulatedStyle,
          }}
        />
      );

    case 'dateTime':
      return (
        <DateInput
          {...commonProps}
          value={value ? new Date(value) : null}
          onChange={(date) => onChange(date?.toISOString())}
          size="md"
          styles={{
            input: { minHeight: '44px' },
            root: autoPopulatedStyle,
          }}
        />
      );

    case 'time':
      return (
        <TimeInput
          {...commonProps}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          size="md"
          styles={{
            input: { minHeight: '44px' },
            root: autoPopulatedStyle,
          }}
        />
      );

    case 'boolean':
      return (
        <Checkbox
          label={item.text}
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          error={error}
          disabled={readOnly || item.readOnly}
          size="md"
          styles={{
            root: autoPopulatedStyle,
          }}
        />
      );

    case 'choice':
      return renderChoiceField(item, value, onChange, commonProps, autoPopulatedStyle, readOnly);

    case 'open-choice':
      return (
        <Select
          {...commonProps}
          value={value || ''}
          onChange={onChange}
          data={getOptionData(item)}
          searchable
          clearable
          size="md"
          styles={{
            input: { minHeight: '44px' },
            root: autoPopulatedStyle,
          }}
        />
      );

    case 'attachment':
      return (
        <FileInput
          {...commonProps}
          value={null}
          onChange={(file) => {
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const base64 = e.target?.result as string;
                onChange({
                  contentType: file.type,
                  data: base64.split(',')[1], // Remove data:... prefix
                  title: file.name,
                  size: file.size,
                });
              };
              reader.readAsDataURL(file);
            } else {
              onChange(undefined);
            }
          }}
          leftSection={<IconUpload size={16} />}
          placeholder={value?.title || 'Click to upload file'}
          accept="image/*,application/pdf,.doc,.docx"
          size="md"
          styles={{
            input: { minHeight: '44px' },
            root: autoPopulatedStyle,
          }}
        />
      );

    case 'signature':
      return (
        <SignatureField
          fieldId={item.linkId}
          fieldLabel={item.text || item.linkId}
          value={value}
          onChange={onChange}
          error={error}
          disabled={readOnly || item.readOnly}
          required={item.required}
          currentUserRef={currentUserRef}
          patientId={patientId}
          intent={signatureIntent}
          onCapture={onSignatureCapture}
        />
      );

    case 'display':
      return (
        <Box py="xs">
          <Text size="md" c="dimmed">
            {item.text}
          </Text>
        </Box>
      );

    case 'group':
      return (
        <Paper p="md" withBorder>
          <Stack gap="md">
            {item.text && <Title order={5}>{item.text}</Title>}
            {item.item?.map((nestedItem) => (
              <FormField
                key={nestedItem.linkId}
                item={nestedItem}
                value={value?.[nestedItem.linkId]}
                onChange={(newValue) =>
                  onChange({ ...value, [nestedItem.linkId]: newValue })
                }
                readOnly={readOnly}
                currentUserRef={currentUserRef}
                patientId={patientId}
              />
            ))}
          </Stack>
        </Paper>
      );

    case 'url':
      return (
        <Box>
          <TextInput
            {...commonProps}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com"
            size="md"
            styles={{
              input: { minHeight: '44px' },
              root: autoPopulatedStyle,
            }}
          />
          {value && isValidUrl(value) && (
            <Anchor href={value} target="_blank" rel="noopener noreferrer" size="sm" mt="xs">
              Open link
            </Anchor>
          )}
        </Box>
      );

    default:
      return (
        <Alert icon={<IconAlertCircle size={16} />} color="yellow">
          Unsupported field type: {item.type}
        </Alert>
      );
  }
}

/**
 * Render choice field as radio buttons or select dropdown
 */
function renderChoiceField(
  item: QuestionnaireItem,
  value: any,
  onChange: (value: any) => void,
  commonProps: any,
  autoPopulatedStyle: any,
  readOnly?: boolean
): JSX.Element {
  // Use radio buttons for 4 or fewer options
  const useRadio = item.answerOption && item.answerOption.length <= 4;

  if (useRadio) {
    return (
      <Radio.Group
        label={item.text}
        required={item.required}
        error={commonProps.error}
        value={value || ''}
        onChange={onChange}
      >
        <Stack gap="xs" mt="xs" style={autoPopulatedStyle}>
          {item.answerOption?.map((option) => (
            <Radio
              key={option.valueCoding?.code || option.valueString}
              value={option.valueCoding?.code || option.valueString || ''}
              label={option.valueCoding?.display || option.valueString}
              disabled={readOnly || item.readOnly}
              size="md"
            />
          ))}
        </Stack>
      </Radio.Group>
    );
  }

  return (
    <Select
      {...commonProps}
      value={value || ''}
      onChange={onChange}
      data={getOptionData(item)}
      size="md"
      styles={{
        input: { minHeight: '44px' },
        root: autoPopulatedStyle,
      }}
    />
  );
}

/**
 * Get option data for select/radio fields
 */
function getOptionData(item: QuestionnaireItem): { value: string; label: string }[] {
  return (
    item.answerOption?.map((option) => ({
      value: option.valueCoding?.code || option.valueString || '',
      label: option.valueCoding?.display || option.valueString || '',
    })) || []
  );
}

/**
 * Map FHIR QuestionnaireItem type to our field type
 */
function mapFhirType(type?: string): SupportedFieldType {
  if (!type) return 'text';

  const typeMap: Record<string, SupportedFieldType> = {
    'string': 'text',
    'text': 'textarea',
    'integer': 'integer',
    'decimal': 'decimal',
    'date': 'date',
    'dateTime': 'dateTime',
    'time': 'time',
    'boolean': 'boolean',
    'choice': 'choice',
    'open-choice': 'open-choice',
    'attachment': 'attachment',
    'display': 'display',
    'group': 'group',
    'url': 'url',
  };

  return typeMap[type] || 'text';
}

/**
 * Validate URL format
 */
function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

export default FormField;
