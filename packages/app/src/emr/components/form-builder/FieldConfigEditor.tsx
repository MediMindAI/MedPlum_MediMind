// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect } from 'react';
import {
  Stack,
  TextInput,
  Checkbox,
  Textarea,
  Select,
  NumberInput,
  Group,
  Text,
  ColorInput,
  Slider,
  Box,
  Divider,
  Accordion,
  Button,
  ActionIcon,
  Paper,
  Switch,
  Badge,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconTrash, IconLink } from '@tabler/icons-react';
import type { FieldConfig, FieldStyling, ValidationConfig, ConditionalLogic, Condition, ConditionOperator } from '../../types/form-builder';

/**
 * Props for FieldConfigEditor component
 */
export interface FieldConfigEditorProps {
  field: FieldConfig;
  onChange: (field: FieldConfig) => void;
  /** All fields in the form (for conditional logic dropdowns) */
  allFields?: FieldConfig[];
}

/**
 * Operator options for conditional logic
 */
const OPERATOR_OPTIONS: { value: ConditionOperator; label: string }[] = [
  { value: 'exists', label: 'Has any value' },
  { value: '=', label: 'Equals' },
  { value: '!=', label: 'Not equals' },
  { value: '>', label: 'Greater than' },
  { value: '<', label: 'Less than' },
  { value: '>=', label: 'Greater than or equal' },
  { value: '<=', label: 'Less than or equal' },
];

/**
 * Touch-friendly input styles (44px minimum height)
 */
const touchFriendlyStyles = {
  input: {
    minHeight: '44px',
  },
};

/**
 * Component for editing field configuration properties
 *
 * Features:
 * - Edit label, help text, required flag
 * - Configure validation rules (required, format, range, length, pattern)
 * - Configure styling (font-size, color, alignment, width, height)
 * - Field type specific options (e.g., choices for select fields)
 * - Touch-friendly inputs (44px minimum height for tablet compatibility)
 */
