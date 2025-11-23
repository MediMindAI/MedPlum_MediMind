// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import {
  Box,
  TextInput,
  Textarea,
  NumberInput,
  Checkbox,
  Select,
  Radio,
  Text,
  Alert,
  Title,
  Stack,
  FileInput,
  Anchor,
} from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { EMRDatePicker } from '../common/EMRDatePicker';
import { IconAlertCircle, IconUpload } from '@tabler/icons-react';
import type { QuestionnaireItem } from '@medplum/fhirtypes';
import type { BindingKey } from '../../types/patient-binding';
import { BINDING_CONFIGS } from '../../types/patient-binding';
import { SignatureField } from './SignatureField';
import type { SignatureData, SignatureIntent } from '../../types/form-renderer';

/**
 * Document-style input styling - underline only, official medical form look
 * Uses theme colors from packages/app/src/emr/styles/theme.css
 */
const documentInputStyles = {
  input: {
    minHeight: '36px',
    fontSize: '14px',
    fontWeight: 400,
    color: 'var(--emr-primary)',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '1px solid var(--emr-gray-800)',
    borderRadius: '0',
    transition: 'var(--emr-transition-base)',
    padding: '8px 4px',
    '&:hover:not(:disabled):not(:focus)': {
      borderBottomColor: 'var(--emr-secondary)',
    },
    '&:focus': {
      borderBottomColor: 'var(--emr-secondary)',
      borderBottomWidth: '2px',
      outline: 'none',
    },
    '&:disabled': {
      backgroundColor: 'transparent',
      color: 'var(--emr-gray-500)',
      cursor: 'not-allowed',
    },
    '&::placeholder': {
      color: 'var(--emr-gray-400)',
    },
  },
  label: {
    fontSize: '14px',
    fontWeight: 400,
    color: 'var(--emr-primary)',
    marginBottom: '0',
  },
  description: {
    fontSize: '12px',
    color: 'var(--emr-gray-500)',
    marginTop: '4px',
    fontStyle: 'italic',
  },
  error: {
    fontSize: '12px',
    color: 'var(--mantine-color-red-7)',
    marginTop: '4px',
  },
  required: {
    color: 'var(--mantine-color-red-7)',
  },
};

/**
 * Textarea document style - subtle border box
 */
const documentTextareaStyles = {
  input: {
    fontSize: '14px',
    fontWeight: 400,
    color: 'var(--emr-primary)',
    backgroundColor: 'transparent',
    border: '1px solid var(--emr-gray-800)',
    borderRadius: 'var(--emr-border-radius-sm)',
    padding: '12px',
    '&:focus': {
      borderColor: 'var(--emr-secondary)',
      outline: 'none',
    },
  },
};

/**
 * Styling for auto-populated fields in document style
 */
