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
  Group,
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
 * Textarea document style - white background, resizable
 * Matches original EMR with resizable textarea
 * Note: minHeight is not supported by TextareaAutosize - use minRows prop instead
 */
const documentTextareaStyles = {
  input: {
    fontSize: '14px',
    fontWeight: 400,
    color: 'var(--emr-primary)',
    backgroundColor: '#ffffff',
    border: '1px solid var(--emr-gray-800)',
    borderRadius: 'var(--emr-border-radius-sm)',
    padding: '12px',
    resize: 'vertical' as const,  // Allow user to drag and resize vertically
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
  | 'checkbox-group'  // Multiple inline checkboxes with optional text field
  | 'inline-row'      // Multiple fields on one line (label + input + label + input)
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
  // Note: Use item.text directly - empty labels should not fall back to linkId
  const commonProps = {
    label: item.text || '',
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
  let fieldType = mapFhirType(item.type);

  // Detect checkbox-group: FHIR stores it as 'choice' with repeats=true
  if (item.type === 'choice' && item.repeats === true) {
    fieldType = 'checkbox-group';
  }

  // Detect inline-row: FHIR stores it as 'display' with inline-fields extension
  if (item.type === 'display' && item.extension?.some(
    (ext) => ext.url === 'http://medimind.ge/inline-fields'
  )) {
    fieldType = 'inline-row';
  }

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
          maxRows={10}
          autosize={false}
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
          size="sm"
          styles={{
            root: {
              ...autoPopulatedStyle,
              display: 'inline-flex',
              marginRight: '16px',
            },
            body: {
              alignItems: 'center',
            },
            label: {
              fontSize: '13px',
              fontWeight: 400,
              color: 'var(--emr-primary)',
              paddingLeft: '6px',
              cursor: 'pointer',
            },
            input: {
              cursor: 'pointer',
              borderColor: 'var(--emr-gray-800)',
              '&:checked': {
                backgroundColor: 'var(--emr-secondary)',
                borderColor: 'var(--emr-secondary)',
              },
            },
          }}
        />
      );

    case 'choice':
      return renderChoiceField(item, value, onChange, commonProps, autoPopulatedStyle, readOnly);

    case 'checkbox-group':
      return renderCheckboxGroup(item, value, onChange, commonProps, autoPopulatedStyle, readOnly);

    case 'inline-row':
      return renderInlineRow(item, value, onChange, readOnly);

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
      // Check if this is an inline label (short text, no section styling)
      // Inline labels: "სმ,", "კგ,", "ჯერ", etc. - render as inline text
      // Section headers: "ობიექტური მონაცემები", "ორგანოთა სისტემები" - render as headers
      const isInlineLabel = item.extension?.some(
        (ext) => ext.url === 'http://medimind.ge/fhir/extensions/field-styling' &&
          ext.valueString?.includes('"display":"inline"')
      ) || (item.text && item.text.length < 25 && !item.text.includes('მონაცემები') && !item.text.includes('სისტემები'));

      if (isInlineLabel) {
        return (
          <Text
            component="span"
            size="sm"
            fw={400}
            style={{
              color: 'var(--emr-primary)',
              whiteSpace: 'nowrap',
              paddingBottom: '6px',
              display: 'inline-flex',
              alignItems: 'flex-end',
            }}
          >
            {item.text}
          </Text>
        );
      }

      // Section header style
      return (
        <Text
          component="h3"
          fw={600}
          size="md"
          style={{
            color: 'var(--emr-secondary)',
            marginBottom: '4px',
            textTransform: 'none',
            letterSpacing: '0.02em',
          }}
        >
          {item.text}
        </Text>
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
 * Render choice field as dropdown (matching original EMR style)
 * Original EMR uses small inline dropdowns for all choice fields
 * If field has hasTextField extension, render dropdown + text field inline
 */
function renderChoiceField(
  item: QuestionnaireItem,
  value: any,
  onChange: (value: any) => void,
  commonProps: any,
  autoPopulatedStyle: any,
  readOnly?: boolean
): JSX.Element {
  // Check if this field has a text field after the dropdown
  const hasTextField = item.extension?.some(
    (ext) => ext.url === 'http://medimind.ge/has-text-field' && ext.valueBoolean === true
  );

  // For fields with hasTextField, value is { selected: string, text: string }
  // Otherwise, value is just the selected string
  const selectedValue = hasTextField ? (value?.selected || '') : (value || '');
  const textValue = hasTextField ? (value?.text || '') : '';

  const handleSelectChange = (newSelected: string | null) => {
    if (hasTextField) {
      onChange({ selected: newSelected || '', text: textValue });
    } else {
      onChange(newSelected || '');
    }
  };

  const handleTextChange = (newText: string) => {
    onChange({ selected: selectedValue, text: newText });
  };

  // Always use dropdown for choice fields (matching original EMR)
  return (
    <Box style={autoPopulatedStyle}>
      <Group gap="sm" wrap="nowrap" align="flex-end">
        {/* Label */}
        <Text
          component="span"
          size="sm"
          fw={400}
          style={{
            color: 'var(--emr-primary)',
            minWidth: 'fit-content',
            paddingBottom: '6px',
          }}
        >
          {item.text}
          {item.required && <span style={{ color: 'var(--mantine-color-red-7)' }}> *</span>}
        </Text>

        {/* Dropdown */}
        <Select
          value={selectedValue}
          onChange={handleSelectChange}
          data={getOptionData(item)}
          size="xs"
          placeholder=""
          clearable
          disabled={readOnly || item.readOnly}
          error={commonProps.error && !hasTextField ? commonProps.error : undefined}
          style={{ minWidth: '120px', maxWidth: '180px' }}
          styles={{
            input: {
              fontSize: '13px',
              minHeight: '28px',
              borderColor: 'var(--emr-gray-800)',
              '&:focus': {
                borderColor: 'var(--emr-secondary)',
              },
            },
            dropdown: {
              borderRadius: 'var(--emr-border-radius-sm)',
              boxShadow: 'var(--emr-shadow-md)',
              border: '1px solid var(--emr-gray-800)',
            },
            option: {
              fontSize: '13px',
              '&[data-selected]': {
                backgroundColor: 'var(--emr-secondary)',
              },
              '&[data-hovered]': {
                backgroundColor: 'var(--emr-gray-50)',
              },
            },
          }}
        />

        {/* Optional text field after dropdown */}
        {hasTextField && (
          <TextInput
            value={textValue}
            onChange={(e) => handleTextChange(e.target.value)}
            disabled={readOnly || item.readOnly}
            size="xs"
            placeholder=""
            error={commonProps.error}
            style={{ flex: 1, minWidth: '200px' }}
            styles={{
              input: {
                fontSize: '13px',
                minHeight: '28px',
                borderBottom: '1px solid var(--emr-gray-800)',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderRadius: 0,
                backgroundColor: 'transparent',
                padding: '4px 0',
                '&:focus': {
                  borderBottomColor: 'var(--emr-secondary)',
                },
              },
            }}
          />
        )}
      </Group>
    </Box>
  );
}

/**
 * Render inline-row field - multiple fields on one line
 * Layout: label input label input label input...
 * Used for vital signs, cardiovascular, etc.
 */
function renderInlineRow(
  item: QuestionnaireItem,
  value: any,
  onChange: (value: any) => void,
  readOnly?: boolean
): JSX.Element {
  // Parse inline fields from extension
  const inlineFieldsExt = item.extension?.find(
    (ext) => ext.url === 'http://medimind.ge/inline-fields'
  );

  let inlineFields: Array<{ type: string; text?: string; linkId?: string; width?: string }> = [];
  if (inlineFieldsExt?.valueString) {
    try {
      inlineFields = JSON.parse(inlineFieldsExt.valueString);
    } catch {
      inlineFields = [];
    }
  }

  // Value is an object mapping linkId to value
  const values = value || {};

  const handleInputChange = (linkId: string, newValue: string) => {
    onChange({ ...values, [linkId]: newValue });
  };

  return (
    <Group gap="xs" wrap="nowrap" align="flex-end" style={{ width: '100%' }}>
      {inlineFields.map((field, idx) => {
        if (field.type === 'label') {
          return (
            <Text
              key={idx}
              component="span"
              size="sm"
              fw={400}
              style={{
                color: 'var(--emr-primary)',
                whiteSpace: 'nowrap',
                paddingBottom: '6px',
              }}
            >
              {field.text}
            </Text>
          );
        } else if (field.type === 'input' && field.linkId) {
          return (
            <TextInput
              key={idx}
              value={values[field.linkId] || ''}
              onChange={(e) => handleInputChange(field.linkId!, e.target.value)}
              disabled={readOnly}
              size="xs"
              style={{ width: field.width || '80px', flexShrink: 0 }}
              styles={{
                input: {
                  fontSize: '13px',
                  minHeight: '28px',
                  borderBottom: '1px solid var(--emr-gray-800)',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderRadius: 0,
                  backgroundColor: 'transparent',
                  padding: '4px 0',
                  textAlign: 'center',
                  '&:focus': {
                    borderBottomColor: 'var(--emr-secondary)',
                  },
                },
              }}
            />
          );
        }
        return null;
      })}
    </Group>
  );
}

/**
 * Render checkbox-group field as inline checkboxes with optional text field
 * Layout: label: □option1 □option2 □option3 [text field if hasTextField]
 * Matches original EMR compact inline style
 */
function renderCheckboxGroup(
  item: QuestionnaireItem,
  value: any,
  onChange: (value: any) => void,
  commonProps: any,
  autoPopulatedStyle: any,
  readOnly?: boolean
): JSX.Element {
  // Value is an object with checked states and optional text: { checked: string[], text?: string }
  const checkedValues: string[] = value?.checked || [];
  const textValue: string = value?.text || '';

  // Check if this field has a text field at the end
  // Look for extension indicating hasTextField
  const hasTextField = item.extension?.some(
    (ext) => ext.url === 'http://medimind.ge/has-text-field' && ext.valueBoolean === true
  );

  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    const newChecked = checked
      ? [...checkedValues, optionValue]
      : checkedValues.filter((v) => v !== optionValue);
    onChange({ checked: newChecked, text: textValue });
  };

  const handleTextChange = (newText: string) => {
    onChange({ checked: checkedValues, text: newText });
  };

  return (
    <Box style={{ ...autoPopulatedStyle, width: '100%' }}>
      <Group gap="sm" wrap="wrap" align="center" style={{ lineHeight: 1.6 }}>
        {/* Label */}
        <Text
          component="span"
          size="sm"
          fw={400}
          style={{ color: 'var(--emr-primary)', minWidth: 'fit-content' }}
        >
          {item.text}
        </Text>

        {/* Inline checkboxes - square style matching original EMR */}
        {item.answerOption?.map((option) => {
          const optionValue = option.valueCoding?.code || option.valueString || '';
          const isChecked = checkedValues.includes(optionValue);
          return (
            <Box
              key={optionValue}
              onClick={() => {
                if (!readOnly && !item.readOnly) {
                  handleCheckboxChange(optionValue, !isChecked);
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                marginRight: '10px',
                cursor: readOnly || item.readOnly ? 'default' : 'pointer',
                userSelect: 'none',
              }}
            >
              <Box
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '2px',
                  border: `1px solid ${isChecked ? 'var(--emr-secondary)' : '#888'}`,
                  backgroundColor: isChecked ? 'var(--emr-secondary)' : '#fff',
                  marginRight: '3px',
                  transition: 'all 0.12s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isChecked && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4 7L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </Box>
              <Text size="sm" style={{ color: 'var(--emr-primary)', fontSize: '13px' }}>
                {option.valueCoding?.display || option.valueString}
              </Text>
            </Box>
          );
        })}

        {/* Optional text field at the end */}
        {hasTextField && (
          <TextInput
            value={textValue}
            onChange={(e) => handleTextChange(e.target.value)}
            disabled={readOnly || item.readOnly}
            size="xs"
            placeholder=""
            style={{ minWidth: '150px', flex: 1 }}
            styles={{
              input: {
                fontSize: '13px',
                borderBottom: '1px solid var(--emr-gray-800)',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderRadius: 0,
                backgroundColor: 'transparent',
                padding: '4px 0',
                '&:focus': {
                  borderBottomColor: 'var(--emr-secondary)',
                },
              },
            }}
          />
        )}
      </Group>
      {commonProps.error && (
        <Text size="xs" c="red" mt={4}>{commonProps.error}</Text>
      )}
    </Box>
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
    'checkbox-group': 'checkbox-group',
    'inline-row': 'inline-row',
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