export function FieldConfigEditor({ field, onChange, allFields = [] }: FieldConfigEditorProps): JSX.Element {
  // Create a deep copy of the field to avoid mutating frozen Immer state
  const fieldCopy = JSON.parse(JSON.stringify(field)) as FieldConfig;

  const form = useForm<FieldConfig>({
    initialValues: fieldCopy,
  });

  // Handle field updates - create a new object to avoid mutation
  const handleUpdate = (updates: Partial<FieldConfig>): void => {
    const updated = { ...JSON.parse(JSON.stringify(form.values)), ...updates };
    form.setValues(updated);
    onChange(updated);
  };

  // Reset form when field ID changes (switching between fields)
  useEffect(() => {
    // Create a fresh copy to avoid mutating frozen state
    const freshCopy = JSON.parse(JSON.stringify(field)) as FieldConfig;
    form.setValues(freshCopy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.id]);

  // Font size marks for slider (12-72px range)
  const fontSizeMarks = [
    { value: 12, label: '12' },
    { value: 24, label: '24' },
    { value: 36, label: '36' },
    { value: 48, label: '48' },
    { value: 60, label: '60' },
    { value: 72, label: '72' },
  ];

  // Grid width marks for slider (1-12 columns)
  const gridWidthMarks = [
    { value: 3, label: '3' },
    { value: 6, label: '6' },
    { value: 9, label: '9' },
    { value: 12, label: '12' },
  ];

  // Parse current font size to number (default 14)
  const currentFontSize = form.values.styling?.fontSize
    ? parseInt(form.values.styling.fontSize.replace('px', ''), 10)
    : 14;

  // Parse current grid width (default 12)
  const currentGridWidth = form.values.styling?.width
    ? parseInt(form.values.styling.width.replace('col-', ''), 10) || 12
    : 12;

  return (
    <Stack gap="md">
      {/* Basic Properties */}
      <TextInput
        label="Field Label"
        placeholder="Enter field label"
        required
        size="md"
        styles={touchFriendlyStyles}
        value={form.values.label || ''}
        onChange={(e) => handleUpdate({ label: e.currentTarget.value })}
      />

      <Textarea
        label="Help Text"
        placeholder="Enter help text (optional)"
        minRows={2}
        size="md"
        styles={touchFriendlyStyles}
        value={form.values.text || ''}
        onChange={(e) => handleUpdate({ text: e.currentTarget.value })}
      />

      <Checkbox
        label="Required Field"
        size="md"
        styles={{ input: { minWidth: '22px', minHeight: '22px' } }}
        checked={form.values.required || false}
        onChange={(e) => handleUpdate({ required: e.currentTarget.checked })}
      />

      <Checkbox
        label="Read Only"
        size="md"
        styles={{ input: { minWidth: '22px', minHeight: '22px' } }}
        checked={form.values.readOnly || false}
        onChange={(e) => handleUpdate({ readOnly: e.currentTarget.checked })}
      />

      <Checkbox
        label="Allow Multiple Values"
        size="md"
        styles={{ input: { minWidth: '22px', minHeight: '22px' } }}
        checked={form.values.repeats || false}
        onChange={(e) => handleUpdate({ repeats: e.currentTarget.checked })}
      />

      <Divider my="sm" />

      {/* Accordion for organized sections */}
      <Accordion defaultValue="validation" variant="separated">
        {/* Validation Configuration */}
        <Accordion.Item value="validation">
          <Accordion.Control>
            <Text size="sm" fw={600}>
              Validation Rules
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="md">
              <Checkbox
                label="Required"
                size="md"
                styles={{ input: { minWidth: '22px', minHeight: '22px' } }}
                checked={form.values.validation?.required ?? false}
                onChange={(event) => {
                  const validation: ValidationConfig = {
                    ...form.values.validation,
                    required: event.currentTarget.checked,
                  };
                  form.setFieldValue('validation', validation);
                }}
              />

              {/* Format validation for text fields */}
              {(form.values.type === 'text' || form.values.type === 'textarea') && (
                <Select
                  label="Format Validation"
                  placeholder="Select format"
                  size="md"
                  styles={touchFriendlyStyles}
                  data={[
                    { value: 'email', label: 'Email' },
                    { value: 'phone', label: 'Phone (E.164)' },
                    { value: 'url', label: 'URL' },
                    { value: 'georgian-id', label: 'Georgian Personal ID (11 digits)' },
                  ]}
                  value={form.values.validation?.customValidator ?? ''}
                  onChange={(value) => {
                    const validation: ValidationConfig = {
                      ...form.values.validation,
                      customValidator: value || undefined,
                    };
                    form.setFieldValue('validation', validation);
                  }}
                  clearable
                />
              )}

              {/* Format validation for date fields */}
              {(form.values.type === 'date' || form.values.type === 'datetime') && (
                <Select
                  label="Date Validation"
                  placeholder="Select validation"
                  size="md"
                  styles={touchFriendlyStyles}
                  data={[
                    { value: 'past', label: 'Must be in the past' },
                    { value: 'future', label: 'Must be in the future' },
                    { value: 'past-or-today', label: 'Today or before' },
                    { value: 'future-or-today', label: 'Today or after' },
                  ]}
                  value={form.values.validation?.customValidator ?? ''}
                  onChange={(value) => {
                    const validation: ValidationConfig = {
                      ...form.values.validation,
                      customValidator: value || undefined,
                    };
                    form.setFieldValue('validation', validation);
                  }}
                  clearable
                />
              )}

              {/* Length constraints for text fields */}
              {(form.values.type === 'text' || form.values.type === 'textarea') && (
                <Group grow>
                  <NumberInput
                    label="Min Length"
                    placeholder="Min"
                    min={0}
                    size="md"
                    styles={touchFriendlyStyles}
                    value={form.values.validation?.minLength}
                    onChange={(value) => {
                      const validation: ValidationConfig = {
                        ...form.values.validation,
                        minLength: typeof value === 'number' ? value : undefined,
                      };
                      form.setFieldValue('validation', validation);
                    }}
                  />
                  <NumberInput
                    label="Max Length"
                    placeholder="Max"
                    min={0}
                    size="md"
                    styles={touchFriendlyStyles}
                    value={form.values.validation?.maxLength}
                    onChange={(value) => {
                      const validation: ValidationConfig = {
                        ...form.values.validation,
                        maxLength: typeof value === 'number' ? value : undefined,
                      };
                      form.setFieldValue('validation', validation);
                    }}
                  />
                </Group>
              )}

              {/* Range constraints for number fields */}
              {(form.values.type === 'integer' || form.values.type === 'decimal') && (
                <Group grow>
                  <NumberInput
                    label="Min Value"
                    placeholder="Min"
                    size="md"
                    styles={touchFriendlyStyles}
                    value={form.values.validation?.min}
                    onChange={(value) => {
                      const validation: ValidationConfig = {
                        ...form.values.validation,
                        min: typeof value === 'number' ? value : undefined,
                      };
                      form.setFieldValue('validation', validation);
                    }}
                  />
                  <NumberInput
                    label="Max Value"
                    placeholder="Max"
                    size="md"
                    styles={touchFriendlyStyles}
                    value={form.values.validation?.max}
                    onChange={(value) => {
                      const validation: ValidationConfig = {
                        ...form.values.validation,
                        max: typeof value === 'number' ? value : undefined,
                      };
                      form.setFieldValue('validation', validation);
                    }}
                  />
                </Group>
              )}

              {/* Custom pattern validation */}
              <TextInput
                label="Custom Pattern (Regex)"
                placeholder="e.g., ^[A-Z]{2}\d{4}$"
                size="md"
                styles={touchFriendlyStyles}
                value={form.values.validation?.pattern ?? ''}
                onChange={(event) => {
                  const validation: ValidationConfig = {
                    ...form.values.validation,
                    pattern: event.currentTarget.value || undefined,
                  };
                  form.setFieldValue('validation', validation);
                }}
              />

              {form.values.validation?.pattern && (
                <TextInput
                  label="Pattern Error Message"
                  placeholder="Enter error message for pattern mismatch"
                  size="md"
                  styles={touchFriendlyStyles}
                  value={form.values.validation?.patternMessage ?? ''}
                  onChange={(event) => {
                    const validation: ValidationConfig = {
                      ...form.values.validation,
                      patternMessage: event.currentTarget.value || undefined,
                    };
                    form.setFieldValue('validation', validation);
                  }}
                />
              )}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Styling Configuration */}
        <Accordion.Item value="styling">
          <Accordion.Control>
            <Text size="sm" fw={600}>
              Field Styling
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="md">
              {/* Font Size Slider (12-72px) */}
              <Box>
                <Text size="sm" fw={500} mb="xs">
                  Font Size: {currentFontSize}px
                </Text>
                <Slider
                  value={currentFontSize}
                  min={12}
                  max={72}
                  step={2}
                  marks={fontSizeMarks}
                  label={(value) => `${value}px`}
                  styles={{
                    thumb: { minWidth: '20px', minHeight: '20px' },
                    track: { minHeight: '8px' },
                    markLabel: { fontSize: '10px' },
                  }}
                  onChange={(value) => {
                    const styling: FieldStyling = {
                      ...form.values.styling,
                      fontSize: `${value}px`,
                    };
                    form.setFieldValue('styling', styling);
                  }}
                />
              </Box>

              {/* Text Color */}
              <ColorInput
                label="Text Color"
                placeholder="Select color"
                size="md"
                styles={touchFriendlyStyles}
                value={form.values.styling?.color ?? ''}
                onChange={(value) => {
                  const styling: FieldStyling = {
                    ...form.values.styling,
                    color: value || undefined,
                  };
                  form.setFieldValue('styling', styling);
                }}
                format="hex"
                swatches={[
                  '#000000',
                  '#333333',
                  '#666666',
                  '#999999',
                  '#1a365d',
                  '#2b6cb0',
                  '#63b3ed',
                  '#17a2b8',
                  '#dc3545',
                  '#28a745',
                ]}
              />

              {/* Background Color */}
              <ColorInput
                label="Background Color"
                placeholder="Select background"
                size="md"
                styles={touchFriendlyStyles}
                value={form.values.styling?.backgroundColor ?? ''}
                onChange={(value) => {
                  const styling: FieldStyling = {
                    ...form.values.styling,
                    backgroundColor: value || undefined,
                  };
                  form.setFieldValue('styling', styling);
                }}
                format="hex"
                swatches={[
                  '#ffffff',
                  '#f9fafb',
                  '#f3f4f6',
                  '#e5e7eb',
                  '#bee3f8',
                  '#c6f6d5',
                  '#fed7d7',
                  '#fef3c7',
                ]}
              />

              {/* Text Alignment */}
              <Select
                label="Text Alignment"
                placeholder="Select alignment"
                size="md"
                styles={touchFriendlyStyles}
                data={[
                  { value: 'left', label: 'Left' },
                  { value: 'center', label: 'Center' },
                  { value: 'right', label: 'Right' },
                ]}
                value={form.values.styling?.textAlign}
                onChange={(value) => {
                  const styling: FieldStyling = {
                    ...form.values.styling,
                    textAlign: value as 'left' | 'center' | 'right' | undefined,
                  };
                  form.setFieldValue('styling', styling);
                }}
                clearable
              />

              {/* Font Weight */}
              <Select
                label="Font Weight"
                placeholder="Select weight"
                size="md"
                styles={touchFriendlyStyles}
                data={[
                  { value: '400', label: 'Normal (400)' },
                  { value: '500', label: 'Medium (500)' },
                  { value: '600', label: 'Semi Bold (600)' },
                  { value: '700', label: 'Bold (700)' },
                ]}
                value={form.values.styling?.fontWeight}
                onChange={(value) => {
                  const styling: FieldStyling = {
                    ...form.values.styling,
                    fontWeight: value || undefined,
                  };
                  form.setFieldValue('styling', styling);
                }}
                clearable
              />

              {/* Grid Width Slider (1-12 columns) */}
              <Box>
                <Text size="sm" fw={500} mb="xs">
                  Field Width: {currentGridWidth} columns
                </Text>
                <Slider
                  value={currentGridWidth}
                  min={1}
                  max={12}
                  step={1}
                  marks={gridWidthMarks}
                  label={(value) => `${value} col`}
                  styles={{
                    thumb: { minWidth: '20px', minHeight: '20px' },
                    track: { minHeight: '8px' },
                    markLabel: { fontSize: '10px' },
                  }}
                  onChange={(value) => {
                    const styling: FieldStyling = {
                      ...form.values.styling,
                      width: `col-${value}`,
                    };
                    form.setFieldValue('styling', styling);
                  }}
                />
                <Text size="xs" c="dimmed" mt="xs">
                  Based on 12-column grid system
                </Text>
              </Box>

              {/* Min Height */}
              <NumberInput
                label="Minimum Height (px)"
                placeholder="e.g., 100"
                min={0}
                max={500}
                size="md"
                styles={touchFriendlyStyles}
                value={
                  form.values.styling?.height
                    ? parseInt(form.values.styling.height.replace('px', ''), 10)
                    : undefined
                }
                onChange={(value) => {
                  const styling: FieldStyling = {
                    ...form.values.styling,
                    height: typeof value === 'number' ? `${value}px` : undefined,
                  };
                  form.setFieldValue('styling', styling);
                }}
              />

              {/* Padding */}
              <Select
                label="Padding"
                placeholder="Select padding"
                size="md"
                styles={touchFriendlyStyles}
                data={[
                  { value: '0px', label: 'None' },
                  { value: '4px', label: 'Extra Small (4px)' },
                  { value: '8px', label: 'Small (8px)' },
                  { value: '12px', label: 'Medium (12px)' },
                  { value: '16px', label: 'Large (16px)' },
                  { value: '24px', label: 'Extra Large (24px)' },
                ]}
                value={form.values.styling?.padding}
                onChange={(value) => {
                  const styling: FieldStyling = {
                    ...form.values.styling,
                    padding: value || undefined,
                  };
                  form.setFieldValue('styling', styling);
                }}
                clearable
              />

              {/* Margin */}
              <Select
                label="Margin"
                placeholder="Select margin"
                size="md"
                styles={touchFriendlyStyles}
                data={[
                  { value: '0px', label: 'None' },
                  { value: '4px', label: 'Extra Small (4px)' },
                  { value: '8px', label: 'Small (8px)' },
                  { value: '12px', label: 'Medium (12px)' },
                  { value: '16px', label: 'Large (16px)' },
                  { value: '24px', label: 'Extra Large (24px)' },
                ]}
                value={form.values.styling?.margin}
                onChange={(value) => {
                  const styling: FieldStyling = {
                    ...form.values.styling,
                    margin: value || undefined,
                  };
                  form.setFieldValue('styling', styling);
                }}
                clearable
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Conditional Display Logic */}
        <Accordion.Item value="conditional">
          <Accordion.Control>
            <Group gap="xs">
              <IconLink size={16} />
              <Text size="sm" fw={600}>
                Conditional Display
              </Text>
              {form.values.conditional?.enabled && form.values.conditional.conditions.length > 0 && (
                <Badge size="sm" variant="light" color="teal">
                  {form.values.conditional.conditions.length} rule(s)
                </Badge>
              )}
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="md">
              {/* Enable conditional logic */}
              <Switch
                label="Enable conditional display"
                description="Show this field only when conditions are met"
                checked={form.values.conditional?.enabled ?? false}
                onChange={(event) => {
                  const conditional: ConditionalLogic = {
                    enabled: event.currentTarget.checked,
                    conditions: form.values.conditional?.conditions || [],
                    operator: form.values.conditional?.operator || 'all',
                  };
                  form.setFieldValue('conditional', conditional);
                }}
                size="md"
              />

              {form.values.conditional?.enabled && (
                <>
                  {/* Behavior toggle (AND/OR) */}
                  <Select
                    label="Match behavior"
                    description="How multiple conditions should be evaluated"
                    size="md"
                    styles={touchFriendlyStyles}
                    data={[
                      { value: 'all', label: 'All conditions must match (AND)' },
                      { value: 'any', label: 'Any condition must match (OR)' },
                    ]}
                    value={form.values.conditional?.operator || 'all'}
                    onChange={(value) => {
                      const conditional: ConditionalLogic = {
                        ...form.values.conditional!,
                        operator: (value as 'all' | 'any') || 'all',
                      };
                      form.setFieldValue('conditional', conditional);
                    }}
                  />

                  {/* Condition list */}
                  <Box>
                    <Text size="sm" fw={500} mb="xs">
                      Conditions ({form.values.conditional?.conditions.length || 0})
                    </Text>

                    {form.values.conditional?.conditions.map((condition, index) => (
                      <Paper key={index} p="sm" mb="sm" withBorder>
                        <Stack gap="xs">
                          <Group justify="space-between">
                            <Text size="xs" c="dimmed">
                              Condition {index + 1}
                            </Text>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              size="sm"
                              onClick={() => {
                                const conditions = [...(form.values.conditional?.conditions || [])];
                                conditions.splice(index, 1);
                                const conditional: ConditionalLogic = {
                                  ...form.values.conditional!,
                                  conditions,
                                };
                                form.setFieldValue('conditional', conditional);
                              }}
                              aria-label="Remove condition"
                            >
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Group>

                          {/* Question field selector */}
                          <Select
                            label="When field"
                            placeholder="Select a field"
                            size="sm"
                            data={allFields
                              .filter((f) => f.linkId !== field.linkId) // Exclude self
                              .map((f) => ({
                                value: f.linkId,
                                label: f.label || f.linkId,
                              }))}
                            value={condition.questionId}
                            onChange={(value) => {
                              const conditions = [...(form.values.conditional?.conditions || [])];
                              conditions[index] = { ...conditions[index], questionId: value || '' };
                              const conditional: ConditionalLogic = {
                                ...form.values.conditional!,
                                conditions,
                              };
                              form.setFieldValue('conditional', conditional);
                            }}
                            searchable
                          />

                          {/* Operator selector */}
                          <Select
                            label="Operator"
                            placeholder="Select operator"
                            size="sm"
                            data={OPERATOR_OPTIONS}
                            value={condition.operator}
                            onChange={(value) => {
                              const conditions = [...(form.values.conditional?.conditions || [])];
                              conditions[index] = {
                                ...conditions[index],
                                operator: (value as ConditionOperator) || '=',
                              };
                              const conditional: ConditionalLogic = {
                                ...form.values.conditional!,
                                conditions,
                              };
                              form.setFieldValue('conditional', conditional);
                            }}
                          />

                          {/* Value input (hidden for 'exists' operator) */}
                          {condition.operator !== 'exists' && (
                            <TextInput
                              label="Value"
                              placeholder="Enter comparison value"
                              size="sm"
                              value={
                                typeof condition.answer === 'boolean'
                                  ? condition.answer
                                    ? 'true'
                                    : 'false'
                                  : String(condition.answer ?? '')
                              }
                              onChange={(event) => {
                                const conditions = [...(form.values.conditional?.conditions || [])];
                                const rawValue = event.currentTarget.value;
                                // Try to parse as boolean or number
                                let parsedValue: string | number | boolean = rawValue;
                                if (rawValue === 'true') {parsedValue = true;}
                                else if (rawValue === 'false') {parsedValue = false;}
                                else if (!isNaN(Number(rawValue)) && rawValue !== '') {
                                  parsedValue = Number(rawValue);
                                }
                                conditions[index] = { ...conditions[index], answer: parsedValue };
                                const conditional: ConditionalLogic = {
                                  ...form.values.conditional!,
                                  conditions,
                                };
                                form.setFieldValue('conditional', conditional);
                              }}
                            />
                          )}
                        </Stack>
                      </Paper>
                    ))}

                    {/* Add condition button */}
                    <Button
                      variant="light"
                      leftSection={<IconPlus size={16} />}
                      size="sm"
                      fullWidth
                      onClick={() => {
                        const newCondition: Condition = {
                          questionId: '',
                          operator: '=',
                          answer: '',
                        };
                        const conditions = [...(form.values.conditional?.conditions || []), newCondition];
                        const conditional: ConditionalLogic = {
                          ...form.values.conditional!,
                          conditions,
                        };
                        form.setFieldValue('conditional', conditional);
                      }}
                    >
                      Add Condition
                    </Button>
                  </Box>

                  {/* Info text */}
                  <Text size="xs" c="dimmed">
                    This field will only be displayed when the specified conditions are met.
                    Hidden fields will have their values cleared automatically.
                  </Text>
                </>
              )}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Stack>
  );
}
