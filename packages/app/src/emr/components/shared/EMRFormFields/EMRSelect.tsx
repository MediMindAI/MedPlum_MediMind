/**
 * EMRSelect - Standardized select/dropdown component
 * Consistent styling across all dropdowns in the EMR system
 */

import React, { useId, forwardRef, useCallback, useMemo } from 'react';
import { Select, ComboboxData } from '@mantine/core';
import { EMRSelectProps, EMRSelectOption } from './EMRFieldTypes';
import { EMRFieldWrapper } from './EMRFieldWrapper';
import './emr-fields.css';

// Simple option type
type SimpleOption = { value: string; label: string; disabled?: boolean };
type GroupedOption = { group: string; items: SimpleOption[] };

/**
 * Convert EMRSelectOption[] or string[] to Mantine ComboboxData format
 */
function normalizeOptions(data: EMRSelectOption[] | string[]): ComboboxData {
  if (data.length === 0) return [];

  // Check if it's string array
  if (typeof data[0] === 'string') {
    return (data as string[]).map((item) => ({ value: item, label: item }));
  }

  // It's EMRSelectOption[]
  const options = data as EMRSelectOption[];

  // Group options if they have group property
  const hasGroups = options.some((opt) => opt.group);

  if (hasGroups) {
    const groups: Record<string, SimpleOption[]> = {};
    const ungrouped: SimpleOption[] = [];

    options.forEach((opt) => {
      const item: SimpleOption = { value: opt.value, label: opt.label, disabled: opt.disabled };
      if (opt.group) {
        if (!groups[opt.group]) {
          groups[opt.group] = [];
        }
        groups[opt.group].push(item);
      } else {
        ungrouped.push(item);
      }
    });

    const result: (SimpleOption | GroupedOption)[] = [...ungrouped];

    // Add grouped items
    Object.entries(groups).forEach(([group, items]) => {
      result.push({ group, items });
    });

    return result;
  }

  // No groups, just return options
  return options.map((opt) => ({
    value: opt.value,
    label: opt.label,
    disabled: opt.disabled,
  }));
}

/**
 * EMRSelect component
 * A production-ready dropdown select with consistent styling
 */
export const EMRSelect = forwardRef<HTMLInputElement, EMRSelectProps>(
  (
    {
      // Field wrapper props
      id,
      name,
      label,
      placeholder,
      helpText,
      error,
      successMessage,
      warningMessage,
      size = 'md',
      required,
      disabled,
      readOnly,
      validationState,
      leftSection,
      rightSection,
      className = '',
      style,
      'data-testid': dataTestId,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      clearable = true,
      fullWidth = true,

      // Select specific props
      data,
      value,
      defaultValue,
      onChange,
      onBlur,
      searchable = false,
      nothingFoundMessage = 'No options found',
      maxDropdownHeight = 250,
      allowDeselect = true,
      checkIconPosition = 'right',
      dropdownPosition = 'flip',
      filter,
    },
    ref
  ): React.JSX.Element => {
    const generatedId = useId();
    const inputId = id || generatedId;

    // Normalize options to Mantine format
    const normalizedData = useMemo(() => normalizeOptions(data), [data]);

    // Handle change event
    const handleChange = useCallback(
      (newValue: string | null) => {
        if (onChange) {
          onChange(newValue);
        }
      },
      [onChange]
    );

    // Determine validation state
    const getValidationState = () => {
      if (validationState) return validationState;
      if (error) return 'error';
      if (successMessage) return 'success';
      if (warningMessage) return 'warning';
      return 'default';
    };

    const state = getValidationState();

    // Calculate heights based on size
    const heights = {
      sm: 36,
      md: 42,
      lg: 48,
    };

    // Build input classes
    const inputClasses = [
      'emr-input',
      'emr-select-input',
      `size-${size}`,
      state === 'error' && 'has-error',
      state === 'success' && 'has-success',
      state === 'warning' && 'has-warning',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <EMRFieldWrapper
        label={label}
        required={required}
        helpText={helpText}
        error={error}
        successMessage={successMessage}
        warningMessage={warningMessage}
        validationState={validationState}
        size={size}
        fullWidth={fullWidth}
        className={className}
        style={style}
        htmlFor={inputId}
      >
        <Select
          ref={ref}
          id={inputId}
          name={name}
          data={normalizedData}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          searchable={searchable}
          nothingFoundMessage={nothingFoundMessage}
          maxDropdownHeight={maxDropdownHeight}
          clearable={clearable}
          allowDeselect={allowDeselect}
          checkIconPosition={checkIconPosition}
          required={required}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-invalid={state === 'error'}
          data-testid={dataTestId}
          leftSection={leftSection}
          rightSection={rightSection}
          error={!!error}
          comboboxProps={{
            offset: 4,
            shadow: 'md',
          }}
          classNames={{
            input: inputClasses,
          }}
          styles={{
            input: {
              minHeight: heights[size],
              fontSize: 'var(--emr-input-font-size)',
              borderColor: state === 'error'
                ? 'var(--emr-input-error-border)'
                : state === 'success'
                ? 'var(--emr-input-success-border)'
                : state === 'warning'
                ? 'var(--emr-input-warning-border)'
                : 'var(--emr-input-border)',
              borderRadius: 'var(--emr-input-border-radius)',
              backgroundColor: state === 'error'
                ? 'var(--emr-input-error-bg)'
                : state === 'success'
                ? 'var(--emr-input-success-bg)'
                : state === 'warning'
                ? 'var(--emr-input-warning-bg)'
                : 'var(--emr-input-bg)',
              transition: 'var(--emr-input-transition)',
              cursor: readOnly ? 'default' : 'pointer',
              '&:focus': {
                borderColor: state === 'error'
                  ? 'var(--emr-input-error-border)'
                  : 'var(--emr-input-border-focus)',
                boxShadow: state === 'error'
                  ? 'var(--emr-input-error-glow)'
                  : state === 'success'
                  ? 'var(--emr-input-success-glow)'
                  : state === 'warning'
                  ? 'var(--emr-input-warning-glow)'
                  : 'var(--emr-input-focus-ring)',
              },
              '&:hover:not(:disabled):not(:focus)': {
                borderColor: state === 'error'
                  ? 'var(--emr-input-error-border)'
                  : 'var(--emr-input-border-hover)',
              },
              '&:disabled': {
                backgroundColor: 'var(--emr-input-bg-disabled)',
                color: 'var(--emr-input-text-disabled)',
                cursor: 'not-allowed',
              },
            },
            wrapper: {
              width: fullWidth ? '100%' : undefined,
            },
            dropdown: {
              borderRadius: 'var(--emr-input-border-radius)',
              border: '1px solid var(--emr-input-border)',
              boxShadow: 'var(--emr-shadow-md)',
            },
            option: {
              fontSize: 'var(--emr-input-font-size)',
              padding: '10px 12px',
              borderRadius: 'var(--emr-border-radius-sm)',
              '&[data-selected]': {
                backgroundColor: 'var(--emr-selected-bg)',
                color: 'var(--emr-input-text)',
              },
              '&[data-hovered]': {
                backgroundColor: 'var(--emr-hover-bg)',
              },
            },
          }}
        />
      </EMRFieldWrapper>
    );
  }
);

EMRSelect.displayName = 'EMRSelect';

export default EMRSelect;