const autoPopulatedStyles = {
  root: {
    position: 'relative' as const,
    paddingLeft: '12px',
    borderLeft: '3px solid var(--emr-secondary)',
  },
};

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
  const autoPopulatedStyle = isAutoPopulated ? autoPopulatedStyles.root : undefined;

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
            input: documentInputStyles.input,
            label: documentInputStyles.label,
            description: documentInputStyles.description,
            error: documentInputStyles.error,
            required: documentInputStyles.required,
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
            input: documentTextareaStyles.input,
            label: documentInputStyles.label,
            description: documentInputStyles.description,
            error: documentInputStyles.error,
            required: documentInputStyles.required,
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
            input: documentInputStyles.input,
            label: documentInputStyles.label,
            description: documentInputStyles.description,
            error: documentInputStyles.error,
            required: documentInputStyles.required,
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
            input: documentInputStyles.input,
            label: documentInputStyles.label,
            description: documentInputStyles.description,
            error: documentInputStyles.error,
            required: documentInputStyles.required,
            root: autoPopulatedStyle,
          }}
        />
      );

    case 'date':
      return (
        <Box style={autoPopulatedStyle}>
          <EMRDatePicker
            label={commonProps.label}
            required={commonProps.required}
            error={commonProps.error}
            value={value ? new Date(value) : null}
            onChange={(date) => onChange(date?.toISOString().split('T')[0])}
            placeholder="dd.mm.yyyy"
          />
          {isAutoPopulated && bindingConfig && (
            <Text size="xs" c="dimmed" mt={4}>
              Auto-populated from {bindingConfig.label}
            </Text>
          )}
        </Box>
      );

    case 'dateTime':
      return (
        <Box style={autoPopulatedStyle}>
          <EMRDatePicker
            label={commonProps.label}
            required={commonProps.required}
            error={commonProps.error}
            value={value ? new Date(value) : null}
            onChange={(date) => onChange(date?.toISOString())}
            placeholder="dd.mm.yyyy"
          />
          {isAutoPopulated && bindingConfig && (
            <Text size="xs" c="dimmed" mt={4}>
              Auto-populated from {bindingConfig.label}
            </Text>
          )}
        </Box>
      );

    case 'time':
      return (
        <TimeInput
          {...commonProps}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          size="md"
          styles={{
            input: documentInputStyles.input,
            label: documentInputStyles.label,
            description: documentInputStyles.description,
            error: documentInputStyles.error,
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
            label: {
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--emr-gray-700)',
            },
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
            input: documentInputStyles.input,
            label: documentInputStyles.label,
            description: documentInputStyles.description,
            error: documentInputStyles.error,
            root: autoPopulatedStyle,
            dropdown: {
              borderRadius: 'var(--emr-border-radius-sm)',
              boxShadow: 'var(--emr-shadow-md)',
              border: '1px solid var(--emr-gray-800)',
            },
            option: {
              borderRadius: 'var(--emr-border-radius-sm)',
              '&[data-selected]': {
                backgroundColor: 'var(--emr-secondary)',
              },
              '&[data-hovered]': {
                backgroundColor: 'var(--emr-gray-50)',
              },
            },
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
          leftSection={<IconUpload size={16} style={{ color: 'var(--emr-secondary)' }} />}
          placeholder={value?.title || 'Click to upload file'}
          accept="image/*,application/pdf,.doc,.docx"
          size="md"
          styles={{
            input: {
              ...documentInputStyles.input,
              border: '1px solid var(--emr-gray-800)',
              borderRadius: 'var(--emr-border-radius-sm)',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'var(--emr-secondary)',
              },
            },
            label: documentInputStyles.label,
            description: documentInputStyles.description,
            error: documentInputStyles.error,
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
        <Box
          py="sm"
          style={{
            borderBottom: '1px solid var(--emr-border-color)',
            marginBottom: '8px',
          }}
        >
          <Text
            size="sm"
            style={{
              color: 'var(--emr-primary)',
              lineHeight: 1.6,
              fontStyle: 'italic',
            }}
          >
            {item.text}
          </Text>
        </Box>
      );

    case 'group':
      return (
        <Box
          style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid var(--emr-border-color)',
          }}
        >
          <Stack gap="md">
            {item.text && (
              <Title
                order={5}
                style={{
                  color: 'var(--emr-primary)',
                  fontWeight: 600,
                  fontSize: '16px',
                  marginBottom: '8px',
                }}
              >
                {item.text}
              </Title>
            )}
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
        </Box>
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
              input: documentInputStyles.input,
              label: documentInputStyles.label,
              description: documentInputStyles.description,
              error: documentInputStyles.error,
              root: autoPopulatedStyle,
            }}
          />
          {value && isValidUrl(value) && (
            <Anchor
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              mt="xs"
              style={{
                color: 'var(--emr-secondary)',
                fontWeight: 500,
              }}
            >
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
        styles={{
          label: documentInputStyles.label,
          error: documentInputStyles.error,
        }}
      >
        <Stack gap="xs" mt="xs" style={autoPopulatedStyle}>
          {item.answerOption?.map((option) => (
            <Radio
              key={option.valueCoding?.code || option.valueString}
              value={option.valueCoding?.code || option.valueString || ''}
              label={option.valueCoding?.display || option.valueString}
              disabled={readOnly || item.readOnly}
              size="md"
              styles={{
                radio: {
                  borderColor: 'var(--emr-gray-800)',
                  '&:checked': {
                    backgroundColor: 'var(--emr-secondary)',
                    borderColor: 'var(--emr-secondary)',
                  },
                },
                label: {
                  fontSize: '14px',
                  color: 'var(--emr-primary)',
                  cursor: 'pointer',
                },
              }}
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
        input: documentInputStyles.input,
        label: documentInputStyles.label,
        description: documentInputStyles.description,
        error: documentInputStyles.error,
        root: autoPopulatedStyle,
        dropdown: {
          borderRadius: 'var(--emr-border-radius-sm)',
          boxShadow: 'var(--emr-shadow-md)',
          border: '1px solid var(--emr-gray-800)',
        },
        option: {
          borderRadius: 'var(--emr-border-radius-sm)',
          '&[data-selected]': {
            backgroundColor: 'var(--emr-secondary)',
          },
          '&[data-hovered]': {
            backgroundColor: 'var(--emr-gray-50)',
          },
        },
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
